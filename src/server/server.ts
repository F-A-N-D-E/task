import fs from 'fs';
import { Appeal, setRecords, sequelize } from "../config/Sequelize.js";
import {TypeElemQueryCreate, TypeQueryGetForDate, TypeQueryGetBetweenDate} from '../../@types/type.js'
import express, { NextFunction, Request, Response } from 'express';
import { conf } from '../config/conf.js';
import validDate from '../validation/validDate.js';
import validateStringLength from '../validation/validateStringLength.js';
import validateSpaces from '../validation/validateOnlySpaces.js';

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

    app.get('/create', async (req: Request, res: Response) => { // создает обращение
      try {  
        let query = req.query as TypeElemQueryCreate;
        
        if (!query.title ||
            !query.message_appeal ||
            !validateSpaces(query.title) ||
            !validateSpaces(query.message_appeal)
          ) {
          res.send({err: 'Заголовок и текст обращения должны быть заполнены'})
          return
        } else if (!validateStringLength(query.title) || !validateStringLength(query.message_appeal)) {
          res.send({err: 'Вы превысили максимальную длину текста в 255 символов'})
          return
        }
        
        await sequelize.query(`
          INSERT INTO appeal (status, title, message_appeal, respon, date_create)
          VALUES ('new', :title, :message_appeal, '', :date);`,
        {
          replacements: {
            title: query.title,
            message_appeal: query.message_appeal,
            date: query.date
          }
        })
        
        res.send({data: 'ok'})

      } catch (err) {
        console.error('Ошибка при создании обращения:' + err);
        res.status(500).send({err: 'Ошибка сервера при создании обращения'});
      }
    })

    app.get('/createPage', async (req: Request, res: Response) => { // отдает html документ
      try {
        const stream = fs.createReadStream('./src/public/html/form.html');

        stream.on('error', () => {
          res.status(404).send('Файл html не найден');
        });

        res.setHeader('Content-Type', 'text/html');

        stream.pipe(res);

      } catch (err) {
        console.error('Ошибка сервера при отправке страницы:' + err);
        res.status(500).send('Ошибка сервера при отправке страницы');
      }
    })

    app.get('/getBetweenDate', async (req: Request, res: Response) => {//ищет по диапазону
      try {
        let query: TypeQueryGetBetweenDate = req.query;
      
        let data: unknown[]
        
        if(!validDate(query.from) && validDate(query.to)){// есть только куда
          [data] = await sequelize.query(
            'SELECT * FROM appeal WHERE date_create <= :dateTo',
          {
            replacements: {dateTo: query.to}
          })
         
        } else if (validDate(query.from) && !validDate(query.to)){// есть только от куда
          [data] = await sequelize.query(
            'SELECT * FROM appeal WHERE date_create >= :dateFrom',
          {
            replacements: {dateFrom: query.from}
          })

        } else if (validDate(query.from) && validDate(query.to)){// по диапазону
          [data] = await sequelize.query(`
            SELECT * FROM appeal
            WHERE date_create BETWEEN :dateFrom AND :dateTo;`,
            {
              replacements: {
                dateFrom: query.from,
                dateTo: query.to
              }
            }
          )

        } else if (!validDate(query.from) && !validDate(query.to)){ // некорректная дата
          res.send({err: 'Пожалуйста, введите дату в формате - "YYYY-MM-DD"'});
          return
        }

        if (data.length == 0){
          res.send({err: 'Обращения отсутствуют за указанный период'})
        } else {
          res.send({data: data})
        }
        
      } catch (err) {
        console.error('Ошибка при получении по диапазону:', err);
        res.status(500).send({ err: 'Ошибка базы данных' });
      }
    })

    app.get('/getForDate', async (req: Request, res: Response) => { //ищет по конкретной дате
      try {
        let query: TypeQueryGetForDate = req.query;
      
        if (!validDate(query.date)) {
          res.send({err: 'Пожалуйста, введите дату в формате - "YYYY-MM-DD"'})
          return
        }
        
        let [data] = await sequelize.query(`
          SELECT * FROM appeal WHERE date_create = :date`,
          {
            replacements: {date: query.date}
          }
        )
        
        if (data.length == 0){
          res.send({err: 'Обращения отсутствуют за указанную дату'})
          return
        }
        
        res.send({data: data})

      } catch (err) {
        console.error('Ошибка при получении по дате:', err);
        res.status(500).send({ err: 'Ошибка базы данных' });
      }
    })

    app.get('/process/:id', async (req: Request, res: Response) => { // выставляет статус process
      try {
        await sequelize.query(`
        UPDATE appeal SET status = 'process', respon = '' WHERE id = :id`,
        {
          replacements: {id: req.params.id}
        })

        res.send({data: 'ok'})

      } catch (err) {
        console.error('Ошибка при обновлении статуса process:', err);
        res.status(500).send({ err: 'Ошибка БД'});
      }
    })

    app.get('/completed/:id', async (req: Request, res: Response) => {// выставляет статус completed
      try {
        let text = req.query.text as string
      
        if (!text || !validateSpaces(text)){
          res.send({err: "Текст ответа должен быть заполнен"})
          return
        } else if (!validateStringLength(text)){
          res.send({err: 'Вы превысили максимальную длину текста в 255 символов'})
          return
        }
        
        await sequelize.query(`
          UPDATE appeal SET status = 'completed', respon = :text WHERE id = :id`,
          {
            replacements: {
              text: text,
              id: req.params.id
            }
          })

        res.send({data: 'ok'})
        
      } catch (err) {
        console.error('Ошибка при обновлении статуса в completed:', err);
        res.status(500).send({err: 'Ошибка БД'});
      }
    })

    app.get('/reject/:id', async (req: Request, res: Response) => {// выставляет статус reject
      try {
        let text = req.query.text as string
      
        if (!text || !validateSpaces(text)){
          res.send({err: "Текст ответа должен быть заполнен"})
          return
        } else if (!validateStringLength(text)){
          res.send({err: 'Вы превысили максимальную длину текста в 255 символов'})
          return
        }
        
        await sequelize.query(`
          UPDATE appeal SET status = 'reject', respon = :text WHERE id = :id`,
          {
            replacements: {
              text: text,
              id: req.params.id
            }
          })

        res.send({data: 'ok'})

      } catch (err) {
        console.error('Ошибка при обновлении статуса в reject:', err);
        res.status(500).send({err: 'Ошибка БД'});
      }
    })

    app.get('/cancelProcess', async (req: Request, res: Response) => { // отменить все, что в работе
      try {
        await sequelize.query(`
          UPDATE appeal SET status = 'reject', respon = 'нажатие кнопки "отменить все активные"' WHERE status = 'process'
        `)

        res.send({data: 'ok'})

      } catch (err) {
        console.error('Ошибка при отмене всех активных:', err);
        res.status(500).send({err: 'Ошибка БД'});
      }
    })

    app.use((err: Error, req: Request, res: Response, next: NextFunction) => { // обработчик для не перехваченных ошибок
      console.error('Общая ошибка:', err);
      res.status(500).send({ err: 'Внутренняя ошибка сервера' });
    });
    
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