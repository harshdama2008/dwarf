import fs from "fs";
import { IDE } from "..";
import { getGlobalDwarfIgnorePath } from "../util/paths";
import { gitIgArrayFromFile } from "./ignore";

export const getGlobalDwarfIgArray = () => {
  const contents = fs.readFileSync(getGlobalDwarfIgnorePath(), "utf8");
  return gitIgArrayFromFile(contents);
};

export const getWorkspaceDwarfIgArray = async (ide: IDE) => {
  const dirs = await ide.getWorkspaceDirs();
  return await dirs.reduce(
    async (accPromise, dir) => {
      const acc = await accPromise;
      try {
        const contents = await ide.readFile(`${dir}/.dwarfignore`);
        return [...acc, ...gitIgArrayFromFile(contents)];
      } catch (err) {
        console.error(err);
        return acc;
      }
    },
    Promise.resolve([] as string[]),
  );
};
