Module(function M() {
  M.Import(
           "squishy/events",
           "squishy/basic",
           "js/lib/esprima/esprima",
           "js/lib/escodegen/escodegen.squishy.js",
           "js/lib/estraverse/estraverse",
           function(event,basic,esprima,ESCG,esv) {
             var nodetypes={
               NewExpression:{enter:function(n,p,c) {
                 var item=new basic.Span("(new ","C");
                 return item;
               },leave:function(n,p,c) {
                 c.add(new basic.Span(")"));
               }},
               BlockStatement:{enter:function(node){
                 var item=new basic.Div("B "+node.name);
                 item.add(new basic.Span("{","BD"));
                 return item;
               },leave:function(n,p,c) {
                 c.add(new basic.Span("}","BD"));
               }},
               ExpressionStatement:{enter:function(node) {
                 return new basic.Div("E");
               },leave:function(node,parent,cursor) {
                 cursor.add(new basic.Span(";","EC"));
               }},
               VariableDeclaration:{enter:function(node) {
                 var item=new basic.Div("V");
                 item.add(new basic.Span("var"));
                 return item;
               },leave:function(node,parent,cursor) {

               }},
               MemberExpression:{enter:function(n,p,c) {
                 return new basic.Span("","M");
               },leave:function(n,p,c) {
                   var L=c.elements.length;
                   c.elements[2].addBefore(new basic.Span(".","DL"))
                 }
               },
               Identifier:{enter:function(node,parent) {
                 var item=new basic.Span(node.name,"I");
                 if(node.name&&node.name!="") { item.content(node.name) }
                 else { item.content("Unnamed"); }
                 return item;
               },leave:function(node,parent) {
               }},
               FunctionDeclaration:{enter:function(n,p,c) {
                 var item=new basic.Div("F")
                 item.add(new Span("function(","F"));
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
                 if(n.parameters&&n.parameters.length>0) {
                   for(var i=c.elements.length;i>1;i--) {
                    c.elements[i].add(new basic.Span(","));
                   }
                 }
               }},
               ReturnStatement:{enter:function(n,p,c) {
                 return new basic.Span("return ");
               },leave:function(n,p,c) {

               }},
               Literal:{enter:function(node,parent) {
                 return new basic.Span("\""+node.value+"\"","literal");
               },leave:function(n,p,c) {

               }},
               VariableDeclarator:{enter:function(n,p) {
                 return new basic.Span("");
               },leave:function(n,p,c) {
                 c.elements[1].add(new basic.Span(" = "));
               }},
               CallExpression:{enter:function(n,p) {
                 var item=new basic.Span("&nbsp;","EX");
                 return item;
               },leave:function(n,p,cursor) {
                 cursor.elements[0].add(new basic.Span("("));
                 cursor.add(new basic.Span(")"));
                 if(n.arguments.length>1) {
                   for(var i=cursor.elements.length-2;i>1;i-=2) {
                    cursor.elements[i].add(new basic.Span(","));
                   }
                 }
               }},
               BinaryExpression:{enter:function(n,p) {
                 return new basic.Span("&nbsp;","OP");
               },leave:function(n,p,c) {
                 if(n.operator) {
                   c.elements[2].addBefore(new basic.Span(n.operator));
                 }
               }},
               IfExpression:{enter:function(node,parent) {
                 var item=new basic.Span("if(");

                 return item;
               },leave:function(n,p,c) {
                 c.add(new basic.Span(")"));
               }},
               Program:{enter:function(node,parent,c) {
                 return new basic.Div("eeprogram");

               },leave:function(node,parent) {

               }},
               Property:{enter:function(node,parent,c) {
                 return new basic.Span("","");
               },leave:function(n,p,c) {
                 c.elements[1].add(new basic.Span(":"));
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



               function PseudoRandomColor(n) {
                 var P=Math.PI;
                 var r=Math.round(128+255*Math.sin((n*P/7)+(2*P/3))/2);
                 var g=Math.round(128+255*Math.sin((n*P/7)+(4*P/3))/2);
                 var b=Math.round(128+255*Math.sin((n*P/7)+(2*P))/2);

                 return "rgb("+r+","+g+","+b+")";
               }
               var cursor=Lines;
               estraverse.traverse(parsed,{
                 enter:function(node,parent) {
                   depth++;
                   var item;
                   if(node.leadingComments) {
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
                   if(nodetypes[node.type]) {
                     item=nodetypes[node.type].enter(node,parent,cursor);
                   } else {
                     item=nodetypes["Unknown"].enter(node,parent,cursor);
                   }
                   if(item) {
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
                     item.element.style["border-color"]=PseudoRandomColor(d);
                   });
                   item.addEvent("select","click",function(e) {
                     console.debug(node);

                     //  e.stopPropagation();
                   });

                   item.addEvent("hidetip","mouseout",function(e) {
                     tooltip.hide();
                     item.removeClass("hovering");
                     item.element.style["border-color"]="rgba(0,0,0,0)";
                   });
                   item.enableEvents();
                   cursor=cursor.parent;
                 }
               });
               return Content;
             });
           });
});
