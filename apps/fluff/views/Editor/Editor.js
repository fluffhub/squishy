
Module(function M() {
M.Import("squishy/DOM", "squishy/basic", "squishy/layout",
         "squishy/interactive", "squishy/keyboard", "squishy/events",
         "Editor/UserBrowser", "Editor/Library", "Editor/DiagramEditor",
         "Editor/Models.js",
function(DOM,basic,layout,
          interactive,kb,events,
          ub,op,de,
          Ms) {
  window.Ms=Ms;
  var hasEvents=events.hasEvents;
  var UserBrowser=ub.UserBrowser;
  var Frame=DOM.Frame;
  var TabbedPane=interactive.TabbedPane;
  var GridLayout=layout.GridLayout;
  var Pane=basic.Pane;
  var Library=op.Library;

  var Program=Ms.Local.Program;
  var ProgramBrowser=de.ProgramBrowser;
  var ProgramEditorWindow=de.ProgramEditorWindow;
  var PanelEditor=de.PanelEditor;
  var keyboard=kb.keyboard;

  var Tile=M.Class(function C() {
    C.Super(interactive.MomentaryButton);
    C.Init(function Tile(callback,name) {
      interactive.MomentaryButton.call(this,name,'FSTile',callback);

      this.addClass('card clickable');
    });
  });
  var EditorHome=M.Class(function C() {
    C.Super(Pane);
    C.Init(function EditorHome(editorwindow) {
      var EH=this;
      this.window=editorwindow;
      Pane.call(this,'home','Home');
      this.contents.add(new ObjectCard(function new_program(e) {
//        e.preventDefault();
        EH.window.create('Program');
      },"new Program"));
    });
  });

  var editors={
    Graph:ProgramEditorWindow,
  };
  var objects={
    Program:Program
  };

  var EditorWindow=M.Class(function C() {
    C.Super(Frame);
    C.Mixin(hasEvents);
    C.Init(function EditorWindow() {
      Frame.call(this,window,document);
      var W=this;
      var EW=this;
      var GL = new GridLayout(W.element);

      EW.TP = new TabbedPane(W);

      EW.DB = new TabbedPane(W);
      EW.DB.header.addClass('OpenFileBrowser');


      var UB = new UserBrowser(EW);
      var NP = this.pallette= new Library(EW);

      var PB = new ProgramBrowser();

      this.pallette.Import('fluff');
      this.pallette.Import('squishy');

      this.editors=[];

      var H = new EditorHome(EW);

      EW.DB.addTab('home','Home',H);
      EW.TP.addTab('UB','Workspace',UB);
      EW.TP.addTab('NP','Library',NP);
      EW.TP.addTab('PB','Properties',PB);

      Object.defineProperty(this,"cursor",{value:{x:0,y:0},writable:true});
      this.addEvent("cursorpos","mousedown mousemove touchmove touchstart",function oncursorpos(e) {
        if(e) {
          if(e.touches) {
             EW.cursor.x=e.touches[0].clientX;
            EW.cursor.y=e.touches[0].clientY;
          } else {
            EW.cursor.x=e.clientX;
            EW.cursor.y=e.clientY;
          }
        }
      });

      Object.defineProperty(this,"contextactive",{value:false,writable:true});
      this.contextmenu=new interactive.ButtonSet("div","contextmenu");
      this.contextmenu.addEvent("closeContext"," mouseup touchend",function() {
          EW.clearContext();
        });
      this.contextmenu.enableEvents("closeContext");
      this.addEvent("context","contextmenu",function oncontextmenu(e) {
        if(e) {
         // e.preventDefault();
         // e.stopPropagation();
        }
        var pos=this.cursor;
        var ContextMenu=EW.contextmenu
        ContextMenu.element.style.position="absolute";
        ContextMenu.element.style.left=pos.x-ContextMenu.element.offsetWidth+10+"px";
        ContextMenu.element.style.top=pos.y-ContextMenu.element.offsetHeight-35+"px";
        ContextMenu.element.style.width="auto";
        ContextMenu.element.style["z-index"]="10000000";
        EW.add(ContextMenu);

        EW.contextactive=true;

        return false;

      });
      this.element.addEventListener("contextmenu",function startcontext() {
        EW.clearContext();

      },true);
      //TODO:
      //if user does not own the program, make viewer only,
      //and set program editor to have "clone" option if avialable

      this.enableEvents("cursorpos","context","closeContext");
      EW.TP.header.addClass("tasks");

      GL.addRow([EW.TP.header,EW.DB.header],30);
      GL.addRow([EW.TP,EW.DB]);

      GL.addCol([EW.TP.header,EW.TP],265);
      GL.addCol([EW.DB.header,EW.DB]);

      GL.resize();
    });
    C.Def(function create(type) {
      var EW=this;
        var P;
      try {
        P=objects[type].create({ }, function (obj) {
          EW.open(obj);
        });
        } catch(e) {
       //////console.debug("can't create "+type);
        throw e;
      }

    });
    var contextitems=[];
    C.Def(function clearContext() {
      var EW=this;
      //////console.debug('clearing');
      this.contextmenu.elements.forEach(function (item) {
        item.remove();
      });
      this.contextmenu.remove();
      this.contextactive=false;
      var EW=this;
    });
    C.Def(function Context(ContextMenu) {
      var EW=this;
      return function addContext() {
        ////console.debug(ContextMenu);
       // if(!(EW.contextmenu.element.contains(ContextMenu.element)))
      //  contextitems[contextitems.length]=ContextMenu;
        EW.contextmenu.add(ContextMenu);
        return false;
      };
    });
    C.Def(function Hold(item,ev) {
      this.holding=item;
      //check all editor windows for droppables
      //enable mouseup drop action
        //LI.window.Drag(


      for (var name in this.editors) {
        var editor=this.editors[name];
        ////console.debug(editor);
        if(editor.events) {
          if(editor.events.drop)
            editor.enableEvents('drop');
          if(editor.events.dragenter)
            editor.enableEvents('dragenter');
        }
      }
      var ghost=new DOM.LayoutItem('div');
      ghost.addClass('ghost');
      ghost.element.style.position="fixed";

      ghost.add(item.clone());
      if(ev) {
        var P;
        if(ev.touches)
          P={x:ev.touches[0].clientX,y:ev.touches[0].clientY};
        else
          P={x:ev.clientX,y:ev.clientY};
        ghost.element.style.top=P.y+'px';
        ghost.element.style.left=P.x+'px';
      }
      this.add(ghost);
      this.ghost=ghost;
      var EW=this;
      this.element.style.cursor="no-drop";
      this.addEvent('carry',"mousemove touchmove",function(ev) {
       var P;
        if(ev.touches)
          P={x:ev.touches[0].clientX,y:ev.touches[0].clientY};
        else
          P={x:ev.clientX,y:ev.clientY};
        EW.ghost.element.style.top=P.y+'px';
        EW.ghost.element.style.left=P.x+'px';
      });
      this.addEvent('drop',"mouseup touchend", function(ev) {
        EW.Drop();
        //////console.debug('dropping');
        EW.disableEvents('carry');
        EW.disableEvents('drop');
      });
      this.enableEvents('carry','drop');
      return item.ghost;
    });
    C.Def(function Drop() {
      if(this.holding){
        this.ghost.remove();
        delete this.ghost;

      }
      this.holding=null;
      for (var name in this.editors) {
        var editor=this.editors[name];

        if(editor.events) {
          if(editor.events.drop)
            editor.disableEvents('drop');
          if(editor.events.dragenter)
            editor.disableEvents('dragenter');
        }
            this.element.style.cursor="default";
      }

    });
    C.Def(function open(value) {

      var EW=this;
      var PE = null;
      var type="";

      if(value.cls) {
        if( value.cls.indexOf('#')) {
          var cls=value.cls.split('#');
          type=cls[1];
        }
        else {
         type=cls;
        }
      }
      else {
        try{
          type=value.constructor.modelname;

        } catch(e) {
          //////console.debug(value);
          try {
            type=value.__proto__.constructor.name;
          } catch(e) {
            //////console.debug('full erroring');
          }
        }
      }
      if(type in editors)  PE=new editors[type](value, EW);
      this.editors[this.editors.length]=PE;
      var name='Unnamed';
      var iid=type+value.id;
      if(iid in this.DB.panes) {
        PE=this.DB.panes[iid];
      }
      else {
        //var that=PE;
        if(value.name!='')  name=value.name;

        this.DB.addTab(iid,name,PE,'',function() {
          //this.draw_overlay();
          //open('program',{id:PE.program.id});
          EW.select(iid,PE);
          PE.redraw();
          //////console.debug('changing');
        });
      }

      //select(iid,PE);
      this.DB.tabset.change(iid);
    });
    C.Def(function select(name,item) {
      this.TP.panes['PB'].remove();
     // this.TP.panes['NP'].remove();
      this.TP.panes['PB']=item.editor;

      this.TP.add(this.TP.panes['PB']);
      item.editor.draw();
      this.TP.panes['PB'].hide();

      this.TP.tabset.change('PB');
        //		DB.tabset.change(name);
    });
  });
  window.ew=new EditorWindow();
});
});
