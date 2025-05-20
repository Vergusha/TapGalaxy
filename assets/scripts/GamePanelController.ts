import { _decorator, Component, Node, Button, find } from 'cc';
import { CurrencyManager } from './CurrencyManager';
import { UIEvents } from './UIManager';
import { AudioManager } from './AudioManager';
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
        
        // Находим компоненты в префабе, если они не были назначены в редакторе
        if (!this.planetNode) {
            this.planetNode = this.node.getChildByName('Planet');
        }
        
        if (!this.traderNode) {
            this.traderNode = this.node.getChildByName('Trader');
        }
        
        // Find buttons if not assigned
        if (!this.gameButton) {
            const navBar = this.node.parent.getChildByName('BottomPanel');
            if (navBar) {
                this.gameButton = navBar.getChildByName('GameButton')?.getComponent(Button);
            }
        }
        
        if (!this.miningButton) {
            const navBar = this.node.parent.getChildByName('BottomPanel');
            if (navBar) {
                this.miningButton = navBar.getChildByName('MiningButton')?.getComponent(Button);
            }
        }
        
        if (!this.spaceshipButton) {
            const navBar = this.node.parent.getChildByName('BottomPanel');
            if (navBar) {
                this.spaceshipButton = navBar.getChildByName('SpaceshipButton')?.getComponent(Button);
            }
        }
        
        if (!this.shopButton) {
            const navBar = this.node.parent.getChildByName('BottomPanel');
            if (navBar) {
                this.shopButton = navBar.getChildByName('ShopButton')?.getComponent(Button);
            }
        }
        
        // Set up planet click
        if (this.planetNode) {
            this.planetNode.on(Node.EventType.TOUCH_END, this.onPlanetClick, this);
        } else {
            console.error('Planet node not found in GamePanel prefab');
        }
        
        // Set up trader click
        if (this.traderNode) {
            this.traderNode.on(Node.EventType.TOUCH_END, this.onTraderClick, this);
        } else {
            console.warn('Trader node not found in GamePanel prefab');
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
            const amount = this.currencyManager.getDilithiumPerClick();
            this.currencyManager.addDilithium(amount);
            
            // Play sound effect
            const audioManager = AudioManager.getInstance();
            if (audioManager) {
                audioManager.playResourceGain();
            }
            
            // Occasionally log resource gain instead of showing a notification
            if (Math.random() < 0.05) { // 5% chance
                console.log(`+${this.currencyManager.formatNumber(amount)} дилития!`);
            }
        }
    }
    
    // Handle trader click - open trader panel
    private onTraderClick() {
        UIEvents.emit('toggleTraderPanel');
        
        // Play button click sound
        const audioManager = AudioManager.getInstance();
        if (audioManager) {
            audioManager.playButtonClick();
        }
    }
}


