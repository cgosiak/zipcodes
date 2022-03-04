function deg2rad(deg) {
    return deg * (Math.PI/180);
}

function geoDelta(latitude_1, longitude_1, latitude_2, longitude_2) {
    // haversine formula for determing distance between two coords
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(latitude_2-latitude_1);
    var dLon = deg2rad(longitude_2-longitude_1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(latitude_1)) * Math.cos(deg2rad(latitude_2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var delta = R * c; // Distance in km
    return delta;
}

module.exports.geoDelta = geoDelta;