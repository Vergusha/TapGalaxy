import { _decorator, Component, Node, Label, AudioSource, resources, AudioClip } from 'cc';
const { ccclass, property } = _decorator;

// Импортируем MiningPanelController чтобы получить доступ к upgrade'ам
import { MiningPanelController } from './MinigPanelController';

@ccclass('GamePanelController')
export class GamePanelController extends Component {
    @property(Node)
    planet: Node = null;

    @property(Label)
    dilitiumText: Label = null;
    
    @property(MiningPanelController)
    miningPanelController: MiningPanelController = null;

    @property(AudioSource)
    audioSource: AudioSource = null;
    
    @property({type: AudioClip})
    clickSound: AudioClip = null;

    private dilitium: number = 0;
    private dilitiumPerClick: number = 1;
    private passiveTimer: number = 0;
    
    start() {
        if (this.planet) {
            this.planet.on(Node.EventType.TOUCH_END, this.onPlanetClick, this);
        }
        this.updateDilitiumText();
    }

    onPlanetClick() {
        this.dilitium += this.dilitiumPerClick;
        this.updateDilitiumText();
        
        // Воспроизводим звук при клике
        if (this.audioSource && this.clickSound) {
            this.audioSource.playOneShot(this.clickSound);
        }
    }
    
    public upgradeMining() {
        this.dilitiumPerClick += 1;
    }
    
    updateDilitiumText() {
        if (this.dilitiumText) {
            this.dilitiumText.string = this.dilitium.toString();
        }
    }

    update(dt: number) {
        // Обрабатываем пассивный доход независимо от активности MiningPanel
        this.processPassiveIncome(dt);
    }
    
    processPassiveIncome(dt: number) {
        this.passiveTimer += dt;
        if (this.passiveTimer >= 1) { // раз в секунду
            if (this.miningPanelController) {
                let totalIncome = 0;
                const upgrades = this.miningPanelController.getUpgrades();
                
                for (const upg of upgrades) {
                    if (upg.passiveIncome) {
                        totalIncome += upg.passiveIncome * upg.level;
                    }
                }
                
                if (totalIncome > 0) {
                    this.dilitium += totalIncome;
                    this.updateDilitiumText();
                }
            }
            this.passiveTimer = 0;
        }
    }
    
    // Геттеры и сеттеры для доступа к приватным полям
    public getDilitium(): number {
        return this.dilitium;
    }
    
    public setDilitium(value: number) {
        this.dilitium = value;
        this.updateDilitiumText();
    }
    
    public getDilitiumPerClick(): number {
        return this.dilitiumPerClick;
    }
    
    public setDilitiumPerClick(value: number) {
        this.dilitiumPerClick = value;
    }
}