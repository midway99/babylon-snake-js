import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { IPhysicsCollisionEvent } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import { PhysicsEventType } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import type { DustConfig } from "../core/GameConfig";
import { CollisionFilter } from "../physics/CollisionFilter";
import type { Snake } from "../snake/Snake";
import type { DustParticlePool } from "./DustParticlePool";

/**
 * Поднимает пыль в точке контакта сегмента с землёй: при приземлении и по мере того,
 * как сегмент ползёт по земле. Облачка ограничены пройденным расстоянием, чтобы не запускать
 * систему частиц на каждом шаге физики.
 */
export class GroundDustEmitter {
  /** Позиция каждого сегмента в момент его последнего облачка пыли. */
  private readonly lastPuffPositions: Vector3[] = [];
  private readonly travelDistanceSquared: number;

  public constructor(
    private readonly snake: Snake,
    private readonly pool: DustParticlePool,
    private readonly config: DustConfig,
  ) {
    this.travelDistanceSquared = config.travelDistancePerPuff * config.travelDistancePerPuff;
    for (const segment of snake.segments) {
      this.lastPuffPositions.push(segment.mesh.position.clone());
      segment.body.getCollisionObservable().add(this.onSegmentCollision);
    }
  }

  /** Отсчитывает путь до следующего облачка заново от текущих позиций сегментов. */
  public reset(): void {
    for (let index = 0; index < this.lastPuffPositions.length; index++) {
      this.lastPuffPositions[index].copyFrom(this.snake.segments[index].mesh.position);
    }
  }

  public dispose(): void {
    for (const segment of this.snake.segments) {
      segment.body.getCollisionObservable().removeCallback(this.onSegmentCollision);
    }
  }

  private readonly onSegmentCollision = (event: IPhysicsCollisionEvent): void => {
    if (event.point === null || !CollisionFilter.isGround(event.collidedAgainst.shape)) {
      return;
    }
    const index = this.snake.indexOfBody(event.collider);
    const position = this.snake.segments[index].mesh.position;
    const lastPuff = this.lastPuffPositions[index];

    const landed =
      event.type === PhysicsEventType.COLLISION_STARTED && event.impulse >= this.config.landingImpulseThreshold;
    const travelled = Vector3.DistanceSquared(position, lastPuff) >= this.travelDistanceSquared;
    if ((landed || travelled) && this.pool.emit(event.point, this.config.contact)) {
      lastPuff.copyFrom(position);
    }
  };
}
