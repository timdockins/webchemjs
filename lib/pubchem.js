'use strict';

const Q = require("q");
const util = require("util");
const https = require("https");
const parseString = require("xml2js").parseString;

var host = "https://pubchem.ncbi.nlm.nih.gov/rest/pug"
var pathPrefix = "compound";
var postFix = "JSON"

function query(params, callback) {

    var options = {
        query : params.query || [],        
        first : params.first || false,
        verbose : params.verbose || false
    }

    var promises = [];

    if ( !Array.isArray(options.query) ) {
        options.query = [options.query];
    }

    options.query.forEach( function( compound ) {
        
        promises.push(retrieve( compound.id, compound.from, compound.to, options.first, options.verbose ));        

    });

    Q.allSettled(promises).then(
        function(values) {
            callback( null, values);
        },
        function(err) {
        callback( err );
        }
    );

}

function retrieve( identifier, from, to, first, verbose ) {

    var deferred = Q.defer();

    var url = [host,pathPrefix,from,identifier,to,postFix].join("/");
    
    verbose && console.log("Url: ", url );

    var result = "";
    var req = https.get( url, function( res ) {
        verbose && console.log("statusCode", res.statusCode);
        verbose && console.log("headers:", res.headers);
        if (res.statusCode < 200 || res.statusCode > 299) {
            deferred.reject(res.statusCode);
        }
        res.on( "data", function( chunk ) {
            result += chunk;            
        });
        res.on("end", function( ){
            verbose && console.log("res.on.END", result);
            var parsedResult = JSON.parse(result);
            verbose && console.log("res.on.END", util.inspect(parsedResult,false,null))
            deferred.resolve( parsedResult );
            
        });
    });

    req.on("error", function(e) {
        deferred.reject(e);
    })    

    return deferred.promise;

}

module.exports.query = query;