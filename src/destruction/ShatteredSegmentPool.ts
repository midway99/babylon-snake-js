import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Scene } from "@babylonjs/core/scene";
import type { DestructionConfig, SnakeConfig } from "../core/GameConfig";
import { ShardGrid } from "./ShardGrid";
import { ShatteredSegment } from "./ShatteredSegment";

/** Пул разбитых копий сегмента. Все меши и тела создаются при старте, во время игры ничего не аллоцируется. */
export class ShatteredSegmentPool {
  private readonly shardTemplate: Mesh;
  private readonly items: ShatteredSegment[] = [];

  public constructor(scene: Scene, snake: SnakeConfig, destruction: DestructionConfig) {
    const grid = new ShardGrid(snake, destruction);
    const size = grid.shardSize;

    // Шаблон только раздаёт геометрию клонам осколков и сам не отображается.
    this.shardTemplate = CreateBox("shardTemplate", { width: size.x, height: size.y, depth: size.z }, scene);
    this.shardTemplate.setEnabled(false);

    for (let index = 0; index < destruction.poolSize; index++) {
      this.items.push(new ShatteredSegment(scene, this.shardTemplate, grid, `shattered-${index}`));
    }
  }

  /** Возвращает свободную разбитую копию или `null`, если пул исчерпан. */
  public acquire(): ShatteredSegment | null {
    for (const item of this.items) {
      if (!item.isInUse) {
        return item;
      }
    }
    return null;
  }

  /** Прячет все осколки: пул снова полностью свободен. */
  public releaseAll(): void {
    for (const item of this.items) {
      item.release();
    }
  }

  public dispose(): void {
    for (const item of this.items) {
      item.dispose();
    }
    this.items.length = 0;
    this.shardTemplate.dispose();
  }
}
