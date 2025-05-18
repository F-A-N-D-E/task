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
    VALUES ('new', :title, :message_appeal, '', :date);`, {
        replacements: {
            title: query.title,
            message_appeal: query.message_appeal,
            date: query.date
        }
    })
        .then(() => res.send('успешно'))
        .catch(() => res.send('Ошибка БД'));
});
app.get('/createPage', async (req, res) => {
    let formPage;
    await readFile('./html/form.html', 'utf-8').then(r => formPage = r)
        .catch(() => formPage = 'Файл html не найден');
    res.send(formPage);
});
app.get('/getBetweenDate', async (req, res) => {
    let query = req.query;
    let date;
    if (!query.from && query.to) { // есть только куда
        await sequelize.query('SELECT * FROM appeal WHERE date_create <= :dateTo', {
            replacements: { dateTo: query.to }
        })
            .then(r => date = r[0])
            .catch(() => date = 'Ошибка БД');
        sendResponForGetRequest(date, res);
    }
    else if (query.from && !query.to) { // есть только от куда
        await sequelize.query('SELECT * FROM appeal WHERE date_create >= :dateFrom', {
            replacements: { dateFrom: query.from }
        })
            .then(r => date = r[0])
            .catch(() => date = 'Ошибка БД');
        sendResponForGetRequest(date, res);
    }
    else if (!query.from && !query.to) { // отсутствие дат
        res.send({ date: 'Пожалуйста, введите дату диапазона' });
    }
    else if (query.from && query.to) { // по диапазона
        await sequelize.query(`
      SELECT * FROM appeal
      WHERE date_create BETWEEN :dateFrom AND :dateTo;`, {
            replacements: {
                dateFrom: query.from,
                dateTo: query.to
            }
        })
            .then(r => date = r[0])
            .catch(() => date = 'Ошибка БД');
        sendResponForGetRequest(date, res);
    }
});
app.get('/getForDate', async (req, res) => {
    let query = req.query;
    let date;
    if (query.date) {
        await sequelize.query(`
      SELECT * FROM appeal WHERE date_create = :date`, {
            replacements: { date: query.date }
        })
            .then(r => date = r[0])
            .catch(() => date = 'Ошибка БД');
        sendResponForGetRequest(date, res);
    }
    else {
        res.send({ date: 'Пожалуйста, введите дату' });
    }
});
app.get('/process/:id', async (req, res) => {
    await sequelize.query(`
    UPDATE appeal SET status = 'process', respon = '' WHERE id = :id`, {
        replacements: { id: req.params.id }
    })
        .then(() => res.send('ok'))
        .catch(() => res.send('Ошибка БД'));
});
app.get('/completed/:id', async (req, res) => {
    let text = req.query.text;
    await sequelize.query(`
    UPDATE appeal SET status = 'completed', respon = :text WHERE id = :id`, {
        replacements: {
            text: text,
            id: req.params.id
        }
    })
        .then(() => res.send('ok'))
        .catch(() => res.send('Ошибка БД'));
});
app.get('/reject/:id', async (req, res) => {
    let text = req.query.text;
    await sequelize.query(`
    UPDATE appeal SET status = 'reject', respon = :text WHERE id = :id`, {
        replacements: {
            text: text,
            id: req.params.id
        }
    })
        .then(() => res.send('ok'))
        .catch(() => res.send('Ошибка БД'));
});
app.get('/cancelProcess', async (req, res) => {
    await sequelize.query(`
    UPDATE appeal SET status = 'reject', respon = 'нажатие кнопки "отменить все активные"' WHERE status = 'process'
  `)
        .then(() => res.send('ok'))
        .catch(() => res.send('Ошибка БД'));
});
app.listen(3000); // дальше идут вспомогательные функции
function sendResponForGetRequest(date, res) {
    // она либо отправляет данные с БД,
    // либо отправляет сообщение
    if (date.length == 0) {
        res.send({
            date: 'Обращения отсутствуют за указанный период'
        });
    }
    else { // здесь может отдавать сообщение об ошибке, либо данные
        res.send({
            date: date
        });
    }
}
