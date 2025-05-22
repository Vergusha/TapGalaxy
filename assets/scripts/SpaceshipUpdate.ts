import { _decorator, Component, Node, Label, Sprite, Button, resources, SpriteFrame, UITransform } from 'cc';
import { TopPanel } from './TopPanel';
import { SpaceshipUpgradeData, SpaceshipPanel } from './SpaceshipPanel';
import { SaveManager } from './SaveManager';
const { ccclass, property } = _decorator;

@ccclass('SpaceshipUpdate')
export class SpaceshipUpdate extends Component {
    @property({ type: Label })
    nameLabel: Label = null;

    @property({ type: Label })
    levelLabel: Label = null;

    @property({ type: Sprite })
    iconSprite: Sprite = null;

    @property({ type: Label })
    costLabel: Label = null;

    @property({ type: Label })
    descriptionLabel: Label = null;

    @property({ type: Button })
    buyButton: Button = null;

    private upgradeData: SpaceshipUpgradeData;
    private topPanel: TopPanel | null = null;

    setData(data: SpaceshipUpgradeData, topPanelComponent: TopPanel, isFirstType: boolean) {
        this.upgradeData = data;
        this.topPanel = topPanelComponent;
        
        this.updateDisplay();
        this.loadIcon();
        
        // Настраиваем обработчик кнопки покупки
        this.buyButton.node.off('click');
        this.buyButton.node.on('click', this.onBuy, this);
    }

    loadIcon() {
        if (this.upgradeData && this.upgradeData.icon && this.iconSprite) {
            console.log(`SpaceshipUpdate: Loading icon from path: ${this.upgradeData.icon}`);
            resources.load(`${this.upgradeData.icon}/spriteFrame`, SpriteFrame, (err, spriteFrame) => {
                if (err) {
                    console.error(`SpaceshipUpdate: Failed to load icon ${this.upgradeData.icon}:`, err);
                    return;
                }
                if (spriteFrame && this.iconSprite) {
                    this.iconSprite.spriteFrame = spriteFrame;
                    // Set icon size
                    const uiTransform = this.iconSprite.getComponent(UITransform);
                    if (uiTransform) {
                        uiTransform.width = 100;  // Adjust size as needed
                        uiTransform.height = 100; // Adjust size as needed
                    }
                }
            });
        }
    }

    updateDisplay() {
        if (!this.upgradeData) return;

        this.nameLabel.string = this.upgradeData.name;
        this.levelLabel.string = `Уровень: ${this.upgradeData.level}`;
        this.costLabel.string = `${this.upgradeData.costLunar} Лунаров`;
        this.descriptionLabel.string = this.upgradeData.description;
        
        this.updateBuyButtonState();
    }

    updateBuyButtonState() {
        if (!this.topPanel || !this.upgradeData) return;
        
        const canAfford = this.topPanel.getLunar() >= this.upgradeData.costLunar;
        this.buyButton.interactable = canAfford;
    }

    onBuy() {
        if (!this.topPanel || !this.upgradeData || !this.buyButton.interactable) return;

        if (this.topPanel.spendLunar(this.upgradeData.costLunar)) {
            // Применяем эффекты улучшения
            if (this.upgradeData.hpBonus) {
                // Добавить метод увеличения HP в TopPanel или GameManager
                console.log(`HP увеличено на ${this.upgradeData.hpBonus}`);
            }
            if (this.upgradeData.shieldBonus) {
                // Добавить метод увеличения щита
                console.log(`Щит усилен на ${this.upgradeData.shieldBonus}`);
            }
            if (this.upgradeData.damageBonus) {
                // Добавить метод увеличения урона
                console.log(`Урон увеличен на ${this.upgradeData.damageBonus}`);
            }            // Обновляем уровень и стоимость
            this.upgradeData.level++;
            SpaceshipPanel.updateUpgradeLevel(this.upgradeData.name, this.upgradeData.level);
            
            // Сохраняем прогресс после покупки улучшения
            SaveManager.saveProgress();

            // Обновляем отображение
            this.updateDisplay();
            console.log(`Куплено улучшение: ${this.upgradeData.name}, уровень ${this.upgradeData.level}`);
        }
    }
}