const cassandra = require('cassandra-driver');
var iconv = require('iconv-lite');

const readline = require('readline');
const fs = require('fs');
const zlib = require('zlib');
const util = require('util');

const gunzip = util.promisify(zlib.gunzip);


const client = new cassandra.Client({ contactPoints: ['10.69.72.113','10.69.72.114','10.69.72.115','10.69.72.116','10.69.72.117'], keyspace: 'micapsdataserver' });
client.connect(function (err) {
  if (err) return console.error(err);
  console.log('Connected to cluster with %d host(s): %j', client.hosts.length, client.hosts.keys());
  
  //console.log(client.metadata);//.keyspaces.micapsdataserver.tables
});


const query_plot_5min_data = async (timestr = '201801241110')=>{
	//const query = 'SELECT cql_version FROM system.local';
	const query = `select value from "SURFACE" WHERE "dataPath" = 'PLOT_5MIN' and column1 = '${timestr}00.000'  limit 1`;
	const result = await client.execute(query);
	  
	if(! (result.rows && result.rows.length === 1) ){
		console.log("No result, execute finished!");
		return false;
	}
	//console.log(result.rows.length);

	let content = await gunzip(result.rows[0].value);
	
	console.log(`after unzip size: ${content.length}`);

	return content;
	 
}

query_plot_5min_data();

exports.query_plot_5min = query_plot_5min_data;
