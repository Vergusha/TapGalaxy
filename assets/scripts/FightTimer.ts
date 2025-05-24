import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FightTimer')
export class FightTimer extends Component {
    @property({ type: Label })
    timerLabel: Label = null;

    private totalTime: number = 300; // 5 minutes in seconds
    private timeLeft: number = 300;
    private isReady: boolean = false;

    onLoad() {
        if (!this.timerLabel) {
            this.timerLabel = this.getComponent(Label);
        }
        this.resetTimer();
    }

    update(dt: number) {
        if (this.isReady) return;
        this.timeLeft -= dt;
        if (this.timeLeft <= 0) {
            this.timeLeft = 0;
            this.isReady = true;
            this.updateLabel();
            // Важно: обновить label сразу, чтобы canFight() вернул true в этом же кадре
            return;
        }
        this.updateLabel();
    }

    private updateLabel() {
        if (this.isReady) {
            this.timerLabel.string = 'Ready';
        } else {
            const minutes = Math.floor(this.timeLeft / 60);
            const seconds = Math.floor(this.timeLeft % 60);
            // Без padStart для совместимости
            this.timerLabel.string = `${minutes}:${(seconds < 10 ? '0' : '') + seconds}`;
        }
    }

    // Исправление: если время 0, всегда показывать Ready и canFight()=true
    public canFight(): boolean {
        return this.isReady || this.timeLeft <= 0;
    }

    public resetTimer() {
        this.timeLeft = this.totalTime;
        this.isReady = false;
        this.updateLabel();
    }

    public skipTimer() {
        this.isReady = true;
        this.timeLeft = 0;
        this.updateLabel();
    }
}
