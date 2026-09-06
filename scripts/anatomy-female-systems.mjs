/** Display naming and system grouping for the Human Reference Atlas female source.
 * The HRA ships machine names such as `VH_F_renal_pyramid_L_a` beneath ten source
 * system nodes. Grouping follows those source nodes rather than name guesses; the
 * circulatory, nervous, skeletal, and reproductive subtrees are split further so
 * they line up with the viewer's display systems.
 */

/** Source system node -> viewer system, for subtrees needing no further split. */
const SOURCE_SYSTEMS=[
 ['VH_F_digestive_system','digestive'],
 ['VH_F_respiratory_system','respiratory'],
 ['VH_F_urinary_system','urinary'],
 ['VH_F_reproductive_system','reproductive'],
 ['VH_F_lymphatic_system','lymphatic'],
 ['VH_F_muscular_system','muscular'],
 ['VH_F_nervous_system','nervous'],
 ['VH_F_integumentary_system','integumentary'],
];
/** Joint soft tissue sits among the source bones; the viewer lists it separately. */
const JOINT_TISSUE=/ligament|meniscus|cartilage|enthesis|perichondular|intervertebral_disk|nucleus_pulposus/;
/** v1.10 lifted the lower limb out of the skeletal system node; it is still bone. */
const BONE_GROUPS=['VH_F_skeletal_system','VH_F_lower_limb'];
/** Structures a later release dropped, restored from the previous one by the
 * converter's --supplement flag. The pelvis is the most sexually dimorphic part
 * of the skeleton, so losing the ischium and pubis would be a real regression. */
export const CARRIED_OVER=new Set(['VH_F_ischium','VH_F_pubis']);
/** Venous naming in the source is explicit, so anything else vascular is arterial. */
const VENOUS=/_vein|_veins|vena_cava|coronary_sinus/;

export function classify(name,ancestry){
 const path=ancestry.join('/');
 if(path.includes('VH_F_placenta'))return 'pregnancy';
 if(path.includes('VH_F_eyes'))return 'sensory';
 // The Allen brain regions outnumber every other structure; list them on their own.
 if(path.includes('Allen_brain'))return 'brain';
 if(path.includes('VH_F_heart'))return 'cardiac';
 if(path.includes('VH_F_blood_vasculature'))return VENOUS.test(name)?'venous':'arterial';
 if(path.includes('VH_F_circulatory_system'))return VENOUS.test(name)?'venous':'arterial';
 if(BONE_GROUPS.some(g=>path.includes(g)))return JOINT_TISSUE.test(name)?'connective':'skeletal';
 for(const [node,system] of SOURCE_SYSTEMS)if(path.includes(node))return system;
 return 'connective';
}

const PREFIX=/^(VH_F|VH|Allen|Yao)(_|$)/;
/** Abbreviations the source uses as standalone name tokens. */
const EXPANSION={inf:'inferior',sup:'superior',ant:'anterior',pos:'posterior',med:'medial',lat:'lateral',antlat:'anterolateral',posmed:'posteromedial'};
/** Misspellings in the source names, corrected for display only. */
const SPELLING={fibria:'fimbriae',jejenum:'jejunum',eigth:'eighth',opthalmic:'ophthalmic',heptopancreatic:'hepatopancreatic',hepataduodenal:'hepatoduodenal',ucinate:'uncinate',schlemms:"Schlemm's",segm:'segment',segmennt:'segment',segmt:'segment'};

export function label(raw){
 let tokens=raw.replace(PREFIX,'').split('_').filter(Boolean);
 let side='',enumerator='';
 const takeEnumerator=()=>{if(tokens.length>1&&/^[a-z]$/.test(tokens[tokens.length-1]))enumerator=tokens.pop();};
 takeEnumerator();
 tokens=tokens.filter(t=>{if(t==='L'||t==='R'){side=t==='L'?'left':'right';return false;}return true;});
 if(!enumerator)takeEnumerator();
 const words=tokens.map(t=>{
  const fixed=SPELLING[t.toLowerCase()]??EXPANSION[t]??t;
  return fixed.replace(/([A-Za-z])(\d+)$/,'$1 $2');
 });
 let text=words.join(' ').replace(/\s+/g,' ').trim();
 if(!text)return 'Whole body';
 // The lymph node reference model reuses generic tissue names; place them.
 if(raw.startsWith('Yao_')&&!/lymph/.test(text))text+=' of lymph node';
 text=text.charAt(0).toUpperCase()+text.slice(1);
 if(enumerator)text+=` ${enumerator}`;
 if(side)text+=` (${side})`;
 return text;
}

/** Keep the source node name as the atlas reference so origin stays traceable. */
export const conceptId=raw=>`HRA:${raw.replace(PREFIX,'')||'body'}`;
