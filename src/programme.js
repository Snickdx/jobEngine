const Doc = require('./document');

class Programme extends Doc{
	constructor(name, type, part_time, full_time, campus="sta", faculty, department, duration=3, url="", description){
		if(faculty === undefined || department === undefined || type=== undefined || name===undefined)
			throw "Tried to instantiate programme with undefined fac, dpe, type or name";
		
		super(undefined, {name, type, part_time, full_time, campus, faculty, department, duration, url, description});
		this.name =  name;
		this.type = type;
		this.part_time = part_time;
		this.full_time = full_time;
		this.campus = campus;
		this.faculty = faculty;
		this.department = department;
		this.duration = duration;
		this.url = url;
		this.requirements = null;
		this.description = description === '0' ? 'No description provided': description;
		this.jobs = [];
		this.careers = [];
		this.corrected = "";
	}
	
	setRequirements(cape_passes, csec_passes){
		this.requirements = {cape_passes, csec_passes, ...this.requirements};
	}
	
	setCorrected(sub){
		this.corrected = sub;
	}
	
	setJobs(jobs){
		this.jobs = jobs;
	}
	
	setCareers(careers){
		this.careers = careers;
	}
	
	addComboRequirement(amt, list){
		if(this.requirements === null)throw 'No requirements exists on this object';
		if(this.requirements.combinations.length > 0){
			for(let combo of this.requirements.combinations){//corrects comborequirements which have a common member and same amt
				let intersect = intersection(combo.list, list);
				if(amt === combo.amt && intersect.length > 0){
					//console.log("merging combos :", this.requirements.combinations, {amt, list});
					let diff = difference(list, intersect);
					amt+= combo.amt;
					list = [...list, ...diff];
				}
			}
		}
		this.requirements.combinations.push({amt, list});
	}
	
}

module.exports = Programme;
