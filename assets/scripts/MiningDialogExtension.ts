import { _decorator, Component, Node } from 'cc';
import { DialogManager } from './DialogManager';
import { DialogIntegrationManager } from './DialogIntegrationManager';
import { DialogUtils, DialogCharacters } from './DialogUtils';
import { DialogData } from './DialogSystem';
const { ccclass, property } = _decorator;

/**
 * Расширение диалогов для системы майнинга
 * Предоставляет специализированные диалоги для добычи ресурсов
 */
@ccclass('MiningDialogExtension')
export class MiningDialogExtension extends Component {
    @property
    public showMiningStartDialog: boolean = true;

    @property
    public showMiningCompleteDialog: boolean = true;

    @property
    public showResourceDiscoveryDialog: boolean = true;

    private _miningInProgress: boolean = false;
    private _currentResourceType: string = "";
    private _expectedAmount: number = 0;

    private static _instance: MiningDialogExtension = null;

    public static getInstance(): MiningDialogExtension {
        return this._instance;
    }

    public get miningInProgress(): boolean { return this._miningInProgress; }
    public get currentResourceType(): string { return this._currentResourceType; }
    public get expectedAmount(): number { return this._expectedAmount; }

    onLoad() {
        if (MiningDialogExtension._instance === null) {
            MiningDialogExtension._instance = this;
        } else {
            this.destroy();
            return;
        }
    }

    /**
     * Запустить процесс майнинга с диалогами
     */
    public startMiningWithDialog(resourceType: string, expectedAmount: number, onMiningComplete?: (actualAmount: number) => void) {
        if (this._miningInProgress) {
            this.showMiningBusyDialog();
            return;
        }

        this._currentResourceType = resourceType;
        this._expectedAmount = expectedAmount;
        this._miningInProgress = true;

        if (this.showResourceDiscoveryDialog) {
            this.showResourceDiscovery(resourceType, () => {
                if (this.showMiningStartDialog) {
                    this.showMiningStart(resourceType, expectedAmount, () => {
                        this.performMining(onMiningComplete);
                    });
                } else {
                    this.performMining(onMiningComplete);
                }
            });
        } else if (this.showMiningStartDialog) {
            this.showMiningStart(resourceType, expectedAmount, () => {
                this.performMining(onMiningComplete);
            });
        } else {
            this.performMining(onMiningComplete);
        }
    }

    /**
     * Показать диалог обнаружения ресурсов
     */
    private showResourceDiscovery(resourceType: string, onComplete?: () => void) {
        const dialogs: DialogData[] = [
            {
                speaker: "Сканер",
                text: `Сканирую поверхность планеты...`,
                avatarIndex: DialogCharacters.SCANNER
            },
            {
                speaker: "Сканер",
                text: `Обнаружены богатые залежи: ${resourceType}!`,
                avatarIndex: DialogCharacters.SCANNER
            },
            {
                speaker: "Капитан",
                text: "Отличные новости! Начинаем операцию по добыче.",
                avatarIndex: DialogCharacters.CAPTAIN
            }
        ];

        DialogManager.getInstance()?.showDialog(dialogs, onComplete);
    }

    /**
     * Показать диалог начала майнинга
     */
    private showMiningStart(resourceType: string, expectedAmount: number, onComplete?: () => void) {
        const dialogs: DialogData[] = [
            {
                speaker: "ИИ Корабля",
                text: `Инициализация майнинг-лазеров для добычи ${resourceType}`,
                avatarIndex: DialogCharacters.AI_SHIP
            },
            {
                speaker: "ИИ Корабля",
                text: `Ожидаемое количество добычи: ${expectedAmount} единиц`,
                avatarIndex: DialogCharacters.AI_SHIP
            },
            {
                speaker: "Система",
                text: "Майнинг начат. Процесс автоматизирован.",
                avatarIndex: DialogCharacters.SYSTEM
            }
        ];

        DialogManager.getInstance()?.showDialog(dialogs, onComplete);
    }

    /**
     * Выполнить процесс майнинга (симуляция)
     */
    private performMining(onMiningComplete?: (actualAmount: number) => void) {
        // Симуляция процесса майнинга
        this.scheduleOnce(() => {
            const actualAmount = this.calculateMiningResult();
            this._miningInProgress = false;

            if (this.showMiningCompleteDialog) {
                this.showMiningComplete(this._currentResourceType, actualAmount, () => {
                    onMiningComplete?.(actualAmount);
                });
            } else {
                onMiningComplete?.(actualAmount);
            }
        }, 2.0); // 2 секунды симуляции майнинга
    }

