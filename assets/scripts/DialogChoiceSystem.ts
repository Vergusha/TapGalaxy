import { _decorator, Component, Node, Button, Label, instantiate, Prefab } from 'cc';
import { DialogData, DialogSystem } from './DialogSystem';
import { DialogManager } from './DialogManager';
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
 * Система выборов в диалогах для создания ветвящихся диалогов
 */
@ccclass('DialogChoiceSystem')
export class DialogChoiceSystem extends Component {
    
    @property({ type: Prefab })
    choiceButtonPrefab: Prefab = null;

    @property({ type: Node })
    choiceContainer: Node = null;

    private currentChoices: DialogChoice[] = [];
    private onChoiceSelected: ((choiceIndex: number) => void) | null = null;

    onLoad() {
        // Автоматически найти контейнер для выборов, если не назначен
        if (!this.choiceContainer) {
            this.choiceContainer = this.node.getChildByName('ChoiceContainer');
        }
    }

    /**
     * Показать выборы для текущего диалога
     */
    public showChoices(choices: DialogChoice[], onChoiceSelected: (choiceIndex: number) => void) {
        this.currentChoices = choices;
        this.onChoiceSelected = onChoiceSelected;

        this.clearChoices();

        choices.forEach((choice, index) => {
            // Проверить условие доступности выбора
            if (choice.condition && !choice.condition()) {
                return; // Пропустить недоступный выбор
            }

            this.createChoiceButton(choice, index);
        });

        // Показать контейнер с выборами
        if (this.choiceContainer) {
            this.choiceContainer.active = true;
        }
    }

    /**
     * Скрыть выборы
     */
    public hideChoices() {
        this.clearChoices();
        if (this.choiceContainer) {
            this.choiceContainer.active = false;
        }
    }

    /**
     * Создать кнопку выбора
     */
    private createChoiceButton(choice: DialogChoice, index: number) {
        if (!this.choiceButtonPrefab || !this.choiceContainer) {
            console.error('DialogChoiceSystem: Choice button prefab or container not set');
            return;
        }

        const buttonNode = instantiate(this.choiceButtonPrefab);
        this.choiceContainer.addChild(buttonNode);

        // Установить текст
        const label = buttonNode.getComponentInChildren(Label);
        if (label) {
            label.string = choice.text;
        }

        // Настроить обработчик клика
        const button = buttonNode.getComponent(Button);
        if (button) {
            button.node.on(Button.EventType.CLICK, () => {
                this.selectChoice(index);
            }, this);
        }
    }

    /**
     * Выбрать опцию
     */
    private selectChoice(choiceIndex: number) {
        const choice = this.currentChoices[choiceIndex];
        if (!choice) return;

        // Скрыть выборы
        this.hideChoices();

        // Выполнить действие выбора
        if (choice.action) {
            choice.action();
        }

        // Показать последующие диалоги
        if (choice.consequenceDialogs && choice.consequenceDialogs.length > 0) {
            DialogManager.getInstance()?.showDialog(choice.consequenceDialogs);
        }

        // Уведомить о выборе
        if (this.onChoiceSelected) {
            this.onChoiceSelected(choiceIndex);
        }
    }

    /**
     * Очистить все кнопки выборов
     */
    private clearChoices() {
        if (!this.choiceContainer) return;

        this.choiceContainer.children.forEach(child => {
            child.destroy();
        });
    }
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
    protected showDialog(index: number) {
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
    protected completeDialog() {
        this.choiceSystem?.hideChoices();
        super.completeDialog();
    }
}

/**
 * Утилиты для создания диалогов с выборами
 */
export class DialogChoiceUtils {
    
    /**
     * Создать простой диалог с выборами
     */
    static createChoiceDialog(
        speaker: string, 
        text: string, 
        avatarIndex: number, 
        choices: DialogChoice[]
    ): DialogDataWithChoices {
        return {
            speaker,
            text,
            avatarIndex,
            choices
        };
    }

    /**
     * Создать выбор да/нет
     */
    static createYesNoChoice(
        onYes: () => void, 
        onNo: () => void,
        yesText: string = "Да",
        noText: string = "Нет"
    ): DialogChoice[] {
        return [
            {
                text: yesText,
                action: onYes
            },
            {
                text: noText,
                action: onNo
            }
        ];
    }

    /**
     * Создать выбор торговца
     */
    static createTraderChoices(): DialogChoice[] {
        return [
            {
                text: "Купить ресурсы",
                consequenceDialogs: [
                    {
                        speaker: "Торговец",
                        text: "Отличный выбор! Вот мои лучшие предложения.",
                        avatarIndex: 3
                    }
                ]
            },
            {
                text: "Продать товары",
                consequenceDialogs: [
                    {
                        speaker: "Торговец",
                        text: "Покажите, что у вас есть. Я оценю справедливо.",
                        avatarIndex: 3
                    }
                ]
            },
            {
                text: "Уйти",
                consequenceDialogs: [
                    {
                        speaker: "Торговец",
                        text: "Возвращайтесь, когда будете готовы к сделке!",
                        avatarIndex: 3
                    }
                ]
            }
        ];
    }

    /**
     * Создать выборы для боевой ситуации
     */
    static createCombatChoices(): DialogChoice[] {
        return [
            {
                text: "Атаковать!",
                consequenceDialogs: [
                    {
                        speaker: "Капитан",
                        text: "Огонь! Покажем им, на что способны!",
                        avatarIndex: 0
                    }
                ]
            },
            {
                text: "Попытаться договориться",
                consequenceDialogs: [
                    {
                        speaker: "Капитан",
                        text: "Открываю канал связи. Попробуем решить мирно.",
                        avatarIndex: 0
                    }
                ]
            },
            {
                text: "Отступить",
                consequenceDialogs: [
                    {
                        speaker: "Капитан",
                        text: "Отходим! Живем для следующего боя.",
                        avatarIndex: 0
                    }
                ]
            }
        ];
    }

    /**
     * Создать выборы исследования
     */
    static createExplorationChoices(): DialogChoice[] {
        return [
            {
                text: "Исследовать аномалию",
                consequenceDialogs: [
                    {
                        speaker: "Сканер",
                        text: "Начинаю глубокое сканирование аномалии...",
                        avatarIndex: 2
                    }
                ]
            },
            {
                text: "Обойти стороной",
                consequenceDialogs: [
                    {
                        speaker: "Капитан",
                        text: "Безопасность прежде всего. Меняем курс.",
                        avatarIndex: 0
                    }
                ]
            },
            {
                text: "Отправить зонд",
                consequenceDialogs: [
                    {
                        speaker: "ИИ Корабля",
                        text: "Запускаю исследовательский зонд. Ждем данные.",
                        avatarIndex: 1
                    }
                ]
            }
        ];
    }
}
