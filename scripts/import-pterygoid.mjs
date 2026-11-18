/** Add the lateral pterygoid muscle to both reference bodies from a third,
 * independently sourced GLB.
 * Usage: node scripts/import-pterygoid.mjs SOURCE.glb [--dry]
 *
 * Neither reference body models any muscle of mastication — BodyParts3D, the
 * male source, has none at all. Of several teaching models found for these
 * muscles, only this one from the University of Dundee, School of Dentistry
 * carries an open licence (CC BY 4.0) and permits download; the rest are
 * Sketchfab view-only embeds. It supplies the lateral pterygoid, both heads,
 * both sides — the only muscle of mastication available from an open source
 * at the time of writing. It is listed as its own system, "Lateral pterygoid
 * (reference)", switched off by default, rather than folded into a "muscles
 * of mastication" system implying muscles this body does not carry.
 * Source and attribution: public/ATTRIBUTION.md.
 *
 * The donor file's own root nodes carry the axis correction from its Z-up
 * authoring package to glTF's Y-up, which the node-transform walk below
 * applies like any other transform; only the unit scale (its geometry is
 * authored in centimetres) has to be corrected separately. Its four target
 * meshes are skinned for an unrelated jaw-opening animation, and the rest
 * pose is shown to differ from the bind pose, so extracting plain vertex
 * positions would be wrong — each vertex is placed by proper linear-blend
 * skinning first.
 *
 * Both target bodies already model the mandible and the sphenoid — the donor
 * happens to model a whole skull around its muscles — so the rotation between
 * the donor's coordinate frame and each body's own is settled from those two
 * shared bones' centres, the same way scripts/import-lower-limb.mjs settles
 * it, and for the same reason: an upright bounding box has the same corners
 * however the structure inside it is turned, so fitting box to box cannot
 * tell a structure from an inverted one.
 */
import fs from 'node:fs';

const [sourcePath]=process.argv.slice(2).filter(a=>!a.startsWith('--'));
const dry=process.argv.includes('--dry');
if(!sourcePath){console.error('Usage: node scripts/import-pterygoid.mjs SOURCE.glb [--dry]');process.exit(1);}
const dir=new URL('../public/models/',import.meta.url);
const read=name=>JSON.parse(fs.readFileSync(new URL(name,dir),'utf8'));
const SYSTEM='pterygoid-reference';
const CENTIMETRES_TO_METRES=0.01;

