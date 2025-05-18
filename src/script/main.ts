import { setSearch } from "./scriptAppeals.js"
import setScriptForm from "./setScriptForm.js"

const main = document.getElementById('main')
const getCreatePage = document.getElementById('createPage')
const getViewPage = document.getElementById('viewPage')

const cancelProcess = document.getElementById('cancelProcess')

setSearch(main)

getCreatePage.addEventListener('click', async (e) => {
    e.preventDefault()

    await fetch('http://localhost:3000/createPage')
    .then((r) => r.text()).then(r => main.innerHTML = r)
    .catch(()=>alert('Ошибка в фетче'))

    setScriptForm()
})

getViewPage.addEventListener('click', async(e)=>{
    e.preventDefault()
    setSearch(main)
})

cancelProcess.addEventListener('click', async (e)=>{
    e.preventDefault()
    await fetch('http://localhost:3000/cancelProcess')
    .then(r=>r.text()).then(r=>{
        if (r == 'ok'){
            window.location.reload()
        } else {
            alert(r)
        }
    })
    .catch(()=>alert('Ошибка в фетче'))
})