import { readFile } from 'fs/promises';
import { Appeal, setRecords, sequelize } from "./sequelize/Sequelize.js";
import {ElemQueryCreate, TypeQueryGetForDate, TypeQueryGetBetweenDate} from './type/type.js'
import express, { Request, Response } from 'express';

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
    VALUES ('new', '${query.title}', '${query.message_appeal}', '', '${query.date}');
  `).then(()=>res.send('успешно'))
})

app.get('/createPage', async (req: Request, res: Response) => { // отдает html текст
  let formPage = await readFile('./html/form.html', 'utf-8');
  res.send(formPage)
})

app.get('/getBetweenDate', async (req: Request, res: Response) => {//ищет по диапазону
  let query: TypeQueryGetBetweenDate = req.query

  console.log()
  
  if(!query.from && query.to){// есть только куда
    const [date, _] = await sequelize.query(`
      SELECT * FROM appeal WHERE date_create <= '${query.to}'
    `)
    sendResponForGetRequest(date, res)

  } else if(query.from && !query.to){// есть только от куда
    const [date, _] = await sequelize.query(`
      SELECT * FROM appeal WHERE date_create >= '${query.from}'
    `)
    sendResponForGetRequest(date, res)

  }else if (!query.from && !query.to){ // отсутствие дат
    res.send({date: 'Пожалуйста введите дату диапазона'})

  } else if (query.from && query.to){// по диапазона
    const [date, _] = await sequelize.query(`
      SELECT * FROM appeal
      WHERE date_create BETWEEN '${query.from}' AND '${query.to}';
    `)

    sendResponForGetRequest(date, res)
  }
})

app.get('/getForDate', async (req: Request, res: Response) => {//ищет по конкретной дате
  let query: TypeQueryGetForDate = req.query
  
  if (query.date) {
    const [date, _] = await sequelize.query(`
      SELECT * FROM appeal WHERE date_create = '${query.date}'
    `)
    sendResponForGetRequest(date, res)
    
  } else {
    res.send({ date: 'Обращения отсутствуют за указанный период'})
  }
})

app.get('/process/:id', async (req: Request, res: Response) => { // выставляет статус process
  await sequelize.query(`
    UPDATE appeal SET status = 'process', respon = '' WHERE id = ${req.params.id}
  `).then(()=>res.send('ok'))
})

app.get('/completed/:id', async (req: Request, res: Response) => {// выставляет статус completed
  let text = req.query.text as string
  
  await sequelize.query(`
    UPDATE appeal SET status = 'completed', respon = '${text}' WHERE id = ${req.params.id}
  `).then(()=>res.send('ok'))
})

app.get('/reject/:id', async (req: Request, res: Response) => {// выставляет статус reject
  let text = req.query.text as string
  
  await sequelize.query(`
    UPDATE appeal SET status = 'reject', respon = '${text}' WHERE id = ${req.params.id}
  `).then(()=>res.send('ok'))
})

app.get('/cancelProcess', async (req: Request, res: Response) => { // отменить все, что в работе
  await sequelize.query(`
    UPDATE appeal SET status = 'reject', respon = 'нажатие кнопки "отменить все активные"' WHERE status = 'process'
  `).then(()=>res.send('ok'))
})

app.listen(3000) // дальше идут вспомогательные функции

function sendResponForGetRequest(date: any, res:Response){//я не смог придумать название((
// она либо отправляет данные с БД,
// либо отправляет сообщение
  if(date.length == 0){
      res.send({ date: 'Обращения отсутствуют за указанный период'})
    } else {
      res.send({
        date: date
      })
    }
}