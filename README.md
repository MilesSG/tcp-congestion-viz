# 🌐 TCP拥塞控制可视化系统

这是一个基于 Three.js 和 Vue 3 的 TCP 拥塞控制可视化系统，用于直观展示 TCP 协议中的拥塞控制与流量管理过程。通过 3D 动画效果，让您更好地理解 TCP 的工作原理！

## 📸 效果展示

![TCP拥塞控制可视化系统运行截图](src/img/screenshot.png)

## ✨ 功能特点

- 🎮 交互式 3D 场景展示
  - 可自由旋转和缩放的视角
  - 发送方和接收方节点的实时状态显示
  - 优雅的数据包传输动画效果

- 📊 TCP 拥塞控制算法可视化
  - 慢启动（Slow Start）阶段
  - 拥塞避免（Congestion Avoidance）阶段
  - 快速恢复（Fast Recovery）阶段
  - 实时显示拥塞窗口（cwnd）变化
  - 动态调整慢启动阈值（ssthresh）

- 🎯 网络状况模拟
  - 可调节的丢包率
  - 数据包丢失的视觉反馈
  - 自动重传机制展示

- 📈 实时统计信息
  - 已发送数据包数量
  - 成功接收的数据包数量
  - 丢失的数据包数量
  - 重传的数据包数量

## 🛠️ 技术栈

- ⚡ Vue 3 + TypeScript - 现代化的前端框架
- 🎨 Three.js - 强大的 3D 图形库
- 🎭 Tween.js - 平滑的动画效果
- 📊 Stats.js - 性能监控
- 🎛️ dat.GUI - 交互式控制面板

## 🚀 快速开始

1. 克隆项目
```bash
git clone https://github.com/MilesSG/tcp-congestion-viz.git
cd tcp-congestion-viz
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 构建生产版本
```bash
npm run build
```

## 💡 使用指南

1. 界面说明
   - 左侧面板：显示 TCP 窗口信息和传输统计
   - 右侧面板：参数调整控制器
   - 中央区域：3D 可视化场景
   - 底部按钮：控制模拟过程

2. 操作方法
   - 鼠标左键：旋转场景
   - 鼠标滚轮：缩放场景
   - 右侧控制面板：调整模拟参数
     - 拥塞窗口大小
     - 慢启动阈值
     - 丢包率

3. 动画说明
   - 🟢 绿色球体：正在传输的数据包
   - 🔵 蓝色球体：成功接收的数据包
   - 🔴 红色球体：丢失的数据包
   - 🟡 黄色球体：确认包（ACK）
   - 发光效果：表示数据包的活跃状态

## 📁 项目结构

```
src/
  ├── components/          # Vue组件
  │   ├── TCPScene.vue    # Three.js场景组件
  │   └── WindowDisplay.vue # 状态显示面板组件
  ├── core/               # 核心逻辑
  │   └── TCPController.ts # TCP控制器
  ├── App.vue            # 主应用组件
  └── main.ts            # 入口文件
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！您的每一个建议都是对项目的宝贵贡献。

## 📄 许可证

MIT

## 🔗 相关链接

- [Vue 3 文档](https://vuejs.org/)
- [Three.js 文档](https://threejs.org/)
- [TCP 拥塞控制 - 维基百科](https://en.wikipedia.org/wiki/TCP_congestion_control) 