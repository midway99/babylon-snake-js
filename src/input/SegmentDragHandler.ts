import "@babylonjs/core/Culling/ray";
import { PointerDragBehavior } from "@babylonjs/core/Behaviors/Meshes/pointerDragBehavior";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { SnakeSegment } from "../snake/SnakeSegment";

/** Позволяет перетаскивать сегмент мышью; на время перетаскивания физика ведёт тело за трансформом меша. */
export class SegmentDragHandler {
  private readonly behavior: PointerDragBehavior;

  public constructor(private readonly segment: SnakeSegment) {
    // Змейка двигается по полу: сегмент перетаскивается в горизонтальной плоскости на своей высоте.
    this.behavior = new PointerDragBehavior({ dragPlaneNormal: Vector3.Up() });
    this.behavior.useObjectOrientationForDragging = false;
    this.behavior.onDragStartObservable.add(this.onDragStart);
    this.behavior.onDragEndObservable.add(this.onDragEnd);
    segment.mesh.addBehavior(this.behavior);
  }

  public dispose(): void {
    this.behavior.onDragStartObservable.removeCallback(this.onDragStart);
    this.behavior.onDragEndObservable.removeCallback(this.onDragEnd);
    this.segment.mesh.removeBehavior(this.behavior);
  }

  private readonly onDragStart = (): void => {
    this.segment.beginManualControl();
  };

  private readonly onDragEnd = (): void => {
    this.segment.endManualControl();
  };
}
