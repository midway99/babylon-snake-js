import type { Material } from "@babylonjs/core/Materials/material";
import type { Scene } from "@babylonjs/core/scene";
import type { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { Control } from "@babylonjs/gui/2D/controls/control";
import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";
import { StackPanel } from "@babylonjs/gui/2D/controls/stackPanel";
import type { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import type { UiConfig } from "../core/GameConfig";
import type { MeshMetadata } from "../core/MeshMetadata";
import { GuiStyle } from "./GuiStyle";
import type { MeshSelector } from "./MeshSelector";
import { SelectableColor } from "./SelectableColor";

/**
 * Панель выбора цвета: поле с идентификатором выбранного меша, кнопки цвета и чекбокс градиента.
 * Кнопка назначает выбранному мешу однотонный материал или материал с бегущим градиентом —
 * в зависимости от чекбокса. Материалы создаются один раз, поэтому перекраска одного сегмента
 * не задевает остальные.
 */
export class MeshColorPanel {
  private readonly panel: Rectangle;
  private readonly idText: TextBlock;
  private readonly colors: SelectableColor[] = [];
  private useGradient: boolean;

  public constructor(
    scene: Scene,
    gui: AdvancedDynamicTexture,
    private readonly selector: MeshSelector,
    config: UiConfig,
  ) {
    this.useGradient = config.gradientEnabledByDefault;

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
    layout.addControl(this.createColorButtons(scene, config));
    layout.addControl(this.createGradientToggle(config.gradientToggleLabel));

    selector.onSelectionChangedObservable.add(this.onSelectionChanged);
  }

  public dispose(): void {
    this.selector.onSelectionChangedObservable.removeCallback(this.onSelectionChanged);
    this.panel.dispose();
    for (const color of this.colors) {
      color.dispose();
    }
    this.colors.length = 0;
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

  private createColorButtons(scene: Scene, config: UiConfig): StackPanel {
    const row = new StackPanel("colorButtons");
    row.isVertical = false;
    row.height = "44px";
    row.spacing = 10;
    row.paddingTop = "8px";
    for (let index = 0; index < config.colorOptions.length; index++) {
      const option = config.colorOptions[index];
      const color = new SelectableColor(scene, option, config.colorEffect, `selectableColor-${index}`);
      this.colors.push(color);

      const button = GuiStyle.createButton(`colorButton-${index}`, option.label, option.color.toHexString(), "#111");
      // Колбэк создаётся один раз при сборке панели.
      button.onPointerClickObservable.add(() => this.applyColor(color));
      row.addControl(button);
    }
    return row;
  }

  private createGradientToggle(label: string): StackPanel {
    const row = new StackPanel("gradientToggle");
    row.isVertical = false;
    row.height = "34px";
    row.spacing = 8;
    row.paddingTop = "8px";

    const checkbox = GuiStyle.createCheckbox("gradientCheckbox", this.useGradient);
    checkbox.onIsCheckedChangedObservable.add(this.onGradientToggled);
    row.addControl(checkbox);

    const text = GuiStyle.createText("gradientLabel", label, 15);
    text.width = "90px";
    text.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    row.addControl(text);
    return row;
  }

  private applyColor(color: SelectableColor): void {
    const mesh = this.selector.selectedMesh;
    if (mesh !== null) {
      mesh.material = color.getMaterial(this.useGradient);
    }
  }

  private findColorOf(material: Material | null): SelectableColor | null {
    for (const color of this.colors) {
      if (color.owns(material)) {
        return color;
      }
    }
    return null;
  }

  private readonly onGradientToggled = (isChecked: boolean): void => {
    this.useGradient = isChecked;
    // Если выбранный меш уже перекрашен кнопкой, сразу переключаем его на нужный вариант материала.
    const mesh = this.selector.selectedMesh;
    const color = mesh === null ? null : this.findColorOf(mesh.material);
    if (color !== null) {
      this.applyColor(color);
    }
  };

  private readonly onSelectionChanged = (metadata: MeshMetadata): void => {
    this.idText.text = metadata.id;
  };
}
