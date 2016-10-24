# webchemjs

WebChemJS is a port of the R package WebChem to JavaScript for Node.js.

You can currently query the following:

- [PubChem](https://www.ncbi.nlm.nih.gov/pccompound/)
- [CIR: Chemical Identifier Resolver](https://cactus.nci.nih.gov/chemical/structure)
- [TOXLINE](https://toxnet.nlm.nih.gov/newtoxnet/toxline.htm) 

(others coming soon)

## Package Status - ALPHA
This is an initial commit on this project and is in a very rough ALPHA stage.
I am currently constructing on an as-needed basis.  Anyone wishing to contribute, please drop me a line.

## General Usage
The submodules of this package can be used in a "promise-style" or "callback" fashion.
Each submodule offers a set of query functions that provide an interface to
the APIs provided by the associated data services.

Each query takes in an options parameter and asynchronously calls the related service accordingly.
If a callback is provided, the callback will be called with the error state and the results of the call.
If a callback is not provided, the query will return a promise (see https://github.com/kriskowal/q)

For example:

```javascript
const PubChem = require('webchemjs').PubChem;
const util = require('util');

PubChem.query(
    {
        query : [
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
        ],
        first : false,
        verbose : false
    },
    processResults
    
);

function processResults(err, results) {
    if (err) {
        console.log(err);
        process.exit(-1);
    }
    console.log("results: ", util.inspect(results,false,null));

}

```

## Installation

`npm install webchemjs --save`

## Testing

There is no real testing at the moment.  Anything named test is simply an example.