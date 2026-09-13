import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { BallAndSocketConstraint } from "@babylonjs/core/Physics/v2/physicsConstraint";
import type { PhysicsConstraint } from "@babylonjs/core/Physics/v2/physicsConstraint";
import type { Scene } from "@babylonjs/core/scene";
import type { SnakeConfig } from "../core/GameConfig";
import type { SnakeSegment } from "./SnakeSegment";

/**
 * Соединяет соседние сегменты шарниром (ball-and-socket).
 * Точка шарнира — середина зазора между сегментами; сегменты идут от головы в сторону -X.
 */
export class SegmentConnector {
  private readonly pivotOnParent: Vector3;
  private readonly pivotOnChild: Vector3;
  private readonly axis: Vector3 = Vector3.Up();

  public constructor(
    private readonly scene: Scene,
    config: SnakeConfig,
  ) {
    const pivotOffset = (config.segmentSize.length + config.segmentGap) / 2;
    this.pivotOnParent = new Vector3(-pivotOffset, 0, 0);
    this.pivotOnChild = new Vector3(pivotOffset, 0, 0);
  }

  public connect(parent: SnakeSegment, child: SnakeSegment): PhysicsConstraint {
    const constraint = new BallAndSocketConstraint(
      this.pivotOnParent,
      this.pivotOnChild,
      this.axis,
      this.axis,
      this.scene,
    );
    parent.body.addConstraint(child.body, constraint);
    return constraint;
  }
}
