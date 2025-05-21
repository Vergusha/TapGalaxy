import { _decorator, Component, Node, Prefab, instantiate, find } from 'cc';
import { TopPanel } from './TopPanel'; // Импортируем TopPanel
import { MiningPanel } from './MiningPanel'; // Импортируем MiningPanel
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
        if (this.miningPanelInstance && this.miningPanelInstance.isValid) {
            this.miningPanelInstance.destroy();
            this.miningPanelInstance = null;
            return;
        }

        if (!this.miningPanelPrefab) {
            console.error("MiningPanel prefab is not assigned in BottomPanel script.");
            return;
        }

        const canvas = find('Canvas');
        if (!canvas) {
            console.error("Canvas not found in the scene.");
            return;
        }

        this.miningPanelInstance = instantiate(this.miningPanelPrefab);
        canvas.addChild(this.miningPanelInstance);

        // Находим TopPanel в сцене
        const topPanelNode = find('Canvas/TopPanel');
        if (!topPanelNode) {
            console.error("TopPanel not found in the scene.");
            return;
        }
        const topPanelComponent = topPanelNode.getComponent(TopPanel);
        if (!topPanelComponent) {
            console.error("TopPanel component not found on TopPanel node.");
            return;
        }

        // Получаем компонент MiningPanel и передаем ему TopPanel
        const miningPanelComponent = this.miningPanelInstance.getComponent(MiningPanel);
        if (miningPanelComponent) {
            miningPanelComponent.setTopPanel(topPanelComponent); // Создаем метод setTopPanel
        } else {
            console.error("MiningPanel component not found on instantiated MiningPanel.");
        }
    }
}