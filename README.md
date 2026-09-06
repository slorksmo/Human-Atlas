# Human Atlas

An interactive 3D anatomy explorer for the browser. Take an adult human body apart into individually selectable structures, switch anatomical systems on and off, search every named structure, and read what each one does — in English or Arabic.

Built with React, Three.js, and shadcn/ui. No API keys, no accounts, no backend: the whole thing is a static site.

## Features

- **Two reference bodies**, adult male and adult female, switched from the header.
- **Every mesh is selectable.** Tap a structure to isolate it and read its description.
- **Systems as layers** — toggle them individually, or use the skeleton and organ presets.
- **Explode the body** from assembled anatomy to a spaced inventory of every visible piece.
- **English and Arabic**, with the interface mirroring to right-to-left and search matching either script.
- **Search by name or source identifier**, in either language.
- Compact controls and detail panels on phones, in portrait and landscape.

The body surface and the reproductive system start switched off on both bodies. They stay listed and turn on in one tap, and searching for a structure shows it whatever its system is set to.

## Run locally

Requires Node.js 22.13 or newer.

```sh
npm ci
npm run dev
```

Open <http://localhost:3016>. `npm run build` produces a static site in `dist/`.

## The anatomy

Two reference bodies ship with the viewer. They come from separate research projects, so their coverage differs and they are not directly comparable.

| | Source | Structures | Named concepts | Systems | Triangles | Download |
| --- | --- | --- | --- | --- | --- | --- |
| Male | BodyParts3D 4.0 | 2,234 | 3,432 | 15 | 2,288,268 | ~34 MB |
| Female | Human Reference Atlas v1.10 | 1,220 | 1,439 | 18 | 2,765,492 | ~37 MB |

The **male** body is a whole-body reference covering every modeled system, from MRI and anatomical illustration.

