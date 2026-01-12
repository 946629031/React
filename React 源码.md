## 提前思考以下问题

1. 为什么组件重新渲染执行state的值不是初始化的值?

2. 为什么setState能触发更新?

3. 为什么定义hook不能在条件语句中?

4. 为什么setState是异步的，为什么要异步?

5. 如果子组件内的state未发生变更, 由于父组件的重新渲染导致的渲染子组件是否会进行diff?

## fiber

React16 之后，React引入了React fiber， fiber架构可以分成三层  
- Scheduler（调度）  
- Reconciler（协调）  
- Renderer（渲染）  

其中 Reconciler（协调器）的作用是收集变化的组件，最终让 Renderer（渲染器）将变化的组件渲染的页面当中。这个收集变化的组件的过程我们称为 render（协调）阶段。在此阶段，React 会遍历 current fiber tree 并将 fiber 节点与对应的 React element 进行对比（也就是我们常说的diff），构造出新的 fiber tree

Reconciler起作用的阶段称为render阶段，Renderer起作用的阶段称为commit阶段

## 双Fiber树

1. 屏幕上显示内容对应的Fiber树称为current Fiber树，可以理解成真实dom  
2. 正在内存中构建的Fiber树称为workInProgress Fiber树  

每次状态更新都会产生新的workInProgress Fiber树，通过current与workInProgress的替换，完成DOM更新



## useState

1. 初始化时，会调用所有的hook，生成hook链表。  
   Hooks是以单向链表的形式存储在 Fiber 的 memoizedState 属性身上。  
   同时，每个hooks又拥有自己的更新队列queue，queue.pending 会指向一个环状链表。

2. 更新时，处理当前set操作优先级，按优先级计算出state是否发生变更及是否应该更新节点。


   ```ts
   useState < S > (initialState: (() => S) | S, ): [S, Dispatch < BasicStateAction < S >> ] {
      currentHookNameInDev = 'useState';
      mountHookTypesDev();
      const prevDispatcher = ReactCurrentDispatcher.current;
      ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnMountInDEV;
      try { // 第一次调用 
         return mountState(initialState);
      } finally {
         ReactCurrentDispatcher.current = prevDispatcher;
      }
   },

   function mountState < S > (
      initialState: (() => S) | S,
   ): [S, Dispatch < BasicStateAction < S >> ] {

      // 创建hook对象
      // hook对象的数据结构为：
      // {
      // baseQueue: null,
      // baseState: 'hook1',
      // memoizedState: null,
      // queue: null,
      // next: {
      // baseQueue: null,
      // baseState: 'hook2',
      // memoizedState: null,
      // next: null 【next指向下一个hook】
      // queue: null
      // }


      const hook = mountWorkInProgressHook(); // 初次渲染调用 mountWorkInProgressHook 构建 hook 链表节点
      if (typeof initialState === 'function') {
         // $FlowFixMe: Flow doesn't like mixed types
         initialState = initialState();
      }
      hook.memoizedState = hook.baseState = initialState;
      const queue = (hook.queue = {
         pending: null,
         dispatch: null,
         lastRenderedReducer: basicStateReducer,
         lastRenderedState: (initialState: any),
      });
      const dispatch: Dispatch <
      BasicStateAction < S > ,
      > = (queue.dispatch = (dispatchAction.bind(null, currentlyRenderingFiber, queue, ): any));
      // hook对象的memoizedState储存state，dispatch更新state的方法，并返回一个数组的结构
      return [hook.memoizedState, dispatch];
   }
   ```

   - hook的挂载位置
      - packages\react\src\ReactCurrentDispatcher.js
     ```ts
     import ReactCurrentDispatcher from './ReactCurrentDispatcher';
      type BasicStateAction < S > = (S => S) | S;
      type Dispatch < A > = A => void;

      function resolveDispatcher() {
         const dispatcher = ReactCurrentDispatcher.current;
         return dispatcher;
      }
      export function useState < S > (
         initialState: (() => S) | S, 
         ): [S, Dispatch < BasicStateAction < S >> ] {
         const dispatcher = resolveDispatcher();
         return dispatcher.useState(initialState);
      }
     ```
