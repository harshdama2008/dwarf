import fs from "fs";
import { IDE } from "..";
import { getGlobalMangoIgnorePath } from "../util/paths";
import { gitIgArrayFromFile } from "./ignore";

export const getGlobalMangoIgArray = () => {
  const contents = fs.readFileSync(getGlobalMangoIgnorePath(), "utf8");
  return gitIgArrayFromFile(contents);
};

export const getWorkspaceMangoIgArray = async (ide: IDE) => {
  const dirs = await ide.getWorkspaceDirs();
  return await dirs.reduce(
    async (accPromise, dir) => {
      const acc = await accPromise;
      try {
        const contents = await ide.readFile(`${dir}/.mangoignore`);
        return [...acc, ...gitIgArrayFromFile(contents)];
      } catch (err) {
        console.error(err);
        return acc;
      }
    },
    Promise.resolve([] as string[]),
  );
};
