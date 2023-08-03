import { existsSync } from "fs";
import { resolve } from "path";

export async function promptProjectName() {
  const inquirer = await import("inquirer").then((m) => m.default || m);
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: "Enter the project name:",
    },
  ]);

  if (answers.projectName !== "") {
    const projectPath = resolve(answers.projectName);
    if (existsSync(projectPath)) {
      console.log("Error: A folder with the same name already exists.");
      process.exit(1); 
    }
    return answers.projectName;
  } else {
    console.log("Error: Project name is empty.");
    process.exit(1); 
  }
}
