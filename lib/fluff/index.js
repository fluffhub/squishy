var Fluff=document.currentScript;
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
function isInt(value) {
  return !isNaN(value) && (function(x) { return (x | 0) === x; })(parseFloat(value))
}
function BlockError(message,block) {
  this.message=message;
  this.block=block;
}
/*
  Block is the main base class for the data flow language.
  All possible blocks starting with the graph itself inherit the Block class.
  The Block class uses the same code template format as Class and Module:

  Block(function B() {
    B.Name("Blockname");
    ...
  });


*/
var Block=Class(function C() {
  C.Init(function Block() {
    if(this instanceof Block) { } else {
      var blkname='Unnamed';
      var def = arguments[0];
      var fun = Class(function C() {
        C.Super(Block);
        C.Init(function Block(parent, val) {
          var blk;
          var args=Array.prototype.slice.call(arguments,1);
          blk=this;

          Object.defineProperties(blk,{
            ran:{value:false,writable:true,enumerable:false,configurable:true},
            Error:{writable:true,configurable:true,enumerable:false},
            running:{value:false,writable:true,enumerable:false,configurable:true},
            runnable:{value:false,enumerable:false,configurable:true},
            parent:{value:null,enumerable:false,configurable:false,writable:true},
            self:{value:blk,enumerable:false,configurable:false,writable:false},
            dependencies:{value:{},writable:true,enumerable:false},
            dependents:{value:{},writable:true,enumerable:false},
            inputs:{value:rcopy([],this.__proto__.inputs),writable:true,configurable:true,enumerable:true},
            outputs:{value:rcopy([],this.__proto__.outputs),writable:true,enumerable:true,configurable:true},
            values:{value:{},enumerable:false,writable:true},
            call:{value:function() {},enumerable:false,writable:true},
            waiting:{value:0,enumerable:false,writable:true},
            log:{value:"",enumerable:true,writable:true},
            console:{value:window.console},
            inputwires:{value:{},enumerable:false,writable:true},
            outputwires:{value:{},enumerable:false,writable:true},
            error:{enumerable:false,configurable:true,
                   set:function(v) {
                   //  this.error=v;
                     if(this.Error) this.Error(v);
                   },
                  },
          });

          extend(blk,{
            dimensions:rcopy({},this.__proto__.dimensions),
            attributes:{},
           });
      //    if(parent instanceof Block) {
             this.parent=parent;
      //    }
          if(blk.__call__) {
            eval('with(blk) { blk.call='+blk.__call__.toString()+'; }');
          }
          else {
          }
          if(this.__init__) {
             this.__init__.apply(this,args);
          }
          this.inputs.forEach(function (pin) {
            var pinname=pin;
            if(isInt(pin)) pinname='$'+pin;
            blk.values[pinname]=null;
            Object.defineProperty(blk,pinname,{
              get:function() { return blk.values[pinname] },
              set:function(v) { blk.values[pinname]=v; },
              configurable:true
            });
          });
          this.outputs.forEach(function (pin) {
            var pinname=pin;
            if(isInt(pin)) pinname='$'+pin;
            blk.values[pinname]=null;
            Object.defineProperty(blk,pinname,{
              get:function() { return blk.values[pinname] },
              set:function(v) { blk.values[pinname]=v; },
              configurable:true
            });
          });
          if(val instanceof Object) {
            try{
            extend(this,val);
            }catch(e) {
              console.debug(e);
            }
          }


          return blk;
        });
        C.Def(function Error(v) {
          console.debug("Error at ");
          console.debug(v);
        });

        C.Def(function run() {
          var waiting=Object.keys(this.dependencies).length;
          for (var name in this.dependencies) {
            var node=this.dependencies[name];
            if(node!==this && !node.ran && !node.running) {
              //this.running=true;
              node.run();
              waiting--;
            }
            console.debug(waiting);
            for (var inputpin in this.inputwires) {
              var wire=this.inputwires[inputpin].split('.');
              var fromnode=wire[0];
              var frompin=wire[1];
              this[inputpin]=this.dependencies[fromnode][frompin];
            }
          }

          if(!this.ran && !this.running ) {
          //  console.log("waiting "+this.waiting);
            this.running=true;

            if (this.call) {
              try {
                this.call();
              } catch(e) {
                this.error=new BlockError("Error in own run",{object:this,error:e});
              }

            }
            this.ran=true;
            this.running=false;
          }
        });

        C.Mixin({
          inputs:[],
          outputs:[],
          values:{},
          repr:'',
          style:'',
          properties:{},
          dimensions:{w:50,h:50},
        });
        //C.Super(Block);
      });
      extend(def,{
        Name:function Name(n) {
          blkname=n;
        },
        Init:function Init(con) {
          fun.prototype.__init__=con;
          if(blkname=='Unnamed') blkname=con.name;
        },
        Def:function Def(f) {
          if(typeof f=='function') fun.prototype[f.name]=f;
          else if (f.name) Object.defineProperty(fun.prototype,f.name,{enumerable:true,value:f});
          else Object.defineProperty(fun.prototype,f,{value:arguments[1],enumerable:true});
        },
        Call:function Call(caller) {

          if(blkname=='Unnamed' && fun.name && fun.name!="") blkname=fun.name;

          Object.defineProperty(fun.prototype,'__call__',{
            value:caller
          });
        },
        Inputs:function Inputs() {
          fun.prototype.inputs=Array.prototype.slice.call(arguments);
          fun.prototype.inputs.forEach(function (a) {
          });
        },
        Outputs:function Outputs() {
          fun.prototype.outputs=Array.prototype.slice.call(arguments);
          fun.prototype.outputs.forEach(function(b) {
          });
        },
        Super:function Super(cls) {
          if(typeof cls == 'object' && cls.constructor == Object) {
            extend(fun.prototype,cls);
          } else if(typeof cls=='function'){
            extend(fun,cls);
            extend(fun.prototype,cls.prototype);
          }
          if(fun.supers) fun.supers.push(cls);
          else fun.supers=[cls];
        },

      });
      def.call();
      fun.blockname=blkname;
      fun.prototype.name=blkname;
      return fun;
    }
  });

});

