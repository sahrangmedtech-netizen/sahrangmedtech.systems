(function () {
    'use strict';

    var completionGrid = document.getElementById('completionGrid');
    var completionEmpty = document.getElementById('completionEmpty');
    var completionEmptyTitle = document.getElementById('completionEmptyTitle');
    var completionEmptyText = document.getElementById('completionEmptyText');
    var resultCount = document.getElementById('resultCount');
    var referenceFilter = document.getElementById('referenceFilter');

    var completionModal = document.getElementById('completionModal');
    var completionModalClose = document.getElementById('completionModalClose');
    var completionModalTitle = document.getElementById('completionModalTitle');
    var completionModalDownload = document.getElementById('completionModalDownload');
    var completionPreviewFrame = document.getElementById('completionPreviewFrame');

    var completions = [];

    function normalizeText(value) {
        return String(value || '')
            .toUpperCase()
            .replace(/\s+/g, ' ')
            .trim();
    }

    function normalizeReference(value) {
        return normalizeText(value).replace(/\s+/g, '');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function updateCount(total) {
        if (!resultCount) return;
        resultCount.textContent = total + ' completion letter' + (total === 1 ? '' : 's');
    }

    function setEmptyState(type) {
        if (!completionEmptyTitle || !completionEmptyText) return;

        if (type === 'instructions') {
            completionEmptyTitle.textContent = 'Search required';
            completionEmptyText.textContent = 'Enter the exact reference number to access your completion letter.';
            return;
        }

        completionEmptyTitle.textContent = 'No matching completion letter';
        completionEmptyText.textContent = 'Please verify your reference number and try again.';
    }

    function renderCompletions(list) {
        if (!completionGrid) return;

        if (!list.length) {
            completionGrid.innerHTML = '';
            if (completionEmpty) completionEmpty.hidden = false;
            updateCount(0);
            return;
        }

        if (completionEmpty) completionEmpty.hidden = true;

        completionGrid.innerHTML = list.map(function (item) {
            var previewUrl = item.previewUrl ? String(item.previewUrl) : '';
            var downloadUrl = item.downloadUrl ? String(item.downloadUrl) : '';
            var hasPreview = !!previewUrl;
            var hasDownload = !!downloadUrl;

            return '<article class="offer-card">' +
                '<div class="offer-top">' +
                    '<h3 class="offer-name">' + escapeHtml(item.name) + '</h3>' +
                    '<span class="offer-pill">Completion</span>' +
                '</div>' +
                '<div class="offer-meta">' +
                    '<div class="offer-meta-row"><strong>Role:</strong> ' + escapeHtml(item.role || 'Intern') + '</div>' +
                    '<div class="offer-meta-row"><strong>Reference No:</strong> ' + escapeHtml(item.referenceNo) + '</div>' +
                    '<div class="offer-meta-row"><strong>Completion Date:</strong> ' + escapeHtml(item.completionDate || 'Not specified') + '</div>' +
                    '<div class="offer-meta-row"><strong>Issue Date:</strong> ' + escapeHtml(item.issueDate || 'Not specified') + '</div>' +
                '</div>' +
                '<div class="offer-actions">' +
                    '<button type="button" class="offer-view-btn" data-preview-url="' + escapeHtml(previewUrl) + '" data-download-url="' + escapeHtml(downloadUrl) + '" data-letter-name="' + escapeHtml(item.name) + '" aria-disabled="' + String(!hasPreview) + '">' +
                        '<i class="ri-eye-line"></i>View' +
                    '</button>' +
                    '<a class="btn-primary offer-download-btn" href="' + escapeHtml(downloadUrl || '#') + '" target="_blank" rel="noopener noreferrer" aria-disabled="' + String(!hasDownload) + '">' +
                        '<i class="ri-download-2-line"></i>Download' +
                    '</a>' +
                '</div>' +
            '</article>';
        }).join('');

        updateCount(list.length);
    }

    function applyFilter() {
        var query = normalizeReference(referenceFilter ? referenceFilter.value : '');

        if (!query) {
            setEmptyState('instructions');
            renderCompletions([]);
            return;
        }

        var filtered = completions.filter(function (item) {
            return normalizeReference(item.referenceNo) === query;
        });

        setEmptyState('no-match');
        renderCompletions(filtered);
    }

    function closeModal() {
        if (!completionModal) return;

        completionModal.hidden = true;
        completionModal.setAttribute('aria-hidden', 'true');

        if (completionPreviewFrame) {
            completionPreviewFrame.removeAttribute('src');
        }

        if (completionModalDownload) {
            completionModalDownload.setAttribute('href', '#');
            completionModalDownload.setAttribute('aria-disabled', 'true');
        }
    }

    function openModal(previewUrl, downloadUrl, letterName) {
        if (!completionModal || !completionPreviewFrame || !previewUrl) return;

        completionModal.hidden = false;
        completionModal.setAttribute('aria-hidden', 'false');
        completionPreviewFrame.setAttribute('src', previewUrl);

        if (completionModalTitle) {
            completionModalTitle.textContent = (letterName || 'Intern') + ' — Completion Letter';
        }

        if (completionModalDownload) {
            if (downloadUrl) {
                completionModalDownload.setAttribute('href', downloadUrl);
                completionModalDownload.setAttribute('aria-disabled', 'false');
            } else {
                completionModalDownload.setAttribute('href', '#');
                completionModalDownload.setAttribute('aria-disabled', 'true');
            }
        }
    }

    function attachEvents() {
        if (referenceFilter) {
            referenceFilter.addEventListener('input', applyFilter);
        }

        if (completionGrid) {
            completionGrid.addEventListener('click', function (event) {
                var viewBtn = event.target.closest('.offer-view-btn');
                if (!viewBtn) return;

                if (viewBtn.getAttribute('aria-disabled') === 'true') {
                    event.preventDefault();
                    return;
                }

                openModal(
                    viewBtn.getAttribute('data-preview-url'),
                    viewBtn.getAttribute('data-download-url'),
                    viewBtn.getAttribute('data-letter-name')
                );
            });
        }

        if (completionModalClose) {
            completionModalClose.addEventListener('click', closeModal);
        }

        if (completionModal) {
            completionModal.addEventListener('click', function (event) {
                var closeTarget = event.target.closest('[data-close-modal="true"]');
                if (closeTarget) {
                    closeModal();
                }
            });
        }

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && completionModal && !completionModal.hidden) {
                closeModal();
            }
        });
    }

    function normalizeCompletionRecord(record) {
        if (!record || !record.name || !record.referenceNo) {
            return null;
        }

        return {
            name: record.name,
            role: record.role || 'Intern',
            referenceNo: record.referenceNo,
            completionDate: record.completionDate || '',
            issueDate: record.issueDate || '',
            previewUrl: record.previewUrl || '',
            downloadUrl: record.downloadUrl || ''
        };
    }

    function loadCompletions() {
        fetch('data/completions.json', { cache: 'no-store' })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Unable to load completion letter data.');
                }
                return response.json();
            })
            .then(function (payload) {
                var list = Array.isArray(payload) ? payload : [];
                completions = list
                    .map(normalizeCompletionRecord)
                    .filter(function (item) { return item !== null; });

                applyFilter();
            })
            .catch(function () {
                completions = [];
                setEmptyState('no-match');
                renderCompletions([]);
            });
    }

    attachEvents();
    loadCompletions();

}());
