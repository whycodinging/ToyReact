const { createElement, render, Component } = require('./react.js')

class Mycomponent extends Component {
  // constructor(type){

  // }

  // setAttribute(name, value){

  // }

  // appendChild(){

  // }

  render(){
    return <div>my component
      {this.children}
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

