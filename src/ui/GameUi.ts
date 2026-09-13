import type { Scene } from "@babylonjs/core/scene";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import type { UiConfig } from "../core/GameConfig";
import { MeshColorPanel } from "./MeshColorPanel";
import { MeshSelector } from "./MeshSelector";
import { VictoryPanel } from "./VictoryPanel";

/** Экранный GUI игры: панель выбора цвета меша и окно победы на одной полноэкранной текстуре. */
export class GameUi {
  private readonly gui: AdvancedDynamicTexture;
  private readonly selector: MeshSelector;
  private readonly colorPanel: MeshColorPanel;
  private readonly victoryPanel: VictoryPanel;

  public constructor(scene: Scene, config: UiConfig) {
    this.gui = AdvancedDynamicTexture.CreateFullscreenUI("gameUi", true, scene);
    this.selector = new MeshSelector(scene);
    this.colorPanel = new MeshColorPanel(scene, this.gui, this.selector, config);
    this.victoryPanel = new VictoryPanel(this.gui, config);
  }

  public showVictory(): void {
    this.victoryPanel.show();
  }

  public dispose(): void {
    this.victoryPanel.dispose();
    this.colorPanel.dispose();
    this.selector.dispose();
    this.gui.dispose();
  }
}
