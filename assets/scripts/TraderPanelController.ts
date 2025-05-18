import { _decorator, Component, Node, Prefab, instantiate, Label, Sprite, Button, ScrollView, UITransform } from 'cc';
import { CurrencyManager } from './CurrencyManager';
import { UIEvents } from './UIManager';
import { GameManager } from './GameManager';
import { AudioManager } from './AudioManager';
import { NotificationManager } from './NotificationManager';
const { ccclass, property } = _decorator;

// Define the trader upgrade type
type TraderUpgrade = {
    name: string;
    level: number;
    baseCost: number;
    dilithiumCost: number;
    lunarReward: number;
    passiveIncome?: number;
    description?: string;
};

@ccclass('TraderPanelController')
export class TraderPanelController extends Component {
    @property(Prefab)
    traderItemPrefab: Prefab = null;

    @property(Node)
    upgradesContainer: Node = null;

    @property(ScrollView)
    scrollView: ScrollView = null;

    @property(Sprite)
    currencyIconSprite: Sprite = null;

    @property(Button)    closeButton: Button = null;

    private currencyManager: CurrencyManager = null;
    private gameManager: GameManager = null;
    
    // Array of available trader upgrades
    private traderUpgrades: TraderUpgrade[] = [
        { 
            name: 'Small Trade', 
            level: 1, 
            baseCost: 100, 
            dilithiumCost: 100, 
            lunarReward: 1,
            description: 'Trade 100 dilithium for 1 lunar'
        },
        { 
            name: 'Medium Trade', 
            level: 0, 
            baseCost: 500, 
            dilithiumCost: 500, 
            lunarReward: 6, 
            passiveIncome: 0.1,
            description: 'Trade 500 dilithium for 6 lunar, +0.1 passive lunar income'
        },
        { 
            name: 'Large Trade', 
            level: 0, 
            baseCost: 2000, 
            dilithiumCost: 2000, 
            lunarReward: 25, 
            passiveIncome: 0.5,
            description: 'Trade 2000 dilithium for 25 lunar, +0.5 passive lunar income'
        },
        { 
            name: 'Bulk Trade', 
            level: 0, 
            baseCost: 10000, 
            dilithiumCost: 10000, 
            lunarReward: 130, 
            passiveIncome: 2,
            description: 'Trade 10000 dilithium for 130 lunar, +2 passive lunar income'
        },
        { 
            name: 'Mega Trade', 
            level: 0, 
            baseCost: 50000, 
            dilithiumCost: 50000, 
            lunarReward: 700, 
            passiveIncome: 10,
            description: 'Trade 50000 dilithium for 700 lunar, +10 passive lunar income'
        }
    ];    start() {
        this.currencyManager = CurrencyManager.getInstance();
        this.gameManager = GameManager.getInstance();
        
        // Load trader upgrades from GameManager if available
        const savedUpgrades = this.gameManager.getTraderUpgrades();
        if (savedUpgrades && savedUpgrades.length > 0) {
            this.traderUpgrades = savedUpgrades;
        } else {
            // Store initial upgrades in GameManager
            this.gameManager.setTraderUpgrades(this.traderUpgrades);
        }
        
        // Set up close button
        if (this.closeButton) {
            this.closeButton.node.on(Button.EventType.CLICK, this.onCloseButtonClick, this);
        }
        
        // Clear the container before adding new items
        this.upgradesContainer.removeAllChildren();

        // Create trader upgrade items
        for (let i = 0; i < this.traderUpgrades.length; i++) {
            this.createTraderItem(i);
        }
        
        // Update the content size to accommodate all items
        this.updateContentSize();
    }

    update(deltaTime: number) {
        // No specific update logic for TraderPanelController
    }
    
    // Close the trader panel
    private onCloseButtonClick() {
        UIEvents.emit('hideTraderPanel');
    }
    
