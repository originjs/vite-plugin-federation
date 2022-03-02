const lazyLoad = ()=> import("remote_app/Button");
import addButton from "./button";

function addDiv(root) {
    const newDiv = document.createElement("div");
    const newContent = document.createTextNode("Hi from host");
    newDiv.appendChild(newContent);

    document.getElementById(root).appendChild(newDiv);
}

// Add a root node.
addDiv("root");
// Call the addButton method of local.
addButton("root")
// Call the addButton method of rollup-remote.
lazyLoad().then(item=>item.default("root"));
