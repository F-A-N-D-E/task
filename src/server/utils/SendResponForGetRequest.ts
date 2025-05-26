import { Response } from "express"

export default function SendResponForGetRequest(date: unknown[]|string, res:Response){
// либо отправляет данные с БД,
// либо отправляет сообщение
  if(date.length == 0){
      res.send({
        date: 'Обращения отсутствуют за указанный период'
      })
    } else { // здесь может отдавать сообщение об ошибке, либо данные
      res.send({
        date: date
      })
    }
}