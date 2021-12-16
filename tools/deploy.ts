import * as inquirer from "./inquirer";
import * as Path from "path";
import { defaultPackageDirectorie } from "./utils";
import * as ChildProcess from "child_process";
import getLogger from "./logger";
import * as Fs from "fs-extra";


// TODO set logs


const { default: defaultLogger, info: infoLogger } = getLogger({
    indentifyer: "deploy",
});

require("dotenv").config();

const deployUtilsConfig = require("../deployUtilsConfig.json");

(async () => {
    if (!Fs.pathExistsSync(Path.join('retrieved'))) {
        return infoLogger.error(`Didn't found ./retrieved, make sure you retrieved your metadata first.`);
    }

    var sourceOptions: Array<{ name: string, value: string }> = [];
    for (const dirItem of Fs.readdirSync(Path.join('retrieved'), { withFileTypes: true })) {
        if (dirItem.isFile()) continue;

        sourceOptions.push({ name: dirItem.name, value: Path.join('retrieved', dirItem.name) })
    }

    if (sourceOptions.length == 0) {
        return infoLogger.error(`./retrieved dir is empty, make sure you retrieved your metadata first.`);
    }

    let deploySourcepath = Path.join('force-app', 'main', 'default');
    // if (Fs.readdirSync(deploySourcepath).length > 0) {
    //     if (Fs.existsSync(deploySourcepath)) {
    //         let message = `${deploySourcepath} already has files, if you continue, you may lose changes outside it, continue deploy?`;

    //         if (!await inquirer.confirm({ message })) {
    //             return infoLogger.info("Process exit by the user");
    //         }
    //     }
    // }

    var targetDir = "";

    do {
        targetDir = await inquirer.getListItem({ message: 'Select a dir to deploy', options: sourceOptions });

        if (targetDir == "") {
            infoLogger.error("User didn't select a source dir.")
        }

    } while (targetDir == "");

    const orgAlias = targetDir.split(Path.sep).pop()

    // defaultLogger.info("Using " + targetDir);

    // var targetPackage = Path.join(targetDir, 'package.xml');

    // if (!Fs.existsSync(targetPackage)) return infoLogger.error(`${targetDir} doesn't has a package.xml file, make sure path ${targetPackage} exists.`);


    // Fs.rmdirSync(deploySourcepath, { recursive: true });
    // Fs.mkdirSync(deploySourcepath, { recursive: true });


    // infoLogger.info("Copying files of " + targetDir + " to " + deploySourcepath);

    // Fs.copySync(targetDir, deploySourcepath);

    // Fs.rmSync(Path.join(deploySourcepath, 'package.xml'))

    // infoLogger.info("Files copied to " + deploySourcepath);

    let tempPackage = Path.join(...[...deployUtilsConfig.package.manifestDir, '__TempPackage.xml'])

    // Fs.copyFileSync(targetPackage, tempPackage);

    let sfdxCmd = `sfdx force:source:deploy -x="${tempPackage}" -u="${process.env[orgAlias]}"`

    console.log({ sfdxCmd });

    // build sfdx process

})();
