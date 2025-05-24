import { _decorator, Component, Node } from 'cc';
import { DialogManager } from './DialogManager';
import { DialogIntegrationManager } from './DialogIntegrationManager';
import { DialogUtils, DialogCharacters } from './DialogUtils';
import { DialogData } from './DialogSystem';
const { ccclass, property } = _decorator;

/**
 * Расширение диалогов для системы космического корабля
 * Обеспечивает диалоги для улучшений, ремонта и управления кораблем
 */
@ccclass('SpaceshipDialogExtension')
export class SpaceshipDialogExtension extends Component {

    @property({ type: Boolean, displayName: "Show Upgrade Dialogs" })
    showUpgradeDialogs: boolean = true;

    @property({ type: Boolean, displayName: "Show Repair Dialogs" })
    showRepairDialogs: boolean = true;

    @property({ type: Boolean, displayName: "Show System Status Dialogs" })
    showSystemStatusDialogs: boolean = true;

    /**
     * Показать диалог улучшения корабля
     */
    public showShipUpgradeDialog(componentName: string, level: number, cost: number, onConfirm?: () => void, onCancel?: () => void) {
        if (!this.showUpgradeDialogs) {
            onConfirm?.();
            return;
        }

        const dialogs: DialogData[] = [
            {
                speaker: "Инженер",
                text: `Доступно улучшение: ${componentName} до уровня ${level}`,
                avatarIndex: DialogCharacters.AI_SHIP
            },
            {
                speaker: "Инженер",
                text: `Стоимость: ${cost} единиц ресурсов`,
                avatarIndex: DialogCharacters.AI_SHIP
            },
            {
                speaker: "Капитан",
                text: "Произвести улучшение? Это повысит эффективность корабля.",
                avatarIndex: DialogCharacters.CAPTAIN
            }
        ];

        DialogManager.getInstance()?.showDialog(dialogs, onConfirm);
    }

    /**
     * Показать диалог успешного улучшения
     */
    public showUpgradeSuccessDialog(componentName: string, level: number, bonus: string, onComplete?: () => void) {
        const dialogs: DialogData[] = [
            {
                speaker: "Система",
                text: `✅ Улучшение завершено: ${componentName} (Уровень ${level})`,
                avatarIndex: DialogCharacters.SYSTEM
            },
            {
                speaker: "Инженер",
                text: `Бонус: ${bonus}`,
                avatarIndex: DialogCharacters.AI_SHIP
            },
            {
                speaker: "Капитан",
                text: "Отличная работа! Корабль становится все мощнее.",
                avatarIndex: DialogCharacters.CAPTAIN
            }
        ];

        DialogManager.getInstance()?.showDialog(dialogs, onComplete);
    }

    /**
     * Показать диалог ремонта корабля
     */
    public showRepairDialog(damage: number, repairCost: number, onConfirm?: () => void) {
        if (!this.showRepairDialogs) {
            onConfirm?.();
            return;
        }

        let damageLevel = "";
        if (damage > 80) {
            damageLevel = "критические повреждения";
        } else if (damage > 50) {
            damageLevel = "серьезные повреждения";
        } else if (damage > 20) {
            damageLevel = "незначительные повреждения";
        } else {
            damageLevel = "минимальные повреждения";
        }

        const dialogs: DialogData[] = [
            {
                speaker: "Инженер",
                text: `Диагностика показывает: ${damageLevel} (${damage}%)`,
                avatarIndex: DialogCharacters.AI_SHIP
            },
            {
                speaker: "Инженер",
                text: `Стоимость ремонта: ${repairCost} единиц ресурсов`,
                avatarIndex: DialogCharacters.AI_SHIP
            },
            {
                speaker: "Капитан",
                text: "Начать ремонт? Поврежденные системы снижают эффективность.",
                avatarIndex: DialogCharacters.CAPTAIN
            }
        ];

        DialogManager.getInstance()?.showDialog(dialogs, onConfirm);
    }

    /**
     * Показать диалог завершения ремонта
     */
    public showRepairCompleteDialog(onComplete?: () => void) {
        const dialogs: DialogData[] = [
            {
                speaker: "Инженер",
                text: "Ремонт завершен! Все системы корабля в норме.",
                avatarIndex: DialogCharacters.AI_SHIP
            },
            {
                speaker: "Система",
                text: "Диагностика: состояние корабля 100%",
                avatarIndex: DialogCharacters.SYSTEM
            },
            {
                speaker: "Капитан",
                text: "Превосходно! Теперь мы готовы к новым приключениям.",
                avatarIndex: DialogCharacters.CAPTAIN
            }
        ];

        DialogManager.getInstance()?.showDialog(dialogs, onComplete);
    }

    /**
     * Показать диалог статуса систем корабля
     */
    public showSystemStatusDialog(systems: {name: string, status: number}[], onComplete?: () => void) {
        if (!this.showSystemStatusDialogs) {
            onComplete?.();
            return;
        }

        const dialogs: DialogData[] = [
            {
                speaker: "ИИ Корабля",
                text: "Отчет о состоянии систем корабля:",
                avatarIndex: DialogCharacters.AI_SHIP
            }
        ];

        // Добавить информацию о каждой системе
        systems.forEach(system => {
            let statusText = "";
            if (system.status >= 90) {
                statusText = "отличное";
            } else if (system.status >= 70) {
                statusText = "хорошее";
            } else if (system.status >= 50) {
                statusText = "удовлетворительное";
            } else {
                statusText = "требует внимания";
            }

            dialogs.push({
                speaker: "ИИ Корабля",
                text: `${system.name}: ${system.status}% (${statusText})`,
                avatarIndex: DialogCharacters.AI_SHIP
            });
        });

        DialogManager.getInstance()?.showDialog(dialogs, onComplete);
    }

