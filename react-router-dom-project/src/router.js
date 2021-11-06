// import { BrowserRouter, Route } from 'react-router-dom'
// import App from './App'

// const BaseRouter = () => {
//     return (
//         <BrowserRouter>
//             <Route path='/' component={App}></Route>
//         </BrowserRouter>
//     )
// }

// export default BaseRouter






// router.js

// 将路由文件 作为组件来使用

/*
    函数式组件 function
    类组件    class
*/


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