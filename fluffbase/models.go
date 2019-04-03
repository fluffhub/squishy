
package models

import (
  "time"
// "database/sql"
  "github.com/jinzhu/gorm"
  _ "github.com/jinzhu/gorm/dialects/postgres"
)


type Order struct {
  gorm.Model
  Created time.Time
  Updated time.Time
  Meta string `gorm:"type:text"`

  OrderStatusID int64 `gorm:"index"`
  AccountID int64 `gorm:"index"`

}

type LineItem struct {
  gorm.Model
  Quantity float32

  OrderID int64 `gorm:"index"`
  OfferID int64 `gorm:"index"`

}

type Payment struct {
  gorm.Model

  Created time.Time `gorm:"created"`
  Amount float64 `gorm: "not null"`
  Meta string `gorm: "type:text"`

  // SourceAccountID int64 `gorm: "index"`
  TargetAccountID int64 `gorm: "index"`
  OrderID int64 `gorm: "index"`
  PaymentTypeID uint `gorm: "index"`
  TransactionStatusID uint `gorm: "index"`
}

type Transaction struct {
  gorm.Model

  Created time.Time `gorm:"created"`

  Amount float64 `gorm: "not null"`
  Meta string `gorm: "type:text"`

  SourceAccountID int64 `gorm: "index"`
  TargetAccountID int64 `gorm: "index"`
  OrderID int64 `gorm: "index"`
  // PaymentTypeID uint `gorm: "index"`
  TransactionStatusID uint `gorm: "index"`
}

type Account struct {
  gorm.Model
  AccountName string `gorm:"type:varchar(255);not null;unique"`
  Meta string `gorm: "text"`

  ParentID int64 `gorm:"index"`
  CurrencyID string `gorm:"default:'USD'"`
  Sessions []Session
  Hosts []Host
  Orders []Order
  Offers []Offer
  Instances []Instance
  Authentications []Authentication
}

type Contact struct {
  gorm.Model
  Value string
  AccountID int64 `gorm: "index"`
  ContactTypeID uint `gorm: "index"`
  ContactStatusID uint `gorm: "index"`
}


type Authentication struct {
  gorm.Model
  Value string `gorm:"type:text"`

  AuthenticationTypeID uint `gorm: "index"`
  AccountID int64 `gorm:"index"`

  Sessions []Session

}
type Grant struct {
  ID int64
  AuthenticationId int64 `gorm: "index"`
  SessionId int64 `gorm:"index"`
  //AccountId int64 `gorm:"index"`
  Expires time.Time

}
type Session struct {
  gorm.Model
  Address string `gorm:"type:varchar(255);not null"`
  Domain string `gorm:"type:varchar(255);not null;index"`
  Token string `gorm:"type:varchar(255);not null;index"`
  Expires time.Time


}

type Profile struct {
  gorm.Model
  Meta string `gorm: "type:text"`

  ProfileTypeID uint `gorm:"index"`
  AccountID int64 `gorm: "index"`

}

type Host struct {
  gorm.Model
  Name string `gorm: "type:varchar(255);not null"`
  Address string `gorm: "type:varchar(255);not null"`
  Meta string `gorm: "type:text"`
  AccountID int64 `gorm:"index"`
  Status string `gorm: "type:varchar(1024);not null"`
  Instances []Instance
}

type Instance struct {
  gorm.Model
  Meta string `gorm: "type:text"`

  HostID int64 `gorm:"index"`
  AccountID int64 `gorm:"index"`

}

type Product struct {
  gorm.Model
  Name string `gorm:"type:varchar(255)"`
  Meta string `gorm:"text"`

  Variants []Variant
}

type Component struct {
  gorm.Model
  Title string `gorm:"type:varchar(255)"`
  Meta string `gorm:"type:text"`
  Quantity float64
  ParentID int64 `gorm:"index"`
  VariantID int64 `gorm:"index"`
  ProductID int64 `gorm:"index"`

}

