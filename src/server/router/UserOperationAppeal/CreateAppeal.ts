import { Request, Response } from "express"
import { sequelize } from "../../../config/Sequelize.js";
import { TypeElemQueryCreate } from "../../../../@types/type.js";
import validateSpaces from "../../../validation/validateOnlySpaces.js";
import validateStringLength from "../../../validation/validateStringLength.js";

export default async function CreateAppeal (req: Request, res: Response) {
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
}