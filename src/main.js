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
