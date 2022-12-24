import { assert } from "chai";
import Parser from '../src/Parser'

describe('Basic test', () => {
    it('Test epsilon', () => {
        let parser = new Parser();
        let re = "";
        let nfa = parser.parse(re);

        assert.equal(nfa.test(''), true);
        assert.equal(nfa.test('a'), false);
    });

    it('Test concat', () => {
        let parser = new Parser();
        let re = "abc";
        let nfa = parser.parse(re);

        assert.equal(nfa.test('abc'), true);
        assert.equal(nfa.test('ab'), false);
        assert.equal(nfa.test('abd'), false);
        assert.equal(nfa.test(''), false);
    });

    it('Test cleene closure *', () => {
        let parser = new Parser();
        let re = "a*";
        let nfa = parser.parse(re);

        assert.equal(nfa.test(''), true);
        assert.equal(nfa.test('a'), true);
        assert.equal(nfa.test('aa'), true);
        assert.equal(nfa.test('aaa'), true);
        assert.equal(nfa.test('ab'), false);
    });

    it('Test quantifier +', () => {
        let parser = new Parser();
        let re = "a+";
        let nfa = parser.parse(re);
        
        assert.equal(nfa.test(''), false);
        assert.equal(nfa.test('a'), true);
        assert.equal(nfa.test('aa'), true);
        assert.equal(nfa.test('aaa'), true);
        assert.equal(nfa.test('ab'), false);
    });

    it('Test quantifier ?', () => {
        let parser = new Parser();
        let re = "a?";
        let nfa = parser.parse(re);
        
        assert.equal(nfa.test(''), true);
        assert.equal(nfa.test('a'), true);
        assert.equal(nfa.test('aa'), false);
        assert.equal(nfa.test('ab'), false);
    });

    it('Another test for cleene closure *', () => {
        let parser = new Parser();
        let re = "a*b";
        let nfa = parser.parse(re);
        
        assert.equal(nfa.test(''), false);
        assert.equal(nfa.test('a'), false);
        assert.equal(nfa.test('b'), true);
        assert.equal(nfa.test('ab'), true);
        assert.equal(nfa.test('aab'), true);
        assert.equal(nfa.test('aaab'), true);
    });

    it('Another test for quantifier +', () => {
        let parser = new Parser();
        let re = "a+b";
        let nfa = parser.parse(re);
        
        assert.equal(nfa.test(''), false);
        assert.equal(nfa.test('a'), false);
        assert.equal(nfa.test('b'), false);
        assert.equal(nfa.test('ab'), true);
        assert.equal(nfa.test('abb'), false);
        assert.equal(nfa.test('aab'), true);
        assert.equal(nfa.test('aaab'), true);
    });

    it('Another test for quantifier ?', () => {
        let parser = new Parser();
        let re = "a?b";
        let nfa = parser.parse(re);
        
        assert.equal(nfa.test(''), false);
        assert.equal(nfa.test('a'), false);
        assert.equal(nfa.test('b'), true);
        assert.equal(nfa.test('ab'), true);
        assert.equal(nfa.test('aab'), false);
        assert.equal(nfa.test('aaab'), false);
    });

    it('Test parenthesis', () => {
        let parser = new Parser();
        let re = "(abc)";
        let nfa = parser.parse(re);
        
        assert.equal(nfa.test(''), false);
        assert.equal(nfa.test('a'), false);
        assert.equal(nfa.test('abc'), true);
        assert.equal(nfa.test('abcd'), false);
    });

    it('Test parenthesis with cleene closure', () => {
        let parser = new Parser();
        let re = "(abc)*";
        let nfa = parser.parse(re);
        
        assert.equal(nfa.test(''), true);
        assert.equal(nfa.test('a'), false);
        assert.equal(nfa.test('ab'), false);
        assert.equal(nfa.test('abc'), true);
        assert.equal(nfa.test('abca'), false);
        assert.equal(nfa.test('abcab'), false);
        assert.equal(nfa.test('abcabc'), true);
    });

    it('Complicated test', () => {
        let parser = new Parser();
        let re = "(abc)*d+ef?";
        let nfa = parser.parse(re);
        
        assert.equal(nfa.test(''), false);
        assert.equal(nfa.test('a'), false);
        assert.equal(nfa.test('ab'), false);
        assert.equal(nfa.test('abc'), false);
        assert.equal(nfa.test('ef'), false);
        assert.equal(nfa.test('def'), true);
        assert.equal(nfa.test('abcdef'), true);
        assert.equal(nfa.test('abcabcdef'), true);
        assert.equal(nfa.test('de'), true);
        assert.equal(nfa.test('abcde'), true);
        assert.equal(nfa.test('abcabcde'), true);
    });
});