import { SetSearch } from "./ScriptAppeals.js"
import ScriptForm from "./ScriptForm.js"

const main = document.getElementById('main') as HTMLDivElement
const getCreatePage = document.getElementById('createPage') as HTMLAnchorElement
const getViewPage = document.getElementById('viewPage') as HTMLAnchorElement
const cancelProcess = document.getElementById('cancelProcess') as HTMLAnchorElement

SetSearch(main)

getCreatePage.addEventListener('click', async (e) => {
    e.preventDefault()

    await fetch('http://localhost:3000/createPage')
    .then((r) => r.text()).then(r => main.innerHTML = r)
    .catch(()=>alert('Ошибка в фетче'))

    ScriptForm()
})

getViewPage.addEventListener('click', async(e)=>{
    e.preventDefault()
    SetSearch(main)
})

cancelProcess.addEventListener('click', async (e)=>{
    e.preventDefault()
    await fetch('http://localhost:3000/cancelProcess')
    .then(r=>r.json())
    .then( r => {
        if (!r.err){
            window.location.reload()
        } else {
            alert(r.err)
        }
    })
    .catch(()=>alert('Ошибка в фетче'))
})