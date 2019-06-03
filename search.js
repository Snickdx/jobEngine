const documents = require('./documents');
const ReqGraph = require('./ReqGraph');
const fs = require('fs');


async function main() {
	// await ReqGraph.clearDB();
	// await ReqGraph.insertTerms(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M']);
	// await ReqGraph.insertDocuments(documents);
	let docs =  await ReqGraph.reqSearch(['A', 'D', 'J', 'F', 'L', 'E', 'C']);
	ReqGraph.disconnect();
	fs.writeFile('results.json', JSON.stringify(docs), 'utf8', _=>console.log('file written'));
}

main().then(_=>{
	console.log("done");
});

