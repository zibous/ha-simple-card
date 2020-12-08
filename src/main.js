"use strict";

const appinfo = {
    name: "✓ custom:simple-card",
    version: "0.0.7",
    assets: "/hacsfiles/ha-simple-card/assets/"
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
     * get attributes for the entities card
     * credits: https://github.com/custom-cards/entity-attributes-card
     * @param {*} hass
     * @param {*} filters
     */
    _getAttributes(hass, filters) {
        function _filterName(stateObj, pattern) {
            let parts;
            let attr_id;
            let attribute;
            if (typeof pattern === "object") {
                parts = pattern["key"].split(".");
                attribute = pattern["key"];
            } else {
                parts = pattern.split(".");
                attribute = pattern;
            }
            attr_id = parts[2];
            if (attr_id.indexOf("*") === -1) {
                return stateObj == attribute;
            }
            const regEx = new RegExp(`^${attribute.replace(/\*/g, ".*")}$`, "i");
            return stateObj.search(regEx) === 0;
        }
        const attributes = new Map();
        filters.forEach((filter) => {
            const filters = [];
            filters.push((stateObj) => _filterName(stateObj, filter));
            Object.keys(hass.states)
                .sort()
                .forEach((key) => {
                    Object.keys(hass.states[key].attributes)
                        .sort()
                        .forEach((attr_key) => {
                            if (filters.every((filterFunc) => filterFunc(`${key}.${attr_key}`))) {
                                attributes.set(`${key}.${attr_key}`, {
                                    name: filter.name ? filter.name : attr_key.replace(/_/g, " "),
                                    value: hass.states[key].attributes[attr_key],
                                    unit: filter.unit || "",
                                    icon: filter.icon || ""
                                });
                            }
                        });
                });
        });
        return Array.from(attributes.values());
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
                case "entities_card":
                    if (this.attibutesfilter && this.attibutesfilter.include) {
                        let attributes = this._getAttributes(this._hass, this.attibutesfilter.include);
                        if (this.attibutesfilter.exclude) {
                            const excludeAttributes = this._getAttributes(this._hass, this.attibutesfilter.exclude).map(
                                (attr) => attr.name
                            );
                            attributes = attributes.filter((attr) => {
                                return !excludeAttributes.includes(attr.name);
                            });
                        }
                        this.updateDataTable(this.root.getElementById("entities_card"), attributes);
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
            color: var(--primary-text-color)
          }
          h2.sc-title{
            font-size: 1.75em;
            font-weight: 500;
            padding-top: 1em;
            padding-left: 6px;
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
          div.dt-data{
            width: 100%;
            height:100%;
            overflow:scroll;
          }
          table.dt-data {
            width: 100%;
            height: 100%;
            padding: 0 1.5em 1em 1.2em;
            line-height: 1.8em;
          }
          table.dt-data td.dt-name{
            text-align:left;
            font-weight:400;
          }
          table.dt-data td.dt-value{
            text-align:right;
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
                padding-left: 6px;
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
     * update all entity attributtes for the datatable
     * @param {*} element
     * @param {*} attributes
     */
    updateDataTable(element, attributes) {
        if (!element || !attributes) return;
        element.innerHTML = `
            ${attributes
                .map(
                    (attribute) => `
              <tr>
                <td class="dt-name">${(attribute.icon)?'<ha-icon icon="' + attribute.icon + '" ></ha-icon>':''}${attribute.name}</td>
                <td class="dt-value">${localValue(attribute.value, this.locale)}${attribute.unit}</td>
              </tr>
            `
                )
                .join("")}
          `;
    }

    /**
     * create the card content
     * @param {*} content
     */
    createCardContent(content) {
        if (!content) return;

        const useLayer = this.height!='100%';
        let contentLayer = null;

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
                _title.style.cssText = "margin-left:0.8em !important";
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

        if(useLayer){
            contentLayer = document.createElement("div");
            contentLayer.setAttribute("class", "sc-layer");
            contentLayer.style.cssText = `height:${this.height-100}px;widht:100%;overflow:auto;`;
        }

        if (this._config.text) {
            // add content text
            let _text = document.createElement("p");
            _text.setAttribute("class", "sc-text");
            if (this._config.icon) {
                _text.style.cssText = "margin-left: 2.8em;";
            }
            _text.innerHTML = this._config.text;
            if(useLayer && contentLayer){
                contentLayer.append(_text);
            }else{
                content.appendChild(_text);
            }
        }

        if (this.mode == "entities_card") {
            // add datatable for then entities_card
            const datatable = document.createElement("div");
            datatable.setAttribute("class", "dt-data");
            datatable.innerHTML = `
                <table class="dt-data">
                    <tbody id="entities_card">
                    </tbody>
                </table>
            `;
            if(useLayer && contentLayer){
                contentLayer.append(datatable);
            }else{
                content.appendChild(datatable);
            }
        }
        if(useLayer && contentLayer){
            content.appendChild(contentLayer);
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
        this.style.cssText = "height:100%;width:100%;display:grid";
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
        if (this.root.lastChild) this.root.removeChild(root.lastChild);
        if (!this._config) {
            // this._config = Object.assign({}, config);
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
            if (!["buttons", "entities_card"].includes(this.mode)) {
                this.mode = "default";
            }
            // attribute datatable
            this.attibutesfilter = this._config.filter || null;
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
