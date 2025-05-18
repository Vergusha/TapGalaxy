import { _decorator, Component, Node, Prefab, instantiate, Label, Sprite, Button, ScrollView, UITransform } from 'cc';
import { CurrencyManager } from './CurrencyManager';
import { UIEvents } from './UIManager';
import { GameManager } from './GameManager';
import { AudioManager } from './AudioManager';
import { NotificationManager } from './NotificationManager';
const { ccclass, property } = _decorator;

// Define the upgrade type
type Upgrade = {
    name: string;
    level: number;
    baseCost: number;
    cost: number;
    effect: number;
    passiveIncome?: number;
    description?: string;
};

@ccclass('MiningPanelController')
export class MiningPanelController extends Component {
    @property(Prefab)
    upgradeItemPrefab: Prefab = null;

    @property(Node)
    upgradesContainer: Node = null;

    @property(ScrollView)
    scrollView: ScrollView = null;

    @property(Sprite)
    currencyIconSprite: Sprite = null;

    @property(Button)
    closeButton: Button = null;    private currencyManager: CurrencyManager = null;
    private gameManager: GameManager = null;
    
    // Array of available mining upgrades
    private upgrades: Upgrade[] = [
        { 
            name: 'Drill', 
            level: 1, 
            baseCost: 10, 
            cost: 10, 
            effect: 1,
            description: '+1 dilithium per click'
        },
        { 
            name: 'Miner', 
            level: 0, 
            baseCost: 50, 
            cost: 50, 
            effect: 5, 
            passiveIncome: 2,
            description: '+5 per click, +2 passive income'
        },
        { 
            name: 'Drone', 
            level: 0, 
            baseCost: 200, 
            cost: 200, 
            effect: 20, 
            passiveIncome: 10,
            description: '+20 per click, +10 passive income'
        },
        { 
            name: 'Mine', 
            level: 0, 
            baseCost: 1000, 
            cost: 1000, 
            effect: 100, 
            passiveIncome: 35,
            description: '+100 per click, +35 passive income'
        },
        { 
            name: 'Mining Station', 
            level: 0, 
            baseCost: 5000, 
            cost: 5000, 
            effect: 500, 
            passiveIncome: 100,
            description: '+500 per click, +100 passive income'
        }
    ];    onLoad() {
        // Initialize
    }
    
    start() {
        this.currencyManager = CurrencyManager.getInstance();
        this.gameManager = GameManager.getInstance();
        
        // Load upgrades from GameManager if available
        const savedUpgrades = this.gameManager.getMiningUpgrades();
        if (savedUpgrades && savedUpgrades.length > 0) {
            this.upgrades = savedUpgrades;
        } else {
            // Store initial upgrades in GameManager
            this.gameManager.setMiningUpgrades(this.upgrades);
        }
        
        // Clear the container before adding new items
        this.upgradesContainer.removeAllChildren();

        // Create upgrade items
        for (let i = 0; i < this.upgrades.length; i++) {
            this.createUpgradeItem(i);
        }
        
        // Update the content size to accommodate all items
        this.updateContentSize();
        
        // Set up close button if it exists
        if (this.closeButton) {
            this.closeButton.node.on(Button.EventType.CLICK, this.onCloseButtonClick, this);
        }
    }

    update(deltaTime: number) {
        // No specific update logic for MiningPanelController
    }
    
