/** Fill gaps in one reference body with structures borrowed from the other.
 * Usage: node scripts/borrow-anatomy.mjs [--dry]
 *
 * The female reference models no skull, ribs, shoulder girdle, arm, or foot
 * bones. This copies those from the male reference as an explicitly labelled
 * placeholder, under a display system of its own that starts switched off.
 *
 * Only bones are borrowed. Muscle carries the shape of the body it came from far
 * more plainly than bone does, and a male limb reads as male however carefully it
 * is placed, so limb muscles and vessels are left out until a female source for
 * them exists.
 *
 * Placement is measured, not eyeballed. Both bodies model the spine, sternum,
 * pelvis, femur, tibia, fibula, and patella, so each borrowed region is fitted
 * by least squares to the bones its own attachments sit on: the skull to the
 * cervical spine, the ribs to the thoracic spine and sternum, the shoulder and
 * arm to the upper thorax, each foot to the leg above it. The fit is a uniform
 * scale and a translation, which resizes a region without distorting the shape
 * of any bone in it. A limb then gets a posture correction, because the two
 * bodies do not stand the same way: this body holds its arms further from the
 * trunk and its feet straighter than the donor does. The correction turns each
 * limb about its own joint until it runs along the limb of this body's own body
 * surface, easing in from the joint so the shoulder and ankle stay joined. Soft tissue rides on the transform of the region it belongs
 * to, and which region that is comes from geometry rather than names: a part
 * joins the limb whose bone its centre is nearest to. Borrowed structures are
 * still a different person's anatomy and never substitute for a female source.
 */
import fs from 'node:fs';

const dry=process.argv.includes('--dry');
const dir=new URL('../public/models/',import.meta.url);
const read=name=>JSON.parse(fs.readFileSync(new URL(name,dir),'utf8'));
const male=read('atlas.json'),female=read('atlas-female.json');
/** Only bones are borrowed. Matching against every part would let a name like
 * `ulna` pull in extensor carpi ulnaris and the ulnar artery as well. */
const donorBones=male.parts.filter(p=>p.system==='skeletal');
const buffers=atlas=>atlas.chunks.map(c=>fs.readFileSync(new URL(c.url.split('/').pop(),dir)));
const maleChunks=buffers(male);

// --- what to borrow, and what the female already has ---------------------
const SKIP=[
 /vertebra|sacrum|coccyx|intervertebral disk|^atlas$|^axis$/i, // the spine is modelled in both
 /manubrium|body of sternum|xiphoid/i,               // the sternum is modelled in both
 /hip bone|femur|tibia\b|fibula\b|patella/i,         // pelvis and leg are modelled in both
 /tooth|gingiva/i,                                   // the mouth is modelled in both
 /thyroid cartilage|cricoid|arytenoid|corniculate|cuneiform cartilage/i, // larynx is modelled in both
 /iliotibial|tibialis|fibularis|levator scapulae|subscapularis/i,        // soft tissue, not bone
];
/** Anchor bones carry different names in the two sources. */
const ANCHOR_IN_FEMALE={
 Atlas:'Cervical vertebra 1',Axis:'Cervical vertebra 2',
 'Third cervical vertebra':'Cervical vertebra 3','Fourth cervical vertebra':'Cervical vertebra 4',
 'Fifth cervical vertebra':'Cervical vertebra 5','Sixth cervical vertebra':'Cervical vertebra 6',
 'Seventh cervical vertebra':'Cervical vertebra 7',
 'Body of sternum':'Sternum',Manubrium:'Manubrium',
 'Left tibia':'Tibia (left)','Right tibia':'Tibia (right)',
 'Left fibula':'Fibula (left)','Right fibula':'Fibula (right)',
};
const ORDINAL=['First','Second','Third','Fourth','Fifth','Sixth','Seventh','Eighth','Ninth','Tenth','Eleventh','Twelfth'];
for(const [n,word] of ORDINAL.entries()){
 ANCHOR_IN_FEMALE[`${word} thoracic vertebra`]=`Thoracic vertebra ${n+1}`;
 if(n<6)ANCHOR_IN_FEMALE[`${word} lumbar vertebra`]=`Lumbar vertebra ${n+1}`;
}

/** An anchor is any structure both bodies model. A bone anchor is named once and
 * translated through ANCHOR_IN_FEMALE; an organ anchor selects parts on each side,
 * which lets a region be fitted to what it encloses as well as what it sits on. */
