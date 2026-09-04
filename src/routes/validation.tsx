import { createFileRoute } from "@tanstack/react-router";
import { REFERENCE } from "@/lib/dalili/reference";
import { resetFamilyState, runsForParticipation, useFamilyState } from "@/lib/dalili/store";
import { buildValidationTrace, traceSummary } from "@/lib/dalili/validationTrace";
import { Btn, Chip, Heading, Page, Section } from "@/components/dalili/ui";

export const Route = createFileRoute("/validation")({
  head: () => ({
    meta: [
      { title: "أثر التحقّق — دليلي" },
      {
        name: "description",
        content:
          "جدول PASS/FAIL لكل قاعدة في إطار دليلي، مبني على حالة التطبيق الفعلية لا على الانطباع.",
      },
      { property: "og:title", content: "أثر التحقّق — دليلي" },
      { property: "og:description", content: "قرار الإطار مبني على دليل قابل للفحص." },
    ],
  }),
  component: ValidationPage,
});

function ValidationPage() {
  const state = useFamilyState();
  const rules = buildValidationTrace(state);
  const summary = traceSummary(rules);
  const groups = [...new Set(rules.map((r) => r.group))];

  const journeys = [
    {
      id: "J1",
      title: "بداية سهلة → اعتماد → استخدام → ملاحظة → تكرار",
      pass:
        state.participations.some(
          (p) => p.origin_type === "easy_beginning" && p.snapshots.length > 0,
        ) &&
        state.participations
          .filter((p) => p.origin_type === "easy_beginning")
          .some((p) => runsForParticipation(state, p.id).length >= 2),
    },
    {
      id: "J2",
      title: "استكشاف (حدث أو محطة روتين) → مساحة العمل نفسها → استخدام",
      pass: state.participations.some(
        (p) => p.origin_type === "reference" && runsForParticipation(state, p.id).length >= 1,
      ),
    },
    {
      id: "J3",
      title: "تخطيط الأسرة الحر بدون سجل مرجعي → استخدام",
      pass: state.participations.some(
        (p) =>
          p.origin_type === "family_free" &&
          p.reference_participation_id === null &&
          runsForParticipation(state, p.id).length >= 1,
      ),
    },
    {
      id: "J4",
      title: "إصدار v1 ثم تعديل ثم v2 مع بقاء v1 كما هو",
      pass: state.participations.some((p) => p.snapshots.length >= 2),
    },
    {
      id: "J5",
      title: "دور مشترك تكميلي يعمل كمشاركة وظيفية كاملة",
      pass: state.participations.some(
        (p) => p.participation_mode === "shared" && p.snapshots.length > 0,
      ),
    },
    {
      id: "J6",
      title: "ضوابط التعقيد: بسيط ومتوسط ومتقدم بلا استنتاج قدرة",
      pass:
        new Set(
          state.participations
            .filter((p) => p.snapshots.length > 0)
            .map((p) => p.complexity_level),
        ).size >= 3,
    },
  ];

  return (
    <Page width="full">
      <Heading
        eyebrow="أداة تحقّق"
        title="أثر التحقّق من الإطار"
        lead="كل قاعدة تُفحص على حالة التطبيق الفعلية. لا يوجد «جزئي»: إما PASS أو FAIL."
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Chip tone={summary.allPass ? "pass" : "fail"}>
          النتيجة: {summary.passed}/{summary.total} PASS
        </Chip>
        <Chip tone={summary.failed === 0 ? "pass" : "fail"}>FAIL: {summary.failed}</Chip>
        <Chip tone="note">
          الرحلات المكتملة: {journeys.filter((j) => j.pass).length}/{journeys.length}
        </Chip>
        <Btn size="sm" variant="danger" onClick={resetFamilyState}>
          تصفير حالة الأسرة
        </Btn>
      </div>

      <Section
        title="الرحلات المطلوبة"
        note="بعض القواعد لا يمكن إثباتها إلا بعد تشغيل الرحلة فعليًا. FAIL هنا يعني: لم يُنفَّذ بعد على هذا الجهاز."
      >
        <ul className="space-y-2">
          {journeys.map((j) => (
            <li
              key={j.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm"
            >
              <span>
                <span className="font-semibold">{j.id}</span> — {j.title}
              </span>
              <Chip tone={j.pass ? "pass" : "fail"}>{j.pass ? "PASS" : "FAIL"}</Chip>
            </li>
          ))}
        </ul>
      </Section>

      {groups.map((g) => (
        <Section key={g} title={g}>
          <div className="space-y-2">
            {rules
              .filter((r) => r.group === g)
              .map((r) => (
                <div key={r.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold">
                      <span className="text-muted-foreground">{r.id}</span> — {r.rule}
                    </p>
                    <Chip tone={r.pass ? "pass" : "fail"}>{r.pass ? "PASS" : "FAIL"}</Chip>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{r.evidence}</p>
                  {r.requiresJourney && !r.pass && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      يلزم تشغيل الرحلة المرتبطة لإثبات هذه القاعدة.
                    </p>
                  )}
                </div>
              ))}
          </div>
        </Section>
      ))}

      <Section
        title="المرجع الذهبي"
        note="مجموعة صغيرة مقصودة: كافية للتحقّق من الإطار، وليست مكتبة محتوى."
      >
        <ul className="space-y-2 text-sm">
          {REFERENCE.participations.map((p) => (
            <li key={p.id} className="rounded-lg bg-muted p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{p.id}</span>
                <Chip>{p.participation_mode === "shared" ? "مشترك" : "فردي"}</Chip>
                <Chip tone="accent">{p.complexity_level}</Chip>
                {p.validation_control && <Chip tone="fail">ضابط تحقّق</Chip>}
              </div>
              <p className="mt-1">{p.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">داخل: {p.life_context}</p>
            </li>
          ))}
        </ul>
      </Section>
    </Page>
  );
}
