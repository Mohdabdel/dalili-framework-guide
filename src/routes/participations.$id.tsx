import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { COMPLEXITY_LABEL, MODE_LABEL } from "@/lib/dalili/reference";
import { COMPLEXITY_DIMENSION_META } from "@/lib/dalili/framework";
import { buildLearnerView } from "@/lib/dalili/learner";
import {
  ORIGIN_LABEL,
  SUPPORT_CATALOG,
  addBlock,
  approve,
  blockText,
  cardsForParticipation,
  closeCard,
  closeParticipation,
  moveBlock,
  patchBlock,
  referenceOf,
  removeBlock,
  reopenParticipation,
  runsForParticipation,
  selectVersion,
  setBoundary,
  setConsiderations,
  setFamilyTitle,
  setParticipationImage,
  toggleSupport,
  useFamilyState,
} from "@/lib/dalili/store";
import { Btn, Chip, Crumb, Empty, Field, Heading, LinkBtn, Page, Section } from "@/components/dalili/ui";

export const Route = createFileRoute("/participations/$id")({
  head: () => ({
    meta: [
      { title: "مساحة العمل — دليلي" },
      {
        name: "description",
        content:
          "مساحة عمل واحدة لكل المسارات: كتل التنفيذ، الصياغة، الدعم الاختياري، المعاينة، والاعتماد.",
      },
      { property: "og:title", content: "مساحة العمل — دليلي" },
      { property: "og:description", content: "تهيئة المشاركة ثم اعتمادها كإصدار مجمّد." },
    ],
  }),
  component: Workspace,
});

