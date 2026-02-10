// Journal Interface Logic

// State
let currentPage = 1;
let currentSearch = '';
let currentTag = '';
let currentEntryId = null;
let entryTags = [];
const ENTRIES_PER_PAGE = 20;

// Check authentication
if (!isAuthenticated()) {
    window.location.href = '/index.html';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Display email
    document.getElementById('current-email').textContent = getEmail();

    // Setup event listeners
    setupEventListeners();

    // Load initial data
    await loadTags();
    await loadEntries();
});

// Setup Event Listeners
function setupEventListeners() {
    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        AuthAPI.logout();
    });

    // New Entry
    document.getElementById('new-entry-btn').addEventListener('click', openNewEntryModal);

    // Search
    document.getElementById('search-btn').addEventListener('click', handleSearch);
    document.getElementById('clear-search-btn').addEventListener('click', clearSearch);
    document.getElementById('search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    // Modal
    document.getElementById('close-modal-btn').addEventListener('click', closeEntryModal);
    document.getElementById('cancel-btn').addEventListener('click', closeEntryModal);
    document.getElementById('entry-form').addEventListener('submit', handleSaveEntry);

    // Tags input
    document.getElementById('tag-input').addEventListener('keypress', handleTagInput);
    document.getElementById('tags-input-container').addEventListener('click', () => {
        document.getElementById('tag-input').focus();
    });

    // Pagination
    document.getElementById('prev-page-btn').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadEntries();
        }
    });

    document.getElementById('next-page-btn').addEventListener('click', () => {
        currentPage++;
        loadEntries();
    });
}

// Load Tags
async function loadTags() {
    try {
        const data = await TagsAPI.getAll();
        renderTagsFilter(data.tags, data.counts);
    } catch (error) {
        console.error('Failed to load tags:', error);
    }
}

// Render Tags Filter
function renderTagsFilter(tags, counts) {
    const container = document.getElementById('tags-filter');

    if (tags.length === 0) {
        container.innerHTML = '<p class="text-muted">No tags yet</p>';
        return;
    }

    container.innerHTML = tags.map(tag => `
        <span
            class="tag-badge ${currentTag === tag ? 'active' : ''}"
            onclick="filterByTag('${escapeHtml(tag)}')"
        >
            ${escapeHtml(tag)}
            <span class="tag-count">(${counts[tag] || 0})</span>
        </span>
    `).join('');
}

// Filter by Tag
function filterByTag(tag) {
    if (currentTag === tag) {
        currentTag = '';
    } else {
        currentTag = tag;
    }
    currentPage = 1;
    loadEntries();
    loadTags(); // Reload to update active state
}

// Handle Search
function handleSearch() {
    currentSearch = document.getElementById('search-input').value.trim();
    currentPage = 1;
    loadEntries();
}

// Clear Search
function clearSearch() {
    currentSearch = '';
    currentTag = '';
    document.getElementById('search-input').value = '';
    currentPage = 1;
    loadEntries();
    loadTags();
}

// Load Entries
async function loadEntries() {
    const loading = document.getElementById('loading');
    const emptyState = document.getElementById('empty-state');
    const entriesGrid = document.getElementById('entries-grid');
    const pagination = document.getElementById('pagination');

    loading.classList.remove('hidden');
    entriesGrid.innerHTML = '';
    emptyState.classList.add('hidden');
    pagination.classList.add('hidden');

    try {
        const params = {
            page: currentPage,
            limit: ENTRIES_PER_PAGE
        };

        if (currentSearch) params.search = currentSearch;
        if (currentTag) params.tag = currentTag;

        const data = await EntriesAPI.getAll(params);

        loading.classList.add('hidden');

        if (data.entries.length === 0) {
            if (currentPage === 1) {
                emptyState.classList.remove('hidden');
            }
            return;
        }

        renderEntries(data.entries);

        // Setup pagination
        if (data.pages > 1) {
            pagination.classList.remove('hidden');
            document.getElementById('page-info').textContent = `Page ${data.page} of ${data.pages}`;
            document.getElementById('prev-page-btn').disabled = data.page === 1;
            document.getElementById('next-page-btn').disabled = data.page === data.pages;
        }
    } catch (error) {
        loading.classList.add('hidden');
        showError('Failed to load entries');
        console.error('Load entries error:', error);
    }
}

