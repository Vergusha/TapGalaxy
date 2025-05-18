import { _decorator, Component, Node, Label, Prefab, instantiate, ScrollView, UITransform, director, find, resources, assetManager, Asset } from 'cc';
import { UIEvents } from './UIManager';
import { GamePanelController } from './GamePanelController';
const { ccclass, property } = _decorator;

type Upgrade = {
    name: string;
    level: number;
    baseCost: number;
    cost: number;
    passiveIncome: number;
    description?: string;
};

@ccclass('TraderPanelController')
export class TraderPanelController extends Component {
    @property(Node)
    closeButton: Node = null;
    
    @property(GamePanelController)
    gamePanelController: GamePanelController = null;

    @property(Prefab)
    upgradeItemPrefab: Prefab = null;

    @property(Node)
    upgradesContainer: Node = null; // Контейнер для элементов улучшений

    // Добавляем ссылку на ScrollView компонент
    @property(ScrollView)
    scrollView: ScrollView = null;

    private upgrades: Upgrade[] = [
        { 
            name: 'Trade Terminal', 
            level: 0, 
            baseCost: 50, 
            cost: 50, 
            passiveIncome: 1,
            description: 'Passive income: +1 lunar/sec'
        },
        { 
            name: 'Import License', 
            level: 0, 
            baseCost: 200, 
            cost: 200, 
            passiveIncome: 5,
            description: 'Passive income: +5 lunar/sec'
        },
        { 
            name: 'Trade Fleet', 
            level: 0, 
            baseCost: 1000, 
            cost: 1000, 
            passiveIncome: 20,
            description: 'Passive income: +20 lunar/sec'
        },
        { 
            name: 'Galactic Network', 
            level: 0, 
            baseCost: 5000, 
            cost: 5000, 
            passiveIncome: 100,
            description: 'Passive income: +100 lunar/sec'
        },
    ];

    start() {
        // Пытаемся найти GamePanelController если не установлен
        if (!this.gamePanelController) {
            // Пробуем найти GamePanelController в сцене
            const gamePanelNode = find('Canvas/GamePanel');
            if (gamePanelNode) {
                this.gamePanelController = gamePanelNode.getComponent(GamePanelController);
                if (this.gamePanelController) {
                    console.log('TraderPanelController: Found GamePanelController automatically');
                } else {
                    console.error('TraderPanelController: Found GamePanel node but it does not have GamePanelController component');
                }
            } else {
                // Ищем по всей сцене любой узел с GamePanelController
                const scene = director.getScene();
                if (scene) {
                    const findGamePanelController = (node: Node): GamePanelController => {
                        const controller = node.getComponent(GamePanelController);
                        if (controller) return controller;
                        
                        for (let i = 0; i < node.children.length; i++) {
                            const found = findGamePanelController(node.children[i]);
                            if (found) return found;
                        }
                        
                        return null;
                    };
                    
                    this.gamePanelController = findGamePanelController(scene);
                    
                    if (this.gamePanelController) {
                        console.log('TraderPanelController: Found GamePanelController in scene by searching all nodes');
                    } else {
                        console.error('TraderPanelController: GamePanelController not found in any scene node');
                    }
                }
            }
        }
        
        // Пытаемся найти upgradeItemPrefab если не установлен
        if (!this.upgradeItemPrefab) {
            // Поскольку загрузка префаба через resources.load не работает, 
            // создадим элемент улучшения программно
            console.log('TraderPanelController: Creating upgrade item prefab programmatically...');
            
            this.createUpgradeItemProgrammatically();
        }
        // Пытаемся найти upgradesContainer если не установлен
        if (!this.upgradesContainer) {
            // Пробуем создать контейнер, если его нет
            console.log('TraderPanelController: Creating upgrades container...');
            
            // Проверяем, есть ли ScrollView
            if (!this.scrollView) {
                // Пробуем найти ScrollView в дочерних узлах
                this.scrollView = this.node.getComponentInChildren(ScrollView);
                
                if (!this.scrollView) {
                    // Создаём ScrollView
                    const scrollViewNode = new Node('ScrollView');
                    this.node.addChild(scrollViewNode);
                    this.scrollView = scrollViewNode.addComponent(ScrollView);
                    
                    // Создаём view и content
                    const viewNode = new Node('view');
                    scrollViewNode.addChild(viewNode);
                    
                    const contentNode = new Node('content');
                    viewNode.addChild(contentNode);
                    contentNode.addComponent(UITransform);
                    
                    this.upgradesContainer = contentNode;
                    console.log('TraderPanelController: Created new ScrollView with content');
                } else {
                    console.log('TraderPanelController: Found existing ScrollView');
                }
            }
            
            // Если есть ScrollView, проверяем есть ли у него content
            if (this.scrollView && !this.upgradesContainer) {
                const viewNode = this.scrollView.node.getChildByName('view');
                if (viewNode) {
                    let contentNode = viewNode.getChildByName('content');
                    if (!contentNode) {
                        contentNode = new Node('content');
                        viewNode.addChild(contentNode);
                        contentNode.addComponent(UITransform);
                        console.log('TraderPanelController: Created new content node in existing ScrollView');
                    }
                    this.upgradesContainer = contentNode;
                } else {
                    console.error('TraderPanelController: ScrollView has no view node');
                }
            }
        }
        
        if (!this.gamePanelController) {
            console.error('TraderPanelController: GamePanelController reference is missing. Please connect it in the editor.');
        }
        
        if (!this.upgradeItemPrefab) {
            console.error('TraderPanelController: upgradeItemPrefab is missing. Please assign it in the editor.');
        }
        
        if (!this.upgradesContainer) {
            console.error('TraderPanelController: upgradesContainer is missing. Please assign it in the editor.');
        }
        
        // Initialize close button click handler
        if (this.closeButton) {
            this.closeButton.on(Node.EventType.TOUCH_END, this.onCloseButtonClick, this);
        }
        
        // Set up upgrades only if we have all required references
        // Note: For upgradeItemPrefab, we rely on async loading that will call setupUpgrades when ready
        if (this.gamePanelController && this.upgradeItemPrefab && this.upgradesContainer) {
            this.setupUpgrades();
        } else if (this.gamePanelController && this.upgradesContainer) {
            console.log('TraderPanelController: Waiting for prefab to load before setting up upgrades...');
            // upgradeItemPrefab will be loaded asynchronously, and setupUpgrades will be called after load
        } else {
            console.error('TraderPanelController: Cannot set up upgrades due to missing references');
        }
    }
    
