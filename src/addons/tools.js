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
}

function typeOf(obj) {
    return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase()
}

/**
 * get the date based on the locale
 * @param {*} d
 * @param {*} locale
 */
function localDate(d, locale) {
    if (!d) return ""
    if (!locale) locale = navigator.language || navigator.userLanguage || "en-GB"
    d = d.split("T")[0]
    // "2020-11-24T14:23:38.158171+00:00"
    const date = new Date(d.replace(/-/g, "/")) // bugfix Safari
    if (isNaN(date)) return d
    return new Intl.DateTimeFormat(locale).format(date)
}

/**
 * get the date based on the locale
 * @param {*} d
 * @param {*} locale
 */
function localDatetime(d, locale) {
    if (!d) return ""
    if (!locale) locale = navigator.language || navigator.userLanguage || "en-GB"
    d = d.replace("T", " ")
    const date = new Date(d.replace(/-/g, "/")) // bugfix Safari
    if (isNaN(date)) return d
    return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric"
    }).format(date)
}

/**
 * number format integer or float
 * @param {*} n
 */
function num(n) {
    return n === parseInt(n) ? Number(parseInt(n) * 1) : Number(parseFloat(n).toFixed(2) * 1.0)
}

/**
 * check the date
 * @param {*} v
 */
const getType = function (v) {
    if (typeof v === "boolean") return "boolean"
    if (typeof v === "number" || (!isNaN(parseFloat(v)) && isFinite(v))) return "number"
    if (!Number.isNaN(Number(new Date(v)))) return "date"
    if (typeof v === "string") return "string"
    return {}.toString
        .call(v)
        .match(/\s([a-zA-Z]+)/)[1]
        .toLowerCase()
}

function localValue(value, locale) {
    if (!value) return ""
    if (!locale) locale = navigator.language || navigator.userLanguage || "en-GB"
    if (getType(value) === "date") {
        return localDate(value, locale)
    }
    if (getType(value) === "number") {
        if (parseInt(value) === value) {
            return num(value).toLocaleString(locale)
        } else {
            return num(value).toLocaleString(locale, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })
        }
    }
    return value
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
    let acc = {}
    for (const source of sources) {
        if (source instanceof Array) {
            if (!(acc instanceof Array)) {
                acc = []
            }
            acc = [...acc, ...source]
        } else if (source instanceof Object) {
            for (let [key, value] of Object.entries(source)) {
                if (value instanceof Object && key in acc) {
                    value = deepMerge(acc[key], value)
                }
                acc = {
                    ...acc,
                    [key]: value
                }
            }
        }
    }
    return acc
}

/**
 * resultlist.sort(compareValues('state'));
 *
 * @param {*} key
 * @param {*} order
 */
function compareValues(key, order = "asc") {
    return function innerSort(a, b) {
        if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
            // property doesn't exist on either object
            return 0
        }
        const varA = typeof a[key] === "string" ? a[key].toUpperCase() : a[key]
        const varB = typeof b[key] === "string" ? b[key].toUpperCase() : b[key]
        let comparison = 0
        if (varA > varB) {
            comparison = 1
        } else if (varA < varB) {
            comparison = -1
        }
        return order === "desc" ? comparison * -1 : comparison
    }
}

/**
 * capitalize string
 * @param {*} s
 */
const capitalize = (s) => {
    if (typeof s !== "string") return ""
    return s.charAt(0).toUpperCase() + s.slice(1)
}

/**
 * filter entities from this._hass.states
 * @call: filter(this._hass.states,this.config_filter)
 *
 *  filter:
 *     - sensor.orangenbaum*
 *     - sensor.energie*
 *
 * @param {*} list
 * @param {*} filters
 */
function filter(list, filters) {
    /**
     * filter object
     * @param {*} stateObj
     * @param {*} pattern
     */
    function _filterName(stateObj, pattern) {
        let parts
        let attribute
        //console.log("STATEOBJECT:",stateObj,pattern)
        if (typeof pattern === "object") {
            parts = pattern["key"].split(".")
            attribute = pattern["key"]
        } else {
            parts = pattern.split(".")
            attribute = pattern
        }
        const regEx = new RegExp(`^${attribute.replace(/\*/g, ".*")}$`, "i")
        return stateObj.search(regEx) === 0
    }
    let entities = []

    filters.forEach((item) => {
        const _filters = []
        _filters.push((stateObj) => _filterName(stateObj, item.entity_filter))
        if (_filters && _filters.length) {
            Object.keys(list)
                .sort()
                .forEach((key) => {
                    Object.keys(list[key]).sort()
                    if (_filters.every((filterFunc) => filterFunc(`${key}`))) {
                        let newItem
                        if (item.attribute) {
                            // check if we can use the attribute for this entity
                            if (list[key].attributes[item.attribute]) {
                                let _name = list[key].attributes.friendly_name
                                    ? list[key].attributes.friendly_name
                                    : key
                                _name += item.name ? " " + item.name : " " + capitalize(item.attribute)
                                newItem = {
                                    entity: key,
                                    name: _name,
                                    unit: item.unit || '',
                                    state: list[key].attributes[item.attribute.toLowerCase()],
                                    attributes: list[key].attributes,
                                    last_changed: list[key].last_changed,
                                    field: item.attribute.toLowerCase()
                                }
                                newItem.attributes.friendly_name = newItem.name
                            }
                        } else {
                            // simple entity...
                            newItem = {
                                entity: key,
                                name: list[key].attributes.friendly_name ? list[key].attributes.friendly_name : key,
                                state: list[key].state,
                                attributes: list[key].attributes,
                                last_changed: list[key].last_changed
                            }
                        }
                        if (newItem) {
                            if (item.options) {
                                newItem.options = item.options
                            }
                            if (newItem.state && (item.state_min_value || item.state_max_value)) {
                                const _min = item.state_min_value || Number.MIN_VALUE
                                const _max = item.state_max || Number.MAX_VALUE
                                newItem.state = parseFloat(newItem.state)
                                if ((newItem.state - _min) * (newItem.state - _max) <= 0) {
                                    entities.push(newItem)
                                }
                            } else {
                                entities.push(newItem)
                            }
                        }
                    }
                })
        }
    })
    return entities
}
