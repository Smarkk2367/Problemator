# Problemator - System Zgłaszania Usterek

Prosty system zgłaszania i zarządzania usterkami helpdesk w szkole, stworzony w czystym HTML, CSS i JavaScript (ES6+) bez użycia zewnętrznych frameworków.

## 🚀 Jak uruchomić aplikację

Aplikacja nie wymaga żądnej instalacji ani serwera backendowego – wszystkie dane przechowywane są w pamięci przeglądarki (`localStorage`).

### Metoda 1: Bezpośrednio w przeglądarce (najprostszy sposób)
1. Wejdź do katalogu projektu.
2. Kliknij dwukrotnie plik **`index.html`** lub przeciągnij go do okna swojej przeglądarki internetowej (Chrome, Firefox, Edge itp.).

### Metoda 2: Za pomocą lokalnego serwera (np. VS Code Live Server / Python)
Jeśli korzystasz z edytora kodu, możesz użyć serwera deweloperskiego:
* **VS Code**: Zainstaluj wtyczkę *Live Server*, kliknij prawym przyciskiem myszy na `index.html` i wybierz **Open with Live Server**.
* **Python**: W terminalu w katalogu projektu wpisz `python -m http.server 8000` i otwórz w przeglądarce adres `http://localhost:8000`.

---

## 📁 Struktura projektu

* **`index.html`** – Strona główna z formularzem zgłaszania nowych usterek.
* **`admin/lista.html`** – Podstrona panelu administratora do przeglądania zgłoszeń oraz zmiany ich statusu (*Nowe*, *W realizacji*, *Rozwiązane*).
* **`style.css`** – Style arkusza CSS odpowiadające za wygląd strony i paneli.
* **`app.js`** – Logika aplikacji w JavaScript (obsługa formularza, manipulacja DOM oraz zapis/odczyt z `localStorage`).
