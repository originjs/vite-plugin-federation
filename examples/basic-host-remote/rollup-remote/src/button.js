export default function addButton(){
    const newDiv = document.createElement("button");
    const newContent = document.createTextNode("Button from remote");
    newDiv.appendChild(newContent);

    document.getElementById("root").appendChild(newDiv);
}