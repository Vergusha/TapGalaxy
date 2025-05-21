import { _decorator, Component, Node, Prefab, instantiate, find, EventMouse } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('TraderInteraction')
export class TraderInteraction extends Component {
    @property({ type: Prefab })
    traderPanelPrefab: Prefab = null;

    private traderPanelInstance: Node | null = null;

    onLoad() {
        this.node.on(Node.EventType.MOUSE_DOWN, this.onClick, this);
    }

    onClick(event: EventMouse) {
        // Если панель уже открыта, не делаем ничего (или можно ее закрывать/переоткрывать)
        // Для простоты, пока просто не даем открыть вторую.
        // TraderPanel сама должна будет позаботиться о своем закрытии.
        if (this.traderPanelInstance && this.traderPanelInstance.isValid) {
            console.log("TraderPanel is already open.");
            // Опционально: можно сделать так, чтобы повторный клик закрывал панель
            // this.traderPanelInstance.destroy();
            // this.traderPanelInstance = null;
            return;
        }

        if (!this.traderPanelPrefab) {
            console.error("TraderPanel prefab is not assigned in TraderInteraction script.");
            return;
        }

        const canvas = find('Canvas'); // Ищем Canvas в сцене
        if (!canvas) {
            console.error("Canvas not found in the scene.");
            return;
        }

        this.traderPanelInstance = instantiate(this.traderPanelPrefab);
        canvas.addChild(this.traderPanelInstance);
        
        // Опционально: можно позиционировать панель
        // this.traderPanelInstance.setPosition(0, 0); // Например, в центр канваса
    }

    onDestroy() {
        this.node.off(Node.EventType.MOUSE_DOWN, this.onClick, this);
        // Если панель трейдера еще существует, когда объект трейдера уничтожается,
        // возможно, ее тоже стоит закрыть.
        if (this.traderPanelInstance && this.traderPanelInstance.isValid) {
            // this.traderPanelInstance.destroy();
        }
    }
}