<template>
  <div ref="container" class="scene-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'dat.gui';
import Stats from 'stats.js';
import TWEEN from '@tweenjs/tween.js';
import { TCPController } from '../core/TCPController';

// 定义事件
const emit = defineEmits<{
  (e: 'packet-sent'): void;
  (e: 'packet-received'): void;
  (e: 'packet-lost'): void;
  (e: 'packet-retransmitted'): void;
  (e: 'status-changed', status: string): void;
}>();

// 场景参数
const container = ref<HTMLElement | null>(null);
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let stats: Stats;
let gui: GUI;
let tcpController: TCPController;

// TCP相关参数
const tcpParams = {
  congestionWindow: 1,
  threshold: 16,
  packetSize: 1,
  transmissionRate: 1,
  packetLossRate: 0.1,
};

// 初始化场景
const initScene = () => {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a1a);

  // 设置相机
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 8, 15);
  camera.lookAt(0, 0, 0);

  // 设置渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.value?.appendChild(renderer.domElement);

  // 添加控制器
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 5;
  controls.maxDistance = 50;
  controls.maxPolarAngle = Math.PI / 2;

  // 添加性能监控
  stats = new Stats();
  container.value?.appendChild(stats.dom);

  // 添加GUI控制面板
  gui = new GUI();
  const tcpFolder = gui.addFolder('TCP Parameters');
  tcpFolder.add(tcpParams, 'congestionWindow', 1, 32).name('Congestion Window')
    .onChange((value: number) => {
      if (tcpController) {
        tcpController.setParameters({ congestionWindow: value });
      }
    });
  tcpFolder.add(tcpParams, 'threshold', 1, 32).name('Threshold')
    .onChange((value: number) => {
      if (tcpController) {
        tcpController.setParameters({ threshold: value });
      }
    });
  tcpFolder.add(tcpParams, 'packetLossRate', 0, 1).name('Packet Loss Rate')
    .onChange((value: number) => {
      if (tcpController) {
        tcpController.setParameters({ packetLossRate: value });
      }
    });
  tcpFolder.open();

  // 添加光源
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  // 添加网格
  const gridHelper = new THREE.GridHelper(20, 20);
  scene.add(gridHelper);

  // 创建网络拓扑
  createNetworkTopology();
};

// 创建网络拓扑
const createNetworkTopology = () => {
  // 创建发送方节点
  const senderGeometry = new THREE.BoxGeometry(1, 1, 1);
  const senderMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
  const sender = new THREE.Mesh(senderGeometry, senderMaterial);
  sender.position.set(-5, 0.5, 0);
  scene.add(sender);

  // 创建接收方节点
  const receiverGeometry = new THREE.BoxGeometry(1, 1, 1);
  const receiverMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff });
  const receiver = new THREE.Mesh(receiverGeometry, receiverMaterial);
  receiver.position.set(5, 0.5, 0);
  scene.add(receiver);

  // 创建连接线
  const points = [];
  points.push(new THREE.Vector3(-5, 0.5, 0));
  points.push(new THREE.Vector3(5, 0.5, 0));
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  const line = new THREE.Line(lineGeometry, lineMaterial);
  scene.add(line);

  // 初始化TCP控制器
  tcpController = new TCPController(scene, sender, receiver);
  tcpController.onPacketSent = () => emit('packet-sent');
  tcpController.onPacketReceived = () => emit('packet-received');
  tcpController.onPacketLost = () => emit('packet-lost');
  tcpController.onPacketRetransmitted = () => emit('packet-retransmitted');
  tcpController.onStatusChanged = (status) => emit('status-changed', status);
};

// 动画循环
const animate = () => {
  requestAnimationFrame(animate);
  if (controls) controls.update();
  TWEEN.update(performance.now());
  if (stats) stats.update();
  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
};

// 窗口大小调整
const handleResize = () => {
  if (!container.value) return;
  const width = container.value.clientWidth;
  const height = container.value.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
};

// 公开方法
const startSimulation = () => {
  if (tcpController) {
    tcpController.stopTransmission();
    tcpController.clearPackets();
    setTimeout(() => {
      tcpController.startTransmission();
      emit('status-changed', 'Slow Start');
    }, 100);
  }
};

const stopSimulation = () => {
  if (tcpController) {
    tcpController.clearPackets();
    emit('status-changed', 'Stopped');
  }
};

const resetSimulation = () => {
  if (tcpController) {
    tcpController.clearPackets();
    tcpController.setParameters({
      congestionWindow: 1,
      threshold: 16,
      packetLossRate: 0.1
    });
    emit('status-changed', 'Ready');
  }
};

// 暴露方法给父组件
defineExpose({
  startSimulation,
  stopSimulation,
  resetSimulation
});

// 生命周期钩子
onMounted(() => {
  initScene();
  animate();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  gui.destroy();
  renderer.dispose();
});
</script>

<style scoped>
.scene-container {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
}
</style> 