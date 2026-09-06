import {SYSTEMS_AR,EDITIONS_AR} from './anatomy-ar';
import {EXPLANATIONS_AR} from './explanations-ar';
import TERMS_AR from './terms-ar.json';
import type {Language} from './i18n';

export type SystemId = 'skeletal'|'muscular'|'arterial'|'venous'|'nervous'|'digestive'|'respiratory'|'urinary'|'reproductive'|'lymphatic'|'endocrine'|'integumentary'|'connective'|'sensory'|'cardiac'|'pregnancy'|'brain'|'borrowed'|'donor-muscle';
export type Sex = 'male'|'female';
export const SYSTEMS: {id:SystemId;name:string;color:string;description:string}[] = [
 {id:'skeletal',name:'Skeleton',color:'#e2d9ba',description:'Bones form the supporting framework of the body, protect organs, and provide attachment points for muscles. Their internal tissue also stores minerals and produces blood cells.'},
 {id:'muscular',name:'Muscles',color:'#a85b50',description:'Skeletal muscles generate movement by pulling on their attachments. Together with tendons, they move joints, stabilize posture, and produce heat.'},
 {id:'cardiac',name:'Heart',color:'#b96760',description:'The heart is a muscular pump with four chambers. Its valves direct blood forward through the pulmonary and systemic circuits.'},
 {id:'sensory',name:'Sensory organs',color:'#b0c8ce',description:'These structures contribute to special senses, including sight, hearing, and balance. Their specialized tissues detect stimuli and work with the nervous system to convey information.'},
 {id:'arterial',name:'Arteries',color:'#c05245',description:'The heart drives blood through the circulation. Arteries carry blood away from the heart to supply tissues or, in the pulmonary circuit, to the lungs.'},
 {id:'venous',name:'Veins',color:'#527c9f',description:'Veins return blood toward the heart. Superficial and deep networks collect blood from the tissues; the pulmonary veins bring oxygenated blood back from the lungs.'},
 {id:'nervous',name:'Nervous system',color:'#d8b565',description:'The brain, spinal cord, and peripheral nerves carry and process signals. They support sensation, movement, coordination, and automatic regulation of body functions.'},
 {id:'brain',name:'Brain regions',color:'#b3a8c6',description:'The brain is subdivided here into individually selectable regions. Each one can be isolated on its own, while the spinal cord and the nerves outside the brain stay under the nervous system.'},
 {id:'respiratory',name:'Respiratory',color:'#b98991',description:'The airways conduct air to the lungs, where oxygen and carbon dioxide move between air and blood. Breathing depends on pressure changes produced by respiratory muscles.'},
 {id:'digestive',name:'Digestive',color:'#b8916b',description:'The digestive tract breaks down food, absorbs nutrients and water, and moves waste onward. Accessory organs contribute bile and digestive enzymes.'},
 {id:'urinary',name:'Urinary',color:'#b47961',description:'The kidneys filter blood and regulate fluid, electrolyte, and acid–base balance. Urine travels through the ureters to the bladder and exits through the urethra.'},
 {id:'lymphatic',name:'Lymphatic',color:'#879f7c',description:'Lymphatic vessels return excess tissue fluid to the circulation. Lymph nodes and other lymphoid organs support immune surveillance and responses.'},
 {id:'endocrine',name:'Endocrine',color:'#c5a09a',description:'Endocrine organs release hormones into the blood to coordinate processes such as metabolism, growth, stress responses, and reproduction.'},
 {id:'reproductive',name:'Reproductive',color:'#bda098',description:'The reproductive structures represented here produce gametes and sex hormones, and provide the passages that carry them.'},
 {id:'pregnancy',name:'Pregnancy reference',color:'#c8a6ae',description:'The placenta, membranes, and umbilical cord shown here belong to a pregnancy reference and are not part of the non-pregnant body. They are hidden until you switch them on.'},
 {id:'integumentary',name:'Body surface',color:'#ba9b7d',description:'The body surface provides an outer anatomical reference. The integumentary system forms a protective barrier and contributes to sensation and temperature regulation.'},
 {id:'borrowed',name:'Male-derived bones',color:'#9aa7b1',description:'These bones are not part of this reference body. They are copied from the male reference to stand in for structures its source does not model, and each region is scaled and positioned to meet the bones both bodies share, then turned about its joint until it runs along this body’s own body surface. Treat them as a placeholder for shape and position, not as this body’s own anatomy.'},
 {id:'donor-muscle',name:'Leg muscles (donor)',color:'#a8776e',description:'The muscles of the hip, thigh, and lower leg, from a second woman: the Visible Human Female, segmented by Andreassen and colleagues. This reference body’s own source models almost no muscle, and these fill that gap. They are fitted to this body’s own hip bone, femur, patella, tibia, and fibula, but they are another person’s muscles and carry her build, not this one’s.'},
 {id:'connective',name:'Connective tissue',color:'#aec3bb',description:'Cartilage, ligaments, and other connective tissues support, connect, and separate structures. Their roles include stabilizing joints and distributing mechanical loads.'},
];
export interface Part {id:string;name:string;conceptId:string;system:SystemId;chunk:number;positions:number;normals:number;indices:number;vertexCount:number;indexCount:number;bounds:[number[],number[]]}
export interface Concept {id:string;name:string;elements:string[]}
export interface Atlas {version:string;sex?:Sex;source?:string;scope?:string;parts:Part[];concepts:Concept[];chunks:{url:string;bytes:number;gzip?:string;gzipBytes?:number}[];triangles:number}
/** Each reference body is a separate dataset with its own scope and credits. */
export interface Edition {sex:Sex;label:string;caption:string;manifest:string;dataset:string;summary:string;limits:string;credit:string;licence:string;download:string;publication?:string;suggestions:string[];hidden:SystemId[]}
export const EDITIONS:Edition[] = [
 {sex:'male',label:'Male',caption:'ADULT HUMAN · MALE',manifest:'/models/atlas.json',dataset:'BodyParts3D 4.0',
  summary:'2,234 individual meshes and 3,432 named concepts from an adult male reference anatomy.',
  limits:'A whole-body reference covering every modeled system, built from MRI and anatomical illustration. Its reproductive structures start hidden; switch that system on to show them.',
  credit:'BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International.',
  licence:'https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html',
  download:'https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html',
  publication:'https://academic.oup.com/nar/article/37/suppl_1/D782/1000752',
  suggestions:['heart','brain','liver','stomach','spleen','pancreas','urinary bladder','trachea'],
  hidden:['reproductive']},
 {sex:'female',label:'Female',caption:'ADULT HUMAN · FEMALE',manifest:'/models/atlas-female.json',dataset:'Human Reference Atlas female v1.10',
  summary:'964 individual meshes and 1,173 named concepts from an adult female reference assembly, plus 180 bones borrowed from the male reference and 76 leg muscles from a second female reference, standing in for regions its own source does not model.',
  limits:'A reference assembly with body surface, brain, and selected organs including female reproductive anatomy. Skeletal coverage is limited to the spine, sternum, pelvis, and knees, and muscle coverage to the eye and knee: its source models no skull, rib, arm, or foot bone, so those are borrowed from the male reference and listed separately as male-derived bones, switched off until you ask for them. It models almost no muscle, so the muscles of the hip, thigh, and lower leg come from a second female reference and are listed as donor leg muscles. No muscle is taken from the male reference: muscle carries the shape of the body it came from too plainly for that to be honest. Its reproductive structures start hidden; switch that system on, or search for one, to show them. Placenta and umbilical structures belong to a pregnancy reference and also stay hidden until switched on.',
  credit:'3D Reference Organ Set for Female v1.10 by Kristen Browne and Heidi Schlehlein, HuBMAP Human Reference Atlas, built on the Visible Human Dataset of the U.S. National Library of Medicine. Its leg muscles come from the Visible Human Female lower-extremity set of Andreassen and colleagues. Both are licensed under CC Attribution 4.0 International.',
  licence:'https://creativecommons.org/licenses/by/4.0/',
  download:'https://humanatlas.io/3d-reference-library',
  publication:'https://doi.org/10.1038/s41597-022-01905-2',
  suggestions:['heart','brain','uterus','ovary','liver','kidney','tongue','mammary gland'],
  hidden:['reproductive']},
];
export const edition = (sex:Sex) => EDITIONS.find(e=>e.sex===sex) ?? EDITIONS[0];
/** Systems a reference body starts with switched off, on top of those left out of
 * DEFAULT_VISIBLE for every body. They stay listed, so a reader can switch them on. */
