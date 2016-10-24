"use const";

const ToxNet = require("../index.js").ToxNet;

const Q = require("q");
const _ = require("lodash");
const https = require("https");

const util = require("util");


ToxNet.initialQuery(
    {
        db: "toxline",
        keywords: "agranulocytosis",
        verbose: false
    }
)
    .then(
        function (results) {
            console.log("Initial results", util.inspect(results, false, null));
            var temporaryfile = results.queryresult.temporaryfile;
            var total = parseInt(results.queryresult.count);
            var displayMax = parseInt(results.queryresult.dispmax);
            console.log("There are " + total + " documents.");

            return ToxNet.secondQuery(
                {
                    temporaryfile: temporaryfile,
                    start: 0,
                    verbose: false
                }
            )

        }
    ).then(
    function (results) {
        console.log("Second results", util.inspect(results, false, null));
        var docnumbers = results.docsumset.id.split(' ');

        console.log("Fetching full records", docnumbers.slice(0, -1));
        var docNumberPromises = [];

        docnumbers.forEach(function (docno) {
            docNumberPromises.push(ToxNet.getFullRecord(
                {
                    'db': 'toxline',
                    'docno': docno,
                    'verbose': false
                }
            ));

        });

        return Q.allSettled(docNumberPromises);
    }
).then(function (results) {
    console.log("Full Document results ", util.inspect(results, false, null));
    results = results.slice(0,-1);
    results = results.map(function(result){
        return result.value.doclist.doc;
    });
    // filter out documents that don't have a compound listed

    var filteredResults = results.filter( function( doc ) {
        return doc.hasOwnProperty('rn');
    });


    var compoundsFound = [];


    filteredResults.forEach( function( doc ) {
        if (Array.isArray(doc.rn)){
            doc.rn.forEach( function( compound ) {
                compoundsFound.push( constructHomeBaseCompoundRecord( "unii", compound, "TOXLINE", doc.docno ) );
            })
        } else {
            compoundsFound.push( constructHomeBaseCompoundRecord( "unii", doc.rn, "TOXLINE", doc.docno ) );
        }
    });


    console.log("Found " + compoundsFound.length + " compounds listed in documents.  Some may be duplicate. ");
    return compoundsFound;

})
    .then(
        function( compounds ) {
            console.log("Compounds found: ", util.inspect(compounds, false, null ));
        }
    );






function constructHomeBaseCompoundRecord( identifierType, identifier, source, docno ) {
    var newCompound = {
        recordType : "compound",
        identifiers : {

        },
        documentation : [
            {
                source : source,
                recordIdentifier : docno
            }
        ]
    };

    newCompound.identifiers[ identifierType.toLowerCase() ] = identifier.trim();
    return newCompound;
}