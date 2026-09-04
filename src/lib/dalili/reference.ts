import type {
  Domain,
  FunctionalParticipation,
  LifeEvent,
  PreferredContext,
  RoutineStation,
} from "./types";

// ============================================================================
// GOLDEN REFERENCE CORPUS — small on purpose. Enough to validate the framework,
// not a content library. Deep-frozen: family customization can never mutate it.
// ============================================================================

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.values(value as Record<string, unknown>).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

const participations: FunctionalParticipation[] = [
  {
    id: "GJ-EASY-001",
    title: "إحضار البوب كورن إلى مكان جلوس الأسرة",
    life_context: "تناول البوب كورن مع الأسرة",
    functional_intent: "إيصال البوب كورن إلى مكان المشاركة الأسرية",
    observable_effect: "أصبح البوب كورن موجودًا في مكان جلوس الأسرة",
    natural_completion: "وصل البوب كورن إلى المكان المقصود",
    participation_mode: "individual",
    complexity_level: "simple",
    complexity_rationale:
      "غرض واحد واضح، عدد قليل من العناصر، علاقة مباشرة بين الفعل ونتيجته، ولا يتطلب تنسيقًا أو اختيارات متعددة.",
    complexity_dimensions: {
      elements: "عنصر واحد يُنقل إلى مكان واحد.",
      coordination: "لا يتطلب تزامنًا أو مطابقة بين عناصر.",
      variability: "المطلوب ثابت أثناء حدوث الدور.",
      choice: "لا توجد بدائل أو نتائج غير محددة.",
    },
    functional_independence:
      "إيصال شيء إلى مكان المشاركة دور وظيفي مفهوم بذاته، وليس مجرد حركة تمكينية.",
    execution_draft: [
      { id: "GJ-EASY-001-b1", text: "نذهب إلى مكان البوب كورن" },
      { id: "GJ-EASY-001-b2", text: "نأخذ البوب كورن" },
      { id: "GJ-EASY-001-b3", text: "نحضره إلى مكان جلوسنا" },
      { id: "GJ-EASY-001-b4", text: "انتهينا" },
    ],
  },
  {
    id: "GJ-SHARED-001",
    title: "تثبيت الوعاء بينما يضع فرد الأسرة البوب كورن فيه",
    life_context: "تجهيز البوب كورن مع الأسرة",
    functional_intent: "تثبيت الوعاء ليسمح بإكمال وضع البوب كورن فيه",
    observable_effect: "يبقى الوعاء في الموضع المطلوب أثناء وضع البوب كورن",
    natural_completion: "ينتهي الدور عند اكتمال وضع البوب كورن في الوعاء",
    participation_mode: "shared",
    complexity_level: "simple",
    complexity_rationale:
      "الدور تكميلي وواضح الغرض: عنصر واحد يُثبت في موضع واحد. كونه دورًا مشتركًا لا يزيد عناصره ولا تنسيقه ولا اختياراته، لذلك يبقى بسيطًا.",
    complexity_dimensions: {
      elements: "عنصر واحد (الوعاء) في موضع واحد.",
      coordination: "تزامن واحد بسيط: البقاء في الموضع أثناء فعل الطرف الآخر.",
      variability: "المطلوب لا يتغير أثناء حدوث الدور.",
      choice: "لا توجد بدائل أو قرارات داخل الدور.",
    },
    functional_independence:
      "التثبيت دور وظيفي مكتمل بذاته: بدونه لا يمكن إكمال وضع البوب كورن. وهو دور تكميلي، لا أداء ناقص.",
    execution_draft: [
      { id: "GJ-SHARED-001-b1", text: "نضع أيدينا على الوعاء" },
      { id: "GJ-SHARED-001-b2", text: "نُبقي الوعاء ثابتًا" },
      { id: "GJ-SHARED-001-b3", text: "انتهينا" },
    ],
  },
  {
    id: "GJ-DISCOVERY-001",
    title: "إعادة أجهزة التحكم المستخدمة إلى مكانها",
    life_context: "ترتيب غرفة المعيشة",
    functional_intent: "إعادة الأشياء المستخدمة إلى موضعها المعتاد",
    observable_effect: "أصبحت أجهزة التحكم في أماكنها",
    natural_completion: "أعيدت الأجهزة المقصودة إلى أماكنها",
    participation_mode: "individual",
    complexity_level: "simple",
    complexity_rationale:
      "غرض واحد واضح وعناصر قليلة متشابهة، والعلاقة بين الفعل والنتيجة مباشرة دون تنسيق أو تغيّر في المطلوب.",
    complexity_dimensions: {
      elements: "عناصر قليلة متشابهة وأماكن معروفة.",
      coordination: "لا يتطلب ترتيبًا زمنيًا دقيقًا.",
      variability: "المطلوب ثابت.",
      choice: "لا توجد قرارات ذات أثر داخل الدور.",
    },
    functional_independence:
      "إعادة الأشياء إلى موضعها دور وظيفي مفهوم بذاته داخل حدث الترتيب.",
    execution_draft: [
      { id: "GJ-DISCOVERY-001-b1", text: "نجد أجهزة التحكم المستخدمة" },
      { id: "GJ-DISCOVERY-001-b2", text: "نعيدها إلى مكانها" },
      { id: "GJ-DISCOVERY-001-b3", text: "انتهينا" },
    ],
  },
  {
    id: "GJ-MODERATE-001",
    title: "توزيع الأكواب والأطباق المناسبة على الضيوف",
    life_context: "ضيافة الأسرة",
    functional_intent: "أن يجد كل ضيف ما يحتاجه أمامه قبل تقديم الضيافة",
    observable_effect: "أصبح أمام كل ضيف كوب وطبق في موضعه",
    natural_completion: "ينتهي الدور عندما يكون لكل ضيف حاضر كوب وطبق أمامه",
    participation_mode: "individual",
    complexity_level: "moderate",
    complexity_rationale:
      "زيادة معنوية في العناصر والعلاقات: أكثر من نوع عنصر، ومطابقة بين العناصر والأشخاص والمواضع، وعدد الضيوف قد يتغير أثناء الدور، مع بعض القرارات في الترتيب. ومع ذلك يبقى الدور محددًا.",
    complexity_dimensions: {
      elements: "نوعان من العناصر بعدد يتبع عدد الضيوف.",
      coordination: "مطابقة عنصر/شخص/موضع لكل ضيف.",
      variability: "عدد الضيوف ومواضع الجلوس قد تتغير أثناء الدور.",
      choice: "قرارات في ترتيب التوزيع والمواضع المناسبة.",
    },
    functional_independence:
      "التوزيع دور وظيفي قائم بذاته داخل حدث الضيافة، ويمكن فهمه دون بقية الحدث.",
    execution_draft: [
      { id: "GJ-MODERATE-001-b1", text: "ننظر إلى أماكن جلوس الضيوف" },
      { id: "GJ-MODERATE-001-b2", text: "نأخذ الأكواب والأطباق" },
      { id: "GJ-MODERATE-001-b3", text: "نضع لكل ضيف كوبًا وطبقًا" },
      { id: "GJ-MODERATE-001-b4", text: "نتأكد أن كل ضيف أمامه ما يحتاجه" },
      { id: "GJ-MODERATE-001-b5", text: "انتهينا" },
    ],
  },
  {
    id: "GJ-ADVANCED-001",
    title: "تلقّي طلبات المشروبات من الضيوف وتسليم كل مشروب لصاحبه",
    life_context: "ضيافة الأسرة",
    functional_intent:
      "أن يصل كل مشروب إلى الضيف الذي طلبه أثناء تقديم الضيافة",
    observable_effect: "أصبح بين يدي كل ضيف المشروب الذي طلبه",
    natural_completion:
      "ينتهي الدور عندما يصل إلى كل ضيف طلب مشروبًا مشروبه الذي طلبه",
    participation_mode: "individual",
    complexity_level: "advanced",
    complexity_rationale:
      "متطلبات متعددة متفاعلة داخل بنية الدور نفسه: معلومات مختلفة (طلب لكل ضيف) تُحمل في الوقت نفسه، ومطابقة بين مشروب وضيف وموضع، وطلبات تتغير أو تُضاف أثناء حدوث الدور، وقرارات ذات أثر عند التشابه أو التعارض. الدور متقدم بسبب بنيته لا لأنه يمثل الحدث كله ولا لأن الشخص قد يحتاج مساعدة أكبر.",
    complexity_dimensions: {
      elements: "طلب مختلف لكل ضيف، وعناصر مشروبات متعددة غير متماثلة.",
      coordination:
        "مطابقة ثلاثية (طلب/مشروب/ضيف) مع ترتيب زمني بين التلقّي والتسليم.",
      variability: "الطلبات قد تتغير أو تُضاف بعد بدء الدور.",
      choice: "بدائل وقرارات عند تشابه المشروبات أو تعارض الطلبات.",
    },
    functional_independence:
      "تلقّي الطلب وتسليمه دور وظيفي واحد قائم بذاته، مستقل عن تحضير المشروبات أو تنظيم المجلس.",
    validation_control: true,
    execution_draft: [
      { id: "GJ-ADVANCED-001-b1", text: "نسأل كل ضيف عن مشروبه" },
      { id: "GJ-ADVANCED-001-b2", text: "نتذكر طلب كل ضيف" },
      { id: "GJ-ADVANCED-001-b3", text: "نأخذ المشروبات الجاهزة" },
      { id: "GJ-ADVANCED-001-b4", text: "نعطي كل ضيف مشروبه الذي طلبه" },
      { id: "GJ-ADVANCED-001-b5", text: "انتهينا" },
    ],
  },
];

