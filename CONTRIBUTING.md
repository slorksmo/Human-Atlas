# Contributing to Human Atlas

You can help by testing the viewer, reviewing Arabic anatomy terms, improving a lesson, or working on the code. Start with the [open issues](https://github.com/slorksmo/Human-Atlas/issues) and share your findings on the relevant issue.

## Test or review the Study preview

- Open the [Arabic FDI lesson](https://atlas-study.human-atlas-9co.pages.dev/?tour=fdi-notation&step=1&lang=ar) or the [English lesson](https://atlas-study.human-atlas-9co.pages.dev/?tour=fdi-notation&step=1&lang=en). The lesson walks through five teeth and ends with a three-question quiz.
- For a viewer issue, include the exact link, reference body, language, device, operating system, browser version, and steps to reproduce it. Screenshots are welcome when they show the issue.
- For an Arabic wording correction, include the step or question, the current text, your suggested text, and a reference when the correction changes an anatomical claim. Keep the English term or stable source identifier available so reviewers can identify the same structure.

## Run the project locally

Use Node.js 22.13 or later. Fork the repository, clone your fork, and create a branch for your change.

```sh
npm ci
npm run dev
```

Open [localhost:3016](http://localhost:3016).

## Submit a pull request

Keep the pull request focused. Link any related issue and describe what you changed and how you tested it. For changes to viewer interactions, include the reference bodies and screen sizes you tested. For changes to language or layout, check English and Arabic.

Run the same commands as the `validate` GitHub Actions job.

```sh
npm run check
node scripts/validate-atlas.mjs
node scripts/validate-atlas.mjs atlas-female.json
node scripts/pack-fdi-lesson.mjs --check
node scripts/validate-interactions.mjs
npm run build
```

## Change anatomy data

The application code is MIT-licensed. The packaged anatomy data has separate attribution terms. For a geometry import or adaptation, document the dataset and version, creator, source link, reuse license, and any adaptation or registration in [the shipped attribution file](public/ATTRIBUTION.md). Keep each structure traceable to its source.

If a change affects a full reference manifest or the structures used in the FDI lesson, regenerate the lesson geometry with `node scripts/pack-fdi-lesson.mjs` and commit the matching files.
