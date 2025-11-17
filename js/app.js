/**
 * 推し酒アプリ - メインアプリケーションロジック
 * タブ切り替え、イベント処理、初期化
 */

// ==================== 初期化 ====================

document.addEventListener('DOMContentLoaded', () => {
    // スプラッシュスクリーンを2秒後に非表示
    setTimeout(() => {
        document.getElementById('splash-screen').style.display = 'none';
        document.getElementById('app').classList.remove('hidden');
        
        // 初期タブを表示
        switchTab('home');
    }, 2000);
    
    // タブボタンのイベントリスナーを設定
    setupTabListeners();
    
    // データが空の場合、サンプルデータを読み込むか確認
    if (dataManager.getCollection().length === 0) {
        setTimeout(() => {
            const loadSample = confirm('サンプルデータを読み込みますか？\n（体験用のデータが追加されます）');
            if (loadSample) {
                dataManager.loadSampleData();
                showToast('サンプルデータを読み込みました！', 'success');
                switchTab('home');
            }
        }, 500);
    }
});

// ==================== タブ切り替え ====================

function setupTabListeners() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            switchTab(tab);
        });
    });
}

function switchTab(tabName) {
    currentTab = tabName;
    
    // タブボタンのアクティブ状態を更新
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        const btnTab = btn.getAttribute('data-tab');
        if (btnTab === tabName) {
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
    document.getElementById('header-title').textContent = titles[tabName] || 'ホーム';
    
    // コンテンツを更新
    const mainContent = document.getElementById('main-content');
    
    switch (tabName) {
        case 'home':
            mainContent.innerHTML = renderHomeTab();
            break;
        case 'camera':
            mainContent.innerHTML = renderCameraTab();
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
            // テイスティングチャートを初期化
            setTimeout(() => {
                const canvas = document.getElementById('tasting-chart');
                if (canvas) {
                    createRadarChart('tasting-chart', {
                        sweetness: 3,
                        acidity: 3,
                        umami: 3,
                        bitterness: 3,
                        aroma: 3
                    });
                }
            }, 100);
            break;
        case 'diagnosis':
            mainContent.innerHTML = renderDiagnosisTab();
            // プロファイルチャートを初期化
            setTimeout(() => {
                const profile = dataManager.getUserProfile();
                const canvas = document.getElementById('profile-chart');
                if (canvas) {
                    createRadarChart('profile-chart', profile.taste_profile);
                }
            }, 100);
            break;
    }
    
    // トップにスクロール
    mainContent.scrollTop = 0;
}

// ==================== カメラ機能 ====================

async function startCamera() {
    try {
        const video = document.getElementById('camera-video');
        const placeholder = document.getElementById('camera-placeholder');
        const previewImage = document.getElementById('preview-image');
        
        // 既存のストリームを停止
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
        }
        
        // カメラストリームを取得
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment', // 背面カメラを優先
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            }
        });
        
        video.srcObject = cameraStream;
        video.classList.remove('hidden');
        placeholder.classList.add('hidden');
        previewImage.classList.add('hidden');
        
        // 生成ボタンを有効化
        document.getElementById('generate-btn').disabled = false;
        
        showToast('カメラを起動しました', 'success');
    } catch (error) {
        console.error('Camera error:', error);
        showToast('カメラの起動に失敗しました', 'error');
    }
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const previewImage = document.getElementById('preview-image');
        const video = document.getElementById('camera-video');
        const placeholder = document.getElementById('camera-placeholder');
        
        // ストリームを停止
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            cameraStream = null;
        }
        
        previewImage.src = e.target.result;
        previewImage.classList.remove('hidden');
        video.classList.add('hidden');
        placeholder.classList.add('hidden');
        
        capturedImage = e.target.result;
        
        // 生成ボタンを有効化
        document.getElementById('generate-btn').disabled = false;
        
        showToast('画像を読み込みました', 'success');
    };
    reader.readAsDataURL(file);
}

