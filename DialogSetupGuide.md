# Полный гайд по настройке системы диалогов

## Шаг 1: Подготовка префаба DialogBox

### 1.1 Добавление компонента DialogSystem
1. Откройте префаб `DialogBox.prefab` в редакторе
2. Выберите корневой узел DialogBox
3. Добавьте компонент `DialogSystem` (Add Component → Custom → DialogSystem)

### 1.2 Настройка аватаров
1. В компоненте DialogSystem найдите свойство `Avatars`
2. Установите размер массива (например, 5 для 5 персонажей)
3. Перетащите SpriteFrame аватаров в соответствующие слоты:
   - Element 0: Капитан
   - Element 1: ИИ корабля
   - Element 2: Сканер/Система
   - Element 3: Торговец
   - Element 4: Враг

### 1.3 Проверка структуры узлов
Убедитесь, что структура префаба соответствует:
```
DialogBox
├── AvatarFrame
│   └── Avatar (должен иметь компонент Sprite)
└── TextFrame
    └── TextLabel (должен иметь компонент Label и Button)
```

## Шаг 2: Настройка DialogManager в сцене

### 2.1 Создание менеджера
1. В сцене создайте пустой GameObject (правый клик → Create Empty Node)
2. Переименуйте его в "DialogManager"
3. Добавьте компонент `DialogManager`
4. В свойстве `Dialog Box Prefab` перетащите префаб DialogBox из папки prefabs

### 2.2 Позиционирование
- Разместите DialogManager где удобно (он будет невидим в игре)
- Обычно размещают в корне сцены или в специальной папке "Managers"

## Шаг 3: Интеграция с существующими системами

### 3.1 Интеграция с TraderInteraction
Код уже обновлен! TraderInteraction теперь автоматически показывает диалог перед открытием панели торговца.

**Настройка:**
1. Найдите объект с компонентом TraderInteraction
2. В инспекторе найдите свойство `Show Dialog Before Trading`
3. Установите галочку для включения диалогов

### 3.2 Интеграция с системой промокодов
PromoButton уже обновлен и показывает диалоги при активации промокодов.

### 3.3 Добавление диалогов к кнопке боя (опционально)
1. Найдите объект с FightButton
2. Добавьте компонент `FightDialogExtension`
3. Настройте свойства:
   - `Enable Pre Fight Dialog`: показывать диалог перед боем
   - `Enable Post Fight Dialog`: показывать диалог после боя

## Шаг 4: Создание собственных диалогов

### 4.1 Простой способ - использование готовых методов
```typescript
// В любом компоненте
const dialogManager = DialogManager.getInstance();

// Простое сообщение
dialogManager.showSimpleMessage("Капитан", "Привет, мир!", 0);

// Системное сообщение
dialogManager.showSystemMessage("Операция выполнена успешно!");

// Сообщение об ошибке
dialogManager.showError("Недостаточно ресурсов!");

// Диалог достижения
dialogManager.showAchievement("Первая победа!");
```

### 4.2 Создание кастомных диалогов
```typescript
import { DialogData } from './DialogSystem';

const customDialog: DialogData[] = [
    {
        speaker: "Персонаж 1",
        text: "Первая реплика",
        avatarIndex: 0
    },
    {
        speaker: "Персонаж 2", 
        text: "Ответ",
        avatarIndex: 1
    }
];

dialogManager.showDialog(customDialog, () => {
    console.log("Диалог завершен!");
});
```

### 4.3 Использование утилит для создания диалогов
```typescript
import { DialogUtils, DialogCharacters } from './DialogUtils';

// Монолог
const monologue = DialogUtils.createMonologue(
    "Капитан", 
    ["Первая фраза", "Вторая фраза"], 
    DialogCharacters.CAPTAIN
);

// Беседа между двумя персонажами
const conversation = DialogUtils.createConversation(
    "Капитан", "ИИ",
    DialogCharacters.CAPTAIN, DialogCharacters.AI_SHIP,
    ["Вопрос капитана", "Ответ ИИ", "Реплика капитана"]
);
```

## Шаг 5: Демонстрация системы

### 5.1 Использование DialogDemo
1. Создайте пустой GameObject в сцене
2. Добавьте компонент `DialogDemo`
3. Создайте 4 кнопки в UI
4. Назначьте кнопки в соответствующие поля DialogDemo:
   - Welcome Button
   - Fight Button
   - Trader Button
   - Custom Button

