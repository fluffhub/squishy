Module(function M() {
M.Import('squishy/DOM.js',function(DOM) {
M.Import('squishy/basic.js',function(basic) {
M.Import('squishy/styles.js',function(styles) {
M.Import('squishy/interactive.js',function(interactive) {
M.Import('/js/MatrixBox.js',function(mb) {
  var Draggable=mb.Draggable;
  var Pinchable=mb.Pinchable;
  var Resizable=mb.Resizable;
  var MomentaryButton=interactive.MomentaryButton;
  var Img=basic.Img;
  //import pinchable, draggable
  var LayoutItem=DOM.LayoutItem;
  var Style=styles.Style;
  var ImageViewer=M.Class(function C() {

    C.Super(mb.MatrixBox);
    C.Init(function ImageViewer(image,state,target) {
      LayoutItem.call(this,'div','imageviewer');
      this.position={x:0,y:0};;
      this.size={width:100,height:100};
      this.windowsize={width:document.body.offsetWidth,height:document.body.offsetHeight};
      if(state)
        extend(this,state);
      else {

      }
      var that=this;
      this.Image=new Img(image.src,'snapshot editing','',function() {
        that.size={width:that.image.clientWidth,height:that.image.clientHeight};
      });
      //styles.Style(this.Image.element);
      //this.imagestyle=new styles.Style(this.Image.element.style);
      that.image=this.Image.element;
      this.Image.resize=HardCenter.prototype.resize;
      this.$e=this.Image.$e;
      this.snapshot=this.Image.element;
      var that=this;

      /*this.snapshot.onload=function() {
          console.debug(this);
          that.size={width:"100%",height:"100%"};
          that.draw();
        };*/
      this.add(this.Image);
      if(target)
        target.add(this);
      this.resize();
    });
    C.Mixin({
      imgscale:1,
      imgrotate:0,
      tempscale:1,
      draw:function(image) {
        if(image)
          this.image.src=image.src;
        var th=this.imgrotate*Math.PI/2;
        var is=this.imgscale*this.tempscale;
        var matrix=[is*Math.cos(th),
                    0-is*Math.sin(th),
                    is*Math.sin(th),
                    is*Math.cos(th),
                    is*this.position.x,
                    is*this.position.y];

        var ncss={	transform:'matrix('+matrix.join(',')+')'};
        Style(this.Image).Dimensions(ncss);
      },
      loadImage:function(image,state) {
      // this.image.src=image.src;
        if(state)
          extend(this,state);
        //this.snapshot.src=image.src;
        this.draw(image);
      },
      resize:function() {
        var nd;
        try {
          nd={width:this.parent.element.offsetWidth,height:this.parent.element.offsetHeight};
        }
        catch(E) {
          nd=this.windowsize;
        }
        if(nd.height!=0&&this.windowsize.height!=0)
          this.tempscale=nd.height/this.windowsize.height;
        //console.debug(nd);
        //if(this.windowsize===BlankWindowSize)
        //this.windowsize=nd;
        this.Image.resize();
        this.draw();
      }
    });
  });
  var EditableImageViewer=M.Class(function C() {
    C.Super(mb.EditableMatrixBox);
    C.Mixin(ImageViewer);
    C.Init(function EditableImageViewer(a,b){
      ImageViewer.call(this,a,b);
    })
  });
  var HardCenter=M.Class(function C() {
    C.Super(LayoutItem);
    C.Init(function HardCenter(element) {});
    C.Def(function resize() {
      var ms={width:this.element.offsetWidth,height:this.element.offsetHeight};
      //console.debug('resizing hard');
      //console.debug(ms);
      try {
        var ps={width:this.parent.element.offsetWidth,height:this.parent.element.offsetHeight};
        //console.debug(ps);
        var ML=(ps.width-ms.width)/2.0;
        var MT=(ps.height-ms.height)/2.0;
        ns={"margin-left":ML+"px","margin-top":MT+"px"};
        //console.debug(ns);
        //if(ML<0||MT<0) {

        this.$e.css(ns); //!!
        //}
      }
      catch(e) {

        //console.debug(ms);
        //console.debug(this);
      }
    });
  });
  var HardFill=M.Class(function C() {
    C.Super(LayoutItem);
    C.Init(function HardFill(element) {});
    C.Def(function resize() {
      var ms={width:this.element.offsetWidth,height:this.element.offsetHeight};
      var ps={width:this.parent.element.offsetWidth,height:this.parent.element.offsetHeight};
    });
  });
  var ImageEditor=M.Class(function C() {

    C.Super(ImageViewer);
    C.Mixin(Pinchable);
    C.Mixin(Draggable);
    C.Mixin(Resizable);
    C.Mixin(LayoutItem);

    C.Mixin({
      onchange:function(image,state) {

      },
      getstate:function() {
        return {position:this.position,
                windowsize:this.windowsize,
                imgscale:this.imgscale,
                imgrotate:this.imgrotate};
      },
      rotateleft:function(ev) {
        this.imgrotate+=3;
        this.imgrotate%=4;
        this.draw();
        this.onchange(this.image,this.getstate());
      },
      rotateright:function(ev) {
        this.imgrotate+=1;
        this.imgrotate%=4;
        this.draw();
        this.onchange(this.image,this.getstate());
      },
      zoomout:function(ev) {
        this.imgscale=this.imgscale-0.05;
        this.draw();
        this.onchange(this.image,this.getstate());
      },
      zoomin:function(ev) {
        this.imgscale=this.imgscale+0.05;
        this.draw();
        this.onchange(this.image,this.getstate());
      },
      //draw:ImageViewer.prototype.draw,
      /*
      mousewheel:function(e) {
        var e = window.event || e;
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        this.imgscale+=delta;
        this.drawimage();
      },
      */
    });
    C.Init(function ImageEditor(image,state,callback) {
      ImageViewer.call(this,image.element,state);
      //LayoutItem.call(this,'div','ImageEditor');
    //  this.Image=image;
      this.item=this.Image;
       //this.add(this.Image);
      this.controls=new LayoutItem('div','imaging');
      this.controls.Madd(
        new MomentaryButton('I','',this.handle(this.zoomin))
        ,new MomentaryButton('O','',this.handle(this.zoomout))
        ,new MomentaryButton('L','',this.handle(this.rotateright))
        ,new MomentaryButton('R','',this.handle(this.rotateleft)));
      this.add(this.controls);


      //super'd draggable, pinchable
      this.enabledrag();
      this.enablepinch();
     // this.enableresize();
      if(callback) this.onchange=callback;

      this.face=new Img('/img/face-outline.svg','face-outline');
      this.add(this.face);
    });

  });
});
});
});
});
});
});
