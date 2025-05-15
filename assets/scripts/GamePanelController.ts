import { _decorator, Component, Node, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GamePanelController')
export class GamePanelController extends Component {
    @property(Node)
    planet: Node = null;

    @property(Label)
    dilitiumText: Label = null;

    private dilitium: number = 0;
    private dilitiumPerClick: number = 1;
    
    start() {
        if (this.planet) {
            this.planet.on(Node.EventType.TOUCH_END, this.onPlanetClick, this);
        }
        this.updateDilitiumText();
    }

    onPlanetClick() {
    this.dilitium += this.dilitiumPerClick;
    this.updateDilitiumText();
}
    public upgradeMining() {
    this.dilitiumPerClick += 1;
    }   
    updateDilitiumText() {
        if (this.dilitiumText) {
            this.dilitiumText.string = this.dilitium.toString();
        }
    }
}