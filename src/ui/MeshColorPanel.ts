import type { Material } from "@babylonjs/core/Materials/material";
import type { Scene } from "@babylonjs/core/scene";
import type { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { Control } from "@babylonjs/gui/2D/controls/control";
import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";
import { StackPanel } from "@babylonjs/gui/2D/controls/stackPanel";
import type { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import type { ColorOptionConfig, GradientEffectConfig, UiConfig } from "../core/GameConfig";
import type { MeshMetadata } from "../core/MeshMetadata";
import { RunningGradientMaterial } from "../materials/RunningGradientMaterial";
import { GuiStyle } from "./GuiStyle";
import type { MeshSelector } from "./MeshSelector";

/**
 * Панель выбора цвета: поле с идентификатором выбранного меша и кнопки, назначающие ему материал.
 * Кнопки назначают шейдерный материал с бегущим градиентом. Материалы создаются один раз,
 * поэтому перекраска одного сегмента не задевает остальные.
 */
export class MeshColorPanel {
  private readonly panel: Rectangle;
  private readonly idText: TextBlock;
  private readonly materials: RunningGradientMaterial[] = [];

  public constructor(
    scene: Scene,
    gui: AdvancedDynamicTexture,
    private readonly selector: MeshSelector,
    config: UiConfig,
  ) {
    this.panel = GuiStyle.createPanel("meshColorPanel");
    this.panel.width = "290px";
    this.panel.left = "16px";
    this.panel.top = "16px";
    this.panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    gui.addControl(this.panel);

    const layout = new StackPanel("meshColorLayout");
    layout.paddingTop = "10px";
    layout.paddingBottom = "12px";
    this.panel.addControl(layout);

    layout.addControl(GuiStyle.createText("selectionLabel", config.selectionLabel, 14));
    this.idText = GuiStyle.createText("selectedMeshId", config.noSelectionText, 16);
    layout.addControl(MeshColorPanel.createField(this.idText));
    layout.addControl(this.createColorButtons(scene, config.colorOptions, config.colorEffect));

    selector.onSelectionChangedObservable.add(this.onSelectionChanged);
  }

  public dispose(): void {
    this.selector.onSelectionChangedObservable.removeCallback(this.onSelectionChanged);
    this.panel.dispose();
    for (const material of this.materials) {
      material.dispose();
    }
    this.materials.length = 0;
  }

  private static createField(text: TextBlock): Rectangle {
    const field = new Rectangle("selectedMeshField");
    field.width = "250px";
    field.height = "34px";
    field.paddingBottom = "4px";
    field.thickness = 1;
    field.color = "#8a8aa0";
    field.cornerRadius = 4;
    field.background = "rgba(0, 0, 0, 0.35)";
    field.addControl(text);
    return field;
  }

  private createColorButtons(
    scene: Scene,
    options: ReadonlyArray<ColorOptionConfig>,
    effect: GradientEffectConfig,
  ): StackPanel {
    const row = new StackPanel("colorButtons");
    row.isVertical = false;
    row.height = "44px";
    row.spacing = 10;
    row.paddingTop = "8px";
    for (let index = 0; index < options.length; index++) {
      row.addControl(this.createColorButton(scene, options[index], effect, index));
    }
    return row;
  }

  private createColorButton(
    scene: Scene,
    option: ColorOptionConfig,
    effect: GradientEffectConfig,
    index: number,
  ): Rectangle {
    const material = new RunningGradientMaterial(`selectableColor-${index}`, scene, option.color, effect);
    this.materials.push(material);

    const button = GuiStyle.createButton(`colorButton-${index}`, option.label, option.color.toHexString(), "#111");
    // Колбэк создаётся один раз при сборке панели.
    button.onPointerClickObservable.add(() => this.applyMaterial(material));
    return button;
  }

  private applyMaterial(material: Material): void {
    const mesh = this.selector.selectedMesh;
    if (mesh !== null) {
      mesh.material = material;
    }
  }

  private readonly onSelectionChanged = (metadata: MeshMetadata): void => {
    this.idText.text = metadata.id;
  };
}
