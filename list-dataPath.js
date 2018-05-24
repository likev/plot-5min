const cassandra = require('cassandra-driver');

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const client = new cassandra.Client({ contactPoints: ['10.69.72.116'], keyspace: 'micapsdataserver' });
client.connect(function (err) {
  if (err) return console.error(err);
  console.log('Connected to cluster with %d host(s): %j', client.hosts.length, client.hosts.keys());
  
  //console.log(client.metadata.keyspaces);
});


const queryNext = (tablename, dataPath)=>{

	const query = `select "dataPath",column1 from "${tablename}" where token("dataPath") > token('${dataPath}') limit 1`;
	const result = client.execute(query, function (err, result) {
	  if (err) return console.error(err);
	  
	  if( !(result.rows&&result.rows.length) ) return console.log("execute finished!");
	  
	  let val = result.rows[0];
	  console.log(`${val.dataPath} ${val.column1}`);
		
	  queryNext(tablename, val.dataPath);//loop
	  
	});
	
}

const processLine = (tablename)=>{
	const query = `SELECT * FROM "${tablename}" limit 1`;
	const result = client.execute(query, function (err, result) {
	  if (err) return console.error(err);
	  
	  if( !(result.rows&&result.rows.length) ) return console.log("execute finished!");
	  
	  let val = result.rows[0];
	  console.log(`${val.dataPath} ${val.column1}`);
		
	  queryNext(tablename, val.dataPath);//loop
	});
}

rl.on('line', (input) => {
  processLine(input);
});


