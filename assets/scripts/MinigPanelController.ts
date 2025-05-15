import { _decorator, Component, Label, Node, Prefab, instantiate } from 'cc';
import { GamePanelController } from './GamePanelController';
const { ccclass, property } = _decorator;

type Upgrade = {
    name: string;
    level: number;
    baseCost: number;
    cost: number;
    effect: number;
};

@ccclass('MiningPanelController')
export class MiningPanelController extends Component {
    @property(GamePanelController)
    gamePanelController: GamePanelController = null;

    @property(Prefab)
    upgradeItemPrefab: Prefab = null;

    @property(Node)
    upgradesContainer: Node = null; // Контейнер для апгрейдов (например, Vertical Layout)

    private upgrades: Upgrade[] = [
        { name: 'Бур', level: 1, baseCost: 10, cost: 10, effect: 1 },
        { name: 'Шахтер', level: 1, baseCost: 50, cost: 50, effect: 5 },
        { name: 'Дрон', level: 1, baseCost: 200, cost: 200, effect: 20 },
    ];

    start() {
        for (let i = 0; i < this.upgrades.length; i++) {
            const upg = this.upgrades[i];
            const item = instantiate(this.upgradeItemPrefab);
            this.upgradesContainer.addChild(item);

            // Получаем компоненты внутри префаба
            const nameLabel = item.getChildByName('NameLabel')?.getComponent(Label);
            const levelLabel = item.getChildByName('LevelLabel')?.getComponent(Label);
            const costLabel = item.getChildByName('CostLabel')?.getComponent(Label);
            const buyButton = item.getChildByName('BuyButton');

            if (nameLabel) nameLabel.string = upg.name;
            if (levelLabel) levelLabel.string = `Ур. ${upg.level}`;
            if (costLabel) costLabel.string = `${upg.cost}`;

            if (buyButton) {
                buyButton.on(Node.EventType.TOUCH_END, () => {
                    this.buyUpgrade(i, levelLabel, costLabel);
                }, this);
            }
        }
    }

    buyUpgrade(index: number, levelLabel: Label, costLabel: Label) {
        const upgrade = this.upgrades[index];
        if (this.gamePanelController['dilitium'] >= upgrade.cost) {
            this.gamePanelController['dilitium'] -= upgrade.cost;
            upgrade.level += 1;
            upgrade.cost = Math.floor(upgrade.baseCost * Math.pow(1.5, upgrade.level - 1));
            this.gamePanelController['dilitiumPerClick'] += upgrade.effect;
            if (levelLabel) levelLabel.string = `Ур. ${upgrade.level}`;
            if (costLabel) costLabel.string = `${upgrade.cost}`;
            this.gamePanelController.updateDilitiumText();
        }
    }
}