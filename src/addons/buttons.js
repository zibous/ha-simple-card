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
            html.push(`<img class="icon image" src="${button_data.image}" alt="" />`);
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
            html.push(`<img class="icon image img" src="${button_data.image}" alt="" />`);
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
     * Translate the state value
     * TODO: find a better way to translate values...
     * @param {string} key
     * @param {string} value
     */
    tranlate(key, value) {
        // const key = "state." + _entityName + "." + entity.state
        // this.hass.resources[this.hass.language]["state.person.home"]
        console.log(key)
        const lang = this.hass.selectedLanguage || this.hass.language;
        const resources = this.hass.resources[lang] || "de";
        return resources && resources[key] ? resources[key] : value;
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
        // try to translate...
        // if (entity.state.constructor === String) {
        //    entity.state = this.tranlate("state." + _entityName + "." + entity.state, entity.state);
        // }
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
