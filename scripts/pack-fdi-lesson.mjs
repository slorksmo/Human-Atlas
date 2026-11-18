import assert from 'node:assert/strict';
import {readFileSync, writeFileSync} from 'node:fs';
import {gunzipSync, gzipSync} from 'node:zlib';
import {TOURS} from '../app/study.ts';

const models = new URL('../public/models/', import.meta.url);
const lesson = TOURS.find(tour => tour.id === 'fdi-notation');
const check = process.argv.includes('--check');
assert.ok(lesson);

function output(filename, data) {
  const path = new URL(filename, models);
  if (check) {
    assert.ok(readFileSync(path).equals(Buffer.from(data)), `${filename} is stale. Run node scripts/pack-fdi-lesson.mjs.`);
  } else {
    writeFileSync(path, data);
  }
}

for (const sex of ['male', 'female']) {
  const filename = sex === 'male' ? 'atlas.json' : 'atlas-female.json';
  const atlas = JSON.parse(readFileSync(new URL(filename, models), 'utf8'));
  const concepts = lesson.steps.map(({concept}) => {
    const match = atlas.concepts.find(item => item.name.toLowerCase() === concept.toLowerCase());
    assert.ok(match, `${filename}: ${concept} is missing`);
    return match;
  });
  const ids = new Set(concepts.flatMap(concept => concept.elements));
  const sources = new Map();
  const pieces = [];
  let bytes = 0;
  const parts = atlas.parts.filter(part => ids.has(part.id)).map(part => {
    if (!sources.has(part.chunk)) {
      sources.set(part.chunk, readFileSync(new URL(atlas.chunks[part.chunk].url.split('/').pop(), models)));
    }
    const source = sources.get(part.chunk);
    const take = (offset, length) => {
      assert.ok(offset >= 0 && offset + length <= source.length);
      const padding = (4 - bytes % 4) % 4;
      if (padding) pieces.push(Buffer.alloc(padding));
      const start = bytes + padding;
      pieces.push(source.subarray(offset, offset + length));
      bytes = start + length;
      return start;
    };
    return {
      ...part,
      chunk: 0,
      positions: take(part.positions, part.vertexCount * 12),
      normals: take(part.normals, part.vertexCount * 6),
      indices: take(part.indices, part.indexCount * 4),
    };
  });
  assert.equal(parts.length, ids.size);
  const geometry = Buffer.concat(pieces);
  const prefix = `fdi-${sex}`;
  const compressed = check
    ? readFileSync(new URL(`${prefix}.bin.gz`, models))
    : gzipSync(geometry, {level: 9});
  const manifest = {
    version: atlas.version,
    sex,
    concepts,
    parts,
    triangles: parts.reduce((sum, part) => sum + part.indexCount / 3, 0),
    chunks: [{url: `/models/${prefix}.bin`, bytes, gzip: `/models/${prefix}.bin.gz`, gzipBytes: compressed.length}],
  };
  output(`${prefix}.json`, JSON.stringify(manifest) + '\n');
  output(`${prefix}.bin`, geometry);
  // Compare decompressed data so gzip headers and zlib versions may vary across platforms.
  if (check) {
    assert.ok(gunzipSync(compressed).equals(geometry));
  } else {
    output(`${prefix}.bin.gz`, compressed);
  }
  console.log(`${sex}: ${parts.length} lesson meshes, ${compressed.length} compressed geometry bytes`);
}
