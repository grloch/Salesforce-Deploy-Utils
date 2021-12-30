import * as inquirer from "./inquirer";
import * as Path from "path";
import { defaultPackageDirectorie } from "./utils";
import * as ChildProcess from "child_process";
import getLogger from "./logger";
import * as Utils from "./utils";
import * as Fs from "fs-extra";

require("dotenv").config();
const { default: defaultLogger, info: infoLogger } = getLogger({ indentifyer: "deploy" });
const deployUtilsConfig = require("../deployUtilsConfig.json");




(async () => {
    if (!Fs.pathExistsSync(Path.join('retrieved'))) {
        return infoLogger.error(`Didn't found ./retrieved, make sure you retrieved your metadata first.`);
    }

    // var sourceOptions: Array<{ name: string, value: string }> = [];
    // for (const dirItem of Fs.readdirSync(Path.join('retrieved'), { withFileTypes: true })) {
    //     if (dirItem.isFile()) continue;

    //     sourceOptions.push({ name: dirItem.name, value: Path.join('retrieved', dirItem.name) })
    // }

    // if (sourceOptions.length == 0) {
    //     return infoLogger.error(`./retrieved dir is empty, make sure you retrieved your metadata first.`);
    // }

    // let deploySourcepath = Path.join('force-app', 'main', 'default');
    // if (!Fs.existsSync(deploySourcepath)) {
    //     Fs.mkdirSync(deploySourcepath, { recursive: true })
    // }
    // else if (Fs.readdirSync(deploySourcepath).length > 0) {
    //     if (Fs.existsSync(deploySourcepath)) {
    //         let message = `${deploySourcepath} already has files, if you continue, you may lose changes outside it, continue deploy?`;

    //         if (!await inquirer.confirm({ message })) {
    //             return infoLogger.info("Process exit by the user");
    //         }
    //     }
    // }

    // var targetDir = "";
    // do {
    //     targetDir = await inquirer.getListItem({ message: 'Select a dir to deploy', options: sourceOptions });

    //     if (targetDir == "") {
    //         infoLogger.error("User didn't select a source dir.")
    //     }

    // } while (targetDir == "");

    // defaultLogger.info("Using " + targetDir);

    // let orgAlias = "";
    // orgAlias = await inquirer.getListItem({
    //     message: "Select target environment",
    //     options: Utils.getOrgAlias(),
    // });

    // defaultLogger.trace(`Deploy using alias: ${orgAlias}`);


    // var targetPackage = Path.join(targetDir, 'package.xml');
    // if (!Fs.existsSync(targetPackage)) return infoLogger.error(`${targetDir} doesn't has a package.xml file, make sure path ${targetPackage} exists.`);

    // let tempPackage = Path.join(...[...deployUtilsConfig.package.manifestDir, '__TempPackage.xml'])

    // Fs.rmdirSync(deploySourcepath, { recursive: true });
    // Fs.mkdirSync(deploySourcepath, { recursive: true });

    // infoLogger.info("Copying files of " + targetDir + " to " + deploySourcepath);

    // Fs.copySync(targetDir, deploySourcepath);
    // Fs.rmSync(Path.join(deploySourcepath, 'package.xml'))
    // Fs.copyFileSync(targetPackage, tempPackage);

    // infoLogger.info("Files copied to " + deploySourcepath);

    // let sfdxCmd = `sfdx force:source:deploy -x="${tempPackage}" -u="${process.env[orgAlias]}"`
    // defaultLogger.trace(`SFDX command: '${sfdxCmd}'`);

    // // delete files of force-app/main/defaul
    // let deleteFiles = await inquirer.confirm({ message: `Empty ${deploySourcepath}?` })
    // defaultLogger.trace({ deleteFiles });
    // if (deleteFiles) {
    //     Fs.rmdirSync(deploySourcepath, { recursive: true });

    //     defaultLogger.trace(`Removed deployed files from ${deploySourcepath}`);

    //     Fs.mkdirSync(deploySourcepath, { recursive: true })
    //     defaultLogger.trace(`Re created ${deploySourcepath}`);
    // }
})();
