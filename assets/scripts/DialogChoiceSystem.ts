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
    @property
    public choiceButtonPrefab: Prefab = null;

    @property
    public choiceContainer: Node = null;

    private _currentChoices: DialogChoice[] = [];
    private _onChoiceSelected: ((choiceIndex: number) => void) | null = null;

    public get currentChoices(): DialogChoice[] {
        return this._currentChoices;
    }

    public get isActive(): boolean {
        return !!this.choiceContainer && this.choiceContainer.active;
    }

    protected onLoad() {
        if (!this.choiceContainer) {
            this.choiceContainer = this.node.getChildByName('ChoiceContainer');
        }
    }

    /**
     * Показать выборы для текущего диалога
     */
    public showChoices(choices: DialogChoice[], onChoiceSelected: (choiceIndex: number) => void) {
        this._currentChoices = choices;
        this._onChoiceSelected = onChoiceSelected;
        DialogChoiceSystem.clearContainer(this.choiceContainer);
        choices.forEach((choice, index) => {
            if (choice.condition && !choice.condition()) {
                return;
            }
            this.createChoiceButton(choice, index);
        });
        if (this.choiceContainer) {
            this.choiceContainer.active = true;
        }
    }

    /**
     * Скрыть выборы
     */
    public hideChoices() {
        DialogChoiceSystem.clearContainer(this.choiceContainer);
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
        const label = buttonNode.getComponentInChildren(Label);
        if (label) {
            label.string = choice.text;
        }
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
        const choice = this._currentChoices[choiceIndex];
        if (!choice) return;
        this.hideChoices();
        if (choice.action) {
            choice.action();
        }
        if (choice.consequenceDialogs && choice.consequenceDialogs.length > 0) {
            DialogManager.getInstance()?.showDialog(choice.consequenceDialogs);
        }
        if (this._onChoiceSelected) {
            this._onChoiceSelected(choiceIndex);
        }
    }

    /**
     * Очистить все кнопки выборов (утилита)
     */
    public static clearContainer(container: Node) {
        if (!container) return;
        container.children.forEach(child => child.destroy());
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
