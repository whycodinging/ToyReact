const RENDER_TO_DOM = Symbol('render to dom')
class ElementWarpper {
  constructor(type){
    // type:标签 tag，比如 div，h1
    this.root = document.createElement(type)
  }

  setAttribute(name, value){
    if(name === 'className'){
      this.root.setAttribute('class', value)
      return
    }

    if(name.match(/^on([\s\S]+)/)){
      this.root.addEventListener(RegExp.$1.replace(/^[\s\S]/, c=>c.toLocaleLowerCase()), value)
      return
    }

    this.root.setAttribute(name, value)
  }

  appendChild(component){
    // this.root.appendChild(component.root)
    let range = document.createRange()
    range.setStart(this.root, this.root.childNodes.length)
    range.setEnd(this.root, this.root.childNodes.length)
    component[RENDER_TO_DOM](range)

  }
    
  [RENDER_TO_DOM](range){
    range.deleteContents()
    range.insertNode(this.root)
  }
}

class TextNodeWarpper {
  constructor(content){
    this.root = document.createTextNode(content)
  }

  [RENDER_TO_DOM](range){
    range.deleteContents()
    range.insertNode(this.root)
  }
}

class Component {
  // name:组件名称 
  constructor(name){
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

  // _renderToDOM(range){
  //   this.render()._renderToDOM(range)
  // }

  [RENDER_TO_DOM](range){
    this._range = range
    this.render()[RENDER_TO_DOM](range)
  }

  rerender(){
    // 此时 range 被删除，全空会有问题，因此需要修改逻辑为先插入再删除
    // this._range.deleteContents()
    // this[RENDER_TO_DOM](this._range)

    let oldRange = this._range

    // 创建新的 range
    let range = document.createRange()
    range.setStart(oldRange.startContainer, oldRange.startOffset)
    range.setEnd(oldRange.startContainer, oldRange.startOffset)
    this[RENDER_TO_DOM](range)

    oldRange.setStart(range.endContainer, range.endOffset)
    oldRange.deleteContents()
  }

  // get root (){
  //   if(!this._root){
  //     this._root = this.render().root
  //   }

  //   return this._root
  // }

  setState(newState){
    if (this.state === null || typeof this.state !== 'object'){
      this.state = newState
      this.rerender()
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
    this.rerender()
  }

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
    component[RENDER_TO_DOM](range)
  }
}
