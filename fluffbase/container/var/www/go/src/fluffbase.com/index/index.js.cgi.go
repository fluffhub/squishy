package main
import (
  "net/http"
  "net/http/cgi"
  "os"
  "strings"
  )
const default_index = `/*
 * Squishy AutoIndex
 * 
 {info} 
 */

Module(function M() {  
  M.Index(      
    {values}  
  );
});
`

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

    var pkgtype string
    var typefound=false
    var result string
    var info string
    var values string
    Querystring := os.Getenv("QUERY_STRING")
    if Querystring!="" {
      r.URL.RawQuery=Querystring
      info = info + " * Qs: "+Querystring+"\n"
    }

    r.ParseForm()

    info = info + " * Path: "+r.URL.Path+"\n"
    for k, v := range r.Form {
      info = info + " * k,v:"+k+" "+strings.Join(v,"")+"\n"
      if(k=="type") {
        pkgtype=strings.Join(v,"")
        typefound=true
      }
    }

    if typefound {

      var checkdir string
      var names []string

      info=info+" * Type Found: "+pkgtype+"\n"
      if pkgtype=="pkg" {
        checkdir="/public"
      } else {
        checkdir="/public/"+pkgtype
      }
      
      info = info+" * checdir Found: "+checkdir+"\n"
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

      info = info+" *  "+name+"\n"
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
    }
    result = strings.Replace(default_index, "{values}", values, -1)
    result = strings.Replace(result, "{info}", info, -1)
    w.Write([]byte(result))

  })); err != nil {
    dump(err)
  }
}

