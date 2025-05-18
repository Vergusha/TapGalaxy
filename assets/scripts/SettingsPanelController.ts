import { _decorator, Component, Node, Button, Slider, Label, Toggle } from 'cc';
import { UIEvents } from './UIManager';
import { GameManager } from './GameManager';
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
        if (confirm('Are you sure you want to reset all game progress? This cannot be undone.')) {
            const gameManager = GameManager.getInstance();
            if (gameManager) {
                gameManager.resetGame();
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
        
        // Save music volume preference
        this.saveMusicVolume(volume);
        
        // Apply music volume change
        // TODO: Implement music volume change when audio system is added
    }
    
    // Sound volume slider handler
    private onSoundVolumeChange(slider: Slider) {
        const volume = slider.progress;
        // Update sound volume label (0-100%)
        if (this.soundVolumeLabel) {
            this.soundVolumeLabel.string = `${Math.round(volume * 100)}%`;
        }
        
        // Save sound volume preference
        this.saveSoundVolume(volume);
        
        // Apply sound volume change
        // TODO: Implement sound volume change when audio system is added
    }
    
    // Notifications toggle handler
    private onNotificationsToggle(toggle: Toggle) {
        const enabled = toggle.isChecked;
        
        // Save notification preference
        this.saveNotificationPreference(enabled);
        
        // Apply notification setting
        // TODO: Implement notification system
    }
    
    // Save and load preferences
    private saveMusicVolume(volume: number) {
        try {
            localStorage.setItem('tap_galaxy_music_volume', volume.toString());
        } catch (e) {
            console.error('Failed to save music volume:', e);
        }
    }
    
    private loadMusicVolume() {
        try {
            const savedVolume = localStorage.getItem('tap_galaxy_music_volume');
            if (savedVolume !== null) {
                const volume = parseFloat(savedVolume);
                this.musicVolumeSlider.progress = volume;
                if (this.musicVolumeLabel) {
                    this.musicVolumeLabel.string = `${Math.round(volume * 100)}%`;
                }
            }
        } catch (e) {
            console.error('Failed to load music volume:', e);
        }
    }
    
    private saveSoundVolume(volume: number) {
        try {
            localStorage.setItem('tap_galaxy_sound_volume', volume.toString());
        } catch (e) {
            console.error('Failed to save sound volume:', e);
        }
    }
    
    private loadSoundVolume() {
        try {
            const savedVolume = localStorage.getItem('tap_galaxy_sound_volume');
            if (savedVolume !== null) {
                const volume = parseFloat(savedVolume);
                this.soundVolumeSlider.progress = volume;
                if (this.soundVolumeLabel) {
                    this.soundVolumeLabel.string = `${Math.round(volume * 100)}%`;
                }
            }
        } catch (e) {
            console.error('Failed to load sound volume:', e);
        }
    }
    
    private saveNotificationPreference(enabled: boolean) {
        try {
            localStorage.setItem('tap_galaxy_notifications', enabled.toString());
        } catch (e) {
            console.error('Failed to save notification preference:', e);
        }
    }
    
    private loadNotificationPreference() {
        try {
            const savedPreference = localStorage.getItem('tap_galaxy_notifications');
            if (savedPreference !== null) {
                const enabled = savedPreference === 'true';
                this.notificationsToggle.isChecked = enabled;
            }
        } catch (e) {
            console.error('Failed to load notification preference:', e);
        }
    }
}
