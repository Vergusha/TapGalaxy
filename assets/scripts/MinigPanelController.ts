import { _decorator, Component, Node, Label, Button } from 'cc';
import { GamePanelController } from './GamePanelController';
const { ccclass, property } = _decorator;

@ccclass('MiningPanelController')
export class MiningPanelController extends Component {
    @property(GamePanelController)
    gamePanelController: GamePanelController = null;

    @property(Label)
    upgradeCostLabel: Label = null;

    @property(Label)
    levelLabel: Label = null;

    private upgradeCost: number = 10;
    private level: number = 1;

    start() {
        this.updateLabels();
    }

    onUpgradeButtonClick() {
        // Проверяем, хватает ли дилития
        if (this.gamePanelController['dilitium'] >= this.upgradeCost) {
            this.gamePanelController['dilitium'] -= this.upgradeCost;
            this.gamePanelController.upgradeMining();
            this.level += 1;
            this.upgradeCost = Math.floor(this.upgradeCost * 1.5);
            this.updateLabels();
            this.gamePanelController.updateDilitiumText();
        }
    }

    updateLabels() {
        if (this.upgradeCostLabel) this.upgradeCostLabel.string = this.upgradeCost.toString();
        if (this.levelLabel) this.levelLabel.string = this.level.toString();
    }
}