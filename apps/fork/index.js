Module(function M() {
  M.Import(
    "squishy/events",
    "squishy/basic",
    "squishy/interactive",
    "squishy/request",
    "squishy/svg",
    "squishy/form",
    "lib/squishy_ext/LocalModel",
    "squishy/live",
    "squishy/system",
    "fork/wrappers",
    "apps/spoon/",
    "spoon/windowing",
    function(event,basic,interactive,Req,svg,form,LM,live,system,wrappers,spoon,windowing) {
      Import("spoon","apps/spoon/conf",function(spoon,conf) {
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
                ws.forEach(function(w) { w.wrap(fli,device); });

              });

            });
          });
          C.Def(function addReference(obj,name) {
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
            for (var i=0;i<ws.length;i++) {
              if(ws[i].open instanceof Function) {
            return true;
              }
            }
          }
          return false;
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
            this.name=name;
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
          });
          C.Def(function addListItem(filename,loc,obj) {
            var FL=this;
            if(filename in FL.contents) {
              FL.contents[filename].addReference(obj);
            }
            else {
              var F=new FileListItem(filename,loc,function() {
                 FL.click.call(FL,loc);
              });
              FL.Contents.add(F);
              FL.contents[filename]=F;
              FL.contents[filename].addReference(obj);
            }
          });
          C.Def(function addReference(obj,name) {
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
            live.DeviceManager.retrieve(this.loc,function(mod) {
              var devicenames=Object.keys(mod);
              var F=null;
              devicenames.forEach(function(devicename) {
                var dev=mod[devicename];

                if(dev!=null) {
                  M.Self.wrappers.getWrapper(dev).forEach(function(wrapper) {
                    wrapper.wrap(dir,dev);
                    if(wrapper.open instanceof Function) {
                      wrapper.open(dev,dir);
                    }
                  });
                }
              });
            });
          });
        });

        var FileBrowser=M.Class(function C() {
          C.Super(windowing.AppContainer);
          C.Init(function FileBrowser(path)  {

            windowing.AppContainer.call(this);
            this.addClass("FileBrowser");
            var uri=system.uri(path)

            this.files={};
            this.absolutefiles={};
            this.rawfiles={};
            this.windows={};
            var lib=this;

            this.headerbar=new basic.Div("acb");

            this.presentdir=new basic.Div("pwdbar");
            this.presentdir.dirs=[];
            this.dirs={};
            this.pwd=uri.pathname;
            this.root=null;
            this.headerbar.add(this.presentdir);


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
            lib.add(lib.headerbar)
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
                    //TRY TO FIND AN APP TO OPEN THE THING WITH
                    var matches=spoon.match(instance);
                    Object.keys(matches).forEach(function (name) {
                      var match=matches[name];
                      if(match.open instanceof Function) {
                        //var browser=spoon.main.run("fork", system.uri(""));
                        var appname=name;
                        if(typeof match.name=="string") {
                          appname=match.name;

                        spoon.main.run(appname,val);
                          console.debug({opened: match,name:name})
                        }
                      }
                    });
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
              loc = a.hostname+a.path+a.hash;
            } else loc=a;
            var dirs=loc.trim();
            if(dirs[0]=="/") dirs=dirs.slice(1);
            if(dirs[dirs.length-1]=="/") dirs=dirs.slice(0,-1);

            //dirs=dirs.split("/[#/]{1}/")
            dirs=a.href.match(/(.+?(?=[#/]+|$))/g).slice(2)
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
              pdir=pdir+dirs[i];
              (function(tpdir) {

                var dirbutt=new interactive.MomentaryButton(dirs[i],"pwddir dirlink",function() {
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
          C.Def(function addReference(obj,name) {
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


