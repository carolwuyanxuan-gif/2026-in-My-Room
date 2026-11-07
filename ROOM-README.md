# 这一年住在这里

双击 `standalone/index.html` 即可打开完整三维房间，无需联网、安装依赖或启动服务器。浏览器需支持 WebGL。

左键旋转，滚轮缩放，右键或中键平移。点击相框或电脑聚焦，点击空白处、关闭或 Esc 返回。电脑卡片的左右按钮同步改变三维屏幕。顶部可切换温馨夜景、蓝调夜景和白天。

## 修改

- `src/three/room-prototype.ts`：真实模型、灯光、轻轨和镜头。`slides` / `paintScreen` 是电脑占位内容；`createFrames` 定义画框。
- `src/RoomPrototype.tsx`：按钮和占位文字。
- `src/styles/prototype.css`：界面。
- `node scripts/build-standalone.mjs`：重新生成独立 HTML。

目前使用程序生成的占位屏幕图案和城市模型，无外部图片请求。照片文字尚待替换。保留参考项目的 MIT 许可，原参考目录不变。
