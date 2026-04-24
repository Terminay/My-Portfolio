// ============================================
// Blog Engine — localStorage + marked.js
// ============================================

class BlogStore {
  constructor() { this.KEY = 'portfolio_blog_posts'; }

  getAll() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || []; }
    catch { return []; }
  }
  getPublished() { return this.getAll().filter(p => p.published); }
  getById(id) { return this.getAll().find(p => p.id === id); }

  save(post) {
    const posts = this.getAll();
    const idx = posts.findIndex(p => p.id === post.id);
    if (idx >= 0) {
      posts[idx] = { ...posts[idx], ...post, updatedAt: new Date().toISOString() };
    } else {
      post.id = crypto.randomUUID();
      post.createdAt = new Date().toISOString();
      post.updatedAt = post.createdAt;
      posts.unshift(post);
    }
    localStorage.setItem(this.KEY, JSON.stringify(posts));
    return post;
  }

  delete(id) {
    localStorage.setItem(this.KEY, JSON.stringify(this.getAll().filter(p => p.id !== id)));
  }

  search(q) {
    const lq = q.toLowerCase();
    return this.getAll().filter(p =>
      p.title.toLowerCase().includes(lq) ||
      p.content.toLowerCase().includes(lq) ||
      (p.tags || []).some(t => t.toLowerCase().includes(lq))
    );
  }

  exportAll() { return JSON.stringify(this.getAll(), null, 2); }
  importAll(json) {
    const posts = JSON.parse(json);
    if (!Array.isArray(posts)) throw new Error('Invalid');
    localStorage.setItem(this.KEY, JSON.stringify(posts));
  }
}

