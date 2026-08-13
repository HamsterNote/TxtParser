# 变更日志

所有对这个项目的重大更改都将记录在此文件。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
本项目遵循 [语义化版本控制](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### 变更

- `TxtParser.encode` 现在会将多行 TXT 按行拆分为多个 `IntermediateText` 和 `IntermediateParagraph`，而不是把包含换行符的内容保存在单个文本对象中。

### 修复

- 增加 `TxtParser.decode` 在页面缺少 paragraph 数据时的 legacy 拼接行为测试覆盖。
- 修正浏览器 demo 的 paragraph 摘要统计，现在会统计所有页面的 paragraph 数量。
- 统一浏览器 demo 的 Document Output 与 Paragraphs 面板数据来源，二者都基于同一份序列化文档。

## [0.2.0] - 2026-06-01

### 变更

- 升级 `@hamster-note/types` 到 0.8.0，采用 `getContent()` API 替代 `getTexts()`
- 开发服务器端口从 8000 更新为 8166

### 新增

- 移动端调试工具 vconsole，开发环境自动启用
- 导出 `isIntermediateTextContent` 类型守卫函数
- 混合内容（文本+图像）解码测试用例

### 重构

- 消除 `isIntermediateTextContent` 函数的重复定义，统一从主模块导入

## [0.1.0] - 2026-04-29

### 新增

- `TxtParser` 类，继承自 `DocumentParser`，用于 UTF-8 TXT 文件解析
- `TxtParser.encode(input)` 方法，将 UTF-8 字节转换为 `IntermediateDocument`
- `TxtParser.decode(document)` 方法，从 `IntermediateDocument` 重建 UTF-8 字节
- `TxtParser.inspect(input)` 方法，用于在不修改输入的情况下检查 TXT 内容
- `inspectTxt(input)` 独立导出函数
- 编码时自动剥离 UTF-8 BOM（字节顺序标记）
- 确定性的编码/解码，ID 稳定
- 浏览器交互式演示 `demo/index.html`
- 完整的往返编码/解码测试套件
- ESLint 和 Prettier 代码质量配置
- 基于 Rolldown 的 TypeScript 构建配置

### 变更

- 包名：`@hamster-note/txt-parser`
- 构建工具迁移至 Rolldown，使用 `rolldown-plugin-dts`
- TypeScript 配置拆分为构建和测试两个变体

### 修复

- 无效的 UTF-8 输入抛出描述性错误：`TxtParser 编码失败：输入不是有效的 UTF-8 TXT 数据`
- 解码时无页面抛出：`TxtParser 解码失败：中间文档不包含可解码页面`
