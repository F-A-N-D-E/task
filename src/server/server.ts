import fs, { readFile } from 'fs/promises';
import { Appeal, setRecords, sequelize } from "../config/Sequelize.js";
import {ElemQueryCreate, TypeQueryGetForDate, TypeQueryGetBetweenDate, ElemResponServer} from '../../@types/type.js'
import express, { Request, Response } from 'express';
import { conf } from '../config/conf.js';
import SendResponForGetRequest from './utils/SendResponForGetRequest.js';

const app = express()

await Appeal.sync({force: true})
await setRecords()

app.use((req, res, next) => {//ставит cors
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/create', async (req: Request, res: Response) => { // создает обращение
  let query = req.query as ElemQueryCreate
  
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
  .then(()=>res.send('успешно'))
  .catch(()=>res.send('Ошибка БД'))
})

app.get('/createPage', async (req: Request, res: Response) => { // отдает html документ
  let formPage: string
  
  await readFile('./src/public/html/form.html', 'utf-8')
  .then(r=>formPage = r)
  .catch(()=>formPage = 'Файл html не найден')

  res.send(formPage)
})

app.get('/getBetweenDate', async (req: Request, res: Response) => {//ищет по диапазону
  let query: TypeQueryGetBetweenDate = req.query
  
  let date: unknown[]|string
  
  if(!query.from && query.to){// есть только куда
    await sequelize.query(
      'SELECT * FROM appeal WHERE date_create <= :dateTo',
      {
        replacements: {dateTo: query.to}
      })
    .then(r=>date = r[0])
    .catch(()=>date = 'Ошибка БД')

    SendResponForGetRequest(date, res)

  } else if(query.from && !query.to){// есть только от куда
    await sequelize.query(
      'SELECT * FROM appeal WHERE date_create >= :dateFrom',
      {
        replacements: {dateFrom: query.from}
      })
    .then(r=>date = r[0])
    .catch(()=>date = 'Ошибка БД')

    SendResponForGetRequest(date, res)

  }else if (!query.from && !query.to){ // отсутствие дат
    res.send({date: 'Пожалуйста, введите дату диапазона'})

  } else if (query.from && query.to){// по диапазону
    await sequelize.query(`
      SELECT * FROM appeal
      WHERE date_create BETWEEN :dateFrom AND :dateTo;`,
      {
        replacements: {
          dateFrom: query.from,
          dateTo: query.to
        }
      })
    .then(r=>date = r[0])
    .catch(()=>date = 'Ошибка БД')

    SendResponForGetRequest(date, res)
  }
})

app.get('/getForDate', async (req: Request, res: Response) => {//ищет по конкретной дате
  let query: TypeQueryGetForDate = req.query

  let date: unknown[]|string
  
  if (query.date) {
    await sequelize.query(`
      SELECT * FROM appeal WHERE date_create = :date`,
      {
        replacements: {date: query.date}
      })
    .then(r=>date = r[0])
    .catch(()=>date = 'Ошибка БД')

    SendResponForGetRequest(date, res)
    
  } else {
    res.send({ date: 'Пожалуйста, введите дату'})
  }
})

app.get('/process/:id', async (req: Request, res: Response) => { // выставляет статус process
  await sequelize.query(`
    UPDATE appeal SET status = 'process', respon = '' WHERE id = :id`,
    {
      replacements: {id: req.params.id}
    })
  .then(()=>res.send('ok'))
  .catch(()=>res.send('Ошибка БД'))
})

app.get('/completed/:id', async (req: Request, res: Response) => {// выставляет статус completed
  let text = req.query.text as string
  
  await sequelize.query(`
    UPDATE appeal SET status = 'completed', respon = :text WHERE id = :id`,
    {
      replacements: {
        text: text,
        id: req.params.id
      }
    })
  .then(()=>res.send('ok'))
  .catch(()=>res.send('Ошибка БД'))
})

app.get('/reject/:id', async (req: Request, res: Response) => {// выставляет статус reject
  let text = req.query.text as string
  
  await sequelize.query(`
    UPDATE appeal SET status = 'reject', respon = :text WHERE id = :id`,
    {
      replacements: {
        text: text,
        id: req.params.id
      }
    })
    .then(()=>res.send('ok'))
    .catch(()=>res.send('Ошибка БД'))
})

app.get('/cancelProcess', async (req: Request, res: Response) => { // отменить все, что в работе
  await sequelize.query(`
    UPDATE appeal SET status = 'reject', respon = 'нажатие кнопки "отменить все активные"' WHERE status = 'process'
  `)
  .then(()=>res.send('ok'))
  .catch(()=>res.send('Ошибка БД'))
})

app.listen(conf.PORT)