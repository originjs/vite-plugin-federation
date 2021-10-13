import {h} from "vue";

const button = {
    name: "btn-component",
    render() {
        return h(
            "button",
            {
                id: "btn-remote",
                style: {
                    'background-color': '#4CAF50',
                    'border': 'none',
                    'color': 'white',
                    'padding': '15px 32px',
                    'text-align': 'center',
                    'text-decoration': 'none',
                    'display': 'inline-block',
                    'font-size': '16px'
                },
                onClick: () => {
                    this.$store.state.cartItems++
                }
            },
            "Hello Layout Button"
        );
    },
};

export default button;
