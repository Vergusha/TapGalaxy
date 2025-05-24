import { _decorator, Component, Node } from 'cc';
import { DialogManager } from './DialogManager';
import { DialogUtils, DialogCharacters, DialogFactory } from './DialogUtils';
import { DialogData } from './DialogSystem';
const { ccclass, property } = _decorator;

/**
 * Центральный менеджер для интеграции диалогов с различными системами игры
 * Обеспечивает единообразное взаимодействие между диалогами и игровыми системами
 */
@ccclass('DialogIntegrationManager')
export class DialogIntegrationManager extends Component {
    private static instance: DialogIntegrationManager = null;
    private dialogQueue: (() => void)[] = [];
    private isProcessingQueue: boolean = false;

    onLoad() {
        if (DialogIntegrationManager.instance === null) {
            DialogIntegrationManager.instance = this;
        } else {
            this.destroy();
            return;
        }
    }

    public static getInstance(): DialogIntegrationManager {
        return DialogIntegrationManager.instance;
    }

    /**
     * Добавить диалог в очередь для показа
     */
    public queueDialog(dialogFunction: () => void) {
        this.dialogQueue.push(dialogFunction);
        this.processQueue();
    }

    /**
     * Обработать очередь диалогов
     */
    private processQueue() {
        if (this.isProcessingQueue || this.dialogQueue.length === 0) {
            return;
        }

        const dialogManager = DialogManager.getInstance();
        if (dialogManager && dialogManager.isDialogActive()) {
            return; // Подождать, пока текущий диалог не завершится
        }

        this.isProcessingQueue = true;
        const nextDialog = this.dialogQueue.shift();
        if (nextDialog) {
            nextDialog();
        }
        this.isProcessingQueue = false;
        
        // Попробовать обработать следующий диалог после небольшой задержки
        this.scheduleOnce(() => {
            this.processQueue();
        }, 0.1);
    }

    /**
     * Интеграция с системой майнинга
     */
    public showMiningDialog(resourceType: string, amount: number, onComplete?: () => void) {
        this.queueDialog(() => {
            const dialogs = this.createMiningDialog(resourceType, amount);
            DialogManager.getInstance()?.showDialog(dialogs, () => {
                this.isProcessingQueue = false;
                onComplete?.();
                this.processQueue();
            });
        });
    }

    /**
     * Интеграция с системой боя
     */
    public showFightDialog(enemyType: string, onComplete?: () => void) {
        this.queueDialog(() => {
            const dialogs = this.createFightDialog(enemyType);
            DialogManager.getInstance()?.showDialog(dialogs, () => {
                this.isProcessingQueue = false;
                onComplete?.();
                this.processQueue();
            });
        });
    }

    /**
     * Интеграция с системой улучшений корабля
     */
    public showShipUpgradeDialog(upgradeName: string, cost: number, onComplete?: () => void) {
        this.queueDialog(() => {
            const dialogs = this.createShipUpgradeDialog(upgradeName, cost);
            DialogManager.getInstance()?.showDialog(dialogs, () => {
                this.isProcessingQueue = false;
                onComplete?.();
                this.processQueue();
            });
        });
    }

    /**
     * Интеграция с системой торговли
     */
    public showTradeDialog(itemName: string, quantity: number, price: number, onComplete?: () => void) {
        this.queueDialog(() => {
            const dialogs = this.createTradeDialog(itemName, quantity, price);
            DialogManager.getInstance()?.showDialog(dialogs, () => {
                this.isProcessingQueue = false;
                onComplete?.();
                this.processQueue();
            });
        });
    }

    /**
     * Показать диалог достижения с интеграцией
     */
    public showAchievementDialog(achievementName: string, reward: string, onComplete?: () => void) {
        this.queueDialog(() => {
            const dialogs = this.createAchievementDialog(achievementName, reward);
            DialogManager.getInstance()?.showDialog(dialogs, () => {
                this.isProcessingQueue = false;
                onComplete?.();
                this.processQueue();
            });
        });
    }

    /**
     * Создать диалог для майнинга
     */
    private createMiningDialog(resourceType: string, amount: number): DialogData[] {
        return [
            {
                speaker: "Сканер",
                text: `Обнаружены залежи ${resourceType}!`,
                avatarIndex: DialogCharacters.SCANNER
            },
            {
                speaker: "ИИ Корабля",
                text: `Запускаю процедуру добычи. Ожидаемое количество: ${amount}`,
                avatarIndex: DialogCharacters.AI_SHIP
            },
            {
                speaker: "Система",
                text: `Добыча завершена! Получено: ${amount} ${resourceType}`,
                avatarIndex: DialogCharacters.SYSTEM
            }
        ];
    }

    /**
     * Создать диалог для боя
     */
    private createFightDialog(enemyType: string): DialogData[] {
        return [
            {
                speaker: "Сканер",
                text: `Внимание! На радаре ${enemyType}!`,
                avatarIndex: DialogCharacters.SCANNER
            },
            {
                speaker: "Капитан",
                text: "Приготовиться к бою! Зарядить все орудия!",
                avatarIndex: DialogCharacters.CAPTAIN
            },
            {
                speaker: "ИИ Корабля",
                text: "Все системы готовы к бою, капитан!",
                avatarIndex: DialogCharacters.AI_SHIP
            }
        ];
    }

    /**
     * Создать диалог для улучшения корабля
     */
    private createShipUpgradeDialog(upgradeName: string, cost: number): DialogData[] {
        return [
            {
                speaker: "Инженер",
                text: `Капитан, готово улучшение: ${upgradeName}`,
                avatarIndex: DialogCharacters.AI_SHIP
            },
            {
                speaker: "Система",
                text: `Стоимость улучшения: ${cost} единиц ресурсов`,
                avatarIndex: DialogCharacters.SYSTEM
            },
            {
                speaker: "Капитан", 
                text: "Отличная работа! Наш корабль становится сильнее.",
                avatarIndex: DialogCharacters.CAPTAIN
            }
        ];
    }

    /**
     * Создать диалог для торговли
     */
    private createTradeDialog(itemName: string, quantity: number, price: number): DialogData[] {
        return [
            {
                speaker: "Торговец",
                text: `Имею отличное предложение: ${quantity} ${itemName} за ${price} кредитов`,
                avatarIndex: DialogCharacters.TRADER
            },
            {
                speaker: "Капитан",
                text: "Интересное предложение. Посмотрим, что у вас есть.",
                avatarIndex: DialogCharacters.CAPTAIN
            }
        ];
    }

    /**
     * Создать диалог для достижения
     */
    private createAchievementDialog(achievementName: string, reward: string): DialogData[] {
        return [
            {
                speaker: "Система",
                text: `🏆 Достижение разблокировано: ${achievementName}`,
                avatarIndex: DialogCharacters.SYSTEM
            },
            {
                speaker: "ИИ Корабля",
                text: `Поздравляю, капитан! Получена награда: ${reward}`,
                avatarIndex: DialogCharacters.AI_SHIP
            }
        ];
    }

    /**
     * Очистить очередь диалогов
     */
    public clearQueue() {
        this.dialogQueue = [];
        this.isProcessingQueue = false;
    }

    /**
     * Получить количество диалогов в очереди
     */
    public getQueueLength(): number {
        return this.dialogQueue.length;
    }

    onDestroy() {
        if (DialogIntegrationManager.instance === this) {
            DialogIntegrationManager.instance = null;
        }
        this.clearQueue();
    }
}