import { ElemResponServer } from "../../../@types/type"

export function SetSearch (main: HTMLElement){
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
    `
    
    const formGetForDate = document.getElementById('formGetForDate') as HTMLFormElement
    const formGetBetweenDate = document.getElementById('formGetBetweenDate') as HTMLFormElement
    const countainer = document.getElementById('countainer') as HTMLDivElement

    formGetForDate.addEventListener('submit', async (e)=>{await serchForDate(e, countainer, 'getForDate')})
    formGetBetweenDate.addEventListener('submit', async (e)=>{await serchForDate(e, countainer, 'getBetweenDate')})
}

async function serchForDate(e: Event, countainer:HTMLElement, path: 'getBetweenDate'|'getForDate') {
    e.preventDefault()
    countainer.innerHTML = ''
    
    let date: ElemResponServer[] | string

    await fetch(`http://localhost:3000/${path}?${setQueryString(e.target as HTMLFormElement)}`)
    .then(r=>r.json()).then(r => date = r.date)

    if (typeof date == 'string'){
        countainer.innerHTML = `<p>${date}</p>`

    } else {
        date.forEach(elem => {
            setAppeals(
                elem.date_create, 
                elem.id,
                elem.message_appeal,
                elem.respon,
                elem.status,
                elem.title,
                countainer
            )
        })
    }
}


async function setAppeals (
    date_create:string,
    id:number,
    message_appeal:string,
    respon:string,
    status:string,
    title:string,

    countainer: HTMLElement
) {
    const elemDiv = document.createElement('div')
    elemDiv.innerHTML = `
        <div class="elem">
            <p>${title}</p>
            <p>${message_appeal}</p>
            <p>${date_create}</p>
            <p id="pStatus${id}"><b>Статус:</b> ${status}</p>
            <p id="pRespon${id}"><b>Ответ:</b> ${respon}</p>
            <div id="blockLink${id}">
                <a href="http://localhost:3000/process/${id}">process</a>
                <a href="http://localhost:3000/completed/${id}">completed</a>
                <a href="http://localhost:3000/reject/${id}">reject</a>
            </div>
            <form id="form${id}"></form>
        </div>
    `
    countainer.appendChild(elemDiv)

    const form = elemDiv.querySelector(`#form${id}`) as HTMLFormElement;
    const pStatus = elemDiv.querySelector(`#pStatus${id}`) as HTMLParagraphElement
    const pRespon = elemDiv.querySelector(`#pRespon${id}`) as HTMLParagraphElement

    const blockLink = elemDiv.querySelector(`#blockLink${id}`)

    blockLink.addEventListener('click', async (e) => {
        let target = e.target as HTMLElement

        if (target.tagName === 'A'){
            e.preventDefault()
            let href = target.getAttribute('href')
            let pathStatus = new URL(href).pathname.split('/')[1];
            await sendStatus(pathStatus)
        }
    })

    // функция для обработчика ссылок
    async function sendStatus(pathStatus: string){
        // Удаляет предыдущий обработчик submit, если он есть
        if ((form as any)._submitHandler) {
            form.removeEventListener('submit', (form as any)._submitHandler);
        }
        
        form.innerHTML = ''

        if (pathStatus == 'process'){
            await fetch(`http://localhost:3000/${pathStatus}/${id}`).then(r => r.text())
            .then(r=>{
                if (r=='ok'){
                    pStatus.innerHTML = "<b>Статус:</b> " + pathStatus
                        pRespon.innerHTML = "<b>Ответ:</b> "
                } else {
                    alert(r)
                }
            })
            .catch(()=>alert('Ошибка в фетче'))
            
        } else { // создание формы для записи ответа
            form.innerHTML =`
                <textArea name="text" placeholder="${pathStatus == 'reject' ? 'Введите причину отмены' : 'Отчет о выполнении обращения'}"></textArea>
                <input type="submit" value="Отправить"/>
            `
            
            const handleSubmit = async (e:Event) => {
                e.preventDefault()
                let text = form.querySelector('textarea').value
                
                await fetch(`http://localhost:3000/${pathStatus}/${id}?${setQueryString(form)}`)
                .then(r=>r.text()).then(r=>{
                    if (r == 'ok'){
                        pStatus.innerHTML = "<b>Статус:</b> " + pathStatus
                        pRespon.innerHTML = "<b>Ответ:</b> " + text

                       form.innerHTML = ''
                    } else {
                        alert(r)
                    }
                })
                .catch(()=>alert('Ошибка в фетче'))
            }   
            
            form._submitHandler = handleSubmit;
            form.addEventListener('submit', handleSubmit);
        }

    }
    
}

function setQueryString(form: HTMLFormElement){
    let formData = new FormData(form)
    let queryStr = new URLSearchParams()
    
    for (let [key, val] of formData.entries()){
            queryStr.set(key, val as string)
    }

    return queryStr.toString()
}