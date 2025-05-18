import { _decorator, Component, Node, director, game, Game } from 'cc';
import { CurrencyManager } from './CurrencyManager';
import { UIManager } from './UIManager';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    @property(CurrencyManager)
    currencyManager: CurrencyManager = null;
    
    @property(UIManager)
    uiManager: UIManager = null;
    
    private static _instance: GameManager = null;
    
    // Game version for save compatibility
    private static readonly GAME_VERSION = '1.0.0';
    
    // Time tracking
    private gameTime: number = 0;
    private lastUpdateTime: number = 0;
    
    onLoad() {
        // Create a singleton instance
        if (GameManager._instance !== null) {
            this.destroy();
            return;
        }
          GameManager._instance = this;
        director.addPersistRootNode(this.node);
        
        // Set up game events
        game.on(Game.EVENT_HIDE, this.onGameHide, this);
        game.on(Game.EVENT_SHOW, this.onGameShow, this);
    }
    
    start() {
        this.lastUpdateTime = Date.now();
    }

    update(deltaTime: number) {
        // Update game time
        this.gameTime += deltaTime;
        
        // Handle offline progress when the game is shown again
        const currentTime = Date.now();
        const deltaSeconds = (currentTime - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = currentTime;
        
        // Other global game updates can go here
    }
    
    // Get singleton instance
    public static getInstance(): GameManager {
        return GameManager._instance;
    }
    
    // Called when the game is hidden (app goes to background)
    private onGameHide() {
        // Save game state when the app is minimized or closed
        if (this.currencyManager) {
            // The CurrencyManager already handles saving in its methods
        }
    }
    
    // Called when the game is shown again (app comes to foreground)
    private onGameShow() {
        // Calculate offline progress
        const currentTime = Date.now();
        const offlineTime = (currentTime - this.lastUpdateTime) / 1000; // in seconds
        this.lastUpdateTime = currentTime;
        
        if (offlineTime > 5) { // Only process if more than 5 seconds have passed
            this.processOfflineProgress(offlineTime);
        }
    }
    
    // Process progress made while the game was closed
    private processOfflineProgress(offlineSeconds: number) {
        if (!this.currencyManager) return;
        
        // Calculate offline earnings based on passive income rates
        const offlineDilithium = this.currencyManager.getPassiveDilithium() * offlineSeconds;
        const offlineLunar = this.currencyManager.getPassiveLunar() * offlineSeconds;
        
        // Apply the offline earnings
        if (offlineDilithium > 0) {
            this.currencyManager.addDilithium(offlineDilithium);
        }
        
        if (offlineLunar > 0) {
            this.currencyManager.addLunar(offlineLunar);
        }
        
        // In the future, can add notifications or a welcome back screen with earnings summary
    }
    
    // Reset game (for testing or user-requested reset)
    public resetGame() {
        // Clear localStorage data
        try {
            localStorage.clear();
        } catch (e) {
            console.error('Failed to clear localStorage:', e);
        }
        
        // Reload the game
        director.loadScene(director.getScene().name);
    }
}


