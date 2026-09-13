import type { Material } from "@babylonjs/core/Materials/material";
import type { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { PhysicsPrestepType } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import type { Scene } from "@babylonjs/core/scene";
import type { SnakeConfig } from "../core/GameConfig";
import { CollisionFilter } from "../physics/CollisionFilter";
import { PhysicsBoxEntity } from "../physics/PhysicsBoxEntity";
import type { SnakeSegmentMetadata } from "./SnakeSegmentMetadata";

export interface SnakeSegmentOptions {
  readonly metadata: SnakeSegmentMetadata;
  readonly position: Vector3;
  readonly material: Material;
  readonly config: SnakeConfig;
}

/** Один сегмент змейки: меш-параллелепипед с физическим телом BOX. */
export class SnakeSegment extends PhysicsBoxEntity {
  public readonly metadata: SnakeSegmentMetadata;

  public constructor(scene: Scene, options: SnakeSegmentOptions) {
    const { config } = options;
    super(SnakeSegment.createMesh(scene, options), scene, {
      mass: config.segmentMass,
      collisionFilter: CollisionFilter.SnakeSegment,
    });

    this.metadata = options.metadata;
    this.body.setLinearDamping(config.linearDamping);
    this.body.setAngularDamping(config.angularDamping);
  }

  /** Физика начинает каждый шаг вести тело к позиции трансформа меша, который двигает пользователь. */
  public beginManualControl(): void {
    if (this.isActive) {
      // В Babylon 9 `disablePreStep = false` включает pre-step в режиме TELEPORT. Режим ACTION вместо
      // телепорта задаёт телу скорость к позиции трансформа: соединения плавно тянут соседей,
      // а сам сегмент разворачивается по ходу движения.
      this.body.disablePreStep = false;
      this.body.setPrestepType(PhysicsPrestepType.ACTION);
    }
  }

  /** Возвращает сегмент под управление физики, не оставляя скорости от перетаскивания. */
  public endManualControl(): void {
    if (this.isActive) {
      this.body.disablePreStep = true;
      this.resetVelocity();
    }
  }

  private static createMesh(scene: Scene, options: SnakeSegmentOptions): Mesh {
    const { metadata, config } = options;
    const size = config.segmentSize;
    const mesh = CreateBox(metadata.id, { width: size.length, height: size.height, depth: size.width }, scene);
    mesh.position.copyFrom(options.position);
    mesh.material = options.material;
    mesh.metadata = metadata;
    return mesh;
  }
}
