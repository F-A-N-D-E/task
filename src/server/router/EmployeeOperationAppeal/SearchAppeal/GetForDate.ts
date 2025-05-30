import { Request, Response } from "express"
import { sequelize } from "../../../../config/Sequelize.js";
import validDate from "../../../../validation/validDate.js";
import { TypeQueryGetForDate } from "../../../../../@types/type.js";

export default async function GetForDate (req: Request, res: Response) {
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
}