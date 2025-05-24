import { _decorator, Component, Node, Prefab, instantiate, find, EventMouse } from 'cc';
import { DialogManager } from './DialogManager';
import { DialogData } from './DialogSystem';

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

    @property({ type: Boolean })
    showDialogBeforeTrading: boolean = true;

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
    }    onClick(event: EventMouse) {
        if (this.hasOpenPanel()) {
            console.log("TraderPanel is already open.");
            return;
        }

        if (!this.traderPanelPrefab) {
            console.error("TraderPanel prefab is not assigned in TraderInteraction script.");
            return;
        }

        // Показать диалог торговца перед открытием панели
        if (this.showDialogBeforeTrading) {
            this.showTraderDialog();
        } else {
            this.openTraderPanel();
        }
    }

    private showTraderDialog() {
        const traderDialogs: DialogData[] = [
            {
                speaker: "Торговец",
                text: "Добро пожаловать в мой магазин, путешественник!",
                avatarIndex: 0 // Индекс аватара торговца
            },
            {
                speaker: "Торговец", 
                text: "У меня есть отличные предложения по обмену ресурсов.",
                avatarIndex: 0
            },
            {
                speaker: "Торговец",
                text: "Давайте посмотрим, что я могу вам предложить...",
                avatarIndex: 0
            }
        ];

        const dialogManager = DialogManager.getInstance();
        if (dialogManager) {
            dialogManager.showDialog(traderDialogs, () => {
                // После завершения диалога открыть панель торговца
                this.openTraderPanel();
            });
        } else {
            // Если DialogManager недоступен, просто открыть панель
            this.openTraderPanel();
        }
    }

    private openTraderPanel() {
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