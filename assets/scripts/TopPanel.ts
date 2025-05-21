import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TopPanel')
export class TopPanel extends Component {
    @property({ type: Label })
    public dilithiumLabel: Label | null = null;

    private dilithium: number = 0;
    private clickPower: number = 1; // Начальная сила клика
    private passiveIncomeRate: number = 0; // Начальный пассивный доход в секунду

    onLoad() {
        this.updateDilithiumLabel();
        // Запускаем пассивный доход
        this.schedule(this.applyPassiveIncome, 1); // Каждую секунду
    }

    updateDilithiumLabel() {
        if (this.dilithiumLabel) {
            this.dilithiumLabel.string = ` ${Math.floor(this.dilithium)}`;
        }
    }

    addDilithium(amount: number) {
        this.dilithium += amount;
        this.updateDilithiumLabel();
    }

    getDilithium(): number {
        return this.dilithium;
    }

    // --- Новые методы для улучшений ---
    public increaseClickPower(amount: number) {
        this.clickPower += amount;
        console.log(`New Click Power: ${this.clickPower}`);
        // Здесь можно обновить UI, если есть отображение силы клика
    }

    public addPassiveIncomeRate(rate: number) {
        this.passiveIncomeRate += rate;
        console.log(`New Passive Income Rate: ${this.passiveIncomeRate}/sec`);
        // Здесь можно обновить UI, если есть отображение пассивного дохода
    }

    private applyPassiveIncome() {
        if (this.passiveIncomeRate > 0) {
            this.addDilithium(this.passiveIncomeRate);
        }
    }

    // Метод, который будет вызываться при клике на что-либо для добычи
    public performClick() {
        this.addDilithium(this.clickPower);
        console.log(`Clicked! Added ${this.clickPower} dilithium.`);
    }
}