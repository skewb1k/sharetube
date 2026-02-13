package main

import (
	"log"
	"net/http"
	"time"
)

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		rw := &statusCodeResponseWriter{
			ResponseWriter: w,
			statusCode:     http.StatusOK,
		}
		next.ServeHTTP(rw, r)

		log.Printf("\"%s %s %s\" %d %s",
			r.Method,
			r.RequestURI,
			r.Proto,
			rw.statusCode,
			time.Since(start),
		)
	})
}

type statusCodeResponseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (rw *statusCodeResponseWriter) WriteHeader(statusCode int) {
	rw.statusCode = statusCode
	rw.ResponseWriter.WriteHeader(statusCode)
}
