/** Add female lower-limb muscle from the Visible Human Female to the female atlas.
 * Usage: node scripts/import-lower-limb.mjs PATH_TO_STL_FOLDER [--dry]
 *
 * The Human Reference Atlas female models almost no muscle: sixteen pieces, all
 * of them in the eye and the knee. This brings in the 76 lower-limb muscles that
 * Andreassen et al. segmented from the Visible Human Female cryosections, which
 * are another woman's anatomy rather than this body's own, but a woman's.
 * Source and attribution: public/ATTRIBUTION.md.
 *
 * The two women are not the same size and were not scanned in the same position,
 * so nothing is placed by trusting a shared coordinate frame. Both bodies model
 * the hip bone, femur, patella, tibia, and fibula, and each group of muscles is
 * fitted to the bones it actually spans: the hip muscles to the pelvis, the thigh
 * to the femur, the calf to the tibia and fibula. Fitting is a rotation from the
 * donor's axes onto this body's, a uniform scale, and a translation, so muscle
 * shape is never distorted.
 *
 * Run after scripts/borrow-anatomy.mjs and before scripts/compress-models.mjs.
 */
import fs from 'node:fs';
import path from 'node:path';
import {MeshoptSimplifier} from 'meshoptimizer';
await MeshoptSimplifier.ready;

const source=process.argv[2],dry=process.argv.includes('--dry');
if(!source){console.error('Usage: node scripts/import-lower-limb.mjs PATH_TO_STL_FOLDER [--dry]');process.exit(1);}
const dir=new URL('../public/models/',import.meta.url);
const female=JSON.parse(fs.readFileSync(new URL('atlas-female.json',dir),'utf8'));
const SYSTEM='donor-muscle';

// --- STL ------------------------------------------------------------------
/** The set mixes binary and ASCII STL, so both are read. */
function readStl(file){
 const buffer=fs.readFileSync(file);
 const count=buffer.length>=84?buffer.readUInt32LE(80):0;
 const positions=[];
 if(count&&84+count*50===buffer.length){
  for(let t=0;t<count;t++){
   const at=84+t*50+12;
   for(let v=0;v<9;v++)positions.push(buffer.readFloatLE(at+v*4));
  }
 }else{
  const text=buffer.toString('latin1');
  if(!/^\s*solid/.test(text))throw new Error(`${path.basename(file)}: not an STL file.`);
  const vertex=/vertex\s+(-?[\d.eE+-]+)\s+(-?[\d.eE+-]+)\s+(-?[\d.eE+-]+)/g;
  let m;
  while((m=vertex.exec(text)))positions.push(+m[1],+m[2],+m[3]);
 }
 if(!positions.length||positions.length%9)throw new Error(`${path.basename(file)}: no triangles found.`);
 return positions;
}
const files=[];
(function walk(folder){
 for(const entry of fs.readdirSync(folder,{withFileTypes:true})){
  const at=path.join(folder,entry.name);
  if(entry.isDirectory())walk(at);
  else if(entry.name.toLowerCase().endsWith('.stl'))files.push(at);
 }
})(source);
if(!files.length)throw new Error(`No STL files under ${source}.`);
/** `VHF_Left_Muscle_GluteusMaximus_smooth.stl` -> side, kind, structure. */
const parse=file=>{
 const m=/^VHF_(Left|Right)_(Bone|Muscle|Cartilage|Ligament)_(.+?)(_smooth)?\.stl$/i.exec(path.basename(file));
 return m&&{side:m[1].toLowerCase(),kind:m[2].toLowerCase(),structure:m[3],file};
};
const donors=files.map(parse).filter(Boolean);
console.log(`read ${donors.length} donor meshes: ${['bone','muscle','cartilage','ligament'].map(k=>`${donors.filter(d=>d.kind===k).length} ${k}`).join(', ')}`);

// --- vector helpers -------------------------------------------------------
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const boxOfPoints=values=>{
 const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];
 for(let i=0;i<values.length;i+=3)for(let k=0;k<3;k++){
  lo[k]=Math.min(lo[k],values[i+k]);hi[k]=Math.max(hi[k],values[i+k]);
 }
 return {lo,hi};
};
const merge=boxes=>boxes.reduce((a,b)=>a?{lo:a.lo.map((v,k)=>Math.min(v,b.lo[k])),hi:a.hi.map((v,k)=>Math.max(v,b.hi[k]))}:b,null);
const corners=b=>Array.from({length:8},(_,c)=>[c&1?b.hi[0]:b.lo[0],c&2?b.hi[1]:b.lo[1],c&4?b.hi[2]:b.lo[2]]);
const centreOf=b=>b.lo.map((v,k)=>(v+b.hi[k])/2);

