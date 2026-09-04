import { createFileRoute } from "@tanstack/react-router";
import { COMPLEXITY_LABEL, MODE_LABEL } from "@/lib/dalili/reference";
import {
  ORIGIN_LABEL,
  cardsForParticipation,
  runsForParticipation,
  useFamilyState,
} from "@/lib/dalili/store";
import { ChoiceCard, Chip, Empty, Heading, LinkBtn, Page, Section } from "@/components/dalili/ui";

export const Route = createFileRoute("/participations/")({
  head: () => ({
    meta: [
      { title: "مشاركات الأسرة — دليلي" },
      {
        name: "description",
        content: "كل المشاركات التي هيّأتها الأسرة، وإصداراتها المعتمدة، وسجلّها.",
      },
      { property: "og:title", content: "مشاركات الأسرة — دليلي" },
      { property: "og:description", content: "المشاركات القائمة والمشاركات في السجل." },
    ],
  }),
  component: ParticipationsList,
});

function ParticipationsList() {
  const state = useFamilyState();
  const active = state.participations.filter((p) => p.status === "active");
  const closed = state.participations.filter((p) => p.status === "closed");

  return (
    <Page>
      <Heading
        title="مشاركات الأسرة"
        lead="كل مشاركة هي وحدة العمل الأم. البطاقات ومرات المشاركة تنتمي إليها."
      />

      <Section title="مشاركات قائمة" action={<LinkBtn to="/start" variant="primary" size="sm">مشاركة جديدة</LinkBtn>}>
        {active.length === 0 ? (
          <Empty>لا توجد مشاركات بعد. ابدأوا من «ابدأ الآن».</Empty>
        ) : (
          <div className="grid gap-3">
            {active.map((p) => {
              const runs = runsForParticipation(state, p.id);
              return (
                <ChoiceCard
                  key={p.id}
                  to="/participations/$id"
                  params={{ id: p.id }}
                  title={p.draft.familyTitle ?? p.title}
                  note={p.life_context}
                  meta={
                    <>
                      <Chip tone="note">{ORIGIN_LABEL[p.origin_type]}</Chip>
                      <Chip>{MODE_LABEL[p.participation_mode]}</Chip>
                      <Chip tone="accent">تعقيد الدور: {COMPLEXITY_LABEL[p.complexity_level]}</Chip>
                      <Chip>
                        {p.snapshots.length > 0
                          ? `إصدارات معتمدة: ${p.snapshots.length}`
                          : "لم تُعتمد بعد"}
                      </Chip>
                      {runs.length > 0 && <Chip>استخدمت {runs.length} مرات</Chip>}
                      <Chip>بطاقات: {cardsForParticipation(state, p.id).length}</Chip>
                    </>
                  }
                />
              );
            })}
          </div>
        )}
      </Section>

      {closed.length > 0 && (
        <Section title="في السجل" note="الإغلاق ليس فشلًا، والسجل لا يُحذف.">
          <div className="grid gap-3">
            {closed.map((p) => (
              <ChoiceCard
                key={p.id}
                to="/participations/$id"
                params={{ id: p.id }}
                title={p.draft.familyTitle ?? p.title}
                note={p.life_context}
                meta={
                  <>
                    <Chip>إصدارات محفوظة: {p.snapshots.length}</Chip>
                    <Chip>مرات محفوظة: {runsForParticipation(state, p.id).length}</Chip>
                  </>
                }
              />
            ))}
          </div>
        </Section>
      )}
    </Page>
  );
}
