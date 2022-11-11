import { NFA, char, epsilon, concat, or, rep, repOneOrMore, repOneOrZero } from "../src/NFA";
import { DFA } from "../src/DFA";
import { assert } from "chai";

describe('Basic DFA test', () => {
    it('Test char DFA transitions', () => {
        const aNFA = char('a');
        const aDFA = new DFA(aNFA);
        console.log(aDFA.getTransitionTable());
    });

    it('Test concat DFA transition', () => {
        const reNFA = concat(
            char('a'),
            char('b'),
            char('c')
        );
        
        const reDFA = new DFA(reNFA);
        console.log(reDFA.getTransitionTable());
    });

    it('Test or DFA', () => {
        const reNFA = or(
            char('a'),
            char('b'),
            char('c')
        );

        const reDFA = new DFA(reNFA);
        console.log(reDFA.getTransitionTable());
    });
});
