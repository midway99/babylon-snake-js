import type { Scene } from "@babylonjs/core/scene";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import type { UiConfig } from "../core/GameConfig";
import { MeshColorPanel } from "./MeshColorPanel";
import { MeshSelector } from "./MeshSelector";
import { RestartButton } from "./RestartButton";
import { VictoryPanel } from "./VictoryPanel";

/** Экранный GUI игры: панель выбора цвета меша, кнопка рестарта и окно победы на одной полноэкранной текстуре. */
export class GameUi {
  private readonly gui: AdvancedDynamicTexture;
  private readonly selector: MeshSelector;
  private readonly colorPanel: MeshColorPanel;
  private readonly restartButton: RestartButton;
  private readonly victoryPanel: VictoryPanel;

  public constructor(scene: Scene, config: UiConfig, onRestart: () => void) {
    this.gui = AdvancedDynamicTexture.CreateFullscreenUI("gameUi", true, scene);
    this.selector = new MeshSelector(scene);
    this.colorPanel = new MeshColorPanel(scene, this.gui, this.selector, config);
    this.restartButton = new RestartButton(this.gui, config.restartText, onRestart);
    this.victoryPanel = new VictoryPanel(this.gui, config, onRestart);
  }

  public showVictory(): void {
    this.victoryPanel.show();
  }

  public hideVictory(): void {
    this.victoryPanel.hide();
  }

  public dispose(): void {
    this.victoryPanel.dispose();
    this.restartButton.dispose();
    this.colorPanel.dispose();
    this.selector.dispose();
    this.gui.dispose();
  }
}
