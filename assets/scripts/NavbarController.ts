import { _decorator, Component, Node, Button } from 'cc';
import { UIEvents } from './UIManager';
const { ccclass, property } = _decorator;

@ccclass('NavbarController')
export class NavbarController extends Component {
    @property(Button)
    gameButton: Button = null;
    
    @property(Button)
    miningButton: Button = null;
    
    @property(Button)
    spaceshipButton: Button = null;
    
    @property(Button)
    shopButton: Button = null;
    
    @property(Button)
    settingsButton: Button = null;
    
    start() {
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
        
        if (this.settingsButton) {
            this.settingsButton.node.on(Button.EventType.CLICK, () => {
                UIEvents.emit('toggleSettingsPanel');
            }, this);
        }
    }
    
    // Update the visual state of the buttons (highlight active panel)
    updateButtonStates(activePanel: string) {
        // Reset all buttons to inactive state
        this.gameButton?.node.getComponent(Button)?.normalSprite;
        this.miningButton?.node.getComponent(Button)?.normalSprite;
        this.spaceshipButton?.node.getComponent(Button)?.normalSprite;
        this.shopButton?.node.getComponent(Button)?.normalSprite;
        
        // Set active button
        switch (activePanel) {
            case 'game':
                this.gameButton?.node.getComponent(Button)?.pressedSprite;
                break;
            case 'mining':
                this.miningButton?.node.getComponent(Button)?.pressedSprite;
                break;
            case 'spaceship':
                this.spaceshipButton?.node.getComponent(Button)?.pressedSprite;
                break;
            case 'shop':
                this.shopButton?.node.getComponent(Button)?.pressedSprite;
                break;
        }
    }
}
