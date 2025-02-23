<template>
  <div class="window-display">
    <div class="window-info">
      <h3>TCP 窗口信息</h3>
      <div class="info-item">
        <span>拥塞窗口 (cwnd):</span>
        <div class="window-bar">
          <div class="window-fill" :style="{ width: `${(congestionWindow / maxWindow) * 100}%` }">
            {{ congestionWindow }}
          </div>
        </div>
      </div>
      <div class="info-item">
        <span>慢启动阈值 (ssthresh):</span>
        <div class="window-bar">
          <div class="threshold-marker" :style="{ left: `${(threshold / maxWindow) * 100}%` }"></div>
          {{ threshold }}
        </div>
      </div>
      <div class="info-item">
        <span>传输状态:</span>
        <span :class="['status', status.toLowerCase()]">{{ status }}</span>
      </div>
      <div class="info-item">
        <span>丢包率:</span>
        <span>{{ (packetLossRate * 100).toFixed(1) }}%</span>
      </div>
    </div>
    <div class="statistics">
      <h3>传输统计</h3>
      <div class="stat-item">
        <span>已发送包数:</span>
        <span>{{ sentPackets }}</span>
      </div>
      <div class="stat-item">
        <span>已接收包数:</span>
        <span>{{ receivedPackets }}</span>
      </div>
      <div class="stat-item">
        <span>丢失包数:</span>
        <span>{{ lostPackets }}</span>
      </div>
      <div class="stat-item">
        <span>重传包数:</span>
        <span>{{ retransmittedPackets }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
  congestionWindow: number;
  threshold: number;
  status: string;
  packetLossRate: number;
  sentPackets: number;
  receivedPackets: number;
  lostPackets: number;
  retransmittedPackets: number;
}>();

const maxWindow = 32; // 最大窗口大小
</script>

<style scoped>
.window-display {
  position: fixed;
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 20px;
  border-radius: 10px;
  width: 300px;
  font-family: 'Arial', sans-serif;
  z-index: 1000;
}

.window-info, .statistics {
  margin-bottom: 20px;
}

h3 {
  margin: 0 0 15px 0;
  color: #4CAF50;
}

.info-item, .stat-item {
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.window-bar {
  width: 150px;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}

.window-fill {
  height: 100%;
  background: #4CAF50;
  border-radius: 10px;
  transition: width 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.threshold-marker {
  position: absolute;
  height: 100%;
  width: 2px;
  background: #FFC107;
  transition: left 0.3s ease;
}

.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
}

.status.slow-start {
  background: #2196F3;
}

.status.congestion-avoidance {
  background: #4CAF50;
}

.status.fast-recovery {
  background: #FFC107;
}

.status.retransmitting {
  background: #F44336;
}
</style> 