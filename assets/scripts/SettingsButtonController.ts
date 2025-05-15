import { _decorator, Component, Node } from 'cc';
import { UIEvents } from './UIManager';
const { ccclass, property } = _decorator;

@ccclass('SettingsButtonController')
export class SettingsButtonController extends Component {
    start() {
        this.node.on(Node.EventType.TOUCH_END, this.onButtonClick, this);
    }

    onButtonClick() {
        // Отправляем событие для переключения панели настроек
        UIEvents.emit('toggleSettingsPanel');
    }
}