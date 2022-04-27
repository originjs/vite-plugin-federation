import { createStore } from 'vuex';


// This is just to test if the export from remote works, there is no real point
export {name} from "home/Content";

export default createStore({
    state() {
        return {
            cartItems: 5
        }
    }
});