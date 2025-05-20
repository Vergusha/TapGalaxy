import { _decorator, Component, Prefab, instantiate, Node, resources } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('OpenGamePanel')
export class OpenGamePanel extends Component {
    @property({ type: Prefab })
    gamePanelPrefab: Prefab = null;

    @property({ type: Prefab })
    topPanelPrefab: Prefab = null;

    @property({ type: Prefab })
    bottomPanelPrefab: Prefab = null;

    start() {
        // Создаём Game_Panel
        const gamePanel = instantiate(this.gamePanelPrefab);
        this.node.addChild(gamePanel);

        const topPanel=instantiate(this.topPanelPrefab)
        this.node.addChild(topPanel);

        const bottomPanel=instantiate(this.bottomPanelPrefab)
        this.node.addChild(bottomPanel);
    }
}