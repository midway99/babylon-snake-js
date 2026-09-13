import type { Snake } from "../snake/Snake";
import { SegmentDragHandler } from "./SegmentDragHandler";

/** Делает перетаскиваемым каждый сегмент змейки. */
export class SnakeDragController {
  private readonly handlers: SegmentDragHandler[] = [];

  public constructor(snake: Snake) {
    for (const segment of snake.segments) {
      this.handlers.push(new SegmentDragHandler(segment));
    }
  }

  public dispose(): void {
    for (const handler of this.handlers) {
      handler.dispose();
    }
    this.handlers.length = 0;
  }
}