The **female** body is an assembly of body surface, brain, and selected organs, including female reproductive anatomy. It is far more detailed than the male body in some places — its brain arrives already divided into 283 individually selectable regions, and its kidney into 87 — and far thinner in others. Of its 1,220 structures, 964 are its own; the remaining 256 fill gaps its source does not model, and are described under [Filling the gaps](#filling-the-gaps).

Neither body represents every human structure or variation. Individual meshes are distinct from named concepts, which may group several meshes. This is an educational explorer, not a diagnostic or surgical tool.

## Arabic

The interface, the system names, and the structure descriptions are written in both languages, and the layout mirrors to right-to-left from a single `dir` attribute on the document — the stylesheet uses logical properties throughout, so there is no second stylesheet to keep in step. Search matches either script and folds the Arabic letters that are written more than one way, so a query finds a term however it was typed.

Anatomical names are a harder problem than interface text, because a wrong term is worse than an English one: *ilium* and *ileum* differ by a letter in English and are unrelated words in Arabic. So the vocabulary is not translated by hand or by machine. Every concept in the male atlas carries its Foundational Model of Anatomy identifier, and Wikidata records the same identifier against items with Arabic labels, so `scripts/fetch-arabic-terms.mjs` joins the two exactly rather than matching on names. Wikidata is CC0, which is what makes the result redistributable.

That join alone reaches 21% of concepts. Most of what it misses is a side or a numbered variant of a name it did find, so those are composed from the base term with the agreement Arabic requires — gender taken from the head noun, and the definite article added when the phrase is definite either by its own article or by annexation. Coverage ends at 43% of the male atlas and 40% of the female, 1,900 terms in all. About 300 of them, the ones a reader is most likely to open, are checked by hand in `scripts/arabic-review.json`; those corrections are applied *before* composition, so every variant is built from a corrected base, and re-running the script never loses them.

Structures the vocabulary does not cover stay in English rather than being guessed at — ordinary in Arabic medical teaching, and honest about what is known. Where a name is translated, the English term appears beneath the Arabic one, so the reader always has the word the literature uses.

## How it works

Geometry is merged into batches and drawn with per-structure GPU textures controlling translation, visibility, and selection, while separate component geometry supports accurate picking. Exploded layouts pack only the visible pieces. Rendering updates when the scene changes, so orbit controls stay responsive without thousands of separate draw calls.

Optional WebMCP tools expose anatomy search and inspection to compatible browsers. The visible interface works without them.

## Filling the gaps

The female source models no skull, ribs, shoulder girdle, arm, or foot bones, and almost no muscle. Rather than show half a body, two sets of structures fill those gaps. Both are listed as systems of their own, drawn in their own colours, and switched off until asked for — a reader is never shown another body's anatomy without being told.

### Leg muscles from a second female body

The female source carries sixteen muscles in total, all in the eye and the knee. `scripts/import-lower-limb.mjs` fills the legs from [Andreassen et al. (2023)](https://doi.org/10.1038/s41597-022-01905-2), who segmented 76 lower-limb muscles from the Visible Human Female and released them under CC BY 4.0.

Both bodies model the hip bone, femur, patella, tibia, and fibula, so each group of muscles is fitted to the bones it actually spans — the hip muscles to the pelvis, the thigh to the femur and patella, the calf to the tibia and fibula. The fit is an axis rotation, a uniform scale, and a translation, so no muscle is distorted. The two women turn out to be nearly the same size: fitted scales run 0.98 to 1.03, and the shared bones agree to within 3 mm at the hip and about 20 mm at the knee and ankle.

There is no equivalent open female source for the upper limb, so the arms carry bone only. No muscle is taken from the male body: muscle carries the build of the person it came from far too plainly for that to be honest.

### Bones from the male body

`scripts/borrow-anatomy.mjs` borrows 180 bones for the skull, chest, arms, and feet. Placement is measured, not eyeballed. Both bodies model the spine, sternum, pelvis, femur, tibia, fibula, patella, and brain, so each region is fitted by least squares to the structures it attaches to or encloses:

| Region | Bones | Fitted to | Scale |
| --- | --- | --- | --- |
| Skull and face | 22 | cervical spine, brain | 0.993 |
| Ribs and costal cartilage | 38 | thoracic spine, sternum | 0.875 |
| Shoulder, arm, hand | 64 | upper thoracic spine, sternum | 0.927 |
| Each foot and ankle | 28 | tibia and fibula of that leg | 0.898 |

Scale alone still leaves a limb in the donor's pose, and the two bodies do not stand alike — this one holds its arms further from the trunk and its feet straighter. So each limb is then turned about its own joint until it runs along the limb of this body's own surface:

| Limb | Turn | Reach |
| --- | --- | --- |
| Left arm | 21.4° | ×0.98 |
| Right arm | 23.4° | ×0.95 |
| Left foot | 18.4° | ×1.20 |
| Right foot | 16.8° | ×1.19 |

A bone turns as one rigid piece, about the centre of its rounded joint end, so the humeral head stays seated in the shoulder while the shaft swings out. Every anchor lands within 25 mm of its counterpart, and the result is checkable against the body surface: the brain sits wholly inside the borrowed cranium, the heart and lungs inside the borrowed ribcage, the foot bones inside the skin of the foot to within about a centimetre.

These remain a different person's bones, and a man's. They stand in for shape and position, and carry none of the skeletal differences between the sexes outside the pelvis, which is this body's own. Drop the system once a complete female source exists.

## Rebuilding the data

Browser-ready geometry is included, so rebuilding is optional. Simplification uses a 0.2% relative error limit per structure throughout.

**Male body** — obtain the BodyParts3D OBJ archive and English metadata tables, prepare the joined concepts and display-system mappings, then:

```sh
python3 scripts/convert-anatomy.py OBJ_DIRECTORY CONCEPT_MAP SYSTEM_MAP
node scripts/optimize-anatomy.mjs
node scripts/compress-models.mjs
```

**Female body** — download the source GLB and the Visible Human Female STL set linked in [ATTRIBUTION.md](public/ATTRIBUTION.md), then:

```sh
node --max-old-space-size=8192 scripts/convert-anatomy-glb.mjs v1.10.glb --supplement v1.5.glb
node --max-old-space-size=8192 scripts/optimize-anatomy.mjs atlas-female.json
node scripts/borrow-anatomy.mjs
node scripts/import-lower-limb.mjs path/to/"Final 3D STL Models-stl"
node scripts/compress-models.mjs
```

Keep that order. `borrow-anatomy` and `import-lower-limb` each append geometry to the end of the packaged chunks, and each replaces whatever its own previous run added, so either can be re-run on its own.

`--supplement` restores the ischium and pubis, which release v1.10 dropped and v1.5 carried; the bone geometry of the two releases is identical in world space, so the restored pieces need no fitting. Naming and system grouping live in `scripts/anatomy-female-systems.mjs`. Passing `--dump` to the converter prints the source scene graph without writing anything.

**Arabic vocabulary** — rebuild after changing either atlas, since it is keyed on their concept names:

```sh
node scripts/fetch-arabic-terms.mjs
```

It queries Wikidata and caches the answers in `scripts/arabic-wikidata.cache.json`; `--offline` rebuilds from that cache alone.

## Validate

```sh
npm run check
node scripts/validate-atlas.mjs
node scripts/validate-atlas.mjs atlas-female.json
node scripts/validate-interactions.mjs
npm run build
```

Automated checks cover mesh buffers, names and concept membership, nonoverlapping exploded layouts at desktop and mobile aspect ratios for both bodies, search and inspection contracts, and tap-versus-drag handling.

Browser checks have exercised selection, system controls, search, isolation, rotation, language switching, and 390×844, 320×568, and 844×390 layouts. Phone controls stay clear of the exploded inventory, and isolated structures fit the space above or beside the detail panel.

Not tested: physical-device performance and real multitouch hardware.

## Deploy

Import the repository into Vercel as a Vite project; the included `vercel.json` configures `npm ci`, `npm run build`, and the `dist` output directory. Any static host works.

## Credits and licence

Application code is released under the [MIT License](LICENSE).

**The anatomy data is not.** It is licensed **CC BY 4.0**, which requires that attribution travel with it. Full credits, source links, and a record of every adaptation are in [ATTRIBUTION.md](public/ATTRIBUTION.md), which ships with the site. In short:

- **BodyParts3D**, © The Database Center for Life Science — the male body.
- **Human Reference Atlas**, HuBMAP, by Kristen Browne and Heidi Schlehlein, built on the Visible Human Project of the U.S. National Library of Medicine — the female body.
- **Andreassen et al. (2023)**, University of Denver — the female lower-limb muscles.
- **Wikidata** (CC0) — the Arabic anatomical vocabulary.

Third-party dependencies retain their own licences.

Issues and pull requests are welcome. For interaction problems, please include reproduction steps and browser and device details.