type Variant struct {
  gorm.Model
  Title string `gorm:"type:varchar(255)"`
  Meta string `gorm:"type:text"`

  ProductID int64 `gorm:"index"`
  ComponentID int64 `gorm:"index"`

  Offers []Offer
}

type Offer struct {
  gorm.Model
  //ProductID int64 `gorm: "not null references product(ID)"`
  Value int
  Available float32
  Meta string `gorm:"type:text"`
  OfferStatusID uint `gorm:"index"`
  VariantID int64 `gorm:"index"`
  AccountID int64 `gorm:"index"`
  CurrencyID string `gorm:"type:varchar(4);index"`
}

type Device struct {
  gorm.Model
  Meta string `gorm:"type:text"`

  ProductID int64 `gorm:"index"`
  AccountID int64 `gorm:"index"`
}

type ProfileType struct {
  ID uint `gorm:"primary_key"`
  Name string `gorm:"type:varchar(255)"`
  Meta string `gorm:"type:text"`
}

type PaymentType struct {
  ID uint `gorm:"primary_key"`
  Name string `gorm:"type:varchar(255)"`
  Meta string `gorm:"type:text"`
}

type AuthenticationType struct {
  ID uint `gorm:"primary_key"`
  Name string `gorm:"type:varchar(255)"`
  Meta string `gorm:"type:text"`
}

type Currency struct {
  ID string `gorm:"type:varchar(4)"`
  Name string `gorm:"type:varchar(255)"`
  Symbol string `gorm:"type:varchar(16)"`

}

type OrderStatus struct {
  ID uint `gorm: "primary_key"`
  Name string `gorm: "type:varchar(255)"`
}

type OfferStatus struct {
  ID uint `gorm:"primary_key"`
  Name string `gorm:"type:varchar(255)"`
}

type TransactionStatus struct {
  ID uint `gorm:"primary_key"`
  Name string `gorm:"type:varchar(255)"`
}
type ContactType struct {
  ID uint `gorm:"primary_key"`
  Name string `gorm:"type:varchar(255)"`
}
type ContactStatus struct {
  ID uint `gorm:"primary_key"`
  Name string `gorm:"type:varchar(255)"`
}

/********************** Fixtures ***********************************/
/*
var ProfileTypes=[]interface{} {
ProfileType{Name:"Vendor"},
ProfileType{Name:"Service"},
ProfileType{Name:"User"},
ProfileType{Name:"Device"},
}
var PaymentTypes=[]interface{} {
PaymentType{Name:"Echeck"},
PaymentType{Name:"Stripe"},
}
var AuthenticationTypes=[]interface{} {
AuthenticationType{Name:"Password"},
AuthenticationType{Name:"File"},
AuthenticationType{Name:"Email"},
AuthenticationType{Name:"Phone"},
AuthenticationType{Name:"PhotoID"},
}
var OrderStatuses=[]interface{} {
OrderStatus{Name:"New"},
OrderStatus{Name:"Failed"},
OrderStatus{Name:"Fulfilled"},
OrderStatus{Name:"Closed"},
}
var OfferStatuses=[]interface{} {
OfferStatus{Name:"New"},
OfferStatus{Name:"Live"},
OfferStatus{Name:"Discontinued"},
}
var TransactionStatuses=[]interface{} {
TransactionStatus{Name:"New"},
TransactionStatus{Name:"Error"},
TransactionStatus{Name:"LeftFault"},
TransactionStatus{Name:"RightFault"},
TransactionStatus{Name:"LeftComplete"},
TransactionStatus{Name:"RightComplete"},
}

var Currencies=[]interface{} {
Currency{Name:"US Dollar",Symbol:"$",ID:"USD"},
}
*/

