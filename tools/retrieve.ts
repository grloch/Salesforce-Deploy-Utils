import * as inquirer from "./inquirer";
// import * as Fs from "fs";
import * as Path from "path";
import { defaultPackageDirectorie, getOrgAlias } from "./utils";
import * as ChildProcess from "child_process";
import getLogger from "./logger";
import * as Fs from "fs-extra";

const { default: defaultLogger, info: infoLogger, sfdx: sfdxLogger, path: logPath } = getLogger({
  indentifyer: "retrieve",
});

require("dotenv").config();

const deployUtilsConfig = require("../deployUtilsConfig.json");



(async () => {
  infoLogger.trace(`Preparing to retrive Salesforce source (${process.cwd()})`);

  if (Fs.existsSync('force-app')) Fs.rmdirSync('force-app', { recursive: true });
  Fs.mkdirSync(Path.join('force-app', 'main'), { recursive: true });

  const aliasOptions = getOrgAlias();
  defaultLogger.trace(`Avaliable org alias: ${JSON.stringify(aliasOptions)}`);

  if (aliasOptions.length == 0) {
    return defaultLogger.error(
      `No SFDX alias founded on ./.env, make sure that all org alias variables starts with "SF_" and has a value: "SF_PROD=MyClientProdOrg"`
    );
  }

  var manifestFile = "";
  defaultLogger.trace(`Awaiting user choose target manifest`);

  do {
    manifestFile = await inquirer.getFileOrDirPath({
      message: "Select a xml file to retrieve",
      rootPath: Path.join(...deployUtilsConfig.package.manifestDir),
    });

    if (!manifestFile.endsWith(".xml")) {
      manifestFile = "";
      infoLogger.error(`Choosed path isn't a valid xml file`);

      defaultLogger.trace(`Awaiting user cancel process`);

      let cancel = await inquirer.confirm({
        message: "Cancel retrieve?",
        option: { y: "Cancel", n: "Continue" },
      });

      if (cancel) return infoLogger.info(`Retrieve canceled by the user`);
    } else {
      break;
    }
  } while (manifestFile == "");

  // TODO Change to multialias 
  let targetAlias = "";
  targetAlias = await inquirer.getListItem({
    message: "Select target environment",
    options: aliasOptions,
  });

  let downloadDir = defaultPackageDirectorie();

  var sfdxCommand = `sfdx force:source:retrieve -x="${manifestFile}" -u="${process.env[targetAlias]}"`;
  defaultLogger.trace("command ", `'${sfdxCommand}'`);

  var destDir = Path.join("retrieved", targetAlias);
  defaultLogger.trace(`Ouput will be saved at ${destDir}`);


  try {
    defaultLogger.trace(`Executing SFDX command`);

    const sfdxProcess = ChildProcess.exec(sfdxCommand, (e: any, sOut: any, sErr: any) => {
      // TODO Better logs
      if (!Fs.existsSync("retrieved")) Fs.mkdirSync("retrieved");
      if (Fs.existsSync(destDir)) Fs.rmSync(destDir, { recursive: true });

      infoLogger.info("Moving files of " + downloadDir + " to " + destDir);

      Fs.moveSync(downloadDir, destDir);
      Fs.copyFileSync(manifestFile, Path.join(destDir, 'package.xml'));

      infoLogger.info("Files moved to " + destDir);
    });

    //@ts-ignore
    sfdxProcess.stdout.on("data", (data) => {
      for (var i of data.split('\n')) {
        if (!i || i.trim() == '') continue;

        sfdxLogger.info(i)
      }

    });
  } catch (error) {
    defaultLogger.error("SFDX process error: " + error)
  }

})().then(() => {
  console.log(`Retrieve ended process, log saved at ${logPath}`);
  // TODO keep log?
}).catch((err: any) => {
  defaultLogger.error(err);
  console.log(`Process ended with error, log saved at ${logPath}`);
})