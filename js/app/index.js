/*
Building a Squishy Application:
The Meta Tutorial

Chapter 2: Structuring Code
Section 1: Imports and Modules
The file and URI structure of a Squishy app consists of multiple file or resource types:

    1. 1. Directories Or Modules
      Hierarchical structures of groups of files in the file system are referred to as
      directories;  the corresponding groups of code in the programming language are referred
      to as Modules.

      To convert a directory into a code module, insert a file called "index.js."
      Then, convert it into a source module by wrapping it in the Module command:

*/
Module(function M() {
/*
      As the name implies, the index.js contains a javascript-rendition of the
      directory index ("dir" or "ls") command for that directory.
      This file you are reading is an example of an index.js.
      Define the other files in the module using the Index command:

*/
      M.Index(
        "page",
        "user"
      );
/*

      Here, we list the files and subdirectories in this directory which should be available for
      inspection by the public.  It does not prevent unlisted files from being read, but will only
      list those files that are published in the list.


*/

/*

      Note 1.1:
        Within the module definition, the module is referred to by the callback's name (in this case M)
        When nesting definitions, the typical practice is to use M, M2, M3, etc.


*/

/*

      It can also include any other code relevant to the directory or app as a whole.
      There will be additional code examples below.

    Other files may be contained in Directories and abstracted as Modules:

    1.2. Static Data
      The static components of the squishy app.

      1.2.1.   HTML markup files.
        The most common example is the entry point for a Squishy app, /index.html.
        Web servers generally serve index.html first as the resource available in a directory,
        so the URI "/" will point to "/index.html".  So, the application loader and some static content
        can be loaded in the index.html file.  The basic Squishy application module is loaded
        as the first script tag, and the application's main module (this file) is loaded as the second.

        The usual practice is to provide the "search engine-friendly" homepage content within the
        static content of the HTML served, which is the content that spiders read.

        One other common practice to improve spider accessibility and caching is to use a
        URL rewriting scheme to convert keywords in the URL into useful
        URI-Encoded GET parameters for the index, for example:

          /books/book1/page1          becomes     /index.html?action=books&book=1&page=1

        These GET parameters can be read easily in the Local and Server modules.

        The most basic example of the index.html for an application is found in the root directory
        of this app.  A very basic app can include just a basic index.html and the appropriate JS
        source to make the app work.

      1.2.2.  Image Data
      1.2.3. Styling (CSS)
      1.2.4.  Data files


    1.3. Server Modules / Endpoints / CGI
        Server source are executable files running on the server that run on the server,
        upon remote access to a URI.  For Javascript, these files use the .jss extension.
        in other cases they have a corresponding file extension (.php, .pl, .py).
        They may have a URI determined by a URL Rewriting scheme;  for example:

          /login         becomes      /index.jss?action=login

        The most common application for server modules is when user division is required,
        and typically uses POST parameters to provide login and database manipulation.

        @TODO: provide sample database application

    1.4. Local Modules
        Browser-runnable source code.  Generally written in .js code, but, in theory,
        could be anything that can be downloaded and executed at the browser side.
        The code is generally download and run through once, however usually in practice
        the code will contain procedural definitions for later event-driven execution.
        Squishy provides a standard way to structure these procedural definitions in
        the module;  these methods are illustrated in sections 2 and 3.


Any of these files can be "Imported" in a squishy module by wrapping applicable code in an Import
statement.  All of the code wrapped inside of an Import will have available the files specified
to the import statement by its first parameter, which is a list of resources separated by spaces.

*/
  M.Import(
    "squishy",
    "squishy/DOM",
    "squishy/basic",
    "squishy/interactive",
    "squishy/form",
    "squishy/layout",
/*

Once all of the files listed have loaded and run, they will be passed in order to the code inside the Import.

*/
     function(squishy,DOM, basic, interactive,form,layout) {
/*

You can also use Import to just load files by calling it without referencing the containing Module.
This is required in some cases:
  - if the module in question is not a compatible Squishy module,
  - if the imported file is a static file
  - where one would cause a circular dependency,
  - or in procedural definitions which will not be concurrently executed.

*/
       Import("js/lib/ckeditor/ckeditor",function(cke) { console.debug("?????"); console.debug(cke); });

/* this includes several default stylesheets
*/
       Import("css/ui.css");
       Import("css/default.css");

/*

Section 2: Defining the Module

2.1 The Def Statement
The most basic way to define the contents of the Module, is via Def statements:

*/
     var title=M.Def("title","The Meta Tutorial");
/*
  Note 2.1:  Here "title" is being declared in this scope with "var"
  so the defined object is also available in this code block as "title".
*/

/*

You can define any value as a member of this file's resulting module object, including other objects,
and functions:

*/

       M.Def("update",function() {

         /* @TODO: give some content here */

       });
/*

2.2 Creating new objects
Squishy provides several libraries of objects to be defined in building an application.
These are found in DOM, basic, interactive, and several other libraries which wrap HTML5
DOM Elements.  The first is the Frame found in the DOM module, which wraps
the javascript window object and is the lowest level DOM object:

*/
       var Window=new DOM.Frame();
/*
To build out the application,
you can add additional new items just as you would in writing HTML pages,
except instead of defining HTML/XML markup you are writing function calls:

*/

      var Title=M.Def("Title", new DOM.Tag({type:"title","content":title}));





      Window.head.add(Title);


/*
  Note 2.2:  The result of this code is an addition of the equivalent HTML to the <head>:
  <title>The Meta Tutorial</title>

*/

/*
  There are many available components to be created this way.  You can add directly to the
  document body by using Window.add.
*/
       var Header=new DOM.Tag({type:"h1","content":title});

/*
  the basic library includes many default tags representing typical HTML Elements:
*/
       console.debug({M:M});
       var Content=new basic.Div("Content");
       var Tagline=new basic.Span();
       Content.add(Tagline);
       Window.add(Content);

/*
  You can also add text or set the content of the node directly:
*/
       Tagline.add("Welcome to the Meta Tutorial!");
       var Location=new basic.Link({cls:"location",url:window.location.pathname});
       Location.content("Location: "+window.location.pathname);

/*

  You can explore the available components in depth by browsing the squishy and squishy_ext libs
  by continuing this tutorial.

*/

/*
  2.3 Accessing Remote Resources
    Using remote resources as data sources is critical to building dynamic applications.
    Remote resources include data files stored in the same directory as this file as well as
    cloud APIs, devices, or any other server.

    We will be using this file and the default Squishy libraries as remote resources to
    build a self-documentation feature.  This is done using the Request library loaded above and the Import command.

*/
    Import("js/lib/squishy_ext/Request",
           "squishy/events",
           "js/lib/esprima/esprima",
            "js/lib/escodegen/escodegen.squishy.js",
           "js/lib/estraverse/estraverse",
           function(Request,event,esprima,ESCG,esv) {
             var Req=Request.Request;
       /*
       Note 2.3: Var Req is used here to create a shorthand to the Request.Request class.
       */
             var escodegen=ESCG.escodegen;
             window.escodegen=escodegen;
             var estraverse=esv;
             var URLVars=Window.getUrlVars();
             var page="js/app/index.js";
             if(URLVars.page!==undefined) {
               page=URLVars.page;
             }

/*  To grab the plain text content of the file without importing the contents, use the Request module.
    The constructor for Request takes two strings describing the request and response types
    of the resource.

    Requests and responses can be URI-encoded (ex, ?arg1=val1&arg2=val2), JSON encoded, or TEXT
    In this case we will request the fulltext of this file.  Requests are defined in the same way
    as imports, but with a specific way to handle the results:
*/




             new Req("URI","TEXT").Get(page,{
         /*
           Note 2.4:  If there were GET or POST arguments for this request, they would be listed here.
         */
             },function(samplepage) {

               var parsed=esprima.parse(samplepage,{comment:true,attachComment:true,range:true,loc:true,tokens:true});
               var comments=parsed.comments;
               var code=escodegen.generate(parsed);
               var lines = code.split("\n");

               console.debug({lines:lines, comments:comments, parsed:parsed});
               var Comments=new basic.Div("comments");
               var withcomments=escodegen.attachComments(parsed,comments, parsed.tokens);

               var code2=escodegen.generate(withcomments);


               Content.add(Comments);
               console.debug({code2:code2,withcomments:withcomments});
               var depth=0;
               var Lines=new basic.Div("code");
               Content.add(Lines);

              // var tooltip=new basic.Div("tooltip");
              // tooltip.element.style.position="absolute";
              // tooltip.hide();
              // Window.add(tooltip);
               console.debug({estraverse:estraverse});
               var nodetypes={
                 NewExpression:{enter:function(n,p,c) {
                   var item=new basic.Span("(new ","new");
                   return item;
                 },leave:function(n,p,c) {
                   c.add(new basic.Span(")"));
                 }},
                 BlockStatement:{enter:function(node){
                   var item=new basic.Div("codeblock "+node.name);
                   item.add(new basic.Div("{"));
                   return item;
                 },leave:function(n,p,c) {
                   c.add(new basic.Div("}"));
                 }},
                 ExpressionStatement:{enter:function(node) {
                   return new basic.Div("expression");
                 },leave:function(node,parent,cursor) {
                  cursor.add(new basic.Span(";"));
                 }},
                 VariableDeclaration:{enter:function(node) {
                   var item=new basic.Div("variable");
                   item.add(new basic.Span("var "));
                   return item;
                 },leave:function(node,parent,cursor) {

                 }},
                 MemberExpression:{enter:function(n,p,c) {
                   return new basic.Span("","m");
                 },leave:function(n,p,c) {
                   for(var i=2;i<c.elements.length;i++) {
                    var element=c.elements[i];
                   }
                 }},
                 Identifier:{enter:function(node,parent) {
                   var item=new basic.Span(node.name,node.type);
                   if(node.name&&node.name!="") { item.content(node.name) }
                   else { item.content("Unnamed"); }
                   return item;
                 },leave:function(node,parent) {
                 }},
                 FunctionDeclaration:{enter:function(n,p,c) {
                   var item=new basic.Span("function ","");
                   return item;
                 },leave:function(n,p,c) {
                 }},
                 AssignmentExpression:{enter:function(n,p,c) {
                   return new basic.Span("","");
                 },leave:function(n,p,c) {
                   c.add(new basic.Span(" = "));
                 }},
                 FunctionExpression:{enter:function(n,p,c) {
                   return new basic.Span("","");
                 },leave:function(n,p,c) {
                   c.addBefore(new basic.Span("function "));
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
                   var item=new basic.Span("");
                   return item;
                 },leave:function(n,p,cursor) {
                   cursor.elements[0].add(new basic.Span("("));
                   cursor.add(new basic.Span(")"));
                 }},
                 IfExpression:{enter:function(node,parent) {
                   var item=new basic.Div(node.type);
                   item.content("if ");
                   return item;
                 },leave:function(node,parent) {

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
               function getColor(depth) {
                 var r=255*Math.sin((depth*Math.pi/7)+(2*Math.pi/3));
                 var g=255*Math.sin((depth*Math.pi/7)+(4*Math.pi/3));
                 var b=255*Math.sin((depth*Math.pi/7)+(2*Math.pi));

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
                     console.debug(comment);
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

                   item.element.style["border-color"]=getColor(depth);
                   item.addEvent("showtip","mouseover",function(e) {
                     tooltip.show();
                     item.addClass("hovering");
                   });
                   item.addEvent("select","click",function(e) {
                     console.debug(node);
                   //  e.stopPropagation();
                   });

                   item.addEvent("hidetip","mouseout",function(e) {
                     tooltip.hide();
                     item.removeClass("hovering");
                   });
                   item.enableEvents();
                   cursor=cursor.parent;
                 }
               });


             });
           });
    });

});

