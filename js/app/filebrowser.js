Module(function M() {
  M.Import(
    "squishy/events",
    "squishy/basic",
    "squishy/interactive",
    "js/lib/esprima/esprima",
    "js/lib/escodegen/escodegen.squishy.js",
    "js/lib/estraverse/estraverse",
    "js/lib/squishy_ext/Request.js",
    function(event,basic,interactive,esprima,ESCG,esv,Req) {
      var Request=Req.Request;
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
          Import("app/codebrowser",function(codebrowser) {
          browser.absolutefiles[path]=item;
          new Request("URI","TEXT").Get(item.filename,{},function(raw) {
            browser.windows[path]=new codebrowser.CodeBrowser(raw,browser);
            browser.windows[path].addBefore(new basic.Span(path));
            browser.parent.add(browser.windows[path]);
          });
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
            var filename=paths[paths.length-1];

            var filelink=new basic.FakeLink("?page="+path,filename,function() {
              for(var windowid in browser.windows) {
                browser.windows[windowid].hide();
              }
              if(browser.windows[path]) {
                browser.windows[path].show();
              } else {
                browser.load(path,item);
              }
            });
            filelink.addClass("filelink");

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
             // if(filename!="index.js") {
                cursor=file;

                /* now iterate the enumerable members of item! */
                var cursize=1;
                cursor.add((function travel(item) {
                  var items=Object.keys(item);
                  if(items.length>0) cursor.addClass("module");
                  for(var j=0;j<items.length;j++) {
                    var key=items[j];
                    if(key!="supers") {
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
                  }
                })(item))
             // } else {

             // }
            }
            if(browser.windows.length==1) browser.load(path,item);
          });
        });
      });
    });
});
