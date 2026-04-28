#!/usr/bin/env python3
"""
Spec viewer renderer. Walks .claude/specs/ and writes static HTML to .claude/specs/_viewer/.
Server-side rendering only — no client-side JS for markdown parsing. Opens via file://.

Usage: python3 render.py <repo-root>
"""

import json
import re
import shutil
import sys
from datetime import date, datetime, timedelta
from pathlib import Path
from html import escape

import markdown
import yaml


STALE_DAYS = 14
MD_EXTENSIONS = ["tables", "fenced_code", "attr_list", "toc", "sane_lists"]


def parse_spec(path: Path):
    """Return (frontmatter_dict, body_markdown) for a spec file with --- frontmatter ---."""
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        return {}, text
    parts = text.split("---\n", 2)
    if len(parts) < 3:
        return {}, text
    fm = yaml.safe_load(parts[1]) or {}
    body = parts[2].lstrip("\n")
    return fm, body


def figma_open_url(file_key: str, node_id: str) -> str:
    return f"https://www.figma.com/design/{file_key}?node-id={node_id.replace(':', '-')}"


def is_stale(last_synced_at, today: date) -> bool:
    if last_synced_at is None:
        return False
    if isinstance(last_synced_at, date):
        d = last_synced_at
    else:
        try:
            d = datetime.strptime(str(last_synced_at), "%Y-%m-%d").date()
        except ValueError:
            return False
    return (today - d) > timedelta(days=STALE_DAYS)


def relpath(target: str, depth: int) -> str:
    """Return target relative to a page at the given depth (0=_viewer/, 1=_viewer/pages/, 2=_viewer/pages/sub/)."""
    return "../" * depth + target


def collect_specs(specs_dir: Path):
    """Return dict with project, theme, pages, sections, figma_index."""
    out = {
        "project": None,
        "theme": None,
        "pages": {},
        "sections": {},
        "figma_index": {},
    }
    proj = specs_dir / "project.md"
    if proj.exists():
        fm, body = parse_spec(proj)
        out["project"] = {"frontmatter": fm, "body": body, "source": str(proj.relative_to(specs_dir.parent.parent))}
    th = specs_dir / "theme.md"
    if th.exists():
        fm, body = parse_spec(th)
        out["theme"] = {"frontmatter": fm, "body": body, "source": str(th.relative_to(specs_dir.parent.parent))}
    for f in sorted((specs_dir / "pages").glob("*.md")):
        slug = f.stem
        fm, body = parse_spec(f)
        out["pages"][slug] = {"frontmatter": fm, "body": body, "source": str(f.relative_to(specs_dir.parent.parent))}
    for f in sorted((specs_dir / "sections").glob("*.md")):
        slug = f.stem
        fm, body = parse_spec(f)
        out["sections"][slug] = {"frontmatter": fm, "body": body, "source": str(f.relative_to(specs_dir.parent.parent))}
    fi = specs_dir / "_figma-index.json"
    if fi.exists():
        out["figma_index"] = json.loads(fi.read_text())
    return out


def derive_where_used(specs):
    """For each section slug, list page slugs where it appears in sections[]."""
    where = {}
    for page_slug, page in specs["pages"].items():
        for sec_slug in page["frontmatter"].get("sections", []) or []:
            where.setdefault(sec_slug, []).append(page_slug)
    # Dedupe in order
    return {k: list(dict.fromkeys(v)) for k, v in where.items()}


