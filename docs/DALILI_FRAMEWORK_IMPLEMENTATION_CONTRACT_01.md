# DALILI FRAMEWORK IMPLEMENTATION CONTRACT 01

Implementation-neutral contract. Each item states WHAT must be true, not how the reference
project achieved it. Every requirement is independently testable. IDs are stable and must not be
renumbered.

Total requirements: **82**.

---

## FP — Functional Participation (12)

- **FP-01** A Functional Participation is validated by exactly seven gates, all of which must pass
  before it can be used: Life Context, Functional Intent, Contribution/Observable Effect, Natural
  Completion, Functional Independence of Role, Performance Neutrality, Participation Mode.
- **FP-02** Gate 1: the role is stated inside a real life situation.
- **FP-03** Gate 2: the reason the situation needs the role is stated.
- **FP-04** Gate 3: an observable change in the event, environment or interaction is stated.
- **FP-05** Gate 4: the natural end of the role is stated and derivable from the situation.
- **FP-06** Gate 5: the role remains a meaningful functional role when conceptually separated from
  the larger activity.
- **FP-07** Gate 6: the role definition contains no performance, ability, mastery, prompting,
  percentage, repetition, duration, age, diagnosis, score or assessment language. A definition
  containing such language must be rejected.
- **FP-08** Gate 7: participation mode is explicitly individual or shared/complementary.
- **FP-09** A candidate failing any gate cannot become a usable Functional Participation.
- **FP-10** An Event and a Functional Participation are distinct records; an Event may contain more
  than one Functional Participation.
- **FP-11** An Execution Block and a Functional Participation are distinct records; no Execution
  Block may be equal to the role itself.
- **FP-12** A Functional Participation never encodes learner ability or a training objective;
  no field may express either.

## CX — Complexity (9)

- **CX-01** Complexity classification is only reachable after FP validity passes.
- **CX-02** Complexity is described by exactly four dimensions: C1 Elements, C2 Coordination,
  C3 Variability, C4 Choice/Uncertainty.
- **CX-03** Operational levels are exactly Simple, Moderate, Advanced.
- **CX-04** Complexity is authored editorially and stored; it is never computed from execution data.
- **CX-05** Changing the number or wording of Execution Blocks does not change complexity.
- **CX-06** Adding or removing Optional Support does not change complexity.
- **CX-07** Accumulating Runs does not change complexity.
- **CX-08** A shared/complementary role may hold any level; shared never implies Advanced.
- **CX-09** Complexity rationale must be expressed as role structure and must contain no
  person-based criterion (ability, independence, mastery, diagnosis, age, assistance, previous
  success, repetitions, workspace step count, support use).

## EN — Entry (6)

- **EN-01** Exactly three family entry strategies exist: بداية سهلة, أخطط المشاركة بنفسي,
  استكشف المشاركات الممكنة.
- **EN-02** Discovery provides at least a life Event lens and a Routine Station lens.
- **EN-03** A Routine Station carries no time, schedule, due, completion, streak or compliance field.
- **EN-04** All three entries produce the same Family Participation record shape.
- **EN-05** No entry strategy has its own downstream architecture, parallel model or special-case state.
- **EN-06** The downstream order is fixed: Family Participation → Workspace → Composer → Optional
  Support → Preview → Approval → Frozen Snapshot → Learner Card → Participation Run → Feedback →
  Lifecycle.

## EB — Easy Beginning (5)

- **EB-01** Easy Beginning starts from a context the person likes, enjoys, requests, seeks, or
  meaningfully engages with.
- **EB-02** Easy Beginning may expand a liked context into the moments inside it.
- **EB-03** Easy Beginning collects no readiness, ability, diagnostic or learner-level input.
- **EB-04** Easy Beginning assigns no learner level and produces no classification of the person.
- **EB-05** Easy Beginning does not force Simple complexity; entry orientation and role structure
  are independent.

## FA — Family Participation (6)

- **FA-01** A Family Participation records its origin (easy beginning / discovery-reference /
  family free).
- **FA-02** A reference-derived Family Participation stores the reference link as provenance only and
  never writes to the reference record.
