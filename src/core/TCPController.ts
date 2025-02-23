import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

export interface TCPPacket {
  id: number;
  mesh: THREE.Mesh;
  status: 'sending' | 'received' | 'lost' | 'retransmitting';
}

export class TCPController {
  private scene: THREE.Scene;
  private sender: THREE.Mesh;
  private receiver: THREE.Mesh;
  private packets: TCPPacket[] = [];
  private congestionWindow: number = 1;
  private threshold: number = 16;
  private packetId: number = 0;
  private isSlowStart: boolean = true;
  private packetLossRate: number = 0.1;
  private transmissionInterval: number | null = null;

  // 事件回调
  public onPacketSent: () => void = () => {};
  public onPacketReceived: () => void = () => {};
  public onPacketLost: () => void = () => {};
  public onPacketRetransmitted: () => void = () => {};
  public onStatusChanged: (status: string) => void = () => {};

  constructor(scene: THREE.Scene, sender: THREE.Mesh, receiver: THREE.Mesh) {
    this.scene = scene;
    this.sender = sender;
    this.receiver = receiver;
  }

  // 创建数据包
  private createPacket(): TCPPacket {
    const geometry = new THREE.SphereGeometry(0.3);
    const material = new THREE.MeshPhongMaterial({
      color: 0x00ff00,
      emissive: 0x00ff00,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.8
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(this.sender.position.clone().add(new THREE.Vector3(0, 1, 0)));

    const packet: TCPPacket = {
      id: this.packetId++,
      mesh: mesh,
      status: 'sending'
    };

    this.scene.add(mesh);
    this.packets.push(packet);
    this.onPacketSent();
    return packet;
  }

  // 发送数据包
  private sendPacket(packet: TCPPacket) {
    const duration = 2000; // 2秒
    const startPosition = this.sender.position.clone().add(new THREE.Vector3(0, 1, 0));
    const endPosition = this.receiver.position.clone().add(new THREE.Vector3(0, 1, 0));
    const midPoint = new THREE.Vector3(
      (startPosition.x + endPosition.x) / 2,
      startPosition.y + 2, // 弧线最高点
      startPosition.z
    );

    // 随机决定是否丢包
    const isLost = Math.random() < this.packetLossRate;
    const lossPoint = new THREE.Vector3(
      (startPosition.x + endPosition.x) / 2,
      startPosition.y + 1,
      startPosition.z
    );

    // 使用二次贝塞尔曲线创建弧线路径
    const curve = new THREE.QuadraticBezierCurve3(
      startPosition,
      midPoint,
      isLost ? lossPoint : endPosition
    );

    const points = curve.getPoints(50);
    let currentPoint = 0;

    new TWEEN.Tween({ t: 0 })
      .to({ t: 1 }, duration)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate((obj) => {
        const position = curve.getPoint(obj.t);
        packet.mesh.position.copy(position);
        
        if (isLost && obj.t >= 0.5 && packet.status === 'sending') {
          packet.status = 'lost';
          const material = packet.mesh.material as THREE.MeshPhongMaterial;
          material.color.setHex(0xff0000);
          material.emissive.setHex(0xff0000);
          material.emissiveIntensity = 0.8;
          this.onPacketLost();
        }
      })
      .onComplete(() => {
        if (!isLost) {
          packet.status = 'received';
          const material = packet.mesh.material as THREE.MeshPhongMaterial;
          material.color.setHex(0x0000ff);
          material.emissive.setHex(0x0000ff);
          material.emissiveIntensity = 0.8;
          this.onPacketReceived();
          this.sendAck(packet);
        } else {
          this.handlePacketLoss(packet);
        }
      })
      .start();
  }

  // 发送确认包
  private sendAck(packet: TCPPacket) {
    const duration = 2000;
    const ackGeometry = new THREE.SphereGeometry(0.2);
    const ackMaterial = new THREE.MeshPhongMaterial({
      color: 0xffff00,
      emissive: 0xffff00,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.8
    });
    const ackMesh = new THREE.Mesh(ackGeometry, ackMaterial);
    ackMesh.position.copy(this.receiver.position.clone().add(new THREE.Vector3(0, 1, 0)));
    this.scene.add(ackMesh);

    const startPosition = this.receiver.position.clone().add(new THREE.Vector3(0, 1, 0));
    const endPosition = this.sender.position.clone().add(new THREE.Vector3(0, 1, 0));
    const midPoint = new THREE.Vector3(
      (startPosition.x + endPosition.x) / 2,
      startPosition.y + 2,
      startPosition.z
    );

    const curve = new THREE.QuadraticBezierCurve3(
      startPosition,
      midPoint,
      endPosition
    );

    new TWEEN.Tween({ t: 0 })
      .to({ t: 1 }, duration)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate((obj) => {
        const position = curve.getPoint(obj.t);
        ackMesh.position.copy(position);
      })
      .onComplete(() => {
        this.scene.remove(ackMesh);
        this.updateCongestionWindow(true);
      })
      .start();
  }

  // 处理丢包
  private handlePacketLoss(packet: TCPPacket) {
    this.updateCongestionWindow(false);
    
    // 重传数据包
    setTimeout(() => {
      packet.status = 'retransmitting';
      const material = packet.mesh.material as THREE.MeshPhongMaterial;
      material.color.setHex(0xffff00);
      material.emissive.setHex(0xffff00);
      material.emissiveIntensity = 0.8;
      packet.mesh.position.copy(this.sender.position.clone().add(new THREE.Vector3(0, 1, 0)));
      this.onPacketRetransmitted();
      this.sendPacket(packet);
    }, 1000);
  }

  // 更新拥塞窗口
  private updateCongestionWindow(success: boolean) {
    if (success) {
      if (this.isSlowStart) {
        if (this.congestionWindow >= this.threshold) {
          this.isSlowStart = false;
          this.congestionWindow += 1;
          this.onStatusChanged('Congestion Avoidance');
        } else {
          this.congestionWindow *= 2;
          this.onStatusChanged('Slow Start');
        }
      } else {
        this.congestionWindow += 1;
        this.onStatusChanged('Congestion Avoidance');
      }
    } else {
      this.threshold = Math.max(2, this.congestionWindow / 2);
      this.congestionWindow = 1;
      this.isSlowStart = true;
      this.onStatusChanged('Fast Recovery');
    }
  }

  // 开始传输
  public startTransmission() {
    const sendNextBatch = () => {
      for (let i = 0; i < this.congestionWindow; i++) {
        const packet = this.createPacket();
        this.sendPacket(packet);
      }
    };

    // 每2秒发送一批数据包
    this.transmissionInterval = window.setInterval(sendNextBatch, 2000);
    sendNextBatch(); // 立即发送第一批
  }

  // 停止传输
  public stopTransmission() {
    if (this.transmissionInterval !== null) {
      clearInterval(this.transmissionInterval);
      this.transmissionInterval = null;
    }
  }

  // 设置参数
  public setParameters(params: {
    congestionWindow?: number;
    threshold?: number;
    packetLossRate?: number;
  }) {
    if (params.congestionWindow !== undefined) {
      this.congestionWindow = params.congestionWindow;
    }
    if (params.threshold !== undefined) {
      this.threshold = params.threshold;
    }
    if (params.packetLossRate !== undefined) {
      this.packetLossRate = params.packetLossRate;
    }
  }

  // 清理场景中的所有数据包
  public clearPackets() {
    this.stopTransmission();
    this.packets.forEach(packet => {
      this.scene.remove(packet.mesh);
    });
    this.packets = [];
  }
} 