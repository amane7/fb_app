/**
 * 推し酒アプリ - メインアプリケーションロジック
 * タブ切り替え、イベント処理、アプリ初期化
 */

// ==================== グローバル変数 ====================
let currentTab = 'home';
let videoStream = null;
let capturedImage = null;

// ==================== アプリ初期化 ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('推し酒アプリ起動中...');
    
    // スプラッシュスクリーン
    setTimeout(() => {
        document.getElementById('splash-screen').style.display = 'none';
        document.getElementById('app').classList.remove('hidden');
        
        // 初期化
        initializeApp();
    }, 2000);
});

function initializeApp() {
    // サンプルデータのロード（初回のみ）
    const collection = dataManager.getCollection();
    if (collection.length === 0) {
        dataManager.loadSampleData();
        showToast('サンプルデータを読み込みました', 'success');
    }

    // タブボタンのイベントリスナー
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });

    // 初期タブを表示
    switchTab('home');
    
    console.log('アプリ初期化完了');
}

// ==================== タブ切り替え ====================
function switchTab(tabName) {
    currentTab = tabName;
    
    // タブボタンのアクティブ状態を更新
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.dataset.tab === tabName) {
            btn.classList.add('text-primary', 'border-t-2', 'border-primary');
            btn.classList.remove('text-gray-500');
        } else {
            btn.classList.remove('text-primary', 'border-t-2', 'border-primary');
            btn.classList.add('text-gray-500');
        }
    });

    // ヘッダータイトルを更新
    const titles = {
        home: 'ホーム',
        camera: 'カメラ',
        collection: '図鑑',
        stamps: '御酒印',
        community: '交流',
        tasting: 'テイスティング',
        diagnosis: 'AI診断'
    };
    document.getElementById('header-title').textContent = titles[tabName];

    // コンテンツを更新
    const mainContent = document.getElementById('main-content');
    mainContent.style.opacity = '0';
    
    setTimeout(() => {
        switch(tabName) {
            case 'home':
                mainContent.innerHTML = renderHomeTab();
                break;
            case 'camera':
                mainContent.innerHTML = renderCameraTab();
                initializeCamera();
                break;
            case 'collection':
                mainContent.innerHTML = renderCollectionTab();
                break;
            case 'stamps':
                mainContent.innerHTML = renderStampsTab();
                break;
            case 'community':
                mainContent.innerHTML = renderCommunityTab();
                break;
            case 'tasting':
                mainContent.innerHTML = renderTastingTab();
                initializeTastingChart();
                break;
            case 'diagnosis':
                mainContent.innerHTML = renderDiagnosisTab();
                initializeProfileChart();
                break;
        }
        
        mainContent.style.opacity = '1';
        window.scrollTo(0, 0);
    }, 150);
}

// ==================== カメラ機能 ====================
function initializeCamera() {
    // 初期化処理（必要に応じて）
}

async function openCamera() {
    try {
        const container = document.getElementById('camera-preview-container');
        
        // 既存のストリームを停止
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
        }

        // カメラストリームを取得
        videoStream = await navigator.mediaDevices.getUserMedia({
            video: {  facingMode: 'environment' },
            audio: false
        });

        // ビデオ要素を作成
        container.innerHTML = `
            <video id="camera-video" autoplay playsinline class="w-full h-auto"></video>
            <div class="camera-overlay"></div>
            <button onclick="capturePhoto()" 
                    class="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-red-600 px-6 py-3 rounded-full shadow-lg font-bold btn">
                <i class="fas fa-camera mr-2"></i>
                撮影
            </button>
        `;

        const video = document.getElementById('camera-video');
        video.srcObject = videoStream;

    } catch (error) {
        console.error('Camera error:', error);
        showToast('カメラの起動に失敗しました', 'error');
    }
}

function capturePhoto() {
    const video = document.getElementById('camera-video');
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    capturedImage = canvas.toDataURL('image/jpeg');
    
    // ストリームを停止
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }

    // プレビューを表示
    displayCapturedImage(capturedImage);
}

