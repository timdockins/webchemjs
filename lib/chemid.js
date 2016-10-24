'use strict';

const Q = require("q");
const util = require("util");
const https = require("https");
const http = require("http");
const fs = require("fs");
const xml2js = require("xml2js");


const paths = {
    "inchikey" : "inchikey",
    "name" : "name/startswith",
    "rn" : "rn"
};



function ChemIDDB () {

    var database = {};

    

}

module.exports.DB = ChemIDDB;

ChemIDDB.prototype.load = function( filename ) {
    var parser = new xml2js.Parser();
    if (verbose) console.log("loading: ", filename);
    fs.readFile(filename, function( err, data ){
        parser.parseString(data, function(err, results) {
            if(err) {
                console.log("error", err);
                process.exit();
            }
            if (verbose) console.log("results:", util.inspect(results[0], false, null));
            // database = results;
        }).then(function(){
            console.log("db loaded");
        })
    })
}




function query( params, verbose, callback ) {

    if (!Array.isArray(params)) {
        params = [params];
    }
    var promises = [];
    params.forEach(function(param) {
        var options = {
            query : param.query || null,
            type  : param.type  || 'name',
            match : param.match || 'first'
        }        
        promises.push( retrieve( options.query, options.type, options.match, verbose))
    });

    Q.allSettled(promises).then(
        function( values ) {
            callback(null, values);
        },
        function ( err ) {
            callback(err);
        }
    )
    
}

function retrieve( query, type, match, verbose ) {

    var deferred = Q.defer();
    var url = [host, paths[type],query].join("/");

    if (!query) {
        deferred.reject("NA");
    }

    if (verbose) {
        console.log("ChemID url: " + url);
    }

    var result = "";
    var req = https.get(url, function( res ) {
        if (verbose) {
            console.log("Status: ", res.statusCode);
            console.log("Headers: ", res.headers);
        }
        if (res.statusCode < 200 || res.statusCode > 399) {
            deferred.reject( res.statusCode );
        }

        res.on("data", function( chunk ) {
            result += chunk;
        });

        res.on("end", function( ) {        
            deferred.resolve( result );
        })

    });

    req.on("error", function(err) {
        deferred.reject(err);
    })

    return deferred.promise;
}

module.exports.query = query;