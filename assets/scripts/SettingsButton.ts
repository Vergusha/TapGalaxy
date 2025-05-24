import { _decorator, Component, Node, Prefab, instantiate, find } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SettingsButton')
export class SettingsButton extends Component {
    @property({ type: Prefab })
    settingsPanelPrefab: Prefab = null;

    onLoad() {
        this.node.on(Node.EventType.MOUSE_DOWN, this.openSettingsPanel, this);
    }

    openSettingsPanel() {
        if (!this.settingsPanelPrefab) {
            console.error('SettingsPanel prefab is not assigned in SettingsButton.');
            return;
        }
        const canvas = find('Canvas');
        if (!canvas) {
            console.error('Canvas not found in the scene.');
            return;
        }
        const panel = instantiate(this.settingsPanelPrefab);
        canvas.addChild(panel);
    }
}
