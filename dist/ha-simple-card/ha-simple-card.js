/**
 * ha-simple-card 0.0.4
 * https://github.com/zibous/ha-simple-card
 * 
 * License: MIT
 * Generated on 2020
 * Author: Peter siebler
 */

/**
 * button class
 * @call:
 *   o = new buttons({
 *        parentNode: this.content,
 *        entities: this.entities,
 *        hassEntities: this.hassEntities,
 *        locale: this.locale,
 *       })
 */

class buttons {
    /**
     * constructor for buttons
     * @param {*} config
     */
    constructor(config) {
        this.shadowRoot = config.shadowRoot;
        this.parentNode = config.parentNode;
        this.hass = config.hass;
        this.entities = config.entities;
        this.hassEntities = config.hassEntities;
        this.locale = config.locale;
        this.buttonstate = {};
        this.buttonslist = [];
        this.button_layer = null;
        this.update = false;
        this.intialized = false;
        this.render();
    }
    /**
     * set the styles for the buttons
     */
    set_buttonstyle() {
        if (!this.button_layer) return false;
        const _style = document.createElement("style");
        _style.textContent = `
            div.sc-buttons{
                position:relative;
                margin-left: 0.5em;
                width:100%;
                height:100%
            }
            .clearfix::before, .clearfix::after {
                content: " ";
                display: table;
            }
            div.sc-button{
                vertical-align: top;
                display:inline-block;
                width: var(--tile-width, 110px);
                height: var(--tile-height, 110px);
                padding:10px;
                background-color: var(--tile-background, rgba(255, 255, 255, 1));
                border-radius: var(--tile-border-radius, 12px);
                box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.15);
                box-shadow1: var(--ha-card-box-shadow, 5px 5px 8px rgba(0, 0, 0, 0.14), -5px -5px 8px rgba(0, 0, 0, 0.12));
                margin: 0.5em;
                position: relative;
                overflow:hidden;
                font-weight:300;
                font-size: 0.95em;
                color: var(--tile-on-name-text-color, rgba(0, 0, 0, 1));
                touch-action: auto!important;
            }
            div.sc-button.off {
                filter: brightness(0.7) !important;
                color: var(--tile-on-name-text-color, rgba(0, 0, 0, 0.40)) !important;
            }
            div.sc-button-data{
                position: absolute;
                left: 0;
                bottom: 8px;
                width: 100%;
                background: transparent;
            }
            div.sc-digitbutton-data{
                position: absolute;
                left: 0;
                bottom: 0;
                width: 100%;
                height: calc(100% - 42px);
                background: transparent;
                color: var(--tile-on-name-text-color, rgba(0, 0, 0, 0.60)) !important;
            }
            div.sc-button-name, div.sc-digitbutton-name{
                margin: 0 8px;
                font-weight: 400;
                width: 90%;
                overflow:hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                color: var(--tile-on-name-text-color, rgba(0, 0, 0, 0.60));
            }
            div.sc-button-value, div.sc-digitbutton-value{
                margin: 0 8px;  
                width: 85%;
                font-weight: 500;
                text-align:right;
                overflow:hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            div.sc-digitbutton-value{
                font-weight: 400;
                text-align:center;
                vertical-align:top;
                font-size: 2.2em;
                line-height:2.3em;
            }
            div.sc-digitbutton-value span{
                font-size: 0.45em;
                vertical-align: top;
                display: inline-block;
                position: relative;
                top: -7px;
                left: 4px;
            }
            div.sc-digitbutton-name{
                position:relative;
                bottom:8px;
                font-size: 0.8em;
            }
            div.sc-button-date{
                margin: 0 8px;  
                text-align: right;
                width: 85%;
                overflow:hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                font-size: 0.85em;
            }
            .circle-state {
                stroke-dasharray: calc((251.2 / 100) * var(--percentage)), 251.2;
                position:absolute;
                margin:0;
                top:10px;
                right:10px;
                width: 40px;
                height: 40px;
                cursor: pointer;
            }
            div.sc-button .icon {
                display:block;
                height: calc(var(--tile-icon-size, 30px) + 10px);
                width: calc(var(--tile-icon-size, 30px) + 10px);
                color: var(--tile-icon-color, rgba(0, 0, 0, 0.3));
                font-size: var(--tile-icon-size, 30px);
                --mdc-icon-size: var(--tile-icon-size, 30px);
                transform-origin: 50% 50%;
                line-height: calc(var(--tile-icon-size, 30px) + 10px);
                text-align: center;
                pointer-events: none;
                position: absolute;
                top: 8px;
                left:8px;
            }
            div.sc-button .icon.on {
                color: var(--tile-on-icon-color, #f7d959);
            }
            div.sc-button .icon.off {
                color: var(--tile-icon-color, rgba(0, 0, 0, 0.3));
            }
            div.sc-button .icon.image{
                position: relative;
                top: 0;
                left: 0;
                width: 42px;
                border-radius: var(--tile-image-radius, 100%);
            }
            div.sc-button .icon ha-icon {
                width:30px;
                height:30px;
                pointer-events: none;
            }
            @media (min-width: 481px) and (max-width: 767px) {
                div.sc-button{
                    transform: scale(0.90);
                    margin: -0.3em;
                }
            }
            @media (min-width: 320px) and (max-width: 480px){
                div.sc-button{
                    transform: scale(0.70);
                    margin: -1.10em;
                }
            }
        `;
        this.parentNode.append(_style);
        return true;
    }

