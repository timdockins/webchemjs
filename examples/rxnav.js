/**
 * Created by tim on 10/30/16.
 */
const NDFRT = require("../index").NDFRT;
const util = require("util");

/*
 * This simple example shows how you would get at the Established Pharmacological Class of a drug.
 * One has to find the appropriate NUI to get the class from the EPCClassOfConcept resource.
 * It is simple to chain these calls through the use of promises/then.
 */

/*
 * findConceptsByName
 * params : { conceptName : 'aspirin', kindName : 'DRUG_KIND' }
 */

NDFRT.findConceptsByName({
    query : { conceptName : 'aspirin', kindName : 'DRUG_KIND' }, verbose : true
}).then( getNUIOfDrugKind, function( err ) {
    console.log(err);
}).then( getDrugClassFromConceptNUI );


NDFRT.findConceptsById({
    query : { idType : 'UNII', idString : '27O7W4T232'}, verbose : true
}).then( getNUIOfDrugKind,function(err) {
    console.log(err);
}).then( getDrugClassFromConceptNUI );

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

function getDrugClassFromConceptNUI ( conceptnui ) {

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


}