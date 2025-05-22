import { _decorator, Component, Node, Prefab, instantiate, find, EventMouse } from 'cc';

const { ccclass, property } = _decorator;

export interface ITraderInteraction {
    notifyPanelClosed(panel: Node): void;
    hasOpenPanel(): boolean;
    closePanel(): void;
}

@ccclass('TraderInteraction')
export class TraderInteraction extends Component implements ITraderInteraction {
    @property({ type: Prefab })
    traderPanelPrefab: Prefab = null;

    private traderPanelInstance: Node | null = null;

    // Реализация интерфейса ITraderInteraction
    public hasOpenPanel(): boolean {
        return !!(this.traderPanelInstance && this.traderPanelInstance.isValid);
    }

    public closePanel(): void {
        if (this.traderPanelInstance && this.traderPanelInstance.isValid) {
            this.traderPanelInstance.destroy();
            this.traderPanelInstance = null;
        }
    }

    public notifyPanelClosed(panel: Node): void {
        if (this.traderPanelInstance === panel) {
            this.traderPanelInstance = null;
        }
    }

    onLoad() {
        this.node.on(Node.EventType.MOUSE_DOWN, this.onClick, this);
    }

    onClick(event: EventMouse) {
        if (this.hasOpenPanel()) {
            console.log("TraderPanel is already open.");
            return;
        }

        if (!this.traderPanelPrefab) {
            console.error("TraderPanel prefab is not assigned in TraderInteraction script.");
            return;
        }

        const canvas = find('Canvas');
        if (!canvas) {
            console.error("Canvas not found in the scene.");
            return;
        }

        this.traderPanelInstance = instantiate(this.traderPanelPrefab);
        canvas.addChild(this.traderPanelInstance);
    }

    onDestroy() {
        this.node.off(Node.EventType.MOUSE_DOWN, this.onClick, this);
        this.closePanel();
    }
}