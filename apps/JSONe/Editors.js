Module(function M() {
  /* @TODO:  Do something better with these ad hoc style shets*/
  document.styleSheets[0].addRule(".object.editor:before",
                                  "");

  document.styleSheets[0].addRule(".EditorItem",
                                  "min-height:1em;min-width:50px;overflow:visible;"+
                                  "width:auto;height:auto;margin:0.2em;"+
                                  "background-color:rgba(100,100,100,0.5)"+
                                  "margin-left:1px;"+
                                  "white-space:no-wrap;float:left;position:relative;");

  document.styleSheets[0].addRule(".object.editor .caption",
                                  "padding:0 0.25em;font-size:1em;"+
                                  "line-height:1.5em;float:left;clear:both;"+
                                  "background-color:black;color:white;")

  document.styleSheets[0].addRule(".object.editor",
                                  "clear:both;float:left;height:auto;");
  document.styleSheets[0].addRule(".EditorItem input",
                                  "font-size:1em;line-height:1.5em;height:1.5em;");
  document.styleSheets[0].addRule(".editor.array",
                                  "clear:both;min-width:6em;");

  document.styleSheets[0].addRule(".editor.array:before",
                                  "position:absolute;content:'[';left:-0.1em;"+
                                  "font-size:1.5em;line-height:1.5em;width:0.1em;");
  document.styleSheets[0].addRule(".editor.array:after",
                                  "position:absolute;content:']';"+
                                  "font-size:1.5em;line-height:1.5em;width:0.1em;right:-0.1em;");

  document.styleSheets[0].addRule(".number.editor",
                                  "width:2em;position:relative;float:left;")
  document.styleSheets[0].addRule(".string.editor",
                                  "float:left;clear:both;position:relative;");
  document.styleSheets[0].addRule(".array>.EditorItem:after",
                                  "content:',';float:left;display:block;"+
                                  "width:1em;height:1em;");
  document.styleSheets[0].addRule(".array.empty",
                                  "width:2em;height:2em;");
  document.styleSheets[0].addRule(".object.editor .object.editor",
                                  "transform:scale(0.45);opacity:0.8;transform-origin:top left;-webkit-transform-origin:top left;");
  document.styleSheets[0].addRule(".EditorItem",
                                  "border:1px solid #555;border-left:3px solid black;overflow:hidden;");


  /* M.Import('squishy/DOM',function(DOM) {
  M.Import('squishy/events',function(events) {
  M.Import('squishy/interactive',function(interactive) {
  M.Import('squishy/form',function(form) {*/
  M.Import('squishy/DOM squishy/events squishy/interactive squishy/form',function(DOM,events,interactive,form) {
    //var future=document.currentScript.src;

    var StringEditor=M.Class(function C() {
      C.Super(form.TextInput);
      C.Init(function StringEditor(name,val,address,callback) {
        form.TextInput.call(this,name,val,callback);
        this.address=address;
        this.addClass("string editor");
      });
    });
    var TextEditor=M.Class(function C() {
      C.Super(form.TextBox);
      C.Init(function TextEditor(name,val,address,callback) {
        form.TextBox.call(this,name,val,callback);
        this.address=address;
        this.addClass("string editor");
      });
    });
    var NumericEditor=M.Class(function C() {
      C.Super(form.TextInput);
      C.Init(function StringEditor(name,val,address,callback) {
        form.TextInput.call(this,name,val,callback);

        this.addClass("number editor");

      });
    });
    var EditorItem=M.Class(function C() {
      C.Super(DOM.LayoutItem);
      C.Mixin(events.hasEvents);
      C.Init(function EditorItem(name,address,parent,depth,window) {
        DOM.LayoutItem.call(this,"div","EditorItem");
        var row=parent[name];
        //console.debug('editoritem');
        //console.debug(window);
        this.window=window;
        this.address=address;
        this.name=name;
        this.value=row;
        this.depth=depth;
        this.addEvent("context","contextmenu",function(e) {
          e.preventDefault();
          e.stopPropagation();
          //console.debug(address);
        });
        var LI=this;
        this.enableEvents("context");
        this.caption=new form.Caption(name);
        if(this.address) {
          this.addEvent('take',"mousedown touchstart", function(ev) {
            if(ev.which==1) {
              ev.preventDefault();
              LI.enableEvents('leave');
              LI.timer=setTimeout(function() {
                LI.ghost=LI.window.Hold(LI,ev);
              },200);
            }
          },this.caption.element);
          this.addEvent('leave',"mouseup touchend",function(ev) {
            clearTimeout(LI.timer);
            LI.disableEvents('leave');
          });
        }
        this.enableEvents('take', 'leave');


      });
      C.Def(function draw() {
        var row=this.value;
        var name=this.name;
        var address=this.address;
        var depth=this.depth;
        var window=this.window;
        var type=typeof(row);
        this.add(this.caption);

        this.item=row;
        //  this.add(this.item);
        if(type=="string") {
          this.add(new StringEditor(name,row,function change() {
            row[name]=this.value();
          }));
        }
        if(type=="number") {
          this.add(new NumericEditor(name,row,function change() {
            row[name]=this.value();
          }));
        }
        if(type=="function") {

        }
        if(type=="object") {
          var EI=this;
          //   Import(future,function(future) {
          var oe;

          if(row instanceof Array) {
            oe=new M.Self.ArrayEditor(row,address,depth-1,window)
            EI.add(oe);
            oe.draw();


          } else {
            if(row instanceof Object) {
              oe=new M.Self.ObjectEditor(row,address,depth-1,window);
              EI.add(oe);

              oe.draw();


            }
          }
          EI.element.style.width=oe.element.offsetWidth*0.5+"px";
          EI.element.style.height=oe.element.offsetHeight*0.5+"px";

          // });
        }
      });
    });
    var ObjectEditor=M.Class(function C() {
      C.Super(DOM.LayoutItem);

      C.Init(function ObjectEditor(obj,address,depth,window) {
        DOM.LayoutItem.call(this,"div","object editor");
        this.window=window;
        ////console.debug('oe window');
        ////console.debug(window);
        var address=address || "";
        this.depth=depth||5;
        var GE=this;
        ////console.debug(depth);
        this.object=obj;
        this.address=address;
        this.draw();

      });
      C.Def(function draw(object,depth) {
        var obj=object || this.object;
        var GE=this;

        var depth=depth || this.depth;
        var keys=Object.keys(obj);
        if(keys.length==0) GE.addClass("empty");
        else if(depth>0)
          keys.forEach(function (name) {
            ////console.debug(name);
            if(GE.add) GE.addItem(name,depth);
          });
      });
      C.Def(function addItem(name,depth) {
        var editor=new EditorItem(name,this.address+"."+name,this.object,depth,this.window);
        //  this.window.add(editor);


        //   editor.remove();
        this.add(editor);
        editor.draw();
      });

    });
    var ArrayEditor=M.Class(function C() {
      C.Super(ObjectEditor);

      C.Init(function ArrayEditor(obj,address,depth,window) {
        ObjectEditor.call(this,obj,address,depth,window);
        this.addClass("array");

      });
    });
  });
});
/*});
});
});*/