// ============ Utilities ============
function readTime(content) {
  const mins = Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200));
  return `${mins} min read`;
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function excerpt(content, len = 150) {
  const t = content.replace(/[#*`\[\]()>!\-]/g, '').replace(/\n/g, ' ').trim();
  return t.length > len ? t.substring(0, len) + '…' : t;
}

// ============ Blog Listing Page ============
function initListing() {
  const store = new BlogStore();
  const grid = document.getElementById('blog-grid');
  const postView = document.getElementById('blog-post-view');
  const searchInput = document.getElementById('blog-search-input');
  const blogHeader = document.querySelector('.blog-header');
  if (!grid) return;

  function render(posts) {
    const pub = posts.filter(p => p.published);
    if (!pub.length) {
      grid.innerHTML = `<div class="blog-empty"><i class="fas fa-pen-fancy"></i><h3>No posts yet</h3><p>Check back soon for new content!</p></div>`;
      return;
    }
    grid.innerHTML = pub.map(post => `
      <article class="blog-card glass-card" data-id="${post.id}">
        <div class="blog-card-image ${post.featuredImage ? '' : 'blog-card-gradient'}"
          ${post.featuredImage ? `style="background-image:url('${post.featuredImage}')"` : ''}></div>
        <div class="blog-card-body">
          <div class="blog-card-meta">
            <span>${fmtDate(post.createdAt)}</span>
            <span>${readTime(post.content)}</span>
          </div>
          <h3 class="blog-card-title">${post.title}</h3>
          <p class="blog-card-excerpt">${excerpt(post.content)}</p>
          <div class="blog-card-tags">
            ${(post.tags || []).map(t => `<span class="blog-tag">${t}</span>`).join('')}
          </div>
        </div>
      </article>`).join('');

    grid.querySelectorAll('.blog-card').forEach(c =>
      c.addEventListener('click', () => showPost(c.dataset.id))
    );
  }

  function showPost(id) {
    const post = store.getById(id);
    if (!post) return;
    grid.style.display = 'none';
    if (blogHeader) blogHeader.style.display = 'none';
    postView.style.display = 'block';

    document.getElementById('post-title').textContent = post.title;
    document.getElementById('post-date').textContent = fmtDate(post.createdAt);
    document.getElementById('post-reading-time').textContent = readTime(post.content);
    document.getElementById('post-tags').innerHTML =
      (post.tags || []).map(t => `<span class="blog-tag">${t}</span>`).join('');

    const el = document.getElementById('post-content');
    el.innerHTML = DOMPurify.sanitize(marked.parse(post.content));
    el.querySelectorAll('pre code').forEach(b => hljs.highlightElement(b));
    window.scrollTo(0, 0);
  }

  document.getElementById('back-to-list')?.addEventListener('click', e => {
    e.preventDefault();
    postView.style.display = 'none';
    grid.style.display = '';
    if (blogHeader) blogHeader.style.display = '';
  });

  if (searchInput) {
    searchInput.addEventListener('input', e => {
      render(e.target.value ? store.search(e.target.value) : store.getAll());
    });
  }

  render(store.getAll());
}

// ============ Editor Page ============
function initEditor() {
  const store = new BlogStore();
  const md = document.getElementById('markdown-input');
  const preview = document.getElementById('preview-content');
  const titleIn = document.getElementById('post-title-input');
  const tagsIn = document.getElementById('post-tags-input');
  const imgIn = document.getElementById('post-image-input');
  const list = document.getElementById('posts-list');
  const status = document.getElementById('editor-status');
  if (!md) return;

  let currentId = null;

  marked.setOptions({ breaks: true, gfm: true });

  function updatePreview() {
    const html = marked.parse(md.value);
    preview.innerHTML = md.value
      ? DOMPurify.sanitize(html)
      : '<p class="preview-placeholder">Preview will appear here…</p>';
    preview.querySelectorAll('pre code').forEach(b => hljs.highlightElement(b));
  }

  md.addEventListener('input', updatePreview);

  // Toolbar
  function wrap(before, after) {
    const s = md.selectionStart, e = md.selectionEnd;
    const sel = md.value.substring(s, e) || 'text';
    md.value = md.value.substring(0, s) + before + sel + after + md.value.substring(e);
    md.focus();
    md.selectionStart = s + before.length;
    md.selectionEnd = s + before.length + sel.length;
    updatePreview();
  }
  function insert(txt) {
    const s = md.selectionStart;
    md.value = md.value.substring(0, s) + txt + md.value.substring(s);
    md.focus();
    md.selectionStart = md.selectionEnd = s + txt.length;
    updatePreview();
  }

  const actions = {
    bold: () => wrap('**', '**'), italic: () => wrap('*', '*'),
    heading: () => insert('### '), link: () => wrap('[', '](url)'),
    image: () => insert('![alt](image-url)'), code: () => wrap('```\n', '\n```'),
    quote: () => insert('> '), list: () => insert('- '),
  };

  document.querySelectorAll('[data-action]').forEach(btn =>
    btn.addEventListener('click', () => actions[btn.dataset.action]?.())
  );

  // Save
  function savePost(published) {
    if (!titleIn.value.trim()) { setStatus('Enter a title', 'error'); return; }
    const post = {
      id: currentId, title: titleIn.value.trim(), content: md.value,
      tags: tagsIn.value.split(',').map(t => t.trim()).filter(Boolean),
      featuredImage: imgIn.value.trim(), published,
    };
    const saved = store.save(post);
    currentId = saved.id;
    setStatus(published ? 'Published!' : 'Draft saved!', 'success');
    renderList();
  }

  document.getElementById('save-draft-btn')?.addEventListener('click', () => savePost(false));
  document.getElementById('publish-btn')?.addEventListener('click', () => savePost(true));
  document.getElementById('delete-btn')?.addEventListener('click', () => {
    if (currentId && confirm('Delete this post?')) {
      store.delete(currentId); reset(); renderList(); setStatus('Deleted', 'success');
    }
  });
  document.getElementById('new-post-btn')?.addEventListener('click', reset);

  function reset() {
    currentId = null;
    titleIn.value = tagsIn.value = imgIn.value = md.value = '';
    preview.innerHTML = '<p class="preview-placeholder">Preview will appear here…</p>';
    setStatus('');
    list.querySelectorAll('.sidebar-post').forEach(el => el.classList.remove('active'));
  }

  function loadPost(id) {
    const p = store.getById(id);
    if (!p) return;
    currentId = p.id;
    titleIn.value = p.title;
    tagsIn.value = (p.tags || []).join(', ');
    imgIn.value = p.featuredImage || '';
    md.value = p.content;
    updatePreview();
    setStatus(`Editing: ${p.title}`);
    list.querySelectorAll('.sidebar-post').forEach(el =>
      el.classList.toggle('active', el.dataset.id === id)
    );
  }

  function renderList() {
    const posts = store.getAll();
    if (!posts.length) {
      list.innerHTML = '<p class="sidebar-empty">No posts yet.</p>';
      return;
    }
    list.innerHTML = posts.map(p => `
      <div class="sidebar-post ${p.id === currentId ? 'active' : ''}" data-id="${p.id}">
        <div class="sidebar-post-info">
          <span class="sidebar-post-title">${p.title}</span>
          <span class="sidebar-post-date">${fmtDate(p.createdAt)}</span>
        </div>
        <span class="sidebar-post-status ${p.published ? 'published' : 'draft'}">
          ${p.published ? 'Live' : 'Draft'}
        </span>
      </div>`).join('');
    list.querySelectorAll('.sidebar-post').forEach(el =>
      el.addEventListener('click', () => loadPost(el.dataset.id))
    );
  }

  function setStatus(msg, type = '') {
    if (status) { status.textContent = msg; status.className = 'editor-status ' + type; }
  }

  // Export / Import
  document.getElementById('export-btn')?.addEventListener('click', () => {
    const blob = new Blob([store.exportAll()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'blog-posts.json'; a.click();
    setStatus('Exported!', 'success');
  });
  document.getElementById('import-btn')?.addEventListener('click', () => {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = '.json';
    inp.onchange = e => {
      const r = new FileReader();
      r.onload = ev => {
        try { store.importAll(ev.target.result); renderList(); setStatus('Imported!', 'success'); }
        catch { setStatus('Invalid file', 'error'); }
      };
      r.readAsText(e.target.files[0]);
    };
    inp.click();
  });

  // Drag-drop images
  md.addEventListener('dragover', e => { e.preventDefault(); md.classList.add('drag-over'); });
  md.addEventListener('dragleave', () => md.classList.remove('drag-over'));
  md.addEventListener('drop', e => {
    e.preventDefault(); md.classList.remove('drag-over');
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith('image/')) {
      const r = new FileReader();
      r.onload = ev => insert(`![image](${ev.target.result})`);
      r.readAsDataURL(f);
    }
  });

  // Keyboard shortcuts
  md.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') { e.preventDefault(); actions.bold(); }
      if (e.key === 'i') { e.preventDefault(); actions.italic(); }
      if (e.key === 's') { e.preventDefault(); savePost(false); }
    }
    if (e.key === 'Tab') { e.preventDefault(); insert('  '); }
  });

  renderList();
  updatePreview();
}

// ============ Init ============
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('blog-grid')) initListing();
  if (document.getElementById('markdown-input')) initEditor();
});
