import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  COMPLEXITY_DIMENSION_META,
  COMPLEXITY_PROFILE,
  FORBIDDEN_COMPLEXITY_CRITERIA,
  complexityRationaleIsClean,
  fpTestPasses,
  runFunctionalParticipationTest,
  type FpCandidate,
} from "@/lib/dalili/framework";
import { COMPLEXITY_LABEL } from "@/lib/dalili/reference";
import { createOrReuseFamilyParticipation } from "@/lib/dalili/store";
import type { ComplexityLevel, ParticipationMode } from "@/lib/dalili/types";
import { Btn, Chip, Crumb, Field, Heading, Page, Section } from "@/components/dalili/ui";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "أخطط المشاركة بنفسي — دليلي" },
      {
        name: "description",
        content:
          "تصف الأسرة موقفها ودورها الوظيفي بكلماتها، دون الحاجة إلى سجل جاهز في المرجع.",
      },
      { property: "og:title", content: "أخطط المشاركة بنفسي — دليلي" },
      {
        property: "og:description",
        content: "موقف الأسرة، ثم دور وظيفي يُختبر باختبار المشاركة الوظيفية.",
      },
    ],
  }),
  component: PlanMyself,
});

function PlanMyself() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    life_context: "",
    title: "",
    functional_intent: "",
    observable_effect: "",
    natural_completion: "",
    functional_independence: "",
  });
  const [mode, setMode] = useState<ParticipationMode>("individual");
  const [level, setLevel] = useState<ComplexityLevel>("simple");
  const [dims, setDims] = useState({ elements: "", coordination: "", variability: "", choice: "" });
  const [rationale, setRationale] = useState("");
  const [imageLabel, setImageLabel] = useState("");
  const [blocksText, setBlocksText] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const candidate: FpCandidate = { ...form, participation_mode: mode };
  const gates = useMemo(() => runFunctionalParticipationTest(candidate), [candidate]);
  const passes = fpTestPasses(gates);
  const rationaleCheck = complexityRationaleIsClean(rationale);

  const blocks = blocksText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const canCreate = passes && rationaleCheck.clean && rationale.trim().length > 3;

  const create = () => {
    const id = createOrReuseFamilyParticipation({
      origin_type: "family_free",
      reference_participation_id: null,
      reference_context_label: form.life_context,
      title: form.title,
      life_context: form.life_context,
      functional_intent: form.functional_intent,
      observable_effect: form.observable_effect,
      natural_completion: form.natural_completion,
      participation_mode: mode,
      complexity_level: level,
      complexity_rationale: rationale,
      blocks: blocks.length
        ? blocks.map((t) => ({ referenceText: t }))
        : [{ referenceText: "نبدأ" }, { referenceText: "انتهينا" }],
    });
    if (imageLabel.trim()) {
      // family image is part of the composition, set right after creation
      import("@/lib/dalili/store").then((m) => m.setParticipationImage(id, imageLabel.trim()));
    }
    navigate({ to: "/participations/$id", params: { id } });
  };

  return (
    <Page width="narrow">
      <Crumb to="/start" label="→ ابدأ الآن" />
      <div className="mt-3">
        <Heading
          eyebrow="أخطط المشاركة بنفسي"
          title="اكتبوا موقفكم ودوركم كما تعرفونه"
          lead="لا يحتاج هذا المسار إلى أي سجل جاهز. ما تكتبونه يُختبر باختبار المشاركة الوظيفية نفسه، ثم يدخل مساحة العمل نفسها."
        />
      </div>

      <Section title="الموقف والدور">
        <Field label="موقف الحياة" hint="ماذا يحدث فعلًا في البيت أو خارجه؟">
          <input className="field" value={form.life_context} onChange={set("life_context")} />
        </Field>
        <Field label="الدور الوظيفي" hint="ما الدور الذي سيحدث داخل هذا الموقف؟">
          <input className="field" value={form.title} onChange={set("title")} />
        </Field>
        <Field label="الغرض الوظيفي" hint="لماذا يحتاج الموقف إلى هذا الدور؟">
          <input className="field" value={form.functional_intent} onChange={set("functional_intent")} />
        </Field>
        <Field label="الأثر الملحوظ" hint="ما الذي يتغيّر لأن الدور حدث؟">
          <input className="field" value={form.observable_effect} onChange={set("observable_effect")} />
        </Field>
        <Field label="الاكتمال الطبيعي" hint="كيف نعرف أن الدور انتهى بصورة طبيعية؟">
          <input className="field" value={form.natural_completion} onChange={set("natural_completion")} />
        </Field>
        <Field
          label="استقلال الدور وظيفيًا"
          hint="لو فصلناه عن النشاط الأكبر، هل يبقى دورًا ذا معنى؟"
        >
          <input
            className="field"
            value={form.functional_independence}
            onChange={set("functional_independence")}
          />
        </Field>
        <Field label="نمط المشاركة">
          <div className="flex gap-2">
            <Btn variant={mode === "individual" ? "primary" : "quiet"} onClick={() => setMode("individual")}>
              فردي
            </Btn>
            <Btn variant={mode === "shared" ? "primary" : "quiet"} onClick={() => setMode("shared")}>
              مشترك / تكميلي
            </Btn>
          </div>
        </Field>
      </Section>

      <Section
        title="اختبار المشاركة الوظيفية"
        note="سبع بوابات. الدور لا يدخل تصنيف التعقيد قبل اجتيازها كلها."
        action={<Chip tone={passes ? "pass" : "fail"}>{passes ? "مجتاز" : "غير مجتاز"}</Chip>}
      >
        <ol className="space-y-2">
          {gates.map((g) => (
            <li key={g.key} className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">
                  {g.order}. {g.question}
                </p>
                <Chip tone={g.pass ? "pass" : "fail"}>{g.pass ? "PASS" : "FAIL"}</Chip>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{g.hint}</p>
              <p className="mt-1 text-xs">{g.reason}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        title="تعقيد الدور"
        note="التعقيد يصف الدور، لا الشخص. لا يُحتسب من عدد الخطوات ولا من الدعم."
      >
        <div className="mb-4 flex flex-wrap gap-2">
          {(["simple", "moderate", "advanced"] as ComplexityLevel[]).map((l) => (
            <Btn key={l} variant={level === l ? "primary" : "quiet"} onClick={() => setLevel(l)}>
              {COMPLEXITY_LABEL[l]}
            </Btn>
          ))}
        </div>
        <p className="mb-4 rounded-lg bg-secondary p-3 text-xs leading-relaxed">
          {COMPLEXITY_PROFILE[level]}
        </p>
        {COMPLEXITY_DIMENSION_META.map((d) => (
          <Field key={d.key} label={`${d.code} — ${d.title}`} hint={d.question}>
            <input
              className="field"
              value={dims[d.key]}
              onChange={(e) => setDims((x) => ({ ...x, [d.key]: e.target.value }))}
            />
          </Field>
        ))}
        <Field label="مبرّر التعقيد" hint="بلغة بنية الدور فقط.">
          <textarea
            className="field min-h-20"
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
          />
        </Field>
        {!rationaleCheck.clean && (
          <p className="rounded-lg bg-fail p-3 text-xs text-fail-foreground">
            المبرّر يحتوي معايير ممنوعة: {rationaleCheck.leaked.join("، ")}
          </p>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          معايير ممنوعة في التعقيد: {FORBIDDEN_COMPLEXITY_CRITERIA.join(" — ")}
        </p>
      </Section>

      <Section
        title="كتل التنفيذ (اختياري)"
        note="كتلة في كل سطر. كتلة التنفيذ ليست مشاركة وظيفية، ويمكن تعديلها لاحقًا في مساحة العمل."
      >
        <textarea
          className="field min-h-28"
          value={blocksText}
          onChange={(e) => setBlocksText(e.target.value)}
          placeholder={"نذهب إلى…\nنأخذ…\nانتهينا"}
        />
        <Field label="صورة المشاركة (اختياري)" hint="وصف الصورة التي تحبّون استخدامها.">
          <input
            className="field"
            value={imageLabel}
            onChange={(e) => setImageLabel(e.target.value)}
          />
        </Field>
      </Section>

      <Btn variant="primary" size="lg" disabled={!canCreate} onClick={create}>
        ننتقل إلى مساحة العمل
      </Btn>
      {!canCreate && (
        <p className="mt-2 text-xs text-muted-foreground">
          يلزم اجتياز البوابات السبع وكتابة مبرّر تعقيد خالٍ من لغة الأداء.
        </p>
      )}
    </Page>
  );
}
