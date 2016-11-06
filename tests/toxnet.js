"use const";

const ToxNet = require( "../index.js" ).ToxNet;

const Q = require( "q" );
const _ = require( "lodash" );
const https = require( "https" );

const parseString = require( "xml2js" ).parseString;

const util = require( "util" );

ToxNet.initialPost( {
        db      : "toxline",
        keywords: "agranulocytosis clozapine",
        all     : true,
        verbose : false
    } )
    .then(
        function ( results ) {
            console.log( "Initial Results: ", util.inspect( results, false, null ) );
            var temporaryfile = results.queryresult.temporaryfile;
            var total = parseInt( results.queryresult.count );
            var displayMax = parseInt( results.queryresult.dispmax );
            console.log( "There are " + total + " documents." );
        },
        function ( err ) {
            console.err( "Error: ", err );
        }
    );


function constructHomeBaseCompoundRecord( identifierType, identifier, source, docno ) {
    var newCompound = {
        recordType   : "compound",
        identifiers  : {},
        documentation: [
            {
                source          : source,
                recordIdentifier: docno
            }
        ]
    };

    newCompound.identifiers[ identifierType.toLowerCase() ] = identifier.trim();
    return newCompound;
}