/* /studio/ — upload the flyer, then poll the webinar's status until the pack
   is ready and the review email is on its way. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var form = $('#studio-form');
  var progress = $('#s-progress');
  var statusLine = $('#s-status');
  var fileInput = $('#s-flyer');

  var say = function (text, bad) {
    statusLine.textContent = text;
    statusLine.classList.toggle('is-error', !!bad);
  };
  var mark = function (step, state) {
    var li = $('[data-step="' + step + '"]');
    if (li) li.className = state;
  };

  if (fileInput) fileInput.addEventListener('change', function () {
    var file = fileInput.files && fileInput.files[0];
    var box = $('#s-preview');
    if (!file) { box.hidden = true; return; }
    if (file.size > 4 * 1024 * 1024) { say('That flyer is over 4 MB - export a smaller copy.', true); return; }
    $('#s-preview-img').src = URL.createObjectURL(file);
    box.hidden = false;
  });

  var ERR = {
    wrong_passphrase: 'That passphrase is not right.',
    locked: 'Too many wrong passphrases. The studio is locked for now and the team has been told. Wait, then try once, carefully.',
    flyer_required: 'Add the flyer - JPEG, PNG or WebP.',
    flyer_too_large: 'That flyer is over 4 MB - export a smaller copy.',
    photo_invalid: 'The speaker photo needs to be a JPEG, PNG or WebP.',
    photo_too_large: 'That speaker photo is over 1 MB - export a smaller copy.',
    payload_too_large: 'That flyer is over 4 MB - export a smaller copy.',
    rate_limited: 'Too many uploads in a row - wait a minute and try again.',
    not_saved: 'The upload did not save. Try again; if it repeats, check the function logs.'
  };

  function poll(id, passphrase, started) {
    fetch('/api/studio?id=' + encodeURIComponent(id), {
      headers: { 'x-studio-key': passphrase }, credentials: 'same-origin'
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.status === 'awaiting_owner') {
          mark('generating', 'done'); mark('awaiting_owner', 'done');
          say('Done. The review link is in your inbox (' + (data.title || 'pack') + '). This page can be closed.');
          return;
        }
        if (data.status === 'failed') {
          mark('generating', '');
          var reason = data.note && data.note.error ? ' - ' + data.note.error : '';
          say('Generation failed' + reason + '. A note went to your inbox; fix the cause and upload again.', true);
          return;
        }
        if (Date.now() - started > 10 * 60 * 1000) {
          say('Still not finished after 10 minutes - check the function logs before retrying.', true);
          return;
        }
        setTimeout(function () { poll(id, passphrase, started); }, 5000);
      })
      .catch(function () { setTimeout(function () { poll(id, passphrase, started); }, 8000); });
  }

  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var passphrase = $('#s-pass').value;
    var data = new FormData(form);
    var btn = $('button[type="submit"]', form);
    btn.disabled = true;
    progress.hidden = false;
    mark('upload', 'now');
    say('Uploading the flyer…');
    fetch('/api/studio', { method: 'POST', body: data, credentials: 'same-origin' })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (b) { b.httpOk = r.ok; return b; }); })
      .then(function (res) {
        if (!res.httpOk || !res.id) {
          btn.disabled = false;
          progress.hidden = true;
          say(ERR[res.error] || 'That did not go through - try again.', true);
          window.alert(ERR[res.error] || 'Upload failed - try again.');
          return;
        }
        mark('upload', 'done');
        mark('generating', 'now');
        say('Reading the flyer and writing the pack - about two minutes…');
        poll(res.id, passphrase, Date.now());
      })
      .catch(function () {
        btn.disabled = false;
        progress.hidden = true;
        say('Network error - try again.', true);
      });
  });
})();
