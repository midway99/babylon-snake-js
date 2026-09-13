/** Объект, который каждый сегмент хранит в `mesh.metadata`. */
export interface SnakeSegmentMetadata {
  readonly id: string;
  /** Порядковый номер от головы (0) к хвосту. */
  readonly index: number;
}
