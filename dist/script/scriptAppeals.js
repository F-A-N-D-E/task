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
            countainer.appendChild(setAppeals(elem.date_create, elem.id, elem.message_appeal, elem.respon, elem.status, elem.title));
        });
    }
}
function setAppeals(date_create, id, message_appeal, respon, status, title) {
    // контейнер для элемента
    const elemDiv = document.createElement('div');
    elemDiv.className = 'elem';
    // параграфы
    const pTitle = document.createElement('p');
    pTitle.textContent = title;
    elemDiv.appendChild(pTitle);
    const pMessage = document.createElement('p');
    pMessage.textContent = message_appeal;
    elemDiv.appendChild(pMessage);
    const pDate = document.createElement('p');
    pDate.textContent = date_create;
    elemDiv.appendChild(pDate);
    const pStatus = document.createElement('p');
    pStatus.textContent = 'status: ' + status;
    elemDiv.appendChild(pStatus);
    // блок для ответа
    const pAnswerLabel = document.createElement('p');
    pAnswerLabel.textContent = 'Ответ:';
    elemDiv.appendChild(pAnswerLabel);
    const pRespon = document.createElement('p');
    pRespon.textContent = respon;
    elemDiv.appendChild(pRespon);
    // Блок для формы ответа
    // Объявляется здесь, чтобы функция sendStatus видела блок формы
    const form = document.createElement('form');
    // Блок с ссылками
    const linksDiv = document.createElement('div');
    const linkProcess = document.createElement('a');
    linkProcess.href = `http://localhost:3000/process/${id}`;
    linkProcess.textContent = 'process';
    linkProcess.addEventListener('click', async (e) => await sendStatus(e, 'process'));
    const linkCompleted = document.createElement('a');
    linkCompleted.href = `http://localhost:3000/completed/${id}`;
    linkCompleted.textContent = 'completed';
    linkCompleted.addEventListener('click', async (e) => await sendStatus(e, 'completed'));
    const linkReject = document.createElement('a');
    linkReject.href = `http://localhost:3000/reject/${id}`;
    linkReject.textContent = 'reject';
    linkReject.addEventListener('click', async (e) => await sendStatus(e, 'reject'));
    linksDiv.appendChild(linkProcess);
    linksDiv.appendChild(linkCompleted);
    linksDiv.appendChild(linkReject);
    elemDiv.appendChild(linksDiv);
    elemDiv.appendChild(form);
    return elemDiv; // далее идут вспомогательные функции
    // функция для обработчика ссылок
    async function sendStatus(e, status) {
        e.preventDefault();
        form.innerHTML = '';
        if (status == 'process') {
            await fetch(`http://localhost:3000/${status}/${id}`).then(r => r.text())
                .then(r => {
                if (r == 'ok') {
                    pRespon.textContent = '';
                    pStatus.textContent = 'status: ' + status;
                }
            })
                .catch(() => alert('Ошибка БД'));
        }
        else { // создание формы для ответа
            let textArea = document.createElement('textarea');
            textArea.placeholder = status == 'reject' ? 'Введите причину отмены' : 'Отчет о выполнении обращения';
            textArea.name = 'text';
            form.appendChild(textArea);
            let submit = document.createElement('input');
            submit.type = 'submit';
            form.appendChild(submit);
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await fetch(`http://localhost:3000/${status}/${id}?${setQueryString(form)}`)
                    .then(r => r.text()).then(r => {
                    if (r == 'ok') {
                        pRespon.textContent = textArea.value;
                        pStatus.textContent = 'status: ' + status;
                        form.innerHTML = '';
                    }
                });
            });
            return form;
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
