FROM golang:1.14

WORKDIR /go/src/
COPY . .
RUN GOOS=linux go build simulator.go
CMD ["./simulator"]