3. 无论是初次挂载还是更新，每调用一次hooks函数，都会产生一个hook对象与之对应。以下是hook对象的结构。
   ```ts
   {
      baseQueue: null, // 未处理的 update 队列（一般是上一轮渲染未完成的 update）
      baseState: 'hook1',
      memoizedState: null, // 值 
      queue: null, // 当前出发的 update 队列 
      next: {
         baseQueue: null,
         baseState: 'hook2',
         memoizedState: null,
         queue: null,
         next: {
            baseQueue: null,
            baseState: 'hook3',
            memoizedState: null,
            queue: null,
            next: {
               baseQueue: null,
               baseState: null,
               memoizedState: 'hook4',
               next: null,
               queue: null
            }
         }
      }
   }
   ```
4.fiber 的主要属性如下：
   ```ts
   var FiberNode = {
      tag = tag; // 组件类型 
      key = key; // 组件props上的key 
      elementType = null; // ReactElement.type 组件的dom类型， 比如`div, p` 
      type = null; // 异步组件resolved之后返回的内容 
      stateNode = null; // 在浏览器环境对应dom节点 
   
      return = null; // 指向父节点 
      child = null; // 孩子节点 
      sibling = null; // 兄弟节点， 兄弟节点的return指向同一个父节点 
      
      index = 0; 
      ref = null; // ref 
      pendingProps = pendingProps; // 新的props 
      memoizedProps = null; // 上一次渲染完成的props 
      updateQueue = null; // 组件产生的update信息会放在这个队列 
      memoizedState = null; // 在函数组件中，memoizedState用于保存hook链表 
      dependencies = null;
      mode = mode; // Effects 
      
      flags = NoFlags; // 相当于之前的effectTag， 记录side effect类型 
      nextEffect = null; // 单链表结构， 便于快速查找下一个side effect 
      firstEffect = null; // fiber中第一个side effect 
      lastEffect = null; // fiber中最后一个side effect 
      lanes = NoLanes; // 优先级相关 
      childLanes = NoLanes; // 优先级相关 
      alternate = null; // 对应的是current fiber
   }
   ```

   - renderWithHooks
     ```ts
     export function renderWithHooks < Props, SecondArg > (
         current: Fiber | null,
         workInProgress: Fiber,
         Component: (p: Props, arg: SecondArg) => any,
         props: Props,
         secondArg: SecondArg,
         nextRenderLanes: Lanes
      ): any {
         renderLanes = nextRenderLanes;
         currentlyRenderingFiber = workInProgress;
         if (__DEV__) {
            hookTypesDev = current !== null ? ((current._debugHookTypes: any): Array < HookType > ) : null;
            hookTypesUpdateIndexDev = -1; // Used for hot reloading: 
            ignorePreviousDependencies = current !== null && current.type !== workInProgress.type;
         }
         workInProgress.memoizedState = null;
         workInProgress.updateQueue = null;
         workInProgress.lanes = NoLanes;
         if (__DEV__) {
            if (current !== null && current.memoizedState !== null) {
               ReactCurrentDispatcher.current = HooksDispatcherOnUpdateInDEV;
            } else if (hookTypesDev !== null) {
               ReactCurrentDispatcher.current = HooksDispatcherOnMountWithHookTypesInDEV;
            } else {
               ReactCurrentDispatcher.current = HooksDispatcherOnMountInDEV;
            }
         } else {
            ReactCurrentDispatcher.current =
               current === null || current.memoizedState === null ?
               HooksDispatcherOnMount :
               HooksDispatcherOnUpdate;
         }
         // 以下省略
     ```

