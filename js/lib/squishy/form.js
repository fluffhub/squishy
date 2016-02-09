Module(function M() {
  M.Import('squishy/DOM squishy/interactive',function(DOM,interactive) {
    var MomentaryButton=interactive.MomentaryButton;
    var LayoutItem=DOM.LayoutItem;
    M.Class(function C() {
      C.Super(LayoutItem);
      C.Init(function Submit(value,cls,callback) {
        LayoutItem.call(this,'input',cls,null);
        this.attrs({type:"submit"});
      });
    });
    M.Class(function C() {
      C.Super(LayoutItem);
      C.Init(function Form(cls, callback, context) {
        LayoutItem.call(this,'form',cls,null,context);
        this.values={};
        this.callback=callback;
        this.element.onsubmit=this.handle(this.callback);
        this.fields={};
      });
      C.Def(function addField(name,field,value) {
        this.fields[name]=field;
        this.add(field);
      });
    });
    M.Class(function C() {
      C.Super(LayoutItem);
      C.Init(function TextInput(name,value,callback) {
        LayoutItem.call(this,'input','',name);
        if (callback) this.onchange=callback;
        else  this.onchange=function() {};
        if(value) this.value(value);
        this.element.onchange=this.handle(this.onchange);
      });
      C.Def(function value(val) {
        if(val) this.element.value=val;
        else return this.element.value;
      });
      C.Def(function enable(val) {

      });
      C.Def(function disable(val) {
      });
      C.Mixin({
        change:function() {}
      });
    });

    M.Class(function C() {
      C.Super(LayoutItem);
      C.Init(function TextBox(name,content,callback,context) {
        var val = '';
        var cls = null;
        if(context) {
          cls=context.cls || null;
          val=context.value || '';
        }

        LayoutItem.call(this,'textarea',cls,'',{type:'text',name:name});
        if(val!='') this.add(val);
        if (callback) this.change=callback;
        this.element.onchange=this.handle(this.change);
        if(content) this.element.value=content;
      });
      C.Def(function value(val) {
        if(val) this.element.innerHTML=val;
        else return this.element.innerHTML;
      });
      C.Mixin({change:function() {}});
    });
    M.Class(function C(){
      C.Super(LayoutItem);
      C.Init(function Checkbox(name,callback,value,cls) {
        var props={type:'checkbox',name:name};
        if(value) props['checked']='true';
        LayoutItem.call(this,'input',cls,'',props);
        if (callback) this.change=callback;
        this.element.onchange=this.handle(this.change);
      });
      C.Def(function value(val) {
        if(val) this.attrs({checked:val});
        return this.element.getAttribute('checked');
      });
      C.Mixin({change:function() {}});
    });
    var FileInput=M.Class(function C() {
      C.Super(LayoutItem);
      C.Init(function FileInput(name,cls,callback) {
        var props={type:'file',name:name};
        LayoutItem.call(this,'input',cls,'',props);
        if(callback) this.change=callback;
        this.element.onchange=this.handle(this.change);
      });
      C.Def(function handle(fun) {
        var that=this   ;
        return function() {
          var input=this;
          if (input.files && input.files[0]) {
            fun.call(that,input.files[0]);
          }
        };
      });
    });
    M.Class(function C() {
      C.Super(FileInput);
      C.Init(function ImageFileInput(name,cls,callback) {
        FileInput.call(this,name,cls,callback);
        this.attrs({accept:'image/*'});
      });
    });
    var Caption=M.Class(function C() {
      C.Super(LayoutItem);
      C.Init(function Caption(value) {
        LayoutItem.call(this,"span","caption");
        this.content(value);
      });
    });
    var FormField=M.Class(function C() {
      C.Super(LayoutItem);
      C.Init(function FormField (name, caption, input) {
        LayoutItem.call(this,'div','field ',name);
        if(caption) {
          this.caption=caption;
          this.add(new Caption(caption));
        }
        if(input) {
          this.add(input);
          this.input=input;
        }
        if(input&&caption) {
        }
      });
    });
    M.Class(function C() {
      C.Super(FormField);

      C.Init(function TextField(name,title,callback,context) {
        FormField.call(this,name,title,new TextInput(name,null,callback,context));
      });
    });
    M.Class(function C(){
      C.Super(FormField);

      C.Init(function URL(name,title,callback,context) {
        if(context)
          var cls=context.cls || '';
        FormField.call(this,name,title,new TextInput(name,null,callback,context));
      });
    });
    M.Class(function C(){
      C.Super(FormField);

      C.Init(function Selector(name,title,callback,values) {
        var se = new LayoutItem('select','selector:'+name,null,{name:name});
        if(values instanceof Array) {
          for (var i in values) {
            value=values[i];
            o=new LayoutItem('option',null,null,{name:value});
            o.content(value);
            se.add(o);
          }
        }else {
          for (var value in values) {
            o=new LayoutItem('option',null,null,{name:value});
            o.content(values[value]);
            se.add(o);
          }
        }
        FormField.call(this,name,title,se);
      });
    });
    M.Class(function C(){
      C.Super(FormField);

      C.Init(function CardSelector(name,title,callback,values) {
        var bs = new ButtonSet({});
        if(values instanceof Array) {
          for (var i in values) {
            value=values[i];
            bs.add(new MomentaryButton(value,value,callback,{}));
          }
        }else {
          for (var value in values) {
            bs.add(new MomentaryButton(value,values[value],callback,{}));
          }
        }
        FormField.call(this,name,title,bs);
      });
    });
  });
});
