import type { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import type { Button } from "@babylonjs/gui/2D/controls/button";
import { Control } from "@babylonjs/gui/2D/controls/control";
import { GuiStyle } from "./GuiStyle";

/** Кнопка рестарта змейки в правом верхнем углу экрана. */
export class RestartButton {
  private readonly button: Button;

  public constructor(gui: AdvancedDynamicTexture, text: string, onRestart: () => void) {
    this.button = GuiStyle.createButton("restartButton", text, "#e8e8f0", "#111");
    this.button.width = "140px";
    this.button.top = "16px";
    this.button.left = "-16px";
    this.button.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    this.button.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.button.isPointerBlocker = true;
    this.button.onPointerClickObservable.add(onRestart);
    gui.addControl(this.button);
  }

  public dispose(): void {
    this.button.dispose();
  }
}
