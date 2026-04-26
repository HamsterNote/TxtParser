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

### Definition of Done (verifiable conditions with commands)
- `npm run typecheck` exits `0`.
- `npm run build` exits `0` and outputs `dist/index.js` plus `dist/index.d.ts` without bundling `@hamster-note/types` or `@hamster-note/document-parser`.
- `npm test -- --runInBand` exits `0` with assertions covering exports, inspect, UTF-8 encode, UTF-8 decode, round-trip, empty content, BOM-tolerant decoding, invalid UTF-8 failure, and no-page decode failure.
- `npx http-server -p 8000` from repo root (or `npm run dev` if added exactly as planned) serves `demo/index.html`, and browser QA proves inspect/encode/decode behavior with fixed sample text.

### Must Have
- API shape aligned with `../ImageParser` where semantics overlap: parser class extending `DocumentParser`, static + instance `encode` / `decode`, static `inspect`, standalone `inspectTxt` export.
- UTF-8 decoding performed with `TextDecoder('utf-8', { fatal: true })` so invalid bytes fail hard.
- UTF-8 encoding performed with `TextEncoder` and returned as `ArrayBuffer`.
- `IntermediateDocument` built via `IntermediatePageMap.makeByInfoList()` with one deterministic page and one deterministic text block for the encoded TXT payload.
- Demo HTML must use an import map to resolve `@hamster-note/document-parser` and `@hamster-note/types` from `esm.sh`, matching the dependency externalization strategy.

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)
- No CI setup.
- No new parser registration infrastructure usage outside what `DocumentParser` already provides.
- No support for Shift-JIS, GBK, UTF-16, streaming decode, or mixed-encoding fallback.
- No image/OCR/browser-canvas code copied from `ImageParser`.
- No React/Vite/Storybook app scaffold.
- No removal of existing metadata exports in this phase.
- No vague demo validation like “open the page and see if it works.”

## Verification Strategy
> ZERO HUMAN INTERVENTION - all verification is agent-executed.
- Test decision: Jest unit tests (`jest.config.cjs`) + targeted browser QA for the static demo.
- QA policy: Every task includes happy-path and failure/edge-path verification.
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy
### Parallel Execution Waves
> Target: 5-8 tasks per wave. <3 per wave (except final) = under-splitting.
> Extract shared dependencies as Wave-1 tasks for max parallelism.

Wave 1: 1) package/build scaffolding, 2) parser API contract, 3) UTF-8 encode path, 4) UTF-8 decode path
Wave 2: 5) browser page demo, 6) Jest regression coverage, 7) README refresh

### Dependency Matrix (full, all tasks)
- 1 blocks 2, 3, 5, 6, 7
- 2 blocks 3, 4, 5, 6, 7
- 3 blocks 4, 5, 6, 7
- 4 blocks 5, 6, 7
- 5 blocks 7
- 6 blocks final verification only
- 7 blocks final verification only

