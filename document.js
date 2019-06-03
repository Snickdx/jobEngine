let Sets = require('./sets');


let count = 1;
module.exports = class Document{

    constructor(mandatory = [], metaData={ name:`document${count++}`}){
        this.requirements = {
            mandatory,
            combinations: []
        };

        for(let prop in metaData){
            this[prop] = metaData[prop];
        }
    }

    /**
     *
     * @param {number} amt - The amt of terms to be matched in the list
     * @param {string[] | requirementObject[]} list - Array of terms or requirementObjects
     * @returns {requirementObject}
     */
    createRequirement(amt, list){
        return {amt, list};
    }

    addMandatory(term){
	    if(this.requirements === null)throw 'No requirements exists on this object';
        this.requirements.mandatory.push(term);
    }

    addComboRequirement(amt, list){
	    if(this.requirements === null)throw 'No requirements exists on this object';
	    if(amt >= list.length)throw `Amt ${amt} is not more than list [ ${list} ]length`;
        this.requirements.combinations.push({amt, list});
    }
	
	// addComboRequirement(amt, list){
	// 	if(this.requirements === null)throw 'No requirements exists on this object';
	// 	if(amt === undefined || list === undefined) throw `Invalid values for amt and list ${amt} ${list}`;
	// 	if(this.requirements.combinations.length > 0){
	// 		for(let combo of this.requirements.combinations){//corrects combo requirements which have a common member and same amt
	// 			let intersect = Sets.intersection(combo.list, list);
	// 			if(amt === combo.amt && intersect.length > 0){
	// 				//console.log("merging combos :", this.requirements.combinations, {amt, list});
	// 				let diff = Sets.difference(list, intersect);
	// 				amt+= combo.amt;
	// 				list = [...list, ...diff];
	// 			}
	// 		}
	// 	}
	// 	this.requirements.combinations.push({amt, list});
	// }
    
    isSatisfied(terms){
        let qualified = false;
        qualified = this.requirements.mandatory.reduce((acc, mandTerm)=>acc && terms.includes(mandTerm), qualified);
        if (!qualified) return false;

        qualified = this.requirements.reduce((acc, req)=>{
            let intersect = req.list.reduce((count, term)=>  count+=terms.includes(term), 0);
            if(intersect < req.amt)return false;
            return acc;
        }, true);
        return qualified;
    }

};
