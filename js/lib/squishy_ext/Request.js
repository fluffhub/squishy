Module(function M() {
  M.Import('squishy/events',function(events) {
var Request=M.Class(function C() {
    C.Init(function Request(requesttype,responsetype) {
      this.requesttype=requesttype || 'URI';
      this.responsetype=responsetype || 'TEXT';
      this.request=new XMLHttpRequest();
    });
	  C.Mixin(events.hasEvents);
    C.Mixin({
      contenttypes:{
        'JSON':'application/json',
        'URI':'application/x-www-form-urlencoded',
        'TEXT':'application/text'
      },
      encoders:{
        'URI':function(data) {
          if(data)
          return Object.keys(data).map(function(pn) {
            return [pn, encodeURIComponent(data[pn])].join('=');
          }).join('&');
         },
        'JSON':function(data) {
          return JSON.stringify(data);
        }
      },
      decoders:{
        'URI':function(data) {
          var vs=data.split('&');
          var ret={};
          var v=[];
          for (var i in vs) {
            v=vs[i].split('=');
            ret[decodeURIComponent(v[0])]=decodeURIComponent(v[1]);
          }
        },
        'JSON':function(data) {
          if(data!='undefined'&&data!='null') return JSON.parse(data);
          else return null;
        },
        'TEXT':function(data) {
          return data;
        }
      },
      setEvents:function() {
      //  this.addEvent("progress", "progress", this.progress, this.request,true);
        this.addEvent("load", "load", this.load, this.request,true);
        this.addEvent("error", "error", this.onerror, this.request,true);
        this.addEvent("abort", "abort", this.abort, this.request,true);
      },
      Get:function(url,data,callback) {
        if(callback) this.onload=callback;
        if(data) url+='?'+this.encoders.URI(data);
        this.request.open("GET",url);
        this.setEvents();
        this.enableEvents();
        this.locked=true;
        this.request.send();
      },
      Post:function(url,data,callback) {
        if(callback) this.onload=callback;
        var params=this.encoders[this.requesttype](data);
        this.setEvents();
        this.enableEvents();
        this.request.open("POST",url);
        this.request.setRequestHeader("Content-type",
              this.contenttypes[this.requesttype]);
        this.locked=true;
        this.request.send(params);

      },
      load:function(e) {
        this.locked=false;
        this.disableEvents();
        var status=e.target.status;
        if(status==200)
          this.onload(this.decoders[this.responsetype](e.target.response));
        else
          this.onerror(e);
        this.finish();
      },
      progress:function(E) {
        console.debug("progress loading:");
        console.debug(E);
      },
      onload:function(data) {

      },
      onerror:function(e) {

      },
      onabort:function(e) {

      },
      onprogress:function(e) {

      },
      finish:function(ev) {
      this.locked=false;
      this.disableEvents();
    }
    });
  });
  });
});
