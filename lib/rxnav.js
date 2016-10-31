/**
 * Created by tim on 10/30/16.
 */
/*
 * API information: https://rxnav.nlm.nih.gov/NdfrtAPIs.html#
 * base information: https://rxnav.nlm.nih.gov/index.html
 *
 *
 *
 */

const Q = require("q");
const https = require("https");
const parseString = require("xml2js").parseString;
const queryString = require("querystring");

const util = require("util");

const base = "https://rxnav.nlm.nih.gov/REST/Ndfrt";



var NDFRT = {
    findConceptsById : queryFactory( "/id"),
    findConceptsByName : queryFactory( "/search" ),
    getEPCClassOfConcept : queryFactory("/EPCC")
};

module.exports.NDFRT = NDFRT;


function queryFactory ( postfix ) {
    return function( options, callback) {

        var deferred = Q.defer(); // maybe used later

        var query = options.query;

        var verbose = options.verbose || false;
        var url = base + postfix + '?' + queryString.stringify( query );

        retrieveWithCallback(url, verbose, function( err, result ) {

            if (err) {
                if (callback) {
                    callback(err);
                } else {
                    deferred.reject(err);
                }
            } else {
                parseString( result, {
                    strict: false,
                    emptyTag: '',
                    normalizeTags:true,
                    explicitArray:false
                }, function( err, parsedResult) {
                    verbose && console.log( util.inspect(parsedResult, false, null ));
                    if (err) {
                        if (callback) {
                            callback(err);
                        } else {
                            deferred.reject(err);
                        }
                    } else {
                        if (callback) {
                            callback(null, parsedResult);
                        } else {
                            deferred.resolve(parsedResult);
                        }
                    }

                })
            }


        })

        if (!callback) {
            return deferred.promise;
        }

    };
}

function retrieveWithCallback( URL, verbose, callback ) {
    var result = "";
    var req = https.get(URL, function (res) {
        verbose && console.log("statusCode", res.statusCode);
        verbose && console.log("headers:", res.headers);
        if (res.statusCode < 200 || res.statusCode > 299) {
            callback(res.statusCode);
        }
        res.on("data", function (chunk) {
            result += chunk;
        });
        res.on("end", function () {
            verbose && console.log("retrieved: ", result);
            callback( null, result );

        });
    });

    req.on("error", function (e) {
        callback(e);
    });
}