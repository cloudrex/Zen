import {TokenType} from "./token-types";

export type IToken = {
    readonly type: TokenType;
    readonly start: number;
    readonly end: number;
}

export default class Tokenizer {
    private readonly input: string;

    public constructor(input: string) {
        this.input = input;
    }

    private next(): this {
        // TODO

        return this;
    }
}