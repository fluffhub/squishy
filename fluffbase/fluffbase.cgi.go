// go build -ldflags "-s -w" -o index.cgi cgi.go

package main

import (
  //"fmt"
  //  "os/exec"
  //  "io/ioutil"
  "os"
  //"time"
      "net/http/cgi"
  "net/http"
  //"strings"
  //  "syscall"
  //  "database/sql"
  //"github.com/jinzhu/gorm"
  //_ "github.com/jinzhu/gorm/dialects/postgres"
  ////_"github.com/lib/pq"
  //"github.com/stripe/stripe-go"
     "./actions"
  "encoding/json"
  "./db"
  //"./db/models"
  ////"github.com/stripe/stripe-go/charge"
  //  "github.com/stripe/stripe-go/customer"


)
// Fluffbase stuff
// User login - session generate
// User register
//

// Amazon stuff

// RunInstance

// Stripe stuff

func dump(err error) {
  if(err!=nil) {
    eo,_:=os.OpenFile(".err", os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0666)
    eo.WriteString(err.Error()+"\n")
    eo.Close()
  }
}

//Cashier


func main() {
  //  publishableKey := os.Getenv("PUBLISHABLE_KEY")
  //stripe.Key = os.Getenv("SECRET_KEY")

  logue,err:=os.Create("logue")
  dump(err)

  if err:= cgi.Serve(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    header:=w.Header()
    header.Set("Content-Type", "text/plain; charset=utf-8")
    query:=r.URL.Query()
    DB,err:=db.Opendb()
    dump(err)

    response:=actions.Response{
      Notifications:[]actions.Notification{},
      Responses:[]actions.Return{},
    }
    response,err=actions.GetOrCreateSession(w,r,DB,response)

    dump(err)

    var action string

    params:=make(map[string]string)


    for k:=range query {
      if k=="a" {
        action=query.Get(k)
      } else {
         params[k]=query.Get(k)
      }
    }

    if Action,ok:=actions.Actions[action];ok {
      response,err=Action(w,r,DB,response)
    }

    s,err:=json.Marshal(response)
    dump(err)
    w.Write(s)
    //fmt.Fprintf(w,"{\"domain\":\"%s\",\"address\":\"%s\",\"new\":\"%v\",\"session\":\"%s\"}\n",
    //             Session.Domain,    Session.Address, created, Session.Token)

    //   w.Close()
  })); err != nil {
    dump(err)
  }
  logue.Close()
}


