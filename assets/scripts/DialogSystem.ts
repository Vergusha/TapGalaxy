import { _decorator, Component, Node, Label, Sprite, SpriteFrame, Button, find, tween, Vec3, AudioSource } from 'cc';
const { ccclass, property } = _decorator;

// Интерфейс для данных диалога
export interface DialogData {
    speaker: string;         // Имя говорящего
    text: string;           // Текст диалога
    avatarIndex: number;    // Индекс аватара в массиве
}

// Интерфейс для персонажа
export interface Character {
    name: string;
    avatar: SpriteFrame;
}

@ccclass('DialogSystem')
export class DialogSystem extends Component {
    @property({ type: [SpriteFrame] })
    avatars: SpriteFrame[] = [];

    @property({ type: Node })
    avatarNode: Node = null;

    @property({ type: Node })
    textLabel: Node = null;

    @property({ type: Boolean, displayName: "Enable Appear Animation" })
    enableAppearAnimation: boolean = true;

    @property({ type: Boolean, displayName: "Enable Typewriter Effect" })
    enableTypewriter: boolean = false;

    @property({ type: Number, displayName: "Typewriter Speed (chars/sec)" })
    typewriterSpeed: number = 30;

    @property({ type: Boolean, displayName: "Enable Sound Effects" })
    enableSounds: boolean = false;

    private currentDialogIndex: number = 0;
    private dialogs: DialogData[] = [];
    private onDialogComplete: (() => void) | null = null;
    private isTyping: boolean = false;
    private typewriterInterval: any = null;

    onLoad() {
        // Автоматически найти компоненты, если они не назначены
        if (!this.avatarNode) {
            this.avatarNode = this.node.getChildByPath('AvatarFrame/Avatar');
        }
        if (!this.textLabel) {
            this.textLabel = this.node.getChildByPath('TextFrame/TextLabel');
        }

        // Настроить кнопку на TextLabel для перехода к следующему диалогу
        if (this.textLabel) {
            const button = this.textLabel.getComponent(Button);
            if (button) {
                button.node.on(Button.EventType.CLICK, this.nextDialog, this);
            }
        }

        // Анимация появления
        if (this.enableAppearAnimation) {
            this.playAppearAnimation();
        }
    }

    /**
     * Инициализировать диалоги
     * @param dialogs Массив диалогов
     * @param onComplete Callback при завершении диалогов
     */
    public initDialogs(dialogs: DialogData[], onComplete?: () => void) {
        this.dialogs = dialogs;
        this.currentDialogIndex = 0;
        this.onDialogComplete = onComplete || null;
        
        if (this.dialogs.length > 0) {
            this.showDialog(0);
        }
    }

    /**
     * Показать диалог по индексу
     */
    private showDialog(index: number) {
        if (index >= this.dialogs.length) {
            this.completeDialog();
            return;
        }

        const dialog = this.dialogs[index];
        
        // Установить аватар
        this.setAvatar(dialog.avatarIndex);
        
        // Установить текст с эффектом печатающего текста или обычно
        if (this.enableTypewriter) {
            this.setTextWithTypewriter(dialog.text);
        } else {
            this.setText(dialog.text);
        }
        
        // Воспроизвести звук
        if (this.enableSounds) {
            this.playDialogSound();
        }
        
        console.log(`${dialog.speaker}: ${dialog.text}`);
    }

    /**
     * Установить аватар по индексу
     */
    private setAvatar(avatarIndex: number) {
        if (!this.avatarNode || !this.avatars || avatarIndex < 0 || avatarIndex >= this.avatars.length) {
            console.warn('DialogSystem: Invalid avatar index or missing avatar node');
            return;
        }

        const sprite = this.avatarNode.getComponent(Sprite);
        if (sprite) {
            sprite.spriteFrame = this.avatars[avatarIndex];
        }
    }

