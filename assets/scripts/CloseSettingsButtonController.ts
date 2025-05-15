import { _decorator, Component, Node } from 'cc';
import { UIEvents } from './UIManager';
const { ccclass, property } = _decorator;

@ccclass('CloseSettingsButtonController')
export class CloseSettingsButtonController extends Component {
    start() {
        this.node.on(Node.EventType.TOUCH_END, this.onButtonClick, this);
    }

    onButtonClick(event) {
        // Останавливаем распространение события
        event.propagationStopped = true;
        
        // Отправляем событие для скрытия панели настроек
        UIEvents.emit('hideSettingsPanel');
    }
}