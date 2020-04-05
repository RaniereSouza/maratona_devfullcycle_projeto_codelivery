package main

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"os"

	"github.com/gorilla/mux"
)

// Driver : Struct for each JSON object in the array at "./drivers.json" file
type Driver struct {
	UUID string `json:"uuid"`
	Name string `json:"name"`
}

// Drivers : Struct for an array of Driver objects
type Drivers struct {
	Drivers []Driver
}

// loadDrivers : returns all the data loaded from the file drivers.json
func loadDrivers() []byte {

	jsonFile, err := os.Open("drivers.json")
	if err != nil {
		panic(err.Error())
	}

	defer jsonFile.Close()

	data, err := ioutil.ReadAll(jsonFile)
	if err != nil {
		panic(err.Error())
	}
	return data
}

// ListDrivers : Handler for "GET /drivers" HTTP Request
func ListDrivers(w http.ResponseWriter, r *http.Request) {
	drivers := loadDrivers()
	w.Write([]byte(drivers))
}

// GetDriverByID : Handler for "GET /drivers/{uuid}" HTTP Request
func GetDriverByID(w http.ResponseWriter, r *http.Request) {
	driversJSON := loadDrivers()
	routeParams := mux.Vars(r)

	response, _ := json.Marshal("Could not find user with ID " + routeParams["uuid"])

	var drivers Drivers
	json.Unmarshal(driversJSON, &drivers)

	for _, item := range drivers.Drivers {
		if item.UUID == routeParams["uuid"] {
			driver, _ := json.MarshalIndent(item, "", "  ")
			response = driver
			break
		}
	}

	w.Write(response)
}

func main() {
	r := mux.NewRouter()
	r.HandleFunc("/drivers", ListDrivers)
	r.HandleFunc("/drivers/{uuid}", GetDriverByID)
	http.ListenAndServe(":8081", r)
}
