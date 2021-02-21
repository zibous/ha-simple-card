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
        this.parentNode = config.parentNode
        this.locale = config.locale
        this.options = config.clockoptions

        this.clocklayer = null
        if (this.parentNode) {
            this.addClockLayer()
        }
    }

    /**
     * css styles for simple clock
     */
    set_clockstyle() {
        if (!this.clocklayer) return false
        const _style = document.createElement("style")
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
            `
        this.parentNode.append(_style)
        return true
    }

    /**
     * create the simple clock layer
     */
    addClockLayer() {
        if (!this.clocklayer) {
            this.clocklayer = document.createElement("div")
            this.clocklayer.setAttribute("class", "sc-clock")
            this.set_clockstyle()
            this.parentNode.appendChild(this.clocklayer)
        }
        this.setClockTime()
        setInterval(this.setClockTime.bind(this), 60 * 1000)
    }

    /**
     * simple clock date and time
     */
    setClockTime() {
        this.options = this.options || { weekday: "short", month: "short", day: "numeric" }
        let today = new Date(),
            h = today.getHours(),
            m = today.getMinutes()
        const _date = today.toLocaleDateString(this.locale, this.options).replaceAll(".", "")
        m = m < 10 ? "0" + m : m
        this.clocklayer.innerHTML = `<div class="sc-time">${h}:${m}</div><div class="sc-date">${_date}</div>`
    }
}
