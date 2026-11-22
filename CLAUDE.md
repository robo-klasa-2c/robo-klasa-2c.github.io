# robo-klasa-2c – zasady dla Claude

Publiczna, anonimowa strona z grami do nauki dla klasy 2c: https://robo-klasa-2c.github.io/ (GitHub Pages, gałąź `main`). Odpowiadaj po polsku. Kod, identyfikatory i komentarze po angielsku.

## Zasady stałe

- **Anonimowość:** żadnych nazwisk, imion dzieci, nazwy szkoły ani danych rodziców – w kodzie, tekstach, commitach i nazwach plików. Strona nie zbiera danych osobowych.
- **Bez cudzej własności:** bez nazw, logo, postaci, zdjęć i dźwięków z gier, filmów i podręczników (np. żadnego „Roblox”, postaci z podręcznika do angielskiego). Obrazki: własne SVG albo emoji. Teksty pytań piszemy sami.
- **Utwory chronione (wiersze, lektury):** nie wpisywać tekstu na stronę. Wzór: planeta „Katar” w `polski/` – rodzic wkleja tekst, który zostaje tylko w `localStorage` przeglądarki.
- **Commity:** autor `Robo <robo@robo-klasa-2c.invalid>` (`git -c user.name=Robo -c user.email=robo@robo-klasa-2c.invalid commit …`), opis po polsku, co się zmieniło. **Push robi właściciel** (klucz SSH z hasłem) – nie pushować bez wyraźnej zgody.
- Stare repozytorium-archiwum `klasa-2c` (stary adres) – nie ruszać.

## Budowa

- `index.html` – strona główna; lista przedmiotów i działów w tablicy `SUBJECTS` (nowe na górze, `isNew`, linki do gier/PDF). Stopka „Ostatnia aktualizacja: dd.mm.rrrr” – aktualizować.
- `wspolne/robo.js` + `robo.css` – wspólny silnik quizów (`Robo.start({ id, lang, levels, test, … })`) używany przez `matematyka/`, `polski/`, `logika/`, `informatyka/`.
  - Pytanie: `{ key, t, p, say, en?, prompt, cls: 'three'|'two'|'list'|'words', options:[{html, ok}], after, review? }`; inne rodzaje: `kind: 'spell'` (literki), `'multi'`, `'custom'` (`mount(el, api)`; api: `live, hints, tone, say, ok, bad, miss, restart`).
  - Poziom: `{ id, icon (emoji), name, pl, col, ring, gen(i), n?, noTest? }`; `get n()` dozwolone (Katar).
  - `en` – angielska wersja pytania (przycisk „EN”, angielski głos); w matematyce każde pytanie ma `en`.
- `angielski/unit1/`, `angielski/unit2/` – osobne strony z własnym silnikiem (angielski głos en-GB, `say()`), Unit 2 skopiowany z Unit 1 (zmienione: słownictwo, generatory, `LEVELS`, klucze `robo-u2-*`).
- `obby/` (2D platformówka) i `robo3d/` (three.js r160 w `wspolne/three-r160/`, MIT) – mają **własne kopie** funkcji lektora (`spokenMath`, `polishTwo`, `speechParts`); zmiany lektora robić we wszystkich trzech: `wspolne/robo.js`, `obby/index.html`, `robo3d/index.html`.
- `.githooks/pre-commit` (`git config core.hooksPath .githooks`) dopisuje `?v=<hash>` do `robo.js`/`robo.css` w stronach – po pushu wystarczy F5 (Pages cache 10 min).

## Lektor (polski) – reguły, które już są w kodzie

- „=” → „to”, „−” → „minus”, „+” → „plus”, „×” → „razy” (`spokenMath`).
- Cyfra 2 przed rzeczownikiem żeńskim → „dwie” (lista `FEM`), przed „-ach” → „dwóch”, przed „-ami” → „dwoma”; 12 bez zmian.
- Liczba z kropką na końcu zdania („1.”) czytana jak porządkowa – kropka zamieniana na pauzę.
- 1 przed rzeczownikiem pisać słowem („jeden stopień”, „jeden litr”, „jedna dziesiątka”) – helpery `stopni`, `litry`, `one` w `matematyka/`.
- Unikać konstrukcji typu „stoi na 4” (czytane „na czwartej/czwarty”) – pisać „pokazuje liczbę 4”.
- Nowy rzeczownik żeński z liczbą 2 → dopisać rdzeń do `FEM` (we wszystkich trzech kopiach).

## Statystyki

GoatCounter (bez cookies): skrypt w `<head>` każdej strony + `roboTrack(nazwa)` (zdarzenia: `przedmiot · planeta · start/koniec N★`, kliknięcia na stronie głównej) i `roboPlayer(sekcja)` (nowy / powracający gracz). Nowa strona = skopiować te 5 linii z istniejącej. `count.js` nie liczy z localhost. Panel ogląda właściciel (logowanie po jego stronie).

## Testowanie

- Lokalnie: `python -m http.server 8732 --directory <repo>`; w przeglądarce podgląd z parametrem `?t=…` (cache).
- Generatory sprawdzać masowo (setki losowań na poziom): dokładnie jedna poprawna opcja, opcje unikalne, brak `undefined`/`NaN`, tekst czytany bez „×”, „°”, „−” i bez złej odmiany. Konfigurację poziomów można wyciągnąć, podmieniając `Robo.start(` na `window.__cfg=(` w treści skryptu strony.
- Sprawdzić widok telefonu (375×812) i konsolę.
