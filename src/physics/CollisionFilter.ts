import type { PhysicsShape } from "@babylonjs/core/Physics/v2/physicsShape";

/** Битовые группы коллизий Havok. */
export enum CollisionGroup {
  Ground = 1 << 0,
  SnakeSegment = 1 << 1,
}

/**
 * Пара масок фильтрации для шейпа. Havok сталкивает шейпы A и B, только если
 * `A.membership & B.collidesWith` и `B.membership & A.collidesWith` не равны нулю.
 */
export class CollisionFilter {
  public static readonly Ground = new CollisionFilter(CollisionGroup.Ground, CollisionGroup.SnakeSegment);
  /** Сегменты сталкиваются только с полом, но не друг с другом. */
  public static readonly SnakeSegment = new CollisionFilter(CollisionGroup.SnakeSegment, CollisionGroup.Ground);

  private constructor(
    public readonly membership: number,
    public readonly collidesWith: number,
  ) {}

  public applyTo(shape: PhysicsShape): void {
    shape.filterMembershipMask = this.membership;
    shape.filterCollideMask = this.collidesWith;
  }
}