/*
var Fixtures=map[string][]interface{} {
"Currency":Currencies,
"ProfileType":ProfileTypes,
"PaymentType":PaymentTypes,
"AuthenticationType":AuthenticationTypes,
"OrderStatus":OrderStatuses,
"OfferStatus":OfferStatuses,
"TransactionStatus":TransactionStatuses,
}
*/
var Fixtures=[]interface{} {
  &Account{AccountName:"Fluffy"},
  &Host{Name:"Fluffbase",Address:"fluffbase.com",AccountID:1},

  &ProfileType{Name:"Vendor"},
  &ProfileType{Name:"Service"},
  &ProfileType{Name:"User"},
  &ProfileType{Name:"Device"},

  &ContactType{Name:"Email"},
  &ContactType{Name:"SMS"},
  &ContactType{Name:"URL"},
  &ContactType{Name:"Facebook"},
  &ContactType{Name:"Twitter"},

  &ContactStatus{Name:"New"},
  &ContactStatus{Name:"Unverified"},
  &ContactStatus{Name:"Verified"},
  &ContactStatus{Name:"Disabled"},


  &PaymentType{Name:"Echeck"},
  &PaymentType{Name:"Stripe"},

  &AuthenticationType{Name:"Password"},
  &AuthenticationType{Name:"KeyFile"},
  &AuthenticationType{Name:"Email"},
  &AuthenticationType{Name:"SMS"},
  &AuthenticationType{Name:"PhotoID"},

  &OrderStatus{Name:"New"},
  &OrderStatus{Name:"Failed"},
  &OrderStatus{Name:"Fulfilled"},
  &OrderStatus{Name:"Closed"},

  &OfferStatus{Name:"New"},
  &OfferStatus{Name:"Live"},
  &OfferStatus{Name:"Discontinued"},

  &TransactionStatus{Name:"New"},
  &TransactionStatus{Name:"Error"},
  &TransactionStatus{Name:"LeftFault"},
  &TransactionStatus{Name:"RightFault"},
  &TransactionStatus{Name:"LeftComplete"},
  &TransactionStatus{Name:"RightComplete"},

  &TransactionStatus{Name:"New"},
  &TransactionStatus{Name:"Error"},
  &TransactionStatus{Name:"LeftFault"},
  &TransactionStatus{Name:"RightFault"},
  &TransactionStatus{Name:"LeftComplete"},
  &TransactionStatus{Name:"RightComplete"},

  &Currency{Name:"US Dollar",Symbol:"$",ID:"USD"},
}

var Tables = []interface{} {
  &Product{},&Offer{},
  &Currency{},&Account{},
  &Instance{},&Host{},
  &Session{},&Authentication{},
  &AuthenticationType{},
  &ProfileType{},
  &Order{},&OrderStatus{},
  &LineItem{},&Component{},
  &OfferStatus{},
  &Variant{},&Payment{},
  &PaymentType{},&Transaction{},
  &TransactionStatus{},
  &Device{},&Grant{},
  &ContactType{},&Contact{},
  &ContactStatus{},
}

var Tablemap = map[string]interface{} {
  "Product":&Product{},
  "Offer":&Offer{},
  "Currency":&Currency{},
  "Account":&Account{},
  "Instance":&Instance{},
  "Host":&Host{},
  "Session":&Session{},
  "Authentication":&Authentication{},
  "AuthenticationType":&AuthenticationType{},
  "ProfileType":&ProfileType{},
  "Order":&Order{},
  "OrderStatus":&OrderStatus{},
  "LineItem":&LineItem{},
  "Component":&Component{},
  "OfferStatus":&OfferStatus{},
  "Variant":&Variant{},
  "Payment":&Payment{},
  "PaymentType":&PaymentType{},
  "Transaction":&Transaction{},
  "TransactionStatus":&TransactionStatus{},
  "Device":&Device{},
  "Grant":&Grant{},
  "ContactType":&ContactType{},
  "ContactStatus":&ContactStatus{},
  "Contact":&Contact{},
}