    setupUpgrades() {
        // Check if required references are available
        if (!this.upgradesContainer) {
            console.error('TraderPanelController: upgradesContainer is missing. Cannot set up upgrades.');
            return;
        }

        if (!this.upgradeItemPrefab) {
            console.error('TraderPanelController: upgradeItemPrefab is missing. Cannot set up upgrades.');
            return;
        }

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
            const descriptionLabel = item.getChildByName('Description')?.getComponent(Label);
            const buyButton = item.getChildByName('BuyButton');

            if (nameLabel) nameLabel.string = upg.name;
            if (levelLabel) levelLabel.string = `Ур. ${upg.level}`;
            if (costLabel) costLabel.string = this.formatNumber(upg.cost);
            if (descriptionLabel && upg.description) descriptionLabel.string = upg.description;

            if (buyButton) {
                buyButton.on(Node.EventType.TOUCH_END, () => {
                    this.buyUpgrade(i, levelLabel, costLabel);
                }, this);
            }
        }
        
        // Update content size for proper scrolling
        this.updateContentSize();
    }
    
    private updateContentSize() {
        if (!this.upgradesContainer) return;
        
        const contentUITransform = this.upgradesContainer.getComponent(UITransform);
        if (!contentUITransform) return;
        
        const itemHeight = 60; // Размер элемента с учетом описания
        const totalHeight = this.upgrades.length * itemHeight;
        
        // Сохраняем оригинальную ширину
        const width = contentUITransform.width;
        
        // Обновляем размер content
        contentUITransform.setContentSize(width, totalHeight);
    }

    onCloseButtonClick() {
        UIEvents.emit('hideTraderPanel');
    }
    
    buyUpgrade(index: number, levelLabel: Label, costLabel: Label) {
        // Check if gamePanelController is available
        if (!this.gamePanelController) {
            console.error('GamePanelController reference is missing. Please connect it in the editor.');
            return;
        }

        const upgrade = this.upgrades[index];
        const currentDilitium = this.gamePanelController.getDilitium();
        
        if (currentDilitium >= upgrade.cost) {
            // Spend dilithium
            this.gamePanelController.setDilitium(currentDilitium - upgrade.cost);
            
            // Increase upgrade level
            upgrade.level += 1;
            
            // Calculate new cost with 1.5x multiplier
            upgrade.cost = Math.floor(upgrade.baseCost * Math.pow(1.5, upgrade.level - 1));
            
            // Update UI
            if (levelLabel) levelLabel.string = `Ур. ${upgrade.level}`;
            if (costLabel) costLabel.string = this.formatNumber(upgrade.cost);
        }
    }
    
    public getUpgrades(): Upgrade[] {
        return this.upgrades;
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
    
    /**
     * Создает программно префаб для элемента улучшения
     * Этот метод создает Node с необходимыми компонентами для элемента улучшения
     */
    private createUpgradeItemProgrammatically() {
        // Создаем корневой узел
        const node = new Node('UpgradeItem');
        
        // Добавляем основные компоненты
        const nameLabel = new Node('NameLabel');
        const levelLabel = new Node('LevelLabel');
        const costLabel = new Node('CostLabel');
        const description = new Node('Description');
        const buyButton = new Node('BuyButton');
        
        // Добавляем компоненты Label
        nameLabel.addComponent(Label);
        levelLabel.addComponent(Label);
        costLabel.addComponent(Label);
        description.addComponent(Label);
        
        // Настраиваем метки
        nameLabel.getComponent(Label).string = 'Upgrade Name';
        levelLabel.getComponent(Label).string = 'Ур. 0';
        costLabel.getComponent(Label).string = '50';
        description.getComponent(Label).string = 'Описание улучшения';
        
        // Добавляем узлы к корневому узлу
        node.addChild(nameLabel);
        node.addChild(levelLabel);
        node.addChild(costLabel);
        node.addChild(description);
        node.addChild(buyButton);
        
        // Устанавливаем созданный узел как префаб
        // Поскольку мы не можем создать настоящий Prefab программно,
        // мы будем использовать этот узел как "псевдо-префаб"
        this.upgradeItemPrefab = node as any;
        
        console.log('TraderPanelController: Created programmatic upgrade item');
        
        return node;
    }
}