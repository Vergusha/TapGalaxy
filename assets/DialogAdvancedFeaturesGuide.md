# Dialog System Advanced Features Setup Guide

## Overview
This guide covers the setup and usage of all advanced features added to the Dialog System, including choice dialogs, save system, localization, character relationships, and game system integrations.

## 🎯 Quick Start Checklist

### 1. Basic Setup Requirements
- [ ] DialogBox prefab configured with proper hierarchy
- [ ] DialogManager component added to scene
- [ ] All dialog extension scripts imported

### 2. Choice Dialog System Setup
- [ ] Create ChoiceButton prefab
- [ ] Add ChoiceContainer to DialogBox prefab
- [ ] Configure DialogChoiceSystem component

### 3. Save System Setup
- [ ] Ensure localStorage support enabled
- [ ] Configure auto-save settings
- [ ] Set up backup preferences

### 4. Localization Setup
- [ ] Create language resource files
- [ ] Configure default language
- [ ] Set up string formatting system

## 📝 Detailed Setup Instructions

### Choice Dialog System

#### 1. Create ChoiceButton Prefab
```
Create new UI Button prefab with:
- Button component
- Label child node for text
- Background image/sprite
- Proper sizing for choice text
```

#### 2. Configure DialogBox Prefab
```
DialogBox
├── AvatarFrame
│   └── Avatar (Sprite)
├── TextFrame
│   ├── TextLabel (Label)
│   └── ChoiceContainer (Node) ← ADD THIS
└── DialogChoiceSystem (Component) ← ADD THIS
```

#### 3. DialogChoiceSystem Properties
- **Choice Button Prefab**: Reference to your ChoiceButton prefab
- **Choice Container**: Reference to ChoiceContainer node

#### 4. Usage Example
```typescript
const choiceDialog: DialogDataWithChoices[] = [
    {
        speaker: "Captain",
        text: "What should we do?",
        avatarIndex: 0,
        choices: [
            {
                text: "Attack",
                consequenceDialogs: [{ speaker: "AI", text: "Attacking!", avatarIndex: 1 }]
            },
            {
                text: "Retreat",
                condition: () => playerLevel >= 5, // Conditional choice
                consequenceDialogs: [{ speaker: "AI", text: "Retreating safely.", avatarIndex: 1 }]
            }
        ]
    }
];
```

### Save System

#### 1. Auto-Save Configuration
```typescript
// In DialogManager component
@property({ type: Boolean, displayName: "Enable Auto Save" })
enableAutoSave: boolean = true;
```

#### 2. Manual Save/Load
```typescript
const saveSystem = DialogSaveSystem.getInstance();

// Save dialog progress
saveSystem.saveDialogProgress('dialog_id', currentIndex, isCompleted);

// Load dialog progress
const progress = saveSystem.loadDialogProgress('dialog_id');

// Save character relationships
saveSystem.updateCharacterRelationship('ai_ship', 10);

// Save game progress
saveSystem.updateGameProgress('mission_complete', true);
```

#### 3. Settings Management
```typescript
// Update dialog settings
saveSystem.updateSettings({
    enableTypewriter: true,
    typewriterSpeed: 50,
    enableSounds: true,
    enableAnimations: true
});
```

### Localization System

#### 1. Create Language Resource Files
Create JSON files in `assets/resources/localization/`:

**en.json**
```json
{
    "characters": {
        "captain": "Captain",
        "ai_ship": "Ship AI",
        "trader": "Trader"
    },
    "combat": {
        "enemy_detected": "Enemy ship detected!",
        "systems_ready": "All systems ready for combat.",
        "victory": "Victory! Enemy defeated."
    },
    "trade": {
        "welcome": "Welcome to the trading post!",
        "purchase_complete": "Purchase completed successfully."
    },
    "mining": {
        "resource_found": "Resource deposit discovered: {0}",
        "mining_complete": "Mining operation completed. Collected {0} units."
    }
}
```

**ru.json**
```json
{
    "characters": {
        "captain": "Капитан",
        "ai_ship": "ИИ Корабля",
        "trader": "Торговец"
    },
    "combat": {
        "enemy_detected": "Обнаружен вражеский корабль!",
        "systems_ready": "Все системы готовы к бою.",
        "victory": "Победа! Враг повержен."
    }
}
```

#### 2. Usage in Dialogs
```typescript
const localization = DialogLocalization.getInstance();

const localizedDialog: DialogData[] = [
    {
        speaker: localization.getString('characters.captain'),
        text: localization.formatString('mining.resource_found', ['Crystal Energy']),
        avatarIndex: DialogCharacters.CAPTAIN
    }
];
```

### Character Relationship System

#### 1. Initialize Relationships
```typescript
const saveSystem = DialogSaveSystem.getInstance();

// Set initial relationship values
saveSystem.updateCharacterRelationship('ai_ship', 50);
saveSystem.updateCharacterRelationship('captain', 30);
saveSystem.updateCharacterRelationship('trader', 0);
```

#### 2. Conditional Dialog Based on Relationships
```typescript
const aiRelationship = saveSystem.getCharacterRelationship('ai_ship');

const conditionalChoice: DialogChoice = {
    text: "Ask AI for help",
    condition: () => aiRelationship >= 20,
    consequenceDialogs: [
        {
            speaker: "Ship AI",
            text: "Of course, Captain. Our partnership is strong.",
            avatarIndex: DialogCharacters.AI_SHIP
        }
    ]
};
```

