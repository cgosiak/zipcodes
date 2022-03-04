const { geoDelta } = require("./geo.service");

const GEOLOCATION_THRESHOLD = 10; // km threshold for returning matching zipcodes 

class ZipCodeService {
    constructor() {
        this.data = require('./data.json');
    }

    search(filters) {
        // disallow complex matches
        if (Object.keys(filters).indexOf("acceptable_cities") > -1) {
            throw "cannot filter with key (acceptable_cities)"
        }
        if (Object.keys(filters).indexOf("unacceptable_cities") > -1) {
            throw "cannot filter with key (unacceptable_cities)"
        }

        // remove latitiude and longitude for additional lookup
        let latitiude;
        let longitude;
        if (Object.keys(filters).indexOf("latitiude") > -1) {
            latitiude = filters["latitiude"];
        }
        if (Object.keys(filters).indexOf("longitude") > -1) {
            longitude = filters["longitude"];
        }

        // fail if only latitude or longitude was supplied
        if ((latitiude && !longitude) || (longitude && !latitiude)) {
            throw 'you must supply both latitude and longitude when searching via geo coordinates'
        }

        // apply base filter to all filter keys supplied
        let filtered_data = this.data.filter(entry => {
            return Object.keys(filters).every(filter => {
                switch (filter) {
                    case ("latitiude"):
                    case ("longitude"):
                        // filtering based on coords
                        delete filters["latitiude"];
                        delete filters["longitude"];
                        return geoDelta(latitiude, longitude, entry["latitude"], entry["longitude"]) <= GEOLOCATION_THRESHOLD;
                    case ("type"):
                    case ("state"):
                    case ("country"):
                        // exact match for type. state. county
                        return entry[filter].toLowerCase() === filters[filter].toLowerCase();
                    default:
                        // default to string in string match
                        return entry[filter].toLowerCase().indexOf(filters[filter].toLowerCase()) > -1;
                }
            });
        });

        // city filtering
        if (Object.keys(filters).indexOf("primary_city") > -1) {
            // explicit addition of acceptable_cities
            filtered_data = filtered_data.concat(this.data.filter(entry => {
                if (entry["acceptable_cities"]) {
                    const acceptable_cities = entry["acceptable_cities"].split(',').map(x => x.trim().toLowerCase());
                    return acceptable_cities.indexOf(filters["primary_city"].toLowerCase()) > -1;
                }
                return false;
            }));

            // exact match
            const exact_match = filtered_data.find(entry => entry["primary_city"] === filters["primary_city"]);

            // filter out unacceptable_cities
            if (exact_match) {
                const unacceptable_cities = exact_match["unacceptable_cities"].split(',').map(x => x.trim().toLowerCase());
                if (unacceptable_cities) {
                    filtered_data = filtered_data.filter(entry => {
                        return unacceptable_cities.indexOf(entry.primary_city.toLowerCase()) === -1;
                    });
                }
            }
        }

        return Array.from(new Set(filtered_data));
    }

    searchByZipCode(input) {
        if (input) {
            return this.search({
                "zip": input
            });
        } else {
            throw "input cannot be empty";
        }
    }

    searchByCityName(input) {
        if (input) {
            return this.search({
                "primary_city": input
            });
        } else {
            throw "input cannot be empty";
        }
    }

    searchByLocation(latitude, longitude) {
        if (latitude && longitude) {
            return this.search({
                "latitude": latitude,
                "longitude": longitude
            });
        } else {
            throw "must supply both latitude and longitude";
        }
    }

    /*
    - design and define zipcode api
    - implement zipcode api handler
    - search by full or partial zipcode
    - search by full or partial city name
    - search by closest latitude/longitude
    - filter by additional attributes
     */
}

module.exports.ZipCodeService = ZipCodeService;