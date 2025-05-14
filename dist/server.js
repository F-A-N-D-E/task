import { readFile } from 'fs/promises';
import { Appeal, setRecords, sequelize } from "./sequelize/Sequelize.js";
import express from 'express';
const app = express();
await Appeal.sync({ force: true });
await setRecords();
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});
app.get('/create', async (req, res) => {
    let query = req.query;
    await sequelize.query(`
    INSERT INTO appeal (status, title, message_appeal, respon, date_create)
    VALUES ('new', '${query.title}', '${query.message_appeal}', '', '${query.date}');
  `).then(() => res.send('успешно'));
});
app.get('/createPage', async (req, res) => {
    let formPage = await readFile('./html/form.html', 'utf-8');
    res.send(formPage);
});
app.get('/getBetweenDate', async (req, res) => {
    let query = req.query;
    console.log();
    if (!query.from && query.to) { // есть только куда
        const [date, _] = await sequelize.query(`
      SELECT * FROM appeal WHERE date_create <= '${query.to}'
    `);
        sendResponForGetRequest(date, res);
    }
    else if (query.from && !query.to) { // есть только от куда
        const [date, _] = await sequelize.query(`
      SELECT * FROM appeal WHERE date_create >= '${query.from}'
    `);
        sendResponForGetRequest(date, res);
    }
    else if (!query.from && !query.to) { // отсутствие дат
        res.send({ date: 'Пожалуйста введите дату диапазона' });
    }
    else if (query.from && query.to) { // по диапазона
        const [date, _] = await sequelize.query(`
      SELECT * FROM appeal
      WHERE date_create BETWEEN '${query.from}' AND '${query.to}';
    `);
        sendResponForGetRequest(date, res);
    }
});
app.get('/getForDate', async (req, res) => {
    let query = req.query;
    if (query.date) {
        const [date, _] = await sequelize.query(`
      SELECT * FROM appeal WHERE date_create = '${query.date}'
    `);
        sendResponForGetRequest(date, res);
    }
    else {
        res.send({ date: 'Обращения отсутствуют за указанный период' });
    }
});
app.get('/process/:id', async (req, res) => {
    await sequelize.query(`
    UPDATE appeal SET status = 'process', respon = '' WHERE id = ${req.params.id}
  `).then(() => res.send('ok'));
});
app.get('/completed/:id', async (req, res) => {
    let text = req.query.text;
    await sequelize.query(`
    UPDATE appeal SET status = 'completed', respon = '${text}' WHERE id = ${req.params.id}
  `).then(() => res.send('ok'));
});
app.get('/reject/:id', async (req, res) => {
    let text = req.query.text;
    await sequelize.query(`
    UPDATE appeal SET status = 'reject', respon = '${text}' WHERE id = ${req.params.id}
  `).then(() => res.send('ok'));
});
app.get('/cancelProcess', async (req, res) => {
    await sequelize.query(`
    UPDATE appeal SET status = 'reject', respon = 'нажатие кнопки "отменить все активные"' WHERE status = 'process'
  `).then(() => res.send('ok'));
});
app.listen(3000); // дальше идут вспомогательные функции
function sendResponForGetRequest(date, res) {
    // она либо отправляет данные с БД,
    // либо отправляет сообщение
    if (date.length == 0) {
        res.send({ date: 'Обращения отсутствуют за указанный период' });
    }
    else {
        res.send({
            date: date
        });
    }
}
