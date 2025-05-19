import { _decorator, Component, Node, Button, Slider, Label, Toggle, director } from 'cc';
import { UIEvents } from './UIManager';
import { GameManager } from './GameManager';
import { SaveManager } from './SaveManager';
import { AudioManager } from './AudioManager';
const { ccclass, property } = _decorator;

@ccclass('SettingsPanelController')
export class SettingsPanelController extends Component {
    @property(Button)
    closeButton: Button = null;
    
    @property(Button)
    resetButton: Button = null;
    
    @property(Slider)
    musicVolumeSlider: Slider = null;
    
    @property(Slider)
    soundVolumeSlider: Slider = null;
    
    @property(Label)
    musicVolumeLabel: Label = null;
    
    @property(Label)
    soundVolumeLabel: Label = null;
    
    @property(Toggle)
    notificationsToggle: Toggle = null;
    
    start() {
        // Set up close button
        if (this.closeButton) {
            this.closeButton.node.on(Button.EventType.CLICK, this.onCloseButtonClick, this);
        }
        
        // Set up reset button
        if (this.resetButton) {
            this.resetButton.node.on(Button.EventType.CLICK, this.onResetButtonClick, this);
        }
        
        // Set up sliders
        if (this.musicVolumeSlider) {
            this.musicVolumeSlider.node.on('slide', this.onMusicVolumeChange, this);
            // Load saved music volume
            this.loadMusicVolume();
        }
        
        if (this.soundVolumeSlider) {
            this.soundVolumeSlider.node.on('slide', this.onSoundVolumeChange, this);
            // Load saved sound volume
            this.loadSoundVolume();
        }
        
        // Set up notifications toggle
        if (this.notificationsToggle) {
            this.notificationsToggle.node.on(Toggle.EventType.TOGGLE, this.onNotificationsToggle, this);
            // Load saved notification preference
            this.loadNotificationPreference();
        }
    }

    // Close button click handler
    private onCloseButtonClick() {
        UIEvents.emit('hideSettingsPanel');
    }
      // Reset button click handler
    private onResetButtonClick() {
        // Show a confirmation dialog before resetting
        if (confirm('Вы уверены, что хотите сбросить весь прогресс игры? Это действие нельзя отменить.')) {
            const saveManager = SaveManager.getInstance();
            if (saveManager) {
                saveManager.resetGame();
                
                // Reload the scene
                director.loadScene(director.getScene().name);
            }
        }
    }
      // Music volume slider handler
    private onMusicVolumeChange(slider: Slider) {
        const volume = slider.progress;
        // Update music volume label (0-100%)
        if (this.musicVolumeLabel) {
            this.musicVolumeLabel.string = `${Math.round(volume * 100)}%`;
        }
        
        // Apply music volume change
        const audioManager = AudioManager.getInstance();
        if (audioManager) {
            audioManager.setMusicVolume(volume);
        }
    }
    
    // Sound volume slider handler
    private onSoundVolumeChange(slider: Slider) {
        const volume = slider.progress;
        // Update sound volume label (0-100%)
        if (this.soundVolumeLabel) {
            this.soundVolumeLabel.string = `${Math.round(volume * 100)}%`;
        }
        
        // Apply sound volume change
        const audioManager = AudioManager.getInstance();
        if (audioManager) {
            audioManager.setSFXVolume(volume);
        }
    }
    
    // Notifications toggle handler
    private onNotificationsToggle(toggle: Toggle) {
        const enabled = toggle.isChecked;
        
        // Just log the notification setting change
        console.log(`Notifications ${enabled ? 'enabled' : 'disabled'}`);
        
        // Save notification preference to localStorage directly
        try {
            localStorage.setItem('tap_galaxy_notifications_enabled', String(enabled));
        } catch (e) {
            console.error('Failed to save notification preference:', e);
        }
    }
      // Load functions
    private loadMusicVolume() {
        try {
            // Get volume from AudioManager
            const audioManager = AudioManager.getInstance();
            if (audioManager) {
                const volume = audioManager.getMusicVolume();
                this.musicVolumeSlider.progress = volume;
                if (this.musicVolumeLabel) {
                    this.musicVolumeLabel.string = `${Math.round(volume * 100)}%`;
                }
            }
        } catch (e) {
            console.error('Failed to load music volume:', e);
        }
    }
    
    private loadSoundVolume() {
        try {
            // Get volume from AudioManager
            const audioManager = AudioManager.getInstance();
            if (audioManager) {
                const volume = audioManager.getSFXVolume();
                this.soundVolumeSlider.progress = volume;
                if (this.soundVolumeLabel) {
                    this.soundVolumeLabel.string = `${Math.round(volume * 100)}%`;
                }
            }
        } catch (e) {
            console.error('Failed to load sound volume:', e);
        }
    }
    
    private loadNotificationPreference() {
        try {
            // Get notification preference from localStorage directly
            const savedPref = localStorage.getItem('tap_galaxy_notifications_enabled');
            const enabled = savedPref === null ? true : savedPref === 'true';
            this.notificationsToggle.isChecked = enabled;
        } catch (e) {
            console.error('Failed to load notification preference:', e);
        }
    }
}
