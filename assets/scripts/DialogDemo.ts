import { _decorator, Component, Node, Button } from 'cc';
import { DialogManager, DialogPresets } from './DialogManager';
import { DialogData } from './DialogSystem';
import { DialogIntegrationManager } from './DialogIntegrationManager';
import { DialogChoiceSystem, DialogChoice, DialogDataWithChoices } from './DialogChoiceSystem';
import { DialogSaveSystem } from './DialogSaveSystem';
import { DialogLocalization } from './DialogLocalization';
import { MiningDialogExtension } from './MiningDialogExtension';
import { SpaceshipDialogExtension } from './SpaceshipDialogExtension';
import { DialogCharacters } from './DialogUtils';
const { ccclass, property } = _decorator;

@ccclass('DialogDemo')
export class DialogDemo extends Component {
    // Original buttons
    @property({ type: Node })
    welcomeButton: Node = null;

    @property({ type: Node })
    fightButton: Node = null;

    @property({ type: Node })
    traderButton: Node = null;

    @property({ type: Node })
    customButton: Node = null;

    // New feature demo buttons
    @property({ type: Node })
    choiceDialogButton: Node = null;

    @property({ type: Node })
    miningDialogButton: Node = null;

    @property({ type: Node })
    spaceshipDialogButton: Node = null;

    @property({ type: Node })
    queueDialogButton: Node = null;

    @property({ type: Node })
    saveSystemButton: Node = null;

    @property({ type: Node })
    localizationButton: Node = null;

    @property({ type: Node })
    relationshipButton: Node = null;

    @property({ type: Node })
    settingsButton: Node = null;

    @property({ type: Node })
    complexScenarioButton: Node = null;    onLoad() {
        // Setup original demo buttons
        this.setupOriginalButtons();
        
        // Setup new feature demo buttons
        this.setupNewFeatureButtons();
    }

    /**
     * Setup original demo buttons
     */
    private setupOriginalButtons() {
        if (this.welcomeButton) {
            this.welcomeButton.on(Button.EventType.CLICK, this.showWelcomeDialog, this);
        }

        if (this.fightButton) {
            this.fightButton.on(Button.EventType.CLICK, this.showFightDialog, this);
        }

        if (this.traderButton) {
            this.traderButton.on(Button.EventType.CLICK, this.showTraderDialog, this);
        }

        if (this.customButton) {
            this.customButton.on(Button.EventType.CLICK, this.showCustomDialog, this);
        }
    }

    /**
     * Setup new feature demo buttons
     */
    private setupNewFeatureButtons() {
        if (this.choiceDialogButton) {
            this.choiceDialogButton.on(Button.EventType.CLICK, this.showChoiceDialog, this);
        }

        if (this.miningDialogButton) {
            this.miningDialogButton.on(Button.EventType.CLICK, this.showMiningDialog, this);
        }

        if (this.spaceshipDialogButton) {
            this.spaceshipDialogButton.on(Button.EventType.CLICK, this.showSpaceshipDialog, this);
        }

        if (this.queueDialogButton) {
            this.queueDialogButton.on(Button.EventType.CLICK, this.showQueuedDialogs, this);
        }

        if (this.saveSystemButton) {
            this.saveSystemButton.on(Button.EventType.CLICK, this.showSaveSystemDemo, this);
        }

        if (this.localizationButton) {
            this.localizationButton.on(Button.EventType.CLICK, this.showLocalizationDemo, this);
        }

        if (this.relationshipButton) {
            this.relationshipButton.on(Button.EventType.CLICK, this.showRelationshipDemo, this);
        }

        if (this.settingsButton) {
            this.settingsButton.on(Button.EventType.CLICK, this.showSettingsDemo, this);
        }

        if (this.complexScenarioButton) {
            this.complexScenarioButton.on(Button.EventType.CLICK, this.showComplexScenario, this);
        }
    }

    private showWelcomeDialog() {
        const dialogManager = DialogManager.getInstance();
        if (dialogManager) {
            dialogManager.showDialog(DialogPresets.getWelcomeDialog(), () => {
                console.log('Welcome dialog completed!');
            });
        }
    }

    private showFightDialog() {
        const dialogManager = DialogManager.getInstance();
        if (dialogManager) {
            dialogManager.showDialog(DialogPresets.getFightDialog(), () => {
                console.log('Fight dialog completed!');
                // Здесь можно запустить боевую сцену
            });
        }
    }

