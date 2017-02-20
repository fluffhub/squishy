
//var Squishy=document.currentScript;

/* <a name="__stack">
__stack provides live debugging.
You can access it at runtime using (global) window.__stack */
Object.defineProperty(window, '__stack', {
  get: function(){
    var orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function(_, stack){ return stack; };
    var err = new Error;
    Error.captureStackTrace(err, arguments.callee);
    var stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
  }
});


/* <a name="__line">
__line provides live debugging.
You can access it at runtime using (global) window.__line
*/
Object.defineProperty(window, '__line', {
  get: function(){
    return __stack[1].getLineNumber();
  }
});


/* <a name="__kwargs">
kwargs allows a standard way to pass hash arguments to a function call.
*/
Function.prototype.kwargs=function kwargs(args) {
  /* if args length >=1,
        if the last arg is an obj,
            use last arg as **kwargs
            and use n-1 args as *args
        otherwise
            use n args as *args
  */

  this._kwargs={};
  var AL=this.arguments.length;
  for (var argname in args) {
    this._kwargs[argname]=args[argname];
  }
  if(AL>0) {
    var argnames=Object.keys(args);
    if(typeof(this.arguments[AL-1]!==null&&this.arguments[AL-1])=="object"&&this.arguments[AL-1].constructor==Object) {
      var kwargs=this.arguments[AL-1];
      AL=AL-1;

      for(var argname in kwargs) {
        this._kwargs[argname]=kwargs[argname];
      }
    }
    if(AL>0) {
      /* *args remain to be added */
      for(var i=0;i<AL;i++) {
        this._kwargs[argnames[i]]=this.arguments[i];
      }
    }
  }
  return this._kwargs;

}

/*  <a name="getCurrentScript">
getCurrentScript tries to get the current executing script tag.
this doesn't work correctly in older safari and internet explorer. */
function getCurrentScript() {
  if(document.currentScript)
    return document.currentScript;
  else {
    if(getCurrentScript.scripts&&getCurrentScript.scripts.length) { }
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
    }
  }
}
var Squishy=getCurrentScript();


/* <a name="extend">
extend copies enumerable properties from one object to another.
can be used via reference or return. */
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


