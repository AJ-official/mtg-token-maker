"use client";

import React, { useRef, useState } from "react";
import CardPreview from "@/components/CardPreview";
import BottomSheet from "@/components/BottomSheet";
import Step1CardType from "@/components/steps/Step1CardType";
import Step2Frame from "@/components/steps/Step2Frame";
import Step3Illustration from "@/components/steps/Step3Illustration";
import Step4Text from "@/components/steps/Step4Text";
import Step5Save from "@/components/steps/Step5Save";
import { useCardState } from "@/hooks/useCardState";
import { CardType, ManaSlot } from "@/types/card";

const TOTAL_STEPS = 5;
type Tab = "token" | "manual" | "credit";

export default function Home() {
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>("token");
  const previewRef = useRef<HTMLDivElement>(null);
  const {
    card,
    setCardType,
    setFrameId,
    setIllustrationId,
    setTitle,
    setSubtype,
    setCardText,
    setPower,
    setToughness,
    setLoyalty,
    setShowMana,
    setManaTypes,
    setShowSymbol,
  } = useCardState();

  const DUNGEON_SKIP = [2, 4];

  const handleNext = () => {
    setStep((s) => {
      let next = s + 1;
      if (card.cardType === "dungeon") {
        while (DUNGEON_SKIP.includes(next) && next <= TOTAL_STEPS) next++;
      }
      return Math.min(TOTAL_STEPS, next);
    });
  };

  const handlePrev = () => {
    setStep((s) => {
      let prev = s - 1;
      if (card.cardType === "dungeon") {
        while (DUNGEON_SKIP.includes(prev) && prev >= 1) prev--;
      }
      return Math.max(1, prev);
    });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1CardType
            selected={card.cardType}
            onSelect={(type: CardType) => {
              setCardType(type);
              setStep((s) => {
                let next = s + 1;
                if (type === "dungeon") {
                  while (DUNGEON_SKIP.includes(next) && next <= TOTAL_STEPS) next++;
                }
                return Math.min(TOTAL_STEPS, next);
              });
            }}
          />
        );
      case 2:
        return (
          <Step2Frame
            selected={card.frameId}
            cardType={card.cardType}
            onSelect={(id) => setFrameId(id)}
          />
        );
      case 3:
        return (
          <Step3Illustration
            selected={card.illustrationId}
            cardType={card.cardType}
            onSelect={(id) => setIllustrationId(id)}
          />
        );
      case 4:
        return (
          <Step4Text
            card={card}
            onTitleChange={setTitle}
            onSubtypeChange={setSubtype}
            onCardTextChange={setCardText}
            onPowerChange={setPower}
            onToughnessChange={setToughness}
            onLoyaltyChange={setLoyalty}
            onShowManaChange={setShowMana}
            onManaTypesChange={(v: ManaSlot[]) => setManaTypes(v)}
            onShowSymbolChange={setShowSymbol}
          />
        );
      case 5:
        return <Step5Save card={card} />;
      default:
        return null;
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "token",  label: "トークン制作" },
    { id: "manual", label: "マニュアル" },
    { id: "credit", label: "クレジット" },
  ];

  return (
    <main className="flex justify-center bg-gray-100 min-h-screen">
      <div className="w-full max-w-[390px] flex flex-col min-h-screen">

        {/* タブバー */}
        <div className="flex bg-white border-b border-gray-200 flex-shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-amber-500 border-b-2 border-amber-500"
                  : "text-gray-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* トークン制作タブ */}
        {activeTab === "token" && (
          <>
            <div className="p-3 flex-shrink-0">
              <CardPreview card={card} previewRef={previewRef} />
            </div>
            <div className="flex-1 flex flex-col">
              <BottomSheet
                currentStep={step}
                totalSteps={TOTAL_STEPS}
                onPrev={handlePrev}
                onNext={handleNext}
              >
                {renderStep()}
              </BottomSheet>
            </div>
          </>
        )}

        {/* マニュアルタブ */}
        {activeTab === "manual" && (
          <div className="flex-1 overflow-y-auto pb-6">
            {/* イントロ */}
            <div className="bg-white mx-3 mt-3 rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-gray-700 leading-relaxed">
                　『エージェイのトークン屋さん』は、マジック：ザ・ギャザリングのオリジナルトークンカードを簡単に制作できる無料のウェブアプリなのだ。
              </p>
              <p className="text-sm text-gray-700 leading-relaxed mt-2">
                　5つのステップでトークンカードの画像を簡単に作成できるのだ。みんな、バリバリ作るのだ！
              </p>
            </div>

            {/* STEP 1 */}
            <div className="bg-white mx-3 mt-3 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-amber-500 mb-1">STEP 1：カードの種類</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-2">
                　作成したいトークンの種類を選択してください。
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>⚔️ クリーチャー</li>
                <li>✨ プレインズウォーカー</li>
                <li>🌀 エンチャント</li>
                <li>⚙️ アーティファクト</li>
                <li>🏔️ 土地</li>
                <li>🛡️ 紋章</li>
                <li>🗝️ ダンジョン<span className="text-gray-400 text-xs ml-1">（STEP 2・4 が省略されます）</span></li>
              </ul>
            </div>

            {/* STEP 2 */}
            <div className="bg-white mx-3 mt-3 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-amber-500 mb-1">STEP 2：フレーム</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                　選択したトークンの種類に応じて利用可能なフレームが表示されます。例えば、クリーチャーはP/T枠つき、プレインズウォーカーは忠誠度枠つきのフレームが表示されます。
              </p>
            </div>

            {/* STEP 3 */}
            <div className="bg-white mx-3 mt-3 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-amber-500 mb-1">STEP 3：イラスト</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                　カードに表示するイラストを選択します。用意されたイラストの中からお好みのものを選んでください。選択したイラストはカードプレビューに即座に反映されます。
              </p>
            </div>

            {/* STEP 4 */}
            <div className="bg-white mx-3 mt-3 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-amber-500 mb-2">STEP 4：テキスト</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                　カードの詳細情報を入力します。入力フィールドは選択したカードの種類によって異なります。
              </p>
              <ul className="text-sm text-gray-700 space-y-2">
                <li><span className="font-medium">カード名</span>：トークンカードの名前を入力します。</li>
                <li><span className="font-medium">カードタイプ</span>：カードのタイプ（例：クリーチャー ― エルフ・ドルイド）を入力します。</li>
                <li><span className="font-medium">カードテキスト</span>：カードの効果や能力を記述します。</li>
                <li><span className="font-medium">パワー / タフネス</span>：クリーチャーの場合に入力します。</li>
                <li><span className="font-medium">忠誠度</span>：プレインズウォーカーの場合に入力します。</li>
              </ul>
              <p className="text-sm text-gray-700 leading-relaxed mt-3">
                　「シンボルを表示」や「マナコストを表示」のトグルで、アーティストのサインやマナコスト（6桁まで）の表示を切り替えられます。
              </p>
            </div>

            {/* STEP 5 */}
            <div className="bg-white mx-3 mt-3 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-amber-500 mb-2">STEP 5：保存</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                　作成したトークンの画像を保存します。
              </p>
              <ul className="text-sm text-gray-700 space-y-3">
                <li>
                  <span className="font-medium">トークンを画像として保存</span><br />
                  <span className="text-gray-600">　PNG画像（1260×1760px）としてデバイスに保存します。</span>
                </li>
                <li>
                  <span className="font-medium">コンビニ印刷用W保存</span><br />
                  <span className="text-gray-600">　コンビニのマルチコピー機でL判写真として印刷できる画像を保存します。マジック：ザ・ギャザリングのカードと同じ比率で印刷できます。スマホとコンビニさえあればトークンカードを用意できます（マルチコピー機のアプリは別途ダウンロードしてください）。</span>
                </li>
              </ul>
              <p className="text-sm text-gray-500 leading-relaxed mt-3">
                　保存ボタンを押してもダウンロードが開始されない場合は、画面の指示に従って「画像長押し」で保存してください。
              </p>
            </div>

            {/* フッター */}
            <div className="bg-white mx-3 mt-3 rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-gray-700 leading-relaxed">
                　これから毎月、『エージェイのトークン屋さん』で利用可能なイラストを追加していく予定です。お楽しみください。
              </p>
              <p className="text-sm text-gray-700 leading-relaxed mt-2">
                　このアプリが、あなたのマジックライフの一助となれば幸いです。
              </p>
            </div>
          </div>
        )}

        {/* クレジットタブ */}
        {activeTab === "credit" && (
          <div className="flex-1 overflow-y-auto pb-6">
            <div className="bg-white mx-3 mt-3 rounded-2xl p-5 shadow-sm">
              {/* A.J. プロフィール */}
              <div className="flex items-center gap-4 mb-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/aj_icon.jpg"
                  alt="A.J."
                  className="w-20 h-20 rounded-full object-cover flex-shrink-0"
                />
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">アプリ制作者</p>
                  <p className="text-base font-bold text-gray-800">A.J.</p>
                </div>
              </div>

              {/* リンク */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-xs w-12 flex-shrink-0">X</span>
                  <a
                    href="https://x.com/JanadoNovel"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-amber-500 underline break-all"
                  >
                    @JanadoNovel
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-xs w-12 flex-shrink-0">BOOTH</span>
                  <a
                    href="https://ajofficial.booth.pm/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-amber-500 underline break-all"
                  >
                    ajofficial.booth.pm
                  </a>
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-5 leading-relaxed">
                A.J.やアプリへのご感想・ご連絡などはXのDMまでお願いします。
              </p>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
