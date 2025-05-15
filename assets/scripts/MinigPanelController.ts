import { _decorator, Component, Label, Node } from 'cc';
import { GamePanelController } from './GamePanelController';
const { ccclass, property } = _decorator;

type Upgrade = {
    name: string;
    level: number;
    baseCost: number;
    cost: number;
    effect: number;
    nameLabel?: Label;
    levelLabel?: Label;
    costLabel?: Label;
    buyButton?: Node;
};

@ccclass('MiningPanelController')
export class MiningPanelController extends Component {
    @property(GamePanelController)
    gamePanelController: GamePanelController = null;

    @property([Label])
    upgradeNameLabels: Label[] = [];

    @property([Label])
    upgradeLevelLabels: Label[] = [];

    @property([Label])
    upgradeCostLabels: Label[] = [];

    @property([Node])
    upgradeBuyButtons: Node[] = [];

    private upgrades: Upgrade[] = [
        { name: 'Бур', level: 1, baseCost: 10, cost: 10, effect: 1 },
        { name: 'Шахтер', level: 1, baseCost: 50, cost: 50, effect: 5 },
        { name: 'Дрон', level: 1, baseCost: 200, cost: 200, effect: 20 },
    ];

    start() {
        // Привязываем лейблы и кнопки к апгрейдам
        for (let i = 0; i < this.upgrades.length; i++) {
            this.upgrades[i].nameLabel = this.upgradeNameLabels[i];
            this.upgrades[i].levelLabel = this.upgradeLevelLabels[i];
            this.upgrades[i].costLabel = this.upgradeCostLabels[i];
            this.upgrades[i].buyButton = this.upgradeBuyButtons[i];
            // Вешаем обработчик на каждую кнопку
            if (this.upgrades[i].buyButton) {
                this.upgrades[i].buyButton.on(Node.EventType.TOUCH_END, () => this.buyUpgrade(i), this);
            }
        }
        this.updateAllLabels();
    }

    buyUpgrade(index: number) {
        const upgrade = this.upgrades[index];
        if (this.gamePanelController['dilitium'] >= upgrade.cost) {
            this.gamePanelController['dilitium'] -= upgrade.cost;
            upgrade.level += 1;
            upgrade.cost = Math.floor(upgrade.baseCost * Math.pow(1.5, upgrade.level - 1));
            this.gamePanelController['dilitiumPerClick'] += upgrade.effect;
            this.updateAllLabels();
            this.gamePanelController.updateDilitiumText();
        }
    }

    updateAllLabels() {
        for (let i = 0; i < this.upgrades.length; i++) {
            const upg = this.upgrades[i];
            if (upg.nameLabel) upg.nameLabel.string = upg.name;
            if (upg.levelLabel) upg.levelLabel.string = `Ур. ${upg.level}`;
            if (upg.costLabel) upg.costLabel.string = `${upg.cost}`;
        }
    }
}