import { Engine } from "@babylonjs/core/Engines/engine";
import type { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import { Scene } from "@babylonjs/core/scene";
import { ShatteredSegmentPool } from "../destruction/ShatteredSegmentPool";
import { SnakeDestruction } from "../destruction/SnakeDestruction";
import { SnakeDragController } from "../input/SnakeDragController";
import { HavokPhysicsLoader } from "../physics/HavokPhysicsLoader";
import { Arena } from "../scene/Arena";
import { Snake } from "../snake/Snake";
import type { GameConfig } from "./GameConfig";

/** Корневой объект игры: владеет движком, сценой и игровыми сущностями. */
export class Game {
  private readonly arena: Arena;
  private readonly snake: Snake;
  private readonly dragController: SnakeDragController;
  private readonly shatteredPool: ShatteredSegmentPool;
  private readonly destruction: SnakeDestruction;

  private constructor(
    private readonly engine: Engine,
    private readonly scene: Scene,
    plugin: HavokPlugin,
    config: GameConfig,
    canvas: HTMLCanvasElement,
  ) {
    this.arena = new Arena(scene, canvas, config.arena);
    this.snake = new Snake(scene, config.snake);
    this.dragController = new SnakeDragController(this.snake);
    this.shatteredPool = new ShatteredSegmentPool(scene, config.snake, config.destruction);
    this.destruction = new SnakeDestruction(scene, this.snake, this.shatteredPool, plugin, config.destruction);
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
    this.destruction.dispose();
    this.shatteredPool.dispose();
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
}
