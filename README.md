# Live2D study: 与你共度的放松时光

仿照steam游戏 [Chill With You: Lo-Fi Story](https://store.steampowered.com/app/2267800/Chill_With_You_LoFi_Story/) 制作的网页版项目，支持Live2D。

## 功能
 - 番茄钟计时
 - 加载Live2D模型（支持zip格式的模型包）
 - 支持基本的动作切换（idle、focus、sleep、tap）
 - 可调节模型位置、大小、不透明度
 - 设置会保存在本地存储中

## 使用方法
 1. 克隆仓库并安装依赖：
    ```bash
    git clone
    cd live2d-study
    npm install
    ```
 2. 运行开发服务器：
    ```bash
    npm run dev
    ```
 3. 在浏览器中打开 `http://localhost:5173` 查看应用。
 4. （可选）在设置中上传Live2D模型包（zip格式），调整相关参数。
