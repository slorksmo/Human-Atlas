# Female anatomy — native skeleton integration inventory

Status: research and integration plan only. No production model assets or viewer code are changed by this document.

## Current viewer baseline

Audited from `public/models/atlas-female.json` on the `feat/atlas-visible-skin-layer` branch.

- 1,220 total mesh parts across 18 viewer systems.
- 65 parts are currently classified as the female source's `skeletal` system.
- 180 additional parts are in the explicitly named `borrowed` system. The project README documents these as borrowed from the male reference model to fill gaps (skull/face, ribs, shoulder/arm/hand and feet/ankles).
- 76 lower-limb muscle meshes are in `donor-muscle`, sourced from a second female Visible Human subject.
- The native female source describes its scope as: "Whole-body surface with selected organs. Skeletal and muscular coverage is partial."

The 65 skeletal parts are not 65 complete bones in a simple one-to-one sense: the source includes separate compact/spongy bone regions and anatomical subregions (for example femoral condyles and grooves). They must not be compared directly to a count of whole-bone labels.

## Candidate female-native source

**BoneHub — Visible Human Full-Skeleton 3D Bone Models**

- Dataset: https://huggingface.co/datasets/BoneHub/visible-human-3d-models
- Interactive demo: https://bonehub.github.io/Educational-Atlas/
- License: CC BY 4.0, with attribution and citation required.
- Female subject: 143 individually labeled skeletal segmentation labels from whole-body CT.
- Available geometry: per-label STL surface meshes; also segmentation masks and IGES/STEP CAD surfaces.
- Folder organization: `CT/Mesh/02_Female/`, grouped by skull, spinal column, thorax, upper/lower extremities, hands and feet.
- Dataset documentation says phalanges are grouped, as are the skull, sternum and sacrum (the sacrum label includes coccyx). Therefore "143 labels" must not be advertised as 143 separate individual bones.
- The dataset is approximately 5.33 GB as a whole. Do not download or vendor the entire dataset into the web app; retrieve only the female STL files needed after inventory and size checks.

Citations to preserve in project attribution:
1. Alavi, S. H. & Asseln, M. (2026). *Visible-Human-3d-Models* [Dataset]. https://doi.org/10.57967/hf/10464
2. Andreassen, T. E. et al. (2023). *Three Dimensional Lower Extremity Musculoskeletal Geometry of the Visible Human Female and Male*. Scientific Data, 10, 34. https://doi.org/10.1038/s41597-022-01905-2

## Integration plan — do not bulk-replace yet

1. Build a normalized inventory of all 143 female source labels, preserving the original source label, file path, laterality, and region.
2. Crosswalk each label against the 65 native female skeletal parts and 180 borrowed meshes using anatomical identity, not just string similarity.
3. Classify each candidate as:
   - native female geometry already present (keep existing source);
   - missing female geometry (candidate for import);
   - partial overlap or sub-region (manual review; do not duplicate);
   - source grouping differs (e.g. grouped phalanges; retain source grouping or split only if geometrically valid);
   - non-bone or excluded structure (do not import as bone).
4. Check coordinate axes, units, origin, scale, orientation, mesh winding/normals, topology, and fit against the female body surface and existing organs. Validate bilateral placement separately.
5. Replace borrowed male bone geometry only after the female-native counterpart passes fit and visual review. Keep the borrowed layer available as a fallback until validation is complete.
6. Preserve the donor/source metadata on every imported mesh and add the CC BY 4.0 attribution and both citations to the project.
7. Run build and preview checks before proposing a PR. Do not merge or deploy to production without explicit approval.

## Important source limitations

- The 143 labels are CT-derived bone geometry, not a full soft-tissue atlas.
- The dataset README explicitly notes that costal cartilages are not included.
- CT bone models do not provide the missing female muscles, tendons, ligaments, nerves or vessels. Those require separately sourced, anatomically appropriate datasets.
- The Visible Human Female is one cadaveric reference subject; it does not represent all female anatomy or population variation.
- The dataset is for educational use, not diagnosis or treatment planning.

## Next implementation gate

Do not write imported STL files into `public/models` until the crosswalk and per-file download sizes are reviewed. The first code change should add a source manifest and a small pilot subset (one region) on a dedicated feature branch, then validate the rendered alignment in a preview.
