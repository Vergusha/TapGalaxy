import { _decorator, Component, Node, Label, AudioSource, AudioClip } from 'cc';
import { MiningPanelController } from './MinigPanelController';
import { TraderPanelController } from './TraderPanelController';
import { UIEvents } from './UIManager'; // Add this import line

const { ccclass, property } = _decorator;

@ccclass('GamePanelController')
export class GamePanelController extends Component {
    @property(Node)
    planet: Node = null;

    @property(Label)
    dilitiumText: Label = null;
    
    @property(Label)
    lunarText: Label = null;
    
    @property(MiningPanelController)
    miningPanelController: MiningPanelController = null;
    
    @property(TraderPanelController)
    traderPanelController: TraderPanelController = null;

    @property(AudioSource)
    audioSource: AudioSource = null;
    
    @property({type: AudioClip})
    clickSound: AudioClip = null;

    // Add these new properties to the GamePanelController class
    @property(Node)
    trader: Node = null;  // Reference to the trader object

    @property(Node)
    traderPanel: Node = null;  // Reference to the trader panel

    // Add this property to track game panel content
    @property(Node)
    gamePanelContent: Node = null;  // This should reference the main content of your game panel

    private dilitium: number = 0;
    private lunar: number = 0;
    private dilitiumPerClick: number = 1;
    private passiveTimer: number = 0;
    
    start() {
        if (this.planet) {
            this.planet.on(Node.EventType.TOUCH_END, this.onPlanetClick, this);
        }
        
        // Add trader click handler
        if (this.trader) {
            this.trader.on(Node.EventType.TOUCH_END, this.onTraderClick, this);
        }
        
        this.updateDilitiumText();
        this.updateLunarText();
        
        // Make sure trader panel is initially hidden
        if (this.traderPanel) {
            this.traderPanel.active = false;
        }
    }

    onPlanetClick() {
        this.dilitium += this.dilitiumPerClick;
        this.updateDilitiumText();
        
        // Воспроизводим звук при клике
        if (this.audioSource && this.clickSound) {
            this.audioSource.playOneShot(this.clickSound);
        }
    }
    
    public upgradeMining() {
        this.dilitiumPerClick += 1;
    }
    
    updateDilitiumText() {
        if (this.dilitiumText) {
            this.dilitiumText.string = this.formatNumber(this.dilitium);
        }
    }
    
    updateLunarText() {
        if (this.lunarText) {
            this.lunarText.string = this.formatNumber(this.lunar);
        }
    }

    update(dt: number) {
        // Обрабатываем пассивный доход независимо от активности MiningPanel и TraderPanel
        this.processPassiveIncome(dt);
    }
    
    processPassiveIncome(dt: number) {
        this.passiveTimer += dt;
        if (this.passiveTimer >= 1) { // раз в секунду
            // Process mining passive income
            if (this.miningPanelController) {
                let totalDilitiumIncome = 0;
                const miningUpgrades = this.miningPanelController.getUpgrades();
                
                for (const upg of miningUpgrades) {
                    if (upg.passiveIncome) {
                        totalDilitiumIncome += upg.passiveIncome * upg.level;
                    }
                }
                
                if (totalDilitiumIncome > 0) {
                    this.dilitium += totalDilitiumIncome;
                    this.updateDilitiumText();
                }
            }
            
            // Process trader passive income for lunars
            if (this.traderPanelController) {
                let totalLunarIncome = 0;
                const traderUpgrades = this.traderPanelController.getUpgrades();
                
                for (const upg of traderUpgrades) {
                    if (upg.passiveIncome) {
                        totalLunarIncome += upg.passiveIncome * upg.level;
                    }
                }
                
                if (totalLunarIncome > 0) {
                    this.lunar += totalLunarIncome;
                    this.updateLunarText();
                }
            }
            
            this.passiveTimer = 0;
        }
    }
    
    // Геттеры и сеттеры для доступа к приватным полям
    public getDilitium(): number {
        return this.dilitium;
    }
    
    public setDilitium(value: number) {
        this.dilitium = value;
        this.updateDilitiumText();
    }
    
    public getLunar(): number {
        return this.lunar;
    }
    
    public setLunar(value: number) {
        this.lunar = value;
        this.updateLunarText();
    }
    
    public getDilitiumPerClick(): number {
        return this.dilitiumPerClick;
    }
    
    public setDilitiumPerClick(value: number) {
        this.dilitiumPerClick = value;
    }
    
    private formatNumber(num: number): string {
        if (num < 1000) return num.toString();
        
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

    // Update the onTraderClick method
    onTraderClick() {
        // Trigger the trader panel toggle event
        UIEvents.emit('toggleTraderPanel');
    }
}