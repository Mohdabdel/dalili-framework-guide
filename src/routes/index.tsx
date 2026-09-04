import { createFileRoute } from "@tanstack/react-router";
import { LinkBtn, Page } from "@/components/dalili/ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "دليلي — مشاركة في أحداث الحياة اليومية" },
      {
        name: "description",
        content:
          "دليلي يساعد الأسرة على تهيئة فرص مشاركة الأشخاص ذوي الإعاقة في أحداث حياتهم اليومية.",
      },
      { property: "og:title", content: "دليلي — مشاركة في أحداث الحياة اليومية" },
      {
        property: "og:description",
        content:
          "دليلي يساعد الأسرة على تهيئة فرص مشاركة الأشخاص ذوي الإعاقة في أحداث حياتهم اليومية.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <Page width="narrow">
      <h1 className="font-display text-3xl font-extrabold">دليلي</h1>
      <p className="mt-3 text-[1.05rem] leading-relaxed text-muted-foreground">
        دليلي يساعد الأسرة على تهيئة فرص مشاركة الأشخاص ذوي الإعاقة في أحداث حياتهم
        اليومية.
      </p>
      <p className="mt-4 rounded-lg bg-secondary px-4 py-3 text-[0.95rem] leading-relaxed">
        المشاركة ليست تدريبًا على الحياة… المشاركة هي الحياة نفسها.
      </p>

      <div className="mt-7">
        <LinkBtn to="/start" variant="primary" size="lg">
          ابدأ الآن
        </LinkBtn>
      </div>
    </Page>
  );
}
