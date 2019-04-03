Module(function M () {
M.Import('squishy/interactive',function(interactive) {
M.Import('squishy/DOM',function(DOM) {
M.Import('squishy/basic',function(basic) {
M.Import('squishy/svg',function(svg) {
M.Import('squishy/transform',function(transform) {
M.Import('squishy/template',function(template) {
M.Import('fluff',function(fluff) {
M.Import('fluff/control',function(control) {
M.Import('/app/Editor/js/Models',function(models) {
M.Import('/app/Editor/js/DiagramBlock',function(DB) {
M.Import('/app/Editor/js/Editors',function(editors) {
  var Template=template.Template;
  var ForLoop=M.Class(function C() {
    C.Super(Template);
    C.Init(function ForLoop(obj) {
      if(this instanceof ForLoop) {
        Template.call(this,obj);
      } else {
        if(obj instanceof control.For) {
          return new ForLoop(obj);
        }
      }
    });
    C.Def(function editor(EW) {
      var T=this;
      var CT=new basic.Div("object editor");

      //fun.element.style.float="left";
      var Start=new basic.Div("EditorItem");
      var start=new editors.StringEditor("start",T.obj.start,T.obj,function() {
          T.obj.attributes.start=this.value();
        });
       Start.add(new basic.Span("Start:","caption"));
      Start.add(start);


      var End=new basic.Div("EditorItem");
        var end=new editors.StringEditor("end",T.obj.end,T.obj,function() {
          T.obj.attributes.end=this.value();
        });
         End.add(new basic.Span("End:","caption"));
      End.add(end);


      var Step=new basic.Div("EditorItem");
        var step=new editors.StringEditor("step",T.obj.step,T.obj,function() {
          T.obj.attributes.step=this.value();
        });
            Step.add(new basic.Span("Step:","caption"));
      Step.add(step);


      CT.Madd(Start,End,Step);
      return CT;
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