async function captureAndGenerate() {
    try {
        let imageData;
        
        // ビデオからキャプチャするか、既存の画像を使用
        if (cameraStream) {
            const video = document.getElementById('camera-video');
            const canvas = document.getElementById('camera-canvas');
            const context = canvas.getContext('2d');
            
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0);
            
            imageData = canvas.toDataURL('image/jpeg', 0.8);
            
            // プレビューを表示
            const previewImage = document.getElementById('preview-image');
            previewImage.src = imageData;
            previewImage.classList.remove('hidden');
            video.classList.add('hidden');
            
            // カメラストリームを停止
            cameraStream.getTracks().forEach(track => track.stop());
            cameraStream = null;
        } else if (capturedImage) {
            imageData = capturedImage;
        } else {
            showToast('画像を選択してください', 'error');
            return;
        }
        
        // 画像を圧縮
        imageData = await compressImage(imageData, 1024, 1024);
        
        // 生成ボタンを無効化
        document.getElementById('generate-btn').disabled = true;
        document.getElementById('generate-btn').innerHTML = `
            <div class="spinner spinner-sm mr-2"></div>
            生成中... (30-60秒)
        `;
        
        // AI生成を実行
        const result = await aiGenerationService.generateCharacterFromLabel(imageData);
        
        // 結果を表示
        showGenerationResult(result);
        
        // 生成ボタンを元に戻す
        document.getElementById('generate-btn').innerHTML = `
            <i class="fas fa-magic mr-2"></i>
            キャラクター生成開始
        `;
        
    } catch (error) {
        console.error('Generation error:', error);
        showToast('生成に失敗しました。再試行してください。', 'error');
        
        // 生成ボタンを元に戻す
        document.getElementById('generate-btn').disabled = false;
        document.getElementById('generate-btn').innerHTML = `
            <i class="fas fa-magic mr-2"></i>
            キャラクター生成開始
        `;
    }
}

function showGenerationResult(result) {
    const resultDiv = document.getElementById('generation-result');
    resultDiv.classList.remove('hidden');
    resultDiv.innerHTML = `
        <div class="bg-white p-6 rounded-xl shadow-lg">
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <i class="fas fa-sparkles text-yellow-500"></i>
                生成完了！
            </h3>
            
            <div class="rarity-${result.character_rarity} p-4 rounded-xl mb-4">
                <img src="${result.character_image}" 
                     class="w-full rounded-lg shadow-md mb-3"
                     alt="${result.character_name}">
                <div class="text-center">
                    <h4 class="text-2xl font-bold text-gray-800 mb-2">${result.character_name}</h4>
                    <span class="rarity-badge ${result.character_rarity}">
                        ${result.character_rarity.toUpperCase()}
                    </span>
                </div>
            </div>
            
            <div class="bg-gray-50 p-4 rounded-lg mb-4">
                <h5 class="font-bold text-gray-700 mb-2">味覚プロファイル</h5>
                <canvas id="generated-chart" width="250" height="250"></canvas>
            </div>
            
            <div class="grid grid-cols-2 gap-3">
                <button onclick="addToCollection()" 
                        class="btn btn-primary text-white py-3 rounded-xl font-bold">
                    <i class="fas fa-plus mr-2"></i>
                    コレクションに追加
                </button>
                <button onclick="regenerateCharacter()" 
                        class="btn bg-gray-600 text-white py-3 rounded-xl font-bold">
                    <i class="fas fa-redo mr-2"></i>
                    再生成
                </button>
            </div>
        </div>
    `;
    
    // チャートを描画
    setTimeout(() => {
        createRadarChart('generated-chart', result.taste_profile, result.character_name);
    }, 100);
    
    // 結果をスクロール表示
    resultDiv.scrollIntoView({ behavior: 'smooth' });
}

function addToCollection() {
    const history = aiGenerationService.getHistory();
    if (history.length === 0) {
        showToast('追加するキャラクターがありません', 'error');
        return;
    }
    
    const latestGeneration = history[history.length - 1];
    
    // ダイアログで情報を入力
    const brandName = prompt('銘柄名を入力してください:', '');
    if (!brandName) return;
    
    const breweryName = prompt('酒蔵名を入力してください:', '');
    if (!breweryName) return;
    
    // コレクションに追加
    const newSake = dataManager.addSake({
        brand_name: brandName,
        brewery_name: breweryName,
        region: '未設定',
        sake_type: '純米大吟醸',
        alcohol_content: 15,
        rice_polishing_ratio: 50,
        character_name: latestGeneration.character_name,
        character_rarity: latestGeneration.character_rarity,
        character_image: latestGeneration.character_image,
        taste_profile: latestGeneration.taste_profile,
        user_rating: 0,
        user_notes: ''
    });
    
    showToast(`${newSake.character_name}をコレクションに追加しました！`, 'success');
    
    // 図鑑タブに切り替え
    setTimeout(() => {
        switchTab('collection');
    }, 1500);
}