    private showTraderDialog() {
        const dialogManager = DialogManager.getInstance();
        if (dialogManager) {
            dialogManager.showDialog(DialogPresets.getTraderDialog(), () => {
                console.log('Trader dialog completed!');
                // Здесь можно открыть панель торговца
            });
        }
    }    private showCustomDialog() {
        const customDialogs: DialogData[] = [
            {
                speaker: "Система",
                text: "Это пример кастомного диалога.",
                avatarIndex: 1
            },
            {
                speaker: "Игрок",
                text: "Понятно! Система работает отлично.",
                avatarIndex: 0
            },
            {
                speaker: "Система",
                text: "Вы можете создавать любые диалоги, используя массив DialogData.",
                avatarIndex: 1
            }
        ];

        const dialogManager = DialogManager.getInstance();
        if (dialogManager) {
            dialogManager.showDialog(customDialogs, () => {
                console.log('Custom dialog completed!');
            });
        }
    }

    // =============================================================================
    // NEW ADVANCED FEATURE DEMOS
    // =============================================================================

    /**
     * Demo: Choice Dialog System
     */
    private showChoiceDialog() {
        const choiceDialog: DialogDataWithChoices[] = [
            {
                speaker: "Капитан",
                text: "Мы обнаружили неизвестную планету. Как поступим?",
                avatarIndex: DialogCharacters.CAPTAIN,
                choices: [
                    {
                        text: "Исследовать планету",
                        consequenceDialogs: [
                            {
                                speaker: "ИИ Корабля",
                                text: "Начинаю сканирование планеты. Обнаружены редкие минералы!",
                                avatarIndex: DialogCharacters.AI_SHIP
                            }
                        ]
                    },
                    {
                        text: "Пройти мимо",
                        consequenceDialogs: [
                            {
                                speaker: "Капитан",
                                text: "Возможно, это было правильное решение. Безопасность превыше всего.",
                                avatarIndex: DialogCharacters.CAPTAIN
                            }
                        ]
                    },
                    {
                        text: "Отправить зонд",
                        consequenceDialogs: [
                            {
                                speaker: "ИИ Корабля",
                                text: "Зонд запущен. Получаем данные о планете с безопасного расстояния.",
                                avatarIndex: DialogCharacters.AI_SHIP
                            }
                        ]
                    }
                ]
            }
        ];

        const dialogManager = DialogManager.getInstance();
        if (dialogManager) {
            dialogManager.showDialog(choiceDialog, () => {
                console.log('Choice dialog completed!');
            });
        }
    }

    /**
     * Demo: Mining Dialog Extension
     */
    private showMiningDialog() {
        const miningExtension = MiningDialogExtension.getInstance();
        if (miningExtension) {
            miningExtension.showResourceDiscoveryDialog('Кристаллы энергии', 85, () => {
                miningExtension.showMiningStartDialog('Кристаллы энергии', 120, () => {
                    setTimeout(() => {
                        miningExtension.showMiningCompleteDialog('Кристаллы энергии', 120, 98, () => {
                            console.log('Mining dialog sequence completed!');
                        });
                    }, 2000);
                });
            });
        }
    }

    /**
     * Demo: Spaceship Dialog Extension
     */
    private showSpaceshipDialog() {
        const spaceshipExtension = SpaceshipDialogExtension.getInstance();
        if (spaceshipExtension) {
            spaceshipExtension.showUpgradeConfirmationDialog('Квантовый двигатель', 5000, () => {
                spaceshipExtension.showSystemDiagnosticsDialog(95, 78, 88, () => {
                    spaceshipExtension.showHyperjumpPreparationDialog(3, 'Проксима Центавра', () => {
                        console.log('Spaceship dialog sequence completed!');
                    });
                });
            });
        }
    }

    /**
     * Demo: Queued Dialogs
     */
    private showQueuedDialogs() {
        const integrationManager = DialogIntegrationManager.getInstance();
        if (integrationManager) {
            // Добавить несколько диалогов в очередь
            integrationManager.showMiningDialog('Титановая руда', 50);
            integrationManager.showFightDialog('Пиратский корвет');
            integrationManager.showShipUpgradeDialog('Энергетический щит', 3000);
            
            console.log('Multiple dialogs queued for sequential display!');
        }
    }

