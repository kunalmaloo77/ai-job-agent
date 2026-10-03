# Job agent feature checklist

Implementation plan for an India-first job agent using Next.js, TypeScript, Drizzle, and PostgreSQL/pgvector.

Reference: [Architecture and design](docs/job-ingestion-design.md).

Unchecked boxes represent pending work; checked boxes represent completed work. Complete features in the order below. Features 1–8 deliver the first working flow; features 9–11 prepare recurring use; features 12–14 expand coverage and scale.

## 1. Shared analysis and embedding services

Goal: reuse the existing manual job-analysis logic from a background worker.

- [x] Read the relevant installed Next.js guides under `node_modules/next/dist/docs/` before changing framework code. Reread this task and the relevant guides before implementing subsequent tasks.
- [x] Move the analysis prompt and model call from `app/api/analyze-job/route.ts` into a server-side service. Implemented in `app/src/lib/job-analysis-service.ts`; verified with TypeScript and targeted ESLint checks.
- [ ] Keep Zod validation and extraction of requirements separate from candidate evaluation.
- [ ] Return responsibilities and preferred skills alongside the existing extracted fields.
- [ ] Create explicit job and candidate embedding text builders with aligned fields.
- [ ] Store the exact text submitted to the embedding API as embedding `content`.
- [ ] Reject empty vectors, incorrect dimensions, non-finite values, and zero-norm vectors.
- [ ] Centralize embedding model, dimension, and template version configuration.
- [ ] Make analysis and embedding errors distinguishable and usable by retry handlers.

Done when: both manual imports and worker code can call the same services without making HTTP requests to this app.

## 2. Database foundation and job versions

Goal: identify jobs reliably and track which content was processed.

- [ ] Add `job_sources`: company, provider, board identifier, enabled flag, polling interval, and last successful sync.
- [ ] Add company, description, application URL, first/last-seen timestamps, and active/closed status to jobs.
- [ ] Add `job_source_listings` linking each provider listing to a canonical job.
- [ ] Enforce uniqueness on `(source_id, external_id)`.
- [ ] For the MVP, store current `contentHash`, `revision`, processing status, and error on each job; defer full revision history to feature 14.
- [ ] Persist responsibilities, required/preferred skills, and extraction version.
- [ ] Add job revision and embedding configuration metadata to job embeddings.
- [ ] Prevent duplicate embeddings for the same job revision and configuration.
- [ ] Add candidate profile revision and compatible metadata to candidate embeddings.
- [ ] Generate and inspect Drizzle migrations, including how existing rows will be backfilled.
- [ ] Apply migrations to a development database and verify existing candidate/job data remains usable.

Done when: the database identifies a source listing uniquely and associates each embedding with the job version it represents.

## 3. Durable tasks and background worker

Goal: resume processing after failures without losing saved jobs.

- [ ] Choose a PostgreSQL-backed queue implementation compatible with the project and deployment.
- [ ] Define task types: fetch source, process job, embed candidate, match job, and match candidate.
- [ ] Persist payload, unique task key, status, attempts, next-attempt time, lease expiry, and last error.
- [ ] Include entity revision and processing configuration in task keys where applicable.
- [ ] Add enqueue helpers that participate in the same transaction as the corresponding database change.
- [ ] Add `app/scripts/worker.ts` and a package script to run it.
- [ ] Claim tasks safely so concurrent workers do not process the same active task.
- [ ] Support lease recovery, bounded concurrency, graceful shutdown, and retry limits.
- [ ] Retry transient failures with backoff and jitter; record terminal failures for replay.
- [ ] Check the expected revision before saving results so old tasks cannot overwrite new content.
- [ ] Verify a task resumes after a worker interruption and repeated delivery does not duplicate stored results.

Done when: saving a job and its processing task is atomic, and a stopped worker can resume pending work.

## 4. First job source: Greenhouse

Goal: fetch real jobs from one employer hiring in India.

- [ ] Define a shared source adapter interface and normalized source-listing type.
- [ ] Implement `app/src/lib/sources/greenhouse.ts` using the documented board API.
- [ ] Validate external IDs, titles, descriptions, locations, and application URLs.
- [ ] Add request timeouts, response-size limits, HTTP error handling, and rate-limit handling.
- [ ] Configure one verified employer board with relevant India openings and record source usage conditions.
- [ ] Fetch all pages where applicable and explicitly record whether the sync completed.
- [ ] Add a manual command or internal service invocation to enqueue a source fetch.
- [ ] Verify the adapter against representative fixtures and one configured live board.

Done when: one source returns validated listings with source identity and application links.

## 5. India normalization, deduplication, and ingestion

Goal: store each opening once and process it only when relevant content changes.

