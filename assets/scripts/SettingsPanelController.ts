import { _decorator, Component, Node, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SettingsPanelController')
export class SettingsPanelController extends Component {
    start() {
        // Добавляем обработчик событий на весь панельный фон
        this.node.on(Node.EventType.TOUCH_START, this.blockEvent, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.blockEvent, this);
        this.node.on(Node.EventType.TOUCH_END, this.blockEvent, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.blockEvent, this);
    }

    // Этот метод блокирует события, не давая им распространяться дальше
    blockEvent(event) {
        // Останавливаем распространение события
        event.propagationStopped = true;
        event.propagationImmediateStopped = true;
    }
}