    /**
     * Показать диалог завершения майнинга
     */
    private showMiningComplete(resourceType: string, actualAmount: number, onComplete?: () => void) {
        const efficiency = Math.round((actualAmount / this._expectedAmount) * 100);
        
        let efficiencyComment = "";
        if (efficiency >= 120) {
            efficiencyComment = "Превосходный результат! Найдены дополнительные залежи!";
        } else if (efficiency >= 100) {
            efficiencyComment = "Отличная работа! Добыча прошла по плану.";
        } else if (efficiency >= 80) {
            efficiencyComment = "Хороший результат, несмотря на некоторые трудности.";
        } else {
            efficiencyComment = "Добыча завершена, но эффективность ниже ожидаемой.";
        }

        const dialogs: DialogData[] = [
            {
                speaker: "Система",
                text: `Майнинг завершен! Добыто: ${actualAmount} ${resourceType}`,
                avatarIndex: DialogCharacters.SYSTEM
            },
            {
                speaker: "ИИ Корабля",
                text: `Эффективность операции: ${efficiency}%`,
                avatarIndex: DialogCharacters.AI_SHIP
            },
            {
                speaker: "Капитан",
                text: efficiencyComment,
                avatarIndex: DialogCharacters.CAPTAIN
            }
        ];

        DialogManager.getInstance()?.showDialog(dialogs, onComplete);
    }

    /**
     * Показать диалог о том, что майнинг уже идет
     */
    private showMiningBusyDialog() {
        const dialogs: DialogData[] = [
            {
                speaker: "ИИ Корабля",
                text: "Майнинг-операция уже выполняется. Подождите завершения.",
                avatarIndex: DialogCharacters.AI_SHIP
            }
        ];

        DialogManager.getInstance()?.showDialog(dialogs);
    }

    /**
     * Рассчитать результат майнинга (случайная вариация)
     */
    private calculateMiningResult(): number {
        // Случайная эффективность от 70% до 130%
        const efficiency = 0.7 + Math.random() * 0.6;
        return Math.floor(this._expectedAmount * efficiency);
    }

    /**
     * Показать диалог исчерпания ресурсов
     */
    public showResourceDepletedDialog(resourceType: string, onComplete?: () => void) {
        const dialogs: DialogData[] = [
            {
                speaker: "Сканер",
                text: `Внимание! Залежи ${resourceType} истощены.`,
                avatarIndex: DialogCharacters.SCANNER
            },
            {
                speaker: "ИИ Корабля",
                text: "Рекомендую найти новое месторождение для продолжения добычи.",
                avatarIndex: DialogCharacters.AI_SHIP
            },
            {
                speaker: "Капитан",
                text: "Понял. Перемещаемся к следующей локации.",
                avatarIndex: DialogCharacters.CAPTAIN
            }
        ];

        DialogManager.getInstance()?.showDialog(dialogs, onComplete);
    }

    /**
     * Показать диалог об улучшении майнинг-оборудования
     */
    public showMiningUpgradeDialog(upgradeName: string, efficiencyBonus: number, onComplete?: () => void) {
        const dialogs: DialogData[] = [
            {
                speaker: "Инженер",
                text: `Установлено улучшение: ${upgradeName}`,
                avatarIndex: DialogCharacters.AI_SHIP
            },
            {
                speaker: "Инженер",
                text: `Эффективность майнинга увеличена на ${efficiencyBonus}%`,
                avatarIndex: DialogCharacters.AI_SHIP
            },
            {
                speaker: "Капитан",
                text: "Превосходно! Теперь мы сможем добывать больше ресурсов.",
                avatarIndex: DialogCharacters.CAPTAIN
            }
        ];

        DialogManager.getInstance()?.showDialog(dialogs, onComplete);
    }

    /**
     * Показать диалог об опасности при майнинге
     */
    public showMiningHazardDialog(hazardType: string, onComplete?: () => void) {
        const dialogs: DialogData[] = [
            {
                speaker: "Система",
                text: `⚠️ Обнаружена опасность: ${hazardType}`,
                avatarIndex: DialogCharacters.WARNING
            },
            {
                speaker: "ИИ Корабля",
                text: "Активирую защитные протоколы. Майнинг временно приостановлен.",
                avatarIndex: DialogCharacters.AI_SHIP
            },
            {
                speaker: "Капитан",
                text: "Безопасность экипажа - приоритет. Ждем устранения угрозы.",
                avatarIndex: DialogCharacters.CAPTAIN
            }
        ];

        DialogManager.getInstance()?.showDialog(dialogs, onComplete);
    }

    /**
     * Проверить, идет ли майнинг
     */
    public isMiningInProgress(): boolean {
        return this._miningInProgress;
    }

    /**
     * Экстренно остановить майнинг
     */
    public emergencyStopMining() {
        if (this._miningInProgress) {
            this.unscheduleAllCallbacks();
            this._miningInProgress = false;
            
            const dialogs: DialogData[] = [
                {
                    speaker: "Система",
                    text: "Майнинг-операция экстренно остановлена.",
                    avatarIndex: DialogCharacters.SYSTEM
                }
            ];

            DialogManager.getInstance()?.showDialog(dialogs);
        }
    }
}