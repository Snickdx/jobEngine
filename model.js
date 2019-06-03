const neo4j = require('neo4j-driver').v1;
const config = {
	"dbhost":"bolt://nmendez.app:7687",
	"dbport":7687,
	"dbuser":"neo4j",
	"dbpass":"snickpass"
};

const driver = neo4j.driver(config.dbhost, neo4j.auth.basic(config.dbuser, config.dbpass));

function startSession(){
	return driver.session();
}

/**
 * @description
 * @param {Object} subject
 * @param {string} subject.name
 * @param {string} subject.level
 * @return {Promise} which resolves when query runs successfully
 */
async function createSubject({name, level}){
	let session = startSession();
	let query = `Merge (s:Subject{name:'${name}', level:'${level}'}) return *`;
	let result =  await session.run(query);
	session.close();
	return result;
}

/**
 * @name CreateProgramme
 * @function
 * @param {object} programme
 * @param {string} programme.name -in
 * @param {Boolean} programme.part_time
 * @param {Boolean} programme.full_time
 * @param {string} programme.type
 * @param {string} programme.faculty
 * @param {string} programme.department
 * @param {string} programme.url
 * @param {string} programme.campus
 * @param {string} programme.description
 * @param {object} programme.requirements
 * @param {string[]} programme.careers
 *
 * @desc creates a programme node in database if it doesn't exist. using es6 object destructuring to create variables
 *      of the properties of the parameter object {@link https://simonsmith.io/destructuring-objects-as-function-parameters-in-es6/}
 */
async function createProgramme({name, part_time, full_time, type, faculty, department, url, campus, description, requirements, csec_passes=requirements.csec_passes, cape_passes=requirements.cape_passes, careers}){
	
	let escapeQuotes = (string)=>{
		if(string === 0)return "";
		try {
			string = string.split("").reduce((acc, ele)=> acc + (ele === `"`? `\\"`: ele));
		}catch(e){
			console.log(string, e);
		}
		return	string
	};
	
	let session = startSession();
	let promises = [];
	if(campus === undefined)campus = "sta";
	if(!careers)careers = [];
	let query = `MERGE (p:Programme{name:'${name}', type:'${type}', part_time:${part_time}, full_time:${full_time}, faculty:'${faculty}', department:'${department}', url:'${url}', csec_passes:${csec_passes}, cape_passes:${cape_passes}, campus:'${campus}', description:"${escapeQuotes(description)}", requirements:'${JSON.stringify(requirements)}', careers:'${JSON.stringify(careers)}'}) return p`;
	let res = await session.run(query);
	session.close();
	await addMandatoryRequirements(name, requirements.mandatory);
	if(requirements.hasOwnProperty('combinations')){
		for(let combo of requirements.combinations){
			promises.push(model.addComboRequirement(name, combo));
		}
	}
	Promise.all(promises);
	return res;
}

/**
 * @description
 * @param {String} programmeName - name of programme
 * @param {String[]} subjects - list of subjects
 * @return {Promise} which resolves when query runs successfully
 */
async function addMandatoryRequirements(programmeName, subjects){
	let session = startSession();
	let query = `MATCH (sub:Subject), (p:Programme{name:'${programmeName}'}) where sub.name IN [ '${subjects[0]}'`;
	query=subjects.splice(1).reduce(((acc, cur)=>`${acc}, `+`'${cur}'`),query);
	query+=`] with p, collect(sub) as subs foreach(s In subs | merge (p)-[:requires]->(s)) return *`;
	let res = await session.run(query);
	session.close();
	return res;
}

/**
 * @description
 * @param {String} programme - name of programme
 * @param {Object} combination
 * @param {String[]} combination.list - list of subjects
 * @param {int} combination.amt - amount of subjects required from list
 * @return {Promise} which resolves when query runs successfully
 */
async function addComboRequirement(programme, combination){
	let session = startSession();
	let query = `MATCH (sub:Subject), (p:Programme {name: '${programme}' }) WHERE sub.name IN [ '${combination.list[0]}'`;
	query = combination.list.splice(1).reduce((acc, cur)=>`${acc}, `+`'${cur}'`, query);
	query+=`] WITH p, COLLECT(sub) AS subs CREATE (p)-[:requires]->(c: Combo {amt:${combination.amt}}) FOREACH(s IN subs | create (c)-[:contains]->(s))RETURN *`;
	let res = await session.run(query);
	session.close();
	return res;
}