    // Create an upgrade item from the prefab
    private createUpgradeItem(index: number) {
        const upg = this.upgrades[index];
        const item = instantiate(this.upgradeItemPrefab);
        this.upgradesContainer.addChild(item);

        // Get components from the prefab
        const nameLabel = item.getChildByName('NameLabel')?.getComponent(Label);
        const levelLabel = item.getChildByName('LevelLabel')?.getComponent(Label);
        const iconSprite = item.getChildByName('IconSprite')?.getComponent(Sprite);
        const costLabel = item.getChildByName('CostLabel')?.getComponent(Label);
        const descriptionLabel = item.getChildByName('DescriptionLabel')?.getComponent(Label);
        const buyButton = item.getChildByName('BuyButton');        // Set values
        if (nameLabel) nameLabel.string = upg.name;
        if (levelLabel) levelLabel.string = `Ур. ${upg.level}`;
        if (costLabel) costLabel.string = this.formatNumber(upg.cost);
        if (descriptionLabel) descriptionLabel.string = upg.description || '';
        
        // Set dilithium icon
        if (iconSprite && this.currencyIconSprite) {
            iconSprite.spriteFrame = this.currencyIconSprite.spriteFrame;
            
            // Настраиваем размер иконки
            const iconNode = iconSprite.node;
            // Проверяем, имеет ли родительский узел UITransform компонент
            const iconTransform = iconNode.getComponent(UITransform);
            if (iconTransform) {
                // Устанавливаем размер иконки (увеличиваем в 1.5 раза)
                iconTransform.width = 48;
                iconTransform.height = 48;
            }
        }

        // Set button click handler
        if (buyButton) {
            buyButton.on(Node.EventType.TOUCH_END, () => {
                this.buyUpgrade(index, levelLabel, costLabel);
            }, this);
        }
    }    // Buy an upgrade
    private buyUpgrade(index: number, levelLabel: Label, costLabel: Label) {
        const upgrade = this.upgrades[index];
        const currentDilithium = this.currencyManager.getDilithium();
        
        const audioManager = AudioManager.getInstance();
        const notificationManager = NotificationManager.getInstance();
        
        if (currentDilithium >= upgrade.cost) {
            // Deduct the cost
            this.currencyManager.setDilithium(currentDilithium - upgrade.cost);
            
            // Level up the upgrade
            upgrade.level += 1;
            
            // Recalculate cost (cost increases with each level)
            upgrade.cost = Math.floor(upgrade.baseCost * Math.pow(1.5, upgrade.level));
            
            // Apply the upgrade effects
            const newClickValue = this.currencyManager.getDilithiumPerClick() + upgrade.effect;
            this.currencyManager.setDilithiumPerClick(newClickValue);
            
            // Apply passive income if available
            if (upgrade.passiveIncome) {
                const newPassiveIncome = this.currencyManager.getPassiveDilithium() + upgrade.passiveIncome;
                this.currencyManager.setPassiveDilithium(newPassiveIncome);
            }
            
            // Update UI
            if (levelLabel) levelLabel.string = `Ур. ${upgrade.level}`;
            if (costLabel) costLabel.string = this.formatNumber(upgrade.cost);
            
            // Save the updated upgrades in GameManager
            this.gameManager.setMiningUpgrades(this.upgrades);
            
            // Manually save game data
            this.gameManager.saveGame();
            
            // Play success sound
            if (audioManager) {
                audioManager.playPurchaseSuccess();
            }
            
            // Show notification
            if (notificationManager) {
                notificationManager.showSuccessNotification(
                    `Улучшение "${upgrade.name}" приобретено! (Уровень ${upgrade.level})`, 
                    2
                );
            }
        } else {
            // Not enough resources
            if (audioManager) {
                audioManager.playPurchaseFail();
            }
            
            // Show notification
            if (notificationManager) {
                notificationManager.showWarningNotification(
                    "Недостаточно дилития для покупки улучшения!",
                    2
                );
            }
        }
    }
    
    // Update the content size to fit all upgrade items
    private updateContentSize() {
        if (!this.scrollView || !this.upgradesContainer) return;
        
        const contentUITransform = this.upgradesContainer.getComponent(UITransform);
        if (!contentUITransform) return;
        
        // Assume each item has a height of 100 (adjust as needed)
        const itemHeight = 100;
        const totalHeight = this.upgrades.length * itemHeight;
        
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
    
    // Get the upgrades array (for other components to access)
    public getUpgrades(): Upgrade[] {
        return this.upgrades;
    }
    
    // Close button click handler
    private onCloseButtonClick() {
        // Показываем Game Panel
        UIEvents.emit('showGamePanel');
    }
}


