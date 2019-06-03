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
