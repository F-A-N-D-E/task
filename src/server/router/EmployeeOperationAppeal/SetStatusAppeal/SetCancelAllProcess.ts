import { Request, Response } from "express"
import { sequelize } from "../../../../config/Sequelize.js";

export default async function SetCancelAllProcess (req: Request, res: Response) {
    try {
        await sequelize.query(`
            UPDATE appeal SET status = 'reject', respon = 'нажатие кнопки "отменить все активные"' WHERE status = 'process'
        `)

        res.send({data: 'ok'})

    } catch (err) {
        console.error('Ошибка при отмене всех активных:', err);
        res.status(500).send({err: 'Ошибка БД'});
    }
}