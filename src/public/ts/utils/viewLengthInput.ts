export default function viewLengthInput (e:Event, elemView: HTMLSpanElement){
    elemView.textContent = (e.target as HTMLInputElement).value.length + '/255'
}