### Agent Dispatch Summary (wave → task count → categories)
- Wave 1 → 4 tasks → `quick`, `unspecified-low`
- Wave 2 → 3 tasks → `quick`, `visual-engineering`, `writing`
- Final Verification → 4 tasks → `oracle`, `unspecified-high`, `deep`

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [x] 1. Align package manifest and build config with parser runtime + demo serving

  **What to do**: Update `package.json` to add `@hamster-note/document-parser@^0.3.1` and `@hamster-note/types@0.7.0` under `dependencies`, add `http-server@^14.1.1` under `devDependencies`, and add `dev: "http-server -p 8000"` while keeping existing `build`, `typecheck`, `test`, and `lint` entries intact. Update `rolldown.config.ts` so the main build externalizes `@hamster-note/document-parser` and `@hamster-note/types` exactly, without adding any image/OCR-only externals. Do not add CI, Vite, or any additional bundling targets.
  **Must NOT do**: Do not change package name/version, do not remove existing exports metadata fields, do not convert the project to CJS, and do not introduce framework-specific demo tooling.

  **Recommended Agent Profile**:
  - Category: `quick` - Reason: bounded manifest/build edits in two files
  - Skills: [] - no special skill required
  - Omitted: [`frontend-ui-ux`] - no UI design work in this task

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 2, 3, 5, 6, 7 | Blocked By: none

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `package.json:1-51` - current manifest baseline to preserve while adding parser/demo dependencies
  - Pattern: `rolldown.config.ts:1-7` - current single-output build that must stay minimal
  - Pattern: `../ImageParser/feature-push-npm/package.json:5-16` - dependency and `dev` script shape to mirror selectively
  - Pattern: `../ImageParser/feature-push-npm/rolldown.config.ts:11-20` - external dependency pattern to mirror without PaddleOCR

  **Acceptance Criteria** (agent-executable only):
  - [ ] `node -e "const p=require('./package.json'); if(p.dependencies['@hamster-note/document-parser']!=='^0.3.1') throw new Error('missing document-parser'); if(p.dependencies['@hamster-note/types']!=='0.7.0') throw new Error('missing types'); if(p.devDependencies['http-server']!=='^14.1.1') throw new Error('missing http-server'); if(p.scripts.dev!=='http-server -p 8000') throw new Error('missing dev script')"`
  - [ ] `node -e "const fs=require('fs'); const text=fs.readFileSync('rolldown.config.ts','utf8'); for (const token of ['@hamster-note/document-parser','@hamster-note/types']) if(!text.includes(token)) throw new Error('missing external '+token); if(text.includes('@paddleocr/paddleocr-js')) throw new Error('unexpected image external')"`

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Manifest and build config are aligned
    Tool: Bash
    Steps: run `npm run build`, then run `node -e "const fs=require('fs'); const text=fs.readFileSync('dist/index.js','utf8'); for (const token of ['@hamster-note/document-parser','@hamster-note/types']) if(!text.includes(token)) throw new Error('dist lost external '+token)"`
    Expected: build exits 0, emits `dist/index.js` + `dist/index.d.ts`, and keeps Hamster dependencies externalized in the output bundle
    Evidence: .sisyphus/evidence/task-1-build.txt

  Scenario: No accidental demo-framework scope creep
    Tool: Bash
    Steps: run `node -e "const p=require('./package.json'); const deps={...p.dependencies,...p.devDependencies}; const banned=['vite','react','storybook']; const hit=banned.filter((name)=>name in deps); if(hit.length) throw new Error(hit.join(','))"`
    Expected: command exits 0 with no banned dependencies present
    Evidence: .sisyphus/evidence/task-1-guardrail.txt
  ```

  **Commit**: NO | Message: `n/a` | Files: `package.json`, `rolldown.config.ts`

- [x] 2. Replace the stub entrypoint with the TxtParser public API contract

  **What to do**: Replace the placeholder-only `src/index.ts` with the final public API surface while preserving `TXT_PARSER_PACKAGE_NAME` and `txtParserWorkspaceStatus`, with `txtParserWorkspaceStatus` staying exactly `'initialized'`. Export `TxtParserInputKind = 'array-buffer' | 'array-buffer-view' | 'blob'`, `TxtParserInspection`, `TxtParser`, and `inspectTxt`. Implement helper functions for blob detection, input-kind detection, parser error wrapping, and plain-text mime type resolution. Fix the exact inspection contract to: `{ byteLength, kind, message, mimeType, status: 'txt-supported', supportedExtensions: ['txt'] }`, where `message` is exactly `TxtParser 支持 UTF-8 TXT 编码与解码；inspect 不会修改输入内容。`, `mimeType` is `input.type` for a non-empty `Blob.type`, otherwise `'text/plain'`, `TxtParser.exts` is `['txt']`, and `TxtParser.ext` is `'txt'`.
  **Must NOT do**: Do not add parser registration side effects, default exports, `inspectTxtFile`, or any support for string input outside `ParserInput`.

  **Recommended Agent Profile**:
  - Category: `quick` - Reason: single-file API contract implementation with deterministic behavior
  - Skills: [] - no special skill required
  - Omitted: [`git-master`] - no git workflow needed inside the task itself

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 3, 4, 5, 6, 7 | Blocked By: 1

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `src/index.ts:1-3` - current placeholder exports that must remain available
  - Pattern: `../ImageParser/feature-push-npm/src/index.ts:16-25` - inspection type shape to mirror semantically
  - Pattern: `../ImageParser/feature-push-npm/src/index.ts:163-181` - input-kind detection and parser-error helper pattern
  - Pattern: `../ImageParser/feature-push-npm/src/index.ts:1586-1659` - `DocumentParser` subclass/export shape to mirror for `TxtParser`
  - API/Type: external npm d.ts for `@hamster-note/document-parser@0.3.1` - `ParserInput` is `ArrayBuffer | ArrayBufferView | Blob`

  **Acceptance Criteria** (agent-executable only):
  - [ ] `npm test -- --runInBand --runTestsByPath src/__tests__/txtParser.test.ts -t "exports the TxtParser public API"`
  - [ ] `npm test -- --runInBand --runTestsByPath src/__tests__/txtParser.test.ts -t "inspects blob and binary input without mutating content"`

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Export surface matches the agreed API
    Tool: Bash
    Steps: run `node --input-type=module -e "import('./dist/index.js').then((m)=>{ for (const key of ['TXT_PARSER_PACKAGE_NAME','txtParserWorkspaceStatus','TxtParser','inspectTxt']) if(!(key in m)) throw new Error('missing '+key); if(m.txtParserWorkspaceStatus!=='initialized') throw new Error('bad workspace status'); if(m.TxtParser.ext!=='txt') throw new Error('bad ext'); if(JSON.stringify([...m.TxtParser.exts])!=='[\"txt\"]') throw new Error('bad exts') })"`
    Expected: command exits 0 and all required exports exist with the exact preserved compatibility values and parser ext metadata
    Evidence: .sisyphus/evidence/task-2-exports.txt

  Scenario: Inspect handles non-Blob input kind detection
    Tool: Bash
    Steps: run `node --input-type=module -e "import('./dist/index.js').then(async ({TxtParser})=>{ const r=await TxtParser.inspect(new Uint8Array([65,66,67])); if(r.kind!=='array-buffer-view') throw new Error('bad kind'); if(r.mimeType!=='text/plain') throw new Error('bad mime'); if(r.status!=='txt-supported') throw new Error('bad status') })"`
    Expected: command exits 0 and inspect returns the fixed shape for binary view input
    Evidence: .sisyphus/evidence/task-2-inspect.txt
  ```

  **Commit**: NO | Message: `n/a` | Files: `src/index.ts`

