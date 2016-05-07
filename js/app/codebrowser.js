Module(function M() {
  M.Import(
           "squishy/events",
           "squishy/basic",
           "js/lib/esprima/esprima",
           "js/lib/escodegen/escodegen.squishy.js",
           "js/lib/estraverse/estraverse",
           function(event,basic,esprima,ESCG,esv) {
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
                 c.elements[1].add(new basic.Span("("));
                 c.add(new basic.Span(")"));
                  if(n.arguments.length>1) {
                   for(var i=3;i<c.elements.length-3;i+=2) {
                    c.elements[i].add(new basic.Span(","));
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
                 var item=new basic.Div("V");
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
                   var L=c.elements.length;
                 if(n.property.type=="Literal") {
                   c.elements[2].addBefore(new basic.Span("["));
                   c.elements[2].add(new basic.Span("]"));
                 }else {
                   c.elements[2].addBefore(new basic.Span(".","DL"));
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
                 c.elements[1].add(new basic.Span(")"));
                 c.elements[2].add(new basic.Span("{"));
                 c.add(new basic.Span("}"));
               }},
               AssignmentExpression:{enter:function(n,p,c) {
                 return new basic.Span("","A");
               },leave:function(n,p,c) {
                 c.elements[2].addBefore(new basic.Span(" = "));
               }},
               FunctionExpression:{enter:function(n,p,c) {
                 return new basic.Span("","");
               },leave:function(n,p,c) {
                 c.addBefore(new basic.Span("function "));
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
                   c.elements[parampos].add(new basic.Span("() "));
                 }

               }},
               UpdateExpression:{enter:function(n,p,c) {
                 return new basic.Span("","OP");
               },leave:function(n,p,c) {
                   if(n.operator) {
                   c.elements[1].add(new basic.Span(n.operator));
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
                 c.elements[1].add(new basic.Span(" = "));
               }},
               CallExpression:{enter:function(n,p) {
                 var item=new basic.Span("","EX");

                 return item;
               },leave:function(n,p,cursor) {
                 cursor.elements[0].add(new basic.Span("("));
                 cursor.add(new basic.Span(")"));
                 if(n.arguments.length>1) {
                   for(var i=3;i<cursor.elements.length-3;i+=2) {
                    cursor.elements[i].add(new basic.Span(","));
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
                   c.elements[2].addBefore(new basic.Span(n.operator));
                 }
               }},
               BinaryExpression:{enter:function(n,p) {
                 return new basic.Span("","OP");
               },leave:function(n,p,c) {
                 if(n.operator) {
                   c.elements[2].addBefore(new basic.Span(n.operator));
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
                 return new basic.Div("eeprogram");

               },leave:function(node,parent) {

               }},
               Property:{enter:function(node,parent,c) {
                 return new basic.Span("","");
               },leave:function(n,p,c) {
                 c.elements[1].add(new basic.Span(":"));
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
             var codemasks={
               ImportStatement:{
                 match:function(node) {},
                 enter:function(node,parent,cursor) {},
                 leave:function(node,parent,cursor) {}
               }
             };


             M.Def("nodeformats",nodetypes);


             var escodegen=ESCG.escodegen;
             window.escodegen=escodegen;
             var estraverse=esv;
             M.Def("draw",function(samplepage) {
               var parsed=esprima.parse(samplepage,{comment:true,attachComment:true,range:true,loc:true,tokens:true});
               var comments=parsed.comments;
               var code=escodegen.generate(parsed);
               var lines = code.split("\n");
               var Content = new basic.Div("content");
               console.debug({lines:lines, comments:comments, parsed:parsed});
               var Comments=new basic.Div("comments");
               var withcomments=escodegen.attachComments(parsed,comments, parsed.tokens);

               var code2=escodegen.generate(withcomments);
               Content.add(Comments);
               console.debug({code2:code2,withcomments:withcomments});
               var depth=0;
               var Lines=new basic.Div("code");
               Content.add(Lines);

               console.debug({estraverse:estraverse});




               var cursor=Lines;
               estraverse.traverse(parsed,{
                 enter:function(node,parent) {
                   depth++;
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
                     item=nodetypes[node.type].enter.call(this,node,parent,cursor);
                   } else {
                     item=nodetypes["Unknown"].enter.call(this,node,parent,cursor);
                   }
                   if(item) {
                     item.node=node;
                     node.element=item;
                     cursor.add(item);
                     item.element.style["z-index"]=10000+depth;
                     cursor.add(item);
                     cursor=item;
                   }
                 },

                 leave:function(node,parent) {
                   depth--;
                   if(nodetypes[node.type]&&nodetypes[node.type].leave)
                     nodetypes[node.type].leave(node,parent,cursor);
                   else
                     nodetypes["Unknown"].leave(node,parent,cursor);
                   var item=cursor;
                   item.Mixin(event.hasEvents);
                   var tooltip=new basic.Div("label");
                   tooltip.element.style["z-index"]=10000+depth+1;
                   tooltip.content(depth+" / "+node.type);
                   item.add(tooltip);
                   item.tooltip=tooltip;
                   tooltip.hide();

                   var d=depth+0;
                   item.addEvent("showtip","mouseover",function(e) {
                     tooltip.show();
                     item.addClass("hovering");
                     item.element.style["border-color"]=""+PseudoRandomColor(d,0.5);
                   });
                   item.addEvent("select","click",function(e) {
                     console.debug(node);

                     //  e.stopPropagation();
                   });

                   item.addEvent("hidetip","mouseout",function(e) {
                     tooltip.hide();
                     item.removeClass("hovering");
                      //item.element.style["background-color"]="rgba(180,180,180,0.25)";

                      item.element.style["border-color"]=""+"rgba(250,250,250,0.25)";
                   });
                   item.enableEvents();
                   if(parent&&parent.loc.start.line!=node.loc.start.line) {
                     item.addClass("clears");
                   }
                   cursor=cursor.parent;
                 }
               });
               return Content;
             });
           });
});
