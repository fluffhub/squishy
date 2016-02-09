Module(function M() {
M.Import('squishy/DOM',function(DOM) {
M.Import('squishy/events',function(events) {
M.Import('squishy/styles',function(styles) {
M.Import('squishy/svg',function(svg) {
  var Style=styles.Style;
  var HasEvents=events.hasEvents;
  var LayoutItem=DOM.LayoutItem;
  function dist(x,y) {
    return Math.sqrt(x*x+y*y);
  }
  function sign(v) {
    if(v==0) return 0;
    return v>0?1:-1;

  }
  function is_touch_device() {
  try {
    document.createEvent("TouchEvent");
    return true;
  } catch (e) {
    return false;
  }
}
  var GenericMatrixBox=M.Class(function C() {
    //C.Super(LayoutItem);
    C.Init(function GenericMatrixBox(state,cls) {
      this.position={y:0,x:0};
      this.size= {width:100,height:100};
      if(state) extend(this,state);
      this.windowsize={width:640,height:480};
   //   this.drawTransform();
    });
    C.Mixin({
     // position:null,
      size:null,
      tempscale:1,
      imgrotate:0,
      imgscale:1,
      windowsize:{width:640,height:480},
      min:1,
      max:Infinity,
      orientations:{nw:[-1,-1],ne:[1,-1],se:[1,1],sw:[-1,1]},
      getstate:function() {
        return {position:this.position,
                windowsize:this.windowsize,
                imgscale:this.imgscale,
                imgrotate:this.imgrotate};
      },
      matrixAttributes:function() {
        var th=this.imgrotate*Math.PI/2;
        var is=this.imgscale*this.tempscale;
        var matrix=[is*Math.cos(th),
                    0-is*Math.sin(th),
                    is*Math.sin(th),
                    is*Math.cos(th),
                    is*this.position.x,
                    is*this.position.y];

        var attribs={	transform:'matrix('+matrix.join(',')+')',width:this.size.width,height:this.size.height};
        attribs.width=this.size.width;
        attribs.height=this.size.height;
        return attribs;
      },
    });
    C.Def(function drawTransform() {
      //pass
    });
  });
  var HTMLMatrixBox=M.Class(function C() {
    C.Super(LayoutItem);
    C.Mixin(GenericMatrixBox);

    C.Init(function HTMLMatrixBox() {
      LayoutItem.call(this,'div');
      GenericMatrixBox.call(this);
    });
    C.Def(function drawTransform() {
      Style(this).dimensions(this.matrixAttributes());
    });

  });
  var SVGMatrixBox=M.Class(function C() {
    C.Super(svg.SVG);
    C.Mixin(GenericMatrixBox);

    C.Init(function SVGMatrixBox(width,height) {
      svg.SVG.call(this,width,height);
      GenericMatrixBox.call(this);
    });
    C.Def(function drawTransform() {
      var attribs={x:this.position.x,y:this.position.y};
      this.NSattrs(attribs);

    });
  });
  var Draggable=M.Class(function C() {
    C.Mixin(GenericMatrixBox);
    C.Mixin(HasEvents);

    C.Mixin({
      enabledrag:function(callback) {
       // if(this.position==null) this.position={x:0,y:0};
        var D=document;
        if(this.position) { } else { this.position={x:0,y:0} }
        if(!this.events||!this.events.dragstart)
          this.addEvent('dragstart','mousedown touchstart',this.dragstart,this.element,true);
        if(!this.events.dragend)
          this.addEvent('dragend','mouseup touchend',this.dragend,D,true);
        if(!this.events.drag)
          this.addEvent('drag','mousemove touchmove',this.drag,D,true);

        this.enableEvents('dragstart','dragend','drag');
        this.addClass('draggable');
        if(callback) this.onmove=callback;

      },
      onmove:function(item,state) {

      },
      ondragstart:function(item,state) { },
      ondragend:function(item,state) { },
      ondrag:function(item,state) { },
      onchange:function(item,state) {

      },
      disabledrag:function() {
        //this.removeEvent('dragstart','dragend','drag');
        this.disableEvents('dragstart','dragend','drag');
        this.removeClass('draggable');
      },
      dragstart:function(ev) {

        ev.preventDefault();
        this.moving=true;
        var P={x:0,y:0};
        if(ev.touches)
          P={x:ev.touches[0].clientX,y:ev.touches[0].clientY};
        else
          P={x:ev.clientX,y:ev.clientY};
        this.dragorigin=P;
        this.ondragstart(ev);
      },
      dragend:function(ev) {
        this.moving=false;
        this.dragorigin=null;
        this.onchange(this.image,this.getstate());
        this.drawTransform();
        this.ondragend(ev);
      },

      drag:function(ev) {
        ev.preventDefault();

        if(this.moving&&this.dragorigin) {

          // ev.stopPropagation();
          var P={x:0,y:0};
          if(ev.touches)
            P={x:ev.touches[0].clientX,y:ev.touches[0].clientY};
          else
            P={x:ev.clientX,y:ev.clientY};
          this.delta={x:P.x-this.dragorigin.x,y:P.y-this.dragorigin.y};
          this.dist=Math.sqrt(this.delta.x*this.delta.x+this.delta.y*this.delta.y)
          this.position.y=this.position.y+this.delta.y/this.imgscale;
          this.position.x=this.position.x+this.delta.x/this.imgscale;
          this.dragorigin=P;
          this.onmove(this,this.getstate());
      //    this.drawTransform();
          this.ondrag(ev);

        }

      },

    });
    C.Init(function Draggable(cls) {
     // LayoutItem.call(this,'div',cls);
      if(this.position) { } else this.position={x:0,y:0};
      this.enabledrag();
    });
  });
  var Pinchable=M.Class(function C() {
    C.Mixin(GenericMatrixBox);
    C.Mixin(HasEvents);

    C.Mixin({
      enablepinch:function() {
        var D=document.body;
        if(!this.events.pinchstart)
          this.addEvent('pinchstart','touchstart',this.pinchstart);
        if(!this.events.pinchstop)
          this.addEvent('pinchstop','touchend',this.pinchstop,D,this);
        if(!this.events.pinchmove)
          this.addEvent('pinchmove','touchmove',this.pinchmove,D,this);

        this.enableEvents('pinchstart','pinchstop','pinchmove');
        this.addClass('pinchable');
      },
      disablepinch:function() {
        this.disableEvents('pinchstart','pinchstop','pinchmove');
        this.removeClass('pinchable');
      },
      pinchstart:function(ev3) {
        ev3.preventDefault();
        var ev=ev3.originalEvent;
        this.pinch1={x:ev.touches[0].clientX,y:ev.touches[0].clientY};
        if(ev.touches.length>1) {
          this.pinching=true;
          this.pinch2={x:ev.touches[1].clientX,y:ev.touches[1].clientY};
        }
      },
      onscale:function(item,state) {

      },
      onchange:function(item,state) {

      },
      pinchmove:function(ev3) {
        ev3.preventDefault();
        var ev=ev3.originalEvent;
        if(this.pinching&&ev.touches.length>1&&this.pinch2) {
          var d1=Math.sqrt(Math.pow((this.pinch1.x-this.pinch2.x),2),Math.pow((this.pinch1.y-this.pinch2.y),2));
          this.pinch2={x:ev.touches[1].clientX,y:ev.touches[1].clientY};
          var d2=Math.sqrt(Math.pow((this.pinch1.x-this.pinch2.x),2),Math.pow((this.pinch1.y-this.pinch2.y),2));
          this.imgscale=this.imgscale*d2/d1;
          this.onscale();
          this.drawTransform();
        }
      },
      pinchstop:function(ev) {
        this.scaling=false;
        this.scalestart=null;
        this.onchange(this.item,this.getstate());
      },
    });
    C.Init(function Pinchable() {});
  });


  var ResizeHandle=M.Class(function C() {
    C.Mixin(Draggable);
    C.Init(function ResizeHandle(dir) {
      this.dir=dir;
      Draggable.call(this,'ui-resizable-handle ui-resizable-'+dir);
      this.element.style.display="block";
    });
    C.Mixin({
      draw:function() {
        this.position={top:0,left:0};
        this.size={width:30,height:30};
        //this.imgscale=1;
        Draggable.prototype.draw.call(this);
      },
      onmove:function(state) {

      },
      dragstart:function(ev) {
        ev.stopPropagation();
        Draggable.prototype.dragstart.call(this,ev);
      }
    });
  });

  var Resizable=M.Class(function C() {
    C.Mixin(GenericMatrixBox);
    C.Init(function Resizable() {


    });
    C.Mixin({
      handles:{},
      clearhandles:function() {
        for (dir in this.handles) {
          if(this.imgscale>1)
            this.handles[dir].imgscale=1.0/this.imgscale;
          else
            this.handles[dir].imgscale=1.0;
          this.handles[dir].drawTransform();
        }
      },
      enableresize:function(dirs) {
        if(!dirs) dirs="nw,ne,se,sw";
        dirs=dirs.split(",");
        this.dirs=dirs;
        var that=this;
        var dir="nw";
        for (i in dirs) {
          dir=dirs[i];
          this.handles[dir]=new ResizeHandle(dir);
          this.handles[dir].onmove=this.draghandler();
          this.add(this.handles[dir]);
          this.handles[dir].show();
        }
      },
      draghandler:function() {
        var that=this;
        return function(state) {
          var orientation=this.orientations[this.dir];
          var oldscale=that.imgscale*that.tempscale;
          var W=that.element.offsetWidth*oldscale;
          var H=that.element.offsetHeight*oldscale;
          var X=Math.abs(this.delta.x);
          var Y=Math.abs(this.delta.y);
          var scaleratio=X>Y?X/W:Y/H;
          var way=(sign(this.delta.x)==orientation[0]||sign(this.delta.y)==orientation[1])?1:-1;

          var newscale=that.imgscale+oldscale*scaleratio*way/that.tempscale;
          that.imgscale=newscale;
          that.position.y=that.position.y*(oldscale/newscale);
          that.position.x=that.position.x*(oldscale/newscale);
          thatdrawTransform();
          that.clearhandles();
        };
      },
      disableresize:function() {
        var dir="nw";
        var H=null;
        for(i in this.dirs) {
          dir=this.dirs[i];
          H=this.handles[dir];
          H.disabledrag();
          H.remove();
          delete this.handles[dir];
        }
      },
      handledrag:function(dir) {
        var that=this;
        return function(e) {
          //console.debug('dragging');
        };
      }

    });
  });

  M.Class(function C() {
    C.Mixin(GenericMatrixBox);
    C.Mixin(Draggable);
    C.Mixin(Pinchable);
    C.Mixin(Resizable);
    C.Init(function EditableMatrixBox(item,state,cls,callback) {
      GenericMatrixBox.call(this,item,state,cls+' editable');
      if(callback) this.onchange=callback;
      this.enabledrag();
      this.enableresize();
      this.enablepinch();
    });
  });
});
});
});
});
});
