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
const $identifier = /[a-z]/i;

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
                    const value: string | null = this.collectUntilExpression($quoteBody, false, this.pos + 1);

                    if (value === null) {
                        throw this.expecting("End of quote body");
                    }

                    tokens.push(this.createToken(TokenType.Quote, value, this.pos + value.length + 1));
                    this.skip(value.length + 2);

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
                    continue;

                    break;
                }

                default: {
                    if (this.matchToken(TokenMatch.FunctionKeyword)) {
                        tokens.push(this.createToken(TokenType.FunctionKeyword));
                        this.skip(TokenMatch.FunctionKeyword.length);
                    }
                    else if ($identifier.test(this.$)) {
                        const value: string | null = this.collectUntilExpression($identifier, false, this.pos, true);

                        if (value === null) {
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

    private skip(characters: number, offset: number = -1): this {
        // TODO: Prevent overflow (EOF)
        this.pos += characters + offset;

        return this;
    }

    // TODO: Should consider EOF as a false match, and return what was collected
    private collectUntilExpression(expression: RegExp, equals: boolean = true, start: number = this.pos, returnOnEnd: boolean = false): string | null {
        let counter: number = start;
        let collection: string = "";

        // TODO: Separate into 2 methods
        while (expression.test(this.input[counter]) !== equals) {
            collection += this.input[counter];
            
            if (counter + 1 >= this.input.length && returnOnEnd) {
                return collection;
            }
            else if (counter + 1 >= this.input.length && !returnOnEnd) {
                throw this.expecting("match before end of file");
            }

            counter++;
        }

        return collection;
    }

    private collectUntil(match: string, start: number = this.pos, returnOnEnd: boolean = false): string {
        let counter: number = start;
        let collection: string = "";

        while (this.input[counter] !== match) {
            collection += this.input[counter];

            if (counter + 1 >= this.input.length && returnOnEnd) {
                return collection;
            }
            else if (counter + 1 >= this.input.length && !returnOnEnd) {
                throw this.expecting(`"character '${match}' before end of file`);
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