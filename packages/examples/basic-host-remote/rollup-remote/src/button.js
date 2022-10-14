export default function addButton(root){
    const eleBtn = document.createElement("button");
    const eleText = document.createTextNode("Button from remote");
    eleBtn.appendChild(eleText);
    eleBtn.onclick = function (){
        // Defines what to do after the event is triggered
        alert(this.value);
    };
    eleBtn.className = 'remote-btn'
    eleBtn.value='I am button from remote';

    document.getElementById(root).appendChild(eleBtn);
}