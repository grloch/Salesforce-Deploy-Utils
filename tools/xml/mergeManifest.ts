import * as Fs from 'fs';
import * as Path from 'path';
import * as convert from 'xml-js';

import * as Utils from '../utils';

const startTime = new Date();
const deployUtilsConfig = require('../../deployUtilsConfig.json');
const manifestPath = Path.join(...deployUtilsConfig.package.manifestDir);
const outputFile = Array.isArray(deployUtilsConfig.package.saveAs) ?
    Path.join(...[...deployUtilsConfig.package.manifestDir, ...deployUtilsConfig.package.saveAs]) :
    Path.join(...deployUtilsConfig.package.manifestDir, deployUtilsConfig.package.saveAs);

// creates manifest dir if it doesn't exist
if (!Fs.existsSync(manifestPath)) Fs.mkdirSync(manifestPath)


const files = Utils.getXmlFileList(Path.join('manifest'))
if (files.length == 0) throw new Error(`Didn't found any file`);


// // Parse files
const parsedFiles = [];
for (const fileName of files) {
    try {
        let xmlFile = Utils.xml2json(Path.join(manifestPath, fileName))

        if (xmlFile) parsedFiles.push(xmlFile)
    } catch (error) {
        console.log(`Error while parsing ${Path.join(manifestPath, fileName)}: ${error}`);
    }
}

console.log(`Parsed ${parsedFiles.length} files`);
if (parsedFiles.length == 0) throw new Error(`Didn't parse any file to JSON, it's not possible continue the process.`);

const xmlPackage = new Utils.packageController();

for (const parsedFile of parsedFiles) xmlPackage.processFile(parsedFile)

xmlPackage.buildFile(outputFile);

const endTime = new Date();

const diffTime = Math.abs(endTime.getTime() - startTime.getTime());
console.log(`Duration: ${diffTime} milliseconds`);
