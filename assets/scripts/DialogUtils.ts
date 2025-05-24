import { DialogData } from './DialogSystem';

/**
 * Утилиты для работы с диалогами
 */
export class DialogUtils {
    
    /**
     * Создать простой диалог с одним сообщением
     */
    static createSimpleDialog(speaker: string, text: string, avatarIndex: number = 0): DialogData[] {
        return [
            {
                speaker,
                text,
                avatarIndex
            }
        ];
    }    /**
     * Объединить несколько диалогов в один
     */
    static combineDialogs(...dialogArrays: DialogData[][]): DialogData[] {
        const result: DialogData[] = [];
        for (const dialogArray of dialogArrays) {
            result.push(...dialogArray);
        }
        return result;
    }

    /**
     * Создать диалог с задержкой (можно использовать для пауз)
     */
    static createPauseDialog(speaker: string = "...", text: string = "...", avatarIndex: number = -1): DialogData {
        return {
            speaker,
            text,
            avatarIndex
        };
    }

    /**
     * Случайно выбрать один из предложенных диалогов
     */
    static getRandomDialog(dialogOptions: DialogData[][]): DialogData[] {
        if (dialogOptions.length === 0) return [];
        const randomIndex = Math.floor(Math.random() * dialogOptions.length);
        return dialogOptions[randomIndex];
    }

    /**
     * Создать диалог-монолог (один персонаж говорит несколько реплик)
     */
    static createMonologue(speaker: string, texts: string[], avatarIndex: number): DialogData[] {
        return texts.map(text => ({
            speaker,
            text,
            avatarIndex
        }));
    }

    /**
     * Создать диалог-беседу между двумя персонажами
     */
    static createConversation(
        speaker1: string, 
        speaker2: string, 
        avatar1Index: number, 
        avatar2Index: number, 
        texts: string[]
    ): DialogData[] {
        return texts.map((text, index) => ({
            speaker: index % 2 === 0 ? speaker1 : speaker2,
            text,
            avatarIndex: index % 2 === 0 ? avatar1Index : avatar2Index
        }));
    }

    /**
     * Валидация данных диалога
     */
    static validateDialog(dialog: DialogData): boolean {
        return !!(dialog.speaker && dialog.text && dialog.avatarIndex >= 0);
    }

    /**
     * Валидация массива диалогов
     */
    static validateDialogs(dialogs: DialogData[]): boolean {
        return dialogs.length > 0 && dialogs.every(dialog => this.validateDialog(dialog));
    }

    /**
     * Фильтр диалогов по персонажу
     */
    static filterBySpeaker(dialogs: DialogData[], speaker: string): DialogData[] {
        return dialogs.filter(dialog => dialog.speaker === speaker);
    }

    /**
     * Получить уникальных персонажей из диалогов
     */
    static getUniqueSpeakers(dialogs: DialogData[]): string[] {
        const speakers = dialogs.map(dialog => dialog.speaker);
        return [...new Set(speakers)];
    }

    /**
     * Подсчитать количество реплик для каждого персонажа
     */
    static countRepliesBySpeaker(dialogs: DialogData[]): Map<string, number> {
        const counts = new Map<string, number>();
        dialogs.forEach(dialog => {
            const current = counts.get(dialog.speaker) || 0;
            counts.set(dialog.speaker, current + 1);
        });
        return counts;
    }

    /**
     * Создать системное сообщение (от игры/системы)
     */
    static createSystemMessage(text: string, avatarIndex: number = 1): DialogData {
        return {
            speaker: "Система",
            text,
            avatarIndex
        };
    }

    /**
     * Создать сообщение об ошибке/предупреждение
     */
    static createWarningMessage(text: string, avatarIndex: number = 2): DialogData {
        return {
            speaker: "Предупреждение",
            text,
            avatarIndex
        };
    }
}

/**
 * Предустановленные персонажи для быстрого использования
 */
export enum DialogCharacters {
    CAPTAIN = 0,
    AI_SHIP = 1,
    SCANNER = 2,
    TRADER = 3,
    ENEMY = 4,
    SYSTEM = 1,
    WARNING = 2
}

/**
 * Фабрика для создания типовых диалогов
 */
export class DialogFactory {
    
    /**
     * Создать приветственный диалог
     */
    static createWelcome(captainName: string = "Капитан"): DialogData[] {
        return [
            {
                speaker: captainName,
                text: "Добро пожаловать на борт нашего корабля!",
                avatarIndex: DialogCharacters.CAPTAIN
            },
            {
                speaker: "ИИ Корабля",
                text: "Все системы готовы к работе, капитан.",
                avatarIndex: DialogCharacters.AI_SHIP
            }
        ];
    }

    /**
     * Создать диалог об ошибке
     */
    static createError(errorText: string): DialogData[] {
        return [
            {
                speaker: "Система",
                text: `Произошла ошибка: ${errorText}`,
                avatarIndex: DialogCharacters.SYSTEM
            }
        ];
    }

    /**
     * Создать диалог подтверждения
     */
    static createConfirmation(actionText: string): DialogData[] {
        return [
            {
                speaker: "Система",
                text: `${actionText} выполнено успешно.`,
                avatarIndex: DialogCharacters.SYSTEM
            }
        ];
    }

    /**
     * Создать диалог открытия новой функции
     */
    static createFeatureUnlock(featureName: string): DialogData[] {
        return [
            {
                speaker: "ИИ Корабля",
                text: `Отличные новости! Разблокирована новая функция: ${featureName}`,
                avatarIndex: DialogCharacters.AI_SHIP
            },
            {
                speaker: "Капитан",
                text: "Превосходно! Это расширит наши возможности.",
                avatarIndex: DialogCharacters.CAPTAIN
            }
        ];
    }

    /**
     * Создать диалог достижения
     */
    static createAchievement(achievementName: string): DialogData[] {
        return [
            {
                speaker: "Система",
                text: `Поздравляем! Получено достижение: ${achievementName}`,
                avatarIndex: DialogCharacters.SYSTEM
            }
        ];
    }
}
