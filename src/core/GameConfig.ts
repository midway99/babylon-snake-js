import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

export interface SegmentSize {
  /** Размер вдоль оси змейки (X). */
  readonly length: number;
  readonly height: number;
  readonly width: number;
}

export interface SegmentJointConfig {
  /** Максимальный угол изгиба между соседними сегментами в горизонтальной плоскости, рад. */
  readonly maxBendAngle: number;
  /** Максимальный угол изгиба вверх-вниз, рад: поднятая змейка провисает, а не стоит жёстким столбом. */
  readonly maxPitchAngle: number;
  /** Сила мотора, который выпрямляет соединение; 0 — без выпрямления. */
  readonly straighteningForce: number;
}

export interface SnakeConfig {
  readonly segmentCount: number;
  readonly segmentSize: SegmentSize;
  /** Зазор между соседними сегментами, чтобы коробки не пересекались. */
  readonly segmentGap: number;
  readonly segmentMass: number;
  /** Гасит рывки и раскачивание сегментов. */
  readonly linearDamping: number;
  readonly angularDamping: number;
  readonly joint: SegmentJointConfig;
  /** Позиция головы; остальные сегменты выстраиваются в сторону -X. */
  readonly spawnPosition: Vector3;
  readonly headColor: Color3;
  readonly bodyColor: Color3;
}

export interface CameraConfig {
  readonly alpha: number;
  readonly beta: number;
  readonly radius: number;
  readonly target: Vector3;
}

export interface ArenaConfig {
  readonly groundSize: number;
  readonly groundColor: Color3;
  readonly camera: CameraConfig;
}

export interface ShardGridConfig {
  /** Число осколков вдоль каждой оси сегмента. */
  readonly alongLength: number;
  readonly alongHeight: number;
  readonly alongWidth: number;
}

export interface DestructionConfig {
  /** Сколько разбитых копий сегмента собрать заранее. */
  readonly poolSize: number;
  readonly shards: ShardGridConfig;
  /** Зазор между осколками, чтобы в момент появления они не пересекались. */
  readonly shardGap: number;
  /** Минимальный импульс удара о землю, при котором сегмент разбивается. */
  readonly impactImpulseThreshold: number;
  /** Средняя скорость разлёта осколка от центра сегмента, м/с. Импульс считается с учётом массы осколка. */
  readonly scatterSpeed: number;
  /** Дополнительная скорость осколка вверх, м/с. */
  readonly upwardSpeed: number;
}

export interface LaserSweepConfig {
  /** Максимальное смещение луча от базового положения. */
  readonly offset: Vector3;
  /** Период полного качания туда и обратно, с. */
  readonly periodSeconds: number;
}

export interface LaserConfig {
  readonly from: Vector3;
  readonly to: Vector3;
  /** Если задано, луч качается вдоль `offset` по синусоиде. */
  readonly sweep?: LaserSweepConfig;
}

export interface FinishZoneConfig {
  readonly position: Vector3;
  readonly size: number;
  readonly color: Color3;
  readonly alpha: number;
}

export interface CourseConfig {
  readonly laserColor: Color3;
  readonly lasers: ReadonlyArray<LaserConfig>;
  readonly finish: FinishZoneConfig;
}

export interface DustBurstConfig {
  readonly particleCount: number;
  readonly minSize: number;
  readonly maxSize: number;
  readonly minLifeTime: number;
  readonly maxLifeTime: number;
  readonly minEmitPower: number;
  readonly maxEmitPower: number;
}

export interface DustConfig {
  /** Сколько систем частиц собрать заранее; если все заняты, новый выброс пропускается. */
  readonly poolSize: number;
  readonly color: Color4;
  /** Цвет в конце жизни частицы: та же пыль, но прозрачная. */
  readonly fadeColor: Color4;
  /** Минимальный импульс начала контакта с землёй, чтобы поднять пыль при приземлении. */
  readonly landingImpulseThreshold: number;
  /** Сколько метров сегмент должен проползти по земле до следующего облачка пыли. */
  readonly travelDistancePerPuff: number;
  readonly contact: DustBurstConfig;
  readonly destruction: DustBurstConfig;
}

export interface ColorOptionConfig {
  readonly label: string;
  readonly color: Color3;
}

export interface GradientEffectConfig {
  /** Скорость бега полос, рад/с фазы синусоиды. */
  readonly speed: number;
  /** Плотность полос на единицу длины меша. */
  readonly stripeFrequency: number;
}

