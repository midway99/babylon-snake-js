import { Ray } from "@babylonjs/core/Culling/ray";
import { RayHelper } from "@babylonjs/core/Debug/rayHelper";
import type { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { PhysicsRaycastResult } from "@babylonjs/core/Physics/physicsRaycastResult";
import type { IRaycastQuery } from "@babylonjs/core/Physics/physicsRaycastResult";
import type { PhysicsBody } from "@babylonjs/core/Physics/v2/physicsBody";
import type { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import type { Scene } from "@babylonjs/core/scene";
import type { LaserConfig } from "../core/GameConfig";
import { CollisionGroup } from "../physics/CollisionFilter";

/** Луч-препятствие: физический raycast между двумя точками, видимый через RayHelper. */
export class Laser {
  /** Луч видит только сегменты змейки: пол, осколки и финиш пропускаются. */
  private static readonly query: IRaycastQuery = { collideWith: CollisionGroup.SnakeSegment };
  private static readonly scratchOffset: Vector3 = new Vector3();

  private readonly from: Vector3;
  private readonly to: Vector3;
  private readonly helper: RayHelper;

  public constructor(
    scene: Scene,
    private readonly config: LaserConfig,
    color: Color3,
  ) {
    this.from = config.from.clone();
    this.to = config.to.clone();

    const direction = config.to.subtract(config.from);
    const length = direction.length();
    // Ray хранит ссылку на `from`, поэтому RayHelper сам следует за качающимся лучом.
    const ray = new Ray(this.from, direction.normalize(), length);
    this.helper = new RayHelper(ray);
    this.helper.show(scene, color);
  }

  /** Сдвигает качающийся луч в положение для момента `timeSeconds`. */
  public update(timeSeconds: number): void {
    const sweep = this.config.sweep;
    if (sweep === undefined) {
      return;
    }
    const phase = Math.sin((2 * Math.PI * timeSeconds) / sweep.periodSeconds);
    const offset = sweep.offset.scaleToRef(phase, Laser.scratchOffset);
    this.config.from.addToRef(offset, this.from);
    this.config.to.addToRef(offset, this.to);
  }

  /** Возвращает тело первого сегмента змейки на пути луча или `null`. */
  public cast(plugin: HavokPlugin, result: PhysicsRaycastResult): PhysicsBody | null {
    plugin.raycast(this.from, this.to, result, Laser.query);
    return result.hasHit && result.body !== undefined ? result.body : null;
  }

  public dispose(): void {
    this.helper.dispose();
  }
}
