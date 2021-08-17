export default function addButton(root){
    const eleBtn = document.createElement("button");
    const eleText = document.createTextNode("Button from host");
    eleBtn.appendChild(eleText);
    eleBtn.onclick = function (){
        // Defines what to do after the event is triggered
        console.log(import.meta)
        alert(this.value);
    };
    eleBtn.value='I am button from host';

    document.getElementById(root).appendChild(eleBtn);
}