export interface UiConfig {
  /** Кнопки перекраски выбранного меша. */
  readonly colorOptions: ReadonlyArray<ColorOptionConfig>;
  /** Бегущий градиент шейдерного материала, который назначают кнопки цвета. */
  readonly colorEffect: GradientEffectConfig;
  readonly selectionLabel: string;
  /** Текст в поле, пока ни один меш не выбран. */
  readonly noSelectionText: string;
  readonly victoryTitle: string;
  readonly victoryMessage: string;
  readonly victoryCloseText: string;
}

export interface GameConfig {
  readonly gravity: Vector3;
  readonly arena: ArenaConfig;
  readonly snake: SnakeConfig;
  readonly destruction: DestructionConfig;
  readonly course: CourseConfig;
  readonly dust: DustConfig;
  readonly ui: UiConfig;
}

/** Высота лучей: середина сегмента, лежащего на полу. */
const laserHeight = 0.25;

export const gameConfig: GameConfig = {
  gravity: new Vector3(0, -9.81, 0),
  arena: {
    groundSize: 20,
    groundColor: new Color3(0.25, 0.27, 0.32),
    camera: { alpha: -Math.PI / 2, beta: 0.85, radius: 23, target: new Vector3(0, 0, 0.5) },
  },
  snake: {
    segmentCount: 4,
    segmentSize: { length: 1, height: 0.5, width: 0.5 },
    segmentGap: 0.15,
    segmentMass: 1,
    linearDamping: 1,
    angularDamping: 2,
    joint: {
      maxBendAngle: Math.PI / 4,
      maxPitchAngle: Math.PI / 2,
      straighteningForce: 25,
    },
    spawnPosition: new Vector3(1.5, 0.3, -7.5),
    headColor: new Color3(0.9, 0.35, 0.2),
    bodyColor: new Color3(0.25, 0.75, 0.35),
  },
  destruction: {
    poolSize: 4,
    shards: { alongLength: 3, alongHeight: 2, alongWidth: 2 },
    shardGap: 0.03,
    impactImpulseThreshold: 3,
    scatterSpeed: 2.5,
    upwardSpeed: 1.5,
  },
  // Слалом: неподвижные лучи от краёв арены оставляют проход попеременно справа и слева,
  // последний луч качается поперёк трассы — его нужно проходить, выбрав момент.
  course: {
    laserColor: new Color3(1, 0.15, 0.15),
    lasers: [
      { from: new Vector3(-10, laserHeight, -4.5), to: new Vector3(4, laserHeight, -4.5) },
      { from: new Vector3(-4, laserHeight, -1), to: new Vector3(10, laserHeight, -1) },
      { from: new Vector3(-10, laserHeight, 2.5), to: new Vector3(4, laserHeight, 2.5) },
      {
        from: new Vector3(-4, laserHeight, 5.5),
        to: new Vector3(4, laserHeight, 5.5),
        sweep: { offset: new Vector3(6, 0, 0), periodSeconds: 5 },
      },
    ],
    finish: {
      position: new Vector3(0, 1, 8.3),
      size: 2,
      color: new Color3(0.1, 0.9, 0.2),
      alpha: 0.5,
    },
  },
  dust: {
    poolSize: 32,
    color: new Color4(0.8, 0.74, 0.64, 0.75),
    fadeColor: new Color4(0.8, 0.74, 0.64, 0),
    landingImpulseThreshold: 0.2,
    travelDistancePerPuff: 1,
    contact: {
      particleCount: 16,
      minSize: 0.4,
      maxSize: 0.9,
      minLifeTime: 0.5,
      maxLifeTime: 1.1,
      minEmitPower: 0.4,
      maxEmitPower: 1.1,
    },
    destruction: {
      particleCount: 40,
      minSize: 0.5,
      maxSize: 1.2,
      minLifeTime: 0.8,
      maxLifeTime: 1.6,
      minEmitPower: 0.8,
      maxEmitPower: 2,
    },
  },
  ui: {
    colorOptions: [
      { label: "Красный", color: new Color3(0.9, 0.2, 0.2) },
      { label: "Синий", color: new Color3(0.2, 0.45, 0.95) },
    ],
    colorEffect: { speed: 4, stripeFrequency: 6 },
    selectionLabel: "Выбранный меш",
    noSelectionText: "кликните по сегменту",
    victoryTitle: "Финиш!",
    victoryMessage: "Поздравляем! Змейка добралась до финиша!",
    victoryCloseText: "Закрыть",
  },
};
