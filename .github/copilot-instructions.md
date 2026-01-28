本仓库已经设置好了远程vercel自动构建，只需要推送到github即可自动构建。 
这是个人项目，直接在生产环境(master/main分支)调试即可，自动构建网站是lofi.tokisaki.top，大概推送后30s就可以访问进行测试。

## Copilot Agent 运行环境说明
本地开发服务器默认运行在 `http://localhost:5173`。在执行涉及 UI 的任务时，你可以编写并运行 Playwright 脚本来截屏或检查 DOM 状态。
 - **预装工具**：
    - `jq` (JSON 处理)
    - `xvfb` (虚拟显示)
    - `tree` (查看目录结构)
    - `ripgrep` (高性能文本搜索)
    - **Playwright (Chromium)**：优先用于验证渲染、执行 E2E 测试或查看动态内容。
 - **代码校验与格式化**：
    - 环境已通过 `tsc` 类型检查和 `eslint` 代码检查。
    - **Prettier**：在提交或运行测试前，可以使用 `npx prettier --write .` 修复格式。
 - **构建与测试验证**：
    - 在完成功能开发后，运行 `npx tsc -b` 和 `npm run lint`。
    - **Vitest**：若需要单元测试请使用 `npx vitest` 或 `npm test`。

## 示例Live2D模型
如果测试Live2D模型，请使用`https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/haru/haru_greeter_t03.model3.json`
