/**
 * simple day state card class
 * @call:
 *   o = new dayStateCard({
 *        parentNode: this.content,
 *        locale: this.locale,
 *        hass: this._hass,
 *        entities: null,
 *       })
 */

class dayStateCard {
    /**
     * constructor for simple clock
     * @param {*} config
     */
    constructor(config) {
        this.parentNode = config.parentNode;
        this.locale = config.locale;
        this.hass = config.hass;
        // internal
        this.entities = config.entities;
        this.moon = null;
        this.sun = null;
        this.cardlayer = null;
        this._config();
    }

    /**
     * day card config
     */
    _config() {
        if (this.hass && this.hass.states) {
            if (this.hass.states["sun.sun"]) {
                this.sun = this.hass.states["sun.sun"];
                this.sun.assets = appinfo.assets + "sun/";
            }
            if (this.hass.states["sensor.moon"]) {
                this.moon = this.hass.states["sensor.moon"];
                this.moon.assets = appinfo.assets + "moon/";
                this.moon.phase = this._getMoonPhase(this.hass.states["sensor.moon"].state);
                this.moon.icon = this.moon.assets + this.moon.phase + ".png";
            }
            this._createCardLayer();
        }

        // render the layer
    }
    /**
     * create the simple clock layer
     */
    _createCardLayer() {
        if (!this.cardlayer) {
            this.cardlayer = document.createElement("div");
            this.cardlayer.setAttribute("class", "sc-daystate");
            this.parentNode.appendChild(this.cardlayer);
            this.update();
        }
    }

    _getMoonPhase(phase) {
        switch (phase) {
            case "new_moon":
                return "New Moon";
            case "waxing_crescent":
                return "Waxing Crescent Moon";
            case "first_quarter":
                return "First Quarter Moon";
            case "waxing_gibbous":
                return "Waxing Gibbous Moon";
            case "full_moon":
                return "Full Moon";
            case "waning_gibbous":
                return "Waning Gibbous Moon";
            case "last_quarter":
                return "Last Quarter Moon";
            case "waning_crescent":
                return "Waning Crescent Moon";
            default:
                return "";
        }
    }

    /** update the moon status */
    update() {
        if (this.cardlayer) {
            const html = [];
            if (this.moon) {
                html.push(`
                    <div class="header">
                        <div class="title">CURRENT PHASE</div>
                        <div class="date">${localDatetime(new Date(), this.locale)}</div>
                    </div>
                    <div class="content">
                        <img src="${this.moon.icon}" class="img" alt="${this.moon.phase}">
                        <span class="name">${this.moon.phase}</span>
                    </div>`);
            }
            if (html.length) {
                this.cardlayer.innerHTML = html.join(" ");
            }
        }
    }
}
