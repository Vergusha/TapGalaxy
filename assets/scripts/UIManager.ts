import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

// Event system for UI-related events
export class UIEvents {
    private static handlers: {[eventName: string]: Function[]} = {};
    
    static on(eventName: string, handler: Function, target?: any) {
        if (!this.handlers[eventName]) {
            this.handlers[eventName] = [];
        }
        handler = target ? handler.bind(target) : handler;
        this.handlers[eventName].push(handler);
    }
    
    static off(eventName: string, handler: Function, target?: any) {
        if (!this.handlers[eventName]) return;
        
        const idx = this.handlers[eventName].indexOf(handler);
        if (idx !== -1) {
            this.handlers[eventName].splice(idx, 1);
        }
    }
    
    static emit(eventName: string, ...args: any[]) {
        if (!this.handlers[eventName]) return;
        
        for (const handler of this.handlers[eventName]) {
            handler(...args);
        }
    }
}

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

    @property(Node)
    traderPanel: Node = null;

    private static _instance: UIManager = null;
    
    // Keep track of which panel is currently active
    private currentPanel: Node = null;

    onLoad() {
        // Create a singleton instance
        if (UIManager._instance !== null) {
            this.destroy();
            return;
        }
        UIManager._instance = this;
        
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
        // Default to the game panel at start
        this.showGamePanel();
    }

    // Get singleton instance
    public static getInstance(): UIManager {
        return UIManager._instance;
    }

    // Helper method to show a panel and hide all others
    showPanel(panel: Node) {
        if (!panel) return;
        
        // Hide current panel
        if (this.currentPanel) {
            this.currentPanel.active = false;
        }
        
        // Show new panel
        panel.active = true;
        this.currentPanel = panel;
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
    }    showSettingsPanel() {
        if (this.settingsPanel) {
            // Store the currently active panel before showing settings
            if (this.currentPanel) {
                // Don't change currentPanel reference, just hide it temporarily
                this.currentPanel.active = false;
            }
            this.settingsPanel.active = true;
        }
    }

    hideSettingsPanel() {
        if (this.settingsPanel) {
            this.settingsPanel.active = false;
            // Restore the previously active panel
            if (this.currentPanel) {
                this.currentPanel.active = true;
            }
        }
    }

    toggleSettingsPanel() {
        if (this.settingsPanel) {
            if (this.settingsPanel.active) {
                this.hideSettingsPanel();
            } else {
                this.showSettingsPanel();
            }
        }
    }

    isSettingsPanelVisible(): boolean {
        return this.settingsPanel && this.settingsPanel.active;
    }    // Trader panel methods
    showTraderPanel() {
        if (this.traderPanel) {
            // Store the currently active panel before showing trader
            if (this.currentPanel) {
                // Don't change currentPanel reference, just hide it temporarily
                this.currentPanel.active = false;
            }
            this.traderPanel.active = true;
        }
    }

    hideTraderPanel() {
        if (this.traderPanel) {
            this.traderPanel.active = false;
            // Restore the previously active panel
            if (this.currentPanel) {
                this.currentPanel.active = true;
            }
        }
    }

    toggleTraderPanel() {
        if (this.traderPanel) {
            if (this.traderPanel.active) {
                this.hideTraderPanel();
            } else {
                this.showTraderPanel();
            }
        }
    }

    isTraderPanelVisible(): boolean {
        return this.traderPanel && this.traderPanel.active;
    }
}
