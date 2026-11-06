# JPTime

**JPTime on ikuinen Suomen kesäaika: UTC+3 ympäri vuoden ilman kellojen siirtelyä.**

Repositoriossa on kolme tiedostoa:

- `index.html` on kellosivu.
- `jptime.js` on rajapinta, jolla JPTimen saa omalle sivulle.
- `README.md` on tämä ohje.

Sivu näyttää JPTimen kellonajan ja vertaa sitä Suomen viralliseen aikaan ja UTC:hen. Se kertoo myös, ovatko kellot nyt samassa ajassa ja milloin tilanne seuraavan kerran muuttuu.

Kellon alla on elävä suomalainen kesämaisema: puulaituri, tuulessa heiluvat riippakoivut, lentävät lehdet ja kimmeltävä järvi. Vaaleassa teemassa on heinäkuun iltapäivä ja tummassa yötön yö. Jos laitteessa on valittu vähennetty liike, maisema pysyy paikallaan.

## Miksi JPTime?

Koska kellojen siirtely on turhaa.

Kellot siirretään kahdesti vuodessa. Se ei säästä mitään, mutta sotkee kaiken muun:

- **Ihmiset** nukkuvat huonosti vielä päiviä siirron jälkeen. Aamut tuntuvat väärältä, ja kalenterit, muistutukset ja kokousajat menevät helposti sekaisin.
- **Koirat** eivät tiedä mitään kesäajasta. Koiran sisäinen kello sanoo, että nyt mennään lenkille ja nyt syödään. Kun ihmisten kello hyppää tunnilla, koira joutuu odottamaan tai sitä herätetään liian aikaisin, eikä kumpikaan ymmärrä miksi.

EU päätti jo vuonna 2019, että kellojen siirtelystä luovutaan. Kellot kuitenkin siirtyvät yhä, koska jäsenmaat eivät ole päässeet sopuun siitä, kumpi aika jää voimaan.

JPTime ei jää odottamaan. Se valitsee kesäajan ja pysyy siinä:

| | Suomen virallinen aika | JPTime |
|---|---|---|
| Kesällä | UTC+3 (EEST) | UTC+3 |
| Talvella | UTC+2 (EET) | UTC+3, eli tunnin edellä |

## Julkaisu GitHub Pagesissa

1. Luo GitHubiin uusi repositorio, esimerkiksi `jptime`.
2. Lisää siihen `index.html`, `jptime.js` ja `README.md`.
3. Avaa repositoriosta **Settings → Pages**.
4. Valitse kohtaan *Source* vaihtoehto **Deploy from a branch** ja haaraksi `main` / `(root)`, ja tallenna.
5. Sivu ilmestyy hetken kuluttua osoitteeseen `https://<käyttäjänimi>.github.io/jptime/`.

Sivu ei tarvitse build-vaihetta. Ulkoisia riippuvuuksia ovat vain Google Fonts -fontit. Jos ne eivät lataudu, sivu käyttää järjestelmän fontteja.

## API: JPTime omalle sivulle

`jptime.js` on pieni JavaScript-kirjasto ilman riippuvuuksia. Kun se on julkaistu Pagesissa, kuka tahansa voi lisätä sen omalle sivulleen:

```html
<script src="https://<käyttäjänimi>.github.io/jptime/jptime.js"></script>
```

### Valmis kello ilman omaa koodia

```html
<p>JPTime nyt: <jp-time format="HH:mm"></jp-time></p>
<jp-time format="dddd D. MMMM [klo] HH.mm.ss"></jp-time>
```

`<jp-time>` päivittyy itsestään kerran sekunnissa. Ilman `format`-määritettä muoto on `HH:mm:ss`.

### JavaScript-rajapinta

| Kutsu | Palauttaa |
|---|---|
| `JPTime.now()` | Olion, jossa on `time`, `date`, `iso`, `timestamp`, `parts`, `finland`, `aheadOfFinlandHours` ja `nextFinnishClockChange` |
| `JPTime.format(aika, muoto)` | Ajan muotoiltuna merkkijonona JPTimessa |
| `JPTime.toISOString(aika)` | Esimerkiksi `"2026-11-07T00:30:05.007+03:00"` |
| `JPTime.parts(aika)` | `{ year, month, day, hours, minutes, seconds, weekday, weekdayName, monthName }` |
| `JPTime.finlandOffsetHours(aika)` | Suomen virallisen ajan poikkeaman UTC:stä tunteina: `2` tai `3` |
| `JPTime.nextFinnishClockChange(aika)` | Seuraavan Suomen kellojen siirron `Date`-oliona |
| `JPTime.watch(callback)` | Kutsuu `callback(JPTime.now())` joka sekunnin vaihteessa ja palauttaa pysäytysfunktion |

`aika` on vapaaehtoinen. Se voi olla `Date`, millisekuntiaikaleima tai päivämäärämerkkijono, ja oletuksena käytetään nykyhetkeä.

Esimerkki `JPTime.now()`-kutsun paluuarvosta:

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

### Muotoilumerkit

| Merkki | Esimerkki | | Merkki | Esimerkki |
|---|---|---|---|---|
| `YYYY` | 2026 | | `HH` / `H` | 09 / 9 |
| `MMMM` | marraskuuta | | `mm` | 05 |
| `MM` / `M` | 03 / 3 | | `ss` | 07 |
| `DD` / `D` | 07 / 7 | | `zz` | JPT |
| `dddd` | lauantai | | `Z` | +03:00 |

Hakasulkeissa oleva teksti tulostuu sellaisenaan, esimerkiksi `[klo]`.

Kirjasto toimii myös Nodessa: `const JPTime = require("./jptime.js")`.

> GitHub Pages jakaa vain staattisia tiedostoja, joten se ei voi tarjota HTTP-rajapintaa, joka palauttaisi kellonajan JSON-muodossa. Sellaista ei tarvita, koska `jptime.js` laskee ajan suoraan selaimessa käyttäjän kellosta.

## JPTime omalle koneelle

Linuxissa, macOS:ssä ja WSL:ssä:

```bash
TZ="JPT-3" date
```

POSIX-muodossa etumerkki on käänteinen, joten `JPT-3` tarkoittaa UTC+3:a. Kesäaikasääntöä ei ole, joten kello ei siirry koskaan.

tz-tietokannan lähdemuodossa:

```
Zone JPTime  3:00  -  JPT
```

Tiedoston voi kääntää ja ottaa käyttöön näin:

```bash
zic -d ~/zoneinfo jptime.zi
TZ=~/zoneinfo/JPTime date
```

## Miten sivu laskee ajan

- JPTime on aina UTC + 3 tuntia.
- Suomen virallinen aika lasketaan EU:n kesäaikasäännöllä. Kesäaika alkaa maaliskuun viimeisenä sunnuntaina klo 01.00 UTC ja päättyy lokakuun viimeisenä sunnuntaina klo 01.00 UTC.
- Laskenta tehdään selaimessa. Sivu ei lähetä tietoja minnekään.