/** The 24 rotations that map the axes onto each other, which is all that is
 * needed to reconcile two anatomical conventions before the fine fit. */
const AXIS_ROTATIONS=[];
for(const [a,b,c] of [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]])
 for(const sa of [1,-1])for(const sb of [1,-1])for(const sc of [1,-1]){
  const rows=[[0,0,0],[0,0,0],[0,0,0]];
  rows[0][a]=sa;rows[1][b]=sb;rows[2][c]=sc;
  const det=rows[0][0]*(rows[1][1]*rows[2][2]-rows[1][2]*rows[2][1])
           -rows[0][1]*(rows[1][0]*rows[2][2]-rows[1][2]*rows[2][0])
           +rows[0][2]*(rows[1][0]*rows[2][1]-rows[1][1]*rows[2][0]);
  if(det>0)AXIS_ROTATIONS.push(rows);
 }
const spin=(rows,v)=>[rows[0][0]*v[0]+rows[0][1]*v[1]+rows[0][2]*v[2],
                      rows[1][0]*v[0]+rows[1][1]*v[1]+rows[1][2]*v[2],
                      rows[2][0]*v[0]+rows[2][1]*v[1]+rows[2][2]*v[2]];
/** Uniform scale and translation carrying points onto points, for a rotation
 * that has already been settled. */
function place(rows,from,onto){
 const turned=from.map(p=>spin(rows,p));
 const mean=pts=>pts.reduce((m,p)=>[m[0]+p[0]/pts.length,m[1]+p[1]/pts.length,m[2]+p[2]/pts.length],[0,0,0]);
 const a=mean(turned),b=mean(onto);
 let num=0,den=0;
 for(let i=0;i<turned.length;i++)for(let k=0;k<3;k++){
  const da=turned[i][k]-a[k],db=onto[i][k]-b[k];
  num+=da*db;den+=da*da;
 }
 const scale=den?num/den:1;
 const offset=[b[0]-scale*a[0],b[1]-scale*a[1],b[2]-scale*a[2]];
 let error=0;
 for(let i=0;i<turned.length;i++)for(let k=0;k<3;k++)
  error=Math.max(error,Math.abs(scale*turned[i][k]+offset[k]-onto[i][k]));
 return {rows,scale,offset,error};
}
/** The rotation between the two coordinate systems is a property of the sources,
 * not of any one group, so it is settled once from every bone both bodies model.
 *
 * It has to be settled on the centres of separate bones, never on the corners of
 * a bounding box: an upright box has the same corners however the structure
 * inside it is turned, so a box fit cannot tell a pelvis from an upside-down one
 * and will report a few millimetres of error either way. */
function chooseRotation(correspondences){
 let best=null;
 const from=correspondences.map(c=>c.donor),onto=correspondences.map(c=>c.own);
 for(const rows of AXIS_ROTATIONS){
  const attempt=place(rows,from,onto);
  if(!best||attempt.error<best.error)best=attempt;
 }
 return best;
}
const UPRIGHT=[[1,0,0],[0,1,0],[0,0,1]];
/** Scale and position one group with the rotation already fixed. Turning a box
 * moves its corners around, so the rotated donor box is reduced to an upright box
 * before the two are compared: corner one of an upright box always means the same
 * corner of the structure. */
function fit(rows,pairs){
 const from=[],onto=[];
 for(const {donor,own} of pairs){
  const turned=corners(donor).map(p=>spin(rows,p));
  from.push(...corners(boxOfPoints(turned.flat())));
  onto.push(...corners(own));
 }
 return {...place(UPRIGHT,from,onto),rows};
}
const apply=(t,p)=>{const q=spin(t.rows,p);return [q[0]*t.scale+t.offset[0],q[1]*t.scale+t.offset[1],q[2]*t.scale+t.offset[2]];};