const spine=(...names)=>names.map(name=>({label:name,donor:p=>p.name===name,host:p=>p.name===ANCHOR_IN_FEMALE[name]}));
const BRAIN={label:'brain',
 donor:(p,atlas)=>atlas.concepts.find(c=>c.name.toLowerCase()==='brain')?.elements.includes(p.id),
 host:p=>p.system==='brain'};
/** Each region names the male structures to take and the structures both bodies
 * model that it attaches to or encloses, which fix its placement. */
const REGIONS=[
 {id:'skull',label:'Skull and face',
  take:/frontal bone|parietal bone|temporal bone|occipital bone|sphenoid|ethmoid|vomer|maxilla|palatine bone|nasal bone|zygomatic|mandible|hyoid|alar cartilage/i,
  // The cranium sits on the neck and encloses the brain; both bodies model both,
  // and using them together sizes the vault instead of only placing it.
  anchors:[...spine('Atlas','Axis','Third cervical vertebra','Fourth cervical vertebra','Fifth cervical vertebra','Sixth cervical vertebra','Seventh cervical vertebra'),BRAIN]},
 {id:'ribs',label:'Ribs and costal cartilage',
  take:/\brib\b|costal cartilage/i,
  anchors:spine('First thoracic vertebra','Second thoracic vertebra','Third thoracic vertebra','Fourth thoracic vertebra','Fifth thoracic vertebra','Sixth thoracic vertebra','Seventh thoracic vertebra','Eighth thoracic vertebra','Ninth thoracic vertebra','Tenth thoracic vertebra','Eleventh thoracic vertebra','Twelfth thoracic vertebra','Manubrium','Body of sternum')},
 {id:'arm',label:'Shoulder, arm and hand',
  take:/clavicle|scapula|humerus|radius|ulna|scaphoid|lunate|triquetral|pisiform|trapezium|trapezoid|capitate|hamate|metacarpal|(finger|thumb)$/i,
  anchors:spine('First thoracic vertebra','Second thoracic vertebra','Third thoracic vertebra','Fourth thoracic vertebra','Fifth thoracic vertebra','Manubrium','Body of sternum')},
 {id:'foot-left',label:'Left foot and ankle',
  take:/^(left (calcaneus|talus|cuboid bone|intermediate cuneiform bone|lateral cuneiform bone|medial cuneiform bone|first|second|third|fourth|fifth) metatarsal bone|left (calcaneus|talus|cuboid bone|intermediate cuneiform bone|lateral cuneiform bone|medial cuneiform bone))$|navicular bone of left foot|sesamoid bone of left foot|of left (big|second|third|fourth|little) toe$|^left (first|second|third|fourth|fifth) metatarsal bone$/i,
  anchors:spine('Left tibia','Left fibula')},
 {id:'foot-right',label:'Right foot and ankle',
  take:/^right (calcaneus|talus|cuboid bone|intermediate cuneiform bone|lateral cuneiform bone|medial cuneiform bone)$|navicular bone of right foot|sesamoid bone of right foot|of right (big|second|third|fourth|little) toe$|^right (first|second|third|fourth|fifth) metatarsal bone$/i,
  anchors:spine('Right tibia','Right fibula')},
];


// --- landmark geometry ---------------------------------------------------
/** The eight corners of a structure's box, so a fit sees its size as well as
 * its position. Parts sharing a name (left and right halves) merge into one box. */
const boxOf=(atlas,select)=>{
 const parts=atlas.parts.filter(p=>select(p,atlas));
 if(!parts.length)return null;
 const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];
 for(const p of parts)for(let i=0;i<3;i++){lo[i]=Math.min(lo[i],p.bounds[0][i]);hi[i]=Math.max(hi[i],p.bounds[1][i]);}
 return {lo,hi};
};
const corners=b=>Array.from({length:8},(_,c)=>[c&1?b.hi[0]:b.lo[0],c&2?b.hi[1]:b.lo[1],c&4?b.hi[2]:b.lo[2]]);
/** Least-squares uniform scale and translation carrying `from` onto `onto`. */
function fit(from,onto){
 const mean=pts=>pts.reduce((m,p)=>[m[0]+p[0]/pts.length,m[1]+p[1]/pts.length,m[2]+p[2]/pts.length],[0,0,0]);
 const a=mean(from),b=mean(onto);
 let num=0,den=0;
 for(let i=0;i<from.length;i++)for(let k=0;k<3;k++){
  const da=from[i][k]-a[k],db=onto[i][k]-b[k];
  num+=da*db;den+=da*da;
 }
 const scale=den?num/den:1;
 return {scale,offset:[b[0]-scale*a[0],b[1]-scale*a[1],b[2]-scale*a[2]]};
}

