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
            var children=Object.keys(item);
            if(paths[0]=="") start=1;
            var filename=paths[paths.length-1];

            for(var i=start;i<paths.length;i++) {
              var file;
              if(paths[i] in cursor.files) {
                file=cursor.files[paths[i]];
              }
              else {


                if(paths.length-i==1) {
                   file=new basic.Div();
                  file.addClass("file");
                  var modulewrapper=new basic.Div("module member");
                  cursor.add(modulewrapper);

                  modulewrapper.visible=true;
            var filelink=new basic.FakeLink("?page="+path,filename,function() {

              for(var windowid in browser.windows) {
                browser.windows[windowid].hide();
              }
              if(browser.windows[path]) {
                browser.windows[path].show();
                                if(modulewrapper.visible) { modulewrapper.contents.addClass("hidden"); modulewrapper.visible=false; }
              else { modulewrapper.contents.removeClass("hidden"); modulewrapper.visible=true; }
              } else {
                browser.load(path,item);

              }

              //modulewrapper.contents.show();
            });
            filelink.addClass("filelink");

                  modulewrapper.add(filelink);
                  filelink.addClass("loaded");
                  modulewrapper.contents=new basic.Div("content");
                  modulewrapper.add(modulewrapper.contents);
                  cursor=modulewrapper.contents;

                  function travel(item2,depth) {

                    var items=Object.keys(item2);
                    if(items.length>0) cursor.addClass("module");
                    console.debug(items);

                    for(var j=0;j<items.length;j++) {

                      var key=items[j];
                      var existing=cursor.query("[data-key=\""+key+"\"]");
                      var c;
                      if(existing.length>0) c=existing[0];
                     // if(key!="supers") {//
                        else  c=new basic.Span(key);
                      c.attrs({"data-key":key});
                        c.addClass("member");
                        var cursize=1-(depth*0.125);
                        c.element.style["font-size"]=cursize+"em";
                      cursor.add(c);
                        var member=item2[items[j]];

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
                  file=new interactive.Collapsible(paths[i]+"\\");
                  file.addClass("dir");
                 /* var label=new basic.Div("label");
                  label.attrs({id:paths[i]});
                  file.add(label);*/

                  //label.content(paths[i]+"\\");
                  file.files={};
                  file.contents.files=file.files;

                }
                cursor.files[paths[i]]=file
                cursor.add(file);
              }
             // if(filename!="index.js") {
              if(file.contents && file.contents.element ) cursor=file.contents
              else cursor=file;

                /* now iterate the enumerable members of item! */


             // } else {

             // }
            }
            if(browser.windows.length==1) browser.load(path,item);
          });
        });
      });
    });
});
