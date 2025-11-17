/**
 * 推し酒アプリ - UIコンポーネント
 * レーダーチャート、モーダル、トースト、各タブのレンダリング
 */

// ==================== グローバル変数 ====================
let currentTab = 'home';
let radarChart = null;
let cameraStream = null;
let capturedImage = null;

// ==================== トースト通知 ====================

/**
 * トースト通知を表示
 * @param {string} message - メッセージ
 * @param {string} type - タイプ (success, error, info)
 * @param {number} duration - 表示時間（ミリ秒）
 */
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3`;
    
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
    modalBody.innerHTML = content;
    modal.classList.remove('hidden');
}

/**
 * モーダルを閉じる
 */
function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.add('hidden');
}

// モーダル外クリックで閉じる
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal');
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
});

// ==================== レーダーチャート ====================

/**
 * レーダーチャートを作成
 * @param {string} canvasId - キャンバスID
 * @param {Object} data - 味覚データ
 * @param {string} label - ラベル
 */
function createRadarChart(canvasId, data, label = '味覚プロファイル') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    
    const ctx = canvas.getContext('2d');
    
    // 既存のチャートを破棄
    if (radarChart) {
        radarChart.destroy();
    }
    
    radarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['甘み', '酸味', '旨み', '苦味', '香り'],
            datasets: [{
                label: label,
                data: [
                    data.sweetness || 0,
                    data.acidity || 0,
                    data.umami || 0,
                    data.bitterness || 0,
                    data.aroma || 0
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
                    beginAtZero: true,
                    min: 0,
                    max: 5,
                    ticks: {
                        stepSize: 1,
                        font: {
                            family: 'Noto Sans JP',
                            size: 12
                        }
                    },
                    pointLabels: {
                        font: {
                            family: 'Noto Sans JP',
                            size: 14,
                            weight: 'bold'
                        }
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
    
    return radarChart;
}

// ==================== ホームタブ ====================

function renderHomeTab() {
    const collection = dataManager.getCollection();
    const favorites = dataManager.getFavorites();
    const stamps = dataManager.getStamps();
    const unlockedStamps = stamps.filter(s => s.unlocked).length;
    
    return `
        <div class="space-y-6">
            <!-- ウェルカムバナー -->
            <div class="bg-gradient-to-r from-red-600 to-pink-600 text-white p-6 rounded-xl shadow-lg">
                <h3 class="text-2xl font-bold mb-2">推し酒へようこそ！</h3>
                <p class="opacity-90">見つける、育てる、語り合う。</p>
            </div>
            
            <!-- ステータスカード -->
            <div class="grid grid-cols-2 gap-4">
                <div class="card bg-white p-4 rounded-xl shadow-md">
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
                
                <div class="card bg-white p-4 rounded-xl shadow-md">
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
            
            <!-- 話題の推し銘柄 -->
            <div>
                <h4 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <i class="fas fa-heart text-red-600"></i>
                    お気に入りの推し銘柄
                </h4>
                ${favorites.length > 0 ? `
                    <div class="grid grid-cols-2 gap-4">
                        ${favorites.slice(0, 4).map(sake => `
                            <div class="card character-card rarity-${sake.character_rarity} cursor-pointer" 
                                 onclick="showSakeDetail('${sake.id}')">
                                <div class="relative">
                                    <img src="${sake.character_image}" 
                                         alt="${sake.character_name}" 
                                         class="character-image rounded-t-xl">
                                    <div class="favorite-btn active">
                                        <i class="fas fa-heart"></i>
                                    </div>
                                    <div class="absolute bottom-2 left-2">
                                        <span class="rarity-badge ${sake.character_rarity}">
                                            ${dataManager.getData('RARITY_LABELS')?.[sake.character_rarity] || sake.character_rarity}
                                        </span>
                                    </div>
                                </div>
                                <div class="p-3">
                                    <h5 class="font-bold text-gray-800 truncate">${sake.character_name}</h5>
                                    <p class="text-sm text-gray-600 truncate">${sake.brand_name}</p>
                                    <div class="level-badge mt-2">
                                        <i class="fas fa-star"></i>
                                        <span>Lv.${sake.character_level}</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="bg-gray-50 p-8 rounded-xl text-center">
                        <i class="fas fa-heart text-gray-300 text-4xl mb-3"></i>
                        <p class="text-gray-500">お気に入りの日本酒がまだありません</p>
                        <p class="text-sm text-gray-400 mt-2">図鑑から❤️マークでお気に入り登録しよう！</p>
                    </div>
                `}
            </div>
            
            <!-- クイックアクション -->
            <div>
                <h4 class="text-lg font-bold text-gray-800 mb-4">クイックアクション</h4>
                <div class="grid grid-cols-2 gap-3">
                    <button onclick="switchTab('camera')" 
                            class="btn btn-primary text-white py-4 rounded-xl font-bold flex flex-col items-center gap-2">
                        <i class="fas fa-camera text-2xl"></i>
                        <span>新しく撮影</span>
                    </button>
                    <button onclick="switchTab('collection')" 
                            class="btn bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold flex flex-col items-center gap-2">
                        <i class="fas fa-flask text-2xl"></i>
                        <span>図鑑を開く</span>
                    </button>
                    <button onclick="switchTab('tasting')" 
                            class="btn bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-xl font-bold flex flex-col items-center gap-2">
                        <i class="fas fa-wine-glass-alt text-2xl"></i>
                        <span>記録する</span>
                    </button>
                    <button onclick="switchTab('community')" 
                            class="btn bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold flex flex-col items-center gap-2">
                        <i class="fas fa-users text-2xl"></i>
                        <span>投稿する</span>
                    </button>
                </div>
            </div>
            
            ${collection.length === 0 ? `
                <!-- 初回ユーザー向けガイド -->
                <div class="bg-blue-50 border-2 border-blue-200 p-6 rounded-xl">
                    <h4 class="font-bold text-blue-800 mb-3 flex items-center gap-2">
                        <i class="fas fa-lightbulb"></i>
                        はじめてのご利用
                    </h4>
                    <ol class="space-y-2 text-sm text-blue-700">
                        <li class="flex items-start gap-2">
                            <span class="font-bold">1.</span>
                            <span>カメラタブで日本酒のラベルを撮影</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="font-bold">2.</span>
                            <span>AIが自動でキャラクター生成（30-60秒）</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="font-bold">3.</span>
                            <span>コレクションに追加して育成開始！</span>
                        </li>
                    </ol>
                    <button onclick="dataManager.loadSampleData(); location.reload();" 
                            class="mt-4 btn bg-blue-600 text-white px-4 py-2 rounded-lg text-sm w-full">
                        <i class="fas fa-download mr-2"></i>
                        サンプルデータを読み込む
                    </button>
                </div>
            ` : ''}
        </div>
    `;
}

