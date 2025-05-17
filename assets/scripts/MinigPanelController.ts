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
    description?: string; // Добавляем описание для будущих улучшений
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
    { 
    name: 'Drill', 
    level: 1, 
    baseCost: 10, 
    cost: 10, 
    effect: 1,
    description: '+1 dilithium per click'
},
{ 
    name: 'Miner', 
    level: 0, 
    baseCost: 50, 
    cost: 50, 
    effect: 5, 
    passiveIncome: 2,
    description: '+5 per click, +2 passive income'
},
{ 
    name: 'Drone', 
    level: 0, 
    baseCost: 200, 
    cost: 200, 
    effect: 20, 
    passiveIncome: 10,
    description: '+20 per click, +10 passive income'
},
{ 
    name: 'Mine', 
    level: 0, 
    baseCost: 1000, 
    cost: 1000, 
    effect: 100, 
    passiveIncome: 35,
    description: '+100 per click, +35 passive income'
},
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
            const descriptionLabel = item.getChildByName('Description')?.getComponent(Label); // Get the description label
            const buyButton = item.getChildByName('BuyButton');

            if (nameLabel) nameLabel.string = upg.name;
            if (levelLabel) levelLabel.string = `Ур. ${upg.level}`;
            if (costLabel) costLabel.string = this.formatNumber(upg.cost);
            if (descriptionLabel && upg.description) descriptionLabel.string = upg.description; // Set the description

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
    // You may need to increase the itemHeight value if the descriptions make the items taller
    private updateContentSize() {
        if (!this.upgradesContainer) return;
        
        const contentUITransform = this.upgradesContainer.getComponent(UITransform);
        if (!contentUITransform) return;
        
        // Update this value if needed to accommodate for description text
        const itemHeight = 60; // Increased from 50 to account for description
        const totalHeight = this.upgrades.length * itemHeight;
        
        // Сохраняем оригинальную ширину
        const width = contentUITransform.width;
        
        // Обновляем размер content
        contentUITransform.setContentSize(width, totalHeight);
    }

    private formatNumber(num: number): string {
        if (num < 1000) return num.toString();
        
        const suffixes = ['', 'K', 'M', 'B', 'T'];
        const alphabetSuffixes: string[] = [];
        
        // Generate alphabetical suffixes: aa-az, ba-bz, etc.
        for (let firstChar = 97; firstChar <= 122; firstChar++) {
            for (let secondChar = 97; secondChar <= 122; secondChar++) {
                alphabetSuffixes.push(String.fromCharCode(firstChar) + String.fromCharCode(secondChar));
            }
        }
        
        // Combine all suffixes
        const allSuffixes = [...suffixes, ...alphabetSuffixes];
        
        // Calculate exponent (powers of 1000): 0 = ones, 1 = thousands, 2 = millions, etc.
        const exponent = Math.floor(Math.log(num) / Math.log(1000));
        
        // If the exponent is too large, just return scientific notation
        if (exponent >= allSuffixes.length) {
            return num.toExponential(2);
        }
        
        // Get the suffix and calculate the mantissa (the number part)
        const suffix = allSuffixes[exponent];
        const mantissa = num / Math.pow(1000, exponent);
        
        // Format mantissa to have at most 3 significant digits
        let formattedMantissa: string;
        if (mantissa >= 100) {
            formattedMantissa = mantissa.toFixed(0);
        } else if (mantissa >= 10) {
            formattedMantissa = mantissa.toFixed(1);
        } else {
            formattedMantissa = mantissa.toFixed(2);
        }
        
        // Remove trailing zeros after decimal point
        formattedMantissa = formattedMantissa.replace(/\.0+$|(\.\d*[1-9])0+$/, '$1');
        
        return formattedMantissa + suffix;
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
            if (costLabel) costLabel.string = this.formatNumber(upgrade.cost);
        }
    }

    public getUpgrades(): Upgrade[] {
        return this.upgrades;
    }
}