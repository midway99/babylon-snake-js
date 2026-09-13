import "@babylonjs/core/Particles/particleSystemComponent";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { ParticleSystem } from "@babylonjs/core/Particles/particleSystem";
import type { Scene } from "@babylonjs/core/scene";
import dustTextureUrl from "../assets/textures/RocketSmokeAlpha.png";
import type { DustBurstConfig, DustConfig } from "../core/GameConfig";

/** Одна система частиц пыли и её собственная точка эмиссии. */
interface DustSlot {
  readonly system: ParticleSystem;
  readonly emitterPosition: Vector3;
}

/**
 * Пул заранее собранных систем частиц пыли. Выброс запускает свободную систему в заданной точке;
 * система сама останавливается и освобождается, когда догорят её частицы. Во время игры ничего не создаётся.
 */
export class DustParticlePool {
  /** Кадры эмиссии: все частицы выбрасываются сразу через `manualEmitCount`, дальше система только догорает. */
  private static readonly burstDuration = 0.05;

  private readonly texture: Texture;
  private readonly slots: DustSlot[] = [];

  public constructor(scene: Scene, config: DustConfig) {
    this.texture = new Texture(dustTextureUrl, scene);
    const capacity = Math.max(config.contact.particleCount, config.destruction.particleCount);
    for (let index = 0; index < config.poolSize; index++) {
      this.slots.push(this.createSlot(`dust-${index}`, capacity, scene, config));
    }
  }

  /** Выбрасывает облако пыли в точке `position`. Возвращает `false`, если все системы заняты. */
  public emit(position: Vector3, burst: DustBurstConfig): boolean {
    const slot = this.findFreeSlot();
    if (slot === null) {
      return false;
    }
    const system = slot.system;
    slot.emitterPosition.copyFrom(position);
    system.minSize = burst.minSize;
    system.maxSize = burst.maxSize;
    system.minLifeTime = burst.minLifeTime;
    system.maxLifeTime = burst.maxLifeTime;
    system.minEmitPower = burst.minEmitPower;
    system.maxEmitPower = burst.maxEmitPower;
    system.manualEmitCount = burst.particleCount;
    system.start();
    return true;
  }

  public dispose(): void {
    for (const slot of this.slots) {
      slot.system.dispose(false);
    }
    this.slots.length = 0;
    this.texture.dispose();
  }

  private findFreeSlot(): DustSlot | null {
    for (const slot of this.slots) {
      // Система остаётся «запущенной», пока не догорит последняя частица.
      if (!slot.system.isStarted()) {
        return slot;
      }
    }
    return null;
  }

  private createSlot(name: string, capacity: number, scene: Scene, config: DustConfig): DustSlot {
    const system = new ParticleSystem(name, capacity, scene);
    const emitterPosition = new Vector3();
    system.emitter = emitterPosition;
    system.particleTexture = this.texture;
    system.blendMode = ParticleSystem.BLENDMODE_STANDARD;

    system.color1.copyFrom(config.color);
    system.color2.copyFrom(config.color);
    system.colorDead.copyFrom(config.fadeColor);

    // Пыль расходится в стороны и немного вверх, затем оседает.
    system.minEmitBox.set(-0.15, 0, -0.15);
    system.maxEmitBox.set(0.15, 0.05, 0.15);
    system.direction1.set(-1, 0.3, -1);
    system.direction2.set(1, 1, 1);
    system.gravity.set(0, -0.8, 0);
    system.minInitialRotation = 0;
    system.maxInitialRotation = Math.PI * 2;
    system.minAngularSpeed = -1;
    system.maxAngularSpeed = 1;

    system.emitRate = 0;
    system.targetStopDuration = DustParticlePool.burstDuration;
    return { system, emitterPosition };
  }
}
