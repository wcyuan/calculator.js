// EXPRESSION = ADDSUB_EXPRESSION
// ADDSUB_EXPRESSION = MULTDIV_EXPRESSION [ ADDSUB_OP MULTDIV_EXPRESSION ]*
// MULTDIV_EXPRESSION = SIGNED_EXPRESSION [ MULTDIV_OP SIGNED_EXPRESSION ]*
// SIGNED_EXPRESSION = [ - ] EXPONENT_EXPRESSION
// EXPONENT_EXPRESSION = PAREN_EXPRESSION ^ SIGNED_EXPRESSION
// PAREN_EXPRESSION = ( ADDSUB_EXPRESSION ) | UNSIGNED_NUMBER
// UNSIGNED_NUMBER = [0-9]+[.(0-9)*]
// ADDSUB_OP = + | -
// MULTDIV_OP = * | /

// -------------------------------------------------------------------- //

function consumeRegexp(expression, ii, regexp) {
    for (var jj = ii;
         jj < expression.length &&
         expression.charAt(jj).match(regexp);
         jj++) {
    }
    return {'value': expression.substr(ii, jj-ii), 'position': jj};
}

function consumeWhitespace(expression, ii) {
    return consumeRegexp(expression, ii, /\s/).position;
}

function consumeDigits(expression, ii) {
    return consumeRegexp(expression, ii, /\d/).position;
}

// The error checking is a bit involved, this really ought to have tests
// (as should all the functions)
// These expressions are ok:
//   0
//   0.
//   .0
//   .0000
//   0.0000
//   1
//   1.2
// These expressions aren't ok:
//   .
//   00
//   01
//   01.
//   01.0
//   <empty string>
function evaluate_unsigned_number(expression, ii) {
    ii = consumeWhitespace(expression, ii);
    var jj = consumeDigits(expression, ii);
    // Don't accept leading zeros, unless that is the only digit
    if (jj - ii > 1 && !expression.charAt(ii).match("[1-9]")) {
        throw "Invalid Number: " + expression.substr(ii);
    }
    // Note that it's ok for the part before the decimal to be empty, if there's a decimal.
    if (expression.charAt(jj) == ".") {
        var kk = consumeDigits(expression, jj + 1);
        if (kk == jj + 1) {
            // Google accepts numbers with no digit after the decimal, so we should too.
            // However, Google doesn't accept numbers with no digits before and after
            // the decimal (i.e., a decimal point by itself)
            if (jj == ii) {
                throw "Invalid Number: " + expression.substr(ii);
            }
        }
        jj = kk;
    } 
    // It's not ok for the whole number to be empty.
    if (jj == ii) {
        throw "Invalid Number: " + expression.substr(ii);
    }
    var string = expression.substr(ii, jj-ii);
    return {'value': parseFloat(string),
            'position': consumeWhitespace(expression, jj),
            'string' : string};
}

function evaluate_paren(expression, ii) {
    ii = consumeWhitespace(expression, ii);
    if (expression.charAt(ii) != "(") {
        return evaluate_unsigned_number(expression, ii);
    }
    var result = evaluate_addsub(expression, ii + 1);
    if (expression.charAt(result.position) != ")") {
        throw "Missing closing paren" + expression.substr(ii);
    }
    result.position = consumeWhitespace(expression, result.position + 1);
    result.string = "(" + result.string + ")";
    return result;
}

function evaluate_exponent(expression, ii) {
    ii = consumeWhitespace(expression, ii);
    var result = evaluate_paren(expression, ii);
    result.position = consumeWhitespace(expression, result.position);
    if (expression.charAt(result.position) == "^") {
        var exponent = evaluate_signed(expression, result.position + 1);
        result.value = Math.pow(result.value, exponent.value);
        result.position = exponent.position;
        result.string = "(" + result.string + " ^ " + exponent.string + ")";
    }
    return result;
}

function evaluate_signed(expression, ii) {
    ii = consumeWhitespace(expression, ii);
    var is_negated = (expression.charAt(ii) == "-");
    if (is_negated) {
        ii = consumeWhitespace(expression, ii + 1);
    }
    var result = evaluate_exponent(expression, ii);
    result.position = consumeWhitespace(expression, result.position);
    if (is_negated) {
        result.value = - result.value;
        result.string = "(-" + result.string + ")";
    }
    return result;
}

function evaluate_multdiv(expression, ii) {
    ii = consumeWhitespace(expression, ii);
    var result = evaluate_signed(expression, ii);
    result.position = consumeWhitespace(expression, result.position);
    while ((expression.charAt(result.position) == "*" ||
            expression.charAt(result.position) == "/")) {
        var op = expression.charAt(result.position);
        var new_result = evaluate_signed(expression, result.position + 1);
        if (op == "*") {
            result.value *= new_result.value;
        } else {
            result.value /= new_result.value;
        }
        result.string = "(" + result.string + " " + op + " " + new_result.string + ")";
        result.position = new_result.position;
    }
    return result;
}

function evaluate_addsub(expression, ii) {
    ii = consumeWhitespace(expression, ii);
    var result = evaluate_multdiv(expression, ii);
    result.position = consumeWhitespace(expression, result.position);
    while ((expression.charAt(result.position) == "+" ||
            expression.charAt(result.position) == "-")) {
        var op = expression.charAt(result.position);
        var new_result = evaluate_multdiv(expression, result.position + 1);
        if (op == "+") {
            result.value += new_result.value;
        } else if (op == "-") {
            result.value -= new_result.value;
        }
        result.string = "(" + result.string + " " + op + " " + new_result.string + ")";
        result.position = new_result.position;
    }
    return result;
}

function evaluate(expression) {
    var result = evaluate_addsub(expression, 0);
    var msg = "";
    if (result.position == 0) {
        throw "Invalid expression: " + expression;
    }
    if (result.position < expression.length) {
        msg = "Extra characters after the expression: " +
              expression.substr(result.position);
    }
    expression = expression.substr(0, result.position);
    return result.value + "\n" + result.string +
           "\n" + msg +
           "\nCompare to: <a href=\"https://www.google.com/search?q=" +
           encodeURIComponent(expression) + "\">" + expression + "</a>";
}

// -------------------------------------------------------------------- //

var addEventListener = function(el, type, fn) { 
    if (el.addEventListener) { 
        el.addEventListener(type, fn, false); 
        return true; 
    } else if (el.attachEvent) { 
        var r = el.attachEvent("on" + type, fn); 
        return r; 
    } else { 
        return false; 
    } 
};

var display = function(output) {
    var answers = document.getElementById("target");
    answers.innerHTML = "<pre>" + output + "</pre>";
};

function main() {
    var solve_button = document.getElementById("solve");
    addEventListener(solve_button, 'click', function() {
        var input = document.getElementById("a");
        try {
            var result = evaluate(input.value);
            display(result);
        } catch(err) {
            display(err);
        }
    });
}

// -------------------------------------------------------------------- //
