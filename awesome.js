var protobuf = require("protobufjs");

const fs = require('fs');

protobuf.load("awesome.proto", function(err, root) {
    if (err)
        throw err;

    // Obtain a message type
    var AwesomeMessage = root.lookupType("awesomepackage.AwesomeMessage");

    // Exemplary payload
    var payload = { awesomeField: "mdfs" };

    // Verify the payload if necessary (i.e. when possibly incomplete or invalid)
    var errMsg = AwesomeMessage.verify(payload);
    if (errMsg)
        throw Error(errMsg);

    // Create a new message
    var message = AwesomeMessage.create(payload); // or use .fromObject if conversion is necessary

    // Encode a message to an Uint8Array (browser) or Buffer (node)
    var buffer = AwesomeMessage.encode(message).finish();
    // ... do something with buffer
	console.log(`buffer: ${buffer.toString('hex')}`);

    // Decode an Uint8Array (browser) or Buffer (node) to a message
    var message = AwesomeMessage.decode(buffer);
    // ... do something with message
	console.log(`message: ${JSON.stringify(message)}`);
	
	
	fs.readFile('./DataService', (err, data) => {
	  if (err) throw err;
	  console.log(data.slice(0,100));
	  
		var micapsStation = root.lookupType("awesomepackage.micapsStation");
		var message = micapsStation.decode(data);
		// ... do something with message
		console.log(`message: ${JSON.stringify(message.status)}`);
		
		fs.writeFile('content.txt', message.content, (err) => {
		  if (err) throw err;
		  console.log('The file has been saved!');
		});
	});

    // If the application uses length-delimited buffers, there is also encodeDelimited and decodeDelimited.

    // Maybe convert the message back to a plain object
    var object = AwesomeMessage.toObject(message, {
        longs: String,
        enums: String,
        bytes: String,
        // see ConversionOptions
    });
});