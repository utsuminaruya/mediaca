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

  'n3-01-2': {
    courseTitle: { ja: 'N3 文法・語彙総まとめ', vi: 'Tổng hợp ngữ pháp & từ vựng N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: '〜ながら（逆接「しながら」と「〜ながら（も）」の違い）',
      titleTranslation: '〜ながら（Sự khác biệt giữa "làm đồng thời" và "mặc dù"）',
      introduction: `「〜ながら」には二つの意味があります。①同時動作「音楽を聴きながら仕事する」②逆接「知りながら言わない」。介護現場では「声かけながらケアする」「疲れながらも笑顔で接する」などよく使います。

「〜ながら」có hai nghĩa: ①hành động đồng thời "vừa nghe nhạc vừa làm việc" ②mặc dù "biết mà không nói". Trong điều dưỡng thường dùng "vừa nói chuyện vừa chăm sóc" hay "dù mệt vẫn tiếp đón với nụ cười".`,
      keyPoints: [
        '同時動作の〜ながら: 主語が同じ、前の動詞は連用形（vừa...vừa...）',
        '逆接の〜ながら（も）: 「〜なのに・〜けれど」の意味（mặc dù, nhưng）',
        '同時動作: テレビを見ながら食事する（menh đề sau là hành động chính）',
        '逆接: 知りながら黙っていた・狭いながらも快適な部屋（biết mà vẫn im lặng）',
        '注意: 逆接の〜ながら は書き言葉・フォーマルな場面が多い（thường dùng văn viết）',
        '介護例: 話しかけながら体を拭く / 疲れながらも丁寧に対応する',
      ],
      vocabulary: [
        { word: '〜ながら（同時）', reading: 'ながら', meaning: '〜しつつ（vừa...vừa...）', example: '記録を書きながら報告する' },
        { word: '〜ながら（逆接）', reading: 'ながら', meaning: '〜なのに（mặc dù）', example: '知りながら言わなかった' },
        { word: '声かけ', reading: 'こえかけ', meaning: '話しかけること（lên tiếng, nói chuyện）', example: '移動の前に必ず声かけをする' },
        { word: '笑顔', reading: 'えがお', meaning: 'にっこりした顔（nụ cười）', example: '笑顔で利用者さんに接する' },
        { word: '丁寧に', reading: 'ていねいに', meaning: '礼儀正しく・注意深く（cẩn thận, lịch sự）', example: '丁寧に体を拭く' },
      ],
      examples: [
        { japanese: '利用者さんに話しかけながら、体を拭きます。', reading: 'りようしゃさんにはなしかけながら、からだをふきます。', translation: 'Vừa nói chuyện với người được chăm sóc, vừa lau người.' },
        { japanese: '疲れながらも、笑顔で対応しました。', reading: 'つかれながらも、えがおでたいおうしました。', translation: 'Dù mệt, vẫn tiếp đón với nụ cười.' },
        { japanese: '狭いながらも、清潔な居室を保つことが大切です。', reading: 'せまいながらも、せいけつなきょしつをたもつことがたいせつです。', translation: 'Dù chật nhưng việc giữ phòng sạch sẽ là điều quan trọng.' },
      ],
      grammarNote: `【〜ながら の二つの用法】

①同時動作: Vする + ながら + Vする（主語が同じ）
  ○ 音楽を聴きながら仕事する
  ✗ 雨が降りながら出かける（主語が違うので不可）

②逆接 〜ながら（も）: い形容詞・な形容詞・動詞＋ながら
  ○ 知りながら言わない（動詞）
  ○ 小さいながらも立派な施設（い形容詞）
  ○ 不便ながらも住みやすい（な形容詞語幹）

【ベトナム語メモ】
①同時: vừa～vừa～ / trong khi～
②逆接: mặc dù～nhưng～ / dù～vẫn～`,
      quiz: {
        question: '「彼女は疲れて（　）、最後まで仕事を続けた」に入るのは？',
        options: [
          { id: 'a', text: 'いながら' },
          { id: 'b', text: 'ながらも' },
          { id: 'c', text: 'ながらに' },
          { id: 'd', text: 'ながらで' },
        ],
        correctId: 'b',
        explanation: '逆接の意味（疲れているのに続けた）なので「ながらも」が正解。「ながらも」= mặc dù mệt nhưng vẫn tiếp tục làm việc đến cuối.',
      },
      xpReward: 30,
    },
  },

  'n3-01-3': {
    courseTitle: { ja: 'N3 文法・語彙総まとめ', vi: 'Tổng hợp ngữ pháp & từ vựng N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: '〜ばかり / 〜だけ / 〜しか〜ない（限定表現の比較）',
      titleTranslation: '〜ばかり / 〜だけ / 〜しか〜ない（So sánh các cách diễn đạt giới hạn）',
      introduction: `「ばかり」「だけ」「しか〜ない」はどれも「限定」を表しますが、ニュアンスが違います。介護記録や報告書では正確な表現が求められるので、違いをしっかり覚えましょう。

「ばかり」「だけ」「しか〜ない」đều biểu thị "giới hạn" nhưng sắc thái khác nhau. Trong hồ sơ điều dưỡng và báo cáo cần diễn đạt chính xác, hãy ghi nhớ sự khác biệt.`,
      keyPoints: [
        '〜だけ: 中立的な限定「それのみ」（chỉ, duy nhất — trung tính）',
        '〜ばかり: 偏りへの批判・程度の強調「それだらけ・それが多い」（toàn là, cứ mãi — có sắc thái phê phán）',
        '〜しか〜ない: 否定文必須、少なさを強調「それ以外ない」（chỉ có...thôi — nhấn mạnh ít）',
        '「薬だけ飲む」= 薬のみ（trung tính）',
        '「薬ばかり飲む」= 薬を飲みすぎて心配（có sắc thái lo ngại）',
        '「薬しか飲まない」= 薬以外何も飲まない・量が少ない（nhấn mạnh không có gì khác）',
      ],
      vocabulary: [
        { word: '〜だけ', reading: 'だけ', meaning: 'それのみ（chỉ, duy nhất）', example: '今日だけ特別に許可する' },
        { word: '〜ばかり', reading: 'ばかり', meaning: 'それが多すぎる（toàn là, cứ mãi）', example: '甘いものばかり食べている' },
        { word: '〜しか〜ない', reading: 'しかない', meaning: 'それ以外ない（chỉ có...thôi）', example: '水しか飲まない' },
        { word: '限定', reading: 'げんてい', meaning: '範囲を限ること（giới hạn）', example: '入室は職員だけに限定する' },
        { word: '偏り', reading: 'かたより', meaning: 'バランスが崩れること（lệch lạc, mất cân bằng）', example: '食事に偏りがある' },
      ],
      examples: [
        { japanese: '利用者さんは野菜だけ残して、他は全部食べました。', reading: 'りようしゃさんはやさいだけのこして、ほかはぜんぶたべました。', translation: 'Người được chăm sóc chỉ để lại rau, còn lại ăn hết.' },
        { japanese: '最近、ゼリーばかり食べていて、固い食事を取りません。', reading: 'さいきん、ゼリーばかりたべていて、かたいしょくじをとりません。', translation: 'Gần đây toàn ăn thạch, không ăn đồ cứng.' },
        { japanese: '今日は水しか飲んでいないので、脱水に注意が必要です。', reading: 'きょうはみずしかのんでいないので、だっすいにちゅういがひつようです。', translation: 'Hôm nay chỉ uống nước thôi nên cần chú ý mất nước.' },
      ],
      grammarNote: `【三つの限定表現の比較】

だけ（trung tính）: Nだけ / Vだけ
  → 「今日だけ休む」= hôm nay chỉ nghỉ thôi

ばかり（phê phán/nhấn mạnh）: N/Vばかり
  → 「休んでばかりいる」= cứ nghỉ mãi（含有批判）
  → 「入ったばかり」= mới vừa vào（thời gian gần đây）

しか〜ない（強調・少なさ）: N/Vしか + 否定
  → 「3時間しか寝ていない」= chỉ ngủ 3 tiếng thôi
  ✗ 「〜しか飲む」→ 必ず否定形`,
      quiz: {
        question: '「この患者さんは牛乳（　）飲みません」— 水分が少ないことを心配している文は？',
        options: [
          { id: 'a', text: 'だけ' },
          { id: 'b', text: 'ばかり' },
          { id: 'c', text: 'しか' },
          { id: 'd', text: 'まで' },
        ],
        correctId: 'c',
        explanation: '少なさ・心配を強調するのは「しか〜ない」。「しか飲みません」= chỉ uống sữa thôi（lo lắng vì ít）. 「だけ」は中立、「ばかり」は多すぎる批判。',
      },
      xpReward: 30,
    },
  },

  'n3-01-4': {
    courseTitle: { ja: 'N3 文法・語彙総まとめ', vi: 'Tổng hợp ngữ pháp & từ vựng N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: '推量表現まとめ〜ようだ・〜らしい・〜そうだ の違い',
      titleTranslation: 'Tổng hợp biểu đạt suy đoán: 〜ようだ・〜らしい・〜そうだ',
      introduction: `推量表現は情報の出所と確信度によって使い分けます。介護現場では「利用者さんが痛そうだ」「熱があるようだ」「風邪らしい」など状態の観察・推測に毎日使います。

Các cách diễn đạt suy đoán phân biệt theo nguồn thông tin và mức độ chắc chắn. Trong điều dưỡng dùng hàng ngày để quan sát và suy đoán tình trạng như "có vẻ đau", "có vẻ sốt", "có vẻ bị cảm".`,
      keyPoints: [
        '〜ようだ: 自分の直接観察による推測（suy đoán từ quan sát trực tiếp của mình）',
        '〜らしい: 間接情報・伝聞による推測（suy đoán từ thông tin gián tiếp/nghe nói）',
        '〜そうだ（様態）: 見た目・様子からの推測（suy đoán từ vẻ ngoài — thêm vào gốc từ）',
        '〜そうだ（伝聞）: 聞いた情報を伝える（truyền đạt thông tin nghe được — thêm vào cuối câu）',
        '確信度: ようだ ≧ らしい ＞ そうだ（様態）',
        '接続: ようだ・らしい＋普通形 / そうだ（様態）＋語幹',
      ],
      vocabulary: [
        { word: '〜ようだ', reading: 'ようだ', meaning: '〜と思われる（có vẻ — quan sát）', example: '熱があるようだ' },
        { word: '〜らしい', reading: 'らしい', meaning: '〜と聞いた/知った（có vẻ — nghe nói）', example: '退院したらしい' },
        { word: '〜そうだ（様態）', reading: 'そうだ', meaning: '見た目で推測（trông có vẻ）', example: '転びそうだ・おいしそうだ' },
        { word: '様態', reading: 'ようたい', meaning: '様子・状態（trạng thái, vẻ ngoài）', example: '様態を観察する' },
        { word: '伝聞', reading: 'でんぶん', meaning: '聞いた情報を伝えること（nghe nói, truyền đạt）', example: '伝聞表現を使う' },
      ],
      examples: [
        { japanese: '田中さんは足が痛いようで、歩くのが辛そうです。', reading: 'たなかさんはあしがいたいようで、あるくのがつらそうです。', translation: 'Ông Tanaka có vẻ đau chân, trông khó đi lại.' },
        { japanese: '夜中に転んだらしく、ひじに青あざができていました。', reading: 'よなかにころんだらしく、ひじにあおあざができていました。', translation: 'Có vẻ đã ngã vào ban đêm, khuỷu tay có vết bầm.' },
        { japanese: '山田さんが明日退院するそうです。（伝聞）', reading: 'やまださんがあしたたいいんするそうです。', translation: 'Nghe nói ông Yamada ngày mai xuất viện.' },
      ],
      grammarNote: `【推量表現の使い分け】

〜ようだ: 自分が見て・感じて推測
  「顔色が悪いようだ」→ tôi thấy và suy đoán
  接続: 普通形＋ようだ

〜らしい: 情報・証拠から推測
  「昨日転んだらしい」→ nghe nói / có dấu hiệu
  接続: 普通形＋らしい

〜そうだ（様態）: 見た目・直前の判断
  「転びそうだ」→ trông sắp ngã（語幹＋そうだ）
  ✗ 「よさそうだ」→ ○ 「よさそうだ」（いい→よさ）

〜そうだ（伝聞）: 聞いた話をそのまま伝える
  「退院するそうだ」→ nghe nói sẽ xuất viện（普通形＋そうだ）`,
      quiz: {
        question: '「利用者さんが転び（　）なので、そばについています」に入るのは？',
        options: [
          { id: 'a', text: 'らしい' },
          { id: 'b', text: 'そう' },
          { id: 'c', text: 'ようだ' },
          { id: 'd', text: 'はず' },
        ],
        correctId: 'b',
        explanation: '見た目・今まさに起きそうな状況なので「転びそう」（様態のそうだ、語幹接続）が正解。「転びそうなので」= trông sắp ngã nên đứng bên cạnh.',
      },
      xpReward: 30,
    },
  },

  'n3-01-5': {
    courseTitle: { ja: 'N3 文法・語彙総まとめ', vi: 'Tổng hợp ngữ pháp & từ vựng N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: '〜てしまう / 〜てしまった（完了・後悔・困惑）',
      titleTranslation: '〜てしまう / 〜てしまった（Hoàn thành, hối tiếc, bối rối）',
      introduction: `「〜てしまう」には①完了（すっかり終わった）②後悔・残念・困惑の気持ちの二つの意味があります。会話では「〜ちゃう・〜ちゃった」と短縮されます。介護現場では「薬を飲ませてしまった」「転倒させてしまった」など重要な場面で使います。

「〜てしまう」có hai nghĩa: ①hoàn thành (xong hẳn) ②hối tiếc/tiếc nuối/bối rối. Trong hội thoại được rút gọn thành「〜ちゃう・〜ちゃった」. Trong điều dưỡng dùng trong các tình huống quan trọng như "đã cho uống nhầm thuốc", "đã để ngã".`,
      keyPoints: [
        '完了の意味: 「全部食べてしまった」= đã ăn hết rồi（xong hẳn）',
        '後悔・困惑: 「忘れてしまった」「転んでしまった」= đáng tiếc đã quên/ngã',
        '会話の縮約形: 〜てしまう→〜ちゃう / 〜でしまう→〜じゃう',
        '過去形: 〜てしまった→〜ちゃった / 〜でしまった→〜じゃった',
        'ミスの報告: 「〜させてしまいました」は謝罪・報告に使う（dùng để báo cáo lỗi）',
        '注意: 문맥によって完了か後悔か判断する（phán đoán theo ngữ cảnh）',
      ],
      vocabulary: [
        { word: '〜てしまう', reading: 'てしまう', meaning: '完了/後悔（hoàn thành/hối tiếc）', example: '書類をなくしてしまった' },
        { word: '転倒', reading: 'てんとう', meaning: '転ぶこと（té ngã）', example: '転倒事故を防ぐ' },
        { word: 'ヒヤリハット', reading: 'ひやりはっと', meaning: 'ミスになりそうな出来事（sự cố suýt xảy ra）', example: 'ヒヤリハットを報告する' },
        { word: '誤薬', reading: 'ごやく', meaning: '薬を間違えること（nhầm thuốc）', example: '誤薬防止のため確認する' },
        { word: '申し訳ない', reading: 'もうしわけない', meaning: '大変失礼な（thực sự xin lỗi）', example: '申し訳ありません' },
      ],
      examples: [
        { japanese: '薬を別の利用者さんに渡してしまいました。申し訳ありません。', reading: 'くすりをべつのりようしゃさんにわたしてしまいました。もうしわけありません。', translation: 'Tôi đã đưa thuốc nhầm cho người được chăm sóc khác. Tôi thực sự xin lỗi.' },
        { japanese: '山田さんが廊下で転んでしまいました。すぐに報告します。', reading: 'やまださんがろうかでころんでしまいました。すぐにほうこくします。', translation: 'Ông Yamada đã ngã ở hành lang. Tôi sẽ báo cáo ngay.' },
        { japanese: '記録を書き忘れちゃった。急いで書かなきゃ。（会話）', reading: 'きろくをかきわすれちゃった。いそいでかかなきゃ。', translation: 'Mình đã quên viết hồ sơ mất rồi. Phải viết nhanh thôi.' },
      ],
      grammarNote: `【〜てしまう の使い方】

①完了（ポジティブまたは中立）:
  「仕事が終わってしまった」= đã xong việc rồi
  「全部食べてしまった」= đã ăn hết rồi

②後悔・困惑（ネガティブ）:
  「鍵をなくしてしまった」= đáng tiếc đã mất chìa
  「転んでしまいました」= không may đã ngã

【縮約形（会話）】
〜てしまう → 〜ちゃう
〜てしまった → 〜ちゃった
〜でしまう → 〜じゃう（読んでしまう→読んじゃう）

【報告の表現】
「〜させてしまいました」= Tôi đã để～xảy ra（báo cáo lỗi với cấp trên）`,
      quiz: {
        question: '「大切な書類を（　）。どうしよう」に入るのは？',
        options: [
          { id: 'a', text: 'なくすちゃった' },
          { id: 'b', text: 'なくしてしまった' },
          { id: 'c', text: 'なくすてしまった' },
          { id: 'd', text: 'なくしてあった' },
        ],
        correctId: 'b',
        explanation: '「なくして＋しまった」が正しい形。動詞のて形＋しまった。「なくしてしまった」= đã đánh mất rồi（hối tiếc）。縮約形は「なくしちゃった」。',
      },
      xpReward: 30,
    },
  },

  'n3-01-6': {
    courseTitle: { ja: 'N3 文法・語彙総まとめ', vi: 'Tổng hợp ngữ pháp & từ vựng N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: '〜ことになる / 〜ことにする（他者の決定 vs 自分の決定）',
      titleTranslation: '〜ことになる / 〜ことにする（Quyết định của người khác vs quyết định của bản thân）',
      introduction: `「ことになる」は外部・組織・状況による決定、「ことにする」は自分自身の意思による決定を表します。職場での変更通知や、個人の生活習慣の変更を話すとき重要な区別です。

「ことになる」biểu thị quyết định từ bên ngoài/tổ chức/hoàn cảnh, còn「ことにする」biểu thị quyết định theo ý chí của bản thân. Đây là sự phân biệt quan trọng khi nói về thông báo thay đổi tại nơi làm việc hay thay đổi thói quen cá nhân.`,
      keyPoints: [
        '〜ことになる: 外部・組織・状況が決める（quyết định từ bên ngoài/tổ chức）',
        '〜ことにする: 自分が決める（tự mình quyết định）',
        '〜ことになっている: 規則・慣習として決まっている（đã được quy định sẵn）',
        '〜ことにしている: 自分の習慣として決めている（thói quen tự đặt ra）',
        '例：「異動することになった」vs「転職することにした」',
        '介護例：「夜勤をすることになりました」「毎日記録を確認することにしています」',
      ],
      vocabulary: [
        { word: 'ことになる', reading: 'ことになる', meaning: '（外部から）決定される（được quyết định từ ngoài）', example: '来月から夜勤をすることになった' },
        { word: 'ことにする', reading: 'ことにする', meaning: '（自分で）決定する（tự quyết định）', example: '毎朝早く来ることにした' },
        { word: '異動', reading: 'いどう', meaning: '職場・部署が変わること（chuyển công tác）', example: '来月から別の施設に異動になる' },
        { word: '規則', reading: 'きそく', meaning: 'ルール（quy tắc, quy định）', example: '施設の規則に従う' },
        { word: '習慣', reading: 'しゅうかん', meaning: '繰り返す行動（thói quen）', example: '手洗いの習慣をつける' },
      ],
      examples: [
        { japanese: '来月から田中さんの担当をすることになりました。よろしくお願いします。', reading: 'らいげつからたなかさんのたんとうをすることになりました。よろしくおねがいします。', translation: 'Từ tháng sau tôi sẽ phụ trách ông Tanaka. Mong mọi người hỗ trợ.' },
        { japanese: '私は毎日仕事の前に申し送りを見直すことにしています。', reading: 'わたしはまいにちしごとのまえにもうしおくりをみなおすことにしています。', translation: 'Tôi đã tự đặt thói quen xem lại bàn giao trước khi làm việc mỗi ngày.' },
        { japanese: '施設では面会時間は午後2時から5時までと決まっています（ことになっています）。', reading: 'しせつではめんかいじかんはごごにじからごじまでとなっています。', translation: 'Tại cơ sở, giờ thăm được quy định từ 14h đến 17h.' },
      ],
      grammarNote: `【〜ことになる vs 〜ことにする】

ことになる（ngoại lực quyết định）:
  「来月から夜勤をすることになりました」
  → Được thông báo/sắp xếp từ cơ sở
  → Người nói không phải người quyết định

ことにする（tự mình quyết định）:
  「来月から夜勤をすることにしました」
  → Tự mình chọn và quyết định

【慣習・規則の表現】
〜ことになっている = quy định đã có sẵn（bị động）
〜ことにしている = thói quen tự đặt ra（chủ động）

例：
  「利用者の同意を確認することになっている」（規則）
  「必ず2回チェックすることにしている」（習慣）`,
      quiz: {
        question: '「来月から夜勤シフトに入る（　）。上司に言われました」に入るのは？',
        options: [
          { id: 'a', text: 'ことにした' },
          { id: 'b', text: 'ことになった' },
          { id: 'c', text: 'ことがある' },
          { id: 'd', text: 'ことにしている' },
        ],
        correctId: 'b',
        explanation: '上司から言われた＝外部の決定なので「ことになった」が正解。「ことにした」は自分で決めた場合。「ことになった」= được sắp xếp/được quyết định từ cấp trên.',
      },
      xpReward: 30,
    },
  },

  'n3-01-7': {
    courseTitle: { ja: 'N3 文法・語彙総まとめ', vi: 'Tổng hợp ngữ pháp & từ vựng N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: '〜ことがある / 〜ことになっている / 〜ことにしている（慣習・規則）',
      titleTranslation: '〜ことがある / 〜ことになっている / 〜ことにしている（Thói quen & Quy định）',
      introduction: `「ことがある」は経験・時々の出来事、「ことになっている」は規則や取り決め、「ことにしている」は自分の習慣を表します。介護施設では規則や手順の説明によく使います。

「ことがある」biểu thị kinh nghiệm hoặc sự việc thỉnh thoảng xảy ra,「ことになっている」biểu thị quy tắc hoặc quy định, 「ことにしている」biểu thị thói quen của bản thân. Thường dùng để giải thích quy tắc và quy trình trong cơ sở điều dưỡng.`,
      keyPoints: [
        '〜たことがある: 過去の経験（đã từng...）',
        '〜ことがある: 時々〜する（thỉnh thoảng có khi...）',
        '〜ことになっている: 規則・取り決め・予定（quy định, đã được quy định）',
        '〜ことにしている: 自分で決めた習慣（thói quen tự đặt ra）',
        '介護例：「夜間に転倒することがある」「面会は事前に連絡することになっている」',
        '区別: ことになっている（受け身・規則）/ ことにしている（能動・習慣）',
      ],
      vocabulary: [
        { word: '経験', reading: 'けいけん', meaning: '実際に体験したこと（kinh nghiệm）', example: '介護の経験がある' },
        { word: '規則', reading: 'きそく', meaning: 'ルール（quy tắc）', example: '施設の規則を守る' },
        { word: '手順', reading: 'てじゅん', meaning: 'やり方の順番（quy trình）', example: '手順に従って行う' },
        { word: '申し送り', reading: 'もうしおくり', meaning: '引き継ぎ（bàn giao）', example: '申し送りをしっかり行う' },
        { word: '事前', reading: 'じぜん', meaning: '前もって（trước, sự chuẩn bị trước）', example: '事前に確認する' },
      ],
      examples: [
        { japanese: '夜間、山田さんがトイレに起きることがあります。注意してください。', reading: 'やかん、やまださんがトイレにおきることがあります。ちゅういしてください。', translation: 'Ban đêm, ông Yamada thỉnh thoảng thức dậy đi vệ sinh. Hãy chú ý.' },
        { japanese: 'この施設では、入浴の前に体温を測ることになっています。', reading: 'このしせつでは、にゅうよくのまえにたいおんをはかることになっています。', translation: 'Tại cơ sở này, đã quy định phải đo nhiệt độ trước khi tắm.' },
        { japanese: '私は毎朝、その日の担当利用者さんの記録を確認することにしています。', reading: 'わたしはまいあさ、そのひのたんとうりようしゃさんのきろくをかくにんすることにしています。', translation: 'Mỗi sáng tôi tự đặt thói quen kiểm tra hồ sơ của người được chăm sóc phụ trách hôm đó.' },
      ],
      grammarNote: `【三つの「こと」表現の比較】

①たことがある（kinh nghiệm quá khứ）:
  「一度ヒヤリハットを経験したことがある」

②ことがある（thỉnh thoảng）:
  「夜中に起きることがある」= đôi khi thức dậy ban đêm

③ことになっている（quy định/quy tắc）:
  「残業は上司に報告することになっている」
  → Quy định của tổ chức, không phải ý mình

④ことにしている（thói quen chủ động）:
  「毎日メモを取ることにしている」
  → Tự mình quyết định làm hàng ngày`,
      quiz: {
        question: '「この施設では、外出前に必ず家族に連絡する（　）」に入るのは？',
        options: [
          { id: 'a', text: 'ことにしている' },
          { id: 'b', text: 'ことになっている' },
          { id: 'c', text: 'ことがある' },
          { id: 'd', text: 'ことにする' },
        ],
        correctId: 'b',
        explanation: '施設の規則として決まっているので「ことになっている」が正解。「ことにしている」は個人の習慣。「ことになっている」= đã được quy định（quy tắc của cơ sở）.',
      },
      xpReward: 30,
    },
  },

  'n3-01-8': {
    courseTitle: { ja: 'N3 文法・語彙総まとめ', vi: 'Tổng hợp ngữ pháp & từ vựng N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: '〜のに（逆接・不満）/ 〜くせに（非難）',
      titleTranslation: '〜のに（Nghịch lý, bất mãn）/ 〜くせに（Chỉ trích）',
      introduction: `「〜のに」は期待と違う結果への驚き・失望・不満を表します。「〜くせに」は非難・批判のニュアンスが強い表現です。職場での不満や期待のギャップを表すときに使いますが、目上の人には使えない表現もあります。

「〜のに」biểu thị sự ngạc nhiên, thất vọng, bất mãn khi kết quả khác kỳ vọng. 「〜くせに」có sắc thái chỉ trích/phê phán mạnh. Dùng khi diễn đạt bất mãn hay khoảng cách kỳ vọng tại nơi làm việc, nhưng có những cách diễn đạt không dùng được với người trên.`,
      keyPoints: [
        '〜のに（逆接）: 期待と違う結果・不満・驚き（mặc dù...nhưng — bất mãn/ngạc nhiên）',
        '〜のに（目的）: 〜するために（để làm gì — N2/N3用法）',
        '〜くせに: 非難・批判（能力・立場があるのに～しない）（dù có khả năng/vị thế mà không làm）',
        '〜くせに は目上の人・客には使わない（không dùng với cấp trên hay khách hàng）',
        '「せっかく〜のに」= khó khăn lắm mới...mà...（惜しい気持ち）',
        '接続: 普通形＋のに / 名詞・な形容詞＋な/である＋のに',
      ],
      vocabulary: [
        { word: '〜のに', reading: 'のに', meaning: '〜なのに（mặc dù, nhưng mà）', example: '頑張ったのに失敗した' },
        { word: '〜くせに', reading: 'くせに', meaning: '〜なのに（批判）（mặc dù mà lại — chỉ trích）', example: '知っているくせに教えない' },
        { word: '不満', reading: 'ふまん', meaning: '満足していないこと（bất mãn）', example: '職場に不満がある' },
        { word: 'せっかく', reading: 'せっかく', meaning: '折角（khó khăn lắm mới, mất công）', example: 'せっかく来たのに会えなかった' },
        { word: '非難', reading: 'ひなん', meaning: '批判・責めること（chỉ trích, chê bai）', example: '人を非難しないようにする' },
      ],
      examples: [
        { japanese: 'せっかく早めに準備したのに、遅刻してしまいました。', reading: 'せっかくはやめにじゅんびしたのに、ちこくしてしまいました。', translation: 'Mất công chuẩn bị sớm mà vẫn đến muộn.' },
        { japanese: '毎日練習したのに、試験に落ちてしまった。', reading: 'まいにちれんしゅうしたのに、しけんにおちてしまった。', translation: 'Luyện tập mỗi ngày mà vẫn trượt kỳ thi.' },
        { japanese: '（同僚に対して）経験があるくせに、新人に全部押し付けるのは良くない。', reading: 'けいけんがあるくせに、しんじんにぜんぶおしつけるのはよくない。', translation: '（Với đồng nghiệp）Có kinh nghiệm mà lại đẩy hết cho người mới là không tốt.' },
      ],
      grammarNote: `【〜のに vs 〜くせに】

のに（逆接・感情）:
  「こんなに頑張ったのに評価されない」
  → Mặc dù cố gắng nhưng không được đánh giá cao
  → Cảm xúc: thất vọng, bất mãn, ngạc nhiên

くせに（非難・批判）:
  「分かっているくせに説明しない」
  → Biết rõ mà không giải thích（phê phán）
  → Mạnh hơn のに, chứa đựng sự chỉ trích

【使える相手】
のに: 誰にでも使える（dùng được với tất cả）
くせに: 目下・同年代のみ（chỉ dùng với người dưới/ngang hàng）

【接続】
普通形＋のに / 名詞・な形容詞＋な＋のに
普通形＋くせに / 名詞・な形容詞＋な＋くせに`,
      quiz: {
        question: '「もう8年も日本にいる（　）、敬語が使えない」— 批判のニュアンスで使うのは？',
        options: [
          { id: 'a', text: 'のに' },
          { id: 'b', text: 'なのに' },
          { id: 'c', text: 'くせに' },
          { id: 'd', text: 'けれど' },
        ],
        correctId: 'c',
        explanation: '批判・非難のニュアンスが強い文なので「くせに」が最も適切。「くせに」= dù đã ở Nhật 8 năm mà vẫn không dùng được kính ngữ（chỉ trích）.',
      },
      xpReward: 30,
    },
  },

  'n3-01-9': {
    courseTitle: { ja: 'N3 文法・語彙総まとめ', vi: 'Tổng hợp ngữ pháp & từ vựng N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: '〜ために（目的・原因）/ 〜ように（目的・希望）の使い分け',
      titleTranslation: '〜ために（Mục đích/Nguyên nhân）/ 〜ように（Mục đích/Hy vọng）— Cách phân biệt',
      introduction: `「ために」と「ように」はどちらも目的を表せますが、動詞の種類によって使い方が違います。意志動詞なら「ために」、無意志動詞・状態なら「ように」を使います。介護現場での「安全のために」「転ばないように」は重要な表現です。

「ために」và「ように」đều có thể biểu thị mục đích nhưng cách dùng khác nhau theo loại động từ. Nếu là động từ có ý chí dùng「ために」, nếu là động từ không có ý chí/trạng thái dùng「ように」. "Vì an toàn" và "để khỏi ngã" là những cách diễn đạt quan trọng trong điều dưỡng.`,
      keyPoints: [
        '〜ために（目的）: 意志動詞＋ために（mục đích — động từ có ý chí）',
        '〜ために（原因）: N/普通形＋ために（nguyên nhân — vì, do）',
        '〜ように（目的）: 無意志動詞・可能形＋ように（để có thể.../ để không...）',
        '〜ように（希望・祈り）: 〜ように祈る・願う（mong, cầu）',
        '意志動詞の例: 食べる・行く・勉強する（động từ có ý chí）',
        '無意志動詞の例: 分かる・できる・聞こえる・転ぶ（động từ không có ý chí）',
      ],
      vocabulary: [
        { word: '意志動詞', reading: 'いしどうし', meaning: '意図してする動作（động từ có ý chí）', example: '食べる・書く・話す' },
        { word: '無意志動詞', reading: 'むいしどうし', meaning: '意図しない動作（động từ không có ý chí）', example: '分かる・できる・聞こえる' },
        { word: '予防', reading: 'よぼう', meaning: '事前に防ぐこと（phòng ngừa）', example: '転倒予防のための訓練' },
        { word: '改善', reading: 'かいぜん', meaning: '良くすること（cải thiện）', example: '生活の質を改善する' },
        { word: '配慮', reading: 'はいりょ', meaning: '気を配ること（quan tâm, lưu ý）', example: '安全に配慮する' },
      ],
      examples: [
        { japanese: '利用者さんの健康のために、毎日体温を記録します。', reading: 'りようしゃさんのけんこうのために、まいにちたいおんをきろくします。', translation: 'Để đảm bảo sức khỏe người được chăm sóc, ghi lại nhiệt độ mỗi ngày.' },
        { japanese: '転ばないように、廊下に手すりをつけました。', reading: 'ころばないように、ろうかにてすりをつけました。', translation: 'Để khỏi ngã, đã lắp tay vịn ở hành lang.' },
        { japanese: '早く回復できるように祈っています。', reading: 'はやくかいふくできるようにいのっています。', translation: 'Tôi cầu mong sẽ hồi phục sớm.' },
      ],
      grammarNote: `【ために vs ように の使い分け】

ために（目的）: 意志動詞のみ
  ○「健康になるために運動する」
  ✗「聞こえるために大きく話す」→ ○ ように

ように（目的）: 無意志動詞・可能形・否定形
  ○「聞こえるように大きく話す」
  ○「忘れないように書いておく」
  ○「転ばないように気をつける」

ために（原因）: N＋のために / 普通形＋ために
  「病気のために休んだ」= vì bị bệnh nên nghỉ

【まとめ】
意志動詞 + ために ← 自分の意志で行う目的
無意志動詞 + ように ← 自然な状態・結果を目指す`,
      quiz: {
        question: '「よく（　）、ゆっくり話してください」に入るのは？',
        options: [
          { id: 'a', text: '聞くために' },
          { id: 'b', text: '聞けるように' },
          { id: 'c', text: '聞くように' },
          { id: 'd', text: '聞くために' },
        ],
        correctId: 'b',
        explanation: '「聞こえる」は無意志動詞なので「ように」を使う。可能形「聞ける」＋ように が正しい。「聞けるように」= để có thể nghe được.',
      },
      xpReward: 30,
    },
  },

  'n3-01-10': {
    courseTitle: { ja: 'N3 文法・語彙総まとめ', vi: 'Tổng hợp ngữ pháp & từ vựng N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: '〜てから / 〜た後で / 〜前に（時間の前後関係）',
      titleTranslation: '〜てから / 〜た後で / 〜前に（Quan hệ trước sau về thời gian）',
      introduction: `「〜てから」「〜た後で」「〜前に」は行動の順序を示します。似ていますが微妙な違いがあります。介護の手順説明（「手洗いをしてからケアに入る」「食事の前に口腔ケアをする」）では正確な順序表現が重要です。

「〜てから」「〜た後で」「〜前に」biểu thị trình tự hành động. Có điểm tương đồng nhưng khác biệt tế nhị. Trong giải thích quy trình điều dưỡng ("rửa tay xong mới bắt đầu chăm sóc", "chăm sóc răng miệng trước khi ăn") thì cách diễn đạt trình tự chính xác rất quan trọng.`,
      keyPoints: [
        '〜てから: 前の行為が完了後、次の行為（sau khi làm xong A thì B）',
        '〜た後で: 前の行為後に続く行為（sau khi A, rồi B — ít ràng buộc hơn）',
        '〜前に: 次の行為の前に〜する（trước khi B thì làm A）',
        'てから vs た後で: てから は順序の強調、た後で はより独立した二つの行為',
        '前に の後は必ず動詞辞書形・名詞（trước「前に」phải là dạng từ điển）',
        '例：手洗いしてからケアする / 食事の前に体温を測る',
      ],
      vocabulary: [
        { word: '手順', reading: 'てじゅん', meaning: '順序・やり方（quy trình）', example: '正しい手順で行う' },
        { word: '口腔ケア', reading: 'こうくうケア', meaning: '口の中の清潔（chăm sóc răng miệng）', example: '食後に口腔ケアをする' },
        { word: '消毒', reading: 'しょうどく', meaning: '菌を殺すこと（khử trùng）', example: '手を消毒してから入室する' },
        { word: '確認', reading: 'かくにん', meaning: '確かめること（xác nhận, kiểm tra）', example: '薬を確認してから渡す' },
        { word: '申し送り', reading: 'もうしおくり', meaning: '勤務の引き継ぎ（bàn giao ca）', example: '申し送りを聞いてから業務を始める' },
      ],
      examples: [
        { japanese: '手を洗ってから、利用者さんのケアを始めます。', reading: 'てをあらってから、りようしゃさんのケアをはじめます。', translation: 'Sau khi rửa tay xong mới bắt đầu chăm sóc người được chăm sóc.' },
        { japanese: '食事の前に、必ず体温と血圧を測ります。', reading: 'しょくじのまえに、かならずたいおんとけつあつをはかります。', translation: 'Trước khi ăn, nhất định phải đo nhiệt độ và huyết áp.' },
        { japanese: '申し送りを聞いた後で、ケア記録を確認しました。', reading: 'もうしおくりをきいたあとで、ケアきろくをかくにんしました。', translation: 'Sau khi nghe bàn giao, đã kiểm tra hồ sơ chăm sóc.' },
      ],
      grammarNote: `【時間の順序表現の比較】

〜てから（sau khi hoàn thành A rồi mới B）:
  「薬を確認してから渡す」
  → Nhấn mạnh A phải xong trước

〜た後で（sau khi A, rồi B）:
  「報告した後で、記録を書いた」
  → Hai hành động tương đối độc lập

〜前に（trước khi B thì làm A）:
  「外出する前に、声かけをする」
  接続: 動詞辞書形＋前に / 名詞＋の前に

【注意！】
「てから」の前は必ずて形
「た後で」の前は必ずた形
「前に」の前は辞書形（否定できない）
✗「食べた前に」→ ○「食べる前に」`,
      quiz: {
        question: '「（　）から、必ず手を消毒してください」に入るのは？',
        options: [
          { id: 'a', text: '入室する' },
          { id: 'b', text: '入室して' },
          { id: 'c', text: '入室した' },
          { id: 'd', text: '入室の後' },
        ],
        correctId: 'b',
        explanation: '「〜てから」の接続はて形＋から。「入室してから消毒する」が正しい順序。「入室してから」= sau khi vào phòng.',
      },
      xpReward: 30,
    },
  },

  'n3-01-11': {
    courseTitle: { ja: 'N3 文法・語彙総まとめ', vi: 'Tổng hợp ngữ pháp & từ vựng N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: '〜ても / 〜たとしても（譲歩・仮定）',
      titleTranslation: '〜ても / 〜たとしても（Nhượng bộ và giả định）',
      introduction: `「〜ても」は「〜であっても、それでも〜」という譲歩を表します。「〜たとしても」は仮定の状況を強調します。介護では「どんなに忙しくても安全を優先する」「もし転倒したとしても、まず状態を確認する」などに使います。

「〜ても」biểu thị nhượng bộ "dù là...nhưng vẫn...".「〜たとしても」nhấn mạnh tình huống giả định. Trong điều dưỡng dùng như "dù bận đến đâu cũng ưu tiên an toàn", "nếu dù có ngã đi nữa thì trước tiên kiểm tra tình trạng".`,
      keyPoints: [
        '〜ても: 逆接の条件「たとえ〜でも」（dù...cũng, dù...nhưng）',
        '〜たとしても: 仮定の強調「もし〜だとしても」（ngay cả khi giả sử...）',
        '「どんなに〜ても」「たとえ〜ても」で強調（dù thế nào đi nữa）',
        '接続: て形＋も / た形＋としても',
        'い形容詞: 〜くても（忙しくても）/ な形容詞: 〜でも（元気でも）',
        '注意: ても は事実・仮定両方使える（cả thực tế lẫn giả định）',
      ],
      vocabulary: [
        { word: '譲歩', reading: 'じょうほ', meaning: '相手の条件を認めた上で（nhượng bộ）', example: '忙しくても、報告は必ずする' },
        { word: 'たとえ', reading: 'たとえ', meaning: 'もし仮に（dù, giả sử）', example: 'たとえ失敗しても、諦めない' },
        { word: '優先', reading: 'ゆうせん', meaning: '先にすること（ưu tiên）', example: '安全を最優先にする' },
        { word: '緊急', reading: 'きんきゅう', meaning: '急いで対処が必要（khẩn cấp）', example: '緊急時の対応を確認する' },
        { word: '対処', reading: 'たいしょ', meaning: '問題への対応（xử lý, ứng phó）', example: '冷静に対処する' },
      ],
      examples: [
        { japanese: 'どんなに忙しくても、利用者さんへの声かけは欠かせません。', reading: 'どんなにいそがしくても、りようしゃさんへのこえかけはかかせません。', translation: 'Dù bận đến đâu, việc nói chuyện với người được chăm sóc là không thể thiếu.' },
        { japanese: 'たとえ疲れていても、安全確認を省くことはできません。', reading: 'たとえつかれていても、あんぜんかくにんをはぶくことはできません。', translation: 'Dù có mệt đi nữa, cũng không thể bỏ qua việc kiểm tra an toàn.' },
        { japanese: 'もし転倒したとしても、まず意識と呼吸を確認してください。', reading: 'もしてんとうしたとしても、まずいしきとこきゅうをかくにんしてください。', translation: 'Ngay cả khi giả sử có ngã, trước tiên hãy kiểm tra ý thức và hô hấp.' },
      ],
      grammarNote: `【〜ても vs 〜たとしても】

〜ても（nhượng bộ chung）:
  「疲れても頑張る」= dù mệt vẫn cố gắng
  「雨でも出かける」= dù mưa vẫn đi
  接続: て形＋も / 〜くても / 〜でも

〜たとしても（仮定の強調）:
  「失敗したとしても、学びがある」
  = ngay cả khi giả sử thất bại, vẫn có bài học
  接続: た形＋としても（仮定の色が強い）

【強調表現】
たとえ〜ても = dù thế nào cũng
どんなに〜ても = dù đến mức nào cũng
いくら〜ても = dù bao nhiêu cũng`,
      quiz: {
        question: '「（　）忙しくても、報告は必ず行ってください」の（　）に入るのは？',
        options: [
          { id: 'a', text: 'もし' },
          { id: 'b', text: 'たとえ' },
          { id: 'c', text: 'どんなに' },
          { id: 'd', text: 'なぜ' },
        ],
        correctId: 'c',
        explanation: '「どんなに〜ても」は程度の強調。「どんなに忙しくても」= dù bận đến mức nào. 「たとえ〜ても」も正しいが、程度の強調は「どんなに」が自然。',
      },
      xpReward: 30,
    },
  },

  'n3-01-12': {
    courseTitle: { ja: 'N3 文法・語彙総まとめ', vi: 'Tổng hợp ngữ pháp & từ vựng N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: '〜てみる / 〜ておく / 〜ていく・てくる（補助動詞）',
      titleTranslation: '〜てみる / 〜ておく / 〜ていく・てくる（Trợ động từ）',
      introduction: `補助動詞「てみる・ておく・ていく・てくる」はそれぞれ動作に意味を加えます。介護の指示や報告でよく使います。「試しにやってみる」「準備しておく」「利用者さんが落ち着いてきた」など自然な日本語の表現に欠かせません。

Trợ động từ「てみる・ておく・ていく・てくる」mỗi cái thêm ý nghĩa vào hành động. Thường dùng trong chỉ thị và báo cáo điều dưỡng. Những cách diễn đạt như "thử làm xem", "chuẩn bị sẵn", "người được chăm sóc đã bình tĩnh lại" là không thể thiếu trong tiếng Nhật tự nhiên.`,
      keyPoints: [
        '〜てみる: 試してする「試みる」（thử làm xem）',
        '〜ておく: 準備・前もって〜する（làm sẵn, chuẩn bị trước）',
        '〜ていく: 現在から未来へ変化・動作が続く（tiếp tục từ hiện tại về phía tương lai）',
        '〜てくる: 過去から現在へ変化・帰還（từ quá khứ đến hiện tại / về）',
        '介護例: 「声かけてみる」「記録しておく」「状態が悪くなっていく」「回復してきた」',
        '〜ておく の縮約形: 〜とく（書いとく・準備しとく）',
      ],
      vocabulary: [
        { word: '〜てみる', reading: 'てみる', meaning: '試す（thử）', example: '新しい方法でやってみる' },
        { word: '〜ておく', reading: 'ておく', meaning: '前もって準備する（chuẩn bị sẵn）', example: '薬を準備しておく' },
        { word: '〜ていく', reading: 'ていく', meaning: '変化が続く・移動する（tiếp tục, đi）', example: '状態が改善していく' },
        { word: '〜てくる', reading: 'てくる', meaning: '変化が来る・帰る（thay đổi đến nay, về）', example: '食欲が戻ってきた' },
        { word: '食欲', reading: 'しょくよく', meaning: '食べたい気持ち（cảm giác thèm ăn）', example: '食欲が出てきた' },
      ],
      examples: [
        { japanese: '田中さんに声をかけてみましたが、反応がありませんでした。', reading: 'たなかさんにこえをかけてみましたが、はんのうがありませんでした。', translation: 'Đã thử lên tiếng với ông Tanaka nhưng không có phản ứng.' },
        { japanese: '夜間に備えて、薬と記録用紙を準備しておきました。', reading: 'やかんにそなえて、くすりときろくようしをじゅんびしておきました。', translation: 'Để chuẩn bị cho ban đêm, đã để sẵn thuốc và giấy ghi chép.' },
        { japanese: '最近、山田さんの食欲が戻ってきました。回復のサインです。', reading: 'さいきん、やまださんのしょくよくがもどってきました。かいふくのサインです。', translation: 'Gần đây cảm giác thèm ăn của ông Yamada đã trở lại. Đây là dấu hiệu hồi phục.' },
      ],
      grammarNote: `【補助動詞の意味と使い方】

てみる（thử）:
  「薬を減らしてみる」= thử giảm thuốc xem

ておく（chuẩn bị/duy trì）:
  「記録しておく」= ghi lại sẵn（phòng sau）
  会話縮約: 「記録しとく」

ていく（→ 未来方向）:
  「体力が落ちていく」= sức khỏe ngày càng giảm
  「これから頑張っていく」= sẽ tiếp tục cố gắng

てくる（← 過去から現在）:
  「だんだん回復してきた」= dần dần đã hồi phục
  「雨が降ってきた」= trời bắt đầu mưa rồi`,
      quiz: {
        question: '「申し送りの内容をメモし（　）。後で確認できるように」に入るのは？',
        options: [
          { id: 'a', text: 'てみた' },
          { id: 'b', text: 'ておいた' },
          { id: 'c', text: 'てきた' },
          { id: 'd', text: 'ていった' },
        ],
        correctId: 'b',
        explanation: '後で使えるように準備・保存するのは「ておく」。「メモしておいた」= đã ghi chú sẵn để sau này có thể xem lại.',
      },
      xpReward: 30,
    },
  },

  'n3-01-13': {
    courseTitle: { ja: 'N3 文法・語彙総まとめ', vi: 'Tổng hợp ngữ pháp & từ vựng N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: '間接疑問〜かどうか / 〜か（疑問詞＋か）',
      titleTranslation: 'Câu hỏi gián tiếp 〜かどうか / 〜か（Nghi vấn từ + か）',
      introduction: `間接疑問文は「〜かどうか」「〜か」を使って、疑問文を文の一部として埋め込みます。直接疑問（「来ますか？」）とは異なり、報告や質問を柔らかく伝えるときに使います。「利用者さんが食事をしたかどうか確認する」など介護記録や報告に必須です。

Câu hỏi gián tiếp dùng「〜かどうか」「〜か」để nhúng câu hỏi vào câu. Khác với câu hỏi trực tiếp（「来ますか？」）, dùng khi truyền đạt báo cáo hay câu hỏi một cách nhẹ nhàng. Không thể thiếu trong hồ sơ và báo cáo điều dưỡng như "xác nhận xem người được chăm sóc đã ăn chưa".`,
      keyPoints: [
        '〜かどうか: yes/no疑問の間接表現（có...hay không）',
        '〜か（疑問詞＋か）: who/what/when等の間接疑問（ai, cái gì, khi nào... + か）',
        '接続: 普通形＋かどうか / 疑問詞＋普通形＋か',
        '動詞・形容詞: 普通形のまま（だ は省略可）',
        '名詞・な形容詞: 〜か / 〜かどうか（だ は外す）',
        '介護例：「薬を飲んだかどうか確認する」「どこが痛いか聞く」',
      ],
      vocabulary: [
        { word: 'かどうか', reading: 'かどうか', meaning: '〜か〜ないか（có...không, liệu có...không）', example: '熱があるかどうか確認する' },
        { word: '疑問詞', reading: 'ぎもんし', meaning: '何・どこ・いつ・誰（nghi vấn từ）', example: '疑問詞は文の最初に来ることが多い' },
        { word: '確認', reading: 'かくにん', meaning: '確かめること（xác nhận）', example: '薬を飲んだか確認する' },
        { word: '報告', reading: 'ほうこく', meaning: '情報を上に伝えること（báo cáo）', example: '状態を上司に報告する' },
        { word: '把握', reading: 'はあく', meaning: '正確に理解すること（nắm bắt, hiểu rõ）', example: '状況を把握する' },
      ],
      examples: [
        { japanese: '田中さんが昼食を食べたかどうか確認してください。', reading: 'たなかさんがちゅうしょくをたべたかどうかかくにんしてください。', translation: 'Hãy xác nhận xem ông Tanaka có ăn bữa trưa không.' },
        { japanese: 'どこが痛いか、利用者さんに聞いてみました。', reading: 'どこがいたいか、りようしゃさんにきいてみました。', translation: 'Đã thử hỏi người được chăm sóc xem đau ở đâu.' },
        { japanese: 'いつ転倒したか、詳しく記録してください。', reading: 'いつてんとうしたか、くわしくきろくしてください。', translation: 'Hãy ghi chép chi tiết xem khi nào ngã.' },
      ],
      grammarNote: `【間接疑問文の作り方】

①かどうか（yes/no疑問）:
  直接: 「薬を飲みましたか？」
  間接: 「薬を飲んだかどうか確認する」
  接続: 普通形＋かどうか

②疑問詞＋か（WH疑問）:
  直接: 「どこが痛いですか？」
  間接: 「どこが痛いか聞く」
  接続: 疑問詞＋普通形＋か

【注意点】
間接疑問文の動詞は普通形
✗「薬を飲みましたかどうか」→ ○「飲んだかどうか」
✗「どこが痛いですか聞く」→ ○「どこが痛いか聞く」`,
      quiz: {
        question: '「山田さんが転倒した後、意識がある（　）確認しました」に入るのは？',
        options: [
          { id: 'a', text: 'かどうかを' },
          { id: 'b', text: 'かですかを' },
          { id: 'c', text: 'ですかどうか' },
          { id: 'd', text: 'かもしれなく' },
        ],
        correctId: 'a',
        explanation: 'yes/no疑問の間接表現は「かどうか」。「意識があるかどうか確認した」= xác nhận xem có ý thức không.',
      },
      xpReward: 30,
    },
  },

  'n3-01-14': {
    courseTitle: { ja: 'N3 文法・語彙総まとめ', vi: 'Tổng hợp ngữ pháp & từ vựng N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: '〜と思う / 〜と思っている / 〜と言われている（引用・意見）',
      titleTranslation: '〜と思う / 〜と思っている / 〜と言われている（Trích dẫn và ý kiến）',
      introduction: `「〜と思う」は一時的な意見・感想、「〜と思っている」は継続的な考え、「〜と言われている」は一般的に広く言われていることを表します。医療・介護の場では意見や情報の出所を明示することが重要です。

「〜と思う」biểu thị ý kiến/cảm nhận nhất thời,「〜と思っている」là suy nghĩ liên tục, 「〜と言われている」là điều được nói rộng rãi nói chung. Trong y tế và điều dưỡng, việc chỉ rõ nguồn gốc của ý kiến và thông tin rất quan trọng.`,
      keyPoints: [
        '〜と思う: 今・この瞬間の意見・判断（ý kiến nhất thời hiện tại）',
        '〜と思っている: 以前から持っている考え（suy nghĩ đang duy trì）',
        '〜と言われている: 世間・専門家などの一般的な意見（được nói chung là...）',
        '〜と言っていた: 特定の人が言ったことの引用（ai đó đã nói rằng...）',
        '接続: 普通形＋と思う / 普通形＋と言われている',
        '引用の「と」は直接・間接引用に使う',
      ],
      vocabulary: [
        { word: '引用', reading: 'いんよう', meaning: '他の人の言葉を使うこと（trích dẫn）', example: '報告書に引用する' },
        { word: '意見', reading: 'いけん', meaning: '自分の考え（ý kiến）', example: '自分の意見を述べる' },
        { word: '〜と言われている', reading: 'といわれている', meaning: '一般にそう言われる（được cho là, được nói là）', example: '認知症は早期発見が大切と言われている' },
        { word: '専門家', reading: 'せんもんか', meaning: 'その分野の知識がある人（chuyên gia）', example: '専門家の意見を聞く' },
        { word: '一般的', reading: 'いっぱんてき', meaning: '広く普通に（nói chung, phổ biến）', example: '一般的にそう言われている' },
      ],
      examples: [
        { japanese: '今日は田中さんの調子が少し悪いと思います。様子を見ましょう。', reading: 'きょうはたなかさんのちょうしがすこしわるいとおもいます。ようすをみましょう。', translation: 'Tôi nghĩ hôm nay tình trạng của ông Tanaka hơi xấu. Hãy theo dõi xem.' },
        { japanese: '高齢者の転倒は夜間に多いと言われています。', reading: 'こうれいしゃのてんとうはやかんにおおいといわれています。', translation: 'Người ta nói rằng người cao tuổi hay ngã nhiều vào ban đêm.' },
        { japanese: '山田さんは早く家に帰りたいと言っていました。', reading: 'やまださんははやくいえにかえりたいといっていました。', translation: 'Ông Yamada đã nói rằng muốn sớm về nhà.' },
      ],
      grammarNote: `【引用・意見の表現比較】

と思う（意見・現在）:
  「これは間違いだと思う」= tôi nghĩ cái này sai
  話し手の今の判断

と思っている（継続的な意見）:
  「介護はやりがいがあると思っている」
  = tôi luôn nghĩ rằng điều dưỡng có ý nghĩa

と言われている（一般論・通説）:
  「早期発見が大切と言われている」
  = người ta nói rằng phát hiện sớm là quan trọng

と言っていた（特定の人の発言）:
  「先生がそう言っていた」
  = thầy đã nói như vậy`,
      quiz: {
        question: '「認知症は運動が予防に効果的（　）。専門家の研究による」に入るのは？',
        options: [
          { id: 'a', text: 'と思う' },
          { id: 'b', text: 'と言っていた' },
          { id: 'c', text: 'と言われている' },
          { id: 'd', text: 'と思っていた' },
        ],
        correctId: 'c',
        explanation: '専門家の研究から広く言われていることなので「と言われている」が正解。「と言われている」= được cho là, được nói chung là（nguồn gốc là chuyên gia/xã hội）.',
      },
      xpReward: 30,
    },
  },

  'n3-01-15': {
    courseTitle: { ja: 'N3 文法・語彙総まとめ', vi: 'Tổng hợp ngữ pháp & từ vựng N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: '受身形 〜られる（直接受身・間接受身・迷惑受身）',
      titleTranslation: 'Thể bị động 〜られる（Bị động trực tiếp, gián tiếp, bất lợi）',
      introduction: `受身形（〜られる）には①直接受身②間接受身③迷惑受身の三種類があります。介護現場では「転倒させられる」「声をかけられた」「夜中に起こされた」など多くの場面で使います。正確な受身の理解は報告書作成にも重要です。

Thể bị động（〜られる）có ba loại: ①bị động trực tiếp ②bị động gián tiếp ③bị động bất lợi. Trong điều dưỡng dùng trong nhiều tình huống như "bị ngã", "được lên tiếng với", "bị đánh thức ban đêm". Hiểu chính xác thể bị động cũng quan trọng cho việc viết báo cáo.`,
      keyPoints: [
        '直接受身: 動作の対象が主語（A は B に〜られる）（bị động trực tiếp）',
        '間接受身: 動作が影響を及ぼす（A は B に〜られる — ảnh hưởng gián tiếp）',
        '迷惑受身: 被害・不都合な事態（A は B に〜られる — bất lợi, phiền）',
        '受身形の作り方: グループ1: u→aれる / グループ2: る→られる / グループ3: される',
        '「〜に」が行為者を示す（「〜に」chỉ người thực hiện hành động）',
        '敬語的受身: 先生が来られた（尊敬語）— 注意！',
      ],
      vocabulary: [
        { word: '受身', reading: 'うけみ', meaning: '受ける立場の形（thể bị động）', example: '受身文を作る' },
        { word: '迷惑', reading: 'めいわく', meaning: '困ること（phiền phức, bất lợi）', example: '夜中に起こされて迷惑した' },
        { word: '行為者', reading: 'こういしゃ', meaning: '動作をする人（người thực hiện hành động）', example: '行為者は「に」で示す' },
        { word: '批判', reading: 'ひはん', meaning: '悪い評価をすること（chỉ trích, phê bình）', example: '上司に批判された' },
        { word: '怒られる', reading: 'おこられる', meaning: '叱られること（bị mắng）', example: 'ミスをして怒られた' },
      ],
      examples: [
        { japanese: '田中さんは昨夜、看護師に血圧を測られました。（直接受身）', reading: 'たなかさんはゆうべ、かんごしにけつあつをはかられました。', translation: 'Ông Tanaka tối qua được y tá đo huyết áp.（bị động trực tiếp）' },
        { japanese: '私は夜中に利用者さんに起こされて、眠れませんでした。（迷惑受身）', reading: 'わたしはよなかにりようしゃさんにおこされて、ねむれませんでした。', translation: 'Tôi bị người được chăm sóc đánh thức giữa đêm và không ngủ được.（bị động bất lợi）' },
        { japanese: '記録を書き忘れて、上司に注意されました。（迷惑受身）', reading: 'きろくをかきわすれて、じょうしにちゅういされました。', translation: 'Do quên viết hồ sơ nên bị cấp trên nhắc nhở.' },
      ],
      grammarNote: `【受身形の三種類】

①直接受身（bị động trực tiếp）:
  「利用者さんがスタッフにケアされた」
  = người được chăm sóc được nhân viên chăm sóc

②間接受身（bị động gián tiếp — ảnh hưởng）:
  「私は隣の人に話しかけられた」
  = tôi được/bị người kế bên nói chuyện

③迷惑受身（bị động bất lợi）:
  「夜中に電話をかけられて困った」
  = bị gọi điện giữa đêm, thật phiền

【活用】
グループ1: 書く→書かれる / 飲む→飲まれる
グループ2: 食べる→食べられる
グループ3: する→される / くる→こられる`,
      quiz: {
        question: '「私は上司に仕事を（　）、困りました」— 迷惑受身の文は？',
        options: [
          { id: 'a', text: '頼む' },
          { id: 'b', text: '頼まれて' },
          { id: 'c', text: '頼んで' },
          { id: 'd', text: '頼まして' },
        ],
        correctId: 'b',
        explanation: '迷惑受身は「（頼む→）頼まれる」のて形「頼まれて」。「上司に頼まれて困った」= bị cấp trên nhờ vả, thật phiền.',
      },
      xpReward: 30,
    },
  },

  'n3-01-16': {
    courseTitle: { ja: 'N3 文法・語彙総まとめ', vi: 'Tổng hợp ngữ pháp & từ vựng N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: '使役形 〜させる / 使役受身 〜させられる',
      titleTranslation: 'Thể sai khiến 〜させる / Bị động sai khiến 〜させられる',
      introduction: `使役形（〜させる）は「誰かに〜させる（allow/make）」、使役受身（〜させられる）は「誰かに無理やり〜させられる（forced to）」を表します。介護の職場では上司が指示する場面や、職員が感じる負担を表すときに使います。

Thể sai khiến（〜させる）biểu thị "khiến ai đó làm～（cho phép/bắt buộc）", thể bị động sai khiến（〜させられる）biểu thị "bị ai đó ép buộc phải làm～". Trong môi trường điều dưỡng dùng khi cấp trên ra chỉ thị hoặc diễn đạt gánh nặng mà nhân viên cảm nhận.`,
      keyPoints: [
        '使役形: AはBを/にVさせる（A khiến/cho B làm V）',
        '使役受身: AはBにVさせられる（A bị B ép buộc làm V）',
        '使役の意味①: 強制「〜させる」（ép buộc）',
        '使役の意味②: 許可「〜させる」（cho phép）',
        '活用: グループ1: 飲む→飲ませる / グループ2: 食べる→食べさせる / グループ3: させる・こさせる',
        '使役受身の短縮形: グループ1のみ 〜させられる→〜される（呼ぶ→呼ばされる）',
      ],
      vocabulary: [
        { word: '使役', reading: 'しえき', meaning: 'させる形（thể sai khiến）', example: '薬を飲ませる' },
        { word: '強制', reading: 'きょうせい', meaning: '無理やり〜させること（cưỡng bức, bắt buộc）', example: '無理やり働かされた' },
        { word: '許可', reading: 'きょか', meaning: '〜してよいと認めること（cho phép）', example: '外出を許可する' },
        { word: '負担', reading: 'ふたん', meaning: '重い仕事・責任（gánh nặng）', example: '業務の負担が大きい' },
        { word: '指示', reading: 'しじ', meaning: '上から命令・指導（chỉ thị）', example: '上司の指示に従う' },
      ],
      examples: [
        { japanese: '看護師は患者に薬を飲ませました。（使役・強制/許可）', reading: 'かんごしはかんじゃにくすりをのませました。', translation: 'Y tá đã cho/bắt bệnh nhân uống thuốc.（sai khiến）' },
        { japanese: '毎日残業させられて、とても疲れました。（使役受身・不満）', reading: 'まいにちざんぎょうさせられて、とてもつかれました。', translation: 'Bị bắt làm thêm giờ mỗi ngày, tôi rất mệt.（bị động sai khiến — bất mãn）' },
        { japanese: '施設長は新人スタッフに研修を受けさせました。', reading: 'しせつちょうはしんじんスタッフにけんしゅうをうけさせました。', translation: 'Giám đốc cơ sở đã cho/yêu cầu nhân viên mới tham gia đào tạo.' },
      ],
      grammarNote: `【使役形 vs 使役受身】

使役形（〜させる）— "khiến/cho phép làm":
  「子どもに薬を飲ませる」= cho trẻ uống thuốc
  「利用者さんに歩かせる」= cho người được chăm sóc đi bộ

使役受身（〜させられる）— "bị ép buộc phải làm":
  「毎日早く来させられる」= bị bắt phải đến sớm mỗi ngày
  「無理な仕事をさせられた」= bị ép làm công việc quá sức

【活用表】
グループ1: 書く→書かせる→書かせられる（書かされる）
グループ2: 食べる→食べさせる→食べさせられる
グループ3: する→させる→させられる`,
      quiz: {
        question: '「新人のときは、毎日早く来る（　）。辛かった」— 強制の意味は？',
        options: [
          { id: 'a', text: 'ようにした' },
          { id: 'b', text: 'させた' },
          { id: 'c', text: 'させられた' },
          { id: 'd', text: 'させてもらった' },
        ],
        correctId: 'c',
        explanation: '自分が強制された（辛かった）ので「させられた」（使役受身）が正解。「させられた」= bị ép buộc phải làm（bất đắc dĩ）.',
      },
      xpReward: 30,
    },
  },

  'n3-01-17': {
    courseTitle: { ja: 'N3 文法・語彙総まとめ', vi: 'Tổng hợp ngữ pháp & từ vựng N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: '〜ば〜ほど / 〜につれて / 〜とともに（比例・変化）',
      titleTranslation: '〜ば〜ほど / 〜につれて / 〜とともに（Tỷ lệ thuận và sự thay đổi）',
      introduction: `「〜ば〜ほど」「〜につれて」「〜とともに」はどれも二つの事柄の変化が比例していることを表します。介護・医療の観察記録（「年齢が上がるにつれて認知症リスクが高まる」）に役立つ表現です。

「〜ば〜ほど」「〜につれて」「〜とともに」đều biểu thị hai sự việc thay đổi tỷ lệ thuận với nhau. Hữu ích cho hồ sơ quan sát y tế/điều dưỡng（"tuổi càng cao thì nguy cơ sa sút trí tuệ càng tăng"）.`,
      keyPoints: [
        '〜ば〜ほど: 一方が増すほど他方も増す（càng...càng...）',
        '〜につれて: Aの変化に伴いBも変化（cùng với A thay đổi thì B cũng thay đổi）',
        '〜とともに: Aと同時にBも〜（cùng với, đồng thời với）',
        '〜ば〜ほど の接続: 動詞ば形＋同じ動詞＋ほど / い形容詞ければ〜ほど',
        '〜につれて は自然な変化に使いやすい（biến đổi tự nhiên）',
        '〜とともに はやや書き言葉的（thiên về văn viết）',
      ],
      vocabulary: [
        { word: '比例', reading: 'ひれい', meaning: '一方が増えると他方も増える（tỷ lệ thuận）', example: '年齢と体力は反比例する' },
        { word: '高齢化', reading: 'こうれいか', meaning: '高齢者が増える（già hóa）', example: '日本の高齢化が進む' },
        { word: '低下', reading: 'ていか', meaning: '下がること（giảm xuống）', example: '体力が低下する' },
        { word: '向上', reading: 'こうじょう', meaning: '上がること（nâng cao, cải thiện）', example: '技術が向上する' },
        { word: '進む', reading: 'すすむ', meaning: '前に進む・発展する（tiến triển, tiến lên）', example: '病気が進む' },
      ],
      examples: [
        { japanese: '経験を積めば積むほど、利用者さんの変化に気づきやすくなります。', reading: 'けいけんをつめばつむほど、りようしゃさんのへんかにきづきやすくなります。', translation: 'Càng tích lũy kinh nghiệm, càng dễ nhận ra sự thay đổi của người được chăm sóc.' },
        { japanese: '年齢が上がるにつれて、転倒のリスクが高まります。', reading: 'ねんれいがあがるにつれて、てんとうのリスクがたかまります。', translation: 'Cùng với tuổi tác tăng lên, nguy cơ té ngã cũng tăng lên.' },
        { japanese: '高齢化の進行とともに、介護ニーズも増加しています。', reading: 'こうれいかのしんこうとともに、かいごニーズもぞうかしています。', translation: 'Cùng với sự tiến triển của già hóa dân số, nhu cầu điều dưỡng cũng tăng lên.' },
      ],
      grammarNote: `【比例・変化表現の比較】

〜ば〜ほど（càng...càng...）:
  「練習すればするほど上手になる」
  接続: 動詞ば形＋同動詞辞書形＋ほど

〜につれて（cùng với A thì B cũng）:
  「春になるにつれて暖かくなる」
  接続: 動詞辞書形・名詞＋につれて

〜とともに（cùng với, đồng thời）:
  「技術の発展とともに介護も変わった」
  接続: 名詞＋とともに / 動詞辞書形＋とともに

【ニュアンス比較】
ば〜ほど = 強調した比例
につれて = 自然な変化の連動
とともに = 同時進行・格式的`,
      quiz: {
        question: '「日本語を勉強すれば（　）、仕事がしやすくなる」に入るのは？',
        options: [
          { id: 'a', text: 'するにつれて' },
          { id: 'b', text: 'するほど' },
          { id: 'c', text: 'するとともに' },
          { id: 'd', text: 'したほど' },
        ],
        correctId: 'b',
        explanation: '「〜ば〜ほど」の形：「勉強すれば（するほど）」。「するほど」が正解。「勉強すればするほど」= càng học càng dễ làm việc.',
      },
      xpReward: 30,
    },
  },

  'n3-01-18': {
    courseTitle: { ja: 'N3 文法・語彙総まとめ', vi: 'Tổng hợp ngữ pháp & từ vựng N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: '〜はずだ / 〜はずがない（当然・否定の確信）',
      titleTranslation: '〜はずだ / 〜はずがない（Điều đương nhiên / Không thể nào）',
      introduction: `「〜はずだ」は根拠に基づく確信・当然の推測、「〜はずがない」は根拠に基づく強い否定を表します。「この薬を飲んだはずだ」「そんなミスをするはずがない」など、介護現場での事実確認や確信の表現に使います。

「〜はずだ」biểu thị sự chắc chắn/suy đoán đương nhiên dựa trên căn cứ,「〜はずがない」biểu thị sự phủ định mạnh dựa trên căn cứ. Dùng trong xác nhận sự thật và diễn đạt sự chắc chắn tại nơi làm việc điều dưỡng như "hẳn là đã uống thuốc rồi", "không thể nào mắc lỗi như vậy".`,
      keyPoints: [
        '〜はずだ: 根拠のある確信「当然〜のはず」（đương nhiên phải là, hẳn là）',
        '〜はずがない: 根拠のある否定「〜のはずはない」（không thể nào）',
        '〜はずだった: 予定・期待が実現しなかった（đáng lẽ phải...nhưng）',
        '接続: 普通形＋はずだ / 名詞＋のはずだ / な形容詞＋な＋はずだ',
        '根拠が重要: 証拠・理由があって言う（căn cứ quan trọng）',
        'vs 〜と思う: はずだ は根拠あり、と思う は主観的意見',
      ],
      vocabulary: [
        { word: '確信', reading: 'かくしん', meaning: '強く信じること（sự chắc chắn）', example: '絶対に正しいと確信している' },
        { word: '根拠', reading: 'こんきょ', meaning: '理由・証拠（căn cứ, bằng chứng）', example: '根拠のある判断をする' },
        { word: '当然', reading: 'とうぜん', meaning: '普通そうあるべき（đương nhiên, tất nhiên）', example: '当然のことをする' },
        { word: '予定', reading: 'よてい', meaning: '前もって決まっていること（kế hoạch, dự định）', example: '今日は早退の予定だった' },
        { word: '一致', reading: 'いっち', meaning: '合っていること（khớp, trùng nhau）', example: '記録と現実が一致している' },
      ],
      examples: [
        { japanese: '田中さんは朝9時に薬を飲んだはずです。記録に書いてあります。', reading: 'たなかさんはあさくじにくすりをのんだはずです。きろくにかいてあります。', translation: 'Ông Tanaka hẳn đã uống thuốc lúc 9h sáng. Được ghi trong hồ sơ.' },
        { japanese: '彼女はベテランスタッフだから、そんなミスをするはずがない。', reading: 'かのじょはベテランスタッフだから、そんなミスをするはずがない。', translation: 'Cô ấy là nhân viên lành nghề nên không thể nào mắc lỗi như vậy.' },
        { japanese: '今日は退院のはずだったが、体調が悪くて延期になった。', reading: 'きょうはたいいんのはずだったが、たいちょうがわるくてえんきになった。', translation: 'Đáng lẽ hôm nay xuất viện nhưng vì sức khỏe kém nên đã hoãn lại.' },
      ],
      grammarNote: `【〜はずだ / 〜はずがない】

はずだ（chắc chắn là, đương nhiên）:
  「確認したはずだ」= hẳn là đã kiểm tra rồi
  根拠: 記録がある・手順を踏んだ

はずがない（không thể nào）:
  「こんな場所にあるはずがない」= không thể nào có ở đây
  根拠: 常識的に考えて不可能

はずだった（đáng lẽ phải...nhưng）:
  「来るはずだったが来なかった」
  = đáng lẽ phải đến nhưng không đến

【接続】
動詞普通形・い形容詞＋はずだ
名詞＋の＋はずだ
な形容詞語幹＋な＋はずだ`,
      quiz: {
        question: '「この薬は冷蔵庫に（　）。昨日確認しました」に入るのは？',
        options: [
          { id: 'a', text: 'あるはずがない' },
          { id: 'b', text: 'あるはずだ' },
          { id: 'c', text: 'あるかもしれない' },
          { id: 'd', text: 'あるらしい' },
        ],
        correctId: 'b',
        explanation: '昨日確認したという根拠があるので「あるはずだ」が正解。「あるはずだ」= hẳn là có（có căn cứ — đã kiểm tra hôm qua）.',
      },
      xpReward: 30,
    },
  },

  'n3-01-19': {
    courseTitle: { ja: 'N3 文法・語彙総まとめ', vi: 'Tổng hợp ngữ pháp & từ vựng N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: '〜わけだ / 〜わけがない / 〜わけにはいかない',
      titleTranslation: '〜わけだ / 〜わけがない / 〜わけにはいかない（Lý do / Không thể / Không thể không）',
      introduction: `「わけ」は「道理・理由・当然の結果」を意味します。「〜わけだ」は理解・納得、「〜わけがない」は強い否定、「〜わけにはいかない」は社会的・道義的に不可能を表します。介護現場での判断・義務の表現に役立ちます。

「わけ」có nghĩa là "lý do, đạo lý, kết quả đương nhiên". 「〜わけだ」biểu thị sự hiểu/chấp nhận, 「〜わけがない」biểu thị phủ định mạnh, 「〜わけにはいかない」biểu thị không thể làm vì lý do xã hội/đạo đức. Hữu ích cho diễn đạt phán quyết và nghĩa vụ tại nơi làm việc điều dưỡng.`,
      keyPoints: [
        '〜わけだ: 当然の結果・納得「それは〜だよね」（đương nhiên là vậy, hóa ra là）',
        '〜わけがない: 強い否定「〜のは不可能」（không thể nào, vô lý）',
        '〜わけにはいかない: 社会的・道徳的にできない（không thể không, không được phép）',
        '〜わけではない: 全否定ではない「〜というわけでもない」（không phải là...）',
        '接続: 普通形＋わけだ / 名詞・な形容詞＋な＋わけだ',
        'vs はずだ: わけだ は理解・納得、はずだ は予測・確信',
      ],
      vocabulary: [
        { word: '道理', reading: 'どうり', meaning: '筋が通った理由（đạo lý, lẽ phải）', example: '道理として正しい' },
        { word: '義務', reading: 'ぎむ', meaning: 'しなければならない責任（nghĩa vụ）', example: '報告する義務がある' },
        { word: '納得', reading: 'なっとく', meaning: '理解して受け入れること（chấp nhận, thông hiểu）', example: '説明を聞いて納得した' },
        { word: 'プロ', reading: 'プロ', meaning: '専門家・プロフェッショナル（chuyên nghiệp）', example: 'プロとして仕事をする' },
        { word: '責任', reading: 'せきにん', meaning: 'やるべき義務（trách nhiệm）', example: '責任を持って対応する' },
      ],
      examples: [
        { japanese: '10年の経験があるなら、難しい介護ができるわけだ。（納得）', reading: 'じゅうねんのけいけんがあるなら、むずかしいかいごができるわけだ。', translation: 'Có 10 năm kinh nghiệm thì đương nhiên làm được việc chăm sóc khó.（hóa ra là vậy）' },
        { japanese: 'プロの介護士が基本的な手順を知らないわけがない。（否定）', reading: 'プロのかいごしがきほんてきなてじゅんをしらないわけがない。', translation: 'Điều dưỡng viên chuyên nghiệp không thể nào không biết quy trình cơ bản.' },
        { japanese: '利用者さんの安全を守る仕事を途中でやめるわけにはいかない。', reading: 'りようしゃさんのあんぜんをまもるしごとをとちゅうでやめるわけにはいかない。', translation: 'Không thể bỏ dở công việc bảo vệ an toàn cho người được chăm sóc giữa chừng.' },
      ],
      grammarNote: `【わけ の三つの表現】

わけだ（hóa ra là / đương nhiên）:
  「そういうわけか、納得した」= À ra vậy, tôi hiểu rồi
  前の情報から自然に導かれる結論

わけがない（không thể nào）:
  「嘘をつくわけがない」= không thể nào nói dối
  根拠があって強く否定

わけにはいかない（không được phép / không thể không）:
  「安全確認をしないわけにはいかない」
  = không thể không kiểm tra an toàn
  社会的/道義的に不可能

【注意】わけではない = 「完全にそうではない」
  「嫌いなわけではない」= không phải là ghét đâu`,
      quiz: {
        question: '「利用者さんが転倒した。すぐに報告しない（　）」に入るのは？',
        options: [
          { id: 'a', text: 'わけだ' },
          { id: 'b', text: 'わけがない' },
          { id: 'c', text: 'わけにはいかない' },
          { id: 'd', text: 'わけではない' },
        ],
        correctId: 'c',
        explanation: '社会的・職務的にできないことなので「わけにはいかない」が正解。「報告しないわけにはいかない」= không thể không báo cáo（nghĩa vụ）.',
      },
      xpReward: 30,
    },
  },

  'n3-01-20': {
    courseTitle: { ja: 'N3 文法・語彙総まとめ', vi: 'Tổng hợp ngữ pháp & từ vựng N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: '〜のではないか / 〜にちがいない / 〜に違いない（推量の強さ）',
      titleTranslation: '〜のではないか / 〜にちがいない（Mức độ mạnh của suy đoán）',
      introduction: `推量表現には確信の強さがあります。「〜にちがいない」は強い確信（80〜90%）、「〜のではないか」は可能性の提示（50〜70%）です。医療・介護の場では確信の程度に応じた表現選択が報告書の精度に影響します。

Các cách diễn đạt suy đoán có mức độ chắc chắn. 「〜にちがいない」là sự chắc chắn mạnh（80〜90%）,「〜のではないか」là đề xuất khả năng（50〜70%）. Trong y tế/điều dưỡng, việc chọn cách diễn đạt theo mức độ chắc chắn ảnh hưởng đến độ chính xác của báo cáo.`,
      keyPoints: [
        '〜にちがいない: 強い確信（mức độ chắc chắn cao — chắc chắn là）',
        '〜のではないか / 〜のではないだろうか: 可能性・婉曲な推量（có lẽ là, có phải chăng）',
        '確信の強さ: にちがいない ＞ はずだ ＞ のではないか ＞ かもしれない',
        '接続: 普通形＋にちがいない / 普通形＋のではないか',
        '〜のではないか は意見・提案を柔らかく言う時にも使う',
        '書き言葉: 〜に違いない（漢字）も使う',
      ],
      vocabulary: [
        { word: 'にちがいない', reading: 'にちがいない', meaning: '絶対に〜だ（chắc chắn là）', example: '彼は知っているにちがいない' },
        { word: 'のではないか', reading: 'のではないか', meaning: 'おそらく〜だろう（có lẽ là, phải chăng）', example: '熱があるのではないか' },
        { word: '確信', reading: 'かくしん', meaning: '強い信念（sự chắc chắn）', example: '確信を持って言う' },
        { word: '推量', reading: 'すいりょう', meaning: '推測・予測（suy đoán）', example: '推量の表現を使う' },
        { word: '可能性', reading: 'かのうせい', meaning: '〜かもしれない度合い（khả năng）', example: '可能性が高い' },
      ],
      examples: [
        { japanese: '顔色が悪い。何か体調が悪いのではないだろうか。（婉曲な推量）', reading: 'かおいろがわるい。なにかたいちょうがわるいのではないだろうか。', translation: 'Nước da xấu. Có phải sức khỏe có vấn đề gì không nhỉ?（suy đoán nhẹ nhàng）' },
        { japanese: '3日間食事を食べていないなら、体力が落ちているにちがいない。', reading: 'みっかかんしょくじをたべていないなら、たいりょくがおちているにちがいない。', translation: 'Nếu 3 ngày không ăn, chắc chắn là sức lực đã giảm sút rồi.' },
        { japanese: 'これは誤薬事故ではないかと思い、すぐに報告しました。', reading: 'これはごやくじこではないかとおもい、すぐにほうこくしました。', translation: 'Tôi nghĩ có lẽ đây là sự cố nhầm thuốc nên đã báo cáo ngay.' },
      ],
      grammarNote: `【推量の強さの段階】

強い確信 → 弱い推量:
にちがいない（90%）:「絶対に〜だ」chắc chắn
はずだ（80%）:「根拠があって〜のはず」có căn cứ
のではないか（60%）:「〜かもしれない、提案」có lẽ
かもしれない（50%）:「〜の可能性がある」có thể

にちがいない の接続:
普通形＋にちがいない
「熱があるにちがいない」

のではないか の接続:
普通形＋のではないか
  「病気なのではないか」= có phải bị bệnh không
  「難しいのではないだろうか」= có lẽ khó`,
      quiz: {
        question: '「彼は経験が10年ある。このケースを知っている（　）」— 強い確信は？',
        options: [
          { id: 'a', text: 'かもしれない' },
          { id: 'b', text: 'のではないか' },
          { id: 'c', text: 'にちがいない' },
          { id: 'd', text: 'らしい' },
        ],
        correctId: 'c',
        explanation: '「10年の経験がある」という根拠から強い確信を表すのは「にちがいない」。「知っているにちがいない」= chắc chắn là biết（sự chắc chắn mạnh nhất）.',
      },
      xpReward: 30,
    },
  },

  'n3-01-21': {
    courseTitle: { ja: 'N3 文法・語彙総まとめ', vi: 'Tổng hợp ngữ pháp & từ vựng N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3頻出複合動詞①（〜し直す・〜続ける・〜始める・〜終わる）',
      titleTranslation: 'Động từ phức hợp N3 thường gặp ①（〜し直す・〜続ける・〜始める・〜終わる）',
      introduction: `複合動詞は二つの動詞を組み合わせた動詞です。「書き直す・話し続ける・食べ始める・読み終わる」のように動詞の連用形に別の動詞をつなげます。介護の手順指示・記録に多用されます。

Động từ phức hợp là động từ kết hợp từ hai động từ. Như "viết lại", "tiếp tục nói", "bắt đầu ăn", "đọc xong" — nối dạng renjōkei（連用形）của động từ với một động từ khác. Thường dùng trong hướng dẫn quy trình và hồ sơ điều dưỡng.`,
      keyPoints: [
        '〜直す: やり直す・書き直す（làm lại, viết lại — làm lần 2）',
        '〜続ける: 話し続ける・飲み続ける（tiếp tục làm — duy trì）',
        '〜始める: 食べ始める・歩き始める（bắt đầu làm — khởi đầu）',
        '〜終わる: 読み終わる・書き終わる（làm xong, kết thúc）',
        '接続: 動詞連用形（ます形の語幹）＋複合動詞',
        '他の複合動詞: 〜出す（急に始める）・〜込む（中へ）・〜上げる（完成）',
      ],
      vocabulary: [
        { word: '書き直す', reading: 'かきなおす', meaning: 'もう一度書く（viết lại）', example: '記録を書き直す' },
        { word: '飲み続ける', reading: 'のみつづける', meaning: '飲むことを続ける（tiếp tục uống）', example: '薬を飲み続ける' },
        { word: '食べ始める', reading: 'たべはじめる', meaning: '食べることを始める（bắt đầu ăn）', example: '利用者が食べ始めた' },
        { word: '書き終わる', reading: 'かきおわる', meaning: '書くことが終わる（viết xong）', example: '記録を書き終わった' },
        { word: '立ち上がる', reading: 'たちあがる', meaning: '立つ動作を始める（đứng dậy）', example: '急に立ち上がった' },
        { word: '動き出す', reading: 'うごきだす', meaning: '急に動き始める（bắt đầu di chuyển）', example: '利用者が動き出した' },
      ],
      examples: [
        { japanese: '記録の書き方を間違えたので、書き直しました。', reading: 'きろくのかきかたをまちがえたので、かきなおしました。', translation: 'Vì viết sai cách ghi hồ sơ nên đã viết lại.' },
        { japanese: '田中さんは指示された薬を毎日飲み続けています。', reading: 'たなかさんはしじされたくすりをまいにちのみつづけています。', translation: 'Ông Tanaka tiếp tục uống thuốc được chỉ định mỗi ngày.' },
        { japanese: '山田さんがベッドから急に立ち上がろうとしたので、すぐに声をかけました。', reading: 'やまださんがベッドからきゅうにたちあがろうとしたので、すぐにこえをかけました。', translation: 'Vì ông Yamada đột ngột toan đứng dậy khỏi giường nên đã lên tiếng ngay.' },
      ],
      grammarNote: `【主な複合動詞のパターン】

〜直す（làm lại）: 動詞連用形＋直す
  書く→書き直す / 確認する→確認し直す

〜続ける（tiếp tục）: 動詞連用形＋続ける
  飲む→飲み続ける / 歩く→歩き続ける

〜始める（bắt đầu）: 動詞連用形＋始める
  食べる→食べ始める / 降る→降り始める

〜終わる（xong）: 動詞連用形＋終わる
  読む→読み終わる / 洗う→洗い終わる

〜出す（đột ngột bắt đầu）: 動詞連用形＋出す
  泣く→泣き出す / 走る→走り出す`,
      quiz: {
        question: '「申し送りを（　）、ケアを始めてください」に入るのは？',
        options: [
          { id: 'a', text: '聞き終わってから' },
          { id: 'b', text: '聞き始めてから' },
          { id: 'c', text: '聞き続けてから' },
          { id: 'd', text: '聞き直してから' },
        ],
        correctId: 'a',
        explanation: '申し送りを全て聞き終えてからケアを始める順序。「聞き終わってから」= sau khi nghe xong bàn giao.',
      },
      xpReward: 30,
    },
  },

  'n3-01-22': {
    courseTitle: { ja: 'N3 文法・語彙総まとめ', vi: 'Tổng hợp ngữ pháp & từ vựng N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3頻出動詞②（変化・状態: 回復する・低下する・増加する・減少する）',
      titleTranslation: 'Động từ N3 thường gặp ②（Thay đổi & Trạng thái: hồi phục, giảm sút, tăng, giảm）',
      introduction: `医療・介護の記録や報告では変化を表す動詞が頻繁に使われます。「回復する・低下する・増加する・減少する・悪化する・改善する」などの対義語をセットで覚えましょう。

Trong hồ sơ và báo cáo y tế/điều dưỡng, các động từ biểu thị sự thay đổi được sử dụng thường xuyên. Hãy ghi nhớ theo cặp từ trái nghĩa như "hồi phục - giảm sút, tăng - giảm, trở nên tệ hơn - cải thiện".`,
      keyPoints: [
        '回復する ↔ 悪化する（hồi phục ↔ trở nên tệ hơn）',
        '増加する ↔ 減少する（tăng ↔ giảm）',
        '向上する ↔ 低下する（nâng cao ↔ giảm xuống）',
        '安定する ↔ 不安定になる（ổn định ↔ trở nên bất ổn）',
        '改善する ↔ 悪化する（cải thiện ↔ trở nên tệ）',
        '記録例：「食欲が回復した」「血圧が低下した」「体重が減少した」',
      ],
      vocabulary: [
        { word: '回復する', reading: 'かいふくする', meaning: '良くなること（hồi phục）', example: '体調が回復した' },
        { word: '低下する', reading: 'ていかする', meaning: '下がること（giảm xuống）', example: '体力が低下した' },
        { word: '増加する', reading: 'ぞうかする', meaning: '増えること（tăng lên）', example: '入院患者が増加した' },
        { word: '減少する', reading: 'げんしょうする', meaning: '減ること（giảm）', example: '食事量が減少した' },
        { word: '悪化する', reading: 'あっかする', meaning: '悪くなること（trở nên tệ hơn）', example: '症状が悪化した' },
        { word: '安定する', reading: 'あんていする', meaning: '落ち着くこと（ổn định）', example: '状態が安定した' },
      ],
      examples: [
        { japanese: '先週から食欲が回復し、毎食8割以上食べられています。', reading: 'せんしゅうからしょくよくがかいふくし、まいしょくはちわりいじょうたべられています。', translation: 'Từ tuần trước cảm giác thèm ăn đã hồi phục, mỗi bữa ăn được hơn 80%.' },
        { japanese: '山田さんの体重が先月から2kg減少しています。栄養指導が必要です。', reading: 'やまださんのたいじゅうがせんげつから2kgげんしょうしています。えいようしどうがひつようです。', translation: 'Cân nặng của ông Yamada đã giảm 2kg từ tháng trước. Cần tư vấn dinh dưỡng.' },
        { japanese: '介護施設の利用者数は毎年増加しています。', reading: 'かいごしせつのりようしゃすうはまいとしぞうかしています。', translation: 'Số người sử dụng cơ sở điều dưỡng tăng lên mỗi năm.' },
      ],
      grammarNote: `【変化動詞の対義語セット】

良くなる方向:
  回復する（hồi phục）/ 改善する（cải thiện）
  向上する（nâng cao）/ 安定する（ổn định）

悪くなる方向:
  悪化する（trở nên tệ）/ 低下する（giảm sút）
  減少する（giảm）/ 不安定になる（bất ổn）

増減:
  増加する・増える（tăng）
  減少する・減る（giảm）

【記録での使い方】
「〜が〜した」形で使う:
  「体温が低下した」「食欲が回復した」
  「体重が3kg増加した」`,
      quiz: {
        question: '「田中さんの血圧が130から100に（　）しました」— 下がった意味は？',
        options: [
          { id: 'a', text: '回復' },
          { id: 'b', text: '増加' },
          { id: 'c', text: '低下' },
          { id: 'd', text: '向上' },
        ],
        correctId: 'c',
        explanation: '130から100に下がったので「低下」が正解。「低下する」= giảm xuống（huyết áp từ 130 xuống 100）.',
      },
      xpReward: 30,
    },
  },

  'n3-01-23': {
    courseTitle: { ja: 'N3 文法・語彙総まとめ', vi: 'Tổng hợp ngữ pháp & từ vựng N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3形容詞・副詞（適切な・十分な・丁寧な・すでに・なるべく・ほとんど）',
      titleTranslation: 'Tính từ & Phó từ N3（thích hợp, đầy đủ, lịch sự, đã, càng nhiều càng tốt, hầu hết）',
      introduction: `N3レベルの形容詞・副詞は報告書・申し送り・職場でのコミュニケーションに欠かせません。「適切な対応」「十分な休養」「すでに確認済み」「ほとんど食べた」など医療・介護の文脈でよく使われる表現を覚えましょう。

Tính từ và phó từ cấp N3 không thể thiếu trong báo cáo, bàn giao, giao tiếp nơi làm việc. Hãy ghi nhớ các cách diễn đạt thường dùng trong y tế/điều dưỡng như "ứng phó thích hợp", "nghỉ ngơi đầy đủ", "đã xác nhận rồi", "ăn hầu hết".`,
      keyPoints: [
        '適切な（な形容詞）: 状況に合った（thích hợp, phù hợp）— 適切な対応・適切な判断',
        '十分な（な形容詞）: 必要なだけある（đầy đủ）— 十分な休養・十分な説明',
        '丁寧な（な形容詞）: 礼儀正しい（lịch sự, cẩn thận）— 丁寧な対応',
        'すでに（副詞）: もう（đã, đã rồi）— すでに確認した・すでに完了',
        'なるべく（副詞）: できる限り（càng nhiều càng tốt, cố gắng）— なるべく早く',
        'ほとんど（副詞）: 大部分・ほぼ全部（hầu hết, gần như tất cả）',
      ],
      vocabulary: [
        { word: '適切な', reading: 'てきせつな', meaning: '状況に合った（thích hợp）', example: '適切な介護を提供する' },
        { word: '十分な', reading: 'じゅうぶんな', meaning: '必要なだけある（đầy đủ）', example: '十分な水分を摂る' },
        { word: '丁寧な', reading: 'ていねいな', meaning: '礼儀正しい（lịch sự, cẩn thận）', example: '丁寧な言葉遣いをする' },
        { word: 'すでに', reading: 'すでに', meaning: 'もう・もはや（đã, đã rồi）', example: 'すでに報告済みです' },
        { word: 'なるべく', reading: 'なるべく', meaning: 'できるだけ（càng nhiều càng tốt）', example: 'なるべく早く対応する' },
        { word: 'ほとんど', reading: 'ほとんど', meaning: '大部分（hầu hết）', example: 'ほとんど食べました' },
      ],
      examples: [
        { japanese: '田中さんへの適切な対応のために、チームで相談しました。', reading: 'たなかさんへのてきせつなたいおうのために、チームでそうだんしました。', translation: 'Để có ứng phó thích hợp với ông Tanaka, nhóm đã thảo luận.' },
        { japanese: '山田さんは昼食をほとんど食べました。残したのは野菜だけです。', reading: 'やまださんはちゅうしょくをほとんどたべました。のこしたのはやさいだけです。', translation: 'Ông Yamada đã ăn hầu hết bữa trưa. Chỉ để lại rau thôi.' },
        { japanese: '申し送りはすでに完了しています。なるべく早くケアを始めてください。', reading: 'もうしおくりはすでにかんりょうしています。なるべくはやくケアをはじめてください。', translation: 'Việc bàn giao đã hoàn thành rồi. Hãy bắt đầu chăm sóc càng sớm càng tốt.' },
      ],
      grammarNote: `【形容詞・副詞の使い方ポイント】

適切な vs 正しい:
  適切な = phù hợp với hoàn cảnh（linh hoạt）
  正しい = đúng（tuyệt đối）

十分な vs 多い:
  十分な = đủ（đạt yêu cầu）
  多い = nhiều（số lượng）

すでに vs もう:
  すでに = đã（văn viết, trang trọng）
  もう = đã（hội thoại thông thường）

なるべく vs できるだけ:
  なるべく = càng nhiều càng tốt（nhẹ nhàng hơn）
  できるだけ = càng nhiều càng tốt（nhấn mạnh hơn）

ほとんど + 肯定 = hầu hết
ほとんど + 否定 = hầu như không`,
      quiz: {
        question: '「利用者さんの水分補給は（　）十分ではありません。もっと促してください」の（　）に入るのは？',
        options: [
          { id: 'a', text: 'すでに' },
          { id: 'b', text: 'ほとんど' },
          { id: 'c', text: 'なるべく' },
          { id: 'd', text: 'まだ' },
        ],
        correctId: 'd',
        explanation: '「まだ十分ではない」= chưa đầy đủ（vẫn chưa）. 「すでに」は完了、「ほとんど」は大部分、「なるべく」は副詞として不適切。',
      },
      xpReward: 30,
    },
  },

  'n3-01-24': {
    courseTitle: { ja: 'N3 文法・語彙総まとめ', vi: 'Tổng hợp ngữ pháp & từ vựng N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3漢語名詞（介護・医療分野: 状態・対応・確認・連絡・報告・記録）',
      titleTranslation: 'Danh từ Hán-Nhật N3（Điều dưỡng/Y tế: tình trạng, ứng phó, xác nhận, liên lạc, báo cáo, ghi chép）',
      introduction: `介護・医療現場では漢語名詞（漢字二字・三字語）が多用されます。「状態・対応・確認・連絡・報告・記録」は毎日使う基本語彙です。動詞と組み合わせた「〜する」形も覚えましょう。

Tại nơi làm việc điều dưỡng/y tế, danh từ Hán-Nhật（từ 2-3 chữ Hán）được sử dụng nhiều. 「状態・対応・確認・連絡・報告・記録」là từ vựng cơ bản dùng hàng ngày. Hãy học cả dạng「〜する」kết hợp với động từ.`,
      keyPoints: [
        '状態（じょうたい）: tình trạng — 利用者さんの状態を観察する',
        '対応（たいおう）: ứng phó — 緊急時の対応マニュアル',
        '確認（かくにん）: xác nhận — 薬の確認をする',
        '連絡（れんらく）: liên lạc — 家族に連絡する',
        '報告（ほうこく）: báo cáo — 上司に報告する',
        '記録（きろく）: ghi chép — ケア記録を書く',
      ],
      vocabulary: [
        { word: '状態', reading: 'じょうたい', meaning: '様子・具合（tình trạng）', example: '今日の状態は安定しています' },
        { word: '対応', reading: 'たいおう', meaning: '対処すること（ứng phó）', example: '緊急時の対応をする' },
        { word: '確認', reading: 'かくにん', meaning: '確かめること（xác nhận）', example: '内服薬を確認する' },
        { word: '連絡', reading: 'れんらく', meaning: '情報を伝えること（liên lạc）', example: '家族に連絡を取る' },
        { word: '報告', reading: 'ほうこく', meaning: '結果を上に伝えること（báo cáo）', example: '異変をすぐ報告する' },
        { word: '記録', reading: 'きろく', meaning: '書いて残すこと（ghi chép）', example: 'バイタルを記録する' },
      ],
      examples: [
        { japanese: '山田さんの状態を確認し、異変があれば上司に報告してください。', reading: 'やまださんのじょうたいをかくにんし、いへんがあればじょうしにほうこくしてください。', translation: 'Hãy xác nhận tình trạng của ông Yamada, nếu có gì bất thường thì báo cáo cấp trên.' },
        { japanese: '転倒後は必ず家族に連絡し、詳しい記録を残してください。', reading: 'てんとうごはかならずかぞくにれんらくし、くわしいきろくをのこしてください。', translation: 'Sau khi ngã nhất định phải liên lạc gia đình và để lại hồ sơ chi tiết.' },
        { japanese: '緊急時の対応手順を全スタッフが確認しておく必要があります。', reading: 'きんきゅうじのたいおうてじゅんをぜんスタッフがかくにんしておくひつようがあります。', translation: 'Tất cả nhân viên cần xác nhận trước quy trình ứng phó khẩn cấp.' },
      ],
      grammarNote: `【介護・医療の基本漢語名詞】

報告・連絡・相談（ほうれんそう）:
  ビジネス日本語の基本3語
  「報告する」「連絡を取る」「相談する」

観察・確認・記録の流れ:
  観察（かんさつ）= quan sát
  確認（かくにん）= xác nhận
  記録（きろく）= ghi chép

状態の表現:
  良好（りょうこう）= tốt
  安定（あんてい）= ổn định
  不安定（ふあんてい）= không ổn định
  悪化（あっか）= xấu đi

【動詞化】
多くの漢語名詞は＋する で動詞になる:
  報告→報告する / 連絡→連絡する`,
      quiz: {
        question: '「田中さんが転倒した。まず何をするべきか？」— 正しい順序は？',
        options: [
          { id: 'a', text: '記録→報告→対応' },
          { id: 'b', text: '対応→報告→記録' },
          { id: 'c', text: '報告→記録→対応' },
          { id: 'd', text: '連絡→確認→対応' },
        ],
        correctId: 'b',
        explanation: '緊急時は①対応（安全確認・応急処置）②報告（上司・看護師へ）③記録（詳しく書く）の順が基本。「対応→報告→記録」= xử lý→báo cáo→ghi chép.',
      },
      xpReward: 30,
    },
  },

  'n3-01-25': {
    courseTitle: { ja: 'N3 文法・語彙総まとめ', vi: 'Tổng hợp ngữ pháp & từ vựng N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: '接続詞・つなぎ言葉N3（したがって・一方・ただし・なお・また・つまり・要するに）',
      titleTranslation: 'Liên từ & từ nối N3（do đó, mặt khác, tuy nhiên, ngoài ra, còn nữa, tức là, nói tóm lại）',
      introduction: `接続詞は文と文をつなぐ言葉です。N3レベルでは書き言葉的な接続詞が増えます。介護記録・報告書・申し送りを正確に書くためにこれらの接続詞を使いこなしましょう。

Liên từ là từ nối câu với câu. Ở cấp N3, các liên từ thuộc văn viết tăng lên. Hãy thành thạo các liên từ này để viết hồ sơ điều dưỡng, báo cáo, bàn giao một cách chính xác.`,
      keyPoints: [
        'したがって: 前の内容から結論（do đó, vì vậy — văn viết）',
        '一方: 対比・反対の事実（mặt khác, trong khi đó）',
        'ただし: 例外・条件の追加（tuy nhiên, nhưng mà — thêm điều kiện）',
        'なお: 補足情報の追加（ngoài ra, ngoài ra cần biết thêm）',
        'また: 追加・並列（hơn nữa, và, còn）',
        'つまり・要するに: まとめ・言い換え（tức là, nói tóm lại）',
      ],
      vocabulary: [
        { word: 'したがって', reading: 'したがって', meaning: 'そのため（do đó, vì vậy）', example: '状態が悪化した。したがって入院が必要だ' },
        { word: '一方', reading: 'いっぽう', meaning: '他方・反対に（mặt khác）', example: '食欲は戻った。一方、体重は減少している' },
        { word: 'ただし', reading: 'ただし', meaning: '例外・条件（tuy nhiên, nhưng）', example: '外出可能。ただし付き添いが必要' },
        { word: 'なお', reading: 'なお', meaning: '補足（ngoài ra, thêm vào đó）', example: 'なお、詳細は記録を参照のこと' },
        { word: 'つまり', reading: 'つまり', meaning: '言い換え（tức là）', example: 'つまり、すぐに対応が必要ということだ' },
        { word: '要するに', reading: 'ようするに', meaning: 'まとめると（nói tóm lại）', example: '要するに、安全が第一だ' },
      ],
      examples: [
        { japanese: '血圧が急上昇した。したがって、すぐに看護師に報告した。', reading: 'けつあつがきゅうじょうしょうした。したがって、すぐにかんごしにほうこくした。', translation: 'Huyết áp tăng đột ngột. Do đó, đã báo cáo ngay cho y tá.' },
        { japanese: '外出は許可した。ただし、必ず職員が付き添うこと。', reading: 'がいしゅつはきょかした。ただし、かならずしょくいんがつきそうこと。', translation: 'Được phép ra ngoài. Tuy nhiên, nhân viên phải nhất định đi kèm.' },
        { japanese: '食事量が減り、体重も落ちている。つまり、栄養不足の状態だ。', reading: 'しょくじりょうがへり、たいじゅうもおちている。つまり、えいようぶそくのじょうたいだ。', translation: 'Lượng ăn giảm, cân nặng cũng giảm. Tức là đang trong tình trạng thiếu dinh dưỡng.' },
      ],
      grammarNote: `【接続詞の種類と役割】

結果・結論（kết quả/kết luận）:
  したがって・そのため・だから・よって

対比（đối chiếu）:
  一方・それに対して・しかし・ところが

追加（bổ sung）:
  また・さらに・なお・加えて

例外・条件（ngoại lệ/điều kiện）:
  ただし・もっとも

言い換え・まとめ（tóm lại）:
  つまり・要するに・すなわち

【文体】
したがって・よって→書き言葉
だから・でも→話し言葉`,
      quiz: {
        question: '「外出の許可を出しました。（　）、ひとりでは行かないこと」に入るのは？',
        options: [
          { id: 'a', text: 'したがって' },
          { id: 'b', text: 'つまり' },
          { id: 'c', text: 'ただし' },
          { id: 'd', text: '一方' },
        ],
        correctId: 'c',
        explanation: '許可を出した上での条件・例外を示すのは「ただし」。「ただし」= tuy nhiên, nhưng mà（thêm điều kiện ngoại lệ）.',
      },
      xpReward: 30,
    },
  },

  'n3-01-26': {
    courseTitle: { ja: 'N3 文法・語彙総まとめ', vi: 'Tổng hợp ngữ pháp & từ vựng N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3カタカナ語・外来語（医療・介護・ビジネス場面）',
      titleTranslation: 'Từ katakana/ngoại lai N3（Y tế, Điều dưỡng, Công sở）',
      introduction: `現代の介護・医療現場ではカタカナ語が多く使われます。英語由来の外来語は意味が分かれば理解しやすいですが、日本語特有の使い方や意味の変化に注意が必要です。

Tại nơi làm việc điều dưỡng/y tế hiện đại, từ katakana được sử dụng nhiều. Từ ngoại lai gốc tiếng Anh dễ hiểu nếu biết nghĩa, nhưng cần chú ý cách dùng đặc thù trong tiếng Nhật và sự thay đổi nghĩa.`,
      keyPoints: [
        'ケア（care）: 介護・世話（chăm sóc）',
        'スタッフ（staff）: 職員（nhân viên）',
        'マニュアル（manual）: 手順書（sách hướng dẫn）',
        'バイタル（vital signs）: 体温・血圧・脈拍（dấu hiệu sinh tồn）',
        'リスク（risk）: 危険性（rủi ro）',
        'サポート（support）: 支援・援助（hỗ trợ）',
      ],
      vocabulary: [
        { word: 'バイタル', reading: 'バイタル', meaning: '体温・血圧・脈拍（dấu hiệu sinh tồn）', example: 'バイタルを測定する' },
        { word: 'ケアプラン', reading: 'ケアプラン', meaning: '介護計画書（kế hoạch chăm sóc）', example: 'ケアプランを作成する' },
        { word: 'リハビリ', reading: 'リハビリ', meaning: '機能回復訓練（phục hồi chức năng）', example: 'リハビリを行う' },
        { word: 'スタッフ', reading: 'スタッフ', meaning: '職員・従業員（nhân viên）', example: '夜間スタッフが対応する' },
        { word: 'マニュアル', reading: 'マニュアル', meaning: '手順書（sách hướng dẫn）', example: 'マニュアルに従う' },
        { word: 'モニタリング', reading: 'モニタリング', meaning: '継続的な観察・監視（theo dõi liên tục）', example: '状態をモニタリングする' },
      ],
      examples: [
        { japanese: '毎朝バイタルを測定して、記録に残してください。', reading: 'まいあさバイタルをそくていして、きろくにのこしてください。', translation: 'Hãy đo dấu hiệu sinh tồn mỗi sáng và ghi lại hồ sơ.' },
        { japanese: 'リハビリの効果をモニタリングしながら、ケアプランを見直します。', reading: 'リハビリのこうかをモニタリングしながら、ケアプランをみなおします。', translation: 'Vừa theo dõi hiệu quả phục hồi chức năng vừa xem lại kế hoạch chăm sóc.' },
        { japanese: '緊急時のマニュアルをスタッフ全員で確認しておきましょう。', reading: 'きんきゅうじのマニュアルをスタッフぜんいんでかくにんしておきましょう。', translation: 'Hãy cùng tất cả nhân viên xác nhận trước sách hướng dẫn khẩn cấp.' },
      ],
      grammarNote: `【医療・介護カタカナ語リスト】

バイタル = vital signs（体温・血圧・脈拍・呼吸）
ケア = care（chăm sóc, điều dưỡng）
リハビリ = rehabilitation（phục hồi chức năng）
ターミナルケア = terminal care（chăm sóc cuối đời）
インフォームドコンセント = informed consent（đồng thuận có thông tin）
モニタリング = monitoring（theo dõi）
マニュアル = manual（sách hướng dẫn）
スタッフ = staff（nhân viên）
ケアプラン = care plan（kế hoạch chăm sóc）
ヒヤリハット = near miss（sự cố suýt xảy ra）
アセスメント = assessment（đánh giá）
リスク = risk（rủi ro）`,
      quiz: {
        question: '「体温・血圧・脈拍・呼吸をまとめて（　）と言います」に入るのは？',
        options: [
          { id: 'a', text: 'ケアプラン' },
          { id: 'b', text: 'バイタル' },
          { id: 'c', text: 'モニタリング' },
          { id: 'd', text: 'リハビリ' },
        ],
        correctId: 'b',
        explanation: '体温・血圧・脈拍・呼吸をまとめて「バイタル（サイン）」と言います。「バイタル」= vital signs（dấu hiệu sinh tồn）.',
      },
      xpReward: 30,
    },
  },

  'n3-01-27': {
    courseTitle: { ja: 'N3 文法・語彙総まとめ', vi: 'Tổng hợp ngữ pháp & từ vựng N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3重要語彙200選①（名詞・動詞 100語から精選）',
      titleTranslation: 'Từ vựng N3 quan trọng 200 từ ①（Tuyển chọn từ 100 danh từ & động từ）',
      introduction: `N3試験によく出る名詞・動詞を精選しました。介護・医療・日常生活の文脈で使える重要語彙です。読み方と意味だけでなく、例文の中で実際の使い方を確認しましょう。

Đã tuyển chọn danh từ và động từ thường xuất hiện trong kỳ thi N3. Đây là từ vựng quan trọng có thể dùng trong ngữ cảnh điều dưỡng, y tế và đời sống hàng ngày. Hãy xác nhận cách dùng thực tế qua ví dụ, không chỉ đọc và nghĩa.`,
      keyPoints: [
        '名詞グループ①: 状況・環境（tình huống, môi trường）: 環境・状況・場合・状態・様子',
        '名詞グループ②: 行動・結果（hành động, kết quả）: 原因・結果・影響・変化・効果',
        '動詞グループ①: 変化（thay đổi）: 変わる・改善する・悪化する・増える・減る',
        '動詞グループ②: コミュニケーション（giao tiếp）: 伝える・相談する・説明する・確認する',
        '動詞グループ③: 介護動作（hành động điều dưỡng）: 支える・見守る・助ける・促す',
        '注意語: 様子（ようす）= tình trạng/vẻ ngoài / 状態（じょうたい）= tình trạng（客観的）',
      ],
      vocabulary: [
        { word: '状況', reading: 'じょうきょう', meaning: 'その時の様子（tình huống）', example: '状況を正確に把握する' },
        { word: '影響', reading: 'えいきょう', meaning: '他への作用（ảnh hưởng）', example: '睡眠が健康に影響する' },
        { word: '促す', reading: 'うながす', meaning: '〜するよう勧める（thúc đẩy, nhắc nhở）', example: '水分摂取を促す' },
        { word: '見守る', reading: 'みまもる', meaning: '注意して見る（quan sát, trông chừng）', example: '歩行を見守る' },
        { word: '伝える', reading: 'つたえる', meaning: '情報を渡す（truyền đạt）', example: '申し送りで状態を伝える' },
        { word: '把握する', reading: 'はあくする', meaning: '正確に理解する（nắm bắt, nắm rõ）', example: '利用者の状態を把握する' },
      ],
      examples: [
        { japanese: '山田さんの今日の状況をスタッフ全員に伝えてください。', reading: 'やまださんのきょうのじょうきょうをスタッフぜんいんにつたえてください。', translation: 'Hãy truyền đạt tình huống hôm nay của ông Yamada cho tất cả nhân viên.' },
        { japanese: '転倒リスクが高いので、歩行時は常に見守ることが必要です。', reading: 'てんとうリスクがたかいので、ほこうじはつねにみまもることがひつようです。', translation: 'Vì nguy cơ té ngã cao nên khi đi bộ cần luôn trông chừng.' },
        { japanese: '食事の後、利用者さんの口腔ケアを促すようにしています。', reading: 'しょくじのあと、りようしゃさんのこうくうケアをうながすようにしています。', translation: 'Sau bữa ăn, tôi thường nhắc nhở người được chăm sóc chăm sóc răng miệng.' },
      ],
      grammarNote: `【N3重要名詞・動詞リスト（精選）】

【名詞】
環境（かんきょう）= môi trường
状況（じょうきょう）= tình huống
原因（げんいん）= nguyên nhân
結果（けっか）= kết quả
影響（えいきょう）= ảnh hưởng
効果（こうか）= hiệu quả
課題（かだい）= vấn đề, thách thức
目標（もくひょう）= mục tiêu

【動詞】
促す（うながす）= thúc đẩy, nhắc
見守る（みまもる）= trông chừng
把握する（はあくする）= nắm bắt
伝える（つたえる）= truyền đạt
判断する（はんだんする）= phán đoán`,
      quiz: {
        question: '「利用者さんが水を（　）ことが大切です。脱水を防ぐために」に入るのは？',
        options: [
          { id: 'a', text: '飲むように促す' },
          { id: 'b', text: '飲むように見守る' },
          { id: 'c', text: '飲むように把握する' },
          { id: 'd', text: '飲むように伝える' },
        ],
        correctId: 'a',
        explanation: '水分摂取を勧める・勧めることを「促す」。「飲むように促す」= nhắc nhở/thúc đẩy uống nước（để phòng mất nước）.',
      },
      xpReward: 30,
    },
  },

  'n3-01-28': {
    courseTitle: { ja: 'N3 文法・語彙総まとめ', vi: 'Tổng hợp ngữ pháp & từ vựng N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3重要語彙200選②（形容詞・副詞・敬語表現）',
      titleTranslation: 'Từ vựng N3 quan trọng 200 từ ②（Tính từ, Phó từ, Kính ngữ）',
      introduction: `N3で重要な形容詞・副詞と、介護現場で欠かせない敬語表現を学びます。「いらっしゃる・おっしゃる・ご〜になる」などの尊敬語と「〜ていただく・お〜する」などの謙譲語を整理しましょう。

Học tính từ và phó từ quan trọng ở N3, cùng kính ngữ không thể thiếu tại nơi làm việc điều dưỡng. Hãy sắp xếp kính ngữ tôn kính như「いらっしゃる・おっしゃる・ご〜になる」và kính ngữ khiêm tốn như「〜ていただく・お〜する」.`,
      keyPoints: [
        'N3形容詞: 穏やか・慎重・深刻・緊急・適切・不十分（ôn hòa, thận trọng, nghiêm trọng）',
        'N3副詞: 急に・徐々に・突然・特に・主に・基本的に（đột ngột, dần dần, đặc biệt）',
        '尊敬語（kính ngữ tôn kính）: いらっしゃる・おっしゃる・なさる・ご覧になる',
        '謙譲語（kính ngữ khiêm tốn）: 参ります・申します・いたします・拝見する',
        '丁寧語: ございます・〜でございます（礼儀正しい表現）',
        '介護例：「いらっしゃいますか」「おっしゃる通りです」「参ります」',
      ],
      vocabulary: [
        { word: '穏やかな', reading: 'おだやかな', meaning: 'おとなしく落ち着いた（ôn hòa, bình lặng）', example: '今日は穏やかな様子です' },
        { word: '慎重に', reading: 'しんちょうに', meaning: '注意深く（thận trọng）', example: '慎重に移動を手伝う' },
        { word: '急に', reading: 'きゅうに', meaning: '突然（đột ngột）', example: '急に意識がなくなった' },
        { word: '徐々に', reading: 'じょじょに', meaning: 'だんだん（dần dần）', example: '徐々に回復している' },
        { word: 'いらっしゃる', reading: 'いらっしゃる', meaning: 'いる・来る・行く の尊敬語（kính ngữ của いる/来る/行く）', example: '田中様はいらっしゃいますか' },
        { word: 'おっしゃる', reading: 'おっしゃる', meaning: '言う の尊敬語（kính ngữ của 言う）', example: 'おっしゃる通りです' },
      ],
      examples: [
        { japanese: '山田さんは今朝から急に様子が変わりました。徐々に落ち着いてきています。', reading: 'やまださんはけさからきゅうにようすがかわりました。じょじょにおちついてきています。', translation: 'Từ sáng nay tình trạng của ông Yamada đột ngột thay đổi. Đang dần dần bình tĩnh lại.' },
        { japanese: '田中様、ご家族の方がいらっしゃっています。', reading: 'たなかさま、ごかぞくのかたがいらっしゃっています。', translation: 'Thưa ông Tanaka, gia đình của ông đã đến ạ.' },
        { japanese: 'ご不明な点がございましたら、何でもおっしゃってください。', reading: 'ごふめいなてんがございましたら、なんでもおっしゃってください。', translation: 'Nếu có điều gì không rõ, xin mời nói ra bất cứ điều gì ạ.' },
      ],
      grammarNote: `【敬語の三種類】

尊敬語（相手を高める — tôn kính）:
  いる→いらっしゃる / おられる
  言う→おっしゃる
  する→なさる
  食べる→召し上がる（めしあがる）

謙譲語（自分を低める — khiêm tốn）:
  いる→おります
  言う→申します（もうします）
  する→いたします
  行く/来る→参ります（まいります）

丁寧語（文を丁寧にする）:
  です/ます/ございます

【介護での使い方】
利用者さんへ: 尊敬語を使う
自分の行動: 謙譲語を使う`,
      quiz: {
        question: '「田中様に薬を（　）。（私が渡すという意味）」に入る謙譲語は？',
        options: [
          { id: 'a', text: '召し上がりました' },
          { id: 'b', text: 'お渡しいたしました' },
          { id: 'c', text: 'お渡しになりました' },
          { id: 'd', text: 'おっしゃいました' },
        ],
        correctId: 'b',
        explanation: '自分の行動（渡す）を丁寧に表すのは謙譲語「お〜いたす」。「お渡しいたしました」= đã trao cho（kính ngữ khiêm tốn — hành động của bản thân）.',
      },
      xpReward: 30,
    },
  },

  'n3-01-29': {
    courseTitle: { ja: 'N3 文法・語彙総まとめ', vi: 'Tổng hợp ngữ pháp & từ vựng N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3文法まとめ練習問題（穴埋め・選択問題）',
      titleTranslation: 'Bài tập tổng hợp ngữ pháp N3（Điền vào chỗ trống & Chọn đáp án）',
      introduction: `このレッスンではN3文法のまとめ練習をします。これまでに学んだ「ながら・ばかり・ようだ・てしまう・ことになる・はずだ・わけだ・受身・使役」などを総復習します。実際の試験形式で練習しましょう。

Bài học này thực hành tổng hợp ngữ pháp N3. Ôn tập toàn bộ những gì đã học như「ながら・ばかり・ようだ・てしまう・ことになる・はずだ・わけだ・thể bị động・thể sai khiến」. Hãy luyện tập theo hình thức thi thực tế.`,
      keyPoints: [
        '穴埋め①: 「音楽を聴き（　）、記録を書いた」→ ながら（đồng thời）',
        '穴埋め②: 「薬を（　）しまった。申し訳ない」→ なくして（completer verb）',
        '穴埋め③: 「来月から夜勤をする（　）になった」→ こと（外部決定）',
        '穴埋め④: 「経験者（　）、初歩的なミスをした」→ なのに/なのにもかかわらず',
        '穴埋め⑤: 「どんなに忙しく（　）、安全確認は必要」→ ても（譲歩）',
        '選択問題: 「利用者さんが転倒（　）に対して、適切に対応した」— した・して・する・すること',
      ],
      vocabulary: [
        { word: '復習', reading: 'ふくしゅう', meaning: '学んだことを繰り返す（ôn tập）', example: '毎日復習する' },
        { word: '穴埋め', reading: 'あなうめ', meaning: '空欄に言葉を入れる（điền vào chỗ trống）', example: '穴埋め問題を解く' },
        { word: '選択問題', reading: 'せんたくもんだい', meaning: '正しい答えを選ぶ問題（câu hỏi chọn đáp án）', example: '4択の選択問題' },
        { word: '正答率', reading: 'せいとうりつ', meaning: '正解の割合（tỷ lệ đúng）', example: '正答率80%を目指す' },
        { word: '総復習', reading: 'そうふくしゅう', meaning: '全体の復習（ôn tập toàn bộ）', example: '試験前に総復習する' },
      ],
      examples: [
        { japanese: '田中さんに声をかけ（　）、体温を測った。（ながら）', reading: 'たなかさんにこえをかけながら、たいおんをはかった。', translation: 'Vừa lên tiếng với ông Tanaka vừa đo nhiệt độ.（ながら = đồng thời）' },
        { japanese: '書類をなくして（　）。困った。（しまった）', reading: 'しょるいをなくしてしまった。こまった。', translation: 'Đã đánh mất tài liệu rồi. Thật phiền.（てしまった = hối tiếc）' },
        { japanese: '転倒した（　）、すぐに対応した。（ので）', reading: 'てんとうしたので、すぐにたいおうした。', translation: 'Vì ngã nên đã ứng phó ngay.（ので = vì, nên）' },
      ],
      grammarNote: `【N3文法まとめ — 試験のポイント】

時間・順序:
  〜てから（sau khi）/ 〜た後で / 〜前に

限定:
  〜だけ（trung tính）/ 〜ばかり（phê phán）/ 〜しか〜ない（nhấn mạnh）

推量:
  〜ようだ（quan sát）/ 〜らしい（gián tiếp）/ 〜そうだ（様態/伝聞）

確信:
  〜はずだ（căn cứ）/ 〜にちがいない（mạnh）/ 〜わけだ（納得）

受身・使役:
  〜られる（受身）/ 〜させる（使役）/ 〜させられる（使役受身）

その他:
  〜ことになる（外部決定）/ 〜ことにする（自分の決定）`,
      quiz: {
        question: '「彼女はベテランスタッフだから、この手順を（　）はずだ」に入るのは？',
        options: [
          { id: 'a', text: '知っている' },
          { id: 'b', text: '知っていた' },
          { id: 'c', text: '知って' },
          { id: 'd', text: '知る' },
        ],
        correctId: 'a',
        explanation: '「知っているはずだ」= hẳn là biết rồi（hiện tại の確信）。「はずだ」の前は普通形（現在/過去）。「知っているはずだ」が自然な文。',
      },
      xpReward: 40,
    },
  },

  'n3-01-30': {
    courseTitle: { ja: 'N3 文法・語彙総まとめ', vi: 'Tổng hợp ngữ pháp & từ vựng N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3文法・語彙 総復習テスト（20問チャレンジ）',
      titleTranslation: 'Bài kiểm tra tổng ôn N3 Ngữ pháp & Từ vựng（Thử thách 20 câu）',
      introduction: `このレッスンではN3文法・語彙の総復習テストを行います。文法（ながら・受身・使役・推量・限定・比例・確信・引用）と語彙（複合動詞・漢語名詞・形容詞・副詞・敬語）から総合的に出題します。合格目標: 20問中16問以上正解！

Bài học này thực hiện bài kiểm tra tổng ôn ngữ pháp và từ vựng N3. Ra đề tổng hợp từ ngữ pháp（ながら, bị động, sai khiến, suy đoán, giới hạn, tỷ lệ, chắc chắn, trích dẫn）và từ vựng（động từ phức hợp, danh từ Hán-Nhật, tính từ, phó từ, kính ngữ）. Mục tiêu đậu: Đúng 16/20 câu trở lên！`,
      keyPoints: [
        '【文法】〜ながら（同時/逆接）: 「声かけながらケアする」「疲れながらも頑張る」',
        '【文法】受身・使役: 「利用者に起こされた（迷惑）」「薬を飲ませた（使役）」',
        '【文法】推量: ようだ・らしい・そうだ・はずだ・にちがいない の使い分け',
        '【文法】条件・限定: ても・ばかり・だけ・しか の使い分け',
        '【語彙】変化動詞: 回復・悪化・低下・増加・減少・改善 の対義語',
        '【語彙】接続詞: したがって・ただし・なお・一方・つまり の使い方',
      ],
      vocabulary: [
        { word: '総合テスト', reading: 'そうごうテスト', meaning: '全体を試す試験（bài kiểm tra tổng hợp）', example: '総合テストで実力を確認する' },
        { word: '合格', reading: 'ごうかく', meaning: '試験に受かること（đậu, vượt qua）', example: 'N3に合格する' },
        { word: '実力', reading: 'じつりょく', meaning: '本当の能力（năng lực thực sự）', example: '実力を試す' },
        { word: '課題', reading: 'かだい', meaning: '弱点・やるべきこと（điểm yếu, bài tập）', example: '自分の課題を見つける' },
        { word: 'チャレンジ', reading: 'チャレンジ', meaning: '挑戦（thử thách, thách thức）', example: 'N3にチャレンジする' },
      ],
      examples: [
        { japanese: '（総合問題①）「田中さんが転倒した。（　）、すぐに看護師に知らせた」— 正しい接続詞は「したがって」', reading: 'たなかさんがてんとうした。したがって、すぐにかんごしにしらせた。', translation: 'Ông Tanaka đã ngã.（Bài tổng hợp①）Do đó, đã báo cáo ngay cho y tá.' },
        { japanese: '（総合問題②）「山田さんに薬を（　）いただきました」— 正しい形は「飲んで」（て形）', reading: 'やまださんにくすりをのんでいただきました。', translation: '（Bài tổng hợp②）Đã được ông Yamada uống thuốc.（もらう→いただく 謙譲語）' },
        { japanese: '（総合問題③）「経験が10年ある彼女は、手順を知っている（　）。」— はずだ・にちがいない どちらが強い？→にちがいない', reading: 'けいけんがじゅうねんあるかのじょは、てじゅんをしっているにちがいない。', translation: '（Bài tổng hợp③）Cô ấy có 10 năm kinh nghiệm, chắc chắn biết quy trình.（にちがいない mạnh hơn はずだ）' },
      ],
      grammarNote: `【N3文法・語彙 総まとめチェックリスト】

□ ながら（同時/逆接）の違いが分かる
□ ばかり・だけ・しか〜ない の違いが分かる
□ ようだ・らしい・そうだ（様態/伝聞）が使える
□ てしまう（完了/後悔）が分かる
□ ことになる vs ことにする の違いが分かる
□ ために vs ように（目的）が使い分けられる
□ 受身（直接/間接/迷惑）が作れる
□ 使役・使役受身が作れる
□ はずだ・わけだ・にちがいない が使える
□ 変化動詞の対義語が言える
□ 接続詞（したがって/ただし/なお）が使える
□ 基本的な敬語（尊敬語/謙譲語）が使える

全部チェックできたらN3合格レベル！`,
      quiz: {
        question: '「利用者さんが（　）いるのを見て、すぐに声をかけました」— 正しいのは？',
        options: [
          { id: 'a', text: '転びそうにして' },
          { id: 'b', text: '転びそうにして' },
          { id: 'c', text: '転びそうになって' },
          { id: 'd', text: '転ぶようになって' },
        ],
        correctId: 'c',
        explanation: '「転びそうになる」= sắp ngã（様態のそうだ＋になる）。「転びそうになっているのを見て」が自然な表現。「〜そうになる」= suýt nữa thì / sắp～. Đây là biểu thị trạng thái suýt xảy ra.',
      },
      xpReward: 50,
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

  'n3-02-2': {
    courseTitle: { ja: 'N3 読解練習 〜新聞・説明文〜', vi: 'Luyện đọc N3 - Báo và văn bản thông tin' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: '新聞記事の読み方基礎（見出し・リード文・本文構造）',
      titleTranslation: 'Cơ bản đọc bài báo (tiêu đề, đoạn dẫn, cấu trúc bài)',
      introduction: `新聞記事には決まった構造があります。「見出し」は記事の内容を短くまとめたもの、「リード文」は最初の段落で記事全体の要約、「本文」では詳細が順番に説明されます。この構造を理解すると、長い記事でも素早く内容をつかめます。

Bài báo có cấu trúc cố định. "Tiêu đề" tóm tắt ngắn gọn nội dung, "đoạn dẫn" là đoạn đầu tóm tắt toàn bài, "thân bài" giải thích chi tiết theo thứ tự. Hiểu cấu trúc này giúp nắm nội dung bài dài nhanh chóng.`,
      keyPoints: [
        '見出し（headline）：記事の主題を短く表す、体言止めが多い',
        'リード文（lead）：5W1H（いつ・どこで・誰が・何を・なぜ・どのように）を含む',
        '本文は逆ピラミッド型：重要な情報が先、詳細・背景が後',
        '段落の最初の文（トピックセンテンス）に注目する',
        '引用符「」内は関係者の発言・コメントを示す',
        '記事末尾に記者名・情報源が記載されることが多い',
      ],
      vocabulary: [
        { word: '見出し', reading: 'みだし', meaning: '記事のタイトル（tiêu đề bài báo）', example: '見出しを読めば記事の内容が分かる' },
        { word: 'リード文', reading: 'リードぶん', meaning: '記事の冒頭要約（đoạn dẫn tóm tắt）', example: 'リード文には記事の核心が含まれる' },
        { word: '報じる', reading: 'ほうじる', meaning: '報道する（đưa tin）', example: '新聞は高齢化問題を大きく報じた' },
        { word: '取材', reading: 'しゅざい', meaning: '情報収集のための調査（phóng viên điều tra）', example: '記者が介護施設を取材した' },
        { word: '掲載', reading: 'けいさい', meaning: '新聞・雑誌に載せること（đăng báo）', example: '記事が一面に掲載された' },
      ],
      examples: [
        { japanese: '【見出し】外国人介護士、過去最多に　【リード文】厚生労働省は15日、昨年度に日本国内で働いた外国人介護士が3万人を超えたと発表した。', reading: 'がいこくじんかいごし、かこさいたに。こうせいろうどうしょうは15にち、さくねんどにほんこくないではたらいたがいこくじんかいごしが3まんにんをこえたとはっぴょうした。', translation: '[Tiêu đề] Điều dưỡng nước ngoài đạt mức cao kỷ lục. [Đoạn dẫn] Bộ Lao động Nhật Bản ngày 15 thông báo số điều dưỡng nước ngoài làm việc tại Nhật năm ngoái đã vượt 30.000 người.' },
        { japanese: 'この問題について、山田厚生労働大臣は「介護人材の確保は急務だ」と述べた。', reading: 'このもんだいについて、やまだこうせいろうどうだいじんは「かいごじんざいのかくほはきゅうむだ」とのべた。', translation: 'Về vấn đề này, Bộ trưởng Lao động Yamada phát biểu: "Đảm bảo nguồn nhân lực điều dưỡng là việc cấp bách."' },
      ],
      grammarNote: `【新聞記事の読み方のコツ】
1. まず見出しを読んで話題を確認する
2. リード文（第1段落）で5W1Hを整理する
3. 本文は重要度順なので、時間がなければ前半を優先
4. 「〜と述べた・〜と語った」は引用の表現
5. 「〜によると」は情報源を示す表現

【読解戦略 / Chiến lược đọc hiểu】
"〜によると" = theo (nguồn tin)
"〜と述べた" = phát biểu rằng
体言止め = danh từ cuối câu (thường dùng trong tiêu đề)`,
      quiz: {
        question: '新聞記事の「逆ピラミッド構造」とはどういう意味ですか？',
        options: [
          { id: 'a', text: '重要な情報が記事の最後にある' },
          { id: 'b', text: '重要な情報が記事の最初にあり、詳細が後に続く' },
          { id: 'c', text: '記事の中ほどに最も重要な情報がある' },
          { id: 'd', text: '記事全体が同じ重要度で書かれている' },
        ],
        correctId: 'b',
        explanation: '逆ピラミッド構造とは、最も重要な情報（結論・事実）を記事の冒頭に置き、詳細や背景説明が後に続く構造です。読者が途中で読むのをやめても、核心を理解できるよう工夫されています。\nCấu trúc kim tự tháp ngược có nghĩa là thông tin quan trọng nhất đặt ở đầu bài, chi tiết và bối cảnh theo sau.',
      },
      xpReward: 30,
    },
  },

  'n3-02-3': {
    courseTitle: { ja: 'N3 読解練習 〜新聞・説明文〜', vi: 'Luyện đọc N3 - Báo và văn bản thông tin' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: '指示語の理解（この・その・あの・これ・それ）',
      titleTranslation: 'Hiểu từ chỉ định (この・その・あの・これ・それ)',
      introduction: `読解問題でよく問われるのが「指示語」です。「この・その・あの・これ・それ・あれ・ここ・そこ」などが何を指しているかを正確に理解することが、文章全体の理解につながります。指示語の多くは直前に出てきた言葉や内容を指します。

Từ chỉ định thường xuyên xuất hiện trong bài đọc hiểu. Hiểu chính xác "この・その・あの・これ・それ・あれ・ここ・そこ" chỉ cái gì sẽ giúp hiểu toàn bộ văn bản. Phần lớn từ chỉ định trỏ về từ hoặc nội dung vừa đề cập trước đó.`,
      keyPoints: [
        'この＋名詞：話し手に近いもの・直前の内容を指す',
        'その＋名詞：聞き手に近いもの・前文の内容を受ける（読解で最頻出）',
        'あの＋名詞：話し手・聞き手両方から遠いもの・共有の話題',
        'これ・それ・あれ：名詞の代わりに使う（代名詞）',
        '「そのような・このような」は前の内容全体を受けることが多い',
        '指示語を見つけたら、前の文に戻って指示対象を確認する',
      ],
      vocabulary: [
        { word: '指示語', reading: 'しじご', meaning: '何かを指し示す言葉（từ chỉ định）', example: '「それ」という指示語が何を指すか考える' },
        { word: '前文', reading: 'ぜんぶん', meaning: '前の文（câu trước）', example: '指示語は前文の内容を受けることが多い' },
        { word: '対象', reading: 'たいしょう', meaning: '指し示しているもの（đối tượng được chỉ）', example: '指示語の対象を特定する' },
        { word: '把握', reading: 'はあく', meaning: '理解・つかむこと（nắm bắt）', example: '文脈を把握して指示語を解釈する' },
        { word: '文脈', reading: 'ぶんみゃく', meaning: '文章の流れ・前後関係（văn mạch, ngữ cảnh）', example: '文脈から指示語の意味を読み取る' },
      ],
      examples: [
        { japanese: '介護施設では、利用者の転倒事故が増えている。この問題を解決するため、センサーの導入が進んでいる。', reading: 'かいごしせつでは、りようしゃのてんとうじこがふえている。このもんだいをかいけつするため、センサーのどうにゅうがすすんでいる。', translation: 'Tại cơ sở điều dưỡng, tai nạn té ngã của người sử dụng đang tăng. Để giải quyết vấn đề này, việc lắp đặt cảm biến đang được đẩy mạnh.' },
        { japanese: '日本の高齢化率は29%を超えた。それは世界最高水準である。', reading: 'にほんのこうれいかりつは29%をこえた。それはせかいさいこうすいじゅんである。', translation: 'Tỷ lệ người cao tuổi ở Nhật đã vượt 29%. Đó là mức cao nhất thế giới.' },
      ],
      grammarNote: `【指示語の解き方ステップ】
1. 指示語（この・その・これ・それ など）を見つける
2. 直前の文・句・段落に戻る
3. 指示語を具体的な言葉に置き換えて読んでみる
4. 意味が通じれば正解

【よく出る指示語パターン / Mẫu thường gặp】
「このような状況」= tình huống như vậy（指前段落の内容）
「その結果」= kết quả đó（指前文の出来事）
「こうした問題」= vấn đề như thế（指直前の問題）`,
      quiz: {
        question: '「高齢者の孤独死が社会問題になっている。この問題に対応するため、地域のボランティア活動が注目されている。」この「この問題」は何を指しますか？',
        options: [
          { id: 'a', text: '地域のボランティア活動' },
          { id: 'b', text: '高齢者の孤独死が社会問題になっていること' },
          { id: 'c', text: '高齢者の増加' },
          { id: 'd', text: 'ボランティアの不足' },
        ],
        correctId: 'b',
        explanation: '「この問題」は直前の文の内容「高齢者の孤独死が社会問題になっていること」を指します。指示語の直前に指示対象があるのが基本パターンです。\n"Vấn đề này" trỏ về nội dung câu trước: "cái chết cô đơn của người cao tuổi trở thành vấn đề xã hội".',
      },
      xpReward: 30,
    },
  },

  'n3-02-4': {
    courseTitle: { ja: 'N3 読解練習 〜新聞・説明文〜', vi: 'Luyện đọc N3 - Báo và văn bản thông tin' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: '接続詞から文の流れを読む（逆接・順接・並列・添加）',
      titleTranslation: 'Đọc luồng văn bản qua liên từ (nghịch tiếp, thuận tiếp, song song, bổ sung)',
      introduction: `接続詞は文と文、段落と段落をつなぐ重要な言葉です。接続詞の種類を理解すると、次に来る内容が予測でき、文章の論理展開をつかむことができます。N3読解では接続詞を問う問題が頻繁に出題されます。

Liên từ là từ quan trọng nối câu với câu, đoạn với đoạn. Hiểu loại liên từ giúp dự đoán nội dung tiếp theo và nắm logic triển khai văn bản. Trong đọc hiểu N3, câu hỏi về liên từ xuất hiện thường xuyên.`,
      keyPoints: [
        '順接（thuận tiếp）：だから・そのため・したがって・その結果 → 前の内容の結果',
        '逆接（nghịch tiếp）：しかし・だが・ところが・けれども → 前の内容と反対のことが続く',
        '並列（song song）：また・そして・さらに → 同じレベルの情報を追加',
        '添加（bổ sung）：しかも・それに・加えて → 前の内容を強調して追加',
        '換言（diễn đạt lại）：つまり・すなわち・言い換えれば → 前の内容を別の言葉で言い直す',
        '転換（chuyển chủ đề）：さて・では・ところで → 話題を変える',
      ],
      vocabulary: [
        { word: 'ところが', reading: 'ところが', meaning: '予想外の逆接（nhưng không ngờ）', example: '準備を進めた。ところが、当日は中止になった' },
        { word: 'したがって', reading: 'したがって', meaning: '前の内容の結論（do đó, vì vậy）', example: '高齢化が進む。したがって、介護需要が増える' },
        { word: 'さらに', reading: 'さらに', meaning: 'その上・もっと（hơn nữa）', example: '人手不足が深刻だ。さらに、賃金も低い' },
        { word: 'つまり', reading: 'つまり', meaning: 'すなわち・言い換えると（tức là, nghĩa là）', example: 'つまり、早期対応が必要だということだ' },
        { word: 'ただし', reading: 'ただし', meaning: '条件・例外を加える（tuy nhiên, nhưng điều kiện）', example: '参加できる。ただし、事前登録が必要だ' },
      ],
      examples: [
        { japanese: '介護施設の数は増加している。しかし、働くスタッフの数が追いつかない状況だ。', reading: 'かいごしせつのかずはぞうかしている。しかし、はたらくスタッフのかずがおいつかないじょうきょうだ。', translation: 'Số lượng cơ sở điều dưỡng đang tăng. Tuy nhiên, số nhân viên làm việc không theo kịp.' },
        { japanese: '日本の平均寿命は延びている。したがって、老後の生活設計がますます重要になっている。', reading: 'にほんのへいきんじゅみょうはのびている。したがって、ろうごのせいかつせっけいがますますじゅうようになっている。', translation: 'Tuổi thọ trung bình của Nhật Bản đang tăng. Do đó, thiết kế cuộc sống sau khi về hưu ngày càng quan trọng.' },
      ],
      grammarNote: `【接続詞の種類と働き / Phân loại liên từ】
■ 順接：だから／そのため／したがって／その結果
■ 逆接：しかし／でも／ところが／一方
■ 並列・添加：また／そして／さらに／加えて／しかも
■ 説明・換言：つまり／すなわち／つまり／要するに
■ 転換：さて／では／ところで

【読解のコツ】
逆接の後に筆者の主張が来ることが多い。
「しかし・だが」の後を特に注意して読もう。
Sau liên từ nghịch tiếp thường là luận điểm chính của tác giả.`,
      quiz: {
        question: '「医療技術は発展している。（　　）、医療費の増大という問題も生じている。」（　　）に入る最も適切な接続詞は？',
        options: [
          { id: 'a', text: 'したがって' },
          { id: 'b', text: 'つまり' },
          { id: 'c', text: 'その結果' },
          { id: 'd', text: 'しかし' },
        ],
        correctId: 'c',
        explanation: '「医療技術の発展」という原因から「医療費の増大」という結果が生じているので、順接の「その結果」が最も適切です。「しかし」は逆接なので、内容が反対のときに使います。\n"Kết quả là" phù hợp vì đây là quan hệ nhân quả: công nghệ y tế phát triển dẫn đến chi phí y tế tăng.',
      },
      xpReward: 30,
    },
  },

  'n3-02-5': {
    courseTitle: { ja: 'N3 読解練習 〜新聞・説明文〜', vi: 'Luyện đọc N3 - Báo và văn bản thông tin' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: '筆者の主張と根拠を探す（〜べきだ・なぜなら・〜からだ）',
      titleTranslation: 'Tìm luận điểm và căn cứ của tác giả (〜べきだ・なぜなら・〜からだ)',
      introduction: `論説文や意見文では、筆者が何かを主張し、その根拠を示します。「筆者の言いたいことは何か」を読み取ることがN3読解の核心です。主張を示す表現と、根拠を示す表現のパターンを覚えましょう。

Trong văn nghị luận và văn ý kiến, tác giả đưa ra luận điểm và bằng chứng. Đọc được "tác giả muốn nói gì" là cốt lõi của đọc hiểu N3. Hãy nhớ các mẫu thể hiện luận điểm và căn cứ.`,
      keyPoints: [
        '主張の表現：〜べきだ・〜が必要だ・〜と考える・〜ではないだろうか',
        '根拠の表現：なぜなら〜からだ・〜ため・〜ことから・〜によると',
        '結論の表現：つまり・以上のことから・このように・したがって',
        '筆者の主張は多くの場合、最終段落か逆接の後に現れる',
        '「〜ではないだろうか」は柔らかい主張・問いかけの形',
        '具体例（たとえば〜）の後は根拠・裏付けになっている',
      ],
      vocabulary: [
        { word: '主張', reading: 'しゅちょう', meaning: '自分の意見を強く言うこと（luận điểm, ý kiến）', example: '筆者の主張を読み取る' },
        { word: '根拠', reading: 'こんきょ', meaning: '理由・証拠（căn cứ, bằng chứng）', example: '主張の根拠を示す' },
        { word: '論じる', reading: 'ろんじる', meaning: '議論する・説明する（lập luận）', example: '介護問題について論じた記事を読む' },
        { word: '指摘', reading: 'してき', meaning: '問題点などを示すこと（chỉ ra, nêu ra）', example: '専門家は人手不足の深刻さを指摘した' },
        { word: '提言', reading: 'ていげん', meaning: '改善案を提案すること（đề xuất, kiến nghị）', example: '政府に対して制度改革を提言した' },
      ],
      examples: [
        { japanese: '介護現場の人手不足は深刻だ。なぜなら、低賃金と重労働により離職者が多いからだ。したがって、処遇改善が急務だと言える。', reading: 'かいごげんばのひとでぶそくはしんこくだ。なぜなら、ていちんぎんとじゅうろうどうによりりしょくしゃがおおいからだ。したがって、しょぐうかいぜんがきゅうむだといえる。', translation: 'Tình trạng thiếu nhân lực điều dưỡng rất nghiêm trọng. Bởi vì lương thấp và công việc nặng nhọc khiến nhiều người bỏ việc. Do đó, cải thiện đãi ngộ là việc cấp bách.' },
        { japanese: '高齢者の健康維持のために、地域のコミュニティを活性化すべきではないだろうか。', reading: 'こうれいしゃのけんこういじのために、ちいきのコミュニティをかっせいかすべきではないだろうか。', translation: 'Để duy trì sức khỏe người cao tuổi, chẳng phải chúng ta nên thúc đẩy cộng đồng địa phương sao?' },
      ],
      grammarNote: `【主張・根拠の読み取り方】
主張を示す表現：
・〜べきだ／〜べきではないか（should）
・〜が重要だ／〜が必要だ
・〜と考える／〜と思われる

根拠を示す表現：
・なぜなら〜からだ（vì rằng...）
・〜ため（do...）
・〜によると（theo...）
・たとえば〜（ví dụ...）

【読解のコツ / Mẹo đọc hiểu】
最終段落に戻って「つまり」「以上のことから」を探すと筆者の結論が分かる。`,
      quiz: {
        question: '「なぜなら〜からだ」はどのような役割を果たしますか？',
        options: [
          { id: 'a', text: '結論をまとめる' },
          { id: 'b', text: '話題を転換する' },
          { id: 'c', text: '主張の理由・根拠を示す' },
          { id: 'd', text: '反対意見を紹介する' },
        ],
        correctId: 'c',
        explanation: '「なぜなら〜からだ」は主張や事実に対する理由・根拠を説明するパターンです。「なぜなら」の後に根拠が続き、「〜からだ」でその理由を締めくくります。\n"なぜなら〜からだ" là mẫu giải thích lý do/căn cứ cho luận điểm. Sau "なぜなら" là căn cứ, "〜からだ" kết thúc lý do.',
      },
      xpReward: 30,
    },
  },

  'n3-02-6': {
    courseTitle: { ja: 'N3 読解練習 〜新聞・説明文〜', vi: 'Luyện đọc N3 - Báo và văn bản thông tin' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: '比較・対比の文章（AはBと違って・〜に対して・〜一方）',
      titleTranslation: 'Văn bản so sánh, đối chiếu (A khác B・〜に対して・〜一方)',
      introduction: `説明文や論説文では、二つのものを比べる「比較・対比」の構造がよく使われます。「AはBと違って〜」「Aに対して、Bは〜」「〜一方、〜」などの表現を理解すると、筆者が何を対比させているかがわかります。

Trong văn thông tin và văn nghị luận, cấu trúc so sánh đối chiếu hai thứ thường được dùng. Hiểu các biểu thức "A khác B ở chỗ", "đối với A thì B là", "trong khi〜" giúp nhận ra tác giả đang đối chiếu gì.`,
      keyPoints: [
        '〜に対して：対比・対照を示す（đối với〜, so với〜）',
        '〜一方（で）：反対の性質・方向を対比（trong khi đó）',
        'AはBと違って：AとBの違いを説明（A khác B ở chỗ）',
        '〜に比べて：数値・程度の比較（so sánh với〜）',
        '共通点を示す：同様に・どちらも・共に',
        '対比の文章では、何と何を比べているかを先に確認する',
      ],
      vocabulary: [
        { word: '対比', reading: 'たいひ', meaning: '二つを比べること（đối chiếu, so sánh）', example: '日本とベトナムの医療制度を対比する' },
        { word: '一方', reading: 'いっぽう', meaning: '片方・それに対して（một mặt khác）', example: '施設ケアが増える一方、在宅ケアも注目されている' },
        { word: '共通', reading: 'きょうつう', meaning: '同じ点（điểm chung）', example: '両国に共通する課題は高齢化問題だ' },
        { word: '異なる', reading: 'ことなる', meaning: '違う（khác nhau）', example: '日本とベトナムでは介護の文化が異なる' },
        { word: '特徴', reading: 'とくちょう', meaning: '特別な性質・特性（đặc điểm, đặc trưng）', example: '日本の介護保険制度の特徴を説明する' },
      ],
      examples: [
        { japanese: '施設介護は24時間のサポートが可能だ。これに対して、在宅介護は家族の負担が大きい一方、利用者が住み慣れた環境で生活できる利点がある。', reading: 'しせつかいごは24じかんのサポートがかのうだ。これにたいして、ざいたくかいごはかぞくのふたんがおおきいいっぽう、りようしゃがすみなれたかんきょうでせいかつできるりてんがある。', translation: 'Chăm sóc tại cơ sở có thể hỗ trợ 24 giờ. Ngược lại, chăm sóc tại nhà tuy gánh nặng cho gia đình lớn, nhưng có ưu điểm là người sử dụng sống trong môi trường quen thuộc.' },
        { japanese: '日本の高齢化率は約29%であるのに対して、ベトナムはまだ約8%にとどまっている。', reading: 'にほんのこうれいかりつはやく29%であるのにたいして、ベトナムはまだやく8%にとどまっている。', translation: 'Tỷ lệ người cao tuổi ở Nhật khoảng 29%, trong khi đó Việt Nam vẫn còn khoảng 8%.' },
      ],
      grammarNote: `【比較・対比の表現まとめ】
■ 対比を示す：
・AはBと違って〜（A khác B ở chỗ）
・Aに対して、Bは〜（đối với A, B thì）
・〜一方（で）、〜（trong khi đó）
・〜のに対して〜（trong khi A thì B）

■ 比較を示す：
・〜に比べて（so với）
・〜より（hơn）
・〜ほど〜ない（không〜bằng）

【読解のコツ / Mẹo đọc】
対比文章では「何と何を比べているか」を最初に確認。それぞれの特徴を整理しながら読もう。`,
      quiz: {
        question: '「公的介護保険は65歳以上を対象とする。（　　）、民間の介護保険は年齢制限が低く設定されている。」（　　）に入る最も適切な表現は？',
        options: [
          { id: 'a', text: 'なぜなら' },
          { id: 'b', text: 'これに対して' },
          { id: 'c', text: 'したがって' },
          { id: 'd', text: 'つまり' },
        ],
        correctId: 'b',
        explanation: '公的介護保険（65歳以上）と民間介護保険（年齢制限が低い）を対比しているので、対比を示す「これに対して」が正解です。\n"Ngược lại" (これに対して) phù hợp vì hai chủ thể được đối chiếu: bảo hiểm công cộng và bảo hiểm tư nhân.',
      },
      xpReward: 30,
    },
  },

  'n3-02-7': {
    courseTitle: { ja: 'N3 読解練習 〜新聞・説明文〜', vi: 'Luyện đọc N3 - Báo và văn bản thông tin' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: '数字・データを含む文章（割合・増減・統計表現）',
      titleTranslation: 'Văn bản chứa số liệu và dữ liệu (tỷ lệ, tăng giảm, biểu đạt thống kê)',
      introduction: `新聞記事や報告書では、数字やデータを使って事実を説明します。割合・増減・統計を表す表現を理解することで、数字が持つ意味を正確に読み取ることができます。介護・医療分野の記事では統計データが頻繁に登場します。

Trong báo và báo cáo, số liệu và dữ liệu được dùng để giải thích sự thật. Hiểu biểu đạt về tỷ lệ, tăng giảm, thống kê giúp đọc chính xác ý nghĩa của các con số. Trong bài về y tế điều dưỡng, dữ liệu thống kê xuất hiện thường xuyên.`,
      keyPoints: [
        '割合の表現：〜割・〜パーセント・約〜・〜に1人・〜人に〜人',
        '増加の表現：増える・上昇する・高まる・〜倍になる・過去最多',
        '減少の表現：減る・低下する・下がる・最低水準・〜割減',
        '比較の表現：前年比〜%増・〜年前と比べて・対前年度比',
        '範囲の表現：〜以上・〜以下・〜から〜まで・〜前後',
        '「約」「およそ」「ほぼ」は大まかな数字を示す',
      ],
      vocabulary: [
        { word: '割合', reading: 'わりあい', meaning: '全体に対する比率（tỷ lệ）', example: '高齢者の割合が増加している' },
        { word: '前年比', reading: 'ぜんねんひ', meaning: '前の年との比較（so với năm trước）', example: '入院患者数は前年比5%増加した' },
        { word: '推移', reading: 'すいい', meaning: '時間とともに変化すること（biến đổi theo thời gian）', example: '介護施設数の推移をグラフで確認する' },
        { word: '上回る', reading: 'うわまわる', meaning: '〜より多い（vượt qua, hơn）', example: '需要が供給を上回っている' },
        { word: '下回る', reading: 'したまわる', meaning: '〜より少ない（dưới mức, ít hơn）', example: '目標を下回る結果となった' },
      ],
      examples: [
        { japanese: '2023年度の介護職員数は約232万人で、前年度比で約3万人増加した。しかし、2040年度には約272万人が必要とされており、依然として不足している。', reading: '2023ねんどのかいごしょくいんすうはやく232まんにんで、ぜんねんどひでやく3まんにんぞうかした。しかし、2040ねんどにはやく272まんにんがひつようとされており、いぜんとしてふそくしている。', translation: 'Số nhân viên điều dưỡng năm 2023 khoảng 2,32 triệu người, tăng khoảng 30.000 người so với năm trước. Tuy nhiên, đến năm 2040 cần khoảng 2,72 triệu người, vẫn còn thiếu.' },
        { japanese: '日本国内の認知症患者は2025年には約700万人に達すると予測されており、65歳以上の約5人に1人が認知症になる計算だ。', reading: 'にほんこくないのにんちしょうかんじゃは2025ねんにはやく700まんにんにたっするとよそくされており、65さいいじょうのやく5にんに1にんがにんちしょうになるけいさんだ。', translation: 'Số bệnh nhân mất trí nhớ ở Nhật được dự báo đạt khoảng 7 triệu người vào năm 2025, tính ra cứ khoảng 5 người từ 65 tuổi trở lên thì có 1 người mắc bệnh.' },
      ],
      grammarNote: `【数字・データを読む表現】
■ 割合：
・〜割（ví dụ: 3割 = 30%）
・〜パーセント（%）
・〜人に〜人（cứ A người thì có B người）

■ 増減：
・〜%増／〜%減（tăng/giảm〜%）
・〜倍（gấp〜 lần）
・過去最多／最少（cao/thấp nhất từ trước đến nay）

■ 予測・推計：
・〜と予測される（được dự báo là）
・〜に達すると見込まれる（dự kiến đạt）
・〜の見通しだ（triển vọng là）`,
      quiz: {
        question: '「介護施設の数は10年前と比べて約2倍に増えた」という文から分かることは？',
        options: [
          { id: 'a', text: '介護施設の数が10年前の半分になった' },
          { id: 'b', text: '介護施設の数が10年前より2つ増えた' },
          { id: 'c', text: '介護施設の数が10年前の2倍になった' },
          { id: 'd', text: '介護施設の数が毎年2つずつ増えた' },
        ],
        correctId: 'c',
        explanation: '「〜倍に増えた」は元の数量の〜倍になったという意味です。「2倍に増えた」= 10年前の2倍の数になった、という意味です。\n"Tăng gấp 2 lần" có nghĩa là số lượng hiện tại bằng 2 lần số lượng 10 năm trước.',
      },
      xpReward: 30,
    },
  },

  'n3-02-8': {
    courseTitle: { ja: 'N3 読解練習 〜新聞・説明文〜', vi: 'Luyện đọc N3 - Báo và văn bản thông tin' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: '原因・理由の表現（〜ため・〜から・なぜなら・〜によって）',
      titleTranslation: 'Biểu đạt nguyên nhân và lý do (〜ため・〜から・なぜなら・〜によって)',
      introduction: `説明文では「なぜそうなったのか」という原因・理由の説明が重要な役割を果たします。原因・理由を示す表現を理解することで、文章の論理的なつながりを正確に読み取ることができます。

Trong văn thông tin, giải thích nguyên nhân/lý do "tại sao như vậy" đóng vai trò quan trọng. Hiểu biểu đạt nguyên nhân/lý do giúp đọc chính xác mối liên kết logic trong văn bản.`,
      keyPoints: [
        '〜ため（に）：原因・目的を示す書き言葉表現（do〜, vì〜）',
        '〜から：理由を示す話し言葉・書き言葉両方で使用',
        'なぜなら〜からだ：理由を強調して説明するパターン',
        '〜によって：手段・原因・変化の主体を示す',
        '〜ことから：事実・観察から判断の根拠を示す',
        '〜ので：原因・理由（からより柔らかい表現）',
      ],
      vocabulary: [
        { word: '要因', reading: 'よういん', meaning: '原因となる要素（yếu tố nguyên nhân）', example: '介護離職の主な要因は家族の介護負担だ' },
        { word: '影響', reading: 'えいきょう', meaning: 'ある事柄が他に及ぼす作用（ảnh hưởng）', example: '高齢化は医療費に大きな影響を与える' },
        { word: '背景', reading: 'はいけい', meaning: '物事の後ろにある事情（bối cảnh）', example: '人手不足の背景には低賃金問題がある' },
        { word: '起因', reading: 'きいん', meaning: '〜が原因で起こること（bắt nguồn từ）', example: '感染症に起因する死者が増えた' },
        { word: '生じる', reading: 'しょうじる', meaning: '起こる・発生する（phát sinh, nảy sinh）', example: '制度の変更により様々な問題が生じた' },
      ],
      examples: [
        { japanese: '介護職員の不足は、労働環境の厳しさと賃金の低さによって引き起こされている。そのため、外国人介護士の受け入れが重要な解決策となっている。', reading: 'かいごしょくいんのふそくは、ろうどうかんきょうのきびしさとちんぎんのひくさによってひきおこされている。そのため、がいこくじんかいごしのうけいれがじゅうような解決策となっている。', translation: 'Tình trạng thiếu nhân viên điều dưỡng bắt nguồn từ môi trường làm việc khắt khe và mức lương thấp. Do đó, tiếp nhận điều dưỡng nước ngoài trở thành giải pháp quan trọng.' },
        { japanese: '高齢化が急速に進んでいることから、認知症の患者数が今後さらに増加すると予測されている。', reading: 'こうれいかがきゅうそくにすすんでいることから、にんちしょうのかんじゃすうがこんごさらにぞうかするとよそくされている。', translation: 'Do già hóa dân số diễn ra nhanh chóng, số bệnh nhân mất trí nhớ được dự báo sẽ tiếp tục tăng trong tương lai.' },
      ],
      grammarNote: `【原因・理由の表現パターン】
■ 書き言葉（formal, thường dùng trong báo/văn bản）：
・〜ため（に）= do〜, vì〜
・〜によって = bởi vì, do
・〜ことから = từ thực tế〜

■ 話し言葉・書き言葉両方：
・〜から = vì〜（lý do）
・〜ので = do〜（lý do, lịch sự hơn）
・なぜなら〜からだ = bởi vì〜

【注意】
「ため」は原因（〜が原因で）と目的（〜の目的で）の両方に使える。
文脈でどちらの意味か判断する。`,
      quiz: {
        question: '「少子化が進んでいる（　　）、将来の介護士不足がさらに深刻になると言われている。」（　　）に入る最も適切な表現は？',
        options: [
          { id: 'a', text: 'ため' },
          { id: 'b', text: 'しかし' },
          { id: 'c', text: 'つまり' },
          { id: 'd', text: 'または' },
        ],
        correctId: 'a',
        explanation: '「少子化が進んでいる」が原因で「介護士不足がさらに深刻になる」という結果が生じているので、原因を示す「ため」が正解です。\n"ため" thể hiện nguyên nhân: già hóa dân số dẫn đến thiếu hụt nhân lực điều dưỡng.',
      },
      xpReward: 30,
    },
  },

  'n3-02-9': {
    courseTitle: { ja: 'N3 読解練習 〜新聞・説明文〜', vi: 'Luyện đọc N3 - Báo và văn bản thông tin' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: '結果・影響の表現（〜ので・その結果・したがって・〜ことになった）',
      titleTranslation: 'Biểu đạt kết quả và ảnh hưởng (〜ので・その結果・したがって・〜ことになった)',
      introduction: `説明文では原因に続いて「その結果どうなったか」を説明する部分が重要です。結果・影響を示す表現を理解することで、文章の論理展開を正確に追うことができます。医療・介護の記事では政策の効果や問題の影響を述べる際によく使われます。

Trong văn thông tin, phần giải thích "kết quả là gì" tiếp theo nguyên nhân rất quan trọng. Hiểu biểu đạt kết quả/ảnh hưởng giúp theo dõi chính xác logic triển khai. Trong bài về y tế điều dưỡng, thường dùng khi nêu hiệu quả chính sách hay ảnh hưởng của vấn đề.`,
      keyPoints: [
        'その結果：前の内容の結果として起きたことを示す',
        'したがって：論理的な結論・帰結を示す（書き言葉）',
        '〜ことになった：状況・決定の結果そうなった（やや受け身）',
        '〜ようになった：変化の結果、新しい状態になった',
        '〜ため（に）〜た：原因→結果の両方を一文で表す',
        '「その影響で」「これにより」も結果を導く表現',
      ],
      vocabulary: [
        { word: '結果', reading: 'けっか', meaning: '原因から生じる出来事（kết quả）', example: '調査の結果、問題が明らかになった' },
        { word: '影響', reading: 'えいきょう', meaning: '他に及ぼす作用（ảnh hưởng）', example: '少子化は経済に大きな影響を与える' },
        { word: '招く', reading: 'まねく', meaning: '（悪い）結果を引き起こす（dẫn đến）', example: '過労は健康問題を招く恐れがある' },
        { word: '改善', reading: 'かいぜん', meaning: 'よくなること（cải thiện）', example: '処遇改善により離職率が下がった' },
        { word: '普及', reading: 'ふきゅう', meaning: '広く行き渡ること（phổ biến）', example: 'ICT技術の普及により業務が効率化した' },
      ],
      examples: [
        { japanese: '介護報酬が引き上げられた。その結果、介護職員の離職率がやや低下し、採用状況も改善された。', reading: 'かいごほうしゅうがひきあげられた。そのけっか、かいごしょくいんのりしょくりつがやていかし、さいようじょうきょうもかいぜんされた。', translation: 'Thù lao điều dưỡng được nâng lên. Kết quả là tỷ lệ nghỉ việc của nhân viên điều dưỡng giảm nhẹ và tình hình tuyển dụng cũng được cải thiện.' },
        { japanese: '高齢者向けICTサービスが普及したことにより、独居老人の孤立問題が緩和されるようになった。', reading: 'こうれいしゃむけICTサービスがふきゅうしたことにより、どっきょろうじんのこりつもんだいがかんわされるようになった。', translation: 'Nhờ dịch vụ ICT dành cho người cao tuổi được phổ biến, vấn đề cô lập của người cao tuổi sống một mình dần được giảm bớt.' },
      ],
      grammarNote: `【結果・影響の表現まとめ】
■ 結果を示す接続詞：
・その結果（kết quả là）
・したがって（do đó, vì vậy）
・これにより（nhờ đó, do đó）
・その影響で（dưới ảnh hưởng đó）

■ 変化の結果を示す：
・〜ようになった（trở nên〜）
・〜ことになった（trở thành〜, được quyết định〜）
・〜ことが明らかになった（trở nên rõ ràng rằng〜）

【読解のコツ】
「その結果」の直後に注目すると、問いの答えになることが多い。`,
      quiz: {
        question: '「制度が改正された。（　　）、より多くの外国人が介護職に就けるようになった。」最も適切な表現は？',
        options: [
          { id: 'a', text: 'なぜなら' },
          { id: 'b', text: 'その結果' },
          { id: 'c', text: 'ところが' },
          { id: 'd', text: 'たとえば' },
        ],
        correctId: 'b',
        explanation: '制度改正という原因から、外国人が介護職に就けるようになったという結果が続いています。結果を示す「その結果」が最も適切です。\n"Kết quả là" phù hợp vì đây là kết quả của việc cải cách chế độ.',
      },
      xpReward: 30,
    },
  },

  'n3-02-10': {
    courseTitle: { ja: 'N3 読解練習 〜新聞・説明文〜', vi: 'Luyện đọc N3 - Báo và văn bản thông tin' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: '医療・健康情報の説明文（病気・予防・介護）',
      titleTranslation: 'Văn bản thông tin y tế và sức khỏe (bệnh tật, phòng ngừa, điều dưỡng)',
      introduction: `医療・健康に関する説明文は、N3の読解問題でよく出題されます。特に介護・看護分野で働くベトナム人にとって、日本語の医療文書を正確に読む力は欠かせません。病気の症状・予防策・治療法・介護方法を説明する表現を学びましょう。

Văn bản thông tin về y tế và sức khỏe thường xuất hiện trong bài đọc hiểu N3. Đặc biệt với người Việt làm ngành điều dưỡng/y tế, khả năng đọc chính xác văn bản y tế tiếng Nhật là không thể thiếu. Hãy học các biểu đạt về triệu chứng, biện pháp phòng ngừa, phương pháp điều trị và chăm sóc.`,
      keyPoints: [
        '症状の表現：〜が現れる・〜を示す・〜を訴える・〜が起こる',
        '予防の表現：〜を防ぐ・〜することが大切だ・〜に努める',
        '原因の表現：〜が原因で・〜によって引き起こされる',
        '経過の表現：〜が進行する・〜が悪化する・〜が改善する',
        '医療文書の特徴：受動態（〜される・〜が行われる）が多い',
        '注意情報：「〜には注意が必要だ」「〜の恐れがある」',
      ],
      vocabulary: [
        { word: '症状', reading: 'しょうじょう', meaning: '病気の表れ方（triệu chứng）', example: '発熱・咳などの症状が現れた' },
        { word: '予防', reading: 'よぼう', meaning: '病気にならないようにすること（phòng ngừa）', example: '感染症の予防には手洗いが効果的だ' },
        { word: '悪化', reading: 'あっか', meaning: '状態が悪くなること（trở nên tệ hơn）', example: '早期発見により症状の悪化を防ぐ' },
        { word: '介護予防', reading: 'かいごよぼう', meaning: '要介護状態を防ぐこと（phòng ngừa cần chăm sóc）', example: '介護予防のための運動教室が開かれた' },
        { word: '重篤', reading: 'じゅうとく', meaning: '病状が重いこと（nghiêm trọng, nặng）', example: '重篤な状態になる前に対処することが重要だ' },
      ],
      examples: [
        { japanese: '認知症は脳の神経細胞が失われることで起こり、記憶障害・判断力の低下などの症状が現れる。早期発見・早期対応が重要とされている。', reading: 'にんちしょうはのうのしんけいさいぼうがうしなわれることでおこり、きおくしょうがい・はんだんりょくのていかなどのしょうじょうがあらわれる。そうきはっけん・そうきたいおうがじゅうようとされている。', translation: 'Chứng mất trí nhớ xảy ra khi tế bào thần kinh não bị mất, xuất hiện các triệu chứng như rối loạn trí nhớ, giảm khả năng phán đoán. Phát hiện sớm và ứng phó sớm được coi là quan trọng.' },
        { japanese: '高血圧は自覚症状が出にくいため、「サイレントキラー」とも呼ばれる。定期的な血圧測定と生活習慣の改善が予防に効果的だ。', reading: 'こうけつあつはじかくしょうじょうがでにくいため、「サイレントキラー」ともよばれる。ていきてきなけつあつそくていとせいかつしゅうかんのかいぜんがよぼうにこうかてきだ。', translation: 'Huyết áp cao khó có triệu chứng tự giác nên còn được gọi là "kẻ giết người thầm lặng". Đo huyết áp định kỳ và cải thiện thói quen sinh hoạt có hiệu quả trong phòng ngừa.' },
      ],
      grammarNote: `【医療文書の読み方】
■ よく使われる受動態：
・〜が行われる（được thực hiện）
・〜が確認される（được xác nhận）
・〜と診断される（được chẩn đoán）
・〜が求められる（được yêu cầu）

■ 注意・警告の表現：
・〜の恐れがある（có nguy cơ〜）
・〜には注意が必要だ（cần chú ý đến〜）
・〜を避けることが大切だ（quan trọng là tránh〜）

■ 医療数値の読み方：
血圧 120/80 = 上が120、下が80（収縮期/拡張期）`,
      quiz: {
        question: '「早期発見・早期対応が重要とされている」の「とされている」はどういう意味ですか？',
        options: [
          { id: 'a', text: '筆者だけがそう思っている' },
          { id: 'b', text: '一般的にそのように考えられている・言われている' },
          { id: 'c', text: '法律でそのように決められている' },
          { id: 'd', text: '昔からそう決まっている' },
        ],
        correctId: 'b',
        explanation: '「〜とされている」は「一般的に・広く〜と考えられている」という意味で、社会的な認識や通説を表します。筆者個人の意見ではなく、多くの人が共有する見解です。\n"〜とされている" có nghĩa là "được cho là〜 nói chung", thể hiện nhận thức xã hội hay quan điểm phổ biến.',
      },
      xpReward: 30,
    },
  },

  'n3-02-11': {
    courseTitle: { ja: 'N3 読解練習 〜新聞・説明文〜', vi: 'Luyện đọc N3 - Báo và văn bản thông tin' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: '社会問題を扱う記事（少子高齢化・外国人労働者）',
      titleTranslation: 'Bài báo về vấn đề xã hội (già hóa dân số, lao động nước ngoài)',
      introduction: `日本の新聞では少子高齢化・外国人労働者・介護人材不足などの社会問題が頻繁に取り上げられます。これらのテーマはN3読解でも頻出です。社会問題を扱う記事では、問題の現状・原因・対策という構造を意識して読みましょう。

Báo Nhật thường đề cập các vấn đề xã hội như già hóa dân số, lao động nước ngoài, thiếu nhân lực điều dưỡng. Những chủ đề này cũng thường xuất hiện trong đọc hiểu N3. Khi đọc bài về vấn đề xã hội, hãy ý thức cấu trúc: hiện trạng vấn đề → nguyên nhân → biện pháp.`,
      keyPoints: [
        '社会問題記事の基本構造：現状→原因→影響→対策',
        '問題提起の表現：〜が深刻化している・〜が課題となっている',
        '現状の表現：〜の割合が高まっている・〜が増加傾向にある',
        '対策の表現：〜の取り組みが進む・〜を推進する・〜を検討する',
        '引用表現：〜によると・〜が明らかになった・〜が示している',
        '意見・提言：〜が求められる・〜が必要だ・〜を目指すべきだ',
      ],
      vocabulary: [
        { word: '少子高齢化', reading: 'しょうしこうれいか', meaning: '子どもが減り高齢者が増える現象（già hóa dân số, giảm sinh）', example: '少子高齢化により労働力不足が進む' },
        { word: '深刻', reading: 'しんこく', meaning: '問題が非常に重大なこと（nghiêm trọng）', example: '介護人材不足は深刻な問題だ' },
        { word: '対策', reading: 'たいさく', meaning: '問題への取り組み（biện pháp đối phó）', example: '政府は少子化対策を強化している' },
        { word: '受け入れ', reading: 'うけいれ', meaning: '外国人などを迎え入れること（tiếp nhận）', example: '外国人労働者の受け入れが拡大している' },
        { word: '定着', reading: 'ていちゃく', meaning: '定住・安定して続くこと（định cư, ổn định）', example: '外国人介護士の定着率を高める取り組み' },
      ],
      examples: [
        { japanese: '日本では少子高齢化が急速に進み、介護人材の不足が深刻化している。政府はこの問題に対応するため、外国人介護士の受け入れ拡大や処遇改善を推進している。', reading: 'にほんではしょうしこうれいかがきゅうそくにすすみ、かいごじんざいのふそくがしんこくかしている。せいふはこのもんだいにたいおうするため、がいこくじんかいごしのうけいれかくだいやしょぐうかいぜんをすいしんしている。', translation: 'Tại Nhật Bản, già hóa dân số diễn ra nhanh chóng, tình trạng thiếu nhân lực điều dưỡng ngày càng nghiêm trọng. Chính phủ đang thúc đẩy mở rộng tiếp nhận điều dưỡng nước ngoài và cải thiện đãi ngộ để ứng phó với vấn đề này.' },
        { japanese: '外国人労働者の増加に伴い、職場での多文化共生への取り組みが企業や施設に求められるようになっている。', reading: 'がいこくじんろうどうしゃのぞうかにともない、しょくばでのたぶんかきょうせいへのとりくみがきぎょうやしせつにもとめられるようになっている。', translation: 'Cùng với sự gia tăng của lao động nước ngoài, doanh nghiệp và cơ sở ngày càng được yêu cầu nỗ lực cùng chung sống đa văn hóa tại nơi làm việc.' },
      ],
      grammarNote: `【社会問題記事の読み方】
■ 問題の深刻さを表す表現：
・〜が深刻化している（đang trở nên nghiêm trọng）
・〜が課題となっている（đang là thách thức）
・〜が懸念される（đáng lo ngại）

■ 対策・解決策の表現：
・〜に取り組む（nỗ lực giải quyết〜）
・〜を推進する（thúc đẩy〜）
・〜を検討する（xem xét〜）
・〜が求められる（được yêu cầu〜）

【読解のコツ】
「〜という課題がある。これに対し、〜」という構造に注目。
課題提示→解決策という流れを追う。`,
      quiz: {
        question: '「少子化対策の一環として、育児休業制度の充実が図られている」の「〜の一環として」はどういう意味ですか？',
        options: [
          { id: 'a', text: '少子化対策に反対して' },
          { id: 'b', text: '少子化対策の全てとして' },
          { id: 'c', text: '少子化対策の取り組みの一部として' },
          { id: 'd', text: '少子化対策の結果として' },
        ],
        correctId: 'c',
        explanation: '「〜の一環として」は「〜という大きな取り組みの一部として」という意味です。育児休業制度の充実は少子化対策の中の一つの施策であることを示しています。\n"〜の一環として" có nghĩa là "như một phần của〜", thể hiện đây là một trong nhiều biện pháp của chính sách lớn hơn.',
      },
      xpReward: 30,
    },
  },

  'n3-02-12': {
    courseTitle: { ja: 'N3 読解練習 〜新聞・説明文〜', vi: 'Luyện đọc N3 - Báo và văn bản thông tin' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: '科学・技術の説明文（AI・医療技術）',
      titleTranslation: 'Văn bản thông tin về khoa học công nghệ (AI, công nghệ y tế)',
      introduction: `近年、AI・ロボット・ICTなどの技術が医療・介護分野に急速に導入されています。科学・技術の説明文では、技術の仕組み・効果・課題を論理的に説明します。専門用語が多いですが、文章の構造を理解することで内容を読み取ることができます。

Gần đây, các công nghệ như AI, robot, ICT đang được đưa vào lĩnh vực y tế và điều dưỡng nhanh chóng. Văn bản thông tin về khoa học công nghệ giải thích cơ chế, hiệu quả và thách thức của công nghệ một cách logic. Dù có nhiều thuật ngữ chuyên môn nhưng hiểu cấu trúc văn bản giúp đọc được nội dung.`,
      keyPoints: [
        '技術説明文の構造：概要→仕組み→効果・メリット→課題・デメリット',
        '仕組みの説明：〜によって・〜を通じて・〜を用いて',
        '効果の表現：〜が可能になる・〜を実現する・〜に貢献する',
        '課題の表現：〜という問題がある・〜が懸念される・〜には限界がある',
        '専門用語：文脈と前後の説明から意味を推測する',
        '受動態が多い：〜が開発された・〜が導入されている・〜が活用されている',
      ],
      vocabulary: [
        { word: '導入', reading: 'どうにゅう', meaning: '新しいものを取り入れること（đưa vào, áp dụng）', example: 'AIを介護施設に導入する試みが進む' },
        { word: '活用', reading: 'かつよう', meaning: 'うまく使うこと（tận dụng, ứng dụng）', example: 'データを活用して介護の質を向上させる' },
        { word: '課題', reading: 'かだい', meaning: '解決すべき問題（thách thức, vấn đề cần giải quyết）', example: 'AI導入のコストが課題となっている' },
        { word: '精度', reading: 'せいど', meaning: '正確さの程度（độ chính xác）', example: 'AI診断の精度が向上している' },
        { word: '実証', reading: 'じっしょう', meaning: '実際に証明すること（chứng minh thực tế）', example: '介護ロボットの効果を実証実験で確認する' },
      ],
      examples: [
        { japanese: 'AIを活用した転倒予防システムが介護施設で試験導入されている。このシステムは、カメラ映像を解析して転倒リスクの高い利用者を事前に検知することが可能だ。', reading: 'AIをかつようしたてんとうよぼうシステムがかいごしせつでしけんどうにゅうされている。このシステムは、カメラえいぞうをかいせきしててんとうリスクのたかいりようしゃをじぜんにけんちすることがかのうだ。', translation: 'Hệ thống phòng ngừa té ngã ứng dụng AI đang được thí điểm tại cơ sở điều dưỡng. Hệ thống này có thể phân tích hình ảnh camera để phát hiện trước người dùng có nguy cơ té ngã cao.' },
        { japanese: '医療AIの活用により診断の精度が向上している一方、医師の判断を補助するツールとして位置づけることが重要であるという指摘もある。', reading: 'いりょうAIのかつようによりしんだんのせいどがこうじょうしているいっぽう、いしのはんだんをほじょするツールとしてくらいづけることがじゅうようであるというしてきもある。', translation: 'Trong khi ứng dụng AI y tế giúp nâng cao độ chính xác chẩn đoán, cũng có ý kiến chỉ ra rằng quan trọng là định vị nó như một công cụ hỗ trợ phán đoán của bác sĩ.' },
      ],
      grammarNote: `【科学・技術の説明文で使われる表現】
■ 仕組み・方法：
・〜によって（bằng cách〜）
・〜を用いて（sử dụng〜）
・〜を通じて（thông qua〜）

■ 可能性・効果：
・〜が可能になる（có thể〜）
・〜を実現する（thực hiện〜）
・〜に貢献する（đóng góp vào〜）

■ 問題・限界：
・〜という問題がある（có vấn đề là〜）
・〜には限界がある（có giới hạn là〜）
・〜が懸念される（đáng lo ngại về〜）

【コツ】専門用語は前後の文から意味を推測しよう。`,
      quiz: {
        question: '「このシステムは転倒リスクを事前に検知することが可能だ」の「〜ことが可能だ」と同じ意味の表現は？',
        options: [
          { id: 'a', text: '〜ことができる' },
          { id: 'b', text: '〜ことがある' },
          { id: 'c', text: '〜かもしれない' },
          { id: 'd', text: '〜ようになる' },
        ],
        correctId: 'a',
        explanation: '「〜ことが可能だ」は「〜ことができる」とほぼ同じ意味ですが、「〜ことが可能だ」は書き言葉・フォーマルな文章でよく使われます。\n"〜ことが可能だ" và "〜ことができる" gần như cùng nghĩa, nhưng "〜ことが可能だ" thường dùng trong văn viết/văn phong trang trọng.',
      },
      xpReward: 30,
    },
  },

  'n3-02-13': {
    courseTitle: { ja: 'N3 読解練習 〜新聞・説明文〜', vi: 'Luyện đọc N3 - Báo và văn bản thông tin' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: '生活・習慣に関するコラム（日本の習慣・食文化）',
      titleTranslation: 'Cột báo về cuộc sống và thói quen (phong tục Nhật Bản, văn hóa ẩm thực)',
      introduction: `新聞のコラムや生活情報記事は、日本の文化・習慣・食生活などを読みやすい文体で紹介します。N3レベルでは、筆者の視点や感想が入った「コラム」を読む練習も重要です。文化的な背景を理解しながら読むことで、理解が深まります。

Cột báo và bài thông tin sinh hoạt giới thiệu văn hóa, phong tục, chế độ ăn uống Nhật Bản bằng văn phong dễ đọc. Ở trình độ N3, luyện đọc "cột báo" có quan điểm và cảm nhận của tác giả cũng quan trọng. Đọc với sự hiểu biết về nền tảng văn hóa giúp nắm bài sâu hơn.`,
      keyPoints: [
        'コラムの特徴：筆者の意見・感想・体験談が含まれる',
        '日常の観察から社会的なテーマに広げる構造が多い',
        '「〜ものだ」「〜ではないだろうか」は筆者の感慨・主張',
        '文化説明：日本特有の習慣を外国人にも分かるよう説明',
        '食文化：「〜を食べる習慣がある」「〜に由来する」',
        '季節・行事：「〜の時期になると」「〜が行われる」',
      ],
      vocabulary: [
        { word: '習慣', reading: 'しゅうかん', meaning: '繰り返し行われる行動・慣例（thói quen, tập tục）', example: '手を合わせて「いただきます」と言う習慣がある' },
        { word: '由来', reading: 'ゆらい', meaning: 'もとになった起源（nguồn gốc, xuất phát）', example: '「いただきます」は感謝の気持ちに由来する' },
        { word: '根付く', reading: 'ねづく', meaning: '定着する・浸透する（ăn sâu, bén rễ）', example: '和食文化は日本に深く根付いている' },
        { word: '風習', reading: 'ふうしゅう', meaning: '地域・集団の慣わし（phong tục）', example: '正月に雑煮を食べる風習がある' },
        { word: '伝承', reading: 'でんしょう', meaning: '代々伝えること（truyền thừa）', example: '伝統的な食文化を次世代に伝承する' },
      ],
      examples: [
        { japanese: '日本の介護施設では、食事の際に「いただきます」「ごちそうさまでした」を声に出す習慣がある。これは食べ物や料理した人への感謝を表す日本独自の文化だ。', reading: 'にほんのかいごしせつでは、しょくじのさいに「いただきます」「ごちそうさまでした」をこえにだすしゅうかんがある。これはたべものやりょうりしたひとへのかんしゃをあらわすにほんどくじのぶんかだ。', translation: 'Tại cơ sở điều dưỡng Nhật Bản, có thói quen nói to "itadakimasu" và "gochisousama deshita" khi ăn. Đây là văn hóa độc đáo của Nhật thể hiện lòng biết ơn đối với thức ăn và người nấu.' },
        { japanese: '高齢者の多い介護施設では、行事食として季節の料理を提供することで、利用者が季節の変化を感じられるよう工夫されている。', reading: 'こうれいしゃのおおいかいごしせつでは、ぎょうじしょくとしてきせつのりょうりをていきょうすることで、りようしゃがきせつのへんかをかんじられるようくふうされている。', translation: 'Tại cơ sở điều dưỡng nhiều người cao tuổi, người ta phục vụ món ăn theo mùa như bữa ăn lễ hội để người dùng cảm nhận được sự thay đổi của mùa.' },
      ],
      grammarNote: `【コラム読解のポイント】
■ 筆者の意見・感想を示す表現：
・〜ものだ（đó là lẽ thường, thật〜）
・〜ではないだろうか（chẳng phải〜sao?）
・〜と感じる（cảm thấy〜）
・〜と言えるだろう（có thể nói là〜）

■ 日本文化の説明でよく使う表現：
・〜という習慣がある（có thói quen〜）
・〜に由来する（có nguồn gốc từ〜）
・〜が行われる（được tổ chức/thực hiện〜）
・〜が根付いている（đã ăn sâu〜）`,
      quiz: {
        question: '「〜ものだ」が文末に使われているとき、筆者はどのような気持ちを表していますか？',
        options: [
          { id: 'a', text: '命令・指示' },
          { id: 'b', text: '感慨・しみじみとした感想・一般的な真理' },
          { id: 'c', text: '強い否定' },
          { id: 'd', text: '未来の予測' },
        ],
        correctId: 'b',
        explanation: '「〜ものだ」はコラムなどで「しみじみとした感慨」や「一般的な真理」を表します。例：「時間が経つのは早いものだ」「人は誰でも老いるものだ」。\n"〜ものだ" trong cột báo thể hiện cảm xúc sâu lắng hay chân lý chung, ví dụ "thời gian trôi nhanh thật" hay "ai rồi cũng già".',
      },
      xpReward: 30,
    },
  },

  'n3-02-14': {
    courseTitle: { ja: 'N3 読解練習 〜新聞・説明文〜', vi: 'Luyện đọc N3 - Báo và văn bản thông tin' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: '統計・調査報告を読む（グラフの説明文・アンケート結果）',
      titleTranslation: 'Đọc báo cáo thống kê và khảo sát (văn bản giải thích biểu đồ, kết quả ankét)',
      introduction: `新聞や報告書では、統計データやアンケート結果を文章で説明することがよくあります。グラフや表を言葉で説明する文章では、数値の読み方・変化の表現・割合の表現が重要です。調査報告を正確に読む力はN3で必要なスキルです。

Báo và báo cáo thường giải thích bằng văn bản dữ liệu thống kê và kết quả khảo sát. Trong văn bản mô tả biểu đồ và bảng, cách đọc số liệu, biểu đạt thay đổi và tỷ lệ rất quan trọng. Đọc chính xác báo cáo điều tra là kỹ năng cần thiết ở N3.`,
      keyPoints: [
        'グラフ説明の定番表現：〜は〜%を占めている・〜が最も多い',
        '変化の表現：〜から〜へと増加した・〜が〜%上昇した',
        '調査主体の表示：〜省・〜研究所によると・〜が調査した結果',
        'アンケート結果：〜と回答した人が最多・〜と感じている割合',
        '注目すべき点：特に・とりわけ・際立っているのは',
        '調査の限界：〜に限られる・〜のみを対象とした調査',
      ],
      vocabulary: [
        { word: '調査', reading: 'ちょうさ', meaning: '情報を集めて確かめること（điều tra, khảo sát）', example: '厚生労働省が介護実態調査を実施した' },
        { word: '割合', reading: 'わりあい', meaning: '全体に対する比（tỷ lệ）', example: '認知症の割合は年齢とともに増加する' },
        { word: '占める', reading: 'しめる', meaning: '全体の中の一定の部分を持つ（chiếm）', example: '女性が介護職員全体の7割を占める' },
        { word: '回答', reading: 'かいとう', meaning: 'アンケートの答え（câu trả lời, phản hồi）', example: '「負担が大きい」と回答した人が60%に達した' },
        { word: '傾向', reading: 'けいこう', meaning: '一定の方向性・パターン（xu hướng）', example: '要介護度が重くなる傾向が見られる' },
      ],
      examples: [
        { japanese: '介護職員を対象にした調査によると、「仕事の負担が大きい」と回答した人が全体の72%を占め、特に夜勤の負担を挙げる人が多かった。', reading: 'かいごしょくいんをたいしょうにしたちょうさによると、「しごとのふたんがおおきい」とかいとうしたひとがぜんたいの72%をしめ、とくによきんのふたんをあげるひとがおおかった。', translation: 'Theo khảo sát nhắm vào nhân viên điều dưỡng, 72% trong tổng số trả lời "gánh nặng công việc lớn", đặc biệt nhiều người nêu gánh nặng trực đêm.' },
        { japanese: '同調査では、年収300万円未満の介護職員が全体の45%を占めており、処遇改善が急務であることが改めて示された。', reading: 'どうちょうさでは、ねんしゅう300まんえんみまんのかいごしょくいんがぜんたいの45%をしめており、しょぐうかいぜんがきゅうむであることがあらためてしめされた。', translation: 'Trong cùng cuộc khảo sát, nhân viên điều dưỡng có thu nhập hàng năm dưới 3 triệu yên chiếm 45% tổng số, một lần nữa cho thấy cải thiện đãi ngộ là việc cấp bách.' },
      ],
      grammarNote: `【統計・調査報告の読み方】
■ データの出所を示す：
・〜によると（theo〜）
・〜が調査した結果（kết quả điều tra của〜）
・〜省の発表によれば（theo công bố của bộ〜）

■ 割合の表現：
・〜%を占める（chiếm〜%）
・〜割に達する（đạt〜/10）
・〜人に1人（cứ〜 người thì có 1 người）

■ 変化の表現：
・〜ポイント増加/減少（tăng/giảm〜 điểm phần trăm）
・〜比で〜%増（tăng〜% so với〜）
・過去最高/最低を記録（ghi kỷ lục cao/thấp nhất）`,
      quiz: {
        question: '「女性が介護職員全体の7割を占める」を別の言い方にすると？',
        options: [
          { id: 'a', text: '介護職員の70%が女性だ' },
          { id: 'b', text: '介護職員の女性は7人だ' },
          { id: 'c', text: '7割の介護施設で女性が働いている' },
          { id: 'd', text: '女性は7つの施設で働いている' },
        ],
        correctId: 'a',
        explanation: '「7割を占める」= 70%を占める＝ 70%がそれにあたる、という意味です。「〜割」は10分の〜のことで、7割＝70%です。\n"7割" = 70%. "〜を占める" = chiếm〜. Vậy "女性が7割を占める" = 70% là nữ.',
      },
      xpReward: 30,
    },
  },

  'n3-02-15': {
    courseTitle: { ja: 'N3 読解練習 〜新聞・説明文〜', vi: 'Luyện đọc N3 - Báo và văn bản thông tin' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: '条件・例外を含む文章（ただし・〜の場合・〜を除いて）',
      titleTranslation: 'Văn bản chứa điều kiện và ngoại lệ (ただし・〜の場合・〜を除いて)',
      introduction: `規則・制度・案内文などでは、基本的なルールに加えて条件や例外が書かれていることが多いです。「ただし」「〜の場合」「〜を除いて」などの表現を正確に読み取ることが、内容の正確な理解につながります。介護施設の案内や就労規則でもよく使われます。

Trong quy tắc, chế độ, văn bản hướng dẫn, ngoài quy tắc cơ bản thường có điều kiện và ngoại lệ. Đọc chính xác các biểu đạt như "ただし", "〜の場合", "〜を除いて" giúp hiểu đúng nội dung. Cũng thường dùng trong hướng dẫn cơ sở điều dưỡng và nội quy lao động.`,
      keyPoints: [
        'ただし：基本ルールの後に例外・条件を加える',
        '〜の場合（は）：特定の条件の下での取り扱いを示す',
        '〜を除いて／〜を除き：一部を除外することを示す',
        '〜に限り：特定の条件の場合のみ適用されることを示す',
        '〜であれば：条件を示す仮定表現',
        '〜とは限らない：一般化できない・例外があることを示す',
      ],
      vocabulary: [
        { word: '条件', reading: 'じょうけん', meaning: 'ある事が成り立つための要件（điều kiện）', example: '利用条件を確認してから申し込む' },
        { word: '例外', reading: 'れいがい', meaning: '通常のルールが適用されない場合（ngoại lệ）', example: '緊急の場合は例外として対応する' },
        { word: '適用', reading: 'てきよう', meaning: 'ルールなどを当てはめること（áp dụng）', example: '介護保険は65歳以上に適用される' },
        { word: '対象', reading: 'たいしょう', meaning: 'ある事が向けられるもの（đối tượng）', example: 'このサービスは要介護1以上が対象だ' },
        { word: '除く', reading: 'のぞく', meaning: '含めない・外す（loại trừ）', example: '祝日を除く平日に開催される' },
      ],
      examples: [
        { japanese: '介護保険サービスは原則として65歳以上が利用できる。ただし、40歳以上64歳以下であっても、特定の疾病が原因で介護が必要な場合は利用可能だ。', reading: 'かいごほけんサービスはげんそくとして65さいいじょうがりようできる。ただし、40さいいじょう64さいいかであっても、とくていのしっぺいがげんいんでかいごがひつようなばあいはりようかのうだ。', translation: 'Nguyên tắc là dịch vụ bảo hiểm điều dưỡng dành cho người từ 65 tuổi trở lên. Tuy nhiên, ngay cả người từ 40 đến 64 tuổi cũng có thể sử dụng nếu cần chăm sóc do bệnh đặc định.' },
        { japanese: '施設の面会は毎日10時から17時まで可能です。ただし、感染症流行時を除き、事前予約は不要です。', reading: 'しせつのめんかいはまいにち10じから17じまでかのうです。ただし、かんせんしょうりゅうこうじをのぞき、じぜんよやくはふようです。', translation: 'Thăm hỏi tại cơ sở có thể thực hiện mỗi ngày từ 10 giờ đến 17 giờ. Tuy nhiên, trừ thời điểm bệnh truyền nhiễm lưu hành, không cần đặt lịch trước.' },
      ],
      grammarNote: `【条件・例外の表現まとめ】
■ 例外を加える：
・ただし（tuy nhiên, nhưng là điều kiện）
・もっとも（tuy nhiên）

■ 特定条件を示す：
・〜の場合（は）（trong trường hợp〜）
・〜であれば（nếu là〜）
・〜に限り（chỉ trong trường hợp〜）

■ 除外を示す：
・〜を除いて/〜を除き（trừ〜, ngoại trừ〜）
・〜以外（ngoài〜）
・〜を除く（loại trừ〜）

■ 一般化できないことを示す：
・〜とは限らない（không nhất thiết là〜）
・〜わけではない（không có nghĩa là〜）`,
      quiz: {
        question: '「このサービスは無料で利用できます。ただし、65歳以上の方に限ります。」この文の意味は？',
        options: [
          { id: 'a', text: '65歳以上の人は有料でこのサービスを使える' },
          { id: 'b', text: '65歳以上の人だけが無料でこのサービスを使える' },
          { id: 'c', text: '65歳未満の人も無料でこのサービスを使える' },
          { id: 'd', text: '65歳以上の人はサービスを使えない' },
        ],
        correctId: 'b',
        explanation: '「ただし〜に限ります」は「基本的には無料だが、条件として65歳以上のみ」という意味です。「〜に限る」は「〜だけ」「〜のみ」と同じ意味で、対象を限定します。\n"ただし〜に限ります" nghĩa là "nhưng chỉ dành cho〜", giới hạn đối tượng là người từ 65 tuổi trở lên.',
      },
      xpReward: 30,
    },
  },

  'n3-02-16': {
    courseTitle: { ja: 'N3 読解練習 〜新聞・説明文〜', vi: 'Luyện đọc N3 - Báo và văn bản thông tin' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: '伝統・文化の説明文（日本の年中行事・伝統文化）',
      titleTranslation: 'Văn bản thông tin về truyền thống và văn hóa (lễ hội hàng năm, văn hóa truyền thống Nhật)',
      introduction: `日本の年中行事や伝統文化に関する説明文は、N3の読解問題でよく出題されます。また、介護施設では年間を通じて様々な行事が行われており、その文化的背景を理解することは、利用者との会話にも役立ちます。

Văn bản thông tin về lễ hội hàng năm và văn hóa truyền thống Nhật Bản thường xuất hiện trong đọc hiểu N3. Ngoài ra, tại cơ sở điều dưỡng có nhiều sự kiện quanh năm, hiểu bối cảnh văn hóa cũng hữu ích cho trò chuyện với người dùng.`,
      keyPoints: [
        '行事の説明：〜という行事がある・〜が行われる・〜を祝う',
        '由来の説明：〜に由来する・〜が起源とされる・〜という意味がある',
        '慣習の表現：〜する習慣がある・〜を食べる風習がある',
        '変化の表現：近年では〜・現代では〜・かつては〜',
        '伝統と現代の対比：昔は〜だったが、今では〜',
        '地域差の表現：地域によって〜・〜の場合もある',
      ],
      vocabulary: [
        { word: '年中行事', reading: 'ねんじゅうぎょうじ', meaning: '毎年行われる行事・祭り（lễ hội hàng năm）', example: '正月・お盆・七五三などの年中行事がある' },
        { word: '風物詩', reading: 'ふうぶつし', meaning: '季節を感じさせるもの（biểu tượng theo mùa）', example: '花見は春の風物詩だ' },
        { word: '先祖', reading: 'せんぞ', meaning: 'ご先祖様・祖先（tổ tiên）', example: 'お盆は先祖の霊を迎える行事だ' },
        { word: '節句', reading: 'せっく', meaning: '季節の節目の行事（lễ tiết）', example: '3月3日は桃の節句（ひな祭り）だ' },
        { word: '縁起', reading: 'えんぎ', meaning: '良し悪しの前兆（điềm may mắn）', example: '正月に鏡餅を飾るのは縁起が良いとされる' },
      ],
      examples: [
        { japanese: 'お盆は毎年8月に行われる日本の伝統行事で、先祖の霊が家に戻ってくると信じられている。多くの介護施設でも盆踊りなどの行事が開催される。', reading: 'おぼんはまいとし8がつにおこなわれるにほんのでんとうぎょうじで、せんぞのたましいがいえにもどってくるとしんじられている。おおくのかいごしせつでもぼんおどりなどのぎょうじがかいさいされる。', translation: 'Obon là lễ hội truyền thống Nhật Bản tổ chức hàng năm vào tháng 8, được tin rằng linh hồn tổ tiên sẽ trở về nhà. Nhiều cơ sở điều dưỡng cũng tổ chức các sự kiện như múa Bon.' },
        { japanese: '節分は2月に行われる行事で、「福は内、鬼は外」と言いながら豆をまく風習がある。近年では恵方巻きを食べる習慣も全国に広まった。', reading: 'せつぶんは2がつにおこなわれるぎょうじで、「ふくはうち、おにはそと」といいながらまめをまくふうしゅうがある。きんねんではえほうまきをたべるしゅうかんもぜんこくにひろまった。', translation: 'Setsubun là lễ hội tổ chức vào tháng 2, có phong tục ném đậu miệng đọc "phúc vào nhà, quỷ ra ngoài". Gần đây thói quen ăn Ehoumaki cũng lan rộng khắp cả nước.' },
      ],
      grammarNote: `【伝統・文化の説明文でよく使う表現】
■ 行事・習慣の説明：
・〜という行事がある（có lễ hội gọi là〜）
・〜が行われる（〜được tổ chức）
・〜する習慣がある（có thói quen〜）
・〜を食べる風習がある（có phong tục ăn〜）

■ 由来の説明：
・〜に由来する（có nguồn gốc từ〜）
・〜が起源とされる（được coi là xuất phát từ〜）
・〜という意味がある（có nghĩa là〜）

■ 変化・普及：
・近年では〜（gần đây〜）
・現代では〜（trong thời hiện đại〜）
・全国に広まった（lan rộng khắp cả nước）`,
      quiz: {
        question: '「お盆は先祖の霊を迎える行事だ」における「迎える」の意味として最も適切なものは？',
        options: [
          { id: 'a', text: '先祖の霊を追い払う' },
          { id: 'b', text: '先祖の霊を歓迎して受け入れる' },
          { id: 'c', text: '先祖の霊を探す' },
          { id: 'd', text: '先祖の霊と戦う' },
        ],
        correctId: 'b',
        explanation: '「迎える」は「来た人・ものを受け入れる・歓迎する」という意味です。お盆では先祖の霊が家に帰ってくると考えられており、それを歓迎する行事です。\n"迎える" có nghĩa là "chào đón, tiếp nhận người/vật đến". Obon là lễ hội chào đón linh hồn tổ tiên trở về nhà.',
      },
      xpReward: 30,
    },
  },

  'n3-02-17': {
    courseTitle: { ja: 'N3 読解練習 〜新聞・説明文〜', vi: 'Luyện đọc N3 - Báo và văn bản thông tin' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: '環境・自然に関する記事（環境問題・エネルギー）',
      titleTranslation: 'Bài báo về môi trường và thiên nhiên (vấn đề môi trường, năng lượng)',
      introduction: `環境問題やエネルギーに関する記事は、N3の読解問題でも扱われることがあります。気候変動・再生可能エネルギー・廃棄物問題などのテーマで使われる特有の表現を学びましょう。また、介護・医療施設の環境への取り組みを紹介する記事も増えています。

Bài báo về vấn đề môi trường và năng lượng đôi khi cũng xuất hiện trong đọc hiểu N3. Hãy học các biểu đạt đặc thù trong chủ đề biến đổi khí hậu, năng lượng tái tạo, vấn đề rác thải. Ngoài ra, bài viết giới thiệu nỗ lực bảo vệ môi trường của cơ sở điều dưỡng/y tế cũng ngày càng nhiều.`,
      keyPoints: [
        '環境問題の表現：〜が深刻化する・〜に悪影響を与える・〜が懸念される',
        '対策の表現：〜を削減する・〜を促進する・〜に取り組む',
        '数値・目標の表現：〜%削減を目指す・〜年までに〜を達成する',
        '原因・影響：〜が原因で・〜の影響により・〜をもたらす',
        '国際的な文脈：〜条約・〜目標・〜に向けた取り組み',
        '施設での取り組み：省エネ・ゴミ分別・再生可能エネルギー',
      ],
      vocabulary: [
        { word: '排出', reading: 'はいしゅつ', meaning: '外に出すこと（thải ra）', example: '温室効果ガスの排出を削減する' },
        { word: '削減', reading: 'さくげん', meaning: '量を減らすこと（cắt giảm）', example: 'CO2排出量の削減が求められる' },
        { word: '再生可能', reading: 'さいせいかのう', meaning: '繰り返し使えるエネルギー源（tái tạo được）', example: '再生可能エネルギーの普及が進む' },
        { word: '持続可能', reading: 'じぞくかのう', meaning: '長期間続けられる（bền vững）', example: '持続可能な社会の実現を目指す' },
        { word: '廃棄物', reading: 'はいきぶつ', meaning: 'ゴミ・廃棄するもの（chất thải, rác）', example: '医療廃棄物の適切な処理が義務付けられている' },
      ],
      examples: [
        { japanese: '地球温暖化の影響により、日本でも異常気象が増加している。政府は2050年までにカーボンニュートラルを達成することを目標に掲げている。', reading: 'ちきゅうおんだんかのえいきょうにより、にほんでもいじょうきしょうがぞうかしている。せいふは2050ねんまでにカーボンニュートラルをたっせいすることをもくひょうにかかげている。', translation: 'Do ảnh hưởng của ấm lên toàn cầu, thời tiết bất thường cũng đang tăng ở Nhật Bản. Chính phủ đặt mục tiêu đạt trung hòa carbon vào năm 2050.' },
        { japanese: 'ある介護施設では、太陽光パネルを設置して電力の一部を再生可能エネルギーでまかなうことで、環境への負荷を減らす取り組みを始めた。', reading: 'あるかいごしせつでは、たいようこうパネルをせっちしてでんりょくのいちぶをさいせいかのうエネルギーでまかなうことで、かんきょうへのふかをへらすとりくみをはじめた。', translation: 'Một cơ sở điều dưỡng đã bắt đầu nỗ lực giảm tác động đến môi trường bằng cách lắp đặt tấm pin mặt trời để cung cấp một phần điện năng từ năng lượng tái tạo.' },
      ],
      grammarNote: `【環境記事の表現まとめ】
■ 問題の深刻さ：
・〜が深刻化している（đang trở nên nghiêm trọng）
・〜が懸念される（đáng lo ngại về〜）
・〜に悪影響を与える（gây ảnh hưởng xấu đến〜）

■ 目標・取り組み：
・〜%削減を目指す（hướng tới cắt giảm〜%）
・〜に取り組む（nỗ lực về〜）
・〜を推進する（thúc đẩy〜）
・〜年までに〜を達成する（đạt được〜 vào năm〜）

■ SDGs関連表現：
・持続可能な発展（phát triển bền vững）
・環境に配慮した（có ý thức về môi trường）`,
      quiz: {
        question: '「2050年までにカーボンニュートラルを達成することを目標に掲げている」の「目標に掲げる」の意味は？',
        options: [
          { id: 'a', text: '目標をあきらめること' },
          { id: 'b', text: '目標として公式に宣言・設定すること' },
          { id: 'c', text: '目標をすでに達成したこと' },
          { id: 'd', text: '目標を秘密にすること' },
        ],
        correctId: 'b',
        explanation: '「目標に掲げる」は「目標として公式に設定し、発表すること」を意味します。特に政府や組織が公式な方針・目標を宣言する際によく使われます。\n"目標に掲げる" có nghĩa là "chính thức đặt ra và tuyên bố mục tiêu", thường dùng khi chính phủ hay tổ chức tuyên bố phương hướng chính thức.',
      },
      xpReward: 30,
    },
  },

  'n3-02-18': {
    courseTitle: { ja: 'N3 読解練習 〜新聞・説明文〜', vi: 'Luyện đọc N3 - Báo và văn bản thông tin' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: '長文読解①（中程度の新聞記事 - 高齢化問題）',
      titleTranslation: 'Đọc hiểu văn dài ① (bài báo trung bình - vấn đề già hóa)',
      introduction: `これまで学んだ読解スキル（接続詞・指示語・主張と根拠・比較対比）を使って、実際の新聞記事スタイルの長文を読んでみましょう。高齢化問題をテーマにした記事を通じて、段落ごとの役割を確認しながら読む練習をします。

Hãy dùng các kỹ năng đọc hiểu đã học (liên từ, từ chỉ định, luận điểm và căn cứ, so sánh đối chiếu) để đọc văn dài theo phong cách bài báo thực tế. Luyện đọc bài về chủ đề già hóa dân số, vừa đọc vừa xác nhận vai trò từng đoạn văn.`,
      keyPoints: [
        '長文は段落ごとに役割がある：問題提起・説明・具体例・主張',
        '各段落の最初の文（トピックセンテンス）を優先して読む',
        '接続詞で論理の流れを確認しながら読む',
        '指示語が出たら前の文に戻って確認する',
        '問いに答えるときは該当段落を特定してから読む',
        '全部を完全に理解しようとせず、問われている部分に集中する',
      ],
      vocabulary: [
        { word: '高齢化社会', reading: 'こうれいかしゃかい', meaning: '高齢者の割合が高い社会（xã hội già hóa）', example: '日本は世界有数の高齢化社会だ' },
        { word: '要介護', reading: 'ようかいご', meaning: '介護が必要な状態（cần chăm sóc）', example: '要介護状態になるリスクを減らす' },
        { word: '財政', reading: 'ざいせい', meaning: '国や自治体のお金の管理（tài chính công）', example: '介護保険の財政が逼迫している' },
        { word: '担う', reading: 'になう', meaning: '役割を持つ・支える（gánh vác, đảm nhận）', example: '地域が高齢者を支える役割を担う' },
        { word: '逼迫', reading: 'ひっぱく', meaning: '余裕がなく切迫した状態（khủng hoảng, căng thẳng）', example: '介護施設の定員が逼迫している' },
      ],
      examples: [
        {
          japanese: `【読解文】
日本の総人口に占める65歳以上の割合は、2023年時点で約29%に達しており、これは世界最高水準である。高齢化の進行に伴い、要介護者の数も増加の一途をたどっており、介護保険制度の財政的な持続可能性が課題となっている。

こうした状況の中、政府は介護人材の確保と介護予防の強化を両輪として政策を進めている。一方で、テクノロジーの活用による介護の効率化も注目されており、介護ロボットやICTを用いたサービスの普及が期待されている。`,
          reading: 'にほんのそうじんこうにしめる65さいいじょうのわりあいは、2023ねんじてんでやく29%にたっしており、これはせかいさいこうすいじゅんである。こうれいかのしんこうにともない、ようかいごしゃのかずもぞうかのいっとをたどっており、かいごほけんせいどのざいせいてきなじぞくかのうせいがかだいとなっている。',
          translation: '[Văn đọc] Tỷ lệ người từ 65 tuổi trở lên trong tổng dân số Nhật Bản tính đến năm 2023 đạt khoảng 29%, đây là mức cao nhất thế giới. Cùng với sự tiến triển của già hóa, số người cần chăm sóc ngày càng tăng, tính bền vững về tài chính của chế độ bảo hiểm điều dưỡng trở thành thách thức. Trong tình huống này, chính phủ đang thúc đẩy chính sách song song giữa đảm bảo nhân lực điều dưỡng và tăng cường phòng ngừa cần chăm sóc. Mặt khác, hiệu quả hóa điều dưỡng nhờ ứng dụng công nghệ cũng được chú ý, kỳ vọng vào việc phổ biến robot điều dưỡng và dịch vụ sử dụng ICT.'
        },
      ],
      grammarNote: `【長文読解の戦略】
Step 1: 見出し・タイトルを読んでテーマを把握
Step 2: 各段落の最初の文を読んで全体像をつかむ
Step 3: 設問を確認してから、関係する段落を精読
Step 4: 指示語・接続詞を手がかりに論理を追う
Step 5: 選択肢を本文と照合して正解を選ぶ

【よく出る設問タイプ / Dạng câu hỏi thường gặp】
・「〜とはどういうことか」= 言い換え問題
・「なぜ〜か」= 理由を本文から探す
・「〜について、筆者の考えは」= 主張を探す
・「〜に当てはまる内容は」= 指示語・代名詞問題`,
      quiz: {
        question: '上の読解文で、日本政府が進めている政策として述べられているものはどれですか？',
        options: [
          { id: 'a', text: '介護保険制度の廃止と新制度の導入' },
          { id: 'b', text: '介護人材の確保と介護予防の強化' },
          { id: 'c', text: '高齢者の労働参加の義務化' },
          { id: 'd', text: '外国人介護士の受け入れ禁止' },
        ],
        correctId: 'b',
        explanation: '第2段落に「政府は介護人材の確保と介護予防の強化を両輪として政策を進めている」と明記されています。本文に直接書かれている内容を正確に読み取ることが大切です。\nĐoạn 2 ghi rõ "chính phủ đang thúc đẩy chính sách song song giữa đảm bảo nhân lực điều dưỡng và tăng cường phòng ngừa". Quan trọng là đọc chính xác nội dung được viết trực tiếp trong bài.',
      },
      xpReward: 30,
    },
  },

  'n3-02-19': {
    courseTitle: { ja: 'N3 読解練習 〜新聞・説明文〜', vi: 'Luyện đọc N3 - Báo và văn bản thông tin' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: '長文読解②（説明文 - 外国人介護士）',
      titleTranslation: 'Đọc hiểu văn dài ② (văn thông tin - điều dưỡng nước ngoài)',
      introduction: `今回は外国人介護士をテーマにした説明文の長文読解を練習します。この話題はベトナム人学習者にとって特に身近なテーマです。文章全体の主旨をつかみながら、細かい情報も正確に読み取る練習をしましょう。

Lần này luyện đọc hiểu văn dài với chủ đề điều dưỡng nước ngoài. Chủ đề này đặc biệt gần gũi với người học Việt Nam. Hãy luyện vừa nắm ý chính toàn bài vừa đọc chính xác các thông tin chi tiết.`,
      keyPoints: [
        '全体の主旨（テーマ・結論）を先に把握する',
        '具体例や数値は根拠として筆者の主張を支えている',
        '「〜によると」で始まる文は情報源の明示',
        '逆接の接続詞（しかし・一方）の後に重要な内容が続く',
        '最終段落に筆者の意見・提言がまとめられることが多い',
        '選択肢は「言い過ぎ」「逆の内容」「本文にない内容」を除外する',
      ],
      vocabulary: [
        { word: '在留資格', reading: 'ざいりゅうしかく', meaning: '外国人が日本に滞在できる資格（tư cách lưu trú）', example: '介護の在留資格で日本に来た' },
        { word: '技能実習', reading: 'ぎのうじっしゅう', meaning: '技術を学ぶための実習制度（thực tập kỹ năng）', example: '技能実習生として介護を学ぶ' },
        { word: '特定技能', reading: 'とくていぎのう', meaning: '一定の技能がある外国人の在留資格（kỹ năng đặc định）', example: '特定技能1号で介護施設に就職した' },
        { word: '定着率', reading: 'ていちゃくりつ', meaning: '離職せずに定着している割合（tỷ lệ duy trì, tỷ lệ ổn định）', example: '外国人介護士の定着率向上が課題だ' },
        { word: '養成', reading: 'ようせい', meaning: '育てること・育成（đào tạo, bồi dưỡng）', example: '介護人材の養成に力を入れる' },
      ],
      examples: [
        {
          japanese: `【読解文】
近年、日本の介護現場では外国人介護士の存在が欠かせないものになっている。厚生労働省のデータによると、現在約3万人の外国人が介護分野で働いており、その数は年々増加している。出身国はフィリピン・インドネシア・ベトナムが多く、技能実習や特定技能などの在留資格で来日している。

しかし、外国人介護士の定着に向けては様々な課題がある。日本語の専門用語や文書の読み書きへの対応、文化・習慣の違いへの理解、そしてキャリアパスの整備が主な課題として挙げられる。一方、外国人介護士を積極的に受け入れ、日本語研修や生活サポートを充実させることで、高い定着率を実現している施設もある。

以上のことから、外国人介護士が長期的に活躍できる環境の整備こそが、日本の介護現場の持続可能性を高める鍵だと言えるだろう。`,
          reading: 'きんねん、にほんのかいごげんばではがいこくじんかいごしのそんざいがかかせないものになっている。こうせいろうどうしょうのデータによると、げんざいやく3まんにんのがいこくじんがかいごぶんやではたらいており、そのかずはねんねんぞうかしている。',
          translation: '[Văn đọc] Gần đây, sự hiện diện của điều dưỡng nước ngoài đã trở nên không thể thiếu tại hiện trường điều dưỡng Nhật Bản. Theo dữ liệu của Bộ Lao động, hiện có khoảng 30.000 người nước ngoài làm việc trong lĩnh vực điều dưỡng, con số này tăng hàng năm. Phần lớn đến từ Philippines, Indonesia, Việt Nam, sang Nhật theo tư cách thực tập kỹ năng hoặc kỹ năng đặc định. Tuy nhiên, có nhiều thách thức trong việc giữ chân điều dưỡng nước ngoài: thuật ngữ chuyên môn tiếng Nhật, đọc viết tài liệu, hiểu biết về văn hóa phong tục, và xây dựng lộ trình sự nghiệp là các thách thức chính. Mặt khác, cũng có cơ sở tích cực tiếp nhận điều dưỡng nước ngoài, đào tạo tiếng Nhật và hỗ trợ cuộc sống đầy đủ, đạt tỷ lệ duy trì cao. Từ những điều trên, có thể nói rằng xây dựng môi trường để điều dưỡng nước ngoài hoạt động lâu dài chính là chìa khóa nâng cao tính bền vững của hiện trường điều dưỡng Nhật Bản.'
        },
      ],
      grammarNote: `【長文読解②のポイント】
■ 情報の整理：
・「〜によると」= 情報源を確認する
・具体的な数字は裏付けとして使われる
・「出身国は〜が多く」= 複数の例を列挙

■ 問題提起と解決策：
・「しかし〜課題がある」= 問題点を示す
・「一方、〜ている施設もある」= 解決例を示す
・「以上のことから〜だろう」= 筆者の結論

【選択肢を絞る方法 / Cách loại đáp án】
× 言い過ぎ（すべて・必ず など）
× 本文にない情報
× 本文と逆の内容
○ 本文の言い換え・要約`,
      quiz: {
        question: '上の読解文で、外国人介護士の定着に向けての「課題」として挙げられていないものは？',
        options: [
          { id: 'a', text: '日本語の専門用語への対応' },
          { id: 'b', text: '文化・習慣の違いへの理解' },
          { id: 'c', text: '出身国の違いによる言語の多様性' },
          { id: 'd', text: 'キャリアパスの整備' },
        ],
        correctId: 'c',
        explanation: '本文では「日本語の専門用語・文書への対応」「文化・習慣の違い」「キャリアパスの整備」が課題として挙げられていますが、「出身国の違いによる言語の多様性」は本文に記載されていません。\nBài không đề cập "sự đa dạng ngôn ngữ do khác quốc gia xuất thân" là thách thức. Cần chọn nội dung không có trong bài.',
      },
      xpReward: 30,
    },
  },

  'n3-02-20': {
    courseTitle: { ja: 'N3 読解練習 〜新聞・説明文〜', vi: 'Luyện đọc N3 - Báo và văn bản thông tin' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: '総復習テスト（N3読解力の確認）',
      titleTranslation: 'Bài kiểm tra tổng ôn tập (xác nhận năng lực đọc hiểu N3)',
      introduction: `このレッスンはコース全体の総復習です。新聞記事の構造・指示語・接続詞・筆者の主張・比較対比・数字の読み方・原因と結果・条件と例外など、これまで学んだすべての読解スキルを確認しましょう。

Bài học này là tổng ôn tập toàn bộ khóa học. Hãy xác nhận tất cả kỹ năng đọc hiểu đã học: cấu trúc bài báo, từ chỉ định, liên từ, luận điểm tác giả, so sánh đối chiếu, đọc số liệu, nguyên nhân và kết quả, điều kiện và ngoại lệ.`,
      keyPoints: [
        '【復習①】見出し・リード文・逆ピラミッド構造を意識して読む',
        '【復習②】指示語（この・その・これ・それ）の対象を前の文から特定する',
        '【復習③】接続詞（逆接・順接・換言）で論理の流れを追う',
        '【復習④】「なぜなら〜からだ」「〜べきだ」で筆者の主張と根拠を見つける',
        '【復習⑤】数字・割合（〜割・前年比・〜倍）を正確に読む',
        '【復習⑥】「ただし・〜を除いて・〜の場合」で条件・例外を見落とさない',
      ],
      vocabulary: [
        { word: '概要', reading: 'がいよう', meaning: '全体のあらまし（tổng quan, tóm lược）', example: '記事の概要を素早くつかむ' },
        { word: '論旨', reading: 'ろんし', meaning: '論文・文章の主旨（luận điểm chính）', example: '筆者の論旨を正確に読み取る' },
        { word: '裏付け', reading: 'うらづけ', meaning: '証拠・根拠（bằng chứng, căn cứ）', example: 'データが主張の裏付けになっている' },
        { word: '要約', reading: 'ようやく', meaning: '短くまとめること（tóm tắt）', example: '記事を3文で要約する練習をする' },
        { word: '読解力', reading: 'どっかいりょく', meaning: '文章を理解する能力（năng lực đọc hiểu）', example: '読解力を高めるには多読が効果的だ' },
      ],
      examples: [
        { japanese: '【総復習問題文】日本の介護保険制度は2000年に創設された。制度開始から20年以上が経過した現在、利用者数は当初の約3倍に増加し、給付費も急増している。その一方で、介護を支える人材の不足は深刻であり、政府・民間・地域が連携して解決策を模索している。', reading: 'にほんのかいごほけんせいどは2000ねんにそうせつされた。せいどかいしから20ねんいじょうがけいかしたげんざい、りようしゃすうはとうしょのやく3ばいにぞうかし、きゅうふひもきゅうぞうしている。そのいっぽうで、かいごをささえるじんざいのふそくはしんこくであり、せいふ・みんかん・ちいきがれんけいしてかいけつさくをもさくしている。', translation: '[Bài ôn tổng hợp] Chế độ bảo hiểm điều dưỡng Nhật Bản được thành lập năm 2000. Hiện nay hơn 20 năm kể từ khi bắt đầu, số người sử dụng tăng khoảng gấp 3 lần ban đầu, chi phí trợ cấp cũng tăng mạnh. Mặt khác, tình trạng thiếu nhân lực hỗ trợ điều dưỡng rất nghiêm trọng, chính phủ, tư nhân và cộng đồng đang phối hợp tìm kiếm giải pháp.' },
        { japanese: '【指示語問題】「制度開始から20年以上が経過した現在、利用者数は当初の約3倍に増加した。その一方で、介護を支える人材の不足は深刻だ。」「その一方で」の「その」は何を指しますか？', reading: 'せいどかいしから20ねんいじょうがけいかしたげんざい、りようしゃすうはとうしょのやく3ばいにぞうかした。そのいっぽうで、かいごをささえるじんざいのふそくはしんこくだ。', translation: '[Bài tập từ chỉ định] "Hiện nay hơn 20 năm kể từ khi bắt đầu, số người sử dụng tăng khoảng gấp 3 lần ban đầu. Mặt khác, thiếu nhân lực hỗ trợ điều dưỡng rất nghiêm trọng." "その" trong "その一方で" chỉ điều gì?' },
      ],
      grammarNote: `【N3読解 総復習チェックリスト】
□ 記事の構造（見出し→リード文→本文）を意識できる
□ 指示語（この・その・これ・それ）の指示対象を特定できる
□ 接続詞の種類（逆接・順接・換言・添加）を判断できる
□ 筆者の主張を示す表現（〜べきだ・〜ではないか）を見つけられる
□ 比較・対比の表現（〜に対して・〜一方）を理解できる
□ 数字・割合（〜割・前年比・〜倍）を正確に読める
□ 原因（〜ため・なぜなら）と結果（その結果・したがって）を区別できる
□ 条件・例外（ただし・〜の場合・〜を除いて）を見落とさない

【Danh sách kiểm tra N3 đọc hiểu tổng ôn】
□ Ý thức cấu trúc bài (tiêu đề→dẫn→thân bài)
□ Xác định đối tượng từ chỉ định
□ Phân biệt loại liên từ (nghịch tiếp, thuận tiếp, diễn đạt lại, bổ sung)
□ Tìm biểu đạt luận điểm tác giả
□ Hiểu biểu đạt so sánh đối chiếu
□ Đọc chính xác số liệu và tỷ lệ
□ Phân biệt nguyên nhân và kết quả
□ Không bỏ sót điều kiện và ngoại lệ`,
      quiz: {
        question: '「利用者数は当初の約3倍に増加し、給付費も急増している。その一方で、人材の不足は深刻だ。」「その一方で」はどのような関係を示していますか？',
        options: [
          { id: 'a', text: '前の内容の理由を示している' },
          { id: 'b', text: '前の内容に反対のこと・対照的な事実を加えている' },
          { id: 'c', text: '前の内容をくわしく説明している' },
          { id: 'd', text: '前の内容の結果を示している' },
        ],
        correctId: 'b',
        explanation: '「その一方で」は対比・逆接の接続詞で、前の内容（利用者数・給付費の増加）に対して、反対・対照的な事実（人材不足）を加えています。このコースで学んだ接続詞の使い方の総確認問題です。\n"その一方で" là liên từ đối chiếu/nghịch tiếp, thêm sự thật ngược lại (thiếu nhân lực) so với nội dung trước (số người dùng và chi phí tăng). Đây là câu hỏi ôn tập tổng hợp về cách dùng liên từ đã học trong khóa.',
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

  // ===== N3 聴解・速読 L2〜L7 =====
  'n3-03-2': {
    courseTitle: { ja: 'N3 聴解・速読トレーニング', vi: 'Luyện nghe & đọc nhanh N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3聴解: 電話・アナウンスを聞く',
      titleTranslation: 'Nghe hiểu N3: Điện thoại và thông báo',
      introduction: `N3の聴解には電話の会話や施設内アナウンスが多く出ます。電話では「折り返す・保留・不在」などの定型表現、アナウンスでは「いつ・どこで・誰が・何を」の情報を素早く聞き取る力が求められます。介護施設での電話応対は特に重要なスキルです。

Trong nghe hiểu N3 có nhiều hội thoại điện thoại và thông báo trong cơ sở. Điện thoại cần nắm các mẫu câu cố định như "gọi lại / giữ máy / vắng mặt". Thông báo cần nghe nhanh "khi nào / ở đâu / ai / làm gì".`,
      keyPoints: [
        '電話の基本：「はい、〇〇でございます」「少々お待ちください」「折り返しご連絡します」',
        'アナウンス聴解：時間・場所・対象者・内容を素早くメモ',
        '不在の表現：「ただいま席を外しております」「外出中でございます」',
        '伝言依頼：「伝言をお願いできますか」「〜とお伝えください」',
        '数字の聞き取り：電話番号・時刻・部屋番号は繰り返し確認',
      ],
      vocabulary: [
        { word: '折り返す', reading: 'おりかえす', meaning: '電話を掛け直す（gọi lại）', example: '折り返しご連絡いたします' },
        { word: '保留', reading: 'ほりゅう', meaning: '電話を一時止める（giữ máy）', example: '少々保留にしてください' },
        { word: '伝言', reading: 'でんごん', meaning: 'メッセージを伝える（nhắn tin）', example: '伝言をお願いします' },
        { word: '不在', reading: 'ふざい', meaning: 'その場にいない（vắng mặt）', example: '田中は只今不在です' },
        { word: 'アナウンス', reading: 'あなうんす', meaning: '放送・案内（thông báo）', example: '施設内アナウンスが流れた' },
      ],
      dialogue: [
        { speaker: 'A（外部）', japanese: 'もしもし、山田介護センターでしょうか。', reading: 'もしもし、やまだかいごせんたーでしょうか。', translation: 'A-lô, đây có phải Trung tâm điều dưỡng Yamada không ạ?' },
        { speaker: 'B（施設スタッフ）', japanese: 'はい、山田介護センターでございます。', reading: 'はい、やまだかいごせんたーでございます。', translation: 'Vâng, đây là Trung tâm điều dưỡng Yamada ạ.' },
        { speaker: 'A', japanese: '鈴木さんをお願いできますか。', reading: 'すずきさんをおねがいできますか。', translation: 'Tôi xin gặp bà Suzuki được không ạ?' },
        { speaker: 'B', japanese: '鈴木はただいま席を外しております。折り返しご連絡いたしましょうか。', reading: 'すずきはただいませきをはずしております。おりかえしごれんらくいたしましょうか。', translation: 'Bà Suzuki hiện không có mặt ở bàn. Tôi sẽ nhờ gọi lại cho quý khách có được không ạ?' },
      ],
      examples: [
        { japanese: '施設内放送：「入浴の時間は14時から15時です。対象の方はリハビリ室にお集まりください。」', reading: 'しせつないほうそう：「にゅうよくのじかんは14じから15じです。たいしょうのかたはりはびりしつにおあつまりください。」', translation: 'Thông báo trong cơ sở: "Thời gian tắm từ 14h đến 15h. Những người có trong danh sách vui lòng tập trung tại phòng phục hồi chức năng."' },
        { japanese: '「田中様からお電話がありました。3時以降にお電話いただけるとのことです。」', reading: 'たなかさまからおでんわがありました。3じいこうにおでんわいただけるとのことです。', translation: '"Ông Tanaka đã gọi điện. Ông ấy nói sau 3 giờ mới có thể nghe máy."' },
      ],
      grammarNote: `【電話応対の定型フレーズ】
受ける：「はい、〇〇でございます」
取り次ぎ：「少々お待ちください」／「ただいま代わります」
不在の場合：「ただいま席を外しております」
折り返し：「折り返しご連絡いたします」
伝言受け：「ご伝言を承ります」

【アナウンスを聞くときのポイント】
① いつ（時間）② どこで（場所）③ 誰が（対象）④ 何を（内容）⑤ なぜ（理由）`,
      quizzes: [
        {
          question: '「折り返しご連絡いたします」の意味は？ / Nghĩa của "折り返しご連絡いたします" là?',
          options: [
            { id: 'a', text: '今すぐ答えます（trả lời ngay）' },
            { id: 'b', text: 'かけ直します（gọi lại）' },
            { id: 'c', text: '後で来てください（hãy đến sau）' },
            { id: 'd', text: '電話を切ります（cúp máy）' },
          ],
          correctId: 'b',
          explanation: '「折り返す」は「電話をかけ直す」という意味。相手が電話に出られないときに「後でかけ直します」と伝える丁寧な表現です。',
          difficulty: 'medium' as const,
        },
        {
          question: '「ただいま席を外しております」はどういう状況？',
          options: [
            { id: 'a', text: '電話に出られない（không nghe được máy）' },
            { id: 'b', text: '退勤した（đã về）' },
            { id: 'c', text: '休暇中（đang nghỉ）' },
            { id: 'd', text: '電話中（đang gọi điện）' },
          ],
          correctId: 'a',
          explanation: '「席を外す」は一時的にその場を離れている状態。「ただいま」は「今現在」という意味で、「今は席にいません」と伝える表現です。',
          difficulty: 'medium' as const,
        },
        {
          question: 'アナウンスを聞くとき、最初に確認すべきことは？',
          options: [
            { id: 'a', text: '話者の名前' },
            { id: 'b', text: 'いつ・どこで・誰が・何を' },
            { id: 'c', text: '天気' },
            { id: 'd', text: '話の感想' },
          ],
          correctId: 'b',
          explanation: 'アナウンスは「5W1H（いつ・どこで・誰が・何を・なぜ・どのように）」を素早く把握することが重要です。',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 25,
    },
  },

  'n3-03-3': {
    courseTitle: { ja: 'N3 聴解・速読トレーニング', vi: 'Luyện nghe & đọc nhanh N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3聴解: 申し送り・報告を正確に聞く',
      titleTranslation: 'Nghe hiểu N3: Nghe bàn giao ca và báo cáo chính xác',
      introduction: `介護・医療の現場では申し送り（bàn giao ca）と口頭報告が毎日行われます。「誰の・何の・いつ・どんな変化があったか」を正確に聞き取り、適切な対応をとることが求められます。N3レベルの聴解では、複数の情報を整理して聞く力が問われます。

Trong điều dưỡng và y tế, bàn giao ca và báo cáo miệng diễn ra hàng ngày. Cần nghe chính xác "của ai / về điều gì / khi nào / có thay đổi gì" để xử lý phù hợp. Nghe hiểu N3 đòi hỏi khả năng tổng hợp nhiều thông tin cùng lúc.`,
      keyPoints: [
        '申し送りの構成：対象者名 → 状態・変化 → 対応した内容 → 引き継ぎ事項',
        '重要語彙：血圧・体温・食欲・排泄・睡眠・転倒・拒否・訴え',
        '数値を聞く：「血圧が140/90でした」「体温が37.5度でした」',
        '変化を表す語：上昇・低下・改善・悪化・安定・不安定',
        '注意点：「〜に注意してください」「〜を確認してください」',
      ],
      vocabulary: [
        { word: '申し送り', reading: 'もうしおくり', meaning: '業務引き継ぎ（bàn giao ca）', example: '朝の申し送りで報告する' },
        { word: '訴え', reading: 'うったえ', meaning: '患者・利用者の訴え（triệu chứng than phiền）', example: '痛みの訴えがある' },
        { word: '安定', reading: 'あんてい', meaning: '状態が落ち着いている（ổn định）', example: 'バイタルは安定しています' },
        { word: '観察', reading: 'かんさつ', meaning: '注意して見る（quan sát）', example: '状態を継続観察する' },
        { word: '引き継ぎ', reading: 'ひきつぎ', meaning: '次の人に仕事を渡す（bàn giao）', example: '次の担当者に引き継ぐ' },
      ],
      dialogue: [
        { speaker: '夜勤者', japanese: '田中様ですが、夜中に2回トイレに行かれました。特に異常はありませんでした。', reading: 'たなかさまですが、よなかに2かいといれにいかれました。とくにいじょうはありませんでした。', translation: 'Về bà Tanaka, đêm qua bà đi vệ sinh 2 lần. Không có gì bất thường.' },
        { speaker: '日勤者', japanese: '分かりました。今朝のバイタルはいかがでしたか。', reading: 'わかりました。けさのばいたるはいかがでしたか。', translation: 'Tôi hiểu rồi. Dấu hiệu sinh tồn sáng nay thế nào?' },
        { speaker: '夜勤者', japanese: '血圧が少し高めで140の88でした。食欲はありましたが、量は少なめです。引き続き観察をお願いします。', reading: 'けつあつがすこしたかめで140の88でした。しょくよくはありましたが、りょうはすくなめです。ひきつづきかんさつをおねがいします。', translation: 'Huyết áp hơi cao, 140/88. Có muốn ăn nhưng ăn ít. Tiếp tục theo dõi nhé.' },
      ],
      examples: [
        { japanese: '「山田様は昨日の夕方から発熱があり、体温は38.2度です。食事は半量摂取で、水分補給を促しています。」', reading: 'やまださまはきのうのゆうがたからはつねつがあり、たいおんは38.2どです。しょくじははんりょうせっしゅで、すいぶんほきゅうをうながしています。', translation: '"Ông Yamada bị sốt từ chiều hôm qua, nhiệt độ 38.2°C. Ăn được nửa suất, đang khuyến khích bổ sung nước."' },
      ],
      grammarNote: `【申し送りでよく使う表現】
状態報告：「〜の状態が〜です」「〜に変化がありました」
数値報告：「〇〇が〜でした（体温・血圧・SpO2）」
経過報告：「〜がありましたので、〜しました」
引き継ぎ：「引き続き〜をお願いします」「特に〜に注意してください」
問題なし：「特記事項はありません」「変化なく経過しています」`,
      quizzes: [
        {
          question: '申し送りで最初に確認すべき情報は？',
          options: [
            { id: 'a', text: '天気・曜日' },
            { id: 'b', text: '対象者名と状態変化' },
            { id: 'c', text: '食事のメニュー' },
            { id: 'd', text: 'スタッフの名前' },
          ],
          correctId: 'b',
          explanation: '申し送りでは「誰の（対象者名）」「何があったか（状態変化）」「何をしたか（対応）」「何を引き継ぐか」の順に聞き取ります。',
          difficulty: 'easy' as const,
        },
        {
          question: '「バイタルは安定しています」の意味は？',
          options: [
            { id: 'a', text: '状態が悪い（tình trạng xấu）' },
            { id: 'b', text: '測定していない（chưa đo）' },
            { id: 'c', text: '状態が落ち着いている（tình trạng ổn định）' },
            { id: 'd', text: '体温が高い（nhiệt độ cao）' },
          ],
          correctId: 'c',
          explanation: '「安定」は「ổn định」の意味。「バイタルは安定しています」＝「生命兆候（dấu hiệu sinh tồn）が正常で問題ない」ということです。',
          difficulty: 'easy' as const,
        },
        {
          question: '「引き続き観察をお願いします」はどういう意味？',
          options: [
            { id: 'a', text: 'もう観察しなくていい' },
            { id: 'b', text: '今から観察を始める' },
            { id: 'c', text: '次の担当者にも続けて観察してほしい' },
            { id: 'd', text: '観察は不要' },
          ],
          correctId: 'c',
          explanation: '「引き続き」は「tiếp tục（継続して）」の意味。「引き続き観察をお願いします」＝「次の担当者も継続して状態を観察してください」というお願いです。',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 25,
    },
  },

  'n3-03-4': {
    courseTitle: { ja: 'N3 聴解・速読トレーニング', vi: 'Luyện nghe & đọc nhanh N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3聴解: 感情・意図・ニュアンスを読む',
      titleTranslation: 'Nghe hiểu N3: Đọc cảm xúc, ý định và sắc thái',
      introduction: `日本語では感情や意図が直接表現されないことが多く、声のトーン・間（ま）・言葉の選び方からニュアンスを読み取る必要があります。N3の聴解では「この人はどう感じているか」「何を伝えたいのか」を推測する問題が出ます。介護現場では利用者の「訴えの裏にある気持ち」を理解する力も必要です。

Trong tiếng Nhật, cảm xúc và ý định thường không được diễn đạt trực tiếp. Cần đọc sắc thái qua giọng điệu, khoảng lặng và cách chọn từ. Nghe hiểu N3 có câu hỏi "người này cảm thấy thế nào" hoặc "muốn truyền đạt điều gì".`,
      keyPoints: [
        '間接的な断り：「ちょっと...」「〜は難しいかもしれません」「〜ですが...」',
        '遠回しな依頼：「〜していただけると助かりますが...」「〜は可能でしょうか」',
        '不満・困惑：「〜なんですけど」「〜ているんですが...」の語尾を聞く',
        '感謝・安心：「〜ていただけて、本当に助かりました」「おかげさまで」',
        '心配・不安：「〜でなければいいですが」「〜だといいのですが」',
      ],
      vocabulary: [
        { word: 'ニュアンス', reading: 'にゅあんす', meaning: '微妙な意味の違い（sắc thái）', example: 'ニュアンスを読み取る' },
        { word: '遠回し', reading: 'とおまわし', meaning: '直接言わない（nói vòng vo）', example: '遠回しに断る' },
        { word: '本音', reading: 'ほんね', meaning: '本当の気持ち（tâm tư thật）', example: '本音を語る' },
        { word: '建前', reading: 'たてまえ', meaning: '表向きの考え（ý kiến bề ngoài）', example: '建前と本音の違い' },
        { word: '察する', reading: 'さっする', meaning: '気持ちを理解する（thấu hiểu）', example: '相手の気持ちを察する' },
      ],
      examples: [
        { japanese: '「今日の夕食なんですが、あまり食べられなくて...」→ 体調不良や食欲不振の間接的な訴え', reading: 'きょうのゆうしょくなんですが、あまりたべられなくて...', translation: '"Bữa tối hôm nay tôi không ăn được nhiều..." → Lời than phiền gián tiếp về sức khỏe hoặc chán ăn' },
        { japanese: '「〜は少し難しいかもしれませんが...」→ 断りの柔らかい表現', reading: '〜はすこしむずかしいかもしれませんが...', translation: '"... có lẽ hơi khó ạ..." → Cách từ chối nhẹ nhàng' },
      ],
      grammarNote: `【感情・ニュアンスを示す表現】
断り（gián tiếp từ chối）：
・「ちょっと...」「〜は難しいですね」「〜かどうか分かりませんが」
遠慮・遠回し（ngại ngùng）：
・「〜していただけると助かります」「〜はいかがでしょうか」
心配（lo lắng）：
・「〜でなければいいですが」「大丈夫でしょうか...」
感謝・安堵（biết ơn/nhẹ nhõm）：
・「おかげさまで」「ありがたいです」「助かりました」`,
      quizzes: [
        {
          question: '「ちょっと...」と言うとき、最も多い意図は？',
          options: [
            { id: 'a', text: '強い賛成（đồng ý mạnh mẽ）' },
            { id: 'b', text: '間接的な断りや困惑（từ chối gián tiếp）' },
            { id: 'c', text: '急いでいる（đang vội）' },
            { id: 'd', text: 'よく分からない（không hiểu）' },
          ],
          correctId: 'b',
          explanation: '日本語の「ちょっと...」は直接断るのを避ける文化的表現です。「少し難しいです・できません」という意味を遠回しに伝えています。',
          difficulty: 'medium' as const,
        },
        {
          question: '「本音」と「建前」の違いは？',
          options: [
            { id: 'a', text: '同じ意味' },
            { id: 'b', text: '本音＝本当の気持ち、建前＝表向きの意見' },
            { id: 'c', text: '本音＝嘘、建前＝真実' },
            { id: 'd', text: '関係ない言葉' },
          ],
          correctId: 'b',
          explanation: '「本音（ほんね）」は本当の気持ち・考え、「建前（たてまえ）」は人前での表向きの意見。日本語コミュニケーションを理解するうえで重要な概念です。',
          difficulty: 'hard' as const,
        },
        {
          question: '「〜ていただけると助かりますが」は何を表す？',
          options: [
            { id: 'a', text: '強い命令（ra lệnh mạnh）' },
            { id: 'b', text: '丁寧なお願い（nhờ vả lịch sự）' },
            { id: 'c', text: '断り（từ chối）' },
            { id: 'd', text: '謝罪（xin lỗi）' },
          ],
          correctId: 'b',
          explanation: '「〜ていただけると助かりますが」は「もしして（いただけたら）嬉しいです」という丁寧な依頼表現です。強制ではなくお願いのニュアンスを含みます。',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 25,
    },
  },

  'n3-03-5': {
    courseTitle: { ja: 'N3 聴解・速読トレーニング', vi: 'Luyện nghe & đọc nhanh N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3聴解: 数字・日程・スケジュールを聞く',
      titleTranslation: 'Nghe hiểu N3: Nghe số liệu, ngày tháng và lịch trình',
      introduction: `介護・医療現場では数字の正確な聴取が命に関わります。「血圧 140/90」「体温 37.5度」「食事 8割摂取」など、数値情報を素早く正確に聞き取る練習をします。また予定表・スケジュールを聞いてメモする力も重要です。

Trong điều dưỡng và y tế, nghe chính xác số liệu là vấn đề sống còn. Luyện nghe nhanh và chính xác các thông tin số như "huyết áp 140/90", "nhiệt độ 37.5°C", "ăn 80% suất ăn". Ngoài ra, khả năng nghe và ghi chú lịch trình cũng rất quan trọng.`,
      keyPoints: [
        '数字の読み方：整数・小数・分数・パーセント・比率',
        'バイタル数値：「血圧 上が〜・下が〜」「体温〜度〜分」「SpO2（サチュレーション）〜%」',
        '日程・時刻：「〜時〜分」「〜月〜日（火曜日）」「来週の〜曜日」',
        '量・程度：「約〜」「〜割（はち わり = 80%）」「半量（はんりょう）」「全量（ぜんりょう）」',
        '確認の大切さ：「〜でよろしいでしょうか」「もう一度お願いできますか」',
      ],
      vocabulary: [
        { word: '全量', reading: 'ぜんりょう', meaning: '全部食べた（ăn hết）', example: '全量摂取できました' },
        { word: '半量', reading: 'はんりょう', meaning: '半分食べた（ăn nửa）', example: '半量しか食べられなかった' },
        { word: '割', reading: 'わり', meaning: '10分の1の単位（10%)（tỷ lệ %）', example: '8割摂取（80%食べた）' },
        { word: 'サチュレーション', reading: 'さちゅれーしょん', meaning: '血中酸素飽和度（SpO2）', example: 'SpOが95%です' },
        { word: '測定', reading: 'そくてい', meaning: '数値を計る（đo đạc）', example: 'バイタルを測定する' },
      ],
      examples: [
        { japanese: '「山田さんの今朝のバイタルです。血圧は上が138、下が86。体温は36.8度。SpO2は98%でした。食事は朝食8割摂取しました。」', reading: 'やまださんのけさのばいたるです。けつあつはうえが138、したが86。たいおんは36.8ど。SpO2は98%でした。しょくじはちょうしょく8わりせっしゅしました。', translation: '"Dấu hiệu sinh tồn sáng nay của bà Yamada: Huyết áp tâm thu 138, tâm trương 86. Nhiệt độ 36.8°C. SpO2 98%. Ăn sáng được 80% suất."' },
        { japanese: '「次のケアカンファレンスは来月の15日、火曜日の午後2時から会議室Aで行います。」', reading: 'つぎのけあかんふぁれんすはらいげつの15にち、かようびのごご2じからかいぎしつAでおこないます。', translation: '"Hội nghị chăm sóc lần tới vào ngày 15 tháng sau, thứ Ba, từ 14h tại phòng họp A."' },
      ],
      grammarNote: `【数値を正確に聞き取るテクニック】
・聞こえなかったら：「もう一度おっしゃっていただけますか」
・確認する：「〜でよろしいでしょうか」「〜ということでしょうか」
・メモの取り方：「上：138 下：86 体温：36.8 SpO2：98%」

【よく使う数値表現】
8割（はちわり）= 80%
半量（はんりょう）= 約50%
全量（ぜんりょう）= 100%
微熱（びねつ）= 37〜37.9度
高熱（こうねつ）= 38度以上`,
      quizzes: [
        {
          question: '「8割摂取」はどういう意味？',
          options: [
            { id: 'a', text: '20%食べた（ăn 20%）' },
            { id: 'b', text: '80%食べた（ăn 80%）' },
            { id: 'c', text: '8回食べた（ăn 8 lần）' },
            { id: 'd', text: '全部食べた（ăn hết）' },
          ],
          correctId: 'b',
          explanation: '「〜割（わり）」は10を1とした単位。「8割」= 80%。介護記録では「8割摂取」のように食事量を記録します。',
          difficulty: 'easy' as const,
        },
        {
          question: '血圧「上が138、下が86」とは？',
          options: [
            { id: 'a', text: '収縮期138・拡張期86（tâm thu 138, tâm trương 86）' },
            { id: 'b', text: '体温138度' },
            { id: 'c', text: '心拍数138' },
            { id: 'd', text: '酸素量138%' },
          ],
          correctId: 'a',
          explanation: '血圧の「上」は収縮期血圧（tâm thu）、「下」は拡張期血圧（tâm trương）。正常値は120/80mmHg程度です。',
          difficulty: 'medium' as const,
        },
        {
          question: '聞き取れなかった数字を確認するとき、正しい表現は？',
          options: [
            { id: 'a', text: '「え？」' },
            { id: 'b', text: '「何ですか？」' },
            { id: 'c', text: '「もう一度おっしゃっていただけますか」' },
            { id: 'd', text: '「知りません」' },
          ],
          correctId: 'c',
          explanation: '「もう一度おっしゃっていただけますか」は「もう一度言っていただけますか」の丁寧な表現で、ビジネス・医療現場での適切な確認フレーズです。',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 25,
    },
  },

  'n3-03-6': {
    courseTitle: { ja: 'N3 聴解・速読トレーニング', vi: 'Luyện nghe & đọc nhanh N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3聴解: 指示・依頼・提案を聞き分ける',
      titleTranslation: 'Nghe hiểu N3: Phân biệt chỉ示, nhờ vả và đề xuất',
      introduction: `職場での指示・依頼・提案・禁止を正確に聞き分けることは、仕事上のコミュニケーションの基本です。N3レベルでは「〜てください」「〜ていただけますか」「〜したほうがいい」「〜してはいけない」など、異なる強さの指示表現を区別する力が求められます。

Phân biệt chỉ thị, nhờ vả, đề xuất và cấm đoán là nền tảng giao tiếp tại nơi làm việc. N3 yêu cầu phân biệt các mức độ chỉ thị khác nhau như 〜てください, 〜ていただけますか, 〜したほうがいい, 〜してはいけない.`,
      keyPoints: [
        '強い命令：「〜してください」「〜しなさい」「〜すること」（規則・マニュアル）',
        '丁寧な依頼：「〜していただけますか」「〜をお願いできますか」',
        '提案・アドバイス：「〜したほうがいいです」「〜てみてはどうですか」',
        '禁止：「〜してはいけません」「〜しないでください」「〜は禁止です」',
        '許可：「〜してもかまいません」「〜してもいいです」「〜は大丈夫です」',
      ],
      vocabulary: [
        { word: '指示', reading: 'しじ', meaning: '指図（chỉ thị）', example: '上司から指示を受ける' },
        { word: '依頼', reading: 'いらい', meaning: 'お願い（nhờ vả）', example: '作業を依頼する' },
        { word: '提案', reading: 'ていあん', meaning: '意見を出す（đề xuất）', example: '改善策を提案する' },
        { word: '禁止', reading: 'きんし', meaning: 'してはいけない（cấm）', example: '無断外出禁止' },
        { word: '許可', reading: 'きょか', meaning: 'してもいい（cho phép）', example: '上司の許可を得る' },
      ],
      dialogue: [
        { speaker: '上司', japanese: '鈴木さん、山田様の食事介助をお願いできますか。', reading: 'すずきさん、やまださまのしょくじかいじょをおねがいできますか。', translation: 'Bạn Suzuki, bạn có thể hỗ trợ bữa ăn cho bà Yamada không?' },
        { speaker: '鈴木', japanese: 'はい、今すぐ参ります。', reading: 'はい、いますぐまいります。', translation: 'Vâng, tôi đến ngay.' },
        { speaker: '上司', japanese: '食前に手洗いを確認してからお願いします。薬も食後に飲んでいただくことになっています。', reading: 'しょくぜんにてあらいをかくにんしてからおねがいします。くすりもしょくごにのんでいただくことになっています。', translation: 'Hãy xác nhận rửa tay trước bữa ăn nhé. Thuốc cũng phải uống sau ăn.' },
      ],
      examples: [
        { japanese: '「この廊下は濡れているので、走らないでください。転倒の危険があります。」', reading: 'このろうかはぬれているので、はしらないでください。てんとうのきけんがあります。', translation: '"Hành lang này đang ướt, vui lòng không chạy. Có nguy cơ ngã."' },
        { japanese: '「次の会議には全員参加することになっていますので、予定を調整してください。」', reading: 'つぎのかいぎにはぜんいんさんかすることになっていますので、よていをちょうせいしてください。', translation: '"Tất cả phải tham dự cuộc họp tiếp theo, vui lòng điều chỉnh lịch."' },
      ],
      grammarNote: `【指示の強さの順番（từ mạnh đến nhẹ）】
① 強制：〜しなければなりません / 〜すること（規則）
② 命令：〜してください / 〜しなさい
③ 依頼：〜していただけますか / 〜をお願いできますか
④ 提案：〜したほうがいいです / 〜てみてはどうですか
⑤ 許可：〜してもかまいません / 〜していいです

【禁止表現】
〜してはいけません / 〜しないでください / 〜は禁止です`,
      quizzes: [
        {
          question: '「〜していただけますか」は何を表す？',
          options: [
            { id: 'a', text: '強制（bắt buộc）' },
            { id: 'b', text: '禁止（cấm）' },
            { id: 'c', text: '丁寧な依頼（nhờ vả lịch sự）' },
            { id: 'd', text: '許可（cho phép）' },
          ],
          correctId: 'c',
          explanation: '「〜していただけますか」は「してもらえますか」の敬語形で、丁寧な依頼表現です。強制ではなくお願いのニュアンスを含みます。',
          difficulty: 'easy' as const,
        },
        {
          question: '「〜してはいけません」は何を表す？',
          options: [
            { id: 'a', text: '許可（cho phép）' },
            { id: 'b', text: '提案（đề xuất）' },
            { id: 'c', text: '禁止（cấm）' },
            { id: 'd', text: '依頼（nhờ vả）' },
          ],
          correctId: 'c',
          explanation: '「〜してはいけません」は禁止を表す文型で、「〜することを禁じます」と同じ意味。介護・医療現場では安全のため禁止事項が多く使われます。',
          difficulty: 'easy' as const,
        },
        {
          question: '「〜したほうがいいです」は何を表す？',
          options: [
            { id: 'a', text: '絶対にしなければならない（bắt buộc phải làm）' },
            { id: 'b', text: 'するな（đừng làm）' },
            { id: 'c', text: 'アドバイス・提案（lời khuyên）' },
            { id: 'd', text: '今すぐしてください（làm ngay）' },
          ],
          correctId: 'c',
          explanation: '「〜したほうがいいです」はアドバイス・提案の表現。強制ではなく「こうするのがよいと思います」という意味です。',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 25,
    },
  },

  'n3-03-7': {
    courseTitle: { ja: 'N3 聴解・速読トレーニング', vi: 'Luyện nghe & đọc nhanh N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3聴解: 会議・カンファレンスを聞く',
      titleTranslation: 'Nghe hiểu N3: Nghe hội họp và conference',
      introduction: `介護・医療現場では定期的にカンファレンス（ケア会議）が行われます。複数の人が発言する中で「誰が・何を・どう言ったか」を追跡する力、議題の流れと結論を把握する力が必要です。N3の聴解問題では、このような複数話者・複数情報を扱う問題が頻出します。

Trong điều dưỡng và y tế, conference（họp chăm sóc）được tổ chức định kỳ. Cần theo dõi "ai / nói gì / nói như thế nào" khi nhiều người phát biểu, đồng thời nắm được luồng nghị sự và kết luận. Dạng câu hỏi về nhiều người nói và nhiều thông tin thường xuất hiện trong N3.`,
      keyPoints: [
        '会議の構成：開会 → 議題確認 → 各自の発言 → 議論 → まとめ・決定 → 閉会',
        '議題を追う：「次の議題は〜です」「〜についてどうでしょうか」',
        '意見の表明：「私は〜と思います」「〜という観点からは」「〜の立場から言うと」',
        '同意と反対：「おっしゃる通りです」「それについては少し異なる意見があります」',
        '結論・決定：「それでは〜ということで確認しました」「次回は〜を検討します」',
      ],
      vocabulary: [
        { word: 'カンファレンス', reading: 'かんふぁれんす', meaning: '多職種会議（hội nghị đa ngành）', example: 'ケアカンファレンスに参加する' },
        { word: '議題', reading: 'ぎだい', meaning: '会議で話す内容（nghị trình）', example: '今日の議題は3つあります' },
        { word: '確認', reading: 'かくにん', meaning: '間違いないか調べる（xác nhận）', example: '内容を確認する' },
        { word: 'まとめ', reading: 'まとめ', meaning: '整理・結論（tổng kết）', example: '会議のまとめをする' },
        { word: '検討', reading: 'けんとう', meaning: 'よく考える（xem xét）', example: '改善策を検討する' },
      ],
      dialogue: [
        { speaker: '司会', japanese: 'では、本日のケアカンファレンスを始めます。本日の議題は田中様のケアプラン見直しです。', reading: 'では、ほんじつのけあかんふぁれんすをはじめます。ほんじつのぎだいはたなかさまのけあぷらんみなおしです。', translation: 'Vậy xin bắt đầu hội nghị chăm sóc hôm nay. Nghị trình hôm nay là xem xét lại kế hoạch chăm sóc của bà Tanaka.' },
        { speaker: '担当者', japanese: '田中様は最近、食欲が低下しています。食事形態を変更することを提案します。', reading: 'たなかさまはさいきん、しょくよくがていかしています。しょくじけいたいをへんこうすることをていあんします。', translation: 'Gần đây bà Tanaka giảm cảm giác ngon miệng. Tôi đề xuất thay đổi dạng thức ăn.' },
        { speaker: '栄養士', japanese: 'おっしゃる通りです。刻み食やとろみ食への変更を試してみましょう。', reading: 'おっしゃるとおりです。きざみしょくやとろみしょくへのへんこうをためしてみましょう。', translation: 'Đúng vậy. Hãy thử đổi sang dạng thức ăn thái nhỏ hoặc thức ăn sệt xem sao.' },
      ],
      examples: [
        { japanese: '「以上で本日の議題は終わりです。次回は来月第一火曜日に行います。何かご質問がある方はいらっしゃいますか。」', reading: 'いじょうでほんじつのぎだいはおわりです。じかいはらいげつだいいちかようびにおこないます。なにかごしつもんがあるかたはいらっしゃいますか。', translation: '"Vậy là đã hết nghị trình hôm nay. Lần tới vào thứ Ba đầu tiên của tháng sau. Có ai có câu hỏi không?"' },
      ],
      grammarNote: `【会議でよく使う表現】
開会：「ただいまより〇〇会議を始めます」
議題の提示：「本日の議題は〜です」「次の議題に移ります」
意見を言う：「〜と思います」「〜という意見があります」「〜についてはいかがでしょうか」
同意：「おっしゃる通りです」「賛成です」「その通りだと思います」
反対・別意見：「〜については少し異なる意見があります」「〜という点を考えると」
まとめ：「それでは〜ということに決まりました」「以上で本日の会議を終わります」`,
      quizzes: [
        {
          question: '「おっしゃる通りです」はどういう意味？',
          options: [
            { id: 'a', text: '反対します（phản đối）' },
            { id: 'b', text: '同意します（đồng ý）' },
            { id: 'c', text: '質問があります（có câu hỏi）' },
            { id: 'd', text: '分かりません（không hiểu）' },
          ],
          correctId: 'b',
          explanation: '「おっしゃる通りです」は「あなたの言ったことは正しいです・同意します」という丁寧な同意表現。「おっしゃる」は「言う」の尊敬語です。',
          difficulty: 'easy' as const,
        },
        {
          question: '会議の「議題」とは何ですか？',
          options: [
            { id: 'a', text: '会議の場所' },
            { id: 'b', text: '参加者の名前リスト' },
            { id: 'c', text: '会議で話し合う内容・テーマ' },
            { id: 'd', text: '会議の時間' },
          ],
          correctId: 'c',
          explanation: '「議題（ぎだい）」は「会議で話し合うべき内容・テーマ」のこと。「本日の議題は〜です」のように使います。',
          difficulty: 'easy' as const,
        },
        {
          question: '「それでは〜ということに決まりました」は何を表す？',
          options: [
            { id: 'a', text: '議論の開始（bắt đầu thảo luận）' },
            { id: 'b', text: '意見の発表（phát biểu ý kiến）' },
            { id: 'c', text: '会議での決定・合意（kết luận/thống nhất）' },
            { id: 'd', text: '質問（câu hỏi）' },
          ],
          correctId: 'c',
          explanation: '「〜ということに決まりました」は会議で結論が出たときの表現。「決まりました」は「đã được quyết định」という意味です。',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 25,
    },
  },

  'n3-03-8': {
    courseTitle: { ja: 'N3 聴解・速読トレーニング', vi: 'Luyện nghe & đọc nhanh N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3聴解: ニュース・施設アナウンスを聞く',
      titleTranslation: 'Nghe hiểu N3: Nghe tin tức và thông báo cơ sở',
      introduction: `日本語のニュースや施設内アナウンスは話すスピードが速く、標準語・フォーマルな語彙が使われます。「何について・何が起きたか・どのように対応するか」を短時間で把握する力が求められます。N3の聴解問題ではニュース形式の音声が出題されます。

Tin tức tiếng Nhật và thông báo cơ sở có tốc độ nói nhanh, dùng từ ngữ chuẩn và trang trọng. Cần nắm nhanh "về điều gì / điều gì đã xảy ra / cần xử lý thế nào". Câu hỏi nghe N3 có dạng âm thanh tin tức.`,
      keyPoints: [
        'ニュースの構造：見出し（headline）→ 詳細 → 背景・原因 → 今後の対応',
        '施設アナウンスの構造：対象者 → 場所 → 時間 → 内容 → お願い',
        '重要語彙：発表・報告・増加・減少・改善・悪化・対応・措置',
        'テンポ対策：最初の文が最重要情報（逆三角形構成）',
        '聞き逃した場合：前後の文脈から推測する力が必要',
      ],
      vocabulary: [
        { word: '発表', reading: 'はっぴょう', meaning: '公式に知らせる（thông báo chính thức）', example: '新しい方針が発表された' },
        { word: '措置', reading: 'そち', meaning: '対処方法（biện pháp）', example: '緊急措置をとる' },
        { word: '対応', reading: 'たいおう', meaning: '適切に処理する（ứng phó）', example: '迅速に対応する' },
        { word: '改善', reading: 'かいぜん', meaning: 'よりよくする（cải thiện）', example: '業務を改善する' },
        { word: '影響', reading: 'えいきょう', meaning: '何かに与える変化（ảnh hưởng）', example: '健康への影響が懸念される' },
      ],
      examples: [
        { japanese: '（施設アナウンス）「本日午後3時から避難訓練を実施します。利用者様は職員の誘導に従ってください。」', reading: 'ほんじつごご3じからひなんくんれんをじっしします。りようしゃさまはしょくいんのゆうどうにしたがってください。', translation: '(Thông báo cơ sở) "Hôm nay từ 15h sẽ thực hiện diễn tập sơ tán. Người dùng vui lòng làm theo hướng dẫn của nhân viên."' },
        { japanese: '（ニュース）「厚生労働省は本日、介護施設での感染対策の新しいガイドラインを発表しました。」', reading: 'こうせいろうどうしょうはほんじつ、かいごしせつでのかんせんたいさくのあたらしいがいどらいんをはっぴょうしました。', translation: '(Tin tức) "Hôm nay Bộ Y tế Lao động và Phúc lợi đã công bố hướng dẫn mới về phòng chống lây nhiễm tại cơ sở điều dưỡng."' },
      ],
      grammarNote: `【ニュース・アナウンスで使う表現】
・「〜が発表されました」：何かが公式に発表された
・「〜によりますと」：情報源（nguồn thông tin）を示す
・「〜に対して〜する」：〜に向けて対応する
・「〜を実施します」：〜を行います（sẽ tiến hành）
・「〜の方はご注意ください」：対象者へのお願い

【速読・速聴のポイント】
ニュースは「最初の一文に最重要情報」→ 最初を集中して聞く
施設アナウンスは「誰が・いつ・どこで・何を」を素早くメモ`,
      quizzes: [
        {
          question: 'ニュースを聞くとき、最初の一文が重要な理由は？',
          options: [
            { id: 'a', text: '一番長いから' },
            { id: 'b', text: '最重要情報（見出し）が含まれているから' },
            { id: 'c', text: '一番簡単だから' },
            { id: 'd', text: '繰り返されるから' },
          ],
          correctId: 'b',
          explanation: 'ニュースは「逆三角形構成」で、最初の文に最重要情報（何が起きたか）が含まれます。後半に詳細・背景が続きます。',
          difficulty: 'medium' as const,
        },
        {
          question: '施設アナウンスで最初に確認すべきことは？',
          options: [
            { id: 'a', text: '話者の声のトーン' },
            { id: 'b', text: '対象者・場所・時間・内容' },
            { id: 'c', text: '天気予報' },
            { id: 'd', text: '食事のメニュー' },
          ],
          correctId: 'b',
          explanation: '施設アナウンスは「誰に（対象者）・どこで（場所）・いつ（時間）・何を（内容）」の順で情報を整理します。',
          difficulty: 'easy' as const,
        },
        {
          question: '「〜によりますと」はどういう意味？',
          options: [
            { id: 'a', text: '〜によって変わる（thay đổi theo）' },
            { id: 'b', text: '〜の情報によると（theo thông tin từ〜）' },
            { id: 'c', text: '〜にとって（đối với〜）' },
            { id: 'd', text: '〜に依頼する（nhờ〜）' },
          ],
          correctId: 'b',
          explanation: '「〜によりますと」は情報源を示す表現で、「〜からの情報によると」という意味。ニュースで「厚生労働省によりますと」のように使われます。',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 25,
    },
  },

  'n3-03-9': {
    courseTitle: { ja: 'N3 聴解・速読トレーニング', vi: 'Luyện nghe & đọc nhanh N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3聴解: 省略・縮約形・話し言葉を聞く',
      titleTranslation: 'Nghe hiểu N3: Nghe dạng rút gọn và ngôn ngữ nói',
      introduction: `実際の会話では「〜てしまう → 〜ちゃう」「〜ている → 〜てる」「〜なければ → 〜なきゃ」など、縮約形（rút gọn）がよく使われます。聴解問題でも自然な話し言葉が出題されるため、書き言葉との対応を学ぶことが重要です。

Trong hội thoại thực tế, thường dùng dạng rút gọn như 〜てしまう→〜ちゃう, 〜ている→〜てる, 〜なければ→〜なきゃ. Câu hỏi nghe cũng dùng ngôn ngữ nói tự nhiên, nên học cách đối chiếu với văn viết là rất quan trọng.`,
      keyPoints: [
        '〜てしまう → 〜ちゃう（男女共通）/ 〜じゃう（〜でしまう）',
        '〜ている → 〜てる / 〜てます → 〜てます（略さない場合も）',
        '〜なければ → 〜なきゃ / 〜なくちゃ',
        '〜ておく → 〜とく',
        '〜てしまった → 〜ちゃった（後悔・完了）',
        '〜ではない → 〜じゃない / 〜じゃないですか（確認）',
      ],
      vocabulary: [
        { word: '縮約形', reading: 'しゅくやくけい', meaning: '短くした形（dạng rút gọn）', example: '話し言葉の縮約形' },
        { word: '省略', reading: 'しょうりゃく', meaning: '短くする（bỏ bớt）', example: '助詞を省略する' },
        { word: '話し言葉', reading: 'はなしことば', meaning: '口語（ngôn ngữ nói）', example: '話し言葉と書き言葉' },
        { word: '書き言葉', reading: 'かきことば', meaning: '文語（ngôn ngữ viết）', example: '書き言葉は丁寧' },
        { word: '自然な表現', reading: 'しぜんなひょうげん', meaning: '実際の会話で使う（cách nói tự nhiên）', example: '自然な表現を覚える' },
      ],
      examples: [
        { japanese: '書き言葉：「薬を飲んでしまいました」→ 話し言葉：「薬飲んじゃいました」', reading: 'くすりをのんでしまいました → くすりのんじゃいました', translation: 'Văn viết: "Tôi đã uống thuốc mất rồi" → Nói: "Uống thuốc mất rồi"' },
        { japanese: '書き言葉：「しなければなりません」→ 話し言葉：「しなきゃならない / しなきゃ」', reading: 'しなければなりません → しなきゃならない / しなきゃ', translation: 'Văn viết: "Phải làm" → Nói: "Phải làm / Phải thôi"' },
        { japanese: '書き言葉：「今何をしていますか」→ 話し言葉：「今何してる？」', reading: 'いまなにをしていますか → いまなにしてる？', translation: 'Văn viết: "Bây giờ bạn đang làm gì?" → Nói: "Đang làm gì?"' },
      ],
      grammarNote: `【主な縮約形・省略形一覧】
〜てしまう → 〜ちゃう（〜でしまう → 〜じゃう）
〜てしまった → 〜ちゃった（〜でしまった → 〜じゃった）
〜ている → 〜てる
〜ておく → 〜とく
〜なければ → 〜なきゃ
〜なくては → 〜なくちゃ
〜ではない → 〜じゃない
〜ということ → 〜ってこと
〜という → 〜って（引用）`,
      quizzes: [
        {
          question: '「薬飲んじゃいました」の書き言葉は？',
          options: [
            { id: 'a', text: '薬を飲んでいます（đang uống thuốc）' },
            { id: 'b', text: '薬を飲んでしまいました（đã uống thuốc mất rồi）' },
            { id: 'c', text: '薬を飲みたいです（muốn uống thuốc）' },
            { id: 'd', text: '薬を飲みました（đã uống thuốc）' },
          ],
          correctId: 'b',
          explanation: '「〜じゃいました」は「〜でしまいました」の縮約形。「飲んじゃいました」は「飲んでしまいました」で、意図せず完了したか後悔を含む表現です。',
          difficulty: 'medium' as const,
        },
        {
          question: '「しなきゃ」の書き言葉は？',
          options: [
            { id: 'a', text: 'してもいいです（có thể làm）' },
            { id: 'b', text: 'しなくてもいいです（không cần làm）' },
            { id: 'c', text: 'しなければなりません（phải làm）' },
            { id: 'd', text: 'したいです（muốn làm）' },
          ],
          correctId: 'c',
          explanation: '「しなきゃ」は「しなければ（ならない）」の縮約形。「phải làm」という義務を表します。口語では「しなきゃ」「しなきゃな」のように使います。',
          difficulty: 'easy' as const,
        },
        {
          question: '「今何してる？」の書き言葉は？',
          options: [
            { id: 'a', text: '今何をしたいですか' },
            { id: 'b', text: '今何をしていますか' },
            { id: 'c', text: '今何をしましたか' },
            { id: 'd', text: '今何をしますか' },
          ],
          correctId: 'b',
          explanation: '「〜てる」は「〜ている」の縮約形。「何してる？」は「何をしていますか？」の口語形で、現在進行形を表します。',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 25,
    },
  },

  'n3-03-10': {
    courseTitle: { ja: 'N3 聴解・速読トレーニング', vi: 'Luyện nghe & đọc nhanh N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3聴解: 情報統合・複数情報の処理',
      titleTranslation: 'Nghe hiểu N3: Tổng hợp và xử lý nhiều thông tin',
      introduction: `N3の聴解には「複数の人の発言を聞いて正しい内容を選ぶ」「会話の要点をまとめる」「話者の関係や状況を判断する」などの情報統合問題が出ます。単純な聞き取りだけでなく、複数の情報を整理・統合して正答を導く力が重要です。

N3 có dạng câu hỏi tổng hợp: nghe phát biểu của nhiều người rồi chọn đúng, tóm tắt ý chính, phán đoán mối quan hệ. Không chỉ nghe đơn giản mà cần sắp xếp và tổng hợp nhiều thông tin để tìm đáp án đúng.`,
      keyPoints: [
        '情報統合の手順：①全体を聞く → ②各情報をメモ → ③矛盾を確認 → ④正しい情報を選ぶ',
        '話者の関係を判断：敬語・口調から上下関係を読む',
        '矛盾・誤りを見つける：「AはBと言ったが、CはDと言った」',
        '時系列を整理：「まず〜、次に〜、最後に〜」',
        '条件・例外を聞き取る：「ただし〜」「〜の場合を除いて」',
      ],
      vocabulary: [
        { word: '統合', reading: 'とうごう', meaning: '複数を一つにまとめる（tổng hợp）', example: '情報を統合する' },
        { word: '矛盾', reading: 'むじゅん', meaning: '内容が合わない（mâu thuẫn）', example: '発言に矛盾がある' },
        { word: '整理', reading: 'せいり', meaning: 'きちんと並べる（sắp xếp）', example: '情報を整理する' },
        { word: '要点', reading: 'ようてん', meaning: '最も重要な点（điểm chính）', example: '要点をまとめる' },
        { word: 'まとめる', reading: 'まとめる', meaning: '整理してまとめる（tổng kết）', example: '会議の内容をまとめる' },
      ],
      dialogue: [
        { speaker: 'A', japanese: '来週の研修は月曜日の午前10時からですよね。', reading: 'らいしゅうのけんしゅうはげつようびのごぜん10じからですよね。', translation: 'Đào tạo tuần tới từ 10 giờ sáng thứ Hai phải không?' },
        { speaker: 'B', japanese: 'いいえ、月曜日じゃなくて火曜日ですよ。時間は同じ10時からです。', reading: 'いいえ、げつようびじゃなくてかようびですよ。じかんはおなじ10じからです。', translation: 'Không, không phải thứ Hai mà là thứ Ba. Giờ vẫn là 10 giờ.' },
        { speaker: 'A', japanese: 'あ、そうでしたか。場所はどこですか。', reading: 'あ、そうでしたか。ばしょはどこですか。', translation: 'À, vậy à. Địa điểm ở đâu?' },
        { speaker: 'B', japanese: '研修センターのB会議室です。', reading: 'けんしゅうせんたーのBかいぎしつです。', translation: 'Phòng họp B tại Trung tâm đào tạo.' },
      ],
      examples: [
        { japanese: 'Q: この会話から、研修は何曜日・何時・どこですか？ A: 火曜日・午前10時・研修センターB会議室', reading: 'けんしゅうはかようび・ごぜん10じ・けんしゅうせんたーBかいぎしつ', translation: 'H: Qua hội thoại, đào tạo vào thứ mấy, mấy giờ, ở đâu? Đ: Thứ Ba, 10h sáng, phòng họp B trung tâm đào tạo.' },
      ],
      grammarNote: `【情報統合問題の解き方】
Step 1: メモを取りながら聞く（ai/khi nào/ở đâu/cái gì）
Step 2: 修正情報に注意する（「〜じゃなくて〜」「〜ではなく〜」）
Step 3: 最後の確認発言を重視する（最後に訂正されることが多い）
Step 4: 選択肢と照合する

【よく出る情報訂正の表現】
「〜じゃなくて〜です」（không phải...mà là...）
「〜ではなく〜」
「〜に変更になりました」
「〜は間違いで、正しくは〜です」`,
      quizzes: [
        {
          question: 'A「月曜10時」B「月曜じゃなくて火曜10時」正しいのは？',
          options: [
            { id: 'a', text: '月曜日10時' },
            { id: 'b', text: '火曜日10時' },
            { id: 'c', text: '月曜日11時' },
            { id: 'd', text: '火曜日11時' },
          ],
          correctId: 'b',
          explanation: 'BがAの「月曜」を訂正して「火曜日」と言いました。時間「10時」はそのまま。訂正発言を優先します。',
          difficulty: 'easy' as const,
        },
        {
          question: '情報統合問題で最も重要なテクニックは？',
          options: [
            { id: 'a', text: '最初の発言だけ聞く' },
            { id: 'b', text: '訂正・修正の発言に注目する' },
            { id: 'c', text: '感情の表現を探す' },
            { id: 'd', text: '一番長い発言を選ぶ' },
          ],
          correctId: 'b',
          explanation: '情報統合問題では、最初の情報が後で訂正されることが多いです。「〜じゃなくて」「〜ではなく」「変更になりました」などの修正表現に特に注意します。',
          difficulty: 'medium' as const,
        },
        {
          question: '「〜じゃなくて〜です」はどういう役割？',
          options: [
            { id: 'a', text: '新しい情報を追加する' },
            { id: 'b', text: '間違いを訂正して正しい情報を伝える' },
            { id: 'c', text: '質問する' },
            { id: 'd', text: '感謝を述べる' },
          ],
          correctId: 'b',
          explanation: '「〜じゃなくて〜です」は「〜ではなく、正しくは〜です」という訂正表現。情報を修正するときに使います。',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 30,
    },
  },

  'n3-03-11': {
    courseTitle: { ja: 'N3 聴解・速読トレーニング', vi: 'Luyện nghe & đọc nhanh N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3速読①: スキャニング（必要情報を素早く探す）',
      titleTranslation: 'Đọc nhanh N3①: Scanning – Tìm thông tin cần thiết nhanh',
      introduction: `速読（đọc nhanh）の第一技術は「スキャニング（scanning）」です。文章全体を読まずに、必要な情報（数字・固有名詞・キーワード）だけを素早く探す方法です。N3の読解問題では時間が限られているため、スキャニングを使って設問に必要な情報を効率よく見つける練習をします。

Kỹ thuật đọc nhanh đầu tiên là "scanning" – tìm nhanh thông tin cần thiết (số liệu, danh từ riêng, từ khóa) mà không đọc toàn bộ văn bản. Trong đọc hiểu N3, thời gian có hạn nên cần luyện tìm thông tin cần thiết cho câu hỏi một cách hiệu quả.`,
      keyPoints: [
        'スキャニングとは：文章全体を読まず、特定の情報を探す技術',
        '使う場面：日時・数字・名前・場所・定義を探すとき',
        '方法：設問を先に読む → キーワードを決める → 文章でそのキーワードを探す',
        '目の動かし方：一字ずつ読まず、ブロックで視野を広げる',
        '練習法：時刻表・地図・案内文でスキャニングを練習する',
      ],
      vocabulary: [
        { word: 'スキャニング', reading: 'すきゃにんぐ', meaning: '必要情報を素早く探す読み方（scanning）', example: 'スキャニングで数字を探す' },
        { word: 'キーワード', reading: 'きーわーど', meaning: '重要な言葉（từ khóa）', example: 'キーワードを先に確認する' },
        { word: '設問', reading: 'せつもん', meaning: '試験の質問（câu hỏi đề）', example: '設問を先に読む' },
        { word: '固有名詞', reading: 'こゆうめいし', meaning: '特定の名前・地名（danh từ riêng）', example: '固有名詞を探す' },
        { word: '効率', reading: 'こうりつ', meaning: '少ない努力で多くこなす（hiệu quả）', example: '効率よく読む' },
      ],
      examples: [
        { japanese: '（練習）次の文章から「開始時刻」を探してください：「本日のケアカンファレンスは午後2時30分から第3会議室で開催されます。参加者は・・・」→ 答え：午後2時30分', reading: 'ほんじつのけあかんふぁれんすはごご2じ30ぷんからだい3かいぎしつでかいさいされます。', translation: '(Luyện tập) Tìm "giờ bắt đầu" trong đoạn văn: "Hôm nay hội nghị chăm sóc bắt đầu lúc 14h30 tại phòng họp số 3..." → Đáp án: 14h30' },
        { japanese: '（練習）「研修の締め切りはいつか」を探す：「申し込みは来月の20日（木）までにお願いします」→ 答え：来月20日（木）', reading: 'もうしこみはらいげつの20にち（もく）までにおねがいします', translation: '(Luyện tập) Tìm "hạn chót đăng ký đào tạo": "Vui lòng đăng ký trước ngày 20 tháng sau (Thứ Năm)" → Đáp án: Ngày 20 tháng sau (Thứ Năm)' },
      ],
      grammarNote: `【スキャニングの手順】
① 設問（question）を先に読む
② 探すキーワードを確認する（数字？名前？場所？）
③ 文章を「読む」のではなく「探す」
④ キーワードを見つけたらその周辺だけ精読する
⑤ 答えを選ぶ

【スキャニングが有効な設問タイプ】
・「〜はいつですか」→ 日時を探す
・「〜は誰ですか」→ 固有名詞を探す
・「〜はどこですか」→ 場所を探す
・「〜はいくらですか」→ 数字を探す`,
      quizzes: [
        {
          question: 'スキャニングとはどんな読み方？',
          options: [
            { id: 'a', text: '文章全体をゆっくり精読する' },
            { id: 'b', text: '必要な情報だけを素早く探す' },
            { id: 'c', text: '音読する' },
            { id: 'd', text: '要約を作る' },
          ],
          correctId: 'b',
          explanation: 'スキャニングは必要な情報（数字・名前・キーワード）を文章全体を読まずに素早く探す読み方です。時間効率が高い技術です。',
          difficulty: 'easy' as const,
        },
        {
          question: '設問を先に読む理由は？',
          options: [
            { id: 'a', text: '時間がないから' },
            { id: 'b', text: '何を探すか分かるから（効率よく読める）' },
            { id: 'c', text: '設問が難しいから' },
            { id: 'd', text: '文章が長いから' },
          ],
          correctId: 'b',
          explanation: '設問を先に読むことで、「何を探すべきか（日時？名前？数字？）」が分かり、文章でキーワードを効率よく探せます。',
          difficulty: 'easy' as const,
        },
        {
          question: '「締め切りはいつですか」という設問にスキャニングを使うとき、何を探す？',
          options: [
            { id: 'a', text: '感情を表す言葉' },
            { id: 'b', text: '数字・日付・期限に関する語句' },
            { id: 'c', text: '人物の名前' },
            { id: 'd', text: '場所を表す言葉' },
          ],
          correctId: 'b',
          explanation: '「締め切り・期限」の設問では、文章中の数字・日付（〜日・〜月・〜まで）に注目してスキャニングします。',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 25,
    },
  },

  'n3-03-12': {
    courseTitle: { ja: 'N3 聴解・速読トレーニング', vi: 'Luyện nghe & đọc nhanh N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3速読②: スキミング（全体の要旨を素早く把握する）',
      titleTranslation: 'Đọc nhanh N3②: Skimming – Nắm đại ý toàn bài nhanh',
      introduction: `速読の第二技術は「スキミング（skimming）」です。文章全体をざっと読んで、主題・全体の流れ・筆者の主張を素早く把握する方法です。N3の読解では「筆者が最も言いたいことは何か」「文章の目的は何か」という設問があり、スキミングが有効です。

Kỹ thuật đọc nhanh thứ hai là "skimming" – lướt qua toàn bộ văn bản để nắm nhanh chủ đề, dòng chảy tổng thể và luận điểm của tác giả. N3 có câu hỏi "tác giả muốn nói điều gì nhất" hoặc "mục đích của bài là gì", và skimming rất hiệu quả cho dạng này.`,
      keyPoints: [
        'スキミングとは：文章全体をざっと読んで要旨を把握する技術',
        '方法：①タイトル・見出しを読む ②各段落の最初の文を読む ③最後の段落を読む',
        '目の動かし方：左右に振らずに、文章の中央付近を縦に流し読み',
        '何を探すか：主題（main topic）・筆者の意見・文章の目的',
        '使う場面：「この文章は何について書かれていますか」「筆者の主張は何ですか」',
      ],
      vocabulary: [
        { word: 'スキミング', reading: 'すきみんぐ', meaning: '要旨を素早く把握する読み方（skimming）', example: 'スキミングで全体を把握する' },
        { word: '要旨', reading: 'ようし', meaning: '文章の主な内容（đại ý）', example: '文章の要旨をまとめる' },
        { word: '主張', reading: 'しゅちょう', meaning: '筆者の言いたいこと（luận điểm）', example: '筆者の主張を把握する' },
        { word: '段落', reading: 'だんらく', meaning: '文章の区切り（đoạn văn）', example: '各段落の要点を読む' },
        { word: '把握', reading: 'はあく', meaning: '理解・認識する（nắm bắt）', example: '全体の流れを把握する' },
      ],
      examples: [
        { japanese: '（スキミング練習）タイトル「高齢者の食事と健康」→ 段落1の最初「近年、高齢者の低栄養が問題になっています」→ 最後の段落「バランスの取れた食事と適切な水分補給が重要です」→ 要旨：高齢者の低栄養問題と食事の重要性', reading: 'こうれいしゃのしょくじとけんこう / こうれいしゃのていえいようがもんだい / ようし：こうれいしゃのていえいようとしょくじのじゅうようせい', translation: '(Luyện skimming) Tiêu đề: "Chế độ ăn và sức khỏe người cao tuổi" → Đoạn 1 đầu: "Gần đây, suy dinh dưỡng ở người cao tuổi đang là vấn đề" → Đoạn cuối: "Chế độ ăn cân bằng và bổ sung nước đúng cách là quan trọng" → Đại ý: Vấn đề suy dinh dưỡng và tầm quan trọng của chế độ ăn cho người cao tuổi' },
      ],
      grammarNote: `【スキミングの手順】
① タイトル・見出しを読む（全体テーマを把握）
② 各段落の最初の文だけ読む（各パラグラフの主題文）
③ 最後の段落を読む（結論・まとめ）
④ 要旨・筆者の主張をまとめる

【スキミングが有効な設問タイプ】
・「この文章のテーマは何ですか」
・「筆者が最も言いたいことは何ですか」
・「この文章の目的は何ですか」
・「文章の内容と合うものはどれですか」（合致問題）`,
      quizzes: [
        {
          question: 'スキミングでは、各段落のどの文を最優先で読む？',
          options: [
            { id: 'a', text: '最後の文' },
            { id: 'b', text: '最初の文（主題文）' },
            { id: 'c', text: '真ん中の文' },
            { id: 'd', text: '最も長い文' },
          ],
          correctId: 'b',
          explanation: '段落の最初の文は「主題文（topic sentence）」と言い、その段落で最も重要な情報が含まれます。スキミングでは各段落の最初の文を読むことが基本です。',
          difficulty: 'easy' as const,
        },
        {
          question: 'スキミングとスキャニングの違いは？',
          options: [
            { id: 'a', text: '同じ読み方' },
            { id: 'b', text: 'スキミング＝要旨把握、スキャニング＝特定情報を探す' },
            { id: 'c', text: 'スキミング＝精読、スキャニング＝速読' },
            { id: 'd', text: 'スキミング＝リスニング、スキャニング＝リーディング' },
          ],
          correctId: 'b',
          explanation: 'スキミング（skimming）は文章全体の要旨・テーマを把握する技術。スキャニング（scanning）は特定の情報（数字・名前など）を素早く探す技術。目的が異なります。',
          difficulty: 'medium' as const,
        },
        {
          question: '「筆者が最も言いたいことは何ですか」という設問にはどちらが有効？',
          options: [
            { id: 'a', text: 'スキャニング（特定キーワードを探す）' },
            { id: 'b', text: 'スキミング（全体の要旨を把握する）' },
            { id: 'c', text: '精読（全部読む）' },
            { id: 'd', text: '音読' },
          ],
          correctId: 'b',
          explanation: '「筆者の主張・要旨」を問う設問にはスキミングが有効。タイトル・各段落の最初の文・結論を読んで全体の主張を把握します。',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 25,
    },
  },

  'n3-03-13': {
    courseTitle: { ja: 'N3 聴解・速読トレーニング', vi: 'Luyện nghe & đọc nhanh N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3速読③: 接続詞で文章の流れを読む',
      titleTranslation: 'Đọc nhanh N3③: Đọc luồng văn bản qua liên từ',
      introduction: `接続詞（liên từ）は文章の論理構造を示す「道標」です。接続詞を見れば「この先に何が来るか」が予測でき、速読の速度が大幅に上がります。N3の読解では「しかし・したがって・ただし・なお・また」などの接続詞を正確に理解することが重要です。

Liên từ là "biển chỉ đường" thể hiện cấu trúc logic của văn bản. Nhìn vào liên từ là có thể đoán trước "điều gì sẽ đến tiếp theo", giúp tốc độ đọc tăng đáng kể. N3 đòi hỏi hiểu chính xác các liên từ như しかし, したがって, ただし, なお, また.`,
      keyPoints: [
        '逆接：しかし・でも・ところが・それでも → 前の内容と反対のことが来る',
        '順接・結果：したがって・そのため・だから・よって → 前の原因の結果が来る',
        '追加：また・さらに・しかも・加えて → 情報を追加する',
        '条件・例外：ただし・なお・もっとも → 例外・補足情報が来る',
        '転換：ところで・さて・それでは → 話題が変わる',
      ],
      vocabulary: [
        { word: 'したがって', reading: 'したがって', meaning: 'そのために（do đó/vì vậy）', example: '〜した。したがって〜' },
        { word: 'しかし', reading: 'しかし', meaning: 'でも・反対に（tuy nhiên/nhưng）', example: '〜だ。しかし〜' },
        { word: 'ただし', reading: 'ただし', meaning: '例外・補足（tuy nhiên/ngoại lệ）', example: '参加可能。ただし事前申込必要' },
        { word: 'また', reading: 'また', meaning: '追加（ngoài ra/thêm nữa）', example: '〜する。また〜もする' },
        { word: 'ところが', reading: 'ところが', meaning: '予想に反して（trái với dự đoán）', example: '〜と思った。ところが〜' },
      ],
      examples: [
        { japanese: '「血圧が高いため、塩分を控えることをお勧めします。したがって、漬物や味噌汁は少量にしてください。」→ 「したがって」の後に前文の結論（行動）が来る', reading: 'けつあつがたかいため、えんぶんをひかえることをおすすめします。したがって、つけものやみそしるはしょうりょうにしてください。', translation: '"Vì huyết áp cao, nên hạn chế muối. Do đó, hãy ăn ít dưa muối và canh miso." → Sau したがって là hành động kết luận từ lý do trước' },
        { japanese: '「リハビリを実施します。ただし、体調が悪い日は中止することがあります。」→ 「ただし」の後に例外・補足情報が来る', reading: 'りはびりをじっしします。ただし、たいちょうがわるいひはちゅうしすることがあります。', translation: '"Sẽ tiến hành phục hồi chức năng. Tuy nhiên, có thể hủy nếu sức khỏe không tốt." → Sau ただし là thông tin ngoại lệ/bổ sung' },
      ],
      grammarNote: `【接続詞と文章の方向性】
逆接（đảo chiều）：
しかし・でも・ところが・それでも・とはいえ
→ 後ろに反対・矛盾の内容

順接・結果（kết quả）：
したがって・そのため・だから・よって・そこで
→ 後ろに前文の結論・結果

追加（bổ sung）：
また・さらに・しかも・加えて・その上
→ 後ろに追加情報

転換（chuyển chủ đề）：
ところで・さて・それでは・話は変わりますが
→ 後ろに新しい話題`,
      quizzes: [
        {
          question: '「〜した。したがって〜」の「したがって」の後には何が来る？',
          options: [
            { id: 'a', text: '反対の内容（đảo chiều）' },
            { id: 'b', text: '前文の結果・結論（kết quả）' },
            { id: 'c', text: '例外情報' },
            { id: 'd', text: '新しい話題' },
          ],
          correctId: 'b',
          explanation: '「したがって」は順接の接続詞で、前文の原因・理由に対する「結果・結論」が後ろに来ます。「なので」「そのため」と同じ役割です。',
          difficulty: 'easy' as const,
        },
        {
          question: '「〜だ。しかし〜」の「しかし」の後には何が来る？',
          options: [
            { id: 'a', text: '前文の結果' },
            { id: 'b', text: '前文と反対・矛盾する内容' },
            { id: 'c', text: '追加情報' },
            { id: 'd', text: '例外' },
          ],
          correctId: 'b',
          explanation: '「しかし」は逆接の接続詞で、前文の内容と反対・対立する内容が後ろに来ます。「nhưng / tuy nhiên」と同じ役割です。',
          difficulty: 'easy' as const,
        },
        {
          question: '「参加可能。ただし事前申込が必要です。」の「ただし」の後には何が来る？',
          options: [
            { id: 'a', text: '前文の結果' },
            { id: 'b', text: '反対の内容' },
            { id: 'c', text: '例外・補足・条件情報' },
            { id: 'd', text: '新しい話題' },
          ],
          correctId: 'c',
          explanation: '「ただし」は例外・補足条件を示す接続詞。前文に対して「でも〜という条件がある」という情報を追加します。',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 25,
    },
  },

  'n3-03-14': {
    courseTitle: { ja: 'N3 聴解・速読トレーニング', vi: 'Luyện nghe & đọc nhanh N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3速読④: 主題・要点を素早く抽出する',
      titleTranslation: 'Đọc nhanh N3④: Tách nhanh chủ đề và điểm chính',
      introduction: `N3の読解問題では「この文章の主題は何ですか」「文章の要点として正しいものはどれですか」という設問が多く出ます。主題（chủ đề）は「文章が何について書かれているか」、要点（điểm chính）は「最も重要な情報・メッセージ」です。これらを素早く見つける技術を練習します。

N3 có nhiều câu hỏi "chủ đề của bài là gì" hoặc "điều nào là điểm chính đúng". Chủ đề là "bài viết về điều gì", điểm chính là "thông tin/thông điệp quan trọng nhất". Luyện kỹ thuật tìm nhanh các yếu tố này.`,
      keyPoints: [
        '主題の見つけ方：タイトル・最初の段落・繰り返し出る語',
        '要点の見つけ方：結論段落・「まとめると〜」「つまり〜」「このように〜」の後',
        '重要な信号語：「つまり」「要するに」「したがって」「このように」→ 要点の前',
        '誤りの選択肢を除外：文章に書かれていない情報・細部の誇張・逆の意味',
        '正答の特徴：文章全体の内容を適切にまとめている・具体的すぎない',
      ],
      vocabulary: [
        { word: '主題', reading: 'しゅだい', meaning: '文章全体のテーマ（chủ đề）', example: 'この文章の主題は何ですか' },
        { word: '要点', reading: 'ようてん', meaning: '最も大切な点（điểm chính）', example: '要点を整理する' },
        { word: 'つまり', reading: 'つまり', meaning: '言い換え・まとめ（tức là/nói cách khác）', example: 'つまり〜ということです' },
        { word: '要するに', reading: 'ようするに', meaning: '要約すると（tóm lại）', example: '要するに〜です' },
        { word: '抽出', reading: 'ちゅうしゅつ', meaning: '取り出す（trích xuất）', example: '重要情報を抽出する' },
      ],
      examples: [
        { japanese: '文章の結論段落：「このように、高齢者の孤立を防ぐためには地域コミュニティの支援が不可欠です。」→ 要点：地域コミュニティが高齢者孤立防止に重要', reading: 'このように、こうれいしゃのこりつをふせぐためにはちいきこみゅにてぃのしえんがふかけつです。', translation: 'Đoạn kết: "Như vậy, để ngăn chặn sự cô lập của người cao tuổi, sự hỗ trợ của cộng đồng địa phương là không thể thiếu." → Điểm chính: Cộng đồng địa phương quan trọng trong việc ngăn cô lập người cao tuổi' },
      ],
      grammarNote: `【要点を示す信号語】
「つまり」→ 前の内容を言い換え・まとめ
「要するに」→ 要約・結論
「このように」→ 前の内容の結論・まとめ
「したがって」→ 前の理由に基づく結論
「以上から」→ 前の議論の最終結論

【主題の見つけ方ステップ】
① タイトル・見出しを確認
② 最初の段落（問題提起・テーマ提示）を読む
③ 繰り返し出てくる語・テーマを確認
④ 最後の段落（結論）を読む`,
      quizzes: [
        {
          question: '「つまり〜」の後には何が来る？',
          options: [
            { id: 'a', text: '新しい情報が来る' },
            { id: 'b', text: '前の内容の言い換え・まとめが来る' },
            { id: 'c', text: '反対の意見が来る' },
            { id: 'd', text: '例外情報が来る' },
          ],
          correctId: 'b',
          explanation: '「つまり」は前の内容を分かりやすく言い換えたり、まとめたりするときに使います。「つまり〜ということです」の形で要点を示します。',
          difficulty: 'easy' as const,
        },
        {
          question: '文章の要点を見つけるとき、最優先で読む場所は？',
          options: [
            { id: 'a', text: '文章の真ん中' },
            { id: 'b', text: '最初と最後の段落' },
            { id: 'c', text: '最も長い段落' },
            { id: 'd', text: '括弧内の内容' },
          ],
          correctId: 'b',
          explanation: '文章の要点は「最初の段落（問題提起・テーマ）」と「最後の段落（結論・まとめ）」に集中することが多いです。この2箇所を先に読むと効率的です。',
          difficulty: 'medium' as const,
        },
        {
          question: '読解問題で誤りの選択肢に多い特徴は？',
          options: [
            { id: 'a', text: '文章の内容と完全に一致する' },
            { id: 'b', text: '文章に書かれていない情報や、内容の誇張・逆の意味を含む' },
            { id: 'c', text: '文章より短い' },
            { id: 'd', text: '難しい語彙を使っている' },
          ],
          correctId: 'b',
          explanation: '誤りの選択肢は「文章に書かれていない情報の追加」「程度の誇張（少し→大幅に）」「意味の逆転」などのパターンが多いです。正答は文章全体の内容を適切にまとめています。',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 25,
    },
  },

  'n3-03-15': {
    courseTitle: { ja: 'N3 聴解・速読トレーニング', vi: 'Luyện nghe & đọc nhanh N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3速読⑤: 長文読解①（説明文・医療文書）',
      titleTranslation: 'Đọc nhanh N3⑤: Đọc hiểu văn dài①（văn thông tin/tài liệu y tế）',
      introduction: `N3の読解問題で最も時間がかかるのが「長文読解」です。医療・介護に関連する説明文は専門用語が多く、読み飛ばしと精読を組み合わせる戦略が必要です。このレッスンでは「医療・健康に関する説明文」の読み方と、設問に答えるための技術を練習します。

Trong đọc hiểu N3, phần tốn thời gian nhất là "đọc văn dài". Văn thông tin liên quan đến y tế và điều dưỡng có nhiều thuật ngữ chuyên môn, cần chiến lược kết hợp bỏ qua và đọc kỹ. Bài này luyện cách đọc văn thông tin về y tế/sức khỏe và kỹ thuật trả lời câu hỏi.`,
      keyPoints: [
        '説明文の構造：問題提起 → 説明・根拠 → 解決策・結論',
        '段落の役割を見分ける：「〜について説明します」「例えば〜」「つまり〜」',
        '医療文書でよく出る型：症状・原因・治療法・予防法の説明',
        '設問先読み戦略：設問を読んでから文章を読む',
        '答えの場所を予測：「なぜ〜ですか」→ 「〜から・ので・ため」を探す',
      ],
      vocabulary: [
        { word: '予防', reading: 'よぼう', meaning: '病気などを事前に防ぐ（phòng ngừa）', example: '感染症の予防が重要です' },
        { word: '症状', reading: 'しょうじょう', meaning: '病気のサイン（triệu chứng）', example: '主な症状は〜です' },
        { word: '原因', reading: 'げんいん', meaning: '何が引き起こすか（nguyên nhân）', example: '発症の原因は〜です' },
        { word: '改善策', reading: 'かいぜんさく', meaning: '問題を良くする方法（biện pháp cải thiện）', example: '改善策として〜が挙げられます' },
        { word: '推奨', reading: 'すいしょう', meaning: '勧める（khuyến nghị）', example: '一日8杯の水分摂取が推奨されます' },
      ],
      examples: [
        { japanese: '（説明文の例）「高齢者の脱水は、のどの渇きを感じにくいため気づきにくい。原因としては、加齢による体内水分量の減少や利尿剤の使用が挙げられる。予防には、定期的な水分補給の促しが効果的である。」', reading: 'こうれいしゃのだっすいは、のどのかわきをかんじにくいためきづきにくい。げんいんとしては、かれいによるたいないすいぶんりょうのげんしょうやりにょうざいのしようがあげられる。よぼうには、ていきてきなすいぶんほきゅうのうながしがこうかてきである。', translation: '(Ví dụ văn thông tin) "Mất nước ở người cao tuổi khó nhận ra vì họ ít cảm thấy khát. Nguyên nhân bao gồm giảm lượng nước trong cơ thể theo tuổi tác và sử dụng thuốc lợi tiểu. Để phòng ngừa, nhắc nhở bổ sung nước thường xuyên rất hiệu quả."' },
      ],
      grammarNote: `【説明文の設問タイプと対策】
「なぜ〜ですか」→ 「〜から・ので・ため・によって」を含む文を探す
「〜とはどういう意味ですか」→ 定義文「〜とは〜のことです」を探す
「〜の原因は何ですか」→ 「原因・理由・要因・によって」を含む文を探す
「〜するとどうなりますか」→ 結果・影響を含む文を探す
「文章の内容と合うものを選びなさい」→ 各選択肢と文章を照合

【設問先読みの効果】
「何を聞かれているか」を把握 → 関連する文だけを精読 → 時間短縮`,
      quizzes: [
        {
          question: '「なぜ〜ですか」という設問で、答えを探すとき注目する語は？',
          options: [
            { id: 'a', text: '「そして・また」（追加を示す語）' },
            { id: 'b', text: '「〜から・ので・ため・によって」（理由・原因を示す語）' },
            { id: 'c', text: '「つまり・要するに」（まとめを示す語）' },
            { id: 'd', text: '「しかし・ところが」（逆接を示す語）' },
          ],
          correctId: 'b',
          explanation: '「なぜ〜ですか」という因果関係の設問では、「から・ので・ため・によって」という原因・理由を示す語の周辺に答えがあります。',
          difficulty: 'medium' as const,
        },
        {
          question: '長文読解で設問を先に読む理由は？',
          options: [
            { id: 'a', text: '設問が短いから' },
            { id: 'b', text: '何を探すかが分かり、関連する文だけ精読できるから' },
            { id: 'c', text: '設問の方が重要だから' },
            { id: 'd', text: '文章が難しいから' },
          ],
          correctId: 'b',
          explanation: '設問を先に読むことで、「どの情報が必要か」が分かります。文章全体を精読せず、設問に関係する部分だけ読めるので時間を大幅に節約できます。',
          difficulty: 'easy' as const,
        },
        {
          question: '説明文で「〜とは〜のことです」という文はどんな役割？',
          options: [
            { id: 'a', text: '反論' },
            { id: 'b', text: '定義（用語の説明）' },
            { id: 'c', text: '例示' },
            { id: 'd', text: '結論' },
          ],
          correctId: 'b',
          explanation: '「〜とは〜のことです」は定義文で、用語や概念を説明します。「〜とはどういう意味ですか」という設問の答えはこの形の文に含まれています。',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 30,
    },
  },

  'n3-03-16': {
    courseTitle: { ja: 'N3 聴解・速読トレーニング', vi: 'Luyện nghe & đọc nhanh N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3速読⑥: 長文読解②（記事・コラム・意見文）',
      titleTranslation: 'Đọc nhanh N3⑥: Đọc hiểu văn dài②（bài báo/cột báo/bài ý kiến）',
      introduction: `N3の読解には「記事・コラム・意見文」など、筆者の主張や意見が含まれる文章も出ます。「筆者は〜についてどう思っているか」「この文章で筆者が最も伝えたいことは何か」を読み取るには、主張文・根拠・反論・結論の構造を理解する力が必要です。

N3 cũng có dạng văn "bài báo / cột báo / bài ý kiến" chứa quan điểm của tác giả. Để đọc hiểu "tác giả nghĩ gì về..." hoặc "tác giả muốn truyền đạt điều gì nhất", cần hiểu cấu trúc: luận điểm – lý do – phản biện – kết luận.`,
      keyPoints: [
        '意見文の構造：問題提起 → 自分の意見（主張）→ 根拠・理由 → 反論の考慮 → 結論',
        '主張文を探す：「〜と考える」「〜べきだ」「〜が重要だ」「〜ではないだろうか」',
        '根拠を探す：「なぜなら〜」「〜からだ」「〜のためだ」「〜という点で」',
        '反論の考慮：「たしかに〜しかし〜」「〜という意見もあるが〜」',
        '結論：「以上から〜」「このように〜」「要するに〜」',
      ],
      vocabulary: [
        { word: '主張', reading: 'しゅちょう', meaning: '自分の意見を強く言う（luận điểm）', example: '筆者の主張は〜です' },
        { word: '根拠', reading: 'こんきょ', meaning: '理由・証拠（cơ sở/lý do）', example: '根拠を示す' },
        { word: '反論', reading: 'はんろん', meaning: '反対意見（phản biện）', example: '反論を考慮する' },
        { word: '賛成', reading: 'さんせい', meaning: '同じ意見（đồng ý）', example: '〜に賛成する' },
        { word: '反対', reading: 'はんたい', meaning: '違う意見（phản đối）', example: '〜に反対する' },
      ],
      examples: [
        { japanese: '（意見文の例）「高齢化社会が進む中、外国人介護士の受け入れは不可欠だと考える。なぜなら、国内の介護従事者不足は深刻だからだ。たしかに、言語・文化の壁という課題もある。しかし、適切な教育プログラムを整備することで、質の高いケアは実現できる。」→ 主張：外国人介護士受け入れが必要 / 根拠：人手不足 / 反論考慮：言語・文化の問題 / 結論：教育で解決可能', reading: 'こうれいかしゃかいがすすむなか、がいこくじんかいごしのうけいれはふかけつだとかんがえる。なぜなら、こくないのかいごじゅうじしゃぶそくはしんこくだからだ。', translation: '(Ví dụ bài ý kiến) "Trong bối cảnh xã hội già hóa, tôi cho rằng tiếp nhận điều dưỡng viên nước ngoài là không thể thiếu. Bởi vì, tình trạng thiếu nhân lực điều dưỡng trong nước đang rất nghiêm trọng. Tuy nhiên cũng có rào cản ngôn ngữ và văn hóa. Nhưng với chương trình đào tạo phù hợp, có thể cung cấp dịch vụ chăm sóc chất lượng cao."' },
      ],
      grammarNote: `【意見文の信号語】
主張：「〜と考える」「〜べきだ」「〜が重要だ」
根拠：「なぜなら」「〜からだ」「〜のためだ」
反論考慮：「たしかに〜しかし〜」「〜かもしれないが〜」
結論：「以上から〜」「このように〜」「要するに〜」

【筆者の意見を問う設問の解き方】
「筆者は〜についてどう思っているか」
→ 「〜と考える・〜べきだ・〜が大切だ」などの主張文を探す
「この文章で筆者が最も言いたいことは？」
→ 最後の段落の結論文を重視する`,
      quizzes: [
        {
          question: '「たしかに〜しかし〜」の構造で筆者の本当の意見はどちら？',
          options: [
            { id: 'a', text: '「たしかに〜」の部分' },
            { id: 'b', text: '「しかし〜」の部分' },
            { id: 'c', text: '両方同じ' },
            { id: 'd', text: 'どちらでもない' },
          ],
          correctId: 'b',
          explanation: '「たしかに〜（反論を認める）、しかし〜（でも自分の意見はこちら）」の構造では、「しかし」の後が筆者の本当の主張です。逆接の後に重要な意見が来ます。',
          difficulty: 'medium' as const,
        },
        {
          question: '意見文で「なぜなら〜からだ」は何の役割？',
          options: [
            { id: 'a', text: '主張の根拠・理由を示す' },
            { id: 'b', text: '反論を示す' },
            { id: 'c', text: '結論を示す' },
            { id: 'd', text: '問題提起をする' },
          ],
          correctId: 'a',
          explanation: '「なぜなら〜からだ」は「その理由は〜だから」という意味で、前の主張に対する根拠・理由を示します。',
          difficulty: 'easy' as const,
        },
        {
          question: '「以上から〜と考えられる」はどこに来ることが多い？',
          options: [
            { id: 'a', text: '文章の冒頭' },
            { id: 'b', text: '文章の中間' },
            { id: 'c', text: '文章の最後（結論部分）' },
            { id: 'd', text: '反論の後' },
          ],
          correctId: 'c',
          explanation: '「以上から」は「前に述べてきたことから（kết luận từ những điều trên）」という意味で、議論の結論部分（最後の段落）に来ることがほとんどです。',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 30,
    },
  },

  'n3-03-17': {
    courseTitle: { ja: 'N3 聴解・速読トレーニング', vi: 'Luyện nghe & đọc nhanh N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3統合演習①: 聴解＋速読の複合練習',
      titleTranslation: 'Luyện tổng hợp N3①: Kết hợp nghe và đọc nhanh',
      introduction: `N3試験の聴解と読解を組み合わせた複合演習です。実際の試験では聴解と読解が交互に出題されます。このレッスンでは、同じテーマについて「聴解（話し言葉）」と「読解（書き言葉）」の両方で情報を処理する練習をします。介護現場では口頭の申し送りと書面の記録を同時に扱うスキルが求められます。

Bài luyện kết hợp nghe và đọc N3. Trong đề thi thực tế, nghe và đọc xen kẽ nhau. Bài này luyện xử lý thông tin cùng một chủ đề qua cả hai kênh "nghe (ngôn ngữ nói)" và "đọc (ngôn ngữ viết)". Tại nơi làm việc điều dưỡng, cần kỹ năng xử lý đồng thời cả bàn giao miệng và hồ sơ viết.`,
      keyPoints: [
        '聴解と読解の違い：話し言葉（省略・縮約）vs 書き言葉（正式・詳細）',
        '同じ情報の2種類の表現に慣れる',
        '聴解中のメモ技術：記号を使って素早くメモする',
        '読解との照合：メモした情報を文書で確認する',
        '実践力アップ：スピードと正確さのバランスを取る',
      ],
      vocabulary: [
        { word: '複合', reading: 'ふくごう', meaning: '複数の要素の組み合わせ（kết hợp）', example: '複合演習で実力を高める' },
        { word: '照合', reading: 'しょうごう', meaning: '比べて確認する（đối chiếu）', example: '音声と文書を照合する' },
        { word: '記号', reading: 'きごう', meaning: '簡単なしるし（ký hiệu）', example: 'メモで記号を使う' },
        { word: '実践', reading: 'じっせん', meaning: '実際に行う（thực hành）', example: '実践的な練習をする' },
        { word: '正確', reading: 'せいかく', meaning: '間違いのない（chính xác）', example: '正確に聞き取る' },
      ],
      dialogue: [
        { speaker: '音声（申し送り）', japanese: '田中様の今日の様子です。朝から食欲がなく、昼食は3割程度しか食べられませんでした。体温は37.2度で微熱があります。水分補給を促しましたが、あまり飲めていません。', reading: 'たなかさまのきょうのようすです。あさからしょくよくがなく、ちゅうしょくは3わりていどしかたべられませんでした。たいおんは37.2どでびねつがあります。すいぶんほきゅうをうながしましたが、あまりのめていません。', translation: 'Tình trạng hôm nay của bà Tanaka: Từ sáng đã mất cảm giác ngon miệng, bữa trưa chỉ ăn được khoảng 30%. Nhiệt độ 37.2°C, có sốt nhẹ. Đã nhắc uống nước nhưng uống không nhiều.' },
      ],
      examples: [
        { japanese: '（文書）介護記録：「田中様 昼食摂取量：3割。体温：37.2度（微熱あり）。食欲不振、水分摂取量少。要観察。」→ 音声と文書の内容が一致しているか確認する練習', reading: 'たなかさま ちゅうしょくせっしゅりょう：3わり。たいおん：37.2ど（びねつあり）。しょくよくふしん、すいぶんせっしゅりょうすくない。ようかんさつ。', translation: '(Tài liệu) Hồ sơ điều dưỡng: "Bà Tanaka: Lượng ăn trưa 30%. Nhiệt độ 37.2°C (sốt nhẹ). Chán ăn, uống ít nước. Cần theo dõi." → Luyện xác nhận nội dung âm thanh và tài liệu có khớp không' },
      ],
      grammarNote: `【メモの取り方（基本記号）】
→ : 変化・経過（thay đổi/tiến triển）
↑ : 増加・上昇（tăng lên）
↓ : 減少・低下（giảm xuống）
× : 問題あり・NG（có vấn đề）
○ : 問題なし・OK（ổn）
⚠ : 注意（chú ý）
? : 不明・確認必要（chưa rõ）

【聴解メモの実例】
田中：食欲↓（3割）体温37.2（微熱）水分↓　→要観察`,
      quizzes: [
        {
          question: '口頭の「3割しか食べられなかった」を文書に記録するとき、適切な表現は？',
          options: [
            { id: 'a', text: '「たくさん食べた」' },
            { id: 'b', text: '「食欲なし・昼食摂取量3割」' },
            { id: 'c', text: '「何も食べなかった」' },
            { id: 'd', text: '「全量摂取」' },
          ],
          correctId: 'b',
          explanation: '口頭表現「3割程度しか食べられなかった」は文書では「食欲不振・摂取量3割」のように簡潔に記録します。3割＝全体の30%のみ食べたという意味です。',
          difficulty: 'medium' as const,
        },
        {
          question: 'メモを素早く取るときに便利な方法は？',
          options: [
            { id: 'a', text: '全部の文章を書く' },
            { id: 'b', text: '記号と略語を使う' },
            { id: 'c', text: '書かない' },
            { id: 'd', text: 'ひらがなで全部書く' },
          ],
          correctId: 'b',
          explanation: '「↑」「↓」「→」「×」「○」などの記号と略語を使うと、素早く正確にメモを取れます。全文を書こうとすると重要情報を聞き逃します。',
          difficulty: 'easy' as const,
        },
        {
          question: '「微熱」とはどの程度の体温？',
          options: [
            { id: 'a', text: '36.5度以下' },
            { id: 'b', text: '37〜37.9度程度' },
            { id: 'c', text: '39度以上' },
            { id: 'd', text: '38〜38.9度' },
          ],
          correctId: 'b',
          explanation: '「微熱（びねつ）」は37〜37.9度程度の軽い熱。「高熱（こうねつ）」は38度以上。介護記録では体温の区分を正確に記録します。',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 30,
    },
  },

  'n3-03-18': {
    courseTitle: { ja: 'N3 聴解・速読トレーニング', vi: 'Luyện nghe & đọc nhanh N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3統合演習②: 時間制限付き速読トレーニング',
      titleTranslation: 'Luyện tổng hợp N3②: Đọc nhanh có giới hạn thời gian',
      introduction: `N3試験の読解問題には制限時間があります。このレッスンでは「時間を意識した読み方」を練習します。「1問あたり何分で解くか」を意識して、スキャニング・スキミング・精読を組み合わせた時間管理の技術を身につけます。

Đọc hiểu thi N3 có giới hạn thời gian. Bài này luyện "cách đọc có ý thức về thời gian". Nắm kỹ thuật quản lý thời gian kết hợp scanning, skimming và đọc kỹ, với ý thức "mỗi câu hỏi tốn bao nhiêu phút".`,
      keyPoints: [
        'N3読解の時間目安：短文（100字以内）30秒〜1分、中文（200〜400字）2〜3分、長文（400字以上）3〜5分',
        '優先順位：簡単な設問から解く → 難問は後回し',
        '速読の3ステップ：① 設問先読み → ② スキミング（15秒）→ ③ 設問に関係する部分だけ精読',
        '時間超過のサイン：1問に3分以上かかったら次へ',
        '見直し時間：最後の5分は確認に使う',
      ],
      vocabulary: [
        { word: '制限時間', reading: 'せいげんじかん', meaning: '決められた時間（giới hạn thời gian）', example: '制限時間は60分です' },
        { word: '優先', reading: 'ゆうせん', meaning: '先にやる（ưu tiên）', example: '簡単な問題を優先する' },
        { word: '精読', reading: 'せいどく', meaning: 'じっくり丁寧に読む（đọc kỹ）', example: '重要な部分だけ精読する' },
        { word: '後回し', reading: 'あとまわし', meaning: '後でやる（để sau）', example: '難問は後回しにする' },
        { word: 'ペース', reading: 'ぺーす', meaning: 'スピード・リズム（tốc độ）', example: '解答のペースを保つ' },
      ],
      examples: [
        { japanese: '（時間管理の例）200字の文章と3設問 → 全体を15秒でスキミング → 設問1：40秒で解く → 設問2：40秒 → 設問3：40秒 → 合計：約2分30秒で完了', reading: '200じのぶんしょうと3せつもん → ぜんたいを15びょうでスキミング → せつもん1：40びょうでとく', translation: '(Ví dụ quản lý thời gian) Văn bản 200 chữ, 3 câu hỏi → Skimming toàn bài trong 15 giây → Câu 1: 40 giây → Câu 2: 40 giây → Câu 3: 40 giây → Tổng: khoảng 2 phút 30 giây' },
      ],
      grammarNote: `【N3読解の時間配分目安】
短文（〜100字）：1〜1.5分 / 1問
中文（200〜400字）：2〜3分 / 1問
長文（400字以上）：4〜5分 / 1問

【速読3ステップ】
STEP 1: 設問を先読み（10〜15秒）
STEP 2: 文章をスキミング（15〜30秒）
STEP 3: 設問に関係する箇所のみ精読（30秒〜2分）

【時間切れを防ぐルール】
・1問3分超 → いったん次へ
・最後5分 → 全体見直し
・分からない問題 → 最後でも必ず選択肢を選ぶ（空白はNG）`,
      quizzes: [
        {
          question: '速読3ステップの正しい順序は？',
          options: [
            { id: 'a', text: '精読 → スキミング → 設問先読み' },
            { id: 'b', text: 'スキミング → 設問先読み → 精読' },
            { id: 'c', text: '設問先読み → スキミング → 精読' },
            { id: 'd', text: '精読 → 設問先読み → スキミング' },
          ],
          correctId: 'c',
          explanation: '最も効率的な順序は「①設問先読み（何を探すか確認）→ ②スキミング（全体把握）→ ③設問関連箇所のみ精読（答えを探す）」です。',
          difficulty: 'easy' as const,
        },
        {
          question: '1問に時間をかけすぎたとき、正しい対応は？',
          options: [
            { id: 'a', text: 'その問題が解けるまで続ける' },
            { id: 'b', text: 'いったん次の問題に進む' },
            { id: 'c', text: '試験をやめる' },
            { id: 'd', text: '最初に戻る' },
          ],
          correctId: 'b',
          explanation: '1問に時間をかけすぎると後の問題に影響します。難問はいったん次へ進み、時間があれば後で戻ります。試験では全体のペース管理が重要です。',
          difficulty: 'easy' as const,
        },
        {
          question: '試験で分からない問題への正しい対応は？',
          options: [
            { id: 'a', text: '空白のまま提出する' },
            { id: 'b', text: '必ず何かを選択する' },
            { id: 'c', text: 'その問題だけ長時間考える' },
            { id: 'd', text: '試験官に相談する' },
          ],
          correctId: 'b',
          explanation: '選択式問題で空白は必ず0点です。分からなくても必ず選択肢を選びましょう。確率的に正解する可能性があります。',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 30,
    },
  },

  'n3-03-19': {
    courseTitle: { ja: 'N3 聴解・速読トレーニング', vi: 'Luyện nghe & đọc nhanh N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3模擬演習: 本番形式の聴解・読解総合問題',
      titleTranslation: 'N3 Luyện thi thử: Tổng hợp nghe và đọc dạng thực chiến',
      introduction: `このレッスンはN3試験に近い形式の模擬演習です。聴解問題（場面理解・ポイント理解）と読解問題（短文・中文）を組み合わせた総合練習をします。今まで学んだすべての技術（スキャニング・スキミング・接続詞・情報統合）を総動員して解答します。

Bài này là luyện thi thử gần với định dạng thi N3 thực tế. Luyện tổng hợp kết hợp câu nghe (hiểu tình huống / hiểu điểm chính) và câu đọc (đoạn ngắn / đoạn vừa). Huy động tất cả kỹ thuật đã học (scanning, skimming, liên từ, tổng hợp thông tin) để trả lời.`,
      keyPoints: [
        '聴解問題の形式：①課題理解（何をするべきか）②ポイント理解（話の要点は何か）③発話表現（どの表現が適切か）',
        '読解問題の形式：①内容理解（短文）②内容理解（中文）③情報検索（掲示・広告）',
        '解答の流れ：選択肢を先に読む → 音声・文章を聞く/読む → 答えを選ぶ',
        '頻出テーマ：医療・介護・健康・環境・社会問題・日常生活',
        '最終確認：答えを選んだ後、根拠が文章にあるか確認する',
      ],
      vocabulary: [
        { word: '模擬', reading: 'もぎ', meaning: '本番に似せた練習（mô phỏng）', example: '模擬試験で実力を確認する' },
        { word: '課題', reading: 'かだい', meaning: 'やるべき問題・仕事（nhiệm vụ）', example: '課題理解問題に答える' },
        { word: '発話', reading: 'はつわ', meaning: '話すこと・発言（lời nói）', example: '適切な発話表現を選ぶ' },
        { word: '検索', reading: 'けんさく', meaning: '探して調べる（tìm kiếm）', example: '情報検索問題を解く' },
        { word: '根拠', reading: 'こんきょ', meaning: '答えの理由・証拠（cơ sở）', example: '根拠を文章から探す' },
      ],
      dialogue: [
        { speaker: '聴解問題例（課題理解）', japanese: '「来週の月曜日に健康診断があります。前日の夜から食事は取らないでください。飲み物は水だけにしてください。当日は8時30分までに保健室に来てください。」問：この人は何をしなければなりませんか？', reading: 'らいしゅうのげつようびにけんこうしんだんがあります。ぜんじつのよるからしょくじはとらないでください。のみものはみずだけにしてください。とうじつは8じ30ぷんまでにほけんしつにきてください。', translation: '(Ví dụ câu nghe - hiểu nhiệm vụ) "Thứ Hai tuần tới có khám sức khỏe. Từ tối hôm trước không ăn gì. Chỉ được uống nước. Hôm khám đến phòng y tế trước 8:30." Hỏi: Người này phải làm gì?' },
      ],
      examples: [
        { japanese: '（読解問題例）「当施設では毎週水曜日にリハビリ体操を実施しています。対象は入所者全員です。ただし、医師の判断により参加できない場合があります。参加希望の方は担当スタッフまでお申し出ください。」問：参加できない場合があるのはなぜですか？→ 医師の判断による', reading: 'とうしせつではまいしゅうすいようびにりはびりたいそうをじっししています。たいしょうはにゅうしょしゃぜんいんです。ただし、いしのはんだんによりさんかできないばあいがあります。', translation: '(Ví dụ câu đọc) "Cơ sở chúng tôi tổ chức thể dục phục hồi mỗi thứ Tư. Đối tượng là tất cả người ở trọ. Tuy nhiên, có trường hợp không thể tham gia theo quyết định của bác sĩ. Ai muốn tham gia hãy báo nhân viên phụ trách." Hỏi: Tại sao có trường hợp không tham gia được? → Theo quyết định của bác sĩ' },
      ],
      grammarNote: `【聴解問題タイプ別の解き方】
課題理解（何をすべきか）：
→「〜してください」「〜なければなりません」を中心に聞く
ポイント理解（話の要点）：
→ 最後の発言・結論部分を重視する
発話表現（どの表現が適切か）：
→ 場面・相手・フォーマル度を判断する

【読解問題タイプ別の解き方】
内容理解：設問先読み → スキャニングで答えを探す
情報検索（掲示物・広告）：スキャニングで数字・条件を探す
主旨理解：スキミングで筆者の意見を把握する`,
      quizzes: [
        {
          question: '聴解の「課題理解」問題で最重要なのは？',
          options: [
            { id: 'a', text: '話者の感情' },
            { id: 'b', text: '「〜してください」「〜すること」など行動指示の表現' },
            { id: 'c', text: '話の背景' },
            { id: 'd', text: '話者の名前' },
          ],
          correctId: 'b',
          explanation: '課題理解問題は「何をすべきか・何をしてはいけないか」を聞く問題。「〜してください」「〜なければなりません」「〜はいけません」などの指示・義務・禁止表現に注目します。',
          difficulty: 'medium' as const,
        },
        {
          question: '読解の「情報検索」問題（掲示物・広告）で最も有効な技術は？',
          options: [
            { id: 'a', text: 'スキミング（全体の要旨把握）' },
            { id: 'b', text: 'スキャニング（特定情報を素早く探す）' },
            { id: 'c', text: '精読（全部じっくり読む）' },
            { id: 'd', text: '音読' },
          ],
          correctId: 'b',
          explanation: '掲示物・広告の情報検索問題は「日時・場所・条件・料金」などの特定情報を素早く探す問題。スキャニングが最も効率的です。',
          difficulty: 'medium' as const,
        },
        {
          question: '選択肢を選んだ後、最後に確認すべきことは？',
          options: [
            { id: 'a', text: '選択肢の長さ' },
            { id: 'b', text: '答えの根拠が文章・音声の中にあるか' },
            { id: 'c', text: '漢字の書き方' },
            { id: 'd', text: '選択肢の順番' },
          ],
          correctId: 'b',
          explanation: '選択肢を選んだ後、「その答えの根拠が文章・音声の中に実際に存在するか」を確認します。自分の知識・常識ではなく、必ず問題のテキスト・音声に根拠を求めます。',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 35,
    },
  },

  'n3-03-20': {
    courseTitle: { ja: 'N3 聴解・速読トレーニング', vi: 'Luyện nghe & đọc nhanh N3' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3聴解・速読 総復習テスト（20問）',
      titleTranslation: 'Kiểm tra tổng hợp N3 Nghe & Đọc nhanh（20 câu）',
      introduction: `このレッスンはN3聴解・速読トレーニング全20レッスンの総復習テストです。聴解のポイント（場面理解・情報統合・省略形）と速読技術（スキャニング・スキミング・接続詞・要点抽出）を総合的に確認します。合格を目指して全力で取り組みましょう！

Bài này là kiểm tra tổng hợp toàn bộ 20 bài N3 nghe & đọc nhanh. Kiểm tra toàn diện các điểm nghe (hiểu tình huống, tổng hợp thông tin, dạng rút gọn) và kỹ thuật đọc nhanh (scanning, skimming, liên từ, tách điểm chính). Hãy cố hết sức để vượt qua!`,
      keyPoints: [
        'L1〜L10（聴解）：場面理解・電話・申し送り・感情・数字・指示・会議・アナウンス・省略形・情報統合',
        'L11〜L16（速読）：スキャニング・スキミング・接続詞・要点抽出・長文①説明文・長文②意見文',
        'L17〜L19（複合演習）：聴解＋速読・時間管理・模擬演習',
        'N3試験の傾向：実用的な場面・介護医療テーマ・情報の整理力が重要',
        '合格ポイント：根拠を文章から探す・時間管理・接続詞の活用',
      ],
      vocabulary: [
        { word: '総復習', reading: 'そうふくしゅう', meaning: '全部をもう一度確認する（ôn tập tổng hợp）', example: '総復習テストで実力確認' },
        { word: '合格', reading: 'ごうかく', meaning: '試験に受かる（đỗ）', example: 'N3合格を目指す' },
        { word: '実力', reading: 'じつりょく', meaning: '本当の能力（thực lực）', example: '実力を発揮する' },
        { word: '対策', reading: 'たいさく', meaning: '準備・方法（đối sách）', example: '試験対策をする' },
        { word: '総合', reading: 'そうごう', meaning: '全部合わせた（tổng hợp）', example: '総合的な力を確認する' },
      ],
      examples: [
        { japanese: '【聴解の重要ポイントまとめ】場面理解：誰が・誰に・何を・なぜ／感情：声のトーン・間接表現／数字：数値を正確にメモ／省略形：ちゃう・てる・なきゃ／情報統合：訂正発言に注目', reading: 'ばめんりかい：だれが・だれに・なにを・なぜ／かんじょう：こえのとーん・かんせつひょうげん／すうじ：すうちをせいかくにめも', translation: '【Tóm tắt điểm nghe quan trọng】Hiểu tình huống: ai/với ai/làm gì/tại sao / Cảm xúc: giọng điệu & cách nói gián tiếp / Số liệu: ghi chú chính xác / Rút gọn: ちゃう・てる・なきゃ / Tổng hợp: chú ý câu chỉnh sửa' },
        { japanese: '【速読の重要ポイントまとめ】スキャニング：キーワードを探す／スキミング：段落の最初と最後を読む／接続詞：しかし→逆接・したがって→結果・ただし→例外／要点：つまり・要するに・このように', reading: 'すきゃにんぐ：きーわーどをさがす／すきみんぐ：だんらくのさいしょとさいごをよむ／せつぞくし：しかし→ぎゃくせつ・したがって→けっか', translation: '【Tóm tắt điểm đọc nhanh quan trọng】Scanning: tìm từ khóa / Skimming: đọc đầu và cuối đoạn / Liên từ: しかし→đảo chiều, したがって→kết quả, ただし→ngoại lệ / Điểm chính: つまり・要するに・このように' },
      ],
      grammarNote: `【N3聴解・速読 全技術まとめ】
聴解技術：
① 場面把握（誰が・誰に・何を・なぜ）
② 感情・ニュアンス（ちょっと=断り、声のトーン）
③ 数字の正確なメモ（↑↓記号活用）
④ 縮約形の理解（ちゃう・てる・なきゃ）
⑤ 情報統合（訂正発言を優先）

速読技術：
① スキャニング（特定情報を素早く探す）
② スキミング（全体の要旨を把握）
③ 接続詞（しかし=逆接・したがって=結果・ただし=例外）
④ 要点抽出（つまり・要するに・このように の後）
⑤ 設問先読み（時間効率アップ）`,
      quizzes: [
        {
          question: '「ちょっと...」という発言が表す最も一般的な意味は？',
          options: [
            { id: 'a', text: '少し・わずか（ít/một chút）' },
            { id: 'b', text: '間接的な断り・困惑（từ chối gián tiếp）' },
            { id: 'c', text: '急いでいる（đang vội）' },
            { id: 'd', text: '大変嬉しい（rất vui）' },
          ],
          correctId: 'b',
          explanation: '会話の中で「ちょっと...（言葉を濁す）」は間接的な断りや困惑を表す日本語特有の表現です。直接断ることを避ける文化的ニュアンスがあります。',
          difficulty: 'medium' as const,
        },
        {
          question: '「したがって」の後に来る内容は？',
          options: [
            { id: 'a', text: '前文と反対の内容' },
            { id: 'b', text: '例外・補足情報' },
            { id: 'c', text: '前文の原因に基づく結果・結論' },
            { id: 'd', text: '新しい話題' },
          ],
          correctId: 'c',
          explanation: '「したがって」は順接の接続詞で、前の原因・理由に基づいた「結果・結論」が後に来ます。「そのため・だから」と同じ役割です。',
          difficulty: 'easy' as const,
        },
        {
          question: 'N3速読でスキャニングが最も有効な設問は？',
          options: [
            { id: 'a', text: '「筆者の主張は何ですか」' },
            { id: 'b', text: '「文章のテーマは何ですか」' },
            { id: 'c', text: '「この活動はいつ・どこで行われますか」' },
            { id: 'd', text: '「この文章の目的は何ですか」' },
          ],
          correctId: 'c',
          explanation: 'スキャニングは特定の情報（日時・場所・数字・名前）を探すときに有効。「いつ・どこで」という具体的な情報を問う設問はスキャニングで素早く解けます。a・b・dはスキミングが有効な設問です。',
          difficulty: 'medium' as const,
        },
        {
          question: '申し送りで「引き続き観察をお願いします」の意味は？',
          options: [
            { id: 'a', text: '観察を終了してください' },
            { id: 'b', text: '今から観察を始めてください' },
            { id: 'c', text: '次の担当者も継続して観察してください' },
            { id: 'd', text: '医師に報告してください' },
          ],
          correctId: 'c',
          explanation: '「引き続き（ひきつづき）」は「tiếp tục（継続して）」の意味。「引き続き観察をお願いします」は「次の担当者も継続して状態を観察してください」という申し送りの定型表現です。',
          difficulty: 'easy' as const,
        },
        {
          question: '速読の正しいステップの順序は？',
          options: [
            { id: 'a', text: '精読 → スキミング → 設問先読み' },
            { id: 'b', text: '設問先読み → スキミング → 設問関連箇所の精読' },
            { id: 'c', text: 'スキミング → 精読 → 設問先読み' },
            { id: 'd', text: '設問先読み → 精読 → スキミング' },
          ],
          correctId: 'b',
          explanation: '最も効率的な速読ステップは「①設問先読み（何を探すか把握）→ ②スキミング（全体の流れを把握）→ ③設問に関係する箇所のみ精読（答えを探す）」です。',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 50,
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

  // ===== N3 語彙強化 L2〜L8 =====
  'n3-04-2': {
    courseTitle: { ja: 'N3 語彙強化 〜カタカナ語・複合語〜', vi: 'Củng cố từ vựng N3 - Từ Katakana và từ ghép' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3語彙: 生活・職場のカタカナ語',
      titleTranslation: 'Từ vựng N3: Từ Katakana trong cuộc sống và nơi làm việc',
      introduction: `医療・介護以外にも、日本の職場や日常生活では多くのカタカナ語が使われます。「スケジュール・マニュアル・チェック・フォロー」など、ビジネス場面でよく使うカタカナ語をマスターすることで、職場でのコミュニケーションがスムーズになります。

Ngoài y tế và điều dưỡng, nhiều từ Katakana được dùng trong nơi làm việc và cuộc sống hàng ngày ở Nhật. Nắm vững các từ Katakana thường dùng trong môi trường làm việc như スケジュール・マニュアル・チェック・フォロー giúp giao tiếp tại nơi làm việc trơn tru hơn.`,
      keyPoints: [
        'スケジュール（schedule）: 日程・予定 — lịch trình',
        'マニュアル（manual）: 手順書・説明書 — sổ tay hướng dẫn',
        'チェック（check）: 確認・点検 — kiểm tra',
        'フォロー（follow）: 補助・サポート — hỗ trợ theo dõi',
        'シフト（shift）: 勤務時間帯 — ca làm việc',
        'ミーティング（meeting）: 会議・打ち合わせ — cuộc họp',
      ],
      vocabulary: [
        { word: 'スケジュール', reading: 'すけじゅーる', meaning: '予定・日程（lịch trình）', example: 'スケジュールを確認する' },
        { word: 'マニュアル', reading: 'まにゅある', meaning: '手順書（sổ tay）', example: 'マニュアル通りに行う' },
        { word: 'シフト', reading: 'しふと', meaning: '勤務の時間帯（ca làm việc）', example: '今日のシフトは夜勤です' },
        { word: 'フォロー', reading: 'ふぉろー', meaning: '補助・サポート（hỗ trợ）', example: '新人をフォローする' },
        { word: 'チームワーク', reading: 'ちーむわーく', meaning: '協力して働く力（tinh thần đồng đội）', example: 'チームワークが大切です' },
      ],
      dialogue: [
        { speaker: '上司', japanese: '来週のシフトを確認してください。マニュアルも一度読んでおいてください。', reading: 'らいしゅうのしふとをかくにんしてください。まにゅあるもいちどよんでおいてください。', translation: 'Hãy xác nhận ca làm việc tuần tới. Cũng hãy đọc sổ tay hướng dẫn một lần nhé.' },
        { speaker: '新人', japanese: 'はい、分かりました。ミーティングのスケジュールはいつですか。', reading: 'はい、わかりました。みーてぃんぐのすけじゅーるはいつですか。', translation: 'Vâng, tôi hiểu. Lịch cuộc họp là khi nào ạ?' },
      ],
      examples: [
        { japanese: '「今日は日勤シフトです。ケアカンファレンスのスケジュールをチェックしておいてください。」', reading: 'きょうはにっきんしふとです。けあかんふぁれんすのすけじゅーるをちぇっくしておいてください。', translation: '"Hôm nay ca ngày. Hãy kiểm tra lịch hội nghị chăm sóc nhé."' },
        { japanese: '「新しいスタッフのフォローをお願いします。マニュアルに沿って指導してください。」', reading: 'あたらしいすたっふのふぉろーをおねがいします。まにゅあるにそってしどうしてください。', translation: '"Nhờ bạn hỗ trợ nhân viên mới. Hãy hướng dẫn theo sổ tay nhé."' },
      ],
      grammarNote: `【職場でよく使うカタカナ語一覧】
ビジネス全般：
スケジュール / マニュアル / チェック / フォロー
ミーティング / プレゼン / レポート / フィードバック
チームワーク / コミュニケーション / スタッフ / リーダー

勤務関連：
シフト / タイムカード / オーバータイム（残業）
ローテーション（交替制）/ フルタイム / パートタイム

介護・医療特有：
カンファレンス / ケアプラン / インシデント / ヒヤリハット`,
      quizzes: [
        {
          question: '「シフト」の意味は？',
          options: [
            { id: 'a', text: '会議（cuộc họp）' },
            { id: 'b', text: '勤務の時間帯（ca làm việc）' },
            { id: 'c', text: '報告書（báo cáo）' },
            { id: 'd', text: '計画書（kế hoạch）' },
          ],
          correctId: 'b',
          explanation: '「シフト（shift）」は勤務の時間帯や交替制のこと。「今日は何シフトですか？」「夜勤シフトです」のように使います。',
          difficulty: 'easy' as const,
        },
        {
          question: '「フォロー」の職場での意味は？',
          options: [
            { id: 'a', text: '追いかける（đuổi theo）' },
            { id: 'b', text: 'SNSでフォローする（theo dõi mạng xã hội）' },
            { id: 'c', text: '補助・サポートする（hỗ trợ）' },
            { id: 'd', text: '電話する（gọi điện）' },
          ],
          correctId: 'c',
          explanation: '職場での「フォロー」は「補助・サポート・フォローアップ」の意味。「新人をフォローする」＝「新入りを助ける・サポートする」ということです。',
          difficulty: 'medium' as const,
        },
        {
          question: '「マニュアル通りに行う」はどういう意味？',
          options: [
            { id: 'a', text: '手順書に書かれた通りに実行する（làm theo sổ tay）' },
            { id: 'b', text: '自分のやり方でする（làm theo cách của mình）' },
            { id: 'c', text: '急いでする（làm nhanh）' },
            { id: 'd', text: '後でする（làm sau）' },
          ],
          correctId: 'a',
          explanation: '「マニュアル（manual）」は手順書・説明書。「マニュアル通り」は「手順書に書かれた通り」という意味で、決められた手順を守ることを強調します。',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 20,
    },
  },

  'n3-04-3': {
    courseTitle: { ja: 'N3 語彙強化 〜カタカナ語・複合語〜', vi: 'Củng cố từ vựng N3 - Từ Katakana và từ ghép' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3語彙: カタカナ語の読み方・変換ルール',
      titleTranslation: 'Từ vựng N3: Quy tắc đọc và chuyển đổi từ Katakana',
      introduction: `カタカナ語（外来語）は英語をはじめ、フランス語・ドイツ語・ポルトガル語などからも来ています。「英語と発音が違う」「意味が日本語独自に変わっている」ことも多く、ルールを知ることで新しいカタカナ語も推測しやすくなります。

Từ Katakana (từ ngoại lai) có nguồn gốc từ tiếng Anh, Pháp, Đức, Bồ Đào Nha... Nhiều từ có phát âm khác tiếng Anh hoặc nghĩa đã thay đổi theo cách riêng của tiếng Nhật. Nắm quy tắc giúp đoán được các từ Katakana mới.`,
      keyPoints: [
        '短縮：長い語は短くする（リモコン ← リモートコントロール）',
        '母音の変化：英語の「r」→ ラ行（radio→ラジオ）',
        '子音の処理：末尾に小さい「ッ」（truck→トラック）',
        '和製英語：英語にない意味（ハンドル＝steering wheel）',
        '語尾の処理：「-tion」→「ション」（station→ステーション）',
      ],
      vocabulary: [
        { word: 'リモコン', reading: 'りもこん', meaning: 'リモートコントロールの略（điều khiển từ xa）', example: 'リモコンでテレビを操作する' },
        { word: 'スマホ', reading: 'すまほ', meaning: 'スマートフォンの略（điện thoại thông minh）', example: 'スマホで連絡する' },
        { word: 'エアコン', reading: 'えあこん', meaning: 'エアコンディショナーの略（điều hòa）', example: 'エアコンをつけてください' },
        { word: 'パソコン', reading: 'ぱそこん', meaning: 'パーソナルコンピューターの略（máy tính）', example: 'パソコンで記録する' },
        { word: 'ナイター', reading: 'ないたー', meaning: '夜間試合（和製英語）（trận đấu đêm）', example: 'ナイターゲームを見る' },
      ],
      examples: [
        { japanese: '（短縮の例）スマートフォン → スマホ / エアコンディショナー → エアコン / リモートコントロール → リモコン / パーソナルコンピューター → パソコン', reading: 'すまーとふぉん → すまほ / えあこんでぃしょなー → えあこん', translation: '(Ví dụ rút gọn) Smartphone → スマホ / Air conditioner → エアコン / Remote control → リモコン / Personal computer → パソコン' },
        { japanese: '（和製英語の例）ハンドル（steering wheel）/ ガソリンスタンド（gas station）/ クーラーボックス（cooler box）', reading: 'はんどる / がそりんすたんど / くーらーぼっくす', translation: '(Ví dụ từ Nhật gốc Anh) ハンドル（tay lái）/ ガソリンスタンド（trạm xăng）/ クーラーボックス（hộp giữ lạnh）' },
      ],
      grammarNote: `【カタカナ語変換のルール】
① 短縮（rút gọn）：長い語を短く
　リモートコントロール → リモコン
　スマートフォン → スマホ
② 語尾パターン：
　〜tion → 〜ション（station → ステーション）
　〜er → 〜ー（computer → コンピューター）
　〜al → 〜ル（manual → マニュアル）
③ 和製英語（Từ Nhật gốc Anh, không dùng trong tiếng Anh）：
　ハンドル（steering wheel）
　クレーム（complaint）
　サラリーマン（office worker）`,
      quizzes: [
        {
          question: '「スマホ」は何の略？',
          options: [
            { id: 'a', text: 'スマートホーム（smart home）' },
            { id: 'b', text: 'スマートフォン（smartphone）' },
            { id: 'c', text: 'スマートホテル（smart hotel）' },
            { id: 'd', text: 'スマートボタン（smart button）' },
          ],
          correctId: 'b',
          explanation: '「スマホ」は「スマートフォン（smartphone）」の短縮形。日本語では長い外来語を短縮することが多いです。',
          difficulty: 'easy' as const,
        },
        {
          question: '英語の「-tion」はカタカナ語でどう変わる？',
          options: [
            { id: 'a', text: '〜ツ' },
            { id: 'b', text: '〜ション' },
            { id: 'c', text: '〜ト' },
            { id: 'd', text: '〜ズ' },
          ],
          correctId: 'b',
          explanation: '英語の「-tion」はカタカナでは「〜ション」になります。例：station→ステーション、communication→コミュニケーション、rehabilitation→リハビリテーション。',
          difficulty: 'easy' as const,
        },
        {
          question: '「和製英語」とは？',
          options: [
            { id: 'a', text: '英語と全く同じ意味のカタカナ語' },
            { id: 'b', text: '日本で作られた英語風の語で英語では通じない表現' },
            { id: 'c', text: '英語の正しい発音のカタカナ表記' },
            { id: 'd', text: 'フランス語起源のカタカナ語' },
          ],
          correctId: 'b',
          explanation: '「和製英語」は英語に見えるが実際の英語では通じない日本製の語。例：ハンドル（英：steering wheel）、クレーム（英：complaint）、ガソリンスタンド（英：gas station）。',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 20,
    },
  },

  'n3-04-4': {
    courseTitle: { ja: 'N3 語彙強化 〜カタカナ語・複合語〜', vi: 'Củng cố từ vựng N3 - Từ Katakana và từ ghép' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3語彙: 複合動詞①（〜出す・〜込む・〜上げる）',
      titleTranslation: 'Từ vựng N3: Động từ ghép①（〜出す・〜込む・〜上げる）',
      introduction: `複合動詞（động từ ghép）は2つの動詞を組み合わせた語で、N3以上でよく使われます。「〜出す」「〜込む」「〜上げる」などの後半部分が方向・結果・意味を追加します。介護現場でも「取り出す・飲み込む・持ち上げる」など多く使われます。

Động từ ghép là từ kết hợp 2 động từ, thường dùng từ N3 trở lên. Phần sau như 〜出す, 〜込む, 〜上げる bổ sung nghĩa về hướng, kết quả. Trong điều dưỡng cũng dùng nhiều như 取り出す, 飲み込む, 持ち上げる.`,
      keyPoints: [
        '〜出す（dashi）: 内から外へ・始まり — lấy ra / bắt đầu đột ngột（取り出す・話し出す・飛び出す）',
        '〜込む（komu）: 内へ入る・深く — đưa vào / sâu hơn（飲み込む・押し込む・落ち込む）',
        '〜上げる（ageru）: 上方向・完成 — nâng lên / hoàn thành（持ち上げる・仕上げる・立ち上げる）',
        '動詞+動詞の組み合わせ：前の動詞が主な動作、後の動詞が方向・結果を示す',
        '介護でよく使う：持ち上げる・取り出す・飲み込む・申し込む・思い出す',
      ],
      vocabulary: [
        { word: '取り出す', reading: 'とりだす', meaning: '中から取り出す（lấy ra）', example: '薬を取り出す' },
        { word: '飲み込む', reading: 'のみこむ', meaning: '口に入れて飲む（nuốt）', example: '薬を飲み込む' },
        { word: '持ち上げる', reading: 'もちあげる', meaning: '下から上へ上げる（nâng lên）', example: '荷物を持ち上げる' },
        { word: '申し込む', reading: 'もうしこむ', meaning: '正式に申請する（đăng ký）', example: '研修に申し込む' },
        { word: '思い出す', reading: 'おもいだす', meaning: '記憶を呼び戻す（nhớ lại）', example: '名前を思い出す' },
      ],
      examples: [
        { japanese: '「薬ケースから薬を取り出して、コップの水と一緒に飲み込んでください。」', reading: 'くすりけーすからくすりをとりだして、こっぷのみずといっしょにのみこんでください。', translation: '"Hãy lấy thuốc ra từ hộp và nuốt cùng với nước trong cốc."' },
        { japanese: '「移乗の際は、しっかり体を持ち上げてから車椅子に移ってください。」', reading: 'いじょうのさいは、しっかりからだをもちあげてからくるまいすにうつってください。', translation: '"Khi chuyển vị trí, hãy nâng người lên hẳn rồi mới chuyển sang xe lăn."' },
      ],
      grammarNote: `【〜出す・〜込む・〜上げる の意味まとめ】
〜出す（lấy ra / bắt đầu đột ngột）：
取り出す・飛び出す・話し出す・思い出す・作り出す

〜込む（đưa vào / sâu hơn）：
飲み込む・押し込む・落ち込む・申し込む・信じ込む

〜上げる（nâng lên / hoàn thành）：
持ち上げる・立ち上げる・仕上げる・作り上げる・盛り上げる

【介護現場でよく使う複合動詞】
取り出す / 飲み込む / 持ち上げる / 申し込む / 思い出す
引き上げる / 抱き上げる / 立ち上がる / 座り込む`,
      quizzes: [
        {
          question: '「飲み込む」の意味は？',
          options: [
            { id: 'a', text: '吐き出す（nôn ra）' },
            { id: 'b', text: '口に入れて飲む（nuốt）' },
            { id: 'c', text: '飲み始める（bắt đầu uống）' },
            { id: 'd', text: '飲まない（không uống）' },
          ],
          correctId: 'b',
          explanation: '「飲み込む」は「口の中のものを飲んで喉を通す」こと。「込む」は「内部へ」の方向を示します。高齢者の嚥下障害（えんげしょうがい）のケアで重要な語です。',
          difficulty: 'easy' as const,
        },
        {
          question: '「〜出す」が持つ意味として正しいものは？',
          options: [
            { id: 'a', text: '内から外へ・突然始まる（lấy ra/bắt đầu đột ngột）' },
            { id: 'b', text: '内へ入る（đưa vào）' },
            { id: 'c', text: '上へ移動する（nâng lên）' },
            { id: 'd', text: '完全に終わる（hoàn thành）' },
          ],
          correctId: 'a',
          explanation: '「〜出す」は「内から外への移動」または「突然動作が始まる」を示します。取り出す（lấy ra）、話し出す（bắt đầu nói）、飛び出す（nhảy ra）などが例です。',
          difficulty: 'medium' as const,
        },
        {
          question: '「申し込む」の「込む」はどんな意味を加えている？',
          options: [
            { id: 'a', text: '外に出る（ra ngoài）' },
            { id: 'b', text: '上に上がる（nâng lên）' },
            { id: 'c', text: '内部・深く入る（vào trong/sâu）' },
            { id: 'd', text: '完全に終わる（hoàn thành）' },
          ],
          correctId: 'c',
          explanation: '「込む」は「内部へ・深く」の方向性を示します。「申し込む」＝「申し（申請）+ 込む（内部へ入れる）」→「正式に申請して中に入れる」という意味になります。',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 25,
    },
  },

  'n3-04-5': {
    courseTitle: { ja: 'N3 語彙強化 〜カタカナ語・複合語〜', vi: 'Củng cố từ vựng N3 - Từ Katakana và từ ghép' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3語彙: 複合動詞②（〜切る・〜続ける・〜直す）',
      titleTranslation: 'Từ vựng N3: Động từ ghép②（〜切る・〜続ける・〜直す）',
      introduction: `複合動詞の第2回です。「〜切る」「〜続ける」「〜直す」は動作の「完了・継続・やり直し」を表し、日常会話でよく使われます。介護記録や指示の中でも「食べ切れない・観察し続ける・書き直す」など頻繁に出てきます。

Phần 2 động từ ghép. 〜切る, 〜続ける, 〜直す diễn đạt "hoàn thành, tiếp tục, làm lại" của động tác, thường dùng trong hội thoại hàng ngày. Trong hồ sơ và chỉ thị điều dưỡng cũng thường xuất hiện như 食べ切れない, 観察し続ける, 書き直す.`,
      keyPoints: [
        '〜切る（kiru）: 完全に終わる — hoàn toàn/hết（食べ切る・飲み切る・やり切る）',
        '〜切れない: できない — không thể làm hết（食べ切れない・飲み切れない）',
        '〜続ける（tsuzukeru）: 継続してする — tiếp tục（観察し続ける・飲み続ける・働き続ける）',
        '〜直す（naosu）: もう一度する — làm lại（書き直す・やり直す・確認し直す）',
        '〜終わる（owaru）: 完了する — kết thúc（食べ終わる・読み終わる）',
      ],
      vocabulary: [
        { word: '食べ切る', reading: 'たべきる', meaning: '全部食べる（ăn hết）', example: 'お膳を食べ切った' },
        { word: '観察し続ける', reading: 'かんさつしつづける', meaning: 'ずっと観察する（tiếp tục quan sát）', example: '状態を観察し続ける' },
        { word: '書き直す', reading: 'かきなおす', meaning: 'もう一度書く（viết lại）', example: '記録を書き直す' },
        { word: 'やり切る', reading: 'やりきる', meaning: '最後まで完了する（hoàn thành đến cùng）', example: 'リハビリをやり切る' },
        { word: '飲み続ける', reading: 'のみつづける', meaning: 'ずっと飲む（tiếp tục uống）', example: '薬を飲み続ける' },
      ],
      examples: [
        { japanese: '「食事を食べ切れない場合は、摂取量を記録してください。」', reading: 'しょくじをたべきれないばあいは、せっしゅりょうをきろくしてください。', translation: '"Nếu không ăn hết bữa, hãy ghi lại lượng đã ăn."' },
        { japanese: '「この薬は途中でやめず、医師の指示通りに飲み続けてください。」', reading: 'このくすりはとちゅうでやめず、いしのしじどおりにのみつづけてください。', translation: '"Đừng dừng thuốc này giữa chừng, hãy tiếp tục uống theo chỉ dẫn của bác sĩ."' },
      ],
      grammarNote: `【〜切る・〜続ける・〜直す の意味まとめ】
〜切る（hoàn toàn/hết sức）：
食べ切る / 飲み切る / 使い切る / やり切る / 言い切る
※「〜切れない」= できない、の意味

〜続ける（tiếp tục）：
観察し続ける / 飲み続ける / 働き続ける / 話し続ける

〜直す（làm lại）：
書き直す / やり直す / 確認し直す / 考え直す / 読み直す

〜終わる（kết thúc/xong）：
食べ終わる / 飲み終わる / 書き終わる / 読み終わる`,
      quizzes: [
        {
          question: '「食べ切れない」の意味は？',
          options: [
            { id: 'a', text: '全部食べた（ăn hết）' },
            { id: 'b', text: '全部食べることができない（không thể ăn hết）' },
            { id: 'c', text: '食べたくない（không muốn ăn）' },
            { id: 'd', text: '食べ終わった（ăn xong）' },
          ],
          correctId: 'b',
          explanation: '「〜切れない」は「完全にすることができない」の意味。「食べ切れない」＝「全部食べることができない」で、食欲不振などで量が多い場合に使います。',
          difficulty: 'easy' as const,
        },
        {
          question: '「書き直す」の意味は？',
          options: [
            { id: 'a', text: '書き終わる（viết xong）' },
            { id: 'b', text: '書き続ける（tiếp tục viết）' },
            { id: 'c', text: 'もう一度書く（viết lại）' },
            { id: 'd', text: '書き始める（bắt đầu viết）' },
          ],
          correctId: 'c',
          explanation: '「〜直す」は「もう一度する」という意味を加えます。「書き直す」＝「間違いなどがあって、もう一度書く」こと。',
          difficulty: 'easy' as const,
        },
        {
          question: '「観察し続ける」の意味は？',
          options: [
            { id: 'a', text: '観察が終わった（quan sát xong）' },
            { id: 'b', text: '継続して観察する（tiếp tục quan sát）' },
            { id: 'c', text: 'もう一度観察する（quan sát lại）' },
            { id: 'd', text: '観察できない（không thể quan sát）' },
          ],
          correctId: 'b',
          explanation: '「〜続ける」は「継続してする」という意味。「観察し続ける」＝「ずっと継続して観察する」こと。申し送りで「引き続き観察をお願いします」と同様の意味です。',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 25,
    },
  },

  'n3-04-6': {
    courseTitle: { ja: 'N3 語彙強化 〜カタカナ語・複合語〜', vi: 'Củng cố từ vựng N3 - Từ Katakana và từ ghép' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3語彙: 複合動詞③（〜合う・〜かける・〜始める）',
      titleTranslation: 'Từ vựng N3: Động từ ghép③（〜合う・〜かける・〜始める）',
      introduction: `複合動詞の第3回です。「〜合う」「〜かける」「〜始める」は日常・職場でよく使われる動詞です。「話し合う・声をかける・歩き始める」など、コミュニケーションや状態変化を表す複合動詞をマスターします。

Phần 3 động từ ghép. 〜合う, 〜かける, 〜始める thường dùng trong cuộc sống và nơi làm việc. Nắm vững các động từ ghép như 話し合う, 声をかける, 歩き始める diễn đạt giao tiếp và thay đổi trạng thái.`,
      keyPoints: [
        '〜合う（au）: お互いに〜する — cùng nhau（話し合う・助け合う・確認し合う）',
        '〜かける（kakeru）: 途中・外に向けて — đang làm dở/hướng ra ngoài（話しかける・声をかける・食べかける）',
        '〜始める（hajimeru）: 動作の開始 — bắt đầu（歩き始める・話し始める・食べ始める）',
        '〜終わる（owaru）: 動作の完了 — kết thúc（食べ終わる・読み終わる）',
        '〜やすい / 〜にくい: しやすい / しにくい — dễ/khó（食べやすい・飲みやすい）',
      ],
      vocabulary: [
        { word: '話し合う', reading: 'はなしあう', meaning: 'お互いに話す（thảo luận）', example: 'スタッフで話し合う' },
        { word: '声をかける', reading: 'こえをかける', meaning: '呼びかける（gọi/tiếp chuyện）', example: '利用者に声をかける' },
        { word: '歩き始める', reading: 'あるきはじめる', meaning: '歩き出す（bắt đầu đi）', example: 'リハビリで歩き始める' },
        { word: '助け合う', reading: 'たすけあう', meaning: 'お互いに助ける（giúp đỡ lẫn nhau）', example: 'チームで助け合う' },
        { word: '食べかける', reading: 'たべかける', meaning: '食べている途中（đang ăn dở）', example: '食べかけのご飯を残す' },
      ],
      dialogue: [
        { speaker: 'A', japanese: '山田様が廊下を歩き始めましたよ。', reading: 'やまださまがろうかをあるきはじめましたよ。', translation: 'Ông Yamada bắt đầu đi lại ở hành lang rồi đấy.' },
        { speaker: 'B', japanese: 'そうですか。転倒しないよう、声をかけてサポートしてあげてください。', reading: 'そうですか。てんとうしないよう、こえをかけてさぽーとしてあげてください。', translation: 'Vậy à. Hãy gọi và hỗ trợ để ông ấy không bị ngã nhé.' },
      ],
      examples: [
        { japanese: '「次のシフト変更についてスタッフ全員で話し合いましょう。」', reading: 'つぎのしふとへんこうについてすたっふぜんいんではなしあいましょう。', translation: '"Hãy cùng nhau thảo luận về việc thay đổi ca làm việc tiếp theo."' },
        { japanese: '「利用者様が食べやすいように、刻み食に変更しました。」', reading: 'りようしゃさまがたべやすいように、きざみしょくにへんこうしました。', translation: '"Để người dùng ăn dễ hơn, tôi đã đổi sang dạng thức ăn thái nhỏ."' },
      ],
      grammarNote: `【〜合う・〜かける・〜始める の意味まとめ】
〜合う（cùng nhau・lẫn nhau）：
話し合う / 助け合う / 確認し合う / 支え合う / 見つめ合う

〜かける（đang dở/hướng ra ngoài）：
声をかける / 話しかける / 食べかける / 飲みかける / 駆けかける

〜始める（bắt đầu）：
歩き始める / 話し始める / 食べ始める / 動き始める

【介護で重要】
声をかける = 利用者に話しかける（声かけ）
食べやすい / 飲みやすい = 食事形態の選択で使う`,
      quizzes: [
        {
          question: '「声をかける」はどういう意味？',
          options: [
            { id: 'a', text: '声が出る（có tiếng）' },
            { id: 'b', text: '相手に話しかける（tiếp chuyện/gọi）' },
            { id: 'c', text: '声を出す練習（luyện giọng）' },
            { id: 'd', text: '電話する（gọi điện）' },
          ],
          correctId: 'b',
          explanation: '「声をかける」は「相手に話しかける・呼びかける」こと。介護現場では「利用者様に積極的に声かけをしてください」のように使います。「声かけ（こえかけ）」は介護の重要なケアのひとつです。',
          difficulty: 'easy' as const,
        },
        {
          question: '「話し合う」の意味は？',
          options: [
            { id: 'a', text: '一人で話す（nói một mình）' },
            { id: 'b', text: 'お互いに話し合って意見を交わす（thảo luận）' },
            { id: 'c', text: '話し終わる（nói xong）' },
            { id: 'd', text: '声をかける（gọi）' },
          ],
          correctId: 'b',
          explanation: '「〜合う」は「お互いに〜する」の意味。「話し合う」＝「お互いに話して意見を交わす」＝「thảo luận」。介護では「スタッフで話し合う」などのように使います。',
          difficulty: 'easy' as const,
        },
        {
          question: '「食べやすい」はどういう意味？',
          options: [
            { id: 'a', text: '食べたい（muốn ăn）' },
            { id: 'b', text: '食べることが簡単・しやすい（dễ ăn）' },
            { id: 'c', text: '食べすぎる（ăn quá nhiều）' },
            { id: 'd', text: '食べた（đã ăn）' },
          ],
          correctId: 'b',
          explanation: '「〜やすい」は「〜しやすい（dễ làm）」の意味。「食べやすい」＝「食べることが簡単・やりやすい」。介護では「食べやすい食事形態」として刻み食・ムース食などを指します。',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 25,
    },
  },

  'n3-04-7': {
    courseTitle: { ja: 'N3 語彙強化 〜カタカナ語・複合語〜', vi: 'Củng cố từ vựng N3 - Từ Katakana và từ ghép' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3語彙: 擬音語・擬態語①（体の状態・症状）',
      titleTranslation: 'Từ vựng N3: Từ tượng thanh/hình①（Trạng thái cơ thể/Triệu chứng）',
      introduction: `擬音語（từ tượng thanh）は音を表す語、擬態語（từ tượng hình）は状態・様子を表す語です。日本語には非常に多くあり、N3レベルでは体の状態・症状を表す擬態語が特に重要です。介護現場では「ズキズキ痛む・ふらふらする・ぐったりしている」などが利用者の訴えとしてよく出てきます。

Từ tượng thanh mô tả âm thanh, từ tượng hình mô tả trạng thái/hình thái. Tiếng Nhật có rất nhiều loại này, và từ tượng hình thể hiện trạng thái cơ thể/triệu chứng đặc biệt quan trọng ở N3. Trong điều dưỡng, các từ như ズキズキ痛む, ふらふらする, ぐったりしている thường xuất hiện trong lời than phiền của người dùng.`,
      keyPoints: [
        'ズキズキ：脈打つような痛み — đau nhói/đau theo nhịp（頭がズキズキ痛む）',
        'ふらふら：立ちくらみ・不安定 — choáng váng（立つとふらふらする）',
        'ぐったり：疲れて力がない様子 — kiệt sức/mệt lả（ぐったりしている）',
        'むかむか：吐き気がある感じ — buồn nôn（胃がむかむかする）',
        'ドキドキ：心臓が速く動く感じ — hồi hộp/tim đập nhanh（胸がドキドキする）',
      ],
      vocabulary: [
        { word: 'ズキズキ', reading: 'ずきずき', meaning: '脈打つような痛み（đau nhói）', example: '頭がズキズキ痛みます' },
        { word: 'ふらふら', reading: 'ふらふら', meaning: '体が不安定な様子（choáng váng）', example: '立つとふらふらします' },
        { word: 'ぐったり', reading: 'ぐったり', meaning: '疲れて力がない（kiệt sức）', example: 'ぐったりして動けない' },
        { word: 'むかむか', reading: 'むかむか', meaning: '吐き気がする（buồn nôn）', example: '胃がむかむかします' },
        { word: 'チクチク', reading: 'ちくちく', meaning: '針で刺すような痛み（đau châm chích）', example: '傷がチクチクします' },
      ],
      dialogue: [
        { speaker: '利用者', japanese: 'ちょっと頭がズキズキして、立つとふらふらします。', reading: 'ちょっとあたまがずきずきして、たつとふらふらします。', translation: 'Đầu tôi đau nhói và đứng dậy thì thấy choáng váng.' },
        { speaker: 'スタッフ', japanese: '分かりました。体温と血圧を測りますね。ぐったりしていますか？', reading: 'わかりました。たいおんとけつあつをはかりますね。ぐったりしていますか？', translation: 'Tôi hiểu. Để tôi đo nhiệt độ và huyết áp nhé. Bạn cảm thấy kiệt sức không?' },
      ],
      examples: [
        { japanese: '「田中様が胃がむかむかすると訴えています。顔色も少し青白いです。」', reading: 'たなかさまがいがむかむかするとうったえています。かおいろもすこしあおじろいです。', translation: '"Bà Tanaka than phiền rằng dạ dày buồn nôn. Sắc mặt cũng hơi xanh xao."' },
      ],
      grammarNote: `【体の状態を表す擬態語一覧】
痛みの種類：
ズキズキ（đau nhói/theo nhịp）/ チクチク（đau châm）
ジンジン（đau rát/tê）/ ガンガン（đau dữ dội）/ シクシク（đau âm ỉ）

体の調子：
ふらふら（choáng váng）/ ぐったり（kiệt sức）
よろよろ（loạng choạng）/ だるだる（nặng nề）

消化器系：
むかむか（buồn nôn）/ もたれる（khó tiêu）

心臓・呼吸：
ドキドキ（tim đập nhanh）/ ハアハア（thở hổn hển）`,
      quizzes: [
        {
          question: '「頭がズキズキ痛む」はどんな痛み？',
          options: [
            { id: 'a', text: 'じわじわとした鈍痛（đau âm ỉ）' },
            { id: 'b', text: '脈打つような痛み（đau nhói theo nhịp）' },
            { id: 'c', text: '針で刺すような痛み（đau châm）' },
            { id: 'd', text: '重い痛み（đau nặng nề）' },
          ],
          correctId: 'b',
          explanation: '「ズキズキ」は心臓の鼓動に合わせてズキン・ズキンと脈打つように痛む感じ。偏頭痛や歯痛によく使われます。介護では利用者の訴えを理解するために重要です。',
          difficulty: 'easy' as const,
        },
        {
          question: '「立つとふらふらします」はどんな状態？',
          options: [
            { id: 'a', text: '立つのが怖い（sợ đứng）' },
            { id: 'b', text: '体がよく動く（cơ thể linh hoạt）' },
            { id: 'c', text: '立つと体が不安定・めまいがする（choáng váng）' },
            { id: 'd', text: '元気いっぱい（đầy năng lượng）' },
          ],
          correctId: 'c',
          explanation: '「ふらふら」は体が不安定でしっかり立てない様子。立ちくらみ（tụt huyết áp khi đứng）や平衡感覚の問題があるときによく使われます。転倒のリスクサインとして重要です。',
          difficulty: 'easy' as const,
        },
        {
          question: '「胃がむかむかする」はどんな訴え？',
          options: [
            { id: 'a', text: '空腹（đói）' },
            { id: 'b', text: '吐き気・むかつき（buồn nôn）' },
            { id: 'c', text: '満腹（no）' },
            { id: 'd', text: '喉が渇く（khát nước）' },
          ],
          correctId: 'b',
          explanation: '「むかむか」は吐き気・むかつきの感覚。「胃がむかむかする」は「気持ち悪い・吐きそうな感じ」を表します。介護記録では「嘔気（おうき）の訴えあり」と記録します。',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 25,
    },
  },

  'n3-04-9': {
    courseTitle: { ja: 'N3 語彙強化 〜カタカナ語・複合語〜', vi: 'Củng cố từ vựng N3 - Từ Katakana và từ ghép' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3語彙: 接尾語〜的・〜化・〜性（造語力アップ）',
      titleTranslation: 'Từ vựng N3: Hậu tố 〜的・〜化・〜性（Tăng khả năng tạo từ）',
      introduction: `接尾語（hậu tố）は語の後ろにつけて新しい意味を作ります。「〜的」「〜化」「〜性」を理解することで、知らない語でも意味を推測できるようになります。N3の試験問題や医療・介護文書では、これらの接尾語を使った語が頻繁に出てきます。

Hậu tố gắn vào sau từ để tạo nghĩa mới. Hiểu 〜的, 〜化, 〜性 giúp đoán được nghĩa của những từ chưa biết. Trong đề thi N3 và tài liệu y tế/điều dưỡng, các từ dùng hậu tố này xuất hiện thường xuyên.`,
      keyPoints: [
        '〜的（てき）: 〜の性質を持つ・〜に関する（như/mang tính）→ 積極的・専門的・定期的',
        '〜化（か）: 〜の状態になる（trở thành/hóa）→ 高齢化・悪化・改善化・デジタル化',
        '〜性（せい）: 〜の性質・可能性（tính chất/khả năng）→ 安全性・可能性・重要性',
        '〜的：名詞・形容動詞を作る（積極的に・専門的な）',
        '〜化：サ変動詞を作る（高齢化する・悪化する）',
      ],
      vocabulary: [
        { word: '積極的', reading: 'せっきょくてき', meaning: 'やる気がある・前向き（tích cực）', example: '積極的に参加する' },
        { word: '高齢化', reading: 'こうれいか', meaning: '高齢者が増える（già hóa）', example: '社会の高齢化が進む' },
        { word: '可能性', reading: 'かのうせい', meaning: 'できるかもしれない度合（khả năng）', example: '回復の可能性がある' },
        { word: '定期的', reading: 'ていきてき', meaning: '決まった間隔で（định kỳ）', example: '定期的に検査する' },
        { word: '悪化', reading: 'あっか', meaning: '状態が悪くなる（xấu đi）', example: '症状が悪化する' },
      ],
      examples: [
        { japanese: '「利用者様の症状が悪化したため、定期的なバイタル測定を行うことになりました。」', reading: 'りようしゃさまのしょうじょうがあっかしたため、ていきてきなばいたるそくていをおこなうことになりました。', translation: '"Vì triệu chứng của người dùng xấu đi, chúng tôi sẽ tiến hành đo dấu hiệu sinh tồn định kỳ."' },
        { japanese: '「専門的な知識を身につけるため、積極的に研修に参加してください。」', reading: 'せんもんてきなちしきをみにつけるため、せっきょくてきにけんしゅうにさんかしてください。', translation: '"Để tích lũy kiến thức chuyên môn, hãy tích cực tham gia đào tạo."' },
      ],
      grammarNote: `【接尾語の意味まとめ】
〜的（てき）= 〜の性質を持つ・〜に関する：
積極的 / 消極的 / 定期的 / 専門的 / 具体的 / 一般的

〜化（か）= 〜の状態になる（サ変動詞）：
高齢化 / 悪化 / 改善 / 変化 / 強化 / 活性化 / 近代化

〜性（せい）= 〜の性質・可能性：
可能性 / 安全性 / 重要性 / 必要性 / 有効性 / 信頼性

【読み方のコツ】
〜的 = 〜てき（ない場合もある：的（まと））
〜化 = 〜か
〜性 = 〜せい（ただし性質（せいしつ）は別）`,
      quizzes: [
        {
          question: '「積極的に参加する」の「積極的」の意味は？',
          options: [
            { id: 'a', text: '受け身に・消極的に（thụ động）' },
            { id: 'b', text: '自らやる気を持って・前向きに（tích cực/chủ động）' },
            { id: 'c', text: '強制的に（bắt buộc）' },
            { id: 'd', text: 'たまに（thỉnh thoảng）' },
          ],
          correctId: 'b',
          explanation: '「積極的（せっきょくてき）」は「自ら進んで・前向きに・やる気を持って」の意味。反対語は「消極的（しょうきょくてき）」です。',
          difficulty: 'easy' as const,
        },
        {
          question: '「高齢化」の「〜化」はどんな意味？',
          options: [
            { id: 'a', text: '〜が減る（giảm）' },
            { id: 'b', text: '〜の状態になる・変化する（trở thành/hóa）' },
            { id: 'c', text: '〜が良くなる（tốt hơn）' },
            { id: 'd', text: '〜に関する（liên quan đến）' },
          ],
          correctId: 'b',
          explanation: '「〜化」は「〜の状態に変化する」を意味します。「高齢化」＝「高齢者が増える方向に変化すること（già hóa）」。「悪化」＝「悪い状態になること」。',
          difficulty: 'easy' as const,
        },
        {
          question: '「回復の可能性がある」の「可能性」の意味は？',
          options: [
            { id: 'a', text: '確実に回復する（chắc chắn phục hồi）' },
            { id: 'b', text: '回復できるかもしれない度合（khả năng phục hồi）' },
            { id: 'c', text: '回復できない（không thể phục hồi）' },
            { id: 'd', text: '回復が必要（cần phục hồi）' },
          ],
          correctId: 'b',
          explanation: '「可能性（かのうせい）」は「できるかもしれない度合・確率」の意味。「回復の可能性がある」＝「回復できるかもしれない」という不確かな未来を示します。',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 25,
    },
  },

  'n3-04-10': {
    courseTitle: { ja: 'N3 語彙強化 〜カタカナ語・複合語〜', vi: 'Củng cố từ vựng N3 - Từ Katakana và từ ghép' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3語彙: 接頭語（不〜・非〜・再〜・超〜）',
      titleTranslation: 'Từ vựng N3: Tiền tố（不〜・非〜・再〜・超〜）',
      introduction: `接頭語（tiền tố）は語の前につけて新しい意味を作ります。「不〜・非〜・再〜・超〜」などを理解すると、知らない語でも意味が推測できます。N3の試験問題では「不規則・非常識・再確認・超高齢社会」など、接頭語を使った語が多く出てきます。

Tiền tố gắn vào trước từ để tạo nghĩa mới. Hiểu 不〜, 非〜, 再〜, 超〜 giúp đoán được nghĩa của từ chưa biết. Trong đề thi N3, các từ dùng tiền tố như 不規則, 非常識, 再確認, 超高齢社会 xuất hiện nhiều.`,
      keyPoints: [
        '不〜（ふ）: 否定・反対（phủ định）→ 不規則・不安定・不満・不安',
        '非〜（ひ）: 〜でない・〜以外（không phải）→ 非常識・非公式・非常',
        '再〜（さい）: もう一度（làm lại）→ 再確認・再利用・再発・再検討',
        '超〜（ちょう）: 程度が非常に高い（siêu/cực）→ 超高齢・超えた・超重要',
        '未〜（み）: まだ〜していない（chưa）→ 未確認・未使用・未来',
      ],
      vocabulary: [
        { word: '不規則', reading: 'ふきそく', meaning: 'ルールがない・不安定（không đều/bất quy tắc）', example: '不規則な生活リズム' },
        { word: '再確認', reading: 'さいかくにん', meaning: 'もう一度確認する（xác nhận lại）', example: '内容を再確認する' },
        { word: '非常識', reading: 'ひじょうしき', meaning: '常識に反する（thiếu ý thức/vô lễ）', example: '非常識な行動' },
        { word: '不安定', reading: 'ふあんてい', meaning: '安定していない（không ổn định）', example: 'バイタルが不安定だ' },
        { word: '未確認', reading: 'みかくにん', meaning: 'まだ確認していない（chưa xác nhận）', example: '未確認の情報' },
      ],
      examples: [
        { japanese: '「バイタルが不安定なため、再確認をお願いします。」', reading: 'ばいたるがふあんていなため、さいかくにんをおねがいします。', translation: '"Vì dấu hiệu sinh tồn không ổn định, nhờ bạn xác nhận lại."' },
        { japanese: '「超高齢社会の日本では、介護スタッフの確保が重要な課題です。」', reading: 'ちょうこうれいしゃかいのにほんでは、かいごすたっふのかくほがじゅうようなかだいです。', translation: '"Tại Nhật Bản là xã hội siêu già hóa, đảm bảo nhân lực điều dưỡng là nhiệm vụ quan trọng."' },
      ],
      grammarNote: `【接頭語の意味まとめ】
不〜（phủ định/thiếu）：
不規則 / 不安定 / 不満 / 不安 / 不足 / 不明 / 不適切

非〜（không phải）：
非常識 / 非公式 / 非常（emergency）/ 非常口

再〜（làm lại）：
再確認 / 再利用 / 再発 / 再検討 / 再入院 / 再開

超〜（siêu/cực độ）：
超高齢 / 超重要 / 超多忙

未〜（chưa）：
未確認 / 未使用 / 未来 / 未経験 / 未成年`,
      quizzes: [
        {
          question: '「不安定」の意味は？',
          options: [
            { id: 'a', text: '非常に安定している（rất ổn định）' },
            { id: 'b', text: '安定していない（không ổn định）' },
            { id: 'c', text: '少し安定している（hơi ổn định）' },
            { id: 'd', text: '安定を確認した（đã xác nhận ổn định）' },
          ],
          correctId: 'b',
          explanation: '「不〜」は否定・反対を表す接頭語。「不安定」＝「安定していない」。医療・介護では「バイタルが不安定」のように、生命徴候が正常範囲でない状態を指します。',
          difficulty: 'easy' as const,
        },
        {
          question: '「再確認」の意味は？',
          options: [
            { id: 'a', text: '確認しない（không xác nhận）' },
            { id: 'b', text: 'もう一度確認する（xác nhận lại）' },
            { id: 'c', text: '最初の確認（lần xác nhận đầu）' },
            { id: 'd', text: '確認が終わった（đã xác nhận xong）' },
          ],
          correctId: 'b',
          explanation: '「再〜」は「もう一度（làm lại）」を意味します。「再確認」＝「もう一度確認する（xác nhận lại）」。業務で「念のため再確認してください」のように使います。',
          difficulty: 'easy' as const,
        },
        {
          question: '「未確認の情報」はどういう意味？',
          options: [
            { id: 'a', text: '確認済みの情報（thông tin đã xác nhận）' },
            { id: 'b', text: 'まだ確認されていない情報（thông tin chưa xác nhận）' },
            { id: 'c', text: '間違いの情報（thông tin sai）' },
            { id: 'd', text: '古い情報（thông tin cũ）' },
          ],
          correctId: 'b',
          explanation: '「未〜」は「まだ〜していない（chưa）」を意味します。「未確認」＝「まだ確認していない」。「未確認の情報」は信頼性が低いため、確認が必要です。',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 25,
    },
  },

  'n3-04-11': {
    courseTitle: { ja: 'N3 語彙強化 〜カタカナ語・複合語〜', vi: 'Củng cố từ vựng N3 - Từ Katakana và từ ghép' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3語彙: 同音異義語（発音が同じで意味が違う語）',
      titleTranslation: 'Từ vựng N3: Từ đồng âm dị nghĩa',
      introduction: `同音異義語（từ đồng âm dị nghĩa）は発音が同じでも意味が異なる語です。日本語には漢字があるため多く存在し、N3の試験・介護記録では正確な使い分けが求められます。「こうかん・いたい・きかん・かいご」など、文脈から正しい意味を判断する力が必要です。

Từ đồng âm dị nghĩa là những từ phát âm giống nhau nhưng nghĩa khác nhau. Tiếng Nhật có nhiều vì có chữ Hán. Trong thi N3 và hồ sơ điều dưỡng cần phân biệt chính xác. Cần khả năng phán đoán nghĩa đúng từ văn cảnh cho các từ như こうかん, いたい, きかん, かいご.`,
      keyPoints: [
        'こうかん：交換（trao đổi）/ 好感（cảm tình）→ 文脈で判断',
        'いたい：痛い（đau）/ 遺体（thi thể）→ 漢字で区別',
        'きかん：期間（thời gian）/ 機関（cơ quan）/ 器官（cơ quan bộ phận）',
        'かいご：介護（chăm sóc）/ 介抱（giúp đỡ người ốm）',
        'ほうこく：報告（báo cáo）/ 法国（nước Pháp）→ 文脈で判断',
      ],
      vocabulary: [
        { word: '交換', reading: 'こうかん', meaning: '取り換える（trao đổi/thay thế）', example: 'おむつを交換する' },
        { word: '好感', reading: 'こうかん', meaning: 'いい印象（cảm tình tốt）', example: '利用者に好感を持たれる' },
        { word: '期間', reading: 'きかん', meaning: '時間の長さ（khoảng thời gian）', example: '入院期間は2週間' },
        { word: '機関', reading: 'きかん', meaning: '組織・機関（cơ quan/tổ chức）', example: '医療機関に相談する' },
        { word: '器官', reading: 'きかん', meaning: '体の部位（cơ quan bộ phận cơ thể）', example: '消化器官に問題がある' },
      ],
      examples: [
        { japanese: '「定期的におむつ交換を行ってください。（交換＝取り換え）」「田中様は職員への好感を示した。（好感＝いい印象）」', reading: 'ていきてきにおむつこうかんをおこなってください。たなかさまはしょくいんへのこうかんをしめした。', translation: '"Hãy thay tã định kỳ. (交換＝thay thế)" / "Bà Tanaka tỏ ra có thiện cảm với nhân viên. (好感＝thiện cảm)"' },
        { japanese: '「入院期間（きかん）中は、医療機関（きかん）の指示に従ってください。」', reading: 'にゅういんきかんちゅうは、いりょうきかんのしじにしたがってください。', translation: '"Trong thời gian nằm viện (期間), hãy làm theo chỉ dẫn của cơ sở y tế (機関)."' },
      ],
      grammarNote: `【介護でよく出る同音異義語】
こうかん：交換（取り換え）/ 好感（良い印象）
きかん：期間（時間）/ 機関（組織）/ 器官（体の部分）
いたい：痛い（痛み）/ 遺体（死体）
かいふく：回復（回復する）/ 快復（病気が良くなる）
しんさつ：診察（医師に診てもらう）
かんさつ：観察（よく見る）
ちりょう：治療（病気を治す）
きろく：記録（記録する）/ 記憶（覚えている）

【見分け方】
① 文脈から判断する
② 漢字を確認する（読めれば区別できる）
③ 前後の語との関係を見る`,
      quizzes: [
        {
          question: '「おむつを交換する」の「こうかん」はどの漢字？',
          options: [
            { id: 'a', text: '好感（cảm tình）' },
            { id: 'b', text: '交換（thay thế）' },
            { id: 'c', text: '高官（quan chức）' },
            { id: 'd', text: '後患（hậu quả）' },
          ],
          correctId: 'b',
          explanation: 'おむつを「交換（こうかん）」は「取り換える・替える」の意味。介護現場では「おむつ交換」「シーツ交換」など「交換」をよく使います。',
          difficulty: 'easy' as const,
        },
        {
          question: '「入院期間」の「きかん」の漢字は？',
          options: [
            { id: 'a', text: '機関（cơ quan）' },
            { id: 'b', text: '器官（bộ phận cơ thể）' },
            { id: 'c', text: '期間（khoảng thời gian）' },
            { id: 'd', text: '気管（khí quản）' },
          ],
          correctId: 'c',
          explanation: '「期間（きかん）」は「時間の長さ（khoảng thời gian）」。「入院期間」＝「入院している時間の長さ」。「機関（機 = 機械）」は組織、「器官（器 = 器）」は体の部位です。',
          difficulty: 'medium' as const,
        },
        {
          question: '「医療機関に相談する」の「機関」の意味は？',
          options: [
            { id: 'a', text: '時間の長さ（khoảng thời gian）' },
            { id: 'b', text: '体の部位（bộ phận cơ thể）' },
            { id: 'c', text: '組織・機関（tổ chức/cơ quan）' },
            { id: 'd', text: '機械（máy móc）' },
          ],
          correctId: 'c',
          explanation: '「機関（きかん）」は「組織・機構（tổ chức）」の意味。「医療機関」＝「病院・診療所などの医療を行う組織」。「行政機関」「公的機関」なども同じ使い方です。',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 25,
    },
  },

  'n3-04-12': {
    courseTitle: { ja: 'N3 語彙強化 〜カタカナ語・複合語〜', vi: 'Củng cố từ vựng N3 - Từ Katakana và từ ghép' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3語彙: 類義語（似た意味の語を使い分ける）',
      titleTranslation: 'Từ vựng N3: Từ đồng nghĩa（Phân biệt từ cùng nghĩa）',
      introduction: `類義語（từ đồng nghĩa）は似た意味を持つ語ですが、微妙なニュアンスの違いがあります。N3試験では「次の言葉に最も意味が近いものは？」という類義語問題がよく出ます。介護現場でも「観察・確認・モニタリング」など似た意味の語を場面によって使い分ける力が必要です。

Từ đồng nghĩa là những từ có nghĩa gần giống nhau nhưng có sắc thái khác nhau. Trong thi N3 thường có câu hỏi "từ nào gần nghĩa nhất với từ này?". Trong điều dưỡng cũng cần phân biệt các từ gần nghĩa theo tình huống như 観察・確認・モニタリング.`,
      keyPoints: [
        '見る vs 観察する vs 確認する vs チェックする',
        '伝える vs 報告する vs 連絡する vs 相談する',
        '難しい vs 困難だ vs 複雑だ vs 厄介だ',
        '大切 vs 重要 vs 必要 vs 不可欠',
        '少し vs やや vs わずか vs ちょっと',
      ],
      vocabulary: [
        { word: '観察', reading: 'かんさつ', meaning: '注意して継続的に見る（quan sát）', example: '状態を観察する' },
        { word: '確認', reading: 'かくにん', meaning: '正しいか確かめる（xác nhận）', example: '薬の種類を確認する' },
        { word: '報告', reading: 'ほうこく', meaning: '上の人に伝える（báo cáo）', example: '上司に報告する' },
        { word: '連絡', reading: 'れんらく', meaning: '情報を伝える（liên lạc）', example: '家族に連絡する' },
        { word: '相談', reading: 'そうだん', meaning: '意見を聞いて話し合う（hỏi ý kiến/tham khảo）', example: '上司に相談する' },
      ],
      examples: [
        { japanese: '（使い分け例）報告：「田中様の体温が38度です」（事実を上に伝える）/ 連絡：「家族に入院の件を連絡した」（情報を関係者に伝える）/ 相談：「ケアプランについて相談したい」（一緒に考える）', reading: 'ほうこく：たなかさまのたいおんが38どです / れんらく：かぞくににゅういんのけんをれんらくした / そうだん：けあぷらんについてそうだんしたい', translation: '(Ví dụ phân biệt) Báo cáo: "Nhiệt độ bà Tanaka 38 độ" (truyền sự thật lên trên) / Liên lạc: "Đã liên lạc với gia đình về việc nhập viện" (truyền thông tin) / Tham khảo: "Muốn hỏi ý kiến về kế hoạch chăm sóc" (cùng suy nghĩ)' },
      ],
      grammarNote: `【よく混同する類義語の使い分け】
見る・観察・確認・チェック：
見る = 普通に目で見る
観察 = 注意して継続的に見る（専門的）
確認 = 正しいかどうか確かめる
チェック = 確認（カタカナ語でよりカジュアル）

報告・連絡・相談（報連相）：
報告 = 上の人に結果・事実を伝える（↑方向）
連絡 = 関係者に情報を伝える（横・双方向）
相談 = 意見を聞いて一緒に考える（問題解決）

大切・重要・必要・不可欠：
大切 = 大事・心を込めて扱う
重要 = 影響が大きい・serious
必要 = なければならない
不可欠 = 絶対に必要で、なくてはならない`,
      quizzes: [
        {
          question: '「上司に〇〇する」に最も適切なのは？（事実を伝えるとき）',
          options: [
            { id: 'a', text: '相談（hỏi ý kiến）' },
            { id: 'b', text: '報告（báo cáo）' },
            { id: 'c', text: '連絡（liên lạc）' },
            { id: 'd', text: '観察（quan sát）' },
          ],
          correctId: 'b',
          explanation: '「報告（ほうこく）」は「結果・事実を上の人に伝える」こと。「連絡（れんらく）」は横の関係で情報を伝えること。「相談（そうだん）」は一緒に考えること。事実を上司に伝えるのは「報告」です。',
          difficulty: 'medium' as const,
        },
        {
          question: '「観察する」と「確認する」の違いは？',
          options: [
            { id: 'a', text: '同じ意味（cùng nghĩa）' },
            { id: 'b', text: '観察＝継続的に注意して見る、確認＝正しいか確かめる' },
            { id: 'c', text: '観察＝上に報告、確認＝横に連絡' },
            { id: 'd', text: '観察＝記録する、確認＝写真を撮る' },
          ],
          correctId: 'b',
          explanation: '「観察（かんさつ）」は注意して継続的に見ること（例：状態の観察）。「確認（かくにん）」は正しいか・間違いないかを確かめること（例：薬の確認）。似ているが目的が異なります。',
          difficulty: 'medium' as const,
        },
        {
          question: '「不可欠」に最も近い意味は？',
          options: [
            { id: 'a', text: '少し必要（hơi cần thiết）' },
            { id: 'b', text: 'あれば良い（có thì tốt）' },
            { id: 'c', text: '絶対になければならない（tuyệt đối cần thiết）' },
            { id: 'd', text: '特に必要ない（không cần lắm）' },
          ],
          correctId: 'c',
          explanation: '「不可欠（ふかけつ）」は「絶対になければならない・なくてはならない」という最強の必要性を表します。「大切・重要・必要」よりも強い表現です。',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 25,
    },
  },

  'n3-04-13': {
    courseTitle: { ja: 'N3 語彙強化 〜カタカナ語・複合語〜', vi: 'Củng cố từ vựng N3 - Từ Katakana và từ ghép' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3語彙: 対義語（反対語）を使いこなす',
      titleTranslation: 'Từ vựng N3: Từ trái nghĩa',
      introduction: `対義語（từ trái nghĩa）は反対の意味を持つ語ペアです。N3試験では「〇〇の反対語はどれですか」という問題や、文章の中で対比的に使われる語が出ます。介護記録では「改善・悪化」「安定・不安定」など対義語ペアが頻出します。

Từ trái nghĩa là cặp từ có nghĩa ngược nhau. Trong thi N3 có câu hỏi "đâu là từ trái nghĩa của..." hoặc các từ được dùng đối lập trong văn bản. Trong hồ sơ điều dưỡng, các cặp trái nghĩa như 改善・悪化, 安定・不安定 xuất hiện thường xuyên.`,
      keyPoints: [
        '改善 ↔ 悪化（cải thiện ↔ xấu đi）',
        '増加 ↔ 減少（tăng ↔ giảm）',
        '促進 ↔ 抑制（thúc đẩy ↔ ức chế/hạn chế）',
        '積極的 ↔ 消極的（tích cực ↔ tiêu cực/thụ động）',
        '継続 ↔ 中断（tiếp tục ↔ ngừng）',
      ],
      vocabulary: [
        { word: '悪化', reading: 'あっか', meaning: '状態が悪くなる（xấu đi）', example: '症状が悪化する' },
        { word: '改善', reading: 'かいぜん', meaning: '状態が良くなる（cải thiện）', example: '体調が改善する' },
        { word: '増加', reading: 'ぞうか', meaning: '数・量が増える（tăng）', example: '利用者数が増加する' },
        { word: '減少', reading: 'げんしょう', meaning: '数・量が減る（giảm）', example: '食事量が減少する' },
        { word: '中断', reading: 'ちゅうだん', meaning: '途中でやめる（ngừng giữa chừng）', example: 'リハビリを中断する' },
      ],
      examples: [
        { japanese: '「昨日まで体調が悪化していましたが、今日は少し改善しています。」', reading: 'きのうまでたいちょうがあっかしていましたが、きょうはすこしかいぜんしています。', translation: '"Cho đến hôm qua sức khỏe vẫn xấu đi, nhưng hôm nay đã cải thiện một chút."' },
        { japanese: '「食事量が減少しているため、水分摂取量を増加させるよう働きかけています。」', reading: 'しょくじりょうがげんしょうしているため、すいぶんせっしゅりょうをぞうかさせるようはたらきかけています。', translation: '"Vì lượng ăn giảm, chúng tôi đang khuyến khích tăng lượng nước uống."' },
      ],
      grammarNote: `【介護・医療でよく使う対義語ペア】
改善（cải thiện）↔ 悪化（xấu đi）
安定（ổn định）↔ 不安定（không ổn định）
増加（tăng）↔ 減少（giảm）
継続（tiếp tục）↔ 中断（ngừng giữa chừng）
促進（thúc đẩy）↔ 抑制（ức chế）
積極的（tích cực）↔ 消極的（tiêu cực）
回復（hồi phục）↔ 悪化（xấu đi）
高い（cao）↔ 低い（thấp）
多い（nhiều）↔ 少ない（ít）
強い（mạnh）↔ 弱い（yếu）`,
      quizzes: [
        {
          question: '「改善」の対義語は？',
          options: [
            { id: 'a', text: '回復（hồi phục）' },
            { id: 'b', text: '悪化（xấu đi）' },
            { id: 'c', text: '安定（ổn định）' },
            { id: 'd', text: '継続（tiếp tục）' },
          ],
          correctId: 'b',
          explanation: '「改善（かいぜん）」＝良くなること、「悪化（あっか）」＝悪くなること。この対義語ペアは介護・医療記録で最もよく使われます。「状態が改善した」「症状が悪化した」のように使います。',
          difficulty: 'easy' as const,
        },
        {
          question: '「増加」の対義語は？',
          options: [
            { id: 'a', text: '継続（tiếp tục）' },
            { id: 'b', text: '中断（ngừng）' },
            { id: 'c', text: '減少（giảm）' },
            { id: 'd', text: '悪化（xấu đi）' },
          ],
          correctId: 'c',
          explanation: '「増加（ぞうか）」＝増える（tăng）、「減少（げんしょう）」＝減る（giảm）。食事量・水分量・体重などの変化を記録するときに使います。',
          difficulty: 'easy' as const,
        },
        {
          question: '「積極的」の対義語は？',
          options: [
            { id: 'a', text: '消極的（tiêu cực/thụ động）' },
            { id: 'b', text: '定期的（định kỳ）' },
            { id: 'c', text: '具体的（cụ thể）' },
            { id: 'd', text: '専門的（chuyên môn）' },
          ],
          correctId: 'a',
          explanation: '「積極的（せっきょくてき）」＝自ら進んでやる・前向き（tích cực）。「消極的（しょうきょくてき）」＝受け身・やる気がない（thụ động/tiêu cực）。この対義語ペアはリハビリへの取り組みを表すときに使います。',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 25,
    },
  },

  'n3-04-8': {
    courseTitle: { ja: 'N3 語彙強化 〜カタカナ語・複合語〜', vi: 'Củng cố từ vựng N3 - Từ Katakana và từ ghép' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3語彙: 擬音語・擬態語②（気持ち・様子・行動）',
      titleTranslation: 'Từ vựng N3: Từ tượng thanh/hình②（Cảm xúc/Hành động）',
      introduction: `擬態語の第2回は「気持ち・様子・行動」を表す語です。「イライラ・のんびり・しっかり・ぼんやり」など、感情状態や動作の様子を生き生きと表現する語を学びます。介護現場では利用者の精神状態や行動の観察に使われます。

Phần 2 từ tượng hình về "cảm xúc, trạng thái, hành động". Học các từ diễn đạt sinh động trạng thái cảm xúc và hành động như イライラ, のんびり, しっかり, ぼんやり. Trong điều dưỡng, dùng để quan sát trạng thái tinh thần và hành động của người dùng.`,
      keyPoints: [
        'イライラ：不満・苛立ちの状態 — bực bội（イライラしている）',
        'のんびり：ゆっくり・リラックス — thư thả（のんびりしている）',
        'しっかり：確実・強く — chắc chắn（しっかり食べる）',
        'ぼんやり：集中できない・ぼーっとしている — lơ đãng（ぼんやりしている）',
        'うとうと：軽く眠っている — lơ mơ/buồn ngủ（うとうとしている）',
      ],
      vocabulary: [
        { word: 'イライラ', reading: 'いらいら', meaning: '苛立ち・不満（bực bội）', example: '待ちすぎてイライラする' },
        { word: 'ぼんやり', reading: 'ぼんやり', meaning: '意識がはっきりしない（lơ đãng/mơ hồ）', example: 'ぼんやりしている' },
        { word: 'うとうと', reading: 'うとうと', meaning: '軽く眠りそうな（lơ mơ/buồn ngủ）', example: '食後にうとうとしている' },
        { word: 'しっかり', reading: 'しっかり', meaning: '確実・力強く（chắc chắn/đầy đủ）', example: 'しっかり食べてください' },
        { word: 'そわそわ', reading: 'そわそわ', meaning: '落ち着かない様子（lo lắng/bồn chồn）', example: 'そわそわしている' },
      ],
      dialogue: [
        { speaker: 'スタッフ', japanese: '山田様、少しぼんやりされていますね。体調はいかがですか。', reading: 'やまださま、すこしぼんやりされていますね。たいちょうはいかがですか。', translation: 'Ông Yamada, ông có vẻ lơ đãng một chút. Sức khỏe ông thế nào?' },
        { speaker: '利用者', japanese: '昨日あまり眠れなくて、うとうとしてしまいます。', reading: 'きのうあまりねむれなくて、うとうとしてしまいます。', translation: 'Hôm qua tôi không ngủ được, nên cứ lơ mơ.' },
      ],
      examples: [
        { japanese: '（観察記録）「山田様、午後より表情がぼんやりして、声かけへの反応が鈍い。バイタル測定し、報告済み。」', reading: 'やまださま、ごごよりひょうじょうがぼんやりして、こえかけへのはんのうがにぶい。ばいたるそくていし、ほうこくずみ。', translation: '(Hồ sơ quan sát) "Ông Yamada, từ chiều nét mặt lờ đờ, phản ứng với kích thích chậm. Đã đo dấu hiệu sinh tồn và báo cáo."' },
      ],
      grammarNote: `【気持ち・様子の擬態語一覧】
精神状態（trạng thái tinh thần）：
イライラ（bực bội）/ のんびり（thư thả）/ そわそわ（bồn chồn）
うきうき（phấn khởi）/ くよくよ（lo lắng/ủ rũ）

意識の状態（mức độ tỉnh táo）：
ぼんやり（lơ đãng）/ うとうと（lơ mơ）/ しっかり（tỉnh táo）
ぼーっと（ngơ ngác）

行動の様子（cách hành động）：
のろのろ（chậm chạp）/ てきぱき（nhanh nhẹn）
ふわふわ（bay bổng/lơ lửng）/ ぐらぐら（lung lay）`,
      quizzes: [
        {
          question: '「ぼんやりしている」はどんな状態？',
          options: [
            { id: 'a', text: 'とても元気（rất khỏe）' },
            { id: 'b', text: '意識・集中力がはっきりしない（lơ đãng/không tỉnh táo）' },
            { id: 'c', text: '機嫌が悪い（tâm trạng xấu）' },
            { id: 'd', text: '眠っている（đang ngủ）' },
          ],
          correctId: 'b',
          explanation: '「ぼんやり」は意識や集中力がはっきりしない状態。介護記録では「意識レベルの低下・反応が鈍い」のサインとして観察・記録します。',
          difficulty: 'easy' as const,
        },
        {
          question: '「うとうとしている」はどんな状態？',
          options: [
            { id: 'a', text: 'ぐっすり眠っている（ngủ sâu）' },
            { id: 'b', text: '軽く眠りそうな・半分眠っている（lơ mơ）' },
            { id: 'c', text: '活発に動いている（đang hoạt động）' },
            { id: 'd', text: 'イライラしている（bực bội）' },
          ],
          correctId: 'b',
          explanation: '「うとうと」は「軽く眠ろうとしている・半分眠っている」様子。「食後にうとうとしている」のように、食後の眠気や昼間の傾眠（けいみん）を表すときに使います。',
          difficulty: 'easy' as const,
        },
        {
          question: '利用者が「イライラしている」様子を観察したとき、正しい対応は？',
          options: [
            { id: 'a', text: '無視する' },
            { id: 'b', text: '声をかけて話を聞く・原因を探る' },
            { id: 'c', text: '叱る（la mắng）' },
            { id: 'd', text: '報告しない' },
          ],
          correctId: 'b',
          explanation: '「イライラ」している利用者には、まず優しく声をかけて話を聞きます。不満・痛み・環境など様々な原因がある可能性があり、観察して上司に報告することが大切です。',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 25,
    },
  },

  'n3-04-14': {
    courseTitle: { ja: 'N3 語彙強化 〜カタカナ語・複合語〜', vi: 'Củng cố từ vựng N3 - Từ Katakana và từ ghép' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3語彙: 慣用句①（体を使った表現）',
      titleTranslation: 'Từ vựng N3: Thành ngữ①（Biểu đạt dùng bộ phận cơ thể）',
      introduction: `慣用句（thành ngữ）は複数の語が組み合わさって特定の意味を持つ表現です。「体の部位（手・目・耳・口・足）」を使った慣用句はN3で頻出です。文字通りの意味とは異なるため、まとめて覚えることが大切です。

Thành ngữ là biểu đạt gồm nhiều từ kết hợp mang nghĩa đặc biệt. Thành ngữ dùng bộ phận cơ thể (手・目・耳・口・足) xuất hiện nhiều ở N3. Vì nghĩa khác với nghĩa đen từng từ nên cần học thuộc theo nhóm.`,
      keyPoints: [
        '手（て）：手を貸す（giúp đỡ）/ 手がかかる（tốn công）/ 手に負えない（không kiểm soát được）',
        '目（め）：目を通す（lướt qua）/ 目が届く（có thể giám sát）/ 目を向ける（chú ý đến）',
        '耳（みみ）：耳を傾ける（lắng nghe）/ 耳に入る（nghe được）/ 耳を疑う（không tin nổi）',
        '口（くち）：口をはさむ（xen vào）/ 口が堅い（kín miệng）/ 口が軽い（miệng không vừng）',
        '足（あし）：足を運ぶ（đến thăm）/ 足を引っ張る（kéo chân người khác）',
      ],
      vocabulary: [
        { word: '手を貸す', reading: 'てをかす', meaning: '助ける（giúp đỡ）', example: '移乗に手を貸す' },
        { word: '目を通す', reading: 'めをとおす', meaning: '簡単に読む（lướt qua）', example: 'マニュアルに目を通す' },
        { word: '耳を傾ける', reading: 'みみをかたむける', meaning: '注意して聞く（lắng nghe）', example: '利用者の訴えに耳を傾ける' },
        { word: '口が堅い', reading: 'くちがかたい', meaning: '秘密を守る（kín miệng）', example: '彼は口が堅いので信頼できる' },
        { word: '足を運ぶ', reading: 'あしをはこぶ', meaning: 'わざわざ行く（đến thăm/đến tận nơi）', example: '施設まで足を運ぶ' },
      ],
      examples: [
        { japanese: '「新しいスタッフが困っているときは積極的に手を貸してあげてください。」', reading: 'あたらしいすたっふがこまっているときはせっきょくてきにてをかしてあげてください。', translation: '"Khi nhân viên mới gặp khó khăn, hãy tích cực giúp đỡ họ."' },
        { japanese: '「利用者様の訴えに耳を傾け、気持ちを理解することが大切です。」', reading: 'りようしゃさまのうったえにみみをかたむけ、きもちをりかいすることがたいせつです。', translation: '"Lắng nghe lời than phiền của người dùng và thấu hiểu cảm xúc của họ là điều quan trọng."' },
      ],
      grammarNote: `【体を使った慣用句一覧】
手（te）：
手を貸す（giúp）/ 手がかかる（tốn công）
手を抜く（làm qua loa）/ 手に余る（quá sức）

目（me）：
目を通す（lướt đọc）/ 目が届く（có thể giám sát）
目を丸くする（trợn mắt/ngạc nhiên）/ 目をつぶる（bỏ qua）

耳（mimi）：
耳を傾ける（lắng nghe）/ 耳に入る（nghe được）
耳が痛い（đau tai = khó nghe vì đúng）

口（kuchi）：
口を出す / 口をはさむ（xen miệng vào）
口が堅い（kín miệng）/ 口が軽い（miệng không vừng）

足（ashi）：
足を運ぶ（đến tận nơi）/ 足を引っ張る（kéo chân）`,
      quizzes: [
        {
          question: '「耳を傾ける」の意味は？',
          options: [
            { id: 'a', text: '耳を触る（sờ tai）' },
            { id: 'b', text: '注意して聞く・傾聴する（lắng nghe kỹ）' },
            { id: 'c', text: '聞こえない（không nghe được）' },
            { id: 'd', text: '耳が痛い（đau tai）' },
          ],
          correctId: 'b',
          explanation: '「耳を傾ける」は「注意して丁寧に聞く・傾聴する」の慣用句。介護では利用者の訴えや気持ちを丁寧に聞くことを「傾聴（けいちょう）」と言い、重要なケア技術です。',
          difficulty: 'easy' as const,
        },
        {
          question: '「手を貸す」の意味は？',
          options: [
            { id: 'a', text: '手を洗う（rửa tay）' },
            { id: 'b', text: '手紙を出す（gửi thư）' },
            { id: 'c', text: '助ける・手伝う（giúp đỡ）' },
            { id: 'd', text: '手を借りる（mượn tay）' },
          ],
          correctId: 'c',
          explanation: '「手を貸す」は「助ける・手伝う（giúp đỡ）」という慣用句。「困っている人に手を貸す」＝「困っている人を助ける」という意味です。',
          difficulty: 'easy' as const,
        },
        {
          question: '「口が堅い」はどんな人を表す？',
          options: [
            { id: 'a', text: '口が小さい人（người miệng nhỏ）' },
            { id: 'b', text: '秘密を守る・しゃべらない人（người kín miệng）' },
            { id: 'c', text: '話すのが苦手な人（người khó nói）' },
            { id: 'd', text: '口が固い食べ物が好きな人（người thích đồ ăn cứng）' },
          ],
          correctId: 'b',
          explanation: '「口が堅い（くちがかたい）」は「秘密を守る・他の人に話さない（kín miệng）」という意味の慣用句。反対は「口が軽い（くちがかるい）」＝「すぐに話してしまう」。',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 25,
    },
  },

  'n3-04-15': {
    courseTitle: { ja: 'N3 語彙強化 〜カタカナ語・複合語〜', vi: 'Củng cố từ vựng N3 - Từ Katakana và từ ghép' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3語彙: 慣用句②（動物・自然・日常の表現）',
      titleTranslation: 'Từ vựng N3: Thành ngữ②（Động vật/Tự nhiên/Cuộc sống）',
      introduction: `慣用句の第2回は「動物・自然・日常生活」を使った表現です。「猫の手も借りたい・骨を折る・水に流す」など、日本語特有の慣用表現をN3レベルでマスターします。職場でのコミュニケーションや文章読解で頻繁に出てきます。

Phần 2 thành ngữ dùng "động vật, tự nhiên, cuộc sống hàng ngày". Nắm vững các biểu đạt đặc trưng tiếng Nhật ở cấp N3 như 猫の手も借りたい, 骨を折る, 水に流す. Thường xuất hiện trong giao tiếp nơi làm việc và đọc hiểu văn bản.`,
      keyPoints: [
        '猫の手も借りたい：非常に忙しい（bận đến mức cần cả bàn tay mèo）',
        '骨を折る：苦労して努力する（cố gắng vất vả）',
        '水に流す：過去のことを忘れる（xóa bỏ/tha thứ quá khứ）',
        '油を売る：仕事をさぼる（lãng phí thời gian/lười biếng）',
        '足がつく：身元が発覚する（bị phát hiện）',
      ],
      vocabulary: [
        { word: '骨を折る', reading: 'ほねをおる', meaning: '苦労して努力する（cố gắng vất vả）', example: '新人の指導に骨を折る' },
        { word: '水に流す', reading: 'みずにながす', meaning: '忘れる・許す（xóa bỏ/tha thứ）', example: '過去のことは水に流す' },
        { word: '猫の手も借りたい', reading: 'ねこのてもかりたい', meaning: 'とても忙しい（rất bận）', example: '年末は猫の手も借りたいほど忙しい' },
        { word: '油を売る', reading: 'あぶらをうる', meaning: 'サボる（lãng phí thời gian）', example: 'こんなところで油を売っている場合じゃない' },
        { word: '腹を割る', reading: 'はらをわる', meaning: '本音で話す（nói thật lòng）', example: '腹を割って話し合う' },
      ],
      examples: [
        { japanese: '「今日は利用者が多くて猫の手も借りたいくらいだ。みんなで助け合いましょう。」', reading: 'きょうはりようしゃがおおくてねこのてもかりたいくらいだ。みんなでたすけあいましょう。', translation: '"Hôm nay người dùng đông, bận đến mức cần cả tay mèo. Mọi người hãy giúp nhau nhé."' },
        { japanese: '「新人の指導に骨を折ってくれてありがとう。おかげで成長しました。」', reading: 'しんじんのしどうにほねをおってくれてありがとう。おかげでせいちょうしました。', translation: '"Cảm ơn bạn đã cố gắng vất vả trong việc hướng dẫn nhân viên mới. Nhờ đó họ đã trưởng thành."' },
      ],
      grammarNote: `【よく使う慣用句まとめ②】
多忙を表す：
猫の手も借りたい（rất bận）/ てんてこ舞い（bận rộn）

努力を表す：
骨を折る（cố gắng vất vả）/ 骨身を惜しまない（không tiếc sức）

忘れる・許す：
水に流す（tha thứ/xóa bỏ）/ なかったことにする（coi như không có）

本音で話す：
腹を割る（nói thật lòng）/ 胸を割る / 打ち明ける

気を遣う：
気が利く（tinh ý）/ 気を配る（chú ý đến）/ 気にかける（quan tâm）`,
      quizzes: [
        {
          question: '「猫の手も借りたい」の意味は？',
          options: [
            { id: 'a', text: '猫が好き（thích mèo）' },
            { id: 'b', text: '非常に忙しい（rất bận）' },
            { id: 'c', text: '人手が余っている（dư nhân lực）' },
            { id: 'd', text: '猫を飼いたい（muốn nuôi mèo）' },
          ],
          correctId: 'b',
          explanation: '「猫の手も借りたい」は「猫（のような役に立たない存在）の手でも借りたいほど忙しい」という意味。非常に人手が足りない・忙しい状況を表します。',
          difficulty: 'easy' as const,
        },
        {
          question: '「骨を折る」の意味は？',
          options: [
            { id: 'a', text: '骨が折れた（gãy xương）' },
            { id: 'b', text: '休む（nghỉ ngơi）' },
            { id: 'c', text: '苦労して努力する（cố gắng vất vả）' },
            { id: 'd', text: '体が弱い（cơ thể yếu）' },
          ],
          correctId: 'c',
          explanation: '「骨を折る」は「苦労して努力する・大変な苦労をする（cố gắng vất vả）」という慣用句。「骨折り（ほねおり）」とも言います。骨が本当に折れた場合は「骨折する（こっせつする）」を使います。',
          difficulty: 'medium' as const,
        },
        {
          question: '「水に流す」の意味は？',
          options: [
            { id: 'a', text: '水を流す（đổ nước）' },
            { id: 'b', text: '過去のことを忘れて許す（tha thứ/xóa bỏ quá khứ）' },
            { id: 'c', text: '洗い流す（rửa trôi）' },
            { id: 'd', text: '流れる（trôi chảy）' },
          ],
          correctId: 'b',
          explanation: '「水に流す」は「過去のできごとや失敗を許して忘れる（xóa bỏ/tha thứ quá khứ）」という慣用句。「水（みず）」は物事を清めるイメージから来ています。',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 25,
    },
  },

  'n3-04-16': {
    courseTitle: { ja: 'N3 語彙強化 〜カタカナ語・複合語〜', vi: 'Củng cố từ vựng N3 - Từ Katakana và từ ghép' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3語彙: 重要語彙①（動詞・名詞 精選100語）',
      titleTranslation: 'Từ vựng N3 quan trọng①（Động từ & Danh từ 100 từ chọn lọc）',
      introduction: `N3合格に向けた重要語彙の集中学習です。動詞・名詞を中心に、介護・医療・職場・日常生活でよく使う100語を効率的に学習します。例文で文脈の中での使い方を確認し、実践的な語彙力を身につけましょう。

Học tập trung từ vựng quan trọng hướng đến đỗ N3. Học hiệu quả 100 từ thường dùng trong điều dưỡng, y tế, nơi làm việc và cuộc sống hàng ngày, tập trung vào động từ và danh từ. Xác nhận cách dùng trong ngữ cảnh qua câu ví dụ.`,
      keyPoints: [
        '介護動詞：介助する・移乗する・促す・訴える・把握する',
        '状態動詞：悪化する・改善する・安定する・継続する・中断する',
        '報告動詞：確認する・観察する・記録する・報告する・相談する',
        '重要名詞：状態・変化・対応・措置・方針・指示・連絡',
        '頻出名詞：食欲・水分・排泄・睡眠・意識・反応・訴え',
      ],
      vocabulary: [
        { word: '促す', reading: 'うながす', meaning: '〜するよう勧める（thúc giục/khuyến khích）', example: '水分補給を促す' },
        { word: '把握', reading: 'はあく', meaning: '理解・認識する（nắm bắt）', example: '状態を把握する' },
        { word: '対応', reading: 'たいおう', meaning: '適切に処理する（ứng phó）', example: '緊急事態に対応する' },
        { word: '方針', reading: 'ほうしん', meaning: '進む方向・方法（phương châm）', example: 'ケアの方針を決める' },
        { word: '措置', reading: 'そち', meaning: '対処方法（biện pháp）', example: '緊急措置をとる' },
      ],
      examples: [
        { japanese: '「利用者様の状態変化を把握し、適切に対応することが私たちの方針です。変化があれば速やかに報告し、必要な措置をとります。」', reading: 'りようしゃさまのじょうたいへんかをはあくし、てきせつにたいおうすることがわたしたちのほうしんです。へんかがあればすみやかにほうこくし、ひつようなそちをとります。', translation: '"Nắm bắt những thay đổi về tình trạng của người dùng và ứng phó phù hợp là phương châm của chúng tôi. Nếu có thay đổi, báo cáo nhanh chóng và thực hiện biện pháp cần thiết."' },
      ],
      grammarNote: `【N3重要動詞ベスト20】
1. 促す（thúc giục）2. 把握する（nắm bắt）3. 対応する（ứng phó）
4. 確認する（xác nhận）5. 観察する（quan sát）6. 記録する（ghi chép）
7. 報告する（báo cáo）8. 相談する（tham khảo）9. 継続する（tiếp tục）
10. 中断する（ngừng giữa chừng）11. 改善する（cải thiện）12. 悪化する（xấu đi）
13. 安定する（ổn định）14. 変化する（thay đổi）15. 増加する（tăng）
16. 減少する（giảm）17. 実施する（thực hiện）18. 提案する（đề xuất）
19. 評価する（đánh giá）20. 連携する（phối hợp）`,
      quizzes: [
        {
          question: '「水分補給を促す」の「促す」の意味は？',
          options: [
            { id: 'a', text: '強制する（bắt buộc）' },
            { id: 'b', text: '禁止する（cấm）' },
            { id: 'c', text: '〜するよう勧める・薦める（khuyến khích）' },
            { id: 'd', text: '観察する（quan sát）' },
          ],
          correctId: 'c',
          explanation: '「促す（うながす）」は「〜するよう勧める・きっかけを与える（khuyến khích/thúc đẩy）」の意味。強制ではなく、するよう働きかけることです。「水分補給を促す」＝「水分を飲むよう勧める」。',
          difficulty: 'medium' as const,
        },
        {
          question: '「状態を把握する」の「把握」の意味は？',
          options: [
            { id: 'a', text: '状態を変える（thay đổi trạng thái）' },
            { id: 'b', text: '状態を正確に理解・認識する（nắm bắt）' },
            { id: 'c', text: '状態を記録する（ghi chép trạng thái）' },
            { id: 'd', text: '状態を報告する（báo cáo trạng thái）' },
          ],
          correctId: 'b',
          explanation: '「把握（はあく）」は「正確に理解・認識する（nắm bắt）」の意味。「状態を把握する」＝「利用者の状態を正確に理解する」こと。介護・医療のケアの基本です。',
          difficulty: 'medium' as const,
        },
        {
          question: '「方針」の意味として最も適切なのは？',
          options: [
            { id: 'a', text: '過去の記録（hồ sơ quá khứ）' },
            { id: 'b', text: '進む方向・基本的な方法や考え方（phương châm）' },
            { id: 'c', text: '緊急の対応（ứng phó khẩn cấp）' },
            { id: 'd', text: '測定の結果（kết quả đo）' },
          ],
          correctId: 'b',
          explanation: '「方針（ほうしん）」は「進む方向・基本的な考え方や方法（phương châm/chính sách）」の意味。「ケアの方針」＝「どのようにケアを行うかの基本的な方向性」。',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 25,
    },
  },

  'n3-04-17': {
    courseTitle: { ja: 'N3 語彙強化 〜カタカナ語・複合語〜', vi: 'Củng cố từ vựng N3 - Từ Katakana và từ ghép' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3語彙: 重要語彙②（形容詞・副詞 精選80語）',
      titleTranslation: 'Từ vựng N3 quan trọng②（Tính từ & Phó từ 80 từ chọn lọc）',
      introduction: `N3合格に向けた重要語彙の第2回です。形容詞・副詞を中心に学習します。「適切・十分・わずか・速やかに・徐々に・継続的に」など、介護記録や会話・読解問題で頻出する語を効率的にマスターします。

Phần 2 từ vựng quan trọng hướng đến đỗ N3. Tập trung học tính từ và phó từ. Nắm vững hiệu quả các từ thường xuất hiện trong hồ sơ điều dưỡng, hội thoại và đọc hiểu như 適切, 十分, わずか, 速やかに, 徐々に, 継続的に.`,
      keyPoints: [
        '程度の副詞：わずか（chỉ một ít）・やや（hơi）・かなり（khá）・十分（đủ）・非常に（rất）',
        '様子の副詞：速やかに（nhanh chóng）・徐々に（từ từ）・急に（đột ngột）・突然（đột ngột）',
        '頻度の副詞：定期的に（định kỳ）・継続的に（liên tục）・随時（bất cứ khi nào）',
        '重要な形容詞：適切（phù hợp）・十分（đủ）・不十分（không đủ）・安全（an toàn）',
        '状態の形容詞：安定した（ổn định）・不安定な（không ổn định）・良好な（tốt）',
      ],
      vocabulary: [
        { word: '適切', reading: 'てきせつ', meaning: 'ふさわしい・正しい（phù hợp）', example: '適切なケアを行う' },
        { word: '速やかに', reading: 'すみやかに', meaning: '素早く・すぐに（nhanh chóng）', example: '速やかに報告する' },
        { word: '徐々に', reading: 'じょじょに', meaning: 'ゆっくりと（dần dần）', example: '徐々に回復している' },
        { word: 'わずか', reading: 'わずか', meaning: '少しだけ（chỉ một ít）', example: 'わずかしか食べられない' },
        { word: '継続的', reading: 'けいぞくてき', meaning: 'ずっと続いて（liên tục）', example: '継続的に観察する' },
      ],
      examples: [
        { japanese: '「田中様は徐々に回復されており、食欲もわずかながら改善しています。速やかに主治医に報告しました。」', reading: 'たなかさまはじょじょにかいふくされており、しょくよくもわずかながらかいぜんしています。すみやかにしゅじいにほうこくしました。', translation: '"Ông Tanaka đang dần hồi phục, cảm giác ngon miệng cũng cải thiện dù chỉ một chút. Đã báo cáo nhanh chóng cho bác sĩ phụ trách."' },
        { japanese: '「適切な水分補給を継続的に促すことで、脱水予防に取り組んでいます。」', reading: 'てきせつなすいぶんほきゅうをけいぞくてきにうながすことで、だっすいよぼうにとりくんでいます。', translation: '"Bằng cách liên tục khuyến khích bổ sung nước phù hợp, chúng tôi đang nỗ lực phòng ngừa mất nước."' },
      ],
      grammarNote: `【N3重要形容詞・副詞ベスト20】
程度（mức độ）：
わずか（chỉ ít）/ やや（hơi）/ かなり（khá）/ 十分（đủ）/ 非常に（rất）

速度・段階（tốc độ）：
速やかに（nhanh chóng）/ 徐々に（dần dần）/ 急に（đột ngột）

頻度（tần suất）：
定期的に（định kỳ）/ 継続的に（liên tục）/ 随時（bất cứ khi nào）/ 常に（luôn luôn）

状態の形容動詞：
適切な（phù hợp）/ 十分な（đủ）/ 不十分な（không đủ）
良好な（tốt）/ 安全な（an toàn）/ 不安定な（không ổn định）`,
      quizzes: [
        {
          question: '「速やかに報告する」の「速やかに」の意味は？',
          options: [
            { id: 'a', text: 'ゆっくり（chậm rãi）' },
            { id: 'b', text: '素早く・すぐに（nhanh chóng）' },
            { id: 'c', text: 'たまに（thỉnh thoảng）' },
            { id: 'd', text: '徐々に（dần dần）' },
          ],
          correctId: 'b',
          explanation: '「速やかに（すみやかに）」は「素早く・すぐに・遅れなく（nhanh chóng）」の意味。介護現場では「異変があれば速やかに報告してください」のように、迅速な行動を求めるときに使います。',
          difficulty: 'easy' as const,
        },
        {
          question: '「徐々に回復している」の「徐々に」の意味は？',
          options: [
            { id: 'a', text: '突然（đột ngột）' },
            { id: 'b', text: 'まったく（hoàn toàn không）' },
            { id: 'c', text: 'ゆっくりと少しずつ（dần dần/từng chút một）' },
            { id: 'd', text: '全部（hoàn toàn）' },
          ],
          correctId: 'c',
          explanation: '「徐々に（じょじょに）」は「ゆっくりと少しずつ（dần dần）」の意味。「徐々に回復している」＝「少しずつ良くなっている」こと。反対の速度表現は「急に（đột ngột）」「突然（đột ngột）」です。',
          difficulty: 'easy' as const,
        },
        {
          question: '「適切なケアを行う」の「適切」の意味は？',
          options: [
            { id: 'a', text: '間違った（sai）' },
            { id: 'b', text: 'ふさわしい・正しい（phù hợp）' },
            { id: 'c', text: '不十分な（không đủ）' },
            { id: 'd', text: '危険な（nguy hiểm）' },
          ],
          correctId: 'b',
          explanation: '「適切（てきせつ）」は「その状況にふさわしい・正しい（phù hợp）」の意味。「適切なケア」＝「その利用者・状況に合った正しいケア」。反対語は「不適切（ふてきせつ）」です。',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 25,
    },
  },

  'n3-04-18': {
    courseTitle: { ja: 'N3 語彙強化 〜カタカナ語・複合語〜', vi: 'Củng cố từ vựng N3 - Từ Katakana và từ ghép' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N3語彙強化 総復習テスト（20問）',
      titleTranslation: 'Kiểm tra tổng hợp N3 Từ vựng（20 câu）',
      introduction: `N3語彙強化コース（n3-04）全18レッスンの総復習テストです。カタカナ語・複合動詞・擬音語・擬態語・接尾語・接頭語・同音異義語・類義語・対義語・慣用句・重要語彙を総合的に確認します。しっかり実力を確認しましょう！

Kiểm tra tổng hợp toàn bộ 18 bài khóa học N3 từ vựng (n3-04). Kiểm tra toàn diện từ Katakana, động từ ghép, từ tượng thanh/hình, hậu tố, tiền tố, từ đồng âm, đồng nghĩa, trái nghĩa, thành ngữ và từ vựng quan trọng. Hãy xác nhận thực lực!`,
      keyPoints: [
        'カタカナ語（L1〜L3）：医療・介護・職場・変換ルール',
        '複合動詞（L4〜L6）：〜出す・〜込む・〜上げる・〜切る・〜続ける・〜直す・〜合う',
        '擬態語（L7〜L8）：体の症状（ズキズキ・ふらふら）・気持ち（イライラ・ぼんやり）',
        '造語力（L9〜L10）：〜的・〜化・〜性 / 不〜・非〜・再〜・未〜',
        '語彙分析（L11〜L15）：同音異義語・類義語・対義語・慣用句①②',
        '重要語彙（L16〜L17）：動詞・名詞・形容詞・副詞 精選180語',
      ],
      vocabulary: [
        { word: '総復習', reading: 'そうふくしゅう', meaning: '全部をもう一度確認する（ôn tập tổng hợp）', example: '総復習テストに挑戦する' },
        { word: '語彙力', reading: 'ごいりょく', meaning: '語彙の豊かさ・使いこなす力（vốn từ）', example: '語彙力を高める' },
        { word: '習得', reading: 'しゅうとく', meaning: '学んで身につける（thu thập/nắm vững）', example: '語彙を習得する' },
        { word: '実力', reading: 'じつりょく', meaning: '本当の能力（thực lực）', example: '実力を確認する' },
        { word: 'マスター', reading: 'ますたー', meaning: '完全に習得する（thành thạo）', example: 'N3語彙をマスターする' },
      ],
      examples: [
        { japanese: '【カタカナ語まとめ】バイタル・リハビリ・インシデント・モニタリング・カンファレンス・シフト・スケジュール・マニュアル・フォロー・チームワーク', reading: 'ばいたる・りはびり・いんしでんと・もにたりんぐ・かんふぁれんす・しふと・すけじゅーる・まにゅある', translation: '【Tóm tắt từ Katakana】バイタル(sinh tồn)・リハビリ(phục hồi)・インシデント(sự cố)・モニタリング(theo dõi)・カンファレンス(hội nghị)・シフト(ca)・スケジュール(lịch)・マニュアル(sổ tay)・フォロー(hỗ trợ)・チームワーク(tinh thần đồng đội)' },
        { japanese: '【複合動詞まとめ】取り出す・飲み込む・申し込む・食べ切る・観察し続ける・書き直す・話し合う・声をかける・歩き始める', reading: 'とりだす・のみこむ・もうしこむ・たべきる・かんさつしつづける・かきなおす・はなしあう・こえをかける・あるきはじめる', translation: '【Tóm tắt động từ ghép】取り出す(lấy ra)・飲み込む(nuốt)・申し込む(đăng ký)・食べ切る(ăn hết)・観察し続ける(tiếp tục quan sát)・書き直す(viết lại)・話し合う(thảo luận)・声をかける(gọi)・歩き始める(bắt đầu đi)' },
      ],
      grammarNote: `【N3語彙 全カテゴリまとめ】
カタカナ語：バイタル/リハビリ/シフト/マニュアル 他
複合動詞：〜出す/〜込む/〜上げる/〜切る/〜続ける/〜直す 他
擬態語（体）：ズキズキ/ふらふら/ぐったり/むかむか
擬態語（気持ち）：イライラ/ぼんやり/うとうと/そわそわ
接尾語：〜的/〜化/〜性
接頭語：不〜/非〜/再〜/超〜/未〜
同音異義語：きかん/こうかん/いたい
類義語：報告/連絡/相談の使い分け
対義語：改善↔悪化/増加↔減少
慣用句：耳を傾ける/手を貸す/骨を折る 他
重要語彙：促す/把握/適切/速やかに/徐々に 他`,
      quizzes: [
        {
          question: '「ズキズキ痛む」はどんな痛み？',
          options: [
            { id: 'a', text: '重い痛み（đau nặng）' },
            { id: 'b', text: '脈打つような痛み（đau nhói theo nhịp）' },
            { id: 'c', text: '針で刺す痛み（đau châm）' },
            { id: 'd', text: '燃えるような痛み（đau rát）' },
          ],
          correctId: 'b',
          explanation: '「ズキズキ」は心臓の鼓動に合わせてズキン・ズキンと脈打つような痛み。偏頭痛や歯痛などで使います。',
          difficulty: 'easy' as const,
        },
        {
          question: '「飲み込む」の「込む」が表す意味は？',
          options: [
            { id: 'a', text: '外に出る（ra ngoài）' },
            { id: 'b', text: '完全に終わる（hoàn thành）' },
            { id: 'c', text: '内部・深く入る（vào trong）' },
            { id: 'd', text: '上に上がる（nâng lên）' },
          ],
          correctId: 'c',
          explanation: '「〜込む」は「内部へ・深く」の方向を示します。「飲み込む」＝飲んで喉の奥（内部）に入れる。「申し込む」＝申請して内部に入れる。',
          difficulty: 'medium' as const,
        },
        {
          question: '「不安定」の「不〜」は何を意味する接頭語？',
          options: [
            { id: 'a', text: 'もう一度（làm lại）' },
            { id: 'b', text: '否定・反対（phủ định）' },
            { id: 'c', text: '非常に（rất）' },
            { id: 'd', text: 'まだ〜していない（chưa）' },
          ],
          correctId: 'b',
          explanation: '「不〜（ふ）」は否定・反対を意味する接頭語。「不安定」＝安定していない。「不満」＝満足していない。「不規則」＝規則的でない。',
          difficulty: 'easy' as const,
        },
        {
          question: '「耳を傾ける」の意味は？',
          options: [
            { id: 'a', text: '耳を触る（sờ tai）' },
            { id: 'b', text: '注意してよく聞く（lắng nghe kỹ）' },
            { id: 'c', text: '耳が痛い（đau tai）' },
            { id: 'd', text: '大きな声で話す（nói to）' },
          ],
          correctId: 'b',
          explanation: '「耳を傾ける」は「注意してよく聞く・傾聴する（lắng nghe kỹ）」という慣用句。介護では利用者の気持ちに耳を傾けることが重要なケアです。',
          difficulty: 'easy' as const,
        },
        {
          question: '「改善」の対義語は？',
          options: [
            { id: 'a', text: '継続（tiếp tục）' },
            { id: 'b', text: '安定（ổn định）' },
            { id: 'c', text: '悪化（xấu đi）' },
            { id: 'd', text: '増加（tăng）' },
          ],
          correctId: 'c',
          explanation: '「改善（かいぜん）」＝良くなること（cải thiện）↔「悪化（あっか）」＝悪くなること（xấu đi）。この対義語ペアは介護・医療記録で最もよく使われます。',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 50,
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

  // ===== N2 上級文法マスター L2-35 =====
  'n2-01-2': {
    courseTitle: { ja: 'N2 上級文法マスター', vi: 'Ngữ pháp nâng cao N2' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N2文法②: 〜をめぐって・〜をめぐる',
      titleTranslation: 'Ngữ pháp N2②: Xoay quanh... / Về vấn đề...',
      introduction: `「〜をめぐって」は「〜について話し合ったり争ったりする」という意味で、対立・議論・競争などの文脈で使います。名詞に接続し、後ろには「議論する・対立する・争う」などの動詞が来ることが多いです。

「〜をめぐる」は連体修飾語として使い、名詞を修飾します。

"〜をめぐって" có nghĩa là "xoay quanh (vấn đề/chủ đề nào đó)" - dùng trong ngữ cảnh tranh luận, đối lập, cạnh tranh. Kết nối với danh từ, sau đó thường có các động từ như 議論する、対立する、争う.`,
      keyPoints: [
        '接続：名詞 + をめぐって（動詞用法）/ をめぐる + 名詞（連体修飾）',
        '意味：〜について（争い・議論・競争の対象として）',
        '後続：議論する・対立する・争う・競争するなど',
        '書き言葉的・ニュース・論説文でよく使われる',
        '例：「領土問題をめぐって両国が対立した」',
      ],
      vocabulary: [
        { word: '〜をめぐって', reading: 'をめぐって', meaning: '〜について争う・議論する（xoay quanh）', example: '賃金問題をめぐって交渉が続いている' },
        { word: '〜をめぐる', reading: 'をめぐる', meaning: '〜に関する（連体修飾）', example: '環境問題をめぐる議論' },
        { word: '対立', reading: 'たいりつ', meaning: 'đối lập、mâu thuẫn', example: '意見が対立する' },
        { word: '交渉', reading: 'こうしょう', meaning: 'đàm phán', example: '労使交渉' },
      ],
      dialogue: [
        { speaker: 'A', japanese: '今、医療費の問題をめぐって国会で議論が続いているね。', reading: 'いま、いりょうひのもんだいをめぐってこっかいでぎろんがつづいているね。', translation: 'Hiện tại, quốc hội đang tiếp tục tranh luận xoay quanh vấn đề chi phí y tế nhỉ.' },
        { speaker: 'B', japanese: 'ええ、与党と野党の対立が激しくなっていますね。', reading: 'ええ、よとうとやとうのたいりつがはげしくなっていますね。', translation: 'Vâng, sự đối lập giữa đảng cầm quyền và đảng đối lập đang ngày càng gay gắt.' },
        { speaker: 'A', japanese: 'その問題をめぐる報道も増えているようだ。', reading: 'そのもんだいをめぐるほうどうもふえているようだ。', translation: 'Có vẻ như tin tức liên quan đến vấn đề đó cũng đang tăng lên.' },
      ],
      examples: [
        { japanese: '遺産をめぐって兄弟間で争いが起きた。', reading: 'いさんをめぐってきょうだいかんでそうがおきた。', translation: 'Đã xảy ra tranh chấp giữa anh chị em xoay quanh việc thừa kế.' },
        { japanese: '環境保護をめぐる国際交渉は難航している。', reading: 'かんきょうほごをめぐるこくさいこうしょうはなんこうしている。', translation: 'Đàm phán quốc tế xoay quanh vấn đề bảo vệ môi trường đang gặp nhiều khó khăn.' },
        { japanese: '経営方針をめぐって取締役会が紛糾した。', reading: 'けいえいほうしんをめぐってとりしまりやくかいがふんきゅうした。', translation: 'Hội đồng quản trị đã xảy ra tranh cãi xoay quanh phương châm kinh doanh.' },
      ],
      grammarNote: `【〜をめぐって vs 〜について の違い】

〜をめぐって：争い・議論・対立などの感情的・社会的文脈
例：「領土問題をめぐって対立」= tranh chấp xoay quanh lãnh thổ

〜について：中立的に「〜のことを話す・書く・考える」
例：「領土問題について話し合う」= thảo luận về lãnh thổ（中立）

【ポイント】
「をめぐって」の後ろには否定的ニュアンス（対立・争い・競争）の言葉が多い。「〜をめぐる + 名詞」の形も重要：「彼女をめぐる争い」「資源をめぐる問題」`,
      quizzes: [
        {
          question: '「経営方針（　）、株主と経営陣が激しく対立した。」に入る最も適切な表現は？',
          options: [
            { id: 'a', text: 'に関して' },
            { id: 'b', text: 'をめぐって' },
            { id: 'c', text: 'について' },
            { id: 'd', text: 'において' },
          ],
          correctId: 'b',
          explanation: '「対立した」という争いの文脈では「をめぐって」が最適。「に関して」「について」は中立的な表現。 "Đối lập" là ngữ cảnh tranh chấp nên dùng "をめぐって".',
          difficulty: 'medium' as const,
        },
        {
          question: '次の（　）に入る最も適切な語を選んでください：「資源（　）争いが続いている。」',
          options: [
            { id: 'a', text: 'をめぐる' },
            { id: 'b', text: 'に関する' },
            { id: 'c', text: 'についての' },
            { id: 'd', text: 'において' },
          ],
          correctId: 'a',
          explanation: '後ろの名詞「争い」を修飾するので連体形「をめぐる」が正解。 Vì sửa đổi danh từ "争い" phía sau nên dùng dạng liên thể "をめぐる".',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 30,
    },
  },

  'n2-01-3': {
    courseTitle: { ja: 'N2 上級文法マスター', vi: 'Ngữ pháp nâng cao N2' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N2文法③: 〜に基づいて・〜に基づく',
      titleTranslation: 'Ngữ pháp N2③: Dựa trên... / Căn cứ vào...',
      introduction: `「〜に基づいて」は「〜を根拠・基準として」という意味で、規則・法律・データ・事実などを根拠にして何かをする場合に使います。書き言葉でよく使われ、正式な文書・ビジネス文書・論文などに多く見られます。

「〜に基づく」は連体修飾形として、後ろの名詞を修飾します。

"〜に基づいて" có nghĩa là "dựa trên (quy tắc/luật/dữ liệu/sự thật)" - dùng khi làm gì đó căn cứ vào nền tảng nào đó. Thường xuất hiện trong văn bản chính thức, tài liệu kinh doanh, luận văn.`,
      keyPoints: [
        '接続：名詞 + に基づいて（動詞用法）/ に基づく + 名詞（連体修飾）',
        '意味：〜を根拠・基準として（dựa trên, căn cứ vào）',
        '根拠となるもの：規則・法律・データ・事実・証拠・経験など',
        '書き言葉的：公式文書・ビジネス・論文で多用',
        '例：「法律に基づいて処分された」「証拠に基づく判断」',
      ],
      vocabulary: [
        { word: '〜に基づいて', reading: 'にもとづいて', meaning: 'dựa trên、căn cứ vào', example: '規則に基づいて行動する' },
        { word: '〜に基づく', reading: 'にもとづく', meaning: 'dựa trên（連体形）', example: '証拠に基づく判断' },
        { word: '根拠', reading: 'こんきょ', meaning: 'căn cứ, cơ sở', example: '根拠のない噂' },
        { word: '規程', reading: 'きてい', meaning: 'quy định nội bộ', example: '社内規程に基づく' },
      ],
      dialogue: [
        { speaker: '上司', japanese: 'この評価は何に基づいているの？', reading: 'このひょうかはなににもとづいているの？', translation: 'Đánh giá này dựa trên điều gì vậy?' },
        { speaker: '部下', japanese: '半年間の売上データに基づいています。', reading: 'はんねんかんのうりあげデータにもとづいています。', translation: 'Dựa trên dữ liệu doanh số 6 tháng ạ.' },
        { speaker: '上司', japanese: '事実に基づいた報告書を作成してください。', reading: 'じじつにもとづいたほうこくしょをさくせいしてください。', translation: 'Hãy lập báo cáo dựa trên sự thật.' },
      ],
      examples: [
        { japanese: '就業規則に基づいて、処分が下された。', reading: 'しゅうぎょうきそくにもとづいて、しょぶんがくだされた。', translation: 'Hình thức kỷ luật đã được ban hành dựa trên nội quy lao động.' },
        { japanese: 'この薬は最新の研究に基づいて開発されました。', reading: 'このくすりはさいしんのけんきゅうにもとづいてかいはつされました。', translation: 'Loại thuốc này được phát triển dựa trên nghiên cứu mới nhất.' },
        { japanese: 'エビデンスに基づく医療が重要視されている。', reading: 'エビデンスにもとづくいりょうがじゅうようしされている。', translation: 'Y học dựa trên bằng chứng đang được coi trọng.' },
      ],
      grammarNote: `【に基づいて vs によって の違い】

に基づいて：根拠・基準を示す（規則・データ・事実が根拠）
例：「法律に基づいて処罰する」= Căn cứ luật để xử phạt

によって：手段・原因・行為者など幅広い意味（L4で詳しく学習）
例：「事故によって被害が出た」= Thiệt hại do tai nạn

【に基づいた vs に基づく】
「に基づいた + 名詞」も「に基づく + 名詞」も正しい。
例：「事実に基づいた/基づく判断」= Phán quyết dựa trên sự thật`,
      quizzes: [
        {
          question: '「（　）に基づいて、この決定が行われました。」の（　）に入る最も自然な語は？',
          options: [
            { id: 'a', text: '雰囲気' },
            { id: 'b', text: '規則' },
            { id: 'c', text: '感情' },
            { id: 'd', text: '希望' },
          ],
          correctId: 'b',
          explanation: '「に基づいて」は客観的な根拠（規則・法律・データなど）と一緒に使います。感情や雰囲気は根拠として不適切。 "に基づいて" dùng với căn cứ khách quan như quy tắc, luật, dữ liệu.',
          difficulty: 'easy' as const,
        },
        {
          question: '次の文の（　）に適切な形を選んでください：「（　）判断が求められる。」（に基づく）',
          options: [
            { id: 'a', text: '証拠に基づいている' },
            { id: 'b', text: '証拠に基づく' },
            { id: 'c', text: '証拠に基づいて' },
            { id: 'd', text: '証拠に基づき' },
          ],
          correctId: 'b',
          explanation: '後ろの「判断」という名詞を修飾するので、連体形「に基づく」が正解。 Vì sửa đổi danh từ "判断" phía sau nên dùng dạng liên thể "に基づく".',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 30,
    },
  },

  'n2-01-4': {
    courseTitle: { ja: 'N2 上級文法マスター', vi: 'Ngữ pháp nâng cao N2' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N2文法④: 〜によって（手段・原因・違い）',
      titleTranslation: 'Ngữ pháp N2④: Tùy theo... / Do... / Bởi...',
      introduction: `「〜によって」はN2で最も重要な表現の一つで、複数の意味を持ちます。①手段・方法「〜を使って」、②原因・理由「〜が原因で」、③違い「〜によって異なる」、④受身の行為者「〜に（よって）行われた」の4つの用法を区別して覚えましょう。

"〜によって" là một trong những biểu hiện quan trọng nhất ở N2 với nhiều nghĩa: ①phương tiện/phương pháp, ②nguyên nhân/lý do, ③sự khác biệt, ④tác nhân bị động.`,
      keyPoints: [
        '①手段：「メールによって連絡する」= liên lạc bằng email',
        '②原因：「地震によって被害が出た」= thiệt hại do động đất',
        '③違い：「人によって意見が違う」= tùy người mà khác nhau',
        '④受身の行為者：「法律によって禁止されている」= bị cấm bởi luật',
        '接続：名詞 + によって / によっては / によっても',
      ],
      vocabulary: [
        { word: '〜によって①', reading: 'によって', meaning: '手段（bằng/thông qua）', example: 'インターネットによって情報を得る' },
        { word: '〜によって②', reading: 'によって', meaning: '原因（do/vì）', example: '火事によって建物が焼けた' },
        { word: '〜によって③', reading: 'によって', meaning: '違い（tùy theo）', example: '地域によって習慣が違う' },
        { word: '〜によっては', reading: 'によっては', meaning: '場合によって（tùy trường hợp）', example: '状況によっては変更する' },
      ],
      dialogue: [
        { speaker: 'A', japanese: 'この病気の治療法は患者によって違うんですか？', reading: 'このびょうきのちりょうほうはかんじゃによってちがうんですか？', translation: 'Phương pháp điều trị bệnh này có khác nhau tùy bệnh nhân không ạ?' },
        { speaker: '医師', japanese: 'はい、年齢や体質によって適切な治療が異なります。', reading: 'はい、ねんれいやたいしつによってこうせつなちりょうがことなります。', translation: 'Vâng, phương pháp điều trị thích hợp khác nhau tùy theo tuổi và thể trạng.' },
        { speaker: 'A', japanese: 'では、場合によっては手術も必要ですか？', reading: 'では、ばあいによってはしゅじゅつもひつようですか？', translation: 'Vậy thì tùy trường hợp có cần phẫu thuật không ạ?' },
      ],
      examples: [
        { japanese: '研究によって新薬の効果が確認された。', reading: 'けんきゅうによってしんやくのこうかがかくにんされた。', translation: 'Hiệu quả của thuốc mới đã được xác nhận thông qua nghiên cứu.' },
        { japanese: 'その条例は市議会によって可決された。', reading: 'そのじょうれいはしぎかいによってかけつされた。', translation: 'Điều lệ đó đã được hội đồng thành phố thông qua.' },
        { japanese: '人によっては副作用が出ることもある。', reading: 'ひとによってはふくさようがでることもある。', translation: 'Tùy người cũng có thể xuất hiện tác dụng phụ.' },
      ],
      grammarNote: `【〜によって の4つの意味を見分けるポイント】

①手段：「〜を使って」に言い換えられる
例：「電話によって連絡」→「電話を使って連絡」

②原因：「〜が原因で」に言い換えられる
例：「地震によって被害」→「地震が原因で被害」

③違い：「〜次第で変わる/異なる」の文脈
例：「人によって違う」→ tùy người mà khác

④受身の行為者：受身文「〜される」の前後
例：「先生によって書かれた本」

【重要】「によっては」は「ある条件では」という意味で条件節に使う`,
      quizzes: [
        {
          question: '「この結果は研究（　）明らかになった。」の（　）に入るのは？',
          options: [
            { id: 'a', text: 'をめぐって' },
            { id: 'b', text: 'によって' },
            { id: 'c', text: 'において' },
            { id: 'd', text: 'にとって' },
          ],
          correctId: 'b',
          explanation: '「研究によって明らかになった」= Được làm rõ thông qua nghiên cứu。手段・方法の「によって」。 Đây là "によって" chỉ phương tiện/thủ đoạn.',
          difficulty: 'easy' as const,
        },
        {
          question: '「地域（　）、医療サービスの質が大きく異なります。」',
          options: [
            { id: 'a', text: 'によって' },
            { id: 'b', text: 'において' },
            { id: 'c', text: 'に関して' },
            { id: 'd', text: 'をめぐって' },
          ],
          correctId: 'a',
          explanation: '「地域によって異なる」= Tùy địa phương mà khác nhau。違い・差を表す「によって」。 Đây là "によって" chỉ sự khác biệt tùy theo điều kiện.',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 30,
    },
  },

  'n2-01-5': {
    courseTitle: { ja: 'N2 上級文法マスター', vi: 'Ngữ pháp nâng cao N2' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N2文法⑤: 〜として・〜としては・〜とした',
      titleTranslation: 'Ngữ pháp N2⑤: Với tư cách là... / Là...',
      introduction: `「〜として」は「〜の立場・資格・役割で」という意味で、役割・資格・種類などを表します。N2では「〜としては」「〜とした」「〜としての」などの応用形も重要です。

"〜として" có nghĩa là "với tư cách là / trong vai trò" - biểu thị lập trường, tư cách, vai trò, loại. Ở N2 cũng quan trọng các dạng ứng dụng như "〜としては"、"〜とした"、"〜としての".`,
      keyPoints: [
        '接続：名詞 + として（〜の資格・立場・役割で）',
        '〜としては：〜の立場から言えば（từ góc độ của...）',
        '〜とした：〜を根拠・条件として（dựa vào/lấy làm）',
        '〜としての：後ろの名詞を修飾（với tư cách là... + danh từ）',
        '例：「医師として働く」「日本として賛成できない」',
      ],
      vocabulary: [
        { word: '〜として', reading: 'として', meaning: 'với tư cách là、trong vai trò', example: '看護師として10年働いた' },
        { word: '〜としては', reading: 'としては', meaning: '〜の立場では（từ góc độ của）', example: '医療機関としては対応が難しい' },
        { word: '〜としての', reading: 'としての', meaning: '〜として（連体形）', example: '医師としての責任' },
        { word: '資格', reading: 'しかく', meaning: 'tư cách, bằng cấp', example: '専門家としての資格' },
      ],
      dialogue: [
        { speaker: 'A', japanese: '田中先生は指導医として長く活躍されていますね。', reading: 'たなかせんせいはしどういとしてながくかつやくされていますね。', translation: 'Thầy Tanaka đã hoạt động lâu năm với tư cách là bác sĩ hướng dẫn nhỉ.' },
        { speaker: 'B', japanese: 'はい、専門家としての知識と経験が豊富です。', reading: 'はい、せんもんかとしてのちしきとけいけんがほうふです。', translation: 'Vâng, có nhiều kiến thức và kinh nghiệm với tư cách chuyên gia.' },
        { speaker: 'A', japanese: '私個人としては、先生の方針に賛同します。', reading: 'わたしこじんとしては、せんせいのほうしんにさんどうします。', translation: 'Cá nhân tôi thì đồng ý với phương châm của thầy.' },
      ],
      examples: [
        { japanese: '薬剤師として、正確な調剤を心がけています。', reading: 'やくざいしとして、せいかくなちょうざいをこころがけています。', translation: 'Với tư cách là dược sĩ, tôi luôn chú ý pha chế chính xác.' },
        { japanese: '病院としては、患者のプライバシーを最優先にしています。', reading: 'びょういんとしては、かんじゃのプライバシーをさいゆうせんにしています。', translation: 'Với tư cách là bệnh viện, chúng tôi ưu tiên hàng đầu quyền riêng tư của bệnh nhân.' },
        { japanese: '介護士としての誇りを持って仕事に臨む。', reading: 'かいごしとしてのほこりをもってしごとにのぞむ。', translation: 'Tham gia công việc với lòng tự hào của người điều dưỡng.' },
      ],
      grammarNote: `【〜として の用法まとめ】

①資格・立場：「〜の身分・役職で」
例：「医師として働く」、「代表として出席する」

②〜としては：「〜の立場から言えば」評価・判断を述べる
例：「病院としては賛成できない」

③〜とした：「〜を前提・条件として」（やや書き言葉）
例：「治癒を目標とした治療計画」

④〜としての：連体修飾「〜として（の立場における）」
例：「看護師としての使命」

【注意】「として」と「にとって」の違い：
として → 役割・立場（với tư cách）
にとって → 〜の観点から（đối với）`,
      quizzes: [
        {
          question: '「彼女は通訳（　）会議に参加した。」の（　）は？',
          options: [
            { id: 'a', text: 'にとって' },
            { id: 'b', text: 'として' },
            { id: 'c', text: 'について' },
            { id: 'd', text: 'において' },
          ],
          correctId: 'b',
          explanation: '「通訳の立場・役割で」参加したので「として」が正解。「にとって」は「〜の観点では」という意味。 "として" biểu thị vai trò/tư cách tham gia.',
          difficulty: 'easy' as const,
        },
        {
          question: '「医療機関（　）、患者の安全が最優先です。」',
          options: [
            { id: 'a', text: 'として' },
            { id: 'b', text: 'としては' },
            { id: 'c', text: 'にとって' },
            { id: 'd', text: 'としての' },
          ],
          correctId: 'b',
          explanation: '「医療機関の立場から言えば」というニュアンスがあるので「としては」が最適。 "としては" biểu thị "từ góc độ/lập trường của".',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 30,
    },
  },

  'n2-01-6': {
    courseTitle: { ja: 'N2 上級文法マスター', vi: 'Ngữ pháp nâng cao N2' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N2文法⑥: 〜に関して・〜に関する',
      titleTranslation: 'Ngữ pháp N2⑥: Về... / Liên quan đến...',
      introduction: `「〜に関して」は「〜について（やや公式）」という意味で、公式文書・ビジネスシーン・論説などでよく使われます。「〜について」より格式が高く、書き言葉的な表現です。「〜に関する」は連体修飾形で後ろの名詞を修飾します。

"〜に関して" có nghĩa là "về/liên quan đến (hơi trang trọng)" - thường dùng trong văn bản chính thức, tình huống kinh doanh, xã luận. Trang trọng hơn "〜について". "〜に関する" là dạng liên thể để bổ nghĩa danh từ phía sau.`,
      keyPoints: [
        '接続：名詞 + に関して（動詞用法）/ に関する + 名詞（連体修飾）',
        '意味：〜について（格式的・公式な場面）',
        '「〜について」との違い：より書き言葉的・フォーマル',
        '「に関しては」「に関しても」「に関しての」の形も使われる',
        '例：「個人情報に関してお知らせします」',
      ],
      vocabulary: [
        { word: '〜に関して', reading: 'にかんして', meaning: '〜について（trang trọng）', example: '手続きに関してご説明します' },
        { word: '〜に関する', reading: 'にかんする', meaning: '〜についての（連体形）', example: '医療に関する法律' },
        { word: '〜に関しては', reading: 'にかんしては', meaning: '〜については（trang trọng）', example: '費用に関しては別途ご連絡します' },
        { word: '情報', reading: 'じょうほう', meaning: 'thông tin', example: '患者情報に関して' },
      ],
      dialogue: [
        { speaker: '担当者', japanese: '個人情報の取り扱いに関してご説明いたします。', reading: 'こじんじょうほうのとりあつかいにかんしてごせつめいいたします。', translation: 'Tôi xin giải thích về việc xử lý thông tin cá nhân.' },
        { speaker: '患者', japanese: 'はい、プライバシーに関する規定を教えてください。', reading: 'はい、プライバシーにかんするきていをおしえてください。', translation: 'Vâng, xin hãy cho tôi biết quy định liên quan đến quyền riêng tư.' },
        { speaker: '担当者', japanese: '費用に関しては、後ほど詳しくご案内します。', reading: 'ひようにかんしては、のちほどくわしくごあんないします。', translation: 'Về chi phí, tôi sẽ hướng dẫn chi tiết sau.' },
      ],
      examples: [
        { japanese: '薬の副作用に関して、詳しく調査が必要だ。', reading: 'くすりのふくさようにかんして、くわしくちょうさがひつようだ。', translation: 'Cần điều tra chi tiết về tác dụng phụ của thuốc.' },
        { japanese: '介護報酬に関する制度が変わります。', reading: 'かいごほうしゅうにかんするせいどがかわります。', translation: 'Chế độ liên quan đến phí điều dưỡng sẽ thay đổi.' },
        { japanese: '労働条件に関しては、組合と交渉中です。', reading: 'ろうどうじょうけんにかんしては、くみあいとこうしょうちゅうです。', translation: 'Về điều kiện lao động, đang trong quá trình đàm phán với công đoàn.' },
      ],
      grammarNote: `【〜に関して vs 〜について の使い分け】

に関して（格式高い・書き言葉）
例：「本件に関してご報告いたします」
→ ビジネス文書・公式文書・論文

について（普通・話し言葉OK）
例：「この問題について話し合いましょう」
→ 日常会話・一般文書

【に関する + 名詞】
「〜に関する問題/規定/情報/調査」など名詞との組み合わせが多い
例：「個人情報に関する法律」= Luật liên quan đến thông tin cá nhân

【類似表現との比較】
〜に関して：内容・主題を示す
〜について：内容・主題（やや口語的）
〜をめぐって：争い・議論の対象`,
      quizzes: [
        {
          question: 'より格式の高い表現はどちらですか？',
          options: [
            { id: 'a', text: '残業代について説明します' },
            { id: 'b', text: '残業代に関して説明いたします' },
            { id: 'c', text: '残業代のことを話します' },
            { id: 'd', text: '残業代を教えます' },
          ],
          correctId: 'b',
          explanation: '「に関して」+「いたします」の組み合わせが最も格式高い。ビジネス場面に最適。 "に関して" + "いたします" là kết hợp trang trọng nhất, phù hợp với môi trường kinh doanh.',
          difficulty: 'easy' as const,
        },
        {
          question: '「（　）に関する書類を提出してください。」の（　）に入る最も自然な語は？',
          options: [
            { id: 'a', text: '経歴' },
            { id: 'b', text: 'だれ' },
            { id: 'c', text: 'どこ' },
            { id: 'd', text: 'なにか' },
          ],
          correctId: 'a',
          explanation: '「〜に関する」は名詞と結合するので、名詞「経歴」が適切。 "〜に関する" kết hợp với danh từ nên "経歴" (tiểu sử) là phù hợp.',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 30,
    },
  },

  'n2-01-7': {
    courseTitle: { ja: 'N2 上級文法マスター', vi: 'Ngữ pháp nâng cao N2' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N2文法⑦: 〜において・〜においては',
      titleTranslation: 'Ngữ pháp N2⑦: Tại.../Trong lĩnh vực...',
      introduction: `「〜において」は「〜で（場所・時・状況・分野）」という意味の格式高い表現です。場所だけでなく、時間・分野・状況なども表せる点が「〜で」との大きな違いです。公式文書・スピーチ・論説文などで多用されます。

"〜において" có nghĩa là "tại / trong (địa điểm, thời gian, lĩnh vực, tình huống)" - biểu hiện trang trọng hơn "〜で". Ngoài địa điểm còn có thể biểu thị thời gian, lĩnh vực, tình huống. Thường dùng trong văn bản chính thức, diễn văn, xã luận.`,
      keyPoints: [
        '接続：名詞 + において（場所・時・状況・分野）',
        '「〜で」より格式が高い書き言葉的表現',
        '場所だけでなく時間・分野・状況にも使える',
        '「においては」「においても」「における + 名詞」の形も重要',
        '例：「現代社会において」「医療分野において」',
      ],
      vocabulary: [
        { word: '〜において', reading: 'において', meaning: '〜で（tại/trong）格式的', example: '手術室において処置を行う' },
        { word: '〜においては', reading: 'においては', meaning: '〜ではとくに（trong ~ thì）', example: '日本においては稀な病気だ' },
        { word: '〜における', reading: 'における', meaning: '〜での（liên thể）', example: '医療における最先端技術' },
        { word: '分野', reading: 'ぶんや', meaning: 'lĩnh vực', example: '医療分野において' },
      ],
      dialogue: [
        { speaker: '司会', japanese: '本日は、医療分野における最新の研究についてご報告します。', reading: 'ほんじつは、いりょうぶんやにおけるさいしんのけんきゅうについてごほうこくします。', translation: 'Hôm nay chúng tôi sẽ báo cáo về nghiên cứu mới nhất trong lĩnh vực y tế.' },
        { speaker: '研究者', japanese: 'この研究は臨床において大きな意義を持っています。', reading: 'このけんきゅうはりんしょうにおいておおきないぎをもっています。', translation: 'Nghiên cứu này có ý nghĩa lớn trong lâm sàng.' },
        { speaker: '司会', japanese: '現代においては、AIの活用も進んでいますね。', reading: 'げんだいにおいては、AIのかつようもすすんでいますね。', translation: 'Trong thời đại hiện nay, việc ứng dụng AI cũng đang tiến triển nhỉ.' },
      ],
      examples: [
        { japanese: '医療現場において、感染対策は最重要課題だ。', reading: 'いりょうげんばにおいて、かんせんたいさくはさいじゅうようかだいだ。', translation: 'Tại hiện trường y tế, biện pháp phòng chống nhiễm khuẩn là vấn đề quan trọng nhất.' },
        { japanese: '日本における高齢化率は世界最高水準だ。', reading: 'にほんにおけるこうれいかりつはせかいさいこうすいじゅんだ。', translation: 'Tỷ lệ già hóa tại Nhật Bản ở mức cao nhất thế giới.' },
        { japanese: '職場においては、上司への敬語が重要です。', reading: 'しょくばにおいては、じょうしへのけいごがじゅうようです。', translation: 'Tại nơi làm việc, kính ngữ với cấp trên là quan trọng.' },
      ],
      grammarNote: `【〜において vs 〜で の違い】

で（日常）：場所のみ
例：「病院で手術する」= Phẫu thuật ở bệnh viện（日常的）

において（格式）：場所・時・分野・状況
例：「手術室において処置を行う」= Thực hiện xử lý tại phòng mổ（公式）

【において の応用形】
「においては」：「〜ではとくに」条件を強調
例：「この地域においては珍しい」

「における + 名詞」：連体修飾
例：「職場における問題」= Vấn đề tại nơi làm việc

【頻出パターン】
現代において / 日本において / 医療分野において / 歴史において`,
      quizzes: [
        {
          question: '格式の高い場面で使う表現として適切なのはどれですか？',
          options: [
            { id: 'a', text: '病院で説明会をします' },
            { id: 'b', text: '病院において説明会を開催します' },
            { id: 'c', text: '病院のところで説明します' },
            { id: 'd', text: '病院に行って説明します' },
          ],
          correctId: 'b',
          explanation: '「において＋開催します」が最も格式高い表現。ビジネス・公式な場面に適している。 "において＋開催します" là cách diễn đạt trang trọng nhất, phù hợp với trường hợp chính thức.',
          difficulty: 'easy' as const,
        },
        {
          question: '「（　）における問題を解決することが急務です。」の（　）に入る最も自然な語は？',
          options: [
            { id: 'a', text: '医療現場' },
            { id: 'b', text: '食べること' },
            { id: 'c', text: '笑う' },
            { id: 'd', text: 'とても' },
          ],
          correctId: 'a',
          explanation: '「における」の前は名詞が必要。「医療現場における問題」が最も自然な組み合わせ。 Trước "における" cần danh từ. "医療現場における問題" là kết hợp tự nhiên nhất.',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 30,
    },
  },

  'n2-01-8': {
    courseTitle: { ja: 'N2 上級文法マスター', vi: 'Ngữ pháp nâng cao N2' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N2文法⑧: 〜とともに・〜に伴って',
      titleTranslation: 'Ngữ pháp N2⑧: Cùng với... / Đi kèm với...',
      introduction: `「〜とともに」は「〜と一緒に」または「〜に伴って（同時変化）」という意味があります。「〜に伴って」は「〜が起きると、それに連動して〜も変化する」という意味で、変化・増減などを表すときに使います。

"〜とともに" có hai nghĩa: "cùng với" hoặc "đồng thời thay đổi cùng". "〜に伴って" có nghĩa là "đi kèm với ~ (khi ~ xảy ra thì ~ cũng thay đổi theo)" - dùng khi biểu thị sự thay đổi, tăng giảm đồng thời.`,
      keyPoints: [
        '〜とともに①：「〜と一緒に」（cùng với, cùng nhau）',
        '〜とともに②：「〜するにつれて同時に変化する」（変化の同時性）',
        '〜に伴って：「〜の変化に連動して」（đi kèm với sự thay đổi）',
        '接続：名詞/動詞辞書形 + とともに / 名詞 + に伴って',
        '例：「高齢化とともに医療費が増加している」',
      ],
      vocabulary: [
        { word: '〜とともに①', reading: 'とともに', meaning: 'cùng với（一緒に）', example: '家族とともに働く' },
        { word: '〜とともに②', reading: 'とともに', meaning: '〜につれて同時に（đồng thời）', example: '時代とともに変化する' },
        { word: '〜に伴って', reading: 'にともなって', meaning: 'đi kèm với（連動して変化）', example: '高齢化に伴って費用も増える' },
        { word: '伴う', reading: 'ともなう', meaning: 'đi kèm, kéo theo', example: '副作用を伴う治療' },
      ],
      dialogue: [
        { speaker: 'A', japanese: '高齢化とともに、認知症患者も増えていますね。', reading: 'こうれいかとともに、にんちしょうかんじゃもふえていますね。', translation: 'Cùng với việc già hóa, bệnh nhân mất trí nhớ cũng đang tăng nhỉ.' },
        { speaker: 'B', japanese: 'ええ、それに伴って介護施設の需要も高まっています。', reading: 'ええ、それにともなって かいごしせつのじゅようもたかまっています。', translation: 'Vâng, đi kèm với đó, nhu cầu về cơ sở điều dưỡng cũng đang tăng cao.' },
        { speaker: 'A', japanese: '医療技術の進歩とともに、治療の選択肢も広がりますね。', reading: 'いりょうぎじゅつのしんぽとともに、ちりょうのせんたくしもひろがりますね。', translation: 'Cùng với sự tiến bộ của công nghệ y tế, các lựa chọn điều trị cũng được mở rộng nhỉ.' },
      ],
      examples: [
        { japanese: '経済発展に伴って、生活水準が向上した。', reading: 'けいざいはってんにともなって、せいかつすいじゅんがこうじょうした。', translation: 'Đi kèm với sự phát triển kinh tế, mức sống đã được cải thiện.' },
        { japanese: '年齢とともに体力が落ちるのは自然なことだ。', reading: 'ねんれいとともにたいりょくがおちるのはしぜんなことだ。', translation: 'Thể lực giảm cùng với tuổi tác là điều tự nhiên.' },
        { japanese: '手術に伴うリスクについて説明します。', reading: 'しゅじゅつにともなうリスクについてせつめいします。', translation: 'Tôi sẽ giải thích về rủi ro đi kèm với phẫu thuật.' },
      ],
      grammarNote: `【〜とともに vs 〜に伴って の使い分け】

とともに：
①「一緒に」：人や物と一緒に行動する
例：「同僚とともに研修を受けた」

②変化の同時性（〜するにつれて）：
例：「老化とともに免疫力が低下する」

に伴って：
変化Aが起きると、連動してBも変化する
例：「少子化に伴って学校の数が減っている」

【ポイント】
「に伴う + 名詞」の形も頻出
例：「高齢化に伴う問題」= Vấn đề đi kèm với già hóa`,
      quizzes: [
        {
          question: '「気温が下がる（　）、インフルエンザ患者が増える。」',
          options: [
            { id: 'a', text: 'とともに' },
            { id: 'b', text: 'によって' },
            { id: 'c', text: 'にかかわらず' },
            { id: 'd', text: 'において' },
          ],
          correctId: 'a',
          explanation: '「気温が下がるにつれてインフルエンザも増える」という同時変化・連動の関係なので「とともに」が正解。 Đây là sự thay đổi đồng thời/liên động nên dùng "とともに".',
          difficulty: 'medium' as const,
        },
        {
          question: '「（　）に伴う問題に対処する必要がある。」の（　）に最も適切な語は？',
          options: [
            { id: 'a', text: '高齢化' },
            { id: 'b', text: '嬉しい' },
            { id: 'c', text: '走る' },
            { id: 'd', text: 'きれい' },
          ],
          correctId: 'a',
          explanation: '「に伴う」の前は名詞が必要。「高齢化に伴う問題」が最も自然。 Trước "に伴う" cần danh từ. "高齢化に伴う問題" là tự nhiên nhất.',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 30,
    },
  },

  'n2-01-9': {
    courseTitle: { ja: 'N2 上級文法マスター', vi: 'Ngữ pháp nâng cao N2' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N2文法⑨: 〜を通じて・〜を通して',
      titleTranslation: 'Ngữ pháp N2⑨: Thông qua... / Suốt...',
      introduction: `「〜を通じて」と「〜を通して」はほぼ同じ意味で使われますが、微妙な違いがあります。①媒介・手段「〜を経由して」、②期間「〜の間ずっと」の2つの用法があります。「を通じて」はやや書き言葉的で、「を通して」は口語でも使えます。

"〜を通じて" và "〜を通して" gần giống nhau nhưng có sự khác biệt nhỏ: ①trung gian/phương tiện "thông qua", ②thời gian "suốt thời gian". "を通じて" hơi văn viết; "を通して" dùng được cả trong hội thoại.`,
      keyPoints: [
        '①媒介・手段：「〜を経由して・〜を使って」（thông qua phương tiện）',
        '②期間：「〜の間ずっと」（suốt năm/mùa）',
        '「を通じて」：やや書き言葉（hơi văn viết）',
        '「を通して」：口語でも使用可（dùng được cả khi nói）',
        '例：「友人を通じて知った」「一年を通して暖かい」',
      ],
      vocabulary: [
        { word: '〜を通じて①', reading: 'をつうじて', meaning: '〜経由で（thông qua）', example: 'SNSを通じて情報を発信する' },
        { word: '〜を通して①', reading: 'をとおして', meaning: '〜経由で（thông qua）', example: 'ボランティアを通して成長できた' },
        { word: '〜を通じて②', reading: 'をつうじて', meaning: '〜の間ずっと（suốt）', example: '一年を通じて温暖な気候' },
        { word: '媒介', reading: 'ばいかい', meaning: 'trung gian, môi giới', example: '感染の媒介になる' },
      ],
      dialogue: [
        { speaker: 'A', japanese: '研修を通じて、多くのことを学びました。', reading: 'けんしゅうをつうじて、おおくのことをまなびました。', translation: 'Thông qua khóa đào tạo, tôi đã học được nhiều điều.' },
        { speaker: 'B', japanese: 'ハノイは一年を通して蒸し暑い日が多いですね。', reading: 'ハノイはいちねんをとおしてむしあついひがおおいですね。', translation: 'Hà Nội có nhiều ngày nóng ẩm suốt cả năm nhỉ.' },
        { speaker: 'A', japanese: 'SNSを通して患者さんへの情報提供もできますね。', reading: 'SNSをとおしてかんじゃさんへのじょうほうていきょうもできますね。', translation: 'Thông qua mạng xã hội cũng có thể cung cấp thông tin cho bệnh nhân nhỉ.' },
      ],
      examples: [
        { japanese: '教育を通じて、社会に貢献したいと思う。', reading: 'きょういくをつうじて、しゃかいにこうけんしたいとおもう。', translation: 'Tôi muốn đóng góp cho xã hội thông qua giáo dục.' },
        { japanese: '仕事を通して、様々な人との出会いがあった。', reading: 'しごとをとおして、さまざまなひととのであいがあった。', translation: 'Thông qua công việc, tôi đã gặp gỡ nhiều người.' },
        { japanese: '一年を通じて花が咲く温暖な地域だ。', reading: 'いちねんをつうじてはながさくおんだんなちいきだ。', translation: 'Đây là vùng ấm áp mà hoa nở suốt cả năm.' },
      ],
      grammarNote: `【〜を通じて vs 〜を通して の微妙な違い】

ほぼ互換的だが：
を通じて：より書き言葉的・フォーマル
を通して：書き言葉・話し言葉両方OK

【意味①：媒介・手段】
「Aを通じて/通してBする」= AというルートでBを行う
例：「仲介業者を通じて契約する」= Ký hợp đồng thông qua đại lý

【意味②：期間「〜ずっと」】
「〜を通じて/通して」= 〜の間ずっと
例：「夏を通して猛暑が続いた」= Nắng nóng gay gắt suốt mùa hè

【一年を通じて vs 一年中】
ほぼ同義だが「一年を通じて」のほうが書き言葉的`,
      quizzes: [
        {
          question: '「インターネット（　）、世界中と繋がることができる。」',
          options: [
            { id: 'a', text: 'において' },
            { id: 'b', text: 'を通じて' },
            { id: 'c', text: 'にとって' },
            { id: 'd', text: 'をめぐって' },
          ],
          correctId: 'b',
          explanation: '「インターネットを経由して/手段として繋がる」という媒介・手段の意味なので「を通じて」が正解。 Đây là "thông qua internet" - phương tiện nên dùng "を通じて".',
          difficulty: 'easy' as const,
        },
        {
          question: '「この地方は（　）を通じて、温暖な気候が続く。」の（　）は？',
          options: [
            { id: 'a', text: '夏' },
            { id: 'b', text: '一年' },
            { id: 'c', text: '毎日' },
            { id: 'd', text: 'いつも' },
          ],
          correctId: 'b',
          explanation: '「を通じて」の期間用法では「一年を通じて」「四季を通じて」などの期間を表す語が前に来る。 Dạng thời gian của "を通じて" thường đi với "一年" (cả năm).',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 30,
    },
  },

  'n2-01-10': {
    courseTitle: { ja: 'N2 上級文法マスター', vi: 'Ngữ pháp nâng cao N2' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N2文法⑩: 〜にわたって・〜にわたる',
      titleTranslation: 'Ngữ pháp N2⑩: Kéo dài... / Trải rộng...',
      introduction: `「〜にわたって」は「〜の全期間/全範囲に広がって」という意味で、時間的・空間的・内容的な範囲の広さを表します。数量や期間を表す語と一緒に使うことが多く、「3時間にわたって」「全国にわたって」のように使います。

"〜にわたって" có nghĩa là "kéo dài/trải rộng trong suốt (toàn bộ thời gian/phạm vi)" - biểu thị phạm vi rộng về thời gian, không gian, nội dung. Thường dùng với từ chỉ số lượng/thời gian như "3時間にわたって", "全国にわたって".`,
      keyPoints: [
        '接続：数量/範囲を表す名詞 + にわたって / にわたる + 名詞',
        '意味：〜の全体に広がる（trải rộng, kéo dài khắp）',
        '時間：「3時間にわたって」「数年にわたって」',
        '空間：「全国にわたって」「広い範囲にわたって」',
        '例：「3日間にわたる調査が終了した」',
      ],
      vocabulary: [
        { word: '〜にわたって', reading: 'にわたって', meaning: '〜の全体に（trải dài, kéo dài）', example: '半年にわたって研修が続いた' },
        { word: '〜にわたる', reading: 'にわたる', meaning: '〜の全体に（連体形）', example: '数年にわたる研究' },
        { word: '広範囲', reading: 'こうはんい', meaning: 'phạm vi rộng', example: '広範囲にわたる調査' },
        { word: '延べ', reading: 'のべ', meaning: 'tổng số（累計）', example: '延べ100人にわたる参加者' },
      ],
      dialogue: [
        { speaker: 'A', japanese: '今回の調査は3か月にわたって実施されたそうです。', reading: 'こんかいのちょうさは3かげつにわたってじっしされたそうです。', translation: 'Đợt điều tra lần này nghe nói được thực施 kéo dài 3 tháng.' },
        { speaker: 'B', japanese: 'ええ、全国にわたる医療機関への聞き取りでした。', reading: 'ええ、ぜんこくにわたるいりょうきかんへのききとりでした。', translation: 'Vâng, đó là cuộc phỏng vấn các cơ sở y tế trải khắp cả nước.' },
        { speaker: 'A', japanese: '広範囲にわたる問題だから、対策も難しいですね。', reading: 'こうはんいにわたるもんだいだから、たいさくもむずかしいですね。', translation: 'Vì là vấn đề trải rộng trên phạm vi rộng nên đối sách cũng khó khăn nhỉ.' },
      ],
      examples: [
        { japanese: '手術は8時間にわたって行われた。', reading: 'しゅじゅつは8じかんにわたっておこなわれた。', translation: 'Cuộc phẫu thuật được tiến hành kéo dài 8 tiếng.' },
        { japanese: '5年にわたる研究の末、新薬が完成した。', reading: '5ねんにわたるけんきゅうのすえ、しんやくがかんせいした。', translation: 'Sau nghiên cứu kéo dài 5 năm, thuốc mới đã hoàn thành.' },
        { japanese: '被害は数十か所にわたって確認された。', reading: 'ひがいはすうじゅっかしょにわたってかくにんされた。', translation: 'Thiệt hại được xác nhận trải rộng tại hàng chục địa điểm.' },
      ],
      grammarNote: `【〜にわたって の使い方ポイント】

前に来る語のパターン：
①時間量：「3時間・数年・長期間・半年」にわたって
②数量：「10か所・多数・延べ100人」にわたって
③範囲：「全国・広い地域・全体」にわたって

【にわたって vs にわたる】
「にわたって」：動詞を修飾（述語前）
例：「3時間にわたって話し合った」

「にわたる + 名詞」：名詞を修飾
例：「3時間にわたる会議」

【類似表現との比較】
〜を通じて：手段・期間
〜にわたって：範囲の広さ・全体への広がり`,
      quizzes: [
        {
          question: '「（　）にわたる調査で、深刻な問題が明らかになった。」の（　）に適切な語は？',
          options: [
            { id: 'a', text: '長期間' },
            { id: 'b', text: 'とても' },
            { id: 'c', text: 'きれいな' },
            { id: 'd', text: 'すぐ' },
          ],
          correctId: 'a',
          explanation: '「にわたる」の前は時間・範囲・数量を表す名詞が必要。「長期間にわたる」は自然な組み合わせ。 Trước "にわたる" cần danh từ biểu thị thời gian/phạm vi/số lượng.',
          difficulty: 'easy' as const,
        },
        {
          question: '「手術は（　）にわたって行われた。」の（　）に入る最も自然な語は？',
          options: [
            { id: 'a', text: '6時間' },
            { id: 'b', text: '楽しい' },
            { id: 'c', text: 'たくさん' },
            { id: 'd', text: '難しく' },
          ],
          correctId: 'a',
          explanation: '「にわたって」の前は「時間・数量・範囲」を表す名詞。「6時間」が最適。 "にわたって" cần danh từ chỉ thời gian như "6時間".',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 30,
    },
  },

  'n2-01-11': {
    courseTitle: { ja: 'N2 上級文法マスター', vi: 'Ngữ pháp nâng cao N2' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N2文法⑪: 〜上（じょう）で・〜上の',
      titleTranslation: 'Ngữ pháp N2⑪: Về mặt... / Trong...',
      introduction: `「〜上（じょう）で」は「〜の点で・〜の観点から」という意味で、ある観点・分野・側面から見て、という意味を表します。「法律上」「仕事上」「手続き上」のように使います。また「〜うえで」（〜した後で・〜するために）という別の用法も重要です。

"〜上（じょう）" có nghĩa là "về mặt.../xét từ góc độ..." - biểu thị quan điểm hoặc lĩnh vực cụ thể. Ví dụ: "法律上"（về mặt pháp lý）, "仕事上"（trong công việc）. Còn có dạng "〜うえで" nghĩa khác: "sau khi.../để..."`,
      keyPoints: [
        '〜上（じょう）：「〜の点で・〜の観点から」（về mặt...）',
        '接続：名詞 + 上（じょう）で / 上（じょう）の + 名詞',
        '頻出：法律上・仕事上・手続き上・制度上・形式上・記録上',
        '〜うえで（別用法）：「〜した後で/〜するために」',
        '例：「法律上、問題はない」「確認のうえでご返答します」',
      ],
      vocabulary: [
        { word: '法律上', reading: 'ほうりつじょう', meaning: 'về mặt pháp lý', example: '法律上の問題はない' },
        { word: '仕事上', reading: 'しごとじょう', meaning: 'trong công việc', example: '仕事上のつきあい' },
        { word: '手続き上', reading: 'てつづきじょう', meaning: 'về mặt thủ tục', example: '手続き上の問題' },
        { word: '形式上', reading: 'けいしきじょう', meaning: 'về mặt hình thức', example: '形式上は問題ない' },
      ],
      dialogue: [
        { speaker: 'A', japanese: '手続き上、書類の提出が必要です。', reading: 'てつづきじょう、しょるいのていしゅつがひつようです。', translation: 'Về mặt thủ tục, cần nộp hồ sơ.' },
        { speaker: 'B', japanese: '法律上の問題はないと確認しました。', reading: 'ほうりつじょうのもんだいはないとかくにんしました。', translation: 'Tôi đã xác nhận không có vấn đề về mặt pháp lý.' },
        { speaker: 'A', japanese: '内容を確認したうえで、ご連絡いたします。', reading: 'ないようをかくにんしたうえで、ごれんらくいたします。', translation: 'Sau khi xác nhận nội dung, tôi sẽ liên lạc lại.' },
      ],
      examples: [
        { japanese: '記録上は退院済みとなっています。', reading: 'きろくじょうはたいいんずみとなっています。', translation: 'Về mặt hồ sơ, đã được ghi nhận là xuất viện.' },
        { japanese: '制度上、申請が必要な場合があります。', reading: 'せいどじょう、しんせいがひつようなばあいがあります。', translation: 'Về mặt chế độ, đôi khi cần phải nộp đơn.' },
        { japanese: '資格を取得したうえで、業務に就く必要がある。', reading: 'しかくをしゅとくしたうえで、ぎょうむにつくひつようがある。', translation: 'Cần phải làm việc sau khi đã có bằng cấp.' },
      ],
      grammarNote: `【〜上（じょう） vs 〜うえで の区別】

〜上（じょう）：名詞に接続、「〜の観点・分野では」
例：「法律上（ほうりつじょう）」「業務上（ぎょうむじょう）」
→ Danh từ Hán-Nhật + 上

〜うえで：動詞た形/名詞 + うえで、「〜した後で」または「〜するために」
例：「確認したうえで連絡する」= Liên lạc sau khi xác nhận
例：「健康のうえで大切なこと」= Điều quan trọng để có sức khỏe

【頻出の〜上（じょう）表現】
業務上・事務上・制度上・記録上・形式上・慣例上・道義上`,
      quizzes: [
        {
          question: '「（　）上、患者の同意が必要です。」の（　）に適切な語は？',
          options: [
            { id: 'a', text: '法律' },
            { id: 'b', text: '好き' },
            { id: 'c', text: '走る' },
            { id: 'd', text: 'とても' },
          ],
          correctId: 'a',
          explanation: '「〜上（じょう）」の前は名詞（特に漢語）が来る。「法律上」= về mặt pháp lý が正解。 Trước "〜上（じょう）" là danh từ（đặc biệt là từ Hán-Nhật）.',
          difficulty: 'easy' as const,
        },
        {
          question: '「内容を確認した（　）、ご回答いたします。」の（　）は？',
          options: [
            { id: 'a', text: 'うえで' },
            { id: 'b', text: '上（じょう）で' },
            { id: 'c', text: 'として' },
            { id: 'd', text: 'にわたって' },
          ],
          correctId: 'a',
          explanation: '「確認したうえで」= Sau khi xác nhận。動詞た形 + うえで で「〜してから/〜した後」の意味。 "動詞た形 + うえで" = sau khi làm gì đó.',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 30,
    },
  },

  'n2-01-12': {
    courseTitle: { ja: 'N2 上級文法マスター', vi: 'Ngữ pháp nâng cao N2' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N2文法⑫: 〜にほかならない',
      titleTranslation: 'Ngữ pháp N2⑫: Chẳng phải gì khác mà là...',
      introduction: `「〜にほかならない」は「〜以外の何でもない・まさに〜だ」という強調表現で、「これこそが〜だ」という断定・強調のニュアンスを持ちます。論説文・スピーチ・書き言葉でよく使われるN2重要表現です。

"〜にほかならない" là biểu hiện nhấn mạnh nghĩa là "chẳng phải gì khác ngoài.../chính là..." - mang sắc thái khẳng định mạnh "đây chính là...". Thường dùng trong xã luận, diễn văn, văn viết.`,
      keyPoints: [
        '接続：名詞 / 動詞辞書形 + にほかならない',
        '意味：「〜以外の何でもない」（強調・断定）（chính là...）',
        '書き言葉的・論説文・スピーチでよく使用',
        '否定形：「〜にほかならない」の文を否定する場合は「〜とは言えない」',
        '例：「これは患者への裏切りにほかならない」',
      ],
      vocabulary: [
        { word: 'にほかならない', reading: 'にほかならない', meaning: 'chính là, không gì khác', example: 'それは差別にほかならない' },
        { word: '断定', reading: 'だんてい', meaning: 'khẳng định chắc chắn', example: '断定的な言い方' },
        { word: '〜に過ぎない', reading: 'にすぎない', meaning: 'chỉ là... mà thôi（次の課）', example: '言い訳に過ぎない' },
        { word: 'まさに', reading: 'まさに', meaning: 'đúng là, chính là', example: 'まさにそのとおりだ' },
      ],
      dialogue: [
        { speaker: 'A', japanese: '患者に虚偽の説明をするのは、信頼の裏切りにほかならない。', reading: 'かんじゃにきょぎのせつめいをするのは、しんらいのうらぎりにほかならない。', translation: 'Giải thích dối trá cho bệnh nhân chẳng phải gì khác mà là sự phản bội lòng tin.' },
        { speaker: 'B', japanese: 'おっしゃる通りです。患者の信頼こそが医療の基盤ですから。', reading: 'おっしゃるとおりです。かんじゃのしんらいこそがいりょうのきばんですから。', translation: 'Đúng như anh nói. Vì lòng tin của bệnh nhân chính là nền tảng của y tế.' },
      ],
      examples: [
        { japanese: 'この成功は、チーム全員の努力にほかならない。', reading: 'このせいこうは、チームぜんいんのどりょくにほかならない。', translation: 'Thành công này chính là nhờ nỗ lực của toàn bộ đội.' },
        { japanese: '患者を無視した決定は、医療倫理の違反にほかならない。', reading: 'かんじゃをむしにしたけっていは、いりょうりんりのいはんにほかならない。', translation: 'Quyết định bỏ qua bệnh nhân chính là vi phạm đạo đức y tế.' },
        { japanese: 'これは社会全体の問題にほかならないと考える。', reading: 'これはしゃかいぜんたいのもんだいにほかならないとかんがえる。', translation: 'Tôi cho rằng đây chính là vấn đề của toàn xã hội.' },
      ],
      grammarNote: `【〜にほかならない の使い方】

「AはBにほかならない」= A chính là B（強い断定）
例：「それは嘘にほかならない」= Điều đó chính là nói dối

【類似表現との比較】
〜にほかならない（強い断定・書き言葉）
〜に過ぎない（「ただ〜だけ」謙虚・否定的ニュアンス）
〜というものだ（一般的な断定）

【文体】
書き言葉・論説文・スピーチ向け。日常会話では「まさに〜だ」「まさしく〜だ」を使う。`,
      quizzes: [
        {
          question: '「この失敗は、準備不足（　）。」の（　）に入る表現は？',
          options: [
            { id: 'a', text: 'にほかならない' },
            { id: 'b', text: 'にわたる' },
            { id: 'c', text: 'において' },
            { id: 'd', text: 'とともに' },
          ],
          correctId: 'a',
          explanation: '「この失敗の原因はまさに準備不足だ」という強い断定の表現なので「にほかならない」が正解。 Đây là khẳng định mạnh "chính là thiếu chuẩn bị" nên dùng "にほかならない".',
          difficulty: 'medium' as const,
        },
        {
          question: '「にほかならない」と最も近い意味の表現はどれですか？',
          options: [
            { id: 'a', text: 'まさに〜だ' },
            { id: 'b', text: '〜かもしれない' },
            { id: 'c', text: 'たとえ〜でも' },
            { id: 'd', text: '〜に過ぎない' },
          ],
          correctId: 'a',
          explanation: '「にほかならない」は「まさに〜だ・〜以外の何でもない」という強い断定表現。 "にほかならない" = "まさに〜だ" - đây là biểu hiện khẳng định mạnh.',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 30,
    },
  },

  'n2-01-13': {
    courseTitle: { ja: 'N2 上級文法マスター', vi: 'Ngữ pháp nâng cao N2' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N2文法⑬: 〜に過ぎない・〜に過ぎなかった',
      titleTranslation: 'Ngữ pháp N2⑬: Chỉ là... mà thôi',
      introduction: `「〜に過ぎない」は「ただ〜だけで、大したことではない」という意味で、過小評価や謙遜のニュアンスを表します。「〜に過ぎなかった」は過去形です。程度・規模・重要性を小さく見せる表現で、日本語能力試験N2の頻出文法です。

"〜に過ぎない" có nghĩa là "chỉ là... mà thôi / không hơn không kém..." - biểu thị sắc thái đánh giá thấp hoặc khiêm tốn. "〜に過ぎなかった" là dạng quá khứ. Đây là ngữ pháp xuất hiện thường xuyên trong N2.`,
      keyPoints: [
        '接続：名詞 / 動詞辞書形 / 数量詞 + に過ぎない',
        '意味：「ただ〜だけ・〜以上でも以下でもない」（chỉ là）',
        '謙遜・過小評価のニュアンス',
        '数量表現と相性がよい：「3人に過ぎない」「少数に過ぎない」',
        '例：「私はただの学生に過ぎない」',
      ],
      vocabulary: [
        { word: '〜に過ぎない', reading: 'にすぎない', meaning: 'chỉ là... thôi / không gì hơn', example: 'まだ始まりに過ぎない' },
        { word: '〜に過ぎなかった', reading: 'にすぎなかった', meaning: 'chỉ là... (quá khứ)', example: '夢に過ぎなかった' },
        { word: '過小評価', reading: 'かしょうひょうか', meaning: 'đánh giá thấp', example: '過小評価してはいけない' },
        { word: 'ただ〜だけ', reading: 'ただ〜だけ', meaning: 'chỉ là/chỉ có', example: 'ただ5人だけ参加した' },
      ],
      dialogue: [
        { speaker: 'A', japanese: '先生のご研究は世界的に有名ですね。', reading: 'せんせいのごけんきゅうはせかいてきにゆうめいですね。', translation: 'Nghiên cứu của thầy nổi tiếng toàn thế giới nhỉ.' },
        { speaker: '先生', japanese: 'いいえ、私はまだ駆け出しの研究者に過ぎません。', reading: 'いいえ、わたしはまだかけだしのけんきゅうしゃにすぎません。', translation: 'Không, tôi chỉ là một nhà nghiên cứu mới vào nghề thôi.' },
        { speaker: 'A', japanese: 'ご謙遜を。患者数は100人に過ぎないのに、成果はすばらしいです。', reading: 'ごけんそんを。かんじゃすうは100にんにすぎないのに、せいかはすばらしいです。', translation: 'Khiêm tốn quá. Dù số bệnh nhân chỉ là 100 người nhưng kết quả thật tuyệt vời.' },
      ],
      examples: [
        { japanese: 'これは一例に過ぎず、他にも多くの問題がある。', reading: 'これはいちれいにすぎず、ほかにもおおくのもんだいがある。', translation: 'Đây chỉ là một ví dụ, còn nhiều vấn đề khác nữa.' },
        { japanese: '当時、参加者は10名に過ぎなかった。', reading: 'とうじ、さんかしゃは10めいにすぎなかった。', translation: 'Vào thời đó, số người tham gia chỉ có 10 người thôi.' },
        { japanese: '私の意見は個人的な感想に過ぎませんが…。', reading: 'わたしのいけんはこじんてきなかんそうにすぎませんが…。', translation: 'Ý kiến của tôi chỉ là cảm nhận cá nhân thôi, nhưng...' },
      ],
      grammarNote: `【〜に過ぎない vs 〜にほかならない】

〜に過ぎない：「ただ〜だけ・取るに足りない」（nhỏ bé, khiêm tốn）
例：「私は新人に過ぎない」= Tôi chỉ là người mới thôi

〜にほかならない：「まさに〜・〜以外の何でもない」（強い断定）
例：「これは欺瞞にほかならない」= Điều này chính là lừa dối

【に過ぎない の形に注意】
否定形（〜に過ぎない）のまま使う → 文末に否定が来る
「〜に過ぎず、〜」の形もある（中間節として使う）
例：「3人に過ぎず、人手が足りない」`,
      quizzes: [
        {
          question: '「私は新入社員（　）。偉そうなことは言えません。」の（　）は？',
          options: [
            { id: 'a', text: 'に過ぎません' },
            { id: 'b', text: 'にほかなりません' },
            { id: 'c', text: 'にわたります' },
            { id: 'd', text: 'においてです' },
          ],
          correctId: 'a',
          explanation: '謙遜して自分を小さく見せているので「に過ぎない」が正解。「にほかならない」は強い断定で謙遜には使わない。 Khiêm tốn về bản thân nên dùng "に過ぎない".',
          difficulty: 'medium' as const,
        },
        {
          question: '「参加者は（　）に過ぎなかった。」の（　）に適切な語は？',
          options: [
            { id: 'a', text: '数名' },
            { id: 'b', text: 'たくさん' },
            { id: 'c', text: '非常に多く' },
            { id: 'd', text: '盛況' },
          ],
          correctId: 'a',
          explanation: '「に過ぎない」は少ない・小さいニュアンスなので「数名（少人数）」が適切。 "に過ぎない" mang sắc thái ít/nhỏ nên "数名" phù hợp.',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 30,
    },
  },

  'n2-01-14': {
    courseTitle: { ja: 'N2 上級文法マスター', vi: 'Ngữ pháp nâng cao N2' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N2文法⑭: 〜どころか',
      titleTranslation: 'Ngữ pháp N2⑭: Chứ đừng nói đến.../Không những...mà còn...',
      introduction: `「〜どころか」は「〜は言うまでもなく、それ以上/以下のことが起きた」という意味で、予想や期待とは大きく違う結果を強調します。「A（低い期待）どころか、もっとひどいB/もっと良いBだ」という構造で使います。

"〜どころか" có nghĩa là "chứ đừng nói đến.../không những...mà còn..." - nhấn mạnh kết quả rất khác so với kỳ vọng. Cấu trúc: "Aどころか B" = Không phải chỉ là A, mà còn B hơn thế.`,
      keyPoints: [
        '接続：名詞 / 動詞辞書形 / い形容詞 / な形容詞語幹 + どころか',
        '意味①：「〜は言うまでもなく、それ以上」（không những... mà còn）',
        '意味②：「〜とは全く逆で、むしろ」（ngược lại）',
        '後ろには予想外の内容・逆の内容が来る',
        '例：「良くなるどころか、悪化した」「一人どころか10人来た」',
      ],
      vocabulary: [
        { word: '〜どころか', reading: 'どころか', meaning: 'chứ đừng nói đến / không những', example: '改善どころか悪化した' },
        { word: '言うまでもなく', reading: 'いうまでもなく', meaning: 'không cần phải nói', example: '言うまでもなく大切だ' },
        { word: 'むしろ', reading: 'むしろ', meaning: 'ngược lại / thay vào đó', example: 'むしろ悪くなった' },
        { word: '悪化', reading: 'あっか', meaning: 'trở nên tồi tệ hơn', example: '症状が悪化する' },
      ],
      dialogue: [
        { speaker: 'A', japanese: '薬を飲んで、症状は良くなりましたか？', reading: 'くすりをのんで、しょうじょうはよくなりましたか？', translation: 'Uống thuốc rồi, triệu chứng có đỡ hơn không?' },
        { speaker: 'B', japanese: 'よくなるどころか、副作用が出てしまいました。', reading: 'よくなるどころか、ふくさようがでてしまいました。', translation: 'Chứ đừng nói đến đỡ hơn, còn bị tác dụng phụ nữa.' },
        { speaker: 'A', japanese: 'では、一日どころか一週間も入院が必要かもしれません。', reading: 'では、いちにちどころかいっしゅうかんもにゅういんがひつようかもしれません。', translation: 'Vậy thì có thể cần nhập viện không phải một ngày mà cả một tuần nữa.' },
      ],
      examples: [
        { japanese: '治療費は安くなるどころか、さらに高くなった。', reading: 'ちりょうひはやすくなるどころか、さらにたかくなった。', translation: 'Chứ đừng nói đến giảm, chi phí điều trị còn tăng hơn nữa.' },
        { japanese: '休憩どころか、食事する時間もない忙しさだ。', reading: 'きゅうけいどころか、しょくじするじかんもないいそがしさだ。', translation: 'Không những không có thời gian nghỉ ngơi, mà còn không có thời gian ăn uống.' },
        { japanese: '5人どころか20人もの志願者が集まった。', reading: '5にんどころか20にんものしがんしゃがあつまった。', translation: 'Không phải 5 người, mà tới 20 ứng viên đã tập trung.' },
      ],
      grammarNote: `【〜どころか の2つの用法】

①期待・想定より「さらにひどい/さらに良い」
例：「良くなるどころか悪化した」（予想より悪い）
例：「1万円どころか10万円もかかった」（予想より多い）

②「〜は言うまでもなく、それ以上のことも」
例：「英語どころか、日本語も話せる」（英語+日本語も）

【ポイント】
後ろには必ず「予想外の内容・反対の内容」が来る
「良くなるどころか、良くなった」は不自然（矛盾なし）
「良くなるどころか、悪化した」が正しい`,
      quizzes: [
        {
          question: '「回復する（　）、容態が悪化した。」の（　）は？',
          options: [
            { id: 'a', text: 'どころか' },
            { id: 'b', text: 'ものの' },
            { id: 'c', text: 'とともに' },
            { id: 'd', text: 'に基づいて' },
          ],
          correctId: 'a',
          explanation: '「回復する（期待）とは逆に悪化した（予想外の結果）」という流れなので「どころか」が正解。 "どころか" dùng khi kết quả ngược với kỳ vọng.',
          difficulty: 'easy' as const,
        },
        {
          question: '「今月の患者数は100人どころか（　）にもなった。」の（　）は？',
          options: [
            { id: 'a', text: '300人' },
            { id: 'b', text: '50人' },
            { id: 'c', text: '10人' },
            { id: 'd', text: '0人' },
          ],
          correctId: 'a',
          explanation: '「どころか」の後は「それ以上の数量」が来る。100人どころか → もっと多い300人が自然。 Sau "どころか" là số lượng vượt xa kỳ vọng.',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 30,
    },
  },

  'n2-01-15': {
    courseTitle: { ja: 'N2 上級文法マスター', vi: 'Ngữ pháp nâng cao N2' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N2文法⑮: 〜ものの・〜とはいえ',
      titleTranslation: 'Ngữ pháp N2⑮: Mặc dù... / Tuy nói là...',
      introduction: `「〜ものの」は「〜ではあるが（逆接）」という意味で、予想外の結果や矛盾する状況を表します。「〜とはいえ」は「〜と言っても完全には言い切れない」というニュアンスで、部分的な認定をしながら留保を示します。

"〜ものの" có nghĩa là "mặc dù...nhưng" - biểu thị kết quả bất ngờ hoặc tình huống mâu thuẫn. "〜とはいえ" có sắc thái "dù nói là... nhưng không hoàn toàn như vậy" - thừa nhận một phần nhưng đặt ra điều kiện.`,
      keyPoints: [
        '〜ものの：「〜ではあるが（逆接）」（mặc dù... nhưng）',
        '〜とはいえ：「〜と言っても完全には言い切れない」（tuy nói là... nhưng）',
        '接続：〜ものの → 普通形 + ものの',
        '接続：〜とはいえ → 普通形/名詞 + とはいえ',
        '例：「申し込んだものの、行けなかった」「夏とはいえ、涼しい日もある」',
      ],
      vocabulary: [
        { word: '〜ものの', reading: 'ものの', meaning: 'mặc dù... nhưng（逆接）', example: '参加したものの、何もできなかった' },
        { word: '〜とはいえ', reading: 'とはいえ', meaning: 'tuy nói là...（部分認定）', example: '専門家とはいえ、間違うこともある' },
        { word: '逆接', reading: 'ぎゃくせつ', meaning: 'nghịch nghĩa (mặc dù... nhưng)', example: '逆接の接続詞' },
        { word: '留保', reading: 'りゅうほ', meaning: 'bảo lưu, điều kiện', example: '留保条件をつける' },
      ],
      dialogue: [
        { speaker: 'A', japanese: '研修には参加したものの、内容が難しくてよくわかりませんでした。', reading: 'けんしゅうにはさんかしたものの、ないようがむずかしくてよくわかりませんでした。', translation: 'Mặc dù đã tham gia đào tạo nhưng nội dung khó nên không hiểu lắm.' },
        { speaker: 'B', japanese: '新人とはいえ、基本的な知識は必要ですよ。', reading: 'しんじんとはいえ、きほんてきなちしきはひつようですよ。', translation: 'Dù là người mới nhưng kiến thức cơ bản là cần thiết đấy.' },
        { speaker: 'A', japanese: '勉強したものの、まだ不安が残っています。', reading: 'べんきょうしたものの、まだふあんがのこっています。', translation: 'Mặc dù đã học nhưng vẫn còn lo lắng.' },
      ],
      examples: [
        { japanese: '手術は成功したものの、回復に時間がかかっている。', reading: 'しゅじゅつはせいこうしたものの、かいふくにじかんがかかっている。', translation: 'Mặc dù phẫu thuật thành công nhưng việc phục hồi đang mất thời gian.' },
        { japanese: '冬とはいえ、南部では雪が降ることはほとんどない。', reading: 'ふゆとはいえ、なんぶではゆきがふることはほとんどない。', translation: 'Dù là mùa đông nhưng ở vùng phía nam hầu như không có tuyết.' },
        { japanese: '経験者とはいえ、新しい技術には慣れが必要だ。', reading: 'けいけんしゃとはいえ、あたらしいぎじゅつにはなれがひつようだ。', translation: 'Dù là người có kinh nghiệm, vẫn cần thời gian làm quen với kỹ thuật mới.' },
      ],
      grammarNote: `【〜ものの vs 〜とはいえ の違い】

〜ものの：前件を認めながら後件が逆の結果
例：「申し込んだものの、キャンセルした」
→ 申し込んだ（事実）→ でもキャンセル（予想外）

〜とはいえ：前件を条件として認めながら、後件で修正・留保
例：「プロとはいえ、失敗することもある」
→ プロだと認める + でも完璧ではない（修正）

【類似表現】
〜が：逆接（最も一般的）
〜けれど(も)：逆接（口語的）
〜にもかかわらず：強い逆接（書き言葉）
〜ものの：逆接（書き言葉・やや堅め）
〜とはいえ：部分認定の逆接`,
      quizzes: [
        {
          question: '「薬を飲んだ（　）、熱が下がらない。」の（　）は？',
          options: [
            { id: 'a', text: 'ものの' },
            { id: 'b', text: 'とはいえ' },
            { id: 'c', text: 'どころか' },
            { id: 'd', text: 'とともに' },
          ],
          correctId: 'a',
          explanation: '「薬を飲んだ（事実）→ 熱が下がらない（予想外の結果）」という逆接なので「ものの」が自然。 "ものの" = mặc dù đã làm X nhưng Y (kết quả bất ngờ).',
          difficulty: 'medium' as const,
        },
        {
          question: '「医師（　）、すべての病気を治せるわけではない。」の（　）は？',
          options: [
            { id: 'a', text: 'とはいえ' },
            { id: 'b', text: 'ものの' },
            { id: 'c', text: 'どころか' },
            { id: 'd', text: 'にほかならない' },
          ],
          correctId: 'a',
          explanation: '「医師だと認めるが、完璧ではない」という部分認定＋留保のニュアンスなので「とはいえ」が適切。 "とはいえ" = thừa nhận một phần nhưng đặt ra giới hạn.',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 30,
    },
  },

  'n2-01-16': {
    courseTitle: { ja: 'N2 上級文法マスター', vi: 'Ngữ pháp nâng cao N2' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N2文法⑯: 〜つつ(も)・〜ながらも',
      titleTranslation: 'Ngữ pháp N2⑯: Vừa...vừa / Tuy...nhưng',
      introduction: `「〜つつ」には2つの用法があります。①「〜しながら（同時動作）」、②「〜つつも（逆接）〜しながらも矛盾する行動をとる」。「〜ながらも」は「〜ではあるが、それでも」という逆接で、矛盾した状況を表します。

"〜つつ" có hai cách dùng: ①"vừa...vừa (động tác đồng thời)", ②"〜つつも (nghịch nghĩa) tuy...nhưng vẫn làm điều mâu thuẫn". "〜ながらも" là nghịch nghĩa "mặc dù là...nhưng vẫn...", biểu thị tình huống mâu thuẫn.`,
      keyPoints: [
        '〜つつ①：「〜しながら（同時動作）」書き言葉（vừa...vừa）',
        '〜つつも②：「〜しながらも（逆接）矛盾した行動」',
        '〜ながらも：「〜ではあるが（逆接）」（mặc dù...nhưng）',
        '接続：動詞ます形 + つつ(も) / 動詞ます形/名詞/形容詞 + ながらも',
        '例：「反省しつつも、また同じ失敗をした」',
      ],
      vocabulary: [
        { word: '〜つつ①', reading: 'つつ', meaning: 'vừa...vừa（同時動作・書き言葉）', example: '考えつつ仕事をする' },
        { word: '〜つつも', reading: 'つつも', meaning: 'tuy...nhưng（逆接）', example: 'わかっていつつも、やめられない' },
        { word: '〜ながらも', reading: 'ながらも', meaning: 'mặc dù...nhưng（逆接）', example: '初心者ながらも活躍している' },
        { word: '矛盾', reading: 'むじゅん', meaning: 'mâu thuẫn', example: '矛盾した行動' },
      ],
      dialogue: [
        { speaker: 'A', japanese: '悪いとわかりつつも、残業が続いてしまいます。', reading: 'わるいとわかりつつも、ざんぎょうがつづいてしまいます。', translation: 'Tuy biết là không tốt nhưng vẫn cứ tiếp tục làm thêm giờ.' },
        { speaker: 'B', japanese: '疲れているながらも、患者さんのために頑張っているんですね。', reading: 'つかれているながらも、かんじゃさんのためにがんばっているんですね。', translation: 'Mặc dù mệt mỏi nhưng vẫn cố gắng vì bệnh nhân nhỉ.' },
        { speaker: 'A', japanese: 'はい、不安を感じつつも、毎日前向きに取り組んでいます。', reading: 'はい、ふあんをかんじつつも、まいにちまえむきにとりくんでいます。', translation: 'Vâng, tuy cảm thấy lo lắng nhưng mỗi ngày vẫn tích cực đối mặt.' },
      ],
      examples: [
        { japanese: '危険と知りつつも、その治療法を選択した。', reading: 'きけんとしりつつも、そのちりょうほうをせんたくした。', translation: 'Tuy biết là nguy hiểm nhưng vẫn chọn phương pháp điều trị đó.' },
        { japanese: '初めてながらも、堂々と発表できた。', reading: 'はじめてながらも、どうどうとはっぴょうできた。', translation: 'Mặc dù là lần đầu tiên nhưng vẫn trình bày một cách tự tin.' },
        { japanese: '音楽を聴きつつ、報告書を作成した。', reading: 'おんがくをきつつ、ほうこくしょをさくせいした。', translation: 'Vừa nghe nhạc vừa lập báo cáo.' },
      ],
      grammarNote: `【〜つつ の2用法の区別】

①同時動作（〜しながら）→書き言葉
例：「資料を見つつ、説明する」= Vừa xem tài liệu vừa giải thích
→「〜ながら」と交換可能（but「つつ」のほうが書き言葉的）

②逆接（〜つつも）→矛盾した行動・心理
例：「知りつつも、黙っていた」= Dù biết nhưng vẫn im lặng
→「〜ながらも」と交換可能

【〜ながらも vs 〜ものの vs 〜にもかかわらず】
〜ながらも：日常〜書き言葉、矛盾した行動・状態
〜ものの：やや書き言葉、事実の逆接
〜にもかかわらず：最も書き言葉・強い逆接`,
      quizzes: [
        {
          question: '「問題があると知り（　）、黙って見ていた。」の（　）は？',
          options: [
            { id: 'a', text: 'つつも' },
            { id: 'b', text: 'とともに' },
            { id: 'c', text: 'に基づいて' },
            { id: 'd', text: 'において' },
          ],
          correctId: 'a',
          explanation: '「知っているのに（矛盾した行動で）黙っていた」という逆接の意味なので「つつも」が正解。 Mâu thuẫn giữa "biết" và "im lặng" → dùng "つつも".',
          difficulty: 'medium' as const,
        },
        {
          question: '「新人（　）、彼は素晴らしい活躍を見せた。」の（　）は？',
          options: [
            { id: 'a', text: 'ながらも' },
            { id: 'b', text: 'につれて' },
            { id: 'c', text: 'をめぐって' },
            { id: 'd', text: 'にわたって' },
          ],
          correctId: 'a',
          explanation: '「新人（という条件）にもかかわらず、活躍した」という逆接なので「ながらも」が正解。 "新人（điều kiện）mặc dù vậy vẫn hoạt động xuất sắc" → "ながらも".',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 30,
    },
  },

  'n2-01-17': {
    courseTitle: { ja: 'N2 上級文法マスター', vi: 'Ngữ pháp nâng cao N2' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N2文法⑰: 〜かねない・〜かねる',
      titleTranslation: 'Ngữ pháp N2⑰: Có thể... / Không thể không...',
      introduction: `「〜かねない」は「悪いことが起きる可能性がある」という意味で、マイナスの可能性を警告する表現です。「〜かねる」は「〜することができない（困難・気が引ける）」という意味で、丁寧に断る・拒否する時に使います。

"〜かねない" có nghĩa là "có khả năng điều xấu xảy ra" - biểu thị cảnh báo về khả năng tiêu cực. "〜かねる" có nghĩa là "không thể làm... (khó thực hiện / không nỡ)" - dùng để từ chối lịch sự.`,
      keyPoints: [
        '〜かねない：「悪い結果になる可能性がある」（có thể [xấu]）',
        '接続：動詞ます形 + かねない',
        '〜かねる：「〜できない・〜する気になれない（丁寧な断り）」',
        '接続：動詞ます形 + かねる（ます形接続に注意）',
        '例：「命に関わりかねない」「ご要望にはお応えしかねます」',
      ],
      vocabulary: [
        { word: '〜かねない', reading: 'かねない', meaning: 'có thể (điều xấu) xảy ra', example: '事故になりかねない' },
        { word: '〜かねる', reading: 'かねる', meaning: 'không thể...（丁寧な断り）', example: 'ご要望にはお応えしかねます' },
        { word: '命に関わる', reading: 'いのちにかかわる', meaning: 'liên quan đến tính mạng', example: '命に関わる問題' },
        { word: 'お応えする', reading: 'おこたえする', meaning: 'đáp ứng（謙譲語）', example: 'ご期待にはお応えしかねます' },
      ],
      dialogue: [
        { speaker: '医師', japanese: 'このまま放置すると、命に関わりかねません。', reading: 'このままほうちすると、いのちにかかわりかねません。', translation: 'Nếu cứ để vậy, có thể ảnh hưởng đến tính mạng.' },
        { speaker: '患者', japanese: 'えっ、そんなに深刻なんですか。', reading: 'えっ、そんなにしんこくなんですか。', translation: 'Ồ, nghiêm trọng đến vậy sao ạ.' },
        { speaker: '医師', japanese: '残念ですが、その方法での治療はお引き受けしかねます。', reading: 'ざんねんですが、そのほうほうでのちりょうはおひきうけしかねます。', translation: 'Rất tiếc nhưng chúng tôi không thể tiếp nhận điều trị theo phương pháp đó.' },
      ],
      examples: [
        { japanese: '誤った投薬は重篤な副作用を招きかねない。', reading: 'あやまったとうやくはじゅうとくなふくさようをまねきかねない。', translation: 'Dùng thuốc sai có thể gây ra tác dụng phụ nghiêm trọng.' },
        { japanese: '大変申し訳ございませんが、ご要望にはお応えしかねます。', reading: 'たいへんもうしわけございませんが、ごようぼうにはおこたえしかねます。', translation: 'Tôi rất xin lỗi nhưng không thể đáp ứng yêu cầu của anh/chị.' },
        { japanese: 'その発言は誤解を生みかねないので、注意が必要だ。', reading: 'そのはつげんはごかいをうみかねないので、ちゅういがひつようだ。', translation: 'Vì phát biểu đó có thể gây hiểu lầm nên cần thận trọng.' },
      ],
      grammarNote: `【〜かねない vs 〜かねる の区別】

〜かねない：否定形 → 意味はプラスではなくマイナスの可能性
例：「事故になりかねない」= Có thể xảy ra tai nạn（警告）

〜かねる：動詞ます形 + かねる → 「できない/する気になれない」
例：「お答えしかねます」= Không thể trả lời được（丁寧な断り）

【〜かねる は丁寧な断り表現】
「できません」より「〜しかねます」のほうが丁寧
ビジネス日本語・医療現場でよく使用

【注意：混同しやすいポイント】
「食べかねない」= 食べてしまう可能性がある（かねない）
「食べかねる」= 食べられない・食べる気になれない（かねる）`,
      quizzes: [
        {
          question: '「無理な残業を続けると、倒れ（　）。」の（　）は？',
          options: [
            { id: 'a', text: 'かねない' },
            { id: 'b', text: 'かねる' },
            { id: 'c', text: 'うる' },
            { id: 'd', text: 'ざるを得ない' },
          ],
          correctId: 'a',
          explanation: '「倒れるという悪い結果になる可能性がある」という警告なので「かねない」が正解。 "Cảnh báo khả năng kết quả xấu" → dùng "かねない".',
          difficulty: 'easy' as const,
        },
        {
          question: '丁寧に断る場面で使う表現として最も適切なのは？',
          options: [
            { id: 'a', text: 'ご要望にはお応えしかねます' },
            { id: 'b', text: 'ご要望にはお応えしかねない' },
            { id: 'c', text: 'ご要望にはお応えかねない' },
            { id: 'd', text: 'ご要望にはお応えかねます' },
          ],
          correctId: 'a',
          explanation: '丁寧な断りには「〜しかねます」（動詞ます形 + かねます）。「お応えし + かねます」が正しい形。 Để từ chối lịch sự dùng "〜しかねます" (ます形 + かねます).',
          difficulty: 'hard' as const,
        },
      ],
      xpReward: 30,
    },
  },

  'n2-01-18': {
    courseTitle: { ja: 'N2 上級文法マスター', vi: 'Ngữ pháp nâng cao N2' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N2文法⑱: 〜得る(うる/える)・〜得ない',
      titleTranslation: 'Ngữ pháp N2⑱: Có thể... / Không thể...',
      introduction: `「〜得る（うる・える）」は「〜することが可能だ」、「〜得ない（えない）」は「〜することが不可能だ」という意味です。「ありえる」「ありえない」が最も有名な例です。論理的・理論的な可能性を述べる場合に使い、書き言葉的な表現です。

"〜得る（うる/える）" có nghĩa là "có thể...(về mặt lý thuyết)" và "〜得ない（えない）" là "không thể...". "ありえる/ありえない" là ví dụ phổ biến nhất. Dùng khi nói về khả năng logic/lý thuyết, văn viết.`,
      keyPoints: [
        '接続：動詞ます形 + 得る（うる/える）/ 得ない（えない）',
        '〜得る：「〜する可能性がある（理論的に）」（có thể）',
        '〜得ない：「〜することは不可能だ」（không thể）',
        '「うる」は文語・「える」は口語：「ありうる/ありえる」',
        '例：「起こり得る事態」「あり得ない結果」',
      ],
      vocabulary: [
        { word: 'あり得る', reading: 'ありうる/ありえる', meaning: 'có thể xảy ra', example: 'そういうことはあり得る' },
        { word: 'あり得ない', reading: 'ありえない', meaning: 'không thể có / không thể xảy ra', example: 'そんなことはあり得ない' },
        { word: '起こり得る', reading: 'おこりうる', meaning: 'có thể xảy ra（起こる可能性）', example: '起こり得る最悪の事態' },
        { word: '考えられる', reading: 'かんがえられる', meaning: 'có thể nghĩ đến（類似表現）', example: '考えられる原因' },
      ],
      dialogue: [
        { speaker: '医師', japanese: '副作用として発熱が起こり得ます。', reading: 'ふくさようとしてはつねつがおこりえます。', translation: 'Sốt có thể xảy ra như một tác dụng phụ.' },
        { speaker: '患者', japanese: 'そんなことがあり得るんですか？', reading: 'そんなことがありえるんですか？', translation: 'Điều như vậy có thể xảy ra sao ạ?' },
        { speaker: '医師', japanese: '可能性は低いですが、あり得ない話ではありません。', reading: 'かのうせいはひくいですが、ありえないはなしではありません。', translation: 'Khả năng thấp nhưng không phải chuyện không thể xảy ra.' },
      ],
      examples: [
        { japanese: '医療ミスは、どの病院でも起こり得る問題だ。', reading: 'いりょうミスは、どのびょういんでもおこりえるもんだいだ。', translation: 'Sai sót y tế là vấn đề có thể xảy ra ở bất kỳ bệnh viện nào.' },
        { japanese: '患者の同意なしに手術することはあり得ない。', reading: 'かんじゃのどういなしにしゅじゅつすることはありえない。', translation: 'Việc phẫu thuật mà không có sự đồng ý của bệnh nhân là không thể.' },
        { japanese: '彼女が遅刻するとはあり得ないことだ。', reading: 'かのじょがちこくするとはありえないことだ。', translation: 'Việc cô ấy đi trễ là điều không thể xảy ra.' },
      ],
      grammarNote: `【〜得る の読み方】

「うる」（文語・書き言葉）：
例：「起こりうる」「考えうる」「あり得（う）る」

「える」（口語・日常的）：
例：「起こりえる」「考えられる」「あり得（え）る」

【〜得ない（えない）だけ】
否定形は「えない」のみ（「うない」とは言わない）
例：「起こりえない」○ / 「起こりうない」×

【〜かねない との違い】
〜得ない：論理的・理論的に不可能
〜かねない：実際にそうなる危険性・可能性（マイナス）`,
      quizzes: [
        {
          question: '「そのような事態は決して起こり（　）と思っていた。」',
          options: [
            { id: 'a', text: 'えない' },
            { id: 'b', text: 'うる' },
            { id: 'c', text: 'かねない' },
            { id: 'd', text: 'かねる' },
          ],
          correctId: 'a',
          explanation: '「そんなことは不可能だ」という意味なので「起こりえない」（〜得ない）が正解。 "Không thể xảy ra" → dùng "えない".',
          difficulty: 'easy' as const,
        },
        {
          question: '「あり得る」と同じ意味に最も近いのはどれですか？',
          options: [
            { id: 'a', text: '可能性がある' },
            { id: 'b', text: '必ずある' },
            { id: 'c', text: 'ありがたい' },
            { id: 'd', text: 'あるべきだ' },
          ],
          correctId: 'a',
          explanation: '「あり得る」= 「存在/発生する可能性がある」という意味。 "あり得る" = "có khả năng xảy ra".',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 30,
    },
  },

  'n2-01-19': {
    courseTitle: { ja: 'N2 上級文法マスター', vi: 'Ngữ pháp nâng cao N2' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N2文法⑲: 〜べき・〜べきだ・〜べきではない',
      titleTranslation: 'Ngữ pháp N2⑲: Nên... / Phải... / Không nên...',
      introduction: `「〜べきだ」は「当然〜しなければならない・〜するのが正しい」という義務・当然性を表します。「〜べきではない」はその否定形で「〜してはいけない」。「〜べき + 名詞」の連体修飾形もよく使われます。

"〜べきだ" có nghĩa là "nên làm.../đương nhiên phải làm..." - biểu thị nghĩa vụ, sự đương nhiên. "〜べきではない" là phủ định "không nên làm...". Dạng liên thể "〜べき + danh từ" cũng được dùng nhiều.`,
      keyPoints: [
        '接続：動詞辞書形 + べきだ（するべきだ/すべきだ）',
        '意味：「〜するのが当然だ・〜する義務がある」（nên, phải）',
        '否定：「〜べきではない」= 「〜してはならない」',
        '連体：「〜べき + 名詞」= 「すべき課題」「当然の義務」',
        '例：「患者に正直に説明すべきだ」',
      ],
      vocabulary: [
        { word: '〜べきだ', reading: 'べきだ', meaning: 'nên.../phải... (nghĩa vụ/đương nhiên)', example: '報告すべきだ' },
        { word: '〜べきではない', reading: 'べきではない', meaning: 'không nên...', example: '隠すべきではない' },
        { word: '義務', reading: 'ぎむ', meaning: 'nghĩa vụ', example: '説明する義務' },
        { word: '当然', reading: 'とうぜん', meaning: 'đương nhiên', example: '当然の責任' },
      ],
      dialogue: [
        { speaker: 'A', japanese: '患者さんには病状を正直に説明すべきだと思います。', reading: 'かんじゃさんにはびょうじょうをしょうじきにせつめいすべきだとおもいます。', translation: 'Tôi nghĩ nên giải thích thành thật về tình trạng bệnh cho bệnh nhân.' },
        { speaker: 'B', japanese: 'そうですね。医師として隠すべきではないですよね。', reading: 'そうですね。いしとしてかくすべきではないですよね。', translation: 'Đúng thế. Với tư cách là bác sĩ, không nên che giấu nhỉ.' },
        { speaker: 'A', japanese: 'インフォームドコンセントは守るべき原則ですから。', reading: 'インフォームドコンセントはまもるべきげんそくですから。', translation: 'Vì informed consent là nguyên tắc cần phải tuân thủ.' },
      ],
      examples: [
        { japanese: '医療従事者は患者の権利を尊重すべきだ。', reading: 'いりょうじゅうじしゃはかんじゃのけんりをそんちょうすべきだ。', translation: 'Nhân viên y tế nên tôn trọng quyền lợi của bệnh nhân.' },
        { japanese: '個人情報を無断で公開するべきではない。', reading: 'こじんじょうほうをむだんでこうかいするべきではない。', translation: 'Không nên công bố thông tin cá nhân mà không có phép.' },
        { japanese: '改善すべき点を率直に指摘してください。', reading: 'かいぜんすべきてんをそっちょくにしてきしてください。', translation: 'Hãy thẳng thắn chỉ ra những điểm cần cải thiện.' },
      ],
      grammarNote: `【〜べきだ vs 〜なければならない の違い】

〜べきだ：道徳的・論理的な当然性、強い推薦
例：「謝るべきだ」= Đương nhiên phải xin lỗi（道義的義務）

〜なければならない：規則・必要性による義務
例：「7時までに来なければならない」= Phải đến trước 7 giờ（規則）

【するべきだ vs すべきだ】
両方正しいが「すべきだ」のほうが書き言葉的・伝統的
「するべきだ」は口語でもOK

【〜べきでない vs 〜べきではない】
両方正しい。「べきではない」がやや丁寧`,
      quizzes: [
        {
          question: '「医師は患者の同意を得る（　）。」の（　）は？',
          options: [
            { id: 'a', text: 'べきだ' },
            { id: 'b', text: 'かねない' },
            { id: 'c', text: 'に過ぎない' },
            { id: 'd', text: 'にほかならない' },
          ],
          correctId: 'a',
          explanation: '「当然そうしなければならない・道義的義務がある」という意味なので「べきだ」が正解。 "Nghĩa vụ đạo đức/đương nhiên phải làm" → dùng "べきだ".',
          difficulty: 'easy' as const,
        },
        {
          question: '「〜べきではない」の意味として正しいのは？',
          options: [
            { id: 'a', text: 'してはいけない（強い否定）' },
            { id: 'b', text: 'しなくてもいい（許可）' },
            { id: 'c', text: 'したほうがいい（推薦）' },
            { id: 'd', text: 'したいと思わない（欲求否定）' },
          ],
          correctId: 'a',
          explanation: '「べきではない」=「してはいけない・すべきでない」という道徳的・論理的な否定・禁止。 "べきではない" = "không nên làm" (cấm về mặt đạo đức/logic).',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 30,
    },
  },

  'n2-01-20': {
    courseTitle: { ja: 'N2 上級文法マスター', vi: 'Ngữ pháp nâng cao N2' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N2文法⑳: 〜ざるを得ない',
      titleTranslation: 'Ngữ pháp N2⑳: Không thể không.../Buộc phải...',
      introduction: `「〜ざるを得ない」は「〜したくないけれど、状況的に〜するしかない」という意味で、不本意ながらもそうせざるを得ない状況を表します。「〜しなければならない」より強い不本意・強制のニュアンスがあります。

"〜ざるを得ない" có nghĩa là "không muốn làm nhưng hoàn cảnh buộc phải làm" - biểu thị tình huống bất đắc dĩ, không thể không làm. Mạnh hơn "〜しなければならない" về sắc thái bất đắc dĩ/bị ép buộc.`,
      keyPoints: [
        '接続：動詞ない形（ない→ざる） + を得ない（するざるを得ない→せざるを得ない）',
        '意味：「したくないが、そうするしかない」（buộc phải）',
        '「する」は特殊形：「せざるを得ない」（するざるを得ない×）',
        '強制・不本意のニュアンスが強い',
        '例：「残業せざるを得ない」「認めざるを得ない」',
      ],
      vocabulary: [
        { word: '〜ざるを得ない', reading: 'ざるをえない', meaning: 'buộc phải... / không thể không...', example: '認めざるを得ない' },
        { word: '不本意', reading: 'ふほんい', meaning: 'bất đắc dĩ, không như ý muốn', example: '不本意ながら承諾した' },
        { word: 'やむを得ない', reading: 'やむをえない', meaning: 'bất đắc dĩ, không còn cách nào', example: 'やむを得ない事情' },
        { word: '仕方がない', reading: 'しかたがない', meaning: 'không có cách nào khác', example: '仕方がないから行く' },
      ],
      dialogue: [
        { speaker: 'A', japanese: '予算不足で、このプロジェクトは中止せざるを得ません。', reading: 'よさんぶそくで、このプロジェクトはちゅうしせざるをえません。', translation: 'Do thiếu ngân sách, buộc phải dừng dự án này.' },
        { speaker: 'B', japanese: '残念ですが、その判断を認めざるを得ないですね。', reading: 'ざんねんですが、そのはんだんをみとめざるをえないですね。', translation: 'Tiếc thật nhưng không thể không công nhận quyết định đó nhỉ.' },
        { speaker: 'A', japanese: '状況を考えると、残業せざるを得ない日も出てくるかもしれません。', reading: 'じょうきょうをかんがえると、ざんぎょうせざるをえないひもでてくるかもしれません。', translation: 'Xét tình hình, có thể có những ngày buộc phải làm thêm giờ.' },
      ],
      examples: [
        { japanese: 'エビデンスを見る限り、この事実を認めざるを得ない。', reading: 'エビデンスをみるかぎり、このじじつをみとめざるをえない。', translation: 'Nhìn vào bằng chứng, không thể không công nhận sự thật này.' },
        { japanese: '人手不足で、休日出勤せざるを得ない状況だ。', reading: 'ひとでぶそくで、きゅうじつしゅっきんせざるをえないじょうきょうだ。', translation: 'Do thiếu nhân lực, đây là tình huống buộc phải đi làm vào ngày nghỉ.' },
        { japanese: 'インフレにより、医療費を値上げせざるを得なかった。', reading: 'インフレにより、いりょうひをねあげせざるをえなかった。', translation: 'Do lạm phát, buộc phải tăng phí y tế.' },
      ],
      grammarNote: `【ざるを得ない の接続に注意】

一般の動詞：ない形 → ない → ざる
例：「行かない → 行かざる → 行かざるを得ない」
例：「認めない → 認めざる → 認めざるを得ない」

「する」は特殊：
「しない → せざる → せざるを得ない」（「するざる」ではない！）

【〜ざるを得ない vs 〜なければならない】
〜ざるを得ない：不本意・強制感が強い
例：「残業せざるを得ない」= Buộc phải làm thêm（したくない）

〜なければならない：義務・必要性
例：「報告しなければならない」= Phải báo cáo（普通の義務）`,
      quizzes: [
        {
          question: '「〜ざるを得ない」の「する」の正しい形は？',
          options: [
            { id: 'a', text: 'せざるを得ない' },
            { id: 'b', text: 'するざるを得ない' },
            { id: 'c', text: 'しざるを得ない' },
            { id: 'd', text: 'さざるを得ない' },
          ],
          correctId: 'a',
          explanation: '「する」は特殊変形：「しない」の否定ではなく「せ」に変化。「せざるを得ない」が正しい形。 "する" biến đổi đặc biệt: "せざるを得ない" là dạng đúng.',
          difficulty: 'hard' as const,
        },
        {
          question: '「人手不足で、みんな残業（　）。」の（　）に入る表現は？',
          options: [
            { id: 'a', text: 'せざるを得ない' },
            { id: 'b', text: 'するべきだ' },
            { id: 'c', text: 'してもいい' },
            { id: 'd', text: 'するに過ぎない' },
          ],
          correctId: 'a',
          explanation: '「したくないが状況が許さない・仕方がない」というニュアンスなので「せざるを得ない」が適切。 "Không muốn nhưng hoàn cảnh buộc phải làm" → "せざるを得ない".',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 30,
    },
  },

  'n2-01-21': {
    courseTitle: { ja: 'N2 上級文法マスター', vi: 'Ngữ pháp nâng cao N2' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N2文法㉑: 〜ずにはいられない・〜ないではいられない',
      titleTranslation: 'Ngữ pháp N2㉑: Không thể không... / Không nhịn được...',
      introduction: `「〜ずにはいられない」は「〜せずにいることができない・どうしても〜してしまう」という意味で、自然な衝動・感情を抑えられない状態を表します。「〜ないではいられない」もほぼ同じ意味で、こちらのほうが口語的です。

"〜ずにはいられない" có nghĩa là "không thể không làm.../không nhịn được việc..." - biểu thị trạng thái không thể kìm chế xung động hoặc cảm xúc tự nhiên. "〜ないではいられない" gần giống và thông thường hơn.`,
      keyPoints: [
        '〜ずにはいられない：動詞ない形（ない→ず） + にはいられない',
        '〜ないではいられない：動詞ない形 + ではいられない（より口語的）',
        '意味：「どうしても〜してしまう・〜せずにいられない」',
        '感情・衝動・習慣的行動を表す',
        '例：「笑わずにはいられない」「泣かずにはいられなかった」',
      ],
      vocabulary: [
        { word: '〜ずにはいられない', reading: 'ずにはいられない', meaning: 'không thể không...（衝動）', example: '笑わずにはいられない' },
        { word: '〜ないではいられない', reading: 'ないではいられない', meaning: 'không nhịn được...（口語）', example: '泣かないではいられない' },
        { word: '衝動', reading: 'しょうどう', meaning: 'xung động, thôi thúc', example: '衝動的に行動する' },
        { word: '抑える', reading: 'おさえる', meaning: 'kìm chế, nén lại', example: '感情を抑える' },
      ],
      dialogue: [
        { speaker: 'A', japanese: 'あの患者さんのお話を聞いて、感動せずにはいられませんでした。', reading: 'あのかんじゃさんのおはなしをきいて、かんどうせずにはいられませんでした。', translation: 'Nghe câu chuyện của bệnh nhân đó, tôi không thể không xúc động.' },
        { speaker: 'B', japanese: 'そうですよね。あの体験談には、涙を流さないではいられません。', reading: 'そうですよね。あのたいけんだんには、なみだをながさないではいられません。', translation: 'Đúng thế nhỉ. Câu chuyện trải nghiệm đó không thể không rơi nước mắt.' },
        { speaker: 'A', japanese: '医療の現場では、患者さんの状況に共感せずにはいられないですね。', reading: 'いりょうのげんばでは、かんじゃさんのじょうきょうにきょうかんせずにはいられないですね。', translation: 'Tại hiện trường y tế, không thể không đồng cảm với tình trạng của bệnh nhân nhỉ.' },
      ],
      examples: [
        { japanese: 'その映像を見て、誰もが心を動かされずにはいられなかった。', reading: 'そのえいぞうをみて、だれもがこころをうごかされずにはいられなかった。', translation: 'Xem đoạn video đó, ai cũng không thể không xúc động.' },
        { japanese: '彼の献身的な仕事ぶりに、感謝せずにはいられない。', reading: 'かれのけんしんてきなしごとぶりに、かんしゃせずにはいられない。', translation: 'Trước tinh thần làm việc tận tụy của anh ấy, không thể không biết ơn.' },
        { japanese: '不正を見て、声を上げずにはいられなかった。', reading: 'ふせいをみて、こえをあげずにはいられなかった。', translation: 'Chứng kiến sự bất công, không thể không lên tiếng.' },
      ],
      grammarNote: `【〜ずにはいられない の接続】

一般動詞：ない形 → ない → ず
例：「笑わない → 笑わず → 笑わずにはいられない」

「する」は特殊：
「しない → せず → せずにはいられない」

【〜ずにはいられない vs 〜ないではいられない】
意味はほぼ同じだが：
「ずにはいられない」→ やや書き言葉的
「ないではいられない」→ 口語的・現代語

【〜ざるを得ない との違い】
ざるを得ない：外部の状況・強制から「しかたなく〜する」
ずにはいられない：内部の衝動・感情から「〜せずにいられない」`,
      quizzes: [
        {
          question: '「あの曲を聴くと、体が動か（　）。」の（　）は？',
          options: [
            { id: 'a', text: 'ずにはいられない' },
            { id: 'b', text: 'ざるを得ない' },
            { id: 'c', text: 'べきだ' },
            { id: 'd', text: 'かねない' },
          ],
          correctId: 'a',
          explanation: '「体が自然に動いてしまう」という衝動・自然な反応なので「ずにはいられない」が正解。 Phản ứng tự nhiên/xung động không kìm chế được → "ずにはいられない".',
          difficulty: 'medium' as const,
        },
        {
          question: '「ずにはいられない」に近い意味の表現はどれですか？',
          options: [
            { id: 'a', text: 'どうしても〜してしまう' },
            { id: 'b', text: '〜するべきだ' },
            { id: 'c', text: '〜するに過ぎない' },
            { id: 'd', text: '〜することがある' },
          ],
          correctId: 'a',
          explanation: '「ずにはいられない」は「どうしても〜せずにいられない・自然にそうしてしまう」という意味。 "不由自主地.../ không kìm được...".',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 30,
    },
  },

  'n2-01-22': {
    courseTitle: { ja: 'N2 上級文法マスター', vi: 'Ngữ pháp nâng cao N2' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N2文法㉒: 〜ことなく・〜ないまま',
      titleTranslation: 'Ngữ pháp N2㉒: Mà không... / Vẫn giữ nguyên...',
      introduction: `「〜ことなく」は「〜しないで（ずっと）」という意味で、ある動作を行わずに別の動作・状態が続くことを表します。「〜ないまま」は「〜していない状態のまま」で、状態が変わらず続くことを表します。どちらも書き言葉的な表現です。

"〜ことなく" có nghĩa là "mà không làm... (mãi mãi)" - biểu thị việc không thực hiện một động tác nào đó trong khi tiếp tục làm việc khác. "〜ないまま" là "vẫn giữ nguyên trạng thái chưa làm..." - trạng thái không thay đổi.`,
      keyPoints: [
        '〜ことなく：動詞辞書形 + ことなく（〜しないで / without doing）',
        '意味：「〜しないでずっと〜する」（mà không làm...）',
        '〜ないまま：動詞ない形/形容詞 + まま',
        '意味：「〜していない状態が続く」（vẫn giữ nguyên...）',
        '例：「休むことなく働く」「原因がわからないまま退院した」',
      ],
      vocabulary: [
        { word: '〜ことなく', reading: 'ことなく', meaning: 'mà không... / không ngừng...', example: '休むことなく3時間働いた' },
        { word: '〜ないまま', reading: 'ないまま', meaning: 'vẫn giữ nguyên（chưa làm）', example: '食事をとらないまま出かけた' },
        { word: '変わらず', reading: 'かわらず', meaning: 'không thay đổi', example: '変わらず元気だ' },
        { word: '途中', reading: 'とちゅう', meaning: 'giữa chừng', example: '途中でやめた' },
      ],
      dialogue: [
        { speaker: 'A', japanese: '先生は休むことなく患者さんを診続けました。', reading: 'せんせいはやすむことなくかんじゃさんをみつづけました。', translation: 'Thầy thuốc đã tiếp tục khám bệnh nhân mà không nghỉ ngơi.' },
        { speaker: 'B', japanese: '診断がつかないまま、数週間が過ぎてしまいました。', reading: 'しんだんがつかないまま、すうしゅうかんがすぎてしまいました。', translation: 'Vẫn chưa chẩn đoán được mà vài tuần đã trôi qua.' },
        { speaker: 'A', japanese: '原因がわからないまま退院させるわけにはいきません。', reading: 'げんいんがわからないままたいいんさせるわけにはいきません。', translation: 'Không thể để bệnh nhân xuất viện khi vẫn chưa biết nguyên nhân.' },
      ],
      examples: [
        { japanese: '誰にも気づかれることなく、病状が悪化していた。', reading: 'だれにもきづかれることなく、びょうじょうがあっかしていた。', translation: 'Tình trạng bệnh đang xấu đi mà không ai nhận ra.' },
        { japanese: '治療を受けないまま長年過ごしてきた患者さんだ。', reading: 'ちりょうをうけないままながねんすごしてきたかんじゃさんだ。', translation: 'Đây là bệnh nhân đã trải qua nhiều năm mà không được điều trị.' },
        { japanese: '一度も休むことなく、フルマラソンを完走した。', reading: 'いちどもやすむことなく、フルマラソンをかんそうした。', translation: 'Hoàn thành marathon mà không nghỉ lấy một lần.' },
      ],
      grammarNote: `【〜ことなく vs 〜ないで の違い】

〜ことなく：書き言葉的・フォーマル・「ずっと〜しないで続ける」
例：「諦めることなく挑戦し続けた」= Tiếp tục thử thách mà không bỏ cuộc

〜ないで：普通・日常的・単純に「〜しないで」
例：「朝食を食べないで来た」= Đến mà không ăn sáng

【〜ないまま のパターン】
名詞修飾：「〜していない状態のまま = 状態が変わらない」
例：「解決しないまま話が終わった」= Vấn đề kết thúc mà chưa được giải quyết
例：「熱が下がらないまま退院した」= Xuất viện khi sốt vẫn chưa hạ`,
      quizzes: [
        {
          question: '「患者さんは原因が（　）、ずっと入院していた。」の（　）は？',
          options: [
            { id: 'a', text: 'わからないまま' },
            { id: 'b', text: 'わかることなく' },
            { id: 'c', text: 'わからずに' },
            { id: 'd', text: 'わかるものの' },
          ],
          correctId: 'a',
          explanation: '「わからない状態が続いている」という状態の継続なので「わからないまま」が最適。 "Trạng thái không biết vẫn tiếp tục" → "ないまま".',
          difficulty: 'medium' as const,
        },
        {
          question: '「先生は（　）ことなく、患者に向き合い続けた。」の（　）は？',
          options: [
            { id: 'a', text: '諦める' },
            { id: 'b', text: '諦めない' },
            { id: 'c', text: '諦めた' },
            { id: 'd', text: '諦め' },
          ],
          correctId: 'a',
          explanation: '「〜ことなく」の前は動詞辞書形が必要。「諦めることなく」が正しい接続形。 Trước "ことなく" là động từ thể từ điển.',
          difficulty: 'hard' as const,
        },
      ],
      xpReward: 30,
    },
  },

  'n2-01-23': {
    courseTitle: { ja: 'N2 上級文法マスター', vi: 'Ngữ pháp nâng cao N2' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N2文法㉓: 〜に際して・〜に際し',
      titleTranslation: 'Ngữ pháp N2㉓: Nhân dịp... / Vào lúc...',
      introduction: `「〜に際して」は「〜という場面・機会に（特別な準備や注意が必要な時）」という意味で、重要なイベント・手続き・場面の前後に何かをする時に使います。「〜に当たって」とほぼ同義で、どちらも書き言葉的な格式ある表現です。

"〜に際して" có nghĩa là "nhân dịp.../vào lúc (cần chuẩn bị hoặc chú ý đặc biệt)" - dùng trước/sau sự kiện quan trọng, thủ tục, tình huống đặc biệt. Gần nghĩa với "〜に当たって", đều là biểu hiện trang trọng.`,
      keyPoints: [
        '接続：名詞 / 動詞辞書形 + に際して（に際し）',
        '意味：「〜という重要な場面・機会に」（nhân dịp, vào lúc quan trọng）',
        '「〜に当たって」とほぼ同義でより書き言葉的',
        '手続き・式典・重要イベントの文脈でよく使用',
        '例：「入院に際して、説明をいたします」',
      ],
      vocabulary: [
        { word: '〜に際して', reading: 'にさいして', meaning: 'nhân dịp.../vào lúc quan trọng', example: '手術に際して注意事項を説明する' },
        { word: '〜に際し', reading: 'にさいし', meaning: '〜に際して（書き言葉）', example: '入学に際し、手続きが必要です' },
        { word: '〜に当たって', reading: 'にあたって', meaning: 'nhân dịp.../vào lúc（類語）', example: '卒業に当たって一言述べます' },
        { word: '手続き', reading: 'てつづき', meaning: 'thủ tục', example: '入院手続き' },
      ],
      dialogue: [
        { speaker: '担当者', japanese: '入院に際して、いくつか確認させていただきます。', reading: 'にゅういんにさいして、いくつかかくにんさせていただきます。', translation: 'Nhân dịp nhập viện, tôi xin xác nhận một số điều.' },
        { speaker: '患者', japanese: 'はい、何でも確認してください。', reading: 'はい、なんでもかくにんしてください。', translation: 'Vâng, xin cứ xác nhận bất kỳ điều gì.' },
        { speaker: '担当者', japanese: '手術に際し、同意書へのご署名をお願いしています。', reading: 'しゅじゅつにさいし、どういしょへのごしょめいをおねがいしています。', translation: 'Nhân dịp phẫu thuật, chúng tôi xin ký vào bản đồng ý.' },
      ],
      examples: [
        { japanese: '試験に際して、不正行為は絶対に禁止されています。', reading: 'しけんにさいして、ふせいこういはぜったいにきんしされています。', translation: 'Nhân dịp thi, gian lận tuyệt đối bị cấm.' },
        { japanese: '採用に際し、健康診断書の提出が必要です。', reading: 'さいようにさいし、けんこうしんだんしょのていしゅつがひつようです。', translation: 'Nhân dịp tuyển dụng, cần nộp giấy khám sức khỏe.' },
        { japanese: '退職に際して、これまでの感謝を述べたいと思います。', reading: 'たいしょくにさいして、これまでのかんしゃをのべたいとおもいます。', translation: 'Nhân dịp nghỉ việc, tôi muốn bày tỏ lòng biết ơn đến nay.' },
      ],
      grammarNote: `【〜に際して vs 〜に当たって の違い】

どちらもほぼ同義（書き言葉・格式）だが：
「に際して」：ある場面・機会に「その場で」の行動を述べる
例：「面接に際して、注意すること」

「に当たって」：ある機会に「これからの」行動・心構えを述べる
例：「新年に当たって、目標を立てる」

【に際して vs に際し】
「に際して」：文中でも文末でも使える
「に際し」：書き言葉のみ、やや格式が高い

【頻出場面】
入院・手術・採用・卒業・入学・退職・試験・開会 + に際して`,
      quizzes: [
        {
          question: '「退院（　）、今後の生活について説明します。」の（　）は？',
          options: [
            { id: 'a', text: 'に際して' },
            { id: 'b', text: 'にわたって' },
            { id: 'c', text: 'をめぐって' },
            { id: 'd', text: 'において' },
          ],
          correctId: 'a',
          explanation: '「退院という重要な場面において」の意味で「に際して」が最適。重要なイベントの場面を指す表現。 Nhân dịp sự kiện quan trọng (xuất viện) → "に際して".',
          difficulty: 'easy' as const,
        },
        {
          question: '「に際して」とほぼ同じ意味の表現はどれですか？',
          options: [
            { id: 'a', text: 'に当たって' },
            { id: 'b', text: 'にわたって' },
            { id: 'c', text: 'をめぐって' },
            { id: 'd', text: 'に基づいて' },
          ],
          correctId: 'a',
          explanation: '「に際して」と「に当たって」は「〜という重要な場面・機会に」という意味でほぼ同義。 "に際して" và "に当たって" gần như đồng nghĩa.',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 30,
    },
  },

  'n2-01-24': {
    courseTitle: { ja: 'N2 上級文法マスター', vi: 'Ngữ pháp nâng cao N2' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N2文法㉔: 〜を機に・〜をきっかけに',
      titleTranslation: 'Ngữ pháp N2㉔: Nhân cơ hội... / Bắt đầu từ...',
      introduction: `「〜を機に」は「〜という好機・転機を利用して（次のステップへ）」という意味で、ポジティブなきっかけを表します。「〜をきっかけに」は「〜が原因・きっかけになって（変化が起きた）」で、中立的で良いことも悪いことも使えます。

"〜を機に" có nghĩa là "nhân cơ hội tốt/bước ngoặt này..." - biểu thị cơ hội tích cực. "〜をきっかけに" là "bắt đầu từ/lấy cái đó làm nguyên nhân" - trung tính, dùng cho cả sự kiện tốt và xấu.`,
      keyPoints: [
        '〜を機に（好機・転機）：「良いきっかけ・チャンス」（nhân cơ hội tốt）',
        '〜をきっかけに（中立）：「原因・始まり」（lấy... làm cơ hội/nguyên nhân）',
        '接続：名詞 + を機に / をきっかけに / をきっかけとして',
        '後ろには「変化・新しいスタート」の内容が来る',
        '例：「転職を機に禁煙した」「事故をきっかけに健康に気をつけた」',
      ],
      vocabulary: [
        { word: '〜を機に', reading: 'をきに', meaning: 'nhân cơ hội... / bước ngoặt（ポジティブ）', example: '退院を機に生活を改めた' },
        { word: '〜をきっかけに', reading: 'をきっかけに', meaning: 'lấy... làm cơ hội（中立）', example: '入院をきっかけに禁煙した' },
        { word: '転機', reading: 'てんき', meaning: 'bước ngoặt', example: '人生の転機' },
        { word: '改める', reading: 'あらためる', meaning: 'cải thiện, đổi mới', example: '生活習慣を改める' },
      ],
      dialogue: [
        { speaker: 'A', japanese: '退院を機に、生活習慣を見直そうと思います。', reading: 'たいいんをきに、せいかつしゅうかんをみなおそうとおもいます。', translation: 'Nhân cơ hội xuất viện, tôi muốn xem xét lại thói quen sinh hoạt.' },
        { speaker: '医師', japanese: 'それは素晴らしい考えです。入院をきっかけに、生活改善を始める方も多いです。', reading: 'それはすばらしいかんがえです。にゅういんをきっかけに、せいかつかいぜんをはじめるかたもおおいです。', translation: 'Đó là suy nghĩ tuyệt vời. Cũng có nhiều người bắt đầu cải thiện lối sống lấy việc nhập viện làm cơ hội.' },
        { speaker: 'A', japanese: 'この病気をきっかけに、体のことを真剣に考えるようになりました。', reading: 'このびょうきをきっかけに、からだのことをしんけんにかんがえるようになりました。', translation: 'Từ căn bệnh này, tôi đã bắt đầu suy nghĩ nghiêm túc về sức khỏe.' },
      ],
      examples: [
        { japanese: '海外赴任を機に、英語の勉強を本格的に始めた。', reading: 'かいがいふにんをきに、えいごのべんきょうをほんかくてきにはじめた。', translation: 'Nhân cơ hội được phái ra nước ngoài, tôi bắt đầu học tiếng Anh nghiêm túc.' },
        { japanese: '交通事故をきっかけに、車の安全運転を心がけるようになった。', reading: 'こうつうじこをきっかけに、くるまのあんぜんうんてんをこころがけるようになった。', translation: 'Từ vụ tai nạn giao thông, tôi đã bắt đầu chú ý lái xe an toàn.' },
        { japanese: 'この出来事をきっかけとして、病院の方針が大きく変わった。', reading: 'このできごとをきっかけとして、びょういんのほうしんがおおきくかわった。', translation: 'Lấy sự kiện này làm cơ hội, phương châm của bệnh viện đã thay đổi lớn.' },
      ],
      grammarNote: `【〜を機に vs 〜をきっかけに の違い】

〜を機に：良いチャンス・転機（ポジティブ）
例：「転職を機に新しい生活を始めた」= Nhân cơ hội chuyển việc bắt đầu cuộc sống mới

〜をきっかけに：原因・始まり（中立・良いも悪いも）
例：「病気をきっかけに禁煙した」= Lấy bệnh tật làm cơ hội bỏ thuốc

【〜をきっかけとして】
「をきっかけとして」＝「をきっかけに」（より書き言葉的）
例：「この事件をきっかけとして、法律が変わった」

【注意】
「〜を機に」の後は良い変化・前向きな内容が来ることが多い`,
      quizzes: [
        {
          question: '「就職（　）、一人暮らしを始めた。」の（　）に適切な表現は？',
          options: [
            { id: 'a', text: 'を機に' },
            { id: 'b', text: 'にわたって' },
            { id: 'c', text: 'において' },
            { id: 'd', text: 'をめぐって' },
          ],
          correctId: 'a',
          explanation: '「就職という良い転機を利用して新生活を始めた」というポジティブな文脈なので「を機に」が適切。 Cơ hội tích cực (xin việc) → "を機に".',
          difficulty: 'easy' as const,
        },
        {
          question: '「病気（　）、健康について真剣に考えるようになった。」',
          options: [
            { id: 'a', text: 'をきっかけに' },
            { id: 'b', text: 'を機に' },
            { id: 'c', text: 'に際して' },
            { id: 'd', text: 'に基づいて' },
          ],
          correctId: 'a',
          explanation: '「病気（悪いこと）がきっかけで変化した」という中立的な原因なので「をきっかけに」が適切。「を機に」は良いことに使う。 Nguyên nhân trung tính (bệnh tật) → "をきっかけに".',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 30,
    },
  },

  'n2-01-25': {
    courseTitle: { ja: 'N2 上級文法マスター', vi: 'Ngữ pháp nâng cao N2' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N2文法㉕: 〜次第（しだい）・〜次第で',
      titleTranslation: 'Ngữ pháp N2㉕: Ngay khi... / Tùy theo...',
      introduction: `「〜次第」には2つの意味があります。①「動詞ます形 + 次第」=「〜したらすぐ」（完了後すぐに次のアクション）、②「名詞 + 次第で」=「〜による・〜によって違う」（〜に依存する）。N2頻出で、両方の用法を覚えましょう。

"〜次第" có hai nghĩa: ①"動詞ます形 + 次第" = "ngay khi..." (hành động ngay sau khi hoàn thành), ②"名詞 + 次第で" = "tùy theo.../phụ thuộc vào..." (phụ thuộc vào điều kiện).`,
      keyPoints: [
        '①〜次第（完了後すぐ）：動詞ます形 + 次第（ngay khi...xong）',
        '②〜次第で（〜による）：名詞 + 次第で（tùy theo...）',
        '「〜次第です」：状況を説明する・事情を述べる',
        '「〜いかん（に）よる/にかかわらず」と合わせて覚える',
        '例：「確認でき次第、ご連絡します」「努力次第で変わる」',
      ],
      vocabulary: [
        { word: '〜次第①', reading: 'しだい', meaning: 'ngay khi...（完了後すぐ）', example: '到着次第連絡する' },
        { word: '〜次第で②', reading: 'しだいで', meaning: 'tùy theo...（依存）', example: '準備次第で結果が変わる' },
        { word: '〜いかんによる', reading: 'いかんによる', meaning: 'tùy theo thế nào（書き言葉）', example: '結果のいかんによる' },
        { word: '成否', reading: 'せいひ', meaning: 'thành bại, thành hay bại', example: '成否は努力次第だ' },
      ],
      dialogue: [
        { speaker: '医師', japanese: '検査結果が出次第、ご説明いたします。', reading: 'けんさけっかがでしだい、ごせつめいいたします。', translation: 'Ngay khi có kết quả xét nghiệm, tôi sẽ giải thích.' },
        { speaker: '患者', japanese: 'いつ頃わかりますか？', reading: 'いつごろわかりますか？', translation: 'Khoảng bao giờ thì biết ạ?' },
        { speaker: '医師', japanese: '検体の状態次第ですが、明日の午後には出るはずです。', reading: 'けんたいのじょうたいしだいですが、あしたのごごにはでるはずです。', translation: 'Tùy theo tình trạng mẫu xét nghiệm nhưng dự kiến chiều mai sẽ có.' },
      ],
      examples: [
        { japanese: '準備が整い次第、手術を開始します。', reading: 'じゅんびがととのいしだい、しゅじゅつをかいしします。', translation: 'Ngay khi chuẩn bị xong, sẽ bắt đầu phẫu thuật.' },
        { japanese: '回復の速さは、患者の体力と意欲次第です。', reading: 'かいふくのはやさは、かんじゃのたいりょくといよくしだいです。', translation: 'Tốc độ phục hồi phụ thuộc vào thể lực và ý chí của bệnh nhân.' },
        { japanese: '治療方針は状況次第で変わることがあります。', reading: 'ちりょうほうしんはじょうきょうしだいでかわることがあります。', translation: 'Phương châm điều trị có thể thay đổi tùy theo tình hình.' },
      ],
      grammarNote: `【〜次第 の2用法の区別】

①動詞ます形 + 次第：「〜したらすぐ次の行動をとる」
例：「終わり次第電話します」= Điện thoại ngay khi xong
→ ビジネスメール・敬語によく使用

②名詞 + 次第で：「〜によって（結果・状況が）変わる」
例：「努力次第で結果が変わる」= Kết quả thay đổi tùy theo nỗ lực
→ 「によって」と言い換えられることが多い

【〜次第です（事情説明）】
「〜というわけです・〜という状況です」
例：「こういう次第で遅刻しました」= Vì lý do đó mà đến trễ`,
      quizzes: [
        {
          question: '「空き（　）、ご連絡いたします。」の（　）は？',
          options: [
            { id: 'a', text: '次第' },
            { id: 'b', text: 'にわたって' },
            { id: 'c', text: 'をめぐって' },
            { id: 'd', text: 'に際して' },
          ],
          correctId: 'a',
          explanation: '「空きが出たらすぐに連絡する」という意味なので「次第」（完了後すぐ）が正解。 "Ngay khi có chỗ trống sẽ liên lạc" → "次第".',
          difficulty: 'easy' as const,
        },
        {
          question: '「成功するかどうかは、あなたの努力（　）です。」の（　）は？',
          options: [
            { id: 'a', text: '次第' },
            { id: 'b', text: 'において' },
            { id: 'c', text: 'とともに' },
            { id: 'd', text: 'に過ぎない' },
          ],
          correctId: 'a',
          explanation: '「あなたの努力による・依存する」という意味なので「次第」（〜による）が正解。 "Phụ thuộc vào nỗ lực của bạn" → "次第".',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 30,
    },
  },

  'n2-01-26': {
    courseTitle: { ja: 'N2 上級文法マスター', vi: 'Ngữ pháp nâng cao N2' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N2文法㉖: 〜末（すえ）に・〜あげく（に）',
      titleTranslation: 'Ngữ pháp N2㉖: Sau khi.../ Sau rốt...',
      introduction: `「〜末に」は「〜というプロセスの後、ついに（よい結果・重要な決断に至った）」という意味で、ポジティブな結果に使います。「〜あげくに」は「〜を繰り返した後、結局（悪い・否定的な結果になった）」で、ネガティブな結果に使います。

"〜末に" có nghĩa là "sau khi trải qua (quá trình)..., cuối cùng (đạt kết quả tốt/quyết định quan trọng)" - dùng cho kết quả tích cực. "〜あげくに" là "sau khi (lặp đi lặp lại)..., rốt cuộc (kết quả xấu)" - dùng cho kết quả tiêu cực.`,
      keyPoints: [
        '〜末に（ポジティブ）：「長い過程の後、良い結果・重要な決断」',
        '〜あげくに（ネガティブ）：「繰り返した後、否定的な結果」',
        '接続：名詞（の）末に / 動詞た形の末に / 名詞（の）あげくに',
        '〜末に：長い検討・努力の後の結論',
        '例：「長い議論の末に決定した」「散々迷ったあげくに断った」',
      ],
      vocabulary: [
        { word: '〜末に', reading: 'すえに', meaning: 'sau khi (kết quả tốt)', example: '長い入院生活の末に退院した' },
        { word: '〜あげくに', reading: 'あげくに', meaning: 'rốt cuộc (kết quả xấu)', example: '散々迷ったあげくに辞めた' },
        { word: '散々', reading: 'さんざん', meaning: 'rất nhiều, hết cỡ', example: '散々悩んだあげく' },
        { word: 'ついに', reading: 'ついに', meaning: 'cuối cùng', example: 'ついに完成した' },
      ],
      dialogue: [
        { speaker: 'A', japanese: '長い検討の末に、手術を受けることにしました。', reading: 'ながいけんとうのすえに、しゅじゅつをうけることにしました。', translation: 'Sau khi cân nhắc lâu dài, tôi đã quyết định phẫu thuật.' },
        { speaker: '医師', japanese: 'そうですか。慎重に考えた末の決断ですね。', reading: 'そうですか。しんちょうにかんがえたすえのけつだんですね。', translation: 'Vậy ạ. Đó là quyết định sau khi suy nghĩ cẩn thận nhỉ.' },
        { speaker: 'B', japanese: '散々悩んだあげくに、セカンドオピニオンを求めることにした。', reading: 'さんざんなやんだあげくに、セカンドオピニオンをもとめることにした。', translation: 'Sau khi đắn đo rất nhiều, rốt cuộc quyết định tìm ý kiến thứ hai.' },
      ],
      examples: [
        { japanese: '5年間の研究の末に、新薬の開発に成功した。', reading: '5ねんかんのけんきゅうのすえに、しんやくのかいはつにせいこうした。', translation: 'Sau 5 năm nghiên cứu, đã thành công phát triển thuốc mới.' },
        { japanese: '話し合いを重ねたあげくに、プロジェクトは中止になった。', reading: 'はなしあいをかさねたあげくに、プロジェクトはちゅうしになった。', translation: 'Sau nhiều lần thảo luận, rốt cuộc dự án bị hủy.' },
        { japanese: '悩みに悩んだ末に、専門家に相談する決意をした。', reading: 'なやみになやんだすえに、せんもんかにそうだんするけついをした。', translation: 'Sau khi trăn trở mãi, cuối cùng quyết tâm tham khảo ý kiến chuyên gia.' },
      ],
      grammarNote: `【〜末に vs 〜あげくに の使い分け】

〜末に：ポジティブな結果・重要な決断（結果が良い）
例：「検討の末に採用された」= Sau khi xem xét đã được tuyển dụng
→ 後ろは良いことが来る（합격・成功・決断など）

〜あげくに：ネガティブな結果（結果が悪い・否定的）
例：「迷ったあげくに失敗した」= Sau khi do dự rốt cuộc thất bại
→ 後ろは悪いことが来る（失敗・断念・けんかなど）

【注意】
どちらも「長いプロセスの後」というニュアンスがあるが、
末に → 苦労が報われる感じ（positive）
あげくに → 無駄な努力・無益な結果（negative）`,
      quizzes: [
        {
          question: '「10年の研究（　）、ついに治療法が見つかった。」の（　）は？',
          options: [
            { id: 'a', text: 'の末に' },
            { id: 'b', text: 'のあげくに' },
            { id: 'c', text: 'に際して' },
            { id: 'd', text: 'をきっかけに' },
          ],
          correctId: 'a',
          explanation: '「治療法が見つかった」というポジティブな結果なので「末に」が正解。「あげくに」は否定的な結果に使う。 Kết quả tích cực → "末に".',
          difficulty: 'easy' as const,
        },
        {
          question: '「散々口論した（　）、二人は別れてしまった。」の（　）は？',
          options: [
            { id: 'a', text: 'あげくに' },
            { id: 'b', text: '末に' },
            { id: 'c', text: 'とともに' },
            { id: 'd', text: 'を機に' },
          ],
          correctId: 'a',
          explanation: '「別れた」というネガティブな結果なので「あげくに」が正解。 Kết quả tiêu cực (chia tay) → "あげくに".',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 30,
    },
  },

  'n2-01-27': {
    courseTitle: { ja: 'N2 上級文法マスター', vi: 'Ngữ pháp nâng cao N2' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N2文法㉗: 〜ぬきで・〜ぬきには・〜ぬきの',
      titleTranslation: 'Ngữ pháp N2㉗: Không có.../Thiếu...',
      introduction: `「〜ぬきで」は「〜がなく・〜を省いて」という意味で、何かを除いた状態を表します。「〜ぬきには」は「〜がなければ（その後は成立しない）」という条件的な意味を持ちます。「〜抜き（ぬき）」は名詞として「砂糖抜き」「前置きぬき」のように使われます。

"〜ぬきで" có nghĩa là "không có.../bỏ đi..." - biểu thị trạng thái thiếu một thứ gì đó. "〜ぬきには" là điều kiện "nếu không có... (thì không thể...)". "〜抜き" dùng như danh từ.`,
      keyPoints: [
        '〜ぬきで：「〜なしで・〜を省いて」（không có/bỏ đi）',
        '〜ぬきには：「〜なければ〜できない」（nếu không có...）',
        '〜ぬきの：連体修飾「〜なしの」（không có... + danh từ）',
        '接続：名詞 + ぬきで / ぬきには / ぬきの',
        '例：「前置きぬきに言う」「あなたぬきには成立しない」',
      ],
      vocabulary: [
        { word: '〜ぬきで', reading: 'ぬきで', meaning: 'không có.../bỏ đi...', example: '砂糖ぬきで作る' },
        { word: '〜ぬきには', reading: 'ぬきには', meaning: 'nếu không có... (thì không thể)', example: '彼の協力ぬきには無理だ' },
        { word: '前置き', reading: 'まえおき', meaning: 'lời mở đầu, dẫn dắt', example: '前置きぬきに言う' },
        { word: '省く', reading: 'はぶく', meaning: 'bỏ qua, lược bỏ', example: '説明を省く' },
      ],
      dialogue: [
        { speaker: 'A', japanese: '前置きぬきに申し上げます。この治療法には問題があります。', reading: 'まえおきぬきにもうしあげます。このちりょうほうにはもんだいがあります。', translation: 'Tôi xin nói thẳng vào vấn đề. Phương pháp điều trị này có vấn đề.' },
        { speaker: 'B', japanese: 'チームの協力ぬきには、この手術は成功しなかったでしょう。', reading: 'チームのきょうりょくぬきには、このしゅじゅつはせいこうしなかったでしょう。', translation: 'Nếu không có sự hợp tác của đội, cuộc phẫu thuật này hẳn đã không thành công.' },
        { speaker: 'A', japanese: '患者さんの同意ぬきに、治療を進めることはできません。', reading: 'かんじゃさんのどういぬきに、ちりょうをすすめることはできません。', translation: 'Không thể tiến hành điều trị khi thiếu sự đồng ý của bệnh nhân.' },
      ],
      examples: [
        { japanese: '彼女の存在ぬきには、このプロジェクトは語れない。', reading: 'かのじょのそんざいぬきには、このプロジェクトはかたれない。', translation: 'Không thể nói về dự án này nếu thiếu sự đóng góp của cô ấy.' },
        { japanese: 'インフォームドコンセントぬきに手術をするのは許されない。', reading: 'インフォームドコンセントぬきにしゅじゅつをするのはゆるされない。', translation: 'Không được phép phẫu thuật khi thiếu informed consent.' },
        { japanese: '余分なものぬきのシンプルな説明が患者には伝わりやすい。', reading: 'よぶんなものぬきのシンプルなせつめいがかんじゃにはつたわりやすい。', translation: 'Giải thích đơn giản không có những thứ không cần thiết dễ truyền đạt cho bệnh nhân.' },
      ],
      grammarNote: `【〜ぬきで / ぬきには / ぬきに の使い分け】

〜ぬきで：「〜なしで（動作・状態の説明）」
例：「朝食ぬきで来た」= Đến mà không ăn sáng

〜ぬきには：「〜なければ（後件が不可能・困難）」
例：「あなたぬきには無理だ」= Thiếu bạn thì không thể

〜ぬきに/で：「〜を省いて（手順を飛ばす）」
例：「説明ぬきに渡された」= Được đưa cho mà không giải thích

【類語：〜なしで・〜なしには】
「〜ぬき」のほうが書き言葉的・固い表現`,
      quizzes: [
        {
          question: '「医師の説明（　）に、患者は手術に同意した。」の（　）は？',
          options: [
            { id: 'a', text: 'ぬき' },
            { id: 'b', text: 'に伴って' },
            { id: 'c', text: 'をもとに' },
            { id: 'd', text: 'に関して' },
          ],
          correctId: 'a',
          explanation: '「医師の説明がないまま（省いて）」という意味なので「ぬき」が正解。 Không có sự giải thích → "ぬき".',
          difficulty: 'easy' as const,
        },
        {
          question: '「スタッフ全員の協力（　）、この目標は達成できない。」の（　）は？',
          options: [
            { id: 'a', text: 'ぬきには' },
            { id: 'b', text: 'ぬきで' },
            { id: 'c', text: 'ぬきの' },
            { id: 'd', text: 'ぬきに' },
          ],
          correctId: 'a',
          explanation: '「協力がなければ達成できない」という条件の意味なので「ぬきには」が正解。 Điều kiện "nếu không có..." → "ぬきには".',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 30,
    },
  },

  'n2-01-28': {
    courseTitle: { ja: 'N2 上級文法マスター', vi: 'Ngữ pháp nâng cao N2' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N2文法㉘: 〜を問わず・〜いかんにかかわらず',
      titleTranslation: 'Ngữ pháp N2㉘: Bất kể.../Không phân biệt...',
      introduction: `「〜を問わず」は「〜の違いに関係なく・〜を区別しないで」という意味で、条件・違い・状況に関係なく同じ結果になる場合に使います。「〜いかんにかかわらず」は「〜がどうであっても」という意味で、より書き言葉的な表現です。

"〜を問わず" có nghĩa là "bất kể.../không phân biệt..." - dùng khi không phân biệt điều kiện/sự khác biệt mà kết quả vẫn giống nhau. "〜いかんにかかわらず" là "dù thế nào cũng..." - văn viết hơn.`,
      keyPoints: [
        '〜を問わず：「〜に関係なく・〜を区別しない」（bất kể）',
        '接続：名詞 + を問わず（対をなす言葉と相性がよい）',
        '頻出：「国籍・性別・年齢・経験・天候」を問わず',
        '〜いかんにかかわらず：「〜がどうであっても」（書き言葉）',
        '例：「経験の有無を問わず応募可能」「結果いかんにかかわらず」',
      ],
      vocabulary: [
        { word: '〜を問わず', reading: 'をとわず', meaning: 'bất kể.../không phân biệt...', example: '年齢を問わず参加できる' },
        { word: 'いかんにかかわらず', reading: 'いかんにかかわらず', meaning: 'dù thế nào cũng（書き言葉）', example: '結果のいかんにかかわらず続ける' },
        { word: '有無', reading: 'うむ', meaning: 'có hay không', example: '経験の有無を問わず' },
        { word: '性別', reading: 'せいべつ', meaning: 'giới tính', example: '性別を問わず採用する' },
      ],
      dialogue: [
        { speaker: '担当者', japanese: 'この研修は、経験の有無を問わず参加できます。', reading: 'このけんしゅうは、けいけんのうむをとわずさんかできます。', translation: 'Khóa đào tạo này có thể tham gia bất kể có kinh nghiệm hay không.' },
        { speaker: 'A', japanese: '国籍を問わず応募できるんですか？', reading: 'こくせきをとわずおうぼできるんですか？', translation: 'Bất kể quốc tịch đều có thể ứng tuyển à?' },
        { speaker: '担当者', japanese: 'はい、結果のいかんにかかわらず、全員に修了証を発行します。', reading: 'はい、けっかのいかんにかかわらず、ぜんいんにしゅうりょうしょうをはっこうします。', translation: 'Vâng, dù kết quả thế nào, tất cả đều được cấp chứng chỉ hoàn thành.' },
      ],
      examples: [
        { japanese: '医療は、収入や地位を問わず受けられるべきだ。', reading: 'いりょうは、しゅうにゅうやちいをとわずうけられるべきだ。', translation: 'Y tế nên được tiếp cận bất kể thu nhập hay địa vị.' },
        { japanese: '試験の結果いかんにかかわらず、努力は報われる。', reading: 'しけんのけっかいかんにかかわらず、どりょくはむくわれる。', translation: 'Dù kết quả thi thế nào, nỗ lực cũng sẽ được đền đáp.' },
        { japanese: '天候を問わず、毎日運動する習慣をつけている。', reading: 'てんこうをとわず、まいにちうんどうするしゅうかんをつけている。', translation: 'Tôi có thói quen tập thể dục mỗi ngày bất kể thời tiết.' },
      ],
      grammarNote: `【〜を問わず の頻出パターン】

対をなす言葉（両方を含む）と相性がよい：
「男女を問わず」= Bất kể nam nữ
「昼夜を問わず」= Bất kể ngày đêm
「老若男女を問わず」= Bất kể già trẻ trai gái
「経験の有無を問わず」= Bất kể có kinh nghiệm hay không

【〜を問わず vs 〜にかかわらず】
どちらも「〜に関係なく」の意味だが：
「を問わず」→ 条件・資格の区別なし（選考・資格）
「にかかわらず」→ より広い状況での無関係

【〜いかんにかかわらず（書き言葉）】
「いかん」=「どのような状態か」
「結果のいかんにかかわらず」= どんな結果でも`,
      quizzes: [
        {
          question: '「年齢（　）、誰でも参加できます。」の（　）は？',
          options: [
            { id: 'a', text: 'を問わず' },
            { id: 'b', text: 'において' },
            { id: 'c', text: 'に際して' },
            { id: 'd', text: 'をめぐって' },
          ],
          correctId: 'a',
          explanation: '「年齢の違いに関係なく誰でも参加できる」という意味なので「を問わず」が正解。 "Bất kể tuổi tác" → "を問わず".',
          difficulty: 'easy' as const,
        },
        {
          question: '「を問わず」とほぼ同じ意味の表現はどれですか？',
          options: [
            { id: 'a', text: 'に関係なく' },
            { id: 'b', text: 'に関して' },
            { id: 'c', text: 'に基づいて' },
            { id: 'd', text: 'において' },
          ],
          correctId: 'a',
          explanation: '「を問わず」=「〜に関係なく・〜を区別せずに」という意味。「に関係なく」が最も近い。 "を問わず" ≈ "に関係なく" (không liên quan đến).',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 30,
    },
  },

  'n2-01-29': {
    courseTitle: { ja: 'N2 上級文法マスター', vi: 'Ngữ pháp nâng cao N2' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N2文法㉙: 〜はもとより・〜はおろか',
      titleTranslation: 'Ngữ pháp N2㉙: Chưa nói đến... / Không chỉ...',
      introduction: `「〜はもとより」は「〜は言うまでもなく、その他にも（さらに幅広い範囲が）」という意味で、ポジティブな追加を表します。「〜はおろか」は「〜は言うまでもなく（当然できないのに）、さらに〜もできない」というネガティブな追加表現です。

"〜はもとより" có nghĩa là "không cần nói đến...cả...nữa (tích cực)" - biểu thị bổ sung tích cực. "〜はおろか" là "chưa nói đến...còn không...nữa (tiêu cực)" - biểu thị bổ sung tiêu cực.`,
      keyPoints: [
        '〜はもとより（ポジティブ）：「〜は当然として、さらに広い範囲も」',
        '〜はおろか（ネガティブ）：「〜は言うまでもなく（できない）、さらに〜も」',
        '接続：名詞 + はもとより / はおろか',
        '「はもとより」→「はもちろん」と言い換えられる',
        '例：「日本語はもとより、英語も話せる」「食べるはおろか、立つこともできない」',
      ],
      vocabulary: [
        { word: '〜はもとより', reading: 'はもとより', meaning: 'không cần nói đến.../không chỉ...（ポジティブ）', example: '日本語はもとより中国語もできる' },
        { word: '〜はおろか', reading: 'はおろか', meaning: 'chưa nói đến.../còn không...（ネガティブ）', example: '歩くはおろか、立つこともできない' },
        { word: '言うまでもなく', reading: 'いうまでもなく', meaning: 'không cần phải nói', example: '言うまでもなく大切だ' },
        { word: 'おろか', reading: 'おろか', meaning: 'đã không...còn không...', example: '読むはおろか書けない' },
      ],
      dialogue: [
        { speaker: 'A', japanese: '山田先生は医療の知識はもとより、語学力も素晴らしいです。', reading: 'やまだせんせいはいりょうのちしきはもとより、ごがくりょくもすばらしいです。', translation: 'Thầy Yamada không chỉ có kiến thức y tế mà kỹ năng ngoại ngữ cũng tuyệt vời.' },
        { speaker: 'B', japanese: '彼女は術後に歩くはおろか、起き上がることもできませんでした。', reading: 'かのじょはじゅつごにあるくはおろか、おきあがることもできませんでした。', translation: 'Sau phẫu thuật, cô ấy chưa nói đến đi lại, ngay cả ngồi dậy cũng không được.' },
        { speaker: 'A', japanese: 'この病院は設備はもとより、スタッフの質も高い。', reading: 'このびょういんはせつびはもとより、スタッフのしつもたかい。', translation: 'Bệnh viện này không chỉ cơ sở vật chất mà chất lượng nhân viên cũng cao.' },
      ],
      examples: [
        { japanese: '彼は専門知識はもとより、コミュニケーション能力も優れている。', reading: 'かれはせんもんちしきはもとより、コミュニケーションのうりょくもすぐれている。', translation: 'Anh ấy không chỉ có kiến thức chuyên môn mà kỹ năng giao tiếp cũng xuất sắc.' },
        { japanese: '栄養が足りなくて、動くはおろか、考えることもできなかった。', reading: 'えいようがたりなくて、うごくはおろか、かんがえることもできなかった。', translation: 'Thiếu dinh dưỡng đến mức chưa nói đến vận động, ngay cả suy nghĩ cũng không được.' },
        { japanese: '医療の技術はもとより、患者への接し方も重要だ。', reading: 'いりょうのぎじゅつはもとより、かんじゃへのせっしかたもじゅうようだ。', translation: 'Không chỉ kỹ thuật y tế mà cách tiếp xúc với bệnh nhân cũng quan trọng.' },
      ],
      grammarNote: `【〜はもとより vs 〜はおろか の使い分け】

〜はもとより（プラス追加）：
「Aはもとより、Bも（できる/ある/良い）」
例：「英語はもとより、中国語も話せる」= Không chỉ tiếng Anh mà tiếng Trung cũng nói được

〜はおろか（マイナス追加）：
「Aはおろか、Bも（できない/ない）」
例：「歩くはおろか、立てない」= Chưa nói đến đi, đứng cũng không được

【〜はもとより の類義語】
「〜はもちろん」（口語的・やや軽い）
「〜は言うまでもなく」（書き言葉・丁寧）
「〜のみならず」（書き言葉）`,
      quizzes: [
        {
          question: '「この病院はサービス（　）、医療技術も世界トップレベルです。」の（　）は？',
          options: [
            { id: 'a', text: 'はもとより' },
            { id: 'b', text: 'はおろか' },
            { id: 'c', text: 'どころか' },
            { id: 'd', text: 'につれて' },
          ],
          correctId: 'a',
          explanation: '「サービスも医療技術も両方優れている」というポジティブな追加なので「はもとより」が正解。 Bổ sung tích cực → "はもとより".',
          difficulty: 'easy' as const,
        },
        {
          question: '「彼は立つ（　）、指一本動かすこともできなかった。」の（　）は？',
          options: [
            { id: 'a', text: 'はおろか' },
            { id: 'b', text: 'はもとより' },
            { id: 'c', text: 'ものの' },
            { id: 'd', text: 'ことなく' },
          ],
          correctId: 'a',
          explanation: '「立てない（できない）どころか、もっとひどく指も動かせない」というネガティブな追加なので「はおろか」が正解。 Bổ sung tiêu cực → "はおろか".',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 30,
    },
  },

  'n2-01-30': {
    courseTitle: { ja: 'N2 上級文法マスター', vi: 'Ngữ pháp nâng cao N2' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N2文法㉚: 〜からこそ・〜てこそ',
      titleTranslation: 'Ngữ pháp N2㉚: Chính vì... / Có... mới...',
      introduction: `「〜からこそ」は「〜という理由があるからこそ（他の理由ではなく、まさにこの理由で）」という強調の逆接表現です。「〜てこそ」は「〜してはじめて（その後の結果・価値が生まれる）」という意味で、条件の重要性を強調します。

"〜からこそ" có nghĩa là "chính vì... (không phải lý do khác, mà chính lý do này)" - nhấn mạnh lý do. "〜てこそ" là "có làm... mới...(giá trị/kết quả mới xuất hiện)" - nhấn mạnh tầm quan trọng của điều kiện.`,
      keyPoints: [
        '〜からこそ：「まさにこの理由だからこそ（強調）」（chính vì）',
        '〜てこそ：「〜してはじめて価値・結果が生まれる」（có...mới）',
        '接続：普通形/名詞 + からこそ / 動詞て形 + こそ',
        '「こそ」は強調の助詞（đây là trợ từ nhấn mạnh）',
        '例：「あなたがいるからこそ頑張れる」「努力してこそ意味がある」',
      ],
      vocabulary: [
        { word: '〜からこそ', reading: 'からこそ', meaning: 'chính vì...（nhấn mạnh lý do）', example: '患者のためだからこそ厳しく言う' },
        { word: '〜てこそ', reading: 'てこそ', meaning: 'có...mới...（điều kiện quan trọng）', example: '実践してこそ身につく' },
        { word: 'こそ', reading: 'こそ', meaning: 'chính là/đây mới là（強調助詞）', example: '今こそチャンスだ' },
        { word: 'はじめて', reading: 'はじめて', meaning: 'lần đầu tiên/mới bắt đầu', example: '経験してはじめてわかる' },
      ],
      dialogue: [
        { speaker: '看護師', japanese: '大変な仕事ですが、患者さんに感謝されるからこそ続けられます。', reading: 'たいへんなしごとですが、かんじゃさんにかんしゃされるからこそつづけられます。', translation: 'Là công việc vất vả nhưng chính vì được bệnh nhân cảm ơn nên mới tiếp tục được.' },
        { speaker: 'A', japanese: '現場を経験してこそ、本当の医療がわかると思います。', reading: 'げんばをけいけんしてこそ、ほんとうのいりょうがわかるとおもいます。', translation: 'Tôi nghĩ có trải nghiệm thực tế mới hiểu được y tế thực sự.' },
        { speaker: 'B', japanese: 'そうですね。失敗を経験するからこそ成長できるんです。', reading: 'そうですね。しっぱいをけいけんするからこそせいちょうできるんです。', translation: 'Đúng thế. Chính vì trải qua thất bại mới có thể trưởng thành.' },
      ],
      examples: [
        { japanese: '辛い経験があるからこそ、患者の気持ちがわかる。', reading: 'つらいけいけんがあるからこそ、かんじゃのきもちがわかる。', translation: 'Chính vì có những trải nghiệm gian khổ mới hiểu được tâm trạng bệnh nhân.' },
        { japanese: '患者と信頼関係を築いてこそ、よりよい治療ができる。', reading: 'かんじゃとしんらいかんけいをきずいてこそ、よりよいちりょうができる。', translation: 'Có xây dựng được quan hệ tin cậy với bệnh nhân mới có thể điều trị tốt hơn.' },
        { japanese: '困難があるからこそ、達成したときの喜びが大きい。', reading: 'こんなんがあるからこそ、たっせいしたときのよろこびがおおきい。', translation: 'Chính vì có khó khăn nên khi đạt được niềm vui mới lớn.' },
      ],
      grammarNote: `【〜からこそ と 〜から の違い】

〜から：単純な原因・理由
例：「疲れたから帰る」= Vì mệt nên về

〜からこそ：「この理由こそが（他ではなく）」強調
例：「あなたがいるからこそ続けられる」
= Chính vì có bạn (không phải lý do khác) mới tiếp tục được

【〜てこそ の意味】
「〜することが条件で、初めて価値・結果が生まれる」
例：「経験してこそわかる」= Phải trải nghiệm mới hiểu được
→「〜して初めて」に言い換えられる`,
      quizzes: [
        {
          question: '「苦しい経験をした（　）、患者の痛みが理解できる。」の（　）は？',
          options: [
            { id: 'a', text: 'からこそ' },
            { id: 'b', text: 'ものの' },
            { id: 'c', text: 'ことなく' },
            { id: 'd', text: 'に過ぎず' },
          ],
          correctId: 'a',
          explanation: '「この経験こそが（他でなく）理解の理由だ」という強調の原因表現なので「からこそ」が正解。 Nhấn mạnh lý do "chính vì..." → "からこそ".',
          difficulty: 'medium' as const,
        },
        {
          question: '「実際に患者を診（　）、医療の難しさがわかる。」の（　）は？',
          options: [
            { id: 'a', text: 'てこそ' },
            { id: 'b', text: 'ながらも' },
            { id: 'c', text: 'てもいい' },
            { id: 'd', text: 'たうえで' },
          ],
          correctId: 'a',
          explanation: '「診察することが条件で、初めてわかる」という意味なので「てこそ」が正解。 Điều kiện quan trọng "có làm... mới..." → "てこそ".',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 30,
    },
  },

  'n2-01-31': {
    courseTitle: { ja: 'N2 上級文法マスター', vi: 'Ngữ pháp nâng cao N2' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N2文法㉛: 〜ばかりでなく・〜のみならず',
      titleTranslation: 'Ngữ pháp N2㉛: Không chỉ... mà còn...',
      introduction: `「〜ばかりでなく」は「〜だけでなく、さらに（追加の情報がある）」という意味で、並列・追加を表します。「〜のみならず」はほぼ同義でより書き言葉的・格式ある表現です。どちらも「〜だけでなく」よりフォーマルです。

"〜ばかりでなく" có nghĩa là "không chỉ...mà còn..." - biểu thị song song/bổ sung. "〜のみならず" gần nghĩa, văn viết và trang trọng hơn. Cả hai đều trang trọng hơn "〜だけでなく".`,
      keyPoints: [
        '〜ばかりでなく：「〜だけでなく、さらに〜も」（không chỉ...mà còn）',
        '〜のみならず：「〜ばかりでなく」の書き言葉版（trang trọng）',
        '接続：名詞 / 普通形 + ばかりでなく / のみならず',
        '後ろには追加の情報・事実が来る',
        '例：「日本ばかりでなく、海外でも有名」「個人のみならず社会全体の問題」',
      ],
      vocabulary: [
        { word: '〜ばかりでなく', reading: 'ばかりでなく', meaning: 'không chỉ...mà còn...（日常〜書き言葉）', example: '技術ばかりでなく心も大切だ' },
        { word: '〜のみならず', reading: 'のみならず', meaning: 'không chỉ...mà còn...（書き言葉）', example: '国内のみならず海外でも知られている' },
        { word: '〜だけでなく', reading: 'だけでなく', meaning: 'không chỉ...（口語・普通）', example: '技術だけでなく心も大切' },
        { word: '追加', reading: 'ついか', meaning: 'bổ sung, thêm vào', example: '追加情報' },
      ],
      dialogue: [
        { speaker: 'A', japanese: 'この治療法は効果があるばかりでなく、副作用も少ない。', reading: 'このちりょうほうはこうかがあるばかりでなく、ふくさようもすくない。', translation: 'Phương pháp điều trị này không chỉ có hiệu quả mà còn ít tác dụng phụ.' },
        { speaker: 'B', japanese: '患者本人のみならず、ご家族にも説明が必要ですね。', reading: 'かんじゃほんにんのみならず、ごかぞくにもせつめいがひつようですね。', translation: 'Không chỉ cần giải thích cho bản thân bệnh nhân mà cả gia đình cũng cần nhỉ.' },
        { speaker: 'A', japanese: '医療の質ばかりでなく、接遇の向上も求められています。', reading: 'いりょうのしつばかりでなく、せつぐうのこうじょうももとめられています。', translation: 'Không chỉ chất lượng y tế mà cả việc cải thiện tiếp đón cũng được yêu cầu.' },
      ],
      examples: [
        { japanese: '高齢化は日本のみならず、世界的な問題だ。', reading: 'こうれいかはにほんのみならず、せかいてきなもんだいだ。', translation: 'Già hóa dân số không chỉ là vấn đề của Nhật Bản mà là vấn đề toàn cầu.' },
        { japanese: 'ストレスは精神ばかりでなく、身体にも悪影響を与える。', reading: 'ストレスはせいしんばかりでなく、しんたいにもあくえいきょうをあたえる。', translation: 'Stress không chỉ ảnh hưởng xấu đến tinh thần mà còn đến thể chất.' },
        { japanese: '医師のみならず、看護師も法律上の責任を持つ。', reading: 'いしのみならず、かんごしもほうりつじょうのせきにんをもつ。', translation: 'Không chỉ bác sĩ mà y tá cũng có trách nhiệm theo pháp luật.' },
      ],
      grammarNote: `【〜ばかりでなく vs 〜のみならず vs 〜だけでなく】

フォーマル度：のみならず ＞ ばかりでなく ＞ だけでなく

〜だけでなく（口語・普通）：
例：「A病院だけでなくB病院も行った」

〜ばかりでなく（日常〜書き言葉）：
例：「A病院ばかりでなくB病院も評判がいい」

〜のみならず（書き言葉・格式）：
例：「A病院のみならずB病院も世界的に有名だ」

【はもとより との違い】
「はもとより」= 当然のこと + さらに
「ばかりでなく」= 単なる追加（当然とは限らない）`,
      quizzes: [
        {
          question: '「この病気は子供（　）、大人にも感染する。」の（　）は？',
          options: [
            { id: 'a', text: 'ばかりでなく' },
            { id: 'b', text: 'はおろか' },
            { id: 'c', text: 'どころか' },
            { id: 'd', text: 'ものの' },
          ],
          correctId: 'a',
          explanation: '「子供だけでなく大人も（追加情報）」という並列・追加の表現なので「ばかりでなく」が正解。 Bổ sung tích cực "không chỉ...mà còn..." → "ばかりでなく".',
          difficulty: 'easy' as const,
        },
        {
          question: '「〜ばかりでなく」の書き言葉・格式表現はどれですか？',
          options: [
            { id: 'a', text: 'のみならず' },
            { id: 'b', text: 'どころか' },
            { id: 'c', text: 'はおろか' },
            { id: 'd', text: 'もとより' },
          ],
          correctId: 'a',
          explanation: '「のみならず」は「ばかりでなく」の書き言葉・格式表現。論説文・公式文書でよく使われる。 "のみならず" là dạng văn viết trang trọng của "ばかりでなく".',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 30,
    },
  },

  'n2-01-32': {
    courseTitle: { ja: 'N2 上級文法マスター', vi: 'Ngữ pháp nâng cao N2' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N2文法㉜: 〜ことから・〜ことで',
      titleTranslation: 'Ngữ pháp N2㉜: Từ chỗ... / Bằng việc...',
      introduction: `「〜ことから」は「〜という事実・理由から（判断・命名などをした）」という意味で、根拠・由来を示します。「〜ことで」は「〜するという行為によって（結果が生まれる）」という手段・方法を示す表現で、「〜することで」の形でよく使われます。

"〜ことから" có nghĩa là "từ chỗ.../vì...lý do đó" - chỉ ra căn cứ, xuất xứ. "〜ことで" là "bằng việc.../nhờ..." - chỉ ra phương tiện, phương pháp tạo ra kết quả.`,
      keyPoints: [
        '〜ことから：「〜という事実・理由から（命名・判断）」（từ chỗ/vì）',
        '〜ことで：「〜することによって（結果・効果が生まれる）」（bằng việc）',
        '接続：普通形 + ことから / 動詞辞書形/名詞 + ことで',
        '「ことから」は命名・由来の説明によく使用',
        '例：「白い花が咲くことから、白梅と呼ばれる」',
      ],
      vocabulary: [
        { word: '〜ことから', reading: 'ことから', meaning: 'từ chỗ.../vì lý do này...（根拠・由来）', example: '肌が白いことから「雪女」と呼ばれた' },
        { word: '〜ことで', reading: 'ことで', meaning: 'bằng việc.../nhờ...（手段・方法）', example: '運動することで健康を保てる' },
        { word: '由来', reading: 'ゆらい', meaning: 'xuất xứ, nguồn gốc', example: '名前の由来' },
        { word: '呼ばれる', reading: 'よばれる', meaning: 'được gọi là', example: '〜と呼ばれる植物' },
      ],
      dialogue: [
        { speaker: 'A', japanese: 'この薬はなぜ「ホワイト錠」という名前なんですか？', reading: 'このくすりはなぜ「ホワイトじょう」というなまえなんですか？', translation: 'Sao thuốc này lại có tên là "White錠" vậy ạ?' },
        { speaker: '薬剤師', japanese: '白い錠剤であることから、その名前がつけられました。', reading: 'しろいじょうざいであることから、そのなまえがつけられました。', translation: 'Từ chỗ là viên thuốc màu trắng, tên đó đã được đặt cho nó.' },
        { speaker: 'A', japanese: '毎日薬を飲むことで、症状が改善するんですね。', reading: 'まいにちくすりをのむことで、しょうじょうがかいぜんするんですね。', translation: 'Bằng việc uống thuốc mỗi ngày, triệu chứng sẽ cải thiện nhỉ.' },
      ],
      examples: [
        { japanese: '葉が桜のような形をしていることから、「桜草」と呼ばれる。', reading: 'はがさくらのようなかたちをしていることから、「さくらそう」とよばれる。', translation: 'Từ chỗ lá có hình dạng như hoa anh đào, được gọi là "Sakurasou".' },
        { japanese: 'コミュニケーションを取ることで、患者との信頼関係が深まる。', reading: 'コミュニケーションをとることで、かんじゃとのしんらいかんけいがふかまる。', translation: 'Bằng việc giao tiếp, quan hệ tin cậy với bệnh nhân được củng cố.' },
        { japanese: '副作用が多く報告されることから、使用が制限されている。', reading: 'ふくさようがおおくほうこくされることから、しようがせいげんされている。', translation: 'Từ chỗ có nhiều báo cáo về tác dụng phụ, việc sử dụng bị hạn chế.' },
      ],
      grammarNote: `【〜ことから vs 〜ことで の違い】

〜ことから：根拠・由来・理由
「〜という事実をもとに判断/命名した」
例：「色が赤いことから、赤血球と名付けられた」
→ Từ sự thật... → đặt tên/phán quyết

〜ことで：手段・方法・条件
「〜するという行為によって、〜という結果が出る」
例：「定期的に運動することで、体力がつく」
→ Bằng việc... → kết quả xảy ra

【ことから の特徴】
命名・由来の説明に多用
「〜から」を「〜ことから」に置き換えたフォーマル版`,
      quizzes: [
        {
          question: '「川の流れが速い（　）、この橋は「急流橋」と呼ばれている。」の（　）は？',
          options: [
            { id: 'a', text: 'ことから' },
            { id: 'b', text: 'ことで' },
            { id: 'c', text: 'ことなく' },
            { id: 'd', text: 'ことに' },
          ],
          correctId: 'a',
          explanation: '「川の流れが速いという事実を根拠に命名した」という由来・根拠を表すので「ことから」が正解。 Căn cứ/nguồn gốc đặt tên → "ことから".',
          difficulty: 'medium' as const,
        },
        {
          question: '「日記をつける（　）、自分の成長が見えてくる。」の（　）は？',
          options: [
            { id: 'a', text: 'ことで' },
            { id: 'b', text: 'ことから' },
            { id: 'c', text: 'ことに' },
            { id: 'd', text: 'ことなく' },
          ],
          correctId: 'a',
          explanation: '「日記をつけるという行為の結果として成長が見える」という手段・方法なので「ことで」が正解。 Phương tiện/cách thức tạo ra kết quả → "ことで".',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 30,
    },
  },

  'n2-01-33': {
    courseTitle: { ja: 'N2 上級文法マスター', vi: 'Ngữ pháp nâng cao N2' },
    isLocked: false,
    requiredPlan: 'free',
    lesson: {
      title: 'N2文法㉝: 複合助詞まとめ（〜に対して・〜に応じて・〜に沿って）',
      titleTranslation: 'Ngữ pháp N2㉝: Tổng hợp trợ từ phức hợp',
      introduction: `N2の複合助詞の中でも特に重要な「〜に対して」「〜に応じて」「〜に沿って」をまとめて学習します。「〜に対して」は「〜へ向けて・〜に関して（方向・対象）」、「〜に応じて」は「〜の状況に合わせて」、「〜に沿って」は「〜の方針・方向に従って」という意味です。

Học tổng hợp 3 trợ từ phức hợp quan trọng nhất N2: "〜に対して"（đối với/hướng đến）, "〜に応じて"（tùy theo/đáp lại）, "〜に沿って"（theo/dọc theo）.`,
      keyPoints: [
        '〜に対して：「〜へ向けて・〜に関して（方向・対象）」（đối với）',
        '〜に応じて：「〜の状況・レベルに合わせて」（tùy theo）',
        '〜に沿って：「〜の方針・方向に従って」（theo/tuân theo）',
        '接続：すべて 名詞 + に対して/に応じて/に沿って',
        '例：「患者に対して丁寧に説明する」「状況に応じて対応する」',
      ],
      vocabulary: [
        { word: '〜に対して', reading: 'にたいして', meaning: 'đối với/hướng đến（対象・方向）', example: '患者に対して丁寧に接する' },
        { word: '〜に応じて', reading: 'におうじて', meaning: 'tùy theo/đáp lại（適応）', example: '需要に応じて供給する' },
        { word: '〜に沿って', reading: 'にそって', meaning: 'theo/tuân theo（従って）', example: 'マニュアルに沿って作業する' },
        { word: '〜に従って', reading: 'にしたがって', meaning: 'theo/tuân theo（類語）', example: '指示に従って動く' },
      ],
      dialogue: [
        { speaker: '上司', japanese: '患者さんに対して、常に敬語を使うようにしてください。', reading: 'かんじゃさんにたいして、つねにけいごをつかうようにしてください。', translation: 'Đối với bệnh nhân, hãy luôn sử dụng kính ngữ.' },
        { speaker: '部下', japanese: '患者の状態に応じて、説明の難易度を変えるべきですね。', reading: 'かんじゃのじょうたいにおうじて、せつめいのなんいどをかえるべきですね。', translation: 'Nên thay đổi mức độ giải thích tùy theo tình trạng bệnh nhân nhỉ.' },
        { speaker: '上司', japanese: 'マニュアルに沿って対応しつつも、臨機応変さも必要です。', reading: 'マニュアルにそっておうじつつも、りんきおうへんさもひつようです。', translation: 'Vừa đối ứng theo sổ tay hướng dẫn vừa cần linh hoạt ứng biến.' },
      ],
      examples: [
        { japanese: '医師は患者に対して誠実に向き合う義務がある。', reading: 'いしはかんじゃにたいしてせいじつにむきあうぎむがある。', translation: 'Bác sĩ có nghĩa vụ đối xử thành thật với bệnh nhân.' },
        { japanese: '患者の回復状況に応じて、リハビリの内容を変更する。', reading: 'かんじゃのかいふくじょうきょうにおうじて、リハビリのないようをへんこうする。', translation: 'Thay đổi nội dung phục hồi chức năng tùy theo tình trạng phục hồi của bệnh nhân.' },
        { japanese: '治療方針に沿って、各スタッフが連携して動く。', reading: 'ちりょうほうしんにそって、かくスタッフがれんけいしてうごく。', translation: 'Mỗi nhân viên phối hợp hoạt động theo phương châm điều trị.' },
      ],
      grammarNote: `【3つの複合助詞の使い分け】

〜に対して（対象・方向）：
「Aに対してBする」= Làm B đối với A
例：「批判に対して反論する」= Phản bác lại chỉ trích

〜に応じて（適応・対応）：
「Aに応じてBを変える/調整する」= Điều chỉnh B tùy theo A
例：「年齢に応じた薬の量」= Liều thuốc phù hợp với tuổi

〜に沿って（方針・方向に従う）：
「Aに沿ってBを行う」= Thực hiện B theo A
例：「計画に沿って進める」= Tiến hành theo kế hoạch

【に従って vs に沿って】
に従って：命令・規則・指示に従う（tuân theo）
に沿って：方針・計画・方向性に沿う（theo hướng）`,
      quizzes: [
        {
          question: '「患者の要望（　）、治療方針を変更することがある。」の（　）は？',
          options: [
            { id: 'a', text: 'に応じて' },
            { id: 'b', text: 'に対して' },
            { id: 'c', text: 'に沿って' },
            { id: 'd', text: 'に際して' },
          ],
          correctId: 'a',
          explanation: '「患者の要望の状況に合わせて変更する」という適応・対応の意味なので「に応じて」が正解。 Thích nghi/đáp lại tình huống → "に応じて".',
          difficulty: 'medium' as const,
        },
        {
          question: '「治療計画（　）、段階的に療養を進める。」の（　）は？',
          options: [
            { id: 'a', text: 'に沿って' },
            { id: 'b', text: 'に対して' },
            { id: 'c', text: 'に応じて' },
            { id: 'd', text: 'をめぐって' },
          ],
          correctId: 'a',
          explanation: '「治療計画の方針・方向性に従って進める」という意味なので「に沿って」が正解。 Theo phương hướng/kế hoạch → "に沿って".',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 30,
    },
  },

  'n2-01-34': {
    courseTitle: { ja: 'N2 上級文法マスター', vi: 'Ngữ pháp nâng cao N2' },
    isLocked: false,
    requiredPlan: 'premium',
    lesson: {
      title: 'N2文法㉞: 総合練習問題（文法選択・穴埋め）',
      titleTranslation: 'N2 Ngữ pháp㉞: Bài tập tổng hợp (chọn ngữ pháp, điền vào chỗ trống)',
      introduction: `これまでに学習したN2文法（L1〜L33）の総合練習です。実際のJLPT形式に近い選択問題と穴埋め問題で、理解度を確認しましょう。各問題の解説をしっかり読んで、苦手な文法は復習してください。

Đây là bài tập tổng hợp ngữ pháp N2 (L1~L33) đã học. Hãy kiểm tra mức độ hiểu biết với các câu hỏi chọn đáp án và điền vào chỗ trống gần giống định dạng JLPT thực tế. Hãy đọc kỹ giải thích từng câu và ôn lại ngữ pháp còn yếu.`,
      keyPoints: [
        '〜にもかかわらず / 〜にかかわらず の区別（L1）',
        '〜をめぐって / 〜において / 〜として の使い分け（L2・L7・L5）',
        '〜ざるを得ない / 〜べきだ / 〜得る の区別（L20・L19・L18）',
        '〜末に / 〜あげくに のポジネガの使い分け（L26）',
        '実際のN2問題パターンで練習',
      ],
      vocabulary: [
        { word: '総合練習', reading: 'そうごうれんしゅう', meaning: 'luyện tập tổng hợp', example: '文法の総合練習をする' },
        { word: '穴埋め問題', reading: 'あなうめもんだい', meaning: 'câu hỏi điền vào chỗ trống', example: '穴埋め問題を解く' },
        { word: '選択問題', reading: 'せんたくもんだい', meaning: 'câu hỏi chọn đáp án', example: 'N2選択問題' },
        { word: '復習', reading: 'ふくしゅう', meaning: 'ôn tập', example: '苦手な文法を復習する' },
      ],
      dialogue: [
        { speaker: 'A', japanese: 'N2の文法問題はどのくらい難しいですか？', reading: 'N2のぶんぽうもんだいはどのくらいむずかしいですか？', translation: 'Câu hỏi ngữ pháp N2 khó đến mức nào ạ?' },
        { speaker: 'B', japanese: 'N3と比べると、より複雑な文型や使い分けが問われます。', reading: 'N3とくらべると、よりふくざつなぶんけいやつかいわけがとわれます。', translation: 'So với N3, người ta hỏi về các mẫu câu phức tạp hơn và sự phân biệt cách dùng.' },
        { speaker: 'A', japanese: 'この練習問題で実力を確認していきます。', reading: 'このれんしゅうもんだいでじつりょくをかくにんしていきます。', translation: 'Tôi sẽ xác nhận năng lực thực tế qua bài tập luyện này.' },
      ],
      examples: [
        { japanese: '困難（　）あきらめず、最後まで取り組んだ。→ にもかかわらず', reading: 'こんなんにもかかわらずあきらめず、さいごまでとりくんだ。', translation: 'Mặc dù có khó khăn, không bỏ cuộc và làm việc đến cùng.' },
        { japanese: '医療分野（　）、AIの活用が進んでいる。→ において', reading: 'いりょうぶんやにおいて、AIのかつようがすすんでいる。', translation: 'Trong lĩnh vực y tế, việc ứng dụng AI đang tiến triển.' },
        { japanese: '人手不足で、休日も働か（　）。→ ざるを得ない', reading: 'ひとでぶそくで、きゅうじつもはたらかざるをえない。', translation: 'Do thiếu nhân lực, buộc phải làm việc cả ngày nghỉ.' },
      ],
      grammarNote: `【総合問題 解答のポイント】

1. 逆接・让步の区別：
・〜にもかかわらず：強い逆接（書き言葉）
・〜ものの：事実の逆接
・〜ながらも/つつも：矛盾した行動
・〜とはいえ：部分認定

2. 可能・不可能の区別：
・〜得る：論理的に可能
・〜かねない：悪い可能性
・〜かねる：丁寧な断り
・〜ざるを得ない：不本意な強制

3. 根拠・手段の区別：
・〜に基づいて：規則・データが根拠
・〜によって：手段・原因・違い
・〜を通じて：経由・媒介
・〜ことから：由来・根拠`,
      quizzes: [
        {
          question: '「長い入院生活（　）、ついに退院が許可された。」の（　）は？',
          options: [
            { id: 'a', text: 'の末に' },
            { id: 'b', text: 'のあげくに' },
            { id: 'c', text: 'をめぐって' },
            { id: 'd', text: 'とともに' },
          ],
          correctId: 'a',
          explanation: '「長いプロセスの後、よい結果（退院許可）が出た」のでポジティブな「末に」が正解。 Sau quá trình dài, kết quả tốt → "末に".',
          difficulty: 'medium' as const,
        },
        {
          question: '「患者本人（　）、ご家族にも説明が必要です。」の（　）は？',
          options: [
            { id: 'a', text: 'のみならず' },
            { id: 'b', text: 'はおろか' },
            { id: 'c', text: 'どころか' },
            { id: 'd', text: 'ぬきには' },
          ],
          correctId: 'a',
          explanation: '「患者だけでなく家族も（追加）」というポジティブな並列なので「のみならず」が正解。 Bổ sung tích cực "không chỉ...mà còn..." → "のみならず".',
          difficulty: 'medium' as const,
        },
      ],
      xpReward: 40,
    },
  },

  'n2-01-35': {
    courseTitle: { ja: 'N2 上級文法マスター', vi: 'Ngữ pháp nâng cao N2' },
    isLocked: false,
    requiredPlan: 'premium',
    lesson: {
      title: 'N2文法㉟: 総復習テスト（20問）',
      titleTranslation: 'N2 Ngữ pháp㉟: Kiểm tra tổng hợp（20 câu）',
      introduction: `N2 上級文法マスター（全35レッスン）の総復習テストです。L1〜L34で学習したすべての文法項目から20問出題します。合格ライン：80点（16問/20問）。間違えた問題は必ず復習してください。

Đây là bài kiểm tra tổng hợp N2 Ngữ pháp Nâng Cao (35 bài). Có 20 câu từ tất cả các mục ngữ pháp đã học ở L1~L34. Điểm đậu: 80 điểm (16/20 câu). Hãy nhất định ôn lại những câu trả lời sai.`,
      keyPoints: [
        '全35レッスンからバランスよく出題',
        '合格ライン：80点（16問/20問正解）',
        '苦手項目：解説を読んで必ず復習',
        'JLPT N2本試験形式に近い出題パターン',
        'XP報酬：50XP（最高報酬）',
      ],
      vocabulary: [
        { word: '総復習', reading: 'そうふくしゅう', meaning: 'ôn tập tổng hợp tất cả', example: 'N2文法の総復習' },
        { word: '合格ライン', reading: 'ごうかくライン', meaning: 'điểm đậu, mức vượt qua', example: '合格ラインは80点' },
        { word: 'バランスよく', reading: 'バランスよく', meaning: 'cân bằng, đều đặn', example: 'バランスよく出題する' },
        { word: '本試験', reading: 'ほんしけん', meaning: 'kỳ thi thực tế', example: 'JLPT本試験' },
      ],
      dialogue: [
        { speaker: 'A', japanese: 'いよいよ総復習テストです。準備はいいですか？', reading: 'いよいよそうふくしゅうテストです。じゅんびはいいですか？', translation: 'Cuối cùng đến bài kiểm tra tổng hợp rồi. Đã sẵn sàng chưa?' },
        { speaker: 'B', japanese: 'はい！35レッスンを頑張って学習しました。', reading: 'はい！35レッスンをがんばってがくしゅうしました。', translation: 'Vâng! Tôi đã cố gắng học 35 bài.' },
        { speaker: 'A', japanese: '自信を持って取り組んでください。応援しています！', reading: 'じしんをもってとりくんでください。おうえんしています！', translation: 'Hãy tự tin mà làm nhé. Tôi cổ vũ bạn!' },
      ],
      examples: [
        { japanese: '問題例①：彼女の努力（　）、このプロジェクトは成功した。', reading: 'もんだいれいいち：かのじょのどりょくにほかならない、このプロジェクトはせいこうした。', translation: 'Ví dụ①: Thành công của dự án này chính là nhờ nỗ lực của cô ấy.' },
        { japanese: '問題例②：繁忙期（　）も、患者への対応は丁寧にすべきだ。', reading: 'もんだいれいに：はんぼうきにもかかわらず、かんじゃへのたいおうはていねいにすべきだ。', translation: 'Ví dụ②: Dù trong mùa bận rộn, cách ứng xử với bệnh nhân vẫn nên lịch sự.' },
        { japanese: '問題例③：長年の研究（　）に、ついに治療法が確立された。', reading: 'もんだいれいさん：ながねんのけんきゅうのすえに、ついにちりょうほうがかくりつされた。', translation: 'Ví dụ③: Sau nhiều năm nghiên cứu, cuối cùng phương pháp điều trị đã được xác lập.' },
      ],
      grammarNote: `【総復習テスト 対策のまとめ】

■ 逆接グループ（にもかかわらず・ものの・つつも・ながらも・とはいえ）
→ ニュアンスの強さ・場面に注意

■ 可能・義務グループ（べきだ・ざるを得ない・得る・かねない・かねる）
→ ポジネガ・書き言葉か口語かに注意

■ 程度・強調グループ（にほかならない・に過ぎない・どころか・はおろか）
→ 強調の方向（プラス・マイナス）に注意

■ 時間・条件グループ（次第・に際して・末に・あげくに・を機に）
→ 前後の文脈に注意

■ 複合格助詞（において・によって・をめぐって・に関して・に基づいて）
→ 文体・場面・意味の違いに注意`,
      quizzes: [
        {
          question: '「現場（　）は、理論だけでは通用しない部分がある。」の（　）は？',
          options: [
            { id: 'a', text: 'においては' },
            { id: 'b', text: 'に際しては' },
            { id: 'c', text: 'をめぐっては' },
            { id: 'd', text: 'に関しては' },
          ],
          correctId: 'a',
          explanation: '「現場という場所・状況においては（特に）」というニュアンスなので「においては」が正解。「においては」は特定の場面・状況を強調する形。 "おいては" nhấn mạnh tình huống cụ thể.',
          difficulty: 'hard' as const,
        },
        {
          question: '「経験を積む（　）、本当のプロになれる。」の（　）は？',
          options: [
            { id: 'a', text: 'てこそ' },
            { id: 'b', text: 'ことなく' },
            { id: 'c', text: 'ないまま' },
            { id: 'd', text: 'ものの' },
          ],
          correctId: 'a',
          explanation: '「経験を積むことが条件で、初めてプロになれる」という「てこそ」の意味が最適。 Điều kiện quan trọng "có...mới..." → "てこそ".',
          difficulty: 'medium' as const,
        },
        {
          question: '「長い議論（　）、最終的に合意に達した。」の（　）は？',
          options: [
            { id: 'a', text: 'の末に' },
            { id: 'b', text: 'のあげくに' },
            { id: 'c', text: 'をきっかけに' },
            { id: 'd', text: 'にわたって' },
          ],
          correctId: 'a',
          explanation: '「長い議論というプロセスの後、良い結果（合意）が出た」のでポジティブな「末に」が正解。 Sau quá trình, kết quả tốt → "末に".',
          difficulty: 'easy' as const,
        },
      ],
      xpReward: 50,
    },
  },


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
  'n3-01': ['n3-01', 'n3-01-2', 'n3-01-3', 'n3-01-4', 'n3-01-5', 'n3-01-6', 'n3-01-7', 'n3-01-8', 'n3-01-9', 'n3-01-10', 'n3-01-11', 'n3-01-12', 'n3-01-13', 'n3-01-14', 'n3-01-15', 'n3-01-16', 'n3-01-17', 'n3-01-18', 'n3-01-19', 'n3-01-20', 'n3-01-21', 'n3-01-22', 'n3-01-23', 'n3-01-24', 'n3-01-25', 'n3-01-26', 'n3-01-27', 'n3-01-28', 'n3-01-29', 'n3-01-30'],
  'n3-02': ['n3-02', 'n3-02-2', 'n3-02-3', 'n3-02-4', 'n3-02-5', 'n3-02-6', 'n3-02-7', 'n3-02-8', 'n3-02-9', 'n3-02-10', 'n3-02-11', 'n3-02-12', 'n3-02-13', 'n3-02-14', 'n3-02-15', 'n3-02-16', 'n3-02-17', 'n3-02-18', 'n3-02-19', 'n3-02-20'],
  'n3-03': ['n3-03', 'n3-03-2', 'n3-03-3', 'n3-03-4', 'n3-03-5', 'n3-03-6', 'n3-03-7', 'n3-03-8', 'n3-03-9', 'n3-03-10', 'n3-03-11', 'n3-03-12', 'n3-03-13', 'n3-03-14', 'n3-03-15', 'n3-03-16', 'n3-03-17', 'n3-03-18', 'n3-03-19', 'n3-03-20'],
  'n3-04': ['n3-04', 'n3-04-2', 'n3-04-3', 'n3-04-4', 'n3-04-5', 'n3-04-6', 'n3-04-7', 'n3-04-8', 'n3-04-9', 'n3-04-10', 'n3-04-11', 'n3-04-12', 'n3-04-13', 'n3-04-14', 'n3-04-15', 'n3-04-16', 'n3-04-17', 'n3-04-18'],
  'n2-01': ['n2-01', 'n2-01-2', 'n2-01-3', 'n2-01-4', 'n2-01-5', 'n2-01-6', 'n2-01-7', 'n2-01-8', 'n2-01-9', 'n2-01-10', 'n2-01-11', 'n2-01-12', 'n2-01-13', 'n2-01-14', 'n2-01-15', 'n2-01-16', 'n2-01-17', 'n2-01-18', 'n2-01-19', 'n2-01-20', 'n2-01-21', 'n2-01-22', 'n2-01-23', 'n2-01-24', 'n2-01-25', 'n2-01-26', 'n2-01-27', 'n2-01-28', 'n2-01-29', 'n2-01-30', 'n2-01-31', 'n2-01-32', 'n2-01-33', 'n2-01-34', 'n2-01-35'],
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
  'n3-01':    { ja: '複合助詞〜に対して・〜について', vi: 'Trợ từ phức hợp' },
  'n3-01-2':  { ja: '〜ながら（同時・逆接）', vi: '〜ながら（Đồng thời/Nghịch lý）' },
  'n3-01-3':  { ja: '〜ばかり・だけ・しか〜ない', vi: 'Giới hạn: ばかり・だけ・しか' },
  'n3-01-4':  { ja: '推量: ようだ・らしい・そうだ', vi: 'Suy đoán: ようだ・らしい・そうだ' },
  'n3-01-5':  { ja: '〜てしまう（完了・後悔）', vi: '〜てしまう（Hoàn thành/Hối tiếc）' },
  'n3-01-6':  { ja: 'ことになる vs ことにする', vi: 'ことになる vs ことにする' },
  'n3-01-7':  { ja: 'ことがある・ことになっている', vi: 'Thói quen & Quy định' },
  'n3-01-8':  { ja: '〜のに（逆接）/ 〜くせに', vi: '〜のに / 〜くせに' },
  'n3-01-9':  { ja: '〜ために vs 〜ように（目的）', vi: 'ために vs ように（Mục đích）' },
  'n3-01-10': { ja: '〜てから・た後で・前に', vi: 'Quan hệ trước sau thời gian' },
  'n3-01-11': { ja: '〜ても / 〜たとしても（譲歩）', vi: 'Nhượng bộ & Giả định' },
  'n3-01-12': { ja: '〜てみる・ておく・ていく・てくる', vi: 'Trợ động từ' },
  'n3-01-13': { ja: '間接疑問〜かどうか・〜か', vi: 'Câu hỏi gián tiếp' },
  'n3-01-14': { ja: '〜と思う・と言われている', vi: 'Trích dẫn & Ý kiến' },
  'n3-01-15': { ja: '受身形 〜られる（3種類）', vi: 'Thể bị động 3 loại' },
  'n3-01-16': { ja: '使役〜させる / 使役受身', vi: 'Thể sai khiến & Bị động sai khiến' },
  'n3-01-17': { ja: 'ば〜ほど・につれて・とともに', vi: 'Tỷ lệ & Biến đổi' },
  'n3-01-18': { ja: '〜はずだ / 〜はずがない', vi: 'Đương nhiên / Không thể nào' },
  'n3-01-19': { ja: '〜わけだ・わけがない・わけにはいかない', vi: 'わけ 3 cách dùng' },
  'n3-01-20': { ja: '〜にちがいない・のではないか', vi: 'Mức độ chắc chắn' },
  'n3-01-21': { ja: '複合動詞①（直す・続ける・始める）', vi: 'Động từ phức hợp①' },
  'n3-01-22': { ja: '変化動詞（回復・低下・増加・減少）', vi: 'Động từ thay đổi' },
  'n3-01-23': { ja: '形容詞・副詞（適切・十分・すでに）', vi: 'Tính từ & Phó từ' },
  'n3-01-24': { ja: '漢語名詞（状態・報告・確認・記録）', vi: 'Danh từ Hán-Nhật y tế' },
  'n3-01-25': { ja: '接続詞（したがって・ただし・なお）', vi: 'Liên từ N3' },
  'n3-01-26': { ja: 'カタカナ語（医療・介護）', vi: 'Từ ngoại lai y tế/điều dưỡng' },
  'n3-01-27': { ja: '重要語彙①（名詞・動詞）', vi: 'Từ vựng quan trọng①' },
  'n3-01-28': { ja: '重要語彙②（形容詞・副詞・敬語）', vi: 'Từ vựng quan trọng②' },
  'n3-01-29': { ja: '文法まとめ練習問題', vi: 'Bài tập tổng hợp' },
  'n3-01-30': { ja: '総復習テスト（20問）', vi: 'Kiểm tra tổng hợp（20 câu）' },
  'n3-02':    { ja: '説明文の構造を読む', vi: 'Cấu trúc văn bản thông tin' },
  'n3-02-2':  { ja: '新聞記事の読み方基礎', vi: 'Cơ bản đọc báo' },
  'n3-02-3':  { ja: '指示語の理解', vi: 'Hiểu từ chỉ định' },
  'n3-02-4':  { ja: '接続詞で流れを読む', vi: 'Đọc luồng qua liên từ' },
  'n3-02-5':  { ja: '筆者の主張と根拠', vi: 'Luận điểm & Lý do' },
  'n3-02-6':  { ja: '比較・対比の文章', vi: 'So sánh & Đối chiếu' },
  'n3-02-7':  { ja: '数字・データの文章', vi: 'Số liệu & Dữ liệu' },
  'n3-02-8':  { ja: '原因・理由の表現', vi: 'Nguyên nhân & Lý do' },
  'n3-02-9':  { ja: '結果・影響の表現', vi: 'Kết quả & Ảnh hưởng' },
  'n3-02-10': { ja: '医療・健康の説明文', vi: 'Y tế & Sức khỏe' },
  'n3-02-11': { ja: '社会問題の記事', vi: 'Vấn đề xã hội' },
  'n3-02-12': { ja: '科学・技術の説明文', vi: 'Khoa học & Công nghệ' },
  'n3-02-13': { ja: '生活・習慣のコラム', vi: 'Cột báo cuộc sống' },
  'n3-02-14': { ja: '統計・調査報告を読む', vi: 'Báo cáo thống kê' },
  'n3-02-15': { ja: '条件・例外の文章', vi: 'Điều kiện & Ngoại lệ' },
  'n3-02-16': { ja: '伝統・文化の説明文', vi: 'Truyền thống & Văn hóa' },
  'n3-02-17': { ja: '環境・自然の記事', vi: 'Môi trường & Tự nhiên' },
  'n3-02-18': { ja: '長文読解①新聞記事', vi: 'Văn dài①Bài báo' },
  'n3-02-19': { ja: '長文読解②説明文', vi: 'Văn dài②Văn thông tin' },
  'n3-02-20': { ja: '総復習テスト', vi: 'Kiểm tra tổng hợp' },
  'n3-03':    { ja: '長い会話と場面理解', vi: 'Hội thoại dài & Hiểu bối cảnh' },
  'n3-03-2':  { ja: '電話・アナウンス聴解', vi: 'Điện thoại & Thông báo' },
  'n3-03-3':  { ja: '申し送り・報告を聞く', vi: 'Bàn giao ca & Báo cáo' },
  'n3-03-4':  { ja: '感情・意図・ニュアンス', vi: 'Cảm xúc & Sắc thái' },
  'n3-03-5':  { ja: '数字・日程・スケジュール', vi: 'Số liệu & Lịch trình' },
  'n3-03-6':  { ja: '指示・依頼・提案の区別', vi: 'Chỉ thị / Nhờ vả / Đề xuất' },
  'n3-03-7':  { ja: '会議・カンファレンス', vi: 'Hội họp & Conference' },
  'n3-03-8':  { ja: 'ニュース・施設アナウンス', vi: 'Tin tức & Thông báo cơ sở' },
  'n3-03-9':  { ja: '省略・縮約形・話し言葉', vi: 'Dạng rút gọn & Ngôn ngữ nói' },
  'n3-03-10': { ja: '情報統合・複数情報の処理', vi: 'Tổng hợp nhiều thông tin' },
  'n3-03-11': { ja: '速読①スキャニング', vi: 'Đọc nhanh①Scanning' },
  'n3-03-12': { ja: '速読②スキミング', vi: 'Đọc nhanh②Skimming' },
  'n3-03-13': { ja: '速読③接続詞で流れを読む', vi: 'Đọc nhanh③Liên từ' },
  'n3-03-14': { ja: '速読④主題・要点の抽出', vi: 'Đọc nhanh④Chủ đề & Điểm chính' },
  'n3-03-15': { ja: '長文速読①説明文・医療文書', vi: 'Văn dài①Thông tin y tế' },
  'n3-03-16': { ja: '長文速読②記事・意見文', vi: 'Văn dài②Bài báo & Ý kiến' },
  'n3-03-17': { ja: '複合演習①聴解＋速読', vi: 'Tổng hợp①Nghe & Đọc nhanh' },
  'n3-03-18': { ja: '複合演習②時間管理速読', vi: 'Tổng hợp②Quản lý thời gian' },
  'n3-03-19': { ja: 'N3模擬演習（本番形式）', vi: 'N3 Luyện thi thử' },
  'n3-03-20': { ja: '総復習テスト（20問）', vi: 'Kiểm tra tổng hợp（20 câu）' },
  'n3-04':    { ja: '医療・介護のカタカナ語', vi: 'Từ Katakana y tế & điều dưỡng' },
  'n3-04-2':  { ja: '生活・職場のカタカナ語', vi: 'Từ Katakana cuộc sống & việc làm' },
  'n3-04-3':  { ja: 'カタカナ語の変換ルール', vi: 'Quy tắc chuyển đổi Katakana' },
  'n3-04-4':  { ja: '複合動詞①出す・込む・上げる', vi: 'Động từ ghép①出す・込む・上げる' },
  'n3-04-5':  { ja: '複合動詞②切る・続ける・直す', vi: 'Động từ ghép②切る・続ける・直す' },
  'n3-04-6':  { ja: '複合動詞③合う・かける・始める', vi: 'Động từ ghép③合う・かける・始める' },
  'n3-04-7':  { ja: '擬態語①体の症状', vi: 'Từ tượng hình①Triệu chứng cơ thể' },
  'n3-04-8':  { ja: '擬態語②気持ち・様子', vi: 'Từ tượng hình②Cảm xúc & Trạng thái' },
  'n3-04-9':  { ja: '接尾語 〜的・〜化・〜性', vi: 'Hậu tố 〜的・〜化・〜性' },
  'n3-04-10': { ja: '接頭語 不〜・非〜・再〜・未〜', vi: 'Tiền tố 不〜・非〜・再〜・未〜' },
  'n3-04-11': { ja: '同音異義語', vi: 'Từ đồng âm dị nghĩa' },
  'n3-04-12': { ja: '類義語の使い分け', vi: 'Phân biệt từ đồng nghĩa' },
  'n3-04-13': { ja: '対義語（反対語）', vi: 'Từ trái nghĩa' },
  'n3-04-14': { ja: '慣用句①体を使った表現', vi: 'Thành ngữ①Bộ phận cơ thể' },
  'n3-04-15': { ja: '慣用句②動物・自然・日常', vi: 'Thành ngữ②Động vật & Tự nhiên' },
  'n3-04-16': { ja: '重要語彙①動詞・名詞100語', vi: 'Từ vựng quan trọng①Động từ & Danh từ' },
  'n3-04-17': { ja: '重要語彙②形容詞・副詞80語', vi: 'Từ vựng quan trọng②Tính từ & Phó từ' },
  'n3-04-18': { ja: '総復習テスト（20問）', vi: 'Kiểm tra tổng hợp（20 câu）' },
  'n2-01':    { ja: '〜にもかかわらず/〜にかかわらず', vi: 'にもかかわらず/にかかわらず' },
  'n2-01-2':  { ja: '〜をめぐって・〜をめぐる', vi: 'をめぐって・をめぐる' },
  'n2-01-3':  { ja: '〜に基づいて・〜に基づく', vi: 'に基づいて・に基づく' },
  'n2-01-4':  { ja: '〜によって（手段・原因・違い）', vi: 'によって（手段・原因）' },
  'n2-01-5':  { ja: '〜として・〜としては', vi: 'として・としては' },
  'n2-01-6':  { ja: '〜に関して・〜に関する', vi: 'に関して・に関する' },
  'n2-01-7':  { ja: '〜において・〜においては', vi: 'において・においては' },
  'n2-01-8':  { ja: '〜とともに・〜に伴って', vi: 'とともに・に伴って' },
  'n2-01-9':  { ja: '〜を通じて・〜を通して', vi: 'を通じて・を通して' },
  'n2-01-10': { ja: '〜にわたって・〜にわたる', vi: 'にわたって・にわたる' },
  'n2-01-11': { ja: '〜上（じょう）で・〜うえで', vi: '〜上（じょう）で' },
  'n2-01-12': { ja: '〜にほかならない', vi: 'にほかならない' },
  'n2-01-13': { ja: '〜に過ぎない・〜に過ぎなかった', vi: 'に過ぎない' },
  'n2-01-14': { ja: '〜どころか', vi: 'どころか' },
  'n2-01-15': { ja: '〜ものの・〜とはいえ', vi: 'ものの・とはいえ' },
  'n2-01-16': { ja: '〜つつ(も)・〜ながらも', vi: 'つつも・ながらも' },
  'n2-01-17': { ja: '〜かねない・〜かねる', vi: 'かねない・かねる' },
  'n2-01-18': { ja: '〜得る(うる/える)・〜得ない', vi: '得る・得ない' },
  'n2-01-19': { ja: '〜べき・〜べきだ・〜べきではない', vi: 'べきだ・べきではない' },
  'n2-01-20': { ja: '〜ざるを得ない', vi: 'ざるを得ない' },
  'n2-01-21': { ja: '〜ずにはいられない', vi: 'ずにはいられない' },
  'n2-01-22': { ja: '〜ことなく・〜ないまま', vi: 'ことなく・ないまま' },
  'n2-01-23': { ja: '〜に際して・〜に際し', vi: 'に際して・に際し' },
  'n2-01-24': { ja: '〜を機に・〜をきっかけに', vi: 'を機に・をきっかけに' },
  'n2-01-25': { ja: '〜次第（しだい）・〜次第で', vi: '次第・次第で' },
  'n2-01-26': { ja: '〜末（すえ）に・〜あげくに', vi: '末に・あげくに' },
  'n2-01-27': { ja: '〜ぬきで・〜ぬきには', vi: 'ぬきで・ぬきには' },
  'n2-01-28': { ja: '〜を問わず・〜いかんにかかわらず', vi: 'を問わず' },
  'n2-01-29': { ja: '〜はもとより・〜はおろか', vi: 'はもとより・はおろか' },
  'n2-01-30': { ja: '〜からこそ・〜てこそ', vi: 'からこそ・てこそ' },
  'n2-01-31': { ja: '〜ばかりでなく・〜のみならず', vi: 'ばかりでなく・のみならず' },
  'n2-01-32': { ja: '〜ことから・〜ことで', vi: 'ことから・ことで' },
  'n2-01-33': { ja: '複合助詞まとめ（に対して・に応じて）', vi: 'Tổng hợp trợ từ phức hợp' },
  'n2-01-34': { ja: '総合練習問題', vi: 'Bài tập tổng hợp' },
  'n2-01-35': { ja: '総復習テスト（20問）', vi: 'Kiểm tra tổng hợp（20 câu）' },
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
