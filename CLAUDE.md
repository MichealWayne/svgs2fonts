# CLAUDE.md

## 项目规范

### 技术栈
- TypeScript 4.0+，Node.js 12.0+
- 构建：tsc → dist/
- 测试：Jest + ts-jest
- 代码质量：ESLint + Prettier + Husky

### 核心模块  
- `src/builders/`：SVGBuilder → FontsBuilder → DemoBuilder
- `src/lib/`：工具函数和配置管理
- `src/core/`：核心功能模块（性能跟踪、进度监控等）
- `src/config/`：配置管理和向后兼容性
- `src/optimizers/`：字体优化器（WOFF2、Unicode、字体子集等）
- `src/processors/`：处理器（单目录、批处理模式）
- CLI: `bin/index.js`，模块: `dist/index.js`

### 关键命令
```bash
npm run build     # tsc编译
npm test          # jest测试  
npm run test:example  # 示例测试
```

### 配置约定
- 入口：src/index.ts
- 类型：src/types/
- 测试：__tests__/
- 输出：dist/
- 示例：examples/{svg,dest}/

### 开发规范
- 严格TypeScript模式
- 使用Promise/async-await
- 错误处理优先返回Error对象
- 性能分析支持可选启用
- 提交前自动格式化和检查

### 版本信息
- 当前版本：2.1.1
- 最新更新：2024.12.09
- 主要特性：清理冗余代码，移除未使用的ErrorReporter模块，优化日志输出