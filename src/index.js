const { ZipCodeService } = require("./zipcode.service");

module.exports.handler = async event => {
  const zipCodeService = new ZipCodeService();
  return zipCodeService.search(event.queryStringParameters);
};
