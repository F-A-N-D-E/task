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

        for (let [key, val] of formData.entries()){
            if (key == 'date'){
                queryStr.set(key, getNowDate())
            } else {
                queryStr.set(key, val as string)
            }
        }

        await fetch(`http://localhost:3000/create?${queryStr.toString()}`)
        .then(r => r.json())
        .then(r => {
            if (!r.err){
                alert('Успешно')
            } else {
                alert(r.err)
            }
        })
        .catch((e)=>alert(`ошибка в фетче ${e}`))
    })
}

