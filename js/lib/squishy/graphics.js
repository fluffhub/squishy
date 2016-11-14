Module(function M() {
M.Import('squishy/DOM',function(DOM) {
    window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame    ||
              function( callback ){
                window.setTimeout(callback, 1000 / 60);
              };
    })();

    function color_pallette() {

      var cols=[];

      var a1=0;
      var a2=0;
      var a3=0;

      var h=0;
      Math.sin(a1);
      var i=0;
      //for (a1=0;a1<Math.PI*2;a1+=Math.PI/18) {
      for(h=0;h<Math.PI*2;h+=2.3996/19) {
        a1+=Math.PI/18;
        var v=Math.pow(((Math.sin(a1*6)+1)/2)+0.01,0.2);
        var row=[];
        var r,g,b;
        for (s=Math.PI;s>=0;s-=Math.PI/5) {
          r=Math.round((Math.sin(h)+1)*v*0.9*255/2);
          if(r>255) r=255;
          g=Math.round((Math.sin(h+s/2)+1)*v*0.9*255/2);
          if(g>255) g=255;
          b=Math.round((Math.sin(h+s)+1)*v*0.9*255/2);
          if(b>255) b=255;
          row[row.length]={r:r,g:g,b:b};
        }
        //h+=Math.PI/17;
        h+=2.3996/19;
        cols[cols.length]=row;
      }
      return cols;
    }
    function dec2hex(i,n) {
      var padding='';
      for(j=0;j<n;j++) {
        padding+='0';
      }
      var h=i.toString(16);
      return padding.substr(0,0-h.length)+h;
    }
    function hexcolor(color) {
      return '#'+dec2hex(color.r,2)+dec2hex(color.g,2)+dec2hex(color.b,2);
    }
    function random_color(a){
      a=Math.random()*2*Math.PI;
      var r=Math.round((Math.sin(a)+1)*255/2);
      var g=Math.round((Math.sin(a+Math.PI/2)+1)*255/2);
      var b=Math.round((Math.sin(a+Math.PI)+1)*255/2);
      //a+=2.3996;
      return {r:r,g:g,b:b};
    }
    function rotate ($item,degrees) {
      $item.css({
        "-webkit-transform": "rotate("+degrees+"deg)",
        "-moz-transform":    "rotate("+degrees+"deg)",
        "-ms-transform":     "rotate("+degrees+"deg)",
        "-o-transform":      "rotate("+degrees+"deg)"
      });
    }
    function dims (item) {
      var o=item.offset();
      return {left:o.left,top:o.top,w:item.width(),h:item.height()};
    }
    function dims2(item) {
      var o=item.position();
      return {x1:o.left,y1:o.top,x2:item.width()+o.left,y2:item.height()+o.top};
    }
    function intersect_rect(r1,r2) {
      //uses dims2 values
      return !(r2.x1 > r1.x2 ||
               r2.x2 < r1.x1 ||
               r2.y1 > r1.y2 ||
               r2.y2 < r1.y1);
    }
    M.Class(function C() {
      C.Init(function Canvas(target, cls) {
        var canvas=document.createElement('CANVAS');
        canvas.width="100%";
        canvas.height="100%";
        if(cls)
          canvas.setAttribute("class",cls);
        //	'<canvas id="graph-overlay"  width="100%" height="100%"></canvas>''
        //	canvas=document.getElementById('graph-overlay');
        this.canvas=canvas;
        this.element=canvas;

        this.context=canvas.getContext('2d');
        if(target)
          target.appendChild(this.canvas);
      });
      C.Mixin({
        reset:function() {
          var gcd=dims($(this.canvas));
          this.context.setTransform(1,0,0,1,0,0);
          this.context.translate(-gcd.left,-gcd.top);
          this.context.clearRect(0,0,canvas.width+gcd.left,canvas.height+gcd.top);

        },
        draw_circle:function() {},
        draw_text:function(text,x,y) {},
        draw_line:function() {},
        draw_spline_path:function (start,end,w,style) {
          //start/end : {top:y,left:x}
          //mlc=min_line_clearance;
          this.context.beginPath();
          this.context.lineWidth=w;
          this.context.strokeStyle=style;
          this.context.moveTo(start.left,start.top);
          var dx=start.left-end.left;
          var dy=start.top-end.top;
          var mlc=Math.sqrt(dx*dx+dy*dy)/1.75;
          //mlc=d/2;
          this.context.bezierCurveTo(start.left+mlc,start.top,end.left-mlc,end.top,end.left,end.top);
          this.context.stroke();
        },
        draw_wire_path:function (ip,op,w,style) {
          var context=this.context;
          context.beginPath();
          context.lineWidth=w;
          context.strokeStyle=style;
          d={x:(ip.left-op.left),y:(ip.top-op.top)};
          context.moveTo(ip.left,ip.top);
          context.lineTo(ip.left-d.x/2,ip.top);
          context.lineTo(ip.left-d.x/2,op.top);
          context.lineTo(op.left,op.top);
          context.stroke();
        }
      });


    });
});
});
