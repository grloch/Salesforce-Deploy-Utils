import * as inquirer from "./inquirer";
import * as Fs from "fs";
import * as Path from "path";
import { defaultPackageDirectorie } from "./utils";
import * as ChildProcess from "child_process";
import getLogger from "./logger";

const { default: defaultLogger, info: infoLogger } = getLogger({
  indentifyer: "retrieve",
});

require("dotenv").config();

const deployUtilsConfig = require("../deployUtilsConfig.json");

(async () => {
  infoLogger.trace(`Preparing to retrive Salesforce source (${process.cwd()})`);

  const aliasOptions: Array<string | { name: string; value: string }> = [];

  for (const i of Object.keys(process.env)
    .filter((i) => i.startsWith("SF_"))
    .sort()) {
    if (!process.env[i] || process.env[i] == "") continue;

    aliasOptions.push({ name: <string>process.env[i], value: <string>i });
  }

  defaultLogger.trace(`Avaliable org alias: ${JSON.stringify(aliasOptions)}`);

  if (aliasOptions.length == 0) {
    return defaultLogger.error(
      `No SFDX alias founded on ./.env, make sure that all org alias variables starts with "SF_" and has a value: "SF_PROD=MyClientProdOrg"`
    );
  }

  //   let manifestFile = "F:/projects/Salesforce-Deploy-Utils/manifest/package.xml";
  let targetAlias = "SF_PRODUCTION";

  defaultLogger.trace(`Awaiting user choose target manifest`);

  var manifestFile = "";

  if (!manifestFile.endsWith(".xml")) {
    return infoLogger.error(`Choosed path isn't a valid xml file`);
  }

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

      if (cancel) {
        return infoLogger.info(`Retrieve canceled by the user`);
      }
    } else {
      break;
    }
  } while (manifestFile == "");

  // let targetAlias = await inquirer.getListItem({
  //     message: 'Select target environment',
  //     options: aliasOptions
  // });

  let downloadDir = defaultPackageDirectorie();

  //   console.log({ manifestFile, targetAlias });

  defaultLogger.trace(
    "command ",
    `sfdx force:source:retrieve -x="${manifestFile}" -u="${process.env[targetAlias]}"`
  );

  const ls = ChildProcess.exec(
    `sfdx force:source:retrieve -x="${manifestFile}" -u="${process.env[targetAlias]}"`,
    moveSource
  );

  //@ts-ignore
  ls.stdout.on("data", function (data) {
    console.log(data);
  });

  function moveSource(err: any, stout: any, stderr: any) {
    console.log("ended");
  }
})();
