import { _decorator, Component, Node, Prefab, instantiate, find, Label } from 'cc';
import { TopPanel } from './TopPanel'; // Предполагаем, что TopPanel будет обновлен для работы с лунарами

// Интерфейс для данных одного элемента торговли/улучшения в TraderPanel
// Вы можете вынести это в отдельный файл TradeItemData.ts, если планируете использовать его где-то еще.
export interface TradeItemDetails {
    id: string; // Уникальный идентификатор
    name: string;
    description: string;
    icon: string; // Путь к иконке в 'resources', например, 'icons/trade_lunar'

    costDilithium?: number; // Стоимость в дилитии для покупки/улучшения
    costLunar?: number;     // Стоимость в лунарах для покупки/улучшения

    exchangeOutputLunar?: number; // Сколько лунаров игрок получает при обмене

    passiveLunarIncomeBonus?: number; // Пассивный доход лунаров в секунду от этого улучшения
    
    currentLevel: number;
    maxLevel?: number; // Максимальный уровень, если есть
}

const { ccclass, property } = _decorator;

@ccclass('TraderPanel')
export class TraderPanel extends Component {
    @property({ type: Prefab })
    tradeItemPrefab: Prefab = null; // Префаб для отображения одного элемента торговли

    @property({ type: Node })
    contentContainer: Node = null; // Узел-контейнер для элементов торговли (например, Content в ScrollView)

    @property({ type: Node })
    closeButton: Node = null;

    private topPanelComponent: TopPanel | null = null;

    // Статический массив с данными о доступных торгах/улучшениях
    // Уровни (currentLevel) будут обновляться в рантайме, здесь начальные значения
    private static availableTrades: TradeItemDetails[] = TraderPanel.initializeTradeData();

    private static initializeTradeData(): TradeItemDetails[] {
        return [
            {
                id: "exchange_100dl_1lr",
                name: "Обмен Дилития",
                description: "Обменяйте 100 Дилития на 1 Лунар. Можно повторять.",
                // Changed path to match resources folder structure
                icon: "icons/lunar_exchange", // Make sure this matches your file name exactly
                costDilithium: 100,
                exchangeOutputLunar: 1,
                currentLevel: 0,
                maxLevel: Infinity 
            },
            {
                id: "lunar_collector_mk1",
                name: "Лунный Сборщик Mk1",
                description: "Генерирует 0.1 Лунара в секунду. Улучшайте для увеличения.",
                // Changed path to match resources folder structure
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
                // Changed path to match resources folder structure
                icon: "icons/lunar_extractor_mk2",
                costDilithium: 1000,
                passiveLunarIncomeBonus: 0.5,
                currentLevel: 0,
                maxLevel: 5
            }
        ];
    }

    // Метод для сброса прогресса торговли (полезно для тестирования)
    public static resetTradesProgress() {
        TraderPanel.availableTrades = TraderPanel.initializeTradeData();
        console.log("TraderPanel trades progress has been reset.");
    }

    onLoad() {
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

    spawnTradeItems() {
        if (!this.topPanelComponent || !this.tradeItemPrefab || !this.contentContainer) return;

        this.contentContainer.removeAllChildren(); // Очищаем старые элементы

        for (let i = 0; i < TraderPanel.availableTrades.length; i++) {
            const tradeData = TraderPanel.availableTrades[i];
            const itemNode = instantiate(this.tradeItemPrefab);
            this.contentContainer.addChild(itemNode);

            // Предполагаем, что у префаба tradeItemPrefab есть скрипт, например, "TradeItem"
            // с методом setData(data: TradeItemDetails, topPanel: TopPanel)
            const tradeItemComponent = itemNode.getComponent("TradeItem"); // Замените "TradeItem" на имя вашего скрипта
            if (tradeItemComponent && typeof tradeItemComponent.setData === 'function') {
                console.log("TraderPanel: Calling setData on TradeItem with topPanelComponent:", this.topPanelComponent);
                tradeItemComponent.setData(tradeData, this.topPanelComponent); // <--- Проверьте this.topPanelComponent
            } else {
                console.warn(`TradeItem компонент или метод setData не найден на префабе для ${tradeData.name}`);
            }
        }
    }
    
    // Вызывается при открытии панели, если нужно обновить состояние
    onEnable() {
        // Если состояние могло измениться пока панель была закрыта (например, уровни улучшений)
        // this.spawnTradeItems(); // Пересоздаст все элементы
        // Или, если у TradeItem есть метод updateDisplay(), можно пройтись по детям и вызвать его.
    }

    closePanel() {
        if (this.node && this.node.isValid) {
            this.node.destroy();
            // Сообщаем TraderInteraction, что панель закрыта, чтобы ее можно было открыть снова
            const traderInteractionNode = find("Canvas/GamePanel/Trader"); // Примерный путь, уточните ваш
            if (traderInteractionNode) {
                const traderInteractionComponent = traderInteractionNode.getComponent("TraderInteraction");
                if (traderInteractionComponent && traderInteractionComponent.traderPanelInstance === this.node) {
                    traderInteractionComponent.traderPanelInstance = null;
                }
            }
        }
    }

    // Статический метод для получения текущего состояния улучшения по ID
    public static getTradeItemData(id: string): TradeItemDetails | undefined {
        return TraderPanel.availableTrades.find(trade => trade.id === id);
    }

    // Статический метод для обновления уровня улучшения (должен вызываться из TradeItem)
    public static updateTradeItemLevel(id: string, newLevel: number) {
        const trade = TraderPanel.availableTrades.find(t => t.id === id);
        if (trade) {
            trade.currentLevel = newLevel;
            // Здесь можно добавить логику для обновления стоимости, если она динамическая
            console.log(`Trade item ${id} level updated to ${newLevel}`);
        }
    }
}