function displayCapturedImage(imageData) {
    const container = document.getElementById('camera-preview-container');
    container.innerHTML = `
        <img src="${imageData}" alt="撮影画像" class="w-full h-auto rounded-xl">
    `;

    // 生成ボタンを有効化
    const generateBtn = document.getElementById('generate-btn');
    if (generateBtn) {
        generateBtn.disabled = false;
    }

    showToast('画像を取得しました', 'success');
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        capturedImage = e.target.result;
        displayCapturedImage(capturedImage);
    };
    reader.readAsDataURL(file);
}

// ==================== AI生成機能 ====================
async function generateCharacter() {
    if (!capturedImage) {
        showToast('画像を選択してください', 'error');
        return;
    }

    const generateBtn = document.getElementById('generate-btn');
    const statusDiv = document.getElementById('generation-status');
    const resultDiv = document.getElementById('generation-result');

    try {
        // ボタンを無効化
        generateBtn.disabled = true;
        statusDiv.classList.remove('hidden');
        resultDiv.classList.add('hidden');

        // AI生成実行
        const result = await aiGenerationService.generateCharacterFromLabel(capturedImage);

        // 結果を表示
        displayGenerationResult(result);

    } catch (error) {
        console.error('Generation error:', error);
        showToast('生成に失敗しました', 'error');
    } finally {
        generateBtn.disabled = false;
        statusDiv.classList.add('hidden');
    }
}

function displayGenerationResult(result) {
    const resultDiv = document.getElementById('generation-result');
    
    resultDiv.innerHTML = `
        <div class="bg-white p-6 rounded-xl shadow-lg border-2 rarity-${result.character_rarity}-glow scale-in">
            <!-- キャラクター画像 -->
            <div class="relative mb-4">
                <img src="${result.character_image}" alt="${result.character_name}"
                     class="w-full rounded-xl">
                <div class="absolute top-4 left-4">
                    <span class="rarity-badge ${result.character_rarity} text-lg px-4 py-2">
                        ${getRarityLabel(result.character_rarity)}
                    </span>
                </div>
            </div>

            <!-- キャラクター情報 -->
            <div class="text-center mb-4">
                <h3 class="text-2xl font-bold mb-2">${result.character_name}</h3>
                <p class="text-gray-600">AI生成キャラクター</p>
            </div>

            <!-- 味覚プロファイル -->
            <div class="mb-4">
                <h4 class="font-bold mb-2">推定味覚プロファイル</h4>
                <div class="grid grid-cols-5 gap-2 text-center text-xs">
                    <div>
                        <div class="text-2xl mb-1">${result.taste_profile.sweetness}</div>
                        <div class="text-gray-600">甘み</div>
                    </div>
                    <div>
                        <div class="text-2xl mb-1">${result.taste_profile.acidity}</div>
                        <div class="text-gray-600">酸味</div>
                    </div>
                    <div>
                        <div class="text-2xl mb-1">${result.taste_profile.umami}</div>
                        <div class="text-gray-600">旨み</div>
                    </div>
                    <div>
                        <div class="text-2xl mb-1">${result.taste_profile.bitterness}</div>
                        <div class="text-gray-600">苦味</div>
                    </div>
                    <div>
                        <div class="text-2xl mb-1">${result.taste_profile.aroma}</div>
                        <div class="text-gray-600">香り</div>
                    </div>
                </div>
            </div>

            <!-- アクションボタン -->
            <div class="grid grid-cols-2 gap-3">
                <button onclick="addToCollection()" 
                        class="btn btn-primary text-white py-3 rounded-xl font-bold">
                    <i class="fas fa-plus mr-2"></i>
                    コレクションに追加
                </button>
                <button onclick="regenerateCharacter()" 
                        class="bg-gray-100 text-gray-700 py-3 rounded-xl font-bold btn">
                    <i class="fas fa-redo mr-2"></i>
                    再生成
                </button>
            </div>
        </div>
    `;

    resultDiv.classList.remove('hidden');
    
    // 結果をグローバル変数に保存
    window.lastGeneratedCharacter = result;
}

