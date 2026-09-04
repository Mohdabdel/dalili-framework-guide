import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { COMPLEXITY_LABEL, MODE_LABEL, REFERENCE, getPreferredContext } from "@/lib/dalili/reference";
import { fromReference } from "@/lib/dalili/store";
import { Btn, Chip, Crumb, Heading, Page, Section } from "@/components/dalili/ui";

export const Route = createFileRoute("/easy")({
  head: () => ({
    meta: [
      { title: "بداية سهلة — دليلي" },
      {
        name: "description",
        content:
          "نبدأ من موقف يحبّه ابنكم أو ابنتكم ويتكرّر في حياتكم، وتدخل الأسرة فيه لتصنع لنفسها مكانًا معه.",
      },
      { property: "og:title", content: "بداية سهلة — دليلي" },
      {
        property: "og:description",
        content: "من موقف محبوب ومتكرّر إلى دور وظيفي صغير مكتمل بذاته.",
      },
    ],
  }),
  component: EasyBeginning,
});

function EasyBeginning() {
  const navigate = useNavigate();
  const context = getPreferredContext("PC-POPCORN")!;
  const candidates = context.participationIds
    .map((id) => REFERENCE.participations.find((p) => p.id === id)!)
    .filter(Boolean);

  const choose = (refId: string) => {
    const ref = REFERENCE.participations.find((p) => p.id === refId)!;
    const id = fromReference(ref, "easy_beginning", context.title);
    navigate({ to: "/participations/$id", params: { id } });
  };

  return (
    <Page width="narrow">
      <Crumb to="/start" label="→ ابدأ الآن" />
      <div className="mt-3">
        <Heading
          eyebrow="بداية سهلة"
          title="موقف يحبّه، وتدخل فيه الأسرة"
          lead="السؤال ليس: أين يمكن أن يُدخل ابننا في نشاطنا؟ بل: أين تستطيع الأسرة أن تدخل في شيء يحبّه هو، وتصنع لنفسها مكانًا معه فيه؟"
        />
      </div>

      <Section
        title="الموقف المحبوب"
        note="موقف تصفه الأسرة: يحبّه، أو يطلبه، أو يتّجه إليه، أو يشارك فيه بمعنى."
      >
        <p className="text-lg font-semibold">{context.title}</p>
      </Section>

      <Section
        title="توسيع الموقف"
        note="ننظر داخل الموقف: ماذا يحدث فيه فعلًا؟ ومتى يتكرّر؟"
      >
        <ul className="space-y-2">
          {context.expansion.map((line) => (
            <li key={line} className="flex gap-2 text-sm">
              <span className="text-primary" aria-hidden>
                •
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="أدوار ممكنة داخل هذا الموقف"
        note="اختاروا دورًا واحدًا. الدور الصغير قد يكون مكتملًا بذاته."
      >
        <div className="grid gap-3">
          {candidates.map((fp) => (
            <div key={fp.id} className="surface p-4">
              <p className="font-semibold leading-snug">{fp.title}</p>
              <dl className="mt-3 grid gap-1.5 text-sm text-muted-foreground">
                <div>
                  <dt className="inline font-medium text-foreground">الغرض الوظيفي: </dt>
                  <dd className="inline">{fp.functional_intent}</dd>
                </div>
                <div>
                  <dt className="inline font-medium text-foreground">الأثر: </dt>
                  <dd className="inline">{fp.observable_effect}</dd>
                </div>
                <div>
                  <dt className="inline font-medium text-foreground">الاكتمال الطبيعي: </dt>
                  <dd className="inline">{fp.natural_completion}</dd>
                </div>
              </dl>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Chip tone="note">{MODE_LABEL[fp.participation_mode]}</Chip>
                <Chip tone="accent">تعقيد الدور: {COMPLEXITY_LABEL[fp.complexity_level]}</Chip>
              </div>
              <div className="mt-4">
                <Btn variant="primary" onClick={() => choose(fp.id)}>
                  نختار هذا الدور
                </Btn>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          لا يوجد في هذا المسار أي سؤال عن القدرة أو الجاهزية أو الإتقان، و«البسيط» ليس
          مرادفًا للبداية السهلة.
        </p>
      </Section>
    </Page>
  );
}
