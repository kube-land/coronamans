package main

import (
	"errors"
	"fmt"
	"github.com/julienschmidt/httprouter"
	"gorm.io/gorm"
	"net/http"
	"time"
)

type Attendance struct {
	Barcode uint64 `json:"barcode,omitempty" gorm:"index"`
	Name    string `json:"name,omitempty" gorm:"not null;size:191"`

	Duration string

	CreatedAt time.Time `json:"createdAt,omitempty" gorm:"index"`
	Checkout  time.Time `json:"checkout,omitempty" gorm:"index"`
}

func Check(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	barcode := ps.ByName("barcode")
	var employee Employee

	err := db.First(&employee, barcode).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		status := Status{
			Status:  StatusFailure,
			Message: "Employee not found",
			Code:    http.StatusNotFound,
		}
		ResponseJSON(status, w, http.StatusNotFound)
		return
	}

	var attendance Attendance
	attendance.Barcode = employee.ID
	attendance.Name = employee.Name
	attendance.Duration = "0"

	// no record with duration zero (no check in)
	if err := db.Where(&Attendance{Barcode: employee.ID, Duration: "0"}).First(&attendance).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			db.Create(&attendance)
			employee.Status = true
			db.Save(&employee)
		}
	} else { // in shift
		attendance.Checkout = time.Now()
		duration := fmtDuration(attendance.Checkout.Sub(attendance.CreatedAt))

		employee.Status = false
		db.Save(&employee)

		if duration == "00:00" { // undo if checked in by mistake
			db.Where(&Attendance{Barcode: employee.ID, Duration: "0"}).Delete(&attendance)
			w.WriteHeader(204)
			return
		} else { // check out the user
			attendance.Duration = duration
			db.Model(&attendance).Where(&Attendance{Barcode: employee.ID, Duration: "0"}).Updates(attendance)
		}
	}

	ResponseJSON(attendance, w, 200)
}

func Report(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	start, end, err := parsePeriod(r)
	if err != nil {
		status := Status{
			Status:  StatusFailure,
			Message: "Error parsing time period of query",
			Code:    http.StatusInternalServerError,
			Details: err.Error(),
		}
		ResponseJSON(status, w, http.StatusInternalServerError)
		return
	}

	attendances := []Attendance{}

	db.Model(&Attendance{}).
		Where("attendances.checkout < ? and attendances.checkout > ?", end, start).
		Scan(&attendances)

	ResponseJSON(attendances, w, 200)
}

func Aggregate(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	start, end, err := parsePeriod(r)
	if err != nil {
		status := Status{
			Status:  StatusFailure,
			Message: "Error parsing time period of query",
			Code:    http.StatusInternalServerError,
			Details: err.Error(),
		}
		ResponseJSON(status, w, http.StatusInternalServerError)
		return
	}

	attendances := []Attendance{}

	db.Model(&Attendance{}).
		Where("attendances.checkout < ? and attendances.checkout > ?", end, start).
		Select("barcode, name, SEC_TO_TIME(SUM(TIME_TO_SEC(duration))) as duration").
		Group("barcode").
		Scan(&attendances)

	ResponseJSON(attendances, w, 200)
}

func parsePeriod(r *http.Request) (*time.Time, *time.Time, error) {
	layout := "2006-01-02T15:04:05"
	eet, _ := time.LoadLocation("EET")

	start := r.URL.Query().Get("start")
	tStart, err := time.ParseInLocation(layout, start, eet)
	if err != nil {
		return nil, nil, fmt.Errorf("Couldn't parse start time: %v", err)
	}

	end := r.URL.Query().Get("end")
	tEnd, err := time.ParseInLocation(layout, end, eet)
	if err != nil {
		return nil, nil, fmt.Errorf("Couldn't parse end time: %v", err)
	}

	return &tStart, &tEnd, nil
}