// --- undo any previous run ----------------------------------------------
/** Borrowed parts always land in chunks appended after the body's own, so the
 * body's own highest chunk marks where its geometry ends. */
const native=female.parts.filter(p=>!String(p.system).startsWith('borrowed'));
if(native.length<female.parts.length){
 const keep=Math.max(...native.map(p=>p.chunk))+1;
 // A dry run must leave the packaged geometry exactly as it found it.
 if(!dry)for(const c of female.chunks.slice(keep)){
  const name=c.url.split('/').pop();
  for(const file of [name,`${name}.gz`])fs.rmSync(new URL(file,dir),{force:true});
 }
 console.log(`replacing ${female.parts.length-native.length} structures borrowed by an earlier run`);
 female.parts=native;
 female.chunks=female.chunks.slice(0,keep);
 female.concepts=female.concepts.filter(c=>!String(c.id).startsWith('BORROWED:'));
 female.triangles=native.reduce((n,p)=>n+p.indexCount/3,0);
 delete female.borrowed;
}

// --- plan ----------------------------------------------------------------
const claimed=new Set(),plan=[];
for(const region of REGIONS){
 const from=[],onto=[];
 for(const anchor of region.anchors){
  const here=boxOf(male,anchor.donor),there=boxOf(female,anchor.host);
  if(!here||!there)throw new Error(`${region.id}: anchor "${anchor.label}" is missing from one of the bodies.`);
  from.push(...corners(here));onto.push(...corners(there));
 }
 if(from.length<16)throw new Error(`${region.id}: too few anchors to place the region.`);
 const transform=fit(from,onto);
 let error=0;
 for(let i=0;i<from.length;i++)for(let k=0;k<3;k++)error=Math.max(error,Math.abs(transform.scale*from[i][k]+transform.offset[k]-onto[i][k]));
 const parts=donorBones.filter(p=>!claimed.has(p.id)&&region.take.test(p.name)&&!SKIP.some(re=>re.test(p.name)));
 for(const p of parts)claimed.add(p.id);
 plan.push({region,transform,parts,anchorError:error});
 console.log(`${region.id.padEnd(11)} ${String(parts.length).padStart(3)} parts  scale ${transform.scale.toFixed(4)}  anchor fit within ${(error*1000).toFixed(0)} mm`);
}
const missed=donorBones.filter(p=>!claimed.has(p.id)&&!SKIP.some(re=>re.test(p.name)));
if(missed.length)console.log(`not borrowed: ${[...new Set(missed.map(p=>p.name))].join(', ')}`);
// --- placement helpers ---------------------------------------------------
const centre=p=>p.bounds[0].map((v,i)=>(v+p.bounds[1][i])/2);
const transformOf=Object.fromEntries(plan.map(({region,transform})=>[region.id,transform]));

// --- posture -------------------------------------------------------------
/** Read a part's vertices, since posture is measured from the body surface. */
function vertices(atlas,buffers,pred){
 const out=[];
 for(const p of atlas.parts.filter(pred)){
  const b=buffers[p.chunk],v=new Float32Array(b.buffer,b.byteOffset+p.positions,p.vertexCount*3);
  for(let i=0;i<p.vertexCount;i++)out.push([v[i*3],v[i*3+1],v[i*3+2]]);
 }
 return out;
}
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm=a=>{const l=Math.hypot(...a)||1;return [a[0]/l,a[1]/l,a[2]/l];};
/** An arm shows up in a height slab as whatever lies beyond the gap that
 * separates it from the trunk; a foot is simply everything below the ankle. */