/**
 * @description Inserts an array of subject objects int db
 * @param subjects
 * @returns {Promise<result[]>} array of createSubject results
 */
async function InsertSubs (subjects){
	subjects = subjects.map((sub, i)=>{
		console.log(`Creating subject ${i}`);
		return model.createSubject(subjects[i]);
	});
	subjects = Promise.all(subjects);
	console.log("subjects created");
	return subjects;
}

/**
 * @description Inserts an array of programme objects into db
 * @param progs
 * @returns {Promise<result[]>} array containing result of individual createProgramme calls
 */
async function insertProgs(progs){
	progs = progs.map((p, i)=>{
		console.log(`Creating programme ${i+1}/${progs.length}`);
		return model.createProgramme(progs[i]);
	});
	progs = Promise.all(progs);
	console.log("Programmes created");
	return progs;
}

/**
 * @description parses string properties and adds it the the programme object parameter
 * @param prog
 */
async function parseProperties(prog){
	prog.requirements = JSON.parse(prog.requirements);
	try {
		prog.careers = prog.careers === 0 ? prog.careers = [] : JSON.parse(prog.careers);
	}catch(e){
		console.log(`Bad careers  for programme ${prog.name}`, prog.careers);
		console.log(e);
		prog.careers = [];
	}
		return prog;
}

/**
 * @description - gets all the programmes in the database
 * @returns {Promise<Array>} - array of programme objects or null
 */
async function getProgrammes(){
	let session = startSession();
	let result = await session.run(`match (p:Programme) return p order by p.name`);
	session.close();
	let progs = [];
	if(result.records.length === 0 )return progs;
	for(let i=0; i<result.records.length; i++){
		let {csec_passes, cape_passes, ...prog} = result.records[i]._fields[0].properties;
		prog = parseProperties(prog);
		prog.id = result.records[i]._fields[0].identity.low;
		progs.push(prog);
	}
	return progs;
}

/**
 * @description - gets all the programmes in the database
 * @returns {Promise<Array>} - array of programme objects or null
 */
async function getProgrammeNames(){
	let session = startSession();
	let result = await session.run("match (p:Programme) return p.name");
	session.close();
	let progs = [];
	if(result.records.length === 0 )return progs;
	result.records.forEach(rec=>{
		progs.push(rec._fields[0])
	});
	return progs;
}

/**
 * @description - geta programme in the database by an id
 * @returns {Promise<Array>} - single programme object or null
 */
async function getProgrammeById(id){
	let session = startSession();
	if(id === undefined)return [];
	let result = await session.run(`match (p:Programme) where Id(p)=${id} return p`);
	session.close();
	let progs = [];
	if(result.records.length === 0 )return null;
	for(let i=0; i<result.records.length; i++){
		let { csec_passes, cape_passes, ...prog} = result.records[i]._fields[0].properties;
		prog = parseProperties(prog);
		prog.id = result.records[i]._fields[0].identity.low;
		progs.push(prog);
	}
	return progs;
}

function deleteProgramme(id){

}

/**
 * @description - gets all the subjects in the database
 * @returns {Promise<Array>} - array of subject objects or null
 */
async function getSubjects(){
	let subjects = [];
	try{
		let session = startSession();
		let result = await session.run("match (s:Subject) return {name:s.name, level:s.level, id:Id(s)} order by s.name");
		if(result.records.length === 0 )return [];
		for(let i=0; i<result.records.length; i++){
			let {id, ...sub} = result.records[i]._fields[0];
			sub.id = id.low;
			subjects.push(sub);
		}
		session.close();
	}catch(e){
		console.log(e);
	}
	return subjects;
}

/**
 * @description queries a programme from the db by name
 * @param name
 * @returns {Promise<*|Object>} the programme object or null
 */
async function getProgramme(name){
	let session = startSession();
	let result = await session.run(`match (p:Programme{name:'${name}'}) return p`);
	session.close();
	if(result.records.length === 0 )return null;
	let {cape_passes, csec_passes, ...prog} = result.records[0]._fields[0].properties;
	prog = model.parseProperties(prog);
	prog.id = result.records[i]._fields[0].identity.low;
	return prog;
}

/**
 * @description - gets all programmes which requirements are met by the given subject list
 * @param subjects {Object[]} - array of  subject objects
 * @returns {Promise<void>}
 */
