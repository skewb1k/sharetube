package main

import (
	"bufio"
	"log"
	"net"
	"net/http"
	"time"
)

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin != "" {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		}
		next.ServeHTTP(w, r)
	})
}

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

// Implement [http.Hijacker] for WebSocket upgrader.
func (rw *statusCodeResponseWriter) Hijack() (net.Conn, *bufio.ReadWriter, error) {
	h, ok := rw.ResponseWriter.(http.Hijacker)
	if !ok {
		panic("statusCodeResponseWriter does not implement http.Hijacker")
	}
	return h.Hijack()
}
