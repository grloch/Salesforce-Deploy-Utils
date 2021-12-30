import * as inquirer from "inquirer";
import * as Path from "path";

interface getListItemParams {
  message: string; multiples?: Boolean;
  options: Array<string | { name: string; value: string }>;
}

inquirer.registerPrompt(
  "fileTreeSelection",
  require("inquirer-file-tree-selection-prompt")
);

export async function getFileOrDirPath(options: {
  rootPath: string;
  message: string;
}) {
  let response = (
    await inquirer.prompt({
      //@ts-ignore
      type: "fileTreeSelection",
      name: "resp",
      message: options.message,
      root: options.rootPath,
    })
  ).resp;

  return response;
}

export async function getListItem(options: getListItemParams) {
  function validate(input: any) {
    if (options.multiples && input.length <= 0) {
      return 'select at least one alias option'
    }

    return true;
  }

  return (await inquirer.prompt({
    type: options.multiples ? "checkbox" : "list",
    name: "resp",
    message: options.message,
    choices: options.options,
    validate: validate
  })).resp;
}

export async function confirm(options: {
  message: string;
  option?: { y: string; n: string };
}) {
  let response = (
    await inquirer.prompt({
      type: "confirm",
      name: "resp",
      message: options.message,
      //   choices: [],
    })
  ).resp;

  return response;
}
