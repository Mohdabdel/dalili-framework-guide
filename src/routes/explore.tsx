import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  COMPLEXITY_LABEL,
  MODE_LABEL,
  REFERENCE,
  getEvent,
  getParticipation,
} from "@/lib/dalili/reference";
import { fromReference } from "@/lib/dalili/store";
import { Btn, Chip, Crumb, Heading, Page, Section } from "@/components/dalili/ui";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "استكشف المشاركات الممكنة — دليلي" },
      {
        name: "description",
        content:
          "عدستان للاستكشاف: أحداث الحياة، ومحطات الروتين المألوفة، وكلتاهما تؤدي إلى الأدوار الوظيفية نفسها.",
      },
      { property: "og:title", content: "استكشف المشاركات الممكنة — دليلي" },
      {
        property: "og:description",
        content: "أحداث الحياة أو محطات الروتين، ثم دور وظيفي واحد داخل الحدث.",
      },
    ],
  }),
  component: Explore,
});

type Lens = "events" | "stations";

function Explore() {
  const navigate = useNavigate();
  const [lens, setLens] = useState<Lens>("events");
  const [stationId, setStationId] = useState<string | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);

  const station = stationId ? REFERENCE.routineStations.find((s) => s.id === stationId) : null;
  const event = eventId ? getEvent(eventId) : null;

  const visibleEvents = station
    ? station.eventIds.map((id) => getEvent(id)!).filter(Boolean)
    : REFERENCE.events;

  const choose = (refId: string) => {
    const ref = getParticipation(refId)!;
    const id = fromReference(ref, "reference", event?.title ?? ref.life_context);
    navigate({ to: "/participations/$id", params: { id } });
  };

  return (
    <Page width="narrow">
      <Crumb to="/start" label="→ ابدأ الآن" />
      <div className="mt-3">
        <Heading
          eyebrow="استكشاف"
          title="من أي عدسة تحبّون النظر؟"
          lead="المجال ومحطة الروتين عدستان بديلتان للاكتشاف، وليستا تراتبًا إلزاميًا. كلتاهما تنتهي إلى الأدوار الوظيفية نفسها."
        />
      </div>

      <div className="mb-5 flex gap-2">
        <Btn
          variant={lens === "events" ? "primary" : "quiet"}
          onClick={() => {
            setLens("events");
            setStationId(null);
            setEventId(null);
          }}
        >
          أحداث الحياة
        </Btn>
        <Btn
          variant={lens === "stations" ? "primary" : "quiet"}
          onClick={() => {
            setLens("stations");
            setEventId(null);
          }}
        >
          محطات الروتين
        </Btn>
      </div>

      {lens === "stations" && (
        <Section
          title="محطات الروتين"
          note="المحطة جزء مألوف من حياة الأسرة نستخدمه لاكتشاف الأحداث. ليست جدولًا ولا قائمة إنجاز يومي ولا متابعة التزام."
        >
          <div className="grid gap-3">
            {REFERENCE.routineStations.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setStationId(s.id);
                  setEventId(null);
                }}
                className={`surface p-4 text-start transition-colors hover:border-primary/50 ${
                  stationId === s.id ? "border-primary" : ""
                }`}
              >
                <p className="font-semibold">{s.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.note}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  تحتوي {s.eventIds.length} من الأحداث
                </p>
              </button>
            ))}
          </div>
        </Section>
      )}

      {(lens === "events" || station) && (
        <Section
          title={station ? `أحداث داخل: ${station.title}` : "أحداث الحياة"}
          note="الحدث موقف يحدث فعلًا، وقد يحتوي أكثر من دور وظيفي."
        >
          <div className="grid gap-3">
            {visibleEvents.map((e) => (
              <button
                key={e.id}
                onClick={() => setEventId(e.id)}
                className={`surface p-4 text-start transition-colors hover:border-primary/50 ${
                  eventId === e.id ? "border-primary" : ""
                }`}
              >
                <p className="font-semibold">{e.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{e.description}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {e.participationIds.length} دور وظيفي
                </p>
              </button>
            ))}
          </div>
          {!station && lens === "events" && (
            <div className="mt-4 rounded-lg bg-secondary p-3 text-xs text-muted-foreground">
              مجالات الاستكشاف:{" "}
              {REFERENCE.domains.map((d) => d.title).join(" — ")}
            </div>
          )}
        </Section>
      )}

      {event && (
        <Section
          title={`أدوار وظيفية داخل: ${event.title}`}
          note="الدور الوظيفي ليس الحدث، وليس خطوة تنفيذ."
        >
          <div className="grid gap-3">
            {event.participationIds.map((id) => {
              const fp = getParticipation(id)!;
              return (
                <div key={fp.id} className="surface p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold leading-snug">{fp.title}</p>
                    {fp.validation_control && <Chip tone="fail">ضابط تحقّق</Chip>}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{fp.functional_intent}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Chip tone="note">{MODE_LABEL[fp.participation_mode]}</Chip>
                    <Chip tone="accent">
                      تعقيد الدور: {COMPLEXITY_LABEL[fp.complexity_level]}
                    </Chip>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    {fp.complexity_rationale}
                  </p>
                  <div className="mt-4">
                    <Btn variant="primary" onClick={() => choose(fp.id)}>
                      نختار هذا الدور
                    </Btn>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}
    </Page>
  );
}
