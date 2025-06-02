import {Router, Request, Response } from "express"
import { sequelize } from "../config/Sequelize.js";
import { TypeElemQueryCreate, TypeQueryGetBetweenDate, TypeQueryGetForDate } from "../../../@types/type.js";
import validSpaces from "../validation/validateOnlySpaces.js";
import validStringLength from "../validation/validStringLength.js";
import validDate from "../validation/validDate.js";

const router = Router()

router.get('/create', async (req: Request, res: Response) => { // создает обращение
  try {
    let query = req.query as TypeElemQueryCreate;
    
    if (!query.title || // Валидация
        !query.message_appeal ||
        !validSpaces(query.title) ||
        !validSpaces(query.message_appeal)
      ) {
      res.send({err: 'Заголовок и текст обращения должны быть заполнены'})
      return
    } else if (!validStringLength(query.title) || !validStringLength(query.message_appeal)) {
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
        date: query.date // дату не проверяю, потому что возможность выставить ее
        // стоит для проверяющего
      }
    })
    
    res.send({data: 'ok'})

  } catch (err) {
    console.error('Ошибка при создании обращения:' + err);
    res.status(500).send({err: 'Ошибка сервера при создании обращения'});
  }
}
)

router.get('/betweenDate', async (req: Request, res: Response) => { // ищет по диапазону
  try {
    let query: TypeQueryGetBetweenDate = req.query;
    
    let data: unknown[]
    
    let validDateFrom = validDate(query.from)
    let validDateTo = validDate(query.to)
    
    if (!validDateFrom && !validDateTo){ // некорректная дата
      res.send({err: 'Пожалуйста, введите дату в формате - "YYYY-MM-DD" или воспользуйтесь встроенным календарем'});
      return
    }
    
    if(!validDateFrom && validDateTo){// есть только куда
      [data] = await sequelize.query(
      'SELECT * FROM appeal WHERE date_create <= :dateTo',
      {
      replacements: {dateTo: query.to}
      })
        
    } else if (validDateFrom && !validDateTo){// есть только от куда
      [data] = await sequelize.query(
      'SELECT * FROM appeal WHERE date_create >= :dateFrom',
      {
      replacements: {dateFrom: query.from}
      })

    } else if (validDateFrom && validDateTo){// по диапазону
      [data] = await sequelize.query(`
      SELECT * FROM appeal
      WHERE date_create BETWEEN :dateFrom AND :dateTo;`,
      {
        replacements: {
          dateFrom: query.from,
          dateTo: query.to
        }
      })
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

router.get('/byDate', async (req: Request, res: Response) => { // ищет по конкретной дате
  try {
    let query: TypeQueryGetForDate = req.query;
    
    if (!validDate(query.date)) {
      res.send({err: 'Пожалуйста, введите дату в формате - "YYYY-MM-DD" или воспользуйтесь встроенным календарем'})
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
    console.error('Ошибка при получении по дате:', err)
    res.status(500).send({ err: 'Ошибка базы данных' })
  }
})

router.get('/work/:id', async (req: Request, res: Response) => { // ставит статус work
  try {
    let id = req.params.id

    if (isNaN(+id)) { // валидация id
      res.send({err: "Введен некорректный id"})
      return
    }

    let [existing] = await sequelize.query(`
      SELECT * FROM appeal WHERE id = :id`,
      {replacements: {id: id}}    
    )

    if (existing.length == 0) {
      res.send({err: 'Такого обращения не существует'})
      return
    }
    
    await sequelize.query(`UPDATE appeal SET status = 'work', respon = '' WHERE id = :id`,
      {
        replacements: {id: id}
      })

    res.send({data: 'ok'})

  } catch (err) {
    console.error('Ошибка при обновлении статуса cancel:', err)
    res.status(500).send({ err: 'Ошибка БД'})
  }
})

router.get('/completed/:id', async (req: Request, res: Response) => { // ставит статус completed
  try {
    let id = req.params.id

    if (isNaN(+id)) { // валидация id
      res.send({err: "Введен некорректный id"})
      return
    }

    let [existing] = await sequelize.query(`
      SELECT * FROM appeal WHERE id = :id`,
      {replacements: {id: id}}    
    )

    if (existing.length == 0) {
      res.send({err: 'Такого обращения не существует'})
      return
    }

    let text = req.query.text as string

    if (!text || !validSpaces(text)){ // Валидация текста
      res.send({err: "Текст ответа должен быть заполнен"})
      return
    } else if (!validStringLength(text)){
      res.send({err: 'Вы превысили максимальную длину текста в 255 символов'})
      return
    }

    await sequelize.query(`
    UPDATE appeal SET status = 'completed', respon = :text WHERE id = :id`,
      {
        replacements: {
          text: text,
          id: id
        }
      }
    )

    res.send({data: 'ok'})

  } catch (err) {
    console.error('Ошибка при обновлении статуса в completed:', err);
    res.status(500).send({err: 'Ошибка БД'});
  }
})

router.get('/cancel/:id', async (req: Request, res: Response) => { // ставит статус cancel
  try {
    let id = req.params.id

    if (isNaN(+id)) { // валидация id
      res.send({err: "Введен некорректный id"})
      return
    }

    let [existing] = await sequelize.query(`
      SELECT * FROM appeal WHERE id = :id`,
      {replacements: {id: id}}    
    )

    if (existing.length == 0) {
      res.send({err: 'Такого обращения не существует'})
      return
    }
    
    let text = req.query.text as string
    
    if (!text || !validSpaces(text)){ // Валидация текста
      res.send({err: "Текст ответа должен быть заполнен"})
      return
    } else if (!validStringLength(text)){
      res.send({err: 'Вы превысили максимальную длину текста в 255 символов'})
      return
    }
    
    await sequelize.query(`
      UPDATE appeal SET status = 'cancel', respon = :text WHERE id = :id`,
      {
        replacements: {
          text: text,
          id: req.params.id
        }
      }
    )

    res.send({data: 'ok'})

  } catch (err) {
    console.error('Ошибка при обновлении статуса в cancel:', err)
    res.status(500).send({err: 'Ошибка БД'})
  }
})

router.get('/cancelWork', async (req: Request, res: Response) => { // ставит всем work статус cancel
  try {
    await sequelize.query(`
      UPDATE appeal SET status = 'cancel', respon = 'нажатие кнопки "отменить все активные"' WHERE status = 'work'
    `)

    res.send({data: 'ok'})

  } catch (err) {
    console.error('Ошибка при отмене всех активных:', err);
    res.status(500).send({err: 'Ошибка БД'});
  }
})

export default router