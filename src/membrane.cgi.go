/*

Membrane initializes a SH process and pipes commands into and results out of the SH process.
This allows RPC commands to be executed via javascript over a URL.

To use, compile this file and make executable by your web server.  Membrane commands are run
by the web server's user.

*/
package membrane

import (
  "fmt"
  "net/http"
  "net/http/cgi"
  "os/exec"
  "strings"
  "io/ioutil"
  "io"
  "log"
  "bytes"
  "os"
  "syscall"
  "github.com/kr/pty"
  "github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{} // use default options

func dump(err error) {
  if(err!=nil) {
    eo,_:=os.OpenFile(".err", os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0666)
    eo.WriteString(err.Error())
    eo.Close()
  }
}



func main() {
  logue,err:=os.Create("logue")
  dump(err)

  if err := cgi.Serve(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    header := w.Header()
    header.Set("Content-Type", "text/plain; charset=utf-8")

    r.ParseForm()
    form := r.Form
    query := r.URL.Query()
    var name string
    var namefound=false
    var op string
    var data=""
    if name=query.Get("name"); name!="" {
      //try to find name in cookie
      for _, cookie := range r.Cookies() {
        if cookie.Name=="session_id" {
          name=cookie.Value;
          namefound=true
        }
      }
    }

    for k := range query {
      if(k=="id") {
        name=query.Get(k)
        namefound=true

      }
      if(k=="op") {
        op=query.Get(k)
      }
      if(k=="cmd") {
        data=query.Get(k)
      }
    }
    for k := range form {
      if(k=="in") {
        data=form.Get(k)
      }
    }

    if(op=="tty") {
      ttyname:="tty"
      if(namefound) {
        ttyname=name
      }
      
    } else if(namefound) {
      var Sh = StaticShell{}

      Sh.Init(name)

      if(op=="r") {
        Sh.ReadAll(w)
      }
      if(op=="status") {
        w.Write([]byte("{\"home\":\""+ss.pwd+"\"}"))
      }
      if(op=="w") {
        cmd:=data
        cmd=bytes.Replace(cmd,"¶",";",-1)
        cmd=bytes.Replace(cmd,"Ɛ","&",-1)
        cmd=bytes.Replace(cmd,"¬","\n",-1)
        Sh.Write(cmd)
        Sh.ReadTo(w)
      }
    }
  })); err != nil {
    dump(err)
  }
  logue.Close()
}

