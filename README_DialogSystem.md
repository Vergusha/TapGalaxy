# Система диалогов TapGalaxy

## Описание
Система диалогов предоставляет полнофункциональный интерфейс для отображения диалогов с аватарами персонажей и интерактивным текстом.

## Компоненты

### 1. DialogSystem
Основной компонент для управления диалогами на префабе DialogBox.

**Свойства:**
- `avatars: SpriteFrame[]` - Массив аватаров персонажей
- `avatarNode: Node` - Узел для отображения аватара (автоматически находит AvatarFrame/Avatar)
- `textLabel: Node` - Узел для отображения текста (автоматически находит TextFrame/TextLabel)

### 2. DialogManager
Singleton-менеджер для управления диалогами в игре.

**Методы:**
- `showDialog(dialogs: DialogData[], onComplete?: () => void)` - Показать диалог
- `closeCurrentDialog()` - Закрыть текущий диалог
- `isDialogActive(): boolean` - Проверить, активен ли диалог

### 3. DialogData
Интерфейс для данных диалога:
```typescript
interface DialogData {
    speaker: string;      // Имя говорящего
    text: string;        // Текст диалога
    avatarIndex: number; // Индекс аватара в массиве
}
```

## Настройка

### 1. Настройка DialogBox префаба
1. Добавьте компонент `DialogSystem` на корневой узел DialogBox
2. В инспекторе назначьте массив аватаров (SpriteFrame) в свойство `Avatars`
3. При необходимости можно вручную назначить `Avatar Node` и `Text Label`, но система автоматически найдет их по путям:
   - Avatar: `AvatarFrame/Avatar`
   - TextLabel: `TextFrame/TextLabel`

### 2. Настройка DialogManager
1. Создайте пустой GameObject в сцене
2. Добавьте компонент `DialogManager`
3. Назначьте префаб DialogBox в свойство `Dialog Box Prefab`

### 3. Настройка аватаров
Подготовьте SpriteFrame для каждого персонажа и добавьте их в массив `avatars` в том порядке, в котором вы будете их использовать в диалогах.

## Использование

### Базовое использование
```typescript
import { DialogManager } from './DialogManager';
import { DialogData } from './DialogSystem';

// Создать массив диалогов
const dialogs: DialogData[] = [
    {
        speaker: "Капитан",
        text: "Добро пожаловать на борт!",
        avatarIndex: 0
    },
    {
        speaker: "ИИ",
        text: "Системы готовы к работе.",
        avatarIndex: 1
    }
];

// Показать диалог
const dialogManager = DialogManager.getInstance();
if (dialogManager) {
    dialogManager.showDialog(dialogs, () => {
        console.log('Диалог завершен!');
        // Здесь можно выполнить действия после диалога
    });
}
```

### Использование готовых диалогов
```typescript
import { DialogManager, DialogPresets } from './DialogManager';

const dialogManager = DialogManager.getInstance();
if (dialogManager) {
    // Показать диалог приветствия
    dialogManager.showDialog(DialogPresets.getWelcomeDialog());
    
    // Показать диалог торговца
    dialogManager.showDialog(DialogPresets.getTraderDialog());
    
    // Показать диалог о бое
    dialogManager.showDialog(DialogPresets.getFightDialog());
}
```

### Интеграция с существующими системами
Пример интеграции с TraderInteraction (уже реализовано):

```typescript
private showTraderDialog() {
    const traderDialogs: DialogData[] = [
        {
            speaker: "Торговец",
            text: "Добро пожаловать в мой магазин!",
            avatarIndex: 0
        }
    ];

    const dialogManager = DialogManager.getInstance();
    if (dialogManager) {
        dialogManager.showDialog(traderDialogs, () => {
            // После диалога открыть панель торговца
            this.openTraderPanel();
        });
    }
}
```

## Расширение функциональности

### Добавление новых типов диалогов
В `DialogPresets` можно добавить новые предустановленные диалоги:

```typescript
static getCustomDialog(): DialogData[] {
    return [
        {
            speaker: "Новый персонаж",
            text: "Текст диалога",
            avatarIndex: 2
        }
    ];
}
```

### Дополнительные возможности
Систему можно расширить следующими функциями:
- Анимация появления/исчезновения диалогов
- Эффект печатающего текста
- Ветвление диалогов с выбором ответов
- Локализация диалогов
- Звуковые эффекты для каждого персонажа

## Демо
Для тестирования системы используйте компонент `DialogDemo`, который показывает примеры использования всех типов диалогов.

## Примечания
- Система автоматически блокирует создание нескольких диалогов одновременно
- DialogManager использует паттерн Singleton для глобального доступа
- При клике на TextLabel происходит переход к следующему диалогу
- Диалоги автоматически закрываются после показа последнего сообщения
