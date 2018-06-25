// import * as Jison from "jison"
export const lex = {
  "macros": {
    "ASCII": "a-zA-Z", //1
    "DIGIT": "0-9",
    "ALNUM": "{ASCII}{DIGIT}"
  },
  "startConditions":{
    "COMMENT":"// single line comments",
    "MULTI_COMMENT": "/* multi-line comments",//5
  },
  "rules":[
    ["$","return 'EOF'"], // 7?
    ["[\\s]+","if(yy.monitor.shouldSemiColon(yylloc)) {return ';'; } // whitespace"], //8
    //print('whitespace');console.log(yylloc);console.log('semi '+bark.monitor.shouldSemiColon(yylloc))
    //["[ \\r\\t]+","/* skip whitespace */"],
    //["\\n","console.log('newline '+yylloc.first_line);if(bark.monitor.shouldSemiColon(yylloc.first_line)){console.log('semicolon')} /*skip newlines   */"],
    [['INITIAL'],"//","this.pushState('COMMENT')"],
    [['COMMENT'],"[^*\\n]","// eat comment in chunks"],
    [['COMMENT'],"\\n","this.popState()"],
    // /\\*, /\*, /*
    [['INITIAL'],"/\\*","this.pushState('MULTI_COMMENT')"],
    [['MULTI_COMMENT'],"[^*\\n]","// eat comment in chunks"],
    [['MULTI_COMMENT'],"\\n","// eat line"],
    [['MULTI_COMMENT'],"\\*/","this.popState()"],


    ["[a-zA-Z][a-zA-Z0-9]*","return 'ID'"],
    // ["[{ASCII}][{ALNUM}]*","console.log(yytext);return 'ID'"],
    // ["[_|$|ASCII][ALNUM]*","return 'ID'"],
    ["[1-9][0-9]*", "return 'NUM';"],

    [";", "return ';'"],
    ["\\.", "return '.'"],
    ["\\(","return '('"], 
    ["\\)","return ')'"],
    ["\\{","return '{'"],
    ["\\}","return '}'"],
    ["\\[", "return '['"],
    ["\\]", "return ']'"],
    ["=","return '='"],
    // simplified return string
    [
      "\'.*\'",
      "return 'STRING'",
    ],
    [
      "\".*\"",
      "return 'STRING'",
    ],
  ]
}