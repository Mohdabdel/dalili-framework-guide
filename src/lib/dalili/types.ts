// ============================================================================
// Dalili — Clean-room reference model
// Two strictly separated worlds:
//   REFERENCE KNOWLEDGE (immutable, deep-frozen, never mutated by families)
//   FAMILY STATE       (mutable, persisted)
// ============================================================================

export type ParticipationMode = "individual" | "shared";
export type ComplexityLevel = "simple" | "moderate" | "advanced";

/** C1–C4 editorial dimensions. They describe the ROLE, never the person. */
export interface ComplexityDimensions {
  /** C1 Elements */
  elements: string;
  /** C2 Coordination */
  coordination: string;
  /** C3 Variability */
  variability: string;
  /** C4 Choice / Uncertainty */
  choice: string;
}

// ---------------------------------------------------------------------------
// Reference knowledge
// ---------------------------------------------------------------------------

/** Broad discovery grouping. */
export interface Domain {
  id: string;
  title: string;
  eventIds: string[];
}

/**
 * A familiar part of family life used to discover Events.
 * Deliberately carries NO time, schedule, completion, streak or compliance field.
 */
export interface RoutineStation {
  id: string;
  title: string;
  note: string;
  eventIds: string[];
}

/** A real-life occurrence that may contain multiple functional roles. */
export interface LifeEvent {
  id: string;
  title: string;
  description: string;
  participationIds: string[];
}

/** A family-described situation the person likes / requests / seeks. */
export interface PreferredContext {
  id: string;
  title: string;
  /** Context expansion — the moments inside the liked context. */
  expansion: string[];
  participationIds: string[];
}

/** An execution block belonging to a reference Execution Draft. */
export interface ReferenceExecutionBlock {
  id: string;
  text: string;
}

/** A real functional role within a life situation. */
export interface FunctionalParticipation {
  id: string;
  title: string;
  life_context: string;
  functional_intent: string;
  observable_effect: string;
  natural_completion: string;
  participation_mode: ParticipationMode;
  complexity_level: ComplexityLevel;
  complexity_rationale: string;
  complexity_dimensions: ComplexityDimensions;
  /** Role-independence answer for gate 5 of the Functional Participation Test. */
  functional_independence: string;
  /** Execution Blocks are a SEPARATE concept from the participation itself. */
  execution_draft: ReferenceExecutionBlock[];
  /** Marks fixtures that exist only to control the validation. */
  validation_control?: boolean;
}

// ---------------------------------------------------------------------------
// Family state
// ---------------------------------------------------------------------------

export type OriginType = "reference" | "easy_beginning" | "family_free";

/** A block inside a family composition. Reference wording stays immutable. */
export interface CompositionBlock {
  id: string;
  /** Immutable reference/source wording. Empty for family-authored blocks. */
  referenceText: string;
  /** Independent family wording. Null means "use reference wording". */
  familyText: string | null;
  imageLabel: string | null;
  showText: boolean;
  showImage: boolean;
}

export interface Composition {
  blocks: CompositionBlock[];
  startBlockId: string | null;
  endBlockId: string | null;
  /** Family wording for the participation title, independent of reference. */
  familyTitle: string | null;
  participationImageLabel: string | null;
}

export type SupportType =
  | "communication"
  | "visual_sequence"
  | "timer"
  | "stop_break"
  | "contextual_aid";

export interface VisualSupport {
  id: string;
  type: SupportType;
  label: string;
}

/** Frozen snapshot created at approval. Never mutated afterwards. */
export interface Snapshot {
  /** Stable identity that survives persistence. */
  id: string;
  /** Persisted approval marker; approved snapshots are immutable evidence. */
  approved: true;
  version: number;
  approvedAt: string;
  title: string;
  participation_mode: ParticipationMode;
  complexity_level: ComplexityLevel;
  composition: Composition;
  supports: VisualSupport[];
}

export interface LearnerCard {
  id: string;
  familyParticipationId: string;
  snapshotVersion: number;
  createdAt: string;
  status: "active" | "closed";
}

export interface RunFeedback {
  option: FeedbackOption;
  note: string | null;
  at: string;
}

export type FeedbackOption =
  | "accepted_easily"
  | "joined_after_time"
  | "needed_some_support"
  | "try_another_way";

export interface ParticipationRun {
  id: string;
  cardId: string;
  familyParticipationId: string;
  snapshotVersion: number;
  startedAt: string;
  endedAt: string | null;
  feedback: RunFeedback | null;
}

export interface FamilyParticipation {
  id: string;
  origin_type: OriginType;
  /** Provenance only. The referenced record is never written to. */
  reference_participation_id: string | null;
  reference_context_label: string;
  /** Copied-at-creation identity fields. Identity does not change in Workspace. */
  title: string;
  life_context: string;
  functional_intent: string;
  observable_effect: string;
  natural_completion: string;
  participation_mode: ParticipationMode;
  complexity_level: ComplexityLevel;
  complexity_rationale: string;
  createdAt: string;
  status: "active" | "closed";
  /** Editable working composition. */
  draft: Composition;
  considerations: string[];
  supports: VisualSupport[];
  snapshots: Snapshot[];
}

export interface FamilyState {
  participations: FamilyParticipation[];
  cards: LearnerCard[];
  runs: ParticipationRun[];
  /** Which approved version the Learner Card explicitly uses. */
  selectedVersion: Record<string, number>;
}
