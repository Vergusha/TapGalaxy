import { _decorator, Component, Node, director, game, Game } from 'cc';
import { CurrencyManager } from './CurrencyManager';
import { UIManager } from './UIManager';
import { SaveManager } from './SaveManager';
import { NotificationManager } from './NotificationManager';
const { ccclass, property } = _decorator;

// Define the types for our upgrades to be used by the SaveManager
type MiningUpgrade = {
    name: string;
    level: number;
    baseCost: number;
    cost: number;
    effect: number;
    passiveIncome?: number;
    description?: string;
};

type TraderUpgrade = {
    name: string;
    level: number;
    baseCost: number;
    dilithiumCost: number;
    lunarReward: number;
    passiveIncome?: number;
    description?: string;
};

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
    
    // Upgrade storage (these will be populated by panel controllers)
    private miningUpgrades: MiningUpgrade[] = [];
    private traderUpgrades: TraderUpgrade[] = [];
    
    // Save timer - save every 30 seconds
    private saveTimer: number = 0;
    private readonly SAVE_INTERVAL: number = 30;
    
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
        
        // Try to load saved game data
        const saveManager = SaveManager.getInstance();
        if (saveManager.hasSaveData()) {
            if (saveManager.loadGame()) {
                // Get notification manager and show welcome back notification
                const notificationManager = NotificationManager.getInstance();
                if (notificationManager) {
                    notificationManager.showInfoNotification("Добро пожаловать в Tap Galaxy!", 3);
                }
            }
        } else {
            // Show welcome notification for new players
            const notificationManager = NotificationManager.getInstance();
            if (notificationManager) {
                notificationManager.showSuccessNotification("Добро пожаловать в Tap Galaxy! Нажимайте на планету, чтобы добывать дилитий.", 5);
            }
        }
    }

    update(deltaTime: number) {
        // Update game time
        this.gameTime += deltaTime;
        
        // Handle offline progress when the game is shown again
        const currentTime = Date.now();
        const deltaSeconds = (currentTime - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = currentTime;
        
        // Auto-save the game periodically
        this.saveTimer += deltaTime;
        if (this.saveTimer >= this.SAVE_INTERVAL) {
            this.saveTimer = 0;
            this.saveGame();
        }
    }
    
    // Get singleton instance
    public static getInstance(): GameManager {
        return GameManager._instance;
    }
    
    // Called when the game is hidden (app goes to background)
    private onGameHide() {
        // Save game state when the app is minimized or closed
        this.saveGame();
    }
    
    // Called when the game is shown again (app comes to foreground)
    private onGameShow() {
        // Load game data and calculate offline progress
        const saveManager = SaveManager.getInstance();
        saveManager.loadGame();
    }
      // Process progress made while the game was closed
    public applyOfflineProgress(offlineSeconds: number) {
        if (!this.currencyManager) return;
        
        // Calculate offline earnings based on passive income rates
        const offlineDilithium = this.currencyManager.getPassiveDilithium() * offlineSeconds;
        const offlineLunar = this.currencyManager.getPassiveLunar() * offlineSeconds;
        const offlineXenobit = this.currencyManager.getPassiveXenobit() * offlineSeconds;
        const offlineQuark = this.currencyManager.getPassiveQuark() * offlineSeconds;
        
        // Apply the offline earnings
        if (offlineDilithium > 0) {
            this.currencyManager.addDilithium(offlineDilithium);
        }
        
        if (offlineLunar > 0) {
            this.currencyManager.addLunar(offlineLunar);
        }
        
        if (offlineXenobit > 0) {
            this.currencyManager.addXenobit(offlineXenobit);
        }
        
        if (offlineQuark > 0) {
            this.currencyManager.addQuark(offlineQuark);
        }
        
        // Show notification about offline earnings
        const notificationManager = NotificationManager.getInstance();
        if (notificationManager) {
            const minutes = Math.floor(offlineSeconds / 60);
            const hours = Math.floor(minutes / 60);
            let timeAwayText = '';
            
            if (hours > 0) {
                timeAwayText = `${hours} ч ${minutes % 60} мин`;
            } else {
                timeAwayText = `${minutes} мин`;
            }
            
            // Format a message about earnings
            let earningsMessage = `Пока вас не было (${timeAwayText}):\n`;
            if (offlineDilithium > 0) {
                earningsMessage += `+${this.currencyManager.formatNumber(offlineDilithium)} дилития\n`;
            }
            if (offlineLunar > 0) {
                earningsMessage += `+${this.currencyManager.formatNumber(offlineLunar)} лунария\n`;
            }
            if (offlineXenobit > 0) {
                earningsMessage += `+${this.currencyManager.formatNumber(offlineXenobit)} ксенобитов\n`;
            }
            if (offlineQuark > 0) {
                earningsMessage += `+${this.currencyManager.formatNumber(offlineQuark)} кварков`;
            }
            
            notificationManager.showSuccessNotification(earningsMessage, 5);
        }
    }
    
    // Save the game
    public saveGame() {
        const saveManager = SaveManager.getInstance();
        return saveManager.saveGame();
    }
    
    // Reset game (for testing or user-requested reset)
    public resetGame() {
        // Clear saved data
        const saveManager = SaveManager.getInstance();
        saveManager.resetGame();
        
        // Reload the game
        director.loadScene(director.getScene().name);
    }
    
    // Mining upgrades getters and setters
    public getMiningUpgrades(): MiningUpgrade[] {
        return [...this.miningUpgrades]; // Return a copy
    }
    
    public setMiningUpgrades(upgrades: MiningUpgrade[]) {
        this.miningUpgrades = [...upgrades]; // Make a copy
    }
    
    // Trader upgrades getters and setters
    public getTraderUpgrades(): TraderUpgrade[] {
        return [...this.traderUpgrades]; // Return a copy
    }
    
    public setTraderUpgrades(upgrades: TraderUpgrade[]) {
        this.traderUpgrades = [...upgrades]; // Make a copy
    }
}


