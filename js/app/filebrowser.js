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
    "js/lib/squishy_ext/LocalModel",
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
          /*          this.env.exec("cd "+this.loc+";cat "+this.name+";cd ~-",function(val) {
            F.value=val;
            F.onrefresh(val);
          });*/
        });
      });
      var Dir=M.Class(function C() {
        C.Super(interactive.MomentaryButton);
        C.Init(function Dir(name,loc, env,click) {
          var dir=this;
          if (click instanceof Function) {
            dir.click=click

          } else {
            dir.click=function() {
            }
          }
          interactive.MomentaryButton.call(this,name,"",function(e) {
            console.debug(dir.loc);



            dir.click.call(dir,dir.loc);

            e.stopPropagation();
          });
          this.name=name;
          //this.add(new basic.Span(name))
          this.env=env;
          this.loc=loc.trim();
          this.contents={};
          this.Contents=new basic.Div("fs_container");
          this.Contents.attrs({"data-key":name})
          this.add(this.Contents);
          //this.Contents.hide();
          //this.refresh();
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
          console.debug("refreshing "+this.loc);

          this.env.exec("ls -AF "+this.loc+"",function(val) {
            //"cd "+this.loc+"; cd ~-
            var files=val.split(/[\s]+/);
            console.debug({VAL:val});
            console.debug({files:files});

            files.forEach(function(filename) {
              if(filename.slice(-1)=="/") {
                //is a dir
                //var F=new interactive.MomentaryButton(filename);
                //see if dir is already open
                console.debug("creating dir: "+filename);
                var dirloc=dir.loc+"/"+filename
                var D=new M.Self.Dir(filename,dirloc,dir.env,function() {
                  //this.refresh();
                  //this.open();
                  dir.click.call(dir,dirloc);


                });
                D.addClass("dirlink");
                dir.contents[filename]=D;
                dir.Contents.add(D);

              } else {
                //is a file

                var F=new M.Self.File(filename,dir.loc+"/"+filename,dir.env,function() {
                  if(filename.slice(-1)!="*")
                    this.refresh();
                  this.open();
                });

                dir.contents[filename]=F;
                dir.Contents.add(F);
              }

            });
          });
        });
      });


      M.Class(function C() {
        C.Super(basic.Div);
        C.Init(function FileBrowser(loc,id)  {
          basic.Div.call(this,"FileBrowser");
          this.files={};
          this.absolutefiles={};
          this.rawfiles={};
          this.windows={};
          var lib=this;
          if(id!==undefined) this.id=id;
          else this.id="pool"
          this.session=new membrane.Environment(id)
          this.presentdir=new basic.Div("pwdbar");
          this.presentdir.dirs=[];
          this.dirs={};
          this.pwd="";
          this.root=null;
          if(loc) {} else { loc="." }
          this.cd(loc, function(val) {

            var dirs=val.split('/')
            var dirname=dirs[dirs.length-1];

            if(dirname=="membrane")
              lib.cd ("..",function(val) {

              });


            //this.session.send("pwd",function(val) {





          });
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
          //this.addBefore(this.importer);
          lib.add(lib.presentdir)

        });

        C.Def(function pwd(val) {

        });
        C.Def(function cd(to, upon) {
          var lib=this;
          lib.session.exec("cd "+to+";pwd",function(val) {
            lib.pwd=val;
            var dirs=val.split('/')
            var dirname=dirs[dirs.length-1];
            var i;
            var curs=lib.dirs;


            if(lib.dirs[val] instanceof Object) {

            } else {
              console.debug("initializing dir "+dirs.join("/"));
              lib.dirs[val]=new Dir(dirs[dirs.length],dirs.join("/"),lib.session,function(dirloc) {
                lib.setDir(dirloc);
                lib.cd(dirloc)
              });
              lib.add(lib.dirs[val])
              lib.dirs[val].refresh();
              lib.dirs[val].hide()

            }
            lib.setDir(val.trim());
            Object.keys(lib.dirs).forEach(function(d) {
              lib.dirs[d].hide()
            })
            lib.dirs[val].show();
            if(upon instanceof Function) { upon.call(this,val) }
          });


        });

        C.Def(function ls(loc) {
          var lib=this;
          var dirs=this.dirs;

        });
        C.Def(function setDir(loc) {
          /*for(var i=0;i<dirs.length;i++) {
                if(curs[dirs[i]]!==undefined) {}
                else { curs[dirs[i]]={} }

              }*/
          /*for(i=0;i<dirs.length;i++) {
                if(lib.dirs.length>=i&&dirs[i]==lib.dirs[i].name) { }
                else {
                  break
                }
              }
              if(i>=dirs.length-1) {

              } else {
                for(var j=0;j<lib.dirs.length;j++) {

                }
              }*/
          var dirs=loc.trim().slice(1).split("/")
          var lib=this

          var pdir="";
          this.presentdir.dirs.forEach(function(pwddir) {
            pwddir.remove()
            delete pwddir

          });
          delete this.presentdir.dirs

          this.presentdir.dirs=[];
          for(var i=0;i<dirs.length;i++) {
            pdir=pdir+"/"+dirs[i];
            (function(tpdir) {

              var dirbutt=new interactive.MomentaryButton(dirs[i]+"/","pwddir dirlink",function() {
                lib.cd(tpdir)

              });

              lib.presentdir.dirs[i]=dirbutt;
              lib.presentdir.add(dirbutt);
            })(pdir);
          }
          if (loc in lib.dirs) {

          } else {

          }


        })

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
