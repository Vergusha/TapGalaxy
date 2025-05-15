import { _decorator, Component, Node, EventTarget } from 'cc';
const { ccclass, property } = _decorator;

// Create a global event target
export const UIEvents = new EventTarget();

@ccclass('UIManager')
export class UIManager extends Component {
    @property(Node)
    gamePanel: Node = null;

    @property(Node)
    miningPanel: Node = null;

    @property(Node)
    spaceshipPanel: Node = null;

    @property(Node)
    shopPanel: Node = null;

    private static _instance: UIManager = null;
    
    // Add this line to declare the currentPanel property
    private currentPanel: Node = null;

    onLoad() {
        // Register event listeners
        UIEvents.on('showGamePanel', this.showGamePanel, this);
        UIEvents.on('showMiningPanel', this.showMiningPanel, this);
        UIEvents.on('showSpaceshipPanel', this.showSpaceshipPanel, this);
        UIEvents.on('showShopPanel', this.showShopPanel, this);
    }

    onDestroy() {
        // Clean up event listeners
        UIEvents.off('showGamePanel', this.showGamePanel, this);
        UIEvents.off('showMiningPanel', this.showMiningPanel, this);
        UIEvents.off('showSpaceshipPanel', this.showSpaceshipPanel, this);
        UIEvents.off('showShopPanel', this.showShopPanel, this);
    }

    protected start() {
        this.showPanel(this.gamePanel);
    }

    showPanel(panel: Node) {
        if(this.currentPanel) {
            this.currentPanel.active = false;
        }
        if (panel) {
            panel.active = true;
            this.currentPanel = panel;
        }
    }
    
    showGamePanel() {
        this.showPanel(this.gamePanel);
    }

    showMiningPanel() {
        this.showPanel(this.miningPanel);
    }
    
    showSpaceshipPanel() {
        this.showPanel(this.spaceshipPanel);
    }
    
    showShopPanel() {
        this.showPanel(this.shopPanel);
    }
}