def render_tree(specs, depth: int) -> str:
    """Render the navigation tree HTML."""
    parts = ['<nav class="tree" aria-label="Specs navigation">']
    parts.append(f'<a class="tree-link" href="{relpath("index.html", depth)}">Overview</a>')
    if specs["project"]:
        name = escape(specs["project"]["frontmatter"].get("store", {}).get("name") or "Project")
        parts.append(f'<a class="tree-link tree-singleton" href="{relpath("project.html", depth)}">Project — {name}</a>')
    if specs["theme"]:
        bt = specs["theme"]["frontmatter"].get("base_theme", {})
        label = f"{bt.get('name', 'Theme')} {bt.get('version', '')}".strip()
        parts.append(f'<a class="tree-link tree-singleton" href="{relpath("theme.html", depth)}">Theme — {escape(label)}</a>')
    if specs["pages"]:
        parts.append('<details open><summary class="tree-group">Pages</summary><ul class="tree-list">')
        for slug in sorted(specs["pages"].keys()):
            parts.append(f'<li><a class="tree-link" href="{relpath(f"pages/{slug}.html", depth)}">{escape(slug)}</a></li>')
        parts.append('</ul></details>')
    if specs["sections"]:
        parts.append('<details open><summary class="tree-group">Sections</summary><ul class="tree-list">')
        for slug in sorted(specs["sections"].keys()):
            parts.append(f'<li><a class="tree-link" href="{relpath(f"sections/{slug}.html", depth)}">{escape(slug)}</a></li>')
        parts.append('</ul></details>')
    parts.append('</nav>')
    return "\n".join(parts)


def render_figma_panel(figma_refs, figma_index, today, depth: int) -> str:
    """Render the right-side Figma panel for a single spec's figma[] array."""
    if not figma_refs:
        return '<aside class="figma" aria-label="Figma references"><h2>Figma</h2><p class="muted">No Figma references on this spec.</p></aside>'
    parts = ['<aside class="figma" aria-label="Figma references"><h2>Figma</h2>']
    for ref in figma_refs:
        file_key = ref.get("file_key", "")
        node_id = ref.get("node_id", "")
        idx_key = f"{file_key}:{node_id}"
        idx_entry = figma_index.get(idx_key, {})
        label = ref.get("label") or idx_entry.get("label") or node_id
        viewport = ref.get("viewport") or idx_entry.get("viewport")
        kind = idx_entry.get("kind")
        last_synced = ref.get("last_synced_at") or idx_entry.get("last_synced_at")
        stale = is_stale(last_synced, today)
        thumb = ref.get("thumbnail") or idx_entry.get("thumbnail")
        url = figma_open_url(file_key, node_id) if file_key and node_id else None
        dev_ready_source = idx_entry.get("dev_ready_source")

        parts.append('<article class="figma-card">')
        parts.append(f'<header><h3>{escape(label)}</h3>')
        badges = []
        if viewport:
            badges.append(f'<span class="badge badge-viewport">{escape(viewport)}</span>')
        if kind:
            badges.append(f'<span class="badge badge-kind">{escape(kind)}</span>')
        if stale:
            badges.append('<span class="badge badge-stale">stale &gt;14d</span>')
        if dev_ready_source == "fallback-non-archive":
            badges.append('<span class="badge badge-warn" title="Dev-ready determined by archive-fallback rule, not native Figma Dev Mode flag">fallback</span>')
        if badges:
            parts.append('<div class="badges">' + " ".join(badges) + '</div>')
        parts.append('</header>')

        if thumb:
            thumb_path = relpath(f"../_assets/figma/{Path(thumb).name}", depth + 1)
            parts.append(f'<img class="thumb" src="{escape(thumb_path)}" alt="Figma thumbnail for {escape(label)}" loading="lazy" />')
        else:
            parts.append('<div class="thumb-placeholder">Thumbnail not cached</div>')

        parts.append('<dl class="meta">')
        parts.append(f'<dt>Node</dt><dd><code>{escape(idx_key)}</code></dd>')
        if last_synced:
            parts.append(f'<dt>Last synced</dt><dd>{escape(str(last_synced))}</dd>')
        notes = idx_entry.get("notes")
        if notes:
            parts.append(f'<dt>Notes</dt><dd>{escape(notes)}</dd>')
        parts.append('</dl>')

        if url:
            parts.append(f'<p><a class="open-figma" href="{escape(url)}" target="_blank" rel="noopener">Open in Figma →</a></p>')
        parts.append('</article>')
    parts.append('</aside>')
    return "\n".join(parts)


