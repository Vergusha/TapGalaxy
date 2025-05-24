import { _decorator, Component, Prefab, instantiate, find, Node } from 'cc';
import { DialogSystem, DialogData } from './DialogSystem';
import { DialogUtils, DialogFactory, DialogCharacters } from './DialogUtils';
import { DialogSaveSystem } from './DialogSaveSystem';
import { DialogLocalization } from './DialogLocalization';
import { DialogIntegrationManager } from './DialogIntegrationManager';
const { ccclass, property } = _decorator;

@ccclass('DialogManager')
export class DialogManager extends Component {
    @property({ type: Prefab })
    public dialogBoxPrefab: Prefab = null;

    @property
    public enableAutoSave: boolean = true;

    @property
    public enableLocalization: boolean = true;

    private static _instance: DialogManager = null;
    private _currentDialogInstance: Node = null;
    private _currentDialogId: string = '';
    private _dialogCounter: number = 0;

    public static getInstance(): DialogManager { return this._instance; }
    public get currentDialogInstance(): Node { return this._currentDialogInstance; }
    public get currentDialogId(): string { return this._currentDialogId; }
    public get dialogCounter(): number { return this._dialogCounter; }

    onLoad() {
        // Singleton pattern
        if (DialogManager._instance === null) {
            DialogManager._instance = this;
            this.initializeSubSystems();
        } else {
            this.destroy();
            return;
        }
    }

    /**
     * Инициализировать подсистемы
     */
    private initializeSubSystems() {
        // Инициализация системы сохранения
        if (this.enableAutoSave) {
            const saveSystem = this.node.getComponent(DialogSaveSystem) || this.node.addComponent(DialogSaveSystem);
        }

        // Инициализация системы локализации
        if (this.enableLocalization) {
            const localization = this.node.getComponent(DialogLocalization) || this.node.addComponent(DialogLocalization);
        }

        // Инициализация менеджера интеграции
        const integrationManager = this.node.getComponent(DialogIntegrationManager) || this.node.addComponent(DialogIntegrationManager);
    }

    /**
     * Показать диалог с расширенными возможностями
     * @param dialogs Массив диалогов для показа
     * @param onComplete Callback при завершении диалогов
     * @param dialogId Уникальный ID диалога для сохранения прогресса
     * @param autoSave Автоматически сохранять прогресс
     */
    public showDialog(
        dialogs: DialogData[], 
        onComplete?: () => void, 
        dialogId?: string,
        autoSave: boolean = true
    ) {
        // Создать уникальный ID если не предоставлен
        if (!dialogId) {
            dialogId = `dialog_${++this._dialogCounter}_${Date.now()}`;
        }

        this._currentDialogId = dialogId;

        // Локализовать диалоги если включена локализация
        let processedDialogs = dialogs;
        if (this.enableLocalization) {
            const localization = DialogLocalization.getInstance();
            if (localization) {
                processedDialogs = localization.localizeDialogs(dialogs);
            }
        }

        // Проверить сохраненный прогресс
        let startIndex = 0;
        if (this.enableAutoSave && autoSave) {
            const saveSystem = DialogSaveSystem.getInstance();
            if (saveSystem) {
                const savedState = saveSystem.loadDialogState(dialogId);
                if (savedState && !savedState.isCompleted) {
                    startIndex = savedState.currentIndex;
                    console.log(`Resuming dialog ${dialogId} from index ${startIndex}`);
                }
            }
        }

        // Если уже есть активный диалог, закрыть его
        if (this._currentDialogInstance && this._currentDialogInstance.isValid) {
            this._currentDialogInstance.destroy();
        }

        if (!this.dialogBoxPrefab) {
            console.error('DialogManager: DialogBox prefab is not assigned');
            return;
        }

        // Найти Canvas
        const canvas = find('Canvas');
        if (!canvas) {
            console.error('DialogManager: Canvas not found');
            return;
        }

        // Создать экземпляр диалога
        this._currentDialogInstance = instantiate(this.dialogBoxPrefab);
        canvas.addChild(this._currentDialogInstance);

        // Получить компонент DialogSystem
        const dialogSystem = this._currentDialogInstance.getComponent(DialogSystem);
        if (!dialogSystem) {
            console.error('DialogManager: DialogSystem component not found on DialogBox prefab');
            this._currentDialogInstance.destroy();
            return;
        }

        // Настроить диалог с текущими настройками
        this.applySettingsToDialog(dialogSystem);

        // Инициализировать диалоги
        dialogSystem.initDialogs(processedDialogs, () => {
            // Сохранить завершение диалога
            if (this.enableAutoSave && autoSave) {
                this.saveDialogCompletion(dialogId, processedDialogs.length);
            }

            this._currentDialogInstance = null;
            this._currentDialogId = '';
            
            if (onComplete) {
                onComplete();
            }
        });

        // Если есть сохраненный прогресс, перейти к нужной позиции
        if (startIndex > 0) {
            // Пропустить к сохраненной позиции
            for (let i = 0; i < startIndex; i++) {
                dialogSystem.nextDialog();
            }
        }

        // Настроить автосохранение прогресса
        if (this.enableAutoSave && autoSave) {
            this.setupAutoSave(dialogSystem, dialogId);
        }
    }

