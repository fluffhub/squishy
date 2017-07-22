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
        item.add(new basic.Span("","F"));
        return item;
      },leave:function(n,p,c) {
       //// if(n.params.length>0)
       //   n.params[n.params.length-1].element.add(new basic.Span(")"));

      }},
      AssignmentExpression:{enter:function(n,p,c) {
        return new basic.Span("","A");
      },leave:function(n,p,c) {
        n.right.element.addBefore(new basic.Span(" = "));
      }},
      FunctionExpression:{enter:function(n,p,c) {
        return new basic.Span("","");
      },leave:function(n,p,c) {
        n.element.addBefore(new basic.Span("F ","ids"));
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
          var fun = node.arguments[nl-1];
          var browser=this;
          node.element.addClass("Import");
          for(var i=0;i<nl-1;i++) {
            var arg=node.arguments[i];
            var farg=fun.params[i];

            window.Import(arg.value,function(mod) {
              arg.element.clear();
              arg.element.content(" ");
              var modlink=new basic.FakeLink("?page="+mod.filename,"\""+arg.value+"\"",function click(e) {

              });
              //  modlink.element.href="?page="+mod.filename;
              modlink.addClass("module_link")
              arg.element.add(modlink);

              if(fun&&fun.type=="FunctionExpression"&&fun.params) {
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
          return new basic.Div("Module");
        },
        leave:function(node,parent,cursor,state) {
          //node.element.addClass("module");
          //node.element.element.style["background-color"]="orange";
          node.arguments[0].element.addClass("deffunction");

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
          //node.element.elements.forEach(function(el) { el.remove() });
         var code=new basic.Div("extended");
          node.element.elements.forEach(function(el) { el.remove();code.add(el); });
           cursor.extended=code;

          var div=new basic.Div("classname");
          if(typeof node.name=="string") {
            div.content("Class "+node.name);
          } else {
            div.content("Unnamed Class");
          }
          node.element.add(div);
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
          c.element.style["color"]="green";
        }
      },

    };

    M.Def("nodetypes",nodetypes);
    M.Def("codemasks",codemasks);


  });
});
