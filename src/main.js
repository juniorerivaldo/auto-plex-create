import { promptProjectName } from "../modules/prompt.js";
import { createProject } from "../modules/project.js";
import { installDependencies } from "../modules/dependencies.js";

export async function main () {
  const projectName = await promptProjectName();
  createProject(projectName);
  installDependencies(`./${projectName}/server`);
}
