import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import type { Scene } from "@babylonjs/core/scene";
import type { DestructionConfig } from "../core/GameConfig";
import { CollisionFilter } from "../physics/CollisionFilter";
import { PhysicsBoxEntity } from "../physics/PhysicsBoxEntity";

/** Осколок сегмента. Создаётся выключенным и включается только в момент разрушения. */
export class Shard extends PhysicsBoxEntity {
  // Общие временные векторы: осколки обрабатываются последовательно в одном потоке.
  private static readonly scratchOffset: Vector3 = new Vector3();
  private static readonly scratchPosition: Vector3 = new Vector3();

  public constructor(
    mesh: Mesh,
    scene: Scene,
    private readonly mass: number,
    private readonly localOffset: Vector3,
  ) {
    super(mesh, scene, { mass, collisionFilter: CollisionFilter.Debris });
    this.deactivate();
  }

  /** Ставит осколок на его место внутри исходного сегмента и отбрасывает от центра импульсом. */
  public burstFrom(source: PhysicsBoxEntity, plugin: HavokPlugin, config: DestructionConfig): void {
    const offset = Shard.scratchOffset;
    this.localOffset.rotateByQuaternionToRef(source.rotation, offset);
    source.mesh.position.addToRef(offset, Shard.scratchPosition);
    this.mesh.material = source.mesh.material;
    this.placeAt(Shard.scratchPosition, source.rotation, plugin);

    // Скорость направлена от центра сегмента; случайный множитель делает разлёт неравномерным.
    offset.normalize().scaleInPlace(config.scatterSpeed * (0.5 + Math.random()));
    offset.y += config.upwardSpeed;
    this.body.applyImpulse(offset.scaleInPlace(this.mass), this.mesh.position);
  }
}
