/**
 * 推し酒アプリ - UIコンポーネント
 * レーダーチャート、モーダル、トースト、各種UI要素
 */

// ==================== トースト通知 ====================

/**
 * トースト通知を表示
 * @param {string} message - メッセージ
 * @param {string} type - 'success' | 'error' | 'info'
 * @param {number} duration - 表示時間（ミリ秒）
 */
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };

    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // アニメーション後に削除
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, duration);
}

// ==================== モーダル ====================

/**
 * モーダルを表示
 * @param {string} content - HTMLコンテンツ
 */
function showModal(content) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    if (modal && modalBody) {
        modalBody.innerHTML = content;
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * モーダルを閉じる
 */
function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

// モーダルの背景クリックで閉じる
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
});

// ==================== レーダーチャート ====================

let radarChartInstance = null;

/**
 * レーダーチャートを描画
 * @param {string} canvasId - キャンバスID
 * @param {Object} data - 味覚データ
 */
function renderRadarChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // 既存のチャートを破棄
    if (radarChartInstance && radarChartInstance.canvas.id === canvasId) {
        radarChartInstance.destroy();
    }

    radarChartInstance = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['甘み', '酸味', '旨み', '苦味', '香り'],
            datasets: [{
                label: '味覚プロファイル',
                data: [
                    data.sweetness || 3,
                    data.acidity || 3,
                    data.umami || 3,
                    data.bitterness || 3,
                    data.aroma || 3
                ],
                backgroundColor: 'rgba(220, 38, 38, 0.2)',
                borderColor: 'rgba(220, 38, 38, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(220, 38, 38, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(220, 38, 38, 1)',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                r: {
                    min: 0,
                    max: 5,
                    ticks: {
                        stepSize: 1,
                        font: {
                            family: "'Noto Sans JP', sans-serif",
                            size: 12
                        }
                    },
                    pointLabels: {
                        font: {
                            family: "'Noto Sans JP', sans-serif",
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    angleLines: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// ==================== ホームタブコンテンツ ====================

function renderHomeTab() {
    const collection = dataManager.getCollection();
    const stamps = dataManager.getStamps();
    const favorites = dataManager.getFavorites();
    const unlockedStamps = stamps.filter(s => s.unlocked).length;

    return `
        <div class="space-y-6 fade-in">
            <!-- ウェルカムバナー -->
            <div class="bg-gradient-to-r from-red-600 to-pink-600 text-white p-6 rounded-xl shadow-lg">
                <h3 class="text-2xl font-bold mb-2">おかえりなさい！</h3>
                <p class="text-sm opacity-90">あなたの推し酒コレクション</p>
            </div>

            <!-- 統計カード -->
            <div class="grid grid-cols-2 gap-4">
                <div class="bg-white p-4 rounded-xl shadow-md border border-gray-100 card">
                    <div class="flex items-center gap-3">
                        <div class="bg-red-100 p-3 rounded-lg">
                            <i class="fas fa-flask text-red-600 text-2xl"></i>
                        </div>
                        <div>
                            <p class="text-gray-500 text-sm">収集銘柄</p>
                            <p class="text-2xl font-bold text-gray-800">${collection.length}</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white p-4 rounded-xl shadow-md border border-gray-100 card">
                    <div class="flex items-center gap-3">
                        <div class="bg-pink-100 p-3 rounded-lg">
                            <i class="fas fa-stamp text-pink-600 text-2xl"></i>
                        </div>
                        <div>
                            <p class="text-gray-500 text-sm">御酒印</p>
                            <p class="text-2xl font-bold text-gray-800">${unlockedStamps}/${stamps.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 話題の推し（お気に入り） -->
            <div class="bg-white p-4 rounded-xl shadow-md border border-gray-100">
                <h4 class="font-bold text-lg mb-4 flex items-center gap-2">
                    <i class="fas fa-heart text-red-600"></i>
                    話題の推し
                </h4>
                ${favorites.length > 0 ? `
                    <div class="grid grid-cols-2 gap-3">
                        ${favorites.slice(0, 4).map(sake => `
                            <div class="cursor-pointer card" onclick="showSakeDetail('${sake.id}')">
                                <div class="relative">
                                    <img src="${sake.character_image}" alt="${sake.character_name}" 
                                         class="w-full h-32 object-cover rounded-lg">
                                    <div class="absolute top-2 right-2">
                                        <span class="rarity-badge ${sake.character_rarity}">${getRarityLabel(sake.character_rarity)}</span>
                                    </div>
                                </div>
                                <p class="mt-2 font-semibold text-sm truncate">${sake.character_name}</p>
                                <p class="text-xs text-gray-500 truncate">${sake.brand_name}</p>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="text-center py-8 text-gray-400">
                        <i class="fas fa-heart text-4xl mb-2"></i>
                        <p>お気に入りがまだありません</p>
                        <p class="text-sm">❤️をタップしてお気に入り登録しよう！</p>
                    </div>
                `}
            </div>

            <!-- 最近の活動 -->
            <div class="bg-white p-4 rounded-xl shadow-md border border-gray-100">
                <h4 class="font-bold text-lg mb-4 flex items-center gap-2">
                    <i class="fas fa-clock text-blue-600"></i>
                    最近の活動
                </h4>
                ${collection.length > 0 ? `
                    <div class="space-y-3">
                        ${collection.slice(0, 5).map(sake => `
                            <div class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition" onclick="showSakeDetail('${sake.id}')">
                                <img src="${sake.character_image}" alt="${sake.character_name}" 
                                     class="w-12 h-12 object-cover rounded-lg">
                                <div class="flex-1 min-w-0">
                                    <p class="font-semibold text-sm truncate">${sake.character_name}</p>
                                    <p class="text-xs text-gray-500 truncate">${sake.brand_name}</p>
                                </div>
                                <span class="text-xs text-gray-400">${formatDate(sake.collected_date)}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="text-center py-8 text-gray-400">
                        <i class="fas fa-camera text-4xl mb-2"></i>
                        <p>まだコレクションがありません</p>
                        <p class="text-sm">カメラタブから推し酒を生成しよう！</p>
                    </div>
                `}
            </div>

            <!-- クイックアクション -->
            <div class="grid grid-cols-2 gap-3">
                <button onclick="switchTab('camera')" 
                        class="btn btn-primary text-white py-3 rounded-xl flex items-center justify-center gap-2">
                    <i class="fas fa-camera"></i>
                    <span>キャラ生成</span>
                </button>
                <button onclick="switchTab('collection')" 
                        class="bg-white border-2 border-red-600 text-red-600 py-3 rounded-xl flex items-center justify-center gap-2 btn">
                    <i class="fas fa-flask"></i>
                    <span>図鑑を見る</span>
                </button>
            </div>
        </div>
    `;
}

// ==================== カメラタブコンテンツ ====================

function renderCameraTab() {
    return `
        <div class="space-y-6 fade-in">
            <!-- タイトル -->
            <div class="text-center">
                <h3 class="text-2xl font-bold mb-2">AI推し酒キャラクター生成</h3>
                <p class="text-gray-600 text-sm">日本酒ラベルから美しいキャラクターを生成</p>
            </div>

            <!-- カメラプレビュー -->
            <div class="camera-preview bg-gray-100 rounded-xl overflow-hidden" id="camera-preview-container">
                <div class="aspect-[3/4] flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <div class="text-center text-gray-400">
                        <i class="fas fa-camera text-6xl mb-4"></i>
                        <p class="text-lg">日本酒ラベルを撮影</p>
                        <p class="text-sm">または画像を選択してください</p>
                    </div>
                </div>
            </div>

            <!-- カメラコントロール -->
            <div class="grid grid-cols-2 gap-3">
                <button onclick="openCamera()" id="camera-btn"
                        class="bg-blue-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 btn">
                    <i class="fas fa-redo"></i>
                    <span>再撮影</span>
                </button>
                <label class="bg-green-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 btn cursor-pointer">
                    <i class="fas fa-image"></i>
                    <span>ファイル</span>
                    <input type="file" accept="image/*" onchange="handleFileSelect(event)" class="hidden">
                </label>
            </div>

            <!-- 生成ボタン -->
            <button onclick="generateCharacter()" id="generate-btn"
                    class="w-full btn btn-primary text-white py-4 rounded-xl flex items-center justify-center gap-2 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled>
                <i class="fas fa-magic"></i>
                <span>キャラクターを生成</span>
            </button>

            <!-- 生成中のステータス -->
            <div id="generation-status" class="hidden">
                <div class="bg-white p-6 rounded-xl shadow-md border border-gray-100 text-center">
                    <div class="spinner mx-auto mb-4"></div>
                    <p class="font-semibold text-gray-800 mb-2" id="status-message">生成中...</p>
                    <p class="text-sm text-gray-500" id="status-detail">しばらくお待ちください</p>
                </div>
            </div>

            <!-- 生成結果 -->
            <div id="generation-result" class="hidden">
                <!-- 結果はJavaScriptで動的に挿入 -->
            </div>

            <!-- 説明 -->
            <div class="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <h4 class="font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <i class="fas fa-info-circle"></i>
                    使い方
                </h4>
                <ul class="text-sm text-blue-800 space-y-1">
                    <li>• 明るい場所でラベルを撮影</li>
                    <li>• ラベル全体が映るように</li>
                    <li>• 生成には30-60秒かかります</li>
                    <li>• レアリティはランダムで決定</li>
                </ul>
            </div>
        </div>
    `;
}

// ==================== 図鑑タブコンテンツ ====================

function renderCollectionTab() {
    const collection = dataManager.getCollection();
    const rarities = ['legendary', 'epic', 'rare', 'common'];
    
    return `
        <div class="space-y-6 fade-in">
            <!-- ヘッダー -->
            <div class="flex items-center justify-between">
                <h3 class="text-xl font-bold">コレクション図鑑</h3>
                <span class="text-sm text-gray-500">${collection.length}種類</span>
            </div>

            <!-- フィルター -->
            <div class="flex gap-2 overflow-x-auto pb-2">
                <button onclick="filterCollection('all')" 
                        class="filter-btn active px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition"
                        data-filter="all">
                    すべて (${collection.length})
                </button>
                ${rarities.map(rarity => {
                    const count = collection.filter(s => s.character_rarity === rarity).length;
                    return `
                        <button onclick="filterCollection('${rarity}')" 
                                class="filter-btn px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition"
                                data-filter="${rarity}">
                            ${getRarityLabel(rarity)} (${count})
                        </button>
                    `;
                }).join('')}
            </div>

            <!-- コレクショングリッド -->
            <div id="collection-grid">
                ${collection.length > 0 ? `
                    <div class="grid grid-cols-2 gap-4">
                        ${collection.map(sake => renderSakeCard(sake)).join('')}
                    </div>
                ` : `
                    <div class="text-center py-16">
                        <i class="fas fa-flask text-6xl text-gray-300 mb-4"></i>
                        <p class="text-gray-500 text-lg mb-2">コレクションが空です</p>
                        <p class="text-gray-400 text-sm mb-6">カメラタブから推し酒を生成しましょう！</p>
                        <button onclick="switchTab('camera')" 
                                class="btn btn-primary text-white px-6 py-3 rounded-xl">
                            <i class="fas fa-camera mr-2"></i>
                            キャラクター生成
                        </button>
                    </div>
                `}
            </div>
        </div>
    `;
}

// ==================== スタンプタブコンテンツ ====================

function renderStampsTab() {
    const stamps = dataManager.getStamps();
    const unlocked = stamps.filter(s => s.unlocked).length;

    return `
        <div class="space-y-6 fade-in">
            <!-- ヘッダー -->
            <div class="text-center">
                <h3 class="text-2xl font-bold mb-2">御酒印コレクション</h3>
                <p class="text-gray-600 text-sm">達成度: ${unlocked}/${stamps.length}</p>
                <div class="mt-4">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(unlocked/stamps.length)*100}%"></div>
                    </div>
                </div>
            </div>

            <!-- スタンプグリッド -->
            <div class="grid grid-cols-2 gap-4">
                ${stamps.map(stamp => `
                    <div class="stamp-card ${stamp.unlocked ? 'unlocked' : 'locked'} bg-white p-4 rounded-xl shadow-md border border-gray-100 text-center">
                        <div class="stamp-icon mb-3" style="color: ${stamp.color}">
                            <i class="fas ${stamp.icon}"></i>
                        </div>
                        <h4 class="font-bold text-sm mb-1">${stamp.name}</h4>
                        <p class="text-xs text-gray-500 mb-3">${stamp.description}</p>
                        
                        ${stamp.unlocked ? `
                            <div class="text-green-600 font-semibold text-sm">
                                <i class="fas fa-check-circle mr-1"></i>
                                達成済み
                            </div>
                            ${stamp.unlocked_date ? `
                                <p class="text-xs text-gray-400 mt-1">${formatDate(stamp.unlocked_date)}</p>
                            ` : ''}
                        ` : `
                            <div class="text-gray-400 text-sm">
                                <div class="progress-bar h-2 mb-1">
                                    <div class="progress-fill bg-gray-400" 
                                         style="width: ${Math.min(100, (stamp.progress || 0) / stamp.target * 100)}%"></div>
                                </div>
                                <span class="text-xs">${stamp.progress || 0}/${stamp.target}</span>
                            </div>
                        `}
                    </div>
                `).join('')}
            </div>

            <!-- ヒント -->
            <div class="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                <h4 class="font-bold text-yellow-900 mb-2 flex items-center gap-2">
                    <i class="fas fa-lightbulb"></i>
                    スタンプを集めよう
                </h4>
                <p class="text-sm text-yellow-800">
                    様々な活動を通じてスタンプを獲得できます。コレクションを増やしたり、テイスティング記録をつけたり、コミュニティに投稿したりして、すべてのスタンプをコンプリートしましょう！
                </p>
            </div>
        </div>
    `;
}

// ==================== ユーティリティ関数 ====================

/**
 * レアリティラベルを取得
 */
function getRarityLabel(rarity) {
    const labels = {
        common: 'コモン',
        rare: 'レア',
        epic: 'エピック',
        legendary: 'レジェンダリー'
    };
    return labels[rarity] || 'コモン';
}

/**
 * 日付フォーマット
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    if (days < 7) return `${days}日前`;
    
    return `${date.getMonth() + 1}/${date.getDate()}`;
}

/**
 * 日本酒カードをレンダリング
 */
function renderSakeCard(sake) {
    return `
        <div class="character-card rarity-${sake.character_rarity}" data-rarity="${sake.character_rarity}" onclick="showSakeDetail('${sake.id}')">
            <div class="relative">
                <img src="${sake.character_image}" alt="${sake.character_name}" class="character-image">
                <button class="favorite-btn ${sake.favorite ? 'active' : ''}" 
                        onclick="event.stopPropagation(); toggleFavorite('${sake.id}')">
                    <i class="fas fa-heart"></i>
                </button>
                <div class="absolute top-2 left-2">
                    <span class="rarity-badge ${sake.character_rarity}">${getRarityLabel(sake.character_rarity)}</span>
                </div>
                <div class="absolute bottom-2 left-2">
                    <span class="level-badge">Lv.${sake.character_level}</span>
                </div>
            </div>
            <div class="p-3">
                <h4 class="font-bold text-sm mb-1 truncate">${sake.character_name}</h4>
                <p class="text-xs text-gray-600 truncate">${sake.brand_name}</p>
                <p class="text-xs text-gray-500 truncate">${sake.brewery_name}</p>
                <div class="exp-bar mt-2">
                    <div class="exp-fill" style="width: ${sake.character_exp}%"></div>
                </div>
            </div>
        </div>
    `;
}

// ==================== コミュニティタブコンテンツ ====================

function renderCommunityTab() {
    const posts = dataManager.getCommunityPosts();

    return `
        <div class="space-y-6 fade-in">
            <!-- ヘッダー -->
            <div class="flex items-center justify-between">
                <h3 class="text-xl font-bold">推し酒コミュニティ</h3>
                <button onclick="showCreatePostModal()" 
                        class="btn btn-primary text-white px-4 py-2 rounded-lg text-sm">
                    <i class="fas fa-plus mr-1"></i>
                    投稿
                </button>
            </div>

            <!-- 投稿リスト -->
            <div class="space-y-4">
                ${posts.length > 0 ? posts.map(post => `
                    <div class="bg-white p-4 rounded-xl shadow-md border border-gray-100 card">
                        <!-- ユーザー情報 -->
                        <div class="flex items-center gap-3 mb-3">
                            <img src="${post.user.avatar}" alt="${post.user.name}" 
                                 class="w-10 h-10 rounded-full">
                            <div class="flex-1">
                                <p class="font-semibold text-sm">${post.user.name}</p>
                                <p class="text-xs text-gray-500">${formatDate(post.timestamp)}</p>
                            </div>
                        </div>

                        <!-- 投稿内容 -->
                        <p class="text-sm mb-3 whitespace-pre-wrap">${post.content}</p>

                        <!-- 画像 -->
                        ${post.image ? `
                            <img src="${post.image}" alt="投稿画像" 
                                 class="w-full rounded-lg mb-3">
                        ` : ''}

                        <!-- ハッシュタグ -->
                        ${post.hashtags && post.hashtags.length > 0 ? `
                            <div class="flex flex-wrap gap-2 mb-3">
                                ${post.hashtags.map(tag => `
                                    <span class="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                                        ${tag}
                                    </span>
                                `).join('')}
                            </div>
                        ` : ''}

                        <!-- アクション -->
                        <div class="flex items-center gap-4 text-gray-500 text-sm pt-3 border-t border-gray-100">
                            <button class="flex items-center gap-1 hover:text-red-600 transition">
                                <i class="far fa-heart"></i>
                                <span>${post.likes}</span>
                            </button>
                            <button class="flex items-center gap-1 hover:text-blue-600 transition">
                                <i class="far fa-comment"></i>
                                <span>${post.comments}</span>
                            </button>
                            <button class="flex items-center gap-1 hover:text-green-600 transition">
                                <i class="fas fa-share"></i>
                            </button>
                        </div>
                    </div>
                `).join('') : `
                    <div class="text-center py-16">
                        <i class="fas fa-comments text-6xl text-gray-300 mb-4"></i>
                        <p class="text-gray-500 text-lg mb-2">まだ投稿がありません</p>
                        <p class="text-gray-400 text-sm mb-6">最初の投稿を作成しましょう！</p>
                        <button onclick="showCreatePostModal()" 
                                class="btn btn-primary text-white px-6 py-3 rounded-xl">
                            <i class="fas fa-plus mr-2"></i>
                            投稿する
                        </button>
                    </div>
                `}
            </div>
        </div>
    `;
}

// ==================== テイスティングタブコンテンツ ====================

function renderTastingTab() {
    const collection = dataManager.getCollection();

    return `
        <div class="space-y-6 fade-in">
            <!-- ヘッダー -->
            <div class="text-center">
                <h3 class="text-2xl font-bold mb-2">テイスティング記録</h3>
                <p class="text-gray-600 text-sm">味わいを記録して味覚プロファイルを作成</p>
            </div>

            <!-- フォーム -->
            <div class="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <form id="tasting-form" onsubmit="handleTastingSubmit(event)">
                    <!-- 銘柄選択 -->
                    <div class="mb-4">
                        <label class="block text-sm font-semibold mb-2">銘柄</label>
                        <select id="tasting-sake" required
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                            <option value="">選択してください</option>
                            ${collection.map(sake => `
                                <option value="${sake.id}">${sake.brand_name} - ${sake.character_name}</option>
                            `).join('')}
                        </select>
                    </div>

                    <!-- 性別 -->
                    <div class="mb-4">
                        <label class="block text-sm font-semibold mb-2">性別</label>
                        <div class="grid grid-cols-2 gap-3">
                            <label class="flex items-center justify-center px-4 py-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-red-500 transition">
                                <input type="radio" name="gender" value="male" class="mr-2">
                                <span>男性</span>
                            </label>
                            <label class="flex items-center justify-center px-4 py-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-red-500 transition">
                                <input type="radio" name="gender" value="female" class="mr-2">
                                <span>女性</span>
                            </label>
                        </div>
                    </div>

                    <!-- 年代 -->
                    <div class="mb-4">
                        <label class="block text-sm font-semibold mb-2">年代</label>
                        <select name="age_range" required
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                            <option value="">選択してください</option>
                            <option value="20s">20代</option>
                            <option value="30s">30代</option>
                            <option value="40s">40代</option>
                            <option value="50s">50代</option>
                            <option value="60s">60代以上</option>
                        </select>
                    </div>

                    <!-- 味覚評価 -->
                    <div class="mb-6">
                        <h4 class="font-semibold mb-4">味覚評価</h4>
                        <div class="space-y-4">
                            ${['sweetness', 'acidity', 'umami', 'bitterness', 'aroma'].map(attr => {
                                const labels = {
                                    sweetness: '甘み',
                                    acidity: '酸味',
                                    umami: '旨み',
                                    bitterness: '苦味',
                                    aroma: '香り'
                                };
                                return `
                                    <div>
                                        <div class="flex justify-between mb-2">
                                            <label class="text-sm font-medium">${labels[attr]}</label>
                                            <span class="text-sm text-gray-500" id="${attr}-value">3</span>
                                        </div>
                                        <input type="range" name="${attr}" min="1" max="5" value="3" step="1"
                                               oninput="document.getElementById('${attr}-value').textContent = this.value">
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <!-- 送信ボタン -->
                    <button type="submit" 
                            class="w-full btn btn-primary text-white py-4 rounded-xl text-lg font-bold">
                        <i class="fas fa-save mr-2"></i>
                        記録する
                    </button>
                </form>
            </div>

            <!-- レーダーチャート -->
            <div class="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <h4 class="font-bold text-lg mb-4 text-center">味覚プロファイル</h4>
                <canvas id="tasting-chart" class="max-w-sm mx-auto"></canvas>
            </div>
        </div>
    `;
}

// ==================== AI診断タブコンテンツ ====================

function renderDiagnosisTab() {
    const profile = dataManager.getUserProfile();
    const collection = dataManager.getCollection();

    return `
        <div class="space-y-6 fade-in">
            <!-- ヘッダー -->
            <div class="text-center">
                <h3 class="text-2xl font-bold mb-2">AI味覚診断</h3>
                <p class="text-gray-600 text-sm">あなたの好みに合った日本酒を推薦</p>
            </div>

            <!-- 味覚プロファイル -->
            <div class="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <h4 class="font-bold text-lg mb-4">あなたの味覚プロファイル</h4>
                <canvas id="profile-chart" class="max-w-sm mx-auto mb-6"></canvas>

                <!-- プロファイル調整 -->
                <div class="space-y-3">
                    ${Object.keys(profile.taste_profile).map(key => {
                        const labels = {
                            sweetness: '甘み',
                            acidity: '酸味',
                            umami: '旨み',
                            bitterness: '苦味',
                            aroma: '香り'
                        };
                        return `
                            <div>
                                <div class="flex justify-between mb-1">
                                    <label class="text-sm font-medium">${labels[key]}</label>
                                    <span class="text-sm text-gray-500" id="profile-${key}-value">${profile.taste_profile[key]}</span>
                                </div>
                                <input type="range" id="profile-${key}" min="1" max="5" 
                                       value="${profile.taste_profile[key]}" step="1"
                                       oninput="updateProfileValue('${key}', this.value)">
                            </div>
                        `;
                    }).join('')}
                </div>

                <button onclick="saveProfile()" 
                        class="w-full btn btn-primary text-white py-3 rounded-xl mt-4">
                    <i class="fas fa-save mr-2"></i>
                    プロファイルを保存
                </button>
            </div>

            <!-- AI推薦 -->
            <div class="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <h4 class="font-bold text-lg mb-4 flex items-center gap-2">
                    <i class="fas fa-magic text-purple-600"></i>
                    AI推薦
                </h4>
                
                ${collection.length > 0 ? `
                    <div class="space-y-3">
                        ${getRecommendations(profile, collection).map(rec => `
                            <div class="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 cursor-pointer hover:shadow-md transition"
                                 onclick="showSakeDetail('${rec.sake.id}')">
                                <img src="${rec.sake.character_image}" alt="${rec.sake.character_name}"
                                     class="w-16 h-16 object-cover rounded-lg">
                                <div class="flex-1">
                                    <p class="font-semibold text-sm">${rec.sake.character_name}</p>
                                    <p class="text-xs text-gray-600 mb-1">${rec.sake.brand_name}</p>
                                    <div class="flex items-center gap-2">
                                        <div class="flex-1 bg-gray-200 rounded-full h-2">
                                            <div class="bg-gradient-to-r from-purple-600 to-pink-600 rounded-full h-2" 
                                                 style="width: ${rec.match}%"></div>
                                        </div>
                                        <span class="text-xs font-semibold text-purple-600">${rec.match}%</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="text-center py-8 text-gray-400">
                        <i class="fas fa-flask text-4xl mb-2"></i>
                        <p>コレクションがありません</p>
                        <p class="text-sm">日本酒を追加すると推薦が表示されます</p>
                    </div>
                `}
            </div>

            <!-- ヒント -->
            <div class="bg-purple-50 p-4 rounded-xl border border-purple-200">
                <h4 class="font-bold text-purple-900 mb-2 flex items-center gap-2">
                    <i class="fas fa-lightbulb"></i>
                    AIのおすすめ
                </h4>
                <p class="text-sm text-purple-800">
                    テイスティング記録を増やすことで、AIがより正確にあなたの好みを学習し、最適な日本酒を推薦できるようになります。
                </p>
            </div>
        </div>
    `;
}

// ==================== AI推薦アルゴリズム ====================

function getRecommendations(profile, collection) {
    if (collection.length === 0) return [];

    const recommendations = collection.map(sake => {
        const match = calculateMatch(profile.taste_profile, sake.taste_profile);
        return { sake, match };
    });

    // マッチ度でソート
    recommendations.sort((a, b) => b.match - a.match);

    // 上位3つを返す
    return recommendations.slice(0, 3);
}

function calculateMatch(userProfile, sakeProfile) {
    if (!sakeProfile) return 0;

    const keys = ['sweetness', 'acidity', 'umami', 'bitterness', 'aroma'];
    let totalDiff = 0;

    keys.forEach(key => {
        const diff = Math.abs((userProfile[key] || 3) - (sakeProfile[key] || 3));
        totalDiff += diff;
    });

    // 最大差分は20（各属性で最大4の差×5属性）
    const maxDiff = 20;
    const match = Math.max(0, Math.round(((maxDiff - totalDiff) / maxDiff) * 100));

    return match;
}
