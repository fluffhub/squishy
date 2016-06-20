Module(function M() {
  M.Import(
    "squishy/events",
    "squishy/basic",
    "squishy/interactive",
    "js/lib/esprima/esprima",
    "js/lib/escodegen/escodegen.squishy.js",
    "js/lib/estraverse/estraverse",
    "squishy/request",
    "squishy/svg",
    "squishy/form",
    function(event,basic,interactive,esprima,ESCG,esv,Req,svg,form) {
      var Request=Req.Request;
      var theme={}
      new svg.SVG({
        src:"img/filebrowser.svg",
        onload:function(svgfile) {
          var gs=svgfile.query("*[id]")
          gs.forEach(function (g) {
            theme[g.NSattr("id")]=g;
          });

        }
      });
          M.Class(function C() {
            C.Super(basic.Div);
            C.Init(function FileBrowser()  {
              basic.Div.call(this,"FileBrowser");
              this.files={};
              this.absolutefiles={};
              this.rawfiles={};
              this.windows={};
              var lib=this;
              this.importer=new form.Form("importer",function submit(e) {
                var path2=lib.importer.searchbox.value();
                lib.Import(path2,function(m) {
                  //this is the librarymodule
                 // this.remove();
                 // lib.load(path2,);
                });
                e.preventDefault();
              });


              this.importer.searchbox=new form.TextInput("Search");
              this.importer.add(this.importer.searchbox);

              this.importer.searchbox.attrs({placeholder:"Import URL"});

              this.importer.add(new form.Submit("Search"));
              this.addBefore(this.importer);
            });
            C.Def(function load(path,item) {
              var browser=this;
              Import("app/codebrowser",function(codebrowser) {
                browser.absolutefiles[path]=item;
                new Request("URI","TEXT").Get(item.filename,{},function(raw) {
                  browser.windows[path]=new codebrowser.CodeBrowser(raw,browser);
                  browser.windows[path].addBefore(new basic.Span(path));
                  browser.parent.add(browser.windows[path]);
                });
              });
            });
            C.Def(function change(path,item) {
              var browser=this;
                                    for(var windowid in browser.windows) {
                        browser.windows[windowid].hide();
                      }
                      if(browser.windows[path]) {
                        browser.windows[path].show();

                      } else {
                        browser.load(path,item);

                      }
            });
            C.Def(function Import(path1,callback) {
              var item;
              var browser=this;
              var cursor=this;
              window.Import(path1,function(item) {
                var path=item.filename;
                var paths=path.split('/');
                var start=0;
                var children=Object.keys(item);
                if(paths[0]=="") start=1;
                var filename=paths[paths.length-1];

                for(var i=start;i<paths.length;i++) {
                  var file;
                  var key=paths[i];
                  var existingfiles=cursor.query("div[data-key=\""+key+"\"]");

                  if(Object.keys(existingfiles).length>0) {cursor=existingfiles[0]; }

                  /*if(paths[i] in cursor.files) {
                file=cursor.files[paths[i]];
              }*/
                  else {
                  //  file=new basic.Div();
                  //  file.files={};

                    var modulewrapper=new basic.Div("module member");
                    modulewrapper.attrs({"data-key":key});
                    cursor.add(modulewrapper);

                    //file.contents=modulewrapper;
                    var filelink=null;


                    //file.addClass("file");
                    modulewrapper.visible=true;
                    filelink=new basic.FakeLink("?page="+path,paths[i],function() {
                     browser.change(path,item);

                      //modulewrapper.contents.show();
                    });

                    var grip=new interactive.MomentaryButton(">","grip",function(e) {
                                            if(modulewrapper.visible) { modulewrapper.contents.addClass("hidden"); modulewrapper.addClass("collapsed"); modulewrapper.visible=false; }
                        else { modulewrapper.contents.removeClass("hidden"); modulewrapper.visible=true; modulewrapper.removeClass("collapsed"); }
                      e.stopPropagation();
                      e.preventDefault();
                    });
                    modulewrapper.add(grip);
                    modulewrapper.add(filelink);
                    filelink.addClass("loaded");
                    modulewrapper.contents=new basic.Div("content");
                    modulewrapper.contents.files={};
                    modulewrapper.add(modulewrapper.contents);
                    cursor=modulewrapper.contents;
                    var handle=new basic.Span("+");
                    if(paths.length-i==1) {
                    //  file.addClass("filelink");
                      function travel(item2,depth) {

                        var items=Object.keys(item2);
                        if(items.length>0) cursor.addClass("module");
                        console.debug(items);

                        for(var j=0;j<items.length;j++) {

                          key=items[j];

                          var existing=cursor.query("div[data-key=\""+key+"\"]");
                          var c;
                          if(existing.length>0) { c=existing[0]; }
                          // if(key!="supers") {//
                          else  { c=new basic.Link({url:"#"+key,content:key});
                                 c.element.onclick=function() { browser.change(path,item) };
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

                            if(depth>0&&submembers.length>0) {

                              if(c.parent) cursor=c;
                              c.add(travel(member,depth-1));
                              if(c.parent) cursor=c.parent;
                            }
                            //  }
                          }

                        }

                      }
                      travel(item,0);
                      cursor=modulewrapper.parent;
                    } else {

                      //file=new interactive.Collapsible(path,paths[i]+"\\","",null,handle);

                      modulewrapper.addClass("dir");
                     // modulewrapper.attrs({"data-key":paths[i]});
                      /* var label=new basic.Div("label");
                  label.attrs({id:paths[i]});
                  file.add(label);*/

                      //label.content(paths[i]+"\\");

                     // file.handle=grip;
                      //file.addBefore(file.handle);
                    //  file.contents.files=file.files;
                     // cursor=file.contents;
                    }
                  //  cursor.files[paths[i]]=file
                    //cursor.add(file);

                    if(callback) callback(cursor);
                    cursor=cursor.parent;
                  }
                  // if(filename!="index.js") {
                  //if(file.contents && file.contents.element ) cursor=file.contents
                  //else cursor=file;

                  /* now iterate the enumerable members of item! */

                }
                if(browser.windows.length==1) browser.load(path,item);
              });
            });
             //  M.continue();
          });


    });

});
