document.addEventListener('DOMContentLoaded', function() {
    const STORAGE_KEY = 'animeTracker';
    let animeData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    let currentFilter = 'all';
    let editingAnimeId = null;
    let currentAnimeId = null;

    const statusLabels = {
        watching: '在看',
        plan: '想看',
        watched: '看过',
        pause: '搁置',
        drop: '弃番'
    };

    const statusColors = {
        watching: '#4CAF50',
        plan: '#2196F3',
        watched: '#9C27B0',
        pause: '#FF9800',
        drop: '#f44336'
    };

    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(animeData));
    }

    function updateStats() {
        const stats = {
            watching: 0,
            plan: 0,
            watched: 0,
            pause: 0,
            drop: 0
        };
        animeData.forEach(anime => {
            stats[anime.status]++;
        });
        document.getElementById('stat-watching').textContent = stats.watching;
        document.getElementById('stat-plan').textContent = stats.plan;
        document.getElementById('stat-watched').textContent = stats.watched;
        document.getElementById('stat-pause').textContent = stats.pause;
        document.getElementById('stat-drop').textContent = stats.drop;
    }

    function renderAnimeList() {
        const container = document.getElementById('anime-list');
        const filteredAnime = currentFilter === 'all'
            ? animeData
            : animeData.filter(a => a.status === currentFilter);

        if (filteredAnime.length === 0) {
            container.innerHTML = '<div class="anime-empty">暂无番剧，点击右上角添加吧~</div>';
            return;
        }

        container.innerHTML = filteredAnime.map(anime => `
            <div class="anime-card" data-id="${anime.id}">
                <div class="anime-cover-wrapper">
                    <img class="anime-cover" src="${anime.cover || 'https://source.fomal.cc/img/default_cover_14.webp'}" alt="${anime.name}">
                    <span class="anime-status-badge" style="background-color: ${statusColors[anime.status]}">${statusLabels[anime.status]}</span>
                </div>
                <div class="anime-info">
                    <h3 class="anime-name">${anime.name}</h3>
                    <p class="anime-desc">${anime.desc || '暂无简介'}</p>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.anime-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = parseInt(card.dataset.id);
                showAnimeDetail(id);
            });
        });
    }

    function showAnimeDetail(id) {
        const anime = animeData.find(a => a.id === id);
        if (!anime) return;

        currentAnimeId = id;
        document.getElementById('detail-cover').src = anime.cover || 'https://source.fomal.cc/img/default_cover_14.webp';
        document.getElementById('detail-name').textContent = anime.name;
        document.getElementById('detail-status').innerHTML = `<span style="color: ${statusColors[anime.status]}; font-weight: bold;">${statusLabels[anime.status]}</span>`;
        document.getElementById('detail-desc').textContent = anime.desc || '暂无简介';

        const linkEl = document.getElementById('detail-link');
        if (anime.link) {
            linkEl.href = anime.link;
            linkEl.style.display = 'inline-block';
        } else {
            linkEl.style.display = 'none';
        }

        document.getElementById('anime-detail-modal').style.display = 'flex';
    }

    function openAddModal() {
        editingAnimeId = null;
        document.getElementById('modal-title').textContent = '添加番剧';
        document.getElementById('anime-name').value = '';
        document.getElementById('anime-cover').value = '';
        document.getElementById('anime-status').value = 'watching';
        document.getElementById('anime-desc').value = '';
        document.getElementById('anime-link').value = '';
        document.getElementById('anime-modal').style.display = 'flex';
    }

    function openEditModal(anime) {
        editingAnimeId = anime.id;
        document.getElementById('modal-title').textContent = '编辑番剧';
        document.getElementById('anime-name').value = anime.name;
        document.getElementById('anime-cover').value = anime.cover || '';
        document.getElementById('anime-status').value = anime.status;
        document.getElementById('anime-desc').value = anime.desc || '';
        document.getElementById('anime-link').value = anime.link || '';
        document.getElementById('anime-modal').style.display = 'flex';
    }

    function closeModal() {
        document.getElementById('anime-modal').style.display = 'none';
        document.getElementById('anime-detail-modal').style.display = 'none';
        editingAnimeId = null;
        currentAnimeId = null;
    }

    function handleModalConfirm() {
        const name = document.getElementById('anime-name').value.trim();
        const cover = document.getElementById('anime-cover').value.trim();
        const status = document.getElementById('anime-status').value;
        const desc = document.getElementById('anime-desc').value.trim();
        const link = document.getElementById('anime-link').value.trim();

        if (!name) {
            alert('请输入番剧名称');
            return;
        }

        if (editingAnimeId) {
            const index = animeData.findIndex(a => a.id === editingAnimeId);
            if (index !== -1) {
                animeData[index] = {
                    ...animeData[index],
                    name,
                    cover,
                    status,
                    desc,
                    link
                };
            }
        } else {
            const newAnime = {
                id: Date.now(),
                name,
                cover,
                status,
                desc,
                link,
                addTime: new Date().toISOString()
            };
            animeData.unshift(newAnime);
        }

        saveData();
        updateStats();
        renderAnimeList();
        closeModal();
    }

    function deleteAnime() {
        if (!currentAnimeId) return;
        if (confirm('确定要删除这个番剧吗？')) {
            animeData = animeData.filter(a => a.id !== currentAnimeId);
            saveData();
            updateStats();
            renderAnimeList();
            closeModal();
        }
    }

    document.getElementById('add-anime-btn').addEventListener('click', openAddModal);
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-cancel').addEventListener('click', closeModal);
    document.getElementById('modal-confirm').addEventListener('click', handleModalConfirm);

    document.getElementById('detail-back').addEventListener('click', closeModal);
    document.getElementById('detail-edit').addEventListener('click', () => {
        const anime = animeData.find(a => a.id === currentAnimeId);
        if (anime) {
            closeModal();
            openEditModal(anime);
        }
    });
    document.getElementById('detail-delete').addEventListener('click', deleteAnime);

    document.querySelectorAll('.filter-btn[data-status]').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.classList.contains('add-btn')) return;
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.status;
            renderAnimeList();
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal();
        }
    });

    updateStats();
    renderAnimeList();

    const style = document.createElement('style');
    style.textContent = `
        #Anime-Tracker {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .anime-header {
            text-align: center;
            margin-bottom: 30px;
        }
        .anime-header h1 {
            font-size: 2em;
            margin-bottom: 10px;
        }
        .anime-subtitle {
            color: #666;
            font-size: 1.1em;
        }
        .anime-stats {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-bottom: 30px;
            flex-wrap: wrap;
        }
        .stat-item {
            text-align: center;
            padding: 15px 25px;
            background: var(--card-bg);
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .stat-label {
            display: block;
            font-size: 0.9em;
            color: #666;
            margin-bottom: 5px;
        }
        .stat-value {
            font-size: 1.8em;
            font-weight: bold;
            color: var(--text-highlight-color);
        }
        .anime-filter {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
            flex-wrap: wrap;
            justify-content: center;
        }
        .filter-btn {
            padding: 8px 16px;
            border: none;
            border-radius: 20px;
            background: var(--card-bg);
            color: var(--text-color);
            cursor: pointer;
            transition: all 0.3s;
            font-size: 0.95em;
        }
        .filter-btn:hover {
            background: var(--text-hover-color);
            color: #fff;
        }
        .filter-btn.active {
            background: var(--theme-color);
            color: #fff;
        }
        .filter-btn.add-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff;
        }
        .anime-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 25px;
        }
        .anime-card {
            background: var(--card-bg);
            border-radius: 12px;
            overflow: hidden;
            cursor: pointer;
            transition: transform 0.3s, box-shadow 0.3s;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .anime-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 20px rgba(0,0,0,0.15);
        }
        .anime-cover-wrapper {
            position: relative;
            width: 100%;
            padding-top: 140%;
            overflow: hidden;
        }
        .anime-cover {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .anime-status-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            padding: 4px 10px;
            border-radius: 12px;
            color: #fff;
            font-size: 0.8em;
            font-weight: bold;
        }
        .anime-info {
            padding: 15px;
        }
        .anime-name {
            font-size: 1.1em;
            margin: 0 0 8px 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .anime-desc {
            font-size: 0.85em;
            color: #666;
            margin: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            line-height: 1.4;
        }
        .anime-empty {
            text-align: center;
            padding: 60px 20px;
            color: #999;
            font-size: 1.1em;
        }
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            z-index: 10000;
            justify-content: center;
            align-items: center;
        }
        .modal-content {
            background: var(--card-bg);
            border-radius: 15px;
            width: 90%;
            max-width: 500px;
            max-height: 90vh;
            overflow-y: auto;
        }
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid var(--border-color);
        }
        .modal-header h3 {
            margin: 0;
        }
        .modal-close {
            font-size: 1.8em;
            cursor: pointer;
            color: #999;
        }
        .modal-close:hover {
            color: #333;
        }
        .modal-body {
            padding: 20px;
        }
        .form-group {
            margin-bottom: 18px;
        }
        .form-group label {
            display: block;
            margin-bottom: 6px;
            font-weight: 500;
        }
        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            font-size: 1em;
            box-sizing: border-box;
            background: var(--bg-color);
            color: var(--text-color);
        }
        .form-group textarea {
            min-height: 80px;
            resize: vertical;
        }
        .modal-footer {
            padding: 15px 20px;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            border-top: 1px solid var(--border-color);
        }
        .btn-cancel,
        .btn-confirm {
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1em;
        }
        .btn-cancel {
            background: #e0e0e0;
            color: #333;
        }
        .btn-confirm {
            background: var(--theme-color);
            color: #fff;
        }
        .anime-detail-content {
            max-width: 700px;
        }
        .anime-detail-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            border-bottom: 1px solid var(--border-color);
        }
        .detail-back {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 1em;
            color: var(--text-color);
        }
        .detail-actions {
            display: flex;
            gap: 10px;
        }
        .btn-edit,
        .btn-delete {
            padding: 6px 12px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9em;
        }
        .btn-edit {
            background: #2196F3;
            color: #fff;
        }
        .btn-delete {
            background: #f44336;
            color: #fff;
        }
        .anime-detail-body {
            padding: 20px;
            display: flex;
            gap: 25px;
        }
        .detail-cover {
            flex: 0 0 200px;
        }
        .detail-cover img {
            width: 100%;
            border-radius: 10px;
        }
        .detail-info {
            flex: 1;
        }
        .detail-info h2 {
            margin: 0 0 10px 0;
        }
        .detail-status {
            margin-bottom: 15px;
            font-size: 1.1em;
        }
        .detail-desc {
            color: #666;
            line-height: 1.6;
            margin-bottom: 15px;
        }
        .detail-link {
            display: inline-block;
            padding: 8px 16px;
            background: var(--theme-color);
            color: #fff;
            text-decoration: none;
            border-radius: 6px;
            font-size: 0.95em;
        }
        .detail-link:hover {
            opacity: 0.9;
        }
        @media (max-width: 600px) {
            .anime-stats {
                gap: 15px;
            }
            .stat-item {
                padding: 10px 15px;
            }
            .anime-list {
                grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                gap: 15px;
            }
            .anime-detail-body {
                flex-direction: column;
            }
            .detail-cover {
                flex: 0 0 auto;
                max-width: 200px;
                margin: 0 auto;
            }
        }
    `;
    document.head.appendChild(style);
});