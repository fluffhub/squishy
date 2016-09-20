
Module(function M () {
M.Import('squishy/basic',function(basic) {
  var Templates=[];
  var TemplateFiles=[];


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

  M.Def("setTemplates",function setTemplates(filename) {

    if(filename) {
      TemplateFiles[TemplateFiles.length]=filename;
      Import(filename,function(ft) {
        Templates[Templates.length]=ft;
      });
    }

  });
  M.Def('getTemplates',function getTemplates(obj) {
    var templates=[];
    templates.obj=obj;
    for(var i=0;i<Templates.length;i++) {
      var Ts=Templates[i];
      for(var name in Ts) {
       // if(Ts[name]!==getTemplates) {
          var MC=Ts[name](obj);
          if(MC) {
            templates[templates.length]=MC;
            //templates.push(MC);
           if(MC.repr)
              templates.repr=MC.repr.bind(MC);
          }
      //  }
      }
    };
    return templates;
  });
});
});
