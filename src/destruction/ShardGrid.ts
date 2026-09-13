import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { DestructionConfig, SnakeConfig } from "../core/GameConfig";

/** Разбиение сегмента на одинаковые осколки: размер осколка, его масса и смещения от центра сегмента. */
export class ShardGrid {
  public readonly shardSize: Vector3;
  public readonly shardMass: number;
  public readonly offsets: ReadonlyArray<Vector3>;

  public constructor(snake: SnakeConfig, destruction: DestructionConfig) {
    const { alongLength, alongHeight, alongWidth } = destruction.shards;
    const { length, height, width } = snake.segmentSize;
    const cell = new Vector3(length / alongLength, height / alongHeight, width / alongWidth);
    const gap = destruction.shardGap;

    this.shardSize = new Vector3(cell.x - gap, cell.y - gap, cell.z - gap);
    this.shardMass = snake.segmentMass / (alongLength * alongHeight * alongWidth);
    this.offsets = ShardGrid.createOffsets(cell, alongLength, alongHeight, alongWidth);
  }

  private static createOffsets(cell: Vector3, countX: number, countY: number, countZ: number): Vector3[] {
    const offsets: Vector3[] = [];
    for (let x = 0; x < countX; x++) {
      for (let y = 0; y < countY; y++) {
        for (let z = 0; z < countZ; z++) {
          offsets.push(
            new Vector3(
              ShardGrid.cellCenter(x, countX, cell.x),
              ShardGrid.cellCenter(y, countY, cell.y),
              ShardGrid.cellCenter(z, countZ, cell.z),
            ),
          );
        }
      }
    }
    return offsets;
  }

  /** Центр ячейки `index` из `count` ячеек размера `size`, отсчитанный от центра сегмента. */
  private static cellCenter(index: number, count: number, size: number): number {
    return (index - (count - 1) / 2) * size;
  }
}
