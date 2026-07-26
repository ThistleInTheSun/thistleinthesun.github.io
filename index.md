---
layout: default
title: Distilling Cat
description: A cat distilling knowledge — reading, notes, and tools.
---

<section class="hero-section" aria-labelledby="hero-title">
  <div class="hero-kicker">Distilling Cat / A cat distilling knowledge</div>
  <div class="hero-grid">
    <div class="hero-copy">
      <p class="eyebrow">Distilling Cat</p>
      <h1 id="hero-title">A cat quietly distilling knowledge from books, tools, and thoughts.</h1>
      <p class="hero-lede">Reading notes, small tools, and the occasional idea worth keeping. This is the shelf where it all accumulates.</p>
      <div class="hero-actions" aria-label="Homepage sections">
        <a class="button button--primary" href="./reading.html">Reading</a>
        <a class="button button--secondary" href="./md2wechat/">Markdown → 公众号</a>
      </div>
    </div>

    <aside class="hero-card" aria-label="Design notes">
      <div class="sun-mark" aria-hidden="true"></div>
      <p class="card-label">Current state</p>
      <p class="card-title">Ready for real content</p>
      <p class="card-text">The structure is prepared so each section can earn its place when you have the material.</p>
    </aside>
  </div>
</section>

<section id="reading" class="content-section section-split section-split--stretch">
  <div>
    <p class="section-index">01</p>
    <h2>Reading</h2>
  </div>
  <div class="home-books" id="homeBooks">
    <p class="book-empty" id="homeBooksEmpty">No books yet.</p>
  </div>
</section>

<section id="tools" class="content-section section-split">
  <div>
    <p class="section-index">02</p>
    <h2>Tool</h2>
  </div>
  <div class="item-list">
    <article class="feature-item">
      <p class="item-meta">Tool</p>
      <h3><a href="./md2wechat/">Markdown 转公众号排版</a></h3>
      <p>纯前端工具：粘贴 Markdown，实时预览公众号样式，一键复制富文本到公众号编辑器。支持多主题、代码高亮、本地草稿。</p>
    </article>
  </div>
</section>

<script>
(function () {
  var $container = document.getElementById('homeBooks');
  var $empty = document.getElementById('homeBooksEmpty');

  fetch('./data/reading.json', { cache: 'no-store' })
    .then(function (res) { return res.json(); })
    .then(function (json) {
      if (!json.books || !json.books.length) return;
      $empty.style.display = 'none';
      var row = document.createElement('div');
      row.className = 'home-books__row';
      var palette = [
        'linear-gradient(145deg, #b8906e, #a07858)',
        'linear-gradient(145deg, #8a9a7e, #6e8268)',
        'linear-gradient(145deg, #a888a0, #8e6e86)',
        'linear-gradient(145deg, #9a8870, #7e6e58)',
        'linear-gradient(145deg, #7e8e9a, #64788a)',
        'linear-gradient(145deg, #b09878, #968060)'
      ];
      json.books.forEach(function (book, i) {
        var a = document.createElement('a');
        a.href = './reading.html';
        a.className = 'home-book-card';
        if (book.cover) {
          a.style.backgroundImage = 'url(' + book.cover.replace(/'/g, '\\27') + ')';
          a.style.backgroundSize = 'cover';
          a.style.backgroundPosition = 'center';
        } else {
          a.style.background = palette[i % palette.length];
        }
        var overlay = document.createElement('div');
        overlay.className = 'home-book-card__overlay';
        var title = document.createElement('span');
        title.className = 'home-book-card__title';
        title.textContent = book.title;
        overlay.appendChild(title);
        a.appendChild(overlay);
        row.appendChild(a);
      });
      $container.appendChild(row);
    })
    .catch(function () {});
})();
</script>
