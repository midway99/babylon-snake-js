import type { Snake } from "../snake/Snake";
import type { SnakeSegment } from "../snake/SnakeSegment";
import { SegmentDragHandler } from "./SegmentDragHandler";
import type { SegmentDragListener } from "./SegmentDragHandler";

/**
 * Управляет перетаскиванием змейки за любой сегмент.
 * По полу остальные сегменты ползут за ведущим без инерции; пока зажат Shift, сегмент поднимается,
 * а остальные подчиняются обычной физике — провисают и падают.
 */
export class SnakeDragController implements SegmentDragListener {
  private readonly handlers: SegmentDragHandler[] = [];
  private liftMode = false;
  private leader: SnakeSegment | null = null;

  public constructor(private readonly snake: Snake) {
    for (const segment of snake.segments) {
      this.handlers.push(new SegmentDragHandler(segment, this));
    }
    window.addEventListener("keydown", this.onKeyChange);
    window.addEventListener("keyup", this.onKeyChange);
    window.addEventListener("blur", this.onBlur);
  }

  public onSegmentDragStart(segment: SnakeSegment): void {
    this.leader = segment;
    segment.beginManualControl();
    this.snake.setFollowersCrawling(segment, !this.liftMode);
  }

  public onSegmentDragEnd(): void {
    this.leader = null;
    this.snake.releaseToPhysics();
  }

  public cancelDrag(): void {
    for (const handler of this.handlers) {
      handler.cancelDrag();
    }
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
    if (this.leader !== null) {
      this.snake.setFollowersCrawling(this.leader, !enabled);
    }
  }

  private readonly onKeyChange = (event: KeyboardEvent): void => {
    this.setLiftMode(event.shiftKey);
  };

  private readonly onBlur = (): void => {
    this.setLiftMode(false);
  };
}
