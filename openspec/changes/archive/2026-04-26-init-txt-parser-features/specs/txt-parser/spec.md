## ADDED Requirements

### Requirement: UTF-8 TXT Inspection
系统 MUST 提供不会修改输入内容的 TXT 检查能力，并明确声明当前仅支持 UTF-8 TXT。

#### Scenario: Inspect array-buffer-like input
- **GIVEN** 调用方向 `TxtParser.inspect()` 或 `inspectTxt()` 传入 `ArrayBuffer` 或 `ArrayBufferView`
- **WHEN** 检查输入内容
- **THEN** 返回结果必须包含 `status: 'txt-supported'`
- **AND** 返回结果必须声明 `supportedExtensions: ['txt']`
- **AND** 返回结果必须标记对应输入种类与字节长度

#### Scenario: Inspect blob input
- **GIVEN** 调用方向 `TxtParser.inspect()` 或 `inspectTxt()` 传入 `Blob`
- **WHEN** `Blob.type` 非空
- **THEN** 返回结果必须保留该 `mimeType`

### Requirement: Deterministic UTF-8 Encoding
系统 MUST 将有效 UTF-8 TXT 输入编码为结构确定的 `IntermediateDocument`。

#### Scenario: Encode valid UTF-8 bytes
- **GIVEN** 调用方传入有效 UTF-8 TXT 二进制内容
- **WHEN** 执行 `TxtParser.encode()`
- **THEN** 必须返回仅包含一个页面、一个段落和一个文本块的 `IntermediateDocument`
- **AND** 文档结构必须使用稳定固定 ID

#### Scenario: Reject invalid UTF-8 bytes during encode
- **GIVEN** 调用方传入不是有效 UTF-8 的字节序列
- **WHEN** 执行 `TxtParser.encode()`
- **THEN** 必须抛出以 `TxtParser 编码失败：` 开头的错误

### Requirement: Deterministic UTF-8 Decoding
系统 MUST 将中间文档按页面与文本顺序还原为 UTF-8 字节内容。

#### Scenario: Decode encoded document
- **GIVEN** 调用方传入包含可读文本的 `IntermediateDocument`
- **WHEN** 执行 `TxtParser.decode()`
- **THEN** 必须按页面与文本顺序恢复 UTF-8 内容

#### Scenario: Reject page-less document
- **GIVEN** 调用方传入不包含页面的 `IntermediateDocument`
- **WHEN** 执行 `TxtParser.decode()`
- **THEN** 必须抛出 `TxtParser 解码失败：中间文档不包含可解码页面`

### Requirement: Static Browser Demo
系统 MUST 提供一个无需框架的静态浏览器演示页面，用于检查、编码和解码 TXT 内容。

#### Scenario: Run demo workflow in browser
- **GIVEN** 开发者打开 `demo/index.html`
- **WHEN** 用户输入 UTF-8 文本并执行 inspect、encode、decode
- **THEN** 页面必须展示检查结果、中间文档与解码文本
