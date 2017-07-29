Module(function M() {
  M.Import("squishy/basic","squishy/interactive",function(basic,interactive) {
    Import("fluffy/themes/default.css");
    var nodetypes={
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
      ExpressionStatement:{enter:function(node) {
        return new basic.Div("E");
      },leave:function(node,parent,cursor) {
        // cursor.add(new basic.Span(";","EC"));
      }},
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
      ConditionalExpression:{
        enter:function(n,p,c) {
          return new basic.Span("","Cond");
        },
        leave:function(n,p,c) {
          console.debug({conditional:n});
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
        item.add(new basic.Span("function","ops"));
        return item;
      },leave:function(n,p,c) {
        //// if(n.params.length>0)
        //   n.params[n.params.length-1].element.add(new basic.Span(")"));
        if(n.params.length>=1)n.params[0].element.addClass("ids");
        if(n.id!==null) n.id.element.addClass("ids");
      }},
      AssignmentExpression:{enter:function(n,p,c) {
        return new basic.Span("","A");
      },leave:function(n,p,c) {

        //   n.right.element.addBefore(new basic.Span(" = "));
      }},
      UnaryExpression:{enter:function(n,p,c) {
        return new basic.Span("","UE");
      },leave:function(n,p,c) {

      }},
      FunctionExpression:{enter:function(n,p,c) {
        return new basic.Span("","");
      },leave:function(n,p,c) {
        n.element.addBefore(new basic.Span("function","ops"));
        var parampos=0;
        if(n.id!==null) parampos=1;
        if(n.params&&n.params.length>0) {
          for(var i=n.params.length-1;i>0;i--) {
            n.params[i].element.addClass("param");
            //   n.params[i].element.addBefore(new basic.Span(","));
          }
        }
        if(n.params.length>=1) {
          //n.params[0].element.addBefore(new basic.Span("("));
          // n.params[n.params.length-1].element.add(new basic.Span(")"));
        }
        else {
          // c.add(new basic.Span("() "));
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
        return new basic.Span("","ReturnStatement");
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
        //  if(n.init!=null)
        //    n.init.element.addBefore(new basic.Span(" = "));

      }},
      CallExpression:{enter:function(n,p) {
        var item=new basic.Span("","EX");

        return item;
      },leave:function(n,p,cursor) {
        //cursor.elements[0].add(new basic.Span("("));
        //cursor.add(new basic.Span(")"));

        n.callee.element.addClass("callee");
        var args=new basic.Span("","arglist");
        n.arglist=args;
        n.callee
        if(n.arguments.length>=1) {
          for(var i=0;i<n.arguments.length;i++) {
            if(n.arguments[i].element.element instanceof Element) {
              n.arguments[i].element.addClass("argument");
              n.arguments[i].element.remove();
              args.add(n.arguments[i].element);

            }
            //n.arguments[i].element.add(new basic.Span(","));
          }
        }
        n.element.add(args);
       // var lb=new basic.Span("","code-brace left");
       // var rb=new basic.Span("","code-brace right");
       // lb.placeBefore(args.element);
       // rb.placeAfter(args.element);
      }},
      ForStatement:{enter:function(n,p) {
        return new basic.Span("","ops");
      },leave:function(n,p,c) {
        n.element.addBefore(new basic.Span("for","ids"));
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

        return item;
      },leave:function(n,p,c) {
        n.element.addBefore(new basic.Span("if","ops"));

        //n.consequent.element.parent.insert(new basic.Span(")"),n.consequent.element);
        if(n.test)
          n.test.element.addClass("arglist");
        if(n.alternate)
          n.alternate.element.addBefore(new basic.Span("else","ops"));
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
        var item=new basic.Span("","unknown "+node.type);
        return item;
      },leave:function(node,parent,cursor) {
        //  cursor.add(new basic.Span("]"));

      }},
      ObjectExpression:{enter:function(n,p,c) {
        return new basic.Span("","obj");
      },leave:function(n,p,c) {

        if(n.properties&&n.properties.length>1) {
          for(var i=n.properties.length-1;i>0;i--) {
            n.properties[i].element.addClass("prop");
          }
        }
      }},
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
              c.add(new basic.Anchor(name));
              c.add(new basic.Span(name,"classname"));

              var p2=n;
              while(!codemasks.ClassStatement.match(p2)) {

                if(n.parent!==undefined)
                  p2=p2.parent;
                else throw new Exception("???");
              }
              console.debug({"codemask":p2});
              p2.name=name;

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
          return new basic.Div("Module");
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
          return new basic.Div("ClassDiv");


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

          } else {
            div.add(new basic.Span("Class","cmd"));
            div.add(new basic.Span("unnamed","ids italic"));
          }
          cursor.add(code);
          node.element.addBefore(div);

          // node.element.addClass("cls");
          // node.element.elements.forEach(function(el) { el.remove() })
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

        }
      },

    };

    M.Def("nodetypes",nodetypes);
    M.Def("codemasks",codemasks);


  });
});
