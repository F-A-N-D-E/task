import validateStringLength from "../../validation/validateStringLength.js"
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
        let title = formData.get('title') as string,
            message_appeal = formData.get('message_appeal') as string

        if (!title || !message_appeal){
            alert('Заголовок и текст обращения должны быть заполнены')

        } else if (title && message_appeal){
            if (!validateStringLength(title)){
                alert('Вы превысили длину заголовка')
            } else if (!validateStringLength(message_appeal)){
                alert('Вы превысили длину обращения')

            } else {
                for (let [key, val] of formData.entries()){
                    if (!val){
                        queryStr.set(key, setDate())
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

    function setDate (){
        let now = new Date()
        let month = now.getMonth() + 1
        let day = now.getDate()

        return `${now.getFullYear()}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`
    } 
}

