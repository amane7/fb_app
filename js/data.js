/**
 * 推し酒アプリ - データ管理システム
 * ローカルストレージによるデータ永続化と管理
 */

// ==================== ローカルストレージキー ====================
const STORAGE_KEYS = {
    SAKE_COLLECTION: 'oshi_sake_collection',
    STAMPS: 'oshi_sake_stamps',
    TASTING_RECORDS: 'oshi_sake_tasting_records',
    USER_PROFILE: 'oshi_sake_user_profile',
    COMMUNITY_POSTS: 'oshi_sake_community_posts',
    SETTINGS: 'oshi_sake_settings'
};

// ==================== データ管理クラス ====================
class DataManager {
    constructor() {
        this.initializeStorage();
    }

    // ストレージの初期化
    initializeStorage() {
        if (!this.getData(STORAGE_KEYS.SAKE_COLLECTION)) {
            this.setData(STORAGE_KEYS.SAKE_COLLECTION, []);
        }
        if (!this.getData(STORAGE_KEYS.STAMPS)) {
            this.setData(STORAGE_KEYS.STAMPS, this.getInitialStamps());
        }
        if (!this.getData(STORAGE_KEYS.TASTING_RECORDS)) {
            this.setData(STORAGE_KEYS.TASTING_RECORDS, []);
        }
        if (!this.getData(STORAGE_KEYS.USER_PROFILE)) {
            this.setData(STORAGE_KEYS.USER_PROFILE, this.getDefaultProfile());
        }
        if (!this.getData(STORAGE_KEYS.COMMUNITY_POSTS)) {
            this.setData(STORAGE_KEYS.COMMUNITY_POSTS, []);
        }
        if (!this.getData(STORAGE_KEYS.SETTINGS)) {
            this.setData(STORAGE_KEYS.SETTINGS, this.getDefaultSettings());
        }
    }