    /**
     * Demo: Save System
     */
    private showSaveSystemDemo() {
        const saveSystem = DialogSaveSystem.getInstance();
        if (saveSystem) {
            // Показать диалог с сохранением прогресса
            const progressDialog: DialogData[] = [
                {
                    speaker: "Система",
                    text: "Этот диалог будет сохранен автоматически.",
                    avatarIndex: DialogCharacters.AI_SHIP
                },
                {
                    speaker: "Система",
                    text: "Вы можете выйти и вернуться - прогресс сохранится.",
                    avatarIndex: DialogCharacters.AI_SHIP
                },
                {
                    speaker: "Система",
                    text: "Также сохраняются настройки и отношения с персонажами.",
                    avatarIndex: DialogCharacters.AI_SHIP
                }
            ];

            const dialogManager = DialogManager.getInstance();
            if (dialogManager) {
                dialogManager.showDialog(progressDialog, () => {
                    // Демонстрация изменения отношений
                    saveSystem.updateCharacterRelationship('ai_ship', 10);
                    saveSystem.updateCharacterRelationship('captain', 5);
                    console.log('Dialog progress and relationships saved!');
                }, true, 'save_demo');
            }
        }
    }

    /**
     * Demo: Localization System
     */
    private showLocalizationDemo() {
        // Показать локализованный диалог
        const localizedDialog = DialogPresets.getLocalizedWelcomeDialog();
        
        const dialogManager = DialogManager.getInstance();
        if (dialogManager) {
            dialogManager.showDialog(localizedDialog, () => {
                console.log('Localized dialog completed!');
            });
        }
    }

    /**
     * Demo: Character Relationships
     */
    private showRelationshipDemo() {
        const saveSystem = DialogSaveSystem.getInstance();
        if (saveSystem) {
            const aiRelationship = saveSystem.getCharacterRelationship('ai_ship');
            const captainRelationship = saveSystem.getCharacterRelationship('captain');

            const relationshipDialog: DialogData[] = [
                {
                    speaker: "ИИ Корабля",
                    text: `Текущий уровень доверия ко мне: ${aiRelationship}`,
                    avatarIndex: DialogCharacters.AI_SHIP
                },
                {
                    speaker: "Капитан",
                    text: `Мой авторитет среди экипажа: ${captainRelationship}`,
                    avatarIndex: DialogCharacters.CAPTAIN
                },
                {
                    speaker: "ИИ Корабля",
                    text: "Отношения влияют на доступные диалоги и действия.",
                    avatarIndex: DialogCharacters.AI_SHIP
                }
            ];

            const dialogManager = DialogManager.getInstance();
            if (dialogManager) {
                dialogManager.showDialog(relationshipDialog, () => {
                    // Улучшить отношения после диалога
                    saveSystem.updateCharacterRelationship('ai_ship', 2);
                    saveSystem.updateCharacterRelationship('captain', 1);
                    console.log('Relationship dialog completed!');
                });
            }
        }
    }

    /**
     * Demo: Settings System
     */
    private showSettingsDemo() {
        const saveSystem = DialogSaveSystem.getInstance();
        if (saveSystem) {
            const settings = saveSystem.getSettings();
            
            const settingsDialog: DialogData[] = [
                {
                    speaker: "Система",
                    text: "Демонстрация системы настроек:",
                    avatarIndex: DialogCharacters.AI_SHIP
                },
                {
                    speaker: "Система",
                    text: `Эффект печатной машинки: ${settings.enableTypewriter ? 'Включен' : 'Выключен'}`,
                    avatarIndex: DialogCharacters.AI_SHIP
                },
                {
                    speaker: "Система",
                    text: `Скорость печати: ${settings.typewriterSpeed}`,
                    avatarIndex: DialogCharacters.AI_SHIP
                },
                {
                    speaker: "Система",
                    text: `Звуки: ${settings.enableSounds ? 'Включены' : 'Выключены'}`,
                    avatarIndex: DialogCharacters.AI_SHIP
                }
            ];

            const dialogManager = DialogManager.getInstance();
            if (dialogManager) {
                dialogManager.showDialog(settingsDialog, () => {
                    // Изменить настройки для демонстрации
                    saveSystem.updateSettings({
                        typewriterSpeed: settings.typewriterSpeed + 10
                    });
                    console.log('Settings demo completed!');
                });
            }
        }
    }

