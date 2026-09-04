# DALILI FRAMEWORK VALIDATION EVIDENCE 01

Evidence capture for the clean-room reference implementation, as executed in
Final Validation Run 01 and re-verified after Snapshot Immutability Fix 01.
This document records results only; it does not restate the framework
(see `docs/DALILI_FRAMEWORK_FREEZE_01.md`).

---

## 1. GOLDEN JOURNEYS

| ID | Journey | Result |
|----|---------|--------|
| J1 | Easy Beginning → approval → use → feedback → repetition | **PASS** |
| J2 | Discovery (life Event and Routine Station lens) → same Workspace → use | **PASS** |
| J3 | Family Free planning with no reference record → use | **PASS** |
| J4 | Versioning: v1 → edit → v2 with v1 unchanged | **PASS** |
| J5 | Shared/complementary role operating as a full Functional Participation | **PASS** |
| J6 | Complexity controls: Simple, Moderate and Advanced with no ability inference | **PASS** |

All six journeys were executed end to end against the running application, each
converging on the single downstream architecture
(Family Participation → Workspace → Composer → Optional Support → Preview → Approval →
Frozen Snapshot → Learner Card → Run → Feedback → Lifecycle).

---

## 2. FRAMEWORK RULES

**32/32 PASS.**

- Entry convergence: R01–R03 PASS — three origins present in real state, one shared model,
  Family Free requires no reference record.
- Functional Participation model: R04–R06 PASS — all five reference roles pass the seven gates;
  Event ≠ role and Execution Block ≠ role; one Event holds multiple roles.
- Shared participation: R07–R08 PASS — shared role is a valid full participation and is Simple.
- Complexity: R09–R12 PASS — all three levels present, Advanced marked as validation control,
  and complexity invariant to execution-block count, support count and run count.
- Workspace: R13–R15 PASS — explicit start/end, family wording independent of reference wording,
  independent text/image visibility.
- Reference immutability: R16 PASS — direct write to a reference record rejected; no reference drift
  after family customization.
- Optional support: R17–R18 PASS — approval never requires support; participation image is a
  distinct concept from visual support.
- Snapshot/versioning: R19–R20 PASS — see section 3.
- Learner Card: R21–R22 PASS — cards derive only from an existing approved version; the projection is
  structurally limited to allowed moment-of-use keys.
- Runs: R23–R24 PASS — each use creates a new Run without creating a new Family Participation;
  «انتهينا» closes only the current Run.
- Feedback: R25 PASS — feedback lives on the exact Run, never aggregated.
- Repetition: R26 PASS — neutral count only («استخدمت N مرات»), no streak, percentage or promotion.
- Lifecycle: R27–R28 PASS — card closure and participation closure preserve all history;
  no delete operation exists in the store.
- Negative gates: N01–N04 PASS — no score/mastery/progress/percent/streak/readiness/ability/
  independence/level/compliance/checklist field anywhere in application state; no automatic
  promotion or required repetition count; Routine Station carries no schedule/daily/streak field;
  family considerations cannot reach the Learner Card.

---

## 3. R19 — SNAPSHOT IMMUTABILITY

**Result: PASS after Snapshot Immutability Fix 01.**

**Root cause.** Approved snapshots were sealed only in memory at approval time. Persistence stored
plain serialized text, so on restoration the saved snapshot was parsed back into ordinary writable
objects and nothing re-established the approved/immutable boundary. Immutability therefore held
during a session but not after reload.

**Corrected invariant (frozen).**
> Approved Snapshot immutability must survive persistence and restoration, and cannot depend only on
> in-memory freezing. Every state that becomes visible to the application — created, edited, or
> restored — must present its approved snapshots as immutable, with identity, version, approved
> state, content and Family Participation relationship intact.

**Verified after the fix.**
- Direct mutation attempt on a restored approved snapshot: rejected.
- Restored approved snapshot reported as frozen.
- v1 before persistence, v1 after restoration, and v1 after v2 creation: byte-identical serialized content.
- v2 distinct in identity, version, title and composition; v1 unchanged.
- Explicit version selection returns v1 and v2 correctly; the Learner Card follows the selected version.
- Approval → Learner Card → Run → Feedback regression: PASS; role identity, complexity and reference
  content unchanged.

---

## 4. NEGATIVE ACCEPTANCE

No behaviour was introduced that converts participation into training, assessment, mastery,
progress tracking, or ability classification. Negative gates N01–N04 were re-checked after the
immutability fix and remained PASS.

---

## 5. CONSOLE

**Console errors = 0** during the full journey execution and after reload.

---

## 6. OVERALL

- Journeys: 6/6 PASS
- Rules: 32/32 PASS
- R19: PASS (after root-cause correction)
- J4: PASS
- Approval → Learner → Run regression: PASS
- Console errors: 0

**Framework validation = PASS.**
