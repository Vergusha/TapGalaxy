import { _decorator, Component, Label, Vec3, tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FloatingText')
export class FloatingText extends Component {
    start() {
        // Анимация всплытия и удаления
        tween(this.node)
            .by(0.5, { position: new Vec3(0, 50, 0) }, { easing: 'quadOut' })
            .call(() => this.node.destroy())
            .start();
    }

    setText(value: number) {
        const label = this.getComponent(Label);
        if (label) label.string = `+${value}`;
    }
}