    /**
     * Demo: Complex Scenario
     */
    private showComplexScenario() {
        const saveSystem = DialogSaveSystem.getInstance();
        const aiRelationship = saveSystem?.getCharacterRelationship('ai_ship') || 0;
        
        const complexDialog: DialogDataWithChoices[] = [
            {
                speaker: "ИИ Корабля",
                text: "КРИТИЧЕСКАЯ СИТУАЦИЯ! Обнаружен астероид на курсе столкновения!",
                avatarIndex: DialogCharacters.AI_SHIP
            },
            {
                speaker: "Капитан",
                text: "Какие у нас варианты?",
                avatarIndex: DialogCharacters.CAPTAIN,
                choices: [
                    {
                        text: "Уклониться маневром",
                        condition: () => aiRelationship >= 20, // Доступно при хороших отношениях с ИИ
                        consequenceDialogs: [
                            {
                                speaker: "ИИ Корабля",
                                text: "Благодаря нашему взаимопониманию, выполняю точный маневр уклонения!",
                                avatarIndex: DialogCharacters.AI_SHIP
                            }
                        ]
                    },
                    {
                        text: "Уничтожить астероид",
                        consequenceDialogs: [
                            {
                                speaker: "ИИ Корабля",
                                text: "Заряжаю орудия. Астероид уничтожен, но энергия истощена.",
                                avatarIndex: DialogCharacters.AI_SHIP
                            }
                        ]
                    },
                    {
                        text: "Экстренный гиперпрыжок",
                        consequenceDialogs: [
                            {
                                speaker: "ИИ Корабля",
                                text: "ВНИМАНИЕ! Незапланированный прыжок может повредить двигатели!",
                                avatarIndex: DialogCharacters.AI_SHIP
                            }
                        ]
                    }
                ]
            }
        ];

        const dialogManager = DialogManager.getInstance();
        if (dialogManager) {
            dialogManager.showDialog(complexDialog, () => {
                // Сохранить результат сложного сценария
                if (saveSystem) {
                    saveSystem.updateCharacterRelationship('ai_ship', 3);
                    saveSystem.updateGameProgress('asteroidEvent', true);
                }
                console.log('Complex scenario completed with relationship and progress updates!');
            }, true, 'complex_asteroid_scenario');
        }
    }    onDestroy() {
        // Clean up original button event handlers
        if (this.welcomeButton) {
            this.welcomeButton.off(Button.EventType.CLICK, this.showWelcomeDialog, this);
        }
        if (this.fightButton) {
            this.fightButton.off(Button.EventType.CLICK, this.showFightDialog, this);
        }
        if (this.traderButton) {
            this.traderButton.off(Button.EventType.CLICK, this.showTraderDialog, this);
        }
        if (this.customButton) {
            this.customButton.off(Button.EventType.CLICK, this.showCustomDialog, this);
        }

        // Clean up new feature button event handlers
        if (this.choiceDialogButton) {
            this.choiceDialogButton.off(Button.EventType.CLICK, this.showChoiceDialog, this);
        }
        if (this.miningDialogButton) {
            this.miningDialogButton.off(Button.EventType.CLICK, this.showMiningDialog, this);
        }
        if (this.spaceshipDialogButton) {
            this.spaceshipDialogButton.off(Button.EventType.CLICK, this.showSpaceshipDialog, this);
        }
        if (this.queueDialogButton) {
            this.queueDialogButton.off(Button.EventType.CLICK, this.showQueuedDialogs, this);
        }
        if (this.saveSystemButton) {
            this.saveSystemButton.off(Button.EventType.CLICK, this.showSaveSystemDemo, this);
        }
        if (this.localizationButton) {
            this.localizationButton.off(Button.EventType.CLICK, this.showLocalizationDemo, this);
        }
        if (this.relationshipButton) {
            this.relationshipButton.off(Button.EventType.CLICK, this.showRelationshipDemo, this);
        }
        if (this.settingsButton) {
            this.settingsButton.off(Button.EventType.CLICK, this.showSettingsDemo, this);
        }
        if (this.complexScenarioButton) {
            this.complexScenarioButton.off(Button.EventType.CLICK, this.showComplexScenario, this);
        }
    }
}
