# @hamster-note/txt-parser

`@hamster-note/txt-parser` provides a UTF-8 text parser for the HamsterNote ecosystem, converting raw TXT data into structured intermediate documents and back.

## Features

- **TxtParser** — A `DocumentParser` subclass for UTF-8 TXT files
- **inspectTxt** — Inspect TXT input without modifying it
- **Deterministic encoding** — Convert UTF-8 bytes into `IntermediateDocument` with stable IDs
- **Deterministic decoding** — Reconstruct UTF-8 bytes from `IntermediateDocument`
- **UTF-8 only** — Non-UTF-8 input will fail with explicit error messages

## Scope

This package only supports **UTF-8** encoding. Other encodings are not supported in this phase.

## Installation

```bash
yarn install
```

## Development Commands

```bash
yarn typecheck          # Type-check the codebase
yarn test -- --runInBand # Run Jest tests
yarn build              # Build the package
yarn dev                # Start demo server on port 8000
npm run dev             # Alternative: start demo server
```

## Usage

```typescript
import { TxtParser } from '@hamster-note/txt-parser'

// Encode UTF-8 text into an IntermediateDocument
const doc = await TxtParser.encode(new TextEncoder().encode('Hello'))

// Decode back to UTF-8 bytes
const bytes = await TxtParser.decode(doc)
const text = new TextDecoder('utf-8').decode(bytes)

// Inspect input without modifying it
import { inspectTxt } from '@hamster-note/txt-parser'
const info = await inspectTxt(new Blob(['Hello'], { type: 'text/plain' }))
```

## Demo

A static browser demo is available at `demo/index.html`. Start the demo server:

```bash
yarn dev
```

Then open `http://localhost:8000/demo/index.html` in your browser.

## API

### `TxtParser`

Extends `DocumentParser` from `@hamster-note/document-parser`.

- `TxtParser.ext` → `'txt'`
- `TxtParser.exts` → `['txt']`
- `TxtParser.encode(input)` → Encode UTF-8 bytes into `IntermediateDocument`
- `TxtParser.decode(document)` → Decode `IntermediateDocument` back to UTF-8 bytes
- `TxtParser.inspect(input)` → Inspect input and return metadata

### `inspectTxt(input)`

Standalone export that delegates to `TxtParser.inspect(input)`.

## Error Handling

- Invalid UTF-8 input during encode: throws `TxtParser 编码失败：输入不是有效的 UTF-8 TXT 数据`
- Decode with no pages: throws `TxtParser 解码失败：中间文档不包含可解码页面`

## License

MIT