// Render Entries
function renderEntries(entries) {
    const container = document.getElementById('entries-grid');

    container.innerHTML = entries.map(entry => `
        <div class="entry-card">
            <div class="entry-header">
                <h3 class="entry-title">${escapeHtml(entry.title)}</h3>
                <span class="entry-date">${formatDate(entry.created_at)}</span>
            </div>
            <div class="entry-content">
                ${escapeHtml(truncate(entry.content, 200))}
            </div>
            ${entry.tags.length > 0 ? `
                <div class="entry-tags">
                    ${entry.tags.map(tag => `
                        <span class="entry-tag">${escapeHtml(tag)}</span>
                    `).join('')}
                </div>
            ` : ''}
            <div class="entry-actions">
                <button class="btn btn-sm btn-secondary" onclick="viewEntry(${entry.id})">
                    View
                </button>
                <button class="btn btn-sm btn-secondary" onclick="editEntry(${entry.id})">
                    Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteEntry(${entry.id})">
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Open New Entry Modal
function openNewEntryModal() {
    currentEntryId = null;
    entryTags = [];
    document.getElementById('modal-title').textContent = 'New Entry';
    document.getElementById('entry-form').reset();
    renderEntryTags();
    openEntryModal();
}

// Open Entry Modal
function openEntryModal() {
    document.getElementById('entry-modal').classList.add('show');
    document.getElementById('entry-title').focus();
}

// Close Entry Modal
function closeEntryModal() {
    document.getElementById('entry-modal').classList.remove('show');
    document.getElementById('entry-error').textContent = '';
    currentEntryId = null;
    entryTags = [];
}

// View Entry
async function viewEntry(id) {
    try {
        const data = await EntriesAPI.getById(id);
        const entry = data.entry;

        currentEntryId = entry.id;
        entryTags = entry.tags || [];

        document.getElementById('modal-title').textContent = 'View Entry';
        document.getElementById('entry-title').value = entry.title;
        document.getElementById('entry-content').value = entry.content;
        renderEntryTags();

        // Make read-only
        document.getElementById('entry-title').readOnly = true;
        document.getElementById('entry-content').readOnly = true;
        document.getElementById('tag-input').style.display = 'none';
        document.getElementById('entry-form').querySelector('button[type="submit"]').textContent = 'Edit';

        openEntryModal();
    } catch (error) {
        showError('Failed to load entry');
        console.error('View entry error:', error);
    }
}

// Edit Entry
async function editEntry(id) {
    try {
        const data = await EntriesAPI.getById(id);
        const entry = data.entry;

        currentEntryId = entry.id;
        entryTags = entry.tags || [];

        document.getElementById('modal-title').textContent = 'Edit Entry';
        document.getElementById('entry-title').value = entry.title;
        document.getElementById('entry-content').value = entry.content;
        document.getElementById('entry-title').readOnly = false;
        document.getElementById('entry-content').readOnly = false;
        document.getElementById('tag-input').style.display = 'block';
        renderEntryTags();

        openEntryModal();
    } catch (error) {
        showError('Failed to load entry');
        console.error('Edit entry error:', error);
    }
}

// Handle Save Entry
async function handleSaveEntry(e) {
    e.preventDefault();

    const title = document.getElementById('entry-title').value.trim();
    const content = document.getElementById('entry-content').value.trim();
    const errorEl = document.getElementById('entry-error');
    const submitBtn = e.target.querySelector('button[type="submit"]');

    errorEl.textContent = '';
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Saving...';

    try {
        if (currentEntryId) {
            await EntriesAPI.update(currentEntryId, title, content, entryTags);
            showSuccess('Entry updated successfully');
        } else {
            await EntriesAPI.create(title, content, entryTags);
            showSuccess('Entry created successfully');
        }

        closeEntryModal();
        await loadEntries();
        await loadTags();
    } catch (error) {
        errorEl.textContent = error.message || 'Failed to save entry';
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Delete Entry
function deleteEntry(id) {
    currentEntryId = id;
    document.getElementById('delete-modal').classList.add('show');

    document.getElementById('confirm-delete-btn').onclick = async () => {
        try {
            await EntriesAPI.delete(currentEntryId);
            showSuccess('Entry deleted successfully');
            closeDeleteModal();
            await loadEntries();
            await loadTags();
        } catch (error) {
            showError('Failed to delete entry');
            console.error('Delete entry error:', error);
        }
    };
}

// Close Delete Modal
function closeDeleteModal() {
    document.getElementById('delete-modal').classList.remove('show');
    currentEntryId = null;
}

// Handle Tag Input
function handleTagInput(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        const input = e.target;
        const tag = input.value.trim().toLowerCase();

        if (tag && !entryTags.includes(tag)) {
            entryTags.push(tag);
            renderEntryTags();
            input.value = '';
        }
    }
}

// Render Entry Tags
function renderEntryTags() {
    const container = document.getElementById('tags-input-container');
    const input = document.getElementById('tag-input');

    // Remove existing tag items
    container.querySelectorAll('.tag-item').forEach(el => el.remove());

    // Add new tag items
    entryTags.forEach((tag, index) => {
        const tagEl = document.createElement('span');
        tagEl.className = 'tag-item';
        tagEl.innerHTML = `
            ${escapeHtml(tag)}
            <span class="remove-tag" onclick="removeTag(${index})">&times;</span>
        `;
        container.insertBefore(tagEl, input);
    });
}

// Remove Tag
function removeTag(index) {
    entryTags.splice(index, 1);
    renderEntryTags();
}

// Close modal on background click
window.onclick = function(event) {
    const entryModal = document.getElementById('entry-modal');
    const deleteModal = document.getElementById('delete-modal');

    if (event.target === entryModal) {
        closeEntryModal();
    }
    if (event.target === deleteModal) {
        closeDeleteModal();
    }
};
