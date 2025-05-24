# Dialog System Advanced Features Setup Guide

## Обзор новых возможностей

Система диалогов была значительно расширена и теперь включает:

1. **Система выборов (DialogChoiceSystem)** - ветвящиеся диалоги с кнопками выбора
2. **Интеграционный менеджер (DialogIntegrationManager)** - очереди диалогов и интеграция с игровыми системами  
3. **Расширение для добычи (MiningDialogExtension)** - специализированные диалоги для системы добычи
4. **Расширение для корабля (SpaceshipDialogExtension)** - диалоги управления кораблем
5. **Система сохранений (DialogSaveSystem)** - постоянное сохранение прогресса и настроек
6. **Система локализации (DialogLocalization)** - поддержка нескольких языков
7. **Отношения персонажей** - динамические отношения влияют на доступные диалоги
8. **Настройки диалогов** - пользовательские настройки интерфейса

## Быстрая настройка

### 1. Базовая настройка DialogManager

```typescript
// В вашем главном скрипте игры
onLoad() {
    const dialogManager = DialogManager.getInstance();
    
    // Автоматически загрузить сохраненные данные
    dialogManager.loadSavedProgress();
    
    // Установить язык из настроек системы
    dialogManager.setLanguage('auto');
}
```

### 2. Настройка DialogBox префаба для выборов

Добавьте в ваш DialogBox.prefab:

```
DialogBox
├── AvatarFrame (существующий)
├── TextFrame (существующий)  
├── ChoiceContainer (новый)
│   ├── Layout: Vertical Layout Group
│   └── Content Size Fitter
└── DialogChoiceSystem (Component)
    ├── Choice Button Prefab: ссылка на ChoiceButton.prefab
    └── Choice Container: ссылка на ChoiceContainer
```

### 3. Создание ChoiceButton.prefab

См. файл `ChoiceButtonSetup.md` для подробной инструкции.

## Подробные настройки

### DialogChoiceSystem

```typescript
// Создание диалога с выборами
const choiceDialog: DialogDataWithChoices = {
    speaker: "НПС",
    text: "Что вы выберете?",
    avatarIndex: 1,
    choices: [
        {
            text: "Вариант 1",
            action: () => console.log("Выбран вариант 1"),
            consequenceDialogs: [
                {
                    speaker: "НПС", 
                    text: "Вы выбрали первый вариант!",
                    avatarIndex: 1
                }
            ]
        },
        {
            text: "Вариант 2", 
            condition: () => playerLevel >= 5, // Условие доступности
            consequenceDialogs: [...]
        }
    ]
};
```

### DialogSaveSystem

```typescript
// Настройка системы сохранений
const saveSystem = DialogSaveSystem.getInstance();

// Изменение отношений с персонажами
saveSystem.updateCharacterRelationship('captain', 10);
saveSystem.updateCharacterRelationship('ai_ship', -5);

// Сохранение прогресса игры
saveSystem.updateGameProgress('mission1_complete', true);
saveSystem.updateGameProgress('player_level', 15);

// Настройки диалогов
saveSystem.updateSettings({
    enableTypewriter: true,
    typewriterSpeed: 50,
    enableSounds: true,
    enableAutosave: true
});
```

### DialogLocalization

```typescript
// Использование локализации
const localization = DialogLocalization.getInstance();

// Установка языка
localization.setLanguage('ru'); // или 'en'

// Получение локализованного текста
const text = localization.getText('welcome.title');
const textWithParams = localization.getText('mining.resource_found', {
    resource: 'Кристаллы энергии'
});
```

### MiningDialogExtension

```typescript
// Диалоги добычи ресурсов
const miningExtension = MiningDialogExtension.getInstance();

// Обнаружение ресурса
miningExtension.showResourceDiscoveryDialog('Титан', 75, () => {
    // Начало добычи
    miningExtension.showMiningStartDialog('Титан', 300, () => {
        // Завершение добычи
        miningExtension.showMiningCompleteDialog('Титан', 300, 95);
    });
});

// Предупреждение об опасности
miningExtension.showHazardWarningDialog('Радиация', 'высокий', () => {
    // Действия после предупреждения
});
```

### SpaceshipDialogExtension

```typescript
// Диалоги управления кораблем
const spaceshipExtension = SpaceshipDialogExtension.getInstance();

// Подтверждение улучшения
spaceshipExtension.showUpgradeConfirmationDialog('Квантовый щит', 5000, () => {
    // Улучшение подтверждено
});

// Диагностика систем
spaceshipExtension.showSystemDiagnosticsDialog(95, 82, 76, () => {
    // После диагностики
});

// Критическая ошибка
spaceshipExtension.showCriticalFailureDialog('Двигатель', 'Перегрев', () => {
    // Экстренные действия
});
```

### DialogIntegrationManager

```typescript
// Очереди диалогов
const integrationManager = DialogIntegrationManager.getInstance();

// Добавление диалогов в очередь
integrationManager.showMiningDialog('Золото', 25);
integrationManager.showFightDialog('Пираты');
integrationManager.showTraderDialog('Редкие артефакты');

// Диалоги будут показаны последовательно
```

