(function () {
    'use strict';

    var START_YEAR = 2025;
    var MONTHS = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    var offersGrid = document.getElementById('offersGrid');
    var offersEmpty = document.getElementById('offersEmpty');
    var offersEmptyTitle = document.getElementById('offersEmptyTitle');
    var offersEmptyText = document.getElementById('offersEmptyText');
    var resultCount = document.getElementById('resultCount');
    var nameFilter = document.getElementById('nameFilter');
    var monthFilter = document.getElementById('monthFilter');
    var yearFilter = document.getElementById('yearFilter');

    var offerModal = document.getElementById('offerModal');
    var offerModalClose = document.getElementById('offerModalClose');
    var offerModalTitle = document.getElementById('offerModalTitle');
    var offerModalDownload = document.getElementById('offerModalDownload');
    var offerPreviewFrame = document.getElementById('offerPreviewFrame');

    var offers = [];

    function normalizeText(value) {
        return String(value || '')
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .trim();
    }

    function monthLabel(monthNumber) {
        var index = Number(monthNumber) - 1;
        return MONTHS[index] || 'Unknown';
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
        resultCount.textContent = total + ' offer letter' + (total === 1 ? '' : 's');
    }

    function buildMonthOptions() {
        if (!monthFilter) return;
        MONTHS.forEach(function (month, index) {
            var option = document.createElement('option');
            option.value = String(index + 1);
            option.textContent = month;
            monthFilter.appendChild(option);
        });
    }

    function buildYearOptions(list) {
        if (!yearFilter) return;

        while (yearFilter.options.length > 1) {
            yearFilter.remove(1);
        }

        var currentYear = new Date().getFullYear();
        var maxYearInData = list.reduce(function (maxYear, offer) {
            var year = Number(offer.year) || START_YEAR;
            return Math.max(maxYear, year);
        }, START_YEAR);
        var maxYear = Math.max(currentYear, maxYearInData);

        for (var year = maxYear; year >= START_YEAR; year -= 1) {
            var option = document.createElement('option');
            option.value = String(year);
            option.textContent = String(year);
            yearFilter.appendChild(option);
        }
    }

    function renderOffers(list) {
        if (!offersGrid) return;

        if (!list.length) {
            offersGrid.innerHTML = '';
            if (offersEmpty) offersEmpty.hidden = false;
            updateCount(0);
            return;
        }

        if (offersEmpty) offersEmpty.hidden = true;

        offersGrid.innerHTML = list.map(function (offer) {
            var previewUrl = offer.previewUrl ? String(offer.previewUrl) : '';
            var downloadUrl = offer.downloadUrl ? String(offer.downloadUrl) : '';
            var hasPreview = !!previewUrl;
            var hasDownload = !!downloadUrl;

            return '<article class="offer-card">' +
                '<div class="offer-top">' +
                    '<h3 class="offer-name">' + escapeHtml(offer.name) + '</h3>' +
                    '<span class="offer-pill">' + escapeHtml(offer.department || 'Internship') + '</span>' +
                '</div>' +
                '<div class="offer-meta">' +
                    '<div class="offer-meta-row"><strong>Role:</strong> ' + escapeHtml(offer.role || 'Intern') + '</div>' +
                    '<div class="offer-meta-row"><strong>Issue Period:</strong> ' + escapeHtml(monthLabel(offer.month)) + ' ' + escapeHtml(offer.year) + '</div>' +
                    '<div class="offer-meta-row"><strong>Issue Date:</strong> ' + escapeHtml(offer.issueDate || 'Not specified') + '</div>' +
                '</div>' +
                '<div class="offer-actions">' +
                    '<button type="button" class="offer-view-btn" data-preview-url="' + escapeHtml(previewUrl) + '" data-download-url="' + escapeHtml(downloadUrl) + '" data-offer-name="' + escapeHtml(offer.name) + '" aria-disabled="' + String(!hasPreview) + '">' +
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

    function setEmptyState(messageType) {
        if (!offersEmptyTitle || !offersEmptyText) return;

        if (messageType === 'instructions') {
            offersEmptyTitle.textContent = 'Search required';
            offersEmptyText.textContent = 'Enter full name and select both month and year to access your offer letter.';
            return;
        }

        offersEmptyTitle.textContent = 'No matching offer letters';
        offersEmptyText.textContent = 'Check full name spelling and verify the selected month and year.';
    }

    function hasRequiredFilters(nameQuery, monthValue, yearValue) {
        return !!nameQuery && monthValue !== 'all' && yearValue !== 'all';
    }

    function applyFilters() {
        var nameQuery = normalizeText(nameFilter ? nameFilter.value : '');
        var monthValue = monthFilter ? monthFilter.value : 'all';
        var yearValue = yearFilter ? yearFilter.value : 'all';

        if (!hasRequiredFilters(nameQuery, monthValue, yearValue)) {
            setEmptyState('instructions');
            renderOffers([]);
            return;
        }

        var filtered = offers.filter(function (offer) {
            var offerName = normalizeText(offer.name);
            var offerMonth = String(Number(offer.month) || '');
            var offerYearNumber = Number(offer.year) || START_YEAR;
            var offerYear = String(offerYearNumber);

            var matchesName = offerName === nameQuery;
            var matchesMonth = offerMonth === monthValue;
            var matchesYear = offerYear === yearValue;

            return matchesName && matchesMonth && matchesYear && offerYearNumber >= START_YEAR;
        });

        setEmptyState('no-match');
        renderOffers(filtered);
    }

    function closeModal() {
        if (!offerModal) return;

        offerModal.hidden = true;
        offerModal.setAttribute('aria-hidden', 'true');
        if (offerPreviewFrame) offerPreviewFrame.removeAttribute('src');
        if (offerModalDownload) {
            offerModalDownload.setAttribute('href', '#');
            offerModalDownload.setAttribute('aria-disabled', 'true');
        }
    }

    function openModal(previewUrl, downloadUrl, offerName) {
        if (!offerModal || !offerPreviewFrame || !previewUrl) return;

        offerModal.hidden = false;
        offerModal.setAttribute('aria-hidden', 'false');
        offerPreviewFrame.setAttribute('src', previewUrl);

        if (offerModalTitle) {
            offerModalTitle.textContent = offerName || 'Offer Letter';
        }

        if (offerModalDownload) {
            if (downloadUrl) {
                offerModalDownload.setAttribute('href', downloadUrl);
                offerModalDownload.setAttribute('aria-disabled', 'false');
            } else {
                offerModalDownload.setAttribute('href', '#');
                offerModalDownload.setAttribute('aria-disabled', 'true');
            }
        }
    }

    function attachEvents() {
        if (nameFilter) {
            nameFilter.addEventListener('input', applyFilters);
        }

        if (monthFilter) {
            monthFilter.addEventListener('change', applyFilters);
        }

        if (yearFilter) {
            yearFilter.addEventListener('change', applyFilters);
        }

        if (offersGrid) {
            offersGrid.addEventListener('click', function (event) {
                var viewBtn = event.target.closest('.offer-view-btn');
                if (!viewBtn) return;

                if (viewBtn.getAttribute('aria-disabled') === 'true') {
                    event.preventDefault();
                    return;
                }

                openModal(
                    viewBtn.getAttribute('data-preview-url'),
                    viewBtn.getAttribute('data-download-url'),
                    viewBtn.getAttribute('data-offer-name')
                );
            });
        }

        if (offerModalClose) {
            offerModalClose.addEventListener('click', closeModal);
        }

        if (offerModal) {
            offerModal.addEventListener('click', function (event) {
                var closeTarget = event.target.closest('[data-close-modal="true"]');
                if (closeTarget) {
                    closeModal();
                }
            });
        }

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && offerModal && !offerModal.hidden) {
                closeModal();
            }
        });
    }

    function normalizeOfferRecord(record) {
        var year = Number(record.year);
        var month = Number(record.month);

        if (!record || !record.name || !month || !year) {
            return null;
        }

        if (year < START_YEAR || month < 1 || month > 12) {
            return null;
        }

        return {
            name: record.name,
            role: record.role || 'Intern',
            department: record.department || 'Internship',
            month: month,
            year: year,
            issueDate: record.issueDate || '',
            previewUrl: record.previewUrl || '',
            downloadUrl: record.downloadUrl || ''
        };
    }

    function loadOffers() {
        fetch('data/offers.json', { cache: 'no-store' })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Unable to load offer letter data.');
                }
                return response.json();
            })
            .then(function (payload) {
                var list = Array.isArray(payload) ? payload : [];
                offers = list
                    .map(normalizeOfferRecord)
                    .filter(function (entry) { return entry !== null; });

                buildMonthOptions();
                buildYearOptions(offers);
                applyFilters();
            })
            .catch(function () {
                offers = [];
                buildMonthOptions();
                buildYearOptions(offers);
                renderOffers([]);
            });
    }

    attachEvents();
    loadOffers();

}());
