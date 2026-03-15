(function () {
    'use strict';

    var verifyInput = document.getElementById('verifyIdInput');
    var verifyBtn = document.getElementById('verifyBtn');
    var verifyResult = document.getElementById('verifyResult');
    var verifyStatusPill = document.getElementById('verifyStatusPill');
    var verifyStatusIcon = document.getElementById('verifyStatusIcon');
    var verifyStatusText = document.getElementById('verifyStatusText');
    var verifyHeadline = document.getElementById('verifyHeadline');
    var verifyMessage = document.getElementById('verifyMessage');
    var verifyDetails = document.getElementById('verifyDetails');
    var verifyCertificate = document.getElementById('verifyCertificate');
    var verifyCertificateFrame = document.getElementById('verifyCertificateFrame');
    var verifyCertificateDownload = document.getElementById('verifyCertificateDownload');

    var detailName = document.getElementById('detailName');
    var detailRole = document.getElementById('detailRole');
    var detailDuration = document.getElementById('detailDuration');
    var detailIssueDate = document.getElementById('detailIssueDate');
    var detailVerificationId = document.getElementById('detailVerificationId');

    var STATUS_CLASSNAMES = ['status-valid', 'status-invalid', 'status-revoked', 'status-error'];
    var records = [];
    var completionRecords = [];

    function normalizeVerificationId(value) {
        return String(value || '')
            .trim()
            .toUpperCase()
            .replace(/\s+/g, '');
    }

    function setStatusAppearance(statusType, label, iconClass) {
        if (!verifyStatusPill || !verifyStatusText || !verifyStatusIcon) return;

        STATUS_CLASSNAMES.forEach(function (name) {
            verifyStatusPill.classList.remove(name);
        });

        verifyStatusPill.classList.add(statusType);
        verifyStatusText.textContent = label;
        verifyStatusIcon.className = iconClass;
    }

    function fillDetails(record) {
        if (!verifyDetails) return;

        detailName.textContent = record.fullName || '—';
        detailRole.textContent = record.role || '—';
        detailDuration.textContent = record.duration || '—';
        detailIssueDate.textContent = record.issueDate || '—';
        detailVerificationId.textContent = record.verificationId || '—';
        verifyDetails.hidden = false;
    }

    function hideDetails() {
        if (verifyDetails) verifyDetails.hidden = true;
    }

    function showCertificate(record) {
        if (!verifyCertificate || !verifyCertificateFrame || !verifyCertificateDownload) return;

        if (!record || !record.previewUrl) {
            hideCertificate();
            return;
        }

        verifyCertificate.hidden = false;
        verifyCertificateFrame.setAttribute('src', record.previewUrl);
        verifyCertificateDownload.setAttribute('href', record.downloadUrl || '#');
        verifyCertificateDownload.setAttribute('aria-disabled', record.downloadUrl ? 'false' : 'true');
    }

    function hideCertificate() {
        if (!verifyCertificate || !verifyCertificateFrame || !verifyCertificateDownload) return;

        verifyCertificate.hidden = true;
        verifyCertificateFrame.removeAttribute('src');
        verifyCertificateDownload.setAttribute('href', '#');
        verifyCertificateDownload.setAttribute('aria-disabled', 'true');
    }

    function setResultVisible() {
        if (verifyResult) verifyResult.hidden = false;
    }

    function showValid(record) {
        setResultVisible();
        setStatusAppearance('status-valid', 'Valid', 'ri-checkbox-circle-line');
        verifyHeadline.textContent = 'Record Verified';
        verifyMessage.textContent = 'This reference number matches an official Sahrang Medtech record.';
        fillDetails(record);
        showCertificate(getMatchingCompletionRecord(record.verificationId));
    }

    function showRevoked(record) {
        setResultVisible();
        setStatusAppearance('status-revoked', 'Revoked', 'ri-alert-line');
        verifyHeadline.textContent = 'Record Revoked';
        verifyMessage.textContent = 'This reference number exists but is not currently valid.';
        fillDetails(record || {});
        hideCertificate();
    }

    function showInvalid() {
        setResultVisible();
        setStatusAppearance('status-invalid', 'Invalid', 'ri-close-circle-line');
        verifyHeadline.textContent = 'Record Not Found';
        verifyMessage.textContent = 'The submitted reference number does not match our records.';
        hideDetails();
        hideCertificate();
    }

    function showError() {
        setResultVisible();
        setStatusAppearance('status-error', 'Error', 'ri-error-warning-line');
        verifyHeadline.textContent = 'Verification Unavailable';
        verifyMessage.textContent = 'Please try again shortly.';
        hideDetails();
        hideCertificate();
    }

    function updateUrlWithId(verificationId) {
        var url = new URL(window.location.href);
        if (verificationId) {
            url.searchParams.set('id', verificationId);
        } else {
            url.searchParams.delete('id');
        }
        window.history.replaceState({}, '', url.toString());
    }

    function parseQueryId() {
        var params = new URLSearchParams(window.location.search);
        return normalizeVerificationId(params.get('id'));
    }

    function getMatchingRecord(verificationId) {
        return records.find(function (record) {
            return normalizeVerificationId(record.verificationId) === verificationId;
        }) || null;
    }

    function getMatchingCompletionRecord(referenceNo) {
        var normalizedReference = normalizeVerificationId(referenceNo);
        return completionRecords.find(function (record) {
            return normalizeVerificationId(record.referenceNo) === normalizedReference;
        }) || null;
    }

    function verifyById(rawId) {
        var verificationId = normalizeVerificationId(rawId);

        if (!verificationId) {
            showInvalid();
            return;
        }

        if (verifyInput) {
            verifyInput.value = verificationId;
        }

        updateUrlWithId(verificationId);

        var record = getMatchingRecord(verificationId);
        if (!record) {
            showInvalid();
            return;
        }

        if (String(record.status || 'valid').toLowerCase() === 'revoked') {
            showRevoked(record);
            return;
        }

        showValid(record);
    }

    function attachEvents() {
        if (!verifyBtn) return;

        verifyBtn.addEventListener('click', function () {
            verifyById(verifyInput ? verifyInput.value : '');
        });

        if (verifyInput) {
            verifyInput.addEventListener('keydown', function (event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    verifyById(verifyInput.value);
                }
            });
        }
    }

    function loadVerificationRecords() {
        return fetch('data/verification-records.json', { cache: 'no-store' })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Unable to load verification records.');
                }
                return response.json();
            })
            .then(function (payload) {
                records = Array.isArray(payload) ? payload : [];
            });
    }

    function loadCompletionRecords() {
        return fetch('data/completions.json', { cache: 'no-store' })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Unable to load completion records.');
                }
                return response.json();
            })
            .then(function (payload) {
                completionRecords = Array.isArray(payload) ? payload : [];
            });
    }

    function init() {
        attachEvents();

        Promise.all([loadVerificationRecords(), loadCompletionRecords()])
            .then(function () {
                var queryId = parseQueryId();
                if (queryId) {
                    verifyById(queryId);
                }
            })
            .catch(function () {
                records = [];
                completionRecords = [];
                showError();
            });
    }

    init();

}());
