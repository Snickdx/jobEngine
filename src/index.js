const documents = require('../documents');
const terms = require('../terms');
const ReqGraph = require('./ReqGraph');
const fs = require('fs');
let Document = require('./document');


async function initialize(){
	await ReqGraph.clearDB();
	await ReqGraph.insertTerms(terms);
	await ReqGraph.insertDocuments(documents);
}

async function main() {
	let query = ['A', 'D', 'J', 'F', 'L', 'E', 'C'];
	let docs =  await ReqGraph.reqSearch(query);
	docs.forEach(doc=>console.log(ReqGraph.isSatisfied(doc, query)));
	ReqGraph.disconnect();
	//fs.writeFile('results.json', JSON.stringify(docs, null, 2), 'utf8', _=>console.log('file written'));
}

main().then(_=>{
	console.log("done");
});

