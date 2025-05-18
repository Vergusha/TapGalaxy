import { _decorator, Component, Node, Label, director, sys } from 'cc';
const { ccclass, property } = _decorator;

// Event system for currency updates
export class CurrencyEvents {
    private static handlers: {[eventName: string]: Function[]} = {};
    
    static on(eventName: string, handler: Function, target?: any) {
        if (!this.handlers[eventName]) {
            this.handlers[eventName] = [];
        }
        handler = target ? handler.bind(target) : handler;
        this.handlers[eventName].push(handler);
    }
    
    static off(eventName: string, handler: Function, target?: any) {
        if (!this.handlers[eventName]) return;
        
        const idx = this.handlers[eventName].indexOf(handler);
        if (idx !== -1) {
            this.handlers[eventName].splice(idx, 1);
        }
    }
    
    static emit(eventName: string, ...args: any[]) {
        if (!this.handlers[eventName]) return;
        
        for (const handler of this.handlers[eventName]) {
            handler(...args);
        }
    }
}

@ccclass('CurrencyManager')
export class CurrencyManager extends Component {
    @property(Label)
    dilithiumLabel: Label = null;
    
    @property(Label)
    lunarLabel: Label = null;
    
    @property(Label)
    xenobitLabel: Label = null;
    
    @property(Label)
    quarkLabel: Label = null;
    
    // Default currency amounts
    private dilithium: number = 0;
    private lunar: number = 0;
    private xenobit: number = 0;
    private quark: number = 0;
    
    // Multipliers for production
    private dilithiumMultiplier: number = 1;
    private lunarMultiplier: number = 1;
    private xenobitMultiplier: number = 1;
    private quarkMultiplier: number = 1;

    // Base amounts per click
    private dilithiumPerClick: number = 1;
    private lunarPerClick: number = 0;
    private xenobitPerClick: number = 0;
    private quarkPerClick: number = 0;

    // Passive generation amounts per second
    private passiveDilithium: number = 0;
    private passiveLunar: number = 0;
    private passiveXenobit: number = 0;
    private passiveQuark: number = 0;

    // Static instance for global access
    private static _instance: CurrencyManager = null;
    
    // Save key for local storage
    private static readonly SAVE_KEY = 'tap_galaxy_save';
    
    // Timer for passive income calculation
    private passiveTimer: number = 0;

    onLoad() {
        // Create a singleton instance
        if (CurrencyManager._instance !== null) {
            this.destroy();
            return;
        }
        CurrencyManager._instance = this;
        director.addPersistRootNode(this.node);
        
        // Load saved data if available
        this.loadGame();
    }
    
    start() {
        // Update UI with initial values
        this.updateCurrencyDisplay();
    }

    update(deltaTime: number) {
        // Handle passive income generation
        this.passiveTimer += deltaTime;
        if (this.passiveTimer >= 1) { // Every second
            this.passiveTimer = 0;
            this.generatePassiveIncome();
        }
    }
    
    // Get singleton instance
    public static getInstance(): CurrencyManager {
        return CurrencyManager._instance;
    }
    
    // Currency getters and setters
    public getDilithium(): number {
        return this.dilithium;
    }
    
    public setDilithium(value: number) {
        this.dilithium = value;
        this.updateCurrencyDisplay();
        this.saveGame();
        CurrencyEvents.emit('dilithiumChanged', this.dilithium);
    }
    
    public addDilithium(amount: number) {
        this.dilithium += amount * this.dilithiumMultiplier;
        this.updateCurrencyDisplay();
        this.saveGame();
        CurrencyEvents.emit('dilithiumChanged', this.dilithium);
    }
    
    public getLunar(): number {
        return this.lunar;
    }
    
    public setLunar(value: number) {
        this.lunar = value;
        this.updateCurrencyDisplay();
        this.saveGame();
        CurrencyEvents.emit('lunarChanged', this.lunar);
    }
    
