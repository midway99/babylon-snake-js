import { PhysicsRaycastResult } from "@babylonjs/core/Physics/physicsRaycastResult";
import type { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import type { Scene } from "@babylonjs/core/scene";
import type { CourseConfig } from "../core/GameConfig";
import type { SegmentShatterer } from "../destruction/SegmentShatterer";
import type { Snake } from "../snake/Snake";
import { Laser } from "./Laser";

/** Полоса препятствий из лучей: каждый шаг физики двигает лучи и разрушает задетые сегменты. */
export class LaserCourse {
  private readonly lasers: Laser[] = [];
  /** Один результат на все лучи: они проверяются последовательно. */
  private readonly raycastResult: PhysicsRaycastResult = new PhysicsRaycastResult();
  private elapsedSeconds = 0;

  public constructor(
    private readonly scene: Scene,
    private readonly plugin: HavokPlugin,
    private readonly snake: Snake,
    private readonly shatterer: SegmentShatterer,
    config: CourseConfig,
  ) {
    for (const laserConfig of config.lasers) {
      this.lasers.push(new Laser(scene, laserConfig, config.laserColor));
    }
    scene.onAfterPhysicsObservable.add(this.onAfterPhysics);
  }

  public dispose(): void {
    this.scene.onAfterPhysicsObservable.removeCallback(this.onAfterPhysics);
    for (const laser of this.lasers) {
      laser.dispose();
    }
    this.lasers.length = 0;
  }

  private readonly onAfterPhysics = (): void => {
    this.elapsedSeconds += this.scene.getEngine().getDeltaTime() / 1000;
    for (const laser of this.lasers) {
      laser.update(this.elapsedSeconds);
      const hitBody = laser.cast(this.plugin, this.raycastResult);
      if (hitBody !== null) {
        this.shatterer.shatter(this.snake.indexOfBody(hitBody));
      }
    }
  };
}