    /**
     * Показать диалог критической неисправности
     */
    public showCriticalFailureDialog(systemName: string, onComplete?: () => void) {
        const dialogs: DialogData[] = [
            {
                speaker: "Система",
                text: `🚨 КРИТИЧЕСКАЯ ОШИБКА: ${systemName}`,
                avatarIndex: DialogCharacters.WARNING
            },
            {
                speaker: "ИИ Корабля",
                text: "Активированы аварийные протоколы. Требуется немедленный ремонт!",
                avatarIndex: DialogCharacters.AI_SHIP
            },
            {
                speaker: "Капитан",
                text: "Всем в аварийные позиции! Немедленно приступить к ремонту!",
                avatarIndex: DialogCharacters.CAPTAIN
            }
        ];

        DialogManager.getInstance()?.showDialog(dialogs, onComplete);
    }

    /**
     * Показать диалог недостатка энергии
     */
    public showLowPowerDialog(currentPower: number, requiredPower: number, onComplete?: () => void) {
        const dialogs: DialogData[] = [
            {
                speaker: "ИИ Корабля",
                text: `Внимание! Низкий уровень энергии: ${currentPower}/${requiredPower}`,
                avatarIndex: DialogCharacters.AI_SHIP
            },
            {
                speaker: "Инженер",
                text: "Рекомендую улучшить генераторы или отключить неважные системы.",
                avatarIndex: DialogCharacters.AI_SHIP
            },
            {
                speaker: "Капитан",
                text: "Приоритет - жизнеобеспечение и двигатели. Все остальное вторично.",
                avatarIndex: DialogCharacters.CAPTAIN
            }
        ];

        DialogManager.getInstance()?.showDialog(dialogs, onComplete);
    }

    /**
     * Показать диалог установки нового оборудования
     */
    public showNewEquipmentDialog(equipmentName: string, stats: string, onComplete?: () => void) {
        const dialogs: DialogData[] = [
            {
                speaker: "Инженер",
                text: `Новое оборудование установлено: ${equipmentName}`,
                avatarIndex: DialogCharacters.AI_SHIP
            },
            {
                speaker: "Система",
                text: `Характеристики: ${stats}`,
                avatarIndex: DialogCharacters.SYSTEM
            },
            {
                speaker: "Капитан",
                text: "Проведите тестирование новых систем. Убедитесь, что все работает правильно.",
                avatarIndex: DialogCharacters.CAPTAIN
            }
        ];

        DialogManager.getInstance()?.showDialog(dialogs, onComplete);
    }

    /**
     * Показать диалог перегрузки корабля
     */
    public showOverloadDialog(currentLoad: number, maxLoad: number, onComplete?: () => void) {
        const overloadPercent = Math.round((currentLoad / maxLoad) * 100);

        const dialogs: DialogData[] = [
            {
                speaker: "ИИ Корабля",
                text: `Предупреждение! Перегрузка корабля: ${overloadPercent}%`,
                avatarIndex: DialogCharacters.WARNING
            },
            {
                speaker: "Инженер",
                text: `Текущая загрузка: ${currentLoad}/${maxLoad}. Это влияет на маневренность.`,
                avatarIndex: DialogCharacters.AI_SHIP
            },
            {
                speaker: "Капитан",
                text: "Нужно либо разгрузиться, либо улучшить грузовой отсек.",
                avatarIndex: DialogCharacters.CAPTAIN
            }
        ];

        DialogManager.getInstance()?.showDialog(dialogs, onComplete);
    }

    /**
     * Показать диалог готовности к прыжку
     */
    public showHyperjumpReadyDialog(destination: string, fuelCost: number, onConfirm?: () => void) {
        const dialogs: DialogData[] = [
            {
                speaker: "Навигатор",
                text: `Координаты проложены. Пункт назначения: ${destination}`,
                avatarIndex: DialogCharacters.AI_SHIP
            },
            {
                speaker: "ИИ Корабля",
                text: `Расход топлива: ${fuelCost} единиц. Гипердвигатель готов.`,
                avatarIndex: DialogCharacters.AI_SHIP
            },
            {
                speaker: "Капитан",
                text: "Прыжок разрешен. Все приготовиться к гиперпространственному переходу!",
                avatarIndex: DialogCharacters.CAPTAIN
            }
        ];

        DialogManager.getInstance()?.showDialog(dialogs, onConfirm);
    }

    /**
     * Показать диалог автопилота
     */
    public showAutopilotDialog(isEnabled: boolean, destination?: string, onComplete?: () => void) {
        let dialogs: DialogData[];

        if (isEnabled) {
            dialogs = [
                {
                    speaker: "ИИ Корабля",
                    text: `Автопилот активирован. Курс: ${destination || "неизвестно"}`,
                    avatarIndex: DialogCharacters.AI_SHIP
                },
                {
                    speaker: "Система",
                    text: "Все системы на автоматическом управлении. Экипаж может отдохнуть.",
                    avatarIndex: DialogCharacters.SYSTEM
                }
            ];
        } else {
            dialogs = [
                {
                    speaker: "ИИ Корабля",
                    text: "Автопилот отключен. Переход на ручное управление.",
                    avatarIndex: DialogCharacters.AI_SHIP
                },
                {
                    speaker: "Капитан",
                    text: "Понял. Беру управление на себя.",
                    avatarIndex: DialogCharacters.CAPTAIN
                }
            ];
        }

        DialogManager.getInstance()?.showDialog(dialogs, onComplete);
    }
}