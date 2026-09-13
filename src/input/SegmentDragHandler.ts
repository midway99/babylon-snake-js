import "@babylonjs/core/Culling/ray";
import { PointerDragBehavior } from "@babylonjs/core/Behaviors/Meshes/pointerDragBehavior";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { SnakeSegment } from "../snake/SnakeSegment";

type DragOptions = PointerDragBehavior["options"];

/** Позволяет перетаскивать сегмент мышью; на время перетаскивания физика ведёт тело за трансформом меша. */
export class SegmentDragHandler {
  /** Змейка ползёт по полу: перетаскивание в горизонтальной плоскости на высоте сегмента. */
  private static readonly moveOptions: DragOptions = { dragPlaneNormal: Vector3.Up() };
  /** Подъём и опускание: перетаскивание только по вертикали. */
  private static readonly liftOptions: DragOptions = { dragAxis: Vector3.Up() };

  private readonly behavior: PointerDragBehavior = new PointerDragBehavior(SegmentDragHandler.moveOptions);

  public constructor(private readonly segment: SnakeSegment) {
    this.behavior.useObjectOrientationForDragging = false;
    this.behavior.onDragStartObservable.add(this.onDragStart);
    this.behavior.onDragEndObservable.add(this.onDragEnd);
    segment.mesh.addBehavior(this.behavior);
  }

  public setLiftMode(enabled: boolean): void {
    this.behavior.options = enabled ? SegmentDragHandler.liftOptions : SegmentDragHandler.moveOptions;
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
