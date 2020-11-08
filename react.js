const RENDER_TO_DOM = Symbol('render to dom')

class Component {
  // name:组件名称 
  constructor(){
    // this.root = document.createElement(type)
    this.props = Object.create(null)
    this.children = []
    this._root = null
    this._range = null
  }

  setAttribute(name, value){
    this.props[name] = value
  }

  appendChild(component){
    this.children.push(component)
  }

  get vdom(){
    return this.render().vdom
  }

  // _renderToDOM(range){
  //   this.render()._renderToDOM(range)
  // }

  [RENDER_TO_DOM](range){
    this._range = range
    console.log('this.vdom:', this.vdom)
    this._vdom = this.vdom
    // debugger
    this._vdom[RENDER_TO_DOM](range)
  }

  update(){
    // 节点比对
    let isSameNode = (oldNode,newNode) => {
      if(oldNode.type !== newNode.type){
        return false
      }

      for (let name in newNode.props){
        if(newNode.props[name] !== oldNode.props[name]){
          return false
        }
      }

      if(Object.keys(newNode.props).length !== Object.keys(oldNode.props).length){
        return false
      }

      if(newNode.type === '#text'){
        if(newNode.content !== oldNode.content){
          return false
        }
      }

      return true
    }

    let update = (oldNode,newNode) => {

      // 新旧节点不一样
      if(!isSameNode(oldNode,newNode)){
        newNode[RENDER_TO_DOM](oldNode._range)
        return
      }

      newNode._range = oldNode._range

      let newChildren = newNode.vchildren
      let oldChildren = oldNode.vchildren

      if(!newChildren || !newChildren.length){
        return
      }

      let tailRange = oldChildren[oldChildren.length -1]._range

      for(let i=0;i<newChildren.length;i++){
        let newChild = newChildren[i]
        let oldChild = oldChildren[i]

        if(i<oldChildren.length){
          update(oldChild,newChild)
        }else {
          let range = document.createRange()
          range.setStart(tailRange.endContainer, tailRange.endOffset)
          range.setEnd(tailRange.endContainer, tailRange.endOffset)
          newChild[RENDER_TO_DOM](range)
          tailRange = range
        }
      }
    }

    let vdom = this.vdom
    update(this._vdom, vdom)
    this._vdom = vdom
  }

  setState(newState){
    if (this.state === null || typeof this.state !== 'object'){
      this.state = newState
      this.update()
      return
    }

    let merge = (oldState, newState)=>{
      for(let p in newState){
        if(oldState[p] === null || typeof oldState[p] !== 'object'){
          oldState[p] = newState[p]
        }else{
          merge(oldState[p], newState[p])
        }
      }

    }

    merge(this.state,newState)
    this.update()
  }
}
class ElementWarpper extends Component {
  constructor(type){
    super(type)
    this.type = type
  }

  get vdom() {
    this.vchildren = this.children.map((child) => child.vdom)
    return this

  }
    
  [RENDER_TO_DOM](range){
    this._range = range
    // range.deleteContents()
    let root = document.createElement(this.type)

    //  处理 props
    for(let name in this.props){
      let value = this.props[name]

      if(name === 'className'){
        root.setAttribute('class', value)
      } else if(name.match(/^on([\s\S]+)/)){
        root.addEventListener(RegExp.$1.replace(/^[\s\S]/, c=>c.toLocaleLowerCase()), value)
      } else{
        root.setAttribute(name, value)
      }
    }

    // 确保 vchilden 一定存在
    if(!this.vchildren){
      this.vchildren = this.children.map(child => child.vdom)
    } 

    // 处理 children
    for(let child of this.vchildren){
      
      let childRange = document.createRange()
      childRange.setStart(root, root.childNodes.length)
      childRange.setEnd(root, root.childNodes.length)
      child[RENDER_TO_DOM](childRange)
    }

    console.log('root', root)

    // range.insertNode(root)
    replaceContent(range, root)
  }
}

class TextNodeWarpper extends Component {
  constructor(content){
    super(content)
    this.content = content
    this.type = '#text'
  }

  [RENDER_TO_DOM](range){
    this._range = range
    let root = document.createTextNode(this.content)
    replaceContent(range,root)
  }

  get vdom() {
    return this
  }
}

function replaceContent(range,node){
  range.insertNode(node)
  range.setStartAfter(node)
  range.deleteContents()

  range.setStartBefore(node)
  range.setEndAfter(node)
}

module.exports = {
  Component,
  createElement(type, attributes, ...children){
    let parent
    // type是原始标签
    if(typeof type === 'string'){
      parent = new ElementWarpper(type)
      
     // type是自定义标签
    } else {
      parent = new type
    }
    

    // let parent = document.createElement(type)

    for(let attr in attributes){
      parent.setAttribute(attr, attributes[attr])
    }

    let insertChild = (children) => {

      for(let child of children){

        if(child === null){
          continue
        }

        if(typeof child === 'string' || typeof child === 'number'){
          child = new TextNodeWarpper(child.toString())
        }


        if(typeof child === 'object' && child instanceof Array){
          insertChild(child)
        } else {
          parent.appendChild(child)
        }
      }
    }
    insertChild(children)

    return parent
  },

  render(component, parentElement){
    //  parentElement.appendChild(component.root)

    let range = document.createRange()
    range.setStart(parentElement, 0)
    range.setEnd(parentElement, parentElement.childNodes.length)
    range.deleteContents()
    component[RENDER_TO_DOM](range)
  }
}
