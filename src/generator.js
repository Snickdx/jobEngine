let Document = require('./document');
let fs = require('fs');
let Sets = require('./sets');

// const MAX_COMBO_AMT = 3;//max amt value for amt in a ocmbo
// const MAX_NUM_COMBOS = 6;//max num of combos per document
// const MAX_MAND_SIZE = 5;//max number of mandatory terms per document
// const MAX_COMBO_SIZE = 5;//max num of terms per combo


function printDocuments(documents){
    for(let doc of documents){
        doc.requirements.combinations = JSON.stringify(doc.requirements.combinations);
        console.table(doc.requirements);
    }
}

/**
 *
 * @param amt
 * @param terms
 * @param MAX_NUM_COMBOS
 * @param MAX_MAND_SIZE
 * @param MAX_COMBO_SIZE
 * @param MAX_COMBO_AMT
 * @returns {Array}
 */
function generateDocuments(amt, terms, {MAX_NUM_COMBOS, MAX_COMBO_SIZE, MAX_COMBO_AMT, MAX_MAND_SIZE}){
    let documents = [];
    console.log('Generating ', amt, ' documents');
    for(let i=0; i<amt; i++){
        let numCombo = Sets.genNum(0, MAX_NUM_COMBOS);
        
        let mand = Sets.genSubset(terms, Sets.genNum(2, MAX_MAND_SIZE));
        let remaining = Sets.difference(terms, mand);
        let newdoc = new Document(mand);
        
        for(let j=0; j<numCombo; j++){
        	let amt, list;
        	do{
		        amt = Sets.genNum(1, MAX_COMBO_AMT);
		        listSize = Sets.genNum(amt+1, MAX_COMBO_SIZE);
		        list =  Sets.genSubset(remaining, listSize);
	        }while(amt >= list.length);
	        newdoc.addComboRequirement(amt, list);
        }
        documents.push(newdoc);
    }
    //printDocuments(documents);
	// JSON.stringify(JSON.parse(JSON.stringify(documents))
    fs.writeFile('documents.json', JSON.stringify(documents, null, 2), 'utf8', _=>console.log("file written"));
    return documents;
}

if (typeof require !== 'undefined' && require.main===module) {
	
	 let MAX_NUM_COMBOS = process.env.npm_package_config_maxCombos || 6;
	 let MAX_COMBO_SIZE = process.env.npm_package_config_maxComboSize || 5;
	let MAX_COMBO_AMT = process.env.npm_package_config_maxComboAmt || 3;
	let MAX_MAND_SIZE  = process.env.npm_package_config_maxMand || 5;
	let amt = process.env.npm_package_config_documentAmt || 1000;
	 let terms = require('../terms');
	 console.log('Generating with options: , ',{MAX_NUM_COMBOS, MAX_COMBO_SIZE, MAX_COMBO_AMT, MAX_MAND_SIZE,});
	generateDocuments(amt, terms, {MAX_NUM_COMBOS, MAX_COMBO_SIZE, MAX_COMBO_AMT, MAX_MAND_SIZE});
	console.log('documents generated!');
}
