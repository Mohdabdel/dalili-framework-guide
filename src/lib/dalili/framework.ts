import type {
  ComplexityDimensions,
  ComplexityLevel,
  FunctionalParticipation,
  ParticipationMode,
} from "./types";

// ============================================================================
// FUNCTIONAL PARTICIPATION TEST — 7 gates. Only a candidate that passes all
// gates may enter Complexity Classification.
// ============================================================================

export interface FpCandidate {
  title: string;
  life_context: string;
  functional_intent: string;
  observable_effect: string;
  natural_completion: string;
  functional_independence: string;
  participation_mode: ParticipationMode | null;
}

export interface GateResult {
  key: string;
  order: number;
  question: string;
  hint: string;
  pass: boolean;
  reason: string;
}

/**
 * Performance vocabulary. A functional role must be definable without any of it.
 * Used by gate 6 and by the complexity guard.
 */
export const PERFORMANCE_TERMS = [
  "استقلال",
  "مستقل",
  "بمفرده دون مساعدة",
  "إتقان",
  "يتقن",
  "تلقين",
  "تعزيز",
  "نسبة نجاح",
  "نسبة",
  "٪",
  "%",
  "تكرارات",
  "عدد مرات",
  "مدة",
  "ثانية",
  "دقيقة",
  "قدرة",
  "يستطيع",
  "لا يستطيع",
  "غير قادر",
  "مستوى الطفل",
  "تشخيص",
  "عمر",
  "درجة",
  "تقييم",
  "هدف علاجي",
  "تدريب",
  "independence",
  "mastery",
  "prompt",
  "percentage",
  "repetitions",
  "duration",
  "ability",
  "score",
  "level of learner",
];

export function findPerformanceTerms(text: string): string[] {
  const lower = text.toLowerCase();
  return PERFORMANCE_TERMS.filter((t) => lower.includes(t.toLowerCase()));
}

const filled = (v: string | null | undefined) => Boolean(v && v.trim().length > 1);

export function runFunctionalParticipationTest(c: FpCandidate): GateResult[] {
  const neutralityScope = [
    c.title,
    c.functional_intent,
    c.observable_effect,
    c.natural_completion,
  ].join(" ");
  const leaked = findPerformanceTerms(neutralityScope);

  return [
    {
      key: "life_context",
      order: 1,
      question: "سياق الحياة",
      hint: "هل يحدث الدور داخل موقف حياة حقيقي؟",
      pass: filled(c.life_context),
      reason: filled(c.life_context)
        ? "الدور موصوف داخل موقف حياة قائم."
        : "لا يوجد موقف حياة حقيقي يحتوي هذا الدور.",
    },
    {
      key: "functional_intent",
      order: 2,
      question: "الغرض الوظيفي",
      hint: "لماذا يحتاج هذا الدور أن يحدث في ذلك الموقف؟",
      pass: filled(c.functional_intent),
      reason: filled(c.functional_intent)
        ? "الغرض الوظيفي محدد."
        : "لم يُحدد سبب حاجة الموقف لهذا الدور.",
    },
    {
      key: "observable_effect",
      order: 3,
      question: "الأثر / الإسهام",
      hint: "ما الذي يتغيّر في الحدث أو البيئة أو التفاعل لأن هذا الدور حدث؟",
      pass: filled(c.observable_effect),
      reason: filled(c.observable_effect)
        ? "يوجد أثر ملحوظ يتغيّر بحدوث الدور."
        : "لا يوجد أثر محدد يتغيّر بحدوث الدور.",
    },
    {
      key: "natural_completion",
      order: 4,
      question: "الاكتمال الطبيعي",
      hint: "كيف يُفهم انتهاء الدور بصورة طبيعية؟",
      pass: filled(c.natural_completion),
      reason: filled(c.natural_completion)
        ? "نهاية الدور مفهومة من الموقف نفسه."
        : "لا تُفهم نهاية الدور من الموقف.",
    },
    {
      key: "functional_independence",
      order: 5,
      question: "استقلال الدور وظيفيًا",
      hint: "إذا فُصل مفهوميًا عن النشاط الأكبر، هل يبقى دورًا وظيفيًا ذا معنى لا مجرد حركة تمكينية أو جزء اعتباطي؟",
      pass: filled(c.functional_independence),
      reason: filled(c.functional_independence)
        ? "الدور مفهوم بذاته كدور وظيفي."
        : "الدور يبدو حركة تمكينية أو جزءًا اعتباطيًا لا دورًا وظيفيًا.",
    },
    {
      key: "performance_neutrality",
      order: 6,
      question: "حياد الأداء",
      hint: "هل يمكن تعريف الدور دون استقلال أو إتقان أو تلقين أو نسبة نجاح أو تكرارات أو مدة أو قدرة؟",
      pass: leaked.length === 0,
      reason:
        leaked.length === 0
          ? "الوصف خالٍ من أي لغة أداء أو قدرة."
          : `يحتوي الوصف لغة أداء غير مقبولة: ${leaked.join("، ")}`,
    },
    {
      key: "participation_mode",
      order: 7,
      question: "نمط المشاركة",
      hint: "هل الوظيفة فردية أم مشتركة/تكميلية؟",
      pass: c.participation_mode !== null,
      reason:
        c.participation_mode !== null
          ? "نمط المشاركة محدد."
          : "لم يُحدد نمط المشاركة.",
    },
  ];
}

