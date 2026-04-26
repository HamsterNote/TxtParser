## Context

原始 `.sisyphus` 计划定义了 `TxtParser` 的完整交付范围：公共 API、UTF-8 编解码、中间文档结构、静态 demo、测试矩阵与 README。实现已经完成，但这些信息仍散落在计划、便签和证据文件中。

本设计文档的作用是把这些分散信息压缩成 OpenSpec 可维护的设计记录，并解释为什么最终规格按当前形式收敛。

## Decisions

### 1. 规格以“已完成能力”而非“执行步骤”组织

`.sisyphus` 的主文档以执行波次、任务依赖和验收命令组织，适合实施期，不适合作为长期规格。迁移时改为按能力拆分：检查、编码、解码、demo。

### 2. 保持 UTF-8-only 边界

迁移后的规格继续明确当前只支持 UTF-8。`TxtParser.encode()` 使用 `TextDecoder('utf-8', { fatal: true })` 验证输入，失败时统一抛出 `TxtParser 编码失败：...`。这条约束来自原计划和实现，不在迁移时放宽。

### 3. 保持中间文档的确定性结构

规格保留固定 ID、单页/单段落/单文本节点以及确定性几何字段约束。这样既符合已实现行为，也保留了测试与 demo 依赖的稳定结构。

### 4. 解码继续基于文本内容而非布局信息

`TxtParser.decode()` 继续只读取 `pages` 和 `text.content`，按页顺序组合内容，不依赖段落或几何信息。这与原始决策记录一致，避免中间文档布局差异影响可逆性。

### 5. 旧流程资料作为 legacy 归档保存

OpenSpec 本身不为 `evidence/`、`boulder.json` 这类执行痕迹提供标准位置，因此迁移时把原始材料收纳到 `openspec/legacy/sisyphus/`，既不污染活动规格，也保留追溯链。

## Source Mapping

- `plans/txtparser-init-features.md` → `proposal.md`、`tasks.md`、归档 change spec
- `notepads/.../decisions.md` → 决策章节
- `notepads/.../learnings.md` → 设计约束与实现依据
- `notepads/.../issues.md`、`problems.md` → 风险与问题状态
- `evidence/*.txt`、`boulder.json` → `openspec/legacy/sisyphus/`