- [ ] Convert descriptions from HTML to plain text while retaining meaningful sections.
- [ ] Normalize country, city, state, and original location text.
- [ ] Add Bangalore/Bengaluru and Gurgaon/Gurugram aliases; keep Delhi NCR distinct from an individual city.
- [ ] Separate onsite/hybrid/remote arrangement from allowed work countries; preserve unknown eligibility.
- [ ] Preserve compensation text and normalize explicit currency, salary period, and base/CTC basis.
- [ ] Convert explicit INR LPA amounts to annual INR without inventing missing salary values.
- [ ] Extract experience range, employment type, and explicit notice-period requirements with evidence.
- [ ] Normalize common skill aliases and keep mandatory/preferred requirements separate.
- [ ] Filter clearly out-of-scope postings using available metadata; retain uncertain cases for review.
- [ ] Build a stable content hash excluding fetch timestamps and other irrelevant changing values.
- [ ] Upsert by source ID and external ID; update only last-seen metadata for unchanged listings.
- [ ] For new or changed content, increment the job revision and enqueue processing in one transaction.
- [ ] Give processing tasks an immutable content snapshot or explicitly skip superseded revisions before reading current content.
- [ ] Verify unchanged ingestion creates no new revision or embedding task.
- [ ] Verify changed content schedules processing and an older task cannot save over it.

Done when: repeated fetches are safe, and a meaningful job-description change triggers fresh processing.

## 6. Analysis and embedding pipeline

Goal: turn pending jobs into matchable jobs automatically.

- [ ] Implement the process-job task handler using feature 1 services.
- [ ] Bound description length and treat fetched descriptions as untrusted model input.
- [ ] Save validated extracted requirements against the intended job revision.
- [ ] Generate the embedding using the configured job text builder.
- [ ] Reuse an existing embedding for the same revision/configuration on retries.
- [ ] Save the embedding, mark the job ready, and enqueue matching atomically.
- [ ] Keep external model calls outside database transactions.
- [ ] Track failed analysis separately from failed embedding so recovery is understandable.
- [ ] Update manual job submission to use the same processing pipeline and return a committed task ID.
- [ ] Verify a model failure leaves a retryable task rather than a silently incomplete job.

Done when: fetching one job eventually produces a validated, current embedding without manual intervention.

## 7. Candidate preferences and custom scoring

Goal: calculate explainable fit for the intended candidate.

- [ ] Add candidate preferences for work arrangement, relocation, eligible countries, salary basis/minimum, and notice period.
- [ ] Distinguish strict constraints from preferences and unknown facts.
- [ ] Remove selection of the first candidate in the database; pass an explicit candidate ID into matching services.
- [ ] Build eligibility checks returning `eligible`, `not_eligible`, or `unknown`, with reasons.
- [ ] Reject only confirmed strict incompatibilities; do not reject because information is missing.
- [ ] Initially score all eligible active jobs with current, compatible embeddings.
- [ ] Reuse/refactor `app/src/lib/jobMatching.ts` for the semantic component and handle missing vectors explicitly.
- [ ] Implement required-skill coverage, experience fit, role preference, and preferred-skill components.
- [ ] Make weights configurable and version the scoring rules.
- [ ] Renormalize weights over available components and report evidence coverage separately.
- [ ] Handle zero available components with an unavailable score and `needs_review`.
- [ ] Return `fitScore`, component scores, eligibility, relevance, matched/missing skills, and evidence.
- [ ] Use `needs_review` for unresolved mandatory eligibility or insufficient evidence.
- [ ] Keep initial weights/thresholds provisional and label the result as a fit score out of 100.
- [ ] Verify aliases, missing requirements, experience shortfalls, and remote-country uncertainty.

Done when: a candidate/job pair receives a reproducible score with understandable reasons.

## 8. Saved matches and automatic rematching

Goal: serve saved results and refresh them when either side changes.

- [ ] Add `candidate_job_matches` with candidate/job IDs, both revisions, scoring version, scores, explanations, and computation time.
- [ ] Enforce one current match per candidate/job pair.
- [ ] Implement the match-job handler to calculate matches for the initial candidate set.
- [ ] Upsert results only if candidate/job revisions still match the current data.
- [ ] On candidate profile changes, increment its revision and enqueue candidate embedding work atomically.
- [ ] Enqueue rematching after the candidate embedding is ready.
- [ ] Invalidate existing matches when a job, candidate, or scoring configuration changes.
- [ ] Hide stale results or mark them pending refresh.
- [ ] Verify updating a candidate refreshes scores without refetching or re-embedding unchanged jobs.

Done when: one configured board produces saved, current matches for your candidate profile. This is the first working ingestion-to-score milestone.

## 9. Authenticated API and candidate dashboard

Goal: let candidates browse their matches and apply through the source.

