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

    @property(Node)
    settingsPanel: Node = null;

    // Add this property to UIManager class
    @property(Node)
    traderPanel: Node = null; // Reference to the trader panel

    private static _instance: UIManager = null;
    
    // Add this line to declare the currentPanel property
    private currentPanel: Node = null;

    onLoad() {
        // Register event listeners
        UIEvents.on('showGamePanel', this.showGamePanel, this);
        UIEvents.on('showMiningPanel', this.showMiningPanel, this);
        UIEvents.on('showSpaceshipPanel', this.showSpaceshipPanel, this);
        UIEvents.on('showShopPanel', this.showShopPanel, this);
        UIEvents.on('showSettingsPanel', this.showSettingsPanel, this);
        UIEvents.on('hideSettingsPanel', this.hideSettingsPanel, this);
        UIEvents.on('toggleSettingsPanel', this.toggleSettingsPanel, this);
        
        // Add trader panel events
        UIEvents.on('showTraderPanel', this.showTraderPanel, this);
        UIEvents.on('hideTraderPanel', this.hideTraderPanel, this);
        UIEvents.on('toggleTraderPanel', this.toggleTraderPanel, this);
    }

    onDestroy() {
        // Clean up event listeners
        UIEvents.off('showGamePanel', this.showGamePanel, this);
        UIEvents.off('showMiningPanel', this.showMiningPanel, this);
        UIEvents.off('showSpaceshipPanel', this.showSpaceshipPanel, this);
        UIEvents.off('showShopPanel', this.showShopPanel, this);
        UIEvents.off('showSettingsPanel', this.showSettingsPanel, this);
        UIEvents.off('hideSettingsPanel', this.hideSettingsPanel, this);
        UIEvents.off('toggleSettingsPanel', this.toggleSettingsPanel, this);
        
        // Clean up trader panel events
        UIEvents.off('showTraderPanel', this.showTraderPanel, this);
        UIEvents.off('hideTraderPanel', this.hideTraderPanel, this);
        UIEvents.off('toggleTraderPanel', this.toggleTraderPanel, this);
    }

    protected start() {
        this.showPanel(this.gamePanel);
        
        // Hide settings and trader panels on start
        if (this.settingsPanel) {
            this.settingsPanel.active = false;
        }
        
        if (this.traderPanel) {
            this.traderPanel.active = false;
        }
    }

    showPanel(panel: Node) {
        // Деактивируем все панели
        if (this.gamePanel) this.gamePanel.active = false;
        if (this.miningPanel) this.miningPanel.active = false;
        if (this.spaceshipPanel) this.spaceshipPanel.active = false;
        if (this.shopPanel) this.shopPanel.active = false;

        // Активируем только нужную панель
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

    showSettingsPanel() {
        if (this.settingsPanel) {
            this.settingsPanel.active = true;
        }
    }

    hideSettingsPanel() {
        if (this.settingsPanel) {
            this.settingsPanel.active = false;
        }
    }

    toggleSettingsPanel() {
        if (this.settingsPanel) {
            this.settingsPanel.active = !this.settingsPanel.active;
        }
    }

    isSettingsPanelVisible(): boolean {
        return this.settingsPanel && this.settingsPanel.active;
    }

    // Update trader panel methods
    showTraderPanel() {
        if (this.traderPanel) {
            this.traderPanel.active = true;
        }
    }

    hideTraderPanel() {
        if (this.traderPanel) {
            this.traderPanel.active = false;
        }
    }

    toggleTraderPanel() {
        if (this.traderPanel) {
            this.traderPanel.active = !this.traderPanel.active;
        }
    }

    isTraderPanelVisible(): boolean {
        return this.traderPanel && this.traderPanel.active;
    }
}


