import { EPSILON_CLOSURE } from './constant';
import { NFA } from './NFA';

export class DFA {
    nfa: NFA
    alphabet: Set<string>
    acceptingStateIds: Set<number>
    transitionTable: Map<number, Map<string, number>>

    constructor(nfa: NFA) {
        this.nfa = nfa;
        this.alphabet = nfa.getAlphabet();
        this.acceptingStateIds = null as any;
        this.transitionTable = null as any;
    }

    getAlphabet(): Set<string> {
        return this.alphabet;
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
            const nfaStates = this.nfa.getAcceptingStates();
            const nfaStartState = this.nfa.inState;
            const nfaAcceptingStateIds = this.nfa.getAcceptingStateIds();

            const acceptingStateIdsByStr = new Set<string>();
            const startStateIds = nfaTable.get(nfaStartState.id)!.get(EPSILON_CLOSURE);
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

            this.remapStateForDfaTable(dfaTable, acceptingStateIdsByStr);
        }
        return this.transitionTable;
    }

    remapStateForDfaTable(dfaTable: Map<string, Map<string, string>>, acceptingStateIdsByStr: Set<string>) {
        return null as any;
    }
}