def render_where_used_block(section_slug, where_used, depth) -> str:
    pages = where_used.get(section_slug, [])
    if not pages:
        return '<aside class="where-used"><h3>Where used</h3><p class="muted">Not yet referenced in any page spec.</p></aside>'
    items = "\n".join(
        f'<li><a href="{relpath(f"pages/{p}.html", depth)}"><code>pages/{escape(p)}</code></a></li>'
        for p in pages
    )
    return f'<aside class="where-used"><h3>Where used (derived)</h3><ul>{items}</ul></aside>'


def page_layout(title: str, kind_badge: str, tree_html: str, body_html: str, figma_html: str, depth: int, where_used_html: str = "") -> str:
    css_path = relpath("styles.css", depth)
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>{escape(title)} — Specs</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="stylesheet" href="{css_path}" />
</head>
<body class="app">
{tree_html}
<main class="content">
<header class="content-header">
<h1>{escape(title)}</h1>
<span class="kind-badge kind-{escape(kind_badge.lower())}">{escape(kind_badge)}</span>
</header>
<article class="content-body">
{body_html}
</article>
{where_used_html}
</main>
{figma_html}
</body>
</html>
"""


def render_overview(specs, where_used, today) -> str:
    counts = {
        "pages": len(specs["pages"]),
        "sections": len(specs["sections"]),
        "figma_nodes": len(specs["figma_index"]),
    }
    figma_pages = sum(1 for v in specs["figma_index"].values() if v.get("kind") == "page")
    figma_components = sum(1 for v in specs["figma_index"].values() if v.get("kind") == "component")
    stale_count = sum(1 for v in specs["figma_index"].values() if is_stale(v.get("last_synced_at"), today))

    # Most-used sections (top 5)
    by_use = sorted(where_used.items(), key=lambda kv: (-len(kv[1]), kv[0]))[:5]
    most_used = "\n".join(
        f'<li><a href="sections/{slug}.html"><code>{escape(slug)}</code></a> — {len(pages)} page{"" if len(pages)==1 else "s"}</li>'
        for slug, pages in by_use
    ) or '<li class="muted">No section→page links yet.</li>'

    # Sections referenced by pages but missing their spec
    referenced = set()
    for page in specs["pages"].values():
        for s in page["frontmatter"].get("sections", []) or []:
            referenced.add(s)
    have = set(specs["sections"].keys())
    missing = sorted(referenced - have)
    missing_html = (
        "<ul>" + "".join(f'<li><code>{escape(s)}</code></li>' for s in missing) + "</ul>"
        if missing else '<p class="muted">No missing section specs.</p>'
    )

    body_html = f"""
