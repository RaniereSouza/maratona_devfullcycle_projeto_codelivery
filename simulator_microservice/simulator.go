package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"simulator/entity"
	"simulator/queue"
	"strings"
	"time"

	"github.com/joho/godotenv"
	"github.com/streadway/amqp"
)

var active []string

// init : loads all the environment variables from .env file
func init() {
	err := godotenv.Load()
	if err != nil {
		panic("Error loading .env file")
	}
}

func main() {

	in := make(chan []byte)

	ch := queue.Connect()
	queue.StartConsuming(in, ch)

	for msg := range in {
		var order entity.Order
		err := json.Unmarshal(msg, &order)

		if err != nil {
			fmt.Println(err.Error())
		}

		start(order, ch)
	}
}

// start : starts a new SimulatorWorker process if a new Order is received
func start(order entity.Order, ch *amqp.Channel) {

	if !stringInSlice(order.Uuid, active) {
		fmt.Println("New order Received: ", order.Uuid)

		active = append(active, order.Uuid)
		go SimulatorWorker(order, ch)
	} else {
		fmt.Println("Order", order.Uuid, "was already completed or is ongoing...")
	}
}

// SimulatorWorker : loops through the destinations .txt file, sending positions to the queue
func SimulatorWorker(order entity.Order, ch *amqp.Channel) {

	f, err := os.Open("destinations/" + order.Destination + ".txt")

	if err != nil {
		panic(err.Error())
	}

	defer f.Close()

	scanner := bufio.NewScanner(f)

	for scanner.Scan() {
		data := strings.Split(scanner.Text(), ",")
		json := destinationToJSON(order, data[0], data[1])

		time.Sleep(1 * time.Second)
		queue.Notify(string(json), ch)
	}

	if err := scanner.Err(); err != nil {
		log.Fatal(err)
	}

	json := destinationToJSON(order, "0", "0")
	queue.Notify(string(json), ch)
}

// destinationToJSON : converts latitude and longitude info into a Destination JSON object
func destinationToJSON(order entity.Order, lat string, lng string) []byte {
	dest := entity.Destination{
		Order: order.Uuid,
		Lat:   lat,
		Lng:   lng,
	}
	json, _ := json.Marshal(dest)
	return json
}

// stringInSlice : tries to match a string inside an array of strings
func stringInSlice(a string, list []string) bool {
	for _, b := range list {
		if b == a {
			return true
		}
	}
	return false
}
