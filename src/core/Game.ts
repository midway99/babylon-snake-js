import { Engine } from "@babylonjs/core/Engines/engine";
import type { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import { Scene } from "@babylonjs/core/scene";
import { FinishZone } from "../course/FinishZone";
import { LaserCourse } from "../course/LaserCourse";
import { GroundImpactDetector } from "../destruction/GroundImpactDetector";
import { SegmentShatterer } from "../destruction/SegmentShatterer";
import { ShatteredSegmentPool } from "../destruction/ShatteredSegmentPool";
import { DustParticlePool } from "../effects/DustParticlePool";
import { GroundDustEmitter } from "../effects/GroundDustEmitter";
import { KeyboardShortcut } from "../input/KeyboardShortcut";
import { SnakeDragController } from "../input/SnakeDragController";
import { HavokPhysicsLoader } from "../physics/HavokPhysicsLoader";
import { Arena } from "../scene/Arena";
import { Snake } from "../snake/Snake";
import { GameUi } from "../ui/GameUi";
import type { GameConfig } from "./GameConfig";

/** Корневой объект игры: создаёт сцену и все игровые сущности и связывает их между собой. */
export class Game {
  private readonly arena: Arena;
  private readonly snake: Snake;
  private readonly dragController: SnakeDragController;
  private readonly shatteredPool: ShatteredSegmentPool;
  private readonly dustPool: DustParticlePool;
  private readonly groundDustEmitter: GroundDustEmitter;
  private readonly groundImpactDetector: GroundImpactDetector;
  private readonly laserCourse: LaserCourse;
  private readonly finishZone: FinishZone;
  private readonly ui: GameUi;
  private readonly restartShortcut: KeyboardShortcut;

  private constructor(
    private readonly engine: Engine,
    private readonly scene: Scene,
    plugin: HavokPlugin,
    config: GameConfig,
    canvas: HTMLCanvasElement,
  ) {
    this.arena = new Arena(scene, canvas, config.arena);
    this.ui = new GameUi(scene, config.ui, this.restart);
    this.restartShortcut = new KeyboardShortcut(config.ui.restartKeyCode, this.restart);
    this.snake = new Snake(scene, plugin, config.snake);
    this.dragController = new SnakeDragController(this.snake);

    this.dustPool = new DustParticlePool(scene, config.dust);
    this.groundDustEmitter = new GroundDustEmitter(this.snake, this.dustPool, config.dust);

    this.shatteredPool = new ShatteredSegmentPool(scene, config.snake, config.destruction);
    const shatterer = new SegmentShatterer(
      this.snake,
      this.shatteredPool,
      plugin,
      config.destruction,
      this.dustPool,
      config.dust,
    );
    this.groundImpactDetector = new GroundImpactDetector(scene, this.snake, shatterer, config.destruction);

    this.laserCourse = new LaserCourse(scene, plugin, this.snake, shatterer, config.course);
    this.finishZone = new FinishZone(scene, plugin, config.course.finish, this.onFinishReached);
  }

  public static async create(canvas: HTMLCanvasElement, config: GameConfig): Promise<Game> {
    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);
    const plugin = await new HavokPhysicsLoader().enable(scene, config.gravity);
    return new Game(engine, scene, plugin, config, canvas);
  }

  public start(): void {
    window.addEventListener("resize", this.onResize);
    this.engine.runRenderLoop(this.renderFrame);
  }

  public dispose(): void {
    window.removeEventListener("resize", this.onResize);
    this.engine.stopRenderLoop(this.renderFrame);
    this.restartShortcut.dispose();
    this.ui.dispose();
    this.finishZone.dispose();
    this.laserCourse.dispose();
    this.groundImpactDetector.dispose();
    this.shatteredPool.dispose();
    this.groundDustEmitter.dispose();
    this.dustPool.dispose();
    this.dragController.dispose();
    this.snake.dispose();
    this.arena.dispose();
    this.scene.dispose();
    this.engine.dispose();
  }

  // Колбэки создаются один раз, чтобы не аллоцировать замыкания каждый кадр.
  private readonly renderFrame = (): void => {
    this.scene.render();
  };

  private readonly onResize = (): void => {
    this.engine.resize();
  };

  /** Возвращает змейку и трассу в начальное состояние. */
  private readonly restart = (): void => {
    this.dragController.cancelDrag();
    this.shatteredPool.releaseAll();
    this.snake.reset();
    this.groundDustEmitter.reset();
    this.finishZone.reset();
    this.ui.hideVictory();
  };

  private readonly onFinishReached = (): void => {
    this.ui.showVictory();
  };
}