export const defaultVisible = (sex:Sex):SystemId[] => {const off=edition(sex).hidden;return DEFAULT_VISIBLE.filter(id=>!off.includes(id));};
export type View = 'three-quarter'|'front'|'back'|'side';
export interface SceneState {inspectorOpen?:boolean;explode:number;visible:SystemId[];selected:string[];isolate:boolean;view:View;rotate:boolean;reset:number}
export const DEFAULT_VISIBLE:SystemId[] = ['cardiac','sensory','skeletal','muscular','arterial','venous','nervous','brain','respiratory','digestive','urinary','lymphatic','endocrine','reproductive','connective'];
export const EXPLANATIONS:Record<string,string> = {
 'heart':'A muscular pump in the chest. Its right side sends blood to the lungs; its left side sends blood through the systemic circulation.',
 'liver':'A large organ beneath the right side of the diaphragm. It processes absorbed nutrients, produces bile, and synthesizes many proteins carried in the blood.',
 'brain':'The central organ of the nervous system. Its interconnected regions support perception, movement, memory, language, and the regulation of bodily functions.',
 'stomach':'A muscular chamber between the esophagus and small intestine. It stores and mixes food with acid and enzymes before releasing it into the duodenum.',
 'spleen':'A lymphoid organ in the upper left abdomen. It filters blood, removes aging blood cells, and participates in immune responses.',
 'pancreas':'An abdominal organ with digestive and endocrine roles. It supplies enzymes to the small intestine and releases hormones including insulin and glucagon.',
 'urinary bladder':'A muscular reservoir in the pelvis that stores urine arriving from the kidneys through the ureters.',
 'trachea':'The main airway connecting the larynx to the bronchi. Its cartilage supports keep the airway open during breathing.',
 'diaphragm':'A broad muscle separating the chest and abdomen. When it contracts, it increases chest volume and helps draw air into the lungs.',
 'kidney':'A paired organ in the back of the abdomen. It filters blood, adjusts fluid and electrolyte balance, and drains urine through the renal pelvis into the ureter.',
 'lungs':'The paired organs of gas exchange. Air reaching their smallest airspaces passes oxygen into the blood and takes up carbon dioxide.',
 'spinal cord':'The cord of nervous tissue running inside the vertebral canal. It carries signals between the brain and the body and organizes local reflexes.',
 'thymus':'A lymphoid organ behind the sternum. It is where developing T lymphocytes mature, and it is largest in childhood.',
 'lymph node':'A small filtering organ on the lymphatic vessels. Lymph passing through it is surveyed by immune cells gathered in its follicles and paracortex.',
 'skin':'The outer covering of the body. It forms a protective barrier, senses touch and temperature, and helps regulate heat and water loss.',
 'uterus':'A muscular pelvic organ that receives an embryo from the uterine tube, houses and nourishes a developing fetus, and contracts during birth.',
 'ovary':'The paired female gonad. It holds the ovarian follicles, releases an oocyte in each cycle, and produces oestrogen and progesterone.',
 'fallopian tube':'The paired tube carrying an oocyte from the ovary toward the uterus. Fertilization normally takes place along its length.',
 'vagina':'The muscular canal between the cervix and the vulva. It carries menstrual flow, receives the penis, and forms the birth canal.',
 'cervix':'The lower, narrow part of the uterus opening into the vagina. Its canal and mucus change across the cycle and dilate during labour.',
 'mammary gland':'The glandular tissue of the breast. Its lobes drain through lactiferous ducts to the nipple and produce milk after childbirth.',
 'placenta':'The organ formed in pregnancy at the wall of the uterus. It exchanges oxygen, nutrients, and waste between the pregnant person and the fetus.',
 'umbilical cord':'The cord linking the fetus to the placenta. Its vein carries oxygenated blood to the fetus and its two arteries carry blood back.',
 'gluteus maximus':'The largest muscle of the buttock. It straightens the hip and is what drives standing up, climbing, and running.',
 'gluteus medius':'A fan-shaped hip muscle that holds the pelvis level when the opposite foot leaves the ground.',
 'gluteus minimus':'The deepest of the three gluteal muscles, working with gluteus medius to steady the pelvis in walking.',
 'psoas major':'A deep muscle running from the lumbar spine to the femur. It is the main flexor of the hip.',
 'iliacus':'A fan of muscle lining the inside of the ilium. With psoas it flexes the hip and steadies the pelvis.',
 'tensor fasciae latae':'A small hip muscle that tightens the iliotibial band down the outside of the thigh.',
 'piriformis':'A deep muscle from the sacrum to the top of the femur, turning the thigh outward. The sciatic nerve passes beside it.',
 'obturator internus':'A deep hip rotator that leaves the pelvis through the lesser sciatic notch to reach the femur.',
 'obturator externus':'A deep muscle on the outside of the obturator membrane, turning the thigh outward.',
 'superior gemellus':'A small deep rotator of the hip, running with the tendon of obturator internus.',
 'inferior gemellus':'The lower of the paired gemelli, a small deep rotator of the hip.',
 'quadratus femoris':'A flat deep muscle between the ischium and the femur that turns the thigh outward.',
 'pectineus':'A short muscle at the top of the inner thigh that both flexes and draws in the hip.',
 'rectus femoris':'The only part of the quadriceps that crosses the hip as well as the knee: it flexes the hip and straightens the knee.',
 'vastus lateralis':'The largest head of the quadriceps, on the outer thigh, straightening the knee.',
 'vastus medialis':'The inner head of the quadriceps, whose lower fibres help hold the kneecap in its groove.',
 'vastus intermedius':'The head of the quadriceps lying directly on the front of the femur, beneath the other three.',
 'sartorius':'The longest muscle in the body, running across the thigh from the hip bone to the inner side of the knee.',
 'gracilis':'A strap-like muscle down the inner thigh, drawing the leg inward and helping bend the knee.',
 'adductor longus':'The most forward of the adductors, drawing the thigh towards the midline.',
 'adductor brevis':'A short adductor lying behind adductor longus.',
 'adductor magnus':'The largest adductor, spanning from the pelvis to nearly the whole length of the femur.',
 'biceps femoris long':'The long head of biceps femoris, one of the hamstrings, extending the hip and bending the knee.',
 'biceps femoris short':'The short head of biceps femoris, arising from the femur and bending the knee.',
 'semitendinosus':'A hamstring with a long cord-like tendon, bending the knee and extending the hip.',
 'semimembranosus':'The deepest hamstring, broad and flat above, bending the knee and extending the hip.',
 'gastrocnemius medial':'The inner head of the calf muscle, crossing both knee and ankle to point the foot down.',
 'gastrocnemius lateral':'The outer head of the calf muscle, working with the medial head through the Achilles tendon.',
 'soleus':'The broad flat muscle beneath gastrocnemius. It points the foot down and holds the body upright when standing.',
 'plantaris':'A small muscle with a very long thin tendon running beside the Achilles.',
 'popliteus':'A small muscle behind the knee that unlocks the joint at the start of bending.',
 'tibialis anterior':'The muscle on the front of the shin that lifts the foot, keeping the toes clear as the leg swings through.',
 'tibialis posterior':'A deep calf muscle that turns the sole inward and supports the arch of the foot.',
 'peroneus longus':'A muscle down the outside of the leg whose tendon crosses under the foot, turning the sole outward.',
 'extensor digitorum longus':'The muscle that straightens the four lesser toes and helps lift the foot.',
 'extensor hallucis longus':'The muscle that lifts the big toe and helps raise the foot.',
 'flexor digitorum longus':'A deep calf muscle whose tendons curl the four lesser toes.',
 'flexor hallucis longus':'A deep calf muscle that curls the big toe and pushes off at the end of each step.',
 'frontal bone':'The bone of the forehead. It forms the front of the cranial vault and the roofs of the eye sockets.',
 'parietal bone':'One of the paired bones forming the top and sides of the cranial vault.',
 'temporal bone':'The bone at the side of the skull. It houses the middle and inner ear and carries the joint for the jaw.',
 'occipital bone':'The bone at the back and base of the skull. Its large opening lets the brainstem pass into the spinal canal.',
 'sphenoid bone':'The wing-shaped bone at the base of the skull. It cradles the pituitary gland and forms part of each eye socket.',
 'ethmoid':'A light bone between the eye sockets. It forms part of the nasal cavity and carries the nerve fibres of smell.',
 'vomer':'The thin bone forming the lower back part of the partition between the two halves of the nose.',
 'maxilla':'The upper jaw bone. It carries the upper teeth and forms the floor of the eye socket and much of the hard palate.',
 'mandible':'The lower jaw, the only freely moving bone of the skull. It carries the lower teeth and hinges at the temporal bone.',
 'zygomatic bone':'The cheekbone. It shapes the prominence of the cheek and the outer rim of the eye socket.',
 'palatine bone':'A small bone behind the maxilla, completing the back of the hard palate and part of the nasal wall.',
 'nasal bone':'One of the paired bones forming the bridge of the nose.',
 'hyoid bone':'A U-shaped bone in the neck that touches no other bone. Slung from muscles and ligaments, it anchors the tongue and the larynx.',
 'major alar cartilage':'The curved cartilage shaping the tip and nostril rim of the nose.',
 'rib':'One of the curved bones of the chest wall. Ribs run from the thoracic spine towards the sternum, shielding the heart and lungs and moving with each breath.',
 'costal cartilage':'The bar of cartilage joining a rib to the sternum. Its springiness lets the chest wall expand during breathing.',
 'clavicle':'The collarbone. It props the shoulder out from the trunk and is the only bony link between the arm and the chest.',
 'scapula':'The shoulder blade. It glides across the back of the ribcage and carries the socket for the head of the humerus.',
 'humerus':'The bone of the upper arm, running from the shoulder socket to the elbow.',
 'radius':'The forearm bone on the thumb side. It rotates around the ulna to turn the palm up and down.',
 'ulna':'The forearm bone on the little-finger side. Its upper end forms the hinge of the elbow.',
 'scaphoid':'A boat-shaped wrist bone. It is the one most often broken in a fall onto an outstretched hand.',
 'lunate':'A crescent-shaped bone in the first row of the wrist.',
 'triquetral':'A pyramid-shaped wrist bone on the little-finger side of the first row.',
 'pisiform':'A pea-sized bone sitting on the triquetral, embedded in a wrist tendon.',
 'trapezium':'The wrist bone under the thumb, whose saddle-shaped joint gives the thumb its wide range of movement.',
 'trapezoid':'A small wedge-shaped bone in the second row of the wrist.',
 'capitate':'The largest wrist bone, sitting at the centre of the second row.',
 'hamate':'A wrist bone with a hook-shaped process, on the little-finger side of the second row.',
 'calcaneus':'The heel bone, the largest bone of the foot. It takes the first impact of each step and anchors the Achilles tendon.',
 'talus':'The bone linking the foot to the leg. It carries the whole weight of the body down into the heel and the arch of the foot.',
 'cuboid bone':'A cube-shaped bone on the outer side of the foot, between the heel and the outer metatarsals.',
 'navicular bone':'A boat-shaped bone in the arch of the foot, between the talus and the cuneiforms.',
 'medial cuneiform bone':'The largest of the three wedge-shaped bones in the arch of the foot, supporting the first metatarsal.',
 'intermediate cuneiform bone':'The smallest wedge-shaped bone of the foot arch, supporting the second metatarsal.',
 'lateral cuneiform bone':'The wedge-shaped bone supporting the third metatarsal in the arch of the foot.',
 'sesamoid bone':'A small bone embedded in a tendon, where it protects the tendon and improves its leverage.',
 'descending aorta':'The length of aorta running down through the chest and abdomen, giving off the branches that supply the trunk and legs.',
 'ascending aorta':'The first stretch of the aorta, leaving the left ventricle. The coronary arteries arise from its root.',
 'nucleus pulposus':'The soft gel core of an intervertebral disk. It spreads pressure evenly across the disk as the spine moves.',
 'circumvallate papillae':'The large papillae in a V at the back of the tongue. Their walls carry many taste buds.',
 'fungiform papillae':'The small rounded papillae scattered over the front of the tongue, most of which carry taste buds.',
 'dorsal tongue':'The upper surface of the tongue, carrying the papillae and the taste buds.',
 'ventral tongue':'The smooth undersurface of the tongue, where its veins run close to the lining.',
 'mouth floor':'The soft tissue under the tongue, containing the openings of the submandibular and sublingual glands.',
 'buccal mucosa':'The lining of the cheek, kept moist by the salivary glands opening onto it.',
 'frenulum of lip':'The small fold tethering each lip to the gum.',
 'major calyx':'A branch of the renal pelvis, formed where several minor calyces join.',
 'minor calyx':'The small cup that receives urine from a renal papilla.',
 'bronchopulmonary segment':'A wedge of lung supplied by a single segmental bronchus and its artery. Segments can be removed individually in surgery.',
 'thymus lobe':'One of the two lobes of the thymus, where developing T lymphocytes mature.',
 'hilum of spleen':'The notch on the spleen where its artery, vein, and nerves enter and leave.',
 'efferent lymph node':'The vessel carrying filtered lymph out of a lymph node towards the next node or the bloodstream.',
 'arytenoid cartilage':'A paired cartilage of the larynx. Rotating it swings the vocal folds together and apart.',
 'corniculate cartilage':'A small cartilage capping each arytenoid at the back of the larynx.',
 'tracheal cartilage':'The C-shaped rings in the wall of the trachea that keep the airway from collapsing.',
 'mouth':'The first part of the digestive tract. Its lips, palate, teeth, and tongue take in food, begin breaking it down, and shape the sounds of speech.',
 'tooth row':'The arc of teeth set in one jaw. Their differing shapes cut, tear, and grind food before it is swallowed.',
 'hard palate':'The bony front part of the roof of the mouth. It gives the tongue a firm surface to press food against.',
 'soft palate':'The muscular back part of the roof of the mouth. It lifts during swallowing to close off the nasal cavity.',
 'gingiva':'The gum. It covers the bone around the teeth and seals the join between tooth and jaw.',
 'major salivary gland':'The paired parotid, submandibular, and sublingual glands. Their saliva moistens food, begins starch digestion, and protects the teeth.',
 'parotid gland':'The largest salivary gland, in front of and below the ear. Its duct opens into the cheek beside the upper molars.',
 'submandibular gland':'A salivary gland below the floor of the mouth. It supplies much of the saliva produced at rest.',
 'sublingual gland':'The smallest major salivary gland, lying under the tongue and draining through several short ducts.',
 'colon':'The long stretch of large intestine that absorbs water and salts from what the small intestine passes on, and forms and stores stool.',
 'small intestine':'The long coiled tube between the stomach and the colon. Most digestion is completed and most nutrients absorbed along its lining.',
 'duodenum':'The first, C-shaped part of the small intestine. It receives stomach contents along with bile and pancreatic enzymes.',
 'jejunum':'The middle part of the small intestine. Its densely folded lining absorbs the bulk of digested nutrients.',
 'ileum':'The last part of the small intestine. It absorbs bile salts and vitamin B12 before emptying into the caecum.',
 'caecum':'The pouch at the start of the large intestine. It receives the contents of the ileum and carries the vermiform appendix.',
 'vermiform appendix':'A narrow blind tube attached to the caecum. It holds lymphoid tissue and has no essential digestive role.',
 'rectum':'The final straight section of the large intestine, where stool is held before it is passed.',
 'sigmoid colon':'The S-shaped length of colon between the descending colon and the rectum.',
 'biliary tree':'The branching ducts that carry bile from the liver and gallbladder to the duodenum.',
 'common bile duct':'The duct formed where the cystic and common hepatic ducts meet. It delivers bile into the duodenum.',
 'gallbladder':'A small sac beneath the liver. It concentrates and stores bile, then releases it after a meal.',
 'couinaud liver segment':'The eight functional segments of the liver. Each has its own blood supply and bile drainage, which is what allows parts of the liver to be removed separately.',
 'renal pelvis':'The funnel where the calyces of the kidney join. It collects urine and passes it into the ureter.',
 'ureter':'The muscular tube carrying urine from the kidney to the bladder. Waves of contraction move urine along it.',
 'renal pyramid':'A cone of kidney medulla holding the tubules that concentrate urine. Its tip drains into a minor calyx.',
 'renal papilla':'The tip of a renal pyramid, where the collecting ducts open into a minor calyx.',
 'renal medulla':'The inner part of the kidney, made of the renal pyramids. Its tubules build the salt gradient that concentrates urine.',
 'renal column':'Cortical tissue reaching down between the renal pyramids and carrying vessels into the kidney.',
 'outer cortex of kidney':'The outer layer of the kidney, holding the filtering units that begin the making of urine.',
 'trigone of urinary bladder':'The smooth triangle of bladder wall between the two ureteral openings and the outlet to the urethra.',
 'larynx':'The voice box, between the throat and the trachea. Its cartilages hold the airway open and its vocal folds produce sound.',
 'bronchi':'The branching airways beyond the trachea. They carry air into and out of the lungs, warming and cleaning it on the way.',
 'tracheobronchial tree':'The trachea together with all its branches, from the main bronchi down to the smallest segmental airways.',
 'carina':'The ridge of cartilage where the trachea divides into the two main bronchi.',
 'cricoid cartilage':'The only complete ring of cartilage in the airway, sitting just below the thyroid cartilage.',
 'epiglotic cartilage':'The leaf-shaped cartilage above the larynx. It folds down during swallowing to keep food out of the airway.',
 'ligaments of uterus and ovaries':'The peritoneal folds and fibrous bands that suspend the uterus, tubes, and ovaries in the pelvis and carry their blood supply.',
 'broad ligament':'A sheet of peritoneum draped over the uterus and reaching to the pelvic wall. It carries the vessels and nerves of the uterus, tubes, and ovaries.',
 'round ligament of uterus':'A cord running from the uterus through the inguinal canal. It helps hold the uterus tipped forward.',
 'uterosacral ligament':'A band running back from the cervix to the sacrum. It is one of the main supports holding the uterus in place.',
 'cardinal ligament of uterus':'A thickened band at the base of the broad ligament. It anchors the cervix sideways and carries the uterine artery.',
 'suspensory ligament of ovary':'The fold carrying the ovarian vessels to the ovary from the pelvic wall.',
 'ovarian ligament':'A short cord joining the ovary to the side of the uterus.',
 'mesosalpinx':'The part of the broad ligament that suspends the uterine tube.',
 'mesovarium':'The fold of the broad ligament that attaches the ovary and carries its vessels.',
 'fimbriae of uterine tube':'The fringe of finger-like projections at the open end of the uterine tube. They sweep the released oocyte into the tube.',
 'eye':'The organ of sight. Light passes through the cornea and lens to be focused on the retina, which turns it into nerve signals.',
 'retina':'The light-sensitive layer lining the back of the eye. Its photoreceptors convert light into signals carried out along the optic nerve.',
 'cornea':'The clear front window of the eye. Its curvature does most of the focusing before light reaches the lens.',
 'lens':'The transparent body behind the iris. Changing its shape shifts focus between near and distant objects.',
 'iris':'The coloured ring of muscle around the pupil. It widens and narrows the pupil to control how much light enters.',
 'pupil':'The opening at the centre of the iris through which light enters the eye.',
 'sclera':'The tough white outer coat of the eyeball. It holds the eye in shape and anchors the eye muscles.',
 'optic choroid':'The vascular layer between the retina and the sclera, supplying the outer retina with blood.',
 'ciliary body':'The ring of tissue behind the iris. Its muscle changes the shape of the lens, and it produces the aqueous humour.',
 'vitreous humor':'The clear gel filling the eye behind the lens. It holds the retina against the back of the eye.',
 'aqueous humor':'The watery fluid in front of the lens. It nourishes the cornea and lens and sets the pressure inside the eye.',
 'macula lutea':'The small central area of the retina responsible for sharp, detailed vision.',
 'fovea':'The pit at the centre of the macula, where cone photoreceptors are packed most densely and vision is sharpest.',
 'optic disc':'The point where the optic nerve leaves the retina. It carries no photoreceptors, which is why it produces the blind spot.',
 'ora serrata of retina':'The serrated border where the retina ends towards the front of the eye.',
 'schlemm\'s canal':'A channel encircling the front of the eye that drains aqueous humour back into the bloodstream.',
 'trabecular meshwork':'The filter through which aqueous humour leaves the eye. Resistance here helps set the pressure inside the eye.',
 'bulbar conjunctiva':'The thin transparent membrane covering the white of the eye.',
 'suspensory ligament of lens':'The fine fibres holding the lens in place and passing on the pull of the ciliary muscle.',
 'cardiac chamber':'The four chambers of the heart: two atria that receive blood and two ventricles that pump it out.',
 'left ventricle':'The thick-walled chamber that pumps oxygenated blood into the aorta and out to the body.',
 'right ventricle':'The chamber that pumps blood into the pulmonary trunk and on to the lungs.',
 'left cardiac atrium':'The chamber receiving oxygenated blood from the pulmonary veins and passing it to the left ventricle.',
 'right cardiac atrium':'The chamber receiving returning blood from the venae cavae and passing it to the right ventricle.',
 'interventricular septum':'The muscular wall between the two ventricles, keeping oxygenated and deoxygenated blood apart.',
 'papillary muscle of heart':'Muscular projections inside the ventricles. Their cords hold the valve leaflets shut as the ventricle contracts.',
 'aortic valve':'The valve between the left ventricle and the aorta. It opens to let blood out and closes to stop it running back.',
 'mitral valve':'The two-leaflet valve between the left atrium and the left ventricle.',
 'tricuspid valve':'The three-leaflet valve between the right atrium and the right ventricle.',
 'pulmonary valve':'The valve between the right ventricle and the pulmonary trunk.',
 'aorta':'The largest artery. It leaves the left ventricle and gives off the branches that supply the whole body.',
 'aortic arch':'The curve of the aorta above the heart. Its branches supply the head, neck, and arms.',
 'superior vena cava':'The large vein returning blood from the head, neck, and arms to the right atrium.',
 'inferior vena cava':'The large vein returning blood from the abdomen, pelvis, and legs to the right atrium.',
 'hepatic portal vein':'The vein carrying nutrient-rich blood from the intestines and spleen into the liver.',
 'pulmonary trunk':'The vessel leaving the right ventricle. It divides into the left and right pulmonary arteries.',
 'coronary sinus':'The wide vein on the back of the heart, returning most of the heart muscle own blood into the right atrium.',
 'celiac trunk':'A short artery from the abdominal aorta supplying the stomach, liver, and spleen.',
 'superior mesenteric artery':'The artery supplying the small intestine and the first part of the colon.',
 'inferior mesenteric artery':'The artery supplying the last part of the colon and the upper rectum.',
 'splenic artery':'The winding artery running along the pancreas to supply the spleen.',
 'blood vasculature':'The arteries and veins of the region shown. Arteries carry blood away from the heart and veins return it.',
 'arteries of heart':'The coronary arteries. They arise at the root of the aorta and supply the heart muscle itself.',
 'veins of heart':'The cardiac veins, draining the heart muscle mostly by way of the coronary sinus.',
 'palatine tonsil':'A mass of lymphoid tissue on each side of the throat, sampling what is swallowed and breathed in.',
 'capsule of lymph node':'The fibrous shell around a lymph node, pierced by the vessels that bring lymph in.',
 'follicles of lymph node':'Clusters of B lymphocytes in the outer node. They enlarge into germinal centres when an antibody response begins.',
 'paracortex of lymph node':'The zone between the follicles and the medulla, where T lymphocytes gather and meet antigen.',
 'medulla of lymph node':'The inner region of a lymph node, where filtered lymph collects before leaving through the efferent vessel.',
 'afferent lymphatic vessel':'A vessel bringing lymph, and anything it carries, into a lymph node.',
 'vertebra':'One bone of the spinal column. Its body carries weight and its arch encloses the spinal cord.',
 'sacrum':'The triangular bone formed from fused vertebrae. It wedges between the hip bones and passes the weight of the spine into the pelvis.',
 'coccyx':'The tailbone at the base of the spine, formed from small fused rudimentary vertebrae.',
 'pelvis':'The ring of bone made by the hip bones, sacrum, and coccyx. It carries the weight of the trunk and, in the female, surrounds the birth canal.',
 'ilium':'The broad fan-shaped upper part of the hip bone. Its blade anchors the hip and abdominal muscles.',
 'ischium':'The lower back part of the hip bone. Its tuberosity is what the body rests on when seated.',
 'pubis':'The front part of the hip bone. The two pubic bones meet at the pubic symphysis.',
 'femur':'The thigh bone, the longest in the body. Its head sits in the hip socket and its condyles form the upper half of the knee.',
 'tibia':'The shin bone. It carries almost all the weight passing from the knee down to the ankle.',
 'fibula':'The slender bone beside the tibia. It carries little weight but steadies the ankle and anchors muscles.',
 'patella':'The kneecap. It rides in the quadriceps tendon and improves the leverage of that muscle as the knee straightens.',
 'knee joint':'The hinge between the femur and the tibia. Cartilage, menisci, and ligaments let it bend and straighten while bearing weight.',
 'intervertebral disk':'The pad between two vertebral bodies. A tough outer ring and a soft centre absorb load and let the spine bend.',
 'intervertebral joint':'The junction between two vertebrae, formed by the disk in front and the paired facet joints behind.',
 'meniscus':'A C-shaped wedge of cartilage in the knee. It deepens the joint surface and spreads load across it.',
 'anterior cruciate ligament of knee':'A ligament inside the knee that stops the tibia sliding forward on the femur.',
 'posterior cruciate ligament of knee':'A ligament inside the knee that stops the tibia sliding backwards on the femur.',
 'articular cartilage of knee':'The smooth layer covering the bone ends in the knee, letting them glide with very little friction.',
 'patellar ligament':'The band joining the kneecap to the tibia, carrying on the pull of the quadriceps.',
 'fibular collateral ligament':'The cord on the outer side of the knee that resists the joint opening sideways.',
 'optic nerve':'The nerve carrying visual signals from the retina back to the brain.',
 'optic chiasm':'The crossing where fibres from the inner half of each retina pass to the opposite side of the brain.',
 'dura mater':'The tough outer membrane enclosing the brain and spinal cord.',
 'brain hemisphere':'One half of the cerebrum. Its cortex and deep nuclei handle sensation, movement, and thought largely for the opposite side of the body.',
 'hippocampus':'A curved structure in the temporal lobe, essential for forming new memories and for finding your way through space.',
 'thalamus':'A pair of deep nuclei that relay almost all sensory and motor signals on their way to the cortex.',
 'hypothalamus':'A small region under the thalamus. It regulates temperature, hunger, thirst, sleep, and the hormone output of the pituitary.',
 'corpus callosum':'The broad band of fibres joining the two cerebral hemispheres and carrying traffic between them.',
 'amygdaloid complex':'A group of nuclei in the temporal lobe involved in emotion, especially fear, and in emotional memory.',
 'putamen':'A deep nucleus of the basal ganglia, taking part in the control and learning of movement.',
 'claustrum':'A thin sheet of grey matter beside the insula, widely connected to the cortex; its function is not settled.',
 'fornix':'The arched fibre bundle carrying output from the hippocampus to the hypothalamus and other targets.',
 'substantia nigra':'A midbrain nucleus whose dopamine neurons help control movement. Their loss underlies Parkinson disease.',
 'olfactory bulb':'The forward extension of the brain that receives input from the nose and begins the processing of smell.',
 'cerebellar vermis':'The narrow midline strip of the cerebellum, involved in posture and the control of the trunk.',
 'nipple':'The raised centre of the breast, where the lactiferous ducts open onto the surface.',
 'areola':'The circle of pigmented skin around the nipple, carrying small glands that lubricate it during feeding.',
 'mammary lobes':'The glandular units of the breast. Each drains through its own duct towards the nipple.',
 'main lactiferous ducts':'The channels carrying milk from the lobes of the breast to the nipple.',
 'subcutaneous abdominal adipose tissue':'The fat layer under the skin of the abdomen, storing energy and insulating the body.',
 'amnion':'The innermost membrane around the fetus, enclosing the amniotic fluid.',
 'chorionic plate':'The fetal-facing surface of the placenta, where the umbilical vessels spread out.',
 'basal plate':'The maternal-facing surface of the placenta, where it meets the wall of the uterus.',
 'umbilical artery':'One of the two cord arteries carrying blood from the fetus to the placenta.',
 'umbilical vein':'The cord vessel carrying oxygenated blood from the placenta to the fetus.',
 'tongue':'A muscular organ in the mouth. It moves food for chewing and swallowing, carries the taste buds, and shapes the sounds of speech.',
 'sternum':'The flat bone at the front of the chest. Its manubrium, body, and xiphoid process anchor the clavicles and the costal cartilages of the ribs.',
 'vertebral column':'The stack of vertebrae running from the neck to the pelvis. It carries the weight of the trunk, allows the spine to bend, and encloses the spinal cord.',
 'omentum':'A fold of peritoneum hanging from the stomach over the abdominal organs. It stores fat and helps wall off infection and injury.',
 'thyroid cartilage':'The largest cartilage of the larynx. Its two plates meet at the front of the neck and support the vocal folds behind them.',
};
/** Where a reference body's coverage or anatomy differs, say so in its own terms. */
const SYSTEM_NOTES:Record<Sex,Partial<Record<SystemId,string>>> = {
 male:{reproductive:'The male reproductive structures represented here contribute to sperm production, maturation, transport, and the production of sex hormones.'},
 female:{
  reproductive:'The female reproductive structures represented here produce and carry oocytes, support fertilization and implantation, and produce sex hormones.',
  skeletal:'Bones form the supporting framework of the body. This female reference models the vertebrae, sternum, pelvis, and knee bones. Its own source has no skull, ribs, arm bones, or foot bones; those shown are borrowed from the male reference and listed under male-derived bones.',
  connective:'Cartilage, ligaments, and other connective tissues support, connect, and separate structures. In this female reference they include the intervertebral disks and the soft tissue of the knee.',
  muscular:'Skeletal muscles generate movement by pulling on their attachments. This female reference models the muscles of the eye and knee rather than the complete musculature.',
  integumentary:'The body surface provides an outer anatomical reference. In this female reference it also carries the breast and mammary gland.',
 },
};
/** Source names place laterality and enumeration differently: BodyParts3D writes
 * `left kidney`, the HRA writes `Retina (left)` and `Descending aorta a`. Strip
 * those so one explanation covers every copy of the same structure. */
