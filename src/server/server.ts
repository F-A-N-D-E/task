import { Appeal, setRecords } from "../config/Sequelize.js";
import express, { NextFunction, Request, Response } from 'express';
import { conf } from '../config/conf.js';
import SetProcessStatus from './router/EmployeeOperationAppeal/SetStatusAppeal/SetProcessStatus.js';
import SetCompletedStatus from "./router/EmployeeOperationAppeal/SetStatusAppeal/SetCompletedStatus.js";
import SetRejectStatus from "./router/EmployeeOperationAppeal/SetStatusAppeal/SetRejectStatus.js";
import SetCancelAllProcess from "./router/EmployeeOperationAppeal/SetStatusAppeal/SetCancelAllProcess.js";
import GetForDate from "./router/EmployeeOperationAppeal/SearchAppeal/GetForDate.js";
import GetBetweenDate from "./router/EmployeeOperationAppeal/SearchAppeal/GetBetweenDate.js";
import CreateAppeal from "./router/UserOperationAppeal/CreateAppeal.js";

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

    app.get('/create', CreateAppeal) // создает обращение

    app.get('/getBetweenDate', GetBetweenDate)//ищет по диапазону

    app.get('/getForDate', GetForDate) //ищет по конкретной дате

    app.get('/process/:id', SetProcessStatus) // выставляет статус process

    app.get('/completed/:id', SetCompletedStatus)// выставляет статус completed

    app.get('/reject/:id', SetRejectStatus)// выставляет статус reject

    app.get('/cancelProcess', SetCancelAllProcess) // отменить все, что в работе

    app.use((err: Error, req: Request, res: Response) => { // обработчик для не перехваченных ошибок
      console.error('Общая ошибка:', err)
      res.status(500).send({ err: 'Внутренняя ошибка сервера' })
    })
    
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