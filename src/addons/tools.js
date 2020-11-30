/** ----------------------------------------------------------
 
	Lovelaces custom cards - tools
  	(c) 2020 Peter Siebler
  	Released under the MIT license
 
 * ----------------------------------------------------------*/

/** domain icons
 * https://github.com/home-assistant/frontend/blob/d2e9e22e4e0e8aadd5572bd6cd9b391035359744/src/common/const.ts
 * **/
const HASS_ICONS = {
    default: "hass:eye",
    alert: "hass:alert",
    alexa: "hass:amazon-alexa",
    automation: "hass:playlist-play",
    calendar: "hass:calendar",
    camera: "hass:video",
    climate: "hass:thermostat",
    configurator: "hass:settings",
    conversation: "hass:text-to-speech",
    device_tracker: "hass:account",
    fan: "hass:fan",
    google_assistant: "hass:google-assistant",
    group: "hass:google-circles-communities",
    history_graph: "hass:chart-line",
    homeassistant: "hass:home-assistant",
    homekit: "hass:home-automation",
    image_processing: "hass:image-filter-frames",
    input_boolean: "hass:drawing",
    input_datetime: "hass:calendar-clock",
    input_number: "hass:ray-vertex",
    input_select: "hass:format-list-bulleted",
    input_text: "hass:textbox",
    light: "hass:lightbulb",
    mailbox: "hass:mailbox",
    notify: "hass:comment-alert",
    persistent_notification: "hass:bell",
    person: "hass:account",
    plant: "hass:flower",
    proximity: "hass:apple-safari",
    remote: "hass:remote",
    scene: "hass:google-pages",
    script: "hass:file-document",
    sensor: "hass:eye",
    binarysensor: "hass:eye",
    simple_alarm: "hass:bell",
    sun: "hass:white-balance-sunny",
    switch: "hass:flash",
    timer: "hass:timer",
    updater: "hass:cloud-upload",
    vacuum: "hass:robot-vacuum",
    water_heater: "hass:thermometer",
    weather: "hass:weather-cloudy",
    weblink: "hass:open-in-new",
    zone: "hass:map-marker"
};
/**
 * data formatter
 * @param {*} d
 * @param {*} fmt
 */
function formatDate(d, fmt) {
    const date = new Date(d);
    function pad(value) {
        return value.toString().length < 2 ? "0" + value : value;
    }
    if (fmt == "timestamp") {
        return (
            date.getUTCFullYear() +
            "-" +
            pad(date.getUTCMonth() + 1) +
            "-" +
            pad(date.getUTCDate()) +
            " " +
            pad(date.getUTCHours()) +
            ":" +
            pad(date.getUTCMinutes()) +
            ":" +
            pad(date.getUTCSeconds())
        );
    }
    return fmt.replace(/%([a-zA-Z])/g, function (_, fmtCode) {
        switch (fmtCode) {
            case "Y":
                return date.getUTCFullYear();
            case "M":
                return pad(date.getUTCMonth() + 1);
            case "d":
                return pad(date.getUTCDate());
            case "H":
                return pad(date.getUTCHours());
            case "m":
                return pad(date.getUTCMinutes());
            case "s":
                return pad(date.getUTCSeconds());
            default:
                throw new Error("Unsupported format code: " + fmtCode);
        }
    });
}

function typeOf(obj) {
    return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
}

/**
 * get the date based on the locale
 * @param {*} d
 * @param {*} locale
 */
function localDate(d, locale) {
    if (!d) return "";
    if (!locale) locale = navigator.language || navigator.userLanguage || "en-GB";
    d = d.split("T")[0];
    // "2020-11-24T14:23:38.158171+00:00"
    const date = new Date(d.replace(/-/g, "/")); // bugfix Safari
    if (isNaN(date)) return d;
    return new Intl.DateTimeFormat(locale).format(date);
}

/**
 * get the date based on the locale
 * @param {*} d
 * @param {*} locale
 */
function localDatetime(d, locale) {
    if (!d) return "";
    if (!locale) locale = navigator.language || navigator.userLanguage || "en-GB";
    d = d.replace("T", " ");
    const date = new Date(d.replace(/-/g, "/")); // bugfix Safari
    if (isNaN(date)) return d;
    return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric"
    }).format(date);
}
/**
 * time stamp label for graph
 * @param {*} d
 * @param {*} locale
 */
function timeStampLabel(d, locale) {
    if (!d) return "";
    if (!locale) locale = navigator.language || navigator.userLanguage || "en-GB";
    const date = new Date(d.replace(/-/g, "/")); // bugfix Safari
    if (isNaN(date)) return d;
    const datestr = new Intl.DateTimeFormat(locale, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric"
    }).format(date);
    return datestr.split(",");
}

/**
 * remove node from object
 * @param {*} obj
 * @param {*} keys
 */
function reject(obj, keys) {
    return Object.keys(obj)
        .filter((k) => !keys.includes(k))
        .map((k) => Object.assign({}, { [k]: obj[k] }))
        .reduce((res, o) => Object.assign(res, o), {});
}

/**
 * number format integer or float
 * @param {*} n
 */
function num(n) {
    return n === parseInt(n) ? parseInt(n) * 1 : parseFloat(n).toFixed(2) * 1.0;
}

/**
 * check the date
 * @param {*} v
 */
const getType = function (v) {
    if (typeof v === "boolean") return "boolean";
    if (typeof v === "number" || (!isNaN(parseFloat(v)) && isFinite(v))) return "number";
    if (!Number.isNaN(Number(new Date(v)))) return "date";
    if (typeof v === "string") return "string";
    return {}.toString
        .call(v)
        .match(/\s([a-zA-Z]+)/)[1]
        .toLowerCase();
};

function localValue(value, locale) {
    if (!value) return "";
    if (!locale) locale = navigator.language || navigator.userLanguage || "en-GB";
    if (getType(value) === "date") {
        return localDate(value, locale);
    }
    if (getType(value) === "number") {
        if (parseInt(value) === value) {
            return num(value).toLocaleString(locale);
        } else {
            return num(value).toLocaleString(locale, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }
    }
    return value;
}

/**
 * Deep Merge
 * Used to merge the default and chart options, because the
 * helper.merge will not work...
 *
 * @param  {...any} sources
 * @returns combined object
 */
function deepMerge(...sources) {
    let acc = {};
    for (const source of sources) {
        if (source instanceof Array) {
            if (!(acc instanceof Array)) {
                acc = [];
            }
            acc = [...acc, ...source];
        } else if (source instanceof Object) {
            for (let [key, value] of Object.entries(source)) {
                if (value instanceof Object && key in acc) {
                    value = deepMerge(acc[key], value);
                }
                acc = {
                    ...acc,
                    [key]: value
                };
            }
        }
    }
    return acc;
}