function regenerateCharacter() {
    captureAndGenerate();
}

// ==================== 図鑑機能 ====================

function filterByRarity(rarity) {
    localStorage.setItem('rarity_filter', rarity);
    switchTab('collection');
}

function toggleFavorite(id) {
    const sake = dataManager.toggleFavorite(id);
    if (sake) {
        showToast(sake.favorite ? 'お気に入りに追加しました' : 'お気に入りから削除しました', 'success');
        // 現在のタブを再描画
        switchTab(currentTab);
    }
}

function showSakeDetail(id) {
    const sake = dataManager.getSakeById(id);
    if (!sake) return;
    
    const modalContent = `
        <div class="space-y-4">
            <div class="rarity-${sake.character_rarity} p-4 rounded-xl">
                <img src="${sake.character_image}" 
                     class="w-full rounded-lg shadow-md mb-3"
                     alt="${sake.character_name}">
                <div class="text-center">
                    <h3 class="text-2xl font-bold text-gray-800 mb-2">${sake.character_name}</h3>
                    <span class="rarity-badge ${sake.character_rarity}">
                        ${sake.character_rarity.toUpperCase()}
                    </span>
                    <div class="level-badge mt-3">
                        <i class="fas fa-star"></i>
                        <span>Level ${sake.character_level}</span>
                    </div>
                </div>
            </div>
            
            <div class="space-y-2">
                <div class="flex justify-between">
                    <span class="text-gray-600">銘柄</span>
                    <span class="font-bold text-gray-800">${sake.brand_name}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">酒蔵</span>
                    <span class="font-bold text-gray-800">${sake.brewery_name}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">地域</span>
                    <span class="font-bold text-gray-800">${sake.region}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">種類</span>
                    <span class="font-bold text-gray-800">${sake.sake_type}</span>
                </div>
            </div>
            
            <div class="bg-gray-50 p-4 rounded-lg">
                <h5 class="font-bold text-gray-700 mb-3">味覚プロファイル</h5>
                <canvas id="detail-chart" width="250" height="250"></canvas>
            </div>
            
            ${sake.user_notes ? `
                <div class="bg-blue-50 p-4 rounded-lg">
                    <h5 class="font-bold text-blue-800 mb-2">メモ</h5>
                    <p class="text-blue-700 text-sm">${sake.user_notes}</p>
                </div>
            ` : ''}
            
            <button onclick="toggleFavorite('${sake.id}'); closeModal(); switchTab('${currentTab}');"
                    class="btn ${sake.favorite ? 'bg-gray-600' : 'bg-red-600'} text-white py-3 rounded-xl font-bold w-full">
                <i class="fas fa-heart mr-2"></i>
                ${sake.favorite ? 'お気に入りから削除' : 'お気に入りに追加'}
            </button>
        </div>
    `;
    
    showModal(modalContent);
    
    // チャートを描画
    setTimeout(() => {
        createRadarChart('detail-chart', sake.taste_profile, sake.character_name);
    }, 100);
}

// ==================== テイスティング機能 ====================

function submitTastingRecord(event) {
    event.preventDefault();
    
    const sakeId = document.getElementById('sake-select').value;
    if (!sakeId) {
        showToast('銘柄を選択してください', 'error');
        return;
    }
    
    const record = {
        sake_id: sakeId,
        gender: document.getElementById('gender-select').value,
        age_range: document.getElementById('age-select').value,
        taste_profile: {
            sweetness: parseInt(document.getElementById('sweetness-slider').value),
            acidity: parseInt(document.getElementById('acidity-slider').value),
            umami: parseInt(document.getElementById('umami-slider').value),
            bitterness: parseInt(document.getElementById('bitterness-slider').value),
            aroma: parseInt(document.getElementById('aroma-slider').value)
        },
        notes: document.getElementById('tasting-notes').value
    };
    
    dataManager.addTastingRecord(record);
    
    // 経験値を追加
    dataManager.addExperience(sakeId, 20);
    
    showToast('テイスティング記録を保存しました！', 'success');
    
    // フォームをリセット
    event.target.reset();
    
    // スタンプを更新
    dataManager.checkAndUpdateStamps();
}

