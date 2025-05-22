import { _decorator, Component, Node, Label } from 'cc';
import { SaveManager } from './SaveManager';
const { ccclass, property } = _decorator;

@ccclass('TopPanel')
export class TopPanel extends Component {
    @property({ type: Label })
    dilithiumLabel: Label = null;

    @property({ type: Label })
    lunarLabel: Label = null;

    private dilithium: number = 0;
    private lunar: number = 0;
    private passiveDilithiumIncome: number = 0;
    private passiveLunarIncome: number = 0;    private dilithiumPerClick: number = 1; // Base value for dilithium per click
    private autoSaveTimer: number = 0;
    private autoSaveInterval: number = 10; // Автосохранение каждые 10 секунд после изменений
    private needsAutoSave: boolean = false; // Флаг, указывающий на необходимость автосохранения

    // Геттеры для получения значений ресурсов
    getDilithium(): number {
        return this.dilithium;
    }

    getLunar(): number {
        return this.lunar;
    }    // Методы для добавления ресурсов
    addDilithium(amount: number) {
        if (amount === undefined || isNaN(amount)) {
            console.error("TopPanel: Попытка добавить неверное количество дилития:", amount);
            return;
        }
        this.dilithium += amount;
        this.updateDilithiumLabel();
        this.needsAutoSave = true; // Помечаем для автосохранения
    }

    addLunar(amount: number) {
        if (amount === undefined || isNaN(amount)) {
            console.error("TopPanel: Попытка добавить неверное количество лунаров:", amount);
            return;
        }
        this.lunar += amount;
        this.updateLunarLabel();
        this.needsAutoSave = true; // Помечаем для автосохранения
    }    // Методы для списания ресурсов
    spendDilithium(amount: number): boolean {
        if (amount === undefined || isNaN(amount)) {
            console.error("TopPanel: Попытка списать неверное количество дилития:", amount);
            return false;
        }
        if (this.dilithium >= amount) {
            this.dilithium -= amount;
            this.updateDilithiumLabel();
            this.needsAutoSave = true; // Помечаем для автосохранения
            return true;
        }
        return false;
    }

    spendLunar(amount: number): boolean {
        if (amount === undefined || isNaN(amount)) {
            console.error("TopPanel: Попытка списать неверное количество лунаров:", amount);
            return false;
        }
        if (this.lunar >= amount) {
            this.lunar -= amount;
            this.updateLunarLabel();
            this.needsAutoSave = true; // Помечаем для автосохранения
            return true;
        }
        return false;
    }

    // Методы для пассивного дохода
    addPassiveDilithiumIncome(amount: number) {
        if (amount === undefined || isNaN(amount)) {
            console.error("TopPanel: Попытка добавить неверный пассивный доход дилития:", amount);
            return;
        }
        this.passiveDilithiumIncome += amount;
    }

    addPassiveLunarIncome(amount: number) {
        if (amount === undefined || isNaN(amount)) {
            console.error("TopPanel: Попытка добавить неверный пассивный доход лунаров:", amount);
            return;
        }
        this.passiveLunarIncome += amount;
    }

    // Обновление отображения
    updateDilithiumLabel() {
        if (this.dilithiumLabel) {
            this.dilithiumLabel.string = `${Math.floor(this.dilithium)}`;
        }
    }

    updateLunarLabel() {
        if (this.lunarLabel) {
            this.lunarLabel.string = `${Math.floor(this.lunar)}`;
        }
    }

    updateAllResourceDisplays() {
        this.updateDilithiumLabel();
        this.updateLunarLabel();
    }

    // Метод для клика по планете
    performClick() {
        this.addDilithium(this.dilithiumPerClick);
    }    // Обновление каждый кадр для пассивного дохода
    update(deltaTime: number) {
        let resourcesChanged = false;
        
        if (this.passiveDilithiumIncome > 0) {
            this.addDilithium(this.passiveDilithiumIncome * deltaTime);
            resourcesChanged = true;
        }
        if (this.passiveLunarIncome > 0) {
            this.addLunar(this.passiveLunarIncome * deltaTime);
            resourcesChanged = true;
        }

        // Если изменились ресурсы от пассивного дохода, помечаем для сохранения
        if (resourcesChanged) {
            this.needsAutoSave = true;
        }

        // Логика автосохранения
        if (this.needsAutoSave) {
            this.autoSaveTimer += deltaTime;
            if (this.autoSaveTimer >= this.autoSaveInterval) {
                this.autoSave();
                this.autoSaveTimer = 0;
                this.needsAutoSave = false;
            }
        }
    }    // Add this new method
    increaseDilithiumPerClick(amount: number) {
        if (amount === undefined || isNaN(amount)) {
            console.error("TopPanel: Попытка добавить неверное значение к добыче дилития:", amount);
            return;
        }
        this.dilithiumPerClick += amount;
        this.needsAutoSave = true; // Помечаем для автосохранения
        console.log(`Добыча дилития за клик увеличена на ${amount}. Текущее значение: ${this.dilithiumPerClick}`);
    }// Метод автосохранения
    autoSave() {
        // Реализуем логику автосохранения
        console.log("Автосохранение данных...");
        SaveManager.saveProgress();
    }    onLoad() {
        // Загружаем сохраненные данные, если они есть
        if (SaveManager.hasSavedGame()) {
            const progress = SaveManager.loadProgress();
            this.dilithium = progress.minerals || 0;
            this.lunar = progress.credits || 0;
            console.log('Ресурсы загружены из сохранения:', this.dilithium, 'дилития,', this.lunar, 'лунаров');
        }
        
        this.updateAllResourceDisplays();
    }
}