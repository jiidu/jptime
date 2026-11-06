# JPTime

*[Suomeksi](README.md) · In English*

**JPTime is permanent Finnish summer time: UTC+3 all year round, with no clock changes.**

The repository contains four files:

- `index.html` is the clock page.
- `jptime.js` is the API for adding JPTime to your own site.
- `README.md` is the Finnish version of this guide.
- `README.en.md` is this guide.

The page shows the current time in JPTime and compares it with official Finnish time and UTC. It also tells you whether the two clocks currently agree and when that will next change.

Below the clock is a living Finnish summer landscape: a wooden jetty, weeping birches swaying in the wind, drifting leaves and a glittering lake. The light theme is a July afternoon and the dark theme is the midnight sun. If the device is set to reduce motion, the landscape stays still.

The page is available in Finnish and English. Switch the language with the FI/EN toggle in the top right corner. The page remembers your choice, and you can link straight to the English page by adding `#en` to the end of the address. On a first visit, the page picks the language based on the browser's language.

The page needs no build step. Its only external dependency is Google Fonts. If the fonts fail to load, the page falls back to system fonts.

## Why JPTime?

Because changing the clocks is pointless.

The clocks change twice a year. It saves nothing, and it disrupts everything else:

- **People** sleep badly for days after the change. Mornings feel wrong, and calendars, reminders and meeting times easily get mixed up.
- **Dogs** know nothing about daylight saving time. A dog's internal clock says when it is time for a walk and when it is time to eat. When the humans' clock jumps by an hour, the dog either has to wait or gets woken too early, and neither of them understands why.

The EU decided back in 2019 to stop changing the clocks. The clocks still change, because the member states have not agreed on which time to keep.

JPTime does not wait. It chooses summer time and stays there:

| | Official Finnish time | JPTime |
|---|---|---|
| Summer | UTC+3 (EEST) | UTC+3 |
| Winter | UTC+2 (EET) | UTC+3, one hour ahead |

## API: JPTime on your own site

`jptime.js` is a small JavaScript library with no dependencies. Add it to your page as a script:

```html
<script src="https://<address>/jptime.js"></script>
```

### Ready-made clock, no code needed

```html
<p>JPTime now: <jp-time format="HH:mm"></jp-time></p>
<jp-time locale="en" format="dddd, D MMMM [at] HH:mm"></jp-time>
```

`<jp-time>` updates itself once a second. Without a `format` attribute it uses `HH:mm:ss`. Use `locale="en"` for English day and month names. Without it, the language comes from the page's `lang` attribute, defaulting to Finnish.

### JavaScript API

| Call | Returns |
|---|---|
| `JPTime.now()` | An object with `time`, `date`, `iso`, `timestamp`, `parts`, `finland`, `aheadOfFinlandHours` and `nextFinnishClockChange` |
| `JPTime.format(time, pattern, locale)` | The time in JPTime, formatted as a string. `locale` is `"fi"` (default) or `"en"`. |
| `JPTime.toISOString(time)` | For example `"2026-11-07T00:30:05.007+03:00"` |
| `JPTime.parts(time, locale)` | `{ year, month, day, hours, minutes, seconds, weekday, weekdayName, monthName }` |
| `JPTime.finlandOffsetHours(time)` | Official Finnish time's offset from UTC in hours: `2` or `3` |
| `JPTime.nextFinnishClockChange(time)` | The next Finnish clock change as a `Date` |
| `JPTime.watch(callback)` | Calls `callback(JPTime.now())` at the start of every second and returns a function that stops it |

`time` is optional. It can be a `Date`, a millisecond timestamp or a date string, and defaults to now.

Example return value of `JPTime.now()`:

```json
{
  "time": "00:30:05",
  "date": "7.11.2026",
  "iso": "2026-11-07T00:30:05.007+03:00",
  "offset": "+03:00",
  "abbreviation": "JPT",
  "finland": { "offset": "+02:00", "abbreviation": "EET", "isSummerTime": false },
  "aheadOfFinlandHours": 1,
  "nextFinnishClockChange": "2027-03-28T01:00:00.000Z"
}
```

### Format tokens

| Token | Example | | Token | Example |
|---|---|---|---|---|
| `YYYY` | 2026 | | `HH` / `H` | 09 / 9 |
| `MMMM` | November / marraskuuta | | `mm` | 05 |
| `MM` / `M` | 03 / 3 | | `ss` | 07 |
| `DD` / `D` | 07 / 7 | | `zz` | JPT |
| `dddd` | Saturday / lauantai | | `Z` | +03:00 |

Text inside square brackets is printed as is, for example `[at]`. Weekday and month names (`dddd`, `MMMM`) follow the chosen locale.

The library also works in Node: `const JPTime = require("./jptime.js")`.

> JPTime needs no server or HTTP API, because `jptime.js` calculates the time directly in the browser from the user's clock.

## JPTime on your own computer

On Linux, macOS and WSL:

```bash
TZ="JPT-3" date
```

POSIX reverses the sign, so `JPT-3` means UTC+3. There is no daylight saving rule, so the clock never changes.

In tz database source format:

```
Zone JPTime  3:00  -  JPT
```

Compile and use it like this:

```bash
zic -d ~/zoneinfo jptime.zi
TZ=~/zoneinfo/JPTime date
```

## How the page calculates time

- JPTime is always UTC + 3 hours.
- Official Finnish time follows the EU summer time rule. Summer time starts on the last Sunday of March at 01:00 UTC and ends on the last Sunday of October at 01:00 UTC.
- All calculation happens in the browser. The page sends no data anywhere.