    /**
     * calculate the update time
     * @param {*} lastUpdated
     */
    _calculateTime(lastUpdated) {
        const currentDate = new Date();
        const lastDate = new Date(lastUpdated);
        const diffMs = currentDate.getTime() - lastDate.getTime();
        const diffDays = Math.floor(diffMs / 86400000); // days
        const diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
        const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
        const diffSecs = Math.round((((diffMs % 86400000) % 3600000) % 60000) / 1000);
        if (diffDays > 0) {
            return diffDays + " d";
        } else if (diffHrs > 0) {
            return diffHrs + " h";
        } else if (diffMins > 0) {
            return diffMins + " m";
        } else {
            return diffSecs + " s";
        }
    }
    /**
     * check the butto state
     * @param {*} _button
     * @param {*} button_data
     */
    _checkButtonState(_button, button_data) {
        this.buttonstate = {
            status: ["off", "unavailable"].includes(button_data.value) ? "off" : "on"
        };
        if (this.buttonstate.status === "off") {
            _button.classList.add("off");
        } else {
            _button.classList.remove("off");
        }
    }

    /**
     * render state circle for a sensor
     * @param {*} ent
     * @param {*} stateObj
     * @param {*} type
     */
    renderCircleState(button_data) {
        return `
            <svg id="${button_data.id}C" class="circle-state"
                viewbox="0 0 100 100"
                style="${
                    button_data.brightness && !button_data.state ? "--percentage:" + button_data.brightness / 2.55 : ""
                }"
            >
                <path
                    id="progress"
                    stroke-width="3"
                    stroke="#aaabad"
                    fill="none"
                    d="M50 10
                    a 40 40 0 0 1 0 80
                    a 40 40 0 0 1 0 -80"
                ></path>
                <text id="id="${
                    button_data.id
                }IT'" x="50" y="50" fill="#7d7e80" text-anchor="middle" dy="7" font-size="20">
                    ${
                        button_data.brightness && this.buttonstate.status === "on"
                            ? (button_data.brightness / 2.55).toFixed(0) + "%"
                            : button_data.circle
                    }
                </text>
            </svg>
        `;
    }