- [ ] Add authentication and map the signed-in user to their candidate record.
- [ ] Protect candidate updates, manual imports, and model-consuming endpoints.
- [ ] Add `GET /api/me/matches` with pagination and score/location/work-arrangement filters.
- [ ] Enforce candidate ownership on every match/profile read and write.
- [ ] Add task-status access for authorized manual imports.
- [ ] Add protected internal ingestion triggers for the scheduler/admin.
- [ ] Return HTTP 202 only after background work has been durably queued.
- [ ] Build match cards with title, company, fit score, location, and work arrangement.
- [ ] Add details for score components, missing skills, and unknown requirements.
- [ ] Show posted/last-checked times and processing, empty, failed, and stale states.
- [ ] Display times in Asia/Kolkata while storing timestamps in UTC.
- [ ] Link to the original application URL.
- [ ] Verify one candidate cannot read another candidate's results and the dashboard flow works end to end.

Done when: a signed-in candidate can browse current matches and open the original application page.

## 10. Scheduled fetching and closed jobs

Goal: keep listings fresh automatically.

- [ ] Configure a scheduler to enqueue fetch tasks for enabled, due sources.
- [ ] Prevent overlapping runs for the same source.
- [ ] Add ingestion run records with counts, timings, completion state, and errors.
- [ ] Record last-successful-complete-sync separately from last attempted sync.
- [ ] Track listings absent from successful, complete authoritative board syncs.
- [ ] Apply the initial closure policy only after two complete syncs confirm absence.
- [ ] Never close jobs because a fetch failed, pagination was incomplete, or a search result disappeared.
- [ ] Keep a canonical job active while an authoritative linked source still reports it active.
- [ ] Exclude closed jobs from active matches and support reopened listings.
- [ ] Verify partial failure does not close jobs and reopening restores matching eligibility.

Done when: scheduled refreshes update jobs safely without treating outages as closures.

## 11. Worker deployment and operational visibility

Goal: run the pipeline continuously and identify failures.

- [ ] Choose a supervised worker process/container or a durable task runner compatible with the hosting environment.
- [ ] Configure database/provider credentials and scheduler authentication through environment variables.
- [ ] Document how to start the app, worker, and scheduler locally and in deployment.
- [ ] Log source, run, task, entity ID, and revision for each processing stage.
- [ ] Track task failures, queue age, processing latency, and stale-job rate.
- [ ] Track model calls and estimated cost per new/changed job without logging secrets.
- [ ] Add an operator command/view for inspecting and replaying failed tasks.
- [ ] Verify restart recovery and bounded concurrency in the intended deployment environment.

Done when: recurring ingestion runs without a local terminal and failed work can be diagnosed and replayed.

## 12. More sources and coverage

Goal: increase India coverage without changing the processing pipeline.

- [ ] Add a Lever adapter using the shared interface and pagination support.
- [ ] Add an Ashby adapter using the shared interface and exclude unlisted postings.
- [ ] Expand the verified employer registry toward 20–30 relevant boards.
- [ ] Measure useful India listings per source and disable persistently irrelevant sources.
- [ ] Identify cross-source duplicates using employer requisition IDs or canonical application URLs.
- [ ] Treat company/title/location similarity as a possible duplicate, not automatic proof.
- [ ] Preserve source attribution and source-specific closure state when merging listings.
- [ ] Evaluate licensed portal feeds for India coverage, full descriptions, access, cost, and storage/display conditions before integration.

Done when: multiple adapters feed the same pipeline without duplicate job cards for confirmed shared openings.

## 13. Scoring evaluation and tuning

Goal: validate whether the ranking actually helps candidates.

- [ ] Assemble approximately 100–200 manually reviewed candidate/job pairs spanning India cities, experience levels, and work arrangements.
- [ ] Record relevance labels and reasons for mismatches.
- [ ] Separate tuning examples from held-out evaluation examples.
- [ ] Measure precision@10, missed relevant jobs, and false eligibility exclusions.
- [ ] Tune weights, evidence-coverage rules, and relevance thresholds using the labeled set.
- [ ] Version any rule changes and enqueue rematching.
- [ ] Add candidate feedback such as useful/not relevant with an optional reason.
- [ ] Keep freshness as a separate sorting factor from fit.

Done when: chosen scoring rules have documented evaluation results and known limitations.

## 14. Later: scale, revision history, and international markets

Goal: expand only after the first pipeline is useful and stable.

- [ ] Measure matching latency and candidate/job volume before adding retrieval complexity.
- [ ] Add configurable top-K semantic retrieval and optional role/skill retrieval, then rerank their union.
- [ ] Validate pgvector index compatibility and filtered-query recall before adopting an index.
- [ ] Preserve invalidation/rescoring of old matches when retrieval selects a different candidate/job set.
- [ ] Add immutable `job_revisions` if historical descriptions and auditability become necessary.
- [ ] Add optional match history keyed by candidate revision, job revision, and scoring version.
- [ ] Define retention policies for source payloads, old vectors, tasks, and historical matches.
- [ ] Move country aliases, currencies, salary conventions, and display time zones into market configuration.
- [ ] Add country eligibility, work authorization, and time-zone preferences for international matching without inferring them from residence.
- [ ] Onboard and evaluate sources separately for each new market.

Done when: scaling and market expansion preserve the correctness of the original India workflow.
