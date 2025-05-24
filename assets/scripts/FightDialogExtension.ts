import { _decorator, Component } from 'cc';
import { DialogManager } from './DialogManager';
import { DialogData } from './DialogSystem';
import { FightButton } from './FightButton';
const { ccclass, property } = _decorator;

/**
 * Расширение для FightButton, добавляющее диалоги перед боем
 * Этот компонент должен быть добавлен на тот же узел, что и FightButton
 */
@ccclass('FightDialogExtension')
export class FightDialogExtension extends Component {
    @property({ type: Boolean })
    enablePreFightDialog: boolean = true;

    @property({ type: Boolean })
    enablePostFightDialog: boolean = true;

    private fightButton: FightButton = null;
    private originalFightMethod: Function = null;

    onLoad() {
        // Получить компонент FightButton
        this.fightButton = this.getComponent(FightButton);
        if (!this.fightButton) {
            console.error('FightDialogExtension: FightButton component not found on the same node');
            return;
        }

        // Сохранить оригинальный метод (если нужно будет перехватить)
        // Это более сложная интеграция, для простоты создадим отдельные методы
    }    /**
     * Показать диалог перед боем
     */
    public displayPreFightDialog(onComplete: () => void) {
        if (!this.enablePreFightDialog) {
            onComplete();
            return;
        }

        const preFightDialogs: DialogData[] = [
            {
                speaker: "Сканер",
                text: "Внимание! Обнаружен вражеский корабль!",
                avatarIndex: 2 // Индекс аватара для системы корабля
            },
            {
                speaker: "Капитан", 
                text: "Все по боевым постам! Готовить к атаке!",
                avatarIndex: 0 // Индекс аватара капитана
            },
            {
                speaker: "ИИ Корабля",
                text: "Системы вооружения заряжены. Готов к бою!",
                avatarIndex: 1 // Индекс аватара ИИ
            }
        ];

        const dialogManager = DialogManager.getInstance();
        if (dialogManager) {
            dialogManager.showDialog(preFightDialogs, onComplete);
        } else {
            onComplete();
        }
    }    /**
     * Показать диалог после боя
     */
    public displayPostFightDialog(victory: boolean, onComplete?: () => void) {
        if (!this.enablePostFightDialog) {
            if (onComplete) onComplete();
            return;
        }

        let postFightDialogs: DialogData[];

        if (victory) {
            postFightDialogs = [
                {
                    speaker: "Капитан",
                    text: "Отличная работа! Враг повержен!",
                    avatarIndex: 0
                },
                {
                    speaker: "ИИ Корабля", 
                    text: "Повреждения минимальны. Собираю данные о противнике.",
                    avatarIndex: 1
                },
                {
                    speaker: "Капитан",
                    text: "Хорошо. Продолжаем наш путь.",
                    avatarIndex: 0
                }
            ];
        } else {
            postFightDialogs = [
                {
                    speaker: "ИИ Корабля",
                    text: "Внимание! Критические повреждения!",
                    avatarIndex: 1
                },
                {
                    speaker: "Капитан",
                    text: "Отступаем! Нужно время на ремонт.",
                    avatarIndex: 0
                }
            ];
        }

        const dialogManager = DialogManager.getInstance();
        if (dialogManager) {
            dialogManager.showDialog(postFightDialogs, onComplete);
        } else {
            if (onComplete) onComplete();
        }
    }

    /**
     * Получить случайный диалог обнаружения врага
     */
    public static getRandomEnemyDetectionDialog(): DialogData[] {
        const dialogVariants = [
            [
                {
                    speaker: "Радар",
                    text: "Неопознанный объект приближается!",
                    avatarIndex: 2
                },
                {
                    speaker: "Капитан",
                    text: "Анализ показывает враждебные намерения.",
                    avatarIndex: 0
                }
            ],
            [
                {
                    speaker: "Дозор",
                    text: "Контакт! Вражеский корабль на дальности!",
                    avatarIndex: 3
                },
                {
                    speaker: "Капитан",
                    text: "Приготовиться к обороне!",
                    avatarIndex: 0
                }
            ],
            [
                {
                    speaker: "ИИ Корабля",
                    text: "Обнаружена угроза. Рекомендую немедленные действия.",
                    avatarIndex: 1
                }
            ]
        ];

        const randomIndex = Math.floor(Math.random() * dialogVariants.length);
        return dialogVariants[randomIndex];
    }
}
