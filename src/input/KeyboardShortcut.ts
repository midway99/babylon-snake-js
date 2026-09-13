/** Вызывает действие по нажатию клавиши. Клавиша задаётся физическим кодом, поэтому не зависит от раскладки. */
export class KeyboardShortcut {
  public constructor(
    private readonly keyCode: string,
    private readonly action: () => void,
  ) {
    window.addEventListener("keydown", this.onKeyDown);
  }

  public dispose(): void {
    window.removeEventListener("keydown", this.onKeyDown);
  }

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (event.code === this.keyCode && !event.repeat) {
      this.action();
    }
  };
}
