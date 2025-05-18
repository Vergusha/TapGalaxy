import { _decorator, Component, Node, AudioClip, AudioSource, sys } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AudioManager')
export class AudioManager extends Component {
    @property(AudioClip)
    buttonClick: AudioClip = null;
    
    @property(AudioClip)
    purchaseSuccess: AudioClip = null;
    
    @property(AudioClip)
    purchaseFail: AudioClip = null;
    
    @property(AudioClip)
    resourceGain: AudioClip = null;
    
    @property(AudioClip)
    levelUp: AudioClip = null;
    
    @property(AudioClip)
    gameBackground: AudioClip = null;
    
    @property({ type: AudioSource, tooltip: "Sound effects audio source" })
    sfxSource: AudioSource = null;
    
    @property({ type: AudioSource, tooltip: "Music audio source" })
    musicSource: AudioSource = null;
    
    private static _instance: AudioManager = null;
    
    // Save keys for volume settings
    private static readonly MUSIC_VOLUME_KEY = 'tap_galaxy_music_volume';
    private static readonly SFX_VOLUME_KEY = 'tap_galaxy_sfx_volume';
    
    onLoad() {
        // Create a singleton instance
        if (AudioManager._instance !== null) {
            this.destroy();
            return;
        }
        
        AudioManager._instance = this;
        
        // Load saved volume settings
        this.loadVolumeSettings();
        
        // Start playing background music
        this.playBackgroundMusic();
    }
    
    // Get singleton instance
    public static getInstance(): AudioManager {
        return AudioManager._instance;
    }
    
    // Play a sound effect
    public playSFX(clip: AudioClip) {
        if (!this.sfxSource || !clip) return;
        
        this.sfxSource.playOneShot(clip);
    }
    
    // Convenience methods for common sounds
    public playButtonClick() {
        this.playSFX(this.buttonClick);
    }
    
    public playPurchaseSuccess() {
        this.playSFX(this.purchaseSuccess);
    }
    
    public playPurchaseFail() {
        this.playSFX(this.purchaseFail);
    }
    
    public playResourceGain() {
        this.playSFX(this.resourceGain);
    }
    
    public playLevelUp() {
        this.playSFX(this.levelUp);
    }
    
    // Background music control
    public playBackgroundMusic() {
        if (!this.musicSource || !this.gameBackground) return;
        
        this.musicSource.clip = this.gameBackground;
        this.musicSource.loop = true;
        
        if (!this.musicSource.playing) {
            this.musicSource.play();
        }
    }
    
    public stopBackgroundMusic() {
        if (!this.musicSource) return;
        
        this.musicSource.stop();
    }
    
    // Volume control
    public setMusicVolume(volume: number) {
        if (!this.musicSource) return;
        
        // Clamp volume between 0 and 1
        volume = Math.max(0, Math.min(1, volume));
        this.musicSource.volume = volume;
        
        // Save the setting
        try {
            sys.localStorage.setItem(AudioManager.MUSIC_VOLUME_KEY, String(volume));
        } catch (e) {
            console.error('Failed to save music volume setting:', e);
        }
    }
    
    public setSFXVolume(volume: number) {
        if (!this.sfxSource) return;
        
        // Clamp volume between 0 and 1
        volume = Math.max(0, Math.min(1, volume));
        this.sfxSource.volume = volume;
        
        // Save the setting
        try {
            sys.localStorage.setItem(AudioManager.SFX_VOLUME_KEY, String(volume));
        } catch (e) {
            console.error('Failed to save SFX volume setting:', e);
        }
    }
    
    public getMusicVolume(): number {
        return this.musicSource ? this.musicSource.volume : 0;
    }
    
    public getSFXVolume(): number {
        return this.sfxSource ? this.sfxSource.volume : 0;
    }
    
    // Load saved volume settings
    private loadVolumeSettings() {
        try {
            // Load music volume
            const savedMusicVolume = sys.localStorage.getItem(AudioManager.MUSIC_VOLUME_KEY);
            if (savedMusicVolume !== null && this.musicSource) {
                this.musicSource.volume = parseFloat(savedMusicVolume);
            }
            
            // Load SFX volume
            const savedSFXVolume = sys.localStorage.getItem(AudioManager.SFX_VOLUME_KEY);
            if (savedSFXVolume !== null && this.sfxSource) {
                this.sfxSource.volume = parseFloat(savedSFXVolume);
            }
        } catch (e) {
            console.error('Failed to load volume settings:', e);
        }
    }
    
    // Mute/unmute audio
    public setMusicMuted(muted: boolean) {
        if (!this.musicSource) return;
        
        if (muted) {
            if (this.musicSource.playing) {
                this.musicSource.pause();
            }
        } else {
            if (!this.musicSource.playing) {
                this.musicSource.play();
            }
        }
    }
    
    public setSFXMuted(muted: boolean) {
        if (!this.sfxSource) return;
        
        // Store the original volume to restore it when unmuted
        if (muted) {
            this.sfxSource.volume = 0;
        } else {
            // Load the saved volume
            const savedVolume = sys.localStorage.getItem(AudioManager.SFX_VOLUME_KEY);
            this.sfxSource.volume = savedVolume ? parseFloat(savedVolume) : 1;
        }
    }
}