export const fpTestPasses = (gates: GateResult[]) => gates.every((g) => g.pass);

// ============================================================================
// COMPLEXITY MODEL — describes the ROLE, never the person.
// ============================================================================

export const FORBIDDEN_COMPLEXITY_CRITERIA = [
  "الشخص يحتاج مساعدة",
  "الشخص يستطيع / لا يستطيع",
  "الاستقلال",
  "الإتقان",
  "النجاح السابق",
  "عدد خطوات مساحة العمل",
  "عدد التكرارات",
  "العمر",
  "التشخيص",
];

export const COMPLEXITY_DIMENSION_META = [
  { key: "elements", code: "C1", title: "العناصر", question: "كم عنصرًا أو فعلًا أو معلومة يحملها الدور؟" },
  { key: "coordination", code: "C2", title: "التنسيق", question: "كم من الترتيب أو المطابقة أو التزامن يحتاجه الدور؟" },
  { key: "variability", code: "C3", title: "التغيّر", question: "كم يتغيّر المطلوب أثناء حدوث الدور؟" },
  { key: "choice", code: "C4", title: "الاختيار وعدم اليقين", question: "كم بديلًا أو قرارًا أو نتيجة غير مؤكدة يحتويها الدور؟" },
] as const;

export const COMPLEXITY_PROFILE: Record<ComplexityLevel, string> = {
  simple:
    "غرض واحد واضح، عناصر قليلة نسبيًا، علاقة مباشرة بين الفعل والنتيجة، وتنسيق وتغيّر واختيار محدود.",
  moderate:
    "زيادة معنوية في العناصر أو العلاقات أو القرارات أو التغيّر، مع بقاء الدور محددًا بدرجة معقولة.",
  advanced:
    "متطلبات متعددة متفاعلة: عناصر متعددة، تنسيق ملحوظ، قرارات ذات أثر، مطلوب متغيّر، أو نتائج متعددة.",
};

/** Complexity is editorial: it is authored, never computed from execution blocks. */
export interface ComplexityDecision {
  level: ComplexityLevel;
  dimensions: ComplexityDimensions;
  rationale: string;
}

/** Guards the rationale against any forbidden (person-based) criterion. */
export function complexityRationaleIsClean(rationale: string): {
  clean: boolean;
  leaked: string[];
} {
  const leaked = findPerformanceTerms(rationale);
  return { clean: leaked.length === 0, leaked };
}

/**
 * Invariance contract, expressed as code so the validation trace can assert it:
 * complexity depends ONLY on the authored role dimensions. Neither the number of
 * execution blocks, nor supports, nor run history are inputs.
 */
export function resolveComplexity(
  authored: ComplexityLevel,
  _context: { executionBlockCount: number; supportCount: number; runCount: number },
): ComplexityLevel {
  return authored;
}

export function referenceToCandidate(fp: FunctionalParticipation): FpCandidate {
  return {
    title: fp.title,
    life_context: fp.life_context,
    functional_intent: fp.functional_intent,
    observable_effect: fp.observable_effect,
    natural_completion: fp.natural_completion,
    functional_independence: fp.functional_independence,
    participation_mode: fp.participation_mode,
  };
}
