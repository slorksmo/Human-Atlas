/** Convert the Human Reference Atlas united female GLB into viewer chunks.
 * Usage: node scripts/convert-anatomy-glb.mjs SOURCE.glb [--supplement OLDER.glb] [--dump]
 * Source and attribution: public/ATTRIBUTION.md. Source coordinates are already
 * meters/Y-up; node transforms are baked, the assembly is rested on the stage,
 * normals become signed 16-bit, and parts are grouped into chunks.
 *
 * A supplement restores structures an earlier release of the same reference body
 * carried and the current one dropped. Only the names listed in CARRIED_OVER are
 * taken, and bone geometry is identical between those releases, so the restored
 * pieces land in the same coordinate frame rather than being fitted to it.
 */
import fs from 'node:fs';
import {CARRIED_OVER,classify,label,conceptId} from './anatomy-female-systems.mjs';

const positional=process.argv.slice(2).filter(a=>!a.startsWith('--'));
const dump=process.argv.includes('--dump');
const supplements=process.argv.reduce((list,a,i)=>a==='--supplement'&&process.argv[i+1]?[...list,process.argv[i+1]]:list,[]);
const input=positional[0];
if(!input){console.error('Usage: node scripts/convert-anatomy-glb.mjs SOURCE.glb [--supplement OLDER.glb] [--dump]');process.exit(1);}
const out=new URL('../public/models/',import.meta.url);
fs.mkdirSync(out,{recursive:true});

// --- GLB container -------------------------------------------------------
const COMPONENTS={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16};
const WIDTH={5120:1,5121:1,5122:2,5123:2,5125:4,5126:4};
const STORE={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array};
function open(path){
 const file=fs.readFileSync(path);
 if(file.length<12||file.readUInt32LE(0)!==0x46546c67)throw new Error(`${path} is not a GLB file.`);
 let cursor=12,json=null,bin=null;
 while(cursor+8<=file.length){
  const length=file.readUInt32LE(cursor),type=file.readUInt32LE(cursor+4),body=file.subarray(cursor+8,cursor+8+length);
  if(type===0x4e4f534a)json=JSON.parse(body.toString('utf8'));
  else if(type===0x004e4942)bin=body;
  cursor+=8+length;
 }
 if(!json||!bin)throw new Error(`${path} is missing its JSON or binary chunk.`);
 const data=new DataView(bin.buffer,bin.byteOffset,bin.byteLength);
 const READ={5120:o=>data.getInt8(o),5121:o=>data.getUint8(o),5122:o=>data.getInt16(o,true),5123:o=>data.getUint16(o,true),5125:o=>data.getUint32(o,true),5126:o=>data.getFloat32(o,true)};
 const accessor=index=>{
  const a=json.accessors[index],size=COMPONENTS[a.type],width=WIDTH[a.componentType],read=READ[a.componentType];
  const values=new STORE[a.componentType](a.count*size);
  if(a.bufferView===undefined)return values;
  const view=json.bufferViews[a.bufferView],base=(view.byteOffset??0)+(a.byteOffset??0),stride=view.byteStride??size*width;
  for(let i=0;i<a.count;i++){const at=base+i*stride;for(let c=0;c<size;c++)values[i*size+c]=read(at+c*width);}
  return values;
 };
 return {json,accessor};
}

// --- transforms (column-major, as glTF stores them) ----------------------
const IDENTITY=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
function local(node){
 if(node.matrix)return node.matrix.slice();
 const t=node.translation??[0,0,0],r=node.rotation??[0,0,0,1],s=node.scale??[1,1,1];
 const x=r[0],y=r[1],z=r[2],w=r[3];
 const x2=x+x,y2=y+y,z2=z+z,xx=x*x2,xy=x*y2,xz=x*z2,yy=y*y2,yz=y*z2,zz=z*z2,wx=w*x2,wy=w*y2,wz=w*z2;
 return [(1-(yy+zz))*s[0],(xy+wz)*s[0],(xz-wy)*s[0],0,
         (xy-wz)*s[1],(1-(xx+zz))*s[1],(yz+wx)*s[1],0,
         (xz+wy)*s[2],(yz-wx)*s[2],(1-(xx+yy))*s[2],0,
         t[0],t[1],t[2],1];
}
function multiply(a,b){
 const r=new Array(16);
 for(let c=0;c<4;c++)for(let row=0;row<4;row++)r[c*4+row]=a[row]*b[c*4]+a[4+row]*b[c*4+1]+a[8+row]*b[c*4+2]+a[12+row]*b[c*4+3];
 return r;
}
const point=(m,x,y,z)=>[m[0]*x+m[4]*y+m[8]*z+m[12],m[1]*x+m[5]*y+m[9]*z+m[13],m[2]*x+m[6]*y+m[10]*z+m[14]];
/** Normals need the inverse transpose; HRA transforms carry uniform scale, so the
 * rotation block is enough once each normal is renormalized. */
