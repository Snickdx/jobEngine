#Requirement Search Toolkit


#Scripts
 
 
 ##Requirement Search
 1. Define all terms in terms.json
 2. Define documents in documents.json
 3. Specify query in query.json
 4. Run the following script
 ```
    npm run search
 ```
 OR
 
 1.Define all terms in terms.json
 2. Define query in query.json
 3. Auto generate documents an run search
 ```
     npm run search:g
  ```
  
 
 ##Test
 Performs Requirement Search with documents.json, query.json and terms.json files and tests the results and writes report to report.json
 ```
     npm run test
  ```
 OR
 
 ```
      npm run test:g
  ```
 This generates 1000 documents using terms.json save the documents as documents.json then performs Requirement Search with query.json and writes a report to report.json.
