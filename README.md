# Klasa 2c – pomoce do nauki

Strona: https://robo-klasa-2c.github.io/

- `index.html` – strona główna (lista przedmiotów w tablicy `SUBJECTS` w skrypcie na dole pliku).
- `angielski/unit1/` – gra „Robo Space Mission” (`index.html`) i karty do druku (`karty-unit1.pdf`).
- `matematyka/` – gra „Robo liczy”; `polski/` – gra „Robo i słowa” (z lekturą „Brzydkie kaczątko”); `informatyka/` – gra „Robo koduje” (kodowanie, wzory, bezpieczny internet, AI).
- `logika/` – gra „Robo myśli” (gry logiczne: co nie pasuje, wzory i pary, zagadki, sudoku 4×4, tor przeszkód ze strzałkami, memory – treści z bieżących tematów klasy).
- `obby/` – gra „Robo Obby”: platformówka tor przeszkód (canvas, bez bibliotek). 5 planet budowanych w `level1()`…`level5()` (wysokość 1 = dolny rząd), pytania z lekcji na flagach etapów (`genMath`, `genEn`, `genPl`), szafa z wyglądem postaci, zapis w `localStorage`.
- `robo3d/` – gra „Robo 3D”: tor przeszkód w 3D (three.js r160 w `wspolne/three-r160/`, licencja MIT, bez CDN). Plansze w `level1()` (`P(x, wierzch, z, szer, głęb)`; przód to −z), pytania jak w Robo Obby, monety i wygląd wspólne z Robo Obby (`robo-obby-2c`), gwiazdki w `robo-3d-2c`. `window._r3d` służy do testów.
- `wspolne/` – wspólny silnik gier (`robo.js`) i wygląd (`robo.css`) dla gier z matematyki, polskiego, informatyki i logiki. Pytania typu `custom` wstawiają własną mini-grę (sudoku, labirynt, memory).

Statystyki (tylko dla właściciela, po zalogowaniu): https://robo-klasa-2c.goatcounter.com – anonimowy licznik bez ciasteczek. Każda strona ma w `<head>` skrypt GoatCounter i funkcję `roboTrack(nazwa)`; gry zapisują zdarzenia (start/koniec poziomu z gwiazdkami, flagi i meta w Robo Obby, zakupy w szafie, kliknięcia w materiały na stronie głównej). `roboPlayer(sekcja)` przy starcie gry wysyła raz na urządzenie „nowy gracz”, potem najwyżej raz dziennie „gracz wraca” (w przeglądarce zapisuje się tylko data). Nowa strona: skopiuj te 5 linii z `<head>` innej strony.

Nowy materiał: dodaj folder (np. `matematyka/dodawanie/`) i wpis w `SUBJECTS`.
Bez danych osobowych dzieci i nauczycieli; strony mają `noindex`.
