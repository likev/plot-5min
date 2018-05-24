const fs = require('fs');
const jBinary = require('jbinary');
const iconv = require('iconv-lite');

var typeSet = {
	'jBinary.littleEndian': true,
  header: {
	discriminator: ['string', 4],
	type: 'uint16',
	description: ['string', 100],
	level: 'float32',
	levelDescription: ['string', 50],
	year: 'uint32',
	month: 'uint32',
	day: 'uint32',
	hour: 'uint32',
	minute: 'uint32',
	second: 'uint32',
	timezone: 'uint32',
	extent: ['string', 100]
  },
  number: 'uint32',
  countID: 'uint16',
  valueType: {//repeat
	id: 'uint16',
	type: 'uint16'
  },
  
  record: {
	id: 'uint32',
	lon: 'float32',
	lat: 'float32',
	countID: 'uint16',
  }
};

jBinary.load('20180519105000.000', typeSet, function (err, binary) {
	let header = binary.read('header');
	
	header.description = iconv.decode(header.description, 'GBK');
	header.levelDescription = iconv.decode(header.levelDescription, 'GBK');
	console.log(JSON.stringify(header, null, 2));
	
	let number = binary.read('number');
	console.log(`number is ${number}`);
	
	let countID = binary.read('countID');
	console.log(`countID is ${countID}`);
	
	let valueTypeName = ['int8', 'int8', 'int16', 'int32', 'int32', 'float32', 'float64', 'char'];
	
	let valueTypes = {};
	for(let i = 0; i< countID; i++){
		let valueType = binary.read('valueType');
		
		console.log(JSON.stringify(valueType, null, 2));
		
		valueTypes[valueType.id] = valueTypeName[valueType.type];
	}
	console.log(JSON.stringify(valueTypes, null, 2));
  //
	let index = 0, all_records = {};
	while(index++ < number){
		let record = binary.read('record');
		record.values = {};
		for(let i = 0; i< record.countID; i++){
			let valueid = binary.read('uint16');
			let value = binary.read(valueTypes[valueid]);
			
			record.values[valueid] = value;
		}
		//console.log(JSON.stringify(record, null, 2));
		
		all_records[record.id] = {
			latlon: [record.lat, record.lon],
			wind2: [record.values[211], record.values[209]],
			P: record.values[413],
			T: record.values[601],
			Td: record.values[801],
			rh: record.values[805],
			rain: record.values[1001],
			vis: record.values[1201]
		}
	}
	console.log(JSON.stringify(all_records, null, 2));
});