const cassandra = require('cassandra-driver');
var iconv = require('iconv-lite');

const readline = require('readline');
const fs = require('fs');
const zlib = require('zlib');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const client = new cassandra.Client({ contactPoints: ['10.69.72.113','10.69.72.114','10.69.72.115','10.69.72.116','10.69.72.117'], keyspace: 'micapsdataserver' });
client.connect(function (err) {
  if (err) return console.error(err);
  console.log('Connected to cluster with %d host(s): %j', client.hosts.length, client.hosts.keys());
  
  //console.log(client.metadata);//.keyspaces.micapsdataserver.tables
});


const processLine = async (line)=>{
	//const query = 'SELECT cql_version FROM system.local';
	const query = line;
	const result = await client.execute(query);
	  
	if(! result.rows) return console.log("execute finished(完成)!");
	console.log(result.rows.length);
	for(let val of result.rows){

	let content =  val.value;
	if(val.column1 && content){
		zlib.gunzip(content, (err, buffer) => {
			if ( err ) throw err;
			 
			content = buffer;
		
		/*  //Micaps4 网络数据存储及传输格式
			console.log(`data ${Buffer.isBuffer(content) ? 'is' : 'is not'} Buffer`);
			console.log( content );
			console.log('utf8 ' + iconv.decode(content, 'utf8').slice(0,1000));
			console.log('ascii ' + iconv.decode(content, 'ascii').slice(0,1000));
			console.log('utf16 ' + iconv.decode(content, 'utf16').slice(0,1000));
			console.log('GB2312 ' + iconv.decode(content, 'GB2312').slice(0,1000));
			console.log('GBK ' + iconv.decode(content, 'GBK').slice(0,1000));
			console.log('hex ' + iconv.decode(content, 'hex').slice(0,1000));
		*/	
			
			console.log(`writing data to file ${val.column1}...`);
			
			fs.writeFile(val.column1, content, (err) => {
			  if (err) throw err;
			  
			  console.log(`The file ${val.column1} has been saved!`);

			});
		
		});
	}else console.log(val);

	}
	 
}

rl.on('line', (input) => {
  processLine(input);
});


