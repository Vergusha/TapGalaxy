import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FightScene')
export class FightScene extends Component {
    @property(Node)
    heroShip: Node = null;

    @property(Node)
    enemyShip: Node = null;

    @property(Node)
    heroHUD: Node = null;

    @property(Node)
    enemyHUD: Node = null;

    start() {
        this.initializePositions();
    }

    private initializePositions() {
        // Set initial positions for ships and HUDs
        // Example positions (adjust according to your needs):
        if (this.heroShip) {
            this.heroShip.setPosition(-200, 0, 0);
        }
        if (this.enemyShip) {
            this.enemyShip.setPosition(200, 0, 0);
        }
        if (this.heroHUD) {
            this.heroHUD.setPosition(-300, 200, 0);
        }
        if (this.enemyHUD) {
            this.enemyHUD.setPosition(300, 200, 0);
        }
    }
}