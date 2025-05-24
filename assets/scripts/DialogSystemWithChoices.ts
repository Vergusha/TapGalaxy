import { _decorator, Component } from 'cc';
import { DialogData, DialogSystem } from './DialogSystem';
import { DialogChoiceSystem } from './DialogChoiceSystem';
const { ccclass, property } = _decorator;

/**
 * Интерфейс для выбора в диалоге
 */
export interface DialogChoice {
    text: string;           // Текст выбора
    consequenceDialogs?: DialogData[];  // Диалоги после выбора
    action?: () => void;    // Действие при выборе
    condition?: () => boolean;  // Условие доступности выбора
}

/**
 * Расширенные данные диалога с выборами
 */
export interface DialogDataWithChoices extends DialogData {
    choices?: DialogChoice[];   // Массив выборов
}

/**
 * Расширенная версия DialogSystem с поддержкой выборов
 */
@ccclass('DialogSystemWithChoices')
export class DialogSystemWithChoices extends DialogSystem {
    
    @property({ type: DialogChoiceSystem })
    choiceSystem: DialogChoiceSystem = null;

    private currentDialogData: DialogDataWithChoices[] = [];

    onLoad() {
        super.onLoad();
        
        // Автоматически найти систему выборов
        if (!this.choiceSystem) {
            this.choiceSystem = this.getComponent(DialogChoiceSystem);
        }
    }

    /**
     * Инициализировать диалоги с поддержкой выборов
     */
    public initDialogsWithChoices(dialogs: DialogDataWithChoices[], onComplete?: () => void) {
        this.currentDialogData = dialogs;
        super.initDialogs(dialogs, onComplete);
    }

    /**
     * Переопределенный метод показа диалога для поддержки выборов
     */
    public showDialog(index: number) {
        super.showDialog(index);

        const dialog = this.currentDialogData[index];
        if (dialog && dialog.choices && dialog.choices.length > 0) {
            // Показать выборы для этого диалога
            this.choiceSystem?.showChoices(dialog.choices, (choiceIndex) => {
                // После выбора продолжить с обычными диалогами
                this.nextDialog();
            });
        } else {
            // Скрыть выборы, если их нет
            this.choiceSystem?.hideChoices();
        }
    }

    /**
     * Переопределенный метод завершения диалога
     */
    public completeDialog() {
        this.choiceSystem?.hideChoices();
        super.completeDialog();
    }
}
