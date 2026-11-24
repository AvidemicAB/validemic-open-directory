# Validemic open directory

What AI and research tools do with university data, read from each vendor's
own pages. Every fact links to the page it came from, with a short quote and
the date it was read. Live at [validemic.com](https://validemic.com).

## What is here

| Path | What |
|---|---|
| `research/tools/*.json` | One record per tool: facts, evidence (URL, quote, date) |
| `research/README.md` | The research protocol every record follows |
| `src/data/openDirectory/factors.ts` | The question list: what we check and what counts as green or red |
| `src/data/openDirectory/aiAct.ts` | EU AI Act assessments and how we classify |
| `src/data/peerTools*.ts` | Which universities list which tools, each with a source link |
| `src/pages/open/` | The website |

## Same method for every vendor

One question list and one ranking rule for every tool. That includes Avidnote
and Kahubi, which are made by Avidemic AB, the company that maintains this
directory. They are labelled on their own page and wherever they appear as
an alternative, and are never ranked differently. The default "EU company"
preference for alternatives can rank them higher where they are built for the
same job; readers can switch it off. If you think a record or a ranking favours anyone, open an issue.

## Corrections

Vendors and readers: open an issue with the URL of the page that shows the
fact is wrong or out of date. We fix it and note the date.

## Run it

```sh
npm install
npm run dev
```

## Licences

- Code: AGPL-3.0 (see `LICENSE`)
- Data (`research/`, `src/data/`): CC BY-SA 4.0 (see `LICENSE-DATA.md`). Credit "Validemic open directory" and share what you build on it under the same licence.
- Quotes in records are short excerpts from vendors' own pages, kept with their source.
- `public/docs/`: official EU legal texts from EUR-Lex, reused under Commission Decision 2011/833/EU.

Validemic's paid workspace for institutions is a separate product and not in this repository.
