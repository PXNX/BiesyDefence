/**
 * Heads-up Display (HUD) system
 * Manages in-game UI elements like health, currency, wave info
 */
export class HUD {
  private container!: HTMLElement;
  private healthElement!: HTMLElement;
  private currencyElement!: HTMLElement;
  private waveElement!: HTMLElement;
  private buildMenu!: HTMLElement;

  constructor() {
    this.createHUD();
  }

  private createHUD(): void {
    // Create main container
    this.container = document.createElement('div');
    this.container.id = 'hud-container';
    this.container.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 100;
      font-family: Arial, sans-serif;
    `;

    // Create health display
    this.healthElement = document.createElement('div');
    this.healthElement.id = 'health-display';
    this.healthElement.style.cssText = `
      position: absolute;
      top: 20px;
      left: 20px;
      color: white;
      font-size: 18px;
      background: rgba(0, 0, 0, 0.7);
      padding: 10px 15px;
      border-radius: 5px;
      pointer-events: auto;
    `;

    // Create currency display
    this.currencyElement = document.createElement('div');
    this.currencyElement.id = 'currency-display';
    this.currencyElement.style.cssText = `
      position: absolute;
      top: 20px;
      right: 20px;
      color: #ffd700;
      font-size: 18px;
      background: rgba(0, 0, 0, 0.7);
      padding: 10px 15px;
      border-radius: 5px;
      pointer-events: auto;
    `;

    // Create wave display
    this.waveElement = document.createElement('div');
    this.waveElement.id = 'wave-display';
    this.waveElement.style.cssText = `
      position: absolute;
      top: 20px;
      center: 0;
      left: 50%;
      transform: translateX(-50%);
      color: white;
      font-size: 20px;
      font-weight: bold;
      background: rgba(0, 0, 0, 0.7);
      padding: 10px 20px;
      border-radius: 5px;
      pointer-events: auto;
    `;

    // Add elements to container
    this.container.appendChild(this.healthElement);
    this.container.appendChild(this.currencyElement);
    this.container.appendChild(this.waveElement);

    // Add to DOM
    document.body.appendChild(this.container);
  }

  public updateHealth(health: number, maxHealth: number): void {
    this.healthElement.textContent = `❤️ ${health}/${maxHealth}`;
  }

  public updateCurrency(currency: number): void {
    this.currencyElement.textContent = `💰 ${currency}`;
  }

  public updateWave(waveNumber: number, totalWaves: number): void {
    this.waveElement.textContent = `Wave: ${waveNumber}/${totalWaves}`;
  }

  public showBuildMenu(): void {
    // TODO: Implement tower build menu
  }

  public hideBuildMenu(): void {
    // TODO: Hide tower build menu
  }

  public destroy(): void {
    this.container.remove();
  }
}