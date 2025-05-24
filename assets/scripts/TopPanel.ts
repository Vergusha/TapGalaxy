import { _decorator, Component, Node, Label } from 'cc';
import { SaveManager } from './SaveManager';
const { ccclass, property } = _decorator;

@ccclass('TopPanel')
export class TopPanel extends Component {
    @property({ type: Label })
    dilithiumLabel: Label = null;

    @property({ type: Label })
    lunarLabel: Label = null;

    @property({ type: Label })
    xenoBitLabel: Label = null;
    @property({ type: Label })
    quarkLabel: Label = null;

    private dilithium: number = 0;
    private lunar: number = 0;
    private passiveDilithiumIncome: number = 0;
    private passiveLunarIncome: number = 0;    private dilithiumPerClick: number = 1; // Base value for dilithium per click
    private autoSaveTimer: number = 0;
    private autoSaveInterval: number = 10; // Автосохранение каждые 10 секунд после изменений
    private needsAutoSave: boolean = false; // Флаг, указывающий на необходимость автосохранения

    private xenoBit: number = 0;
    private quark: number = 0;

    // Геттеры для получения значений ресурсов
    getDilithium(): number {
        return this.dilithium;
    }

    getLunar(): number {
        return this.lunar;
    }
    // Геттеры для получения значений пассивного дохода
    getPassiveDilithiumIncome(): number {
        return this.passiveDilithiumIncome;
    }

    getPassiveLunarIncome(): number {
        return this.passiveLunarIncome;
    }
    // Геттеры для новых валют
    getXenoBit(): number {
        return this.xenoBit;
    }
    getQuark(): number {
        return this.quark;
    }
    // Сеттеры для новых валют
    setXenoBit(amount: number) {
        if (amount === undefined || isNaN(amount)) {
            console.error("TopPanel: Попытка установить неверное количество XenoBit:", amount);
            return;
        }
        this.xenoBit = amount;
        this.updateXenoBitLabel();
        console.log('Установлено значение XenoBit:', amount);
    }
    setQuark(amount: number) {
        if (amount === undefined || isNaN(amount)) {
            console.error("TopPanel: Попытка установить неверное количество Quark:", amount);
            return;
        }
        this.quark = amount;
        this.updateQuarkLabel();
        console.log('Установлено значение Quark:', amount);
    }
    // Методы для добавления ресурсов
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
    }
    addXenoBit(amount: number) {
        if (amount === undefined || isNaN(amount)) {
            console.error("TopPanel: Попытка добавить неверное количество XenoBit:", amount);
            return;
        }
        this.xenoBit += amount;
        this.updateXenoBitLabel();
        this.needsAutoSave = true;
    }
    addQuark(amount: number) {
        if (amount === undefined || isNaN(amount)) {
            console.error("TopPanel: Попытка добавить неверное количество Quark:", amount);
            return;
        }
        this.quark += amount;
        this.updateQuarkLabel();
        this.needsAutoSave = true;
    }
    // Методы для списания ресурсов
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
    spendXenoBit(amount: number): boolean {
        if (amount === undefined || isNaN(amount)) {
            console.error("TopPanel: Попытка списать неверное количество XenoBit:", amount);
            return false;
        }
        if (this.xenoBit >= amount) {
            this.xenoBit -= amount;
            this.updateXenoBitLabel();
            this.needsAutoSave = true;
            return true;
        }
        return false;
    }
    spendQuark(amount: number): boolean {
        if (amount === undefined || isNaN(amount)) {
            console.error("TopPanel: Попытка списать неверное количество Quark:", amount);
            return false;
        }
        if (this.quark >= amount) {
            this.quark -= amount;
            this.updateQuarkLabel();
            this.needsAutoSave = true;
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
    updateXenoBitLabel() {
        if (this.xenoBitLabel) {
            this.xenoBitLabel.string = `${Math.floor(this.xenoBit)}`;
        }
    }
    updateQuarkLabel() {
        if (this.quarkLabel) {
            this.quarkLabel.string = `${Math.floor(this.quark)}`;
        }
    }

    updateAllResourceDisplays() {
        this.updateDilithiumLabel();
        this.updateLunarLabel();
        this.updateXenoBitLabel();
        this.updateQuarkLabel();
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
        // НЕ загружаем сохраненные данные из SaveManager здесь,
        // так как это делается в OpenGamePanel через setDilithium и setLunar
        this.updateAllResourceDisplays();
    }

    // Сеттеры для установки значений ресурсов напрямую
    setDilithium(amount: number) {
        if (amount === undefined || isNaN(amount)) {
            console.error("TopPanel: Попытка установить неверное количество дилития:", amount);
            return;
        }
        this.dilithium = amount;
        this.updateDilithiumLabel();
        console.log('Установлено значение дилития:', amount);
    }

    setLunar(amount: number) {
        if (amount === undefined || isNaN(amount)) {
            console.error("TopPanel: Попытка установить неверное количество лунаров:", amount);
            return;
        }
        this.lunar = amount;
        this.updateLunarLabel();
        console.log('Установлено значение лунаров:', amount);
    }

    setPassiveDilithiumIncome(amount: number) {
        if (amount === undefined || isNaN(amount)) {
            console.error("TopPanel: Попытка установить неверное значение пассивного дохода дилития:", amount);
            return;
        }
        this.passiveDilithiumIncome = amount;
        console.log('Установлено значение пассивного дохода дилития:', amount);
    }

    setPassiveLunarIncome(amount: number) {
        if (amount === undefined || isNaN(amount)) {
            console.error("TopPanel: Попытка установить неверное значение пассивного дохода лунаров:", amount);
            return;
        }
        this.passiveLunarIncome = amount;
        console.log('Установлено значение пассивного дохода лунаров:', amount);
    }

    // Обновление отображения
}