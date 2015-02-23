ace.define('ace/mode/lmc', function(require, exports, module) {

var oop = require("ace/lib/oop");
var TextMode = require("ace/mode/text").Mode;
var Tokenizer = require("ace/tokenizer").Tokenizer;
var LMCHighlightRules = require("ace/mode/lmc_highlight_rules").LMCHighlightRules;

var Mode = function() {
    this.$tokenizer = new Tokenizer(new LMCHighlightRules().getRules());
};
oop.inherits(Mode, TextMode);

(function() {
    // Extra logic goes here. (see below)
}).call(Mode.prototype);

exports.Mode = Mode;
});

ace.define('ace/mode/lmc_highlight_rules', function(require, exports, module) {

var oop = require("ace/lib/oop");
var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;

var LMCHighlightRules = function() {
	
    this.$rules = {
		start:[{
			token:"keyword",
			regex:"\\bADD\\b|\\bSUB\\b|\\bSTA\\b|\\bLDA\\b|\\bBRA\\b|\\bBRZ\\b|\\bBRP\\b|\\bINP\\b|\\bOUT\\b|\\bHLT\\b|\\bDAT\\b"
		}, {
			token:"comment",
			regex: "//.+$"
		},
		{
			token:"comment",
			regex:";.+$"
		}
		]
		};

}

oop.inherits(LMCHighlightRules, TextHighlightRules);

exports.LMCHighlightRules = LMCHighlightRules;
});