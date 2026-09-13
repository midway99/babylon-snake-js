import type { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { PhysicsConstraint } from "@babylonjs/core/Physics/v2/physicsConstraint";
import type { Scene } from "@babylonjs/core/scene";
import type { SnakeConfig } from "../core/GameConfig";
import { SegmentConnector } from "./SegmentConnector";
import { SnakeMaterials } from "./SnakeMaterials";
import { SnakeSegment } from "./SnakeSegment";

/** Змейка из последовательно соединённых физических сегментов. */
export class Snake {
  private readonly segments: SnakeSegment[] = [];
  private readonly constraints: PhysicsConstraint[] = [];
  private readonly materials: SnakeMaterials;

  public constructor(scene: Scene, config: SnakeConfig) {
    this.materials = new SnakeMaterials(scene, config);
    this.build(scene, config);
  }

  public get head(): SnakeSegment {
    return this.segments[0];
  }

  public get length(): number {
    return this.segments.length;
  }

  public dispose(): void {
    for (const constraint of this.constraints) {
      constraint.dispose();
    }
    for (const segment of this.segments) {
      segment.dispose();
    }
    this.constraints.length = 0;
    this.segments.length = 0;
    this.materials.dispose();
  }

  private build(scene: Scene, config: SnakeConfig): void {
    const connector = new SegmentConnector(scene, config);
    const position = config.spawnPosition.clone();
    const step = config.segmentSize.length + config.segmentGap;

    for (let index = 0; index < config.segmentCount; index++) {
      const segment = this.createSegment(scene, config, index, position);
      if (index > 0) {
        this.constraints.push(connector.connect(this.segments[index - 1], segment));
      }
      this.segments.push(segment);
      position.x -= step;
    }
  }

  private createSegment(scene: Scene, config: SnakeConfig, index: number, position: Vector3): SnakeSegment {
    return new SnakeSegment(scene, {
      metadata: { id: `snake-segment-${index}`, index },
      size: config.segmentSize,
      position,
      material: this.materials.getForSegment(index),
      mass: config.segmentMass,
    });
  }
}
