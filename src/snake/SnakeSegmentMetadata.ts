import type { MeshMetadata } from "../core/MeshMetadata";

/** Объект, который каждый сегмент хранит в `mesh.metadata`. */
export interface SnakeSegmentMetadata extends MeshMetadata {
  /** Порядковый номер от головы (0) к хвосту. */
  readonly index: number;
}
