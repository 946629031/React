import React, { Component } from 'react'
import { Link } from 'react-router-dom'

export default class App extends Component {
    render() {
        return (
            <div>
                <ul>
                    <li><Link to='/list'>列表页</Link></li>
                    <li><Link to='/detail'>详情页</Link></li>
                </ul>
                <div className='box'></div>
            </div>
        )
    }
}
