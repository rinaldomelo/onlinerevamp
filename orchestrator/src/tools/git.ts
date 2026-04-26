// Git wrapper using simple-git. Scoped to the theme repo.
//
// Status (M7): scaffold. M10 deployment-agent uses these.

import { simpleGit, type SimpleGit } from "simple-git";
import { resolve } from "node:path";

const THEME_ROOT = resolve(process.env.THEME_ROOT ?? "..");

let _git: SimpleGit | null = null;
function git(): SimpleGit {
  if (!_git) _git = simpleGit({ baseDir: THEME_ROOT });
  return _git;
}

export async function currentBranch(): Promise<string> {
  return (await git().status()).current ?? "";
}

export async function isClean(): Promise<boolean> {
  const status = await git().status();
  return status.isClean();
}

export async function createBranch(name: string, base = "main"): Promise<void> {
  if (!(await isClean())) {
    throw new Error(`Working tree not clean; refusing to create branch ${name}`);
  }
  await git().checkout(base);
  await git().pull("origin", base);
  await git().checkoutLocalBranch(name);
}

export async function commit(message: string, files?: string[]): Promise<string> {
  if (files?.length) await git().add(files);
  else await git().add(".");
  const result = await git().commit(message);
  return result.commit;
}

export async function push(branch: string, setUpstream = true): Promise<void> {
  if (setUpstream) {
    await git().push(["-u", "origin", branch]);
  } else {
    await git().push("origin", branch);
  }
}
