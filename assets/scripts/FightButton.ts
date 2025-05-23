import { _decorator, Component, Node, Button, director, Prefab, instantiate } from 'cc';
import { SaveManager } from './SaveManager';
import { FightTimer } from './FightTimer';
const { ccclass, property } = _decorator;

@ccclass('FightButton')
export class FightButton extends Component {
    @property({type: Prefab})
    enemyHUDPrefab: Prefab = null;

    @property({type: Prefab})
    enemyShipPrefab: Prefab = null;

    @property({type: Prefab})
    heroHUDPrefab: Prefab = null;

    @property({type: Prefab})
    heroShipPrefab: Prefab = null;

    private button: Button = null;
    private fightTimer: FightTimer = null;

    start() {
        // Get button component
        this.button = this.getComponent(Button);
        // Найти FightTimer на FightNode
        const fightNode = this.node.parent;
        if (fightNode) {
            this.fightTimer = fightNode.getComponent(FightTimer);
        }
        // Add click event listener
        if (this.button) {
            this.button.node.on('click', this.onFightButtonClick, this);
        }
    }    private onFightButtonClick() {
        // Проверяем, готов ли бой
        if (!this.fightTimer || !this.fightTimer.canFight()) {
            console.log('Бой недоступен: таймер не готов');
            return;
        }
        // Сохраняем текущее состояние перед боем
        SaveManager.saveProgress();
        
        // Load the Fight scene
        director.loadScene('Fight', (err) => {
            if (err) {
                console.error('Failed to load Fight scene:', err);
                return;
            }
            console.log('Successfully loaded Fight scene');
            this.initializeFightScene();
            // Сбросить таймер после боя
            if (this.fightTimer) {
                this.fightTimer.resetTimer();
            }
        });
    }

    private initializeFightScene() {
        const scene = director.getScene();
        if (!scene) return;

        // Создаем и размещаем префабы врага
        if (this.enemyHUDPrefab && this.enemyShipPrefab) {
            const enemyHUD = instantiate(this.enemyHUDPrefab);
            const enemyShip = instantiate(this.enemyShipPrefab);
            scene.addChild(enemyHUD);
            scene.addChild(enemyShip);
        }

        // Создаем и размещаем префабы героя
        if (this.heroHUDPrefab && this.heroShipPrefab) {
            const heroHUD = instantiate(this.heroHUDPrefab);
            const heroShip = instantiate(this.heroShipPrefab);
            scene.addChild(heroHUD);
            scene.addChild(heroShip);
        }
    }

    onDestroy() {
        // Clean up event listener
        if (this.button) {
            this.button.node.off('click', this.onFightButtonClick, this);
        }
    }
}