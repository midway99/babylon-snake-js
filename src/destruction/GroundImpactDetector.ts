import type { IPhysicsCollisionEvent } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import type { Scene } from "@babylonjs/core/scene";
import type { DestructionConfig } from "../core/GameConfig";
import { CollisionFilter } from "../physics/CollisionFilter";
import type { Snake } from "../snake/Snake";
import type { SegmentShatterer } from "./SegmentShatterer";

/**
 * Следит за ударами сегментов о землю и разбивает сегмент, если импульс удара превысил порог.
 * События столкновений приходят посреди обработки шага Havok, поэтому здесь сегмент только
 * помечается, а разрушение выполняется после шага физики.
 */
export class GroundImpactDetector {
  private readonly pendingBreaks: Uint8Array;

  public constructor(
    private readonly scene: Scene,
    private readonly snake: Snake,
    private readonly shatterer: SegmentShatterer,
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
    this.pendingBreaks[this.snake.indexOfBody(event.collider)] = 1;
  };

  private readonly processPendingBreaks = (): void => {
    for (let index = 0; index < this.pendingBreaks.length; index++) {
      if (this.pendingBreaks[index] === 1) {
        this.pendingBreaks[index] = 0;
        this.shatterer.shatter(index);
      }
    }
  };
}
