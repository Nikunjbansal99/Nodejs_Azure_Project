var fs = require("fs");
const path = require("path");
const request = require("request");

var downloadfile = function (uri, filename, callback) {
  request.head(uri, function (err, res, body) {

    request(uri).pipe(fs.createWriteStream(filename)).on("close", callback);
  });
};


module.exports={downloadfile}