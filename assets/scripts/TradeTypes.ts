// Interface definitions for trade-related types
export interface TradeItemDetails {
    id: string; // Уникальный идентификатор
    name: string;
    description: string;
    icon: string; // Путь к иконке в 'resources', например, 'icons/trade_lunar'

    costDilithium?: number; // Стоимость в дилитии для покупки/улучшения
    costLunar?: number;     // Стоимость в лунарах для покупки/улучшения

    exchangeOutputLunar?: number; // Сколько лунаров игрок получает при обмене

    passiveLunarIncomeBonus?: number; // Пассивный доход лунаров в секунду от этого улучшения
    
    currentLevel: number;
    maxLevel?: number; // Максимальный уровень, если есть
}
