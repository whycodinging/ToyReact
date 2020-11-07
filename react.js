class ElementWarpper {
  constructor(type){
    // type:标签 tag，比如 div，h1
    this.root = document.createElement(type)

  }

  setAttribute(name, value){
    this.root.setAttribute(name, value)
  }

  appendChild(component){
    this.root.appendChild(component.root)

  }

}

class TextNodeWarpper {
  constructor(content){
    this.root = document.createTextNode(content)
  }
}

class Component {
  // name:组件名称 
  constructor(name){
    // this.root = document.createElement(type)
    this.props = Object.create(null)
    this.children = []
    this._root = null
  }

  setAttribute(name, value){
    this.props[name] = value
  }

  appendChild(component){
    this.children.push(component)
  }

  get root (){
    if(!this._root){
      this._root = this.render().root
    }

    return this._root
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

        if(typeof child === 'string'){
          child = new TextNodeWarpper(child)
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
    console.log(component)
     parentElement.appendChild(component.root)
  }
}
