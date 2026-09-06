/** Interface language. Anatomical names and descriptions are translated
 * separately, in `terms-ar.json` and `anatomy-ar.ts`, because they come from
 * sources with their own provenance rather than from this file. */
export type Language = 'en'|'ar';
export const LANGUAGES:{id:Language;label:string;direction:'ltr'|'rtl'}[] = [
 {id:'en',label:'English',direction:'ltr'},
 {id:'ar',label:'العربية',direction:'rtl'},
];
export const direction = (language:Language) => LANGUAGES.find(l=>l.id===language)?.direction ?? 'ltr';

/** Every piece of interface text, in both languages. */
const TEXT = {
 title:{en:'Human Atlas',ar:'أطلس الجسم البشري'},
 eyebrow:{en:'INTERACTIVE ANATOMY',ar:'تشريح تفاعلي'},
 pieces:{en:'modeled pieces',ar:'قطعة مُجسَّمة'},
 referenceBody:{en:'reference body',ar:'الجسم المرجعي'},
 referenceBodyLabel:{en:'Reference body',ar:'الجسم المرجعي'},
 language:{en:'Language',ar:'اللغة'},

 findStructure:{en:'Find a structure',ar:'ابحث عن تركيب'},
 searchAnatomy:{en:'Search anatomy',ar:'البحث في التشريح'},
 findAnatomy:{en:'Find anatomy',ar:'البحث في التشريح'},
 searchNamed:{en:'Search named anatomical structures',ar:'ابحث في التراكيب التشريحية المسماة'},
 searchPlaceholder:{en:'Heart, femur, cranial nerve…',ar:'قلب، عظم الفخذ، عصب قحفي…'},
 closeSearch:{en:'Close search',ar:'إغلاق البحث'},
 noMatches:{en:'No structures match your search.',ar:'لا توجد تراكيب مطابقة لبحثك.'},
 searchHintEmpty:{en:'Start with a major organ, or search every named structure.',ar:'ابدأ بعضو رئيسي، أو ابحث في كل تركيب مسمى.'},
 searchHintTyping:{en:'Showing up to 80 matches. Refine your search to find smaller structures.',ar:'يُعرض حتى ٨٠ نتيجة. ضيّق بحثك للوصول إلى التراكيب الأصغر.'},
 piece:{en:'piece',ar:'قطعة'},
 pieces_plural:{en:'pieces',ar:'قطعة'},

 systems:{en:'Systems',ar:'الأجهزة'},
 anatomicalLayers:{en:'Anatomical layers',ar:'الطبقات التشريحية'},
 openLayers:{en:'Open system layers',ar:'فتح طبقات الأجهزة'},
 closeSystems:{en:'Close systems',ar:'إغلاق الأجهزة'},
 presetAll:{en:'All',ar:'الكل'},
 presetSkeleton:{en:'Skeleton',ar:'الهيكل'},
 presetOrgans:{en:'Organs',ar:'الأعضاء'},
 showOnly:{en:'Show only',ar:'إظهار فقط'},
 show:{en:'Show',ar:'إظهار'},
 piecesVisible:{en:'pieces visible',ar:'قطعة ظاهرة'},
 hideAll:{en:'Hide all',ar:'إخفاء الكل'},

 cameraControls:{en:'Camera controls',ar:'التحكم في الكاميرا'},
 explorerPanels:{en:'Explorer panels',ar:'لوحات المستكشف'},
 viewThreeQuarter:{en:'three-quarter view',ar:'منظور ثلاثة أرباع'},
 viewFront:{en:'front view',ar:'منظور أمامي'},
 viewSide:{en:'side view',ar:'منظور جانبي'},
 viewBack:{en:'back view',ar:'منظور خلفي'},
 autoRotate:{en:'Auto rotate',ar:'دوران تلقائي'},
 rotateBody:{en:'Rotate body',ar:'تدوير الجسم'},
 pauseRotation:{en:'Pause rotation',ar:'إيقاف الدوران'},
 reset:{en:'Reset',ar:'إعادة'},
 resetView:{en:'Reset view and layers',ar:'إعادة ضبط المنظور والطبقات'},
 assembleReset:{en:'Assemble and reset',ar:'إعادة التجميع'},

 explode:{en:'Explode anatomy',ar:'تفكيك التشريح'},
 assembled:{en:'Assembled',ar:'مُجمَّع'},
 everyPiece:{en:'Every piece',ar:'كل قطعة'},
 inventory:{en:'ANATOMICAL INVENTORY',ar:'جرد تشريحي'},
 separated:{en:'SEPARATED STRUCTURES',ar:'تراكيب مفصولة'},
 selectedStructure:{en:'SELECTED STRUCTURE',ar:'التركيب المحدد'},

 dragToOrbit:{en:'Drag to orbit',ar:'اسحب للدوران'},
 dragToPan:{en:'Drag to pan',ar:'اسحب للتحريك'},
 pinchToZoom:{en:'Pinch to zoom',ar:'اقرص للتكبير'},
 tapToInspect:{en:'Tap to inspect',ar:'انقر للفحص'},

 anatomy:{en:'ANATOMY',ar:'تشريح'},
 atlasReference:{en:'Atlas reference',ar:'مرجع الأطلس'},
 selectedPieces:{en:'Selected pieces',ar:'القطع المحددة'},
 includedStructures:{en:'Included structures',ar:'التراكيب المتضمنة'},
 andMore:{en:'more modeled pieces.',ar:'قطعة مُجسَّمة أخرى.'},
 and:{en:'And',ar:'و'},
 systemOverview:{en:'System overview · structure identified from source anatomy',ar:'نظرة عامة على الجهاز · التركيب محدد من التشريح المصدر'},
 isolate:{en:'Isolate structure',ar:'عزل التركيب'},
 showSurrounding:{en:'Show surrounding anatomy',ar:'إظهار التشريح المحيط'},
 clearSelection:{en:'Clear selection',ar:'إلغاء التحديد'},
 viewSource:{en:'View anatomical source',ar:'عرض المصدر التشريحي'},

 aboutThisAtlas:{en:'About this atlas',ar:'عن هذا الأطلس'},
 sourceScope:{en:'SOURCE & SCOPE',ar:'المصدر والنطاق'},
 aboutTitle:{en:'A body, revealed.',ar:'جسدٌ مكشوف.'},
 aboutIntro:{en:'Explore the adult',ar:'استكشف التشريح المرجعي للبالغ'},
 aboutIntroFrom:{en:'reference anatomy from',ar:'من'},
 shared:{en:'The two reference bodies come from different projects, so their coverage and level of detail differ. Neither contains every human structure or variation. Named concepts can contain multiple pieces; each source mesh is rendered once.',
        ar:'الجسمان المرجعيان من مشروعين مختلفين، فتغطيتهما ومستوى تفصيلهما مختلفان. ولا أحدهما يحوي كل تركيب أو تنوع بشري. المفهوم المسمى قد يضم عدة قطع، وكل شبكة مصدرية تُرسم مرة واحدة.'},
 caveat:{en:'Colors and system groupings are designed for exploration. The geometry is simplified for the web, and short explanations provide general educational context. This is an anatomical reference, not a diagnostic or surgical tool.',
        ar:'الألوان وتجميع الأجهزة مصممة للاستكشاف. الهندسة مبسطة للويب، والشروح القصيرة تقدم سياقًا تعليميًا عامًا. هذا مرجع تشريحي، وليس أداة تشخيص أو جراحة.'},
 sourceHeading:{en:'Source',ar:'المصدر'},
 datasetLicense:{en:'Dataset license',ar:'رخصة البيانات'},
 originalGeometry:{en:'Original geometry & metadata',ar:'الهندسة الأصلية والبيانات الوصفية'},
 readPublication:{en:'Read the source publication',ar:'اقرأ البحث المنشور'},
 sourceCredits:{en:'Source & credits',ar:'المصدر والاعتمادات'},

 preparing:{en:'Preparing the anatomy',ar:'جارٍ تحضير التشريح'},
 loadingBody:{en:'Loading',ar:'تحميل'},
 reference:{en:'reference anatomy',ar:'التشريح المرجعي'},
 reloadViewer:{en:'Reload viewer',ar:'إعادة تحميل العارض'},
 catalogueError:{en:'The anatomy catalogue could not be loaded.',ar:'تعذر تحميل فهرس التشريح.'},
} as const;

export type Phrase = keyof typeof TEXT;
export const say = (language:Language, phrase:Phrase) => TEXT[phrase][language];

/** Arabic writes several letters more than one way and marks vowels optionally,
 * so a search has to compare stripped forms or it misses obvious matches. */
export const fold = (text:string) => text
 .toLowerCase()
 .replace(/[ً-ْٰـ]/g,'')
 .replace(/[أإآٱ]/g,'ا')
 .replace(/ى/g,'ي')
 .replace(/ؤ/g,'و')
 .replace(/ئ/g,'ي')
 .replace(/ة/g,'ه')
 .trim();
