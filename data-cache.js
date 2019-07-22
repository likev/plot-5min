
const fs = require('fs');
var moment = require('moment');

const cassandra_query = require('./query-data.js');
const micpas_decode = require('./plot-5min-decode.js');

let cache = {count:0, records:{}, size:0};

const cache_count_limit = 300;
const cache_size_limit = 500 * 1024 * 1024;

let get_data = async (timestr)=>{

	if(timestr in cache.records){
		
		console.log(`cache: ${timestr}`)
		return JSON.parse( cache.records[timestr] );
	
	}else{
		console.log(`query: ${timestr}`)
		
		let content = await cassandra_query.query_plot_5min(timestr);
		
		if(!content){
			console.log(` content is ${content}`)
			return {};
		}
		let record = micpas_decode.plot_5min(content);
		
		let jsonStr = JSON.stringify(record);//store json str to deep copy
		console.log(`jsonStr.length: ${jsonStr.length}`);
		
		//select_time.format('YYYYMMDDHHmm')
		let select_time = moment(timestr, 'YYYYMMDDHHmm');
		
		if(select_time.isBefore( moment().subtract(2, 'hours') )
		|| jsonStr.length > 500*1000){ //cache greater than 500K
		
			cache.records[timestr] = jsonStr;
			++ cache.count;
			cache.size += jsonStr.length; 
		}
		
		//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#Description
		return JSON.parse(jsonStr);//remove undefined value in object
	}
	 
}

let setMinute5 = function(momentObj){
	momentObj.minute( Math.floor(momentObj.minute()/5)*5 );
	
	return momentObj;
}

setInterval(()=>{
	let delay = 10; //cache data of 10 minutes ago 
	let timestr = setMinute5( moment().subtract(delay, 'minutes') ).format('YYYYMMDDHHmm')
	get_data(timestr)
	
}, 1*60*1000); //every 1 minutes check and cache new record

let clear_cache = ()=>{

	if(cache.count > cache_count_limit 
	|| cache.size > cache_size_limit){
	
		setTimeout(()=>{
		
			for(let key in cache.records){

				cache.size -= cache.records[key].length;
			
				delete cache.records[key];
				
				-- cache.count;
			
				if(cache.count <= cache_count_limit 
				&& cache.size <= cache_size_limit) break; 
			}
		
		}, 60*1000)
	}
}

setInterval(clear_cache, 5*60*1000); //every 5 minutes

exports.get_data = get_data;
