// TODO convert to class and global var
import * as Fs from "fs";
import * as Path from "path";
import * as log4js from "log4js";

function prettyNum(num: number) {
  return num < 10 ? `0${num}` : num;
}

// level?:  "ALL", "TRACE", "DEBUG", "INFO", "WARN", "ERROR", "FATAL", "MARK", "OFF";

export default function getLogger(options: { indentifyer?: string }) {
  var { indentifyer } = options;
  indentifyer = indentifyer ?? "";

  let startDate = new Date();
  let year = startDate.getFullYear(),
    mouth = prettyNum(startDate.getMonth() + 1),
    day = prettyNum(startDate.getDate()),
    hour = prettyNum(startDate.getHours()),
    minute = prettyNum(startDate.getMinutes()),
    seconds = prettyNum(startDate.getSeconds());

  let fileName = `${year}-${mouth}-${day}_${hour}-${minute}-${seconds}`;

  if (Fs.existsSync(Path.join("logs", "process"))) {
    Fs.mkdirSync(Path.join("logs", "process"), { recursive: true });
  }

  let logPath = Path.join("logs", "process", `${fileName}_${indentifyer}.log`);

  log4js.configure({
    appenders: {
      default: { type: "file", filename: logPath },
      info: { type: "console" },
    },
    categories: {
      default: { appenders: ["default"], level: "all" },
      info: { appenders: ["default", "info"], level: "all" },
      sfdx: { appenders: ["default", "info"], level: "all" },
    },
  });

  return {
    default: log4js.getLogger("default"),
    info: log4js.getLogger("info"),
    sfdx: log4js.getLogger("sfdx"),
    path: logPath
  };

  
}


export function prettySfdxLog(sfdxLog: string) {


  return sfdxLog
}