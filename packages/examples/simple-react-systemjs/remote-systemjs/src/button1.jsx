import React from 'react'

const style = {
  background: '#a3e077',
  color: '#FFFFFF',
  padding: 12
}

export default class BindEvent extends React.Component{
  constructor(){
      super()
      this.state={

      }
  }
  render(){
      return <button style={style} onClick={this.button1Handler}> Rollup Remote React Button1 </button>
  }
  button1Handler(){
    console.log(import.meta)
      alert('button1 event')
  }
}
