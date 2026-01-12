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


   ```js
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