    // Create a trader item from the prefab
    private createTraderItem(index: number) {
        const upg = this.traderUpgrades[index];
        const item = instantiate(this.traderItemPrefab);
        this.upgradesContainer.addChild(item);

        // Get components from the prefab
        const nameLabel = item.getChildByName('NameLabel')?.getComponent(Label);
        const levelLabel = item.getChildByName('LevelLabel')?.getComponent(Label);
        const iconSprite = item.getChildByName('IconSprite')?.getComponent(Sprite);
        const costLabel = item.getChildByName('CostLabel')?.getComponent(Label);
        const descriptionLabel = item.getChildByName('DescriptionLabel')?.getComponent(Label);
        const buyButton = item.getChildByName('BuyButton');

        // Set values
        if (nameLabel) nameLabel.string = upg.name;
        if (levelLabel) levelLabel.string = `Ур. ${upg.level}`;
        if (costLabel) costLabel.string = this.formatNumber(upg.dilithiumCost);
        if (descriptionLabel) descriptionLabel.string = upg.description || '';
          // Set lunar icon
        if (iconSprite && this.currencyIconSprite) {
            iconSprite.spriteFrame = this.currencyIconSprite.spriteFrame;
            
            // Configure icon size
            const iconNode = iconSprite.node;
            const iconTransform = iconNode.getComponent(UITransform);
            if (iconTransform) {
                // Set icon size
                iconTransform.width = 48;
                iconTransform.height = 48;
            }
        }

        // Set button click handler
        if (buyButton) {
            buyButton.on(Node.EventType.TOUCH_END, () => {
                this.tradeResources(index, levelLabel, costLabel);
            }, this);
        }
    }    // Trade dilithium for lunar
    private tradeResources(index: number, levelLabel: Label, costLabel: Label) {
        const upgrade = this.traderUpgrades[index];
        const currentDilithium = this.currencyManager.getDilithium();
        
        const audioManager = AudioManager.getInstance();
        const notificationManager = NotificationManager.getInstance();
        
        if (currentDilithium >= upgrade.dilithiumCost) {
            // Deduct the dilithium cost
            this.currencyManager.setDilithium(currentDilithium - upgrade.dilithiumCost);
            
            // Add lunar reward
            this.currencyManager.addLunar(upgrade.lunarReward);
            
            // Play success sound
            if (audioManager) {
                audioManager.playPurchaseSuccess();
            }
            
            // Show success notification
            if (notificationManager) {
                notificationManager.showSuccessNotification(
                    `Обмен успешен! Получено +${upgrade.lunarReward} лунария`,
                    2
                );
            }
            
            // For first purchase, level up and apply passive income
            if (upgrade.level === 0) {
                upgrade.level = 1;
                
                // Apply passive income if available
                if (upgrade.passiveIncome) {
                    const newPassiveIncome = this.currencyManager.getPassiveLunar() + upgrade.passiveIncome;
                    this.currencyManager.setPassiveLunar(newPassiveIncome);
                    
                    // Special notification for passive income unlock
                    if (notificationManager) {
                        notificationManager.showInfoNotification(
                            `Открыт пассивный доход лунария: +${upgrade.passiveIncome} в секунду!`,
                            3
                        );
                    }
                }
                
                // Update level label
                if (levelLabel) levelLabel.string = `Ур. ${upgrade.level}`;
                
                // Save updated upgrades to GameManager
                this.gameManager.setTraderUpgrades(this.traderUpgrades);
                
                // Manually save game
                this.gameManager.saveGame();
            }
        } else {
            // Not enough resources
            if (audioManager) {
                audioManager.playPurchaseFail();
            }
            
            // Show notification
            if (notificationManager) {
                notificationManager.showWarningNotification(
                    "Недостаточно дилития для обмена!",
                    2
                );
            }
        }
    }
    
    // Update the content size to fit all trader items
    private updateContentSize() {
        if (!this.scrollView || !this.upgradesContainer) return;
        
        const contentUITransform = this.upgradesContainer.getComponent(UITransform);
        if (!contentUITransform) return;
        
        // Assume each item has a height of 100 (adjust as needed)
        const itemHeight = 100;
        const totalHeight = this.traderUpgrades.length * itemHeight;
        
        // Set content height to accommodate all items
        const currentContentSize = contentUITransform.contentSize;
        contentUITransform.setContentSize(currentContentSize.width, Math.max(totalHeight, this.scrollView.node.getComponent(UITransform).height));
    }
    
    // Format large numbers with suffixes
    private formatNumber(num: number): string {
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
    
    // Get the trader upgrades array (for other components to access)
    public getTraderUpgrades(): TraderUpgrade[] {
        return this.traderUpgrades;
    }
}


