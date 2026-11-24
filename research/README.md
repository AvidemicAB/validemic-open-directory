# Open directory research protocol

This folder holds the raw research behind the open directory: cached source
pages, one JSON record per tool and one per university. Agents follow this
file exactly.

```
research/
  factors-prompt.md        generated from src/data/openDirectory/factors.ts (node research/dump-factors.ts > research/factors-prompt.md)
  fetch-page.mjs           fetch + cache one page: node research/fetch-page.mjs <bucket> <url> [--links]
  cache/tools/<id>/*.txt   every page read for a tool (header: URL, date, status)
  cache/unis/<slug>/*.txt  every page read for a university
  tools/<id>.json          the tool record (ToolRecord in factors.ts)
  unis/<cc>/<slug>.json    the university record (software found + sources)
  blocked.txt              URLs that refused automated reading (tab-separated: date, bucket, url)
```

## Rules (all agents)

1. **Facts, not verdicts.** Record what the vendor or university states. Never
   write "GDPR compliant", "safe" or "recommended".
2. **Every value has evidence**: `url`, a verbatim `quote` (max 25 words,
   copied exactly) and `retrievedAt` (today, YYYY-MM-DD). No quote, no value.
3. **`unknown` / `none-found` is an answer.** Use it when you looked in the
   obvious places (below) and the vendor does not say. Add `note` with where
   you looked. Never guess to fill a gap. If you did not look at all (ran out
   of time, skipped a factor), leave the factor out: the page then shows
   "Not checked yet", which is the truth.
   `not-applicable` is allowed for any factor, but only with a vendor quote
   showing why (e.g. "can always be used locally without syncing any data"
   makes SSO irrelevant for local use). Never use it to soften a gap.
   When a value is `other`, add `"others": ["Name", ...]` with the names the
   vendor gives (e.g. a host not in the option list). Pages show the names,
   never the bare word "Other".
4. **Cache every page you read** with `fetch-page.mjs` before quoting it, so
   facts can be re-extracted later without crawling again. If the script
   prints `BLOCKED`, try WebFetch once. If that fails too, append the URL to
   `blocked.txt`, set affected factors to `unknown` with note
   `source blocked`, and move on. Never try to get around bot protection
   (no proxies, no user-agent tricks, no CAPTCHA solving), and never read a
   blocked page through a web archive, mirror, cache or search snippet.
   Allowed: files the vendor itself publishes for AI tools on its own domain,
   such as `llms.txt` or `llms-full.txt` (e.g. docs.<vendor>/llms-full.txt).
   They are official sources even when the matching HTML pages block us.
5. **Primary sources first**: the vendor's own privacy policy, DPA,
   sub-processor page, trust/security centre, terms, accessibility page,
   pricing page and product pages. Third-party sources only for: EU-US Data
   Privacy Framework status (dataprivacyframework.gov list), federation
   membership (eduGAIN / SWAMID / Haka / Feide / WAYF / InCommon metadata
   or member lists), and incidents. Incidents use **primary sources only**:
   a regulator decision, a court record (docket) or the vendor's own notice,
   never press articles. Lawsuits are written as "alleged, not ruled" with
   the case name.
5a. When a page is blocked, write the note as `source blocked: <url>`. The
   site shows these as "Could not read", separate from "Not stated".
6. **Same method for every tool**, our own products (Avidnote, Kahubi)
   included. No special treatment either way.
7. Stay on public pages. Don't sign up, log in, or submit forms.

## Tool research (one agent per tool)

Input: tool id, name, website.

1. Fetch the homepage with `--links` and find: privacy policy, terms, DPA,
   sub-processors, security/trust, accessibility/VPAT, pricing, product or
   feature pages, AI/data-usage FAQ, status page. Also try the usual paths
   (`/privacy`, `/legal`, `/dpa`, `/subprocessors`, `/security`, `/trust`,
   `/accessibility`, `/pricing`, `/.well-known/security.txt`) and a web
   search for `"<name>" subprocessors`, `"<name>" DPA`, `"<name>" VPAT`,
   `"<name>" HECVAT`, `"<name>" train on data`.
2. Answer **every factor** in `research/factors-prompt.md`. Use the option
   values exactly as written there.
3. Write `research/tools/<id>.json`:

```json
{
  "id": "scispace",
  "name": "SciSpace",
  "website": "https://scispace.com",
  "tagline": "One line, plain words, what it does (no marketing claims)",
  "checkedAt": "2026-11-14",
  "facts": {
    "trains_on_content": {
      "value": "opt-out",
      "evidence": [{ "url": "https://…/privacy", "quote": "exact words…", "retrievedAt": "2026-11-14" }],
      "note": "optional, short"
    }
  }
}
```

4. End with a 3-line report: factors answered / unknown / blocked, and
   anything surprising.

## University discovery (one agent per university)

Input: university name, country, main domain.

1. Search the university's site for its software catalogue. Good queries:
   `site:<domain> software`, `site:<domain> programvara` (sv),
   `ohjelmistot` (fi), `programvare` (no), `software` / `programmer` (da),
   `site:<domain> EndNote OR Zotero OR Mendeley`, `site:<domain> licens`,
   `site:<domain> AI-verktyg`, `site:<domain> enkätverktyg`,
   plus the library's reference-management and AI-tools guides.
2. Prefer one catalogue page that lists many tools (IT services software
   list, "Software for staff/students", library tool guides). Cache every
   page you use.
3. Record each (tool, page) pair that is visible on a public page. "Listed"
   means only that: not licensed, not recommended, not used.
4. Write `research/unis/<cc>/<slug>.json`:

```json
{
  "university": "Stockholm University",
  "country": "SE",
  "domain": "su.se",
  "checkedAt": "2026-11-14",
  "catalogues": ["https://…/software-list"],
  "tools": [
    { "name": "Zotero", "website": "https://www.zotero.org", "category": "reference", "sourceUrl": "https://…", "quote": "exact words", "retrievedAt": "2026-11-14", "status": "supported | mentioned | restricted | not-allowed" }
  ]
}
```

`status`: `supported` (the university provides or licenses it),
`mentioned` (named in a guide), `restricted` (allowed only for some
data or uses), `not-allowed` (the page says don't use it with personal
data / at all). That last one is valuable: keep it.
