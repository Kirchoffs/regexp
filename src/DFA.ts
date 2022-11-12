import { EPSILON_CLOSURE } from './constant';
import { NFA } from './NFA';

export class DFA {
    nfa: NFA

    alphabet: Set<string>

    startStateId: number
    acceptingStateIds: Set<number>
    transitionTable: Map<number, Map<string, number>>

    minStartStateId: number
    minAcceptingStateIds: Set<number>
    minTransitionTable: Map<number, Map<string, number>>

    constructor(nfa: NFA) {
        this.nfa = nfa;
        this.alphabet = nfa.getAlphabet();
        this.startStateId = -1;
        this.acceptingStateIds = null as any;
        this.transitionTable = null as any;
        this.minStartStateId = -1;
        this.minAcceptingStateIds = null as any;
        this.minTransitionTable = null as any;
    }

    getAlphabet(): Set<string> {
        return this.alphabet;
    }

    getStartStateId(): number {
        if (this.startStateId == -1) {
            this.getTransitionTable();
        }
        return this.startStateId;
    }

    getAcceptingStateIds(): Set<number> {
        if (this.acceptingStateIds == null) {
            this.getTransitionTable();
        }
        return this.acceptingStateIds;
    }

    getTransitionTable(): Map<number, Map<string, number>> {
        if (this.transitionTable == null) {
            const dfaTable = new Map();

            const nfaTable = this.nfa.getTransitionTable();
            const nfaStartState = this.nfa.inState;
            const nfaAcceptingStateIds = this.nfa.getAcceptingStateIds();

            const acceptingStateIdsByStr = new Set<string>();
            const startStateIds = nfaTable.get(nfaStartState.id)!.get(EPSILON_CLOSURE)!;
            const workList = [startStateIds];
            const alphabet = this.getAlphabet();

            const updateAcceptingStates = (states: Array<number>) => {
                for (const nfaAcceptingStateId of nfaAcceptingStateIds) {
                    if (states.indexOf(nfaAcceptingStateId) != -1) {
                        acceptingStateIdsByStr.add(states.join(','));
                        break;
                    }
                }
            };

            while (workList.length > 0) {
                const curStateIds = workList.shift()!;
                const dfaCurStateId = curStateIds.join(',');
                if (dfaTable.has(dfaCurStateId)) {
                    continue;
                }
                dfaTable.set(dfaCurStateId, new Map());

                updateAcceptingStates(curStateIds);

                for (const symbol of alphabet) {
                    let onSymbol = [];
                    for (const curStateId of curStateIds) {
                        const nxtStateIds = nfaTable.get(curStateId)!.get(symbol);
                        if (nxtStateIds == undefined) {
                            continue;
                        }
                        for (const nxtStateId of nxtStateIds) {
                            onSymbol.push(...nfaTable.get(nxtStateId)!.get(EPSILON_CLOSURE)!);
                        }
                    }

                    const dfaNxtStateIdSetOnSymbol = new Set(onSymbol);
                    const dfaNxtStateIdListOnSymbol = [...dfaNxtStateIdSetOnSymbol];

                    if (dfaNxtStateIdListOnSymbol.length > 0) {
                        const dfaNxtStateId = dfaNxtStateIdListOnSymbol.join(',');
                        dfaTable.get(dfaCurStateId)!.set(symbol, dfaNxtStateId);
                        if (!dfaTable.has(dfaNxtStateId)) {
                            workList.unshift(dfaNxtStateIdListOnSymbol);
                        }
                    }
                }
            }

            this._remapStateForDfaTable(dfaTable, acceptingStateIdsByStr, startStateIds.join(','));
        }
        return this.transitionTable;
    }

    _remapStateForDfaTable(
        dfaTable: Map<string, Map<string, string>>, 
        acceptingStateIdsByStr: Set<string>,
        startStateIdByStr: string
    ) {
        this.transitionTable = new Map();
        this.acceptingStateIds = new Set();
        const stateMapping = new Map();

        let newId = 0;
        for (const [id, _] of dfaTable) {
            stateMapping.set(id, newId);
            if (acceptingStateIdsByStr.has(id)) {
                this.acceptingStateIds.add(newId);
            }
            newId++;
        }

        this.startStateId = stateMapping.get(startStateIdByStr)!;

        for (const [id, transition] of dfaTable) {
            const newTransition = new Map();

            for (const symbol of this.alphabet) {
                if (transition.has(symbol)) {
                    newTransition.set(symbol, stateMapping.get(transition.get(symbol)));
                }
            }
            this.transitionTable.set(stateMapping.get(id), newTransition);
        }
    }

    getMinStartStateId(): number {
        if (this.minStartStateId == -1) {
            this.getTransitionTable();
            this._minimizeDFA();
        }
        return this.minStartStateId;
    }

    getMinAcceptingStateIds(): Set<number> {
        if (this.minAcceptingStateIds == null) {
            this.getTransitionTable();
            this._minimizeDFA();
        }
        return this.minAcceptingStateIds;
    }

    getMinTransitionTable(): Map<number, Map<string, number>> {
        if (this.minTransitionTable == null) {
            this.getTransitionTable();
            this._minimizeDFA();
        }
        return this.minTransitionTable;
    }

