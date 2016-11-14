
package main

import (
 // "fmt"
 // "net/http"
 // "net/http/cgi"
  "os/exec"
 // "strings"
 // "bufio"
 // "io"
 // "os"
)

func main() {
name:="_"
        exec.Command("mkfifo",".in_"+name).Start()
        exec.Command("mkfifo",".out_"+name).Start()

        piper := exec.Command("cat",".in_"+name)
        session := exec.Command("sh")
       // outfile:=os.Open(".out_"+name)
  pipe,err:=session.StdinPipe()
  if(err!=nil) {
  }
        session.Stdout=pipe
       // session.Stdout=bufio.NewWriter(outfile)
        session.Start()
        piper.Start()
        }