- [x] 3. Implement deterministic UTF-8 encode into `IntermediateDocument`

  **What to do**: Implement `TxtParser.encode()` and the instance `encode()` delegate in `src/index.ts`. Use `DocumentParser.toUint8Array(input)` or the equivalent inherited helper to read bytes, then decode with `new TextDecoder('utf-8', { fatal: true })`. If decoding fails, throw `new Error('TxtParser 编码失败：输入不是有效的 UTF-8 TXT 数据')` or wrap the platform error under that prefix. Build one deterministic `IntermediateDocument` with `id: 'txt-parser-document'`, `title: 'TXT Document'`, `outline: undefined`, and an `IntermediatePageMap.makeByInfoList()` containing exactly one page. That page must have `id: 'txt-parser-page-1'`, `number: 1`, `width: max(1, longestLineLength)`, `height: max(1, lineCount)`, one paragraph `id: 'txt-parser-paragraph-1'`, and one text block `id: 'txt-parser-text-1'` whose `content` is the decoded string exactly as produced by the UTF-8 decoder. Set the text geometry and style deterministically: `polygon = [[0,0],[width,0],[width,height],[0,height]]`, `fontSize = 1`, `fontFamily = 'monospace'`, `fontWeight = 400`, `italic = false`, `color = '#000000'`, `lineHeight = 1`, `ascent = 0.8`, `descent = 0.2`, `dir = TextDir.LTR`, `skew = 0`, `isEOL = true`. Use `paragraph.textIds = ['txt-parser-text-1']`. For line metrics, calculate `lineCount` from `/\r\n|\r|\n/` splitting and `longestLineLength` from the resulting lines; if the content is empty, use width `1` and height `1`. Accept and strip a UTF-8 BOM via the decoder’s normal behavior; do not add a BOM on output.
  **Must NOT do**: Do not split the content into multiple `IntermediateText` nodes, do not normalize line endings, and do not infer RTL/vertical layout.

  **Recommended Agent Profile**:
  - Category: `unspecified-low` - Reason: slightly denser logic with fixed data-model mapping
  - Skills: [] - direct implementation from local patterns
  - Omitted: [`frontend-ui-ux`] - no UI work here

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 4, 5, 6, 7 | Blocked By: 1, 2

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `../ImageParser/feature-push-npm/src/index.ts:1578-1584` - `IntermediateDocument` + `IntermediatePageMap` construction pattern
  - Pattern: `../ImageParser/feature-push-npm/src/index.ts:1616-1624` - static `encode` structure and delegation target
  - API/Type: external npm d.ts for `@hamster-note/types@0.7.0` - `IntermediateDocument`, `IntermediatePageMap.makeByInfoList`, `IntermediatePage`, `IntermediateText`, `IntermediateParagraph`, `TextDir`
  - Test baseline: `src/__tests__/index.test.ts:1-8` - placeholder coverage to replace with real parser assertions

  **Acceptance Criteria** (agent-executable only):
  - [ ] `npm test -- --runInBand --runTestsByPath src/__tests__/txtParser.test.ts -t "encodes UTF-8 text into a deterministic intermediate document"`
  - [ ] `npm test -- --runInBand --runTestsByPath src/__tests__/txtParser.test.ts -t "rejects invalid UTF-8 bytes during encode"`

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Happy-path encode preserves text content and deterministic IDs
    Tool: Bash
    Steps: run `node --input-type=module -e "import('./dist/index.js').then(async ({TxtParser})=>{ const doc=await TxtParser.encode(new TextEncoder().encode('Hello\n你好')); const pages=await doc.pages; if(pages.length!==1) throw new Error('bad page count'); const texts=await pages[0].getTexts(); if(texts.length!==1||texts[0].content!=='Hello\n你好') throw new Error('bad content'); if(doc.id!=='txt-parser-document'||pages[0].id!=='txt-parser-page-1') throw new Error('bad ids') })"`
    Expected: command exits 0 and the encoded document contains one page with one text block preserving multiline UTF-8 content
    Evidence: .sisyphus/evidence/task-3-encode.txt

  Scenario: Edge path handles BOM and invalid bytes correctly
    Tool: Bash
    Steps: run `node --input-type=module -e "import('./dist/index.js').then(async ({TxtParser})=>{ const bom=new Uint8Array([0xEF,0xBB,0xBF,0x41]); const doc=await TxtParser.encode(bom); const text=(await (await doc.pages)[0].getTexts())[0].content; if(text!=='A') throw new Error('bom not handled'); let failed=false; try { await TxtParser.encode(new Uint8Array([0xC3,0x28])) } catch (error) { failed=String(error.message).startsWith('TxtParser 编码失败：') } if(!failed) throw new Error('invalid utf8 did not fail') })"`
    Expected: BOM-prefixed UTF-8 decodes successfully, invalid UTF-8 throws with the required prefix
    Evidence: .sisyphus/evidence/task-3-edge.txt
  ```

  **Commit**: NO | Message: `n/a` | Files: `src/index.ts`, `src/__tests__/txtParser.test.ts`

- [x] 4. Implement deterministic UTF-8 decode from `IntermediateDocument`

  **What to do**: Implement `TxtParser.decode()` and the instance `decode()` delegate in `src/index.ts`. Read `await intermediateDocument.pages`; if there are zero pages, throw `new Error('TxtParser 解码失败：中间文档不包含可解码页面')`. For each page in the returned order, fetch `await page.getTexts()`, concatenate `text.content` values in array order with no separator inside a page, then join page payloads with a single `\n` between pages that contribute content. Convert the resulting string with `new TextEncoder().encode(content).buffer` and return the `ArrayBuffer`. If pages exist but all texts are empty/missing, return an empty UTF-8 buffer. Wrap unexpected failures with a `TxtParser 解码失败：` prefix.
  **Must NOT do**: Do not depend on paragraph geometry for decoding, do not emit BOMs, and do not require the document to come only from `TxtParser.encode()`.

  **Recommended Agent Profile**:
  - Category: `unspecified-low` - Reason: deterministic data extraction with explicit error semantics
  - Skills: [] - direct implementation from plan decisions
  - Omitted: [`playwright`] - no browser work in this task

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 5, 6, 7 | Blocked By: 1, 2, 3

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `../ImageParser/feature-push-npm/src/index.ts:1630-1652` - static + instance `decode` shape and no-page failure pattern
  - API/Type: external npm d.ts for `@hamster-note/types@0.7.0` - `IntermediateDocument.pages` and `IntermediatePage.getTexts()` access pattern
  - API/Type: external npm d.ts for `@hamster-note/document-parser@0.3.1` - `decode()` returns `Promise<ParserInput>` at the instance level

  **Acceptance Criteria** (agent-executable only):
  - [ ] `npm test -- --runInBand --runTestsByPath src/__tests__/txtParser.test.ts -t "decodes a deterministic intermediate document back into UTF-8 bytes"`
  - [ ] `npm test -- --runInBand --runTestsByPath src/__tests__/txtParser.test.ts -t "throws when decode receives a document with no pages"`

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Happy-path decode preserves round-trip text
    Tool: Bash
    Steps: run `node --input-type=module -e "import('./dist/index.js').then(async ({TxtParser})=>{ const source='Line 1\nLine 2\n你好'; const doc=await TxtParser.encode(new TextEncoder().encode(source)); const out=await TxtParser.decode(doc); const text=new TextDecoder('utf-8').decode(out); if(text!==source) throw new Error('round trip mismatch') })"`
    Expected: command exits 0 and the decoded ArrayBuffer round-trips to the exact UTF-8 source string
    Evidence: .sisyphus/evidence/task-4-roundtrip.txt

  Scenario: Failure path rejects page-less documents
    Tool: Bash
    Steps: run `node --input-type=module -e "import('@hamster-note/types').then(async ({IntermediateDocument,IntermediatePageMap})=>{ const {TxtParser}=await import('./dist/index.js'); const doc=new IntermediateDocument({id:'empty',title:'Empty',pagesMap:new IntermediatePageMap(),outline:undefined}); let ok=false; try { await TxtParser.decode(doc) } catch (error) { ok=String(error.message)==='TxtParser 解码失败：中间文档不包含可解码页面' } if(!ok) throw new Error('missing no-page failure') })"`
    Expected: command exits 0 only when page-less decode fails with the exact agreed message
    Evidence: .sisyphus/evidence/task-4-nopage.txt
  ```

  **Commit**: YES | Message: `feat(txt-parser): add UTF-8 parser core` | Files: `src/index.ts`, `src/__tests__/txtParser.test.ts`, `package.json`, `rolldown.config.ts`

