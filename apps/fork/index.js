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
      var main=live.DeviceManager
      var theme={}

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
          this.references={};
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
            dir.click.call(dir,dir.loc);
            e.stopPropagation();
          });
          this.name=name;
          //this.add(new basic.Span(name))
          this.env=env;
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
          live.DeviceManager.retrieve(this.loc.href,function(files) {
            var devicenames=Object.keys(files);
            devicenames.forEach(function(devicename) {
              var dev=files[devicename];

              if(dev!=null) {
                var filenames=Object.keys(dev.contents);

                filenames.forEach(function(filename) {
                  var file = dev.contents[filename]

                  if(filename in dir.contents) {
                    dir.contents[filename].addReference(devicename,file);
                  } else {
                    var F;
                    if(file instanceof system.Dir) {
                      var str;
                      if(dir.loc.href.slice(-1)=="/") str=dir.loc.href+file.name
                      else str=dir.loc.href+"/"+file.name;
                      var dirloc=system.uri(str);

                      F=new M.Self.Dir(filename,dirloc,dir.env,function() {
                        dir.click.call(dir,dirloc);
                      });
                      F.addClass("dirlink");


                    } else {
                      //is a file

                      F=new M.Self.File(filename,dir.loc+filename,dir.env,function() {
                        //console.debug({openfile: file })
                        console.debug(this.loc);
                        var fileeditor=spoon.main.openFile(this.loc);
                        console.debug(fileeditor);
                      });


                    }
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
          if(val instanceof Object) {
            path=val.hostname+val.pathname
          } else path=val;
          var dirs=path.split("/")
          if(lib.dirs[path] instanceof Object) {

          } else {

            lib.dirs[path]=new Dir(dirs[dirs.length],val,lib.session,function(dirloc) {
              lib.cd(dirloc)
            });
            lib.add(lib.dirs[path])
            //if(
            lib.dirs[path].load();
            lib.dirs[path].hide()
          }
          Object.keys(lib.dirs).forEach(function(d) {
            lib.dirs[d].hide()
          });
          lib.dirs[path].show();
          lib.setDir(val);
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


    });
});
