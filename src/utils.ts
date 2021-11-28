import * as Fs from 'fs';
import * as Path from 'path';
import * as convert from 'xml-js';

export function getXMLItemElements(itens: any, target: string) {
    if (!Array.isArray(itens)) itens = [itens];

    for (const item of itens) {
        if (item.name == target) return item.elements;
    }

    return null;
}

export function getTypeName(xmlItem: any) {
    let resp = getXMLItemElements(xmlItem, 'name');

    return resp ? resp[0].text : null;
}

export function getXmlFileList(dirPath: string) {
    let response: string[] = [];

    for (const file of Fs.readdirSync(dirPath, { withFileTypes: true })) {
        if (file.isDirectory() || !file.isFile()) continue;

        if (file.name.endsWith('.xml')) response.push(file.name)
    }

    return response;
}

export function xml2json(filePath: string) {
    console.log('Parsing ' + filePath);

    try {
        let rawFile = Fs.readFileSync(filePath).toString()
        return JSON.parse(convert.xml2json(rawFile, {}));

    } catch (error) {
        console.log(`Fail while parsing ${filePath}:`);
        console.log(error);

        return null;
    }
}

export function capitalize(txt: string) {
    return txt.charAt(0).toUpperCase() + txt.slice(1);
}

export class packageController {
    private packageMembers: Map<string, Set<string>>;
    private xmlFile: any

    constructor() {
        this.packageMembers = new Map<string, Set<string>>();

        this.xmlFile = {
            _declaration: {
                _attributes: { version: '1.0', encoding: 'UTF-8', standalone: 'yes' }
            },
            Package: {
                types: [],
                version: '51.0'
            }
        }
    }

    public addMetadata(metadata: string, member: string) {
        if (!metadata || !member) return;

        metadata = capitalize(metadata.toLocaleLowerCase());

        if (!this.packageMembers.has(metadata)) {
            this.packageMembers.set(metadata, new Set([member]));
        } else {
            this.packageMembers.get(metadata)?.add(member)
        }
    }

    public buildFile() {
        let totalSize = 0;
        console.log(`Building metadata:`);
        for (const mtdaName of [...this.packageMembers.keys()].sort()) {
            let itensSize = this.packageMembers.get(mtdaName)?.size;
            totalSize += itensSize!;

            console.log(`- ${mtdaName}: ${itensSize} iten${itensSize! > 1 ? 's' : ''}`);

            this.xmlFile.Package.types.push({
                members: [...this.packageMembers.get(mtdaName)!].sort(),
                name: mtdaName
            });
        }

        console.log("Total metadata itens: " + totalSize);
        if (this.packageMembers.has('Profile')) console.log('\n>>> Package contains Profile metadata.\n');


        return this.xmlFile;
    }

    public saveFile(path: string, fileName: string = '') {
        Fs.writeFileSync(
            fileName != '' ? Path.join(path, fileName) : path,
            convert.json2xml(this.xmlFile, { compact: true, ignoreComment: true, spaces: 4 })
        );
    }
}