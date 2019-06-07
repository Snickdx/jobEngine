function intersection(A, B) {
	let _intersection = [];
	let setA = new Set(A);
	let setB = new Set(B);
	for (let elem of setB) {
		if (setA.has(elem)) {
			_intersection.push(elem);
		}
	}
	return _intersection;
}

//generate number between min and max inclusively
function genNum(min=1, max=3) {
	max++;
	return parseInt(Math.random() * (max - min) + min);
}

//calculate set difference
function difference(A, B){
	let res = [];
	let setA = new Set(A);
	for (let element of B){
		if(setA.has(element))
			setA.delete(element)
	}
	setA.forEach(ele=>res.push(ele));
	return res;
}

//creates a random subset with given superset and size
function genSubset(array, size){
	
	let subset = new Set();
	
	for(let i=0; i<size; i++){
		subset.add(array[genNum(0, array.length-1)]);
	}
	let res = [];
	subset.forEach(ele=>res.push(ele));
	return res;
}

module.exports = {intersection, genNum, difference, genSubset};
