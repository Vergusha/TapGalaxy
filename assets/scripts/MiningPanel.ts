import { _decorator, Component, Node, Prefab, instantiate, find } from 'cc';
import { MiningUpdate, UpgradeData } from './MiningUpdate'; // Импортируем UpgradeData из MiningUpdate
import { TopPanel } from './TopPanel';
const { ccclass, property } = _decorator;

// Тип UpgradeData теперь можно взять из MiningUpdate.ts или оставить здесь,
// но лучше импортировать, чтобы избежать дублирования.
// Если он уже экспортирован из MiningUpdate.ts, используй импорт.
// Если нет, экспортируй его из MiningUpdate.ts: export type UpgradeData = { ... };

@ccclass('MiningPanel')
export class MiningPanel extends Component {
    @property({ type: Prefab })
    miningUpdatePrefab: Prefab = null;

    @property({ type: Node })
    content: Node = null;

    private topPanelComponent: TopPanel | null = null;

    // Делаем массив улучшений статическим и инициализируем его один раз
    private static upgrades: UpgradeData[] = MiningPanel.initializeUpgradesData();

    // Статический метод для инициализации данных улучшений
    private static initializeUpgradesData(): UpgradeData[] {
        // Этот код выполнится только один раз при первой загрузке класса MiningPanel
        console.log("Initializing default upgrades data for MiningPanel.");
        return [
            {
                name: 'Auto Miner',
                level: 0,
                icon: 'icons/auto_miner',
                cost: 100,
                description: 'Увеличивает силу вашего клика.',
                clickPowerBonus: 2
            },
            {
                name: 'Drill Power',
                level: 0,
                icon: 'icons/drill_power',
                cost: 250,
                description: 'Увеличивает силу клика и пассивный доход.',
                clickPowerBonus: 1,
                passiveIncomeBonus: 0.5
            },
            {
                name: 'Advanced Tech',
                level: 0,
                icon: 'icons/storage',
                cost: 500,
                description: 'Значительно улучшает клик и пассивный доход.',
                clickPowerBonus: 3,
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

    onLoad() {
        const topPanelNodeInstance = find("Canvas/TopPanel");

        if (topPanelNodeInstance) {
            this.topPanelComponent = topPanelNodeInstance.getComponent(TopPanel);
            if (!this.topPanelComponent) {
                console.error("MiningPanel: Компонент TopPanel не найден на узле.");
            }
        } else {
            console.error("MiningPanel: Узел TopPanel не найден. Убедитесь, что экземпляр префаба TopPanel существует в сцене.");
        }

        if (this.topPanelComponent) {
            this.spawnUpgrades();
        } else {
            console.error("MiningPanel: Невозможно создать улучшения, так как компонент TopPanel недоступен.");
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

    // Если панель может быть скрыта и показана, и нужно обновить UI при показе:
    onEnable() {
        // Если topPanelComponent уже найден, можно просто перестроить улучшения,
        // чтобы отразить актуальное состояние из MiningPanel.upgrades
        if (this.topPanelComponent && this.content) {
             // console.log("MiningPanel onEnable: Respawning upgrades to reflect current state.");
            this.spawnUpgrades();
        }
    }
}