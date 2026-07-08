'use client';

import React, { useState } from 'react';
import { Calendar, Layers, FileText, Play, CheckCircle, RefreshCw, Settings, User } from 'lucide-react';

type Tone = 'executive' | 'analytical' | 'standard';

export default function DashboardPage() {
  const [startDate, setStartDate] = useState('2026-07-06');
  const [endDate, setEndDate] = useState('2026-07-10');
  const [tone, setTone] = useState<Tone>('standard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportMarkdown, setReportMarkdown] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [docUrl, setDocUrl] = useState<string | null>(null);

  const challengeText = "1. AI活用・DX推進による生産性向上（DOMO予実乖離6%未満、Salesforceログイン率80%維持）\n2. 次期中期経営計画の立案・策定（2027年3月末までの取締役会承認）\n3. 企画部業務のマルチJOB化対応（有澤社員へのOJT、拠点管理業務の実務プロセス習得）";
  const divisionText = "1. 経営企画関連業務（経営戦略策定、年度予算編成・進捗管理）\n2. 広報関連業務（社内・グループ内広報企画）\n3. 拠点・設備・許認可管理業務（拠点戦略立案・合理化、施設管理最適化）";

  const mockReports: Record<Tone, string> = {
    standard: `## 1. 今週の主要成果と進捗（目標対比）

- **【AI活用・DX推進による生産性向上】（分掌：経営指標モニタリング）**
  - **Domo連携の進展:** OP統括部との連携により、営業フォアキャスト数値にOP統括部側のデータを反映させるDOMOダッシュボードが一次開通。全社で同一データに基づく「粗利益予実乖離率6%未満」の維持に向けた一元監視インフラが整備されました。
  - **Salesforce定着化:** 営業推進部との合同定例会を実施。KPIである「月間平均ログイン率80%以上」の維持、および「AI活動サマリ」等3機能の浸透に向けて、活用率のモニタリングと現場へのフォローアップ体制を継続強化しています。

- **【次期中期経営計画の立案・策定】（分掌：経営戦略・事業戦略の策定）**
  - **部門間サイロ化の解消アプローチ:** 次期中計策定スケジュールに沿って、各部門長への個別ヒアリングを開始。「部門間の情報サイロ化」という期首からの課題に対し、直接の意見交換を通じて納得感のある合意形成（納得感の醸成）の土台作りを丁寧に進めました。

- **【企画部業務のマルチJOB化対応】（分掌：拠点管理 / 社員教育）**
  - **有澤社員へのOJT（育成）:** 経営推進会議資料（MSL資料）の作成プロセス、および株主総会想定問答の初版作成について実務引継ぎとOJTを実施。有澤社員自身による起案・作成が進んでおり、100%単独遂行（独り立ち）に向け順調に進捗しています。
  - **拠点・設備実務の習得（自己スキルアップ）:** 森本課長へ同行し、オリックス高槻拠点の新規賃貸契約に関する法務打合せに参加。契約の判断基準に関する実務プロセスのインプットを行いました。

## 2. 発生した課題・ボトルネックと対策

- **中計策定における未検討事項の取扱:**
  部門長ヒアリングにおいて、一部部門で現行ゴールとの乖離が大きく、調整に時間を要する見込み。次週も個別フォローの時間を追加で確保し、スケジュール遅延を防ぎます。

## 3. 翌週の重点アクションプラン

- **DX推進:** Salesforceの3機能の具体的な活用率データを抽出し、定着が遅れているメンバーへのピンポイント支援策を営業推進部と策定する。
- **マルチJOB化:** 有澤社員よりレビュー依頼のあった株主総会想定問答の添削を完了させ、ステークホルダー調整能力のさらなる向上を促す。`,

    executive: `## 1. 経営視点における最重要成果（Executive Summary）

- **DXインフラ開通による予実乖離リスクの低減**
  OP統括部とのデータ統合が完了し、Domo上での営業フォアキャスト一元監視画面が稼働。これにより、粗利益予実乖離率を目標値（6%未満）に抑え込むためのデータドリブンな意思決定基盤が整いました。
- **次期中計策定に向けた部門長合意形成の開始**
  部門間の情報サイロ化を解消すべく、各部門長への個別ヒアリングを開始。2027年3月の取締役会承認に向け、マイルストーン通りに進捗中。
- **企画部コア業務の冗長化（有澤社員OJT）**
  MSL経営推進資料および株主総会想定問答の作成について、有澤社員への実務移管（独り立ち率50%）を達成。組織のマルチJOB化を推進。

## 2. 翌週の重点リスク・マネジメント

- **部門間調整の加速:** 一部部門長とのゴール乖離を早期に収束させるため、次週個別フォローセッションを追加設定。`,

    analytical: `## 1. 定量データ分析および進捗評価（KPIベース）

- **AI活用・DX推進メトリクス**
  - **Domoシステム:** OP統括部予測データのDOMO統合完了（進捗率100%）。中間見込み粗利益予実乖離率：現在5.8%で推移（目標6%未満をクリア）。
  - **Salesforce活用率:** 対象営業メンバーの月間平均ログイン率：82.3%（目標80%以上を維持）。「AI活動サマリ」の利用率に部門間格差があるため、次週要因分析を実施。
- **マルチJOB化・教育進捗率**
  - 有澤社員の単独完遂度：MSL資料作成（70%）、株主総会想定問答作成（40%）。目標とする「上司サポートなき100%単独遂行」に向け、残存課題をスキルマップ化。
- **拠点管理業務プロセス**
  - オリックス高槻（新規）：法務打合せ完了、契約リスク抽出率100%。
  - 日本ロジ習志野Ⅱ（更新）：次週より事前データ分析フェーズへ移行。

## 2. ボトルネック分析

- 部門長ヒアリングにおいて、特定部門のデータサイロ化スコアが依然として高い。定性的な抵抗要因を分析し、中計策定スケジュールへの影響度を算出中。`
  };

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setReportMarkdown('');
    setDocUrl(null);

    let fullText = mockReports[tone];
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setReportMarkdown((prev) => prev + fullText.charAt(currentIndex));
        currentIndex += 2;
      } else {
        clearInterval(interval);
        setIsGenerating(false);
      }
    }, 10);
  };

  const handleExportToDrive = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setDocUrl('https://docs.google.com/document/d/1_example_id_weekly_report/edit');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
              AI Weekly Report Copilot <span className="text-xs text-slate-500 font-mono">v1.0.0-prod</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">企画部マネージャー：藤島 貴志 様 専用ワークスペース</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300">
            <User className="w-4 h-4 text-teal-400" /> 等級: MG (Manager)
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 space-y-3">
              <h3 className="text-xs font-bold text-teal-400 tracking-wider uppercase flex items-center gap-1">
                <Settings className="w-3.5 h-3.5" /> 登録済みチャレンジ
              </h3>
              <p className="text-xs text-slate-400 whitespace-pre-line leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 font-mono">{challengeText}</p>
            </div>
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 space-y-3">
              <h3 className="text-xs font-bold text-blue-400 tracking-wider uppercase flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> 登録済み事務分掌
              </h3>
              <p className="text-xs text-slate-400 whitespace-pre-line leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 font-mono">{divisionText}</p>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-teal-400" /> 対象期間
                </label>
                <div className="flex gap-1">
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-400 w-full font-mono" />
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-400 w-full font-mono" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-blue-400" /> レポートトーン
                </label>
                <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700">
                  {(['standard', 'executive', 'analytical'] as Tone[]).map((t) => (
                    <button key={t} onClick={() => setTone(t)} className={`py-1 text-[10px] font-bold rounded transition-all capitalize ${tone === t ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-end">
                <button onClick={handleGenerateReport} disabled={isGenerating} className="w-full bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-300 hover:to-blue-400 text-slate-950 font-extrabold py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-teal-500/10 text-xs disabled:opacity-50">
                  {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  {isGenerating ? 'ストリーミング解析中...' : '週報を生成する'}
                </button>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 md:p-6 min-h-[400px] flex flex-col justify-between shadow-inner">
              <div className="overflow-y-auto max-h-[450px]">
                {reportMarkdown ? (
                  <textarea value={reportMarkdown} onChange={(e) => setReportMarkdown(e.target.value)} className="w-full h-[380px] bg-transparent text-slate-200 font-mono text-xs md:text-sm border-0 focus:ring-0 resize-none focus:outline-none leading-relaxed" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-[350px] text-slate-600 space-y-2">
                    <FileText className="w-10 h-10 stroke-[1]" />
                    <p className="text-xs">カレンダー・メールデータをマージして週報を組み立てます</p>
                  </div>
                )}
              </div>

              {reportMarkdown && (
                <div className="border-t border-slate-900 pt-4 mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <span className="text-[10px] text-slate-600 font-mono">※生成された内容は直接エディタ上で修正可能です</span>
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    {docUrl && (
                      <a href={docUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-400 hover:underline flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Google Docs を開く
                      </a>
                    )}
                    <button onClick={handleExportToDrive} disabled={isExporting} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700 disabled:opacity-50 w-full sm:w-auto justify-center">
                      {isExporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                      Google Driveへ格納
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}