const ReqGraph = require('./ReqGraph');
const fs = require('fs');
const now = require("performance-now");
let query = require('../query');

async function main(filename='report.json') {
	
	let start = now();
	let results   =  await ReqGraph.reqSearch(query);
	let end = now();
	let time = (end-start).toFixed(3);
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
	
	let report = {
		query,
		time,
		stats:{
			fn: false_negatives.length,
			fp: false_positives.length,
			tn: true_negatives.length,
			tp: true_positives.length,
		},
		false_negatives,
		false_positives,
		true_negatives,
		true_positives
	};
	ReqGraph.disconnect();
	fs.writeFile(filename, JSON.stringify(report, null, 2), 'utf8', ()=>console.log('Test Report Written'));
}

main();
