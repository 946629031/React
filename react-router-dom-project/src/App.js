import React, { Component } from 'react'

export default class App extends Component {
    render() {
        return (
            <div>
                123
                <ul>
                    <li><a href='/list'>列表页</a></li>
                    <li><a href='/detail'>详情页</a></li>
                </ul>
                <div className='box'></div>
            </div>
        )
    }
}
