/**
 * 推し酒アプリ - AI生成機能
 * Gemini Flash Vision + Ideogram V3による日本酒キャラクター生成
 * 
 * 注意: このファイルはAI生成APIのインターフェースを定義します
 * 実際のAPI呼び出しはサーバーサイドまたは適切な認証を実装する必要があります
 */

class AIGenerationService {
    constructor() {
        this.isGenerating = false;
        this.currentImageData = null;
        this.generationHistory = [];
    }

    /**
     * ラベル画像からキャラクターを生成
     * @param {string} imageData - Base64エンコードされた画像データ
     * @returns {Promise<Object>} 生成されたキャラクターデータ
     */
    async generateCharacterFromLabel(imageData) {
        if (this.isGenerating) {
            throw new Error('既に生成処理が実行中です');
        }

        try {
            this.isGenerating = true;
            this.currentImageData = imageData;

            // ステップ1: ラベルをGeminiで分析
            showToast('🔍 ラベルデザインを分析中...', 'info');
            const labelAnalysis = await this.analyzeLabelWithGemini(imageData);

            // ステップ2: キャラクター名を生成
            showToast('✨ 魅力的な名前を考案中...', 'info');
            const characterName = await this.generateCharacterName(labelAnalysis);

            // ステップ3: レアリティを決定（ランダム）
            const rarity = this.determineRarity();
            showToast(`💎 レアリティ: ${this.getRarityLabel(rarity)}`, 'info');

            // ステップ4: Ideogramでキャラクター画像を生成
            showToast('🎨 美しいキャラクターを描画中... (30-60秒)', 'info');
            const characterImage = await this.generateCharacterImage(labelAnalysis, characterName, rarity);

            // ステップ5: 味覚プロファイルを推定
            const tasteProfile = this.estimateTasteProfile(labelAnalysis);

            // 生成結果をまとめる
            const result = {
                character_name: characterName,
                character_rarity: rarity,
                character_image: characterImage,
                taste_profile: tasteProfile,
                label_analysis: labelAnalysis,
                generated_at: new Date().toISOString()
            };

            // 履歴に追加
            this.generationHistory.push(result);

            showToast('✨ AI推し酒キャラクター生成完了！', 'success');
            return result;

        } catch (error) {
            console.error('Character generation error:', error);
            showToast('❌ キャラクター生成に失敗しました', 'error');
            throw error;
        } finally {
            this.isGenerating = false;
        }
    }

    /**
     * Gemini Flash Visionでラベルを分析
     * @param {string} imageData - Base64エンコードされた画像データ
     * @returns {Promise<Object>} ラベル分析結果
     */
    async analyzeLabelWithGemini(imageData) {
        try {
            // GenSpark AI API を使用（image_generation toolのanalyze機能を想定）
            // 実際の実装では、適切なAI APIエンドポイントを使用してください
            
            // モック実装: 実際のAPIコールの代わり
            return await this.mockLabelAnalysis(imageData);

            /* 実際のAPI実装例:
            const response = await fetch('/api/analyze-label', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: imageData,
                    model: 'gemini-flash'
                })
            });

            if (!response.ok) {
                throw new Error('Label analysis failed');
            }

            return await response.json();
            */

        } catch (error) {
            console.error('Label analysis error:', error);
            // フォールバック: デフォルト値を返す
            showToast('⚠️ ラベル分析に失敗しました。デフォルト設定を使用します。', 'info');
            return this.getDefaultAnalysis();
        }
    }

    /**
     * キャラクター名を生成
     * @param {Object} labelAnalysis - ラベル分析結果
     * @returns {Promise<string>} キャラクター名
     */
    async generateCharacterName(labelAnalysis) {
        try {
            // ラベル分析から名前を生成
            const themes = labelAnalysis.themes || [];
            const colors = labelAnalysis.colors || [];
            const atmosphere = labelAnalysis.atmosphere || 'elegant';

            // 日本的な名前のパターン
            const namePatterns = {
                elegant: ['雅', '華', '麗', '美', '優', '凛', '萌'],
                traditional: ['桜', '楓', '椿', '梅', '蘭', '菊', '牡丹'],
                modern: ['光', '空', '海', '星', '月', '夢', '希'],
                powerful: ['龍', '鳳', '虎', '鷹', '獅', '豹', '狼']
            };

            const suffixes = ['姫', '乃', '音', '葉', '花', '美', '子', '奈'];

            // 雰囲気に基づいて名前を選択
            const nameList = namePatterns[atmosphere] || namePatterns.elegant;
            const baseName = nameList[Math.floor(Math.random() * nameList.length)];
            const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

            return baseName + suffix;

        } catch (error) {
            console.error('Name generation error:', error);
            return '雅姫'; // デフォルト名
        }
    }

