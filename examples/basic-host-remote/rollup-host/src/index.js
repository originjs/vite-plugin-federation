const lazyLoad = ()=> import("remote_app/Button");

function addElement(root) {
    const newDiv = document.createElement("div");
    const newContent = document.createTextNode("Hi from host");
    newDiv.appendChild(newContent);

    document.getElementById(root).appendChild(newDiv);
}

lazyLoad();
addElement("root");