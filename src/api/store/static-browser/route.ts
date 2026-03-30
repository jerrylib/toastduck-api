import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

const HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Static File Browser — ToastDuck</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #f5f5f5;
      color: #1a1a1a;
      min-height: 100vh;
    }

    header {
      background: #1a1a1a;
      color: #fff;
      padding: 16px 32px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    header h1 { font-size: 18px; font-weight: 600; letter-spacing: -0.3px; }
    header span { font-size: 13px; color: #888; }

    main { max-width: 960px; margin: 32px auto; padding: 0 24px; }

    /* Upload card */
    .upload-card {
      background: #fff;
      border: 1px solid #e5e5e5;
      border-radius: 10px;
      padding: 24px;
      margin-bottom: 24px;
    }
    .upload-card h2 { font-size: 14px; font-weight: 600; margin-bottom: 16px; color: #555; text-transform: uppercase; letter-spacing: 0.5px; }

    .drop-zone {
      border: 2px dashed #d0d0d0;
      border-radius: 8px;
      padding: 32px;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.2s, background 0.2s;
      position: relative;
    }
    .drop-zone:hover, .drop-zone.dragover { border-color: #555; background: #fafafa; }
    .drop-zone input[type="file"] {
      position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%;
    }
    .drop-zone p { font-size: 14px; color: #888; pointer-events: none; }
    .drop-zone p strong { color: #333; }

    .upload-actions { display: flex; align-items: center; gap: 12px; margin-top: 14px; }
    #selected-files { font-size: 13px; color: #666; flex: 1; }

    .btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 8px 18px; border-radius: 6px; font-size: 13px; font-weight: 500;
      cursor: pointer; border: none; transition: background 0.15s, opacity 0.15s;
    }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-primary { background: #1a1a1a; color: #fff; }
    .btn-primary:hover:not(:disabled) { background: #333; }
    .btn-danger { background: #fee2e2; color: #b91c1c; }
    .btn-danger:hover:not(:disabled) { background: #fecaca; }

    /* Progress */
    #upload-progress { display: none; margin-top: 12px; }
    #upload-progress progress { width: 100%; height: 6px; border-radius: 3px; }
    #upload-status { font-size: 12px; color: #666; margin-top: 6px; }

    /* File table */
    .files-card {
      background: #fff;
      border: 1px solid #e5e5e5;
      border-radius: 10px;
      overflow: hidden;
    }
    .files-header {
      padding: 16px 24px;
      border-bottom: 1px solid #e5e5e5;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .files-header h2 { font-size: 14px; font-weight: 600; color: #555; text-transform: uppercase; letter-spacing: 0.5px; }
    #file-count { font-size: 13px; color: #888; }

    table { width: 100%; border-collapse: collapse; }
    thead th {
      text-align: left; font-size: 11px; font-weight: 600; color: #888;
      text-transform: uppercase; letter-spacing: 0.5px;
      padding: 10px 24px; border-bottom: 1px solid #e5e5e5; background: #fafafa;
    }
    tbody tr { transition: background 0.1s; }
    tbody tr:hover { background: #fafafa; }
    tbody tr + tr { border-top: 1px solid #f0f0f0; }
    tbody td { padding: 12px 24px; font-size: 13px; vertical-align: middle; }

    .file-name a {
      color: #1a1a1a; text-decoration: none; font-weight: 500;
      word-break: break-all;
    }
    .file-name a:hover { text-decoration: underline; color: #555; }

    .file-ext {
      display: inline-block; font-size: 10px; font-weight: 600;
      padding: 2px 6px; border-radius: 4px; margin-left: 6px;
      background: #f0f0f0; color: #666; text-transform: uppercase; vertical-align: middle;
    }

    .col-size { color: #666; white-space: nowrap; }
    .col-date { color: #666; white-space: nowrap; font-size: 12px; }

    .empty-state {
      text-align: center; padding: 48px 24px; color: #aaa;
    }
    .empty-state svg { margin-bottom: 12px; opacity: 0.4; }
    .empty-state p { font-size: 14px; }

    /* Toast */
    #toast {
      position: fixed; bottom: 24px; right: 24px;
      padding: 12px 20px; border-radius: 8px; font-size: 13px; font-weight: 500;
      color: #fff; opacity: 0; transform: translateY(8px);
      transition: opacity 0.25s, transform 0.25s;
      pointer-events: none; z-index: 9999;
    }
    #toast.show { opacity: 1; transform: translateY(0); }
    #toast.success { background: #16a34a; }
    #toast.error { background: #dc2626; }

    /* Loading spinner */
    .spinner {
      display: inline-block; width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff;
      border-radius: 50%; animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 600px) {
      .col-date { display: none; }
      thead th:nth-child(3) { display: none; }
    }
  </style>
</head>
<body>

<header>
  <h1>📁 Static File Browser</h1>
  <span>/ static</span>
</header>

<main>
  <!-- Upload -->
  <div class="upload-card">
    <h2>上传文件</h2>
    <div class="drop-zone" id="drop-zone">
      <input type="file" id="file-input" multiple />
      <p><strong>点击选择文件</strong>，或将文件拖拽到此处</p>
    </div>
    <div class="upload-actions">
      <span id="selected-files">未选择文件</span>
      <button class="btn btn-primary" id="upload-btn" disabled>
        上传
      </button>
    </div>
    <div id="upload-progress">
      <progress id="progress-bar" value="0" max="100"></progress>
      <div id="upload-status"></div>
    </div>
  </div>

  <!-- File list -->
  <div class="files-card">
    <div class="files-header">
      <h2>文件列表</h2>
      <span id="file-count">加载中…</span>
    </div>
    <div id="file-table-container">
      <div class="empty-state"><p>加载中…</p></div>
    </div>
  </div>
</main>

<div id="toast"></div>

<script>
  const API_LIST   = '/store/static';
  const API_UPLOAD = '/store/static-upload';

  // ── Toast ──────────────────────────────────────────────────────────────────
  function showToast(msg, type = 'success') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'show ' + type;
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.className = ''; }, 3000);
  }

  // ── Format helpers ─────────────────────────────────────────────────────────
  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleString('zh-CN', { hour12: false });
  }

  function extBadge(name) {
    const ext = name.split('.').pop() || '';
    if (!ext || ext === name) return '';
    return '<span class="file-ext">' + ext + '</span>';
  }

  // ── Load file list ─────────────────────────────────────────────────────────
  async function loadFiles() {
    const container = document.getElementById('file-table-container');
    const countEl   = document.getElementById('file-count');
    try {
      const res  = await fetch(API_LIST);
      const data = await res.json();
      const files = data.files || [];

      countEl.textContent = files.length + ' 个文件';

      if (files.length === 0) {
        container.innerHTML = '<div class="empty-state">' +
          '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 7h18M3 12h18M3 17h18"/></svg>' +
          '<p>目录为空，请上传文件</p></div>';
        return;
      }

      let rows = '';
      files.forEach(f => {
        rows += '<tr>' +
          '<td class="file-name"><a href="' + f.url + '" target="_blank" rel="noopener">' +
            f.name + extBadge(f.name) + '</a></td>' +
          '<td class="col-size">' + f.sizeFormatted + '</td>' +
          '<td class="col-date">' + formatDate(f.modifiedAt) + '</td>' +
          '<td><button class="btn btn-danger" onclick="deleteFile(' + JSON.stringify(f.name) + ', this)">删除</button></td>' +
          '</tr>';
      });

      container.innerHTML = '<table>' +
        '<thead><tr>' +
          '<th>文件名</th><th>大小</th><th>修改时间</th><th></th>' +
        '</tr></thead>' +
        '<tbody>' + rows + '</tbody>' +
        '</table>';
    } catch (e) {
      countEl.textContent = '加载失败';
      container.innerHTML = '<div class="empty-state"><p>无法加载文件列表：' + e.message + '</p></div>';
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function deleteFile(name, btn) {
    if (!confirm('确定要删除 ' + name + ' 吗？')) return;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>';
    try {
      const res = await fetch('/store/static/' + encodeURIComponent(name), { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        showToast('已删除：' + name, 'success');
        loadFiles();
      } else {
        showToast('删除失败：' + (data.error || res.statusText), 'error');
        btn.disabled = false;
        btn.textContent = '删除';
      }
    } catch (e) {
      showToast('删除失败：' + e.message, 'error');
      btn.disabled = false;
      btn.textContent = '删除';
    }
  }

  // ── Upload ─────────────────────────────────────────────────────────────────
  const fileInput  = document.getElementById('file-input');
  const uploadBtn  = document.getElementById('upload-btn');
  const selectedEl = document.getElementById('selected-files');
  const dropZone   = document.getElementById('drop-zone');
  const progressEl = document.getElementById('upload-progress');
  const progressBar= document.getElementById('progress-bar');
  const statusEl   = document.getElementById('upload-status');

  fileInput.addEventListener('change', () => {
    const n = fileInput.files.length;
    selectedEl.textContent = n > 0 ? '已选择 ' + n + ' 个文件' : '未选择文件';
    uploadBtn.disabled = n === 0;
  });

  // Drag & drop
  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    fileInput.files = e.dataTransfer.files;
    fileInput.dispatchEvent(new Event('change'));
  });

  uploadBtn.addEventListener('click', async () => {
    const files = fileInput.files;
    if (!files || files.length === 0) return;

    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<span class="spinner"></span> 上传中…';
    progressEl.style.display = 'block';
    progressBar.value = 0;
    statusEl.textContent = '准备上传…';

    const formData = new FormData();
    for (const f of files) formData.append('files', f);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', API_UPLOAD);

      xhr.upload.addEventListener('progress', e => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          progressBar.value = pct;
          statusEl.textContent = '上传中… ' + pct + '%';
        }
      });

      xhr.onload = () => {
        progressBar.value = 100;
        if (xhr.status >= 200 && xhr.status < 300) {
          let data = {};
          try { data = JSON.parse(xhr.responseText); } catch(_) {}
          const count = (data.uploaded || []).length;
          showToast('成功上传 ' + count + ' 个文件', 'success');
          statusEl.textContent = '上传完成！';
          fileInput.value = '';
          selectedEl.textContent = '未选择文件';
          loadFiles();
        } else {
          let msg = '上传失败';
          try { msg = JSON.parse(xhr.responseText).error || msg; } catch(_) {}
          showToast(msg, 'error');
          statusEl.textContent = '上传失败：' + msg;
        }
        uploadBtn.disabled = false;
        uploadBtn.textContent = '上传';
        setTimeout(() => { progressEl.style.display = 'none'; }, 3000);
      };

      xhr.onerror = () => {
        showToast('网络错误，上传失败', 'error');
        statusEl.textContent = '网络错误';
        uploadBtn.disabled = false;
        uploadBtn.textContent = '上传';
      };

      xhr.send(formData);
    } catch (e) {
      showToast('上传失败：' + e.message, 'error');
      uploadBtn.disabled = false;
      uploadBtn.textContent = '上传';
    }
  });

  // ── Init ───────────────────────────────────────────────────────────────────
  loadFiles();
</script>
</body>
</html>`;

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(HTML);
}
