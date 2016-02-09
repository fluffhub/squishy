function rcopy(destination, source) {
  for (var key in source) {
    var val=source[key];
    if(typeof val=='object') {
      if(val instanceof Array) {
        destination[key]=[];
        rcopy(destination[key],val);
      } else {
        destination[key]={};
        rcopy(destination[key],val);
      }
    } else {
      destination[key]=val;
    }
  }
  return destination;
}

var Model=function Model(def) {
  var modelname='Unnamed';
  var fun=function ModelInstance(val) {
    var O=new fun.__init__(val);
    Object.defineProperty(O,'constructor',{value:fun});
    rcopy(O,fun.default);
    rcopy(O,val);
    return O;
  };
  fun.__init__=function ModelInstance(val) { };
  if(def.Template) {} else { def.Template={}; }
  extend(def.Template,{
    Template:function Template(templ) {
      fun.default=templ;
      fun.columns=[];
      if(templ.name) modelname=templ.name;
      for(var key in templ) {
        fun.columns[fun.columns.length]=key;
        Object.defineProperty(fun.prototype,key,{
          value:templ[key],
          enumerable:true,
          writable:true,
          configurable:false
        });
      }
    },
    Super:function (m) {
      rcopy(fun.default,m.default);
      for (var key in m.default) {
        fun.columns[fun.columns.length]=key;
        Object.defineProperty(fun.prototype,key,{
          value:m.default[key],
          enumerable:true,
          writable:true,
          configurable:true
        });
      }
    },
    Name:function (name) {
      modelname=name;
    },
    Init:function (init) {

      fun.__init__=init;

      if(modelname=='Unnamed') modelname=init.name;

    },
  });
  extend(def,def.Template);
  def();
  fun.modelname=modelname;
  return fun;
};

extend(window.Module.Template,{
  Model:function Model(def) {
    var M=window.Model(def);
    this[M.modelname]=M;
    return M;
  }
});
Module(function M() {
  /*
  Module model.js contains global class Model which is added to the global Module Template,
  and a Module containing a basic Model class.
  */

M.Model(function O() {
  O.Init(function Model() { });
  O.Template({id:0});
  //O.Index('id');
});
});