- **FA-03** A family-free Family Participation is valid with no reference record at all.
- **FA-04** Identity fields (title, life context, intent, effect, natural completion, mode,
  complexity and rationale) are copied at creation and are not re-derived from later composition edits.
- **FA-05** Every Family Participation carries a draft, considerations, supports and snapshots.
- **FA-06** Family Considerations are never included in any learner-facing output.

## WS — Workspace / Composition (8)

- **WS-01** A single shared workspace serves all entries.
- **WS-02** Execution/Composition Blocks can be added, removed, reworded and reordered.
- **WS-03** A start block and an end block are explicitly designated.
- **WS-04** Family wording is stored independently of reference wording.
- **WS-05** Reference wording remains available and restorable after family wording is applied.
- **WS-06** Text visibility and image visibility are independent per block, allowing image-only,
  text-only or both.
- **WS-07** A family title for the participation is optional and independent of the reference title.
- **WS-08** The participation image is a distinct concept from Optional Support.

## SU — Support (4)

- **SU-01** Support is optional; a participation is complete and approvable without any support.
- **SU-02** Support has a declared type from a fixed set (communication, visual sequence, timer,
  stop/break, contextual aid).
- **SU-03** Support use is never recorded as a prompt level, assistance level or performance datum.
- **SU-04** Support present at approval is carried inside the approved version.

## SN — Snapshot / Versioning (7)

- **SN-01** Approval creates a new snapshot from the current mutable draft.
- **SN-02** Snapshot versions are sequential and append-only, starting at 1.
- **SN-03** Creating v2 leaves v1 content byte-identical.
- **SN-04** A snapshot carries a stable identity, version, approved state, approved content and its
  Family Participation relationship.
- **SN-05** No operation deletes or replaces an approved snapshot.
- **SN-06** An approved snapshot is never the object the family edits; editing always occurs in
  mutable draft state.
- **SN-07** The version used downstream is explicitly selected, not implicitly the latest.

## LC — Learner Card (6)

- **LC-01** A Learner Card can only be created from an existing approved snapshot version.
- **LC-02** The card shows moment-of-use content only: selected image, selected wording, one
  execution block at a time, navigation, and «انتهينا».
- **LC-03** The card excludes complexity rationale and any complexity explanation.
- **LC-04** The card excludes family considerations, provenance and management data.
- **LC-05** The card excludes ability, mastery, progress, independence and score content.
- **LC-06** The card cannot write to the snapshot it derives from.

## RN — Run (5)

- **RN-01** A Run represents one occurrence of participation in life, not a training attempt or trial.
- **RN-02** Each occurrence has its own Run identity.
- **RN-03** Multiple Runs may belong to one Family Participation and to one approved snapshot/card
  without creating a new Family Participation.
- **RN-04** «انتهينا» closes only the current Run.
- **RN-05** Recurrence may be displayed only as a neutral count (e.g. «استخدمت N مرات»); no streak,
  percentage, trend or promotion may be derived from it.

## FB — Feedback (4)

- **FB-01** Feedback is optional and attaches to exactly one Run.
- **FB-02** Feedback options are non-evaluative and carry no ordinal or numeric value.
- **FB-03** Feedback is never aggregated across Runs.
- **FB-04** No mastery, progress, readiness, learner level, advancement or success percentage may be
  inferred or displayed from feedback.

## LY — Lifecycle (5)

- **LY-01** Card closure and Family Participation closure are separate operations.
- **LY-02** Closing a Card stops/archives card use and preserves its Runs and its parent.
- **LY-03** Closing a Family Participation makes the parent history and preserves its Cards,
  Snapshots, Runs and Feedback.
- **LY-04** Closure is never presented as failure, regression or demotion.
- **LY-05** No operation deletes historical evidence.

## IM — Immutability (5)

- **IM-01** Reference Knowledge is immutable; any write attempt to it must be rejected.
- **IM-02** Family State is stored separately from Reference Knowledge.
- **IM-03** Family customization can never alter reference content.
- **IM-04** An approved snapshot rejects mutation, including after persistence, restoration, reload
  and application restart. Immutability must not depend only on in-memory freezing.
- **IM-05** Application state contains no score, mastery, progress, percent, streak, readiness,
  ability, independence, learner-level, compliance or checklist field.
