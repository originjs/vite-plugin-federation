import { render, h } from "vue";
const button = {
  name: "btn-component",
  render() {
    return h(
      "button",
      {
        id: "btn-remote",
      },
      "Hello Remote Button"
    );
  },
};

export default button;
