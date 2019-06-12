# Requirement Search Toolkit


# Requirements

 1. Local [Neo4j](https://neo4j.com/download/) database with [APOC](https://github.com/neo4j-contrib/neo4j-apoc-procedures) plugin installed.
 2. [Nodejs & NPM](https://nodejs.org/en/download/) installed.
 3. After cloning this repo cd into the project folder and install dependencies by running the following command.
```
  $ npm install
```

# Getting Started

 1. Define all terms in terms.json
 2. Define query in query.json
 3. Define documents in documents.json Or Use generator
 4. Run the search script

# Scripts

## Generate Documents

Edit package.json config to change generator options
```
	"config": {
		"maxCombos": 6,
		"maxMand": 5,
		"maxComboSize": 5,
		"maxComboAmt": 3,
		"documentsAmt":1000
	},
```
```
	$ npm run gnerate
```
 
 ## Initialize Graph

 Ensure that a neo4j database is already running. Edit package.json config with appropriate credientials to connect to the database.

 ```
 	"config": {
		"dbhost": "bolt://localhost:7687",
		"dbport":  7687,
		"dbuser": "neo4j",
		"dbpass": "snickpass"
	},
 ```
 ```
 	$ npm run search:g
 ```
 
 
 ## Run Search
```
	$ npm run search
```
 
 ## Run Test
 Performs Requirement Search with documents.json, query.json and terms.json files and tests the results and writes report to report.json
```
	$ npm run test
```

