Module(function M() {
  M.Import(
    "squishy/events",
    "squishy/basic",
    "squishy/interactive",
    "js/lib/esprima/esprima",
    "js/lib/escodegen/escodegen.squishy.js",
    "js/lib/estraverse/estraverse",
    "squishy/request",
    function(event,basic,interactive,esprima,ESCG,esv,Req) {
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
      var nodetypes={
        NewExpression:{enter:function(n,p,c) {
          var item=new basic.Span("new ","C");
          return item;
        },leave:function(n,p,c) {
          n.callee.element.add(new basic.Span("("));
          c.add(new basic.Span(")"));
          if(n.arguments.length>1) {
            for(var i=0;i<n.arguments.length;i++) {
              n.arguments[i].element.add(new basic.Span(","));
            }
          }
        }},
        BlockStatement:{enter:function(node){
          var item=new basic.Div("B "+node.name);
          item.add(new basic.Span("","BD"));
          return item;
        },leave:function(n,p,c) {
          c.parent.insert(new basic.Span("{"),c);
          if(n.loc.end.line<=p.loc.end.line)
            c.parent.add(new basic.Span("}"));
          else
            c.add(new basic.Span("}","BD"));
        }},
        ExpressionStatement:{enter:function(node) {
          return new basic.Div("E");
        },leave:function(node,parent,cursor) {
          cursor.add(new basic.Span(";","EC"));
        }},
        VariableDeclaration:{enter:function(node) {
          var item=new basic.Span("");
          item.addClass("V");
          item.add(new basic.Span("var "));
          return item;
        },leave:function(node,parent,cursor) {

        }},
        ThisExpression:{enter:function(n,p,c) {
          return new basic.Span("this");
        },leave:function(n,p,c) {

        }},
        MemberExpression:{enter:function(n,p,c) {
          return new basic.Span("","M");
        },leave:function(n,p,c) {
          //var L=c.elements.length;
          if(n.property.type=="Literal") {
            c.insert(new basic.Span("["),n.property.element)
            n.property.element.addBefore(new basic.Span("["));
            n.property.element.add(new basic.Span("]"));
          }else {
            n.property.element.addBefore(new basic.Span( ".","DL"));
          }
        }},
        Identifier:{enter:function(node,parent) {
          var item=new basic.Span(node.name,"I");
          if(node.name&&node.name!="") { item.content(node.name) }
          else { item.content("Unnamed"); }
          return item;
        },leave:function(node,parent) {
        }},
        FunctionDeclaration:{enter:function(n,p,c) {
          var item=new basic.Div("F")
          item.add(new basic.Span("function ","F"));
          return item;
        },leave:function(n,p,c) {
          n.params[n.params.length-1].element.add(new basic.Span(")"));
          c.add(new basic.Span("{"));
          c.add(new basic.Span("}"));
        }},
        AssignmentExpression:{enter:function(n,p,c) {
          return new basic.Span("","A");
        },leave:function(n,p,c) {
          n.right.element.addBefore(new basic.Span(" = "));
        }},
        FunctionExpression:{enter:function(n,p,c) {
          return new basic.Span("","");
        },leave:function(n,p,c) {
          n.element.addBefore(new basic.Span("function "));
          var parampos=0;
          if(n.id!==null) parampos=1;
          if(n.params&&n.params.length>0) {
            for(var i=n.params.length-1;i>0;i--) {
              n.params[i].element.addBefore(new basic.Span(","));
            }
          }
          if(n.params.length>=1) {
            n.params[0].element.addBefore(new basic.Span("("));
            n.params[n.params.length-1].element.add(new basic.Span(")"));
          }
          else {
            c.add(new basic.Span("() "));
          }

        }},
        UpdateExpression:{enter:function(n,p,c) {
          return new basic.Span("","OP");
        },leave:function(n,p,c) {
          if(n.operator) {
            n.argument.element.add(new basic.Span(n.operator));
          }
        }},
        ReturnStatement:{enter:function(n,p,c) {
          return new basic.Span("return ");
        },leave:function(n,p,c) {

        }},
        Literal:{enter:function(node,parent) {
          var str=node.value;
          if(typeof(str)=="string") str="\""+str+"\"";
          return new basic.Span(""+str,"literal");
        },leave:function(n,p,c) {

        }},
        VariableDeclarator:{enter:function(n,p) {
          return new basic.Span("");
        },leave:function(n,p,c) {
          if(n.init!=null)
            n.init.element.addBefore(new basic.Span(" = "));
        }},
        CallExpression:{enter:function(n,p) {
          var item=new basic.Span("","EX");

          return item;
        },leave:function(n,p,cursor) {
          cursor.elements[0].add(new basic.Span("("));
          cursor.add(new basic.Span(")"));
          if(n.arguments.length>1) {
            for(var i=0;i<n.arguments.length-1;i++) {
              n.arguments[i].element.add(new basic.Span(","));
            }
          }
        }},
        ForStatement:{enter:function(n,p) {
          return new basic.Span("for ","FL");
        },leave:function(n,p,c) {

        }},
        LogicalExpression:{enter:function(n,p) {
          return new basic.Span("","OP");
        },leave:function(n,p,c) {
          if(n.operator) {
            n.left.element.add(new basic.Span(n.operator));
          }
        }},
        BinaryExpression:{enter:function(n,p) {
          return new basic.Span("","OP");
        },leave:function(n,p,c) {
          if(n.operator) {
            n.left.element.add(new basic.Span(n.operator));
          }
        }},
        IfStatement:{enter:function(node,parent) {
          var item=new basic.Div();
          item.add(new basic.Span("if("));

          return item;
        },leave:function(n,p,c) {
          //n.consequent.element.parent.insert(new basic.Span(")"),n.consequent.element);
          if(n.test)
            n.test.element.add(new basic.Span(")"));
          //c.elements[c.elements.length-1].add(new basic.Span(")"));
        }},
        Program:{enter:function(node,parent,c) {
          return new basic.Div("code");

        },leave:function(node,parent) {

        }},
        Property:{enter:function(node,parent,c) {
          return new basic.Span("","");
        },leave:function(n,p,c) {
          n.key.element.add(new basic.Span(":"));
          //   c.elements[2].add(new basic.Span(","));
        }},
        Unknown:{enter:function(node,parent) {
          var item=new basic.Span("[","unknown "+node.type);
          return item;
        },leave:function(node,parent,cursor) {
          cursor.add(new basic.Span("]"));

        }},
        ObjectExpression:{enter:function(n,p,c) {
          return new basic.Span("{");
        },leave:function(n,p,c) {
          c.add(new basic.Span("}"));
          if(n.properties&&n.properties.length>1) {
            for(var i=n.properties.length-1;i>0;i--) {
              n.element.insert(new basic.Span(","),n.properties[i].element);
            }
          }
        }},
      };
      var curstate={}
      var codemasks={
        InitStatement:{
          match:function(node) {
            if(node.type=="CallExpression") {
              if(node.callee.type=="MemberExpression") {
                if(node.callee.property.name=="Init") {
                  return true;
                }
              }
            }
          },
          enter:function(n,p,c) {

          },
          leave:function(n,p,c) {
            c.addClass("init");
            var name;
            if(n.params&&n.params[0]) {
              if(n.params[0].id) {
                c.add(new basic.Anchor(n.params[0].id));
              }
            }
          }
        },
        ImportStatement:{
          match:function(node) {
            if(node.type=="CallExpression") {
              if(node.callee.type=="MemberExpression") {
                if(node.callee.property.name=="Import") {
                  return true
                }
              } else {
                if(node.callee.type=="Identifier") {
                  if(node.callee.name=="Import") {
                    return true;
                  }
                }
              }
            }
            return false;
          },
          enter:function(node,parent,cursor,state) {},
          leave:function(node,parent,cursor,state) {
            var nl=node.arguments.length;
            var fun = node.arguments[nl-1];
            var browser=this;
            for(var i=0;i<nl-1;i++) {
              var arg=node.arguments[i];
              var farg=fun.params[i];
              window.Import(arg.value,function(mod) {
                arg.element.clear();
                arg.element.content(" ");
                var modlink=new basic.FakeLink("?page="+mod.filename,"\""+arg.value+"\"",function click(e) {

                });
                //  modlink.element.href="?page="+mod.filename;
                modlink.element.style.color="orange";
                arg.element.add(modlink);

                if(fun&&fun.type=="FunctionExpression"&&fun.params) {
                  fun.params.forEach(function(farg) {
                    farg.element.clear();
                    farg.element.content(" ");
                    var funlink=new basic.Span(farg.name);
                    funlink.element.onclick=function(e) {
                      console.debug(mod);
                    }
                    funlink.element.style.color="orange";
                    farg.element.add(funlink);
                  });
                }
                browser.browser.Import(arg.value);
              });
            }
          }
        },
        ModuleStatement:{
          match:function(node) {
            if(node.type=="CallExpression") {
              if(node.callee.type=="Identifier") {
                if(node.callee.name=="Module") {
                  return true;
                }
              }
            }
          },
          enter:function(node,parent,cursor,state) {
            state.Module=node
          },
          leave:function(node,parent,cursor,state) {
            node.element.element.style["background-color"]="orange";

          }
        },
        ClassStatement:{
          match:function(node) {
            if(node.type=="CallExpression") {
              if(node.callee.type=="Identifier") {
                if(node.callee.name=="Class") {
                  return true;
                }
              } else {
                if(node.callee.type=="MemberExpression") {
                  if(node.callee.property.name=="Class") {
                    return true;
                  }
                }
              }
            }
          },
          enter:function(node,parent,cursor) {

          },
          leave:function(node,parent,cursor) {

            node.element.addClass("cls");
          }
        },
        DefStatement:{
          match:function(node) {
            return node.type=="CallExpression"&&node.callee.type=="MemberExpression"&&node.callee.property.name=="Def"

          },
          enter:function(n,p,c) {
            var ret= new basic.Div("Def");
            return ret;
          },
          leave:function(n,p,c) {
            c.element.style["color"]="green";
          }
        },

      };

      M.Def("nodeformats",nodetypes);
      var escodegen=ESCG.escodegen;
      window.escodegen=escodegen;
      var estraverse=esv;
      var globalstate={};
      M.Class(function C() {
        C.Super(basic.Div);
        C.Init(function FileBrowser()  {
          basic.Div.call(this,"FileBrowser");
          this.files={};
          this.absolutefiles={};
          this.rawfiles={};
          this.windows={};
        });
        C.Def(function load(path,item) {
          var browser=this;

          browser.absolutefiles[path]=item;
          new Request("URI","TEXT").Get(item.filename,{},function(raw) {
            browser.windows[path]=new M.Self.CodeBrowser(raw,browser);
            browser.windows[path].addBefore(new basic.Span(path));
            browser.parent.add(browser.windows[path]);
          });
        });
        C.Def(function Import(path1) {
          var item;
          var browser=this;
          var cursor=this;
          window.Import(path1,function(item) {
            var path=item.filename;
            var paths=path.split('/');
            var start=0;
            if(paths[0]=="") start=1;

            var filelink=new basic.FakeLink("?page="+path,paths[paths.length-1],function() {
              for(var windowid in browser.windows) {
                browser.windows[windowid].hide();
              }
              if(browser.windows[path]) {
                browser.windows[path].show();
              } else {
                browser.load(path,item);
              }
            });
            for(var i=start;i<paths.length;i++) {
              var file;
              if(paths[i] in cursor.files) {
                file=cursor.files[paths[i]];
              }
              else {
                file=new basic.Div();

                if(paths.length-i==1) {
                  file.addClass("file");
                  cursor.add(filelink);
                } else {
                  file.addClass("dir");
                  var label=new basic.Div("label");
                  label.attrs({id:paths[i]});
                  file.add(label);
                  label.content(paths[i]+"\\");
                  file.files={};
                }
                cursor.files[paths[i]]=file
                cursor.add(file);
              }
              cursor=file;
              /* now iterate the enumerable members of item! */
              var cursize=1;
              cursor.add((function travel(item) {
                var items=Object.keys(item);
                if(items.length>0) cursor.addClass("module");
                for(var j=0;j<items.length;j++) {
                  var key=items[j];
                  var c=new basic.Span(key);
                  c.addClass("member");
                  c.element.style["font-size"]=cursize+"em";
                  cursize=cursize*0.9;
                  var member=item[items[j]];
                  if(member instanceof Object) {
                  var submembers=Object.keys(member);
                  if(cursize>0.2) {
                  if(submembers.length>0) {
                    c.add(travel(member));
                  }
                  }
                  }
                  return c;
                }
              })(item))
            }
            if(browser.windows.length==1) browser.load(path,item);
          });
        });
      });
      M.Class(function C() {
        C.Super(basic.Div);
        C.Init(function CodeBrowser(raw,browser) {
          basic.Div.call(this,"CodeBrowser");
          var parsed=esprima.parse(raw,{comment:true,attachComment:true,range:true,loc:true,tokens:true});
          var comments=parsed.comments;
          var code=escodegen.generate(parsed);
          var lines = code.split("\n");
          this.browser=browser;
          console.debug({lines:lines, comments:comments, parsed:parsed});
          var Comments=new basic.Div("comments");
          var withcomments=escodegen.attachComments(parsed,comments, parsed.tokens);

          var code2=escodegen.generate(withcomments);
          this.add(Comments);
          console.debug({code2:code2,withcomments:withcomments});
          var depth=0;
          var Lines=new basic.Div("code");
          this.add(Lines);
          this.state={};
          this.maskcursors=[];
          var filestate={};

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

        C.Def(function leaveNode(node,parent) {
          this.depth--;
          var depth=this.depth;
          var cursor=this.cursor;
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
          item.addEvent("select","click",function(e) {
            console.debug(node);
             // e.stopPropagation();
          });

          item.addEvent("hidetip","mouseout",function(e) {
            tooltip.hide();
            item.removeClass("hovering");
            //item.element.style["background-color"]="rgba(180,180,180,0.25)";
            item.element.style["border-color"]=""+"rgba(250,250,250,0.25)";
            e.stopPropagation();
          });
          item.enableEvents();
          if(parent&&parent.loc.start.line!=node.loc.start.line) {
            item.addClass("clears");
          }
          this.cursor=cursor.parent;
        });

        C.Def(function enterNode(node,parent) {
          this.depth++;
          var depth=this.depth;
          var maskcursors=this.maskcursors;
          var cursor=this.cursor;
          var item;

          if(node.leadingComments&&node.type!="Program") {
            var comments=new basic.Div("Comments");
            comments.element.style["margin-left"]=(-1)+"em";
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

          if(nodetypes[node.type]) {
            item=nodetypes[node.type].enter.call(this,node,parent,cursor,this.state);
          } else {
            item=nodetypes["Unknown"].enter.call(this,node,parent,cursor,this.state);
          }

          if(item) {
            item.node=node;
            node.element=item;
            cursor.add(item);
            item.element.style["z-index"]=10000+depth;
            //cursor.add(item);
            this.cursor=item;
          }
          for(var maskname in codemasks) {
            var mask=codemasks[maskname];
            if(mask.match(node)) {
              var newnode=mask.enter.call(this,node,parent,cursor,this.state);
              if(newnode&&newnode!==true) {
                node.element.remove()
                newnode.add(node.element);
                cursor.add(newnode);
              }
              maskcursors.push({mask:mask,node:node});
            }
          }
        });
      });
    });
});




