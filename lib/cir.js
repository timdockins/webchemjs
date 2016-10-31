'use strict';

/*
 * URL: https://cactus.nci.nih.gov/chemical/structure
 * "This service works as a resolver for different chemical structure identifiers and allows one to convert a given
 * structure identifier into another representation or structure identifier. It can help you identify and find the
 * chemical structure if you have an identifier such as an InChIKey. You can either use the resolver web form above
 * or use the following simple URL API scheme:"
 */

const Q = require("q");
const util = require("util");
const https = require("https");
const parseString = require("xml2js").parseString;

var host = "https://cactus.nci.nih.gov"
var pathPrefix = "chemical/structure";

function query(params, callback) {

    var options = {
        compounds : params.compounds || [],
        representation : params.representation || "smiles",
        first : params.first || false,
        verbose : params.verbose || false
    }

    var promises = [];

    if ( !Array.isArray(options.compounds) ) {
        options.compounds = [options.compounds];
    }

    options.compounds.forEach( function( compound ) {
        
        promises.push(retrieve( compound.id, options.representation, compound.resolver, options.first, options.verbose ));        

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

function retrieve( identifier, representation, resolver, first, verbose ) {

    var deferred = Q.defer();

    var url = [host,pathPrefix,identifier,representation,"xml"].join("/");
    if (resolver) {
        url += "?resolver=" + resolver;
    }

    if (verbose) { console.log("Url: ", url ) }

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
            verbose && console.log("res.on.END - String", result)
            parseString( result, function(err, parsedResult) {
                verbose && console.log("res.on.END", util.inspect(parsedResult,false,null))           
                deferred.resolve( parsedResult );
            });
        });
    });

    req.on("error", function(e) {
        deferred.reject(e);
    })    

    return deferred.promise;

}

module.exports.query = query;