// --- read the donor GLB, with skinning ------------------------------------
function openGlb(path){
 const buffer=fs.readFileSync(path);
 if(buffer.length<12||buffer.readUInt32LE(0)!==0x46546c67)throw new Error(`${path} is not a GLB file.`);
 let cursor=12,json=null,bin=null;
 while(cursor+8<=buffer.length){
  const length=buffer.readUInt32LE(cursor),type=buffer.readUInt32LE(cursor+4),body=buffer.subarray(cursor+8,cursor+8+length);
  if(type===0x4e4f534a)json=JSON.parse(body.toString('utf8'));
  else if(type===0x004e4942)bin=body;
  cursor+=8+length;
 }
 if(!json||!bin)throw new Error(`${path} is missing its JSON or binary chunk.`);
 const data=new DataView(bin.buffer,bin.byteOffset,bin.byteLength);
 const WIDTH={5120:1,5121:1,5122:2,5123:2,5125:4,5126:4},COMPONENTS={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16};
 const STORE={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array};
 const READERS={5120:o=>data.getInt8(o),5121:o=>data.getUint8(o),5122:o=>data.getInt16(o,true),5123:o=>data.getUint16(o,true),5125:o=>data.getUint32(o,true),5126:o=>data.getFloat32(o,true)};
 const accessor=index=>{
  const a=json.accessors[index],size=COMPONENTS[a.type],width=WIDTH[a.componentType],read=READERS[a.componentType];
  const out=new STORE[a.componentType](a.count*size);
  if(a.bufferView==null)return out;
  const view=json.bufferViews[a.bufferView],base=(view.byteOffset??0)+(a.byteOffset??0),stride=view.byteStride??size*width;
  for(let i=0;i<a.count;i++){const at=base+i*stride;for(let c=0;c<size;c++)out[i*size+c]=read(at+c*width);}
  return out;
 };
 return {json,accessor};
}
const IDENTITY=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
function local(node){
 if(node.matrix)return node.matrix.slice();
 const t=node.translation??[0,0,0],r=node.rotation??[0,0,0,1],s=node.scale??[1,1,1];
 const x=r[0],y=r[1],z=r[2],w=r[3],x2=x+x,y2=y+y,z2=z+z,xx=x*x2,xy=x*y2,xz=x*z2,yy=y*y2,yz=y*z2,zz=z*z2,wx=w*x2,wy=w*y2,wz=w*z2;
 return [(1-(yy+zz))*s[0],(xy+wz)*s[0],(xz-wy)*s[0],0,(xy-wz)*s[1],(1-(xx+zz))*s[1],(yz+wx)*s[1],0,(xz+wy)*s[2],(yz-wx)*s[2],(1-(xx+yy))*s[2],0,t[0],t[1],t[2],1];
}
function multiply(a,b){const r=new Array(16);for(let c=0;c<4;c++)for(let row=0;row<4;row++)r[c*4+row]=a[row]*b[c*4]+a[4+row]*b[c*4+1]+a[8+row]*b[c*4+2]+a[12+row]*b[c*4+3];return r;}
const addWeighted=(a,b,w)=>{const r=new Array(16);for(let k=0;k<16;k++)r[k]=a[k]+b[k]*w;return r;};
const point=(m,x,y,z)=>[m[0]*x+m[4]*y+m[8]*z+m[12],m[1]*x+m[5]*y+m[9]*z+m[13],m[2]*x+m[6]*y+m[10]*z+m[14]];
const direction=(m,x,y,z)=>[m[0]*x+m[4]*y+m[8]*z,m[1]*x+m[5]*y+m[9]*z,m[2]*x+m[6]*y+m[10]*z];

const donor=openGlb(sourcePath);
const nodes=donor.json.nodes;
const parentOf=new Array(nodes.length).fill(-1);
for(let i=0;i<nodes.length;i++)for(const c of nodes[i].children??[])parentOf[c]=i;
const worldCache=new Map();
function worldOf(index){
 if(worldCache.has(index))return worldCache.get(index);
 const parent=parentOf[index],parentWorld=parent<0?IDENTITY:worldOf(parent);
 const world=multiply(parentWorld,local(nodes[index]));
 worldCache.set(index,world);
 return world;
}
/** A whole node subtree flattened to its own bounding box, for structures the
 * donor keeps split across several meshes (teeth, sutures) — none needed here,
 * but the same helper locates the mandible and sphenoid regardless of how many
 * meshes the donor split them into. */
function boxOfSubtree(rootIndex){
 const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];
 const walk=index=>{
  const node=nodes[index],world=worldOf(index);
  if(node.mesh!=null&&node.skin==null){
   for(const primitive of donor.json.meshes[node.mesh].primitives){
    const accessorIndex=primitive.attributes.POSITION;
    if(accessorIndex==null)continue;
    const a=donor.json.accessors[accessorIndex];
    if(!a.min||!a.max)continue;
    for(let corner=0;corner<8;corner++){
     const p=point(world,corner&1?a.max[0]:a.min[0],corner&2?a.max[1]:a.min[1],corner&4?a.max[2]:a.min[2]);
     for(let k=0;k<3;k++){lo[k]=Math.min(lo[k],p[k]);hi[k]=Math.max(hi[k],p[k]);}
    }
   }
  }
  for(const child of node.children??[])walk(child);
 };
 walk(rootIndex);
 return {lo:lo.map(v=>v*CENTIMETRES_TO_METRES),hi:hi.map(v=>v*CENTIMETRES_TO_METRES)};
}
const findNode=name=>nodes.findIndex(n=>n.name===name);

/** Linear-blend skinning: the rest pose here is shown (see header) to differ
 * from the bind pose, so a plain node-transform read would place these
 * vertices wrong. Each joint's world*inverseBind is blended per vertex by its
 * weights, then applied once. */
