"use const";

const ToxNet = require("../index.js").ToxNet;

const expect = require('chai').expect;

const util = require("util");

ToxNet.initialQuery(
    {
        "db" : "toxline",
        keywords : "agranulocytosis",
        verbose : false
    },
    function( err, results ) {
        console.log("Final Results", util.inspect(results, false, null));        
        var temporaryfile = results[0].value.queryresult.temporaryfile;

        ToxNet.secondQuery(
            {
                "temporaryfile" : temporaryfile,
                "start"         : 0,
                "verbose"       : false
            },
            function(err, results) {
                // console.log("secondQuery: ", util.inspect(results, false, null));

                var docnumbers = results.docsumset.id.split(' ');

                console.log("Fetching full records", docnumbers.slice(0,-1));
                
                docnumbers.forEach( function(docno) {
                    console.log('Fetching RNs : ', docno);
                    ToxNet.getFullRecord(
                        {
                            'db' : 'toxline',
                            'docno' : docno,
                            'verbose' : false
                        },
                        function( err, results) {
                            // console.log("Full Document:", util.inspect(results, false, null));

                            var rn = results.doclist.doc.hasOwnProperty('rn') ? results.doclist.doc.rn : [];

                            rn.forEach(function(r) {
                                console.log("RN:", r);    
                            })

                        }
                    );                    
                });
                                
                

            }
        );

    }
)
