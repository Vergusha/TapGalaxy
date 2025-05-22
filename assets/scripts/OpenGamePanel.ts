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
                topPanelComponent.setDilithium(progress.minerals || 0);
                topPanelComponent.setLunar(progress.credits || 0);
                
                // Устанавливаем значения пассивного дохода
                topPanelComponent.setPassiveDilithiumIncome(progress.passiveDilithiumIncome || 0);
                topPanelComponent.setPassiveLunarIncome(progress.passiveLunarIncome || 0);
                
                console.log('Ресурсы успешно загружены из сохранения:', progress.minerals, 'дилития,', progress.credits, 'лунаров');
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