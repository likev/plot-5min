const cassandra = require('cassandra-driver');

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const client = new cassandra.Client({ contactPoints: ['10.69.72.113','10.69.72.114','10.69.72.115','10.69.72.116','10.69.72.117'] });
client.connect(function (err) {
  if (err) return console.error(err);
  console.log('Connected to cluster with %d host(s): %j', client.hosts.length, client.hosts.keys());
  
  console.log(client.metadata);//.keyspaces.micapsdataserver.tables
});
/*
client.metadata.getTable('ks1', 'table1')
  .then(function (tableInfo) {
    console.log('Table %s', table.name);
    table.columns.forEach(function (column) {
       console.log('Column %s with type %j', column.name, column.type);
    });
  });


 
const query = 'SELECT cql_version FROM system.local';
const result = client.execute(query, function (err, result) {
  if (err) return console.error(err);
  
  console.log(result.rows);
} );*/

const processLine = (line)=>{
	//const query = 'SELECT cql_version FROM system.local';
	const query = line;
	const result = client.execute(query, function (err, result) {
	  if (err) return console.error(err);
	  
	  if(! result.rows) return console.log("execute finished!");
	  console.log(result.rows.length);
	  for(let val of result.rows){
		console.log(val);
	  }
	});
}

rl.on('line', (input) => {
  processLine(input);
});


