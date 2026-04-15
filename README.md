# @hamster-note/txt-parser

`@hamster-note/txt-parser` 当前只提供 TxtParser 工作区初始化后的工程基线，用于后续逐步补齐 TXT 解析能力。

## 当前范围

- 提供独立可维护的 TypeScript 包结构
- 提供 `build`、`typecheck`、`test` 标准脚本
- 提供最小源码入口与基础测试链路
- 不包含任何 TXT 解析运行时实现

## 开发命令

```bash
yarn install
yarn typecheck
yarn test
yarn build
```

## 后续待补

- 定义 TXT 解析领域模型与对外 API
- 补充真实解析实现与场景测试
- 结合业务需求扩展发布内容与文档示例
