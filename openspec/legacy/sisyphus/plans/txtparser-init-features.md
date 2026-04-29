# TxtParser UTF-8 Parser + Demo

## TL;DR
> **Summary**: Mirror the relevant `../ImageParser` package patterns into `@hamster-note/txt-parser` by introducing the Hamster parser/type dependencies, implementing a UTF-8-only `TxtParser`, and shipping a static browser page demo plus Jest coverage.
> **Deliverables**:
> - `TxtParser` class extending `DocumentParser`
> - `inspectTxt` export and typed inspection contract
> - UTF-8 `encode` / `decode` implementation backed by `@hamster-note/types`
> - `demo/` browser page using import maps and built package output
> - Jest coverage for exports, inspect, encode, decode, round-trip, and failure paths
> - README refresh for runtime support and demo usage
> **Effort**: Medium
> **Parallel**: YES - 2 waves
> **Critical Path**: 1 → 2 → 3 → 4 → 6

## Context
### Original Request
参照 `../ImageParser`，引入 `@hamster-note/types`，增加 `TxtParser` 类，完善 `encode` 和 `decode` 方法，并制作 demo。

### Interview Summary
- `decode` 本期固定为 UTF-8，不支持其它编码。
- demo 采用浏览器页面方案。
- 验证策略采用 Jest 单元测试。
- 默认保留现有元数据导出，避免无关破坏性改动。

### Metis Review (gaps addressed)
- Fixed the public API shape instead of leaving parity decisions to the executor.
- Fixed UTF-8 failure semantics: invalid bytes must throw `TxtParser 编码失败：...` or `TxtParser 解码失败：...` errors; no silent fallback.
- Fixed demo scope: static `demo/` page only, no new app/framework.
- Fixed verification: all acceptance criteria are executable (`npm test -- --runInBand`, `npm run typecheck`, `npm run build`, static server + browser QA).

## Work Objectives
### Core Objective
Turn the current placeholder `@hamster-note/txt-parser` package into a usable UTF-8 text parser package that follows the relevant `ImageParser` structural conventions without importing image/OCR-specific complexity.

### Deliverables
- Add `@hamster-note/document-parser` and `@hamster-note/types` runtime dependencies.
- Keep `TXT_PARSER_PACKAGE_NAME` and `txtParserWorkspaceStatus` exported for compatibility, with `txtParserWorkspaceStatus` preserving the exact value `'initialized'`.
- Export `TxtParser`, `TxtParserInputKind`, `TxtParserInspection`, and `inspectTxt` from `src/index.ts`.
- Implement `TxtParser.exts = ['txt']` and `TxtParser.ext = 'txt'`.
- Implement UTF-8-only `inspect`, `encode`, and `decode` with explicit Chinese error messages.
- Add a static browser demo under `demo/` that imports the built package and Hamster dependencies via import maps.
- Replace the placeholder test coverage with Jest tests that verify behavior and failure cases.
- Update README to describe the parser, commands, UTF-8-only scope, and demo usage.

## Verification Strategy
- Test decision: Jest unit tests (`jest.config.cjs`) + targeted browser QA for the static demo.
- QA policy: Every task includes happy-path and failure/edge-path verification.
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Outcome
- Parser runtime, static demo, test matrix and README updates were completed and verified.
