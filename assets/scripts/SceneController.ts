import { _decorator, Component, Node, find, Canvas, director } from 'cc';
import { GameManager } from './GameManager';
import { UIManager } from './UIManager';
import { CurrencyManager } from './CurrencyManager';
import { GamePanelController } from './GamePanelController';
import { MiningPanelController } from './MiningPanelController';
const { ccclass, property } = _decorator;

/**
 * Этот класс отвечает за управление сценой и связывание всех префабов и компонентов
 */
@ccclass('SceneController')
export class SceneController extends Component {
    // Основные менеджеры
    private gameManager: GameManager = null;
    private uiManager: UIManager = null;
    private currencyManager: CurrencyManager = null;
    
    // Панели - не требуем их назначения вручную, будем искать на сцене
    private gamePanel: Node = null;
    private miningPanel: Node = null;
    private topPanel: Node = null; 
    private bottomPanel: Node = null;
      onLoad() {
        console.log("SceneController: onLoad начинается");
        
        // Находим все необходимые компоненты
        this.findManagers();
        
        // Находим все панели на сцене
        this.findPanelsInScene();
    }
    
    /**
     * Поиск и инициализация всех менеджеров
     */
    private findManagers() {
        console.log("SceneController: ищем менеджеры");
        
        // Ищем на текущем объекте
        this.gameManager = this.getComponent(GameManager);
        this.uiManager = this.getComponent(UIManager);
        this.currencyManager = this.getComponent(CurrencyManager);
        
        // Если не нашли, то ищем на других объектах сцены
        if (!this.gameManager) {
            this.gameManager = find('Canvas')?.getComponent(GameManager) || 
                                director.getScene().getComponentInChildren(GameManager);
            if (this.gameManager) console.log("GameManager найден на другом объекте");
        }
        
        if (!this.uiManager) {
            this.uiManager = find('Canvas')?.getComponent(UIManager) || 
                             director.getScene().getComponentInChildren(UIManager);
            if (this.uiManager) console.log("UIManager найден на другом объекте");
        }
        
        if (!this.currencyManager) {
            this.currencyManager = find('Canvas')?.getComponent(CurrencyManager) || 
                                  director.getScene().getComponentInChildren(CurrencyManager);
            if (this.currencyManager) console.log("CurrencyManager найден на другом объекте");
        }
    }
    
    /**
     * Поиск всех панелей на сцене
     */
    private findPanelsInScene() {        console.log("SceneController: ищем панели на сцене");
        
        const canvas = find('Canvas');
        if (!canvas) {
            console.error("SceneController: Canvas не найден в сцене!");
            return;
        }
        
        // Поиск панелей по имени
        this.gamePanel = canvas.getChildByName('GamePanel');
        this.miningPanel = canvas.getChildByName('MiningPanel');
        this.topPanel = canvas.getChildByName('TopPanel');
        this.bottomPanel = canvas.getChildByName('BottomPanel');
        
        // Логируем результаты поиска
        console.log("Найдены панели:", {
            gamePanel: !!this.gamePanel,
            miningPanel: !!this.miningPanel,
            topPanel: !!this.topPanel,
            bottomPanel: !!this.bottomPanel
        });
          // Используем метод connectComponents для связывания компонентов
        this.connectComponents();
        
        // Выведем информацию о найденных компонентах
        this.logComponentsStatus();
    }
      /**
     * Соединение компонентов между собой
     */
    private connectComponents() {
        console.log("SceneController: связываем компоненты");
        
        // Настраиваем UI Manager
        if (this.uiManager) {
            // Теперь нам не нужно использовать свойства, т.к. свойства могут быть уже назначены через редактор
            // или через UIManager.findPanelsInScene
            if (!this.uiManager.gamePanel) {
                this.uiManager.gamePanel = this.gamePanel;
            }
            
            if (!this.uiManager.miningPanel) {
                this.uiManager.miningPanel = this.miningPanel;
            }
            
            console.log("SceneController: настроили UIManager");
        } else {
            console.error("SceneController: UIManager не найден, невозможно настроить панели!");
        }
        
        // Убедимся, что все панели активны в начале, чтобы их компоненты инициализировались
        if (this.gamePanel) this.gamePanel.active = true;
        if (this.miningPanel) this.miningPanel.active = true;
        
        // Проверяем компоненты-контроллеры на панелях
        if (this.gamePanel) {
            const gamePanelController = this.gamePanel.getComponent(GamePanelController);
            console.log('GamePanel имеет контроллер:', !!gamePanelController);
        }
        
        if (this.miningPanel) {
            const miningController = this.miningPanel.getComponent(MiningPanelController);
            console.log('MiningPanel имеет контроллер:', !!miningController);
        }
    }
    
    /**
     * Вывод информации о статусе компонентов
     */
    private logComponentsStatus() {
        const componentsFound = {
            gameManager: !!this.gameManager,
            uiManager: !!this.uiManager,
            currencyManager: !!this.currencyManager,
            gamePanel: !!this.gamePanel,
            miningPanel: !!this.miningPanel,
            topPanel: !!this.topPanel,
            bottomPanel: !!this.bottomPanel
        };
        
        console.log('SceneController: статус компонентов:', componentsFound);
    }
    
    start() {
        // UIManager покажет GamePanel по умолчанию
        if (this.uiManager) {
            this.uiManager.showGamePanel();
        } else {
            console.error('UIManager not found. Cannot show default panel.');
        }
    }
}