    /**
     * render digit button content
     * @param {*} _button
     * @param {*} button_data
     */
    renderDigitButton(_button, button_data) {
        this._checkButtonState(_button, button_data);
        let html = [];
        if (button_data.image) {
            html.push(`<img class="icon image" src="${button_data.image}" alt="" />`)
        } else {
            html.push(
                `<ha-icon id="${button_data.id}I" class="icon ${this.buttonstate.status}" icon="${button_data.icon}"></ha-icon>`
            );
        }
        html.push(`${this.renderCircleState(button_data)}`);
        html.push(`<div class="sc-digitbutton-data">  
                    <div id="${button_data.id}V" class="sc-digitbutton-value">${button_data.value}
                        <span>${button_data.unit}<span>
                    </div>
                    <div class="sc-digitbutton-name">${button_data.name.toUpperCase()}</div>
                   </div>
        `);
        _button.innerHTML = html.join("");
    }

    /**
     * render the default button content
     * with the data from the current entity
     *
     * @param {*} _button
     * @param {*} button_data
     * @called renderbuttons, updatebuttons
     */
    renderDefaultButton(_button, button_data) {
        this._checkButtonState(_button, button_data);
        let html = [];
        if (button_data.image) {
            html.push(`<img class="icon image img" src="${button_data.image}" alt="" />`)
        } else {
            html.push(
                `<ha-icon id="${button_data.id}I" class="icon ${this.buttonstate.status}" icon="${button_data.icon}"></ha-icon>`
            );
        }
        html.push(`${this.renderCircleState(button_data)}`);
        html.push(`
          <div class="sc-button-data">  
          <div class="sc-button-name">${button_data.name.toUpperCase()}</div>
          <div id="${button_data.id}V" class="sc-button-value">${button_data.value} ${button_data.unit}</div>
          <div id="${button_data.id}D" class="sc-button-date">${button_data.date}</div>
          </div>
        `);
        _button.innerHTML = html.join("");
    }

    /**
     * get Button data
     * @param {*} entity
     */
    getButtonData(entity) {
        if (!entity) return null;
        const _entityType = entity.entity_id.split(".")[0] || "alert";
        const _entityName = entity.entity_id.split(".")[1];
        const h = this.hassEntities.find((x) => x.entity_id === entity.entity);
        return {
            id: entity.entity_id,
            name: entity.name || _entityName || entity.attributes.name || entity.entity_id,
            type: _entityType,
            value: localValue(entity.state, this.locale) || "",
            unit: entity.unit || entity.attributes.unit_of_measurement || "",
            valuetype: entity.type || typeof entity.state,
            date: localDatetime(entity.last_updated, this.locale) || "",
            circle: this._calculateTime(entity.last_updated) || "",
            icon: entity.icon || entity.attributes.icon || HASS_ICONS[_entityType] || HASS_ICONS["default"],
            status: this.buttonstate.status || "off",
            brightness: h && h.attributes ? h.attributes.brightness : null,
            rgb_color: h && h.attributes ? h.attributes.rgb_color : null,
            xy_color: h && h.attributes ? h.attributes.xy_color : null,
            image: entity.image || null
        };
    }

    /**
     * call homeassistant service action
     * @param {*} state
     * @param {*} service
     */
    _toggle(state, service) {
        if (!this.hass) return;
        this.hass.callService("homeassistant", service || "toggle", {
            entity_id: state.entity_id
        });
    }

    /**
     * fire the detail event to show the more-info data
     * @param {*} type
     * @param {*} detail
     */
    _fire(type, detail) {
        const event = new Event(type, {
            bubbles: true,
            cancelable: false,
            composed: true
        });
        event.detail = detail || {};
        this.shadowRoot.dispatchEvent(event);
        return event;
    }

    /**
     * get the hass-more-info on click
     * @param {*} entity
     */
    _clickAction(entity) {
        this._fire("hass-more-info", {
            entityId: entity
        });
    }