const direction=(m,x,y,z)=>[m[0]*x+m[4]*y+m[8]*z,m[1]*x+m[5]*y+m[9]*z,m[2]*x+m[6]*y+m[10]*z];

// --- scene walk ----------------------------------------------------------
const drawables=[];  // one per node primitive carrying geometry
const grouping=[];   // one per named node, listing the drawables beneath it
/** `wanted` limits a supplement to named subtrees we mean to restore. */
function collect(document,tag,wanted){
 const {json}=document,nodes=json.nodes??[],scene=json.scenes?.[json.scene??0];
 const walk=(index,parent,ancestry,keeping)=>{
  const node=nodes[index],world=multiply(parent,local(node));
  const inherited=node.name?[...ancestry,node.name]:ancestry;
  const keep=keeping||!wanted||(node.name&&wanted.has(node.name));
  const own=[];
  if(keep&&node.mesh!==undefined)for(const primitive of json.meshes[node.mesh].primitives??[]){
   if(primitive.attributes?.POSITION===undefined)continue;
   if(primitive.mode!==undefined&&primitive.mode!==4)continue;
   const id=`HRAF${String(drawables.length).padStart(4,'0')}`;
   drawables.push({id,document,node:`${tag}:${index}`,name:node.name??json.meshes[node.mesh].name??`mesh ${index}`,ancestry:inherited,primitive,world});
   own.push(id);
  }
  for(const child of node.children??[])own.push(...walk(child,world,inherited,keep));
  // A supplement contributes concepts only from inside the subtrees it restores,
  // so its ancestors never duplicate a group the primary source already names.
  if(node.name&&own.length&&keep)grouping.push({node:`${tag}:${index}`,name:node.name,elements:own});
  return own;
 };
 for(const root of scene?.nodes??nodes.map((_,i)=>i))walk(root,IDENTITY,[],false);
}
collect(open(input),'primary',null);
const present=new Set(drawables.map(d=>d.name));
for(const [n,path] of supplements.entries()){
 const restore=new Set([...CARRIED_OVER].filter(name=>!present.has(name)));
 const before=drawables.length;
 collect(open(path),`supplement${n}`,restore);
 console.error(`Restored ${drawables.length-before} structures from ${path}.`);
}

if(dump){
 console.log(JSON.stringify({drawables:drawables.length,namedNodes:grouping.length,
  paths:drawables.map(d=>d.ancestry.join('/')).sort(),
  groups:[...new Set(grouping.map(g=>g.name))].sort()},null,1));
 process.exit(0);
}

// --- concepts ------------------------------------------------------------
/** Named source nodes become concepts: a leaf selects one mesh, a parent selects
 * everything beneath it. The walk is post-order, so a leaf claims its identifier
 * before any ancestor that repeats the same label and membership. */
const concepts=[],taken=new Set(),conceptOfNode=new Map(),byMembership=new Map();
for(const group of grouping){
 const name=label(group.name),membership=`${name}|${group.elements.join(',')}`;
 const existing=byMembership.get(membership);
 if(existing!==undefined){conceptOfNode.set(group.node,existing);continue;}
 let id=conceptId(group.name);
 for(let n=2;taken.has(id);n++)id=`${conceptId(group.name)}#${n}`;
 taken.add(id);byMembership.set(membership,id);conceptOfNode.set(group.node,id);
 concepts.push({id,name,elements:group.elements});
}

// --- stage placement -----------------------------------------------------
/** Rest the assembly on the stage using accessor bounds before touching vertices. */
const low=[Infinity,Infinity,Infinity],high=[-Infinity,-Infinity,-Infinity];
for(const d of drawables){
 const a=d.document.json.accessors[d.primitive.attributes.POSITION];
 if(!a.min||!a.max)continue;
 for(let corner=0;corner<8;corner++){
  const p=point(d.world,corner&1?a.max[0]:a.min[0],corner&2?a.max[1]:a.min[1],corner&4?a.max[2]:a.min[2]);
  for(let i=0;i<3;i++){low[i]=Math.min(low[i],p[i]);high[i]=Math.max(high[i],p[i]);}
 }
}
const shift=[-(low[0]+high[0])/2,-low[1],-(low[2]+high[2])/2];