// ==================== カメラタブ ====================

function renderCameraTab() {
    return `
        <div class="space-y-6">
            <div class="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-xl">
                <h3 class="text-xl font-bold mb-2">AI推し酒キャラ生成</h3>
                <p class="text-sm opacity-90">日本酒のラベルから美しいキャラクターを生成します</p>
            </div>
            
            <!-- カメラプレビュー -->
            <div class="camera-preview bg-gray-900 rounded-xl overflow-hidden relative" id="camera-container">
                <video id="camera-video" class="w-full h-auto hidden" autoplay playsinline></video>
                <canvas id="camera-canvas" class="hidden"></canvas>
                <img id="preview-image" class="w-full h-auto hidden" />
                
                <div id="camera-placeholder" class="flex flex-col items-center justify-center py-20">
                    <i class="fas fa-camera text-white text-6xl mb-4 opacity-50"></i>
                    <p class="text-white text-center opacity-75">カメラを起動してラベルを撮影<br/>またはファイルを選択</p>
                </div>
                
                <div class="camera-overlay"></div>
            </div>
            
            <!-- コントロールボタン -->
            <div class="grid grid-cols-2 gap-3">
                <button onclick="startCamera()" id="start-camera-btn"
                        class="btn btn-primary text-white py-3 rounded-xl font-bold">
                    <i class="fas fa-camera mr-2"></i>
                    再撮影
                </button>
                <label for="file-input" 
                       class="btn bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-xl font-bold text-center cursor-pointer">
                    <i class="fas fa-file-image mr-2"></i>
                    ファイル
                    <input type="file" id="file-input" accept="image/*" class="hidden" onchange="handleFileSelect(event)">
                </label>
            </div>
            
            <button onclick="captureAndGenerate()" id="generate-btn"
                    class="btn bg-gradient-to-r from-red-600 to-pink-600 text-white py-4 rounded-xl font-bold w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled>
                <i class="fas fa-magic mr-2"></i>
                キャラクター生成開始
            </button>
            
            <!-- 生成結果表示エリア -->
            <div id="generation-result" class="hidden">
                <!-- 生成されたキャラクターがここに表示される -->
            </div>
            
            <!-- 注意事項 -->
            <div class="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-xl">
                <h4 class="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                    <i class="fas fa-exclamation-triangle"></i>
                    撮影のコツ
                </h4>
                <ul class="text-sm text-yellow-700 space-y-1">
                    <li>• 明るい場所で撮影してください</li>
                    <li>• ラベル全体が映るように</li>
                    <li>• 反射や影を避けてください</li>
                    <li>• 生成には30-60秒かかります</li>
                </ul>
            </div>
        </div>
    `;
}

