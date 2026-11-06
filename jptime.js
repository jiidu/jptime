/*!
 * JPTime 1.0.0 – ikuinen Suomen kesäaika (UTC+3, ei kellojen siirtelyä).
 * Käyttö: <script src="https://<käyttäjä>.github.io/jptime/jptime.js"></script>
 * Tarjoaa globaalin JPTime-olion ja <jp-time>-elementin.
 */
(function (root) {
  "use strict";

  var OFFSET_HOURS = 3;
  var OFFSET_MS = OFFSET_HOURS * 3600000;
  var WEEKDAYS = ["sunnuntai", "maanantai", "tiistai", "keskiviikko", "torstai", "perjantai", "lauantai"];
  var MONTHS = ["tammikuuta", "helmikuuta", "maaliskuuta", "huhtikuuta", "toukokuuta", "kesäkuuta",
    "heinäkuuta", "elokuuta", "syyskuuta", "lokakuuta", "marraskuuta", "joulukuuta"];

  function pad(n, len) { n = String(n); while (n.length < (len || 2)) n = "0" + n; return n; }

  function toMs(d) {
    if (d == null) return Date.now();
    if (d instanceof Date) return d.getTime();
    if (typeof d === "number") return d;
    var t = new Date(d).getTime();
    if (isNaN(t)) throw new TypeError("JPTime: tuntematon aika: " + d);
    return t;
  }

  // EU-sääntö: kesäaika alkaa maaliskuun viimeisenä sunnuntaina 01.00 UTC
  // ja päättyy lokakuun viimeisenä sunnuntaina 01.00 UTC.
  function lastSundayUTC(year, month) {
    var d = new Date(Date.UTC(year, month + 1, 0, 1, 0, 0));
    d.setUTCDate(d.getUTCDate() - d.getUTCDay());
    return d.getTime();
  }

  function finlandOffsetHours(d) {
    var ms = toMs(d);
    var y = new Date(ms).getUTCFullYear();
    return (ms >= lastSundayUTC(y, 2) && ms < lastSundayUTC(y, 9)) ? 3 : 2;
  }

  function parts(d) {
    var j = new Date(toMs(d) + OFFSET_MS);
    return {
      year: j.getUTCFullYear(),
      month: j.getUTCMonth() + 1,
      day: j.getUTCDate(),
      hours: j.getUTCHours(),
      minutes: j.getUTCMinutes(),
      seconds: j.getUTCSeconds(),
      milliseconds: j.getUTCMilliseconds(),
      weekday: j.getUTCDay(),
      weekdayName: WEEKDAYS[j.getUTCDay()],
      monthName: MONTHS[j.getUTCMonth()]
    };
  }

  /**
   * Muotoilee ajan JPTimessa.
   * Merkit: YYYY MMMM MM M DD D dddd HH H mm ss zz Z, ja [teksti] sellaisenaan.
   */
  function format(d, pattern) {
    var p = parts(d);
    return String(pattern || "HH:mm:ss").replace(
      /\[([^\]]*)\]|YYYY|MMMM|MM|M|DD|D|dddd|HH|H|mm|ss|zz|Z/g,
      function (tok, literal) {
        if (literal !== undefined) return literal;
        switch (tok) {
          case "YYYY": return String(p.year);
          case "MMMM": return p.monthName;
          case "MM": return pad(p.month);
          case "M": return String(p.month);
          case "DD": return pad(p.day);
          case "D": return String(p.day);
          case "dddd": return p.weekdayName;
          case "HH": return pad(p.hours);
          case "H": return String(p.hours);
          case "mm": return pad(p.minutes);
          case "ss": return pad(p.seconds);
          case "zz": return "JPT";
          case "Z": return "+03:00";
        }
        return tok;
      });
  }

  function toISOString(d) {
    var p = parts(d);
    return format(d, "YYYY-MM-DD[T]HH:mm:ss") + "." + pad(p.milliseconds, 3) + "+03:00";
  }

  function nextFinnishClockChange(d) {
    var ms = toMs(d);
    var y = new Date(ms).getUTCFullYear();
    var c = [lastSundayUTC(y, 2), lastSundayUTC(y, 9), lastSundayUTC(y + 1, 2)];
    for (var i = 0; i < c.length; i++) if (c[i] > ms) return new Date(c[i]);
    return null;
  }

  function now(d) {
    var ms = toMs(d);
    var fo = finlandOffsetHours(ms);
    return {
      iso: toISOString(ms),
      time: format(ms, "HH:mm:ss"),
      date: format(ms, "D.M.YYYY"),
      timestamp: ms,
      offset: "+03:00",
      abbreviation: "JPT",
      parts: parts(ms),
      finland: {
        offset: "+0" + fo + ":00",
        abbreviation: fo === 3 ? "EEST" : "EET",
        isSummerTime: fo === 3
      },
      aheadOfFinlandHours: OFFSET_HOURS - fo,
      nextFinnishClockChange: nextFinnishClockChange(ms).toISOString()
    };
  }

  /** Kutsuu callbackia joka sekunnin vaihteessa. Palauttaa funktion, joka pysäyttää kutsut. */
  function watch(callback) {
    var timer = null, stopped = false;
    function loop() {
      if (stopped) return;
      callback(now());
      timer = setTimeout(loop, 1000 - (Date.now() % 1000) + 5);
    }
    loop();
    return function stop() { stopped = true; clearTimeout(timer); };
  }

  var JPTime = {
    version: "1.0.0",
    offsetHours: OFFSET_HOURS,
    offset: "+03:00",
    abbreviation: "JPT",
    now: now,
    parts: parts,
    format: format,
    toISOString: toISOString,
    finlandOffsetHours: finlandOffsetHours,
    nextFinnishClockChange: nextFinnishClockChange,
    watch: watch
  };

  // <jp-time format="HH:mm"></jp-time>
  if (typeof root.customElements !== "undefined" && typeof root.HTMLElement !== "undefined"
      && !root.customElements.get("jp-time")) {
    var elements = new Set();
    var stopShared = null;
    var render = function (el) { el.textContent = format(Date.now(), el.getAttribute("format") || "HH:mm:ss"); };
    var JpTimeElement = function () { return Reflect.construct(root.HTMLElement, [], JpTimeElement); };
    JpTimeElement.prototype = Object.create(root.HTMLElement.prototype);
    JpTimeElement.prototype.constructor = JpTimeElement;
    Object.setPrototypeOf(JpTimeElement, root.HTMLElement);
    Object.defineProperty(JpTimeElement, "observedAttributes", { get: function () { return ["format"]; } });
    JpTimeElement.prototype.connectedCallback = function () {
      if (!this.hasAttribute("role")) this.setAttribute("role", "timer");
      elements.add(this);
      render(this);
      if (!stopShared) stopShared = watch(function () { elements.forEach(render); });
    };
    JpTimeElement.prototype.disconnectedCallback = function () {
      elements.delete(this);
      if (elements.size === 0 && stopShared) { stopShared(); stopShared = null; }
    };
    JpTimeElement.prototype.attributeChangedCallback = function () { if (this.isConnected) render(this); };
    root.customElements.define("jp-time", JpTimeElement);
  }

  if (typeof module === "object" && module.exports) module.exports = JPTime;
  else root.JPTime = JPTime;
})(typeof window !== "undefined" ? window : globalThis);