function extractSkinnedMesh(meshName){
 const nodeIndex=nodes.findIndex((n,i)=>donor.json.meshes[n.mesh]?.name===meshName);
 if(nodeIndex<0)throw new Error(`No node references a mesh named "${meshName}".`);
 const node=nodes[nodeIndex],mesh=donor.json.meshes[node.mesh],primitive=mesh.primitives[0];
 const skin=donor.json.skins[node.skin];
 const inverseBind=donor.accessor(skin.inverseBindMatrices);
 const skinMatrix=skin.joints.map((jointNode,j)=>multiply(worldOf(jointNode),Array.from(inverseBind.subarray(j*16,j*16+16))));
 const rawPositions=donor.accessor(primitive.attributes.POSITION);
 const rawNormals=primitive.attributes.NORMAL!=null?donor.accessor(primitive.attributes.NORMAL):null;
 const joints=donor.accessor(primitive.attributes.JOINTS_0),weights=donor.accessor(primitive.attributes.WEIGHTS_0);
 const count=rawPositions.length/3;
 const positions=new Float32Array(count*3),normals=new Float32Array(count*3);
 for(let i=0;i<count;i++){
  let blended=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  for(let k=0;k<4;k++){
   const w=weights[i*4+k];
   if(w)blended=addWeighted(blended,skinMatrix[joints[i*4+k]],w);
  }
  const p=point(blended,rawPositions[i*3],rawPositions[i*3+1],rawPositions[i*3+2]);
  for(let k=0;k<3;k++)positions[i*3+k]=p[k]*CENTIMETRES_TO_METRES;
  if(rawNormals){
   const n=direction(blended,rawNormals[i*3],rawNormals[i*3+1],rawNormals[i*3+2]);
   const length=Math.hypot(...n)||1;
   for(let k=0;k<3;k++)normals[i*3+k]=n[k]/length;
  }
 }
 const rawIndices=primitive.indices!=null?donor.accessor(primitive.indices):Uint32Array.from({length:count},(_,i)=>i);
 const indices=rawIndices instanceof Uint32Array?rawIndices:Uint32Array.from(rawIndices);
 return {positions,normals:rawNormals?normals:null,indices,count};
}
const MUSCLE_MESHES=[
 {label:'left-inferior',source:'Inferior_Lateral_Pterygoid1_1_blinn49_0'},
 {label:'right-inferior',source:'Inferior_Lateral_Pterygoid1_1_ZBrushPolyMesh3D_blinn50_0'},
 {label:'left-superior',source:'Superior_Lateral_Pterygoid3_1_Superior_lateral_0'},
 {label:'right-superior',source:'Superior_Lateral_Pterygoid3_1_ZBrushPolyMesh3D_blinn53_0'},
];
const muscles=MUSCLE_MESHES.map(m=>({...m,mesh:extractSkinnedMesh(m.source)}));

// --- shared-bone correspondences, one rotation for the whole donor --------
const donorBox=name=>{const i=findNode(name);return i<0?null:boxOfSubtree(i);};
const centreOf=b=>b.lo.map((v,k)=>(v+b.hi[k])/2);
const corners=b=>Array.from({length:8},(_,c)=>[c&1?b.hi[0]:b.lo[0],c&2?b.hi[1]:b.lo[1],c&4?b.hi[2]:b.lo[2]]);
const AXIS_ROTATIONS=[];
for(const [a,b,c] of [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]])
 for(const sa of [1,-1])for(const sb of [1,-1])for(const sc of [1,-1]){
  const rows=[[0,0,0],[0,0,0],[0,0,0]];
  rows[0][a]=sa;rows[1][b]=sb;rows[2][c]=sc;
  const det=rows[0][0]*(rows[1][1]*rows[2][2]-rows[1][2]*rows[2][1])-rows[0][1]*(rows[1][0]*rows[2][2]-rows[1][2]*rows[2][0])+rows[0][2]*(rows[1][0]*rows[2][1]-rows[1][1]*rows[2][0]);
  if(det>0)AXIS_ROTATIONS.push(rows);
 }
