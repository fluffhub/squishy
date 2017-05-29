Module(function M() {
M.Import("squishy/interactive","squishy/DOM","squishy/basic","squishy/svg",
         "squishy/events"," squishy/transform"," squishy/template ","squishy/form ",
        // 'fluff '+
         //'Editor/DiagramBlock',
         function(interactive,DOM,basic,svg,
                   events,transform,BT, form,
                   fluff,
                   DB) {
           var BlockTemplate;

  var Draggable=transform.Draggable;
  //var Block=DB.Block;
  var SVG=svg.SVG;
  var hasEvents=events.hasEvents;
  var Pane=basic.Pane;
  var Span=basic.Span;
  var Collapsible=interactive.Collapsible;
  var LibraryItem=M.Class(function C() {
    C.Super(DOM.LayoutItem);
    C.Mixin(hasEvents);
    C.Init(function LibraryItem(obj,EW) {
      var LI=this;
      LI.obj=obj;
      this.window=EW;
      DOM.LayoutItem.call(this,'div');
     // this.add(obj);
      this.addClass('LibraryItem');
      this.tolerance=20;
      this.addEvent('take',"mousedown touchstart", function(ev) {
        if(ev.which==1) {
        ev.preventDefault();
        LI.enableEvents('leave');
        LI.timer=setTimeout(function() {
          LI.ghost=LI.window.Hold(LI,ev);
        },200);
        }
      },null,{passive:true});
      this.addEvent('leave',"mouseup touchend",function(ev) {
        clearTimeout(LI.timer);
        LI.disableEvents('leave');
      });
      this.enableEvents('take');
    });

  });

  var LibraryModule=M.Class(function C() {
    C.Super(Collapsible);
    C.Init(function LibraryModule(M,EW) {
      if(EW) this.window=EW;
      this.Module=M;
      Collapsible.call(this,'',M.filename);
      this.draw();
    });

  /*  C.Mixin({
      draw:function () {
        var C=null;
        var M=this.Module;
        var pallette=this;

        for (var name in M) {
          var obj=M[name];
          if(obj instanceof window.Module) {
            obj.load(function(NM) {
              var NMP=new LibraryModule(NM,pallette.window);
              pallette.contents.add(NMP);
            });
          }
          else {
            //var target=M.filename+'#'+name;
            // var BTs=BT.spawn(obj);
            var BTs=BT.getTemplates(obj);
            var repr;
            if(BTs.length&&BTs.length>0) {
              Import(fluff.templates,function(ft) {
              for(var i=0;i<BTs.length;i++) {
                repr=BTs[i].repr.bind(BTs[i]);
               if(BTs[i] instanceof ft.BlockTemplate)
                 break;
              }
              var B=repr();
              //B.location=target;
              var BC=new LibraryItem(BTs,pallette.window);
              //   BC.
              BC.add(B);
              pallette.add(BC);
              });

            }
          }
        }
      }
    });
    */
  });
  M.Class(function C() {
    C.Super(Pane);
    C.Init(function Library(target) {
      var lib=this;
      this.window=target;
      Pane.call(this,'nb','Node Browser');

      this.importer=new form.Form("importer",function submit(e) {
        lib.Import(lib.importer.searchbox.value(),function(m) {
          //this is the librarymodule
          this.remove();
          lib.importer.add(this);
        });
        e.preventDefault();
      });


      this.importer.searchbox=new form.TextInput("Search");
      this.importer.add(this.importer.searchbox);

      this.importer.searchbox.attrs({placeholder:"Import URL"});

      this.importer.add(new form.Submit("Search"));
      this.contents.addBefore(this.importer);

//add search import input
    });

    C.Mixin({

      Import:function Import(path,callback) {
        var pane=this;
        window.Import(path,function(obj) {
          var nm=new LibraryModule(obj,pane.window)
          pane.contents.add(nm);
          if(callback) callback.call(nm,obj);
        });
      },

    });
  });
});
});
