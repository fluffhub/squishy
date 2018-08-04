Module(function M() {
M.Import("squishy/DOM", "squishy/svg", "squishy/events", "squishy/transform",
         function(DOM,svg,events,transform) {
  var hasEvents=events.hasEvents;
  var Group=svg.Group;
  var Text=svg.Text;
  var SVG=svg.SVG;
  var pinwidth=10;
  var pinheight=7.5;
  var pinoffset=5;
  var SVGBlock=M.Class(function C() {
    C.Super(transform.SVGMatrixBox);
    C.Init(function SVGBlock(node){
      if(node.dimensions) { }
      else { node.dimensions={x:0,y:0,w:50,h:50} }
      this.auto_size(node);
      transform.SVGMatrixBox.call(this,node.dimensions.w,node.dimensions.h);
      this.position={x:node.dimensions.x,y:node.dimensions.y};
      this.node=node;
     // this.inputs={};
      //this.outputs={};
      this.Inputs={};
      this.Outputs={};
      this.draw_node(this.node);

      this.addClass('node');
    });
    C.Mixin({
      auto_size:function(n) {
        var C=new Text(n.repr,{
          class:'node-content',
          'text-anchor':'middle'
        });
        if(n.dimensions.w=='auto') {
          var temp=new svg.SVG();
          temp.add(C);
          document.body.appendChild(temp.element);
          n.dimensions.w=C.bounds().width+10;
          C.remove();
        }
      },
      draw_node:function (n) {
        this.auto_size(n);
        var I=new Group('inputs pins');
        var O=new Group('outputs pins');
        var name=n.blockname || n.name;
        var T=new Text(name,{class:'node-title',
                               'text-anchor':'middle'});
        this.add(T);
        T.translate(n.dimensions.w/2,n.dimensions.h+15);

        var Outline=new svg.Rect(0,0,n.dimensions.w,n.dimensions.h);
        Outline.NSattrs({fill:'#FFF',stroke:'#000'});
        if(n.outline) {}
        if(n.repr) { } else { n.repr=''}
        var C=new Text(n.repr,{
          class:'node-content',
          'text-anchor':'middle'
        });


        var nh=n.dimensions.h;
        for (var i in n.inputs) {
          var key=n.inputs[i];
          var py=(nh/n.inputs.length/2)*(2*i+1);
          var P=this.pin(key,'input',0,py);
          this.Inputs[key]=P;
          I.add(P);
        }
        for (var i in n.outputs) {
          var key=n.outputs[i];
          var py=(nh/n.outputs.length/2)*(2*i+1);
          var P=this.pin(key,'output',n.dimensions.w,py);
          this.Outputs[key]=P;
          O.add(P);
        }

        this.add(Outline);
        this.add(I);
        this.add(O);
        this.add(C);
        C.translate(n.dimensions.w/2,n.dimensions.h/2+6);
        this.content=C;
        this.title=T;
        this.outline=O;
        return this;
      },
      pin:function(name,type,x,y) {
        var P=new Group(type+' pin');
        P.attrs({'data-pin':name});

        var anchors=['start','end'];
        var anchor=0;
        var H=new svg.Path();

        if(type=='input') {
          H.define("M0,0"+
                   "l0,0,-"+pinwidth+",-"+pinheight/2+
                   "l0,0,0,"+pinheight+
                   "z");
          anchor=0;
        }
        else {
          H.define("M"+pinwidth+",0"+
                   "l0,0,-"+pinwidth+",-"+pinheight/2+
                   "l0,0,0,"+pinheight+
                   "z");
          anchor=1;
        }
        H.attrs({fill:"#000"});
        P.translate(x,y);
        P.add(H);
        if(!isInt(name)) {
        var HN=new Text(' '+name,{class:'handle-name',"text-anchor":anchors[anchor]});
        HN.translate(anchor?-2:1,3);
        P.add(HN);

        }
        P.pin=H;
        var Hand=new svg.Circle(7.5,(anchor*2-1)*7.5,0,{fill:'rgba(250,250,255,0.05)'});
        P.handle=Hand;
        P.add(Hand);
        return P
      }
    });
  });
});
});
