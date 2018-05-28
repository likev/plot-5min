"use strict";

var moment = require('moment');
const cache = require('./data-cache.js');
const getRain = require('./get-rain.js');

let current = moment()  //.format('YYYY-MM-DD HH:mm');

let wind_diff = (wind1, wind2)=>{
	let theta1 = wind1[1]*Math.PI/180, theta2 = wind2[1]*Math.PI/180;
	let x1 = wind1[0] * Math.sin(theta1), y1 = wind1[0] * Math.cos(theta1),
		x2 = wind2[0] * Math.sin(theta2), y2 = wind2[0] * Math.cos(theta2);
		
	let v_diff = Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
	let theta_diff= 90 - Math.atan2(y2-y1, x2-x1)*180/Math.PI;
	
	if(theta_diff < 0) theta_diff += 360;
	
	return [v_diff, theta_diff];
}

let get_single_element_diff = async (select_time = moment(), element, span = 60)=>{
	
	let begin = moment(select_time).subtract(span, 'minutes');
	
	
	let right = await cache.get_data(begin.format('YYYYMMDDHHmm')); //{'57071':2, '57073':3}
	let left = await cache.get_data(select_time.format('YYYYMMDDHHmm')); //{'57071':2, '57073':3}
	
	let diff_result = {};
		
	for(let key in left){//
		if(element in left[key] && key in right && element in right[key] )  {
 
			diff_result[key] = {};
			
			let diff = 0;
			
			if(element === 'wind2') diff = wind_diff(right[key][element], left[key][element]);
			else diff = left[key][element] - right[key][element];
			
			diff_result[key][element+'-diff'] = diff;

		}
	}
	
	return diff_result;
		
}

let get_single_element = async (select_time = moment(), element )=>{
	
	let left = await cache.get_data(select_time.format('YYYYMMDDHHmm')); //{'57071':2, '57073':3}
	
	let single_result = {};
		
	for(let key in left){//
		if(element in left[key])  {
			
			single_result[key] = {};
			single_result[key][element] = left[key][element];

		}
	}
	
	return single_result;
		
}

//rain_range( moment({ hour:15, minute:10 }) );

//setTimeout(()=>{rain_range( moment({ hour:15, minute:10 }) );}, 60*1000)

let combain = (a, b)=>{
	
	for(let key in a){
		if(key in b){
			a[key] = {...a[key], ...b[key]};
		}
	}
	
	for(let key in b){
		if(!(key in a)){
			a[key] = b[key];
		}
	}
	
	return a;
}

exports.get = async (select_time_str , elements, span)=>{
	let select_time = moment(select_time_str, 'YYYY-MM-DD HH:mm');
	
	let result = {};
	
	let single_element_array = ['T', 'Td', 'P', 'rh', 'vis', 'wind2'];
	let single_element_diff_array = ['T-diff', 'Td-diff', 'P-diff', 'rh-diff', 'vis-diff', 'wind2-diff'];
	
	let elements_array = [elements];
	
	if(Array.isArray(elements)) elements_array = elements;
	else if(typeof elements === 'string') elements_array.push(elements);
	else return result;
	
	for(let element of elements_array){
		let single_result = {};
		
		if(element === 'rain'){
			single_result = await getRain.rain_range(select_time_str, span);
			
		}else if(element === 'rain-rate'){
			single_result = await getRain.rain_rate(select_time_str, span);
			
		}else if(single_element_array.includes(element)){
			single_result = await get_single_element(select_time , element);
		}else if(single_element_diff_array.includes(element)){
			single_result = await get_single_element_diff(select_time , element.slice(0, -5), span);
		}else{
			
		}
		
		combain(result, single_result)
		
	}
	
	return result;
}