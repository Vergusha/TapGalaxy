import { _decorator, Component, Node, Prefab, instantiate, Label, Sprite, UIOpacity, tween, Vec3, director, sys } from 'cc';
const { ccclass, property } = _decorator;

// Define notification types
export enum NotificationType {
    INFO,
    SUCCESS,
    WARNING,
    ERROR
}

// Define notification data
export interface NotificationData {
    type: NotificationType;
    message: string;
    duration?: number; // Duration in seconds
    iconSprite?: Sprite;
}

@ccclass('NotificationManager')
export class NotificationManager extends Component {
    @property(Prefab)
    notificationPrefab: Prefab = null;
    
    @property(Node)
    notificationContainer: Node = null;
    
    // Static instance for global access
    private static _instance: NotificationManager = null;
    
    // Queue for notifications
    private notificationQueue: NotificationData[] = [];
    private isShowingNotification: boolean = false;
    
    // Save key for notification preference
    private static readonly NOTIFICATION_PREF_KEY = 'tap_galaxy_notifications_enabled';
    
    // Notification enabled state
    private notificationsEnabled: boolean = true;
    
    onLoad() {
        // Create a singleton instance
        if (NotificationManager._instance !== null) {
            this.destroy();
            return;
        }
        NotificationManager._instance = this;
        director.addPersistRootNode(this.node);
        
        // Load notification preference
        this.loadNotificationPreference();
    }
    
    // Get singleton instance
    public static getInstance(): NotificationManager {
        return NotificationManager._instance;
    }
    
    // Show a notification
    public showNotification(data: NotificationData) {
        if (!this.notificationsEnabled) return;
        
        // Add to queue
        this.notificationQueue.push(data);
        
        // Process queue if not already showing a notification
        if (!this.isShowingNotification) {
            this.processNotificationQueue();
        }
    }
    
    // Process notification queue
    private processNotificationQueue() {
        if (this.notificationQueue.length === 0) {
            this.isShowingNotification = false;
            return;
        }
        
        this.isShowingNotification = true;
        const notificationData = this.notificationQueue.shift();
        this.displayNotification(notificationData);
    }
    
    // Display a notification
    private displayNotification(data: NotificationData) {
        if (!this.notificationPrefab || !this.notificationContainer) {
            console.error('Notification prefab or container not set');
            this.isShowingNotification = false;
            return;
        }
        
        // Create notification from prefab
        const notification = instantiate(this.notificationPrefab);
        this.notificationContainer.addChild(notification);
        
        // Get components
        const messageLabel = notification.getChildByName('MessageLabel')?.getComponent(Label);
        const iconSprite = notification.getChildByName('IconSprite')?.getComponent(Sprite);
        const bgSprite = notification.getChildByName('Background')?.getComponent(Sprite);
        const uiOpacity = notification.getComponent(UIOpacity) || notification.addComponent(UIOpacity);
        
        // Set message
        if (messageLabel) {
            messageLabel.string = data.message;
        }
        
        // Set icon if provided
        if (iconSprite && data.iconSprite) {
            iconSprite.spriteFrame = data.iconSprite.spriteFrame;
        }
        
        // Set background color based on notification type
        if (bgSprite) {
            switch (data.type) {
                case NotificationType.SUCCESS:
                    bgSprite.color.set(100, 200, 100, 230); // Green
                    break;
                case NotificationType.WARNING:
                    bgSprite.color.set(230, 180, 50, 230); // Yellow
                    break;
                case NotificationType.ERROR:
                    bgSprite.color.set(200, 100, 100, 230); // Red
                    break;
                case NotificationType.INFO:
                default:
                    bgSprite.color.set(70, 130, 180, 230); // Blue
                    break;
            }
        }
        
        // Set initial opacity to 0
        uiOpacity.opacity = 0;
        
        // Animation duration in seconds
        const fadeDuration = 0.3;
        const showDuration = data.duration || 2.0;
        
        // Initial position (start from above the screen)
        const originalPosition = notification.position.clone();
        notification.position = new Vec3(originalPosition.x, originalPosition.y + 100, originalPosition.z);
        
        // Fade in and slide down
        tween(notification)
            .to(fadeDuration, { position: originalPosition, opacity: 255 })
            .delay(showDuration)
            .to(fadeDuration, { opacity: 0, position: new Vec3(originalPosition.x, originalPosition.y - 50, originalPosition.z) })
            .call(() => {
                // Remove the notification
                notification.removeFromParent();
                notification.destroy();
                
                // Process next notification in queue
                this.processNotificationQueue();
            })
            .start();
    }
    
    // Enable/disable notifications
    public setNotificationsEnabled(enabled: boolean) {
        this.notificationsEnabled = enabled;
        this.saveNotificationPreference();
    }
    
    // Get notification enabled state
    public areNotificationsEnabled(): boolean {
        return this.notificationsEnabled;
    }
    
    // Save notification preference
    private saveNotificationPreference() {
        try {
            sys.localStorage.setItem(NotificationManager.NOTIFICATION_PREF_KEY, String(this.notificationsEnabled));
        } catch (e) {
            console.error('Failed to save notification preference:', e);
        }
    }
    
    // Load notification preference
    private loadNotificationPreference() {
        try {
            const savedPref = sys.localStorage.getItem(NotificationManager.NOTIFICATION_PREF_KEY);
            if (savedPref !== null) {
                this.notificationsEnabled = savedPref === 'true';
            }
        } catch (e) {
            console.error('Failed to load notification preference:', e);
        }
    }
    
    // Convenience methods for different notification types
    public showInfoNotification(message: string, duration?: number) {
        this.showNotification({
            type: NotificationType.INFO,
            message,
            duration
        });
    }
    
    public showSuccessNotification(message: string, duration?: number) {
        this.showNotification({
            type: NotificationType.SUCCESS,
            message,
            duration
        });
    }
    
    public showWarningNotification(message: string, duration?: number) {
        this.showNotification({
            type: NotificationType.WARNING,
            message,
            duration
        });
    }
    
    public showErrorNotification(message: string, duration?: number) {
        this.showNotification({
            type: NotificationType.ERROR,
            message,
            duration
        });
    }
}
