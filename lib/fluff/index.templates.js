Module(function M () {
M.Import('squishy/interactive',function(interactive) {
M.Import('squishy/DOM',function(DOM) {
M.Import('squishy/basic',function(basic) {
M.Import('squishy/svg',function(svg) {
M.Import('squishy/transform',function(transform) {
M.Import('squishy/template',function(template) {
M.Import('fluff',function(fluff) {
M.Import('/apps/Editor/js/Models',function(models) {
M.Import('/apps/Editor/js/DiagramBlock',function(DB) {
M.Import('/apps/Editor/js/Editors',function(editors) {

var Template=template.Template;
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

