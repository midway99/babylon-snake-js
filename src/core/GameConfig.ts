import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

export interface SegmentSize {
  /** Размер вдоль оси змейки (X). */
  readonly length: number;
  readonly height: number;
  readonly width: number;
}

export interface SnakeConfig {
  readonly segmentCount: number;
  readonly segmentSize: SegmentSize;
  /** Зазор между соседними сегментами, чтобы коробки не пересекались. */
  readonly segmentGap: number;
  readonly segmentMass: number;
  /** Позиция головы; остальные сегменты выстраиваются в сторону -X. */
  readonly spawnPosition: Vector3;
  readonly headColor: Color3;
  readonly bodyColor: Color3;
  /** Одноразовый импульс в голову при старте, чтобы было видно работу соединений. */
  readonly startImpulse: Vector3;
}

export interface ArenaConfig {
  readonly groundSize: number;
  readonly groundColor: Color3;
}

export interface GameConfig {
  readonly gravity: Vector3;
  readonly arena: ArenaConfig;
  readonly snake: SnakeConfig;
}

export const gameConfig: GameConfig = {
  gravity: new Vector3(0, -9.81, 0),
  arena: {
    groundSize: 20,
    groundColor: new Color3(0.25, 0.27, 0.32),
  },
  snake: {
    segmentCount: 4,
    segmentSize: { length: 1, height: 0.5, width: 0.5 },
    segmentGap: 0.15,
    segmentMass: 1,
    spawnPosition: new Vector3(2, 2, 0),
    headColor: new Color3(0.9, 0.35, 0.2),
    bodyColor: new Color3(0.25, 0.75, 0.35),
    startImpulse: new Vector3(0, 4, 4),
  },
};
