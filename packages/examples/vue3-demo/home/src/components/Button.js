import { render, h } from "vue";
const button = {
  name: "btn-component",
  render() {
    return h(
      "button",
      {
        id: "btn-remote",
        onClick: () => { this.$store.state.cartItems++ }
      },
      "Hello Remote Button"
    );
  },
};

export default button;
