本仓库已经设置好了远程vercel自动构建，只需要推送到github即可自动构建。 
这是个人项目，直接在生产环境(master/main分支)调试即可，自动构建网站是lofi.tokisaki.top，大概推送后30s就可以访问进行测试。

### Copilot Agent 运行环境说明
- 已预装 **Playwright (Chromium)**。
- 如果需要验证渲染、执行 E2E 测试或查看动态内容，请优先使用 Playwright 而不是 `curl`。
- 本地开发服务器默认运行在 `http://localhost:5173`。
- 在执行涉及 UI 的任务时，你可以编写并运行 Playwright 脚本来截屏或检查 DOM 状态。
