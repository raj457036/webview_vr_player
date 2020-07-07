
function getFilterElm() {
    if (window._filterElm == null) {
        window._filterElm = $("filter#_color>feColorMatrix")[0];
    }

    return window._filterElm;
}

function clamp(value, min, max) {
    if (value < min) {
        return min;
    } if (value > max) {
        return max;
    }
    return value;
}

function changeAtrribute(balanceNormalizer, exposureBalance, r, g, b) {
    var _filter = getFilterElm();

    var balance = (r + g + b) / 3;

    var normalized =
        balanceNormalizer == 0 ? 1 : balanceNormalizer;

    var exposure =
        exposureBalance == 0.0 ? 1.0 : exposureBalance;

    var normalizedBalance = clamp(balance / normalized);
    var exposedBalance = balance / exposure;

    _filter.setAttribute('values', `
        ${normalizedBalance} 0 ${normalizedBalance} 0 0
        0 ${normalizedBalance} ${normalizedBalance} 0 0
        0 0 ${normalizedBalance} 0 0
        0 0 0 1 0`
    );
}