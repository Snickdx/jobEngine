let count = 1;
module.exports = class Document{

    constructor(mandatory = [], metaData={ name:`document${count++}`}){
        this.requirements = {
            mandatory,
            combinations: []
        }

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
        this.requirements.mandatory.push(term);
    }

    addComboRequirement(combo){
        this.requirements.combinations.push(combo);
    }

    isQualified(terms){
        let qualified = false;
        qualfied = this.requirements.mandatory.reduce((acc, mandTerm)=>acc && terms.includes(mandTerm), qualfied);
        if (!qualfied) return false;

        qualified = this.requirements.reduce((acc, req)=>{
            let intersect = req.list.reduce((count, term)=>  count+=terms.includes(term), 0);
            if(intersect < req.amt)return false;
            return acc;
        }, true);
        return qualified;
    }

}