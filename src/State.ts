import { EPSILON } from "./constant";

export default class State {
    accepting: boolean;
    transitionsMap: Map<string, Set<State>>;
    epsilonClosure: Set<State>
    id: number;
    
    constructor(accepting = false) {
        this.accepting = accepting;
        this.transitionsMap = new Map<string, Set<State>>();
        this.epsilonClosure = null as any;
        this.id = -1;
    }

    getTransitions(): Map<string, Set<State>> {
        return this.transitionsMap;
    }

    addTransitionForSymbol(symbol: string, state: State): void {
        if (!this.transitionsMap.has(symbol)) {
            this.transitionsMap.set(symbol, new Set<State>());
        }
        this.transitionsMap.get(symbol)?.add(state);
    }

    getTransitionsForSymbol(symbol: string): Set<State> {
        if (this.transitionsMap.has(symbol)) {
            return this.transitionsMap.get(symbol)!;
        }
        return new Set<State>();
    }

    getEpsilonClosure(): Set<State> {
        if (this.epsilonClosure == null) {
            this.epsilonClosure = new Set();
            this.epsilonClosure.add(this);
            const epsilonTransitions = this.getTransitionsForSymbol(EPSILON);
            for (const nextState of epsilonTransitions) {
                if (!this.epsilonClosure.has(nextState)) {
                    this.epsilonClosure.add(nextState);
                    const nextStateEpsilonClosure = nextState.getEpsilonClosure();
                    nextStateEpsilonClosure.forEach(
                        stateElement => this.epsilonClosure.add(stateElement)
                    )
                }
            }
        }
        return this.epsilonClosure;
    }

    test(string: string, visited = new Set()): boolean {
        if (visited.has(this)) {
            return false;
        }

        visited.add(this);

        if (string.length == 0) {
            if (this.accepting) {
                return true;
            }

            for (const nextState of this.getTransitionsForSymbol(EPSILON)) {
                if (nextState.test('', visited)) {
                    return true;
                }
            }

            return false;
        }

        const rest = string.slice(1);
        for (const nextState of this.getTransitionsForSymbol(string[0])) {
            if (nextState.test(rest)) {
                return true;
            }
        }

        for (const nextState of this.getTransitionsForSymbol(EPSILON)) {
            if (nextState.test(string, visited)) {
                return true;
            }
        }

        return false;
    }
};