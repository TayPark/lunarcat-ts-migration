import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  info: {
    // API informations (required)
    title: 'epiclogue API', // Title (required)
    version: '1.0.0', // Version (required)
    description: 'Epiclogue service API', // Description (optional)
  },
  host: 'api.epiclogue.com', // Host (optional)
  basePath: '/', // Base path (optional)
  schemes: ['https'],
};

const options = {
  swaggerDefinition,
  apis: ['./apidoc.yaml'],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
