import { _decorator, sys, find } from 'cc';
import { TopPanel } from './TopPanel';
import { SpaceshipPanel } from './SpaceshipPanel';
const { ccclass, property } = _decorator;

// Интерфейс для хранения данных игрока
export interface PlayerProgress {
    // Ресурсы игрока
    credits: number;
    minerals: number;
    
    // Улучшения корабля
    shipUpgrades: {
        hpBonus: number;
        shieldBonus: number;
        damageBonus: number;
    };
    
    // Улучшения добычи
    miningUpgrades: {
        speed: number;
        efficiency: number;
    };
    
    // Статистика боев
    combatStats: {
        wins: number;
        losses: number;
    };
    
    // Время последнего сохранения
    lastSaved: number;
}

@ccclass('SaveManager')
export class SaveManager {
    private static readonly SAVE_KEY = 'tapgalaxy_save_data';
    
    // Значения по умолчанию для нового игрока
    private static readonly DEFAULT_PROGRESS: PlayerProgress = {
        credits: 0,
        minerals: 0,
        shipUpgrades: {
            hpBonus: 0,
            shieldBonus: 0,
            damageBonus: 0
        },
        miningUpgrades: {
            speed: 0,
            efficiency: 0
        },
        combatStats: {
            wins: 0,
            losses: 0
        },
        lastSaved: Date.now()
    };
      /**
     * Сохраняет текущий прогресс игрока
     * @param progress Данные прогресса для сохранения (опционально, если не передано - прогресс будет собран из текущего состояния игры)
     */
    public static saveProgress(progress?: PlayerProgress): void {
        // Если прогресс не передан, собираем текущее состояние игры
        if (!progress) {
            progress = this.getCurrentGameState();
        }
        
        progress.lastSaved = Date.now();
        
        try {
            const jsonData = JSON.stringify(progress);
            sys.localStorage.setItem(this.SAVE_KEY, jsonData);
            console.log('Прогресс успешно сохранен');
        } catch (error) {
            console.error('Ошибка при сохранении прогресса:', error);
        }
    }
    
    /**
     * Собирает текущее состояние игры из компонентов
     */
    private static getCurrentGameState(): PlayerProgress {
        const progress = { ...this.DEFAULT_PROGRESS };
        
        // Ищем TopPanel для получения текущих ресурсов
        const topPanelNode = find('Canvas/TopPanel');
        if (topPanelNode) {
            const topPanel = topPanelNode.getComponent(TopPanel);
            if (topPanel) {
                progress.credits = topPanel.getLunar();
                progress.minerals = topPanel.getDilithium();
            }
        }
        
        // Получаем текущие улучшения корабля
        const shipUpgrades = SpaceshipPanel.getUpgradeValues();
        progress.shipUpgrades = shipUpgrades;
        
        // Здесь можно добавить сбор данных из других компонентов
        
        return progress;
    }
    
    /**
     * Загружает сохраненный прогресс игрока
     * @returns Сохраненный прогресс или данные по умолчанию, если сохранения нет
     */
    public static loadProgress(): PlayerProgress {
        try {
            const jsonData = sys.localStorage.getItem(this.SAVE_KEY);
            
            if (jsonData) {
                return JSON.parse(jsonData) as PlayerProgress;
            }
        } catch (error) {
            console.error('Ошибка при загрузке прогресса:', error);
        }
        
        // Возвращаем данные по умолчанию, если не удалось загрузить сохранение
        return { ...this.DEFAULT_PROGRESS };
    }
    
    /**
     * Обновляет часть прогресса игрока, сохраняя остальные данные
     * @param partialProgress Частичные данные для обновления
     */
    public static updateProgress(partialProgress: Partial<PlayerProgress>): void {
        const currentProgress = this.loadProgress();
        const updatedProgress = { ...currentProgress, ...partialProgress };
        
        // Обновляем вложенные объекты
        if (partialProgress.shipUpgrades) {
            updatedProgress.shipUpgrades = {
                ...currentProgress.shipUpgrades,
                ...partialProgress.shipUpgrades
            };
        }
        
        if (partialProgress.miningUpgrades) {
            updatedProgress.miningUpgrades = {
                ...currentProgress.miningUpgrades,
                ...partialProgress.miningUpgrades
            };
        }
        
        if (partialProgress.combatStats) {
            updatedProgress.combatStats = {
                ...currentProgress.combatStats,
                ...partialProgress.combatStats
            };
        }
        
        this.saveProgress(updatedProgress);
    }
    
    /**
     * Сбрасывает прогресс игрока до значений по умолчанию
     */
    public static resetProgress(): void {
        this.saveProgress({ ...this.DEFAULT_PROGRESS });
        console.log('Прогресс сброшен до значений по умолчанию');
    }
      /**
     * Инкрементирует счетчик побед
     */
    public static addWin(): void {
        const progress = this.loadProgress();
        progress.combatStats.wins++;
        
        // Также сохраняем текущее состояние игры
        const currentState = this.getCurrentGameState();
        progress.credits = currentState.credits;
        progress.minerals = currentState.minerals;
        progress.shipUpgrades = currentState.shipUpgrades;
        
        this.saveProgress(progress);
    }
    
    /**
     * Инкрементирует счетчик поражений
     */
    public static addLoss(): void {
        const progress = this.loadProgress();
        progress.combatStats.losses++;
        this.saveProgress(progress);
    }
    
    /**
     * Добавляет ресурсы игроку
     */
    public static addResources(credits: number = 0, minerals: number = 0): void {
        const progress = this.loadProgress();
        progress.credits += credits;
        progress.minerals += minerals;
        this.saveProgress(progress);
    }
    
    /**
     * Проверяет наличие сохранения
     */
    public static hasSavedGame(): boolean {
        return !!sys.localStorage.getItem(this.SAVE_KEY);
    }
}
