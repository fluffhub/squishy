Package(function P() {
  P.Templates("io.templates.js");

  P.Block(function B() {
    B.Name("Value");
    B.Def('repr',"var");
    B.Def('dimensions',{w:30,h:25,x:0,y:0});
    B.Outputs(1);
    B.Init(function value(val) {

      if(val) {
        this.value=val.value;
        this.repr=val.repr;
      }
      else {
        this.value=" ";
      }
    });
    B.Call(function value() {
      $1=this.value;
    });
  });

  P.Block(function B() {
    B.Name("Input");
    B.Def("repr",">>");
    B.Def("value",null);
    B.Def("dimensions",{w:25,h:25,x:0,y:0});
    B.Outputs(1);

    B.Init(function Input() {
      var B=this;
      if(this.parent) {
        if(this.parent.inputs)
          this.parent.inputs.push(this.name);
        else
          this.parent.inputs=[this.name];
       /* if(this.parent.Model) {
          if(this.parent.Model.inputs&&this.parent.Model.inputs.length)
            this.parent.Model.inputs.push(this.name);
          else
            this.parent.Model.inputs=[this.name];
        }*/
        Object.defineProperty(this.parent,this.name,{
          configurable:true,
          set:function(v){
            B.value=v;
            B.parent.step();
          },
          get:function(){
            return B.value;
          },
          enumerable:true
        });
      }
    });
    B.Call(function Input() {
      $1=this.value;
    });
  });
  P.Block(function B() {
    B.Name("Output");

    B.Def("dimensions",{w:25,h:25,x:0,y:0});
    B.Def("repr","<<");
    B.Def("value",null);
    B.Inputs(1);
    B.Init(function Output() {
      var B=this;
      if(this.parent) {
        if(this.parent.outputs)
          this.parent.outputs.push(this.name);
        else
          this.parent.outputs=[this.name];
      /*  if(this.parent.Model) {
          if(this.parent.Model.outputs&&this.parent.Model.outputs.length)
            this.parent.Model.outputs.push(this.name);
        //  else
        //    this.parent.Model.outputs=[this.name];
        }*/
        Object.defineProperty(this.parent,this.name,{
          configurable:true,
          set:function(v){
            B.value=v;
            //B.parent.step();
          },
          get:function(){
            return B.value;
          },
          enumerable:true
        });
      }
    });
    B.Call(function Output(){
      this.value=$1;
    });
  });
  P.Block(function B() {
    B.Name("Push");
    B.Def("dimensions",{w:25,h:25,x:0,y:0});
    B.Inputs(1,2);
    B.Outputs(3);
    B.Call(function Push() {
      $3=$1.push(2);
    });
  });

  P.Block(function B() {
    B.Name("Log");
    B.Inputs(1);
    B.Def("dimensions",{w:30,h:30,x:0,y:0});
    B.Def("repr","Log");
    B.Call(function log() {
      console.debug($1);
    });

  });

  P.Block(function B() {
    B.Inputs(1);
    B.Outputs(2);
    B.Name("Access");
    B.Def("repr","");
    B.Def("dimensions",{w:'auto',h:30,x:0,y:0});
    B.Def(function find(address,obj) {
        var names=address.split('.');
        if(names.length>0) {

        if(names.length>1) {
          find.call(this,names.slice(1).join('.'),obj[names[0]]);
        } else  {
            this.attrname=names[names.length-1];
            this.object=obj;
        }
      }
      });
    B.Init(function Access(obj) {
      if(obj) {
        if(typeof(obj)=="string") {
          this.address=obj;
        } else if(typeof(obj=="object")&&obj.address) {
          this.address=obj.address;
        }
      }
      Object.defineProperty(this,'object',{
        value:null,
        enumerable:false,
        writable:true,
        configurable:false
      });
    });
    B.Call(function access() {
      this.find(this.address,this);

     // if($1) this.object[this.attrname]=$1;
      $2=this.object[this.attrname];
    });
  });
  P.Block(function B() {
    B.Inputs(1);
    B.Outputs(0);

    B.Def("dimensions",{w:30,h:30,x:0,y:0});
    B.Name("UserFunction");
    B.Def("repr","f()");
//    B.Def("code","");
    B.Init(function UserFunction(val) {

      if(val) {
        this.fun=val.fun;
        this.fun=val.fun;
      }
      else {
        this.fun=" ";
      }
      var Blk=this;
      eval("with(Blk) { Blk.call=function() { "+Blk.fun+" } }");
    });

  });
  P.Block(function B() {
    B.Inputs(1);
    B.Def("repr","&lt;/>");
    B.Init(function Write(obj) {

    });
    B.Call(function write() {
      document.write($1);
    });
  });
  P.Block(function B() {
    B.Outputs(0);

    B.Def("repr","eval");
    B.Init(function Eval(obj) {

    });
    B.Call(function ev() {
      eval($1);
    });
  });
});
