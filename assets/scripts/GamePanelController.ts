import { _decorator, Component, Node, Button } from 'cc';
import { CurrencyManager } from './CurrencyManager';
import { UIEvents } from './UIManager';
const { ccclass, property } = _decorator;

@ccclass('GamePanelController')
export class GamePanelController extends Component {
    @property(Node)
    planetNode: Node = null;

    @property(Node)
    traderNode: Node = null;

    @property(Button)
    gameButton: Button = null;

    @property(Button)
    miningButton: Button = null;

    @property(Button)
    spaceshipButton: Button = null;

    @property(Button)
    shopButton: Button = null;

    private currencyManager: CurrencyManager = null;
    
    start() {
        this.currencyManager = CurrencyManager.getInstance();
        
        // Set up planet click
        if (this.planetNode) {
            this.planetNode.on(Node.EventType.TOUCH_END, this.onPlanetClick, this);
        }
        
        // Set up trader click
        if (this.traderNode) {
            this.traderNode.on(Node.EventType.TOUCH_END, this.onTraderClick, this);
        }
        
        // Set up panel navigation buttons
        if (this.gameButton) {
            this.gameButton.node.on(Button.EventType.CLICK, () => {
                UIEvents.emit('showGamePanel');
            }, this);
        }
        
        if (this.miningButton) {
            this.miningButton.node.on(Button.EventType.CLICK, () => {
                UIEvents.emit('showMiningPanel');
            }, this);
        }
        
        if (this.spaceshipButton) {
            this.spaceshipButton.node.on(Button.EventType.CLICK, () => {
                UIEvents.emit('showSpaceshipPanel');
            }, this);
        }
        
        if (this.shopButton) {
            this.shopButton.node.on(Button.EventType.CLICK, () => {
                UIEvents.emit('showShopPanel');
            }, this);
        }
    }

    update(deltaTime: number) {
        // No specific update logic for GamePanelController
    }
    
    // Handle planet click - player gets dilithium
    private onPlanetClick() {
        if (this.currencyManager) {
            this.currencyManager.addDilithium(this.currencyManager.getDilithiumPerClick());
        }
    }
    
    // Handle trader click - open trader panel
    private onTraderClick() {
        UIEvents.emit('toggleTraderPanel');
    }
}


