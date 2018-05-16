package interfaces

import (
  "fmt"
//  "net/http"
//  "net/http/cgi"
  "os/exec"
//  "strings"
  "io/ioutil"
	"io"
//	"bytes"
//  "log"
  "os"
  "syscall"
//  "github.com/kr/pty"
//  "github.com/gorilla/websocket"
)

const NAMEFOUND = 1
const DIRFOUND = 2
const INFOUND = 4
const OUTFOUND = 8
const PROCFOUND = 16
const PWDFOUND = 32

type StaticShell struct {
	Name string
	pos int64
	leng int64
	Pwd string
	pid int
	status byte

}

func (ss *StaticShell) ReadAll(writer io.Writer) {
	os.Chdir(ss.Name)
	o,_:=os.Open(".out")

	for {
	  bn:=make([]byte,1)
	  n,_:=o.Read(bn)
	  writer.Write(bn)
	  if( n==0 ){
			break
	  }
	}

	o.Close()
	os.Chdir("..")
}
func (ss *StaticShell) ReadTo(writer io.Writer) {
	os.Chdir(ss.Name)
	o,_:=os.Open(".out")
	pos:=ss.pos
	o.Seek(pos,0)

	for {
	  bn:=make([]byte,1)
	  n,_:=o.Read(bn)
	  pos=pos+int64(n)
	  writer.Write(bn)
	  if( n==0 || pos>=ss.leng ){
			break
	  }
	}

	o.Close()
	os.Chdir("..")
}
	
func (ss *StaticShell) Check() byte {
	var status byte = 0
	var fn string
	if files, err := ioutil.ReadDir(ss.Name); err != nil {
		panic(err)
	} else {
		os.Chdir(ss.Name)
		status = DIRFOUND | status
		for _, f := range files {
			fn=f.Name()
			if(fn==".out") {
				status = OUTFOUND | status 
			}
			if(fn==".in") {
				status =  INFOUND | status 
			}
			if(fn==".~") {
				if pwdf,err:=os.Open(".~"); err != nil {
					panic(err)
				} else {
					fmt.Fscanf(pwdf,"%s",ss.Pwd)
					status = PWDFOUND | status 
				} 
			}
			if(fn==".pid") {
				if session_file,err:=os.Open(".pid"); err != nil {
					panic(err)
				} else {
					fmt.Fscanf(session_file,"%d",ss.pid)
					if proc,err:=os.FindProcess(ss.pid); proc != nil {
						status = PROCFOUND | status  
					} else {
						panic(err)
					}
				}
			}
		}
		os.Chdir("..")
	}
	ss.status=status
	return status
}

func (ss *StaticShell) Init(name string) {
	ss.Name=name
	status:=ss.Check()
	if status & DIRFOUND != 0 {
		os.Mkdir(name, 0777)
	}
	os.Chdir(name)
	
	ss.Pwd,_=os.Getwd()

	if status & INFOUND != 0 {
		syscall.Mkfifo(".in",0777) 
	}
	if status & OUTFOUND != 0 {
		out,err:=os.Create(".out")
		panic(err)
		out.Close()
	}
	if status & PROCFOUND != 0 {
		///// Initialize headless shell process
		session := exec.Command("sh","-c","tail -f .in | (sh 2>.err >> .out) & (echo $! > .pid  & pwd > .~)" )
		session.Start()
	}
	os.Chdir("..")
}
func (ss *StaticShell) Destroy() {
	
}
func (ss *StaticShell) Write(data []byte) {
	os.Chdir(ss.Name);
	///// CREATE HOLD & Write the LENGTH of the output file to .pos_name immediately before the command starts
	before_cmd:="touch "+ss.Pwd+"/.hold;\n (wc -c < "+ss.Pwd+"/.out > "+ss.Pwd+"/.pos);\n"
	///// Write the LENGTH of the output file to .len_name immediately after the command starts.
	after_cmd:=";\n (wc -c < "+ss.Pwd+"/.out > "+ss.Pwd+"/.len)";
	///// REMOVE .hold_name thereby triggering the next step
	after_cmd=after_cmd+";\nrm "+ss.Pwd+"/.hold; \n"

	for {
		/////  Wait for any other holds to be removed to continue
		if _, err := os.Stat(".hold"); os.IsNotExist(err) {
			_,err:=os.Create(".hold");
			panic(err)
			break
		}
	}
	/////OPENING THE DEDICATED OUTFILE FOR THIS SH INSTANCE TO WRITE COMMANDS TO
	in,err:=os.OpenFile(".in", os.O_RDWR, 0666)
	panic(err)
	///// WRITING THE COMMAND TO THE INPUT STREAM
	in.Write([]byte(before_cmd))
	in.Write(data)
	in.Write([]byte(after_cmd))
	///// WAIT FOR HOLD (COMMAND HAS FINISHED)
	for {
		if _, err2 := os.Stat(".hold"); os.IsNotExist(err2) {
			_,err:=os.Create(".hold");
			panic(err)
			break
		}
	}

	///// GETTING THE POS BEFORE AND AFTER COMMAND EXECUTION -
	///// THIS IS TO SEEK TO THE CORRECT PLACE  AND READ TO  THE END OF LAST COMMAND IN READWRITE
	if _, err2 := os.Stat(".pos"); os.IsNotExist(err2) { } else {
		posfile,err:=os.OpenFile(".pos",os.O_RDWR,0666)
		fmt.Fscanf(posfile,"%d",ss.pos)
		panic(err)
	}
	if _, err2 := os.Stat(".len"); os.IsNotExist(err2) { } else {
		lenfile,err:=os.OpenFile(".len",os.O_RDWR,0666)
		fmt.Fscanf(lenfile,"%d",ss.leng)
		panic(err)
	}
	os.Remove(".hold")
	os.Chdir("..")
}