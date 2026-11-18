import {flushSync} from 'react-dom';
import {registerAtlasTools} from './agent-tools';
import {useEffect,useMemo,useRef,useState} from 'react';
import {Activity,ArrowUpRight,ChevronRight,Focus,GraduationCap,Info,Layers3,Pause,RotateCcw,RotateCw,Search,X} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Slider} from '@/components/ui/slider';
import {Switch} from '@/components/ui/switch';
import {Sheet,SheetContent,SheetTitle,SheetDescription} from '@/components/ui/sheet';
import {Combobox,ComboboxInput,ComboboxContent,ComboboxList,ComboboxItem,ComboboxEmpty} from '@/components/ui/combobox';
import {Select,SelectContent,SelectItem,SelectTrigger} from '@/components/ui/select';
import AnatomyScene from './scene';
import {EDITIONS,SYSTEMS,defaultVisible,described,edition,edition_,explanation,systemName,term,type Atlas,type Concept,type SceneState,type Sex,type SystemId,type View} from './anatomy';
import {LANGUAGES,direction,fold,say,type Language} from './i18n';
import {toothBySourceName} from './fdi-teeth';
import {TOURS,QUIZ,type Tour} from './study';
import {fdiArabic,fdiQuizArabic} from './study-ar';
import {atlasLink,readProgress,saveProgress} from './study-progress';
const initial=(sex:Sex):SceneState=>({explode:0,visible:defaultVisible(sex),selected:[],isolate:false,view:'three-quarter',rotate:false,reset:0});
export default function Home(){
 const detailTitle=useRef<HTMLHeadingElement>(null);
 const [entry]=useState(()=>new URLSearchParams(location.search));
 const [sex,setSex]=useState<Sex>(entry.get('body')==='female'?'female':'male');
 const [language,setLanguage]=useState<Language>(entry.get('lang')==='ar'?'ar':'en');
 const lessonOnly=entry.get('tour')==='fdi-notation';
 const pendingEntry=useRef(true);
 const languageRef=useRef(language);
 languageRef.current=language;
 const t=(phrase:Parameters<typeof say>[1])=>say(language,phrase);
 const name=(text:string)=>term(text,language);
 const rtl=direction(language)==='rtl';
 // The document carries the language so the browser hyphenates, aligns and
 // orders punctuation correctly, and so `dir`-based styling applies.
 useEffect(()=>{document.documentElement.lang=language;document.documentElement.dir=direction(language);},[language]);
 const [atlas,setAtlas]=useState<Atlas|null>(null),[state,setState]=useState(()=>initial('male')),[progress,setProgress]=useState(0),[error,setError]=useState(''),[panel,setPanel]=useState<'layers'|'search'|'study'|null>(null),[details,setDetails]=useState(false),[about,setAbout]=useState(false),[query,setQuery]=useState(''),[chosen,setChosen]=useState<Concept|null>(null);
 const tooth=chosen?toothBySourceName(chosen.name):undefined;
 const [studyView,setStudyView]=useState<'list'|'tour'|'quiz'>('list'),[activeTour,setActiveTour]=useState<Tour|null>(null),[tourStep,setTourStep]=useState(0);
 const [quizIndex,setQuizIndex]=useState(0),[quizSelected,setQuizSelected]=useState<number|null>(null),[quizScore,setQuizScore]=useState(0),[quizDone,setQuizDone]=useState(false);
 const source=edition_(sex,language);
 useEffect(()=>{const abort=new AbortController();setProgress(0);setError('');setAtlas(null);setChosen(null);setDetails(false);setPanel(null);setQuery('');setState(initial(sex));setStudyView('list');setActiveTour(null);setTourStep(0);if(lessonOnly)pendingEntry.current=true;fetch(lessonOnly?`/models/fdi-${sex}.json`:edition(sex).manifest,{signal:abort.signal}).then(r=>{if(!r.ok)throw new Error(say(languageRef.current,'catalogueError'));return r.json();}).then(data=>{if(!abort.signal.aborted)setAtlas(data as Atlas);}).catch(e=>{if(!abort.signal.aborted)setError(e.message);});return()=>abort.abort();},[sex,lessonOnly]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(!lessonOnly&&e.key==='/'&&!(e.target instanceof HTMLInputElement)&&!(e.target instanceof HTMLTextAreaElement)){e.preventDefault();setPanel('search');setDetails(false);}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[]);
 const parts=useMemo(()=>new Map(atlas?.parts.map(p=>[p.id,p])),[atlas]);
 const counts=useMemo(()=>Object.fromEntries(SYSTEMS.map(s=>[s.id,atlas?.parts.filter(p=>p.system===s.id).length??0])),[atlas]);
 const activeSystems=SYSTEMS.filter(s=>counts[s.id]>0);
 const selectedParts=state.selected.map(id=>parts.get(id)).filter(p=>!!p),selected=selectedParts[0],system=SYSTEMS.find(s=>s.id===selected?.system);
 const visibleCount=atlas?.parts.filter(p=>state.isolate?state.selected.includes(p.id):state.visible.includes(p.system)||state.selected.includes(p.id)).length??0;
 const results=useMemo(()=>{if(!atlas)return[];const term=query.toLowerCase().trim();if(!term)return edition(atlas.sex??'male').suggestions.map(name=>atlas.concepts.find(c=>c.name.toLowerCase()===name)).filter((x):x is Concept=>!!x);const folded=fold(term);return atlas.concepts.filter(c=>c.name.toLowerCase().includes(term)||c.id.toLowerCase().includes(term)||fold(name(c.name)).includes(folded)).sort((a,b)=>a.name.length-b.name.length).slice(0,80);},[atlas,query,language]);
 const choose=(c:Concept)=>{setChosen(c);setState(s=>({...s,selected:c.elements,isolate:false,rotate:false}));setDetails(true);setPanel(null);};
 useEffect(()=>{if(!atlas)return;return registerAtlasTools(atlas,c=>flushSync(()=>choose(c)));},[atlas]);
 const choosePart=(id:string)=>{const p=parts.get(id);if(!p)return;setChosen({id:p.conceptId,name:p.name,elements:[id]});setState(s=>({...s,selected:[id],isolate:false,rotate:false}));setDetails(true);setPanel(null);};
 const toggle=(id:SystemId)=>{setDetails(false);setState(s=>({...s,selected:[],isolate:false,visible:s.visible.includes(id)?s.visible.filter(x=>x!==id):[...s.visible,id]}));};
 const reset=()=>{setState(s=>({...initial(sex),reset:s.reset+1}));setChosen(null);setDetails(false);setPanel(null);};
 const openPanel=(next:'layers'|'search'|'study')=>{setDetails(false);setPanel(p=>p===next?null:next);if(next==='study'){setStudyView('list');setActiveTour(null);}};
 const availableTours=useMemo(()=>atlas?TOURS.filter(tour=>tour.steps.every(step=>atlas.concepts.some(c=>c.name.toLowerCase()===step.concept.toLowerCase()))):[],[atlas]);
 const [linkStatus,setLinkStatus]=useState<'copied'|'failed'|'invalid'|null>(null);
 const [quizMode,setQuizMode]=useState<'all'|'fdi'>('all');
 const quiz=quizMode==='fdi'?QUIZ.slice(0,3):QUIZ;
 const quizQuestion=rtl?{...quiz[quizIndex],...fdiQuizArabic[quizIndex]}:quiz[quizIndex];
 const tourTitle=(tour:Tour)=>rtl&&tour.id==='fdi-notation'?fdiArabic.title:tour.title;
 const copyLink=async (target:Parameters<typeof atlasLink>[2])=>{
  try{await navigator.clipboard.writeText(atlasLink(sex,language,target).href);setLinkStatus('copied');}
  catch{setLinkStatus('failed');}
 };
 const selectForTour=(conceptName:string)=>{const c=atlas?.concepts.find(x=>x.name.toLowerCase()===conceptName.toLowerCase());if(!c)return;setChosen(c);setState(s=>({...s,selected:c.elements,isolate:true,rotate:false}));};
 const startTour=(tour:Tour,requested?:number)=>{const saved=requested??readProgress(sex).tours?.[tour.id];const step=typeof saved==='number'&&Number.isInteger(saved)&&saved>=0&&saved<tour.steps.length?saved:0;setActiveTour(tour);setTourStep(step);setStudyView('tour');selectForTour(tour.steps[step].concept);saveProgress(sex,'tours',tour.id,step);};
 const tourStepTo=(i:number)=>{if(!activeTour)return;setTourStep(i);setLinkStatus(null);selectForTour(activeTour.steps[i].concept);saveProgress(sex,'tours',activeTour.id,i);};
 const exitTour=()=>{setActiveTour(null);setStudyView('list');setState(s=>({...s,selected:[],isolate:false}));setChosen(null);};
 const answerQuiz=(i:number)=>{if(quizSelected!=null)return;setQuizSelected(i);if(i===quiz[quizIndex].correct)setQuizScore(s=>s+1);};
 const nextQuiz=()=>{if(quizIndex<quiz.length-1){setQuizIndex(i=>i+1);setQuizSelected(null);}else{saveProgress(sex,'scores',quizMode,quizScore);setQuizDone(true);}};
 const startQuiz=(mode:'all'|'fdi')=>{setQuizMode(mode);setQuizIndex(0);setQuizSelected(null);setQuizScore(0);setQuizDone(false);setStudyView('quiz');};
 useEffect(()=>{
  if(!atlas||!pendingEntry.current)return;
  pendingEntry.current=false;
  const tourId=entry.get('tour'),partId=entry.get('part');
  if(tourId){
   const tour=availableTours.find(item=>item.id===tourId);
   const step=entry.get('step');
   setPanel('study');
   if(tour)startTour(tour,step===null?undefined:Number(step)-1);
   else setLinkStatus('invalid');
  }else if(partId){
   const part=parts.get(partId);
   const concept=atlas.concepts.find(item=>item.id===partId);
   if(part)choosePart(part.id);
   else if(concept)choose(concept);
   else{setLinkStatus('invalid');return;}
   setState(s=>({...s,isolate:true}));
  }
 },[atlas,availableTours,entry,parts]);
 const tourConcept=activeTour?atlas?.concepts.find(x=>x.name.toLowerCase()===activeTour.steps[tourStep].concept.toLowerCase()):undefined;
 return <main className={lessonOnly?'studio lesson-only':'studio'}>
  {atlas&&<AnatomyScene atlas={atlas} state={{...state,inspectorOpen:(details&&selectedParts.length>0)||panel==="study"}} onSelect={id=>{if(!lessonOnly)choosePart(id);}} onProgress={n=>{setProgress(n);if(n===100)setError('');}} onError={setError}/>}
  <div className="vignette"/>
  <header className="identity"><div className="eyebrow"><span className="status-dot"/> {t('eyebrow')}</div><h1>{t('title')}<Badge variant="outline" className="edition">3D</Badge></h1><div className="identity-meta">{atlas?atlas.parts.length.toLocaleString('en'):'—'} {t('pieces')} <span>·</span> {source.dataset}</div>
   <div className="anatomy-choice"><Select value={sex} onValueChange={value=>setSex(value as Sex)}><SelectTrigger aria-label={t('referenceBodyLabel')}><span>{rtl?`${t('referenceBody')} ${source.label}`:`${source.label} ${t('referenceBody')}`}</span></SelectTrigger><SelectContent className="anatomy-choice-menu">{EDITIONS.map(e=><SelectItem key={e.sex} value={e.sex}>{rtl?`${t('referenceBody')} ${edition_(e.sex,language).label}`:`${e.label} ${t('referenceBody')}`}</SelectItem>)}</SelectContent></Select></div></header>
  <nav className="top-actions" aria-label={t('explorerPanels')}><Button variant="ghost" className={panel==='search'?'active':''} onClick={()=>openPanel('search')} aria-label={t('searchAnatomy')}><Search size={18}/><span>{t('findStructure')}</span><kbd>/</kbd></Button><Button variant="ghost" className={panel==='study'?'active':''} onClick={()=>openPanel('study')} aria-label={t('study')}><GraduationCap size={18}/><span>{t('study')}</span></Button><Button variant="ghost" className="icon-button language-switch" aria-label={t('language')} title={t('language')} onClick={()=>setLanguage(l=>l==='en'?'ar':'en')}><span>{LANGUAGES.find(l=>l.id!==language)?.label}</span></Button><Button variant="ghost" className="icon-button" aria-label={t('aboutThisAtlas')} onClick={()=>{setDetails(false);setPanel(null);setAbout(true);}}><Info size={18}/></Button></nav>
  <section className={`layers-panel glass ${panel==='layers'?'mobile-open':''}`} aria-label={t('anatomicalLayers')}>
   <div className="panel-heading"><span>{t('systems')}</span><Button variant="ghost" className="mobile-only icon-button" onClick={()=>setPanel(null)} aria-label={t('closeSystems')}><X size={18}/></Button><Badge variant="secondary" className="desktop-only small-number">{activeSystems.length}</Badge></div>
   <div className="layer-presets"><Button variant="ghost" aria-pressed={activeSystems.every(x=>state.visible.includes(x.id))} onClick={()=>setState(s=>({...s,selected:[],isolate:false,visible:activeSystems.map(x=>x.id)}))}>{t('presetAll')}</Button><Button variant="ghost" aria-pressed={state.visible.length===1&&state.visible[0]==='skeletal'} onClick={()=>setState(s=>({...s,selected:[],isolate:false,visible:['skeletal']}))}>{t('presetSkeleton')}</Button><Button variant="ghost" aria-pressed={state.visible.length===6&&['cardiac','respiratory','digestive','urinary','endocrine','reproductive'].every(id=>state.visible.includes(id as SystemId))} onClick={()=>setState(s=>({...s,selected:[],isolate:false,visible:['cardiac','respiratory','digestive','urinary','endocrine','reproductive']}))}>{t('presetOrgans')}</Button></div>
   <div className="system-list">{activeSystems.map(s=><div className={`system-row ${state.visible.includes(s.id)?'enabled':''}`} key={s.id}><Button variant="ghost" className="system-name" title={`${t('showOnly')} ${systemName(s.id,language)}`} onClick={()=>setState(v=>({...v,visible:[s.id],isolate:false,selected:[]}))}><span className="system-dot" style={{background:s.color}}/>{systemName(s.id,language)}<span className="system-count">{counts[s.id]}</span></Button><Switch checked={state.visible.includes(s.id)} onCheckedChange={()=>toggle(s.id)} aria-label={`${t('show')} ${systemName(s.id,language)}`} /></div>)}</div>
   <div className="panel-foot"><span>{visibleCount.toLocaleString('en')} {t('piecesVisible')}</span><Button variant="ghost" onClick={()=>setState(s=>({...s,visible:[],selected:[],isolate:false}))}>{t('hideAll')}</Button></div>
  </section>
  {panel==='search'&&<section className="search-panel glass" aria-label={t('findAnatomy')}><div className="panel-heading"><span>{t('findStructure')}</span><Button variant="ghost" className="icon-button" onClick={()=>setPanel(null)} aria-label={t('closeSearch')}><X size={18}/></Button></div><Combobox<Concept> items={results} value={null} onValueChange={value=>{if(value)choose(value);}} inputValue={query} onInputValueChange={setQuery} itemToStringLabel={c=>name(c.name)} filter={null} open onOpenChange={open=>{if(!open)setPanel(null);}}><ComboboxInput autoFocus placeholder={t('searchPlaceholder')} aria-label={t('searchNamed')} showTrigger={false}/><ComboboxContent className="anatomy-search-results"><ComboboxEmpty>{t('noMatches')}</ComboboxEmpty><ComboboxList>{(c:Concept)=><ComboboxItem key={c.id} value={c}><span className="search-result-name">{name(c.name)}</span><span className="small-number">{c.elements.length} {c.elements.length===1?t('piece'):t('pieces_plural')}</span></ComboboxItem>}</ComboboxList></ComboboxContent></Combobox><p className="search-note">{query?t('searchHintTyping'):t('searchHintEmpty')}</p></section>}
  {panel==='study'&&<section className="study-panel glass" aria-label={t('study')}>
   <div className="panel-heading"><span>{t('study')}</span>{lessonOnly?<Button variant="ghost" onClick={()=>location.assign(`?body=${sex}&lang=${language}`)}>{t('fullAtlas')}</Button>:<Button variant="ghost" className="icon-button" onClick={()=>setPanel(null)} aria-label={t('closeStudy')}><X size={18}/></Button>}</div>
   {studyView==='list'&&<>
    <p className="search-note">{t('studyIntro')}</p>
    {rtl&&!lessonOnly&&<p className="search-note">{t('studyEnglishOnly')}</p>}
    <div className="tour-list">
     {(lessonOnly?['dental'] as const:['dental','general'] as const).map(cat=><div className="tour-group" key={cat}>
      <h3 className="tour-group-label">{t(cat==='dental'?'dentalTours':'generalTours')}</h3>
      {TOURS.filter(tour=>tour.category===cat&&(!lessonOnly||tour.id==='fdi-notation')).map(tour=>{const available=availableTours.some(a=>a.id===tour.id);return <Button key={tour.id} variant="ghost" className={`tour-card ${available?'':'tour-unavailable'}`} disabled={!available} onClick={()=>startTour(tour)}><strong>{tourTitle(tour)}</strong><span>{rtl&&tour.id==='fdi-notation'?fdiArabic.summary:tour.summary}</span>{!available&&<span className="tour-unavailable-note">{t('tourUnavailable')}</span>}</Button>;})}
     </div>)}
     <Button variant="ghost" className="tour-card" onClick={()=>startQuiz('fdi')}><strong>{t('fdiTest')}</strong><span>3 {t('questions')}{readProgress(sex).scores?.fdi!=null&&` · ${t('lastScore')} ${readProgress(sex).scores?.fdi}/3`}</span></Button>
     {!lessonOnly&&<Button variant="ghost" className="tour-card" onClick={()=>startQuiz('all')}><strong>{t('selfTest')}</strong><span>{QUIZ.length} {t('questions')}{readProgress(sex).scores?.all!=null&&` · ${t('lastScore')} ${readProgress(sex).scores?.all}/${QUIZ.length}`}</span></Button>}
    </div>
    <p className="search-note">{t('studyDisclaimer')}</p>
   </>}
   {studyView==='tour'&&activeTour&&<div className="tour-player">
    <div className="tour-progress"><span>{tourTitle(activeTour)}</span><span>{t('stepOf')} {tourStep+1}/{activeTour.steps.length}</span></div>
    <div className="tour-step-title">{rtl&&activeTour.id==='fdi-notation'?fdiArabic.steps[tourStep].title:tourConcept?name(tourConcept.name):activeTour.steps[tourStep].concept}</div>
    <p className="tour-step-note">{rtl&&activeTour.id==='fdi-notation'?fdiArabic.steps[tourStep].note:activeTour.steps[tourStep].note}</p>
    <Button variant="ghost" onClick={()=>copyLink({tour:activeTour.id,step:tourStep+1})}>{t('copyStudyLink')}</Button>
    <div className="tour-controls"><Button variant="ghost" onClick={exitTour}>{t('backToTours')}</Button><div className="tour-controls-side"><Button variant="ghost" disabled={tourStep===0} onClick={()=>tourStepTo(tourStep-1)}>{t('previous')}</Button>{tourStep<activeTour.steps.length-1?<Button variant="ghost" onClick={()=>tourStepTo(tourStep+1)}>{t('next')}</Button>:<Button variant="ghost" onClick={()=>{exitTour();if(activeTour.id==='fdi-notation')startQuiz('fdi');}}>{t(activeTour.id==='fdi-notation'?'fdiTest':'finishTour')}</Button>}</div></div>
   </div>}
   {studyView==='quiz'&&<div className="quiz-card">
    {!quizDone?<>
     <div className="quiz-progress"><span>{t('questionOf')} {quizIndex+1}/{quiz.length}</span><span>{t('yourScore')}: {quizScore}</span></div>
     <p className="quiz-question">{quizQuestion.question}</p>
     <div className="quiz-options">{quizQuestion.options.map((opt,i)=><Button key={i} variant="ghost" className={`quiz-option ${quizSelected!=null?(i===quiz[quizIndex].correct?'correct':i===quizSelected?'incorrect':''):''}`} disabled={quizSelected!=null} onClick={()=>answerQuiz(i)}>{opt}</Button>)}</div>
     {quizSelected!=null&&<p className="quiz-explanation">{quizQuestion.explanation}</p>}
     <div className="tour-controls"><Button variant="ghost" onClick={()=>setStudyView('list')}>{t('backToTours')}</Button>{quizSelected!=null&&<Button variant="ghost" onClick={nextQuiz}>{quizIndex<quiz.length-1?t('nextQuestion'):t('seeResults')}</Button>}</div>
    </>:<>
     <p className="quiz-score">{t('yourScore')}: {quizScore}/{quiz.length}</p>
     <div className="tour-controls"><Button variant="ghost" onClick={()=>setStudyView('list')}>{t('backToTours')}</Button><Button variant="ghost" onClick={()=>startQuiz(quizMode)}>{t('retakeQuiz')}</Button></div>
    </>}
   </div>}
  </section>}

  {linkStatus&&<p className="share-feedback glass" role="status">{t(linkStatus==='copied'?'linkCopied':linkStatus==='failed'?'linkCopyFailed':'linkUnavailable')}</p>}
  <nav className="view-controls glass" aria-label={t('cameraControls')}>{(['three-quarter','front','side','back'] as View[]).map((v,i)=><Button variant="ghost" key={v} className={state.view===v?'active':''} aria-pressed={state.view===v} disabled={state.explode>.8&&v!=='front'} onClick={()=>setState(s=>({...s,view:v,reset:s.reset+1,rotate:false}))} title={t((['viewThreeQuarter','viewFront','viewSide','viewBack'] as const)[i])} aria-label={t((['viewThreeQuarter','viewFront','viewSide','viewBack'] as const)[i])}><span>{[rtl?'¾':'¾',rtl?'أ':'F',rtl?'ج':'S',rtl?'خ':'B'][i]}</span></Button>)}<i/><Button variant="ghost" disabled={state.explode>=.4} aria-label={state.rotate?t('pauseRotation'):t('rotateBody')} title={t('autoRotate')} className={state.rotate?'active':''} onClick={()=>setState(s=>({...s,rotate:!s.rotate}))}>{state.rotate?<Pause size={17}/>:<RotateCw size={18}/>}</Button><Button variant="ghost" aria-label={t('resetView')} title={t('reset')} onClick={reset}><RotateCcw size={17}/></Button></nav>
  <div className="scene-caption"><span className="caption-line"/><span>{state.isolate?(chosen?name(chosen.name):t('selectedStructure')):state.explode>.95?t('inventory'):state.explode>.05?t('separated'):source.caption}</span><span className="caption-line"/></div>
  <div className="bottom-dock glass"><Button variant="ghost" className="mobile-only dock-layers" onClick={()=>openPanel('layers')} aria-label="Open system layers"><Layers3 size={20}/><span>{t('systems')}</span></Button><div className="explode-control"><div className="explode-label"><label id="explode-label">{t('explode')}</label><output>{Math.round(state.explode*100)}<span>%</span></output></div><Slider aria-labelledby="explode-label" min={0} max={100} step={1} value={[state.explode*100]} onValueChange={v=>setState(s=>({...s,explode:(Array.isArray(v)?v[0]:v)/100,view:(Array.isArray(v)?v[0]:v)>80?'front':s.view,rotate:false}))}/><div className="slider-endpoints"><span>{t('assembled')}</span><span>{t('everyPiece')}</span></div></div><Button variant="ghost" className="dock-reset" onClick={reset} aria-label={t('assembleReset')}><RotateCcw size={18}/><span>{t('reset')}</span></Button></div>
  <footer className="studio-footer"><span>{state.explode>.8?t('dragToPan'):t('dragToOrbit')} <b>·</b> {t('pinchToZoom')} <b>·</b> {t('tapToInspect')}</span><Button variant="ghost" onClick={()=>{setDetails(false);setPanel(null);setAbout(true);}}>{t('sourceCredits')} <ArrowUpRight size={12}/></Button></footer>
  {progress<100&&!error&&<div className="loading glass" role="status"><Activity size={18}/><div><strong>{t('preparing')}</strong><span>{progress}% · {t('loadingBody')} {source.label.toLowerCase()} {t('reference')}</span><div className="loading-track"><i style={{width:`${progress}%`}}/></div></div></div>}
  {error&&<div className="loading glass error" role="alert"><p>{error}</p><Button variant="ghost" onClick={()=>location.reload()}>{t('reloadViewer')}</Button></div>}
  <Sheet open={details&&selectedParts.length>0} modal={false} disablePointerDismissal onOpenChange={setDetails}><SheetContent initialFocus={detailTitle} className={`detail-sheet glass ${state.isolate?'is-isolated':''}`} showCloseButton={true}><div className="detail-header"><div className="detail-accent" style={{background:system?.color}}/><div className="eyebrow">{system?systemName(system.id,language):t('anatomy')}</div><SheetTitle ref={detailTitle} tabIndex={-1} className="structure-title">{chosen?name(chosen.name):''}</SheetTitle>{chosen&&rtl&&name(chosen.name)!==chosen.name&&<span className="structure-latin">{chosen.name}</span>}</div><div className="detail-scroll" key={`${chosen?.id}-${state.isolate}`}><SheetDescription className="structure-description">{chosen&&selected?explanation(chosen.name,selected.system,sex,language):''}</SheetDescription>{chosen&&!described(chosen.name)&&<span className="context-note">{t('systemOverview')}</span>}<div className="structure-meta">{tooth&&<span>{t('fdiNotation')}<strong>{tooth.fdi}</strong></span>}<span>{t('atlasReference')}<strong>{chosen?.id}</strong></span><span>{t('selectedPieces')}<strong>{state.selected.length.toLocaleString('en')}</strong></span></div>{selectedParts.length>1&&<div className="member-list"><h3>{t('includedStructures')}</h3>{selectedParts.slice(0,50).map(p=><Button variant="ghost" key={p.id} onClick={()=>choosePart(p.id)}><span>{name(p.name)}</span><ChevronRight size={14}/></Button>)}{selectedParts.length>50&&<p>{t('and')} {selectedParts.length-50} {t('andMore')}</p>}</div>}<a className="source-link" href={source.download} target="_blank" rel="noreferrer">{t('viewSource')} <ArrowUpRight size={14}/></a></div><div className="detail-actions"><Button variant="ghost" onClick={()=>chosen&&copyLink({part:state.selected.length===1?state.selected[0]:chosen.id})}>{t('copyStudyLink')}</Button><Button className={`primary-action ${state.isolate?'active':''}`} onClick={()=>setState(s=>({...s,isolate:!s.isolate,explode:0}))}><Focus size={18}/>{state.isolate?t('showSurrounding'):t('isolate')}<ChevronRight size={16}/></Button><Button variant="ghost" className="secondary-action" onClick={()=>{setState(s=>({...s,selected:[],isolate:false}));setDetails(false);}}>{t('clearSelection')}</Button></div></SheetContent></Sheet>
  <Sheet open={about} onOpenChange={setAbout}><SheetContent className="about-sheet glass"><div className="eyebrow">{t('sourceScope')}</div><SheetTitle className="structure-title">{t('aboutTitle')}</SheetTitle><SheetDescription>{t('aboutIntro')} {source.label.toLowerCase()} {t('aboutIntroFrom')} {source.dataset}.</SheetDescription><div className="about-copy"><p><strong>{source.label} · {source.dataset}</strong><br/>{source.summary}</p><p>{source.limits}</p><p>{t('shared')}</p><p>{t('caveat')}</p><h3>{t('sourceHeading')}</h3><p>{source.credit}</p><a href={source.licence} target="_blank" rel="noreferrer">{t('datasetLicense')} <ArrowUpRight size={14}/></a><a href={source.download} target="_blank" rel="noreferrer">{t('originalGeometry')} <ArrowUpRight size={14}/></a>{source.publication&&<a href={source.publication} target="_blank" rel="noreferrer">{t('readPublication')} <ArrowUpRight size={14}/></a>}</div></SheetContent></Sheet>
 </main>;
}
