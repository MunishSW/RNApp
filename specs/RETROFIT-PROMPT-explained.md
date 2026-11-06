# The Retrofit Prompt, Explained Simply

This explains what `RETROFIT-PROMPT-v2.md` does, step by step, in plain words.

## The big idea

You have a feature that was built with plain speckit. The spec explains **what to build**, but nobody checked **which QA test case proves which requirement**.

The prompt fixes that. It takes the finished feature, the QA test cases, and the spec, and adds the missing links:

```
QA test case  ->  requirement (FR)  ->  task  ->  test in the code
```

After the prompt runs, you can ask: "Is every QA case covered? By which test?" and get a real answer.

It does **not** rebuild the feature. It does **not** change production code.

## What you give it

| Input | Required? | What it is |
|---|---|---|
| Spec folder | Yes | The `specs/<feature>` folder to convert |
| QA test cases | Yes | The QA file (Excel, CSV, Word, Markdown, or pasted text) |
| BRD | No | The business requirements document, used only to settle doubts |

Everything else (test file locations, test command, story id) the prompt works out by itself.

## The rules it follows

1. **Keep what exists.** Nothing in the spec is deleted or rewritten. Things are only added.
2. **QA is the truth.** If a QA case disagrees with a decision in the spec, the prompt does not change either. It marks the case **DIVERGENT** and reports it for a human to decide.
3. **No guessing.** It never invents a case, an expected result, or a link. If it cannot prove a link, it says "unverified".
4. **Production code is untouched.** It may add tests. It may change only the marker comment and the title on existing tests. It never weakens an existing check.
5. **No shortcuts.** It must work only from the spec folder, the QA file, the BRD, and the code. It must not copy from another spec folder. It must not start background workflows.
6. **Safe to re-run.** If the folder is already converted, it asks before continuing, and it updates sections instead of adding duplicates.
7. **One id change is allowed.** Requirement ids like `FR-4.1-01` become `FR-001`, `FR-002`, and so on, because review tools get confused by the dotted form. The old ids are kept in a small table.

Before it edits anything, it creates a new git branch and never commits.

## The steps

### Step A: Look around (read only)
It reads the spec folder, the BRD, and the test files. It lists the requirements, tasks, existing markers, and the test command. It looks for old test ids that are not in the QA file. If the folder already looks converted, it stops and asks you.

### Step B: Turn the QA file into `qa-cases.json`
It reads every row of the QA file and writes one entry per case, using exactly these fields: `id`, `desc`, `expected`, `scenario`, `module`, `category`, `status`, `type`, `approach`, `source`.

- It prints the column mapping first, so a wrong guess is visible.
- No row is dropped, merged, reworded, or reordered.
- It prints "rows read -> cases written" and the two numbers must match.

### Step C: Prove every case
For each case it finds the test that checks it and **reads the test**. A test only counts if the agent can **quote the exact assertion line** that checks the case's expected result. A test name or a nearby check is not enough.

Each case ends in one class:

| Class | Plain meaning |
|---|---|
| **COVERED** | A test checks the whole expected result |
| **PARTIAL** | A test checks part of it; the rest needs a person, or a module that is not built yet |
| **GAP** | No test exists, or the behaviour is not built |
| **MANUAL** | Only a person or a real device can check it |
| **DIVERGENT** | The QA case contradicts the spec |
| **QA-SUSPECT** | The QA case contradicts both the spec and the BRD |
| **OUT-OF-SCOPE** | Not part of this feature, or its rules are still open |

It also puts a marker above each proving test:

```
// Covers: HOME_LAYOUT_TC_001 - illustration and headline render
```

The format is exact: a plain hyphen, QA ids only in the id list, no other marker types.

### Step D: Write new tests (only when needed)
If a case is a GAP or PARTIAL and a unit test can prove it, the agent writes a **new test**. The new test must check the exact expected result. It cannot be empty, snapshot-only, or built to always pass.

If the new test fails, the agent does **not** change production code. It keeps the failing test and reports it as a real code defect.

### Step E: Add the missing files
1. **Rename requirement ids** to `FR-001...`, and keep a table of the old ids (written without the `FR-` prefix).
2. **spec.md**: add a table "which QA cases cover each requirement".
3. **tasks.md**:
   - Every task gets `Maps` (at least one `FR-NNN`) and `Accept` (what "done" means).
   - New tests become tasks.
   - Anything not built becomes an unchecked task.
   - The file ends with the main table `## TC -> Task coverage`, one row per QA case.
4. **plan.md**: add "which files implement which requirement" and "what is mocked in tests".
5. **manual-verification.json**: the cases a person must check, each with a reason.
6. **checklists**: add checks and the findings.

### Step F: Self-check
The agent checks its own work and fixes problems before moving on. For example:
- Every case appears exactly once in the table.
- The counts add up to the total.
- No old-style `FR-4.1-01` ids remain anywhere.
- Every requirement is named in at least one task.
- Every case has a task that lists one of its requirements.
- Every marker has the exact format.
- Every "covered" case has a quoted assertion line.
- Manual cases and the manual JSON file agree.
- No production file changed.

### Step G: Run the tests and write the coverage report
It runs only the tests for this feature (not the whole app) and writes `coverage-report.md` with:
- a summary of how many cases are covered, partial, manual, divergent, and so on,
- a table of every case with its status and the quoted assertion line,
- a list of the tests that map to each case,
- the cases that need a person.

It never invents results. A case counts as covered only if every test mapped to it passed.

### Step H: Final report
The agent lists the files it changed, the counts, and the "Retrofit Findings":
- cases where QA and spec disagree (a human must decide),
- failing tests (possible code bugs),
- cases blocked by other modules,
- old ids that match no QA case,
- requirements with no task.

## What you get at the end

| File | What it is |
|---|---|
| `qa-cases.json` | Every QA case, in a standard shape |
| `tasks.md` (updated) | Tasks with `Maps` / `Accept`, plus the TC -> Task table |
| `spec.md` (updated) | Requirement-to-QA-case table, renamed ids |
| `plan.md` (updated) | File allocation and mock plan |
| `manual-verification.json` | Cases a person must check |
| `coverage-report.md` | Proof, per case |
| Test files | Marker comments, plus any new tests |

## Why the "not covered" cases are not failures

A case can be "not covered" for honest reasons, and the prompt reports each one:

- **Divergent:** QA and the spec disagree. A person decides which is right.
- **Manual:** only a real phone or a screen reader can check it.
- **Partial, blocked:** another module (like the Offers screen) is not in this repo yet.
- **Failing:** the test found a real problem in the code.
- **Out of scope:** the rules are still open (for example the tablet layout).

## How we know it works

After each run, the `tdd-verify` tool checks the folder. In the last clean trial (trial4) it passed all 8 authoring rules. The checks added after that trial are being confirmed in trial5.
