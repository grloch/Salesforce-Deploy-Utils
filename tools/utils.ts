import * as Fs from "fs";
import * as Path from "path";
import * as convert from "xml-js";
import getLogger from "./logger";
import * as inquirer from "./inquirer";

const deployUtilsConfig = require("../deployUtilsConfig.json");

const { default: defaultLogger, info: infoLogger, sfdx: sfdxLogger, path: logPath } = getLogger({
  indentifyer: "retrieve",
})

export function getXMLItemElements(itens: any, target: string) {
  if (!Array.isArray(itens)) itens = [itens];

  for (const item of itens) {
    if (item.name == target) return item.elements;
  }

  return null;
}

export function getTypeName(xmlItem: any) {
  let resp = getXMLItemElements(xmlItem, "name");

  return resp ? resp[0].text : null;
}

export function getXmlFileList(dirPath: string) {
  let response: string[] = [];

  for (const file of Fs.readdirSync(dirPath, { withFileTypes: true })) {
    if (file.isDirectory() || !file.isFile()) continue;

    if (file.name.endsWith(".xml")) response.push(file.name);
  }

  return response;
}

export function xml2json(filePath: string) {
  console.log("Parsing " + filePath);

  try {
    let rawFile = Fs.readFileSync(filePath).toString();

    if (rawFile == '') return null;

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

export function defaultPackageDirectorie() {
  const sfdxProjectPaths: Array<{ path: string; default?: Boolean }> =
    require("../sfdx-project.json").packageDirectories;
  var sfSourcePath = "";

  for (let p of sfdxProjectPaths) {
    if (!!!p.default) continue;

    sfSourcePath = p.path;

    break;
  }

  if (sfSourcePath == "") {
    throw new Error(`Didn't found default Salesforce path`);
  }

  if (Fs.existsSync(Path.join(sfSourcePath))) {
    Fs.rmSync(Path.join(sfSourcePath), { recursive: true });
  }

  Fs.mkdirSync(Path.join(sfSourcePath, "main", "default"), { recursive: true });

  return Path.join(sfSourcePath, "main", "default");
}

export function getOrgAlias() {
  const aliasOptions: Array<string | { name: string; value: string }> = [];

  for (const i of Object.keys(process.env)
    .filter((i) => i.startsWith("SF_"))
    .sort()) {
    if (!process.env[i] || process.env[i] == "") continue;

    aliasOptions.push({ name: <string>process.env[i], value: <string>i });
  }

  defaultLogger.trace(`Avaliable org alias: ${JSON.stringify(aliasOptions)}`);


  if (aliasOptions.length == 0) {
    let error = `No SFDX alias founded on ./.env, make sure that all org alias variables starts with "SF_" and has a value: "SF_PROD=MyClientProdOrg"`
    defaultLogger.error(error);

    throw new Error(error);
  }


  return aliasOptions;
}

export async function selectManifestFile() {
  var manifestFile = "";
  let message = "Select a xml file to retrieve"
  let rootPath = Path.join(...deployUtilsConfig.package.manifestDir)
  defaultLogger.trace(`Awaiting user choose target manifest`);

  do {
    manifestFile = await inquirer.getFileOrDirPath({ message, rootPath });

    if (!manifestFile.endsWith(".xml")) {
      manifestFile = "";
      infoLogger.error(`Choosed path isn't a valid xml file`);

      defaultLogger.trace(`Awaiting user cancel process`);

      let cancel = await inquirer.confirm({
        message: "Cancel retrieve?", option: { y: "Cancel", n: "Continue" }
      });

      if (cancel) {
        infoLogger.info(`Retrieve canceled by the user`);
        break;
      }
    } else {
      break;
    }
  } while (manifestFile == "");

  return manifestFile;
}

export async function getTargetOrg() {
  return await inquirer.getListItem({
    message: "Select target environments",
    options: getOrgAlias()
  });
}

export class packageController {
  private packageMembers: Map<string, Set<string>>;
  private xmlFile: any;

  constructor() {
    this.packageMembers = new Map<string, Set<string>>();

    this.xmlFile = {
      _declaration: {
        _attributes: { version: "1.0", encoding: "UTF-8", standalone: "yes" },
      },
      Package: {
        types: [],
        version: "51.0",
      },
    };
  }

  public addMetadata(metadata: string, member: string) {
    if (!metadata || !member) return;

    metadata = capitalize(metadata.toLocaleLowerCase());

    if (!this.packageMembers.has(metadata)) {
      this.packageMembers.set(metadata, new Set([member]));
    } else {
      this.packageMembers.get(metadata)?.add(member);
    }
  }

  public buildFile(path: string = "") {
    let totalSize = 0;
    console.log(`Building metadata:`);
    for (const mtdaName of [...this.packageMembers.keys()].sort()) {
      let itensSize = this.packageMembers.get(mtdaName)?.size;
      totalSize += itensSize!;

      console.log(
        `- ${mtdaName}: ${itensSize} iten${itensSize! > 1 ? "s" : ""}`
      );

      this.xmlFile.Package.types.push({
        members: [...this.packageMembers.get(mtdaName)!].sort(),
        name: mtdaName,
      });
    }

    console.log("Total metadata itens: " + totalSize);
    if (this.packageMembers.has("Profile"))
      console.log("\n>>> Package contains Profile metadata.\n");

    if (path != "") this.saveFile(path);

    return this.xmlFile;
  }

  public saveFile(path: string, fileName: string = "") {
    let savePath = fileName != "" ? Path.join(path, fileName) : path;

    if (Fs.existsSync(savePath))
      console.log(`${savePath} already exist, file was replaced!`);

    Fs.writeFileSync(
      savePath,
      convert.json2xml(this.xmlFile, {
        compact: true,
        ignoreComment: true,
        spaces: 4,
      })
    );
  }

  public processFile(file: any) {
    for (const element of file.elements[0].elements) {
      if (element.name != "types") continue;

      let fileTypes = element.elements;
      var typeName: string = "";

      const members: string[] = [];

      for (const typeItem of fileTypes) {
        if (typeName == "" && typeItem.name == "name") {
          typeName = typeItem.elements[0].text;
        } else if (typeItem.name == "members") {
          members.push(typeItem.elements[0].text);
        }
      }

      if (typeName == "") continue;

      for (let m of members) this.addMetadata(typeName, m);
    }
  }
}