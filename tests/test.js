"use strict";

//const WebChemJS = require("./index");
const CIR = require('./../index').CIR;
//const ChemID = require('./index').ChemID;
const PubChem = require('./../index').PubChem;
const Q = require("q");

const util = require("util");
const parseString = require('xml2js').parseString;

/*

    554Z48XN5E
    721M9407IY
    8KQ660G60G
*/

var ids = [
    {
        id : "554Z48XN5E",
        from : "xref/RegistryID",
        to : "property/InChiKey" 
    },
    {
        id : "721M9407IY",
        from : "xref/RegistryID",
        to : "property/InChiKey" 
    },
    {
        id : "8KQ660G60G",
        from : "xref/RegistryID",
        to : "property/InChiKey" 
    }
    
    
];


PubChem.query(
    {
        query : ids,
        first : false,
        verbose : false
    }
).then(
    processPubChemResultsToInChIKey,
    function(err) {
        console.log("There was an error retrieving the results");
        console.error(err);
        process.exit(1);
    }
);


/*
CIR.query(
    {
        compounds : [            
            {
                id : "721M9407IY",
                resolver : "cas_number"
            }
        ],
        representation : "sdf", 
        first : false, 
        verbose : true
    },
    recordResults
);
*/

function processChemIDResult(err, results) {
    if (err) {
        console.log("There was an error retreiving the results");
        console.error(err);
        process.exit();
    }
    results.forEach( function(value){
        



    })
}


function processPubChemResultsToInChIKey( results) {

    console.log(util.inspect(results,false,null));

    var compounds = results.map( function( result ) {
        var InChIKey = result.value.PropertyTable.Properties[0].InChIKey;
        return {
            id:InChIKey,
            resolver : null
        };
    })

    console.log("Compounds: ", compounds);
    
    CIR.query(
        {
            compounds : compounds,
            representation : "sdf",
            first : false,
            verbose : true
        },
        recordResults
    )

    return compounds;

}


function recordResults(err, results) {
    if (err) {
        console.log("There was an error retreiving the results");
        console.error(err);
        process.exit();
    }
    console.log("Final Results");
    console.log(util.inspect(results,false,null));    

}