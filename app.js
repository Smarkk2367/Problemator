// ==========================================
// MODUŁ GŁÓWNY: FORMULARZ, STAŁE I GLOBALNE FUNKCJE
// ==========================================

const STORAGE_KEY = 'school_issues';

/**
 * Globalna funkcja do zmiany statusu zgłoszenia.
 * @param {string} id - Identyfikator zgłoszenia
 * @param {string} newStatus - Nowy status ("Nowe", "W realizacji", "Rozwiązane")
 */
function updateIssueStatus(id, newStatus) {
    if (!id) return;
    
    let issues = [];
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        issues = stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Błąd podczas pobierania danych z localStorage:', error);
        return;
    }

    const issueIndex = issues.findIndex(issue => String(issue.id) === String(id));
    if (issueIndex !== -1) {
        issues[issueIndex].status = newStatus;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
        } catch (error) {
            console.error('Błąd podczas zapisu zaktualizowanego statusu w localStorage:', error);
        }

        // Odświeżenie widoku (wywołanie renderIssues jeśli istnieje w window)
        if (typeof window.renderIssues === 'function') {
            window.renderIssues();
        }

        // Emisja zdarzenia własnego 'issuesUpdated' na obiekcie window
        window.dispatchEvent(new CustomEvent('issuesUpdated', {
            detail: { id, newStatus, issues }
        }));
    }
}

// Przypisanie funkcji do obiektu window (dostępność globalna)
window.updateIssueStatus = updateIssueStatus;

// Synchronizacja danych między kartami przeglądarki
window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && typeof window.renderIssues === 'function') {
        window.renderIssues();
    }
});

// ==========================================
// INICJALIZACJA I OBSŁUGA FORMULARZA
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const issueForm = document.getElementById('issue-form');
    const issueLocation = document.getElementById('issue-location');
    const issueDescription = document.getElementById('issue-description');
    const issuePriority = document.getElementById('issue-priority');

    if (issueForm) {
        issueForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const newIssue = {
                id: Date.now().toString(),
                location: issueLocation.value.trim(),
                description: issueDescription.value.trim(),
                priority: issuePriority.value,
                status: "Nowe"
            };

            if (!newIssue.location || !newIssue.description || !newIssue.priority) {
                alert('Wypełnij wszystkie pola formularza.');
                return;
            }

            let issues = [];
            try {
                const storedIssues = localStorage.getItem(STORAGE_KEY);
                issues = storedIssues ? JSON.parse(storedIssues) : [];
            } catch (error) {
                console.error('Błąd podczas pobierania danych z localStorage:', error);
                issues = [];
            }

            issues.unshift(newIssue);

            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
            } catch (error) {
                console.error('Błąd podczas zapisu do localStorage:', error);
            }

            issueForm.reset();
            alert('Zgłoszenie zostało pomyślnie dodane!');

            if (typeof window.renderIssues === 'function') {
                window.renderIssues();
            }

            window.dispatchEvent(new CustomEvent('issuesUpdated', {
                detail: { newIssue, issues }
            }));
        });
    }

    // ==========================================
    // DELEGACJA ZDARZEŃ DLA ZMIANY STATUSU
    // ==========================================
    const listContainer = document.getElementById('issues-list-container') || document.getElementById('issues-list') || document;

    listContainer.addEventListener('change', (e) => {
        const target = e.target;
        if (target && (target.classList.contains('status-select') || target.dataset.id)) {
            const issueId = target.dataset.id || target.getAttribute('data-id');
            const newStatus = target.value;
            if (issueId && newStatus) {
                window.updateIssueStatus(issueId, newStatus);
            }
        }
    });

    // ==========================================
    // RENDERING LISTY ZGŁOSZEŃ
    // ==========================================
    const issuesContainer = document.getElementById('issues-list-container') || document.getElementById('issues-list');

    window.renderIssues = function () {
        if (!issuesContainer) return;

        let issues = [];
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            issues = stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Błąd odczytu z localStorage:', error);
            issues = [];
        }

        issuesContainer.innerHTML = '';

        if (!issues || issues.length === 0) {
            issuesContainer.innerHTML = `
                <div class="empty-state" style="text-align: center; color: #718096; padding: 20px;">
                    <p>Brak aktywnych zgłoszeń. Wszystko działa sprawnie!</p>
                </div>
            `;
            return;
        }

        issues.forEach(issue => {
            const card = document.createElement('article');
            const priorityClass = issue.priority ? issue.priority.toLowerCase() : 'niski';
            card.className = `issue-card priority-${priorityClass}`;
            
            card.innerHTML = `
                <div class="issue-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <strong class="issue-location">${escapeHTML(issue.location)}</strong>
                    <div class="status-wrapper">
                        <label for="status-${issue.id}" style="font-size: 0.85rem; margin-right: 5px;">Status:</label>
                        <select id="status-${issue.id}" class="status-select" data-id="${issue.id}" style="padding: 4px 8px; border-radius: 4px; border: 1px solid #cbd5e0;">
                            <option value="Nowe" ${issue.status === 'Nowe' ? 'selected' : ''}>Nowe</option>
                            <option value="W realizacji" ${issue.status === 'W realizacji' ? 'selected' : ''}>W realizacji</option>
                            <option value="Rozwiązane" ${issue.status === 'Rozwiązane' ? 'selected' : ''}>Rozwiązane</option>
                        </select>
                    </div>
                </div>
                <p class="issue-description" style="margin-bottom: 12px;">${escapeHTML(issue.description)}</p>
                <div class="issue-footer" style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #718096;">
                    <span class="issue-priority-badge">Priorytet: ${escapeHTML(issue.priority)}</span>
                    <small class="issue-id">ID: #${issue.id}</small>
                </div>
            `;
            issuesContainer.appendChild(card);
        });
    };

    function escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    // Pierwsze wywołanie renderowania po załadowaniu DOM
    window.renderIssues();
});