const spin=(rows,v)=>[rows[0][0]*v[0]+rows[0][1]*v[1]+rows[0][2]*v[2],rows[1][0]*v[0]+rows[1][1]*v[1]+rows[1][2]*v[2],rows[2][0]*v[0]+rows[2][1]*v[1]+rows[2][2]*v[2]];
function place(rows,from,onto){
 const turned=from.map(p=>spin(rows,p));
 const mean=pts=>pts.reduce((m,p)=>[m[0]+p[0]/pts.length,m[1]+p[1]/pts.length,m[2]+p[2]/pts.length],[0,0,0]);
 const a=mean(turned),b=mean(onto);
 let num=0,den=0;
 for(let i=0;i<turned.length;i++)for(let k=0;k<3;k++){const da=turned[i][k]-a[k],db=onto[i][k]-b[k];num+=da*db;den+=da*da;}
 const scale=den?num/den:1,offset=[b[0]-scale*a[0],b[1]-scale*a[1],b[2]-scale*a[2]];
 let error=0;
 for(let i=0;i<turned.length;i++)for(let k=0;k<3;k++)error=Math.max(error,Math.abs(scale*turned[i][k]+offset[k]-onto[i][k]));
 return {rows,scale,offset,error};
}
function chooseRotation(correspondences){
 let best=null;
 const from=correspondences.map(c=>c.donor),onto=correspondences.map(c=>c.own);
 for(const rows of AXIS_ROTATIONS){const attempt=place(rows,from,onto);if(!best||attempt.error<best.error)best=attempt;}
 return best;
}
const UPRIGHT=[[1,0,0],[0,1,0],[0,0,1]];
function fitToBody(rows,pairs){
 const from=[],onto=[];
 for(const {donor:d,own}of pairs){const turned=corners(d).map(p=>spin(rows,p));from.push(...corners({lo:[Math.min(...turned.map(p=>p[0])),Math.min(...turned.map(p=>p[1])),Math.min(...turned.map(p=>p[2]))],hi:[Math.max(...turned.map(p=>p[0])),Math.max(...turned.map(p=>p[1])),Math.max(...turned.map(p=>p[2]))]}));onto.push(...corners(own));}
 return {...place(UPRIGHT,from,onto),rows};
}
const ownBox=(atlas,name)=>{
 const parts=atlas.parts.filter(p=>p.name===name);
 if(!parts.length)return null;
 const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];
 for(const p of parts)for(let i=0;i<3;i++){lo[i]=Math.min(lo[i],p.bounds[0][i]);hi[i]=Math.max(hi[i],p.bounds[1][i]);}
 return {lo,hi};
};

const donorMandible=donorBox('Mandible'),donorSphenoid=donorBox('Sphenoid_remeshLowest_1');
console.log(`donor mandible: n/a box  x ${donorMandible.lo[0].toFixed(3)}..${donorMandible.hi[0].toFixed(3)}`);

