const ReqGraph = require('./ReqGraph');
const fs = require('fs');
const now = require("performance-now");
let generator = require('./generator');

function average(data){
	let sum = data.reduce((sum, value)=> sum + value, 0);
	return sum / data.length;
}

function standardDeviation(values){
	let avg = average(values);
	let squareDiffs = values.map(value=>Math.pow(value - avg, 2));
	return Math.sqrt(average(squareDiffs));
}


async function main(query=require('../query'), filename='report.json', numTrials=4) {
	
	let times = [];
	let results;
	for(let i=0; i<numTrials; i++){
		let start = now();
		results  =  await ReqGraph.reqSearch(query);
		let end = now();
		times.push(parseFloat((end-start).toFixed(3)));
	}
	
	let time = `${average(times)} +/- ${standardDeviation(times)}`;
	
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
		times,
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

async function batchTest(){
	let complexityLevels = [
		{MAX_NUM_COMBOS:2, MAX_COMBO_SIZE:5, MAX_COMBO_AMT:2, MAX_MAND_SIZE:5},
		{MAX_NUM_COMBOS:4, MAX_COMBO_SIZE:10, MAX_COMBO_AMT:5, MAX_MAND_SIZE:5},
		{MAX_NUM_COMBOS:8, MAX_COMBO_SIZE:15, MAX_COMBO_AMT:10, MAX_MAND_SIZE:10},
	];
	
	let queries = [
		["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O"],
		["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
		["A", "B", "C", "D", "E"],
	];
	
	let i=1;
	
	for (let level of complexityLevels){
		let terms = require('../terms');
		let documents = generator.generateDocuments(1000, terms, level);
		await ReqGraph.initialize(documents, terms);
		for (let query of queries){
			await main(query, `test${i++}.json`, 10);
		}
	}
}

batchTest().then(_=>{
	console.log('Batch Test Done!');
});


//main();
