'use client';

import { use, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ChevronLeft, Lock, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LessonView } from '@/components/learning/lesson-view';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

interface LessonPageProps {
  params: Promise<{ locale: string; id: string }>;
}

type LessonData = {
  courseTitle: { ja: string; vi: string };
  lesson: {
    title: string;
    titleTranslation?: string;
    introduction: string;
    keyPoints: string[];
    vocabulary?: { word: string; reading: string; meaning: string; example?: string }[];
    dialogue?: { speaker: string; japanese: string; reading?: string; translation: string }[];
    examples: { japanese: string; reading?: string; translation: string }[];
    grammarNote?: string;
    quiz?: {
      question: string;
      options: { id: string; text: string }[];
      correctId: string;
      explanation?: string;
    };
    quizzes?: {
      question: string;
      options: { id: string; text: string }[];
      correctId: string;
      explanation?: string;
      difficulty?: 'easy' | 'medium' | 'hard';
    }[];
    xpReward: number;
  };
  isLocked: boolean;
  requiredPlan: string;
};

const mockLessons: Record<string, LessonData> = {
  // ===== N5 ひらがな・カタカナ =====
  'n5-01': {
    courseTitle: { ja: 'N5 ひらがな・カタカナ完全マスター', vi: 'Hoàn thiện Hiragana & Katakana N5' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'ひらがな第1回 〜あ行・か行〜',
      titleTranslation: 'Hiragana Bài 1 - Hàng あ và hàng か',
      introduction: `日本語の文字学習の第一歩です。ひらがなは日本語の基本文字で、全部で46字あります。まず「あ行（あいうえお）」と「か行（かきくけこ）」を覚えましょう。

Đây là bước đầu tiên học chữ tiếng Nhật. Hiragana là bộ chữ cơ bản của tiếng Nhật, gồm tất cả 46 ký tự. Hãy bắt đầu với hàng "あ" (a i u e o) và hàng "か" (ka ki ku ke ko).`,
      keyPoints: [
        'あ行：あ（a）・い（i）・う（u）・え（e）・お（o）— 母音5字',
        'か行：か（ka）・き（ki）・く（ku）・け（ke）・こ（ko）— 子音k + 母音',
        '書き順：あは3画、い・う・えは2画、おは3画',
        '発音のコツ：「う」は唇を丸めず、口を少し開けて発音',
        'カタカナとの対応：ア（a）・イ（i）・ウ（u）・エ（e）・オ（o）',
      ],
      vocabulary: [
        { word: 'あお', reading: 'あお', meaning: '青（xanh）', example: 'あおい空（そら）' },
        { word: 'いえ', reading: 'いえ', meaning: '家（nhà）', example: 'わたしのいえ' },
        { word: 'うえ', reading: 'うえ', meaning: '上（phía trên）', example: 'つくえのうえ' },
        { word: 'かお', reading: 'かお', meaning: '顔（khuôn mặt）', example: 'かおをあらう' },
        { word: 'きく', reading: 'きく', meaning: '聞く（nghe）', example: 'おんがくをきく' },
        { word: 'くに', reading: 'くに', meaning: '国（đất nước）', example: 'わたしのくに' },
      ],
      examples: [
        {
          japanese: 'あおい（青い）',
          reading: 'あおい',
          translation: 'màu xanh / 青い (xanh lam)',
        },
        {
          japanese: 'いいえ',
          reading: 'いいえ',
          translation: 'không, không phải vậy / いいえ (Không)',
        },
        {
          japanese: 'おかあさん（お母さん）',
          reading: 'おかあさん',
          translation: 'mẹ / お母さん (mẹ)',
        },
        {
          japanese: 'かいしゃ（会社）',
          reading: 'かいしゃ',
          translation: 'công ty / 会社 (công ty)',
        },
      ],
      grammarNote: `ひらがなの書き順のポイント：
- 基本的に左から右、上から下の順に書く
- 「あ」：横線 → 縦線 → 曲線（3画）
- 「き」：横線2本 → 縦線 → 右の払い（4画）

Quy tắc thứ tự nét viết Hiragana:
- Về cơ bản viết từ trái sang phải, từ trên xuống dưới`,
      quizzes: [
        {
          question: '「か」のローマ字読みは？ / "か" đọc là?',
          options: [
            { id: 'a', text: 'ka' },
            { id: 'b', text: 'ga' },
            { id: 'c', text: 'ki' },
            { id: 'd', text: 'ku' },
          ],
          correctId: 'a',
          explanation: '「か」は「ka」と読みます。か行は k + 母音（a/i/u/e/o）で構成されます。',
          difficulty: 'easy' as const,
        },
        {
          question: '「い」のローマ字読みは？ / "い" đọc là?',
          options: [
            { id: 'a', text: 'u' },
            { id: 'b', text: 'e' },
            { id: 'c', text: 'i' },
            { id: 'd', text: 'a' },
          ],
          correctId: 'c',
          explanation: '「い」は「i」と読みます。あ行の2番目の文字です。',
          difficulty: 'easy' as const,
        },
        {
          question: '「き」のローマ字読みは？ / "き" đọc là?',
          options: [
            { id: 'a', text: 'ke' },
            { id: 'b', text: 'ko' },
            { id: 'c', text: 'ka' },
            { id: 'd', text: 'ki' },
          ],
          correctId: 'd',
          explanation: '「き」は「ki」と読みます。か行の2番目（k + i）です。',
          difficulty: 'easy' as const,
        },
        {
          question: '「うえ」の意味は？ / "うえ" có nghĩa là?',
          options: [
            { id: 'a', text: '下（phía dưới）' },
            { id: 'b', text: '上（phía trên）' },
            { id: 'c', text: '家（nhà）' },
            { id: 'd', text: '川（sông）' },
          ],
          correctId: 'b',
          explanation: '「うえ」は「上」で、「phía trên・上（うえ）」という意味です。',
          difficulty: 'medium' as const,
        },
        {
          question: '「かお」の意味は？ / "かお" có nghĩa là?',
          options: [
            { id: 'a', text: '手（tay）' },
            { id: 'b', text: '足（chân）' },
            { id: 'c', text: '顔（khuôn mặt）' },
            { id: 'd', text: '目（mắt）' },
          ],
          correctId: 'c',
          explanation: '「かお」は「顔（かお）」＝ khuôn mặt / face です。',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 15,
    },
  },

  // ===== N5 語彙 =====
  'n5-02': {
    courseTitle: { ja: 'N5 基礎語彙100', vi: 'Từ vựng cơ bản N5' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N5語彙 第1回 〜数字・時間〜',
      titleTranslation: 'Từ vựng N5 Bài 1 - Số đếm và thời gian',
      introduction: `数字と時間の表現は日本語学習の最初に習得すべき基本語彙です。介護現場では「何時に薬を飲みますか？」「3回食べてください」など数字が頻繁に使われます。

Số đếm và cách diễn đạt thời gian là từ vựng cơ bản cần nắm đầu tiên. Trong môi trường điều dưỡng, số đếm được dùng thường xuyên như "Mấy giờ uống thuốc?" hay "Hãy ăn 3 lần".`,
      keyPoints: [
        '基本数字：いち(1)・に(2)・さん(3)・し/よん(4)・ご(5)・ろく(6)・なな/しち(7)・はち(8)・く/きゅう(9)・じゅう(10)',
        '時間：～じ（時）= o\'clock、～ふん/ぷん（分）= minutes',
        '4は「よん」、7は「なな」が介護現場では間違いが少ない（し=死、しち=一と聞き間違えやすい）',
        '回数：～かい（回）= times、いっかい（1回）・にかい（2回）・さんかい（3回）',
        '日付：～にち（日）、ついたち（1日）・ふつか（2日）は不規則変化',
      ],
      vocabulary: [
        { word: '一つ', reading: 'ひとつ', meaning: '1つ（một cái）', example: 'りんご一つください' },
        { word: '二つ', reading: 'ふたつ', meaning: '2つ（hai cái）', example: 'くすりを二つ' },
        { word: '時間', reading: 'じかん', meaning: '時間（thời gian）', example: '時間がありません' },
        { word: '毎日', reading: 'まいにち', meaning: '毎日（mỗi ngày）', example: '毎日練習する' },
        { word: '朝', reading: 'あさ', meaning: '朝（buổi sáng）', example: '朝ごはんの時間' },
        { word: '夜', reading: 'よる', meaning: '夜（buổi tối）', example: '夜9時に寝る' },
      ],
      examples: [
        {
          japanese: '薬は一日三回、食後に飲んでください。',
          reading: 'くすりはいちにちさんかい、しょくごにのんでください。',
          translation: 'Hãy uống thuốc 3 lần một ngày sau bữa ăn.',
        },
        {
          japanese: '今、何時ですか？',
          reading: 'いま、なんじですか？',
          translation: 'Bây giờ là mấy giờ?',
        },
        {
          japanese: 'お食事の時間は7時です。',
          reading: 'おしょくじのじかんはしちじです。',
          translation: 'Giờ ăn là 7 giờ.',
        },
        {
          japanese: '体温は36度5分です。',
          reading: 'たいおんは36どごぶです。',
          translation: 'Nhiệt độ cơ thể là 36,5 độ.',
        },
      ],
      grammarNote: `数え方（助数詞）のまとめ：
- 人を数える：〜人（にん）/ ひとり（1人）・ふたり（2人）は不規則
- 薄いものを数える：〜枚（まい）→ 紙1枚・書類2枚
- 小さいものを数える：〜個（こ）→ 薬1個・りんご3個
- 薬の回数：〜回（かい）→ 1日3回

Cách đếm trong tiếng Nhật (trợ từ đếm):
- Đếm người: 〜人（にん）/ ひとり（1）・ふたり（2）là bất quy tắc
- Vật mỏng dẹt: 〜枚（まい）→ 1 tờ giấy, 2 hồ sơ
- Vật nhỏ: 〜個（こ）→ 1 viên thuốc, 3 quả táo`,
      quizzes: [
        {
          question: '「薬は一日三回」の読み方は？ / Cách đọc "薬は一日三回"?',
          options: [
            { id: 'a', text: 'くすりはいちにちさんかい' },
            { id: 'b', text: 'くすりはひとひみっかい' },
            { id: 'c', text: 'くすりはいちにちさんき' },
            { id: 'd', text: 'やくはいちにちさんかい' },
          ],
          correctId: 'a',
          explanation: '「薬」はくすり、「一日」はいちにち、「三回」はさんかい と読みます。',
          difficulty: 'medium' as const,
        },
        {
          question: '「毎日」の読みは？ / "毎日" đọc là?',
          options: [
            { id: 'a', text: 'まいにち' },
            { id: 'b', text: 'まいひ' },
            { id: 'c', text: 'ごにち' },
            { id: 'd', text: 'あさひ' },
          ],
          correctId: 'a',
          explanation: '「毎日」は「まいにち」と読みます。every day / mỗi ngày の意味です。',
          difficulty: 'easy' as const,
        },
        {
          question: '「時間」の読みは？ / "時間" đọc là?',
          options: [
            { id: 'a', text: 'とき' },
            { id: 'b', text: 'じかん' },
            { id: 'c', text: 'しかん' },
            { id: 'd', text: 'じこく' },
          ],
          correctId: 'b',
          explanation: '「時間」は「じかん」と読みます。thời gian / time の意味です。',
          difficulty: 'easy' as const,
        },
        {
          question: '薬を「2回」飲む → 正しい読みは？ / "2回" đọc là?',
          options: [
            { id: 'a', text: 'にかい' },
            { id: 'b', text: 'ふたかい' },
            { id: 'c', text: 'にまわり' },
            { id: 'd', text: 'にほん' },
          ],
          correctId: 'a',
          explanation: '回数（かいすう）は「〜かい」と数えます。1回(いっかい)・2回(にかい)・3回(さんかい)。',
          difficulty: 'medium' as const,
        },
        {
          question: '介護現場で「4」をどう言うのが安全？ / Trong điều dưỡng, nói "4" như thế nào là an toàn?',
          options: [
            { id: 'a', text: 'し' },
            { id: 'b', text: 'よん' },
            { id: 'c', text: 'しん' },
            { id: 'd', text: 'よっつ（数え方のみ）' },
          ],
          correctId: 'b',
          explanation: '「し」は「死」と同じ発音で縁起が悪いため、介護現場では「よん」を使います。同様に7は「なな」を使います。',
          difficulty: 'hard' as const,
        },
      ],
      xpReward: 20,
    },
  },

  // ===== 介護の日本語 =====
  'care-01': {
    courseTitle: { ja: '介護の日本語 N4', vi: 'Tiếng Nhật điều dưỡng N4' },
    isLocked: false,
    requiredPlan: 'basic',
    lesson: {
      title: '介護の基本語彙と声かけ — レッスン1',
      titleTranslation: 'Từ vựng điều dưỡng cơ bản và câu hỏi thăm — Bài 1',
      introduction: `介護現場では、利用者さんへの「声かけ」がとても大切です。声かけとは、行動の前に声をかけて本人に安心してもらうことです。「これからお風呂に入りましょうか」など、一言声をかけるだけで、利用者さんの不安が減ります。

Trong môi trường điều dưỡng, việc "hỏi thăm trước khi làm" (声かけ) rất quan trọng. Đây là việc nói với người được chăm sóc trước khi thực hiện hành động để họ cảm thấy an tâm. Chỉ một câu như "Chúng ta vào tắm nhé" cũng giúp giảm lo lắng cho họ rất nhiều.`,
      keyPoints: [
        '声かけの基本：「これから〜しますね」「〜しましょうか？」の形を使う',
        '丁寧語の使い方：「〜してください」より「〜しましょう」の方が柔らかい',
        '体の調子を聞く：「お体の具合はいかがですか？」「どこか痛いところはありますか？」',
        '食事の声かけ：「お食事の準備ができました」「今日は何がお好きですか？」',
        '移動の声かけ：「立ち上がりますよ」「ゆっくりでいいですよ」「一緒にやりましょう」',
        '否定的な言葉は避ける：「ダメです」→「〜した方がいいですよ」',
      ],
      vocabulary: [
        { word: '声かけ', reading: 'こえかけ', meaning: '声をかけること（hỏi thăm trước khi làm）', example: '移動前に声かけをする' },
        { word: '具合', reading: 'ぐあい', meaning: '体の調子（tình trạng sức khỏe）', example: 'お体の具合はいかがですか' },
        { word: '介助', reading: 'かいじょ', meaning: 'お世話・手伝い（hỗ trợ thể chất）', example: '食事介助・入浴介助' },
        { word: '利用者', reading: 'りようしゃ', meaning: '介護サービスを使う人（người sử dụng dịch vụ）', example: '利用者さんの名前を呼ぶ' },
        { word: 'バイタル', reading: 'ばいたる', meaning: '生命兆候（dấu hiệu sinh tồn）', example: '朝のバイタルを測る' },
        { word: '申し送り', reading: 'もうしおくり', meaning: '業務の引き継ぎ（bàn giao ca）', example: '夜勤への申し送り' },
      ],
      dialogue: [
        {
          speaker: '介護士 (Nhân viên)',
          japanese: 'おはようございます。お体の具合はいかがですか？',
          reading: 'おはようございます。おからだのぐあいはいかがですか？',
          translation: 'Chào buổi sáng. Hôm nay cơ thể bạn thế nào ạ?',
        },
        {
          speaker: '利用者 (Người dùng)',
          japanese: '少し腰が痛いですね。',
          reading: 'すこしこしがいたいですね。',
          translation: 'Hơi đau lưng một chút.',
        },
        {
          speaker: '介護士 (Nhân viên)',
          japanese: 'そうですか。これからお食事にしましょうか。ゆっくりでいいですよ。',
          reading: 'そうですか。これからおしょくじにしましょうか。ゆっくりでいいですよ。',
          translation: 'Vậy ạ. Bây giờ chúng ta ăn cơm nhé. Từ từ thôi không sao.',
        },
        {
          speaker: '利用者 (Người dùng)',
          japanese: 'ありがとう。助かります。',
          reading: 'ありがとう。たすかります。',
          translation: 'Cảm ơn. Thật là may.',
        },
      ],
      examples: [
        {
          japanese: 'お体の具合はいかがですか？',
          reading: 'おからだのぐあいはいかがですか？',
          translation: 'Cơ thể bạn cảm thấy thế nào? / Sức khỏe hôm nay ra sao?',
        },
        {
          japanese: 'これからお食事にしましょうか。',
          reading: 'これからおしょくじにしましょうか。',
          translation: 'Chúng ta ăn bây giờ nhé? / Bây giờ mình ăn cơm nhé?',
        },
        {
          japanese: 'ゆっくりでいいですよ。焦らなくて大丈夫です。',
          reading: 'ゆっくりでいいですよ。あせらなくてだいじょうぶです。',
          translation: 'Từ từ thôi không sao. Không cần vội đâu.',
        },
        {
          japanese: 'どこか痛いところはありますか？',
          reading: 'どこかいたいところはありますか？',
          translation: 'Có chỗ nào đau không ạ?',
        },
        {
          japanese: '立ち上がりますよ。いち、に、さん。',
          reading: 'たちあがりますよ。いち、に、さん。',
          translation: 'Mình đứng dậy nhé. Một, hai, ba.',
        },
      ],
      grammarNote: `声かけに使う文型：
1. 「〜しましょうか？」= Shall we...? / 「〜しましょうか」は相手の意向を確認する丁寧な表現
2. 「〜しますね」= I'm going to... / これからする行動を予告する表現
3. 「〜でいいですよ」= It's okay to.../ 相手を安心させる表現
4. 「〜てください」= Please do.../ 丁寧なお願い（強めになることもある）

Mẫu câu dùng khi hỏi thăm:
1. 〜しましょうか = Chúng ta ... nhé? (xác nhận ý muốn của người kia)
2. 〜しますね = Tôi sẽ ... nhé (báo trước hành động sắp làm)
3. 〜でいいですよ = ... cũng được đấy (làm cho người kia yên tâm)`,
      quizzes: [
        {
          question: '「お体の具合はいかがですか？」の意味は？ / Câu này có nghĩa là gì?',
          options: [
            { id: 'a', text: 'ご飯を食べましたか？' },
            { id: 'b', text: '体の調子はどうですか？' },
            { id: 'c', text: 'どこに行きますか？' },
            { id: 'd', text: 'お薬は飲みましたか？' },
          ],
          correctId: 'b',
          explanation: '「具合」は体の状態・調子を意味します。「いかがですか」は「どうですか」の丁寧な言い方です。',
          difficulty: 'easy' as const,
        },
        {
          question: '移動前の正しい声かけはどれですか？ / Câu hỏi thăm đúng trước khi di chuyển?',
          options: [
            { id: 'a', text: '急いでください。' },
            { id: 'b', text: '立ちます！' },
            { id: 'c', text: 'これから立ち上がりますよ。ゆっくりでいいですよ。' },
            { id: 'd', text: '立てますか？ダメですか？' },
          ],
          correctId: 'c',
          explanation: '声かけは「これから〜しますよ」で事前に伝え、「ゆっくりでいいですよ」で安心させるのが基本です。',
          difficulty: 'medium' as const,
        },
        {
          question: '「バイタル」の意味は？ / "バイタル" có nghĩa là gì?',
          options: [
            { id: 'a', text: '朝食（bữa sáng）' },
            { id: 'b', text: '生命兆候（dấu hiệu sinh tồn）' },
            { id: 'c', text: '入浴介助（hỗ trợ tắm）' },
            { id: 'd', text: '業務引き継ぎ（bàn giao ca）' },
          ],
          correctId: 'b',
          explanation: 'バイタル（バイタルサイン）は体温・血圧・脈拍・呼吸数などの生命兆候のことです。dấu hiệu sinh tồn。',
          difficulty: 'easy' as const,
        },
        {
          question: '「申し送り」の意味として正しいのは？ / "申し送り" có nghĩa là?',
          options: [
            { id: 'a', text: '利用者への挨拶（chào người dùng）' },
            { id: 'b', text: '業務の引き継ぎ（bàn giao công việc）' },
            { id: 'c', text: '食事の配膳（phục vụ bữa ăn）' },
            { id: 'd', text: '医師への報告（báo cáo bác sĩ）' },
          ],
          correctId: 'b',
          explanation: '「申し送り」はシフト交代のときに業務の状況を次の担当者へ伝えることです（= bàn giao ca）。',
          difficulty: 'medium' as const,
        },
        {
          question: '否定的な言い方を避けるとき、「ダメです」の代わりに使うのは？ / Thay "ダメです" bằng gì?',
          options: [
            { id: 'a', text: 'そうですね。' },
            { id: 'b', text: '〜した方がいいですよ。' },
            { id: 'c', text: '絶対にやめてください。' },
            { id: 'd', text: '知りません。' },
          ],
          correctId: 'b',
          explanation: '「〜した方がいいですよ」は提案の形で、相手を傷つけずに行動を促せます。介護では否定より提案の表現を使いましょう。',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 30,
    },
  },

  // ===== 介護記録 =====
  'care-02': {
    courseTitle: { ja: '介護記録・申し送りの書き方', vi: 'Cách viết hồ sơ điều dưỡng' },
    isLocked: false,
    requiredPlan: 'basic',
    lesson: {
      title: '介護記録の基本 — 5W1H で書く',
      titleTranslation: 'Cơ bản viết hồ sơ điều dưỡng — Viết theo 5W1H',
      introduction: `介護記録は、利用者さんのケアの内容を正確に記録する重要な書類です。良い介護記録は「5W1H（いつ・どこで・誰が・何を・なぜ・どのように）」を意識して書きます。記録は主観ではなく客観的事実を書き、専門用語を使いながらも分かりやすく書くことが求められます。

Hồ sơ điều dưỡng là tài liệu quan trọng ghi chép chính xác nội dung chăm sóc người dùng dịch vụ. Hồ sơ tốt được viết theo 5W1H (khi nào, ở đâu, ai, cái gì, tại sao, như thế nào). Cần viết sự thật khách quan chứ không phải cảm nhận chủ quan, dùng thuật ngữ chuyên môn nhưng phải dễ hiểu.`,
      keyPoints: [
        '5W1H：いつ（When）・どこで（Where）・誰が（Who）・何を（What）・なぜ（Why）・どのように（How）',
        '客観的事実を書く：「元気そうだった」(NG) → 「笑顔で挨拶された」(OK)',
        '数値で記録する：「少し食べた」(NG) → 「主食5割、副食8割摂取」(OK)',
        '専門用語の活用：経口摂取・自立・一部介助・全介助・残存機能',
        'NG例→OK例：「転んだ」→「居室内にて転倒。右膝に擦過傷あり。Dr報告済み」',
      ],
      vocabulary: [
        { word: '経口摂取', reading: 'けいこうせっしゅ', meaning: '口から食べること（ăn qua miệng）', example: '経口摂取8割' },
        { word: '一部介助', reading: 'いちぶかいじょ', meaning: '一部だけ手伝う（hỗ trợ một phần）', example: '入浴は一部介助で実施' },
        { word: '全介助', reading: 'ぜんかいじょ', meaning: 'すべて手伝う（hỗ trợ toàn phần）', example: '更衣は全介助' },
        { word: '残存機能', reading: 'ざんそんきのう', meaning: '残っている能力（khả năng còn lại）', example: '残存機能を活かす' },
        { word: '訴え', reading: 'うったえ', meaning: '本人の言葉・主張（lời phàn nàn, yêu cầu）', example: '腹痛の訴えあり' },
        { word: 'バイタル測定', reading: 'ばいたるそくてい', meaning: '体温・血圧などを測る（đo dấu hiệu sinh tồn）', example: '朝のバイタル測定実施' },
      ],
      examples: [
        {
          japanese: '9:00 朝食介助。主食9割、副食全量摂取。水分200ml。',
          reading: 'ごぜんくじ あさしょくかいじょ。しゅしょくきゅうわり、ふくしょくぜんりょうせっしゅ。すいぶんにひゃくみりりっとる。',
          translation: '9:00 Hỗ trợ ăn sáng. Ăn 9/10 cơm, ăn hết thức ăn phụ. Nước 200ml.',
        },
        {
          japanese: '10:30 居室にて転倒。右膝に軽度の擦過傷あり。Dr.〇〇に報告済み。経過観察中。',
          reading: 'じゅうじさんじゅっぷん きょしつにててんとう。みぎひざにけいどのさっかしょうあり。',
          translation: '10:30 Ngã trong phòng. Có vết xước nhẹ ở đầu gối phải. Đã báo cáo bác sĩ XX. Đang theo dõi.',
        },
        {
          japanese: '入浴：シャワー浴実施。洗体は一部介助。体温36.8℃、血圧118/76mmHg。「気持ちよかった」との発言あり。',
          reading: 'にゅうよく：しゃわーよくじっし。せんたいはいちぶかいじょ。',
          translation: 'Tắm: Thực hiện tắm vòi sen. Hỗ trợ một phần rửa thân. Nhiệt độ 36,8°C, huyết áp 118/76. Có lời nói "Dễ chịu quá".',
        },
      ],
      grammarNote: `介護記録でよく使う表現：
- 「〜を実施した」= Đã thực hiện ...
- 「〜との訴えあり」= Có phàn nàn về ...
- 「〜は良好」= ... tốt
- 「〜にて」= tại ...（場所を示す書き言葉）
- 「〜済み」= đã ...（Dr報告済み = đã báo cáo bác sĩ）
- 「経過観察中」= đang theo dõi diễn biến`,
      quiz: {
        question: '介護記録で正しい書き方はどれですか？',
        options: [
          { id: 'a', text: '今日は元気そうで、よく食べた' },
          { id: 'b', text: '12:00 昼食、主食8割・副食6割摂取。水分150ml。笑顔で「おいしかった」との発言あり' },
          { id: 'c', text: 'いつもと変わらず普通だった' },
          { id: 'd', text: '食事はあまり食べなかった' },
        ],
        correctId: 'b',
        explanation: 'bが正解。具体的な時間・数値・客観的な事実・本人の言葉（発言）が含まれています。a・c・dは主観的・曖昧すぎます。\nb là đúng. Bao gồm thời gian cụ thể, số liệu, sự thật khách quan và lời nói của người dùng.',
      },
      xpReward: 35,
    },
  },

  // ===== 身体介護 =====
  'care-03': {
    courseTitle: { ja: '身体介護の日本語 〜入浴・移動・食事介助〜', vi: 'Tiếng Nhật chăm sóc thể chất' },
    isLocked: false,
    requiredPlan: 'basic',
    lesson: {
      title: '身体介護の声かけ — 移動介助編',
      titleTranslation: 'Câu hỏi thăm khi hỗ trợ thể chất — Phần di chuyển',
      introduction: `移動介助は介護の中で最もよく行われる業務の一つです。ベッドから車椅子への移乗、廊下の歩行介助、トイレへの誘導など、様々な場面で安全に声かけをしながら介助することが求められます。

Hỗ trợ di chuyển là một trong những công việc phổ biến nhất trong điều dưỡng. Từ chuyển từ giường lên xe lăn, hỗ trợ đi bộ ở hành lang, đến dẫn đến nhà vệ sinh — cần hỗ trợ an toàn kết hợp với hỏi thăm trong nhiều tình huống khác nhau.`,
      keyPoints: [
        'ベッドから起き上がる：「これから起き上がりますよ。準備はいいですか？」',
        '立ち上がり：「では、立ち上がりましょう。いち、に、さん。」',
        '歩行介助：「ゆっくり歩きましょう。急がなくて大丈夫ですよ」',
        'トイレ誘導：「お手洗いにご案内します。一緒に行きましょう」',
        '座る：「こちらに腰かけてください。はい、上手ですよ」',
        '車椅子移乗：「ブレーキをかけますね。では、立ち上がりましょう」',
      ],
      vocabulary: [
        { word: '移乗', reading: 'いじょう', meaning: 'ベッドと車椅子の間の移動（chuyển vị trí）', example: 'ベッドから車椅子への移乗' },
        { word: '歩行介助', reading: 'ほこうかいじょ', meaning: '歩くのを手伝う（hỗ trợ đi bộ）', example: '廊下で歩行介助する' },
        { word: 'ブレーキ', reading: 'ぶれーき', meaning: '車椅子のストッパー（phanh xe lăn）', example: 'ブレーキをかけてください' },
        { word: '手すり', reading: 'てすり', meaning: 'つかまる棒（tay vịn）', example: '手すりにつかまってください' },
        { word: '重心', reading: 'じゅうしん', meaning: '体の中心（trọng tâm）', example: '重心を前にかけましょう' },
        { word: '誘導', reading: 'ゆうどう', meaning: '案内・誘う（dẫn đường, hướng dẫn）', example: 'トイレに誘導する' },
      ],
      examples: [
        { japanese: 'ベッドの端に座りましょう。足を床につけてください。ゆっくりでいいですよ。', reading: 'べっどのはしにすわりましょう。あしをゆかにつけてください。ゆっくりでいいですよ。', translation: 'Hãy ngồi ở mép giường. Đặt chân xuống sàn. Từ từ thôi không sao.' },
        { japanese: 'では立ち上がりますよ。私の手につかまってください。いち、に、さん！', reading: 'ではたちあがりますよ。わたしのてにつかまってください。いち、に、さん！', translation: 'Đứng dậy nhé. Hãy nắm tay tôi. Một, hai, ba!' },
        { japanese: 'お手洗いに行きましょうか？一緒にゆっくり行きましょう。', reading: 'おてあらいにいきましょうか？いっしょにゆっくりいきましょう。', translation: 'Mình đi vệ sinh nhé? Cùng nhau đi từ từ thôi.' },
      ],
      grammarNote: `【移動介助の声かけパターン】
事前確認：「〜しましょうか？準備はいいですか？」
開始合図：「では〜します。いち、に、さん。」
安心させる：「ゆっくりでいいですよ。大丈夫ですよ。」
完了確認：「上手でした。はい、座れましたね。」
次の案内：「次は〜しましょう。」`,
      quiz: {
        question: '立ち上がり介助の最初の声かけとして最適なのは？',
        options: [
          { id: 'a', text: 'もう立って！' },
          { id: 'b', text: 'これから立ち上がりますよ。準備はいいですか？' },
          { id: 'c', text: '早く起きてください' },
          { id: 'd', text: '立ち上がれますか？' },
        ],
        correctId: 'b',
        explanation: '移動介助では「これから〜しますよ」と予告してから介助します。突然動かすと利用者さんが驚き、転倒リスクが高まります。\nKhi hỗ trợ di chuyển, phải báo trước "これから〜しますよ" rồi mới hỗ trợ.',
      },
      xpReward: 35,
    },
  },

  // ===== 認知症ケア =====
  'care-04': {
    courseTitle: { ja: '認知症ケアのコミュニケーション', vi: 'Giao tiếp trong chăm sóc người mắc chứng mất trí nhớ' },
    isLocked: false,
    requiredPlan: 'basic',
    lesson: {
      title: '認知症の方への言葉かけ — バリデーション技法',
      titleTranslation: 'Cách nói chuyện với người mắc chứng mất trí nhớ — Kỹ thuật Validation',
      introduction: `認知症の方への対応は、一般的な介護とは異なるアプローチが必要です。バリデーション（Validation）とは、相手の感情や現実を否定せず、共感して受け止めることです。「違います」と訂正することで、かえって不穏になることがあります。

Cách tiếp cận với người mắc chứng mất trí nhớ khác với điều dưỡng thông thường. Validation là không phủ nhận cảm xúc và thực tế của người kia mà lắng nghe với sự đồng cảm. Việc sửa lại "Sai rồi" đôi khi khiến họ trở nên bất an hơn.`,
      keyPoints: [
        'バリデーション：感情を否定せず受け入れる「そうですか、そうでしたか」',
        '訂正しない：「違います」→「そうですね、〜ですね」',
        '繰り返し質問への対応：「今どんな気持ちですか？」と気持ちを聞く',
        '帰宅願望：「もうすぐお会いできますよ」「今日はここで過ごしましょう」',
        '非言語コミュニケーション：目線・表情・タッチが大切',
        '「そうですか」の力：共感の言葉で安心感を与える',
      ],
      vocabulary: [
        { word: 'バリデーション', reading: 'ばりでーしょん', meaning: '感情を受け入れる技法（kỹ thuật đồng cảm）', example: 'バリデーションで対応する' },
        { word: '不穏', reading: 'ふおん', meaning: '落ち着かない・不安定な状態（bất ổn）', example: '夜間に不穏になる' },
        { word: '帰宅願望', reading: 'きたくがんぼう', meaning: '家に帰りたがること（muốn về nhà）', example: '帰宅願望が強い' },
        { word: '傾聴', reading: 'けいちょう', meaning: '注意深く聞く（lắng nghe chú tâm）', example: '傾聴することが大切' },
        { word: '共感', reading: 'きょうかん', meaning: '相手の気持ちを理解する（đồng cảm）', example: '共感的な対応をする' },
      ],
      examples: [
        { japanese: '利用者：「家に帰らないといけない」 介護士：「そうですか。ご自宅のことが心配なんですね。今日はここで一緒にいましょう。」', reading: 'りようしゃ：「うちにかえらないといけない」かいごし：「そうですか。ごじたくのことがしんぱいなんですね。きょうはここでいっしょにいましょう。」', translation: 'Người dùng: "Tôi phải về nhà" - ĐD: "Vậy ạ. Bác lo lắng về nhà ạ. Hôm nay mình ở đây cùng nhau nhé."' },
        { japanese: '「そうですか、大変でしたね。よく頑張りましたね。」', reading: 'そうですか、たいへんでしたね。よくがんばりましたね。', translation: '"Vậy ạ, khó khăn thật nhỉ. Bác đã cố gắng lắm đấy."' },
      ],
      grammarNote: `【バリデーションで使う表現】
受け入れる：「そうですか」「そうですね」「そうでしたか」
共感する：「大変でしたね」「心配でしたね」「つらいですね」
気持ちを聞く：「今、どんなお気持ちですか？」
一緒にいる：「私もここにいますよ」「一緒に〜しましょう」

【避けるべき表現】
×「違います」×「そんなことはないですよ」×「さっきも言いましたよ」`,
      quiz: {
        question: '認知症の方が「子供を迎えに行かないと」と言ったとき、最適な対応は？',
        options: [
          { id: 'a', text: '「お子さんはもう大人ですよ」と事実を伝える' },
          { id: 'b', text: '「そうですか。お子さんのことが心配なんですね」と共感する' },
          { id: 'c', text: '「そんなことより食事にしましょう」と話題を変える' },
          { id: 'd', text: '無視する' },
        ],
        correctId: 'b',
        explanation: 'バリデーションでは感情（心配している）を受け入れることが大切。事実の訂正は混乱を招くことがあります。\nTrong Validation, quan trọng là tiếp nhận cảm xúc (đang lo lắng). Sửa thực tế có thể gây thêm nhầm lẫn.',
      },
      xpReward: 35,
    },
  },

  // ===== 夜勤・緊急時 =====
  'care-05': {
    courseTitle: { ja: '夜勤・緊急時の日本語対応', vi: 'Tiếng Nhật khi trực đêm và xử lý khẩn cấp' },
    isLocked: false,
    requiredPlan: 'basic',
    lesson: {
      title: '夜勤の見回りと急変対応',
      titleTranslation: 'Tuần tra đêm và xử lý đột biến',
      introduction: `夜勤は少ないスタッフで多くの利用者さんを見守る責任ある業務です。定時の見回り・睡眠確認・急変時の対応・ナースへの報告が主な業務です。緊急時は正確な情報を素早く伝えることが命に関わります。

Trực đêm là công việc trách nhiệm cao khi ít nhân viên phải chăm sóc nhiều người dùng. Công việc chính là tuần tra đúng giờ, kiểm tra giấc ngủ, xử lý đột biến và báo cáo y tá. Trong trường hợp khẩn cấp, truyền đạt thông tin chính xác nhanh chóng liên quan đến tính mạng.`,
      keyPoints: [
        '見回り報告：「〇号室、〇〇様、安眠中です。異常なし」',
        '急変報告：「〇〇様が〜の状態です。すぐ来てください」',
        '転倒発見：「〇号室で転倒を発見しました。意識はあります」',
        '救急要請：「〇〇施設です。救急車をお願いします。〇〇様が〜の状態です」',
        '引き継ぎ：「夜間の特記事項は〜です。〜については経過観察をお願いします」',
      ],
      vocabulary: [
        { word: '見回り', reading: 'みまわり', meaning: '定期的な確認巡回（tuần tra định kỳ）', example: '夜間の見回りをする' },
        { word: '安眠中', reading: 'あんみんちゅう', meaning: '静かに眠っている（đang ngủ yên）', example: '安眠中です、異常なし' },
        { word: '急変', reading: 'きゅうへん', meaning: '急に状態が変わる（đột biến）', example: '急変が発生した' },
        { word: '意識', reading: 'いしき', meaning: '意識（ý thức）', example: '意識があります・意識がありません' },
        { word: '特記事項', reading: 'とっきじこう', meaning: '特別に記録すること（điểm đặc biệt cần ghi）', example: '夜間の特記事項を報告する' },
        { word: '経過観察', reading: 'けいかかんさつ', meaning: '様子を見ること（theo dõi diễn biến）', example: '経過観察をお願いします' },
      ],
      examples: [
        { japanese: '「ナースさん、緊急です。201号室の田中様が呼吸困難の状態です。すぐ来てください。」', reading: 'なーすさん、きんきゅうです。にひゃくいちごうしつのたなかさまがこきゅうこんなんのじょうたいです。すぐきてください。', translation: '"Y tá ơi, khẩn cấp. Ông Tanaka phòng 201 đang trong tình trạng khó thở. Hãy đến ngay."' },
        { japanese: '「119番？〇〇介護施設です。救急車をお願いします。75歳男性が意識不明です。住所は〜です。」', reading: '「ひゃくじゅうきゅうばん？〇〇かいごしせつです。きゅうきゅうしゃをおねがいします。ななじゅうごさいだんせいがいしきふめいです。じゅうしょは〜です。」', translation: '"119 à? Cơ sở điều dưỡng XX. Cho tôi xe cứu thương. Nam 75 tuổi bất tỉnh. Địa chỉ là..."' },
      ],
      grammarNote: `【緊急時の報告構成（SBAR法）】
S（状況）：「〇〇様が〜の状態です」
B（背景）：「〜時から〜の症状がありました」
A（評価）：「〜と思われます」
R（要望）：「すぐ来てください / 指示をお願いします」

【119番通報の流れ】
1. 「救急です（きゅうきゅうです）」
2. 住所（じゅうしょ）
3. 患者の状態（かんじゃのじょうたい）
4. 名前・年齢（なまえ・ねんれい）`,
      quiz: {
        question: '急変を発見したとき、最初にすることは？',
        options: [
          { id: 'a', text: 'まず家族に連絡する' },
          { id: 'b', text: '一人で対応する' },
          { id: 'c', text: 'すぐにナース・上司に報告する' },
          { id: 'd', text: '記録を書く' },
        ],
        correctId: 'c',
        explanation: '急変時はまず「報告」が最優先。「ナース・上司への報告→指示に従って対応→記録」の順です。一人で判断・対応することは危険です。\nKhi có đột biến, ưu tiên đầu tiên là "báo cáo". Thứ tự: Báo cáo y tá/cấp trên → làm theo chỉ đạo → ghi chép.',
      },
      xpReward: 40,
    },
  },

  // ===== 職場の日本語 =====
  'care-06': {
    courseTitle: { ja: 'N3 職場の日本語 〜ビジネス敬語・報連相〜', vi: 'Tiếng Nhật nơi làm việc N3 - Kính ngữ & báo cáo' },
    isLocked: false,
    requiredPlan: 'basic',
    lesson: {
      title: '報連相 — 報告・連絡・相談の日本語',
      titleTranslation: 'Báo cáo - Liên lạc - Tham vấn trong tiếng Nhật',
      introduction: `「報連相（ほうれんそう）」は日本の職場文化の基本です。「報告・連絡・相談」の頭文字をとった言葉で、日本のすべての職場で重視されています。特に介護現場では、情報共有が利用者さんの安全に直結するため、報連相が非常に重要です。

「報連相（ほうれんそう）」là nền tảng văn hóa nơi làm việc Nhật Bản — viết tắt của Báo cáo・Liên lạc・Tham vấn. Đặc biệt trong điều dưỡng, chia sẻ thông tin liên quan trực tiếp đến an toàn người dùng nên báo liên tham rất quan trọng.`,
      keyPoints: [
        '報告（ほうこく）：業務終了・問題発生を上司に知らせる',
        '連絡（れんらく）：スタッフ間で情報を共有する',
        '相談（そうだん）：判断に困るとき上司に意見を求める',
        '報告の形：「〜しました。結果は〜です。」',
        '相談の形：「〜について相談させてください。〜の場合、どうすればよいでしょうか」',
        '悪い知らせほど早く：問題は隠さず、すぐに報告する',
      ],
      vocabulary: [
        { word: '報連相', reading: 'ほうれんそう', meaning: '報告・連絡・相談（báo-liên-tham）', example: '報連相を徹底する' },
        { word: 'ご報告します', reading: 'ごほうこくします', meaning: '報告します（kính ngữ）（xin báo cáo）', example: '昨日の件についてご報告します' },
        { word: '確認をお願いします', reading: 'かくにんをおねがいします', meaning: 'チェックしてください（nhờ xác nhận）', example: '記録の確認をお願いします' },
        { word: 'ご相談があります', reading: 'ごそうだんがあります', meaning: '相談したい（tôi muốn tham khảo ý kiến）', example: 'ちょっとご相談があります' },
        { word: '申し訳ありません', reading: 'もうしわけありません', meaning: 'すみません（xin lỗi - rất trang trọng）', example: 'ご迷惑をおかけして申し訳ありません' },
      ],
      examples: [
        { japanese: '「主任、ご報告があります。田中様が今朝から食欲がなく、半分しか食べられていません。どのように対応すればよいでしょうか？」', reading: 'しゅにん、ごほうこくがあります。たなかさまがけさからしょくよくがなく、はんぶんしかたべられていません。どのようにたいおうすればよいでしょうか？', translation: '"Trưởng nhóm ơi, tôi muốn báo cáo. Ông Tanaka từ sáng không có cảm giác thèm ăn, chỉ ăn được một nửa. Nên xử lý thế nào ạ?"' },
        { japanese: '「先輩、少しご相談させてください。〇〇さんへの対応について迷っています。」', reading: 'せんぱい、すこしごそうだんさせてください。〇〇さんへのたいおうについてまよっています。', translation: '"Tiền bối ơi, cho tôi hỏi chút ạ. Tôi đang phân vân về cách xử lý với ông/bà XX."' },
      ],
      grammarNote: `【報告の基本構成】
1. 事実：「〜しました」「〜がありました」
2. 状況：「〜の状態です」「〜という結果でした」
3. 自分の判断（あれば）：「〜と思います」
4. 相談・依頼：「〜はどうすればよいでしょうか」

【相談の丁寧な表現】
「ちょっとよろしいですか？」= 少しいいですか？
「〜についてご相談があります」= 相談したい
「〜していただけますか」= してもらえますか？`,
      quiz: {
        question: '「報連相」の「連」は何を意味しますか？',
        options: [
          { id: 'a', text: '連絡（れんらく）' },
          { id: 'b', text: '連続（れんぞく）' },
          { id: 'c', text: '連帯（れんたい）' },
          { id: 'd', text: '連携（れんけい）' },
        ],
        correctId: 'a',
        explanation: '報連相 = 報告（ほうこく）・連絡（れんらく）・相談（そうだん）。「連」は連絡のことです。\n報連相 = Báo cáo・Liên lạc・Tham vấn. "連" là viết tắt của 連絡.',
      },
      xpReward: 35,
    },
  },

  // ===== 薬の管理 =====
  'care-07': {
    courseTitle: { ja: '薬の管理と服薬介助の日本語', vi: 'Tiếng Nhật quản lý thuốc và hỗ trợ uống thuốc' },
    isLocked: false,
    requiredPlan: 'basic',
    lesson: {
      title: '薬の種類と服薬介助の言葉',
      titleTranslation: 'Loại thuốc và từ ngữ khi hỗ trợ uống thuốc',
      introduction: `薬の管理は介護業務の中でも特に慎重を要する業務です。誤薬（間違った薬を渡す）は重大な事故につながります。薬の種類・飲み方・注意事項を日本語で正確に理解し、利用者さんに分かりやすく説明できる能力が必要です。

Quản lý thuốc là công việc đòi hỏi đặc biệt thận trọng trong điều dưỡng. Nhầm thuốc (đưa sai thuốc) dẫn đến tai nạn nghiêm trọng. Cần hiểu chính xác bằng tiếng Nhật về loại thuốc, cách uống, lưu ý và có khả năng giải thích dễ hiểu cho người dùng.`,
      keyPoints: [
        '内服薬の種類：錠剤・カプセル・粉薬・液体薬・貼り薬・塗り薬',
        '飲むタイミング：食前（しょくぜん）・食後（しょくご）・食間（しょっかん）・就寝前（しゅうしんまえ）',
        '誤薬防止：「薬の名前・量・時間」の3確認（三つのチェック）',
        '服薬拒否：「お薬ですよ。飲むと〜が楽になりますよ」',
        '服薬確認：「全部飲めましたか？」「口の中に残っていませんか？」',
      ],
      vocabulary: [
        { word: '錠剤', reading: 'じょうざい', meaning: '固形の薬（thuốc viên）', example: '血圧の錠剤を飲む' },
        { word: '粉薬', reading: 'こなぐすり', meaning: '粉末の薬（thuốc bột）', example: '粉薬は飲みにくい' },
        { word: '食後', reading: 'しょくご', meaning: '食事の後（sau bữa ăn）', example: '食後30分以内に飲む' },
        { word: '食間', reading: 'しょっかん', meaning: '食事と食事の間（giữa hai bữa ăn）', example: '食間：食後2時間後' },
        { word: '誤薬', reading: 'ごやく', meaning: '間違った薬を渡す（nhầm thuốc）', example: '誤薬インシデントを防ぐ' },
        { word: '服薬確認', reading: 'ふくやくかくにん', meaning: '薬を飲んだか確認（xác nhận đã uống thuốc）', example: '服薬確認を行う' },
      ],
      examples: [
        { japanese: 'お薬の時間です。今日の朝の分ですよ。「水と一緒に飲んでください。全部飲めましたか？」', reading: 'おくすりのじかんです。きょうのあさのぶんですよ。「みずといっしょにのんでください。ぜんぶのめましたか？」', translation: 'Đến giờ uống thuốc rồi. Đây là phần buổi sáng hôm nay. "Hãy uống với nước nhé. Uống hết chưa ạ?"' },
        { japanese: 'お薬を飲むのが嫌ですか？この薬は頭痛が楽になりますよ。一緒に飲みましょう。', reading: 'おくすりをのむのがいやですか？このくすりはずつうがらくになりますよ。いっしょにのみましょう。', translation: 'Không muốn uống thuốc ạ? Thuốc này sẽ giảm đau đầu đấy. Cùng uống nhé.' },
      ],
      grammarNote: `【服薬介助の確認ポイント】
5Rチェック（正しい介助のために）:
1. 正しい利用者（Right resident）
2. 正しい薬（Right medication）
3. 正しい量（Right dose）
4. 正しい時間（Right time）
5. 正しい方法（Right route）

【飲み方の時間帯】
食前 = 食事の30分前 / 食後 = 食後30分以内
食間 = 食後2時間 / 就寝前 = 寝る前`,
      quiz: {
        question: '「食間」に薬を飲む正しいタイミングは？',
        options: [
          { id: 'a', text: '食事中' },
          { id: 'b', text: '食事の直前' },
          { id: 'c', text: '食後約2時間後（食事と食事の間）' },
          { id: 'd', text: '就寝直前' },
        ],
        correctId: 'c',
        explanation: '「食間（しょっかん）」は食事と食事の間の時間を指し、通常は食後2時間後頃です。食事中ではないので注意。\n「食間」là giữa hai bữa ăn, thường khoảng 2 giờ sau bữa ăn. Không phải trong khi ăn.',
      },
      xpReward: 40,
    },
  },

  // ===== 家族・ケアマネ =====
  'care-08': {
    courseTitle: { ja: '家族・ケアマネとの連携の日本語', vi: 'Tiếng Nhật phối hợp với gia đình và quản lý chăm sóc' },
    isLocked: false,
    requiredPlan: 'basic',
    lesson: {
      title: 'ご家族への状況説明と電話応対',
      titleTranslation: 'Giải thích tình trạng và ứng đáp điện thoại với gia đình',
      introduction: `介護施設では、利用者さんのご家族に定期的に状況を報告したり、急変時に連絡したりすることが必要です。ご家族は利用者さんのことを心配されているので、丁寧かつ正確な説明が求められます。電話応対でも、聞き取りにくい場合は繰り返しを依頼する勇気が必要です。

Trong cơ sở điều dưỡng, cần định kỳ báo cáo tình trạng cho gia đình người dùng và liên hệ khi có đột biến. Gia đình lo lắng cho người thân nên cần giải thích lịch sự và chính xác. Khi nghe điện thoại không rõ, cần dũng cảm nhờ nói lại.`,
      keyPoints: [
        '電話の受け方：「はい、〇〇施設でございます」',
        '状況報告：「〇〇様は最近〜の様子で、〜を楽しんでいらっしゃいます」',
        '悪い知らせ：「実は〜という状況が発生しました。ご心配をおかけして申し訳ありません」',
        '聞き返す：「恐れ入りますが、もう一度おっしゃっていただけますか」',
        '確認の取り方：「〇〇様でいらっしゃいますか？ご確認いただけますか？」',
      ],
      vocabulary: [
        { word: 'いらっしゃいます', reading: 'いらっしゃいます', meaning: 'います の尊敬語（có mặt - kính ngữ）', example: 'お父様はいらっしゃいますか' },
        { word: '恐れ入りますが', reading: 'おそれいりますが', meaning: '申し訳ないですが（xin lỗi vì điều này）', example: '恐れ入りますが、お名前を' },
        { word: '伝言', reading: 'でんごん', meaning: 'メッセージ（tin nhắn, lời nhắn）', example: '伝言をお伝えします' },
        { word: '折り返す', reading: 'おりかえす', meaning: '電話を掛け直す（gọi lại）', example: '折り返しご連絡します' },
        { word: 'ご心配', reading: 'ごしんぱい', meaning: '心配 の丁寧語（lo lắng - kính ngữ）', example: 'ご心配をおかけしました' },
      ],
      examples: [
        { japanese: '「もしもし、〇〇様のご家族の方でいらっしゃいますか？私、担当の〇〇と申します。お父様ですが、今朝から食欲がなく、体温も37.5度と少し高めです。ご心配をおかけして申し訳ありません。経過観察しておりますが、何かご不明な点はございますか？」', reading: '', translation: '"Xin chào, đây có phải là gia đình của ông/bà XX không? Tôi là XX, người phụ trách. Về phía cha/mẹ của bạn, sáng nay không có cảm giác thèm ăn và nhiệt độ cũng hơi cao 37,5 độ. Xin lỗi vì đã làm bạn lo lắng. Chúng tôi đang theo dõi, bạn có điều gì chưa rõ không?"' },
      ],
      grammarNote: `【電話応対の基本フロー】
1. 受ける：「はい、〇〇施設でございます」
2. 確認する：「〇〇様でいらっしゃいますか？」
3. 用件を聞く：「本日はどのようなご用件でしょうか？」
4. 担当者につなぐ/報告する
5. 終わる：「失礼いたします」

【聞き返す丁寧な表現】
「恐れ入りますが、もう一度おっしゃっていただけますか？」
「お電話が少し遠いようで、〜の部分をもう一度お願いできますか？」`,
      quiz: {
        question: '電話で相手の声が聞き取れなかった場合の適切な表現は？',
        options: [
          { id: 'a', text: 'もう一回言って！' },
          { id: 'b', text: '聞こえません' },
          { id: 'c', text: '恐れ入りますが、もう一度おっしゃっていただけますか？' },
          { id: 'd', text: '電話が悪いですね' },
        ],
        correctId: 'c',
        explanation: '「恐れ入りますが」はビジネスで「申し訳ありませんが」の意味で使う丁寧な表現。聞き返す際の基本フレーズです。\n「恐れ入りますが」là biểu đạt lịch sự nghĩa "xin lỗi nhưng..." trong môi trường công việc.',
      },
      xpReward: 40,
    },
  },

  // ===== N4 文法 =====
  'n4-02': {
    courseTitle: { ja: 'N4 文法完全対策', vi: 'Ngữ pháp N4 toàn diện' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4文法: 〜てしまう / 〜ちゃう',
      titleTranslation: 'Ngữ pháp N4: 〜てしまう / 〜ちゃう',
      introduction: `「〜てしまう」は2つの意味を持つ重要な文法です。
①完了：動作が完全に終わったことを表す（中国語の「完」のニュアンス）
②後悔・意図しない結果：望ましくないことが起きたときの感情を表す

「〜ちゃった」は「〜てしまった」の口語形で、友人や同僚との会話でよく使います。
介護現場での使用例：「薬を飲み忘れてしまいました」「転んでしまって...」

「〜てしまう」 có 2 nghĩa quan trọng:
1. Hoàn thành: hành động đã hoàn toàn kết thúc
2. Hối tiếc / kết quả không mong muốn: diễn đạt cảm xúc khi điều không hay xảy ra`,
      keyPoints: [
        '接続：動詞て形 + しまう（例：食べて + しまう = 食べてしまう）',
        '完了の意味：「全部食べてしまった」= 食べ終えた、もうない',
        '後悔の意味：「壊してしまった」= 壊したことへの後悔・申し訳なさ',
        '口語形：〜てしまう→〜ちゃう、〜でしまう→〜じゃう（例：飲んじゃった）',
        '介護での用例：「薬を飲み忘れてしまいました」「転倒させてしまいました」',
        '丁寧形：〜てしまいました（過去・丁寧）、〜てしまいます（現在・丁寧）',
      ],
      vocabulary: [
        { word: '忘れる', reading: 'わすれる', meaning: '忘れる（quên）', example: '薬を忘れてしまった' },
        { word: '転ぶ', reading: 'ころぶ', meaning: '転ぶ（ngã）', example: '廊下で転んでしまった' },
        { word: '壊す', reading: 'こわす', meaning: '壊す（làm hỏng）', example: '機械を壊してしまった' },
        { word: '飲む', reading: 'のむ', meaning: '飲む（uống）', example: '水薬を全部飲んでしまった' },
        { word: '間違える', reading: 'まちがえる', meaning: '間違える（nhầm lẫn）', example: '部屋を間違えてしまった' },
      ],
      examples: [
        {
          japanese: '全部食べてしまいました。',
          reading: 'ぜんぶたべてしまいました。',
          translation: 'Tôi đã ăn hết rồi. (hoàn thành)',
        },
        {
          japanese: '薬を飲み忘れてしまいました。すみません。',
          reading: 'くすりをのみわすれてしまいました。すみません。',
          translation: 'Tôi đã quên uống thuốc mất. Xin lỗi.',
        },
        {
          japanese: '廊下で転倒させてしまって、本当に申し訳ありません。',
          reading: 'ろうかでてんとうさせてしまって、ほんとうにもうしわけありません。',
          translation: 'Tôi thực sự xin lỗi vì để xảy ra té ngã ở hành lang.',
        },
        {
          japanese: 'もう食べちゃった？（口語）',
          reading: 'もうたべちゃった？',
          translation: 'Ăn hết rồi sao? (khẩu ngữ)',
        },
      ],
      grammarNote: `【形の作り方 — Cách cấu tạo】
動詞て形 → + しまう
・食べる → 食べて + しまう = 食べてしまう
・飲む → 飲んで + しまう = 飲んでしまう  ※「で」に変化
・転ぶ → 転んで + しまう = 転んでしまう

【口語形 — Khẩu ngữ】
〜てしまった → 〜ちゃった（例：食べちゃった）
〜でしまった → 〜じゃった（例：飲んじゃった）

【介護現場でよく使うシーン】
・ミスを報告するとき：「〜してしまいました。申し訳ありません」
・完了報告：「薬の準備ができてしまいました（完了）」`,
      quiz: {
        question: '「鍵を忘れてしまった」の意味として最も適切なものは？',
        options: [
          { id: 'a', text: '鍵を見つけた' },
          { id: 'b', text: '鍵を忘れたことへの後悔がある' },
          { id: 'c', text: '鍵を持っている' },
          { id: 'd', text: '鍵を作った' },
        ],
        correctId: 'b',
        explanation: '「〜てしまう」は後悔や意図しない結果を表します。鍵を忘れたことを残念・申し訳なく思っているニュアンスです。\n「〜てしまう」biểu đạt sự hối tiếc hoặc kết quả không mong muốn. Mang sắc thái tiếc nuối, xin lỗi vì đã quên chìa khóa.',
      },
      xpReward: 25,
    },
  },

  'n4-02-2': {
    courseTitle: { ja: 'N4 文法完全対策', vi: 'Ngữ pháp N4 toàn diện' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4文法: 〜ておく（事前準備）',
      titleTranslation: 'Ngữ pháp N4: 〜ておく (chuẩn bị trước)',
      introduction: `「〜ておく」は、将来のために事前に何かをしておく行為を表す文法です。介護・医療の現場では、シフト交代前の準備や記録の事前作成など、計画的な行動を表す際によく使います。
①事前準備：「明日のために薬を用意しておく」
②現状維持：「そのままにしておく」（壊さないように保つ）
③処置の準備：「点滴を準備しておいてください」

「〜ておく」 biểu đạt hành động thực hiện trước để chuẩn bị cho tương lai. Trong môi trường điều dưỡng và y tế, thường dùng để diễn đạt các hành động có kế hoạch như chuẩn bị trước khi bàn giao ca, ghi chép hồ sơ trước, v.v.
①Chuẩn bị trước: 「薬を用意しておく」 (chuẩn bị thuốc trước)
②Giữ nguyên trạng thái: 「そのままにしておく」 (để nguyên như vậy)
③Chuẩn bị xử lý: 「点滴を準備しておいてください」 (hãy chuẩn bị truyền dịch trước)`,
      keyPoints: [
        '【〜ておく】接続: 動詞て形 + おく / 意味: 将来のために事前に行動する / 介護例: 夜勤前に利用者の体位を整えておく',
        '【完了形】接続: 〜ておきました / 意味: 準備が完了したことを報告 / 介護例: 薬を用意しておきました',
        '【依頼形】接続: 〜ておいてください / 意味: 相手に事前準備を依頼 / 介護例: 記録を書いておいてください',
        '【口語縮約】接続: 〜ておく→〜とく（例：書いとく）/ 意味: 口語的な短縮形 / 介護例: 連絡しとくね',
        '【否定形】接続: 〜ておかない / 意味: 準備しないことへの警告 / 介護例: 記録しておかないと忘れますよ',
        '【類似区別】〜ておく（準備・意図）vs 〜てある（結果状態残存）: 行為者の意図があるかどうかで区別',
      ],
      vocabulary: [
        { word: '準備する', reading: 'じゅんびする', meaning: '準備する（chuẩn bị）', example: '次の処置の器具を準備しておく' },
        { word: '記録する', reading: 'きろくする', meaning: '記録する（ghi chép）', example: 'バイタルを記録しておく' },
        { word: '確認する', reading: 'かくにんする', meaning: '確認する（xác nhận）', example: 'アレルギーを確認しておく' },
        { word: '整える', reading: 'ととのえる', meaning: '整える（sắp xếp gọn gàng）', example: '病室を整えておく' },
        { word: '連絡する', reading: 'れんらくする', meaning: '連絡する（liên lạc）', example: '家族に連絡しておく' },
      ],
      examples: [
        {
          japanese: '夜勤に入る前に、利用者の薬を一人分ずつ用意しておきました。',
          reading: 'やきんにはいるまえに、りようしゃのくすりをひとりぶんずつようしていておきました。',
          translation: 'Trước khi vào ca đêm, tôi đã chuẩn bị sẵn thuốc từng phần cho từng người dùng dịch vụ.',
        },
        {
          japanese: '申し送りの前に、ケア記録を書いておいてください。',
          reading: 'もうしおくりのまえに、けあきろくをかいておいてください。',
          translation: 'Trước khi bàn giao ca, hãy viết ghi chép chăm sóc trước.',
        },
        {
          japanese: '緊急時のために、救急セットを病室の棚に置いておきます。',
          reading: 'きんきゅうじのために、きゅうきゅうせっとをびょうしつのたなにおいておきます。',
          translation: 'Để phòng trường hợp khẩn cấp, tôi sẽ để sẵn bộ cấp cứu trên kệ phòng bệnh.',
        },
        {
          japanese: '田中様の体位交換の時間を、スケジュール表に書いておきました。',
          reading: 'たなかさまのたいいこうかんのじかんを、すけじゅーるひょうにかいておきました。',
          translation: 'Tôi đã ghi sẵn thời gian đổi tư thế cho ông Tanaka vào bảng lịch.',
        },
      ],
      grammarNote: `【形の作り方 — Cách cấu tạo】
動詞て形 + おく
・準備する → 準備して + おく = 準備しておく
・書く → 書いて + おく = 書いておく
・確認する → 確認して + おく = 確認しておく

【3つの主な意味 — 3 nghĩa chính】
①事前準備（chuẩn bị trước）: 「手術前に器具を消毒しておく」
②現状維持（giữ nguyên trạng thái）: 「傷口はそのままにしておく」
③結果の確保（đảm bảo kết quả）: 「連絡先を控えておく」

【〜ておく vs 〜てある の区別 — Phân biệt】
・〜ておく：これから行う行為の事前準備（hành động sắp thực hiện, nhấn mạnh chủ thể）
  例：「薬を用意しておきます（私が用意する）」
・〜てある：誰かが準備した結果の状態（kết quả đã được thực hiện, nhấn mạnh trạng thái）
  例：「薬が用意してあります（もう準備された状態）」

【介護現場での活用 — Ứng dụng trong điều dưỡng】
・シフト交代前：「記録を更新しておきました」
・医療処置前：「消毒液を準備しておいてください」
・緊急対応：「万が一のために連絡先を確認しておく」`,
      quiz: {
        question: '次の文の（　）に入る最も適切な表現は？「明日の処置のために、必要な器具を＿＿。」',
        options: [
          { id: 'a', text: '準備しておきました' },
          { id: 'b', text: '準備してありました' },
          { id: 'c', text: '準備してしまいました' },
          { id: 'd', text: '準備していきました' },
        ],
        correctId: 'a',
        explanation: '事前に自分が行う行為には「〜ておく」を使います。「準備しておきました」は「明日のために準備した」という事前準備の完了を表します。\n「〜ておく」dùng để diễn đạt hành động chủ động thực hiện trước. "準備しておきました" nghĩa là đã chuẩn bị trước cho ngày mai.',
      },
      xpReward: 25,
    },
  },

  'n4-02-3': {
    courseTitle: { ja: 'N4 文法完全対策', vi: 'Ngữ pháp N4 toàn diện' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4文法: 〜てある（結果状態の残存）',
      titleTranslation: 'Ngữ pháp N4: 〜てある (trạng thái kết quả còn lưu lại)',
      introduction: `「〜てある」は、誰かが意図的に行った行為の結果が今も残っている状態を表す文法です。「〜ている」との違いに注意が必要です。介護・医療現場では、処置や準備の完了状態を報告するときによく使います。
①「窓が開けてある」→誰かが意図的に開けた、その状態が続いている
②「薬が準備してある」→誰かが準備した結果、今も準備済みの状態
③「記録が書いてある」→書かれた内容が今もそこに存在している

「〜てある」 biểu đạt trạng thái kết quả của một hành động có chủ ý vẫn còn tồn tại đến hiện tại. Trong môi trường điều dưỡng, thường dùng để báo cáo trạng thái hoàn thành của xử lý hoặc chuẩn bị.
①「窓が開けてある」→ ai đó đã mở cửa, trạng thái đó vẫn còn
②「薬が準備してある」→ ai đó đã chuẩn bị, thuốc vẫn ở trạng thái sẵn sàng`,
      keyPoints: [
        '【〜てある】接続: 他動詞て形 + ある / 意味: 意図的行為の結果状態が継続 / 介護例: 点滴が準備してある',
        '【主語】接続: が + 〜てある / 意味: 目的語が主語になる（結果の対象） / 介護例: 薬が用意してある',
        '【〜ている vs 〜てある】接続: 自動詞→〜ている、他動詞→〜てある / 意味: 状態か意図的準備かで区別 / 介護例: 窓が開いている（自）vs 窓が開けてある（他・意図）',
        '【報告表現】接続: 〜てあります（丁寧） / 意味: 準備完了の報告 / 介護例: 処置の器具が消毒してあります',
        '【確認表現】接続: 〜てありますか / 意味: 準備状況の確認 / 介護例: 記録は書いてありますか',
        '【他動詞限定】意味: 自動詞には使えない（×開いてある→○開けてある）/ 介護例: ドアが開けてある（○）',
      ],
      vocabulary: [
        { word: '用意する', reading: 'ようしする', meaning: '用意する（chuẩn bị sẵn）', example: 'ケア用品が用意してある' },
        { word: '消毒する', reading: 'しょうどくする', meaning: '消毒する（khử trùng）', example: '器具が消毒してある' },
        { word: '貼る', reading: 'はる', meaning: '貼る（dán）', example: '注意書きが貼ってある' },
        { word: '書く', reading: 'かく', meaning: '書く（viết）', example: '申し送りが書いてある' },
        { word: '設定する', reading: 'せっていする', meaning: '設定する（cài đặt）', example: 'アラームが設定してある' },
      ],
      examples: [
        {
          japanese: '処置室に必要な器具が全部消毒してあります。',
          reading: 'しょちしつにひつような器具がぜんぶしょうどくしてあります。',
          translation: 'Tất cả dụng cụ cần thiết trong phòng xử lý đã được khử trùng sẵn.',
        },
        {
          japanese: '田中様のベッドのそばに、緊急連絡先が書いてあります。',
          reading: 'たなかさまのべっどのそばに、きんきゅうれんらくさきがかいてあります。',
          translation: 'Bên cạnh giường của ông Tanaka, số liên lạc khẩn cấp đã được ghi sẵn.',
        },
        {
          japanese: '点滴がすでに準備してあるので、14時に交換してください。',
          reading: 'てんてきがすでにじゅんびしてあるので、じゅうよじにこうかんしてください。',
          translation: 'Vì truyền dịch đã được chuẩn bị sẵn rồi, hãy thay lúc 14 giờ.',
        },
        {
          japanese: '病室のドアに、アレルギー情報が貼ってありますか？',
          reading: 'びょうしつのどあに、あれるぎーじょうほうがはってありますか？',
          translation: 'Thông tin dị ứng có được dán ở cửa phòng bệnh không?',
        },
      ],
      grammarNote: `【形の作り方 — Cách cấu tạo】
他動詞て形 + ある（主語は目的語が昇格）
・用意する（他動）→ 薬が用意してある ✓
・開ける（他動）→ 窓が開けてある ✓
・開く（自動）→ ×窓が開いてある（自動詞には使えない）

【〜ている vs 〜てある の区別 — Phân biệt】
┌─────────────────────────────────────────┐
│〜ている：状態の継続（自・他どちらでも可）  │
│　窓が開いている（自然に/気づいたら開いてる）│
│〜てある：意図的行為の結果状態（他動詞のみ）│
│　窓が開けてある（誰かが意図的に開けた）   │
└─────────────────────────────────────────┘

【〜ておく vs 〜てある の区別 — Phân biệt với ておく】
・〜ておく：これから行う行為（hành động sắp thực hiện）
  「薬を用意しておきます」(これからする)
・〜てある：行った結果の状態（trạng thái sau khi đã làm）
  「薬が用意してあります」(もうできている)

【介護現場での活用 — Ứng dụng trong điều dưỡng】
・引き継ぎ確認：「申し送りは書いてありますか？」
・準備完了報告：「次の処置の器具が用意してあります」
・安全確認：「ベッド柵が上げてありますか？」`,
      quiz: {
        question: '「薬が用意＿＿」に入る正しい表現は？（誰かが意図的に準備した結果の状態）',
        options: [
          { id: 'a', text: 'しています' },
          { id: 'b', text: 'してある' },
          { id: 'c', text: 'しておく' },
          { id: 'd', text: 'してしまう' },
        ],
        correctId: 'b',
        explanation: '「〜てある」は他動詞の意図的行為の結果が現在も残っている状態を表します。「薬が用意してある」は誰かが準備した結果、今も準備済みの状態であることを示します。\n「〜てある」biểu đạt trạng thái kết quả của hành động có chủ ý vẫn tồn tại. "薬が用意してある" = thuốc đã được chuẩn bị và vẫn ở trạng thái sẵn sàng.',
      },
      xpReward: 25,
    },
  },

  'n4-02-4': {
    courseTitle: { ja: 'N4 文法完全対策', vi: 'Ngữ pháp N4 toàn diện' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4文法: 〜てみる（試みる行為）',
      titleTranslation: 'Ngữ pháp N4: 〜てみる (thử làm)',
      introduction: `「〜てみる」は「試しに〜する」という意味を持つ文法です。何かを試してみる、初めてやってみる、という行為を表します。介護・医療の現場では、新しいケア方法を試す、患者さんに何かを試してもらう、といった場面で頻繁に使われます。
①「新しい体位を試してみる」→今まで使っていなかった方法を試す
②「聞いてみる」→結果がわからないが、とにかく聞いてみる
③「食べてみてください」→利用者さんに試食してもらう依頼

「〜てみる」 có nghĩa là "thử làm gì đó". Biểu đạt hành động thử nghiệm, làm lần đầu. Trong điều dưỡng và y tế, thường dùng khi thử phương pháp chăm sóc mới, đề nghị người dùng thử điều gì đó.
①「新しい体位を試してみる」→ thử phương pháp chưa dùng trước đây
②「聞いてみる」→ thử hỏi dù chưa biết kết quả`,
      keyPoints: [
        '【〜てみる】接続: 動詞て形 + みる / 意味: 試しに〜する、初めて試みる / 介護例: 新しい軟膏を塗ってみる',
        '【依頼形】接続: 〜てみてください / 意味: 相手に試すよう依頼 / 介護例: 少しだけ歩いてみてください',
        '【意志形】接続: 〜てみます / 意味: 自分が試みる意志 / 介護例: 先輩に相談してみます',
        '【結果表現】接続: 〜てみたら〜だった / 意味: 試した結果を報告 / 介護例: 電話してみたら繋がりました',
        '【過去形】接続: 〜てみました / 意味: 試した行為の完了報告 / 介護例: 別の食事形態を試してみました',
        '【否定】接続: 〜てみなかった / 意味: 試さなかったことへの後悔・反省 / 介護例: もっと早く聞いてみればよかった',
      ],
      vocabulary: [
        { word: '試す', reading: 'ためす', meaning: '試す（thử）', example: '新しい体位変換を試してみる' },
        { word: '相談する', reading: 'そうだんする', meaning: '相談する（tham khảo, hỏi ý kiến）', example: '上司に相談してみる' },
        { word: '確かめる', reading: 'たしかめる', meaning: '確かめる（xác nhận）', example: '体温を確かめてみる' },
        { word: '声をかける', reading: 'こえをかける', meaning: '声をかける（lên tiếng, hỏi thăm）', example: '起きているか声をかけてみる' },
        { word: '調べる', reading: 'しらべる', meaning: '調べる（tra cứu）', example: '副作用を調べてみる' },
      ],
      examples: [
        {
          japanese: '食欲がないので、別の食事形態を試してみましょう。',
          reading: 'しょくよくがないので、べつのしょくじけいたいをためしてみましょう。',
          translation: 'Vì không có cảm giác thèm ăn, hãy thử dạng thức ăn khác xem sao.',
        },
        {
          japanese: '田中様、少しだけ立ってみてください。私が支えます。',
          reading: 'たなかさま、すこしだけたってみてください。わたしがささえます。',
          translation: 'Thưa ông Tanaka, hãy thử đứng dậy một chút xem. Tôi sẽ đỡ ông.',
        },
        {
          japanese: '新しいリハビリ方法を試してみたら、患者さんの表情が明るくなりました。',
          reading: 'あたらしいりはびりほうほうをためしてみたら、かんじゃさんのひょうじょうがあかるくなりました。',
          translation: 'Khi thử phương pháp phục hồi chức năng mới, nét mặt của bệnh nhân trở nên tươi sáng hơn.',
        },
        {
          japanese: '痛みの場所が分からなければ、先生に診てもらってみてはどうですか。',
          reading: 'いたみのばしょがわからなければ、せんせいにみてもらってみてはどうですか。',
          translation: 'Nếu không biết vị trí đau, sao không thử nhờ bác sĩ khám xem?',
        },
      ],
      grammarNote: `【形の作り方 — Cách cấu tạo】
動詞て形 + みる
・歩く → 歩いて + みる = 歩いてみる
・相談する → 相談して + みる = 相談してみる
・食べる → 食べて + みる = 食べてみる

【〜てみる の意味ニュアンス — Sắc thái nghĩa】
①試みる（thử nghiệm）: 結果がどうなるか分からないが試す
  「薬を変えてみましょう」（効果を見るために試す）
②初体験（lần đầu trải nghiệm）: 初めてやってみること
  「ゼリー食を食べてみてください」
③提案・依頼（đề nghị nhẹ nhàng）: 「〜てみてください」は柔らかい依頼
  「少し歩いてみてください」（vs 命令的な「歩いてください」）

【〜てみる vs 〜ようとする の区別 — Phân biệt】
・〜てみる：実際に試す行為（hành động thực sự thử）
  「立ってみた」（実際に立った）
・〜ようとする：試みるが必ずしも実行しない（cố gắng nhưng chưa chắc thực hiện）
  「立とうとしたが無理だった」（試みたが失敗）

【介護現場での活用 — Ứng dụng trong điều dưỡng】
・新ケア提案：「この方法を試してみてもよいですか？」
・患者への声かけ：「少しだけ動いてみましょう」
・問題解決：「まず担当看護師に相談してみます」`,
      quiz: {
        question: '「この新しい体位クッションを＿＿ください」— 利用者に試してもらう依頼として正しいのは？',
        options: [
          { id: 'a', text: '使ってみて' },
          { id: 'b', text: '使っておいて' },
          { id: 'c', text: '使ってしまって' },
          { id: 'd', text: '使っていて' },
        ],
        correctId: 'a',
        explanation: '「〜てみてください」は相手に試してみるよう柔らかく依頼する表現です。「使ってみてください」= 「試しに使ってください」という意味です。\n「〜てみてください」 là cách đề nghị nhẹ nhàng để người khác thử. "使ってみてください" = "hãy thử dùng xem".',
      },
      xpReward: 25,
    },
  },

  'n4-02-5': {
    courseTitle: { ja: 'N4 文法完全対策', vi: 'Ngữ pháp N4 toàn diện' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4文法: 〜ていく / 〜てくる（方向性の変化）',
      titleTranslation: 'Ngữ pháp N4: 〜ていく / 〜てくる (biến đổi có hướng)',
      introduction: `「〜ていく」と「〜てくる」は、変化や動作の方向性・時間軸を表す重要な文法です。介護・医療の現場では、症状の変化や回復の経過を表現するときに欠かせません。
・「〜ていく」：現在から遠ざかる方向への変化（悪化、進行）
  「症状が悪化していく」「記憶が失われていく」
・「〜てくる」：過去から現在に近づいてくる変化（回復、改善）
  「体調が回復してきた」「食欲が出てきた」

「〜ていく」 biểu đạt sự thay đổi hướng ra xa từ hiện tại (xấu đi, tiến triển).
「〜てくる」 biểu đạt sự thay đổi hướng đến từ quá khứ đến hiện tại (hồi phục, cải thiện).
Trong điều dưỡng và y tế, hai mẫu này rất quan trọng khi diễn đạt tiến triển của bệnh nhân.`,
      keyPoints: [
        '【〜ていく①】接続: 動詞て形 + いく / 意味: 現在→未来への変化・進行（悪化方向） / 介護例: 症状が悪化していく',
        '【〜ていく②】接続: 動詞て形 + いく / 意味: 話者から離れる移動 / 介護例: 患者が廊下を歩いていく',
        '【〜てくる①】接続: 動詞て形 + くる / 意味: 過去→現在への変化・回復（改善方向） / 介護例: 体力が戻ってきた',
        '【〜てくる②】接続: 動詞て形 + くる / 意味: 話者へ近づく移動 / 介護例: ナースが走ってくる',
        '【時間軸の比較】〜ていく（過去→現在→未来）vs 〜てくる（過去→現在）: 変化がどちらの方向か / 介護例: 痛みが増えていく vs 痛みが和らいできた',
        '【症状表現】意味: 医療報告で特に重要 / 介護例: 浮腫が広がってきている、食欲が落ちていっている',
      ],
      vocabulary: [
        { word: '悪化する', reading: 'あっかする', meaning: '悪化する（xấu đi）', example: '症状が悪化していく' },
        { word: '回復する', reading: 'かいふくする', meaning: '回復する（hồi phục）', example: '体力が回復してくる' },
        { word: '広がる', reading: 'ひろがる', meaning: '広がる（lan rộng）', example: '浮腫が広がってきた' },
        { word: '和らぐ', reading: 'やわらぐ', meaning: '和らぐ（dịu đi）', example: '痛みが和らいできた' },
        { word: '落ちる', reading: 'おちる', meaning: '落ちる（giảm sút）', example: '体重が落ちていく' },
      ],
      examples: [
        {
          japanese: '先週から田中様の食欲が少しずつ戻ってきています。',
          reading: 'せんしゅうからたなかさまのしょくよくがすこしずつもどってきています。',
          translation: 'Từ tuần trước, cảm giác thèm ăn của ông Tanaka đang dần dần trở lại.',
        },
        {
          japanese: '夜になると、患者さんの痛みが強くなっていく傾向があります。',
          reading: 'よるになると、かんじゃさんのいたみがつよくなっていくけいこうがあります。',
          translation: 'Khi đến tối, có xu hướng cơn đau của bệnh nhân tăng dần.',
        },
        {
          japanese: '退院後もリハビリを続けていけば、回復が期待できます。',
          reading: 'たいいんごもりはびりをつづけていけば、かいふくがきたいできます。',
          translation: 'Nếu tiếp tục phục hồi chức năng sau khi xuất viện, có thể kỳ vọng hồi phục.',
        },
        {
          japanese: '昨日から浮腫が足首から膝の方に広がってきているので、先生に報告します。',
          reading: 'きのうからふしゅがあしくびからひざのほうにひろがってきているので、せんせいにほうこくします。',
          translation: 'Vì từ hôm qua phù đang lan từ mắt cá lên phía đầu gối, tôi sẽ báo cáo bác sĩ.',
        },
      ],
      grammarNote: `【形の作り方 — Cách cấu tạo】
動詞て形 + いく / くる
・悪化する → 悪化して + いく = 悪化していく
・回復する → 回復して + くる = 回復してくる
・増える → 増えて + いく = 増えていく

【〜ていく の2つの用法 — 2 cách dùng của ていく】
①変化の方向（hướng thay đổi）: 現在から未来へ、状況が変わっていく
  「認知症が進んでいく」「体重が増えていく」
②移動の方向（hướng di chuyển）: 話者から遠ざかる
  「患者がリハビリ室に歩いていった」

【〜てくる の2つの用法 — 2 cách dùng của てくる】
①変化の方向（hướng thay đổi）: 過去から現在へ、改善・接近
  「食欲が出てきた」「体力がついてきた」
②移動の方向（hướng di chủ thể）: 話者に近づいてくる
  「看護師が走ってきた」

【医療報告での活用 — Ứng dụng trong báo cáo y tế】
悪化の報告：「〜が〜していく（現在進行形）」
・「浮腫が広がっていっています」
・「意識レベルが低下していっています」
改善の報告：「〜が〜してきました」
・「SpO2が安定してきました」
・「痛みの訴えが減ってきました」`,
      quiz: {
        question: '「先週から患者さんの傷の状態が良く＿＿います」— 改善していることを表す正しい形は？',
        options: [
          { id: 'a', text: 'なっていって' },
          { id: 'b', text: 'なってきて' },
          { id: 'c', text: 'なっておいて' },
          { id: 'd', text: 'なってしまって' },
        ],
        correctId: 'b',
        explanation: '過去から現在に向けて改善・回復している変化には「〜てくる」を使います。「良くなってきています」は「過去から今にかけて状態が良くなっている」という意味です。\n「〜てくる」 dùng để diễn đạt sự thay đổi cải thiện từ quá khứ đến hiện tại. "良くなってきています" = tình trạng đang tốt lên.',
      },
      xpReward: 25,
    },
  },

  'n4-02-6': {
    courseTitle: { ja: 'N4 文法完全対策', vi: 'Ngữ pháp N4 toàn diện' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4文法: 〜たら条件（完了後の行動）',
      titleTranslation: 'Ngữ pháp N4: Điều kiện 〜たら (hành động sau khi hoàn thành)',
      introduction: `「〜たら」は日本語の条件形の一つで、ある行為や状態が完了・実現した後に次の行為をすることを表します。介護・医療現場では、特定の処置や状態確認の後に次のステップを指示するときに頻繁に使います。
①時間的順序：「食事が終わったら薬を飲む」（まず食事→その後薬）
②条件：「熱が下がったら外出できる」（熱が下がることが条件）
③仮定：「もし何かあったらすぐに知らせてください」

「〜たら」 là một trong các thể điều kiện trong tiếng Nhật, biểu đạt hành động tiếp theo sau khi một hành động hay trạng thái hoàn thành/thực hiện. Trong điều dưỡng, thường dùng khi chỉ dẫn bước tiếp theo sau khi xử lý hay kiểm tra.`,
      keyPoints: [
        '【〜たら①】接続: 動詞た形 + ら / 意味: 〜した後に〜する（時間的順序） / 介護例: 食事が終わったら薬を飲んでください',
        '【〜たら②】接続: い形容詞かった + ら / 意味: 〜だったら（状態の条件） / 介護例: 痛かったら知らせてください',
        '【〜たら③】接続: な形容詞/名詞だった + ら / 意味: 〜ならば（名詞・な形容詞の条件） / 介護例: 異常だったら報告する',
        '【仮定用法】接続: もし〜たら / 意味: 実現するかどうか不明な条件 / 介護例: もし転倒したらすぐ呼んでください',
        '【発見用法】接続: 〜たら〜（た） / 意味: 〜したら意外な結果を発見 / 介護例: 部屋に入ったら倒れていた',
        '【〜たら vs 〜と】接続比較 / 意味: 〜たら（単発の完了後）vs 〜と（習慣的な前件後件） / 介護例: 食後に薬を飲む→食べると飲む',
      ],
      vocabulary: [
        { word: '終わる', reading: 'おわる', meaning: '終わる（kết thúc）', example: '処置が終わったら休む' },
        { word: '確認する', reading: 'かくにんする', meaning: '確認する（xác nhận）', example: '確認できたら教えてください' },
        { word: '落ち着く', reading: 'おちつく', meaning: '落ち着く（ổn định）', example: '落ち着いたら話しましょう' },
        { word: '退院する', reading: 'たいいんする', meaning: '退院する（xuất viện）', example: '退院したら外来に来てください' },
        { word: '気づく', reading: 'きづく', meaning: '気づく（nhận ra, phát hiện）', example: '異常に気づいたら報告する' },
      ],
      examples: [
        {
          japanese: '食事が終わったら、必ず降圧剤を飲んでください。',
          reading: 'しょくじがおわったら、かならずこうあつざいをのんでください。',
          translation: 'Sau khi ăn xong, nhất định hãy uống thuốc hạ áp.',
        },
        {
          japanese: '点滴が終わったら教えてください。すぐに抜きに来ます。',
          reading: 'てんてきがおわったらおしえてください。すぐにぬきにきます。',
          translation: 'Khi truyền dịch xong, hãy báo cho tôi biết. Tôi sẽ đến rút ngay.',
        },
        {
          japanese: 'もし夜中に痛みがひどくなったら、ナースコールを押してください。',
          reading: 'もしよなかにいたみがひどくなったら、なーすこーるをおしてください。',
          translation: 'Nếu đêm khuya mà cơn đau trở nên dữ dội, hãy nhấn chuông gọi y tá.',
        },
        {
          japanese: '病室に入ったら、田中様が床に倒れていたので、すぐに応援を呼びました。',
          reading: 'びょうしつにはいったら、たなかさまがゆかにたおれていたので、すぐにおうえんをよびました。',
          translation: 'Khi vào phòng bệnh thì phát hiện ông Tanaka đang ngã trên sàn, nên tôi đã gọi hỗ trợ ngay.',
        },
      ],
      grammarNote: `【形の作り方 — Cách cấu tạo】
動詞た形 + ら
・終わる → 終わった + ら = 終わったら
・確認する → 確認した + ら = 確認したら
・来る → 来た + ら = 来たら

形容詞・名詞：
・痛い（い形）→ 痛かった + ら = 痛かったら
・異常（な形）→ 異常だった + ら = 異常だったら

【〜たら の主な用法 — Các cách dùng chính】
①時間的順序（thứ tự thời gian）: 前の行為が完了→次の行為
  「処置が終わったら記録を書く」
②条件（điều kiện）: 〜という条件が満たされたら
  「状態が安定したら面会できます」
③仮定（giả định）: まだ実現していない仮の話
  「もし急変したら即座に報告してください」
④発見（phát hiện bất ngờ）: 〜したら予想外のことがあった
  「部屋に入ったら異臭がした」

【〜たら vs 〜ば vs 〜なら の違い — Phân biệt 3 dạng điều kiện】
・〜たら：完了後の次の行動、一回的な出来事に使いやすい
  「食事が終わったら薬を飲む」
・〜ば：一般的な条件・アドバイス（→ 次のレッスンで詳しく）
  「毎日飲めば回復する」
・〜なら：話題提示の条件（→ n4-02-8で詳しく）
  「薬のことなら薬剤師へ」`,
      quiz: {
        question: '「体温測定が＿＿、すぐに記録してください」— 正しい〜たら形は？',
        options: [
          { id: 'a', text: '終わったら' },
          { id: 'b', text: '終われば' },
          { id: 'c', text: '終わるなら' },
          { id: 'd', text: '終わるとき' },
        ],
        correctId: 'a',
        explanation: '「〜たら」は行為が完了した後に次の行為をするという時間的順序を表します。「体温測定が終わったら」= 測定が完了した後に記録するという意味で、〜たらが最も自然です。\n「〜たら」biểu đạt thứ tự thời gian: hoàn thành hành động trước rồi làm tiếp theo. "体温測定が終わったら" = sau khi đo xong nhiệt độ.',
      },
      xpReward: 25,
    },
  },

  'n4-02-7': {
    courseTitle: { ja: 'N4 文法完全対策', vi: 'Ngữ pháp N4 toàn diện' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4文法: 〜ば条件（仮定・アドバイス）',
      titleTranslation: 'Ngữ pháp N4: Điều kiện 〜ば (giả định & lời khuyên)',
      introduction: `「〜ば」は仮定条件を表す文法で、「もし〜であれば、〜になる」という論理的・一般的な関係を表します。「〜たら」と比べて、より普遍的・論理的な条件に使われる傾向があります。介護・医療の現場では、患者さんへのアドバイスや一般的な医療知識の説明に使います。
①「毎日薬を飲めば回復する」（一般的な医療原則）
②「体を動かせば筋力が維持できる」（リハビリのアドバイス）
③「もっと早く来れば間に合った」（反事実の後悔表現）

「〜ば」 là mẫu điều kiện giả định, biểu đạt quan hệ lý thuyết/phổ quát: "nếu... thì...". So với「〜たら」, thường dùng cho điều kiện mang tính phổ quát và lý luận hơn. Trong điều dưỡng, dùng khi đưa ra lời khuyên cho bệnh nhân hoặc giải thích kiến thức y tế chung.`,
      keyPoints: [
        '【〜ば①動詞】接続: 動詞ば形（語尾をえ段に+ば）/ 意味: 〜すれば〜になる（論理的条件） / 介護例: 毎日飲めば効果がある',
        '【〜ば②い形容詞】接続: 〜ければ / 意味: 〜ければ〜（形容詞の条件） / 介護例: 痛ければ言ってください',
        '【〜ば③な形容詞/名詞】接続: 〜であれば / 意味: 〜であれば〜（名詞・な形の条件） / 介護例: 異常であれば報告する',
        '【アドバイス】接続: 〜ばいい / 意味: 〜すればよい（推奨・提案） / 介護例: 痛ければ先生に言えばいいです',
        '【反事実】接続: 〜ば〜のに / 意味: 実際はそうでなかった後悔 / 介護例: もっと早く来ればよかったのに',
        '【〜ば vs 〜たら】意味の違い: 〜ば（論理的・一般的条件）vs 〜たら（時間的順序・具体的出来事） / 介護例: 飲めば回復する(一般)vs 飲んだら楽になった(具体)',
      ],
      vocabulary: [
        { word: '維持する', reading: 'いじする', meaning: '維持する（duy trì）', example: 'リハビリを続ければ機能が維持できる' },
        { word: '回復する', reading: 'かいふくする', meaning: '回復する（hồi phục）', example: '安静にすれば回復する' },
        { word: '悪化する', reading: 'あっかする', meaning: '悪化する（xấu đi）', example: '無理をすれば悪化する' },
        { word: '防ぐ', reading: 'ふせぐ', meaning: '防ぐ（ngăn ngừa）', example: '手を洗えば感染を防げる' },
        { word: '改善する', reading: 'かいぜんする', meaning: '改善する（cải thiện）', example: '食生活を変えれば改善する' },
      ],
      examples: [
        {
          japanese: '毎日リハビリを続ければ、歩けるようになりますよ。',
          reading: 'まいにちりはびりをつづければ、あるけるようになりますよ。',
          translation: 'Nếu tiếp tục tập phục hồi chức năng mỗi ngày, bạn sẽ có thể đi lại được đấy.',
        },
        {
          japanese: '痛ければ、すぐにナースコールを押してください。',
          reading: 'いたければ、すぐにナースコールをおしてください。',
          translation: 'Nếu đau, hãy nhấn chuông gọi y tá ngay.',
        },
        {
          japanese: '手をきちんと洗えば、感染症を予防できます。',
          reading: 'てをきちんとあらえば、かんせんしょうをよぼうできます。',
          translation: 'Nếu rửa tay đúng cách, có thể phòng ngừa bệnh truyền nhiễm.',
        },
        {
          japanese: 'もっと早く異変に気づけば、このような状況にならなかったのに。',
          reading: 'もっとはやくいへんにきづけば、このようなじょうきょうにならなかったのに。',
          translation: 'Giá mà phát hiện dấu hiệu bất thường sớm hơn thì đã không đến nông nỗi này.',
        },
      ],
      grammarNote: `【形の作り方 — Cách cấu tạo】
動詞：語尾をえ段に変えて + ば
・飲む（のむ）→ 飲め + ば = 飲めば
・続ける（つづける）→ 続けれ + ば = 続ければ
・来る（くる）→ 来れ + ば = 来れば
・する → すれ + ば = すれば

い形容詞：〜い → 〜ければ
・痛い → 痛ければ
・よい → よければ

な形容詞・名詞：〜（だ）→ 〜であれば
・元気（な）→ 元気であれば
・異常 → 異常であれば

【〜ばよかった（後悔） — Hối tiếc】
〜ば + よかった = もっと〜すればよかった
「もっと早く報告すればよかった」
（過去の行為に対する後悔。実際はそうしなかった）

【〜ばいい（アドバイス・提案） — Lời khuyên】
〜ば + いい = 〜すればいいです
「痛ければ薬を飲めばいいです」
（柔らかいアドバイス・提案）

【〜ば vs 〜たら の違い — Phân biệt】
・〜ば：論理的・一般的な条件（điều kiện lý thuyết phổ quát）
  「毎日飲めば（一般論として）回復する」
・〜たら：時間的な順序・具体的出来事（thứ tự hoặc sự kiện cụ thể）
  「飲んだら（その後）楽になった」`,
      quiz: {
        question: '患者に対して「毎日運動す＿＿、体力が回復しますよ」— 正しい形は？',
        options: [
          { id: 'a', text: 'るなら' },
          { id: 'b', text: 'れば' },
          { id: 'c', text: 'ったら' },
          { id: 'd', text: 'るとき' },
        ],
        correctId: 'b',
        explanation: '一般的なアドバイスや論理的な条件には「〜ば」を使います。「毎日運動すれば回復する」は「運動する→回復する」という一般的な因果関係を示します。\n「〜ば」 dùng cho lời khuyên phổ quát và điều kiện mang tính lý luận. "毎日運動すれば回復する" = quan hệ nhân quả chung: tập thể dục → hồi phục.',
      },
      xpReward: 25,
    },
  },

  'n4-02-8': {
    courseTitle: { ja: 'N4 文法完全対策', vi: 'Ngữ pháp N4 toàn diện' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4文法: 〜なら条件（話題提示・文脈条件）',
      titleTranslation: 'Ngữ pháp N4: Điều kiện 〜なら (đưa ra chủ đề, điều kiện ngữ cảnh)',
      introduction: `「〜なら」は話し相手が言ったことや共有している情報を受けて、それを前提にした条件・判断・アドバイスを述べる文法です。「〜たら」「〜ば」とは異なり、相手の発言や状況を受けて使うのが特徴です。
①「薬のことなら薬剤師に聞いてください」（薬の話題→専門家へ）
②「痛いなら、横になってもいいですよ」（相手が痛いと言った→提案）
③「骨折なら、手術が必要かもしれません」（診断を受けて→判断）

「〜なら」 tiếp nhận thông tin từ người nói chuyện hoặc thông tin chia sẻ, rồi đưa ra điều kiện/nhận định/lời khuyên dựa trên đó. Đặc điểm khác biệt với「〜たら」và「〜ば」là dùng để tiếp nhận phát ngôn hoặc tình huống của người kia.`,
      keyPoints: [
        '【〜なら①】接続: 名詞/動詞辞書形/た形 + なら / 意味: 相手の話題を受けた条件 / 介護例: 痛みのことなら、まず先生に診てもらって',
        '【〜なら②】接続: い形容詞普通形 + なら / 意味: 相手の状態を受けた提案 / 介護例: 痛いなら、鎮痛剤を飲んでいいですよ',
        '【〜なら③（話題提示）】接続: 名詞 + なら / 意味: 「〜については」という話題の限定 / 介護例: 薬の副作用なら薬剤師に聞いてください',
        '【〜なら④（判断・提案）】接続: 〜なら〜てください/〜ほうがいい / 意味: 状況を踏まえた最善策の提案 / 介護例: 転倒のリスクがあるなら歩行器を使ったほうがいい',
        '【〜なら⑤（前件は未実現）】意味: なら節の内容はすでに話された/共有された情報が前提 / 介護例: 退院を希望なら、担当医と相談してください',
        '【3条件の比較】〜たら（完了後）vs 〜ば（論理的）vs 〜なら（話題・文脈受け）/ 介護例: それぞれの使い分けが重要',
      ],
      vocabulary: [
        { word: '副作用', reading: 'ふくさよう', meaning: '副作用（tác dụng phụ）', example: '副作用のことなら薬剤師へ' },
        { word: '希望する', reading: 'きぼうする', meaning: '希望する（hy vọng, mong muốn）', example: '退院を希望なら申請が必要' },
        { word: '不安', reading: 'ふあん', meaning: '不安（lo lắng）', example: '不安なら家族に連絡しますか' },
        { word: '専門家', reading: 'せんもんか', meaning: '専門家（chuyên gia）', example: 'リハビリのことなら専門家へ' },
        { word: '相談', reading: 'そうだん', meaning: '相談（tư vấn）', example: '費用の相談なら窓口へ' },
      ],
      examples: [
        {
          japanese: '薬の飲み合わせのことなら、薬剤師に相談してください。',
          reading: 'くすりののみあわせのことなら、やくざいしにそうだんしてください。',
          translation: 'Về vấn đề tương tác thuốc, hãy tham khảo ý kiến của dược sĩ.',
        },
        {
          japanese: '「背中が痛い」— 「痛いなら、横になってください。すぐ先生を呼びます。」',
          reading: '「せなかがいたい」—「いたいなら、よこになってください。すぐせんせいをよびます。」',
          translation: '"Lưng tôi đau" — "Nếu đau, hãy nằm xuống. Tôi sẽ gọi bác sĩ ngay."',
        },
        {
          japanese: '退院を希望なら、まず担当医師とソーシャルワーカーに相談が必要です。',
          reading: 'たいいんをきぼうなら、まずたんとういしとそーしゃるわーかーにそうだんがひつようです。',
          translation: 'Nếu muốn xuất viện, trước tiên cần tham khảo với bác sĩ phụ trách và nhân viên xã hội.',
        },
        {
          japanese: '介護保険の手続きのことなら、市区町村の窓口に行けば教えてもらえます。',
          reading: 'かいごほけんのてつづきのことなら、しくちょうそんのまどぐちにいけばおしえてもらえます。',
          translation: 'Về thủ tục bảo hiểm chăm sóc điều dưỡng, nếu đến quầy của thành phố/quận/huyện sẽ được hướng dẫn.',
        },
      ],
      grammarNote: `【形の作り方 — Cách cấu tạo】
名詞・形容詞普通形 + なら
・薬の副作用 + なら = 薬の副作用なら
・痛い + なら = 痛いなら
・不安（な形）+ なら = 不安なら
動詞普通形 + なら
・希望する + なら = 希望するなら
・退院したい + なら = 退院したいなら

【〜なら の特徴 — Đặc điểm của なら】
〜なら の前件（なら節）は、話し相手がすでに言ったこと、
または話し手が相手の状況から判断したことが前提。
前件はすでに「分かっている情報」であることが多い。

Trước「〜なら」thường là thông tin mà người nói đã biết/chia sẻ,
hoặc tình huống mà người nói suy đoán từ hoàn cảnh.

【3つの条件形の比較 — So sánh 3 dạng điều kiện】
┌──────────────────────────────────────────────────┐
│〜たら：出来事の完了後に次の行為（時間的順序）      │
│　「食事が終わったら薬を飲む」                       │
│〜ば：論理的・一般的な条件・アドバイス              │
│　「毎日飲めば回復する」                             │
│〜なら：相手の話・文脈を受けた条件・判断・提案      │
│　「痛いなら、薬を飲んでください」                   │
└──────────────────────────────────────────────────┘

【介護現場での活用 — Ứng dụng trong điều dưỡng】
・専門家への誘導：「〜のことなら〜へどうぞ」
・状態を受けた提案：「〜なら、〜してください」
・患者の希望を受けた対応：「〜希望なら、〜が必要です」`,
      quiz: {
        question: '「リハビリの方法＿＿、理学療法士に聞いてください」— 最も適切な条件形は？',
        options: [
          { id: 'a', text: 'のことなら' },
          { id: 'b', text: 'が終わったら' },
          { id: 'c', text: 'をすれば' },
          { id: 'd', text: 'のとき' },
        ],
        correctId: 'a',
        explanation: '話題を限定して専門家に誘導する表現には「〜のことなら」が最も自然です。「リハビリの方法のことなら理学療法士へ」は「リハビリについては専門家に」という話題提示の〜なら用法です。\n「〜のことなら」 là cách diễn đạt tự nhiên nhất để giới hạn chủ đề và dẫn đến chuyên gia. "リハビリのことなら" = về chủ đề phục hồi chức năng thì đến chuyên gia.',
      },
      xpReward: 25,
    },
  },

  'n4-02-9': {
    courseTitle: { ja: 'N4 文法完全対策', vi: 'Ngữ pháp N4 toàn diện' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4文法: 〜のに（逆接・不満・後悔）',
      titleTranslation: 'Ngữ pháp N4: 〜のに (kết quả trái chiều, phàn nàn, hối tiếc)',
      introduction: `「〜のに」は期待した結果と実際の結果が異なるときに使う逆接の表現です。話し手の不満・後悔・驚き・非難などの感情が込められます。介護・医療現場でも、予期しない状況や改善されない状態への感情を表現するときに使います。
①後悔：「もっと早く言ってくれればよかったのに」（言ってほしかった）
②不満：「薬を飲んでいるのに、全然良くならない」（効果がない）
③非難・意外：「先生に言ったのに、何も変わらなかった」（期待外れ）

「〜のに」 biểu đạt sự trái chiều khi kết quả mong đợi và thực tế không khớp nhau. Mang cảm xúc của người nói như bất mãn, hối tiếc, ngạc nhiên, chỉ trích. Trong điều dưỡng và y tế, dùng khi diễn đạt cảm xúc về tình huống không ngờ hoặc trạng thái không cải thiện.`,
      keyPoints: [
        '【〜のに①（逆接）】接続: 動詞/形容詞普通形 + のに / 意味: 〜であるのに、期待と反する結果 / 介護例: 薬を飲んでいるのに熱が下がらない',
        '【〜のに②（後悔）】接続: 〜ばよかったのに/〜てくれればよかったのに / 意味: 期待した行為がされなかった後悔・残念 / 介護例: もっと早く知らせてくれればよかったのに',
        '【〜のに③（不満）】接続: 〜しているのに〜しない / 意味: 努力しているのに結果が出ないという不満 / 介護例: 毎日リハビリしているのに歩けない',
        '【感情の方向】意味: 話し手の不満・後悔・驚きが含まれる（→ 文末は言い切りでも可） / 介護例: こんなに頑張っているのに…（文末省略）',
        '【〜のに vs 〜けど/〜が】意味: 〜のに（感情的逆接）vs 〜けど/〜が（中立的逆接） / 介護例: 飲んでいるのに効かない（感情あり）vs 飲んでいるが効果は限定的（中立）',
        '【目的用法との区別】意味: 〜のに（目的）=「〜するために」（←別の用法）→文脈で判断 / 介護例: 歩くのに杖が必要（目的）vs 歩けるのに車椅子を使う（逆接）',
      ],
      vocabulary: [
        { word: '改善する', reading: 'かいぜんする', meaning: '改善する（cải thiện）', example: '治療しているのに改善しない' },
        { word: '効く', reading: 'きく', meaning: '効く（có tác dụng）', example: '薬を飲んでいるのに効かない' },
        { word: '伝える', reading: 'つたえる', meaning: '伝える（truyền đạt）', example: 'もっと早く伝えてくれればよかったのに' },
        { word: '注意する', reading: 'ちゅういする', meaning: '注意する（chú ý, cảnh báo）', example: '何度も注意したのに守らない' },
        { word: '回復する', reading: 'かいふくする', meaning: '回復する（hồi phục）', example: '手術したのに回復が遅い' },
      ],
      examples: [
        {
          japanese: '毎日薬を飲んでいるのに、なかなか血圧が下がらないんです。',
          reading: 'まいにちくすりをのんでいるのに、なかなかけつあつがさがらないんです。',
          translation: 'Dù uống thuốc mỗi ngày nhưng huyết áp cứ không chịu hạ xuống.',
        },
        {
          japanese: 'もっと早く痛みのことを教えてくれればよかったのに。',
          reading: 'もっとはやくいたみのことをおしえてくれればよかったのに。',
          translation: 'Giá mà bạn nói cho tôi biết về cơn đau sớm hơn thì tốt rồi.',
        },
        {
          japanese: '何度も転倒の危険を注意したのに、また一人でトイレに行こうとした。',
          reading: 'なんどもてんとうのきけんをちゅういしたのに、またひとりでといれにいこうとした。',
          translation: 'Dù đã cảnh báo nhiều lần về nguy cơ té ngã, nhưng lại định một mình đi vào toilet.',
        },
        {
          japanese: '三週間リハビリを続けているのに、まだ自力で立てないのはつらいですね。',
          reading: 'さんしゅうかんりはびりをつづけているのに、まだじりきでたてないのはつらいですね。',
          translation: 'Dù đã tập phục hồi chức năng ba tuần rồi mà vẫn chưa tự đứng được, thật khổ nhỉ.',
        },
      ],
      grammarNote: `【形の作り方 — Cách cấu tạo】
動詞普通形 + のに
・飲む（現在）→ 飲んでいるのに
・頑張る → 頑張っているのに
・した（過去）→ したのに

い形容詞普通形 + のに
・痛い → 痛いのに（動いている）

な形容詞 + なのに
・元気 → 元気なのに（食欲がない）

名詞 + なのに
・病院 + なのに → 病院なのに（薬がない）

【のにの2つの用法：逆接 vs 目的 — 2 cách dùng】
①逆接（kết quả trái chiều）: 感情的な逆接（bất mãn, hối tiếc）
　　「薬を飲んでいるのに効かない」
②目的（mục đích）: 〜するために必要なもの
　　「歩くのに時間がかかる」「手術するのに2時間かかった」
→ 文脈と前後の内容で判断！

【〜のに vs 〜けど/〜が の違い — Phân biệt】
・〜のに：話し手の感情（不満・後悔・驚き）が強く込められる
　　「頑張っているのに報われない」（不満の感情）
・〜けど/〜が：中立的な逆接（客観的な情報の提示）
　　「薬を飲んでいるが、効果は個人差がある」（中立）

【介護現場での活用 — Ứng dụng trong điều dưỡng】
患者の気持ちに寄り添う表現：
「頑張っているのに、つらいですね」（共感）
医療スタッフ間の反省：
「確認したのに見落としてしまった」（後悔・申し訳）
改善されない状況の報告：
「処置しているのに悪化している、先生に相談します」`,
      quiz: {
        question: '「毎日リハビリして＿＿、まだ歩けない」— 不満・逆接を表す正しい形は？',
        options: [
          { id: 'a', text: 'いるのに' },
          { id: 'b', text: 'いたら' },
          { id: 'c', text: 'いれば' },
          { id: 'd', text: 'いるので' },
        ],
        correctId: 'a',
        explanation: '「〜のに」は期待と反する結果に対する不満・後悔を表します。「リハビリしているのに歩けない」は「リハビリしているから歩けるはずなのに」という期待が裏切られた感情を含みます。\n「〜のに」biểu đạt sự bất mãn/hối tiếc khi kết quả trái với kỳ vọng. "リハビリしているのに歩けない" = kỳ vọng hồi phục nhưng thực tế không như vậy.',
      },
      xpReward: 25,
    },
  },


  // ===== N4 文法（続き）n4-02-10〜17 =====
  'n4-02-10': {
    courseTitle: { ja: 'N4 文法完全対策', vi: 'Ngữ pháp N4 toàn diện' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4文法: 〜ために / 〜ように（目的の区別）',
      titleTranslation: 'Ngữ pháp N4: 〜ために / 〜ように (Phân biệt mục đích)',
      introduction: `「〜ために」と「〜ように」はどちらも目的を表しますが、使い分けが重要です。
  「〜ために」：意志的な行動の目的。主語が自分で選んでできること。
  例：「回復するために、毎日リハビリをしています」（本人が意図的に行う）
  
  「〜ように」：状態変化・非意志動詞・可能動詞の目的。
  例：「転ばないように、手すりを設置しました」（転ばないという状態を目指す）
  例：「飲み込めるように、食事をとろみ食にしました」（可能の状態を目指す）
  
  「〜ために」 và「〜ように」 đều diễn tả mục đích nhưng cách dùng khác nhau:
  ・「〜ために」: mục đích của hành động có ý chí, chủ thể tự quyết định làm.
  ・「〜ように」: mục đích hướng đến một trạng thái, dùng với động từ không có ý chí hoặc động từ khả năng.`,
      keyPoints: [
        '【〜ために】接続: 動詞辞書形／名詞+の + ために / 意味: 意志的行動の目的 / 介護例: 回復するために毎日リハビリをします',
        '【〜ように】接続: 動詞辞書形・ない形 + ように / 意味: 状態・変化の目的（非意志・可能動詞） / 介護例: 転ばないように廊下に手すりをつけました',
        '【区別のポイント①】意志動詞の目的→ために：「早く帰るために仕事を急ぎました」',
        '【区別のポイント②】状態変化・可能の目的→ように：「飲み込めるようにとろみをつけました」',
        '【ように②用法】動詞て形 + ください の代わり：「忘れないように書いておいてください」（注意・指示）',
        '【介護現場でのコツ】「〜ために」は本人の努力・治療目的、「〜ように」は環境整備・予防策に多く使われる',
      ],
      vocabulary: [
        { word: '回復', reading: 'かいふく', meaning: '回復（hồi phục）', example: '回復するために入院しています' },
        { word: '転ぶ', reading: 'ころぶ', meaning: '転ぶ（ngã）', example: '転ばないように注意してください' },
        { word: '手すり', reading: 'てすり', meaning: '手すり（thanh vịn）', example: '転倒防止のために手すりをつけました' },
        { word: 'とろみ', reading: 'とろみ', meaning: 'とろみ（độ sánh）', example: '飲み込めるようにとろみをつけます' },
        { word: '誤嚥', reading: 'ごえん', meaning: '誤嚥（sặc thức ăn）', example: '誤嚥しないように食事姿勢を確認します' },
      ],
      examples: [
        {
          japanese: '利用者様が早く回復するために、毎日リハビリを続けています。',
          reading: 'りようしゃさまがはやくかいふくするために、まいにちリハビリをつづけています。',
          translation: 'Để người dùng dịch vụ hồi phục nhanh, chúng tôi tiến hành phục hồi chức năng mỗi ngày.',
        },
        {
          japanese: '転倒しないように、廊下に手すりを設置しました。',
          reading: 'てんとうしないように、ろうかにてすりをせっちしました。',
          translation: 'Để tránh ngã, chúng tôi đã lắp thanh vịn ở hành lang.',
        },
        {
          japanese: '誤嚥しないように、食事の前に口腔体操を行います。',
          reading: 'ごえんしないように、しょくじのまえにこうくうたいそうをおこないます。',
          translation: 'Để tránh sặc, chúng tôi thực hiện bài tập miệng trước bữa ăn.',
        },
        {
          japanese: '介護記録を正確に書くために、毎日研修を受けています。',
          reading: 'かいごきろくをせいかくにかくために、まいにちけんしゅうをうけています。',
          translation: 'Để ghi hồ sơ chăm sóc chính xác, tôi tham gia đào tạo mỗi ngày.',
        },
      ],
      grammarNote: `【形の作り方 — Cách cấu tạo】
  〜ために：動詞辞書形 + ために ／ 名詞 + のために
  〜ように：動詞辞書形 + ように ／ 動詞ない形 + ように
  
  【類似表現との対比 — So sánh với mẫu câu tương tự】
  ・〜ために vs 〜のに（のに는 逆接, 不满）：「頑張ったのに失敗した」（逆接）
  ・〜ように vs 〜てほしい：「転ばないようにしてほしい」= お願いの形で自然
  ・〜ために vs 〜ために（原因・理由）：「病気のために仕事を休んだ」（原因）—名詞＋のために は原因にもなる
  
  【介護現場での使い分け】
  ・利用者の治療・リハビリ目的 → 〜ために（例：口から食べられるようになるために訓練します）
  ・環境整備・事故予防策 → 〜ように（例：転倒しないように床マットを設置しました）
  ・申し送りでの使用：「明日の入浴時に転倒しないように、必ず二人介助でお願いします」`,
      quiz: {
        question: '（　）に入る最も適切な言葉を選んでください。「飲み込みが難しい患者様が安全に食事できる（　）、とろみをつけています。」',
        options: [
          { id: 'a', text: 'ために' },
          { id: 'b', text: 'ように' },
          { id: 'c', text: 'ために（のために）' },
          { id: 'd', text: 'ながら' },
        ],
        correctId: 'b',
        explanation: '「安全に食事できる」は可能動詞（できる）を使った状態変化の目的なので「〜ように」が正しいです。「〜ために」は意志動詞の目的に使います。\n「ăn được an toàn」là mục đích trạng thái dùng động từ khả năng, nên dùng「〜ように」. 「〜ために」dùng cho mục đích hành động có ý chí.',
      },
      xpReward: 25,
    },
  },
  
  'n4-02-11': {
    courseTitle: { ja: 'N4 文法完全対策', vi: 'Ngữ pháp N4 toàn diện' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4文法: 〜ながら（同時動作）',
      titleTranslation: 'Ngữ pháp N4: 〜ながら (Hành động đồng thời)',
      introduction: `「〜ながら」は2つの動作が同時に行われることを表す文法です。
  
  ①基本の意味：AしながらBする = Bをしている間、同時にAもしている
  例：「記録しながら報告する」「テレビを見ながら食事する」
  
  ②ポイント：「ながら」の前の動作が「副次的な動作（サブの動作）」になります。
  文の主な動作（メイン）は後ろの動詞です。
  例：「歩きながら話す」→「話す」がメイン、「歩く」はサブ
  
  ③主語は必ず同じ人物でなければなりません。
  ❌「私が記録しながら、田中さんが報告する」（主語が違う→使えない）
  
  「〜ながら」 diễn tả hai hành động xảy ra đồng thời.
  Động từ trước「ながら」là hành động phụ, động từ sau là hành động chính.
  Chủ ngữ của hai hành động phải là cùng một người.`,
      keyPoints: [
        '【ながら】接続: 動詞ます形（語幹） + ながら / 意味: 2つの動作の同時進行 / 介護例: 声をかけながら着替えを手伝います',
        '【前の動作=サブ】「ながら」の前の動詞が補助的動作。後の動詞がメイン動作。/ 介護例: メモしながら申し送りを聞きます',
        '【主語は同一人物】「ながら」前後の主語は必ず同じ。2人の別々の動作には使えない。/ 介護例: 私が記録しながら報告します（〇）',
        '【テレビながら食事】利用者が「テレビを見ながら食事する」場合、誤嚥リスク説明に使う / 介護例: テレビを見ながら食べると誤嚥しやすいです',
        '【注意：逆接のながら】「〜ながら」には逆接の用法もある（知っていながら言わなかった）が、N4基本用法は同時動作',
        '【丁寧な説明・指示】介護では「〜ながら」で複合動作を説明する。例: 体を支えながら立ち上がってください',
      ],
      vocabulary: [
        { word: '申し送り', reading: 'もうしおくり', meaning: '申し送り（bàn giao ca）', example: 'メモしながら申し送りを聞きます' },
        { word: '声をかける', reading: 'こえをかける', meaning: '声をかける（gọi/nói chuyện）', example: '声をかけながら体を拭きます' },
        { word: '確認する', reading: 'かくにんする', meaning: '確認する（xác nhận）', example: '脈を確認しながら記録します' },
        { word: '支える', reading: 'ささえる', meaning: '支える（đỡ/hỗ trợ）', example: '腰を支えながら歩いてもらいます' },
        { word: '見守る', reading: 'みまもる', meaning: '見守る（quan sát chăm sóc）', example: '見守りながら食事介助をします' },
      ],
      examples: [
        {
          japanese: '利用者様に声をかけながら、着替えを手伝います。',
          reading: 'りようしゃさまにこえをかけながら、きがえをてつだいます。',
          translation: 'Vừa nói chuyện với người dùng dịch vụ, vừa hỗ trợ thay quần áo.',
        },
        {
          japanese: '脈拍を確認しながら、バイタルシートに記録します。',
          reading: 'みゃくはくをかくにんしながら、バイタルシートにきろくします。',
          translation: 'Vừa kiểm tra mạch, vừa ghi vào bảng theo dõi sinh hiệu.',
        },
        {
          japanese: 'テレビを見ながら食事をすると、誤嚥しやすいので注意してください。',
          reading: 'テレビをみながらしょくじをすると、ごえんしやすいのでちゅういしてください。',
          translation: 'Vừa xem TV vừa ăn dễ bị sặc, vì vậy hãy chú ý.',
        },
        {
          japanese: 'メモを取りながら申し送りを聞いています。',
          reading: 'メモをとりながらもうしおくりをきいています。',
          translation: 'Tôi vừa ghi chép vừa nghe bàn giao ca.',
        },
      ],
      grammarNote: `【形の作り方 — Cách cấu tạo】
  動詞ます形（語幹）+ ながら + 別の動詞
  例：書きます → 書き + ながら → 書きながら報告する
  
  【類似表現との対比 — So sánh với mẫu câu tương tự】
  ・〜ながら vs 〜てから：「記録してから報告する」= 記録が終わってから報告（順番）
    「記録しながら報告する」= 同時進行
  ・〜ながら vs 〜つつ：「〜つつ」は書き言葉・やや硬い表現（N3以上）
    「確認しつつ作業する」≒「確認しながら作業する」
  ・逆接の〜ながら：「知っていながら報告しなかった」= 知っているのに報告しなかった（否定的ニュアンス）
  
  【介護現場での使用シーン】
  ・入浴介助：「体を支えながら浴槽に入ってもらいます」
  ・食事介助：「むせていないか見守りながら食事を進めます」
  ・リハビリ：「手をつなぎながら廊下を歩きます」
  ・申し送り受け：「重要な部分はメモしながら聞いてください」`,
      quiz: {
        question: '（　）に入る正しい形を選んでください。「田中さんの体を（　）、ベッドから車いすへ移動します。」',
        options: [
          { id: 'a', text: '支えながら' },
          { id: 'b', text: '支えてから' },
          { id: 'c', text: '支えるために' },
          { id: 'd', text: '支えようと' },
        ],
        correctId: 'a',
        explanation: '体を支える動作と移動する動作が同時進行なので「〜ながら」が正しいです。「〜てから」は順番（支え終わってから移動）、「〜ために」は目的を表します。\nVì hành động đỡ và di chuyển xảy ra đồng thời, dùng「〜ながら」là đúng. 「〜てから」là thứ tự, 「〜ために」là mục đích.',
      },
      xpReward: 25,
    },
  },
  
  'n4-02-12': {
    courseTitle: { ja: 'N4 文法完全対策', vi: 'Ngữ pháp N4 toàn diện' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4文法: 〜そうだ（様態 vs 伝聞）',
      titleTranslation: 'Ngữ pháp N4: 〜そうだ (Vẻ ngoài vs Nghe nói)',
      introduction: `「〜そうだ」には全く異なる2つの用法があります。混同しないことが重要です。
  
  【様態（ようたい）の〜そうだ】— 見た目・様子から判断
  「今にも〜しそうだ」のような、今目の前で見える様子を表します。
  例：「この患者は倒れそうだ」（今にも倒れる様子に見える）
  例：「この利用者は痛そうだ」（表情や様子から痛そうに見える）
  接続：動詞ます形語幹 / い形容詞語幹 / な形容詞語幹 + そうだ
  
  【伝聞（でんぶん）の〜そうだ】— 他の人から聞いた情報
  他者から聞いた情報を伝えるときに使います。「〜と聞いた」「〜らしい」に近い意味。
  例：「田中さんは熱があるそうだ」（誰かから聞いた情報）
  例：「明日、退院するそうです」（医師などから聞いた情報）
  接続：普通形（辞書形・た形・ない形・だった形）+ そうだ
  
  「〜そうだ」có 2 nghĩa hoàn toàn khác nhau:
  1. Vẻ ngoài (様態): phán đoán từ quan sát trực tiếp — tiếp với ます形語幹/い形語幹
  2. Nghe nói (伝聞): truyền đạt thông tin nghe được — tiếp với thể thông thường`,
      keyPoints: [
        '【様態そうだ】接続: 動詞ます形語幹 + そうだ（食べます→食べそう）/ 意味: 見た目からの推測 / 介護例: 今にも転びそうです、早く対応してください',
        '【様態そうだ②】い形容詞: 語幹（い取る）+そうだ（痛い→痛そう）／ な形容詞: 語幹+そうだ（元気な→元気そう）/ 介護例: 顔色が悪くて苦しそうです',
        '【伝聞そうだ】接続: 普通形（辞書形・た形・ない形）+ そうだ / 意味: 他者から聞いた情報の伝達 / 介護例: 昨日から食欲がないそうです（家族から聞いた）',
        '【見分け方のポイント】様態は「今目の前で見える状況」、伝聞は「誰かから聞いた情報（その場では確認できない）」',
        '【例外：よさそう・なさそう】よい→よさそう（×よいそう）、ない→なさそう（×なさそうだ）は様態のみ特殊変化',
        '【介護現場での重要性】緊急報告では様態（今見えている状態）を、申し送りでは伝聞（前シフトから聞いた情報）を区別して使う',
      ],
      vocabulary: [
        { word: '倒れる', reading: 'たおれる', meaning: '倒れる（ngã/ngất）', example: '今にも倒れそうな様子です' },
        { word: '痛い', reading: 'いたい', meaning: '痛い（đau）', example: '足が痛そうで歩けていません' },
        { word: '食欲', reading: 'しょくよく', meaning: '食欲（cảm giác thèm ăn）', example: '食欲がないそうです（家族より）' },
        { word: '退院', reading: 'たいいん', meaning: '退院（xuất viện）', example: '来週退院するそうです' },
        { word: '発熱', reading: 'はつねつ', meaning: '発熱（sốt）', example: '昨夜から発熱しているそうです' },
      ],
      examples: [
        {
          japanese: '田中さんが廊下でふらついていて、今にも倒れそうです。',
          reading: 'たなかさんがろうかでふらついていて、いまにもたおれそうです。',
          translation: 'Ông Tanaka đang loạng choạng ở hành lang, có vẻ như sắp ngã.',
        },
        {
          japanese: '顔をしかめていて、とても痛そうです。すぐに看護師に連絡します。',
          reading: 'かおをしかめていて、とてもいたそうです。すぐにかんごしにれんらくします。',
          translation: 'Ông ấy đang nhăn mặt, trông rất đau. Tôi sẽ liên hệ y tá ngay.',
        },
        {
          japanese: '家族の話では、昨夜から熱があるそうです。',
          reading: 'かぞくのはなしでは、さくやからねつがあるそうです。',
          translation: 'Theo gia đình cho biết, từ tối qua ông ấy đã bị sốt.',
        },
        {
          japanese: '昨日の申し送りによると、山田さんは明日退院するそうです。',
          reading: 'きのうのもうしおくりによると、やまださんはあしたたいいんするそうです。',
          translation: 'Theo bàn giao ca hôm qua, bà Yamada sẽ xuất viện vào ngày mai.',
        },
      ],
      grammarNote: `【形の作り方 — Cách cấu tạo】
  ▼様態そうだ（見た目・推測）
  ・動詞ます形語幹 + そうだ：食べます→食べそう、転びます→転びそう
  ・い形容詞語幹（い削除）+ そうだ：痛い→痛そう、苦しい→苦しそう
  ・な形容詞語幹 + そうだ：元気な→元気そう
  ・特殊：よい→よさそう、ない→なさそう
  
  ▼伝聞そうだ（聞いた情報）
  ・普通形 + そうだ：食べる→食べるそうだ、食べた→食べたそうだ
  ・ない形：食べない→食べないそうだ
  ・な形容詞：元気だ→元気だそうだ（元気そうだ、ではない）
  
  【類似表現との対比 — So sánh với mẫu câu tương tự】
  ・伝聞そうだ vs らしい：どちらも伝聞だが「らしい」は根拠（証拠）があるニュアンス
  ・様態そうだ vs ようだ：「ようだ」も見た目の推測だが「ようだ」はより確実な根拠から
  
  【介護現場での区別】
  ・様態（緊急報告）：「今にも転倒しそうです！」= 今この瞬間見えている状態
  ・伝聞（申し送り）：「家族から連絡があり、明日面会に来られないそうです」`,
      quiz: {
        question: '次の2文のうち、「伝聞（でんぶん）のそうだ」はどちらですか？',
        options: [
          { id: 'a', text: '鈴木さんは今にも泣きそうです。' },
          { id: 'b', text: '鈴木さんは昨日具合が悪かったそうです。' },
          { id: 'c', text: '鈴木さんは苦しそうな顔をしています。' },
          { id: 'd', text: '食事が美味しそうですね。' },
        ],
        correctId: 'b',
        explanation: '「昨日具合が悪かった（た形の普通形）＋そうです」は伝聞。誰かから聞いた情報を伝えています。a・c・dは今見えている様子（様態）の「そうだ」です。\nBcâu b: 「昨日〜たそうです」= thể quá khứ (た形) + そうだ = nghe nói/truyền đạt thông tin. Các câu a, c, d đều là vẻ ngoài quan sát được (様態).',
      },
      xpReward: 25,
    },
  },
  
  'n4-02-13': {
    courseTitle: { ja: 'N4 文法完全対策', vi: 'Ngữ pháp N4 toàn diện' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4文法: 〜らしい（推測・伝聞）',
      titleTranslation: 'Ngữ pháp N4: 〜らしい (Có vẻ / Nghe nói - dựa trên bằng chứng)',
      introduction: `「〜らしい」は、何らかの根拠・証拠に基づいた推測や、間接的に聞いた情報を表します。
  
  ①推測（根拠あり）：「田中さんは回復しているらしい」
  → 顔色が良くなった、動きが活発になったなど、何か根拠となる情報がある
  →「どうやら〜らしい」「〜の様子らしい」のように根拠を感じさせる
  
  ②伝聞（間接的に聞いた）：「明日、台風が来るらしい」
  → ニュース・他の人から聞いた情報。自分が直接確認したわけではない
  
  ③形容詞的用法：「彼は医師らしい態度だ」
  →「〜にふさわしい・典型的な」という意味。介護では「プロらしい対応」
  
  「〜らしい」 diễn tả:
  1. Suy đoán có căn cứ (quan sát, thông tin gián tiếp)
  2. Nghe nói (thông tin gián tiếp, không tự mình xác nhận)
  3. Dùng như tính từ: "tiêu biểu/xứng đáng với..."`,
      keyPoints: [
        '【らしい①推測】接続: 普通形 + らしい / 意味: 根拠・証拠に基づく推測 / 介護例: 田中さんは回復しているらしい（顔色が改善している根拠あり）',
        '【らしい②伝聞】接続: 普通形 + らしい / 意味: 間接的に聞いた情報 / 介護例: 明日の面会は中止らしいです（他スタッフから聞いた）',
        '【らしい③形容詞的】接続: 名詞 + らしい / 意味: 〜にふさわしい・典型的な / 介護例: プロらしい対応で利用者さんに接してください',
        '【そうだ（伝聞）との違い】らしいは根拠・証拠を感じさせる。そうだは純粋に「聞いた」情報。「熱があるらしい（様子を見て）」vs「熱があるそうだ（直接聞いた）」',
        '【ようだ・みたいだとの違い】らしいは話し手が直接見ていない場合に多い。ようだは直接観察を含む推測。',
        '【介護現場での使い方】家族や他部署からの情報を申し送りで伝える際：「ご家族の連絡によると、最近眠れていないらしいです」',
      ],
      vocabulary: [
        { word: '回復', reading: 'かいふく', meaning: '回復（hồi phục）', example: '田中さんは徐々に回復しているらしい' },
        { word: '認知症', reading: 'にんちしょう', meaning: '認知症（sa sút trí tuệ）', example: '認知症が進んでいるらしいです' },
        { word: '転院', reading: 'てんいん', meaning: '転院（chuyển viện）', example: '来月転院するらしいです' },
        { word: '不眠', reading: 'ふみん', meaning: '不眠（mất ngủ）', example: '最近不眠が続いているらしい' },
        { word: '食欲不振', reading: 'しょくよくふしん', meaning: '食欲不振（chán ăn）', example: '食欲不振が続いているらしいです' },
      ],
      examples: [
        {
          japanese: '田中さんは最近よく眠れているらしく、顔色がよくなってきました。',
          reading: 'たなかさんはさいきんよくねむれているらしく、かおいろがよくなってきました。',
          translation: 'Ông Tanaka có vẻ ngủ ngon hơn gần đây, sắc mặt đã cải thiện.',
        },
        {
          japanese: '家族の方から聞いたところ、退院後は施設入所を考えているらしいです。',
          reading: 'かぞくのかたからきいたところ、たいいんごはしせつにゅうしょをかんがえているらしいです。',
          translation: 'Nghe gia đình nói, sau khi xuất viện có vẻ đang xem xét vào viện dưỡng lão.',
        },
        {
          japanese: '昨日から食欲がなくて、お腹が痛いらしいです。',
          reading: 'きのうからしょくよくがなくて、おなかがいたいらしいです。',
          translation: 'Từ hôm qua không muốn ăn, có vẻ đau bụng.',
        },
        {
          japanese: '山田さんはプロらしい対応で、いつも利用者様から信頼されています。',
          reading: 'やまださんはプロらしいたいおうで、いつもりようしゃさまからしんらいされています。',
          translation: 'Cách ứng xử chuyên nghiệp của bà Yamada luôn được người dùng dịch vụ tin tưởng.',
        },
      ],
      grammarNote: `【形の作り方 — Cách cấu tạo】
  普通形 + らしい
  ・動詞：回復している + らしい → 回復しているらしい
  ・い形容詞：痛い + らしい → 痛いらしい
  ・な形容詞：元気な + らしい → 元気らしい（「な」は省略）
  ・名詞：風邪 + らしい → 風邪らしい
  
  【類似表現との対比 — So sánh với mẫu câu tương tự】
  ▼らしい vs 伝聞そうだ
  ・らしい：間接情報＋根拠や様子から推測するニュアンス
  ・そうだ（伝聞）：純粋に「〜と聞いた」情報の伝達、根拠は問わない
  例：「熱があるらしい」（様子から見てもそう思える）
  　　「熱があるそうだ」（誰かから聞いた、自分では判断していない）
  
  ▼らしい vs ようだ
  ・ようだ：話し手が直接観察した根拠から推測（強い確信）
  ・らしい：間接情報・様子・うわさなどから推測（やや弱い確信）
  
  【介護現場での使用シーン】
  ・申し送り：「夜間に何度か起きていたらしいです（夜勤者から聞いた）」
  ・家族情報の伝達：「ご家族によると食欲がないらしいとのことです」
  ・観察メモ：「顔色から見て、具合が悪いらしい様子でした」`,
      quiz: {
        question: '「鈴木さんは先週から入院しているらしい」の意味として最も適切なものは？',
        options: [
          { id: 'a', text: '自分が鈴木さんの病院に行って直接確認した' },
          { id: 'b', text: '他の人から聞いた、または状況から推測した情報として伝えている' },
          { id: 'c', text: '鈴木さんが自分で入院したいと言った' },
          { id: 'd', text: '鈴木さんがこれから入院する予定がある' },
        ],
        correctId: 'b',
        explanation: '「らしい」は直接確認したわけではなく、間接情報や状況証拠からの推測を表します。自分が直接見て確認した場合は「ようだ」を使います。\n「らしい」không phải thông tin tự mình xác nhận trực tiếp, mà là suy đoán từ thông tin gián tiếp hoặc bằng chứng. Nếu tự mình quan sát trực tiếp, dùng「ようだ」.',
      },
      xpReward: 25,
    },
  },
  
  'n4-02-14': {
    courseTitle: { ja: 'N4 文法完全対策', vi: 'Ngữ pháp N4 toàn diện' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4文法: 〜ようだ / 〜みたいだ（推測・比喩）',
      titleTranslation: 'Ngữ pháp N4: 〜ようだ / 〜みたいだ (Có vẻ như / Giống như)',
      introduction: `「〜ようだ」と「〜みたいだ」はほぼ同じ意味で、推測と比喩の2つの用法があります。
  「みたいだ」は「ようだ」の口語・くだけた表現です。
  
  ①推測（観察に基づく）：直接見た・聞いた・感じた根拠から推測する
  例：「具合が悪いようだ」（顔色・様子を直接見て推測）
  例：「眠っているみたいだ」（寝息が聞こえるなど直接感じる根拠がある）
  
  ②比喩（〜のように見える）：何かに似ていると表現する
  例：「この薬は飴のようだ」（形・色が飴に似ている）
  例：「まるで先生みたいな話し方をする」（先生のようだという比喩）
  
  「〜ようだ」と「らしい」の違い：
  ・ようだ：話し手が直接観察した根拠に基づく、確信が強め
  ・らしい：間接情報や一般的な噂・状況から推測、確信が弱め
  
  「〜ようだ」 và「〜みたいだ」gần như cùng nghĩa:
  ・Suy đoán: dựa trên quan sát trực tiếp của người nói
  ・So sánh/ẩn dụ: diễn tả sự tương đồng
  ・「みたいだ」là dạng khẩu ngữ hơn của「ようだ」`,
      keyPoints: [
        '【ようだ推測】接続: 普通形 + ようだ / 意味: 直接観察・根拠に基づく推測 / 介護例: 具合が悪いようです、すぐ確認します',
        '【みたいだ推測】接続: 普通形（名詞・な形容詞は「な」不要） + みたいだ / 意味: ようだの口語形 / 介護例: 熱があるみたいです（口語）',
        '【ようだ比喩】接続: 名詞 + のようだ / 意味: 〜に似ている、まるで〜だ / 介護例: 痛みで顔が青白く、まるで紙のようでした',
        '【みたいだ比喩】接続: 名詞 + みたいだ / 意味: 〜のようだの口語 / 介護例: 赤ちゃんみたいにぐっすり寝ています（口語）',
        '【ようだ vs らしい比較】ようだ＝直接観察した根拠（強い確信）、らしい＝間接情報から推測（弱い確信） / 介護例: 「目が赤く、泣いていたようです」vs「泣いていたらしいです（他の人から聞いた）」',
        '【文体の違い】ようだ：書き言葉・報告書OK、みたいだ：口語・日常会話向き。介護記録には「ようだ・ようです」を使う',
      ],
      vocabulary: [
        { word: '具合', reading: 'ぐあい', meaning: '具合（tình trạng sức khỏe）', example: '具合が悪いようです' },
        { word: '苦しむ', reading: 'くるしむ', meaning: '苦しむ（đau khổ/khó chịu）', example: '呼吸が苦しいようです' },
        { word: '意識', reading: 'いしき', meaning: '意識（ý thức/tỉnh táo）', example: '意識がないようです。救急を呼びます' },
        { word: 'うとうと', reading: 'うとうと', meaning: 'うとうと（ngủ gà ngủ gật）', example: 'うとうとしているみたいです' },
        { word: '顔色', reading: 'かおいろ', meaning: '顔色（sắc mặt）', example: '顔色が悪いようですが大丈夫ですか' },
      ],
      examples: [
        {
          japanese: '田中さんは顔色が悪くて、具合が悪いようです。すぐ看護師を呼びます。',
          reading: 'たなかさんはかおいろがわるくて、ぐあいがわるいようです。すぐかんごしをよびます。',
          translation: 'Ông Tanaka sắc mặt tái, có vẻ không khỏe. Tôi sẽ gọi y tá ngay.',
        },
        {
          japanese: '呼吸が浅くて、眠っているみたいですが、念のため確認します。',
          reading: 'こきゅうがあさくて、ねむっているみたいですが、ねんのためかくにんします。',
          translation: 'Thở nông, có vẻ đang ngủ nhưng tôi sẽ kiểm tra lại cho chắc.',
        },
        {
          japanese: 'このお薬は甘くて、まるでお菓子のようだとおっしゃっていました。',
          reading: 'このおくすりはあまくて、まるでおかしのようだとおっしゃっていました。',
          translation: 'Ông ấy nói loại thuốc này ngọt, trông giống kẹo vậy.',
        },
        {
          japanese: '昨夜からあまり眠れていないようで、目の下にクマができています。',
          reading: 'さくやからあまりねむれていないようで、めのしたにクマができています。',
          translation: 'Có vẻ từ tối qua không ngủ được nhiều, mắt đã thâm quầng.',
        },
      ],
      grammarNote: `【形の作り方 — Cách cấu tạo】
  ▼ようだ
  ・動詞普通形 + ようだ：眠っている + ようだ → 眠っているようだ
  ・い形容詞 + ようだ：痛い + ようだ → 痛いようだ
  ・な形容詞 + なようだ：元気な + ようだ → 元気なようだ
  ・名詞 + のようだ：風邪のようだ（推測）/ 先生のようだ（比喩）
  
  ▼みたいだ（口語）
  ・動詞普通形 + みたいだ：眠っている + みたいだ → 眠っているみたいだ
  ・名詞 + みたいだ：風邪みたいだ（「の」不要）
  ・な形容詞語幹 + みたいだ：元気みたいだ（「な」不要）
  
  【3つの推測表現の比較 — So sánh 3 mẫu suy đoán】
  ・ようだ：直接見た・聞いた根拠→確信が強い「今まさに顔が青い→具合が悪いようだ」
  ・らしい：間接情報・一般認識から推測→確信がやや弱い「他の人から聞いた」
  ・そうだ（様態）：見た目の第一印象→「今にも〜しそう」という差し迫った様子
  
  【介護現場での使い分け】
  ・緊急報告（口頭）：「意識がないみたいです！」（みたいだ=口語）
  ・介護記録（書き言葉）：「意識レベルが低下しているようでした」（ようだ=書き言葉）`,
      quiz: {
        question: '介護記録に書く場合、どちらが適切ですか？「田中さんは夜間に腹痛があった（　）で、何度もナースコールがありました。」',
        options: [
          { id: 'a', text: 'みたい' },
          { id: 'b', text: 'よう' },
          { id: 'c', text: 'らしかった' },
          { id: 'd', text: 'そう' },
        ],
        correctId: 'b',
        explanation: '介護記録などの書き言葉・フォーマルな文章には「〜ようだ・ようです」を使います。「みたいだ」は口語なので記録には不適切です。\nTrong hồ sơ chăm sóc và văn viết trang trọng, dùng「〜ようだ・ようです」. 「みたいだ」là khẩu ngữ, không phù hợp cho văn bản chính thức.',
      },
      xpReward: 25,
    },
  },
  
  'n4-02-15': {
    courseTitle: { ja: 'N4 文法完全対策', vi: 'Ngữ pháp N4 toàn diện' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4文法: 〜かもしれない（可能性・不確実性）',
      titleTranslation: 'Ngữ pháp N4: 〜かもしれない (Có thể là / Không chắc chắn)',
      introduction: `「〜かもしれない」は、確信はないが可能性があることを表す表現です。
  
  日本語の確実性レベル：
  確実→「〜だ/です」→「〜はずだ」→「〜だろう」→「〜かもしれない」→不確実
  
  「〜かもしれない」の特徴：
  ・可能性は50%以下のイメージ（「〜だろう」より低い確信）
  ・根拠は弱い、または推測の域を出ない
  ・自分の意見・予測を控えめに表現する場合にも使う
  
  介護現場での重要性：
  ・転倒後：「骨折しているかもしれない→すぐに動かさないで」
  ・誤嚥後：「誤嚥かもしれない→吸引の準備を」
  ・意識レベル変化：「脳卒中の可能性があるかもしれない→すぐ119番」
  
  「〜かもしれない」 diễn tả khả năng không chắc chắn (dưới 50%).
  Trong điều dưỡng, dùng để báo cáo tình huống có thể nguy hiểm dù chưa chắc chắn.`,
      keyPoints: [
        '【かもしれない】接続: 普通形 + かもしれない（名詞・な形容詞は「だ」省略可） / 意味: 低い確実性の可能性 / 介護例: 転倒したかもしれない、急いで確認を',
        '【確実性レベル】はずだ（当然）＞だろう（推測・高確信）＞かもしれない（可能性・低確信）/ 介護例: 「骨折かもしれない」→確認前の段階での報告',
        '【否定形】かもしれない + ない → 来ないかもしれない（来る可能性が低い） / 介護例: 「明日の面会は来られないかもしれません」',
        '【丁寧形】かもしれません（丁寧）/ 介護例: 「誤嚥かもしれません。吸引の準備をお願いします」',
        '【介護現場での重要な用例】不確かな緊急状況の報告に使う。確認できていない段階で上司や看護師に伝えるとき必須',
        '【「かもしれない」+行動】「〜かもしれないので、〜します」の形で理由と行動を一緒に報告するのが実践的 / 介護例: 骨折かもしれないので、動かさずに看護師を呼びます',
      ],
      vocabulary: [
        { word: '骨折', reading: 'こっせつ', meaning: '骨折（gãy xương）', example: '転んで骨折したかもしれません' },
        { word: '誤嚥', reading: 'ごえん', meaning: '誤嚥（sặc/hít phải dị vật）', example: '誤嚥かもしれません、吸引を準備します' },
        { word: '脱水', reading: 'だっすい', meaning: '脱水（mất nước）', example: '脱水症状かもしれません' },
        { word: '褥瘡', reading: 'じょくそう', meaning: '褥瘡（loét tỳ đè）', example: '褥瘡が悪化しているかもしれません' },
        { word: '急変', reading: 'きゅうへん', meaning: '急変（thay đổi đột ngột）', example: '容体が急変するかもしれません' },
      ],
      examples: [
        {
          japanese: '田中さんが廊下で転倒しました。骨折しているかもしれないので、動かさずに看護師を呼びます。',
          reading: 'たなかさんがろうかでてんとうしました。こっせつしているかもしれないので、うごかさずにかんごしをよびます。',
          translation: 'Ông Tanaka đã ngã ở hành lang. Có thể bị gãy xương nên tôi không di chuyển ông và gọi y tá.',
        },
        {
          japanese: '食事中にむせていたので、誤嚥かもしれません。吸引の準備をお願いします。',
          reading: 'しょくじちゅうにむせていたので、ごえんかもしれません。きゅういんのじゅんびをおねがいします。',
          translation: 'Trong bữa ăn ông ấy bị sặc, có thể bị hít phải. Xin hãy chuẩn bị máy hút.',
        },
        {
          japanese: '今日は水分をあまり取っていないので、脱水になっているかもしれません。',
          reading: 'きょうはすいぶんをあまりとっていないので、だっすいになっているかもしれません。',
          translation: 'Hôm nay uống ít nước nên có thể đã bị mất nước.',
        },
        {
          japanese: '明日の家族面会は、交通事情で来られないかもしれないとのことです。',
          reading: 'あしたのかぞくめんかいは、こうつうじじょうでこられないかもしれないとのことです。',
          translation: 'Gia đình cho biết ngày mai do tình hình giao thông có thể không đến thăm được.',
        },
      ],
      grammarNote: `【形の作り方 — Cách cấu tạo】
  普通形 + かもしれない
  ・動詞：転倒した + かもしれない → 転倒したかもしれない
  ・い形容詞：痛い + かもしれない → 痛いかもしれない
  ・な形容詞語幹：深刻（だ）→ 深刻かもしれない
  ・名詞：骨折（だ）→ 骨折かもしれない
  
  【確実性の段階 — Mức độ chắc chắn】
  確実（100%）：「骨折です」
  高い確信：「骨折のはずです」（理由があって当然そうなる）
  推測（高め）：「骨折でしょう」（かなりそう思う）
  可能性（低め）：「骨折かもしれません」（そうかもしれないが確かではない）
  ほぼない：「骨折ではないでしょう」
  
  【類似表現との対比】
  ・かもしれない vs だろう：だろうは確信が強い。かもしれないは確信が弱い。
  ・かもしれない vs はずだ：はずだは根拠があって「当然そうなる」。かもしれないは根拠が弱い。
  
  【介護現場での実践的使い方】
  緊急報告パターン：「〜かもしれないので、すぐに〜してください」
  ・「骨折かもしれないので、動かさずに先生を呼んでください」
  ・「意識がないかもしれないので、すぐ119番に連絡してください」`,
      quiz: {
        question: '「〜かもしれない」を使った最も適切な介護現場での報告文はどれですか？',
        options: [
          { id: 'a', text: '山田さんは今元気かもしれないですが、今日は休みです。' },
          { id: 'b', text: '佐藤さんが食事中にむせました。誤嚥かもしれないので、看護師を呼んでください。' },
          { id: 'c', text: '田中さんは明日退院かもしれないです（退院日が確定している場合）。' },
          { id: 'd', text: 'この薬は甘いかもしれないですね（自分が飲んで確認した場合）。' },
        ],
        correctId: 'b',
        explanation: '「かもしれない」は確認できていない可能性を報告するときに使います。選択肢bは誤嚥の可能性があるが確認できていない段階で報告しており、「かもしれない」の正しい使い方です。\n「かもしれない」dùng để báo cáo khả năng chưa xác nhận. Câu b báo cáo khả năng sặc (chưa xác nhận) và yêu cầu hành động, là cách dùng đúng.',
      },
      xpReward: 25,
    },
  },
  
  'n4-02-16': {
    courseTitle: { ja: 'N4 文法完全対策', vi: 'Ngữ pháp N4 toàn diện' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4文法: 〜はずだ（当然の予測・期待）',
      titleTranslation: 'Ngữ pháp N4: 〜はずだ (Đáng lẽ / Theo lý thì phải)',
      introduction: `「〜はずだ」は、理由や根拠があって「当然そうなる・なった」という確信を表す表現です。
  
  ①予測・期待：「今日来るはずだ」
  → 約束や予定がある→当然来るはずという根拠のある確信
  
  ②論理的結果：「薬を飲んだはずです」
  → 自分が飲ませた、飲んだのを見たという根拠がある
  
  ③予想外の事実への驚き：「来るはずなのに来ない」
  → 来るはずという根拠があるのに、実際には来ていない→驚き・不満
  
  注意：「はずだ」は話し手の根拠のある確信。根拠がなければ使えません。
  「今日来るはずだ」（予約・約束がある場合）
  「今日来るかもしれない」（根拠がない単なる可能性）
  
  「〜はずだ」 diễn tả xác tín có căn cứ rằng điều gì đó "đương nhiên phải xảy ra/đã xảy ra".
  Dùng khi có lý do, kế hoạch, quy tắc để tin như vậy.`,
      keyPoints: [
        '【はずだ】接続: 動詞普通形 + はずだ / 意味: 根拠のある確信・当然の予測 / 介護例: 今日の午後、リハビリの先生が来るはずです',
        '【はずだった】接続: 普通形 + はずだった / 意味: 予定だったが実現しなかった / 介護例: 10時に入浴するはずでしたが、体調不良で中止になりました',
        '【はずがない】接続: 普通形 + はずがない / 意味: 絶対にそうならないという強い否定 / 介護例: 田中さんが薬を飲み忘れるはずがない（いつも忘れない人なので）',
        '【逆接のはずなのに】予定・根拠があるのに実現しない驚き / 介護例: 今日は来るはずなのに、まだいらっしゃらないですね',
        '【かもしれない vs はずだ】かもしれない（根拠弱・低確信）vs はずだ（根拠強・高確信）/ 介護例: 「薬を飲んだはずです（根拠あり）」vs「薬を飲んだかもしれません（根拠なし）」',
        '【介護での重要用例】服薬確認、スケジュール確認、ルール・規則への言及：「この薬は食後に飲むはずです」',
      ],
      vocabulary: [
        { word: '予約', reading: 'よやく', meaning: '予約（đặt lịch/đặt chỗ）', example: '今日の午後2時に予約があるはずです' },
        { word: '処方', reading: 'しょほう', meaning: '処方（kê đơn）', example: '医師に処方されたはずですが...' },
        { word: '入浴', reading: 'にゅうよく', meaning: '入浴（tắm）', example: '今日は入浴の日のはずです' },
        { word: '面会', reading: 'めんかい', meaning: '面会（thăm hỏi）', example: '家族が午後に来るはずです' },
        { word: '服薬', reading: 'ふくやく', meaning: '服薬（uống thuốc）', example: '朝食後に服薬したはずですが確認します' },
      ],
      examples: [
        {
          japanese: '田中さんの家族は今日の午後3時に面会に来るはずです。部屋の準備をしましょう。',
          reading: 'たなかさんのかぞくはきょうのごご3じにめんかいにくるはずです。へやのじゅんびをしましょう。',
          translation: 'Gia đình ông Tanaka sẽ đến thăm lúc 3 giờ chiều hôm nay. Hãy chuẩn bị phòng.',
        },
        {
          japanese: '朝食後に血圧の薬を飲んだはずですが、記録に残っていないので確認します。',
          reading: 'ちょうしょくごにけつあつのくすりをのんだはずですが、きろくにのこっていないのでかくにんします。',
          translation: 'Theo lý thì đã uống thuốc huyết áp sau bữa sáng, nhưng chưa có ghi chép nên tôi sẽ xác nhận.',
        },
        {
          japanese: '今日は入浴の日のはずなのに、なぜかスケジュール表に書いていないですね。',
          reading: 'きょうはにゅうよくのひのはずなのに、なぜかスケジュールひょうにかいていないですね。',
          translation: 'Theo lịch thì hôm nay là ngày tắm, nhưng không hiểu sao không có trong bảng lịch.',
        },
        {
          japanese: 'このルートで20分のはずですが、もう30分経っています。迷子になったかもしれません。',
          reading: 'このルートで20ぷんのはずですが、もう30ぷんたっています。まいごになったかもしれません。',
          translation: 'Theo lịch trình thì chỉ mất 20 phút, nhưng đã qua 30 phút rồi. Có thể bị lạc.',
        },
      ],
      grammarNote: `【形の作り方 — Cách cấu tạo】
  普通形 + はずだ
  ・動詞：来る + はずだ → 来るはずだ ／ 飲んだ + はずだ → 飲んだはずだ
  ・い形容詞：痛い + はずだ → 痛いはずだ
  ・な形容詞語幹：元気な + はずだ → 元気なはずだ
  ・名詞：予約 + のはずだ → 予約のはずだ
  
  【派生形 — Các dạng biến đổi】
  ・はずだった：〜の予定だったが実現しなかった「来るはずだったのに来なかった」
  ・はずがない：絶対にそうではない強い否定「忘れるはずがない」
  ・はずなのに：根拠があるのに事実が異なる驚き「あるはずなのにない」
  
  【類似表現との対比 — So sánh】
  ・はずだ vs だろう：だろうは単純推測。はずだは根拠のある確信。
  ・はずだ vs かもしれない：はずだ（根拠あり・高確信）かもしれない（根拠弱・低確信）
  ・はずだ vs ようだ：ようだは現在の観察から。はずだは過去の情報・論理から。
  
  【介護現場での使用シーン】
  ・スケジュール確認：「今日の午後2時にリハビリがあるはずです」
  ・服薬管理：「食後に飲んだはずですが、確認させてください」
  ・規則・ルール：「この処置は医師の指示があるはずです。確認します」`,
      quiz: {
        question: '次のうち「はずだ」の正しい使い方はどれですか？',
        options: [
          { id: 'a', text: '明日雨が降るはずです（天気予報も見ておらず、根拠がない場合）。' },
          { id: 'b', text: '田中さんは昨日退院したはずです（退院の手続きを自分で行ったので知っている）。' },
          { id: 'c', text: '山田さんは今どこかにいるはずです（全く情報がない場合）。' },
          { id: 'd', text: '薬はどこかにあるはずです（探したが見つからない、情報なし）。' },
        ],
        correctId: 'b',
        explanation: '「はずだ」は話し手が知っている根拠・情報に基づく確信が必要です。bは退院手続きを自分で行ったという明確な根拠があります。a・c・dには具体的な根拠がないため「かもしれない」や「だろう」が適切です。\n「はずだ」cần căn cứ rõ ràng của người nói. Câu b có căn cứ là tự mình thực hiện thủ tục xuất viện. Các câu a, c, d không có căn cứ cụ thể nên dùng「かもしれない」hay「だろう」.',
      },
      xpReward: 25,
    },
  },
  
  'n4-02-17': {
    courseTitle: { ja: 'N4 文法完全対策', vi: 'Ngữ pháp N4 toàn diện' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4文法: 〜てもいい / 〜てはいけない（許可と禁止）',
      titleTranslation: 'Ngữ pháp N4: 〜てもいい / 〜てはいけない (Cho phép và Cấm)',
      introduction: `「〜てもいい」と「〜てはいけない」は介護現場で毎日使う許可・禁止の表現です。
  
  【〜てもいい】：許可を与える・許可を求める
  ・許可を与える：「ここに座ってもいいですよ」
  ・許可を求める：「窓を開けてもいいですか？」
  → 相手の行動に問題がないことを示す
  
  【〜てはいけない】：禁止を伝える
  ・規則として禁止：「ここでは携帯電話を使ってはいけません」
  ・医療上の禁止：「この薬はお酒と一緒に飲んではいけません」
  ・強い禁止：「〜てはならない」（より強い・書き言葉）
  
  関連表現の丁寧さレベル：
  ・〜てもかまわない（どちらでもよい）
  ・〜てもいい（普通・口語）
  ・〜てもよい（やや丁寧）
  ・〜てもよろしい（丁寧）
  ・〜てもよろしいでしょうか（最も丁寧）
  
  「〜てもいい」 và「〜てはいけない」là mẫu câu cơ bản về cho phép và cấm đoán.
  Trong điều dưỡng, dùng hàng ngày để truyền đạt quy định, hướng dẫn y tế và xin phép.`,
      keyPoints: [
        '【てもいい①許可付与】接続: 動詞て形 + もいい（です）/ 意味: 相手の行動を許可する / 介護例: 今日はお風呂に入ってもいいですよ',
        '【てもいい②許可要求】接続: 動詞て形 + もいいですか / 意味: 許可を求める疑問形 / 介護例: 窓を少し開けてもいいですか？（利用者への確認）',
        '【てはいけない禁止】接続: 動詞て形 + はいけない（ません）/ 意味: 禁止の伝達 / 介護例: この薬はグレープフルーツジュースと一緒に飲んではいけません',
        '【医療・介護での禁止】「〜は禁止されています」「〜はできません」より柔らかく禁止を伝える。「〜てはいけません」は理由を伴うと説得力が増す',
        '【てもいい vs てもかまわない】てもいい（積極的OK）vs てもかまわない（消極的OK、どちらでもよい）/ 介護例: 「食べてもいいです」vs「食べてもかまいません」',
        '【てはいけない vs てはならない】いけない（口語・普通）vs ならない（書き言葉・より強い禁止） / 介護例: 規則の掲示には「〜してはならない」を使うことが多い',
      ],
      vocabulary: [
        { word: '安静', reading: 'あんせい', meaning: '安静（nghỉ ngơi tuyệt đối）', example: '術後は安静にしていなければいけません' },
        { word: '禁酒', reading: 'きんしゅ', meaning: '禁酒（cấm uống rượu）', example: 'この薬を飲む間は禁酒しなければいけません' },
        { word: '絶食', reading: 'ぜっしょく', meaning: '絶食（nhịn ăn）', example: '手術前日は絶食しなければいけません' },
        { word: '外出', reading: 'がいしゅつ', meaning: '外出（ra ngoài）', example: '主治医の許可があれば外出してもいいです' },
        { word: '制限', reading: 'せいげん', meaning: '制限（hạn chế）', example: '水分制限があるので飲みすぎてはいけません' },
      ],
      examples: [
        {
          japanese: '先生の許可が出ましたので、明日から歩行器を使って歩いてもいいですよ。',
          reading: 'せんせいのきょかがでましたので、あしたからほこうきをつかってあるいてもいいですよ。',
          translation: 'Bác sĩ đã cho phép, từ ngày mai được dùng khung tập đi để đi bộ rồi nhé.',
        },
        {
          japanese: 'この薬はアルコールと一緒に飲んではいけません。副作用が出ることがあります。',
          reading: 'このくすりはアルコールといっしょにのんではいけません。ふくさようがでることがあります。',
          translation: 'Thuốc này không được uống cùng rượu. Có thể gây ra tác dụng phụ.',
        },
        {
          japanese: '手術の前日は夜12時以降、何も食べてはいけません。水も飲まないでください。',
          reading: 'しゅじゅつのぜんじつはよる12じいこう、なにもたべてはいけません。みずものまないでください。',
          translation: 'Ngày trước phẫu thuật, sau 12 giờ đêm không được ăn bất cứ thứ gì. Cũng không được uống nước.',
        },
        {
          japanese: 'お部屋の外に出てもいいですか？少し外の空気を吸いたいのですが。',
          reading: 'おへやのそとにでてもいいですか？すこしそとのくうきをすいたいのですが。',
          translation: 'Tôi có thể ra ngoài phòng không? Tôi muốn hít thở không khí bên ngoài một chút.',
        },
      ],
      grammarNote: `【形の作り方 — Cách cấu tạo】
  ▼〜てもいい（許可）
  動詞て形 + もいい（です）
  ・食べます → 食べて + もいい → 食べてもいいです
  ・飲む → 飲んで + もいい → 飲んでもいいです
  
  ▼〜てはいけない（禁止）
  動詞て形 + はいけない（ません）
  ・食べます → 食べて + はいけない → 食べてはいけません
  ・飲む → 飲んで + はいけない → 飲んではいけません
  
  【丁寧さのバリエーション — Các mức độ lịch sự】
  許可（低→高）：
  〜てもいい → 〜てもいいです → 〜てもよいです → 〜てもよろしいです
  → 〜てもよろしいでしょうか（最も丁寧な質問形）
  
  禁止（弱→強）：
  〜てはだめ（口語）→ 〜てはいけません → 〜てはなりません（書き言葉・法律・規則）
  
  【介護現場での実践的フレーズ】
  ・利用者への許可付与：「もう食べてもいいですよ、お待たせしました」
  ・利用者から許可を求められた場合：「少し確認してから、大丈夫なら食べてもいいですよ」
  ・医師の指示を伝える（禁止）：「先生から、しばらくお風呂には入ってはいけないと言われています」
  ・規則を伝える（禁止）：「院内では喫煙してはいけません」`,
      quiz: {
        question: '医師から「手術後3日間は水分以外、口から食べてはいけない」と指示がありました。利用者様に正しく伝える文はどれですか？',
        options: [
          { id: 'a', text: '手術後3日間は、水以外は食べてもいいです。' },
          { id: 'b', text: '手術後3日間は、お水以外のものを口から食べてはいけません。先生のご指示です。' },
          { id: 'c', text: '手術後3日間は、何でも食べてもかまいません。' },
          { id: 'd', text: '手術後3日間は、食べてもいいですか？と先生に聞いてください。' },
        ],
        correctId: 'b',
        explanation: '「〜てはいけません」は禁止を伝える表現です。医師の指示として「水以外は食べてはいけない」という禁止内容を正確に伝えているbが正解です。さらに「先生のご指示です」と根拠を示すことで、利用者が納得しやすくなります。\n「〜てはいけません」truyền đạt sự cấm đoán. Câu b truyền đạt chính xác nội dung cấm là "ngoài nước ra không được ăn qua đường miệng" và bổ sung căn cứ "theo chỉ định bác sĩ" giúp người dùng dịch vụ dễ chấp nhận.',
      },
      xpReward: 25,
    },
  },

  // ===== N4 文法完全対策 レッスン18〜25 =====
  'n4-02-18': {
    courseTitle: { ja: 'N4 文法完全対策', vi: 'Ngữ pháp N4 toàn diện' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4文法: 〜なければならない / 〜なくてもいい',
      titleTranslation: 'Ngữ pháp N4: Bắt buộc phải làm / Không cần phải làm',
      introduction: `「〜なければならない」は義務・必要性を表す重要な表現です。介護現場では「記録しなければならない」「報告しなければならない」など、法律や職場ルールに基づく義務を述べるときに使います。一方、「〜なくてもいい」は「その必要はない」という許可・不要を表します。

「〜なければならない」là mẫu câu quan trọng diễn đạt nghĩa vụ và sự cần thiết. Trong điều dưỡng dùng để nêu nghĩa vụ dựa trên pháp luật hay quy định nơi làm việc như "phải ghi chép", "phải báo cáo". Ngược lại, 「〜なくてもいい」diễn đạt sự cho phép hay không cần thiết.`,
      keyPoints: [
        '【〜なければならない】接続: 動詞ない形 + ければならない / 意味: 〜する義務がある、〜しないといけない / 介護例: 記録しなければならない',
        '【〜なければいけない】接続: 動詞ない形 + ければいけない（ならないより口語的）/ 意味: 義務・必要（≒ならない）/ 介護例: 急いで報告しなければいけない',
        '【〜なくてはいけない】接続: 動詞ない形 + くてはいけない（会話でよく使う）/ 意味: 義務（口語）/ 介護例: 手を洗わなくてはいけない',
        '【〜なくてもいい】接続: 動詞ない形 + くてもいい / 意味: 〜する必要はない、〜しなくて許可 / 介護例: 急がなくてもいい',
        '【〜てもいい】接続: 動詞て形 + もいい / 意味: 〜してもよい（許可）/ 介護例: 休憩してもいいです',
        '【丁寧形の使い分け】〜なければなりません（書き言葉・正式）vs 〜なきゃいけない（口語）— 介護記録や報告書は丁寧形を使う',
      ],
      vocabulary: [
        { word: '記録する', reading: 'きろくする', meaning: '記録する（ghi chép）', example: 'ケア内容を記録しなければならない' },
        { word: '報告する', reading: 'ほうこくする', meaning: '報告する（báo cáo）', example: '異変を報告しなければならない' },
        { word: '確認する', reading: 'かくにんする', meaning: '確認する（xác nhận）', example: '薬の名前を確認しなければならない' },
        { word: '義務', reading: 'ぎむ', meaning: '義務（nghĩa vụ）', example: '介護士としての義務を果たす' },
        { word: '急ぐ', reading: 'いそぐ', meaning: '急ぐ（vội vàng）', example: '急がなくてもいいですよ' },
      ],
      examples: [
        { japanese: 'ケアの内容は毎回記録しなければなりません。', reading: 'けあのないようはまいかいきろくしなければなりません。', translation: 'Nội dung chăm sóc phải được ghi chép mỗi lần.' },
        { japanese: '転倒があった場合はすぐに上司に報告しなければなりません。', reading: 'てんとうがあったばあいはすぐにじょうしにほうこくしなければなりません。', translation: 'Khi có sự cố ngã, phải báo cáo ngay cho cấp trên.' },
        { japanese: '今日は無理しなくてもいいですよ。ゆっくり休んでください。', reading: 'きょうはむりしなくてもいいですよ。ゆっくりやすんでください。', translation: 'Hôm nay không cần cố quá đâu. Hãy nghỉ ngơi thoải mái nhé.' },
        { japanese: '薬は食後に飲まなければいけません。空腹時はいけません。', reading: 'くすりはしょくごにのまなければいけません。くうふくじはいけません。', translation: 'Phải uống thuốc sau bữa ăn. Khi đói không được uống.' },
      ],
      grammarNote: `【①形の作り方 — Cách cấu tạo】
動詞ない形 → ない→なければならない
・食べる → 食べない → 食べなければならない
・飲む　 → 飲まない → 飲まなければならない
・来る　 → 来ない　 → 来なければならない（不規則）
・する　 → しない　 → しなければならない

【②似た表現との違い — So sánh với mẫu tương tự】
〜なければならない：義務（中程度の強さ）、書き言葉・口語両方
〜べきだ：義務・当然（強い主張）、書き言葉的
〜といけない：義務（やや口語的）
〜なくてもいい：不要・許可（義務なし）⟵ 反対の意味

【③介護現場での活用 — Dùng trong điều dưỡng】
・記録義務：「ケア記録は当日中に記入しなければなりません」
・感染予防：「処置前後に手洗い・消毒をしなければなりません」
・利用者への声かけ：「無理しなくてもいいですよ」と安心させる表現`,
      quiz: {
        question: '「今日は体調が悪いので、入浴___。」利用者に対して、入浴の必要がないことを伝える場合、正しい形は？',
        options: [
          { id: 'a', text: 'しなければなりません' },
          { id: 'b', text: 'しなくてもいいです' },
          { id: 'c', text: 'してはいけません' },
          { id: 'd', text: 'してもいけません' },
        ],
        correctId: 'b',
        explanation: '「〜なくてもいい」は「〜する必要はない・〜しなくて構わない」という意味で許可・不要を表します。利用者に「無理しなくていい」と伝えるときに使います。\n「〜なくてもいい」có nghĩa "không cần phải làm" — diễn đạt sự cho phép không làm. Dùng khi nói với người dùng rằng "không cần cố".',
      },
      xpReward: 25,
    },
  },

  'n4-02-19': {
    courseTitle: { ja: 'N4 文法完全対策', vi: 'Ngữ pháp N4 toàn diện' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4文法: 〜ことができる / 〜ことができない',
      titleTranslation: 'Ngữ pháp N4: Có thể làm / Không thể làm',
      introduction: `「〜ことができる」は能力や可能性を表す重要な文法です。介護現場では「一人で歩くことができる」「食事を自分でとることができない」など、利用者さんの能力評価や日常観察の記録に頻繁に使います。潜在能力（できるかもしれない）と現実の能力を区別して使うことが大切です。

「〜ことができる」là ngữ pháp quan trọng diễn đạt năng lực hay khả năng. Trong điều dưỡng thường dùng để đánh giá năng lực và ghi chép quan sát hàng ngày như "có thể tự đi một mình", "không thể tự ăn". Điều quan trọng là phân biệt giữa năng lực tiềm ẩn và năng lực thực tế.`,
      keyPoints: [
        '【〜ことができる】接続: 動詞辞書形 + ことができる / 意味: 〜する能力・可能性がある / 介護例: 一人で歩くことができる',
        '【〜ことができない】接続: 動詞辞書形 + ことができない / 意味: 〜する能力・可能性がない / 介護例: 自力で立つことができない',
        '【可能形との違い】食べることができる ≒ 食べられる（可能形）— 「ことができる」はよりフォーマルで書き言葉的',
        '【能力評価の活用】ADL（日常生活動作）評価：「移動することができる」「食事を自分でとることができる」',
        '【〜ようになる（変化）との組み合わせ】「歩けるようになった」= 以前はできなかったが、今はできる（変化を強調）',
        '【否定：〜ことができなかった】「以前は自分で食べることができなかった、今はできる」— 変化の前後を比較するときに使う',
      ],
      vocabulary: [
        { word: '自力で', reading: 'じりきで', meaning: '自分の力で（tự mình）', example: '自力で歩くことができる' },
        { word: '移動する', reading: 'いどうする', meaning: '場所を移る（di chuyển）', example: '自力で移動することができる' },
        { word: '介助なし', reading: 'かいじょなし', meaning: '助けなし（không cần trợ giúp）', example: '介助なしで食事することができる' },
        { word: '能力', reading: 'のうりょく', meaning: '能力・スキル（năng lực）', example: '利用者の能力を評価する' },
        { word: '評価する', reading: 'ひょうかする', meaning: '判断・査定する（đánh giá）', example: 'ADLを評価することができる' },
      ],
      examples: [
        { japanese: '田中様は現在、介助なしで食事をとることができます。', reading: 'たなかさまはげんざい、かいじょなしでしょくじをとることができます。', translation: 'Hiện tại ông Tanaka có thể tự ăn mà không cần hỗ trợ.' },
        { japanese: '山田様は一人でトイレに行くことができません。介助が必要です。', reading: 'やまださまはひとりでといれにいくことができません。かいじょがひつようです。', translation: 'Bà Yamada không thể tự đi vệ sinh một mình. Cần có người hỗ trợ.' },
        { japanese: 'リハビリの結果、以前より長い距離を歩くことができるようになりました。', reading: 'りはびりのけっか、いぜんよりながいきょりをあるくことができるようになりました。', translation: 'Nhờ phục hồi chức năng, bây giờ có thể đi được quãng đường dài hơn trước.' },
        { japanese: '発語することができないため、筆談や指差しで意思を確認します。', reading: 'はつごすることができないため、ひつだんやゆびさしでいしをかくにんします。', translation: 'Do không thể nói được, chúng tôi xác nhận ý nguyện bằng viết tay hoặc chỉ ngón tay.' },
      ],
      grammarNote: `【①形の作り方 — Cách cấu tạo】
動詞辞書形 + ことができる / ことができない
・食べる → 食べることができる / 食べることができない
・歩く　 → 歩くことができる / 歩くことができない
・話す　 → 話すことができる / 話すことができない

【②可能形との比較 — So sánh với thể khả năng】
「食べることができる」(formal, writing) ≈「食べられる」(potential form)
「歩くことができない」(formal)           ≈「歩けない」(spoken)
→ 介護記録・ケアプランには「〜ことができる/できない」を使う方が丁寧

【③介護現場でのADL評価記録 — Đánh giá ADL trong điều dưỡng】
・「自力で起き上がることができる（○）/ できない（×）/ 一部介助（△）」
・ケアプランや申し送りには「〜することができる」の形式が多用される
・能力変化の記録：「以前はできなかったが、現在はできるようになった」`,
      quiz: {
        question: '「利用者さんは一人でベッドから（　）。」介護記録に「起き上がれない」を記録する正しい表現は？',
        options: [
          { id: 'a', text: '起き上がることができません' },
          { id: 'b', text: '起き上がるべきではありません' },
          { id: 'c', text: '起き上がらなければなりません' },
          { id: 'd', text: '起き上がってもいいです' },
        ],
        correctId: 'a',
        explanation: '「〜ことができない」は能力の不可を表します。介護記録では「〜することができません/できない」という形でADL（日常生活動作）の状態を記録します。\n「〜ことができない」diễn đạt việc không có khả năng. Trong ghi chép điều dưỡng, ghi trạng thái ADL bằng dạng "không thể làm...".',
      },
      xpReward: 25,
    },
  },

  'n4-02-20': {
    courseTitle: { ja: 'N4 文法完全対策', vi: 'Ngữ pháp N4 toàn diện' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4文法: 〜ようになる / 〜ようにする',
      titleTranslation: 'Ngữ pháp N4: Trở nên... / Cố để...',
      introduction: `「〜ようになる」は変化の結果を表します。以前はできなかったことが今できるようになった、あるいは以前はしなかったことが今するようになったという変化を表すときに使います。「〜ようにする」は意図的な努力や習慣を表し、「〜するよう心がける」という意味で使われます。

「〜ようになる」diễn đạt kết quả của sự thay đổi — trước đây không làm được mà bây giờ làm được, hoặc trước đây không làm mà bây giờ làm. 「〜ようにする」diễn đạt nỗ lực có chủ đích hoặc thói quen, nghĩa là "cố gắng để làm điều gì đó".`,
      keyPoints: [
        '【〜ようになる】接続: 動詞辞書形/ない形 + ようになる / 意味: 変化の結果（以前と今の違い）/ 介護例: 歩けるようになった',
        '【〜ようにする】接続: 動詞辞書形/ない形 + ようにする / 意味: 意図的な努力・目標行動 / 介護例: 転ばないようにする',
        '【変化のニュアンス】「〜ようになる」は自然な変化・プロセス、「〜ようにする」は意識的な努力・工夫',
        '【否定形との組み合わせ】「話さないようになった」（話さなくなった変化）/ 「転ばないようにする」（転倒防止の努力）',
        '【リハビリ文脈での使い方】「以前は立てなかったが、リハビリで立てるようになりました」（成果の報告）',
        '【依頼・指示形】「〜ようにしてください」= Hãy cố gắng làm... （利用者や家族への指示）',
      ],
      vocabulary: [
        { word: '歩く', reading: 'あるく', meaning: '歩く（đi bộ）', example: '一人で歩けるようになった' },
        { word: '転ぶ', reading: 'ころぶ', meaning: '転ぶ（ngã）', example: '転ばないようにする' },
        { word: 'リハビリ', reading: 'りはびり', meaning: 'リハビリテーション（phục hồi chức năng）', example: 'リハビリで回復するようになった' },
        { word: '水分', reading: 'すいぶん', meaning: '水分（nước）', example: '水分をとるようにする' },
        { word: '声かけ', reading: 'こえかけ', meaning: '声をかけること（lên tiếng hỏi thăm）', example: '声かけするようにしている' },
      ],
      examples: [
        { japanese: 'リハビリの結果、田中様は自力で立てるようになりました。', reading: 'りはびりのけっか、たなかさまはじりきでたてるようになりました。', translation: 'Nhờ phục hồi chức năng, ông Tanaka đã có thể tự đứng được.' },
        { japanese: '廊下には手すりをつけて、転ばないようにしています。', reading: 'ろうかにはてすりをつけて、ころばないようにしています。', translation: 'Đã lắp tay vịn ở hành lang để tránh bị ngã.' },
        { japanese: '食事中は必ず声かけするようにしてください。', reading: 'しょくじちゅうはかならずこえかけするようにしてください。', translation: 'Hãy cố gắng luôn lên tiếng hỏi thăm trong bữa ăn.' },
        { japanese: '薬を飲み忘れないようにするため、食後に薬箱を目立つ場所に置きます。', reading: 'くすりをのみわすれないようにするため、しょくごにくすりばこをめだつばしょにおきます。', translation: 'Để tránh quên uống thuốc, đặt hộp thuốc ở nơi dễ thấy sau bữa ăn.' },
      ],
      grammarNote: `【①形の作り方 — Cách cấu tạo】
〜ようになる: 動詞辞書形/ない形 + ようになる
・食べる → 食べるようになる（肯定変化）
・食べない → 食べないようになる（否定変化）
〜ようにする: 動詞辞書形/ない形 + ようにする
・確認する → 確認するようにする（努力・習慣）
・忘れない → 忘れないようにする（防止の努力）

【②〜ようになる vs 〜くなる の違い】
「〜くなる」: い形容詞の変化（元気になる・暖かくなる）
「〜ようになる」: 動詞・能力の変化（歩けるようになる・話すようになる）

【③介護現場での使い分け】
・変化の報告（申し送り）：「以前は食べられなかったが、食べられるようになった」
・安全対策の説明：「転倒しないよう、ベッドの高さを調整するようにしている」
・利用者への指示：「水分を多くとるようにしてください」`,
      quiz: {
        question: '「鈴木様はリハビリを続けた結果、以前は歩けなかったが、今は短い距離なら（　）。」適切な表現は？',
        options: [
          { id: 'a', text: '歩くようにしました' },
          { id: 'b', text: '歩けるようになりました' },
          { id: 'c', text: '歩かないようにしました' },
          { id: 'd', text: '歩けばよかった' },
        ],
        correctId: 'b',
        explanation: '「〜ようになる」は変化の結果を表します。以前はできなかったことが今できるようになったという変化に使います。「〜ようにする」は努力・意図を表すため、ここでは不正解です。\n「〜ようになる」diễn đạt kết quả thay đổi — trước không làm được, bây giờ làm được. 「〜ようにする」diễn đạt nỗ lực nên không đúng ở đây.',
      },
      xpReward: 25,
    },
  },

  'n4-02-21': {
    courseTitle: { ja: 'N4 文法完全対策', vi: 'Ngữ pháp N4 toàn diện' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4文法: 〜てほしい / 〜てもらう',
      titleTranslation: 'Ngữ pháp N4: Muốn ai đó làm / Nhờ ai đó làm',
      introduction: `「〜てほしい」は話者が相手に何かをしてほしいという希望を表します。「〜てもらう」は誰かに行動してもらってそれを受け取るという意味で、恩恵を受ける側の視点で使います。介護現場では「来てほしい」「手伝ってもらう」など、職員間の依頼やチームワークの表現として重要です。

「〜てほしい」diễn đạt mong muốn người khác làm gì đó. 「〜てもらう」có nghĩa nhờ ai đó hành động và nhận lấy hành động đó, dùng từ góc nhìn người được hưởng lợi. Trong điều dưỡng, đây là mẫu câu quan trọng cho việc nhờ vả và làm việc nhóm.`,
      keyPoints: [
        '【〜てほしい】接続: 動詞て形 + ほしい / 意味: 相手に〜してほしいという話者の希望 / 介護例: 来てほしい・協力してほしい',
        '【〜てもらう】接続: 動詞て形 + もらう / 意味: 他者が行為をして、自分がその恩恵を受ける / 介護例: 手伝ってもらう・確認してもらう',
        '【〜ていただく】〜てもらうの敬語形（上司・先輩への依頼）/ 介護例: 先生に診ていただく・師長に確認していただく',
        '【〜てくれる vs 〜てもらう】視点の違い：くれる（相手が主体）/ もらう（自分が主体・恩恵を受ける側）',
        '【否定希望】〜ないでほしい = 〜しないでほしい（例：急がないでほしい）',
        '【丁寧な依頼】〜てもらえますか / 〜ていただけますか（より丁寧な依頼形）',
      ],
      vocabulary: [
        { word: '協力する', reading: 'きょうりょくする', meaning: '一緒に力を合わせる（hợp tác）', example: '協力してほしい' },
        { word: '手伝う', reading: 'てつだう', meaning: '助ける（giúp đỡ）', example: '手伝ってもらう' },
        { word: '確認する', reading: 'かくにんする', meaning: 'チェックする（xác nhận）', example: '確認してもらう' },
        { word: '付き添う', reading: 'つきそう', meaning: '一緒にいる（đi kèm, hộ tống）', example: '病院に付き添ってもらう' },
        { word: '連絡する', reading: 'れんらくする', meaning: '知らせる（liên lạc）', example: '家族に連絡してほしい' },
      ],
      examples: [
        { japanese: '今日は忙しいので、誰かに食事の介助を手伝ってもらえますか？', reading: 'きょうはいそがしいので、だれかにしょくじのかいじょをてつだってもらえますか？', translation: 'Hôm nay bận quá, có ai có thể giúp tôi hỗ trợ bữa ăn không?' },
        { japanese: '急変があったので、すぐに来てほしいと思います。', reading: 'きゅうへんがあったので、すぐにきてほしいとおもいます。', translation: 'Có sự cố đột biến nên tôi muốn người đến ngay.' },
        { japanese: '先生に処置の内容を確認していただきました。', reading: 'せんせいにしょちのないようをかくにんしていただきました。', translation: 'Tôi đã nhờ bác sĩ xác nhận nội dung xử lý.' },
        { japanese: '転倒報告書を書いてもらえますか？今日の当番の方に頼んでください。', reading: 'てんとうほうこくしょをかいてもらえますか？きょうのとうばんのかたにたのんでください。', translation: 'Bạn có thể viết báo cáo té ngã không? Hãy nhờ người trực hôm nay.' },
      ],
      grammarNote: `【①形の作り方 — Cách cấu tạo】
〜てほしい: 動詞て形 + ほしい
・来る → 来て + ほしい = 来てほしい
・確認する → 確認して + ほしい = 確認してほしい
〜てもらう: 動詞て形 + もらう
・手伝う → 手伝って + もらう = 手伝ってもらう（平）
・確認する → 確認して + いただく = 確認していただく（敬語）

【②〜てほしい vs 〜てもらいたい】
〜てほしい: 希望（やや直接的）
〜てもらいたい: 希望（やや丁寧）
〜ていただけると助かります: 最も丁寧な依頼

【③介護現場での使い分け】
・同僚への依頼：「手伝ってもらえる？」「〜してほしいんだけど」
・上司・医師への依頼：「確認していただけますか」「診ていただけますか」
・利用者家族への依頼：「ご協力いただけますか」「付き添っていただけますか」`,
      quiz: {
        question: '上司（師長）に記録を確認してもらうとき、最も適切な表現は？',
        options: [
          { id: 'a', text: '確認してほしいです' },
          { id: 'b', text: '確認してもらってください' },
          { id: 'c', text: '確認していただけますか' },
          { id: 'd', text: '確認してあげてください' },
        ],
        correctId: 'c',
        explanation: '上司や目上の人への依頼には「〜ていただく」（てもらうの敬語形）を使います。「〜ていただけますか」は丁寧な依頼表現です。「〜てほしい」は対等・目下への表現で上司には使いません。\nKhi nhờ cấp trên, dùng「〜ていただく」(kính ngữ của もらう).「〜ていただけますか」là biểu đạt nhờ vả lịch sự.',
      },
      xpReward: 25,
    },
  },

  'n4-02-22': {
    courseTitle: { ja: 'N4 文法完全対策', vi: 'Ngữ pháp N4 toàn diện' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4文法: 〜させる / 〜させてもらう（使役形）',
      titleTranslation: 'Ngữ pháp N4: Thể sai khiến / Cho phép làm',
      introduction: `使役形「〜させる」は「誰かに〜させる（させてあげる）」、つまり行為をさせる側の視点で使います。介護現場では「利用者に休ませる」「手を洗わせる」など、ケア提供者が働きかけを行う場面で使われます。「〜させてもらう」は許可を得て自分が行動する謙虚な表現で、「確認させてもらう」などの職場表現に多く使われます。

Thể sai khiến「〜させる」dùng từ góc nhìn người khiến người khác làm việc gì đó. Trong điều dưỡng dùng khi nhân viên tác động như "cho người dùng nghỉ ngơi", "cho rửa tay". 「〜させてもらう」là biểu đạt khiêm tốn khi được phép tự mình hành động, thường dùng trong môi trường làm việc như "để tôi xác nhận".`,
      keyPoints: [
        '【〜させる（使役）】接続: 動詞ない形のな→させる / 意味: 誰かに〜させる（強制・許可どちらも）/ 介護例: 休ませる・手を洗わせる',
        '【〜させてあげる】接続: 〜させてあげる / 意味: 相手のために〜させてあげる（許可の恩恵）/ 介護例: 好きな音楽を聴かせてあげる',
        '【〜させてもらう】接続: 動詞使役形 + てもらう / 意味: 許可を得て自分が行動する（謙虚）/ 介護例: 確認させてもらう・先に帰らせてもらう',
        '【〜させていただく】〜させてもらうの敬語形 / 意味: より丁寧な許可を得た行動 / 介護例: 担当させていただきます',
        '【使役形の作り方】グループ1: く→かせる、ぐ→がせる、む→ませる / グループ2: る→させる / 不規則: する→させる、来る→来させる',
        '【注意】使役は命令・強制のニュアンスになりやすいので、介護では「〜させていただく・〜させてください」の形で柔らかく使う',
      ],
      vocabulary: [
        { word: '休む', reading: 'やすむ', meaning: '休む（nghỉ ngơi）', example: '利用者を休ませる' },
        { word: '確認する', reading: 'かくにんする', meaning: '確認する（xác nhận）', example: '確認させてもらう' },
        { word: '担当する', reading: 'たんとうする', meaning: '担当する（phụ trách）', example: '担当させていただきます' },
        { word: '説明する', reading: 'せつめいする', meaning: '説明する（giải thích）', example: '説明させていただきます' },
        { word: '手を洗う', reading: 'てをあらう', meaning: '手を洗う（rửa tay）', example: '処置前に手を洗わせる' },
      ],
      examples: [
        { japanese: '処置の前に必ず手を洗わせてください。感染予防のためです。', reading: 'しょちのまえにかならずてをあらわせてください。かんせんよぼうのためです。', translation: 'Trước khi xử lý, nhất thiết hãy cho rửa tay. Để phòng ngừa lây nhiễm.' },
        { japanese: '田中様は体調が悪いので、今日は部屋で休ませていただきます。', reading: 'たなかさまはたいちょうがわるいので、きょうはへやでやすませていただきます。', translation: 'Vì ông Tanaka không khỏe, hôm nay để ông nghỉ trong phòng.' },
        { japanese: '記録の内容を確認させてもらってもいいですか？', reading: 'きろくのないようをかくにんさせてもらってもいいですか？', translation: 'Tôi có thể xem qua nội dung ghi chép không?' },
        { japanese: '今月から山田様の担当をさせていただくことになりました。よろしくお願いします。', reading: 'こんげつからやまださまのたんとうをさせていただくことになりました。よろしくおねがいします。', translation: 'Từ tháng này tôi sẽ phụ trách bà Yamada. Rất mong được hợp tác.' },
      ],
      grammarNote: `【①使役形の作り方 — Cách chia thể sai khiến】
グループ1（五段動詞）: ない形のな→させる
・飲む → 飲ま + させる = 飲ませる
・洗う → 洗わ + させる = 洗わせる
・書く → 書か + させる = 書かせる
グループ2（一段動詞）: る→させる
・食べる → 食べ + させる = 食べさせる
・起きる → 起き + させる = 起きさせる
不規則動詞:
・する → させる
・来る → 来させる（こさせる）

【②〜させる vs 〜させてもらう の違い】
〜させる: 他者に行為をさせる（強制・許可）、主体は話者
〜させてもらう: 許可を得て自分が行動（謙虚）、主体は話者

【③介護現場での適切な使い方 — Dùng phù hợp trong điều dưỡng】
・利用者への強制はNG、「〜しませんか」「〜してもいいですか」で柔らかく
・職場での自己PR：「担当させていただきます」「確認させてください」
・ミス報告：「確認させていただけますか」（丁寧な再確認の依頼）`,
      quiz: {
        question: '新しい担当者として利用者さんに自己紹介するとき、最も適切な表現は？',
        options: [
          { id: 'a', text: '今日から担当します' },
          { id: 'b', text: '今日から担当させていただきます' },
          { id: 'c', text: '今日から担当させます' },
          { id: 'd', text: '今日から担当してもらいます' },
        ],
        correctId: 'b',
        explanation: '「〜させていただく」は許可を得て自分が行動するという謙虚な表現です。新しい担当者として利用者に挨拶するときは、敬語・謙虚な姿勢を示すために「〜させていただきます」を使います。\n「〜させていただく」là biểu đạt khiêm tốn khi được phép hành động. Khi chào hỏi với tư cách người phụ trách mới, dùng để thể hiện thái độ kính trọng.',
      },
      xpReward: 25,
    },
  },

  'n4-02-23': {
    courseTitle: { ja: 'N4 文法完全対策', vi: 'Ngữ pháp N4 toàn diện' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4文法: 受身形 〜られる（受動態）',
      titleTranslation: 'Ngữ pháp N4: Thể bị động 〜られる',
      introduction: `受身形（受動態）は「〜される・〜られる」の形で、動作を受ける側の視点を表します。介護の報告書では「転倒させられた」「頼まれた」「怒られた」のように出来事を客観的に記述するために多く使われます。また「〜される」「〜られる」は迷惑・被害のニュアンスを表すこともあります。

Thể bị động dùng dạng「〜される・〜られる」, diễn đạt góc nhìn của người nhận hành động. Trong báo cáo điều dưỡng thường dùng để mô tả sự việc một cách khách quan như "bị ngã", "được nhờ", "bị mắng". Ngoài ra「〜される・〜られる」cũng có thể mang sắc thái phiền não hay thiệt hại.`,
      keyPoints: [
        '【受身形の意味①: 直接受身】接続: 動詞ない形のな→れる（G1）/ られる（G2）/ 意味: 〜される（行為を受ける）/ 介護例: 頼まれた・呼ばれた',
        '【受身形の意味②: 迷惑受身】接続: 同じ形 / 意味: 被害・迷惑のニュアンス / 介護例: 利用者に怒られた・蹴られた',
        '【受身形の意味③: 書き言葉・客観記述】意味: 報告書・記録の客観的記述 / 介護例: 転倒が確認された・投薬が行われた',
        '【動作主の表示】能動: 〜が〜する　受身: 〜に〜される（動作主は「に」で示す）',
        '【受身形の作り方】グループ1: く→かれる、ぐ→がれる、む→まれる / グループ2: る→られる / 不規則: する→される、来る→来られる',
        '【注意】「られる」は可能・受身・尊敬と3つの意味があるため文脈で判断する',
      ],
      vocabulary: [
        { word: '頼む', reading: 'たのむ', meaning: '頼む（nhờ vả）', example: '上司に頼まれた' },
        { word: '叱る', reading: 'しかる', meaning: '怒る・叱る（mắng）', example: '記録を忘れて叱られた' },
        { word: '転倒する', reading: 'てんとうする', meaning: '転ぶ（ngã）', example: '廊下で転倒させられた' },
        { word: '確認する', reading: 'かくにんする', meaning: '確認する（xác nhận）', example: 'ケアプランが確認された' },
        { word: '感謝する', reading: 'かんしゃする', meaning: '感謝する（cảm ơn）', example: '利用者に感謝された' },
      ],
      examples: [
        { japanese: '田中様に「ありがとう」と言われて、とてもうれしかったです。', reading: 'たなかさまに「ありがとう」といわれて、とてもうれしかったです。', translation: 'Khi ông Tanaka nói "cảm ơn" với tôi, tôi rất vui.' },
        { japanese: '夜間に利用者さんに呼ばれて、対応しました。', reading: 'やかんにりようしゃさんによばれて、たいおうしました。', translation: 'Ban đêm người dùng gọi tôi và tôi đã xử lý.' },
        { japanese: '廊下で転倒が確認されたため、すぐに報告しました。', reading: 'ろうかでてんとうがかくにんされたため、すぐにほうこくしました。', translation: 'Vì phát hiện sự cố ngã ở hành lang, đã báo cáo ngay.' },
        { japanese: '記録の書き忘れについて、師長に注意された。次回から気をつけます。', reading: 'きろくのかきわすれについて、しちょうにちゅういされた。じかいからきをつけます。', translation: 'Tôi bị trưởng ca nhắc nhở về việc quên ghi chép. Từ lần sau sẽ chú ý hơn.' },
      ],
      grammarNote: `【①受身形の作り方 — Cách chia thể bị động】
グループ1（五段動詞）: ない形のな→れる
・頼む → 頼ま + れる = 頼まれる
・呼ぶ → 呼ば + れる = 呼ばれる
・叱る → 叱ら + れる = 叱られる
グループ2（一段動詞）: る→られる
・食べる → 食べ + られる = 食べられる
不規則:
・する → される
・来る → 来られる（こられる）

【②「に〜れる/られる」 vs 「が〜れる/られる」】
動作主が人: に（例：師長に注意された）
動作主が事物・現象: が（例：ケアプランが確認された）

【③介護記録での受身の使い方 — Thể bị động trong ghi chép điều dưỡng】
・客観的な報告：「〜が確認された」「〜が行われた」
・出来事の記述：「利用者により〜された」（迷惑受身）
・敬語としての受身：「先生が来られた」（尊敬）— 文脈で判断`,
      quiz: {
        question: '「（　）様の部屋から大きな声が（　）、すぐに確認しに行きました。」正しい受身の組み合わせは？',
        options: [
          { id: 'a', text: '鈴木 / 聞こえて' },
          { id: 'b', text: '鈴木 / 聞かれて' },
          { id: 'c', text: '鈴木 / 聞かせて' },
          { id: 'd', text: '鈴木 / 聞いて' },
        ],
        correctId: 'b',
        explanation: '受身形「聞かれる」は「聞く→聞か+れる」です。大きな声が聞こえた・聞かれた（知覚された）という状況を客観的に記述しています。ただし自然な日本語では「聞こえて」も使いますが、受身の練習としては「聞かれて」が正解です。\nThể bị động「聞かれる」= được nghe thấy — mô tả khách quan tình huống nghe thấy tiếng to.',
      },
      xpReward: 25,
    },
  },

  'n4-02-24': {
    courseTitle: { ja: 'N4 文法完全対策', vi: 'Ngữ pháp N4 toàn diện' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4文法: 〜ていただく / 〜てくれる / 〜てあげる（授受表現）',
      titleTranslation: 'Ngữ pháp N4: Nhận ơn / Nhận từ ai / Cho ai',
      introduction: `授受動詞（〜てあげる・〜てくれる・〜てもらう・〜ていただく）は、行為の「やりとり」と視点を表す重要な文法です。介護現場では「食事を手伝ってあげる」「利用者に感謝していただく」「家族に説明してもらう」など、ケア関係の中での行為の流れを正確に表すために不可欠です。

Động từ trao nhận diễn đạt "trao đổi" hành động và góc nhìn. Trong điều dưỡng không thể thiếu để diễn đạt chính xác dòng chảy hành động trong quan hệ chăm sóc như "giúp ăn", "được người dùng cảm ơn", "nhờ gia đình giải thích".`,
      keyPoints: [
        '【〜てあげる】接続: 動詞て形 + あげる / 意味: 自分（側）が相手のために行為をする（恩恵を与える視点）/ 介護例: 荷物を持ってあげる',
        '【〜てくれる】接続: 動詞て形 + くれる / 意味: 相手が自分（側）のために行為をする（恩恵を受ける視点、主体は相手）/ 介護例: 利用者が笑顔で答えてくれた',
        '【〜てもらう】接続: 動詞て形 + もらう / 意味: 自分が相手に行為をしてもらう（恩恵を受ける視点、主体は自分）/ 介護例: 家族に協力してもらう',
        '【〜ていただく】〜てもらうの敬語形 / 意味: 目上の人から恩恵を受ける / 介護例: 医師に診ていただく・師長に指示していただく',
        '【視点の整理】あげる：自→他への恩恵 / くれる：他→自への恩恵（相手主体）/ もらう：他→自への恩恵（自分主体）',
        '【注意】「〜てあげる」は上から目線に聞こえることがあるため、利用者に対しては「〜しましょうか」「〜してもいいですか」の方が丁寧',
      ],
      vocabulary: [
        { word: '荷物を持つ', reading: 'にもつをもつ', meaning: '荷物を持つ（mang hành lý）', example: '荷物を持ってあげる' },
        { word: '笑顔で答える', reading: 'えがおでこたえる', meaning: '笑顔で返事する（trả lời với nụ cười）', example: '利用者が笑顔で答えてくれた' },
        { word: '協力する', reading: 'きょうりょくする', meaning: '協力する（hợp tác）', example: '家族に協力してもらう' },
        { word: '指示する', reading: 'しじする', meaning: '指示する（chỉ thị）', example: '医師に指示していただく' },
        { word: '感謝する', reading: 'かんしゃする', meaning: '感謝する（cảm ơn）', example: '利用者に感謝していただく' },
      ],
      examples: [
        { japanese: '田中様の荷物が重そうだったので、一緒に持ってあげました。', reading: 'たなかさまのにもつがおもそうだったので、いっしょにもってあげました。', translation: 'Vì hành lý của ông Tanaka có vẻ nặng nên tôi đã cùng xách giúp.' },
        { japanese: '利用者さんが「ありがとう」と言って笑顔を見せてくれました。', reading: 'りようしゃさんが「ありがとう」といってえがおをみせてくれました。', translation: 'Người dùng nói "cảm ơn" và nở nụ cười với tôi.' },
        { japanese: 'ご家族に今日の様子を説明していただきました。', reading: 'ごかぞくにきょうのようすをせつめいしていただきました。', translation: 'Tôi đã nhờ gia đình giải thích tình trạng hôm nay.' },
        { japanese: '医師に薬の量を変えていただくよう、師長にお伝えしました。', reading: 'いしにくすりのりょうをかえていただくよう、しちょうにおつたえしました。', translation: 'Tôi đã báo trưởng ca để nhờ bác sĩ thay đổi liều lượng thuốc.' },
      ],
      grammarNote: `【①授受動詞の視点まとめ — Tổng hợp góc nhìn động từ trao nhận】
あげる系：自分→相手・第三者 (自分が主体で恩恵を与える)
・てあげる：食事を手伝ってあげる（私が利用者を助ける）
・てさしあげる：〜てあげるの敬語（目上への控えめな恩恵、あまり使わない）

くれる系：相手→自分・身内 (相手が主体で自分が恩恵を受ける)
・てくれる：利用者が笑顔を見せてくれた（利用者が主体）
・てくださる：くれるの敬語（目上→自分への恩恵）

もらう系：自分が恩恵を受ける (自分が主体で恩恵を受ける)
・てもらう：家族に来てもらう（私が主体・恩恵を受ける）
・ていただく：もらうの敬語（目上に恩恵をいただく）

【②介護現場の使い分け — Phân biệt dùng trong điều dưỡng】
・同僚との会話：「手伝ってくれた」「手伝ってもらった」（どちらも自然）
・利用者への説明：「〜てあげる」より「〜しましょうか」が丁寧
・上司・医師への依頼：必ず「〜ていただく・〜てくださる」系を使う`,
      quiz: {
        question: '「医師に処方を変えてもらいたい」を丁寧な敬語にした場合、正しい表現は？',
        options: [
          { id: 'a', text: '医師に処方を変えてくれますか' },
          { id: 'b', text: '医師に処方を変えていただけますか' },
          { id: 'c', text: '医師に処方を変えてあげますか' },
          { id: 'd', text: '医師に処方を変えてもらいますか' },
        ],
        correctId: 'b',
        explanation: '医師など目上の人に何かをしてもらうときは「〜ていただく」（てもらうの敬語形）を使います。「〜ていただけますか」は疑問形にした丁寧な依頼表現です。「〜てくれる」は対等・目下への表現で医師には使いません。\nKhi nhờ bác sĩ (cấp trên) dùng「〜ていただく」(kính ngữ của もらう).「〜ていただけますか」là biểu đạt nhờ vả lịch sự.',
      },
      xpReward: 25,
    },
  },

  'n4-02-25': {
    courseTitle: { ja: 'N4 文法完全対策', vi: 'Ngữ pháp N4 toàn diện' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4文法 総復習テスト — 第2章まとめ',
      titleTranslation: 'Bài kiểm tra tổng ôn N4 Ngữ pháp — Tổng kết chương 2',
      introduction: `第2章（n4-02シリーズ）の総復習テストです。「〜てしまう」「〜たら・〜ば・〜なら」「〜そうだ・〜らしい・〜ようだ」「〜なければならない」「〜させる・〜られる」の5つの重要文法ポイントを確認します。介護・医療の文脈で正確に使い分けられるようになることが目標です。

Đây là bài kiểm tra tổng ôn chương 2 (series n4-02). Kiểm tra 5 điểm ngữ pháp quan trọng: 「〜てしまう」「〜たら・〜ば・〜なら」「〜そうだ・〜らしい・〜ようだ」「〜なければならない」「〜させる・〜られる」. Mục tiêu là có thể phân biệt và sử dụng chính xác trong bối cảnh điều dưỡng và y tế.`,
      keyPoints: [
        '【復習①〜てしまう】完了（ぜんぶ食べてしまった）/ 後悔・意図しない結果（転倒させてしまった）',
        '【復習②〜たら/ば/なら】仮定・条件：たら（出来事後）/ ば（一般条件）/ なら（情報・前提に基づく）',
        '【復習③〜そうだ/らしい/ようだ】情報源：そうだ（伝聞・様態）/ らしい（間接情報）/ ようだ（様子・推測）',
        '【復習④〜なければならない】義務・必要：〜しなければならない vs 〜なくてもいい（不要）',
        '【復習⑤〜させる/〜られる】使役（させる：誰かにさせる）/ 受身（られる：誰かにされる）の形と意味の区別',
        '各文法は介護現場の文脈（記録・報告・声かけ・ケア説明）で正確に使えるよう練習する',
      ],
      vocabulary: [
        { word: '総復習', reading: 'そうふくしゅう', meaning: '全体の復習（ôn tập tổng hợp）', example: '第2章の総復習テスト' },
        { word: '文法', reading: 'ぶんぽう', meaning: '文法（ngữ pháp）', example: 'N4文法をマスターする' },
        { word: '義務', reading: 'ぎむ', meaning: '義務（nghĩa vụ）', example: '記録する義務がある' },
        { word: '使役', reading: 'しえき', meaning: '使役（thể sai khiến）', example: '使役形を正しく使う' },
        { word: '受身', reading: 'うけみ', meaning: '受身（thể bị động）', example: '受身形で出来事を記述する' },
      ],
      examples: [
        { japanese: '薬を飲み忘れてしまいました。（〜てしまう：後悔）', reading: 'くすりをのみわすれてしまいました。', translation: 'Tôi đã quên uống thuốc mất. (〜てしまう: hối tiếc)' },
        { japanese: '熱があるなら、今日の入浴はやめましょう。（〜なら：情報を前提とした提案）', reading: 'ねつがあるなら、きょうのにゅうよくはやめましょう。', translation: 'Nếu có sốt, hôm nay thôi không tắm nha. (〜なら: đề xuất dựa trên thông tin)' },
        { japanese: '田中様は体調が悪そうです。（〜そうだ：様態）', reading: 'たなかさまはたいちょうがわるそうです。', translation: 'Ông Tanaka có vẻ không khỏe. (〜そうだ: trông có vẻ)' },
        { japanese: '処置前に手を洗わせていただきます。（使役〜させていただく）', reading: 'しょちまえにてをあらわせていただきます。', translation: 'Tôi xin phép rửa tay trước khi xử lý. (sai khiến 〜させていただく)' },
      ],
      grammarNote: `【第2章 文法まとめ表 — Bảng tổng kết ngữ pháp chương 2】
① てしまう：完了・後悔（食べてしまう / 転んでしまった）
② たら/ば/なら：仮定条件（熱が出たら / 元気なら）
③ そうだ/らしい/ようだ：伝聞・推測・様態
④ なければならない：義務（記録しなければならない）/ なくてもいい：不要
⑤ させる（使役）/ られる（受身）：形と意味の区別

【スコア目標】
5問中4問以上正解でXP +50、第3章へ進める
全問正解で追加バッジ獲得`,
      quizzes: [
        {
          question: '「転倒報告書を書き（　）て、師長に叱られた。」括弧に入る正しい表現は？',
          options: [
            { id: 'a', text: '忘れてしまっ' },
            { id: 'b', text: '忘れてくれ' },
            { id: 'c', text: '忘れさせられ' },
            { id: 'd', text: '忘れさせ' },
          ],
          correctId: 'a',
          explanation: '「〜てしまう」は意図しないミスや後悔を表します。「書き忘れてしまって」= 書くのを忘れてしまったことへの後悔。「師長に叱られた」は受身形で迷惑受身を表しています。\n「〜てしまう」diễn đạt lỗi không cố ý hoặc hối tiếc. "Đã lỡ quên viết" = hối tiếc về việc quên viết.',
          difficulty: 'easy' as const,
        },
        {
          question: '「もし利用者さんの体調が急に悪く（　）、すぐにナースを呼んでください。」正しい仮定条件は？',
          options: [
            { id: 'a', text: 'なりようなら' },
            { id: 'b', text: 'なったら' },
            { id: 'c', text: 'なれば' },
            { id: 'd', text: 'なるなら' },
          ],
          correctId: 'b',
          explanation: '「〜たら」は出来事が起きた後の条件・仮定を表します。「体調が急に悪くなったら（その出来事が発生した後に）、すぐに呼んでください」という流れに合います。〜ならは情報・前提に基づく条件で、まだ起きていない急変には自然でない場合があります。\n「〜たら」diễn đạt điều kiện/giả định sau khi sự việc xảy ra — phù hợp với tình huống khẩn cấp.',
          difficulty: 'medium' as const,
        },
        {
          question: '「田中様は顔色が悪く、熱が出（　）。体温を測ってみます。」様態（見た目の印象）を表す正しい表現は？',
          options: [
            { id: 'a', text: 'たそうだ' },
            { id: 'b', text: 'るらしい' },
            { id: 'c', text: 'そうだ' },
            { id: 'd', text: 'ようにする' },
          ],
          correctId: 'c',
          explanation: '様態の「〜そうだ」は、見た目・様子から推測するときに動詞/形容詞語幹 + そうだ の形で使います。「熱が出そうだ」= 見た目から発熱しそうな様子。「〜らしい」は他からの間接情報、「〜ようだ」は状況証拠からの推測に使います。\n「〜そうだ」(様態) dùng để suy đoán từ vẻ ngoài. "Có vẻ sắp sốt" = nhận xét từ trông bề ngoài.',
          difficulty: 'medium' as const,
        },
        {
          question: '介護士として、ケア記録は必ず書かなければなりません。この義務を「不要」に言い換えた場合の表現は？',
          options: [
            { id: 'a', text: '書かなくてもいい' },
            { id: 'b', text: '書いてはいけない' },
            { id: 'c', text: '書くべきだ' },
            { id: 'd', text: '書かなければならない' },
          ],
          correctId: 'a',
          explanation: '「〜なくてもいい」は「〜する必要はない・〜しなくて構わない」という不要・許可の表現です。「〜なければならない」（義務）の反対の意味になります。「〜てはいけない」は禁止なので不正解。\n「〜なくてもいい」= không cần phải làm — ngược nghĩa với 「〜なければならない」(nghĩa vụ).',
          difficulty: 'easy' as const,
        },
        {
          question: '「師長に記録の書き方を（　）、やっとコツがわかりました。」使役・受身・授受の適切な表現は？',
          options: [
            { id: 'a', text: '教えさせられて' },
            { id: 'b', text: '教えてもらって' },
            { id: 'c', text: '教えさせて' },
            { id: 'd', text: '教えてあげて' },
          ],
          correctId: 'b',
          explanation: '「〜てもらう」は自分が相手の行為から恩恵を受けるという表現。「師長に教えてもらった」= 師長が教えてくれた（自分が主体で恩恵を受ける）。「教えさせられた」は強制受身（無理やりさせられた）のニュアンスで文脈に合いません。\n「〜てもらう」= tự mình nhận hưởng lợi từ hành động của người khác. "Được trưởng ca dạy" = trưởng ca dạy và mình được hưởng lợi.',
          difficulty: 'hard' as const,
        },
      ],
      xpReward: 50,
    },
  },

  // ===== 介護福祉士試験 =====
  'pro-01': {
    courseTitle: { ja: '介護福祉士 国家試験 筆記対策', vi: 'Ôn thi viết quốc gia chứng chỉ điều dưỡng viên' },
    isLocked: false,
    requiredPlan: 'pro',
    lesson: {
      title: '介護福祉士試験: 人間の尊厳と自立',
      titleTranslation: 'Thi điều dưỡng viên: Phẩm giá con người và tự lập',
      introduction: `介護福祉士国家試験の第1科目「人間の尊厳と自立」は、介護の根本理念を問う分野です。ICF（国際生活機能分類）・ノーマライゼーション・QOLなどの概念を理解し、利用者さんの権利擁護と自立支援の考え方を学びます。

Khoa học đầu tiên của kỳ thi quốc gia điều dưỡng viên "Phẩm giá và sự tự lập của con người" kiểm tra lý niệm căn bản của điều dưỡng. Cần hiểu các khái niệm ICF, Normalization, QOL và học về bảo vệ quyền lợi và hỗ trợ tự lập cho người dùng dịch vụ.`,
      keyPoints: [
        'ノーマライゼーション：障がい者も普通の生活を送る権利がある',
        'ICF（国際生活機能分類）：心身機能・活動・参加の三つの側面',
        'QOL（生活の質）：利用者さんが望む生活の実現',
        '権利擁護（アドボカシー）：利用者さんの権利を守る支援',
        '自立支援：自分でできることは自分でやる（残存機能の活用）',
        '尊厳を守る：プライバシー保護・羞恥心への配慮',
      ],
      vocabulary: [
        { word: 'ノーマライゼーション', reading: 'のーまらいぜーしょん', meaning: '障がい者の社会参加を支援する考え方（Normalization）', example: 'ノーマライゼーションの理念' },
        { word: 'QOL', reading: 'きゅーおーえる', meaning: '生活の質（chất lượng cuộc sống）', example: 'QOLの向上を目指す' },
        { word: '権利擁護', reading: 'けんりようご', meaning: '利用者の権利を守ること（bảo vệ quyền lợi）', example: '権利擁護（アドボカシー）' },
        { word: '残存機能', reading: 'ざんそんきのう', meaning: '残っている機能・能力（khả năng còn lại）', example: '残存機能を活かしたケア' },
        { word: '自立支援', reading: 'じりつしえん', meaning: '自分でできることを支援（hỗ trợ tự lập）', example: '自立支援の視点でケアする' },
      ],
      examples: [
        { japanese: '【試験問題例】ICFの「活動」の説明として正しいのはどれか。1.心身機能・構造 2.個人の課題遂行 3.生活・人生場面への関与 4.環境因子', reading: '', translation: '【Ví dụ đề thi】Giải thích đúng về "hoạt động" trong ICF là gì? 1.Chức năng/cấu trúc thể chất 2.Thực hiện nhiệm vụ cá nhân 3.Tham gia vào cuộc sống 4.Yếu tố môi trường' },
        { japanese: 'ノーマライゼーションとは、障がいのある人も地域社会の中で普通の生活を営む権利があるという考え方である。', reading: 'のーまらいぜーしょんとは、しょうがいのあるひともちいきしゃかいのなかでふつうのせいかつをいとなむけんりがあるというかんがえかたである。', translation: 'Normalization là quan điểm cho rằng người khuyết tật cũng có quyền sống cuộc sống bình thường trong cộng đồng.' },
      ],
      grammarNote: `【介護福祉士試験の科目構成】
領域I: 人間と社会（人間の尊厳・人間関係・社会の理解）
領域II: 介護（介護の基本・コミュニケーション・生活支援技術）
領域III: こころとからだのしくみ（発達と老化・認知症・障害の理解）
領域IV: 医療的ケア

【出題形式】
・5択問題 × 125問
・合格基準：総得点の60%以上かつ各領域で足切りなし`,
      quiz: {
        question: 'ICFの三つの側面に含まれないのはどれか？',
        options: [
          { id: 'a', text: '心身機能・身体構造' },
          { id: 'b', text: '活動' },
          { id: 'c', text: '参加' },
          { id: 'd', text: '知能指数' },
        ],
        correctId: 'd',
        explanation: 'ICF（国際生活機能分類）の三つの側面は「心身機能・身体構造」「活動」「参加」です。知能指数はICFの側面ではありません。\nBa khía cạnh của ICF: "Chức năng/cấu trúc thể chất" "Hoạt động" "Tham gia". Chỉ số trí tuệ không thuộc ICF.',
      },
      xpReward: 50,
    },
  },

  // ===== 看護補助 =====
  'pro-03': {
    courseTitle: { ja: '看護補助・看護実務の日本語', vi: 'Tiếng Nhật hỗ trợ điều dưỡng và thực hành y tế' },
    isLocked: false,
    requiredPlan: 'pro',
    lesson: {
      title: 'バイタルサインの測定と報告',
      titleTranslation: 'Đo và báo cáo dấu hiệu sinh tồn',
      introduction: `看護補助として働く際、バイタルサインの測定と報告は基本業務の一つです。体温・血圧・脈拍・呼吸・SpO2（血中酸素飽和度）を正確に測定し、異常値の判断と報告ができることが求められます。

Khi làm trợ lý y tá, đo và báo cáo dấu hiệu sinh tồn là một trong những công việc cơ bản. Cần đo chính xác nhiệt độ, huyết áp, mạch đập, nhịp thở, SpO2 (độ bão hòa oxy) và có khả năng nhận biết giá trị bất thường để báo cáo.`,
      keyPoints: [
        '体温（たいおん）：正常値36.0〜37.0℃ / 37.5℃以上 = 発熱',
        '血圧（けつあつ）：正常120/80mmHg以下 / 140/90以上 = 高血圧',
        '脈拍（みゃくはく）：正常60〜100回/分 / 100以上 = 頻脈',
        '呼吸（こきゅう）：正常12〜20回/分 / 24以上 = 頻呼吸',
        'SpO2：正常96〜100% / 94%以下 = 異常（ドクターへ報告）',
        '報告の形：「〇〇様のバイタルです。体温〇〇℃、血圧〇〇/〇〇です」',
      ],
      vocabulary: [
        { word: '発熱', reading: 'はつねつ', meaning: '体温が高い（sốt）', example: '37.5℃以上は発熱' },
        { word: '頻脈', reading: 'ひんみゃく', meaning: '脈が速い（nhịp tim nhanh）', example: '100回以上は頻脈' },
        { word: 'SpO2', reading: 'えすぴーおーつー', meaning: '血中酸素飽和度（độ bão hòa oxy）', example: 'SpO2が94%以下は異常' },
        { word: '収縮期血圧', reading: 'しゅうしゅくきけつあつ', meaning: '上の血圧（huyết áp tâm thu）', example: '収縮期血圧140以上は高血圧' },
        { word: '拡張期血圧', reading: 'かくちょうきけつあつ', meaning: '下の血圧（huyết áp tâm trương）', example: '拡張期血圧90以上は高血圧' },
      ],
      examples: [
        { japanese: '「鈴木ナース、田中様のバイタルを報告します。体温37.8℃、血圧152/94、脈拍88、SpO295%です。体温と血圧がやや高めです。ご確認をお願いします。」', reading: 'すずきなーす、たなかさまのばいたるをほうこくします。たいおんさんじゅうしちどはちぶ、けつあつひゃくごじゅうに、きゅうじゅうし、みゃくはくはちじゅうはち、えすぴーおーつーきゅうじゅうごぱーせんとです。', translation: '"Y tá Suzuki ơi, tôi báo cáo dấu hiệu sinh tồn của ông Tanaka. Nhiệt độ 37,8°C, huyết áp 152/94, mạch 88, SpO2 95%. Nhiệt độ và huyết áp hơi cao. Nhờ xác nhận giúp."' },
      ],
      grammarNote: `【バイタル報告の順番と表現】
1. 「〇〇様のバイタルを報告します」
2. 「体温〇〇度」「血圧〇〇の〇〇」「脈拍〇〇」「SpO2〇〇パーセント」
3. 「〇〇がやや高め/低めです」
4. 「ご確認をお願いします/指示をお願いします」

【血圧の読み方】
120/80 = 「百二十のはちじゅう」or「上が百二十、下がはちじゅう」`,
      quiz: {
        question: '体温が38.2℃の場合の適切な対応は？',
        options: [
          { id: 'a', text: '正常なので記録だけする' },
          { id: 'b', text: '発熱があるため、すぐにナース・上司に報告する' },
          { id: 'c', text: '自分で判断して解熱剤を渡す' },
          { id: 'd', text: '様子を見て何もしない' },
        ],
        correctId: 'b',
        explanation: '38℃以上は高熱。37.5℃以上を発熱と判断し、看護師・上司への報告が必要です。自己判断で薬を渡すことは禁止されています。\n38°C trở lên là sốt cao. 37,5°C trở lên là sốt, cần báo cáo y tá/cấp trên. Nghiêm cấm tự ý đưa thuốc.',
      },
      xpReward: 50,
    },
  },

  // ===== 就職面接 =====
  'pro-04': {
    courseTitle: { ja: '就職面接 実践演習 〜介護・医療職〜', vi: 'Luyện phỏng vấn xin việc - Điều dưỡng & y tế' },
    isLocked: false,
    requiredPlan: 'pro',
    lesson: {
      title: '介護施設の面接: 志望動機と自己PR',
      titleTranslation: 'Phỏng vấn cơ sở điều dưỡng: Lý do nộp đơn và tự PR bản thân',
      introduction: `介護・医療施設の就職面接では、日本語能力だけでなく、介護への情熱・チームワーク・コミュニケーション能力が評価されます。「なぜ介護の仕事をしたいのか」「自分の強みは何か」を日本語で明確に伝えられる準備が必要です。

Phỏng vấn xin việc tại cơ sở điều dưỡng và y tế không chỉ đánh giá tiếng Nhật mà còn đam mê với điều dưỡng, làm việc nhóm và khả năng giao tiếp. Cần chuẩn bị truyền đạt rõ ràng bằng tiếng Nhật "tại sao muốn làm điều dưỡng" và "điểm mạnh của bản thân là gì".`,
      keyPoints: [
        '志望動機の構成：きっかけ→経験・強み→将来の目標',
        '自己PRの構成：強み→具体的なエピソード→仕事への活かし方',
        '介護への動機：「〜がきっかけで介護に興味を持ちました」',
        'ベトナム人としての強み：「母国語・日本語・文化理解」',
        '逆質問：「御施設で働く上で大切にしていることは何ですか？」',
        '敬語の使い方：面接では常に敬語・丁寧語を使う',
      ],
      vocabulary: [
        { word: '志望動機', reading: 'しぼうどうき', meaning: '応募した理由（lý do ứng tuyển）', example: '志望動機を教えてください' },
        { word: '自己PR', reading: 'じこぴーあーる', meaning: '自分の強みをアピール（tự giới thiệu điểm mạnh）', example: '自己PRをお願いします' },
        { word: '貢献する', reading: 'こうけんする', meaning: '役に立つ（đóng góp）', example: '御施設に貢献したい' },
        { word: '向上心', reading: 'こうじょうしん', meaning: 'もっとよくなりたい気持ち（tinh thần cầu tiến）', example: '向上心があります' },
        { word: 'やりがい', reading: 'やりがい', meaning: '仕事の充実感（sự thỏa mãn trong công việc）', example: '介護のやりがいを感じる' },
      ],
      examples: [
        { japanese: '「私が介護の仕事を志望した理由は、祖父の介護を経験したことです。その時、介護士さんの優しい声かけに感動し、私も同じように人の役に立ちたいと思いました。ベトナム語・日本語を活かして、外国にルーツを持つ利用者さんの支援にも貢献できると考えています。」', reading: '', translation: '"Lý do tôi muốn làm công việc điều dưỡng là vì tôi đã có kinh nghiệm chăm sóc ông nội. Lúc đó tôi rất cảm động trước những lời hỏi thăm ân cần của nhân viên điều dưỡng và muốn được giúp ích cho người khác như vậy. Tôi nghĩ mình có thể đóng góp cho việc hỗ trợ người dùng có gốc nước ngoài bằng tiếng Việt và tiếng Nhật."' },
      ],
      grammarNote: `【面接でよく使う表現】
自己紹介：「〜と申します。本日はよろしくお願いいたします。」
志望動機：「〜がきっかけで、〜と思いました。」
強みを言う：「私の強みは〜です。例えば〜の経験から〜を学びました。」
質問への答え：「おっしゃる通りです。/ご指摘ありがとうございます。」
逆質問：「〜についてお聞きしてもよろしいでしょうか？」`,
      quiz: {
        question: '面接の「志望動機」を答えるとき、最初に入れるべき内容は？',
        options: [
          { id: 'a', text: '給与・待遇への期待' },
          { id: 'b', text: '介護に興味を持ったきっかけ・動機' },
          { id: 'c', text: '他の会社との比較' },
          { id: 'd', text: '自分の弱点' },
        ],
        correctId: 'b',
        explanation: '志望動機では「なぜこの仕事をしたいか」という動機・きっかけを最初に述べます。給与や待遇の話は志望動機には含めません。\nKhi trả lời "lý do ứng tuyển", đầu tiên nêu động cơ/cơ duyên "tại sao muốn làm công việc này".',
      },
      xpReward: 50,
    },
  },

  // ===== 看護師試験 =====
  'pro-05': {
    courseTitle: { ja: 'N2 看護師国家試験対策 日本語読解', vi: 'Luyện đọc hiểu tiếng Nhật cho kỳ thi y tá quốc gia N2' },
    isLocked: false,
    requiredPlan: 'pro',
    lesson: {
      title: '看護師試験の問題文読解: 医療用語と設問パターン',
      titleTranslation: 'Đọc đề thi y tá: Thuật ngữ y tế và dạng câu hỏi',
      introduction: `看護師国家試験の問題文は、専門的な医療用語と複雑な日本語表現が混在します。「〜について正しいのはどれか」「〜に対して最も優先されるのはどれか」などの設問パターンを理解し、問題の意図を正確に読み取ることが合格への鍵です。

Đề thi y tá quốc gia kết hợp thuật ngữ y tế chuyên môn và biểu đạt tiếng Nhật phức tạp. Hiểu các dạng câu hỏi như "Cái nào đúng về..." và "Điều gì được ưu tiên nhất..." và đọc chính xác ý định của câu hỏi là chìa khóa để đỗ.`,
      keyPoints: [
        '設問パターン1：「〜について正しいのはどれか」= 知識を問う',
        '設問パターン2：「最も適切なのはどれか」= 判断力を問う',
        '設問パターン3：「最初に行うのはどれか」= 優先順位を問う',
        '否定設問：「誤っているのはどれか」「適切でないのはどれか」',
        '文脈から専門用語の意味を推測する',
        '長文問題：患者情報を整理してから設問を読む',
      ],
      vocabulary: [
        { word: '浮腫', reading: 'ふしゅ', meaning: 'むくみ（phù nề）', example: '下肢に浮腫がある' },
        { word: '貧血', reading: 'ひんけつ', meaning: '血液中のヘモグロビンが少ない（thiếu máu）', example: '鉄欠乏性貧血' },
        { word: '起立性低血圧', reading: 'きりつせいていけつあつ', meaning: '立つと血圧が下がる（hạ huyết áp tư thế）', example: '起立性低血圧に注意する' },
        { word: '褥瘡', reading: 'じょくそう', meaning: '床ずれ（loét do tỳ đè）', example: '褥瘡の予防が重要' },
        { word: '誤嚥', reading: 'ごえん', meaning: '食べ物が気管に入る（hít sặc）', example: '誤嚥リスクのある患者' },
      ],
      examples: [
        { japanese: '【問題例】80歳の女性。骨粗鬆症で入院中。転倒リスクが高い。看護師が最初に行うべきことはどれか。1.骨密度検査 2.転倒リスクアセスメント実施 3.家族への連絡 4.安静指示', reading: '', translation: '【Ví dụ】Phụ nữ 80 tuổi. Đang nhập viện vì loãng xương. Nguy cơ té ngã cao. Điều y tá cần làm đầu tiên là gì? 1.Kiểm tra mật độ xương 2.Đánh giá nguy cơ té ngã 3.Liên hệ gia đình 4.Hướng dẫn nghỉ ngơi' },
      ],
      grammarNote: `【試験問題の読み方】
Step1: 患者情報を整理（年齢・性別・診断名・症状）
Step2: 設問パターンを確認（正しい・最も適切・最初に・誤り）
Step3: 選択肢を読む前に自分で答えを考える
Step4: 各選択肢を根拠をもって判断する

【「最も優先される」問題の考え方】
→ ABC（気道・呼吸・循環）が最優先
→ 安全・安楽・患者の意思を考慮`,
      quiz: {
        question: '「誤っているのはどれか」という設問への対応として正しいのは？',
        options: [
          { id: 'a', text: '正しい選択肢を探す' },
          { id: 'b', text: '誤り（間違い）の選択肢を探す' },
          { id: 'c', text: '最も重要な選択肢を探す' },
          { id: 'd', text: '全て正しいかどうか確認する' },
        ],
        correctId: 'b',
        explanation: '「誤っているのはどれか」は他の設問と逆で、間違いを選ぶ問題です。見落としやすいので、設問をよく確認してから回答しましょう。\n「誤っているのはどれか」là ngược lại — tìm đáp án SAI. Dễ bỏ sót nên cần đọc kỹ câu hỏi.',
      },
      xpReward: 50,
    },
  },

  // ===== 医療ソーシャルワーカー =====
  'pro-06': {
    courseTitle: { ja: '医療ソーシャルワーカーの日本語', vi: 'Tiếng Nhật công tác xã hội y tế' },
    isLocked: false,
    requiredPlan: 'pro',
    lesson: {
      title: '退院支援の日本語 — 患者・家族への説明',
      titleTranslation: 'Tiếng Nhật hỗ trợ xuất viện — Giải thích cho bệnh nhân và gia đình',
      introduction: `医療ソーシャルワーカー（MSW）は、患者さんの退院後の生活を支援する専門職です。複雑な福祉制度を患者さんと家族に分かりやすく説明する日本語力が必要です。「介護保険・障害者サービス・生活保護」などの制度説明を専門用語と平易な言葉を使い分けて説明できることが求められます。

Nhân viên công tác xã hội y tế (MSW) là chuyên gia hỗ trợ cuộc sống sau xuất viện của bệnh nhân. Cần tiếng Nhật để giải thích rõ ràng các chế độ phúc lợi phức tạp cho bệnh nhân và gia đình. Cần có khả năng giải thích chế độ 介護保険・障害者サービス vừa dùng thuật ngữ chuyên môn vừa dùng ngôn ngữ đơn giản.`,
      keyPoints: [
        '退院支援の目的：患者さんが安全に退院後の生活を送れるよう準備',
        '介護保険制度：65歳以上・40〜64歳（特定疾病）が利用可能',
        '要介護認定：要支援1〜2・要介護1〜5の7段階',
        '在宅サービス：訪問介護・訪問看護・デイサービス・ショートステイ',
        '施設サービス：特別養護老人ホーム・老人保健施設',
        '家族への説明：専門用語をかみ砕いて分かりやすく説明する',
      ],
      vocabulary: [
        { word: '退院支援', reading: 'たいいんしえん', meaning: '退院後の生活を支援（hỗ trợ sau xuất viện）', example: '退院支援計画を立てる' },
        { word: '介護保険', reading: 'かいごほけん', meaning: '介護サービスの公的保険（bảo hiểm chăm sóc）', example: '介護保険を申請する' },
        { word: '要介護認定', reading: 'ようかいごにんてい', meaning: '介護の必要度を認定（đánh giá mức độ cần chăm sóc）', example: '要介護2の認定を受ける' },
        { word: '訪問介護', reading: 'ほうもんかいご', meaning: '自宅に来て介護（dịch vụ chăm sóc tại nhà）', example: '週3回の訪問介護' },
        { word: 'ケアマネジャー', reading: 'けあまねじゃー', meaning: 'ケアプランを作る専門家（quản lý chăm sóc）', example: 'ケアマネジャーに相談する' },
      ],
      examples: [
        { japanese: '「お父様の退院後の生活についてご説明させていただきます。介護保険という制度を使って、自宅でもヘルパーさんに来てもらうことができます。まずは役所に申請が必要です。お手伝いできますが、いかがでしょうか？」', reading: '', translation: '"Để tôi giải thích về cuộc sống của cha bạn sau khi xuất viện. Sử dụng chế độ bảo hiểm chăm sóc, có thể nhận người hỗ trợ đến nhà. Trước tiên cần đăng ký ở cơ quan chức năng. Tôi có thể giúp đỡ, bạn thấy thế nào?"' },
      ],
      grammarNote: `【福祉制度の説明で使う表現】
導入：「〜という制度があります」「〜を利用することができます」
条件：「〜歳以上の方が対象です」「〜の場合に使えます」
手続き：「まず〜に申請します」「次に〜が必要です」
費用：「自己負担は〜です」「保険適用で〜になります」
提案：「〜はいかがでしょうか？ご検討ください」`,
      quiz: {
        question: '介護保険サービスを利用するために最初に必要なことは？',
        options: [
          { id: 'a', text: 'ケアマネジャーに連絡する' },
          { id: 'b', text: '市区町村に要介護認定の申請をする' },
          { id: 'c', text: '病院のソーシャルワーカーに相談する' },
          { id: 'd', text: '特別養護老人ホームに入居する' },
        ],
        correctId: 'b',
        explanation: '介護保険サービス利用には「要介護認定」が必要。申請先は市区町村（役所）。認定を受けてからケアマネジャーを選び、ケアプランを作成します。\nĐể sử dụng dịch vụ bảo hiểm chăm sóc cần "đánh giá mức độ cần chăm sóc". Nộp đơn ở UBND. Sau đó chọn quản lý chăm sóc và lập kế hoạch.',
      },
      xpReward: 50,
    },
  },

  // ===== 外国人患者対応 =====
  'pro-07': {
    courseTitle: { ja: '外国人患者対応の日本語 〜文化的配慮〜', vi: 'Tiếng Nhật tiếp nhận bệnh nhân nước ngoài - Chú ý văn hóa' },
    isLocked: false,
    requiredPlan: 'pro',
    lesson: {
      title: '外国人患者への対応と文化的配慮',
      titleTranslation: 'Tiếp nhận bệnh nhân nước ngoài và chú ý văn hóa',
      introduction: `日本の医療機関でも外国人患者が増えています。文化・宗教・言語の違いを理解した上で適切な対応をすることが求められます。特に食事制限（ハラール・ベジタリアン）・宗教的慣習・インフォームドコンセントの文化差への配慮が重要です。

Số bệnh nhân nước ngoài tại các cơ sở y tế Nhật Bản đang tăng. Cần xử lý phù hợp với sự hiểu biết về sự khác biệt về văn hóa, tôn giáo và ngôn ngữ. Đặc biệt quan trọng là chú ý đến hạn chế ăn uống (Halal, chay), tập tục tôn giáo và sự khác biệt văn hóa trong thông báo đồng ý điều trị.`,
      keyPoints: [
        '食事制限への対応：「宗教上の食事制限はございますか？」',
        'ハラール食：イスラム教徒はアルコール・豚肉を避ける',
        '宗教的な配慮：礼拝の時間・方向・場所への配慮',
        '通訳ツールの活用：翻訳アプリ・医療通訳サービスの利用',
        '文化差への理解：直接的な表現を好む文化・間接的な文化',
        '家族の決定権：国によっては家族が医療の意思決定をする',
      ],
      vocabulary: [
        { word: 'ハラール', reading: 'はらーる', meaning: 'イスラム法で許可された食品（thực phẩm Halal）', example: 'ハラール食を提供する' },
        { word: '宗教上の理由', reading: 'しゅうきょうじょうのりゆう', meaning: '宗教的な事情（lý do tôn giáo）', example: '宗教上の理由で食べられない' },
        { word: '文化的背景', reading: 'ぶんかてきはいけい', meaning: '文化からくる背景（nền tảng văn hóa）', example: '文化的背景を理解する' },
        { word: '多言語対応', reading: 'たげんごたいおう', meaning: '複数の言語で対応する（hỗ trợ đa ngôn ngữ）', example: '多言語対応の案内板' },
        { word: 'インフォームドコンセント', reading: 'いんふぉーむどこんせんと', meaning: '説明と同意（thông báo và đồng ý）', example: 'ICをしっかり行う' },
      ],
      examples: [
        { japanese: '「食事についてお伺いします。宗教上の理由やアレルギーなどで食べられないものはございますか？ハラール食のご用意もできます。」', reading: 'しょくじについておうかがいします。しゅうきょうじょうのりゆうやあれるぎーなどでたべられないものはございますか？はらーるしょくのごようしいもできます。', translation: '"Cho tôi hỏi về bữa ăn. Có thứ gì không ăn được vì lý do tôn giáo hoặc dị ứng không? Chúng tôi cũng có thể chuẩn bị thức ăn Halal."' },
        { japanese: '「お祈りの時間や場所について、何かご要望はございますか？できる限りご対応いたします。」', reading: 'おいのりのじかんやばしょについて、なにかごようぼうはございますか？できるかぎりごたいおういたします。', translation: '"Về thời gian và nơi cầu nguyện, bạn có yêu cầu gì không? Chúng tôi sẽ cố gắng đáp ứng hết mức có thể."' },
      ],
      grammarNote: `【外国人対応のコミュニケーション工夫】
やさしい日本語を使う：
・専門用語を避ける / 短い文にする
・「〜してください」ではなく「〜お願いします」
・絵・写真・ジェスチャーを活用

確認の取り方：
・「分かりましたか？」ではなく「〜はどういう意味ですか？」と聞く
・「はい」の返事が「理解した」とは限らない

通訳サービス：
・医療通訳電話サービス（みんなの日本語）
・タブレット・タブレット翻訳アプリ`,
      quiz: {
        question: '外国人患者への対応で「やさしい日本語」の特徴は？',
        options: [
          { id: 'a', text: '専門用語を多く使う' },
          { id: 'b', text: '短い文・簡単な語彙・具体的な表現を使う' },
          { id: 'c', text: 'できるだけ敬語を使う' },
          { id: 'd', text: '英語を混ぜる' },
        ],
        correctId: 'b',
        explanation: '「やさしい日本語」は専門用語を避け、短い文・簡単な言葉・具体的な表現を使い、外国人や高齢者にも分かりやすく伝える日本語です。\n「やさしい日本語」là tiếng Nhật dễ hiểu: tránh thuật ngữ, dùng câu ngắn, từ ngữ đơn giản và biểu đạt cụ thể.',
      },
      xpReward: 50,
    },
  },

  // ===== 医療通訳 =====
  'pro-02': {
    courseTitle: { ja: '医療通訳 入門コース', vi: 'Khóa nhập môn phiên dịch y tế' },
    isLocked: false,
    requiredPlan: 'pro',
    lesson: {
      title: '医療通訳の基礎 — 診察室でのやりとり',
      titleTranslation: 'Nền tảng phiên dịch y tế — Hội thoại trong phòng khám',
      introduction: `医療通訳は、医師と患者の間で言語だけでなく文化・価値観の橋渡しをする専門職です。Dungさんも「医師の言葉を正確に訳すだけでなく、患者さんが本当に理解しているか確認することが大切」と言っています。

診察室での通訳は「逐次通訳（一文ずつ訳す）」が基本です。医師の言葉・患者の言葉、どちらも正確に伝えることが求められます。

Phiên dịch y tế là nghề bắc cầu không chỉ ngôn ngữ mà còn cả văn hóa và giá trị quan giữa bác sĩ và bệnh nhân. Dung cũng nói: "Không chỉ dịch chính xác lời bác sĩ mà còn cần xác nhận bệnh nhân có thực sự hiểu không".`,
      keyPoints: [
        '逐次通訳の原則：医師が話したら止めてもらい、正確に訳す（一文ずつ）',
        '医師への依頼：「すみません、少し止めていただけますか？（phiên dịch yêu cầu dừng lại）」',
        '確認技法：「〜というのは、〜という意味ですよ、分かりましたか？」',
        '中立性を保つ：通訳者自身の意見は入れない（患者の代わりに意思決定しない）',
        '専門用語の通訳：まず正確な訳、必要なら平易な説明を付加',
        '感情の通訳：患者の不安・怒りも言葉に含めて通訳する',
      ],
      vocabulary: [
        { word: '診察', reading: 'しんさつ', meaning: '医師による検査（khám bệnh）', example: '今日は初診です' },
        { word: '症状', reading: 'しょうじょう', meaning: '病気の状態（triệu chứng）', example: '症状を教えてください' },
        { word: '処方箋', reading: 'しょほうせん', meaning: '薬の処方書（đơn thuốc）', example: '処方箋を薬局に持っていく' },
        { word: 'インフォームドコンセント', reading: 'いんふぉーむどこんせんと', meaning: '説明と同意（thông báo đồng ý điều trị）', example: '手術前のIC（IC = IC、đồng ý điều trị）' },
        { word: '既往歴', reading: 'きおうれき', meaning: '過去の病気（tiền sử bệnh）', example: '既往歴を確認する' },
        { word: 'アレルギー', reading: 'あれるぎー', meaning: 'アレルギー（dị ứng）', example: '薬のアレルギーはありますか' },
      ],
      examples: [
        {
          japanese: '先生：「どんな症状がありますか？」→ 通訳：「Bạn có triệu chứng gì?」',
          reading: 'せんせい：「どんなしょうじょうがありますか？」',
          translation: '医師の質問を患者の言語に訳す基本例',
        },
        {
          japanese: '患者：「Tôi bị đau bụng từ sáng」→ 通訳：「朝から腹痛があります」',
          reading: 'かんじゃ：（ベトナム語）→ つうやく：「あさからふくつうがあります」',
          translation: '患者の言葉を医師の言語に訳す例',
        },
        {
          japanese: '先生、少々お待ちください。確認させてください。（通訳が医師に依頼）',
          reading: 'せんせい、しょうしょうおまちください。かくにんさせてください。',
          translation: 'Thưa bác sĩ, cho tôi một chút. Để tôi xác nhận lại.',
        },
        {
          japanese: '〇〇さん、先生は「手術が必要です」とおっしゃっています。分かりましたか？',
          reading: 'せんせいは「しゅじゅつがひつようです」とおっしゃっています。わかりましたか？',
          translation: 'Thưa anh/chị XX, bác sĩ nói "cần phẫu thuật". Anh/chị hiểu chưa?',
        },
      ],
      grammarNote: `【医療通訳でよく使う表現】
依頼する：
・「〜していただけますか」= Nhờ bác sĩ/bệnh nhân...
・「少々お待ちください」= Cho tôi một chút

確認する：
・「〜というのは〜ということですね？」= ... có nghĩa là ... đúng không?
・「もう一度おっしゃっていただけますか」= Xin nhắc lại được không?

中立の立場を示す：
・「通訳として申し上げますが...」= Tôi nói với tư cách phiên dịch...
・「先生がおっしゃるには...」= Theo lời bác sĩ...`,
      quiz: {
        question: '医療通訳の正しい姿勢として最も適切なものは？',
        options: [
          { id: 'a', text: '患者の代わりに医師の説明が正しいかどうか判断する' },
          { id: 'b', text: '医師と患者の言葉を中立的・正確に通訳し、必要な確認を行う' },
          { id: 'c', text: '通訳中に自分の医療知識を加えて補足説明する' },
          { id: 'd', text: '患者の代わりに医師に治療方針を決めてもらう' },
        ],
        correctId: 'b',
        explanation: '医療通訳者は中立を保ち、双方の言葉を正確に通訳することが原則です。自分の判断や意見を入れると信頼関係が崩れます。\nPhiên dịch y tế cần giữ trung lập và dịch chính xác lời của cả hai bên.',
      },
      xpReward: 50,
    },
  },

  // ===== N5 文法 =====
  'n5-03': {
    courseTitle: { ja: 'N5 基礎文法 〜です・ます体〜', vi: 'Ngữ pháp cơ bản N5 - thể lịch sự' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N5文法: です・ます体と助詞は・が・を',
      titleTranslation: 'Ngữ pháp N5: Thể lịch sự và trợ từ は・が・を',
      introduction: `日本語の丁寧な話し方「です・ます体」は、職場・初対面・目上の人との会話で必須です。介護現場では利用者さんや上司に対して常にです・ます体を使います。

「です・ます体」(thể lịch sự) là cách nói lịch sự trong tiếng Nhật, bắt buộc khi nói chuyện nơi làm việc, gặp lần đầu, hoặc với người trên. Trong môi trường điều dưỡng, luôn dùng thể này với người được chăm sóc và cấp trên.`,
      keyPoints: [
        '名詞文：〜は〜です（例：わたしはベトナム人です）',
        '動詞文：ます形（例：食べます・飲みます・行きます）',
        '助詞は：テーマを示す（「わたしは〜」「今日は〜」）',
        '助詞が：主語を強調（「これが薬です」「だれが来ましたか？」）',
        '助詞を：動作の対象（「薬を飲む」「ご飯を食べる」「廊下を歩く」）',
        '否定形：〜ません（飲みません）、〜ではありません（医者ではありません）',
      ],
      vocabulary: [
        { word: '飲みます', reading: 'のみます', meaning: '飲む（uống）', example: '薬を飲みます' },
        { word: '食べます', reading: 'たべます', meaning: '食べる（ăn）', example: 'ご飯を食べます' },
        { word: '行きます', reading: 'いきます', meaning: '行く（đi）', example: 'トイレに行きます' },
        { word: '起きます', reading: 'おきます', meaning: '起きる（thức dậy）', example: '7時に起きます' },
        { word: '休みます', reading: 'やすみます', meaning: '休む（nghỉ）', example: 'ゆっくり休みます' },
        { word: '手伝います', reading: 'てつだいます', meaning: '手伝う（giúp đỡ）', example: 'お着替えを手伝います' },
      ],
      examples: [
        { japanese: 'わたしはベトナムから来ました。', reading: 'わたしはベトナムからきました。', translation: 'Tôi đến từ Việt Nam.' },
        { japanese: '毎朝7時に薬を飲みます。', reading: 'まいあさしちじにくすりをのみます。', translation: 'Mỗi sáng uống thuốc lúc 7 giờ.' },
        { japanese: 'お体の具合はよくありません。', reading: 'おからだのぐあいはよくありません。', translation: 'Tình trạng sức khỏe không tốt.' },
        { japanese: 'これがお部屋の鍵です。', reading: 'これがおへやのかぎです。', translation: 'Đây là chìa khóa phòng.' },
      ],
      grammarNote: `【です・ます体の活用】
現在肯定：〜ます（飲みます）
現在否定：〜ません（飲みません）
過去肯定：〜ました（飲みました）
過去否定：〜ませんでした（飲みませんでした）

【助詞まとめ】
は = テーマ・対比 / が = 主語強調 / を = 動作対象
に = 場所・時間・方向 / で = 手段・場所（動作）`,
      quiz: {
        question: '正しい文はどれですか？',
        options: [
          { id: 'a', text: '薬は飲みます（を→は）' },
          { id: 'b', text: '薬を飲みます' },
          { id: 'c', text: '薬が飲みます' },
          { id: 'd', text: '薬に飲みます' },
        ],
        correctId: 'b',
        explanation: '「を」は動作の対象を表す助詞。「薬を飲む」のように、何を飲むかを示します。\n「を」là trợ từ chỉ đối tượng của hành động. "薬を飲む" = uống thuốc.',
      },
      xpReward: 20,
    },
  },

  // ===== N5 会話 =====
  'n5-04': {
    courseTitle: { ja: 'N5 日常会話 はじめの一歩', vi: 'Hội thoại hàng ngày N5 - Bước đầu tiên' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N5会話: 自己紹介と挨拶',
      titleTranslation: 'Hội thoại N5: Tự giới thiệu và chào hỏi',
      introduction: `日本語の挨拶と自己紹介は人間関係の基本です。介護の仕事では、利用者さん・ご家族・同僚に毎日挨拶します。正しい挨拶は信頼関係を作る第一歩です。

Lời chào và tự giới thiệu trong tiếng Nhật là nền tảng của quan hệ con người. Trong công việc điều dưỡng, bạn chào hỏi người được chăm sóc, gia đình họ và đồng nghiệp mỗi ngày.`,
      keyPoints: [
        '朝の挨拶：おはようございます（丁寧）/ おはよう（親しい相手）',
        '昼・夜：こんにちは（昼）/ こんばんは（夜）',
        '自己紹介：はじめまして。〜と申します。よろしくお願いします。',
        '出勤時：おはようございます / 退勤時：お疲れ様でした',
        '感謝：ありがとうございます / 謝罪：すみません・申し訳ありません',
        '返事：はい（yes）/ いいえ（no）/ そうですか（I see）',
      ],
      vocabulary: [
        { word: 'はじめまして', reading: 'はじめまして', meaning: 'はじめて会う（Xin chào lần đầu）', example: 'はじめまして、グエンです' },
        { word: '申します', reading: 'もうします', meaning: '〜という（tên tôi là...）', example: 'グエンと申します' },
        { word: 'よろしく', reading: 'よろしく', meaning: 'お願いします（nhờ vả）', example: 'よろしくお願いします' },
        { word: 'お疲れ様', reading: 'おつかれさま', meaning: 'お仕事お疲れ様（Cảm ơn vì đã vất vả）', example: 'お疲れ様でした' },
        { word: '失礼します', reading: 'しつれいします', meaning: '失礼（xin phép/xin lỗi）', example: '失礼します（部屋に入るとき）' },
      ],
      examples: [
        { japanese: 'はじめまして。グエンと申します。ベトナムから来ました。よろしくお願いします。', reading: 'はじめまして。グエンともうします。ベトナムからきました。よろしくおねがいします。', translation: 'Xin chào. Tôi tên là Nguyễn. Tôi đến từ Việt Nam. Rất vui được làm quen.' },
        { japanese: 'おはようございます。今日もよろしくお願いします。', reading: 'おはようございます。きょうもよろしくおねがいします。', translation: 'Chào buổi sáng. Hôm nay cũng nhờ mọi người nhiều nhé.' },
        { japanese: 'お疲れ様でした。また明日よろしくお願いします。', reading: 'おつかれさまでした。またあしたよろしくおねがいします。', translation: 'Cảm ơn vì đã vất vả. Ngày mai cũng nhờ mọi người nhé.' },
      ],
      grammarNote: `【状況別挨拶まとめ】
朝（〜10時）：おはようございます
昼（10時〜17時）：こんにちは
夜（17時〜）：こんばんは
別れ：さようなら / またね（親しい）/ 失礼します（正式）
就寝前：おやすみなさい

【敬語の度合い】
おはよう < おはようございます
ありがとう < ありがとうございます
すみません < 申し訳ありません`,
      quiz: {
        question: '職場で上司に言う正しい退勤の挨拶は？',
        options: [
          { id: 'a', text: 'バイバイ！' },
          { id: 'b', text: 'お疲れ様でした' },
          { id: 'c', text: 'じゃあね' },
          { id: 'd', text: 'また明日' },
        ],
        correctId: 'b',
        explanation: '「お疲れ様でした」は職場での退勤時・仕事終わりの標準的な挨拶です。上司・同僚に使えます。\n「お疲れ様でした」là lời chào chuẩn khi kết thúc ca làm trong môi trường làm việc.',
      },
      xpReward: 20,
    },
  },

  'n5-04-2': {
    courseTitle: { ja: 'N5 日常会話 はじめの一歩', vi: 'Hội thoại hàng ngày N5 - Bước đầu tiên' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N5会話L2: 日常の声かけ',
      titleTranslation: 'Hội thoại N5 Bài 2: Những câu chào hỏi hàng ngày',
      introduction: `日常生活の中で自然に使う声かけ表現を学びましょう。介護の現場では、利用者さんへの声かけが大切なコミュニケーションです。食事・就寝・起床など場面に合わせた挨拶を覚えましょう。

Hãy học các câu chào hỏi tự nhiên trong cuộc sống hàng ngày. Trong môi trường điều dưỡng, việc lên tiếng với người được chăm sóc là giao tiếp rất quan trọng. Hãy ghi nhớ những lời chào phù hợp với từng tình huống như bữa ăn, đi ngủ, thức dậy.`,
      keyPoints: [
        '起床時：おはようございます。よく眠れましたか？',
        '食事前：お食事の時間ですよ。いただきます。',
        '食事後：ごちそうさまでした。おいしかったですか？',
        '就寝時：おやすみなさい。ゆっくり休んでください。',
        '移動時：〇〇さん、一緒に行きましょうか。',
        '確認・返答：はい / そうですね / わかりました',
      ],
      vocabulary: [
        { word: 'いただきます', reading: 'いただきます', meaning: '食事前の挨拶（trước bữa ăn）', example: 'では、いただきます' },
        { word: 'ごちそうさまでした', reading: 'ごちそうさまでした', meaning: '食事後の挨拶（sau bữa ăn）', example: 'ごちそうさまでした、おいしかったです' },
        { word: 'おやすみなさい', reading: 'おやすみなさい', meaning: '就寝前の挨拶（trước khi ngủ）', example: 'おやすみなさい、ゆっくり休んでください' },
        { word: '眠れましたか', reading: 'ねむれましたか', meaning: '眠れた？（ngủ ngon không?）', example: 'よく眠れましたか' },
        { word: '声かけ', reading: 'こえかけ', meaning: '声をかけること（lên tiếng gọi）', example: '食事前の声かけ' },
      ],
      dialogue: [
        { speaker: 'スタッフ', japanese: 'おはようございます、田中さん。よく眠れましたか？', reading: 'おはようございます、たなかさん。よくねむれましたか？', translation: 'Chào buổi sáng, bác Tanaka. Bác ngủ ngon không?' },
        { speaker: '利用者', japanese: 'ええ、おかげさまで。', reading: 'ええ、おかげさまで。', translation: 'Vâng, nhờ ơn trời.' },
        { speaker: 'スタッフ', japanese: 'もうすぐ朝食の時間です。準備できましたか？', reading: 'もうすぐちょうしょくのじかんです。じゅんびできましたか？', translation: 'Sắp đến giờ ăn sáng rồi. Bác đã sẵn sàng chưa?' },
        { speaker: '利用者', japanese: 'はい、大丈夫です。', reading: 'はい、だいじょうぶです。', translation: 'Vâng, được rồi.' },
        { speaker: 'スタッフ', japanese: 'では一緒に行きましょう。どうぞ。', reading: 'ではいっしょにいきましょう。どうぞ。', translation: 'Vậy chúng ta cùng đi nhé. Mời bác.' },
      ],
      examples: [
        { japanese: 'お食事の時間ですよ。いただきましょう。', reading: 'おしょくじのじかんですよ。いただきましょう。', translation: 'Đến giờ ăn rồi đó. Chúng ta ăn thôi.' },
        { japanese: 'ごちそうさまでした。おいしかったですか？', reading: 'ごちそうさまでした。おいしかったですか？', translation: 'Xin cảm ơn bữa ăn. Bác thấy ngon không?' },
        { japanese: 'おやすみなさい。ゆっくり休んでください。', reading: 'おやすみなさい。ゆっくりやすんでください。', translation: 'Chúc ngủ ngon. Hãy nghỉ ngơi thật thoải mái.' },
      ],
      grammarNote: `【場面別声かけ一覧】
起床：おはようございます。よく眠れましたか？
食前：お食事の時間ですよ。いただきましょう。
食後：ごちそうさまでした。お口を拭きましょうか。
移動：〇〇さん、一緒に行きますよ。
就寝：おやすみなさい。ゆっくり休んでください。

【ポイント】
・名前を呼ぶ（田中さん、山田さん）→親しみが伝わる
・「〜ましょうか？」= 提案の表現
・ゆっくり、はっきり話す → 聞き取りやすい`,
      quiz: {
        question: '食事が終わった後に言う挨拶は？',
        options: [
          { id: 'a', text: 'いただきます' },
          { id: 'b', text: 'おはようございます' },
          { id: 'c', text: 'ごちそうさまでした' },
          { id: 'd', text: 'おやすみなさい' },
        ],
        correctId: 'c',
        explanation: '「ごちそうさまでした」は食事の後に言う挨拶です。「いただきます」は食事前。\n"ごちそうさまでした" là lời chào sau bữa ăn. "Itadakimasu" là trước bữa ăn.',
      },
      xpReward: 20,
    },
  },

  'n5-04-3': {
    courseTitle: { ja: 'N5 日常会話 はじめの一歩', vi: 'Hội thoại hàng ngày N5 - Bước đầu tiên' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N5会話L3: 職場の報告・連絡',
      titleTranslation: 'Hội thoại N5 Bài 3: Báo cáo và liên lạc tại nơi làm việc',
      introduction: `職場での「報告・連絡・相談（ほうれんそう）」は日本の職場文化の基本です。介護スタッフとして、利用者の状態変化を正確に上司や同僚に伝えるスキルが求められます。

"Báo cáo - Liên lạc - Tham khảo ý kiến (Hōrenso)" là nền tảng văn hóa làm việc của Nhật Bản. Là nhân viên điều dưỡng, bạn cần có kỹ năng truyền đạt chính xác sự thay đổi tình trạng của người được chăm sóc cho cấp trên và đồng nghiệp.`,
      keyPoints: [
        '報告の基本：〜を確認しました / 〜が終わりました',
        '変化の報告：〇〇さんが〜と言っています / 〜のようです',
        '問題の報告：〜が気になります / すぐに来ていただけますか',
        '申し送り：〜については引き続き注意が必要です',
        '確認依頼：〜でよろしいでしょうか？',
        '了解の返事：わかりました / 承知しました / はい、確認します',
      ],
      vocabulary: [
        { word: '報告', reading: 'ほうこく', meaning: '上司に知らせること（báo cáo）', example: '状況を報告します' },
        { word: '連絡', reading: 'れんらく', meaning: '知らせること（liên lạc）', example: 'すぐに連絡します' },
        { word: '相談', reading: 'そうだん', meaning: '意見を聞くこと（tham khảo）', example: '先輩に相談します' },
        { word: '申し送り', reading: 'もうしおくり', meaning: '次の人への引き継ぎ（bàn giao ca）', example: '申し送りをします' },
        { word: '承知しました', reading: 'しょうちしました', meaning: 'わかった（đã hiểu/chấp nhận）', example: '承知しました、すぐ参ります' },
        { word: '状態', reading: 'じょうたい', meaning: '状況（tình trạng）', example: '体の状態を確認する' },
      ],
      dialogue: [
        { speaker: 'スタッフ', japanese: '山田主任、田中さんの体温が37.8度あります。ご報告します。', reading: 'やまだしゅにん、たなかさんのたいおんが37.8どあります。ごほうこくします。', translation: 'Trưởng nhóm Yamada, bác Tanaka có nhiệt độ 37.8 độ. Tôi xin báo cáo.' },
        { speaker: '主任', japanese: 'そうですか。今すぐ様子を見てきます。', reading: 'そうですか。いますぐようすをみてきます。', translation: 'Vậy à. Tôi sẽ đến xem ngay bây giờ.' },
        { speaker: 'スタッフ', japanese: 'はい。また、少し食欲がないようです。', reading: 'はい。また、すこしちょくよくがないようです。', translation: 'Vâng. Ngoài ra, có vẻ bác ấy hơi mất cảm giác ngon miệng.' },
        { speaker: '主任', japanese: 'わかりました。申し送りに記録しておいてください。', reading: 'わかりました。もうしおくりにきろくしておいてください。', translation: 'Hiểu rồi. Hãy ghi vào sổ bàn giao ca nhé.' },
        { speaker: 'スタッフ', japanese: '承知しました。すぐ記録します。', reading: 'しょうちしました。すぐきろくします。', translation: 'Vâng, tôi sẽ ghi ngay.' },
      ],
      examples: [
        { japanese: '田中さんの食事が半分しか食べられませんでした。ご報告します。', reading: 'たなかさんのしょくじがはんぶんしかたべられませんでした。ごほうこくします。', translation: 'Bác Tanaka chỉ ăn được một nửa suất ăn. Tôi xin báo cáo.' },
        { japanese: '午後の入浴が終わりました。異常はありませんでした。', reading: 'ごごのにゅうよくがおわりました。いじょうはありませんでした。', translation: 'Tắm buổi chiều đã xong. Không có gì bất thường.' },
        { japanese: '少し心配なので、相談させてください。', reading: 'すこしこころがいなので、そうだんさせてください。', translation: 'Tôi hơi lo nên cho phép tôi được tham khảo ý kiến.' },
      ],
      grammarNote: `【ほうれんそうの順序】
①何が起きたか（事実）: 〜しました / 〜がありました
②どんな状態か（状況）: 〜のようです / 〜と言っています
③どうすべきか（提案）: 〜していただけますか / 確認お願いします

【敬語の使い分け】
同僚：〜しました、わかりました
上司：〜させていただきました、承知しました
緊急時：すぐに来ていただけますか！`,
      quiz: {
        question: '上司への返答として最も丁寧な表現は？',
        options: [
          { id: 'a', text: 'わかった' },
          { id: 'b', text: 'はい、わかりました' },
          { id: 'c', text: 'うん' },
          { id: 'd', text: '承知しました' },
        ],
        correctId: 'd',
        explanation: '「承知しました」が最も丁寧な返答です。「わかりました」は標準的。「わかった」「うん」は職場では不適切。\n"承知しました" là cách trả lời lịch sự nhất.',
      },
      xpReward: 20,
    },
  },

  'n5-04-4': {
    courseTitle: { ja: 'N5 日常会話 はじめの一歩', vi: 'Hội thoại hàng ngày N5 - Bước đầu tiên' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N5会話L4: 道案内・場所を聞く',
      titleTranslation: 'Hội thoại N5 Bài 4: Hỏi đường và chỉ đường',
      introduction: `「〜はどこですか？」という場所を聞く表現と、簡単な道案内の方法を学びましょう。介護施設内での案内や、地域での生活支援でも使える表現です。

Hãy học cách hỏi "〜はどこですか？" và cách chỉ đường đơn giản. Đây là những cách diễn đạt có thể dùng trong việc hướng dẫn trong cơ sở điều dưỡng và hỗ trợ cuộc sống trong cộng đồng.`,
      keyPoints: [
        '場所を聞く：〜はどこですか？ / 〜に行きたいのですが…',
        '方向：まっすぐ / 右 / 左 / 角を曲がる / 〜の前・後ろ',
        '距離：近い / 遠い / 歩いて〜分くらい',
        '施設案内：エレベーターは〜にあります / 〜階です',
        '確認：〜でよろしいですか？ / わかりましたか？',
        '道に迷った：すみません、道に迷ってしまいました',
      ],
      vocabulary: [
        { word: 'まっすぐ', reading: 'まっすぐ', meaning: '直進（đi thẳng）', example: 'まっすぐ進んでください' },
        { word: '右・左', reading: 'みぎ・ひだり', meaning: '右と左（phải và trái）', example: '右に曲がります' },
        { word: '角', reading: 'かど', meaning: '曲がり角（góc đường）', example: '角を左に曲がります' },
        { word: 'エレベーター', reading: 'えれべーたー', meaning: '昇降機（thang máy）', example: 'エレベーターはあちらです' },
        { word: '〜番出口', reading: '〜ばんでぐち', meaning: '出口の番号（cửa ra số〜）', example: '3番出口を出てください' },
        { word: '迷う', reading: 'まよう', meaning: '道がわからない（lạc đường）', example: '道に迷いました' },
      ],
      dialogue: [
        { speaker: '訪問者', japanese: 'すみません、トイレはどこですか？', reading: 'すみません、といれはどこですか？', translation: 'Xin lỗi, nhà vệ sinh ở đâu ạ?' },
        { speaker: 'スタッフ', japanese: 'こちらの廊下をまっすぐ進んで、突き当たりを右に曲がったところです。', reading: 'こちらのろうかをまっすぐすすんで、つきあたりをみぎにまがったところです。', translation: 'Đi thẳng theo hành lang này, rồi ở cuối hành lang rẽ phải là tới nơi.' },
        { speaker: '訪問者', japanese: 'わかりました。ありがとうございます。', reading: 'わかりました。ありがとうございます。', translation: 'Hiểu rồi. Cảm ơn.' },
        { speaker: 'スタッフ', japanese: 'わからなければ、またお声がけください。', reading: 'わからなければ、またおこえがけください。', translation: 'Nếu không tìm được, hãy gọi tôi nhé.' },
      ],
      examples: [
        { japanese: '食堂はどこですか？２階にあります。エレベーターで上がってください。', reading: 'しょくどうはどこですか？２かいにあります。えれべーたーであがってください。', translation: 'Nhà ăn ở đâu? Ở tầng 2. Hãy đi thang máy lên.' },
        { japanese: 'このまま廊下をまっすぐ進んで、左に曲がるとナースステーションがあります。', reading: 'このままろうかをまっすぐすすんで、ひだりにまがるとなーすすてーしょんがあります。', translation: 'Đi thẳng theo hành lang này, rẽ trái là sẽ thấy trạm y tá.' },
        { japanese: 'すみません、駅に行くにはどうやって行けばいいですか？', reading: 'すみません、えきにいくにはどうやっていけばいいですか？', translation: 'Xin lỗi, để đến ga tàu thì đi thế nào ạ?' },
      ],
      grammarNote: `【道案内の基本フレーズ】
・まっすぐ進んでください（đi thẳng）
・〜を右/左に曲がってください（rẽ phải/trái）
・〜の前/後ろ/隣（trước/sau/bên cạnh）
・〜番出口を出てください（ra cửa số〜）
・歩いて約〜分です（khoảng〜 phút đi bộ）

【場所の表現】
〜の前（phía trước）/ 後ろ（phía sau）
〜の右（bên phải）/ 左（bên trái）
〜の隣（bên cạnh）/ 近く（gần đây）`,
      quiz: {
        question: '「突き当たりを右に曲がる」の意味は？',
        options: [
          { id: 'a', text: '廊下の途中で右に曲がる' },
          { id: 'b', text: '廊下の一番端まで行って右に曲がる' },
          { id: 'c', text: '右のドアを開ける' },
          { id: 'd', text: '右の階段を下りる' },
        ],
        correctId: 'b',
        explanation: '「突き当たり（つきあたり）」は廊下や道の一番奥・端のこと。「突き当たりを右に」= 端まで行って右折。\n"Tsukiatari" là cuối hành lang / đường cụt. Đi đến cuối rồi rẽ phải.',
      },
      xpReward: 20,
    },
  },

  'n5-04-5': {
    courseTitle: { ja: 'N5 日常会話 はじめの一歩', vi: 'Hội thoại hàng ngày N5 - Bước đầu tiên' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N5会話L5: 体調・症状を伝える',
      titleTranslation: 'Hội thoại N5 Bài 5: Diễn đạt tình trạng sức khỏe và triệu chứng',
      introduction: `介護の現場では、利用者さんの体調変化を正確に言葉にして伝えることが最も重要なスキルのひとつです。「どこが痛いですか？」「どんな感じがしますか？」という質問と、答え方を練習しましょう。

Trong môi trường điều dưỡng, một trong những kỹ năng quan trọng nhất là diễn đạt chính xác bằng lời sự thay đổi tình trạng sức khỏe của người được chăm sóc. Hãy luyện tập hỏi "Bác đau ở đâu?" và cách trả lời.`,
      keyPoints: [
        '痛みを聞く：どこが痛いですか？ / 痛みはありますか？',
        '部位：頭・おなか・腰・足・胸・腕・背中',
        '症状の表現：〜が痛い / 気持ち悪い / めまいがする / 熱っぽい',
        '程度：少し / とても / すごく / 〜くらい（10点満点で）',
        '時間：いつから？ / ずっと？ / 時々？',
        '緊急時：すぐ看護師を呼びます / 動かないでください',
      ],
      vocabulary: [
        { word: '痛い', reading: 'いたい', meaning: '痛み（đau）', example: '頭が痛いです' },
        { word: '気持ち悪い', reading: 'きもちわるい', meaning: '吐き気（buồn nôn）', example: '少し気持ち悪いです' },
        { word: 'めまい', reading: 'めまい', meaning: 'くらくら（chóng mặt）', example: 'めまいがします' },
        { word: '熱', reading: 'ねつ', meaning: '体温上昇（sốt）', example: '熱が出ました' },
        { word: '腰', reading: 'こし', meaning: '腰部（thắt lưng）', example: '腰が痛いです' },
        { word: '胸', reading: 'むね', meaning: '胸部（ngực）', example: '胸が苦しいです' },
      ],
      dialogue: [
        { speaker: 'スタッフ', japanese: '山本さん、顔色が悪いですが、大丈夫ですか？', reading: 'やまもとさん、かおいろがわるいですが、だいじょうぶですか？', translation: 'Bác Yamamoto, sắc mặt bác trông không tốt, bác có sao không?' },
        { speaker: '利用者', japanese: 'ちょっと頭が痛いんです。', reading: 'ちょっとあたまがいたいんです。', translation: 'Tôi hơi đau đầu một chút.' },
        { speaker: 'スタッフ', japanese: 'いつからですか？熱はありますか？', reading: 'いつからですか？ねつはありますか？', translation: 'Từ lúc nào vậy? Bác có sốt không?' },
        { speaker: '利用者', japanese: '朝からです。少し熱っぽい感じもします。', reading: 'あさからです。すこしねつっぽいかんじもします。', translation: 'Từ sáng. Tôi cũng có cảm giác hơi sốt.' },
        { speaker: 'スタッフ', japanese: '体温を測りますね。少し待ってください。', reading: 'たいおんをはかりますね。すこしまってください。', translation: 'Để tôi đo nhiệt độ nhé. Xin bác chờ một chút.' },
      ],
      examples: [
        { japanese: '腰が痛いです。昨日から続いています。', reading: 'こしがいたいです。きのうからつづいています。', translation: 'Tôi đau lưng. Đau liên tục từ hôm qua.' },
        { japanese: '気持ち悪くて、食欲がありません。', reading: 'きもちわるくて、しょくよくがありません。', translation: 'Tôi buồn nôn và không có cảm giác ngon miệng.' },
        { japanese: '胸が苦しいです。すぐ看護師を呼びます。', reading: 'むねがくるしいです。すぐかんごしをよびます。', translation: 'Tôi tức ngực. Tôi sẽ gọi y tá ngay.' },
      ],
      grammarNote: `【症状を説明するパターン】
①部位 + が + 痛い/つらい/重い
  頭が痛い / おなかが重い / 足がつらい
②時間：いつから？
  朝から / 昨日から / ずっと / 時々
③程度：どのくらい？
  少し / かなり / とても / ひどい

【緊急時のフレーズ】
・胸が苦しい → 即・看護師に報告！
・意識がない → 「〇〇さん！わかりますか？」
・転倒 → 「動かないでください。呼びますから」`,
      quiz: {
        question: '利用者が「胸が苦しい」と言ったら、まず何をすべきですか？',
        options: [
          { id: 'a', text: '水を飲んでもらう' },
          { id: 'b', text: 'すぐに看護師・医師に知らせる' },
          { id: 'c', text: '少し様子を見る' },
          { id: 'd', text: '横になってもらう' },
        ],
        correctId: 'b',
        explanation: '胸の苦しさは心臓発作などの緊急疾患の可能性があります。すぐに看護師・医師に知らせることが最優先です。\nTức ngực có thể là dấu hiệu cấp cứu. Báo ngay cho y tá/bác sĩ là ưu tiên hàng đầu.',
      },
      xpReward: 20,
    },
  },

  'n5-04-6': {
    courseTitle: { ja: 'N5 日常会話 はじめの一歩', vi: 'Hội thoại hàng ngày N5 - Bước đầu tiên' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N5会話L6: 依頼・お断り',
      titleTranslation: 'Hội thoại N5 Bài 6: Nhờ vả và từ chối',
      introduction: `「〜していただけますか？」「〜をお願いできますか？」という丁寧な依頼表現と、丁寧に断る方法を学びましょう。介護現場では、利用者への声かけ・スタッフへの協力依頼など、毎日使う表現です。

Hãy học cách nhờ vả lịch sự "〜していただけますか？" và cách từ chối lịch sự. Trong môi trường điều dưỡng, đây là những cách diễn đạt dùng hàng ngày, từ lên tiếng với người được chăm sóc đến nhờ đồng nghiệp hỗ trợ.`,
      keyPoints: [
        '依頼（丁寧）：〜していただけますか？ / 〜をお願いできますか？',
        '依頼（普通）：〜してもらえますか？ / 〜してください',
        '承諾：はい、わかりました / もちろんです / すぐに参ります',
        'お断り：申し訳ありませんが、〜 / 少々お待ちいただけますか',
        '代替案：〜でよろしければ / 代わりに〜はいかがでしょうか',
        '確認：よろしいですか？ / ご無理ではないですか？',
      ],
      vocabulary: [
        { word: '依頼', reading: 'いらい', meaning: 'お願い（nhờ vả）', example: '仕事を依頼する' },
        { word: '申し訳ありません', reading: 'もうしわけありません', meaning: '大変ごめんなさい（xin lỗi rất nhiều）', example: '申し訳ありませんが、少しお待ちください' },
        { word: 'もちろん', reading: 'もちろん', meaning: 'もちろん（tất nhiên）', example: 'もちろんです、喜んで' },
        { word: '少々', reading: 'しょうしょう', meaning: '少し（một chút）', example: '少々お待ちください' },
        { word: '承ります', reading: 'うけたまわります', meaning: '引き受ける（tiếp nhận/chấp nhận）', example: 'はい、承ります' },
        { word: 'ご無理', reading: 'ごむり', meaning: '負担が大きい（quá sức）', example: 'ご無理ではないですか？' },
      ],
      dialogue: [
        { speaker: 'スタッフ', japanese: '田中さん、少し位置を変えてもよろしいですか？', reading: 'たなかさん、すこしいちをかえてもよろしいですか？', translation: 'Bác Tanaka, tôi có thể đổi tư thế cho bác một chút không?' },
        { speaker: '利用者', japanese: 'はい、お願いします。', reading: 'はい、おねがいします。', translation: 'Vâng, nhờ bạn nhé.' },
        { speaker: 'スタッフ', japanese: '少し体を右に向けていただけますか？', reading: 'すこしからだをみぎにむけていただけますか？', translation: 'Bác có thể nghiêng người sang phải một chút không?' },
        { speaker: '利用者', japanese: 'すみません、腰が痛くて…', reading: 'すみません、こしがいたくて…', translation: 'Xin lỗi, thắt lưng của tôi đau...' },
        { speaker: 'スタッフ', japanese: 'そうですか。では左はいかがですか？ゆっくりやりましょう。', reading: 'そうですか。ではひだりはいかがですか？ゆっくりやりましょう。', translation: 'Vậy à. Vậy sang trái thì sao? Chúng ta làm từ từ nhé.' },
      ],
      examples: [
        { japanese: '申し訳ありませんが、今少し手が離せません。5分後によろしいですか？', reading: 'もうしわけありませんが、いますこしてがはなせません。5ふんごによろしいですか？', translation: 'Xin lỗi, bây giờ tôi đang bận tay một chút. 5 phút nữa được không?' },
        { japanese: 'お水を持ってきていただけますか？', reading: 'おみずをもってきていただけますか？', translation: 'Bạn có thể lấy nước cho tôi không?' },
        { japanese: '今日は体調が悪いので、入浴を明日にしていただけますか？', reading: 'きょうはたいちょうがわるいので、にゅうよくをあしたにしていただけますか？', translation: 'Hôm nay sức khỏe không tốt, nên tắm vào ngày mai được không?' },
      ],
      grammarNote: `【依頼の丁寧度】
①〜してください（普通・指示的）
②〜してもらえますか（やや丁寧）
③〜していただけますか（丁寧・推奨）
④〜していただけないでしょうか（最も丁寧）

【断り方のパターン】
・申し訳ありませんが＋理由＋代替案
例：「申し訳ありませんが、今は手が離せません。
   〇分後に伺いますので、少しお待ちください。」

【介護での使い分け】
利用者へ → 〜していただけますか？（丁寧）
同僚へ → 〜してもらえる？（カジュアル）
上司へ → 〜していただけますか？（丁寧）`,
      quiz: {
        question: '最も丁寧な依頼の表現はどれですか？',
        options: [
          { id: 'a', text: 'やってください' },
          { id: 'b', text: 'やってもらえますか' },
          { id: 'c', text: 'やっていただけませんか' },
          { id: 'd', text: 'やって' },
        ],
        correctId: 'c',
        explanation: '「〜ていただけませんか」が最も丁寧です。否定形（〜ませんか）を使うことで、さらに控えめで丁寧な依頼になります。\n"〜ていただけませんか" là lịch sự nhất vì dùng thể phủ định thể hiện sự khiêm tốn.',
      },
      xpReward: 20,
    },
  },

  'n5-04-7': {
    courseTitle: { ja: 'N5 日常会話 はじめの一歩', vi: 'Hội thoại hàng ngày N5 - Bước đầu tiên' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N5会話L7: 食事・好みを伝える',
      titleTranslation: 'Hội thoại N5 Bài 7: Truyền đạt sở thích và bữa ăn',
      introduction: `食事は介護の仕事で中心的なケアのひとつです。利用者の好みや制限を確認し、食事を楽しんでもらうための会話表現を学びましょう。「何が食べたいですか？」「アレルギーはありますか？」など実践的な表現を練習します。

Bữa ăn là một trong những hoạt động chăm sóc trung tâm trong công việc điều dưỡng. Hãy học các cách diễn đạt để xác nhận sở thích và hạn chế của người được chăm sóc và giúp họ thưởng thức bữa ăn. Luyện tập những cách nói thực tế như "Bác muốn ăn gì?" và "Bác có bị dị ứng không?".`,
      keyPoints: [
        '好みを聞く：何が食べたいですか？ / どんな食べ物が好きですか？',
        '好みを伝える：〜が好きです / 〜は苦手です / 〜は食べられません',
        '制限の確認：アレルギーはありますか？ / 食事制限はありますか？',
        '量・食感：少なめに / やわらかくしてください / 刻んでください',
        '食事の促し：いかがですか？ / 温かいうちに召し上がってください',
        '感想：おいしいですか？ / お口に合いますか？',
      ],
      vocabulary: [
        { word: 'アレルギー', reading: 'あれるぎー', meaning: '食物アレルギー（dị ứng thức ăn）', example: 'アレルギーはありますか' },
        { word: '食事制限', reading: 'しょくじせいげん', meaning: '食べてはいけないもの（hạn chế ăn uống）', example: '食事制限があります' },
        { word: 'やわらかい', reading: 'やわらかい', meaning: '柔らかい（mềm）', example: 'やわらかい食事をお願いします' },
        { word: '刻む', reading: 'きざむ', meaning: '細かく切る（cắt nhỏ）', example: '刻んでください' },
        { word: '召し上がる', reading: 'めしあがる', meaning: '食べるの敬語（ăn - kính ngữ）', example: '召し上がってください' },
        { word: 'お口に合う', reading: 'おくちにあう', meaning: '好みに合う（hợp khẩu vị）', example: 'お口に合いますか？' },
      ],
      dialogue: [
        { speaker: 'スタッフ', japanese: '田中さん、今日のランチはどうでしたか？', reading: 'たなかさん、きょうのらんちはどうでしたか？', translation: 'Bác Tanaka, hôm nay bữa trưa thế nào?' },
        { speaker: '利用者', japanese: '魚料理はおいしかったけど、ご飯が少し硬かったです。', reading: 'さかなりょうりはおいしかったけど、ごはんがすこしかたかったです。', translation: 'Món cá ngon nhưng cơm hơi cứng một chút.' },
        { speaker: 'スタッフ', japanese: 'そうですか。明日からやわらかめにしましょうか？', reading: 'そうですか。あしたからやわらかめにしましょうか？', translation: 'Vậy à. Từ ngày mai tôi sẽ cho làm mềm hơn nhé?' },
        { speaker: '利用者', japanese: 'ありがとうございます。お願いします。', reading: 'ありがとうございます。おねがいします。', translation: 'Cảm ơn. Nhờ bạn nhé.' },
        { speaker: 'スタッフ', japanese: '他に何かご希望はありますか？', reading: 'ほかになにかごきぼうはありますか？', translation: 'Bác còn có mong muốn gì khác không?' },
      ],
      examples: [
        { japanese: 'お魚は好きですが、貝類は苦手です。', reading: 'おさかなはすきですが、かいるいはにがてです。', translation: 'Tôi thích cá nhưng không thích đồ có vỏ.' },
        { japanese: '飲み込みにくいので、やわらかく刻んでいただけますか？', reading: 'のみこみにくいので、やわらかくきざんでいただけますか？', translation: 'Tôi khó nuốt nên bạn có thể cắt nhỏ mềm không?' },
        { japanese: 'お口に合いますか？おいしければよかったです。', reading: 'おくちにあいますか？おいしければよかったです。', translation: 'Có hợp khẩu vị không? Tốt quá nếu thấy ngon.' },
      ],
      grammarNote: `【食事に関する重要表現】
・好き / 嫌い（すき/きらい）= thích/ghét
・苦手（にがて）= không giỏi/không hợp
・食べられない = không ăn được（アレルギー等）

【食感の表現】
・やわらかい（mềm）← → かたい（cứng）
・なめらか（mịn）/ とろとろ（dẻo）
・刻み食（cắt nhỏ）/ ミキサー食（xay nhuyễn）
・普通食（thông thường）/ 嚥下食（dễ nuốt）

【敬語での食事表現】
食べる → 召し上がる（kính ngữ）
「召し上がってください」= Mời bác dùng`,
      quiz: {
        question: '「召し上がってください」はどんな意味ですか？',
        options: [
          { id: 'a', text: '料理を作ってください' },
          { id: 'b', text: '食べてください（丁寧）' },
          { id: 'c', text: '買い物してください' },
          { id: 'd', text: '片付けてください' },
        ],
        correctId: 'b',
        explanation: '「召し上がる（めしあがる）」は「食べる」「飲む」の尊敬語。「召し上がってください」= 丁寧に「食べてください」。\n"Meshiagaru" là kính ngữ của "ăn/uống". "召し上がってください" = Mời (bác) dùng.',
      },
      xpReward: 20,
    },
  },

  'n5-04-8': {
    courseTitle: { ja: 'N5 日常会話 はじめの一歩', vi: 'Hội thoại hàng ngày N5 - Bước đầu tiên' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N5会話L8: 電話・連絡の基本会話',
      titleTranslation: 'Hội thoại N5 Bài 8: Hội thoại cơ bản qua điện thoại và liên lạc',
      introduction: `電話での対応は介護職に欠かせないスキルです。「〜でございます」「少々お待ちください」「伝言をお願いできますか？」など、電話特有の表現を学びましょう。緊急連絡も含めて練習します。

Xử lý điện thoại là kỹ năng không thể thiếu trong nghề điều dưỡng. Hãy học các cách diễn đạt đặc trưng của điện thoại như "〜でございます", "少々お待ちください", "伝言をお願いできますか？". Luyện tập cả liên lạc khẩn cấp.`,
      keyPoints: [
        '受話器を取る：はい、〇〇施設でございます',
        '担当者不在：ただいま席を外しております / 折り返しご連絡します',
        '伝言：伝言をお願いできますか？ / 〜とお伝えください',
        '確認：失礼ですが、お名前をお聞きしてもよろしいですか？',
        '緊急連絡：至急ご連絡ください / 救急車を呼んでいただけますか',
        '終話：よろしくお願いいたします / 失礼いたします',
      ],
      vocabulary: [
        { word: 'でございます', reading: 'でございます', meaning: '〜です（丁寧）（là... - lịch sự）', example: 'はい、桜荘でございます' },
        { word: '伝言', reading: 'でんごん', meaning: 'メッセージを伝える（nhắn tin）', example: '伝言をお願いします' },
        { word: '折り返す', reading: 'おりかえす', meaning: 'かけ直す（gọi lại）', example: '折り返しご連絡します' },
        { word: '至急', reading: 'しきゅう', meaning: '急いで（khẩn cấp）', example: '至急ご連絡ください' },
        { word: '失礼いたします', reading: 'しつれいいたします', meaning: '失礼します（丁寧）（xin phép/chào tạm biệt）', example: '失礼いたします（電話終了）' },
        { word: '担当者', reading: 'たんとうしゃ', meaning: '担当する人（người phụ trách）', example: '担当者に代わります' },
      ],
      dialogue: [
        { speaker: 'スタッフ', japanese: 'はい、桜介護センターでございます。', reading: 'はい、さくらかいごせんたーでございます。', translation: 'Vâng, đây là Trung tâm điều dưỡng Sakura.' },
        { speaker: '家族', japanese: '田中の家族ですが、担当の山田さんはいらっしゃいますか？', reading: 'たなかのかぞくですが、たんとうのやまださんはいらっしゃいますか？', translation: 'Tôi là gia đình bác Tanaka, xin hỏi nhân viên phụ trách Yamada có ở đó không?' },
        { speaker: 'スタッフ', japanese: 'ただいま山田は席を外しております。折り返しご連絡させてもよろしいでしょうか？', reading: 'ただいまやまだはせきをはずしております。おりかえしごれんらくさせてもよろしいでしょうか？', translation: 'Hiện tại Yamada đang vắng mặt. Cho phép chúng tôi gọi lại được không?' },
        { speaker: '家族', japanese: 'はい、お願いします。090-1234-5678です。', reading: 'はい、おねがいします。090-1234-5678です。', translation: 'Vâng, nhờ bạn nhé. Số điện thoại là 090-1234-5678.' },
        { speaker: 'スタッフ', japanese: '090-1234-5678ですね。必ず申し伝えます。よろしくお願いいたします。', reading: '090-1234-5678ですね。かならずもうしつたえます。よろしくおねがいいたします。', translation: '090-1234-5678 đúng không? Tôi chắc chắn sẽ truyền đạt lại. Cảm ơn.' },
      ],
      examples: [
        { japanese: 'ただいま担当者が席を外しております。折り返しご連絡してよろしいでしょうか？', reading: 'ただいまたんとうしゃがせきをはずしております。おりかえしごれんらくしてよろしいでしょうか？', translation: 'Hiện tại người phụ trách đang vắng. Chúng tôi có thể gọi lại không?' },
        { japanese: '失礼ですが、お名前とご用件をお聞きしてもよろしいですか？', reading: 'しつれいですが、おなまえとごようけんをおききしてもよろしいですか？', translation: 'Xin phép hỏi tên và việc cần của quý vị được không?' },
        { japanese: '至急、〇〇施設の△△までご連絡ください。', reading: 'しきゅう、〇〇しせつの△△までごれんらくください。', translation: 'Xin khẩn cấp liên lạc với △△ tại cơ sở 〇〇.' },
      ],
      grammarNote: `【電話の基本フロー】
①受ける：はい、〇〇でございます
②確認：失礼ですが、どちら様でしょうか？
③対応：〜さんはただいま席を外しております
④取り次ぎ：少々お待ちください（転送）
⑤不在：折り返しご連絡します
⑥終了：よろしくお願いいたします。失礼いたします

【丁寧語の電話版】
〜です → 〜でございます
わかりました → 承知いたしました
〜します → 〜いたします`,
      quiz: {
        question: '電話を切るときの丁寧な表現は？',
        options: [
          { id: 'a', text: 'じゃあ、バイバイ' },
          { id: 'b', text: '失礼いたします' },
          { id: 'c', text: 'またね' },
          { id: 'd', text: 'ありがとう' },
        ],
        correctId: 'b',
        explanation: '電話の終わりには「失礼いたします」が正式。「失礼します」より「いたします」でさらに丁寧になります。\n"失礼いたします" là cách kết thúc điện thoại lịch sự. "いたします" lịch sự hơn "します".',
      },
      xpReward: 20,
    },
  },

  'n5-04-9': {
    courseTitle: { ja: 'N5 日常会話 はじめの一歩', vi: 'Hội thoại hàng ngày N5 - Bước đầu tiên' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N5会話L9: お礼・お詫び（丁寧表現）',
      titleTranslation: 'Hội thoại N5 Bài 9: Cảm ơn và xin lỗi (Cách diễn đạt lịch sự)',
      introduction: `「ありがとうございます」と「すみません」は日本語で最も大切な表現のひとつです。しかし、状況によって使い分けが必要です。謝罪の深さ、感謝の気持ちの大きさに合わせた表現を学びましょう。

"Arigatou gozaimasu" và "Sumimasen" là một trong những cách diễn đạt quan trọng nhất trong tiếng Nhật. Tuy nhiên, cần phân biệt cách dùng tùy tình huống. Hãy học những cách diễn đạt phù hợp với mức độ xin lỗi và mức độ biết ơn.`,
      keyPoints: [
        '感謝の度合い：ありがとう < ありがとうございます < 大変ありがとうございます',
        '謝罪の度合い：ごめんなさい < すみません < 申し訳ありません < 大変申し訳ございません',
        '感謝の追加表現：おかげさまで / 助かりました / 恐れ入ります',
        '謝罪のポイント：事実→原因→対応→再発防止',
        '職場での謝罪：ご迷惑をおかけしました / 今後は気をつけます',
        '受け答え：いいえ、とんでもないです / お気になさらず',
      ],
      vocabulary: [
        { word: '恐れ入ります', reading: 'おそれいります', meaning: '恐縮する（ngại quá/cảm ơn）', example: '恐れ入ります、ありがとうございます' },
        { word: '申し訳ございません', reading: 'もうしわけございません', meaning: '大変申し訳ない（rất xin lỗi）', example: '大変申し訳ございません' },
        { word: 'おかげさまで', reading: 'おかげさまで', meaning: 'お陰で（nhờ ơn）', example: 'おかげさまで回復しました' },
        { word: '助かりました', reading: 'たすかりました', meaning: '助けてもらった（đã được giúp đỡ）', example: '本当に助かりました' },
        { word: 'とんでもない', reading: 'とんでもない', meaning: '気にしないで（không có gì）', example: 'とんでもないです、当然のことです' },
        { word: 'ご迷惑', reading: 'ごめいわく', meaning: '迷惑（phiền toái）', example: 'ご迷惑をおかけしました' },
      ],
      dialogue: [
        { speaker: '利用者', japanese: 'いつもお世話になっています。本当にありがとうございます。', reading: 'いつもおせわになっています。ほんとうにありがとうございます。', translation: 'Luôn được chăm sóc. Thực sự cảm ơn rất nhiều.' },
        { speaker: 'スタッフ', japanese: 'いいえ、とんでもないです。お役に立てて嬉しいです。', reading: 'いいえ、とんでもないです。おやくにたてて、うれしいです。', translation: 'Không có gì đâu. Tôi vui vì có thể giúp ích được.' },
        { speaker: 'スタッフ', japanese: '先日の対応が遅れてしまい、大変申し訳ありませんでした。', reading: 'せんじつのたいおうがおくれてしまい、たいへんもうしわけありませんでした。', translation: 'Hôm trước tôi xử lý chậm, tôi thực sự rất xin lỗi.' },
        { speaker: '利用者', japanese: 'いいえ、お気になさらず。いつも頑張ってくれているのがわかります。', reading: 'いいえ、おきになさらず。いつもがんばってくれているのがわかります。', translation: 'Không sao. Tôi biết bạn luôn cố gắng mà.' },
      ],
      examples: [
        { japanese: 'おかげさまで、田中さんの体調が回復しました。本当にありがとうございます。', reading: 'おかげさまで、たなかさんのたいちょうがかいふくしました。ほんとうにありがとうございます。', translation: 'Nhờ ơn mọi người, tình trạng sức khỏe của bác Tanaka đã hồi phục. Thực sự cảm ơn rất nhiều.' },
        { japanese: 'ご迷惑をおかけして、大変申し訳ございませんでした。', reading: 'ごめいわくをおかけして、たいへんもうしわけございませんでした。', translation: 'Tôi đã gây phiền phức, thực sự rất xin lỗi.' },
        { japanese: '助かりました。恐れ入ります。', reading: 'たすかりました。おそれいります。', translation: 'Cảm ơn đã giúp. Thật ngại quá.' },
      ],
      grammarNote: `【謝罪の段階】
軽い：ごめんなさい（nội bộ・子供が使う）
普通：すみませんでした（一般的）
丁寧：申し訳ありません（職場・正式）
最丁寧：大変申し訳ございません（深刻な謝罪）

【感謝の段階】
普通：ありがとうございます
深謝：大変ありがとうございます / 心より感謝いたします
恐縮：恐れ入ります（申し訳なく思う感謝）

【謝罪のポイント】
①事実：〜してしまいました
②原因：〜のため
③対応：〜します / しました
④再発防止：今後は〜に気をつけます`,
      quiz: {
        question: '職場で上司に深く謝るときの最も適切な表現は？',
        options: [
          { id: 'a', text: 'ごめんなさい' },
          { id: 'b', text: 'すまなかった' },
          { id: 'c', text: '大変申し訳ございませんでした' },
          { id: 'd', text: 'ごめんね' },
        ],
        correctId: 'c',
        explanation: '「大変申し訳ございませんでした」が職場での最も丁寧な謝罪表現です。「ございません」は「ありません」の丁寧語。\n"大変申し訳ございませんでした" là cách xin lỗi lịch sự nhất trong môi trường làm việc.',
      },
      xpReward: 20,
    },
  },

  'n5-04-10': {
    courseTitle: { ja: 'N5 日常会話 はじめの一歩', vi: 'Hội thoại hàng ngày N5 - Bước đầu tiên' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N5会話L10: 介護現場の基本ダイアログ',
      titleTranslation: 'Hội thoại N5 Bài 10: Hội thoại cơ bản tại hiện trường điều dưỡng',
      introduction: `介護の現場で実際に使われるリアルなダイアログ（対話）を練習しましょう。入浴介助・排泄介助・移動介助など、日常業務の場面に合わせた実践的な会話です。

Hãy luyện tập những hội thoại thực tế được sử dụng tại hiện trường điều dưỡng. Đây là những cuộc trò chuyện thực tế phù hợp với các tình huống công việc hàng ngày như hỗ trợ tắm rửa, hỗ trợ vệ sinh, hỗ trợ di chuyển.`,
      keyPoints: [
        '移乗・移動介助：では、立ち上がりますよ。せーの、どうぞ。',
        '入浴介助：お風呂の準備ができました。温度はいかがですか？',
        '排泄介助：トイレに行きますか？お手伝いしますよ。',
        '着替え介助：袖に腕を通しますね。こちらが右手ですよ。',
        '確認と同意：〜でよろしいですか？ / 準備ができましたら教えてください',
        '安全確認：ゆっくりでいいですよ / 急がなくて大丈夫です',
      ],
      vocabulary: [
        { word: '移乗', reading: 'いじょう', meaning: 'ベッドから車椅子へ（chuyển từ giường sang xe lăn）', example: '移乗介助をします' },
        { word: '介助', reading: 'かいじょ', meaning: '手伝い（hỗ trợ）', example: '入浴介助' },
        { word: 'せーの', reading: 'せーの', meaning: 'タイミングを合わせる掛け声（đếm nhịp）', example: 'せーの、立ちましょう' },
        { word: '袖', reading: 'そで', meaning: '洋服の腕の部分（ống tay áo）', example: '袖に腕を通します' },
        { word: '体位', reading: 'たいい', meaning: '体の向き・姿勢（tư thế）', example: '体位変換をします' },
        { word: '安全', reading: 'あんぜん', meaning: 'けがのないこと（an toàn）', example: '安全に配慮します' },
      ],
      dialogue: [
        { speaker: 'スタッフ', japanese: '山田さん、お風呂の準備ができましたよ。一緒に行きましょうか？', reading: 'やまださん、おふろのじゅんびができましたよ。いっしょにいきましょうか？', translation: 'Bác Yamada, đã chuẩn bị xong phòng tắm rồi. Chúng ta cùng đi nhé?' },
        { speaker: '利用者', japanese: 'はい、お願いします。', reading: 'はい、おねがいします。', translation: 'Vâng, nhờ bạn.' },
        { speaker: 'スタッフ', japanese: 'では、車椅子からゆっくり立ち上がりましょう。手をこちらに。せーの、どうぞ。', reading: 'では、くるまいすからゆっくりたちあがりましょう。てをこちらに。せーの、どうぞ。', translation: 'Vậy từ từ đứng dậy từ xe lăn nhé. Đặt tay vào đây. Một hai ba, nào.' },
        { speaker: '利用者', japanese: 'ありがとう。お湯はぬるめにしてください。', reading: 'ありがとう。おゆはぬるめにしてください。', translation: 'Cảm ơn. Hãy làm nước hơi ấm thôi nhé.' },
        { speaker: 'スタッフ', japanese: 'わかりました。温度を確認しますね。40度くらいでよろしいですか？', reading: 'わかりました。おんどをかくにんしますね。40どくらいでよろしいですか？', translation: 'Hiểu rồi. Để tôi kiểm tra nhiệt độ nhé. Khoảng 40 độ được không?' },
      ],
      examples: [
        { japanese: 'ゆっくりでいいですよ。急がなくて大丈夫ですから。', reading: 'ゆっくりでいいですよ。いそがなくてだいじょうぶですから。', translation: 'Cứ từ từ thôi. Không cần vội đâu.' },
        { japanese: 'では着替えましょう。右手から袖に通しますね。', reading: 'ではきがえましょう。みぎてからそでにとおしますね。', translation: 'Vậy thay quần áo nhé. Đưa tay phải vào ống tay áo trước nhé.' },
        { japanese: 'トイレに行きたいときは、いつでも呼んでください。', reading: 'といれにいきたいときは、いつでもよんでください。', translation: 'Khi muốn đi vệ sinh, hãy gọi tôi bất cứ lúc nào.' },
      ],
      grammarNote: `【介護現場の声かけポイント】
①声かけ前：名前を呼ぶ「〇〇さん」
②説明：何をするか「〜をします」
③同意確認：「よろしいですか？」
④実施中：「ゆっくりでいいですよ」「せーの、どうぞ」
⑤終了後：「終わりましたよ」「お疲れ様でした」

【安全のための言葉】
・「ゆっくり」= từ từ（急がせない）
・「一緒に」= cùng nhau（孤独感を与えない）
・「大丈夫ですよ」= không sao（安心させる）`,
      quiz: {
        question: '介護の声かけで最も重要なことは何ですか？',
        options: [
          { id: 'a', text: '大きな声で話すこと' },
          { id: 'b', text: '名前を呼んでから行動する前に説明すること' },
          { id: 'c', text: '英語で話すこと' },
          { id: 'd', text: '急いで作業を終わらせること' },
        ],
        correctId: 'b',
        explanation: '介護では「名前を呼ぶ」＋「何をするか説明する」＋「同意を確認する」が基本です。突然触れたり動かしたりしてはいけません。\nTrong điều dưỡng, cơ bản là "gọi tên" + "giải thích sẽ làm gì" + "xác nhận đồng ý".',
      },
      xpReward: 20,
    },
  },

  'n5-04-11': {
    courseTitle: { ja: 'N5 日常会話 はじめの一歩', vi: 'Hội thoại hàng ngày N5 - Bước đầu tiên' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N5会話L11: 家族・個人情報の会話',
      titleTranslation: 'Hội thoại N5 Bài 11: Hội thoại về gia đình và thông tin cá nhân',
      introduction: `入居者や利用者の家族対応、緊急連絡先の確認など、個人情報にまつわる会話は介護職で頻繁に発生します。丁寧かつ正確に情報を聞き取り、伝えるスキルを身につけましょう。

Hội thoại liên quan đến thông tin cá nhân như tiếp đón gia đình người lưu trú và xác nhận liên lạc khẩn cấp thường xuyên xảy ra trong nghề điều dưỡng. Hãy trau dồi kỹ năng lắng nghe và truyền đạt thông tin một cách lịch sự và chính xác.`,
      keyPoints: [
        '家族の確認：ご家族はいらっしゃいますか？ / おお名前を教えていただけますか？',
        '連絡先：緊急連絡先のお電話番号は何番でしょうか？',
        '続柄：息子さん・娘さん・ご主人・奥様・お子さん',
        '面会：面会時間は〜時から〜時までです',
        '個人情報の扱い：個人情報は厳重に管理します',
        'プライバシー配慮：〜については、ご家族にのみお伝えします',
      ],
      vocabulary: [
        { word: '緊急連絡先', reading: 'きんきゅうれんらくさき', meaning: '急なときの連絡先（liên lạc khẩn cấp）', example: '緊急連絡先を教えてください' },
        { word: '続柄', reading: 'つづきがら', meaning: '家族関係（quan hệ gia đình）', example: '続柄をお聞かせください' },
        { word: '面会', reading: 'めんかい', meaning: '訪問・会うこと（thăm）', example: '面会時間は14時からです' },
        { word: '個人情報', reading: 'こじんじょうほう', meaning: 'プライベートな情報（thông tin cá nhân）', example: '個人情報の取り扱いに注意します' },
        { word: 'ご主人', reading: 'ごしゅじん', meaning: '夫（kính）（chồng - kính ngữ）', example: 'ご主人は何時に来られますか' },
        { word: '奥様', reading: 'おくさま', meaning: '妻（kính）（vợ - kính ngữ）', example: '奥様はご存知ですか' },
      ],
      dialogue: [
        { speaker: 'スタッフ', japanese: '田中太郎様のご家族でいらっしゃいますか？', reading: 'たなかたろうさまのごかぞくでいらっしゃいますか？', translation: 'Quý vị có phải là gia đình của bác Taro Tanaka không?' },
        { speaker: '家族', japanese: 'はい、息子の田中一郎です。', reading: 'はい、むすこのたなかいちろうです。', translation: 'Vâng, tôi là con trai Ichiro Tanaka.' },
        { speaker: 'スタッフ', japanese: 'ご連絡ありがとうございます。少しよろしいでしょうか？', reading: 'ごれんらくありがとうございます。すこしよろしいでしょうか？', translation: 'Cảm ơn đã liên lạc. Xin phép hỏi đôi điều được không?' },
        { speaker: '家族', japanese: 'はい、何でしょうか。', reading: 'はい、なんでしょうか。', translation: 'Vâng, có chuyện gì ạ?' },
        { speaker: 'スタッフ', japanese: '緊急連絡先のお電話番号をお聞かせいただけますか？今後のため確認させてください。', reading: 'きんきゅうれんらくさきのおでんわばんごうをおきかせいただけますか？こんごのためかくにんさせてください。', translation: 'Cho tôi hỏi số điện thoại liên lạc khẩn cấp được không? Để xác nhận cho sau này.' },
      ],
      examples: [
        { japanese: 'ご家族はお何人いらっしゃいますか？緊急連絡先を教えていただけますか？', reading: 'ごかぞくはおなんにんいらっしゃいますか？きんきゅうれんらくさきをおしえていただけますか？', translation: 'Gia đình có bao nhiêu người? Bạn có thể cho tôi số liên lạc khẩn cấp không?' },
        { japanese: '面会時間は午後２時から４時まででございます。', reading: 'めんかいじかんはごごにじからよじまででございます。', translation: 'Giờ thăm là từ 14 giờ đến 16 giờ chiều.' },
        { japanese: 'ご本人の個人情報は、ご家族にのみお伝えします。', reading: 'ごほんにんのこじんじょうほうは、ごかぞくにのみおつたえします。', translation: 'Thông tin cá nhân của bác ấy chỉ được thông báo cho gia đình.' },
      ],
      grammarNote: `【家族の呼び方（敬語）】
自分の家族 → 謙遜表現
  父（ちち）・母（はは）・兄（あに）・姉（あね）

相手の家族 → 尊敬表現
  お父様・お母様・お兄様・お姉様
  ご主人（旦那さん）/ 奥様（奥さん）
  息子さん / 娘さん / お子さん

【個人情報取り扱いの注意】
・廊下・公共の場で個人情報を話さない
・第三者に利用者情報を漏らさない
・「〜についてはお答えできません」= không thể trả lời về...`,
      quiz: {
        question: '他人の夫（旦那さん）への丁寧な呼び方は？',
        options: [
          { id: 'a', text: '旦那' },
          { id: 'b', text: 'ご主人' },
          { id: 'c', text: 'ハズバンド' },
          { id: 'd', text: 'おっと' },
        ],
        correctId: 'b',
        explanation: '他人の夫への丁寧な表現は「ご主人（ごしゅじん）」または「ご主人様」です。「旦那」は親しい関係、「おっと（夫）」は自分の夫の謙称。\n"ご主人" là cách gọi lịch sự chồng của người khác.',
      },
      xpReward: 20,
    },
  },

  'n5-04-12': {
    courseTitle: { ja: 'N5 日常会話 はじめの一歩', vi: 'Hội thoại hàng ngày N5 - Bước đầu tiên' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N5会話L12: 総復習ロールプレイテスト',
      titleTranslation: 'Hội thoại N5 Bài 12: Bài kiểm tra nhập vai tổng hợp',
      introduction: `N5会話コースの総まとめです。学習した全ての会話表現を使って、介護現場を想定したロールプレイ形式で復習しましょう。挨拶・報告・体調確認・依頼・お礼・謝罪など、実践力を試します。

Đây là phần tổng kết của khóa học Hội thoại N5. Hãy ôn tập dưới hình thức nhập vai giả định môi trường điều dưỡng, sử dụng tất cả các cách diễn đạt đã học. Kiểm tra thực lực về chào hỏi, báo cáo, kiểm tra sức khỏe, nhờ vả, cảm ơn, xin lỗi, v.v.`,
      keyPoints: [
        '【L1-2】挨拶・声かけ：おはようございます / ごちそうさまでした / おやすみなさい',
        '【L3】報告・連絡：〜を確認しました / 申し送りに記録します',
        '【L4】道案内：まっすぐ進んで右に曲がります',
        '【L5】体調確認：どこが痛いですか？ / 胸が苦しい→即報告',
        '【L6】依頼・断り：〜していただけますか？ / 申し訳ありませんが…',
        '【L7-11】食事・電話・礼儀・ケアダイアログ・家族対応の総合演習',
      ],
      vocabulary: [
        { word: '総復習', reading: 'そうふくしゅう', meaning: '全部の復習（ôn tập tổng hợp）', example: '総復習テストです' },
        { word: 'ロールプレイ', reading: 'ろーるぷれい', meaning: '役割演技（nhập vai）', example: 'ロールプレイで練習する' },
        { word: '実践', reading: 'じっせん', meaning: '実際にやること（thực hành）', example: '実践的な会話' },
        { word: '臨機応変', reading: 'りんきおうへん', meaning: '状況に合わせて対応（linh hoạt）', example: '臨機応変に対応する' },
        { word: '応用', reading: 'おうよう', meaning: '使いこなすこと（ứng dụng）', example: '学んだ表現を応用する' },
        { word: '自信', reading: 'じしん', meaning: '自己信頼（tự tin）', example: '会話に自信がつく' },
      ],
      dialogue: [
        { speaker: 'スタッフ', japanese: 'おはようございます、田中さん。昨夜はよく眠れましたか？', reading: 'おはようございます、たなかさん。ゆうべはよくねむれましたか？', translation: 'Chào buổi sáng bác Tanaka. Tối qua bác ngủ ngon không?' },
        { speaker: '利用者', japanese: 'おはようございます。少し腰が痛くて…', reading: 'おはようございます。すこしこしがいたくて…', translation: 'Chào buổi sáng. Tôi hơi đau lưng một chút...' },
        { speaker: 'スタッフ', japanese: 'そうですか。いつからですか？昨日から続いていますか？', reading: 'そうですか。いつからですか？きのうからつづいていますか？', translation: 'Vậy ạ. Từ lúc nào vậy? Từ hôm qua liên tục không?' },
        { speaker: '利用者', japanese: '昨夜からです。朝食後に薬を飲んでもいいですか？', reading: 'ゆうべからです。ちょうしょくごにくすりをのんでもいいですか？', translation: 'Từ tối qua. Sau bữa sáng tôi có thể uống thuốc không?' },
        { speaker: 'スタッフ', japanese: 'はい、食後に飲んでください。念のため主任に報告しておきますね。', reading: 'はい、しょくごにのんでください。ねんのためしゅにんにほうこくしておきますね。', translation: 'Vâng, hãy uống sau bữa ăn. Để phòng khi, tôi sẽ báo cáo với trưởng nhóm nhé.' },
      ],
      examples: [
        { japanese: 'ご報告します。山本さんが「気持ち悪い」と言っていました。すぐに確認していただけますか？', reading: 'ごほうこくします。やまもとさんが「きもちわるい」といっていました。すぐにかくにんしていただけますか？', translation: 'Tôi xin báo cáo. Bác Yamamoto nói cảm thấy buồn nôn. Bạn có thể kiểm tra ngay không?' },
        { japanese: 'お食事の準備ができました。召し上がってください。ご飯はやわらかめになっております。', reading: 'おしょくじのじゅんびができました。めしあがってください。ごはんはやわらかめになっております。', translation: 'Đã chuẩn bị xong bữa ăn. Mời bác dùng. Cơm đã được làm mềm hơn.' },
        { japanese: '先ほどの対応が遅くなり、大変申し訳ありませんでした。今後は迅速に対応いたします。', reading: 'さきほどのたいおうがおそくなり、たいへんもうしわけありませんでした。こんごはじんそくにたいおういたします。', translation: 'Xử lý chậm lúc nãy, tôi thực sự rất xin lỗi. Từ nay về sau tôi sẽ xử lý nhanh chóng hơn.' },
      ],
      grammarNote: `【N5会話コース 総まとめ】

L1：挨拶・自己紹介の基本
L2：起床・食事・就寝の声かけ
L3：報告・連絡・相談（ほうれんそう）
L4：道案内（まっすぐ・右・左・突き当たり）
L5：体調報告（部位＋症状＋緊急対応）
L6：依頼と断り（〜していただけますか？）
L7：食事・好み・食事制限
L8：電話対応（受ける・伝言・切る）
L9：お礼・謝罪の段階表現
L10：介護ケアの実践ダイアログ
L11：家族・個人情報の会話

【実践のために】
日本語は「状況に合わせた使い分け」が大切です。
自信を持って、実際の現場でも使いましょう！`,
      quizzes: [
        {
          question: '利用者が「胸が苦しい」と言った。まず何をすべきか？',
          options: [
            { id: 'a', text: '水を飲ませる' },
            { id: 'b', text: '様子を見る' },
            { id: 'c', text: '即座に看護師・医師に報告する' },
            { id: 'd', text: '薬を飲ませる' },
          ],
          correctId: 'c',
          explanation: '胸の苦しさは心筋梗塞など緊急疾患の可能性。即座に報告が最優先。\nTức ngực có thể là khẩn cấp - báo ngay là ưu tiên.',
          difficulty: 'hard' as const,
        },
        {
          question: '「承知しました」の意味は？',
          options: [
            { id: 'a', text: 'わかりません' },
            { id: 'b', text: '（丁寧に）わかりました・了解しました' },
            { id: 'c', text: 'おはようございます' },
            { id: 'd', text: 'ありがとうございます' },
          ],
          correctId: 'b',
          explanation: '「承知しました」は「わかりました」の丁寧語。職場の上司に使う。\n"Shōchi shimashita" = hiểu rồi (lịch sự), dùng với cấp trên.',
          difficulty: 'easy' as const,
        },
        {
          question: '電話で担当者が不在のとき何と言う？',
          options: [
            { id: 'a', text: 'いません' },
            { id: 'b', text: 'ただいま席を外しております' },
            { id: 'c', text: 'わかりません' },
            { id: 'd', text: '出かけています' },
          ],
          correctId: 'b',
          explanation: '「ただいま席を外しております」が電話での正式な不在表現。\n"Tadaima seki wo hazushite orimasu" = hiện đang vắng mặt (cách nói điện thoại).',
          difficulty: 'medium' as const,
        },
        {
          question: '食事の終わりに言う挨拶は？',
          options: [
            { id: 'a', text: 'おはようございます' },
            { id: 'b', text: 'いただきます' },
            { id: 'c', text: 'ごちそうさまでした' },
            { id: 'd', text: 'おやすみなさい' },
          ],
          correctId: 'c',
          explanation: '食後は「ごちそうさまでした」。食前は「いただきます」。\n"Gochisousama deshita" nói sau bữa ăn.',
          difficulty: 'easy' as const,
        },
        {
          question: '最も丁寧な謝罪表現は？',
          options: [
            { id: 'a', text: 'ごめんなさい' },
            { id: 'b', text: 'すみません' },
            { id: 'c', text: '大変申し訳ございませんでした' },
            { id: 'd', text: 'ごめんね' },
          ],
          correctId: 'c',
          explanation: '「大変申し訳ございませんでした」が職場での最も丁寧な謝罪。\n"Taihen mōshiwake gozaimasen deshita" là cách xin lỗi lịch sự nhất.',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 50,
    },
  },

  // ===== N5 漢字 =====
  'n5-05': {
    courseTitle: { ja: 'N5 漢字入門 〜80字〜', vi: 'Nhập môn Kanji N5 - 80 chữ' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N5漢字: 人・日・時・体・食',
      titleTranslation: 'Kanji N5: 人・日・時・体・食 — Thường dùng trong điều dưỡng',
      introduction: `N5の漢字80字の中で、介護現場で最もよく使う5つの漢字を学びます。「人・日・時・体・食」はケア記録や日常会話に毎日登場します。

Trong 80 chữ Kanji N5, hãy học 5 chữ dùng nhiều nhất trong môi trường điều dưỡng: 人・日・時・体・食. Các chữ này xuất hiện hàng ngày trong hồ sơ chăm sóc và giao tiếp hàng ngày.`,
      keyPoints: [
        '人（ひと・じん・にん）: 人（ひと）、日本人（にほんじん）、一人（ひとり）',
        '日（ひ・にち・じつ）: 今日（きょう）、毎日（まいにち）、日曜日（にちようび）',
        '時（とき・じ）: 時間（じかん）、何時（なんじ）、時々（ときどき）',
        '体（からだ・たい）: 体（からだ）、体温（たいおん）、体調（たいちょう）',
        '食（しょく・た）: 食事（しょくじ）、食べる（たべる）、食後（しょくご）',
      ],
      vocabulary: [
        { word: '一人', reading: 'ひとり', meaning: '1人（một người）', example: '一人で歩く' },
        { word: '毎日', reading: 'まいにち', meaning: '毎日（mỗi ngày）', example: '毎日薬を飲む' },
        { word: '体温', reading: 'たいおん', meaning: '体の温度（nhiệt độ cơ thể）', example: '体温を測る' },
        { word: '食後', reading: 'しょくご', meaning: '食事の後（sau bữa ăn）', example: '食後に薬を飲む' },
        { word: '時間', reading: 'じかん', meaning: '時間（thời gian）', example: 'お食事の時間' },
        { word: '体調', reading: 'たいちょう', meaning: '体の状態（tình trạng sức khỏe）', example: '体調はいかがですか' },
      ],
      examples: [
        { japanese: '体温は36度です。食後に薬を飲んでください。', reading: 'たいおんは36どです。しょくごにくすりをのんでください。', translation: 'Nhiệt độ cơ thể là 36 độ. Hãy uống thuốc sau bữa ăn.' },
        { japanese: '今日は一人で食事ができました。', reading: 'きょうはひとりでしょくじができました。', translation: 'Hôm nay đã tự ăn được một mình.' },
        { japanese: '毎日の体調チェックが大切です。', reading: 'まいにちのたいちょうちぇっくがたいせつです。', translation: 'Kiểm tra sức khỏe hàng ngày rất quan trọng.' },
      ],
      grammarNote: `【漢字の読み方パターン】
音読み（おんよみ）= 中国語由来の読み方 → 熟語に多い
訓読み（くんよみ）= 日本語の読み方 → 単独使用に多い

例：体（からだ）訓読み ← 単独
   体温（たいおん）音読み ← 熟語

【介護で毎日使う漢字熟語】
体温・体調・食事・食後・時間・毎日・一人・本人`,
      quiz: {
        question: '「食後」の読み方は？',
        options: [
          { id: 'a', text: 'たべご' },
          { id: 'b', text: 'しょくご' },
          { id: 'c', text: 'しょくこう' },
          { id: 'd', text: 'たべあと' },
        ],
        correctId: 'b',
        explanation: '食後（しょくご）= 食事の後。「食」の音読みは「しょく」、「後」の音読みは「ご・こう」。食後に使うことが多い表現です。\n食後（しょくご）= sau bữa ăn. Âm on của 食 là "shoku".',
      },
      xpReward: 25,
    },
  },

  'n5-05-2': {
    courseTitle: { ja: 'N5 漢字入門 〜80字〜', vi: 'Nhập môn Kanji N5 - 80 chữ' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N5漢字L2: 大・小・上・下・中・左・右',
      titleTranslation: 'Kanji N5 Bài 2: 大・小・上・下・中・左・右 — Kích thước & Phương hướng',
      introduction: `大きさや方向を表す7つの漢字を学びます。介護の現場では「上半身・下肢・左右確認・体の中央」など、場所・方向の表現が毎日使われます。

Hãy học 7 chữ Kanji biểu thị kích thước và hướng. Trong môi trường điều dưỡng, các cách diễn đạt về vị trí và hướng như "上半身・下肢・左右確認・体の中央" được dùng hàng ngày.`,
      keyPoints: [
        '大（だい・おお）: 大きい（おおきい）、大人（おとな）、大切（たいせつ）',
        '小（しょう・ちい）: 小さい（ちいさい）、小学校（しょうがっこう）',
        '上（うえ・じょう）: 上（うえ）、上半身（じょうはんしん）、以上（いじょう）',
        '下（した・か・げ）: 下（した）、下肢（かし）、以下（いか）',
        '中（なか・ちゅう）: 中（なか）、中心（ちゅうしん）、中断（ちゅうだん）',
        '左（ひだり・さ）: 左（ひだり）、左手（ひだりて）、左側（ひだりがわ）',
        '右（みぎ・う・ゆう）: 右（みぎ）、右手（みぎて）、右側（みぎがわ）',
      ],
      vocabulary: [
        { word: '上半身', reading: 'じょうはんしん', meaning: '腰より上の体（nửa trên cơ thể）', example: '上半身を起こします' },
        { word: '下肢', reading: 'かし', meaning: '足のこと（chi dưới）', example: '下肢の浮腫を確認する' },
        { word: '大切', reading: 'たいせつ', meaning: '重要（quan trọng）', example: '安全が大切です' },
        { word: '中心', reading: 'ちゅうしん', meaning: 'まん中（trung tâm）', example: '体の中心を保つ' },
        { word: '左右', reading: 'さゆう', meaning: '左と右（trái và phải）', example: '左右の確認をする' },
        { word: '以上', reading: 'いじょう', meaning: '〜より多い（hơn〜）', example: '37度以上は発熱' },
        { word: '以下', reading: 'いか', meaning: '〜より少ない（dưới〜）', example: '60kg以下を維持する' },
      ],
      examples: [
        { japanese: '上半身を少し起こしてください。背中の下にクッションを入れます。', reading: 'じょうはんしんをすこしおこしてください。せなかのしたにくっしょんをいれます。', translation: 'Hãy nâng phần trên cơ thể lên một chút. Đặt gối vào dưới lưng.' },
        { japanese: '体温が37.5度以上のときはすぐに報告してください。', reading: 'たいおんが37.5どいじょうのときはすぐにほうこくしてください。', translation: 'Khi nhiệt độ cơ thể từ 37.5 độ trở lên, hãy báo cáo ngay.' },
        { japanese: '左右の足の浮腫の大きさを確認します。', reading: 'さゆうのあしのふしゅのおおきさをかくにんします。', translation: 'Kiểm tra mức độ phù nề ở hai chân trái và phải.' },
      ],
      grammarNote: `【方向・位置の漢字熟語】
上：上半身・以上・上着・上向き
下：下肢・以下・下着・下向き
左：左手・左側・左折・左右
右：右手・右側・右折・左右
中：中心・中断・集中・中止

【大小の使い分け】
大きい（おおきい）← 形容詞（tính từ）
大（だい）← 接頭辞・熟語（đứng đầu từ ghép）
例：大切（たいせつ）・大事（だいじ）・大好き（だいすき）

【介護で重要な位置語】
上半身（じょうはんしん）= nửa trên
下肢（かし）= chi dưới
左右確認（さゆうかくにん）= kiểm tra hai bên`,
      quiz: {
        question: '「下肢（かし）」とはどの部位ですか？',
        options: [
          { id: 'a', text: '腕（うで）' },
          { id: 'b', text: '足（あし）・膝から下' },
          { id: 'c', text: '腰（こし）' },
          { id: 'd', text: '頭（あたま）' },
        ],
        correctId: 'b',
        explanation: '「下肢（かし）」は「下（した）」+「肢（し：手足）」で、下の手足、つまり足・膝から下の部位。\n"下肢（かし）" = "下" (dưới) + "肢" (tay chân) = chi dưới (từ đầu gối xuống).',
      },
      xpReward: 25,
    },
  },

  'n5-05-3': {
    courseTitle: { ja: 'N5 漢字入門 〜80字〜', vi: 'Nhập môn Kanji N5 - 80 chữ' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N5漢字L3: 山・川・田・木・本・火・水',
      titleTranslation: 'Kanji N5 Bài 3: 山・川・田・木・本・火・水 — Tự nhiên & Gốc rễ',
      introduction: `自然を表す漢字と、そこから派生した重要語を学びます。「本」は「もと（根元・基本）」を意味し、「水分補給」「火気厳禁」など介護・医療の書類でもよく登場します。

Hãy học các chữ Kanji biểu thị tự nhiên và các từ quan trọng được phát sinh từ đó. "本" có nghĩa là "gốc/cơ bản", và các chữ như 水分補給, 火気厳禁 cũng thường xuất hiện trong tài liệu điều dưỡng và y tế.`,
      keyPoints: [
        '山（やま・さん）: 山（やま）、富士山（ふじさん）、山田（やまだ・名前）',
        '川（かわ・がわ）: 川（かわ）、川口（かわぐち・名前）',
        '田（た・でん）: 田中（たなか・名前）、田舎（いなか）',
        '木（き・もく・ぼく）: 木（き）、木曜日（もくようび）',
        '本（ほん・もと）: 本（ほん）、日本（にほん）、基本（きほん）',
        '火（ひ・か）: 火（ひ）、火曜日（かようび）、火気（かき）',
        '水（みず・すい）: 水（みず）、水分（すいぶん）、水曜日（すいようび）',
      ],
      vocabulary: [
        { word: '水分補給', reading: 'すいぶんほきゅう', meaning: '水を飲む（bổ sung nước）', example: 'こまめに水分補給してください' },
        { word: '基本', reading: 'きほん', meaning: '土台・もと（cơ bản）', example: '介護の基本を学ぶ' },
        { word: '日本語', reading: 'にほんご', meaning: '日本の言語（tiếng Nhật）', example: '日本語を勉強する' },
        { word: '木曜日', reading: 'もくようび', meaning: '週の4日目（thứ Năm）', example: '木曜日に入浴します' },
        { word: '火気厳禁', reading: 'かきげんきん', meaning: '火を使ってはいけない（cấm lửa）', example: '酸素使用中は火気厳禁' },
        { word: '田中', reading: 'たなか', meaning: '日本の苗字（họ Tanaka）', example: '田中さん、薬の時間です' },
      ],
      examples: [
        { japanese: '水分補給は1日1.5リットルを目標にしています。', reading: 'すいぶんほきゅうは1にち1.5りっとるをもくひょうにしています。', translation: 'Mục tiêu bổ sung nước là 1.5 lít mỗi ngày.' },
        { japanese: '酸素吸入中は火気厳禁です。必ず確認してください。', reading: 'さんそきゅうにゅうちゅうはかきげんきんです。かならずかくにんしてください。', translation: 'Trong khi hút oxy, cấm sử dụng lửa. Hãy nhớ xác nhận.' },
        { japanese: '田中さんの基本情報を確認してください。', reading: 'たなかさんのきほんじょうほうをかくにんしてください。', translation: 'Hãy xác nhận thông tin cơ bản của bác Tanaka.' },
      ],
      grammarNote: `【曜日の漢字】
月（つき）→ 月曜日（げつようび）Monday
火（ひ）→ 火曜日（かようび）Tuesday
水（みず）→ 水曜日（すいようび）Wednesday
木（き）→ 木曜日（もくようび）Thursday
金（かね）→ 金曜日（きんようび）Friday
土（つち）→ 土曜日（どようび）Saturday
日（ひ）→ 日曜日（にちようび）Sunday

【「本」の多様な意味】
本（ほん）= cuốn sách
日本（にほん）= nước Nhật
基本（きほん）= cơ bản
本人（ほんにん）= bản thân / chính người đó
本日（ほんじつ）= hôm nay（formal）`,
      quiz: {
        question: '「水分補給（すいぶんほきゅう）」の意味は？',
        options: [
          { id: 'a', text: '水を出す' },
          { id: 'b', text: '水分を十分に摂ること' },
          { id: 'c', text: '薬を飲む' },
          { id: 'd', text: '入浴する' },
        ],
        correctId: 'b',
        explanation: '水分（すいぶん）= nước/độ ẩm、補給（ほきゅう）= bổ sung。水分補給 = bổ sung nước cho cơ thể。介護では脱水予防に重要。',
      },
      xpReward: 25,
    },
  },

  'n5-05-4': {
    courseTitle: { ja: 'N5 漢字入門 〜80字〜', vi: 'Nhập môn Kanji N5 - 80 chữ' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N5漢字L4: 学・校・先・生・年・月・週',
      titleTranslation: 'Kanji N5 Bài 4: 学・校・先・生・年・月・週 — Học tập & Thời gian',
      introduction: `学習・時間に関する7つの漢字を学びます。「先生・学校・今年・先月・今週」など、日常会話や書類でよく使う表現が多数あります。介護記録の日付・期間の表現にも必須です。

Hãy học 7 chữ Kanji liên quan đến học tập và thời gian. Có nhiều cách diễn đạt thường dùng trong hội thoại hàng ngày và tài liệu như 先生・学校・今年・先月・今週. Cũng cần thiết cho cách diễn đạt ngày tháng và khoảng thời gian trong hồ sơ điều dưỡng.`,
      keyPoints: [
        '学（まな・がく）: 学ぶ（まなぶ）、学校（がっこう）、学習（がくしゅう）',
        '校（こう）: 学校（がっこう）、高校（こうこう）',
        '先（さき・せん）: 先生（せんせい）、先月（せんげつ）、先週（せんしゅう）',
        '生（いき・せい・しょう）: 先生（せんせい）、誕生日（たんじょうび）、生活（せいかつ）',
        '年（とし・ねん）: 今年（ことし）、去年（きょねん）、〜年前（〜ねんまえ）',
        '月（つき・がつ・げつ）: 今月（こんげつ）、先月（せんげつ）、来月（らいげつ）',
        '週（しゅう）: 今週（こんしゅう）、先週（せんしゅう）、来週（らいしゅう）',
      ],
      vocabulary: [
        { word: '先生', reading: 'せんせい', meaning: '教える人（thầy/cô giáo・bác sĩ）', example: '先生に相談します' },
        { word: '生活', reading: 'せいかつ', meaning: '日常の暮らし（cuộc sống）', example: '日常生活の支援' },
        { word: '今年', reading: 'ことし', meaning: 'この年（năm nay）', example: '今年から介護を始めた' },
        { word: '先月', reading: 'せんげつ', meaning: '前の月（tháng trước）', example: '先月から体重が減った' },
        { word: '来週', reading: 'らいしゅう', meaning: '次の週（tuần tới）', example: '来週、家族が面会に来る' },
        { word: '誕生日', reading: 'たんじょうび', meaning: '生まれた日（ngày sinh nhật）', example: '田中さんの誕生日は来月です' },
      ],
      examples: [
        { japanese: '先月から体重が2kg減少しています。先生に報告します。', reading: 'せんげつからたいじゅうが2kgげんしょうしています。せんせいにほうこくします。', translation: 'Từ tháng trước cân nặng đã giảm 2kg. Tôi sẽ báo cáo với bác sĩ.' },
        { japanese: '今週の入浴スケジュールを確認してください。', reading: 'こんしゅうのにゅうよくすけじゅーるをかくにんしてください。', translation: 'Hãy xác nhận lịch tắm của tuần này.' },
        { japanese: '日常生活の自立を支援するのが介護の目標です。', reading: 'にちじょうせいかつのじりつをしえんするのがかいごのもくひょうです。', translation: 'Mục tiêu của điều dưỡng là hỗ trợ tự lập trong cuộc sống hàng ngày.' },
      ],
      grammarNote: `【時間の表現パターン】
今〜（kon〜）= hiện tại
今日（きょう）・今週（こんしゅう）・今月（こんげつ）・今年（ことし）

先〜（sen〜）= trước đó
先日（せんじつ）・先週（せんしゅう）・先月（せんげつ）

来〜（rai〜）= sau này
来週（らいしゅう）・来月（らいげつ）・来年（らいねん）

【「先生」の使い方】
学校の先生 = thầy/cô giáo
お医者さん = bác sĩ（でも「先生」と呼ぶのが一般的）
介護施設では医師・看護師長なども「先生」と呼ぶことがある`,
      quiz: {
        question: '「先月（せんげつ）」の意味は？',
        options: [
          { id: 'a', text: '来月' },
          { id: 'b', text: '今月' },
          { id: 'c', text: '前の月' },
          { id: 'd', text: '毎月' },
        ],
        correctId: 'c',
        explanation: '先（せん）= trước。先月 = tháng trước。同様に先週（せんしゅう）= tuần trước、先日（せんじつ）= hôm trước。',
      },
      xpReward: 25,
    },
  },

  'n5-05-5': {
    courseTitle: { ja: 'N5 漢字入門 〜80字〜', vi: 'Nhập môn Kanji N5 - 80 chữ' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N5漢字L5: 見・聞・書・読・話・来・行',
      titleTranslation: 'Kanji N5 Bài 5: 見・聞・書・読・話・来・行 — Động từ cơ bản',
      introduction: `日本語で最もよく使う動詞の漢字7つを学びます。これらは「見学・聞取り・書類・読書・会話・来院・外出」など、介護書類や職場のコミュニケーションで毎日使われます。

Hãy học 7 chữ Kanji của những động từ dùng nhiều nhất trong tiếng Nhật. Các chữ này được dùng hàng ngày trong tài liệu điều dưỡng và giao tiếp tại nơi làm việc như 見学・聞取り・書類・読書・会話・来院・外出.`,
      keyPoints: [
        '見（み・けん）: 見る（みる）、見学（けんがく）、意見（いけん）',
        '聞（き・ぶん）: 聞く（きく）、聞取り（ききとり）、新聞（しんぶん）',
        '書（か・しょ）: 書く（かく）、書類（しょるい）、教科書（きょうかしょ）',
        '読（よ・どく）: 読む（よむ）、読書（どくしょ）',
        '話（はな・わ）: 話す（はなす）、会話（かいわ）、電話（でんわ）',
        '来（く・らい）: 来る（くる）、来院（らいいん）、来日（らいにち）',
        '行（い・こう）: 行く（いく）、外行（がいこう）→外出（がいしゅつ）',
      ],
      vocabulary: [
        { word: '書類', reading: 'しょるい', meaning: '文書（tài liệu）', example: '書類に記入する' },
        { word: '会話', reading: 'かいわ', meaning: '話し合い（hội thoại）', example: '日本語で会話する' },
        { word: '聞取り', reading: 'ききとり', meaning: 'ヒアリング（nghe hiểu）', example: '利用者から聞取りをする' },
        { word: '来院', reading: 'らいいん', meaning: '病院に来る（đến viện）', example: '家族が来院します' },
        { word: '外出', reading: 'がいしゅつ', meaning: '外に出ること（ra ngoài）', example: '外出の許可が必要です' },
        { word: '意見', reading: 'いけん', meaning: '考え（ý kiến）', example: '利用者の意見を聞く' },
      ],
      examples: [
        { japanese: '毎朝、利用者の様子を見て記録します。聞取りも大切です。', reading: 'まいあさ、りようしゃのようすをみてきろくします。ききとりもたいせつです。', translation: 'Mỗi sáng, tôi quan sát tình trạng người dùng và ghi chép. Nghe hiểu cũng rất quan trọng.' },
        { japanese: '書類に名前と日付を書いてください。', reading: 'しょるいになまえとひづけをかいてください。', translation: 'Hãy viết tên và ngày tháng vào tài liệu.' },
        { japanese: '外出の際は必ず帰院時間を確認してください。', reading: 'がいしゅつのさいはかならずきいんじかんをかくにんしてください。', translation: 'Khi ra ngoài, nhất định hãy xác nhận giờ về.' },
      ],
      grammarNote: `【動詞漢字の訓読み（動詞形）】
見る（みる）・見た・見て・見ます
聞く（きく）・聞いた・聞いて・聞きます
書く（かく）・書いた・書いて・書きます
読む（よむ）・読んだ・読んで・読みます
話す（はなす）・話した・話して・話します
来る（くる）・来た・来て・来ます（不規則！）
行く（いく）・行った・行って・行きます

【熟語での音読み】
見：見学・意見・発見
聞：聞取り・新聞・見聞
書：書類・書道・読書
話：会話・電話・童話
来：来院・来日・来月`,
      quiz: {
        question: '「書類（しょるい）」の意味は？',
        options: [
          { id: 'a', text: '本（書物）' },
          { id: 'b', text: '文書・紙の資料' },
          { id: 'c', text: '書く道具' },
          { id: 'd', text: '教科書' },
        ],
        correctId: 'b',
        explanation: '書類（しょるい）= 書（文書）+ 類（종류/種類）→ 文書・紙の資料のこと。介護記録・申請書など介護現場の「書類」は毎日作成します。',
      },
      xpReward: 25,
    },
  },

  'n5-05-6': {
    courseTitle: { ja: 'N5 漢字入門 〜80字〜', vi: 'Nhập môn Kanji N5 - 80 chữ' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N5漢字L6: 金・円・百・千・万・白・赤',
      titleTranslation: 'Kanji N5 Bài 6: 金・円・百・千・万・白・赤 — Tiền tệ & Màu sắc',
      introduction: `お金の単位と色を表す漢字を学びます。「金額・円・白衣・赤信号・万全」など、日常生活と医療介護の場面で頻出の表現です。数字の漢字は給与・保険・費用の書類にも必須です。

Hãy học các chữ Kanji biểu thị đơn vị tiền tệ và màu sắc. Các cách diễn đạt thường gặp trong cuộc sống hàng ngày và môi trường y tế điều dưỡng như 金額・円・白衣・赤信号・万全. Chữ số Kanji cũng cần thiết cho tài liệu lương, bảo hiểm, chi phí.`,
      keyPoints: [
        '金（かね・きん）: お金（おかね）、金額（きんがく）、金曜日（きんようび）',
        '円（えん）: 円（えん・通貨）、円高（えんだか）、一円（いちえん）',
        '百（ひゃく）: 百円（ひゃくえん）、百人（ひゃくにん）',
        '千（せん）: 千円（せんえん）、千人（せんにん）',
        '万（まん）: 一万円（いちまんえん）、万全（ばんぜん）',
        '白（しろ・はく）: 白い（しろい）、白衣（はくい）、白血球（はっけっきゅう）',
        '赤（あか・せき）: 赤い（あかい）、赤信号（あかしんごう）、赤ちゃん（あかちゃん）',
      ],
      vocabulary: [
        { word: '金額', reading: 'きんがく', meaning: 'お金の量（số tiền）', example: '利用料金の金額を確認する' },
        { word: '白衣', reading: 'はくい', meaning: '医療・介護スタッフの白い服（áo trắng y tế）', example: '白衣を着る' },
        { word: '万全', reading: 'ばんぜん', meaning: '完璧な準備（chu đáo/hoàn hảo）', example: '万全の準備をする' },
        { word: '赤ちゃん', reading: 'あかちゃん', meaning: '乳幼児（em bé）', example: '赤ちゃんのように大切に' },
        { word: '赤信号', reading: 'あかしんごう', meaning: '止まれ（đèn đỏ）', example: '赤信号では止まる' },
        { word: '白血球', reading: 'はっけっきゅう', meaning: '免疫の血球（bạch cầu）', example: '白血球の数値を確認する' },
      ],
      examples: [
        { japanese: '介護保険の利用料金は月に数千円から数万円です。', reading: 'かいごほけんのりようりょうきんはつきにすうせんえんからすうまんえんです。', translation: 'Chi phí sử dụng bảo hiểm điều dưỡng là vài nghìn đến vài chục nghìn yên mỗi tháng.' },
        { japanese: '白衣は清潔に保ち、毎日洗濯してください。', reading: 'はくいはせいけつにたもち、まいにちせんたくしてください。', translation: 'Hãy giữ áo trắng sạch sẽ và giặt mỗi ngày.' },
        { japanese: '万全の準備で利用者さんをお迎えします。', reading: 'ばんぜんのじゅんびでりようしゃさんをおむかえします。', translation: 'Chúng tôi đón tiếp người dùng với sự chuẩn bị chu đáo.' },
      ],
      grammarNote: `【日本の通貨単位と数え方】
1円（いちえん）= 1 yên
100円（ひゃくえん）= 100 yên
1,000円（せんえん）= 1.000 yên
10,000円（いちまんえん）= 10.000 yên
100,000円（じゅうまんえん）= 100.000 yên

【色の表現】
白（しろ/はく）= trắng：白衣・白髪（はくはつ）
赤（あか/せき）= đỏ：赤血球（せっけっきゅう）
青（あお/せい）= xanh：青信号（あおしんごう）
黒（くろ/こく）= đen：黒板（こくばん）
黄（き/おう）= vàng：黄色（きいろ）

【医療系の白・赤漢字】
白血球（はっけっきゅう）= bạch cầu
赤血球（せっけっきゅう）= hồng cầu`,
      quiz: {
        question: '「万全の準備（ばんぜんのじゅんび）」の意味は？',
        options: [
          { id: 'a', text: '一万円の準備' },
          { id: 'b', text: '何も準備しない' },
          { id: 'c', text: 'すべてにおいて完璧な準備' },
          { id: 'd', text: 'お金の準備' },
        ],
        correctId: 'c',
        explanation: '万全（ばんぜん）= 万（すべて）+ 全（全部）→ 完璧・完全な準備のこと。"Banzen" = chuẩn bị hoàn hảo/chu đáo。',
      },
      xpReward: 25,
    },
  },

  'n5-05-7': {
    courseTitle: { ja: 'N5 漢字入門 〜80字〜', vi: 'Nhập môn Kanji N5 - 80 chữ' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N5漢字L7: 医・病・薬・手・目・耳・口',
      titleTranslation: 'Kanji N5 Bài 7: 医・病・薬・手・目・耳・口 — Y tế & Bộ phận cơ thể',
      introduction: `介護・医療の現場で最重要の漢字7つです。「医師・病院・薬剤・手術・目薬・耳鳴り・口腔ケア」など、毎日の業務・書類に必ず出てきます。これらをマスターすることで仕事の理解が格段に向上します。

Đây là 7 chữ Kanji quan trọng nhất trong môi trường điều dưỡng và y tế. Các từ như 医師・病院・薬剤・手術・目薬・耳鳴り・口腔ケア chắc chắn xuất hiện trong công việc hàng ngày và tài liệu. Thành thạo những chữ này sẽ cải thiện đáng kể sự hiểu biết công việc của bạn.`,
      keyPoints: [
        '医（い）: 医師（いし）、医療（いりょう）、医院（いいん）',
        '病（やまい・びょう）: 病気（びょうき）、病院（びょういん）、病室（びょうしつ）',
        '薬（くすり・やく）: 薬（くすり）、薬剤師（やくざいし）、目薬（めぐすり）',
        '手（て・しゅ）: 手（て）、手術（しゅじゅつ）、手洗い（てあらい）',
        '目（め・もく）: 目（め）、目薬（めぐすり）、目標（もくひょう）',
        '耳（みみ・じ）: 耳（みみ）、耳鳴り（みみなり）、耳鼻科（じびか）',
        '口（くち・こう）: 口（くち）、口腔（こうくう）、口座（こうざ）',
      ],
      vocabulary: [
        { word: '医師', reading: 'いし', meaning: 'お医者さん（bác sĩ）', example: '医師の指示に従う' },
        { word: '口腔ケア', reading: 'こうくうけあ', meaning: '口の中のケア（chăm sóc khoang miệng）', example: '食後に口腔ケアをする' },
        { word: '手洗い', reading: 'てあらい', meaning: '手を洗う（rửa tay）', example: 'こまめに手洗いする' },
        { word: '目標', reading: 'もくひょう', meaning: '達成したいこと（mục tiêu）', example: '今月の目標を立てる' },
        { word: '病室', reading: 'びょうしつ', meaning: '入院している部屋（phòng bệnh）', example: '病室を清潔に保つ' },
        { word: '薬剤師', reading: 'やくざいし', meaning: '薬の専門家（dược sĩ）', example: '薬剤師に確認する' },
      ],
      examples: [
        { japanese: '食後の口腔ケアと手洗いは感染予防の基本です。', reading: 'しょくごのこうくうけあとてあらいはかんせんよぼうのきほんです。', translation: 'Chăm sóc khoang miệng sau bữa ăn và rửa tay là cơ bản phòng chống nhiễm khuẩn.' },
        { japanese: '目薬は医師の指示通りに点眼してください。', reading: 'めぐすりはいしのしじどおりにてんがんしてください。', translation: 'Hãy nhỏ thuốc mắt đúng theo chỉ dẫn của bác sĩ.' },
        { japanese: '耳鳴りや目のかすみがある場合は、すぐに報告してください。', reading: 'みみなりやめのかすみがあるばあいは、すぐにほうこくしてください。', translation: 'Trường hợp có ù tai hay mờ mắt, hãy báo cáo ngay.' },
      ],
      grammarNote: `【医療系漢字熟語まとめ】
医：医師・医療・医院・医学・内科医・外科医
病：病気・病院・病室・疾病・病棟
薬：薬（くすり）・薬剤・目薬・薬局・投薬
手：手術・手洗い・手当て・握手
目：目薬・目標・目的・眼科
耳：耳鳴り・耳鼻科・難聴
口：口腔・口座・入口・出口

【介護で毎日使う医療漢字フレーズ】
医師の指示（いしのしじ）= theo chỉ dẫn bác sĩ
口腔ケア（こうくうけあ）= chăm sóc khoang miệng
手洗い（てあらい）= rửa tay
投薬（とうやく）= dùng thuốc
病室（びょうしつ）= phòng bệnh`,
      quiz: {
        question: '「口腔ケア（こうくうけあ）」とは何のケアですか？',
        options: [
          { id: 'a', text: '耳のケア' },
          { id: 'b', text: '目のケア' },
          { id: 'c', text: '口の中のケア（歯磨き・うがい等）' },
          { id: 'd', text: '手のケア' },
        ],
        correctId: 'c',
        explanation: '口腔（こうくう）= khoang miệng（口の中）。口腔ケア = chăm sóc khoang miệng（đánh răng, súc miệng）。介護では誤嚥性肺炎予防に重要。',
      },
      xpReward: 25,
    },
  },

  'n5-05-8': {
    courseTitle: { ja: 'N5 漢字入門 〜80字〜', vi: 'Nhập môn Kanji N5 - 80 chữ' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N5漢字L8: 総復習テスト〜N5漢字80字〜',
      titleTranslation: 'Kanji N5 Bài 8: Kiểm tra tổng hợp - 80 chữ Kanji N5',
      introduction: `N5漢字コースの総まとめです。全7レッスンで学んだ漢字を総復習し、介護現場で使える読み書きの力を確認しましょう。読み方・意味・熟語をまとめてチェックします！

Đây là tổng kết của khóa học Kanji N5. Hãy ôn tập tổng hợp các chữ Kanji đã học trong 7 bài học và xác nhận khả năng đọc viết có thể dùng tại hiện trường điều dưỡng. Kiểm tra cùng lúc cách đọc, nghĩa và từ ghép!`,
      keyPoints: [
        '【L1】人・日・時・体・食 → 介護の基本5字',
        '【L2】大・小・上・下・中・左・右 → 方向・大きさ',
        '【L3】山・川・田・木・本・火・水 → 自然・曜日',
        '【L4】学・校・先・生・年・月・週 → 時間・学習',
        '【L5】見・聞・書・読・話・来・行 → 動詞漢字',
        '【L6】金・円・百・千・万・白・赤 → 数・通貨・色',
        '【L7】医・病・薬・手・目・耳・口 → 医療・体パーツ',
      ],
      vocabulary: [
        { word: '読み方', reading: 'よみかた', meaning: '漢字の読み方（cách đọc）', example: '漢字の読み方を覚える' },
        { word: '熟語', reading: 'じゅくご', meaning: '漢字を組み合わせた単語（từ ghép）', example: '熟語を作る' },
        { word: '訓読み', reading: 'くんよみ', meaning: '日本語の読み方（âm Nhật）', example: '水（みず）は訓読み' },
        { word: '音読み', reading: 'おんよみ', meaning: '中国語由来の読み方（âm Hán）', example: '水（すい）は音読み' },
        { word: '部首', reading: 'ぶしゅ', meaning: '漢字の構成要素（bộ thủ）', example: '部首で漢字を分類する' },
        { word: 'ストローク', reading: 'すとろーく', meaning: '画数（số nét）', example: '「山」は3画です' },
      ],
      examples: [
        { japanese: '体温・血圧・体重・食事量・水分量を毎日記録します。', reading: 'たいおん・けつあつ・たいじゅう・しょくじりょう・すいぶんりょうをまいにちきろくします。', translation: 'Ghi chép hàng ngày: nhiệt độ, huyết áp, cân nặng, lượng ăn, lượng nước.' },
        { japanese: '医師の指示に基づき、薬の投与時間と量を確認してください。', reading: 'いしのしじにもとづき、くすりのとうよじかんとりょうをかくにんしてください。', translation: 'Dựa trên chỉ dẫn của bác sĩ, hãy xác nhận thời gian và liều lượng dùng thuốc.' },
        { japanese: '先生、先月から下肢の浮腫が大きくなっています。', reading: 'せんせい、せんげつからかしのふしゅがおおきくなっています。', translation: 'Bác sĩ, từ tháng trước phù chi dưới ngày càng to hơn.' },
      ],
      grammarNote: `【N5漢字80字 全リスト】
■数字：一二三四五六七八九十百千万
■人・関係：人女男子父母兄姉弟妹
■自然：山川田木本土石火水日月
■方向・大きさ：上下中大小左右
■時間：年月週時分
■体・医療：体手目耳口足医病薬
■学習・仕事：学校先生書読話
■生活：食飲来行見聞金円白赤

【覚え方のコツ】
①まず読み方（訓読み）を覚える
②次に熟語（音読み）で使い方を覚える
③介護の文章で使うことで定着させる`,
      quizzes: [
        {
          question: '「口腔ケア」の読み方は？',
          options: [
            { id: 'a', text: 'くちくうけあ' },
            { id: 'b', text: 'こうくうけあ' },
            { id: 'c', text: 'くちこうけあ' },
            { id: 'd', text: 'こうこうけあ' },
          ],
          correctId: 'b',
          explanation: '口腔（こうくう）は音読み。口（こう）+ 腔（くう）。介護現場で毎日使う言葉です。',
          difficulty: 'medium' as const,
        },
        {
          question: '「上半身（じょうはんしん）」とはどの部位ですか？',
          options: [
            { id: 'a', text: '腰より下' },
            { id: 'b', text: '腰より上（胸・腕・頭）' },
            { id: 'c', text: '足全体' },
            { id: 'd', text: '背中だけ' },
          ],
          correctId: 'b',
          explanation: '上半身 = nửa trên cơ thể（腰より上：胸・腕・頭・背中）。対義語は下半身（かはんしん）= nửa dưới。',
          difficulty: 'easy' as const,
        },
        {
          question: '「水分補給（すいぶんほきゅう）」の意味は？',
          options: [
            { id: 'a', text: '水を飲む・補う' },
            { id: 'b', text: '血圧を測る' },
            { id: 'c', text: '体温を下げる' },
            { id: 'd', text: '薬を飲む' },
          ],
          correctId: 'a',
          explanation: '水分（すいぶん）= độ ẩm/nước、補給（ほきゅう）= bổ sung。水分補給 = bổ sung nước cho cơ thể。高齢者の脱水予防に必須。',
          difficulty: 'easy' as const,
        },
        {
          question: '「医師の指示（いしのしじ）」とはどういう意味？',
          options: [
            { id: 'a', text: '看護師の命令' },
            { id: 'b', text: '家族の要望' },
            { id: 'c', text: '医者からの指示・命令' },
            { id: 'd', text: '自分の判断' },
          ],
          correctId: 'c',
          explanation: '医師（いし）= bác sĩ、指示（しじ）= chỉ thị/hướng dẫn。「医師の指示に従う」= tuân theo chỉ dẫn của bác sĩ。',
          difficulty: 'easy' as const,
        },
        {
          question: '「毎日（まいにち）」の「毎」に最も近い意味は？',
          options: [
            { id: 'a', text: '一度だけ' },
            { id: 'b', text: 'たまに' },
            { id: 'c', text: '〜のたびに・いつも' },
            { id: 'd', text: '一日' },
          ],
          correctId: 'c',
          explanation: '毎（まい）= every / mỗi。毎日（まいにち）= mỗi ngày、毎週（まいしゅう）= mỗi tuần、毎月（まいつき）= mỗi tháng。',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 50,
    },
  },

  // ===== N4 語彙 =====
  'n4-01': {
    courseTitle: { ja: 'N4 語彙マスター 〜1,000語〜', vi: 'Từ vựng N4 Master - 1000 từ' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4語彙: 介護・医療でよく使う動詞',
      titleTranslation: 'Từ vựng N4: Động từ thường dùng trong điều dưỡng & y tế',
      introduction: `N4レベルでは約1,000語の語彙が必要です。今回は介護・医療現場で最もよく使う動詞を中心に学びます。「測る・確認する・記録する・報告する」はケア業務の基本動詞です。

Cấp N4 cần khoảng 1.000 từ vựng. Lần này tập trung học các động từ dùng nhiều nhất. "測る・確認する・記録する・報告する" là động từ cơ bản trong công việc chăm sóc.`,
      keyPoints: [
        '測る（はかる）: 体温・血圧・体重を測る',
        '確認する（かくにんする）: 薬・状態・名前を確認する',
        '記録する（きろくする）: バイタル・食事量を記録する',
        '報告する（ほうこくする）: 上司・ナースに報告する',
        '介助する（かいじょする）: 食事・入浴・移動を介助する',
        '観察する（かんさつする）: 表情・様子を観察する',
      ],
      vocabulary: [
        { word: '測る', reading: 'はかる', meaning: '計測する（đo）', example: '血圧を測る' },
        { word: '確認する', reading: 'かくにんする', meaning: 'チェックする（xác nhận）', example: '薬の名前を確認する' },
        { word: '記録する', reading: 'きろくする', meaning: '書き留める（ghi chép）', example: '食事量を記録する' },
        { word: '報告する', reading: 'ほうこくする', meaning: '知らせる（báo cáo）', example: '急変を報告する' },
        { word: '観察する', reading: 'かんさつする', meaning: '注意して見る（quan sát）', example: '様子を観察する' },
        { word: '対応する', reading: 'たいおうする', meaning: '処理する（xử lý）', example: '緊急事態に対応する' },
      ],
      examples: [
        { japanese: '朝9時に血圧を測り、記録しました。', reading: 'あさくじにけつあつをはかり、きろくしました。', translation: 'Đã đo huyết áp lúc 9 giờ sáng và ghi chép lại.' },
        { japanese: '利用者さんの様子を観察し、上司に報告しました。', reading: 'りようしゃさんのようすをかんさつし、じょうしにほうこくしました。', translation: 'Đã quan sát tình trạng người dùng và báo cáo cấp trên.' },
        { japanese: '薬の種類と量を確認してから介助します。', reading: 'くすりのしゅるいとりょうをかくにんしてからかいじょします。', translation: 'Xác nhận loại và liều lượng thuốc trước khi hỗ trợ.' },
      ],
      grammarNote: `【サ変動詞の活用】
〜する → します → しました → して
例：確認する → 確認します → 確認しました

【N4重要：〜し忘れる・〜し直す・〜し続ける】
確認し忘れる = quên xác nhận
書き直す = viết lại
観察し続ける = tiếp tục quan sát`,
      quiz: {
        question: '「バイタルを（　）しました」に入る動詞は？',
        options: [
          { id: 'a', text: '食べ' },
          { id: 'b', text: '測定' },
          { id: 'c', text: '歩き' },
          { id: 'd', text: '話し' },
        ],
        correctId: 'b',
        explanation: 'バイタルサイン（体温・血圧・脈拍）は「測定（そくてい）する」が正しい表現。「測る」も使えます。\n"Dấu hiệu sinh tồn" dùng động từ 測定する hoặc 測る.',
      },
      xpReward: 25,
    },
  },

  // ===== N4 語彙マスター レッスン2〜10 =====
  'n4-01-2': {
    courseTitle: { ja: 'N4 語彙マスター 〜1,000語〜', vi: 'Từ vựng N4 Master - 1000 từ' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4語彙: 身体症状・医療名詞',
      titleTranslation: 'Từ vựng N4: Triệu chứng cơ thể và danh từ y tế',
      introduction: `介護・医療現場では、利用者の体の状態を正確に言葉で表すことが求められます。「浮腫（むくみ）」「倦怠感」「嚥下困難」など専門的な症状語を習得し、観察・申し送りの精度を高めましょう。

Trong môi trường điều dưỡng và y tế, cần diễn đạt chính xác bằng lời trạng thái cơ thể của người dùng. Hãy học các từ triệu chứng chuyên ngành như phù nề, mệt mỏi, khó nuốt để nâng cao độ chính xác khi quan sát và bàn giao ca.`,
      keyPoints: [
        '浮腫（ふしゅ）: 体の一部がむくんだ状態（phù nề） — 足首の浮腫に注意',
        '倦怠感（けんたいかん）: 全身の疲れ・だるさ（mệt mỏi toàn thân） — 倦怠感を訴える',
        '嚥下（えんげ）: 飲食物を飲み込む動作（nuốt） — 嚥下困難・嚥下反射',
        '呼吸（こきゅう）: 息をすること（hô hấp） — 呼吸数・呼吸困難',
        '血圧（けつあつ）: 血管内の圧力（huyết áp） — 収縮期血圧・拡張期血圧',
        '脈拍（みゃくはく）: 心臓の拍動（mạch đập） — 脈拍数を測る',
      ],
      vocabulary: [
        { word: '浮腫', reading: 'ふしゅ', meaning: '体組織に水分がたまる状態（phù nề）', example: '足首に浮腫が見られる' },
        { word: '倦怠感', reading: 'けんたいかん', meaning: '体全体のだるさ・疲労感（cảm giác mệt mỏi, uể oải）', example: '倦怠感を強く訴えている' },
        { word: '嚥下', reading: 'えんげ', meaning: '食物を口から胃へ送る動作（nuốt）', example: '嚥下機能が低下している' },
        { word: '呼吸', reading: 'こきゅう', meaning: '肺で空気を吸う・吐く動作（hô hấp）', example: '呼吸が浅くなっている' },
        { word: '血圧', reading: 'けつあつ', meaning: '動脈にかかる圧力（huyết áp）', example: '血圧が高めです' },
        { word: '脈拍', reading: 'みゃくはく', meaning: '心臓の収縮による血管の拍動（mạch đập）', example: '脈拍が不規則です' },
      ],
      examples: [
        { japanese: '利用者さんの足首に浮腫が見られ、呼吸も少し浅いです。', reading: 'りようしゃさんのあしくびにふしゅがみられ、こきゅうもすこしあさいです。', translation: 'Người dùng có phù ở mắt cá chân và hơi thở cũng hơi nông.' },
        { japanese: '朝から倦怠感を訴えており、血圧と脈拍を確認しました。', reading: 'あさからけんたいかんをうったえており、けつあつとみゃくはくをかくにんしました。', translation: 'Từ buổi sáng đã than mệt mỏi, đã xác nhận huyết áp và mạch đập.' },
        { japanese: '嚥下困難があるため、食事の形態を変更しました。', reading: 'えんげこんなんがあるため、しょくじのけいたいをへんこうしました。', translation: 'Do có khó nuốt, đã thay đổi dạng bữa ăn.' },
      ],
      grammarNote: `【N4文法：〜ため（原因・理由）】
「嚥下困難があるため、軟食にした」＝ Vì khó nuốt nên đổi sang thức ăn mềm
〜ため（に）は書き言葉・報告書でよく使われる丁寧な原因表現。

【関連語】
呼吸困難（こきゅうこんなん）= khó thở
浮腫（むくみ）= phù / 意識障害（いしきしょうがい）= rối loạn ý thức
チアノーゼ = tím tái / 発熱（はつねつ）= sốt`,
      quiz: {
        question: '食べ物を飲み込む動作を何といいますか？',
        options: [
          { id: 'a', text: '呼吸（こきゅう）' },
          { id: 'b', text: '嚥下（えんげ）' },
          { id: 'c', text: '脈拍（みゃくはく）' },
          { id: 'd', text: '浮腫（ふしゅ）' },
        ],
        correctId: 'b',
        explanation: '「嚥下（えんげ）」は食物を口から胃へ飲み込む動作です。「嚥下困難」は介護現場で頻出の重要語です。\n「Nuốt (えんげ)」là động tác nuốt thức ăn từ miệng xuống dạ dày. Khó nuốt là từ quan trọng thường gặp trong điều dưỡng.',
      },
      xpReward: 25,
    },
  },

  'n4-01-3': {
    courseTitle: { ja: 'N4 語彙マスター 〜1,000語〜', vi: 'Từ vựng N4 Master - 1000 từ' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4語彙: 感情・状態の形容詞',
      titleTranslation: 'Từ vựng N4: Tính từ mô tả cảm xúc và trạng thái',
      introduction: `利用者の心理状態を正確に観察・記録するためには、感情を表す語彙が欠かせません。「不安・安心・穏やか・興奮・混乱・落ち着く・つらい・楽しい」など、豊かな感情語彙を身につけましょう。

Để quan sát và ghi chép chính xác trạng thái tâm lý của người dùng, từ vựng biểu đạt cảm xúc là không thể thiếu. Hãy học phong phú từ vựng cảm xúc như lo lắng, yên tâm, bình yên, hưng phấn, bối rối, bình tĩnh, khó chịu, vui vẻ.`,
      keyPoints: [
        '不安（ふあん）: 心配で落ち着かない状態（lo lắng, bất an） — 不安を感じている',
        '安心（あんしん）: 心配がなくなり穏やかな状態（yên tâm） — 安心してもらう',
        '穏やか（おだやか）: 静かで落ち着いた様子（bình tĩnh, nhẹ nhàng） — 穏やかな表情',
        '興奮（こうふん）: 感情が高まり激しくなる（hưng phấn, kích động） — 興奮状態',
        '混乱（こんらん）: 状況がわからず戸惑う（bối rối, hỗn loạn） — 混乱している様子',
        '落ち着く（おちつく）: 気持ちが安定してくる（bình tĩnh lại） — 少し落ち着いた',
      ],
      vocabulary: [
        { word: '不安', reading: 'ふあん', meaning: '心配・不安定な気持ち（lo lắng, bất an）', example: '手術前に不安を感じる' },
        { word: '安心', reading: 'あんしん', meaning: '心配がなくなり穏やかになること（yên tâm）', example: 'ご家族が来て安心した' },
        { word: '穏やか', reading: 'おだやか', meaning: '静かで落ち着いた様子（hiền hòa, bình thản）', example: '穏やかな表情で食事した' },
        { word: '興奮', reading: 'こうふん', meaning: '感情が激しく高まる状態（kích động, hưng phấn）', example: '夕方から興奮気味になる' },
        { word: '混乱', reading: 'こんらん', meaning: '何がどうなっているか分からない状態（bối rối, lẫn lộn）', example: '場所と時間で混乱している' },
        { word: 'つらい', reading: 'つらい', meaning: '身体や心が苦しい・しんどい（đau khổ, khó chịu）', example: '痛みがつらいと話した' },
      ],
      examples: [
        { japanese: '入居当初は不安が強かったが、今は穏やかに過ごしている。', reading: 'にゅうきょとうしょはふあんがつよかったが、いまはおだやかにすごしている。', translation: 'Lúc mới vào ở rất lo lắng, nhưng bây giờ đang sống bình thản.' },
        { japanese: '夕方になると興奮し混乱する様子が見られる。', reading: 'ゆうがたになるとこうふんしこんらんするようすがみられる。', translation: 'Vào buổi chiều tối thường thấy trạng thái hưng phấn và bối rối.' },
        { japanese: '「つらい」とおっしゃっていたので、すぐに看護師に報告した。', reading: '「つらい」とおっしゃっていたので、すぐにかんごしにほうこくした。', translation: 'Vì đã nói "khó chịu", đã báo cáo ngay cho điều dưỡng viên.' },
      ],
      grammarNote: `【N4文法：〜気味（ぎみ）】
「興奮気味」「疲れ気味」= hơi kích động, hơi mệt
〜気味 は「少し〜の傾向がある」という N4 の重要表現。

【関連感情語】
悲しむ（かなしむ）= buồn / 喜ぶ（よろこぶ）= vui mừng
怒る（おこる）= tức giận / 恐れる（おそれる）= sợ hãi
寂しい（さびしい）= cô đơn / 安らぐ（やすらぐ）= thư giãn`,
      quiz: {
        question: '「（　）気味です」に入る言葉として正しいものは？',
        options: [
          { id: 'a', text: '安心' },
          { id: 'b', text: '興奮' },
          { id: 'c', text: '穏やか' },
          { id: 'd', text: '楽しい' },
        ],
        correctId: 'b',
        explanation: '「〜気味」は名詞または動詞のます形につきます。「興奮気味」は「少し興奮している」の意味。「安心気味・穏やか気味・楽しい気味」は不自然です。\n「〜気味」đi với danh từ hoặc dạng ます của động từ. 「興奮気味」có nghĩa là "hơi kích động".',
      },
      xpReward: 25,
    },
  },

  'n4-01-4': {
    courseTitle: { ja: 'N4 語彙マスター 〜1,000語〜', vi: 'Từ vựng N4 Master - 1000 từ' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4語彙: 介護業務の専門名詞',
      titleTranslation: 'Từ vựng N4: Danh từ chuyên ngành trong công việc điều dưỡng',
      introduction: `介護施設で働くには、業務に特有の専門用語を正確に理解することが不可欠です。「ケアプラン・申し送り・アセスメント・サービス担当者会議・インシデント」など現場で毎日使う言葉をしっかり覚えましょう。

Để làm việc tại cơ sở điều dưỡng, việc hiểu chính xác các thuật ngữ chuyên ngành là điều không thể thiếu. Hãy ghi nhớ kỹ những từ dùng hàng ngày tại hiện trường như kế hoạch chăm sóc, bàn giao ca, đánh giá, hội nghị người phụ trách dịch vụ, sự cố.`,
      keyPoints: [
        'ケアプラン: 利用者ごとの介護サービス計画書（kế hoạch chăm sóc）',
        '申し送り（もうしおくり）: 交代時に業務内容を伝えること（bàn giao ca）',
        'アセスメント: 利用者の状態・ニーズの評価（đánh giá nhu cầu）',
        'サービス担当者会議（さーびすたんとうしゃかいぎ）: ケアプラン作成のための多職種会議',
        'インシデント: ヒヤリハット・事故になりかねない出来事（sự cố）',
        'モニタリング: サービス実施後の定期的な状況確認（theo dõi định kỳ）',
      ],
      vocabulary: [
        { word: 'ケアプラン', reading: 'ケアプラン', meaning: '介護サービス計画（kế hoạch chăm sóc cá nhân）', example: 'ケアプランを見直す' },
        { word: '申し送り', reading: 'もうしおくり', meaning: '交代時の業務引き継ぎ（bàn giao ca, báo cáo giao ca）', example: '申し送りで変化を伝える' },
        { word: 'アセスメント', reading: 'アセスメント', meaning: '利用者の状態・ニーズの評価（đánh giá tình trạng và nhu cầu）', example: 'アセスメントを実施する' },
        { word: 'インシデント', reading: 'インシデント', meaning: '事故につながりかねない出来事（sự cố có thể dẫn đến tai nạn）', example: 'インシデントを報告する' },
        { word: 'モニタリング', reading: 'モニタリング', meaning: 'サービス後の定期確認（theo dõi, giám sát định kỳ）', example: 'モニタリングを月1回行う' },
        { word: '多職種連携', reading: 'たしょくしゅれんけい', meaning: '異なる職種が協力して支援すること（phối hợp đa chuyên ngành）', example: '多職種連携でケアを行う' },
      ],
      examples: [
        { japanese: '今日の申し送りでは、Aさんの食欲低下について報告します。', reading: 'きょうのもうしおくりでは、Aさんのしょくよくていかについてほうこくします。', translation: 'Trong bàn giao ca hôm nay, tôi sẽ báo cáo về tình trạng chán ăn của bác A.' },
        { japanese: 'ケアプランに基づいて、今月のモニタリングを実施しました。', reading: 'ケアプランにもとづいて、こんげつのモニタリングをじっしました。', translation: 'Đã thực hiện giám sát tháng này dựa trên kế hoạch chăm sóc.' },
        { japanese: 'インシデントが発生したため、すぐに記録して上司に報告した。', reading: 'インシデントがはっせいしたため、すぐにきろくしてじょうしにほうこくした。', translation: 'Vì xảy ra sự cố nên đã ghi chép ngay và báo cáo cấp trên.' },
      ],
      grammarNote: `【N4文法：〜に基づいて（もとづいて）】
「ケアプランに基づいてサービスを提供する」
= Cung cấp dịch vụ dựa trên kế hoạch chăm sóc
「〜に基づく」は「〜を根拠として」の意味。書き言葉・報告でよく使う。

【介護業務関連語】
記録（きろく）= ghi chép / 観察（かんさつ）= quan sát
カンファレンス = hội họp / ヒヤリハット = suýt xảy ra tai nạn
担当者（たんとうしゃ）= người phụ trách`,
      quiz: {
        question: '交代時に業務の内容を次の担当者に伝えることを何といいますか？',
        options: [
          { id: 'a', text: 'アセスメント' },
          { id: 'b', text: 'モニタリング' },
          { id: 'c', text: '申し送り' },
          { id: 'd', text: 'インシデント' },
        ],
        correctId: 'c',
        explanation: '「申し送り（もうしおくり）」は業務の交代時に、前の担当者が次の担当者へ利用者の状態や注意事項を伝えることです。\n「Bàn giao ca (申し送り)」là việc nhân viên trước thông báo trạng thái và lưu ý cho người tiếp theo khi giao ca.',
      },
      xpReward: 25,
    },
  },

  'n4-01-5': {
    courseTitle: { ja: 'N4 語彙マスター 〜1,000語〜', vi: 'Từ vựng N4 Master - 1000 từ' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4語彙: 時間・頻度の副詞',
      titleTranslation: 'Từ vựng N4: Phó từ chỉ thời gian và tần suất',
      introduction: `介護記録や申し送りでは、いつ・どのくらいの頻度で起きたかを正確に伝えることが重要です。「いつも・ときどき・たまに・なるべく・できるだけ・すぐに・しばらく」などの副詞を使いこなしましょう。

Trong ghi chép điều dưỡng và bàn giao ca, việc truyền đạt chính xác khi nào và tần suất ra sao là rất quan trọng. Hãy thành thạo các phó từ như luôn luôn, đôi khi, thỉnh thoảng, cố gắng, nếu có thể, ngay lập tức, một lúc.`,
      keyPoints: [
        'いつも: 毎回・常に起こる（luôn luôn） — いつも食欲がある',
        'ときどき: 不規則に何度か起こる（đôi khi, đôi lúc） — ときどき痛みを訴える',
        'たまに: めったにないが時々ある（thỉnh thoảng） — たまに咳が出る',
        'なるべく・できるだけ: 可能な限り（nếu có thể, càng nhiều càng tốt） — なるべく歩く',
        'すぐに: 時間をおかず直ちに（ngay lập tức） — すぐに報告する',
        'しばらく: ある程度の時間が続く（một lúc, một thời gian） — しばらく様子を見る',
      ],
      vocabulary: [
        { word: 'いつも', reading: 'いつも', meaning: '常に・毎回（luôn luôn, mọi lúc）', example: 'いつも笑顔で挨拶する' },
        { word: 'ときどき', reading: 'ときどき', meaning: '不定期に何度か（đôi khi, thỉnh thoảng）', example: 'ときどき夜中に目が覚める' },
        { word: 'たまに', reading: 'たまに', meaning: 'めったにないが時々（thỉnh thoảng, ít khi）', example: 'たまに外出したがる' },
        { word: 'なるべく', reading: 'なるべく', meaning: 'できる範囲で最大限（nếu có thể, cố gắng）', example: 'なるべく自力で歩く' },
        { word: 'すぐに', reading: 'すぐに', meaning: '時間をおかず直ちに（ngay lập tức）', example: '異変があればすぐに報告する' },
        { word: 'しばらく', reading: 'しばらく', meaning: 'ある程度の時間が経過するまで（một lúc, trong thời gian ngắn）', example: 'しばらく安静にする' },
      ],
      examples: [
        { japanese: '食後にはいつも口腔ケアを行い、たまに嚥下体操もします。', reading: 'しょくごにはいつもこうくうケアをおこない、たまにえんげたいそうもします。', translation: 'Sau bữa ăn luôn thực hiện chăm sóc răng miệng, thỉnh thoảng cũng tập nuốt.' },
        { japanese: '転倒のリスクがあるので、できるだけそばにいるようにしている。', reading: 'てんとうのリスクがあるので、できるだけそばにいるようにしている。', translation: 'Vì có nguy cơ ngã nên cố gắng ở gần càng nhiều càng tốt.' },
        { japanese: 'ときどき混乱することがあるが、しばらくすると落ち着く。', reading: 'ときどきこんらんすることがあるが、しばらくするとおちつく。', translation: 'Đôi khi bị bối rối nhưng sau một lúc thì bình tĩnh lại.' },
      ],
      grammarNote: `【N4文法：〜ようにする（努力・習慣）】
「なるべく声をかけるようにしている」
= Cố gắng thường xuyên lên tiếng hỏi thăm
「〜ようにする」は「そうなるよう意識して行動する」という継続的努力を示す。

【頻度を表す副詞の順序（多い→少ない）】
いつも ＞ よく ＞ ときどき ＞ たまに ＞ めったに〜ない ＞ 全く〜ない
luôn luôn > thường > đôi khi > thỉnh thoảng > hiếm khi > không bao giờ`,
      quiz: {
        question: '「（　）様子を見てから対応します」— 「ある程度の時間が経つまで待つ」という意味の副詞は？',
        options: [
          { id: 'a', text: 'いつも' },
          { id: 'b', text: 'すぐに' },
          { id: 'c', text: 'たまに' },
          { id: 'd', text: 'しばらく' },
        ],
        correctId: 'd',
        explanation: '「しばらく」は「ある程度の時間が経つまで」という意味で、「しばらく様子を見る」は介護記録でよく使う表現です。\n「Một lúc (しばらく)」có nghĩa là chờ một khoảng thời gian nhất định. "しばらく様子を見る" là cách diễn đạt thường dùng trong ghi chép điều dưỡng.',
      },
      xpReward: 25,
    },
  },

  'n4-01-6': {
    courseTitle: { ja: 'N4 語彙マスター 〜1,000語〜', vi: 'Từ vựng N4 Master - 1000 từ' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4語彙: 数量・程度の表現',
      titleTranslation: 'Từ vựng N4: Cách diễn đạt số lượng và mức độ',
      introduction: `介護記録では「どのくらい食べたか」「どの程度の症状か」を具体的に伝える必要があります。「ほとんど・かなり・少し・十分に・まったく〜ない・ほど・くらい」など程度を表す語を正確に使いましょう。

Trong ghi chép điều dưỡng, cần truyền đạt cụ thể "ăn được bao nhiêu" hay "mức độ triệu chứng như thế nào". Hãy sử dụng chính xác các từ biểu đạt mức độ như hầu hết, khá, một chút, đầy đủ, hoàn toàn không, khoảng, đến mức.`,
      keyPoints: [
        'ほとんど: 大部分・ほぼ全て（hầu hết, gần như hoàn toàn） — ほとんど食べた',
        'かなり: 程度が高い・かなり大きい（khá, khá nhiều） — かなり痛そう',
        '少し（すこし）: 少量・わずか（một chút, ít） — 少し食欲がある',
        '十分に（じゅうぶんに）: 必要なだけある（đầy đủ, đủ） — 水分を十分に摂る',
        'まったく〜ない: 全然〜ない（hoàn toàn không） — まったく食べない',
        'ほど・くらい: おおよその数量・程度（khoảng, chừng） — 半分くらい食べた',
      ],
      vocabulary: [
        { word: 'ほとんど', reading: 'ほとんど', meaning: '大部分・ほぼ全て（hầu hết）', example: 'ほとんど食べられなかった' },
        { word: 'かなり', reading: 'かなり', meaning: '相当・程度が高い（khá, tương đối nhiều）', example: 'かなり疲れている様子' },
        { word: '十分に', reading: 'じゅうぶんに', meaning: '必要なだけ十分ある（đầy đủ, đủ mức cần thiết）', example: '水分を十分に補給する' },
        { word: 'まったく', reading: 'まったく', meaning: '完全に（全否定と一緒に使う）（hoàn toàn）', example: 'まったく食欲がない' },
        { word: 'くらい', reading: 'くらい', meaning: 'だいたいの程度・数量（khoảng, chừng）', example: '3割くらい食べた' },
        { word: 'ほど', reading: 'ほど', meaning: '程度・比較の基準（đến mức, bằng khoảng）', example: '歩けないほど痛い' },
      ],
      examples: [
        { japanese: '昼食はほとんど食べず、夕食も3割くらいしか食べなかった。', reading: 'ちゅうしょくはほとんどたべず、ゆうしょくも3わりくらいしかたべなかった。', translation: 'Bữa trưa hầu như không ăn, bữa tối cũng chỉ ăn được khoảng 3 phần.' },
        { japanese: 'かなり倦怠感があるようで、まったく動こうとしない。', reading: 'かなりけんたいかんがあるようで、まったくうごこうとしない。', translation: 'Có vẻ mệt mỏi khá nhiều, hoàn toàn không muốn cử động.' },
        { japanese: '水分は十分に摂れているが、食事量は少し足りない。', reading: 'すいぶんはじゅうぶんにとれているが、しょくじりょうはすこしたりない。', translation: 'Lượng nước uống đầy đủ nhưng lượng ăn còn hơi thiếu.' },
      ],
      grammarNote: `【N4文法：〜ほど〜ない（比較の否定）】
「昨日ほど痛くない」= Không đau bằng hôm qua
「〜ほど〜ない」は「〜と同じくらいには〜でない」という比較表現。

【程度副詞の強さ（強→弱）】
まったく〜ない（完全否定）> ほとんど〜ない > あまり〜ない > 少し〜ない
hoàn toàn không > hầu như không > không mấy > hơi không`,
      quiz: {
        question: '「（　）食欲がない」—「全然・完全に食欲がない」という意味になるのは？',
        options: [
          { id: 'a', text: 'かなり' },
          { id: 'b', text: 'ほとんど' },
          { id: 'c', text: 'まったく' },
          { id: 'd', text: '少し' },
        ],
        correctId: 'c',
        explanation: '「まったく〜ない」は完全な否定で「全然・全く〜ない」と同じ意味。「ほとんど〜ない」は「ほぼない」、「かなり〜ない」は不自然。\n「まったく〜ない」là phủ định hoàn toàn, cùng nghĩa với "hoàn toàn không".',
      },
      xpReward: 25,
    },
  },

  'n4-01-7': {
    courseTitle: { ja: 'N4 語彙マスター 〜1,000語〜', vi: 'Từ vựng N4 Master - 1000 từ' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4語彙: 施設・設備の名詞',
      titleTranslation: 'Từ vựng N4: Danh từ về cơ sở vật chất và trang thiết bị',
      introduction: `介護施設で働くには、施設内の各場所と設備の名前を正しく知ることが必要です。「居室・廊下・浴室・食堂・ナースステーション・エレベーター・非常口」を覚えて、利用者の誘導や緊急時の対応に役立てましょう。

Để làm việc tại cơ sở điều dưỡng, cần biết đúng tên các nơi và trang thiết bị trong cơ sở. Hãy ghi nhớ phòng ở, hành lang, phòng tắm, phòng ăn, trạm y tá, thang máy, lối thoát hiểm để hỗ trợ dẫn đường người dùng và ứng phó khi khẩn cấp.`,
      keyPoints: [
        '居室（きょしつ）: 利用者が生活する部屋（phòng ở của người dùng）',
        '廊下（ろうか）: 部屋と部屋をつなぐ通路（hành lang）',
        '浴室（よくしつ）: 入浴する場所（phòng tắm）',
        '食堂（しょくどう）: 食事をとる共同スペース（phòng ăn tập thể）',
        'ナースステーション: 看護・介護スタッフの業務拠点（trạm y tá）',
        '非常口（ひじょうぐち）: 緊急時の避難出口（lối thoát hiểm）',
      ],
      vocabulary: [
        { word: '居室', reading: 'きょしつ', meaning: '利用者の個人部屋（phòng ở cá nhân）', example: '居室で休んでいる' },
        { word: '廊下', reading: 'ろうか', meaning: '建物内の通路（hành lang）', example: '廊下を歩行訓練する' },
        { word: '浴室', reading: 'よくしつ', meaning: '入浴するための部屋（phòng tắm）', example: '浴室の床が濡れている' },
        { word: '食堂', reading: 'しょくどう', meaning: '食事をする共同部屋（phòng ăn）', example: '食堂で昼食をとる' },
        { word: '非常口', reading: 'ひじょうぐち', meaning: '緊急避難のための出口（lối thoát hiểm）', example: '非常口の場所を確認する' },
        { word: 'エレベーター', reading: 'エレベーター', meaning: '階移動用の昇降機（thang máy）', example: 'エレベーターで2階へ移動する' },
      ],
      examples: [
        { japanese: 'Bさんが廊下で転倒しかけたので、すぐに居室へ誘導した。', reading: 'Bさんがろうかでてんとうしかけたので、すぐにきょしつへゆうどうした。', translation: 'Vì bác B suýt ngã ở hành lang nên đã dẫn ngay vào phòng ở.' },
        { japanese: '浴室の床が滑りやすいため、入浴前に必ず確認する。', reading: 'よくしつのゆかがすべりやすいため、にゅうよくまえにかならずかくにんする。', translation: 'Vì sàn phòng tắm dễ trơn nên nhất định phải kiểm tra trước khi tắm.' },
        { japanese: '緊急時は非常口から速やかに避難してください。', reading: 'きんきゅうじはひじょうぐちからすみやかにひなんしてください。', translation: 'Khi khẩn cấp hãy nhanh chóng sơ tán qua lối thoát hiểm.' },
      ],
      grammarNote: `【N4文法：〜やすい・〜にくい（性質の表現）】
「床が滑りやすい」= sàn dễ trơn
「手すりがつかみにくい」= khó nắm tay vịn
〜やすい＝ dễ〜 / 〜にくい＝ khó〜（動詞のます形につける）

【施設関連語】
機能訓練室（きのうくんれんしつ）= phòng phục hồi chức năng
談話室（だんわしつ）= phòng trò chuyện
処置室（しょちしつ）= phòng xử lý
スタッフルーム = phòng nhân viên`,
      quiz: {
        question: '緊急時に避難するための出口を何といいますか？',
        options: [
          { id: 'a', text: '食堂（しょくどう）' },
          { id: 'b', text: '居室（きょしつ）' },
          { id: 'c', text: '非常口（ひじょうぐち）' },
          { id: 'd', text: '廊下（ろうか）' },
        ],
        correctId: 'c',
        explanation: '「非常口（ひじょうぐち）」は火災・地震などの緊急時に使う避難出口です。施設内の非常口の場所を日頃から確認しておくことが大切です。\n「Lối thoát hiểm (非常口)」là cửa thoát hiểm dùng khi khẩn cấp như cháy, động đất. Điều quan trọng là phải thường xuyên xác nhận vị trí lối thoát hiểm trong cơ sở.',
      },
      xpReward: 25,
    },
  },

  'n4-01-8': {
    courseTitle: { ja: 'N4 語彙マスター 〜1,000語〜', vi: 'Từ vựng N4 Master - 1000 từ' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4語彙: 食事・栄養の語彙',
      titleTranslation: 'Từ vựng N4: Từ vựng về bữa ăn và dinh dưỡng',
      introduction: `介護現場では食事は健康管理の中心です。「栄養・嚥下困難・食欲・水分補給・軟食・刻み食・ミキサー食」など食事に関する語彙を習得し、利用者一人ひとりの状態に合ったケアができるようにしましょう。

Trong điều dưỡng, bữa ăn là trung tâm của quản lý sức khỏe. Hãy học từ vựng về bữa ăn như dinh dưỡng, khó nuốt, chán ăn, bổ sung nước, thức ăn mềm, thức ăn băm nhỏ, thức ăn xay để có thể chăm sóc phù hợp với từng người dùng.`,
      keyPoints: [
        '栄養（えいよう）: 体に必要な成分（dinh dưỡng） — 栄養状態を確認する',
        '嚥下困難（えんげこんなん）: 飲み込みにくい状態（khó nuốt） — 嚥下困難がある',
        '食欲（しょくよく）: 食べたいという気持ち（sự thèm ăn） — 食欲不振',
        '水分補給（すいぶんほきゅう）: 水などを体に取り入れること（bổ sung nước）',
        '軟食（なんしょく）: 柔らかく調理した食事（thức ăn mềm）',
        '刻み食（きざみしょく）: 細かく切った食事（thức ăn băm nhỏ） / ミキサー食（thức ăn xay）',
      ],
      vocabulary: [
        { word: '栄養', reading: 'えいよう', meaning: '体に必要な養分（dinh dưỡng）', example: '栄養バランスを考える' },
        { word: '食欲', reading: 'しょくよく', meaning: '食べたい気持ち（sự thèm ăn）', example: '食欲が低下している' },
        { word: '水分補給', reading: 'すいぶんほきゅう', meaning: '水分を体に取り入れること（bổ sung nước）', example: '水分補給を促す' },
        { word: '軟食', reading: 'なんしょく', meaning: '柔らかく調理した食事形態（thức ăn mềm）', example: '軟食に変更する' },
        { word: '刻み食', reading: 'きざみしょく', meaning: '細かく切った食事形態（thức ăn băm nhỏ）', example: '刻み食でむせが減った' },
        { word: 'ミキサー食', reading: 'ミキサーしょく', meaning: 'ミキサーでなめらかにした食事（thức ăn xay nhuyễn）', example: 'ミキサー食に変更した' },
      ],
      examples: [
        { japanese: '食欲が低下しているため、好みの食材を取り入れた軟食にした。', reading: 'しょくよくがていかしているため、このみのしょくざいをとりいれたなんしょくにした。', translation: 'Do chán ăn, đã đổi sang thức ăn mềm có nguyên liệu yêu thích.' },
        { japanese: 'むせが多いので、刻み食からミキサー食に変更しました。', reading: 'むせがおおいので、きざみしょくからミキサーしょくにへんこうしました。', translation: 'Vì hay bị sặc nên đã đổi từ thức ăn băm nhỏ sang thức ăn xay.' },
        { japanese: '水分補給が不十分なため、こまめに声をかけるようにしている。', reading: 'すいぶんほきゅうがふじゅうぶんなため、こまめにこえをかけるようにしている。', translation: 'Vì bổ sung nước chưa đầy đủ nên thường xuyên nhắc nhở.' },
      ],
      grammarNote: `【N4文法：〜に変更する（へんこうする）】
「普通食から軟食に変更する」= Đổi từ cơm thường sang thức ăn mềm
「AからBに変更する」は状態・形態の変化を表す重要な業務表現。

【食事形態の段階（食べやすさ順）】
普通食 → 軟食 → 刻み食 → ミキサー食 → 流動食
Cơm thường → Mềm → Băm nhỏ → Xay → Lỏng

【関連語】
食事介助（しょくじかいじょ）= hỗ trợ ăn uống
とろみ = độ sánh / 嚥下体操（えんげたいそう）= tập nuốt`,
      quiz: {
        question: '嚥下困難がある利用者に最も食べやすい食事形態は？',
        options: [
          { id: 'a', text: '普通食（ふつうしょく）' },
          { id: 'b', text: '刻み食（きざみしょく）' },
          { id: 'c', text: '軟食（なんしょく）' },
          { id: 'd', text: 'ミキサー食（ミキサーしょく）' },
        ],
        correctId: 'd',
        explanation: '嚥下困難が強い場合は「ミキサー食」が最も飲み込みやすい形態です。食事形態は普通食→軟食→刻み食→ミキサー食→流動食の順に変化します。\nKhi khó nuốt nặng, "thức ăn xay (ミキサー食)" là dạng dễ nuốt nhất. Dạng bữa ăn thay đổi theo thứ tự: thường → mềm → băm nhỏ → xay → lỏng.',
      },
      xpReward: 25,
    },
  },

  'n4-01-9': {
    courseTitle: { ja: 'N4 語彙マスター 〜1,000語〜', vi: 'Từ vựng N4 Master - 1000 từ' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4語彙: 移動・姿勢の語彙',
      titleTranslation: 'Từ vựng N4: Từ vựng về di chuyển và tư thế',
      introduction: `介護の基本は「移動・移乗・体位変換」です。「歩行・移乗・体位変換・座位・臥位・起立・車椅子・歩行器」を正確に理解し、安全なケアと記録・申し送りに活用しましょう。

Nền tảng của điều dưỡng là "di chuyển, chuyển chỗ, thay đổi tư thế". Hãy hiểu chính xác đi bộ, chuyển chỗ, thay đổi tư thế, tư thế ngồi, tư thế nằm, đứng dậy, xe lăn, khung tập đi để ứng dụng trong chăm sóc an toàn và ghi chép, bàn giao ca.`,
      keyPoints: [
        '歩行（ほこう）: 歩くこと（đi bộ） — 歩行状態・歩行訓練',
        '移乗（いじょう）: ベッドから車椅子など乗り移ること（chuyển chỗ） — 移乗介助',
        '体位変換（たいいへんかん）: 体の向きを変えること（thay đổi tư thế） — 2時間ごとに実施',
        '座位（ざい）: 座った姿勢（tư thế ngồi） — 端座位・車椅子座位',
        '臥位（がい）: 横になった姿勢（tư thế nằm） — 仰臥位・側臥位',
        '起立（きりつ）: 立ち上がること（đứng dậy） — 起立動作・起立介助',
      ],
      vocabulary: [
        { word: '歩行', reading: 'ほこう', meaning: '自分の足で歩くこと（đi bộ）', example: '歩行訓練を毎日行う' },
        { word: '移乗', reading: 'いじょう', meaning: 'ベッドや椅子の間を移動すること（chuyển chỗ ngồi/nằm）', example: '移乗の際は転倒に注意する' },
        { word: '体位変換', reading: 'たいいへんかん', meaning: '寝ている体の向きを変えること（thay đổi tư thế）', example: '体位変換を2時間ごとに行う' },
        { word: '座位', reading: 'ざい', meaning: '座った姿勢（tư thế ngồi）', example: '端座位を保てている' },
        { word: '臥位', reading: 'がい', meaning: '横になった姿勢（tư thế nằm）', example: '側臥位（そくがい）で休んでいる' },
        { word: '歩行器', reading: 'ほこうき', meaning: '歩行を助ける補助具（khung tập đi）', example: '歩行器を使って廊下を歩く' },
      ],
      examples: [
        { japanese: '移乗の際は二人介助で行い、安全を確認してから動いた。', reading: 'いじょうのさいはふたりかいじょでおこない、あんぜんをかくにんしてからうごいた。', translation: 'Khi chuyển chỗ đã thực hiện với hai người hỗ trợ, di chuyển sau khi xác nhận an toàn.' },
        { japanese: '褥瘡予防のため、2時間ごとに体位変換を実施した。', reading: 'じょくそうよぼうのため、2じかんごとにたいいへんかんをじっしした。', translation: 'Để phòng ngừa loét tì đè, đã thực hiện thay đổi tư thế mỗi 2 giờ.' },
        { japanese: '端座位から起立動作の際に少しふらつきが見られた。', reading: 'たんざいからきりつどうさのさいにすこしふらつきがみられた。', translation: 'Khi đứng dậy từ tư thế ngồi thẳng có thấy hơi loạng choạng.' },
      ],
      grammarNote: `【N4文法：〜ごとに（定期的な間隔）】
「2時間ごとに体位変換する」= Thay đổi tư thế mỗi 2 giờ
「〜ごとに」は「一定の間隔で繰り返す」という意味。介護記録でよく使う。

【姿勢・体位の種類】
仰臥位（ぎょうがい）= nằm ngửa
側臥位（そくがい）= nằm nghiêng
腹臥位（ふくがい）= nằm sấp
端座位（たんざい）= ngồi thẳng mép giường
半座位（はんざい）= nửa nằm nửa ngồi`,
      quiz: {
        question: 'ベッドから車椅子へ乗り移ることを何といいますか？',
        options: [
          { id: 'a', text: '歩行（ほこう）' },
          { id: 'b', text: '体位変換（たいいへんかん）' },
          { id: 'c', text: '移乗（いじょう）' },
          { id: 'd', text: '起立（きりつ）' },
        ],
        correctId: 'c',
        explanation: '「移乗（いじょう）」はベッド・車椅子・トイレなどの間で体を移動させることです。「移乗介助」は介護の基本技術の一つです。\n「Chuyển chỗ (移乗)」là việc di chuyển cơ thể giữa giường, xe lăn, bồn vệ sinh. Hỗ trợ chuyển chỗ là một kỹ thuật cơ bản trong điều dưỡng.',
      },
      xpReward: 25,
    },
  },

  'n4-01-10': {
    courseTitle: { ja: 'N4 語彙マスター 〜1,000語〜', vi: 'Từ vựng N4 Master - 1000 từ' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4語彙: 排泄・清潔の語彙',
      titleTranslation: 'Từ vựng N4: Từ vựng về bài tiết và vệ sinh',
      introduction: `排泄ケアと清潔ケアは利用者の尊厳と健康に直結する重要な業務です。「排尿・排便・失禁・オムツ・清拭・口腔ケア・褥瘡予防」など、プライバシーに配慮しながら正確に記録・伝達する語彙を学びましょう。

Chăm sóc bài tiết và vệ sinh là công việc quan trọng liên quan trực tiếp đến phẩm giá và sức khỏe của người dùng. Hãy học từ vựng ghi chép và truyền đạt chính xác như đi tiểu, đại tiện, tiểu không tự chủ, tã, lau người, chăm sóc miệng, phòng ngừa loét tì đè, trong khi chú ý đến sự riêng tư.`,
      keyPoints: [
        '排尿（はいにょう）: 尿を出すこと（đi tiểu） — 排尿回数・残尿',
        '排便（はいべん）: 便を出すこと（đại tiện） — 排便なし・便秘',
        '失禁（しっきん）: 意図せず尿・便が出ること（tiểu/đại tiện không tự chủ）',
        'オムツ: 失禁対応の吸収パッド（tã） — オムツ交換',
        '清拭（せいしき）: 濡れタオルで体を拭くこと（lau người）',
        '口腔ケア（こうくうケア）: 口の中の清潔を保つケア（chăm sóc răng miệng）',
      ],
      vocabulary: [
        { word: '排尿', reading: 'はいにょう', meaning: '体から尿を排出すること（đi tiểu）', example: '排尿が少ない' },
        { word: '排便', reading: 'はいべん', meaning: '体から便を排出すること（đại tiện）', example: '3日間排便なし' },
        { word: '失禁', reading: 'しっきん', meaning: '意図せず排泄してしまうこと（tiểu/đại tiện không tự chủ）', example: '尿失禁がある' },
        { word: '清拭', reading: 'せいしき', meaning: '濡れタオルなどで体を拭いて清潔にすること（lau người）', example: '全身清拭を実施した' },
        { word: '口腔ケア', reading: 'こうくうケア', meaning: '口の中を清潔に保つケア（chăm sóc vệ sinh miệng）', example: '食後に口腔ケアを行う' },
        { word: '褥瘡予防', reading: 'じょくそうよぼう', meaning: '長時間の圧迫による皮膚の傷（loét tì đè）を防ぐこと', example: '褥瘡予防のため体位変換する' },
      ],
      examples: [
        { japanese: '昨日から排便がなく、腹部の張りを訴えているため、看護師に報告した。', reading: 'きのうからはいべんがなく、ふくぶのはりをうったえているため、かんごしにほうこくした。', translation: 'Từ hôm qua chưa đại tiện và than bụng trướng nên đã báo cáo điều dưỡng viên.' },
        { japanese: '食後は必ず口腔ケアを行い、誤嚥性肺炎を予防する。', reading: 'しょくごはかならずこうくうケアをおこない、ごえんせいはいえんをよぼうする。', translation: 'Sau bữa ăn nhất định thực hiện chăm sóc miệng để phòng ngừa viêm phổi do sặc.' },
        { japanese: '体位変換と清拭を行い、褥瘡の発生を予防している。', reading: 'たいいへんかんとせいしきをおこない、じょくそうのはっせいをよぼうしている。', translation: 'Thực hiện thay đổi tư thế và lau người để phòng ngừa loét tì đè.' },
      ],
      grammarNote: `【N4文法：〜ため（目的）】
「褥瘡予防のために体位変換する」= Thay đổi tư thế để phòng ngừa loét tì đè
「〜ために」は目的を表す。「ため」は原因（n4-01-2参照）とは異なる用法に注意。

【排泄・清潔ケア関連語】
便秘（べんぴ）= táo bón / 下痢（げり）= tiêu chảy
導尿（どうにょう）= thông tiểu / 摘便（てきべん）= lấy phân
陰部洗浄（いんぶせいじょう）= vệ sinh vùng kín
入浴（にゅうよく）= tắm / シャワー浴（シャワーよく）= tắm vòi sen`,
      quiz: {
        question: '長時間同じ姿勢でいることで皮膚が傷つく状態を何といいますか？また、それを防ぐケアは？',
        options: [
          { id: 'a', text: '失禁（しっきん）— オムツ交換で予防' },
          { id: 'b', text: '褥瘡（じょくそう）— 体位変換で予防' },
          { id: 'c', text: '浮腫（ふしゅ）— 清拭で予防' },
          { id: 'd', text: '誤嚥（ごえん）— 口腔ケアで予防' },
        ],
        correctId: 'b',
        explanation: '「褥瘡（じょくそう）」は長時間の圧迫で皮膚が壊死する状態（床ずれ）で、定期的な体位変換・圧迫を分散させるマットレスなどで予防します。\n「Loét tì đè (褥瘡)」là tình trạng da bị hoại tử do áp lực lâu dài. Phòng ngừa bằng cách thay đổi tư thế định kỳ và dùng đệm phân tán áp lực.',
      },
      xpReward: 25,
    },
  },

  'n4-01-11': {
    courseTitle: { ja: 'N4 語彙マスター 〜1,000語〜', vi: 'Từ vựng N4 Master - 1000 từ' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4語彙 第11回 〜薬・医療処置〜',
      titleTranslation: 'Từ vựng N4 Bài 11 - Thuốc & Thủ thuật y tế',
      introduction: `介護・医療現場では薬や処置に関する語彙が必須です。「投薬・処方・副作用・点滴・注射・検温・採血・内服」を正確に理解し、利用者への説明や申し送りに活用しましょう。

Trong môi trường điều dưỡng và y tế, từ vựng liên quan đến thuốc và thủ thuật là bắt buộc. Hãy nắm vững "投薬・処方・副作用・点滴・注射・検温・採血・内服" để giải thích cho người dùng và bàn giao ca.`,
      keyPoints: [
        '投薬（とうやく）: 薬を与えること（cho dùng thuốc）— 例：投薬記録を確認する',
        '処方箋（しょほうせん）: 医師が薬を指示する書類（đơn thuốc）— 例：処方箋を受け取る',
        '副作用（ふくさよう）: 薬の望ましくない効果（tác dụng phụ）— 例：副作用が出た',
        '点滴（てんてき）: 静脈内輸液（truyền dịch）— 例：点滴を交換する',
        '採血（さいけつ）: 血液を採取すること（lấy máu）— 例：採血の結果が出た',
        '内服薬（ないふくやく）: 口から飲む薬（thuốc uống）— 例：内服薬を確認する',
      ],
      vocabulary: [
        { word: '投薬', reading: 'とうやく', meaning: '患者に薬を与えること（cho dùng thuốc）', example: '投薬記録を毎回確認してください。' },
        { word: '処方箋', reading: 'しょほうせん', meaning: '医師が出す薬の指示書（đơn thuốc）', example: '処方箋を薬局に持っていく。' },
        { word: '副作用', reading: 'ふくさよう', meaning: '薬の好ましくない反応（tác dụng phụ）', example: '副作用として眠気が出ることがあります。' },
        { word: '点滴', reading: 'てんてき', meaning: '静脈から液体を入れる処置（truyền dịch tĩnh mạch）', example: '点滴が終わったら知らせてください。' },
        { word: '採血', reading: 'さいけつ', meaning: '血液検査のため血を採ること（lấy máu xét nghiệm）', example: '朝食前に採血を行います。' },
        { word: '内服薬', reading: 'ないふくやく', meaning: '飲み薬（thuốc uống）', example: '内服薬は食後30分以内に飲んでください。' },
      ],
      examples: [
        { japanese: '今日の投薬記録を確認し、副作用がないか観察してください。', reading: 'きょうのとうやくきろくをかくにんし、ふくさようがないかかんさつしてください。', translation: 'Hãy xác nhận hồ sơ dùng thuốc hôm nay và quan sát xem có tác dụng phụ không.' },
        { japanese: '点滴が終わったら、採血の結果と合わせて報告します。', reading: 'てんてきがおわったら、さいけつのけっかとあわせてほうこくします。', translation: 'Khi truyền dịch xong, sẽ báo cáo cùng kết quả xét nghiệm máu.' },
        { japanese: '内服薬の処方箋と実際の薬が一致しているか確認してください。', reading: 'ないふくやくのしょほうせんとじっさいのくすりがいっちしているかかくにんしてください。', translation: 'Hãy xác nhận đơn thuốc uống và thuốc thực tế có khớp nhau không.' },
      ],
      grammarNote: `【〜かどうか確認する（確認whether）】
副作用が出ているかどうか確認する = xác nhận xem có tác dụng phụ không
投薬が終わったかどうか報告する = báo cáo xem đã dùng thuốc xong chưa

【医療処置関連語彙まとめ】
注射（ちゅうしゃ）= tiêm / 検温（けんおん）= đo nhiệt độ
採尿（さいにょう）= lấy nước tiểu / 輸血（ゆけつ）= truyền máu
処置（しょち）= thủ thuật / 投与（とうよ）= cho dùng (thuốc)`,
      quiz: {
        question: '「薬の望ましくない反応」を何と言いますか？',
        options: [
          { id: 'a', text: '処方箋' },
          { id: 'b', text: '副作用' },
          { id: 'c', text: '投薬' },
          { id: 'd', text: '内服' },
        ],
        correctId: 'b',
        explanation: '副作用（ふくさよう）は薬が体に与える好ましくない反応のことです。Tác dụng phụ（ふくさよう）là phản ứng không mong muốn của thuốc đối với cơ thể.',
      },
      xpReward: 25,
    },
  },

  'n4-01-12': {
    courseTitle: { ja: 'N4 語彙マスター 〜1,000語〜', vi: 'Từ vựng N4 Master - 1000 từ' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4語彙 第12回 〜コミュニケーション系動詞〜',
      titleTranslation: 'Từ vựng N4 Bài 12 - Động từ giao tiếp',
      introduction: `介護現場では利用者・家族・同僚との円滑なコミュニケーションが不可欠です。「相談する・伝える・説明する・同意する・拒否する・承諾する」を使いこなして、信頼関係を築きましょう。

Giao tiếp suôn sẻ với người dùng, gia đình và đồng nghiệp là thiết yếu trong điều dưỡng. Hãy sử dụng thành thạo "相談する・伝える・説明する・同意する・拒否する・承諾する" để xây dựng mối quan hệ tin tưởng.`,
      keyPoints: [
        '相談する（そうだんする）: 意見を求めること（hỏi ý kiến, thảo luận）— 例：上司に相談する',
        '伝える（つたえる）: 情報を知らせること（truyền đạt）— 例：急変を伝える',
        '説明する（せつめいする）: 詳しく話すこと（giải thích）— 例：手順を説明する',
        '同意する（どういする）: 賛成すること（đồng ý）— 例：ケアプランに同意する',
        '拒否する（きょひする）: 断ること（từ chối）— 例：入浴を拒否される',
        '承諾する（しょうだくする）: 正式に受け入れること（chấp thuận）— 例：同意書に承諾する',
      ],
      vocabulary: [
        { word: '相談', reading: 'そうだん', meaning: '意見や助言を求める（hỏi ý kiến, thảo luận）', example: '困ったことがあれば、すぐ相談してください。' },
        { word: '伝える', reading: 'つたえる', meaning: '情報・気持ちを知らせる（truyền đạt, thông báo）', example: '家族に状況を伝えます。' },
        { word: '説明する', reading: 'せつめいする', meaning: '詳しく話して理解させる（giải thích）', example: 'ケアの手順を説明してください。' },
        { word: '同意する', reading: 'どういする', meaning: '同じ意見であること（đồng ý）', example: 'サービス内容に同意しました。' },
        { word: '拒否する', reading: 'きょひする', meaning: '断ること（từ chối）', example: '入浴を拒否される場合があります。' },
        { word: '承諾する', reading: 'しょうだくする', meaning: '正式に受け入れること（chấp thuận chính thức）', example: '同意書に署名して承諾してください。' },
      ],
      examples: [
        { japanese: '利用者さんが入浴を拒否したので、理由を聞いて上司に相談しました。', reading: 'りようしゃさんがにゅうよくをきょひしたので、りゆうをきいてじょうしにそうだんしました。', translation: 'Vì người dùng từ chối tắm, đã hỏi lý do rồi thảo luận với cấp trên.' },
        { japanese: 'ケアプランの変更について、ご家族に説明し同意をいただきました。', reading: 'ケアプランのへんこうについて、ごかぞくにせつめいしどういをいただきました。', translation: 'Đã giải thích về việc thay đổi kế hoạch chăm sóc cho gia đình và nhận được sự đồng ý.' },
        { japanese: '手術の説明を受け、患者さんは承諾書にサインしました。', reading: 'しゅじゅつのせつめいをうけ、かんじゃさんはしょうだくしょにサインしました。', translation: 'Sau khi nhận được giải thích về phẫu thuật, bệnh nhân đã ký vào phiếu chấp thuận.' },
      ],
      grammarNote: `【〜ていただく（謙譲表現）】
説明していただく = được giải thích (lịch sự)
同意していただく = được đồng ý (lịch sự)
承諾していただく = được chấp thuận (lịch sự)

【コミュニケーション動詞活用まとめ】
相談する→相談します→相談しました→相談してください
伝える→伝えます→伝えました→伝えてください
拒否する→拒否します→拒否しました（される=受け身で使うことも多い）`,
      quiz: {
        question: '「ケアプランに（　）していただきました」に入る語は？',
        options: [
          { id: 'a', text: '拒否' },
          { id: 'b', text: '同意' },
          { id: 'c', text: '相談' },
          { id: 'd', text: '伝え' },
        ],
        correctId: 'b',
        explanation: 'ケアプランに「同意（どうい）」する = đồng ý với kế hoạch chăm sóc。「〜していただく」は丁寧な受け身表現です。',
      },
      xpReward: 25,
    },
  },

  'n4-01-13': {
    courseTitle: { ja: 'N4 語彙マスター 〜1,000語〜', vi: 'Từ vựng N4 Master - 1000 từ' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4語彙 第13回 〜社会保険・制度〜',
      titleTranslation: 'Từ vựng N4 Bài 13 - Bảo hiểm xã hội & Chế độ',
      introduction: `日本の介護保険制度を理解することは、介護スタッフとして非常に重要です。「介護保険・要介護度・認定調査・サービス利用・負担割合」などの語彙をマスターし、利用者や家族への説明に役立てましょう。

Hiểu chế độ bảo hiểm chăm sóc của Nhật Bản rất quan trọng đối với nhân viên điều dưỡng. Hãy nắm vững từ vựng như "介護保険・要介護度・認定調査・サービス利用・負担割合" để giải thích cho người dùng và gia đình.`,
      keyPoints: [
        '介護保険（かいごほけん）: 40歳以上が加入する公的保険（bảo hiểm chăm sóc）',
        '要介護度（ようかいごど）: 介護が必要な程度（mức độ cần chăm sóc）— 要支援1〜2、要介護1〜5',
        '認定調査（にんていちょうさ）: 介護度を決める調査（khảo sát xác định mức độ）',
        '負担割合（ふたんわりあい）: 利用者が支払う費用の割合（tỷ lệ tự chi trả）— 1割・2割・3割',
        'ケアマネジャー: 介護支援専門員（chuyên viên lập kế hoạch chăm sóc）',
        'サービス提供（さーびすていきょう）: 介護サービスを行うこと（cung cấp dịch vụ chăm sóc）',
      ],
      vocabulary: [
        { word: '介護保険', reading: 'かいごほけん', meaning: '公的な介護支援のための保険制度（bảo hiểm chăm sóc công cộng）', example: '介護保険を申請します。' },
        { word: '要介護度', reading: 'ようかいごど', meaning: '介護の必要度を示す段階（mức độ cần chăm sóc）', example: '要介護度3に認定されました。' },
        { word: '認定調査', reading: 'にんていちょうさ', meaning: '要介護度を判定するための調査（khảo sát xác định mức độ）', example: '来月、認定調査があります。' },
        { word: '負担割合', reading: 'ふたんわりあい', meaning: '利用者が払うサービス費の割合（tỷ lệ chi trả của người dùng）', example: '負担割合は1割です。' },
        { word: '区分支給限度額', reading: 'くぶんしきゅうげんどがく', meaning: 'サービス利用の上限金額（hạn mức chi trả dịch vụ）', example: '区分支給限度額を超えないようにする。' },
        { word: 'ケアマネジャー', reading: 'ケアマネジャー', meaning: '介護支援専門員（chuyên viên hỗ trợ chăm sóc）', example: 'ケアマネジャーにケアプランを作成してもらう。' },
      ],
      examples: [
        { japanese: '要介護度が変わったため、ケアプランを見直しました。', reading: 'ようかいごどがかわったため、ケアプランをみなおしました。', translation: 'Vì mức độ cần chăm sóc thay đổi, đã xem xét lại kế hoạch chăm sóc.' },
        { japanese: '認定調査の結果、要介護2から要介護3に変更になりました。', reading: 'にんていちょうさのけっか、ようかいご2からようかいご3にへんこうになりました。', translation: 'Kết quả khảo sát xác định cho thấy đã thay đổi từ mức 2 lên mức 3.' },
        { japanese: '負担割合は1割ですが、サービスを増やすと費用も上がります。', reading: 'ふたんわりあいはいちわりですが、サービスをふやすとひようもあがります。', translation: 'Tỷ lệ tự chi trả là 10%, nhưng nếu tăng dịch vụ thì chi phí cũng tăng.' },
      ],
      grammarNote: `【〜に認定される（受け身）】
要介護3に認定される = được xác định là mức độ 3
支援が必要と判定される = được đánh giá là cần hỗ trợ

【介護保険制度 重要語彙リスト】
要支援（ようしえん）1〜2 = cần hỗ trợ
要介護（ようかいご）1〜5 = cần chăm sóc
給付（きゅうふ）= chi trả / 申請（しんせい）= đơn xin
更新（こうしん）= gia hạn / 区分（くぶん）= phân loại`,
      quiz: {
        question: '要介護度を決めるための調査を何と言いますか？',
        options: [
          { id: 'a', text: '認定調査' },
          { id: 'b', text: '採血調査' },
          { id: 'c', text: '健康診断' },
          { id: 'd', text: 'バイタル測定' },
        ],
        correctId: 'a',
        explanation: '認定調査（にんていちょうさ）は介護保険の要介護度を決めるための公的調査です。Khảo sát xác định（にんていちょうさ）là cuộc khảo sát chính thức để quyết định mức độ chăm sóc bảo hiểm.',
      },
      xpReward: 25,
    },
  },

  'n4-01-14': {
    courseTitle: { ja: 'N4 語彙マスター 〜1,000語〜', vi: 'Từ vựng N4 Master - 1000 từ' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4語彙 第14回 〜書類・記録の語彙〜',
      titleTranslation: 'Từ vựng N4 Bài 14 - Từ vựng tài liệu & hồ sơ',
      introduction: `介護現場では書類の作成・管理が欠かせません。「介護記録・ケアプラン・インシデントレポート・申請書・同意書」を正確に理解し、適切に記入・活用できるようになりましょう。

Trong điều dưỡng, việc lập và quản lý tài liệu là không thể thiếu. Hãy hiểu chính xác "介護記録・ケアプラン・インシデントレポート・申請書・同意書" và có thể điền, sử dụng một cách thích hợp.`,
      keyPoints: [
        '介護記録（かいごきろく）: 日々のケアを記録する書類（hồ sơ chăm sóc hàng ngày）',
        'ケアプラン: 個別の支援計画書（kế hoạch hỗ trợ cá nhân）',
        'インシデントレポート: 事故・ヒヤリハットの記録（báo cáo sự cố）',
        '申請書（しんせいしょ）: サービス利用を申し込む書類（đơn xin）',
        '同意書（どういしょ）: サービス・処置への同意を示す書類（phiếu đồng ý）',
        '引き継ぎ書（ひきつぎしょ）: 業務の申し送り記録（hồ sơ bàn giao）',
      ],
      vocabulary: [
        { word: '介護記録', reading: 'かいごきろく', meaning: '介護の内容を記録した書類（hồ sơ chăm sóc）', example: '介護記録に食事量を記入する。' },
        { word: 'ケアプラン', reading: 'ケアプラン', meaning: '個別の介護サービス計画（kế hoạch dịch vụ chăm sóc cá nhân）', example: 'ケアプランを更新しました。' },
        { word: 'インシデントレポート', reading: 'インシデントレポート', meaning: '事故・ミスの詳細記録（báo cáo sự cố）', example: '転倒後、インシデントレポートを提出する。' },
        { word: '申請書', reading: 'しんせいしょ', meaning: 'サービス利用などを申し込む書類（đơn xin）', example: '申請書に必要事項を記入する。' },
        { word: '同意書', reading: 'どういしょ', meaning: 'ケア内容に同意を示す書類（phiếu đồng ý）', example: '同意書にご署名をお願いします。' },
        { word: '引き継ぎ', reading: 'ひきつぎ', meaning: '業務の申し送り（bàn giao công việc）', example: '引き継ぎ事項をノートに書く。' },
      ],
      examples: [
        { japanese: 'シフト終了前に、介護記録と引き継ぎ書を確認してください。', reading: 'シフトしゅうりょうまえに、かいごきろくとひきつぎしょをかくにんしてください。', translation: 'Trước khi kết thúc ca, hãy xác nhận hồ sơ chăm sóc và tài liệu bàn giao.' },
        { japanese: 'インシデントレポートは事故発生後24時間以内に提出します。', reading: 'インシデントレポートはじこはっせいごにじゅうよじかんいないにていしゅつします。', translation: 'Báo cáo sự cố phải nộp trong vòng 24 giờ sau khi xảy ra sự cố.' },
        { japanese: '新しいサービスを開始する前に、同意書にサインをいただきます。', reading: 'あたらしいサービスをかいしするまえに、どういしょにサインをいただきます。', translation: 'Trước khi bắt đầu dịch vụ mới, sẽ xin chữ ký vào phiếu đồng ý.' },
      ],
      grammarNote: `【〜に記入する・〜を提出する（書類動詞）】
申請書に記入する = điền vào đơn xin
報告書を提出する = nộp báo cáo
同意書にサインする = ký vào phiếu đồng ý

【介護書類まとめ】
サービス担当者会議録（さーびすたんとうしゃかいぎろく）= biên bản họp
個別支援計画（こべつしえんけいかく）= kế hoạch hỗ trợ cá nhân
ヒヤリハット報告書 = báo cáo tình huống nguy hiểm suýt xảy ra`,
      quiz: {
        question: '転倒などの事故・ミスを記録する書類は何ですか？',
        options: [
          { id: 'a', text: 'ケアプラン' },
          { id: 'b', text: '申請書' },
          { id: 'c', text: 'インシデントレポート' },
          { id: 'd', text: '同意書' },
        ],
        correctId: 'c',
        explanation: 'インシデントレポートは事故・ヒヤリハットを詳しく記録する書類です。Báo cáo sự cố（インシデントレポート）là tài liệu ghi chép chi tiết các sự cố và tình huống nguy hiểm.',
      },
      xpReward: 25,
    },
  },

  'n4-01-15': {
    courseTitle: { ja: 'N4 語彙マスター 〜1,000語〜', vi: 'Từ vựng N4 Master - 1000 từ' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4語彙 第15回 〜緊急・安全の語彙〜',
      titleTranslation: 'Từ vựng N4 Bài 15 - Từ vựng khẩn cấp & an toàn',
      introduction: `介護現場での安全管理は最優先事項です。「転倒・急変・感染・誤嚥・拘縮・褥瘡・アレルギー反応」などのリスク用語を理解し、予防・対応・報告ができるようになりましょう。

Quản lý an toàn trong điều dưỡng là ưu tiên hàng đầu. Hãy hiểu các từ ngữ rủi ro như "転倒・急変・感染・誤嚥・拘縮・褥瘡・アレルギー反応" để có thể phòng ngừa, ứng phó và báo cáo.`,
      keyPoints: [
        '転倒（てんとう）: 転んで倒れること（ngã）— リスクアセスメントで最重要',
        '急変（きゅうへん）: 体調が急に悪くなること（đột biến sức khỏe）— 即報告が必要',
        '誤嚥（ごえん）: 食べ物・飲み物が気管に入ること（sặc, hít phải thức ăn）',
        '褥瘡（じょくそう）: 寝たきりで皮膚が傷つくこと（loét do nằm lâu）',
        '拘縮（こうしゅく）: 関節が固まって動かなくなること（co cứng khớp）',
        'アレルギー反応（あれるぎーはんのう）: 特定物質への異常反応（phản ứng dị ứng）',
      ],
      vocabulary: [
        { word: '転倒', reading: 'てんとう', meaning: '倒れること（ngã, té ngã）', example: '転倒防止のためマットを敷く。' },
        { word: '急変', reading: 'きゅうへん', meaning: '体調が突然悪化すること（đột biến sức khỏe）', example: '急変した場合はすぐに報告してください。' },
        { word: '誤嚥', reading: 'ごえん', meaning: '食物が誤って気管に入ること（sặc, hít nhầm vào khí quản）', example: '誤嚥を防ぐため、食事姿勢を整える。' },
        { word: '褥瘡', reading: 'じょくそう', meaning: '長時間同じ姿勢でできる皮膚の傷（loét do tỳ đè）', example: '褥瘡予防のため2時間ごとに体位交換する。' },
        { word: '拘縮', reading: 'こうしゅく', meaning: '関節や筋肉が固まる状態（co cứng khớp）', example: '拘縮予防のためリハビリを行う。' },
        { word: 'アレルギー反応', reading: 'アレルギーはんのう', meaning: '特定の物質への過敏な免疫反応（phản ứng dị ứng）', example: 'アレルギー反応が出たら投薬を中止する。' },
      ],
      examples: [
        { japanese: '入浴中に転倒リスクがあるため、見守りを強化してください。', reading: 'にゅうよくちゅうにてんとうリスクがあるため、みまもりをきょうかしてください。', translation: 'Vì có nguy cơ ngã trong khi tắm, hãy tăng cường giám sát.' },
        { japanese: '誤嚥を防ぐため、とろみ食でゆっくり食べていただきます。', reading: 'ごえんをふせぐため、とろみしょくでゆっくりたべていただきます。', translation: 'Để tránh sặc, hãy cho ăn chậm với thức ăn đặc sệt.' },
        { japanese: '褥瘡を発見したため、ただちに看護師に報告しました。', reading: 'じょくそうをはっけんしたため、ただちにかんごしにほうこくしました。', translation: 'Sau khi phát hiện loét do tỳ đè, đã báo cáo ngay cho y tá.' },
      ],
      grammarNote: `【〜を防ぐ・〜を予防する（予防表現）】
転倒を防ぐ = ngăn ngừa ngã
感染を予防する = phòng ngừa lây nhiễm
誤嚥が起きないように注意する = chú ý để không bị sặc

【緊急時の報告表現】
〜が急変しました = ... đã đột biến
〜が転倒しました = ... đã ngã
すぐに対応してください = hãy xử lý ngay
救急車を呼んでください = hãy gọi xe cứu thương`,
      quiz: {
        question: '食べ物が気管に入ることを何と言いますか？',
        options: [
          { id: 'a', text: '転倒' },
          { id: 'b', text: '急変' },
          { id: 'c', text: '誤嚥' },
          { id: 'd', text: '拘縮' },
        ],
        correctId: 'c',
        explanation: '誤嚥（ごえん）は食べ物や飲み物が誤って気管に入ることです。高齢者に多い危険なリスクです。Sặc（ごえん）là khi thức ăn hoặc đồ uống nhầm vào khí quản, rủi ro nguy hiểm thường gặp ở người cao tuổi.',
      },
      xpReward: 25,
    },
  },

  'n4-01-16': {
    courseTitle: { ja: 'N4 語彙マスター 〜1,000語〜', vi: 'Từ vựng N4 Master - 1000 từ' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4語彙 第16回 〜気持ち・心理の語彙〜',
      titleTranslation: 'Từ vựng N4 Bài 16 - Từ vựng cảm xúc & tâm lý',
      introduction: `利用者の心理的なケアは身体的なケアと同様に大切です。「不安・安心・焦る・落ち着く・悲しむ・喜ぶ・信頼・孤独」などの感情語彙を理解し、利用者の気持ちに寄り添いましょう。

Chăm sóc tâm lý cho người dùng quan trọng không kém chăm sóc thể chất. Hãy hiểu từ vựng cảm xúc như "不安・安心・焦る・落ち着く・悲しむ・喜ぶ・信頼・孤独" để đồng cảm với người dùng.`,
      keyPoints: [
        '不安（ふあん）: 心配で落ち着かない気持ち（lo lắng, bất an）— 例：手術前の不安',
        '安心（あんしん）: 心配がなくなった状態（yên tâm）— 例：安心してください',
        '焦る（あせる）: 急いで慌てる（nôn nóng, hối hả）— 例：時間に焦る',
        '落ち着く（おちつく）: 気持ちが安定する（bình tĩnh）— 例：深呼吸して落ち着く',
        '信頼（しんらい）: 相手を信じること（tin tưởng）— 例：スタッフへの信頼',
        '孤独（こどく）: 一人で寂しい気持ち（cô đơn）— 例：孤独を感じる',
      ],
      vocabulary: [
        { word: '不安', reading: 'ふあん', meaning: '心配で安定しない気持ち（lo lắng, bất an）', example: '手術前は不安を感じる方が多いです。' },
        { word: '安心', reading: 'あんしん', meaning: '心配がない、穏やかな状態（yên tâm）', example: 'ご家族がいると安心されます。' },
        { word: '焦る', reading: 'あせる', meaning: '急いで慌てること（nôn nóng）', example: '焦らず、ゆっくり食べてください。' },
        { word: '落ち着く', reading: 'おちつく', meaning: '気持ちが穏やかになること（bình tĩnh）', example: '深呼吸すると落ち着きますよ。' },
        { word: '信頼', reading: 'しんらい', meaning: '相手を信じて頼ること（tin tưởng）', example: '利用者との信頼関係を築く。' },
        { word: '孤独', reading: 'こどく', meaning: '一人で寂しい状態（cô đơn, cô lập）', example: '孤独を感じている方には声かけが大切。' },
      ],
      examples: [
        { japanese: '「大丈夫ですよ、安心してください」と声をかけました。', reading: '「だいじょうぶですよ、あんしんしてください」とこえをかけました。', translation: 'Đã nói chuyện rằng "Ổn thôi, hãy yên tâm nhé".' },
        { japanese: '一人で食事をされる利用者さんが孤独を感じないよう、できるだけ一緒にいます。', reading: 'ひとりでしょくじをされるりようしゃさんがこどくをかんじないよう、できるだけいっしょにいます。', translation: 'Để người dùng ăn một mình không cảm thấy cô đơn, cố gắng ở cạnh càng nhiều càng tốt.' },
        { japanese: '利用者さんが不安そうだったので、ゆっくり話を聞いて落ち着いてもらいました。', reading: 'りようしゃさんがふあんそうだったので、ゆっくりはなしをきいておちついてもらいました。', translation: 'Vì người dùng có vẻ lo lắng, đã lắng nghe từ từ để họ bình tĩnh lại.' },
      ],
      grammarNote: `【気持ちを表す表現パターン】
〜を感じる = cảm thấy ~（不安を感じる・孤独を感じる）
〜そうだ = có vẻ ~（不安そうだ・悲しそうだ）
〜になる = trở nên ~（安心になる・落ち着くようになる）

【感情形容詞一覧】
嬉しい（うれしい）= vui mừng
悲しい（かなしい）= buồn
寂しい（さびしい）= cô đơn, nhớ nhà
怖い（こわい）= sợ hãi
辛い（つらい）= đau khổ, khó chịu`,
      quiz: {
        question: '「深呼吸して（　　）しましょう」に入る言葉は？',
        options: [
          { id: 'a', text: '孤独' },
          { id: 'b', text: '焦る' },
          { id: 'c', text: '落ち着く' },
          { id: 'd', text: '不安' },
        ],
        correctId: 'c',
        explanation: '深呼吸は気持ちを「落ち着く（おちつく）」させる方法です。bình tĩnh（おちつく）là trạng thái tâm lý ổn định sau khi thở sâu.',
      },
      xpReward: 25,
    },
  },

  'n4-01-17': {
    courseTitle: { ja: 'N4 語彙マスター 〜1,000語〜', vi: 'Từ vựng N4 Master - 1000 từ' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4語彙 第17回 〜家族・人間関係の語彙〜',
      titleTranslation: 'Từ vựng N4 Bài 17 - Từ vựng gia đình & quan hệ người',
      introduction: `介護現場では多様な人間関係の中で働きます。「主任・同僚・担当者・家族・後見人・サービス提供者」などの関係者を正確に理解し、適切な言葉遣いで対応できるようにしましょう。

Trong điều dưỡng, bạn làm việc trong mối quan hệ đa dạng. Hãy hiểu chính xác các bên liên quan như "主任・同僚・担当者・家族・後見人・サービス提供者" và giao tiếp với từ ngữ phù hợp.`,
      keyPoints: [
        '主任（しゅにん）: チームのリーダー（trưởng nhóm）— 例：主任に報告する',
        '同僚（どうりょう）: 同じ職場の仲間（đồng nghiệp）— 例：同僚と協力する',
        '担当者（たんとうしゃ）: 特定業務を担当する人（người phụ trách）',
        '後見人（こうけんにん）: 判断能力が低下した人の代理人（người giám hộ）',
        'サービス提供者（さーびすていきょうしゃ）: 介護サービスを行う会社（nhà cung cấp dịch vụ）',
        'キーパーソン: 主な意思決定者（người ra quyết định chính）',
      ],
      vocabulary: [
        { word: '主任', reading: 'しゅにん', meaning: 'チームや部署のリーダー（trưởng nhóm）', example: '主任に急変を報告する。' },
        { word: '同僚', reading: 'どうりょう', meaning: '同じ職場・職種の仲間（đồng nghiệp）', example: '同僚にシフトを代わってもらう。' },
        { word: '担当者', reading: 'たんとうしゃ', meaning: '特定の業務や利用者を担当する人（người phụ trách）', example: 'ケアプランの担当者はAさんです。' },
        { word: '後見人', reading: 'こうけんにん', meaning: '判断能力の低下した人の代理人（người giám hộ pháp lý）', example: '後見人の同意が必要です。' },
        { word: 'キーパーソン', reading: 'キーパーソン', meaning: '意思決定の中心となる家族や代理人（người quyết định chính）', example: 'キーパーソンはご長男です。' },
        { word: '利用者家族', reading: 'りようしゃかぞく', meaning: '利用者の家族（gia đình người dùng）', example: '利用者家族に状況を説明する。' },
      ],
      examples: [
        { japanese: '急変の際は、担当者と主任に同時に報告してください。', reading: 'きゅうへんのさいは、たんとうしゃとしゅにんにどうじにほうこくしてください。', translation: 'Khi có đột biến, hãy báo cáo đồng thời cho người phụ trách và trưởng nhóm.' },
        { japanese: 'キーパーソンはご長男ですので、ご家族への連絡はご長男にお伝えください。', reading: 'キーパーソンはごちょうなんですので、ごかぞくへのれんらくはごちょうなんにおつたえください。', translation: 'Vì người quyết định chính là con trai cả, hãy thông báo cho con trai cả khi liên lạc với gia đình.' },
        { japanese: '後見人の方が同意書にサインしてくださいました。', reading: 'こうけんにんのかたがどういしょにサインしてくださいました。', translation: 'Người giám hộ đã ký vào phiếu đồng ý.' },
      ],
      grammarNote: `【〜に〜を報告する（報告の構文）】
主任に急変を報告する = báo cáo đột biến cho trưởng nhóm
担当者に変更を伝える = thông báo thay đổi cho người phụ trách
家族にケアプランを説明する = giải thích kế hoạch cho gia đình

【職場の人間関係語彙まとめ】
施設長（しせつちょう）= giám đốc cơ sở
ケアマネ（ケアマネジャー）= chuyên viên lập kế hoạch
看護師（かんごし）= y tá / 介護士（かいごし）= nhân viên điều dưỡng
相談員（そうだんいん）= nhân viên tư vấn`,
      quiz: {
        question: '判断能力が低下した人の代理人を何と言いますか？',
        options: [
          { id: 'a', text: '主任' },
          { id: 'b', text: '後見人' },
          { id: 'c', text: '担当者' },
          { id: 'd', text: '同僚' },
        ],
        correctId: 'b',
        explanation: '後見人（こうけんにん）は認知症などで判断能力が低下した人の法的代理人です。Người giám hộ（こうけんにん）là đại diện pháp lý của người giảm năng lực phán đoán do mất trí nhớ, v.v.',
      },
      xpReward: 25,
    },
  },

  'n4-01-18': {
    courseTitle: { ja: 'N4 語彙マスター 〜1,000語〜', vi: 'Từ vựng N4 Master - 1000 từ' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4語彙 第18回 〜職場マナー・敬語〜',
      titleTranslation: 'Từ vựng N4 Bài 18 - Phép lịch sự nơi làm việc & kính ngữ',
      introduction: `日本の職場では敬語と礼儀が非常に重要です。「謙譲語・尊敬語・丁寧語・クッション言葉・報連相」を理解し、上司・同僚・利用者に適切な敬語で話せるようになりましょう。

Trong môi trường làm việc Nhật Bản, kính ngữ và lễ nghi rất quan trọng. Hãy hiểu "謙譲語・尊敬語・丁寧語・クッション言葉・報連相" và có thể nói kính ngữ phù hợp với cấp trên, đồng nghiệp và người dùng.`,
      keyPoints: [
        '尊敬語（そんけいご）: 相手を高める表現（kính ngữ tôn trọng đối phương）— いらっしゃる・おっしゃる',
        '謙譲語（けんじょうご）: 自分をへりくだらせる表現（kính ngữ hạ thấp bản thân）— いたす・申す・伺う',
        '丁寧語（ていねいご）: 礼儀正しい表現（kính ngữ lịch sự）— です・ます・ございます',
        'クッション言葉: 依頼・断りを柔らかくする表現（từ đệm）— 恐れ入りますが・よろしければ',
        '報連相（ほうれんそう）: 報告・連絡・相談の略（báo cáo-liên lạc-thảo luận）',
        '言葉遣い（ことばづかい）: 適切な言葉の選び方（cách dùng từ ngữ）',
      ],
      vocabulary: [
        { word: '尊敬語', reading: 'そんけいご', meaning: '相手の行動を高める敬語（kính ngữ tôn trọng đối phương）', example: '先生がいらっしゃいます。' },
        { word: '謙譲語', reading: 'けんじょうご', meaning: '自分の行動をへりくだらせる敬語（kính ngữ khiêm tốn）', example: '私がご説明いたします。' },
        { word: '丁寧語', reading: 'ていねいご', meaning: '礼儀正しい話し方（kính ngữ lịch sự chung）', example: '薬を飲んでいただきます。' },
        { word: 'クッション言葉', reading: 'クッションことば', meaning: '依頼や断りを柔らかくする言葉（từ đệm mềm hóa yêu cầu）', example: '恐れ入りますが、少々お待ちください。' },
        { word: '報連相', reading: 'ほうれんそう', meaning: '報告・連絡・相談（báo cáo-liên lạc-thảo luận）', example: '職場では報連相を徹底する。' },
        { word: '言葉遣い', reading: 'ことばづかい', meaning: '言葉の選び方・使い方（cách dùng từ ngữ）', example: '利用者への言葉遣いに気をつける。' },
      ],
      examples: [
        { japanese: '「恐れ入りますが、もう少しお待ちいただけますでしょうか。」', reading: '「おそれいりますが、もうすこしおまちいただけますでしょうか。」', translation: '"Xin lỗi đã làm phiền, nhưng liệu bạn có thể chờ thêm một chút không?"' },
        { japanese: '「ただ今、主任にご確認いたします。少々お待ちください。」', reading: '「ただいま、しゅにんにごかくにんいたします。しょうしょうおまちください。」', translation: '"Bây giờ tôi sẽ xác nhận với trưởng nhóm. Vui lòng đợi một chút."' },
        { japanese: '報連相は介護現場の基本です。気になることはすぐ上司に相談しましょう。', reading: 'ほうれんそうはかいごげんばのきほんです。きになることはすぐじょうしにそうだんしましょう。', translation: 'Báo cáo-liên lạc-thảo luận là nền tảng của điều dưỡng. Hãy thảo luận ngay với cấp trên về điều bạn lo ngại.' },
      ],
      grammarNote: `【謙譲語の主な動詞】
言う → 申す（もうす）
する → いたす
もらう → いただく
行く → 伺う（うかがう）
知る → 存じる（ぞんじる）

【尊敬語の主な動詞】
言う → おっしゃる
いる → いらっしゃる
する → なさる
食べる → 召し上がる（めしあがる）
来る → いらっしゃる・おいでになる`,
      quiz: {
        question: '「私がご説明（　　）」に入る謙譲語は？',
        options: [
          { id: 'a', text: 'します' },
          { id: 'b', text: 'なさいます' },
          { id: 'c', text: 'いたします' },
          { id: 'd', text: 'おっしゃいます' },
        ],
        correctId: 'c',
        explanation: '謙譲語「いたします」は「する」の謙譲語で、自分の行動をへりくだらせる表現です。「します」は丁寧語、「なさいます」「おっしゃいます」は尊敬語です。Kính ngữ khiêm tốn「いたします」là dạng khiêm tốn của「する」, dùng khi nói về hành động của bản thân.',
      },
      xpReward: 25,
    },
  },

  'n4-01-19': {
    courseTitle: { ja: 'N4 語彙マスター 〜1,000語〜', vi: 'Từ vựng N4 Master - 1000 từ' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4語彙 第19回 〜N4重要語200語特訓〜',
      titleTranslation: 'Từ vựng N4 Bài 19 - Luyện tập 200 từ quan trọng N4',
      introduction: `N4レベルの最重要語彙として複合動詞・派生語・接頭辞を集中的に学びます。「〜直す・〜続ける・〜過ぎる」などの複合動詞パターンを習得し、語彙を効率的に拡張しましょう。

Tập trung học động từ phức hợp, từ phái sinh và tiền tố quan trọng nhất ở cấp N4. Hãy nắm vững các mẫu động từ phức hợp như "〜直す・〜続ける・〜過ぎる" để mở rộng từ vựng hiệu quả.`,
      keyPoints: [
        '〜直す（なおす）: 再び〜する（làm lại）— 書き直す・確認し直す・やり直す',
        '〜続ける（つづける）: 〜を継続する（tiếp tục）— 飲み続ける・働き続ける・観察し続ける',
        '〜過ぎる（すぎる）: 程度が超える（quá mức）— 食べ過ぎる・働き過ぎる・飲み過ぎる',
        '〜始める（はじめる）: 〜を開始する（bắt đầu）— 歩き始める・話し始める',
        '〜終わる（おわる）: 〜が完了する（kết thúc）— 食べ終わる・書き終わる',
        '接尾辞：〜的（てき）・〜性（せい）・〜化（か）・〜感（かん）',
      ],
      vocabulary: [
        { word: '書き直す', reading: 'かきなおす', meaning: 'もう一度書く（viết lại）', example: '記録を書き直してください。' },
        { word: '飲み続ける', reading: 'のみつづける', meaning: '薬を継続して服用する（tiếp tục uống）', example: '退院後も薬を飲み続けます。' },
        { word: '食べ過ぎる', reading: 'たべすぎる', meaning: '食べる量が多すぎる（ăn quá nhiều）', example: '食べ過ぎると血糖値が上がります。' },
        { word: '歩き始める', reading: 'あるきはじめる', meaning: '歩行を開始する（bắt đầu đi bộ）', example: 'リハビリで歩き始めました。' },
        { word: '確認し直す', reading: 'かくにんしなおす', meaning: 'もう一度確認する（xác nhận lại）', example: '薬の量を確認し直してください。' },
        { word: '働き過ぎる', reading: 'はたらきすぎる', meaning: '過度に働く（làm việc quá sức）', example: '働き過ぎに注意してください。' },
      ],
      examples: [
        { japanese: '記録の書き方を間違えたため、書き直しました。', reading: 'きろくのかきかたをまちがえたため、かきなおしました。', translation: 'Vì viết hồ sơ sai, đã viết lại.' },
        { japanese: '退院後も薬を飲み続けることが大切です。', reading: 'たいいんごもくすりをのみつづけることがたいせつです。', translation: 'Việc tiếp tục uống thuốc sau khi xuất viện rất quan trọng.' },
        { japanese: '食べ過ぎに注意して、適度な食事量を守ってください。', reading: 'たべすぎにちゅういして、てきどなしょくじりょうをまもってください。', translation: 'Hãy chú ý không ăn quá nhiều và duy trì lượng ăn hợp lý.' },
      ],
      grammarNote: `【複合動詞の作り方】
動詞の連用形 + 別の動詞
書く（かく）→ 書き + 直す = 書き直す
飲む（のむ）→ 飲み + 続ける = 飲み続ける
食べる（たべる）→ 食べ + 過ぎる = 食べ過ぎる

【接尾辞パターン（N4頻出）】
〜的（てき）: 個人的（こじんてき）・積極的（せっきょくてき）
〜性（せい）: 可能性（かのうせい）・安全性（あんぜんせい）
〜化（か）: 高齢化（こうれいか）・悪化（あっか）
〜感（かん）: 安心感（あんしんかん）・不安感（ふあんかん）`,
      quiz: {
        question: '「薬を毎日（　　）ことが大切です」に入る複合動詞は？',
        options: [
          { id: 'a', text: '飲み過ぎる' },
          { id: 'b', text: '飲み続ける' },
          { id: 'c', text: '飲み直す' },
          { id: 'd', text: '飲み始める' },
        ],
        correctId: 'b',
        explanation: '「飲み続ける（のみつづける）」は継続して飲むことを意味します。毎日薬を継続服用することが回復に大切です。Tiếp tục uống（のみつづける）có nghĩa là uống liên tục. Tiếp tục uống thuốc hàng ngày rất quan trọng cho sự hồi phục.',
      },
      xpReward: 25,
    },
  },

  'n4-01-20': {
    courseTitle: { ja: 'N4 語彙マスター 〜1,000語〜', vi: 'Từ vựng N4 Master - 1000 từ' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4語彙 第20回 〜総復習テスト〜',
      titleTranslation: 'Từ vựng N4 Bài 20 - Kiểm tra tổng ôn tập',
      introduction: `N4語彙マスターコースの総まとめテストです。第11〜19回で学んだ「薬・医療処置・コミュニケーション・社会保険・書類・緊急・心理・人間関係・敬語・複合動詞」から総合的に出題します。しっかり復習してから挑戦しましょう！

Đây là bài kiểm tra tổng kết của khóa học từ vựng N4. Các câu hỏi được lấy tổng hợp từ bài 11~19: "thuốc & y tế, giao tiếp, bảo hiểm xã hội, tài liệu, khẩn cấp, tâm lý, quan hệ người, kính ngữ, động từ phức hợp". Hãy ôn tập kỹ trước khi thử thách!`,
      keyPoints: [
        '【薬・医療】投薬・副作用・点滴・採血・内服・処方箋',
        '【コミュニケーション】相談する・説明する・同意する・拒否する・承諾する',
        '【制度・書類】介護保険・要介護度・ケアプラン・インシデントレポート・同意書',
        '【緊急・安全】転倒・急変・誤嚥・褥瘡・拘縮・アレルギー反応',
        '【敬語・職場】謙譲語・尊敬語・報連相・クッション言葉',
        '【複合動詞】〜直す・〜続ける・〜過ぎる・〜始める・〜終わる',
      ],
      vocabulary: [
        { word: '総復習', reading: 'そうふくしゅう', meaning: '全体を復習すること（ôn tập toàn bộ）', example: '総復習テストで実力を確認する。' },
        { word: '実力', reading: 'じつりょく', meaning: '本当の能力（năng lực thực sự）', example: 'テストで実力を発揮する。' },
        { word: '合格', reading: 'ごうかく', meaning: '試験に受かること（đậu, vượt qua）', example: 'N4に合格することが目標です。' },
        { word: '語彙力', reading: 'ごいりょく', meaning: '語彙の知識と運用能力（năng lực từ vựng）', example: '語彙力を高める練習をする。' },
        { word: '応用', reading: 'おうよう', meaning: '学んだことを実際に使うこと（ứng dụng）', example: '語彙を介護現場で応用する。' },
        { word: '達成', reading: 'たっせい', meaning: '目標を成し遂げること（đạt được mục tiêu）', example: '10レッスン達成おめでとう！' },
      ],
      examples: [
        { japanese: '今まで学んだ語彙を介護現場で積極的に使いましょう。', reading: 'いままでまなんだごいをかいごげんばでせっきょくてきにつかいましょう。', translation: 'Hãy tích cực sử dụng từ vựng đã học vào môi trường điều dưỡng.' },
        { japanese: '総復習テストに合格して、N4語彙マスターを達成しましょう！', reading: 'そうふくしゅうテストにごうかくして、N4ごいマスターをたっせいしましょう！', translation: 'Hãy vượt qua bài kiểm tra tổng ôn tập và đạt được danh hiệu N4 Từ vựng Master!' },
        { japanese: '学んだ敬語を使って、利用者様に丁寧に対応しましょう。', reading: 'まなんだけいごをつかって、りようしゃさまにていねいにたいおうしましょう。', translation: 'Hãy sử dụng kính ngữ đã học để đối xử lịch sự với người dùng.' },
      ],
      grammarNote: `【N4語彙マスター 総まとめ】
このコースで学んだ主要カテゴリー：
1. 薬・医療処置語彙（投薬・副作用・点滴）
2. コミュニケーション動詞（説明・同意・拒否）
3. 社会保険制度（介護保険・要介護度）
4. 書類・記録（ケアプラン・インシデントレポート）
5. 緊急・安全語彙（転倒・誤嚥・褥瘡）
6. 感情・心理語彙（不安・安心・信頼）
7. 人間関係（主任・後見人・キーパーソン）
8. 敬語（謙譲語・尊敬語・クッション言葉）
9. 複合動詞（〜直す・〜続ける・〜過ぎる）`,
      quizzes: [
        {
          question: '「薬の望ましくない反応」を表す語は？ / Từ nào biểu thị "phản ứng không mong muốn của thuốc"?',
          options: [
            { id: 'a', text: '処方箋（しょほうせん）' },
            { id: 'b', text: '副作用（ふくさよう）' },
            { id: 'c', text: '投薬（とうやく）' },
            { id: 'd', text: '内服（ないふく）' },
          ],
          correctId: 'b',
          explanation: '副作用（ふくさよう）= phản ứng phụ của thuốc。処方箋=đơn thuốc、投薬=cho dùng thuốc、内服=uống thuốc（các nghĩa khác nhau）。',
          difficulty: 'easy' as const,
        },
        {
          question: '「ケアプランに（　　）する」に入る最も適切な動詞は？ / Động từ phù hợp nhất điền vào chỗ trống?',
          options: [
            { id: 'a', text: '拒否' },
            { id: 'b', text: '急変' },
            { id: 'c', text: '同意' },
            { id: 'd', text: '採血' },
          ],
          correctId: 'c',
          explanation: 'ケアプランに「同意（どうい）する」= đồng ý với kế hoạch chăm sóc。拒否=từ chối、急変=đột biến（この文脈では不自然）、採血=lấy máu（意味が異なる）。',
          difficulty: 'medium' as const,
        },
        {
          question: '食べ物が気管に入る危険な状態を何と言いますか？ / Tình trạng nguy hiểm khi thức ăn vào khí quản gọi là gì?',
          options: [
            { id: 'a', text: '転倒（てんとう）' },
            { id: 'b', text: '褥瘡（じょくそう）' },
            { id: 'c', text: '誤嚥（ごえん）' },
            { id: 'd', text: '拘縮（こうしゅく）' },
          ],
          correctId: 'c',
          explanation: '誤嚥（ごえん）= sặc/hít nhầm vào khí quản。転倒=ngã、褥瘡=loét do tỳ đè、拘縮=co cứng khớp。すべて介護リスク語彙の重要語です。',
          difficulty: 'medium' as const,
        },
        {
          question: '「私がご説明（　　）」の正しい謙譲語を選んでください。 / Chọn kính ngữ khiêm tốn đúng.',
          options: [
            { id: 'a', text: 'します' },
            { id: 'b', text: 'なさいます' },
            { id: 'c', text: 'いたします' },
            { id: 'd', text: 'おっしゃいます' },
          ],
          correctId: 'c',
          explanation: '「いたします」はする の謙譲語。「します」=丁寧語、「なさいます」「おっしゃいます」=尊敬語。自分の行動には謙譲語を使います。',
          difficulty: 'hard' as const,
        },
        {
          question: '「退院後も薬を（　　）ことが大切です」に入る複合動詞は？ / Động từ phức hợp nào phù hợp?',
          options: [
            { id: 'a', text: '飲み過ぎる' },
            { id: 'b', text: '飲み直す' },
            { id: 'c', text: '飲み始める' },
            { id: 'd', text: '飲み続ける' },
          ],
          correctId: 'd',
          explanation: '「飲み続ける（のみつづける）」= tiếp tục uống（継続）。飲み過ぎる=uống quá nhiều、飲み直す=uống lại、飲み始める=bắt đầu uống。文脈から「継続」が正解。',
          difficulty: 'hard' as const,
        },
      ],
      xpReward: 50,
    },
  },

  // ===== N4 読解 =====
  'n4-03': {
    courseTitle: { ja: 'N4 読解入門 〜短文から段落へ〜', vi: 'Đọc hiểu nhập môn N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4読解: 案内文・お知らせを読む',
      titleTranslation: 'Đọc hiểu N4: Đọc thông báo và hướng dẫn',
      introduction: `N4の読解では案内文・お知らせ・日常のメモなどの実用的な文章が出題されます。介護施設でもシフト表・連絡事項・研修案内など読む機会が多いです。

Đọc hiểu N4 thường có các văn bản thực dụng như thông báo, hướng dẫn, ghi chú hàng ngày. Trong cơ sở điều dưỡng cũng có nhiều dịp đọc bảng phân ca, thông báo liên lạc, thông báo đào tạo.`,
      keyPoints: [
        '設問パターン：「何のお知らせ？」「いつ？」「だれが対象？」',
        '重要情報：日付・時間・場所・条件を素早く見つける',
        '否定・条件表現に注意：「〜の場合」「〜を除いて」「〜が必要」',
        '接続語：「しかし・また・そのため・ただし・なお」',
      ],
      vocabulary: [
        { word: 'お知らせ', reading: 'おしらせ', meaning: '通知（thông báo）', example: '施設からのお知らせ' },
        { word: '対象', reading: 'たいしょう', meaning: '対象となる人（đối tượng）', example: '全スタッフが対象' },
        { word: 'ただし', reading: 'ただし', meaning: '例外・条件（tuy nhiên）', example: 'ただし、休日は除く' },
        { word: '締め切り', reading: 'しめきり', meaning: '期限（hạn chót）', example: '申し込み締め切りは金曜日' },
        { word: '必須', reading: 'ひっす', meaning: '必ず必要（bắt buộc）', example: 'エプロンの着用は必須' },
      ],
      examples: [
        { japanese: '【お知らせ】4月1日より夕食の時間が18:00から17:30に変更になります。', reading: '【おしらせ】しがつついたちよりゆうしょくのじかんがじゅうはちじからじゅうしちじさんじゅっぷんにへんこうになります。', translation: '【Thông báo】Từ ngày 1/4, giờ bữa tối sẽ đổi từ 18:00 thành 17:30.' },
        { japanese: '研修参加は全員必須です。ただし、夜勤者は翌日参加可能です。', reading: 'けんしゅうさんかはぜんいんひっすです。ただし、やきんしゃはよくじつさんかかのうです。', translation: 'Tham gia đào tạo là bắt buộc. Tuy nhiên, nhân viên trực đêm có thể tham gia hôm sau.' },
      ],
      grammarNote: `【読解のコツ】
1. タイトルと最初・最後の文を先に読む
2. 設問を先に確認する
3. 「ただし・なお・しかし」の後は重要な補足情報

【N4頻出接続表現】
また = ngoài ra / そのため = vì vậy
ただし = tuy nhiên / したがって = do đó`,
      quiz: {
        question: '「ただし、当日参加できない方は事前に連絡してください」の意味は？',
        options: [
          { id: 'a', text: '全員当日参加が必須' },
          { id: 'b', text: '当日来られない人は前もって知らせること' },
          { id: 'c', text: '当日参加は禁止' },
          { id: 'd', text: '連絡は不要' },
        ],
        correctId: 'b',
        explanation: '「ただし」は例外・条件を示します。「事前に連絡する」= 前もって知らせること。\n「ただし」chỉ ngoại lệ. 「事前に連絡する」= thông báo trước.',
      },
      xpReward: 25,
    },
  },

  'n4-03-2': {
    courseTitle: { ja: 'N4 読解入門 〜短文から段落へ〜', vi: 'Đọc hiểu nhập môn N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4読解L2: メモ・伝言を読む',
      titleTranslation: 'Đọc hiểu N4 Bài 2: Đọc ghi chú và tin nhắn',
      introduction: `介護現場では、申し送りメモや伝言メモを正確に読むことが毎日求められます。短いメモから「誰が・何を・いつ・どうした」を素早く読み取るトレーニングをしましょう。

Trong môi trường điều dưỡng, việc đọc chính xác ghi chú bàn giao và tin nhắn được yêu cầu hàng ngày. Hãy luyện tập đọc nhanh từ ghi chú ngắn để nắm "ai - cái gì - khi nào - đã làm gì".`,
      keyPoints: [
        '5W1H：誰が（だれが）・何を（なにを）・いつ・どこで・なぜ・どうした',
        '省略に注意：メモは主語・助詞が省かれることが多い',
        '申し送りメモ：時刻・利用者名・状態変化・対応内容を確認',
        '伝言メモ：用件・折り返し先・緊急度を素早く把握',
        '記号・略語：「要確認」「至急」「済」「→」の意味',
        '読み取り手順：①誰について ②いつ ③何があった ④次のアクション',
      ],
      vocabulary: [
        { word: '申し送り', reading: 'もうしおくり', meaning: '次担当者への引き継ぎ（bàn giao ca）', example: '申し送りメモを読む' },
        { word: '伝言', reading: 'でんごん', meaning: 'メッセージ（nhắn tin）', example: '田中さんへの伝言' },
        { word: '至急', reading: 'しきゅう', meaning: '急いで（khẩn cấp）', example: '至急確認してください' },
        { word: '要確認', reading: 'ようかくにん', meaning: '確認が必要（cần xác nhận）', example: '要確認：服薬状況' },
        { word: '済', reading: 'すみ', meaning: '完了（xong/hoàn thành）', example: 'バイタル測定済' },
      ],
      examples: [
        { japanese: '【申し送り】田中様　14時 発熱37.8℃。水分摂取少なめ。夜勤者→要観察。', reading: '【もうしおくり】たなかさま　14じ はつねつ37.8℃。すいぶんせっしゅすくなめ。やきんしゃ→ようかんさつ。', translation: '【Bàn giao】Bác Tanaka: 14h sốt 37.8℃. Uống nước ít. Nhân viên trực đêm→cần theo dõi.' },
        { japanese: '【伝言】山田さんへ　田中様ご家族より電話あり。折り返し連絡希望。番号：090-XXXX。至急。', reading: '【でんごん】やまださんへ　たなかさまごかぞくよりでんわあり。おりかえしれんらくきぼう。ばんごう：090-XXXX。しきゅう。', translation: '【Nhắn tin】Gửi chị Yamada: Gia đình bác Tanaka đã gọi điện. Muốn được gọi lại. Số: 090-XXXX. Khẩn.' },
        { japanese: '10:00 山本様　入浴介助済。右膝に軽い発赤あり→要経過観察。担当：グエン', reading: '10:00 やまもとさま　にゅうよくかいじょすみ。みぎひざにかるいほっせきあり→ようけいかかんさつ。たんとう：ぐえん', translation: '10:00 Bác Yamamoto: Đã hỗ trợ tắm xong. Đầu gối phải có ban đỏ nhẹ→cần theo dõi. Phụ trách: Nguyễn' },
      ],
      grammarNote: `【メモの省略パターン】
通常文：田中さんが14時に熱を出した
メモ：田中様　14時　発熱 ← 助詞・動詞省略

【よく使う記号・略語】
→　= その後/次のアクション
済（すみ）= 完了
要（よう）〜 = 〜が必要
至急（しきゅう）= urgent
※ = 注意事項
( ) = 補足情報

【読み取りの順序】
①利用者名・時刻を確認
②状態・変化を把握
③次のアクション（→以降）を確認`,
      quiz: {
        question: '「バイタル測定済」の「済」の意味は？',
        options: [
          { id: 'a', text: 'これから測る' },
          { id: 'b', text: '測定が完了した' },
          { id: 'c', text: '測定できなかった' },
          { id: 'd', text: '測定が必要' },
        ],
        correctId: 'b',
        explanation: '「済（すみ）」は「完了・終わった」の意味。「〜済」= đã xong/hoàn thành。「未（み）」= まだ（chưa xong）と対。',
      },
      xpReward: 25,
    },
  },

  'n4-03-3': {
    courseTitle: { ja: 'N4 読解入門 〜短文から段落へ〜', vi: 'Đọc hiểu nhập môn N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4読解L3: スケジュール表・シフト表を読む',
      titleTranslation: 'Đọc hiểu N4 Bài 3: Đọc bảng lịch và bảng phân ca',
      introduction: `シフト表・予定表・タイムスケジュールは介護施設で毎日使う文書です。「自分の勤務時間は何時から何時か」「誰と一緒のシフトか」「休みはいつか」を正確に読み取る練習をしましょう。

Bảng phân ca, lịch làm việc, lịch thời gian là những tài liệu dùng hàng ngày tại cơ sở điều dưỡng. Hãy luyện đọc chính xác "Ca của mình từ mấy giờ đến mấy giờ", "Làm ca cùng ai", "Nghỉ hôm nào".`,
      keyPoints: [
        '勤務区分：日勤（にっきん）・遅番（おそばん）・夜勤（やきん）・早番（はやばん）',
        '休暇：公休（こうきゅう）・有休（ゆうきゅう）・休（やす）',
        '読み取り方：横＝日付、縦＝スタッフ名　または　縦＝時間帯',
        '注意マーク：※・★・○・△ の意味を確認する',
        '引き継ぎ：申し送り時間・重複時間（オーバーラップ）を確認',
        '変更・代替：「〜さんと交代」「〜日変更」の読み取り',
      ],
      vocabulary: [
        { word: '日勤', reading: 'にっきん', meaning: '日中の勤務（ca ngày）', example: '日勤は8:30〜17:30' },
        { word: '夜勤', reading: 'やきん', meaning: '夜間の勤務（ca đêm）', example: '夜勤は16:30〜翌9:00' },
        { word: '公休', reading: 'こうきゅう', meaning: '決められた休み（ngày nghỉ theo lịch）', example: '今月の公休は4日間' },
        { word: '早番', reading: 'はやばん', meaning: '早い時間の勤務（ca sáng sớm）', example: '早番は7:00〜16:00' },
        { word: 'オーバーラップ', reading: 'おーばーらっぷ', meaning: '申し送りのための重複時間（thời gian bàn giao）', example: '15分のオーバーラップ' },
      ],
      examples: [
        { japanese: '月曜日：グエン　日勤（8:30〜17:30）　田中　夜勤（16:30〜）　山田　公休', reading: 'げつようび：ぐえん　にっきん（8:30〜17:30）　たなか　やきん（16:30〜）　やまだ　こうきゅう', translation: 'Thứ Hai: Nguyễn ca ngày (8:30〜17:30), Tanaka ca đêm (16:30〜), Yamada nghỉ' },
        { japanese: '※15日（木）グエンさんと山田さんはシフト交代。詳細は主任まで。', reading: '※15にち（もく）ぐえんさんとやまださんはしふとこうたい。しょうさいはしゅにんまで。', translation: '※Ngày 15 (thứ Năm) Nguyễn và Yamada đổi ca. Chi tiết hỏi trưởng nhóm.' },
        { japanese: '早番7:00〜、日勤8:30〜、遅番12:00〜、夜勤16:30〜のシフトがあります。', reading: 'はやばん7:00〜、にっきん8:30〜、おそばん12:00〜、やきん16:30〜のしふとがあります。', translation: 'Có các ca: ca sáng sớm 7:00〜, ca ngày 8:30〜, ca chiều 12:00〜, ca đêm 16:30〜.' },
      ],
      grammarNote: `【シフト表の基本構成】
縦軸 = スタッフ名
横軸 = 日付（1日〜末日）
セルの内容 = 勤務区分または公休

【勤務区分の略記】
日 = 日勤　夜 = 夜勤
早 = 早番　遅 = 遅番
公 = 公休　有 = 有給休暇
― または 空欄 = 休日

【設問でよく問われること】
①〇〇さんは何日に休みですか？
②〇〇日は何人出勤していますか？
③〇〇さんの今月の夜勤は何回ですか？`,
      quiz: {
        question: 'シフト表の「公休」とは何ですか？',
        options: [
          { id: 'a', text: '有給休暇' },
          { id: 'b', text: '勤務のある日' },
          { id: 'c', text: '会社が決めた休日' },
          { id: 'd', text: '夜勤の日' },
        ],
        correctId: 'c',
        explanation: '「公休（こうきゅう）」は会社・施設が定めた休日。「有休（有給休暇）」は自分が申請する休みとは別。\n"Công hưu" = ngày nghỉ theo lịch do cơ sở quy định, khác với nghỉ phép cá nhân.',
      },
      xpReward: 25,
    },
  },

  'n4-03-4': {
    courseTitle: { ja: 'N4 読解入門 〜短文から段落へ〜', vi: 'Đọc hiểu nhập môn N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4読解L4: 指示書・マニュアルを読む',
      titleTranslation: 'Đọc hiểu N4 Bài 4: Đọc hướng dẫn và sổ tay',
      introduction: `介護現場では「手順書」「作業マニュアル」「注意事項」などを正確に読み、手順通りに業務を行う必要があります。番号付き手順・条件分岐・注意書きの読み取りを練習しましょう。

Tại môi trường điều dưỡng, cần đọc chính xác "sổ tay quy trình", "hướng dẫn công việc", "lưu ý" và thực hiện công việc đúng quy trình. Hãy luyện đọc quy trình đánh số, phân nhánh điều kiện và ghi chú cảnh báo.`,
      keyPoints: [
        '番号付き手順：①②③の順番を守る・飛ばさない',
        '条件分岐：「〜の場合は〜」「〜なら〜」「〜でなければ〜」',
        '注意書き：「必ず〜」「〜してはいけない」「〜に注意」',
        '禁止事項：「禁止・不可・しないこと」のマーク',
        '例外処理：「ただし〜」「〜を除く」「〜の場合は除外」',
        '確認事項：「〜を確認してから」「〜の後で」の順序',
      ],
      vocabulary: [
        { word: '手順', reading: 'てじゅん', meaning: '順番・プロセス（quy trình）', example: '手順に従って行う' },
        { word: '禁忌', reading: 'きんき', meaning: 'してはいけないこと（chống chỉ định）', example: '禁忌事項を確認する' },
        { word: '必ず', reading: 'かならず', meaning: '絶対に（nhất định）', example: '必ず手洗いをすること' },
        { word: '〜に従う', reading: 'にしたがう', meaning: '〜の通りにする（tuân theo）', example: '手順書に従う' },
        { word: '例外', reading: 'れいがい', meaning: 'ルールに当てはまらない場合（ngoại lệ）', example: '例外として〜' },
      ],
      examples: [
        { japanese: '【入浴介助手順】①体温・血圧確認 ②入浴可否判断 ③脱衣介助 ④入浴 ⑤着衣介助 ⑥水分補給', reading: '【にゅうよくかいじょてじゅん】①たいおん・けつあつかくにん ②にゅうよくかひはんだん ③だついかいじょ ④にゅうよく ⑤ちゃくいかいじょ ⑥すいぶんほきゅう', translation: '【Quy trình hỗ trợ tắm】①Kiểm tra nhiệt độ/huyết áp ②Đánh giá khả năng tắm ③Hỗ trợ cởi đồ ④Tắm ⑤Hỗ trợ mặc đồ ⑥Bổ sung nước' },
        { japanese: '※体温37.5℃以上の場合は入浴中止。必ず看護師に報告すること。', reading: '※たいおん37.5℃いじょうのばあいはにゅうよくちゅうし。かならずかんごしにほうこくすること。', translation: '※Trường hợp nhiệt độ từ 37.5℃ trở lên, ngừng tắm. Nhất định phải báo y tá.' },
        { japanese: '薬の投与前に必ず①名前 ②薬の種類 ③量 ④時間 の4点を確認すること。', reading: 'くすりのとうよまえにかならず①なまえ ②くすりのしゅるい ③りょう ④じかん の4てんをかくにんすること。', translation: 'Trước khi dùng thuốc, nhất định xác nhận 4 điểm: ①Tên ②Loại thuốc ③Liều lượng ④Thời gian.' },
      ],
      grammarNote: `【指示書の文体的特徴】
・命令形・義務表現が多い
  「〜すること」「〜してください」「〜しなければならない」
・条件表現
  「〜の場合は〜」「〜なら〜」「〜でなければ〜」
・禁止表現
  「〜してはいけない」「〜禁止」「〜不可」

【読解のポイント】
①番号順を確認する
②※や注意書きを見逃さない
③条件（if）と対応アクション（then）を対で読む
④「必ず・絶対に」は最重要事項`,
      quiz: {
        question: '手順書に「必ず看護師に報告すること」とある。これはどういう意味か？',
        options: [
          { id: 'a', text: '時間があれば報告してよい' },
          { id: 'b', text: '報告は任意（しなくてもよい）' },
          { id: 'c', text: '例外なく必ず報告しなければならない' },
          { id: 'd', text: '看護師がいれば報告する' },
        ],
        correctId: 'c',
        explanation: '「必ず（かならず）」= nhất định / không có ngoại lệ。指示書での「必ず〜すること」は義務・強制の意味。例外は認められない。',
      },
      xpReward: 25,
    },
  },

  'n4-03-5': {
    courseTitle: { ja: 'N4 読解入門 〜短文から段落へ〜', vi: 'Đọc hiểu nhập môn N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4読解L5: 接続詞を使いこなす',
      titleTranslation: 'Đọc hiểu N4 Bài 5: Sử dụng thành thạo liên từ',
      introduction: `文章の流れを決める「接続詞」を正しく理解することで、読解力が大幅に向上します。「しかし・そのため・ただし・また・なお・したがって」などは、N4読解の設問に直結する重要表現です。

Hiểu đúng "liên từ" quyết định luồng văn bản sẽ cải thiện đáng kể kỹ năng đọc hiểu. Các từ như "しかし・そのため・ただし・また・なお・したがって" là những cách diễn đạt quan trọng liên trực tiếp đến câu hỏi đọc hiểu N4.`,
      keyPoints: [
        '逆接：しかし・でも・ところが・けれども → 前の内容と反対',
        '順接：そのため・だから・したがって・ゆえに → 前の結果・結論',
        '添加：また・さらに・そのうえ・加えて → 情報を追加',
        '対比：一方・それに対して・反対に → 二つを比べる',
        '補足：ただし・なお・ちなみに → 例外・補足情報',
        '言い換え：つまり・すなわち・要するに → 前の内容を言い直す',
      ],
      vocabulary: [
        { word: 'したがって', reading: 'したがって', meaning: 'だから・そのため（do đó/vì vậy）', example: '熱があった。したがって、入浴は中止した。' },
        { word: 'ただし', reading: 'ただし', meaning: '例外・補足（tuy nhiên/nhưng）', example: '全員参加。ただし夜勤者は除く。' },
        { word: '一方', reading: 'いっぽう', meaning: '他方・それに対して（mặt khác）', example: 'A棟は人手不足。一方、B棟は問題なし。' },
        { word: 'なお', reading: 'なお', meaning: '補足情報（ngoài ra/thêm vào đó）', example: 'なお、詳細は後日連絡します。' },
        { word: 'つまり', reading: 'つまり', meaning: '言い換え（tức là/nói cách khác）', example: 'つまり、明日は全員出勤ということです。' },
      ],
      examples: [
        { japanese: '田中様は食欲が回復した。しかし、体重はまだ戻っていない。', reading: 'たなかさまはしょくよくがかいふくした。しかし、たいじゅうはまだもどっていない。', translation: 'Bác Tanaka đã hồi phục cảm giác ngon miệng. Tuy nhiên, cân nặng vẫn chưa về mức cũ.' },
        { japanese: '昨日は転倒リスクが高かった。そのため、一人での歩行を禁止した。', reading: 'きのうはてんとうりすくがたかかった。そのため、ひとりでのほこうをきんしした。', translation: 'Hôm qua nguy cơ té ngã cao. Do đó, đã cấm đi bộ một mình.' },
        { japanese: '研修は全員参加です。ただし、体調不良の場合は欠席可。なお、資料は後日配布します。', reading: 'けんしゅうはぜんいんさんかです。ただし、たいちょうふりょうのばあいはけっせきか。なお、しりょうはごじつはいふします。', translation: 'Đào tạo tất cả phải tham gia. Nhưng nếu không khỏe có thể vắng. Ngoài ra, tài liệu sẽ phát sau.' },
      ],
      grammarNote: `【接続詞の分類と機能】

①逆接（ぎゃくせつ）= Nghịch chiều
  しかし・でも・ところが・けれども
  → 前の内容と反対・予想外の展開

②順接（じゅんせつ）= Thuận chiều
  そのため・だから・したがって・ゆえに
  → 前の原因→結果・理由→結論

③添加（てんか）= Bổ sung thêm
  また・さらに・そのうえ・加えて
  → 情報を重ねて追加する

④補足（ほそく）= Chú thích/Bổ sung
  ただし・なお・ちなみに
  → 例外・条件・関連情報`,
      quiz: {
        question: '「体温は正常だった。（　）、食欲がなかった。」に入る接続詞は？',
        options: [
          { id: 'a', text: 'したがって' },
          { id: 'b', text: 'しかし' },
          { id: 'c', text: 'なお' },
          { id: 'd', text: 'つまり' },
        ],
        correctId: 'b',
        explanation: '体温正常（良い情報）→ 食欲なし（悪い情報）は逆の内容。逆接の「しかし」が正解。\n「しかし」= however = nối hai ý trái chiều nhau.',
      },
      xpReward: 25,
    },
  },

  'n4-03-6': {
    courseTitle: { ja: 'N4 読解入門 〜短文から段落へ〜', vi: 'Đọc hiểu nhập môn N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4読解L6: 否定・条件表現を読む',
      titleTranslation: 'Đọc hiểu N4 Bài 6: Đọc hiểu phủ định và điều kiện',
      introduction: `「〜ない場合」「〜を除いて」「〜に限り」「〜でなければ」などの否定・条件表現は、読み間違えると業務ミスにつながります。介護記録や指示書で頻出のパターンを正確に理解しましょう。

Các cách diễn đạt phủ định và điều kiện như "〜ない場合", "〜を除いて", "〜に限り" nếu đọc sai sẽ dẫn đến sai sót công việc. Hãy hiểu chính xác các mẫu thường xuất hiện trong hồ sơ điều dưỡng và phiếu chỉ định.`,
      keyPoints: [
        '否定条件：〜ない場合（trường hợp không〜）/ 〜でなければ（nếu không〜）',
        '除外：〜を除いて（ngoại trừ〜）/ 〜以外（ngoài〜 ra）',
        '限定：〜に限り（chỉ trong trường hợp〜）/ 〜のみ（chỉ〜）',
        '二重否定：〜ないわけではない（không phải là không〜）→ 実際は肯定',
        '注意：「〜してはいけない」vs「〜しなくてもいい」の違い',
        '確認法：否定・条件を外して意味を確認してから全体を読む',
      ],
      vocabulary: [
        { word: '〜に限り', reading: 'にかぎり', meaning: '〜の場合だけ（chỉ trong〜）', example: '緊急時に限り連絡可' },
        { word: '〜を除く', reading: 'をのぞく', meaning: '〜は含まない（ngoại trừ〜）', example: '夜勤者を除く全員' },
        { word: '〜以外', reading: 'いがい', meaning: '〜を除いたもの（ngoài〜 ra）', example: '担当者以外は入室禁止' },
        { word: '〜でなければ', reading: 'でなければ', meaning: '〜でない場合は（nếu không phải〜）', example: '許可でなければ使用不可' },
        { word: '二重否定', reading: 'にじゅうひてい', meaning: '否定の否定→肯定（phủ định kép）', example: '不可能ではない＝可能' },
      ],
      examples: [
        { japanese: '担当者以外の職員は、利用者の個人情報を閲覧してはいけない。', reading: 'たんとうしゃいがいのしょくいんは、りようしゃのこじんじょうほうをえつらんしてはいけない。', translation: 'Nhân viên ngoài người phụ trách không được xem thông tin cá nhân của người dùng.' },
        { japanese: '医師の指示がある場合を除き、勝手に薬の量を変えてはいけない。', reading: 'いしのしじがあるばあいをのぞき、かってにくすりのりょうをかえてはいけない。', translation: 'Trừ trường hợp có chỉ thị của bác sĩ, không được tự ý thay đổi liều lượng thuốc.' },
        { japanese: '夜間緊急時に限り、主任への連絡なしに対応してよい。', reading: 'やかんきんきゅうじにかぎり、しゅにんへのれんらくなしにたいおうしてよい。', translation: 'Chỉ trong trường hợp khẩn cấp ban đêm, được phép xử lý mà không cần báo trưởng nhóm.' },
      ],
      grammarNote: `【否定・条件表現まとめ】

除外：〜を除いて / 〜以外（は）
  例：夜勤者を除いて全員参加
  →夜勤者は参加しなくていい、それ以外は参加

限定：〜に限り / 〜のみ
  例：緊急時に限り許可
  →緊急時だけOK、普段はNG

禁止：〜してはいけない / 〜禁止
  例：許可なく入室してはいけない

不要：〜しなくてもいい / 〜する必要はない
  例：休日は報告しなくてもいい

【混同注意】
「〜してはいけない」= 禁止（cấm）
「〜しなくてもいい」= 不要（không cần）
→ 全く意味が違う！`,
      quiz: {
        question: '「担当者以外は使用禁止」とあります。担当者はどうですか？',
        options: [
          { id: 'a', text: '担当者も使用禁止' },
          { id: 'b', text: '担当者は使用できる' },
          { id: 'c', text: '担当者は申請が必要' },
          { id: 'd', text: 'わからない' },
        ],
        correctId: 'b',
        explanation: '「〜以外は禁止」= 〜以外の人が禁止 → つまり「〜（担当者）は使用できる」。\n"〜以外は禁止" = cấm đối với người không phải 〜 → người phụ trách được phép dùng.',
      },
      xpReward: 25,
    },
  },

  'n4-03-7': {
    courseTitle: { ja: 'N4 読解入門 〜短文から段落へ〜', vi: 'Đọc hiểu nhập môn N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4読解L7: 因果関係を読む',
      titleTranslation: 'Đọc hiểu N4 Bài 7: Đọc hiểu quan hệ nhân quả',
      introduction: `「なぜそうなったのか（原因）」と「その結果どうなったか（結果）」を読み取る因果関係の把握は、介護記録の読み書きに直結します。「〜ので・〜から・〜ため・〜結果」などの表現を正確に理解しましょう。

Nắm bắt quan hệ nhân quả - đọc "tại sao lại như vậy (nguyên nhân)" và "kết quả là gì (kết quả)" liên quan trực tiếp đến đọc và viết hồ sơ điều dưỡng. Hãy hiểu chính xác các cách diễn đạt như "〜ので・〜から・〜ため・〜結果".`,
      keyPoints: [
        '原因・理由：〜ので（vì〜 / do〜）・〜から・〜ため・〜によって',
        '結果：〜結果（kết quả là〜）・〜ことになった・〜ようになった',
        '目的：〜ために（để〜）← 原因の「ため」と区別する',
        '経緯説明：まず〜、次に〜、その結果〜',
        '介護記録での使い方：「〜のため、〜した」形式が標準',
        '設問パターン：「なぜ〜しましたか」→ 理由を探す',
      ],
      vocabulary: [
        { word: '〜ため', reading: 'ため', meaning: '理由・目的（vì〜/để〜）', example: '転倒のため、入院した' },
        { word: '〜によって', reading: 'によって', meaning: '〜が原因で（do〜/bởi〜）', example: '感染症によって体力低下' },
        { word: '結果', reading: 'けっか', meaning: '〜の後の状態（kết quả）', example: '治療の結果、回復した' },
        { word: '経緯', reading: 'けいい', meaning: '事の流れ・いきさつ（diễn biến）', example: '転倒の経緯を報告する' },
        { word: '原因', reading: 'げんいん', meaning: '何かが起きた理由（nguyên nhân）', example: '発熱の原因を調べる' },
      ],
      examples: [
        { japanese: '田中様は昨夜よく眠れなかったため、今朝は食欲がなかった。', reading: 'たなかさまはゆうべよくねむれなかったため、けさはしょくよくがなかった。', translation: 'Do đêm qua bác Tanaka ngủ không được, sáng nay không có cảm giác ngon miệng.' },
        { japanese: '廊下が濡れていたことによって、転倒事故が発生した。今後は濡れた場合すぐに拭くこと。', reading: 'ろうかがぬれていたことによって、てんとうじこがはっせいした。こんごはぬれたばあいすぐにふくこと。', translation: 'Do hành lang bị ướt, đã xảy ra tai nạn té ngã. Từ nay nếu ướt phải lau ngay.' },
        { japanese: '服薬確認を行った結果、2錠飲み残しがあることが判明した。担当看護師に報告済。', reading: 'ふくやくかくにんをおこなったけっか、2じょうのみのこしがあることがはんめいした。たんとうかんごしにほうこくすみ。', translation: 'Kết quả kiểm tra việc uống thuốc, phát hiện còn sót 2 viên. Đã báo cáo y tá phụ trách.' },
      ],
      grammarNote: `【因果関係の表現パターン】

原因→結果（nguyên nhân → kết quả）
  〜ので / 〜から / 〜ため（に）
  例：熱があったので入浴を中止した

結果→原因（kết quả → nguyên nhân）
  〜のは〜からだ / 〜のは〜ためだ
  例：入浴を中止したのは熱があったからだ

経緯の説明（diễn biến）
  まず〜。次に〜。その結果〜。
  例：まず体温を測った。37.8℃だった。
     そのため入浴を中止し、看護師に報告した。

【介護記録の標準フォーマット】
「〜のため、〜した。その結果、〜。」`,
      quiz: {
        question: '「水分摂取が少なかったため、血圧が低下した」の原因は何ですか？',
        options: [
          { id: 'a', text: '血圧が低下したこと' },
          { id: 'b', text: '水分摂取が少なかったこと' },
          { id: 'c', text: '食事が少なかったこと' },
          { id: 'd', text: '運動したこと' },
        ],
        correctId: 'b',
        explanation: '「〜ため」の前が原因。「水分摂取が少なかった」→（原因）→「血圧が低下した」（結果）。\n"〜ため" の前 = nguyên nhân. Uống ít nước → huyết áp giảm.',
      },
      xpReward: 25,
    },
  },

  'n4-03-8': {
    courseTitle: { ja: 'N4 読解入門 〜短文から段落へ〜', vi: 'Đọc hiểu nhập môn N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4読解L8: 主題・要点を見つける',
      titleTranslation: 'Đọc hiểu N4 Bài 8: Tìm chủ đề và điểm chính',
      introduction: `段落の「主題（何について書いているか）」と「要点（一番言いたいこと）」を素早く見つけるスキルは、N4読解の核心です。最初の文・最後の文・「〜が大切だ」「〜が重要だ」のパターンに注目しましょう。

Kỹ năng nhanh chóng tìm ra "chủ đề (viết về điều gì)" và "điểm chính (muốn nói nhất điều gì)" của đoạn văn là cốt lõi của đọc hiểu N4. Hãy chú ý đến câu đầu, câu cuối và các mẫu "〜が大切だ", "〜が重要だ".`,
      keyPoints: [
        '主題の場所：最初の文（導入）または最後の文（結論）',
        '要点の合図：「〜が大切だ・〜が重要だ・〜が必要だ」',
        '言い換え合図：「つまり・要するに・すなわち」の後',
        '具体例の合図：「例えば・たとえば・〜などが挙げられる」',
        '強調：「特に・とくに・何より・最も」の後の内容',
        '設問で問われやすい：「この文章で筆者が最も言いたいことは？」',
      ],
      vocabulary: [
        { word: '主題', reading: 'しゅだい', meaning: '一番のテーマ（chủ đề）', example: 'この文章の主題は？' },
        { word: '要点', reading: 'ようてん', meaning: '大切な点（điểm chính）', example: '要点をまとめる' },
        { word: '特に', reading: 'とくに', meaning: '特別に（đặc biệt）', example: '特に感染予防が大切' },
        { word: '要するに', reading: 'ようするに', meaning: 'まとめると（tóm lại）', example: '要するに報告が必要だ' },
        { word: '挙げられる', reading: 'あげられる', meaning: '例として示せる（có thể nêu ra）', example: '例として感染症が挙げられる' },
      ],
      examples: [
        { japanese: '介護の現場では、利用者の小さな変化に気づくことが重要です。例えば、食欲の変化・表情の変化・会話の減少などが挙げられます。要するに、毎日の細かい観察が大切なのです。', reading: 'かいごのげんばでは、りようしゃのちいさなへんかにきづくことがじゅうようです。たとえば、しょくよくのへんか・ひょうじょうのへんか・かいわのげんしょうなどがあげられます。ようするに、まいにちのこまかいかんさつがたいせつなのです。', translation: 'Tại hiện trường điều dưỡng, việc nhận ra những thay đổi nhỏ của người dùng là quan trọng. Ví dụ như thay đổi cảm giác ăn, thay đổi biểu cảm, giảm trò chuyện. Tóm lại, quan sát tỉ mỉ hàng ngày là điều cần thiết.' },
        { japanese: '感染予防の基本は手洗いです。特に、食事介助前・排泄介助後は必ず実施してください。', reading: 'かんせんよぼうのきほんはてあらいです。とくに、しょくじかいじょまえ・はいせつかいじょごはかならずじっしてください。', translation: 'Cơ bản phòng chống nhiễm khuẩn là rửa tay. Đặc biệt, trước khi hỗ trợ ăn uống và sau khi hỗ trợ vệ sinh nhất định phải thực hiện.' },
      ],
      grammarNote: `【段落構造のパターン】

①首尾一貫型（chủ đề ở đầu）
  主題文 → 説明・例 → まとめ

②クライマックス型（chủ đề ở cuối）
  説明・例 → 説明・例 → 結論（主題）

③対比型（so sánh hai ý）
  〜は〜だ。一方、〜は〜だ。

【主題を見つけるヒント】
・「大切・重要・必要・必須」の前の名詞
・「つまり・要するに・すなわち」の後の文
・「特に・何より・最も」の後の内容
・繰り返し出てくるキーワード`,
      quiz: {
        question: '「要するに、毎日の観察が大切なのです」のような文は文章のどこに来ることが多い？',
        options: [
          { id: 'a', text: '文章の最初' },
          { id: 'b', text: '文章の途中・例示の後' },
          { id: 'c', text: '文章の最後（結論）' },
          { id: 'd', text: '関係ない' },
        ],
        correctId: 'c',
        explanation: '「要するに（tóm lại）」は前の内容をまとめる言葉で、文章の最後・結論部分によく使われる。\n"要するに" = tóm lại, thường xuất hiện ở cuối đoạn văn như phần kết luận.',
      },
      xpReward: 25,
    },
  },

  'n4-03-9': {
    courseTitle: { ja: 'N4 読解入門 〜短文から段落へ〜', vi: 'Đọc hiểu nhập môn N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4読解L9: グラフ・図表の読み取り',
      titleTranslation: 'Đọc hiểu N4 Bài 9: Đọc biểu đồ và bảng số liệu',
      introduction: `介護現場ではバイタル記録表・体重グラフ・服薬記録など数値や表を読む機会が多くあります。N4ではグラフ・表の読み取り問題も出題されます。増減・比較・最大値・最小値を表す語彙をマスターしましょう。

Trong môi trường điều dưỡng có nhiều cơ hội đọc số liệu và bảng biểu như bảng ghi dấu hiệu sinh tồn, biểu đồ cân nặng, hồ sơ dùng thuốc. N4 cũng có câu hỏi đọc biểu đồ và bảng. Hãy thành thạo từ vựng biểu thị tăng giảm, so sánh, giá trị lớn nhất, nhỏ nhất.`,
      keyPoints: [
        '増加：増える・上昇する・高くなる・〜以上になる',
        '減少：減る・低下する・低くなる・〜以下になる',
        '最大・最小：最も高い・最も低い・ピーク・最大値',
        '比較：〜より・〜のほうが・〜倍・〜割増/減',
        '変化なし：変わらない・安定している・横ばい',
        '設問パターン：「いつが最も高い？」「何月に減った？」「AとBどちらが多い？」',
      ],
      vocabulary: [
        { word: '上昇', reading: 'じょうしょう', meaning: '高くなること（tăng lên）', example: '体温が上昇した' },
        { word: '低下', reading: 'ていか', meaning: '低くなること（giảm xuống）', example: '血圧が低下した' },
        { word: '横ばい', reading: 'よこばい', meaning: '変化がない（ổn định/ngang bằng）', example: '体重は横ばいです' },
        { word: '最大値', reading: 'さいだいち', meaning: '一番大きい数値（giá trị lớn nhất）', example: '今月の最大値は38.2℃' },
        { word: '推移', reading: 'すいい', meaning: '時間の流れによる変化（xu hướng thay đổi）', example: '体重の推移を確認する' },
      ],
      examples: [
        { japanese: '田中様の体重推移：4月62kg → 5月61kg → 6月59kg。2か月で3kg減少。要注意。', reading: 'たなかさまのたいじゅうすいい：4がつ62kg → 5がつ61kg → 6がつ59kg。2かげつで3kgげんしょう。ようちゅうい。', translation: 'Xu hướng cân nặng bác Tanaka: T4 62kg → T5 61kg → T6 59kg. Giảm 3kg trong 2 tháng. Cần chú ý.' },
        { japanese: '今月の体温記録：最高38.1℃（3日）、最低36.1℃（15日）、平均36.5℃。', reading: 'こんげつのたいおんきろく：さいこう38.1℃（3にち）、さいてい36.1℃（15にち）、へいきん36.5℃。', translation: 'Ghi chép nhiệt độ tháng này: cao nhất 38.1℃ (ngày 3), thấp nhất 36.1℃ (ngày 15), trung bình 36.5℃.' },
        { japanese: '先月と比べ、食事摂取量が約2割減少している。栄養士への相談を検討する。', reading: 'せんげつとくらべ、しょくじせっしゅりょうがやく2わりげんしょうしている。えいようしへのそうだんをけんとうする。', translation: 'So với tháng trước, lượng ăn đã giảm khoảng 20%. Xem xét tham khảo chuyên gia dinh dưỡng.' },
      ],
      grammarNote: `【増減を表す語彙】
増加：増える・上昇・上がる・高くなる
   約〜増・〜倍になる・〜割増
減少：減る・低下・下がる・低くなる
   約〜減・〜割減・半分になる

【安定を表す語彙】
変化なし：横ばい・安定・維持・変わらない

【比較表現】
〜より〜のほうが〜
〜と比べて〜
〜に対して〜

【表・グラフ設問の解き方】
①縦軸・横軸の単位を確認
②最大・最小を見つける
③変化の傾向（増減・安定）を読む
④設問の条件（期間・対象）を絞る`,
      quiz: {
        question: '「体重が横ばいです」の意味は？',
        options: [
          { id: 'a', text: '体重が増えている' },
          { id: 'b', text: '体重が減っている' },
          { id: 'c', text: '体重がほとんど変化していない' },
          { id: 'd', text: '体重が大きく変動している' },
        ],
        correctId: 'c',
        explanation: '「横ばい（よこばい）」= グラフが横（水平）になっている状態 = 変化がない・安定。\n"Yoko-bai" = đường biểu đồ nằm ngang = không thay đổi, ổn định.',
      },
      xpReward: 25,
    },
  },

  'n4-03-10': {
    courseTitle: { ja: 'N4 読解入門 〜短文から段落へ〜', vi: 'Đọc hiểu nhập môn N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4読解L10: 筆者の意図・推測を読む',
      titleTranslation: 'Đọc hiểu N4 Bài 10: Đọc ý định tác giả và suy luận',
      introduction: `N4読解では「筆者は何が言いたいのか」「この行動の意図は何か」を推測する問題が出ます。直接書かれていない内容を文脈から読み取るスキルを練習しましょう。

N4 đọc hiểu có các câu hỏi suy luận "tác giả muốn nói gì", "ý định của hành động này là gì". Hãy luyện kỹ năng đọc hiểu nội dung không được viết trực tiếp từ văn cảnh.`,
      keyPoints: [
        '推測表現：〜と思われる・〜でしょう・〜かもしれない・〜と考えられる',
        '婉曲表現：直接言わずにほのめかす（〜ではないでしょうか）',
        '文脈から推測：前後の文から意味を判断する',
        '設問パターン：「筆者はなぜ〜と言っているのか」「〜とはどういう意味か」',
        '誤答のパターン：書いていないことを正解にしない',
        '根拠探し：必ず本文に根拠がある',
      ],
      vocabulary: [
        { word: '〜と思われる', reading: 'とおもわれる', meaning: '〜だと推測される（được cho là〜）', example: '感染と思われる症状がある' },
        { word: '意図', reading: 'いと', meaning: 'やろうとしている目的（ý định）', example: '行動の意図を理解する' },
        { word: '示唆する', reading: 'しさする', meaning: 'ほのめかす（ngầm chỉ）', example: '問題があることを示唆している' },
        { word: '文脈', reading: 'ぶんみゃく', meaning: '前後のつながり（văn cảnh）', example: '文脈から意味を読む' },
        { word: '根拠', reading: 'こんきょ', meaning: '理由・証拠（căn cứ）', example: '本文に根拠を見つける' },
      ],
      examples: [
        { japanese: '「介護者自身の健康管理も大切です」と繰り返し述べているのは、スタッフが無理をしがちであることを示唆していると思われる。', reading: '「かいごしゃじしんのけんこうかんりもたいせつです」とくりかえしのべているのは、すたっふがむりをしがちであることをしさしていとおもわれる。', translation: 'Việc lặp đi lặp lại "sức khỏe bản thân người chăm sóc cũng quan trọng" có vẻ ngầm chỉ rằng nhân viên có xu hướng cố quá sức.' },
        { japanese: '筆者が「ほうれんそう」を強調しているのは、報告不足による事故が多いためと考えられる。', reading: 'ひっしゃが「ほうれんそう」をきょうちょうしているのは、ほうこくぶそくによるじこがおおいためとかんがえられる。', translation: 'Việc tác giả nhấn mạnh "hōrenso" được cho là do nhiều tai nạn xảy ra vì thiếu báo cáo.' },
      ],
      grammarNote: `【推測・意図の表現】
可能性（khả năng）：
  〜かもしれない / 〜だろう / 〜でしょう

推定（suy đoán có căn cứ）：
  〜と思われる / 〜と考えられる / 〜らしい

婉曲（nói vòng）：
  〜ではないでしょうか
  〜のではないかと思う

【設問の解き方】
①「筆者が最も言いたいこと」→ 結論部分・強調表現を探す
②「〜とはどういう意味か」→ 前後の文から言い換えを探す
③「なぜ〜か」→ 理由を表す表現（ので・から・ため）を探す
④選択肢のうち、本文に根拠がないものは×`,
      quiz: {
        question: '「〜と考えられる」はどんな意味ですか？',
        options: [
          { id: 'a', text: '確実にそうだ' },
          { id: 'b', text: '絶対ちがう' },
          { id: 'c', text: '証拠や文脈からそう推測される' },
          { id: 'd', text: '自分の希望' },
        ],
        correctId: 'c',
        explanation: '「〜と考えられる」= người ta cho rằng〜（từ bằng chứng/văn cảnh mà suy đoán）。確実ではないが、根拠のある推測。',
      },
      xpReward: 25,
    },
  },

  'n4-03-11': {
    courseTitle: { ja: 'N4 読解入門 〜短文から段落へ〜', vi: 'Đọc hiểu nhập môn N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4読解L11: 長文読解①〜業務連絡・申し送り書〜',
      titleTranslation: 'Đọc hiểu N4 Bài 11: Đọc văn dài ①〜Thông báo nghiệp vụ & Phiếu bàn giao〜',
      introduction: `実際の介護現場で使われる申し送り書・業務連絡文を素材に、長文読解の練習をします。複数の情報が含まれる文章から、設問に必要な情報だけを素早く見つけるスキルを磨きましょう。

Luyện đọc văn dài với chất liệu là phiếu bàn giao và thông báo nghiệp vụ thực tế tại môi trường điều dưỡng. Hãy rèn kỹ năng nhanh chóng tìm thông tin cần thiết từ văn bản chứa nhiều thông tin.`,
      keyPoints: [
        '申し送り書の構成：日付・利用者名・状態・対応・次のアクション',
        '優先順位：緊急・至急マークのついた項目を先に読む',
        '複数情報の整理：誰が・何を・いつ・どうする',
        'スキャニング：設問のキーワードを本文で探す技術',
        '長文の読み方：全部読まず、設問→本文の順で',
        '確認事項：「要確認」「次回」「担当者へ」などのアクション項目',
      ],
      vocabulary: [
        { word: '申し送り書', reading: 'もうしおくりしょ', meaning: '引き継ぎ書類（phiếu bàn giao）', example: '申し送り書に記録する' },
        { word: 'スキャニング', reading: 'すきゃにんぐ', meaning: '必要情報を素早く探す読み方（quét tìm thông tin）', example: 'キーワードでスキャニング' },
        { word: '優先順位', reading: 'ゆうせんじゅんい', meaning: '重要度の順番（thứ tự ưu tiên）', example: '優先順位をつける' },
        { word: '経過観察', reading: 'けいかかんさつ', meaning: '状態を継続して見ること（theo dõi diễn biến）', example: '引き続き経過観察' },
        { word: '急変', reading: 'きゅうへん', meaning: '突然の体調悪化（thay đổi đột ngột）', example: '急変時は即報告' },
      ],
      examples: [
        { japanese: `【申し送り書 5月15日　日勤→夜勤】
①田中様（301号室）体温37.8℃。14:30看護師報告済。水分摂取少なめ。→夜勤：経過観察・水分促し。
②山本様（305号室）転倒なし、通常通り。服薬確認済。
③※至急：木村様（308号室）家族より面会希望。明日13:00。担当：夜勤リーダー確認要。`, reading: `【もうしおくりしょ 5がつ15にち　にっきん→やきん】
①たなかさま（301ごうしつ）たいおん37.8℃。14:30かんごしほうこくすみ。すいぶんせっしゅすくなめ。→やきん：けいかかんさつ・すいぶんうながし。
②やまもとさま（305ごうしつ）てんとうなし、つうじょうどおり。ふくやくかくにんすみ。
③※しきゅう：きむらさま（308ごうしつ）かぞくよりめんかいきぼう。あした13:00。たんとう：やきんりーだーかくにんよう。`, translation: `【Phiếu bàn giao 15/5 Ca ngày→Ca đêm】
①Bác Tanaka (phòng 301): Nhiệt độ 37.8℃. Đã báo y tá 14:30. Uống nước ít. →Ca đêm: Theo dõi, nhắc uống nước.
②Bác Yamamoto (phòng 305): Không té ngã, bình thường. Đã xác nhận uống thuốc.
③※Khẩn: Bác Kimura (phòng 308): Gia đình muốn thăm. Ngày mai 13:00. Trưởng ca đêm cần xác nhận.` },
      ],
      grammarNote: `【申し送り書の読み方手順】
①まず※印・至急の項目を確認（最優先）
②次に各利用者の状態を確認
③「→」以降のアクション項目を確認
④担当者名・時刻を確認

【設問の解き方】
「誰が〜？」→ 利用者名を探す
「何時に〜？」→ 時刻を探す
「何をする？」→ 「→」以降を探す
「誰が対応？」→ 「担当：」を探す`,
      quiz: {
        question: '申し送り書に「※至急」と書いてある項目は？',
        options: [
          { id: 'a', text: '最後に読めばよい' },
          { id: 'b', text: '読まなくてよい' },
          { id: 'c', text: '最初に確認すべき最優先事項' },
          { id: 'd', text: 'ついでに確認する' },
        ],
        correctId: 'c',
        explanation: '「至急（しきゅう）」= khẩn cấp。申し送り書では最優先で確認・対応が必要な項目。',
      },
      xpReward: 25,
    },
  },

  'n4-03-12': {
    courseTitle: { ja: 'N4 読解入門 〜短文から段落へ〜', vi: 'Đọc hiểu nhập môn N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4読解L12: 長文読解②〜ケアプランを読む〜',
      titleTranslation: 'Đọc hiểu N4 Bài 12: Đọc văn dài ②〜Đọc kế hoạch chăm sóc〜',
      introduction: `ケアプランは利用者一人ひとりの支援計画書です。目標・サービス内容・担当者・期間が記されており、介護職員はこれを理解した上で業務を行います。実際のケアプランを素材に読解練習をしましょう。

Kế hoạch chăm sóc là tài liệu kế hoạch hỗ trợ cho từng người dùng. Ghi rõ mục tiêu, nội dung dịch vụ, người phụ trách, thời hạn và nhân viên điều dưỡng thực hiện công việc dựa trên sự hiểu biết về tài liệu này.`,
      keyPoints: [
        'ケアプランの構成：①利用者情報 ②目標 ③サービス内容 ④担当者 ⑤期間',
        '長期目標・短期目標：長期=3〜6ヶ月、短期=1〜3ヶ月',
        '読み取りポイント：誰の・何の目標か・いつまでに',
        'サービス種別：訪問介護・通所介護・福祉用具・居宅介護支援',
        '担当者：ケアマネ・担当ヘルパー・各事業所名',
        '更新・見直し：定期的な評価と目標の修正',
      ],
      vocabulary: [
        { word: 'ケアプラン', reading: 'けあぷらん', meaning: '介護サービス計画書（kế hoạch chăm sóc）', example: 'ケアプランに基づき支援する' },
        { word: '長期目標', reading: 'ちょうきもくひょう', meaning: '数ヶ月後の目標（mục tiêu dài hạn）', example: '長期目標：自立歩行' },
        { word: '短期目標', reading: 'たんきもくひょう', meaning: '1〜3ヶ月の目標（mục tiêu ngắn hạn）', example: '短期目標：手すりで歩く' },
        { word: 'ケアマネ', reading: 'けあまね', meaning: 'ケアマネージャー（quản lý chăm sóc）', example: 'ケアマネに相談する' },
        { word: '見直し', reading: 'みなおし', meaning: '再確認・改定（xem xét lại）', example: '3ヶ月ごとに見直す' },
      ],
      examples: [
        { japanese: `【ケアプラン抜粋】
利用者名：田中太郎　担当CM：山田花子
長期目標（6ヶ月）：家族と自宅で安心して生活できる
短期目標（3ヶ月）：手すりを使って廊下を一人で歩ける
サービス：訪問介護（週3回・入浴・食事）、福祉用具（手すりレンタル）
次回見直し：8月15日`, reading: `【けあぷらんばっすい】
りようしゃめい：たなかたろう　たんとうCM：やまだはなこ
ちょうきもくひょう（6かげつ）：かぞくとじたくであんしんしてせいかつできる
たんきもくひょう（3かげつ）：てすりをつかってろうかをひとりであるける
さーびす：ほうもんかいご（しゅう3かい・にゅうよく・しょくじ）、ふくしようぐ（てすりれんたる）
じかいみなおし：8がつ15にち`, translation: `【Trích kế hoạch chăm sóc】
Tên người dùng: Taro Tanaka　CM phụ trách: Hanako Yamada
Mục tiêu dài hạn (6 tháng): Sống an tâm tại nhà với gia đình
Mục tiêu ngắn hạn (3 tháng): Đi một mình dọc hành lang bằng tay vịn
Dịch vụ: Điều dưỡng tại nhà (3 lần/tuần・tắm・ăn), Dụng cụ phúc lợi (thuê tay vịn)
Xem xét lại lần tiếp: 15/8` },
      ],
      grammarNote: `【ケアプランの読解設問パターン】
「〜さんの担当CMは誰ですか？」→ 担当CM欄
「長期目標は何ですか？」→ 長期目標欄
「いつまでの目標ですか？」→ 期間を確認
「どんなサービスを利用していますか？」→ サービス欄
「次回見直しはいつですか？」→ 見直し日

【介護用語】
CM = ケアマネージャー（care manager）
訪問介護（ほうもんかいご）= điều dưỡng tại nhà
通所介護（つうしょかいご）= điều dưỡng ban ngày（trung tâm）
福祉用具（ふくしようぐ）= dụng cụ phúc lợi`,
      quiz: {
        question: 'ケアプランの「短期目標（3ヶ月）」とは何ですか？',
        options: [
          { id: 'a', text: '10年後の目標' },
          { id: 'b', text: '1〜3ヶ月程度で達成を目指す目標' },
          { id: 'c', text: '毎日の目標' },
          { id: 'd', text: '変えてはいけない目標' },
        ],
        correctId: 'b',
        explanation: '「短期目標」= mục tiêu ngắn hạn（1〜3ヶ月）。「長期目標」= mục tiêu dài hạn（3〜6ヶ月）。定期的に見直す。',
      },
      xpReward: 25,
    },
  },

  'n4-03-13': {
    courseTitle: { ja: 'N4 読解入門 〜短文から段落へ〜', vi: 'Đọc hiểu nhập môn N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4読解L13: 長文読解③〜研修案内・会議議事録〜',
      titleTranslation: 'Đọc hiểu N4 Bài 13: Đọc văn dài ③〜Thông báo đào tạo & Biên bản họp〜',
      introduction: `研修案内や会議の議事録は職場でよく読む書類です。「いつ・どこで・誰が・何を・何のために」という情報を正確に読み取り、自分が何をすべきかを理解するための読解練習をします。

Thông báo đào tạo và biên bản họp là tài liệu thường đọc tại nơi làm việc. Luyện đọc hiểu để đọc chính xác thông tin "khi nào - ở đâu - ai - cái gì - để làm gì" và hiểu mình cần phải làm gì.`,
      keyPoints: [
        '研修案内の構成：日時・場所・対象者・内容・持ち物・申し込み期限',
        '議事録の構成：日時・出席者・議題・決定事項・次回予定',
        '「決定事項」と「検討事項」の違い：決定＝実施確定、検討＝まだ議論中',
        '対象者の確認：「全員」vs「〜のみ」vs「〜を除く」',
        '行動が必要な項目：「〜すること」「〜までに提出」を探す',
        '設問パターン：「この研修の対象は？」「何を持っていく？」',
      ],
      vocabulary: [
        { word: '議事録', reading: 'ぎじろく', meaning: '会議の記録（biên bản họp）', example: '議事録を作成する' },
        { word: '決定事項', reading: 'けっていじこう', meaning: '決まったこと（điều đã quyết định）', example: '本日の決定事項' },
        { word: '検討事項', reading: 'けんとうじこう', meaning: 'まだ議論中のこと（điều đang xem xét）', example: '次回も検討事項に' },
        { word: '対象者', reading: 'たいしょうしゃ', meaning: '参加・対象となる人（đối tượng）', example: '対象者：全スタッフ' },
        { word: '持ち物', reading: 'もちもの', meaning: '持っていくもの（đồ cần mang）', example: '持ち物：筆記用具・テキスト' },
      ],
      examples: [
        { japanese: `【感染予防研修のご案内】
日時：6月20日（金）14:00〜16:00
場所：3階研修室
対象：全介護スタッフ（夜勤者は翌日参加可）
内容：手洗い実習・標準予防策の確認
持ち物：エプロン・手袋
申し込み：6月15日（日）までに主任へ`, reading: `【かんせんよぼうけんしゅうのごあんない】
にちじ：6がつ20にち（きん）14:00〜16:00
ばしょ：3かいけんしゅうしつ
たいしょう：ぜんかいごすたっふ（やきんしゃはよくじつさんかか）
ないよう：てあらいじっしゅう・ひょうじゅんよぼうさくのかくにん
もちもの：えぷろん・てぶくろ
もうしこみ：6がつ15にち（にち）までにしゅにんへ`, translation: `【Thông báo đào tạo phòng chống nhiễm khuẩn】
Ngày giờ: 20/6 (Thứ Sáu) 14:00〜16:00
Địa điểm: Phòng đào tạo tầng 3
Đối tượng: Toàn bộ nhân viên điều dưỡng (nhân viên trực đêm tham gia hôm sau)
Nội dung: Thực hành rửa tay, xác nhận biện pháp phòng ngừa chuẩn
Đồ mang theo: Tạp dề, găng tay
Đăng ký: Đến ngày 15/6 (Chủ Nhật) báo trưởng nhóm` },
      ],
      grammarNote: `【研修案内の読み取りポイント】
必ず確認すること：
①日時（いつ・何時〜何時）
②場所（どこ）
③対象者（誰が参加）
④持ち物（何を持っていく）
⑤申し込み期限・方法（いつまでに・誰に）

【議事録の読み方】
「決定事項」= 実施確定 → すぐアクション
「検討事項」= 議論中 → 次回に持ち越し
「次回予定」= 次の会議の日時`,
      quiz: {
        question: '研修案内に「夜勤者は翌日参加可」とあります。夜勤者はどうすればいいですか？',
        options: [
          { id: 'a', text: '参加しなくてよい' },
          { id: 'b', text: '指定日に必ず参加する' },
          { id: 'c', text: '翌日の同じ研修に参加できる' },
          { id: 'd', text: '主任に確認が必要' },
        ],
        correctId: 'c',
        explanation: '「翌日参加可（よくじつさんかか）」= 翌日に参加してもよい。「可（か）」= được phép。つまり選択肢がある。',
      },
      xpReward: 25,
    },
  },

  'n4-03-14': {
    courseTitle: { ja: 'N4 読解入門 〜短文から段落へ〜', vi: 'Đọc hiểu nhập môn N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4読解L14: 長文読解④〜同意書・説明文を読む〜',
      titleTranslation: 'Đọc hiểu N4 Bài 14: Đọc văn dài ④〜Đọc đơn đồng ý và văn giải thích〜',
      introduction: `入居時や手術前の「同意書」「説明書」は法的効力を持つ重要書類です。「何に同意しているか」「どんなリスクが説明されているか」を正確に読む力が求められます。

"Đơn đồng ý" và "tài liệu giải thích" khi nhập viện hoặc trước phẫu thuật là tài liệu quan trọng có hiệu lực pháp lý. Cần có năng lực đọc chính xác "đồng ý với điều gì" và "rủi ro nào được giải thích".`,
      keyPoints: [
        '同意書の構成：説明内容・リスク・同意事項・署名欄',
        '「同意します」の意味：すべての説明を理解した上で同意する',
        'リスク表現：「〜の可能性がある」「〜が生じることがある」',
        '同意の撤回：「いつでも同意を取り消すことができる」',
        '署名の重要性：本人・家族の署名で法的効力が発生',
        '読解設問：「この同意書は何について？」「どんなリスクが書かれている？」',
      ],
      vocabulary: [
        { word: '同意書', reading: 'どういしょ', meaning: '同意を示す書類（đơn đồng ý）', example: '手術の同意書にサインする' },
        { word: '説明書', reading: 'せつめいしょ', meaning: '内容を説明する書類（tài liệu giải thích）', example: '薬の説明書を読む' },
        { word: 'リスク', reading: 'りすく', meaning: '危険性（rủi ro）', example: 'リスクを説明する' },
        { word: '撤回', reading: 'てっかい', meaning: '取り消すこと（rút lại）', example: '同意を撤回できる' },
        { word: '署名', reading: 'しょめい', meaning: '本人が名前を書くこと（ký tên）', example: '本人が署名する' },
      ],
      examples: [
        { japanese: `【入浴サービス同意書】
私は以下の説明を受け、十分に理解した上で入浴サービスの提供に同意します。
・体調によりサービスを中止する場合があります
・入浴中の転倒・体調変化のリスクについて説明を受けました
・同意はいつでも撤回できることを確認しました
利用者氏名：＿＿＿＿　署名：＿＿＿＿`, reading: `【にゅうよくさーびすどういしょ】
わたしはいかのせつめいをうけ、じゅうぶんにりかいしたうえでにゅうよくさーびすのていきょうにどういします。
・たいちょうによりさーびすをちゅうしするばあいがあります
・にゅうよくちゅうのてんとう・たいちょうへんかのりすくについてせつめいをうけました
・どういはいつでもてっかいできることをかくにんしました
りようしゃしめい：＿＿＿＿　しょめい：＿＿＿＿`, translation: `【Đơn đồng ý dịch vụ tắm】
Tôi đã nhận được giải thích dưới đây, hiểu đầy đủ và đồng ý với việc cung cấp dịch vụ tắm.
・Có thể ngừng dịch vụ tùy theo tình trạng sức khỏe
・Đã nhận giải thích về rủi ro té ngã và thay đổi sức khỏe trong khi tắm
・Đã xác nhận có thể rút lại đồng ý bất cứ lúc nào
Tên người dùng:___　Chữ ký:___` },
      ],
      grammarNote: `【同意書の重要表現】
「〜の可能性がある」= có khả năng〜
「〜が生じることがある」= có thể xảy ra〜
「十分に理解した上で」= sau khi hiểu đầy đủ
「いつでも撤回できる」= có thể rút lại bất cứ lúc nào

【読解のポイント】
①「何のサービス」への同意か
②「どんなリスク」が記載されているか
③「撤回できるか」どうか
④「誰が署名する」か（本人・家族など）`,
      quiz: {
        question: '同意書の「同意はいつでも撤回できます」とはどういう意味ですか？',
        options: [
          { id: 'a', text: '一度サインしたら変更できない' },
          { id: 'b', text: 'サービス開始後でも同意を取り消せる' },
          { id: 'c', text: '毎回サインが必要' },
          { id: 'd', text: '家族のみ撤回できる' },
        ],
        correctId: 'b',
        explanation: '「撤回（てっかい）」= rút lại。「いつでも撤回できる」= có thể rút lại đồng ý bất cứ lúc nào, kể cả sau khi đã ký.',
      },
      xpReward: 25,
    },
  },

  'n4-03-15': {
    courseTitle: { ja: 'N4 読解入門 〜短文から段落へ〜', vi: 'Đọc hiểu nhập môn N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4読解L15: 長文読解⑤〜新聞・記事の短文〜',
      titleTranslation: 'Đọc hiểu N4 Bài 15: Đọc văn dài ⑤〜Bài báo ngắn〜',
      introduction: `N4では新聞記事・インターネット記事などの短い記事を読む問題も出題されます。客観的事実と筆者の意見を区別しながら読む練習をしましょう。介護・福祉・社会問題に関する記事を題材にします。

N4 cũng có câu hỏi đọc bài báo ngắn như bài báo giấy, bài báo mạng. Hãy luyện đọc với khả năng phân biệt sự thật khách quan và ý kiến tác giả. Dùng các bài báo liên quan đến điều dưỡng, phúc lợi xã hội làm chất liệu.`,
      keyPoints: [
        '事実と意見の区別：「〜だ・〜である」（事実）vs「〜と思う・〜だろう」（意見）',
        '見出し（タイトル）を先に読む：内容を予測して読む',
        '数字・データの読み取り：パーセント・人数・金額',
        'N4頻出テーマ：高齢化・介護不足・多文化共生・外国人労働者',
        'スキミング：記事全体の大意を素早く掴む',
        '設問パターン：「この記事の内容と合うものは？」',
      ],
      vocabulary: [
        { word: '高齢化', reading: 'こうれいか', meaning: '高齢者が増えること（già hóa dân số）', example: '日本の高齢化が進む' },
        { word: '介護不足', reading: 'かいごぶそく', meaning: '介護職員が足りない（thiếu nhân lực điều dưỡng）', example: '深刻な介護不足' },
        { word: '外国人労働者', reading: 'がいこくじんろうどうしゃ', meaning: '外国から来た労働者（lao động nước ngoài）', example: '外国人労働者が増加中' },
        { word: '人手不足', reading: 'ひとでぶそく', meaning: '労働力が足りない（thiếu nhân lực）', example: '介護業界の人手不足' },
        { word: '割合', reading: 'わりあい', meaning: 'パーセンテージ・比率（tỷ lệ）', example: '65歳以上の割合が30%' },
      ],
      examples: [
        { japanese: '日本の65歳以上の人口は約3,600万人（2023年）で、全体の約29%を占める。介護職員の不足は深刻で、2025年までに約38万人が不足すると言われている。', reading: 'にほんの65さいいじょうのじんこうはやく3600まんにん（2023ねん）で、ぜんたいのやく29%をしめる。かいごしょくいんのふそくはしんこくで、2025ねんまでにやく38まんにんがふそくするといわれている。', translation: 'Dân số từ 65 tuổi trở lên của Nhật Bản khoảng 36 triệu người (2023), chiếm khoảng 29% tổng dân số. Tình trạng thiếu nhân viên điều dưỡng rất nghiêm trọng, được cho là đến năm 2025 sẽ thiếu khoảng 380.000 người.' },
        { japanese: 'ベトナムをはじめとする外国人介護士の受け入れが拡大しており、現場での多文化共生が新たな課題となっている。', reading: 'べとなむをはじめとするがいこくじんかいごしのうけいれがかくだいしており、げんばでのたぶんかきょうせいがあらたなかだいとなっている。', translation: 'Việc tiếp nhận nhân viên điều dưỡng nước ngoài, dẫn đầu là Việt Nam, đang mở rộng, và cùng chung sống đa văn hóa tại hiện trường đang trở thành thách thức mới.' },
      ],
      grammarNote: `【記事・論説文の読み方】
事実（客観）：「〜だ」「〜である」「〜によると」
意見（主観）：「〜と思う」「〜だろう」「〜すべきだ」

【数字の読み取り】
約（やく）= khoảng / 〜を超える = vượt〜
〜割（わり）= 〜/10 = 10%刻み
〜パーセント = 〜%
〜倍（ばい）= gấp〜 lần

【スキミングのコツ】
①見出し（タイトル）を読む
②各段落の最初の文を読む
③数字・固有名詞に注目
④設問を先に見てから本文を読む`,
      quiz: {
        question: '「約29%を占める」の「約」の意味は？',
        options: [
          { id: 'a', text: 'ちょうど・正確に' },
          { id: 'b', text: 'おおよそ・だいたい' },
          { id: 'c', text: '最大で' },
          { id: 'd', text: '最低でも' },
        ],
        correctId: 'b',
        explanation: '「約（やく）」= khoảng / xấp xỉ = おおよそ・だいたい。「約29%」= khoảng 29%（正確ではなく概数）。',
      },
      xpReward: 25,
    },
  },

  'n4-03-16': {
    courseTitle: { ja: 'N4 読解入門 〜短文から段落へ〜', vi: 'Đọc hiểu nhập môn N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4読解L16: 対比・比較の文章を読む',
      titleTranslation: 'Đọc hiểu N4 Bài 16: Đọc văn đối chiếu và so sánh',
      introduction: `「AとBを比べると」「AはBより〜」「一方Bは〜」という対比・比較の文章は、介護方針の説明・サービスの違い・国ごとの制度比較など、多くの文書で使われます。比較の軸と結論を正確に読み取る練習をしましょう。

Văn bản so sánh đối chiếu như "Khi so sánh A và B", "A hơn B〜", "Mặt khác B〜" được dùng trong nhiều tài liệu như giải thích phương hướng điều dưỡng, sự khác biệt về dịch vụ, so sánh chế độ giữa các quốc gia.`,
      keyPoints: [
        '比較の軸：何と何を・何の点で比べているか',
        '優劣：〜より〜のほうが〜・〜に比べて〜・〜は〜ほど〜ない',
        '対比：一方・それに対して・反対に・〜は〜だが、〜は〜だ',
        '共通点：両方〜・どちらも〜・同じく〜',
        '設問パターン：「AとBの違いは？」「どちらのほうが〜？」',
        '注意：比較の対象・基準を明確にする',
      ],
      vocabulary: [
        { word: '一方', reading: 'いっぽう', meaning: '片方・他方（mặt khác）', example: 'A施設は〜。一方、B施設は〜。' },
        { word: '比較', reading: 'ひかく', meaning: '二つを比べること（so sánh）', example: '二つのサービスを比較する' },
        { word: '共通点', reading: 'きょうつうてん', meaning: '同じところ（điểm chung）', example: '両者の共通点は〜' },
        { word: '相違点', reading: 'そういてん', meaning: '違うところ（điểm khác biệt）', example: '制度の相違点を確認する' },
        { word: '優れる', reading: 'すぐれる', meaning: '他より良い（vượt trội）', example: '〜の点で優れている' },
      ],
      examples: [
        { japanese: '訪問介護と通所介護を比較すると、訪問介護は自宅でサービスを受けるため、利用者の生活リズムを崩しにくい。一方、通所介護は他の利用者との交流が生まれるという利点がある。', reading: 'ほうもんかいごとつうしょかいごをひかくすると、ほうもんかいごはじたくでさーびすをうけるため、りようしゃのせいかつりずむをくずしにくい。いっぽう、つうしょかいごはほかのりようしゃとのこうりゅうがうまれるというりてんがある。', translation: 'Khi so sánh điều dưỡng tại nhà và điều dưỡng ban ngày, điều dưỡng tại nhà vì nhận dịch vụ tại nhà nên ít làm xáo trộn nhịp sinh hoạt của người dùng. Mặt khác, điều dưỡng ban ngày có ưu điểm là tạo ra sự giao lưu với người dùng khác.' },
        { japanese: '日本とベトナムでは高齢化のスピードが異なる。日本はすでに超高齢社会だが、ベトナムは今後急速に高齢化が進むと予測されている。', reading: 'にほんとべとなむではこうれいかのすぴーどがことなる。にほんはすでにちょうこうれいしゃかいだが、べとなむはこんごきゅうそくにこうれいかがすすむとよそくされている。', translation: 'Nhật Bản và Việt Nam có tốc độ già hóa khác nhau. Nhật Bản đã là xã hội siêu già hóa, nhưng Việt Nam được dự đoán sẽ già hóa nhanh chóng trong tương lai.' },
      ],
      grammarNote: `【比較・対比の表現まとめ】

比較（so sánh）：
  AはBより〜（A hơn B〜）
  Aのほうが〜（A ... hơn）
  AはBほど〜ない（A không〜 bằng B）

対比（đối chiếu）：
  一方（mặt khác）
  それに対して（đối lại điều đó）
  〜は〜だが、〜は〜だ

共通（điểm chung）：
  AもBも〜（cả A lẫn B〜）
  両方〜（cả hai〜）
  同じく〜（tương tự〜）`,
      quiz: {
        question: '「訪問介護より通所介護のほうが交流の機会が多い」とあります。交流が多いのはどちらですか？',
        options: [
          { id: 'a', text: '訪問介護' },
          { id: 'b', text: '通所介護' },
          { id: 'c', text: '両方同じ' },
          { id: 'd', text: 'どちらも少ない' },
        ],
        correctId: 'b',
        explanation: '「AよりBのほうが〜」= B ... hơn A〜。「通所介護のほうが交流が多い」→ 通所介護のほうが多い。',
      },
      xpReward: 25,
    },
  },

  'n4-03-17': {
    courseTitle: { ja: 'N4 読解入門 〜短文から段落へ〜', vi: 'Đọc hiểu nhập môn N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4読解L17: 速読トレーニング〜時間内に要点を掴む〜',
      titleTranslation: 'Đọc hiểu N4 Bài 17: Luyện đọc nhanh〜Nắm điểm chính trong thời gian giới hạn〜',
      introduction: `N4の読解試験は時間との戦いです。全部の文字を読まず、必要な情報だけを素早く見つける「スキャニング」と「スキミング」のテクニックを習得しましょう。実際の試験形式で練習します。

Bài thi đọc hiểu N4 là cuộc chiến với thời gian. Hãy học kỹ thuật "quét tìm" và "lướt đọc" để nhanh chóng tìm thông tin cần thiết mà không cần đọc hết tất cả chữ. Luyện tập theo hình thức thi thực tế.`,
      keyPoints: [
        'スキャニング：設問のキーワードを本文で探す（特定情報を探す）',
        'スキミング：各段落の最初の文だけ読んで大意を掴む',
        '時間配分：1問あたり約3分を目安に',
        '読む順序：①設問を読む →②本文を読む → ③答えを選ぶ',
        '消去法：明らかに違う選択肢を消して残りから選ぶ',
        '本文に戻る：記憶だけで答えず、必ず本文を確認する',
      ],
      vocabulary: [
        { word: '速読', reading: 'そくどく', meaning: '速く読むこと（đọc nhanh）', example: '速読のコツを学ぶ' },
        { word: 'スキャニング', reading: 'すきゃにんぐ', meaning: '特定情報を素早く探す読み方（quét tìm）', example: 'スキャニングで名前を探す' },
        { word: 'スキミング', reading: 'すきみんぐ', meaning: '大意を素早く掴む読み方（lướt đọc）', example: 'スキミングで大意を掴む' },
        { word: '消去法', reading: 'しょうきょほう', meaning: '間違いを消していく方法（phương pháp loại trừ）', example: '消去法で答える' },
        { word: '根拠', reading: 'こんきょ', meaning: '答えの証拠（căn cứ）', example: '本文に根拠を探す' },
      ],
      examples: [
        { japanese: '【速読のステップ】①設問を先に読む（何を探すか把握）②タイトル・見出しを読む ③各段落の1文目を読む ④設問のキーワードを本文でスキャン ⑤答えの根拠を確認', reading: '【そくどくのすてっぷ】①せつもんをさきによむ（なにをさがすかはあく）②たいとる・みだしをよむ ③かくだんらくの1もんめをよむ ④せつもんのきーわーどをほんぶんでするっとさがす ⑤こたえのこんきょをかくにん', translation: '【Các bước đọc nhanh】①Đọc câu hỏi trước (nắm cần tìm gì) ②Đọc tiêu đề ③Đọc câu đầu mỗi đoạn ④Quét tìm từ khóa câu hỏi trong bài ⑤Xác nhận căn cứ câu trả lời' },
        { japanese: '設問に「田中さんはいつ退院しましたか？」とある場合、本文で「田中」「退院」「〜日」のキーワードをスキャニングで探す。', reading: 'せつもんに「たなかさんはいつたいいんしましたか？」とあるばあい、ほんぶんで「たなか」「たいいん」「〜にち」のきーわーどをすきゃにんぐでさがす。', translation: 'Khi câu hỏi là "Bác Tanaka xuất viện khi nào?", hãy dùng kỹ thuật quét tìm từ khóa "Tanaka", "xuất viện", "ngày〜" trong bài.' },
      ],
      grammarNote: `【試験での時間配分（目安）】
短文問題（1問）：約2分
中文問題（1問）：約4分
長文問題（1問）：約6分

【よくある間違いパターン】
×本文を全部読んでから設問を読む
×本文を読まず記憶で答える
×最初の選択肢を確認せずに選ぶ
×「書いていないこと」を答えにする

【正しいアプローチ】
①設問→②本文→③根拠確認→④答え選択`,
      quiz: {
        question: 'N4読解の設問に答えるとき、最初にすべきことは何ですか？',
        options: [
          { id: 'a', text: 'まず本文を全部読む' },
          { id: 'b', text: 'まず設問（問題）を読む' },
          { id: 'c', text: '選択肢だけ読む' },
          { id: 'd', text: 'タイトルだけ読む' },
        ],
        correctId: 'b',
        explanation: '設問を先に読むことで「何を探すか」が明確になり、スキャニングの効率が上がる。これが速読の基本。\nĐọc câu hỏi trước để biết cần tìm gì, tăng hiệu quả quét tìm thông tin.',
      },
      xpReward: 25,
    },
  },

  'n4-03-18': {
    courseTitle: { ja: 'N4 読解入門 〜短文から段落へ〜', vi: 'Đọc hiểu nhập môn N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4読解L18: 総復習テスト',
      titleTranslation: 'Đọc hiểu N4 Bài 18: Kiểm tra tổng hợp',
      introduction: `N4読解コースの総まとめです。お知らせ・メモ・スケジュール・指示書・接続詞・因果関係・グラフ・長文まで、全17レッスンの内容を総復習します。実際のN4試験に近い形式で5問に挑戦しましょう！

Đây là tổng kết của khóa học đọc hiểu N4. Ôn tập tổng hợp nội dung 17 bài học từ thông báo, ghi chú, lịch làm việc, hướng dẫn, liên từ, quan hệ nhân quả, biểu đồ đến văn dài. Hãy thử sức với 5 câu hỏi theo hình thức gần với kỳ thi N4 thực tế!`,
      keyPoints: [
        '【L2-3】メモ・シフト表：5W1H・記号・勤務区分を素早く読む',
        '【L4-5】指示書・接続詞：番号手順・逆接/順接の判断',
        '【L6-7】否定/条件・因果関係：「〜以外」「〜ため」の正確な読み',
        '【L8-9】主題・グラフ：「要するに・つまり」・増減語彙',
        '【L10-14】長文読解：申し送り・ケアプラン・研修・同意書',
        '【L15-17】記事・比較・速読：設問先読み・スキャニング活用',
      ],
      vocabulary: [
        { word: '総復習', reading: 'そうふくしゅう', meaning: '全部まとめて復習（ôn tập tổng hợp）', example: '全レッスンの総復習' },
        { word: 'スキャニング', reading: 'すきゃにんぐ', meaning: 'キーワードを探す速読法（quét tìm）', example: '設問のキーワードをスキャニング' },
        { word: '根拠', reading: 'こんきょ', meaning: '答えの証拠（căn cứ）', example: '本文に根拠を探す' },
        { word: '消去法', reading: 'しょうきょほう', meaning: 'ちがう選択肢を消す方法（loại trừ）', example: '消去法で正解を選ぶ' },
        { word: '確認事項', reading: 'かくにんじこう', meaning: '確認が必要な項目（điều cần xác nhận）', example: '申し送りの確認事項' },
      ],
      examples: [
        { japanese: '速読のポイント：①設問を先に読む ②キーワードをスキャニング ③本文に根拠を確認 ④消去法で絞る', reading: 'そくどくのぽいんと：①せつもんをさきによむ ②きーわーどをすきゃにんぐ ③ほんぶんにこんきょをかくにん ④しょうきょほうでしぼる', translation: 'Điểm chính đọc nhanh: ①Đọc câu hỏi trước ②Quét tìm từ khóa ③Xác nhận căn cứ trong bài ④Thu hẹp bằng loại trừ' },
        { japanese: '接続詞まとめ：しかし（逆接）・そのため（順接）・また（添加）・ただし（補足）・つまり（言い換え）', reading: 'せつぞくしまとめ：しかし（ぎゃくせつ）・そのため（じゅんせつ）・また（てんか）・ただし（ほそく）・つまり（いいかえ）', translation: 'Tổng hợp liên từ: しかし (nghịch)・そのため (thuận)・また (thêm)・ただし (chú thích)・つまり (nói lại)' },
      ],
      grammarNote: `【N4読解 全レッスンまとめ】
L1：お知らせ・案内文（thông báo）
L2：メモ・伝言（ghi chú）
L3：シフト表（bảng ca）
L4：指示書・マニュアル（hướng dẫn）
L5：接続詞（liên từ）
L6：否定・条件表現（phủ định/điều kiện）
L7：因果関係（nhân quả）
L8：主題・要点（chủ đề）
L9：グラフ・図表（biểu đồ）
L10：筆者の意図（ý định tác giả）
L11-14：長文読解（văn dài）
L15：新聞記事（báo）
L16：対比・比較（so sánh）
L17：速読テクニック（đọc nhanh）`,
      quizzes: [
        {
          question: '「体重が横ばいです」の意味は？',
          options: [
            { id: 'a', text: '体重が増えている' },
            { id: 'b', text: '体重がほとんど変化していない' },
            { id: 'c', text: '体重が減っている' },
            { id: 'd', text: '体重が大きく変動している' },
          ],
          correctId: 'b',
          explanation: '横ばい = đường nằm ngang = ổn định、ほとんど変化なし。',
          difficulty: 'easy' as const,
        },
        {
          question: '申し送りに「至急」とある場合、どうすべきか？',
          options: [
            { id: 'a', text: '後で確認する' },
            { id: 'b', text: '無視する' },
            { id: 'c', text: '最優先で確認・対応する' },
            { id: 'd', text: '家族に連絡する' },
          ],
          correctId: 'c',
          explanation: '「至急（しきゅう）」= khẩn cấp。最優先で確認・対応が必要。',
          difficulty: 'easy' as const,
        },
        {
          question: '「体温が上昇したため、入浴を中止した」の原因は何ですか？',
          options: [
            { id: 'a', text: '入浴を中止したこと' },
            { id: 'b', text: '体温が上昇したこと' },
            { id: 'c', text: '水分補給が少なかったこと' },
            { id: 'd', text: '転倒したこと' },
          ],
          correctId: 'b',
          explanation: '「〜ため」の前が原因。体温上昇→原因→入浴中止→結果。',
          difficulty: 'medium' as const,
        },
        {
          question: '「担当者以外は入室禁止」とあります。担当者はどうですか？',
          options: [
            { id: 'a', text: '担当者も禁止' },
            { id: 'b', text: '担当者は入室できる' },
            { id: 'c', text: '申請が必要' },
            { id: 'd', text: '主任の許可が必要' },
          ],
          correctId: 'b',
          explanation: '「〜以外は禁止」= 〜以外の人が禁止 → 担当者は入室できる。',
          difficulty: 'medium' as const,
        },
        {
          question: 'N4読解で設問に答えるとき、最初にすべきことは？',
          options: [
            { id: 'a', text: '本文を全部読む' },
            { id: 'b', text: '選択肢から選ぶ' },
            { id: 'c', text: '設問（問題）を先に読む' },
            { id: 'd', text: 'タイトルを読む' },
          ],
          correctId: 'c',
          explanation: '設問を先に読む→何を探すか明確になる→スキャニング効率UP。これが速読の基本。',
          difficulty: 'hard' as const,
        },
      ],
      xpReward: 50,
    },
  },

  // ===== N4 聴解 =====
  'n4-04': {
    courseTitle: { ja: 'N4 聴解トレーニング', vi: 'Luyện nghe N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4聴解: 職場の会話を聞き取る',
      titleTranslation: 'Nghe hiểu N4: Nghe hội thoại nơi làm việc',
      introduction: `N4の聴解では日常会話・職場の会話・短いアナウンスが出ます。介護現場では申し送り・業務連絡・上司の指示を正確に聞き取ることが大切です。音の省略形に慣れましょう。

Nghe hiểu N4 có hội thoại hàng ngày, hội thoại nơi làm việc, thông báo ngắn. Cần làm quen với các dạng rút gọn của âm trong tiếng Nhật thông thường.`,
      keyPoints: [
        '音の省略：「〜ています」→「〜てます」、「〜ておく」→「〜とく」',
        '数字の聞き分け：4（し/よん）、7（しち/なな）',
        '質問パターン：「何を頼まれましたか」「何時に？」「問題は？」',
        '相づち：「はい・そうですか・なるほど・分かりました」',
      ],
      vocabulary: [
        { word: 'なるほど', reading: 'なるほど', meaning: 'I see（ra vậy）', example: 'なるほど、分かりました' },
        { word: '〜とく', reading: 'とく', meaning: '〜ておく の省略（làm sẵn）', example: '準備しとくね' },
        { word: '〜てる', reading: 'てる', meaning: '〜ている の省略（đang...）', example: '今、確認してる' },
      ],
      examples: [
        { japanese: '「バイタル、もう測った？」「まだです。今から測ります。」', reading: '「ばいたる、もうはかった？」「まだです。いまからはかります。」', translation: '"Đo dấu hiệu sinh tồn chưa?" "Chưa. Bây giờ đi đo."' },
        { japanese: '「田中さん、今日の夕食、半分しか食べなかったよ」「分かった、記録しとく」', reading: '「たなかさん、きょうのゆうしょく、はんぶんしかたべなかったよ」「わかった、きろくしとく」', translation: '"Ông Tanaka chỉ ăn một nửa bữa tối" "Hiểu rồi, tôi ghi lại"' },
      ],
      grammarNote: `【省略形まとめ】
〜ています → 〜てます / 〜てる
〜ておく → 〜とく
〜てしまう → 〜ちゃう / 〜じゃう
〜なければならない → 〜なきゃ

【注意：数字の読み方】
介護現場では誤解防止のため「よん・なな」を推奨`,
      quiz: {
        question: '「準備しとくね」の正式な表現は？',
        options: [
          { id: 'a', text: '準備してしまうね' },
          { id: 'b', text: '準備しておくね' },
          { id: 'c', text: '準備していくね' },
          { id: 'd', text: '準備してきたね' },
        ],
        correctId: 'b',
        explanation: '「しとく」は「しておく（事前にやっておく）」の口語的な省略形です。\n「しとく」là dạng rút gọn của 「しておく」(làm sẵn, làm trước).',
      },
      xpReward: 25,
    },
  },

  'n4-04-2': {
    courseTitle: { ja: 'N4 聴解トレーニング', vi: 'Luyện nghe N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4聴解L2: 数字・時間・日付の聞き取り',
      titleTranslation: 'Luyện nghe N4 Bài 2: Nghe số, giờ và ngày tháng',
      introduction: `「4（し/よん）」「7（しち/なな）」の聞き分けミス、「1時（いちじ）」と「7時（しちじ）」の混同は介護現場で重大なミスにつながります。数字・時刻・日付の正確な聞き取りを徹底練習しましょう。

Nhầm lẫn "4 (shi/yon)" và "7 (shichi/nana)", nhầm "1 giờ" và "7 giờ" có thể dẫn đến sai sót nghiêm trọng tại hiện trường điều dưỡng. Hãy luyện tập nghe chính xác số, giờ và ngày tháng một cách kỹ lưỡng.`,
      keyPoints: [
        '危険な聞き間違い：1時（いちじ）vs 7時（しちじ）→ 必ず復唱確認',
        '4の読み方：し（数え方）/ よん（量・時間）→ 介護では「よん」を推奨',
        '7の読み方：しち / なな → 介護では「なな」を推奨（混同防止）',
        '日付の言い方：〜日（ついたち・ふつか・みっか…）→ 1日・2日・3日',
        '時刻の確認：「〜時〜分でよろしいですか？」と復唱する',
        '体温・血圧の数字：「36度5分（さぶろく・ご）」「120の80」',
      ],
      vocabulary: [
        { word: '復唱', reading: 'ふくしょう', meaning: '聞いた内容を繰り返して確認（nhắc lại để xác nhận）', example: '「14時ですね」と復唱する' },
        { word: '聞き間違い', reading: 'ききまちがい', meaning: '聞いて間違えること（nghe nhầm）', example: '聞き間違いに注意する' },
        { word: '確認する', reading: 'かくにんする', meaning: '正しいか確かめる（xác nhận）', example: '数字を確認する' },
        { word: '度（体温）', reading: 'ど', meaning: '温度の単位（độ）', example: '37度5分' },
        { word: 'mmHg（血圧）', reading: 'まりー', meaning: '血圧の単位（mmHg）', example: '120の80' },
      ],
      examples: [
        { japanese: '【スクリプト】A「田中さん、入浴は何時からですか？」B「14時から予約しています。」A「14時ですね、了解しました。」', reading: '【すくりぷと】A「たなかさん、にゅうよくはなんじからですか？」B「14じからよやくしています。」A「14じですね、りょうかいしました。」', translation: '【Kịch bản】A"Bác Tanaka, tắm từ mấy giờ?" B"Đặt lịch từ 14 giờ." A"14 giờ nhỉ, hiểu rồi."' },
        { japanese: '【スクリプト】「体温は37度2分、血圧は128の74です。」「37度2分、128の74ですね。記録します。」', reading: '【すくりぷと】「たいおんは37どにぶ、けつあつは128の74です。」「37どにぶ、128の74ですね。きろくします。」', translation: '【Kịch bản】"Nhiệt độ 37.2 độ, huyết áp 128/74." "37.2 độ, 128/74 nhỉ. Tôi ghi chép."' },
        { japanese: '【スクリプト】「次の服薬は7時です。」「7時（なな時）ですね、確認します。」※「しち」と「いち」の混同を防ぐため「なな」を使う。', reading: '【すくりぷと】「つぎのふくやくはなな時です。」「なな時ですね、かくにんします。」※「しち」と「いち」のこんどうをふせぐため「なな」をつかう。', translation: '【Kịch bản】"Lần uống thuốc tiếp theo là 7 giờ." "7 giờ nhỉ, xác nhận." ※Dùng "nana" để tránh nhầm với "ichi".' },
      ],
      grammarNote: `【数字の読み方リスト】
1：いち　2：に　3：さん　4：し/よん　5：ご
6：ろく　7：しち/なな　8：はち　9：く/きゅう　10：じゅう

【時刻の読み方】
1時：いちじ　4時：よじ　7時：しちじ→ 「ななじ」推奨
9時：くじ

【日付の特殊読み】
1日：ついたち　2日：ふつか　3日：みっか
4日：よっか　5日：いつか　6日：むいか
7日：なのか　8日：ようか　9日：ここのか
10日：とおか　14日：じゅうよっか　20日：はつか
24日：にじゅうよっか

【安全な復唱の習慣】
受けた数字・時刻は必ず復唱確認！`,
      quiz: {
        question: '介護現場で「7」を言うとき、なぜ「なな」が推奨されますか？',
        options: [
          { id: 'a', text: '「なな」のほうが言いやすいから' },
          { id: 'b', text: '「しち」が「いち（1）」と聞き間違えられやすいから' },
          { id: 'c', text: '「なな」がより丁寧だから' },
          { id: 'd', text: '「しち」は古い言い方だから' },
        ],
        correctId: 'b',
        explanation: '「しち（7）」と「いち（1）」は電話や騒がしい環境で聞き間違えやすい。介護では命に関わるので「なな」を使うことを推奨。\n"Shichi(7)" và "ichi(1)" dễ nghe nhầm trong môi trường ồn ào. Trong điều dưỡng nên dùng "nana" vì liên quan đến tính mạng.',
      },
      xpReward: 25,
    },
  },

  'n4-04-3': {
    courseTitle: { ja: 'N4 聴解トレーニング', vi: 'Luyện nghe N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4聴解L3: 指示・依頼を聞き取る',
      titleTranslation: 'Luyện nghe N4 Bài 3: Nghe hiểu chỉ thị và yêu cầu',
      introduction: `上司や先輩からの指示・依頼は正確に聞き取り、即座に理解することが介護現場では必須です。「〜してください」「〜お願いします」「〜してもらえますか」など、依頼の丁寧度と内容を正しく聞き取る練習をします。

Tại hiện trường điều dưỡng, việc nghe chính xác và hiểu ngay lập tức chỉ thị và yêu cầu từ cấp trên và tiền bối là bắt buộc. Luyện tập nghe đúng mức độ lịch sự và nội dung của các yêu cầu như "〜してください", "〜お願いします", "〜してもらえますか".`,
      keyPoints: [
        '指示の種類：「〜して」（直接）/「〜してください」（普通）/「〜していただけますか」（丁寧）',
        '優先順位：「まず〜、次に〜、最後に〜」の順番を正確に把握',
        '複数指示：「〜と〜と〜をお願いします」→ メモを取る習慣',
        '確認の返答：「はい、承知しました」「わかりました、すぐに参ります」',
        '不明な時：「もう一度おっしゃっていただけますか？」と聞き直す',
        '期限の確認：「いつまでに」「今すぐ」「〜時までに」を必ず確認',
      ],
      vocabulary: [
        { word: '承知しました', reading: 'しょうちしました', meaning: 'わかりました（丁寧）（đã hiểu - lịch sự）', example: '承知しました、すぐ参ります' },
        { word: '確認します', reading: 'かくにんします', meaning: 'チェックします（xác nhận）', example: 'もう一度確認します' },
        { word: 'メモを取る', reading: 'めもをとる', meaning: '書いておく（ghi chép）', example: '指示をメモを取る' },
        { word: 'すぐに', reading: 'すぐに', meaning: '今すぐ（ngay lập tức）', example: 'すぐに参ります' },
        { word: '〜までに', reading: 'までに', meaning: 'その時刻より前に（trước〜）', example: '15時までに提出' },
      ],
      examples: [
        { japanese: '【スクリプト】主任「グエンさん、今日の午後、まず301号室の田中さんのバイタルを測って、次に305号室の入浴介助をお願いします。14時までに記録も頼みます。」グエン「承知しました。301号室のバイタル、305号室の入浴、記録を14時までですね。」', reading: '【すくりぷと】しゅにん「ぐえんさん、きょうのごご、まず301ごうしつのたなかさんのばいたるをはかって、つぎに305ごうしつのにゅうよくかいじょをおねがいします。14じまでにきろくもたのみます。」ぐえん「しょうちしました。301ごうしつのばいたる、305ごうしつのにゅうよく、きろくを14じまでですね。」', translation: '【Kịch bản】Trưởng nhóm: "Nguyễn, chiều nay trước tiên đo dấu hiệu sinh tồn bác Tanaka phòng 301, tiếp theo hỗ trợ tắm phòng 305. Nhờ ghi chép trước 14 giờ." Nguyễn: "Vâng. Dấu hiệu sinh tồn phòng 301, tắm phòng 305, ghi chép trước 14 giờ đúng không ạ."' },
        { japanese: '【スクリプト】「山田さん、急いでいるので今すぐ302の鈴木さんのところへ行ってもらえますか。」「はい、すぐ参ります。302号室の鈴木様ですね。」', reading: '【すくりぷと】「やまださん、いそいでいるのでいますぐ302のすずきさんのところへいってもらえますか。」「はい、すぐまいります。302ごうしつのすずきさまですね。」', translation: '【Kịch bản】"Yamada, tôi đang gấp, bạn có thể đến phòng 302 gặp bác Suzuki ngay bây giờ không?" "Vâng, tôi đến ngay. Bác Suzuki phòng 302 đúng không?"' },
      ],
      grammarNote: `【指示を聞き取るコツ】

①「まず・次に・最後に」で順番を整理
  まず＝ đầu tiên　次に＝ tiếp theo　最後に＝ cuối cùng

②数字・固有名詞に集中
  部屋番号・名前・時刻・数量

③必ず復唱確認
  「〜と〜をすればいいですね」と確認

④不明は遠慮なく聞き直す
  「すみません、もう一度お願いできますか？」
  「〜の部分が聞き取れませんでした」

⑤メモを取る習慣
  指示が2つ以上のときは必ずメモ`,
      quiz: {
        question: '上司から複数の指示を受けたとき、最初にすべきことは？',
        options: [
          { id: 'a', text: 'すぐに仕事を始める' },
          { id: 'b', text: 'メモを取りながら聞き、最後に復唱確認する' },
          { id: 'c', text: '全部覚えてから確認する' },
          { id: 'd', text: '他の人に聞く' },
        ],
        correctId: 'b',
        explanation: '複数指示はメモを取りながら聞き、最後に「〜と〜でよろしいですか？」と復唱確認するのがベスト。\nNghe nhiều chỉ thị nên vừa ghi chép vừa nghe, cuối cùng nhắc lại để xác nhận.',
      },
      xpReward: 25,
    },
  },

  'n4-04-4': {
    courseTitle: { ja: 'N4 聴解トレーニング', vi: 'Luyện nghe N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4聴解L4: バイタル・状態変化の報告を聞く',
      titleTranslation: 'Luyện nghe N4 Bài 4: Nghe báo cáo dấu hiệu sinh tồn và thay đổi tình trạng',
      introduction: `介護現場で最も多い聴解場面のひとつが「バイタル報告」です。体温・血圧・脈拍・SpO2・体重などの数値と、状態変化の説明を正確に聞き取るための集中練習をします。

Một trong những tình huống nghe phổ biến nhất tại hiện trường điều dưỡng là "báo cáo dấu hiệu sinh tồn". Luyện tập tập trung nghe chính xác các con số như nhiệt độ, huyết áp, nhịp tim, SpO2, cân nặng và giải thích về thay đổi tình trạng.`,
      keyPoints: [
        '体温の言い方：「36度5分（ぶ）」「37度（ど）2分（ぶ）」',
        '血圧の言い方：「120の80（ひゃくにじゅうのはちじゅう）」',
        '脈拍：「1分間に72回（かい）」→「みゃくはく72です」',
        'SpO2：「サチュレーション95（パーセント）」',
        '状態変化：「いつもより〜」「昨日と比べて〜」「少し〜」',
        '緊急フラグ：「急に〜」「突然〜」「かなり〜」は即報告サイン',
      ],
      vocabulary: [
        { word: 'バイタル', reading: 'ばいたる', meaning: '生命兆候（dấu hiệu sinh tồn）', example: 'バイタルを測りました' },
        { word: '脈拍', reading: 'みゃくはく', meaning: '心臓の拍動数（nhịp tim）', example: '脈拍は78です' },
        { word: 'SpO2', reading: 'さちゅれーしょん', meaning: '血中酸素濃度（độ bão hòa oxy）', example: 'SpO2が93に下がりました' },
        { word: '急変', reading: 'きゅうへん', meaning: '状態が突然悪化（thay đổi đột ngột）', example: '急変の可能性があります' },
        { word: '平常時', reading: 'へいじょうじ', meaning: '普段の状態（bình thường）', example: '平常時と比べて高いです' },
      ],
      examples: [
        { japanese: '【スクリプト】「山田主任、田中様のバイタルをご報告します。体温37.8度、血圧145の92、脈拍88、SpO2は96です。体温が平常時より高めで、少し顔色も悪いです。」', reading: '【すくりぷと】「やまだしゅにん、たなかさまのばいたるをごほうこくします。たいおん37.8ど、けつあつ145の92、みゃくはく88、SpO2は96です。たいおんがへいじょうじよりたかめで、すこしかおいろもわるいです。」', translation: '【Kịch bản】"Trưởng nhóm Yamada, tôi báo cáo dấu hiệu sinh tồn của bác Tanaka. Nhiệt độ 37.8, huyết áp 145/92, nhịp tim 88, SpO2 96. Nhiệt độ cao hơn bình thường và sắc mặt hơi xấu."' },
        { japanese: '【スクリプト】「主任、山本さんが急に胸が苦しいと言っています。血圧も180の110です。至急来ていただけますか。」「わかった、すぐ行く。」', reading: '【すくりぷと】「しゅにん、やまもとさんがきゅうにむねがくるしいといっています。けつあつも180の110です。しきゅうきていただけますか。」「わかった、すぐいく。」', translation: '【Kịch bản】"Trưởng nhóm, bác Yamamoto đột nhiên nói tức ngực. Huyết áp cũng 180/110. Bạn có thể đến ngay không?" "Hiểu rồi, đến ngay."' },
      ],
      grammarNote: `【バイタル数値の読み方】
体温：36度5分（さぶろくどごぶ）/ 37.2℃（さんじゅうしちどにぶ）
血圧：120/80（ひゃくにじゅうのはちじゅう）
脈拍：72回/分（ならびじゅうにかい）
SpO2：95%（さちゅれーしょんきゅうじゅうご）
体重：58.5kg（ごじゅうはちてんごきろ）

【聴解のポイント】
変化を表す表現に注意：
・「いつもより〜」= hơn bình thường
・「急に〜」= đột nhiên → 緊急サイン
・「少し〜」= một chút → 経過観察
・「かなり〜」= khá/rất → 注意が必要`,
      quiz: {
        question: '「急に胸が苦しいと言っています」を聞いたとき、最初にすべきことは？',
        options: [
          { id: 'a', text: '少し様子を見る' },
          { id: 'b', text: '水を飲ませる' },
          { id: 'c', text: '即座に看護師・主任に報告する' },
          { id: 'd', text: 'バイタルを全部測ってから報告する' },
        ],
        correctId: 'c',
        explanation: '「急に（きゅうに）」= đột nhiên は緊急サイン。胸の苦しさは心疾患の可能性があり、即座に報告が最優先。\n"急に" = đột nhiên là dấu hiệu khẩn. Tức ngực có thể là bệnh tim, ưu tiên báo ngay.',
      },
      xpReward: 25,
    },
  },

  'n4-04-5': {
    courseTitle: { ja: 'N4 聴解トレーニング', vi: 'Luyện nghe N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4聴解L5: 申し送りを聞き取る',
      titleTranslation: 'Luyện nghe N4 Bài 5: Nghe hiểu bàn giao ca',
      introduction: `申し送りは勤務交代時に行われる重要な口頭・文書引き継ぎです。「誰の・何の情報か」「今日注意すべきことは何か」「自分が何をすべきか」を素早く把握する聴解練習をします。

Bàn giao ca là việc bàn giao miệng và văn bản quan trọng được thực hiện khi thay ca. Luyện nghe để nhanh chóng nắm "thông tin của ai - về điều gì", "hôm nay cần chú ý gì", "mình phải làm gì".`,
      keyPoints: [
        '申し送りの構成：利用者名→状態→変化→対応→次のアクション',
        '「要観察」「要確認」「要対応」を聞き逃さない',
        '優先順位：「至急」「緊急」のある項目を先にメモ',
        '引き継ぎ事項：「〜さんへ伝えてください」「〜を確認してください」',
        '担当の確認：「誰が担当か」「次のアクションは誰がするか」',
        '不明な点：申し送り後すぐに確認する習慣をつける',
      ],
      vocabulary: [
        { word: '申し送り', reading: 'もうしおくり', meaning: '交代時の引き継ぎ（bàn giao ca）', example: '申し送りを聞く' },
        { word: '要観察', reading: 'ようかんさつ', meaning: '注意して観察が必要（cần theo dõi）', example: '田中さんは要観察です' },
        { word: '経過', reading: 'けいか', meaning: '時間の流れによる変化（diễn biến）', example: '経過を観察する' },
        { word: '引き継ぐ', reading: 'ひきつぐ', meaning: '次の人に渡す（bàn giao）', example: '夜勤者に引き継ぐ' },
        { word: '特記事項', reading: 'とっきじこう', meaning: '特に注意する事項（mục cần chú ý đặc biệt）', example: '特記事項を確認する' },
      ],
      examples: [
        { japanese: '【申し送りスクリプト】「では、申し送りを始めます。301号室の田中様ですが、今朝から発熱37.8℃で食欲が低下しています。水分補給を促しましたが、摂取量は少なめです。夜勤の方、引き続き経過観察と水分補給のサポートをお願いします。305号室の山本様、特記事項はありません。通常通りです。以上です。」', reading: '【もうしおくりすくりぷと】「では、もうしおくりをはじめます。301ごうしつのたなかさまですが、けさからはつねつ37.8℃でしょくよくがていかしています。すいぶんほきゅうをうながしましたが、せっしゅりょうはすくなめです。やきんのかた、ひきつづきけいかかんさつとすいぶんほきゅうのさぽーとをおねがいします。305ごうしつのやまもとさま、とっきじこうはありません。つうじょうどおりです。いじょうです。」', translation: '【Kịch bản bàn giao】"Vậy bắt đầu bàn giao. Về bác Tanaka phòng 301, từ sáng nay sốt 37.8℃ và giảm cảm giác ngon miệng. Đã nhắc uống nước nhưng lượng hấp thu ít. Nhờ ca đêm tiếp tục theo dõi và hỗ trợ uống nước. Bác Yamamoto phòng 305, không có mục chú ý đặc biệt. Bình thường. Hết."' },
      ],
      grammarNote: `【申し送りの聴解ポイント】

①利用者名と部屋番号を同時にメモ
  「301号室の田中様」= phòng 301 - Tanaka

②状態変化の表現を聞き取る
  「今朝から〜」「昨日と比べて〜」「急に〜」

③アクション（次にすること）を把握
  「〜をお願いします」「〜を確認してください」
  「引き続き〜」「要観察」

④優先順位を判断
  「至急」「緊急」「要対応」= 最優先
  「通常通り」「特記事項なし」= 通常対応

【メモの書き方例】
301：田中 熱37.8 食欲↓ 水分少 → 経観・水分促し
305：山本 特記なし 通常`,
      quiz: {
        question: '申し送りで「要観察」とあった場合、次のシフトでは何をすべきですか？',
        options: [
          { id: 'a', text: '何もしなくてよい' },
          { id: 'b', text: '通常より注意して状態を観察・記録する' },
          { id: 'c', text: '家族に連絡する' },
          { id: 'd', text: '医師に報告する' },
        ],
        correctId: 'b',
        explanation: '「要観察（ようかんさつ）」= cần theo dõi。通常より注意して状態を観察し、変化があれば報告・記録する。',
      },
      xpReward: 25,
    },
  },

  'n4-04-6': {
    courseTitle: { ja: 'N4 聴解トレーニング', vi: 'Luyện nghe N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4聴解L6: 電話の会話を聞き取る',
      titleTranslation: 'Luyện nghe N4 Bài 6: Nghe hội thoại điện thoại',
      introduction: `電話での聴解は対面と違い、表情や口の動きが見えないため難しさが増します。「用件は何か」「誰から誰への電話か」「何をすべきか」を聞き取る特訓をしましょう。介護施設への家族からの問い合わせ電話が主な題材です。

Nghe điện thoại khó hơn gặp mặt vì không thấy biểu cảm và cử động miệng. Hãy luyện tập chuyên sâu nghe "mục đích là gì", "điện thoại từ ai đến ai", "cần làm gì". Chủ yếu lấy điện thoại hỏi từ gia đình đến cơ sở điều dưỡng làm chất liệu.`,
      keyPoints: [
        '電話の構成：①挨拶 ②用件 ③確認・伝言 ④終話',
        '用件の聞き取り：「〜についてお聞きしたいのですが」「〜の件で」',
        '伝言の聞き取り：誰から誰への・内容・連絡先・折り返し希望',
        '不明な時：「もう一度おっしゃっていただけますか？」',
        '電話番号：ゆっくり繰り返してもらう「もう一度確認させてください」',
        '終話確認：「〜の件で、折り返し連絡ですね。確認させていただきます。」',
      ],
      vocabulary: [
        { word: '折り返す', reading: 'おりかえす', meaning: 'かけ直す（gọi lại）', example: '折り返しご連絡します' },
        { word: '用件', reading: 'ようけん', meaning: '電話の目的（mục đích gọi）', example: '用件をお聞かせください' },
        { word: '伝言', reading: 'でんごん', meaning: 'メッセージ（nhắn tin）', example: '伝言をお願いできますか' },
        { word: 'お名前', reading: 'おなまえ', meaning: '名前（kính）（tên - kính ngữ）', example: 'お名前をいただけますか' },
        { word: '承りました', reading: 'うけたまわりました', meaning: 'わかりました（丁寧）（đã tiếp nhận）', example: '承りました、申し伝えます' },
      ],
      examples: [
        { japanese: '【スクリプト】スタッフ「はい、さくら介護センターでございます。」家族「田中の娘の田中恵子と申します。父の体調についてお聞きしたいのですが、担当の山田さんはいらっしゃいますか？」スタッフ「ただいま山田は席を外しております。よろしければご伝言を承りますが、いかがでしょうか。」家族「では、折り返しのお電話をお願いできますか。080-1234-5678です。」スタッフ「080-1234-5678でございますね。必ず山田よりご連絡させていただきます。」', reading: '【すくりぷと】すたっふ「はい、さくらかいごせんたーでございます。」かぞく「たなかのむすめのたなかけいこともうします。ちちのたいちょうについておききしたいのですが、たんとうのやまださんはいらっしゃいますか？」すたっふ「ただいまやまだはせきをはずしております。よろしければごでんごんをうけたまわりますが、いかがでしょうか。」かぞく「では、おりかえしのおでんわをおねがいできますか。080-1234-5678です。」すたっふ「080-1234-5678でございますね。かならずやまだよりごれんらくさせていただきます。」', translation: '【Kịch bản】NV: "Vâng, Trung tâm điều dưỡng Sakura xin nghe." GĐ: "Tôi là Keiko Tanaka, con gái của bác Tanaka. Tôi muốn hỏi về tình trạng sức khỏe của cha tôi, chị Yamada phụ trách có ở đó không?" NV: "Hiện tại Yamada đang vắng. Nếu bạn muốn để lại tin nhắn thì được không?" GĐ: "Vậy nhờ gọi lại cho tôi được không? Số 080-1234-5678." NV: "080-1234-5678 đúng không ạ. Chắc chắn Yamada sẽ liên lạc lại."' },
      ],
      grammarNote: `【電話聴解のポイント】

①発信者の情報を素早くメモ
  誰が（名前・関係）・何の件で

②用件のキーワードを聞き取る
  「〜についてお聞きしたい」
  「〜の件でお電話しました」

③折り返し情報を正確にメモ
  名前・電話番号・希望時間帯

④復唱確認を必ず行う
  「〇〇の〇〇様、〇〇のご件で、折り返し先は〇〇ですね」

⑤不明な電話番号は3桁ずつ確認
  「すみません、番号をもう一度ゆっくりお願いできますか」`,
      quiz: {
        question: '電話で相手の番号を聞き取れなかったとき、何と言いますか？',
        options: [
          { id: 'a', text: '「分かりました」とそのまま終わる' },
          { id: 'b', text: '「もう一度ゆっくりお願いできますか」と聞き直す' },
          { id: 'c', text: '「番号は不要です」と言う' },
          { id: 'd', text: '電話を切る' },
        ],
        correctId: 'b',
        explanation: '聞き取れなかった場合は「もう一度ゆっくりおっしゃっていただけますか」と遠慮なく聞き直す。これは必須マナー。\nKhi không nghe được, lịch sự hỏi lại "もう一度ゆっくりお願いできますか" là礼儀bắt buộc.',
      },
      xpReward: 25,
    },
  },

  'n4-04-7': {
    courseTitle: { ja: 'N4 聴解トレーニング', vi: 'Luyện nghe N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4聴解L7: 体調・症状の会話を聞く',
      titleTranslation: 'Luyện nghe N4 Bài 7: Nghe hội thoại về tình trạng sức khỏe và triệu chứng',
      introduction: `利用者が訴える症状を正確に聞き取ることは、介護職員として最も重要なスキルのひとつです。「どこが・どのくらい・いつから・どんな感じで痛いか」を聞き取り、適切に報告するための練習をします。

Nghe chính xác triệu chứng người dùng phàn nàn là một trong những kỹ năng quan trọng nhất của nhân viên điều dưỡng. Luyện tập nghe "đau ở đâu - bao nhiêu - từ khi nào - đau như thế nào" và báo cáo phù hợp.`,
      keyPoints: [
        '部位：頭・おなか・胸・腰・足・背中・肩・手・のど',
        '程度：少し / かなり / すごく / ひどい / 我慢できない',
        '種類：ズキズキ（nhói）/ じんじん（tê）/ チクチク（châm chích）/ 重い（nặng）',
        '時間：いつから？ずっと？時々？食後に？',
        '緊急サイン：「急に・突然・ひどく・我慢できない」→ 即報告',
        '聴解のコツ：感情的な訴えの中から事実情報を拾う',
      ],
      vocabulary: [
        { word: 'ズキズキ', reading: 'ずきずき', meaning: '拍動するような痛み（đau nhói）', example: '頭がズキズキします' },
        { word: 'じんじん', reading: 'じんじん', meaning: 'しびれるような感覚（tê tê）', example: '足がじんじんします' },
        { word: '我慢できない', reading: 'がまんできない', meaning: '耐えられない（không chịu nổi）', example: '痛くて我慢できません' },
        { word: '息苦しい', reading: 'いきぐるしい', meaning: '呼吸が苦しい（khó thở）', example: '少し息苦しいです' },
        { word: 'めまい', reading: 'めまい', meaning: 'くらくらする（chóng mặt）', example: 'めまいがして立てません' },
      ],
      examples: [
        { japanese: '【スクリプト】利用者「ねえ、ちょっと…頭が痛くて…」スタッフ「田中さん、頭が痛いんですね。いつからですか？」利用者「昨日の夜から…ズキズキする感じで…」スタッフ「昨夜からズキズキした頭痛ですね。他に気になることはありますか？」利用者「少し気持ち悪い感じも…」スタッフ「わかりました。すぐに看護師を呼びますね。動かないでください。」', reading: '【すくりぷと】りようしゃ「ねえ、ちょっと…あたまがいたくて…」すたっふ「たなかさん、あたまがいたいんですね。いつからですか？」りようしゃ「きのうのよるから…ずきずきするかんじで…」すたっふ「ゆうべからずきずきしたずつうですね。ほかにきになることはありますか？」りようしゃ「すこしきもちわるいかんじも…」すたっふ「わかりました。すぐにかんごしをよびますね。うごかないでください。」', translation: '【Kịch bản】Người dùng: "Ơi, hơi... đau đầu..." NV: "Bác Tanaka, bác đau đầu à. Từ lúc nào ạ?" Người dùng: "Từ tối qua... cảm giác đau nhói..." NV: "Từ tối qua đau đầu nhói đúng không? Còn thấy gì khác không ạ?" Người dùng: "Cũng hơi buồn nôn..." NV: "Hiểu rồi. Tôi gọi y tá ngay. Xin bác đừng di chuyển."' },
      ],
      grammarNote: `【症状の聞き取りパターン】

①部位（どこ）
  頭・胸・おなか・腰・足・のど

②程度（どのくらい）
  少し < かなり < すごく < ひどい < 我慢できない

③種類（どんな感じ）
  ズキズキ（nhói）/ じんじん（tê）
  チクチク（châm）/ 重い（nặng）/ 締め付ける（thắt）

④時間（いつから）
  さっきから / 昨日から / ずっと / 時々

【緊急判断の言葉】
急に・突然・ひどく・我慢できない
→ 即・看護師/上司へ報告！`,
      quiz: {
        question: '利用者が「突然、胸が痛くて我慢できない」と言った。最初にすべきことは？',
        options: [
          { id: 'a', text: 'いつから痛いか詳しく聞く' },
          { id: 'b', text: '水を飲ませる' },
          { id: 'c', text: '即座に看護師・医師を呼ぶ' },
          { id: 'd', text: '横になってもらって様子を見る' },
        ],
        correctId: 'c',
        explanation: '「突然・胸の痛み・我慢できない」は心筋梗塞の緊急サイン。即座に看護師/医師を呼ぶことが最優先。\n"Đột nhiên, đau ngực, không chịu nổi" là dấu hiệu khẩn cấp. Gọi y tá/bác sĩ ngay là ưu tiên số 1.',
      },
      xpReward: 25,
    },
  },

  'n4-04-8': {
    courseTitle: { ja: 'N4 聴解トレーニング', vi: 'Luyện nghe N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4聴解L8: 施設内アナウンスを聞く',
      titleTranslation: 'Luyện nghe N4 Bài 8: Nghe thông báo trong cơ sở',
      introduction: `介護施設では「食事の時間のお知らせ」「研修のご案内」「避難訓練の放送」など、施設内アナウンスが頻繁に流れます。N4の聴解でもアナウンス形式の問題が出題されます。要点を素早く聞き取る練習をしましょう。

Tại cơ sở điều dưỡng, thường xuyên có thông báo trong cơ sở như "thông báo giờ ăn", "thông báo đào tạo", "phát thanh diễn tập sơ tán". N4 cũng có câu hỏi dạng thông báo. Hãy luyện nghe nhanh điểm chính.`,
      keyPoints: [
        'アナウンスの構成：①何の案内 ②いつ ③どこで ④誰が対象 ⑤注意事項',
        '聞き取りの焦点：自分に関係ある情報だけを絞って聞く',
        '時間・場所：数字と固有名詞に集中する',
        '変更・中止のアナウンス：「〜が変更になりました」「〜は中止です」',
        '緊急アナウンス：「〜が発生しました」→ すぐに行動',
        '繰り返し：重要情報は2回繰り返されることが多い',
      ],
      vocabulary: [
        { word: 'ご案内', reading: 'ごあんない', meaning: '知らせ・案内（thông báo）', example: '食事のご案内です' },
        { word: '変更', reading: 'へんこう', meaning: '変わること（thay đổi）', example: '時間の変更があります' },
        { word: '中止', reading: 'ちゅうし', meaning: '予定をやめること（hủy/dừng）', example: '本日の入浴は中止です' },
        { word: '避難', reading: 'ひなん', meaning: '危険から逃げること（sơ tán）', example: '避難訓練のご案内' },
        { word: 'お集まりください', reading: 'おあつまりください', meaning: '集まってください（kính）（xin tập hợp）', example: '食堂にお集まりください' },
      ],
      examples: [
        { japanese: '【アナウンス①：食事】「入居者のみなさまにご案内します。本日の昼食は12時より食堂にてご用意しております。食堂にお集まりください。なお、本日のメニューは肉じゃがです。」', reading: '【あなうんす①：しょくじ】「にゅうきょしゃのみなさまにごあんないします。ほんじつのちゅうしょくは12じよりしょくどうにてごよういしております。しょくどうにおあつまりください。なお、ほんじつのめにゅーはにくじゃがです。」', translation: '【Thông báo①: Bữa ăn】"Xin thông báo đến tất cả người lưu trú. Bữa trưa hôm nay được chuẩn bị từ 12 giờ tại nhà ăn. Xin mời đến nhà ăn. Ngoài ra, menu hôm nay là nikujaga."' },
        { japanese: '【アナウンス②：変更】「スタッフのみなさまにお知らせします。本日14時から予定していた研修は、急遽17時に変更になりました。なお、場所は変わらず3階研修室です。ご確認よろしくお願いします。」', reading: '【あなうんす②：へんこう】「すたっふのみなさまにおしらせします。ほんじつ14じからよていしていたけんしゅうは、きゅうきょ17じにへんこうになりました。なお、ばしょはかわらず3かいけんしゅうしつです。ごかくにんよろしくおねがいします。」', translation: '【Thông báo②: Thay đổi】"Xin thông báo đến toàn thể nhân viên. Buổi đào tạo dự kiến lúc 14 giờ hôm nay đã được thay đổi đột xuất thành 17 giờ. Ngoài ra, địa điểm vẫn là phòng đào tạo tầng 3. Nhờ mọi người xác nhận."' },
      ],
      grammarNote: `【アナウンス聴解の手順】

①最初の一文で「何のアナウンスか」を判断
  「〜のご案内」「〜のお知らせ」

②5W1Hをメモ
  いつ（時刻・日付）・どこで・誰が・何を

③変更・中止の有無を確認
  「〜に変更」「〜は中止」

④「なお」の後の補足情報を聞く

【緊急アナウンスのパターン】
「火災が発生しました」→ 避難誘導
「〇〇号室で急変がありました」→ 即対応
「避難訓練を開始します」→ 手順通りに動く`,
      quiz: {
        question: 'アナウンスで「本日14時の研修は17時に変更になりました」と言っていました。研修は何時ですか？',
        options: [
          { id: 'a', text: '14時' },
          { id: 'b', text: '17時' },
          { id: 'c', text: '中止' },
          { id: 'd', text: '翌日' },
        ],
        correctId: 'b',
        explanation: '「〜に変更になりました」= đã thay đổi thành〜。14時から17時に変更 → 正解は17時。「変更」の後の新しい時刻・情報が答え。',
      },
      xpReward: 25,
    },
  },

  'n4-04-9': {
    courseTitle: { ja: 'N4 聴解トレーニング', vi: 'Luyện nghe N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4聴解L9: 質問・確認の会話',
      titleTranslation: 'Luyện nghe N4 Bài 9: Hội thoại hỏi và xác nhận',
      introduction: `N4の聴解では「AさんはBさんに何を頼まれましたか？」「〇〇をするのは誰ですか？」という質問・確認系の問題が多く出ます。会話の内容から「誰が・何をするか」を正確に判断する練習をします。

N4 nghe hiểu có nhiều câu hỏi dạng "A nhờ B làm gì?", "Ai sẽ làm〇〇?" Luyện tập phán đoán chính xác "ai làm gì" từ nội dung hội thoại.`,
      keyPoints: [
        '「誰が何をするか」を会話から判断する',
        '依頼の受け渡し：「〜さんに〜してもらえますか」→ 誰が誰に頼むか',
        '条件付き行動：「もし〜なら〜してください」',
        '否定的依頼：「〜しないでください」「〜する必要はありません」',
        '順番の判断：「まず〜、それから〜」の作業順序',
        'N4頻出設問：「この後、男の人は何をしますか？」',
      ],
      vocabulary: [
        { word: '〜に頼む', reading: 'にたのむ', meaning: '〜に依頼する（nhờ〜）', example: '山田さんに頼みます' },
        { word: '担当する', reading: 'たんとうする', meaning: '責任を持ってやる（phụ trách）', example: '私が担当します' },
        { word: '〜の代わりに', reading: 'のかわりに', meaning: '〜の代理で（thay cho〜）', example: '山田さんの代わりに行く' },
        { word: 'それから', reading: 'それから', meaning: 'その後（sau đó）', example: 'まず〜、それから〜' },
        { word: 'なるべく', reading: 'なるべく', meaning: 'できる限り（càng〜 càng tốt）', example: 'なるべく早く来てください' },
      ],
      examples: [
        { japanese: '【スクリプト】A「すみません、今日の午後のレクリエーションなんですが、山田さんにお願いしようと思っているんですが、山田さんは今日休みで…」B「そうですか。じゃあ、私がやりましょうか。」A「ありがとうございます。では、14時に食堂でお願いします。材料は倉庫にあります。」B「わかりました。14時に食堂ですね。材料は倉庫を確認します。」【質問】この後、Bさんは何をしますか？', reading: '【すくりぷと】A「すみません、きょうのごごのれくりえーしょんなんですが、やまださんにおねがいしようとおもっているんですが、やまださんはきょうやすみで…」B「そうですか。じゃあ、わたしがやりましょうか。」A「ありがとうございます。では、14じにしょくどうでおねがいします。ざいりょうはそうこにあります。」B「わかりました。14じにしょくどうですね。ざいりょうはそうこをかくにんします。」【しつもん】このあと、Bさんはなにをしますか？', translation: '【Kịch bản】A: "Xin lỗi, về buổi giải trí chiều nay, tôi định nhờ Yamada nhưng hôm nay Yamada nghỉ..." B: "Vậy à. Vậy để tôi làm nhé?" A: "Cảm ơn. Vậy nhờ bạn lúc 14 giờ ở nhà ăn. Nguyên liệu trong kho." B: "Hiểu rồi. 14 giờ ở nhà ăn nhỉ. Tôi sẽ kiểm tra nguyên liệu trong kho."' },
      ],
      grammarNote: `【「誰が何をするか」判断のコツ】

①依頼表現を聞き取る
  「〜をお願いします」→ 頼まれた人がする
  「〜してもらえますか」→ 頼まれた人がする

②承諾・断りを聞き取る
  「わかりました・はい」→ 承諾 = 実施する
  「すみません、ちょっと…」→ 断り = 実施しない

③「〜の代わりに」
  A「今日は休みで」B「じゃあ私が」→ BがAの代わりにする

【N4頻出設問パターン】
「この後、男の人は何をしますか？」
「女の人は何と言っていますか？」
「二人は何について話していますか？」
→ 最後の発言・決定事項に注目！`,
      quiz: {
        question: '会話で「わかりました、私がやります」と言った人はこの後どうしますか？',
        options: [
          { id: 'a', text: '何もしない' },
          { id: 'b', text: '他の人に頼む' },
          { id: 'c', text: '自分でその仕事をする' },
          { id: 'd', text: '上司に相談する' },
        ],
        correctId: 'c',
        explanation: '「わかりました、私がやります」= 承諾の表現。この人が自分でその仕事をすることを意味する。\n"Hiểu rồi, tôi sẽ làm" = chấp nhận = tự mình làm.',
      },
      xpReward: 25,
    },
  },

  'n4-04-10': {
    courseTitle: { ja: 'N4 聴解トレーニング', vi: 'Luyện nghe N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4聴解L10: 自然な話し方・省略形に慣れる',
      titleTranslation: 'Luyện nghe N4 Bài 10: Làm quen với cách nói tự nhiên và dạng rút gọn',
      introduction: `実際の日本語会話では、教科書通りの丁寧な表現ではなく、省略・短縮・口語表現が多く使われます。介護現場の同僚間の会話は特に自然な話し方で進みます。省略形を聞き取る耳を作りましょう。

Trong hội thoại tiếng Nhật thực tế, nhiều cách diễn đạt rút gọn, ngắn gọn và khẩu ngữ được dùng thay vì cách nói lịch sự như trong sách giáo khoa. Hội thoại giữa đồng nghiệp tại hiện trường điều dưỡng đặc biệt diễn ra theo cách nói tự nhiên. Hãy luyện tai nghe dạng rút gọn.`,
      keyPoints: [
        '〜ている → 〜てる（例：見ている→見てる）',
        '〜ておく → 〜とく（例：準備しておく→準備しとく）',
        '〜てしまう → 〜ちゃう（例：忘れてしまう→忘れちゃう）',
        '〜なければならない → 〜なきゃ（例：報告しなきゃ）',
        '〜ではない → 〜じゃない（例：田中さんじゃないよ）',
        '〜という → 〜って（例：山田さんって知ってる？）',
      ],
      vocabulary: [
        { word: 'なきゃ', reading: 'なきゃ', meaning: '〜なければならない（phải〜）', example: '報告しなきゃ' },
        { word: 'じゃん', reading: 'じゃん', meaning: '〜じゃないか（đúng không？）', example: 'それ間違いじゃん' },
        { word: 'てか', reading: 'てか', meaning: 'それよりも・というか（mà thật ra）', example: 'てか、もう時間じゃない？' },
        { word: 'ってか', reading: 'ってか', meaning: 'というか（hay là）', example: 'ってか、聞いた？' },
        { word: 'めっちゃ', reading: 'めっちゃ', meaning: 'とても（rất）', example: 'めっちゃ忙しい' },
      ],
      examples: [
        { japanese: '【スクリプト（自然な会話）】A「ねえ、バイタルもう記録しといた？」B「あ、まだ。今やろうとしてたとこ。」A「そっか。田中さん、さっきから熱っぽいみたいで、ちょっと気になってんだけど。」B「そうなの？じゃあ、測り直したほうがいいじゃん。」A「だよね。今すぐやっとく。主任にも言わなきゃかな。」', reading: '【すくりぷと（しぜんなかいわ）】A「ねえ、ばいたるもうきろくしといた？」B「あ、まだ。いまやろうとしてたとこ。」A「そっか。たなかさん、さっきからねつっぽいみたいで、ちょっときになってんだけど。」B「そうなの？じゃあ、はかりなおしたほうがいいじゃん。」A「だよね。いますぐやっとく。しゅにんにもいわなきゃかな。」', translation: '【Kịch bản (hội thoại tự nhiên)】A: "Này, ghi dấu hiệu sinh tồn chưa?" B: "À, chưa. Đang chuẩn bị làm đây." A: "Vậy à. Bác Tanaka từ nãy có vẻ hơi sốt, tôi hơi lo." B: "Vậy à? Thì đo lại đi." A: "Đúng rồi. Tôi làm ngay. Có lẽ phải báo trưởng nhóm nữa."' },
      ],
      grammarNote: `【省略形・口語表現 完全リスト】

動詞省略：
〜ている → 〜てる
〜ておく → 〜とく
〜てしまう → 〜ちゃう（て形）/ 〜じゃう（で形）
〜てしまった → 〜ちゃった / 〜じゃった

助動詞省略：
〜なければならない → 〜なきゃ
〜なければならない → 〜ないといけない

接続・感嘆：
〜という → 〜って
〜ではないか → 〜じゃん
〜のだけど → 〜んだけど
〜のに → 〜のに（同じ）

程度副詞（若者言葉）：
とても → めっちゃ / すごく / マジで`,
      quiz: {
        question: '「今から記録しとくね」の正式な表現は？',
        options: [
          { id: 'a', text: '今から記録してしまうね' },
          { id: 'b', text: '今から記録していくね' },
          { id: 'c', text: '今から記録しておくね' },
          { id: 'd', text: '今から記録してきたね' },
        ],
        correctId: 'c',
        explanation: '「〜しとく」= 「〜しておく」の口語省略形。事前にやっておく・準備しておくの意味。\n"〜shitoku" là dạng rút gọn khẩu ngữ của "〜shite oku" = làm sẵn/chuẩn bị trước.',
      },
      xpReward: 25,
    },
  },

  'n4-04-11': {
    courseTitle: { ja: 'N4 聴解トレーニング', vi: 'Luyện nghe N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4聴解L11: 感情・態度の聞き取り',
      titleTranslation: 'Luyện nghe N4 Bài 11: Nghe cảm xúc và thái độ',
      introduction: `日本語では言葉の意味だけでなく、声のトーン・間（ま）・語尾の変化で話し手の感情や態度が伝わります。「困っている」「怒っている」「遠慮している」などを聞き取る練習をします。利用者の不満や要望を察する力もここで養います。

Trong tiếng Nhật, không chỉ ý nghĩa từ ngữ mà còn thể hiện cảm xúc và thái độ của người nói qua âm điệu, khoảng lặng, biến đổi cuối câu. Luyện nghe "đang lo lắng", "đang tức giận", "đang e ngại". Cũng trau dồi khả năng nhận ra sự không hài lòng và mong muốn của người dùng.`,
      keyPoints: [
        'ためらいの表現：「あの…」「ちょっと…」「〜なんですけど…」',
        '不満・要望：「〜なんですよね…」「できれば〜」「もう少し〜」',
        '遠慮の依頼：「もしよければ…」「おさしつかえなければ…」',
        '肯定的な感情：「ありがとう・嬉しい・助かりました」',
        '否定的な感情：「困った・不安・痛い・つらい」',
        'N4設問：「女の人はどんな気持ちですか？」',
      ],
      vocabulary: [
        { word: 'ためらう', reading: 'ためらう', meaning: '迷って言えない（do dự）', example: 'ためらいながら話す' },
        { word: 'おさしつかえなければ', reading: 'おさしつかえなければ', meaning: 'もし問題なければ（nếu không phiền）', example: 'おさしつかえなければ教えてください' },
        { word: 'できれば', reading: 'できれば', meaning: '可能であれば（nếu có thể）', example: 'できれば変えてほしい' },
        { word: '遠慮', reading: 'えんりょ', meaning: '気を使って控えめにすること（khách sáo/kiêng dè）', example: '遠慮しないでください' },
        { word: '察する', reading: 'さっする', meaning: '相手の気持ちを読む（đoán/nhận ra）', example: '気持ちを察して対応する' },
      ],
      examples: [
        { japanese: '【スクリプト】利用者「あの…夜中に何度もトイレに行くんで…その…ちょっと、ナースコール押すのが申し訳なくて…」スタッフ「田中さん、遠慮しないでください。夜中でも何でも呼んでいいんですよ。むしろ呼んでもらわないと心配ですから。」利用者「そうですか…ありがとうございます…ちょっと安心しました。」', reading: '【すくりぷと】りようしゃ「あの…よなかになんどもといれにいくんで…その…ちょっと、なーすこーるおすのがもうしわけなくて…」すたっふ「たなかさん、えんりょしないでください。よなかでもなんでもよんでいいんですよ。むしろよんでもらわないとしんぱいですから。」りようしゃ「そうですか…ありがとうございます…ちょっとあんしんしました。」', translation: '【Kịch bản】Người dùng: "Ơi... vì đêm khuya đi vệ sinh nhiều lần... nên... hơi ngại bấm chuông..." NV: "Bác Tanaka, đừng ngại nhé. Dù đêm khuya cũng cứ gọi được đấy. Ngược lại nếu không gọi tôi mới lo..." Người dùng: "Vậy à... cảm ơn... tôi yên tâm một chút rồi."' },
      ],
      grammarNote: `【感情・態度を表す表現まとめ】

遠慮・ためらい（e ngại/do dự）：
  「あの…」「その…」「ちょっと…」
  「〜なんですが…」（語尾が下がる）

不安・心配（lo lắng）：
  「〜かな…」「〜でしょうか」「大丈夫でしょうか」

喜び・感謝（vui mừng/biết ơn）：
  「ありがとうございます！」「助かりました！」
  「うれしいです」（声が明るくなる）

不満・要望（không hài lòng/mong muốn）：
  「できれば〜」「もう少し〜」
  「〜なんですよね…」（語尾を伸ばす）

怒り（tức giận）：
  語気が強くなる・言葉が短くなる
  「〜でしょ！」「なんで〜」`,
      quiz: {
        question: '利用者が「あの…ちょっと…夜中に何度も呼ぶのが申し訳なくて…」と言っています。この人はどんな気持ちですか？',
        options: [
          { id: 'a', text: '怒っている' },
          { id: 'b', text: 'スタッフに迷惑をかけることを気にして遠慮している' },
          { id: 'c', text: '全く問題を感じていない' },
          { id: 'd', text: '眠れて満足している' },
        ],
        correctId: 'b',
        explanation: '「申し訳なくて（もうしわけなくて）」= cảm thấy xin lỗi/ngại。「ちょっと…」のためらいの表現から、遠慮・気遣いの気持ちが読み取れる。',
      },
      xpReward: 25,
    },
  },

  'n4-04-12': {
    courseTitle: { ja: 'N4 聴解トレーニング', vi: 'Luyện nghe N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4聴解L12: 長い会話から要点を聞く',
      titleTranslation: 'Luyện nghe N4 Bài 12: Nghe điểm chính từ hội thoại dài',
      introduction: `N4の聴解では2〜3分の比較的長い会話から、「最終的に何が決まったか」「二人は何について話しているか」「問題は何か・解決策は何か」を聞き取る問題が出ます。長い会話を効率よく処理する戦略を学びましょう。

N4 nghe hiểu có câu hỏi nghe hội thoại tương đối dài 2-3 phút để trả lời "cuối cùng quyết định gì", "hai người đang nói về gì", "vấn đề là gì/giải pháp là gì". Hãy học chiến lược xử lý hội thoại dài hiệu quả.`,
      keyPoints: [
        '全体の構成：問題提起→議論→解決策→結論',
        '最終決定を聞く：「では〜にしましょう」「〜ということにします」',
        '問題の把握：「〜が困っている」「〜が問題だ」',
        '提案を聞き分ける：「〜はどうですか」「〜しましょうか」',
        '承諾・却下：「いいですね」vs「それはちょっと…」',
        'N4頻出設問：「二人は何を決めましたか？」「問題は何ですか？」',
      ],
      vocabulary: [
        { word: '提案', reading: 'ていあん', meaning: 'アイデアを出すこと（đề xuất）', example: '新しい提案があります' },
        { word: '結論', reading: 'けつろん', meaning: '最終的な決定（kết luận）', example: '結論として〜にします' },
        { word: '〜ということになりました', reading: 'ということになりました', meaning: '〜に決まった（đã được quyết định là〜）', example: '明日に延期ということになりました' },
        { word: '折り合い', reading: 'おりあい', meaning: '妥協点（điểm thỏa hiệp）', example: '折り合いをつける' },
        { word: 'それはちょっと', reading: 'それはちょっと', meaning: '断りの婉曲表現（từ chối nhẹ nhàng）', example: 'それはちょっと難しいです' },
      ],
      examples: [
        { japanese: '【スクリプト（3分間の会話）】主任「今月の研修なんですが、参加者が少ないですね。グエンさん、何か理由わかりますか？」グエン「夜勤の翌日の研修だったので、参加しにくかったと思います。」主任「なるほど。じゃあ、時間帯を変えるのはどうでしょう。日勤の人が参加しやすい午後はどうですか。」グエン「午後2時なら参加しやすいと思います。」主任「では、来月は午後2時に変更ということにしましょう。夜勤の方は翌日参加可にします。」グエン「わかりました、スタッフに伝えます。」【質問】二人は何を決めましたか？', reading: '【すくりぷと（3ぷんかんのかいわ）】しゅにん「こんげつのけんしゅうなんですが、さんかしゃがすくないですね。ぐえんさん、なにかりゆうわかりますか？」ぐえん「やきんのよくじつのけんしゅうだったので、さんかしにくかったとおもいます。」しゅにん「なるほど。じゃあ、じかんたいをかえるのはどうでしょう。にっきんのひとがさんかしやすいごごはどうですか。」ぐえん「ごご2じならさんかしやすいとおもいます。」しゅにん「では、らいげつはごご2じにへんこうということにしましょう。やきんのかたはよくじつさんかかにします。」ぐえん「わかりました、すたっふにつたえます。」【しつもん】ふたりはなにをきめましたか？', translation: '【Kịch bản (3 phút)】...Kết luận: đổi đào tạo sang 14 giờ, ca đêm được tham gia hôm sau.' },
      ],
      grammarNote: `【長い会話の聞き取り戦略】

①会話の構造を把握する
  問題提起 → 原因 → 提案 → 決定

②最後の発言に注目
  「では〜にしましょう」
  「〜ということになりました」
  = 最終決定

③「それはちょっと」= 却下サイン
  「いいですね・そうしましょう」= 承諾サイン

④設問のキーワードを先に確認
  「何を決めたか」→ 決定の表現を探す
  「問題は何か」→ 問題提起の表現を探す

【N4頻出設問】
「二人は何を決めましたか？」
「男の人の提案は何ですか？」
「最終的にどうなりましたか？」`,
      quiz: {
        question: '長い会話を聞くとき、最も重要な部分はどこですか？',
        options: [
          { id: 'a', text: '最初の挨拶部分' },
          { id: 'b', text: '会話の途中の例' },
          { id: 'c', text: '最後の決定・結論部分' },
          { id: 'd', text: '全部同じくらい重要' },
        ],
        correctId: 'c',
        explanation: 'N4の聴解設問は「何が決まったか」を問うことが多い。「では〜にしましょう」「〜ということになりました」の最後の結論部分が最重要。',
      },
      xpReward: 25,
    },
  },

  'n4-04-13': {
    courseTitle: { ja: 'N4 聴解トレーニング', vi: 'Luyện nghe N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4聴解L13: 会議・ミーティングの聴解',
      titleTranslation: 'Luyện nghe N4 Bài 13: Nghe họp và meeting',
      introduction: `介護施設では毎週カンファレンス（ケア会議）や朝礼・夕礼などのミーティングが行われます。「今日の議題は何か」「誰が何を担当するか」「いつまでに何をするか」を正確に聞き取る練習をします。

Tại cơ sở điều dưỡng, hàng tuần có conference (họp chăm sóc) và buổi chào buổi sáng/chiều. Luyện tập nghe chính xác "chủ đề hôm nay là gì", "ai phụ trách gì", "làm gì trước khi nào".`,
      keyPoints: [
        '会議の構成：議題→発言→決定→アクションアイテム',
        '議題の聞き取り：「本日の議題は〜です」「〜について話し合います」',
        'アクションアイテム：「〜さんが〜を〜までに担当します」',
        '決定事項：「〜ということになりました」「〜に決まりました」',
        '次回確認：「次回は〜に確認します」「来週報告してください」',
        'N4設問：「この会議で決まったことは？」',
      ],
      vocabulary: [
        { word: 'カンファレンス', reading: 'かんふぁれんす', meaning: 'ケア会議（hội nghị chăm sóc）', example: '週1回のカンファレンス' },
        { word: '議題', reading: 'ぎだい', meaning: '話し合うテーマ（nghị trình）', example: '本日の議題は2件です' },
        { word: 'アクションアイテム', reading: 'あくしょんあいてむ', meaning: '各自の実行すべきこと（hạng mục hành động）', example: 'アクションアイテムを確認する' },
        { word: '担当する', reading: 'たんとうする', meaning: '責任を持ってやる（phụ trách）', example: '田中さんが担当します' },
        { word: '〜までに', reading: 'までに', meaning: '〜の時間より前に（trước〜）', example: '来週の月曜までに' },
      ],
      examples: [
        { japanese: '【朝礼スクリプト】主任「では朝礼を始めます。本日の連絡事項は2点です。1点目、明日の14時から感染予防の研修があります。全員参加です。2点目、田中様のケアプランの見直しをカンファレンスで行います。来週木曜14時、担当の方は資料を準備してきてください。以上です。何かありますか？」グエン「確認ですが、研修の場所はどこですか？」主任「3階の研修室です。では、今日もよろしくお願いします。」', reading: '【ちょうれいすくりぷと】しゅにん「ではちょうれいをはじめます。ほんじつのれんらくじこうは2てんです。1てんめ、あしたの14じからかんせんよぼうのけんしゅうがあります。ぜんいんさんかです。2てんめ、たなかさまのけあぷらんのみなおしをかんふぁれんすでおこないます。らいしゅうもくようび14じ、たんとうのかたはしりょうをじゅんびしてきてください。いじょうです。なにかありますか？」ぐえん「かくにんですが、けんしゅうのばしょはどこですか？」しゅにん「3かいのけんしゅうしつです。では、きょうもよろしくおねがいします。」', translation: '【Kịch bản buổi sáng】Trưởng nhóm thông báo 2 điểm: 1) Đào tạo phòng nhiễm khuẩn 14h ngày mai, tất cả tham gia. 2) Xem xét kế hoạch chăm sóc bác Tanaka tại conference thứ Năm tuần sau 14h, người phụ trách chuẩn bị tài liệu.' },
      ],
      grammarNote: `【朝礼・会議の聴解ポイント】

①連絡事項の数を確認
  「〜点あります」→ 何個あるか把握
  「1点目・2点目」で各情報を分類

②アクションアイテムをメモ
  誰が：担当者名
  何を：内容
  いつまでに：期限
  どこで：場所

③「以上です」の後の質問タイムを活用
  不明点はこのタイミングで確認

【設問の答え方】
「決まったことは？」→ 「〜になりました」を探す
「誰の担当？」→ 「〜さんが担当」を探す
「いつまでに？」→ 「〜までに」を探す`,
      quiz: {
        question: '朝礼で「全員参加の研修があります」と言いました。夜勤明けのスタッフはどうすべきですか？',
        options: [
          { id: 'a', text: '「全員」とあるので参加しなければならない' },
          { id: 'b', text: '夜勤明けなので参加しなくていい' },
          { id: 'c', text: '確認してから判断する' },
          { id: 'd', text: '誰かに代わってもらう' },
        ],
        correctId: 'a',
        explanation: '「全員参加（ぜんいんさんか）」= tất cả phải tham gia。例外の記載がなければ夜勤明けも含む全員が対象。ただし実際は例外がある場合は確認する。',
      },
      xpReward: 25,
    },
  },

  'n4-04-14': {
    courseTitle: { ja: 'N4 聴解トレーニング', vi: 'Luyện nghe N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4聴解L14: N4模擬試験①〜短文問題〜',
      titleTranslation: 'Luyện nghe N4 Bài 14: Thi thử N4①〜Câu hỏi đoạn ngắn〜',
      introduction: `実際のN4聴解試験に近い形式で練習します。短いスクリプトを読んで設問に答える練習です。本番では音声を聞きますが、ここでは文字スクリプトで問題形式・設問パターンに慣れましょう。時間を意識しながら取り組んでください。

Luyện tập theo hình thức gần với bài thi nghe N4 thực tế. Đây là bài luyện đọc kịch bản ngắn và trả lời câu hỏi. Trong thi thật nghe bằng âm thanh nhưng ở đây làm quen với dạng câu hỏi bằng kịch bản văn bản. Hãy lưu ý thời gian.`,
      keyPoints: [
        '短文問題の特徴：15〜30秒のスクリプト・1問の設問',
        '状況理解：「どんな場面か」を最初に判断',
        '設問を先に読む：何を聞かれているか確認してからスクリプトを聞く',
        '選択肢の落とし穴：本文にある言葉を使った「正解に見える誤答」に注意',
        '時間管理：1問約1分半を目安に',
        '消去法：明らかに違うものを消してから選ぶ',
      ],
      vocabulary: [
        { word: '模擬試験', reading: 'もぎしけん', meaning: '練習のための試験（thi thử）', example: '模擬試験で練習する' },
        { word: '設問', reading: 'せつもん', meaning: '問題・質問（câu hỏi）', example: '設問を先に読む' },
        { word: '選択肢', reading: 'せんたくし', meaning: 'a・b・c・dの選択（đáp án lựa chọn）', example: '選択肢を消去法で絞る' },
        { word: '消去法', reading: 'しょうきょほう', meaning: '違うものを消す方法（loại trừ）', example: '消去法で答える' },
        { word: 'ひっかけ', reading: 'ひっかけ', meaning: 'わざと間違えさせる問題（bẫy）', example: 'ひっかけに注意' },
      ],
      examples: [
        { japanese: '【問題1】スクリプト：「田中さん、今日の午後の入浴なんですが、体温が37.5℃あるので中止にしました。夜になっても熱が下がらなければ、主任に連絡してください。」設問：スタッフは次に何をすべきですか？A.今すぐ主任に連絡する　B.夜まで様子を見て、熱が続けば主任に連絡する　C.入浴を再開する　D.医師を呼ぶ', reading: '【もんだい1】すくりぷと：「たなかさん、きょうのごごのにゅうよくなんですが、たいおんが37.5℃あるのでちゅうしにしました。よるになっても、ねつがさがらなければ、しゅにんにれんらくしてください。」せつもん：すたっふはつぎになにをすべきですか？A.いますぐしゅにんにれんらくする　B.よるまでようすをみて、ねつがつづけばしゅにんにれんらくする　C.にゅうよくをさいかいする　D.いしをよぶ', translation: '【Câu 1】Kịch bản: "Bác Tanaka, về tắm chiều nay, vì nhiệt độ 37.5℃ nên đã hủy. Nếu đến tối mà nhiệt độ vẫn không giảm, hãy liên lạc trưởng nhóm." Câu hỏi: Nhân viên tiếp theo nên làm gì? → Đáp án B' },
        { japanese: '【問題2】スクリプト：「明日の朝9時から避難訓練があります。全員参加ですが、入居者の対応で離れられない場合は、事前に主任まで報告してください。」設問：避難訓練に参加できない人はどうすればいいですか？A.参加しなくていい　B.黙って欠席する　C.事前に主任に報告する　D.別の日に参加する', reading: '【もんだい2】すくりぷと：「あしたのあさくじからひなんくんれんがあります。ぜんいんさんかですが、にゅうきょしゃのたいおうでなんばなれられないばあいは、じぜんにしゅにんまでほうこくしてください。」せつもん：ひなんくんれんにさんかできないひとはどうすればいいですか？A.さんかしなくていい　B.だまってけっせきする　C.じぜんにしゅにんにほうこくする　D.べつのひにさんかする', translation: '【Câu 2】→ Đáp án C: Báo cáo trưởng nhóm trước' },
      ],
      grammarNote: `【N4聴解 短文問題の解き方】

STEP 1：設問と選択肢を先に読む（10秒）
STEP 2：スクリプトを読む・聞く（30秒）
STEP 3：明らかに違う選択肢を消す（消去法）
STEP 4：残った選択肢で本文に根拠を確認
STEP 5：答えを選ぶ（1問約1分半）

【よくある間違い】
×スクリプトにある言葉を使った「ひっかけ」を選ぶ
×スクリプトを全部聞く前に答えを決める
×記憶だけで答える（本文に戻らない）
×「そうかもしれない」という推測で答える`,
      quiz: {
        question: '「夜になっても熱が下がらなければ主任に連絡してください」とあります。今（夕方）すべきことは？',
        options: [
          { id: 'a', text: '今すぐ主任に連絡する' },
          { id: 'b', text: '夜まで様子を見て、熱が続けば主任に連絡する' },
          { id: 'c', text: '入浴を再開する' },
          { id: 'd', text: '医師を呼ぶ' },
        ],
        correctId: 'b',
        explanation: '「〜なければ〜してください」= "nếu〜 thì〜"。今すぐではなく、夜になっても熱が続く場合に連絡する条件付き指示。',
      },
      xpReward: 25,
    },
  },

  'n4-04-15': {
    courseTitle: { ja: 'N4 聴解トレーニング', vi: 'Luyện nghe N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4聴解L15: N4模擬試験②〜長文問題〜',
      titleTranslation: 'Luyện nghe N4 Bài 15: Thi thử N4②〜Câu hỏi đoạn dài〜',
      introduction: `N4聴解の長文問題（2〜3分）を模擬試験形式で練習します。「問題を複数含む長い会話」から複数の設問に答えるトレーニングです。話の流れ全体を追いながら、各設問のポイントを押さえる力を養います。

Luyện tập câu hỏi đoạn dài (2-3 phút) của N4 theo hình thức thi thử. Đây là bài tập trả lời nhiều câu hỏi từ "hội thoại dài chứa nhiều vấn đề". Trau dồi khả năng theo dõi toàn bộ diễn biến câu chuyện trong khi nắm bắt điểm chính của từng câu hỏi.`,
      keyPoints: [
        '長文問題は複数の設問（2〜3問）がセット',
        '最初に全ての設問を読んで何を聞かれているか把握',
        '話の流れ：問題→提案→議論→結論の流れを追う',
        '「最終的にどうなったか」が設問の核心になることが多い',
        '途中で迷わない：わからなくても次に進む',
        '数字・固有名詞・時刻は必ずメモ',
      ],
      vocabulary: [
        { word: '長文問題', reading: 'ちょうぶんもんだい', meaning: '長いテキストの問題（câu hỏi đoạn dài）', example: '長文問題に挑戦する' },
        { word: '複数', reading: 'ふくすう', meaning: '2つ以上（nhiều）', example: '複数の設問' },
        { word: '核心', reading: 'かくしん', meaning: '一番大切な部分（cốt lõi）', example: '問題の核心を把握する' },
        { word: '流れ', reading: 'ながれ', meaning: '順番・プロセス（diễn biến）', example: '話の流れを追う' },
        { word: '把握', reading: 'はあく', meaning: '理解・つかむこと（nắm bắt）', example: '状況を把握する' },
      ],
      examples: [
        { japanese: `【長文模擬スクリプト（3分）】
主任「来月のシフトなんですが、グエンさんとリンさんに相談があります。今月は夜勤が多くて大変だったと思いますが、来月はどうしたいですか？」
グエン「できれば夜勤は月4回くらいにしていただけると助かります。」
リン「私も同じです。今月は6回だったので、少し体がきつかったです。」
主任「わかりました。ではお二人とも来月は4回にします。ただし、急に欠勤が出た場合は協力をお願いすることがあるかもしれません。それはよろしいですか？」
グエン「はい、緊急の場合は協力します。」
リン「私も大丈夫です。」
主任「ありがとうございます。では来月のシフトはそのように作成します。」

【設問1】グエンさんとリンさんの来月の夜勤は何回ですか？
【設問2】主任が条件として言ったことは何ですか？`, reading: `【ちょうぶんもぎすくりぷと（3ぷん）】
しゅにん「らいげつのしふとなんですが、ぐえんさんとりんさんにそうだんがあります。こんげつはやきんがおおくてたいへんだったとおもいますが、らいげつはどうしたいですか？」
ぐえん「できればやきんはつきよんかいくらいにしていただけるとたすかります。」
りん「わたしもおなじです。こんげつはろくかいだったので、すこしからだがきつかったです。」
しゅにん「わかりました。ではおふたりともらいげつはよんかいにします。ただし、きゅうにけっきんがでたばあいはきょうりょくをおねがいすることがあるかもしれません。それはよろしいですか？」
ぐえん「はい、きんきゅうのばあいはきょうりょくします。」
りん「わたしもだいじょうぶです。」
しゅにん「ありがとうございます。ではらいげつのしふとはそのようにさくせいします。」`, translation: `【Kịch bản dài 3 phút】
Trưởng nhóm hỏi Nguyễn và Linh về ca đêm tháng sau. Cả hai xin giảm xuống 4 ca. Trưởng nhóm đồng ý với điều kiện hỗ trợ khi có người vắng đột xuất.
Đáp án 1: 4 lần　Đáp án 2: Hỗ trợ khi có người vắng đột xuất` },
      ],
      grammarNote: `【長文聴解の戦略まとめ】

事前準備（スクリプトを聞く前）：
①全ての設問を読む
②「何を聞かれているか」の核心を把握
③キーワードを確認

聴取中：
①会話の構造（問題→議論→結論）を追う
②数字・名前・時刻をメモ
③「では〜にしましょう」「ただし〜」に注意

解答時：
①設問に戻って本文に根拠を確認
②「正解に見えるひっかけ」を排除
③迷ったら消去法で絞る`,
      quiz: {
        question: 'N4長文聴解問題を聞く前に最初にすべきことは何ですか？',
        options: [
          { id: 'a', text: 'すぐに音声を聞き始める' },
          { id: 'b', text: '全ての設問と選択肢を先に読んでおく' },
          { id: 'c', text: 'メモ用紙を準備する' },
          { id: 'd', text: '難しい単語を調べる' },
        ],
        correctId: 'b',
        explanation: '設問を先に読むことで「何を聞き取るべきか」が明確になり、集中して情報を拾える。長文問題では特に重要な戦略。',
      },
      xpReward: 25,
    },
  },

  'n4-04-16': {
    courseTitle: { ja: 'N4 聴解トレーニング', vi: 'Luyện nghe N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4聴解L16: 総復習テスト',
      titleTranslation: 'Luyện nghe N4 Bài 16: Kiểm tra tổng hợp',
      introduction: `N4聴解コース全16レッスンの総まとめです。数字・指示・報告・申し送り・電話・体調・アナウンス・省略形・感情・長文まで、全範囲から5問の総復習テストに挑戦しましょう！

Tổng kết toàn bộ 16 bài của khóa học Luyện nghe N4. Hãy thử sức với bài kiểm tra tổng hợp 5 câu hỏi từ toàn bộ phạm vi: số liệu, chỉ thị, báo cáo, bàn giao ca, điện thoại, sức khỏe, thông báo, rút gọn, cảm xúc, đoạn dài!`,
      keyPoints: [
        '【L2】数字の聞き取り：復唱確認・なな（7）とよん（4）',
        '【L3-5】指示・申し送り：メモ・復唱・優先順位',
        '【L6-7】電話・体調：用件確認・緊急サイン',
        '【L8-9】アナウンス・質問：変更の把握・誰が何をするか',
        '【L10-11】省略形・感情：口語表現・遠慮・不満',
        '【L12-15】長文・模擬：最終決定・設問先読み戦略',
      ],
      vocabulary: [
        { word: '総復習', reading: 'そうふくしゅう', meaning: '全範囲の復習（ôn tập tổng hợp）', example: '全レッスンの総復習' },
        { word: '聴解', reading: 'ちょうかい', meaning: '聞いて理解すること（nghe hiểu）', example: 'N4の聴解力を鍛える' },
        { word: '復唱', reading: 'ふくしょう', meaning: '聞いた内容を繰り返す（nhắc lại）', example: '必ず復唱確認する' },
        { word: '消去法', reading: 'しょうきょほう', meaning: '違うものを消す方法（loại trừ）', example: '消去法で正解を絞る' },
        { word: '緊急サイン', reading: 'きんきゅうさいん', meaning: '急いで対応が必要なキーワード（dấu hiệu khẩn）', example: '「急に・突然」は緊急サイン' },
      ],
      examples: [
        { japanese: '【総まとめ：聴解の鉄則】①設問を先に読む ②数字・名前・時刻はメモ ③「急に・突然」は緊急サイン ④「では〜にしましょう」は最終決定 ⑤省略形・口語表現に慣れる ⑥不明は遠慮なく聞き直す', reading: '【そうまとめ：ちょうかいのてっそく】①せつもんをさきによむ ②すうじ・なまえ・じこくはめも ③「きゅうに・とつぜん」はきんきゅうさいん ④「では〜にしましょう」はさいしゅうけってい ⑤しょうりゃくけい・こうごひょうげんになれる ⑥ふめいはえんりょなくききなおす', translation: '【Tổng kết: Nguyên tắc vàng nghe hiểu】①Đọc câu hỏi trước ②Ghi số/tên/giờ ③"急に・突然" là dấu hiệu khẩn ④"では〜にしましょう" là quyết định cuối ⑤Làm quen rút gọn ⑥Không hiểu hỏi lại ngay' },
      ],
      grammarNote: `【N4聴解 全レッスンまとめ】
L1：職場の会話・省略形基礎
L2：数字・時間・日付の聞き取り
L3：指示・依頼を聞き取る
L4：バイタル・状態変化の報告
L5：申し送りを聞き取る
L6：電話の会話
L7：体調・症状の会話
L8：施設内アナウンス
L9：質問・確認の会話
L10：自然な話し方・省略形
L11：感情・態度の聞き取り
L12：長い会話から要点を聞く
L13：会議・ミーティング
L14：模擬試験①短文
L15：模擬試験②長文
L16：総復習テスト`,
      quizzes: [
        {
          question: '「体温が37.8、血圧が145の92です」を記録するとき、まずすべきことは？',
          options: [
            { id: 'a', text: 'すぐに記録する' },
            { id: 'b', text: '数値を復唱確認してから記録する' },
            { id: 'c', text: '上司に報告する' },
            { id: 'd', text: '何もしない' },
          ],
          correctId: 'b',
          explanation: '数値は必ず復唱確認してから記録する。「37.8、145の92ですね」と確認後に記録。',
          difficulty: 'easy' as const,
        },
        {
          question: '「準備しとくね」の正式な表現は？',
          options: [
            { id: 'a', text: '準備してしまうね' },
            { id: 'b', text: '準備しておくね' },
            { id: 'c', text: '準備してみるね' },
            { id: 'd', text: '準備してくるね' },
          ],
          correctId: 'b',
          explanation: '「しとく」=「しておく」の口語省略形。事前にやっておくの意味。',
          difficulty: 'easy' as const,
        },
        {
          question: '申し送りで「至急」と書かれている項目は、いつ確認しますか？',
          options: [
            { id: 'a', text: '最後に確認する' },
            { id: 'b', text: '時間があれば確認する' },
            { id: 'c', text: '最初に最優先で確認する' },
            { id: 'd', text: '翌日確認する' },
          ],
          correctId: 'c',
          explanation: '「至急（しきゅう）」= khẩn cấp。申し送りの「至急」項目は最優先で確認・対応する。',
          difficulty: 'medium' as const,
        },
        {
          question: '利用者が「ちょっと…ナースコール押すの申し訳なくて…」と言っています。この人の気持ちは？',
          options: [
            { id: 'a', text: '怒っている' },
            { id: 'b', text: '全く問題ない' },
            { id: 'c', text: 'スタッフに遠慮して困っている' },
            { id: 'd', text: '早く帰りたい' },
          ],
          correctId: 'c',
          explanation: '「申し訳なくて（もうしわけなくて）」「ちょっと…」のためらい表現から、遠慮している気持ちが読み取れる。',
          difficulty: 'medium' as const,
        },
        {
          question: '「では来月の夜勤は4回にしましょう。ただし急な欠勤の際はご協力を」とありました。決まったことは？',
          options: [
            { id: 'a', text: '夜勤は今月と変わらない' },
            { id: 'b', text: '夜勤は4回、緊急時は協力する' },
            { id: 'c', text: '夜勤は0回' },
            { id: 'd', text: '欠勤は禁止' },
          ],
          correctId: 'b',
          explanation: '「では〜にしましょう」= quyết định。夜勤4回に決定。「ただし〜」= điều kiện。緊急時の協力が条件。',
          difficulty: 'hard' as const,
        },
      ],
      xpReward: 50,
    },
  },

  // ===== N4 漢字 =====
  'n4-05': {
    courseTitle: { ja: 'N4 漢字300字 完全習得', vi: 'Hoàn thiện 300 chữ Kanji N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4漢字: 薬・病・院・護・祉',
      titleTranslation: 'Kanji N4: Nhóm chữ Hán y tế và phúc lợi xã hội',
      introduction: `N4の300漢字のうち、介護・医療現場で特に使用頻度が高いグループを学びます。「薬・病・院・護・祉」は記録や書類で毎日目にする漢字です。

Học nhóm Kanji N4 dùng nhiều nhất trong y tế và điều dưỡng. 薬・病・院・護・祉 xuất hiện hàng ngày trong hồ sơ và tài liệu.`,
      keyPoints: [
        '薬（くすり・やく）: 薬・薬局・薬剤師',
        '病（やまい・びょう）: 病気・病院・病棟',
        '院（いん）: 病院・入院・退院・転院',
        '護（ご）: 介護・看護・保護',
        '祉（し）: 福祉・社会福祉',
      ],
      vocabulary: [
        { word: '薬局', reading: 'やっきょく', meaning: '薬を売る店（nhà thuốc）', example: '薬局で薬を受け取る' },
        { word: '病棟', reading: 'びょうとう', meaning: '入院患者のフロア（khu bệnh viện）', example: '病棟を巡回する' },
        { word: '入院', reading: 'にゅういん', meaning: '病院に入る（nhập viện）', example: '来週入院します' },
        { word: '看護', reading: 'かんご', meaning: '病気の人の世話（điều dưỡng）', example: '看護師に報告する' },
        { word: '福祉', reading: 'ふくし', meaning: '人々の幸福（phúc lợi）', example: '社会福祉法人' },
        { word: '退院', reading: 'たいいん', meaning: '病院を出る（xuất viện）', example: '来月退院の予定' },
      ],
      examples: [
        { japanese: '病院で薬をもらい、薬局で受け取りました。', reading: 'びょういんでくすりをもらい、やっきょくでうけとりました。', translation: 'Được kê thuốc ở bệnh viện và nhận tại nhà thuốc.' },
        { japanese: '介護福祉士の資格を取るために勉強しています。', reading: 'かいごふくしし のしかくをとるためにべんきょうしています。', translation: 'Đang học để lấy chứng chỉ điều dưỡng viên phúc lợi.' },
      ],
      grammarNote: `【部首で覚える医療漢字】
疒（やまいだれ）= 病気に関係: 病・痛・疲・療
月（にくづき）= 体の部位: 体・腕・脚・胸・腰

部首を知ると新しい漢字の意味が推測できます！`,
      quiz: {
        question: '「入院」の反対語は？',
        options: [
          { id: 'a', text: '通院' },
          { id: 'b', text: '病院' },
          { id: 'c', text: '退院' },
          { id: 'd', text: '転院' },
        ],
        correctId: 'c',
        explanation: '入院（にゅういん）の反対は退院（たいいん）。通院は病院に通うこと、転院は別の病院に移ること。\nTrái nghĩa của 入院 là 退院 (xuất viện).',
      },
      xpReward: 25,
    },
  },

  'n4-05-2': {
    courseTitle: { ja: 'N4 漢字300字 完全習得', vi: 'Hoàn thiện 300 chữ Kanji N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4漢字②: 体・頭・手・足・口',
      titleTranslation: 'Kanji N4②: Nhóm chữ Hán bộ phận cơ thể',
      introduction: `身体の部位を表す漢字グループです。介護現場では毎日使う必須の漢字です。「頭が痛い・手を洗う・足のむくみ・口腔ケア」など、報告や日常会話で頻繁に登場します。

Nhóm Kanji chỉ bộ phận cơ thể. Trong điều dưỡng, đây là những chữ dùng hàng ngày. 頭が痛い, 手を洗う, 足のむくみ, 口腔ケア... xuất hiện thường xuyên trong báo cáo và hội thoại.`,
      keyPoints: [
        '体（からだ・たい）: 体温・体重・身体・全体',
        '頭（あたま・とう/ず）: 頭痛・頭部・洗頭',
        '手（て・しゅ）: 手洗い・手術・助手・握手',
        '足（あし・そく）: 足元・足浴・歩行・不足',
        '口（くち・こう）: 口腔・口臭・開口・入口',
      ],
      vocabulary: [
        { word: '体温', reading: 'たいおん', meaning: '体の温度（thân nhiệt）', example: '体温を測る' },
        { word: '頭痛', reading: 'ずつう', meaning: '頭が痛い（đau đầu）', example: '頭痛を訴えている' },
        { word: '手洗い', reading: 'てあらい', meaning: '手を洗うこと（rửa tay）', example: '食事前に手洗いをする' },
        { word: '足浴', reading: 'そくよく', meaning: '足を湯につける（ngâm chân）', example: '足浴でリラックスする' },
        { word: '口腔ケア', reading: 'こうくうケア', meaning: '口の中の清潔（chăm sóc khoang miệng）', example: '食後に口腔ケアを行う' },
        { word: '体重', reading: 'たいじゅう', meaning: '体の重さ（cân nặng）', example: '体重が減少している' },
      ],
      examples: [
        { japanese: '体温は36.5度で、頭痛の訴えがありました。', reading: 'たいおんは36.5どで、ずつうのうったえがありました。', translation: 'Thân nhiệt 36.5 độ, có phàn nàn về đau đầu.' },
        { japanese: '食事前に手洗いと口腔ケアを忘れずに行います。', reading: 'しょくじまえにてあらいとこうくうケアをわすれずにおこないます。', translation: 'Trước bữa ăn, không quên rửa tay và chăm sóc khoang miệng.' },
        { japanese: '足のむくみが見られるので、足浴を提案しました。', reading: 'あしのむくみがみられるので、そくよくをていあんしました。', translation: 'Thấy chân bị phù nên đề xuất ngâm chân.' },
      ],
      grammarNote: `【体の部位 + する = 動作を表す】
体温を「測る」、手を「洗う」、足を「浴びる」、口を「ゆすぐ」

動詞とセットで覚えると現場で使いやすい！
Học kèm động từ sẽ dễ dùng hơn trong thực tế!`,
      quiz: {
        question: '「口腔ケア」の読み方は？',
        options: [
          { id: 'a', text: 'くちこうケア' },
          { id: 'b', text: 'こうくうケア' },
          { id: 'c', text: 'くちくうケア' },
          { id: 'd', text: 'こうこうケア' },
        ],
        correctId: 'b',
        explanation: '口腔（こうくう）は「口の中」の意味。口腔ケアは口の中の清潔を保つこと。\n口腔（こうくう）có nghĩa là "trong miệng". Phát âm: こうくう.',
      },
      xpReward: 25,
    },
  },

  'n4-05-3': {
    courseTitle: { ja: 'N4 漢字300字 完全習得', vi: 'Hoàn thiện 300 chữ Kanji N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4漢字③: 心・気・力・動・静',
      titleTranslation: 'Kanji N4③: Nhóm chữ Hán trạng thái và cảm xúc',
      introduction: `状態・感情・動作を表す重要な漢字グループです。利用者の精神状態や身体状態を記録・報告する際に必須です。「気分・活動・安静・心拍」など、ケア記録でよく使います。

Nhóm Kanji quan trọng chỉ trạng thái, cảm xúc và hành động. Cần thiết khi ghi chép, báo cáo tình trạng tinh thần và thể chất của người được chăm sóc. 気分・活動・安静・心拍 thường xuất hiện trong hồ sơ chăm sóc.`,
      keyPoints: [
        '心（こころ・しん）: 心拍・安心・心配・心身',
        '気（き・げ）: 気分・元気・気持ち・気力',
        '力（ちから・りょく）: 筋力・体力・活力・努力',
        '動（うごく・どう）: 活動・運動・動作・移動',
        '静（しずか・せい）: 安静・静脈・沈静・静養',
      ],
      vocabulary: [
        { word: '心拍', reading: 'しんぱく', meaning: '心臓の拍動（nhịp tim）', example: '心拍数を測定する' },
        { word: '気分', reading: 'きぶん', meaning: '体や心の状態（tâm trạng）', example: '気分が悪いと訴える' },
        { word: '筋力', reading: 'きんりょく', meaning: '筋肉の力（sức mạnh cơ bắp）', example: '筋力が低下している' },
        { word: '活動', reading: 'かつどう', meaning: '体を動かすこと（hoạt động）', example: '日中の活動量を増やす' },
        { word: '安静', reading: 'あんせい', meaning: '動かずに休む（nghỉ ngơi tĩnh dưỡng）', example: '安静にするよう伝える' },
        { word: '移動', reading: 'いどう', meaning: '場所を移ること（di chuyển）', example: '車椅子で移動する' },
      ],
      examples: [
        { japanese: '朝から気分が悪く、活動をお断りになりました。', reading: 'あさからきぶんがわるく、かつどうをおことわりになりました。', translation: 'Từ sáng sức khỏe không tốt, từ chối tham gia hoạt động.' },
        { japanese: '心拍数は82で安定しており、安静を保っています。', reading: 'しんぱくすうは82であんていしており、あんせいをたもっています。', translation: 'Nhịp tim 82 ổn định, đang nghỉ ngơi tĩnh dưỡng.' },
        { japanese: '筋力低下を防ぐため、毎日軽い運動を行います。', reading: 'きんりょくていかをふせぐため、まいにちかるいうんどうをおこないます。', translation: 'Để phòng suy giảm cơ, thực hiện vận động nhẹ hàng ngày.' },
      ],
      grammarNote: `【状態変化を表す表現】
〜が低下する（giảm）/ 〜が上昇する（tăng）/ 〜が改善する（cải thiện）

例: 筋力が低下する・血圧が上昇する・気分が改善する
記録文に欠かせない表現です！`,
      quiz: {
        question: '「安静」の意味は？',
        options: [
          { id: 'a', text: '活発に動くこと' },
          { id: 'b', text: '静かに休んで動かないこと' },
          { id: 'c', text: '気持ちが安定すること' },
          { id: 'd', text: '静かな環境にいること' },
        ],
        correctId: 'b',
        explanation: '安静（あんせい）は「動かずに静かに休む」こと。医師から「安静にしてください」と指示される。\n安静 nghĩa là "nghỉ yên, không vận động".',
      },
      xpReward: 25,
    },
  },

  'n4-05-4': {
    courseTitle: { ja: 'N4 漢字300字 完全習得', vi: 'Hoàn thiện 300 chữ Kanji N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4漢字④: 食・飲・水・栄・養',
      titleTranslation: 'Kanji N4④: Nhóm chữ Hán ăn uống và dinh dưỡng',
      introduction: `食事・栄養・水分に関する漢字グループです。介護現場では、利用者の食事介助・水分補給・栄養管理が重要な業務です。「食欲・飲水量・栄養状態」などの記録表現を覚えましょう。

Nhóm Kanji liên quan đến ăn uống, dinh dưỡng và nước. Trong điều dưỡng, hỗ trợ ăn uống, bổ sung nước và quản lý dinh dưỡng là công việc quan trọng. Hãy học các cách ghi chép 食欲・飲水量・栄養状態.`,
      keyPoints: [
        '食（たべる・しょく）: 食事・食欲・食後・絶食',
        '飲（のむ・いん）: 飲食・飲水・飲薬・服飲',
        '水（みず・すい）: 水分・飲水・水分補給',
        '栄（さかえる・えい）: 栄養・栄養士・栄養状態',
        '養（やしなう・よう）: 栄養・療養・養護・保養',
      ],
      vocabulary: [
        { word: '食欲', reading: 'しょくよく', meaning: '食べたい気持ち（cảm giác muốn ăn）', example: '食欲がない様子です' },
        { word: '飲水量', reading: 'いんすいりょう', meaning: '飲んだ水の量（lượng nước uống）', example: '飲水量が少ない' },
        { word: '栄養状態', reading: 'えいようじょうたい', meaning: '栄養の具合（tình trạng dinh dưỡng）', example: '栄養状態を改善する' },
        { word: '絶食', reading: 'ぜっしょく', meaning: '食事をしないこと（nhịn ăn）', example: '手術前は絶食です' },
        { word: '水分補給', reading: 'すいぶんほきゅう', meaning: '水分を補う（bổ sung nước）', example: 'こまめに水分補給をする' },
        { word: '食後', reading: 'しょくご', meaning: '食事の後（sau bữa ăn）', example: '食後に薬を飲む' },
      ],
      examples: [
        { japanese: '昼食は全量摂取できました。食欲は良好です。', reading: 'ちゅうしょくはぜんりょうせっしゅできました。しょくよくはりょうこうです。', translation: 'Bữa trưa ăn hết toàn bộ. Cảm giác ăn uống tốt.' },
        { japanese: '飲水量が少ないため、水分補給を促しました。', reading: 'いんすいりょうがすくないため、すいぶんほきゅうをうながしました。', translation: 'Do lượng nước uống ít nên đã nhắc nhở bổ sung nước.' },
        { japanese: '手術のため、今夜0時から絶食です。', reading: 'しゅじゅつのため、こんやぜろじからぜっしょくです。', translation: 'Do phẫu thuật, nhịn ăn từ 0 giờ tối nay.' },
      ],
      grammarNote: `【食事関連の数量表現】
全量（ぜんりょう）= 全部（toàn bộ）
半量（はんりょう）= 半分（một nửa）
少量（しょうりょう）= 少し（ít）

例: 「昼食は半量しか食べられませんでした」
記録でよく使うパターンです。`,
      quiz: {
        question: '「絶食」とはどういう意味ですか？',
        options: [
          { id: 'a', text: '少しだけ食べること' },
          { id: 'b', text: '好きなものを食べること' },
          { id: 'c', text: '食事をとらないこと' },
          { id: 'd', text: '流動食を食べること' },
        ],
        correctId: 'c',
        explanation: '絶食（ぜっしょく）は「食事をとらないこと」。手術前や検査前に指示されることが多い。\n絶食 nghĩa là "không ăn gì". Thường được chỉ định trước phẫu thuật hoặc xét nghiệm.',
      },
      xpReward: 25,
    },
  },

  'n4-05-5': {
    courseTitle: { ja: 'N4 漢字300字 完全習得', vi: 'Hoàn thiện 300 chữ Kanji N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4漢字⑤: 時・分・週・月・年',
      titleTranslation: 'Kanji N4⑤: Nhóm chữ Hán thời gian và lịch trình',
      introduction: `時間・日程に関する漢字グループです。介護記録では「何時に・何曜日に・何月何日」という日時の記録が基本です。シフトや予定の管理にも必要な漢字です。

Nhóm Kanji về thời gian và lịch trình. Trong hồ sơ điều dưỡng, ghi chép "lúc mấy giờ, ngày mấy tháng mấy" là cơ bản. Cũng cần thiết để quản lý ca làm việc và lịch trình.`,
      keyPoints: [
        '時（とき・じ）: 時間・時刻・何時・当時',
        '分（ふん・ぶん）: 何分・分単位・区分・十分',
        '週（しゅう）: 今週・来週・週間・毎週',
        '月（つき・げつ）: 今月・来月・月曜・毎月',
        '年（とし・ねん）: 今年・来年・年間・昨年',
      ],
      vocabulary: [
        { word: '時刻', reading: 'じこく', meaning: '何時何分という時間（thời điểm cụ thể）', example: '発生時刻を記録する' },
        { word: '週間', reading: 'しゅうかん', meaning: '1週間の期間（khoảng thời gian một tuần）', example: '2週間後に再評価する' },
        { word: '来月', reading: 'らいげつ', meaning: '次の月（tháng sau）', example: '来月退院の予定です' },
        { word: '毎日', reading: 'まいにち', meaning: '日々（mỗi ngày）', example: '毎日体温を測定する' },
        { word: '定期的', reading: 'ていきてき', meaning: '決まった間隔で（định kỳ）', example: '定期的に状態を確認する' },
        { word: '年間', reading: 'ねんかん', meaning: '1年の期間（trong một năm）', example: '年間計画を立てる' },
      ],
      examples: [
        { japanese: '発症時刻は午後2時30分ごろでした。', reading: 'はっしょうじこくはごご2じ30ぷんごろでした。', translation: 'Thời điểm phát bệnh là khoảng 14:30.' },
        { japanese: '毎週月曜日にカンファレンスがあります。', reading: 'まいしゅうげつようびにカンファレンスがあります。', translation: 'Mỗi tuần thứ Hai có hội thảo ca làm việc.' },
        { japanese: '来月から新しいシフトに変更になります。', reading: 'らいげつからあたらしいシフトにへんこうになります。', translation: 'Từ tháng sau sẽ thay đổi ca làm việc mới.' },
      ],
      grammarNote: `【時間の記録パターン】
〜時〜分に + 動詞 = 「10時30分に服薬しました」
〜から〜まで = 期間「9時から17時まで勤務」
〜ごろ = だいたいの時刻「14時ごろ転倒」

正確な時間記録は介護の基本！`,
      quiz: {
        question: '「定期的」の意味は？',
        options: [
          { id: 'a', text: '毎日同じ時間に' },
          { id: 'b', text: '一定の間隔を置いて繰り返す' },
          { id: 'c', text: '週に1回' },
          { id: 'd', text: '月に1回' },
        ],
        correctId: 'b',
        explanation: '定期的（ていきてき）は「一定の間隔で繰り返す」こと。毎日・毎週・毎月など、間隔は状況による。\n定期的 nghĩa là "lặp đi lặp lại theo chu kỳ nhất định".',
      },
      xpReward: 25,
    },
  },

  'n4-05-6': {
    courseTitle: { ja: 'N4 漢字300字 完全習得', vi: 'Hoàn thiện 300 chữ Kanji N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4漢字⑥: 人・者・員・師・士',
      titleTranslation: 'Kanji N4⑥: Nhóm chữ Hán chỉ người và chức danh',
      introduction: `職場の人々・職種を表す漢字グループです。介護施設では多職種が連携して働きます。「介護福祉士・看護師・医師・管理者・利用者」など、職種や役職を正確に書けることが重要です。

Nhóm Kanji chỉ người và chức danh trong công việc. Tại cơ sở điều dưỡng, nhiều chuyên ngành phối hợp làm việc. Quan trọng là viết đúng tên chức danh như 介護福祉士・看護師・医師・管理者・利用者.`,
      keyPoints: [
        '人（ひと・じん・にん）: 人員・老人・個人・本人',
        '者（もの・しゃ）: 利用者・患者・高齢者・介護者',
        '員（いん）: 職員・看護員・施設員・全員',
        '師（し）: 看護師・医師・薬剤師・栄養士',
        '士（し）: 介護福祉士・理学療法士・栄養士',
      ],
      vocabulary: [
        { word: '利用者', reading: 'りようしゃ', meaning: 'サービスを受ける人（người sử dụng dịch vụ）', example: '利用者さんのご家族に連絡する' },
        { word: '職員', reading: 'しょくいん', meaning: '施設で働く人（nhân viên）', example: '職員全員が参加する' },
        { word: '看護師', reading: 'かんごし', meaning: '医療ケアを行う専門職（y tá）', example: '看護師に相談する' },
        { word: '介護福祉士', reading: 'かいごふくしし', meaning: '介護の国家資格（hộ lý có bằng cấp quốc gia）', example: '介護福祉士の資格を取得した' },
        { word: '高齢者', reading: 'こうれいしゃ', meaning: '年齢の高い人（người cao tuổi）', example: '高齢者施設で働く' },
        { word: '担当者', reading: 'たんとうしゃ', meaning: '担当する人（người phụ trách）', example: '担当者に引き継ぐ' },
      ],
      examples: [
        { japanese: '利用者さんの状態変化を看護師に報告しました。', reading: 'りようしゃさんのじょうたいへんかをかんごしにほうこくしました。', translation: 'Đã báo cáo sự thay đổi tình trạng của người dùng cho y tá.' },
        { japanese: '職員全員で申し送りを確認します。', reading: 'しょくいんぜんいんでもうしおくりをかくにんします。', translation: 'Toàn bộ nhân viên xác nhận bàn giao ca.' },
        { japanese: '介護福祉士の先輩に相談しました。', reading: 'かいごふくしし のせんぱいにそうだんしました。', translation: 'Đã tham khảo ý kiến của đàn anh/chị hộ lý phúc lợi xã hội.' },
      ],
      grammarNote: `【人を表す接尾語まとめ】
〜者（しゃ）: 利用者・患者・高齢者・担当者
〜師（し）: 看護師・医師・薬剤師（専門資格）
〜士（し）: 介護福祉士・理学療法士（国家資格）
〜員（いん）: 職員・委員・係員（所属・役割）

施設内の人を正確に表現できるようにしよう！`,
      quiz: {
        question: '「利用者」の読み方は？',
        options: [
          { id: 'a', text: 'りゆうしゃ' },
          { id: 'b', text: 'りようしゃ' },
          { id: 'c', text: 'りようじゃ' },
          { id: 'd', text: 'りゅうしゃ' },
        ],
        correctId: 'b',
        explanation: '利用者（りようしゃ）。「利用」は「使うこと」、「者」は「人」。サービスを使う人のこと。\n利用者 = người sử dụng dịch vụ. Đọc là りようしゃ.',
      },
      xpReward: 25,
    },
  },

  'n4-05-7': {
    courseTitle: { ja: 'N4 漢字300字 完全習得', vi: 'Hoàn thiện 300 chữ Kanji N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4漢字⑦: 書・読・記・録・報',
      titleTranslation: 'Kanji N4⑦: Nhóm chữ Hán ghi chép và báo cáo',
      introduction: `介護記録・報告に関わる最重要漢字グループです。毎日の業務で「記録を書く・報告する・申し送りを読む」などに使います。この5字をマスターすれば記録業務が格段に楽になります。

Nhóm Kanji quan trọng nhất liên quan đến ghi chép và báo cáo điều dưỡng. Hàng ngày dùng trong "viết hồ sơ, báo cáo, đọc bàn giao ca". Thành thạo 5 chữ này, công việc ghi chép sẽ dễ hơn rất nhiều.`,
      keyPoints: [
        '書（かく・しょ）: 記録を書く・書類・文書',
        '読（よむ・どく）: 申し送りを読む・読解・黙読',
        '記（きろく・き）: 記録・記入・日記・記念',
        '録（ろく）: 記録・録音・目録・記録簿',
        '報（ほう）: 報告・情報・報道・急報',
      ],
      vocabulary: [
        { word: '記録', reading: 'きろく', meaning: '書き留めること（ghi chép）', example: 'ケア記録を記入する' },
        { word: '報告', reading: 'ほうこく', meaning: '知らせること（báo cáo）', example: '上司に報告する' },
        { word: '書類', reading: 'しょるい', meaning: '文書（tài liệu, giấy tờ）', example: '書類に署名する' },
        { word: '記入', reading: 'きにゅう', meaning: '書き入れること（điền vào）', example: '記録用紙に記入する' },
        { word: '情報', reading: 'じょうほう', meaning: '知らせ・データ（thông tin）', example: '利用者情報を共有する' },
        { word: '文書', reading: 'ぶんしょ', meaning: '公式な書類（văn bản chính thức）', example: '文書で保存する' },
      ],
      examples: [
        { japanese: '記録を正確に記入し、上司に報告しました。', reading: 'きろくをせいかくにきにゅうし、じょうしにほうこくしました。', translation: 'Điền hồ sơ chính xác và báo cáo cho cấp trên.' },
        { japanese: '申し送りを読んで、利用者さんの情報を確認します。', reading: 'もうしおくりをよんで、りようしゃさんのじょうほうをかくにんします。', translation: 'Đọc bàn giao ca và xác nhận thông tin về người được chăm sóc.' },
        { japanese: '書類はすべてファイルに保管します。', reading: 'しょるいはすべてファイルにほかんします。', translation: 'Tất cả tài liệu được lưu trữ trong hồ sơ.' },
      ],
      grammarNote: `【記録に使う動詞パターン】
記録する / 記入する（điền, ghi）
報告する（báo cáo）
確認する（xác nhận）
共有する（chia sẻ）

例: 「状態変化を記録し、看護師に報告しました。」
この流れを覚えよう！`,
      quiz: {
        question: '「記入」の意味は？',
        options: [
          { id: 'a', text: '書いた内容を消すこと' },
          { id: 'b', text: '所定の欄に書き込むこと' },
          { id: 'c', text: '記録を読むこと' },
          { id: 'd', text: '情報を共有すること' },
        ],
        correctId: 'b',
        explanation: '記入（きにゅう）は「決められた欄・フォームに書き込むこと」。記録用紙の空欄を埋めるイメージ。\n記入 = điền vào chỗ trống, ô nhất định.',
      },
      xpReward: 25,
    },
  },

  'n4-05-8': {
    courseTitle: { ja: 'N4 漢字300字 完全習得', vi: 'Hoàn thiện 300 chữ Kanji N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4漢字⑧: 安・全・危・急・緊',
      titleTranslation: 'Kanji N4⑧: Nhóm chữ Hán an toàn và khẩn cấp',
      introduction: `安全・危険・緊急に関わる漢字グループです。介護現場での事故防止・緊急対応に不可欠な語彙です。「安全確認・危険防止・緊急連絡・急変対応」など、命に関わる重要な表現を覚えましょう。

Nhóm Kanji liên quan đến an toàn, nguy hiểm và khẩn cấp. Không thể thiếu trong phòng ngừa tai nạn và ứng phó khẩn cấp tại cơ sở điều dưỡng. Học các biểu đạt quan trọng liên quan đến tính mạng như 安全確認・危険防止・緊急連絡・急変対応.`,
      keyPoints: [
        '安（やすい・あん）: 安全・安静・安心・安定',
        '全（ぜん・まったく）: 安全・全体・全員・完全',
        '危（あぶない・き）: 危険・危機・危篤・危害',
        '急（いそぐ・きゅう）: 急変・緊急・急性・急病',
        '緊（きん）: 緊急・緊張・緊迫・緊密',
      ],
      vocabulary: [
        { word: '安全確認', reading: 'あんぜんかくにん', meaning: '安全かどうか確かめること（kiểm tra an toàn）', example: '移動前に安全確認をする' },
        { word: '危険', reading: 'きけん', meaning: 'あぶないこと（nguy hiểm）', example: '転倒の危険がある' },
        { word: '急変', reading: 'きゅうへん', meaning: '状態が急に変わること（thay đổi đột ngột）', example: '急変したので救急車を呼んだ' },
        { word: '緊急連絡', reading: 'きんきゅうれんらく', meaning: '急いで知らせること（liên lạc khẩn cấp）', example: '緊急連絡先に電話した' },
        { word: '危篤', reading: 'きとく', meaning: '命が危ない状態（tình trạng nguy kịch）', example: '危篤状態になりご家族に連絡した' },
        { word: '安定', reading: 'あんてい', meaning: '変化なく落ち着いている（ổn định）', example: 'バイタルは安定しています' },
      ],
      examples: [
        { japanese: '移乗の前には必ず安全確認を行います。', reading: 'いじょうのまえにはかならずあんぜんかくにんをおこないます。', translation: 'Trước khi chuyển giường nhất thiết phải kiểm tra an toàn.' },
        { japanese: '急変したため、すぐに看護師に連絡しました。', reading: 'きゅうへんしたため、すぐにかんごしにれんらくしました。', translation: 'Do thay đổi đột ngột nên lập tức liên lạc y tá.' },
        { japanese: '転倒の危険があるので、一人にしないでください。', reading: 'てんとうのきけんがあるので、ひとりにしないでください。', translation: 'Vì có nguy cơ ngã nên không để một mình.' },
      ],
      grammarNote: `【緊急時の報告フレーズ】
「〜さんが急変しました。すぐに来てください。」
「〜さんが転倒しました。意識はあります。」
「救急車を呼びます。119番します。」

緊急時はシンプルに・大きな声で！
Khi khẩn cấp: nói đơn giản, to và rõ ràng!`,
      quiz: {
        question: '「急変」とはどういう意味ですか？',
        options: [
          { id: 'a', text: '少しずつ変わること' },
          { id: 'b', text: '予定が変わること' },
          { id: 'c', text: '状態が突然・急に変化すること' },
          { id: 'd', text: '気分が変わること' },
        ],
        correctId: 'c',
        explanation: '急変（きゅうへん）は「状態が急に・突然変わること」。特に容体が急に悪化する場合に使う。\n急変 = thay đổi đột ngột trạng thái (thường là xấu đi).',
      },
      xpReward: 25,
    },
  },

  'n4-05-9': {
    courseTitle: { ja: 'N4 漢字300字 完全習得', vi: 'Hoàn thiện 300 chữ Kanji N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4漢字⑨: 家・室・所・場・区',
      titleTranslation: 'Kanji N4⑨: Nhóm chữ Hán địa điểm và không gian',
      introduction: `施設内の場所・空間を表す漢字グループです。「居室・食堂・浴室・処置室・詰所」など、介護施設内の場所を正確に書けることは日常業務に欠かせません。

Nhóm Kanji chỉ địa điểm và không gian trong cơ sở. Viết đúng tên các nơi trong cơ sở điều dưỡng như 居室・食堂・浴室・処置室・詰所 là không thể thiếu trong công việc hàng ngày.`,
      keyPoints: [
        '家（いえ・か）: 家族・家庭・退家・帰家',
        '室（しつ）: 居室・浴室・処置室・相談室',
        '所（ところ・しょ）: 詰所・事業所・台所・近所',
        '場（ば・じょう）: 食堂・現場・立場・入浴場',
        '区（く）: 区別・地区・区域・担当区',
      ],
      vocabulary: [
        { word: '居室', reading: 'きょしつ', meaning: '利用者が生活する部屋（phòng ở của người được chăm sóc）', example: '居室に戻っていただく' },
        { word: '浴室', reading: 'よくしつ', meaning: 'お風呂の部屋（phòng tắm）', example: '浴室の安全を確認する' },
        { word: '詰所', reading: 'つめしょ', meaning: 'スタッフが待機する場所（nơi nhân viên trực）', example: '詰所に戻って報告する' },
        { word: '処置室', reading: 'しょちしつ', meaning: '医療処置を行う部屋（phòng xử lý y tế）', example: '処置室で手当てをする' },
        { word: '食堂', reading: 'しょくどう', meaning: '食事をする場所（phòng ăn）', example: '食堂に案内する' },
        { word: '事業所', reading: 'じぎょうしょ', meaning: 'サービスを提供する施設（cơ sở cung cấp dịch vụ）', example: '事業所に電話する' },
      ],
      examples: [
        { japanese: '入浴後、利用者さんを居室にお送りしました。', reading: 'にゅうよくご、りようしゃさんをきょしつにおおくりしました。', translation: 'Sau khi tắm, đưa người được chăm sóc về phòng ở.' },
        { japanese: '何か変化があれば詰所に連絡してください。', reading: 'なにかへんかがあればつめしょにれんらくしてください。', translation: 'Nếu có gì thay đổi, hãy liên lạc về phòng trực.' },
        { japanese: '食堂で昼食を召し上がっていただきました。', reading: 'しょくどうでちゅうしょくをめしあがっていただきました。', translation: 'Đã dùng bữa trưa tại phòng ăn.' },
      ],
      grammarNote: `【施設内の主要な場所】
居室（きょしつ）= 利用者の部屋
食堂（しょくどう）= 食事の場所
浴室（よくしつ）= お風呂
詰所（つめしょ）= スタッフルーム
処置室（しょちしつ）= 医療ケアの部屋

まず施設内の地図を頭に描こう！
Hãy hình dung bản đồ trong cơ sở!`,
      quiz: {
        question: '「詰所」とはどこですか？',
        options: [
          { id: 'a', text: '利用者の部屋' },
          { id: 'b', text: 'スタッフが待機・作業する場所' },
          { id: 'c', text: '浴室' },
          { id: 'd', text: '食事をする場所' },
        ],
        correctId: 'b',
        explanation: '詰所（つめしょ）は「スタッフが待機・記録作業などを行う場所」。ナースステーションに相当することが多い。\n詰所 = nơi nhân viên trực và làm việc.',
      },
      xpReward: 25,
    },
  },

  'n4-05-10': {
    courseTitle: { ja: 'N4 漢字300字 完全習得', vi: 'Hoàn thiện 300 chữ Kanji N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4漢字⑩: 仕・事・作・業・働',
      titleTranslation: 'Kanji N4⑩: Nhóm chữ Hán công việc và nghề nghiệp',
      introduction: `仕事・業務・作業に関する漢字グループです。介護の現場では「業務日誌・作業手順・仕事内容」などを理解・記述する機会が多くあります。職場での会話でも頻出の漢字です。

Nhóm Kanji liên quan đến công việc, nghiệp vụ và thao tác. Tại cơ sở điều dưỡng, có nhiều cơ hội hiểu và ghi chép 業務日誌・作業手順・仕事内容. Cũng là Kanji xuất hiện nhiều trong hội thoại tại nơi làm việc.`,
      keyPoints: [
        '仕（し）: 仕事・仕方・奉仕・給仕',
        '事（こと・じ）: 仕事・業務・大事・事故',
        '作（つくる・さく）: 作業・作成・作る・作法',
        '業（ぎょう）: 業務・作業・事業・職業',
        '働（はたらく）: 労働・働く・実働・勤働',
      ],
      vocabulary: [
        { word: '業務', reading: 'ぎょうむ', meaning: '仕事・職務（công việc, nhiệm vụ）', example: '業務内容を確認する' },
        { word: '作業', reading: 'さぎょう', meaning: '具体的な仕事の動作（thao tác cụ thể）', example: '清掃作業を行う' },
        { word: '仕事内容', reading: 'しごとないよう', meaning: '業務の詳細（nội dung công việc）', example: '仕事内容を引き継ぐ' },
        { word: '作成', reading: 'さくせい', meaning: '書類などを作ること（lập, soạn thảo）', example: '記録を作成する' },
        { word: '業務日誌', reading: 'ぎょうむにっし', meaning: '仕事の記録（nhật ký công việc）', example: '業務日誌に記録する' },
        { word: '労働', reading: 'ろうどう', meaning: '働くこと（lao động）', example: '労働時間を守る' },
      ],
      examples: [
        { japanese: '今日の業務内容を業務日誌に記録しました。', reading: 'きょうのぎょうむないようをぎょうむにっしにきろくしました。', translation: 'Đã ghi lại nội dung công việc hôm nay vào nhật ký công việc.' },
        { japanese: '清掃作業の手順を新入職員に説明しました。', reading: 'せいそうさぎょうのてじゅんをしんにゅうしょくいんにせつめいしました。', translation: 'Đã giải thích quy trình vệ sinh cho nhân viên mới.' },
        { japanese: '書類の作成に時間がかかりました。', reading: 'しょるいのさくせいにじかんがかかりました。', translation: 'Việc soạn thảo tài liệu mất nhiều thời gian.' },
      ],
      grammarNote: `【業務に関する複合語】
業務 + 日誌・連絡・内容・改善・管理
作業 + 手順・効率・分担・確認

パターンで覚えると応用が効く！
Học theo mẫu sẽ dễ ứng dụng!`,
      quiz: {
        question: '「作業」と「業務」の違いは？',
        options: [
          { id: 'a', text: '意味はほぼ同じで違いはない' },
          { id: 'b', text: '作業は具体的な動作、業務は職務全般' },
          { id: 'c', text: '作業は室内、業務は屋外の仕事' },
          { id: 'd', text: '作業は上司、業務は部下が使う言葉' },
        ],
        correctId: 'b',
        explanation: '作業（さぎょう）は「具体的な動作・手作業」、業務（ぎょうむ）は「職務全般・仕事全体」を指す傾向がある。\n作業 = thao tác cụ thể; 業務 = toàn bộ công việc/nhiệm vụ.',
      },
      xpReward: 25,
    },
  },

  'n4-05-11': {
    courseTitle: { ja: 'N4 漢字300字 完全習得', vi: 'Hoàn thiện 300 chữ Kanji N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4漢字⑪: 高・低・増・減・変',
      titleTranslation: 'Kanji N4⑪: Nhóm chữ Hán chỉ thay đổi và mức độ',
      introduction: `数値の変化・状態の増減を表す漢字グループです。バイタルサインの記録や状態観察で毎日使います。「血圧が高い・体重が減少・状態が変化」など、ケア記録の核心となる表現です。

Nhóm Kanji chỉ sự thay đổi và tăng giảm. Dùng hàng ngày trong ghi chép sinh hiệu và quan sát trạng thái. 血圧が高い・体重が減少・状態が変化 là những biểu đạt cốt lõi trong hồ sơ chăm sóc.`,
      keyPoints: [
        '高（たかい・こう）: 高血圧・高齢・高温・最高',
        '低（ひくい・てい）: 低血圧・低下・低体温・最低',
        '増（ふえる・ぞう）: 増加・増減・増量・急増',
        '減（へる・げん）: 減少・削減・減量・漸減',
        '変（かわる・へん）: 変化・変更・変動・急変',
      ],
      vocabulary: [
        { word: '高血圧', reading: 'こうけつあつ', meaning: '血圧が高い状態（cao huyết áp）', example: '高血圧の管理をする' },
        { word: '低下', reading: 'ていか', meaning: '下がること（giảm xuống）', example: '筋力が低下している' },
        { word: '増加', reading: 'ぞうか', meaning: '増えること（tăng lên）', example: '体重が増加した' },
        { word: '減少', reading: 'げんしょう', meaning: '減ること（giảm đi）', example: '食事量が減少した' },
        { word: '変化', reading: 'へんか', meaning: '変わること（thay đổi）', example: '状態に変化があった' },
        { word: '変更', reading: 'へんこう', meaning: '変えること（thay đổi kế hoạch）', example: '予定を変更する' },
      ],
      examples: [
        { japanese: '今朝から血圧が高く、168/95でした。', reading: 'けさからけつあつがたかく、168/95でした。', translation: 'Từ sáng huyết áp cao, ở mức 168/95.' },
        { japanese: '先週から食事量が減少し、体重も低下しています。', reading: 'せんしゅうからしょくじりょうがげんしょうし、たいじゅうもていかしています。', translation: 'Từ tuần trước lượng ăn giảm, cân nặng cũng giảm xuống.' },
        { japanese: '状態に変化があったため、ケアプランを変更します。', reading: 'じょうたいにへんかがあったため、ケアプランをへんこうします。', translation: 'Do có thay đổi tình trạng nên sẽ thay đổi kế hoạch chăm sóc.' },
      ],
      grammarNote: `【変化を表す表現パターン】
〜が高い／低い（mức độ）
〜が増加する／減少する（xu hướng）
〜が変化する（thay đổi）
〜が急変する（thay đổi đột ngột）

数値と組み合わせて記録に使おう！`,
      quiz: {
        question: '「低下」の反対の意味は？',
        options: [
          { id: 'a', text: '変化' },
          { id: 'b', text: '増加' },
          { id: 'c', text: '上昇' },
          { id: 'd', text: '安定' },
        ],
        correctId: 'c',
        explanation: '低下（ていか）は「下がること」なので、反対は上昇（じょうしょう）「上がること」。増加（ぞうか）は量が増えること。\n低下（giảm xuống）↔ 上昇（tăng lên）.',
      },
      xpReward: 25,
    },
  },

  'n4-05-12': {
    courseTitle: { ja: 'N4 漢字300字 完全習得', vi: 'Hoàn thiện 300 chữ Kanji N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4漢字⑫: 送・受・伝・連・知',
      titleTranslation: 'Kanji N4⑫: Nhóm chữ Hán truyền đạt và liên lạc',
      introduction: `伝達・連絡・情報共有に関する漢字グループです。申し送り・連絡帳・緊急連絡など、チームワークに欠かせないコミュニケーションの漢字です。正確に情報を伝えることが安全なケアにつながります。

Nhóm Kanji liên quan đến truyền đạt, liên lạc và chia sẻ thông tin. Đây là Kanji giao tiếp không thể thiếu trong bàn giao ca, sổ liên lạc, liên lạc khẩn cấp. Truyền đạt thông tin chính xác dẫn đến chăm sóc an toàn.`,
      keyPoints: [
        '送（おくる・そう）: 申し送り・送迎・送信・見送り',
        '受（うける・じゅ）: 受付・受診・受け取り・引き受け',
        '伝（つたえる・でん）: 伝達・口伝・伝言・伝える',
        '連（れん）: 連絡・連携・連続・関連',
        '知（しる・ち）: 知識・通知・認知・知らせ',
      ],
      vocabulary: [
        { word: '申し送り', reading: 'もうしおくり', meaning: '前の担当者から情報を伝えること（bàn giao ca）', example: '申し送りをしっかり聞く' },
        { word: '連絡', reading: 'れんらく', meaning: '知らせること（liên lạc）', example: 'ご家族に連絡する' },
        { word: '伝達', reading: 'でんたつ', meaning: '情報を伝えること（truyền đạt）', example: '会議内容を伝達する' },
        { word: '受診', reading: 'じゅしん', meaning: '医師の診察を受けること（đi khám）', example: '病院を受診する' },
        { word: '通知', reading: 'つうち', meaning: '知らせること（thông báo）', example: '変更を通知する' },
        { word: '連携', reading: 'れんけい', meaning: '協力して行動すること（phối hợp）', example: '多職種と連携する' },
      ],
      examples: [
        { japanese: '申し送りで夜間の状態変化を伝達しました。', reading: 'もうしおくりでやかんのじょうたいへんかをでんたつしました。', translation: 'Đã truyền đạt sự thay đổi trạng thái ban đêm trong bàn giao ca.' },
        { japanese: '急変のため、ご家族に緊急連絡をしました。', reading: 'きゅうへんのため、ごかぞくにきんきゅうれんらくをしました。', translation: 'Do thay đổi đột ngột, đã liên lạc khẩn cấp với gia đình.' },
        { japanese: '多職種と連携して、ケアプランを作成します。', reading: 'たしょくしゅとれんけいして、ケアプランをさくせいします。', translation: 'Phối hợp đa ngành để lập kế hoạch chăm sóc.' },
      ],
      grammarNote: `【連絡・伝達の基本表現】
〜に連絡する（liên lạc với〜）
〜を伝達する（truyền đạt〜）
〜を引き継ぐ（bàn giao〜）
〜と連携する（phối hợp với〜）

チームケアの基本！
Cơ bản của chăm sóc nhóm!`,
      quiz: {
        question: '「申し送り」の目的は？',
        options: [
          { id: 'a', text: '利用者さんへの挨拶' },
          { id: 'b', text: '職員間で情報を引き継ぐこと' },
          { id: 'c', text: '医師への報告' },
          { id: 'd', text: '家族への連絡' },
        ],
        correctId: 'b',
        explanation: '申し送り（もうしおくり）は「前の勤務者から次の勤務者へ情報を引き継ぐこと」。シフト交代時に行う。\n申し送り = bàn giao thông tin giữa các ca làm việc.',
      },
      xpReward: 25,
    },
  },

  'n4-05-13': {
    courseTitle: { ja: 'N4 漢字300字 完全習得', vi: 'Hoàn thiện 300 chữ Kanji N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4漢字⑬: 治・療・回・復・改',
      titleTranslation: 'Kanji N4⑬: Nhóm chữ Hán điều trị và hồi phục',
      introduction: `治療・回復・改善に関する漢字グループです。リハビリ・医療ケア・状態改善の文脈で頻繁に使います。「治療方針・回復期・改善計画」など、利用者のケア目標を表すのに重要な漢字です。

Nhóm Kanji liên quan đến điều trị, hồi phục và cải thiện. Dùng thường xuyên trong bối cảnh phục hồi chức năng, chăm sóc y tế, cải thiện tình trạng. 治療方針・回復期・改善計画 là Kanji quan trọng để diễn đạt mục tiêu chăm sóc.`,
      keyPoints: [
        '治（なおす・ち）: 治療・治癒・完治・自治',
        '療（りょう）: 治療・療養・療法・理学療法',
        '回（まわる・かい）: 回復・回数・今回・次回',
        '復（ふく）: 回復・復帰・復活・反復',
        '改（かえる・かい）: 改善・改正・改良・変改',
      ],
      vocabulary: [
        { word: '治療', reading: 'ちりょう', meaning: '病気を治すこと（điều trị）', example: '治療を続ける' },
        { word: '回復', reading: 'かいふく', meaning: '元の状態に戻ること（hồi phục）', example: '術後の回復が早い' },
        { word: '改善', reading: 'かいぜん', meaning: '状態が良くなること（cải thiện）', example: '症状が改善された' },
        { word: '療養', reading: 'りょうよう', meaning: '病気を治すための静養（dưỡng bệnh）', example: '自宅で療養する' },
        { word: '復帰', reading: 'ふっき', meaning: '元の状態・場所に戻ること（trở lại）', example: '職場に復帰する' },
        { word: '理学療法', reading: 'りがくりょうほう', meaning: '身体機能回復の治療（vật lý trị liệu）', example: '理学療法士によるリハビリ' },
      ],
      examples: [
        { japanese: '入院後、リハビリで順調に回復しています。', reading: 'にゅういんご、リハビリでじゅんちょうにかいふくしています。', translation: 'Sau khi nhập viện, đang phục hồi thuận lợi qua phục hồi chức năng.' },
        { japanese: '治療方針について、医師から説明がありました。', reading: 'ちりょうほうしんについて、いしからせつめいがありました。', translation: 'Bác sĩ đã giải thích về phương hướng điều trị.' },
        { japanese: '継続的なリハビリにより症状が改善されました。', reading: 'けいぞくてきなリハビリによりしょうじょうがかいぜんされました。', translation: 'Nhờ phục hồi chức năng liên tục, triệu chứng đã được cải thiện.' },
      ],
      grammarNote: `【リハビリ・回復に関する表現】
回復する（hồi phục）→ 回復が見られる・回復が遅い
改善する（cải thiện）→ 症状が改善する
維持する（duy trì）→ 現状を維持する
悪化する（xấu đi）→ 状態が悪化する

ケアの変化を正確に記録しよう！`,
      quiz: {
        question: '「理学療法」を行う専門職は？',
        options: [
          { id: 'a', text: '薬剤師（やくざいし）' },
          { id: 'b', text: '介護福祉士（かいごふくしし）' },
          { id: 'c', text: '理学療法士（りがくりょうほうし）' },
          { id: 'd', text: '栄養士（えいようし）' },
        ],
        correctId: 'c',
        explanation: '理学療法（りがくりょうほう）を行うのは理学療法士（PT）。身体機能の回復・維持が専門。\nNgười thực hiện 理学療法 là 理学療法士（PT - Physical Therapist）.',
      },
      xpReward: 25,
    },
  },

  'n4-05-14': {
    courseTitle: { ja: 'N4 漢字300字 完全習得', vi: 'Hoàn thiện 300 chữ Kanji N4' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N4漢字⑭: 確・認・注・意・確',
      titleTranslation: 'Kanji N4⑭: Nhóm chữ Hán xác nhận và chú ý',
      introduction: `確認・注意・意識に関する漢字グループです。安全なケアには「確認・注意・意識・認知」が欠かせません。事故防止の観点からも、これらの漢字を含む表現を正確に理解することが重要です。

Nhóm Kanji liên quan đến xác nhận, chú ý và ý thức. Để chăm sóc an toàn, không thể thiếu 確認・注意・意識・認知. Từ góc độ phòng ngừa tai nạn, hiểu chính xác các biểu đạt chứa các Kanji này rất quan trọng.`,
      keyPoints: [
        '確（たしか・かく）: 確認・確実・確定・明確',
        '認（みとめる・にん）: 確認・認知・認める・承認',
        '注（そそぐ・ちゅう）: 注意・注射・注目・注入',
        '意（い）: 注意・意識・意見・意味',
        '識（しき）: 意識・知識・認識・常識',
      ],
      vocabulary: [
        { word: '確認', reading: 'かくにん', meaning: '確かめること（xác nhận）', example: '安全を確認する' },
        { word: '注意', reading: 'ちゅうい', meaning: '気をつけること（chú ý, cẩn thận）', example: '転倒に注意する' },
        { word: '意識', reading: 'いしき', meaning: '気がついている状態（ý thức）', example: '意識がある・意識がない' },
        { word: '認知症', reading: 'にんちしょう', meaning: '記憶・認識機能が低下する病気（sa sầu）', example: '認知症の方への対応' },
        { word: '承認', reading: 'しょうにん', meaning: '認めること（phê duyệt）', example: '上司の承認を得る' },
        { word: '認識', reading: 'にんしき', meaning: '理解・把握すること（nhận thức）', example: '状況を正確に認識する' },
      ],
      examples: [
        { japanese: '与薬前に必ず本人確認をしてください。', reading: 'よやくまえにかならずほんにんかくにんをしてください。', translation: 'Trước khi cho dùng thuốc, nhất thiết phải xác nhận danh tính.' },
        { japanese: '認知症の方は、注意深く観察する必要があります。', reading: 'にんちしょうのかたは、ちゅういぶかくかんさつするひつようがあります。', translation: 'Đối với người bị sa sầu, cần quan sát cẩn thận.' },
        { japanese: '転倒後、意識の確認を行いました。', reading: 'てんとうご、いしきのかくにんをおこないました。', translation: 'Sau khi ngã, đã tiến hành kiểm tra ý thức.' },
      ],
      grammarNote: `【確認のチェックリスト表現】
〜を確認する（xác nhận〜）
〜に注意する（chú ý〜）
〜を意識する（ý thức về〜）

「5つのR」与薬確認:
Right Patient（本人確認）
Right Drug（薬確認）
Right Dose（用量確認）
Right Route（経路確認）
Right Time（時間確認）`,
      quiz: {
        question: '「意識がない」状態はどんな状態ですか？',
        options: [
          { id: 'a', text: '眠っている状態' },
          { id: 'b', text: '気がついていない・反応がない状態' },
          { id: 'c', text: '考えていない状態' },
          { id: 'd', text: '目を閉じている状態' },
        ],
        correctId: 'b',
        explanation: '意識がない（いしきがない）は「外部の刺激に反応しない・気がついていない状態」。緊急事態のサイン。\n意識がない = không có phản ứng với kích thích bên ngoài, là dấu hiệu khẩn cấp.',
      },
      xpReward: 25,
    },
  },

  'n4-05-15': {
    courseTitle: { ja: 'N4 漢字300字 完全習得', vi: 'Hoàn thiện 300 chữ Kanji N4' },
    isLocked: true,
    requiredPlan: 'premium',
    lesson: {
      title: 'N4漢字 総復習テスト〜300字マスター確認〜',
      titleTranslation: 'Kiểm tra tổng hợp Kanji N4 〜Xác nhận thành thạo 300 chữ〜',
      introduction: `N4漢字300字 完全習得コースの総仕上げです。医療・介護現場で使う漢字を総復習します。身体・食事・安全・記録・職場・変化・伝達・治療・確認の各グループから出題します。

Đây là bài kiểm tra tổng kết khóa học Hoàn thiện 300 chữ Kanji N4. Ôn lại tổng hợp các Kanji dùng trong y tế và điều dưỡng. Đề thi từ các nhóm: cơ thể, ăn uống, an toàn, ghi chép, nơi làm việc, thay đổi, truyền đạt, điều trị, xác nhận.`,
      keyPoints: [
        '医療・介護漢字の総まとめ（Tổng hợp Kanji y tế và điều dưỡng）',
        '読み方と意味の総確認（Xác nhận cách đọc và nghĩa）',
        '現場で使える複合語の定着（Ghi nhớ từ ghép dùng được ở thực tế）',
        '記録・報告文での応用（Ứng dụng trong văn ghi chép và báo cáo）',
        'N4試験レベルの問題に挑戦（Thử sức với câu hỏi cấp độ thi N4）',
      ],
      vocabulary: [
        { word: '看護師', reading: 'かんごし', meaning: '医療のケアを担う専門職（y tá）', example: '看護師に報告する' },
        { word: '急変', reading: 'きゅうへん', meaning: '状態が急に変わること（thay đổi đột ngột）', example: '急変時の対応' },
        { word: '口腔ケア', reading: 'こうくうケア', meaning: '口の中の清潔管理（chăm sóc khoang miệng）', example: '毎食後の口腔ケア' },
        { word: '改善', reading: 'かいぜん', meaning: '状態が良くなること（cải thiện）', example: '症状の改善' },
        { word: '確認', reading: 'かくにん', meaning: '確かめること（xác nhận）', example: '安全確認' },
        { word: '連携', reading: 'れんけい', meaning: '協力して行動すること（phối hợp）', example: '多職種連携' },
      ],
      examples: [
        { japanese: '急変した利用者さんを看護師に報告し、安全確認をしました。', reading: 'きゅうへんしたりようしゃさんをかんごしにほうこくし、あんぜんかくにんをしました。', translation: 'Đã báo cáo người dùng thay đổi đột ngột cho y tá và kiểm tra an toàn.' },
        { japanese: '多職種と連携して改善計画を作成しました。', reading: 'たしょくしゅとれんけいしてかいぜんけいかくをさくせいしました。', translation: 'Phối hợp đa ngành để lập kế hoạch cải thiện.' },
      ],
      grammarNote: `【N4漢字 総まとめ】
①身体: 体・頭・手・足・口
②食事: 食・飲・水・栄・養
③安全: 安・全・危・急・緊
④記録: 書・読・記・録・報
⑤人・職種: 人・者・員・師・士
⑥変化: 高・低・増・減・変
⑦連絡: 送・受・伝・連・知
⑧治療: 治・療・回・復・改
⑨確認: 確・認・注・意・識

N4漢字300字の習得、おめでとうございます！
Chúc mừng bạn đã hoàn thành 300 chữ Kanji N4!`,
      quizzes: [
        {
          question: '「口腔ケア」の正しい読み方は？',
          options: [
            { id: 'a', text: 'くちこうケア' },
            { id: 'b', text: 'こうくうケア' },
            { id: 'c', text: 'こうこうケア' },
            { id: 'd', text: 'くちくうケア' },
          ],
          correctId: 'b',
          explanation: '口腔（こうくう）= 口の中。口腔ケアは「お口の清潔管理」のこと。\n口腔（こうくう）= khoang miệng.',
          difficulty: 'easy' as const,
        },
        {
          question: '「急変」と同じグループの漢字は？',
          options: [
            { id: 'a', text: '安（あん）' },
            { id: 'b', text: '緊（きん）' },
            { id: 'c', text: '静（せい）' },
            { id: 'd', text: '低（てい）' },
          ],
          correctId: 'b',
          explanation: '急変（きゅうへん）の「急」と緊急（きんきゅう）の「緊」は安全・緊急グループ。\n急 và 緊 đều thuộc nhóm an toàn/khẩn cấp.',
          difficulty: 'medium' as const,
        },
        {
          question: '介護記録で「状態変化を〜し、看護師に〜した」という文の（）に入る動詞は？',
          options: [
            { id: 'a', text: '記録・報告' },
            { id: 'b', text: '確認・送迎' },
            { id: 'c', text: '改善・治療' },
            { id: 'd', text: '申し送り・連携' },
          ],
          correctId: 'a',
          explanation: '「状態変化を記録し、看護師に報告した」が正しいパターン。記録→報告の流れが基本。\nMẫu cơ bản: ghi chép (記録) → báo cáo (報告).',
          difficulty: 'medium' as const,
        },
        {
          question: '次のうち「職種」を表す漢字が入っていない言葉は？',
          options: [
            { id: 'a', text: '看護師' },
            { id: 'b', text: '栄養士' },
            { id: 'c', text: '利用者' },
            { id: 'd', text: '介護福祉士' },
          ],
          correctId: 'c',
          explanation: '利用者（りようしゃ）はサービスを受ける人で職種ではない。看護師・栄養士・介護福祉士は職種。\n利用者 là người sử dụng dịch vụ, không phải tên nghề.',
          difficulty: 'hard' as const,
        },
        {
          question: '「回復が見られない場合、治療方針を改善する」この文で使われている漢字グループの組み合わせは？',
          options: [
            { id: 'a', text: '治療グループ + 変化グループ' },
            { id: 'b', text: '安全グループ + 記録グループ' },
            { id: 'c', text: '身体グループ + 食事グループ' },
            { id: 'd', text: '連絡グループ + 確認グループ' },
          ],
          correctId: 'a',
          explanation: '回復・治療（治療グループ）と改善（変化グループ）の組み合わせ。複数グループの漢字が連携して使われる。\n回復・治療（nhóm điều trị）và 改善（nhóm thay đổi）kết hợp.',
          difficulty: 'hard' as const,
        },
      ],
      xpReward: 50,
    },
  },

  // ===== N3 文法・語彙 =====
  'n3-01': {
    courseTitle: { ja: 'N3 文法・語彙総まとめ', vi: 'Tổng hợp ngữ pháp & từ vựng N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3文法: 複合助詞〜に対して・〜について・〜によって',
      titleTranslation: 'Ngữ pháp N3: Trợ từ phức hợp 〜に対して・〜について・〜によって',
      introduction: `N3から複合助詞が増えます。「〜に対して・〜について・〜によって」はビジネス・職場・報告書など多くの場面で使います。介護現場では「利用者さんに対して丁寧に対応する」「状態の変化によって対応が変わる」など頻繁に使います。

Từ N3, trợ từ phức hợp tăng lên. 〜に対して・〜について・〜によって dùng trong nhiều tình huống như công việc, nơi làm việc, báo cáo. Trong điều dưỡng dùng thường xuyên như "対応利用者さんに対して丁寧に" hay "状態によって対応が変わる".`,
      keyPoints: [
        '〜に対して: 相手・対象への態度・行動（đối với, hướng tới）',
        '〜について: テーマ・話題（về, liên quan đến）',
        '〜によって: 手段・原因・違い（bởi, tùy theo, do）',
        '〜に関して: 〜についてのフォーマルな表現（liên quan đến, trang trọng hơn）',
        '〜をめぐって: 問題・議論の対象（xung quanh vấn đề）',
      ],
      vocabulary: [
        { word: '〜に対して', reading: 'にたいして', meaning: '〜に向けて（đối với）', example: '利用者さんに対して丁寧に話す' },
        { word: '〜について', reading: 'について', meaning: '〜のことで（về）', example: '薬について説明する' },
        { word: '〜によって', reading: 'によって', meaning: '〜で・〜に従って（do, tùy theo）', example: '状態によって対応が変わる' },
        { word: '〜に関して', reading: 'にかんして', meaning: '〜についての正式な表現（liên quan đến）', example: '契約に関して確認する' },
        { word: '丁寧', reading: 'ていねい', meaning: '礼儀正しい（lịch sự, cẩn thận）', example: '丁寧に対応する' },
      ],
      examples: [
        { japanese: '利用者さんに対して、常に敬語で話しましょう。', reading: 'りようしゃさんにたいして、つねにけいごではなしましょう。', translation: 'Hãy luôn nói kính ngữ với người được chăm sóc.' },
        { japanese: '認知症について、もっと勉強したいと思っています。', reading: 'にんちしょうについて、もっとべんきょうしたいとおもっています。', translation: 'Tôi muốn học thêm về chứng mất trí nhớ.' },
        { japanese: '体調によって、食事の量を調整します。', reading: 'たいちょうによって、しょくじのりょうをちょうせいします。', translation: 'Điều chỉnh lượng ăn tùy theo tình trạng sức khỏe.' },
      ],
      grammarNote: `【〜に対して / 〜について / 〜によって の違い】
に対して = 対象・相手に向けた行動・感情
  例：「患者に対して優しくする」
について = 話題・テーマ
  例：「薬について説明する」
によって = 手段・原因・人によって異なること
  例：「状態によって対応が異なる」`,
      quiz: {
        question: '「利用者さん（　）いつも丁寧に話しかけましょう」に入るのは？',
        options: [
          { id: 'a', text: 'によって' },
          { id: 'b', text: 'について' },
          { id: 'c', text: 'に対して' },
          { id: 'd', text: 'をめぐって' },
        ],
        correctId: 'c',
        explanation: '利用者さんへの態度・行動を示すので「に対して」が正解。「について」はテーマ、「によって」は手段・違い。\n「に対して」chỉ thái độ, hành động hướng tới đối tượng.',
      },
      xpReward: 30,
    },
  },

  // ===== N3 読解 =====
  'n3-02': {
    courseTitle: { ja: 'N3 読解練習 〜新聞・説明文〜', vi: 'Luyện đọc N3 - Báo và văn bản thông tin' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3読解: 説明文の構造を読む',
      titleTranslation: 'Đọc hiểu N3: Đọc cấu trúc văn bản thông tin',
      introduction: `N3の読解では、説明文・論説文・新聞記事などが出ます。「話題提示→説明→まとめ」という文章の流れを理解することが重要です。介護職では研修資料・ケアプラン・医療情報を読む機会が多いです。

Đọc hiểu N3 có văn bản thông tin, văn nghị luận, bài báo. Quan trọng là hiểu cấu trúc "đưa ra chủ đề → giải thích → tổng kết". Trong ngành điều dưỡng, thường xuyên đọc tài liệu đào tạo, kế hoạch chăm sóc, thông tin y tế.`,
      keyPoints: [
        '文章の構造：話題提示 → 説明・例示 → まとめ・主張',
        '話題文を見つける：段落の最初か最後の文が多い',
        '指示語に注意：「この・その・これ・それ」が何を指すか確認',
        '論理の流れ：「なぜなら・したがって・一方・しかし」',
        '筆者の主張を見つける：「〜と思う・〜べきだ・〜が大切だ」',
      ],
      vocabulary: [
        { word: '一方', reading: 'いっぽう', meaning: '他方・反対に（mặt khác）', example: '入院患者が増える一方、スタッフが不足している' },
        { word: 'したがって', reading: 'したがって', meaning: 'そのため（do đó）', example: 'したがって、予防が大切だ' },
        { word: '〜べき', reading: 'べき', meaning: '〜しなければならない（nên, phải）', example: '安全を確保すべきだ' },
        { word: 'なぜなら', reading: 'なぜなら', meaning: 'その理由は（vì rằng）', example: 'なぜなら高齢化が進んでいるからだ' },
        { word: '課題', reading: 'かだい', meaning: '問題・テーマ（vấn đề, thách thức）', example: '介護の課題は多い' },
      ],
      examples: [
        { japanese: '日本では高齢化が急速に進んでいる。したがって、介護士の需要が高まっている。外国人介護士の受け入れは、この課題への一つの解決策と言える。', reading: 'にほんではこうれいかがきゅうそくにすすんでいる。したがって、かいごしのじゅようがたかまっている。', translation: 'Nhật Bản đang già hóa dân số nhanh chóng. Do đó, nhu cầu điều dưỡng viên đang tăng cao. Tiếp nhận điều dưỡng viên nước ngoài có thể nói là một giải pháp cho thách thức này.' },
      ],
      grammarNote: `【説明文の読み方ステップ】
1. 段落の数を確認する
2. 各段落の最初の文を読む（トピックセンテンス）
3. 接続語（したがって・一方・なぜなら）を確認
4. 最終段落に筆者の主張が集中する

【N3頻出表現】
〜べきだ = should / 〜に違いない = must be
〜とは限らない = not always / 〜に過ぎない = nothing but`,
      quiz: {
        question: '「したがって」の使い方として正しいものは？',
        options: [
          { id: 'a', text: '二つの反対の事実を並べる' },
          { id: 'b', text: '前の内容の結果や結論を示す' },
          { id: 'c', text: '例外を示す' },
          { id: 'd', text: '質問を示す' },
        ],
        correctId: 'b',
        explanation: '「したがって」は前の内容から導かれる結論・結果を示す接続詞です。「そのため・だから」と同じ意味で、書き言葉でよく使います。\n「したがって」là liên từ chỉ kết quả/kết luận được rút ra từ nội dung trước.',
      },
      xpReward: 30,
    },
  },

  // ===== N3 聴解 =====
  'n3-03': {
    courseTitle: { ja: 'N3 聴解・速読トレーニング', vi: 'Luyện nghe & đọc nhanh N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3聴解: 長めの会話と場面理解',
      titleTranslation: 'Nghe hiểu N3: Hội thoại dài và hiểu bối cảnh',
      introduction: `N3の聴解では長めの会話・電話・アナウンスなどが出ます。「この会話はどんな場面か」「話者の感情・意図は何か」を理解することが求められます。介護現場では電話応対・申し送り・ケアカンファレンスでの会話理解が重要です。

Nghe hiểu N3 có hội thoại dài hơn, điện thoại, thông báo. Cần hiểu "đây là tình huống gì" và "cảm xúc, ý định của người nói là gì". Trong điều dưỡng, hiểu hội thoại qua điện thoại, bàn giao ca, hội nghị chăm sóc rất quan trọng.`,
      keyPoints: [
        '場面を把握：誰が誰に・どこで・何の目的で話しているか',
        '感情を読む：声のトーン・言葉遣いから感情を判断',
        '意図を理解：依頼・提案・断り・謝罪の区別',
        '長い会話：最初と最後に重要情報が集中することが多い',
        '間接表現：「〜ちょっと...」= 断り、「〜かもしれません」= 不確かさ',
      ],
      vocabulary: [
        { word: 'ご連絡', reading: 'ごれんらく', meaning: '連絡（liên lạc - kính ngữ）', example: 'ご連絡ありがとうございます' },
        { word: 'おかげさまで', reading: 'おかげさまで', meaning: 'Thanks to you（nhờ ơn）', example: 'おかげさまで元気です' },
        { word: '〜でございます', reading: 'でございます', meaning: '〜です の丁寧形（thể rất lịch sự）', example: '山田でございます' },
        { word: '承知しました', reading: 'しょうちしました', meaning: '分かりました（tôi hiểu rồi, formal）', example: '承知しました。すぐに対応します' },
        { word: '折り返す', reading: 'おりかえす', meaning: '電話を掛け直す（gọi lại）', example: '折り返しご連絡します' },
      ],
      examples: [
        { japanese: 'A：「田中さんのご家族の方から電話がありました」B：「分かりました。折り返しご連絡します」', reading: 'A：「たなかさんのごかぞくのかたからでんわがありました」B：「わかりました。おりかえしごれんらくします」', translation: 'A: "Gia đình ông Tanaka đã gọi điện" B: "Tôi hiểu. Tôi sẽ gọi lại."' },
        { japanese: 'A：「今日の申し送りですが、山田さんの血圧が高めです」B：「承知しました。注意して観察します」', reading: 'A：「きょうのもうしおくりですが、やまださんのけつあつがたかめです」B：「しょうちしました。ちゅういしてかんさつします」', translation: 'A: "Bàn giao hôm nay: huyết áp ông Yamada hơi cao" B: "Tôi hiểu. Tôi sẽ chú ý quan sát."' },
      ],
      grammarNote: `【電話応対の基本表現】
受ける：「はい、〇〇施設でございます」
確認する：「〇〇様でいらっしゃいますか？」
保留：「少々お待ちください」
折り返す：「折り返しご連絡いたします」
不在の場合：「ただいま席を外しております」`,
      quiz: {
        question: '「ちょっと...」と言うとき、話者の意図は？',
        options: [
          { id: 'a', text: '強い賛成' },
          { id: 'b', text: '遠回しな断り・困惑' },
          { id: 'c', text: '急いでいる' },
          { id: 'd', text: '怒っている' },
        ],
        correctId: 'b',
        explanation: '日本語の「ちょっと...（言いにくいことがある）」は遠回しな断りや困惑を表します。直接的な断りを避ける文化的表現です。\nTrong tiếng Nhật, "ちょっと..." thường là cách từ chối gián tiếp hoặc bày tỏ sự ngại ngùng.',
      },
      xpReward: 30,
    },
  },

  // ===== N3 語彙強化 =====
  'n3-04': {
    courseTitle: { ja: 'N3 語彙強化 〜カタカナ語・複合語〜', vi: 'Củng cố từ vựng N3 - Từ Katakana và từ ghép' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3語彙: 医療・介護のカタカナ語',
      titleTranslation: 'Từ vựng N3: Từ Katakana trong y tế và điều dưỡng',
      introduction: `医療・介護現場では多くのカタカナ語（外来語）が使われます。これらは英語が元になっているものが多いですが、発音や意味が英語と少し異なることもあります。よく使うカタカナ語をマスターすることで、現場での会話がスムーズになります。

Trong y tế và điều dưỡng, nhiều từ Katakana (từ ngoại lai) được dùng. Nhiều từ có gốc tiếng Anh nhưng đôi khi phát âm và nghĩa khác một chút. Nắm vững các từ Katakana thường dùng giúp giao tiếp tại nơi làm việc trơn tru hơn.`,
      keyPoints: [
        'バイタル（vital）: バイタルサイン — dấu hiệu sinh tồn',
        'ケア（care）: ケアプラン・ケアマネ — kế hoạch chăm sóc',
        'リハビリ（rehabilitation）: リハビリテーション の略 — phục hồi chức năng',
        'インシデント（incident）: 事故・ヒヤリハット — sự cố',
        'コミュニケーション（communication）: 意思疎通 — giao tiếp',
        'モニタリング（monitoring）: 状態確認 — theo dõi',
      ],
      vocabulary: [
        { word: 'バイタル', reading: 'ばいたる', meaning: '生命兆候（dấu hiệu sinh tồn）', example: '朝のバイタルを測る' },
        { word: 'リハビリ', reading: 'りはびり', meaning: '機能回復訓練（phục hồi chức năng）', example: 'リハビリの時間です' },
        { word: 'インシデント', reading: 'いんしでんと', meaning: '事故・ヒヤリハット（sự cố）', example: 'インシデントを報告する' },
        { word: 'モニタリング', reading: 'もにたりんぐ', meaning: '継続的な確認（giám sát, theo dõi）', example: '状態をモニタリングする' },
        { word: 'ケアプラン', reading: 'けあぷらん', meaning: '介護の計画書（kế hoạch chăm sóc）', example: 'ケアプランを作成する' },
      ],
      examples: [
        { japanese: '朝のバイタルを測ってから、リハビリの準備をします。', reading: 'あさのばいたるをはかってから、りはびりのじゅんびをします。', translation: 'Đo dấu hiệu sinh tồn buổi sáng xong rồi chuẩn bị cho phục hồi chức năng.' },
        { japanese: 'インシデントがあった場合、すぐに上司に報告してください。', reading: 'いんしでんとがあったばあい、すぐにじょうしにほうこくしてください。', translation: 'Nếu có sự cố, hãy báo cáo ngay với cấp trên.' },
      ],
      grammarNote: `【カタカナ語の作り方】
英語の長い単語は短く切る：
rehabilitation → リハビリ（リハビリテーション）
communication → コミュニケーション

【医療・介護でよく使うカタカナ語一覧】
バイタル / ケア / リハビリ / インシデント
モニタリング / カルテ / マニュアル / スタッフ
ミーティング / カンファレンス / ヒヤリハット`,
      quiz: {
        question: '「リハビリ」は何の略ですか？',
        options: [
          { id: 'a', text: 'リハビリテーション' },
          { id: 'b', text: 'リハビリタル' },
          { id: 'c', text: 'リハビリーション' },
          { id: 'd', text: 'リハビリント' },
        ],
        correctId: 'a',
        explanation: '「リハビリ」は「リハビリテーション（rehabilitation）」の略。身体・精神機能の回復訓練のことです。\n"リハビリ" là viết tắt của "リハビリテーション" (rehabilitation) — phục hồi chức năng.',
      },
      xpReward: 30,
    },
  },

  // ===== N2 読解 =====
  'n2-02': {
    courseTitle: { ja: 'N2 読解・論説文対策', vi: 'Đọc hiểu & văn nghị luận N2' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N2読解: 論説文の主張と根拠を読む',
      titleTranslation: 'Đọc hiểu N2: Đọc luận điểm và lý do trong văn nghị luận',
      introduction: `N2の読解では、筆者の主張・根拠・反論・結論という構造を持つ論説文が中心です。長い文章の中から「筆者が最も言いたいこと」を素早く見つける力が必要です。

Đọc hiểu N2 chủ yếu là văn nghị luận với cấu trúc: luận điểm → lý do → phản biện → kết luận. Cần kỹ năng nhanh chóng tìm "điều tác giả muốn nói nhất" trong bài dài.`,
      keyPoints: [
        '論説文の構造：主張→根拠→反論への応答→結論',
        '筆者の主張を見つける：「〜べきだ・〜ではないか・〜が重要だ」',
        '根拠の表現：「なぜなら・〜からだ・〜ためだ」',
        '反論への対応：「確かに〜しかし・〜とはいえ・〜ものの」',
        '結論の表現：「以上のことから・このように・したがって」',
      ],
      vocabulary: [
        { word: '主張', reading: 'しゅちょう', meaning: '意見・論点（luận điểm）', example: '筆者の主張を読み取る' },
        { word: '根拠', reading: 'こんきょ', meaning: '理由・証拠（lý do, căn cứ）', example: '根拠を示す' },
        { word: 'とはいえ', reading: 'とはいえ', meaning: 'しかし・それでも（tuy nhiên）', example: 'とはいえ、完全な解決は難しい' },
        { word: '以上のことから', reading: 'いじょうのことから', meaning: '以上の内容をまとめると（từ những điều trên）', example: '以上のことから、改善が必要だ' },
        { word: '一般的に', reading: 'いっぱんてきに', meaning: '普通は（thông thường）', example: '一般的に言えば' },
      ],
      examples: [
        { japanese: '高齢化社会において、介護の質向上は急務である。確かに費用の問題はある。とはいえ、人材育成への投資は不可欠だ。以上のことから、外国人介護士の積極的な受け入れが求められる。', reading: 'こうれいかしゃかいにおいて、かいごのしつこうじょうはきゅうむである。', translation: 'Trong xã hội già hóa, cải thiện chất lượng điều dưỡng là cấp bách. Tuy chi phí là vấn đề, nhưng đầu tư vào đào tạo nhân lực là không thể thiếu. Từ những điều trên, cần tích cực tiếp nhận điều dưỡng viên nước ngoài.' },
      ],
      grammarNote: `【論説文の典型的な流れ】
1. 問題提起（〜が問題である・〜が増えている）
2. 現状説明（現在〜の状況だ）
3. 筆者の主張（〜べきだ・〜が必要だ）
4. 根拠（なぜなら〜からだ）
5. 反論への応答（確かに〜。とはいえ〜）
6. 結論（以上のことから〜）`,
      quiz: {
        question: '論説文で筆者の主張を示す表現は？',
        options: [
          { id: 'a', text: 'なぜなら〜からだ' },
          { id: 'b', text: '確かに〜しかし' },
          { id: 'c', text: '〜べきだ・〜が重要だ' },
          { id: 'd', text: '一般的に言えば' },
        ],
        correctId: 'c',
        explanation: '「〜べきだ・〜が重要だ」は筆者の意見・主張を示す表現。「なぜなら」は根拠、「確かに〜しかし」は反論への対応、「一般的に」は一般論を示します。\n「〜べきだ」biểu thị ý kiến, luận điểm của tác giả.',
      },
      xpReward: 35,
    },
  },

  // ===== N2 聴解 =====
  'n2-03': {
    courseTitle: { ja: 'N2 聴解実践 〜会議・講義〜', vi: 'Luyện nghe thực chiến N2 - Họp và bài giảng' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N2聴解: 会議・カンファレンスの聞き取り',
      titleTranslation: 'Nghe hiểu N2: Nghe hội nghị và cuộc họp',
      introduction: `N2の聴解では会議・講義・インタビューなど長い音声が出ます。要点をメモしながら聞く練習が重要です。介護現場ではケアカンファレンス・研修・スタッフ会議での発言内容を正確に理解する必要があります。

Nghe hiểu N2 có âm thanh dài như cuộc họp, bài giảng, phỏng vấn. Luyện nghe và ghi chú điểm chính rất quan trọng. Trong điều dưỡng cần hiểu chính xác nội dung phát biểu trong hội nghị chăm sóc, đào tạo, họp nhân viên.`,
      keyPoints: [
        'メモの技術：キーワードのみを書く（全文は書かない）',
        '話の構造を掴む：話題→説明→提案→結論',
        '数字・名前は慎重に聞き取る',
        '「〜ということは」「要するに」= 結論・まとめのサイン',
        '依頼・提案の表現：「〜していただけますか・〜はいかがでしょうか」',
      ],
      vocabulary: [
        { word: 'カンファレンス', reading: 'かんふぁれんす', meaning: '会議・ケア会議（hội nghị）', example: 'ケアカンファレンスを開く' },
        { word: '要するに', reading: 'ようするに', meaning: 'つまり・まとめると（tóm lại）', example: '要するに、早期対応が必要です' },
        { word: '議題', reading: 'ぎだい', meaning: '会議のテーマ（chủ đề cuộc họp）', example: '本日の議題は〇〇です' },
        { word: '提案する', reading: 'ていあんする', meaning: '意見を出す（đề xuất）', example: '新しい方法を提案する' },
        { word: 'まとめる', reading: 'まとめる', meaning: '整理する（tổng hợp, tóm tắt）', example: '会議内容をまとめる' },
      ],
      examples: [
        { japanese: '本日のカンファレンスの議題は、田中様のケアプラン見直しです。要するに、現在の介護量では対応が難しくなっています。皆さんのご意見をいただけますか。', reading: 'ほんじつのかんふぁれんすのぎだいは、たなかさまのけあぷらんみなおしです。', translation: 'Chủ đề hội nghị hôm nay là xem xét lại kế hoạch chăm sóc của ông Tanaka. Tóm lại, với lượng chăm sóc hiện tại đang khó xử lý. Xin ý kiến của mọi người.' },
      ],
      grammarNote: `【会議でよく使う表現】
開始：「本日の議題は〜です」
意見を言う：「〜と思います・〜ではないでしょうか」
同意：「おっしゃる通りです・確かにそうですね」
反対：「〜という点については、少し〜」
まとめ：「要するに〜・以上のことから〜」
宿題：「〜については、次回までに確認します」`,
      quiz: {
        question: '「要するに」の意味は？',
        options: [
          { id: 'a', text: 'なぜなら' },
          { id: 'b', text: 'つまり・まとめると' },
          { id: 'c', text: 'しかし' },
          { id: 'd', text: 'たとえば' },
        ],
        correctId: 'b',
        explanation: '「要するに」は話の内容をまとめて言い直すときに使います。「つまり・言い換えると」と同じ意味。\n「要するに」dùng khi tóm tắt lại nội dung. Nghĩa là "tóm lại, nói cách khác".',
      },
      xpReward: 35,
    },
  },

  // ===== N2 語彙 =====
  'n2-04': {
    courseTitle: { ja: 'N2 語彙・慣用表現 完全攻略', vi: 'Chinh phục từ vựng và thành ngữ N2' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N2語彙: 慣用句と四字熟語',
      titleTranslation: 'Từ vựng N2: Thành ngữ và tứ tự thành ngữ',
      introduction: `N2レベルでは慣用句・ことわざ・四字熟語が多く出ます。これらは文字通りの意味ではなく、比喩的な意味を持ちます。介護・医療の職場では「一石二鳥・試行錯誤・自業自得」など職場でも使われます。

Cấp N2 có nhiều thành ngữ, tục ngữ, tứ tự thành ngữ. Các từ này không mang nghĩa đen mà có nghĩa bóng. Nơi làm việc điều dưỡng cũng dùng các từ như "一石二鳥・試行錯誤".`,
      keyPoints: [
        '慣用句：体の部位を使った表現（手が離せない・目をかける）',
        '四字熟語：4つの漢字で意味を表す（一石二鳥・試行錯誤）',
        'ことわざ：生活の知恵・教訓（七転び八起き）',
        '類義語・対義語：同じ意味・反対の意味の表現',
        '文脈からの推測：知らない表現も文脈で意味を推測',
      ],
      vocabulary: [
        { word: '一石二鳥', reading: 'いっせきにちょう', meaning: '一つの行動で二つの効果（một mũi tên trúng hai đích）', example: '研修は知識と仲間作りで一石二鳥だ' },
        { word: '試行錯誤', reading: 'しこうさくご', meaning: '試してみて改善する（thử và sai để cải thiện）', example: '介護方法を試行錯誤する' },
        { word: '手が離せない', reading: 'てがはなせない', meaning: '今は忙しくて手が空かない（đang bận, không rảnh tay）', example: '今手が離せません' },
        { word: '七転び八起き', reading: 'ななころびやおき', meaning: '何度転んでも起き上がる（thất bại nhiều lần vẫn đứng dậy）', example: '七転び八起きの精神で頑張る' },
        { word: '目をかける', reading: 'めをかける', meaning: '注意して世話をする（quan tâm, chú ý）', example: '新人スタッフに目をかける' },
      ],
      examples: [
        { japanese: '今は手が離せません。5分後に折り返します。', reading: 'いまはてがはなせません。ごふんごにおりかえします。', translation: 'Bây giờ đang bận không rảnh tay. Tôi sẽ gọi lại sau 5 phút.' },
        { japanese: '試行錯誤を重ねて、ようやくよいケアの方法が見つかりました。', reading: 'しこうさくごをかさねて、ようやくよいけあのほうほうがみつかりました。', translation: 'Sau nhiều lần thử và sai, cuối cùng đã tìm được phương pháp chăm sóc tốt.' },
      ],
      grammarNote: `【体の部位を使う慣用句】
手：手が離せない（忙しい）/ 手を貸す（手伝う）/ 手を抜く（手を抜く）
目：目をかける（世話する）/ 目が離せない（注意が必要）
口：口が重い（無口）/ 口を挟む（横から割り込む）
耳：耳が痛い（聞いて辛い）/ 耳を傾ける（注意して聞く）`,
      quiz: {
        question: '「手が離せない」の意味は？',
        options: [
          { id: 'a', text: '手が使えない（障害がある）' },
          { id: 'b', text: '今は忙しくて対応できない' },
          { id: 'c', text: '手を洗う必要がある' },
          { id: 'd', text: '手が汚れている' },
        ],
        correctId: 'b',
        explanation: '「手が離せない」は今の作業が忙しくて、他のことができない状態を表す慣用句です。「今ちょっと〜」という意味で使います。\n「手が離せない」là thành ngữ nghĩa là "đang bận việc không rảnh để làm việc khác".',
      },
      xpReward: 35,
    },
  },

  // ===== N1 文法 =====
  'n1-01': {
    courseTitle: { ja: 'N1 最難関文法 完全攻略', vi: 'Chinh phục ngữ pháp N1 khó nhất' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N1文法: 〜をよそに・〜ならではの・〜にもまして',
      titleTranslation: 'Ngữ pháp N1: 〜をよそに・〜ならではの・〜にもまして',
      introduction: `N1の文法は非常に難解で、微妙なニュアンスの違いが問われます。「〜をよそに・〜ならではの・〜にもまして」は文学・社説・報告書などで使われる高度な表現です。

Ngữ pháp N1 rất khó, thường kiểm tra sự khác biệt về sắc thái tinh tế. 〜をよそに・〜ならではの・〜にもまして là các biểu đạt nâng cao dùng trong văn học, xã luận, báo cáo.`,
      keyPoints: [
        '〜をよそに: 〜を無視して・気にせずに（bất chấp, không quan tâm đến）',
        '〜ならではの: 〜にしかできない・〜独特の（đặc trưng của, chỉ ... mới có）',
        '〜にもまして: 〜以上に・〜より更に（hơn cả, vượt hơn）',
        '〜にほかならない: まさに〜だ（chính là, không gì khác ngoài）',
        '接続の注意：各表現の接続形（名詞・動詞・形容詞）を確認',
      ],
      vocabulary: [
        { word: '〜をよそに', reading: 'をよそに', meaning: '〜を無視して（bất chấp）', example: '反対の声をよそに計画を進めた' },
        { word: '〜ならではの', reading: 'ならではの', meaning: '〜独特の（đặc trưng của）', example: '日本ならではのおもてなし' },
        { word: '〜にもまして', reading: 'にもまして', meaning: '〜より更に（hơn cả）', example: '以前にもまして熱心に働く' },
        { word: '〜にほかならない', reading: 'にほかならない', meaning: '〜である（chính là）', example: 'これは努力の成果にほかならない' },
      ],
      examples: [
        { japanese: '利用者さんの不安をよそに、スタッフは淡々と作業を続けた。（否定的ニュアンス）', reading: 'りようしゃさんのふあんをよそに、すたっふはたんたんとさぎょうをつづけた。', translation: 'Bất chấp sự lo lắng của người được chăm sóc, nhân viên tiếp tục công việc một cách thờ ơ. (sắc thái tiêu cực)' },
        { japanese: 'これぞ職人ならではの技だ。', reading: 'これぞしょくにんならではのわざだ。', translation: 'Đây chính là kỹ thuật đặc trưng chỉ người thợ lành nghề mới có.' },
        { japanese: '今年は例年にもまして応募者が多い。', reading: 'ことしはれいねんにもまして おうぼしゃがおおい。', translation: 'Năm nay số người nộp đơn nhiều hơn cả những năm thường lệ.' },
      ],
      grammarNote: `【〜をよそに の使い方】
接続：名詞 + をよそに
意味：その状況を気にせず行動する（多くは批判的ニュアンス）
例：「家族の心配をよそに旅に出た」

【〜ならではの の使い方】
接続：名詞 + ならではの + 名詞
意味：そのものに特有・そこでしかできない
例：「京都ならではの文化」

【〜にもまして の使い方】
接続：名詞/疑問詞 + にもまして
意味：比較対象より程度が高い
例：「何にもまして大切なのは〜」`,
      quiz: {
        question: '「日本（　）おもてなし文化が世界に知られている」に入るのは？',
        options: [
          { id: 'a', text: 'をよそに' },
          { id: 'b', text: 'ならではの' },
          { id: 'c', text: 'にもまして' },
          { id: 'd', text: 'にほかならない' },
        ],
        correctId: 'b',
        explanation: '「日本ならでは = 日本に特有の・日本にしかない」。おもてなし文化は日本独特のものなので「ならではの」が正解。\n「ならではの」có nghĩa "đặc trưng của, chỉ ... mới có" — văn hóa omotenashi là đặc trưng của Nhật Bản.',
      },
      xpReward: 50,
    },
  },

  // ===== N1 語彙 =====
  'n1-02': {
    courseTitle: { ja: 'N1 語彙・熟語・慣用句マスター', vi: 'Từ vựng - Thành ngữ - Quán ngữ N1' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N1語彙: 文脈から意味を推測する技術',
      titleTranslation: 'Từ vựng N1: Kỹ năng đoán nghĩa từ ngữ cảnh',
      introduction: `N1の語彙問題では、未知の語彙でも文脈から意味を推測する力が試されます。漢字の構成要素（部首・漢字の意味）から意味を推測する技術も重要です。

Trong câu hỏi từ vựng N1, kỹ năng đoán nghĩa từ ngữ cảnh ngay cả với từ chưa biết rất quan trọng. Kỹ năng đoán nghĩa từ thành phần Kanji (bộ thủ, nghĩa chữ Hán) cũng quan trọng.`,
      keyPoints: [
        '文脈推測：前後の文から意味を絞り込む',
        '漢字分解：「不・無・未・非」= 否定 / 「〜化・〜性・〜的」= 意味の変換',
        '類義語問題：最も近い意味の選択肢を選ぶ',
        '文脈の手がかり：接続詞・具体例・対比から意味を推測',
        '高頻度N1語彙：看過する・俯瞰する・逡巡する・蔑ろにする',
      ],
      vocabulary: [
        { word: '看過する', reading: 'かんかする', meaning: '見逃す（bỏ qua, không chú ý）', example: '安全上のリスクを看過してはならない' },
        { word: '俯瞰する', reading: 'ふかんする', meaning: '高い視点から全体を見る（nhìn tổng quan từ trên cao）', example: '問題を俯瞰して考える' },
        { word: '醸成する', reading: 'じょうせいする', meaning: '少しずつ作り上げる（hình thành dần dần）', example: '信頼関係を醸成する' },
        { word: '顕著な', reading: 'けんちょな', meaning: '明らかに目立つ（rõ ràng, nổi bật）', example: '顕著な改善が見られた' },
        { word: '是正する', reading: 'ぜせいする', meaning: '間違いを正す（chỉnh sửa, cải chính）', example: '問題点を是正する' },
      ],
      examples: [
        { japanese: '小さなリスクを看過した結果、大きな事故につながった。', reading: 'ちいさなりすくをかんかした けっか、おおきなじこにつながった。', translation: 'Kết quả của việc bỏ qua rủi ro nhỏ đã dẫn đến tai nạn lớn.' },
        { japanese: '問題を俯瞰することで、本質的な原因が見えてきた。', reading: 'もんだいをふかんすることで、ほんしつてきなげんいんがみえてきた。', translation: 'Nhờ nhìn tổng quan vấn đề, nguyên nhân cốt lõi đã hiện ra.' },
      ],
      grammarNote: `【N1語彙推測のヒント — Gợi ý đoán từ N1】
接頭辞：
・不〜 = không ... (不安・不満・不明)
・無〜 = không có ... (無理・無料・無効)
・未〜 = chưa ... (未来・未定・未経験)
・超〜 = siêu ... (超高齢・超難関)

接尾辞：
・〜化 = biến thành ... (高齢化・国際化)
・〜性 = tính chất ... (重要性・可能性)
・〜的 = mang tính ... (効果的・具体的)`,
      quiz: {
        question: '「顕著な改善」の「顕著」の意味として最も近いのは？',
        options: [
          { id: 'a', text: 'わずかな' },
          { id: 'b', text: 'ゆっくりした' },
          { id: 'c', text: '明らかに目立つ' },
          { id: 'd', text: '予想外の' },
        ],
        correctId: 'c',
        explanation: '「顕著（けんちょ）」は「明らかに目立つ・はっきりと分かる」という意味。「著（あらわ）」には「目立つ」の意味があります。\n「顕著」có nghĩa là "rõ ràng nổi bật, dễ thấy".',
      },
      xpReward: 50,
    },
  },

  // ===== N1 読解 =====
  'n1-03': {
    courseTitle: { ja: 'N1 読解・論述文 実戦演習', vi: 'Luyện đọc hiểu và văn nghị luận N1 thực chiến' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N1読解: 複数文章の比較と統合',
      titleTranslation: 'Đọc hiểu N1: So sánh và tổng hợp nhiều văn bản',
      introduction: `N1の読解の最難関は「複数の文章を比較して共通点・相違点・関係性を読み取る」問題です。二つの文章を読んで「筆者Aは〜と主張しているが、筆者Bは〜と考えている。共通しているのは〜だ」という統合的な理解が求められます。

Dạng khó nhất trong đọc hiểu N1 là "đọc nhiều văn bản và tìm điểm giống, khác nhau, mối quan hệ". Cần hiểu tổng hợp như "Tác giả A lập luận X nhưng tác giả B nghĩ Y. Điểm chung là Z".`,
      keyPoints: [
        '複数文章問題：2つ以上の文章の関係（補完・対立・例示）',
        '比較の視点：共通点・相違点・前提・結論を整理',
        '評価・批判：「A の主張に対して B は〜と述べている」',
        '時間をかけない：各文章3〜4分で要旨を把握',
        '設問から先に読む：何が問われているかを把握してから読む',
      ],
      vocabulary: [
        { word: '前提', reading: 'ぜんてい', meaning: 'もともとの仮定（tiền đề）', example: '同じ前提に基づく議論' },
        { word: '論拠', reading: 'ろんきょ', meaning: '主張の根拠（luận cứ）', example: '論拠が弱い主張' },
        { word: '踏まえて', reading: 'ふまえて', meaning: '〜を考慮して（dựa trên, xem xét）', example: '現状を踏まえて判断する' },
        { word: '一致する', reading: 'いっちする', meaning: '同じになる（trùng khớp, nhất trí）', example: '二人の意見が一致した' },
        { word: '相反する', reading: 'あいはんする', meaning: '反対になる（mâu thuẫn, trái ngược）', example: '二つの主張が相反する' },
      ],
      examples: [
        { japanese: '【文章A】高齢化対策として、介護ロボットの導入が急務だ。【文章B】人によるケアの温かさは機械に代替できない。【問】二人の筆者の共通点は何か？', reading: '', translation: '【Bài A】Đưa robot chăm sóc vào là cấp bách để đối phó với già hóa. 【Bài B】Sự ấm áp của chăm sóc bởi con người không thể thay thế bằng máy móc. 【Câu hỏi】Điểm chung của hai tác giả là gì?' },
      ],
      grammarNote: `【複数文章問題の解き方】
Step 1: 設問を読む（何を聞かれているか確認）
Step 2: 各文章の主張を1文で要約する
Step 3: 共通点・相違点を表にまとめる
Step 4: 設問に答える

【よく問われる関係】
・対立する主張（A vs B）
・補完する主張（AはX、BはY → 合わせるとZ）
・同じ前提・異なる結論`,
      quiz: {
        question: '「相反する」の意味は？',
        options: [
          { id: 'a', text: '同じ意見を持つ' },
          { id: 'b', text: '補い合う' },
          { id: 'c', text: '反対・矛盾する' },
          { id: 'd', text: '無関係' },
        ],
        correctId: 'c',
        explanation: '「相反する（あいはんする）」は二つのものが反対・矛盾することを意味します。「相（あい）= お互い」+「反（はん）= 反対」。\n「相反する」có nghĩa là "mâu thuẫn với nhau, trái ngược nhau".',
      },
      xpReward: 50,
    },
  },

  // ===== N2 文法 =====
  'n2-01': {
    courseTitle: { ja: 'N2 上級文法マスター', vi: 'Ngữ pháp nâng cao N2' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N2文法: 〜にもかかわらず / 〜にもかかわらず',
      titleTranslation: 'Ngữ pháp N2: Mặc dù... / Bất chấp...',
      introduction: `「〜にもかかわらず」は「〜なのに、それでも」という意味の接続表現です。予想に反する結果を表すときに使います。N2レベルの書き言葉・フォーマルな文章でよく出てきます。

「〜にかかわらず」（関係なく）とも混同しやすいので注意が必要です。

「〜にもかかわらず」 có nghĩa là "mặc dù..., vẫn..." - dùng khi kết quả trái với kỳ vọng. Thường xuất hiện trong văn viết và văn trang trọng cấp N2.`,
      keyPoints: [
        '接続：名詞・普通形 + にもかかわらず',
        '意味：「〜なのに（予想外に）」「〜であるにもかかわらず」',
        '書き言葉的：公式文書・ビジネス文書・論文などで使う',
        'N2頻出：試験では「にかかわらず」（regardless of）との区別問題が出る',
        '用例：「大雨にもかかわらず、多くの方が参加してくださいました」',
      ],
      vocabulary: [
        { word: '〜にもかかわらず', reading: 'にもかかわらず', meaning: 'mặc dù ... (vẫn)', example: '反対意見にもかかわらず、計画を実行した' },
        { word: '〜にかかわらず', reading: 'にかかわらず', meaning: '... に関係なく（bất kể）', example: '国籍にかかわらず応募できる' },
        { word: 'かつ', reading: 'かつ', meaning: 'そして・また（và đồng thời）', example: '安全かつ確実に' },
        { word: 'いかんにかかわらず', reading: 'いかんにかかわらず', meaning: 'どうであっても（dù thế nào）', example: '結果のいかんにかかわらず' },
      ],
      examples: [
        {
          japanese: '大雨にもかかわらず、多くの患者様がいらっしゃいました。',
          reading: 'おおあめにもかかわらず、おおくのかんじゃさまがいらっしゃいました。',
          translation: 'Mặc dù trời mưa to, vẫn có nhiều bệnh nhân đến.',
        },
        {
          japanese: '高齢にもかかわらず、大変お元気でいらっしゃいます。',
          reading: 'こうれいにもかかわらず、たいへんおげんきでいらっしゃいます。',
          translation: 'Mặc dù tuổi cao nhưng vẫn rất khỏe mạnh.',
        },
        {
          japanese: '十分な説明にもかかわらず、ご理解いただけなかった。',
          reading: 'じゅうぶんなせつめいにもかかわらず、ごりかいいただけなかった。',
          translation: 'Mặc dù đã giải thích đầy đủ nhưng vẫn không được hiểu.',
        },
      ],
      grammarNote: `【〜にもかかわらず vs 〜にかかわらず の違い】

〜にもかかわらず（mặc dù ... vẫn）
→ 逆接：Aという状況なのに、Bという予想外の結果
例：「反対にもかかわらず実行した」= Mặc dù có phản đối vẫn thực hiện

〜にかかわらず（bất kể）
→ 無関係：Aの状況に関係なく、Bが成立する
例：「天気にかかわらず開催する」= Dù thời tiết thế nào vẫn tổ chức

【N2試験対策ポイント】
選択肢に両方が出る場合、逆接（反対の結果）なら「にもかかわらず」、無関係（条件を問わず）なら「にかかわらず」`,
      quiz: {
        question: 'どちらが正しいですか？「彼女は忙しい（　）、いつも笑顔だ」',
        options: [
          { id: 'a', text: 'にかかわらず' },
          { id: 'b', text: 'にもかかわらず' },
          { id: 'c', text: 'にしたがって' },
          { id: 'd', text: 'にくわえて' },
        ],
        correctId: 'b',
        explanation: '「忙しいのに笑顔」は予想外の結果（逆接）なので「にもかかわらず」が正解。「にかかわらず」は無関係・条件を問わない場合に使います。\n"Dù bận nhưng vẫn luôn mỉm cười" là kết quả bất ngờ (nghịch nghĩa) nên dùng "にもかかわらず".',
      },
      xpReward: 40,
    },
  },

  // ===== N5 ひらがな L2 =====
  'n5-01-2': {
    courseTitle: { ja: 'N5 ひらがな・カタカナ完全マスター', vi: 'Hoàn thiện Hiragana & Katakana N5' },
    isLocked: false, requiredPlan: 'free',
    lesson: {
      title: 'ひらがな第2回 〜さ行・た行〜',
      titleTranslation: 'Hiragana Bài 2 - Hàng さ và hàng た',
      introduction: `前回の「あ行・か行」に続き、今回は「さ行（さしすせそ）」と「た行（たちつてと）」を学びます。さ行は英語の「s」音、た行は「t」音が基本ですが、「し・ち・つ」は注意が必要です。

Tiếp theo "hàng あ・か", lần này học "hàng さ (sa si su se so)" và "hàng た (ta chi tsu te to)". Hàng さ có âm "s", hàng た có âm "t" làm cơ bản, nhưng chú ý đặc biệt với し・ち・つ.`,
      keyPoints: [
        'さ行：さ(sa)・し(shi)・す(su)・せ(se)・そ(so)　※し = "shi" 注意',
        'た行：た(ta)・ち(chi)・つ(tsu)・て(te)・と(to)　※ち=chi, つ=tsu 注意',
        '「し」は英語の "she" のような音：舌先を上顎の前に近づけて発音',
        '「つ」は英語にない音：「t」+「su」を素早く一音で発音',
        '「ち」も独特：英語 "cheese" の "ch" に近い',
        'カタカナ対応：サ・シ・ス・セ・ソ / タ・チ・ツ・テ・ト',
      ],
      vocabulary: [
        { word: 'さくら', reading: 'さくら', meaning: '桜（hoa anh đào）', example: 'さくらがきれいです' },
        { word: 'すし', reading: 'すし', meaning: '寿司（sushi）', example: 'おすしを食べる' },
        { word: 'せかい', reading: 'せかい', meaning: '世界（thế giới）', example: 'せかいじゅう' },
        { word: 'たべる', reading: 'たべる', meaning: '食べる（ăn）', example: 'ごはんをたべる' },
        { word: 'ちかい', reading: 'ちかい', meaning: '近い（gần）', example: 'えきがちかい' },
        { word: 'つくえ', reading: 'つくえ', meaning: '机（bàn）', example: 'つくえのうえ' },
        { word: 'てがみ', reading: 'てがみ', meaning: '手紙（thư）', example: 'てがみをかく' },
        { word: 'とけい', reading: 'とけい', meaning: '時計（đồng hồ）', example: 'とけいをみる' },
      ],
      examples: [
        { japanese: 'すしとさしみが好きです。', reading: 'すしとさしみがすきです。', translation: 'Tôi thích sushi và sashimi.' },
        { japanese: 'つくえのうえにとけいがあります。', reading: 'つくえのうえにとけいがあります。', translation: 'Trên bàn có đồng hồ.' },
        { japanese: 'せかいじゅうのひとに、ちかいしょうらいたいせつです。', reading: 'せかいじゅうのひとに、ちかいしょうらいたいせつです。', translation: 'Tương lai gần quan trọng với người trên toàn thế giới.' },
      ],
      grammarNote: `【さ行・た行の発音まとめ】
さ=sa　し=shi（!）　す=su　せ=se　そ=so
た=ta　ち=chi（!）　つ=tsu（!）　て=te　と=to

【介護でよく使う さ・た行の言葉】
さん（Mr./さん付けで呼ぶ）/ して（〜して下さい）/ すみません
たすけてください / ちょっとまって / つかまって / てをつないで

Trong điều dưỡng hay dùng: すみません (xin lỗi), たすけて (giúp với), ちょっとまって (đợi một chút)`,
      quizzes: [
        {
          question: '「し」の正しい読みはどれですか？',
          options: [{ id: 'a', text: 'si' }, { id: 'b', text: 'shi' }, { id: 'c', text: 'chi' }, { id: 'd', text: 'zi' }],
          correctId: 'b',
          explanation: '「し」はローマ字で "shi" と書きます。英語の "she" に近い発音です。\n「し」được viết là "shi" trong romaji, phát âm gần giống "she" trong tiếng Anh.',
          difficulty: 'easy' as const,
        },
        {
          question: '「つ」の正しい読みはどれですか？',
          options: [{ id: 'a', text: 'tu' }, { id: 'b', text: 'chu' }, { id: 'c', text: 'tsu' }, { id: 'd', text: 'su' }],
          correctId: 'c',
          explanation: '「つ」は "tsu" — t音とsu音を合わせた特殊な音です。\n「つ」là "tsu" — âm đặc biệt kết hợp t và su.',
          difficulty: 'easy' as const,
        },
        {
          question: '「すし」をひらがなで書くと？',
          options: [{ id: 'a', text: 'しすし' }, { id: 'b', text: 'すし' }, { id: 'c', text: 'すしい' }, { id: 'd', text: 'すいし' }],
          correctId: 'b',
          explanation: '寿司は「すし」と書きます。す(su)+し(shi)。\nSushi viết là すし = す (su) + し (shi).',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 20,
    },
  },

  // ===== N5 ひらがな L3 =====
  'n5-01-3': {
    courseTitle: { ja: 'N5 ひらがな・カタカナ完全マスター', vi: 'Hoàn thiện Hiragana & Katakana N5' },
    isLocked: false, requiredPlan: 'free',
    lesson: {
      title: 'ひらがな第3回 〜な行・は行〜',
      titleTranslation: 'Hiragana Bài 3 - Hàng な và hàng は',
      introduction: `今回は「な行（なにぬねの）」と「は行（はひふへほ）」を学びます。「ふ」は唇から出る特殊な音、「は行」は語中・語尾で発音が変わることがあります。

Lần này học "hàng な (na ni nu ne no)" và "hàng は (ha hi fu he ho)". Chú ý "ふ" là âm đặc biệt từ môi, và hàng は có thể thay đổi cách đọc ở giữa hay cuối từ.`,
      keyPoints: [
        'な行：な(na)・に(ni)・ぬ(nu)・ね(ne)・の(no)',
        'は行：は(ha)・ひ(hi)・ふ(fu)・へ(he)・ほ(ho)',
        '「ふ」は英語の "f" ではなく、両唇を近づけて息を出す音（発音注意）',
        '助詞の「は」= "wa"、「へ」= "e" と発音が変わる',
        '介護で頻出：「はい」「ひとり」「ふとん」「ほんじつ」',
        'カタカナ対応：ナ・ニ・ヌ・ネ・ノ / ハ・ヒ・フ・ヘ・ホ',
      ],
      vocabulary: [
        { word: 'なまえ', reading: 'なまえ', meaning: '名前（tên）', example: 'おなまえはなんですか' },
        { word: 'にほん', reading: 'にほん', meaning: '日本（Nhật Bản）', example: 'にほんごをべんきょうする' },
        { word: 'ねる', reading: 'ねる', meaning: '寝る（ngủ）', example: 'よるにねる' },
        { word: 'はなす', reading: 'はなす', meaning: '話す（nói）', example: 'にほんごではなす' },
        { word: 'ひとり', reading: 'ひとり', meaning: '一人（một mình）', example: 'ひとりでできる' },
        { word: 'ふとん', reading: 'ふとん', meaning: '布団（chăn đệm）', example: 'ふとんをしく' },
        { word: 'ほんじつ', reading: 'ほんじつ', meaning: '本日（hôm nay（lịch sự））', example: 'ほんじつのメニュー' },
        { word: 'のむ', reading: 'のむ', meaning: '飲む（uống）', example: 'くすりをのむ' },
      ],
      examples: [
        { japanese: 'おなまえはなんですか？', reading: 'おなまえはなんですか？', translation: 'Tên bạn là gì?' },
        { japanese: 'ひとりでふとんにはいれますか？', reading: 'ひとりでふとんにはいれますか？', translation: 'Bạn có thể tự vào chăn đệm không?' },
        { japanese: 'くすりをのんでください。', reading: 'くすりをのんでください。', translation: 'Hãy uống thuốc đi.' },
      ],
      grammarNote: `【は行の発音の注意点】
通常：は=ha、ひ=hi、ふ=fu、へ=he、ほ=ho
助詞として：
  は（テーマ）→ "wa" と発音：「わたし は」
  へ（方向）→ "e" と発音：「東京 へ」

【「ふ」の発音】
英語のfとは違い、上の歯を下唇につけない！
両唇を近づけて、軽くふうっと息を出す感覚。

Phát âm ふ: Không giống f tiếng Anh, không chạm răng vào môi. Thổi hơi nhẹ giữa hai môi.`,
      quizzes: [
        {
          question: '助詞「は」の発音は？',
          options: [{ id: 'a', text: 'ha' }, { id: 'b', text: 'wa' }, { id: 'c', text: 'ba' }, { id: 'd', text: 'pa' }],
          correctId: 'b',
          explanation: '助詞として使う「は」は "wa" と発音します。「わたし は グエンです」→ wa。\nKhi là trợ từ, は đọc là "wa". Ví dụ: "わたし は グエンです"',
          difficulty: 'medium' as const,
        },
        {
          question: '「ひとり」の意味は？',
          options: [{ id: 'a', text: '二人' }, { id: 'b', text: '一日' }, { id: 'c', text: '一人' }, { id: 'd', text: '一つ' }],
          correctId: 'c',
          explanation: '「ひとり」は「一人（いちにん）」= 1人のこと。介護でよく使う「おひとりで大丈夫ですか？」\n「ひとり」= một người. Hay dùng trong điều dưỡng: "おひとりで大丈夫ですか？"',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 20,
    },
  },

  // ===== N5 ひらがな L4 =====
  'n5-01-4': {
    courseTitle: { ja: 'N5 ひらがな・カタカナ完全マスター', vi: 'Hoàn thiện Hiragana & Katakana N5' },
    isLocked: false, requiredPlan: 'free',
    lesson: {
      title: 'ひらがな第4回 〜ま行・や行・ら行・わ行・ん〜',
      titleTranslation: 'Hiragana Bài 4 - Hàng ま, や, ら, わ và ん',
      introduction: `今回でひらがな全46字が揃います。「ま行・や行・ら行・わ行」と特別な文字「ん」を学びます。「ら行」のrは英語のr・lとも異なる独特の音です。また「ん」は唯一の子音単独字です。

Lần này hoàn thành đủ 46 chữ Hiragana. Học hàng ま, や, ら, わ và ký tự đặc biệt ん. Âm "r" của hàng ら khác với r/l tiếng Anh. ん là ký tự phụ âm duy nhất đứng một mình.`,
      keyPoints: [
        'ま行：ま(ma)・み(mi)・む(mu)・め(me)・も(mo)',
        'や行：や(ya)・ゆ(yu)・よ(yo)　※3字のみ',
        'ら行：ら(ra)・り(ri)・る(ru)・れ(re)・ろ(ro)　※独特のr音',
        'わ行：わ(wa)・を(wo)　※「を」は助詞専用',
        'ん：単独の子音字、語末・語中にのみ現れる',
        '「ら行」のrは舌先を上顎に一度弾く音（フラップ音）',
      ],
      vocabulary: [
        { word: 'まいにち', reading: 'まいにち', meaning: '毎日（mỗi ngày）', example: 'まいにちれんしゅうする' },
        { word: 'みず', reading: 'みず', meaning: '水（nước）', example: 'みずをのむ' },
        { word: 'やさしい', reading: 'やさしい', meaning: '優しい（nhẹ nhàng）', example: 'やさしいひと' },
        { word: 'ゆっくり', reading: 'ゆっくり', meaning: 'ゆっくり（từ từ）', example: 'ゆっくりはなす' },
        { word: 'よい', reading: 'よい', meaning: '良い（tốt）', example: 'よいてんき' },
        { word: 'りょうり', reading: 'りょうり', meaning: '料理（nấu ăn）', example: 'りょうりをつくる' },
        { word: 'われる', reading: 'われる', meaning: '割れる（vỡ）', example: 'コップがわれる' },
        { word: 'にほん', reading: 'にほん', meaning: '日本（Nhật）', example: 'にほんにいます' },
      ],
      examples: [
        { japanese: 'ゆっくりでいいですよ。', reading: 'ゆっくりでいいですよ。', translation: 'Cứ từ từ thôi nhé. （介護の声かけ）' },
        { japanese: 'まいにちれんしゅうしましょう。', reading: 'まいにちれんしゅうしましょう。', translation: 'Hãy luyện tập mỗi ngày nhé.' },
        { japanese: 'みずをのみますか？', reading: 'みずをのみますか？', translation: 'Bạn có muốn uống nước không?' },
      ],
      grammarNote: `【ら行の発音のコツ】
英語のr でも l でもない！
舌先を上の歯茎のすぐ後ろに当てて、弾く（flap）
→ スペイン語の "r" に近い感覚

【「を」について】
「を」は動作の対象を示す助詞専用：
　みず を のむ（水を飲む）
　くすり を のむ（薬を飲む）
発音は "o" （現代語では「お」と同じ発音）

【「ん」の発音】
語末：にほ ん → 「n」のまま止める
語中：さんぽ → 「m」に近い
母音の前：まんえん → 「ng」に近い`,
      quizzes: [
        {
          question: '「ゆっくり」の意味として正しいのは？',
          options: [{ id: 'a', text: 'はやく' }, { id: 'b', text: 'ゆっくり' }, { id: 'c', text: 'だんだん' }, { id: 'd', text: 'すぐに' }],
          correctId: 'b',
          explanation: '「ゆっくり」は "slowly / calmly"。介護現場で「ゆっくりで大丈夫ですよ」と声をかけます。\nゆっくり = từ từ/chậm. Trong điều dưỡng: "ゆっくりで大丈夫ですよ" (Từ từ cũng được đâu)',
          difficulty: 'easy' as const,
        },
        {
          question: 'ひらがなで「水を飲む」を書くと？',
          options: [{ id: 'a', text: 'みずはのむ' }, { id: 'b', text: 'みずをのむ' }, { id: 'c', text: 'みずがのむ' }, { id: 'd', text: 'みずにのむ' }],
          correctId: 'b',
          explanation: '動作の対象には助詞「を」を使います。「みず を のむ」（水を飲む）。\nDùng trợ từ を cho đối tượng của hành động: みず を のむ',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 25,
    },
  },

  // ===== N5 ひらがな L5 =====
  'n5-01-5': {
    courseTitle: { ja: 'N5 ひらがな・カタカナ完全マスター', vi: 'Hoàn thiện Hiragana & Katakana N5' },
    isLocked: false, requiredPlan: 'free',
    lesson: {
      title: 'ひらがな第5回 〜濁音・半濁音〜',
      titleTranslation: 'Hiragana Bài 5 - Âm đục (dakuten) và bán đục (handakuten)',
      introduction: `清音（基本のひらがな）に加え、濁点（゛）や半濁点（°）をつけることで新しい音が生まれます。これを「濁音」「半濁音」といいます。20字以上の新しい音を習得します。

Thêm vào Hiragana cơ bản (seion), dấu " (dakuten) và dấu ° (handakuten) tạo ra các âm mới gọi là "dakuon" và "handakuon". Sẽ học hơn 20 âm mới.`,
      keyPoints: [
        'が行：が(ga)・ぎ(gi)・ぐ(gu)・げ(ge)・ご(go)　← か行 ＋ ゛',
        'ざ行：ざ(za)・じ(ji)・ず(zu)・ぜ(ze)・ぞ(zo)　← さ行 ＋ ゛',
        'だ行：だ(da)・ぢ(ji)・づ(zu)・で(de)・ど(do)　← た行 ＋ ゛',
        'ば行：ば(ba)・び(bi)・ぶ(bu)・べ(be)・ぼ(bo)　← は行 ＋ ゛',
        'ぱ行：ぱ(pa)・ぴ(pi)・ぷ(pu)・ぺ(pe)・ぽ(po)　← は行 ＋ ° （半濁点）',
        '「じ」は「ぢ」と、「ず」は「づ」と同じ発音（現代語では）',
      ],
      vocabulary: [
        { word: 'がんばる', reading: 'がんばる', meaning: '頑張る（cố gắng）', example: 'がんばってください' },
        { word: 'ごはん', reading: 'ごはん', meaning: 'ご飯（cơm）', example: 'ごはんをたべる' },
        { word: 'じかん', reading: 'じかん', meaning: '時間（thời gian）', example: 'じかんをまもる' },
        { word: 'ずっと', reading: 'ずっと', meaning: 'ずっと（mãi mãi）', example: 'ずっとげんきで' },
        { word: 'でんわ', reading: 'でんわ', meaning: '電話（điện thoại）', example: 'でんわをかける' },
        { word: 'びょういん', reading: 'びょういん', meaning: '病院（bệnh viện）', example: 'びょういんにいく' },
        { word: 'ぶどう', reading: 'ぶどう', meaning: '葡萄（nho）', example: 'ぶどうをたべる' },
        { word: 'ぽかぽか', reading: 'ぽかぽか', meaning: '暖かい感じ（ấm áp）', example: 'ぽかぽかあたたかい' },
      ],
      examples: [
        { japanese: 'ごはんのじかんですよ。', reading: 'ごはんのじかんですよ。', translation: 'Đến giờ ăn rồi đấy. （介護の声かけ）' },
        { japanese: 'びょういんにでんわをかけます。', reading: 'びょういんにでんわをかけます。', translation: 'Tôi gọi điện cho bệnh viện.' },
        { japanese: 'がんばってください！おうえんしています。', reading: 'がんばってください！おうえんしています。', translation: 'Cố lên! Tôi đang cổ vũ bạn.' },
      ],
      grammarNote: `【濁音・半濁音のまとめ一覧】
か→が　き→ぎ　く→ぐ　け→げ　こ→ご
さ→ざ　し→じ　す→ず　せ→ぜ　そ→ぞ
た→だ　ち→ぢ　つ→づ　て→で　と→ど
は→ば　ひ→び　ふ→ぶ　へ→べ　ほ→ぼ
は→ぱ　ひ→ぴ　ふ→ぷ　へ→ぺ　ほ→ぽ

【介護で頻出の濁音語彙】
ごはん（ご飯）/ でんわ（電話）/ びょういん（病院）
ざんぎょう（残業）/ ぶんかい（分解）/ でぐち（出口）`,
      quizzes: [
        {
          question: '「ごはん」をひらがなで書くと？',
          options: [{ id: 'a', text: 'こはん' }, { id: 'b', text: 'ごはん' }, { id: 'c', text: 'ごばん' }, { id: 'd', text: 'こばん' }],
          correctId: 'b',
          explanation: '「ご飯」は「ごはん」。「こ」に濁点がついて「ご」になります。\n「ご飯」viết là ごはん. こ + ゛= ご',
          difficulty: 'easy' as const,
        },
        {
          question: '半濁点（°）を使う行は？',
          options: [{ id: 'a', text: 'か行' }, { id: 'b', text: 'さ行' }, { id: 'c', text: 'た行' }, { id: 'd', text: 'は行' }],
          correctId: 'd',
          explanation: '半濁点（°）はは行にのみ付きます：ぱぴぷぺぽ\nDấu ° (handakuten) chỉ thêm vào hàng は: ぱぴぷぺぽ',
          difficulty: 'medium' as const,
        },
        {
          question: '「びょういん」の意味は？',
          options: [{ id: 'a', text: '銀行' }, { id: 'b', text: '学校' }, { id: 'c', text: '病院' }, { id: 'd', text: '薬局' }],
          correctId: 'c',
          explanation: '「びょういん」=「病院」（bệnh viện）。介護現場では頻出の語彙です。\nびょういん = bệnh viện. Từ vựng rất hay gặp trong môi trường điều dưỡng.',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 25,
    },
  },

  // ===== N5 ひらがな L6 =====
  'n5-01-6': {
    courseTitle: { ja: 'N5 ひらがな・カタカナ完全マスター', vi: 'Hoàn thiện Hiragana & Katakana N5' },
    isLocked: false, requiredPlan: 'free',
    lesson: {
      title: 'ひらがな第6回 〜拗音・長音・促音〜',
      titleTranslation: 'Hiragana Bài 6 - Âm thu nhỏ, âm dài và âm ngừng',
      introduction: `ひらがなの特殊な使い方を学びます。「きゃ・しゅ・ちょ」などの「拗音」、「おかあさん」のような「長音」、「きって」などの「促音（小さいっ）」は日本語の重要なルールです。

Học cách dùng đặc biệt của Hiragana. "拗音" như きゃ・しゅ・ちょ, "長音" như おかあさん (âm dài), và "促音" (っ nhỏ) như きって là các quy tắc quan trọng của tiếng Nhật.`,
      keyPoints: [
        '拗音：小さい「ゃ・ゅ・ょ」を組み合わせる — きゃ・きゅ・きょ / しゃ・しゅ・しょ / ちゃ・ちゅ・ちょ など',
        '長音：同じ母音を伸ばす — ああ・いい・うう・ええ・おお（おう）',
        '促音：小さい「っ」 — 次の子音を一瞬止める — きって・ざっし・もっと',
        '「ぎゃ・びゅ・ぴょ」など濁音・半濁音にも拗音がつく',
        '介護で重要：「ちょっと」「きって」「ざっし」「しゅっきん」',
        '長音の「え列+い」と「お列+う」は特別：けいたい(携帯)、おうじ(王子)',
      ],
      vocabulary: [
        { word: 'きゃく', reading: 'きゃく', meaning: '客（khách）', example: 'おきゃくさま' },
        { word: 'しゃしん', reading: 'しゃしん', meaning: '写真（ảnh）', example: 'しゃしんをとる' },
        { word: 'ちょっと', reading: 'ちょっと', meaning: 'ちょっと（một chút）', example: 'ちょっとまってください' },
        { word: 'びょういん', reading: 'びょういん', meaning: '病院（bệnh viện）', example: 'びょういんへいく' },
        { word: 'きって', reading: 'きって', meaning: '切手（tem）', example: 'きってをはる' },
        { word: 'ざっし', reading: 'ざっし', meaning: '雑誌（tạp chí）', example: 'ざっしをよむ' },
        { word: 'しゅっきん', reading: 'しゅっきん', meaning: '出勤（đi làm）', example: 'しゅっきんじかん' },
        { word: 'にゅういん', reading: 'にゅういん', meaning: '入院（nhập viện）', example: 'にゅういんする' },
      ],
      examples: [
        { japanese: 'ちょっとまってください。', reading: 'ちょっとまってください。', translation: 'Vui lòng đợi một chút. （介護の声かけ）' },
        { japanese: 'にゅういんのしゅっきんじかんは9じです。', reading: 'にゅういんのしゅっきんじかんは9じです。', translation: 'Giờ đi làm ở nội trú là 9 giờ.' },
        { japanese: 'しゃしんをとってもいいですか？', reading: 'しゃしんをとってもいいですか？', translation: 'Tôi có thể chụp ảnh không?' },
      ],
      grammarNote: `【拗音の組み合わせ一覧（主要）】
きゃ・きゅ・きょ / ぎゃ・ぎゅ・ぎょ
しゃ・しゅ・しょ / じゃ・じゅ・じょ
ちゃ・ちゅ・ちょ
にゃ・にゅ・にょ
ひゃ・ひゅ・ひょ / びゃ・びゅ・びょ / ぴゃ・ぴゅ・ぴょ
みゃ・みゅ・みょ
りゃ・りゅ・りょ

【促音のコツ】
「っ」= 次の子音の前で息を止めて一拍置く
きっ・て（kit-te）/ ざっ・し（zas-shi）/ もっ・と（mot-to）`,
      quizzes: [
        {
          question: '「ちょっとまって」の「っ」は何を表す？',
          options: [{ id: 'a', text: '長音（伸ばす）' }, { id: 'b', text: '促音（一瞬止める）' }, { id: 'c', text: '濁音' }, { id: 'd', text: '半濁音' }],
          correctId: 'b',
          explanation: '小さい「っ」は「促音」。次の子音の前で一拍止めます。ちょっ-と（chot-to）\nっ nhỏ là "促音" (âm ngừng). Ngừng lại một nhịp trước phụ âm tiếp theo.',
          difficulty: 'medium' as const,
        },
        {
          question: '「にゅういん」の意味は？',
          options: [{ id: 'a', text: '退院' }, { id: 'b', text: '入院' }, { id: 'c', text: '出勤' }, { id: 'd', text: '通院' }],
          correctId: 'b',
          explanation: '「にゅういん」=「入院」(nhập viện)。「にゅ」は拗音 = に+小さいゅ。\nにゅういん = nhập viện. にゅ là âm thu nhỏ = に + ゅ nhỏ.',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 25,
    },
  },

  // ===== N5 カタカナ L7 =====
  'n5-01-7': {
    courseTitle: { ja: 'N5 ひらがな・カタカナ完全マスター', vi: 'Hoàn thiện Hiragana & Katakana N5' },
    isLocked: false, requiredPlan: 'free',
    lesson: {
      title: 'カタカナ第1回 〜ア行〜サ行〜',
      titleTranslation: 'Katakana Bài 1 - Hàng ア đến hàng サ',
      introduction: `ひらがなをマスターしたら、次はカタカナです。カタカナは主に外来語・外国人名・医療用語・擬音語に使います。ひらがなと同じ発音で、形だけが違います。

Sau khi thành thạo Hiragana, tiếp theo là Katakana. Katakana chủ yếu dùng cho từ ngoại lai, tên người nước ngoài, thuật ngữ y tế và từ tượng thanh. Phát âm giống Hiragana, chỉ khác hình dạng.`,
      keyPoints: [
        'ア行：ア(a)・イ(i)・ウ(u)・エ(e)・オ(o)　← あいうえお と同じ発音',
        'カ行：カ(ka)・キ(ki)・ク(ku)・ケ(ke)・コ(ko)',
        'サ行：サ(sa)・シ(shi)・ス(su)・セ(se)・ソ(so)',
        'カタカナは直線的で角張った形が特徴',
        '長音記号「ー」：ナース（nurse）、ドア（door）など母音を伸ばす',
        '医療でよく使うカタカナ：ナース・ケア・スタッフ・サービス・スキル',
      ],
      vocabulary: [
        { word: 'ナース', reading: 'ナース', meaning: '看護師（y tá）', example: 'ナースコール' },
        { word: 'ケア', reading: 'ケア', meaning: 'ケア（chăm sóc）', example: 'スキンケア' },
        { word: 'スタッフ', reading: 'スタッフ', meaning: 'スタッフ（nhân viên）', example: 'スタッフ全員' },
        { word: 'アイス', reading: 'アイス', meaning: 'アイス（kem）', example: 'アイスクリーム' },
        { word: 'コーヒー', reading: 'コーヒー', meaning: 'コーヒー（cà phê）', example: 'コーヒーをのむ' },
        { word: 'スキル', reading: 'スキル', meaning: '技能（kỹ năng）', example: 'スキルをあげる' },
        { word: 'サービス', reading: 'サービス', meaning: 'サービス（dịch vụ）', example: 'かいごサービス' },
        { word: 'セーター', reading: 'セーター', meaning: 'セーター（áo len）', example: 'セーターをきる' },
      ],
      examples: [
        { japanese: 'ナースコールをおしてください。', reading: 'ナースコールをおしてください。', translation: 'Hãy nhấn chuông gọi y tá. （介護の声かけ）' },
        { japanese: 'スタッフにきいてください。', reading: 'スタッフにきいてください。', translation: 'Hãy hỏi nhân viên.' },
        { japanese: 'スキンケアはたいせつです。', reading: 'スキンケアはたいせつです。', translation: 'Chăm sóc da rất quan trọng.' },
      ],
      grammarNote: `【カタカナとひらがなの対応】
あ→ア　い→イ　う→ウ　え→エ　お→オ
か→カ　き→キ　く→ク　け→ケ　こ→コ
さ→サ　し→シ　す→ス　せ→セ　そ→ソ

【カタカナの長音「ー」】
母音を1拍分伸ばす記号
ナ ー ス（na-a-su = nurse）
コ ー ヒ ー（ko-o-hi-i = coffee）
ケ ア（ke-a = care）

【介護施設でよく見るカタカナ掲示】
ナースステーション / スタッフルーム / サービスセンター`,
      quizzes: [
        {
          question: '「ナース」の意味は？',
          options: [{ id: 'a', text: '医師' }, { id: 'b', text: '看護師' }, { id: 'c', text: '薬剤師' }, { id: 'd', text: '介護士' }],
          correctId: 'b',
          explanation: '「ナース」= nurse = 看護師。英語のnurseをカタカナにしたものです。\n「ナース」= nurse = y tá. Chữ Katakana của từ tiếng Anh "nurse".',
          difficulty: 'easy' as const,
        },
        {
          question: 'カタカナで長音を表すのは？',
          options: [{ id: 'a', text: 'っ' }, { id: 'b', text: 'ー' }, { id: 'c', text: 'ん' }, { id: 'd', text: 'ゃ' }],
          correctId: 'b',
          explanation: 'カタカナでは「ー」が長音を表します。ナース・コーヒー・サービスなど。\nTrong Katakana, ー là ký hiệu âm dài. Ví dụ: ナース・コーヒー・サービス',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 25,
    },
  },

  // ===== N5 カタカナ L8 =====
  'n5-01-8': {
    courseTitle: { ja: 'N5 ひらがな・カタカナ完全マスター', vi: 'Hoàn thiện Hiragana & Katakana N5' },
    isLocked: false, requiredPlan: 'free',
    lesson: {
      title: 'カタカナ第2回 〜タ行〜ハ行〜',
      titleTranslation: 'Katakana Bài 2 - Hàng タ đến hàng ハ',
      introduction: `前回に続き、カタカナの「タ行・ナ行・ハ行」を学びます。医療・介護でよく使う外来語（バイタル・ヘルパー・トイレなど）を中心に覚えましょう。

Tiếp tục học Katakana hàng タ・ナ・ハ. Tập trung vào từ ngoại lai hay dùng trong y tế và điều dưỡng như バイタル・ヘルパー・トイレ.`,
      keyPoints: [
        'タ行：タ(ta)・チ(chi)・ツ(tsu)・テ(te)・ト(to)',
        'ナ行：ナ(na)・ニ(ni)・ヌ(nu)・ネ(ne)・ノ(no)',
        'ハ行：ハ(ha)・ヒ(hi)・フ(fu)・ヘ(he)・ホ(ho)',
        '濁音：ダ・ヂ・ヅ・デ・ド / バ・ビ・ブ・ベ・ボ',
        '半濁音：パ・ピ・プ・ペ・ポ',
        '医療頻出：バイタル・ヘルパー・トイレ・ナースステーション・パジャマ',
      ],
      vocabulary: [
        { word: 'バイタル', reading: 'バイタル', meaning: 'バイタルサイン（dấu hiệu sinh tồn）', example: 'バイタルをはかる' },
        { word: 'ヘルパー', reading: 'ヘルパー', meaning: 'ホームヘルパー（người hỗ trợ）', example: 'ヘルパーさん' },
        { word: 'トイレ', reading: 'トイレ', meaning: 'トイレ（nhà vệ sinh）', example: 'トイレにいく' },
        { word: 'パジャマ', reading: 'パジャマ', meaning: 'パジャマ（pyjama）', example: 'パジャマにきがえる' },
        { word: 'テーブル', reading: 'テーブル', meaning: 'テーブル（bàn ăn）', example: 'テーブルにつく' },
        { word: 'ノート', reading: 'ノート', meaning: 'ノート（vở ghi chép）', example: 'ノートにかく' },
        { word: 'ベッド', reading: 'ベッド', meaning: 'ベッド（giường）', example: 'ベッドにはいる' },
        { word: 'ドア', reading: 'ドア', meaning: 'ドア（cửa）', example: 'ドアをしめる' },
      ],
      examples: [
        { japanese: 'バイタルをはかります。たいおん・けつあつ・みゃくはくです。', reading: 'バイタルをはかります。たいおん・けつあつ・みゃくはくです。', translation: 'Tôi đo dấu hiệu sinh tồn. Gồm nhiệt độ, huyết áp và mạch.' },
        { japanese: 'トイレにいきたいですか？', reading: 'トイレにいきたいですか？', translation: 'Bạn muốn đi vệ sinh không?' },
        { japanese: 'ベッドにもどりましょう。', reading: 'ベッドにもどりましょう。', translation: 'Hãy quay lại giường nhé.' },
      ],
      grammarNote: `【タ行〜ハ行 カタカナ対応】
た→タ　ち→チ　つ→ツ　て→テ　と→ト
な→ナ　に→ニ　ぬ→ヌ　ね→ネ　の→ノ
は→ハ　ひ→ヒ　ふ→フ　へ→ヘ　ほ→ホ

【介護施設でよく使うカタカナ語】
バイタル（vital signs）
ヘルパー（helper/care worker）
トイレ（toilet）
ベッド（bed）
テーブル（table）
パジャマ（pajama/nightwear）
ノート（notebook/care record）`,
      quizzes: [
        {
          question: '「バイタル」とは何を指す？',
          options: [{ id: 'a', text: '食事の量' }, { id: 'b', text: '体温・血圧・脈拍などの生命兆候' }, { id: 'c', text: '排泄記録' }, { id: 'd', text: 'ベッドの位置' }],
          correctId: 'b',
          explanation: 'バイタル（バイタルサイン）= vital signs = 体温・血圧・脈拍・呼吸数など。介護の基本業務です。\nバイタル = dấu hiệu sinh tồn = nhiệt độ, huyết áp, mạch...',
          difficulty: 'easy' as const,
        },
        {
          question: '「ベッド」をひらがなで書くと？（発音）',
          options: [{ id: 'a', text: 'べっど' }, { id: 'b', text: 'べど' }, { id: 'c', text: 'べっと' }, { id: 'd', text: 'べつど' }],
          correctId: 'a',
          explanation: '「ベッド」= べっど（促音あり）。カタカナのッはひらがなのっと同じ促音。\nベッド phát âm là べっど (có âm ngừng っ).',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 25,
    },
  },

  // ===== N5 カタカナ L9 =====
  'n5-01-9': {
    courseTitle: { ja: 'N5 ひらがな・カタカナ完全マスター', vi: 'Hoàn thiện Hiragana & Katakana N5' },
    isLocked: false, requiredPlan: 'free',
    lesson: {
      title: 'カタカナ第3回 〜マ行〜ワ行・外来語の読み方〜',
      titleTranslation: 'Katakana Bài 3 - Hàng マ〜ワ và cách đọc từ ngoại lai',
      introduction: `カタカナの残りの行「マ行・ヤ行・ラ行・ワ行」を学びます。また、英語をカタカナに変換するルールを覚えると、新しいカタカナ語を見たとき自力で読めるようになります。

Học các hàng còn lại của Katakana: マ・ヤ・ラ・ワ. Và nếu nhớ quy tắc chuyển từ tiếng Anh sang Katakana, bạn có thể tự đọc từ Katakana mới.`,
      keyPoints: [
        'マ行：マ(ma)・ミ(mi)・ム(mu)・メ(me)・モ(mo)',
        'ヤ行：ヤ(ya)・ユ(yu)・ヨ(yo)',
        'ラ行：ラ(ra)・リ(ri)・ル(ru)・レ(re)・ロ(ro)',
        'ワ行：ワ(wa)・ヲ(wo)・ン(n)',
        '英→カタカナ：語末の子音は省く/母音を加える、th→ス/ズ、v→ヴ/ブ',
        '医療・介護で最重要：リハビリ・マスク・メディカル・モニター・ユニット',
      ],
      vocabulary: [
        { word: 'リハビリ', reading: 'リハビリ', meaning: 'リハビリテーション（phục hồi chức năng）', example: 'リハビリをする' },
        { word: 'マスク', reading: 'マスク', meaning: 'マスク（khẩu trang）', example: 'マスクをつける' },
        { word: 'メディカル', reading: 'メディカル', meaning: '医療（y tế）', example: 'メディカルチェック' },
        { word: 'モニター', reading: 'モニター', meaning: 'モニター（màn hình）', example: 'モニターをみる' },
        { word: 'ユニット', reading: 'ユニット', meaning: 'ユニット（đơn vị khu）', example: 'ユニットリーダー' },
        { word: 'ラジオ', reading: 'ラジオ', meaning: 'ラジオ（radio）', example: 'ラジオをきく' },
        { word: 'ミキサー', reading: 'ミキサー', meaning: 'ミキサー（máy xay）', example: 'ミキサーしょく' },
        { word: 'ロール', reading: 'ロール', meaning: '役割（vai trò）', example: 'ロールプレイ' },
      ],
      examples: [
        { japanese: 'リハビリのじかんです。がんばりましょう。', reading: 'リハビリのじかんです。がんばりましょう。', translation: 'Đến giờ phục hồi chức năng. Cùng cố gắng nhé.' },
        { japanese: 'マスクをしてください。かんせんよぼうのため。', reading: 'マスクをしてください。かんせんよぼうのため。', translation: 'Hãy đeo khẩu trang để phòng ngừa lây nhiễm.' },
        { japanese: 'ミキサーしょくにしますか？', reading: 'ミキサーしょくにしますか？', translation: 'Bạn muốn dùng cơm nghiền máy xay không?' },
      ],
      grammarNote: `【マ〜ワ行 カタカナ対応】
ま→マ　み→ミ　む→ム　め→メ　も→モ
や→ヤ　ゆ→ユ　よ→ヨ
ら→ラ　り→リ　る→ル　れ→レ　ろ→ロ
わ→ワ　を→ヲ　ん→ン

【英語→カタカナ変換のルール】
語末子音：bed→ベッド / mask→マスク
th：health→ヘルス / bath→バス
l と r：どちらも「ラ行」で表す
er/or(語末)：→「ー」: water→ウォーター

【介護のカタカナ重要語一覧】
リハビリ / マスク / モニター / ユニット
ミキサー食 / バイタル / ヘルパー / ケア`,
      quizzes: [
        {
          question: '「リハビリ」とは何の略？',
          options: [{ id: 'a', text: 'リハビリテーション' }, { id: 'b', text: 'リズムバランス' }, { id: 'c', text: 'リラクゼーション' }, { id: 'd', text: 'リソースマネジメント' }],
          correctId: 'a',
          explanation: 'リハビリ = リハビリテーション（rehabilitation）。機能回復訓練のことです。\nリハビリ = リハビリテーション = phục hồi chức năng.',
          difficulty: 'easy' as const,
        },
        {
          question: '「ミキサー食」とは？',
          options: [{ id: 'a', text: '冷凍食品' }, { id: 'b', text: '細かく刻んだ食事' }, { id: 'c', text: 'ミキサーで滑らかにした食事' }, { id: 'd', text: '温かい食事' }],
          correctId: 'c',
          explanation: 'ミキサー食はミキサー（blender）で食材を滑らかにした流動食。嚥下困難者に提供します。\nMixa食 = thức ăn xay nhuyễn bằng máy, dành cho người khó nuốt.',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 25,
    },
  },

  // ===== N5 総復習 L10 =====
  'n5-01-10': {
    courseTitle: { ja: 'N5 ひらがな・カタカナ完全マスター', vi: 'Hoàn thiện Hiragana & Katakana N5' },
    isLocked: false, requiredPlan: 'free',
    lesson: {
      title: '総復習 〜ひらがな・カタカナ全46字テスト〜',
      titleTranslation: 'Ôn tập tổng hợp - Kiểm tra toàn bộ 46 chữ Hiragana và Katakana',
      introduction: `10回のレッスンの集大成です。ひらがな46字・カタカナ46字すべての読み書きと、介護現場でよく使う語彙を総復習します。このレッスンをクリアすれば、日本語の文字の基礎が完成です！

Đây là tổng kết 10 bài học. Ôn tổng hợp toàn bộ 46 chữ Hiragana, 46 chữ Katakana và từ vựng hay dùng trong điều dưỡng. Hoàn thành bài này là bạn đã xong nền tảng chữ tiếng Nhật!`,
      keyPoints: [
        'ひらがな46字 完全制覇：あ〜ん、濁音・半濁音・拗音・促音・長音',
        'カタカナ46字 完全制覇：ア〜ン、外来語・医療用語への応用',
        '読み書きの総確認：両方向の変換ができるか確認',
        '介護現場の必須語彙：バイタル・ナース・ケア・トイレ・リハビリ',
        '発音の注意点総まとめ：し・ち・つ・ふ、濁音・拗音・促音',
        'おめでとう！このコースで日本語学習の土台が完成しました',
      ],
      vocabulary: [
        { word: 'おつかれさまでした', reading: 'おつかれさまでした', meaning: 'お疲れ様でした（Cảm ơn vì đã vất vả）', example: '（退勤時に）おつかれさまでした' },
        { word: 'ありがとうございます', reading: 'ありがとうございます', meaning: 'ありがとう（Cảm ơn）', example: 'こころからありがとうございます' },
        { word: 'すみません', reading: 'すみません', meaning: 'すみません（Xin lỗi/Excuse me）', example: 'すみません、たすけてください' },
        { word: 'よろしくおねがいします', reading: 'よろしくおねがいします', meaning: 'よろしく（Nhờ vào）', example: 'これからよろしくおねがいします' },
        { word: 'バイタルチェック', reading: 'バイタルチェック', meaning: '生命兆候確認（kiểm tra dấu hiệu sinh tồn）', example: 'まいあさバイタルチェック' },
        { word: 'ケアプラン', reading: 'ケアプラン', meaning: '介護計画（kế hoạch chăm sóc）', example: 'ケアプランをたてる' },
        { word: 'リハビリ', reading: 'リハビリ', meaning: '機能回復訓練（phục hồi chức năng）', example: 'デイサービスでリハビリ' },
        { word: 'コミュニケーション', reading: 'コミュニケーション', meaning: '意思疎通（giao tiếp）', example: 'りようしゃとのコミュニケーション' },
      ],
      examples: [
        { japanese: 'おはようございます！バイタルをはかりますね。', reading: 'おはようございます！バイタルをはかりますね。', translation: 'Chào buổi sáng! Tôi đo dấu hiệu sinh tồn nhé.' },
        { japanese: 'ケアプランにしたがって、リハビリをおこないます。', reading: 'ケアプランにしたがって、リハビリをおこないます。', translation: 'Thực hiện phục hồi chức năng theo kế hoạch chăm sóc.' },
        { japanese: 'りようしゃとのコミュニケーションがいちばんたいせつです。', reading: 'りようしゃとのコミュニケーションがいちばんたいせつです。', translation: 'Giao tiếp với người dùng dịch vụ là quan trọng nhất.' },
      ],
      grammarNote: `【ひらがな・カタカナ 総まとめ】

■ ひらがな 全一覧
清音：あいうえお かきくけこ さしすせそ たちつてと
     なにぬねの はひふへほ まみむめも やゆよ
     らりるれろ わをん
濁音：がぎぐげご ざじずぜぞ だぢづでど ばびぶべぼ
半濁音：ぱぴぷぺぽ
拗音：きゃきゅきょ しゃしゅしょ ちゃちゅちょ etc.

■ カタカナ 全一覧
アイウエオ カキクケコ サシスセソ タチツテト
ナニヌネノ ハヒフヘホ マミムメモ ヤユヨ
ラリルレロ ワヲン

■ 介護現場で最重要の語彙
ひらがな：ごはん・くすり・おふろ・みずをのむ・ゆっくり
カタカナ：バイタル・ナース・ケア・ベッド・トイレ・リハビリ`,
      quizzes: [
        {
          question: 'カタカナで「リハビリ・テーブル・マスク」をひらがな（発音）に直すと？',
          options: [
            { id: 'a', text: 'りはびり・てーぶる・ますく' },
            { id: 'b', text: 'りあびり・てぶる・ますく' },
            { id: 'c', text: 'りはびる・てーぶ・ますっく' },
            { id: 'd', text: 'りはびり・てーぶ・ますく' },
          ],
          correctId: 'a',
          explanation: 'カタカナとひらがなは同じ発音。ー（長音記号）はそのまま伸ばします。\nKatakana và Hiragana đọc giống nhau. ー là dấu kéo dài âm.',
          difficulty: 'medium' as const,
        },
        {
          question: '介護現場でよく使うカタカナ語として正しいのは？',
          options: [
            { id: 'a', text: 'バイタル・ケア・リハビリ' },
            { id: 'b', text: 'サッカー・テニス・ゴルフ' },
            { id: 'c', text: 'レストラン・ホテル・カフェ' },
            { id: 'd', text: 'テレビ・ゲーム・アニメ' },
          ],
          correctId: 'a',
          explanation: '介護現場で頻出：バイタル(vital signs)・ケア(care)・リハビリ(rehabilitation)\nHay gặp trong điều dưỡng: バイタル・ケア・リハビリ',
          difficulty: 'easy' as const,
        },
        {
          question: '「おつかれさまでした」はどんなときに使う？',
          options: [
            { id: 'a', text: '朝のあいさつ' },
            { id: 'b', text: '仕事終わりや退勤のとき' },
            { id: 'c', text: '食事の前' },
            { id: 'd', text: '誰かに会ったとき' },
          ],
          correctId: 'b',
          explanation: '「おつかれさまでした」は仕事終わりや退勤時に使います。上司・同僚どちらにも使えます。\nDùng khi kết thúc ca làm. Dùng được với cả cấp trên và đồng nghiệp.',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 50,
    },
  },

  // ===== N5 語彙 L2 色・形・大きさ =====
  'n5-02-2': {
    courseTitle: { ja: 'N5 基礎語彙100 〜日常生活〜', vi: 'Từ vựng N5 - 100 từ cuộc sống hàng ngày' },
    isLocked: false, requiredPlan: 'free',
    lesson: {
      title: 'N5語彙 第2回 〜色・形・大きさ〜',
      titleTranslation: 'Từ vựng N5 Bài 2 - Màu sắc, hình dạng và kích thước',
      introduction: `色・形・大きさの語彙は、介護現場での状態説明に欠かせません。「皮膚が赤い」「丸い形の薬」「大きい傷」など、ケア記録や申し送りで毎日使います。

Từ vựng về màu sắc, hình dạng và kích thước rất cần thiết để mô tả tình trạng trong điều dưỡng. Như "da đỏ", "thuốc hình tròn", "vết thương lớn" dùng hàng ngày trong ghi chép chăm sóc.`,
      keyPoints: [
        '色：あか(赤)・あお(青)・きいろ(黄色)・みどり(緑)・しろ(白)・くろ(黒)・むらさき(紫)・ちゃいろ(茶色)',
        '形：まるい(丸い)・しかくい(四角い)・さんかくの(三角の)・ながい(長い)・みじかい(短い)',
        '大きさ：おおきい(大きい)・ちいさい(小さい)・ふとい(太い)・ほそい(細い)・ひろい(広い)・せまい(狭い)',
        '介護で重要：皮膚の色（あか・むらさき・きいろ）= 異常のサイン',
        '薬の形：まるい錠剤・カプセル（長い）・粉薬（こなぐすり）',
        '形容詞の活用：大きい → 大きくない（否定）/ 大きかった（過去）',
      ],
      vocabulary: [
        { word: 'あかい', reading: 'あかい', meaning: '赤い（đỏ）', example: 'かおがあかい' },
        { word: 'あおい', reading: 'あおい', meaning: '青い（xanh）', example: 'そらがあおい' },
        { word: 'しろい', reading: 'しろい', meaning: '白い（trắng）', example: 'しろいくすり' },
        { word: 'おおきい', reading: 'おおきい', meaning: '大きい（to/lớn）', example: 'おおきいへや' },
        { word: 'ちいさい', reading: 'ちいさい', meaning: '小さい（nhỏ）', example: 'ちいさいじょうざい' },
        { word: 'まるい', reading: 'まるい', meaning: '丸い（tròn）', example: 'まるいくすり' },
        { word: 'ながい', reading: 'ながい', meaning: '長い（dài）', example: 'ながいかみ' },
        { word: 'むらさき', reading: 'むらさき', meaning: '紫（tím）', example: 'むらさきいろのあざ' },
      ],
      examples: [
        { japanese: 'かおがあかくて、ねつがあります。', reading: 'かおがあかくて、ねつがあります。', translation: 'Mặt đỏ và có sốt.' },
        { japanese: 'あざがむらさきいろになっています。', reading: 'あざがむらさきいろになっています。', translation: 'Vết bầm đã chuyển sang màu tím.' },
        { japanese: 'まるいじょうざいをひとつのんでください。', reading: 'まるいじょうざいをひとつのんでください。', translation: 'Hãy uống một viên thuốc tròn.' },
      ],
      grammarNote: `【い形容詞の活用】
現在肯定：大きい / まるい
現在否定：大きくない / まるくない
過去肯定：大きかった / まるかった
過去否定：大きくなかった

【介護記録でよく使う色の表現】
皮膚の色変化：
  正常 = ふつうの色（bình thường）
  異常 = あかい（発赤）/ むらさき（内出血・あざ）/ きいろ（黄疸）/ くろずんだ（壊死）

【大きさの比較】
A は B より 大きい = A lớn hơn B
A は B と 同じ 大きさ = A và B cùng kích thước`,
      quizzes: [
        {
          question: '「あざがむらさきいろになっている」を介護記録で書くと？',
          options: [{ id: 'a', text: '打撲痕が紫色に変色している' }, { id: 'b', text: '皮膚が白い' }, { id: 'c', text: '体が大きい' }, { id: 'd', text: '薬が丸い' }],
          correctId: 'a',
          explanation: '「あざ」=「打撲痕（だぼくこん）」、「むらさきいろ」=「紫色」。介護記録では漢字表現を使います。\nVết bầm = 打撲痕, màu tím = 紫色.',
          difficulty: 'medium' as const,
        },
        {
          question: '「おおきい」の反対語は？',
          options: [{ id: 'a', text: 'ながい' }, { id: 'b', text: 'ちいさい' }, { id: 'c', text: 'まるい' }, { id: 'd', text: 'あかい' }],
          correctId: 'b',
          explanation: '「おおきい」の反対は「ちいさい」。大小（だいしょう）= kích thước lớn nhỏ.\nTrái nghĩa của おおきい là ちいさい.',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 20,
    },
  },

  // ===== N5 語彙 L3 食べ物・飲み物 =====
  'n5-02-3': {
    courseTitle: { ja: 'N5 基礎語彙100 〜日常生活〜', vi: 'Từ vựng N5 - 100 từ cuộc sống hàng ngày' },
    isLocked: false, requiredPlan: 'free',
    lesson: {
      title: 'N5語彙 第3回 〜食べ物・飲み物〜',
      titleTranslation: 'Từ vựng N5 Bài 3 - Thức ăn và đồ uống',
      introduction: `食事介助は介護の基本業務です。食べ物・飲み物の語彙を覚えると、利用者さんの好み確認・食事量記録・アレルギー対応がスムーズになります。

Hỗ trợ bữa ăn là công việc cơ bản của điều dưỡng. Nhớ từ vựng thức ăn đồ uống giúp xác nhận sở thích, ghi chép lượng ăn và xử lý dị ứng dễ dàng hơn.`,
      keyPoints: [
        '主食：ごはん(ご飯)・パン・うどん・そば・おかゆ(お粥)',
        '副食：さかな(魚)・にく(肉)・やさい(野菜)・たまご(卵)・とうふ(豆腐)',
        '飲み物：みず(水)・おちゃ(お茶)・ジュース・ぎゅうにゅう(牛乳)・スープ',
        '食感：やわらかい(柔らかい)・かたい(硬い)・きざみ食・ミキサー食・とろみ',
        '食事量：ぜんぶ(全部)・はんぶん(半分)・すこし(少し)・たくさん',
        '禁止食品：アレルギー・きんしょくひん(禁食品)・えんぶん(塩分)制限',
      ],
      vocabulary: [
        { word: 'おかゆ', reading: 'おかゆ', meaning: 'お粥（cháo）', example: 'やわらかいおかゆ' },
        { word: 'やさい', reading: 'やさい', meaning: '野菜（rau）', example: 'やさいをたべる' },
        { word: 'たまご', reading: 'たまご', meaning: '卵（trứng）', example: 'たまごりょうり' },
        { word: 'みず', reading: 'みず', meaning: '水（nước）', example: 'みずをのむ' },
        { word: 'おちゃ', reading: 'おちゃ', meaning: 'お茶（trà）', example: 'あたたかいおちゃ' },
        { word: 'はんぶん', reading: 'はんぶん', meaning: '半分（một nửa）', example: 'はんぶんしかたべない' },
        { word: 'やわらかい', reading: 'やわらかい', meaning: '柔らかい（mềm）', example: 'やわらかいしょくじ' },
        { word: 'とろみ', reading: 'とろみ', meaning: 'とろみ（độ sánh）', example: 'とろみをつける' },
      ],
      examples: [
        { japanese: 'きょうのゆうしょくは、おかゆとやさいでした。', reading: 'きょうのゆうしょくは、おかゆとやさいでした。', translation: 'Bữa tối hôm nay là cháo và rau.' },
        { japanese: 'はんぶんしかたべませんでした。のこりはかたづけます。', reading: 'はんぶんしかたべませんでした。のこりはかたづけます。', translation: 'Chỉ ăn được một nửa. Dọn phần còn lại.' },
        { japanese: 'のみこみがむずかしいので、とろみをつけています。', reading: 'のみこみがむずかしいので、とろみをつけています。', translation: 'Vì nuốt khó nên đã thêm chất làm sánh.' },
      ],
      grammarNote: `【食事量の表現】
ぜんぶ食べた = 全量摂取（toàn phần）
はんぶん食べた = 半量摂取（nửa phần）
すこしだけ食べた = 少量摂取（ít）
食べなかった = 摂取なし（không ăn）

【介護施設の食形態（しょくけいたい）】
普通食（ふつうしょく）= cơm thường
きざみ食 = thức ăn thái nhỏ
ミキサー食 = thức ăn xay nhuyễn
とろみ食 = thức ăn thêm độ sánh
経管栄養（けいかんえいよう）= nuôi qua ống

【食事記録の書き方】
夕食：お粥 / 野菜煮物 / 豆腐 → 半量摂取`,
      quizzes: [
        {
          question: '「とろみ」は何のためにつける？',
          options: [{ id: 'a', text: '味をよくするため' }, { id: 'b', text: '飲み込みやすくするため' }, { id: 'c', text: '冷ますため' }, { id: 'd', text: '量を増やすため' }],
          correctId: 'b',
          explanation: '「とろみ」は嚥下困難（えんげこんなん）の方に飲み込みやすくするために加えます。誤嚥防止が目的。\nThêm độ sánh để người khó nuốt dễ nuốt hơn, phòng ngừa sặc.',
          difficulty: 'easy' as const,
        },
        {
          question: '「はんぶんしかたべませんでした」の記録として正しいのは？',
          options: [{ id: 'a', text: '全量摂取' }, { id: 'b', text: '半量摂取' }, { id: 'c', text: '摂取なし' }, { id: 'd', text: '過剰摂取' }],
          correctId: 'b',
          explanation: '半分しか食べなかった = 「半量摂取（はんりょうせっしゅ）」と記録します。\nChỉ ăn một nửa = ghi "半量摂取" trong hồ sơ.',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 20,
    },
  },

  // ===== N5 語彙 L4 体・健康 =====
  'n5-02-4': {
    courseTitle: { ja: 'N5 基礎語彙100 〜日常生活〜', vi: 'Từ vựng N5 - 100 từ cuộc sống hàng ngày' },
    isLocked: false, requiredPlan: 'free',
    lesson: {
      title: 'N5語彙 第4回 〜体・健康〜',
      titleTranslation: 'Từ vựng N5 Bài 4 - Cơ thể và sức khỏe',
      introduction: `体の部位と健康状態の語彙は、介護現場で最も使う語彙群のひとつです。「どこが痛いですか？」「体温が高い」など、毎日の体調確認で使います。

Từ vựng về bộ phận cơ thể và tình trạng sức khỏe là nhóm từ dùng nhiều nhất trong điều dưỡng. Dùng hàng ngày khi hỏi thăm như "Đau ở đâu?", "Nhiệt độ cao".`,
      keyPoints: [
        '体の部位：あたま(頭)・かお(顔)・くび(首)・むね(胸)・おなか(お腹)・せなか(背中)・て(手)・あし(足)',
        '感覚：いたい(痛い)・かゆい(痒い)・しびれる(痺れる)・だるい(だるい)・むくむ(浮腫む)',
        '体温・バイタル：ねつ(熱)・けつあつ(血圧)・みゃくはく(脈拍)・たいおん(体温)',
        '一般症状：せき(咳)・はなみず(鼻水)・ずつう(頭痛)・めまい(めまい)・おうと(嘔吐)',
        '介護で重要：「どこがいたいですか？」「いつからですか？」「どんないたみですか？」',
        '記録表現：「右腕に痛みの訴えあり」「体温37.5℃、平熱より高め」',
      ],
      vocabulary: [
        { word: 'あたま', reading: 'あたま', meaning: '頭（đầu）', example: 'あたまがいたい' },
        { word: 'おなか', reading: 'おなか', meaning: 'お腹（bụng）', example: 'おなかがいたい' },
        { word: 'いたい', reading: 'いたい', meaning: '痛い（đau）', example: 'あしがいたい' },
        { word: 'ねつ', reading: 'ねつ', meaning: '熱（sốt）', example: 'ねつがある' },
        { word: 'せき', reading: 'せき', meaning: '咳（ho）', example: 'せきがつづく' },
        { word: 'めまい', reading: 'めまい', meaning: 'めまい（chóng mặt）', example: 'めまいがする' },
        { word: 'だるい', reading: 'だるい', meaning: 'だるい（mệt mỏi）', example: 'からだがだるい' },
        { word: 'むくむ', reading: 'むくむ', meaning: '浮腫む（phù）', example: 'あしがむくむ' },
      ],
      examples: [
        { japanese: 'どこがいたいですか？みぎのあしですか？', reading: 'どこがいたいですか？みぎのあしですか？', translation: 'Đau ở đâu ạ? Chân phải ạ?' },
        { japanese: 'たいおんは37.5どで、ねつがすこしあります。', reading: 'たいおんは37.5どで、ねつがすこしあります。', translation: 'Nhiệt độ cơ thể là 37,5 độ, hơi sốt một chút.' },
        { japanese: 'あしがむくんでいます。いつからですか？', reading: 'あしがむくんでいます。いつからですか？', translation: 'Chân bị phù. Từ khi nào vậy ạ?' },
      ],
      grammarNote: `【痛みを聞く表現】
どこが いたいですか？= Đau ở đâu?
いつから いたいですか？= Đau từ khi nào?
どんな いたみですか？= Đau như thế nào?
  → ずきずき（nhói）/ しくしく（âm ỉ）/ ずっと（liên tục）

【体の左右・上下】
みぎ = phải / ひだり = trái
うえ = trên / した = dưới
まえ = trước / うしろ = sau

【介護記録での症状表現】
「〜の訴えあり」= than đau/có lời than
「〜を認める」= nhận thấy
例：右肩に痛みの訴えあり。発赤・腫脹を認める。`,
      quizzes: [
        {
          question: '利用者さんに「どこがいたいですか？」と聞くとき、適切な日本語は？',
          options: [{ id: 'a', text: 'いたいですね' }, { id: 'b', text: 'どこがいたいですか？' }, { id: 'c', text: 'いたくないですか？' }, { id: 'd', text: 'いたいとおもいます' }],
          correctId: 'b',
          explanation: '「どこがいたいですか？」は場所を確認する正しい質問文。「が」は痛みの場所を強調する助詞。\n「どこがいたいですか？」là câu hỏi đúng để xác nhận vị trí đau.',
          difficulty: 'easy' as const,
        },
        {
          question: '「あしがむくむ」の医療用語は？',
          options: [{ id: 'a', text: '骨折（こっせつ）' }, { id: 'b', text: '浮腫（ふしゅ）' }, { id: 'c', text: '発熱（はつねつ）' }, { id: 'd', text: '嘔吐（おうと）' }],
          correctId: 'b',
          explanation: '「むくむ」の医療用語は「浮腫（ふしゅ）」。記録では「下肢に浮腫を認める」と書きます。\nむくむ = 浮腫（ふしゅ）= phù. Ghi hồ sơ: "下肢に浮腫を認める".',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 20,
    },
  },

  // ===== N5 語彙 L5 家・部屋 =====
  'n5-02-5': {
    courseTitle: { ja: 'N5 基礎語彙100 〜日常生活〜', vi: 'Từ vựng N5 - 100 từ cuộc sống hàng ngày' },
    isLocked: false, requiredPlan: 'free',
    lesson: {
      title: 'N5語彙 第5回 〜家・部屋・施設〜',
      titleTranslation: 'Từ vựng N5 Bài 5 - Nhà, phòng và cơ sở',
      introduction: `介護施設の各場所の名前や家具・設備の語彙を覚えましょう。利用者さんへの場所案内や「トイレに行きますか？」「居室に戻りましょう」などの声かけに使います。

Hãy nhớ tên các địa điểm, đồ nội thất và thiết bị trong cơ sở điều dưỡng. Dùng để hướng dẫn vị trí và gọi hỏi người dùng như "Đi vệ sinh không?" hay "Về phòng thôi nhé".`,
      keyPoints: [
        '部屋：いしつ(居室)・しょくどう(食堂)・トイレ・ふろば(風呂場)・ろうか(廊下)・エントランス',
        '家具：ベッド・テーブル・いす(椅子)・たなす(棚)・まど(窓)・ドア・カーテン',
        '場所の表現：〜のとなり(隣)・〜のまえ(前)・〜のうしろ(後ろ)・〜のなか(中)・〜のうえ(上)',
        '移動の声かけ：〜にいきましょう・〜にもどりましょう・〜まであるきましょう',
        '施設特有：ナースステーション・デイルーム・リハビリ室・受付(うけつけ)',
        '安全：「ゆっくりあるいてください」「てすりをつかってください」',
      ],
      vocabulary: [
        { word: 'いしつ', reading: 'いしつ', meaning: '居室（phòng ở）', example: 'いしつにもどる' },
        { word: 'しょくどう', reading: 'しょくどう', meaning: '食堂（phòng ăn）', example: 'しょくどうへいく' },
        { word: 'ろうか', reading: 'ろうか', meaning: '廊下（hành lang）', example: 'ろうかをあるく' },
        { word: 'まど', reading: 'まど', meaning: '窓（cửa sổ）', example: 'まどをあける' },
        { word: 'てすり', reading: 'てすり', meaning: '手すり（tay vịn）', example: 'てすりをつかう' },
        { word: 'となり', reading: 'となり', meaning: '隣（bên cạnh）', example: 'となりのへや' },
        { word: 'うけつけ', reading: 'うけつけ', meaning: '受付（lễ tân）', example: 'うけつけにいく' },
        { word: 'エレベーター', reading: 'エレベーター', meaning: 'エレベーター（thang máy）', example: 'エレベーターをつかう' },
      ],
      examples: [
        { japanese: 'しょくどうはろうかのつきあたりにあります。', reading: 'しょくどうはろうかのつきあたりにあります。', translation: 'Phòng ăn ở cuối hành lang.' },
        { japanese: 'トイレはエレベーターのとなりです。', reading: 'トイレはエレベーターのとなりです。', translation: 'Nhà vệ sinh ở bên cạnh thang máy.' },
        { japanese: 'てすりをつかって、ゆっくりあるいてください。', reading: 'てすりをつかって、ゆっくりあるいてください。', translation: 'Hãy dùng tay vịn và đi từ từ nhé.' },
      ],
      grammarNote: `【場所を表す助詞】
〜に あります = ở tại... (vật không di chuyển)
〜に います = ở tại... (người/động vật)
〜に いきます = đi đến...
〜から きます = đến từ...

【位置の表現】
〜のとなり = bên cạnh
〜のまえ = phía trước
〜のうしろ = phía sau
〜のなか = bên trong
〜のそと = bên ngoài
〜のうえ = phía trên
〜のした = phía dưới

【声かけの型】
〜に いきましょう = Hãy đi đến...
〜に もどりましょう = Hãy về...
〜を つかってください = Hãy sử dụng...`,
      quizzes: [
        {
          question: '「トイレはエレベーターのとなりです」の「となり」の意味は？',
          options: [{ id: 'a', text: '前' }, { id: 'b', text: '隣・横' }, { id: 'c', text: '上' }, { id: 'd', text: '中' }],
          correctId: 'b',
          explanation: '「となり」=「隣」= bên cạnh, kế bên。横並びの位置関係を表します。\n「となり」= 隣 = bên cạnh.',
          difficulty: 'easy' as const,
        },
        {
          question: '「〜にあります」と「〜にいます」の違いは？',
          options: [{ id: 'a', text: '同じ意味' }, { id: 'b', text: 'あります=物・場所、います=人・動物' }, { id: 'c', text: 'あります=人、います=物' }, { id: 'd', text: 'どちらも移動に使う' }],
          correctId: 'b',
          explanation: '「あります」は物・場所に、「います」は生き物（人・動物）に使います。\nあります dùng cho vật, います dùng cho người/động vật.',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 20,
    },
  },

  // ===== N5 語彙 L6 仕事・職場 =====
  'n5-02-6': {
    courseTitle: { ja: 'N5 基礎語彙100 〜日常生活〜', vi: 'Từ vựng N5 - 100 từ cuộc sống hàng ngày' },
    isLocked: false, requiredPlan: 'free',
    lesson: {
      title: 'N5語彙 第6回 〜仕事・職場〜',
      titleTranslation: 'Từ vựng N5 Bài 6 - Công việc và nơi làm việc',
      introduction: `職場でのコミュニケーションに必要な語彙を学びます。「シフト」「申し送り」「研修」など、介護の職場特有の言葉に加え、職場の基本語彙も習得します。

Học từ vựng cần thiết cho giao tiếp nơi làm việc. Ngoài các từ đặc thù của điều dưỡng như "シフト"、"申し送り"、"研修", còn học từ vựng cơ bản về nơi làm việc.`,
      keyPoints: [
        '職種：かんごし(看護師)・かいごし(介護士)・かいごふくしし(介護福祉士)・ヘルパー・リーダー',
        '業務：しごと(仕事)・きんむ(勤務)・シフト・きゅうけい(休憩)・ざんぎょう(残業)',
        '報告・連絡：もうしおくり(申し送り)・ほうこく(報告)・れんらく(連絡)・かいぎ(会議)',
        '記録：きろく(記録)・きさい(記載)・サイン・はんこ(判子)・ファイル',
        '挨拶：「よろしくおねがいします」「おせわになります」「おつかれさまでした」',
        'N5必須：〜をします・〜があります・〜をおねがいします',
      ],
      vocabulary: [
        { word: 'しごと', reading: 'しごと', meaning: '仕事（công việc）', example: 'しごとをする' },
        { word: 'きんむ', reading: 'きんむ', meaning: '勤務（ca làm）', example: 'にっきんむ・やきんむ' },
        { word: 'きゅうけい', reading: 'きゅうけい', meaning: '休憩（nghỉ giải lao）', example: 'きゅうけいじかん' },
        { word: 'もうしおくり', reading: 'もうしおくり', meaning: '申し送り（bàn giao ca）', example: 'もうしおくりをする' },
        { word: 'ほうこく', reading: 'ほうこく', meaning: '報告（báo cáo）', example: 'じょうしにほうこく' },
        { word: 'きろく', reading: 'きろく', meaning: '記録（ghi chép）', example: 'きろくをかく' },
        { word: 'けんしゅう', reading: 'けんしゅう', meaning: '研修（đào tạo）', example: 'けんしゅうにさんか' },
        { word: 'リーダー', reading: 'リーダー', meaning: 'リーダー（trưởng nhóm）', example: 'リーダーにほうこく' },
      ],
      examples: [
        { japanese: 'もうしおくりのじかんです。あつまってください。', reading: 'もうしおくりのじかんです。あつまってください。', translation: 'Đến giờ bàn giao ca rồi. Mọi người tập trung nhé.' },
        { japanese: 'なにかあったら、すぐにリーダーにほうこくしてください。', reading: 'なにかあったら、すぐにリーダーにほうこくしてください。', translation: 'Nếu có gì xảy ra, hãy báo cáo trưởng nhóm ngay.' },
        { japanese: 'きょうのきんむのきろくをかいてください。', reading: 'きょうのきんむのきろくをかいてください。', translation: 'Hãy viết ghi chép ca làm hôm nay.' },
      ],
      grammarNote: `【報告の表現】
〜がありました = đã xảy ra...
〜をしました = đã làm...
〜をほうこくします = báo cáo...

【申し送りの基本フォーマット】
① 利用者名 + ② 状態/出来事 + ③ 対応 + ④ 注意事項

例：「田中様、本日昼食半量摂取。食欲不振とのこと。
    夕食時様子確認をお願いします。」

Ví dụ bàn giao: "Ông Tanaka, hôm nay bữa trưa ăn nửa phần.
Cho biết kém ăn. Nhờ kiểm tra vào bữa tối."

【職場の基本コミュニケーション】
「〜してもいいですか？」= 許可を求める（Xin phép）
「〜をおねがいします」= 依頼する（Nhờ vả）
「わかりました」= 了解（Hiểu rồi）`,
      quizzes: [
        {
          question: '「もうしおくり」とは何をすること？',
          options: [{ id: 'a', text: '利用者に食事を渡す' }, { id: 'b', text: 'シフトの交代時に情報を引き継ぐ' }, { id: 'c', text: '薬を準備する' }, { id: 'd', text: '入浴介助をする' }],
          correctId: 'b',
          explanation: '「申し送り（もうしおくり）」はシフト交代時に、前の担当者が次の担当者に利用者の状態・注意事項を伝えること。\nBàn giao ca là truyền đạt thông tin từ ca trước sang ca sau.',
          difficulty: 'easy' as const,
        },
        {
          question: '上司に報告するとき正しい表現は？',
          options: [{ id: 'a', text: 'ねえ、田中さんが転んだよ' }, { id: 'b', text: '田中さんが転倒しました。ご報告します。' }, { id: 'c', text: '田中さん転んじゃった' }, { id: 'd', text: 'まあいいか' }],
          correctId: 'b',
          explanation: '職場では「〜しました。ご報告します。」が丁寧な報告の形式。\nTrong công việc, "〜しました。ご報告します。" là cách báo cáo lịch sự.',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 20,
    },
  },

  // ===== N5 語彙 L7 自然・天気 =====
  'n5-02-7': {
    courseTitle: { ja: 'N5 基礎語彙100 〜日常生活〜', vi: 'Từ vựng N5 - 100 từ cuộc sống hàng ngày' },
    isLocked: false, requiredPlan: 'free',
    lesson: {
      title: 'N5語彙 第7回 〜自然・天気・季節〜',
      titleTranslation: 'Từ vựng N5 Bài 7 - Thiên nhiên, thời tiết và mùa',
      introduction: `天気・季節の語彙は日常会話の基本です。利用者さんとの会話で「今日はいい天気ですね」「秋が来ましたね」などの雑談ができると、信頼関係が深まります。

Từ vựng về thời tiết và mùa là nền tảng hội thoại hàng ngày. Nếu có thể trò chuyện với người dùng như "Hôm nay thời tiết đẹp nhỉ", "Mùa thu đến rồi nhỉ", sẽ xây dựng được mối quan hệ tin tưởng.`,
      keyPoints: [
        '天気：はれ(晴れ)・くもり(曇り)・あめ(雨)・ゆき(雪)・かぜ(風)・かみなり(雷)',
        '季節：はる(春)・なつ(夏)・あき(秋)・ふゆ(冬)',
        '気温：あつい(暑い)・さむい(寒い)・あたたかい(暖かい)・すずしい(涼しい)',
        '自然：やま(山)・うみ(海)・かわ(川)・はな(花)・き(木)・みどり(緑)',
        '時間表現：あした(明日)・きのう(昨日)・らいしゅう(来週)・せんしゅう(先週)',
        '雑談の型：「〜ですね」= 同意を求める・「〜がすきです」= 好みを言う',
      ],
      vocabulary: [
        { word: 'はれ', reading: 'はれ', meaning: '晴れ（nắng）', example: 'きょうははれです' },
        { word: 'あめ', reading: 'あめ', meaning: '雨（mưa）', example: 'あめがふっています' },
        { word: 'あつい', reading: 'あつい', meaning: '暑い（nóng）', example: 'なつはあつい' },
        { word: 'さむい', reading: 'さむい', meaning: '寒い（lạnh）', example: 'ふゆはさむい' },
        { word: 'さくら', reading: 'さくら', meaning: '桜（hoa anh đào）', example: 'さくらがきれい' },
        { word: 'かぜ', reading: 'かぜ', meaning: '風（gió）', example: 'つよいかぜ' },
        { word: 'あたたかい', reading: 'あたたかい', meaning: '暖かい（ấm）', example: 'きょうはあたたかい' },
        { word: 'きせつ', reading: 'きせつ', meaning: '季節（mùa）', example: 'すきなきせつ' },
      ],
      examples: [
        { japanese: 'きょうはいいてんきですね。さんぽにいきましょうか？', reading: 'きょうはいいてんきですね。さんぽにいきましょうか？', translation: 'Hôm nay thời tiết đẹp nhỉ. Đi dạo nhé?' },
        { japanese: 'さむくなってきましたね。かぜをひかないようにしてください。', reading: 'さむくなってきましたね。かぜをひかないようにしてください。', translation: 'Trời lạnh rồi nhỉ. Hãy giữ sức khỏe không bị cảm nhé.' },
        { japanese: 'どのきせつがいちばんすきですか？', reading: 'どのきせつがいちばんすきですか？', translation: 'Bạn thích mùa nào nhất ạ?' },
      ],
      grammarNote: `【天気の表現】
〜です = thời tiết là...  (今日は晴れです)
〜がふっています = đang mưa/tuyết  (雨が降っています)
〜になりました = đã thành...  (寒くなりました)

【季節と行事】
春（3〜5月）：さくら・ひなまつり・はなみ
夏（6〜8月）：あつい・うみ・まつり・はなび
秋（9〜11月）：すずしい・もみじ・おつきみ
冬（12〜2月）：さむい・ゆき・クリスマス・おしょうがつ

【雑談のポイント（Care Conversation）】
利用者さんの故郷や好きな季節を聞く → 思い出を引き出す
「ベトナムの季節はどうですか？」も話題になる！`,
      quizzes: [
        {
          question: '「さむくなってきましたね」は何を意味する？',
          options: [{ id: 'a', text: '今日は暑い' }, { id: 'b', text: '段々寒くなってきた' }, { id: 'c', text: '昨日は寒かった' }, { id: 'd', text: '寒くない' }],
          correctId: 'b',
          explanation: '「〜くなってきました」= 変化の進行を表します。「寒くなってきた」= だんだん寒くなっている。\n〜くなってきました = đang ngày càng trở nên... (biến đổi dần)',
          difficulty: 'medium' as const,
        },
        {
          question: '「いいてんきですね」に対する自然な返答は？',
          options: [{ id: 'a', text: 'はい、そうですね。きもちがいいです。' }, { id: 'b', text: 'いいえ、てんきではありません。' }, { id: 'c', text: 'わかりません。' }, { id: 'd', text: 'てんきがきらいです。' }],
          correctId: 'a',
          explanation: '「〜ですね」には「そうですね」で同意するのが自然。さらに感想を加えると会話が続きます。\nNghe "〜ですね" thì trả lời "そうですね" là tự nhiên nhất.',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 20,
    },
  },

  // ===== N5 語彙 L8 交通・移動 =====
  'n5-02-8': {
    courseTitle: { ja: 'N5 基礎語彙100 〜日常生活〜', vi: 'Từ vựng N5 - 100 từ cuộc sống hàng ngày' },
    isLocked: false, requiredPlan: 'free',
    lesson: {
      title: 'N5語彙 第8回 〜交通・移動・方向〜',
      titleTranslation: 'Từ vựng N5 Bài 8 - Giao thông, di chuyển và phương hướng',
      introduction: `日本での生活・通勤に必要な交通語彙と、介護現場での移乗・移動介助に使う語彙を学びます。「みぎ・ひだり・まっすぐ」は毎日使います。

Học từ vựng giao thông cần cho cuộc sống và đi làm ở Nhật, cùng từ vựng hỗ trợ di chuyển trong điều dưỡng. みぎ・ひだり・まっすぐ là những từ dùng hàng ngày.`,
      keyPoints: [
        '方向：みぎ(右)・ひだり(左)・まっすぐ(直進)・うえ(上)・した(下)・まえ(前)・うしろ(後ろ)',
        '交通：でんしゃ(電車)・バス・じてんしゃ(自転車)・くるま(車)・タクシー・えき(駅)',
        '移動：あるく(歩く)・はしる(走る)・のる(乗る)・おりる(降りる)・まがる(曲がる)',
        '介護の移動介助：いじょう(移乗)・ほこう(歩行)・ほじょ(補助)・ふらつき・てんとう(転倒)',
        '車椅子：くるまいす(車椅子)・ブレーキ・フットレスト・アームレスト',
        '安全：「ゆっくりたってください」「てすりにつかまってください」「ふらつきはないですか？」',
      ],
      vocabulary: [
        { word: 'みぎ', reading: 'みぎ', meaning: '右（phải）', example: 'みぎにまがる' },
        { word: 'ひだり', reading: 'ひだり', meaning: '左（trái）', example: 'ひだりにすすむ' },
        { word: 'まっすぐ', reading: 'まっすぐ', meaning: 'まっすぐ（thẳng）', example: 'まっすぐいく' },
        { word: 'あるく', reading: 'あるく', meaning: '歩く（đi bộ）', example: 'ろうかをあるく' },
        { word: 'くるまいす', reading: 'くるまいす', meaning: '車椅子（xe lăn）', example: 'くるまいすにのる' },
        { word: 'てんとう', reading: 'てんとう', meaning: '転倒（ngã）', example: 'てんとうをふせぐ' },
        { word: 'のる', reading: 'のる', meaning: '乗る（lên）', example: 'エレベーターにのる' },
        { word: 'ふらつき', reading: 'ふらつき', meaning: 'ふらつき（loạng choạng）', example: 'ふらつきがある' },
      ],
      examples: [
        { japanese: 'エレベーターをおりて、みぎにまがってください。', reading: 'エレベーターをおりて、みぎにまがってください。', translation: 'Xuống thang máy rồi rẽ phải nhé.' },
        { japanese: 'ゆっくりたってください。ふらつきはないですか？', reading: 'ゆっくりたってください。ふらつきはないですか？', translation: 'Đứng từ từ nhé. Có bị loạng choạng không ạ?' },
        { japanese: 'くるまいすのブレーキをかけてから、おたちください。', reading: 'くるまいすのブレーキをかけてから、おたちください。', translation: 'Sau khi khóa phanh xe lăn rồi hãy đứng dậy nhé.' },
      ],
      grammarNote: `【移動介助の声かけ表現】
「〜にのります」= lên (xe, thang máy...)
「〜からおります」= xuống
「ゆっくり〜てください」= Hãy... từ từ
「〜につかまってください」= Hãy nắm vào...
「一緒に〜しましょう」= Hãy cùng...

【転倒防止の声かけ】
「足元に気をつけてください」= Chú ý chân
「段差がありますよ」= Có bậc thang đó
「ゆっくりでいいですよ」= Từ từ cũng được
「私がそばにいますよ」= Tôi đứng bên cạnh đây

【方向を教えるパターン】
エレベーターを出て → 右に曲がって → 突き当たり = 目的地`,
      quizzes: [
        {
          question: '車椅子から立ち上がる前に最初にすることは？',
          options: [{ id: 'a', text: 'フットレストをあげる' }, { id: 'b', text: 'ブレーキをかける' }, { id: 'c', text: 'アームレストをはずす' }, { id: 'd', text: 'まっすぐ立つ' }],
          correctId: 'b',
          explanation: '車椅子から立つ前は必ずブレーキをかけます。車椅子が動いて転倒するリスクを防ぐため。\nTrước khi đứng dậy từ xe lăn, phải khóa phanh trước để tránh ngã.',
          difficulty: 'easy' as const,
        },
        {
          question: '「ふらつきはないですか？」は何を確認している？',
          options: [{ id: 'a', text: '食欲があるか' }, { id: 'b', text: '立ったときにバランスが取れているか' }, { id: 'c', text: '痛みがあるか' }, { id: 'd', text: '眠れているか' }],
          correctId: 'b',
          explanation: '「ふらつき」はバランスを崩した状態。転倒リスクの確認に使います。\nふらつき = mất thăng bằng/loạng choạng. Hỏi để kiểm tra nguy cơ ngã.',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 20,
    },
  },

  // ===== N5 語彙 L9 感情・状態・挨拶 =====
  'n5-02-9': {
    courseTitle: { ja: 'N5 基礎語彙100 〜日常生活〜', vi: 'Từ vựng N5 - 100 từ cuộc sống hàng ngày' },
    isLocked: false, requiredPlan: 'free',
    lesson: {
      title: 'N5語彙 第9回 〜感情・状態・気持ち〜',
      titleTranslation: 'Từ vựng N5 Bài 9 - Cảm xúc, trạng thái và tâm trạng',
      introduction: `感情・気持ちの語彙は、利用者さんの精神的ケアに欠かせません。「うれしい・かなしい・ふあん・さみしい」など、気持ちを理解し寄り添うための言葉を学びます。

Từ vựng về cảm xúc và tâm trạng rất cần thiết trong chăm sóc tinh thần cho người dùng. Học các từ để hiểu và đồng cảm như うれしい・かなしい・ふあん・さみしい.`,
      keyPoints: [
        'ポジティブ：うれしい(嬉しい)・たのしい(楽しい)・しあわせ(幸せ)・あんしん(安心)・げんき(元気)',
        'ネガティブ：かなしい(悲しい)・さみしい(寂しい)・ふあん(不安)・こわい(怖い)・つらい(辛い)',
        '状態：つかれた(疲れた)・ねむい(眠い)・おなかがすいた(空いた)・のどがかわいた(渇いた)',
        '気持ちを聞く：「きもちはどうですか？」「なにかふあんなことはありますか？」',
        '共感の表現：「そうですか」「たいへんでしたね」「わかります」「がんばりましたね」',
        '認知症ケア：「だいじょうぶですよ」「そばにいますよ」「ゆっくりしていいですよ」',
      ],
      vocabulary: [
        { word: 'うれしい', reading: 'うれしい', meaning: '嬉しい（vui）', example: 'とてもうれしいです' },
        { word: 'さみしい', reading: 'さみしい', meaning: '寂しい（cô đơn）', example: 'さみしいきもち' },
        { word: 'ふあん', reading: 'ふあん', meaning: '不安（lo lắng）', example: 'ふあんなきもち' },
        { word: 'げんき', reading: 'げんき', meaning: '元気（khỏe mạnh）', example: 'げんきですか？' },
        { word: 'つかれた', reading: 'つかれた', meaning: '疲れた（mệt）', example: 'からだがつかれた' },
        { word: 'ねむい', reading: 'ねむい', meaning: '眠い（buồn ngủ）', example: 'ねむいですか？' },
        { word: 'こわい', reading: 'こわい', meaning: '怖い（sợ）', example: 'こわいきもち' },
        { word: 'あんしん', reading: 'あんしん', meaning: '安心（yên tâm）', example: 'あんしんしてください' },
      ],
      examples: [
        { japanese: 'きょうはげんきですか？なにかふあんなことはありますか？', reading: 'きょうはげんきですか？なにかふあんなことはありますか？', translation: 'Hôm nay khỏe không? Có điều gì lo lắng không ạ?' },
        { japanese: 'そばにいますから、あんしんしてください。', reading: 'そばにいますから、あんしんしてください。', translation: 'Tôi đứng bên cạnh đây, hãy yên tâm nhé.' },
        { japanese: 'たいへんでしたね。よくがんばりましたね。', reading: 'たいへんでしたね。よくがんばりましたね。', translation: 'Vất vả quá nhỉ. Bạn đã cố gắng giỏi lắm.' },
      ],
      grammarNote: `【気持ちを聞く・受け止める表現】
「〜はどうですか？」= ... thế nào ạ?
「〜なことはありますか？」= Có điều... không?
「そうですか」= Ra vậy ạ（受け止め）
「たいへんでしたね」= Vất vả quá nhỉ（共感）
「がんばりましたね」= Đã cố gắng thật（称賛）

【認知症ケアの基本声かけ】
「だいじょうぶですよ」= Không sao đâu
「わたしはここにいます」= Tôi ở đây
「ゆっくりしていいですよ」= Cứ thoải mái
「〜さん、おきていますか？」= Tên-さん, tỉnh không?

【感情語彙の使い分け】
ネガティブな気持ちを否定しない！
「さみしいんですね。それは当然ですよ。」
= Cô đơn nhỉ. Điều đó tự nhiên thôi.`,
      quizzes: [
        {
          question: '利用者さんが「ふあんです」と言ったとき、最もよい返答は？',
          options: [
            { id: 'a', text: 'ふあんはいけません' },
            { id: 'b', text: 'そうですか。どんなことがふあんですか？' },
            { id: 'c', text: 'だいじょうぶです' },
            { id: 'd', text: 'きにしないでください' },
          ],
          correctId: 'b',
          explanation: '不安を受け止め（そうですか）、具体的な内容を聞く（どんなことが？）のがケアの基本。否定は逆効果。\nTiếp nhận cảm xúc rồi hỏi cụ thể là nguyên tắc chăm sóc. Phủ nhận sẽ phản tác dụng.',
          difficulty: 'medium' as const,
        },
        {
          question: '「あんしんしてください」の意味は？',
          options: [{ id: 'a', text: '急いでください' }, { id: 'b', text: '心配しないでください' }, { id: 'c', text: '静かにしてください' }, { id: 'd', text: '起きてください' }],
          correctId: 'b',
          explanation: '「安心する」= không lo lắng nữa / yên tâm. 介護でよく使う声かけです。\nあんしんする = yên tâm, không lo nữa.',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 20,
    },
  },

  // ===== N5 語彙 L10 総復習 =====
  'n5-02-10': {
    courseTitle: { ja: 'N5 基礎語彙100 〜日常生活〜', vi: 'Từ vựng N5 - 100 từ cuộc sống hàng ngày' },
    isLocked: false, requiredPlan: 'free',
    lesson: {
      title: 'N5語彙 第10回 〜総復習・介護100語完全テスト〜',
      titleTranslation: 'Từ vựng N5 Bài 10 - Ôn tập tổng hợp & Kiểm tra 100 từ điều dưỡng',
      introduction: `全9回で学んだN5基礎語彙を総復習します。数字・時間・色・食事・体・職場・天気・移動・感情 — 介護現場で毎日使う100語を確認しましょう！

Ôn tập toàn bộ từ vựng N5 đã học trong 9 bài. Số đếm, thời gian, màu sắc, bữa ăn, cơ thể, nơi làm việc, thời tiết, di chuyển, cảm xúc — Kiểm tra 100 từ dùng hàng ngày trong điều dưỡng!`,
      keyPoints: [
        '数字・時間：いち〜じゅう・なんじ・まいにち・あさ・よる・じかん',
        '色・形：あかい・あおい・しろい・まるい・おおきい・ちいさい',
        '食事：ごはん・おかゆ・くすり・のむ・たべる・はんぶん・とろみ',
        '体・健康：あたま・おなか・いたい・ねつ・せき・むくむ・めまい',
        '職場・施設：しごと・きんむ・もうしおくり・いしつ・ろうか・てすり',
        '感情・声かけ：げんき・ふあん・さみしい・あんしん・ゆっくり・そばにいます',
      ],
      vocabulary: [
        { word: 'おつかれさまでした', reading: 'おつかれさまでした', meaning: 'お疲れ様（Cảm ơn vì đã vất vả）', example: 'きんむのあとに' },
        { word: 'よろしくおねがいします', reading: 'よろしくおねがいします', meaning: 'よろしく（Nhờ vào）', example: 'はじめてあうとき' },
        { word: 'ありがとうございます', reading: 'ありがとうございます', meaning: 'ありがとう（Cảm ơn）', example: 'かんしゃするとき' },
        { word: 'すみません', reading: 'すみません', meaning: 'すみません（Xin lỗi）', example: 'てつだいをたのむとき' },
        { word: 'だいじょうぶ', reading: 'だいじょうぶ', meaning: '大丈夫（ổn không）', example: 'だいじょうぶですか？' },
        { word: 'ゆっくり', reading: 'ゆっくり', meaning: 'ゆっくり（từ từ）', example: 'ゆっくりでいいですよ' },
        { word: 'きをつけて', reading: 'きをつけて', meaning: '気をつけて（cẩn thận）', example: 'あしもとにきをつけて' },
        { word: 'がんばって', reading: 'がんばって', meaning: '頑張って（cố lên）', example: 'がんばってください' },
      ],
      examples: [
        { japanese: 'おはようございます。きょうもよろしくおねがいします。バイタルをはかりますね。', reading: 'おはようございます。きょうもよろしくおねがいします。バイタルをはかりますね。', translation: 'Chào buổi sáng. Hôm nay cũng nhờ mọi người nhé. Tôi đo dấu hiệu sinh tồn nhé.' },
        { japanese: 'おなかがいたいですか？ねつもあるみたいです。ナースにほうこくします。', reading: 'おなかがいたいですか？ねつもあるみたいです。ナースにほうこくします。', translation: 'Đau bụng không? Có vẻ cũng sốt nữa. Tôi báo y tá nhé.' },
        { japanese: 'ゆっくりたってください。ふらつきはないですか？そばにいますから、あんしんしてください。', reading: 'ゆっくりたってください。ふらつきはないですか？そばにいますから、あんしんしてください。', translation: 'Đứng từ từ nhé. Có loạng choạng không? Tôi đứng bên cạnh nên hãy yên tâm nhé.' },
      ],
      grammarNote: `【N5語彙100語 総まとめ】

■ 数字・時間
いち〜じゅう・ひとつ〜とお・なんじ・〜ふん
まいにち・あした・きのう・あさ・ひる・よる

■ 色・形・大きさ
あかい・あおい・きいろい・しろい・くろい
おおきい・ちいさい・まるい・ながい

■ 食事・健康
ごはん・おかゆ・くすり・みず・おちゃ
たべる・のむ・いたい・ねつ・せき

■ 職場・施設
しごと・きんむ・もうしおくり・きろく
いしつ・しょくどう・ろうか・てすり

■ 感情・声かけ
うれしい・さみしい・ふあん・げんき
ゆっくり・だいじょうぶ・あんしん・がんばって

■ 介護の基本フレーズ BEST 10
1. おはようございます
2. どこがいたいですか？
3. ゆっくりでいいですよ
4. てすりにつかまってください
5. バイタルをはかります
6. ごはんのじかんです
7. くすりをのんでください
8. そばにいますよ
9. リーダーにほうこくします
10. おつかれさまでした`,
      quizzes: [
        {
          question: '介護現場で最も大切なコミュニケーションとして正しいのは？',
          options: [
            { id: 'a', text: '利用者の気持ちを無視して効率よく業務をこなす' },
            { id: 'b', text: '利用者の言葉に耳を傾け、気持ちに寄り添う' },
            { id: 'c', text: '専門用語だけを使って説明する' },
            { id: 'd', text: '笑顔を見せない' },
          ],
          correctId: 'b',
          explanation: '介護の基本は「傾聴・共感・寄り添い」。利用者の気持ちを大切にするコミュニケーションが最重要。\nNguyên tắc điều dưỡng là "lắng nghe, đồng cảm, đồng hành".',
          difficulty: 'easy' as const,
        },
        {
          question: '利用者が「ねつがあります。おなかもいたい」と訴えた場合の行動は？',
          options: [
            { id: 'a', text: '様子を見てそのまま放置する' },
            { id: 'b', text: 'バイタルを測定してリーダー・看護師に報告する' },
            { id: 'c', text: '自己判断で薬を渡す' },
            { id: 'd', text: '次のシフトの人に伝える' },
          ],
          correctId: 'b',
          explanation: '発熱＋腹痛は医療的判断が必要。バイタル測定→すぐにリーダー・看護師に報告が正しい手順。\nSốt + đau bụng cần đánh giá y tế. Đo dấu hiệu sinh tồn → báo cáo trưởng nhóm/y tá ngay.',
          difficulty: 'medium' as const,
        },
        {
          question: '「ゆっくりでいいですよ」はどのような場面で使う？',
          options: [
            { id: 'a', text: '利用者が急いでいるとき' },
            { id: 'b', text: '利用者が焦っているときに安心させるため' },
            { id: 'c', text: '遅刻したとき' },
            { id: 'd', text: '仕事が終わったとき' },
          ],
          correctId: 'b',
          explanation: '「ゆっくりでいいですよ」は利用者が焦ったり不安なとき、安心させる声かけ。転倒防止にも効果的。\nDùng để trấn an khi người dùng vội vàng hay lo lắng. Cũng hiệu quả phòng ngã.',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 50,
    },
  },

  // ===== N5 文法 L2: 助詞 に・で・へ =====
  'n5-03-2': {
    courseTitle: { ja: 'N5 基礎文法 〜です・ます体〜', vi: 'Ngữ pháp cơ bản N5 - thể lịch sự' },
    isLocked: false, requiredPlan: 'free',
    lesson: {
      title: '文法第2回 〜助詞「に」「で」「へ」〜',
      titleTranslation: 'Ngữ pháp Bài 2 - Trợ từ に・で・へ',
      introduction: `日本語には場所・時間・方向を表す助詞が複数あります。「に」「で」「へ」は介護現場でも毎日使う重要な助詞です。意味を正しく区別すると、利用者さんへの声かけが自然になります。

Tiếng Nhật có nhiều trợ từ chỉ địa điểm, thời gian, phương hướng. に・で・へ là 3 trợ từ quan trọng dùng hàng ngày trong điều dưỡng.`,
      keyPoints: [
        '「に」= 時間・場所（存在）・方向：7時に起きます／部屋にいます／日本に来ました',
        '「で」= 動作の場所・手段：食堂で食べます／バスで行きます',
        '「へ」= 方向（〜に近いが、より方向性を強調）：会社へ行きます',
        '存在の動詞：います（人・動物）／あります（物）',
        '時間の助詞：〜時に・〜日に・〜月に　※「今日」「明日」には付かない',
        '場所の使い分け：「〜にいる/ある」=存在 ／「〜で動詞」=動作',
      ],
      vocabulary: [
        { word: '部屋', reading: 'へや', meaning: '部屋（phòng）', example: '部屋にいます' },
        { word: '食堂', reading: 'しょくどう', meaning: '食堂（nhà ăn）', example: '食堂で食べます' },
        { word: '病院', reading: 'びょういん', meaning: '病院（bệnh viện）', example: '病院へ行きます' },
        { word: 'トイレ', reading: 'トイレ', meaning: 'お手洗い（toilet）', example: 'トイレに行きたいです' },
        { word: '車椅子', reading: 'くるまいす', meaning: '車椅子（xe lăn）', example: '車椅子で移動します' },
        { word: 'お風呂', reading: 'おふろ', meaning: 'お風呂（phòng tắm）', example: 'お風呂に入ります' },
      ],
      examples: [
        { japanese: '田中さんは部屋にいます。', reading: 'たなかさんはへやにいます。', translation: 'Anh Tanaka đang ở trong phòng.' },
        { japanese: '食堂でお昼ご飯を食べます。', reading: 'しょくどうでおひるごはんをたべます。', translation: 'Ăn trưa ở nhà ăn.' },
        { japanese: '8時にお薬を飲みましょう。', reading: 'はちじにおくすりをのみましょう。', translation: 'Hãy uống thuốc lúc 8 giờ.' },
        { japanese: '車椅子でリハビリ室へ行きます。', reading: 'くるまいすでリハビリしつへいきます。', translation: 'Đi đến phòng phục hồi bằng xe lăn.' },
      ],
      grammarNote: `【に vs で の違い】
「に」= 存在の場所（部屋にいます）／到着点（病院に行く）／時間（7時に）
「で」= 動作の場所（食堂で食べる）／手段（バスで行く）

【〜へ vs 〜に】
ほぼ同じ意味だが、「へ」は方向性、「に」は到着点を強調。
日常会話ではどちらも使えますが、丁寧な書き言葉では「へ」が好まれます。

Trong môi trường điều dưỡng:
お部屋に入ります / トイレに行きます / 食堂で食事します`,
      quizzes: [
        {
          question: '正しい文を選んでください：「7時（  ）起きます」',
          options: [{ id: 'a', text: 'で' }, { id: 'b', text: 'に' }, { id: 'c', text: 'へ' }, { id: 'd', text: 'を' }],
          correctId: 'b',
          explanation: '時間には「に」を使います。7時に起きます。\nThời gian dùng trợ từ「に」.',
          difficulty: 'easy' as const,
        },
        {
          question: '「食堂（  ）ご飯を食べます」 — 正しいのは？',
          options: [{ id: 'a', text: 'に' }, { id: 'b', text: 'で' }, { id: 'c', text: 'へ' }, { id: 'd', text: 'を' }],
          correctId: 'b',
          explanation: '動作（食べる）の場所には「で」を使います。\n「で」chỉ địa điểm hành động.',
          difficulty: 'easy' as const,
        },
        {
          question: '「田中さんは部屋（  ）います」',
          options: [{ id: 'a', text: 'で' }, { id: 'b', text: 'に' }, { id: 'c', text: 'を' }, { id: 'd', text: 'へ' }],
          correctId: 'b',
          explanation: '存在の場所には「に」を使います。「います」は人・動物の存在。\n「に」+います dùng cho sự tồn tại của người/động vật.',
          difficulty: 'easy' as const,
        },
        {
          question: '「車椅子（  ）リハビリ室へ行きます」',
          options: [{ id: 'a', text: 'に' }, { id: 'b', text: 'で' }, { id: 'c', text: 'と' }, { id: 'd', text: 'を' }],
          correctId: 'b',
          explanation: '手段（道具）には「で」を使います。「車椅子で移動」「バスで行く」。\n「で」+ phương tiện.',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 20,
    },
  },

  // ===== N5 文法 L3: 動詞ます形・過去・否定 =====
  'n5-03-3': {
    courseTitle: { ja: 'N5 基礎文法 〜です・ます体〜', vi: 'Ngữ pháp cơ bản N5 - thể lịch sự' },
    isLocked: false, requiredPlan: 'free',
    lesson: {
      title: '文法第3回 〜動詞ます形：現在・過去・否定〜',
      titleTranslation: 'Ngữ pháp Bài 3 - Động từ thể ます: hiện tại・quá khứ・phủ định',
      introduction: `動詞のます形は丁寧な日本語の基本です。現在「〜ます」、過去「〜ました」、否定「〜ません」、過去否定「〜ませんでした」の4つを正しく使い分けられると、ほとんどの介護現場の会話に対応できます。

Thể ます của động từ là cơ bản của tiếng Nhật lịch sự. Nắm vững 4 dạng cơ bản: hiện tại・quá khứ・phủ định・quá khứ phủ định.`,
      keyPoints: [
        '現在肯定：〜ます（食べます・飲みます・行きます）',
        '現在否定：〜ません（食べません・飲みません）',
        '過去肯定：〜ました（食べました・飲みました）',
        '過去否定：〜ませんでした（食べませんでした）',
        '質問形：〜ますか？（食べますか？／行きますか？）',
        '介護でよく使う動詞：起きます・寝ます・食べます・飲みます・歩きます・座ります',
      ],
      vocabulary: [
        { word: '起きます', reading: 'おきます', meaning: 'wake up', example: '7時に起きます' },
        { word: '寝ます', reading: 'ねます', meaning: 'sleep', example: '10時に寝ます' },
        { word: '歩きます', reading: 'あるきます', meaning: 'walk', example: 'ゆっくり歩きます' },
        { word: '座ります', reading: 'すわります', meaning: 'sit', example: 'こちらに座ります' },
        { word: '立ちます', reading: 'たちます', meaning: 'stand', example: 'ゆっくり立ちます' },
        { word: '飲みます', reading: 'のみます', meaning: 'drink', example: 'お薬を飲みます' },
        { word: '食べます', reading: 'たべます', meaning: 'eat', example: 'ご飯を食べます' },
        { word: '見ます', reading: 'みます', meaning: 'watch/look', example: 'テレビを見ます' },
      ],
      examples: [
        { japanese: '今朝、お薬を飲みましたか？', reading: 'けさ、おくすりをのみましたか？', translation: 'Sáng nay đã uống thuốc chưa?' },
        { japanese: 'はい、飲みました。', reading: 'はい、のみました。', translation: 'Vâng, đã uống rồi.' },
        { japanese: '昨日はお風呂に入りませんでした。', reading: 'きのうはおふろにはいりませんでした。', translation: 'Hôm qua đã không tắm.' },
        { japanese: '明日はリハビリに行きますか？', reading: 'あしたはリハビリにいきますか？', translation: 'Ngày mai có đi phục hồi chức năng không?' },
      ],
      grammarNote: `【ます形 4活用まとめ】
肯定　　現在：飲み**ます**　　過去：飲み**ました**
否定　　現在：飲み**ません**　過去：飲み**ませんでした**

【質問の作り方】
〜ますか？　文末に「か」を付けるだけ。
　例：食べます→食べますか？／来ますか？／いますか？

【介護でよく使う流れ】
朝：起きます → 顔を洗います → ご飯を食べます → お薬を飲みます
夜：お風呂に入ります → 寝ます`,
      quizzes: [
        {
          question: '「飲みます」の過去形は？',
          options: [{ id: 'a', text: '飲みません' }, { id: 'b', text: '飲みました' }, { id: 'c', text: '飲みませんでした' }, { id: 'd', text: '飲みましょう' }],
          correctId: 'b',
          explanation: '過去肯定は「〜ました」。飲みます→飲みました。\nQuá khứ khẳng định: 〜ました.',
          difficulty: 'easy' as const,
        },
        {
          question: '「昨日お風呂に入らなかった」を丁寧に言うと？',
          options: [
            { id: 'a', text: '入りません' },
            { id: 'b', text: '入りました' },
            { id: 'c', text: '入りませんでした' },
            { id: 'd', text: '入りますか' },
          ],
          correctId: 'c',
          explanation: '過去否定は「〜ませんでした」。\nQuá khứ phủ định: 〜ませんでした.',
          difficulty: 'medium' as const,
        },
        {
          question: '「Did you eat?」を日本語で？',
          options: [
            { id: 'a', text: '食べますか？' },
            { id: 'b', text: '食べましたか？' },
            { id: 'c', text: '食べませんか？' },
            { id: 'd', text: '食べますよ' },
          ],
          correctId: 'b',
          explanation: '過去の質問は「〜ましたか？」。\n「〜ましたか？」= câu hỏi quá khứ.',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 20,
    },
  },

  // ===== N5 文法 L4: い形容詞 =====
  'n5-03-4': {
    courseTitle: { ja: 'N5 基礎文法 〜です・ます体〜', vi: 'Ngữ pháp cơ bản N5 - thể lịch sự' },
    isLocked: false, requiredPlan: 'free',
    lesson: {
      title: '文法第4回 〜い形容詞〜',
      titleTranslation: 'Ngữ pháp Bài 4 - Tính từ đuôi い',
      introduction: `日本語の形容詞には「い形容詞」と「な形容詞」の2種類があります。今回は「い形容詞」を学びます。「あつい・さむい・おいしい」など末尾が「い」で終わるものです。介護では体調や気持ちを表すときによく使います。

Tính từ tiếng Nhật có 2 loại: い形容詞 và な形容詞. Bài này học 「い形容詞」 — những tính từ kết thúc bằng「い」(あつい・さむい・おいしい). Hay dùng khi mô tả tình trạng và cảm xúc.`,
      keyPoints: [
        '基本形：〜い（あつい・さむい・おいしい・たかい）',
        '現在肯定：〜いです（あついです）',
        '現在否定：〜くないです（あつくないです）',
        '過去肯定：〜かったです（あつかったです）',
        '過去否定：〜くなかったです（あつくなかったです）',
        '名詞修飾：〜い + 名詞（あつい日／おいしいご飯）',
        '※「いい」だけ特殊：いい→よくない・よかった・よくなかった',
      ],
      vocabulary: [
        { word: '熱い', reading: 'あつい', meaning: 'hot', example: 'お茶が熱いです' },
        { word: '冷たい', reading: 'つめたい', meaning: 'cold (touch)', example: '水が冷たいです' },
        { word: '寒い', reading: 'さむい', meaning: 'cold (weather)', example: '今日は寒いです' },
        { word: '暑い', reading: 'あつい', meaning: 'hot (weather)', example: '夏は暑いです' },
        { word: '痛い', reading: 'いたい', meaning: 'painful', example: 'お腹が痛いです' },
        { word: '美味しい', reading: 'おいしい', meaning: 'delicious', example: 'ご飯がおいしいです' },
        { word: '高い', reading: 'たかい', meaning: 'expensive/tall', example: '値段が高いです' },
        { word: 'いい', reading: 'いい', meaning: 'good', example: '気分がいいです' },
      ],
      examples: [
        { japanese: 'お風呂のお湯はちょうどいいですか？', reading: 'おふろのおゆはちょうどいいですか？', translation: 'Nước nóng trong bồn vừa phải không?' },
        { japanese: '今日は寒くないですよ。', reading: 'きょうはさむくないですよ。', translation: 'Hôm nay không lạnh đâu.' },
        { japanese: '昨日のお食事はおいしかったです。', reading: 'きのうのおしょくじはおいしかったです。', translation: 'Bữa ăn hôm qua ngon quá.' },
        { japanese: '体の痛い場所はありますか？', reading: 'からだのいたいばしょはありますか？', translation: 'Có chỗ nào trên người đau không?' },
      ],
      grammarNote: `【い形容詞の活用まとめ】
あつい (基本) → あついです (肯定) → あつくないです (否定)
　　　　　　　→ あつかったです (過去) → あつくなかったです (過去否定)

【特例：「いい」(良い)】
いいです → よくないです → よかったです → よくなかったです
※会話では「よい」も使う

【介護で重要な い形容詞】
痛い・熱い・冷たい・寒い・暑い・苦しい・気持ちいい`,
      quizzes: [
        {
          question: '「あつい」の否定形は？',
          options: [{ id: 'a', text: 'あついじゃない' }, { id: 'b', text: 'あつくない' }, { id: 'c', text: 'あつないい' }, { id: 'd', text: 'あつでない' }],
          correctId: 'b',
          explanation: 'い形容詞の否定は「〜い」を「〜くない」に変えます。\nい形容詞 phủ định: 〜い → 〜くない.',
          difficulty: 'easy' as const,
        },
        {
          question: '「Was delicious」の正しい言い方は？',
          options: [
            { id: 'a', text: 'おいしいでした' },
            { id: 'b', text: 'おいしかったです' },
            { id: 'c', text: 'おいしくでした' },
            { id: 'd', text: 'おいしかった' },
          ],
          correctId: 'b',
          explanation: '過去肯定：〜い → 〜かったです。「おいしかったです」。\n「い」→「かった」+「です」.',
          difficulty: 'medium' as const,
        },
        {
          question: '「いい」の過去否定形は？',
          options: [
            { id: 'a', text: 'いくなかったです' },
            { id: 'b', text: 'よくなかったです' },
            { id: 'c', text: 'いいじゃなかった' },
            { id: 'd', text: 'よかったくない' },
          ],
          correctId: 'b',
          explanation: '「いい」は特殊：いい→よくない→よかった→よくなかった。\n「いい」đặc biệt, dùng「よく〜」khi biến hình.',
          difficulty: 'hard' as const,
        },
      ],
      xpReward: 20,
    },
  },

  // ===== N5 文法 L5: な形容詞 =====
  'n5-03-5': {
    courseTitle: { ja: 'N5 基礎文法 〜です・ます体〜', vi: 'Ngữ pháp cơ bản N5 - thể lịch sự' },
    isLocked: false, requiredPlan: 'free',
    lesson: {
      title: '文法第5回 〜な形容詞〜',
      titleTranslation: 'Ngữ pháp Bài 5 - Tính từ đuôi な',
      introduction: `「な形容詞」は名詞のように扱う形容詞です。「きれい・しずか・げんき・しんぱい」など。「い形容詞」と活用が違うので注意。介護では利用者さんの状態を表すときに必須です。

「な形容詞」là loại tính từ hoạt động giống danh từ. Cách chia khác với い形容詞.`,
      keyPoints: [
        '基本形：〜な + 名詞（きれいな部屋／元気な人）',
        '現在肯定：〜です（しずかです）',
        '現在否定：〜じゃありません／〜ではありません（しずかじゃありません）',
        '過去肯定：〜でした（しずかでした）',
        '過去否定：〜じゃありませんでした（しずかじゃありませんでした）',
        '注意：「きれい・きらい」は語尾が「い」でもな形容詞！',
      ],
      vocabulary: [
        { word: '元気', reading: 'げんき', meaning: 'energetic/healthy', example: '元気な毎日' },
        { word: 'きれい', reading: 'きれい', meaning: 'clean/beautiful', example: 'きれいな部屋' },
        { word: '静か', reading: 'しずか', meaning: 'quiet', example: '静かな夜' },
        { word: '好き', reading: 'すき', meaning: 'like', example: '魚が好きです' },
        { word: '嫌い', reading: 'きらい', meaning: 'dislike', example: '辛い物が嫌いです' },
        { word: '心配', reading: 'しんぱい', meaning: 'worried', example: '心配です' },
        { word: '大丈夫', reading: 'だいじょうぶ', meaning: 'OK / fine', example: '大丈夫ですか？' },
        { word: '便利', reading: 'べんり', meaning: 'convenient', example: '便利な道具' },
      ],
      examples: [
        { japanese: '今日はお元気ですか？', reading: 'きょうはおげんきですか？', translation: 'Hôm nay anh/chị có khỏe không?' },
        { japanese: 'お部屋はとてもきれいですね。', reading: 'おへやはとてもきれいですね。', translation: 'Phòng rất sạch đẹp nhỉ.' },
        { japanese: '昨日は静かじゃありませんでした。', reading: 'きのうはしずかじゃありませんでした。', translation: 'Hôm qua không yên tĩnh.' },
        { japanese: '心配しないでください。大丈夫ですよ。', reading: 'しんぱいしないでください。だいじょうぶですよ。', translation: 'Đừng lo lắng. Không sao đâu.' },
      ],
      grammarNote: `【な形容詞の活用まとめ】
きれい → きれいです (肯定) → きれいじゃありません (否定)
　　　　　 → きれいでした (過去) → きれいじゃありませんでした (過去否定)

【名詞修飾は「な」が必要】
きれい**な**部屋 / 元気**な**人 / 静か**な**場所
※い形容詞は「い」のまま（あつい部屋）

【〜じゃありません vs 〜ではありません】
意味は同じ、「ではありません」の方が丁寧・改まった表現`,
      quizzes: [
        {
          question: '「元気な人」「きれいな部屋」— なぜ「な」が必要？',
          options: [
            { id: 'a', text: '名詞だから' },
            { id: 'b', text: 'な形容詞は名詞修飾時に「な」が必要だから' },
            { id: 'c', text: 'い形容詞だから' },
            { id: 'd', text: '動詞だから' },
          ],
          correctId: 'b',
          explanation: 'な形容詞は名詞を修飾するときに「な」を付けます。\n「な」cần khi tính từ này tu sức danh từ.',
          difficulty: 'easy' as const,
        },
        {
          question: '「きれい」の過去否定形を選んでください',
          options: [
            { id: 'a', text: 'きれいくないでした' },
            { id: 'b', text: 'きれいじゃありませんでした' },
            { id: 'c', text: 'きれいかったです' },
            { id: 'd', text: 'きれいませんでした' },
          ],
          correctId: 'b',
          explanation: 'な形容詞の過去否定は「〜じゃありませんでした」。\nQuá khứ phủ định của な形容詞: 〜じゃありませんでした.',
          difficulty: 'medium' as const,
        },
        {
          question: '次のうち「な形容詞」はどれ？',
          options: [
            { id: 'a', text: '熱い (あつい)' },
            { id: 'b', text: '美味しい (おいしい)' },
            { id: 'c', text: '元気 (げんき)' },
            { id: 'd', text: '高い (たかい)' },
          ],
          correctId: 'c',
          explanation: '「元気」は語尾が「い」じゃないのでな形容詞。「あつい・おいしい・たかい」はい形容詞。\n「元気」là な形容詞.',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 20,
    },
  },

  // ===== N5 文法 L6: 指示詞 これ・それ・あれ・どれ =====
  'n5-03-6': {
    courseTitle: { ja: 'N5 基礎文法 〜です・ます体〜', vi: 'Ngữ pháp cơ bản N5 - thể lịch sự' },
    isLocked: false, requiredPlan: 'free',
    lesson: {
      title: '文法第6回 〜指示詞 これ・それ・あれ〜',
      titleTranslation: 'Ngữ pháp Bài 6 - Đại từ chỉ định これ・それ・あれ',
      introduction: `「こ・そ・あ・ど」シリーズは日本語の重要な指示詞。物・場所・方向・人を指すときに使います。介護では「これは○○ですよ」と利用者さんに説明する場面が多いので重要です。

Hệ thống「こ・そ・あ・ど」là đại từ chỉ định quan trọng. Dùng để chỉ vật・địa điểm・phương hướng・người.`,
      keyPoints: [
        '物：これ（near me）／それ（near you）／あれ（far）／どれ（which）',
        '名詞修飾：この〜／その〜／あの〜／どの〜（この薬／その本／あの方）',
        '場所：ここ／そこ／あそこ／どこ',
        '方向：こちら／そちら／あちら／どちら',
        '人（丁寧）：こちら・そちら・あちらの方（あの方=あの人の丁寧語）',
        '応用：こんな・そんな・あんな・どんな（このような）',
      ],
      vocabulary: [
        { word: 'これ', reading: 'これ', meaning: 'this (near me)', example: 'これは薬です' },
        { word: 'それ', reading: 'それ', meaning: 'that (near you)', example: 'それを取ってください' },
        { word: 'あれ', reading: 'あれ', meaning: 'that (over there)', example: 'あれは何ですか？' },
        { word: 'この', reading: 'この', meaning: 'this (+noun)', example: 'この薬は朝飲みます' },
        { word: 'ここ', reading: 'ここ', meaning: 'here', example: 'ここに座ります' },
        { word: 'あそこ', reading: 'あそこ', meaning: 'over there', example: 'あそこにあります' },
      ],
      examples: [
        { japanese: 'これはお薬ですよ。今飲みましょうね。', reading: 'これはおくすりですよ。いまのみましょうね。', translation: 'Đây là thuốc. Uống bây giờ nhé.' },
        { japanese: 'その本を取ってください。', reading: 'そのほんをとってください。', translation: 'Lấy giúp cuốn sách đó nhé.' },
        { japanese: 'あちらが田中さんのお部屋です。', reading: 'あちらがたなかさんのおへやです。', translation: 'Bên kia là phòng của anh Tanaka.' },
        { japanese: 'どの椅子に座りますか？', reading: 'どのいすにすわりますか？', translation: 'Anh/chị ngồi vào ghế nào?' },
      ],
      grammarNote: `【こ・そ・あ・ど 体系まとめ】
　　　　　　話し手の近く｜聞き手の近く｜両方から遠い｜疑問
物　　　　　これ　　　　　それ　　　　　あれ　　　　　どれ
+名詞　　　 この〜　　　　 その〜　　　　 あの〜　　　　 どの〜
場所　　　　ここ　　　　　そこ　　　　　あそこ　　　　 どこ
方向（丁寧）こちら　　　　 そちら　　　　 あちら　　　　 どちら
状態　　　　こんな　　　　 そんな　　　　 あんな　　　　 どんな`,
      quizzes: [
        {
          question: '相手の近くにある物を指すときに使うのは？',
          options: [{ id: 'a', text: 'これ' }, { id: 'b', text: 'それ' }, { id: 'c', text: 'あれ' }, { id: 'd', text: 'どれ' }],
          correctId: 'b',
          explanation: '「それ」= 聞き手の近くにある物。\n「それ」chỉ vật ở gần người nghe.',
          difficulty: 'easy' as const,
        },
        {
          question: '「あの方は田中さんです」の意味は？',
          options: [
            { id: 'a', text: 'この人は田中さん' },
            { id: 'b', text: 'あの人（遠くの人）は田中さん（丁寧）' },
            { id: 'c', text: '田中さんはどの方ですか' },
            { id: 'd', text: '田中さんは方向です' },
          ],
          correctId: 'b',
          explanation: '「あの方」=「あの人」の丁寧な言い方。離れた所の人を指す。\n「あの方」là cách nói lịch sự của「あの人」.',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 20,
    },
  },

  // ===== N5 文法 L7: 場所表現 ここ・あります・います =====
  'n5-03-7': {
    courseTitle: { ja: 'N5 基礎文法 〜です・ます体〜', vi: 'Ngữ pháp cơ bản N5 - thể lịch sự' },
    isLocked: false, requiredPlan: 'free',
    lesson: {
      title: '文法第7回 〜場所表現 あります・います〜',
      titleTranslation: 'Ngữ pháp Bài 7 - Diễn đạt địa điểm: あります・います',
      introduction: `「あります」「います」は存在を表す動詞です。物には「あります」、人や動物には「います」を使います。介護では「○○はどこにありますか？」「△△さんはお部屋にいます」など、毎日使う表現です。

「あります」「います」là động từ chỉ sự tồn tại. 「あります」cho vật, 「います」cho người và động vật.`,
      keyPoints: [
        '物：〜があります／〜にあります（机の上に本があります）',
        '人・動物：〜がいます／〜にいます（部屋に田中さんがいます）',
        '所有・存在の質問：〜はありますか？／〜はいますか？',
        '位置：上・下・前・後ろ・隣・近く・遠く',
        '〜の上に／〜の下に／〜の中に／〜の隣に',
        '否定：〜はありません／〜はいません',
      ],
      vocabulary: [
        { word: '上', reading: 'うえ', meaning: 'on/above', example: '机の上' },
        { word: '下', reading: 'した', meaning: 'under', example: 'ベッドの下' },
        { word: '中', reading: 'なか', meaning: 'inside', example: 'お部屋の中' },
        { word: '前', reading: 'まえ', meaning: 'in front of', example: '建物の前' },
        { word: '後ろ', reading: 'うしろ', meaning: 'behind', example: '車の後ろ' },
        { word: '隣', reading: 'となり', meaning: 'next to', example: '隣の部屋' },
        { word: '近く', reading: 'ちかく', meaning: 'near', example: '駅の近く' },
      ],
      examples: [
        { japanese: 'お薬は引き出しの中にあります。', reading: 'おくすりはひきだしのなかにあります。', translation: 'Thuốc ở trong ngăn kéo.' },
        { japanese: '田中さんは食堂にいます。', reading: 'たなかさんはしょくどうにいます。', translation: 'Anh Tanaka đang ở nhà ăn.' },
        { japanese: 'トイレはどこにありますか？', reading: 'トイレはどこにありますか？', translation: 'Toilet ở đâu?' },
        { japanese: 'ベッドの隣にテーブルがあります。', reading: 'ベッドのとなりにテーブルがあります。', translation: 'Cạnh giường có cái bàn.' },
      ],
      grammarNote: `【あります vs います】
あります = 物・植物（動かないもの）
　例：本があります／病院があります
います = 人・動物（動くもの）
　例：田中さんがいます／犬がいます

【場所表現の語順】
〜は + 場所 + に + あります／います
　例：お薬は机の上にあります。

【質問パターン】
　〜はどこにありますか？／〜はどこにいますか？
　〜には何がありますか？／〜には誰がいますか？`,
      quizzes: [
        {
          question: '「机の上に本（  ）あります」',
          options: [{ id: 'a', text: 'は' }, { id: 'b', text: 'を' }, { id: 'c', text: 'が' }, { id: 'd', text: 'に' }],
          correctId: 'c',
          explanation: '存在を初めて伝えるときは「が」を使います。\n「が」dùng khi giới thiệu sự tồn tại lần đầu.',
          difficulty: 'medium' as const,
        },
        {
          question: '「田中さん」に使うのは「あります」「います」どちら？',
          options: [{ id: 'a', text: 'あります' }, { id: 'b', text: 'います' }, { id: 'c', text: 'どちらでも' }, { id: 'd', text: 'あるです' }],
          correctId: 'b',
          explanation: '人には「います」を使います。\nNgười dùng「います」.',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 20,
    },
  },

  // ===== N5 文法 L8: 数字・時間・日付 =====
  'n5-03-8': {
    courseTitle: { ja: 'N5 基礎文法 〜です・ます体〜', vi: 'Ngữ pháp cơ bản N5 - thể lịch sự' },
    isLocked: false, requiredPlan: 'free',
    lesson: {
      title: '文法第8回 〜数字・時間・日付の表現〜',
      titleTranslation: 'Ngữ pháp Bài 8 - Số đếm, giờ, ngày tháng',
      introduction: `数字・時間・日付の表現は介護で毎日使います。「3時にお薬を飲みましょう」「明日10時に検査です」など。基本の数字、時刻、日付の言い方を覚えましょう。

Số đếm, giờ giấc, ngày tháng dùng hàng ngày trong điều dưỡng. Ghi nhớ cách nói cơ bản.`,
      keyPoints: [
        '時刻：1時=いちじ、2時=にじ、4時=よじ、7時=しちじ、9時=くじ',
        '分：1分=いっぷん、3分=さんぷん、半=はん（30分）',
        '日付：1日=ついたち、2日=ふつか、3日=みっか…20日=はつか',
        '月：1月=いちがつ、4月=しがつ、7月=しちがつ、9月=くがつ',
        '曜日：月・火・水・木・金・土・日曜日',
        '助数詞：〜回（かい）／〜個（こ）／〜本（ほん）／〜人（にん）',
      ],
      vocabulary: [
        { word: '時間', reading: 'じかん', meaning: 'time', example: '何時間？' },
        { word: '半', reading: 'はん', meaning: 'half (30 min)', example: '3時半' },
        { word: '今', reading: 'いま', meaning: 'now', example: '今は3時です' },
        { word: '何時', reading: 'なんじ', meaning: 'what time', example: '今何時ですか？' },
        { word: '今日', reading: 'きょう', meaning: 'today', example: '今日は月曜日' },
        { word: '明日', reading: 'あした', meaning: 'tomorrow', example: '明日は休みです' },
        { word: '昨日', reading: 'きのう', meaning: 'yesterday', example: '昨日は雨' },
        { word: '毎日', reading: 'まいにち', meaning: 'every day', example: '毎日散歩します' },
      ],
      examples: [
        { japanese: '今、午前9時半です。', reading: 'いま、ごぜんくじはんです。', translation: 'Bây giờ là 9 giờ rưỡi sáng.' },
        { japanese: '今日は4月15日、火曜日です。', reading: 'きょうはしがつじゅうごにち、かようびです。', translation: 'Hôm nay là thứ Ba ngày 15 tháng 4.' },
        { japanese: '毎朝7時にお薬を1錠飲みます。', reading: 'まいあさしちじにおくすりをいちじょうのみます。', translation: 'Mỗi sáng 7 giờ uống 1 viên thuốc.' },
        { japanese: '次の検査は来週の水曜日です。', reading: 'つぎのけんさはらいしゅうのすいようびです。', translation: 'Xét nghiệm tiếp theo vào thứ Tư tuần sau.' },
      ],
      grammarNote: `【特殊な読み方の時間】
4時=よじ（しじ ✗）／7時=しちじ／9時=くじ／14時=じゅうよじ
1分=いっぷん／3分=さんぷん／6分=ろっぷん／8分=はっぷん／10分=じっぷん

【特殊な日付】
1日=ついたち（×いちにち）／2日=ふつか／3日=みっか／4日=よっか
5日=いつか／6日=むいか／7日=なのか／8日=ようか／9日=ここのか
10日=とおか／14日=じゅうよっか／20日=はつか／24日=にじゅうよっか

【曜日】
月=げつ／火=か／水=すい／木=もく／金=きん／土=ど／日=にち（曜日）`,
      quizzes: [
        {
          question: '「4時」の正しい読み方は？',
          options: [{ id: 'a', text: 'しじ' }, { id: 'b', text: 'よじ' }, { id: 'c', text: 'よんじ' }, { id: 'd', text: 'よっじ' }],
          correctId: 'b',
          explanation: '4時は「よじ」と読みます。「しじ」は「死時」を連想させ縁起が悪いため避ける。\n4時 đọc là「よじ」.',
          difficulty: 'medium' as const,
        },
        {
          question: '「1日」の特殊な読み方は？',
          options: [{ id: 'a', text: 'いちにち' }, { id: 'b', text: 'ひとひ' }, { id: 'c', text: 'ついたち' }, { id: 'd', text: 'いっぴ' }],
          correctId: 'c',
          explanation: '月の「1日」は「ついたち」と読みます。\n「1日」trong ngày tháng đọc là「ついたち」.',
          difficulty: 'hard' as const,
        },
      ],
      xpReward: 20,
    },
  },

  // ===== N5 文法 L9: 接続助詞 と・も・や =====
  'n5-03-9': {
    courseTitle: { ja: 'N5 基礎文法 〜です・ます体〜', vi: 'Ngữ pháp cơ bản N5 - thể lịch sự' },
    isLocked: false, requiredPlan: 'free',
    lesson: {
      title: '文法第9回 〜助詞「と」「も」「や」〜',
      titleTranslation: 'Ngữ pháp Bài 9 - Trợ từ と・も・や',
      introduction: `「と」「も」「や」は名詞をつなぐ助詞です。意味と使い方を区別すると会話がぐっと豊かになります。介護でも「ご飯とお茶」「お薬や水」など毎日使います。

「と」「も」「や」là trợ từ kết nối danh từ. Phân biệt được thì hội thoại phong phú hơn.`,
      keyPoints: [
        '「と」= 〜and〜（全部列挙）：パンと卵を食べます',
        '「や」= 〜and〜（一部列挙、他にもある）：野菜や果物を食べます',
        '「も」= 〜too / also：私も行きます／お茶もコーヒーもあります',
        '「と一緒に」= together with：田中さんと一緒にお散歩します',
        '〜と〜と〜：複数の物を全部挙げる',
        '〜や〜など：例を挙げる（など=etc.）',
      ],
      vocabulary: [
        { word: 'と', reading: 'と', meaning: 'and (all)', example: 'パンと牛乳' },
        { word: 'や', reading: 'や', meaning: 'and (some)', example: '本や雑誌' },
        { word: 'も', reading: 'も', meaning: 'also/too', example: '私も学生です' },
        { word: '一緒に', reading: 'いっしょに', meaning: 'together', example: '一緒に行きましょう' },
        { word: 'など', reading: 'など', meaning: 'etc.', example: '本やノートなど' },
      ],
      examples: [
        { japanese: '朝はパンと牛乳とりんごを食べます。', reading: 'あさはパンとぎゅうにゅうとりんごをたべます。', translation: 'Sáng ăn bánh mì, uống sữa và ăn táo.' },
        { japanese: '冷蔵庫にお茶やジュースがあります。', reading: 'れいぞうこにおちゃやジュースがあります。', translation: 'Trong tủ lạnh có trà, nước ép v.v.' },
        { japanese: '田中さんも私も日本人です。', reading: 'たなかさんもわたしもにほんじんです。', translation: 'Anh Tanaka và tôi cũng đều là người Nhật.' },
        { japanese: '一緒に体操をしましょう。', reading: 'いっしょにたいそうをしましょう。', translation: 'Cùng tập thể dục nhé.' },
      ],
      grammarNote: `【と vs や】
と：全部を列挙（A と B と C — 3つだけ）
や：一部を列挙、他にもある可能性（A や B など — 例として2つ）

【も の使い方】
〜も = 〜too / also
　例：私もベトナム人です。/ 田中さんもいます。
〜も〜も = 両方とも
　例：お茶もコーヒーもあります。

【〜と一緒に】
人と一緒に動詞 = with someone
　例：娘さんと一緒に来ました。`,
      quizzes: [
        {
          question: '「全部を列挙する」助詞は？',
          options: [{ id: 'a', text: 'や' }, { id: 'b', text: 'と' }, { id: 'c', text: 'も' }, { id: 'd', text: 'を' }],
          correctId: 'b',
          explanation: '「と」は全部を列挙、「や」は一部を列挙。\n「と」liệt kê tất cả, 「や」liệt kê một phần.',
          difficulty: 'medium' as const,
        },
        {
          question: '「私も学生です」の意味は？',
          options: [
            { id: 'a', text: '私だけが学生' },
            { id: 'b', text: '私も他の人と同じく学生' },
            { id: 'c', text: '私が一番学生' },
            { id: 'd', text: '私は学生じゃない' },
          ],
          correctId: 'b',
          explanation: '「も」= also / too。他の人と同じことを示します。\n「も」= cũng, also.',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 20,
    },
  },

  // ===== N5 文法 L10: 〜たい・〜ましょう =====
  'n5-03-10': {
    courseTitle: { ja: 'N5 基礎文法 〜です・ます体〜', vi: 'Ngữ pháp cơ bản N5 - thể lịch sự' },
    isLocked: false, requiredPlan: 'free',
    lesson: {
      title: '文法第10回 〜希望と勧誘 〜たい・〜ましょう・〜ませんか〜',
      titleTranslation: 'Ngữ pháp Bài 10 - Mong muốn và mời rủ',
      introduction: `自分の希望（〜たい）、相手を誘う（〜ましょう・〜ませんか）の表現を学びます。介護では「お風呂に入りたいです」「散歩しましょうね」など、利用者さんとの会話で必須です。

Học cách diễn đạt mong muốn (〜たい) và mời rủ (〜ましょう, 〜ませんか). Quan trọng trong giao tiếp với người được chăm sóc.`,
      keyPoints: [
        '〜たい：自分がしたい（食べたい・行きたい）※第一人称が基本',
        '〜たくない：自分がしたくない（行きたくない）',
        '〜たかったです：過去の希望（食べたかった）',
        '〜ましょう：一緒にしよう（行きましょう・食べましょう）',
        '〜ませんか：誘い（より丁寧）（一緒に行きませんか？）',
        '〜たがっています：第三者の希望（田中さんは帰りたがっています）',
      ],
      vocabulary: [
        { word: '〜たい', reading: 'たい', meaning: 'want to ~', example: '帰りたい' },
        { word: '休みたい', reading: 'やすみたい', meaning: 'want to rest', example: 'ちょっと休みたい' },
        { word: '見たい', reading: 'みたい', meaning: 'want to see', example: 'テレビを見たい' },
        { word: 'お手洗い', reading: 'おてあらい', meaning: 'restroom', example: 'お手洗いに行きたい' },
        { word: 'お散歩', reading: 'おさんぽ', meaning: 'walk', example: 'お散歩しませんか' },
      ],
      examples: [
        { japanese: 'お手洗いに行きたいです。', reading: 'おてあらいにいきたいです。', translation: 'Tôi muốn đi vệ sinh.' },
        { japanese: '一緒にお茶を飲みませんか？', reading: 'いっしょにおちゃをのみませんか？', translation: 'Cùng uống trà không?' },
        { japanese: 'もう少し休みましょう。', reading: 'もうすこしやすみましょう。', translation: 'Nghỉ thêm một chút nữa nhé.' },
        { japanese: '田中さんは帰りたがっています。', reading: 'たなかさんはかえりたがっています。', translation: 'Anh Tanaka có vẻ muốn về.' },
      ],
      grammarNote: `【作り方：ます形 → 「ます」を取って 「たい」】
食べます → 食べたい
行きます → 行きたい
飲みます → 飲みたい

【〜たい vs 〜ほしい】
〜たい = 動作の希望（行きたい）
〜ほしい = 物の希望（水がほしい）

【勧誘の丁寧度】
〜ましょう（提案）< 〜ませんか（より丁寧な誘い）
　行きましょう = let's go
　行きませんか = won't you go (with me)?`,
      quizzes: [
        {
          question: '「食べます」を「食べたい」にする変化は？',
          options: [
            { id: 'a', text: 'ます→たい' },
            { id: 'b', text: 'う→たい' },
            { id: 'c', text: 'る→たい' },
            { id: 'd', text: '何も変えない' },
          ],
          correctId: 'a',
          explanation: 'ます形の「ます」を「たい」に変えます。\n「ます」→「たい」.',
          difficulty: 'easy' as const,
        },
        {
          question: 'より丁寧な誘いは？',
          options: [
            { id: 'a', text: '行きましょう' },
            { id: 'b', text: '行きませんか' },
            { id: 'c', text: '行こう' },
            { id: 'd', text: '行きます' },
          ],
          correctId: 'b',
          explanation: '「〜ませんか」の方が丁寧。「〜ましょう」は提案。\n「〜ませんか」lịch sự hơn「〜ましょう」.',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 20,
    },
  },

  // ===== N5 文法 L11: 〜てください・〜てもいい =====
  'n5-03-11': {
    courseTitle: { ja: 'N5 基礎文法 〜です・ます体〜', vi: 'Ngữ pháp cơ bản N5 - thể lịch sự' },
    isLocked: false, requiredPlan: 'free',
    lesson: {
      title: '文法第11回 〜依頼と許可 〜てください・〜てもいいですか〜',
      titleTranslation: 'Ngữ pháp Bài 11 - Yêu cầu và xin phép',
      introduction: `相手に何かをお願いする「〜てください」、許可を求める「〜てもいいですか」は介護で毎日使う重要表現です。「ゆっくり立ってください」「お部屋に入ってもいいですか？」など。

「〜てください」(yêu cầu) và 「〜てもいいですか」(xin phép) là biểu hiện quan trọng dùng hàng ngày.`,
      keyPoints: [
        '〜てください：丁寧な依頼（座ってください）',
        '〜ないでください：禁止の依頼（無理しないでください）',
        '〜てもいいですか：許可を求める（入ってもいいですか）',
        '〜てはいけません：禁止（走ってはいけません）',
        'て形の作り方：1グループ動詞・2グループ動詞・3グループ動詞で異なる',
        '介護現場：「ゆっくり起きてください」「ここに座ってもいいですよ」',
      ],
      vocabulary: [
        { word: '〜てください', reading: 'てください', meaning: 'please ~', example: '座ってください' },
        { word: '〜てもいい', reading: 'てもいい', meaning: 'may I ~', example: '入ってもいい？' },
        { word: '無理', reading: 'むり', meaning: 'too much / impossible', example: '無理しないで' },
        { word: 'ゆっくり', reading: 'ゆっくり', meaning: 'slowly', example: 'ゆっくり歩いて' },
        { word: '少し', reading: 'すこし', meaning: 'a little', example: '少し待って' },
      ],
      examples: [
        { japanese: 'ゆっくり立ってください。', reading: 'ゆっくりたってください。', translation: 'Hãy đứng dậy từ từ.' },
        { japanese: 'お薬を飲んでください。', reading: 'おくすりをのんでください。', translation: 'Hãy uống thuốc.' },
        { japanese: 'ここに座ってもいいですか？', reading: 'ここにすわってもいいですか？', translation: 'Tôi ngồi đây được không?' },
        { japanese: '無理をしないでくださいね。', reading: 'むりをしないでくださいね。', translation: 'Đừng cố quá nhé.' },
      ],
      grammarNote: `【て形の作り方（簡略）】
う・つ・る → って（買う→買って／立つ→立って）
ぶ・む・ぬ → んで（呼ぶ→呼んで／飲む→飲んで）
く → いて（書く→書いて）／ぐ → いで（泳ぐ→泳いで）
す → して（話す→話して）
特例：行く→行って／する→して／来る→来て

【〜ないでください】
動詞の「ない形」+ でください
　走らないでください = please don't run
　心配しないでください = please don't worry`,
      quizzes: [
        {
          question: '「座る」の「て形」は？',
          options: [{ id: 'a', text: '座いて' }, { id: 'b', text: '座って' }, { id: 'c', text: '座んで' }, { id: 'd', text: '座して' }],
          correctId: 'b',
          explanation: '「座る」は「る」グループ。て形は「座って」。\n「座る」+ て形 = 「座って」.',
          difficulty: 'medium' as const,
        },
        {
          question: '許可を求めるときに使うのは？',
          options: [
            { id: 'a', text: '〜てください' },
            { id: 'b', text: '〜てもいいですか' },
            { id: 'c', text: '〜ないでください' },
            { id: 'd', text: '〜てはいけません' },
          ],
          correctId: 'b',
          explanation: '「〜てもいいですか」= May I ~ ?\n「〜てもいいですか」= Tôi có thể ~ không?',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 20,
    },
  },

  // ===== N5 文法 L12: 〜ています =====
  'n5-03-12': {
    courseTitle: { ja: 'N5 基礎文法 〜です・ます体〜', vi: 'Ngữ pháp cơ bản N5 - thể lịch sự' },
    isLocked: false, requiredPlan: 'free',
    lesson: {
      title: '文法第12回 〜進行・状態の「〜ています」〜',
      titleTranslation: 'Ngữ pháp Bài 12 - Thể tiếp diễn 〜ています',
      introduction: `「〜ています」は今していること（進行）と、今の状態を表します。介護では「今、お食事をしています」「結婚しています」「眠っています」など重要な表現です。

「〜ています」diễn đạt hành động đang xảy ra và trạng thái hiện tại.`,
      keyPoints: [
        '進行形：今〜している（食べています・寝ています）',
        '状態：結婚しています／知っています／住んでいます',
        '繰り返しの習慣：毎日散歩しています',
        '職業：先生をしています／看護師をしています',
        '否定：〜ていません（食べていません）',
        '質問：〜ていますか？（起きていますか？）',
      ],
      vocabulary: [
        { word: '住んでいます', reading: 'すんでいます', meaning: 'live (in)', example: '東京に住んでいます' },
        { word: '結婚', reading: 'けっこん', meaning: 'marriage', example: '結婚しています' },
        { word: '知る', reading: 'しる', meaning: 'know', example: '知っています' },
        { word: '働く', reading: 'はたらく', meaning: 'work', example: '介護施設で働いています' },
        { word: '眠る', reading: 'ねむる', meaning: 'sleep', example: '眠っています' },
      ],
      examples: [
        { japanese: '田中さんは今、お食事をしています。', reading: 'たなかさんはいま、おしょくじをしています。', translation: 'Anh Tanaka đang ăn bây giờ.' },
        { japanese: '私は介護施設で働いています。', reading: 'わたしはかいごしせつではたらいています。', translation: 'Tôi đang làm việc ở cơ sở chăm sóc.' },
        { japanese: 'もう田中さんは眠っていますか？', reading: 'もうたなかさんはねむっていますか？', translation: 'Anh Tanaka đã ngủ chưa?' },
        { japanese: 'ベトナム語を少し知っています。', reading: 'ベトナムごをすこししっています。', translation: 'Tôi biết một chút tiếng Việt.' },
      ],
      grammarNote: `【〜ています の3つの意味】
1. 進行：今〜している（テレビを見ています）
2. 状態：〜の状態（結婚しています／めがねをかけています）
3. 習慣：毎日〜している（毎日散歩しています）

【「知っています」の特殊性】
肯定：知っています（I know）
否定：知りません（×知っていません） — 「I don't know」

【職業の表現】
〜の仕事をしています／〜をしています
　例：介護士をしています／日本語を教えています`,
      quizzes: [
        {
          question: '「今、テレビを見ています」の「〜ています」の意味は？',
          options: [
            { id: 'a', text: '過去形' },
            { id: 'b', text: '進行形（今〜している）' },
            { id: 'c', text: '希望' },
            { id: 'd', text: '禁止' },
          ],
          correctId: 'b',
          explanation: '進行形：今行っている動作を表す。\n「〜ています」chỉ hành động đang xảy ra.',
          difficulty: 'easy' as const,
        },
        {
          question: '「I don\'t know」を日本語で？',
          options: [
            { id: 'a', text: '知っていません' },
            { id: 'b', text: '知りません' },
            { id: 'c', text: '知らないです' },
            { id: 'd', text: 'b と c の両方' },
          ],
          correctId: 'd',
          explanation: '「知っていません」は使いません。「知りません」「知らないです」が正しい。\n「知らない」/「知りません」là đúng.',
          difficulty: 'hard' as const,
        },
      ],
      xpReward: 20,
    },
  },

  // ===== N5 文法 L13: 比較表現 =====
  'n5-03-13': {
    courseTitle: { ja: 'N5 基礎文法 〜です・ます体〜', vi: 'Ngữ pháp cơ bản N5 - thể lịch sự' },
    isLocked: false, requiredPlan: 'free',
    lesson: {
      title: '文法第13回 〜比較表現 〜より・〜のほうが〜',
      titleTranslation: 'Ngữ pháp Bài 13 - So sánh 〜より, 〜のほうが',
      introduction: `2つの物を比べるときは「〜より」「〜のほうが」を使います。「コーヒーより、お茶のほうが好きです」など。介護でも「今日は昨日より調子がいいです」のように使います。

So sánh 2 thứ dùng「〜より」「〜のほうが」. Hữu ích để diễn đạt sở thích, tình trạng.`,
      keyPoints: [
        'AよりBのほうが〜：A < B（コーヒーよりお茶のほうが好き）',
        'AはBより〜：A > B（東京は大阪より大きい）',
        'AとB、どちらが〜ですか：質問（コーヒーとお茶、どちらが好き）',
        'AとBとCの中で、〜が一番〜：最上級（家族の中で母が一番優しい）',
        'もっと〜：more（もっとゆっくり）',
        '〜と同じ：same as（昨日と同じ）',
      ],
      vocabulary: [
        { word: '〜より', reading: 'より', meaning: 'than', example: 'AはBより大きい' },
        { word: '〜のほうが', reading: 'のほうが', meaning: '〜 is more', example: 'お茶のほうが好き' },
        { word: '一番', reading: 'いちばん', meaning: 'the most', example: '一番おいしい' },
        { word: 'もっと', reading: 'もっと', meaning: 'more', example: 'もっとゆっくり' },
        { word: 'どちら', reading: 'どちら', meaning: 'which (of 2)', example: 'どちらが好き？' },
      ],
      examples: [
        { japanese: '今日は昨日より調子がいいです。', reading: 'きょうはきのうよりちょうしがいいです。', translation: 'Hôm nay khỏe hơn hôm qua.' },
        { japanese: 'コーヒーとお茶、どちらがいいですか？', reading: 'コーヒーとおちゃ、どちらがいいですか？', translation: 'Cà phê hay trà, anh/chị thích cái nào?' },
        { japanese: 'お茶のほうが好きです。', reading: 'おちゃのほうがすきです。', translation: 'Tôi thích trà hơn.' },
        { japanese: '家族の中でお母さんが一番優しいです。', reading: 'かぞくのなかでおかあさんがいちばんやさしいです。', translation: 'Trong gia đình, mẹ là người dịu dàng nhất.' },
      ],
      grammarNote: `【比較表現の基本パターン】
1. AはBより〜（A is more 〜 than B）
　 東京は大阪より大きいです
2. AよりBのほうが〜（B is more 〜 than A）
　 大阪より東京のほうが大きいです
3. AとB、どちらが〜（質問）
　 コーヒーとお茶、どちらが好きですか？
4. 〜の中で〜が一番〜（最上級）
　 季節の中で春が一番好きです`,
      quizzes: [
        {
          question: '「お茶のほうが好き」の意味は？',
          options: [
            { id: 'a', text: 'お茶を好きじゃない' },
            { id: 'b', text: '他のものより、お茶が好き' },
            { id: 'c', text: 'お茶が一番好き' },
            { id: 'd', text: 'お茶を飲みたい' },
          ],
          correctId: 'b',
          explanation: '「〜のほうが好き」= 比較してこちらが好き。\n「〜のほうが好き」= thích cái này hơn (so sánh).',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 20,
    },
  },

  // ===== N5 文法 L14: 接続詞 =====
  'n5-03-14': {
    courseTitle: { ja: 'N5 基礎文法 〜です・ます体〜', vi: 'Ngữ pháp cơ bản N5 - thể lịch sự' },
    isLocked: false, requiredPlan: 'free',
    lesson: {
      title: '文法第14回 〜接続詞 〜から・〜が・〜ので〜',
      titleTranslation: 'Ngữ pháp Bài 14 - Liên từ 〜から・〜が・〜ので',
      introduction: `2つの文をつなぐ接続詞を学びます。「〜から」「〜ので」（理由）、「〜が」「〜けれど」（逆接）。介護では「お腹が痛いから、お薬を飲みます」のように頻繁に使います。

Học liên từ kết nối câu: 「〜から」「〜ので」(lý do), 「〜が」「〜けれど」(trái ngược).`,
      keyPoints: [
        '〜から：理由（カジュアル〜中立）寒いから上着を着ます',
        '〜ので：理由（より丁寧）暑いので、窓を開けてもいいですか',
        '〜が：逆接（but）寒いですが、大丈夫です',
        '〜けど／〜けれど：逆接（カジュアル）',
        '〜とき：when（食事のとき／薬を飲むとき）',
        '〜ながら：while（テレビを見ながらご飯を食べる）',
      ],
      vocabulary: [
        { word: '〜から', reading: 'から', meaning: 'because', example: '寒いから' },
        { word: '〜ので', reading: 'ので', meaning: 'because (polite)', example: '暑いので' },
        { word: '〜が', reading: 'が', meaning: 'but', example: '寒いですが' },
        { word: '〜とき', reading: 'とき', meaning: 'when', example: '食事のとき' },
        { word: '〜ながら', reading: 'ながら', meaning: 'while', example: '見ながら' },
      ],
      examples: [
        { japanese: 'お腹が痛いので、お薬を飲みたいです。', reading: 'おなかがいたいので、おくすりをのみたいです。', translation: 'Vì đau bụng nên tôi muốn uống thuốc.' },
        { japanese: '寒いですが、大丈夫です。', reading: 'さむいですが、だいじょうぶです。', translation: 'Tuy lạnh nhưng không sao.' },
        { japanese: 'お薬を飲むとき、お水を一緒に飲んでください。', reading: 'おくすりをのむとき、おみずをいっしょにのんでください。', translation: 'Khi uống thuốc, hãy uống cùng nước.' },
        { japanese: 'テレビを見ながらお茶を飲みます。', reading: 'テレビをみながらおちゃをのみます。', translation: 'Vừa xem TV vừa uống trà.' },
      ],
      grammarNote: `【〜から vs 〜ので】
〜から：話し手の主観的理由・カジュアル
〜ので：客観的理由・より丁寧（介護現場で推奨）
　例：暑い**ので**、窓を開けてもいいですか？

【〜が vs 〜けれど】
意味は同じ「but」、〜が はやや改まった表現
　寒いです**が**、外出します。
　寒いです**けれど**、外出します。（カジュアル）

【〜ながら】
2つの動作を同時に。動詞のます形 + ながら
　例：歩きながら話す／聞きながらメモを取る`,
      quizzes: [
        {
          question: 'より丁寧な理由の表現は？',
          options: [{ id: 'a', text: '〜から' }, { id: 'b', text: '〜ので' }, { id: 'c', text: '〜が' }, { id: 'd', text: '〜けど' }],
          correctId: 'b',
          explanation: '「〜ので」のほうが丁寧で客観的。介護現場では推奨。\n「〜ので」lịch sự hơn 「〜から」.',
          difficulty: 'medium' as const,
        },
        {
          question: '「歩きながら話す」の意味は？',
          options: [
            { id: 'a', text: '歩いてから話す' },
            { id: 'b', text: '歩きと話す' },
            { id: 'c', text: '歩くと同時に話す' },
            { id: 'd', text: '話す前に歩く' },
          ],
          correctId: 'c',
          explanation: '「〜ながら」= while doing 〜（同時動作）。\n「〜ながら」= vừa ~ vừa ~.',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 20,
    },
  },

  // ===== N5 文法 L15: 総復習テスト =====
  'n5-03-15': {
    courseTitle: { ja: 'N5 基礎文法 〜です・ます体〜', vi: 'Ngữ pháp cơ bản N5 - thể lịch sự' },
    isLocked: false, requiredPlan: 'free',
    lesson: {
      title: '文法第15回 〜総復習テスト〜',
      titleTranslation: 'Ngữ pháp Bài 15 - Kiểm tra tổng hợp',
      introduction: `N5基礎文法の総復習テストです。L1〜L14で学んだ「です・ます体」「助詞」「動詞活用」「形容詞」「指示詞」「あります・います」「数字・時間」「接続詞」などを横断的に確認します。8問正解で合格、ボーナスXPがもらえます！

Kiểm tra tổng hợp ngữ pháp cơ bản N5. Ôn tập toàn bộ nội dung từ Bài 1 đến Bài 14. Đạt 8/15 sẽ qua bài.`,
      keyPoints: [
        'です・ます体（4活用：現在肯定・否定・過去・過去否定）',
        '助詞：は・が・を・に・で・へ・と・も・や',
        'い形容詞 vs な形容詞の活用',
        'こ・そ・あ・ど指示詞体系',
        'あります（物）・います（人/動物）',
        '時刻・日付の特殊な読み方',
        '〜たい・〜ましょう・〜てください・〜ています',
        '比較（より・のほうが・一番）と接続詞（から・ので・が）',
      ],
      vocabulary: [
        { word: '復習', reading: 'ふくしゅう', meaning: 'review', example: '復習をします' },
        { word: '練習', reading: 'れんしゅう', meaning: 'practice', example: '毎日練習' },
        { word: '理解', reading: 'りかい', meaning: 'understanding', example: '理解しました' },
        { word: 'がんばって', reading: 'がんばって', meaning: 'do your best', example: 'がんばってください' },
      ],
      examples: [
        { japanese: 'L1〜L14の文法を全部使って会話できますか？', reading: 'エルいちからエルじゅうよんのぶんぽうをぜんぶつかってかいわできますか？', translation: 'Bạn có thể hội thoại bằng toàn bộ ngữ pháp Bài 1-14 không?' },
        { japanese: '練習を続けると、N5レベルに到達します。', reading: 'れんしゅうをつづけると、エヌごレベルにとうたつします。', translation: 'Tiếp tục luyện tập sẽ đạt trình độ N5.' },
      ],
      grammarNote: `【N5基礎文法 全体まとめ】

★ です・ます体
肯定：飲みます／否定：飲みません／過去：飲みました／過去否定：飲みませんでした

★ 助詞のキーポイント
は（テーマ）／が（主語強調）／を（動作対象）
に（時間・場所・方向）／で（動作場所・手段）／へ（方向）
と（全部）／や（一部）／も（〜も）

★ 形容詞活用
い形容詞：あつい→あついです→あつくないです→あつかったです→あつくなかったです
な形容詞：きれい→きれいです→きれいじゃありません→きれいでした

★ 重要な決まり文句
〜たいです（希望）／〜ましょう（提案）／〜ませんか（誘い）
〜てください（依頼）／〜てもいいですか（許可）／〜ています（進行/状態）

このコース修了後は「N5会話」「N5医療日本語」へ進んでください！`,
      quizzes: [
        {
          question: '「私はベトナム人（  ）」 — 正しい助詞は？',
          options: [{ id: 'a', text: 'を' }, { id: 'b', text: 'は' }, { id: 'c', text: 'です' }, { id: 'd', text: 'に' }],
          correctId: 'c',
          explanation: '名詞文：「Aは Bです」。「私はベトナム人です」が正しい文。\n「私はベトナム人です」là câu đúng.',
          difficulty: 'easy' as const,
        },
        {
          question: '「7時に起きました」の「に」の役割は？',
          options: [
            { id: 'a', text: '場所' },
            { id: 'b', text: '時間' },
            { id: 'c', text: '手段' },
            { id: 'd', text: '方向' },
          ],
          correctId: 'b',
          explanation: '時間には「に」を使います。7時**に**起きます。\n「に」+ thời gian.',
          difficulty: 'easy' as const,
        },
        {
          question: '「あつい」の過去形は？',
          options: [
            { id: 'a', text: 'あついでした' },
            { id: 'b', text: 'あつかったです' },
            { id: 'c', text: 'あつでした' },
            { id: 'd', text: 'あつくでした' },
          ],
          correctId: 'b',
          explanation: 'い形容詞の過去：〜い→〜かったです。\n「〜い」→「〜かったです」.',
          difficulty: 'medium' as const,
        },
        {
          question: '「きれい」の現在否定は？',
          options: [
            { id: 'a', text: 'きれくない' },
            { id: 'b', text: 'きれいじゃありません' },
            { id: 'c', text: 'きれいくないです' },
            { id: 'd', text: 'きれいでない' },
          ],
          correctId: 'b',
          explanation: '「きれい」はな形容詞。否定は「〜じゃありません」。\n「きれい」là な形容詞.',
          difficulty: 'medium' as const,
        },
        {
          question: '「田中さんはどこ（  ）いますか？」',
          options: [{ id: 'a', text: 'で' }, { id: 'b', text: 'に' }, { id: 'c', text: 'を' }, { id: 'd', text: 'へ' }],
          correctId: 'b',
          explanation: '存在の場所には「に」。「います」の前は必ず「に」。\n「に」+います.',
          difficulty: 'medium' as const,
        },
        {
          question: '「お薬を飲みたいです」の意味は？',
          options: [
            { id: 'a', text: 'お薬を飲んだ' },
            { id: 'b', text: 'お薬を飲みたい（希望）' },
            { id: 'c', text: 'お薬を飲まない' },
            { id: 'd', text: 'お薬がほしい' },
          ],
          correctId: 'b',
          explanation: '「〜たい」は自分の希望を表す。\n「〜たい」= mong muốn.',
          difficulty: 'easy' as const,
        },
        {
          question: '「ゆっくり座ってください」の文型は？',
          options: [
            { id: 'a', text: '希望' },
            { id: 'b', text: '依頼' },
            { id: 'c', text: '禁止' },
            { id: 'd', text: '比較' },
          ],
          correctId: 'b',
          explanation: '「〜てください」= 丁寧な依頼。\n「〜てください」= yêu cầu lịch sự.',
          difficulty: 'easy' as const,
        },
        {
          question: '「コーヒーとお茶、どちらが好きですか？」と聞かれたら？',
          options: [
            { id: 'a', text: '比較の質問' },
            { id: 'b', text: '時間の質問' },
            { id: 'c', text: '場所の質問' },
            { id: 'd', text: '理由の質問' },
          ],
          correctId: 'a',
          explanation: '「どちら」= 2つを比較。比較の質問。\n「どちら」= câu hỏi so sánh.',
          difficulty: 'medium' as const,
        },
        {
          question: '「お腹が痛い（  ）、お薬を飲みます」（理由を表す丁寧な接続）',
          options: [{ id: 'a', text: 'が' }, { id: 'b', text: 'けど' }, { id: 'c', text: 'ので' }, { id: 'd', text: 'のに' }],
          correctId: 'c',
          explanation: '「〜ので」= 理由を表す丁寧な接続。\n「〜ので」= lý do (lịch sự).',
          difficulty: 'medium' as const,
        },
        {
          question: '「テレビを見（  ）ご飯を食べます」（同時動作）',
          options: [
            { id: 'a', text: 'ながら' },
            { id: 'b', text: 'けど' },
            { id: 'c', text: 'から' },
            { id: 'd', text: 'ので' },
          ],
          correctId: 'a',
          explanation: '同時動作は「ます形+ながら」。「見ます」→「見ながら」。\n「〜ながら」= vừa ~ vừa ~.',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 50,
    },
  },
};

// Fallback lesson for unknown IDs
const fallbackLesson: LessonData = {
  courseTitle: { ja: 'コース', vi: 'Khóa học' },
  isLocked: false,
  requiredPlan: 'free',
  lesson: {
    title: '介護の基本語彙 — レッスン1',
    titleTranslation: 'Từ vựng điều dưỡng cơ bản — Bài 1',
    introduction: `今日は介護現場でよく使う基本的な言葉を学びましょう。\n\nHôm nay chúng ta sẽ học những từ cơ bản thường dùng trong môi trường chăm sóc điều dưỡng.`,
    keyPoints: [
      'お体の具合はいかがですか？— 体調を確認する',
      'お食事の時間です — 食事の時間を知らせる',
      'ゆっくりでいいですよ — 焦らせずに安心させる',
    ],
    vocabulary: [
      { word: '具合', reading: 'ぐあい', meaning: '体の調子（tình trạng sức khỏe）', example: '具合はいかがですか' },
      { word: '食事', reading: 'しょくじ', meaning: '食べること（bữa ăn）', example: 'お食事の時間' },
    ],
    examples: [
      { japanese: 'お体の具合はいかがですか？', reading: 'おからだのぐあいはいかがですか？', translation: 'Cơ thể bạn cảm thấy thế nào?' },
      { japanese: 'ゆっくり休んでください。', reading: 'ゆっくりやすんでください。', translation: 'Hãy nghỉ ngơi từ từ nhé.' },
    ],
    quiz: {
      question: '「お体の具合はいかがですか？」の意味は？',
      options: [
        { id: 'a', text: 'ご飯を食べましたか？' },
        { id: 'b', text: '体の調子はどうですか？' },
        { id: 'c', text: 'どこに行きますか？' },
        { id: 'd', text: '何時ですか？' },
      ],
      correctId: 'b',
      explanation: '「具合」は「調子・状態」という意味です。相手の健康状態を丁寧に聞く表現です。\n"具合" có nghĩa là "tình trạng". Đây là cách hỏi lịch sự về sức khỏe.',
    },
    xpReward: 20,
  },
};

// ── Course lesson lists ──────────────────────────────────────
const courseLessonMap: Record<string, string[]> = {
  'n5-01': ['n5-01', 'n5-01-2', 'n5-01-3', 'n5-01-4', 'n5-01-5', 'n5-01-6', 'n5-01-7', 'n5-01-8', 'n5-01-9', 'n5-01-10'],
  'n5-02': ['n5-02', 'n5-02-2', 'n5-02-3', 'n5-02-4', 'n5-02-5', 'n5-02-6', 'n5-02-7', 'n5-02-8', 'n5-02-9', 'n5-02-10'],
  'n5-03': ['n5-03', 'n5-03-2', 'n5-03-3', 'n5-03-4', 'n5-03-5', 'n5-03-6', 'n5-03-7', 'n5-03-8', 'n5-03-9', 'n5-03-10', 'n5-03-11', 'n5-03-12', 'n5-03-13', 'n5-03-14', 'n5-03-15'],
  'n5-04': ['n5-04', 'n5-04-2', 'n5-04-3', 'n5-04-4', 'n5-04-5', 'n5-04-6', 'n5-04-7', 'n5-04-8', 'n5-04-9', 'n5-04-10', 'n5-04-11', 'n5-04-12'],
  'n5-05': ['n5-05', 'n5-05-2', 'n5-05-3', 'n5-05-4', 'n5-05-5', 'n5-05-6', 'n5-05-7', 'n5-05-8'],
  'n4-01': ['n4-01', 'n4-01-2', 'n4-01-3', 'n4-01-4', 'n4-01-5', 'n4-01-6', 'n4-01-7', 'n4-01-8', 'n4-01-9', 'n4-01-10', 'n4-01-11', 'n4-01-12', 'n4-01-13', 'n4-01-14', 'n4-01-15', 'n4-01-16', 'n4-01-17', 'n4-01-18', 'n4-01-19', 'n4-01-20'],
  'n4-03': ['n4-03', 'n4-03-2', 'n4-03-3', 'n4-03-4', 'n4-03-5', 'n4-03-6', 'n4-03-7', 'n4-03-8', 'n4-03-9', 'n4-03-10', 'n4-03-11', 'n4-03-12', 'n4-03-13', 'n4-03-14', 'n4-03-15', 'n4-03-16', 'n4-03-17', 'n4-03-18'],
  'n4-02': ['n4-02', 'n4-02-2', 'n4-02-3', 'n4-02-4', 'n4-02-5', 'n4-02-6', 'n4-02-7', 'n4-02-8', 'n4-02-9', 'n4-02-10', 'n4-02-11', 'n4-02-12', 'n4-02-13', 'n4-02-14', 'n4-02-15', 'n4-02-16', 'n4-02-17', 'n4-02-18', 'n4-02-19', 'n4-02-20', 'n4-02-21', 'n4-02-22', 'n4-02-23', 'n4-02-24', 'n4-02-25'],
  'n4-04': ['n4-04', 'n4-04-2', 'n4-04-3', 'n4-04-4', 'n4-04-5', 'n4-04-6', 'n4-04-7', 'n4-04-8', 'n4-04-9', 'n4-04-10', 'n4-04-11', 'n4-04-12', 'n4-04-13', 'n4-04-14', 'n4-04-15', 'n4-04-16'],
  'n4-05': ['n4-05', 'n4-05-2', 'n4-05-3', 'n4-05-4', 'n4-05-5', 'n4-05-6', 'n4-05-7', 'n4-05-8', 'n4-05-9', 'n4-05-10', 'n4-05-11', 'n4-05-12', 'n4-05-13', 'n4-05-14', 'n4-05-15'],
};

const lessonShortTitle: Record<string, { ja: string; vi: string }> = {
  'n5-01':    { ja: 'あ行・か行', vi: 'Hàng あ・か' },
  'n5-01-2':  { ja: 'さ行・た行', vi: 'Hàng さ・た' },
  'n5-01-3':  { ja: 'な行・は行', vi: 'Hàng な・は' },
  'n5-01-4':  { ja: 'ま行〜ん', vi: 'Hàng ま〜ん' },
  'n5-01-5':  { ja: '濁音・半濁音', vi: 'Âm đục/bán đục' },
  'n5-01-6':  { ja: '拗音・長音・促音', vi: 'Âm đặc biệt' },
  'n5-01-7':  { ja: 'カタカナ①', vi: 'Katakana①' },
  'n5-01-8':  { ja: 'カタカナ②', vi: 'Katakana②' },
  'n5-01-9':  { ja: 'カタカナ③', vi: 'Katakana③' },
  'n5-01-10': { ja: '総復習テスト', vi: 'Kiểm tra tổng hợp' },
  'n5-02':    { ja: '数字・時間', vi: 'Số & Thời gian' },
  'n5-02-2':  { ja: '色・形・大きさ', vi: 'Màu sắc & Hình dạng' },
  'n5-02-3':  { ja: '食べ物・飲み物', vi: 'Đồ ăn & Đồ uống' },
  'n5-02-4':  { ja: '体・健康', vi: 'Cơ thể & Sức khỏe' },
  'n5-02-5':  { ja: '家・部屋・施設', vi: 'Nhà & Cơ sở' },
  'n5-02-6':  { ja: '仕事・職場', vi: 'Công việc' },
  'n5-02-7':  { ja: '自然・天気・季節', vi: 'Tự nhiên & Thời tiết' },
  'n5-02-8':  { ja: '交通・移動・方向', vi: 'Giao thông & Hướng đi' },
  'n5-02-9':  { ja: '感情・状態・気持ち', vi: 'Cảm xúc & Trạng thái' },
  'n5-02-10': { ja: '総復習テスト', vi: 'Kiểm tra tổng hợp' },
  'n5-03':    { ja: 'です・ます体・は/が/を', vi: 'Thể lịch sự & は/が/を' },
  'n5-03-2':  { ja: '助詞 に・で・へ', vi: 'Trợ từ に・で・へ' },
  'n5-03-3':  { ja: '動詞ます形・過去・否定', vi: 'Động từ ます・quá khứ・phủ định' },
  'n5-03-4':  { ja: 'い形容詞', vi: 'Tính từ い' },
  'n5-03-5':  { ja: 'な形容詞', vi: 'Tính từ な' },
  'n5-03-6':  { ja: '指示詞 これ・それ・あれ', vi: 'これ・それ・あれ' },
  'n5-03-7':  { ja: 'あります・います', vi: 'あります・います' },
  'n5-03-8':  { ja: '数字・時間・日付', vi: 'Số・Giờ・Ngày' },
  'n5-03-9':  { ja: '助詞 と・も・や', vi: 'Trợ từ と・も・や' },
  'n5-03-10': { ja: '〜たい・〜ましょう', vi: '〜たい・〜ましょう' },
  'n5-03-11': { ja: '〜てください・〜てもいい', vi: '〜てください・〜てもいい' },
  'n5-03-12': { ja: '〜ています', vi: '〜ています' },
  'n5-03-13': { ja: '比較 〜より・〜のほうが', vi: 'So sánh 〜より' },
  'n5-03-14': { ja: '接続詞 から・ので・が', vi: 'Liên từ から・ので' },
  'n5-03-15': { ja: '総復習テスト', vi: 'Kiểm tra tổng hợp' },
  'n5-04':    { ja: '自己紹介と挨拶', vi: 'Tự giới thiệu & Chào hỏi' },
  'n5-04-2':  { ja: '日常の声かけ', vi: 'Chào hỏi hàng ngày' },
  'n5-04-3':  { ja: '職場の報告・連絡', vi: 'Báo cáo tại nơi làm việc' },
  'n5-04-4':  { ja: '道案内・場所を聞く', vi: 'Hỏi đường & Chỉ đường' },
  'n5-04-5':  { ja: '体調・症状を伝える', vi: 'Tình trạng sức khỏe' },
  'n5-04-6':  { ja: '依頼・お断り', vi: 'Nhờ vả & Từ chối' },
  'n5-04-7':  { ja: '食事・好みを伝える', vi: 'Bữa ăn & Sở thích' },
  'n5-04-8':  { ja: '電話・連絡の基本', vi: 'Điện thoại & Liên lạc' },
  'n5-04-9':  { ja: 'お礼・お詫び', vi: 'Cảm ơn & Xin lỗi' },
  'n5-04-10': { ja: '介護現場のダイアログ', vi: 'Hội thoại điều dưỡng' },
  'n5-04-11': { ja: '家族・個人情報の会話', vi: 'Gia đình & Thông tin cá nhân' },
  'n5-04-12': { ja: '総復習ロールプレイ', vi: 'Kiểm tra nhập vai tổng hợp' },
  'n5-05':    { ja: '人・日・時・体・食', vi: 'Người・Ngày・Giờ・Thân・Ăn' },
  'n5-05-2':  { ja: '大・小・上・下・左・右', vi: 'To nhỏ & Phương hướng' },
  'n5-05-3':  { ja: '山・川・田・木・本・火・水', vi: 'Tự nhiên & Thứ trong tuần' },
  'n5-05-4':  { ja: '学・校・先・生・年・月・週', vi: 'Học tập & Thời gian' },
  'n5-05-5':  { ja: '見・聞・書・読・話・来・行', vi: 'Động từ cơ bản' },
  'n5-05-6':  { ja: '金・円・百・千・万・白・赤', vi: 'Tiền tệ & Màu sắc' },
  'n5-05-7':  { ja: '医・病・薬・手・目・耳・口', vi: 'Y tế & Bộ phận cơ thể' },
  'n5-05-8':  { ja: '総復習テスト', vi: 'Kiểm tra tổng hợp 80 chữ' },
  'n4-01':    { ja: '介護・医療の動詞', vi: 'Động từ điều dưỡng & y tế' },
  'n4-01-2':  { ja: '身体症状・医療名詞', vi: 'Triệu chứng & Y tế' },
  'n4-01-3':  { ja: '感情・状態の形容詞', vi: 'Cảm xúc & Trạng thái' },
  'n4-01-4':  { ja: '介護業務の専門名詞', vi: 'Thuật ngữ điều dưỡng' },
  'n4-01-5':  { ja: '時間・頻度の副詞', vi: 'Phó từ thời gian & tần suất' },
  'n4-01-6':  { ja: '数量・程度の表現', vi: 'Số lượng & Mức độ' },
  'n4-01-7':  { ja: '施設・設備の名詞', vi: 'Cơ sở & Thiết bị' },
  'n4-01-8':  { ja: '食事・栄養の語彙', vi: 'Ăn uống & Dinh dưỡng' },
  'n4-01-9':  { ja: '移動・姿勢の語彙', vi: 'Di chuyển & Tư thế' },
  'n4-01-10': { ja: '排泄・清潔の語彙', vi: 'Vệ sinh & Sạch sẽ' },
  'n4-01-11': { ja: '薬・医療処置の語彙', vi: 'Thuốc & Điều trị y tế' },
  'n4-01-12': { ja: 'コミュニケーション動詞', vi: 'Động từ giao tiếp' },
  'n4-01-13': { ja: '社会保険・制度の語彙', vi: 'Bảo hiểm & Chế độ xã hội' },
  'n4-01-14': { ja: '書類・記録の語彙', vi: 'Tài liệu & Hồ sơ' },
  'n4-01-15': { ja: '緊急・安全の語彙', vi: 'Khẩn cấp & An toàn' },
  'n4-01-16': { ja: '気持ち・心理の語彙', vi: 'Tâm lý & Cảm xúc' },
  'n4-01-17': { ja: '家族・人間関係の語彙', vi: 'Gia đình & Quan hệ' },
  'n4-01-18': { ja: '職場マナー・敬語', vi: 'Nghi thức & Kính ngữ' },
  'n4-01-19': { ja: 'N4重要語200語特訓', vi: 'Luyện 200 từ quan trọng N4' },
  'n4-01-20': { ja: '総復習テスト', vi: 'Kiểm tra tổng hợp' },
  'n4-03':    { ja: '案内文・お知らせ', vi: 'Thông báo & Hướng dẫn' },
  'n4-03-2':  { ja: 'メモ・伝言を読む', vi: 'Đọc ghi chú & Tin nhắn' },
  'n4-03-3':  { ja: 'シフト表を読む', vi: 'Đọc bảng phân ca' },
  'n4-03-4':  { ja: '指示書・マニュアル', vi: 'Hướng dẫn & Sổ tay' },
  'n4-03-5':  { ja: '接続詞を使いこなす', vi: 'Liên từ' },
  'n4-03-6':  { ja: '否定・条件表現', vi: 'Phủ định & Điều kiện' },
  'n4-03-7':  { ja: '因果関係を読む', vi: 'Quan hệ nhân quả' },
  'n4-03-8':  { ja: '主題・要点を見つける', vi: 'Chủ đề & Điểm chính' },
  'n4-03-9':  { ja: 'グラフ・図表の読み取り', vi: 'Biểu đồ & Bảng số liệu' },
  'n4-03-10': { ja: '筆者の意図・推測', vi: 'Ý định tác giả & Suy luận' },
  'n4-03-11': { ja: '長文①業務連絡・申し送り', vi: 'Văn dài① Bàn giao ca' },
  'n4-03-12': { ja: '長文②ケアプランを読む', vi: 'Văn dài② Kế hoạch chăm sóc' },
  'n4-03-13': { ja: '長文③研修案内・議事録', vi: 'Văn dài③ Đào tạo & Họp' },
  'n4-03-14': { ja: '長文④同意書・説明文', vi: 'Văn dài④ Đơn đồng ý' },
  'n4-03-15': { ja: '長文⑤新聞・記事', vi: 'Văn dài⑤ Bài báo' },
  'n4-03-16': { ja: '対比・比較の文章', vi: 'Đối chiếu & So sánh' },
  'n4-03-17': { ja: '速読トレーニング', vi: 'Luyện đọc nhanh' },
  'n4-03-18': { ja: '総復習テスト', vi: 'Kiểm tra tổng hợp' },
  'n4-04':    { ja: '職場の会話・省略形', vi: 'Hội thoại nơi làm việc' },
  'n4-04-2':  { ja: '数字・時間の聞き取り', vi: 'Nghe số và giờ' },
  'n4-04-3':  { ja: '指示・依頼を聞く', vi: 'Nghe chỉ thị & Yêu cầu' },
  'n4-04-4':  { ja: 'バイタル報告を聞く', vi: 'Nghe báo cáo sinh tồn' },
  'n4-04-5':  { ja: '申し送りを聞く', vi: 'Nghe bàn giao ca' },
  'n4-04-6':  { ja: '電話の会話', vi: 'Hội thoại điện thoại' },
  'n4-04-7':  { ja: '体調・症状の会話', vi: 'Hội thoại sức khỏe' },
  'n4-04-8':  { ja: '施設内アナウンス', vi: 'Thông báo trong cơ sở' },
  'n4-04-9':  { ja: '質問・確認の会話', vi: 'Hỏi và xác nhận' },
  'n4-04-10': { ja: '自然な話し方・省略形', vi: 'Nói tự nhiên & Rút gọn' },
  'n4-04-11': { ja: '感情・態度の聞き取り', vi: 'Cảm xúc & Thái độ' },
  'n4-04-12': { ja: '長い会話から要点を聞く', vi: 'Nghe điểm chính văn dài' },
  'n4-04-13': { ja: '会議・ミーティング', vi: 'Họp & Meeting' },
  'n4-04-14': { ja: '模擬試験①短文問題', vi: 'Thi thử① Đoạn ngắn' },
  'n4-04-15': { ja: '模擬試験②長文問題', vi: 'Thi thử② Đoạn dài' },
  'n4-04-16': { ja: '総復習テスト', vi: 'Kiểm tra tổng hợp' },
  'n4-05':    { ja: '薬・病・院・護・祉', vi: 'Nhóm Kanji y tế & phúc lợi' },
  'n4-05-2':  { ja: '体・頭・手・足・口', vi: 'Bộ phận cơ thể' },
  'n4-05-3':  { ja: '心・気・力・動・静', vi: 'Trạng thái & cảm xúc' },
  'n4-05-4':  { ja: '食・飲・水・栄・養', vi: 'Ăn uống & dinh dưỡng' },
  'n4-05-5':  { ja: '時・分・週・月・年', vi: 'Thời gian & lịch trình' },
  'n4-05-6':  { ja: '人・者・員・師・士', vi: 'Người & chức danh' },
  'n4-05-7':  { ja: '書・読・記・録・報', vi: 'Ghi chép & báo cáo' },
  'n4-05-8':  { ja: '安・全・危・急・緊', vi: 'An toàn & khẩn cấp' },
  'n4-05-9':  { ja: '家・室・所・場・区', vi: 'Địa điểm & không gian' },
  'n4-05-10': { ja: '仕・事・作・業・働', vi: 'Công việc & nghề nghiệp' },
  'n4-05-11': { ja: '高・低・増・減・変', vi: 'Thay đổi & mức độ' },
  'n4-05-12': { ja: '送・受・伝・連・知', vi: 'Truyền đạt & liên lạc' },
  'n4-05-13': { ja: '治・療・回・復・改', vi: 'Điều trị & hồi phục' },
  'n4-05-14': { ja: '確・認・注・意・識', vi: 'Xác nhận & chú ý' },
  'n4-05-15': { ja: '総復習テスト', vi: 'Kiểm tra tổng hợp' },
  'n4-02':    { ja: '〜てしまう / 〜ちゃう', vi: '〜てしまう / 〜ちゃう' },
  'n4-02-2':  { ja: '〜ておく（事前準備）', vi: '〜ておく (chuẩn bị trước)' },
  'n4-02-3':  { ja: '〜てある（結果状態）', vi: '〜てある (trạng thái kết quả)' },
  'n4-02-4':  { ja: '〜てみる（試みる）', vi: '〜てみる (thử làm)' },
  'n4-02-5':  { ja: '〜ていく / 〜てくる', vi: '〜ていく / 〜てくる' },
  'n4-02-6':  { ja: '〜たら条件', vi: 'Điều kiện 〜たら' },
  'n4-02-7':  { ja: '〜ば条件', vi: 'Điều kiện 〜ば' },
  'n4-02-8':  { ja: '〜なら条件', vi: 'Điều kiện 〜なら' },
  'n4-02-9':  { ja: '〜のに（逆接・不満）', vi: '〜のに (kết quả trái chiều)' },
  'n4-02-10': { ja: '〜ために / 〜ように（目的）', vi: '〜ために / 〜ように (mục đích)' },
  'n4-02-11': { ja: '〜ながら（同時動作）', vi: '〜ながら (đồng thời)' },
  'n4-02-12': { ja: '〜そうだ（様態 vs 伝聞）', vi: '〜そうだ (vẻ ngoài vs nghe nói)' },
  'n4-02-13': { ja: '〜らしい（推測・伝聞）', vi: '〜らしい (có vẻ / nghe nói)' },
  'n4-02-14': { ja: '〜ようだ / 〜みたいだ', vi: '〜ようだ / 〜みたいだ' },
  'n4-02-15': { ja: '〜かもしれない（可能性）', vi: '〜かもしれない (có thể là)' },
  'n4-02-16': { ja: '〜はずだ（当然の予測）', vi: '〜はずだ (đáng lẽ phải)' },
  'n4-02-17': { ja: '〜てもいい / 〜てはいけない', vi: '〜てもいい / 〜てはいけない' },
  'n4-02-18': { ja: '〜なければならない / 〜なくてもいい', vi: 'Phải làm / Không cần làm' },
  'n4-02-19': { ja: '〜ことができる / 〜ことができない', vi: 'Có thể / Không thể' },
  'n4-02-20': { ja: '〜ようになる / 〜ようにする', vi: 'Trở nên / Cố để' },
  'n4-02-21': { ja: '〜てほしい / 〜てもらう', vi: 'Muốn ai làm / Nhờ ai làm' },
  'n4-02-22': { ja: '〜させる / 〜させてもらう（使役）', vi: 'Thể sai khiến' },
  'n4-02-23': { ja: '受身形 〜られる', vi: 'Thể bị động 〜られる' },
  'n4-02-24': { ja: '〜ていただく / 〜てくれる / 〜てあげる', vi: 'Động từ trao nhận' },
  'n4-02-25': { ja: '総復習テスト', vi: 'Kiểm tra tổng hợp' },
};

// Find course ID for a given lesson ID
function getCourseId(lessonId: string): string | null {
  for (const [courseId, lessons] of Object.entries(courseLessonMap)) {
    if (lessons.includes(lessonId)) return courseId;
  }
  return null;
}

export default function LessonPage({ params }: LessonPageProps) {
  const { locale, id } = use(params);
  const t = useTranslations();
  const [isComplete, setIsComplete] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [userPlan, setUserPlan] = useState<'free' | 'basic' | 'pro'>('free');

  useEffect(() => {
    const loadPlan = async () => {
      if (!isSupabaseConfigured) return;
      const supabase = createClient();
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data: userData } = await supabase
        .from('users')
        .select('plan')
        .eq('id', session.user.id)
        .single();
      if (userData?.plan) setUserPlan(userData.plan as 'free' | 'basic' | 'pro');
    };
    loadPlan();
  }, []);

  const data = mockLessons[id] ?? fallbackLesson;
  const { lesson, courseTitle } = data;

  const planOrder: Record<string, number> = { free: 0, basic: 1, pro: 2 };
  const effectivelyLocked = planOrder[data.requiredPlan] > planOrder[userPlan];

  // Course-level navigation
  const courseId = getCourseId(id);
  const lessonList = courseId ? courseLessonMap[courseId] : null;
  const lessonIndex = lessonList ? lessonList.indexOf(id) : -1;
  const lessonNumber = lessonIndex >= 0 ? lessonIndex + 1 : null;
  const totalLessons = lessonList ? lessonList.length : null;
  const prevLessonId = lessonList && lessonIndex > 0 ? lessonList[lessonIndex - 1] : null;
  const nextLessonId = lessonList && lessonIndex < lessonList.length - 1 ? lessonList[lessonIndex + 1] : null;

  const handleComplete = (score: number) => {
    const xpEarned = Math.round((score / 100) * lesson.xpReward);
    setEarnedXp(xpEarned);
    setIsComplete(true);
    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId: id, status: 'completed', quizScore: score, xpEarned }),
    }).catch(() => {});
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header nav */}
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/${locale}/courses`}>
          <Button variant="ghost" size="sm" className="text-gray-500">
            <ChevronLeft className="h-4 w-4" />
            {locale === 'ja' ? courseTitle.ja : courseTitle.vi}
          </Button>
        </Link>
      </div>

      {/* Lesson progress bar (multi-lesson courses only) */}
      {lessonNumber && totalLessons && (
        <div style={{
          background: 'var(--white)', border: '1px solid var(--line)',
          borderRadius: 16, padding: '16px 20px', marginBottom: 24,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>
              {locale === 'ja'
                ? `レッスン ${lessonNumber} / ${totalLessons}`
                : `Bài ${lessonNumber} / ${totalLessons}`}
            </span>
            <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
              {locale === 'ja'
                ? lessonShortTitle[id]?.ja ?? ''
                : lessonShortTitle[id]?.vi ?? ''}
            </span>
          </div>
          {/* Progress bar */}
          <div style={{ background: 'var(--line)', borderRadius: 100, height: 6, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 100,
              background: 'linear-gradient(90deg, var(--primary), var(--accent))',
              width: `${(lessonNumber / totalLessons) * 100}%`,
              transition: 'width 0.4s ease',
            }}/>
          </div>
          {/* Lesson dots */}
          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
            {lessonList!.map((lid, idx) => (
              <Link key={lid} href={`/${locale}/courses/${lid}`} style={{ textDecoration: 'none' }}>
                <div title={locale === 'ja' ? lessonShortTitle[lid]?.ja : lessonShortTitle[lid]?.vi} style={{
                  width: 28, height: 28, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                  background: idx < lessonIndex ? 'var(--primary)' : idx === lessonIndex ? 'var(--ink)' : 'var(--line)',
                  color: idx <= lessonIndex ? '#fff' : 'var(--ink-soft)',
                  border: idx === lessonIndex ? '2px solid var(--ink)' : '2px solid transparent',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}>
                  {idx + 1}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Locked */}
      {effectivelyLocked && (
        <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">
            {locale === 'ja' ? 'このレッスンはロックされています' : 'Bài học này đã bị khóa'}
          </h2>
          <p className="text-gray-500 mb-6">
            {data.requiredPlan === 'pro'
              ? locale === 'ja' ? 'PROプランにアップグレードして全コースにアクセス' : 'Nâng cấp lên gói PRO để truy cập tất cả khóa học'
              : locale === 'ja' ? 'BASICプランにアップグレードして解除' : 'Nâng cấp lên gói BASIC để mở khóa'
            }
          </p>
          <Link href={`/${locale}/pricing`}>
            <Button>{t('pricing.upgrade')}</Button>
          </Link>
        </div>
      )}

      {/* Lesson */}
      {!effectivelyLocked && !isComplete && (
        <LessonView lesson={lesson} onComplete={handleComplete} locale={locale} />
      )}

      {/* Completion */}
      {!effectivelyLocked && isComplete && (
        <div className="text-center py-12 animate-fade-in">
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Star className="h-12 w-12 text-white fill-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {locale === 'ja' ? 'レッスン完了！' : 'Hoàn thành bài học!'}
          </h2>
          <div className="flex items-center justify-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl p-4 inline-flex mb-8 mx-auto">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span className="text-yellow-700 font-bold text-xl">+{earnedXp} XP {t('lesson.xpEarned')}</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
            {nextLessonId ? (
              <Link href={`/${locale}/courses/${nextLessonId}`}>
                <Button className="gap-2">
                  {locale === 'ja'
                    ? `次のレッスンへ → ${lessonShortTitle[nextLessonId]?.ja ?? ''}`
                    : `Bài tiếp theo → ${lessonShortTitle[nextLessonId]?.vi ?? ''}`}
                </Button>
              </Link>
            ) : null}
            <Link href={`/${locale}/courses`}>
              <Button variant="outline">
                {locale === 'ja' ? 'コース一覧に戻る' : 'Về danh sách khóa học'}
              </Button>
            </Link>
            <Link href={`/${locale}/ai-tutor`}>
              <Button variant="outline">
                {locale === 'ja' ? 'Medi先生に質問する' : 'Hỏi Medi-sensei'}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
