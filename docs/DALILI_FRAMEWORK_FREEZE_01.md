# DALILI FRAMEWORK FREEZE 01 — Validated Reference Framework

Status: FROZEN. This document records the framework exactly as implemented and validated
in the clean-room reference project (Validation Foundation 01 + Final Validation Run 01 +
Snapshot Immutability Fix 01).

Validation status at freeze time:
- 6/6 Golden Journeys = PASS
- 32/32 framework rules = PASS
- R19 Snapshot Immutability = PASS after root-cause correction
- Console errors = 0

Nothing in this document may be changed to accommodate a future implementation.
Companion documents:
- `docs/DALILI_FRAMEWORK_VALIDATION_EVIDENCE_01.md`
- `docs/DALILI_FRAMEWORK_IMPLEMENTATION_CONTRACT_01.md`

---

## 1. CANONICAL CONCEPTS

### A. Domain
- **Definition:** A broad grouping of family life used only as a wide discovery surface
  (e.g. `DM-FAMILY-LIFE` — حياة الأسرة في البيت, `DM-SHARED-MOMENTS` — لحظات المشاركة والمتعة).
- **Purpose:** Give the family a starting breadth from which Events can be reached.
- **Is NOT:** a curriculum area, a skill area, a developmental domain, a category of ability,
  or a level.
- **Relationships:** Domain → Events. A Domain never contains Functional Participations directly.
- **Mutability:** Reference Knowledge. Immutable.

### B. Routine Station
- **Definition:** A discovery lens over recurring/familiar parts of family life
  (e.g. `RS-MEALTIME` — وقت الطعام, `RS-HOME-ORDER` — لحظات ترتيب البيت).
- **Purpose:** Let a family recognise where life already repeats, and reach Events from there.
- **Is NOT:** a schedule, a timetable, a habit tracker, a daily checklist, a streak system,
  a compliance mechanism, or a completion surface. It carries no time, date, due, done,
  streak or compliance field.
- **Relationships:** Routine Station → Events → Functional Participations.
- **Mutability:** Reference Knowledge. Immutable.

### C. Event
- **Definition:** A real-life occurrence that actually happens in family life and may contain
  more than one functional role (e.g. `EV-HOSTING` — ضيافة الأسرة).
- **Purpose:** Hold the life situation inside which functional roles exist.
- **Is NOT:** a Functional Participation, a task, an activity to be completed by the person,
  a lesson, or a training session. An Event is never delivered to a Learner Card.
- **Relationships:** Domain/Routine Station → Event → one or more Functional Participations.
- **Mutability:** Reference Knowledge. Immutable.

### D. Preferred Context
- **Definition:** A family-described situation the person likes, enjoys, requests, seeks, or
  meaningfully engages with (e.g. `PC-POPCORN` — تناول البوب كورن مع الأسرة), together with a
  **context expansion**: the moments that exist inside that liked context.
- **Purpose:** Entry orientation for بداية سهلة — start from value, not from assessment.
- **Is NOT:** a reinforcer, a reward, a preference assessment, a readiness indicator, or a
  measure of motivation level.
- **Relationships:** Preferred Context → Functional Participations found inside it.
- **Mutability:** Reference Knowledge in the reference corpus; a family may also describe its own.

### E. Functional Participation
- **Definition:** A real functional role a person can hold inside a life situation, defined by:
  life context, functional intent, observable effect/contribution, natural completion,
  functional independence of role, performance neutrality, participation mode
  (individual | shared/complementary), plus an authored complexity classification.
- **Purpose:** The single unit of the framework: what the person actually does *in life*.
- **Is NOT:** an Event, an Execution Block, a learner ability, a training objective, a
  behavioural target, a skill, a mastery criterion, or a level of the person.
- **Relationships:** Belongs to an Event and/or a Preferred Context; owns an Execution Draft
  of Execution Blocks; is copied (never moved) into a Family Participation.
- **Mutability:** Reference Knowledge. Immutable.

### F. Execution Block
- **Definition:** One authored step of wording inside an Execution Draft
  (e.g. `GJ-EASY-001-b2` — «نأخذ البوب كورن»).
- **Purpose:** Make the role usable at the moment of use.
- **Is NOT:** the Functional Participation itself, a task-analysis step for teaching, a prompt
  level, a measurement unit, or an input to complexity. No Execution Block equals the role title.
