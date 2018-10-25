import {TokenType} from "./token-types";

export type IToken = {
    readonly value?: string;
    readonly type: TokenType;
    readonly start: number;
    readonly end: number;
}

export enum TokenMatch {
    Quote = "\"",
    NewLine = "\n",
    SemiColon = ";"
}

// Patterns
const $quoteBody = /[^"]/i;

export default class Tokenizer {
    private readonly input: string;
    
    private pos: number;

    public constructor(input: string) {
        this.input = input;
        this.pos = 0;
    }

    public tokenize(): IToken[] {
        const tokens: IToken[] = [];

        for (this.pos = 0; this.pos < this.input.length; this.pos++) {
            switch (this.$) {
                case TokenMatch.Quote: {
                    const value: string | null = this.collectUntil($quoteBody, true, this.pos + 1);

                    if (value === null) {
                        throw this.expecting("End of quote body");
                    }

                    tokens.push(this.createToken(TokenType.Quote, value));
                    this.skip(value.length + 1);

                    break;
                }

                case TokenMatch.NewLine: {
                    tokens.push(this.createToken(TokenType.NewLine));

                    break;
                }

                case TokenMatch.SemiColon: {
                    tokens.push(this.createToken(TokenType.SemiColon));

                    break;
                }

                default: {
                    // TODO: Collect errors instead
                    console.log(`Unexpected token: ${this.$}`);
                }
            }
        }

        return tokens;
    }

    private expecting(message: string, position: number = this.pos): Error {
        return new Error(`Expecting ${message} | Position ${position}`);
    }

    private skip(characters: number): this {
        // TODO: Prevent overflow (EOF)
        this.pos += characters;

        return this;
    }

    private collectUntil(expression: RegExp, value: boolean = true, start: number = this.pos): string | null {
        let counter: number = start;
        let collection: string = "";

        // TODO: Check for EOF
        while (expression.test(this.input[counter]) === value) {
            collection += this.input[counter];
            
            if (counter + 1 >= this.input.length) {
                return null;
            }

            counter++;
        }

        return collection;
    }

    private createToken(type: TokenType, value?: string, end: number = this.pos + 1): IToken {
        return {
            start: this.pos,
            end,
            type,
            value
        };
    }

    private get $(): string {
        return this.input[this.pos];
    }

    private next(): this {
        // TODO

        return this;
    }
}