import "@babylonjs/core/Culling/ray";
import type { PointerInfo } from "@babylonjs/core/Events/pointerEvents";
import { PointerEventTypes } from "@babylonjs/core/Events/pointerEvents";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Observable } from "@babylonjs/core/Misc/observable";
import type { Scene } from "@babylonjs/core/scene";
import { isMeshMetadata } from "../core/MeshMetadata";
import type { MeshMetadata } from "../core/MeshMetadata";

/** Выбор меша кликом: запоминает последний меш с идентификатором в `metadata`. */
export class MeshSelector {
  public readonly onSelectionChangedObservable: Observable<MeshMetadata> = new Observable<MeshMetadata>();
  private selected: AbstractMesh | null = null;

  public constructor(private readonly scene: Scene) {
    scene.onPointerObservable.add(this.onPointerDown, PointerEventTypes.POINTERDOWN);
  }

  public get selectedMesh(): AbstractMesh | null {
    return this.selected;
  }

  public dispose(): void {
    this.scene.onPointerObservable.removeCallback(this.onPointerDown);
    this.onSelectionChangedObservable.clear();
  }

  private readonly onPointerDown = (pointerInfo: PointerInfo): void => {
    const mesh = pointerInfo.pickInfo?.pickedMesh ?? null;
    // Клик по мешу без идентификатора (пол, финиш) не сбрасывает текущий выбор.
    if (mesh === null || !isMeshMetadata(mesh.metadata)) {
      return;
    }
    this.selected = mesh;
    this.onSelectionChangedObservable.notifyObservers(mesh.metadata);
  };
}