- [x] 5. Build the static browser page demo under `demo/`

  **What to do**: Add `demo/index.html`, `demo/demo.js`, and `demo/demo.css`. Keep the demo static and framework-free. `demo/index.html` must include an import map with `@hamster-note/document-parser` resolving to `https://esm.sh/@hamster-note/document-parser@0.3.1` and `@hamster-note/types` resolving to `https://esm.sh/@hamster-note/types@0.7.0`, then load `./demo.js` as a module. The page must contain a textarea `[data-role="source-input"]`, buttons `[data-action="inspect"]`, `[data-action="encode"]`, `[data-action="decode"]`, a status node `[data-role="status"]`, a summary node `[data-role="summary"]`, a pre block `[data-role="inspection-output"]`, a pre block `[data-role="document-output"]`, and a pre block `[data-role="decode-output"]`. `demo.js` must import `TxtParser` from `../dist/index.js` and `IntermediateDocument` from `@hamster-note/types`; build a `Blob` from textarea content using `text/plain;charset=utf-8`; run inspect on demand; encode to `IntermediateDocument`, serialize it for display, and cache the parsed/encoded document for decode; decode back to UTF-8 text and render it into `[data-role="decode-output"]`. Initial UI state must be `status = 'Idle'`, `summary = 'Enter text, then inspect or encode it.'`, and the decode button disabled until encode succeeds. Set status text to `Inspect complete`, `Encode complete`, and `Decode complete` on the corresponding successful actions. If encode/decode fails, render the thrown message into the status area and keep prior successful output untouched.
  **Must NOT do**: Do not add OCR/image controls, file-upload-only flows, app routers, or any dependency beyond the static server already added in Task 1.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` - Reason: small but real browser UI with deterministic selectors and state transitions
  - Skills: [`frontend-ui-ux`] - ensure the static demo is clean and usable without overbuilding it
  - Omitted: [`playwright`] - implementation task; browser automation belongs to QA execution

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 7 | Blocked By: 1, 2, 3, 4

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `../ImageParser/feature-push-npm/demo/index.html:1-14` - minimal demo entrypoint structure
  - Pattern: `../ImageParser/feature-push-npm/demo/inspect.html:15-99` - static demo layout, import map, and selector conventions to mirror selectively
  - Pattern: `../ImageParser/feature-push-npm/demo/demo.js:28-110` - lazy parser loading and `IntermediateDocument.serialize()` display pattern
  - Pattern: `../ImageParser/feature-push-npm/package.json:5-10` - static `http-server` dev workflow

  **Acceptance Criteria** (agent-executable only):
  - [ ] `npm run build`
  - [ ] `node -e "const fs=require('fs'); for (const file of ['demo/index.html','demo/demo.js','demo/demo.css']) if(!fs.existsSync(file)) throw new Error('missing '+file)"`

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Browser demo inspects, encodes, and decodes fixed sample text
    Tool: Playwright
    Steps: start `npm run dev`; open `http://127.0.0.1:8000/demo/index.html`; fill `[data-role="source-input"]` with `Hello\n你好`; click `[data-action="inspect"]`; confirm `[data-role="inspection-output"]` contains `txt-supported`; click `[data-action="encode"]`; confirm `[data-role="document-output"]` contains `txt-parser-document`; click `[data-action="decode"]`; confirm `[data-role="decode-output"]` exactly equals `Hello\n你好`
    Expected: all three actions succeed, status returns a success state, and decoded output matches the textarea text exactly
    Evidence: .sisyphus/evidence/task-5-demo.png

  Scenario: Decode stays unavailable before encode
    Tool: Playwright
    Steps: start `npm run dev`; open `http://127.0.0.1:8000/demo/index.html`; inspect `[data-action="decode"]` before any encode action
    Expected: decode button is disabled and `[data-role="status"]` still shows `Idle`
    Evidence: .sisyphus/evidence/task-5-disabled.png
  ```

  **Commit**: NO | Message: `n/a` | Files: `demo/index.html`, `demo/demo.js`, `demo/demo.css`

- [x] 6. Replace placeholder coverage with the full `TxtParser` Jest regression matrix

  **What to do**: Delete or fully replace `src/__tests__/index.test.ts` with `src/__tests__/txtParser.test.ts` so the suite reflects real parser behavior instead of workspace initialization. The final test file must cover: public exports, `TxtParser.ext`/`exts`, inspect behavior for `ArrayBuffer`, `Uint8Array`, and `Blob`, successful encode for `'Hello, world!'`, `'你好'`, `''`, and `'Line 1\nLine 2'`, UTF-8 BOM acceptance, invalid UTF-8 rejection using `new Uint8Array([0xC3, 0x28])`, decode success from documents produced by `TxtParser.encode()`, decode success for an empty-text document, and exact no-page decode failure. Use `IntermediateDocument.serialize()` for structure assertions where practical so the test verifies ids, page count, text content, and geometry-related defaults.
  **Must NOT do**: Do not keep the old assertion claiming the package has no parsing capability, and do not snapshot large opaque objects without asserting the specific fields this plan fixes.

  **Recommended Agent Profile**:
  - Category: `quick` - Reason: concentrated Jest coverage expansion in one test file
  - Skills: [] - no special skill required
  - Omitted: [`frontend-ui-ux`] - no UI implementation here

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: final verification only | Blocked By: 1, 2, 3, 4

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `jest.config.cjs:1-23` - active Jest + ts-jest runtime configuration
  - Pattern: `src/__tests__/index.test.ts:1-8` - obsolete placeholder test to replace/remove
  - Pattern: `../ImageParser/feature-push-npm/src/__tests__/imageParser.test.ts:1-57` - Jest import style and module-typed assertions pattern
  - API/Type: external npm d.ts for `@hamster-note/types@0.7.0` - `IntermediateDocument.serialize()` support for deterministic assertions

  **Acceptance Criteria** (agent-executable only):
  - [ ] `npm test -- --runInBand`
  - [ ] `node -e "const fs=require('fs'); if(fs.existsSync('src/__tests__/index.test.ts')) throw new Error('obsolete placeholder test still present')"`

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Full regression suite passes
    Tool: Bash
    Steps: run `npm test -- --runInBand`
    Expected: command exits 0 with passing coverage for inspect, encode, decode, round-trip, and error paths
    Evidence: .sisyphus/evidence/task-6-test.txt

  Scenario: Edge-case tests are present, not implied
    Tool: Bash
    Steps: run `node -e "const fs=require('fs'); const text=fs.readFileSync('src/__tests__/txtParser.test.ts','utf8'); for (const token of ['Hello, world!','你好','0xC3, 0x28','中间文档不包含可解码页面']) if(!text.includes(token)) throw new Error('missing token '+token)"`
    Expected: command exits 0 and the test source explicitly covers the agreed edge cases
    Evidence: .sisyphus/evidence/task-6-cases.txt
  ```

  **Commit**: NO | Message: `n/a` | Files: `src/__tests__/txtParser.test.ts`

