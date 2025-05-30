import { Request, Response } from "express"
import { sequelize } from "../../../../config/Sequelize.js";
import validDate from "../../../../validation/validDate.js";
import { TypeQueryGetBetweenDate } from "../../../../../@types/type.js";

export default async function GetBetweenDate (req: Request, res: Response) {
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
            }
          )
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
}