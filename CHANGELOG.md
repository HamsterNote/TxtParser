# 变更日志

所有对这个项目的重大更改都将记录在此文件。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
本项目遵循 [语义化版本控制](https://semver.org/lang/zh-CN/)。

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