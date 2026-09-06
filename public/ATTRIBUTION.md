# Anatomy data attribution

BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International.

- License: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html (updated 2025-02-27)
- Dataset: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html
- License terms: https://creativecommons.org/licenses/by/4.0/
- Source geometry: `isa_BP3D_4.0_obj_99.zip`, BodyParts3D 4.0.
- English names and relationships: IS-A and PART-OF concept, element, and inclusion tables from the same archive.
- Publication: Mitsuhashi et al. (2009), BodyParts3D: 3D structure database for anatomical concepts. https://doi.org/10.1093/nar/gkn613

Adaptations: axes and units converted from millimeters/Z-up to meters/Y-up; translated to rest at the stage; geometry simplified using meshoptimizer with 0.2% relative error limit per structure; normals quantized to signed 16-bit; packed into binary chunks; curated display system groupings and colors. The source contains 2,234 individual OBJ meshes; all remain represented. The combined hierarchy contains 3,432 named FMA concepts, which may reference multiple meshes. Original source identity is preserved in the manifest.

Source OBJ comments mention an older CC BY-SA 2.1 Japan license. The official current database license linked above supersedes that legacy text and explicitly permits redistribution and adaptation under CC BY 4.0.

BodyParts3D represents an adult male reference anatomy based on TARO MRI and anatomical illustration refinements. It is not a complete model of every possible human anatomical structure or variation. This interface is educational and is not a clinical tool.

## Female reference anatomy

Kristen Browne and Heidi Schlehlein, Human Reference Atlas / HuBMAP, *3D Reference Organ Set for Female* (2023-2026). CC BY 4.0. Geometry adapted for this viewer. The viewer packages release **v1.10**, with eight pelvic structures carried over from **v1.5** as described below.

- Citation: Browne, Kristen, and Heidi Schlehlein. *3D Reference Organ Set for Female, v1.10*. HuBMAP, 2026. Dataset DOI `10.48539/HBM637.DWBM.744` (not yet resolving at the time of writing).
- Built on the Visible Human Dataset of the U.S. National Library of Medicine: Spitzer, Victor M., and David G. Whitlock. "The Visible Human Dataset: The Anatomical Platform for Human Simulation." *The Anatomical Record* 253, no. 2 (2002): 49-57.
- Reference library: https://humanatlas.io/3d-reference-library
- Original GLB: https://cdn.humanatlas.io/digital-objects/ref-organ/united-female/v1.10/assets/3d-vh-f-united.glb
- Supplement GLB: https://cdn.humanatlas.io/digital-objects/ref-organ/united-female/v1.5/assets/3d-vh-f-united.glb
- License: https://creativecommons.org/licenses/by/4.0/

Adaptations: node transforms baked and the native meter/Y-up coordinates translated onto the stage, coincident vertices welded and source normals averaged, geometry simplified with a 0.2% per-structure relative error bound, and normals quantized. Display systems follow the ten system nodes in the source scene graph, with the circulatory, nervous, skeletal, and reproductive subtrees split further to match the viewer's systems; colors are curated for this interface. A small number of source names carry spelling errors, which are corrected for display only. All 964 source meshes are represented, and the named source nodes become 1,173 selectable individual or compound concepts; a few collapse where a parent repeats its child's label and membership.

Release v1.10 dropped the ischium and pubis meshes that v1.5 carried. Because the bone geometry of the two releases is identical in world space — every shared skeletal structure matches to within floating-point noise — those eight pieces are taken from v1.5 and placed unmodified alongside the v1.10 geometry, rather than being fitted or approximated. The converter takes only the names listed in `CARRIED_OVER` in `scripts/anatomy-female-systems.mjs`, and a restored subtree contributes only its own concepts, so it never duplicates a group the current release already names. The pelvis is the most sexually dimorphic part of the skeleton, which is why the loss was worth reversing.

This is a reference assembly with whole-body surface and selected organs, including female reproductive anatomy. Its skeleton covers the vertebrae, sternum and manubrium, pelvis, and knee bones; there is no skull, rib, arm, hand, or foot bone in the source at any release. Its muscle coverage is limited to the eye and knee. It is not a complete model of every human structure or a single-person scan. Eight placenta and umbilical structures are classified under Pregnancy reference and hidden by default.

The two reference bodies come from separate projects and are not directly comparable in coverage or level of detail.

## Female lower-limb muscle

Thor E. Andreassen, Donald R. Hume, Landon D. Hamilton, Karen E. Walker, Sean E. Higinbotham, and Kevin B. Shelburne, *Three Dimensional Lower Extremity Musculoskeletal Geometry of the Visible Human Female and Male*, Scientific Data 10, 34 (2023). CC BY 4.0.

