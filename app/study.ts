/** Study content: guided tours and a self-test, built only on structures this
 * atlas actually models — verified against the concept list before writing,
 * the same way every other claim in this project is. A tour step names a
 * concept exactly as `atlas.json` stores it; `page.tsx` resolves that name
 * the same way search does, so a stale reference fails loudly in development
 * rather than silently pointing at nothing.
 *
 * Tours are grouped by `category`: 'dental' for the OMF-specialty tours from
 * the atlas's dental section, 'general' for a first pass at the rest of the
 * body. Coverage differs sharply between the two reference bodies — the male
 * body's own source names structures the female body's does not, and vice
 * versa — so `page.tsx` only offers a tour once every one of its steps is
 * confirmed present in the active body, rather than failing partway through.
 *
 * This is educational content, not clinical guidance, and — like the rest of
 * the project's medical text — it is written from established anatomy, not
 * verified by a medical professional. Treat it as a first draft for review.
 */
export interface TourStep {concept:string;note:string}
export interface Tour {id:string;category:'dental'|'general';title:string;summary:string;steps:TourStep[]}
export interface QuizQuestion {id:string;question:string;options:string[];correct:number;explanation:string}

export const TOURS:Tour[] = [
 {
  id:'fdi-notation',
  category:'dental',
  title:'Permanent dentition and FDI notation',
  summary:'One tooth from each quadrant, to learn how the two-digit FDI number is built.',
  steps:[
   {concept:'right upper central secondary incisor tooth',note:'FDI numbering starts at the patient\'s own upper right: the first digit, 1, names this quadrant. The second digit counts outward from the midline, so the central incisor — closest to the midline — is position 1. Together: 11.'},
   {concept:'left upper central secondary incisor tooth',note:'Cross the midline into the upper left, quadrant 2. Same tooth, same position from the midline: 21.'},
   {concept:'left lower central secondary incisor tooth',note:'Down to the lower left, quadrant 3: 31.'},
   {concept:'right lower central secondary incisor tooth',note:'And the lower right closes the circle, quadrant 4: 41. The four quadrants are numbered clockwise from the patient\'s own upper right, not the viewer\'s.'},
   {concept:'right upper first secondary molar tooth',note:'Positions run outward from the midline: 1 central incisor, 2 lateral incisor, 3 canine, 4 and 5 premolars, 6 and 7 molars. This first molar, sixth from the midline in the upper right, is FDI 16. This atlas models teeth 1 through 7 in each quadrant; third molars are not part of its source.'},
  ],
 },
 {
  id:'jaw-bones',
  category:'dental',
  title:'The bones of the jaw',
  summary:'Mandible, maxilla, and the temporal bone that the jaw joint sits in.',
  steps:[
   {concept:'mandible',note:'The lower jaw — the only bone of the skull that moves freely. Its condyle, at the back of each side, is one half of the jaw joint.'},
   {concept:'right maxilla',note:'The upper jaw, fixed to the rest of the skull. It carries the upper teeth and forms the floor of the eye socket above.'},
   {concept:'left maxilla',note:'The maxilla is a paired bone, meeting its twin at the midline of the hard palate and the bridge between the nostrils.'},
   {concept:'right temporal bone',note:'The mandibular condyle sits against this bone\'s socket to form the temporomandibular joint. Its position, just in front of the ear, is why TMJ pain is so often felt there.'},
  ],
 },
 {
  id:'tmj-region',
  category:'dental',
  title:'The temporomandibular joint and its muscle',
  summary:'The two bones of the joint, and the one muscle of mastication this atlas can show — borrowed from a separate source, since the reference bodies themselves model none.',
  steps:[
   {concept:'right temporal bone',note:'The upper half of the joint. Its articular surface is on the underside of the skull, just in front of the ear.'},
   {concept:'mandible',note:'The condyle of the mandible is the joint\'s lower, moving half.'},
   {concept:'sphenoid bone',note:'The lateral pterygoid, next, runs from here — the lateral pterygoid plate and the greater wing of the sphenoid — to the mandible and the joint itself.'},
   {concept:'Lateral pterygoid, inferior head (left)',note:'The larger, lower head: sphenoid to the neck of the mandible. Both sides acting together protrude and open the jaw; one side alone swings it to the opposite side.'},
   {concept:'Lateral pterygoid, superior head (left)',note:'The smaller, upper head reaches the joint\'s own disc, steadying it as the mouth closes. This muscle is borrowed from an independent open source — a different person\'s anatomy fitted to this body\'s own mandible and sphenoid — because neither reference body\'s own source models any muscle of mastication.'},
  ],
 },
 {
  id:'salivary-glands',
  category:'dental',
  title:'The major salivary glands of the floor of the mouth',
  summary:'Submandibular and sublingual, compared side by side. This atlas does not model the parotid gland.',
  steps:[
   {concept:'right submandibular gland',note:'Beneath the floor of the mouth, near the angle of the mandible. It supplies most of the saliva produced at rest.'},
   {concept:'left submandibular gland',note:'The same gland, the other side, for a sense of the pair\'s size and symmetry.'},
   {concept:'right sublingual gland',note:'The smallest of the major salivary glands, tucked under the tongue itself, forward of the submandibular gland.'},
   {concept:'left sublingual gland',note:'Its mirror on the left. Both drain through several small ducts directly into the floor of the mouth, unlike the submandibular gland\'s single main duct.'},
  ],
 },
 {
  id:'bony-palate',
  category:'dental',
  title:'The bony palate',
  summary:'The two bones that make the roof of the mouth, and the soft tissue that continues it back.',
  steps:[
   {concept:'right maxilla',note:'The front, larger part of the hard palate is formed by the maxilla — specifically its palatine process, though this atlas models the maxilla as one piece.'},
   {concept:'right palatine bone',note:'Behind the maxilla, this small bone\'s horizontal plate completes the hard palate toward the throat.'},
   {concept:'left palatine bone',note:'Its pair on the left meets it at the midline, the same suture line the two maxillae meet along further forward.'},
   {concept:'soft palate',note:'Past the back edge of the hard palate, the soft palate continues as muscle and mucosa, lifting during swallowing to close off the nasal cavity.'},
  ],
 },
 {
  id:'heart-circuit',
  category:'general',
  title:'The heart and the circuit of blood',
  summary:'Superior vena cava to aorta — one full circuit of blood through the heart\'s chambers and great vessels.',
  steps:[
   {concept:'superior vena cava',note:'Deoxygenated blood from the head, neck, and arms drains into the right side of the heart here — the larger of the two great veins that empty into the right atrium (the inferior vena cava carries the rest, from the trunk and legs).'},
   {concept:'right ventricle',note:'From the right atrium, blood crosses the tricuspid valve into this chamber, which pumps it onward — not to the body, but to the lungs.'},
   {concept:'pulmonary trunk',note:'The right ventricle\'s only outlet, carrying oxygen-poor blood to both lungs to be reoxygenated — the one artery in the body that does not carry oxygen-rich blood.'},
   {concept:'left ventricle',note:'Oxygenated blood returns from the lungs to the left atrium, crosses the mitral valve, and fills this chamber — by far the thickest-walled of the four, built to drive blood through the entire body rather than just to the lungs next door.'},
   {concept:'aorta',note:'The left ventricle\'s only outlet and the body\'s largest artery, carrying oxygenated blood out to every organ before the cycle begins again at the veins.'},
  ],
 },
 {
  id:'airway',
  category:'general',
  title:'The airway, from throat to lung',
  summary:'Trachea to diaphragm, tracing the path air takes into the chest.',
  steps:[
   {concept:'trachea',note:'The windpipe, held open by cartilage rings so it never collapses, running down from the larynx into the chest before it splits in two.'},
   {concept:'right main bronchus',note:'The trachea divides at a ridge called the carina. The right branch is shorter, wider, and steeper than the left — which is why an inhaled object more often ends up in the right lung.'},
   {concept:'left main bronchus',note:'The left branch is longer and narrower, angled more sharply to curve around the heart, which sits mostly to the left of the midline.'},
   {concept:'right lung',note:'Divided into three lobes, the right lung is slightly larger than the left — which instead yields room to the heart.'},
   {concept:'diaphragm',note:'The dome-shaped muscle beneath the lungs that does most of the work of breathing, flattening on contraction to draw air in.'},
  ],
 },
 {
  id:'digestive-tract',
  category:'general',
  title:'The digestive tract, start to end',
  summary:'Esophagus to large intestine, following one meal\'s path through the gut and the organs that support it.',
  steps:[
   {concept:'esophagus',note:'The muscular tube connecting throat to stomach, carrying food down by coordinated waves of contraction rather than gravity alone — swallowing works even upside down.'},
   {concept:'stomach',note:'A muscular sac that churns food into a semi-liquid mix and begins breaking down protein with acid and enzymes, before releasing it gradually into the small intestine.'},
   {concept:'liver',note:'The body\'s largest internal organ, filtering blood arriving from the intestines before it reaches the rest of the body, and producing the bile that helps digest fat.'},
   {concept:'pancreas',note:'Sitting behind the stomach, it releases digestive enzymes into the small intestine and, separately, the insulin that regulates blood sugar.'},
   {concept:'large intestine',note:'Where the digestive tract\'s contents lose most of their remaining water before leaving the body, over the day or so they spend here.'},
  ],
 },
 {
  id:'brain-landmarks',
  category:'general',
  title:'The brain\'s major landmarks',
  summary:'Cerebral hemisphere to spinal cord, a first tour of the central nervous system.',
  steps:[
   {concept:'right cerebral hemisphere',note:'One half of the cerebrum, the largest part of the brain, folded into ridges and grooves that pack a large surface of grey matter into the skull.'},
   {concept:'corpus callosum',note:'A thick band of white matter, roughly 200 million nerve fibres, connecting the two cerebral hemispheres and letting them share information.'},
   {concept:'cerebellum',note:'Tucked beneath the cerebrum at the back of the skull, it fine-tunes movement and balance rather than initiating them — damage here produces clumsiness, not paralysis.'},
   {concept:'brainstem',note:'The stalk connecting the brain to the spinal cord, and the site of the centres that regulate breathing and heart rate without any conscious input.'},
   {concept:'spinal cord',note:'The brainstem\'s continuation down the vertebral canal, relaying signals between the brain and the rest of the body and running the simple reflexes that don\'t need the brain at all.'},
  ],
 },
 {
  id:'skeleton-overview',
  category:'general',
  title:'The skeleton: axial and appendicular',
  summary:'Skull to femur, the difference between the skeleton\'s central axis and the limbs that hang from it.',
  steps:[
   {concept:'skull',note:'The bones of the head, braincase and face together, protecting the brain and housing the organs of sight, smell, hearing, and taste.'},
   {concept:'vertebral column',note:'Thirty-three vertebrae stacked from skull to pelvis, protecting the spinal cord and giving the trunk its flexibility.'},
   {concept:'rib cage',note:'Twelve pairs of ribs, most of them reaching the sternum at the front, forming a flexible cage around the heart and lungs that expands and contracts with every breath.'},
   {concept:'right hip bone',note:'Where the axial skeleton meets the leg: the hip bone anchors the femur and transmits the whole upper body\'s weight down into it while standing.'},
   {concept:'right femur',note:'The thigh bone, the longest and strongest bone in the body, running from the hip joint to the knee.'},
  ],
 },
];

