const fs = require('fs');
const path = require('path');

console.log(__filename);
console.log(__dirname);

if(fs.existsSync(__dirname+"/client.js"))
{
	console.log(path.extname("client.js"));
	console.log('file does exist');
}