function addToCollection() {
    const result = window.lastGeneratedCharacter;
    if (!result) return;

    // モーダルで詳細情報を入力
    showModal(`
        <h3 class="text-xl font-bold mb-4">コレクションに追加</h3>
        <form id="add-sake-form" onsubmit="handleAddSake(event)">
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-semibold mb-1">銘柄名 *</label>
                    <input type="text" name="brand_name" required
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-semibold mb-1">酒蔵名 *</label>
                    <input type="text" name="brewery_name" required
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-semibold mb-1">地域</label>
                    <input type="text" name="region"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-semibold mb-1">種類</label>
                    <select name="sake_type" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        <option value="純米大吟醸">純米大吟醸</option>
                        <option value="大吟醸">大吟醸</option>
                        <option value="純米吟醸">純米吟醸</option>
                        <option value="吟醸">吟醸</option>
                        <option value="純米">純米</option>
                        <option value="本醸造">本醸造</option>
                    </select>
                </div>
                <button type="submit" class="w-full btn btn-primary text-white py-3 rounded-xl font-bold">
                    追加する
                </button>
            </div>
        </form>
    `);
}

function handleAddSake(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const result = window.lastGeneratedCharacter;

    const sakeData = {
        brand_name: formData.get('brand_name'),
        brewery_name: formData.get('brewery_name'),
        region: formData.get('region') || '未設定',
        sake_type: formData.get('sake_type'),
        alcohol_content: 15,
        rice_polishing_ratio: 50,
        character_name: result.character_name,
        character_rarity: result.character_rarity,
        character_image: result.character_image,
        taste_profile: result.taste_profile
    };

    dataManager.addSake(sakeData);
    closeModal();
    showToast('コレクションに追加しました！', 'success');
    
    // 図鑑タブに切り替え
    setTimeout(() => {
        switchTab('collection');
    }, 1000);
}

function regenerateCharacter() {
    generateCharacter();
}

// ==================== コレクション機能 ====================
function filterCollection(rarity) {
    const collection = dataManager.getCollection();
    const grid = document.getElementById('collection-grid');
    
    // フィルターボタンのアクティブ状態を更新
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.dataset.filter === rarity) {
            btn.classList.add('active', 'bg-red-600', 'text-white');
            btn.classList.remove('bg-gray-100', 'text-gray-700');
        } else {
            btn.classList.remove('active', 'bg-red-600', 'text-white');
            btn.classList.add('bg-gray-100', 'text-gray-700');
        }
    });

    // フィルタリング
    let filtered = collection;
    if (rarity !== 'all') {
        filtered = collection.filter(sake => sake.character_rarity === rarity);
    }

    // グリッドを更新
    grid.innerHTML = `
        <div class="grid grid-cols-2 gap-4">
            ${filtered.map(sake => renderSakeCard(sake)).join('')}
        </div>
    `;
}

function toggleFavorite(id) {
    const sake = dataManager.toggleFavorite(id);
    if (sake) {
        showToast(sake.favorite ? 'お気に入りに追加しました' : 'お気に入りから削除しました', 'success');
        
        // 現在のタブを再描画
        if (currentTab === 'collection') {
            filterCollection(document.querySelector('.filter-btn.active')?.dataset.filter || 'all');
        } else if (currentTab === 'home') {
            switchTab('home');
        }
    }
}

