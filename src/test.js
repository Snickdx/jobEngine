const ReqGraph = require('./ReqGraph');
const fs = require('fs');
const now = require("performance-now");
let terms = require('../terms');
let query = require('../query');

async function main() {
	let init = false;
	for(let arg of process.argv){
		//generate 1000 documents if -g flag present
		if (arg === '-g') {
			await ReqGraph.initialize(undefined, terms, 1000);
			init = true;
		}
	}
	
	//use documents in documents.json as default
	if(!init){
		let documents = require('../documents');
		await ReqGraph.initialize(documents, terms);
	}
	let start = now();
	let results   =  await ReqGraph.reqSearch(query);
	let end = now();
	let time = (start-end).toFixed(3);
	let documents = await ReqGraph.getDocuments();
	let res_ids   = results.map(doc=>doc.id);
	
	let false_negatives = [];//relevant documents which weren't retrieved
	let false_positives = [];
	let true_negatives  = [];
	let true_positives  = [];
	
	for(let doc of documents){
		let selected = res_ids.includes(doc.id);
		let relevant = ReqGraph.isSatisfied(doc, query);
		
		if(selected && !relevant)false_positives.push(doc);
		if(!selected && relevant)false_negatives.push(doc);
		if(selected && relevant)true_positives.push(doc);
		if(!selected && !relevant)true_negatives.push(doc);
	}
	
	let report = {query, time, false_negatives, false_positives, true_negatives, true_positives};
	ReqGraph.disconnect();
	fs.writeFile('report.json', JSON.stringify(report, null, 2), 'utf8', ()=>console.log('Test Report Written'));
}

main();