function Workspace() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const state = useFamilyState();
  const p = state.participations.find((x) => x.id === id);
  const [newBlock, setNewBlock] = useState("");
  const [newConsideration, setNewConsideration] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  if (!p) {
    return (
      <Page width="narrow">
        <Empty>لم نجد هذه المشاركة على هذا الجهاز.</Empty>
        <div className="mt-4">
          <LinkBtn to="/participations">مشاركات الأسرة</LinkBtn>
        </div>
      </Page>
    );
  }

  const ref = referenceOf(p);
  const runs = runsForParticipation(state, p.id);
  const cards = cardsForParticipation(state, p.id);
  const currentVersion = state.selectedVersion[p.id] ?? p.snapshots.length;
  const currentSnapshot = p.snapshots.find((s) => s.version === currentVersion);
  const currentCard = cards.find(
    (c) => c.snapshotVersion === currentVersion && c.status === "active",
  );
  const preview = currentSnapshot ? null : null;
  void preview;

  const draftView = buildLearnerView({
    version: 0,
    approvedAt: "",
    title: p.title,
    participation_mode: p.participation_mode,
    complexity_level: p.complexity_level,
    composition: p.draft,
    supports: p.supports,
  });

  return (
    <Page>
      <Crumb to="/participations" label="→ مشاركات الأسرة" />
      <div className="mt-3">
        <Heading
          eyebrow={ORIGIN_LABEL[p.origin_type]}
          title={p.draft.familyTitle ?? p.title}
          lead={`داخل: ${p.reference_context_label || p.life_context}`}
        />
      </div>

      <Section
        title="هوية المشاركة"
        note="هذه الحقول تعرّف الدور نفسه. تعديل التنفيذ في مساحة العمل لا يغيّرها."
      >
        <dl className="grid gap-2 text-sm md:grid-cols-2">
          <Row label="موقف الحياة" value={p.life_context} />
          <Row label="الغرض الوظيفي" value={p.functional_intent} />
          <Row label="الأثر الملحوظ" value={p.observable_effect} />
          <Row label="الاكتمال الطبيعي" value={p.natural_completion} />
        </dl>
        <div className="mt-4 flex flex-wrap gap-2">
          <Chip tone="note">{MODE_LABEL[p.participation_mode]}</Chip>
          <Chip tone="accent">تعقيد الدور: {COMPLEXITY_LABEL[p.complexity_level]}</Chip>
          <Chip>كتل التنفيذ: {p.draft.blocks.length}</Chip>
          <Chip>الدعم: {p.supports.length}</Chip>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          مبرّر التعقيد: {p.complexity_rationale}
        </p>
        {ref && (
          <div className="mt-4 rounded-lg bg-secondary p-3 text-xs leading-relaxed">
            <p className="font-medium">المصدر المرجعي: {ref.id} — غير قابل للتعديل.</p>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              {COMPLEXITY_DIMENSION_META.map((d) => (
                <li key={d.key}>
                  {d.code} {d.title}: {ref.complexity_dimensions[d.key]}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      <Section
        title="مساحة العمل"
        note="كتل التنفيذ قابلة للتعديل والحذف وإعادة الترتيب. صياغة المرجع تبقى محفوظة كما هي."
      >
        <Field label="صياغة الأسرة لعنوان المشاركة" hint="مستقلة عن الصياغة المرجعية.">
          <div className="flex gap-2">
            <input
              className="field"
              value={p.draft.familyTitle ?? ""}
              placeholder={p.title}
              onChange={(e) => setFamilyTitle(p.id, e.target.value || null)}
            />
            <Btn size="sm" onClick={() => setFamilyTitle(p.id, null)}>
              استعادة الصياغة المرجعية
            </Btn>
          </div>
        </Field>

        <Field label="صورة المشاركة" hint="مفهوم مختلف عن الدعم البصري، وتُغيَّر باستقلال عن الكلمات.">
          <div className="flex gap-2">
            <input
              className="field"
              value={p.draft.participationImageLabel ?? ""}
              placeholder="وصف الصورة"
              onChange={(e) => setParticipationImage(p.id, e.target.value || null)}
            />
            <Btn size="sm" onClick={() => setParticipationImage(p.id, null)}>
              إزالة
            </Btn>
          </div>
        </Field>

        <div className="mt-2 space-y-3">
          {p.draft.blocks.map((b, i) => (
            <div key={b.id} className="rounded-lg border border-border p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Chip>كتلة {i + 1}</Chip>
                  {p.draft.startBlockId === b.id && <Chip tone="pass">البداية</Chip>}
                  {p.draft.endBlockId === b.id && <Chip tone="pass">النهاية</Chip>}
                </div>
                <div className="flex gap-1">
                  <Btn size="sm" onClick={() => moveBlock(p.id, b.id, -1)} aria-label="أعلى">
                    ↑
                  </Btn>
                  <Btn size="sm" onClick={() => moveBlock(p.id, b.id, 1)} aria-label="أسفل">
                    ↓
                  </Btn>
                  <Btn size="sm" variant="danger" onClick={() => removeBlock(p.id, b.id)}>
                    حذف
                  </Btn>
                </div>
              </div>
              {b.referenceText && (
                <p className="mb-2 text-xs text-muted-foreground">
                  الصياغة المرجعية: {b.referenceText}
                </p>
              )}
              <input
                className="field"
                value={b.familyText ?? ""}
                placeholder={b.referenceText || "صياغة الأسرة"}
                onChange={(e) => patchBlock(p.id, b.id, { familyText: e.target.value || null })}
              />
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                {b.referenceText && (
                  <Btn size="sm" onClick={() => patchBlock(p.id, b.id, { familyText: null })}>
                    استعادة صياغة المرجع
                  </Btn>
                )}
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={b.showText}
                    onChange={(e) => patchBlock(p.id, b.id, { showText: e.target.checked })}
                  />
                  عرض النص
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={b.showImage}
                    onChange={(e) => patchBlock(p.id, b.id, { showImage: e.target.checked })}
                  />
                  عرض الصورة
                </label>
                <input
                  className="field max-w-52"
                  value={b.imageLabel ?? ""}
                  placeholder="وصف صورة الكتلة"
                  onChange={(e) => patchBlock(p.id, b.id, { imageLabel: e.target.value || null })}
                />
                <Btn size="sm" onClick={() => setBoundary(p.id, "start", b.id)}>
                  اجعلها البداية
                </Btn>
                <Btn size="sm" onClick={() => setBoundary(p.id, "end", b.id)}>
                  اجعلها النهاية
                </Btn>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <input
            className="field"
            value={newBlock}
            placeholder="إضافة كتلة تنفيذ"
            onChange={(e) => setNewBlock(e.target.value)}
          />
          <Btn
            onClick={() => {
              if (newBlock.trim()) addBlock(p.id, newBlock.trim());
              setNewBlock("");
            }}
          >
            إضافة
          </Btn>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          كتلة التنفيذ ليست مشاركة وظيفية، وعدد الكتل لا يغيّر تعقيد المشاركة.
        </p>
      </Section>

      <Section
        title="اعتبارات الأسرة (اختياري)"
        note="ملاحظات صغيرة تساعد على تهيئة المشاركة. لا تظهر في بطاقة الاستخدام، وليست تقييمًا ولا وصفًا للنقص ولا خطة علاج."
      >
        <div className="flex gap-2">
          <input
            className="field"
            value={newConsideration}
            placeholder="مثال: نحبّ أن يكون الوعاء على الطرف القريب من مكان جلوسه"
            onChange={(e) => setNewConsideration(e.target.value)}
          />
          <Btn
            onClick={() => {
              if (newConsideration.trim())
                setConsiderations(p.id, [...p.considerations, newConsideration.trim()]);
              setNewConsideration("");
            }}
          >
            إضافة
          </Btn>
        </div>
        {p.considerations.length > 0 && (
          <ul className="mt-3 space-y-2">
            {p.considerations.map((c, i) => (
              <li key={i} className="flex items-center justify-between gap-2 rounded-lg bg-muted p-2 text-sm">
                <span>{c}</span>
                <Btn
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setConsiderations(
                      p.id,
                      p.considerations.filter((_, j) => j !== i),
                    )
                  }
                >
                  إزالة
                </Btn>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        title="هل أطلعكم على أشياء قد تسهّل أو تدعم هذه المشاركة؟"
        note="الدعم اختياري تمامًا: ليس علاجًا ولا مكافأة، وليس شرطًا لإكمال المشاركة، ولا يغيّر تعقيدها."
      >
        <div className="grid gap-2 md:grid-cols-2">
          {SUPPORT_CATALOG.map((s) => {
            const on = p.supports.some((x) => x.type === s.type);
            return (
              <button
                key={s.type}
                onClick={() => toggleSupport(p.id, s.type, s.label)}
                className={`rounded-lg border p-3 text-start text-sm transition-colors ${
                  on ? "border-primary bg-muted" : "border-border bg-card hover:bg-muted/60"
                }`}
              >
                <span className="font-medium">{s.label}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{s.note}</span>
                {on && (
                  <span className="mt-2 inline-block">
                    <Chip tone="pass">مضاف</Chip>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Section>

      <Section
        title="المعاينة والاعتماد"
        note="المعاينة تُظهر ما سيراه الشخص فقط. الاعتماد ينشئ لقطة مجمّدة لا تُكتب مرة أخرى."
        action={
          <Btn onClick={() => setShowPreview((v) => !v)}>
            {showPreview ? "إخفاء المعاينة" : "معاينة"}
          </Btn>
        }
      >
        {showPreview && (
          <div className="mb-4 rounded-xl border border-border bg-secondary p-4">
            <p className="mb-2 text-xs text-muted-foreground">معاينة لحظة الاستخدام</p>
            {draftView.title && <p className="text-lg font-bold">{draftView.title}</p>}
            {draftView.participationImageLabel && (
              <div className="mt-3 flex h-32 items-center justify-center rounded-lg bg-card text-sm text-muted-foreground">
                صورة: {draftView.participationImageLabel}
              </div>
            )}
            <ol className="mt-3 space-y-1 text-sm">
              {draftView.steps.map((s, i) => (
                <li key={s.id}>
                  {i + 1}. {s.text ?? (s.imageLabel ? `صورة: ${s.imageLabel}` : "—")}
                </li>
              ))}
            </ol>
            {draftView.supports.length > 0 && (
              <p className="mt-3 text-xs text-muted-foreground">
                دعم متاح: {draftView.supports.map((s) => s.label).join("، ")}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Btn
            variant="primary"
            onClick={() => {
              const v = approve(p.id);
              setShowPreview(false);
              void v;
            }}
          >
            {p.snapshots.length === 0
              ? "اعتماد الإصدار الأول"
              : `اعتماد الإصدار ${p.snapshots.length + 1}`}
          </Btn>
          {currentCard && (
            <LinkBtn to="/card/$cardId" params={{ cardId: currentCard.id }} variant="quiet">
              فتح بطاقة الاستخدام
            </LinkBtn>
          )}
        </div>

        {p.snapshots.length > 0 && (
          <div className="mt-4 space-y-2">
            {p.snapshots.map((s) => (
              <div
                key={s.version}
                className={`rounded-lg border p-3 text-sm ${
                  s.version === currentVersion ? "border-primary bg-muted" : "border-border"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">
                      الإصدار v{s.version} — {s.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      اعتُمد في {new Date(s.approvedAt).toLocaleString("ar")} — كتل:{" "}
                      {s.composition.blocks.length} — دعم: {s.supports.length} — تعقيد:{" "}
                      {COMPLEXITY_LABEL[s.complexity_level]}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Chip tone="pass">مجمّد</Chip>
                    {s.version !== currentVersion && (
                      <Btn size="sm" onClick={() => selectVersion(p.id, s.version)}>
                        استخدام هذا الإصدار
                      </Btn>
                    )}
                  </div>
                </div>
                <ol className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                  {s.composition.blocks.map((b, i) => (
                    <li key={b.id}>
                      {i + 1}. {blockText(b)}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section
        title="السجل"
        note="مرات المشاركة تمثل تكرار الحياة، لا جرعات تدريب."
      >
        {runs.length === 0 ? (
          <Empty>لم تُستخدم بعد.</Empty>
        ) : (
          <>
            <p className="mb-3 text-sm">استخدمت {runs.length} مرات</p>
            <ul className="space-y-2 text-sm">
              {runs.map((r) => (
                <li key={r.id} className="rounded-lg bg-muted p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span>مرّة {r.id.slice(-5)} — الإصدار v{r.snapshotVersion}</span>
                    <Chip tone={r.endedAt ? "pass" : "note"}>
                      {r.endedAt ? "انتهت" : "مفتوحة"}
                    </Chip>
                  </div>
                  {r.feedback && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      ملاحظة الأسرة: {r.feedback.option === "accepted_easily" && "تقبّل المشاركة بسهولة"}
                      {r.feedback.option === "joined_after_time" && "شارك بعد بعض الوقت"}
                      {r.feedback.option === "needed_some_support" && "احتاج بعض الدعم"}
                      {r.feedback.option === "try_another_way" && "نحتاج أن نجربها بطريقة أخرى"}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}

        {cards.length > 0 && (
          <div className="mt-4 space-y-2">
            {cards.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3 text-sm">
                <span>
                  بطاقة الإصدار v{c.snapshotVersion}{" "}
                  <Chip tone={c.status === "active" ? "pass" : "muted"}>
                    {c.status === "active" ? "قائمة" : "مغلقة"}
                  </Chip>
                </span>
                <div className="flex gap-2">
                  <LinkBtn to="/card/$cardId" params={{ cardId: c.id }} size="sm">
                    فتح
                  </LinkBtn>
                  {c.status === "active" && (
                    <Btn size="sm" variant="danger" onClick={() => closeCard(c.id)}>
                      إغلاق البطاقة
                    </Btn>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="دورة الحياة" note="الإغلاق ليس فشلًا، ولا يُحذف شيء من السجل.">
        {p.status === "active" ? (
          <Btn
            variant="danger"
            onClick={() => {
              closeParticipation(p.id);
              navigate({ to: "/participations" });
            }}
          >
            إغلاق المشاركة الأسرية
          </Btn>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <Chip tone="note">هذه المشاركة في السجل</Chip>
            <Btn onClick={() => reopenParticipation(p.id)}>إعادتها إلى المشاركات القائمة</Btn>
          </div>
        )}
      </Section>
    </Page>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/60 p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5">{value}</dd>
    </div>
  );
}
