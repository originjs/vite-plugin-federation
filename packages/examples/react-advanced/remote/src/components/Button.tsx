import {useBearStore} from "../state/useBearStore";


export const Button = () => {
  const increasePopulation = useBearStore((state) => state.increasePopulation)
  return <button onClick={increasePopulation}>one up</button>
}

export default Button