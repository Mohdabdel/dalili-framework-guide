import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { buildLearnerView } from "@/lib/dalili/learner";
import {
  FEEDBACK_OPTIONS,
  endRun,
  runsForCard,
  setRunFeedback,
  startRun,
  useFamilyState,
} from "@/lib/dalili/store";
import { Btn, Chip, Empty, LinkBtn, Page } from "@/components/dalili/ui";

export const Route = createFileRoute("/card/$cardId")({
  head: () => ({
    meta: [
      { title: "بطاقة الاستخدام — دليلي" },
      {
        name: "description",
        content: "بطاقة لحظة الاستخدام: صورة وكلمات قصيرة وكتلة واحدة في كل مرة.",
      },
      { property: "og:title", content: "بطاقة الاستخدام — دليلي" },
      { property: "og:description", content: "ما يظهر في لحظة المشاركة فقط." },
    ],
  }),
  component: CardScreen,
});

function CardScreen() {
  const { cardId } = Route.useParams();
  const state = useFamilyState();
  const card = state.cards.find((c) => c.id === cardId);
  const participation = state.participations.find(
    (p) => p.id === card?.familyParticipationId,
  );
  const snapshot = participation?.snapshots.find(
    (s) => s.version === card?.snapshotVersion,
  );

  const [runId, setRunId] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);

  if (!card || !participation || !snapshot) {
    return (
      <Page width="narrow">
        <Empty>لا توجد بطاقة معتمدة بهذا الرقم.</Empty>
        <div className="mt-4">
          <LinkBtn to="/participations">مشاركات الأسرة</LinkBtn>
        </div>
      </Page>
    );
  }

  const view = buildLearnerView(snapshot);
  const runs = runsForCard(state, card.id);
  const currentRun = runId ? state.runs.find((r) => r.id === runId) : null;
  const activeStep = view.steps[step];

  const begin = () => {
    const id = startRun(card.id);
    setRunId(id);
    setStep(0);
    setFinished(false);
  };

  const finish = () => {
    if (runId) endRun(runId);
    setFinished(true);
  };

  // ---- Learner surface: only moment-of-use content ------------------------
  if (runId && !finished) {
    return (
      <main className="mx-auto flex min-h-[80vh] w-full max-w-xl flex-col justify-center px-5 py-10">
        {view.title && <h1 className="mb-6 text-center text-2xl font-bold">{view.title}</h1>}
        {activeStep?.imageLabel && (
          <div className="mb-5 flex h-56 items-center justify-center rounded-2xl bg-secondary text-center text-base text-muted-foreground">
            صورة: {activeStep.imageLabel}
          </div>
        )}
        {!activeStep?.imageLabel && view.participationImageLabel && (
          <div className="mb-5 flex h-56 items-center justify-center rounded-2xl bg-secondary text-center text-base text-muted-foreground">
            صورة: {view.participationImageLabel}
          </div>
        )}
        {activeStep?.text && (
          <p className="text-center text-2xl font-semibold leading-relaxed">{activeStep.text}</p>
        )}

        <div className="mt-10 flex justify-center gap-3">
          {step < view.steps.length - 1 ? (
            <Btn variant="primary" size="lg" onClick={() => setStep((s) => s + 1)}>
              التالي
            </Btn>
          ) : (
            <Btn variant="primary" size="lg" onClick={finish}>
              انتهينا
            </Btn>
          )}
          {step < view.steps.length - 1 && (
            <Btn size="lg" onClick={finish}>
              انتهينا
            </Btn>
          )}
        </div>

        {view.supports.length > 0 && (
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {view.supports.map((s) => (
              <Chip key={s.id} tone="accent">
                {s.label}
              </Chip>
            ))}
          </div>
        )}
      </main>
    );
  }

  // ---- Family-side card shell --------------------------------------------
  return (
    <Page width="narrow">
      <LinkBtn to="/participations/$id" params={{ id: participation.id }} variant="ghost" size="sm">
        → مساحة العمل
      </LinkBtn>

      <div className="surface mt-4 p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Chip tone="note">الإصدار v{snapshot.version}</Chip>
          <Chip tone={card.status === "active" ? "pass" : "muted"}>
            {card.status === "active" ? "بطاقة قائمة" : "بطاقة مغلقة"}
          </Chip>
          {runs.length > 0 && <Chip>استخدمت {runs.length} مرات</Chip>}
        </div>

        <h1 className="text-xl font-bold">{view.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {view.steps.length} كتلة تُعرض واحدة في كل مرة.
        </p>

        {finished && currentRun && (
          <div className="mt-6 rounded-xl bg-secondary p-4">
            <p className="text-sm font-semibold">انتهت هذه المرّة. هل تحبّون إضافة ملاحظة؟</p>
            <p className="mt-1 text-xs text-muted-foreground">
              اختيارية تمامًا، ومرتبطة بهذه المرّة فقط. لا تُحسب إتقانًا ولا تقدمًا ولا جاهزية.
            </p>
            <div className="mt-3 grid gap-2">
              {FEEDBACK_OPTIONS.map((o) => (
                <Btn
                  key={o.value}
                  variant={currentRun.feedback?.option === o.value ? "primary" : "quiet"}
                  onClick={() => setRunFeedback(currentRun.id, o.value, null)}
                >
                  {o.label}
                </Btn>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Btn onClick={begin}>مرّة أخرى</Btn>
              <Btn
                variant="ghost"
                onClick={() => {
                  setFinished(false);
                  setRunId(null);
                }}
              >
                إغلاق
              </Btn>
            </div>
          </div>
        )}

        {!finished && (
          <div className="mt-6">
            <Btn variant="primary" size="lg" disabled={card.status === "closed"} onClick={begin}>
              نبدأ المشاركة
            </Btn>
            {card.status === "closed" && (
              <p className="mt-2 text-xs text-muted-foreground">
                هذه البطاقة مغلقة، وسجلّ مراتها محفوظ.
              </p>
            )}
          </div>
        )}
      </div>
    </Page>
  );
}
