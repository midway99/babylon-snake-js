import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import type { Scene } from "@babylonjs/core/scene";
import type { DestructionConfig } from "../core/GameConfig";
import type { PhysicsBoxEntity } from "../physics/PhysicsBoxEntity";
import { Shard } from "./Shard";
import type { ShardGrid } from "./ShardGrid";

/** Заранее собранная копия сегмента, разбитая на осколки. */
export class ShatteredSegment {
  private readonly shards: Shard[] = [];

  public constructor(scene: Scene, shardTemplate: Mesh, grid: ShardGrid, id: string) {
    for (let index = 0; index < grid.offsets.length; index++) {
      const mesh = shardTemplate.clone(`${id}-shard-${index}`);
      this.shards.push(new Shard(mesh, scene, grid.shardMass, grid.offsets[index]));
    }
  }

  public get isInUse(): boolean {
    return this.shards[0].isActive;
  }

  /** Подменяет исходный сегмент осколками, разлетающимися от его центра. */
  public burstFrom(source: PhysicsBoxEntity, plugin: HavokPlugin, config: DestructionConfig): void {
    for (const shard of this.shards) {
      shard.burstFrom(source, plugin, config);
    }
  }

  public dispose(): void {
    for (const shard of this.shards) {
      shard.dispose();
    }
    this.shards.length = 0;
  }
}