    /**
     * Ideogram V3でキャラクター画像を生成
     * @param {Object} labelAnalysis - ラベル分析結果
     * @param {string} characterName - キャラクター名
     * @param {string} rarity - レアリティ
     * @returns {Promise<string>} 生成された画像URL
     */
    async generateCharacterImage(labelAnalysis, characterName, rarity) {
        try {
            // プロンプトを構築
            const prompt = this.buildCharacterPrompt(labelAnalysis, characterName, rarity);

            // モック実装: 実際のAPIコールの代わり
            return await this.mockImageGeneration(prompt, rarity);

            /* 実際のAPI実装例:
            const response = await fetch('/api/generate-character', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: prompt,
                    model: 'ideogram/V_3',
                    aspect_ratio: '3:4',
                    rarity: rarity
                })
            });

            if (!response.ok) {
                throw new Error('Image generation failed');
            }

            const data = await response.json();
            return data.image_url;
            */

        } catch (error) {
            console.error('Image generation error:', error);
            throw new Error('キャラクター画像の生成に失敗しました');
        }
    }

    /**
     * キャラクター生成プロンプトを構築
     * @param {Object} labelAnalysis - ラベル分析結果
     * @param {string} characterName - キャラクター名
     * @param {string} rarity - レアリティ
     * @returns {string} プロンプト
     */
    buildCharacterPrompt(labelAnalysis, characterName, rarity) {
        const { colors, themes, atmosphere, motifs } = labelAnalysis;

        const basePrompt = `
A beautiful Japanese anime-style character illustration inspired by sake label design.
Character name: ${characterName}.
Rarity: ${rarity}.

Design elements from the label:
- Primary colors: ${colors.join(', ')}
- Themes: ${themes.join(', ')}
- Atmosphere: ${atmosphere}
- Motifs: ${motifs.join(', ')}

Style requirements:
- High-quality anime illustration
- Traditional Japanese aesthetic
- Elegant and refined appearance
- Character should embody the sake's personality
- Incorporate label's color scheme and motifs into outfit and accessories
- Background should reflect the atmosphere
- Portrait or upper body focus
- Professional, clean artwork

Quality: masterpiece, best quality, highly detailed, beautiful lighting
        `.trim();

        return basePrompt;
    }

    /**
     * レアリティを決定（ランダム）
     * @returns {string} レアリティ
     */
    determineRarity() {
        const random = Math.random();
        
        if (random < 0.50) return 'common';    // 50%
        if (random < 0.80) return 'rare';      // 30%
        if (random < 0.95) return 'epic';      // 15%
        return 'legendary';                     // 5%
    }

    /**
     * レアリティラベルを取得
     * @param {string} rarity - レアリティ
     * @returns {string} 日本語ラベル
     */
    getRarityLabel(rarity) {
        const labels = {
            common: 'コモン',
            rare: 'レア',
            epic: 'エピック',
            legendary: 'レジェンダリー'
        };
        return labels[rarity] || 'コモン';
    }

    /**
     * 味覚プロファイルを推定
     * @param {Object} labelAnalysis - ラベル分析結果
     * @returns {Object} 味覚プロファイル
     */
    estimateTasteProfile(labelAnalysis) {
        const { atmosphere, themes } = labelAnalysis;

        // 雰囲気とテーマから味覚を推定
        const profiles = {
            elegant: { sweetness: 3, acidity: 2, umami: 4, bitterness: 2, aroma: 5 },
            traditional: { sweetness: 3, acidity: 3, umami: 4, bitterness: 2, aroma: 4 },
            modern: { sweetness: 4, acidity: 3, umami: 3, bitterness: 1, aroma: 4 },
            powerful: { sweetness: 2, acidity: 2, umami: 5, bitterness: 3, aroma: 3 }
        };

        const baseProfile = profiles[atmosphere] || profiles.elegant;

        // ランダムに±1の変動を加える
        const result = {};
        Object.keys(baseProfile).forEach(key => {
            const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
            result[key] = Math.max(1, Math.min(5, baseProfile[key] + variation));
        });

        return result;
    }