// --- what each side of this body already models ---------------------------
const side=(name,which)=>which==='left'
 ?/\(left\)|(^|\s)left(\s|$)/i.test(name)
 :/\(right\)|(^|\s)right(\s|$)/i.test(name);
const ownBox=(match,which)=>{
 const parts=female.parts.filter(p=>match.test(p.name)&&side(p.name,which));
 return parts.length?merge(parts.map(p=>({lo:p.bounds[0],hi:p.bounds[1]}))):null;
};
/** The donor set is in millimetres; everything here works in metres. */
const toMetres=v=>Float64Array.from(v,x=>x/1000);
const donorBox=(structure,which)=>{
 const found=donors.filter(d=>d.side===which&&d.kind==='bone'&&new RegExp(`^${structure}$`,'i').test(d.structure));
 return found.length?merge(found.map(d=>boxOfPoints(toMetres(readStl(d.file))))):null;
};
/** Each group of muscles is fitted to the bones it spans, which both bodies model.
 * The names on this body's side are anchored, because a loose match for `pelvis`
 * finds the renal pelvis and one for `tibia` finds the tibial collateral ligament. */
const GROUPS=[
 // Hip muscles span the pelvis and the femur, so both anchor them; one box alone
 // fixes neither the turn nor the position of a group.
 {id:'hip',label:'hip',sorts:['Pelvis'],anchors:[
  {donor:'Pelvis',own:/^(ilium|ischium|pubis) (compact|spongy) bone/i},
  {donor:'Femur',own:/^femur \(/i}]},
 {id:'thigh',label:'thigh',sorts:['Femur','Patella'],anchors:[{donor:'Femur',own:/^femur \(/i},{donor:'Patella',own:/^patella \(/i}]},
 {id:'shank',label:'lower leg',sorts:['Tibia','Fibula'],anchors:[{donor:'Tibia',own:/^tibia \(/i},{donor:'Fibula',own:/^fibula \(/i}]},
];

// --- plan -----------------------------------------------------------------
/** Every bone both bodies model, as a single centre each, which is what fixes
 * the rotation between the two coordinate systems. */
const correspondences=[];
for(const which of ['left','right'])for(const group of GROUPS)for(const anchor of group.anchors){
 const donor=donorBox(anchor.donor,which),own=ownBox(anchor.own,which);
 if(donor&&own)correspondences.push({label:`${which} ${anchor.donor}`,donor:centreOf(donor),own:centreOf(own)});
}
if(correspondences.length<4)throw new Error('Too few shared bones to settle the rotation between the two sources.');
if(process.env.SHOW_ROTATIONS){
 for(const c of correspondences)console.log('   ',c.label.padEnd(16),'donor',c.donor.map(v=>+v.toFixed(3)).join(','),' own',c.own.map(v=>+v.toFixed(3)).join(','));
 const ranked=AXIS_ROTATIONS.map(rows=>place(rows,correspondences.map(c=>c.donor),correspondences.map(c=>c.own)))
  .sort((a,b)=>a.error-b.error).slice(0,5);
 for(const r of ranked)console.log('   candidate',JSON.stringify(r.rows),'scale',r.scale.toFixed(3),'error',(r.error*1000).toFixed(0),'mm');
}
const frame=chooseRotation(correspondences);
console.log(`rotation settled on ${correspondences.length} shared bones, agreeing within ${(frame.error*1000).toFixed(0)} mm`);

const plan=new Map();
for(const which of ['left','right'])for(const group of GROUPS){
 const pairs=[];
 for(const anchor of group.anchors){
  const donor=donorBox(anchor.donor,which),own=ownBox(anchor.own,which);
  if(!donor||!own){console.error(`  ${which} ${group.id}: no match for ${anchor.donor}`);continue;}
  pairs.push({donor,own});
  if(process.env.SHOW_BOXES)console.log(`   ${anchor.donor}: donor ${JSON.stringify(donor.lo.map(v=>+v.toFixed(3)))}..${JSON.stringify(donor.hi.map(v=>+v.toFixed(3)))}  own ${JSON.stringify(own.lo.map(v=>+v.toFixed(3)))}..${JSON.stringify(own.hi.map(v=>+v.toFixed(3)))}`);
 }
 if(!pairs.length){console.error(`  ${which} ${group.id}: no shared bone to fit to`);continue;}
 const t=fit(frame.rows,pairs);
 plan.set(`${which}-${group.id}`,t);
 console.log(`${which.padEnd(6)} ${group.label.padEnd(10)} scale ${t.scale.toFixed(4)}  bones agree within ${(t.error*1000).toFixed(0)} mm`);
}

/** Sort each muscle to a group by the donor bone its centre lies nearest to. */
const boneMarks=[];
for(const which of ['left','right'])for(const group of GROUPS)
 // Sorting uses the bones that mark out a region, which is not the same list as
 // the bones a region is fitted to: hip muscles are fitted to the femur as well,
 // but a muscle lying along the femur belongs to the thigh.
 for(const bone of group.sorts){
  const box=donorBox(bone,which);
  if(box)boneMarks.push({key:`${which}-${group.id}`,at:centreOf(box)});
 }
const muscles=donors.filter(d=>d.kind==='muscle');
const sorted=new Map();
for(const muscle of muscles){
 const at=centreOf(boxOfPoints(toMetres(readStl(muscle.file))));
 let key=null,best=Infinity;
 for(const mark of boneMarks){
  const d=(mark.at[0]-at[0])**2+(mark.at[1]-at[1])**2+(mark.at[2]-at[2])**2;
  if(d<best&&mark.key.startsWith(muscle.side)){best=d;key=mark.key;}
 }
 if(!key||!plan.has(key))continue;
 (sorted.get(key)??sorted.set(key,[]).get(key)).push(muscle);
}
for(const [key,list] of [...sorted].sort())console.log(`${key.padEnd(13)} ${String(list.length).padStart(2)} muscles`);
if(dry)process.exit(0);

// --- replace anything a previous run added --------------------------------
const native=female.parts.filter(p=>p.system!==SYSTEM);
if(native.length<female.parts.length){
 const keep=Math.max(...native.map(p=>p.chunk))+1;
 for(const c of female.chunks.slice(keep)){
  const name=c.url.split('/').pop();
  for(const file of [name,`${name}.gz`])fs.rmSync(new URL(file,dir),{force:true});
 }
 console.log(`replacing ${female.parts.length-native.length} muscles imported by an earlier run`);
 female.parts=native;
 female.chunks=female.chunks.slice(0,keep);
 female.concepts=female.concepts.filter(c=>!String(c.id).startsWith('VHF:'));
 female.triangles=native.reduce((n,p)=>n+p.indexCount/3,0);
 delete female.donorMuscle;
}

// --- geometry -------------------------------------------------------------
/** `GluteusMaximus` -> `Gluteus maximus`, and the source's few misspellings. */
const SPELLING={Illiacus:'Iliacus',QuadratisFemoris:'Quadratus femoris',Semitendonosus:'Semitendinosus',Calcaneous:'Calcaneus'};
const label=(structure,which)=>{
 const fixed=SPELLING[structure]??structure.replace(/([a-z])([A-Z])/g,'$1 $2');
 const text=fixed.charAt(0).toUpperCase()+fixed.slice(1).toLowerCase();
 return `${text} (${which})`;
};
const chunks=[...female.chunks];let segments=[],size=0,added=0,triangles=0;
const append=array=>{
 const padding=(4-size%4)%4;if(padding){segments.push(Buffer.alloc(padding));size+=padding;}
 const offset=size,b=Buffer.from(array.buffer,array.byteOffset,array.byteLength);
 segments.push(b);size+=b.length;return offset;
};
const flush=()=>{
 if(!size)return;
 const name=`female-${chunks.length}.bin`;
 fs.writeFileSync(new URL(name,dir),Buffer.concat(segments));
 chunks.push({url:`/models/${name}`,bytes:size});segments=[];size=0;
};
const parts=[...female.parts],concepts=[...female.concepts];
const members=new Map();
for(const [key,list] of sorted){
 const transform=plan.get(key);
 for(const muscle of list){
  const raw=toMetres(readStl(muscle.file)),count=raw.length/3;
  // STL repeats a vertex for every triangle that touches it. Welding restores a
  // shared mesh, which the viewer needs for smooth shading and a sane file size.
  const index=new Map(),positions=[];let indices=new Uint32Array(count);
  const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];
  for(let i=0;i<count;i++){
   const p=apply(transform,[raw[i*3],raw[i*3+1],raw[i*3+2]]);
   const key3=`${p[0].toFixed(6)},${p[1].toFixed(6)},${p[2].toFixed(6)}`;
   let at=index.get(key3);
   if(at===undefined){
    at=positions.length/3;index.set(key3,at);positions.push(p[0],p[1],p[2]);
    for(let k=0;k<3;k++){lo[k]=Math.min(lo[k],p[k]);hi[k]=Math.max(hi[k],p[k]);}
   }
   indices[i]=at;
  }
  // Simplify to the same bound the rest of the atlas uses, so a donor muscle
  // costs no more to download than the geometry it sits beside.
  const target=Math.max(96,Math.floor(indices.length*.22/3)*3);
  const [simplified]=MeshoptSimplifier.simplify(indices,new Float32Array(positions),3,Math.min(indices.length,target),.002);
  const [remap,kept]=MeshoptSimplifier.compactMesh(simplified);
  const packedPositions=new Float32Array(kept*3);
  for(let old=0;old<remap.length;old++){
   const n=remap[old];
   if(n!==0xffffffff)packedPositions.set(positions.slice(old*3,old*3+3),n*3);
  }
  positions.length=0;positions.push(...packedPositions);
  indices=simplified;
  const vertexCount=kept;
  const normals=new Float64Array(vertexCount*3);
  for(let t=0;t<indices.length;t+=3){
   const [a,b,c]=[indices[t],indices[t+1],indices[t+2]];
   const ux=positions[b*3]-positions[a*3],uy=positions[b*3+1]-positions[a*3+1],uz=positions[b*3+2]-positions[a*3+2];
   const vx=positions[c*3]-positions[a*3],vy=positions[c*3+1]-positions[a*3+1],vz=positions[c*3+2]-positions[a*3+2];
   const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;
   for(const v of [a,b,c]){normals[v*3]+=nx;normals[v*3+1]+=ny;normals[v*3+2]+=nz;}
  }
  const packed=new Int16Array(vertexCount*3);
  for(let i=0;i<vertexCount;i++){
   const l=Math.hypot(normals[i*3],normals[i*3+1],normals[i*3+2])||1;
   for(let k=0;k<3;k++)packed[i*3+k]=Math.round(normals[i*3+k]/l*32767);
  }
  if(size>4_000_000)flush();
  const id=`VHF${String(added).padStart(4,'0')}`,conceptId=`VHF:${muscle.side}-${muscle.structure}`;
  const po=append(Float32Array.from(positions)),no=append(packed),io=append(indices);
  const name=label(muscle.structure,muscle.side);
  parts.push({id,name,conceptId,system:SYSTEM,chunk:chunks.length,
   positions:po,normals:no,indices:io,vertexCount,indexCount:indices.length,bounds:[lo,hi]});
  concepts.push({id:conceptId,name,elements:[id]});
  const group=key.split('-')[1];
  (members.get(group)??members.set(group,[]).get(group)).push(id);
  added++;triangles+=indices.length/3;
 }
}
flush();
for(const [group,ids] of members){
 const label=GROUPS.find(g=>g.id===group)?.label??group;
 concepts.push({id:`VHF:group-${group}`,name:`Muscles of the ${label} (donor)`,elements:ids});
}
concepts.push({id:'VHF:all',name:'Leg muscles (donor)',elements:parts.filter(p=>p.system===SYSTEM).map(p=>p.id)});

female.parts=parts;female.concepts=concepts;female.chunks=chunks;
female.triangles+=triangles;
female.donorMuscle={from:'Visible Human Female lower extremity, Andreassen et al. 2023',
 muscles:added,
 method:'per-group fit of an axis rotation, a uniform scale and a translation onto the hip, femur, patella, tibia and fibula this body models',
 groups:Object.fromEntries([...plan].map(([k,t])=>[k,{scale:+t.scale.toFixed(4),boneAgreementMillimetres:+(t.error*1000).toFixed(1)}]))};
for(const p of parts)if(p.chunk>=chunks.length)throw new Error(`${p.id} points past the end of the chunk list.`);
fs.writeFileSync(new URL('atlas-female.json',dir),JSON.stringify(female));
console.log(JSON.stringify({muscles:added,triangles,totalParts:parts.length,totalConcepts:concepts.length},null,1));
