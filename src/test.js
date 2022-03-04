const { handler } = require("./index");
const { geoDelta } = require("./geo.service");
const { ZipCodeService } = require("./zipcode.service");

const zipcodeService = new ZipCodeService();

describe("open search", () => {
  test("correctly calculates zero distance", () => {
    const delta = geoDelta(44.9794633,-93.2782834, 44.9794633,-93.2782834);
    expect(delta).toStrictEqual(0);
  });

  test("correctly calculates non-zero distance", () => {
    const delta = geoDelta(44.9794633,-93.2782834, 44.981911, -93.277264);
    expect(delta).toBeCloseTo(0.28);
  });
});

describe("search by zipcode", () => {
  test("returns correct results with full zipcode", () => {
    const response = zipcodeService.searchByZipCode("01001");
    expect(response.sort()).toStrictEqual([{
      "zip": "01001",
      "type": "STANDARD",
      "primary_city": "Agawam",
      "acceptable_cities": null,
      "unacceptable_cities": null,
      "state": "MA",
      "county": "Hampden County",
      "timezone": "America/New_York",
      "area_codes": "413",
      "latitude": "42.06",
      "longitude": "-72.61",
      "country": "US",
      "estimated_population": "14021"
    }].sort());
  });

  test("returns correct results with partial zipcode", () => {
    const response = zipcodeService.searchByZipCode("0100");
    expect(response.length).toStrictEqual(8);
  });

  test("throw error with empty zipcode", () => {
    const t = () => {
      const response = zipcodeService.searchByZipCode("");
    };
    expect(t).toThrow("input cannot be empty");
  });
});

describe("search by city", () => {
  test("returns correct results with full city name", () => {
    const response = zipcodeService.searchByCityName("Amherst");
    expect(response.length).toStrictEqual(6);
  });

  test("throw error with empty zipcode", () => {
    const t = () => {
      const response = zipcodeService.searchByZipCode("");
    };
    expect(t).toThrow("input cannot be empty");
  });
});

describe("search by population", () => {
  test("returns correct results with estimated_population threshold", () => {
    const response = zipcodeService.searchByEstimatedPopulation(10000);
    expect(response.length).toStrictEqual(30);
  });
});

describe("search by geo coords", () => {
  test("returns correct results with coords", () => {
    const response = zipcodeService.searchByLocation(43.96, -69.78);
    expect(response.length).toStrictEqual(2);
  });

  test("throw error when only latitude is defined", () => {
    const t = () => {
      const response = zipcodeService.searchByLocation(44.9794633, null);
    };
    expect(t).toThrow("you must supply both latitude and longitude to this function");
  });

  test("throw error when only longitude is defined", () => {
    const t = () => {
      const response = zipcodeService.searchByLocation(null, -93.2782834);
    };
    expect(t).toThrow("you must supply both latitude and longitude to this function");
  });
});

describe("geoDelta function", () => {
  test("correctly calculates zero distance", () => {
    const delta = geoDelta(44.9794633,-93.2782834, 44.9794633,-93.2782834);
    expect(delta).toStrictEqual(0);
  });

  test("correctly calculates non-zero distance", () => {
    const delta = geoDelta(44.9794633,-93.2782834, 44.981911, -93.277264);
    expect(delta).toBeCloseTo(0.28);
  });
});