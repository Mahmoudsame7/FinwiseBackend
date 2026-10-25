import { DataSource } from 'typeorm';
import 'dotenv/config';

console.log('database_url:' ,process.env.DATABASE_URL);

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,

      

  entities: ['src/**/*.entity.{.ts,.js}'],
  migrations: ['src/migrations/*{.ts,.js}'],

  ssl: { rejectUnauthorized: false },
  synchronize: false,
});

export default AppDataSource;