    _minimizeDFA() {
        let preStateGroupMapping = new Map<number, number>();
        let preGroupStatesMapping = new Map<number, Set<number>>();
        for (const state of this.transitionTable.keys()) {
            if (this.acceptingStateIds.has(state)) {
                preStateGroupMapping.set(state, 1);
                
                if (!preGroupStatesMapping.has(1)) {
                    preGroupStatesMapping.set(1, new Set());
                }
                preGroupStatesMapping.get(1)!.add(state);
            } else {
                preStateGroupMapping.set(state, 0);

                if (!preGroupStatesMapping.has(0)) {
                    preGroupStatesMapping.set(0, new Set());
                }
                preGroupStatesMapping.get(0)!.add(state);
            }
        }

        let iterateFlag = true;
        while (iterateFlag) {
            const curStateGroupMapping = new Map<number, number>();
            const curGroupStatesMapping = new Map<number, Set<number>>();

            let groupIdCounter = 0;
            for (const [_, states] of preGroupStatesMapping) {
                const classifyingKeyMapping = new Map<string, Set<number>>();
                for (const state of states) {
                    let classifyingKey = '';
                    const stateTransitionTable = this.getTransitionTable().get(state)!;
                    for (const symbol of this.getAlphabet()) {
                        if (!stateTransitionTable.has(symbol)) {
                            classifyingKey += '&null';
                        } else {
                            classifyingKey += '&' + preStateGroupMapping.get(stateTransitionTable.get(symbol)!);
                        }
                    }
                    if (!classifyingKeyMapping.has(classifyingKey)) {
                        classifyingKeyMapping.set(classifyingKey, new Set());
                    }
                    classifyingKeyMapping.get(classifyingKey)!.add(state);
                }

                for (const [_, classifiedStates] of classifyingKeyMapping) {
                    curGroupStatesMapping.set(groupIdCounter, new Set());
                    for (const classifiedState of classifiedStates) {
                        curStateGroupMapping.set(classifiedState, groupIdCounter);
                        curGroupStatesMapping.get(groupIdCounter)?.add(classifiedState);
                    }
                    groupIdCounter += 1;
                }
            }
            
            iterateFlag = !this._mapping_equal_checking(preGroupStatesMapping, curGroupStatesMapping);
            
            preStateGroupMapping = curStateGroupMapping;
            preGroupStatesMapping = curGroupStatesMapping;
        }
        
        this.minTransitionTable = new Map();
        this.minAcceptingStateIds = new Set();
        this.minStartStateId = preStateGroupMapping.get(this.startStateId)!;
        
        for (const [curStateId, transition] of this.transitionTable) {
            const minCurStateId = preStateGroupMapping.get(curStateId)!;

            if (this.acceptingStateIds.has(curStateId)) {
                this.minAcceptingStateIds.add(minCurStateId);
            }
            
            const minTransition = new Map<string, number>();
            for (const [symbol, nxtStateId] of transition) {
                if (!minTransition.has(symbol)) {
                    minTransition.set(symbol, preStateGroupMapping.get(nxtStateId)!);
                }
            }

            this.minTransitionTable.set(minCurStateId, minTransition);
        }
    }

    _mapping_equal_checking(pre: Map<number, Set<number>>, cur: Map<number, Set<number>>): boolean {
        let preList = [];
        for (const [_, statesSet] of pre) {
            let statesList = [];
            for (const state of statesSet) {
                statesList.push(state);
            }
            statesList.sort();
            preList.push(statesList.join(','));
        }
        preList.sort();

        let curList = [];
        for (const [_, statesSet] of cur) {
            let statesList = [];
            for (const state of statesSet) {
                statesList.push(state);
            }
            statesList.sort();
            curList.push(statesList.join(','));
        }
        curList.sort();

        if (preList.length != curList.length) {
            return false;
        }

        const n = preList.length;
        for (let i = 0; i < n; i++) {
            if (preList[i] != curList[i]) {
                return false;
            }
        }

        return true;
    }

    testUsingDFA(str: string): boolean {
        const chooseTransitionTable = this.getTransitionTable();
        const chooseStartStateId = this.getStartStateId();
        const chooseAcceptingStateIds = this.getAcceptingStateIds();
        return this.test(chooseTransitionTable, chooseStartStateId, chooseAcceptingStateIds, str);
    }

    testUsingMinimizedDFA(str: string): boolean {
        let chooseTransitionTable = this.getMinTransitionTable();
        let chooseStartState = this.getMinStartStateId();
        let chooseAcceptingStateIds = this.getMinAcceptingStateIds();
        return this.test(chooseTransitionTable, chooseStartState, chooseAcceptingStateIds, str);
    }

    test(transition: Map<number, Map<string, number>>, startState: number, acceptingStates: Set<number>, str: string): boolean {
        let moveState = startState;
        for (const ch of str) {
            const moveStateTransition = transition.get(moveState)!;
            if (!moveStateTransition.has(ch)) {
                return false;
            }
            moveState = moveStateTransition.get(ch)!;
        }
        return acceptingStates.has(moveState);
    }
}