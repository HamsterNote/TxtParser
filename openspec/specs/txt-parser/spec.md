# Txt Parser Specification

## Purpose

定义 `@hamster-note/txt-parser` 当前已交付的 TXT 解析能力，包括 UTF-8 检查、编码、解码与静态演示页面约束。

### Requirement: UTF-8 TXT Inspection

系统 MUST 提供不会修改输入内容的 TXT 检查能力，并明确声明当前仅支持 UTF-8 TXT。

#### Scenario: Inspect array-buffer-like input
- **GIVEN** 调用方向 `TxtParser.inspect()` 或 `inspectTxt()` 传入 `ArrayBuffer` 或 `ArrayBufferView`
- **WHEN** 检查输入内容
- **THEN** 返回结果必须包含 `status: 'txt-supported'`
- **AND** 返回结果必须声明 `supportedExtensions: ['txt']`
- **AND** 返回结果必须标记对应输入种类与字节长度
- **AND** 返回结果必须使用默认 `mimeType` `text/plain`

#### Scenario: Inspect blob input
- **GIVEN** 调用方向 `TxtParser.inspect()` 或 `inspectTxt()` 传入 `Blob`
- **WHEN** `Blob.type` 非空
- **THEN** 返回结果必须保留该 `mimeType`
- **AND** 返回结果必须保持输入内容不变

### Requirement: Deterministic UTF-8 Encoding

系统 MUST 将有效 UTF-8 TXT 输入编码为结构确定的 `IntermediateDocument`。

#### Scenario: Encode valid UTF-8 bytes
- **GIVEN** 调用方传入有效 UTF-8 TXT 二进制内容
- **WHEN** 执行 `TxtParser.encode()`
- **THEN** 必须返回仅包含一个页面、一个段落和一个文本块的 `IntermediateDocument`
- **AND** 文档、页面、段落和文本节点必须使用稳定的固定 ID
- **AND** 文本内容必须与 UTF-8 解码结果完全一致
- **AND** 页面宽高必须由文本行数与最长行长度确定

#### Scenario: Reject invalid UTF-8 bytes during encode
- **GIVEN** 调用方传入不是有效 UTF-8 的字节序列
- **WHEN** 执行 `TxtParser.encode()`
- **THEN** 必须抛出以 `TxtParser 编码失败：` 开头的错误

### Requirement: Deterministic UTF-8 Decoding

系统 MUST 将中间文档按页面与文本顺序还原为 UTF-8 字节内容。

#### Scenario: Decode encoded document
- **GIVEN** 调用方传入包含可读文本的 `IntermediateDocument`
- **WHEN** 执行 `TxtParser.decode()`
- **THEN** 必须按页面顺序拼接文本内容
- **AND** 同一页面内不得插入额外分隔符
- **AND** 有内容的页面之间必须以单个换行符连接
- **AND** 返回值必须是 UTF-8 `ArrayBuffer`

#### Scenario: Reject page-less document
- **GIVEN** 调用方传入不包含页面的 `IntermediateDocument`
- **WHEN** 执行 `TxtParser.decode()`
- **THEN** 必须抛出 `TxtParser 解码失败：中间文档不包含可解码页面`

### Requirement: Static Browser Demo

系统 MUST 提供一个无需框架的静态浏览器演示页面，用于检查、编码和解码 TXT 内容。

#### Scenario: Run demo workflow in browser
- **GIVEN** 开发者启动本地静态服务并打开 `demo/index.html`
- **WHEN** 在文本框输入 UTF-8 文本并依次执行 inspect、encode、decode
- **THEN** 页面必须展示检查结果、中间文档序列化结果和解码后的文本
- **AND** 状态文本必须分别反映 `Inspect complete`、`Encode complete` 和 `Decode complete`

#### Scenario: Prevent decode before encode
- **GIVEN** 演示页面首次加载完成
- **WHEN** 用户尚未成功执行 encode
- **THEN** decode 按钮必须保持禁用
