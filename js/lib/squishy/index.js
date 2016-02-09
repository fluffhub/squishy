"use strict"
//var Squishy=document.currentScript;
function getCurrentScript() {
  if(document.currentScript)
    return document.currentScript;
  else {
   /* if(getCurrentScript.scripts&&getCurrentScript.scripts.length) { }
    else {
      var me=document.scripts[document.scripts.length-1]
      getCurrentScript.scripts=[me];
      return me;
    }
    var script;
    for(var i=0;i<document.scripts.length;i++) {
      script=document.scripts[i];
      if(script in getCurrentScript.scripts) { }
      else {
        getCurrentScript.scripts.push(script);
        return script;
      }
    }*/
      var scripts=document.getElementsByTagName('script');
      element=scripts[scripts.length-1];

  }
}
var Squishy=getCurrentScript();
console.debug("scripts:");
for(var sid in document.scripts) {
  console.debug(document.scripts[sid]);
}
//console.debug(document.scripts);

function extend(destination,source) {
  // var destination = destination || this;
  if(source) {
    for (var k in source) {
      destination[k] = source[k];
    }
    return destination;
  }  else {
    throw new Exception('Using an invalid source value, "'+source+'"');
  }
};
var Module=function Module() {
  if(this instanceof Module) {
    var filename=arguments[0];
    Object.defineProperties(this,{
      loaded:{value:false,enumerable:false,configurable:false,writable:true},
      def:{enumerable:false,configurable:false,writable:true},
      name:{enumerable:false,configurable:false,writable:true},
      Template:{enumerable:false,configurable:true,writable:true,value:{}}
    });
    if(filename) {
      Object.defineProperties(this,{
        filename:{enumerable:false,configurable:false,writable:false,value:filename},
        load:{enumerable:false,configurable:false,writable:false,
              value:function Import(callback) {
                var callback=callback || function() {};
                var M=this;
                window.Import(this.filename,function(loaded) {
                  M.loaded=true;
                  callback(loaded)
                });
              },
             }
      });
    }
    return this;
  }else {

    //being used as a module declaration in a file
    var Template={};
    var callback=arguments[0];


    var element;
    /* this switch is for IE9-11 and Safari compatibility */
/*    if(document.currentScript)
      element=document.currentScript;
    else {
      var scripts=document.getElementsByTagName('script');
      element=scripts[scripts.length-1];
    }*/
element=getCurrentScript();
    if(element) {
      var src=element.getAttribute('src');

      var parser = document.createElement('a');
      parser.href = src;
      var ps=parser.pathname.split('/');
      var fn=ps.slice(-1)[0];
      if(fn=='')  element.name=ps.slice(-1,-1)[0];
      //  fn='index.js';
      var fns=fn.split('.');
      var ft=fns.slice(-1)[0];
      var vn=fns.slice(0,-1).join('.');
      var dir=ps.slice(0,-1).join('/');
      element.root=dir;

      if(vn=='index') element.name=ps.slice(-2)[0];
      else {
        if(ft=='js') element.name=vn;
        else {
          element.name=fn;
          element.root=ps.join('/');
        }
      }
      element.setAttribute('data-root',element.root);
      element.setAttribute('data-name',element.name);
      var M = element.Module;

      if(M) {} else {
        M = element.Module = new window.Module(src);
        M.def=callback;
      }
      Object.defineProperty(callback,'Self',{value:M});
      Object.defineProperty(M,'element',{value:element});
      if(M.name) {} else M.name=vn;
      Object.defineProperty(M,'waiting',{value:0,writable:true});
      Object.defineProperty(M,'Template',{value:{},writable:true});
      for(var templatefield in window.Module.Template) {
        var Field=function Field() {
          return Field.fun.apply(M,arguments);
        };
        Field.fun=window.Module.Template[templatefield];
        M.Template[templatefield]=Field;
      }
      extend(callback,M.Template);
      element.ran=false;
      callback.call(M);
      M.loaded=true;
      if(M.waiting==0 && element.finish) element.finish();
      else element.ran=true;
    }
    else {
      var M=new window.Module();
      for(var templatefield in window.Module.Template) {
        var field=window.Module.Template[templatefield];
        M.Template[templatefield]=function Field() {
          return field.apply(M,arguments);
        }
      }
      extend(callback,M.Template);
      callback.call(M);
      return M;
    }
  }
};
Module.Template={
  Def:function Def() {
    if(typeof(arguments[0])=='function') {
      //include the module's path in the function
      arguments[0].src=this.filename+'#'+arguments[0].name;
      this[arguments[0].name]=arguments[0];
    } else {
      if(arguments.length==2) {
        this[arguments[0]]=arguments[1];
      }
    }
  },
  Index:function Modules() {
    //pre-define sub-module(s) of the module.
    //submodules are given as (name) where
    // 'directoryname/modulename'
    //can import the module

    for (var i=0;i<arguments.length;i++) {
      var k=arguments[i];
      var NM;
      if(this.element && this.element.root)
        NM=new window.Module(this.element.root+'/'+k+'.js');
      else
        NM=new window.Module();
      this[k]=NM;
    }
  },
  Import:function Import(path,callback2) {
    if(typeof this.waiting=='number') {} else this.waiting=0;
    this.waiting++;
    var M=this;
    window.Import(path,function() {
      callback2.apply(M,arguments);
      M.waiting--;
      if(M.waiting==0 ){
        if (M.element&&M.element.finish) M.element.finish();
      }
    });
  },
  Templates:function Templates(file) {
    var dir=this.filename.split("/").slice(0,-1).join("/");
    // this.Templates=function(callback) {
    var mod=this;
    this.templates=dir+"/"+file;
    Import("squishy/template",function(T) {
      T.setTemplates(dir+"/"+file);
    });
    //  }
  }
};
function Import(path,callback,err) {
  var that;
  var callback=callback || function () { };
  if(this instanceof Import) {
    that=this;

    //check if relative path or uri
    var r = new RegExp('^(?:[a-z]+:)?//', 'i');
    var absolute=false;
    if (r.test(path)||path[0]=='/' ){
      //absolute path, use as-is
      var parser = document.createElement('a');
      parser.href = path;
      path=parser.pathname;
      absolute=true;
    } else {

      //the path is relative to an index.js, given a data-root by module call

    }
    var ps=path.split('/');
    var fn=ps.slice(-1)[0];
    var fns=fn.split('.');
    var dirname='chewy';
    var ft='';
    var vn=fn;
    if(fns.length>1) ft=fns.slice(-1)[0] || '';
    if(fns.length>1) vn=fns.slice(0,-2).join('.');
    if(ps.length>1) dirname=ps.slice(-2)[0];
    else if(ps.length==1) dirname=ps[0];
    var dir=ps.slice(0,-1).join('/');
    callback.ran=false;
    this.path=path;
    var parent=null;
    if(!absolute) {
      parent=document.querySelector('script[data-name=\''+dirname+'\']');
      if(parent) {
        //if(path[0]!='/') path='/'+path;
        if(ps.length==1) path=parent.root+'/'+ps[0];
        else path = parent.root+'/'+ps.slice(1).join('/');
      }
      else {
        //try to load the index of parent?
        //fallback to actual relative path, no parent index found
      }
    }
    if(ft=='css') { // TODO add a link rel="stylesheet"
    }
    else if(ft=='jpg'||ft=='gif'||ft=='svg'||ft=='png') {//create img tag behind the scenes
    }
    else if(ft=='html') { // TODO: semantically what to happen when html importad
    }
    else if(ft=='txt') {// TODO:  Etc.   TXT->string
    }
    else if(ft=='json') {// TODO: etc.
    }
    else {
      if(fn=='') path=path+'index';
      if(fn.indexOf('.')=='-1') path=path+'.js';
      //assume its a js file
      //find existing script tag
      var script=null;
      script=document.querySelector('script[data-name="'+fn+'"]') ||
        document.querySelector('script[src=\''+path+'\']');
      if(script) {
        //script.parent=parent;
        if(script.failed) {
          err(script);
        } else {
          if(script.dependencies) script.dependencies[script.dependencies.length]=callback;
          else script.dependencies=[callback];
          if(script.errors) script.errors[script.errors.length]=err;
          else script.errors=[err];
          // if the script ran already, re-run this dependency only
          //with script.Module as agrment
          if(script.ran&&!callback.ran) {
            callback(script.Module);
            callback.ran=true;
          }
          if(script.Module) {
          }
          else {
            script.Module=new window.Module(path);
            //this probably was a script tag inserted into html on its own
            //without Import statement,
            //create Import for it
          }
        }
      }
      else  {
        var script=document.createElement('script');
        Object.defineProperty(this,'element',{value:script});
        var waiting=0;
        if(parent && vn in parent.Module) script.Module=parent.Module[vn];
        else script.Module=new window.Module(path);
        script.dependencies=[callback];
        script.errors=[err];
        script.parent=parent;
        script.finish=function() {
          //for (var i=script.dependencies.length-1;i>=0;i--) {
          var L=script.dependencies.length;
          for (var i=0;i<L;i++) {
            if(!script.dependencies[i].ran) {
              script.dependencies[i](script.Module);
              script.dependencies[i].ran=true;
            }
          }
          //try to find the dirname script
          if(script.parent) {
            if(script.parent.Children) {}
            else script.parent.Children={}
            script.parent.Children[vn]=script.Module;
            script.parent.Module[script.name]=script.Module;
          }
          script.ran=true;
          if (script.onfinish) script.onfinish(script.Module);
        }
        script.src=path;
        script.type='text/javascript';
        script.Import=this;
        script.addEventListener("error",function(e) {
          console.debug("error in import ("+path+"):");
          console.debug(e);
          script.failed=true;
          script.errors.forEach(function(caller) {
            console.debug(caller);
            if(caller) caller(e);
          });
        });
        document.head.appendChild(script);
        //     return script.Module;
      }
    }
  }
  else {
    var paths;
    if(path instanceof Array) {
      paths=path;
    }
    if(typeof path=='string') {
      paths=path.split(' ')
    }
    that=[];
    var n=paths.length;
    var waiting=n;

    var args=[];
    paths.forEach(function(path,index) {
      that[that.length]=new Import(path,function resolve(item) {

        waiting--;

        args[index]=item;
        if(waiting==0) {
          callback.apply(that,args);
        }
      });
    });
  }
  return that;
}

