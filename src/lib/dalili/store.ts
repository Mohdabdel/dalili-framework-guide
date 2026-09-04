import { useSyncExternalStore } from "react";
import { getParticipation } from "./reference";
import type {
  Composition,
  CompositionBlock,
  FamilyParticipation,
  FamilyState,
  FeedbackOption,
  FunctionalParticipation,
  LearnerCard,
  OriginType,
  ParticipationRun,
  Snapshot,
  SupportType,
  VisualSupport,
} from "./types";

const STORAGE_KEY = "dalili.family.state.v1";

const EMPTY: FamilyState = {
  participations: [],
  cards: [],
  runs: [],
  selectedVersion: {},
};

let state: FamilyState = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable — validation continues in-memory */
  }
}

/**
 * Approved snapshots are historical evidence. Whatever path produces a state
 * object — creation, edit, or restoration from persistence — every snapshot it
 * carries is sealed before that state becomes visible to the app.
 */
function sealApprovedSnapshots(next: FamilyState): FamilyState {
  return {
    ...next,
    participations: (next.participations ?? []).map((p) => ({
      ...p,
      snapshots: (p.snapshots ?? []).map((sn) =>
        Object.isFrozen(sn)
          ? sn
          : deepFreeze({
              ...sn,
              id: sn.id ?? uid("snap"),
              approved: true as const,
            }),
      ),
    })),
  };
}

export function hydrateFamilyState() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) state = sealApprovedSnapshots({ ...EMPTY, ...(JSON.parse(raw) as FamilyState) });
  } catch {
    state = EMPTY;
  }
  emit();
}

function setState(next: FamilyState) {
  state = sealApprovedSnapshots(next);
  persist();
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => state;

/** Non-hook read of the current family state (used by the validation harness). */
export const readFamilyState = (): FamilyState => state;
const getServerSnapshot = () => EMPTY;

export function useFamilyState(): FamilyState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

const now = () => new Date().toISOString();

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.values(value as Record<string, unknown>).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

// ---------------------------------------------------------------------------
// Creation — one common Family Participation model for every entry path
// ---------------------------------------------------------------------------

export interface CreateInput {
  origin_type: OriginType;
  reference_participation_id: string | null;
  reference_context_label: string;
  title: string;
  life_context: string;
  functional_intent: string;
  observable_effect: string;
  natural_completion: string;
  participation_mode: "individual" | "shared";
  complexity_level: "simple" | "moderate" | "advanced";
  complexity_rationale: string;
  blocks: { referenceText: string; familyText?: string | null }[];
}

function buildComposition(
  blocks: { referenceText: string; familyText?: string | null }[],
): Composition {
  const built: CompositionBlock[] = blocks.map((b, i) => ({
    id: uid(`blk${i}`),
    referenceText: b.referenceText,
    familyText: b.familyText ?? null,
    imageLabel: null,
    showText: true,
    showImage: false,
  }));
  return {
    blocks: built,
    startBlockId: built[0]?.id ?? null,
    endBlockId: built[built.length - 1]?.id ?? null,
    familyTitle: null,
    participationImageLabel: null,
  };
}

/**
 * Reuses an existing active Family Participation for the same reference role
 * instead of creating a duplicate parent.
 */
export function createOrReuseFamilyParticipation(input: CreateInput): string {
  if (input.reference_participation_id) {
    const existing = state.participations.find(
      (p) =>
        p.reference_participation_id === input.reference_participation_id &&
        p.status === "active",
    );
    if (existing) return existing.id;
  }
  const fp: FamilyParticipation = {
    id: uid("fam"),
    origin_type: input.origin_type,
    reference_participation_id: input.reference_participation_id,
    reference_context_label: input.reference_context_label,
    title: input.title,
    life_context: input.life_context,
    functional_intent: input.functional_intent,
    observable_effect: input.observable_effect,
    natural_completion: input.natural_completion,
    participation_mode: input.participation_mode,
    complexity_level: input.complexity_level,
    complexity_rationale: input.complexity_rationale,
    createdAt: now(),
    status: "active",
    draft: buildComposition(input.blocks),
    considerations: [],
    supports: [],
    snapshots: [],
  };
  setState({ ...state, participations: [...state.participations, fp] });
  return fp.id;
}

export function fromReference(
  ref: FunctionalParticipation,
  origin: OriginType,
  contextLabel: string,
): string {
  return createOrReuseFamilyParticipation({
    origin_type: origin,
    reference_participation_id: ref.id,
    reference_context_label: contextLabel,
    title: ref.title,
    life_context: ref.life_context,
    functional_intent: ref.functional_intent,
    observable_effect: ref.observable_effect,
    natural_completion: ref.natural_completion,
    participation_mode: ref.participation_mode,
    complexity_level: ref.complexity_level,
    complexity_rationale: ref.complexity_rationale,
    blocks: ref.execution_draft.map((b) => ({ referenceText: b.text })),
  });
}

// ---------------------------------------------------------------------------
// Mutations on family state only
// ---------------------------------------------------------------------------

function updateParticipation(
  id: string,
  fn: (p: FamilyParticipation) => FamilyParticipation,
) {
  setState({
    ...state,
    participations: state.participations.map((p) => (p.id === id ? fn(p) : p)),
  });
}

export function updateDraft(id: string, fn: (c: Composition) => Composition) {
  updateParticipation(id, (p) => ({ ...p, draft: fn(clone(p.draft)) }));
}

export function addBlock(id: string, text: string) {
  updateDraft(id, (c) => {
    const block: CompositionBlock = {
      id: uid("blk"),
      referenceText: "",
      familyText: text,
      imageLabel: null,
      showText: true,
      showImage: false,
    };
    const blocks = [...c.blocks, block];
    return {
      ...c,
      blocks,
      startBlockId: c.startBlockId ?? block.id,
      endBlockId: block.id,
    };
  });
}

export function removeBlock(id: string, blockId: string) {
  updateDraft(id, (c) => {
    const blocks = c.blocks.filter((b) => b.id !== blockId);
    return {
      ...c,
      blocks,
      startBlockId: blocks.some((b) => b.id === c.startBlockId)
        ? c.startBlockId
        : (blocks[0]?.id ?? null),
      endBlockId: blocks.some((b) => b.id === c.endBlockId)
        ? c.endBlockId
        : (blocks[blocks.length - 1]?.id ?? null),
    };
  });
}

export function moveBlock(id: string, blockId: string, dir: -1 | 1) {
  updateDraft(id, (c) => {
    const i = c.blocks.findIndex((b) => b.id === blockId);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= c.blocks.length) return c;
    const blocks = [...c.blocks];
    const a = blocks[i]!;
    const b = blocks[j]!;
    blocks[i] = b;
    blocks[j] = a;
    return { ...c, blocks };
  });
}

