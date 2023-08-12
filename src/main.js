import { promptProjectName } from "../modules/prompt.js";
import { createProject } from "../modules/project.js";
import { installDependencies } from "../modules/back-end/dependencies.js";
import { integrationsInject } from "../modules/back-end/integrationsInject.js";
import { helpersInject } from "../modules/back-end/helpersInject.js";

export async function main() {
  const projectName = await promptProjectName();
  createProject(projectName);

  //back-end creation
  integrationsInject(projectName);
  helpersInject(projectName);
  installDependencies(`./${ projectName }/server`);
  
  //front-end creation

}
