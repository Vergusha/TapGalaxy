import { _decorator, Component, Node } from 'cc';
import { SaveManager } from './SaveManager';
import { SpaceshipPanel } from './SpaceshipPanel';
const { ccclass, property } = _decorator;

@ccclass('FightScene')
export class FightScene extends Component {
    @property(Node)
    heroShip: Node = null;

    @property(Node)
    enemyShip: Node = null;

    @property(Node)
    heroHUD: Node = null;

    @property(Node)
    enemyHUD: Node = null;

    start() {
        this.initializePositions();
        
        // Загружаем сохраненные данные для боя
        this.loadSavedGameState();
    }
    
    /**
     * Загружает сохраненное состояние игры для использования в бою
     */
    private loadSavedGameState() {
        if (SaveManager.hasSavedGame()) {
            const progress = SaveManager.loadProgress();
            console.log('Загружаем данные корабля для боя из сохранения');
            
            // Здесь можно использовать сохраненные данные для настройки боя
            // Например, установить характеристики корабля героя на основе сохраненных улучшений
        }
    }

    private initializePositions() {
        // Set initial positions for ships and HUDs
        // Example positions (adjust according to your needs):
        if (this.heroShip) {
            this.heroShip.setPosition(-200, 0, 0);
        }
        if (this.enemyShip) {
            this.enemyShip.setPosition(200, 0, 0);
        }
        if (this.heroHUD) {
            this.heroHUD.setPosition(-300, 200, 0);
        }
        if (this.enemyHUD) {
            this.enemyHUD.setPosition(300, 200, 0);
        }
    }
}