    /**
     * check and update the buttons
     * if the last_updated has changed, set the
     * new values from the hass hassEntities and update the button content.
     *
     */
    updateButtons() {
        this.entities.forEach((entity, index) => {
            const h = this.hassEntities.find((x) => x.entity_id === entity.entity);
            const button_data = this.getButtonData(entity);
            if (entity.last_updated !== h.last_updated || button_data.type === "light") {
                if (button_data.type === "light") {
                    button_data.brightness = h.attributes.brightness || null;
                    button_data.rgb_color = h.attributes.rgb_color || null;
                    button_data.xy_color = h.attributes.xy_color || null;
                }
                button_data.value = localValue(h.state, this.locale) || "";
                button_data.date = localDatetime(h.last_updated, this.locale) || "";
                button_data.circle = this._calculateTime(h.last_updated) || "";
                const _button = this.buttonslist[entity.entity_id];
                switch (entity.type) {
                    case "digitbutton":
                        this.renderDigitButton(_button, button_data);
                        break;
                    default:
                        this.renderDefaultButton(_button, button_data);
                }
            }
        });
    }

    /**
     * create or update the buttons
     * get the button data from the entities and add the
     * button with the current data to the button layer.
     */
    renderButtons() {
        this.entities.forEach((entity, index) => {
            const button_data = this.getButtonData(entity);
            if (button_data) {
                // create the button
                const _button = document.createElement("div");
                _button.setAttribute("class", "sc-button buttons on");
                _button.id = entity.entity_id;
                if (entity.style) {
                    _button.style.cssText = entity.style.replaceAll("\n", "");
                }
                if (button_data.value === localValue(entity.last_updated, this.locale)) {
                    button_data.value = entity.text || "Status";
                    button_data.unit = "";
                }
                switch (entity.type) {
                    case "digitbutton":
                        this.renderDigitButton(_button, button_data);
                        break;
                    default:
                        this.renderDefaultButton(_button, button_data);
                }
                if (this.shadowRoot) _button.onclick = this._clickAction.bind(this, entity.entity_id);
                this.buttonslist[_button.id] = _button;
                // add the button to the layer
                this.button_layer.append(_button);
            }
        });
    }

    /**
     * render all defined buttons
     * get all defined entities and render the buttons
     */
    render() {
        if (this.entities && this.entities.length && this.parentNode) {
            this.button_layer = document.createElement("div");
            this.button_layer.setAttribute("class", "sc-buttons clearfix");
            this.set_buttonstyle();
            this.update = false;
            this.renderButtons();
            this.parentNode.append(this.button_layer);
        }
    }
}

/**
 * simple clock class
 * @call:
 *   o = new simpleClock({
 *        parentNode: this.content,
 *        locale: this.locale,
 *       })
 */

class simpleClock {
    /**
     * constructor for simple clock
     * @param {*} config 
     */
    constructor(config) {
        this.parentNode = config.parentNode;
        this.locale = config.locale;
        this.options = config.clockoptions;

        this.clocklayer = null;
        if (this.parentNode) {
            this.addClockLayer();
        }
    }

    /**
     * css styles for simple clock 
     */
    set_clockstyle() {
        if(! this.clocklayer) return false;
        const _style = document.createElement("style");
        _style.textContent = `
            .sc-clock{
                position:relative;  
                text-align: center;
                width: 100%;
                padding-top: 1em;
                margin: 0 auto;
                letter-spacing: 0.1em;
            }  
            .sc-time {
                font-size: 3.0em;
                line-height: 1em;
                letter-spacing: 0.1em;
            }
            .sc-date {
                ext-transform: uppercase;
                font-size: 1.3em;
                font-weight: 400;
                line-height: 1.5em;
                margin-bottom: 1em;
            }
            `;
            this.parentNode.append(_style);
        return true;
    }

    /**
     * create the simple clock layer
     */
    addClockLayer() {
        if (!this.clocklayer) {
            this.clocklayer = document.createElement("div");
            this.clocklayer.setAttribute("class", "sc-clock");
            this.set_clockstyle() 
            this.parentNode.appendChild(this.clocklayer);
        }
        this.setClockTime();
        setInterval(this.setClockTime.bind(this), 60 * 1000);
    }

    /**
     * simple clock date and time
     */
    setClockTime() {
        this.options = this.options || { weekday: "short", month: "short", day: "numeric" };
        let today = new Date(),
            h = today.getHours(),
            m = today.getMinutes();
        const _date = today.toLocaleDateString(this.locale, this.options).replaceAll(".", "");
        m = m < 10 ? "0" + m : m;
        this.clocklayer.innerHTML = `<div class="sc-time">${h}:${m}</div><div class="sc-date">${_date}</div>`;
    }
}

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

