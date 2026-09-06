/** Build the Arabic anatomical vocabulary the viewer ships.
 * Usage: node scripts/fetch-arabic-terms.mjs [--offline]
 *
 * Every concept in the male atlas carries its Foundational Model of Anatomy
 * identifier, and Wikidata records the same identifier against items that carry
 * Arabic labels, so the two can be joined exactly rather than matched by name.
 * Wikidata is CC0, which is what makes the result redistributable; the standard
 * Arabic medical dictionaries are not, and are used only to check terms by hand.
 *
 * Names the join misses are often a side or a numbered variant of a name it
 * found, so those are composed from the base term with the agreement Arabic
 * needs. Hand corrections live in `scripts/arabic-review.json` and always win,
 * so this can be re-run without losing them.
 *
 * Output: `app/terms-ar.json`, read by the interface.
 */
import fs from 'node:fs';

const offline=process.argv.includes('--offline');
const root=new URL('../',import.meta.url);
const read=p=>JSON.parse(fs.readFileSync(new URL(p,root),'utf8'));
const male=read('public/models/atlas.json'),female=read('public/models/atlas-female.json');
const reviewPath=new URL('scripts/arabic-review.json',root);
const review=fs.existsSync(reviewPath)?JSON.parse(fs.readFileSync(reviewPath,'utf8')):{};
const cachePath=new URL('scripts/arabic-wikidata.cache.json',root);

// --- join on the FMA identifier ------------------------------------------
const fmaOf=id=>/^FMA\d+$/.test(id)?id.slice(3):null;
const wanted=[...new Set(male.concepts.map(c=>fmaOf(c.id)).filter(Boolean))];
let fetched=fs.existsSync(cachePath)?new Map(JSON.parse(fs.readFileSync(cachePath,'utf8'))):new Map();
if(!offline){
 const endpoint='https://query.wikidata.org/sparql';
 const size=350;
 for(let i=0;i<wanted.length;i+=size){
  const slice=wanted.slice(i,i+size);
  const query=`SELECT ?fma ?ar ?title WHERE { VALUES ?fma { ${slice.map(x=>`"${x}"`).join(' ')} }
   ?item wdt:P1402 ?fma .
   OPTIONAL { ?item rdfs:label ?ar . FILTER(LANG(?ar)="ar") }
   OPTIONAL { ?page schema:about ?item ; schema:isPartOf <https://ar.wikipedia.org/> ; schema:name ?title } }`;
  const response=await fetch(`${endpoint}?format=json&query=${encodeURIComponent(query)}`,
   {headers:{Accept:'application/sparql-results+json','User-Agent':'human-atlas/1.0 (anatomy viewer; Arabic terminology build)'}});
  if(!response.ok){console.error(`  Wikidata returned ${response.status} for batch ${i}; keeping what is cached`);continue;}
  for(const row of (await response.json()).results.bindings){
   const term=row.ar?.value??row.title?.value;
   if(term&&!fetched.has(row.fma.value))fetched.set(row.fma.value,term);
  }
  process.stderr.write(`  ${Math.min(i+size,wanted.length)}/${wanted.length}\r`);
 }
 fs.writeFileSync(cachePath,JSON.stringify([...fetched],null,0));
 process.stderr.write('\n');
}
console.log(`Wikidata gave Arabic terms for ${fetched.size} of ${wanted.length} identifiers.`);

// --- Arabic agreement -----------------------------------------------------
/** An Arabic noun phrase is headed by its first word, so that word decides
 * gender, and whether the phrase is already definite. */
const feminine=term=>/(ة|اء|ى)$/.test(term.trim().split(/\s+/)[0]);
/** Definite either by the article on the head, or by annexation: the last word
 * of `قصبة الساق` carries the article, which makes the whole phrase definite,
 * so an adjective on it needs the article too. */