function showSakeDetail(id) {
    const sake = dataManager.getSakeById(id);
    if (!sake) return;

    showModal(`
        <div class="max-h-[80vh] overflow-y-auto">
            <!-- キャラクター画像 -->
            <div class="relative mb-4 -mx-6 -mt-6">
                <img src="${sake.character_image}" alt="${sake.character_name}"
                     class="w-full h-64 object-cover">
                <div class="absolute top-4 left-4">
                    <span class="rarity-badge ${sake.character_rarity} text-lg px-4 py-2">
                        ${getRarityLabel(sake.character_rarity)}
                    </span>
                </div>
                <div class="absolute top-4 right-4">
                    <button class="favorite-btn ${sake.favorite ? 'active' : ''}" 
                            onclick="toggleFavorite('${sake.id}'); showSakeDetail('${sake.id}')">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>

            <!-- 基本情報 -->
            <div class="mb-4">
                <h3 class="text-2xl font-bold mb-1">${sake.character_name}</h3>
                <p class="text-lg text-gray-700 mb-1">${sake.brand_name}</p>
                <p class="text-sm text-gray-500">${sake.brewery_name} • ${sake.region}</p>
            </div>

            <!-- レベルと経験値 -->
            <div class="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-lg mb-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="font-semibold">レベル ${sake.character_level}</span>
                    <span class="text-sm text-gray-600">EXP: ${sake.character_exp}/100</span>
                </div>
                <div class="exp-bar">
                    <div class="exp-fill" style="width: ${sake.character_exp}%"></div>
                </div>
            </div>

            <!-- 日本酒情報 -->
            <div class="grid grid-cols-2 gap-3 mb-4">
                <div class="bg-gray-50 p-3 rounded-lg">
                    <p class="text-xs text-gray-500 mb-1">種類</p>
                    <p class="font-semibold text-sm">${sake.sake_type || '未設定'}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-lg">
                    <p class="text-xs text-gray-500 mb-1">アルコール度数</p>
                    <p class="font-semibold text-sm">${sake.alcohol_content || '-'}%</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-lg">
                    <p class="text-xs text-gray-500 mb-1">精米歩合</p>
                    <p class="font-semibold text-sm">${sake.rice_polishing_ratio || '-'}%</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-lg">
                    <p class="text-xs text-gray-500 mb-1">収集日</p>
                    <p class="font-semibold text-sm">${formatDate(sake.collected_date)}</p>
                </div>
            </div>

            <!-- 味覚プロファイル -->
            ${sake.taste_profile ? `
                <div class="mb-4">
                    <h4 class="font-bold mb-2">味覚プロファイル</h4>
                    <canvas id="detail-chart"></canvas>
                </div>
            ` : ''}

            <!-- ユーザーメモ -->
            ${sake.user_notes ? `
                <div class="bg-blue-50 p-3 rounded-lg mb-4">
                    <h4 class="font-bold text-sm mb-1">メモ</h4>
                    <p class="text-sm text-gray-700">${sake.user_notes}</p>
                </div>
            ` : ''}

            <!-- アクションボタン -->
            <div class="grid grid-cols-2 gap-3">
                <button onclick="closeModal(); switchTab('tasting')" 
                        class="btn bg-blue-600 text-white py-3 rounded-xl font-bold">
                    <i class="fas fa-wine-glass-alt mr-2"></i>
                    テイスティング
                </button>
                <button onclick="deleteSake('${sake.id}')" 
                        class="btn bg-red-600 text-white py-3 rounded-xl font-bold">
                    <i class="fas fa-trash mr-2"></i>
                    削除
                </button>
            </div>
        </div>
    `);

    // レーダーチャートを描画
    if (sake.taste_profile) {
        setTimeout(() => {
            renderRadarChart('detail-chart', sake.taste_profile);
        }, 100);
    }
}

function deleteSake(id) {
    if (!confirm('本当に削除しますか？')) return;
    
    dataManager.deleteSake(id);
    closeModal();
    showToast('削除しました', 'success');
    
    if (currentTab === 'collection') {
        filterCollection(document.querySelector('.filter-btn.active')?.dataset.filter || 'all');
    }
}

