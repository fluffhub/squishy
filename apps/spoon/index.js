Module(function M() {
  M.Index(

    'Library',
    'Models',
    'UserBrowser'
  );
  M.Import("squishy/DOM","squishy/basic","squishy/layout",
           "squishy/interactive","squishy/keyboard","squishy/events","squishy/svg",

           "spoon/UserBrowser","spoon/Library",
           "spoon/Models","spoon/conf", "squishy/cookies","squishy/membrane",
           function(DOM,basic,layout,
                     interactive,kb,events,svg,
                     ub,op,
                     Ms,conf,cookies,membrane) {

             var hasEvents=events.hasEvents;
             var UserBrowser=ub.UserBrowser;
             var Frame=DOM.Frame;
             var TabbedPane=interactive.TabbedPane;
             var GridLayout=layout.GridLayout;
             var Pane=basic.Pane;
             // var Library=op.Library;

             var theme={}

             new svg.SVG({
               src:"img/filebrowser.svg",
               onload:function(svgfile) {
                 var gs=svgfile.query("*[id]")
                 gs.forEach(function (g) {
                   theme[g.NSattr("id")]=g;
                 });

               }
             });


             var keyboard=kb.keyboard;

             var Tile=M.Class(function C() {
               C.Super(interactive.MomentaryButton);
               C.Init(function Tile(callback,name) {
                 interactive.MomentaryButton.call(this,name,'FSTile',callback);

                 this.addClass('tile');
               });
             });
             var EditorHome=M.Class(function C() {
               C.Super(Pane);
               C.Init(function EditorHome(editorwindow) {
                 var EH=this;
                 this.window=editorwindow;
                 Pane.call(this,'home','Home');

               });
             });



             var HomeWindow=M.Class(function C() {
               C.Super(Frame);
               C.Mixin(hasEvents);
               C.Init(function HomeWindow() {
                 Frame.call(this,window,document);
                 var W=this;
                 var EW=this;

                 this.tasks=new TabbedPane()
                 this.add(this.tasks.header)
                 this.add(this.tasks)

                 this.editors=[];

                 var H = new EditorHome(EW);

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
                 this.enableEvents("cursorpos","context","closeContext");
                 C.Def(function newTask(appName) {
                   var args=Array.prototype.slice.call(arguments,1,-1)
                   var task=null;

                   if(appName in conf.apps) {
                     task=conf.apps[appName].open.apply(this,args)
                     this.tasks.addTab(appName+":"+args.join(" "),appName+":"+args.join(" "),task)
                   }

                 });
                 C.Def(function openFile(file) {
                   //check what app is needed for this file
                   //
                 })
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


                   for (var name in this.tasks) {
                     var editor=this.tasks[name];
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
                   //if(type in editors)  PE=new editors[type](value, EW);
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
                   //this.DB.tabset.change(iid);
                 });
                 C.Def(function select(name,item) {
                   //this.TP.panes['PB'].remove();
                   // this.TP.panes['NP'].remove();
                   //this.TP.panes['PB']=item.editor;

                   //this.TP.add(this.TP.panes['PB']);
                   //item.editor.draw();
                   //this.TP.panes['PB'].hide();

                   //this.TP.tabset.change('PB');
                   //		DB.tabset.change(name);
                 });


                 C.Def(function activate(item) {
                   var browser=this;
                   Import("app/codebrowser",function(codebrowser) {
                     browser.absolutefiles[path]=item;
                     new Request("URI","TEXT").Get(item.filename,{},function(raw) {
                       browser.tasks[path]=new codebrowser.CodeBrowser(raw,browser);
                       browser.tasks[path].addBefore(new basic.Span(path));
                       browser.parent.add(browser.tasks[path]);
                     });
                   });
                 });
                 C.Def(function change(path,item) {
                   var browser=this;
                   for(var windowid in browser.tasks) {
                     browser.tasks[windowid].hide();
                   }
                   if(browser.tasks[path]) {
                     browser.tasks[path].show();

                   } else {
                     browser.load(path,item);

                   }
                 });
                 C.Def(function Import(path1,callback) {
                   var item;
                   var browser=this;
                   var cursor=this;
                   var filedepth=0;

                   window.Import(path1,function(item) {
                     var path=item.filename;
                     var paths=path.split('/');
                     var start=0;
                     var children=Object.keys(item);
                     if(paths[0]=="") start=1;
                     var filename=paths[paths.length-1];

                     for(var i=start;i<paths.length;i++) {
                       var file;
                       var key=paths[i];
                       var existingfiles=cursor.query("div[data-key=\""+key+"\"]");

                       if(Object.keys(existingfiles).length>0) {
                         cursor=existingfiles[0];
                       }
                       else {

                         var item;
                         if(paths.length-i==1) {
                           item=new M.Self.File(key,browser.root+paths.slice(0,-1).join("/"),browser.session);
                           item.addClass("file");
                         } else {

                           item=new M.Self.Dir(key,browser.root+paths.slice(0,i).join("/"),browser.session);
                           item.addClass("dir");
                         }
                         cursor.add(item);
                         var filelink=null;


                         item.visible=true;
                         filelink=new basic.FakeLink("?page="+path,paths[i],function() {
                           browser.change(path,item);
                         });

                         var grip=new interactive.MomentaryButton("","grip open",function(e) {
                           if(item.visible) { item.open() }
                           else { item.close();  item.visible=false }
                           e.stopPropagation();
                           e.preventDefault();
                         });

                         filelink.addClass("loaded");
                         cursor.add(grip);
                         cursor.add(filelink);
                         cursor=item.container;
                         if(callback) callback(cursor);
                       }
                       filedepth++;
                     }
                     if(browser.tasks.length==1) browser.load(path,item);
                   });
                 });
                 //  M.continue();
               });
             });
             //window.ew=new EditorWindow();
             M.Def("main",new HomeWindow())
             var Types={

             }



             M.Def(function match(item) {
               Object.keys(Types).forEach(function(name) {

               });
             });

             var defaultType=Module(function M2 () {
               M.Class(function C() {
                 C.Init(function ListItem(path) {
                   basic.Div.call(this,"FSListItem")
                   this.content(path);
                 })
               });

               M.Class(function C() {
                 C.Init(function Icon() {
                   basic.Div.call(this,"FSIcon")
                   this.content("?")
                 });
               });
               M.Class(function C() {
                 C.Init(function Editor() {
                   basic.Div.call(this,"FSWindow")
                 });
               });

               M.Class(function C() {
                 C.Init(function Viewer() {
                   basic.Div.call(this,"FSWindow")
                 });
               });

             });
             M.Def(function register(name,item) {
               Types[name]=item;
               //if(name in Types) {

               //}

             });





             M.Def("match",function match(item) {
               var ret=[]
               for(var i=0;i<conf.apps.length;i++) {
                 if(this.apps[i].match(item))ret.push(this.apps[i]);

               }
               return ret;
             });


             var id="pool"


             M.Def(function open(item) {

             });

           });
});