- Publication: https://doi.org/10.1038/s41597-022-01905-2
- Dataset: https://digitalcommons.du.edu/visiblehuman/1/ and https://simtk.org/projects/3d-vh-geometry
- Package used: `Final 3D STL Models-stl.zip` (Visible Human Female)
- License: https://creativecommons.org/licenses/by/4.0/
- Underlying imagery: the Visible Human Project, U.S. National Library of Medicine.

76 lower-limb muscles from this set are added to the female reference body, which models almost no muscle of its own. They are a second woman's anatomy, not this body's, and are shown in a display system of their own that is switched off by default.

Adaptations: millimetres converted to metres; each group of muscles placed by a least-squares fit of a uniform scale and a translation onto the hip bone, femur, patella, tibia, and fibula that both bodies model, group by group so that a difference in limb posture between the two women does not carry through; the rotation between the two coordinate systems settled once for the whole import from the centres of all twelve shared bones, rather than per group from bounding boxes, which cannot distinguish a structure from an inverted one; vertices welded from the source triangle soup, normals derived and quantized, geometry simplified to the same 0.2% per-structure bound as the rest of the viewer. Fitted scales are 0.98 to 1.01 and the shared bones agree to within 17 to 36 mm. Placement is checked anatomically as well: gluteus medius ends 7 mm below the top of the pelvis here against 6 mm in the donor, and gluteus maximus 30 mm against 36 mm. Muscle names are expanded from the source file names, with four source misspellings corrected for display.

The bones, cartilage, and ligaments of this set are not used: the female reference already models the leg bones and the knee ligaments, and the donor's are not needed. No open female source covers the upper limb, so the arms carry borrowed male bone and no muscle.

## Structures borrowed between the two bodies

The female source models no skull, ribs, shoulder girdle, arm, or foot bones. 180 such bones are copied from the BodyParts3D male reference credited above, kept in a display system labelled Male-derived bones, drawn in a distinct colour, and switched off by default. Only bones are taken. Muscle carries the shape of the body it came from far more plainly than bone does, so no male muscle is placed on this body. Both sources are CC BY 4.0, so this redistribution carries the attribution of both.

Adaptations: each borrowed region is placed by a least-squares fit of a uniform scale and a translation, computed from the bounding boxes of structures both bodies model — the skull from the cervical vertebrae and the brain, the ribs from the thoracic vertebrae and sternum, the shoulder and arm from the upper thorax, each foot from the tibia and fibula of its own leg. Each limb is then turned about its own joint — the shoulder for an arm, the ankle for a foot — until it runs along the corresponding limb of the female body surface, since the two bodies do not stand in the same pose. The turn is measured by comparing the long axis of each limb's surface on the two bodies, and is 17 to 23 degrees. A bone turns as one rigid piece about the centre of its rounded joint end, so the joint stays seated. Nothing is distorted, every anchor lands within 25 mm, and each borrowed structure keeps the identifier of the male mesh it came from. Per-region scales and residuals are recorded in the manifest.

These bones are a placeholder for shape and position. They are one man's anatomy shown on a woman's body: they carry none of the skeletal differences between the sexes outside the pelvis, which is the female source's own, and the borrowed arms keep the donor's posture rather than the posture of the female body surface. They should be removed once a complete female source is available.

## Arabic anatomical vocabulary

Arabic names for anatomical structures are taken from **Wikidata**, dedicated to the public domain under **CC0 1.0**, by joining each concept's Foundational Model of Anatomy identifier to the same identifier recorded on Wikidata items.

- Source: https://www.wikidata.org/ (property P1402, Foundational Model of Anatomy ID)
- License: https://creativecommons.org/publicdomain/zero/1.0/
- Build script: `scripts/fetch-arabic-terms.mjs`, cache in `scripts/arabic-wikidata.cache.json`

Adaptations: terms the join misses are composed from a base term it found, adding the side or the ordinal with Arabic agreement — gender taken from the head noun of the phrase, and the definite article added when the phrase is definite by its own article or by annexation. Roughly 300 terms are corrected or supplied by hand in `scripts/arabic-review.json`, which is applied before composition so that every variant is built from the corrected base.

Standard Arabic medical references, including the Unified Medical Dictionary (WHO EMRO and Librairie du Liban), were consulted to check individual terms. No term list was extracted from them: they carry no open licence, and only the individual factual equivalences were used, not the compilation. Structures the vocabulary does not cover are shown in English rather than guessed at.

Interface text, system descriptions, and the per-structure descriptions in Arabic were written for this project and carry the same licence as the rest of the source.
