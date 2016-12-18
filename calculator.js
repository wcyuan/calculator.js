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

function evaluate_unsigned_number(expression, ii) {
    ii = consumeWhitespace(expression, ii);
    if (!expression.charAt(jj).match("[1-9]")) {
        throw "Invalid Number: " + expression.substr(ii);
    }
    var jj = consumeDigits(expression, ii);
    if (expression.charAt(jj) == ".") {
        var kk = consumeDigits(expression, jj + 1);
        if (kk == jj) {
            throw "Invalid Number: " + expression.substr(ii);
        }
        jj = kk;
    }
    console.log(ii);
    console.log(jj);
    console.log(expression.substr(ii, jj-ii));
    return {'value': parseFloat(expression.substr(ii, jj-ii)),
            'position': consumeWhitespace(expression, jj)};
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
    return result;
}

function evaluate_exponent(expression, ii) {
    ii = consumeWhitespace(expression, ii);
    var result = evaluate_paren(expression, ii);
    result.position = consumeWhitespace(expression, result.position);
    if (expression.charAt(result.position) == "^") {
        var exponent = evaluate_signed(expression, result.position + 1);
        result.value = result.value ^ exponent.value;
        result.position = exponent.position;
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
    }
    return result;
}

function evaluate_multdiv(expression, ii) {
    ii = consumeWhitespace(expression, ii);
    var result = evaluate_signed(expression, ii);
    result.position = consumeWhitespace(expression, result.position);
    while ((expression.charAt(result.position) == "*" ||
            expression.charAt(result.position) == "/")) {
        var new_result = evaluate_signed(expression, result.position + 1);
        if (expression.charAt(result.position) == "*") {
            result.value *= new_result.value;
        } else if (expression.charAt(result.position) == "/") {
            result.value /= new_result.value;
        }
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
        var new_result = evaluate_multdiv(expression, result.position + 1);
        if (expression.charAt(result.position) == "+") {
            result.value += new_result.value;
        } else if (expression.charAt(result.position) == "-") {
            result.value -= new_result.value;
        }
        result.position = new_result.position;
    }
    return result;
}

function evaluate(expression) {
   return evaluate_addsub(expression, 0).value;
}

// -------------------------------------------------------------------- //

addEventListener = function(el, type, fn) { 
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

display = function(output) {
    var answers = document.getElementById("target");
    answers.innerHTML = "<pre>" + output + "</pre>";
};

function main() {
    var solve_button = document.getElementById("solve");
    addEventListener(solve_button, 'click', function() {
        var input = document.getElementById("a");
        var result = evaluate(input.value);
        display(result);
    });
}

// -------------------------------------------------------------------- //
