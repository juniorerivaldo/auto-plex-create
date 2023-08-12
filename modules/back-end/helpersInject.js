import fs from "fs-extra";
import npmlog from "npmlog";

npmlog.heading = "Auto-Plex";

export async function helpersInject (projectName) {
    npmlog.info("create", "creating routes-helper file...");
    const srcDir = `${ projectName }/server/src/helpers`;
    fs.ensureDirSync(srcDir);

    const routeCreationCode = `
const fs = require("fs");

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

async function createRouteFiles(routeName, pathName, method, isPrivate) {
  const inquirer = await import("inquirer").then((m) => m.default || m);
  // Create the route in routes.ts
  const routeDeclaration = \`router.\${method}("/\${routeName}", \${isPrivate ? "isAuthenticated, " : ""}new \${routeName}Controller().handle);\`;

  const controllerContent = \`import { Request, Response } from 'express';
  import { \${routeName}Service } from '../../services/\${pathName}/\${routeName}Service'; 
  
  class \${routeName}Controller {
    async handle(request: Request, response: Response) {
      \${isPrivate ? "const userId = request.user_id;" : ""}
      const \${routeName.toLowerCase()}Service = new \${routeName}Service();
      const res = await \${routeName.toLowerCase()}Service.execute(\${isPrivate ? "{ userId }" : ""});
      // Implement your logic here
      return response.json(res)
    }
  }
  
  export { \${routeName}Controller };
  \`;

  const serviceContent = \`import PrismaClient from '../../../prisma';

\${isPrivate ? \`interface \${capitalizeFirstLetter(routeName)}Request { 
userId: string; 
}\` : ""}

class \${routeName}Service {
  async execute(\${isPrivate ? "{ userId }:" + capitalizeFirstLetter(routeName) + "Request" : ""}) {
    // Implement your logic here
  }
}

export { \${routeName}Service }; 
\`;

  // Read the existing routes.ts content
  const routesPath = "./src/routes.ts";
  let routesContent = "";
  try {
    routesContent = fs.readFileSync(routesPath, "utf8");
  } catch (error) {
    // If the file doesn't exist, create one with import statements
    routesContent = \`import express from 'express';
import \${routeName}Controller from './controllers/\${pathName}/\${routeName}Controller'; 

const router = express.Router();

//end-imports

export default router;
//start-routes
\`;
  }

  // Find the index of the last import controller in the routesContent
  const lastImportIndex = routesContent.lastIndexOf("import {");

  // Find the index of the last route declaration in the routesContent
  const lastRouteIndex = routesContent.lastIndexOf("export {");

  // If both the last import controller and the last route declaration are found, insert the import statement and the route declaration after them
  if (lastImportIndex !== -1 && lastRouteIndex !== -1) {
    const start = routesContent.substring(0, lastImportIndex);
    const middle = routesContent.substring(lastImportIndex, lastRouteIndex);
    const end = routesContent.substring(lastRouteIndex);
    routesContent =
      start + \`import { \${routeName}Controller } from './controllers/\${pathName}/\${routeName}Controller';\\n\` + middle + \`\${routeDeclaration}\\n\` + end;
  } else {
    console.log(lastImportIndex,lastRouteIndex)
    console.log(
      \`Warning: The last import controller and/or the last route declaration not found in routes.ts. The import statement and the route declaration will be appended at the end of the file.\\n\`
    );
    // Update the routes content with the new route declaration
    routesContent += \`\\n\${routeDeclaration}\\n\`;
  }

  // Write the updated content back to the routes.ts file
  fs.writeFileSync(routesPath, routesContent);

  fs.mkdirSync(\`./src/controllers/\${pathName}\`, { recursive: true });
  fs.writeFileSync(\`./src/controllers/\${pathName}/\${routeName}Controller.ts\`, controllerContent);

  fs.mkdirSync(\`./src/services/\${pathName}\`, { recursive: true });
  fs.writeFileSync(\`./src/services/\${pathName}/\${routeName}Service.ts\`, serviceContent);

  console.log("Route created successfully.");
}

async function runCLI() {
  const inquirer = await import("inquirer").then((m) => m.default || m);

  inquirer
    .prompt([
      {
        type: "input",
        name: "routeName",
        message: "Enter the name of the route:",
      },
      {
        type: "input",
        name: "pathName",
        message: "Enter the path name:",
      },
      {
        type: "list",
        name: "method",
        message: "Select the HTTP method:",
        choices: ["get", "post"],
      },
      {
        type: "confirm",
        name: "isPrivate",
        message: "Is it a private route?",
        default: false,
      },
    ])
    .then((answers) => {
      createRouteFiles(answers.routeName, answers.pathName, answers.method, answers.isPrivate);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

runCLI();
`;
fs.writeFileSync(`${ srcDir }/createRoutes.ts`, routeCreationCode);
}