### Game System Integration

#### 1. Mining System Integration
```typescript
const miningExtension = MiningDialogExtension.getInstance();

// Resource discovery dialog
miningExtension.showResourceDiscoveryDialog('Titanium Ore', 75, () => {
    console.log('Player discovered titanium ore');
});

// Mining operation dialogs
miningExtension.showMiningStartDialog('Titanium Ore', 120);
miningExtension.showMiningCompleteDialog('Titanium Ore', 120, 95);

// Efficiency and hazard dialogs
miningExtension.showEfficiencyReportDialog('Titanium Ore', 87, 'Good');
miningExtension.showHazardWarningDialog('Gas Leak', 'Medium');
```

#### 2. Spaceship System Integration
```typescript
const spaceshipExtension = SpaceshipDialogExtension.getInstance();

// Upgrade dialogs
spaceshipExtension.showUpgradeConfirmationDialog('Quantum Drive', 5000);
spaceshipExtension.showRepairStatusDialog('Hull Damage', 45, 180);

// System diagnostics
spaceshipExtension.showSystemDiagnosticsDialog(95, 78, 88);

// Critical system dialogs
spaceshipExtension.showCriticalFailureDialog('Life Support', 'Immediate');
spaceshipExtension.showPowerManagementDialog(23, 45);
```

#### 3. Dialog Queue System
```typescript
const integrationManager = DialogIntegrationManager.getInstance();

// Queue multiple dialogs for sequential display
integrationManager.showMiningDialog('Iron Ore', 30);
integrationManager.showFightDialog('Pirate Corvette');
integrationManager.showShipUpgradeDialog('Energy Shield', 2500);

// Dialogs will be shown one after another without overlap
```

## 🎮 Demo Scene Setup

### DialogDemo Component Properties
In the DialogDemo component, assign the following UI buttons:

**Original Features:**
- welcomeButton → Basic welcome dialog
- fightButton → Combat dialog
- traderButton → Trading dialog  
- customButton → Custom dialog example

**New Advanced Features:**
- choiceDialogButton → Branching choice dialog
- miningDialogButton → Mining system integration
- spaceshipDialogButton → Spaceship management
- queueDialogButton → Queued dialog system
- saveSystemButton → Save/load demonstration
- localizationButton → Multi-language support
- relationshipButton → Character relationships
- settingsButton → Dialog settings management
- complexScenarioButton → Advanced scenario with conditions

### UI Layout Suggestion
```
Dialog Demo Panel
├── Basic Features Section
│   ├── Welcome Dialog Button
│   ├── Fight Dialog Button
│   ├── Trader Dialog Button
│   └── Custom Dialog Button
└── Advanced Features Section
    ├── Choice Dialog Button
    ├── Mining Dialog Button
    ├── Spaceship Dialog Button
    ├── Queue Dialog Button
    ├── Save System Button
    ├── Localization Button
    ├── Relationship Button
    ├── Settings Button
    └── Complex Scenario Button
```

## ⚙️ Configuration Options

### DialogManager Settings
```typescript
@property({ type: Boolean, displayName: "Enable Auto Save" })
enableAutoSave: boolean = true;

@property({ type: Boolean, displayName: "Enable Localization" })
enableLocalization: boolean = true;
```

### Save System Settings
- **Auto-save interval**: Configurable via DialogSaveSystem
- **Backup retention**: Number of backup saves to keep
- **Character relationship decay**: Optional relationship degradation over time

### Localization Settings
- **Default language**: Set in DialogLocalization component
- **Language detection**: Automatic system language detection
- **Fallback behavior**: What to do when translation is missing

## 🔧 Troubleshooting

### Common Issues

1. **Choice buttons not appearing**
   - Check ChoiceButton prefab assignment
   - Verify ChoiceContainer is properly configured
   - Ensure DialogChoiceSystem component is added

2. **Save system not working**
   - Verify localStorage is enabled in browser/platform
   - Check console for save/load errors
   - Ensure DialogSaveSystem component is initialized

3. **Localization strings not loading**
   - Verify JSON files are in correct path
   - Check file format and syntax
   - Ensure language code matches file names

4. **Dialog queue not processing**
   - Check DialogIntegrationManager is initialized
   - Verify no infinite dialog loops
   - Check for dialog system conflicts

### Performance Optimization

1. **Preload language files** during game initialization
2. **Cache dialog instances** for frequently used dialogs
3. **Limit queue size** to prevent memory issues
4. **Use object pooling** for choice buttons

## 📚 API Reference

### Core Classes
- `DialogManager` - Main dialog system controller
- `DialogIntegrationManager` - Game system integration
- `DialogChoiceSystem` - Branching dialog choices
- `DialogSaveSystem` - Persistent state management
- `DialogLocalization` - Multi-language support
- `MiningDialogExtension` - Mining system dialogs
- `SpaceshipDialogExtension` - Spaceship system dialogs

### Key Interfaces
- `DialogData` - Basic dialog data structure
- `DialogDataWithChoices` - Extended dialog with choices
- `DialogChoice` - Individual choice configuration
- `DialogSettings` - Save system settings

This comprehensive system provides a robust foundation for creating engaging, persistent, and localized dialog experiences in your Cocos Creator game.
