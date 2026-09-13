import { Button } from "@babylonjs/gui/2D/controls/button";
import { Checkbox } from "@babylonjs/gui/2D/controls/checkbox";
import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";

/** Общий вид элементов GUI, чтобы панели не дублировали оформление. */
export class GuiStyle {
  public static readonly fontFamily = "system-ui, sans-serif";
  public static readonly textColor = "#e8e8f0";
  public static readonly panelBackground = "rgba(20, 20, 30, 0.8)";

  /** Полупрозрачная панель, которая не пропускает клики в сцену. */
  public static createPanel(name: string): Rectangle {
    const panel = new Rectangle(name);
    panel.adaptHeightToChildren = true;
    panel.thickness = 0;
    panel.cornerRadius = 8;
    panel.background = GuiStyle.panelBackground;
    panel.isPointerBlocker = true;
    return panel;
  }

  public static createText(name: string, text: string, fontSize: number): TextBlock {
    const block = new TextBlock(name, text);
    block.color = GuiStyle.textColor;
    block.fontFamily = GuiStyle.fontFamily;
    block.fontSize = fontSize;
    block.height = `${Math.round(fontSize * 1.6)}px`;
    return block;
  }

  public static createCheckbox(name: string, isChecked: boolean): Checkbox {
    const checkbox = new Checkbox(name);
    checkbox.width = "20px";
    checkbox.height = "20px";
    checkbox.isChecked = isChecked;
    checkbox.color = "#6ee07a";
    checkbox.background = "rgba(0, 0, 0, 0.35)";
    return checkbox;
  }

  public static createButton(name: string, text: string, background: string, textColor: string): Button {
    const button = Button.CreateSimpleButton(name, text);
    button.width = "120px";
    button.height = "36px";
    button.color = textColor;
    button.background = background;
    button.cornerRadius = 6;
    button.thickness = 0;
    button.fontFamily = GuiStyle.fontFamily;
    button.fontSize = 15;
    return button;
  }
}
