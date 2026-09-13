import { Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { DeepImmutable } from "@babylonjs/core/types";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { PhysicsMotionType, PhysicsShapeType } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import { PhysicsAggregate } from "@babylonjs/core/Physics/v2/physicsAggregate";
import type { PhysicsBody } from "@babylonjs/core/Physics/v2/physicsBody";
import type { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import type { Scene } from "@babylonjs/core/scene";
import { CollisionFilter } from "./CollisionFilter";

export interface PhysicsBoxOptions {
  readonly mass: number;
  readonly collisionFilter: CollisionFilter;
}

/**
 * Меш с динамическим телом формы BOX, которое можно выключать и включать без пересоздания.
 * Выключенное тело остаётся в мире Havok (иначе теряются подписки на события),
 * но становится статичным и ни с чем не сталкивается, а меш скрывается.
 */
export class PhysicsBoxEntity {
  private static readonly zeroVector: Vector3 = Vector3.Zero();

  public readonly mesh: Mesh;
  /** Ориентация меша; физика пишет в этот же объект при синхронизации. */
  public readonly rotation: Quaternion;
  private readonly aggregate: PhysicsAggregate;
  private readonly collisionFilter: CollisionFilter;
  private active = true;

  /** Меш должен быть уже расположен: тело создаётся в его текущей позиции. */
  public constructor(mesh: Mesh, scene: Scene, options: PhysicsBoxOptions) {
    this.mesh = mesh;
    this.rotation = mesh.rotationQuaternion ??= Quaternion.Identity();
    this.collisionFilter = options.collisionFilter;
    this.aggregate = new PhysicsAggregate(mesh, PhysicsShapeType.BOX, { mass: options.mass }, scene);
    this.collisionFilter.applyTo(this.aggregate.shape);
  }

  public get body(): PhysicsBody {
    return this.aggregate.body;
  }

  public get isActive(): boolean {
    return this.active;
  }

  public activate(): void {
    if (this.active) {
      return;
    }
    this.active = true;
    this.mesh.setEnabled(true);
    this.body.setMotionType(PhysicsMotionType.DYNAMIC);
    this.collisionFilter.applyTo(this.aggregate.shape);
  }

  public deactivate(): void {
    if (!this.active) {
      return;
    }
    this.active = false;
    this.body.disablePreStep = true;
    this.resetVelocity();
    this.body.setMotionType(PhysicsMotionType.STATIC);
    CollisionFilter.None.applyTo(this.aggregate.shape);
    this.mesh.setEnabled(false);
  }

  /** Включает тело и мгновенно ставит его в заданную позицию и ориентацию без скорости. */
  public placeAt(position: DeepImmutable<Vector3>, rotation: DeepImmutable<Quaternion>, plugin: HavokPlugin): void {
    this.activate();
    this.mesh.position.copyFrom(position);
    this.rotation.copyFrom(rotation);
    this.teleportToMesh(plugin);
    this.resetVelocity();
  }

  /** Мгновенно переносит тело в текущую позицию и ориентацию меша, сохраняя его скорость. */
  private teleportToMesh(plugin: HavokPlugin): void {
    this.mesh.computeWorldMatrix(true);
    // Плагин переносит тело только при pre-step в режиме TELEPORT, который включает `disablePreStep = false`.
    this.body.disablePreStep = false;
    plugin.setPhysicsBodyTransformation(this.body, this.mesh);
    this.body.disablePreStep = true;
  }

  public resetVelocity(): void {
    this.body.setLinearVelocity(PhysicsBoxEntity.zeroVector);
    this.body.setAngularVelocity(PhysicsBoxEntity.zeroVector);
  }

  public dispose(): void {
    this.aggregate.dispose();
    this.mesh.dispose();
  }
}
