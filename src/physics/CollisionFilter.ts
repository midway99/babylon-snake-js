import type { PhysicsShape } from "@babylonjs/core/Physics/v2/physicsShape";

/** Битовые группы коллизий Havok. */
export enum CollisionGroup {
  Ground = 1 << 0,
  SnakeSegment = 1 << 1,
  Debris = 1 << 2,
  FinishZone = 1 << 3,
}

/**
 * Пара масок фильтрации для шейпа. Havok сталкивает шейпы A и B, только если
 * `A.membership & B.collidesWith` и `B.membership & A.collidesWith` не равны нулю.
 */
export class CollisionFilter {
  public static readonly Ground = new CollisionFilter(
    CollisionGroup.Ground,
    CollisionGroup.SnakeSegment | CollisionGroup.Debris,
  );
  /** Сегменты сталкиваются с полом и финишной зоной (триггером), но не друг с другом. */
  public static readonly SnakeSegment = new CollisionFilter(
    CollisionGroup.SnakeSegment,
    CollisionGroup.Ground | CollisionGroup.FinishZone,
  );
  /** Осколки сталкиваются с полом и друг с другом, но не мешают целым сегментам. */
  public static readonly Debris = new CollisionFilter(
    CollisionGroup.Debris,
    CollisionGroup.Ground | CollisionGroup.Debris,
  );
  /** Финишная зона реагирует только на сегменты змейки. */
  public static readonly FinishZone = new CollisionFilter(CollisionGroup.FinishZone, CollisionGroup.SnakeSegment);
  /** Для выключенных тел: ни с чем не сталкиваются. */
  public static readonly None = new CollisionFilter(0, 0);

  private constructor(
    public readonly membership: number,
    public readonly collidesWith: number,
  ) {}

  public static isGround(shape: PhysicsShape | null): boolean {
    return shape !== null && (shape.filterMembershipMask & CollisionGroup.Ground) !== 0;
  }

  public applyTo(shape: PhysicsShape): void {
    shape.filterMembershipMask = this.membership;
    shape.filterCollideMask = this.collidesWith;
  }
}
