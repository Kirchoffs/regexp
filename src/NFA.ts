import State from './State';
import { EPSILON } from './constant';

// NFA fragment
// one input, one output
export class NFA {
    inState: State;
    outState: State;

    constructor(inState: State, outState: State) {
        this.inState = inState;
        this.outState = outState;
        this.outState.accepting = true;
    }

    test(string: string): boolean {
        return this.inState.test(string);
    }
}

function deepCopy(state: State, mapping: Map<State, State>): State {
    if (mapping.has(state)) {
        return mapping.get(state)!;
    }

    const newState = new State();
    for (let [key, nxtStates] of state.transitionsMap) {
        for (let nxtState of nxtStates) {
            newState.addTransitionForSymbol(key, deepCopy(nxtState, mapping));
        }
    }

    mapping.set(state, newState);
    return newState;
}

function copy(fragment: NFA): NFA {
    const mapping = new Map<State, State>();
    deepCopy(fragment.inState, mapping)
    return new NFA(mapping.get(fragment.inState)!, mapping.get(fragment.outState)!);
}

export function char(symbol: string): NFA {
    const inState = new State();
    const outState = new State();

    inState.addTransitionForSymbol(
        symbol,
        outState
    );

    return new NFA(inState, outState);
}

export function epsilon(): NFA {
    return char(EPSILON);
}

export function concatPair(first: NFA, second: NFA): NFA {
    first.outState.accepting = false;
    second.outState.accepting = true;

    first.outState.addTransitionForSymbol(EPSILON, second.inState);
    return new NFA(first.inState, second.outState);
}

export function concat(first: NFA, ...rest: Array<NFA>): NFA {
    for (let fragment of rest) {
        first = concatPair(first, fragment);
    }
    return first;
}

export function orPair(first: NFA, second: NFA): NFA {
    const inState = new State();
    const outState = new State();

    first.outState.accepting = false;
    second.outState.accepting = false;

    inState.addTransitionForSymbol(EPSILON, first.inState);
    inState.addTransitionForSymbol(EPSILON, second.inState);
    first.outState.addTransitionForSymbol(EPSILON, outState);
    second.outState.addTransitionForSymbol(EPSILON, outState);

    return new NFA(inState, outState);
}

export function or(first: NFA, ...rest: Array<NFA>): NFA {
    for (let fragment of rest) {
        first = orPair(first, fragment);
    }
    return first;
}

export function rep(fragment: NFA): NFA {
    const inState = new State();
    const outState = new State(true);

    fragment.outState.accepting = false;

    inState.addTransitionForSymbol(EPSILON, fragment.inState);
    inState.addTransitionForSymbol(EPSILON, outState);
    fragment.outState.addTransitionForSymbol(EPSILON, outState);
    outState.addTransitionForSymbol(EPSILON, fragment.inState);

    return new NFA(inState, outState);
}

export function repOneOrMore(fragment: NFA): NFA {
    const copied = copy(fragment);
    return concat(copied, rep(fragment));
}

export function repOneOrZero(fragment: NFA): NFA {
    return or(fragment, epsilon());
}