- **Relationships:** Functional Participation → Execution Draft → Execution Blocks; copied into a
  Family Draft as Composition Blocks.
- **Mutability:** Reference wording immutable; the family copy is editable.

### G. Family Participation
- **Definition:** The family's own working record of a participation, created by any entry path,
  carrying: origin type (`easy_beginning` | `reference` | `family_free`), provenance-only reference
  id, copied identity fields (title, life context, intent, effect, natural completion, mode,
  complexity level and rationale), draft, considerations, supports, snapshots, status.
- **Purpose:** The single downstream object all entry paths converge into.
- **Is NOT:** a copy that can write back to Reference Knowledge; not a plan for a person's level;
  not a progress record.
- **Relationships:** Family Participation → Draft → Snapshots → Learner Cards → Runs → Feedback.
- **Mutability:** Mutable Family State. Identity fields are copied at creation and are not
  re-derived from workspace edits.

### H. Family Draft / Composition
- **Definition:** The mutable composition: ordered Composition Blocks (immutable
  `referenceText` + independent `familyText` + `imageLabel` + `showText`/`showImage`),
  an explicit start block, an explicit end block, an optional family title, and an optional
  participation image.
- **Purpose:** Let the family shape the moment of use in its own words and images.
- **Is NOT:** an approved version, an evidence record, or a source of complexity.
- **Relationships:** Draft is the input to Approval, which produces an Approved Snapshot.
- **Mutability:** Fully mutable, always. It is the only editable surface.

### I. Family Considerations
- **Definition:** Optional family notes about the participation.
- **Purpose:** Hold family knowledge that shapes decisions by adults.
- **Is NOT:** learner-facing content, a precaution list shown at the moment of use, a rationale,
  or an assessment.
- **Relationships:** Stored on the Family Participation. Structurally excluded from the Learner Card.
- **Mutability:** Mutable.

### J. Optional Support
- **Definition:** An optional aid attached to the participation, typed as one of:
  communication, visual sequence, timer, stop/break, contextual aid.
- **Purpose:** Make participation possible in the family's real conditions.
- **Is NOT:** required for a participation to be complete or approvable; not a prompt level;
  not an input to complexity; not the same concept as the participation image.
- **Relationships:** Family Participation → Supports; carried into the Snapshot; may appear on the card.
- **Mutability:** Mutable in draft state; frozen inside a Snapshot.

### K. Approved Snapshot
- **Definition:** The frozen record produced by Approval, carrying a stable identity, an
  `approved` marker, a sequential version, the approval timestamp, the title, participation mode,
  complexity level, the composition, and the supports as approved.
- **Purpose:** Immutable evidence of what the family approved, and the only source of a Learner Card.
- **Is NOT:** the editing object; not a draft; not replaceable; not deletable.
- **Relationships:** Family Participation → Snapshots (append-only v1, v2, …) → Learner Cards.
- **Mutability:** **Immutable — including after persistence, restoration, reload, and browser
  restart.** Immutability may not depend only on in-memory freezing.

### L. Learner Card
- **Definition:** The moment-of-use projection derived only from one approved Snapshot version.
- **Purpose:** Support participation while it happens.
- **Is NOT:** a management view, a report, a progress screen, or a place for rationale,
  considerations, provenance, ability, mastery, independence or scores.
- **Relationships:** Card → one Family Participation + one explicitly selected approved version;
  Card → Runs.
- **Mutability:** A card is a projection; it never writes to the Snapshot. Its own status may close.

### M. Participation Run
- **Definition:** One occurrence of the participation happening in life, with its own identity,
  start, end, and the snapshot version used.
- **Purpose:** Record that participation occurred — nothing more.
- **Is NOT:** a training attempt, a trial, a probe, a data point for mastery, or a scored event.
- **Relationships:** Many Runs may belong to one Family Participation and to one Card/Snapshot version.
- **Mutability:** A Run closes; history is never deleted.

### N. Feedback
- **Definition:** Optional non-evaluative note attached to one exact Run, chosen from:
  accepted easily / joined after time / needed some support / try another way, plus an optional note.
