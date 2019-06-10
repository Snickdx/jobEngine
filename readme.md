# Requirement Search Toolkit

 1. Define all terms in terms.json
 2. Define documents in documents.json
 3. Specify query in query.json
 4. Run the search script

 OR

 1.Define all terms in terms.json
 2. Define query in query.json
 3. Auto generate documents an run search with generator script
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

