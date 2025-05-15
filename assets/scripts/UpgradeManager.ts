import { _decorator, Component, Node, Prefab, instantiate, Button, Label, find } from 'cc';
import { UpgradeItem } from './UpgradeItem';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('UpgradeManager')
export class UpgradeManager extends Component {
    @property(Node)
    upgradeContent: Node = null!;
    
    @property(Prefab)
    upgradeItemPrefab: Prefab = null!;
    
    @property
    private upgrades: UpgradeItem[] = [];
    
    @property(GameManager)
    gameManager: GameManager = null!;
    
    @property(Button)
    upgradeButton: Button = null!;
    
    @property(Label)
    upgradeInfoLabel: Label = null!;
    
    @property(Label)
    upgradeCostLabel: Label = null!;
    
    start() {
        console.log('UpgradeManager initialized');
        
        // Безопасное получение GameManager
        if (!this.gameManager) {
            this.gameManager = GameManager.getInstance();
            
            if (!this.gameManager) {
                this.gameManager = find('GameManager')?.getComponent(GameManager) || null;
            }
            
            if (!this.gameManager) {
                console.error('UpgradeManager: GameManager not found!');
                // Важно! Отключаем функциональность, которая зависит от GameManager
                this.enabled = false;
                return;
            }
        }
        
        // Setup upgrade button
        if (this.upgradeButton) {
            this.upgradeButton.node.on('click', this.onUpgradeClick, this);
        }
        
        this.updateUpgradeDisplay();
        this.initializeUpgrades();
    }
    
    initializeUpgrades() {
        // Define your upgrades
        const upgradeDefinitions = [
            {
                id: 'clickPower',
                name: 'Mining Power',
                description: 'Increases ore per click by 1',
                basePrice: 10,
                priceMultiplier: 1.5,
                effectValue: 1
            },
            {
                id: 'autoMiner',
                name: 'Auto Miner',
                description: 'Mines 1 ore every second automatically',
                basePrice: 50,
                priceMultiplier: 1.8,
                effectValue: 1
            },
            {
                id: 'critChance',
                name: 'Critical Hit Chance',
                description: 'Adds 5% chance for double ore from clicks',
                basePrice: 100,
                priceMultiplier: 2,
                effectValue: 5
            }
        ];
        
        // Create upgrade items
        upgradeDefinitions.forEach(def => {
            const item = instantiate(this.upgradeItemPrefab);
            this.upgradeContent.addChild(item);
            
            const upgradeComp = item.getComponent(UpgradeItem);
            if (upgradeComp) {
                upgradeComp.setup(
                    def.id, 
                    def.name, 
                    def.description, 
                    def.basePrice, 
                    def.priceMultiplier, 
                    def.effectValue,
                    null // You can add icons later
                );
                
                // Add click handler for buy button
                const button = upgradeComp.buyButton;
                button.node.on('click', () => this.onUpgradeButtonClicked(def.id), this);
                
                this.upgrades.push(upgradeComp);
            }
        });
    }
    
    onUpgradeButtonClicked(upgradeId: string) {
        const upgrade = this.upgrades.find(u => u['upgradeId'] === upgradeId);
        if (!upgrade) return;
        
        const price = upgrade.getCurrentPrice();
        const gameManager = GameManager.instance;
        
        if (gameManager.oreCount >= price) {
            gameManager.spendOre(price);
            upgrade.upgrade();
            
            // Apply upgrade effect
            switch (upgradeId) {
                case 'clickPower':
                    gameManager.increaseOrePerClick(upgrade.getEffectValue());
                    break;
                case 'autoMiner':
                    gameManager.setAutoMinerRate(upgrade.getEffectValue());
                    break;
                case 'critChance':
                    gameManager.setCritChance(upgrade.getEffectValue());
                    break;
            }
        }
    }
    
    onUpgradeClick() {
        if (!this.gameManager) {
            console.error('Cannot upgrade: GameManager not found!');
            return;
        }
        
        const success = this.gameManager.onUpgradePurchase();
        if (success) {
            this.updateUpgradeDisplay();
        }
    }
    
    updateUpgradeDisplay() {
        if (!this.gameManager) {
            console.error('Cannot update display: GameManager not found!');
            return;
        }
        
        const currentLevel = this.gameManager.miningLevel;
        const nextLevel = currentLevel + 1;
        const upgradeCost = this.gameManager.calculateUpgradeCost();
        const canAfford = this.gameManager.oreCount >= upgradeCost;
        
        // Update info label
        if (this.upgradeInfoLabel) {
            this.upgradeInfoLabel.string = `Mining Level ${currentLevel} → ${nextLevel}\nGain: ${this.gameManager.calculateClickGain()} → ${this.gameManager.baseClickGain * nextLevel}`;
        }
        
        // Update cost label
        if (this.upgradeCostLabel) {
            this.upgradeCostLabel.string = `Cost: ${upgradeCost} Ore`;
            this.upgradeCostLabel.color = canAfford ? 
                new cc.Color(0, 255, 0, 255) : // Green if can afford
                new cc.Color(255, 0, 0, 255); // Red if can't afford
        }
        
        // Update button interactability
        if (this.upgradeButton) {
            this.upgradeButton.interactable = canAfford;
        }
    }
    
    onEnable() {
        // Update display when panel becomes visible
        this.updateUpgradeDisplay();
    }
}