Module(function M() {
  M.Import(
    "squishy/events",
    "squishy/basic",
    "squishy/interactive",
    "lib/esprima/esprima",
    "lib/escodegen/escodegen.squishy.js",
    "lib/estraverse/estraverse",
    "squishy/request",

    function(event,basic,interactive,esprima,ESCG,esv,Req,Spoon) {
      var Request=Req.Request;

      function PseudoRandomColor(n,a) {
        var P=Math.PI;
        var r=Math.round(128+255*Math.sin((n*P/7)+(2*P/3))/2);
        var g=Math.round(128+255*Math.sin((n*P/7)+(4*P/3))/2);
        var b=Math.round(128+255*Math.sin((n*P/7)+(2*P))/2);
        if(a!==undefined) { a = Math.round(a*100)/100 }
        else a=1;
        return "rgba("+r+","+g+","+b+","+a+")";
      }
      var curstate={}
      var escodegen=ESCG.escodegen;
      window.escodegen=escodegen;
      var estraverse=esv;
      Import("fluffy/themes/","fluffy/themes/default",function(themes,defaulttheme) {


        M.Class(function C() {
          C.Super(basic.Div);
          C.Init(function JSEditor(raw,browser,theme) {

            basic.Div.call(this,"CodeBrowser");
            var parsed=esprima.parse(raw,{comment:true,attachComment:true,range:true,loc:true,tokens:true});
            var comments=parsed.comments;
            var code=escodegen.generate(parsed);
            var lines = code.split("\n");
            this.curline=0;
            this.curcol=0;
            this.browser=browser;
            var lastnode=this.lastnode=null;
            console.debug({lines:lines, comments:comments, parsed:parsed});
            var Comments=new basic.Div("comments");
            var withcomments=escodegen.attachComments(parsed,comments, parsed.tokens);

            var code2=escodegen.generate(withcomments);
            this.add(Comments);
            console.debug({code2:code2,withcomments:withcomments});
            var depth=0;
            var Lines=new basic.Div("code");
            var Cursor=new basic.Div("cursor");
            this.Cursor=Cursor;
            this.add(Lines);
            this.state={};
            this.maskcursors=[];
            var filestate={};
            if(theme!==undefined) this.setTheme(theme);
            else this.setTheme(defaulttheme);
            this.cursor=this;
            var browser=this;
            estraverse.traverse(parsed,{
              enter:function(n,p) {
                browser.enterNode(n,p);
              },
              leave:function(n,p) {
                browser.leaveNode(n,p);
              }
            });
          });
          C.Def(function setTheme(obj) {
            var br=this;
            if (obj instanceof Module) {
              if(obj.nodetypes instanceof Object) {
                this.nodetypes=obj.nodetypes;
                if(obj.codemasks instanceof Object) {
                  this.codemasks=obj.codemasks;
                }
              }
            } else if (typeof ( obj) =="string") {
              Import("fluffy/themes/"+obj,function(theme2) {
                br.setTheme(theme2);
              });
            }
          })
          C.Def(function summary(node,parent) {
            var cursor=this;
            function travel(item2,depth) {
              if(depth>0) {
                var items=Object.keys(item2);
                if(items.length>0) cursor.addClass("module");
                console.debug(items);

                for(var j=0;j<items.length;j++) {

                  var key=items[j];

                  var existing=cursor.query("div[data-key=\""+key+"\"]");
                  var c;
                  if(existing.length>0) { c=existing[0]; }
                  // if(key!="supers") {//
                  else  {
                    c=new basic.Link({url:"#"+key,content:key});
                    //  for(var j=0;j<filedepth;j++) {
                    //    c.add(new basic.Span("","branch1"));
                    // }
                    c.onclick=function() {
                      // browser.change(path,item)
                    };
                    c.attrs({"data-key":key});
                    c.addClass("member");
                    var cursize=1-(depth*0.125);
                    c.element.style["font-size"]=cursize+"em";
                    cursor.add(c);
                  }



                  var member=item2[items[j]];
                  if(member.funcall)
                  {
                    var linenumber=new basic.Span(":"+member.funcall.getLineNumber()+":"+member.funcall.getColumnNumber());
                    c.add(linenumber);
                    linenumber.element.style["font-size"]="0.5em";
                  }
                  if(member instanceof Object) {

                    var submembers=Object.keys(member);

                    if(submembers.length>0) {

                      if(c.parent) cursor=c;
                      c.add(travel(member,depth-1));
                      if(c.parent) cursor=c.parent;
                    }
                    //  }
                  }

                }

              }
            }
            travel(this,1);

            //  cursor=modulewrapper.parent;
          });
          C.Def(function leaveNode(node,parent) {
            this.depth--;
            var depth=this.depth;
            var nodetypes=this.nodetypes;
            var cursor=this.cursor;
            var Cursor=this.Cursor;
            var maskcursors=this.maskcursors;
            for(var i=0;i<maskcursors.length;i++) {
              if(maskcursors[i].node===node) maskcursors[i].mask.leave.call(this,node,parent,cursor,this.state);
            }
            //if(maskcursor) { maskcursor.leave.call(this,node,parent,cursor); maskcursor=null }
            if(nodetypes[node.type]&&nodetypes[node.type].leave)
              nodetypes[node.type].leave.call(this,node,parent,cursor);
            else
              nodetypes["Unknown"].leave.call(this,node,parent,cursor);
            var item=cursor;
            item.Mixin(event.hasEvents);
            /*
            var tooltip=new basic.Div("label");
            tooltip.element.style["z-index"]=10000+depth+1;
            tooltip.content(depth+" / "+node.type);
            item.add(tooltip);
            item.tooltip=tooltip;
            tooltip.hide();

            var d=this.depth+0;
            item.addEvent("showtip","mouseover",function(e) {
              tooltip.show();
              item.addClass("hovering");
              item.element.style["border-color"]=""+PseudoRandomColor(d,0.5);
              e.stopPropagation();
            });
            item.addEvent("hidetip","mouseout",function(e) {
              tooltip.hide();
              item.removeClass("hovering");
              //item.element.style["background-color"]="rgba(180,180,180,0.25)";
              item.element.style["border-color"]=""+"rgba(250,250,250,0.25)";
              e.stopPropagation();
            });
            */
            item.addEvent("select","click",function(e) {
              console.debug(node);
              // e.stopPropagation();
            });
            var hovering=false;
            item.addEvent("cursorin","mouseover touchstart",function(e) {
              if(!hovering) {
                item.addClass("hovering");

                //e.stopPropagation();
                Cursor.remove();
                Cursor.placeBefore(item);
                hovering=true;
              }
            });
            item.addEvent("cursorout","mouseout",function(e) {
             hovering=false;
              item.removeClass("hovering");
            });
            item.addEvent("selectstart","mousedown touchend",function(e) {

              item.removeClass("hovering");
              //item.element.style["background-color"]="rgba(180,180,180,0.25)";
             // item.element.style["border-color"]=""+"rgba(250,250,250,0.25)";
              // e.stopPropagation();
            });


            item.enableEvents();
            if(parent&&((parent.loc.start.line!=node.loc.start.line))) {
              item.addClass("clears");
            }
            this.cursor=cursor.parent;
            curline=node.loc.end.line;

          });

          C.Def(function enterNode(node,parent) {
            this.depth++;
            var depth=this.depth;
            var maskcursors=this.maskcursors;
            var cursor=this.cursor;
            var item;
            var codemasks=this.codemasks;
            var nodetypes=this.nodetypes;
            Object.defineProperty(this,"parent",{editable:true,enumerable:false})
            node.parent=this.lastnode;
            this.lastnode=node;
            if(node.leadingComments&&node.type!="Program") {
              var comments=new basic.Div("Comments");
              cursor.add(comments);
              var comment=node.leadingComments[0];
              comments.addClass(comment.type);

              var content=comment.value.split("\n");
              content.forEach(function(line) {
                var ln=new basic.Div();
                ln.content(line);
                comments.add(ln);
              });
            }
            var maskapplied=false;
            for(var maskname in codemasks) {
              var mask=codemasks[maskname];
              if(mask.match(node)) {
                var newnode=mask.enter.call(this,node,parent,cursor,this.state);
                if(newnode&&newnode!==true) {
                  // node.element.remove();
                  // newnode.add(node.element);
                  if(newnode.element instanceof Element) {
                    cursor.add(newnode);
                    maskapplied=true;
                    this.cursor=newnode;
                    node.element=newnode;
                  }
                }
                maskcursors.push({mask:mask,node:node});
              }
            }
            if(!maskapplied) {
              if(nodetypes[node.type]) {
                item=nodetypes[node.type].enter.call(this,node,parent,cursor,this.state);
              } else {
                item=nodetypes["Unknown"].enter.call(this,node,parent,cursor,this.state);
              }

              if(item.element instanceof Element) {
                item.node=node;
                node.element=item;
                cursor.add(item);
                item.element.style["z-index"]=10000+depth;
                //cursor.add(item);
                this.cursor=item;
              }
            }

          });
        });

      });
    });

});
