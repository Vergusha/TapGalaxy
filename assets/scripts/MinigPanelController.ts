import { _decorator, Component, Label, Node, Prefab, instantiate, ScrollView, UITransform } from 'cc';
import { GamePanelController } from './GamePanelController';
const { ccclass, property } = _decorator;

type Upgrade = {
    name: string;
    level: number;
    baseCost: number;
    cost: number;
    effect: number;
    passiveIncome?: number;
};

@ccclass('MiningPanelController')
export class MiningPanelController extends Component {
    @property(GamePanelController)
    gamePanelController: GamePanelController = null;

    @property(Prefab)
    upgradeItemPrefab: Prefab = null;

    @property(Node)
    upgradesContainer: Node = null; // Теперь это должен быть content-узел ScrollView

    // Добавляем ссылку на ScrollView компонент
    @property(ScrollView)
    scrollView: ScrollView = null;

    private upgrades: Upgrade[] = [
    { name: 'Бур', level: 1, baseCost: 10, cost: 10, effect: 1 },
    { name: 'Шахтер', level: 0, baseCost: 50, cost: 50, effect: 5, passiveIncome: 2 },
    { name: 'Дрон', level: 0, baseCost: 200, cost: 200, effect: 20, passiveIncome: 10 },
    { name: 'Шахта', level: 0, baseCost: 1000, cost: 1000, effect: 100, passiveIncome: 35 },
    { name: '1', level: 0, baseCost: 1000, cost: 1000, effect: 100, passiveIncome: 35 },
    { name: '2', level: 0, baseCost: 1000, cost: 1000, effect: 100, passiveIncome: 35 },
    { name: '3', level: 0, baseCost: 1000, cost: 1000, effect: 100, passiveIncome: 35 },
    { name: '4', level: 0, baseCost: 1000, cost: 1000, effect: 100, passiveIncome: 35 },
    { name: '5', level: 0, baseCost: 1000, cost: 1000, effect: 100, passiveIncome: 35 },
    { name: '6', level: 0, baseCost: 1000, cost: 1000, effect: 100, passiveIncome: 35 },
    { name: '7', level: 0, baseCost: 1000, cost: 1000, effect: 100, passiveIncome: 35 },
    { name: '8', level: 0, baseCost: 1000, cost: 1000, effect: 100, passiveIncome: 35 },
    { name: '9', level: 0, baseCost: 1000, cost: 1000, effect: 100, passiveIncome: 35 },
    { name: '10', level: 0, baseCost: 1000, cost: 1000, effect: 100, passiveIncome: 35 },
    { name: '11', level: 0, baseCost: 1000, cost: 1000, effect: 100, passiveIncome: 35 },
    { name: '12', level: 0, baseCost: 1000, cost: 1000, effect: 100, passiveIncome: 35 },
    { name: '13', level: 0, baseCost: 1000, cost: 1000, effect: 100, passiveIncome: 35 },
    { name: '14', level: 0, baseCost: 1000, cost: 1000, effect: 100, passiveIncome: 35 },
    { name: '15', level: 0, baseCost: 1000, cost: 1000, effect: 100, passiveIncome: 35 },
    { name: '16', level: 0, baseCost: 1000, cost: 1000, effect: 100, passiveIncome: 35 },
    { name: '17', level: 0, baseCost: 1000, cost: 1000, effect: 100, passiveIncome: 35 },
    { name: '18', level: 0, baseCost: 1000, cost: 1000, effect: 100, passiveIncome: 35 },
    
];

    private passiveTimer: number = 0;

    start() {
        // Очищаем контейнер перед добавлением новых элементов
        this.upgradesContainer.removeAllChildren();

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
        
        // Обновляем размер content контейнера, чтобы учитывать все элементы
        this.updateContentSize();
    }
    
    // Добавляем метод для обновления размера content
    private updateContentSize() {
        if (!this.upgradesContainer) return;
        
        const contentUITransform = this.upgradesContainer.getComponent(UITransform);
        if (!contentUITransform) return;
        
        // Вычисляем общую высоту на основе количества элементов
        // Предполагается, что все элементы имеют одинаковую высоту
        const itemHeight = 50; // Примерная высота одного элемента (уточните реальную высоту)
        const totalHeight = this.upgrades.length * itemHeight;
        
        // Сохраняем оригинальную ширину
        const width = contentUITransform.width;
        
        // Обновляем размер content
        contentUITransform.setContentSize(width, totalHeight);
    }

    update(dt: number) {
        // Логика обработки пассивного дохода теперь в GamePanelController
    }

    buyUpgrade(index: number, levelLabel: Label, costLabel: Label) {
        const upgrade = this.upgrades[index];
        const currentDilitium = this.gamePanelController.getDilitium();
        
        if (currentDilitium >= upgrade.cost) {
            this.gamePanelController.setDilitium(currentDilitium - upgrade.cost);
            upgrade.level += 1;
            upgrade.cost = Math.floor(upgrade.baseCost * Math.pow(1.5, upgrade.level - 1));
            
            const newClickValue = this.gamePanelController.getDilitiumPerClick() + upgrade.effect;
            this.gamePanelController.setDilitiumPerClick(newClickValue);
            
            if (levelLabel) levelLabel.string = `Ур. ${upgrade.level}`;
            if (costLabel) costLabel.string = `${upgrade.cost}`;
        }
    }

    public getUpgrades(): Upgrade[] {
        return this.upgrades;
    }
}