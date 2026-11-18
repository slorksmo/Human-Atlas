/** FDI World Dental Federation notation (ISO 3950): each permanent tooth gets a
 * two-digit number — quadrant (1 upper right, 2 upper left, 3 lower left,
 * 4 lower right, viewed from the patient's own left/right) then position
 * from the midline (1 central incisor .. 8 third molar).
 *
 * This atlas has no third molars (wisdom teeth) in either reference body, so
 * FDI 18/28/38/48 are listed with no matching structure. Positions 1-7 map
 * onto every source name below by side, jaw, and tooth type.
 */
export interface ToothFDI {fdi:number;quadrant:1|2|3|4;position:1|2|3|4|5|6|7|8;name:string;sourceName:string|null}

const POSITION:{position:1|2|3|4|5|6|7;word:string}[] = [
 {position:1,word:'central incisor'},
 {position:2,word:'lateral incisor'},
 {position:3,word:'canine'},
 {position:4,word:'first premolar'},
 {position:5,word:'second premolar'},
 {position:6,word:'first molar'},
 {position:7,word:'second molar'},
];
/** Quadrant 1: upper right. 2: upper left. 3: lower left. 4: lower right —
 * the FDI system numbers clockwise from the patient's own upper right. */
const QUADRANT:{quadrant:1|2|3|4;side:'right'|'left';jaw:'upper'|'lower'}[] = [
 {quadrant:1,side:'right',jaw:'upper'},
 {quadrant:2,side:'left',jaw:'upper'},
 {quadrant:3,side:'left',jaw:'lower'},
 {quadrant:4,side:'right',jaw:'lower'},
];
const sourceNameFor = (side:string,jaw:string,word:string) => {
 const type = word==='first premolar'||word==='second premolar' ? word.replace('premolar','secondary premolar')
   : word==='first molar'||word==='second molar' ? word.replace('molar','secondary molar')
   : word==='central incisor'||word==='lateral incisor' ? `${word.split(' ')[0]} secondary incisor`
   : 'secondary canine';
 return `${side} ${jaw} ${type} tooth`;
};

export const TEETH:ToothFDI[] = QUADRANT.flatMap(({quadrant,side,jaw}) =>
 [...POSITION,{position:8 as const,word:'third molar'}].map(({position,word}) => ({
  fdi:quadrant*10+position,
  quadrant,position,
  name:`${jaw==='upper'?'Upper':'Lower'} ${side} ${word}`,
  sourceName: position===8 ? null : sourceNameFor(side,jaw,word),
 })),
);
export const toothByFdi = (fdi:number) => TEETH.find(t=>t.fdi===fdi);
export const toothBySourceName = (name:string) => TEETH.find(t=>t.sourceName===name.toLowerCase());
