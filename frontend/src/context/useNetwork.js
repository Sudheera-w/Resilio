import { useContext } from "react";
import { NetworkContext } from "./NetworkContextObject";

export function useNetwork() {
    return useContext(NetworkContext);
}