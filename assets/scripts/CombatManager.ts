import { _decorator, Component, Node, director, Vec3, tween, Quat, easing } from 'cc';
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
    private readonly CLICK_COOLDOWN: number = 0.1; // 100ms кулдаун между кликами
    private lastClickTime: number = 0;

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

        // Добавляем небольшую задержку перед добавлением обработчика, 
        // чтобы игрок не мог кликнуть слишком рано
        this.scheduleOnce(() => {
            // Add click event to enemy ship
            this.enemyShip.on(Node.EventType.TOUCH_START, this.onEnemyClick, this);
            
            // Добавляем небольшую анимацию "готовности к бою" для корабля врага
            this.animateEnemyReadyToBattle();
        }, 1.2); // Задержка в 1.2 секунды, чтобы все анимации вхождения успели завершиться
    }private setupPositions() {
        // Устанавливаем начальные позиции за пределами экрана
        
        // Начальные и конечные позиции для кораблей и HUD
        const heroFinalPos = new Vec3(0, -400, 0);
        const heroStartPos = new Vec3(0, -1000, 0); // За нижним краем экрана
        
        const enemyFinalPos = new Vec3(0, 400, 0);
        const enemyStartPos = new Vec3(0, 1000, 0); // За верхним краем экрана
        
        const heroHUDFinalPos = new Vec3(0, -700, 0);
        const heroHUDStartPos = new Vec3(0, -1200, 0); // За нижним краем экрана
        
        const enemyHUDFinalPos = new Vec3(0, 700, 0);
        const enemyHUDStartPos = new Vec3(0, 1200, 0); // За верхним краем экрана
        
        // Устанавливаем начальные позиции
        if (this.heroShip) {
            this.heroShip.setPosition(heroStartPos);
        }
        
        if (this.enemyShip) {
            this.enemyShip.setPosition(enemyStartPos);
        }
        
        if (this.heroHUD) {
            this.heroHUD.setPosition(heroHUDStartPos);
        }
        
        if (this.enemyHUD) {
            this.enemyHUD.setPosition(enemyHUDStartPos);
        }
        
        // Запускаем анимации появления (с небольшой задержкой для эффекта)
        this.animateEntry(this.heroShip, heroStartPos, heroFinalPos, 0.5, 0.1);
        this.animateEntry(this.enemyShip, enemyStartPos, enemyFinalPos, 0.5, 0);
        this.animateEntry(this.heroHUD, heroHUDStartPos, heroHUDFinalPos, 0.7, 0.2);
        this.animateEntry(this.enemyHUD, enemyHUDStartPos, enemyHUDFinalPos, 0.7, 0.2);
    }

    private getUpgrades() {
        // Replace require with import
        return SpaceshipPanel.getUpgradeValues();
    }    private onEnemyClick() {
        const currentTime = director.getTotalTime();
        // Проверяем, прошел ли кулдаун
        if (currentTime - this.lastClickTime < this.CLICK_COOLDOWN) {
            return; // Игнорируем клик, если кулдаун еще не истек
        }
        this.lastClickTime = currentTime; // Обновляем время последнего клика

        // Добавляем анимацию клика (вспышка/эффект удара)
        this.animateAttack();
        
        const isDead = this.enemyStats.takeDamage(this.baseDamage);
        
        if (isDead) {
            this.onEnemyDefeated();
        } else {
            // Если враг еще жив, добавляем небольшую анимацию получения урона
            this.animateEnemyHit();
        }
    }    private onEnemyDefeated() {
        // Анимируем поражение врага
        this.animateEnemyDefeat();
        
        // Затем, после окончания анимации, сохраняем прогресс и переходим к основной сцене
        this.scheduleOnce(() => {
            // Сохраняем победу
            SaveManager.addWin();
            
            // Добавляем награду за победу - напрямую к текущим сохраненным значениям
            SaveManager.addResources(50, 10); // Награда: 50 лунаров и 10 дилития
            
            // Return to main scene
            director.loadScene('Main', (err) => {
                if (err) {
                    console.error('Failed to load Main scene:', err);
                    return;
                }
            });
        }, 2.0); // Задержка, чтобы анимация поражения успела проиграться
    }

    /**
     * Анимирует появление объекта с начальной позиции в конечную
     * @param node Узел для анимации
     * @param startPos Начальная позиция
     * @param endPos Конечная позиция
     * @param duration Длительность анимации
     * @param delay Задержка перед началом анимации
     */
    private animateEntry(node: Node, startPos: Vec3, endPos: Vec3, duration: number = 0.5, delay: number = 0) {
        if (!node) return;
        
        // Устанавливаем начальный масштаб немного меньше
        node.scale = new Vec3(0.8, 0.8, 1);
        
        // Создаем последовательность твинов
        tween(node)
            .delay(delay)                               // Задержка перед началом
            .to(duration, { position: endPos }, {       // Анимация движения
                easing: 'backOut',                      // Эффект "отскока" при прибытии
                onUpdate: (target, ratio) => {
                    // Опционально можно добавить вращение во время движения для корабля
                    if (node === this.heroShip || node === this.enemyShip) {
                        const rotationRange = 5; // Диапазон вращения в градусах
                        const rotAmount = Math.sin(ratio * Math.PI * 2) * rotationRange;
                        const quat = new Quat();
                        Quat.fromEuler(quat, 0, 0, rotAmount);
                        target.rotation = quat;
                    }
                }
            })
            .to(0.2, { scale: new Vec3(1, 1, 1) })     // Анимация масштаба
            .start();
    }

    /**
     * Добавляет анимацию "готовности к бою" для корабля врага
     */
    private animateEnemyReadyToBattle() {
        if (!this.enemyShip) return;
        
        // Создаем эффект покачивания для корабля врага
        tween(this.enemyShip)
            .to(0.15, { scale: new Vec3(1.1, 1.1, 1) })  // Увеличиваем размер
            .to(0.15, { scale: new Vec3(1, 1, 1) })      // Возвращаем к нормальному размеру
            .to(0.15, { scale: new Vec3(1.05, 1.05, 1) }) // Немного увеличиваем
            .to(0.15, { scale: new Vec3(1, 1, 1) })      // Возвращаем к нормальному размеру
            .start();
        
        // Также можно добавить небольшое вращение для динамичности
        const originalPos = this.enemyShip.position.clone();
        tween(this.enemyShip)
            .to(0.2, { position: new Vec3(originalPos.x - 10, originalPos.y, originalPos.z) })
            .to(0.4, { position: new Vec3(originalPos.x + 10, originalPos.y, originalPos.z) })
            .to(0.2, { position: originalPos })
            .start();
    }

    /**
     * Анимирует атаку героя на вражеский корабль
     */
    private animateAttack() {
        if (!this.heroShip || !this.enemyShip) return;
        
        // Эффект выстрела для корабля героя
        const originalHeroPos = this.heroShip.position.clone();
        tween(this.heroShip)
            .to(0.05, { position: new Vec3(originalHeroPos.x, originalHeroPos.y + 20, originalHeroPos.z) })
            .to(0.1, { position: originalHeroPos })
            .start();

        // Можно добавить визуальный эффект выстрела/лазера (упрощенный вариант)
        // В реальном проекте лучше использовать спрайт или частицы для лазера
        const laserStartPos = new Vec3(originalHeroPos.x, originalHeroPos.y + 50, originalHeroPos.z);
        const laserEndPos = new Vec3(this.enemyShip.position.x, this.enemyShip.position.y - 50, this.enemyShip.position.z);
        
        // Здесь в реальном проекте мы бы создали временный узел для лазера
        console.log('Выстрел из позиции', laserStartPos.toString(), 'в позицию', laserEndPos.toString());
    }
    
    /**
     * Анимирует получение урона вражеским кораблем
     */
    private animateEnemyHit() {
        if (!this.enemyShip) return;

        // Эффект тряски при получении урона
        const originalPos = this.enemyShip.position.clone();
        
        // Серия небольших смещений для создания эффекта тряски
        tween(this.enemyShip)
            .to(0.03, { position: new Vec3(originalPos.x + 5, originalPos.y, originalPos.z) })
            .to(0.03, { position: new Vec3(originalPos.x - 5, originalPos.y, originalPos.z) })
            .to(0.03, { position: new Vec3(originalPos.x, originalPos.y + 5, originalPos.z) })
            .to(0.03, { position: new Vec3(originalPos.x, originalPos.y - 5, originalPos.z) })
            .to(0.03, { position: originalPos })
            .start();
        
        // Мигание красным для индикации урона
        const originalScale = this.enemyShip.scale.clone();
        tween(this.enemyShip)
            .to(0.05, { scale: new Vec3(originalScale.x * 1.05, originalScale.y * 1.05, originalScale.z) })
            .to(0.05, { scale: originalScale })
            .start();
    }    /**
     * Анимирует поражение вражеского корабля
     */
    private animateEnemyDefeat() {
        if (!this.enemyShip) return;

        // Отключаем обработчик кликов, чтобы игрок больше не мог взаимодействовать
        this.enemyShip.off(Node.EventType.TOUCH_START, this.onEnemyClick, this);
        
        // Создаем серию эффектов для поражения
        
        // 1. Сильная тряска
        const originalPos = this.enemyShip.position.clone();
        for (let i = 0; i < 5; i++) {
            const offsetX = (Math.random() - 0.5) * 30;
            const offsetY = (Math.random() - 0.5) * 30;
            
            tween(this.enemyShip)
                .delay(i * 0.1)
                .to(0.1, { position: new Vec3(originalPos.x + offsetX, originalPos.y + offsetY, originalPos.z) })
                .start();
        }
        
        // 2. Вращение и затухание
        const endRotation = new Quat();
        Quat.fromEuler(endRotation, 0, 0, 720); // Два полных оборота
        
        tween(this.enemyShip)
            .delay(0.7)
            .to(1.0, { 
                rotation: endRotation,
                scale: new Vec3(0.1, 0.1, 1),
                position: new Vec3(originalPos.x, originalPos.y - 300, originalPos.z)
            }, {
                easing: 'cubicIn'
            })
            .call(() => {
                // Скрываем корабль противника после анимации
                if (this.enemyShip) {
                    this.enemyShip.active = false;
                }
            })
            .start();
        
        // 3. Затухание HUD врага
        if (this.enemyHUD) {
            tween(this.enemyHUD)
                .delay(0.3)
                .to(0.7, { 
                    scale: new Vec3(0.5, 0.5, 1)
                }, {
                    easing: 'cubicOut'
                })
                .call(() => {
                    // Просто скрываем HUD
                    this.enemyHUD.active = false;
                })
                .start();
        }
        
        // 4. Анимация победы для корабля героя
        if (this.heroShip) {
            const heroOriginalPos = this.heroShip.position.clone();
            
            tween(this.heroShip)
                .delay(1.0)
                .to(0.5, { 
                    position: new Vec3(heroOriginalPos.x, heroOriginalPos.y + 50, heroOriginalPos.z),
                    scale: new Vec3(1.2, 1.2, 1)
                })
                .to(0.5, { 
                    position: heroOriginalPos,
                    scale: new Vec3(1, 1, 1)
                })
                .start();
        }
    }

    onDestroy() {
        // Clean up event listeners
        if (this.enemyShip) {
            this.enemyShip.off(Node.EventType.TOUCH_START, this.onEnemyClick, this);
        }
    }
}