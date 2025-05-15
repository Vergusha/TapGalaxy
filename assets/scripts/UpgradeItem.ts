import { _decorator, Component, Node, Label, Button, SpriteFrame, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UpgradeItem')
export class UpgradeItem extends Component {
    @property(Label)
    nameLabel: Label = null!;
    
    @property(Label)
    descriptionLabel: Label = null!;
    
    @property(Label)
    levelLabel: Label = null!;
    
    @property(Label)
    priceLabel: Label = null!;
    
    @property(Button)
    buyButton: Button = null!;
    
    @property(Sprite)
    iconSprite: Sprite = null!;
    
    @property(SpriteFrame)
    icon: SpriteFrame = null!;
    
    private upgradeId: string = '';
    private level: number = 0;
    private basePrice: number = 10;
    private priceMultiplier: number = 1.5;
    private effectValue: number = 1;
    
    setup(id: string, name: string, description: string, basePrice: number, 
          priceMultiplier: number, effectValue: number, icon: SpriteFrame) {
        this.upgradeId = id;
        this.nameLabel.string = name;
        this.descriptionLabel.string = description;
        this.basePrice = basePrice;
        this.priceMultiplier = priceMultiplier;
        this.effectValue = effectValue;
        
        if (icon && this.iconSprite) {
            this.iconSprite.spriteFrame = icon;
        }
        
        this.updateDisplay();
    }
    
    updateDisplay() {
        this.levelLabel.string = `Level: ${this.level}`;
        this.priceLabel.string = `Cost: ${this.getCurrentPrice()}`;
    }
    
    getCurrentPrice(): number {
        return Math.floor(this.basePrice * Math.pow(this.priceMultiplier, this.level));
    }
    
    getEffectValue(): number {
        return this.effectValue * this.level;
    }
    
    getLevel(): number {
        return this.level;
    }
    
    upgrade() {
        this.level++;
        this.updateDisplay();
    }
}