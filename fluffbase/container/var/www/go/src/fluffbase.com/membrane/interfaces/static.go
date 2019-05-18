package interfaces

import (
  "fmt"
  "os/exec"
  "io/ioutil"
  "io"
  "os"
  "syscall"
  "net/http"
)



type StaticShell struct {
	Name string
	pos int64
	leng int64
	Pwd string
	pid int
	status byte
	log *os.File
	w http.ResponseWriter
	r *http.Request
}

func (ss *StaticShell) Dump(err error) {
	if(err!=nil) {
		ss.log.WriteString(err.Error())
	}
}

func (ss *StaticShell) Log(value string) {
	ss.log.WriteString(value)
}

func (ss *StaticShell) ReadAll(writer io.Writer) {
	out:=ss.getpath(".out")
	o,_:=os.Open(out)
	bn:=make([]byte,1)
	for {
	  n,_:=o.Read(bn)
	  writer.Write(bn)
	  if( n==0 ){
			break
	  }
	}
	o.Close()
}

func (ss *StaticShell) getpath(path string) string {
	if path=="" {
		return ss.Pwd
	}
	return ss.Pwd+"/"+path
}

func (ss *StaticShell) cursorinfo() (int64, int64) {
	var pos int64
	var len int64
	posf:=ss.getpath(".pos")
	if _, err2 := os.Stat(posf); os.IsNotExist(err2) { } else {
		if posfile,err:=os.OpenFile(posf,os.O_RDWR,0666); err!=nil {
			ss.Dump(err)
		}	else {
			fmt.Fscanf(posfile,"%d",&pos)
		}
	}
	lenf:=ss.getpath(".len")
	if _, err2 := os.Stat(lenf); os.IsNotExist(err2) { 
		ss.Log("Len file not found at "+lenf)
	} else {
		if lenfile,err:=os.OpenFile(lenf,os.O_RDWR,0666); err!=nil {
			ss.Dump(err)
		} else {
			fmt.Fscanf(lenfile,"%d",&len)
		}
	}
	//ss.Log(fmt.Sprintf("pos/len: %d %d",pos,len))

	ss.pos=pos
	ss.leng=len
	return pos, len
}

func (ss *StaticShell) ReadTo(writer io.Writer) {
	o,_:=os.Open(ss.getpath(".out"))
	pos, len:=ss.cursorinfo()
	o.Seek(pos,0)
	bn:=make([]byte,1)
	// ss.Log(fmt.Sprintf("Reading from %d to %d\n", pos, len))
	for {
	  n,_:=o.Read(bn)
	  pos=pos+int64(n)
	  writer.Write(bn)
	  if(n==0 || pos>=len) {
		break
	  }
	}
	o.Close()
}
	
func (ss *StaticShell) Check() byte {
	var status byte = 0
	var fn string
	if files, err := ioutil.ReadDir(ss.Name); err != nil {
		return status;
	} else {
		err:=os.Chdir(ss.Name)
		ss.Dump(err)
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
					ss.Dump(err)
				} else {
					fmt.Fscanf(pwdf,"%s",ss.Pwd)
					status = PWDFOUND | status 
				} 
			}
			if(fn==".pid") {
				if session_file,err:=os.Open(".pid"); err != nil {
					ss.Dump(err)
				} else {
					fmt.Fscanf(session_file,"%d",ss.pid)
					if proc,err:=os.FindProcess(ss.pid); proc != nil {
						status = PROCFOUND | status  
					} else {
						ss.Dump(err)
					}
				}
			}
		}
		os.Chdir("-")
	}
	ss.status=status
	return status
}

func (ss *StaticShell) Init(name string, w http.ResponseWriter, r *http.Request) {
	ss.Name=name
	ss.w=w
	ss.r=r
	if log,err:=os.OpenFile(name+"_log", os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0666);err!=nil {
		panic(err)
	} else {
		ss.log=log
	}
	
	status:=ss.Check()
	if (status & DIRFOUND) == 0 { 
		if err:=os.Mkdir(name, 0777); err!=nil {
			ss.Dump(err)
		}
		ss.Log("Created directory "+ss.Name)
	}
	os.Chdir(name)
	if pwd,err:=os.Getwd(); err!=nil {
		ss.Dump(err)
	} else {
		ss.Pwd=pwd
	}
	if (status & INFOUND) == 0 {
		if err:=syscall.Mkfifo(".in",0777); err!=nil {
			ss.Dump(err)
			
		} else {
			ss.Log("Fifo Created\n")
		}
	}
	if (status & OUTFOUND) == 0 {
		if out,err:=os.Create(".out"); err!=nil {
			ss.Dump(err)
		} else {	
			out.Close()
			ss.Log("Output Created\n")
		}	
	}
	if (status & PROCFOUND) == 0 {
		///// Initialize headless shell process
		session := exec.Command("sh","-c","tail -f .in | (sh 2>.err >> .out) & (echo $! > .pid  & pwd > .~)" )
		session.Start()
		ss.Log("Process created\n")
	}
	os.Chdir("-")
}

func (ss *StaticShell) Destroy() {
	
}

func (ss *StaticShell) Await(interrupt bool) {
	hold:=ss.getpath(".hold")

	for {
		/////  Wait for any other holds to be removed to continue
		if _, err2 := os.Stat(hold); os.IsNotExist(err2) {
			if(interrupt) {
				if _,err:=os.Create(hold); err!=nil {
					ss.Dump(err)
				}
			}
			break
		}
	}
}

func (ss *StaticShell) Unhold() {
	os.Remove(ss.getpath(".hold"))
}

func (ss *StaticShell) Exec(data []byte) {
	///// CREATE HOLD & Write the LENGTH of the output file to .pos_name immediately before the command starts
	before_cmd:="touch "+ss.Pwd+"/.hold;\n (wc -c < "+ss.Pwd+"/.out > "+ss.Pwd+"/.pos);\n"
	///// Write the LENGTH of the output file to .len_name immediately after the command starts.
	after_cmd:=";\n (wc -c < "+ss.Pwd+"/.out > "+ss.Pwd+"/.len)";
	///// REMOVE .hold_name thereby triggering the next step
	after_cmd=after_cmd+";\nrm "+ss.Pwd+"/.hold; \n"

	ss.Await(true)

	/////OPENING THE DEDICATED OUTFILE FOR THIS SH INSTANCE TO WRITE COMMANDS TO
	if in,err:=os.OpenFile(ss.getpath(".in"), os.O_RDWR, 0666); err!=nil {
		ss.Dump(err)
	} else {
	///// WRITING THE COMMAND TO THE INPUT STREAM
		in.Write([]byte(before_cmd))
		in.Write(data)
		in.Write([]byte(after_cmd))
		in.Close()
		ss.Await(false)
		ss.ReadTo(ss.w)
	}
}

func init() {
	Shells["static"]=&StaticShell{}
}