import { _decorator, Component, Node, Button, BlockInputEvents } from 'cc';
import { SaveManager } from './SaveManager';
const { ccclass, property } = _decorator;

@ccclass('SettingsPanel')
export class SettingsPanel extends Component {
    @property({ type: Node })
    closeButton: Node = null;

    @property({ type: Node })
    resetButton: Node = null;

    onLoad() {
        // Блокируем клики по подложке
        if (!this.node.getComponent(BlockInputEvents)) {
            this.node.addComponent(BlockInputEvents);
        }
        if (this.closeButton) {
            this.closeButton.on(Button.EventType.CLICK, this.closePanel, this);
        }
        if (this.resetButton) {
            this.resetButton.on(Button.EventType.CLICK, this.onResetProgress, this);
        }
    }

    closePanel() {
        this.node.destroy();
    }

    onResetProgress() {
        SaveManager.resetProgress();
        this.closePanel();
    }
}
