Module(function M() {
M.Import('squishy/DOM',function(DOM) {
  var Tag=DOM.LayoutItem;
  var XTag=DOM.XTag;
  var SVGNS="http://www.w3.org/2000/svg";

  var SVGTag=M.Class(function C() {
    C.Super(XTag);
    C.Init(function SVGTag(type,attrs) {
      if(arguments[0] instanceof Node) {
        XTag.call(this,SVGNS,arguments[0].tagName);
        this.element=arguments[0];
      } else {
        XTag.call(this,SVGNS,type,attrs);
      }

      this.position={x:0,y:0};
    });
    C.Def(function fit(bbox) {
      try{
        if(bbox instanceof Object) { }
        else bbox=this.bounds();
        this.NSattrs({viewbox:bbox.x+" "+bbox.y+" "+bbox.x+bbox.width+" "+bbox.y+bbox.height});

      } catch(e) {

      }

    });
    C.Def(function bounds() {
      return this.element.getBBox();
    });

    C.Def(function translate(x,y) {
      if(arguments.length==2)
        this.position={x:x,y:y};
      else
        extend(this.position,x);
      this.NSattrs({transform:'translate('+this.position.x+','+this.position.y+')'});
    });

    C.Def(function ClassName() {
      if(this.element.className.baseVal)
      return this.element.className.baseVal
      else return this.element.className;
    });
    C.Def(function offset() {
      var leaf=this;
      var transform={x:0,y:0};
      (function up(l) {
        transform.x=transform.x+l.position.x;
        transform.y=transform.y+l.position.y;
        if(l.parent&&l.parent.xmlns&&l.parent.xmlns==SVGNS) up(l.parent);
      })(leaf);
      return transform;
    });
  });

  var SVG=M.Class(function C(){
    C.Super(SVGTag);
    C.Init(function SVG() {

        SVGTag.call(this,'svg');

      with(SVG.kwargs({width:null,height:null,src:null,content:null,onload:null})) {
        var tag=this;
        this.NSattrs({version:"1.1"});

        if(width&&height) this.NSattrs({width:width+'px',height:height+'px'});
        this.paths=[];

        if(src!==null) {

          Import("squishy/request",function(Req) {
            var Request=Req.Request;
            var req=new Request("URI","TEXT").Get(src,{},function(svgtext) {

              tag.content(svgtext);
              if(onload!==null) {
                onload(tag);
              }
            });
          });
        }



          //Tag.prototype.attrs.call(this,{version:"1.1",xmlns:SVGNS});



              if(content!=null) {
                tag.content(content);

              }

      }});

    C.Mixin({
      addPath:function(path,fill,stroke,id) {
        this.add(new Path(path, fill, stroke, id));
      },
      translate:function(x,y) {
        if(x&&y)
          this.position={x:x,y:y};
        this.NSattrs({x:this.position.x,y:this.position.y});
      }
    });
  });
  var samplepath="M159.61,34c-4.113,7.473-15.782,14.633-44.635,16.012c-26.595,1.27-61.491,0.707-69.895-8.402"
  +"C38.44,34.409,29.028,19.217,27.453-9.993c-1.087-20.155,35.224-20.813,76.596-20.813c25.865,0,50.62,0.255,56.835,8.024"
  +"C167.281-14.786,165.851,22.661,159.61,34z M195.181,2.053c2.285-8.326,2.535-15.514,0-24.165"
  +"c-1.128-0.752-12.375-1.241-17.328-1.854c-8.009-0.99-5.928-13.086-25.219-14.316c-19.5-1.244-37.653-1.498-52.229-1.498"
  +"c-28.763,0-49.065,0.87-70.421,5.196C20.434-32.65,13.95-22.536,0-22.536V-1c1.823,0,6.435,0.443,8.867,1.891"
  +"c6.665,3.968,6.282,3.216,16.161,24.077c4.275,9.027,7.672,13.465,14.962,20.668c13.315,13.158,59.447,10.472,70.475,10.328"
  +"c30.83-0.4,47.519-9.006,52.774-13.912c4.286-4,6.872-19.25,11.02-31.333C177.115,2.401,192.42,3.429,195.181,2.053z";

  var sample1="M159.61,34c-4.113,7.473-15.782,14.633-44.635,16.012c-26.595,1.27-61.491,0.707-69.895-8.402"
  +"C38.44,34.409,29.028,19.217,27.453-9.993c-1.087-20.155,35.224-20.813,76.596-20.813c25.865,0,50.62,0.255,56.835,8.024"
  +"C167.281-14.786,165.851,22.661,159.61,34z M195.181,2.053c2.285-8.326,2.535-15.514,0-24.165"
  +"c-1.128-0.752-12.375-1.241-17.328-1.854c-8.009-0.99-5.928-13.086-25.219-14.316c-19.5-1.244-37.653-1.498-52.229-1.498"
  +"c-28.763,0-49.065,0.87-70.421,5.196C20.434-32.65,13.95-22.536,0-22.536V-1c1.823,0,6.435,0.443,8.867,1.891"
  +"c6.665,3.968,6.282,3.216,16.161,24.077c4.275,9.027,7.672,13.465,14.962,20.668c13.315,13.158,59.447,10.472,70.475,10.328"
  +"c30.83-0.4,47.519-9.006,52.774-13.912c4.286-4,6.872-19.25,11.02-31.333C177.115,2.401,192.42,3.429,195.181,2.053z";

  var sample2="M159.653,36.342c-6.75,21.25-9.706,28.984-43.588,31.261c-26.564,1.784-61.581,0.547-69.984-8.562"
  +"C39.44,51.84,27.453,10.503,27.453-9.993c0-20.184,35.224-20.813,76.596-20.813c25.865,0,50.638,0.683,56.116,7.221"
  +"C168.111-14.104,163.571,24.006,159.653,36.342z M195.181,2.053c2.285-8.326,2.535-15.514,0-24.165"
  +"c-1.128-0.752-12.375-1.241-17.328-1.854c-8.009-0.99-5.604-12.277-22.279-13.558c-19.483-1.497-40.593-2.256-55.169-2.256"
  +"c-28.763,0-49.065,0.87-70.421,5.196C20.434-32.65,13.95-22.536,0-22.536V-1c1.823,0,6.435,0.442,8.867,1.891"
  +"c6.665,3.968,8.026,2.476,16.161,24.076c4.626,12.285,10.147,30.711,16.962,38.099c12.692,13.763,68.612,9.944,79.62,9.286"
  +"c29.431-1.764,31.918-8.036,37.419-18.758c4.329-8.438,11.844-28.95,14.976-41.585C176.121,3.473,191.988,4.274,195.181,2.053z";


  var PathDefinition=M.Class(function C(){
   //this might not work with arcs
    //does not validate path commands specifically,
    //just recognizes that it is a path command
    var findpieces=/([MhsSHcCvVaAzZ])/;
    //this is a stub for a more thorough parser
    var pieceparsers={
     // M:/-?[\d.]+,|?=-|\s+[\d.]+/
      //etc
    };
    var findpoints=/,|(?=-)|\s+/;
    var _precision=10000;
    C.Init(function PathDefinition(d) {
      //var path=findpath.exec(d)[1];
      this.commands=[];
      this.points=[];

      if(d) {
        d=d.trim();
        var pieces=d.split(findpieces).slice(1);
        pieces=pieces.slice(1,pieces.length-1);
        for (var i=0;i<pieces.length/2;i++) {
          var cmd=pieces[i*2];
          var piece=pieces[i*2+1];
          this.commands[i]=cmd;
          this.points[i]=[];
          if(cmd!='z'&&cmd!='Z') {
            var points=piece.trim().split(findpoints);
            for (var j=0;j<points.length/2;j++) {
              var a=parseFloat(points[j*2]),b=parseFloat(points[j*2+1]);
              if(!isNaN(b)) this.points[i][j]=[a,b];
              else if(!isNaN(a)) this.points[i][j]=[a];
              else this.points[i][j]=[];
            }
          }
        }
      }
    });
    C.Def(function toJSON() {
      return this.toString();
    });
    function _traversePts(fun) {
      for (var i=0;i<this.points.length;i++) {
        for (var j=0;j<this.points[i].length;j++) {
          this.points[i][j]=fun(this.points[i][j]);
        }
      }
    }
    function _traverseVals(fun) {
      _traversePts.call(this,function(pt) {
        for (var k=0;k<pt.length;k++) {
          pt[k]=fun( pt[k]);
        }
      });
    }
    C.Def(function scale(s) {
      _traverseVals.call(this,function(v) {
        return v*s;
      });
    });
      C.Def(function bounds() {
        var x=0,y=0;
        _traversePts.call(this,function(v) {
          //[x,y]
          if(v.length>=2){
            x+=v[0];
            y+=v[1];
          }
        });
        return [x,y];
      });

    C.Def(function toString(){
      var d="";
      for (var i=0;i<this.commands.length;i++){
        d+=this.commands[i];
        for(var j=0;j<this.points[i].length;j++){
          var point=this.points[i][j];
          if(!isNaN(point[0])){
            //this distinction is not necessary
            if(j>0&&point[0]>=0) d+=',';
            d+=point[0];
          }
          if(!isNaN(point[1])){
            if(point[1]>=0) d+=',';
            d+=point[1];
          }
        }
        if(this.commands[i]=='z'&&i<this.commands.length-1) d+=' ';
      }
      return d;
    });
  });


  var Text=M.Class(function C() {
    C.Super(SVGTag);
    C.Init(function Text(txt, attrs){
      SVGTag.call(this,'text');
      this.content(txt);
      this.NSattrs(attrs);
    });
  });
  var Path=M.Class(function C() {
    C.Super(SVGTag);
    C.Init(function Path(d,attrs,fill,stroke,id){
      SVGTag.call(this,'path');
      if(attrs) this.NSattrs(attrs);
      if(fill) this.NSattrs({fill:fill}); else this.NSattrs({fill:'none'});
      if(stroke) this.NSattrs({stroke:stroke});
      if(id) this.NSattrs({id:id});
      if(d) this.define(d);
     // this.fill=fill;
     // this.stroke=stroke;
     // this.id=id;
    });
    C.Def(function define(d) {
      if(d instanceof PathDefinition){
        this.definition=d;
        this.NSattrs({d:d.toString()});
      }else{
        var pd=new PathDefinition (d);
        this.definition=pd;
        this.NSattrs({d:d});
      }
    });
  });
  var Group=M.Class(function C() {
    C.Super(SVGTag);
    C.Init(function Group(cls, id) {

      SVGTag.call(this,'g');
      if(cls) this.NSattrs({class:cls});
      if(id) this.NSattrs({id:id});
    });

  });
  var Circle=M.Class(function C() {
    C.Super(SVGTag);
    C.Init(function Circle(r,x,y,attrs) {
      this.position={x:x,y:y};
      this.radius=r;
      extend(attrs,{r:r,cx:x,cy:y});
      SVGTag.call(this,'circle',attrs);
    });
  });
  var Rect=M.Class(function C() {
    C.Super(SVGTag);
    C.Init(function Rect(x,y,w,h) {

      this.position={x:x,y:y};
      XTag.call(this,SVGNS, 'rect', { width:w,height:h,x:x,y:y});

    });
  });


  var PathInterpolation=M.Class(function C() {
    C.Init(function PathInterpolation() {
      this.paths=[];
      var args=[];
      if(arguments.length==1&&arguments[0].length>=0) args=arguments[0]
      else args=arguments;
      var base=Math.log(args.length)/Math.log(2);
      if(base==parseInt(base)) {
        this.dof=parseInt(base);
        for(var i=0;i<args.length;i++) {
          var d=args[i];
          if(d instanceof PathDefinition) this.paths[i]=d;
          else this.paths[i]=new PathDefinition(d);
        }
      }
      else throw new Exception('The number of arguments should be a power of 2');
    });
    var _precision=10000;
    function _interpolate(paths,values) {
      //2 path definitions
      // 1 var
      if(paths.length==2&&values.length==1) {
        var a=paths[0],b=paths[1];
        var v=values[0];
        if(a.points.length==b.points.length) {
          var pd=new PathDefinition();
          for (var i=0;i<a.commands.length;i++) {
            pd.commands[i]=a.commands[i];
            pd.points[i]=[];
            for (var j=0;j<a.points[i].length;j++) {
              pd.points[i][j]=[];
              for (var k=0;k<a.points[i][j].length;k++) {
                var x1=a.points[i][j][k];
                var x2=b.points[i][j][k];
                var x3=x1+v*(x2-x1);
                x3=Math.round(x3*_precision)/_precision;
                if(!isNaN(x3)) pd.points[i][j][k]=x3;
                else throw new Exception('unmatched paths can\'t interpolate. '+i+','+j+','+k);
              }
            }
          }
          return pd;
        }
        else throw new Exception('unmatched paths can\'t interpolate. '+a.points.length+' != '+b.points.length);
      }
      else if(paths.length==4&&values.length==2) {
        //paths.length power of 2
        //bilinear
        return _interpolate([_interpolate([paths[0],paths[1]],[values[0]]),
                            _interpolate([paths[2],paths[3]],[values[0]])],
                           [values[1]]);
      }
    }
    C.Def(function interpolate() {
      if(arguments.length<this.dof) throw new Exception('too many arguments. # arguments is '+this.dof);
      if(arguments.length>this.dof) throw new Exception('too few arguments. # arguments is '+this.dof);
      return _interpolate(this.paths,arguments);
    });
  });
  var defaults=M.Def("defaults",{
    svg:function(element) {
      var svg=new SVGTag(element.getAttributeNS(null,"width"),element.getAttributeNS(null,"height"));
      //svg.element=element;
      return svg
    },
    g:function(element) {

      var g=new Group()//element.getAttributeNS(null,"class"),element.getAttributeNS(null,"id"));
      //g.element=element;
      return g;

    },
    path:function(element) {
      var d=element.getAttributeNS(null,"d");
      var fill=element.getAttributeNS(null,"fill");
      var stroke=element.getAttributeNS(null,"stroke");
      var id=element.getAttributeNS(null,"id");
      var path=new Path(d,{},fill,stroke,id);
      //path.element=element;
      return path;
    },
    /*text:function(element) {

    },
    circle:function(element) {

    },
    rect:function(element) {

    },
    _default:function(element) {


    }*/
  });
  DOM.namespaces[SVGNS]=new DOM.NameSpace({
      name:"SVG",
      convert:function convert(element) {
        var el;
        if(element.tagName in defaults) {
          el= defaults[element.tagName](element)
        }
        else el= new XTag(SVGNS,element.tagName);

        el.element=element;
        element.Tag=el;
        return el;
      },

      tags:{

      }
  });
  window.Import.types["svg"]=function(path,callback) {
    var img=new SVG({src:path,onload:callback});
  }
});
});