const shared = (name:string) => name
 .replace(/\s*\((?:left|right)\)\s*$/,'')
 .replace(/^(?:left|right)\s+/,'')
 .replace(/\s+[a-z]$/,'')
 .trim();
/** Longest first, so `intervertebral disk` is preferred over any shorter prefix. */
const KEYS_BY_LENGTH = Object.keys(EXPLANATIONS).sort((a,b)=>b.length-a.length);
/** Many source names qualify a structure the atlas already explains, as in
 * `Intervertebral disk of third lumbar vertebra`. Fall back to the structure. */
const qualified = (name:string) => KEYS_BY_LENGTH.find(key=>name.startsWith(`${key} `)||name.endsWith(` ${key}`));
/** The Arabic name of a structure, where the vocabulary has one. Names not
 * covered stay in English: that is normal in Arabic medical teaching, and a
 * guessed anatomical term is worse than an English one. */
export const term = (name:string, language:Language) =>
 language==='ar' ? (TERMS_AR as Record<string,string>)[name.toLowerCase().trim()] ?? name : name;
/** True when the Arabic vocabulary actually covers this name. */
export const translated = (name:string) => (TERMS_AR as Record<string,string>)[name.toLowerCase().trim()]!==undefined;
export const systemName = (id:SystemId, language:Language) =>
 (language==='ar' ? SYSTEMS_AR[id]?.name : undefined) ?? SYSTEMS.find(s=>s.id===id)?.name ?? '';
