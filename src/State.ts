import { EPSILON } from "./constant";

export default class State {
    accepting: boolean;
    transitionsMap: Map<string, Array<State>>;
    
    constructor(accepting = false) {
        this.accepting = accepting;
        this.transitionsMap = new Map<string, Array<State>>();
    }

    addTransitionForSymbol(symbol: string, state: State): void {
        if (!this.transitionsMap.has(symbol)) {
            this.transitionsMap.set(symbol, new Array<State>());
        }
        this.transitionsMap?.get(symbol)?.push(state);
    }

    getTransitionForSymbol(symbol: string): Array<State> {
        if (this.transitionsMap.has(symbol)) {
            return this.transitionsMap?.get(symbol)!;
        }
        return new Array<State>();
    }

    test(string: string, visited = new Set()): boolean {
        if (visited.has(this)) {
            return false;
        }

        visited.add(this);

        if (string.length === 0) {
            if (this.accepting) {
                return true;
            }

            for (const nextState of this.getTransitionForSymbol(EPSILON)) {
                if (nextState.test('', visited)) {
                    return true;
                }
            }

            return false;
        }

        const rest = string.slice(1);
        for (const nextState of this.getTransitionForSymbol(string[0])) {
            if (nextState.test(rest)) {
                return true;
            }
        }

        for (const nextState of this.getTransitionForSymbol(EPSILON)) {
            if (nextState.test(string, visited)) {
                return true;
            }
        }

        return false;
    }
};