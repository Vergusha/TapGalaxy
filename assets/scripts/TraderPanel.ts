import { _decorator, Component, Node, Prefab, instantiate, find, Label } from 'cc';
import { TopPanel } from './TopPanel';
import { TradeItem } from './TradeItem';
import { ITraderInteraction, TraderInteraction } from './TraderInteraction';
import { TradeItemDetails } from './TradeTypes';

const { ccclass, property } = _decorator;

@ccclass('TraderPanel')
export class TraderPanel extends Component {
    @property({ type: Prefab })
    private tradeItemPrefab: Prefab | null = null;

    @property({ type: Node })
    private contentContainer: Node | null = null;

    @property({ type: Node })
    private closeButton: Node | null = null;

    private topPanelComponent: TopPanel | null = null;
    public static availableTrades: TradeItemDetails[] = TraderPanel.initializeTradeData();

    private static initializeTradeData(): TradeItemDetails[] {
        return [
            {
                id: "exchange_100dl_1lr",
                name: "Обмен Дилития",
                description: "Обменяйте 100 Дилития на 1 Лунар. Можно повторять.",
                icon: "icons/lunar_exchange",
                costDilithium: 100,
                exchangeOutputLunar: 1,
                currentLevel: 0,
                maxLevel: Infinity 
            },
            {
                id: "lunar_collector_mk1",
                name: "Лунный Сборщик Mk1",
                description: "Генерирует 0.1 Лунара в секунду. Улучшайте для увеличения.",
                icon: "icons/lunar_collector_mk1",
                costDilithium: 200,
                passiveLunarIncomeBonus: 0.1,
                currentLevel: 0,
                maxLevel: 10
            },
            {
                id: "lunar_extractor_mk2",
                name: "Лунный Экстрактор Mk2",
                description: "Генерирует 0.5 Лунара в секунду. Улучшайте для увеличения.",
                icon: "icons/lunar_extractor_mk2",
                costDilithium: 1000,
                passiveLunarIncomeBonus: 0.5,
                currentLevel: 0,
                maxLevel: 5
            }
        ];
    }

    public static resetTradesProgress(): void {
        TraderPanel.availableTrades = TraderPanel.initializeTradeData();
        console.log("TraderPanel trades progress has been reset.");
    }

    onLoad(): void {
        const topPanelNodeInstance = find("Canvas/TopPanel");
        if (topPanelNodeInstance) {
            this.topPanelComponent = topPanelNodeInstance.getComponent(TopPanel);
            if (!this.topPanelComponent) {
                console.error("TraderPanel: Компонент TopPanel не найден.");
            }
        } else {
            console.error("TraderPanel: Узел TopPanel не найден.");
        }

        if (this.topPanelComponent && this.tradeItemPrefab && this.contentContainer) {
            this.spawnTradeItems();
        } else {
            if (!this.topPanelComponent) console.error("TraderPanel: Невозможно создать элементы торговли, TopPanel недоступен.");
            if (!this.tradeItemPrefab) console.error("TraderPanel: Префаб tradeItemPrefab не назначен.");
            if (!this.contentContainer) console.error("TraderPanel: Контейнер contentContainer не назначен.");
        }

        if (this.closeButton) {
            this.closeButton.on(Node.EventType.MOUSE_DOWN, this.closePanel, this);
        } else {
            console.warn("TraderPanel: CloseButton не назначен в инспекторе.");
        }
    }

    spawnTradeItems(): void {
        if (!this.topPanelComponent || !this.tradeItemPrefab || !this.contentContainer) return;

        this.contentContainer.removeAllChildren();

        for (let i = 0; i < TraderPanel.availableTrades.length; i++) {
            const tradeData = TraderPanel.availableTrades[i];
            const itemNode = instantiate(this.tradeItemPrefab);
            this.contentContainer.addChild(itemNode);

            const tradeItemComponent = itemNode.getComponent(TradeItem);
            if (tradeItemComponent) {
                tradeItemComponent.setData(tradeData, this.topPanelComponent);
            } else {
                console.warn(`TradeItem компонент не найден на префабе для ${tradeData.name}`);
            }
        }
    }
    
    onEnable(): void {
        if (this.topPanelComponent && this.contentContainer) {
            this.spawnTradeItems();
        }
    }

    closePanel(): void {
        if (this.node && this.node.isValid) {
            const traderInteractionNode = find("Canvas/GamePanel/Trader");
            if (traderInteractionNode) {
                const traderInteraction = traderInteractionNode.getComponent(TraderInteraction) as ITraderInteraction | null;
                if (traderInteraction) {
                    traderInteraction.notifyPanelClosed(this.node);
                }
            }
            this.node.destroy();
        }
    }

    public static getTradeItemData(id: string): TradeItemDetails | undefined {
        return TraderPanel.availableTrades.find(trade => trade.id === id);
    }

    public static updateTradeItemLevel(id: string, newLevel: number): void {
        const trade = TraderPanel.availableTrades.find(t => t.id === id);
        if (trade) {
            trade.currentLevel = newLevel;
            console.log(`Trade item ${id} level updated to ${newLevel}`);
        }
    }
}