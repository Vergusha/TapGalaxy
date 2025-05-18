import { _decorator, Component, Node, Button } from 'cc';
import { CurrencyManager } from './CurrencyManager';
import { UIEvents } from './UIManager';
const { ccclass, property } = _decorator;

@ccclass('ShopPanelController')
export class ShopPanelController extends Component {
    private currencyManager: CurrencyManager = null;

    @property(Button)
    closeButton: Button = null;    start() {
        this.currencyManager = CurrencyManager.getInstance();
        
        // Shop panel implementation will be added in the future
        // Currently, this is a placeholder for future game features
        
        // Set up close button if it exists
        if (this.closeButton) {
            this.closeButton.node.on(Button.EventType.CLICK, this.onCloseButtonClick, this);
        }
    }

    update(deltaTime: number) {
        // No specific update logic for ShopPanelController at this time
    }

    // Close button click handler
    private onCloseButtonClick() {
        // Показываем Game Panel
        UIEvents.emit('showGamePanel');
    }
}


