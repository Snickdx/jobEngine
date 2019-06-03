const documents = require('../documents');
const terms = require('../terms');
const query= require('../query');
const ReqGraph = require('./ReqGraph');
const fs = require('fs');




async function main() {
	await ReqGraph.initialize();
	let docs =  await ReqGraph.reqSearch(query);
	ReqGraph.disconnect();
	fs.writeFile('results.json', JSON.stringify(docs, null, 2), 'utf8', _=>console.log('Search Completed.'));
}

main().then(_=>{
	console.log("done");
});

