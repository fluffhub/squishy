Module(function M () {

var domain='fluffbase.com';

console.debug(window.location.tld);

var create=M.Def(function createCookie(name, value, days,domain,path) {
    var expires;

    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    } else {
        expires = "";
    }
  if(domain !==undefined) {
    domain=";domain="+domain
  } else {
   domain=""
  }
  if(path!==undefined) {
   path=";path="+path
  }else {
   path=";path=/";
  }
    document.cookie = escape(name) + "=" + escape(value) + expires + domain+ path;
});

var read=M.Def(function readCookie(name) {
    var nameEQ = escape(name) + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return unescape(c.substring(nameEQ.length, c.length));
    }
    return null;
});

var erase=M.Def(function eraseCookie(name) {
    createCookie(name, "", -1);
});


  M.Class(function C() {
    C.Init(function Cookie(name,value,days) {
      this.name=name;
      if(days!==undefined) {
       this.days=days;
      } else {
       this.days=365;
      }
      if(value!==undefined) {
        this.value=value;
        create(name,value,this.days)
      } else {
        this.value=read(name)
      }

    });
    C.Def(function set(value) {
      this.value=value;
      create(this.name,value,this.days)
    })
  });

});
