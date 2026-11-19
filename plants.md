---
layout: default
title: Plants
---

<section class="reading-hero">
  <p class="hero-kicker">Plants</p>
  <h1 class="reading-title">My Green Friends</h1>
  <p class="reading-lede">A little garden journal — the flowers and leaves I keep, and the moods they came with.</p>
</section>

<section class="plants-section">
  <div class="plants-layout">
    <aside class="plants-index">
      <p class="card-label">Plants</p>
      <nav class="plants-index__list" id="plantsIndexList" aria-label="Plant list"></nav>
    </aside>
    <div class="plants-list" id="plantsList"></div>
  </div>
  <p class="book-empty" id="emptyPlants">No plants yet.</p>
</section>

<script>
(function () {
  var DATA_URL = './data/plants.json';
  var data = { plants: [] };

  var $indexList = document.getElementById('plantsIndexList');
  var $plantsList = document.getElementById('plantsList');
  var $empty = document.getElementById('emptyPlants');

  fetch(DATA_URL, { cache: 'no-store' })
    .then(function (res) { return res.json(); })
    .then(function (json) {
      data = json;
      render();
    })
    .catch(function () {
      render();
    });

  function render() {
    $indexList.innerHTML = '';
    $plantsList.innerHTML = '';
    var plants = data.plants || [];
    $empty.style.display = plants.length ? 'none' : 'block';

    plants.forEach(function (plant, index) {
      var blockId = 'plant-' + (plant.id || index);

      // Left index entry
      var idxBtn = document.createElement('button');
      idxBtn.type = 'button';
      idxBtn.className = 'plants-index__item';
      idxBtn.textContent = plant.name || ('Plant ' + (index + 1));
      idxBtn.setAttribute('data-target', blockId);
      idxBtn.addEventListener('click', function () {
        var target = document.getElementById(blockId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setActive(blockId);
        }
      });
      $indexList.appendChild(idxBtn);

      // Right plant block
      var block = document.createElement('article');
      block.className = 'plant-block';
      block.id = blockId;

      var head = document.createElement('div');
      head.className = 'plant-block__head';
      var name = document.createElement('h2');
      name.className = 'plant-block__name';
      name.textContent = plant.name || ('Plant ' + (index + 1));
      head.appendChild(name);
      if (plant.note) {
        var note = document.createElement('p');
        note.className = 'plant-block__note';
        note.textContent = plant.note;
        head.appendChild(note);
      }
      block.appendChild(head);

      var photosWrap = document.createElement('div');
      photosWrap.className = 'plant-photos';
      var photos = (plant.photos || []).slice().sort(function (a, b) {
        return String(b.date || '').localeCompare(String(a.date || ''));
      });
      photos.forEach(function (photo) {
        var figure = document.createElement('figure');
        figure.className = 'plant-photo';

        var frame = document.createElement('div');
        frame.className = 'plant-photo__frame';
        if (photo.src) {
          var img = document.createElement('img');
          img.src = photo.src;
          img.alt = (plant.name || '') + ' ' + (photo.date || '');
          img.loading = 'lazy';
          frame.appendChild(img);
        }
        figure.appendChild(frame);

        var caption = document.createElement('figcaption');
        caption.className = 'plant-photo__caption';
        var dateEl = document.createElement('p');
        dateEl.className = 'plant-photo__date';
        dateEl.textContent = photo.date || '';
        caption.appendChild(dateEl);
        if (photo.mood) {
          var moodEl = document.createElement('p');
          moodEl.className = 'plant-photo__mood';
          moodEl.textContent = photo.mood;
          caption.appendChild(moodEl);
        }
        figure.appendChild(caption);

        photosWrap.appendChild(figure);
      });
      block.appendChild(photosWrap);

      $plantsList.appendChild(block);
    });

    setActive(plants.length ? ('plant-' + (plants[0].id || 0)) : '');
    observeBlocks();
  }

  function setActive(blockId) {
    var items = $indexList.querySelectorAll('.plants-index__item');
    Array.prototype.forEach.call(items, function (item) {
      item.classList.toggle('is-active', item.getAttribute('data-target') === blockId);
    });
  }

  function observeBlocks() {
    if (!('IntersectionObserver' in window)) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });
    $plantsList.querySelectorAll('.plant-block').forEach(function (block) {
      observer.observe(block);
    });
  }

  render();
})();
</script>