export const QUIZ:QuizQuestion[] = [
 {id:'q1',question:'In FDI notation, what does the first digit of a tooth\'s two-digit number identify?',
  options:['The tooth\'s quadrant','The tooth\'s position from the midline','Whether the tooth is upper or lower only','The patient\'s age group'],
  correct:0,explanation:'The first digit names one of the four quadrants, numbered clockwise from the patient\'s own upper right (1) through upper left (2), lower left (3), to lower right (4).'},
 {id:'q2',question:'A tooth is recorded as FDI 24. Where is it?',
  options:['Upper right, second premolar','Upper left, first premolar','Lower left, fourth molar','Upper left, lateral incisor'],
  correct:1,explanation:'Quadrant 2 is the upper left. Position 4 is the first premolar — positions run 1 central incisor, 2 lateral incisor, 3 canine, 4 and 5 premolars, 6 and 7 molars from the midline outward.'},
 {id:'q3',question:'Which permanent tooth does this atlas not model?',
  options:['Central incisor','First molar','Third molar (wisdom tooth)','Canine'],
  correct:2,explanation:'The source dataset carries 28 of the 32 permanent teeth — every position except the third molars, so FDI 18, 28, 38, and 48 have no matching structure here.'},
 {id:'q4',question:'The mandibular condyle articulates with which bone to form the temporomandibular joint?',
  options:['The sphenoid','The temporal bone','The maxilla','The zygomatic bone'],
  correct:1,explanation:'The joint forms between the condyle of the mandible and the articular surface of the temporal bone, just in front of the ear.'},
 {id:'q5',question:'Which muscle of mastication does this atlas include?',
  options:['Masseter','Temporalis','Lateral pterygoid','Buccinator'],
  correct:2,explanation:'Of the four muscles of mastication, only the lateral pterygoid is available from an open-licensed source at the time of writing; it is borrowed from a third, independent reference and marked as such.'},
 {id:'q6',question:'What does the superior head of the lateral pterygoid attach to, that the inferior head does not?',
  options:['The mandibular condyle','The joint\'s own disc','The coronoid process','The zygomatic arch'],
  correct:1,explanation:'The superior head reaches the temporomandibular joint\'s disc directly, steadying it as the mouth closes — a role the larger inferior head, running to the neck of the mandible, does not share.'},
 {id:'q7',question:'Which of the maxilla\'s neighbours completes the hard palate toward the throat?',
  options:['The vomer','The palatine bone','The zygomatic bone','The ethmoid'],
  correct:1,explanation:'The maxilla forms the front, larger part of the hard palate; the palatine bone\'s horizontal plate completes it further back.'},
 {id:'q8',question:'Which major salivary gland has several small ducts opening directly into the floor of the mouth, rather than one main duct?',
  options:['The parotid gland','The submandibular gland','The sublingual gland','The lacrimal gland'],
  correct:2,explanation:'The sublingual gland, the smallest of the three major salivary glands, drains through multiple small ducts. The submandibular gland instead has a single main duct.'},
 {id:'q9',question:'The submandibular gland sits near which landmark?',
  options:['The angle of the mandible','The temporomandibular joint','The hard palate','The zygomatic arch'],
  correct:0,explanation:'It lies beneath the floor of the mouth, close to the angle of the mandible, and supplies most resting saliva.'},
 {id:'q10',question:'Which bone is unpaired at the skull\'s midline and forms part of both the jaw joint region and the base of the skull?',
  options:['The maxilla','The palatine bone','The sphenoid bone','The temporal bone'],
  correct:2,explanation:'The sphenoid is a single midline bone. Its greater wing and pterygoid plate give origin to the lateral pterygoid, and it forms part of the floor of the skull.'},
 {id:'q11',question:'Which chamber of the heart pumps blood into the pulmonary trunk?',
  options:['Left atrium','Right ventricle','Left ventricle','Right atrium'],
  correct:1,explanation:'The right ventricle\'s only outlet is the pulmonary trunk, which carries oxygen-poor blood to the lungs — the one artery in the body that does not carry oxygen-rich blood.'},
 {id:'q12',question:'Which vessel is the left ventricle\'s only outlet?',
  options:['Superior vena cava','Pulmonary trunk','Aorta','Coronary sinus'],
  correct:2,explanation:'The aorta carries oxygenated blood from the left ventricle out to the whole body; the pulmonary trunk instead carries blood from the right ventricle to the lungs.'},
 {id:'q13',question:'Where does the trachea divide into its two main bronchi?',
  options:['The carina','The larynx','The pharynx','The hilum'],
  correct:0,explanation:'The trachea splits into the right and left main bronchi at a ridge called the carina.'},
 {id:'q14',question:'Why is an inhaled object more likely to end up in the right lung than the left?',
  options:['The right lung is smaller','The right main bronchus is shorter and steeper','The left lung has no bronchus','The right lung alone has lobes'],
  correct:1,explanation:'The right main bronchus is shorter, wider, and more vertical than the left, which curves more sharply to make room for the heart — so foreign objects more often fall into the right lung.'},
 {id:'q15',question:'Which organ produces the bile used to digest fat?',
  options:['Pancreas','Gallbladder','Liver','Spleen'],
  correct:2,explanation:'The liver produces bile; the gallbladder stores and concentrates it between meals but does not make it.'},
 {id:'q16',question:'Besides digestive enzymes, what does the pancreas release directly into the bloodstream?',
  options:['Bile','Insulin','Hydrochloric acid','Bilirubin'],
  correct:1,explanation:'The pancreas has two roles: digestive enzymes released into the small intestine, and hormones — insulin among them — released directly into the blood to regulate blood sugar.'},
 {id:'q17',question:'What connects the brain\'s two cerebral hemispheres?',
  options:['The brainstem','The cerebellum','The corpus callosum','The spinal cord'],
  correct:2,explanation:'The corpus callosum is a thick band of roughly 200 million nerve fibres linking the two hemispheres so they can share information.'},
 {id:'q18',question:'Damage to the cerebellum most typically produces which effect?',
  options:['Paralysis of one side of the body','Loss of a specific memory','Clumsiness and poor balance','Loss of the sense of smell'],
  correct:2,explanation:'The cerebellum fine-tunes movement and balance rather than initiating it, so damage there tends to produce incoordination rather than paralysis.'},
 {id:'q19',question:'The vertebral column\'s central canal primarily protects which structure?',
  options:['The aorta','The spinal cord','The trachea','The esophagus'],
  correct:1,explanation:'The vertebral column\'s central canal houses and protects the spinal cord along its full length.'},
 {id:'q20',question:'Which bone is the longest and strongest in the human body?',
  options:['The humerus','The tibia','The femur','The sternum'],
  correct:2,explanation:'The femur, running from the hip joint to the knee, is both the longest and the strongest bone in the body.'},
];
