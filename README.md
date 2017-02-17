Parse + evaluate simple arithmetic expressions:

https://wcyuan.github.io/calculator.js/

If you only have + and \*, then you can probably get away with this (in python):

    lambda x: sum(reduce(lambda x, y: x * y, [int(z) for z in y.split("*")]) for y in x.split("+"))
