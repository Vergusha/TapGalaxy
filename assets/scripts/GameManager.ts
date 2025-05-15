import { _decorator, Component, Node, Label, Prefab, instantiate, director, find } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    @property({
        type: Number,
        tooltip: 'Base amount of ore gained per click'
    })
    baseClickGain: number = 1;
    
    @property({
        type: Number,
        tooltip: 'Current upgrade level for mining'
    })
    miningLevel: number = 1;
    
    @property({
        type: Number,
        tooltip: 'Current amount of ore'
    })
    oreCount: number = 0;
    
    @property(Label)
    oreCountLabel: Label = null!;
    
    @property({
        type: Label,
        tooltip: 'Метка, отображающая количество добываемого ресурса за клик'
    })
    clickGainLabel: Label = null!;
    
    @property(Label)
    upgradeCostLabel: Label = null!;
    
    @property({
        type: Prefab,
        tooltip: 'Префаб для отображения информации о добыче'
    })
    miningInfoPrefab: Prefab = null!;
    
    @property({
        type: Node,
        tooltip: 'Контейнер для размещения префаба с информацией о добыче'
    })
    miningInfoContainer: Node = null!;
    
    // Ссылка на экземпляр префаба в сцене
    private miningInfoInstance: Node = null!;
    
    // Кэшированные ссылки на компоненты внутри префаба
    private prefabClickGainLabel: Label = null!;
    private prefabOreCountLabel: Label = null!;
    
    // Статический экземпляр для глобального доступа
    private static instance: GameManager | null = null;
    
    // Метод для получения экземпляра из любого скрипта
    public static getInstance(): GameManager {
        if (!this.instance) {
            // Если экземпляр не назначен, ищем в сцене
            this.instance = find('GameManager')?.getComponent(GameManager) || null;
            
            if (!this.instance) {
                console.error('GameManager instance not found in the scene!');
            }
        }
        return this.instance!;
    }
    
    onLoad() {
        // Сохраняем ссылку на экземпляр при загрузке
        GameManager.instance = this;
        console.log('GameManager instance registered');
    }
    
    start() {
        console.log('GameManager initialized');
        
        // Инициализация префаба, если он назначен
        if (this.miningInfoPrefab && this.miningInfoContainer) {
            this.initializeMiningInfoPrefab();
        } else {
            console.log('Using direct label references for UI display');
        }
        
        this.updateUIDisplay();
    }
    
    /**
     * Создает экземпляр префаба и инициализирует ссылки
     */
    initializeMiningInfoPrefab() {
        // Создаем экземпляр префаба
        this.miningInfoInstance = instantiate(this.miningInfoPrefab);
        
        // Добавляем в контейнер
        this.miningInfoContainer.addChild(this.miningInfoInstance);
        
        // Получаем ссылки на компоненты внутри префаба
        this.prefabClickGainLabel = this.miningInfoInstance.getChildByName('ClickGainLabel')?.getComponent(Label) || null!;
        this.prefabOreCountLabel = this.miningInfoInstance.getChildByName('OreCountLabel')?.getComponent(Label) || null!;
        
        console.log('Mining info prefab initialized:', 
            this.prefabClickGainLabel ? 'Click gain label found' : 'Click gain label not found',
            this.prefabOreCountLabel ? 'Ore count label found' : 'Ore count label not found');
    }
    
    /**
     * Calculate the amount of ore gained per click based on current upgrades
     */
    calculateClickGain(): number {
        // Simple formula: base gain * mining level
        return this.baseClickGain * this.miningLevel;
    }
    
    /**
     * Calculate the cost to upgrade to the next mining level
     */
    calculateUpgradeCost(): number {
        // Example formula: 10 * level^2
        return 10 * Math.pow(this.miningLevel, 2);
    }
    
    /**
     * Handle player clicking to mine ore
     */
    onMiningClick() {
        const gain = this.calculateClickGain();
        this.oreCount += gain;
        console.log(`Mining click: +${gain} ore, total: ${this.oreCount}`);
        this.updateUIDisplay();
    }
    
    /**
     * Handle player purchasing a mining upgrade
     */
    onUpgradePurchase() {
        const cost = this.calculateUpgradeCost();
        if (this.oreCount >= cost) {
            this.oreCount -= cost;
            this.miningLevel++;
            console.log(`Upgrade purchased! New level: ${this.miningLevel}`);
            this.updateUIDisplay();
            return true;
        } else {
            console.log('Not enough ore for upgrade');
            return false;
        }
    }
    
    /**
     * Update UI when ore count changes
     */
    onOreUpdated() {
        this.updateUIDisplay();
    }
    
    /**
     * Update all UI elements with current values
     */
    updateUIDisplay() {
        // Обновляем метки в префабе, если он используется
        if (this.miningInfoInstance) {
            if (this.prefabOreCountLabel) {
                this.prefabOreCountLabel.string = `Руда: ${this.oreCount.toFixed(0)}`;
            }
            
            if (this.prefabClickGainLabel) {
                this.prefabClickGainLabel.string = `За клик: ${this.calculateClickGain().toFixed(1)}`;
            }
        }
        
        // Также обновляем напрямую подключенные метки (для обратной совместимости)
        if (this.oreCountLabel) {
            this.oreCountLabel.string = `Руда: ${this.oreCount.toFixed(0)}`;
        }
        
        if (this.clickGainLabel) {
            this.clickGainLabel.string = `За клик: ${this.calculateClickGain().toFixed(1)}`;
        }
        
        if (this.upgradeCostLabel) {
            this.upgradeCostLabel.string = `Цена улучшения: ${this.calculateUpgradeCost().toFixed(0)}`;
        }
    }
}