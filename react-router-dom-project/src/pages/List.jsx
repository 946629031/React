import React, { Component } from 'react'

export default class List extends Component {
    componentDidMount(){
        console.log('List componentDidMount')
    }
    componentWillUnmount () {
        console.log('List componentWillUnmount')
    }
    render() {
        return (
            <div>
                list
            </div>
        )
    }
}
