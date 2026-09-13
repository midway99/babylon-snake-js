import "@babylonjs/core/Culling/ray";
import { PointerDragBehavior } from "@babylonjs/core/Behaviors/Meshes/pointerDragBehavior";
import type { SnakeSegment } from "../snake/SnakeSegment";

/** Позволяет перетаскивать сегмент мышью и на время перетаскивания отключает его физику. */
export class SegmentDragHandler {
  private readonly behavior: PointerDragBehavior = new PointerDragBehavior();

  public constructor(private readonly segment: SnakeSegment) {
    // Плоскость перетаскивания смотрит на камеру и не вращается вместе с кувыркающимся сегментом.
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
