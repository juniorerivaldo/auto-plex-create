import fs from "fs-extra";
import npmlog from "npmlog";

npmlog.heading = "Auto-Plex";

export async function createProject(projectName) {
  const projectDir = `./${projectName}`;
  npmlog.info("create", `Getting Started Creating the Project >> "${projectName}" <<`);

  // Create the project Folder
  fs.ensureDirSync(projectDir);
  npmlog.info("create", `Project Folder "${projectName}" created`);

  // Create the 'server' Folder in the project
  const serverDir = `${projectDir}/server`;
  fs.ensureDirSync(serverDir);
  npmlog.info("create", 'Folder "server" created');

  // Create the 'client' Folder in the project
  const clientDir = `${projectDir}/client`;
  fs.ensureDirSync(clientDir);
  npmlog.info("create", 'Folder "client" created');

  // Create Folder 'src' in the project
  const srcDir = `${serverDir}/src`;
  fs.ensureDirSync(srcDir);
  npmlog.info("create", 'Folder "src" created');

  // Create Folders inside 'src'
  const Folders = ["middlewares", "controllers", "services", "integrations", "helpers", "@types/express"];
  Folders.forEach((Folder) => {
    fs.ensureDirSync(`${srcDir}/${Folder}`);
    npmlog.info("create", `Folder "${Folder}" created inside "src"`);
  });

  // Create index.d.ts file inside 'express'
  const indexDtsContent = `declare namespace Express {
  export interface Request {
    user_id: string;
  }
}`;
  fs.writeFileSync(`${srcDir}/@types/express/index.d.ts`, indexDtsContent);
  npmlog.info("create", 'File "index.d.ts" created inside "@types/express"');

  // Create isAuthenticated.ts file inside 'middlewares'
  const isAuthenticatedContent = `import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

interface Payload {
  sub: string;
}

export function isAuthenticated(request: Request, response: Response, next: NextFunction) {
    const authToken = request.headers.authorization;
    if (!authToken) {
        return response.status(401).end;
    }
    const [, token] = authToken.split(" "); // ignores the word Bearer and takes only the token

    try {
        const { sub } = verify(token, process.env.JWT_SECRET_KEY) as Payload;
        request.user_id = sub; // exporting the user_id to use in every place that has the middleware
        return next();
    } catch (error) {
        return response.status(401).end();
    }
}`;
  fs.writeFileSync(`${srcDir}/middlewares/isAuthenticated.ts`, isAuthenticatedContent);
  npmlog.info("create", 'File "isAuthenticated.ts" created inside "middlewares"');

  // Create the package.json file
  const packageJson = {
    name: projectName,
    version: "1.0.0",
    description: "Project description",
    scripts: {
      dev: "ts-node-dev --transpile-only src/server.ts",
    },
    devDependencies: {
      "@types/bcryptjs": "^2.4.2",
      "@types/cors": "^2.8.13",
      "@types/express": "^4.17.17",
      "@types/jsonwebtoken": "^9.0.2",
      "ts-node-dev": "^2.0.0",
      typescript: "^4.3.5",
    },
    dependencies: {
      "@prisma/client": "^4.15.0",
      bcryptjs: "^2.4.3",
      cors: "^2.8.5",
      express: "^4.18.2",
      "express-async-errors": "^3.1.1",
      "express-handlebars": "^7.0.7",
      jsonwebtoken: "^9.0.0",
      nodemailer: "^6.9.3",
      "nodemailer-express-handlebars": "^6.1.0",
      prisma: "^4.15.0",
    },
  };
  fs.writeFileSync(`${serverDir}/package.json`, JSON.stringify(packageJson, null, 2));
  npmlog.info("create", 'File "package.json" created');

  // Create routes.ts file inside 'src'
  const routesContent = `import { Router } from "express";
import { isAuthenticated } from "./middlewares/isAuthenticated";

const router = Router();

// Define your routes here... Or user cwc package to automate this tasks :)

export { router };
`;
  fs.writeFileSync(`${srcDir}/routes.ts`, routesContent);
  npmlog.info("create", 'File "routes.ts" created inside "src"');

  // Create the server.ts file inside 'src'
  const serverContent = `import express, { Request, Response, NextFunction } from "express";
import "express-async-errors";
import cors from "cors";
import { router } from "./routes";

const app = express();
app.use(express.json());
app.use(cors());

app.use(router);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof Error) {
    return res.status(400).json({
      error: err.message,
    });
  }
  return res.status(500).json({
    status: "error",
    message: "Internal server error.",
  });
});

app.listen(3333, () => {
  console.log("SERVER ONLINE ON: " + 3333);
});
`;
  fs.writeFileSync(`${srcDir}/server.ts`, serverContent);
  npmlog.info("create", 'File "server.ts" created inside "src"');

  // Create the .gitignore file in the root of the project
  const gitignoreContent = `node_modules
# Keep environment variables out of version control
.env
`;
  fs.writeFileSync(`${projectDir}/.gitignore`, gitignoreContent);
  npmlog.info("create", 'File ".gitignore" created');

  npmlog.info("create", `Project "${projectName}" Started!`);
}

