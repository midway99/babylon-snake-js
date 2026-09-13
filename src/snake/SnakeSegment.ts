import type { Material } from "@babylonjs/core/Materials/material";
import type { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { PhysicsShapeType } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import { PhysicsAggregate } from "@babylonjs/core/Physics/v2/physicsAggregate";
import type { PhysicsBody } from "@babylonjs/core/Physics/v2/physicsBody";
import type { Scene } from "@babylonjs/core/scene";
import type { SegmentSize } from "../core/GameConfig";
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
  }

  public get body(): PhysicsBody {
    return this.aggregate.body;
  }

  public dispose(): void {
    this.aggregate.dispose();
    this.mesh.dispose();
  }
}
