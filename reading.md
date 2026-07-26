---
layout: default
title: Reading
---

<section class="reading-hero">
  <p class="hero-kicker">Reading</p>
  <h1 class="reading-title">Books &amp; Notes</h1>
  <p class="reading-lede">A shelf for books worth remembering, and the thoughts they left behind.</p>
</section>

<section class="reading-cards-section">
  <div class="reading-cards-header">
    <p class="card-label">Library</p>
  </div>
  <div class="reading-cards-scroll" id="cardsScroll">
    <div class="reading-cards-row" id="cardsRow"></div>
  </div>
  <p class="book-empty" id="emptyShelf">No books yet.</p>
</section>

<section class="reading-notes-section" id="notesSection" hidden>
  <div class="reading-notes-inner">
    <button class="notes-back-btn" id="notesBackBtn" type="button">&larr; Back</button>
    <p class="item-meta" id="detailReason"></p>
    <h2 class="book-detail__title" id="detailTitle"></h2>
    <div class="note-list" id="noteList"></div>
    <p class="book-empty" id="emptyNotes" hidden>No notes yet.</p>
  </div>
</section>

<script>
(function () {
  var DATA_URL = './data/reading.json';
  var data = { books: [] };

  var $cardsRow = document.getElementById('cardsRow');
  var $cardsScroll = document.getElementById('cardsScroll');
  var $emptyShelf = document.getElementById('emptyShelf');
  var $notesSection = document.getElementById('notesSection');
  var $detailTitle = document.getElementById('detailTitle');
  var $detailReason = document.getElementById('detailReason');
  var $noteList = document.getElementById('noteList');
  var $emptyNotes = document.getElementById('emptyNotes');

  document.getElementById('notesBackBtn').addEventListener('click', function () {
    $notesSection.hidden = true;
    $cardsScroll.style.display = '';
    document.querySelector('.reading-cards-header').style.display = '';
    $emptyShelf.style.display = data.books.length ? 'none' : 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  fetch(DATA_URL, { cache: 'no-store' })
    .then(function (res) { return res.json(); })
    .then(function (json) {
      data = json;
      renderCards();
    })
    .catch(function () {
      renderCards();
    });

  function renderCards() {
    $cardsRow.innerHTML = '';
    $emptyShelf.style.display = data.books.length ? 'none' : 'block';
    data.books.forEach(function (book, index) {
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'book-card';
      card.style.animationDelay = (index * 80) + 'ms';

      var style = '';
      if (book.cover) {
        style = 'background-image:url(' + escapeAttr(book.cover) + ');background-size:cover;background-position:center;';
      } else {
        var hue = (hashString(book.title) % 360);
        style = 'background:linear-gradient(135deg,hsl(' + hue + ',35%,45%),hsl(' + ((hue + 40) % 360) + ',45%,55%));';
      }
      card.setAttribute('style', style);

      var overlay = document.createElement('div');
      overlay.className = 'book-card__overlay';

      var title = document.createElement('span');
      title.className = 'book-card__title';
      title.textContent = book.title;

      var reason = document.createElement('span');
      reason.className = 'book-card__reason';
      reason.textContent = book.reason || '';

      overlay.appendChild(title);
      if (book.reason) overlay.appendChild(reason);
      card.appendChild(overlay);

      card.addEventListener('click', function () { showNotes(book); });
      $cardsRow.appendChild(card);
    });
  }

  function showNotes(book) {
    $cardsScroll.style.display = 'none';
    document.querySelector('.reading-cards-header').style.display = 'none';
    $emptyShelf.style.display = 'none';
    $notesSection.hidden = false;
    $detailTitle.textContent = book.title;
    $detailReason.textContent = book.reason || '';
    renderNotes(book);
  }

  function renderNotes(book) {
    $noteList.innerHTML = '';
    if (!book.notes || !book.notes.length) {
      $emptyNotes.hidden = false;
      $emptyNotes.style.display = 'block';
      return;
    }
    $emptyNotes.hidden = true;
    $emptyNotes.style.display = 'none';
    book.notes.slice().reverse().forEach(function (note) {
      var article = document.createElement('article');
      article.className = 'note-item';
      var dateStr = note.date || '';
      article.innerHTML = '<p class="note-item__date">' + escapeHtml(dateStr) + '</p>'
        + '<p class="note-item__text">' + escapeHtml(note.text) + '</p>';
      $noteList.appendChild(article);
    });
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function escapeAttr(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function hashString(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  renderCards();
})();
</script>