    /**
     * Применить настройки к диалогу
     */
    private applySettingsToDialog(dialogSystem: DialogSystem) {
        const saveSystem = DialogSaveSystem.getInstance();
        if (saveSystem) {
            const settings = saveSystem.getSettings();
            
            // Применить настройки из системы сохранения
            if (settings.enableTypewriter !== undefined) {
                dialogSystem.enableTypewriter = settings.enableTypewriter;
            }
            if (settings.typewriterSpeed !== undefined) {
                dialogSystem.typewriterSpeed = settings.typewriterSpeed;
            }
            if (settings.enableSounds !== undefined) {
                dialogSystem.enableSounds = settings.enableSounds;
            }
            if (settings.enableAnimations !== undefined) {
                dialogSystem.enableAppearAnimation = settings.enableAnimations;
            }
        }
    }

    /**
     * Настроить автосохранение прогресса
     */
    private setupAutoSave(dialogSystem: DialogSystem, dialogId: string) {
        // Переопределить метод nextDialog для сохранения прогресса
        const originalNextDialog = dialogSystem.nextDialog.bind(dialogSystem);
        
        dialogSystem.nextDialog = () => {
            originalNextDialog();
            
            // Сохранить текущий прогресс
            const currentIndex = dialogSystem.getCurrentDialogIndex();
            const isCompleted = !dialogSystem.hasMoreDialogs();
            
            this.saveDialogProgress(dialogId, currentIndex, isCompleted);
        };
    }

    /**
     * Сохранить прогресс диалога
     */
    private saveDialogProgress(dialogId: string, currentIndex: number, isCompleted: boolean) {
        const saveSystem = DialogSaveSystem.getInstance();
        if (saveSystem) {
            saveSystem.saveDialogState(dialogId, currentIndex, isCompleted);
        }
    }

    /**
     * Сохранить завершение диалога
     */
    private saveDialogCompletion(dialogId: string, totalDialogs: number) {
        const saveSystem = DialogSaveSystem.getInstance();
        if (saveSystem) {
            saveSystem.saveDialogState(dialogId, totalDialogs, true);
        }
    }

    /**
     * Закрыть текущий диалог
     */
    public closeCurrentDialog() {
        if (this._currentDialogInstance && this._currentDialogInstance.isValid) {
            const dialogSystem = this._currentDialogInstance.getComponent(DialogSystem);
            if (dialogSystem) {
                dialogSystem.closeDialog();
            } else {
                this._currentDialogInstance.destroy();
            }
            this._currentDialogInstance = null;
            this._currentDialogId = '';
        }
    }

    /**
     * Показать простое сообщение
     */
    public showSimpleMessage(speaker: string, text: string, avatarIndex: number = 0, onComplete?: () => void) {
        const dialog = DialogUtils.createSimpleDialog(speaker, text, avatarIndex);
        this.showDialog(dialog, onComplete);
    }

    /**
     * Показать системное сообщение
     */
    public showSystemMessage(text: string, onComplete?: () => void) {
        const dialog = DialogUtils.createSimpleDialog("Система", text, DialogCharacters.SYSTEM);
        this.showDialog(dialog, onComplete);
    }

    /**
     * Показать сообщение об ошибке
     */
    public showError(errorText: string, onComplete?: () => void) {
        const dialog = DialogFactory.createError(errorText);
        this.showDialog(dialog, onComplete);
    }

    /**
     * Показать сообщение подтверждения
     */
    public showConfirmation(actionText: string, onComplete?: () => void) {
        const dialog = DialogFactory.createConfirmation(actionText);
        this.showDialog(dialog, onComplete);
    }

    /**
     * Показать диалог разблокировки функции
     */
    public showFeatureUnlock(featureName: string, onComplete?: () => void) {
        const dialog = DialogFactory.createFeatureUnlock(featureName);
        this.showDialog(dialog, onComplete);
    }

    /**
     * Показать диалог достижения
     */
    public showAchievement(achievementName: string, onComplete?: () => void) {
        const dialog = DialogFactory.createAchievement(achievementName);
        this.showDialog(dialog, onComplete);
    }

