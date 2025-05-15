import { _decorator, Component, Node, Label, AudioClip, AudioSource, Prefab, instantiate, Vec3, tween, UITransform } from 'cc';
import { FloatingText } from './FloatingText';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('ClickController')
export class ClickController extends Component {
    @property(Label)
    oreLabel: Label = null!;

    @property(AudioClip)
    clickSound: AudioClip = null!;

    @property(Prefab)
    floatingTextPrefab: Prefab = null!;

    @property(Node)
    floatingTextParent: Node = null!;

    @property(Node)
    planetNode: Node = null!;

    private originalPlanetPosition: Vec3 = null!;
    private gameManager: GameManager = null!;

    start() {
        this.node.on(Node.EventType.TOUCH_START, this.handleClick, this);
        
        if (this.planetNode) {
            this.originalPlanetPosition = this.planetNode.position.clone();
        }
        
        // Get game manager reference
        this.gameManager = GameManager.instance;
        
        // Subscribe to ore count updates
        this.gameManager.onOreUpdated.push((oreCount: number) => {
            this.updateOreDisplay(oreCount);
        });
        
        // Initialize display
        this.updateOreDisplay(this.gameManager.oreCount);
    }
    
    updateOreDisplay(oreCount: number) {
        if (this.oreLabel) {
            this.oreLabel.string = `${oreCount}`;
        }
    }

    handleClick() {
        const oreGain = this.gameManager.calculateClickGain();
        this.gameManager.addOre(oreGain);

        this.playClickSound();
        this.spawnFloatingText(oreGain);
        this.shakePlanet();
    }

    playClickSound() {
        if (this.clickSound) {
            const audioSource = this.node.getComponent(AudioSource) || this.node.addComponent(AudioSource);
            audioSource.playOneShot(this.clickSound, 1);
        }
    }

    spawnFloatingText(amount: number) {
        if (!this.floatingTextPrefab || !this.floatingTextParent) return;

        const textNode = instantiate(this.floatingTextPrefab);
        this.floatingTextParent.addChild(textNode);

        let targetPos = this.planetNode ? this.planetNode.worldPosition.clone() : this.node.worldPosition.clone();
        targetPos.x += Math.random() * 40 - 20;
        targetPos.y += Math.random() * 40 - 20;
        
        const localPos = this.floatingTextParent.getComponent(UITransform)?.convertToNodeSpaceAR(targetPos);
        if (localPos) {
            textNode.setPosition(localPos);
        }

        const text = textNode.getComponent(FloatingText);
        if (text) text.setText(amount);
        
        this.scheduleOnce(() => {
            textNode.destroy();
        }, 1.0);
    }

    shakePlanet() {
        if (!this.planetNode || !this.originalPlanetPosition) return;
        
        tween(this.planetNode)
            .to(0.03, { position: new Vec3(this.originalPlanetPosition.x + 5, this.originalPlanetPosition.y, this.originalPlanetPosition.z) })
            .to(0.06, { position: new Vec3(this.originalPlanetPosition.x - 5, this.originalPlanetPosition.y, this.originalPlanetPosition.z) })
            .to(0.03, { position: new Vec3(this.originalPlanetPosition.x, this.originalPlanetPosition.y, this.originalPlanetPosition.z) })
            .start();
    }

    onDestroy() {
        this.node.off(Node.EventType.TOUCH_START, this.handleClick, this);
    }
}
