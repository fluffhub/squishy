Module(function M() {
  M.Import("squishy/basic","squishy/interactive","squishy/transform","apps/spoon",function(basic,interactive,transform,spoon) {
    Import("fluffy/views/default.css");



    var nodetypes={
      BlockStatement:{enter:function(node){
        var item=new basic.Div("B "+node.name);
        item.add(new basic.Span("","BD"));
        return item;
      },leave:function(n,p,c) {
        c.parent.insert(new basic.Span("",""  ),c);
        if(n.loc.end.line<=p.loc.end.line)
          c.addClass("ML");
        else {
          c.addClass("SL");
        }

      }},
      NewExpression:{enter:function(n,p,c) {
        var item=new basic.Span("","inits");
        return item;
      },leave:function(n,p,c) {
        n.callee.element.addClass("ids");
        if(n.arguments.length>1) {
          for(var i=0;i<n.arguments.length;i++) {
            n.arguments[i].element.add(new basic.Span(","));
          }
        }
      }},

      ExpressionStatement:{
        enter:function(node) {},
        leave:function(node,parent,cursor) {}
      },
      VariableDeclaration:{enter:function(node) {
        var item=new basic.Span("");
        item.addClass("V");
        return item;
      },leave:function(node,parent,cursor) {
        for (var i=0;i<node.declarations.length;i++) {
          var dec=node.declarations[i];
          dec.id.element.addClass("ids");
          if(dec.init!==null) {
            dec.init.element.remove();
            node.element.add(dec.init.element);
          } else {
            // stand-alone/undefined node, like var a;
            node.element.addClass("sa");
          }
        }
      }},
      ThisExpression:{
        enter:function(n,p,c) {},
        leave:function(n,p,c) {}
      },
      MemberExpression:{
        enter:function(n,p,c) {},
        leave:function(n,p,c) {}
      },
      ConditionalExpression:{
        enter:function(n,p,c) {},
        leave:function(n,p,c) {}
      },
      ThrowStatement:{
        enter:function(n,p,c) {
          return null;
        },
        leave:function(n,p,c) {
        }},
      TryStatement:{enter:function(n,p,c) {
        return null;
      },leave:function(n,p,c) {
      }},

      ForInStatement: {
        enter:function(n,p,c) {
        },
        leave:function(n,p,c) {
        }
      },
      WithStatement:{
        enter:function(n,p,c) {},
        leave:function(n,p,c) {}
      },
      CatchClause:{
        enter:function(n,p,c) {},
        leave:function(n,p,c) {}
      },
      Identifier:{
        enter:function(node,parent) {},
        leave:function(node,parent) {}
      },
      FunctionDeclaration:{
        enter:function(n,p,c) {},
        leave:function(n,p,c) {}
      },
      AssignmentExpression:{
        enter:function(n,p,c) {},
        leave:function(n,p,c) {}
      },
      UnaryExpression:{
        enter:function(n,p,c) {},
        leave:function(n,p,c) {}
      },
      FunctionExpression:{
        enter:function(n,p,c) {},
        leave:function(n,p,c) {}
      },
      UpdateExpression:{enter:function(n,p,c) {
      },leave:function(n,p,c) {
        if(n.operator) {
        }
      }},
      ReturnStatement:{enter:function(n,p,c) {
      },leave:function(n,p,c) {

      }},
      Literal:{enter:function(node,parent) {
      },leave:function(n,p,c) {

      }},
      VariableDeclarator:{enter:function(n,p) {
      },leave:function(n,p,c) {

      }},
      CallExpression:{enter:function(n,p) {
      },leave:function(n,p,cursor) {
      }},
      ForStatement:{enter:function(n,p) {
      },leave:function(n,p,c) {
      }},
      LogicalExpression:{enter:function(n,p) {
      },leave:function(n,p,c) {
      }},
      BinaryExpression:{enter:function(n,p) {
      },leave:function(n,p,c) {
      }},
      IfStatement:{enter:function(node,parent) {
      },leave:function(n,p,c) {
      }},
      Program:{
        enter:function(node,parent,c) {
          return new basic.Div("code");

        },leave:function(node,parent) {

        }
      },
      Property:{
        enter:function(node,parent,c) {},
        leave:function(n,p,c) {}
      },
      Unknown:{
        enter:function(node,parent) {
          return {}
        },leave:function(node,parent,cursor) {

        }},
      ObjectExpression:{
        enter:function(n,p,c) {},
        leave:function(n,p,c) {}
      },
    };

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
          return new basic.Div("InitStatement");
        },
        leave:function(n,p,c) {
          c.addClass("init");
          var name;
          c.clear();
          console.debug({"function":n})
          if(n.arguments&&n.arguments[0]) {

            if(n.arguments[0].id) {
              name=n.arguments[0].id.name;

              var p2=n;
              while(!codemasks.ClassStatement.match(p2)) {

                if(n.parent!==undefined)
                  p2=p2.parent;
                else throw new Exception("???");
              }
              console.debug({"codemask":p2});
              p2.name=name;
              p2.init=n;

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
          var args=node.arguments.map(function(a) {
            return a.value!==undefined?a.value:undefined;
          });

          if (nl<=2&&typeof node.arguments[0].value=="string") {
            args=node.arguments[0].value.split(" ");
          }
          var fun = node.arguments[nl-1];
          var browser=this;

          node.element.addClass("Import");
          node.callee.element.clear();
          node.callee.element.remove();


          node.arglist=new basic.Div("arglist");
          node.element.addBefore(node.arglist);
          node.element.addBefore(new basic.Span("Import","cmd"));
          node.arguments[nl-1].element.remove();
          if(fun.type=="Literal")
            node.element.add(new basic.Span(node.arguments[nl-1].value,"literal"));
          else {
            node.element.add(node.arguments[nl-1].body.element);
            for(var i=0;i<args.length;i++) {

              var arg=args[i];

              if( arg!==undefined&&i<node.arguments.length) {
                node.arguments[i].element.remove();

                var farg=fun.params[i];
                var listitem=new basic.Div("imports");
                var modlink=new basic.FakeLink("#?loc="+arg,arg,function click(e) {

                });
                listitem.add(modlink);
                if(fun&&fun.type=="FunctionExpression"&&fun.params) {
                  listitem.add(new basic.Span(" -> "+farg.name));
                }
                node.arglist.add(listitem);
                modlink.addClass("waiting");
                window.Import(arg,function(mod) {
                  //arg.element.clear();
                  //arg.element.content(" ");

                  modlink.onclick=function() {
                    console.debug(mod);
                  }
                  //  modlink.element.href="?page="+mod.filename;
                  listitem.addClass("enabled")
                  listitem.removeClass("waiting");



                  /*    if(fun&&fun.type=="FunctionExpression"&&fun.params) {
                  fun.params.forEach(function(farg) {
                    farg.element.clear();
                    farg.element.content(" ");
                    var funlink=new basic.Span(farg.name);
                    funlink.element.onclick=function(e) {
                      console.debug(mod);
                    }
                    funlink.addClass("module_link")
                    farg.element.add(funlink);
                  });
                }
                browser.browser.Import(arg.value);*/
                });
              }
            }
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
          var M=new basic.Div("Module");
          node.exports=new basic.Div("exports");
          var el = new basic.Div("Module");

          return  el;

        },
        leave:function(node,parent,cursor,state) {
          //node.element.addClass("module");
          //node.element.element.style["background-color"]="orange";
          //node.element.addBefore(new basic.Span("Module","cmd"));
          node.arguments[0].element.addClass("deffunction");
          //node.element.elements[0].remove();
          node.callee.element.addClass("cmd");
          //node.arguments[0].element.addBefore(new basic.Span("M","ids"));
          node.arguments[0].id.element.addClass("ids");
          var el=node.element;

          // while(el!==undefined&&el.parent!==undefined&&!el.hasClass("CodeBrowser")) {
          ////   el=el.parent;
          // }
          el.parent.add(node.exports);
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
          var el=new basic.Div("ClassDiv");
          return el;
        },
        leave:function(node,parent,cursor) {

          var code=new basic.Div("extended");
          if(node.arguments[0]) {
            if(node.arguments[0].body)
              node.arguments[0].body.element.remove();

            node.arguments[0].element.remove();
            node.arguments[0].element.elements.forEach(function(el) { el.remove() });
          }
          cursor.extended=code;
          code.add(node.arguments[0].body.element);
          code.addClass("hidden");
          if(node.arglist)
            node.arglist.remove();
          cursor.element.Tag.clear();

          var div=new interactive.MomentaryButton("","classname",function(e) {
            code.toggleClass("hidden");
          });
          if(typeof node.name=="string") {
            div.add(new basic.Span("Class","cmd"));
            div.add(new basic.Span(node.name,"ids"));

            div.add(new basic.Anchor(node.name));
            var arglist=new basic.Span("","arglist");
            div.add(arglist);
            node.init.arguments[0].params.forEach(function(arg) {
              arglist.add(new basic.Span(arg.name,"argument"));
            });
          } else {
            div.add(new basic.Span("Class","cmd"));
            div.add(new basic.Span("unnamed","ids italic"));
          }
          cursor.add(code);
          node.element.addBefore(div);
          node.element.Mixin(transform.Draggable);

          node.element.enabledrag(function ondrag(e) {
          });
          node.element.ondragstart= function(e) {
            spoon.main.Hold(node.element,e);
          }
          // node.element.addClass("cls");
          // node.element.elements.forEach(function(el) { el.remove() })
        }
      },
      DefStatement:{
        match:function(node) {
          return node.type=="CallExpression"&&
            node.callee.type=="MemberExpression"&&
            node.callee.property.name=="Def"

        },
        enter:function(n,p,c) {
          var ret= new basic.Div("Def");
          return ret;
        },
        leave:function(node,p,c) {
          //var dec=node.declarations[i];
          if(node.arguments[0].type=="literal") {
            node.arguments[0].addClass("ids def");
            node.arguments[0].content(node.arguments[0].value);
          }

        }
      },

    };

    M.Def("nodetypes",nodetypes);
    M.Def("codemasks",codemasks);


  });
});
