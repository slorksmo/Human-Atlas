import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync} from 'node:fs';
import {parseArgs} from 'node:util';

const root = new URL('../', import.meta.url);
const read = path => JSON.parse(readFileSync(new URL(path, root), 'utf8'));
const config = read('docs/anatomy-research.json');
const {values} = parseArgs({options:{
  discover:{type:'boolean'},
  output:{type:'string'},
  baseline:{type:'string'},
}});

function inventory(path) {
  const {parts, concepts} = read(path);
  const systems = {};
  for (const part of parts) systems[part.system] = (systems[part.system] ?? 0) + 1;
  const coverage = config.coverage.map(entry => {
    const mesh = new RegExp(entry.mesh, 'i');
    const concept = new RegExp(entry.concept, 'i');
    return {
      name: entry.name,
      meshes: parts.filter(p => mesh.test(p.name)).map(({id,name,system}) => ({id,name,system})),
      concepts: concepts.filter(p => concept.test(p.name)).map(({id,name}) => ({id,name})),
    };
  });
  return {meshes:parts.length, concepts:concepts.length, systems, coverage};
}

async function fetchMetadata(url) {
  const response = await fetch(url, {
    headers:{'User-Agent':'Human-Atlas-source-audit'},
    signal:AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response;
}

function assertUnique(items, field) {
  assert.ok(items.length);
  assert.equal(new Set(items.map(item=>item[field])).size, items.length, `Duplicate ${field}`);
}

assertUnique(config.coverage, 'name');
assertUnique(config.watch, 'id');
assertUnique(config.searches, 'id');
const report = {
  checkedAt: new Date().toISOString(),
  inventory: {
    male: inventory('public/models/atlas.json'),
    female: inventory('public/models/atlas-female.json'),
  },
};

if (values.discover) {
  const baseline = values.baseline ? JSON.parse(readFileSync(values.baseline,'utf8')) : {};
  const today = new Date();
  const since = new Date(today.getTime() - 180 * 86400000).toISOString().slice(0,10);
  const observed = await Promise.all(config.watch.map(async ({id,url,format,field}) => {
    try {
      const response = await fetchMetadata(url);
      const value = format === 'sha256'
        ? createHash('sha256').update(await response.text()).digest('hex')
        : (await response.json())[field];
      assert.ok(typeof value === 'string' && value.length, 'Missing metadata value');
      const previous = baseline[id];
      const status = previous == null ? 'first-observation' : previous === value ? 'unchanged' : 'changed';
      return {id,url,value,previous,status};
    } catch (error) {
      return {id,url,status:'error',error:error.message};
    }
  }));
  const leads = await Promise.all(config.searches.map(async ({id,query}) => {
    const search = new URL('https://api.datacite.org/dois');
    search.search = new URLSearchParams({
      query:`(${query}) AND created:[${since} TO ${today.toISOString().slice(0,10)}]`,
      'resource-type-id':'dataset', 'page[size]':'8', sort:'-created',
    });
    try {
      const data = await (await fetchMetadata(search)).json();
      return {id,query,since,count:data.meta.total,leads:data.data.map(({attributes:item})=>({
        title:item.titles?.[0]?.title,
        registered:item.registered,
        url:`https://doi.org/${item.doi}`,
        reportedRights:item.rightsList?.map(right=>right.rightsIdentifier ?? right.rights) ?? [],
      }))};
    } catch (error) {
      return {id,query,since,error:error.message};
    }
  }));
  report.discovery = {observed,leads};
  const failures = [...observed,...leads].filter(item=>item.error);
  if (failures.length) {
    console.error(`Discovery incomplete: ${failures.map(item=>item.id).join(', ')}`);
    process.exitCode = 1;
  }
}

const json = JSON.stringify(report,null,2)+'\n';
if (values.output) writeFileSync(values.output,json);
else process.stdout.write(json);
