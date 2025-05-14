export default async function setScriptForm() {
    const form = document.getElementById('form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        let queryStr = new URLSearchParams();
        let formData = new FormData(form);
        if (!formData.get('title') || !formData.get('message_appeal')) {
            alert('Заголовок и текст обращения должны быть заполнены');
        }
        else {
            for (let [key, val] of formData.entries()) {
                if (!val) {
                    queryStr.set(key, setDate());
                }
                else {
                    queryStr.set(key, val);
                }
            }
            await (await fetch(`http://localhost:3000/create?${queryStr.toString()}`)).text()
                .then(r => alert(r));
            form.reset();
        }
    });
    function setDate() {
        let now = new Date();
        let month = now.getMonth() + 1;
        let day = now.getDate();
        return `${now.getFullYear()}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
    }
}
