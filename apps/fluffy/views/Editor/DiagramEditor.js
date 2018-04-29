"use strict"
Module(function M() {
M.Import("squishy/DOM", "squishy/interactive", "squishy/basic", "squishy/form", "squishy/tables", 
 "squishy/svg", "squishy/graphics", "squishy/transform", "squishy/events", "squishy/template", 
         "fluff", "Editor/Editors.js", "Editor/DiagramBlock", "Editor/Library",
         function(DOM, interactive, basic, form, tables,
                   svg, graphics, transform, events, BT,
                   fluff,Editors,DB,OP) {
  var hasEvents=events.hasEvents;
  var Canvas=graphics.Canvas;
  var SVG=svg.SVG;
  var Table=tables.Table;
  var Block=DB.Block;
  var Pane=basic.Pane;
  var Span=basic.Span;
  var Form=form.Form;
  var Collapsible=interactive.Collapsible;
  var TableRow=tables.TableRow;
  var TextInput=form.TextInput;
  var Library=OP.Library;

  function capitalize(str) {
    return str.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
  };
  var SVGWire=M.Class(function C() {
    C.Super(svg.Path);
    C.Init(function SVGWire(wire) {
      svg.Path.call(this);
      this.NSattrs({"stroke-width":"3","stroke":"#000"});
        this.wire=wire;
      this.redraw();
    });
    C.Def(function redraw() {
      var wire=this.wire;
      var color=wire.color;
      var LH=wire.Output;
      var RH=wire.Input;
      var ro=RH.offset();
      var lo=LH.offset();
      var ip={top:ro.y,left:ro.x};
      var op={top:lo.y,left:lo.x};
      var dx=op.left-ip.left;
      var dy=op.top-ip.top;
      var mlc=Math.sqrt(dx*dx+dy*dy)/3;
      var start=op;
      var end=ip;
      op.left=op.left;
      ip.left=ip.left;
      var pts=[[start.left,start.top],
               [start.left+mlc,start.top],
               [(start.left+end.left)/2,(start.top+end.top)/2],
               [end.left-mlc,end.top],
               [end.left,end.top]];

      var c1=pts.slice(0,3);
      var c2=pts.slice(2)
      var d="M"+op.left+","+op.top+"C"+c1.join(",")+"C"+c2.join(",");
      this.define(d);
      /*   LH.NSattrs({fill:'rgb('+color.r+', '+color.g+', '+color.b+')'});
        RH.NSattrs({fill:'rgb('+color.r+', '+color.g+', '+color.b+')'});*/
    });
  });

  M.Class(function C() {
    C.Super(Pane);
    C.Init(function ProgramBrowser(target) {
      Pane.call(this);
    });


  });

  var ProgramPane=M.Class(function C() {
    C.Super(interactive.TabbedPane);
    C.Init(function ProgramPane(program,address,EW) {
      this.window=EW;
      this.editors=[];
      var address=address || '';
      this.program=program;
      var name=this.program.name;
      if(this.program.name=='') name='Unnamed';
      interactive.TabbedPane.call(this);
      this.addClass('TabbedTitlebar');


      //var BTs=BT.spawn(program);
      var BTs=BT.getTemplates(program);
      //get BT templates separate module

      var TP=this;
      this.address=address;
      var selected="";
      if(BTs.length) {
        BTs.forEach(function(T) {
          if(T.editor) {
            var ed=T.editor(EW);
            var ep=new Pane(T.constructor.name,T.constructor.name);
            ep.contents.add(ed);
            TP.editors.push(ep);
            TP.addTab(T.constructor.name,T.constructor.name,ep);
            if(selected=="")selected=T.constructor.name;
          }
        });
      }
      this.activepane=selected;
    });

    C.Def(function draw() {

      this.editors.forEach(function(ed) {
        if(ed.draw)
        ed.draw();
      });
      this.tabset.change(this.activepane);
      //this.editor.draw();
    });
  });
  var ProgramViewer= M.Class(function C(){
    C.Super(Pane);
    C.Mixin(hasEvents);
    C.Init(function ProgramViewer(program) {
      this.wire_colors={};
      this.program=program;
      var name='Unnamed Program';
      if(this.program.Model.name) name=this.program.Model.name;

      Pane.call(this,name,'ProgramViewer');
      this.contents.addClass('clipped');
      this.Blocks={}
      this.box=new SVG();
      this.box.attrs({'class':'overlay maximized'});
      this.resize();
      this.contents.add(this.box);
      this.nav_drag();

      // draw
      this.redraw();

    });

    C.Mixin({
      program:null,
      status:0,
      overlay:null,
      running:false,
      wire_colors:null,
      stop:function () {
        this.running=false;
        // clearInterval(process);
      },
      resize:function() {
        this.box.attrs({width:this.contents.width(),height:this.contents.height()});
      },
      play:function () {
        this.running=true;
        this.process=setInterval(this.refresh, program.rate*1000);
      },
      nav_drag:function () {
        var that=this;

      },
      refresh:function() {
        this.load_program();
      },

      draw_nodes:function () {
        var PE=this;
        Object.keys(this.program.nodes).forEach(function(nodename) {

          var n=PE.program.nodes[nodename];
          var B;
          if(nodename in PE.Blocks) B=PE.Blocks[nodename];
          else {
            //TODO:
            //HERE use the BLOCK TEMPLATE found in index.templates.js
            //instead of using SVGBlock directly

            B=new DB.SVGBlock(n);
            B.node=n;
            B.position.x=n.dimensions.x;
            B.position.y=n.dimensions.y;
            //B.attrs({id:nodename});
            PE.Blocks[nodename]=B;
            PE.box.add(B);
          }

          B.translate(n.dimensions.x,n.dimensions.y);
          //	$n.click(this.click_node());
        });

      },
      draw_wires:function () {
        // reset view context
        //this.overlay.reset();
        var PE=this;
        Object.keys(this.program.wires).forEach(function (wirename) {

          var wire=PE.program.wires[wirename];
          //	startnode=wire.start.split('.');
          //	endnode=wire.end.split('.');
          var color;
          if(wire.color!=undefined) {
            color=wire.color;
          }
          else {

            if(PE.wire_colors[wire.start]!=undefined) {
              var color=PE.wire_colors[wire.start];
              wire.color=color;
            }
            else {
              var color={r:255,g:125,b:255};
              PE.wire_colors[wire.start]=color;
              wire.color=color;
            }
          }

          //wire=new Wire()
          PE.draw_wire(wire);
        });
      },
      get_Handle:function (id) {
        id=id.split('.');
        var B=this.Blocks[id[0]];
        if(id[1] in B.Inputs) return B.Inputs[id[1]].handle;
        else if(id[1] in B.Outputs) return B.Outputs[id[1]].handle;
      },
      draw_wire:function(wire) {
        if(this.wirepaths){

        }
        else {
          this.wirepaths={};
        }
        var wn=wire.start+"_"+wire.end;
        if(wn in this.wirepaths){
          this.wirepaths[wn].redraw();
        }else {
          Object.defineProperty(wire,'Input',{
            writable:true,
            enumerable:false,
            value:this.get_Handle(wire.end),
          });
          Object.defineProperty(wire,'Output',{
            writable:true,
            enumerable:false,
            value:this.get_Handle(wire.start),
          });

          this.wirepaths[wn]=new SVGWire(wire);
          this.box.add(this.wirepaths[wn]);
        }
      },
      redraw:function() {
        this.draw_nodes();
        this.draw_wires();

      },
    });
  });
  var ProgramRunner=M.Class(function C() {

    C.Super(Pane);
    C.Init(function ProgramRunner(program,callback) {
      Pane.call(this,name+'_output',name,'ProgramViewer');
      this.frame=new DOM.LayoutItem("IFRAME","programinstance");
      this.frame.program=this;
      this.contents.add(this.frame);

      var pr=this;
      this.frame.element.onload=function() {
        pr.window=pr.frame.element.contentWindow;

        pr.document=pr.frame.element.contentWindow.document;
        pr.body=pr.frame.element.contentWindow.document.body;
        pr.head=pr.frame.element.contentWindow.document.head;

        /* this section is a fake import to start the initial code in the iframe */
        var squishy=pr.document.createElement("script");
        squishy.setAttribute("src",Squishy.src);
        var fluffy=pr.document.createElement("script");
        fluffy.setAttribute("src",Fluff.src);
        pr.head.appendChild(squishy);
        pr.head.appendChild(fluffy);

        squishy.onload=function() {
          /* squishy load creates Class, Module, Import */

          pr.window.Import(Fluff.src,function(FI) { });
        }
      }
    });
  });
  var ProgramEditor=M.Class(function C() {
    C.Super(ProgramViewer);
    C.Mixin(hasEvents);
    C.Init(function ProgramEditor(program,target) {
      this.window=target;
      var EP=this;
      ProgramViewer.call(this,program);

      this.selected_nodes=[];
      this.version=0;

      var ContextMenu=new interactive.ButtonSet("context");

      var PE=this;
      var StepButton=new interactive.MomentaryButton("run","run", function(e) {
        PE.program.step();
      });
      var EditButton=new interactive.MomentaryButton("edit","edit",function(e) {
        PE.window.select(program.name,{editor:new ProgramPane(program.Model,"parent.nodes."+program.name,target)});
      });
      ContextMenu.add(new basic.Span(program.name,"ContextItem"));

      ContextMenu.add(EditButton);
      ContextMenu.add(StepButton);
            ContextMenu.addEvent("highlight","mouseover touchenter",function(e) {
              PE.addClass("highlight");
            });
            ContextMenu.addEvent("unhighlight","mouseout touchleave",function(e) {
              PE.removeClass("highlight");
            });
            ContextMenu.enableEvents("highlight","unhighlight");
        PE.addEvent("context","contextmenu",
                  PE.window.Context(ContextMenu)
                 );

      var that=this;

      /*if(target) {
        target.add(this);
      }*/
      this.make_editable();
      this.make_droppable();

    })
    C.Def(function Hold(item,ev) {
      this.Drop();
      this.holding=item;
      //check all editor windows for droppables
      //enable mouseup drop action
      for (var name in this.Blocks) {
        var Blk=this.Blocks[name];
      }
      var ghost=new svg.Group();
      ghost.translate(item.offset());
      this.box.add(ghost);
      var co=this.contents.offset();
      if(ev) {
        var P;
        if(ev.touches)
          P={x:ev.touches[0].clientX,y:ev.touches[0].clientY};
        else
          P={x:ev.clientX,y:ev.clientY};
        ghost.translate({y:P.y-co.y-(item.height()/2),
                         x:P.x-co.x-(item.width()/2)});
      }
      ghost.addClass('ghost');
      this.ghost=ghost;
      var EW=this;
      this.element.style.cursor="none";
      this.addEvent('take',"mousemove touchmove",function(ev) {
        if(EW.ghost) {
        var P;
        if(ev.touches)
          P={x:ev.touches[0].clientX,y:ev.touches[0].clientY};
        else
          P={x:ev.clientX,y:ev.clientY};
        var trans={y:P.y-co.y-(item.height()/2),
                         x:P.x-co.x-(item.width()/2)};
        EW.ghost.translate(trans);
        }
      });
      this.addEvent('leave',"mouseup touchend", function(ev) {
        EW.Drop();
        EW.disableEvents('take');
        EW.disableEvents('leave');
        EW.element.style.cursor="inherit";
      },EW.contents.element);
      this.enableEvents('take','leave');
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
    C.Def(function ondragenter(e,v) {
      var EP=this;
      if(v) {
     // if((v&&v.location)||(v&&v.address)) {
        EP.element.style.cursor="copy";
      }
     // }
    });

    C.Def(function ondrop(ev,v) {
      var EP=this;
      if(v.obj) {
        var offset=EP.contents.offset();
        var P;

        if(ev.touches) P={x:ev.touches[0].clientX,y:ev.touches[0].clientY};
        else P={x:ev.clientX,y:ev.clientY};
        var pos={x:P.x-offset.x-v.width()/2,y:P.y-offset.y-v.width()/2};

        EP.Import(v.obj,pos);
      }
      EP.element.style.cursor="inherit";
    });
    C.Mixin({
      hide:function() {
        Pane.prototype.hide.call(this);
      //  this.make_editable(true);
      //  this.make_droppable(true);
      },
      show:function() {
        Pane.prototype.show.call(this);
        this.redraw();
      },
      redraw:function() {
        this.draw_nodes();
        this.draw_wires();
      },
      make_node_editable:function(N,disable) {

        var PE=this;

        var EW=this.window;
        N.Mixin(transform.Draggable);
        //N.Super(hasEvents);
        N.position={x:N.node.dimensions.x,y:N.node.dimensions.y};
        N.enabledrag(function (obj,state) {
          N.node.dimensions.x=obj.position.x;
          N.node.dimensions.y=obj.position.y;
          PE.redraw();
        });
        if(N.contextmenu) { }
        else {
        var ContextMenu=new interactive.ButtonSet("context");
            ContextMenu.addEvent("highlight","mouseover touchenter",function(e) {
              N.addClass("highlight");
            });
            ContextMenu.addEvent("unhighlight","mouseout touchleave",function(e) {
              N.removeClass("highlight");
            });
            ContextMenu.enableEvents("highlight","unhighlight");

          ContextMenu.add(new basic.Span(N.node.name,"ContextItem"));

          var EditButton=new interactive.MomentaryButton("edit","edit", function(e) {

          PE.window.select(N.name,{editor:new ProgramPane(N.node,"parent.nodes."+N.node.name,EW)});


        });
        var DeleteButton=new interactive.MomentaryButton("del","delete",function(e) {
          //console.debug("deleting "+N.name);

        });
        var StepButton=new interactive.MomentaryButton("run","step",function(e) {
          N.node.ran=false;
          N.node.run();
        });
        ContextMenu.item=N;
        ContextMenu.add(EditButton);
        ContextMenu.add(StepButton);
        ContextMenu.add(DeleteButton);
        N.addEvent("context","contextmenu", function (e) {
           EW.Context(ContextMenu)(e)
        },N.element,true);
        N.contextmenu=ContextMenu;
        N.enableEvents("context");
        }
        Object.keys(N.Inputs).forEach(function (key) {
          var handle=N.Inputs[key].handle;
          var name=key;
          handle.name=N.node.name+'.'+name;
          handle.Mixin(hasEvents);
          handle.addEvent("drop","mouseup touchend", function(e) {
            if(PE.holding) {

              var PinTo=handle.name;
              var PinFrom=PE.holding.handle.name;
              for (var wirename in PE.program.wires) {
                var w=[PE.program.wires[wirename].start.split('.'),
                       PE.program.wires[wirename].end.split('.')];
                  //if(w[1][0]==NodeTo.name&&w[1][1]==PinTo.name.substr(3)) {
                  //  delete PE.program.wires[wirename];
                  //}
                }
                PE.add_wire(PinFrom,PinTo);
            }
          });
          handle.addEvent("dragenter","mouseover touchenter",function(e) {

          });
          handle.enableEvents('drop','dragenter');
        });
        for (var key in N.Outputs) {
          var pin=N.Outputs[key];
          var handle=N.Outputs[key].handle;
          handle.name=N.node.name+'.'+key;
          handle.Mixin(hasEvents);
          handle.addEvent('draw','mousemove touchmove',function(e) {
            if(PE.ghostwire) {
              e.stopPropagation();
              PE.ghostwire.redraw();
            }
          },PE.window.element);
          handle.addEvent('drawstart','mousedown touchstart', function(e) {
            e.stopPropagation();
            PE.Hold(pin,e);
            if(PE.ghostwire) {
              PE.ghostwire.remove();
              delete PE.ghostwire;
            }
            PE.ghostwire=new SVGWire({Input:PE.ghost,Output:handle,color:{r:150,g:150,b:150}});
            PE.ghostwire.addClass('ghost');
            PE.box.add(PE.ghostwire);
          },handle.element,true);

          handle.addEvent('drawend','mouseup touchend',function(e) {
            if(PE.ghostwire) {
              PE.ghostwire.remove();
              delete PE.ghostwire;
            }
          },PE.window.element,true);
          handle.enableEvents('draw','drawstart','drawend');
        }
      },
      make_editable:function(disable) {
        //go through all nodes, make draggable, make clickable
        var that=this;
        for (var nodename in this.program.nodes) {
          var N=this.Blocks[nodename];
          this.make_node_editable(N,disable);
        }
      },
      Import:function(item,pos) {
        var DE=this;
        function place(node) {
            extend(node.dimensions,pos);
            DE.add_node(node);
            DE.make_editable();
        }

        if(item.length) {
          if(item.length>1) {
            var Templates=new interactive.ButtonSet("templates");
            var placed=false;
            item.forEach(function(template) {
              if(template.spawn) {

                var sample=template.spawn(item.obj);

                sample.name=template.obj.name;
                var button=new interactive.MomentaryButton("","template selector",function(e) {
                  place(sample);
                  DE.window.clearContext();
                });

                button.add(new DB.SVGBlock(sample));
                Templates.addBefore(button);
              }
            });
            DE.window.clearContext();
            DE.window.Context(Templates)();

            DE.window.trigger("context");
            //create a context menu, each button doing add_node on the respective template
          } else if(item.length==1) {

            var node=item[0].spawn(item.obj);
            node.name=item.obj.name;
            place(node);
          }

        } else {

          throw new Exception("Failed to import");
        }
      },
      make_droppable:function (disable) {
        //filesystem droppable
        var DE=this,EP=this;
        if(disable) {   }
        else {
          this.addEvent("drop","mouseup touchend",function(e) {
            if(EP.window.holding)
            EP.ondrop(e,EP.window.holding);
          },this.contents.element,false);
          this.addEvent("dragenter","mouseover touchenter",function(e) {
            if(EP.window.holding)
            EP.ondragenter(e,EP.window.holding);
          },this.contents.element,false);
          this.enableEvents('drop', 'dragenter');


          this.contents.element.addEventListener("drop",function(e) {
            e.preventDefault();
            e.stopPropagation();
            // TODO:add file input here //
            try {
              var location=e.dataTransfer.getData("location");
              var offset=DE.offset();
              var pos={x:e.clientX-offset.x,y:e.clientY-offset.y};
              DE.Import(location,pos);
            }
            catch(E) {
              console.debug('drop file:');
              console.debug(e);
            }

          });
          this.contents.element.addEventListener("dragover",function(e) {
            e.dataTransfer.dropEffect = "copy";

            e.preventDefault();
          });
        }
      },
      add_node:function (node) {
        var i=0;
        var nodename;
        for (var n in this.program.nodes) {
          var rr=n.match(new RegExp(""+node.parent.blockname+"([0-9]*)"));
          var j=0;
          if(rr!=null){
            if(rr[1]=='')
              j=1;
            else
              j=parseInt(rr[1]);
            if (j>i) i=j;
          }
        }
        if(i>0){
          nodename=node.parent.blockname.replace(/[^a-zA-Z0-9]+/g,'')+(i+1);
        }
        else {
          nodename=node.parent.blockname.replace(/[^a-zA-Z0-9]+/g,'');
        }
//        node.parent=this.program;
        node.name=nodename;
        this.program.nodes[nodename]=node;
        this.redraw();
      },
      edit:function() {
       this.version++;
      },
      add_wire:function (from,to) {
        var num=0;
        for (var name in this.program.wires) {
          var i=parseInt(name.substr(4));
          if (i>num) {
            num=i;
          }
        }
        num++;
        this.program.wires['wire'+num]={start:from,end:to};

        this.edit();
        this.redraw();
      },
      delete_node:function (nodename) {
        delete this.program.nodes[nodename];
        for (var wirename in this.program.wires) {
          var w=this.program.wires[wirename];
          if(~w.start.indexOf(nodename) || ~w.end.indexOf(nodename)) {
            delete this.program.wires[wirename];
          }
        }
        this.edit();
        this.redraw()
      },
    });
  });
  var ProgramControls=M.Class(function C() {
    C.Super(interactive.ButtonSet);
    C.Init(function ProgramControls(program,instance) {
      var PC=this;
      PC.program=program;
      PC.instance=instance;
      interactive.ButtonSet.call(this);
      this.addClass("controls");

      this.savebutton=new interactive.MomentaryButton('save','save right', function saveprogram() {
        PC.program.Model.save();
      });
      this.initbutton=new interactive.MomentaryButton('init','init  right',function compileprogram() {
        var RW=PC.instance.window;
        RW.raw=JSON.parse(JSON.stringify(program.Model));
        RW.Import(Fluff.src,function(FI) {
          console.debug("Compiling...");
          RW.Program=new FI.Graph(null, RW.raw);

          RW.Program.compile(function(G) {
             console.debug("Done compiling");
            console.debug(G);
          });

        });
        //PC.instance.window.P.compile();
     //   PC.program.compile();
      });
      this.stepbutton=new interactive.MomentaryButton('step','step right',function stepprogram() {
        //PC.instance.window.P.step();
        var RW=PC.instance.window;
        RW.Program.step();
      //PC.instance.window.eval("Program.step();");
        //  PC.program.step();
      });
      this.Madd(this.savebutton,this.initbutton,this.stepbutton);
    });
  });
  var ProgramEditorWindow=M.Class(function C() {
    C.Super(interactive.TabbedPane);
    C.Init(function ProgramEditorWindow(program,window) {
      var PEW=this;
      PEW.program=program;
      interactive.TabbedPane.call(this);
      this.addClass('TabbedTitlebar');
      this.ProgramEditor=new ProgramEditor(program,window);
      this.ProgramRunner=new ProgramRunner(program,window);
      //name,title,pane,cls,callback,context
      PEW.addTab("editor_"+program.Model.id,"Graph",this.ProgramEditor);
      PEW.addTab("layout_"+program.Model.id,"Output",this.ProgramRunner);

      this.controls=new ProgramControls(program,this.ProgramRunner);
      this.editor=new ProgramPane(program.Model,"parent",window);

      this.tabset.addClass("switch");
      this.header.addBefore(this.controls);

      this.activepane="editor_"+program.Model.id;
    });
    C.Def(function redraw() {
      this.ProgramEditor.redraw();
      this.tabset.change(this.activepane);
      //this.ProgramRunner.redraw();
    });
  });
});
});

