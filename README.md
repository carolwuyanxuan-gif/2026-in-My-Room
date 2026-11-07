# 这一年住在这里

一间可以探索的 3D 记忆房间。观众可以翻看照片和画册、阅读书与信、切换昼夜，并发现藏在房间里的互动和彩蛋。

## 本地使用

安装 Node.js 22 或更新版本，然后运行 `npm ci` 和 `npm run dev`。本地的原始照片保存在 `src/assets`，用于继续编辑。`standalone/index.html` 是此前生成的离线版本。

## 上线构建

运行 `npm run check` 和 `npm run build:web`。网页输出在 `dist-web`。构建使用 `.optimized-assets` 中的压缩图，图片作为独立文件按需读取。线上版本隐藏物件编辑入口。

GitHub 与 Vercel 的操作步骤见 [DEPLOY.md](DEPLOY.md)。
