const ReqGraph = require('./ReqGraph');
const fs = require('fs');
const now = require("performance-now");
let converter = require('json-2-csv');
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

function writeCSVReport(report){
	let arr=[];
	for(let [key, value] of Object.entries(report)){
		let {list, ...rest} = value;
		arr.push(rest);
	}
	
	converter.json2csv(arr, (err, csv)=>{
		if(err)console.log("Error creating csv", err);
		fs.writeFileSync('output.csv', csv);
	});
}

/**
 *
 * @param query
 * @param numTrials
 * @returns {Promise<*>}
 * @description Runs a query on graph multiple times and returns the results of all trials
 */
async function runQueries(query, numTrials) {
	let times = [];
	let results;
	for(let i=0; i<numTrials; i++){
		let start = now();
		results  =  await ReqGraph.reqSearch(query);
		let end = now();
		times.push(parseFloat((end-start).toFixed(3)));
	}
	return times;
}

async function batchTest(){
	let complexityLevels = {
		'L1':{MAX_NUM_COMBOS:2, MAX_COMBO_SIZE:5, MAX_COMBO_AMT:2, MAX_MAND_SIZE:5},
		'L2':{MAX_NUM_COMBOS:4, MAX_COMBO_SIZE:10, MAX_COMBO_AMT:5, MAX_MAND_SIZE:5},
		'L3':{MAX_NUM_COMBOS:8, MAX_COMBO_SIZE:15, MAX_COMBO_AMT:10, MAX_MAND_SIZE:10},
	};
	
	let queries = {
		'Q1':["A", "B", "C", "D", "E"],
		'Q2':["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
		'Q3':["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O"],
		'Q4':["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"],
		'Q5':["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y"],
	};
	
	let numGenerations = 4;
	
	let report = {
		'L1Q1':{
			average:0,
			std:0,
			list:[]
		},
		'L1Q2':{
			average:0,
			std:0,
			list:[]
		},
		'L1Q3':{
			average:0,
			std:0,
			list:[]
		},
		'L1Q4':{
			average:0,
			std:0,
			list:[]
		},
		'L1Q5':{
			average:0,
			std:0,
			list:[]
		},
		'L2Q1':{
			average:0,
			std:0,
			list:[]
		},
		'L2Q2':{
			average:0,
			std:0,
			list:[]
		},
		'L2Q3':{
			average:0,
			std:0,
			list:[]
		},
		'L2Q4':{
			average:0,
			std:0,
			list:[]
		},
		'L2Q5':{
			average:0,
			std:0,
			list:[]
		},
		'L3Q1':{
			average:0,
			std:0,
			list:[]
		},
		'L3Q2':{
			average:0,
			std:0,
			list:[]
		},
		'L3Q3':{
			average:0,
			std:0,
			list:[]
		},
		'L3Q4':{
			average:0,
			std:0,
			list:[]
		},
		'L3Q5':{
			average:0,
			std:0,
			list:[]
		}
	};
	
	for (let [levelKey, levelVal] of Object.entries(complexityLevels)){
		let terms = require('../terms');
		for(let i=0; i<numGenerations; i++){
			let documents = generator.generateDocuments(1000, terms, levelVal);
			await ReqGraph.initialize(documents, terms);
			for (let [queryKey, queryVal] of Object.entries(queries)){
				let times = await runQueries(queryVal, 10);
				report[levelKey+queryKey].querySize = queryVal.length;
				report[levelKey+queryKey].level = levelKey;
				times.map(time=>report[levelKey+queryKey].list.push(time));
			}
		}
	}

	for(let key in report){
		let items = report[key].list;
		report[key].average = average(items);
		report[key].std = standardDeviation(items);
	}
	
	fs.writeFileSync('perfReport.json', JSON.stringify(report, null, 2), 'utf8');
	writeCSVReport(report);
}

batchTest().then(_=>{
	console.log('Perf Test Done!');
});



