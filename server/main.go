package main

import (
	"flag"
)

var addr = flag.String("addr", "127.0.0.1:9090", "HTTP server address")

func main() {
	flag.Parse()

	ServeHTTP(*addr)
}
