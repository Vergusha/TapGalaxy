import { _decorator, Component, Node } from 'cc';
import { UIEvents } from './UIManager';
const { ccclass, property } = _decorator;

@ccclass('TraderPanelController')
export class TraderPanelController extends Component {
    @property(Node)
    closeButton: Node = null;

    start() {
        // Initialize close button click handler
        if (this.closeButton) {
            this.closeButton.on(Node.EventType.TOUCH_END, this.onCloseButtonClick, this);
        }
    }

    onCloseButtonClick() {
        UIEvents.emit('hideTraderPanel');
    }
}