import { _decorator, Component, Node, Prefab, instantiate } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BottomPanel')
export class BottomPanel extends Component {
    @property({ type: Node })
    miningButton: Node = null;

    @property({ type: Prefab })
    miningPanelPrefab: Prefab = null;

    private miningPanelInstance: Node = null;

    start() {
        this.miningButton.on(Node.EventType.MOUSE_DOWN, this.toggleMiningPanel, this);
    }

    toggleMiningPanel() {
        const canvas = this.node.scene.getChildByName('Canvas');
        if (this.miningPanelInstance && this.miningPanelInstance.isValid) {
            this.miningPanelInstance.destroy();
            this.miningPanelInstance = null;
        } else {
            this.miningPanelInstance = instantiate(this.miningPanelPrefab);
            if (canvas) {
                canvas.addChild(this.miningPanelInstance);
            } else {
                this.node.addChild(this.miningPanelInstance);
            }
        }
    }
}