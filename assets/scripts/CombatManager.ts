import { _decorator, Component, Node, director, Vec3 } from 'cc';
import { ShipStats } from './ShipStats';
import { SpaceshipPanel } from './SpaceshipPanel';
import { SaveManager } from './SaveManager';
const { ccclass, property } = _decorator;

@ccclass('CombatManager')
export class CombatManager extends Component {
    @property(Node)
    enemyShip: Node = null;

    @property(Node)
    heroShip: Node = null;

    @property(Node)
    enemyHUD: Node = null;

    @property(Node)
    heroHUD: Node = null;

    @property(ShipStats)
    enemyStats: ShipStats = null;

    @property(ShipStats)
    heroStats: ShipStats = null;

    private baseDamage: number = 10;

    start() {
        // Позиционируем корабли и HUD
        this.setupPositions();

        // Initialize ships with base stats + upgrades from SpaceshipPanel
        const upgrades = this.getUpgrades();
        
        this.enemyStats.initialize(100, 50);
        this.heroStats.initialize(
            100 + (upgrades.hpBonus || 0),
            50 + (upgrades.shieldBonus || 0)
        );

        this.baseDamage += (upgrades.damageBonus || 0);

        // Add click event to enemy ship
        this.enemyShip.on(Node.EventType.TOUCH_START, this.onEnemyClick, this);
    }

    private setupPositions() {
        // Позиционируем корабли
        if (this.heroShip) {
            this.heroShip.setPosition(new Vec3(0, -400, 0));
        }
        
        if (this.enemyShip) {
            this.enemyShip.setPosition(new Vec3(0, 400, 0));
        }

        // Позиционируем HUD интерфейсы
        if (this.heroHUD) {
            this.heroHUD.setPosition(new Vec3(0,- 700, 0));
        }

        if (this.enemyHUD) {
            this.enemyHUD.setPosition(new Vec3(0, 700, 0));
        }
    }

    private getUpgrades() {
        // Replace require with import
        return SpaceshipPanel.getUpgradeValues();
    }

    private onEnemyClick() {
        const isDead = this.enemyStats.takeDamage(this.baseDamage);
        
        if (isDead) {
            this.onEnemyDefeated();
        }
    }    private onEnemyDefeated() {
        // Add any reward logic here
        
        // Сохраняем прогресс
        SaveManager.addWin();
        
        // Добавляем награду за победу
        SaveManager.addResources(50, 10); // Награда: 50 кредитов и 10 минералов
        
        // Return to main scene
        director.loadScene('Main', (err) => {
            if (err) {
                console.error('Failed to load Main scene:', err);
                return;
            }
        });
    }

    onDestroy() {
        // Clean up event listeners
        if (this.enemyShip) {
            this.enemyShip.off(Node.EventType.TOUCH_START, this.onEnemyClick, this);
        }
    }
}