Module(function M() {
M.Import('squishy/DOM.js',function(DOM) {
M.Import('squishy/basic.js',function(basic) {
M.Import('squishy/interactive.js',function(interactive) {
M.Import('squishy/form.js',function(form) {
M.Import('/js/squishy_ext/ImageEditor.js',function(ie) {
M.Import('squishy/graphics.js',function(gfx) {
  var Canvas=gfx.Canvas;
  var Img=basic.Img;
  var ImageEditor=ie.ImageEditor;
  var ImageFileInput=form.ImageFileInput;
  var Form=form.Form;
  var LayoutItem=DOM.LayoutItem;
  var HardCenter=ie.HardCenter;
  var MomentaryButton=interactive.MomentaryButton;
  M.Class(function C() {
    C.Super(LayoutItem);
        C.Mixin({
      onchange:function(image) {

      },
      clickupload:function(e) {
        this.uploadfield.trigger('click');
      },
      getFile:function(F) {
        if(F.target) {
        if(F.target.files && F.target.files[0])
        {
          this.imageReader.readAsDataURL(F.target.files[0]);
        }
        }
        else {
           this.imageReader.readAsDataURL(F);
        }
      },
      handleImageFile:function() {
        //this.tempImg.src=this.imageReader.result;

        this.onchange(this.imageReader);
      },
      startVideo:function() {
        if (navigator.getUserMedia) {
          navigator.getUserMedia({video: true}, this.handle(this.handleVideo), this.videoError);
          this.browserallow=$('<div class="browserallow">Click "Allow" above to enable your camera.</div>');
          $('body').append(this.browserallow);

        }
      },
      videoError:function(e) {
        this.errormessage=$('<div class="browserallow" style="background-color:#FF3300;">There was an error reaching your camera, make sure you are using Google Chrome or Mozilla Firefox</div>');
        this.browserallow.remove();
        $('body').append(this.errormessage);
      },
      killVideo:function() {
        this.lms.stop();
        this.video.pause();
      },
      handleVideo:function(stream) {
        this.hev=true;
        try {
          this.video.src = window.URL.createObjectURL(stream);
        }
        catch(E) {
          this.video.src=window.webkitURL.createObjectURL(stream);
        }
        this.lms=stream;
        this.video.onloaddeddata=this.handle(this.scaleVideo);
      },
      scaleVideo:function() {
        this.tempImg.height=this.video.videoHeight;
        this.tempImg.width=this.video.videoWidth;
      },
      shoot:function() {
        if (this.lms) {
          //this.snapshot.css({width:w+'px',height:h+'px'});
          var canv=document.createLayoutItem("canvas");
          document.body.appendChild(canv);
          var ctx2=canv.getContext('2d');
          canv.width=this.video.videoWidth;
          canv.height=this.video.videoHeight;
          ctx2.drawImage(this.video,0,0,this.video.videoWidth,this.video.videoHeight);
          this.tempImg.src = canv.toDataURL('image/jpeg');
          document.body.removeChild(canv);
        }
      }
    });
    C.Init(function ImageGetter(callback) {
      LayoutItem.call(this,'div','imagegetter');
      var that=this;
      this.Video=new LayoutItem('video','webcamoutput','',{'autoplay':'autoplay'});
      this.video=this.Video.element;

      this.Canvas=new Canvas();
      this.canvas=this.Canvas.element;

      this.placeholder=new Img("http://eyewear.willywagner.com/img/placeholder.jpg",'placeholder','',function() {
        that.placeholder.resize();
      });
      this.face=new Img('/img/face-outline.svg','face-outline','',function() {
        that.face.resize();
      });
      this.face.resize=HardCenter.prototype.resize;

      this.placeholder.resize=HardCenter.prototype.resize;
      this.trigger=new MomentaryButton(' ','icon-camera trigger',this.handle(this.shoot));

      this.camera=new MomentaryButton(' ','icon-camera webcam',this.handle(this.startVideo));

      this.uploadform=new Form('uploader');
      this.uploadfield=new ImageFileInput('imgdata','',this.handle(this.getFile));
      this.uploadbutton=new MomentaryButton(' ','icon-upload ',this.handle(this.clickupload));
      this.uploadform.Madd(this.uploadfield,this.uploadbutton);
      this.options=new LayoutItem('div','imageoptions');
      this.options.Madd(this.camera,this.uploadform);
      this.imageReader=new FileReader();
      this.imageReader.onloadend=this.handle(this.handleImageFile);


      this.Madd(this.Video,this.Canvas,this.placeholder,this.trigger,this.options,this.face);

      if(callback) this.onchange=callback;
      this.tempImg=new Image();
      this.tempImg.onload=this.handle(this.onchange,this.tempImg);
      this.resize();
    });
  });
});
});
});
});
});
});
});
