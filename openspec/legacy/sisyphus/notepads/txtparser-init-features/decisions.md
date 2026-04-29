## 2026-04-26
- Kept a single `IntermediateText` node containing full decoded content to satisfy deterministic structure requirements.
- Used fixed layout metadata (`TextDir.LTR`, monospace defaults, unit metrics) and deterministic polygon/page sizing from line metrics.
- On decode failure or input conversion failure, throw unified error prefix: `TxtParser 编码失败：输入不是有效的 UTF-8 TXT 数据`.
- Implemented decode as content-based reconstruction only (via `getTexts()` + `text.content`), explicitly ignoring layout/geometry fields.
- Chosen byte serialization path for decode output is `new TextEncoder().encode(content).buffer` (UTF-8, no BOM).
