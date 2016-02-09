Module(function M() {
M.Import("js/chewy/DOM.js",function(DOM) {
M.Import("js/Model.js",function(Model) {
M.Import("js/FaceBrowser.js",function(fb) {
M.Import("js/FrameBrowser.js",function(frb){
M.Import('js/chewy/interactive.js',function (interactive) {
M.Import('js/FaceEditor.js',function(fe) {
M.Import('js/FrameEditor.js',function(fre) {
  var FrameEditor=fre.FrameEditor;
  var TabbedPane=interactive.TabbedPane;
  var User=Model.User;
  var LayoutItem=DOM.LayoutItem;
  M.Class(function C() {
    C.Super(TabbedPane);
    C.Init(function UserBrowser(target,name) {
      TabbedPane.call(this,target);
      var that=this;
      this.faces=[];
      this.products={};
      this.orders=[];
      that.allframes=new frb.FrameBrowser(function(frame) {
        that.newFrame(frame);
      });
      this.user=user=new User(name,function(user) {
        //what user needs?
        if('faces' in user.data) {
          that.faces=user.data.faces;
        }
        else {
          that.faces=user.data.faces=[];
        }
        if('orders' in user.data) {
          that.orders=user.data.orders;
        }
        else {
          that.orders=user.data.orders=[];
        }
        if('frames' in user.data) {
          that.frames=user.data.frames;
        }
        else {
          that.frames=user.data.frames=[];
        }
        if(that.user.data.selectedface>=0) {
          that.selectedface=that.user.data.selectedface;
        }

        new Model.ProductModel().list(function(data) {
          console.debug(data);
          for (var i in data) {
            that.products[data[i].uid]=data[i];
            that.allframes.addThumbnail(data[i],function(frame) {
              that.newFrame(frame);
            });

          }
          that.myframes.products=that.products;
          //	that.allframes.allframes=that.frames;
          //	that.allframes.update(data);
          that.myframes.update(that.user.data.frames);
          that.update();
        });
        that.update();
      });

      this.facebrowser=new fb.FaceBrowser(this.faces,function(face,i) {
        that.user.data.selectedface=i;
        that.selectedface=i;
        that.user.save();
      });

      var FBC=new interactive.Collapsible('fb','My Faces',this.facebrowser);
      FBC.add(new fb.FaceThumbnail({face:{uid:null}},function() {
        that.newFace();
      }));
      //FBC.disable();

      that.myframes=new frb.FrameBrowser(function(frame) {

        that.editFrame(frame);

      });
      var FBC2=new interactive.Collapsible('fb2','All Frames',that.allframes);
      //FBC2.disable();
      that.allframes.parent=that;

      var FBC3=new interactive.Collapsible('fb3','My Frames',that.myframes);
      that.myframes.parent=that;
      var MC=new LayoutItem('div','Main');

      MC.Madd(FBC,FBC2,FBC3);

      this.addTab('face','F',MC,'',function() {

      });
      this.change('face');
      that.frames={};

    });

    C.Mixin({
      update:function() {
        console.debug('updating others');
        this.facebrowser.update(this.faces);
        this.facebrowser.select(this.selectedface);
        this.myframes.update(this.user.data.frames);
      },
      newFace:function() {
        var face={face:{data:{src:'/img/placeholder.jpg'},uid:'New'}};
        this.faces.push(face);
        this.editFace(face);

      },
      editFace:function(face) {
        var that=this;
        var uid=face.face.uid;
        if(uid in that.panes)
        {
          that.faceeditor=that.panes[uid];
        }
        else {
          var FEP=new LayoutItem('div','FaceEditor');
          that.addTab(uid,'IH',FEP);//,'hidden');

          var FE=new fe.FaceEditor(FEP,face,
                                   function(face,i) {
                                     console.debug('edited faces New/old:');
                                     console.debug(face);
                                     console.debug(that.faces[i]);
                                     that.tabset.change('face');
                                     that.facebrowser.update(that.faces);
                                     console.debug(i);
                                     that.selectedface=i;
                                   }
                                  );
          this.faceeditor=FE;
        }
        that.tabset.change(uid);
      },
      finish:function(state) {

      },
      newFrame:function(frame) {
        var that=this;
        console.debug(frame);
        var uid=frame.uid+that.faces[that.selectedface].face.uid;
        if(uid in that.panes)
        {
          this.frameeditor=that.panes[uid];
        }
        else {
          var newFrame={product:frame.uid,face:that.faces[that.selectedface]};
          that.user.data.frames.push(newFrame);
          var FEP=new LayoutItem('div','FrameEditor');
          that.addTab(uid,'FE',FEP);//,'hidden');

          var FE=new FrameEditor(frame.data,
                                 function(state) {
                                   newFrame.box=state.box;
                                 },
                                 newFrame.face
                                );
          FEP.add(FE);
          this.frameeditor=FE;
        }
        that.tabset.change(uid);
      }});
  });

});
});
});
});
});
});
});
});
