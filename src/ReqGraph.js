const neo4j = require('neo4j-driver').v1;
const generator = require('./generator');
const config = {
	"dbhost":"bolt://localhost:7687",
	"dbport":7687,
	"dbuser":"neo4j",
	"dbpass":"snickpass"
};

const NUM_DOCS = 100;

const driver = neo4j.driver(config.dbhost, neo4j.auth.basic(config.dbuser, config.dbpass));

function startSession(){
	return driver.session();
}

/**
 * @description
 * @param {string} name
 * @return {Promise} which resolves when query runs successfully
 */
async function createTerm(name){
	let session = startSession();
	let query = `Merge (t:Term{name:'${name}'}) return *`;
	let result =  await session.run(query);
	session.close();
	return result;
}

/**
 * @name CreateDocument
 * @function
 * @param {object} document
 * @param {string} document.name -in
 * @param {object} document.requirements
 *
 * @desc creates a document node in database if it doesn't exist. using es6 object destructuring to create variables
 *      of the properties of the parameter object {@link httpt://simonsmith.io/destructuring-objects-as-function-parameters-in-es6/}
 */
async function createDocument({name, requirements}){
	
	let session = startSession();
	let promises = [];
	let query = `MERGE (d:Document{name:'${name}', requirements:'${JSON.stringify(requirements)}'}) return d`;
	let res = await session.run(query);
	session.close();
	await addMandatoryRequirements(name, requirements.mandatory);
	if(requirements.hasOwnProperty('combinations')){
		for(let combo of requirements.combinations){
			promises.push(addComboRequirement(name, combo));
		}
	}
	Promise.all(promises);
	return res;
}


async function getDocumentByName(name){

}
// match (n:Document{name:'document11'} )-[r]->(m) optional match (m)-[s]->(o) return *

/**
 * @description
 * @param {String} documentName - name of document
 * @param {String[]} terms - list of terms
 * @return {Promise} which resolves when query runs successfully
 */
async function addMandatoryRequirements(documentName, terms){
	let session = startSession();
	let query = `MATCH (t:Term), (p:Document{name:'${documentName}'}) where t.name IN [ '${terms[0]}'`;
	query=terms.splice(1).reduce(((acc, cur)=>`${acc}, `+`'${cur}'`),query);
	query+=`] with p, collect(t) as terms foreach(term In terms | merge (p)-[:requires]->(term)) return *`;
	let res = await session.run(query);
	session.close();
	return res;
}

/**
 * @description
 * @param {String} document - name of document
 * @param {Object} combination
 * @param {String[]} combination.list - list of terms
 * @param {int} combination.amt - amount of terms required from list
 * @return {Promise} which resolves when query runs successfully
 */
async function addComboRequirement(document, combination){
	let session = startSession();
	let query = `MATCH (t:Term), (p:Document {name: '${document}' }) WHERE t.name IN [ '${combination.list[0]}'`;
	query = combination.list.splice(1).reduce((acc, cur)=>`${acc}, `+`'${cur}'`, query);
	query+=`] WITH p, COLLECT(t) AS terms CREATE (p)-[:requires]->(c: Combo {amt:${combination.amt}}) FOREACH(s IN terms | create (c)-[:contains]->(s))RETURN *`;
	let res = await session.run(query);
	session.close();
	return res;
}

/**
 * @description Inserts an array of term objects int db
 * @param terms
 * @returns {Promise<result[]>} array of createTerm results
 */
async function insertTerms (terms){
	terms = terms.map((sub, i)=>{
		console.log(`Creating term ${i}`);
		return createTerm(terms[i]);
	});
	terms = Promise.all(terms);
	console.log("terms created");
	return terms;
}

/**
 * @description Inserts an array of document objects into db
 * @param progs
 * @returns {Promise<result[]>} array containing result of individual createDocument calls
 */
async function insertDocuments(progs){
	progs = progs.map((p, i)=>{
		console.log(`Creating document ${i+1}/${progs.length}`);
		return createDocument(progs[i]);
	});
	progs = Promise.all(progs);
	console.log("Documents created");
	return progs;
}


