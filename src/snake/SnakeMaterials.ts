import type { Material } from "@babylonjs/core/Materials/material";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import type { Color3 } from "@babylonjs/core/Maths/math.color";
import type { Scene } from "@babylonjs/core/scene";
import type { SnakeConfig } from "../core/GameConfig";

/** Общие материалы змейки: создаются один раз и разделяются между сегментами. */
export class SnakeMaterials {
  private readonly head: StandardMaterial;
  private readonly body: StandardMaterial;

  public constructor(scene: Scene, config: SnakeConfig) {
    this.head = SnakeMaterials.createMaterial("snakeHeadMaterial", config.headColor, scene);
    this.body = SnakeMaterials.createMaterial("snakeBodyMaterial", config.bodyColor, scene);
  }

  public getForSegment(index: number): Material {
    return index === 0 ? this.head : this.body;
  }

  public dispose(): void {
    this.head.dispose();
    this.body.dispose();
  }

  private static createMaterial(name: string, color: Color3, scene: Scene): StandardMaterial {
    const material = new StandardMaterial(name, scene);
    material.diffuseColor = color;
    return material;
  }
}