// ==================== コミュニティ機能 ====================
function showCreatePostModal() {
    showModal(`
        <h3 class="text-xl font-bold mb-4">新規投稿</h3>
        <form id="create-post-form" onsubmit="handleCreatePost(event)">
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-semibold mb-1">投稿内容 *</label>
                    <textarea name="content" required rows="4"
                              class="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                              placeholder="今日飲んだ日本酒のことを共有しよう！&#10;#ハッシュタグ も使えます"></textarea>
                </div>
                <div>
                    <label class="block text-sm font-semibold mb-1">画像（任意）</label>
                    <input type="file" accept="image/*" name="image"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                </div>
                <button type="submit" class="w-full btn btn-primary text-white py-3 rounded-xl font-bold">
                    <i class="fas fa-paper-plane mr-2"></i>
                    投稿する
                </button>
            </div>
        </form>
    `);
}

function handleCreatePost(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    const postData = {
        content: formData.get('content')
    };

    // 画像がある場合（実装簡略化のため省略）
    // TODO: 画像アップロード処理

    dataManager.addPost(postData);
    closeModal();
    showToast('投稿しました！', 'success');
    switchTab('community');
}

// ==================== テイスティング機能 ====================
function initializeTastingChart() {
    const profile = dataManager.getUserProfile();
    renderRadarChart('tasting-chart', profile.taste_profile);
}

function handleTastingSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    const record = {
        sake_id: formData.get('tasting-sake'),
        gender: formData.get('gender'),
        age_range: formData.get('age_range'),
        taste_profile: {
            sweetness: parseInt(formData.get('sweetness')),
            acidity: parseInt(formData.get('acidity')),
            umami: parseInt(formData.get('umami')),
            bitterness: parseInt(formData.get('bitterness')),
            aroma: parseInt(formData.get('aroma'))
        }
    };

    dataManager.addTastingRecord(record);
    showToast('記録しました！', 'success');
    
    // チャートを更新
    renderRadarChart('tasting-chart', record.taste_profile);
    
    // フォームをリセット
    event.target.reset();
}

// ==================== AI診断機能 ====================
function initializeProfileChart() {
    const profile = dataManager.getUserProfile();
    renderRadarChart('profile-chart', profile.taste_profile);
}

function updateProfileValue(key, value) {
    document.getElementById(`profile-${key}-value`).textContent = value;
    
    // チャートをリアルタイム更新
    const profile = {};
    ['sweetness', 'acidity', 'umami', 'bitterness', 'aroma'].forEach(k => {
        profile[k] = parseInt(document.getElementById(`profile-${k}`).value);
    });
    
    renderRadarChart('profile-chart', profile);
}

function saveProfile() {
    const profile = {
        taste_profile: {
            sweetness: parseInt(document.getElementById('profile-sweetness').value),
            acidity: parseInt(document.getElementById('profile-acidity').value),
            umami: parseInt(document.getElementById('profile-umami').value),
            bitterness: parseInt(document.getElementById('profile-bitterness').value),
            aroma: parseInt(document.getElementById('profile-aroma').value)
        }
    };

    dataManager.updateUserProfile(profile);
    showToast('プロファイルを保存しました', 'success');
    
    // タブを再描画（推薦を更新）
    switchTab('diagnosis');
}

// ==================== デバッグ用 ====================
window.appDebug = {
    dataManager: () => dataManager,
    aiService: () => aiGenerationService,
    switchTab: (tab) => switchTab(tab),
    clearData: () => {
        dataManager.clearAllData();
        showToast('データをクリアしました', 'success');
        location.reload();
    },
    loadSample: () => {
        dataManager.loadSampleData();
        showToast('サンプルデータを読み込みました', 'success');
        switchTab('home');
    },
    testAI: async () => {
        console.log('AI生成テスト開始...');
        const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        try {
            const result = await aiGenerationService.generateCharacterFromLabel(testImage);
            console.log('生成結果:', result);
            return result;
        } catch (error) {
            console.error('テスト失敗:', error);
        }
    },
    showHistory: () => {
        console.log('生成履歴:', aiGenerationService.getHistory());
    },
    currentImageSrc: () => capturedImage,
    aiGenerationService: () => aiGenerationService
};

console.log('推し酒アプリ準備完了！');
console.log('デバッグコマンド: window.appDebug');
