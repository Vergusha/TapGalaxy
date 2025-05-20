import { _decorator, Component, Node, find, CCObject } from 'cc';
import { GameManager } from './GameManager';
import { UIManager } from './UIManager';
import { CurrencyManager } from './CurrencyManager';
import { SceneController } from './SceneController';
const { ccclass, property } = _decorator;

/**
 * Этот компонент инициализирует сцену.
 * Добавьте его на главный Canvas вашей сцены.
 */
@ccclass('SceneInitializer')
export class SceneInitializer extends Component {
    start() {
        console.log("Инициализация сцены...");
        
        // Создаем новый узел для контроллера сцены
        const controllerNode = new Node('SceneControllerNode');
        // Добавляем его как дочерний элемент к Canvas
        this.node.addChild(controllerNode);
        
        // Добавляем на него SceneController
        const sceneController = controllerNode.addComponent(SceneController);
        
        console.log("Контроллер сцены создан:", sceneController ? "успешно" : "ошибка");
    }
}
