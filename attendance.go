package main

import (
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/julienschmidt/httprouter"
	"gorm.io/gorm"
)

type Attendance struct {
	Barcode uint64 `json:"barcode,omitempty" gorm:"index"`
	Name    string `json:"name,omitempty" gorm:"not null;size:191"`
	Title   string `json:"title,omitempty" gorm:"not null;index"`

	Duration string `json:"duration,omitempty"`

	CreatedAt *time.Time `json:"createdAt,omitempty" gorm:"index"`
	Logout    *time.Time `json:"logout,omitempty" gorm:"index"`
}

type ReportItem struct {
	Attendance `json:",inline"`

	Count int64 `json:"count,omitempty"`
}

func LogInOut(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	barcode := ps.ByName("barcode")
	var employee Employee

	if err := db.First(&employee, "id = ?", barcode).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			status := Status{
				Status:  StatusFailure,
				Message: "Employee not found!",
				Code:    http.StatusNotFound,
			}
			ResponseJSON(status, w, http.StatusNotFound)
			return
		} else {
			status := Status{
				Status:  StatusFailure,
				Message: fmt.Sprintf("Couldn't fetch employee: %v", err.Error()),
				Code:    http.StatusInternalServerError,
				Details: err,
			}
			ResponseJSON(status, w, http.StatusInternalServerError)
			return
		}
	}

	var attendance Attendance
	attendance.Barcode = employee.ID
	attendance.Name = employee.Name
	attendance.Title = employee.Title
	attendance.Duration = "0"

	// no record with duration zero (no log in)
	if err := db.Where(&Attendance{Barcode: employee.ID, Duration: "0"}).First(&attendance).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			db.Create(&attendance)
			employee.LoggedIn = true
			db.Save(&employee)
		} else {
			status := Status{
				Status:  StatusFailure,
				Message: fmt.Sprintf("Couldn't log in/out employee: %v", err.Error()),
				Code:    http.StatusInternalServerError,
				Details: err,
			}
			ResponseJSON(status, w, http.StatusInternalServerError)
			return
		}
	} else { // in shift
		now := time.Now()
		attendance.Logout = &now
		duration := attendance.Logout.Sub(*attendance.CreatedAt)

		if duration < time.Duration(15*time.Minute) { // do nothing it is mistake
			//db.Where(&Attendance{Barcode: employee.ID, Duration: "0"}).Delete(&attendance)
			w.WriteHeader(204)
			return
		} else { // log out the user
			employee.LoggedIn = false
			db.Save(&employee)
			attendance.Duration = fmtDuration(duration)
			db.Model(&attendance).Where(&Attendance{Barcode: employee.ID, Duration: "0"}).Updates(attendance)
		}
	}

	ResponseJSON(attendance, w, 200)
}

func Historical(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
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

	reportItems := []ReportItem{}

	if err := db.Model(&Attendance{}).
		Where("attendances.logout < ? and attendances.logout > ?", end, start).
		Scan(&reportItems).Error; err != nil {
		status := Status{
			Status:  StatusFailure,
			Message: fmt.Sprintf("Error generating historical report: %s", err.Error()),
			Code:    http.StatusInternalServerError,
			Details: err,
		}
		ResponseJSON(status, w, http.StatusInternalServerError)
		return
	}

	ResponseJSON(reportItems, w, 200)
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

	reportItems := []ReportItem{}

	if err := db.Model(&Attendance{}).
		Where("attendances.logout < ? and attendances.logout > ?", end, start).
		Select("barcode, name, title, SUBSTRING(SEC_TO_TIME(SUM(TIME_TO_SEC(duration))), 1, 5) as duration, COUNT(name) as count").
		Group("barcode").
		Scan(&reportItems).Error; err != nil {
		status := Status{
			Status:  StatusFailure,
			Message: fmt.Sprintf("Error generating aggregated report: %s", err.Error()),
			Code:    http.StatusInternalServerError,
			Details: err,
		}
		ResponseJSON(status, w, http.StatusInternalServerError)
		return
	}

	ResponseJSON(reportItems, w, 200)
}

func parsePeriod(r *http.Request) (*time.Time, *time.Time, error) {
	layout := "2006-01-02T15:04:05Z"
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
