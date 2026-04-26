## Why

`.sisyphus` 中记录的 `txtparser-init-features` 计划已经完成，但仓库内还缺少与之对应的标准 OpenSpec 变更记录与落地规格。将其转换到 `openspec/` 可以把一次性的执行计划沉淀为可追踪、可复用、可归档的规范资产。

## What Changes

- 将 `.sisyphus/plans/txtparser-init-features.md` 转换为 OpenSpec 变更提案、任务清单与规格增量。
- 将 `.sisyphus/notepads/...` 中的决策、经验和问题记录整理为设计说明。
- 将 `.sisyphus/evidence/` 与 `boulder.json` 保留为历史归档材料，迁移到 `openspec/legacy/sisyphus/`。
- 将已经完成的 TXT 解析能力沉淀为正式规格 `openspec/specs/txt-parser/spec.md`。

## Scope

- 本次迁移只整理现有成果，不重新实现功能。
- 本次迁移不修改已交付的解析逻辑、测试逻辑或 demo 行为。
- 本次迁移保留 `.sisyphus` 原始内容的可追溯副本。

## Impact

- 新增一份正式的 `txt-parser` 规格，便于后续在 OpenSpec 流程下继续演进。
- 新增一份已归档的历史变更包，保留从计划到结果的上下文。
- 新增 `openspec/legacy/sisyphus/` 作为旧流程资料归档区，避免证据与决策丢失。
