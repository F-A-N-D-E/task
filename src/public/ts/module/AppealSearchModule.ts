import { TypeElemAppeal } from "../../../../@types/type"
import setQueryStringFromForm from "../utils/setQueryStringFromForm.js"
import viewLengthInput from "../utils/viewLengthInput.js"

export default function AppealSearchModule (main: HTMLDivElement){
    main.innerHTML = `
    <div class="menu">
        <p>Получить список:</p>

        <form id="formGetForDate" action="#">
            <label for="">
                за <input type="date" name="date">
            </label>
            <input type="submit" value="Поиск">
        </form>

        <form id="formGetBetweenDate" action="#">
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

    formGetForDate.addEventListener('submit', async (e)=>{await serchForDate(e, countainer, 'byDate')})
    formGetBetweenDate.addEventListener('submit', async (e)=>{await serchForDate(e, countainer, 'betweenDate')})
}


async function serchForDate(e: Event, countainer:HTMLDivElement, path: 'betweenDate'|'byDate') {
    e.preventDefault()
    countainer.innerHTML = ''
    
    let data: TypeElemAppeal[]

    await fetch(`http://localhost:3000/${path}?${setQueryStringFromForm(e.target as HTMLFormElement)}`)
    .then(r=>r.json())
    .then(r => {
        if (!r.err){
            data = r.data
        } else {
            countainer.innerHTML = `<p>${r.err}</p>`
        }
    })

    if (data) data.forEach(elem => {
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
                <a href="http://localhost:3000/work/${id}">work</a>
                <a href="http://localhost:3000/completed/${id}">completed</a>
                <a href="http://localhost:3000/cancel/${id}">cancel</a>
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

        if (pathStatus == 'work'){
            await fetch(`http://localhost:3000/${pathStatus}/${id}`)
            .then(r => r.json())
            .then(r => {
                if (!r.err){
                    pStatus.innerHTML = "<b>Статус:</b> " + pathStatus
                    pRespon.innerHTML = "<b>Ответ:</b> "
                } else {
                    alert(r.err)
                }
            })
            .catch(()=>alert('Ошибка в фетче'))
            
        } else { // создание формы для записи ответа
            form.innerHTML =`
                <textArea name="text" placeholder="${pathStatus == 'cancel' ? 'Введите причину отмены' : 'Отчет о выполнении обращения'}"></textArea>
                <span id="CharCount">0/255</span>
                <input type="submit" value="Отправить"/>
            `
            const textArea = form.querySelector('textarea') as HTMLTextAreaElement
            const charCount = form.querySelector('#CharCount') as HTMLSpanElement
            
            textArea.addEventListener('input', (e)=>viewLengthInput(e, charCount))
            
            const handleSubmit = async (e:Event) => {
                e.preventDefault()
                
                await fetch(`http://localhost:3000/${pathStatus}/${id}?${setQueryStringFromForm(form)}`)
                .then(r=>r.json())
                .then(r=>{
                    if (!r.err){
                        pStatus.innerHTML = "<b>Статус:</b> " + pathStatus
                        pRespon.innerHTML = "<b>Ответ:</b> " + textArea.value

                        form.innerHTML = ''
                    } else {
                        alert(r.err)
                    }
                })
                .catch(()=>alert('Ошибка в фетче'))
            }   
            
            form._submitHandler = handleSubmit;
            form.addEventListener('submit', handleSubmit);
        }

    }
    
}