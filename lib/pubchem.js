"use strict";

const Q     = require( "q" );
const util  = require( "util" );
const https = require( "https" );
const querystring = require( "querystring" );
//const parseString = require("xml2js").parseString;

var host       = "https://pubchem.ncbi.nlm.nih.gov";
var hostname       = "pubchem.ncbi.nlm.nih.gov";
var pathPrefix = "rest/pug/compound";
var postFix    = "JSON";

function query( params, callback ) {

    var options = {
        query   : params.query || null,
        first   : params.first || false,
        verbose : params.verbose || false,
        format  : params.format || null,
        method  : params.method || 'GET'
    };

    params.verbose && console.log( "query options: ", util.inspect( options, false, null ) );

    var promises = [];

    var identifiers;

    if ( options.query && options.query.id ) {
        identifiers = options.query.id;
        params.verbose && console.log( "Single id: ", identifiers );
    } else if ( options.query && options.query.ids && Array.isArray( options.query.ids ) ) {
        identifiers = options.query.ids.join( ',' );
        params.verbose && console.log( "Multiple ids: ", identifiers );
    } else {
        params.verbose && console.log( "No id!" );
        if ( callback ) {
            callback( new Error( "No identifiers" ), null );
        } else {
            return null;
        }
    }

    if ( options.method && options.method.toLowerCase() == 'post' ) {
        params.verbose && console.log( "posting" );
        query = retrieveByPost( identifiers, options.query.from, options.query.to, options.first, options.format, options.verbose );
    } else {
        params.verbose && console.log( "getting" );
        query = retrieve( identifiers, options.query.from, options.query.to, options.first, options.format, options.verbose );
    }

    if ( callback ) {
        query.then(
            function ( results ) {
                callback( null, results );
            },
            function ( err ) {
                callback( err );
            }
        )
    } else {
        return query;
    }

}

function retrieveByPost( identifiers, from, to, first, format, verbose ) {
    var deferred = Q.defer();

    var pathItems = [ "", pathPrefix, from, to ];
    if (format) {
        pathItems.push(format);
    }
    var path = pathItems.join( "/" );

    verbose && console.log( "Post hostname: ", hostname );
    verbose && console.log( "Post path: ", path );
    var result = "";

    var postData     = {};
    postData[ from ] = identifiers;

    postData = querystring.stringify(postData);
    verbose && console.log("posting: ", postData );
    var req = https.request(
        {
            hostname    : hostname,
            port : 443,
            path    : path,
            method  : 'POST',
            headers : {
                'Content-Type'   : 'application/x-www-form-urlencoded',
                'Content-Length' : Buffer.byteLength( postData )
            }
        }, function ( res ) {
            //noinspection JSUnresolvedVariable
            verbose && console.log( "statusCode", res.statusCode );
            verbose && console.log( "headers:", res.headers );

            res.on(
                "data", function ( chunk ) {
                    result += chunk;
                }
            );

            res.on(
                "end", function () {
                    verbose && console.log( "res.on.END", result );
                    var parsedResult = (format && format == "JSON") ? JSON.parse( result ) : result;
                    //noinspection JSUnresolvedFunction
                    verbose && console.log( "res.on.END", util.inspect( parsedResult, false, null ) );
                    //noinspection JSUnresolvedFunction
                    deferred.resolve( parsedResult );

                }
            );


        }
    );

    req.on(
        "error", function ( e ) {
            verbose && console.log("error", e);
            //noinspection JSUnresolvedFunction
            deferred.reject( e );
        }
    );

    req.write( postData );
    req.end();
    //noinspection JSUnresolvedVariable
    return deferred.promise;

}

function retrieve( identifiers, from, to, first, format, verbose ) {

    var deferred = Q.defer();

    var pathItems = [  host, pathPrefix, from, identifiers, to ];
    if (format) {
        pathItems.push(format);
    }

    var url = pathItems.join( "/" );

    console.log( "Url: ", url );

    var result = "";
    var req    = https.get(
        url, function ( res ) {
            //noinspection JSUnresolvedVariable
            verbose && console.log( "statusCode", res.statusCode );
            verbose && console.log( "headers:", res.headers );
//noinspection JSUnresolvedVariable
            verbose && console.log( "statusCode", res.statusCode );
            verbose && console.log( "headers:", res.headers );
            res.on(
                "data", function ( chunk ) {
                    result += chunk;
                }
            );
            res.on(
                "end", function () {
                    verbose && console.log( "res.on.END", result );
                    var parsedResult = (format && format == "JSON") ? JSON.parse( result ) : result;
                    //noinspection JSUnresolvedFunction
                    verbose && console.log( "res.on.END", util.inspect( parsedResult, false, null ) );
                    //noinspection JSUnresolvedFunction
                    deferred.resolve( parsedResult );

                }
            );
        }
    );

    req.on(
        "error", function ( e ) {
            //noinspection JSUnresolvedFunction
            deferred.reject( e );
        }
    );

    //noinspection JSUnresolvedVariable
    return deferred.promise;

}

//noinspection JSUnresolvedVariable
module.exports.query = query;