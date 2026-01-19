# Explain This Commit

Explain This Commit is a small tool that takes a raw `git diff` and produces a structured explanation of what changed, what areas are affected, and what risks a reviewer should pay attention to.

The goal of the project is not to replace code review, but to surface higher-level signals that are often missing when looking at diffs or commit messages alone.

---

## Motivation

When reviewing pull requests, especially larger ones, I often found that commit messages and raw diffs did not give enough context to quickly understand *what kind of change* was being made. This is particularly true when a change touches multiple areas such as authentication, configuration, database logic, and UI at the same time.

This project started as an attempt to extract useful review signals directly from a diff, without relying on AI. The idea was to build a transparent, deterministic baseline that could later be compared against AI-based approaches.

---

## What the tool does

Given a git diff, the tool:

- Computes basic change statistics (files changed, additions, deletions)
- Classifies which areas of a codebase are affected (e.g. auth, database, config)
- Identifies potential risks and assigns a severity level
- Infers a likely *intent* behind the change (e.g. security hardening, dependency maintenance)
- Generates a review checklist
- Adapts the output for either a junior or senior reviewer

The output is structured JSON and can be viewed through a simple web UI.

---

## High-level architecture

The project is organised as a small monorepo:

- `apps/api` – Express API that performs all analysis
- `apps/web` – Vite-based frontend for interacting with the tool
- `packages/shared` – Shared schemas and types (validated with Zod)

The API is completely stateless and operates only on the provided diff.

---

## Deterministic analysis pipeline

All analysis is currently deterministic. No large language models are used.

The pipeline consists of several stages:

1. **Diff parsing**  
   Extracts file paths, additions, and deletions from the raw diff.

2. **Area classification**  
   Uses file path heuristics to identify affected areas such as authentication, database migrations, configuration, dependencies, tests, and UI.

3. **Risk modelling**  
   Generates structured risk signals with an associated severity level (`low`, `medium`, `high`) based on the areas touched and the size of the change.

4. **Intent inference**  
   Infers a likely intent behind the change (e.g. security hardening, dependency maintenance) using a combination of diff content and risk signals.

5. **Audience-specific shaping**  
   The same underlying signals are presented differently depending on whether the audience is junior or senior, prioritising completeness for juniors and signal density for seniors.

This staged approach keeps the system transparent and easy to evaluate.

---

## Evaluation

To evaluate the usefulness of the heuristics, the tool was run against a small set of real commit diffs taken from an MSc thesis project repository.

The sample diffs include:
- Authentication and session handling changes
- Database and persistence logic updates
- Configuration and deployment changes
- Dependency upgrades
- Mixed feature and UI changes

An evaluation script runs the full analysis pipeline over each diff and reports metrics such as files changed, churn, affected areas, and detected risks.

In practice, larger diffs touching authentication or database logic consistently produced multiple high-signal risks, while smaller configuration-only changes usually resulted in a single focused risk. This matches expectations and suggests the heuristics are capturing meaningful structure rather than noise.

---

## Future work

Possible extensions include:
- Comparing deterministic output against LLM-generated explanations
- Incorporating limited repository context (e.g. test coverage, recent changes)
- Measuring reviewer usefulness against commit messages alone
- Exporting evaluation results for larger-scale analysis

Any AI-based approach would be layered on top of the existing deterministic signals rather than replacing them.

---

## Running the project

### API
```bash
pnpm --filter ./apps/api dev
