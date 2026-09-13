import type { IPhysicsCollisionEvent } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import type { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import type { Scene } from "@babylonjs/core/scene";
import type { DestructionConfig } from "../core/GameConfig";
import { CollisionFilter } from "../physics/CollisionFilter";
import type { Snake } from "../snake/Snake";
import type { SnakeSegmentMetadata } from "../snake/SnakeSegmentMetadata";
import type { ShatteredSegmentPool } from "./ShatteredSegmentPool";

/**
 * Следит за ударами сегментов о землю и разбивает сегмент, если импульс удара превысил порог.
 * События столкновений приходят посреди обработки шага Havok, поэтому здесь сегмент только
 * помечается, а подмена на осколки выполняется после шага физики.
 */
export class SnakeDestruction {
  private readonly pendingBreaks: Uint8Array;

  public constructor(
    private readonly scene: Scene,
    private readonly snake: Snake,
    private readonly pool: ShatteredSegmentPool,
    private readonly plugin: HavokPlugin,
    private readonly config: DestructionConfig,
  ) {
    this.pendingBreaks = new Uint8Array(snake.segments.length);
    for (const segment of snake.segments) {
      segment.body.setCollisionCallbackEnabled(true);
      segment.body.getCollisionObservable().add(this.onSegmentCollision);
    }
    scene.onAfterPhysicsObservable.add(this.processPendingBreaks);
  }

  public dispose(): void {
    this.scene.onAfterPhysicsObservable.removeCallback(this.processPendingBreaks);
    for (const segment of this.snake.segments) {
      segment.body.getCollisionObservable().removeCallback(this.onSegmentCollision);
      segment.body.setCollisionCallbackEnabled(false);
    }
  }

  private readonly onSegmentCollision = (event: IPhysicsCollisionEvent): void => {
    if (event.impulse < this.config.impactImpulseThreshold || !CollisionFilter.isGround(event.collidedAgainst.shape)) {
      return;
    }
    const metadata: SnakeSegmentMetadata = event.collider.transformNode.metadata;
    this.pendingBreaks[metadata.index] = 1;
  };

  private readonly processPendingBreaks = (): void => {
    for (let index = 0; index < this.pendingBreaks.length; index++) {
      if (this.pendingBreaks[index] === 1) {
        this.pendingBreaks[index] = 0;
        this.breakSegment(index);
      }
    }
  };

  private breakSegment(index: number): void {
    const segment = this.snake.segments[index];
    if (!segment.isActive) {
      return;
    }
    const shattered = this.pool.acquire();
    if (shattered === null) {
      return;
    }
    shattered.burstFrom(segment, this.plugin, this.config);
    this.snake.detachSegment(index);
  }
}
