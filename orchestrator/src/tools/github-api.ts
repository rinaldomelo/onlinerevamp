// GitHub API wrapper using @octokit/rest. Used by the deployment agent (M10)
// for PR creation + comment posting.
//
// Status (M7): scaffold.

import { Octokit } from "@octokit/rest";

const OWNER = process.env.GITHUB_OWNER ?? "rinaldomelo";
const REPO = process.env.GITHUB_REPO ?? "onlinerevamp";

let _octokit: Octokit | null = null;
function octokit(): Octokit {
  if (!_octokit) {
    const auth = process.env.GITHUB_TOKEN;
    if (!auth) {
      throw new Error("GITHUB_TOKEN env var required for GitHub API calls");
    }
    _octokit = new Octokit({ auth });
  }
  return _octokit;
}

export interface OpenPullRequestInput {
  branchName: string;
  title: string;
  body: string;
  base?: "development" | "staging" | "main";
}

export interface PullRequestRef {
  number: number;
  url: string;
  base: string;
}

export async function openPullRequest(
  input: OpenPullRequestInput,
): Promise<PullRequestRef> {
  const { data } = await octokit().pulls.create({
    owner: OWNER,
    repo: REPO,
    head: input.branchName,
    base: input.base ?? "development",
    title: input.title,
    body: input.body,
  });
  return { number: data.number, url: data.html_url, base: data.base.ref };
}

export async function commentOnPr(
  prNumber: number,
  body: string,
): Promise<void> {
  await octokit().issues.createComment({
    owner: OWNER,
    repo: REPO,
    issue_number: prNumber,
    body,
  });
}
