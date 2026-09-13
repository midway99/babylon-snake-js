import type { Material } from "@babylonjs/core/Materials/material";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import type { Scene } from "@babylonjs/core/scene";
import type { ColorOptionConfig, GradientEffectConfig } from "../core/GameConfig";
import { RunningGradientMaterial } from "../materials/RunningGradientMaterial";

/** Цвет для перекраски меша в двух вариантах материала: однотонном и с бегущим градиентом. */
export class SelectableColor {
  private readonly plain: StandardMaterial;
  private readonly gradient: RunningGradientMaterial;

  public constructor(scene: Scene, option: ColorOptionConfig, effect: GradientEffectConfig, id: string) {
    this.plain = new StandardMaterial(`${id}-plain`, scene);
    this.plain.diffuseColor = option.color;
    this.gradient = new RunningGradientMaterial(`${id}-gradient`, scene, option.color, effect);
  }

  public getMaterial(useGradient: boolean): Material {
    return useGradient ? this.gradient : this.plain;
  }

  public owns(material: Material | null): boolean {
    return material === this.plain || material === this.gradient;
  }

  public dispose(): void {
    this.plain.dispose();
    this.gradient.dispose();
  }
}
