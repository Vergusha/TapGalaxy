import { _decorator, Component, Node } from 'cc';
import { CurrencyManager } from './CurrencyManager';
const { ccclass, property } = _decorator;

@ccclass('SpaceshipPanelController')
export class SpaceshipPanelController extends Component {
    private currencyManager: CurrencyManager = null;

    start() {
        this.currencyManager = CurrencyManager.getInstance();
        
        // Spaceship panel implementation will be added in the future
        // Currently, this is a placeholder for future game features
    }

    update(deltaTime: number) {
        // No specific update logic for SpaceshipPanelController at this time
    }
}


