/**
 * Created by tim on 10/30/16.
 */
const NDFRT = require("../index").NDFRT;
const util = require("util");

/*
 * findConceptsByName
 * params : { conceptName : 'aspirin', kindName : 'DRUG_KIND' }
 */
NDFRT.findConceptsById({
    query : { idType : 'UNII', idString : '27O7W4T232'}, verbose : false
}).then( getNUIOfDrugKind,function(err) {
    console.log(err);
}).then( function( conceptnui ) {

    console.log("finally", conceptnui);
    if (conceptnui) {
        NDFRT.getEPCClassOfConcept({ query : {
            nui : conceptnui
        }}).then( function( result ) {
            console.log('got class = ', result.ndfrtdata.groupconcepts.concept.conceptname );
        })
    } else {
        console.log('nothing found')
    }


});

function getNUIOfDrugKind( result ) {
    var concepts = result.ndfrtdata.groupconcepts;
    var nui = false;

    if (Array.isArray(concepts)) {
        concepts.forEach( function( concept ) {
            if (concept.conceptkind == 'DRUG_KIND') {
                nui = concept.conceptnui;
                return false;
            }
        })
    } else {
        if (concepts.concept.conceptkind == 'DRUG_KIND') {
            nui = concepts.concept.conceptnui;
        }
    }
    return nui;
}