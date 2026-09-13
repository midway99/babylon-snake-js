import type { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { PhysicsConstraint } from "@babylonjs/core/Physics/v2/physicsConstraint";
import type { Scene } from "@babylonjs/core/scene";
import type { SnakeConfig } from "../core/GameConfig";
import { SegmentConnector } from "./SegmentConnector";
import { SnakeMaterials } from "./SnakeMaterials";
import { SnakeSegment } from "./SnakeSegment";

/** Змейка из последовательно соединённых физических сегментов. */
export class Snake {
  private readonly ownedSegments: SnakeSegment[] = [];
  private readonly constraints: PhysicsConstraint[] = [];
  private readonly materials: SnakeMaterials;

  public constructor(scene: Scene, config: SnakeConfig) {
    this.materials = new SnakeMaterials(scene, config);
    this.build(scene, config);
  }

  public get head(): SnakeSegment {
    return this.ownedSegments[0];
  }

  public get segments(): ReadonlyArray<SnakeSegment> {
    return this.ownedSegments;
  }

  /** Скрывает сегмент и разрывает его соединения с соседями; змейка распадается на части. */
  public detachSegment(index: number): void {
    // Соединение с индексом i связывает сегменты i и i + 1.
    this.disableConstraint(index - 1);
    this.disableConstraint(index);
    this.ownedSegments[index].deactivate();
  }

  public dispose(): void {
    for (const constraint of this.constraints) {
      constraint.dispose();
    }
    for (const segment of this.ownedSegments) {
      segment.dispose();
    }
    this.constraints.length = 0;
    this.ownedSegments.length = 0;
    this.materials.dispose();
  }

  private build(scene: Scene, config: SnakeConfig): void {
    const connector = new SegmentConnector(scene, config);
    const position = config.spawnPosition.clone();
    const step = config.segmentSize.length + config.segmentGap;

    for (let index = 0; index < config.segmentCount; index++) {
      const segment = this.createSegment(scene, config, index, position);
      if (index > 0) {
        this.constraints.push(connector.connect(this.ownedSegments[index - 1], segment));
      }
      this.ownedSegments.push(segment);
      position.x -= step;
    }
  }

  private disableConstraint(index: number): void {
    if (index >= 0 && index < this.constraints.length) {
      this.constraints[index].isEnabled = false;
    }
  }

  private createSegment(scene: Scene, config: SnakeConfig, index: number, position: Vector3): SnakeSegment {
    return new SnakeSegment(scene, {
      metadata: { id: `snake-segment-${index}`, index },
      position,
      material: this.materials.getForSegment(index),
      config,
    });
  }
}
