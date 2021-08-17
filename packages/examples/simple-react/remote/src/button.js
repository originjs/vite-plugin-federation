import React from 'react'

const style = {
  background: '#a3e077',
  color: '#FFFFFF',
  padding: 12
}

export default class BindEvent extends React.Component {
  constructor() {
    super()
    this.state = {

    }
  }
  render() {
    return <button class='remote-btn' style={style} onClick={this.buttonHandler}>Rollup Remote React Button</button>
  }
  buttonHandler() {
    console.log(import.meta)
    alert('button event')
  }
}