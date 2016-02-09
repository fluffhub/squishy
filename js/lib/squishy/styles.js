Module(function M() {
var Style=M.Class(function C() {
  C.Init(function Style(item,v){
    if(this instanceof Style) {
      this.style=item;
    }else{

      if(item.Style){
        if(v)
          item.Style.Style(v);
        else
          return item.Style;
      } else {
    if(item.element){
      if(item.element.style){
        item.Style=new Style(item.element.style);
        if(v) item.Style.Style(v);
        return item.Style;
      }
    }}
  }
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
        m=""+q[vs[v]];
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
        for (key in q) {
          this.style[key]=q[key];
        };
      }
      else
        return this.style
    });
});


var StyleSheet=M.Class(function C() {
  C.Init(  function StyleSheet(attr,doc) {
    if(!doc) this.doc=document;
    this.element = this.doc.createElement("style");
    if(attr)
      for (n in attr)
        this.element.setAttribute(n, attr[n]);
    this.element.appendChild(this.doc.createTextNode(""));
    this.doc.head.appendChild(style);
    this.sheets=this.doc.styleSheets;
    this.sheet=this.element;
  });

C.Mixin({
	sheet:null,
	classes:null,
	font_types:{eot:'embedded-opentype',woff:'woff',ttf:'truetype',svg:'svg'},
	addClass:function(name,rules) {

	},
	addFont:function(name,files) {
		var rules=["font-family:'",name,"'"];
		if(files.eot)
			rules.push("src:url('"+files.eot+"')");

		var srcs=[];
		for(ft in files) {
			srcs.push("url('"+files[ft]+"') format('"+this.font_types[ft]+"')");
		}
		if(srcs.length>0) rules.push('src:'+srcs.join(','));
		return "@font_face {"+rules.join(';')+"}";
	}
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
