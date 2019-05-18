Module(function M () {
M.Import('squishy/interactive',function(interactive) {
M.Import('squishy/DOM',function(DOM) {
M.Import('squishy/basic',function(basic) {
M.Import('squishy/svg',function(svg) {
M.Import('squishy/events',function(events) {
M.Import('squishy/transform',function(transform) {
M.Import('squishy/template',function(template) {
M.Import('fluff',function(fluff) {
M.Import('fluff/io',function(blocks) {
M.Import('/apps/Editor/js/Models',function(models) {
M.Import('/apps/Editor/js/DiagramBlock',function(DB) {
M.Import('/apps/Editor/js/Editors',function(editors) {
var Template=template.Template;

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
});
});
});
});
});
});
});
});
});
});
});
});
});
