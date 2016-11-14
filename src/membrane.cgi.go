// go build -ldflags "-s -w" -o index.cgi cgi.go

package main

import (
  "fmt"
  "net/http"
  "net/http/cgi"
  "os/exec"
  "strings"
  // "bufio"
  "io/ioutil"
  "os"
  //"encoding/json"
  //"io"
  //  "math/rand"
  //  "strconv"
)
func dump(err error) {
  if(err!=nil) {
    eo,_:=os.OpenFile(".err", os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0666)
    eo.WriteString(err.Error())
    eo.Close()
  }
}
func Readwrite(name string,o *os.File, writer http.ResponseWriter)       {
  log1,_:=os.Create("log1")
  var pos int64
  pos=0
  var posfile *os.File
  var err error
  if _, err2 := os.Stat(".pos_"+name); os.IsNotExist(err2) {


  } else {
    posfile,err=os.OpenFile(".pos_"+name,os.O_RDWR,0666)   
    fmt.Fscanf(posfile,"%d",&pos)
    o.Seek(pos,0)
  }
  dump(err)
  for {
    bn:=make([]byte,128)
    n,_:=o.Read(bn)
    pos=pos+int64(n)
    writer.Write(bn)
    log1.Write(bn)
    if( n==0 ){ //log1.Write([]byte("BONG"))
      /*     oo,_:=os.Open(".session2_"+name)
pid:=-1


fmt.Fscanf(oo,"%d",&pid)
proc,err:=os.FindProcess(pid)
dump(err) 
if(proc!=nil) {
proc.Signal(os.Interrupt)
}
*/
      break
    } 
    // if(bn[0]==byte(027)&&bn[1]==byte(03)&&bn[2]==byte(04)) {
    // log1.Write([]byte("BING"))

    //  break
    //}
    //else {

    // }
    //}
    //writer.Write([]byte("."))
    //logue.Write([]byte("ok"))
  }
  posfile,err=os.Create(".pos_"+name)
  fmt.Fprintf(posfile,"%d",pos)
  posfile.Close()
  o.Close()
  writer.Write([]byte("\n\n"))
  //writer.Close()
}
func get_or_create_proc(name string) {
  //

  files, _ := ioutil.ReadDir("./")
  outfound:=false
  infound:=false
  procfound:=false
  var session *exec.Cmd
  //var session *os.Process
  for _, f := range files {
    fn:=f.Name()
    if(fn==".out_"+name) {
      outfound=true
    }
    if(fn==".in_"+name) {
      infound=true 
    }
    if(fn==".session_"+name) {
      sesh,err:=os.Open(".session_"+name)

      dump(err) 
      pid:=-1


      fmt.Fscanf(sesh,"%d",&pid)
      proc,err:=os.FindProcess(pid)
      dump(err) 
      if(proc!=nil) {
        procfound=true
      }

    }
  }

  if(!(infound && outfound)) {

    if(infound) {     
    } else {
      exec.Command("mkfifo",".in_"+name).Start()    
      infound=true;
    }
    if(outfound) {
    } else {
      // exec.Command("mkfifo",".out_"+name).Start()
      _,err:=os.Create(".out_"+name)
      dump(err)
      outfound=true;
    }
  }
  if(!procfound){
    //session= exec.Command("sh","-c","(while true ; do  cat .in_"+name+";  done) | (sh  > .out_"+name+") & echo $! > .session2_"+name)
    session= exec.Command("sh","-c","tail -f .in_"+name+" | (sh  >> .out_"+name+") & echo $! > .session2_"+name)
    //(while true ; do  (cat .in_poop; echo -e \"\\4\") ;  done) | (sh  > .out_poop) ;echo $! > .session2_poop
    // session= exec.Command("sh","-c","cat .in_"+name+" | (sh  > .out_"+name+")")
    // var attr  os.ProcAttr
    //argv:=[]string{"-c","cat .in_"+name+" | (/bin/bash > .out_"+name+")"}
    // session,err:=exec.("/bin/bash",argv,&attr)
    //dump(err)
    //go session.Wait()
    session.Start()
    // exec.Command("touch",".session_"+name).Start()
    sesh,err:=os.Create(".session_"+name)
    dump(err) 
    //fmt.Fprintf(sesh,"%d",session.ProcessState.Pid())
    fmt.Fprintf(sesh,"%d",session.Process.Pid)




    //sesh.Flush()
    sesh.Close()
  }
}
func flush_pipe(f string) {
  //	println("Thread2: About to force the reading of pipe to finish by opening the pipe O_RDWR")
  //	println("Thread2: Press 'enter' when you're ready")

  // we're not even _doing_ anything (including closing) with the returned file
  _, err := os.OpenFile(f, os.O_RDWR, os.ModeNamedPipe)
  dump(err)
}
func main() {

  //args := os.Args
  logue,err:=os.Create("logue")
  dump(err)
  // if args!=nil  { 
  // }
  //  else {
  //  fmt.Println(args)


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
    if(namefound) {
      get_or_create_proc(name)

      if(op=="r") {
        out,err:=os.Open(".out_"+name)

        //out,err:=os.OpenFile(".out_"+name, os.O_RDONLY, 0666)
        dump(err) 

        //for { 

        Readwrite(name,out,w)
        //go flush_pipe(".out_"+name)
        //w.Write([]byte("\n\n"))
        //
        out.Close()


      } else if(op=="w") {
        strstr:=data
 


        //substitute chars for uri encoding
        strstr=strings.Replace(strstr,"¶",";",-1)
        strstr=strings.Replace(strstr,"Ɛ","&",-1)
        strstr=strings.Replace(strstr,"¬","\n",-1)

        //strstr="touch .hold_"+name+";\n"+strstr
        //strstr=strstr+"\necho -e \"\\027\\03\\04\"\n"

        //this line is executed after the individual command
        // to remove .hold_name thereby triggering the next step    
        strstr=strstr+";\nrm .hold_"+name+";\n"


        // out,err:=os.OpenFile(".out_"+name, os.O_RDWR, 0666)
        //         dump(err)


        // func(cmd string) {
        //  err:=os.Remove(".out_"+name)
        // dump(err)
        for {
          if _, err := os.Stat(".hold_"+name); os.IsNotExist(err) {
            break
          }
        }
        f,_:=os.Create(".hold_"+name)
        f.Close()
        in,err:=os.OpenFile(".in_"+name, os.O_RDWR, 0666)

        dump(err)
        logue.Write([]byte(strstr))
        in.Write([]byte(strstr))
        //in.Close()
        //            flush_pipe(".in_"+name)
        //}(strstr)
        go flush_pipe(".in_"+name)
        for {
          if _, err := os.Stat(".hold_"+name); os.IsNotExist(err) {
            break
          }
        }
        out,err:=os.Open(".out_"+name)
        Readwrite(name,out,w)
        //os.Remove(".out_"+name)
        // w.Write([]byte("202 PROCESSING"))

        // in.Close()
        //ps:=exec.Command("
        //dump(err)
        //Readwrite(name,out,w)


        //for { 

        w.Write([]byte("\n\n"))
        //
        //    out.Close()

      }
    }
  })); err != nil {
    dump(err)
  }
  // }
  logue.Close()

}

