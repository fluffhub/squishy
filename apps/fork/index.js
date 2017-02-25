Module(function M() {
  M.Import(
    "squishy/events",
    "squishy/basic",
    "squishy/interactive",
    "squishy/request",
    "squishy/svg",
    "squishy/form",
    "js/lib/squishy_ext/LocalModel",

    "squishy/live",
    "squishy/system",
    "fork/wrappers",
    function(event,basic,interactive,Req,svg,form,LM,live,system,wrappers) {
      Import(    "spoon","spoon/conf",function(spoon,conf) {
        var osroot=""
        var Request=Req.Request;
        var main=live.DeviceManager;
        var theme={}



        M.Def("wrappers",wrappers)

        var FileListItem=M.Class(function C() {
          C.Super(interactive.MomentaryButton);
          C.Init(function FileListItem(name,loc,click) {
            var fli=this;
            interactive.MomentaryButton.call(this,name,"",click)
            this.addClass("FileListItem");
            this.name=name;
            this.loc=loc;
            this.container=new basic.Div("fs_container");
            this.container.attrs({"data-key":name})
            this.add(this.container);
            this.container.hide();
            this.references={};
            live.DeviceManager.retrieve(loc,function(devices) {
              var devicenames=Object.keys(devices);
              devicenames.forEach(function(devicename) {
                var device=devices[devicename];

                var ws=wrappers.getWrapper(device);
                ws.forEach(function(w) { w.wrap(fli); });

              });

            });
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
        M.Def(function match( file, name) {
          var ws=wrappers.getWrapper(file);
          if(ws instanceof Array && ws.length>0) {
            return true;
          }
        });
        var FileList=M.Class(function C() {
          C.Super(basic.Div);
          C.Init(function FileList(name,loc,click) {
            basic.Div.call(this);
            var dir=this;
            this.addClass("FileList");
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
                  M.Self.wrappers.getWrapper(dev).forEach(function(wrapper) {
                    wrapper.wrap(dir);
                    wrapper.open(dev,dir);




                  });
                  //F.addReference(devicename,file);
                  //dir.contents[filename]=F;
                  //dir.Contents.add(F);
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
              Object.keys(mod).forEach(function(devname) {
                var instance=mod[devname];

                if(lib.dirs[path] instanceof Object) {

                } else {
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
                  if(M.Self.match(instance,dirs[dirs.length-1])) {
                    var newDir=new FileList(dirs[dirs.length-1],val,function(dirloc) {
                      lib.cd(dirloc);
                    });
                    lib.dirs[path]=newDir;


                    lib.add(newDir);
                    //if(
                    newDir.load();
                    newDir.hide();


                  } else {
                    console.debug({unmatched:dirs[dirs.length-1],mod:instance});
                  }

                }
                if(lib.dirs[path] instanceof Object) {
                  Object.keys(lib.dirs).forEach(function(d) {
                    if(d!=path)
                      lib.dirs[d].hide();
                  });
                  lib.dirs[path].show();
                  lib.setDir(val);
                }
              });


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
            this.presentdir.removeClass("longer");
            if(dirs.length>2) this.presentdir.addClass("longer");
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
          window.exp=new FileBrowser(loc);

          return window.exp;
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
});

