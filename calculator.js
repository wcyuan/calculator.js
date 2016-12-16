// EXPRESSION = ADDSUB_EXPRESSION
// ADDSUB_EXPRESSION = MULTSUB_EXPRESSION [ ADDSUB_OP ADDSUB_EXPRESSION ]
// MULTDIV_EXPRESSION = SIGNED_EXPRESSION [ MULTDIV_OP MULT_EXPRESSION ]
// SIGNED_EXPRESSION = [ - ] EXPONENT_EXPRESSION
// EXPONENT_EXPRESSION = PAREN_EXPRESSION ^ SIGNED_EXPRESSION
// PAREN_EXPRESSION = ( EXPRESSION ) | UNSIGNED_NUMBER
// UNSIGNED_NUMBER = [0-9]+[.(0-9)*]
// ADDSUB_OP = + | -
// MULTDIV_OP = * | /

// -------------------------------------------------------------------- //

function evaluate(expression) {
   return evaluate_addsub(expression);
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
    var answers = document.getElementById("answers");
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
