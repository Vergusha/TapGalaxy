import { _decorator, Component, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TopPanel')
export class TopPanel extends Component {
    @property({ type: Label })
    dilithiumLabel: Label = null;

    private _dilithium: number = 0;

    public addDilithium(amount: number) {
        this._dilithium += amount;
        this.updateLabel();
    }

    private updateLabel() {
        if (this.dilithiumLabel) {
            this.dilithiumLabel.string = this._dilithium.toString();
        }
    }
}