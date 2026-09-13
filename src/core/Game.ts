import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { HavokPhysicsLoader } from "../physics/HavokPhysicsLoader";
import { Arena } from "../scene/Arena";
import { Snake } from "../snake/Snake";
import type { GameConfig } from "./GameConfig";

/** Корневой объект игры: владеет движком, сценой и игровыми сущностями. */
export class Game {
  private readonly arena: Arena;
  private readonly snake: Snake;

  private constructor(
    private readonly engine: Engine,
    private readonly scene: Scene,
    private readonly config: GameConfig,
    canvas: HTMLCanvasElement,
  ) {
    this.arena = new Arena(scene, canvas, config.arena);
    this.snake = new Snake(scene, config.snake);
  }

  public static async create(canvas: HTMLCanvasElement, config: GameConfig): Promise<Game> {
    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);
    await new HavokPhysicsLoader().enable(scene, config.gravity);
    return new Game(engine, scene, config, canvas);
  }

  public start(): void {
    const head = this.snake.head;
    head.body.applyImpulse(this.config.snake.startImpulse, head.mesh.getAbsolutePosition());

    window.addEventListener("resize", this.onResize);
    this.engine.runRenderLoop(this.renderFrame);
  }

  public dispose(): void {
    window.removeEventListener("resize", this.onResize);
    this.engine.stopRenderLoop(this.renderFrame);
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
