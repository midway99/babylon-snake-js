import type { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import type { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";
import { StackPanel } from "@babylonjs/gui/2D/controls/stackPanel";
import type { UiConfig } from "../core/GameConfig";
import { GuiStyle } from "./GuiStyle";

/** Окно поздравления с прохождением трассы. Скрыто, пока змейка не доберётся до финиша. */
export class VictoryPanel {
  private readonly panel: Rectangle;

  public constructor(gui: AdvancedDynamicTexture, config: UiConfig) {
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

    const closeButton = GuiStyle.createButton("victoryClose", config.victoryCloseText, "#6ee07a", "#111");
    closeButton.paddingTop = "10px";
    closeButton.height = "46px";
    closeButton.onPointerClickObservable.add(this.hide);
    layout.addControl(closeButton);
  }

  public show(): void {
    this.panel.isVisible = true;
  }

  public dispose(): void {
    this.panel.dispose();
  }

  private readonly hide = (): void => {
    this.panel.isVisible = false;
  };
}
