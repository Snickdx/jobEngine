const documents = require('../documents');
const terms = require('../terms');
const ReqGraph = require('./ReqGraph');

async function main(){
	await ReqGraph.initialize(documents, terms);
	ReqGraph.disconnect();
}

main().then(_=>console.log('Graph Initialized!'));
