const { createElement, render, Component } = require('./react.js')

class Mycomponent extends Component {
  constructor(){
    super()
    this.state = {
      a:1,
      b:2
    }
  }

  // setAttribute(name, value){

  // }

  // appendChild(){

  // }

  render(){
    return <div>
      <h1>my component</h1> 
      <button onClick={() => {this.setState({a: this.state.a+1})}}>add</button>
      <span>{this.state.a}</span>
      <span>{this.state.b}</span>

      {/* {this.children} */}
    </div>
  }

}

// document.body.appendChild(
// <Mycomponent id="a" class="c">
//   123
//   <div id="a-1"></div>
//   <div id="a-2">
//     <div id="a-2-1"></div>
//   </div>
// </Mycomponent>
// )

render(
  <Mycomponent id="a" class="c">
    123
    <div id="a-1"></div>
    <div id="a-2">
      <div id="a-2-1"></div>
    </div>
  </Mycomponent>, document.body
)