export function patchBlock(
  id: string,
  blockId: string,
  patch: Partial<Omit<CompositionBlock, "id" | "referenceText">>,
) {
  updateDraft(id, (c) => ({
    ...c,
    blocks: c.blocks.map((b) => (b.id === blockId ? { ...b, ...patch } : b)),
  }));
}

export function setBoundary(id: string, which: "start" | "end", blockId: string) {
  updateDraft(id, (c) =>
    which === "start" ? { ...c, startBlockId: blockId } : { ...c, endBlockId: blockId },
  );
}

export function setFamilyTitle(id: string, value: string | null) {
  updateDraft(id, (c) => ({ ...c, familyTitle: value }));
}

export function setParticipationImage(id: string, label: string | null) {
  updateDraft(id, (c) => ({ ...c, participationImageLabel: label }));
}

export function setConsiderations(id: string, items: string[]) {
  updateParticipation(id, (p) => ({ ...p, considerations: items }));
}

export function toggleSupport(id: string, type: SupportType, label: string) {
  updateParticipation(id, (p) => {
    const exists = p.supports.find((s) => s.type === type);
    const supports: VisualSupport[] = exists
      ? p.supports.filter((s) => s.type !== type)
      : [...p.supports, { id: uid("sup"), type, label }];
    return { ...p, supports };
  });
}

// ---------------------------------------------------------------------------
// Approval — frozen snapshot, never overwritten
// ---------------------------------------------------------------------------

export function approve(id: string): number {
  const p = state.participations.find((x) => x.id === id);
  if (!p) return 0;
  const version = p.snapshots.length + 1;
  const snapshot: Snapshot = deepFreeze({
    id: uid("snap"),
    approved: true as const,
    version,
    approvedAt: now(),
    title: p.draft.familyTitle ?? p.title,
    participation_mode: p.participation_mode,
    complexity_level: p.complexity_level,
    composition: clone(p.draft),
    supports: clone(p.supports),
  });
  const card: LearnerCard = {
    id: uid("card"),
    familyParticipationId: id,
    snapshotVersion: version,
    createdAt: now(),
    status: "active",
  };
  setState({
    ...state,
    participations: state.participations.map((x) =>
      x.id === id ? { ...x, snapshots: [...x.snapshots, snapshot] } : x,
    ),
    cards: [...state.cards, card],
    selectedVersion: { ...state.selectedVersion, [id]: version },
  });
  return version;
}

