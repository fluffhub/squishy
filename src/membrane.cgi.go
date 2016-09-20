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
  "syscall"
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
func Readwrite(name string,writer http.ResponseWriter, pos int64,leng int64)       {
  log1,_:=os.Create("log1")
  o,_:=os.Open(".out_"+name)
  o.Seek(pos,0)
  for {
    bn:=make([]byte,1)
    n,_:=o.Read(bn)
    pos=pos+int64(n)
    writer.Write(bn)
    log1.Write(bn)
    if( n==0 || pos>leng ){ 
      break
    }
    //if(bn[0]==byte(027)&&bn[1]==byte(03)&&bn[2]==byte(04)) {
    //log1.Write([]byte("BING"))
    //break
    //}
  }
  posfile,err:=os.Create(".pos_"+name)
  dump(err)
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
  var pwd string
  for _, f := range files {
    fn:=f.Name()
    if(fn==".out_"+name) {
      outfound=true
    }
    if(fn==".in_"+name) {
      infound=true
    }
    if(fn==".~_"+name) {
      pwdf,err:=os.Open(".~_"+name)
      dump(err)
      fmt.Fscanf(pwdf,"%s",&pwd)

    }
    if(fn==".session2_"+name) {
      sesh,err:=os.Open(".session2_"+name)

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
      
      /////THIS ILLUSTRATES THE DIFFERENCE BETWEEN GO NATIVE SYSTEM CALLS AND ARBITRARY SYSTEM CALLS
      ///// IT IS PROBABLY BEST TO AVOID ARBITRARY SYSTEM CALLS - THEY WOULD NOT NECESSARILY BE CROSS PLATFORM COMPATIBLE
      
      //exec.Command("mkfifo",".in_"+name).Start() /////THIS IS AN ARBITRARY SYSTEM CALL
      syscall.Mkfifo(".in_"+name,0777) ///// THIS IS A GO NATIVE SYSTEM CALL
      
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
    
    /////THIS EXECUTES SH -C WHICH TAKES A STRING REPRESENTING THE CONSOLE COMMANDS TO RUN USING ARBITRARY SYSTEM CALLS.  
    ///// I ONLY USED THIS AS A CRUTCH TO QUICKLY ADD PIPES AND DELIMITERS TO THE COMMAND STRING.
    ///// THIS COULD BE RE-WRITTEN IN NATIVE GO SYSTEM CALLS USING THE PIPE ATTRIBUTES TO PROCESS OBJECTS.  BUT IT WOULD BE A LOT LONGER.
    /////RUNNING THIS ON *NIX IS TRIVIAL, AND ON WINDOWS IT REQUIRES INSTALLING SOME BASH CLONE, BUT GO NATIVE CALLS WOULD BE MORE TOTALLY CROSS PLATFORM
    
    session= exec.Command("sh","-c","tail -f .in_"+name+" | (sh  2>&1 >> .out_"+name +" ) & (echo $! > .session2_"+name+"  & pwd > .~_"+name+")" )
    // sh -c "tail -f .in_name | (sh +e  >> .out_name * 2>> .err_name) & (echo $! > .session2_name)  & pwd > .~_name"
    
    ///// POSSIBLE ALTERNATIVE SHELL INSTANCE CREATION STRING:
    //session= exec.Command("sh","-c","(while true ; do  cat .in_"+name+";  done) | (sh  > .out_"+name+") & echo pwd > .in_"+name  &echo $! > .session2_"+name)
    ///// THE DRAWBACK TO THIS IS THAT YOU HAVE AN EXTRA PROCESS RUNNING ALL THE TIME - TAIL -F WILL DO THE SAME THING WITH 1 PROCESS
    
    
    ///// THIS SHELL COMMAND WILL RUN UNTIL EOF/INPUT TRUNCATED, USE TAIL -F INSTEAD OF CAT
    // session= exec.Command("sh","-c","cat .in_"+name+" | (sh  > .out_"+name+")")
    
    session.Start()
    
    
    ///// THESE ARE A COUPLE OF DIFFERENT WAYS TO GET THE RESULTING PROCESS PID.  
    ///// WITH THE CURRENT VERSION OF SHELL INSTANCE CREATION YOU DON'T NEED TO DO THIS.
    ///// IT IS REPLACED BY THE ADDITIONAL ECHO STATEMENT ABOVE
    
    
    // exec.Command("touch",".session_"+name).Start()
    //sesh,err:=os.Create(".session_"+name)
    //dump(err)
    //fmt.Fprintf(sesh,"%d",session.ProcessState.Pid())
    //fmt.Fprintf(sesh,"%d",session.Process.Pid)
    //sesh.Flush()
    //sesh.Close()
    
  }
}
func flush_pipe(f string) {
  ///// I AM NOT SURE WHETHER THIS IS ACTUALLY NECESSARY
  
  

  // we're not even _doing_ anything (including closing) with the returned file
  _, err := os.OpenFile(f, os.O_RDWR, os.ModeNamedPipe)
  dump(err)
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
    if(namefound) {
      get_or_create_proc(name)

      if(op=="r") {
        out,err:=os.Open(".out_"+name)

        dump(err)


        Readwrite(name,w,0,100000)

        out.Close()


      } else if(op=="w") {
        cmd:=data



        /////substitute chars for uri encoding
        cmd=strings.Replace(cmd,"¶",";",-1)
        cmd=strings.Replace(cmd,"Ɛ","&",-1)
        cmd=strings.Replace(cmd,"¬","\n",-1)
        
        
        /////LOADING THE PWD FILE GENERATED IN THE SHELL INSTANCE CREATION SCRIPT
        pwdfile,err2:=ioutil.ReadFile(".~_"+name);
        pwd:=string(pwdfile[0:len(pwdfile)-1]);
        dump(err2)
        
        /////HERE WE CAN "WRAP" THE EXEC CODE IN COMMANDS TO CREATE AND REMOVE THE .HOLD FILE
        /////NOTE THAT THIS MUST REFER TO THE ABSOLUTE POSITION OF WHERE THIS COMMAND STARTED - 
        /////THATS WHY WE HAVE THE PWD FILE

        cmd="touch "+pwd+"/.hold_"+name+";\n"+cmd
        
        /////this line is executed after the individual command
        ///// to add a command end delimiter to the end of the commadn output
        
        /////this may be a solution to the race condition if i can figure out how to catch the eof string on the output
        cmd=cmd+";\n (wc -c < "+pwd+"/.out_"+name+" > "+pwd+"/.len_"+name+")";
        
        ///// to remove .hold_name thereby triggering the next step
        cmd=cmd+";\nrm "+pwd+"/.hold_"+name+"; \n"

        
        
        /////THIS IS WHERE THE RACE CONDITION LIES.
        ///// WHEN YOU RUN MULTIPLE COMMANDS IN QUICK SUCCESSION, THE FINISHING OF 1 COMMAND WILL START THE EXECUTION OF ALL FOLLOWING COMMANDS,
        ///// INSTEAD OF EXECUTING AS A QUEUE,
        ///// AND THE OUTPUT WILL BE OUT OF SYNC and include multiple command results at once.
        ///// SO THIS WILL NEED TO BE IMPLEMENTED INTO A QUEUE SOMEHOW
        ///// SEE THE READWRITE METHOD AND POSFILE BELOW FOR MORE INFO ON THAT
        for {
          if _, err := os.Stat(".hold_"+name); os.IsNotExist(err) {
            _,err:=os.Create(".hold_"+name);
            dump(err)
            break
          }
        }
        
        ///// GETTING THE POS AT THE TIME OF COMMAND EXECUTION - THIS IS TO RECORD THE CURSOR POSITION OF THE OUTPUT FILE AT THE BEGINNING OF THIS COMMAND
        ///// BECAUSE THE UOUTPUT RESULT OF THE COMMAND WILL BE PARSED USING THE CURSOR POSITION
        ///// WHAT REALLY NEEDS TO BE ADDED IS A END DELIMITER FOR THE COMMANDS
        var pos int64
        pos=0
        var posfile *os.File
        var err error
        if _, err2 := os.Stat(".pos_"+name); os.IsNotExist(err2) {


        } else {
          posfile,err=os.OpenFile(".pos_"+name,os.O_RDWR,0666)
          fmt.Fscanf(posfile,"%d",&pos)
          
        }
        dump(err)
 

        /////OPENING THE DEDICATED NAMED PIPE FOR THIS SH INSTANCE TO WRITE
        in,err:=os.OpenFile(".in_"+name, os.O_RDWR, 0666)
        
        
        in.Write([]byte(cmd))
        
        
        
        logue.Write([]byte(cmd))
        
        dump(err)
        
        
        /////WAITING FOR COMMAND COMPLETION, ANOTHER RACE CONDITION WHEN MULTIPLE COMMANDS ARE SENT IN QUICK SUCCESSION
        for {
          if _, err := os.Stat(".hold_"+name); os.IsNotExist(err) {
            var leng int64
            leng=0
            var lenfile *os.File
            var err error
            if _, err2 := os.Stat(".len_"+name); os.IsNotExist(err2) {


            } else {
              lenfile,err=os.OpenFile(".len_"+name,os.O_RDWR,0666)
              fmt.Fscanf(lenfile,"%d",&leng)

            }
            dump(err)
            Readwrite(name,w,pos,leng)
            break
          }
        }
        
        /////WRITING THE RESULT STRING TO THE HTTP OUTPUT
        

        
        /////FINISHING THE HTTP RESPONSE
        w.Write([]byte("\n\n"))

      }
    }
  })); err != nil {
    dump(err)
  }
  logue.Close()

}

