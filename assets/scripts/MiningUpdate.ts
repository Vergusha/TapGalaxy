import { _decorator, Component, Label, Sprite, resources, SpriteFrame, Button } from 'cc';
import { TopPanel } from './TopPanel';
const { ccclass, property } = _decorator;

// Экспортируем тип UpgradeData
export type UpgradeData = {
    name: string;
    level: number;
    icon: string;
    cost: number;
    description: string;
    dilithiumBonus?: number;       // Changed from dilithiumPerClick to match MiningPanel
    passiveIncomeBonus?: number;   // This stays the same
};

@ccclass('MiningUpdate')
export class MiningUpdate extends Component {
    @property({ type: Label })
    NameLabel: Label = null;

    @property({ type: Label })
    LevelLabel: Label = null;

    @property({ type: Sprite })
    IconSprite: Sprite = null;

    @property({ type: Label })
    CostLabel: Label = null;

    @property({ type: Label })
    DescriptionLabel: Label = null;

    @property({ type: Button })
    BuyButton: Button = null;

    private upgradeData: UpgradeData;
    private topPanel: TopPanel | null = null;
    private isFirstUpgradeType: boolean = false; // Флаг для первого типа улучшения

    // setData теперь принимает компонент TopPanel и флаг типа улучшения
    setData(data: UpgradeData, topPanelComponent: TopPanel, isFirstType: boolean) {
        this.upgradeData = data;
        this.topPanel = topPanelComponent;
        this.isFirstUpgradeType = isFirstType;

        this.NameLabel.string = data.name;
        this.updateDisplay(); // Обновляем отображение уровня и стоимости

        this.DescriptionLabel.string = data.description;

        resources.load(data.icon + '/spriteFrame', SpriteFrame, (err, spriteFrame) => {
            if (!err && spriteFrame && this.IconSprite) {
                this.IconSprite.spriteFrame = spriteFrame; // <--- Вот здесь присвоение
            } else if (err) {
                console.error(`Failed to load icon ${data.icon}:`, err);
            }
        });

        this.BuyButton.node.off(Button.EventType.CLICK, this.onBuy, this);
        this.BuyButton.node.on(Button.EventType.CLICK, this.onBuy, this);
    }

    updateDisplay() {
        this.LevelLabel.string = `Level: ${this.upgradeData.level}`;
        this.CostLabel.string = `${Math.floor(this.upgradeData.cost)}`;
    }

    onBuy() {
        if (!this.topPanel) {
            console.error("MiningUpdate: Компонент TopPanel не установлен.");
            return;
        }

        if (this.topPanel.getDilithium() >= this.upgradeData.cost) {
            this.topPanel.spendDilithium(this.upgradeData.cost);
            console.log(`Куплено улучшение: ${this.upgradeData.name}, уровень ${this.upgradeData.level + 1}`);

            // Changed to match property name in UpgradeData
            if (typeof this.upgradeData.dilithiumBonus === 'number') {
                this.topPanel.increaseDilithiumPerClick(this.upgradeData.dilithiumBonus);
            }
            
            if (typeof this.upgradeData.passiveIncomeBonus === 'number') {
                this.topPanel.addPassiveDilithiumIncome(this.upgradeData.passiveIncomeBonus);
            }

            this.upgradeData.level++;
            this.upgradeData.cost *= 1.15;
            this.updateDisplay();
        } else {
            console.log("Недостаточно дилития для покупки.");
        }
    }
}