export function selectVersion(id: string, version: number) {
  setState({ ...state, selectedVersion: { ...state.selectedVersion, [id]: version } });
}

// ---------------------------------------------------------------------------
// Runs and feedback
// ---------------------------------------------------------------------------

export function startRun(cardId: string): string {
  const card = state.cards.find((c) => c.id === cardId);
  if (!card) return "";
  const run: ParticipationRun = {
    id: uid("run"),
    cardId,
    familyParticipationId: card.familyParticipationId,
    snapshotVersion: card.snapshotVersion,
    startedAt: now(),
    endedAt: null,
    feedback: null,
  };
  setState({ ...state, runs: [...state.runs, run] });
  return run.id;
}

export function endRun(runId: string) {
  setState({
    ...state,
    runs: state.runs.map((r) => (r.id === runId ? { ...r, endedAt: now() } : r)),
  });
}

export function setRunFeedback(runId: string, option: FeedbackOption, note: string | null) {
  setState({
    ...state,
    runs: state.runs.map((r) =>
      r.id === runId ? { ...r, feedback: { option, note, at: now() } } : r,
    ),
  });
}

// ---------------------------------------------------------------------------
// Lifecycle — history is never deleted
// ---------------------------------------------------------------------------

export function closeCard(cardId: string) {
  setState({
    ...state,
    cards: state.cards.map((c) => (c.id === cardId ? { ...c, status: "closed" } : c)),
  });
}

export function closeParticipation(id: string) {
  updateParticipation(id, (p) => ({ ...p, status: "closed" }));
}

export function reopenParticipation(id: string) {
  updateParticipation(id, (p) => ({ ...p, status: "active" }));
}

export function resetFamilyState() {
  setState(EMPTY);
}

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

export const blockText = (b: CompositionBlock) => b.familyText ?? b.referenceText;

export function activeCardFor(s: FamilyState, participationId: string) {
  const version = s.selectedVersion[participationId];
  return (
    s.cards.find(
      (c) =>
        c.familyParticipationId === participationId &&
        c.snapshotVersion === version &&
        c.status === "active",
    ) ??
    s.cards.find(
      (c) => c.familyParticipationId === participationId && c.status === "active",
    ) ??
    null
  );
}

export const runsForCard = (s: FamilyState, cardId: string) =>
  s.runs.filter((r) => r.cardId === cardId);

export const runsForParticipation = (s: FamilyState, id: string) =>
  s.runs.filter((r) => r.familyParticipationId === id);

export const cardsForParticipation = (s: FamilyState, id: string) =>
  s.cards.filter((c) => c.familyParticipationId === id);

export const referenceOf = (p: FamilyParticipation) =>
  p.reference_participation_id ? getParticipation(p.reference_participation_id) : undefined;

export const FEEDBACK_OPTIONS: { value: FeedbackOption; label: string }[] = [
  { value: "accepted_easily", label: "تقبّل المشاركة بسهولة" },
  { value: "joined_after_time", label: "شارك بعد بعض الوقت" },
  { value: "needed_some_support", label: "احتاج بعض الدعم" },
  { value: "try_another_way", label: "نحتاج أن نجربها بطريقة أخرى" },
];

export const SUPPORT_CATALOG: { type: SupportType; label: string; note: string }[] = [
  { type: "communication", label: "وسيلة تواصل", note: "صورة أو كلمة يستخدمها للتعبير أثناء المشاركة." },
  { type: "visual_sequence", label: "تسلسل مرئي", note: "صور قصيرة تُبيّن ما يحدث في هذه المشاركة." },
  { type: "timer", label: "مؤقّت", note: "إشارة بصرية لبقاء الوقت، لا لقياس الأداء." },
  { type: "stop_break", label: "إشارة توقف أو استراحة", note: "طريقة يقول بها: أريد التوقف قليلًا." },
  { type: "contextual_aid", label: "مساعد بصري في الموقف", note: "علامة في المكان تسهّل معرفة الموضع المقصود." },
];

export const ORIGIN_LABEL: Record<OriginType, string> = {
  reference: "استكشاف من المرجع",
  easy_beginning: "بداية سهلة",
  family_free: "تخطيط الأسرة",
};
