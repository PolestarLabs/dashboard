const {Types: MonTypes} = require("mongoose");
const rotationSetsCache = new Map();
const DAY = 86400000;

// rotations start every sunday
// sunday is day 0
function rotationStart(date,offset =0){
	return new Date( 
		~~( (date.getTime() + ( offset * DAY * 7 ) - date.getHours() * 60 * 60e3) / (60e3*60) ) // MIDNIGHT
		*60*60e3 - (  date.getDay() * DAY) // SUNDAY
	).getTime()
}


module.exports = async (query) => {
  const ts = Number(query.ts) || Date.now();
  const currentDate = new Date(ts);
  const yearMonthFifteenWeek = rotationStart(currentDate); //currentDate.getFullYear() + currentDate.getMonth() + (( currentDate.getDate() - currentDate.getDay() ) * 15);
  
  const preseed  = rotationStart(currentDate, -1) //getPreviousRotationSeed(1,ts);
  const preseed2 = rotationStart(currentDate, -2) //getPreviousRotationSeed(2,ts);
  const preseed3 = rotationStart(currentDate, -3) //getPreviousRotationSeed(3,ts);

  const nextSeed = rotationStart(currentDate, 1);

  const SEED = Number(query.seed) || yearMonthFifteenWeek || 1;
  const PREV_SEED = Number(query.preseed) || preseed || 0;

  let allBGs = shuffle( await DB.cosmetics.find(
	{
		_id: {$lt: objectIdReferenceTimestamp(SEED) },
		type:"background",public:"true",event:null,buyable:true,arrival:{$exists:false}
	},
	{_id:0}),
  SEED);

  const start = Date.now();
  console.log({ts,PREV_SEED,SEED,preseed2,preseed3,nextSeed})
  const previous_payload3 = rotationSetsCache.get(preseed3) || getFinalRotation(allBGs, preseed3);
  const previous_payload2 = rotationSetsCache.get(preseed2) || getFinalRotation(allBGs, preseed2, previous_payload3);
  const previous_payload = rotationSetsCache.get(PREV_SEED) || getFinalRotation(allBGs, PREV_SEED, previous_payload2);
  
  const payload = rotationSetsCache.get(SEED) || getFinalRotation(allBGs, SEED, previous_payload);
  const end = Date.now();

  rotationSetsCache.set(preseed3,previous_payload3);
  rotationSetsCache.set(preseed2,previous_payload2);
  rotationSetsCache.set(PREV_SEED,previous_payload);
  rotationSetsCache.set(yearMonthFifteenWeek,payload);

  return {bench: end - start + "ms" ,payload, start: new Date(SEED), next: new Date(nextSeed) }
};


function objectIdReferenceTimestamp(ts) {    
	ts = new Date(ts).getTime() || Number(ts);
	const hexSeconds = Math.floor(ts/1000).toString(16);
	console.log({ts,hexSeconds})
	const objid = MonTypes.ObjectId(hexSeconds + "0000000000000000");
	return objid
}


function getFinalRotation(allBGs, SEED, previous) {
	let everyBG = [].concat(allBGs)
	if (previous) everyBG = everyBG.filter(x=> !previous.find(y=> y.code === x.code));
	const allBGs1 = everyBG.slice(0, ~~(everyBG.length / 2));
	const allBGs2 = everyBG.slice(~~(everyBG.length / 2) + 1);
 
	everyBG = shuffle([
	  shuffle(shuffle(allBGs1.reverse(), SEED).reverse(), SEED).reverse(),
	  shuffle(shuffle(allBGs2.reverse(), SEED).reverse(), SEED).reverse()
	].flat(), SEED);
 
	const rarMap = {};
	let payload = [];
	for (rar of ["C", "U", "R", "SR", "UR"])
	  rarMap[rar] = shuffle(shuffle(everyBG.reverse(), SEED).filter(bg => !!bg && bg.rarity === rar), SEED);
	//[9,6,4,3,2].forEach((q,i)=>{
	[6, 4, 4, 3, 3].forEach((q, i) => {
	  payload.push(shuffle(Object.values(rarMap)[i], SEED).filter(x => !!x).slice(0, q));
	});
 
	payload = payload.flat().map(x => { x.items = undefined; return x; });
	return payload;
}
 
 
