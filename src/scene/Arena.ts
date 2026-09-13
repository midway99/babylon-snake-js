import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { PhysicsShapeType } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import { PhysicsAggregate } from "@babylonjs/core/Physics/v2/physicsAggregate";
import type { Scene } from "@babylonjs/core/scene";
import type { ArenaConfig } from "../core/GameConfig";
import { CollisionFilter } from "../physics/CollisionFilter";

/** Окружение сцены: камера, свет и статичный пол с физическим телом. */
export class Arena {
  private readonly camera: ArcRotateCamera;
  private readonly light: HemisphericLight;
  private readonly ground: Mesh;
  private readonly groundMaterial: StandardMaterial;
  private readonly groundAggregate: PhysicsAggregate;

  public constructor(scene: Scene, canvas: HTMLCanvasElement, config: ArenaConfig) {
    const { alpha, beta, radius, target } = config.camera;
    this.camera = new ArcRotateCamera("camera", alpha, beta, radius, target.clone(), scene);
    this.camera.attachControl(canvas, true);

    this.light = new HemisphericLight("light", new Vector3(0.3, 1, -0.5), scene);

    this.groundMaterial = new StandardMaterial("groundMaterial", scene);
    this.groundMaterial.diffuseColor = config.groundColor;

    this.ground = CreateGround("ground", { width: config.groundSize, height: config.groundSize }, scene);
    this.ground.material = this.groundMaterial;
    this.groundAggregate = new PhysicsAggregate(this.ground, PhysicsShapeType.BOX, { mass: 0 }, scene);
    CollisionFilter.Ground.applyTo(this.groundAggregate.shape);
  }

  public dispose(): void {
    this.groundAggregate.dispose();
    this.ground.dispose();
    this.groundMaterial.dispose();
    this.light.dispose();
    this.camera.dispose();
  }
}
