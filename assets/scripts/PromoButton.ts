import { _decorator, Component, Node, EditBox, Button, find } from 'cc';
import { TopPanel } from './TopPanel';
const { ccclass, property } = _decorator;

@ccclass('PromoButton')
export class PromoButton extends Component {
    @property({ type: EditBox })
    promoEditBox: EditBox = null;

    onLoad() {
        const button = this.getComponent(Button);
        if (button) {
            button.node.on(Button.EventType.CLICK, this.onPromoClick, this);
        }
    }

    onPromoClick() {
        if (!this.promoEditBox) return;
        const code = this.promoEditBox.string.trim();
        if (!code) return;
        // Пример: простая обработка промокода
        // Можно добавить свои условия и награды
        if (code === 'XENOBIT100') {
            // Найти TopPanel и добавить XenoBit
            let topPanel: TopPanel | null = null;
            // Всегда ищем TopPanel через find, не используем topPanelNode
            const node = find('Canvas/TopPanel');
            if (node) topPanel = node.getComponent(TopPanel);
            if (topPanel) {
                topPanel.addXenoBit(100);
                this.promoEditBox.string = '';
                // Можно добавить визуальное подтверждение
            }
        }
        // Добавьте другие коды и награды по необходимости
    }

    onDestroy() {
        const button = this.getComponent(Button);
        if (button) {
            button.node.off(Button.EventType.CLICK, this.onPromoClick, this);
        }
    }
}
