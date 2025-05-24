import { _decorator, Component, Prefab, instantiate, Node, resources } from 'cc';
import { SaveManager } from './SaveManager';
import { TopPanel } from './TopPanel';
import { SpaceshipPanel } from './SpaceshipPanel';
const { ccclass, property } = _decorator;

@ccclass('OpenGamePanel')
export class OpenGamePanel extends Component {
    @property({ type: Prefab })
    gamePanelPrefab: Prefab = null;

    @property({ type: Prefab })
    topPanelPrefab: Prefab = null;

    @property({ type: Prefab })
    bottomPanelPrefab: Prefab = null;

    @property({ type: Prefab })
    settingsPanelPrefab: Prefab = null;
    private settingsPanelInstance: Node = null;

    start() {
        // Создаём Game_Panel
        const gamePanel = instantiate(this.gamePanelPrefab);
        this.node.addChild(gamePanel);

        const topPanel = instantiate(this.topPanelPrefab);
        this.node.addChild(topPanel);

        const bottomPanel = instantiate(this.bottomPanelPrefab);
        this.node.addChild(bottomPanel);
        
        // Загружаем сохраненный прогресс
        this.loadSavedProgress(topPanel);

        // Находим кнопку настроек в GamePanel и вешаем обработчик
        const gamePanelNode = this.node.children.find(child => child.name === 'GamePanel');
        if (gamePanelNode) {
            const settingsButton = gamePanelNode.getChildByName('SettingsButton');
            if (settingsButton) {
                settingsButton.on(Node.EventType.MOUSE_DOWN, this.openSettingsPanel, this);
            }
        }
    }

    openSettingsPanel() {
        if (this.settingsPanelInstance && this.settingsPanelInstance.isValid) {
            return;
        }
        if (!this.settingsPanelPrefab) {
            console.error('SettingsPanel prefab is not assigned in OpenGamePanel.');
            return;
        }
        const canvas = this.node.parent || this.node;
        this.settingsPanelInstance = instantiate(this.settingsPanelPrefab);
        canvas.addChild(this.settingsPanelInstance);
    }

    /**
     * Загружает сохраненный прогресс из SaveManager
     */    private loadSavedProgress(topPanelNode: Node) {
        // Если есть сохраненный прогресс, загружаем его
        if (SaveManager.hasSavedGame()) {
            const progress = SaveManager.loadProgress();
            
            // Загружаем ресурсы
            const topPanelComponent = topPanelNode.getComponent(TopPanel);
            if (topPanelComponent) {
                // Устанавливаем ресурсы в TopPanel напрямую, а не через add методы
                topPanelComponent.setDilithium(progress.dilithium || 0);
                topPanelComponent.setLunar(progress.lunar || 0);
                
                // Устанавливаем значения пассивного дохода
                topPanelComponent.setPassiveDilithiumIncome(progress.passiveDilithiumIncome || 0);
                topPanelComponent.setPassiveLunarIncome(progress.passiveLunarIncome || 0);
                
                console.log('Ресурсы успешно загружены из сохранения:', progress.dilithium, 'дилития,', progress.lunar, 'лунаров');
                console.log('Пассивный доход загружен:', progress.passiveDilithiumIncome, 'дилития/сек,', progress.passiveLunarIncome, 'лунаров/сек');
            }
              // Загружаем улучшения корабля
            if (progress.shipUpgrades) {
                // Загружаем сохраненные улучшения
                SpaceshipPanel.loadSavedUpgrades(progress.shipUpgrades);
                console.log('Улучшения корабля успешно загружены из сохранения');
            }
            
            console.log('Прогресс успешно загружен из сохранения от', new Date(progress.lastSaved).toLocaleString());
        } else {
            console.log('Сохранений не найдено, используются значения по умолчанию');
        }
    }
}