const events: LifeEvent[] = [
  {
    id: "EV-LIVING-TIDY",
    title: "ترتيب غرفة المعيشة",
    description: "لحظة تحدث فعلًا في البيت وتحتوي أكثر من دور وظيفي.",
    participationIds: ["GJ-DISCOVERY-001"],
  },
  {
    id: "EV-HOSTING",
    title: "ضيافة الأسرة",
    description: "حدث أسري يحتوي أدوارًا وظيفية مختلفة في تعقيد بنيتها.",
    participationIds: ["GJ-MODERATE-001", "GJ-ADVANCED-001"],
  },
  {
    id: "EV-POPCORN-PREP",
    title: "تجهيز البوب كورن مع الأسرة",
    description: "لحظة تجهيز تحتوي أدوارًا فردية وأدوارًا تكميلية مشتركة.",
    participationIds: ["GJ-SHARED-001"],
  },
  {
    id: "EV-FAMILY-SNACK",
    title: "تناول البوب كورن مع الأسرة",
    description: "لحظة أسرية متكرّرة يحبها كثير من الأبناء.",
    participationIds: ["GJ-EASY-001"],
  },
];

const routineStations: RoutineStation[] = [
  {
    id: "RS-MEALTIME",
    title: "وقت الطعام",
    note: "محطة روتين أوسع من مهمة واحدة: تحتوي أحداثًا مختلفة تحدث حولها.",
    eventIds: ["EV-HOSTING", "EV-POPCORN-PREP", "EV-FAMILY-SNACK"],
  },
  {
    id: "RS-HOME-ORDER",
    title: "لحظات ترتيب البيت",
    note: "محطة تُستخدم لاكتشاف أحداث، لا لمتابعة إنجاز يومي.",
    eventIds: ["EV-LIVING-TIDY"],
  },
];

