import type { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import type { DestructionConfig, DustConfig } from "../core/GameConfig";
import type { DustParticlePool } from "../effects/DustParticlePool";
import type { Snake } from "../snake/Snake";
import type { ShatteredSegmentPool } from "./ShatteredSegmentPool";

/** Разрушает сегмент змейки: скрывает его, подменяет разбитой копией из пула и поднимает облако пыли. */
export class SegmentShatterer {
  public constructor(
    private readonly snake: Snake,
    private readonly pool: ShatteredSegmentPool,
    private readonly plugin: HavokPlugin,
    private readonly config: DestructionConfig,
    private readonly dustPool: DustParticlePool,
    private readonly dustConfig: DustConfig,
  ) {}

  /** Вызывать вне обработки шага Havok (например, в `onAfterPhysicsObservable`). */
  public shatter(segmentIndex: number): void {
    const segment = this.snake.segments[segmentIndex];
    if (!segment.isActive) {
      return;
    }
    const shattered = this.pool.acquire();
    if (shattered === null) {
      return;
    }
    shattered.burstFrom(segment, this.plugin, this.config);
    this.dustPool.emit(segment.mesh.position, this.dustConfig.destruction);
    this.snake.detachSegment(segmentIndex);
  }
}
