import type { Material } from "@babylonjs/core/Materials/material";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { PhysicsMotionType, PhysicsShapeType } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import { PhysicsAggregate } from "@babylonjs/core/Physics/v2/physicsAggregate";
import type { PhysicsBody } from "@babylonjs/core/Physics/v2/physicsBody";
import type { Scene } from "@babylonjs/core/scene";
import type { SegmentSize } from "../core/GameConfig";
import { CollisionFilter } from "../physics/CollisionFilter";
import type { SnakeSegmentMetadata } from "./SnakeSegmentMetadata";

export interface SnakeSegmentOptions {
  readonly metadata: SnakeSegmentMetadata;
  readonly size: SegmentSize;
  readonly position: Vector3;
  readonly material: Material;
  readonly mass: number;
}

/** Один сегмент змейки: меш-параллелепипед с физическим телом BOX. */
export class SnakeSegment {
  private static readonly zeroVelocity: Vector3 = Vector3.Zero();

  public readonly mesh: Mesh;
  public readonly metadata: SnakeSegmentMetadata;
  private readonly aggregate: PhysicsAggregate;

  public constructor(scene: Scene, options: SnakeSegmentOptions) {
    const { metadata, size } = options;

    this.metadata = metadata;
    this.mesh = CreateBox(metadata.id, { width: size.length, height: size.height, depth: size.width }, scene);
    this.mesh.position.copyFrom(options.position);
    this.mesh.material = options.material;
    this.mesh.metadata = metadata;

    this.aggregate = new PhysicsAggregate(this.mesh, PhysicsShapeType.BOX, { mass: options.mass }, scene);
    CollisionFilter.SnakeSegment.applyTo(this.aggregate.shape);
  }

  public get body(): PhysicsBody {
    return this.aggregate.body;
  }

  /**
   * Передаёт управление позицией трансформу меша: тело становится кинематическим
   * (на него не действуют гравитация и соединения), а физика каждый шаг читает позицию из трансформа.
   */
  public beginManualControl(): void {
    this.body.setMotionType(PhysicsMotionType.ANIMATED);
    this.body.disablePreStep = false;
  }

  /** Возвращает сегмент под управление физики без накопленной скорости. */
  public endManualControl(): void {
    this.body.disablePreStep = true;
    this.body.setMotionType(PhysicsMotionType.DYNAMIC);
    this.body.setLinearVelocity(SnakeSegment.zeroVelocity);
    this.body.setAngularVelocity(SnakeSegment.zeroVelocity);
  }

  public dispose(): void {
    this.aggregate.dispose();
    this.mesh.dispose();
  }
}
