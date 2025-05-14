import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIController')
export class UIController extends Component {
    @property(Node)
    upgradePanel: Node = null!; // Панель апгрейда

    start() {
        // По умолчанию скрыта
        this.upgradePanel.active = false;
    }

    onUpgradeButtonClicked() {
        // Переключаем видимость панели
        this.upgradePanel.active = !this.upgradePanel.active;
    }
}
