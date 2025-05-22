import { _decorator, Component, Node, Label, Sprite, Button, resources, SpriteFrame, UITransform } from 'cc';
import { TopPanel } from './TopPanel';
import { TraderPanel } from './TraderPanel';
import { TradeItemDetails } from './TradeTypes';

const { ccclass, property } = _decorator;

@ccclass('TradeItem')
export class TradeItem extends Component {
    @property({ type: Label })
    nameLabel: Label = null;

    @property({ type: Label })
    levelLabel: Label = null; // Может отображать "Обмен" или "Уровень: X"

    @property({ type: Sprite })
    iconSprite: Sprite = null;

    @property({ type: Label })
    costLabel: Label = null; // Будет отображать стоимость в дилитии или лунарах

    @property({ type: Label })
    descriptionLabel: Label = null;

    @property({ type: Button })
    buyButton: Button = null;

    private itemData: TradeItemDetails | null = null;
    private topPanel: TopPanel | null = null;

    setData(data: TradeItemDetails, topPanelComponent: TopPanel) {
        this.itemData = data;
        this.topPanel = topPanelComponent; // <--- Проверьте, что сюда передается TopPanel

        if (!this.itemData || !this.topPanel) {
            console.error("TradeItem: ItemData or TopPanel is not set.");
            this.node.active = false; // Скрываем элемент, если данные некорректны
            return;
        }
        this.node.active = true;
        this.updateDisplay();
        this.loadIcon();

        this.buyButton.node.off(Button.EventType.CLICK, this.onBuyClick, this); // Сначала отписываемся
        this.buyButton.node.on(Button.EventType.CLICK, this.onBuyClick, this);
    }

    loadIcon() {
        if (this.itemData && this.itemData.icon && this.iconSprite) {
            resources.load(this.itemData.icon + '/spriteFrame', SpriteFrame, (err, spriteFrame) => {
                if (err) {
                    console.error(`TradeItem: Failed to load icon ${this.itemData.icon}:`, err);
                    return;
                }
                if (spriteFrame && this.iconSprite) {
                    this.iconSprite.spriteFrame = spriteFrame;
                    
                    // Устанавливаем размер через UITransform
                    const uiTransform = this.iconSprite.getComponent(UITransform);
                    if (uiTransform) {
                        uiTransform.width = 100;  // Желаемая ширина
                        uiTransform.height = 100; // Желаемая высота
                    }
                }
            });
        }
    }

    updateDisplay() {
        if (!this.itemData || !this.topPanel) return;

        this.nameLabel.string = this.itemData.name;
        this.descriptionLabel.string = this.itemData.description;

        // Отображение уровня или статуса
        if (this.itemData.exchangeOutputLunar) { // Это обмен
            this.levelLabel.string = "Обмен";
        } else if (this.itemData.passiveLunarIncomeBonus) { // Это улучшение пассивного дохода
            this.levelLabel.string = `Уровень: ${this.itemData.currentLevel}`;
        } else {
            this.levelLabel.string = ""; // Для других типов, если будут
        }
        
        // Отображение стоимости
        let costString = "Стоимость: ";
        if (this.itemData.costDilithium !== undefined) {
            costString += `${this.itemData.costDilithium} Д`;
        }
        if (this.itemData.costLunar !== undefined) {
            if (this.itemData.costDilithium !== undefined) costString += " / ";
            costString += `${this.itemData.costLunar} Л`;
        }
        if (this.itemData.costDilithium === undefined && this.itemData.costLunar === undefined) {
            costString = "Бесплатно"; // Или другой текст, если нет стоимости
        }
        this.costLabel.string = costString;

        // Обновление кнопки
        this.updateBuyButtonState();
    }

    updateBuyButtonState() {
        if (!this.itemData || !this.topPanel || !this.buyButton) return;

        const maxLevelReached = this.itemData.maxLevel !== undefined && 
            this.itemData.currentLevel >= this.itemData.maxLevel && 
            this.itemData.maxLevel !== Infinity;

        if (maxLevelReached) {
            this.buyButton.interactable = false;
            return;
        }

        // Проверка доступности покупки
        let canAfford = true;
        if (this.itemData.costDilithium !== undefined && this.topPanel.getDilithium() < this.itemData.costDilithium) {
            canAfford = false;
        }
        if (this.itemData.costLunar !== undefined && this.topPanel.getLunar() < this.itemData.costLunar) {
            canAfford = false;
        }
        this.buyButton.interactable = canAfford;
    }


    onBuyClick() {
        if (!this.itemData || !this.topPanel || !this.buyButton.interactable) return;

        const maxLevelReached = this.itemData.maxLevel !== undefined && 
            this.itemData.currentLevel >= this.itemData.maxLevel && 
            this.itemData.maxLevel !== Infinity;
        if (maxLevelReached) return;

        // Проверяем, хватает ли ресурсов для покупки
        if (this.itemData.costDilithium !== undefined) {
            if (this.topPanel.getDilithium() < this.itemData.costDilithium) {
                console.log("Недостаточно дилития для покупки!");
                return;
            }
        }
        if (this.itemData.costLunar !== undefined) {
            if (this.topPanel.getLunar() < this.itemData.costLunar) {
                console.log("Недостаточно лунаров для покупки!");
                return;
            }
        }

        // Списываем ресурсы
        if (this.itemData.costDilithium !== undefined) {
            this.topPanel.spendDilithium(this.itemData.costDilithium);
        }
        if (this.itemData.costLunar !== undefined) {
            this.topPanel.spendLunar(this.itemData.costLunar);
        }

        // Применяем эффект улучшения
        if (this.itemData.exchangeOutputLunar) {
            // Обмен дилития на лунары
            this.topPanel.addLunar(this.itemData.exchangeOutputLunar);
            console.log(`Обменяно ${this.itemData.costDilithium} дилития на ${this.itemData.exchangeOutputLunar} лунаров.`);
        } 
        
        if (this.itemData.passiveLunarIncomeBonus) {
            // Улучшение пассивного дохода лунаров
            this.topPanel.addPassiveLunarIncome(this.itemData.passiveLunarIncomeBonus);
            const newLevel = this.itemData.currentLevel + 1;
            TraderPanel.updateTradeItemLevel(this.itemData.id, newLevel);
            this.itemData.currentLevel = newLevel;
            console.log(`${this.itemData.name} улучшен до уровня ${newLevel}. Пассивный доход лунаров увеличен на ${this.itemData.passiveLunarIncomeBonus}.`);
        }

        // Обновляем отображение
        this.updateDisplay();
        this.topPanel.updateAllResourceDisplays();
        
        // Обновляем состояние кнопок у всех торговых элементов
        if (this.node.parent) {
            this.node.parent.children.forEach(child => {
                const tradeItem = child.getComponent(TradeItem);
                if (tradeItem) {
                    tradeItem.updateBuyButtonState();
                }
            });
        }
    }
}