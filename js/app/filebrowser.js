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
    "squishy/membrane",
    function(event,basic,interactive,esprima,ESCG,esv,Req,svg,form,membrane) {
      var osroot=""
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
        var File=M.Class(function C() {
        C.Super(interactive.MomentaryButton);
        C.Init(function File(name,loc,env,click) {
          interactive.MomentaryButton.call(this,name,"",click)
          this.env=env;
          this.name=name;
          this.loc=loc;
          this.container=new basic.Div("fs_container");
          this.container.attrs({"data-key":name})
          this.add(this.container);
          this.container.hide();

        });
            C.Def(function open() {
          this.container.show();
        });
        C.Def(function close() {
          this.container.hide();
        });
        C.Def(function onrefresh(val) {})
        C.Def(function refresh() {
          var F=this;
          this.env.exec("cd "+this.loc+";cat "+this.name+";cd -",function(val) {
            F.value=val;
            F.onrefresh(val);
          });
        });
      });
      var Dir=M.Class(function C() {
        C.Super(interactive.MomentaryButton);
        C.Init(function Dir(name,loc, env,click) {
          interactive.MomentaryButton.call(this,name,"",click);
          this.name=name;
          this.env=env;
          this.loc=loc;
          this.contents={};
          this.container=new basic.Div("fs_container");
          this.container.attrs({"data-key":name})
          this.add(this.container);
          this.container.hide();
          this.refresh();
        });
        C.Def(function open() {
          this.container.show();
        });
        C.Def(function close() {
          this.container.hide();
        });
        C.Def(function onrefresh(val) {})
        C.Def(function refresh() {
          var dir=this;
          this.env.exec("cd "+this.loc+";ls -d *;cd ~-",function(val) {
            var files=val.split(/\W/);
            console.debug({files:files})

            files.forEach(function(filename) {
              if(filename.slice(-1)=="/") {
                //is a dir
                //var F=new interactive.MomentaryButton(filename);
                //see if dir is already open

                var D=new M.Self.Dir(filename,this.loc+"/"+filename,dir.session,function() {
                  this.refresh();
                  this.open();
                })
                dir.contents[filename]=D;


                this.add(D);

              } else {
                //is a file
                var F=new M.Self.File(filename,this.loc+"/"+filename,dir.session,function() {
                  this.refresh();
                  this.open();
                });
                dir.contents[filename]=F;
                dir.container.add(F);


              }

            });
          });
        })
      });


        M.Class(function C() {
          C.Super(basic.Div);
          C.Def(function pwd(val) {

          });
          C.Def(function cd(to, upon) {
            var lib=this;
            lib.session.exec("cd "+to+";pwd",function(val) {
              lib.pwd=val;
              var dirs=val.split('/')
              var dirname=dirs[dirs.length-1];
              var i;
              for(i=0;i<dirs.length;i++) {
                if(lib.dirs.length>=i&&dirs[i]==lib.dirs[i].name) { }
                else {
                  break
                }
              }
              if(i>=dirs.length-1) {

              } else {
                for(var j=0;j<lib.dirs.length;j++) {

                }
              }
              if(lib.dirs[val] instanceof Object) {

              } else {

              }
              upon(val)
            });
          });
          C.Init(function FileBrowser(loc)  {
            basic.Div.call(this,"FileBrowser");
            this.files={};
            this.absolutefiles={};
            this.rawfiles={};
            this.windows={};
            var lib=this;
            this.session=new membrane.Environment("poop7")
            this.presentdir=new basic.Div("dirname");
            this.dirs={};
            this.pwd="";
            this.root=null;
            if(loc) {} else { loc=".." }
            this.cd(loc, function(val) {

              var dirs=val.split('/')
              var dirname=dirs[dirs.length-1];

              //if(dirname=="src")
              // lib.cd ("..",function(val) {
              //lib.pwd=val;


              //lib.presentdir.content(dirname);
              // });
              var curs=lib.dirs;
              for(var i=0;i<dirs.length;i++) {
                if(curs[dirs[i]]!==undefined) {}
                else { curs[dirs[i]]={} }

              }
              lib.root=val;


            });
            //this.session.send("pwd",function(val) {






            //});
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
            lib.add(lib.presentdir)

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
            var filedepth=0;

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

                if(Object.keys(existingfiles).length>0) {
                  cursor=existingfiles[0];
                }

                /*if(paths[i] in cursor.files) {
                file=cursor.files[paths[i]];
              }*/
                else {
                  //  file=new basic.Div();
                  //  file.files={};
                  var item;
                  if(paths.length-i==1) {
                    //  file.addClass("filelink");
                    item=new M.Self.File(key,browser.root+paths.slice(0,-1).join("/"),browser.session);
                    item.addClass("file");
                  } else {

                    //file=new interactive.Collapsible(path,paths[i]+"\\","",null,handle);
                    item=new M.Self.Dir(key,browser.root+paths.slice(0,i).join("/"),browser.session);
                    item.addClass("dir");
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
                  //var modulewrapper=new basic.Div("module member");
                  //item.attrs({"data-key":key});
                  cursor.add(item);

                  //file.contents=modulewrapper;
                  var filelink=null;


                  //file.addClass("file");
                  item.visible=true;
                  filelink=new basic.FakeLink("?page="+path,paths[i],function() {
                    browser.change(path,item);

                    //modulewrapper.contents.show();
                  });

                  var grip=new interactive.MomentaryButton("","grip open",function(e) {
                    if(item.visible) { item.open() }
                    else { item.close();  item.visible=false }
                    e.stopPropagation();
                    e.preventDefault();
                  });

                  filelink.addClass("loaded");

                  //modulewrapper.contents=new basic.Div("content");
                  //modulewrapper.contents.files={};
                  //modulewrapper.add(modulewrapper.contents);

                  cursor.add(grip);
                  cursor.add(filelink);
                  //if(item.container)
                  cursor=item.container;

                  //  cursor.files[paths[i]]=file
                  //cursor.add(file);

                  if(callback) callback(cursor);
                  //cursor=cursor.parent;
                }
                // if(filename!="index.js") {
                //if(file.contents && file.contents.element ) cursor=file.contents
                //else cursor=file;

                /* now iterate the enumerable members of item! */
                filedepth++;
              }
              if(browser.windows.length==1) browser.load(path,item);
            });
          });
          //  M.continue();
        });
      M.Def("openers",{})


      });

    });