### 5.2 Создание тестовых кнопок
```typescript
// Пример создания кнопки для тестирования
private createTestButton() {
    const dialogManager = DialogManager.getInstance();
    if (dialogManager) {
        dialogManager.showDialog(DialogPresets.getWelcomeDialog());
    }
}
```

## Шаг 6: Настройка аватаров персонажей

### 6.1 Подготовка изображений
- Размер: рекомендуется 256x256 пикселей
- Формат: PNG с прозрачностью
- Стиль: соответствующий общему дизайну игры

### 6.2 Импорт в Cocos Creator
1. Поместите изображения в папку `assets/images/Characters/`
2. Выберите изображение в Project панели
3. В Inspector установите Type: `Sprite Frame`
4. Настройте другие параметры по необходимости

### 6.3 Назначение аватаров
Назначьте SpriteFrame в массив Avatars компонента DialogSystem в следующем порядке:
- 0: Капитан/Главный герой
- 1: ИИ корабля/Система
- 2: Сканер/Радар/Предупреждения
- 3: Торговец/NPC
- 4: Враг/Угроза

## Шаг 7: Расширенные возможности

### 7.1 Добавление звуковых эффектов
```typescript
// В DialogSystem.ts можно добавить:
import { AudioSource } from 'cc';

// Воспроизведение звука при смене диалога
private playDialogSound() {
    const audioSource = this.getComponent(AudioSource);
    if (audioSource) {
        audioSource.play();
    }
}
```

### 7.2 Анимация появления диалогов
```typescript
// В DialogSystem.ts
import { tween, Vec3 } from 'cc';

onLoad() {
    // Анимация появления
    this.node.scale = Vec3.ZERO;
    tween(this.node)
        .to(0.3, { scale: Vec3.ONE }, { easing: 'backOut' })
        .start();
}
```

### 7.3 Эффект печатающего текста
```typescript
// Добавить в DialogSystem.ts
private typeWriter(text: string, label: Label, speed: number = 50) {
    label.string = '';
    let currentIndex = 0;
    
    const typeInterval = setInterval(() => {
        if (currentIndex < text.length) {
            label.string += text[currentIndex];
            currentIndex++;
        } else {
            clearInterval(typeInterval);
        }
    }, 1000 / speed);
}
```

## Шаг 8: Отладка и тестирование

### 8.1 Проверочный список
- [ ] DialogManager добавлен в сцену
- [ ] DialogBox префаб назначен в DialogManager
- [ ] Аватары назначены в DialogSystem
- [ ] Структура DialogBox корректна
- [ ] Тестовые диалоги работают

### 8.2 Частые проблемы и решения

**Проблема:** Диалог не появляется
- Проверьте, что DialogManager.getInstance() возвращает не null
- Убедитесь, что prefab назначен в DialogManager

**Проблема:** Аватар не отображается
- Проверьте индекс аватара (должен быть в пределах массива)
- Убедитесь, что SpriteFrame назначен в массив

**Проблема:** Клик по тексту не работает
- Проверьте, что на TextLabel есть компонент Button
- Убедитесь, что Button включен (Interactable = true)

### 8.3 Логирование для отладки
Включите отладочный вывод в DialogSystem:
```typescript
console.log("Showing dialog:", dialog.speaker, "-", dialog.text);
```

## Шаг 9: Производительность и оптимизация

### 9.1 Рекомендации
- Используйте Object Pool для диалогов если они часто создаются/уничтожаются
- Кэшируйте ссылки на часто используемые компоненты
- Избегайте создания множественных диалогов одновременно

### 9.2 Управление памятью
```typescript
// В DialogManager
private dialogPool: Node[] = [];
private maxPoolSize: number = 3;

// Переиспользование диалогов вместо постоянного создания/уничтожения
```

## Заключение

После выполнения всех шагов у вас будет полнофункциональная система диалогов, интегрированная с существующими системами игры. Система поддерживает:

- Отображение аватаров персонажей
- Интерактивный текст с переходом по клику
- Множественные диалоги в последовательности
- Готовые наборы диалогов
- Утилиты для создания кастомных диалогов
- Интеграцию с торговцем и промокодами
- Расширяемую архитектуру для будущих улучшений

Система готова к использованию и может быть легко расширена дополнительными функциями по мере необходимости.