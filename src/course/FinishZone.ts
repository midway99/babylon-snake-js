import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { IBasePhysicsCollisionEvent } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import { PhysicsEventType, PhysicsShapeType } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import { PhysicsAggregate } from "@babylonjs/core/Physics/v2/physicsAggregate";
import type { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import type { Scene } from "@babylonjs/core/scene";
import type { FinishZoneConfig } from "../core/GameConfig";
import { CollisionFilter } from "../physics/CollisionFilter";

/**
 * Полупрозрачный зелёный куб-триггер. Когда в него входит сегмент змейки, один раз вызывает `onReached`.
 * Событие триггера приходит посреди обработки шага Havok, поэтому колбэк вызывается уже после шага.
 */
export class FinishZone {
  private readonly mesh: Mesh;
  private readonly material: StandardMaterial;
  private readonly aggregate: PhysicsAggregate;
  private reached = false;
  private notified = false;

  public constructor(
    private readonly scene: Scene,
    private readonly plugin: HavokPlugin,
    config: FinishZoneConfig,
    private readonly onReached: () => void,
  ) {
    this.material = new StandardMaterial("finishZoneMaterial", scene);
    this.material.diffuseColor = config.color;
    this.material.alpha = config.alpha;

    this.mesh = CreateBox("finishZone", { size: config.size }, scene);
    this.mesh.position.copyFrom(config.position);
    this.mesh.material = this.material;
    // Прозрачный куб не должен перехватывать клики по сегменту внутри него.
    this.mesh.isPickable = false;

    this.aggregate = new PhysicsAggregate(this.mesh, PhysicsShapeType.BOX, { mass: 0 }, scene);
    this.aggregate.shape.isTrigger = true;
    CollisionFilter.FinishZone.applyTo(this.aggregate.shape);

    plugin.onTriggerCollisionObservable.add(this.onTrigger);
    scene.onAfterPhysicsObservable.add(this.notifyIfReached);
  }

  /** Снова ждёт прохождения трассы. */
  public reset(): void {
    this.reached = false;
    this.notified = false;
  }

  public dispose(): void {
    this.plugin.onTriggerCollisionObservable.removeCallback(this.onTrigger);
    this.scene.onAfterPhysicsObservable.removeCallback(this.notifyIfReached);
    this.aggregate.dispose();
    this.mesh.dispose();
    this.material.dispose();
  }

  private readonly onTrigger = (event: IBasePhysicsCollisionEvent): void => {
    if (event.type !== PhysicsEventType.TRIGGER_ENTERED) {
      return;
    }
    const body = this.aggregate.body;
    // Маски фильтрации пропускают в триггер только сегменты змейки.
    if (event.collider === body || event.collidedAgainst === body) {
      this.reached = true;
    }
  };

  private readonly notifyIfReached = (): void => {
    if (!this.reached || this.notified) {
      return;
    }
    this.notified = true;
    this.onReached();
  };
}
