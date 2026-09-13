import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import {
  PhysicsConstraintAxis,
  PhysicsConstraintMotorType,
} from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import { Physics6DoFConstraint } from "@babylonjs/core/Physics/v2/physicsConstraint";
import type { Physics6DoFLimit, PhysicsConstraint } from "@babylonjs/core/Physics/v2/physicsConstraint";
import type { Scene } from "@babylonjs/core/scene";
import type { SegmentJointConfig, SnakeConfig } from "../core/GameConfig";
import type { SnakeSegment } from "./SnakeSegment";

/**
 * Соединяет соседние сегменты 6DoF-соединением, которое разрешает только изгиб
 * в горизонтальной плоскости в пределах `maxBendAngle` и изгиб вверх-вниз в пределах `maxPitchAngle`.
 * Сдвиг и кручение вдоль змейки заблокированы, поэтому змейка
 * не перекручивается и не складывается. Точка соединения — середина зазора; сегменты идут от головы в сторону -X.
 */
export class SegmentConnector {
  private static readonly bendAxis = PhysicsConstraintAxis.ANGULAR_Y;

  private readonly pivotOnParent: Vector3;
  private readonly pivotOnChild: Vector3;
  // Оси кадра соединения: X — вдоль змейки, Y — вертикаль (ось изгиба).
  private readonly mainAxis: Vector3 = Vector3.Right();
  private readonly perpendicularAxis: Vector3 = Vector3.Up();
  private readonly limits: Physics6DoFLimit[];
  private readonly straighteningForce: number;

  public constructor(
    private readonly scene: Scene,
    config: SnakeConfig,
  ) {
    const pivotOffset = (config.segmentSize.length + config.segmentGap) / 2;
    this.pivotOnParent = new Vector3(-pivotOffset, 0, 0);
    this.pivotOnChild = new Vector3(pivotOffset, 0, 0);
    this.limits = SegmentConnector.createLimits(config.joint);
    this.straighteningForce = config.joint.straighteningForce;
  }

  public connect(parent: SnakeSegment, child: SnakeSegment): PhysicsConstraint {
    const constraint = new Physics6DoFConstraint(
      {
        pivotA: this.pivotOnParent,
        pivotB: this.pivotOnChild,
        axisA: this.mainAxis,
        axisB: this.mainAxis,
        perpAxisA: this.perpendicularAxis,
        perpAxisB: this.perpendicularAxis,
      },
      this.limits,
      this.scene,
    );
    // Havok создаёт соединение только при добавлении к телу, поэтому мотор настраивается после.
    parent.body.addConstraint(child.body, constraint);
    this.addStraighteningMotor(constraint);
    return constraint;
  }

  private static createLimits(joint: SegmentJointConfig): Physics6DoFLimit[] {
    return [
      { axis: PhysicsConstraintAxis.LINEAR_X, minLimit: 0, maxLimit: 0 },
      { axis: PhysicsConstraintAxis.LINEAR_Y, minLimit: 0, maxLimit: 0 },
      { axis: PhysicsConstraintAxis.LINEAR_Z, minLimit: 0, maxLimit: 0 },
      { axis: PhysicsConstraintAxis.ANGULAR_X, minLimit: 0, maxLimit: 0 },
      { axis: PhysicsConstraintAxis.ANGULAR_Z, minLimit: -joint.maxPitchAngle, maxLimit: joint.maxPitchAngle },
      { axis: SegmentConnector.bendAxis, minLimit: -joint.maxBendAngle, maxLimit: joint.maxBendAngle },
    ];
  }

  private addStraighteningMotor(constraint: Physics6DoFConstraint): void {
    if (this.straighteningForce <= 0) {
      return;
    }
    constraint.setAxisMotorType(SegmentConnector.bendAxis, PhysicsConstraintMotorType.POSITION);
    constraint.setAxisMotorTarget(SegmentConnector.bendAxis, 0);
    constraint.setAxisMotorMaxForce(SegmentConnector.bendAxis, this.straighteningForce);
  }
}