"use strict";

const appinfo = {
    name: "✓ custom:simple-card",
    version: "0.0.6",
    assets: '/hacsfiles/ha-simple-card/assets/'
};
console.info(
    "%c " + appinfo.name + "     %c ▪︎▪︎▪︎▪︎ Version: " + appinfo.version + " ▪︎▪︎▪︎▪︎ ",
    "color:#FFFFFF; background:#3498db;display:inline-block;font-size:12px;font-weight:200;padding: 4px 0 4px 0",
    "color:#2c3e50; background:#ecf0f1;display:inline-block;font-size:12px;font-weight:200;padding: 4px 0 4px 0"
);

class SimpleCard extends HTMLElement {
    /**
     * constructor
     */
    constructor() {
        super();
        this.attachShadow({
            mode: "open"
        });
        this._initialized = false;
        this.entities = [];
        this.logenabled = true;
    }

    /**
     * show info
     * @param {*} args
     */
    logInfo(...args) {
        if (this.logenabled) console.info(new Date().toISOString(), appinfo.name, ...args);
    }

    /**
     * set the hass entities
     */
    setHassEntities() {
        if (!this._hass) return;
        this.hassEntities = this.entities
            .map((x) => this._hass.states[x.entity])
            .filter((notUndefined) => notUndefined !== undefined);
    }

    /**
     * hass
     */
    set hass(hass) {
        if (hass === undefined) return;
        if (!this._initialized) return;

        this._hass = hass;

        this.setHassEntities();

        if (this.buttons && this.mode === "buttons") {
            this.buttons.hass = this._hass;
            this.buttons.hassEntities = this.hassEntities;
            if (this.buttons.intialized === false && this.entities) {
                this.buttons.updateButtons();
            }
        }

        this.updateData();

        if (this.skipRender) return;

        if (!this.init) {
            this.init = true;
            this.entities = [];
            if (this.mode === "buttons") {
                for (let x of this._config.entities) {
                    if (this._hass.states[x.entity]) {
                        let _entity = { ...this._hass.states[x.entity], ...x };
                        this.entities.push(_entity);
                    }
                }
            }
            if (!this.card) this.createCard();
        }

        this.skipRender = true;
    }

    /**
     * update data
     */
    updateData() {
        if (this.mode && this._hass && this.entities) {
            // reload the hass entities

            switch (this.mode) {
                case "buttons":
                    if (this.buttons && this.hassEntities && this.hassEntities.length) {
                        this.buttons.hassEntities = this.hassEntities;
                        this.buttons.updateButtons();
                    }
                    break;
                default:
            }
        }
    }

    /**
     * add inline css
     */
    addCss() {
        const _style = document.createElement("style");
        _style.setAttribute("id", "sc-" + this.id);
        _style.textContent = `
          .ha-simplecard-buttons{
              position: relative;
              background: transparent;
          }
          .sc-icon{
            position: relative;
            top: -3px;
            padding-right: 6px;
            color: var(--primary-text-color)
          }
          h2.sc-title{
            font-size: 1.75em;
            font-weight: 500;
            padding-top: 1em;
            width: 95%;
            overflow:hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            display: inline-block;
            margin: 0 0 0.5em 0.5em;
            color: var(--primary-text-color)
          }
          p.sc-text{
            font-size: 1.2em;
            font-weight: 300;
            margin: 0 1.5em;
          }
          @media (min-width: 481px) and (max-width: 767px) {
            h2.sc-title{
              margin: 0 0 0.5em 0; 
              font-size: 1.5em;
            }
            p.sc-text{
                font-size: 1.1em;
            }
         }
         @media (min-width: 320px) and (max-width: 480px){
            h2.sc-title{
                margin: 0 0 0.5em 0; 
                font-size: 1.5em;
            }
            p.sc-text{
                font-size: 1.1em;
            }
         }
        `;
        this.root.append(_style);
        return true;
    }

