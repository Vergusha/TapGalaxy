import { _decorator, Component, Node, Prefab, instantiate, find } from 'cc';
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

    private topPanelComponent: TopPanel | null = null;

    // Делаем массив улучшений статическим и инициализируем его один раз
    private static upgrades: UpgradeData[] = MiningPanel.initializeUpgradesData();

    // Статический метод для инициализации данных улучшений
    private static initializeUpgradesData(): UpgradeData[] {
        // Этот код выполнится только один раз при первой загрузке класса MiningPanel
        console.log("Initializing default upgrades data for MiningPanel.");
        return [
            {
                name: 'Drill Power',
                level: 0,
                icon: 'icons/drill_power', // Изменено
                cost: 100,
                description: 'Увеличивает силу вашего клика.',
                clickPowerBonus: 2
            },
            {
                name: 'Auto Miner',
                level: 0,
                icon: 'icons/auto_miner', // Изменено
                cost: 250,
                description: 'Увеличивает силу клика и пассивный доход.',
                clickPowerBonus: 1,
                passiveIncomeBonus: 0.5
            },
            {
                name: 'Advanced Tech',
                level: 0,
                icon: 'icons/storage', // Изменено
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

        // Добавлено для кнопки закрытия
        if (this.closeButton) {
            this.closeButton.on(Node.EventType.MOUSE_DOWN, this.closePanel, this);
        } else {
            console.warn("MiningPanel: CloseButton не назначен в инспекторе.");
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