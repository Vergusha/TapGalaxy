import { _decorator, Component, EditBox, Button, find } from 'cc';
import { TopPanel } from './TopPanel';
import { FightTimer } from './FightTimer';
import { SaveManager } from './SaveManager';
const { ccclass, property } = _decorator;

@ccclass('PromoButton')
export class PromoButton extends Component {
    @property(EditBox)
    promoEditBox: EditBox = null;

    @property(Button)
    activateButton: Button = null;

    onLoad() {
        if (this.activateButton) {
            this.activateButton.node.on(Button.EventType.CLICK, this.onPromoClick, this);
        }
    }

    private onPromoClick() {
        if (!this.promoEditBox) return;
        const code = this.promoEditBox.string.trim().toLowerCase();
        if (!code) return;

        switch (code) {
            case 'skip':
                this.skipBattleTimer();
                break;
            case '10md':
                this.giveDilithium();
                break;
            default:
                this.showMessage('Промокод не найден!');
                break;
        }
        this.promoEditBox.string = '';
    }

    private skipBattleTimer() {
        // Try common paths
        let fightTimerNode = find('Canvas/FightTimer');
        if (!fightTimerNode) {
            fightTimerNode = find('Canvas/GamePanel/FightTimer');
        }
        // If still not found, search recursively under Canvas
        if (!fightTimerNode) {
            const canvas = find('Canvas');
            if (canvas) {
                fightTimerNode = this.findNodeWithComponent(canvas, FightTimer);
            }
        }
        if (fightTimerNode) {
            const fightTimer = fightTimerNode.getComponent(FightTimer);
            if (fightTimer) {
                fightTimer.skipTimer();
                this.showMessage('Таймер боя пропущен!');
                return;
            }
        }
        this.showMessage('Таймер не найден!');
    }

    // Helper: recursively search for a node with a given component
    private findNodeWithComponent(node: any, componentType: any): any {
        if (node.getComponent && node.getComponent(componentType)) {
            return node;
        }
        if (node.children) {
            for (const child of node.children) {
                const found = this.findNodeWithComponent(child, componentType);
                if (found) return found;
            }
        }
        return null;
    }

    private giveDilithium() {
        // Найти TopPanel и добавить дилитий
        const topPanelNode = find('Canvas/TopPanel');
        let success = false;
        if (topPanelNode) {
            const topPanel = topPanelNode.getComponent(TopPanel);
            if (topPanel) {
                topPanel.addDilithium(10000000);
                topPanel.updateAllResourceDisplays();
                success = true;
            }
        }
        // Также обновить SaveManager
        SaveManager.addResources(0, 10000000, 0, 0);
        success = true;
        if (success) {
            this.showMessage('Вы получили 10 000 000 дилития!');
        } else {
            this.showMessage('Не удалось добавить дилитий!');
        }
    }

    private showMessage(msg: string) {
        // Здесь можно показать всплывающее сообщение или диалог
        // Например, если есть DialogManager:
        // DialogManager.getInstance().showInfo(msg);
        console.log(msg);
    }
}