function Class(def,fun) {
  var fun=fun || new Function();
  Object.defineProperty(fun.prototype,'supers',{enumerable:false,writable:true,value:[]});
  Object.defineProperty(fun.prototype,'constructor', {enumerable:false,writable:true,value:fun});
  var name='Unnamed';
  function Super(fun,cls) {
    //Super only works 1 time per object.
    //Super should be called first.
    //Preserves the prototype chain
    fun.prototype=Object.create(cls.prototype);
    if(!(fun.prototype.supers.indexOf(cls))) fun.prototype.supers.push(cls);
  }
  function Mixin(fun,cls) {
    //Mixin works 1+ times per class, but instanceof doesnt work
    if(typeof cls == 'object' && cls.constructor == Object) {
      extend(fun.prototype,cls);
    } else if(typeof cls=='function'){
      extend(fun,cls);
      extend(fun.prototype,cls.prototype);
    }
    if(!(fun.prototype.supers.indexOf(cls))) fun.prototype.supers.push(cls);
  }
  if(fun.Template) {} else Object.defineProperty(fun,'Template',{value:{}});
  extend(fun.Template,{
    Name:function Name(n) {
      name=n;
    },
    Init:function Init(con) {
      con.prototype=fun.prototype;
      con.prototype.constructor=con;
      con.supers=fun.supers;
      fun=con;
    },
    Def:function Def(f) {
      if(typeof f=='function') fun.prototype[f.name]=f;
      else if (f.name) Object.defineProperty(fun.prototype,f.name,f);
      else Object.defineProperty(fun.prototype,f,{value:arguments[1],writable:true});
    },
    Super:function (cls) { Super(fun,cls) },
    Mixin:function (cls) { Mixin(fun,cls) },
  });
  extend(def,fun.Template);
  def.call(fun);
  Object.defineProperty(fun.prototype,'Super',{ writable:true,enumerable:false });
  Object.defineProperty(fun,'Super',{ writable:true,enumerable:false });
  Object.defineProperty(fun,'Mixin',{writable:true,enumerable:false });
  Object.defineProperty(fun.prototype,'Mixin',{writable:true,enumerable:false });
  fun.Mixin=function(cls) { Mixin(fun, cls); }
  fun.prototype.Mixin=function(cls) {
    if(typeof cls=='function') extend(this,cls.prototype);
    else if(typeof cls=='object' && cls.constructor == Object)
      extend(this,cls);
    this.supers.push(cls)
  }
  if(name=='Unnamed' && fun.name) name=fun.name;

  var currentScript;
  /* this switch is for IE9-11 and Safari compatibility */
  /*if(document.currentScript)
    currentScript=document.currentScript;
  else {
    var scripts=document.getElementsByTagName('script');
    currentScript=scripts[scripts.length-1];
  }*/
  currentScript=getCurrentScript();
  if(currentScript.Module) {
    fun.src=currentScript.Module.filename+"#"+name;
  }
  return fun;
}

extend(Module.Template,{
  Class:function Class(def) {
    var cls=window.Class(def);
    this[cls.name]=cls;
    return cls;
  }
});


Module(function M() {
  M.Index(
    'DOM',
    'basic',
    'events',
    'interactive',
    'keyboard',
    'svg',
    'tables',
    'transform',
    'layout',
    'form'
  );
});
