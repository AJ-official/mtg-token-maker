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
  const [showOpening, setShowOpening] = useState(true);
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>("token");

  React.useEffect(() => {
    const timer = setTimeout(() => setShowOpening(false), 2000);
    return () => clearTimeout(timer);
  }, []);
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

  const SKIP_STEPS = [2, 4];
  const SKIP_TYPES = ["dungeon", "counter"];

  const handleNext = () => {
    setStep((s) => {
      let next = s + 1;
      if (SKIP_TYPES.includes(card.cardType)) {
        while (SKIP_STEPS.includes(next) && next <= TOTAL_STEPS) next++;
      }
      return Math.min(TOTAL_STEPS, next);
    });
  };

  const handlePrev = () => {
    setStep((s) => {
      let prev = s - 1;
      if (SKIP_TYPES.includes(card.cardType)) {
        while (SKIP_STEPS.includes(prev) && prev >= 1) prev--;
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
                if (SKIP_TYPES.includes(type)) {
                  while (SKIP_STEPS.includes(next) && next <= TOTAL_STEPS) next++;
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

  if (showOpening) {
    return (
      <main
        className="flex justify-center items-start pt-[8vh] md:items-center md:pt-0 bg-gray-100 min-h-screen cursor-pointer"
        onClick={() => setShowOpening(false)}
      >
        <img
          src="/opening.png"
          alt="エージェイのトークン屋さん"
          className="w-full md:h-screen md:w-auto md:object-contain"
        />
      </main>
    );
  }

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
              <img src="/logo.png" alt="エージェイのトークン屋さん" className="w-full mb-4" />
              <p className="text-sm text-gray-700 leading-relaxed">
                　5つのステップでオリジナルトークンカードを制作できるウェブアプリです。画像をスマホに表示させて簡易的にトークンとして使用したり、印刷してゲームに使用することができます。
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
                <li>🎲 カウンター<span className="text-gray-400 text-xs ml-1">（STEP 2・4 が省略されます）</span></li>
              </ul>
            </div>

            {/* STEP 2 */}
            <div className="bg-white mx-3 mt-3 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-amber-500 mb-1">STEP 2：フレーム</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                　選択したトークンの種類に応じて利用可能なフレームが表示されます。例えば、クリーチャーはP/T枠つき、プレインズウォーカーは忠誠度枠つきのフレームが表示されます。
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/manual/manual_step2.png" alt="STEP2フレーム選択例" className="w-full" />
            </div>

            {/* STEP 3 */}
            <div className="bg-white mx-3 mt-3 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-amber-500 mb-1">STEP 3：イラスト</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                　カードに表示するイラストを選択します。用意されたイラストの中からお好みのものを選んでください。選択したイラストはカードプレビューに即座に反映されます。
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/manual/manual_step3.png" alt="STEP3イラスト選択例" className="w-full" />
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
              {/* ロゴ */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="エージェイのトークン屋さん" className="w-full mb-4" />
              {/* アイコン（中央揃え・大） */}
              <div className="flex justify-center mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/aj_icon.jpg"
                  alt="A.J."
                  className="w-36 h-36 rounded-full object-cover"
                />
              </div>

              {/* アプリ制作者 A.J.（中央揃え） */}
              <div className="flex items-baseline justify-center gap-2 mb-4">
                <span className="text-sm text-gray-400">アプリ制作者</span>
                <span className="text-2xl font-bold text-gray-800">A.J.</span>
              </div>

              {/* X と BOOTH を横並び */}
              <div className="flex items-center justify-center gap-6 mb-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-gray-400">X</span>
                  <a
                    href="https://x.com/JanadoNovel"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-amber-500 underline"
                  >
                    @JanadoNovel
                  </a>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-gray-400">BOOTH</span>
                  <a
                    href="https://ajofficial.booth.pm/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-amber-500 underline"
                  >
                    ajofficial.booth.pm
                  </a>
                </div>
              </div>

              <p className="text-sm text-gray-400 leading-relaxed">
                　アプリへのご感想やA.J.へのご連絡などはXのDMまでお願いします。
              </p>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
