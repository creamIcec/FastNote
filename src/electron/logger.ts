import * as winston from "winston";
import { isDev } from "./environment-util.js";
import { resolve } from "path";
import { fileURLToPath } from "url";
const { combine, timestamp, printf, splat, errors, colorize } = winston.format;
const { transports } = winston;

//from https://stackoverflow.com/questions/53655740/how-to-pass-a-filename-to-winston-logger
//modified some import entries to satisfy typescript requirements

//output to both console and file when in development
//output only to file when not in development(for example production)
export default (meta_url: string) => {
  //ps: construct a relative path of the target file to root directory
  const root = resolve("./");
  const file = fileURLToPath(new URL(meta_url));
  const file_path = file.replace(root, "");
  //TODO: use

  const customFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}] ${file_path}: ${stack || message}`;
  });

  const loggerInstance = winston.createLogger({
    level: "info",
    format: combine(
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      splat(),
      errors({ stack: true }),
      customFormat
    ),
    defaultMeta: { service: "user-service" },
    transports: [
      new transports.File({ filename: "log/error.log", level: "error" }),
      new transports.File({ filename: "log/common.log" }),
    ],
  });

  if (isDev()) {
    loggerInstance.add(
      new transports.Console({
        format: combine(colorize(), customFormat),
      })
    );
  }

  return loggerInstance;
};
