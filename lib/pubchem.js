"use strict";

const Q = require("q");
const util = require("util");
const https = require("https");
const parseString = require("xml2js").parseString;

var host = "https://pubchem.ncbi.nlm.nih.gov/rest/pug";
var pathPrefix = "compound";
var postFix = "JSON";

function query(params, callback) {

    var options = {
        query : params.query || [],
        first : params.first || false,
        verbose : params.verbose || false
    }

    var promises = [];

    if ( !Array.isArray(options.query) ) {

        return retrieve( options.query.id, options.query.from, options.query.to, options.first, options.verbose);

    } else {
        options.query.forEach( function( compound ) {

            promises.push(retrieve( compound.id, compound.from, compound.to, options.first, options.verbose ));

        });

        if (!callback || callback == null) {
            return Q.allSettled(promises);
        } else {
            Q.allSettled(promises).then(
                function(values) {
                    callback( null, values);
                },
                function(err) {
                    callback( err );
                }
            );
        }
    }




}

function retrieve( identifier, from, to, first, verbose ) {

    var deferred = Q.defer();

    var url = [host,pathPrefix,from,identifier,to,postFix].join("/");
    
    verbose && console.log("Url: ", url );

    var result = "";
    var req = https.get( url, function( res ) {
        //noinspection JSUnresolvedVariable
        verbose && console.log("statusCode", res.statusCode);
        verbose && console.log("headers:", res.headers);
        //noinspection JSUnresolvedVariable
        if (res.statusCode < 200 || res.statusCode > 299) {
            //noinspection JSUnresolvedVariable
            deferred.reject(res.statusCode);
        }
        res.on( "data", function( chunk ) {
            result += chunk;            
        });
        res.on("end", function( ){
            verbose && console.log("res.on.END", result);
            var parsedResult = JSON.parse(result);
            //noinspection JSUnresolvedFunction
            verbose && console.log("res.on.END", util.inspect(parsedResult,false,null))
            //noinspection JSUnresolvedFunction
            deferred.resolve( parsedResult );
            
        });
    });

    req.on("error", function(e) {
        //noinspection JSUnresolvedFunction
        deferred.reject(e);
    })    

    //noinspection JSUnresolvedVariable
    return deferred.promise;

}

//noinspection JSUnresolvedVariable
module.exports.query = query;