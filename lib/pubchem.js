"use strict";

const Q = require("q");
const util = require("util");
const https = require("https");
//const parseString = require("xml2js").parseString;

var host = "https://pubchem.ncbi.nlm.nih.gov/rest/pug";
var pathPrefix = "compound";
var postFix = "JSON";

function query(params, callback) {

    var options = {
        query : params.query || null,
        first : params.first || false,
        verbose : params.verbose || false
    }

    params.verbose && console.log("query options: ", util.inspect(options, false, null) );

    var promises = [];

    var identifiers;

    if ( options.query && options.query.id ) {
        identifiers = options.query.id;
        params.verbose && console.log("Single id: ", identifiers);
    } else if ( options.query && options.query.ids && Array.isArray( options.query.ids ) ) {
        identifiers = options.query.ids.join(',');
        params.verbose && console.log("Multiple ids: ", identifiers);
    } else {
        params.verbose && console.log("No id!");
        if (callback) {
            callback( new Error("No identifiers"), null);
        } else {
            return null;
        }
    }

    query = retrieve(identifiers, options.query.from, options.query.to, options.first, options.verbose);
    if ( callback ) {
        query.then(
            function( results ) {
                callback( null, results );
            },
            function( err ) {
                callback( err );
            }
        )
    } else {
        return query;
    }

}

function retrieveByPost( identifiers, from, to, first, verbose ) {
    var deferred = Q.defer();

    var url = [host,pathPrefix,from,to,postFix].join("/");

    verbose && console.log( "Post URL: ", url);
    var result = "";

    var postData = identifiers

    var req = https.post( url, postData, function(res) {
        //noinspection JSUnresolvedVariable
        verbose && console.log("statusCode", res.statusCode);
        verbose && console.log("headers:", res.headers);

        //noinspection JSUnresolvedVariable
        verbose && console.log("statusCode", res.statusCode);
        verbose && console.log("headers:", res.headers);

        res.on( "data", function( chunk ) {
            result += chunk;
        });
        res.on("end", function( ){
            verbose && console.log("res.on.END", result);
            var parsedResult = JSON.parse(result);
            //noinspection JSUnresolvedFunction
            verbose && console.log("res.on.END", util.inspect(parsedResult,false,null));
            //noinspection JSUnresolvedFunction
            deferred.resolve( parsedResult );

        });


    } );

    req.on("error", function(e) {
        //noinspection JSUnresolvedFunction
        deferred.reject(e);
    });

    //noinspection JSUnresolvedVariable
    return deferred.promise;

}

function retrieve( identifiers, from, to, first, verbose ) {

    var deferred = Q.defer();

    var url = [host,pathPrefix,from,identifiers,to,postFix].join("/");
    
    verbose && console.log("Url: ", url );

    var result = "";
    var req = https.get( url, function( res ) {
        //noinspection JSUnresolvedVariable
        verbose && console.log("statusCode", res.statusCode);
        verbose && console.log("headers:", res.headers);
//noinspection JSUnresolvedVariable
        verbose && console.log("statusCode", res.statusCode);
        verbose && console.log("headers:", res.headers);
        res.on( "data", function( chunk ) {
            result += chunk;            
        });
        res.on("end", function( ){
            verbose && console.log("res.on.END", result);
            var parsedResult = JSON.parse(result);
            //noinspection JSUnresolvedFunction
            verbose && console.log("res.on.END", util.inspect(parsedResult,false,null));
            //noinspection JSUnresolvedFunction
            deferred.resolve( parsedResult );
            
        });
    });

    req.on("error", function(e) {
        //noinspection JSUnresolvedFunction
        deferred.reject(e);
    });

    //noinspection JSUnresolvedVariable
    return deferred.promise;

}

//noinspection JSUnresolvedVariable
module.exports.query = query;