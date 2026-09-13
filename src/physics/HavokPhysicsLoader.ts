import "@babylonjs/core/Physics/joinedPhysicsEngineComponent";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import type { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";
import HavokPhysics from "@babylonjs/havok";
import havokWasmUrl from "@babylonjs/havok/lib/esm/HavokPhysics.wasm?url";

/** Загружает WASM-модуль Havok и включает физику V2 на сцене. */
export class HavokPhysicsLoader {
  public async enable(scene: Scene, gravity: Vector3): Promise<HavokPlugin> {
    const havok = await HavokPhysics({ locateFile: () => havokWasmUrl });
    const plugin = new HavokPlugin(true, havok);

    if (!scene.enablePhysics(gravity, plugin)) {
      throw new Error("Failed to enable Havok physics");
    }
    return plugin;
  }
}
