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
    SemiColon = ";",
    FunctionKeyword = "fun",
    AddOperator = "+",
    SubstractOperator = "-",
    MultiplyOperator = "*",
    ExponentOperator = "**",
    Whitespace = " "
}

// Patterns
const $quoteBody = /[^"]/i;
const $entity = /[a-z]/i;

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
                    const value: string | null = this.collectUntil($quoteBody, false, this.pos + 1);

                    if (value === null) {
                        throw this.expecting("End of quote body");
                    }

                    tokens.push(this.createToken(TokenType.Quote, value, this.pos + value.length));
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

                case TokenMatch.Whitespace: {
                    const amount: string | null = this.collectUntil(TokenMatch.Whitespace, true);

                    if (amount === null) {
                        console.log(tokens);
                        throw new Error("Unexpected end of file (collecting whitespace)");
                    }

                    console.log("amount: ", amount, `(${amount.length})`);

                    tokens.push(this.createToken(TokenType.Whitespace, undefined, this.pos + amount.length));
                    this.skip(amount.length);

                    break;
                }

                default: {
                    if (this.matchToken(TokenMatch.FunctionKeyword)) {
                        tokens.push(this.createToken(TokenType.FunctionKeyword));
                        this.skip(TokenMatch.FunctionKeyword.length);
                    }
                    else if ($entity.test(this.$)) {
                        const value: string | null = this.collectUntil($entity, false);

                        if (value === null) {
                            console.log(tokens);
                            throw new Error("Unexpected end of file (collecting entity)");
                        }

                        tokens.push(this.createToken(TokenType.Entity, value, this.pos + value.length));
                        this.skip(value.length);
                    }
                    else {
                        // TODO: Collect errors instead
                        throw new Error(`Unexpected character: ${this.$}`);
                    }
                }
            }
        }

        return tokens;
    }

    private matchToken(token: TokenMatch): boolean {
        if (token.length > 1) {
            return token === this.forward(token.length);
        }

        return token === this.$;
    }

    private forward(characters: number, start: number = this.pos): string | null {
        const end: number = start + characters;

        let collection: string = "";
        let counter: number = start;

        while (counter < end) {
            if (counter + 1 >= this.input.length) {
                return null;
            }

            collection += this.input[counter];
            counter++;
        }

        return collection;
    }

    private expecting(message: string, position: number = this.pos): Error {
        return new Error(`Expecting ${message} | Position ${position}`);
    }

    private skip(characters: number): this {
        // TODO: Prevent overflow (EOF)
        this.pos += characters;

        return this;
    }

    // TODO: Should consider EOF as a false match, and return what was collected
    private collectUntil(expression: RegExp | string, equals: boolean = true, start: number = this.pos): string | null {
        let counter: number = start;
        let collection: string = "";

        // TODO: Separate into 2 methods
        while (expression instanceof RegExp ? expression.test(this.input[counter]) !== equals : (equals ? expression !== this.input[counter] : expression === this.input[counter])) {
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