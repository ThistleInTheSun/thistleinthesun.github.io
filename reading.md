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
    <div class="book-sidebar__header">
      <p class="card-label">Library</p>
      <button class="button button--primary book-add-btn" id="addBookBtn" type="button">+ Add book</button>
    </div>
    <ul class="book-list" id="bookList"></ul>
    <p class="book-empty" id="emptyShelf">No books yet. Add one to begin.</p>
  </aside>

  <div class="book-main" id="bookMain">
    <div class="book-welcome" id="bookWelcome">
      <div class="feature-item">
        <p class="item-meta">Welcome</p>
        <h3>Select a book from the shelf</h3>
        <p>Or add a new one. Each book keeps its own reading notes.</p>
      </div>
    </div>

    <div class="book-detail" id="bookDetail" hidden>
      <div class="book-detail__header">
        <div>
          <p class="item-meta" id="detailReason"></p>
          <h2 class="book-detail__title" id="detailTitle"></h2>
        </div>
        <button class="button button--secondary book-delete-btn" id="deleteBookBtn" type="button">Remove</button>
      </div>

      <div class="note-form" id="noteForm">
        <textarea class="note-input" id="noteInput" placeholder="Write a note..." rows="3"></textarea>
        <button class="button button--primary" id="addNoteBtn" type="button">Add note</button>
      </div>

      <div class="note-list" id="noteList"></div>
      <p class="book-empty" id="emptyNotes" hidden>No notes yet. Start writing.</p>
    </div>

    <div class="add-book-form" id="addBookForm" hidden>
      <p class="card-label">New book</p>
      <h2 class="add-form__title">Add a book</h2>
      <label class="form-field">
        <span>Book title</span>
        <input type="text" id="inputBookTitle" placeholder="e.g. Thinking, Fast and Slow" autocomplete="off">
      </label>
      <label class="form-field">
        <span>Why I want to read it</span>
        <textarea id="inputBookReason" placeholder="What draws you to this book?" rows="3"></textarea>
      </label>
      <div class="add-form__actions">
        <button class="button button--primary" id="saveBookBtn" type="button">Save</button>
        <button class="button button--secondary" id="cancelBookBtn" type="button">Cancel</button>
      </div>
    </div>
  </div>
</section>

<script>
(function () {
  var STORAGE_KEY = 'thistle_reading';
  var data = load();
  var activeBookId = null;

  var $bookList = document.getElementById('bookList');
  var $emptyShelf = document.getElementById('emptyShelf');
  var $bookWelcome = document.getElementById('bookWelcome');
  var $bookDetail = document.getElementById('bookDetail');
  var $addBookForm = document.getElementById('addBookForm');
  var $detailTitle = document.getElementById('detailTitle');
  var $detailReason = document.getElementById('detailReason');
  var $noteInput = document.getElementById('noteInput');
  var $noteList = document.getElementById('noteList');
  var $emptyNotes = document.getElementById('emptyNotes');

  document.getElementById('addBookBtn').addEventListener('click', function () {
    showAddForm();
  });

  document.getElementById('cancelBookBtn').addEventListener('click', function () {
    hideAddForm();
  });

  document.getElementById('saveBookBtn').addEventListener('click', function () {
    var title = document.getElementById('inputBookTitle').value.trim();
    var reason = document.getElementById('inputBookReason').value.trim();
    if (!title) return;
    var book = { id: Date.now().toString(36), title: title, reason: reason, notes: [], createdAt: Date.now() };
    data.books.push(book);
    save();
    renderSidebar();
    selectBook(book.id);
    hideAddForm();
    document.getElementById('inputBookTitle').value = '';
    document.getElementById('inputBookReason').value = '';
  });

  document.getElementById('deleteBookBtn').addEventListener('click', function () {
    if (!activeBookId) return;
    var book = getBook(activeBookId);
    if (!book) return;
    if (!confirm('Remove "' + book.title + '" and all its notes?')) return;
    data.books = data.books.filter(function (b) { return b.id !== activeBookId; });
    save();
    activeBookId = null;
    renderSidebar();
    showWelcome();
  });

  document.getElementById('addNoteBtn').addEventListener('click', function () {
    var text = $noteInput.value.trim();
    if (!text || !activeBookId) return;
    var book = getBook(activeBookId);
    book.notes.push({ text: text, createdAt: Date.now() });
    save();
    $noteInput.value = '';
    renderNotes(book);
  });

  $noteInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      document.getElementById('addNoteBtn').click();
    }
  });

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { books: [] };
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

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
    $addBookForm.hidden = true;
    $bookDetail.hidden = false;
    $detailTitle.textContent = book.title;
    $detailReason.textContent = book.reason || '';
    renderNotes(book);
    renderSidebar();
  }

  function renderNotes(book) {
    $noteList.innerHTML = '';
    $emptyNotes.hidden = book.notes.length > 0;
    if (!book.notes.length) {
      $emptyNotes.style.display = 'block';
      return;
    }
    $emptyNotes.style.display = 'none';
    book.notes.slice().reverse().forEach(function (note) {
      var article = document.createElement('article');
      article.className = 'note-item';
      var date = new Date(note.createdAt);
      var dateStr = date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate())
        + ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes());
      article.innerHTML = '<p class="note-item__date">' + escapeHtml(dateStr) + '</p>'
        + '<p class="note-item__text">' + escapeHtml(note.text) + '</p>';
      $noteList.appendChild(article);
    });
  }

  function showWelcome() {
    $bookWelcome.hidden = false;
    $bookDetail.hidden = true;
    $addBookForm.hidden = true;
  }

  function showAddForm() {
    $bookWelcome.hidden = true;
    $bookDetail.hidden = true;
    $addBookForm.hidden = false;
    document.getElementById('inputBookTitle').focus();
  }

  function hideAddForm() {
    $addBookForm.hidden = true;
    if (activeBookId) {
      selectBook(activeBookId);
    } else {
      showWelcome();
    }
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function pad(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  renderSidebar();
})();
</script>
