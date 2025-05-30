import { Request, Response } from "express"
import { sequelize } from "../../../../config/Sequelize.js";

export default async function SetProcessStatus (req: Request, res: Response) {
    try {
        await sequelize.query(`UPDATE appeal SET status = 'process', respon = '' WHERE id = :id`,
        {
            replacements: {id: req.params.id}
        })

        res.send({data: 'ok'})

    } catch (err) {
        console.error('Ошибка при обновлении статуса process:', err);
        res.status(500).send({ err: 'Ошибка БД'});
    }
}