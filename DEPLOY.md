# 上传 GitHub 和部署 Vercel

此目录是网站项目根目录。将这里的项目文件上传到 GitHub，再在 Vercel 导入该仓库。Vercel 的项目根目录设为仓库根目录。`vercel.json` 已设置构建命令 `npm run build:web`，发布目录 `dist-web`。

## 上传前检查

1. 本地安装 Node.js 22 或更新版本，运行 `npm ci`。
2. 运行 `npm run check` 和 `npm run build:web`。
3. 打开本地构建目录 `dist-web` 进行检查。请用本地静态服务器预览，尤其核对画册、照片、字体和模型。
4. 提交源码、`package-lock.json` 和 `.optimized-assets`。`.gitignore` 会排除体积很大的原始图片、生成目录和本地音乐。原始图片仍保留在本机，方便日后编辑。
5. 仓库设为私有或公开由你决定。若设为公开，先检查照片、文字和模型是否适合公开。

线上构建从 `.optimized-assets` 读取压缩图片。每次在本机替换原图后，先运行 `./scripts/optimize-images.ps1`，再提交更新后的压缩文件。Vercel 的 Linux 构建环境无需运行这个 PowerShell 脚本。

网站部署成功后，在 Vercel 项目设置里添加域名，再按 Vercel 显示的 DNS 记录到阿里云域名控制台设置解析。域名生效后用手机网络检查首页及各项互动。

线上构建隐藏“编辑物件”入口。本地开发版仍可调整物件布局。
