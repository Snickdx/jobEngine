let Document = require('./document');
var fs = require('fs');


let terms = ['term1', 'term2', 'term3', 'term4', 'term5', 'term6', 'term7', 'term8', 'term9', 'term10', 'term11', 'term12', 'term13', 'term14', 'term15'];



function genNum(max) {
    return parseInt(Math.random() * (max - 2) + 2);
}

//creates a random subset form set given
function genSubset(array, max){

    let subset = new Set();
    let subsetSize = genNum(max);

    for(let i=0; i<subsetSize; i++){  
        subset.add(array[genNum(array.length)-1]);
    }

    res = [];
    subset.forEach(ele=>res.push(ele));
    return res;
}

//calculate set difference
function difference(A, B){
    let res = [];
    let setA = new Set(A), setB = new Set(B);
    for (let element of B){
        if(setA.has(element))
            setA.delete(element)
    }

    setA.forEach(ele=>res.push(ele));
    return res;
}


//version 1 no nested combos
function generateDocuments(amt){
    let documents = [];
    
    for(let i=0; i<amt; i++){
        let numCombo = genNum(3);
        let mand = genSubset(terms, 5);
        let remaining = difference(terms, mand);
        let newdoc = new Document(mand);

        for(let j=0; j<numCombo; j++){
            let list = genSubset(remaining);
            let amt = genNum(list.length - 1);
            if(remaining.length > 1)
                newdoc.addComboRequirement({amt, list});
            remaining = difference(remaining, list);
        }
        documents.push(newdoc);
    }

    console.table(documents);
    fs.writeFile('documents.json', json, 'utf8', _=>console.log("file written"));
}

generateDocuments(10);