    /**
     * Установить текст диалога
     */
    private setText(text: string) {
        if (!this.textLabel) {
            console.warn('DialogSystem: Text label node not found');
            return;
        }

        const label = this.textLabel.getComponent(Label);
        if (label) {
            label.string = text;
        }
    }

    /**
     * Установить текст с эффектом печатающего текста
     */
    private setTextWithTypewriter(text: string) {
        if (!this.textLabel) {
            console.warn('DialogSystem: Text label node not found');
            return;
        }

        const label = this.textLabel.getComponent(Label);
        if (!label) return;

        // Остановить предыдущий эффект, если есть
        if (this.typewriterInterval) {
            clearInterval(this.typewriterInterval);
        }

        label.string = '';
        let currentIndex = 0;
        this.isTyping = true;

        this.typewriterInterval = setInterval(() => {
            if (currentIndex < text.length) {
                label.string += text[currentIndex];
                currentIndex++;
            } else {
                clearInterval(this.typewriterInterval);
                this.typewriterInterval = null;
                this.isTyping = false;
            }
        }, 1000 / this.typewriterSpeed);
    }

    /**
     * Перейти к следующему диалогу
     */
    public nextDialog() {
        // Если текст еще печатается, завершить его мгновенно
        if (this.isTyping && this.typewriterInterval) {
            clearInterval(this.typewriterInterval);
            this.typewriterInterval = null;
            this.isTyping = false;
            
            // Показать полный текст
            const dialog = this.dialogs[this.currentDialogIndex];
            if (dialog) {
                this.setText(dialog.text);
            }
            return;
        }

        this.currentDialogIndex++;
        
        if (this.currentDialogIndex < this.dialogs.length) {
            this.showDialog(this.currentDialogIndex);
        } else {
            this.completeDialog();
        }
    }

    /**
     * Анимация появления диалога
     */
    private playAppearAnimation() {
        this.node.scale = Vec3.ZERO;
        tween(this.node)
            .to(0.3, { scale: Vec3.ONE }, { easing: 'backOut' })
            .start();
    }

    /**
     * Анимация исчезновения диалога
     */
    private playDisappearAnimation(onComplete: () => void) {
        tween(this.node)
            .to(0.2, { scale: Vec3.ZERO }, { easing: 'backIn' })
            .call(onComplete)
            .start();
    }

    /**
     * Воспроизвести звук диалога
     */
    private playDialogSound() {
        const audioSource = this.getComponent(AudioSource);
        if (audioSource) {
            audioSource.play();
        }
    }

    /**
     * Завершить диалог
     */
    private completeDialog() {
        console.log('Dialog completed');
        
        if (this.onDialogComplete) {
            this.onDialogComplete();
        }

        // Анимация закрытия или просто уничтожить узел
        if (this.enableAppearAnimation) {
            this.playDisappearAnimation(() => {
                this.node.destroy();
            });
        } else {
            this.closeDialog();
        }
    }

    /**
     * Закрыть диалог
     */
    public closeDialog() {
        // Очистить интервал печатающего текста если активен
        if (this.typewriterInterval) {
            clearInterval(this.typewriterInterval);
            this.typewriterInterval = null;
        }
        
        this.node.destroy();
    }

    /**
     * Проверить, есть ли еще диалоги
     */
    public hasMoreDialogs(): boolean {
        return this.currentDialogIndex < this.dialogs.length - 1;
    }

    /**
     * Получить текущий индекс диалога
     */
    public getCurrentDialogIndex(): number {
        return this.currentDialogIndex;
    }

    /**
     * Получить общее количество диалогов
     */
    public getTotalDialogs(): number {
        return this.dialogs.length;
    }

    onDestroy() {
        // Очистить обработчики событий
        if (this.textLabel) {
            const button = this.textLabel.getComponent(Button);
            if (button) {
                button.node.off(Button.EventType.CLICK, this.nextDialog, this);
            }
        }

        // Очистить интервал печатающего текста
        if (this.typewriterInterval) {
            clearInterval(this.typewriterInterval);
            this.typewriterInterval = null;
        }
    }
}