- **Purpose:** Help the family decide what to try next.
- **Is NOT:** a score, a rating, a percentage, a mastery judgement, a readiness judgement, a level,
  or an advancement trigger. It is never aggregated across Runs.
- **Relationships:** Feedback belongs to exactly one Run.
- **Mutability:** Belongs to the Run record.

### O. Lifecycle
- **Definition:** Two independent closures: Card closure and Family Participation closure.
- **Purpose:** Let things end without loss and without judgement.
- **Is NOT:** deletion, failure, regression, or demotion.
- **Rules:** Closing a Card stops/archives card use and preserves its Runs and its parent.
  Closing a Family Participation makes the parent history and preserves Cards, Snapshots, Runs,
  and Feedback. No delete operation exists on historical evidence.
- **Mutability:** Status only; historical records remain.

---

## 2. FUNCTIONAL PARTICIPATION CONTRACT (FROZEN)

Seven validated gates, all of which must pass:

1. **Life Context** — the role happens inside a real life situation.
2. **Functional Intent** — the situation needs this role to happen.
3. **Contribution / Observable Effect** — something in the event, environment or interaction
   changes because the role happened.
4. **Natural Completion** — the end of the role is understood from the situation itself.
5. **Functional Independence of Role** — separated conceptually from the larger activity, it remains
   a meaningful functional role, not an enabling movement or an arbitrary fragment.
6. **Performance Neutrality** — the role is definable without independence, mastery, prompting,
   success percentage, repetitions, duration, ability, age, diagnosis, score or assessment language.
7. **Participation Mode** — declared as individual or shared/complementary.

Frozen distinctions:
- **Event ≠ Functional Participation.**
- **Execution Block ≠ Functional Participation.**
- **Functional Participation ≠ learner ability.**
- **Functional Participation ≠ training objective.**
- **Complexity classification may occur ONLY after Functional Participation validity passes.**

---

## 3. COMPLEXITY CONTRACT (FROZEN)

Canonical dimensions:
- **C1 Elements** — how many elements, actions or pieces of information the role carries.
- **C2 Coordination** — how much ordering, matching or synchronisation the role requires.
- **C3 Variability** — how much the requirement changes while the role happens.
- **C4 Choice / Uncertainty** — how many alternatives, decisions or uncertain outcomes it holds.

Canonical operational levels: **Simple**, **Moderate**, **Advanced**.

Complexity describes the **structure of the role**. It does NOT describe:
the person, ability, independence, mastery, diagnosis, age, assistance required,
previous success, number of repetitions, number of Workspace steps, or support use.

Additional frozen rules:
- Shared participation does not imply any complexity level (`GJ-SHARED-001` is shared and Simple).
- Advanced does not mean "complete the whole activity"; an Advanced role is one role inside an Event.
- Complexity is authored (editorial) and invariant: editing Execution Blocks, adding supports, or
  accumulating Runs never changes it.

---

## 4. ENTRY CONTRACT (FROZEN)

Canonical family entry strategies:
1. **بداية سهلة** (Easy Beginning)
2. **أخطط المشاركة بنفسي** (Family Free planning)
3. **استكشف المشاركات الممكنة** (Discovery)

Discovery supports at least two lenses:
- **life Event discovery**
- **Routine Station discovery**

A Routine Station is a discovery lens over recurring/familiar family life. It is NOT a schedule,
habit tracker, daily checklist, streak system, or compliance mechanism.

Convergence rule (frozen):

```text
Easy Beginning ─────┐
Discovery ──────────┼→ Family Participation
Family Free ────────┘
                         ↓
                      Workspace
                         ↓
                      Composer
                         ↓
                  Optional Support
                         ↓
                       Preview
                         ↓
                      Approval
                         ↓
                 Frozen Snapshot
                         ↓
                    Learner Card
                         ↓
                 Participation Run
                         ↓
                      Feedback
                         ↓
                     Lifecycle
```

No entry strategy may require a separate downstream architecture, a parallel model, or a
special-case state shape.

---

## 5. EASY BEGINNING CONTRACT (FROZEN)

**Purpose:** discover a promising participation context without assessing the person.

**Validated orientation:** start from something the person likes, enjoys, requests, seeks, or
meaningfully engages with. Prefer contexts that occur naturally or recur.

