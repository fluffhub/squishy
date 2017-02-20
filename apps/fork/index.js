Module(function M() {
  M.Import(
    "squishy/events",
    "squishy/basic",
    "squishy/interactive",
    "squishy/request",
    "squishy/svg",
    "squishy/form",
    "squishy/membrane",
    "js/lib/squishy_ext/LocalModel",
    "spoon",
    "spoon/conf",
    "squishy/live",
    "squishy/system",
    function(event,basic,interactive,Req,svg,form,membrane,LM,spoon,conf,live,system) {
      var osroot=""
      var Request=Req.Request;
      var main=live.DeviceManager;
      var theme={}
      var fliw=M.Class(function C() {

        C.Init(function FileListItemWrapper(match,wrap,open) {
          if(wrap instanceof Function) { this.wrap=wrap; }
          if(match instanceof Function) { this.match=match; }
          if(open instanceof Function) { this.open=open; }
        });
        C.Def(function wrap(item) {
          return item;
        });
        C.Def(function match(name,item) {
          return false;
        });
        C.Def(function open() {

        });
      })
      var wrappers=new window.Module (function M2() {
        var fliws={};
        M2.Def("FileListItemWrappers",fliws);
        var afliw=M2.Def(function addFileListItemWrapper(name,match,wrap,open) {
          fliws[name]=new fliw(match,wrap,open);
        });
        M2.Def(function getWrapper(item) {
          var ws=[];
          for(var i=0;i<fliws.length;i++) {
            if(fliws[i].match(item)) {
              ws.push(fliws[i]);
            }

          }
          return ws;
        });
        afliw("Module",function(item) {
          if (item instanceof Module) return true;
          return false;
        },function(item) {
          item.addClass("Module")
        });
        afliw("Dir",function(item) {
          if (item instanceof system.Dir) return true;
          return false;
        },function(item) {
          item.addClass("Dir")
        });
      });



      M.Def("wrappers",wrappers)

      var FileListItem=M.Class(function C() {
        C.Super(interactive.MomentaryButton);
        C.Init(function FileListItem(name,loc,click) {
          interactive.MomentaryButton.call(this,name,"",click)

          this.name=name;
          this.loc=loc;
          this.container=new basic.Div("fs_container");
          this.container.attrs({"data-key":name})
          this.add(this.container);
          this.container.hide();
          this.references={};
          //this.addReference(obj);
        });
        C.Def(function addReference(name,obj) {
          this.references[name]=obj;
          this.addClass(name);
        });
        C.Def(function open() {
          this.container.show();
        });
        C.Def(function close() {
          this.container.hide();
        });
        C.Def(function onrefresh(val) {

        })
        C.Def(function refresh() {

        });
      });
      M.Def(function match(name, file) {
        if(file instanceof system.Dir) {
          return true;
        }
        if(file instanceof Module) {
          return true;
        }
      });
      var FileList=M.Class(function C() {
        C.Super(basic.Div);
        C.Init(function FileList(name,loc,click) {
          basic.Div.call(this);
          var dir=this;
          if (click instanceof Function) {
            dir.click=click

          } else {
            dir.click=function() {
            }
          }
          /*interactive.MomentaryButton.call(this,name,"",function(e) {
            dir.click.call(dir,dir.loc);
            e.stopPropagation();
          });*/
          //this.addClass("Dir");
          this.name=name;
          //this.add(new basic.Span(name))
          //this.env=env;
          if(loc instanceof Element) {
            this.loc=loc;
          } else   {

            this.loc=system.uri(loc);
          }
          this.contents={};
          this.Contents=new basic.Div("fs_container");
          this.Contents.attrs({"data-key":name})
          this.add(this.Contents);
          this.references={};
          //this.Contents.hide();
          //this.refresh();
        });
        C.Def(function addReference(name,obj) {
          this.references[name]=obj;
          this.addClass(name);
        });
        C.Def(function open() {
          this.container.show();
        });
        C.Def(function close() {
          this.container.hide();
        });
        C.Def(function onrefresh(val) {})
        C.Def(function load() {
          var dir=this;
          live.DeviceManager.retrieve(this.loc.href,function(mod) {
            var devicenames=Object.keys(mod);
            var F=null;
            devicenames.forEach(function(devicename) {
              var dev=mod[devicename];

              if(dev!=null) {
                var filenames=Object.keys(dev.contents);

                filenames.forEach(function(filename) {
                  var file = dev.contents[filename];

                  if(filename in dir.contents) {
                    dir.contents[filename].addReference(devicename,file);
                  } else {
                    // var F;
                    var str;
                    if(dir.loc.href.slice(-1)=="/") str=dir.loc.href+filename
                    else str=dir.loc.href+"/"+filename;
                    var dirloc=system.uri(str);

                    F=new M.Self.FileListItem(filename,dirloc,function() {
                      console.debug({Module:file});
                      dir.click.call(dir,dirloc);
                    });
                    /*  if(file instanceof system.Dir) {
                      F=new M.Self.Dir(filename,dirloc,dir.env,function() {
                        dir.click.call(dir,dirloc);
                      });
                      F.addClass("dirlink");
                    } else if(file instanceof Module) {
                      console.debug({Module:file});
                      F=new M.Self.Module(filename,dirloc,file,function() {
                         console.debug({Module:file});
                        dir.click.call(dir,dirloc);
                      });
                      F.addClass("dirlink");
                    } else  {
                      //is a file
                      console.debug({openfile: file })


                        console.debug(this.loc);
                        var fileeditor=spoon.main.openFile(this.loc);
                        console.debug(fileeditor);
                      }
                  });*/
                    F.addReference(devicename,file);
                    dir.contents[filename]=F;
                    dir.Contents.add(F);
                  }

                });
              }
            });
          });
        });
      });


      var FileBrowser=M.Class(function C() {
        C.Super(basic.Div);
        C.Init(function FileBrowser(path)  {

          basic.Div.call(this,"FileBrowser");
          var uri=system.uri(path)

          this.files={};
          this.absolutefiles={};
          this.rawfiles={};
          this.windows={};
          var lib=this;

          this.presentdir=new basic.Div("pwdbar");
          this.presentdir.dirs=[];
          this.dirs={};
          this.pwd=uri.pathname;
          this.root=null;



          this.importer=new form.Form("importer",function submit(e) {
            var path2=lib.importer.searchbox.value();
            lib.Import(path2,function(m) {
              //this is the librarymodule
              // this.remove();
              // lib.load(path2,);
            });
            e.preventDefault();
          });


          lib.importer.searchbox=new form.TextInput("Search");
          lib.importer.add(this.importer.searchbox);

          lib.importer.searchbox.attrs({placeholder:"Import URL"});

          lib.importer.add(new form.Submit("Search"));

          //this.addBefore(this.importer);
          lib.add(lib.presentdir)
          lib.cd(uri);

        });



        C.Def(function cd(val) {
          var lib=this
          var path;
          if(typeof val == "string") {
            path=val
          } else {
            path=val.href
          }
          var dirs=path.split("/")

          live.DeviceManager.retrieve(val,function(mod) {
            if(lib.dirs[path] instanceof Object) {

            } else {

              Object.keys(mod).forEach(function(devname) {

                var instance=mod[devname];

                /*if(instance instanceof Module) {
                  lib.dirs[path]=new M.Self.Module(dirs[dirs.length],val,instance,function(dirloc) {
                    console.debug("cding to "+dirloc);
                    lib.cd(dirloc);
                  });
                } else  {
                  lib.dirs[path]=new Dir(dirs[dirs.length],val,lib.session,function(dirloc) {
                    lib.cd(dirloc)
                  });
                }*/
                var newDir=new FileList(dirs[dirs.length],val,function(dirloc) {
                  if(M.Self.match(mod)) {
                    lib.cd(dirloc);
                  } else {
                    console.debug(dirloc);
                  }

                });
                lib.dirs[path]=newDir;
                M.Self.wrappers.getWrapper(instance).forEach(function(wrapper) {
                  wrapper.wrap(instance);

                });

                lib.add(newDir);
                //if(
                newDir.load();
                newDir.hide();
              });

            }
            Object.keys(lib.dirs).forEach(function(d) {
              if(d!=path)
                lib.dirs[d].hide();
            });
            lib.dirs[path].show();
            lib.setDir(val);
          });
        });
        C.Def(function ls(loc) {
          var lib=this;
          var dirs=this.dirs;

        });
        C.Def(function setDir(a) {
          var loc;
          if(a instanceof Element)  {
            loc = a.hostname+a.pathname;
          } else loc=a;
          var dirs=loc.trim();
          if(dirs[0]=="/") dirs=dirs.slice(1);
          if(dirs[dirs.length-1]=="/") dirs=dirs.slice(0,-1);

          dirs=dirs.split("/")
          var lib=this

          var pdir="";
          this.presentdir.dirs.forEach(function(pwddir) {
            pwddir.remove();
            delete pwddir;

          });
          delete this.presentdir.dirs;

          this.presentdir.dirs=[];
          for(var i=0;i<dirs.length;i++) {
            pdir=pdir+"/"+dirs[i];
            (function(tpdir) {
              var dirbutt=new interactive.MomentaryButton(dirs[i]+"/","pwddir dirlink",function() {
                lib.cd(system.uri("http://"+tpdir))
              });

              lib.presentdir.dirs[i]=dirbutt;
              lib.presentdir.add(dirbutt);
            })(pdir);
          }
          if (loc in lib.dirs) {

          } else {

          }

        });

      });
      M.Def(function open(loc) {
        return new FileBrowser(loc);
      });



      var Module=M.Class(function C() {
        C.Super(interactive.MomentaryButton);
        C.Init(function Module(name,loc, obj,click) {
          var dir=this;
          if (click instanceof Function) {
            dir.click=click

          } else {
            dir.click=function() {
            }
          }
          interactive.MomentaryButton.call(this,name,"",function(e) {
            dir.click.call(dir,dir.loc);
            e.stopPropagation();
          });
          this.name=name;
          //this.add(new basic.Span(name))
          this.obj=obj;
          if(loc instanceof Element) {
            this.loc=loc;
          } else   {

            this.loc=system.uri(loc);
          }
          this.contents={};
          this.Contents=new basic.Div("fs_container");
          this.Contents.attrs({"data-key":name})
          this.addClass("module");
          this.add(this.Contents);
          this.references={};
          this.load()
          //this.Contents.hide();
          //this.refresh();
        });
        C.Def(function addReference(name,obj) {
          this.references[name]=obj;
          this.addClass(name);
        });
        C.Def(function open() {
          this.container.show();
        });
        C.Def(function close() {
          this.container.hide();
        });
        C.Def(function onrefresh(val) {})
        C.Def(function load() {
          var dir=this;
          var dev=this.obj;
          console.debug({dev:dev});
          if(dev!=null) {
            var filenames=Object.keys(dev);

            filenames.forEach(function(filename) {
              var file = dev.contents[filename];


              var F;
              var str;
              if(dir.loc.href.slice(-1)=="/") str=dir.loc.href+filename

              else str=dir.loc.href+"/"+filename;
              var dirloc=system.uri(str);
              F=new FileListItem(filename,dirloc,function() {
                dir.click()
              });
              dir.contents[filename]=F;
              dir.Contents.add(F);

            });
          }
        });
      });
    });
});