export const edition_ = (sex:Sex, language:Language) => {
 const base=edition(sex);
 return language==='ar' ? {...base,...EDITIONS_AR[sex]} : base;
};

const entryFor = (name:string) => {
 const key=name.toLowerCase().trim(),base=shared(key);
 return EXPLANATIONS[key] ?? EXPLANATIONS[base] ?? EXPLANATIONS[qualified(base) ?? ''];
};
/** True when the atlas describes this structure itself, rather than falling back
 * to its system. The interface labels the fallback so the difference is visible. */
export const described = (name:string) => entryFor(name)!==undefined;
/** The English lookup finds which structure this is; Arabic then answers with
 * its own wording, and falls back to the English one where it has none yet. */
const arabicFor = (name:string) => {
 const key=name.toLowerCase().trim(),base=shared(key);
 return EXPLANATIONS_AR[key] ?? EXPLANATIONS_AR[base] ?? EXPLANATIONS_AR[qualified(base) ?? ''];
};
export function explanation(name:string,system:SystemId,sex:Sex='male',language:Language='en'){
 if(language==='ar'){
  const own=arabicFor(name);
  if(own)return own;
  const note=SYSTEMS_AR[system]?.description;
  if(note&&!entryFor(name))return note;
 }
 return entryFor(name) ?? SYSTEM_NOTES[sex][system] ?? SYSTEMS.find(s=>s.id===system)?.description ?? '';
}