// テイスティングスライダーの更新時にチャートを更新
let tastingChartUpdateTimeout;
document.addEventListener('input', (e) => {
    if (e.target.id && e.target.id.includes('-slider') && currentTab === 'tasting') {
        clearTimeout(tastingChartUpdateTimeout);
        tastingChartUpdateTimeout = setTimeout(() => {
            const canvas = document.getElementById('tasting-chart');
            if (canvas) {
                const data = {
                    sweetness: parseInt(document.getElementById('sweetness-slider')?.value || 3),
                    acidity: parseInt(document.getElementById('acidity-slider')?.value || 3),
                    umami: parseInt(document.getElementById('umami-slider')?.value || 3),
                    bitterness: parseInt(document.getElementById('bitterness-slider')?.value || 3),
                    aroma: parseInt(document.getElementById('aroma-slider')?.value || 3)
                };
                createRadarChart('tasting-chart', data);
            }
        }, 300);
    }
});

// ==================== AI診断機能 ====================

function updateProfileSlider(taste, value) {
    document.getElementById(`profile-${taste}-value`).textContent = value;
    
    // チャートを更新
    clearTimeout(window.profileUpdateTimeout);
    window.profileUpdateTimeout = setTimeout(() => {
        const data = {
            sweetness: parseInt(document.getElementById('profile-sweetness-slider').value),
            acidity: parseInt(document.getElementById('profile-acidity-slider').value),
            umami: parseInt(document.getElementById('profile-umami-slider').value),
            bitterness: parseInt(document.getElementById('profile-bitterness-slider').value),
            aroma: parseInt(document.getElementById('profile-aroma-slider').value)
        };
        createRadarChart('profile-chart', data);
    }, 300);
}

function saveProfile() {
    const newProfile = {
        sweetness: parseInt(document.getElementById('profile-sweetness-slider').value),
        acidity: parseInt(document.getElementById('profile-acidity-slider').value),
        umami: parseInt(document.getElementById('profile-umami-slider').value),
        bitterness: parseInt(document.getElementById('profile-bitterness-slider').value),
        aroma: parseInt(document.getElementById('profile-aroma-slider').value)
    };
    
    dataManager.updateUserProfile({ taste_profile: newProfile });
    showToast('プロファイルを保存しました！', 'success');
    
    // タブを再描画（推薦を更新）
    switchTab('diagnosis');
}

// ==================== コミュニティ機能 ====================

function showNewPostForm() {
    const modalContent = `
        <div class="space-y-4">
            <h3 class="text-xl font-bold text-gray-800">新しい投稿</h3>
            
            <form id="post-form" onsubmit="submitPost(event)">
                <textarea id="post-content" 
                          rows="4" 
                          class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg mb-4"
                          placeholder="今日の推し酒について語ろう... #推し酒"
                          required></textarea>
                
                <div class="grid grid-cols-2 gap-3">
                    <button type="submit" 
                            class="btn btn-primary text-white py-3 rounded-xl font-bold">
                        <i class="fas fa-paper-plane mr-2"></i>
                        投稿する
                    </button>
                    <button type="button" 
                            onclick="closeModal()"
                            class="btn bg-gray-600 text-white py-3 rounded-xl font-bold">
                        キャンセル
                    </button>
                </div>
            </form>
        </div>
    `;
    
    showModal(modalContent);
}

function submitPost(event) {
    event.preventDefault();
    
    const content = document.getElementById('post-content').value;
    if (!content.trim()) {
        showToast('投稿内容を入力してください', 'error');
        return;
    }
    
    dataManager.addPost({ content });
    showToast('投稿しました！', 'success');
    
    closeModal();
    switchTab('community');
}

// ==================== デバッグ用 ====================

window.appDebug = {
    testAI: () => {
        console.log('AI Generation Service:', aiGenerationService);
        console.log('Generation History:', aiGenerationService.getHistory());
    },
    showHistory: () => {
        console.table(aiGenerationService.getHistory());
    },
    aiGenerationService: () => aiGenerationService,
    currentImageSrc: () => capturedImage,
    dataManager: () => dataManager
};

console.log('推し酒アプリが起動しました！');
console.log('デバッグコマンド: window.appDebug');