**Core relational direction:** the family creates a place for itself WITH the person inside
something the person already values.

Easy Beginning must NOT become: a readiness assessment, an ability questionnaire, a diagnostic
screening, or a learner-level assignment.

**Simple complexity is NOT synonymous with Easy Beginning.** Easy Beginning is an entry
orientation; Simple is a structural property of a role.

---

## 6. FAMILY CUSTOMIZATION CONTRACT (FROZEN)

Reference Knowledge is immutable. Family State is a separate world.

The family may customize:
- family wording (title and block wording),
- Execution Blocks (add, remove, reword),
- valid ordering,
- start and end block,
- image,
- image visibility,
- text visibility,
- optional considerations,
- optional supports.

Reference/source content must remain unchanged and remain restorable.

Editing Execution Blocks must not automatically change Functional Participation identity or
Complexity.

---

## 7. APPROVAL / VERSIONING CONTRACT (FROZEN)

```text
Mutable Family Draft → Approval → immutable Snapshot v1
Further editing happens in mutable state → Approval → immutable Snapshot v2 (v1 unchanged)
```

Persisted approved snapshots must retain:
- snapshot identity,
- version,
- approved state,
- approved content,
- Family Participation relationship,
- immutability after restoration/reload.

An Approved Snapshot must never become the mutable editing object. Versions are append-only and
sequential; the Learner Card follows the explicitly selected approved version.

---

## 8. LEARNER CONTRACT (FROZEN)

The Learner Card derives ONLY from an approved Snapshot, and carries moment-of-use content only.

Allowed: selected image; selected wording; one Execution Block at a time; navigation; «انتهينا».

Excluded structurally: complexity rationale, family considerations, provenance, management data,
ability, mastery, progress, independence, scores.

---

## 9. RUN / FEEDBACK CONTRACT (FROZEN)

- A Run is an occurrence of participation in life. **Run ≠ training attempt.**
- Each occurrence has its own Run identity.
- Multiple Runs may belong to one Family Participation and to one approved Snapshot/Card.
- Feedback belongs to the exact Run and remains non-evaluative.
- Feedback must not infer mastery, progress, readiness, learner level, advancement, or success
  percentage, and is never aggregated.
- Neutral recurrence history such as «استخدمت N مرات» is allowed.
- Streak or progression interpretation is not allowed.

---

## 10. LIFECYCLE CONTRACT (FROZEN)

- Card closure and Family Participation closure are separate operations.
- Closing a Card: stops/archives card use, preserves Runs and history, preserves the parent
  Family Participation.
- Closing a Family Participation: makes the parent inactive/history, preserves Cards, Snapshots,
  Runs, and Feedback.
- **Closure ≠ failure.** Historical evidence is never deleted.

---

## 11. GOLDEN REFERENCE CORPUS (FROZEN — DO NOT EXPAND)

Five fixtures only. Enough to validate the framework; not a content library.

### GJ-EASY-001
- **Title:** إحضار البوب كورن إلى مكان جلوس الأسرة
- **Life context:** تناول البوب كورن مع الأسرة
- **Functional intent:** إيصال البوب كورن إلى مكان المشاركة الأسرية
- **Observable effect:** أصبح البوب كورن موجودًا في مكان جلوس الأسرة
- **Natural completion:** وصل البوب كورن إلى المكان المقصود
- **Functional independence:** إيصال شيء إلى مكان المشاركة دور وظيفي مفهوم بذاته، وليس مجرد حركة تمكينية.
- **Mode:** individual — **Complexity:** simple
- **Rationale:** غرض واحد واضح، عدد قليل من العناصر، علاقة مباشرة بين الفعل ونتيجته، ولا يتطلب تنسيقًا أو اختيارات متعددة.
- **C1:** عنصر واحد يُنقل إلى مكان واحد. **C2:** لا يتطلب تزامنًا أو مطابقة بين عناصر.
  **C3:** المطلوب ثابت أثناء حدوث الدور. **C4:** لا توجد بدائل أو نتائج غير محددة.
- **Execution Draft:** نذهب إلى مكان البوب كورن / نأخذ البوب كورن / نحضره إلى مكان جلوسنا / انتهينا
- **Validation purpose:** J1 Easy Beginning from a Preferred Context; Simple control.

