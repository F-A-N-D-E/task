import AppealSearchModule from "./module/AppealSearchModule.js"
import CreateAppealModule from "./module/CreateAppealModule.js"

const main = document.getElementById('main') as HTMLDivElement
const getCreatePage = document.getElementById('createPage') as HTMLAnchorElement
const getViewPage = document.getElementById('viewPage') as HTMLAnchorElement
const cancelWork = document.getElementById('cancelWork') as HTMLAnchorElement

AppealSearchModule(main)

getCreatePage.addEventListener('click', async (e) => {
    e.preventDefault()
    CreateAppealModule(main)
})

getViewPage.addEventListener('click', async(e)=>{
    e.preventDefault()
    AppealSearchModule(main)
})

cancelWork.addEventListener('click', async (e)=>{
    e.preventDefault()
    await fetch('http://localhost:3000/cancelWork')
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