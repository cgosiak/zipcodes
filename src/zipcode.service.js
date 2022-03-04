const { geoDelta } = require("./geo.service");

const GEOLOCATION_THRESHOLD = 10; // km threshold for returning matching zipcodes
const POPULATION_THRESHOLD = 500; // population threshold +/-

class ZipCodeService {
  constructor() {
    this.data = require("./data.json");
  }

  search(filters) {
    // throw error on invalid filtering key
    const VALID_FILTERING_KEYS = [
      "zip",
      "type",
      "primary_city",
      "state",
      "county",
      "timezone",
      "area_codes",
      "latitude",
      "longitude",
      "country",
      "estimated_population"
    ];

    Object.keys(filters).forEach(key => {
      if (VALID_FILTERING_KEYS.indexOf(key.toLowerCase()) === -1) {
        throw `cannot filter with key (${key})`;
      }
    });

    // remove latitude and longitude for additional lookup
    let latitude;
    let longitude;
    if (Object.keys(filters).indexOf("latitude") > -1) {
      latitude = +filters["latitude"];
    }
    if (Object.keys(filters).indexOf("longitude") > -1) {
      longitude = +filters["longitude"];
    }

    // fail if only latitude or longitude was supplied
    if (
      (latitude != null && longitude == null) ||
      (longitude != null && latitude == null)
    ) {
      throw "you must supply both latitude and longitude when searching via geo coordinates";
    }

    // apply base filter to all filter keys supplied
    let filtered_data = this.data.filter(entry => {
      return Object.keys(filters).every(filter => {
        switch (filter) {
          case "estimated_population":
            // filtering based on population
            const population = +entry["estimated_population"];
            if (isNaN(population)) {
              return false;
            }
            return (
              population <=
                +filters["estimated_population"] + POPULATION_THRESHOLD &&
              population >=
                +filters["estimated_population"] - POPULATION_THRESHOLD
            );
          case "latitude":
          case "longitude":
            // filtering based on coords
            const entryLatitude = +entry["latitude"];
            const entryLongitude = +entry["longitude"];
            if (isNaN(entryLatitude) || isNaN(entryLongitude)) {
              return false;
            }
            const delta = geoDelta(
              latitude,
              longitude,
              entryLatitude,
              entryLongitude
            );
            return delta <= GEOLOCATION_THRESHOLD;
          case "type":
          case "state":
          case "country":
            // exact match for type. state. county
            if (!entry[filter]) {
              return false;
            }
            return (
              entry[filter].toLowerCase() === filters[filter].toLowerCase()
            );
          default:
            // default to string in string match
            if (!entry[filter]) {
              return false;
            }
            return (
              entry[filter]
                .toLowerCase()
                .indexOf(filters[filter].toLowerCase()) > -1
            );
        }
      });
    });

    // city filtering
    if (Object.keys(filters).indexOf("primary_city") > -1) {
      // explicit addition of acceptable_cities
      filtered_data = filtered_data.concat(
        this.data.filter(entry => {
          if (entry["acceptable_cities"]) {
            const acceptable_cities = entry["acceptable_cities"]
              .split(",")
              .map(x => x.trim().toLowerCase());
            return (
              acceptable_cities.indexOf(filters["primary_city"].toLowerCase()) >
              -1
            );
          }
          return false;
        })
      );

      // exact match
      const exact_match = filtered_data.find(
        entry => entry["primary_city"] === filters["primary_city"]
      );

      // filter out unacceptable_cities
      if (exact_match) {
        const unacceptable_cities = exact_match["unacceptable_cities"]
          ?.split(",")
          .map(x => x.trim().toLowerCase());
        if (unacceptable_cities) {
          filtered_data = filtered_data.filter(entry => {
            return (
              unacceptable_cities.indexOf(entry.primary_city.toLowerCase()) ===
              -1
            );
          });
        }
      }
    }

    return Array.from(new Set(filtered_data));
  }

  searchByZipCode(input) {
    if (input) {
      return this.search({
        zip: input
      });
    } else {
      throw "input cannot be empty";
    }
  }

  searchByCityName(input) {
    if (input) {
      return this.search({
        primary_city: input
      });
    } else {
      throw "input cannot be empty";
    }
  }

  searchByEstimatedPopulation(input) {
    if (input) {
      return this.search({
        estimated_population: input
      });
    } else {
      throw "input cannot be empty";
    }
  }

  searchByLocation(latitude, longitude) {
    if (latitude != null && longitude != null) {
      return this.search({
        latitude: latitude,
        longitude: longitude
      });
    } else {
      throw "you must supply both latitude and longitude to this function";
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
