Module(function M() {
  var Style=M.Class(function C() {
    C.Init(function Style(item,v){
      if(this instanceof Style) {
        if(item instanceof Element) {
          this.element=item;
          this.style=item.style;
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
          }}
      }
    });
    C.Def(function extract(recursive,unique, item,output,sheets,head) {

      var b=this.element;
      if(item instanceof Element) b=item;
      if(!(head instanceof Element)) head=b;

      var allsheets=document.styleSheets;
      if (sheets instanceof Array) allsheets=sheets;

      var output=output || {};
      for (var k=0;k< b.children.length;k++) {
        var c=b.children[k];

        for (var i=0;i<allsheets.length;i++) {
          var rules=allsheets[i].rules || allsheets[i].cssRules;

          if(output[i] instanceof Object) {} else { output[i]={}; }

          for (var r=0;r< rules.length;r++) {
            if(c.matches instanceof Function)  {
              if(c.matches(rules[r].selectorText)) {

                if(unique) {

                  var els=document.querySelectorAll("body>*");
                  var failed=false;
                  function dive(elsa) {

                    for(var i=0;i<elsa.length;i++) {
                      var ifailed=false;
                      var el=elsa[i];
                      if(el!==c&&el.matches instanceof Function) {
                        if(el.matches(rules[r].selectorText)) {
                          ifailed=failed=true;

                        }
                        if(!ifailed) {
                          return dive(el.children)
                        } else {
                          return true
                        }
                      }
                    }
                  }

                  if(!(dive(els))) output[i][r]=(rules[r]);
                }
              } else {
                output[i][r]=(rules[r]);
              }

            }
          }
        }
      }
      if(c.children!==undefined && c.children.length>0&&recursive)
        extract(recursive,unique,c,output,sheets,head);


      return output;
    });
    C.Def(function clear(recursive, unique,item, sheets) {
      var b=this.element;
      if(item instanceof Element) b=item;
      var obj=this.extract(recursive,unique,item);
      Object.keys(obj).forEach(function(shn) {
        var sh=obj[shn];
        Object.keys(sh).forEach(function(rn) {
          var r=sh[rn];
          if(r.parentStyleSheet!==null)
            r.parentStyleSheet.deleteRule(rn);
          //else

        });
      });
    });
    C.Def(function dump(prefix,recursive,unique) {
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
        this.Style( r);
      }
    });
    C.Def(function Style(q) {
      if(typeof q === 'string' || q instanceof String) {
        if(arguments[1])
          this.style[q]=arguments[1]
          return this.style[q]
      }
      if(q) {
        for (var key in q) {
          this.style[key]=q[key];
        };
      }
      else
        return this.style
        });
  });


  var StyleSheet=M.Class(function C() {
    C.Init(function StyleSheet(attr,doc,element) {
      if(!doc) this.doc=document;
      if(element!==undefined) {
        this.element=element;
      } else {
        this.element = this.doc.createElement("style");
      }
      if(attr!==undefined)
        for (var n in attr)
          this.element.setAttribute(n, attr[n]);
      this.element.appendChild(this.doc.createTextNode(""));
      this.doc.head.appendChild(this.element);
      this.sheets=this.doc.styleSheets;
      this.sheet=this.element;
    });
    C.Def("sheet",null);
    C.Def("classes",null);
    C.Def("font_types",{eot:'embedded-opentype',woff:'woff',ttf:'truetype',svg:'svg'});
    C.Def(function dump() {

    });
    C.Def(function addClass(name,rules) {

    });
    C.Def(function addFont(name,files) {
      var rules=["font-family:'",name,"'"];
      if(files.eot)
        rules.push("src:url('"+files.eot+"')");

      var srcs=[];
      for(var ft in files) {
        srcs.push("url('"+files[ft]+"') format('"+this.font_types[ft]+"')");
      }
      if(srcs.length>0) rules.push('src:'+srcs.join(','));
      return "@font_face {"+rules.join(';')+"}";
    });
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
