import { _decorator, Component, resources, JsonAsset } from 'cc';
import { DialogData } from './DialogSystem';
const { ccclass, property } = _decorator;

/**
 * Интерфейс для локализованных строк
 */
export interface LocalizedStrings {
    [key: string]: string;
}

/**
 * Интерфейс для языковых данных
 */
export interface LanguageData {
    code: string;           // Код языка (en, ru, etc.)
    name: string;           // Название языка
    strings: LocalizedStrings;  // Локализованные строки
}

/**
 * Система локализации для диалогов
 */
@ccclass('DialogLocalization')
export class DialogLocalization extends Component {
    @property({ displayName: "Default Language" })
    public defaultLanguage: string = 'ru';

    @property
    public supportedLanguages: string[] = ['ru', 'en'];

    private static _instance: DialogLocalization = null;
    private _currentLanguage: string = '';
    private _languageData: Map<string, LanguageData> = new Map();
    private _loadingPromises: Map<string, Promise<LanguageData>> = new Map();

    public static getInstance(): DialogLocalization { return this._instance; }
    public get currentLanguage(): string { return this._currentLanguage; }
    public get languageData(): Map<string, LanguageData> { return this._languageData; }

    onLoad() {
        if (DialogLocalization._instance === null) {
            DialogLocalization._instance = this;
            this._currentLanguage = this.defaultLanguage;
            this.loadDefaultLanguages();
        } else {
            this.destroy();
            return;
        }
    }

    /**
     * Загрузить языки по умолчанию
     */
    private async loadDefaultLanguages() {
        const promises = this.supportedLanguages.map(lang => this.loadLanguage(lang));
        await Promise.all(promises);
        console.log('Default languages loaded');
    }

    /**
     * Загрузить язык
     */
    public async loadLanguage(languageCode: string): Promise<LanguageData> {
        // Проверить, не загружается ли уже этот язык
        if (this._loadingPromises.has(languageCode)) {
            return this._loadingPromises.get(languageCode)!;
        }

        // Проверить, не загружен ли уже этот язык
        if (this._languageData.has(languageCode)) {
            return this._languageData.get(languageCode)!;
        }

        const promise = this.loadLanguageFromResources(languageCode);
        this._loadingPromises.set(languageCode, promise);

        try {
            const data = await promise;
            this._languageData.set(languageCode, data);
            this._loadingPromises.delete(languageCode);
            return data;
        } catch (error) {
            this._loadingPromises.delete(languageCode);
            console.error(`Failed to load language ${languageCode}:`, error);
            
            // Возвращаем данные по умолчанию
            return this.createDefaultLanguageData(languageCode);
        }
    }

