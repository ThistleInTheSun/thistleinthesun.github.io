---
layout: default
title: Reading
---

<section class="reading-hero">
  <p class="hero-kicker">Reading</p>
  <h1 class="reading-title">Books &amp; Notes</h1>
  <p class="reading-lede">A shelf for books worth remembering, and the thoughts they left behind.</p>
</section>

<section class="reading-layout">
  <aside class="book-sidebar" id="bookSidebar">
    <p class="card-label book-sidebar__label">Library</p>
    <ul class="book-list" id="bookList"></ul>
    <p class="book-empty" id="emptyShelf">No books yet.</p>
  </aside>

  <div class="book-main" id="bookMain">
    <div class="book-welcome" id="bookWelcome">
      <div class="feature-item">
        <p class="item-meta">Welcome</p>
        <h3>Select a book from the shelf</h3>
        <p>Each book keeps its own reading notes.</p>
      </div>
    </div>

    <div class="book-detail" id="bookDetail" hidden>
      <div>
        <p class="item-meta" id="detailReason"></p>
        <h2 class="book-detail__title" id="detailTitle"></h2>
      </div>
      <div class="note-list" id="noteList"></div>
      <p class="book-empty" id="emptyNotes" hidden>No notes yet.</p>
    </div>
  </div>
</section>

<script>
(function () {
  var DATA_URL = './data/reading.json';
  var data = { books: [] };
  var activeBookId = null;

  var $bookList = document.getElementById('bookList');
  var $emptyShelf = document.getElementById('emptyShelf');
  var $bookWelcome = document.getElementById('bookWelcome');
  var $bookDetail = document.getElementById('bookDetail');
  var $detailTitle = document.getElementById('detailTitle');
  var $detailReason = document.getElementById('detailReason');
  var $noteList = document.getElementById('noteList');
  var $emptyNotes = document.getElementById('emptyNotes');

  fetch(DATA_URL, { cache: 'no-store' })
    .then(function (res) { return res.json(); })
    .then(function (json) {
      data = json;
      renderSidebar();
    })
    .catch(function () {
      renderSidebar();
    });

  function getBook(id) {
    return data.books.find(function (b) { return b.id === id; });
  }

  function renderSidebar() {
    $bookList.innerHTML = '';
    $emptyShelf.style.display = data.books.length ? 'none' : 'block';
    data.books.forEach(function (book) {
      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'book-list__item' + (book.id === activeBookId ? ' is-active' : '');
      btn.innerHTML = '<span class="book-list__title">' + escapeHtml(book.title) + '</span>'
        + (book.reason ? '<span class="book-list__reason">' + escapeHtml(book.reason) + '</span>' : '');
      btn.addEventListener('click', function () { selectBook(book.id); });
      li.appendChild(btn);
      $bookList.appendChild(li);
    });
  }

  function selectBook(id) {
    activeBookId = id;
    var book = getBook(id);
    if (!book) return;
    $bookWelcome.hidden = true;
    $bookDetail.hidden = false;
    $detailTitle.textContent = book.title;
    $detailReason.textContent = book.reason || '';
    renderNotes(book);
    renderSidebar();
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

  renderSidebar();
})();
</script>
