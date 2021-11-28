import * as Fs from 'fs';
import * as Path from 'path';
import * as convert from 'xml-js';

import * as Utils from './utils';
Fs.mkdirSync(Path.join('files', 'output'), { recursive: true })

const startTime = new Date();
const outputFileName = `${startTime.getFullYear()}-${startTime.getMonth() + 1}-${startTime.getDate()}_${startTime.getHours()}-${startTime.getMinutes()}-${startTime.getSeconds()}_package.xml`

const files = Utils.getXmlFileList(Path.join('files', 'input'))
if (files.length == 0) throw new Error(`Didn't found any file`);

// Parse files
const parsedFiles = [];
for (const fileName of files) {
    let xmlFile = Utils.xml2json(Path.join('files', 'input', fileName))

    if (xmlFile) parsedFiles.push(xmlFile)
}

console.log(`Parsed ${parsedFiles.length} files`);
if (parsedFiles.length == 0) throw new Error(`Didn't parse any file to JSON, it's not possible continue the process.`);

const xmlPackage = new Utils.packageController();

for (const parsedFile of parsedFiles) {
    for (const element of parsedFile.elements[0].elements) {
        if (element.name != 'types') continue;

        let fileTypes = element.elements;
        var typeName: string = '';

        const members: string[] = [];

        for (const typeItem of fileTypes) {
            if (typeName == '' && typeItem.name == 'name') {
                typeName = typeItem.elements[0].text;
            }
            else if (typeItem.name == 'members') {
                members.push(typeItem.elements[0].text);
            }
        }

        if (typeName == '') continue;

        for (let m of members) xmlPackage.addMetadata(typeName, m);
    }
}

xmlPackage.buildFile();

xmlPackage.saveFile(Path.join('files', 'output', outputFileName));

const endTime = new Date();

const diffTime = Math.abs(endTime.getTime() - startTime.getTime());
console.log(`Duration: ${diffTime} milliseconds`);
