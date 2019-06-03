let Document = require('./document');
let fs = require('fs');
const Comb = require('js-combinatorics');
let Sets = require('./sets');

const MAX_COMBO_AMT = 3;
const MAX_NUM_COMBOS = 6;
const MAX_MAND_SIZE = 5;
const MAX_COMBO_SIZE = 5;


function printDocuments(documents){
    for(let doc of documents){
        doc.requirements.combinations = JSON.stringify(doc.requirements.combinations);
        console.table(doc.requirements);
    }
}

/**
 * Randomly generates documents and requirements
 * @param amt
 * @param terms
 */
function generateDocuments(amt, terms){
    let documents = [];
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
}



//version 1 no nested combos
// function generateDocuments(amt){
// 	let documents = [];
// 	for(let i=0; i<amt; i++){
// 		let numCombo = genNum(0, MAX_NUM_COMBOS);
// 		let mand = genSubset(terms, genNum(2, MAX_MAND_SIZE));
// 		let remaining = difference(terms, mand);
// 		let newdoc = new Document(mand);
//
// 		for(let j=0; j<numCombo; j++){
//
// 			if(remaining.length < 2)break;
//
// 			let amt = genNum(1, MAX_COMBO_AMT);
// 			let listSize;
//
// 			if(MAX_COMBO_SIZE < remaining.length){
// 				listSize = genNum(amt+1, MAX_COMBO_SIZE);
// 			}else{
// 				listSize = genNum(amt+1, remaining.length);
// 			}
//
// 			let list =  genSubset(remaining, listSize);
// 			if(list.length > 2)
// 				newdoc.addComboRequirement({amt, list});
// 			remaining = difference(remaining, list);
// 		}
// 		documents.push(newdoc);
// 	}
// 	printDocuments(documents);
// 	//fs.writeFile('documents.json', JSON.stringify(JSON.parse(JSON.stringify(documents)), null, 2), 'utf8', _=>console.log("file written"));
// }

let terms = ['term1', 'term2', 'term3', 'term4', 'term5', 'term6', 'term7', 'term8', 'term9', 'term10', 'term11', 'term12', 'term13', 'term14', 'term15', 'term16', 'term17', 'term18'];


generateDocuments(20, ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M']);