    public addLunar(amount: number) {
        this.lunar += amount * this.lunarMultiplier;
        this.updateCurrencyDisplay();
        this.saveGame();
        CurrencyEvents.emit('lunarChanged', this.lunar);
    }
    
    public getXenobit(): number {
        return this.xenobit;
    }
    
    public setXenobit(value: number) {
        this.xenobit = value;
        this.updateCurrencyDisplay();
        this.saveGame();
        CurrencyEvents.emit('xenobitChanged', this.xenobit);
    }
    
    public addXenobit(amount: number) {
        this.xenobit += amount * this.xenobitMultiplier;
        this.updateCurrencyDisplay();
        this.saveGame();
        CurrencyEvents.emit('xenobitChanged', this.xenobit);
    }
    
    public getQuark(): number {
        return this.quark;
    }
    
    public setQuark(value: number) {
        this.quark = value;
        this.updateCurrencyDisplay();
        this.saveGame();
        CurrencyEvents.emit('quarkChanged', this.quark);
    }
    
    public addQuark(amount: number) {
        this.quark += amount * this.quarkMultiplier;
        this.updateCurrencyDisplay();
        this.saveGame();
        CurrencyEvents.emit('quarkChanged', this.quark);
    }
    
    // Multiplier getters and setters
    public getDilithiumMultiplier(): number {
        return this.dilithiumMultiplier;
    }
    
    public setDilithiumMultiplier(value: number) {
        this.dilithiumMultiplier = value;
        this.saveGame();
    }
    
    // Currency per click getters and setters
    public getDilithiumPerClick(): number {
        return this.dilithiumPerClick;
    }
    
    public setDilithiumPerClick(value: number) {
        this.dilithiumPerClick = value;
        this.saveGame();
    }
    
    // Passive income getters and setters
    public getPassiveDilithium(): number {
        return this.passiveDilithium;
    }
    
    public setPassiveDilithium(value: number) {
        this.passiveDilithium = value;
        this.saveGame();
    }
      public getPassiveLunar(): number {
        return this.passiveLunar;
    }
    
    public setPassiveLunar(value: number) {
        this.passiveLunar = value;
        this.saveGame();
    }
    
    public getPassiveXenobit(): number {
        return this.passiveXenobit;
    }
    
    public setPassiveXenobit(value: number) {
        this.passiveXenobit = value;
        this.saveGame();
    }
    
    public getPassiveQuark(): number {
        return this.passiveQuark;
    }
    
    public setPassiveQuark(value: number) {
        this.passiveQuark = value;
        this.saveGame();
    }
    
    // Generate passive income for all currencies
    private generatePassiveIncome() {
        if (this.passiveDilithium > 0) {
            this.addDilithium(this.passiveDilithium);
        }
        
        if (this.passiveLunar > 0) {
            this.addLunar(this.passiveLunar);
        }
        
        if (this.passiveXenobit > 0) {
            this.addXenobit(this.passiveXenobit);
        }
        
        if (this.passiveQuark > 0) {
            this.addQuark(this.passiveQuark);
        }
    }
    
    // Update UI display
    private updateCurrencyDisplay() {
        if (this.dilithiumLabel) {
            this.dilithiumLabel.string = this.formatNumber(this.dilithium);
        }
        
        if (this.lunarLabel) {
            this.lunarLabel.string = this.formatNumber(this.lunar);
        }
        
        if (this.xenobitLabel) {
            this.xenobitLabel.string = this.formatNumber(this.xenobit);
        }
        
        if (this.quarkLabel) {
            this.quarkLabel.string = this.formatNumber(this.quark);
        }    }
    
