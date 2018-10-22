#!/usr/bin/env node

import fs from "fs";
import Lexer from "./lexer";
import {ITreeNode} from "./node-tree";

const args: string[] = [...process.argv];

args.splice(0, 2);

const targetFile: string = args[0];

if (!fs.existsSync(targetFile)) {
    console.log("No such file");
    process.exit();
}

console.log(targetFile);

const code: string = fs.readFileSync(targetFile).toString();
const lexer: Lexer = new Lexer(code);
const tree: ITreeNode = lexer.lex();

console.log(JSON.stringify(tree));