    /**
     * デフォルトのラベル分析結果を返す
     * @returns {Object} デフォルト分析結果
     */
    getDefaultAnalysis() {
        return {
            colors: ['red', 'gold', 'white'],
            themes: ['traditional', 'elegant'],
            atmosphere: 'elegant',
            motifs: ['cherry blossom', 'crane', 'wave'],
            text_elements: ['日本酒']
        };
    }

    /**
     * モック: ラベル分析（実際のAPI実装まで使用）
     * @param {string} imageData - 画像データ
     * @returns {Promise<Object>} 分析結果
     */
    async mockLabelAnalysis(imageData) {
        // シミュレート: 非同期処理
        await new Promise(resolve => setTimeout(resolve, 2000));

        // ランダムで多様な分析結果を生成
        const atmosphereOptions = ['elegant', 'traditional', 'modern', 'powerful'];
        const colorSets = [
            ['red', 'gold', 'white'],
            ['blue', 'silver', 'white'],
            ['purple', 'gold', 'black'],
            ['pink', 'white', 'gold'],
            ['green', 'white', 'brown']
        ];
        const themeSets = [
            ['traditional', 'elegant'],
            ['modern', 'minimalist'],
            ['seasonal', 'natural'],
            ['premium', 'sophisticated']
        ];
        const motifSets = [
            ['cherry blossom', 'crane', 'wave'],
            ['mountain', 'snow', 'pine'],
            ['dragon', 'cloud', 'flame'],
            ['moon', 'bamboo', 'water']
        ];

        const randomIndex = Math.floor(Math.random() * colorSets.length);

        return {
            colors: colorSets[randomIndex],
            themes: themeSets[randomIndex],
            atmosphere: atmosphereOptions[Math.floor(Math.random() * atmosphereOptions.length)],
            motifs: motifSets[randomIndex],
            text_elements: ['日本酒', '純米大吟醸']
        };
    }

    /**
     * モック: 画像生成（実際のAPI実装まで使用）
     * @param {string} prompt - プロンプト
     * @param {string} rarity - レアリティ
     * @returns {Promise<string>} 画像URL
     */
    async mockImageGeneration(prompt, rarity) {
        // シミュレート: 非同期処理（30-60秒を模擬）
        const delay = 3000 + Math.random() * 2000; // 3-5秒（実際は30-60秒）
        await new Promise(resolve => setTimeout(resolve, delay));

        // レアリティに応じた色でプレースホルダー画像を返す
        const rarityColors = {
            common: '9ca3af',
            rare: '3b82f6',
            epic: 'a855f7',
            legendary: 'fbbf24'
        };

        const color = rarityColors[rarity] || '9ca3af';
        const characterNumber = Math.floor(Math.random() * 10) + 1;
        
        // プレースホルダー画像（実際のAPI実装時は生成された画像URLを返す）
        return `https://via.placeholder.com/300x400/${color}/ffffff?text=Character+${characterNumber}`;
    }

    /**
     * 生成履歴を取得
     * @returns {Array} 生成履歴
     */
    getHistory() {
        return this.generationHistory;
    }

    /**
     * 生成履歴をクリア
     */
    clearHistory() {
        this.generationHistory = [];
    }

    /**
     * 現在の生成状態を取得
     * @returns {boolean} 生成中かどうか
     */
    getGenerationStatus() {
        return this.isGenerating;
    }
}

// グローバルインスタンスを作成
const aiGenerationService = new AIGenerationService();

// デバッグ用にグローバルスコープに公開
window.aiGenerationService = aiGenerationService;

/**
 * カメラまたはファイルから画像を取得してBase64に変換
 * @param {File|Blob} file - 画像ファイル
 * @returns {Promise<string>} Base64エンコードされた画像データ
 */
async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * 画像を圧縮
 * @param {string} base64 - Base64画像データ
 * @param {number} maxWidth - 最大幅
 * @param {number} maxHeight - 最大高さ
 * @returns {Promise<string>} 圧縮されたBase64画像データ
 */
async function compressImage(base64, maxWidth = 1024, maxHeight = 1024) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxWidth) {
                    height = height * (maxWidth / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = width * (maxHeight / height);
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = reject;
        img.src = base64;
    });
}