// ==================== 図鑑タブ ====================

function renderCollectionTab() {
    const collection = dataManager.getCollection();
    const rarityFilter = localStorage.getItem('rarity_filter') || 'all';
    
    // レアリティでフィルター
    const filteredCollection = rarityFilter === 'all' 
        ? collection 
        : collection.filter(sake => sake.character_rarity === rarityFilter);
    
    // ソート（レベル降順）
    const sortedCollection = [...filteredCollection].sort((a, b) => b.character_level - a.character_level);
    
    return `
        <div class="space-y-6">
            <div class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-xl">
                <h3 class="text-xl font-bold mb-1">日本酒図鑑</h3>
                <p class="text-sm opacity-90">全 ${collection.length} 銘柄</p>
            </div>
            
            <!-- フィルター -->
            <div class="flex gap-2 overflow-x-auto pb-2">
                <button onclick="filterByRarity('all')" 
                        class="filter-btn ${rarityFilter === 'all' ? 'active' : ''} px-4 py-2 rounded-lg font-bold whitespace-nowrap">
                    すべて
                </button>
                <button onclick="filterByRarity('legendary')" 
                        class="filter-btn ${rarityFilter === 'legendary' ? 'active' : ''} px-4 py-2 rounded-lg font-bold whitespace-nowrap">
                    <span class="text-yellow-600">★</span> Legendary
                </button>
                <button onclick="filterByRarity('epic')" 
                        class="filter-btn ${rarityFilter === 'epic' ? 'active' : ''} px-4 py-2 rounded-lg font-bold whitespace-nowrap">
                    <span class="text-purple-600">★</span> Epic
                </button>
                <button onclick="filterByRarity('rare')" 
                        class="filter-btn ${rarityFilter === 'rare' ? 'active' : ''} px-4 py-2 rounded-lg font-bold whitespace-nowrap">
                    <span class="text-blue-600">★</span> Rare
                </button>
                <button onclick="filterByRarity('common')" 
                        class="filter-btn ${rarityFilter === 'common' ? 'active' : ''} px-4 py-2 rounded-lg font-bold whitespace-nowrap">
                    Common
                </button>
            </div>
            
            <!-- コレクション表示 -->
            ${sortedCollection.length > 0 ? `
                <div class="grid grid-cols-2 gap-4">
                    ${sortedCollection.map(sake => `
                        <div class="card character-card rarity-${sake.character_rarity} cursor-pointer" 
                             onclick="showSakeDetail('${sake.id}')">
                            <div class="relative">
                                <img src="${sake.character_image}" 
                                     alt="${sake.character_name}" 
                                     class="character-image rounded-t-xl">
                                <button class="favorite-btn ${sake.favorite ? 'active' : ''}" 
                                        onclick="event.stopPropagation(); toggleFavorite('${sake.id}')">
                                    <i class="fas fa-heart"></i>
                                </button>
                                <div class="absolute bottom-2 left-2">
                                    <span class="rarity-badge ${sake.character_rarity}">
                                        ${sake.character_rarity.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            <div class="p-3">
                                <h5 class="font-bold text-gray-800 truncate">${sake.character_name}</h5>
                                <p class="text-sm text-gray-600 truncate">${sake.brand_name}</p>
                                <div class="flex items-center justify-between mt-2">
                                    <div class="level-badge">
                                        <i class="fas fa-star"></i>
                                        <span>Lv.${sake.character_level}</span>
                                    </div>
                                    <div class="text-xs text-gray-500">
                                        ${sake.brewery_name}
                                    </div>
                                </div>
                                <div class="exp-bar mt-2">
                                    <div class="exp-fill" style="width: ${sake.character_exp}%"></div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : `
                <div class="bg-gray-50 p-12 rounded-xl text-center">
                    <i class="fas fa-flask text-gray-300 text-6xl mb-4"></i>
                    <p class="text-gray-500 text-lg font-bold mb-2">コレクションが空です</p>
                    <p class="text-gray-400 text-sm">カメラタブから日本酒を追加しましょう！</p>
                </div>
            `}
        </div>
    `;
}

// ==================== スタンプタブ ====================

function renderStampsTab() {
    const stamps = dataManager.getStamps();
    const unlockedCount = stamps.filter(s => s.unlocked).length;
    const progress = Math.round((unlockedCount / stamps.length) * 100);
    
    return `
        <div class="space-y-6">
            <div class="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-4 rounded-xl">
                <h3 class="text-xl font-bold mb-1">御酒印コレクション</h3>
                <p class="text-sm opacity-90">${unlockedCount}/${stamps.length} 獲得</p>
            </div>
            
            <!-- 全体進捗 -->
            <div class="bg-white p-6 rounded-xl shadow-md">
                <div class="flex items-center justify-between mb-3">
                    <span class="font-bold text-gray-800">コンプリート進捗</span>
                    <span class="text-2xl font-bold text-red-600">${progress}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
            </div>
            
            <!-- スタンプ一覧 -->
            <div class="grid grid-cols-1 gap-4">
                ${stamps.map(stamp => `
                    <div class="stamp-card ${stamp.unlocked ? 'unlocked' : 'locked'} 
                                bg-white p-4 rounded-xl shadow-md">
                        <div class="flex items-center gap-4">
                            <div class="stamp-icon" style="color: ${stamp.color}">
                                <i class="fas ${stamp.icon}"></i>
                            </div>
                            <div class="flex-1">
                                <h4 class="font-bold text-gray-800 text-lg">${stamp.name}</h4>
                                <p class="text-sm text-gray-600 mt-1">${stamp.description}</p>
                                ${stamp.unlocked ? `
                                    <div class="mt-2 flex items-center gap-2 text-green-600">
                                        <i class="fas fa-check-circle"></i>
                                        <span class="text-sm font-bold">獲得済み</span>
                                    </div>
                                ` : `
                                    <div class="mt-2">
                                        <div class="flex items-center justify-between text-sm mb-1">
                                            <span class="text-gray-600">進捗</span>
                                            <span class="font-bold text-gray-800">
                                                ${stamp.progress || 0}/${stamp.target}
                                            </span>
                                        </div>
                                        <div class="progress-bar h-2">
                                            <div class="progress-fill" 
                                                 style="width: ${Math.min(100, ((stamp.progress || 0) / stamp.target) * 100)}%">
                                            </div>
                                        </div>
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ==================== コミュニティタブ ====================

function renderCommunityTab() {
    const posts = dataManager.getCommunityPosts();
    
    return `
        <div class="space-y-6">
            <div class="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-xl">
                <h3 class="text-xl font-bold mb-1">推し酒コミュニティ</h3>
                <p class="text-sm opacity-90">みんなの推し活を共有しよう</p>
            </div>
            
            <!-- 新規投稿ボタン -->
            <button onclick="showNewPostForm()" 
                    class="btn btn-primary text-white py-3 rounded-xl font-bold w-full">
                <i class="fas fa-pen mr-2"></i>
                新しい投稿を作成
            </button>
            
            <!-- 投稿一覧 -->
            ${posts.length > 0 ? `
                <div class="space-y-4">
                    ${posts.map(post => `
                        <div class="card bg-white p-4 rounded-xl shadow-md">
                            <div class="flex items-center gap-3 mb-3">
                                <img src="${post.user.avatar}" 
                                     class="w-10 h-10 rounded-full" 
                                     alt="${post.user.name}">
                                <div class="flex-1">
                                    <p class="font-bold text-gray-800">${post.user.name}</p>
                                    <p class="text-xs text-gray-500">${formatTimestamp(post.timestamp)}</p>
                                </div>
                            </div>
                            
                            <p class="text-gray-800 mb-3 whitespace-pre-line">${post.content}</p>
                            
                            ${post.image ? `
                                <img src="${post.image}" 
                                     class="w-full rounded-lg mb-3" 
                                     alt="投稿画像">
                            ` : ''}
                            
                            ${post.hashtags && post.hashtags.length > 0 ? `
                                <div class="flex flex-wrap gap-2 mb-3">
                                    ${post.hashtags.map(tag => `
                                        <span class="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                            ${tag}
                                        </span>
                                    `).join('')}
                                </div>
                            ` : ''}
                            
                            <div class="flex items-center gap-4 pt-3 border-t border-gray-200">
                                <button class="flex items-center gap-2 text-gray-600 hover:text-red-600 transition">
                                    <i class="far fa-heart"></i>
                                    <span class="text-sm">${post.likes || 0}</span>
                                </button>
                                <button class="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition">
                                    <i class="far fa-comment"></i>
                                    <span class="text-sm">${post.comments || 0}</span>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : `
                <div class="bg-gray-50 p-12 rounded-xl text-center">
                    <i class="fas fa-comments text-gray-300 text-6xl mb-4"></i>
                    <p class="text-gray-500 text-lg font-bold mb-2">まだ投稿がありません</p>
                    <p class="text-gray-400 text-sm">最初の投稿を作成してみましょう！</p>
                </div>
            `}
        </div>
    `;
}

// ==================== テイスティングタブ ====================

function renderTastingTab() {
    const collection = dataManager.getCollection();
    
    return `
        <div class="space-y-6">
            <div class="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4 rounded-xl">
                <h3 class="text-xl font-bold mb-1">テイスティング記録</h3>
                <p class="text-sm opacity-90">味覚を記録してプロファイルを作成</p>
            </div>
            
            <!-- テイスティングフォーム -->
            <form id="tasting-form" class="space-y-4" onsubmit="submitTastingRecord(event)">
                <!-- 銘柄選択 -->
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2">
                        銘柄を選択
                    </label>
                    ${collection.length > 0 ? `
                        <select id="sake-select" 
                                class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-600"
                                required>
                            <option value="">選択してください</option>
                            ${collection.map(sake => `
                                <option value="${sake.id}">${sake.brand_name} - ${sake.character_name}</option>
                            `).join('')}
                        </select>
                    ` : `
                        <div class="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                            まずは日本酒を追加してください
                        </div>
                    `}
                </div>
                
                ${collection.length > 0 ? `
                    <!-- 性別 -->
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">
                            性別
                        </label>
                        <select id="gender-select" 
                                class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg">
                            <option value="male">男性</option>
                            <option value="female">女性</option>
                            <option value="other">その他</option>
                        </select>
                    </div>
                    
                    <!-- 年代 -->
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">
                            年代
                        </label>
                        <select id="age-select" 
                                class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg">
                            <option value="20s">20代</option>
                            <option value="30s">30代</option>
                            <option value="40s">40代</option>
                            <option value="50s">50代</option>
                            <option value="60s">60代以上</option>
                        </select>
                    </div>
                    
                    <!-- 味覚評価 -->
                    <div>
                        <h4 class="text-sm font-bold text-gray-700 mb-4">味覚評価</h4>
                        <div class="space-y-4">
                            ${['sweetness', 'acidity', 'umami', 'bitterness', 'aroma'].map((taste, index) => {
                                const labels = {
                                    sweetness: '甘み',
                                    acidity: '酸味',
                                    umami: '旨み',
                                    bitterness: '苦味',
                                    aroma: '香り'
                                };
                                return `
                                    <div>
                                        <div class="flex items-center justify-between mb-2">
                                            <label class="text-sm font-medium text-gray-700">
                                                ${labels[taste]}
                                            </label>
                                            <span id="${taste}-value" class="text-sm font-bold text-red-600">3</span>
                                        </div>
                                        <input type="range" 
                                               id="${taste}-slider"
                                               min="1" 
                                               max="5" 
                                               value="3" 
                                               step="1"
                                               oninput="document.getElementById('${taste}-value').textContent = this.value">
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    
                    <!-- メモ -->
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">
                            メモ（任意）
                        </label>
                        <textarea id="tasting-notes" 
                                  rows="3" 
                                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg"
                                  placeholder="感想を記入してください..."></textarea>
                    </div>
                    
                    <!-- 送信ボタン -->
                    <button type="submit" 
                            class="btn btn-primary text-white py-3 rounded-xl font-bold w-full">
                        <i class="fas fa-save mr-2"></i>
                        記録する
                    </button>
                ` : ''}
            </form>
            
            <!-- レーダーチャートプレビュー -->
            ${collection.length > 0 ? `
                <div class="bg-white p-4 rounded-xl shadow-md">
                    <h4 class="text-sm font-bold text-gray-700 mb-4">味覚プロファイル</h4>
                    <canvas id="tasting-chart" width="300" height="300"></canvas>
                </div>
            ` : ''}
        </div>
    `;
}

// ==================== AI診断タブ ====================

function renderDiagnosisTab() {
    const profile = dataManager.getUserProfile();
    const collection = dataManager.getCollection();
    
    return `
        <div class="space-y-6">
            <div class="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-xl">
                <h3 class="text-xl font-bold mb-1">AI診断・推薦</h3>
                <p class="text-sm opacity-90">あなたの味覚プロファイル</p>
            </div>
            
            <!-- 味覚プロファイル -->
            <div class="bg-white p-6 rounded-xl shadow-md">
                <h4 class="font-bold text-gray-800 mb-4">現在の味覚プロファイル</h4>
                <canvas id="profile-chart" width="300" height="300"></canvas>
            </div>
            
            <!-- プロファイル調整 -->
            <div class="bg-white p-6 rounded-xl shadow-md">
                <h4 class="font-bold text-gray-800 mb-4">プロファイルを調整</h4>
                <div class="space-y-4">
                    ${['sweetness', 'acidity', 'umami', 'bitterness', 'aroma'].map(taste => {
                        const labels = {
                            sweetness: '甘み',
                            acidity: '酸味',
                            umami: '旨み',
                            bitterness: '苦味',
                            aroma: '香り'
                        };
                        const value = profile.taste_profile[taste] || 3;
                        return `
                            <div>
                                <div class="flex items-center justify-between mb-2">
                                    <label class="text-sm font-medium text-gray-700">
                                        ${labels[taste]}
                                    </label>
                                    <span id="profile-${taste}-value" class="text-sm font-bold text-red-600">${value}</span>
                                </div>
                                <input type="range" 
                                       id="profile-${taste}-slider"
                                       min="1" 
                                       max="5" 
                                       value="${value}" 
                                       step="1"
                                       oninput="updateProfileSlider('${taste}', this.value)">
                            </div>
                        `;
                    }).join('')}
                </div>
                <button onclick="saveProfile()" 
                        class="btn btn-primary text-white py-3 rounded-xl font-bold w-full mt-4">
                    <i class="fas fa-save mr-2"></i>
                    プロファイルを保存
                </button>
            </div>
            
            <!-- AI推薦 -->
            <div class="bg-white p-6 rounded-xl shadow-md">
                <h4 class="font-bold text-gray-800 mb-4">
                    <i class="fas fa-magic text-purple-600 mr-2"></i>
                    AI推薦
                </h4>
                ${collection.length > 0 ? `
                    <div class="space-y-3">
                        ${getRecommendedSakes(profile, collection).map(sake => `
                            <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                                 onclick="showSakeDetail('${sake.id}')">
                                <img src="${sake.character_image}" 
                                     class="w-16 h-16 rounded-lg object-cover"
                                     alt="${sake.character_name}">
                                <div class="flex-1">
                                    <p class="font-bold text-gray-800">${sake.character_name}</p>
                                    <p class="text-sm text-gray-600">${sake.brand_name}</p>
                                    <div class="flex items-center gap-2 mt-1">
                                        <div class="flex items-center gap-1">
                                            ${Array(5).fill(0).map((_, i) => `
                                                <i class="fas fa-star text-xs ${i < sake.matchScore ? 'text-yellow-500' : 'text-gray-300'}"></i>
                                            `).join('')}
                                        </div>
                                        <span class="text-xs font-bold text-purple-600">
                                            ${Math.round(sake.matchScore * 20)}% マッチ
                                        </span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="text-center py-8">
                        <i class="fas fa-flask text-gray-300 text-4xl mb-3"></i>
                        <p class="text-gray-500">コレクションに日本酒を追加すると<br>AI推薦が表示されます</p>
                    </div>
                `}
            </div>
        </div>
    `;
}

// ==================== ユーティリティ関数 ====================

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return '今';
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    if (days < 7) return `${days}日前`;
    
    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
}

function getRecommendedSakes(profile, collection) {
    // 味覚プロファイルに基づいてマッチングスコアを計算
    const scoredSakes = collection.map(sake => {
        let score = 0;
        const profileTaste = profile.taste_profile;
        const sakeTaste = sake.taste_profile;
        
        Object.keys(profileTaste).forEach(key => {
            const diff = Math.abs(profileTaste[key] - sakeTaste[key]);
            score += (5 - diff); // 差が小さいほど高スコア
        });
        
        return {
            ...sake,
            matchScore: Math.min(5, Math.round(score / 5))
        };
    });
    
    // スコアでソートして上位3件を返す
    return scoredSakes.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);
}
