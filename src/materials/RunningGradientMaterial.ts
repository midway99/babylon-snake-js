import { ShaderMaterial } from "@babylonjs/core/Materials/shaderMaterial";
import type { Color3 } from "@babylonjs/core/Maths/math.color";
import type { Scene } from "@babylonjs/core/scene";
import type { GradientEffectConfig } from "../core/GameConfig";
import fragmentSource from "./shaders/runningGradient.fragment.glsl?raw";
import vertexSource from "./shaders/runningGradient.vertex.glsl?raw";

/** Шейдерный материал с бегущим градиентом: uniform `time` обновляется каждый кадр. */
export class RunningGradientMaterial extends ShaderMaterial {
  private elapsedSeconds = 0;

  public constructor(name: string, scene: Scene, color: Color3, effect: GradientEffectConfig) {
    super(
      name,
      scene,
      { vertexSource, fragmentSource },
      {
        attributes: ["position", "normal"],
        uniforms: ["world", "worldViewProjection", "time", "baseColor", "speed", "stripeFrequency"],
      },
    );
    this.setColor3("baseColor", color);
    this.setFloat("speed", effect.speed);
    this.setFloat("stripeFrequency", effect.stripeFrequency);
    this.setFloat("time", 0);
    scene.onBeforeRenderObservable.add(this.updateTime);
  }

  public override dispose(forceDisposeEffect?: boolean, forceDisposeTextures?: boolean, notBoundToMesh?: boolean): void {
    this.getScene().onBeforeRenderObservable.removeCallback(this.updateTime);
    super.dispose(forceDisposeEffect, forceDisposeTextures, notBoundToMesh);
  }

  private readonly updateTime = (): void => {
    this.elapsedSeconds += this.getScene().getEngine().getDeltaTime() / 1000;
    this.setFloat("time", this.elapsedSeconds);
  };
}
