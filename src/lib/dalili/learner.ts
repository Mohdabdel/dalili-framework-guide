import { blockText } from "./store";
import type { Snapshot, VisualSupport } from "./types";

/**
 * The ONLY projection the Learner Card may render.
 * Deliberately narrow: rationale, complexity, provenance, considerations,
 * scores, mastery, progress, ability and management data cannot reach it,
 * because they are not fields of this type.
 */
export interface LearnerView {
  title: string | null;
  participationImageLabel: string | null;
  steps: {
    id: string;
    text: string | null;
    imageLabel: string | null;
  }[];
  supports: { id: string; label: string }[];
}

export const LEARNER_VIEW_ALLOWED_KEYS = [
  "title",
  "participationImageLabel",
  "steps",
  "supports",
] as const;

export function buildLearnerView(snapshot: Snapshot): LearnerView {
  const c = snapshot.composition;
  const startIndex = Math.max(
    0,
    c.blocks.findIndex((b) => b.id === c.startBlockId),
  );
  const endIndexRaw = c.blocks.findIndex((b) => b.id === c.endBlockId);
  const endIndex = endIndexRaw < 0 ? c.blocks.length - 1 : endIndexRaw;
  const slice = c.blocks.slice(startIndex, endIndex + 1);

  return {
    title: c.familyTitle ?? snapshot.title,
    participationImageLabel: c.participationImageLabel,
    steps: slice.map((b) => ({
      id: b.id,
      text: b.showText ? blockText(b) : null,
      imageLabel: b.showImage ? (b.imageLabel ?? b.familyText ?? b.referenceText) : null,
    })),
    supports: snapshot.supports.map((s: VisualSupport) => ({ id: s.id, label: s.label })),
  };
}
