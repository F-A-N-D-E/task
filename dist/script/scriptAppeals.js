export function setSearch(main) {
    main.innerHTML = `
    <div class="menu">
        <p>Получить список:</p>

        <form id="formGetForDate" action="http://localhost:3000/getForDate">
            <label for="">
                за <input type="date" name="date">
            </label>
            <input type="submit" value="Поиск">
        </form>

        <form id="formGetBetweenDate" action="http://localhost:3000/getBetweenDate">
            <label for="">
                от <input type="date" name="from">
            </label>
            <label for="">
                до <input type="date" name="to">
            </label>
            <input type="submit" value="Поиск">
        </form>
    </div>

    <div id="countainer">

    </div>
    `;
    const formGetForDate = document.getElementById('formGetForDate');
    const formGetBetweenDate = document.getElementById('formGetBetweenDate');
    const countainer = document.getElementById('countainer');
    formGetForDate.addEventListener('submit', async (e) => { await serchForDate(e, countainer, 'getForDate'); });
    formGetBetweenDate.addEventListener('submit', async (e) => { await serchForDate(e, countainer, 'getBetweenDate'); });
}
async function serchForDate(e, countainer, path) {
    e.preventDefault();
    countainer.innerHTML = '';
    let date;
    await fetch(`http://localhost:3000/${path}?${setQueryString(e.target)}`)
        .then(r => r.json()).then(r => date = r.date);
    if (typeof date == 'string') {
        countainer.innerHTML = `<p>${date}</p>`;
    }
    else {
        date.map(elem => {
            setAppeals(elem.date_create, elem.id, elem.message_appeal, elem.respon, elem.status, elem.title, countainer);
        });
    }
}
async function setAppeals(date_create, id, message_appeal, respon, status, title, countainer) {
    const elemDiv = document.createElement('div');
    elemDiv.innerHTML = `
        <div class="elem">
            <p>${title}</p>
            <p>${message_appeal}</p>
            <p>${date_create}</p>
            <p id="pStatus${id}">Статус: ${status}</p>
            <p>Ответ:</p>
            <p id="pRespon${id}">${respon}</p>
            <div id="blockLink${id}">
                <a href="http://localhost:3000/process/${id}">process</a>
                <a href="http://localhost:3000/completed/${id}">completed</a>
                <a href="http://localhost:3000/reject/${id}">reject</a>
            </div>
            <form id="form${id}"></form>
        </div>
    `;
    countainer.appendChild(elemDiv);
    //форма
    const form = document.getElementById(`form${id}`);
    // параграфы
    const pStatus = document.getElementById(`pStatus${id}`);
    const pRespon = document.getElementById(`pRespon${id}`);
    const arrayLink = [...document.getElementById(`blockLink${id}`).children];
    arrayLink.map(async (elem) => {
        elem.addEventListener('click', async (e) => {
            await sendStatus(e);
        });
    });
    // функция для обработчика ссылок
    async function sendStatus(e) {
        e.preventDefault();
        let status = e.target.textContent;
        form.innerHTML = '';
        if (status == 'process') {
            await fetch(`http://localhost:3000/${status}/${id}`).then(r => r.text())
                .then(r => {
                if (r == 'ok') {
                    pStatus.textContent = `Статус: ${status}`;
                }
                else {
                    alert(r);
                }
            })
                .catch(() => alert('Ошибка в фетче'));
        }
        else { // создание формы для ответа
            form.innerHTML = `
                <textArea name="text" placeholder="${status == 'reject' ? 'Введите причину отмены' : 'Отчет о выполнении обращения'}"></textArea>
                <input type="submit" value="Отправить"/>
            `;
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await fetch(`http://localhost:3000/${status}/${id}?${setQueryString(form)}`)
                    .then(r => r.text()).then(r => {
                    if (r == 'ok') {
                        pStatus.textContent = `Статус: ${status}`;
                        pRespon.textContent = form.querySelector('textarea').value;
                        form.innerHTML = '';
                    }
                    else {
                        alert(r);
                    }
                })
                    .catch(() => alert('Ошибка в фетче'));
            });
        }
    }
}
function setQueryString(form) {
    let formData = new FormData(form);
    let queryStr = new URLSearchParams();
    for (let [key, val] of formData.entries()) {
        queryStr.set(key, val);
    }
    return queryStr.toString();
}
