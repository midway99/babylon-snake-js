import type { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import type { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";
import { StackPanel } from "@babylonjs/gui/2D/controls/stackPanel";
import type { UiConfig } from "../core/GameConfig";
import { GuiStyle } from "./GuiStyle";

/** Окно поздравления с прохождением трассы. Скрыто, пока змейка не доберётся до финиша. */
export class VictoryPanel {
  private readonly panel: Rectangle;

  public constructor(gui: AdvancedDynamicTexture, config: UiConfig, onRestart: () => void) {
    this.panel = GuiStyle.createPanel("victoryPanel");
    this.panel.width = "420px";
    this.panel.isVisible = false;
    gui.addControl(this.panel);

    const layout = new StackPanel("victoryLayout");
    layout.paddingTop = "18px";
    layout.paddingBottom = "20px";
    this.panel.addControl(layout);

    const title = GuiStyle.createText("victoryTitle", config.victoryTitle, 34);
    title.color = "#6ee07a";
    layout.addControl(title);
    layout.addControl(GuiStyle.createText("victoryMessage", config.victoryMessage, 18));

    const buttons = new StackPanel("victoryButtons");
    buttons.isVertical = false;
    buttons.height = "46px";
    buttons.spacing = 12;
    buttons.paddingTop = "10px";
    layout.addControl(buttons);

    const restartButton = GuiStyle.createButton("victoryRestart", config.victoryRestartText, "#6ee07a", "#111");
    restartButton.width = "150px";
    restartButton.onPointerClickObservable.add(onRestart);
    buttons.addControl(restartButton);

    const closeButton = GuiStyle.createButton("victoryClose", config.victoryCloseText, "#e8e8f0", "#111");
    closeButton.onPointerClickObservable.add(() => this.hide());
    buttons.addControl(closeButton);
  }

  public show(): void {
    this.panel.isVisible = true;
  }

  public hide(): void {
    this.panel.isVisible = false;
  }

  public dispose(): void {
    this.panel.dispose();
  }
}
