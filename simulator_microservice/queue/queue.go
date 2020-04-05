package queue

import (
	"fmt"
	"github.com/streadway/amqp"
	"log"
	"os"
)

// Connect : connects to a RabbitMQ running server
func Connect() *amqp.Channel {
	dsn := "amqp://" + os.Getenv("RABBITMQ_DEFAULT_USER") + ":" + os.Getenv("RABBITMQ_DEFAULT_PASS") + "@" + os.Getenv("RABBITMQ_DEFAULT_HOST") + ":" + os.Getenv("RABBITMQ_DEFAULT_PORT") + os.Getenv("RABBITMQ_DEFAULT_VHOST")
	fmt.Println("dsn: ", dsn)
	conn, err := amqp.Dial(dsn)
	failOnError(err, "Failed to connect to RabbitMQ")
	//defer conn.Close()

	ch, err := conn.Channel()
	failOnError(err, "Failed to open a channel")
	//defer ch.Close()
	return ch
}

// StartConsuming : starts listening to messages coming through the specified queue
func StartConsuming(in chan []byte, ch *amqp.Channel) {

	q, err := ch.QueueDeclare(
		os.Getenv("RABBITMQ_ORDERS_CONSUMER_QUEUE"), // name
		true,  // durable
		false, // delete when unused
		false, // exclusive
		false, // no-wait
		nil,   // arguments
	)
	failOnError(err, "Failed to declare a queue")

	msgs, err := ch.Consume(
		q.Name,      // queue
		"go-worker", // consumer
		true,        // auto-ack
		false,       // exclusive
		false,       // no-local
		false,       // no-wait
		nil,         // args
	)
	failOnError(err, "Failed to register a consumer")

	go func() {
		for d := range msgs {
			in <- []byte(d.Body)
		}
		close(in)
	}()
}

// Notify : emits a message with the specified routing key
func Notify(payload string, ch *amqp.Channel) {

	err := ch.Publish(
		os.Getenv("RABBITMQ_DEFAULT_EX"),            // exchange
		os.Getenv("RABBITMQ_POSITIONS_ROUTING_KEY"), // routing key
		false, // mandatory
		false, // immediate
		amqp.Publishing{
			ContentType: "application/json",
			Body:        []byte(payload),
		})
	failOnError(err, "Failed to publish a message")
	fmt.Println("Message sent: ", payload)

}

// failOnError : triggers a fail when an error is received, and logs the failing message
func failOnError(err error, msg string) {
	if err != nil {
		log.Fatalf("%s: %s", msg, err)
	}
}
