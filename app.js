// ==========================================
// MODUŁ OBSŁUGI FORMULARZA I ZAPISU W LOCALSTORAGE
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Pobranie referencji do elementów formularza
    const issueForm = document.getElementById('issue-form');
    const issueLocation = document.getElementById('issue-location');
    const issueDescription = document.getElementById('issue-description');
    const issuePriority = document.getElementById('issue-priority');

    // Klucz pod którym przechowywane są zgłoszenia w localStorage
    const STORAGE_KEY = 'school_issues';

    if (!issueForm) {
        console.error('Błąd: Nie znaleziono formularza o id "issue-form" w pliku HTML.');
        return;
    }

    // 2. Obsługa zdarzenia wysłania formularza ('submit')
    issueForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // 3. Utworzenie obiektu zgłoszenia o zdefiniowanej strukturze
        const newIssue = {
            id: Date.now().toString(),
            location: issueLocation.value.trim(),
            description: issueDescription.value.trim(),
            priority: issuePriority.value,
            status: "Nowe"
        };

        // Walidacja danych przed zapisem
        if (!newIssue.location || !newIssue.description || !newIssue.priority) {
            alert('Wypełnij wszystkie pola formularza.');
            return;
        }

        // 4. Pobranie dotychczasowych zgłoszeń z localStorage (lub utworzenie pustej tablicy)
        let issues = [];
        try {
            const storedIssues = localStorage.getItem(STORAGE_KEY);
            issues = storedIssues ? JSON.parse(storedIssues) : [];
        } catch (error) {
            console.error('Błąd podczas pobierania danych z localStorage:', error);
            issues = [];
        }

        // 5. Dodanie nowego zgłoszenia na początek tablicy i zapis do localStorage
        issues.unshift(newIssue);

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
        } catch (error) {
            console.error('Błąd podczas zapisu do localStorage:', error);
        }

        // 6. Zresetowanie pól formularza
        issueForm.reset();

        // 7. Informowanie innych modułów o aktualizacji danych:
        // a) Wywołanie globalnej funkcji renderIssues(), jeśli została zdefiniowana przez drugi moduł
        if (typeof window.renderIssues === 'function') {
            window.renderIssues();
        }

        // b) Emisja zdarzenia własnego 'issuesUpdated' na obiekcie window
        window.dispatchEvent(new CustomEvent('issuesUpdated', {
            detail: { newIssue, issues }
        }));
    });
});
