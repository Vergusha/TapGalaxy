import { _decorator, Button, Component, Node, CCString } from 'cc';
import { UIEvents } from './UIManager';
const { ccclass, property } = _decorator;

@ccclass('PanelButton')
export class PanelButton extends Component {
    @property({
        type: CCString,
        tooltip: 'Event to trigger when clicked',
        readonly: false,
        // For enum in Cocos Creator, we use the correct format
        enum: [
            'showGamePanel',
            'showMiningPanel',
            'showSpaceshipPanel',
            'showShopPanel'
        ]
    })
    eventToTrigger: string = 'showGamePanel';
    
    start() {
        const button = this.getComponent(Button);
        if (button) {
            button.node.on(Button.EventType.CLICK, this.onButtonClick, this);
        }
    }
    
    onButtonClick() {
        UIEvents.emit(this.eventToTrigger);
    }
}