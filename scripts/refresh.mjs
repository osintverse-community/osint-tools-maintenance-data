#!/usr/bin/env node
/* Refreshes the GitHub facts for every project in data/projects.json and rewrites the data files.

     GITHUB_TOKEN=... node scripts/refresh.mjs        (Node 18 or later; no dependencies)

   For each repository it reads two things from the GitHub REST API:
     GET /repos/{owner}/{repo}                 stars, language, licence, archived, pushed_at
     GET /repos/{owner}/{repo}/commits?per_page=1   the newest commit on the default branch

   State, per project:
     archived  the owner has set the repository to read-only on GitHub
     dormant   not archived, and the newest commit on the default branch is more than 548 days (18 months) old
     active    everything else

   "Last commit" is the default branch's newest commit, not pushed_at: pushed_at also moves when someone
   pushes a tag or another branch, so a project can look alive on it years after its code last changed.

   Writes data/projects.json, data/projects.csv and data/summary.json. */
import { readFileSync, writeFileSync } from "node:fs";

const DORMANT_DAYS = 548;
const DAY = 86_400_000;
const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error("Set GITHUB_TOKEN (a token with no scopes is enough for public repositories).");
  process.exit(1);
}
const headers = { authorization: `Bearer ${token}`, accept: "application/vnd.github+json", "user-agent": "osint-tools-maintenance-data" };
const root = new URL("../", import.meta.url);
const file = (p) => new URL(p, root);

async function get(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.json();
}

async function refresh(p) {
  try {
    const r = await get(`/repos/${p.repo}`);
    const commits = await get(`/repos/${r.full_name}/commits?per_page=1`);
    const c = commits[0]?.commit;
    const license = r.license?.spdx_id && r.license.spdx_id !== "NOASSERTION" ? r.license.spdx_id : null;
    return {
      ...p,
      repo: r.full_name,
      stars: r.stargazers_count,
      language: r.language,
      license,
      archived: r.archived,
      last_commit_at: c?.committer?.date ?? c?.author?.date ?? null,
      pushed_at: r.pushed_at,
    };
  } catch (e) {
    console.warn(`  ${p.repo}: ${e.message}; keeping the previous values`);
    return p;
  }
}

export function stateOf(p, now = Date.now()) {
  if (p.archived) return "archived";
  const last = p.last_commit_at ? Date.parse(p.last_commit_at) : NaN;
  return !Number.isNaN(last) && now - last > DORMANT_DAYS * DAY ? "dormant" : "active";
}

const projects = JSON.parse(readFileSync(file("data/projects.json"), "utf8")).projects;
const queue = [...projects];
const out = [];
await Promise.all(
  Array.from({ length: 6 }, async () => {
    for (let p = queue.shift(); p; p = queue.shift()) out.push(await refresh(p));
  }),
);
write(out, new Date().toISOString());

export function write(list, readAt) {
  const now = Date.parse(readAt);
  const rows = list
    .map((p) => ({ ...p, state: stateOf(p, now) }))
    .sort((a, b) => b.stars - a.stars || a.name.localeCompare(b.name));
  writeFileSync(file("data/projects.json"), JSON.stringify({ read_at: readAt, dormant_days: DORMANT_DAYS, projects: rows }, null, 1) + "\n");

  const cols = ["slug", "name", "category", "inputs", "repo", "stars", "language", "license", "last_commit_at", "pushed_at", "archived", "state", "listing_url", "alternatives_url"];
  const cell = (v) => {
    const s = Array.isArray(v) ? v.join(";") : v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  writeFileSync(file("data/projects.csv"), [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\n") + "\n");

  const count = (s) => rows.filter((r) => r.state === s).length;
  const quiet = rows.filter((r) => r.state !== "active");
  const summary = {
    read_at: readAt,
    tracked: rows.length,
    active: count("active"),
    active_last_90_days: rows.filter((r) => r.state === "active" && r.last_commit_at && now - Date.parse(r.last_commit_at) < 90 * DAY).length,
    dormant: count("dormant"),
    archived: count("archived"),
    quiet_with_1000_stars_or_more: quiet.filter((r) => r.stars >= 1000).length,
  };
  writeFileSync(file("data/summary.json"), JSON.stringify(summary, null, 1) + "\n");
  console.log(summary);
}