/* Global module initializer.
Is used in every module file at the beginning to wrap the entire file.
Can also be used directly as an initializer to create bare modules.
Resulting modules are assigned to the associated <script> and are instances
of this Module function.
*/
function Module() {
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
                  //                  M.loaded=true;
                  //extend(M,loaded);
                  //if(M.loaded)

                  delete M.parent[loaded.name];
                  M.parent[loaded.name]=loaded;
                  callback(loaded);
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
    element=getCurrentScript();
    if(element && !("Module" in Object.keys(element))) {
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
      M.dir=element.root;
      Object.defineProperty(callback,'Self',{value:M});
      Object.defineProperty(M,'element',{value:element});
      if(M.name) {} else {

        if(vn!="index") M.name=vn;
        else {
          M.name=ps.slice(-3,-2)[0]
        }

      }
      Object.defineProperty(M,'waiting',{value:0,writable:true});
      Object.defineProperty(M,'Template',{value:{},writable:true});
      for(var templatefield in window.Module.Template) {
        var Field=function Field() {
          // try { throw new Error(""); } catch(e) { console.debug({LN:e}); }

          var ob=Field.fun.apply(M,arguments);
          if(ob!==undefined&&ob!==null&&ob instanceof Object){
            Object.defineProperty(ob,"funcall",{value:__stack[1]});
          }


          return ob;
        };
        Field.fun=window.Module.Template[templatefield];
        M.Template[templatefield]=Field;
      }
      extend(callback,M.Template);
      element.ran=false;
      callback.continue=function() { element.finish() };
      callback.call(M);
      M.loaded=true;
      if(M.waiting==0 && element.finish) element.finish();
      else element.ran=true;

      /* Live component
      this adds the modules path and module obj to the live system registry
      since running in the root import command, this must immediately import the dependencies
      of squishy/live in order to work properly without stalling out

      */
      window.Import("squishy/system","squishy/live",function(system,live) {
       // window.Import(parser.href,function(a) {

        live.init(parser.href,M);
      //  });
      });

    }
    else {
      var M=new window.Module();
      for(var templatefield in window.Module.Template) {
        var field=window.Module.Template[templatefield];
        M.Template[templatefield]=function Field() {

          var ob=field.apply(M,arguments);
          if(ob!==undefined&&ob!==null)ob.funcall=__stack[1];
          return ob;
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
    var result;
    if(typeof(arguments[0])=='function') {
      //include the module's path in the function
      arguments[0].src=this.filename+'#'+arguments[0].name;
      result=this[arguments[0].name]=arguments[0];
    } else {
      if(arguments.length==2) {
        result=this[arguments[0]]=arguments[1];
      }
    }

    return result;

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
        if(k.slice(-1)=="/") {
          NM=new window.Module(this.element.root+"/"+k+"index.js");

          k=k.slice(0,-1);

        }
        else
          NM=new window.Module(this.element.root+'/'+k+'.js');
      else
        NM=new window.Module();
      NM.parent=this;
      this[k]=NM;
    }
  },
  Import:function Import(paths,callback2) {
    if(typeof this.waiting=='number') {} else this.waiting=0;
    var args=Array.prototype.slice.call(arguments);
    if(args.length>2) {
      callback2=args.slice(-1)[0];
      paths=args.slice(0,-1);
    }
    if(paths instanceof String) paths=[paths];
    if(callback2 instanceof Function) {} else { paths.push(callback2); }
    this.waiting++;
    var M=this;
    window.Import(paths,function() {
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
function Import(path,callback) {
  var that;
  var args1=Array.prototype.slice.call(arguments);
  var callback;

  var callback=callback || function () { };
  if(this instanceof Import) {
    that=this;

    //check if relative path or uri

    if(typeof(path)=="string") {
      var parser = document.createElement('a');
      var fullpath;
      var r = new RegExp('^(?:[a-z]+:)?//', 'i');
      var absolute=false;
      var dirname='chewy';
      var parent=null;

      if (r.test(path)||path[0]=='/' ) {

        //absolute path, use as-is

        parser.href = path;
        path=parser.pathname;
        console.debug(path);
        absolute=true;
      } else {

        //the path is relative, either:
        //     to an index.js, given a data-root by module call, or
        //     to the base url of the page


      }

      var ps=path.split('/');
      var fn=ps.slice(-1)[0];
      if(fn=="") {
        ps[ps.length-1]=fn="index.js";
        path=path+"index.js";
      }


      var fns=fn.split('.');

      var ft='';
      var vn=fn;
      if(fns.length>1) ft=fns.slice(-1)[0] || '';
      if(fns.length>1) vn=fns.slice(0,-2).join('.');



      else if(ps.length==1) dirname=ps[0];
      var dir=ps.slice(0,-1).join('/');
      callback.ran=false;
      this.path=path;

      if(!absolute) {
        //preprocess the uri to convert it from a relative to a absolute path
        if(ps.length>=1) {

          dirname=ps[0];



          parent=document.querySelector('script[data-name=\''+dirname+'\']');


          if(parent!=null) {
            //if(path[0]!='/') path='/'+path;
            if(ps.length==1) path=parent.root+'/'+ps[0];
            else path = parent.root+'/'+ps.slice(1).join('/');
          }
          else {
            //this is provided as a relative path (to the document root)

            var parser = document.createElement('a');
            parser.href = path;
            path=parser.pathname;
          }

        }
      }

      fullpath=parser.href;

      if(ft in Import.types) {
        Import.types[ft](path,callback);
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
            if(callback.error) callback.error(script);
            else {
              console.debug("failed to load script:")
              console.debug({error:script});
              //throw new Error(script);
            }
          } else {
            if(script.dependencies) script.dependencies[script.dependencies.length]=callback;
            else script.dependencies=[callback];
            if(callback.error) {
              if(script.errors) script.errors[script.errors.length]=callback.error;
              else script.errors=[callback.error];
            }
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
          script.errors=[function err(v) { console.debug("script load error: ");console.debug(v); }];
          Object.defineProperty(this,'element',{value:script});
          var waiting=0;
          if(parent && vn in parent.Module) script.Module=parent.Module[vn];
          else script.Module=new window.Module(path);
          script.dependencies=[callback];
          if(callback.error) {
            if(script.errors&&script.errors.length) script.errors.push(callback.error);
            else script.errors=[callback.error];
          }
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


    } else {
      callback(path);
      callback.ran=true;
    }
  }
  else {
    var paths=[];
    if(args1.length<=2) {
      if(path instanceof Array) {
        paths=path;
      }
      if(typeof path=='string') {
        paths=path.split(' ')
      }
    } else {
      callback=args1.slice(-1)[0];
      paths=args1.slice(0,-1);
    }
    that=[];
    var n=paths.length;
    var waiting=n;

    var args=[];
    paths.forEach(function(path,index) {
      that[that.length]=new Import(path.trim(),function resolve(item) {

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
Import.types={
  css:function(path,callback) {

    var exists=document.querySelector('link[href="'+path+'"]');
    var element;
    if(exists)
      element=exists;
    else {
      element=document.createElement("link");
      element.setAttribute("rel","stylesheet");
      element.setAttribute("href",path);
      element.onload=function(e) { callback(element) };
      document.head.appendChild(element);
    }
    return element;
  },
  bmp:function(path,callback) {
    var element=document.createElement("img");
    element.setAttribute("src",path);
    element.onload=function(e) { callback(element) };
    return element;
  },
  jpg:function(path,callback) {
    return Import.types.bmp(path,callback);
  },
  png:function(path,callback) {
    return Import.types.bmp(path,callback);
  },
  svg:function(path,callback) {

  },
  html:function(path,callback) {

  }
};
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

  var currentScript=getCurrentScript();
  if(currentScript.Module) {
    fun.src=currentScript.Module.filename+"#"+name;
  }
  fun.isClass=true;
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
  M.Def("Module",Module);
  M.Def("Class",Class);

});

var define=Module.define=function define(n,r,F){ /* F = function (require, exports, */
  Module(function M() {
    var name,dep,fun;

    console.debug({define:{n:n,r:r,F:F}});

    var exported={},returned;
    if(typeof(n)=="string") { name=n;   }
    else if(n instanceof Function) {
      //common JS wrapping
      //the result of this function
      // becomes the value of the thing????
      fun=n;

    } else if(n instanceof Array)  dep=n;
    if(r instanceof Function)  fun=r;
    else if (r instanceof Array)  dep=r;
    if(F instanceof Function) fun=F;

    var script=getCurrentScript();
    function load(rets,exps) {
      if(rets) {
        script.Module=rets;
      } else {
        Object.keys(exps).forEach(function(exp) {
          M.Def(exp,exps[exp]);
        });
      }
    }
    if(dep&&dep.length&&dep.length>0) {
      for(var i=0;i<dep.length;i++) {
        if(dep[i]=="exports") {
          dep[i]=M.Self.filename
        }
      }
      Import(dep,function() {
        var imports=Array.prototype.slice.call(arguments);
        var req=function(v) {
          for (var i=0;i<r.length;i++) {
            if(r[i]==v) {
              return imports[i];
            }
          }
        }
        if(fun&&fun instanceof Function) {
          returned=fun.apply(this,imports);
          load(returned,exported);
        }
      });
    } else {
      if(fun&&fun instanceof Function) {
        var req=function(v) {}
        returned=fun.call(this,req,exported);
        load(returned, exported);
      }
    }
  });
}
define.amd={};