<p class="lead">Spec hierarchy for this project. Click anything in the tree to drill in.</p>
<section class="dashboard">
<div class="card">
<h2>Counts</h2>
<dl>
<dt>Pages</dt><dd>{counts['pages']}</dd>
<dt>Sections</dt><dd>{counts['sections']}</dd>
<dt>Figma nodes (indexed)</dt><dd>{counts['figma_nodes']} ({figma_pages} pages · {figma_components} components)</dd>
<dt>Stale Figma refs (&gt;{STALE_DAYS}d)</dt><dd>{stale_count}</dd>
</dl>
</div>
<div class="card">
<h2>Most-used sections</h2>
<ol>{most_used}</ol>
</div>
<div class="card">
<h2>Referenced but unspecced</h2>
{missing_html}
</div>
</section>
<p class="muted">Generated {today.isoformat()} · all paths relative · open with file://</p>
"""

    return page_layout(
        title="Spec Hierarchy — Overview",
        kind_badge="Overview",
        tree_html=render_tree(specs, depth=0),
        body_html=body_html,
        figma_html='<aside class="figma" aria-label="Figma references"><h2>Figma</h2><p class="muted">Pick a spec from the tree to see Figma context.</p></aside>',
        depth=0,
    )


CSS = """\
:root {
  --c-bg: #fafafa;
  --c-surface: #ffffff;
  --c-text: #151515;
  --c-muted: #6d6d6d;
  --c-border: #e7e7e7;
  --c-accent: #f18e53;
  --c-link: #17678d;
  --c-warn: #b87a30;
  --c-stale: #b03d3d;
  --c-stale-bg: #fdecec;
  --c-warn-bg: #fff4e1;
  --c-code-bg: #f6f6f6;
  --c-tree-active: #f2f9fd;
  --side-w: 260px;
  --figma-w: 360px;
  --r-radius: 6px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  font-size: 14px;
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: var(--c-bg); color: var(--c-text); }
body.app {
  display: grid;
  grid-template-columns: var(--side-w) 1fr var(--figma-w);
  min-height: 100vh;
}
.tree {
  background: var(--c-surface);
  border-right: 1px solid var(--c-border);
  padding: 16px 12px;
  position: sticky;
  top: 0;
  align-self: start;
  max-height: 100vh;
  overflow-y: auto;
}
.tree-link {
  display: block;
  padding: 6px 8px;
  text-decoration: none;
  color: var(--c-text);
  border-radius: var(--r-radius);
  font-size: 13px;
}
.tree-link:hover { background: var(--c-tree-active); }
.tree-singleton { font-weight: 500; }
.tree-group {
  margin-top: 12px;
  margin-bottom: 4px;
  padding: 6px 8px;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--c-muted);
  cursor: pointer;
}
.tree-list {
  list-style: none;
  margin: 0;
  padding: 0 0 0 4px;
}
.tree-list li { margin: 0; }
.content {
  padding: 24px 32px 64px;
  max-width: 880px;
  width: 100%;
  background: var(--c-surface);
  border-right: 1px solid var(--c-border);
}
.content-header {
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--c-border);
  padding-bottom: 12px;
  margin-bottom: 20px;
}
.content-header h1 { margin: 0; font-size: 24px; }
.kind-badge {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 3px 8px;
  border-radius: 999px;
  background: var(--c-code-bg);
  color: var(--c-muted);
  font-weight: 600;
}
.kind-page { background: #e4f2fa; color: #17678d; }
.kind-section { background: #fff4e1; color: #b87a30; }
.kind-project { background: #f2f9fd; color: #1b81ae; }
.kind-theme { background: #e7e7e7; color: #454545; }
.content-body h1 { font-size: 22px; margin-top: 24px; }
.content-body h2 { font-size: 18px; margin-top: 28px; border-bottom: 1px solid var(--c-border); padding-bottom: 4px; }
.content-body h3 { font-size: 15px; margin-top: 20px; }
.content-body p, .content-body li { line-height: 1.55; }
.content-body code {
  background: var(--c-code-bg);
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 0.92em;
}
.content-body pre {
  background: var(--c-code-bg);
  padding: 12px 14px;
  border-radius: var(--r-radius);
  overflow-x: auto;
}
.content-body pre code { background: none; padding: 0; }
.content-body table {
  border-collapse: collapse;
  width: 100%;
  margin: 12px 0;
}
.content-body th, .content-body td {
  border-bottom: 1px solid var(--c-border);
  padding: 6px 10px;
  text-align: left;
  font-size: 13px;
}
.content-body th { background: var(--c-code-bg); }
.content-body blockquote {
  border-left: 3px solid var(--c-accent);
  margin: 12px 0;
  padding: 4px 14px;
  color: var(--c-muted);
}
.where-used {
  margin-top: 32px;
  padding: 16px 18px;
  background: #f2f9fd;
  border: 1px solid #c2e5f5;
  border-radius: var(--r-radius);
}
.where-used h3 { margin-top: 0; }
.where-used ul { margin: 4px 0 0; padding-left: 18px; }
.figma {
  background: var(--c-surface);
  padding: 16px;
  border-left: 1px solid var(--c-border);
  font-size: 13px;
  position: sticky;
  top: 0;
  align-self: start;
  max-height: 100vh;
  overflow-y: auto;
}
.figma h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--c-muted); margin: 0 0 12px; }
.figma-card {
  background: #fafafa;
  border: 1px solid var(--c-border);
  border-radius: var(--r-radius);
  padding: 12px;
  margin-bottom: 12px;
}
.figma-card header { display: flex; flex-direction: column; gap: 6px; }
.figma-card h3 { font-size: 13px; margin: 0; font-weight: 600; }
.figma-card .badges { display: flex; flex-wrap: wrap; gap: 4px; }
.badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 999px;
  background: var(--c-code-bg);
  color: var(--c-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.badge-viewport { background: #e4f2fa; color: #17678d; }
.badge-kind { background: #fff4e1; color: #b87a30; }
.badge-stale { background: var(--c-stale-bg); color: var(--c-stale); }
.badge-warn { background: var(--c-warn-bg); color: var(--c-warn); }
.thumb { width: 100%; height: auto; display: block; margin: 8px 0; border-radius: 4px; }
.thumb-placeholder {
  margin: 8px 0;
  padding: 22px 8px;
  text-align: center;
  background: var(--c-code-bg);
  border-radius: 4px;
  color: var(--c-muted);
  font-size: 11px;
}
.figma-card dl { margin: 8px 0 0; display: grid; grid-template-columns: 92px 1fr; gap: 4px 8px; }
.figma-card dt { color: var(--c-muted); font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; }
.figma-card dd { margin: 0; font-size: 12px; }
.open-figma {
  display: inline-block;
  margin-top: 6px;
  font-size: 12px;
  color: var(--c-link);
  text-decoration: none;
}
.open-figma:hover { text-decoration: underline; }
.muted { color: var(--c-muted); }
.lead { font-size: 15px; color: var(--c-muted); }
.dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; margin: 16px 0; }
.card { background: #fafafa; border: 1px solid var(--c-border); border-radius: var(--r-radius); padding: 16px; }
.card h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--c-muted); margin: 0 0 8px; border-bottom: none; padding: 0; }
.card dl { display: grid; grid-template-columns: 1fr auto; gap: 4px 8px; margin: 0; }
.card dt { color: var(--c-muted); font-size: 12px; }
.card dd { margin: 0; font-size: 13px; font-weight: 500; }
.card ol, .card ul { padding-left: 18px; margin: 6px 0; }
.card a { color: var(--c-link); }
@media (max-width: 1100px) {
  body.app { grid-template-columns: 220px 1fr; }
  .figma { display: none; }
}
"""


def main(repo_root: Path):
    specs_dir = repo_root / ".claude" / "specs"
    if not specs_dir.is_dir():
        sys.exit(f"specs dir not found: {specs_dir}")

    specs = collect_specs(specs_dir)
    if not specs["project"] and not specs["theme"]:
        sys.exit("No project.md or theme.md — run /init-specs and /spec-theme first.")

    today = date.today()
    where_used = derive_where_used(specs)

    viewer_dir = specs_dir / "_viewer"
    if viewer_dir.exists():
        shutil.rmtree(viewer_dir)
    (viewer_dir / "pages").mkdir(parents=True, exist_ok=True)
    (viewer_dir / "sections").mkdir(parents=True, exist_ok=True)

    md = markdown.Markdown(extensions=MD_EXTENSIONS)

    counts = {"project": 0, "theme": 0, "pages": 0, "sections": 0}

    # Project
    if specs["project"]:
        body_html = md.reset().convert(specs["project"]["body"])
        page_html = page_layout(
            title=f"Project — {specs['project']['frontmatter'].get('store', {}).get('name') or 'Project'}",
            kind_badge="Project",
            tree_html=render_tree(specs, depth=0),
            body_html=body_html,
            figma_html=render_figma_panel(
                [{"file_key": s["file_key"], "node_id": s.get("file_key", "") and ""} for s in []],
                specs["figma_index"], today, depth=0,
            ),
            depth=0,
        )
        # For project, list Figma sources from frontmatter as panel
        sources = specs["project"]["frontmatter"].get("figma_sources", []) or []
        # Synthesize ref entries pointing at each source's file_key
        synth_refs = [{"file_key": s.get("file_key", ""), "node_id": "0:1", "label": s.get("label", "")} for s in sources]
        figma_html = render_figma_panel(synth_refs, specs["figma_index"], today, depth=0)
        page_html = page_layout(
            title=f"Project — {specs['project']['frontmatter'].get('store', {}).get('name') or 'Project'}",
            kind_badge="Project",
            tree_html=render_tree(specs, depth=0),
            body_html=body_html,
            figma_html=figma_html,
            depth=0,
        )
        (viewer_dir / "project.html").write_text(page_html, encoding="utf-8")
        counts["project"] = 1

    # Theme
    if specs["theme"]:
        body_html = md.reset().convert(specs["theme"]["body"])
        page_html = page_layout(
            title=f"Theme — {(specs['theme']['frontmatter'].get('base_theme') or {}).get('name', 'Theme')}",
            kind_badge="Theme",
            tree_html=render_tree(specs, depth=0),
            body_html=body_html,
            figma_html='<aside class="figma" aria-label="Figma references"><h2>Figma</h2><p class="muted">Theme spec is design-agnostic; see the Figma analysis for tokens.</p></aside>',
            depth=0,
        )
        (viewer_dir / "theme.html").write_text(page_html, encoding="utf-8")
        counts["theme"] = 1

    # Pages
    for slug, page in specs["pages"].items():
        body_html = md.reset().convert(page["body"])
        figma_refs = page["frontmatter"].get("figma", []) or []
        page_html = page_layout(
            title=f"Page — {slug}",
            kind_badge="Page",
            tree_html=render_tree(specs, depth=1),
            body_html=body_html,
            figma_html=render_figma_panel(figma_refs, specs["figma_index"], today, depth=1),
            depth=1,
        )
        (viewer_dir / "pages" / f"{slug}.html").write_text(page_html, encoding="utf-8")
        counts["pages"] += 1

    # Sections
    for slug, section in specs["sections"].items():
        body_html = md.reset().convert(section["body"])
        figma_refs = section["frontmatter"].get("figma", []) or []
        where_used_html = render_where_used_block(slug, where_used, depth=1)
        page_html = page_layout(
            title=f"Section — {slug}",
            kind_badge="Section",
            tree_html=render_tree(specs, depth=1),
            body_html=body_html,
            figma_html=render_figma_panel(figma_refs, specs["figma_index"], today, depth=1),
            depth=1,
            where_used_html=where_used_html,
        )
        (viewer_dir / "sections" / f"{slug}.html").write_text(page_html, encoding="utf-8")
        counts["sections"] += 1

    # Overview / index.html
    overview_html = render_overview(specs, where_used, today)
    (viewer_dir / "index.html").write_text(overview_html, encoding="utf-8")

    # CSS
    (viewer_dir / "styles.css").write_text(CSS, encoding="utf-8")

    total = sum(counts.values()) + 2  # +1 index.html, +1 styles.css
    print(f"Wrote {total} files to {viewer_dir}/")
    print(f"  project.html:   {counts['project']}")
    print(f"  theme.html:     {counts['theme']}")
    print(f"  pages/*.html:   {counts['pages']}")
    print(f"  sections/*.html:{counts['sections']}")
    print(f"  index.html + styles.css")
    print()
    print(f"Open: open {viewer_dir / 'index.html'}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("Usage: render.py <repo-root>")
    main(Path(sys.argv[1]).resolve())