const armCloud=(pts,side)=>{
 const out=[];
 for(let y=0.60;y<=1.20;y+=0.01){
  const slab=pts.filter(q=>Math.abs(q[1]-y)<0.006&&Math.sign(q[0])===side);
  if(slab.length<6)continue;
  const xs=slab.map(q=>Math.abs(q[0])).sort((a,b)=>a-b);
  let cut=null,prev=null;
  for(const x of xs){if(prev!==null&&x-prev>0.025)cut=(x+prev)/2;prev=x;}
  if(cut!==null)for(const q of slab)if(Math.abs(q[0])>cut)out.push(q);
 }
 return out;
};
const footCloud=(pts,side)=>pts.filter(q=>q[1]<0.09&&Math.sign(q[0])===side);
/** The limb's long axis, as the leading direction of its surface points. */
function axisOf(pts){
 const n=pts.length,c=[0,0,0];
 for(const q of pts)for(let k=0;k<3;k++)c[k]+=q[k]/n;
 const cov=[[0,0,0],[0,0,0],[0,0,0]];
 for(const q of pts){const d=sub(q,c);for(let a=0;a<3;a++)for(let b=0;b<3;b++)cov[a][b]+=d[a]*d[b]/n;}
 let v=[1,1,1];
 for(let it=0;it<400;it++){
  const w=[0,0,0];
  for(let a=0;a<3;a++)for(let b=0;b<3;b++)w[a]+=cov[a][b]*v[b];
  v=norm(w);
 }
 return {centre:c,axis:v[1]>0?v.map(x=>-x):v};
}
const femaleBuffers=buffers(female);
const surfaces={
 female:vertices(female,femaleBuffers,p=>p.name==='Skin'),
 male:vertices(male,maleChunks,p=>p.system==='integumentary'&&p.name==='Skin'),
};
/** Rotate `v` about `spin` by `angle` (Rodrigues). */
const turn=(v,spin,angle)=>{
 const c=Math.cos(angle),s2=Math.sin(angle),k=cross(spin,v),d=dot(spin,v)*(1-c);
 return [v[0]*c+k[0]*s2+spin[0]*d,v[1]*c+k[1]*s2+spin[1]*d,v[2]*c+k[2]*s2+spin[2]*d];
};
/** Turning a limb about its joint, easing in over `blend` so the joint holds. */
const posture=new Map();
function measure(key,cloud,side,pivot,blend){
 const here=cloud(surfaces.male,side),there=cloud(surfaces.female,side);
 if(here.length<50||there.length<50){console.error(`  ${key}: too little surface to measure posture`);return;}
 const from=axisOf(here),onto=axisOf(there);
 const base=transformOf[key.startsWith('arm')?'arm':key];
 const angle=Math.acos(Math.max(-1,Math.min(1,dot(from.axis,onto.axis))));
 const spin=cross(from.axis,onto.axis);
 if(Math.hypot(...spin)<1e-6)return;
 const axis=norm(spin);
 // Reach compares how far each limb reaches from its joint on each body. Both
 // are measured on the body surface, which is the thing the limb has to fill.
 const placed=q=>[q[0]*base.scale+base.offset[0],q[1]*base.scale+base.offset[1],q[2]*base.scale+base.offset[2]];
 const reach=(pts,move)=>pts.reduce((m,q)=>Math.max(m,Math.hypot(...sub(move?placed(q):q,pivot))),0);
 const scale=reach(there,false)/reach(here,true);
 posture.set(key,{pivot,spin:axis,angle,scale,blend});
 console.log(`${key.padEnd(11)} posture: turn ${(angle*180/Math.PI).toFixed(1)} deg about the joint, reach x${scale.toFixed(3)}`);
}
/** The shoulder is the head of the humerus once the region has been placed;
 * the ankle is the lower end of this body's own tibia. */
const placedTop=(name,base)=>{
 const box=boxOf(male,q=>q.name===name);
 return box&&[(box.lo[0]+box.hi[0])/2*base.scale+base.offset[0],box.hi[1]*base.scale+base.offset[1],(box.lo[2]+box.hi[2])/2*base.scale+base.offset[2]];
};
const ownBottom=name=>{
 const box=boxOf(female,q=>q.name===name);
 return box&&[(box.lo[0]+box.hi[0])/2,box.lo[1],(box.lo[2]+box.hi[2])/2];
};
const humerus=transformOf.arm&&{left:placedTop('Left humerus',transformOf.arm),right:placedTop('Right humerus',transformOf.arm)};
if(humerus?.left)measure('arm-left',armCloud,1,humerus.left,0.30);
if(humerus?.right)measure('arm-right',armCloud,-1,humerus.right,0.30);
const ankle={left:ownBottom('Tibia (left)'),right:ownBottom('Tibia (right)')};
if(ankle.left&&transformOf['foot-left'])measure('foot-left',footCloud,1,ankle.left,0.06);
if(ankle.right&&transformOf['foot-right'])measure('foot-right',footCloud,-1,ankle.right,0.06);

/** Which limb a placed part belongs to, so the right correction is applied. */
const limbOf=(region,centreX)=>region.id.startsWith('foot')?region.id
 :region.id==='arm'?(centreX>=0?'arm-left':'arm-right'):null;
