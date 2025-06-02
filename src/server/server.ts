import { Appeal, setRecords } from "./config/Sequelize.js";
import express, { NextFunction, Request, Response } from 'express';
import { conf } from './config/conf.js';
import router from "./router/appealRouter.js";

(async () => {
  try {
    const app = express();
    
    try {
      await Appeal.sync({force: true});
      await setRecords();
    } catch (err) {
      console.error('Ошибка при инициализации базы данных: ' + err);
      process.exit(1);
    }

    app.use((req: Request, res: Response, next: NextFunction) => { // ставит cors
      res.header('Access-Control-Allow-Origin', '*');
      next();
    });
    
    app.use('/', router)

    app.listen(conf.PORT, () => {
      console.log(`Сервер запущен на порту: ${conf.PORT}`)
    }).on('error', (err) => {
      console.error('Ошибка при запуске сервера', err)
      process.exit(1)
    })

  } catch (err){
    console.error('Критическая ошибка инициализации приложения:', err)
    process.exit(1)
  }
})()