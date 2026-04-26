## 1. Parser Runtime

- [x] 1.1 对齐包依赖、构建配置与 demo 服务脚本
- [x] 1.2 建立 `TxtParser` 公共 API 合约并保留兼容导出
- [x] 1.3 实现 UTF-8 输入检查与输入类型识别

## 2. Encoding / Decoding

- [x] 2.1 将有效 UTF-8 内容编码为确定性的 `IntermediateDocument`
- [x] 2.2 将中间文档按页顺序解码回 UTF-8 `ArrayBuffer`
- [x] 2.3 为非法 UTF-8 与无页面文档提供明确失败语义

## 3. Demo / Docs / Tests

- [x] 3.1 提供基于 import map 的静态浏览器 demo
- [x] 3.2 建立覆盖 inspect、encode、decode、round-trip 与失败路径的 Jest 回归测试
- [x] 3.3 更新 README 以反映 UTF-8-only 范围、命令与 demo 用法

## 4. Verification Archive

- [x] 4.1 归档构建、导出、编码、解码、demo 与测试证据
- [x] 4.2 归档原始 `.sisyphus` 计划、便签和任务会话索引