    /**
     * Загрузить язык из ресурсов
     */
    private async loadLanguageFromResources(languageCode: string): Promise<LanguageData> {
        return new Promise((resolve, reject) => {
            const path = `localization/dialogs_${languageCode}`;
            
            resources.load(path, JsonAsset, (err, asset) => {
                if (err) {
                    // Если файл не найден, создаем данные по умолчанию
                    console.warn(`Language file not found for ${languageCode}, using defaults`);
                    resolve(this.createDefaultLanguageData(languageCode));
                    return;
                }

                try {
                    const languageData: LanguageData = {
                        code: languageCode,
                        name: this.getLanguageName(languageCode),
                        strings: asset.json || {}
                    };
                    resolve(languageData);
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    /**
     * Создать данные языка по умолчанию
     */
    private createDefaultLanguageData(languageCode: string): LanguageData {
        return {
            code: languageCode,
            name: this.getLanguageName(languageCode),
            strings: this.getDefaultStrings(languageCode)
        };
    }

    /**
     * Получить название языка
     */
    private getLanguageName(languageCode: string): string {
        const names: { [key: string]: string } = {
            'ru': 'Русский',
            'en': 'English',
            'es': 'Español',
            'fr': 'Français',
            'de': 'Deutsch',
            'zh': '中文',
            'ja': '日本語'
        };
        return names[languageCode] || languageCode.toUpperCase();
    }

    /**
     * Получить строки по умолчанию
     */
    private getDefaultStrings(languageCode: string): LocalizedStrings {
        if (languageCode === 'en') {
            return {
                // Системные сообщения
                'system': 'System',
                'captain': 'Captain',
                'ai_ship': 'Ship AI',
                'scanner': 'Scanner',
                'trader': 'Trader',
                'engineer': 'Engineer',
                'warning': 'Warning',

                // Общие фразы
                'dialog.continue': 'Continue...',
                'dialog.yes': 'Yes',
                'dialog.no': 'No',
                'dialog.ok': 'OK',
                'dialog.cancel': 'Cancel',

                // Торговля
                'trade.welcome': 'Welcome, traveler! I have excellent offers.',
                'trade.buy': 'Buy resources',
                'trade.sell': 'Sell goods',
                'trade.leave': 'Leave',

                // Боевые ситуации
                'combat.enemy_detected': 'Enemy ship detected on radar!',
                'combat.prepare': 'Prepare for battle! Charge weapons!',
                'combat.systems_ready': 'All systems ready for combat, captain!',

                // Майнинг
                'mining.discovery': 'Rich deposits discovered: {resource}!',
                'mining.start': 'Initializing mining lasers for {resource} extraction',
                'mining.complete': 'Mining completed! Extracted: {amount} {resource}',

                // Улучшения
                'upgrade.available': 'Upgrade available: {component} to level {level}',
                'upgrade.cost': 'Cost: {cost} resource units',
                'upgrade.complete': 'Upgrade completed: {component} (Level {level})',

                // Ошибки
                'error.insufficient_resources': 'Insufficient resources: {resource}',
                'error.critical_failure': 'CRITICAL ERROR: {system}',
                'error.low_power': 'Warning! Low power level: {current}/{required}'
            };
        } else {
            // Русский по умолчанию
            return {
                // Системные сообщения
                'system': 'Система',
                'captain': 'Капитан',
                'ai_ship': 'ИИ Корабля',
                'scanner': 'Сканер',
                'trader': 'Торговец',
                'engineer': 'Инженер',
                'warning': 'Предупреждение',

                // Общие фразы
                'dialog.continue': 'Продолжить...',
                'dialog.yes': 'Да',
                'dialog.no': 'Нет',
                'dialog.ok': 'ОК',
                'dialog.cancel': 'Отмена',

                // Торговля
                'trade.welcome': 'Приветствую, путешественник! У меня есть отличные предложения.',
                'trade.buy': 'Купить ресурсы',
                'trade.sell': 'Продать товары',
                'trade.leave': 'Уйти',

                // Боевые ситуации
                'combat.enemy_detected': 'Обнаружен вражеский корабль на радаре!',
                'combat.prepare': 'Приготовиться к бою! Зарядить оружие!',
                'combat.systems_ready': 'Все системы готовы к бою, капитан!',

                // Майнинг
                'mining.discovery': 'Обнаружены богатые залежи: {resource}!',
                'mining.start': 'Инициализация майнинг-лазеров для добычи {resource}',
                'mining.complete': 'Майнинг завершен! Добыто: {amount} {resource}',

                // Улучшения
                'upgrade.available': 'Доступно улучшение: {component} до уровня {level}',
                'upgrade.cost': 'Стоимость: {cost} единиц ресурсов',
                'upgrade.complete': 'Улучшение завершено: {component} (Уровень {level})',

                // Ошибки
                'error.insufficient_resources': 'Недостаточно ресурсов: {resource}',
                'error.critical_failure': 'КРИТИЧЕСКАЯ ОШИБКА: {system}',
                'error.low_power': 'Внимание! Низкий уровень энергии: {current}/{required}'
            };
        }
    }

    /**
     * Установить текущий язык
     */
    public async setLanguage(languageCode: string) {
        await this.loadLanguage(languageCode);
        this._currentLanguage = languageCode;
        console.log(`Language changed to: ${languageCode}`);
    }

    /**
     * Получить текущий язык
     */
    public getCurrentLanguage(): string {
        return this._currentLanguage;
    }

    /**
     * Получить локализованную строку
     */
    public getString(key: string, params?: { [key: string]: string | number }): string {
        const languageData = this._languageData.get(this._currentLanguage);
        
        if (!languageData || !languageData.strings[key]) {
            // Попытаться найти в языке по умолчанию
            const defaultData = this._languageData.get(this.defaultLanguage);
            if (defaultData && defaultData.strings[key]) {
                return this.formatString(defaultData.strings[key], params);
            }
            
            console.warn(`Localization key not found: ${key}`);
            return key; // Возвращаем ключ как fallback
        }

        return this.formatString(languageData.strings[key], params);
    }    /**
     * Форматировать строку с параметрами
     */
    private formatString(template: string, params?: { [key: string]: string | number }): string {
        if (!params) return template;

        let result = template;
        for (const key in params) {
            if (params.hasOwnProperty(key)) {
                const value = params[key];
                const placeholder = `{${key}}`;
                result = result.split(placeholder).join(value.toString());
            }
        }

        return result;
    }

    /**
     * Локализовать диалог
     */
    public localizeDialog(dialog: DialogData): DialogData {
        return {
            ...dialog,
            speaker: this.getString(dialog.speaker.toLowerCase()) || dialog.speaker,
            text: this.getString(dialog.text) || dialog.text
        };
    }

    /**
     * Локализовать массив диалогов
     */
    public localizeDialogs(dialogs: DialogData[]): DialogData[] {
        return dialogs.map(dialog => this.localizeDialog(dialog));
    }

    /**
     * Получить список доступных языков
     */
    public getAvailableLanguages(): { code: string, name: string }[] {
        const languages: { code: string, name: string }[] = [];
        
        this._languageData.forEach((data, code) => {
            languages.push({
                code: data.code,
                name: data.name
            });
        });

        return languages.sort((a, b) => a.name.localeCompare(b.name));
    }

    /**
     * Проверить, поддерживается ли язык
     */
    public isLanguageSupported(languageCode: string): boolean {
        return this.supportedLanguages.includes(languageCode);
    }

    /**
     * Определить язык системы
     */
    public detectSystemLanguage(): string {
        // Попытаться определить язык системы
        if (typeof navigator !== 'undefined') {
            const browserLang = navigator.language || (navigator as any).userLanguage;
            if (browserLang) {
                const langCode = browserLang.split('-')[0];
                if (this.isLanguageSupported(langCode)) {
                    return langCode;
                }
            }
        }
        
        return this.defaultLanguage;
    }

    /**
     * Автоматически установить язык системы
     */
    public async setSystemLanguage() {
        const systemLang = this.detectSystemLanguage();
        await this.setLanguage(systemLang);
    }

    onDestroy() {
        if (DialogLocalization._instance === this) {
            DialogLocalization._instance = null;
        }
    }
}

/**
 * Утилиты для работы с локализацией диалогов
 */
export class DialogLocalizationUtils {
    
    /**
     * Создать локализованный диалог
     */
    static createLocalizedDialog(
        speakerKey: string, 
        textKey: string, 
        avatarIndex: number,
        params?: { [key: string]: string | number }
    ): DialogData {
        const localization = DialogLocalization.getInstance();
        
        return {
            speaker: localization ? localization.getString(speakerKey) : speakerKey,
            text: localization ? localization.getString(textKey, params) : textKey,
            avatarIndex
        };
    }

    /**
     * Создать системное сообщение с локализацией
     */
    static createLocalizedSystemMessage(textKey: string, params?: { [key: string]: string | number }): DialogData {
        return this.createLocalizedDialog('system', textKey, 1, params);
    }

    /**
     * Создать сообщение об ошибке с локализацией
     */
    static createLocalizedError(errorKey: string, params?: { [key: string]: string | number }): DialogData {
        return this.createLocalizedDialog('warning', errorKey, 2, params);
    }
}
