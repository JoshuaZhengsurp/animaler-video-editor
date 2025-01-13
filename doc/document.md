# animaler-video-editor（一期）

> 项目简介：一款跨平台，开源的视频剪辑器。并支持多个操作系统平台。目标是能够应付视频剪辑场景中的大多数基本需求。

### 技术栈

1. 前端模块：electron+vite/react，scss，tailwind（使用electron-vite-react模板），electron-builder
2. 视频解码：wasm，ffmpeg，C/C++
3. 工程规范：husky，，，

### MVP

1. 剪辑器初始页
2. 剪辑器剪辑页
3. 视频处理模块
    1. 视频剪辑、合并模块
    2. 视频滤镜滤波
    3. 音频音轨处理
    4. 视频字幕特效添加
    5. 视频画质模块修复（可选）
    6. 视频导出
    7. 对各个格式支持情况
4. 性能优化模块（可能需要针对性的对某个解遍码计算优化）

### 项目架构

![alt text](image.png)

### 参考竞品

Cicploy