function importInto(filename,label){
 const atlas=read(filename);
 const native=atlas.parts.filter(p=>p.system!==SYSTEM);
 if(native.length<atlas.parts.length){
  const keep=Math.max(...native.map(p=>p.chunk))+1;
  if(!dry)for(const c of atlas.chunks.slice(keep)){
   const name=c.url.split('/').pop();
   for(const file of [name,`${name}.gz`])fs.rmSync(new URL(file,dir),{force:true});
  }
  console.log(`${label}: replacing ${atlas.parts.length-native.length} structures imported by an earlier run`);
  atlas.parts=native;atlas.chunks=atlas.chunks.slice(0,keep);
  atlas.concepts=atlas.concepts.filter(c=>!String(c.id).startsWith('PTERYGOID:'));
  atlas.triangles=native.reduce((n,p)=>n+p.indexCount/3,0);
  delete atlas.pterygoid;
 }
 const ownMandible=ownBox(atlas,'Mandible'),ownSphenoid=ownBox(atlas,'Sphenoid bone');
 if(!ownMandible||!ownSphenoid)throw new Error(`${label}: missing the mandible or sphenoid to anchor the fit to.`);
 const frame=chooseRotation([
  {donor:centreOf(donorMandible),own:centreOf(ownMandible)},
  {donor:centreOf(donorSphenoid),own:centreOf(ownSphenoid)},
 ]);
 const transform=fitToBody(frame.rows,[{donor:donorMandible,own:ownMandible},{donor:donorSphenoid,own:ownSphenoid}]);
 console.log(`${label}: rotation+scale fit, anchors agree within ${(transform.error*1000).toFixed(0)} mm, scale ${transform.scale.toFixed(4)}`);
 if(dry)return;

 const chunks=[...atlas.chunks];let segments=[],size=0;
 const append=array=>{const padding=(4-size%4)%4;if(padding){segments.push(Buffer.alloc(padding));size+=padding;}const offset=size,buffer=Buffer.from(array.buffer,array.byteOffset,array.byteLength);segments.push(buffer);size+=buffer.length;return offset;};
 const flush=()=>{if(!size)return;const name=`${filename.replace('.json','')}-${chunks.length}.bin`;fs.writeFileSync(new URL(name,dir),Buffer.concat(segments));chunks.push({url:`/models/${name}`,bytes:size});segments=[];size=0;};
 const parts=[...atlas.parts],concepts=[...atlas.concepts];
 let added=0,triangles=0;const members=[];
 const NAMES={'left-inferior':'Lateral pterygoid, inferior head (left)','right-inferior':'Lateral pterygoid, inferior head (right)','left-superior':'Lateral pterygoid, superior head (left)','right-superior':'Lateral pterygoid, superior head (right)'};
 for(const {label:muscleLabel,mesh}of muscles){
  const positions=new Float32Array(mesh.count*3),normals=new Int16Array(mesh.count*3);
  const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];
  // `transform` is a {rows,scale,offset} rigid fit, not a flat 4x4 matrix, so
  // it is applied the same way fitToBody's own corner computation applies it:
  // rotate, then uniform-scale, then translate.
  for(let i=0;i<mesh.count;i++){
   const turned=spin(transform.rows,[mesh.positions[i*3],mesh.positions[i*3+1],mesh.positions[i*3+2]]);
   for(let k=0;k<3;k++){
    const v=turned[k]*transform.scale+transform.offset[k];
    positions[i*3+k]=v;lo[k]=Math.min(lo[k],v);hi[k]=Math.max(hi[k],v);
   }
   if(mesh.normals){
    const n=spin(transform.rows,[mesh.normals[i*3],mesh.normals[i*3+1],mesh.normals[i*3+2]]);
    const length=Math.hypot(...n)||1;
    for(let k=0;k<3;k++)normals[i*3+k]=Math.max(-32767,Math.min(32767,Math.round(n[k]/length*32767)));
   }
  }
  if(size>4_000_000)flush();
  const id=`PT${String(added).padStart(2,'0')}`,conceptId=`PTERYGOID:${muscleLabel}`,name=NAMES[muscleLabel];
  const po=append(positions),no=append(normals),io=append(mesh.indices);
  parts.push({id,name,conceptId,system:SYSTEM,chunk:chunks.length,positions:po,normals:no,indices:io,vertexCount:mesh.count,indexCount:mesh.indices.length,bounds:[lo,hi]});
  concepts.push({id:conceptId,name,elements:[id]});
  members.push(id);added++;triangles+=mesh.indices.length/3;
 }
 flush();
 concepts.push({id:'PTERYGOID:all',name:'Lateral pterygoid (reference)',elements:members});
 atlas.parts=parts;atlas.concepts=concepts;atlas.chunks=chunks;atlas.triangles+=triangles;
 atlas.pterygoid={from:'Lateral Pterygoids, University of Dundee School of Dentistry, CC BY 4.0',structures:added,scale:+transform.scale.toFixed(4),anchorErrorMillimetres:+(transform.error*1000).toFixed(1)};
 for(const p of parts)if(p.chunk>=chunks.length)throw new Error(`${p.id} points past the end of the chunk list.`);
 fs.writeFileSync(new URL(filename,dir),JSON.stringify(atlas));
 console.log(`${label}: added ${added} structures, ${Math.round(triangles).toLocaleString()} triangles`);
}

importInto('atlas.json','male');
importInto('atlas-female.json','female');