    // データの取得
    getData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Error getting data for key ${key}:`, error);
            return null;
        }
    }

    // データの保存
    setData(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error setting data for key ${key}:`, error);
            return false;
        }
    }

    // データの削除
    removeData(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing data for key ${key}:`, error);
            return false;
        }
    }

    // すべてのデータをクリア
    clearAllData() {
        try {
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            this.initializeStorage();
            return true;
        } catch (error) {
            console.error('Error clearing all data:', error);
            return false;
        }
    }

    // ==================== 日本酒コレクション管理 ====================
    
    // コレクションの取得
    getCollection() {
        return this.getData(STORAGE_KEYS.SAKE_COLLECTION) || [];
    }

    // 日本酒を追加
    addSake(sakeData) {
        const collection = this.getCollection();
        const newSake = {
            id: this.generateId(),
            collected_date: new Date().toISOString(),
            character_level: 1,
            character_exp: 0,
            favorite: false,
            ...sakeData
        };
        collection.push(newSake);
        this.setData(STORAGE_KEYS.SAKE_COLLECTION, collection);
        this.checkAndUpdateStamps();
        return newSake;
    }

    // 日本酒を更新
    updateSake(id, updates) {
        const collection = this.getCollection();
        const index = collection.findIndex(sake => sake.id === id);
        if (index !== -1) {
            collection[index] = { ...collection[index], ...updates };
            this.setData(STORAGE_KEYS.SAKE_COLLECTION, collection);
            return collection[index];
        }
        return null;
    }

    // 日本酒を削除
    deleteSake(id) {
        const collection = this.getCollection();
        const filtered = collection.filter(sake => sake.id !== id);
        this.setData(STORAGE_KEYS.SAKE_COLLECTION, filtered);
        this.checkAndUpdateStamps();
        return true;
    }

    // IDで日本酒を取得
    getSakeById(id) {
        const collection = this.getCollection();
        return collection.find(sake => sake.id === id);
    }

    // お気に入りをトグル
    toggleFavorite(id) {
        const sake = this.getSakeById(id);
        if (sake) {
            return this.updateSake(id, { favorite: !sake.favorite });
        }
        return null;
    }

    // お気に入りのみを取得
    getFavorites() {
        return this.getCollection().filter(sake => sake.favorite);
    }

    // レアリティ別に取得
    getSakeByRarity(rarity) {
        return this.getCollection().filter(sake => sake.character_rarity === rarity);
    }

    // 経験値を追加してレベルアップ判定
    addExperience(id, exp) {
        const sake = this.getSakeById(id);
        if (!sake) return null;

        let newExp = sake.character_exp + exp;
        let newLevel = sake.character_level;
        const expPerLevel = 100;

        while (newExp >= expPerLevel) {
            newExp -= expPerLevel;
            newLevel++;
        }

        return this.updateSake(id, {
            character_level: newLevel,
            character_exp: newExp
        });
    }

    // ==================== スタンプ管理 ====================

    getInitialStamps() {
        return [
            {
                id: 'first_step',
                name: '初めの一歩',
                description: '最初の日本酒を登録',
                icon: 'fa-flag',
                color: '#3b82f6',
                condition: 'collection_count',
                target: 1,
                unlocked: false
            },
            {
                id: 'brewery_pilgrim',
                name: '酒蔵巡礼',
                description: '5つの異なる酒蔵の日本酒を収集',
                icon: 'fa-torii-gate',
                color: '#ec4899',
                condition: 'brewery_variety',
                target: 5,
                unlocked: false
            },
            {
                id: 'seasonal_collector',
                name: '四季限定',
                description: '季節限定の日本酒を3種類収集',
                icon: 'fa-leaf',
                color: '#10b981',
                condition: 'seasonal_count',
                target: 3,
                unlocked: false
            },
            {
                id: 'rarity_hunter',
                name: 'レアリティハンター',
                description: 'Legendary以上のキャラを獲得',
                icon: 'fa-crown',
                color: '#f59e0b',
                condition: 'legendary_count',
                target: 1,
                unlocked: false
            },
            {
                id: 'tasting_master',
                name: 'テイスティングマスター',
                description: '10回のテイスティング記録を達成',
                icon: 'fa-wine-glass-alt',
                color: '#8b5cf6',
                condition: 'tasting_count',
                target: 10,
                unlocked: false
            },
            {
                id: 'social_butterfly',
                name: '交流の達人',
                description: 'コミュニティに5つの投稿を作成',
                icon: 'fa-comments',
                color: '#06b6d4',
                condition: 'post_count',
                target: 5,
                unlocked: false
            }
        ];
    }

    getStamps() {
        return this.getData(STORAGE_KEYS.STAMPS) || this.getInitialStamps();
    }

    checkAndUpdateStamps() {
        const stamps = this.getStamps();
        const collection = this.getCollection();
        const tastingRecords = this.getTastingRecords();
        const posts = this.getCommunityPosts();

        stamps.forEach(stamp => {
            if (stamp.unlocked) return;

            let currentProgress = 0;

            switch (stamp.condition) {
                case 'collection_count':
                    currentProgress = collection.length;
                    break;
                case 'brewery_variety':
                    const uniqueBreweries = new Set(collection.map(s => s.brewery_name));
                    currentProgress = uniqueBreweries.size;
                    break;
                case 'seasonal_count':
                    const seasonal = collection.filter(s => 
                        s.sake_type && (
                            s.sake_type.includes('季節') ||
                            s.sake_type.includes('限定') ||
                            s.sake_type.includes('しぼりたて')
                        )
                    );
                    currentProgress = seasonal.length;
                    break;
                case 'legendary_count':
                    currentProgress = collection.filter(s => s.character_rarity === 'legendary').length;
                    break;
                case 'tasting_count':
                    currentProgress = tastingRecords.length;
                    break;
                case 'post_count':
                    currentProgress = posts.length;
                    break;
            }

            stamp.progress = currentProgress;
            if (currentProgress >= stamp.target) {
                stamp.unlocked = true;
                stamp.unlocked_date = new Date().toISOString();
            }
        });

        this.setData(STORAGE_KEYS.STAMPS, stamps);
        return stamps;
    }

    getUnlockedStampsCount() {
        const stamps = this.getStamps();
        return stamps.filter(s => s.unlocked).length;
    }

    // ==================== テイスティング記録管理 ====================

    getTastingRecords() {
        return this.getData(STORAGE_KEYS.TASTING_RECORDS) || [];
    }

    addTastingRecord(record) {
        const records = this.getTastingRecords();
        const newRecord = {
            id: this.generateId(),
            date: new Date().toISOString(),
            ...record
        };
        records.push(newRecord);
        this.setData(STORAGE_KEYS.TASTING_RECORDS, records);
        this.updateUserProfile(record.taste_profile);
        this.checkAndUpdateStamps();
        return newRecord;
    }

    getRecordsBySake(sakeId) {
        return this.getTastingRecords().filter(r => r.sake_id === sakeId);
    }

    // ==================== ユーザープロファイル管理 ====================

    getDefaultProfile() {
        return {
            taste_profile: {
                sweetness: 3,
                acidity: 3,
                umami: 3,
                bitterness: 3,
                aroma: 3
            },
            preferences: {
                sake_type: [],
                temperature: 'cold',
                occasion: 'casual'
            },
            gender: '',
            age_range: '',
            created_at: new Date().toISOString()
        };
    }

    getUserProfile() {
        return this.getData(STORAGE_KEYS.USER_PROFILE) || this.getDefaultProfile();
    }

    updateUserProfile(updates) {
        const profile = this.getUserProfile();
        const updatedProfile = {
            ...profile,
            ...updates,
            updated_at: new Date().toISOString()
        };
        this.setData(STORAGE_KEYS.USER_PROFILE, updatedProfile);
        return updatedProfile;
    }

    updateTasteProfile(tasteProfile) {
        const records = this.getTastingRecords();
        if (records.length === 0) {
            return this.updateUserProfile({ taste_profile: tasteProfile });
        }

        // 過去の記録から平均を計算
        const avgProfile = {
            sweetness: 0,
            acidity: 0,
            umami: 0,
            bitterness: 0,
            aroma: 0
        };

        records.forEach(record => {
            Object.keys(avgProfile).forEach(key => {
                avgProfile[key] += record.taste_profile[key] || 0;
            });
        });

        Object.keys(avgProfile).forEach(key => {
            avgProfile[key] = Math.round(avgProfile[key] / records.length);
        });

        return this.updateUserProfile({ taste_profile: avgProfile });
    }

    // ==================== コミュニティ投稿管理 ====================

    getCommunityPosts() {
        return this.getData(STORAGE_KEYS.COMMUNITY_POSTS) || [];
    }

    addPost(postData) {
        const posts = this.getCommunityPosts();
        const newPost = {
            id: this.generateId(),
            user: {
                name: 'あなた',
                avatar: 'https://ui-avatars.com/api/?name=User&background=DC2626&color=fff'
            },
            timestamp: new Date().toISOString(),
            likes: 0,
            comments: 0,
            ...postData
        };

        // ハッシュタグを抽出
        const hashtags = postData.content.match(/#[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]+/g) || [];
        newPost.hashtags = hashtags;

        posts.unshift(newPost);
        this.setData(STORAGE_KEYS.COMMUNITY_POSTS, posts);
        this.checkAndUpdateStamps();
        return newPost;
    }

    deletePost(id) {
        const posts = this.getCommunityPosts();
        const filtered = posts.filter(post => post.id !== id);
        this.setData(STORAGE_KEYS.COMMUNITY_POSTS, filtered);
        this.checkAndUpdateStamps();
        return true;
    }

    // ==================== 設定管理 ====================

    getDefaultSettings() {
        return {
            notifications: true,
            theme: 'light',
            language: 'ja',
            data_saving: false
        };
    }

    getSettings() {
        return this.getData(STORAGE_KEYS.SETTINGS) || this.getDefaultSettings();
    }

    updateSettings(updates) {
        const settings = this.getSettings();
        const updatedSettings = { ...settings, ...updates };
        this.setData(STORAGE_KEYS.SETTINGS, updatedSettings);
        return updatedSettings;
    }

    // ==================== ユーティリティ ====================

    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // データエクスポート
    exportData() {
        const data = {
            collection: this.getCollection(),
            stamps: this.getStamps(),
            tastingRecords: this.getTastingRecords(),
            userProfile: this.getUserProfile(),
            posts: this.getCommunityPosts(),
            settings: this.getSettings(),
            exportDate: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
    }

    // データインポート
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.collection) this.setData(STORAGE_KEYS.SAKE_COLLECTION, data.collection);
            if (data.stamps) this.setData(STORAGE_KEYS.STAMPS, data.stamps);
            if (data.tastingRecords) this.setData(STORAGE_KEYS.TASTING_RECORDS, data.tastingRecords);
            if (data.userProfile) this.setData(STORAGE_KEYS.USER_PROFILE, data.userProfile);
            if (data.posts) this.setData(STORAGE_KEYS.COMMUNITY_POSTS, data.posts);
            if (data.settings) this.setData(STORAGE_KEYS.SETTINGS, data.settings);
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // ==================== サンプルデータ ====================

    loadSampleData() {
        const sampleSakes = [
            {
                brand_name: '獺祭 純米大吟醸 磨き二割三分',
                brewery_name: '旭酒造',
                region: '山口県',
                sake_type: '純米大吟醸',
                alcohol_content: 16,
                rice_polishing_ratio: 23,
                character_name: '雅',
                character_rarity: 'legendary',
                character_image: 'https://via.placeholder.com/300x400/fbbf24/ffffff?text=雅',
                taste_profile: {
                    sweetness: 4,
                    acidity: 2,
                    umami: 5,
                    bitterness: 1,
                    aroma: 5
                },
                user_rating: 5,
                user_notes: '華やかな香りと洗練された味わい',
                favorite: true
            },
            {
                brand_name: '久保田 萬寿',
                brewery_name: '朝日酒造',
                region: '新潟県',
                sake_type: '純米大吟醸',
                alcohol_content: 15,
                rice_polishing_ratio: 50,
                character_name: '萬',
                character_rarity: 'epic',
                character_image: 'https://via.placeholder.com/300x400/a855f7/ffffff?text=萬',
                taste_profile: {
                    sweetness: 3,
                    acidity: 3,
                    umami: 4,
                    bitterness: 2,
                    aroma: 4
                },
                user_rating: 5,
                user_notes: 'バランスの取れた味わい',
                favorite: true
            },
            {
                brand_name: '黒龍 大吟醸',
                brewery_name: '黒龍酒造',
                region: '福井県',
                sake_type: '大吟醸',
                alcohol_content: 15,
                rice_polishing_ratio: 50,
                character_name: '龍姫',
                character_rarity: 'rare',
                character_image: 'https://via.placeholder.com/300x400/3b82f6/ffffff?text=龍姫',
                taste_profile: {
                    sweetness: 3,
                    acidity: 3,
                    umami: 3,
                    bitterness: 2,
                    aroma: 4
                },
                user_rating: 4,
                user_notes: '芳醇な香りが特徴',
                favorite: false
            },
            {
                brand_name: '八海山 純米吟醸',
                brewery_name: '八海醸造',
                region: '新潟県',
                sake_type: '純米吟醸',
                alcohol_content: 15.5,
                rice_polishing_ratio: 50,
                character_name: '八重',
                character_rarity: 'rare',
                character_image: 'https://via.placeholder.com/300x400/3b82f6/ffffff?text=八重',
                taste_profile: {
                    sweetness: 2,
                    acidity: 3,
                    umami: 4,
                    bitterness: 2,
                    aroma: 3
                },
                user_rating: 4,
                user_notes: 'すっきりとした飲み口',
                favorite: false
            },
            {
                brand_name: '十四代 本丸',
                brewery_name: '高木酒造',
                region: '山形県',
                sake_type: '本醸造',
                alcohol_content: 15,
                rice_polishing_ratio: 60,
                character_name: '十代',
                character_rarity: 'legendary',
                character_image: 'https://via.placeholder.com/300x400/fbbf24/ffffff?text=十代',
                taste_profile: {
                    sweetness: 4,
                    acidity: 2,
                    umami: 4,
                    bitterness: 1,
                    aroma: 5
                },
                user_rating: 5,
                user_notes: 'フルーティーで香り高い',
                favorite: true
            }
        ];

        // サンプルデータを追加
        sampleSakes.forEach(sake => {
            this.addSake(sake);
        });

        // サンプル投稿を追加
        const samplePosts = [
            {
                content: '今日は獺祭を飲みました！華やかな香りが素晴らしい✨ #獺祭 #日本酒 #純米大吟醸',
                image: 'https://via.placeholder.com/400x300/DC2626/ffffff?text=獺祭'
            },
            {
                content: '久保田萬寿、やっぱり美味しい！バランスが最高です🍶 #久保田 #萬寿 #日本酒好き',
                image: null
            }
        ];

        samplePosts.forEach(post => {
            this.addPost(post);
        });

        return true;
    }
}

// グローバルインスタンスを作成
const dataManager = new DataManager();

// デバッグ用にグローバルスコープに公開
window.dataManager = dataManager;
