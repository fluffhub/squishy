package membrane

import (
  "fmt"
  "net/http"
  "net/http/cgi"
  "os/exec"
  "strings"
  "io/ioutil"
	"io"
	"bytes"
  "log"
  "os"
  "syscall"
  "github.com/kr/pty"
  "github.com/gorilla/websocket"
)

const NAMEFOUND = 1
const DIRFOUND = 2
const INFOUND = 4
const OUTFOUND = 8
const PROCFOUND = 16
const PWDFOUND = 32

type StaticShell struct {
	name string,
	pos int64, 
	leng int64,
	pwd string,
	pid int64,
	status byte

}

func (ss *StaticShell) ReadAll(writer io.Writer) {
	os.Chdir(ss.name)
	o,_:=os.Open(".out")
	for {
	  bn:=make([]byte,1)
	  n,_:=o.Read(bn)
	  pos=pos+int64(n)
	  writer.Write(bn)
	  if( n==0 ){
			break
	  }
	}

	o.Close()
	os.Chdir("..")
}
func (ss *StaticShell) ReadTo(writer io.Writer) {
	os.Chdir(ss.name)
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
	var session *exec.Cmd
	var fn string
	if files, err := ioutil.ReadDir(ss.name); err != nil {
		dump(err)
	} else {
		os.Chdir(ss.name)
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
					dump(err)
				} else {
					fmt.Fscanf(pwdf,"%s",ss.pwd)
					status = PWDFOUND | status 
				} 
			}
			if(fn==".pid") {
				if session_file,err:=os.Open(".pid"); err != nil {
					dump(err)
				} else {
					fmt.Fscanf(session_file,"%d",ss.pid)
					if proc,err:=os.FindProcess(ss.pid); proc != nil {
						status = PROCFOUND | status  
					} else {
						dump(err)
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
	ss.name=name
	status:=ss.Check()
	if status & DIRFOUND != 0 {
		os.Mkdir(name)
	}
	os.Chdir(name)
	
	ss.pwd,_=os.Getwd()

	if status & INFOUND != 0 {
		syscall.Mkfifo(".in",0777) 
	}
	if status & OUTFOUND != 0 {
		out,err:=os.Create(".out")
		dump(err)
		out.Close()
	}
	if status & PROCFOUND != 0 {
		///// Initialize headless shell process
		session = exec.Command("sh","-c","tail -f .in | (sh 2>.err >> .out) & (echo $! > .pid  & pwd > .~)" )
		session.Start()
	}
	os.Chdir("..")
}
func (ss *StaticShell) Destroy() {
	
}
func (ss *StaticShell) Write(data byte[]) {
	os.Chdir(ss.name);
	///// CREATE HOLD & Write the LENGTH of the output file to .pos_name immediately before the command starts
	before_cmd:="touch "+ss.pwd+"/.hold;\n (wc -c < "+ss.pwd+"/.out > "+ss.pwd+"/.pos);\n"
	///// Write the LENGTH of the output file to .len_name immediately after the command starts.
	after_cmd:=";\n (wc -c < "+ss.pwd+"/.out > "+ss.pwd+"/.len)";
	///// REMOVE .hold_name thereby triggering the next step
	after_cmd=after_cmd+";\nrm "+ss.pwd+"/.hold; \n"

	for {
		/////  Wait for any other holds to be removed to continue
		if _, err := os.Stat(".hold"); os.IsNotExist(err) {
			_,err:=os.Create(".hold");
			dump(err)
			break
		}
	}
	/////OPENING THE DEDICATED OUTFILE FOR THIS SH INSTANCE TO WRITE COMMANDS TO
	in,err:=os.OpenFile(".in", os.O_RDWR, 0666)
	dump(err)
	///// WRITING THE COMMAND TO THE INPUT STREAM
	in.Write([]byte(before_cmd))
	in.Write(data)
	in.Write([]byte(after_cmd))
	///// WAIT FOR HOLD (COMMAND HAS FINISHED)
	for {
		if _, err := os.Stat(".hold"); os.IsNotExist(err) {
			_,err:=os.Create(".hold");
			dump(err)
			break
		}
	}
	dump(err2)
	///// GETTING THE POS BEFORE AND AFTER COMMAND EXECUTION -
	///// THIS IS TO SEEK TO THE CORRECT PLACE  AND READ TO  THE END OF LAST COMMAND IN READWRITE
	if _, err2 := os.Stat(".pos"); os.IsNotExist(err2) { } else {
		posfile,err:=os.OpenFile(".pos",os.O_RDWR,0666)
		fmt.Fscanf(posfile,"%d",ss.pos)
		dump(err)
	}
	if _, err2 := os.Stat(".len"); os.IsNotExist(err2) { } else {
		lenfile,err:=os.OpenFile(".len",os.O_RDWR,0666)
		fmt.Fscanf(lenfile,"%d",ss.leng)
		dump(err)
	}
	os.Remove(".hold")
	os.Chdir("..")
}