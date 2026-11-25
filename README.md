# OSINT tools maintenance data

Which open-source OSINT tools are still maintained: the last commit, stars and archived flag of every
open-source project listed on [OSINTtools.io](https://osinttools.io), with the script that refreshes them.

The same numbers, with maintained alternatives for each quiet project, are on
[osinttools.io/state-of-osint-tools/](https://osinttools.io/state-of-osint-tools/).

## Summary

Read from the GitHub API on 25 November 2026 (`data/summary.json`).

| | Projects |
| --- | --- |
| Tracked: listed on OSINTtools.io, with a public GitHub repository | 173 |
| Active: a commit on the default branch in the last 18 months | 104 |
| ...of which in the last 90 days | 66 |
| Dormant: not archived, no commit on the default branch in 18 months | 56 |
| Archived on GitHub | 13 |
| Archived or dormant with 1,000 stars or more | 48 |

The ten most-starred archived or dormant projects:

| Project | Repository | Stars | Last commit | State |
| --- | --- | --- | --- | --- |
| [SpiderFoot](https://osinttools.io/tools/spiderfoot/) | smicallef/spiderfoot | 24,956 | 2023-11-05 | dormant |
| [GhostTrack](https://osinttools.io/tools/ghosttrack/) | HunxByts/GhostTrack | 20,880 | 2024-01-11 | dormant |
| [Twint](https://osinttools.io/tools/twint/) | twintproject/twint | 16,413 | 2021-03-02 | archived |
| [Holehe](https://osinttools.io/tools/holehe/) | megadose/holehe | 15,755 | 2024-09-10 | dormant |
| [Gitrob](https://osinttools.io/tools/gitrob/) | michenriksen/gitrob | 6,197 | 2018-07-05 | archived |
| [Mosint](https://osinttools.io/tools/mosint/) | alpkeskin/mosint | 6,090 | 2023-09-19 | dormant |
| [Aquatone](https://osinttools.io/tools/aquatone/) | michenriksen/aquatone | 5,959 | 2019-05-19 | archived |
| [dnstwist](https://osinttools.io/tools/dnstwist/) | elceef/dnstwist | 5,789 | 2025-04-15 | dormant |
| [h8mail](https://osinttools.io/tools/h8mail/) | khast3x/h8mail | 5,390 | 2022-06-25 | dormant |
| [Toutatis](https://osinttools.io/tools/toutatis/) | megadose/toutatis | 4,477 | 2024-12-05 | dormant |

## Method

- **Which projects.** Every tool listed on OSINTtools.io whose source is a public GitHub repository. Tools
  without one, which includes most commercial services, are not counted. The list is a directory's
  selection, not a census of all OSINT software.
- **Archived** means the owner has set the repository to read-only on GitHub.
- **Dormant** means it is not archived and the newest commit on its default branch is more than 548 days
  (18 months) old.
- **The date is the last commit on the default branch**, read with
  `GET /repos/{owner}/{repo}/commits?per_page=1`. It is not GitHub's `pushed_at`, which also moves when
  someone pushes a tag or another branch. SpiderFoot, for example, was pushed to in April 2026, but its
  last commit on the default branch was in November 2023. Both dates are in the data.
- **Dormant is not a verdict.** Some projects are finished and still work; others stop working the day a
  platform changes its pages. If you maintain one of these and it still works, say so on its listing
  ("Something changed?") and it will carry a note.

## Files

| File | What it holds |
| --- | --- |
| `data/projects.csv` | One row per project (columns below) |
| `data/projects.json` | The same rows, plus `read_at` and `dormant_days` |
| `data/summary.json` | The counts in the table above |
| `scripts/refresh.mjs` | Re-reads GitHub and rewrites all three files |

Columns: `slug`, `name`, `category`, `inputs` (the kinds of lead a tool takes, separated by `;`), `repo`,
`stars`, `language`, `license` (SPDX id, empty when GitHub reports none), `last_commit_at`, `pushed_at`,
`archived`, `state`, `listing_url`, `alternatives_url`.

## Refresh it yourself

Node 18 or later, no dependencies. A GitHub token with no scopes is enough.

```sh
GITHUB_TOKEN=<token> node scripts/refresh.mjs
```

The project list (which repositories to read) comes from the directory and is updated here when tools are
listed or retired.

## Licence and credit

- The data (`data/`) is licensed under [CC BY 4.0](LICENSE-DATA). Credit "OSINTtools.io" with a link to
  https://osinttools.io/state-of-osint-tools/ and the date of the read.
- The script (`scripts/`) is under the [MIT licence](LICENSE-CODE).
- Stars, dates, licences and the archived flag are public facts from GitHub. Project names belong to their
  owners.

Published by OSINTVerse, which runs OSINTtools.io. Corrections: open an issue, or use "Something
changed?" on the tool's listing.