const domains: Domain[] = [
  {
    id: "DM-FAMILY-LIFE",
    title: "حياة الأسرة في البيت",
    eventIds: ["EV-LIVING-TIDY", "EV-HOSTING"],
  },
  {
    id: "DM-SHARED-MOMENTS",
    title: "لحظات المشاركة والمتعة",
    eventIds: ["EV-FAMILY-SNACK", "EV-POPCORN-PREP"],
  },
];

const preferredContexts: PreferredContext[] = [
  {
    id: "PC-POPCORN",
    title: "تناول البوب كورن مع الأسرة",
    expansion: [
      "يطلب البوب كورن بنفسه أو يتّجه إليه",
      "يجلس مع الأسرة عندما يكون البوب كورن موجودًا",
      "يتكرّر هذا الموقف في البيت بصورة طبيعية",
      "تستطيع الأسرة أن تدخل هذه اللحظة وتصنع لنفسها مكانًا معه فيها",
    ],
    participationIds: ["GJ-EASY-001", "GJ-SHARED-001"],
  },
];

export const REFERENCE = deepFreeze({
  domains,
  routineStations,
  events,
  preferredContexts,
  participations,
});

export const getParticipation = (id: string) =>
  REFERENCE.participations.find((p) => p.id === id);
export const getEvent = (id: string) => REFERENCE.events.find((e) => e.id === id);
export const getPreferredContext = (id: string) =>
  REFERENCE.preferredContexts.find((c) => c.id === id);
export const getRoutineStation = (id: string) =>
  REFERENCE.routineStations.find((s) => s.id === id);

export const MODE_LABEL: Record<string, string> = {
  individual: "دور فردي",
  shared: "دور مشترك / تكميلي",
};

export const COMPLEXITY_LABEL: Record<string, string> = {
  simple: "بسيط",
  moderate: "متوسط",
  advanced: "متقدم",
};
