# --appname--

This project was bootstrapped with [Create DECAF Webapp](https://github.com/teloscube/create-decaf-webapp).

## Up and Running

Once you clone the repository,

- copy `.env.example` to `.env` and update the values as needed.
- Install dependencies with `npm install`.
- Run the `npm run codegen` command to generate types for your GraphQL schema. [1]

Now you can run the app in development mode with:

```bash
npm start
```

Then open [http://localhost:3000/webapps/--projectname--/development/](http://localhost:3000/webapps/--projectname--/development/) to see your app.

## Building for Production

To build the app for production, run:

```bash
npm run build
```

To run the app in production mode, run:

```bash
npm run preview
```

Now you can open your app on the same URL with the port 5000.

## Notes

[1] This will generate types for your GraphQL schema. If you are not using GraphQL, you can remove the `codegen` script from `package.json` and the `codegen.ts` file. If you are using GraphQL, you will need to run this command every time you change the GraphQL schema. It also will be run automatically when you `npm run build`.

## Deployment

Do not forget to add required environment `secrets` to your GitHub repository. You can find the list of required secrets and variables in the [`.github/workflows/deploy-production.yml`](.github/workflows/deploy-production.yml) file.
