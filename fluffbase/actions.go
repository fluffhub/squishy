// go build -ldflags "-s -w" -o index.cgi cgi.go

package actions
import (
  "fmt"

  "time"
  "crypto/sha256"

  "strings"
  "math/rand"
  "net/http"

  "../db/models"
  "github.com/jinzhu/gorm"
  _ "github.com/jinzhu/gorm/dialects/postgres"
)

func token(salt string) string {
  return fmt.Sprintf("%x",sha256.Sum256([]byte(salt+fmt.Sprintf("%d",rand.Intn(100000)))))
}

type Notification struct {
  Created time.Time
  Read time.Time
  Value string
}
type Return struct {
  Created time.Time
  Value interface{}

}


type Response struct {
  Session models.Session

  Notifications []Notification
  Responses []Return
}

type Action func(w http.ResponseWriter, r *http.Request, DB *gorm.DB, R Response) (Response, error)

func GetOrCreateSession(w http.ResponseWriter, r *http.Request, DB *gorm.DB, R Response) (Response, error) {
  remoteaddr := r.RemoteAddr;
  r.ParseForm()
  Session:=models.Session{}
  var sessionfound=false
  for _, cookie := range r.Cookies() {
    if cookie.Name=="SID" {
      sid:=cookie.Value;

      if DB.Where("token=?",sid).First(&Session);DB.Error!=nil {

      } else {
        if Session.ID!=0 {
          sessionfound=true
        }
      }
    }
  }

  if sessionfound {
    Session.Address=remoteaddr
    DB.Save(&Session)

  } else {
    domain:=strings.Split(remoteaddr,":")[0]
    expire := time.Now().AddDate(0, 0, 1)
    suuid:=token(remoteaddr)
    Session=models.Session{Token:suuid,Expires:expire,Address:remoteaddr,Domain:domain}
    DB.Create(&Session)
    http.SetCookie(w, &http.Cookie{Name:"SID",Value:suuid,})
    R.Notifications=append(R.Notifications,Notification{Created:time.Now(),Value:"newsession"})

  }
  R.Session=Session


  return R, nil
}


func Status(w http.ResponseWriter, r *http.Request, db *gorm.DB) models.Session {
  return models.Session{}
}

//Login
func Authenticate(w http.ResponseWriter, r *http.Request, DB *gorm.DB, R Response) (Response, error) {
  return R,nil
}

//Logout
func EndSession(w http.ResponseWriter, r *http.Request, DB *gorm.DB, R Response) (Response, error) {
  return R,nil
}

type Registration struct {
  Contacts []models.Contact
  Authentications []models.Authentication
  Profile models.Profile
  Account models.Account
}

func (r Registration) register (req *http.Request, DB *gorm.DB, R Response) (Response,error) {
  form := req.PostForm
  failure:=false
  TX:=DB.Begin()

  for k:=range form {
    //account: name
    if k=="AccountName" {
      account:=req.PostFormValue(k)
      A:=models.Account{AccountName:account}
      r.Account=A
      if DB.Find(&A);A.ID!=0 {
        //accont name exists  - return info
        R.Notifications=append(R.Notifications,Notification{Created:time.Now(),Value:"AccountName:Name Taken"})
        failure=true
      } else {
        //account name does not exists - add account to transaction
        TX.Create(&A)
        r.Profile=models.Profile{}
        TX.Create(&r.Profile)
      }
    }
    //Contacts
    ct:=models.ContactType{Name:k}
    if DB.First(&ct);ct.ID!=0 {
      //This is a contact
      contact:=models.Contact{ContactTypeID:ct.ID,Value:req.PostFormValue(k)}

      TX.Create(&contact)
      r.Contacts=append(r.Contacts,contact)
    }
    //Check for authentication types
    at:=models.AuthenticationType{Name:k}
    if DB.First(&at);at.ID!=0 {
      auth:=models.Authentication{AuthenticationTypeID:at.ID,Value:req.PostFormValue(k)}

      TX.Create(&auth)
      r.Authentications=append(r.Authentications,auth)
    }
  }
  if(failure) {
    TX.Rollback()
    R.Notifications=append(R.Notifications,Notification{Created:time.Now(),Value:"Register:Failed"})

  } else {
    if TX.Commit();DB.Error!=nil {
      return R,DB.Error
    } else {
      R.Notifications=append(R.Notifications,Notification{Created:time.Now(),Value:"Register:Success"})
      return R,nil
    }

    //connect models

  }


  //Check for profile info
  return R,nil
}

func GetOrCreateGrant(w http.ResponseWriter, r *http.Request, DB *gorm.DB, R Response) (Response, error) {
  return R,nil
}
func GetOrCreateAccount(w http.ResponseWriter, r *http.Request, DB *gorm.DB, R Response) (Response, error) {
  //check if session already attached to account

  Sessions:=[]models.Session{}
  if DB.Where("session_id=?",R.Session.ID).Find(&Sessions);DB.Error!=nil {
    if(len(Sessions)>0) {
      // already attached to at least one account
      // may not re-register
      // toss a notification for now
      R.Notifications=append(R.Notifications,Notification{Created:time.Now(),Value:"Already Authenticated"})
      return R, nil
    } else {
      // Not already authenticated, continue registration process w/ reg form
      r.ParseForm()
      form := r.PostForm

      if len(form)>0 {
        //The requestor is attempting to register.
        registration:=Registration{   }
        var err error
        if R,err=registration.register(r,DB,R);err!=nil {
          //Some error in registration.
        } else {
          R.Responses=append(R.Responses,Return{Value:registration,Created:time.Now()})
        }


        //Create contact
        //Create authentication
        // Create profile
      } else {
        //The requestor will find out there is no account info to link.
        R.Notifications=append(R.Notifications,Notification{Created:time.Now(),Value:"No Account"})

      }
    }
  } else {
    //Database error

    return R, DB.Error
  }
  //R.Notifications=append(R.Notifications,Notification{Created:time.Now(),Value:"attemptregister"})

  return R,nil
}

func Create(w http.ResponseWriter, r *http.Request, db *gorm.DB) {

}

func Read(w http.ResponseWriter, r *http.Request, db *gorm.DB) {

}

func Update(w http.ResponseWriter, r *http.Request, db *gorm.DB) {

}

func Exec(w http.ResponseWriter, r *http.Request, DB *gorm.DB, R Response) (Response, error) {
  return R,nil
}

var Actions=map[string]Action{
  "session":GetOrCreateSession,
  "account":GetOrCreateAccount,
  "auth":GetOrCreateGrant,
  "drop":EndSession,
  "exec":Exec,
}
//Account
//Create    (Register)
//Read
//Update



//Profile
//Create    (Register)
//Read
//Update


//Auth
//Create    (Register)
//Check     (Login)


