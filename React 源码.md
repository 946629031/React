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

   ![](./img/1.png)