5.useState更新阶段的调用
   - 更新阶段调用HooksDispatcherOnUpdateInDEV里的hook
      ```ts
      HooksDispatcherOnUpdateInDEV = {
         useState < S > (initialState: (() => S) | S, ): [S, Dispatch < BasicStateAction < S >> ] {
            currentHookNameInDev = 'useState';
            updateHookTypesDev();
            const prevDispatcher = ReactCurrentDispatcher.current;
            ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnUpdateInDEV;
            try {
               return updateState(initialState);
            } finally {
               ReactCurrentDispatcher.current = prevDispatcher;
            }
         },
         useCallback < T > (callback: T, deps: Array < mixed > | void | null): T {
            currentHookNameInDev = 'useCallback';
            updateHookTypesDev();
            return updateCallback(callback, deps);
         },
         // 以下省略 
         // ----updateState 
      
         function updateState < S > (
            initialState: (() => S) | S,
         ): [S, Dispatch < BasicStateAction < S >> ] {
            return updateReducer(basicStateReducer, (initialState: any));
         }
      ```

      - 实际执行的是updateReducer
      ```ts
      function updateReducer < S, I, A > (
         reducer: (S, A) => S,
         initialArg: I,
         init ? : I => S,
      ): [S, Dispatch < A > ] {
         // updateWorkInProgressHook 的作用主要是取出 current fiber 中的 hooks 链表中对应的 hook 节点，挂载到 workInProgress 
         const hook = updateWorkInProgressHook();
         const queue = hook.queue;
         queue.lastRenderedReducer = reducer;
         const current: Hook = (currentHook: any);
         let baseQueue = current.baseQueue;
         const pendingQueue = queue.pending;
         if (pendingQueue !== null) {
            if (baseQueue !== null) {
               const baseFirst = baseQueue.next;
               const pendingFirst = pendingQueue.next;
               baseQueue.next = pendingFirst;
               pendingQueue.next = baseFirst;
            }
            current.baseQueue = baseQueue = pendingQueue;
            queue.pending = null;
         }
         if (baseQueue !== null) {
            const first = baseQueue.next;
            let newState = current.baseState;
            let newBaseState = null;
            let newBaseQueueFirst = null;
            let newBaseQueueLast = null;
            let update = first;
            do {
               const updateLane = update.lane;
               // 优先级提取update 
               if (!isSubsetOfLanes(renderLanes, updateLane)) {
                  // 优先级不够: 加入到baseQueue中, 等待下一次render
      
                  const clone: Update < S, A > = {
                     lane: updateLane,
                     action: update.action,
                     eagerReducer: update.eagerReducer,
                     eagerState: update.eagerState,
                     next: (null: any),
                  };
                  if (newBaseQueueLast === null) {
                     newBaseQueueFirst = newBaseQueueLast = clone;
                     newBaseState = newState;
                  } else {
                     newBaseQueueLast = newBaseQueueLast.next = clone;
                  }
                  currentlyRenderingFiber.lanes = mergeLanes(currentlyRenderingFiber.lanes,
                     updateLane, );
                  markSkippedUpdateLanes(updateLane);
               } else {
                  if (newBaseQueueLast !== null) {
                     const clone: Update < S, A > = {
                        lane: NoLane,
                        action: update.action,
                        eagerReducer: update.eagerReducer,
      
                        eagerState: update.eagerState,
                        next: (null: any),
                     };
                     newBaseQueueLast = newBaseQueueLast.next = clone;
                  }
                  if (update.eagerReducer === reducer) {
                     newState = ((update.eagerState: any): S);
                  } else {
                     const action = update.action; // 调用reducer获取最新状态 
                     newState = reducer(newState, action);
                  }
               }
               update = update.next;
            }
            while (update !== null && update !== first);
            if (newBaseQueueLast === null) {
               newBaseState = newState;
            } else {
               newBaseQueueLast.next = (newBaseQueueFirst: any);
            }
            if (!is(newState, hook.memoizedState)) {
               markWorkInProgressReceivedUpdate();
            }
            // 把计算之后的结果更新到workInProgressHook上
            hook.memoizedState = newState;
            hook.baseState = newBaseState;
            hook.baseQueue = newBaseQueueLast;
            queue.lastRenderedState = newState;
         }
         const dispatch: Dispatch < A > = (queue.dispatch: any);
         return [hook.memoizedState, dispatch];
      }
      ```

     - 执行setCount后，内部发生了什么？ dispatch
       ```ts
       const [count, setCount] = useState(1);
         const dispatch: Dispatch <
            BasicStateAction < S > ,
            > = (queue.dispatch = (dispatchAction.bind(
               null,
               currentlyRenderingFiber,
               queue,
            ): any));
      ```
      - dispatchAction packages\react-reconciler\src\ReactFiberHooks.new.js
         dispatchAction方法内调用 scheduleUpdateOnFiber markStateUpdateScheduled 方法开始进行任务调度，进而触发
         updateFunctionComponent方法
      - 多次执行setCount，它是怎么样取到最新的值的？
      
         setCount(2)
         setCount(3)
         setCount(4)
      
   多次调用setCount形成环状链表，updateReducer遍历该环状链表

   ```ts
   // updateReducer核心代码
   var pendingQueue = queue.pending;
   if (pendingQueue !== null) {
      // first是update(1)
      var first = pendingQueue.next;
      var newState = null;
      var update = first;
      
      // 循环遍历，是更新阶段的核心和关键， 
      do {
         var action = update.action;
         // reducer 获取最新值 
         newState = reducer(newState, action);
         // 然后遍历下一个update 
         update = update.next;
      } while (update !== null && update !== first);
      // 最新的状态值赋值给memoizedState
      hook.memoizedState = newState;
   }
   ```