if(dry)process.exit(0);

// --- copy geometry -------------------------------------------------------
const startChunk=female.chunks.length;
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
/** Region transform first, then the limb's posture correction, eased in from the
 * joint so vertices at the joint barely move and the far end turns fully. */
function place(p,transform,limb,rigid){
 const b=maleChunks[p.chunk];
 const source=new Float32Array(b.buffer,b.byteOffset+p.positions,p.vertexCount*3);
 const sourceNormals=new Int16Array(b.buffer,b.byteOffset+p.normals,p.vertexCount*3);
 const positions=new Float32Array(p.vertexCount*3),normals=new Int16Array(p.vertexCount*3);
 const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];
 const bend=limb?posture.get(limb):undefined;
 for(let i=0;i<p.vertexCount;i++){
  let v=[source[i*3]*transform.scale+transform.offset[0],
         source[i*3+1]*transform.scale+transform.offset[1],
         source[i*3+2]*transform.scale+transform.offset[2]];
  let n=[sourceNormals[i*3],sourceNormals[i*3+1],sourceNormals[i*3+2]];
  if(bend){
   const arm=sub(v,bend.pivot),reach=Math.hypot(...arm);
   // A bone turns as one piece. Its joint end is round and the turn is about the
   // centre of that end, so the joint stays seated while the shaft swings. Soft
   // tissue eases in instead, which keeps its attachments near the joint intact.
   const w=rigid?1:Math.min(1,reach/bend.blend);
   const rotated=turn(arm,bend.spin,bend.angle*w),grow=1+w*(bend.scale-1);
   v=[bend.pivot[0]+rotated[0]*grow,bend.pivot[1]+rotated[1]*grow,bend.pivot[2]+rotated[2]*grow];
   n=turn(n,bend.spin,bend.angle*w);
  }
  for(let k=0;k<3;k++){
   positions[i*3+k]=v[k];lo[k]=Math.min(lo[k],v[k]);hi[k]=Math.max(hi[k],v[k]);
   normals[i*3+k]=Math.max(-32767,Math.min(32767,Math.round(n[k])));
  }
 }
 const indices=new Uint32Array(b.buffer,b.byteOffset+p.indices,p.indexCount);
 return {positions,normals,indices,bounds:[lo,hi]};
}
for(const {region,transform,parts:source} of plan){
 const members=[];
 for(const p of source){
  const placed=place(p,transform,limbOf(region,centre(p)[0]*transform.scale+transform.offset[0]),true);
  if(size>4_000_000)flush();
  const id=`BM${String(added).padStart(4,'0')}`,conceptId=`BORROWED:${p.id}`;
  const po=append(placed.positions),no=append(placed.normals),io=append(placed.indices);
  parts.push({id,name:p.name,conceptId,system:'borrowed',chunk:chunks.length,
   positions:po,normals:no,indices:io,vertexCount:p.vertexCount,indexCount:p.indexCount,bounds:placed.bounds});
  concepts.push({id:conceptId,name:p.name,elements:[id]});
  members.push(id);added++;triangles+=p.indexCount/3;
 }
 concepts.push({id:`BORROWED:${region.id}`,name:`${region.label} (male-derived)`,elements:members});
}
flush();
concepts.push({id:'BORROWED:all',name:'Male-derived bones',elements:parts.filter(p=>p.system==='borrowed').map(p=>p.id)});

female.parts=parts;female.concepts=concepts;female.chunks=chunks;
female.triangles+=triangles;
female.borrowed={from:male.version,structures:added,
 posture:Object.fromEntries([...posture].map(([k,v])=>[k,{turnDegrees:+(v.angle*180/Math.PI).toFixed(1),reach:+v.scale.toFixed(3)}])),
 method:'per-region least-squares uniform scale and translation onto bones modelled in both bodies',
 regions:plan.map(({region,transform,parts,anchorError})=>({id:region.id,label:region.label,structures:parts.length,
  scale:+transform.scale.toFixed(5),anchorErrorMillimetres:+(anchorError*1000).toFixed(1)}))};
for(const p of parts)if(p.chunk>=chunks.length)throw new Error(`${p.id} points past the end of the chunk list.`);
fs.writeFileSync(new URL('atlas-female.json',dir),JSON.stringify(female));
console.log(JSON.stringify({borrowed:added,triangles,newChunks:chunks.length-startChunk,
 totalParts:parts.length,totalConcepts:concepts.length},null,1));