function Package(callback) {
  var script=document.currentScript;
  extend(callback,{
    Block:function Block(def) {
      var blk=window.Block(def);
      var i=0;
      blk.blockname=(function rename(_name) {
        i=i+1;
        if (_name in script.Module) rename(blk.blockname+i);
        else return _name;
      })(blk.blockname);
      script.Module[blk.blockname]=blk;
      blk.src=script.Module.filename+'#'+blk.blockname;
      return blk;
    },
    Package:function Package() {
      callback.Module.apply(this,arguments);
    }
  });
  window.Module(callback);
}

Package(function P() {

  P.Templates("index.templates.js");
  P.Package('io','control');


  var Graph=P.Block(function C() {
    C.Name('Graph');
    C.Init(function Graph(Model) {
      var G=this;
      this.cls="fluff#Graph"

      if(Model) {
        this.Model=Model;
       // G=this;
      } else {
        this.Model= {
          //id:1,
          cls:"fluff#Graph",
          name:"Program",
          nodes:{},wires:{},
         // inputs:[],outputs:[],
          code:"",
        };
      }
      var callback=callback||function(){};
      Object.keys(this.Model).forEach(function (name) {
        Object.defineProperty(G,name,{
          get: function() { return this.Model[name] },
          set: function(v) { this.Model[name]=v }
        });
      });
    });

    C.Def(function compile(callback) {
      var val=this;
      var nodenames=Object.keys(this.Model.nodes);
      var waiting=nodenames.length;
      nodenames.forEach(function (name) {
        if(val.Model.nodes[name].cls) {
          var cls=val.Model.nodes[name].cls.split('#');
          Import(cls[0],function(M1) {
            var CLS=M1[cls[1]];
            waiting--;
            if(CLS instanceof Function) {
              if(CLS.name=='Block') {
                val.nodes[name]=new CLS(val,val.Model.nodes[name]);
                //val.nodes[name].parent=val;
              }
            }
            if(waiting==0) {
              val.connect();
              callback(val);
            }
          });
        }
      });
      this.runnable=true;
    });
    C.Def(function connect() {
      var g=this;
      g.dependents=[];

      Object.keys(this.wires).forEach(function wires(wirename) {
        var f=g.wires[wirename].start.split('.');
        var t=g.wires[wirename].end.split('.');
        var inputnode=g.nodes[f[0]];
        var outputnode=g.nodes[t[0]];
        var inputpin=f[1];
        var outputpin=t[1];
        outputnode.dependencies[f[0]]=g.nodes[f[0]]
        outputnode.inputwires[outputpin]=f[0]+'.'+inputpin

        if(isInt(inputpin)) inputpin='$'+inputpin;
        if(isInt(outputpin)) outputpin='$'+outputpin;
        outputnode.waiting++;
        if(inputnode.dependents[inputpin])
          inputnode.dependents[inputpin].push(outputnode);
        else
          inputnode.dependents[inputpin]=[outputnode];
        Object.defineProperty(outputnode,outputpin,{
          get: function() {
            return inputnode[inputpin];
          },
          configurable:true
        });
      });
      Object.keys(this.nodes).forEach(function nodes(name) {
        var node=g.nodes[name];
        if(node.dependents) {
          Object.keys(node.dependents).forEach(function deps(pin) {
            var dependents=node.dependents[pin];
            Object.defineProperty(node,pin,{
              set:function(v) {
                node.values[pin]=v;
                dependents.forEach(function(node2) {
                  node2.ran=false;
                  node2.run();
                });

              },configurable:true
            });

          });
        }
      });
    });
    C.Def(function step() {
      console.log("stepping");
      this.reset()
      for (var name in this.nodes) {
     //   if(this.nodes[name].run) {
        try{
          this.nodes[name].run()
        }
        catch(e) {

        }
     //   }
      }
      //print 'Ran at %s'%datetime.datetime.now().isoformat()
    });
    C.Def(function reset() {
      for (var name in this.nodes) {
        this.nodes[name].ran=false
      }
    });

  });
  var Init=P.Block(function B() {
    B.Inputs(1);
    B.Outputs(2);
    B.Init(function Init(obj) {
      Object.defineProperty(this,'instance',{value:null,writable:true});
      var Blk=this;
      if(obj) {
        if(obj instanceof Function) {
          Object.defineProperty(Blk,'Class',{value:obj});
          Blk.repr='new '+obj.name;
        } else {
          if(obj.src) {
            if(obj.src.indexOf('#')) {
              var cls=obj.src.split('#');
              Blk.repr='new '+cls[1];
              Import(cls[0],function(M) {
                Object.defineProperty(Blk,'Class',{value:M[cls[1]]})
              });
            }
          }
        }
      }
    });
    B.Call(function initialize(raw) {
      if(this.instance==null) {
        console.log("Initializing new "+this.Class.name);
        var args=[]
        if($1) {
          if($1.length && !(typeof($1)=='string')) args=$1;
          else args=[$1];

        }
        this.instance=new (Function.prototype.bind.apply(this.Class, args));
      }
      $2=this.instance;
    });

    B.Name('Init');
    B.Def('repr','new');
    B.Def('dimensions',{"w":'auto',"h":25,"x":0,"y":0});
  });
  P.Block(function B() {
    B.Name("Layout");
    B.Super(Init);
    B.Def('repr',"|_");
    B.Def('dimensions',{w:50,h:50,x:0,y:0});
    B.Outputs(1);
    B.Init(function layout(val) {
      //Init.call(this,val);
    });
  });


});