    // Format large numbers with suffixes (K, M, B, etc.)
    public formatNumber(num: number): string {
        if (num < 1000) return Math.floor(num).toString();
        
        const suffixes = ['', 'K', 'M', 'B', 'T'];
        const alphabetSuffixes: string[] = [];
        
        // Generate alphabetical suffixes: aa-az, ba-bz, etc.
        for (let firstChar = 97; firstChar <= 122; firstChar++) {
            for (let secondChar = 97; secondChar <= 122; secondChar++) {
                alphabetSuffixes.push(String.fromCharCode(firstChar) + String.fromCharCode(secondChar));
            }
        }
        
        // Combine all suffixes
        const allSuffixes = [...suffixes, ...alphabetSuffixes];
        
        // Calculate exponent (powers of 1000): 0 = ones, 1 = thousands, 2 = millions, etc.
        const exponent = Math.floor(Math.log(num) / Math.log(1000));
        
        // If the exponent is too large, just return scientific notation
        if (exponent >= allSuffixes.length) {
            return num.toExponential(2);
        }
        
        // Get the suffix and calculate the mantissa (the number part)
        const suffix = allSuffixes[exponent];
        const mantissa = num / Math.pow(1000, exponent);
        
        // Format mantissa to have at most 3 significant digits
        let formattedMantissa: string;
        if (mantissa >= 100) {
            formattedMantissa = mantissa.toFixed(0);
        } else if (mantissa >= 10) {
            formattedMantissa = mantissa.toFixed(1);
        } else {
            formattedMantissa = mantissa.toFixed(2);
        }
        
        // Remove trailing zeros after decimal point
        formattedMantissa = formattedMantissa.replace(/\.0+$|(\.\d*[1-9])0+$/, '$1');
        
        return formattedMantissa + suffix;
    }
    
    // Save game data to local storage
    private saveGame() {
        const saveData = {
            dilithium: this.dilithium,
            lunar: this.lunar,
            xenobit: this.xenobit,
            quark: this.quark,
            dilithiumMultiplier: this.dilithiumMultiplier,
            lunarMultiplier: this.lunarMultiplier,
            xenobitMultiplier: this.xenobitMultiplier,
            quarkMultiplier: this.quarkMultiplier,
            dilithiumPerClick: this.dilithiumPerClick,
            lunarPerClick: this.lunarPerClick,
            xenobitPerClick: this.xenobitPerClick,
            quarkPerClick: this.quarkPerClick,
            passiveDilithium: this.passiveDilithium,
            passiveLunar: this.passiveLunar,
            passiveXenobit: this.passiveXenobit,
            passiveQuark: this.passiveQuark
        };
        
        try {
            sys.localStorage.setItem(CurrencyManager.SAVE_KEY, JSON.stringify(saveData));
        } catch (e) {
            console.error('Failed to save game data:', e);
        }
    }
    
    // Load game data from local storage
    private loadGame() {
        try {
            const saveDataStr = sys.localStorage.getItem(CurrencyManager.SAVE_KEY);
            if (saveDataStr) {
                const saveData = JSON.parse(saveDataStr);
                
                this.dilithium = saveData.dilithium || 0;
                this.lunar = saveData.lunar || 0;
                this.xenobit = saveData.xenobit || 0;
                this.quark = saveData.quark || 0;
                this.dilithiumMultiplier = saveData.dilithiumMultiplier || 1;
                this.lunarMultiplier = saveData.lunarMultiplier || 1;
                this.xenobitMultiplier = saveData.xenobitMultiplier || 1;
                this.quarkMultiplier = saveData.quarkMultiplier || 1;
                this.dilithiumPerClick = saveData.dilithiumPerClick || 1;
                this.lunarPerClick = saveData.lunarPerClick || 0;
                this.xenobitPerClick = saveData.xenobitPerClick || 0;
                this.quarkPerClick = saveData.quarkPerClick || 0;
                this.passiveDilithium = saveData.passiveDilithium || 0;
                this.passiveLunar = saveData.passiveLunar || 0;
                this.passiveXenobit = saveData.passiveXenobit || 0;
                this.passiveQuark = saveData.passiveQuark || 0;
            }
        } catch (e) {
            console.error('Failed to load game data:', e);
        }
    }
}