async function getQualifiedProgrammes(subjects){
	let progs = [];
	let session = startSession();
	let arry = subjects.splice(1).reduce(((acc, cur)=>`${acc}, `+`'${cur}'`), `["${subjects[0]}"`)+`]`;
	let query = `MATCH (s:Subject), (p:Programme) WHERE s.name in ${arry}
WITH collect(s) as subs, p
WITH p, subs, SIZE(FILTER(c in subs where c.level ="CSEC")) as csecs, SIZE(FILTER(c in subs where c.level ="CAPE")) as capes WHERE p.csec_passes <= csecs AND p.cape_passes <= capes
MATCH (p:Programme)-[:requires]->(s:Subject)
WITH p, subs, COLLECT(s) AS mandatories WHERE ALL(n IN mandatories WHERE n IN subs) AND NOT (p)-->(:Combo)
RETURN p
UNION
MATCH (s:Subject), (p:Programme) WHERE s.name in ${arry}
WITH collect(s) as subs, p
WITH p, subs, SIZE(FILTER(c in subs where c.level ="CSEC")) as csecs, SIZE(FILTER(c in subs where c.level ="CAPE")) as capes WHERE p.csec_passes <= csecs AND p.cape_passes <= capes
MATCH (p:Programme)-[:requires]->(s:Subject)
WITH p, subs, COLLECT(s) AS mandatories WHERE ALL(n IN mandatories WHERE n IN subs)
MATCH (p)-[:requires]->(c:Combo)-[:contains]->(s:Subject)
with p, c, subs, collect(s) as list
with p, subs, collect({amt:c.amt, set:list}) as combos
where all(combo in combos where combo.amt <= size(apoc.coll.intersection(subs, combo.set)))
return p order by p.name`;
	// console.log(query);
	let result = await session.run(query);
	session.close();
	if(result.records.length === 0 )return [];
	for(let i=0; i<result.records.length; i++){
		let rec = result.records[i]._fields[0].properties;
		let {cape_passes, csec_passes, ...prog} = rec;
		prog = model.parseProperties(prog);
		prog.id = result.records[i]._fields[0].identity.low;
		progs.push(prog);
	}
	return progs;
};

/**
 * @description Returns
 * @param sublist
 * @returns {Promise<*>}
 */
async function getSubjectObjects(sublist){
	return (await model.getSubjects()).filter(sub=>sublist.includes(sub.name));
}

/**
 * @description  retruns true of a set of subjects given can qualify for a given programme
 * @param {Object[]} - sublist array of subject objects
 * @param {Object} sublist[0] - subject object
 * @param {String} sublist[0].name - name of subject
 * @param {String} sublist[0].level=["CAPE"|"CSEC] -
 * @param {Object} programme - programme object
 */
function isQualified(
	sublist,//array of subjects
	{
		requirements,
		cape_amt=requirements.cape_passes,
		csec_amt=requirements.csec_passes
	}
){
	let subnames = [];
	//Counting csec and cape passes
	let count = sublist.reduce(
		(acc, sub)=> {
			acc[sub.level]++;
			subnames.push(sub.name);
			return acc;
		},
		{'CSEC': 0, 'CAPE': 0}
	);
	let cape_met = cape_amt <= count.CAPE;
	let csec_met = csec_amt <= count.CSEC;
	
	//Checking Mandatory Requirments
	let mandatory_met = requirements.mandatory.reduce(
		(acc, sub)=> acc && subnames.includes(sub),
		true
	);
	
	//Checking Combo Requirements
	let combos_met = true;
	if(requirements.hasOwnProperty("combinations")){
		requirements.combinations.forEach(combo=>{
			let combo_amt = subnames.reduce((acc, cur)=>{ acc += combo.list.includes(cur); return acc;}, 0);
			combos_met = combos_met && (combo.amt <= combo_amt )
		})
	}
	let res = cape_met && csec_met && mandatory_met && combos_met;
	// if(!res)console.log(name, cape_met, csec_met, mandatory_met, combos_met);
	return res;
}

async function clearDB(){
	let session = startSession();
	await session.run("match (n)-[r]->(m) delete r");
	let res = await session.run("match (n) delete n");
	session.close();
	return res;
}

async function clearProgrammes(){
	let session = startSession();
	let res = [];
	res.push(await session.run("match (p) -[r]-> (n) delete r"));
	res.push(await session.run("match (p:Programme), (c:Combo) delete p, c"));
	session.close();
	return res;
}


function disconnect(){
	model.driver.close();
}

module.exports = {};