    /**
     * create the card content
     * @param {*} content
     */
    createCardContent(content) {
        if (!content) return;
        if (this._config.title) {
            // add the title and the icon to the ha-card
            const _title = document.createElement("h2");
            _title.setAttribute("class", "sc-title");
            if (this._config.icon) {
                const iconel = document.createElement("ha-icon");
                iconel.setAttribute("icon", this._config.icon);
                iconel.setAttribute("class", "sc-icon");
                iconel.style.cssText = "--mdc-icon-size: 1.2em";
                _title.appendChild(iconel);
                const view_titletext = document.createElement("span");
                view_titletext.innerHTML = this._config.title;
                _title.appendChild(view_titletext);
            } else {
                _title.innerHTML = this._config.title;
            }
            content.appendChild(_title);
        }

        if (this._config.clock) {
            // add the simple clock
            const cardClock = new simpleClock({
                parentNode: content,
                locale: this.locale
            });
        }

        if (this.mode == "buttons") {
            // add buttons
            this.buttons = new buttons({
                hass: this._hass,
                shadowRoot: this.shadowRoot,
                parentNode: content,
                entities: this.entities,
                hassEntities: this.hassEntities,
                locale: this.locale
            });
        }

        if (this._config.text) {
            // add content text
            let _text = document.createElement("p");
            _text.setAttribute("class", "sc-text");
            if (this._config.icon) {
                _text.style.cssText = "margin-left: 2.8em;";
            }
            _text.innerHTML = this._config.text;
            content.appendChild(_text);
        }
    }

    /**
     * create the card
     * @called for set hass
     */
    createCard() {
        const eId = Math.random().toString(36).substr(2, 9);
        this.id = "card-" + eId;
        this.card = document.createElement("ha-card");
        this.card.setAttribute("class", "ha-simplecard");
        if (this.mode == "buttons") {
            this.card.setAttribute("class", "ha-simplecard-buttons");
            this.card.style.boxShadow = "none";
            this.card.style.borderRadius = "0";
        }
        this.addCss();
        const content = document.createElement("div");
        content.id = "content-" + eId;
        content.style.height = content.style.minHeight = this.height + "px";

        this.createCardContent(content);
        this.card.appendChild(content);
        this.root.appendChild(this.card);
        this.setAttribute("title", "");
    }

    /**
     * method returns an array containing the canonical locale names.
     * Duplicates will be omitted and elements will be
     * validated as structurally valid language tags.
     * @param {string} locale
     */
    _checkLocale(locale) {
        try {
            Intl.getCanonicalLocales(locale);
        } catch (err) {
            console.error(" RangeError: invalid language tag:", _this.config);
            return navigator.language || navigator.userLanguage;
        }
        return locale;
    }

    /**
     * get the config from the lovelace file settings
     * @param {*} config
     */
    setConfig(config) {
        this.root = this.shadowRoot;
        if (!this._config) {
            this._config = config;
            this.id = Math.random().toString(36).substr(2, 9);
            const _browserlocale = navigator.language || navigator.userLanguage || "en-GB";
            this.locale = config.locale || _browserlocale;
            this._checkLocale();
            this.entities = [];
            this.logenabled = config.logger || true;
            this.height = this._config.height || "100%";
            this.title = this._config.title;
            this.text = this._config.text;
            this.mode = this._config.mode;
            this.skipRender = false;
            this.entities = [];
            this.hassEntities = [];
            this.loginfo_enabled = true;
            this._initialized = true;
        }
    }

    /**
     * The height of your card. Home Assistant uses this to automatically
     * distribute all cards over the available columns.
     */
    getCardSize() {
        return 3;
    }
}

customElements.define("simple-card", SimpleCard);

/** --------------------------------------------------------------------

  simple card structure
  
  - type: 'simple-card'
    title: text
    icon: 'mdi:home'
    mode: buttons|clock|simple 
    entities:  
      - entity: optional
/** -------------------------------------------------------------------*/
