const fs = require('fs');
const pdf = require('pdf-parse');

console.log('Starting PDF extraction...');
let dataBuffer = fs.readFileSync('d:\\Workshop\\po\\exaple_po.pdf');

pdf(dataBuffer).then(function (data) {
    console.log('PDF loaded, extraction complete.');
    console.log('Text content length:', data.text.length);
    fs.writeFileSync('d:\\Workshop\\po\\pdf_content.txt', data.text);
    console.log('Content written to pdf_content.txt');
}).catch(function (error) {
    console.error('Error extracting PDF:', error);
    fs.writeFileSync('d:\\Workshop\\po\\pdf_error.txt', error.toString());
});
