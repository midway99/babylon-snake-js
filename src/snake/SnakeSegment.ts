import type { Material } from "@babylonjs/core/Materials/material";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { PhysicsPrestepType, PhysicsShapeType } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import { PhysicsAggregate } from "@babylonjs/core/Physics/v2/physicsAggregate";
import type { PhysicsBody } from "@babylonjs/core/Physics/v2/physicsBody";
import type { Scene } from "@babylonjs/core/scene";
import type { SnakeConfig } from "../core/GameConfig";
import { CollisionFilter } from "../physics/CollisionFilter";
import type { SnakeSegmentMetadata } from "./SnakeSegmentMetadata";

export interface SnakeSegmentOptions {
  readonly metadata: SnakeSegmentMetadata;
  readonly position: Vector3;
  readonly material: Material;
  readonly config: SnakeConfig;
}

/** Один сегмент змейки: меш-параллелепипед с физическим телом BOX. */
export class SnakeSegment {
  private static readonly zeroVelocity: Vector3 = Vector3.Zero();

  public readonly mesh: Mesh;
  public readonly metadata: SnakeSegmentMetadata;
  private readonly aggregate: PhysicsAggregate;

  public constructor(scene: Scene, options: SnakeSegmentOptions) {
    const { metadata, config } = options;
    const size = config.segmentSize;

    this.metadata = metadata;
    this.mesh = CreateBox(metadata.id, { width: size.length, height: size.height, depth: size.width }, scene);
    this.mesh.position.copyFrom(options.position);
    this.mesh.material = options.material;
    this.mesh.metadata = metadata;

    this.aggregate = new PhysicsAggregate(this.mesh, PhysicsShapeType.BOX, { mass: config.segmentMass }, scene);
    CollisionFilter.SnakeSegment.applyTo(this.aggregate.shape);
    this.body.setLinearDamping(config.linearDamping);
    this.body.setAngularDamping(config.angularDamping);
    // Во время перетаскивания тело не телепортируется, а получает скорость, ведущую к позиции трансформа:
    // соединения плавно тянут соседей, а сам сегмент разворачивается по ходу движения.
    this.body.setPrestepType(PhysicsPrestepType.ACTION);
  }

  public get body(): PhysicsBody {
    return this.aggregate.body;
  }

  /** Физика начинает каждый шаг вести тело к позиции трансформа меша, который двигает пользователь. */
  public beginManualControl(): void {
    this.body.disablePreStep = false;
  }

  /** Возвращает сегмент под управление физики, не оставляя скорости от перетаскивания. */
  public endManualControl(): void {
    this.body.disablePreStep = true;
    this.body.setLinearVelocity(SnakeSegment.zeroVelocity);
    this.body.setAngularVelocity(SnakeSegment.zeroVelocity);
  }

  public dispose(): void {
    this.aggregate.dispose();
    this.mesh.dispose();
  }
}
