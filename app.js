// ==========================================
// MODUŁ OBSŁUGI FORMULARZA I ZAPISU W LOCALSTORAGE
// ==========================================

window.addEventListener('storage', (e) => {
    if (e.key === 'school_issues') {
        window.renderIssues();
    }
});

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


document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'school_issues';
    const issuesList = document.getElementById('issues-list');

    if (!issuesList) {
        return;
    }

    function getStoredIssues() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Błąd odczytu z localStorage:', error);
            return [];
        }
    }

    window.renderIssues = function () {
        const issues = getStoredIssues();
        issuesList.innerHTML = '';

        if (!issues || issues.length === 0) {
            issuesList.innerHTML = `
                <div class="empty-state">
                    <svg class="empty-state-icon" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <p>Brak aktywnych zgłoszeń. Wszystko działa sprawnie!</p>
                </div>
            `;
            return;
        }

        issues.forEach(issue => {
            const card = document.createElement('article');
            card.className = `issue-card priority-${issue.priority ? issue.priority.toLowerCase() : 'medium'}`;
            card.innerHTML = `
                <div class="issue-header">
                    <span class="issue-location">${escapeHTML(issue.location)}</span>
                    <span class="issue-status">${escapeHTML(issue.status || 'Nowe')}</span>
                </div>
                <p class="issue-description">${escapeHTML(issue.description)}</p>
                <div class="issue-footer">
                    <span class="issue-priority-badge">Priorytet: ${escapeHTML(issue.priority)}</span>
                    <small class="issue-id">ID: #${issue.id}</small>
                </div>
            `;
            issuesList.appendChild(card);
        });
    };

    function escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    window.addEventListener('issuesUpdated', () => {
        window.renderIssues();
    });

    window.renderIssues();
});