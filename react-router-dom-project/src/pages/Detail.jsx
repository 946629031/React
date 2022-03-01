import React, { Component } from 'react'

export default class Detail extends Component {
    componentDidMount(){
        console.log('Detail componentDidMount')
    }
    componentWillUnmount () {
        console.log('Detail componentWillUnmount')
    }
    render() {
        return (
            <div>
                detail
            </div>
        )
    }
}
