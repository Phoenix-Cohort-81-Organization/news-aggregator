const env = require('./src/config/env');
const connectDB = require('./src/config/database');
const app = require('./app');

const startServer = async () => {
  await connectDB();

  app.listen(env.port, () => {
    console.log(`News Aggregator API listening on port ${env.port}`);
  });
};

startServer().catch((error) => {
  console.error(`Unable to start server: ${error.message}`);
  process.exit(1);
});