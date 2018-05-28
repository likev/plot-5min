"use strict";

var moment = require('moment');
const cache = require('./data-cache.js');

let current = moment()  //.format('YYYY-MM-DD HH:mm');

let latlon = async (select_time = moment({ minute: 0 }) )=>{
	
	let prev_time = moment(select_time).subtract(1, 'days').minutes(0);
	
	let prev_result = await cache.get_data(prev_time.format('YYYYMMDDHHmm'));
	let select_result = await cache.get_data(select_time.format('YYYYMMDDHHmm')); 
	
	let together = {...select_result, ...prev_result};
	
	let result = {};
	for(let key in together){
		let latlon = together[key].latlon;
		
		if(Array.isArray(latlon) 
		&& latlon.length === 2){
			result[key] = [+latlon[0].toFixed(6), +latlon[1].toFixed(6)];
		}
	}
	
	//console.log(result)
	
	return result;

}

//latlon( moment({ hour:15, minute:10 }) );

//setTimeout(()=>{latlon( moment({ hour:15, minute:10 }) );}, 60*1000)

exports.get = async (select_time_str )=>{
	let select_time = moment(select_time_str, 'YYYY-MM-DD HH:mm');
	let result = await latlon(select_time);
	
	return result;
}