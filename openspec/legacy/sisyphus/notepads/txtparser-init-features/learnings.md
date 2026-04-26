## 2026-04-26
- `TxtParser.encode` should decode with `TextDecoder('utf-8', { fatal: true })` for deterministic UTF-8 validation.
- Build deterministic `IntermediateDocument` IDs (`txt-parser-document`, `txt-parser-page-1`, `txt-parser-paragraph-1`, `txt-parser-text-1`) for stable QA expectations.
- Width/height metrics are derived from decoded content lines without line-ending normalization.
- `TxtParser.decode` should iterate `intermediateDocument.pages`, concatenate each page's `text.content` in page order, and join page content with `\n`.
- Decode must treat zero-page documents as explicit error `TxtParser 解码失败：中间文档不包含可解码页面` and preserve that message through catch handling.
