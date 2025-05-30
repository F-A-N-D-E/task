import { Request, Response } from "express"
import { sequelize } from "../../../../config/Sequelize.js";
import validateStringLength from "../../../../validation/validateStringLength.js";
import validateSpaces from "../../../../validation/validateOnlySpaces.js";

export default async function SetCompletedStatus (req: Request, res: Response) {
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
}