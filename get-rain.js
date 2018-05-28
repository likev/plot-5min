"use strict";

var moment = require('moment');
const cache = require('./data-cache.js');

let current = moment()  //.format('YYYY-MM-DD HH:mm');

let rain_range = async (select_time = moment(), span = 60)=>{
	
	let begin = moment(select_time).subtract(span, 'minutes');
	
	
	
	let result = await cache.get_data(select_time.format('YYYYMMDDHHmm')); //{'57071':2, '57073':3}
	
	let rain_add = (right, add = true)=>{
		let left = result;
		
		for(let key in left){//
			if('rain' in left[key] && key in right && 'rain' in right[key] )  {
				
				if(add) left[key].rain += right[key].rain;
				else left[key].rain -= right[key].rain;
				
				if(left[key].rain < 0) delete left[key].rain;//should not occur!!!
			}
		}
		
		for(let key in right){
			if('rain' in right[key] &&  
			!(key in left && 'rain' in left[key] ) ){
			
				if(!(key in left)) left[key] = {latlon: right[key].latlon};
				
				left[key].rain = right[key].rain;
			}
		
		}
		
	}
	
	let endHour = moment(select_time).minutes(0);
	
	if(endHour.diff(select_time, 'minutes') === 0) endHour.subtract(1, 'hours');
	
	while( endHour.diff(begin, 'minutes') > 0){

		let record = await cache.get_data(endHour.format('YYYYMMDDHHmm'));
		
		rain_add(record);
		
		endHour.subtract(1, 'hours')
	}
	
	if(begin.minutes() !== 0){
	
		let record = await cache.get_data(begin.format('YYYYMMDDHHmm'));
		
		rain_add(record, false);
	}
	
	return result;

}

//rain_range( moment({ hour:15, minute:10 }) );

//setTimeout(()=>{rain_range( moment({ hour:15, minute:10 }) );}, 60*1000)

exports.rain_range = async (select_time_str , span)=>{
	let select_time = moment(select_time_str, 'YYYY-MM-DD HH:mm');
	
	let result = {};
	try{
		result = await rain_range(select_time, span);
	}catch(e){
		console.log('rain_range error!');
		console.log(e);
		return;
	}
	
	let rain_result = {};
	
	for(let key in result){
		if('rain' in result[key] && result[key].rain){
			
			rain_result[key] = {rain: +result[key].rain.toFixed(2)};
		}
	}
	
	return rain_result;
}

exports.rain_rate = async (select_time_str , span)=>{
	
	let rain_result = await exports.rain_range(select_time_str , span);
	
	for(let key in rain_result){		
		let rate = rain_result[key].rain *= 60/span;
		rain_result[key]['rain-rate'] = rate.toFixed(2);
		delete rain_result[key].rain;
	}
	
	return rain_result;
}