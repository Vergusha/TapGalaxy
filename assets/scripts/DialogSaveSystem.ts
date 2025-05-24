import { _decorator, Component, sys } from 'cc';
import { DialogData } from './DialogSystem';
const { ccclass, property } = _decorator;

/**
 * Интерфейс для сохранения состояния диалога
 */
export interface DialogSaveData {
    dialogId: string;           // Уникальный ID диалога
    currentIndex: number;       // Текущий индекс диалога
    isCompleted: boolean;       // Завершен ли диалог
    choices?: number[];         // Сделанные выборы
    timestamp: number;          // Время последнего сохранения
    characterRelations?: { [key: string]: number }; // Отношения с персонажами
}

/**
 * Интерфейс для настроек диалоговой системы
 */
export interface DialogSystemSettings {
    enableTypewriter: boolean;
    typewriterSpeed: number;
    enableSounds: boolean;
    enableAnimations: boolean;
    autoAdvanceTime: number;    // Автопродвижение диалогов (0 = отключено)
    language: string;           // Язык локализации
}

/**
 * Система сохранения и восстановления состояния диалогов
 */
@ccclass('DialogSaveSystem')
export class DialogSaveSystem extends Component {
    
    private static readonly SAVE_KEY_PREFIX = 'dialog_save_';
    private static readonly SETTINGS_KEY = 'dialog_settings';
    private static readonly RELATIONS_KEY = 'character_relations';

    private static instance: DialogSaveSystem = null;
    private dialogHistory: Map<string, DialogSaveData> = new Map();
    private characterRelations: Map<string, number> = new Map();
    private settings: DialogSystemSettings;

    onLoad() {
        if (DialogSaveSystem.instance === null) {
            DialogSaveSystem.instance = this;
            this.loadSettings();
            this.loadCharacterRelations();
        } else {
            this.destroy();
            return;
        }
    }

    public static getInstance(): DialogSaveSystem {
        return DialogSaveSystem.instance;
    }

    /**
     * Сохранить состояние диалога
     */
    public saveDialogState(dialogId: string, currentIndex: number, isCompleted: boolean, choices?: number[]) {
        const saveData: DialogSaveData = {
            dialogId,
            currentIndex,
            isCompleted,
            choices: choices || [],
            timestamp: Date.now(),
            characterRelations: this.characterRelationsToObject()
        };

        this.dialogHistory.set(dialogId, saveData);
        
        // Сохранить в локальное хранилище
        const saveKey = DialogSaveSystem.SAVE_KEY_PREFIX + dialogId;
        sys.localStorage.setItem(saveKey, JSON.stringify(saveData));

        console.log(`Dialog state saved: ${dialogId}`);
    }

    /**
     * Загрузить состояние диалога
     */
    public loadDialogState(dialogId: string): DialogSaveData | null {
        // Сначала проверить в памяти
        if (this.dialogHistory.has(dialogId)) {
            return this.dialogHistory.get(dialogId)!;
        }

        // Загрузить из локального хранилища
        const saveKey = DialogSaveSystem.SAVE_KEY_PREFIX + dialogId;
        const savedData = sys.localStorage.getItem(saveKey);
        
        if (savedData) {
            try {
                const saveData: DialogSaveData = JSON.parse(savedData);
                this.dialogHistory.set(dialogId, saveData);
                
                // Восстановить отношения с персонажами
                if (saveData.characterRelations) {
                    Object.entries(saveData.characterRelations).forEach(([character, relation]) => {
                        this.characterRelations.set(character, relation);
                    });
                }
                
                return saveData;
            } catch (error) {
                console.error(`Error loading dialog state for ${dialogId}:`, error);
                return null;
            }
        }

        return null;
    }

    /**
     * Проверить, был ли диалог завершен
     */
    public isDialogCompleted(dialogId: string): boolean {
        const saveData = this.loadDialogState(dialogId);
        return saveData ? saveData.isCompleted : false;
    }

    /**
     * Получить прогресс диалога
     */
    public getDialogProgress(dialogId: string): number {
        const saveData = this.loadDialogState(dialogId);
        return saveData ? saveData.currentIndex : 0;
    }

    /**
     * Удалить сохранение диалога
     */
    public deleteDialogSave(dialogId: string) {
        this.dialogHistory.delete(dialogId);
        const saveKey = DialogSaveSystem.SAVE_KEY_PREFIX + dialogId;
        sys.localStorage.removeItem(saveKey);
    }

    /**
     * Получить все сохраненные диалоги
     */
    public getAllSavedDialogs(): DialogSaveData[] {
        const allSaves: DialogSaveData[] = [];
        
        // Получить все ключи из localStorage
        const keys = Object.keys(sys.localStorage);
        keys.forEach(key => {
            if (key.startsWith(DialogSaveSystem.SAVE_KEY_PREFIX)) {
                const savedData = sys.localStorage.getItem(key);
                if (savedData) {
                    try {
                        const saveData: DialogSaveData = JSON.parse(savedData);
                        allSaves.push(saveData);
                    } catch (error) {
                        console.error(`Error parsing saved dialog data for key ${key}:`, error);
                    }
                }
            }
        });

        return allSaves;
    }