6.总结： import {useState} from 'react';
   - useState实际是从packages\react\src\ReactHooks.js导出
   - 调用useState传入初始值，初始化时调用的是mountState，const hook =mountWorkInProgressHook()，初次渲染调用 mountWorkInProgressHook 构建 hook 链表
   - 返回[hook.memoizedState, dispatch]的数组结构
   - 更新阶段实际调用的是updateReducer，const hook = updateWorkInProgressHook()
      updateWorkInProgressHook 的作用主要是取出 current fiber 中的 hooks 链表中对应的 hook 节点，挂载到 workInProgress fiber 上的 hooks 链表
   - 组件的调度是从beginWork 开始，packages\react-reconciler\src\ReactFiberBeginWork.old.js
      函数组件的渲染和更新，使用了 updateFunctionComponent 函数,调用reconcileChildren方法调和子树,diff 的过程就是在 reconcileChildren 中发生,diff策略：Tree diff Component diff Element diff

   ```ts
   // ReactFiberBeginWork.old.js

   function updateFunctionComponent(
     current,
     workInProgress,
     Component,
     nextProps: any,
     renderLanes,
   ) {
      if (__DEV__) {
         // ...
      }

     let context;
     if (!disableLegacyContext) {
       // …
     }
   
     let nextChildren;
     prepareToReadContext(workInProgress, renderLanes);
   
     if (__DEV__) {
       // …
     } else {
       nextChildren = renderWithHooks( // 函数组件更新和渲染过程执行的入口
         current,
         workInProgress,
         Component,
         nextProps,
         context,
         renderLanes,
       );
     }
   
     // React DevTools reads this flag.
     workInProgress.flags = PerformedWork;
   
     // reconcileChildren 调和子树，diff 的过程就是在 reconcileChildren 中发生的
     reconcileChildren(current, workInProgress, nextChildren, renderLanes);
     return workInProgress.child;
   }
   ```
   - 最后是commit阶段
7.为什么不能在条件判断里使用hook
   - mount阶段将生成的hooks链表挂载到fiberNode的memoizedState属性上，
   - update阶段通过updateWorkInProgressHook取出current fiber 中的hooks链表中对应的hook节点，挂载到workInProgress fiber上的hooks链表，updateWorkInProgressHook按顺序取hook

