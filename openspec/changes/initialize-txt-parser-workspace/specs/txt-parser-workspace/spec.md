## ADDED Requirements

### Requirement: TxtParser 工作区工程基线
系统 MUST 为 `TxtParser` 仓库提供一套可独立维护的 TypeScript 包工程基线，并与 `../HtmlParser` 的基础工程约定保持一致，但不得引入任何 HTML 解析语义或实现。

#### Scenario: 初始化工程基线文件
- **WHEN** 在当前仓库执行工作区初始化
- **THEN** 仓库中必须生成本地工程基线文件与目录结构，以支持后续开发、构建、测试和发布准备

#### Scenario: 排除 HTML 领域实现
- **WHEN** 从 `../HtmlParser` 参考工程复制初始化内容
- **THEN** 只允许复制工程基础设施相关内容，不得引入 HTML 解析逻辑、HTML 语义文案或 HTML 专属行为

### Requirement: TxtParser 包身份一致性
系统 MUST 将当前工作区的所有对外身份统一定义为 `TxtParser` 与 `@hamster-note/txt-parser`，不得残留 `HtmlParser`、`html-parser` 或其他 HTML 解析相关身份信息。

#### Scenario: 包元数据使用 TxtParser 身份
- **WHEN** 初始化或更新包元数据、入口声明与发布信息
- **THEN** 所有名称、描述、产物声明与相关标识都必须指向 `TxtParser` 与 `@hamster-note/txt-parser`

#### Scenario: 文档与配置同步身份替换
- **WHEN** 初始化 README、构建配置、测试配置与发布辅助文件
- **THEN** 文档、脚本、输出路径和说明文本中不得出现遗留的 HtmlParser 命名或 HTML 解析语义

### Requirement: 最小可验证开发链路
系统 MUST 为 `TxtParser` 提供最小可验证的源码入口、脚本约定和工具链配置，使工作区完成依赖安装后能够执行类型检查、构建和测试链路验证。

#### Scenario: 提供最小源码入口
- **WHEN** 初始化后的工作区准备进行首次构建
- **THEN** 仓库必须包含可被构建工具识别的最小源码入口，且该入口不对未实现的 TXT 解析能力做出承诺

#### Scenario: 提供标准开发脚本
- **WHEN** 开发者查看或执行工作区脚本约定
- **THEN** 工作区必须提供用于安装后验证、类型检查、构建和测试的标准脚本或等效命令入口

### Requirement: 工作区本地独立性
系统 MUST 将所有初始化后的工程配置和入口文件保存在 `TxtParser` 仓库本地，不得通过软链接、`yarn link`、跨仓库相对路径配置继承或其他外部运行时依赖来维持工程可用性。

#### Scenario: 本地保存工程配置
- **WHEN** 初始化工程配置与发布准备文件
- **THEN** 所有工作区运行所需的关键配置必须存在于当前仓库内，并可在脱离 `../HtmlParser` 的情况下独立使用

#### Scenario: 禁止依赖外部链接基线
- **WHEN** 验证初始化后的工作区独立性
- **THEN** 工作区不得要求开发者额外建立 `yarn link`、软链接或引用外部仓库配置文件才能完成本地开发链路