### GJ-DISCOVERY-001
- **Title:** إعادة أجهزة التحكم المستخدمة إلى مكانها
- **Life context:** ترتيب غرفة المعيشة
- **Functional intent:** إعادة الأشياء المستخدمة إلى موضعها المعتاد
- **Observable effect:** أصبحت أجهزة التحكم في أماكنها
- **Natural completion:** أعيدت الأجهزة المقصودة إلى أماكنها
- **Functional independence:** إعادة الأشياء إلى موضعها دور وظيفي مفهوم بذاته داخل حدث الترتيب.
- **Mode:** individual — **Complexity:** simple
- **Rationale:** غرض واحد واضح وعناصر قليلة متشابهة، والعلاقة بين الفعل والنتيجة مباشرة دون تنسيق أو تغيّر في المطلوب.
- **C1:** عناصر قليلة متشابهة وأماكن معروفة. **C2:** لا يتطلب ترتيبًا زمنيًا دقيقًا.
  **C3:** المطلوب ثابت. **C4:** لا توجد قرارات ذات أثر داخل الدور.
- **Execution Draft:** نجد أجهزة التحكم المستخدمة / نعيدها إلى مكانها / انتهينا
- **Validation purpose:** J2 Discovery via Event `EV-LIVING-TIDY` and Routine Station `RS-HOME-ORDER`.

### GJ-SHARED-001
- **Title:** تثبيت الوعاء بينما يضع فرد الأسرة البوب كورن فيه
- **Life context:** تجهيز البوب كورن مع الأسرة
- **Functional intent:** تثبيت الوعاء ليسمح بإكمال وضع البوب كورن فيه
- **Observable effect:** يبقى الوعاء في الموضع المطلوب أثناء وضع البوب كورن
- **Natural completion:** ينتهي الدور عند اكتمال وضع البوب كورن في الوعاء
- **Functional independence:** التثبيت دور وظيفي مكتمل بذاته: بدونه لا يمكن إكمال وضع البوب كورن. وهو دور تكميلي، لا أداء ناقص.
- **Mode:** shared — **Complexity:** simple
- **Rationale:** الدور تكميلي وواضح الغرض: عنصر واحد يُثبت في موضع واحد. كونه دورًا مشتركًا لا يزيد عناصره ولا تنسيقه ولا اختياراته، لذلك يبقى بسيطًا.
- **C1:** عنصر واحد (الوعاء) في موضع واحد. **C2:** تزامن واحد بسيط: البقاء في الموضع أثناء فعل الطرف الآخر.
  **C3:** المطلوب لا يتغير أثناء حدوث الدور. **C4:** لا توجد بدائل أو قرارات داخل الدور.
- **Execution Draft:** نضع أيدينا على الوعاء / نُبقي الوعاء ثابتًا / انتهينا
- **Validation purpose:** J5 shared/complementary role as a full Functional Participation, and the
  control proving shared ≠ advanced.

### GJ-MODERATE-001
- **Title:** توزيع الأكواب والأطباق المناسبة على الضيوف
- **Life context:** ضيافة الأسرة
- **Functional intent:** أن يجد كل ضيف ما يحتاجه أمامه قبل تقديم الضيافة
- **Observable effect:** أصبح أمام كل ضيف كوب وطبق في موضعه
- **Natural completion:** ينتهي الدور عندما يكون لكل ضيف حاضر كوب وطبق أمامه
- **Functional independence:** التوزيع دور وظيفي قائم بذاته داخل حدث الضيافة، ويمكن فهمه دون بقية الحدث.
- **Mode:** individual — **Complexity:** moderate
- **Rationale:** زيادة معنوية في العناصر والعلاقات: أكثر من نوع عنصر، ومطابقة بين العناصر والأشخاص والمواضع، وعدد الضيوف قد يتغير أثناء الدور، مع بعض القرارات في الترتيب. ومع ذلك يبقى الدور محددًا.
- **C1:** نوعان من العناصر بعدد يتبع عدد الضيوف. **C2:** مطابقة عنصر/شخص/موضع لكل ضيف.
  **C3:** عدد الضيوف ومواضع الجلوس قد تتغير أثناء الدور. **C4:** قرارات في ترتيب التوزيع والمواضع المناسبة.
