package main

import (
	"net/http"

	"encoding/json"
	"github.com/julienschmidt/httprouter"
	"gorm.io/gorm"
	"time"

	"errors"

	"io"
)

type Attendance struct {
	Barcode uint64 `json:"barcode,omitempty" gorm:"index"`

	Duration string

	CreatedAt time.Time `json:"createdAt,omitempty" gorm:"index"`
	Checkout  time.Time `json:"checkout,omitempty" gorm:"index"`
}

type CheckStatus struct {
	Attendance `json:",inline"`

	Name  string
	Title string
}

type ReportItem struct {
	Barcode   uint64
	Name      string
	Title     string
	Duration  string
	Intervals int
}

func Check(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	var e Employee
	barcode := ps.ByName("barcode")

	err := db.First(&e, barcode).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		w.WriteHeader(http.StatusNotFound)
		io.WriteString(w, "Not found\n")
		return
	}

	var a Attendance
	a.Barcode = e.ID
	a.Duration = "0"

	err = db.Where(&Attendance{Barcode: e.ID, Duration: "0"}).First(&a).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		db.Create(&a)
		respJson, err := json.Marshal(a)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Write(respJson)
		w.WriteHeader(200)
		return
	}

	a.Checkout = time.Now()
	a.Duration = fmtDuration(a.Checkout.Sub(a.CreatedAt))
	if a.Duration == "00:00" {
		db.Where(&Attendance{Barcode: e.ID, Duration: "0"}).Delete(&a)
		w.WriteHeader(204)
		return
	} else {
		db.Model(&a).Where(&Attendance{Barcode: e.ID, Duration: "0"}).Updates(a)
		respJson, err := json.Marshal(a)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Write(respJson)
		w.WriteHeader(200)
	}
}

func GetStatus(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	var e Employee
	barcode := ps.ByName("barcode")

	err := db.First(&e, barcode).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		w.WriteHeader(http.StatusNotFound)
		io.WriteString(w, "Not found\n")
		return
	}

	var a Attendance
	a.Barcode = e.ID
	a.Duration = "0"

	err = db.Where(&Attendance{Barcode: e.ID, Duration: "0"}).First(&a).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		w.WriteHeader(http.StatusNotFound)
		io.WriteString(w, "Not found\n")
		return
	}

	var cs CheckStatus
	db.Model(&Attendance{}).Select("attendances.*, employees.name, employees.title").Where(&Attendance{Barcode: e.ID, Duration: "0"}).Joins("left join employees on employees.id = attendances.barcode").Scan(&cs)

	respJson, err := json.Marshal(cs)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Write(respJson)
	w.WriteHeader(200)
}

func Generate(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {

}
