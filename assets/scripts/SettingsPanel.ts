import { _decorator, Component, Node, Button, BlockInputEvents, find } from 'cc';
import { SaveManager } from './SaveManager';
import { TopPanel } from './TopPanel';
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
        // Найти TopPanel и обновить значения на экране
        const topPanelNode = find('Canvas/TopPanel');
        if (topPanelNode) {
            const topPanel = topPanelNode.getComponent(TopPanel);
            if (topPanel) {
                topPanel.setDilithium(0);
                topPanel.setLunar(0);
                topPanel.setPassiveDilithiumIncome(0);
                topPanel.setPassiveLunarIncome(0);
                if (topPanel.updateAllResourceDisplays) topPanel.updateAllResourceDisplays();
            }
        }
        this.closePanel();
    }
}
