# React-Router-Dom

- [简单快速撸懂【react-router-dom】【B站 视频教程】](https://www.bilibili.com/video/BV1wL411n7Ns?p=1)
- []()
----

- 环境
    ```js
    "react": "^17.0.2",
    "react-dom": "^17.0.2",
    "react-router-dom": "^6.0.1",
    ```
    详情请看 [完整项目地址 package-lock.json](react-router-dom-project/package-lock.json)



----


## 01.路由原理
- 几个基本概念
    - SPA: Single Page Application, 单页面应用
        - 例如: https://music.163.com/#/
    - 什么是 **`路由`** ?
        - 现实生活中的路由: 用来管理网络和计算机之间的关系
        - 程序中的路由: 用来管理ur地址 和 视图之间的关系
        - 路由原理:
            - 1、准备视图(html)
            - 2、准备路由的路线(可以是一个对象，键名是路线名称和值是视图地址)
            - 3、通过hash地址的路线，获取"视图地址”
            - 4、在指定标签中，加载需要的视图页面
    - 以下代码实现 简单的 路由跳转页面 功能
    ```html
    <body>
        <ul>
            <li><a href="#/list">列表页</a></li>
            <li><a href="#/detail">详情页</a></li>
        </ul>
        <div class="box"></div>
    </body>
    /html >
    <script src="https://cdn.bootcss.com/jquery/1.12.4/jquery.min.js"></script>
    <script>
        //点击a标签，a标签的默认行为就是跳转url,因此你是不需要对a标签写点击事件的
        //点击了a标签之后，真正会变化的是ur1的hash值

        //得到hash之后有什么用?
        var router = {
            "#/list": "./list.html",
            "#/detail": "./detail.html"
        }
        window.addEventListener("hashchange", () => {
            console.log('当前的hash值为: ', location.hash)
            let url = router[location.hash]
            $(".box").load(url)
        })
    </script>
    ```

## 路由安装与介绍
- ## react 路由
    - **`react-router`** 是跨平台的，内置通用组件和通用Hooks。
    - **`react-router-dom`** 是在 `react-router` 基础上提供了 `Link` 和 `NavLink`, 而且依敕 `history` 库提供了 兩个浏览器端 迺用的 `BrowserRouter` 和 `HashRouter`.
    - `Router 4.x` 以前的版本，-般都有 `react-router`
    - `Router 4.x` 以后的版本，-般都指 `react-router-dom`, 一些常用的組件都封装好了。現在的項目基本都是使用 `react-router-dom`

    > 为什么 叫做 `react-router-dom` ? <br>
    > 简单的理解, 就是因为 它在写路由的时候 像是在写标签页一样

- 1.创建项目
    - 用 `create-react-app` 创建一个 react 初始化项目
    ```js
    npx create-react-app .
    ```
    - 创建项目后, 再编写 入口文件 index.js
        ```js
        // /src/index.js

        import React from 'react';
        import ReactDOM from 'react-dom';
        import App from './App';

        ReactDOM.render(
            <App />,
            document.getElementById('root')
        )
        ```
- 2.安装
    ```
    npm install react-router-dom --save -dev
    ```
- 3.创建页面
    - 然后我们新建两个页面，分别命名为"home' 和"detail"。在页面中编写如”下代码:
    ```jsx
    // App.js
    import React, { Component } from 'react'

    export default class App extends Component {
        render() {
            return (
                <div>
                    <ul>
                        <li><a href='#/list'>列表页</a></li>
                        <li><a href='#/detail'>详情页</a></li>
                    </ul>
                    <div className='box'></div>
                </div>
            )
        }
    }
    ```

## 路由组件 router.js
- router.js
    ```js
    // router.js

    // 将路由文件 作为组件来使用

    /*
        函数式组件 function
        类组件    class
    */

    /*
        exact -精准匹配
        如果同级路由不加exact,全部都会匹配到同一个路径去
        比方说有这几个路由 / /list /detail ，name只要你的路径以/开头，就会全部匹配到 / 对应的组件
    
        React路由小诀窍: 同级路由尽量全部添加exact
    */

    /*
        React 的路由有两种模式:

        HashRouter          带#号
        BrowserRouter       不带#号
    */

    import App from './App'
    import { BrowserRouter, Route, Routes } from 'react-router-dom'

    // 路由组件 (专门用来配置路由)
    const BaseRouter = () => {
        return (
            <BrowserRouter>
                <Routes>
                    <Route exact path='/' element={<App />} ></Route>   {/* 把 / 跟路径指向 App 组件 */}
                </Routes>
            </BrowserRouter>
        )
    }

    export default BaseRouter
    ```
- 当有了 router.js 后
    - 不在使用 `App.js`, 而是改用 `Router.js`
    ```diff
    // /src/index.js

    import React from 'react';
    import ReactDOM from 'react-dom';
    - import App from './App';
    + import Router from './router'

    ReactDOM.render(
    -   <App />,
    +   <Router />,
        document.getElementById('root')
    )
    ```

- 多路由
    ```js
    import App from './App'
    import { BrowserRouter, Route, Routes } from 'react-router-dom'
    import List from './pages/List'
    import Detail from './pages/Detail'

    // 路由组件 (专门用来配置路由)
    const BaseRouter = () => {
        return (
            <BrowserRouter>
                <Routes>
                    <Route exact path='/' element={<App />} ></Route>
                    <Route exact path='/list' element={<List />} ></Route>
                    <Route exact path='/detail' element={<Detail />} ></Route>
                </Routes>
            </BrowserRouter>
        )
    }

    export default BaseRouter
    ```

- `Link` 和 `NavLink`
    - `Link` 和 `NavLink` 这两种标签, 尽量使用 `Link`
    - 除非 当你发现 `Link` 没办法跳转的时候, 可以尝试 `NavLink` 去解决







https://www.bilibili.com/video/BV1wL411n7Ns?p=8

00:00