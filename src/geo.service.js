function deg2rad(deg) {
    return deg * (Math.PI/180);
}

function geoDelta(latitiude_1, longitude_1, latitiude_2, longitude_2) {
    // haversine formula for determing distance between two coords
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(latitiude_2-latitiude_1);
    var dLon = deg2rad(longitude_2-longitude_1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(latitiude_1)) * Math.cos(deg2rad(latitiude_2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var delta = R * c; // Distance in km
    return delta;
}

module.exports.geoDelta = geoDelta;