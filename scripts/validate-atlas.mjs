import fs from 'node:fs';
import assert from 'node:assert/strict';
// Each reference body ships a fixed inventory; a drift in either is a build fault.
const EXPECTED={'atlas.json':{parts:2234,concepts:3432},'atlas-female.json':{parts:1220,concepts:1439}};
const filename=process.argv[2]??'atlas.json';
const base=new URL('../public/models/',import.meta.url),atlas=JSON.parse(fs.readFileSync(new URL(filename,base)));
const expected=EXPECTED[filename];assert.ok(expected,`No expected inventory recorded for ${filename}.`);
assert.equal(atlas.parts.length,expected.parts);assert.equal(atlas.concepts.length,expected.concepts);
const ids=new Set(atlas.parts.map(p=>p.id));assert.equal(ids.size,expected.parts);
const files=atlas.chunks.map(c=>{const b=fs.readFileSync(new URL(c.url.split('/').pop(),base));assert.equal(b.length,c.bytes);return b;});
let tris=0;
for(const p of atlas.parts){assert.ok(p.name.trim()&&p.name!=='-'&&!p.name.includes('Bounds('));assert.ok(p.conceptId!=='-');assert.ok(p.system);const b=files[p.chunk];assert.ok(p.indices+p.indexCount*4<=b.length);const pos=new Float32Array(b.buffer,b.byteOffset+p.positions,p.vertexCount*3),indices=new Uint32Array(b.buffer,b.byteOffset+p.indices,p.indexCount);assert.ok(indices.length>=3);for(const i of indices)assert.ok(i<p.vertexCount,`${p.id}: invalid vertex`);for(const value of pos)assert.ok(Number.isFinite(value));tris+=p.indexCount/3;}
for(const c of atlas.concepts){assert.ok(c.elements.length);for(const id of c.elements)assert.ok(ids.has(id),`${c.id}: missing ${id}`);}
assert.equal(tris,atlas.triangles);
console.log(`Verified ${ids.size} individually indexed meshes, ${atlas.concepts.length} complete concept mappings, ${tris.toLocaleString()} triangles, and every binary buffer.`);
