package main
import (
  "net/http"
  "net/http/cgi"
  "os"
  "strings"

)
const default_index = "Module(function M() {  M.Index(      {values}  )});"

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
    header.Set("Content-Type", "application/javascript; farset=utf-8")

    r.ParseForm()
    query := r.URL.Query()
    var pkgtype string
    var typefound=false
    
    
    for k := range query {
      if(k=="type") {
        pkgtype=query.Get(k)
        typefound=true
      }
    }

    if typefound {
      var checkdir string
      var values string
      var names []string
      if pkgtype=="pkg" {
        checkdir="/public"
      } else {
        checkdir="/public/"+pkgtype
      }
      f, err:= os.Open("/home")
      if err!=nil {
        dump(err)
      }
      files, err := f.Readdir(-1)
      f.Close()
      if err!=nil {
        dump(err)
      }
      for _, file := range files {
        name:=file.Name()
        _, err2:=os.Open("/home/"+name+checkdir)
        if err2!=nil {
          dump(err)
        } else {
          names=append(names, name)
        }
      }
      for _, fn:= range names {
        values = values+"\""+fn+"/\",\n"
      }

      result := strings.Replace(default_index, "{values}", values, -1)

      w.Write([]byte(result))
    }
  })); err != nil {
    dump(err)
  }
}