// --- geometry ------------------------------------------------------------
const parts=[],chunks=[];let segments=[],size=0,chunk=0,triangles=0;
const append=array=>{
 const padding=(4-size%4)%4;if(padding){segments.push(Buffer.alloc(padding));size+=padding;}
 const offset=size,buffer=Buffer.from(array.buffer,array.byteOffset,array.byteLength);
 segments.push(buffer);size+=buffer.length;return offset;
};
const flush=()=>{
 if(!size)return;
 const name=`anatomy-female-${chunk}.bin`;
 fs.writeFileSync(new URL(name,out),Buffer.concat(segments));
 chunks.push({url:`/models/${name}`,bytes:size});segments=[];size=0;chunk++;
};
for(const d of drawables){
 const read=d.document.accessor;
 const source=read(d.primitive.attributes.POSITION),count=source.length/3;
 const sourceNormals=d.primitive.attributes.NORMAL!==undefined?read(d.primitive.attributes.NORMAL):null;
 const positions=new Float32Array(count*3),normals=new Int16Array(count*3);
 const bounds=[[Infinity,Infinity,Infinity],[-Infinity,-Infinity,-Infinity]];
 for(let i=0;i<count;i++){
  const p=point(d.world,source[i*3],source[i*3+1],source[i*3+2]);
  for(let a=0;a<3;a++){const v=p[a]+shift[a];positions[i*3+a]=v;bounds[0][a]=Math.min(bounds[0][a],v);bounds[1][a]=Math.max(bounds[1][a],v);}
 }
 let indices;
 if(d.primitive.indices!==undefined){const raw=read(d.primitive.indices);indices=raw instanceof Uint32Array?raw:Uint32Array.from(raw);}
 else indices=Uint32Array.from({length:count},(_,i)=>i);
 if(!indices.length||indices.length%3)throw new Error(`${d.id}: geometry is not triangulated.`);
 if(sourceNormals){
  for(let i=0;i<count;i++){
   const n=direction(d.world,sourceNormals[i*3],sourceNormals[i*3+1],sourceNormals[i*3+2]);
   const length=Math.hypot(n[0],n[1],n[2])||1;
   for(let a=0;a<3;a++)normals[i*3+a]=Math.max(-32767,Math.min(32767,Math.round(n[a]/length*32767)));
  }
 }else{
  // Derive vertex normals so unshaded HRA primitives still light correctly.
  const accumulated=new Float64Array(count*3);
  for(let i=0;i<indices.length;i+=3){
   const a=indices[i],b=indices[i+1],c=indices[i+2];
   const ux=positions[b*3]-positions[a*3],uy=positions[b*3+1]-positions[a*3+1],uz=positions[b*3+2]-positions[a*3+2];
   const vx=positions[c*3]-positions[a*3],vy=positions[c*3+1]-positions[a*3+1],vz=positions[c*3+2]-positions[a*3+2];
   const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;
   for(const v of [a,b,c]){accumulated[v*3]+=nx;accumulated[v*3+1]+=ny;accumulated[v*3+2]+=nz;}
  }
  for(let i=0;i<count;i++){
   const length=Math.hypot(accumulated[i*3],accumulated[i*3+1],accumulated[i*3+2])||1;
   for(let a=0;a<3;a++)normals[i*3+a]=Math.round(accumulated[i*3+a]/length*32767);
  }
 }
 if(size>7_000_000)flush();
 const positionOffset=append(positions),normalOffset=append(normals),indexOffset=append(indices);
 parts.push({id:d.id,name:label(d.name),conceptId:conceptOfNode.get(d.node)??`HRA:${d.id}`,system:classify(d.name,d.ancestry),chunk,
  positions:positionOffset,normals:normalOffset,indices:indexOffset,vertexCount:count,indexCount:indices.length,bounds});
 triangles+=indices.length/3;
}
flush();

// A mesh hanging off an unnamed node still needs a concept of its own.
for(const p of parts)if(!taken.has(p.conceptId)){taken.add(p.conceptId);concepts.push({id:p.conceptId,name:p.name,elements:[p.id]});}

const manifest={version:'Human Reference Atlas female v1.10',sex:'female',
 source:'https://lod.humanatlas.io/ref-organ/united-female/v1.10',
 scope:'Whole-body surface with selected organs. Skeletal and muscular coverage is partial.',
 parts,concepts,chunks,triangles};
fs.writeFileSync(new URL('atlas-female.json',out),JSON.stringify(manifest));
console.log(JSON.stringify({parts:parts.length,concepts:concepts.length,triangles,
 bytes:chunks.reduce((n,c)=>n+c.bytes,0),chunks:chunks.length,
 height:+(high[1]-low[1]).toFixed(3),
 systems:Object.fromEntries([...parts.reduce((m,p)=>m.set(p.system,(m.get(p.system)??0)+1),new Map())].sort((a,b)=>b[1]-a[1]))},null,1));
