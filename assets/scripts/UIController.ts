import { _decorator, Component, Node, Button, EventHandler, find } from 'cc';
import { GameManager } from './GameManager'; // Add GameManager import
const { ccclass, property } = _decorator;

@ccclass('UIController')
export class UIController extends Component {
    @property(Node)
    upgradePanel: Node = null!; // Панель апгрейда
    
    @property({
        type: Node,
        tooltip: 'Дочерняя кнопка внутри BottomPanel для открытия панели апгрейдов'
    })
    upgradeButton: Node = null!; // Кнопка для открытия панели апгрейда
    
    @property(GameManager)
    gameManager: GameManager = null!; // Ссылка на GameManager
    
    // Флаг для предотвращения многократных вызовов
    private isProcessingClick: boolean = false;

    start() {
        console.log('UIController start called on node:', this.node.name);
        
        // Проверка инициализации GameManager с использованием синглтона
        if (!this.gameManager) {
            this.gameManager = GameManager.getInstance();
            console.log('GameManager accessed via getInstance:', this.gameManager ? 'success' : 'failed');
            
            // Если getInstance не сработал, пробуем найти напрямую
            if (!this.gameManager) {
                this.gameManager = find('GameManager')?.getComponent(GameManager) || null;
                console.log('GameManager direct lookup:', this.gameManager ? 'success' : 'failed');
            }
            
            if (!this.gameManager) {
                console.error('UIController: GameManager is not assigned or not found!');
            }
        }
        
        // Проверка инициализации
        if (!this.upgradePanel) {
            console.error('UIController: upgradePanel is not assigned!');
            return;
        }
        
        // По умолчанию скрыта
        this.upgradePanel.active = false;
        console.log('Initial panel state:', this.upgradePanel.active);
        
        // Находим кнопку, если она не назначена напрямую
        if (!this.upgradeButton) {
            // Пробуем найти кнопку внутри текущего узла (BottomPanel)
            this.upgradeButton = find('UpgradeButton', this.node);
            console.log('Trying to find button in children:', this.upgradeButton ? 'found' : 'not found');
        }
        
        if (this.upgradeButton) {
            console.log('Upgrade button found:', this.upgradeButton.name);
            
            // Настраиваем обработчик только для самой кнопки, а не для её дочерних элементов
            const button = this.upgradeButton.getComponent(Button);
            if (button) {
                console.log('Button component found on', this.upgradeButton.name);
                
                // Очищаем существующие обработчики, чтобы избежать дублирования
                button.clickEvents = [];
                
                // Программно добавляем обработчик через clickEvents
                const eventHandler = new EventHandler();
                eventHandler.target = this.node;
                eventHandler.component = 'UIController';
                eventHandler.handler = 'toggleUpgradePanel';
                
                button.clickEvents.push(eventHandler);
            } else {
                // Только если нет компонента Button, используем прямой слушатель событий
                this.upgradeButton.on(Node.EventType.TOUCH_END, this.onButtonClicked, this);
            }
        } else {
            console.error('UIController: upgradeButton is not assigned and not found in children!');
        }
    }
    
    // Обработчик для события TOUCH_END (используется только если нет компонента Button)
    onButtonClicked(event: Event) {
        console.log('Button clicked event received from:', (event.target as unknown as Node)?.name);
        this.toggleUpgradePanel();
    }

    // Этот метод вызывается через Button.clickEvents
    onUpgradeButtonClicked() {
        console.log('onUpgradeButtonClicked called');
        this.toggleUpgradePanel();
    }
    
    // Публичный метод для переключения панели с защитой от двойных вызовов
    public toggleUpgradePanel() {
        // Предотвращаем многократные вызовы в одном кадре
        if (this.isProcessingClick) {
            console.log('Ignoring duplicate toggleUpgradePanel call');
            return;
        }
        
        this.isProcessingClick = true;
        
        console.log('toggleUpgradePanel called');
        if (!this.upgradePanel) {
            console.error('Cannot toggle panel: upgradePanel is not assigned!');
            this.isProcessingClick = false;
            return;
        }
        
        // Переключаем видимость панели
        this.upgradePanel.active = !this.upgradePanel.active;
        console.log('Upgrade panel toggled:', this.upgradePanel.active);
        
        // Вызываем обновление данных панели апгрейда если она активна
        if (this.upgradePanel.active) {
            // Безопасный вызов метода с проверкой наличия gameManager
            const gameManager = this.gameManager || GameManager.getInstance();
            if (gameManager) {
                gameManager.onOreUpdated();
            } else {
                console.error('Cannot update ore display: GameManager not available');
            }
        }
        
        // Сбрасываем флаг в следующем кадре
        this.scheduleOnce(() => {
            this.isProcessingClick = false;
        }, 0);
    }

    onDestroy() {
        // Отписываемся от событий при уничтожении компонента
        if (this.upgradeButton) {
            this.upgradeButton.off(Node.EventType.TOUCH_END, this.onButtonClicked, this);
        }
    }
}
