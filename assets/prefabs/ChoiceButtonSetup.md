# Dialog Choice Button Prefab Setup Guide

## Создание префаба для кнопок выбора

### 1. Структура префаба ChoiceButton.prefab

```
ChoiceButton (Node)
├── Component: Button
├── Component: Sprite (background)
└── ButtonLabel (Node)
    └── Component: Label
```

### 2. Настройка компонентов

#### Button Component:
- **Transition**: Color Tint
- **Normal Color**: rgba(255, 255, 255, 255)
- **Pressed Color**: rgba(200, 200, 200, 255)
- **Hover Color**: rgba(230, 230, 230, 255)
- **Disabled Color**: rgba(124, 124, 124, 255)

#### Sprite Component (Background):
- **Type**: Sliced
- **Size Mode**: Custom
- **Trim**: false
- Рекомендуемая текстура: кнопка с закругленными углами

#### Label Component:
- **String**: "Choice Text"
- **Font Size**: 24
- **Line Height**: 30
- **Overflow**: Clamp
- **Horizontal Align**: Center
- **Vertical Align**: Center

### 3. Размеры и позиционирование

- **ChoiceButton Size**: (300, 60)
- **ButtonLabel Size**: (280, 50)
- **ButtonLabel Position**: (0, 0, 0)

### 4. Применение префаба

1. Создайте префаб в папке `assets/prefabs/`
2. Назначьте его в компоненте `DialogChoiceSystem`
3. Убедитесь, что у вас есть контейнер `ChoiceContainer` в диалоговом интерфейсе

### 5. Контейнер для выборов

Добавьте в ваш DialogBox следующую структуру:

```
DialogBox
├── AvatarFrame
├── TextFrame
└── ChoiceContainer (Node)
    ├── Layout: Vertical Layout Group
    ├── Spacing: 10
    └── Content Size Fitter: Vertical Fit: Preferred Size
```

### 6. Настройка Layout Group

#### Vertical Layout Group:
- **Type**: Vertical
- **Resize Mode**: Container
- **Top, Bottom, Left, Right**: 10
- **Spacing**: 10
- **Child Alignment**: Upper Center
