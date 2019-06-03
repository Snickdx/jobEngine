const ReqGraph = require('./ReqGraph');
const fs = require('fs');


async function main() {
	let init = false;
	let query = ['A', 'D', 'J', 'F', 'E', 'C', 'L', 'M', 'I'];
	for(let arg in process.argv){
		if (arg === '-g') {
			await ReqGraph.initialize();
			init = true;
		}
	}
	
	if(!init){
		let documents = require('../documents');
		let terms = require('../terms');
		await ReqGraph.initialize(documents, terms);
	}
	
	let results   =  await ReqGraph.reqSearch(query);
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
	
	let report = {query, false_negatives, false_positives, true_negatives, true_positives};
	ReqGraph.disconnect();
	fs.writeFile('report.json', JSON.stringify(report, null, 2), 'utf8', ()=>console.log('Test Report Written'));
}

main();
