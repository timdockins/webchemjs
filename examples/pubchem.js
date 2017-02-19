"use strict";

//const WebChemJS = require("./index");
const CIR = require('./../index').CIR;
//const ChemID = require('./index').ChemID;
const PubChem = require('./../index').PubChem;
const Q = require("q");

const util = require("util");
const parseString = require('xml2js').parseString;

var query = {
    ids : ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","30","31","32","33","34","35"],
    from : "cid",
    to : "property/InChiKey"
};

var ids = [];
for ( var i = 1; i < 2000; i++ ) {
    ids.push(i);
}

var query2 = {
    ids : ids,
    from : "cid",
    to : "property/InChiKey,canonicalSMILES"
};


PubChem.query(
    {
        query : query,
        first : false,
        verbose : false
    }
).then(
    function( results ) {
        console.log(util.inspect(results,false,null));
    },
    function(err) {
        console.log("There was an error retrieving the results");
        console.error(err);
        process.exit(1);
    }
);

PubChem.query(
    {
        query : query2,
        first : false,
        verbose : false,
        method : 'POST'
    },
    function( err, results ) {
        console.log(util.inspect(results,false,null));
    }
);

