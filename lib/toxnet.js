/*
 * For searching TOXNET databases
 * https://toxnet.nlm.nih.gov/toxnetapi/TOXNETWebService.html
 */
'use strict';

const Q = require("q");
const util = require("util");
const https = require("https");
const parseString = require("xml2js").parseString;
const querystring = require("querystring");

var host = "https://toxgate.nlm.nih.gov";
var pathPrefix = "cgi-bin/sis/search2";


module.exports.initialQuery  = initialQuery;
module.exports.secondQuery   = secondQuery;
module.exports.getFullRecord = getFullRecord;

/*
 *  retrieve is separated from the query to handle async calls.  retrieve() returns a promise.
 */
function initialQuery(params, callback) {

    var options = {
        db: params.db || "toxline",
        keywords: querystring.escape(params.keywords || "agranulocytosis"),
        verbose: params.verbose || false
    };

    if ( callback ) {
        // var query = [initialRetrieve("/x?", options.db, options.keywords, options.verbose)];
        //
        // Q.allSettled(query).then(
        //     function (result) {
        //         params.verbose && console.log("Result:", result);
        //         callback(null, result);
        //     },
        //     function (err) {
        //         callback(err);
        //     }
        // );
        initialRetrieve("/x?", options.db, options.keywords, options.verbose).then(
            function (result) {
                params.verbose && console.log("Result:", result);
                callback(null, result);
            },
            function (err) {
                callback(err);
            }
        )
    } else {
        return initialRetrieve("/x?", options.db, options.keywords, options.verbose);
    }

}

function initialRetrieve(typeOp, db, keywords, verbose) {

    var deferred = Q.defer();

    var url = [host, pathPrefix].join("/");
    url += typeOp + "dbs+" + db + ":" + keywords;

    if (verbose) { console.log("Url: ", url) }

    retrieveWithCallback(url, verbose, function(err, result) {
        parseString(result, {
            strict: false,
            emptyTag: '',
            normalizeTags: true,
            explicitArray: false
        }, function (err, parsedResult) {
            verbose && console.log("Parsed: ", parsedResult);
            deferred.resolve(parsedResult);
        });
    });
    
    return deferred.promise;

}

function secondQuery(params, callback) {
    // console.log("secondQuery: ", params);
    var options = {
        "temporaryfile" : params.temporaryfile,
        "start"         : params.start,
        "verbose"       : params.verbose
    };

    if (callback) {
        secondRetrieve(options.temporaryfile, options.start, options.verbose).then(
            function( result ) {
                callback(null, result);
            },
            function(err) {
                callback( err );
            }
        )
    } else {
        return secondRetrieve( options.temporaryfile, options.start, options.verbose);
    }


}

function secondRetrieve(temporaryFile, n, verbose) {
    var deferred = Q.defer();

    var url = [host,pathPrefix].join('/');
    url += "/g?" + temporaryFile + ":" + n;
    
    verbose && console.log("Url: ", url);

    retrieveWithCallback( url, verbose, function(err, result) {
        if (err) {
            deferred.reject(err);
        }
        parseString(result, {
            strict: false,
            emptyTag: '',
            normalizeTags: true,
            explicitArray: false
        }, function (err, parsedResult) {
            verbose && console.log("Parsed: ", parsedResult);
            deferred.resolve(parsedResult);
        })
    });

    return deferred.promise;
}

function getFullRecord(params, callback) {
    var options = {
        'db' : params.db || 'toxline',
        'docno' : params.docno || '',
        'verbose' : params.verbose || false
    };
    if ( callback ) {
        retrieveFullRecord(options.db, options.docno, options.verbose).then(
            function(result) {
                callback(null,result);
            },
            function(err) {
                callback(err);
            }
        )
    } else {
        return retrieveFullRecord(options.db, options.docno, options.verbose);
    }

}

function retrieveFullRecord( db, docno, verbose ) {
    var deferred = Q.defer();

    var url = [host,pathPrefix].join('/');
    url += "/z?dbs+" + db + ":@term+@DOCNO+" + docno ;
    
    verbose && console.log("Url: ", url);

    retrieveWithCallback( url, verbose, function(err, result) {
        if (err) {
            deferred.reject(err);
        }
        parseString(result, {
            strict: false,
            emptyTag: '',
            normalizeTags: true,
            explicitArray: false
        }, function (err, parsedResult) {
            verbose && console.log("Parsed: ", parsedResult);
            deferred.resolve(parsedResult);
        })
    });

    return deferred.promise;
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