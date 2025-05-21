import { _decorator, Component, Node, Prefab, instantiate, find } from 'cc';
import { TopPanel } from './TopPanel';
import { MiningPanel } from './MiningPanel';
import { SpaceshipPanel } from './SpaceshipPanel';

const { ccclass, property } = _decorator;

@ccclass('BottomPanel')
export class BottomPanel extends Component {
    @property({ type: Node })
    miningButton: Node = null;

    @property({ type: Node })
    spaceshipButton: Node = null; // Add new button reference

    @property({ type: Prefab })
    miningPanelPrefab: Prefab = null;

    @property({ type: Prefab })
    spaceshipPanelPrefab: Prefab = null; // Add new prefab reference

    private miningPanelInstance: Node = null;
    private spaceshipPanelInstance: Node = null; // Add new instance reference

    start() {
        this.miningButton.on(Node.EventType.MOUSE_DOWN, this.toggleMiningPanel, this);
        // Add new button listener
        if (this.spaceshipButton) {
            this.spaceshipButton.on(Node.EventType.MOUSE_DOWN, this.toggleSpaceshipPanel, this);
        } else {
            console.warn("SpaceshipButton not assigned in BottomPanel");
        }
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

    toggleSpaceshipPanel() {
        if (this.spaceshipPanelInstance && this.spaceshipPanelInstance.isValid) {
            this.spaceshipPanelInstance.destroy();
            this.spaceshipPanelInstance = null;
            return;
        }

        if (!this.spaceshipPanelPrefab) {
            console.error("SpaceshipPanel prefab is not assigned in BottomPanel script.");
            return;
        }

        const canvas = find('Canvas');
        if (!canvas) {
            console.error("Canvas not found in the scene.");
            return;
        }

        this.spaceshipPanelInstance = instantiate(this.spaceshipPanelPrefab);
        canvas.addChild(this.spaceshipPanelInstance);

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

        const spaceshipPanelComponent = this.spaceshipPanelInstance.getComponent(SpaceshipPanel);
        if (spaceshipPanelComponent) {
            spaceshipPanelComponent.setTopPanel(topPanelComponent);
        } else {
            console.error("SpaceshipPanel component not found on instantiated SpaceshipPanel.");
        }
    }
}