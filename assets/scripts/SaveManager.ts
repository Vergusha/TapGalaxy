import { _decorator, sys } from 'cc';
import { CurrencyManager } from './CurrencyManager';
import { GameManager } from './GameManager';

// Define the save data structure
interface SaveData {
    // Currency data
    dilithium: number;
    lunar: number;
    xenobit: number;
    quark: number;
    
    // Production rates
    dilithiumPerClick: number;
    dilithiumPerSecond: number;
    lunarPerSecond: number;
    xenobitPerSecond: number;
    quarkPerSecond: number;
    
    // Mining upgrades
    miningUpgrades: {
        name: string;
        level: number;
        baseCost: number;
        cost: number;
        description?: string;
    }[];
    
    // Trader upgrades
    traderUpgrades: {
        name: string;
        level: number;
        baseCost: number;
        dilithiumCost: number;
        lunarReward: number;
        passiveIncome?: number;
        description?: string;
    }[];
    
    // Last time the game was saved (for offline progress calculation)
    timestamp: number;
}

export class SaveManager {
    private static instance: SaveManager = null;
    private readonly SAVE_KEY = 'tap_galaxy_save_data';
    
    private constructor() {
        // Private constructor for singleton pattern
    }
    
    public static getInstance(): SaveManager {
        if (!SaveManager.instance) {
            SaveManager.instance = new SaveManager();
        }
        return SaveManager.instance;
    }
    
    // Save game data
    public saveGame(): boolean {
        try {
            const currencyManager = CurrencyManager.getInstance();
            const gameManager = GameManager.getInstance();
            
            // Create save data object
            const saveData: SaveData = {
                // Currencies
                dilithium: currencyManager.getDilithium(),
                lunar: currencyManager.getLunar(),
                xenobit: currencyManager.getXenobit(),
                quark: currencyManager.getQuark(),
                
                // Production rates
                dilithiumPerClick: currencyManager.getDilithiumPerClick(),
                dilithiumPerSecond: currencyManager.getPassiveDilithium(),
                lunarPerSecond: currencyManager.getPassiveLunar(),
                xenobitPerSecond: currencyManager.getPassiveXenobit(),
                quarkPerSecond: currencyManager.getPassiveQuark(),
                
                // Upgrades - we'll get these from the game manager
                miningUpgrades: gameManager.getMiningUpgrades(),
                traderUpgrades: gameManager.getTraderUpgrades(),
                
                // Timestamp for offline progress
                timestamp: Date.now()
            };
            
            // Save to local storage
            sys.localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
            console.log('Game saved successfully');
            return true;
        } catch (error) {
            console.error('Failed to save game:', error);
            return false;
        }
    }
    
    // Load game data
    public loadGame(): boolean {
        try {
            const savedData = sys.localStorage.getItem(this.SAVE_KEY);
            
            if (!savedData) {
                console.log('No saved game found');
                return false;
            }
            
            const saveData: SaveData = JSON.parse(savedData);
            const currencyManager = CurrencyManager.getInstance();
            const gameManager = GameManager.getInstance();
            
            // Load currencies
            currencyManager.setDilithium(saveData.dilithium);
            currencyManager.setLunar(saveData.lunar);
            currencyManager.setXenobit(saveData.xenobit);
            currencyManager.setQuark(saveData.quark);
            
            // Load production rates
            currencyManager.setDilithiumPerClick(saveData.dilithiumPerClick);
            currencyManager.setPassiveDilithium(saveData.dilithiumPerSecond);
            currencyManager.setPassiveLunar(saveData.lunarPerSecond);
            currencyManager.setPassiveXenobit(saveData.xenobitPerSecond);
            currencyManager.setPassiveQuark(saveData.quarkPerSecond);
            
            // Load upgrades
            gameManager.setMiningUpgrades(saveData.miningUpgrades);
            gameManager.setTraderUpgrades(saveData.traderUpgrades);
            
            // Calculate offline progress
            const currentTime = Date.now();
            const timeDiff = (currentTime - saveData.timestamp) / 1000; // Convert to seconds
            
            if (timeDiff > 5) { // Only apply if more than 5 seconds has passed
                gameManager.applyOfflineProgress(timeDiff);
            }
            
            console.log(`Game loaded successfully. Offline for ${timeDiff.toFixed(2)} seconds`);
            return true;
        } catch (error) {
            console.error('Failed to load game:', error);
            return false;
        }
    }
    
    // Reset game data (for debugging or player choice)
    public resetGame(): boolean {
        try {
            sys.localStorage.removeItem(this.SAVE_KEY);
            console.log('Game data reset successfully');
            return true;
        } catch (error) {
            console.error('Failed to reset game:', error);
            return false;
        }
    }
    
    // Check if a save exists
    public hasSaveData(): boolean {
        return !!sys.localStorage.getItem(this.SAVE_KEY);
    }
}