    /**
     * Показать локализованное сообщение
     */
    public showLocalizedMessage(textKey: string, speakerKey: string = 'system', avatarIndex: number = 1, params?: { [key: string]: string | number }, onComplete?: () => void) {
        const localization = DialogLocalization.getInstance();
        if (localization) {
            const speaker = localization.getString(speakerKey);
            const text = localization.getString(textKey, params);
            this.showSimpleMessage(speaker, text, avatarIndex, onComplete);
        } else {
            this.showSimpleMessage(speakerKey, textKey, avatarIndex, onComplete);
        }
    }

    /**
     * Проверить, активен ли диалог
     */
    public isDialogActive(): boolean {
        return this._currentDialogInstance !== null && this._currentDialogInstance.isValid;
    }

    /**
     * Получить ID текущего диалога
     */
    public getCurrentDialogId(): string {
        return this._currentDialogId;
    }

    /**
     * Возобновить диалог по ID
     */
    public resumeDialog(dialogId: string, dialogs: DialogData[], onComplete?: () => void) {
        console.log(`Resuming dialog: ${dialogId}`);
        this.showDialog(dialogs, onComplete, dialogId, true);
    }

    /**
     * Проверить, завершен ли диалог
     */
    public isDialogCompleted(dialogId: string): boolean {
        const saveSystem = DialogSaveSystem.getInstance();
        return saveSystem ? saveSystem.isDialogCompleted(dialogId) : false;
    }

    /**
     * Получить прогресс диалога
     */
    public getDialogProgress(dialogId: string): number {
        const saveSystem = DialogSaveSystem.getInstance();
        return saveSystem ? saveSystem.getDialogProgress(dialogId) : 0;
    }

    /**
     * Обновить настройки диалоговой системы
     */
    public updateSettings(newSettings: any) {
        const saveSystem = DialogSaveSystem.getInstance();
        if (saveSystem) {
            saveSystem.saveSettings(newSettings);
        }
    }

    /**
     * Изменить язык диалогов
     */
    public async changeLanguage(languageCode: string) {
        const localization = DialogLocalization.getInstance();
        if (localization) {
            await localization.setLanguage(languageCode);
            console.log(`Dialog language changed to: ${languageCode}`);
        }
    }

    onDestroy() {
        if (DialogManager._instance === this) {
            DialogManager._instance = null;
        }
    }
}

// Предопределенные наборы диалогов для удобства
export class DialogPresets {
    /**
     * Пример диалога приветствия
     */
    static getWelcomeDialog(): DialogData[] {
        return DialogFactory.createWelcome();
    }

    /**
     * Пример диалога о бое
     */
    static getFightDialog(): DialogData[] {
        return DialogUtils.createConversation(
            "Сканер", "Капитан", 
            DialogCharacters.SCANNER, DialogCharacters.CAPTAIN,
            [
                "Обнаружен вражеский корабль на радаре!",
                "Приготовиться к бою! Зарядить оружие!"
            ]
        );
    }

    /**
     * Пример диалога торговца
     */
    static getTraderDialog(): DialogData[] {
        return DialogUtils.createMonologue(
            "Торговец",
            [
                "Приветствую, путешественник! У меня есть отличные предложения.",
                "Что вас интересует? Ресурсы? Улучшения для корабля?"
            ],
            DialogCharacters.TRADER
        );
    }

    /**
     * Диалог получения ресурсов
     */
    static getResourceGainDialog(resourceName: string, amount: number): DialogData[] {
        return [
            {
                speaker: "ИИ Корабля",
                text: `Получено: ${amount} ${resourceName}`,
                avatarIndex: DialogCharacters.AI_SHIP
            }
        ];
    }

    /**
     * Диалог нехватки ресурсов
     */
    static getInsufficientResourcesDialog(resourceName: string): DialogData[] {
        return [
            {
                speaker: "ИИ Корабля", 
                text: `Недостаточно ресурсов: ${resourceName}`,
                avatarIndex: DialogCharacters.AI_SHIP
            },
            {
                speaker: "Капитан",
                text: "Нужно добыть больше ресурсов перед следующей операцией.",
                avatarIndex: DialogCharacters.CAPTAIN
            }
        ];
    }

    /**
     * Диалог с локализацией
     */
    static getLocalizedWelcomeDialog(): DialogData[] {
        const localization = DialogLocalization.getInstance();
        if (localization) {
            return [
                {
                    speaker: localization.getString('captain'),
                    text: localization.getString('trade.welcome'),
                    avatarIndex: DialogCharacters.CAPTAIN
                },
                {
                    speaker: localization.getString('ai_ship'),
                    text: localization.getString('combat.systems_ready'),
                    avatarIndex: DialogCharacters.AI_SHIP
                }
            ];
        }
        return DialogFactory.createWelcome();
    }
}
