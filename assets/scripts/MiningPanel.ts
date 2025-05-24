import { _decorator, Component, Node, Prefab, instantiate, find, director } from 'cc';
import { MiningUpdate, UpgradeData } from './MiningUpdate'; // Импортируем UpgradeData из MiningUpdate
import { TopPanel } from './TopPanel';
const { ccclass, property } = _decorator;

@ccclass('MiningPanel')
export class MiningPanel extends Component {
    @property({ type: Prefab })
    miningUpdatePrefab: Prefab = null;

    @property({ type: Node })
    content: Node = null;

    @property({ type: Node })
    closeButton: Node = null;

    private topPanelComponent: TopPanel | null = null; // Убираем @property

    // Делаем массив улучшений статическим и инициализируем его один раз
    private static upgrades: UpgradeData[] = MiningPanel.initializeUpgradesData();

    // Статический метод для инициализации данных улучшений
    private static initializeUpgradesData(): UpgradeData[] {
        console.log("Initializing default upgrades data for MiningPanel.");
        return [
            {
                name: 'Drill Power',
                level: 0,
                icon: 'icons/drill_power',
                cost: 100,
                description: 'Увеличивает добычу дилития за клик.',
                dilithiumBonus: 2 // Бонус к добыче дилития за клик
            },
            {
                name: 'Auto Miner',
                level: 0,
                icon: 'icons/auto_miner',
                cost: 250,
                description: 'Увеличивает добычу и пассивный доход дилития.',
                dilithiumBonus: 1,
                passiveIncomeBonus: 0.5
            },
            {
                name: 'Advanced Tech',
                level: 0,
                icon: 'icons/storage',
                cost: 500,
                description: 'Значительно улучшает добычу и пассивный доход дилития.',
                dilithiumBonus: 3,
                passiveIncomeBonus: 1
            }
        ];
    }

    // Метод для сброса прогресса (полезно для тестирования)
    public static resetUpgradesProgress() {
        MiningPanel.upgrades = MiningPanel.initializeUpgradesData();
        console.log("MiningPanel upgrades progress has been reset.");
        // После сброса нужно будет обновить UI, если панель открыта
    }

    setTopPanel(topPanel: TopPanel) {
        this.topPanelComponent = topPanel;
        this.spawnUpgrades();
    }

    onLoad() {
        if (this.closeButton) {
            this.closeButton.on(Node.EventType.MOUSE_DOWN, this.closePanel, this);
        } else {
            console.warn("MiningPanel: CloseButton не назначен в инспекторе.");
        }
    }    onEnable() {
        // Ищем TopPanel только если он еще не установлен
        if (!this.topPanelComponent) {
            const topPanelNode = find('Canvas/TopPanel');
            if (topPanelNode) {
                this.topPanelComponent = topPanelNode.getComponent(TopPanel);
                if (!this.topPanelComponent) {
                    console.error("MiningPanel: Компонент TopPanel не найден на узле.");
                    return;
                }
            } else {
                console.error("MiningPanel: Узел TopPanel не найден. Убедитесь, что экземпляр префаба TopPanel существует в сцене.");
                return;
            }
        }
        
        // В любом случае обновляем улучшения при включении панели
        if (this.topPanelComponent && this.content) {
            this.spawnUpgrades();
        }
    }

    spawnUpgrades() {
        if (!this.topPanelComponent) {
            console.warn("MiningPanel: topPanelComponent не установлен, улучшения не будут созданы.");
            return;
        }

        this.content.removeAllChildren();
        // Используем статический массив MiningPanel.upgrades
        for (let i = 0; i < MiningPanel.upgrades.length; i++) {
            const upgradeData = MiningPanel.upgrades[i]; // Получаем данные из статического массива
            const item = instantiate(this.miningUpdatePrefab);
            this.content.addChild(item);

            const miningUpdate = item.getComponent(MiningUpdate);
            if (miningUpdate) {
                miningUpdate.setData(upgradeData, this.topPanelComponent, i === 0);
            }
        }
    }

    // Новый метод для закрытия панели
    closePanel() {
        if (this.node && this.node.isValid) {
            this.node.destroy();
            // Важно: Если BottomPanel хранит ссылку на этот экземпляр MiningPanel,
            // эту ссылку нужно будет обнулить в BottomPanel.
            // В вашем текущем BottomPanel.ts, miningPanelInstance обнуляется
            // при повторном вызове toggleMiningPanel, что должно быть достаточно.
        }
    }
}

// credits/minerals не используются, только costLunar/costDilithium и методы TopPanel