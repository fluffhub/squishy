Module(function M () {
M.Import("squishy/interactive", "squishy/DOM", "squishy/basic",
        "squishy/svg", "squishy/events", "squishy/transform",
         "fluff", "fluff/io", "Editor/js/Models", 
         "Editor/js/DiagramBlock", "Editor/js/Editors",
         function(interactive,DOM,basic,svg,events,
          transform,fluff,blocks,models,DB,editors) {

  console.debug({Blocks:blocks});
  var Template=M.Class(function C() {
    C.Init(function Template(obj) {
      this.obj=obj;
    });
    C.Def(function repr() {
      var B=new basic.Div('template');
      B.content('?');
      return B;
    });
  });
    var UserFunction=M.Class(function C() {
    C.Super(Template);
    C.Init(function UserFunction(obj) {
      if(this instanceof UserFunction) {
        Template.call(this,obj);
      } else {
        if(obj instanceof blocks.UserFunction) {
          return new UserFunction(obj);
        }
      }
    });
    C.Def(function editor(EW) {
      var T=this;
      var CT=new basic.Div();

      //fun.element.style.float="left";
      var arglist=new basic.Div();
      arglist.addClass("arglist");
      arglist.element.style.float="left";
      for (var i=0;i<T.obj.inputs.length;i++) {
        var ni=i;
        var e=new editors.StringEditor(ni,T.obj.inputs[i],T.obj.inputs[i],function() {
          T.obj.inputs[ni]=this.value();
        })
        e.element.style.float="left";
        arglist.add(e);
      }
      var fun=function() {};
      var VE=new editors.TextEditor("fun",T.obj.fun,"fun",function() {

        T.obj.fun=this.element.value;
       // try {

         console.debug(T.obj);
        eval('with(T.obj) { T.obj.call=function() {'+T.obj.fun+'}; }');
      //  eval('with(T.obj) { T.obj.call=function() {$0=(function() {'+T.obj.fun+' })()}; }');

        this.element.style["border-color"]="blue";
      //  } catch(E) {
       //   this.element.style["border-color"]="red";
       // }

      });
      CT.add(arglist);
      //CT.content("function f() {");
      CT.add(VE);
     // VE.enable();
      VE.element.style.width="100%";
      return CT;
    });
  });
  var Value=M.Class(function C() {
    C.Super(Template);
    C.Init(function Value(obj) {
      if(this instanceof Value) {
        Template.call(this,obj);
      } else {
        if(obj instanceof blocks.Value) {
          return new Value(obj);
        }
      }
    });
    C.Def(function editor(EW) {
      var T=this;
      var CT=new basic.Div();
      var VE=new editors.StringEditor("value",this.obj.value,"",function() {
        T.obj.value=this.value()
      });
      CT.content("Value:");
      CT.add(VE);
      VE.element.style.width="100%";
      return CT;
    });
  });
  var Program=M.Class(function C() {
    C.Super(Template);
    C.Init(function Program(obj) {
    //  Template.call(this,obj);
      if(this instanceof Program) {
        Template.call(this,obj);
      } else {
        if(obj instanceof models.Local.Program.Model.__init__) {
          return new Program(obj);
        }
      }
    });
    C.Def(function editor(EW) {
     var GE=new editors.ObjectEditor(this.obj,this.address,4,EW);
      //GE.draw();
      GE.addClass('Program');
      return GE;
    });
  });
  M.Class(function C() {
    C.Super(Template);
    C.Init(function Callable(obj) {
       if(this instanceof Callable) {
        Template.call(this,obj);
       } else {
       if(obj instanceof Function) {
          return new Callable(obj);
         //B.addClass(name);
       }
       }

    });
    C.Def(function repr() {
      var B=new basic.Div(this.obj.name);
      return B;
    });
  });
  M.Class(function C() {
    C.Super(Template);
    C.Init(function Class(val) {
      if(this instanceof Class) {
        Template.call(this,val);
      } else {
        if(val instanceof Function) {
          return new Class(val);
        }
      }
    });
    C.Def(function spawn(val) {
      var node=new fluff.Init(this.obj);
      node.name=cls.name;
      node.cls='fluff#Init';
      node.src=this.obj.src;
      return node;
    });
    C.Def(function repr() {
      var B=new interactive.MomentaryButton(this.obj.name,'template');
      return B;
    });
  });
  M.Class(function C() {
    C.Super(Template);
    C.Init(function Instance(obj) {
      if(this instanceof Instance) {
        Template.call(this,obj);
      } else {
        if(obj instanceof Object) {
          return new Instance(obj);
        }
      }
    });
    C.Def(function editor(EW) {
     var GE=new editors.ObjectEditor(this.obj,this.address,4,EW);
      GE.addClass('Program');
      return GE;
    });
  });

  M.Class(function C() {
    C.Super(Template);
    C.Init(function Reference(obj) {
      if(this instanceof Reference) {
        Template.call(this,obj);
      } else {
        if(obj.address) {
          return new Reference(obj);
        }
      }
    });
    C.Def(function spawn() {
      var node=new blocks.Access(this.obj.address);
      node.repr=this.obj.address;
      node.cls='fluff#Access';
      return node;
    });
  });

  M.Class(function C() {
    C.Super(Template);
    C.Init(function Scalar(obj) {
      if(this instanceof Scalar) {
         Template.call(this,obj);
      }else {
        if(typeof obj == "string" ) {
          return new Scalar(obj);
        }
        else if(typeof obj == "number") {
          return new Scalar(obj);
        }
      }
    });
    C.Def(function spawn() {
      var node=new blocks.Value(this.obj);
      node.repr=this.obj;
      node.cls='fluff#Value';
      return node;
    });

  });
  M.Class(function C() {
    C.Super(Template);
    C.Init(function LayoutItem(obj) {
      if(this instanceof LayoutItem) {
        Template.call(this,obj);
      } else {
        if(obj.prototype&&obj.prototype instanceof DOM.LayoutItem) {
          return new LayoutItem(obj);
        }
      }
    });
    C.Def(function repr() {
      var B=new interactive.MomentaryButton(this.obj.name,'template layout');
      return B;
    });
    C.Def(function spawn() {
      var node=new fluff.Layout(this.obj);
      node.cls='fluff#Layout';
      return node;
    });

  });
  M.Class(function C() {
    C.Super(Template);
    C.Init(function Layout(obj) {
      if(this instanceof Layout) {
        Template.call(this,obj);
      } else {
        if(obj instanceof fluff.Layout) {
           return new Layout(obj);
        }
      }
    });
    C.Def(function editor() {
      return new basic.Div("LayoutEditor")
    });
  });
  M.Class(function C() {
    C.Super(Template);

    C.Init(function BlockTemplate(obj) {
      if(this instanceof BlockTemplate) {
        Template.call(this,obj);
      } else {
        if(obj instanceof Function&&obj.name=='Block') {
          return new BlockTemplate(obj);
        }
      }
    });
    C.Def(function repr() {
      var BlockTemplate=new this.obj();
      BlockTemplate.name=this.obj.blockname;
      var B=new DB.SVGBlock(BlockTemplate);
      B.addClass("template");
      B.attrs({"data-name":this.obj.blockname});
      return B;
    });
    C.Def(function spawn(obj) {
      var obj=obj || this.obj;
      var node=new this.obj(obj);
      node.name=this.obj.blockname;
      node.cls=this.obj.src;
      return node;
    });
  });
  M.Class(function C() {
    C.Super(Template);

    C.Init(function BlockInstance(obj) {

      if(this instanceof Block) {
         Template.call(this,obj);
      } else {

        if(obj instanceof window.Block) {
           return new Block(obj);
        }
      }
    });
    C.Def(function editor(EW) {
      var E=new basic.Div("BlockEditor editor");
      E.add(new basic.Span("Name:","caption"));
      var T=this;
      /* var VE=new editors.StringEditor("name",this.obj.name,"",function() {
        T.obj.name=this.value()
      });
      E.add(VE);
      var GE=new editors.ObjectEditor(this.obj.dimensions,this.address+'.dimensions',4,EW);
      E.add(new basic.Span("Dimensions:","caption"));
      E.add(GE);*/
      E.addClass('Program');
      return E;

    });
  });
  M.Def('spawn',function spawn(obj) {
    var templates=[];
    templates.obj=obj;
    for(var name in this) {
      if(this[name]!==spawn) {
        var MC=this[name](obj);
        if(MC) {
          templates.push(MC);
          if(MC.repr)
            templates.repr=MC.repr.bind(MC);
        }
      }
    }
    return templates;
  });
});
});