import { _decorator, Component, Node, Prefab, instantiate, find } from 'cc';
import { TopPanel } from './TopPanel';
import { SpaceshipUpdate } from './SpaceshipUpdate';
const { ccclass, property } = _decorator;

// Определяем тип данных для улучшений корабля
export type SpaceshipUpgradeData = {
    name: string;
    level: number;
    icon: string;
    costLunar: number;
    description: string;
    hpBonus?: number;
    shieldBonus?: number;
    damageBonus?: number;
};

@ccclass('SpaceshipPanel')
export class SpaceshipPanel extends Component {
    @property({ type: Prefab })
    spaceshipUpdatePrefab: Prefab = null;

    @property({ type: Node })
    content: Node = null;

    @property({ type: Node })
    closeButton: Node = null;

    private topPanelComponent: TopPanel | null = null;

    // Статический массив улучшений
    private static upgrades: SpaceshipUpgradeData[] = SpaceshipPanel.initializeUpgradesData();

    public static initializeUpgradesData(): SpaceshipUpgradeData[] {
        console.log("Initializing default upgrades data for SpaceshipPanel.");
        return [
            {
                name: 'Hull Reinforcement',
                level: 0,
                icon: 'icons/ship_hull', // Make sure this matches your resource path
                costLunar: 5,
                description: 'Усиливает корпус корабля, увеличивая здоровье.',
                hpBonus: 50
            },
            {
                name: 'Shield Generator',
                level: 0,
                icon: 'icons/ship_shield', // Make sure this matches your resource path
                costLunar: 8,
                description: 'Улучшает энергетический щит корабля.',
                shieldBonus: 30
            },
            {
                name: 'Weapon Systems',
                level: 0,
                icon: 'icons/ship_weapon', // Make sure this matches your resource path
                costLunar: 10,
                description: 'Увеличивает урон оружейных систем.',
                damageBonus: 25
            }
        ];
    }

    // Метод для сброса прогресса (полезно для тестирования)
    public static resetUpgradesProgress() {
        SpaceshipPanel.upgrades = SpaceshipPanel.initializeUpgradesData();
        console.log("SpaceshipPanel upgrades progress has been reset.");
    }

    setTopPanel(topPanel: TopPanel) {
        this.topPanelComponent = topPanel;
        this.spawnUpgrades();
    }

    onLoad() {
        if (this.closeButton) {
            this.closeButton.on(Node.EventType.MOUSE_DOWN, this.closePanel, this);
        } else {
            console.warn("SpaceshipPanel: CloseButton не назначен в инспекторе.");
        }
    }

    closePanel() {
        if (this.node) {
            this.node.destroy();
        }
    }

    onEnable() {
        if (!this.topPanelComponent) {
            const topPanelNode = find('Canvas/TopPanel');
            if (topPanelNode) {
                this.topPanelComponent = topPanelNode.getComponent(TopPanel);
                if (!this.topPanelComponent) {
                    console.error("SpaceshipPanel: Компонент TopPanel не найден на узле.");
                    return;
                }
            } else {
                console.error("SpaceshipPanel: Узел TopPanel не найден. Убедитесь, что экземпляр префаба TopPanel существует в сцене.");
                return;
            }
        }
        
        this.spawnUpgrades();
    }

    spawnUpgrades() {
        if (!this.topPanelComponent) {
            console.warn("SpaceshipPanel: topPanelComponent не установлен, улучшения не будут созданы.");
            return;
        }

        this.content.removeAllChildren();
        
        for (let i = 0; i < SpaceshipPanel.upgrades.length; i++) {
            const upgradeData = SpaceshipPanel.upgrades[i];
            const item = instantiate(this.spaceshipUpdatePrefab);
            this.content.addChild(item);

            const spaceshipUpdate = item.getComponent(SpaceshipUpdate);
            if (spaceshipUpdate) {
                spaceshipUpdate.setData(upgradeData, this.topPanelComponent, i === 0);
            }
        }
    }

    // Метод для обновления уровня улучшения
    public static updateUpgradeLevel(name: string, newLevel: number) {
        const upgrade = SpaceshipPanel.upgrades.find(u => u.name === name);
        if (upgrade) {
            upgrade.level = newLevel;
            upgrade.costLunar = Math.floor(upgrade.costLunar * Math.pow(1.15, newLevel));
        }
    }

    // Новый метод для получения суммарных значений бонусов
    public static getUpgradeValues() {
        let hpBonus = 0;
        let shieldBonus = 0;
        let damageBonus = 0;

        SpaceshipPanel.upgrades.forEach(upgrade => {
            if (upgrade.hpBonus) {
                hpBonus += upgrade.hpBonus * upgrade.level;
            }
            if (upgrade.shieldBonus) {
                shieldBonus += upgrade.shieldBonus * upgrade.level;
            }
            if (upgrade.damageBonus) {
                damageBonus += upgrade.damageBonus * upgrade.level;
            }
        });

        return { hpBonus, shieldBonus, damageBonus };
    }

    // Метод для загрузки сохраненных улучшений
    public static loadSavedUpgrades(shipUpgrades: any) {
        if (!shipUpgrades) return;
        
        // Получаем текущие улучшения
        const currentUpgrades = SpaceshipPanel.upgrades;
        
        // Если у нас есть сохраненные уровни улучшений, применяем их
        if (shipUpgrades.hpBonus !== undefined && currentUpgrades[0]) {
            const hpLevel = Math.floor(shipUpgrades.hpBonus / currentUpgrades[0].hpBonus);
            if (hpLevel > 0) {
                currentUpgrades[0].level = hpLevel;
            }
        }
        
        if (shipUpgrades.shieldBonus !== undefined && currentUpgrades[1]) {
            const shieldLevel = Math.floor(shipUpgrades.shieldBonus / currentUpgrades[1].shieldBonus);
            if (shieldLevel > 0) {
                currentUpgrades[1].level = shieldLevel;
            }
        }
        
        if (shipUpgrades.damageBonus !== undefined && currentUpgrades[2]) {
            const damageLevel = Math.floor(shipUpgrades.damageBonus / currentUpgrades[2].damageBonus);
            if (damageLevel > 0) {
                currentUpgrades[2].level = damageLevel;
            }
        }
        
        // Обновляем стоимость улучшений на основе уровня
        currentUpgrades.forEach(upgrade => {
            if (upgrade.level > 0) {
                upgrade.costLunar = Math.floor(upgrade.costLunar * Math.pow(1.15, upgrade.level));
            }
        });
    }

    // Возвращает глубокую копию массива улучшений для сохранения
    public static getUpgradesArray(): SpaceshipUpgradeData[] {
        return SpaceshipPanel.upgrades.map(upg => ({ ...upg }));
    }

    // Устанавливает массив улучшений из сохранения (или сбрасывает к дефолту при ошибке)
    public static setUpgradesArray(arr: SpaceshipUpgradeData[]) {
        if (Array.isArray(arr) && arr.length === SpaceshipPanel.upgrades.length) {
            for (let i = 0; i < arr.length; i++) {
                SpaceshipPanel.upgrades[i] = { ...arr[i] };
            }
        } else {
            SpaceshipPanel.upgrades = SpaceshipPanel.initializeUpgradesData();
        }
    }
}