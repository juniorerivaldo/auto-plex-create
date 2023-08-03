


# Auto-Plex

Auto-Plex is a command-line tool (CLI) that enables users to swiftly generate the fundamental structure for starting Node.js projects, simplifying the development of applications and APIs using TypeScript, Express.js, and Prisma ORM. With the aid of Auto-Plex, developers can save time and effort in the initial project setup, obtaining a solid foundation to kickstart their applications.

## Installation

```
1. 

```

## Getting Started

To create a new project with Auto-Plex, run the following command:

```
npx auto-plex-create

```

This will prompt you to enter the name of your project. After entering the project name, Auto-Plex will create the necessary directory structure, initialize TypeScript configuration, and set up Prisma for database access.

## Project Structure

The project structure created by Auto-Plex will look like this:

```
Auto-Plex/
  ├── src/
  │   ├── @types/
  │   │   └── express/
  │   │       └── index.d.ts
  │   ├── controllers/
  │   ├── helpers/
  │   ├── integrations/
  │   ├── middlewares/
  │   │   └── isAuthenticated.ts
  │   ├── services/
  │   └── server.ts
  ├── prisma/
  │   └── index.ts
  ├── .gitignore
  ├── package.json
  └── tsconfig.json
  
```

## License

This project is open-source and available under the [MIT License](LICENSE).
Copyright (c) 2023-present, Cafe (Erivaldo) Com Código

## Author

Auto-Plex is developed and maintained by Café com Código. You can find us on GitHub at [https://github.com/juniorerivaldo](https://github.com/juniorerivaldo).

## Contributing

We welcome contributions from the community. If you find any issues or have suggestions for improvements, feel free to create an issue or submit a pull request.

Happy coding!
