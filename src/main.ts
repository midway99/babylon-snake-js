import { Game } from "./core/Game";
import { gameConfig } from "./core/GameConfig";

async function bootstrap(): Promise<void> {
  const canvas = document.getElementById("renderCanvas");
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error("Canvas #renderCanvas not found");
  }

  const game = await Game.create(canvas, gameConfig);
  game.start();
}

bootstrap().catch((error: unknown) => {
  console.error(error);
});
