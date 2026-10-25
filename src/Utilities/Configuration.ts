export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database2: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    test: 'test'
  }
});