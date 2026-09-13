import type { Snake } from "../snake/Snake";
import { SegmentDragHandler } from "./SegmentDragHandler";

/** Делает перетаскиваемым каждый сегмент змейки. Пока зажат Shift, сегменты поднимаются и опускаются. */
export class SnakeDragController {
  private readonly handlers: SegmentDragHandler[] = [];
  private liftMode = false;

  public constructor(snake: Snake) {
    for (const segment of snake.segments) {
      this.handlers.push(new SegmentDragHandler(segment));
    }
    window.addEventListener("keydown", this.onKeyChange);
    window.addEventListener("keyup", this.onKeyChange);
    window.addEventListener("blur", this.onBlur);
  }

  public dispose(): void {
    window.removeEventListener("keydown", this.onKeyChange);
    window.removeEventListener("keyup", this.onKeyChange);
    window.removeEventListener("blur", this.onBlur);
    for (const handler of this.handlers) {
      handler.dispose();
    }
    this.handlers.length = 0;
  }

  private setLiftMode(enabled: boolean): void {
    if (this.liftMode === enabled) {
      return;
    }
    this.liftMode = enabled;
    for (const handler of this.handlers) {
      handler.setLiftMode(enabled);
    }
  }

  private readonly onKeyChange = (event: KeyboardEvent): void => {
    this.setLiftMode(event.shiftKey);
  };

  private readonly onBlur = (): void => {
    this.setLiftMode(false);
  };
}
