const ColorFilter = {
    NoFilter: "",
    f1977: "_1977",
    Aden: "aden",
    Brannan: "brannan",
    Brooklyn: "brooklyn",
    Clarendon: "clarendon",
    Earlybird: "earlybird",
    Gingham: "gingham",
    Hudson: "hudson",
    Inkwell: "inkwell",
    Kelvin: "kelvin",
    Lark: "lark",
    LoFi: "lofi",
    Maven: "maven",
    Mayfair: "mayfair",
    Moon: "moon",
    Nashville: "nashville",
    Perpetua: "perpetua",
    Reyes: "reyes",
    Rise: "rise",
    Slumber: "slumber",
    Stinson: "stinson",
    Toaster: "toaster",
    Valencia: "valencia",
    Walden: "walden",
    Willow: "willow",
    XproII: "xpro2",
    Balance: "balance",
}

Object.freeze(ColorFilter);


class MediaColorFilter {
    constructor(elm_class) {
        this.elm_class = elm_class;
    }

    applyFilter(colorFilterCode) {

        const elm = document.querySelector(`.${this.elm_class}`);
        elm.style.filter = "";
        elm.style.webkitFilter = "";
        elm.className = `${colorFilterCode}`;

        return '';
    }


    filter(sepia, saturation, brightness, contrast, hue) {
        const elm = document.querySelector(`.${this.elm_class}`);
        let filter = `sepia(${sepia || 0}) saturate(${saturation || 100}%) brightness(${brightness || 1}) contrast(${contrast || 1}) hue-rotate(${hue || 0}deg)`;
        elm.style.filter = filter;
        elm.style.webkitFilter = filter;
        return "";
    }


    __getFilterElm__() {
        if (window._filterElm == null) {
            window._filterElm = $("filter#_color>feColorMatrix")[0];
        }

        return window._filterElm;
    }

    __clamp__(value, min, max) {
        if (value < min) {
            return min;
        }
        if (value > max) {
            return max;
        }
        return value;
    }

    buildBalanceFilter(strength, r, g, b) {
        var _filter = this.__getFilterElm__();

        var balance = (r + g + b) / 3;

        var normalizedBalance = balance / (strength || 1.0);
        console.log(normalizedBalance);

        _filter.setAttribute('values', `${normalizedBalance} 0 ${normalizedBalance} 0 0 0 ${normalizedBalance} ${normalizedBalance} 0 0 0 0 ${normalizedBalance} 0 0 0 0 0 1 0`);

        return '';
    }
}