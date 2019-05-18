package interfaces

import(
	"fmt"
	// "os/exec"
	"io/ioutil"
	"io"
	"os"
	"time"
	"net/http"
	// "syscall"
	"github.com/gorilla/websocket"
	// "github.com/kr/pty"
	// zmq "github.com/pebbe/zmq4/draft"
	
)

var (
	// addr    = flag.String("addr", "127.0.0.1:8080", "http service address")
	cmdPath string
)

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Maximum message size allowed from peer.
	maxMessageSize = 8192

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Time to wait before force close on connection.
	closeGracePeriod = 10 * time.Second
)


var upgrader = websocket.Upgrader{} // use default options

const PORTFOUND = 64

type TtyShell struct {
	Name string
	Pwd string
	pid int
	port int
	status byte
	log *os.File
	w http.ResponseWriter
	r *http.Request
	pos int64
	leng int64
}

const default_port = 3000

func (ss *TtyShell) Dump(err error) {
	if(err!=nil) {
		ss.log.WriteString(err.Error())
	}
}
func (ss *TtyShell) Log(value string) {
	ss.log.WriteString(value)
}
func (ss *TtyShell) ReadAll(writer io.Writer) {
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
func (ss *TtyShell) getpath(path string) string {
	if path=="" {
		return ss.Pwd
	}
	return ss.Pwd+"/"+path
}
func (ss *TtyShell) cursorinfo() (int64, int64) {
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
	ss.Log(fmt.Sprintf("pos/len: %d %d",pos,len))

	ss.pos=pos
	ss.leng=len
	return pos, len
}
func (ss *TtyShell) ReadTo(writer io.Writer) {
	o,_:=os.Open(ss.getpath(".out")) 
	pos, len:=ss.cursorinfo()
	o.Seek(pos,0)
	bn:=make([]byte,1)
	ss.Log(fmt.Sprintf("Reading from %d to %d\n", pos, len))
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

func (ss *TtyShell) Check() byte {
	var status byte = 0
	var fn string

	if _,err:=os.Open(".tty"); err!=nil{
		return status;
	} else {
		status = INFOUND | status
	}
	if files, err := ioutil.ReadDir(ss.Name); err != nil {
		return status;
	} else {
		if err:=os.Chdir(ss.Name); err != nil {
			return status;
		} else {
			status = DIRFOUND | status
			for _, f := range files {
				fn=f.Name()
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
				if(fn==".port") {
					if port_file,err:=os.Open(".port"); err != nil {
						ss.Dump(err)
					} else {
						fmt.Fscanf(port_file,"%d",ss.port)
						status = PORTFOUND | status
					}
				}
			}
			os.Chdir("-")
		}
	}
	ss.status=status
	return status
}

func (ss *TtyShell) Init(name string, w http.ResponseWriter, r *http.Request) {
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
	if (status & PROCFOUND) == 0 {
		
	}
	os.Chdir("-")
}

func (ss *TtyShell) Destroy() {
	
}

func (ss *TtyShell) Await(interrupt bool) {
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

func (ss *TtyShell) Unhold() {
	os.Remove(ss.getpath(".hold"))
}

func (ss *TtyShell) Exec(data []byte) {
	//
}

func init() {
	Shells["tty"]=&TtyShell{}
}