## useEffect
   ```ts
   function mountEffect(
     create: () => (() => void) | void,
     deps: Array<mixed> | void | null,
   ): void {
     if (__DEV__) {
       // $FlowExpectedError - jest isn't a global, and isn't recognized outside of tests
       if ('undefined' !== typeof jest) {
         warnIfNotCurrentlyActingEffectsInDEV(currentlyRenderingFiber);
       }
     }
   
     return mountEffectImpl(
       UpdateEffect | PassiveEffect,
       HookPassive,
       create,
       deps,
     );
   }
   
   function updateEffect(
     create: () => (() => void) | void,
     deps: Array<mixed> | void | null,
   ): void {
     if (__DEV__) {
       // $FlowExpectedError - jest isn't a global, and isn't recognized outside of tests
       if ('undefined' !== typeof jest) {
         warnIfNotCurrentlyActingEffectsInDEV(currentlyRenderingFiber);
       }
     }
   
     return updateEffectImpl(
       UpdateEffect | PassiveEffect,
       HookPassive,
       create,
       deps,
     );
   }
   ```
   - 1.可以看到，mountEffect 接受 useEffect 传入的 回调函数(create) 和 依赖项{deps) 两个参数，
     并返回了 mountEffectImpl 的执行结果。
     在调用 mountEffectImpl 时传入了用于位运算的 fiber 节点标识和 hook 对象的标识，
     还传入了 useEffect提供的两个参数 callback 和依赖项
   - 2.接下来看看mountEffectImpl 做了什么事情
      ```ts
      function mountEffectImpl(fiberFlags, hookFlags, create, deps): void {
         // 创建 hook 对象，将 hook 对象添加到 workInProgressHook 单向链表中，返回最新的 hook 链表 
         const hook = mountWorkInProgressHook();
         // 初始化 useEffect 的第二个参数 依赖项 
         const nextDeps = deps === undefined ? null : deps;
         // 当前 fiber 节点的二进制值，区分当前 effect 是 useEffect 还是 useLayoutEffect 
         currentlyRenderingFiber.flags = fiberFlags;
         // 初始化 effect 链表，添加到 useEffect hook 的 memoizedState 属性上
         // 因此 useEffect hook 的 memoizedState 并不是一个具体的值(useState、useReducer 的 memoizedState 是一个具体的值)，而 
         hook.memoizedState = pushEffect(
            // HookHasEffect 和 hookFlags 做位运算
            // HookHasEffect 标记Effect的回调和销毁函数需要执行
            // hookFlags 参数值为 HookPassive，表示 hook 是 useEffect 
            HookHasEffect | hookFlags,
            create, // useEffect hook 的第一个参数 callback 
            undefined,
            nextDeps, // useEffect hook 的第二个参数 依赖项数组 
         );
      }
      ```
   - 3.pushEffect
      无论是否需要重新执行 useEffect 的 callback，最后都会调用 pushEffect 去更新 hook 对象上的effect 链表，然后将更新后的 effect 添加到 hook 对象上的 memoizedState 属性上
     ```ts
     function pushEffect(tag, create, destroy, deps) {
         // 新建一个 effect 对象 
         const effect: Effect = {
            tag,
            // effect的tag，用于区分useEffect和useLayoutEffect 
            create,
            // useEffect 的第一个参数 callback 
            destroy,
            deps, // useEffect 的 第二个参数 依赖项数组
            // Circular 
            next: (null: any),
            // 链表的next指针，链接下一个 effect 
         };
      
         // destroy是什么? 
         【
            useEffect(() => {
               // destroy 
               return () => {
                  // 卸载 
               }
            }, [])
         】
      
      
         //从当前 Fiber 节点的 updateQueue 属性上获取当前 Fiber 节点的 更新队列 
         let componentUpdateQueue: null | FunctionComponentUpdateQueue = (currentlyRenderingFiber.updateQueue: any);
         // 【为什么要创建更新队列？】
         // 【是因为在Fiber的commit阶段后去回调】 
         if (componentUpdateQueue === null) {
            // 如果当前 Fiber 节点的更新队列不存在，则创建一个更新队列 
            componentUpdateQueue = createFunctionComponentUpdateQueue();
            currentlyRenderingFiber.updateQueue = (componentUpdateQueue: any);
            // 将 effect 链表添加到 更新队列上 callback 
            componentUpdateQueue.lastEffect = effect.next = effect;
         } else {
            // 当前 Fiber 节点上以存在更新队列，将当前的 effect 添加到 effect 链表的末尾
            // effect 是一个环形链表 
      
            const lastEffect = componentUpdateQueue.lastEffect;
            if (lastEffect === null) {
               componentUpdateQueue.lastEffect = effect.next = effect;
            } else {
               const firstEffect = lastEffect.next;
               lastEffect.next = effect;
               effect.next = firstEffect;
               componentUpdateQueue.lastEffect = effect;
            }
         }
         return effect;
      }
      ```
   - 4.更新阶段
      - 更新过程中 useEffect 实际调用的方法 updateEffect
      - updateEffect - packages\react-reconciler\src\ReactFiberHooks.new.js
     ```ts
     function updateEffect(
         create: () => (() => void) | void,
         deps: Array < mixed > | void | null,
      ): void {
         if (__DEV__) {
            // $FlowExpectedError - jest isn't a global, and isn't recognized outside of tests 
            if (typeof jest !== 'undefined') {
               warnIfNotCurrentlyActingEffectsInDEV(currentlyRenderingFiber);
            }
         }
         // 实际调用updateEffectImpl
         return updateEffectImpl(PassiveEffect, HookPassive, create, deps);
      }
      ```
      - updateEffectImpl - packages\react-reconciler\src\ReactFiberHooks.new.js
        ```ts
        function updateEffectImpl(fiberFlags, hookFlags, create, deps): void {
            // 当前正在更新的 fiber 节点上的 hook 
            const hook = updateWorkInProgressHook();
            // 新的 deps 
            const nextDeps = deps === undefined ? null : deps;
            let destroy = undefined;
         
            //currentHook: 当前 fiber 节点上的 hook 对象 
         
            // 当前 fiber 节点上存在 hook 对象 
            if (currentHook !== null) {
               // 获取旧的 effect 状态 
               const prevEffect = currentHook.memoizedState;
               destroy = prevEffect.destroy;
               // 如果新的 deps 存在 
               if (nextDeps !== null) {
                  // 获取旧的 deps 
                  const prevDeps = prevEffect.deps;
                  // 【重点】：areHookInputsEqual 方法比较新旧 deps 是否相同 
                  if (areHookInputsEqual(nextDeps, prevDeps)) {
                     // 新旧 deps 相同，传入 hookFlags， 表示不需要 update，更新 hook 对象上的 effect 链 
                     pushEffect(hookFlags, create, destroy, nextDeps);
                     return;
                  }
               }
            }
         
            // 代码执行到这里，表示新旧的 deps 不一样 
            // 更新 hook 对象上的effect 链 
            hook.memoizedState = pushEffect(
               // HookHasEffect 和 hookFlags 做位运算
               // HookHasEffect 标记Effect的回调和销毁函数需要执行
               // hookFlags 参数值为 HookPassive，表示 hook 是 useEffect
               HookHasEffect | hookFlags,
               create,
               destroy,
               nextDeps,
            );
         }
         ```
      - areHookInputsEqual(nextDeps, prevDeps) nextDeps 新的依赖项，prevDeps旧的依赖项
         比较新旧deps是否相同，返回true表示前后deps是一致的，返回false表示前后deps是不一致的，
         不一致则更新 hook 对象上的effect 链，hook.memoizedState = xxx
        ```ts
        function areHookInputsEqual(
            nextDeps: Array < mixed > , [1]
            prevDeps: Array < mixed > | null, [1]
         ) {
            // prevDeps === null 表示不传useEffect的第二个参数， 
            // 始终return false，即表示监听全局state的变化
            if (prevDeps === null) {
               return false;
            }
            // // deps 是一个 Array，循环遍历去比较 array 中的每个 item 
            for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
               // is比较函数是浅比较 
               if (is(nextDeps[i], prevDeps[i])) {
                  continue;
               }
               return false;
            }
            return true;
         }
         ```
   - 5.useEffect 流程图
