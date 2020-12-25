package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type StatusType string

const (
	// StatusSuccess is "Success" status
	StatusSuccess StatusType = "Success"
	// StatusFailure is "Failure" status
	StatusFailure StatusType = "Failure"
)

type Status struct {
	Status  StatusType  `json:"status,omitempty"`
	Message string      `json:"message,omitempty"`
	Details interface{} `json:"details,omitempty"`
	Code    int         `json:"code,omitempty"`
}

func ResponseJSON(response interface{}, w http.ResponseWriter, statusCode int) {
	if response != nil {
		jsonResponse, err := json.Marshal(response)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(statusCode)
		w.Write(jsonResponse)
	} else {
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(statusCode)
	}
}

func fmtDuration(d time.Duration) string {
	d = d.Round(time.Minute)
	h := d / time.Hour
	d -= h * time.Hour
	m := d / time.Minute
	return fmt.Sprintf("%02d:%02d", h, m)
}
