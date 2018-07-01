/*

Membrane initializes a SH process and pipes commands into and results out of the SH process.
This allows RPC commands to be executed via javascript over a URL.

To use, compile this file and make executable by your web server.  Membrane commands are run
by the web server's user.

*/
package main

import (
  "encoding/base64"
  "net/http"
  "net/http/cgi"
  "os"
  "./interfaces"
)

func dump(err error) {
  if(err!=nil) {
    eo,_:=os.OpenFile(".err", os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0666)
    eo.WriteString(err.Error())
    eo.Close()
  }
}

func main() {
  if err := cgi.Serve(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    header := w.Header()
    header.Set("Content-Type", "text/plain; farset=utf-8")

    r.ParseForm()
    form := r.Form
    query := r.URL.Query()
    var name string
    var namefound=false
    var interface string
    var op string
    var data=""
    var device="static"

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
    if(op=="status") {
      w.Write([]byte("{\"home\":\""+os.Getwd()+"\"}"))
    } else {
      if(namefound) {
         else {
          if Sh,ok:=Interfaces[op]; ok {
            Sh.Init(name, r, w)
            if cmd,err:=base64.URLEncoding.WithPadding(base64.NoPadding).DecodeString(data); err!=nil {
              dump(err)
            } else {
              Sh.Exec(cmd)
            }
          } else {
            // Interface not found
          }
        }
      }
    }
  })); err != nil {
    dump(err)
  }
}