## Интеграция с игровой логикой

### 1. События игры

```typescript
// При обнаружении врага
onEnemyDetected(enemyType: string) {
    const integrationManager = DialogIntegrationManager.getInstance();
    integrationManager.showFightDialog(enemyType);
}

// При нахождении ресурсов
onResourceFound(resourceType: string, quality: number) {
    const miningExtension = MiningDialogExtension.getInstance();
    miningExtension.showResourceDiscoveryDialog(resourceType, quality);
}

// При получении достижения
onAchievementUnlocked(achievementName: string) {
    const integrationManager = DialogIntegrationManager.getInstance();
    integrationManager.showAchievementDialog(achievementName, 'Поздравляем!');
}
```

### 2. Условные диалоги на основе отношений

```typescript
// Диалог, доступный только при хороших отношениях
const conditionalChoice: DialogChoice = {
    text: "Доверительная просьба",
    condition: () => {
        const saveSystem = DialogSaveSystem.getInstance();
        return saveSystem.getCharacterRelationship('captain') >= 50;
    },
    consequenceDialogs: [...]
};
```

### 3. Динамическое создание диалогов

```typescript
// Генерация диалогов на основе состояния игры
function createStatusDialog(): DialogData[] {
    const saveSystem = DialogSaveSystem.getInstance();
    const hullIntegrity = gameState.ship.hullIntegrity;
    const credits = gameState.player.credits;
    
    return [
        {
            speaker: "ИИ Корабля",
            text: `Статус корабля: целостность корпуса ${hullIntegrity}%`,
            avatarIndex: DialogCharacters.AI_SHIP
        },
        {
            speaker: "ИИ Корабля", 
            text: `Кредитов в банке: ${credits}`,
            avatarIndex: DialogCharacters.AI_SHIP
        }
    ];
}
```

## Настройка файлов ресурсов

### 1. Структура папок

```
assets/
├── resources/
│   └── localization/
│       ├── en.json
│       ├── ru.json
│       └── [другие языки].json
├── prefabs/
│   ├── DialogBox.prefab (обновленный)
│   └── ChoiceButton.prefab (новый)
└── scripts/
    ├── DialogSystem.ts (базовый)
    ├── DialogManager.ts (расширенный)
    ├── DialogChoiceSystem.ts (новый)
    ├── DialogSaveSystem.ts (новый)
    ├── DialogLocalization.ts (новый)
    ├── DialogIntegrationManager.ts (новый)
    ├── MiningDialogExtension.ts (новый)
    ├── SpaceshipDialogExtension.ts (новый)
    └── DialogDemoAdvanced.ts (демонстрация)
```

### 2. Файлы локализации

Файлы JSON должны содержать структурированные переводы:

```json
{
  "category": {
    "key": "Translated text",
    "key_with_params": "Text with {parameter}"
  }
}
```

## Производительность и оптимизация

### 1. Ленивая загрузка

```typescript
// Загружать расширения только когда нужно
private getMiningExtension(): MiningDialogExtension {
    if (!this.miningExtension) {
        this.miningExtension = MiningDialogExtension.getInstance();
    }
    return this.miningExtension;
}
```

### 2. Пулинг объектов

```typescript
// Переиспользование кнопок выбора
private buttonPool: Node[] = [];

private getChoiceButton(): Node {
    return this.buttonPool.pop() || instantiate(this.choiceButtonPrefab);
}

private returnChoiceButton(button: Node) {
    button.removeFromParent();
    this.buttonPool.push(button);
}
```

### 3. Автосохранение

```typescript
// Настройка автосохранения
const saveSystem = DialogSaveSystem.getInstance();
saveSystem.updateSettings({
    enableAutosave: true,
    autosaveInterval: 30000 // каждые 30 секунд
});
```

## Отладка и тестирование

### 1. Логирование

```typescript
// Включить подробное логирование
DialogManager.setDebugMode(true);
DialogSaveSystem.setDebugMode(true);
```

### 2. Тестовые диалоги

Используйте `DialogDemoAdvanced.ts` для тестирования всех возможностей.

### 3. Валидация данных

```typescript
// Проверка корректности диалоговых данных
function validateDialogData(data: DialogData[]): boolean {
    return data.every(dialog => 
        dialog.speaker && 
        dialog.text && 
        typeof dialog.avatarIndex === 'number'
    );
}
```

## Решение проблем

### Общие проблемы:

1. **Кнопки выбора не появляются**
   - Проверьте, назначен ли prefab кнопки
   - Убедитесь, что ChoiceContainer существует

2. **Локализация не работает**
   - Проверьте путь к JSON файлам
   - Убедитесь, что JSON корректен

3. **Сохранения не загружаются**
   - Проверьте поддержку localStorage в браузере
   - Убедитесь, что вызывается loadSavedProgress()

4. **Очередь диалогов зависает**
   - Проверьте, что все диалоги имеют callback завершения
   - Убедитесь, что нет бесконечных циклов

Эта система предоставляет полную основу для создания сложных, интерактивных диалогов с сохранением состояния, локализацией и глубокой интеграцией с игровой логикой.
