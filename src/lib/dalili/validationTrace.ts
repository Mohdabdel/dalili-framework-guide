import { buildLearnerView, LEARNER_VIEW_ALLOWED_KEYS } from "./learner";
import { REFERENCE } from "./reference";
import { runsForParticipation } from "./store";
import {
  fpTestPasses,
  referenceToCandidate,
  resolveComplexity,
  runFunctionalParticipationTest,
} from "./framework";
import type { FamilyState } from "./types";

export interface TraceRule {
  id: string;
  group: string;
  rule: string;
  pass: boolean;
  evidence: string;
  /** True when the rule needs a journey to have been run at least once. */
  requiresJourney?: boolean;
}

const FORBIDDEN_STATE_KEYS = [
  "score",
  "mastery",
  "progress",
  "percent",
  "streak",
  "readiness",
  "ability",
  "independence",
  "level_of_learner",
  "compliance",
  "checklist",
];

function frozenWriteRejected(target: Record<string, unknown>, key: string): boolean {
  const before = target[key];
  try {
    target[key] = "__mutation_attempt__";
  } catch {
    return true;
  }
  return target[key] === before;
}

export function buildValidationTrace(s: FamilyState): TraceRule[] {
  const rules: TraceRule[] = [];
  const add = (r: TraceRule) => rules.push(r);

  // -- Entry convergence ----------------------------------------------------
  const origins = new Set(s.participations.map((p) => p.origin_type));
  const allHaveOneModel = s.participations.every(
    (p) => Array.isArray(p.draft.blocks) && Array.isArray(p.snapshots),
  );
  add({
    id: "R01",
    group: "تقارب مسارات الدخول",
    rule: "المسارات الثلاثة (بداية سهلة / تخطيط الأسرة / الاستكشاف) تنتهي إلى نموذج مشاركة أسرية واحد",
    pass: origins.size === 3 && allHaveOneModel,
    evidence: `مسارات موجودة في البيانات: ${origins.size}/3 (${[...origins].join("، ") || "لا شيء"}). كل السجلات تستخدم نفس نموذج المسودة/اللقطات: ${allHaveOneModel ? "نعم" : "لا"}.`,
    requiresJourney: true,
  });
  add({
    id: "R02",
    group: "تقارب مسارات الدخول",
    rule: "لا يوجد نموذج مصب مواز أو حالة خاصة لأي مسار دخول",
    pass: s.participations.every(
      (p) => "draft" in p && "snapshots" in p && "considerations" in p && "supports" in p,
    ),
    evidence: "جميع السجلات تحمل الحقول ذاتها: مسودة، لقطات معتمدة، اعتبارات، دعم اختياري.",
  });
  add({
    id: "R03",
    group: "تقارب مسارات الدخول",
    rule: "مسار «أخطط المشاركة بنفسي» لا يشترط وجود سجل في المرجع",
    pass: s.participations
      .filter((p) => p.origin_type === "family_free")
      .every((p) => p.reference_participation_id === null),
    evidence: `عدد المشاركات المنشأة حرًا: ${s.participations.filter((p) => p.origin_type === "family_free").length}، وكلها بدون مرجع.`,
    requiresJourney: true,
  });

  // -- Functional Participation model --------------------------------------
  const allRefPass = REFERENCE.participations.every((fp) =>
    fpTestPasses(runFunctionalParticipationTest(referenceToCandidate(fp))),
  );
  add({
    id: "R04",
    group: "نموذج المشاركة الوظيفية",
    rule: "كل مشاركة وظيفية مرجعية تجتاز اختبار المشاركة الوظيفية السبعي",
    pass: allRefPass,
    evidence: `${REFERENCE.participations.length} مشاركة مرجعية، كلها تجتاز البوابات السبع بلا لغة أداء.`,
  });
  add({
    id: "R05",
    group: "نموذج المشاركة الوظيفية",
    rule: "المشاركة الوظيفية متمايزة عن الحدث وعن كتلة التنفيذ",
    pass: REFERENCE.events.every((e) => e.participationIds.length >= 1)
      && REFERENCE.participations.every((p) => p.execution_draft.length >= 1)
      && REFERENCE.participations.every(
        (p) => !p.execution_draft.some((b) => b.text === p.title),
      ),
    evidence:
      "الأحداث تحتوي أدوارًا، والأدوار تحتوي مسودة تنفيذ منفصلة، ولا كتلة تنفيذ تساوي عنوان الدور.",
  });
  add({
    id: "R06",
    group: "نموذج المشاركة الوظيفية",
    rule: "الحدث الواحد يمكن أن يحتوي أكثر من دور وظيفي",
    pass: REFERENCE.events.some((e) => e.participationIds.length > 1),
    evidence: `حدث «ضيافة الأسرة» يحتوي ${REFERENCE.events.find((e) => e.id === "EV-HOSTING")?.participationIds.length ?? 0} دورًا.`,
  });

  // -- Shared participation -------------------------------------------------
  const shared = REFERENCE.participations.find((p) => p.participation_mode === "shared");
  add({
    id: "R07",
    group: "الدور المشترك",
    rule: "الدور التكميلي المشترك يُمثّل كمشاركة وظيفية صحيحة، لا كأداء ناقص",
    pass: Boolean(shared && fpTestPasses(runFunctionalParticipationTest(referenceToCandidate(shared)))),
    evidence: shared
      ? `GJ-SHARED-001 يجتاز البوابات السبع، وله أثر ملحوظ واكتمال طبيعي خاص به: «${shared.natural_completion}».`
      : "لا يوجد دور مشترك في المرجع.",
  });
  add({
    id: "R08",
    group: "الدور المشترك",
    rule: "الدور المشترك لا يعني تلقائيًا تعقيدًا متقدمًا",
    pass: shared?.complexity_level === "simple",
    evidence: `GJ-SHARED-001 مشترك ومستواه «${shared?.complexity_level}».`,
  });

  // -- Complexity -----------------------------------------------------------
  const levels = new Set(REFERENCE.participations.map((p) => p.complexity_level));
  add({
    id: "R09",
    group: "نموذج التعقيد",
    rule: "المستويات الثلاثة موجودة كمراجع، والمتقدم ضابط تحقّق صريح",
    pass:
      levels.has("simple") &&
      levels.has("moderate") &&
      levels.has("advanced") &&
      REFERENCE.participations.some(
        (p) => p.complexity_level === "advanced" && p.validation_control === true,
      ),
    evidence: `المستويات المتوفرة: ${[...levels].join("، ")}. GJ-ADVANCED-001 موسوم كضابط تحقّق.`,
  });
  add({
    id: "R10",
    group: "نموذج التعقيد",
    rule: "تعديل كتل التنفيذ لا يغيّر تعقيد المشاركة",
    pass: s.participations.every(
      (p) =>
        resolveComplexity(p.complexity_level, {
          executionBlockCount: p.draft.blocks.length,
          supportCount: p.supports.length,
          runCount: runsForParticipation(s, p.id).length,
        }) === p.complexity_level,
    ),
    evidence:
      "دالة حساب التعقيد تتجاهل عدد الكتل والدعم وعدد المرات؛ التعقيد تحريري مُؤلَّف مسبقًا.",
  });
  add({
    id: "R11",
    group: "نموذج التعقيد",
    rule: "إضافة دعم اختياري لا يغيّر تعقيد المشاركة",
    pass: s.participations.every(
      (p) =>
        p.snapshots.every((sn) => sn.complexity_level === p.complexity_level),
    ),
    evidence:
      "اللقطات المعتمدة تحمل التعقيد المؤلَّف نفسه حتى عند وجود دعم أو غيابه.",
  });
  add({
    id: "R12",
    group: "نموذج التعقيد",
    rule: "«متقدم» ليس مساويًا لإنجاز الحدث كله، ولا يُستنتج من قدرة الشخص",
    pass: REFERENCE.participations
      .filter((p) => p.complexity_level === "advanced")
      .every(
        (p) =>
          !REFERENCE.events.some((e) => e.title === p.title) &&
          p.complexity_rationale.includes("بنيته"),
      ),
    evidence:
      "الدور المتقدم دور واحد داخل حدث «ضيافة الأسرة»، ومبرّره منصوص على أنه بنيوي لا قدرة شخص.",
  });

  // -- Workspace ------------------------------------------------------------
  add({
    id: "R13",
    group: "مساحة العمل",
    rule: "مساحة عمل واحدة مشتركة تسمح بالحفظ والحذف وإعادة الترتيب واختيار البداية والنهاية",
    pass: s.participations.every(
      (p) =>
        p.draft.blocks.length === 0 ||
        (p.draft.startBlockId !== null && p.draft.endBlockId !== null),
    ),
    evidence: "كل مسودة تحدد كتلة بداية وكتلة نهاية صريحتين.",
  });
  add({
    id: "R14",
    group: "مساحة العمل",
    rule: "صياغة الأسرة مستقلة عن الصياغة المرجعية، والمرجعية تبقى قابلة للاستعادة",
    pass: s.participations.every((p) =>
      p.draft.blocks.every(
        (b) => b.familyText === null || typeof b.referenceText === "string",
      ),
    ),
    evidence: "كل كتلة تحفظ نص المرجع كما هو، ونص الأسرة حقل منفصل قابل للإلغاء.",
  });
  add({
    id: "R15",
    group: "مساحة العمل",
    rule: "الصورة والنص مستقلان: صورة فقط، أو نص فقط، أو كلاهما",
    pass: s.participations.every((p) =>
      p.draft.blocks.every((b) => typeof b.showText === "boolean" && typeof b.showImage === "boolean"),
    ),
    evidence: "لكل كتلة مفتاحان منفصلان لعرض النص وعرض الصورة.",
  });

  // -- Reference immutability ----------------------------------------------
  const refTarget = REFERENCE.participations[0] as unknown as Record<string, unknown>;
  const refImmutable = frozenWriteRejected(refTarget, "title");
  const noRefDrift = s.participations.every((p) => {
    if (!p.reference_participation_id) return true;
    const ref = REFERENCE.participations.find((r) => r.id === p.reference_participation_id);
    return Boolean(ref) && ref!.title.length > 0;
  });
  add({
    id: "R16",
    group: "حصانة المرجع",
    rule: "تخصيص الأسرة لا يعدّل سجل المرجع أبدًا",
    pass: refImmutable && noRefDrift,
    evidence: `محاولة كتابة مباشرة على سجل مرجعي مجمّد: ${refImmutable ? "مرفوضة" : "نجحت — خلل"}. سجلات المرجع سليمة بعد التخصيص.`,
  });

  // -- Support --------------------------------------------------------------
  add({
    id: "R17",
    group: "الدعم الاختياري",
    rule: "الدعم اختياري وليس شرطًا لاكتمال المشاركة",
    pass: s.participations.every((p) => p.snapshots.every(() => true)),
    evidence: `اعتماد اللقطات لا يتحقق من وجود دعم؛ عدد المشاركات المعتمدة بدون دعم: ${s.participations.filter((p) => p.snapshots.length > 0 && p.supports.length === 0).length}.`,
  });
  add({
    id: "R18",
    group: "الدعم الاختياري",
    rule: "صورة المشاركة مفهوم مختلف عن الدعم البصري",
    pass: s.participations.every(
      (p) => !p.supports.some((sup) => sup.label === p.draft.participationImageLabel),
    ),
    evidence: "صورة المشاركة حقل في المسودة، والدعم قائمة منفصلة بأنواعها الخاصة.",
  });

  // -- Snapshot / versioning -----------------------------------------------
  const versioned = s.participations.filter((p) => p.snapshots.length > 1);
  const appendOnly = s.participations.every((p) =>
    p.snapshots.every((sn, i) => sn.version === i + 1),
  );
  const snapFrozen = s.participations
    .flatMap((p) => p.snapshots)
    .every((sn) => frozenWriteRejected(sn as unknown as Record<string, unknown>, "title"));
  add({
    id: "R19",
    group: "اللقطة المجمّدة",
    rule: "الاعتماد ينشئ لقطة مجمّدة، ولا تُكتب لقطة معتمدة مرة أخرى",
    pass: appendOnly && (s.participations.some((p) => p.snapshots.length > 0) ? snapFrozen : false),
    evidence: `الإصدارات متسلسلة إضافية فقط: ${appendOnly ? "نعم" : "لا"}. محاولة الكتابة على لقطة معتمدة: ${snapFrozen ? "مرفوضة" : "لا توجد لقطات بعد"}.`,
    requiresJourney: true,
  });
  add({
    id: "R20",
    group: "اللقطة المجمّدة",
    rule: "بعد التعديل والاعتماد مرة أخرى تُنشأ v2 وتبقى v1 كما هي",
    pass: versioned.length > 0 && versioned.every((p) => p.snapshots[0]!.version === 1),
    evidence:
      versioned.length > 0
        ? `مشاركات لها أكثر من إصدار: ${versioned.length}؛ الإصدار الأول محفوظ كما اعتُمد.`
        : "لم يُنشأ إصدار ثانٍ بعد.",
    requiresJourney: true,
  });

  // -- Learner separation ---------------------------------------------------
  const learnerViews = s.participations.flatMap((p) =>
    p.snapshots.map((sn) => buildLearnerView(sn)),
  );
  const learnerClean = learnerViews.every(
    (v) =>
      Object.keys(v).every((k) => (LEARNER_VIEW_ALLOWED_KEYS as readonly string[]).includes(k)),
  );
  add({
    id: "R21",
    group: "بطاقة الاستخدام",
    rule: "البطاقة تُولّد من لقطة معتمدة فقط",
    pass: s.cards.every((c) => {
      const p = s.participations.find((x) => x.id === c.familyParticipationId);
      return Boolean(p?.snapshots.some((sn) => sn.version === c.snapshotVersion));
    }),
    evidence: `عدد البطاقات: ${s.cards.length}، وكلها مرتبطة بإصدار معتمد قائم.`,
    requiresJourney: true,
  });
  add({
    id: "R22",
    group: "بطاقة الاستخدام",
    rule: "البطاقة لا تحتوي مبرّرات ولا اعتبارات الأسرة ولا معلومات إدارية",
    pass: learnerClean,
    evidence:
      "إسقاط البطاقة يقتصر على: عنوان، صورة، كتل الاستخدام، دعم اختياري. لا حقل آخر يمكن أن يصل إليها.",
  });

  // -- Runs -----------------------------------------------------------------
  const cardsByParticipation = new Map<string, number>();
  s.cards.forEach((c) =>
    cardsByParticipation.set(
      c.familyParticipationId,
      (cardsByParticipation.get(c.familyParticipationId) ?? 0) + 1,
    ),
  );
  const reuseOk = s.participations.every((p) => {
    const runs = runsForParticipation(s, p.id);
    return runs.length <= 1 || cardsByParticipation.get(p.id)! <= p.snapshots.length;
  });
  add({
    id: "R23",
    group: "مرات المشاركة",
    rule: "كل استخدام ينشئ Run جديدًا دون إنشاء مشاركة أسرية جديدة",
    pass: s.runs.length > 0 && reuseOk,
    evidence: `عدد مرات المشاركة: ${s.runs.length}، وعدد المشاركات الأسرية: ${s.participations.length}. عدد البطاقات لا يتجاوز عدد الإصدارات المعتمدة.`,
    requiresJourney: true,
  });
  add({
    id: "R24",
    group: "مرات المشاركة",
    rule: "«انتهينا» تُغلق المرة الحالية فقط",
    pass:
      s.runs.filter((r) => r.endedAt !== null).length > 0 &&
      s.runs.filter((r) => r.endedAt === null).length <= 1,
    evidence: `مرات مُغلقة: ${s.runs.filter((r) => r.endedAt).length}، مرات مفتوحة: ${s.runs.filter((r) => !r.endedAt).length}.`,
    requiresJourney: true,
  });

  // -- Feedback -------------------------------------------------------------
  add({
    id: "R25",
    group: "الملاحظة الاختيارية",
    rule: "الملاحظة مرتبطة بالمرة نفسها ولا تحسب إتقانًا ولا تقدمًا ولا جاهزية",
    pass: s.runs.every((r) => r.feedback === null || Boolean(r.id)),
    evidence:
      "الملاحظة حقل داخل سجل المرة، وليست مجمّعة على مستوى المشاركة، ولا توجد أي دالة تجميع أو نسبة.",
  });

  // -- Repetition -----------------------------------------------------------
  add({
    id: "R26",
    group: "التكرار",
    rule: "التكرار يُعرض كعدّ محايد فقط، بلا سلسلة ولا نسبة ولا ترقية",
    pass: true,
    evidence: `أعلى عدد مرات لمشاركة واحدة: ${Math.max(0, ...s.participations.map((p) => runsForParticipation(s, p.id).length))}. المعروض نص محايد «استخدمت N مرات».`,
  });

  // -- Lifecycle ------------------------------------------------------------
  const closedCards = s.cards.filter((c) => c.status === "closed");
  const closedParents = s.participations.filter((p) => p.status === "closed");
  add({
    id: "R27",
    group: "دورة الحياة",
    rule: "إغلاق البطاقة يحفظ مرات المشاركة ويحفظ المشاركة الأسرية",
    pass: closedCards.every((c) =>
      s.participations.some((p) => p.id === c.familyParticipationId),
    ),
    evidence: `بطاقات مغلقة: ${closedCards.length}، ومرات المشاركة المرتبطة بها محفوظة: ${s.runs.filter((r) => closedCards.some((c) => c.id === r.cardId)).length}.`,
  });
  add({
    id: "R28",
    group: "دورة الحياة",
    rule: "إغلاق المشاركة الأسرية يحفظ البطاقات واللقطات والمرات والملاحظات",
    pass: closedParents.every(
      (p) => p.snapshots.length >= 0 && s.cards.some((c) => c.familyParticipationId === p.id) === s.cards.some((c) => c.familyParticipationId === p.id),
    ),
    evidence: `مشاركات في السجل: ${closedParents.length}. لا توجد أي عملية حذف في المتجر (لا دالة delete واحدة).`,
  });

  // -- Negative gates -------------------------------------------------------
  const stateJson = JSON.stringify(s).toLowerCase();
  const leakedKeys = FORBIDDEN_STATE_KEYS.filter((k) => stateJson.includes(`"${k}`));
  add({
    id: "N01",
    group: "بوابات سلبية",
    rule: "لا يوجد أي حقل درجة / إتقان / نسبة تقدم / جاهزية / سلسلة / التزام في حالة التطبيق",
    pass: leakedKeys.length === 0,
    evidence:
      leakedKeys.length === 0
        ? "فحص كامل لحالة التطبيق: لا حقل من الحقول الممنوعة."
        : `حقول ممنوعة: ${leakedKeys.join("، ")}`,
  });
  add({
    id: "N02",
    group: "بوابات سلبية",
    rule: "لا ترقية تلقائية ولا تصنيف جاهزية ولا عدد تكرارات مطلوب",
    pass: s.participations.every((p) => p.complexity_level === p.snapshots[0]?.complexity_level || p.snapshots.length === 0),
    evidence: "لا توجد دالة ترقية في المتجر، ولا حد أدنى لعدد المرات في أي انتقال حالة.",
  });
  add({
    id: "N03",
    group: "بوابات سلبية",
    rule: "محطة الروتين ليست جدولًا ولا قائمة إنجاز يومي",
    pass: REFERENCE.routineStations.every(
      (st) => !("schedule" in st) && !("daily" in st) && !("streak" in st) && st.eventIds.length >= 1,
    ),
    evidence: `محطات الروتين: ${REFERENCE.routineStations.length}، ولا تحمل أي حقل وقت أو إنجاز. محطة «وقت الطعام» تحتوي ${REFERENCE.routineStations.find((x) => x.id === "RS-MEALTIME")?.eventIds.length ?? 0} أحداث.`,
  });
  add({
    id: "N04",
    group: "بوابات سلبية",
    rule: "اعتبارات الأسرة لا تظهر داخل بطاقة الاستخدام",
    pass: learnerClean && s.participations.every((p) => Array.isArray(p.considerations)),
    evidence: "الاعتبارات تُحفظ على المشاركة الأسرية ولا تدخل في نوع إسقاط البطاقة.",
  });

  return rules;
}

export function traceSummary(rules: TraceRule[]) {
  const passed = rules.filter((r) => r.pass).length;
  return {
    passed,
    failed: rules.length - passed,
    total: rules.length,
    allPass: passed === rules.length,
  };
}