/**
 * @description - gets all documents which requirements are met by the given term list
 * @param terms {Object[]} - array of  term objects
 * @returns {Promise<void>}
 */
async function reqSearch(terms){
	let progs = [];
	let session = startSession();
	let arry = `${JSON.stringify(terms)}`;
	let query = `MATCH (t:Term), (d:Document) WHERE t.name in ${arry}
WITH collect(t) as query, d
MATCH (d:Document)-[:requires]->(t:Term)
WITH d, query, COLLECT(t) AS mandatories WHERE ALL(n IN mandatories WHERE n IN query) AND NOT (d)-->(:Combo)
RETURN d
UNION
MATCH (t:Term), (d:Document) WHERE t.name in ${arry}
WITH collect(t) as query, d
MATCH (d:Document)-[:requires]->(t:Term)
WITH d, query, COLLECT(t) AS mandatories WHERE ALL(n IN mandatories WHERE n IN query)
MATCH (d)-[:requires]->(c:Combo)-[:contains]->(t:Term)
with d, c, query, collect(t) as list
with d, query, collect({amt:c.amt, set:list}) as combos
where all(combo in combos where combo.amt <= size(apoc.coll.intersection(query, combo.set)))
return d order by d.name`;
	let result = await session.run(query);
	session.close();
	if(result.records.length === 0 )return [];
	for(let i=0; i<result.records.length; i++){
		let rec = result.records[i]._fields[0].properties;
		let prog= rec;
		prog.requirements = JSON.parse(prog.requirements);
		prog.id = result.records[i]._fields[0].identity.low;
		progs.push(prog);
	}
	return progs;
}

/**
 * @description  returns true of a set of terms given can qualify for a given document
 * @param {Object} document - document object
 * @param {String[]} terms[] - term object
 */
function isSatisfied({requirements}, terms){
	
	//Checking Mandatory Requirements
	let mandatory_met = requirements.mandatory.reduce(
		(acc, term)=> acc && terms.includes(term),
		true
	);

	//Checking Combo Requirements
	let combos_met = true;
	if(requirements.hasOwnProperty("combinations")){
		requirements.combinations.forEach(combo=>{
			let combo_amt = terms.reduce((acc, cur)=>{ acc += combo.list.includes(cur); return acc;}, 0);
			combos_met = combos_met && (combo.amt <= combo_amt )
		})
	}
	let res =  mandatory_met && combos_met;
	//if(!res)console.log(name, cape_met, csec_met, mandatory_met, combos_met);
	return res;
}

/**
 * @description - gets all the documents in the database
 * @returns {Promise<Array>} - array of document objects or null
 */
async function getDocuments(){
	let session = startSession();
	let result = await session.run(`match (d:Document) return d order by d.name`);
	session.close();
	let progs = [];
	if(result.records.length === 0 )return progs;
	for(let i=0; i<result.records.length; i++){
		let prog = result.records[i]._fields[0].properties;
		prog.requirements = JSON.parse(prog.requirements);
		prog.id = result.records[i]._fields[0].identity.low;
		progs.push(prog);
	}
	return progs;
}

async function clearDB(){
	let session = startSession();
	await session.run("match (n)-[r]->(m) delete r");
	let res = await session.run("match (n) delete n");
	console.log("db cleared");
	session.close();
	return res;
}

async function clearDocuments(){
	let session =startSession();
	let res = [];
	res.push(await session.run("match (d) -[r]-> (n) delete r"));
	res.push(await session.run("match (d:Document), (c:Combo) delete p, c"));
	session.close();
	return res;
}

async function initialize(documents=generator.generateDocuments(NUM_DOCS, ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M"]), terms= ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M"]){
	
	await clearDB();
	await insertTerms(terms);
	await insertDocuments(documents);
}

function disconnect(){
	driver.close();
}

module.exports = {clearDocuments, clearDB, insertTerms, insertDocuments, reqSearch, disconnect, isSatisfied, getDocuments, initialize};
