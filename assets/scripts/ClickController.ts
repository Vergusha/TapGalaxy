import { _decorator, Component, Node, Label, AudioClip, AudioSource, Prefab, instantiate, Vec3, tween, UITransform } from 'cc';
import { FloatingText } from './FloatingText';
const { ccclass, property } = _decorator;

@ccclass('ClickController')
export class ClickController extends Component {
    @property(Label)
    oreLabel: Label = null!;

    @property(AudioClip)
    clickSound: AudioClip = null!;

    @property(Prefab)
    floatingTextPrefab: Prefab = null!; // 💬 Префаб всплывающего текста

    @property(Node)
    floatingTextParent: Node = null!; // Canvas или UI root, где появится текст

    @property(Node)
    planetNode: Node = null!; // планета для тряски

    private oreCount: number = 0;
    private orePerClick: number = 1;

    start() {
        this.node.on(Node.EventType.TOUCH_START, this.handleClick, this);
    }

    handleClick() {
        this.oreCount += this.orePerClick;
        this.oreLabel.string = `${this.oreCount}`;

        this.playClickSound();
        this.spawnFloatingText();
        this.shakePlanet();
    }

    playClickSound() {
        if (this.clickSound) {
            const audioSource = this.node.getComponent(AudioSource) || this.node.addComponent(AudioSource);
            audioSource.playOneShot(this.clickSound, 1);
        }
    }

    spawnFloatingText() {
        if (!this.floatingTextPrefab || !this.floatingTextParent) return;

        const textNode = instantiate(this.floatingTextPrefab);
        this.floatingTextParent.addChild(textNode);

        // Используем позицию планеты вместо узла нажатия
        let targetPos = this.planetNode ? this.planetNode.worldPosition.clone() : this.node.worldPosition.clone();
        // Добавляем небольшой случайный разброс, чтобы тексты не накладывались друг на друга
        targetPos.x += Math.random() * 40 - 20;
        targetPos.y += Math.random() * 40 - 20;
        
        const localPos = this.floatingTextParent.getComponent(UITransform)?.convertToNodeSpaceAR(targetPos);
        if (localPos) {
            textNode.setPosition(localPos);
        }

        const text = textNode.getComponent(FloatingText);
        if (text) text.setText(this.orePerClick);
        
        // Удаление префаба через 1 секунду
        this.scheduleOnce(() => {
            textNode.destroy();
        }, 1.0);
    }

    shakePlanet() {
        if (!this.planetNode) return;

        // Store the original position (we'll need to clone it to avoid reference issues)
        const originalPos = this.planetNode.position.clone();
        
        // Create a series of tweens that modify a copy of the position
        tween(this.planetNode)
            .to(0.05, { position: new Vec3(originalPos.x + 5, originalPos.y, originalPos.z) })
            .to(0.05, { position: new Vec3(originalPos.x - 5, originalPos.y, originalPos.z) })
            .to(0.05, { position: new Vec3(originalPos.x, originalPos.y, originalPos.z) })
            .start();
    }

    onDestroy() {
        this.node.off(Node.EventType.TOUCH_START, this.handleClick, this);
    }
}
