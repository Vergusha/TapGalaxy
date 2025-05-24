import { _decorator, sys, find } from 'cc';
import { TopPanel } from './TopPanel';
import { SpaceshipPanel, SpaceshipUpgradeData } from './SpaceshipPanel';
import { MiningPanel } from './MiningPanel';
import { UpgradeData } from './MiningUpdate';
const { ccclass, property } = _decorator;

// Интерфейс для хранения данных игрока
export interface PlayerProgress {
    // Ресурсы игрока
    lunar: number;
    dilithium: number;
    
    // Пассивный доход
    passiveDilithiumIncome: number;
    passiveLunarIncome: number;
    
    // Улучшения корабля (теперь массив)
    shipUpgrades: SpaceshipUpgradeData[];
    
    // Улучшения добычи (теперь массив)
    miningUpgrades: UpgradeData[];
    
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
        lunar: 0,
        dilithium: 0,
        passiveDilithiumIncome: 0,
        passiveLunarIncome: 0,
        shipUpgrades: [], // Will be set in getCurrentGameState
        miningUpgrades: [], // Will be set in getCurrentGameState
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
     */    private static getCurrentGameState(): PlayerProgress {
        const progress = { ...this.DEFAULT_PROGRESS };
        // Ищем TopPanel для получения текущих ресурсов
        const topPanelNode = find('Canvas/TopPanel');
        if (topPanelNode) {
            const topPanel = topPanelNode.getComponent(TopPanel);
            if (topPanel) {
                progress.lunar = topPanel.getLunar();
                progress.dilithium = topPanel.getDilithium();
                progress.passiveDilithiumIncome = topPanel.getPassiveDilithiumIncome();
                progress.passiveLunarIncome = topPanel.getPassiveLunarIncome();
            }
        }
        // Получаем текущие массивы улучшений
        progress.shipUpgrades = SpaceshipPanel.getUpgradesArray();
        progress.miningUpgrades = MiningPanel.getUpgradesArray();
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
                const loaded = JSON.parse(jsonData) as PlayerProgress;
                // Backward compatibility: if upgrades are not arrays, reset to default
                if (!Array.isArray(loaded.shipUpgrades)) {
                    loaded.shipUpgrades = SpaceshipPanel.getUpgradesArray();
                }
                if (!Array.isArray(loaded.miningUpgrades)) {
                    loaded.miningUpgrades = MiningPanel.getUpgradesArray();
                }
                return loaded;
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
        // Сбросить массивы улучшений к дефолтным значениям
        const defaultProgress = { ...this.DEFAULT_PROGRESS };
        const shipDefaults = SpaceshipPanel.initializeUpgradesData();
        defaultProgress.shipUpgrades = shipDefaults.map(upg => ({ ...upg }));
        const miningDefaults = MiningPanel.initializeUpgradesData();
        defaultProgress.miningUpgrades = miningDefaults.map(upg => ({ ...upg }));
        this.saveProgress(defaultProgress);
        // Также применить сброс в статических массивах панелей
        SpaceshipPanel.setUpgradesArray(shipDefaults);
        MiningPanel.setUpgradesArray(miningDefaults);
        console.log('Прогресс сброшен до значений по умолчанию');
    }    /**
     * Инкрементирует счетчик побед
     */
    public static addWin(): void {
        const progress = this.loadProgress();
        progress.combatStats.wins++;
        
        // Не обновляем состояние ресурсов и улучшений, так как
        // в момент вызова этого метода текущее состояние может быть некорректным
        // (особенно на боевой сцене, где нет TopPanel с ресурсами)
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
    public static addResources(lunar: number = 0, dilithium: number = 0): void {
        const progress = this.loadProgress();
        
        console.log('Добавление ресурсов - было:', progress.lunar, 'лунаров,', progress.dilithium, 'дилития');
        
        progress.lunar += lunar;
        progress.dilithium += dilithium;
        
        console.log('Добавление ресурсов - стало:', progress.lunar, 'лунаров,', progress.dilithium, 'дилития');
        
        this.saveProgress(progress);
    }
    
    /**
     * Проверяет наличие сохранения
     */
    public static hasSavedGame(): boolean {
        return !!sys.localStorage.getItem(this.SAVE_KEY);
    }
}
