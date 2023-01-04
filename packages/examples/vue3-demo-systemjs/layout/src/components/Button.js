import { h } from "vue";
import { useStore } from '../store'

const button = {
    name: "btn-component",
    render() {
        return h(
            "button",
            {
                id: "btn-layout",
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
                    const store = useStore();
                    store.increase();
                }
            },
            "Hello Layout Button"
        );
    },
};

export default button;
