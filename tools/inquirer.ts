import * as inquirer from 'inquirer';
import * as Path from 'path';

inquirer.registerPrompt('fileTreeSelection', require('inquirer-file-tree-selection-prompt'))


export async function getFileOrDirPath(options: { rootPath: string, message: string }) {

    let response = (await inquirer.prompt({
        //@ts-ignore
        type: 'fileTreeSelection',
        name: 'resp',
        message: options.message,
        root: options.rootPath,
    })).resp

    return response;

}

export async function getListItem(options: {
    message: string, options: Array<string | { name: string, value: string }>
}) {
    let response = (await inquirer.prompt({
        //@ts-ignore
        type: 'list',
        name: 'resp',
        message: options.message,
        choices: options.options,
    })).resp

    return response;
}