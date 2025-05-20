import { _decorator, Component, Node, EventMouse, find } from 'cc';
import { TopPanel } from './TopPanel';
const { ccclass } = _decorator;

@ccclass('Planet')
export class Planet extends Component {
    onLoad() {
        this.node.on(Node.EventType.MOUSE_DOWN, this.onClick, this);
    }

    onClick(event: EventMouse) {
        // Найти TopPanel в сцене (например, Canvas/TopPanel)
        const topPanelNode = find('Canvas/TopPanel');
        if (topPanelNode) {
            const topPanel = topPanelNode.getComponent(TopPanel);
            if (topPanel) {
                topPanel.addDilithium(1);
            }
        }
    }
}