    /**
     * Очистить все сохранения диалогов
     */
    public clearAllDialogSaves() {
        this.dialogHistory.clear();
        
        const keys = Object.keys(sys.localStorage);
        keys.forEach(key => {
            if (key.startsWith(DialogSaveSystem.SAVE_KEY_PREFIX)) {
                sys.localStorage.removeItem(key);
            }
        });
    }

    /**
     * Сохранить настройки диалоговой системы
     */
    public saveSettings(settings: DialogSystemSettings) {
        this.settings = { ...settings };
        sys.localStorage.setItem(DialogSaveSystem.SETTINGS_KEY, JSON.stringify(settings));
    }

    /**
     * Загрузить настройки диалоговой системы
     */
    public loadSettings(): DialogSystemSettings {
        const savedSettings = sys.localStorage.getItem(DialogSaveSystem.SETTINGS_KEY);
        
        if (savedSettings) {
            try {
                this.settings = JSON.parse(savedSettings);
            } catch (error) {
                console.error('Error loading dialog settings:', error);
                this.settings = this.getDefaultSettings();
            }
        } else {
            this.settings = this.getDefaultSettings();
        }

        return this.settings;
    }

    /**
     * Получить текущие настройки
     */
    public getSettings(): DialogSystemSettings {
        return this.settings || this.getDefaultSettings();
    }

    /**
     * Получить настройки по умолчанию
     */
    private getDefaultSettings(): DialogSystemSettings {
        return {
            enableTypewriter: true,
            typewriterSpeed: 30,
            enableSounds: true,
            enableAnimations: true,
            autoAdvanceTime: 0,
            language: 'ru'
        };
    }

    /**
     * Обновить отношения с персонажем
     */
    public updateCharacterRelation(characterName: string, change: number) {
        const currentRelation = this.characterRelations.get(characterName) || 0;
        const newRelation = Math.max(-100, Math.min(100, currentRelation + change));
        
        this.characterRelations.set(characterName, newRelation);
        this.saveCharacterRelations();

        console.log(`Character relation updated: ${characterName} = ${newRelation} (${change >= 0 ? '+' : ''}${change})`);
    }

    /**
     * Получить отношения с персонажем
     */
    public getCharacterRelation(characterName: string): number {
        return this.characterRelations.get(characterName) || 0;
    }

    /**
     * Получить все отношения с персонажами
     */
    public getAllCharacterRelations(): Map<string, number> {
        return new Map(this.characterRelations);
    }

    /**
     * Сохранить отношения с персонажами
     */
    private saveCharacterRelations() {
        const relationsObject = this.characterRelationsToObject();
        sys.localStorage.setItem(DialogSaveSystem.RELATIONS_KEY, JSON.stringify(relationsObject));
    }

    /**
     * Загрузить отношения с персонажами
     */
    private loadCharacterRelations() {
        const savedRelations = sys.localStorage.getItem(DialogSaveSystem.RELATIONS_KEY);
        
        if (savedRelations) {
            try {
                const relationsObject = JSON.parse(savedRelations);
                Object.entries(relationsObject).forEach(([character, relation]) => {
                    this.characterRelations.set(character, relation as number);
                });
            } catch (error) {
                console.error('Error loading character relations:', error);
            }
        }
    }

    /**
     * Преобразовать Map отношений в объект для сохранения
     */
    private characterRelationsToObject(): { [key: string]: number } {
        const obj: { [key: string]: number } = {};
        this.characterRelations.forEach((value, key) => {
            obj[key] = value;
        });
        return obj;
    }

    /**
     * Создать резервную копию всех данных
     */
    public createBackup(): string {
        const backup = {
            dialogs: this.getAllSavedDialogs(),
            settings: this.getSettings(),
            characterRelations: this.characterRelationsToObject(),
            timestamp: Date.now()
        };

        return JSON.stringify(backup);
    }

    /**
     * Восстановить из резервной копии
     */
    public restoreFromBackup(backupData: string): boolean {
        try {
            const backup = JSON.parse(backupData);
            
            // Очистить текущие данные
            this.clearAllDialogSaves();
            this.characterRelations.clear();
            
            // Восстановить диалоги
            if (backup.dialogs) {
                backup.dialogs.forEach((saveData: DialogSaveData) => {
                    this.saveDialogState(
                        saveData.dialogId,
                        saveData.currentIndex,
                        saveData.isCompleted,
                        saveData.choices
                    );
                });
            }
            
            // Восстановить настройки
            if (backup.settings) {
                this.saveSettings(backup.settings);
            }
            
            // Восстановить отношения
            if (backup.characterRelations) {
                Object.entries(backup.characterRelations).forEach(([character, relation]) => {
                    this.characterRelations.set(character, relation as number);
                });
                this.saveCharacterRelations();
            }
            
            return true;
        } catch (error) {
            console.error('Error restoring from backup:', error);
            return false;
        }
    }

    onDestroy() {
        if (DialogSaveSystem.instance === this) {
            DialogSaveSystem.instance = null;
        }
    }
}