- [x] 7. Refresh README for the new runtime, demo, and UTF-8 scope

  **What to do**: Rewrite `README.md` so it no longer claims the package lacks a TXT parsing runtime. Document the exported parser (`TxtParser`, `inspectTxt`), the UTF-8-only scope, the available commands (`npm run typecheck`, `npm test -- --runInBand`, `npm run build`, `npm run dev`), and the demo entrypoint `demo/index.html`. Include one concise code sample showing `const doc = await TxtParser.encode(new TextEncoder().encode('Hello'))` and `const text = new TextDecoder().decode(await TxtParser.decode(doc))`. State explicitly that non-UTF-8 input fails and that this phase does not support other encodings.
  **Must NOT do**: Do not promise unsupported encodings, parser registration automation, or published demo hosting.

  **Recommended Agent Profile**:
  - Category: `writing` - Reason: documentation refresh with precise technical constraints
  - Skills: [] - plain technical writing
  - Omitted: [`git-master`] - no git workflow needed inside the task

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: final verification only | Blocked By: 1, 2, 3, 4, 5

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `README.md:1-21` - current placeholder wording that must be replaced
  - Pattern: `package.json:5-12` - command list that README must mirror accurately
  - Pattern: `demo/index.html` - final demo entrypoint path to document after Task 5

  **Acceptance Criteria** (agent-executable only):
  - [ ] `node -e "const fs=require('fs'); const text=fs.readFileSync('README.md','utf8'); for (const token of ['TxtParser','inspectTxt','UTF-8','npm run dev','demo/index.html']) if(!text.includes(token)) throw new Error('missing '+token); if(text.includes('不包含任何 TXT 解析运行时实现')) throw new Error('stale placeholder wording remains')"`

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: README documents the actual runtime and demo commands
    Tool: Bash
    Steps: run `node -e "const fs=require('fs'); const text=fs.readFileSync('README.md','utf8'); if(!/TxtParser\.encode/.test(text)) throw new Error('missing encode example'); if(!/npm run dev/.test(text)) throw new Error('missing dev command')"`
    Expected: command exits 0 and README contains the real parser usage + demo workflow
    Evidence: .sisyphus/evidence/task-7-readme.txt

  Scenario: README does not over-promise unsupported encodings
    Tool: Bash
    Steps: run `node -e "const fs=require('fs'); const text=fs.readFileSync('README.md','utf8'); if(/Shift-JIS|GBK|UTF-16/i.test(text)) throw new Error('unsupported encoding mentioned as supported')"`
    Expected: command exits 0 with no unsupported-encoding promises in the README
    Evidence: .sisyphus/evidence/task-7-guardrail.txt
  ```

  **Commit**: YES | Message: `feat(txt-parser): add static demo and docs` | Files: `demo/index.html`, `demo/demo.js`, `demo/demo.css`, `README.md`, `src/__tests__/txtParser.test.ts`

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.
- [ ] F1. Plan Compliance Audit — oracle
- [ ] F2. Code Quality Review — unspecified-high
- [ ] F3. Real Manual QA — unspecified-high (+ playwright if UI)
- [ ] F4. Scope Fidelity Check — deep

## Commit Strategy
- Commit after Wave 1: `feat(txt-parser): add UTF-8 parser core`
- Commit after Wave 2: `feat(txt-parser): add static demo and docs`
- If final verification requires fixes, create a follow-up commit instead of amending.

## Success Criteria
- `@hamster-note/txt-parser` exports a real parser API instead of only workspace placeholders.
- `TxtParser.encode()` converts valid UTF-8 parser input into a deterministic `IntermediateDocument`.
- `TxtParser.decode()` converts a valid intermediate document back into UTF-8 bytes and preserves round-trip content for documents produced by `TxtParser.encode()`.
- Invalid UTF-8 bytes and no-page decode input fail with explicit `TxtParser`-prefixed errors.
- The demo page can inspect, encode, serialize, decode, and render the decoded text without any manual code edits.
