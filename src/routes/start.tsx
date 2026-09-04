import { createFileRoute } from "@tanstack/react-router";
import { ChoiceCard, Crumb, Heading, Page } from "@/components/dalili/ui";

export const Route = createFileRoute("/start")({
  head: () => ({
    meta: [
      { title: "ابدأ الآن — دليلي" },
      {
        name: "description",
        content:
          "ثلاثة مسارات للبدء في دليلي: بداية سهلة، أو تخطيط المشاركة بنفسك، أو استكشاف المشاركات الممكنة.",
      },
      { property: "og:title", content: "ابدأ الآن — دليلي" },
      {
        property: "og:description",
        content: "اختر طريقة البدء: بداية سهلة، أو تخطيط بنفسك، أو استكشاف.",
      },
    ],
  }),
  component: StartPage,
});

function StartPage() {
  return (
    <Page width="narrow">
      <Crumb to="/" label="→ دليلي" />
      <div className="mt-3">
        <Heading title="من أين تحبّون أن تبدأوا؟" />
      </div>
      <div className="grid gap-3">
        <ChoiceCard
          to="/easy"
          title="بداية سهلة"
          note="نبدأ من شيء يحبّه ابنكم أو ابنتكم ويتكرّر في حياتكم."
        />
        <ChoiceCard
          to="/plan"
          title="أخطط المشاركة بنفسي"
          note="لديكم موقف أو فكرة مشاركة، وتكتبونها كما تعرفونها."
        />
        <ChoiceCard
          to="/explore"
          title="استكشف المشاركات الممكنة"
          note="نتصفّح أحداث الحياة أو محطات الروتين المألوفة."
        />
      </div>
    </Page>
  );
}
