// File-system wrapper for the theme repo. All paths are theme-relative.
//
// Status (M7): scaffold. File-glob policy enforcement (M11) wraps these calls.

import { readFile, writeFile, mkdir, readdir, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

const THEME_ROOT = resolve(process.env.THEME_ROOT ?? "..");

function themePath(relativePath: string): string {
  return join(THEME_ROOT, relativePath);
}

export async function readTheme(path: string): Promise<string> {
  return readFile(themePath(path), "utf8");
}

export async function readJsonTheme<T = unknown>(path: string): Promise<T> {
  const raw = await readTheme(path);
  return JSON.parse(raw) as T;
}

export async function writeTheme(path: string, content: string): Promise<void> {
  const fullPath = themePath(path);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, content, "utf8");
}

export async function writeJsonTheme(path: string, data: unknown): Promise<void> {
  await writeTheme(path, JSON.stringify(data, null, 2) + "\n");
}

export async function listThemeFiles(): Promise<{
  sections: string[];
  snippets: string[];
  templates: string[];
  assets: string[];
  config: string[];
  locales: string[];
  layout: string[];
}> {
  return {
    sections: await listDir("sections"),
    snippets: await listDir("snippets"),
    templates: await listDir("templates"),
    assets: await listDir("assets"),
    config: await listDir("config"),
    locales: await listDir("locales"),
    layout: await listDir("layout"),
  };
}

async function listDir(rel: string): Promise<string[]> {
  try {
    const entries = await readdir(themePath(rel));
    return entries.map((e) => join(rel, e));
  } catch {
    return [];
  }
}

export async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(themePath(path));
    return true;
  } catch {
    return false;
  }
}
