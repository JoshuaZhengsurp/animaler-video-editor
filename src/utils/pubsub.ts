// 定义通用的事件处理函数类型，接收任意数量的参数
type EventHandler = (...args: any[]) => void;
class EventEmitter {
    // 存储事件和对应的监听函数数组
    private events: Record<string, EventHandler[]> = {};

    /**
     * 注册一个事件监听器
     * @param type 事件名称
     * @param handler 回调函数
     */
    on(type: string, handler: EventHandler): void {
        if (!this.events[type]) {
            this.events[type] = [];
        }
        this.events[type].push(handler);
    }

    addListener(type: string, handler: EventHandler): void {
        this.on(type, handler);
    }

    /**
     * 将事件监听器添加到事件回调队列的开头
     */
    prependListener(type: string, handler: EventHandler): void {
        if (!this.events[type]) {
            this.events[type] = [];
        }
        this.events[type].unshift(handler);
    }

    /**
     * 移除指定的事件监听器
     */
    off(type: string, handler: EventHandler): void {
        if (!this.events[type]) return;
        this.events[type] = this.events[type].filter((item) => item !== handler);
    }

    /**
     * `removeListener` 是 `off` 的别名
     */
    removeListener(type: string, handler: EventHandler): void {
        this.off(type, handler);
    }

    /**
     * 触发指定事件，并传递参数给监听器
     */
    emit(type: string, ...args: any[]): void {
        if (!this.events[type]) return;
        this.events[type].forEach((handler) => {
            Reflect.apply(handler, this, args);
        });
    }

    /**
     * 注册一次性监听器，触发一次后自动移除
     */
    once(type: string, handler: EventHandler): void {
        this.on(type, this._onceWrap(type, handler, this));
    }

    /**
     * 内部方法：为 `once` 包装一个自动移除的处理函数
     * @param type 事件名称
     * @param handler 原始处理函数
     * @param target 目标对象（当前实例）
     * @returns 包装后的函数
     */
    private _onceWrap(type: string, handler: EventHandler, target: this): EventHandler {
        const state = {
            fired: false,
            handler,
            type,
            target,
        } as {
            fired: boolean;
            handler: EventHandler;
            type: string;
            target: EventEmitter;
            wrapFn?: EventHandler;
        };

        // 绑定包装函数的 this 到 state 对象
        const wrapFn = this._onceWrapper.bind(state) as EventHandler;
        state.wrapFn = wrapFn;

        return wrapFn;
    }

    /**
     * 内部包装函数的执行逻辑：
     * 1. 调用原始 handler
     * 2. 标记 fired
     * 3. 移除监听器
     */
    private _onceWrapper(
        this: {
            fired: boolean;
            handler: EventHandler;
            type: string;
            target: EventEmitter;
            wrapFn?: EventHandler;
        },
        ...args: any[]
    ): void {
        if (!this.fired) {
            this.fired = true;
            Reflect.apply(this.handler, this.target, args);
            this.target.off(this.type, this.wrapFn!);
        }
    }
}
export const eventbus = new EventEmitter();