const definite=term=>{
 const words=term.trim().split(/\s+/);
 return /^ال/.test(words[0])||/^ال/.test(words[words.length-1]);
};
const definitise=term=>term.trim().split(/\s+/).map(w=>/^ال/.test(w)||/^[^؀-ۿ]/.test(w)?w:`ال${w}`).join(' ');
const SIDE={left:{m:'أيسر',f:'يسرى'},right:{m:'أيمن',f:'يمنى'}};
const ORDINAL=[
 ['first',{m:'الأول',f:'الأولى'}],['second',{m:'الثاني',f:'الثانية'}],['third',{m:'الثالث',f:'الثالثة'}],
 ['fourth',{m:'الرابع',f:'الرابعة'}],['fifth',{m:'الخامس',f:'الخامسة'}],['sixth',{m:'السادس',f:'السادسة'}],
 ['seventh',{m:'السابع',f:'السابعة'}],['eighth',{m:'الثامن',f:'الثامنة'}],['ninth',{m:'التاسع',f:'التاسعة'}],
 ['tenth',{m:'العاشر',f:'العاشرة'}],['eleventh',{m:'الحادي عشر',f:'الحادية عشرة'}],['twelfth',{m:'الثاني عشر',f:'الثانية عشرة'}],
];
const DIGIT=['','الأول','الثاني','الثالث','الرابع','الخامس','السادس','السابع','الثامن','التاسع','العاشر','الحادي عشر','الثاني عشر'];
const DIGIT_F=['','الأولى','الثانية','الثالثة','الرابعة','الخامسة','السادسة','السابعة','الثامنة','التاسعة','العاشرة','الحادية عشرة','الثانية عشرة'];
/** `شريان سباتي باطن` + left -> `شريان سباتي باطن أيسر`, keeping the article
 * when the base already has one. */
const withSide=(base,which)=>{
 const word=SIDE[which][feminine(base)?'f':'m'];
 return `${base} ${definite(base)?`ال${word}`:word}`;
};
/** A numbered vertebra or rib is definite in use: `الفقرة الصدرية الأولى`. */
const withOrdinal=(base,n)=>{
 const stem=definitise(base);
 const word=(feminine(base)?DIGIT_F:DIGIT)[n];
 return word?`${stem} ${word}`:null;
};

// --- assemble -------------------------------------------------------------
const terms={};              // English name (lower case) -> Arabic
const provenance={};         // and where each came from
const note=(english,arabic,from)=>{
 const key=english.toLowerCase().trim();
 if(!arabic||terms[key])return;
 terms[key]=arabic;provenance[key]=from;
};
for(const c of male.concepts){
 const fma=fmaOf(c.id);
 if(fma&&fetched.has(fma))note(c.name,fetched.get(fma),'wikidata');
}
const direct=Object.keys(terms).length;

/** Hand corrections land before composition, so a corrected base term is the one
 * the side and numbered variants are built from. */
const applyReview=()=>{
 let changed=0;
 for(const [english,arabic] of Object.entries(review)){
  const key=english.toLowerCase().trim();
  if(terms[key]!==arabic)changed++;
  terms[key]=arabic;provenance[key]='reviewed';
 }
 return changed;
};
const reviewedBases=applyReview();

const SIDE_AT_START=/^(left|right)\s+/i;
const SIDE_IN_BRACKETS=/\s*\((left|right)\)\s*$/i;
const ORDINAL_AT_START=new RegExp(`^(${ORDINAL.map(([w])=>w).join('|')})\\s+`,'i');
const NUMBER_AT_END=/\s+(\d{1,2})$/;
/** Compose a name the join missed out of a base term it found. */
const compose=name=>{
 let rest=name,side=null,ordinal=null;
 let m;
 if((m=SIDE_IN_BRACKETS.exec(rest))){side=m[1].toLowerCase();rest=rest.replace(SIDE_IN_BRACKETS,'');}
 if(!side&&(m=SIDE_AT_START.exec(rest))){side=m[1].toLowerCase();rest=rest.replace(SIDE_AT_START,'');}
 if((m=ORDINAL_AT_START.exec(rest))){ordinal=ORDINAL.findIndex(([w])=>w===m[1].toLowerCase())+1;rest=rest.replace(ORDINAL_AT_START,'');}
 if(!ordinal&&(m=NUMBER_AT_END.exec(rest))){ordinal=+m[1];rest=rest.replace(NUMBER_AT_END,'');}
 if(!side&&!ordinal)return null;
 const base=terms[rest.toLowerCase().trim()];
 if(!base)return null;
 let built=ordinal?withOrdinal(base,ordinal):base;
 if(!built)return null;
 if(side)built=withSide(built,side);
 return built;
};
for(const atlas of [male,female])for(const c of atlas.concepts){
 const built=compose(c.name);
 if(built)note(c.name,built,'composed');
}
const composed=Object.keys(terms).length-direct-reviewedBases;

// A correction may also target a composed name, so review wins once more.
const reviewed=reviewedBases+applyReview();

const covered=atlas=>atlas.concepts.filter(c=>terms[c.name.toLowerCase().trim()]).length;
fs.writeFileSync(new URL('app/terms-ar.json',root),JSON.stringify(terms,null,1));
console.log(JSON.stringify({
 fromWikidata:direct,composed,handReviewed:reviewed,total:Object.keys(terms).length,
 maleConceptsCovered:`${covered(male)}/${male.concepts.length}`,
 femaleConceptsCovered:`${covered(female)}/${female.concepts.length}`,
},null,1));
