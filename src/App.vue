<template>
  <div class="app">
    <TCPScene
      ref="tcpSceneRef"
      @packet-sent="handlePacketSent"
      @packet-received="handlePacketReceived"
      @packet-lost="handlePacketLost"
      @packet-retransmitted="handlePacketRetransmitted"
      @status-changed="handleStatusChanged"
    />
    <WindowDisplay
      :congestion-window="tcpState.congestionWindow"
      :threshold="tcpState.threshold"
      :status="tcpState.status"
      :packet-loss-rate="tcpState.packetLossRate"
      :sent-packets="tcpState.sentPackets"
      :received-packets="tcpState.receivedPackets"
      :lost-packets="tcpState.lostPackets"
      :retransmitted-packets="tcpState.retransmittedPackets"
    />
    <div class="controls">
      <button @click="startSimulation" :disabled="isSimulating">开始模拟</button>
      <button @click="stopSimulation" :disabled="!isSimulating">停止模拟</button>
      <button @click="resetSimulation">重置模拟</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import TCPScene from './components/TCPScene.vue';
import WindowDisplay from './components/WindowDisplay.vue';

const tcpSceneRef = ref<InstanceType<typeof TCPScene> | null>(null);
const isSimulating = ref(false);

const tcpState = reactive({
  congestionWindow: 1,
  threshold: 16,
  status: 'Ready',
  packetLossRate: 0.1,
  sentPackets: 0,
  receivedPackets: 0,
  lostPackets: 0,
  retransmittedPackets: 0
});

const startSimulation = () => {
  if (tcpSceneRef.value) {
    isSimulating.value = true;
    tcpSceneRef.value.startSimulation();
  }
};

const stopSimulation = () => {
  if (tcpSceneRef.value) {
    isSimulating.value = false;
    tcpSceneRef.value.stopSimulation();
  }
};

const resetSimulation = () => {
  if (tcpSceneRef.value) {
    isSimulating.value = false;
    tcpSceneRef.value.resetSimulation();
    Object.assign(tcpState, {
      congestionWindow: 1,
      threshold: 16,
      status: 'Ready',
      packetLossRate: 0.1,
      sentPackets: 0,
      receivedPackets: 0,
      lostPackets: 0,
      retransmittedPackets: 0
    });
  }
};

// 事件处理函数
const handlePacketSent = () => {
  tcpState.sentPackets++;
};

const handlePacketReceived = () => {
  tcpState.receivedPackets++;
};

const handlePacketLost = () => {
  tcpState.lostPackets++;
};

const handlePacketRetransmitted = () => {
  tcpState.retransmittedPackets++;
};

const handleStatusChanged = (newStatus: string) => {
  tcpState.status = newStatus;
};
</script>

<style>
.app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000;
}

.controls {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 100;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background: #4CAF50;
  color: white;
  transition: background-color 0.3s;
}

button:hover {
  background: #45a049;
}

button:disabled {
  background: #cccccc;
  cursor: not-allowed;
}
</style> 