import { _decorator, Component, Node, ProgressBar } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ShipStats')
export class ShipStats extends Component {
    @property(ProgressBar)
    healthBar: ProgressBar = null;

    @property(ProgressBar)
    shieldBar: ProgressBar = null;

    private maxHealth: number = 100;
    private maxShield: number = 50;
    private currentHealth: number = 100;
    private currentShield: number = 50;

    public initialize(health: number, shield: number) {
        this.maxHealth = health;
        this.maxShield = shield;
        this.currentHealth = health;
        this.currentShield = shield;
        this.updateBars();
    }

    public takeDamage(damage: number): boolean {
        // First damage goes to shield
        if (this.currentShield > 0) {
            this.currentShield -= damage;
            if (this.currentShield < 0) {
                // Remaining damage goes to health
                this.currentHealth += this.currentShield;
                this.currentShield = 0;
            }
        } else {
            // Direct damage to health
            this.currentHealth -= damage;
        }

        this.updateBars();
        return this.currentHealth <= 0;
    }

    private updateBars() {
        if (this.healthBar) {
            this.healthBar.progress = this.currentHealth / this.maxHealth;
        }
        if (this.shieldBar) {
            this.shieldBar.progress = this.currentShield / this.maxShield;
        }
    }
}