- **Execution Draft:** ننظر إلى أماكن جلوس الضيوف / نأخذ الأكواب والأطباق / نضع لكل ضيف كوبًا وطبقًا /
  نتأكد أن كل ضيف أمامه ما يحتاجه / انتهينا
- **Validation purpose:** J6 Moderate level control inside the same Event as the Advanced role.

### GJ-ADVANCED-001  *(validation control)*
- **Title:** تلقّي طلبات المشروبات من الضيوف وتسليم كل مشروب لصاحبه
- **Life context:** ضيافة الأسرة
- **Functional intent:** أن يصل كل مشروب إلى الضيف الذي طلبه أثناء تقديم الضيافة
- **Observable effect:** أصبح بين يدي كل ضيف المشروب الذي طلبه
- **Natural completion:** ينتهي الدور عندما يصل إلى كل ضيف طلب مشروبًا مشروبه الذي طلبه
- **Functional independence:** تلقّي الطلب وتسليمه دور وظيفي واحد قائم بذاته، مستقل عن تحضير المشروبات أو تنظيم المجلس.
- **Mode:** individual — **Complexity:** advanced — **`validation_control: true`**
- **Rationale:** متطلبات متعددة متفاعلة داخل بنية الدور نفسه: معلومات مختلفة (طلب لكل ضيف) تُحمل في الوقت نفسه، ومطابقة بين مشروب وضيف وموضع، وطلبات تتغير أو تُضاف أثناء حدوث الدور، وقرارات ذات أثر عند التشابه أو التعارض. الدور متقدم بسبب بنيته لا لأنه يمثل الحدث كله ولا لأن الشخص قد يحتاج مساعدة أكبر.
- **C1:** طلب مختلف لكل ضيف، وعناصر مشروبات متعددة غير متماثلة.
  **C2:** مطابقة ثلاثية (طلب/مشروب/ضيف) مع ترتيب زمني بين التلقّي والتسليم.
  **C3:** الطلبات قد تتغير أو تُضاف بعد بدء الدور. **C4:** بدائل وقرارات عند تشابه المشروبات أو تعارض الطلبات.
- **Execution Draft:** نسأل كل ضيف عن مشروبه / نتذكر طلب كل ضيف / نأخذ المشروبات الجاهزة /
  نعطي كل ضيف مشروبه الذي طلبه / انتهينا
- **Validation purpose:** J6 Advanced control proving Advanced is structural and is one role inside
  an Event, not the whole Event and not an ability statement.

### Supporting reference structure (frozen)
- **Events:** `EV-LIVING-TIDY` (ترتيب غرفة المعيشة → GJ-DISCOVERY-001);
  `EV-HOSTING` (ضيافة الأسرة → GJ-MODERATE-001, GJ-ADVANCED-001);
  `EV-POPCORN-PREP` (تجهيز البوب كورن مع الأسرة → GJ-SHARED-001);
  `EV-FAMILY-SNACK` (تناول البوب كورن مع الأسرة → GJ-EASY-001).
- **Routine Stations:** `RS-MEALTIME` (وقت الطعام → EV-HOSTING, EV-POPCORN-PREP, EV-FAMILY-SNACK);
  `RS-HOME-ORDER` (لحظات ترتيب البيت → EV-LIVING-TIDY).
- **Domains:** `DM-FAMILY-LIFE` (EV-LIVING-TIDY, EV-HOSTING);
  `DM-SHARED-MOMENTS` (EV-FAMILY-SNACK, EV-POPCORN-PREP).
- **Preferred Context:** `PC-POPCORN` (تناول البوب كورن مع الأسرة) with expansion:
  يطلب البوب كورن بنفسه أو يتّجه إليه / يجلس مع الأسرة عندما يكون البوب كورن موجودًا /
  يتكرّر هذا الموقف في البيت بصورة طبيعية / تستطيع الأسرة أن تدخل هذه اللحظة وتصنع لنفسها مكانًا معه فيها;
  participations: GJ-EASY-001, GJ-SHARED-001.

---

## 12. FREEZE DECLARATION

The framework above is the reference contract. Any future implementation is measured against
`docs/DALILI_FRAMEWORK_IMPLEMENTATION_CONTRACT_01.md`; deviation is an implementation failure,
not a reason to amend this document.
