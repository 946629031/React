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
