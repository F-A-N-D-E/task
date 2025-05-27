import validateOnlySpaces from "../../validation/validateOnlySpaces.js"
import validateStringLength from "../../validation/validateStringLength.js"
import getNowDate from "./utils/getNowDate.js"
import viewLengthInput from "./utils/viewLengthInput.js"

export default async function ScriptForm() {
    const form = document.getElementById('form') as HTMLFormElement

    const title = form.querySelector('#title') as HTMLInputElement
    const titleCharCount = form.querySelector('#titleCharCount') as HTMLSpanElement 
    title.addEventListener('input', (e)=>viewLengthInput(e, titleCharCount))

    const message_appeal = form.querySelector('#message_appeal') as HTMLTextAreaElement
    const messageCharCount = form.querySelector('#messageCharCount') as HTMLSpanElement 
    message_appeal.addEventListener('input', (e)=>viewLengthInput(e, messageCharCount))
   
    form.addEventListener('submit', async(e)=>{
        e.preventDefault()
        let queryStr = new URLSearchParams()
        let formData = new FormData(form)

        if (!title.value || !message_appeal.value || !validateOnlySpaces(title.value) || !validateOnlySpaces(message_appeal.value)){
            alert('Заголовок и текст обращения должны быть заполнены')

        } else if (title.value && message_appeal.value){
            if (!validateStringLength(title.value)){
                alert('Вы превысили длину заголовка')
                
            } else if (!validateStringLength(message_appeal.value)){
                alert('Вы превысили длину обращения')

            } else {
                for (let [key, val] of formData.entries()){
                    if (!val){ // сюда может дойти только пустое поле даты
                        queryStr.set(key, getNowDate())
                    } else {
                        queryStr.set(key, val as string)
                    }
                }

                await (await fetch(`http://localhost:3000/create?${queryStr.toString()}`)).text()
                .then(r=>alert(r))
                .catch((e)=>console.log(`ошибка в фетче ${e}`))
            }
        }
    })
}

