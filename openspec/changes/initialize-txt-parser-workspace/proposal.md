## Why

当前 `TxtParser` 工作区需要具备与 `../HtmlParser` 一致的工程基础，才能作为 HamsterNote 解析器包独立开发、构建和发布。现在先完成工作区初始化，可以为后续 Txt 解析能力实现提供稳定的包结构、配置和版本管理基础。

## What Changes

- 参考 `../HtmlParser` 复制基础工程文件、配置文件、脚本约定和 Git 忽略规则到当前 `TxtParser` 工作区。
- 将项目身份从 HtmlParser 调整为 TxtParser，包括包名改为 `@hamster-note/txt-parser`，并同步相关 README、入口、构建配置和发布元数据中的命名差异。
- 保留 HtmlParser 已有的工程约定，但不引入 HTML 解析语义；当前变更只建立 TxtParser 的包工程基线。
- 确保初始化后的工作区可用于后续开发流程，包括依赖安装、类型检查、构建和包发布准备。

## Capabilities

### New Capabilities

- `txt-parser-workspace`: 定义 TxtParser 包工程的初始化要求，包括项目身份、工程配置、忽略规则、脚本入口和与 HtmlParser 的基础结构对齐。

### Modified Capabilities

无。

## Impact

- 影响当前仓库根目录的工程配置、包元数据、构建/类型配置、文档和 Git 忽略规则。
- 可能新增或调整 `package.json`、源码入口、README、配置文件、锁文件相关约定和发布辅助文件。
- 不改变现有 OpenSpec 主规格；本仓库当前没有可修改的既有 capability。
