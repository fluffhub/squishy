Module(function M() {
  M.Import("squishy/DOM",function(DOM) {
    M.Def("font_types",{eot:'embedded-opentype',woff:'woff',ttf:'truetype',svg:'svg'});
    M.Def("media_type_properties", ["min-width", "max-width", "max-height", "min-height"])
    function recursive_match(elements,selector,top) {
      var ifailed=false;
      for(var i=0;i<elements.length;i++) {
        var el=elements[i];
        if(el!==top&&el.matches instanceof Function) {
          if(el.matches(selector)) {
            return true;
          }
          ifailed=ifailed || recursive_match(el.children,selector,top)
        }
      }
      return ifailed
    }

    var Style=M.Class(function C() {
      C.Init(function Style(item,v){
        
        if(this instanceof Style) {
          if(item instanceof Element) {
            Object.defineProperty(this, "element", {value:item})
            Object.defineProperty(this, "style", {value:item.style})
          }
        }else{
          if(item.Style){
            if(v)
              item.Style.Style(v);
            else
              return item.Style;
          } else {
            if(item.element){
              if(item.element.style){
                item.Style=new Style(item.element);
                if(v) item.Style.Style(v);
                return item.Style;
              }
            }
          }
        }
      });

      C.Def(function extract(recursive,unique, item,output,sheets,head) {
        var b=this.element;
        if(item instanceof Element) b=item;
        if(!(head instanceof Element)) head=b;

        var allsheets=document.styleSheets;
        if (sheets instanceof Array) allsheets=sheets;

        var output=output instanceof Object?output:{};
        for (var k=-1;k< b.children.length;k++) {
          var c;
          if(k==-1) c=head;

          else {
            c=b.children[k];
          }
          for (var i=0;i<allsheets.length;i++) {
            var rules=allsheets[i].rules || allsheets[i].cssRules;

            if(output[i] instanceof Object) {} else { output[i]={}; }

            for (var r=0;r< rules.length;r++) {
              var rule=rules[r];
              var selectortext = rules[r].selectorText;
              if(typeof(rules[r].selectorText)=="string")
                selectortext=selectortext.replace(/:hover|:active|::?before|::?after/g,"");
              if(c.matches instanceof Function)  {
                if(c.matches(selectortext)) {
                  if(unique) {
                    var els=document.querySelectorAll("body>*");
                    var failed=false;
                    if(!recursive_match(els,selectortext,head)) output[i][r]=rule;

                  }

                  else {
                    output[i][r]=rule;
                  }
                }

              }
            }
          }

          if(k>-1&&c.children!==undefined && c.children.length>0&&recursive)
            extract.call(this,recursive,unique,c,output,sheets,head);
        }

        return output;
      });
      C.Def(function clear(recursive, unique,item, sheets) {
        var obj=this.extract(recursive,unique);
        for (var i in obj) {
          var keys=Object.keys(obj[i]);
          keys=keys.map(function(a) { return parseInt(a) }).sort(function(a,b) { return b-a });

          for (var j=0;j<keys.length;j++) {
            var key=keys[j];
            var pss=obj[i][key+""].parentStyleSheet||document.styleSheets[i];

            console.debug("deleting rule "+key+" from sheet "+i);
            pss.deleteRule(key);
            //else

          }
        }
      });
      C.Def(function dump(recursive,unique,prefix) {
        var output="";
        var prefix=prefix || "";
        var rules=this.extract(recursive,unique);
        for (var i in rules) {
          for (var j in rules[i]) {
            var rule=rules[i][j];
            output=output+prefix+rule.cssText+"\n";
          }
        }
        return output;
      });

      C.Def(function Transform(q) {
        this.transform=q;
        this.style.transform=q;

      });
      C.Def(function Dimensions(q,units,prefix,suffix) {
        if(q) {
          if(prefix)
            prefix=prefix+'-';
          else
            prefix='';
          if(suffix)
            suffix=suffix+'-';
          else
            suffix='';
          var units=units||'px';
          var vs=[prefix+'top'+suffix,
                  prefix+'left'+suffix,
                  prefix+'right'+suffix,
                  prefix+'bottom'+suffix,
                  'width','height'];
          var r=extend({},q);
          for (var v in vs) {
            var m=""+q[vs[v]];
            if(m!=undefined) {
              if(!isNaN(m))
                r[vs[v]]=m+units;
              else
                if(m.indexOf(units)!==-1)
                  r[vs[v]]=m;

            }
          }
          this.Style(r);
        }
      });
      C.Def(function Style(q) {
        if(typeof q === 'string' || q instanceof String) {
          if(arguments[1])
            this.style[q]=arguments[1];
          return this.style[q]
        }
        if(q) {
          for (var key in q) {
            this.style[key]=q[key];
          };
        }
        else
          return this.style;
      });
    });


    var StyleSheet=M.Class(function C() {
      
      C.Init(function StyleSheet(element,attr,doc) {
        var doc=doc || document;
        Object.defineProperty(this, "doc", {value:doc});
        var ss=this;
        this.prefix="";
        Object.defineProperty(this,"sheet",{
          get:function() { 
            return this.element.sheet 
          }});
        if(typeof element === "string") {
          //this is a filename
          Object.defineProperty(this,"element",{value:this.doc.createElement("link")});
          this.element.setAttribute("rel","stylesheet");
          this.element.setAttribute("href",element);
          this.element.sheet.disabled=true;
        } else {
          if(element instanceof Element) {
            if(element.tagName==="style" || 
            (element.tagName==="link" && 
            element.getAttribute("rel")==="stylesheet" )) {
              this.element=element;
            } else {
              throw new Error("Not a style element.");
            } 
          } else {
            Object.defineProperty(this,"element",{value:this.doc.createElement("style")});
            this.element.appendChild(this.doc.createTextNode(""));
            this.doc.head.appendChild(this.element);
            this.element.sheet.disabled=true;
      
            if(element instanceof Function) {
                element.call(this);
                this.enable();
            }
          }
        }

        if(attr!==undefined)
          for (var n in attr)
            this.element.setAttribute(n, attr[n]);
      });
      C.Def(function toggle() {
        this.sheet.disabled=this.sheet.disabled ? false : true;
      })
      C.Def(function enable() {
        this.sheet.disabled = false;
      });
      C.Def(function disable() {
        this.sheet.disabled = true;
      });
      
      C.Def(function dump(prefix) {
        var rules=this.sheet;
        prefix=prefix||"";
        var output="";
        for (var i in rules) {
          for (var j in rules[i]) {
            var rule=rules[i][j];
            if (rule !== null && typeof (rule.cssText)=="string") output=output+prefix+rule.cssText+"\n";
          }
        }
        return output;
      });
      C.Def(function addMedia(config) {
        if(config instanceof Object) { } else config={};
        var type="screen";
        if(config.type) { type=config.type; }


      });
      
      C.Def(function Prefix(value, fun) {
        var oldprefix=this.prefix;
        this.prefix=this.prefix+value;
        fun.call(this);
        this.prefix=oldprefix;
      });
      C.Def(function addKeyframes() {

      });
      C.Def(function addStyle(query,rules) {
        var newrules;
        if(typeof query === "string" ) {
          if(typeof rules === "string") {
            newrules=rules;
          } else {
            if (rules instanceof Array) {
            } else {
              if (rules === undefined) {
              } else if (rules instanceof Object) {
                var str="";
                var S=this;
                Object.keys(rules).map(function(k) {
                  
                  var sk=k.replace(/(?<!_)_(?!_)/g, "-")
                  
                  var values=sk.split("__");
                  
                  var value="";
                  if(values.length>1) {
                    value = S.ThemeFormatters[values[values.length-1]].get(rules[k])
                    value=values[0]+":"+value+";";
                    console.debug({key:values[1], key2:k, value:value})
                  } else {
                    value=sk+":"+rules[k]+";"
                  }
                  str+=value;
                });
                  newrules=str;
              }
            }
          }
        }
        
        this.sheet.insertRule(this.prefix+query+"{"+newrules+"}");

      });
      
      C.Def(function addFont(name,files) {
        var rules=["font-family:'",name,"'"];
        if(files.eot)
          rules.push("src:url('"+files.eot+"')");

        var srcs=[];
        for(var ft in files) {
          srcs.push("url('"+files[ft]+"') format('"+M.Self.font_types[ft]+"')");
        }
        if(srcs.length>0) rules.push('src:'+srcs.join(','));
        return "@font_face {"+rules.join(';')+"}";
      });
      C.Def(function Init(fun) {
        Object.defineProperty(this, "init", {value:fun});
        fun.call(this);
      });
      function normalize_chunk (value) {
        if(value > 1) {
          if(value < 256) {
            return Math.round(value);
          } else {
            return 255;
          }
        } else if(value > 0) {
          return Math.round(value*256);
        }
      }
      function normalize_opacity(value) {
        var value = parseFloat(value);
        if(value >= 1) return 1.0;
        if(value <= 0) return 0.0;
        return value;
      }
      var ThemeFormatters=C.Def("ThemeFormatters", {
        "px": { get: function (value) { 
          return value+"px"; 
        }, set: function (value) {
          if (typeof value==="number") return value;
          else if (typeof value==="string" && value.slice(0,-2)==="px") return parseFloat(value.slice(0,value.length-3))
          else throw new TypeError("Style: Not a pixel value")
        }},
        "em": { get: function(value) {
          return value+"em";
        }, set: function (value) {
          if (typeof value==="number") return value;
          else if (typeof value==="string" && value.strip().slice(0,-2)==="em") return parseFloat(value.slice(0,-3))
          else throw new TypeError("Style: Not a em value")
        }},
        "string": { get: function(value) {
          return '"'+value+'"';
        }, set: function(value) {
          if (typeof value==="string") return value;
          if (value.toString instanceof Function) return value.toString();
        }},
        "p": { get: function(value) {
          return value+"%";
        }, set: function (value) {
          if (typeof value==="number") return value;
          else if (typeof value==="string" && value.strip().slice(0,-1)==="%") return parseFloat(value.slice(0,-2))
          else throw new TypeError("Style: Not a % value")
        }},
        "color": { get: function (value) {
          if(typeof value==="object") {
            if(value instanceof Array) {
              // color specification
              if(value.length==1) {
                value = normalize_chunk(value[0])
                return "rgb("+[value,value,value].join(",")+")"
              }
              else if(value.length==2) {
                // this is a grayscale with opacity
                var value0=normalize_chunk(value[0]);
                var value1=normalize_opacity(value[1]);
                return "rgba("+[value0, value0, value0, value1].join(",")+")"
              } else if(value.length==3) {
                //this is an rgb
                value=value.map(function(v) { return normalize_chunk(v) })
                return "rgb("+value.join(",")+")";
              } else if(value.length==4) {
                
                value=value.map(function(v, k) { 
                  if(k==3) return normalize_opacity(v); 
                  return normalize_chunk(v) 
                });
                return "rgba("+(value).join(",")+")";
              }
            }
          } else if (typeof value==="number") {
            //hex 16-bit color value
            value=value.toString(16)
            value="#"+("000000"+value).slice(-6)  
          }
          else if (typeof value==="string") {
            //hex hashtag value
            return value;
          }
        }
        }});

        C.Construct(Module.__construct__);
        C.Set(Module.__setter__);
        C.Get(Module.__getter__);
      

      C.Def(function Theme(obj) {
        var target=this;
        if(this.theme) {
          extend(this.theme.__self__, obj)
        } else { 
        this.theme=Watch(obj, function(t,k,v) { 
          target.clear();
          target.init();
        }, {
          getter:function(t,k) {
            var options = k.split("__");
            var base = options.shift();
            if(options.length>0) {
              value=ThemeFormatters[options[0]].get(t[k])
              return value;
            } else {
              var names = Object.keys(t);
              for (var i=0;i<names.length;i++) {
                var name=names[i];
                var params = name.split("__")
                if(params[0] == base) {
                  return t[name];
                } 
              }
              return t[k]
            }          
          }
        });
      }
      return this.theme;
      });
      C.Def(function clear() {
        for(var i=0;i<this.sheet.cssRules.length;i++) {
          sheet.deleteRule(i);

        }
      });
    });


    Module.addTemplate(function Style(fn) {
      //Create a stylesheet associated with the module;
      //execute the style constructor to build the style
      //If this is a filename, import the file and load it to a SS obj.
      var ss = new StyleSheet(fn);
      
      if(this.stylesheets) {
        this.stylesheets.push(ss);
      } else {
        this.stylesheets=[ss];
      }
    });

    Class(function C(){
      C.Init(function Icon(type) {
        DOM.LayoutItem.call(this,'span');

      });

      C.Mixin({
        fonts:'/',
        types:{
          "<-":"",
          "->":"",
          ">":"\uf054",
          "<":"\uf053",
          "v":"\uf078",
          "^":"\uf077",
          "!":"\ue612",
          "i":"\uf05a",

          "?":"\uf059",
          "+":"\uf055",
          "-":"\uf056",
          "yy":"\uf058",
          "\\":"\uf05e",
          "!!":"\uf071",
          ">>":"\uf101",
          "<<":"\uf100",
          ".":"\uf062", //dot
          "y":"\ue616", //check mark
          "x":"\ue617", //"marks the spot"
          "X":"", //"say no to drugs"

          "u":"\ue639",
          "U":"\ue637",
          "ZI":"\ue987", //zoomin
          "ZO":"\ue988",
          "RL":"\ue965",
          "RR":"\ue966",

          "C":"",//camera
          "A":"\ue9cd", //attach
          "T":"\ue9ac", //trash delete
          "G":"\ue9c9",//global
          "R":"\ue9d2",//bookmark
          "Rs":"\ue9d3",//bookmarks
          "M":"\ue9bd",//menu
          "Z":"\uf02e", // magnifying glass
          "LI":"",
          "LO":"\ue633",

          "play":"",
          "pause":"",
          "stop":"",
          "next":"",
          "last":"",

          "save":"",
          "upload":"\uf00f",
          "download":"\uf00b",
          "ND":"\ue931", //new directory
          "OD":"",//open
          "CD":"",//closed
          "show":"\uf06e",
          "hide":"\uf070",
          "link":"\uf060",

          "off":"\uf204",
          "on":"\uf205",

          "search":"\uf02e",
          "edit":"\ue629",

          "refresh":"\uf087",
          "share":"",
          "key":"\uf084",


          "refresh":"\ue984",
          "nwa":"", //arrows

          "closed":"",
          "config":"\uf0ad",
          "properties":"",

        }
      });
    });
  });
});