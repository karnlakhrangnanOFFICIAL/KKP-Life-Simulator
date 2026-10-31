import React, { useEffect, useMemo, useState } from 'react';
import {
  HOUSE_TOTAL_SEATS,
  MAJORITY_THRESHOLD_SEATS,
  MINISTRY_PORTFOLIOS,
  PoliticsEngine,
} from '../core/politics_engine';
import {
  IdeologyBloc,
  MinistryId,
  ParliamentaryBillType,
  PlayerData,
} from '../engine/types';
import { Check, Landmark, Lock, Scale, Search, Users, Vote } from 'lucide-react';

interface PoliticsParliamentViewProps {
  player: PlayerData;
  onJoinOrSwitchParty: (ballotNumber: number) => void;
  onResignPolitics: () => void;
  onCampaignConstituency: () => void;
  onBuildFactionInfluence: () => void;
  onChallengeLeadership: () => void;
  onConfirmCoalition: (
    partnerNumbers: number[],
    ministries: Record<MinistryId, number>,
    claimPmForPlayerParty: boolean
  ) => void;
  onRecruitMinorParty: (minorBallotNumber: number) => void;
  onExecuteMinistryGovernance: () => void;
  onProposeBill: (billType: ParliamentaryBillType) => void;
  onTriggerSnapDissolution: () => void;
}

type SubView = 'OVERVIEW' | 'COALITION' | 'GOVERNANCE' | 'PARTIES_57';
type PartyFilter =
  | 'ALL_57'
  | 'MAJOR_10'
  | 'PROGRESSIVE'
  | 'PRAGMATIC_CONSERVATIVE'
  | 'HARDLINE_CONSERVATIVE'
  | 'IN_PARLIAMENT';

export const PoliticsParliamentView: React.FC<PoliticsParliamentViewProps> = ({
  player,
  onJoinOrSwitchParty,
  onResignPolitics,
  onCampaignConstituency,
  onBuildFactionInfluence,
  onChallengeLeadership,
  onConfirmCoalition,
  onRecruitMinorParty,
  onExecuteMinistryGovernance,
  onProposeBill,
  onTriggerSnapDissolution,
}) => {
  const pol = PoliticsEngine.ensurePoliticsState(player);
  const allParties = PoliticsEngine.getAllParties();
  const myParty = PoliticsEngine.getPartyByNumber(pol.party_number);
  const pmParty = PoliticsEngine.getPartyByNumber(pol.pm_party_number);
  const currentYearBE = player.birth_year_be + player.age;
  const canNegotiate = PoliticsEngine.canPlayerNegotiateCoalition(player);

  const [subView, setSubView] = useState<SubView>(
    pol.coalition_negotiation_open ? 'COALITION' : 'OVERVIEW'
  );
  const [partyFilter, setPartyFilter] = useState<PartyFilter>('MAJOR_10');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Draft state for interactive Coalition & Portfolio Builder
  const [draftPartners, setDraftPartners] = useState<number[]>(() =>
    pol.party_number
      ? Array.from(new Set([pol.party_number, ...pol.coalition_party_numbers]))
      : pol.coalition_party_numbers
  );
  const [draftMinistries, setDraftMinistries] = useState<Record<MinistryId, number>>(
    () => ({ ...pol.ministry_allocations })
  );
  const [claimPm, setClaimPm] = useState<boolean>(true);

  useEffect(() => {
    setDraftPartners(
      pol.party_number
        ? Array.from(new Set([pol.party_number, ...pol.coalition_party_numbers]))
        : pol.coalition_party_numbers
    );
    setDraftMinistries({ ...pol.ministry_allocations });
  }, [pol.last_election_year_be, pol.party_number]);

  const seatMap = useMemo(() => {
    const m = new Map<number, number>();
    for (const s of pol.parliament_seats) {
      m.set(s.ballotNumber, s.totalSeats);
    }
    return m;
  }, [pol.parliament_seats]);

  const currentGovSeats = useMemo(
    () =>
      pol.coalition_party_numbers.reduce(
        (sum, n) => sum + (seatMap.get(n) || 0),
        0
      ),
    [pol.coalition_party_numbers, seatMap]
  );

  const draftPmPartyNum = useMemo(() => {
    if (claimPm && pol.party_number && draftPartners.includes(pol.party_number)) {
      return pol.party_number;
    }
    const sorted = [...draftPartners].sort(
      (a, b) => (seatMap.get(b) || 0) - (seatMap.get(a) || 0)
    );
    return sorted[0] || pol.pm_party_number || 46;
  }, [claimPm, pol.party_number, draftPartners, seatMap, pol.pm_party_number]);

  const coalitionEval = useMemo(
    () =>
      PoliticsEngine.evaluateCoalitionCompatibility(
        draftPartners,
        pol.parliament_seats,
        draftMinistries,
        draftPmPartyNum
      ),
    [draftPartners, pol.parliament_seats, draftMinistries, draftPmPartyNum]
  );

  const toggleDraftPartner = (ballotNum: number) => {
    if (ballotNum === pol.party_number) return;
    setDraftPartners((prev) => {
      const next = prev.includes(ballotNum)
        ? prev.filter((n) => n !== ballotNum)
        : [...prev, ballotNum];
      const autoMins = PoliticsEngine.autoAllocateMinistriesForCoalition(
        next,
        pol.parliament_seats,
        pol.party_number && claimPm ? pol.party_number : next[0] || 46
      );
      setDraftMinistries(autoMins);
      return next;
    });
  };

  const handleAutoAssignDraftMinistries = () => {
    const autoMins = PoliticsEngine.autoAllocateMinistriesForCoalition(
      draftPartners,
      pol.parliament_seats,
      draftPmPartyNum
    );
    setDraftMinistries(autoMins);
  };

  const filteredParties = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allParties.filter((p) => {
      if (q) {
        const matchNum = String(p.ballotNumber) === q || `เบอร์ ${p.ballotNumber}`.includes(q);
        const matchName = p.name.toLowerCase().includes(q);
        const matchRegion = p.baseRegion.toLowerCase().includes(q);
        if (!matchNum && !matchName && !matchRegion) return false;
      }
      if (partyFilter === 'MAJOR_10') return p.isMajor10;
      if (partyFilter === 'PROGRESSIVE') return p.ideologyBloc === 'PROGRESSIVE';
      if (partyFilter === 'PRAGMATIC_CONSERVATIVE')
        return p.ideologyBloc === 'PRAGMATIC_CONSERVATIVE';
      if (partyFilter === 'HARDLINE_CONSERVATIVE')
        return p.ideologyBloc === 'HARDLINE_CONSERVATIVE';
      if (partyFilter === 'IN_PARLIAMENT') return (seatMap.get(p.ballotNumber) || 0) > 0;
      return true;
    });
  }, [allParties, partyFilter, searchQuery, seatMap]);

  const getBlocColorClass = (bloc: IdeologyBloc) => {
    switch (bloc) {
      case 'PROGRESSIVE':
        return 'text-amber-700 dark:text-amber-400';
      case 'PRAGMATIC_CONSERVATIVE':
        return 'text-sky-700 dark:text-sky-400';
      case 'HARDLINE_CONSERVATIVE':
        return 'text-indigo-800 dark:text-indigo-300';
    }
  };

  const monthlyPolSalary = PoliticsEngine.getMonthlyPoliticalSalary(pol.office_role);
  const myPartySeats = pol.party_number ? seatMap.get(pol.party_number) || 0 : 0;
  const isInCoalition =
    pol.party_number !== null && pol.coalition_party_numbers.includes(pol.party_number);

  return (
    <div className="space-y-6">
      {/* Header & Sub-Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
            รัฐสภาไทย 500 ที่นั่ง ระบบพรรคการเมือง 57 หมายเลข และการจัดตั้งรัฐบาล
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            เลือกสังกัดพรรคตามเบอร์เลือกตั้ง ไต่เต้าจากผู้สมัคร สส. สู่หัวหน้าพรรค รวบรวมเสียงเกิน{' '}
            <span className="font-mono-num font-semibold">251</span> ที่นั่งเพื่อขึ้นเป็นนายกรัฐมนตรี
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start">
          <button
            type="button"
            onClick={() => setSubView('OVERVIEW')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              subView === 'OVERVIEW'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            ภาพรวมสภา &amp; อาชีพการเมือง
          </button>
          <button
            type="button"
            onClick={() => setSubView('COALITION')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              subView === 'COALITION'
                ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            จัดตั้งรัฐบาล 251+ เสียง{pol.coalition_negotiation_open ? ' (เปิดดีล!)' : ''}
          </button>
          <button
            type="button"
            onClick={() => setSubView('GOVERNANCE')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              subView === 'GOVERNANCE'
                ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            บริหารกระทรวง &amp; กฎหมาย
          </button>
          <button
            type="button"
            onClick={() => setSubView('PARTIES_57')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              subView === 'PARTIES_57'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            รายชื่อครบ 57 พรรค
          </button>
        </div>
      </div>

      {/* Player Political Standing Strip */}
      <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400 font-mono-num">
            <span>
              {myParty
                ? `สังกัดหมายเลข ${myParty.ballotNumber} · ${myParty.name} (${myPartySeats} ที่นั่ง)`
                : 'ยังไม่ได้สังกัดพรรคการเมือง (สมัครได้เมื่ออายุ 18+ ปี)'}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              เลือกตั้งใหญ่ครั้งถัดไป พ.ศ. {pol.next_election_year_be} (อีก{' '}
              {Math.max(0, pol.next_election_year_be - currentYearBE)} ปี)
            </span>
          </div>

          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            {PoliticsEngine.getOfficeRoleLabel(pol.office_role, pol.assigned_ministry)}
            {myParty && (
              <span className="ml-2 text-xs sm:text-sm font-normal text-slate-600 dark:text-slate-400">
                ({isInCoalition ? 'ซีกรัฐบาล' : 'ซีกฝ่ายค้าน/นอกครม.'})
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-mono-num">
            <span>คะแนนนิยมพื้นที่ {pol.constituency_popularity}/100</span>
            <span aria-hidden="true">·</span>
            <span>บารมีในพรรค {pol.party_influence}/100</span>
            <span aria-hidden="true">·</span>
            <span>ชนะเลือกตั้ง {pol.elections_won} สมัย</span>
            {monthlyPolSalary > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  เงินประจำตำแหน่ง {monthlyPolSalary.toLocaleString()} บ./เดือน
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {!myParty ? (
            <button
              type="button"
              onClick={() => setSubView('PARTIES_57')}
              className="px-4 py-2 text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              เลือกสมัครพรรคการเมือง (เบอร์ 1–57)
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setSubView('PARTIES_57')}
                className="px-3 py-2 text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                ย้ายพรรค
              </button>
              <button
                type="button"
                onClick={onResignPolitics}
                className="px-3 py-2 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-100/70 dark:hover:bg-rose-950/40 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                วางมือทางการเมือง
              </button>
            </>
          )}
        </div>
      </div>

      {/* SUBVIEW 1: PARLIAMENT OVERVIEW & POLITICAL CLIMB */}
      {subView === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* 500-Seat Parliament Balance & Stability */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  สมดุลสภาผู้แทนราษฎร {HOUSE_TOTAL_SEATS} ที่นั่ง (แกนนำรัฐบาล:{' '}
                  {pmParty ? `เบอร์ ${pmParty.ballotNumber} ${pmParty.name}` : 'รักษาการ'})
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {pol.last_election_headline}
                </p>
              </div>
              <div className="text-xs sm:text-sm font-mono-num font-bold text-slate-800 dark:text-slate-200 shrink-0">
                รัฐบาล {currentGovSeats}/{HOUSE_TOTAL_SEATS} เสียง · ฝ่ายค้าน{' '}
                {HOUSE_TOTAL_SEATS - currentGovSeats} เสียง
              </div>
            </div>

            {/* Visual 500-seat bar with 251 majority threshold marker */}
            <div className="space-y-1.5">
              <div className="relative h-4 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-200 ${
                    currentGovSeats >= MAJORITY_THRESHOLD_SEATS
                      ? 'bg-emerald-600 dark:bg-emerald-500'
                      : 'bg-rose-600 dark:bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, (currentGovSeats / HOUSE_TOTAL_SEATS) * 100)}%` }}
                />
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-slate-950 dark:bg-amber-300"
                  style={{ left: `${(MAJORITY_THRESHOLD_SEATS / HOUSE_TOTAL_SEATS) * 100}%` }}
                  title="เกณฑ์เสียงข้างมาก 251 ที่นั่ง"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono-num">
                <span>0 ที่นั่ง</span>
                <span className="font-semibold text-slate-800 dark:text-amber-300">
                  เกณฑ์ตั้งรัฐบาล 251 เสียง
                </span>
                <span>500 ที่นั่ง</span>
              </div>
            </div>

            {/* Stability & Friction Index Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm font-mono-num">
              <div>
                <div className="text-slate-500 dark:text-slate-400 font-sans">
                  เสถียรภาพรัฐบาล (ลดลงเป็น 0 = ยุบสภาทันที)
                </div>
                <div
                  className={`text-base font-bold ${
                    pol.government_stability >= 60
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : pol.government_stability >= 35
                      ? 'text-amber-700 dark:text-amber-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {pol.government_stability}%
                </div>
              </div>
              <div>
                <div className="text-slate-500 dark:text-slate-400 font-sans">
                  ดัชนีความขัดแย้งพรรคร่วม (Friction Index)
                </div>
                <div
                  className={`text-base font-bold ${
                    pol.friction_index <= 30
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : pol.friction_index <= 55
                      ? 'text-amber-700 dark:text-amber-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {pol.friction_index}/100
                </div>
              </div>
              <div>
                <div className="text-slate-500 dark:text-slate-400 font-sans">
                  แกนอุดมการณ์สภา
                </div>
                <div className="text-xs font-sans font-semibold text-slate-700 dark:text-slate-300 pt-0.5">
                  ปฏิรูปก้าวหน้า &harr; สายบริหาร &harr; อนุรักษนิยมเข้มข้น
                </div>
              </div>
            </div>

            {/* Active Seats Breakdown Table */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                จำนวนที่นั่ง สส. รายพรรคในสภาชุดปัจจุบัน (10 พรรคหลัก + พรรคปัดเศษเสียงสวรรค์)
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {pol.parliament_seats.map((row) => {
                  const pDef = PoliticsEngine.getPartyByNumber(row.ballotNumber);
                  if (!pDef) return null;
                  const inGov = pol.coalition_party_numbers.includes(row.ballotNumber);
                  const isMyParty = pol.party_number === row.ballotNumber;
                  const canRecruitKingmaker =
                    row.isMinorJackpot && !inGov && isInCoalition && canNegotiate;

                  return (
                    <div
                      key={row.ballotNumber}
                      className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm"
                    >
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 min-w-0">
                        <span className="font-mono-num font-bold text-slate-900 dark:text-slate-100">
                          เบอร์ {pDef.ballotNumber}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {pDef.name}
                        </span>
                        {isMyParty && (
                          <span className="text-amber-700 dark:text-amber-400 font-semibold">
                            · พรรคของคุณ
                          </span>
                        )}
                        <span aria-hidden="true" className="text-slate-400">
                          ·
                        </span>
                        <span className={getBlocColorClass(pDef.ideologyBloc)}>
                          {PoliticsEngine.getIdeologyBlocLabel(pDef.ideologyBloc)}
                        </span>
                        <span aria-hidden="true" className="text-slate-400">
                          ·
                        </span>
                        <span
                          className={
                            inGov
                              ? 'font-semibold text-emerald-700 dark:text-emerald-400'
                              : 'text-slate-500 dark:text-slate-400'
                          }
                        >
                          {inGov ? 'ร่วมรัฐบาล' : row.isMinorJackpot ? 'พรรคปัดเศษ (เสียงสวรรค์)' : 'ฝ่ายค้าน'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 font-mono-num">
                        <span className="text-slate-500 dark:text-slate-400 text-xs">
                          เขต {row.constituencySeats} + บัญชีรายชื่อ {row.partyListSeats} =
                        </span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {row.totalSeats} ที่นั่ง
                        </span>
                        {canRecruitKingmaker && (
                          <button
                            type="button"
                            onClick={() => onRecruitMinorParty(row.ballotNumber)}
                            className="px-2.5 py-1 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            ดึงเสียงสวรรค์ ({(45000 * row.totalSeats).toLocaleString()} บ.)
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Career Ladder Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-4">
              <div className="space-y-1.5">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono-num">
                  ใช้พลังงาน 20 แต้ม · งบลงพื้นที่ 8,000 บ.
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  1. ลงพื้นที่หาเสียง &amp; ปลุกกระแสโซเชียล
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  สะสมคะแนนนิยมเขตพื้นที่เพื่อชนะเลือกตั้งเป็น สส. เมื่ออายุครบ 25 ปีบริบูรณ์ (ควรสะสมคะแนนนิยมเขตอย่างน้อย 45+ ก่อนปีเลือกตั้ง)
                </p>
              </div>
              <button
                type="button"
                disabled={!myParty || player.stats.energy < 20 || player.finance.cash < 8000}
                onClick={onCampaignConstituency}
                className={`w-full px-4 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  myParty && player.stats.energy >= 20 && player.finance.cash >= 8000
                    ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 hover:opacity-90 cursor-pointer'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                }`}
              >
                <Vote className="w-4 h-4 inline mr-1.5" />
                ลงพื้นที่ปราศรัยทันที
              </button>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-4">
              <div className="space-y-1.5">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono-num">
                  ใช้พลังงาน 20 แต้ม · สนับสนุนพรรค 25,000 บ.
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  2. สร้างเครือข่ายแกนนำ &amp; มุ้งการเมือง
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  เพิ่มบารมีภายในพรรคเพื่อปลดล็อกสิทธิ์ผู้จัดการรัฐบาล (บารมี &ge; 45) โควตารัฐมนตรี (บารมี &ge; 50) และการชิงเก้าอี้หัวหน้าพรรค
                </p>
              </div>
              <button
                type="button"
                disabled={!myParty || player.stats.energy < 20 || player.finance.cash < 25000}
                onClick={onBuildFactionInfluence}
                className={`w-full px-4 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  myParty && player.stats.energy >= 20 && player.finance.cash >= 25000
                    ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 hover:opacity-90 cursor-pointer'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                }`}
              >
                <Users className="w-4 h-4 inline mr-1.5" />
                ประสานแกนนำพรรค
              </button>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-4">
              <div className="space-y-1.5">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono-num">
                  อายุ 30+ · บารมีพรรค &ge; 65 · SOC &ge; 62 · INT &ge; 58
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  3. ชิงตำแหน่งหัวหน้าพรรค &amp; แคนดิเดตนายกฯ
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  ก้าวขึ้นกุมบังเหียนพรรคเต็มตัว เมื่อนำพรรครวบรวมเสียงเกิน 251 ที่นั่งได้สำเร็จ จะก้าวขึ้นดำรงตำแหน่งนายกรัฐมนตรีทันที
                </p>
              </div>
              {pol.office_role === 'PRIME_MINISTER' ? (
                <button
                  type="button"
                  onClick={onTriggerSnapDissolution}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  ประกาศยุบสภาจัดเลือกตั้งใหม่
                </button>
              ) : (
                <button
                  type="button"
                  disabled={
                    !myParty ||
                    pol.office_role === 'PARTY_LEADER' ||
                    player.age < 30 ||
                    pol.party_influence < 65 ||
                    player.stats.soc < 62 ||
                    player.stats.int < 58 ||
                    player.stats.energy < 25
                  }
                  onClick={onChallengeLeadership}
                  className={`w-full px-4 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    myParty &&
                    pol.office_role !== 'PARTY_LEADER' &&
                    player.age >= 30 &&
                    pol.party_influence >= 65 &&
                    player.stats.soc >= 62 &&
                    player.stats.int >= 58 &&
                    player.stats.energy >= 25
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {pol.office_role === 'PARTY_LEADER'
                    ? 'ดำรงตำแหน่งหัวหน้าพรรคอยู่แล้ว'
                    : 'เสนอชื่อชิงหัวหน้าพรรค (-25 Energy)'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBVIEW 2: INTERACTIVE COALITION NEGOTIATOR & 9-MINISTRY PORTFOLIO BUILDER */}
      {subView === 'COALITION' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  ห้องเจรจาจัดตั้งรัฐบาลผสม ({MAJORITY_THRESHOLD_SEATS}+ จาก {HOUSE_TOTAL_SEATS} เสียง)
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  เลือกพรรคร่วมรัฐบาล ตรวจสอบความเข้ากันได้ทางอุดมการณ์ และจัดสรรโควตา 9 กระทรวงหลักให้สอดคล้องเงื่อนไขแต่ละพรรค
                </p>
              </div>
              <div className="text-right font-mono-num shrink-0">
                <div
                  className={`text-lg sm:text-xl font-bold ${
                    coalitionEval.hasMajority
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  เสียงรวม {coalitionEval.totalSeats} / {HOUSE_TOTAL_SEATS} ที่นั่ง
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {coalitionEval.hasMajority
                    ? `เกินกึ่งหนึ่งแล้ว +${coalitionEval.totalSeats - 250} เสียง`
                    : `ยังขาดอีก ${coalitionEval.seatsShortOfMajority} เสียงเพื่อให้ครบ 251`}
                </div>
              </div>
            </div>

            {/* Compatibility Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono-num text-xs sm:text-sm">
              <div>
                <div className="text-slate-500 dark:text-slate-400 font-sans">
                  ระยะห่างอุดมการณ์พรรคร่วม
                </div>
                <div className="font-bold text-slate-900 dark:text-slate-100">
                  สเปกตรัม {coalitionEval.ideologyMin}–{coalitionEval.ideologyMax} (ห่างกัน{' '}
                  {coalitionEval.ideologySpread} จุด)
                </div>
              </div>
              <div>
                <div className="text-slate-500 dark:text-slate-400 font-sans">
                  ค่าความขัดแย้งคาดการณ์ (Friction Index)
                </div>
                <div
                  className={`font-bold ${
                    coalitionEval.frictionIndex <= 35
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : coalitionEval.frictionIndex <= 60
                      ? 'text-amber-700 dark:text-amber-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {coalitionEval.frictionIndex}/100
                </div>
              </div>
              <div>
                <div className="text-slate-500 dark:text-slate-400 font-sans">
                  ความเสถียรรัฐบาลตั้งต้น
                </div>
                <div className="font-bold text-emerald-700 dark:text-emerald-400">
                  {coalitionEval.estimatedStability}%
                </div>
              </div>
            </div>

            {/* Partner Selection Checkboxes */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  1. เลือกดึงพรรคที่มี สส. ในสภาเข้าร่วมรัฐบาล (รวมพรรคปัดเศษเสียงสวรรค์ 1–2 ที่นั่ง)
                </span>
                {pol.party_number && (
                  <label className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={claimPm}
                      onChange={(e) => setClaimPm(e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    <span>เสนอชื่อพรรคของคุณชิงตำแหน่งนายกรัฐมนตรี (เมื่ออายุ 35+ ปี)</span>
                  </label>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {pol.parliament_seats.map((seatRow) => {
                  const pDef = PoliticsEngine.getPartyByNumber(seatRow.ballotNumber);
                  if (!pDef) return null;
                  const checked = draftPartners.includes(seatRow.ballotNumber);
                  const lockedSelf = seatRow.ballotNumber === pol.party_number;

                  return (
                    <button
                      key={seatRow.ballotNumber}
                      type="button"
                      onClick={() => toggleDraftPartner(seatRow.ballotNumber)}
                      className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                        checked
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/25 border-emerald-500/70'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-x-1.5 text-xs sm:text-sm">
                          <span className="font-mono-num font-bold text-slate-900 dark:text-slate-100">
                            เบอร์ {pDef.ballotNumber}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {pDef.name}
                          </span>
                          {seatRow.isMinorJackpot && (
                            <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
                              · เสียงสวรรค์
                            </span>
                          )}
                          {lockedSelf && (
                            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                              · พรรคของคุณ
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          <span className={getBlocColorClass(pDef.ideologyBloc)}>
                            {PoliticsEngine.getIdeologyBlocLabel(pDef.ideologyBloc)}
                          </span>{' '}
                          · {pDef.coalitionConditionText}
                        </div>
                      </div>
                      <div className="text-right font-mono-num shrink-0">
                        <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {seatRow.totalSeats} เสียง
                        </div>
                        <div className="text-xs text-emerald-700 dark:text-emerald-400">
                          {checked ? 'ร่วมรัฐบาล' : 'คลิกเทียบเชิญ'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ministerial Portfolio Allocation */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  2. จัดสรรโควตา 9 กระทรวงหลัก (กระทรวงเกรด A &amp; กระทรวงเฉพาะทาง)
                </span>
                <button
                  type="button"
                  onClick={handleAutoAssignDraftMinistries}
                  className="px-3 py-1.5 text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  จัดสรรโควตาอัตโนมัติตามสัดส่วน
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {MINISTRY_PORTFOLIOS.map((min) => {
                  const holderNum = draftMinistries[min.id];
                  return (
                    <div
                      key={min.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2"
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono-num">
                          เกรด {min.grade} · {min.focusLabel}
                        </div>
                        <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {min.title}
                        </div>
                      </div>
                      <select
                        aria-label={`เลือกพรรคคุม${min.title}`}
                        value={holderNum || ''}
                        onChange={(e) =>
                          setDraftMinistries((prev) => ({
                            ...prev,
                            [min.id]: Number(e.target.value),
                          }))
                        }
                        className="w-full px-2.5 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono-num"
                      >
                        {draftPartners.map((pNum) => {
                          const pObj = PoliticsEngine.getPartyByNumber(pNum);
                          const pSeats = seatMap.get(pNum) || 0;
                          return (
                            <option key={pNum} value={pNum}>
                              เบอร์ {pNum} {pObj?.name || ''} ({pSeats} เสียง)
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Warnings, Vetoes & Confirm Button */}
            {(coalitionEval.hardVetoReasons.length > 0 ||
              coalitionEval.unsatisfiedConditions.length > 0 ||
              coalitionEval.crossBlocBacklashWarnings.length > 0) && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs sm:text-sm">
                {coalitionEval.hardVetoReasons.map((err, i) => (
                  <div key={`veto-${i}`} className="text-rose-600 dark:text-rose-400 font-semibold">
                    — เส้นแดงอุดมการณ์ (ตั้งรัฐบาลร่วมกันไม่ได้): {err}
                  </div>
                ))}
                {coalitionEval.unsatisfiedConditions.map((warn, i) => (
                  <div key={`cond-${i}`} className="text-amber-700 dark:text-amber-400">
                    — ข้อเรียกร้องโควตากระทรวงยังไม่ลงตัว (+14 ความขัดแย้ง): {warn}
                  </div>
                ))}
                {coalitionEval.crossBlocBacklashWarnings.map((bw, i) => (
                  <div key={`back-${i}`} className="text-slate-600 dark:text-slate-300">
                    — ผลกระทบสลับขั้ว: {bw}
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {!canNegotiate ? (
                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>
                    ต้องเป็น สส. ที่มีบารมีในพรรค &ge; 45 รัฐมนตรี หรือหัวหน้าพรรคที่มี สส. ในสภาจึงจะกดจัดตั้งรัฐบาลจริงได้
                  </span>
                </span>
              ) : (
                <span className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-400 font-semibold">
                  คุณมีอำนาจเจรจาจัดตั้งรัฐบาลและเสนอชื่อคณะรัฐมนตรีในนาม {myParty?.name}
                </span>
              )}

              <button
                type="button"
                disabled={!canNegotiate || !coalitionEval.canFormGovernment}
                onClick={() => onConfirmCoalition(draftPartners, draftMinistries, claimPm)}
                className={`px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 ${
                  canNegotiate && coalitionEval.canFormGovernment
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                }`}
              >
                <Landmark className="w-4 h-4 inline mr-1.5" />
                โหวตนายกฯ &amp; จัดตั้งรัฐบาล ({coalitionEval.totalSeats} เสียง)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBVIEW 3: CABINET GOVERNANCE & LEGISLATION */}
      {subView === 'GOVERNANCE' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  คณะรัฐมนตรีปัจจุบันและการบริหารราชการแผ่นดิน
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  หากพรรคของคุณร่วมรัฐบาลและถือโควตากระทรวง สามารถเร่งรัดผลงานเพื่อเพิ่มเสถียรภาพรัฐบาลและคะแนนนิยมได้
                </p>
              </div>
              <button
                type="button"
                disabled={!isInCoalition || player.stats.energy < 25}
                onClick={onExecuteMinistryGovernance}
                className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  isInCoalition && player.stats.energy >= 25
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                }`}
              >
                บริหารผลงานกระทรวง (-25 Energy)
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {MINISTRY_PORTFOLIOS.map((min) => {
                const holderParty = PoliticsEngine.getPartyByNumber(
                  pol.ministry_allocations[min.id]
                );
                const isPlayerMinistry =
                  pol.assigned_ministry === min.id ||
                  (pol.party_number !== null &&
                    pol.ministry_allocations[min.id] === pol.party_number);

                return (
                  <div
                    key={min.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {min.title}{' '}
                        <span className="font-normal text-slate-500 dark:text-slate-400 font-mono-num">
                          · เกรด {min.grade} · {min.focusLabel}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {min.description}
                      </div>
                    </div>
                    <div className="font-mono-num shrink-0 font-semibold text-slate-800 dark:text-slate-200">
                      {holderParty
                        ? `เบอร์ ${holderParty.ballotNumber} · ${holderParty.name}`
                        : 'ว่าง'}
                      {isPlayerMinistry && (
                        <span className="ml-2 text-emerald-700 dark:text-emerald-400">
                          (โควตาพรรคคุณ)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Parliamentary Bill Floor Voting */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                เสนอร่างพระราชบัญญัติเข้าสู่สภาผู้แทนราษฎร (ผ่านมติที่ 251/500 เสียง · ผ่านแล้ว{' '}
                <span className="font-mono-num">{pol.bills_passed}</span> ฉบับ)
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                ต้องดำรงตำแหน่ง สส. รัฐมนตรี หัวหน้าพรรค หรือนายกรัฐมนตรี ระวังค่าความขัดแย้งพรรคร่วมที่อาจทำให้เกิดงูเห่าหรือปัดตกร่างกฎหมาย!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                    สายเศรษฐกิจปากท้อง · เสี่ยงขัดแย้งต่ำ
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    ร่าง พ.ร.บ. งบกระตุ้นเศรษฐกิจและลดค่าครองชีพ
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    พรรคร่วมรัฐบาลส่วนใหญ่พร้อมยกมือหนุน ช่วยเพิ่มคะแนนนิยมเขตพื้นที่อย่างมั่นคง
                  </p>
                </div>
                <button
                  type="button"
                  disabled={
                    pol.office_role === 'NONE' ||
                    pol.office_role === 'PARTY_MEMBER' ||
                    player.stats.energy < 25
                  }
                  onClick={() => onProposeBill('ECONOMIC_STIMULUS')}
                  className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    pol.office_role !== 'NONE' &&
                    pol.office_role !== 'PARTY_MEMBER' &&
                    player.stats.energy >= 25
                      ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 cursor-pointer'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5 inline mr-1" />
                  เสนอกฎหมายเศรษฐกิจ (-25 Energy)
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
                    สายปฏิรูปโครงสร้าง · เสี่ยงปะทะพรรคอนุรักษนิยม
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    ร่าง พ.ร.บ. ปฏิรูปโครงสร้างรัฐและทลายทุนผูกขาด
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    ฝ่ายปฏิรูปโหวตหนุนเต็มร้อย แต่พรรคประชาธิปัตย์ (#27) รวมไทยสร้างชาติ (#6) และไทยภักดี (#29) จะโหวตคว่ำและเพิ่มความขัดแย้งทันที!
                  </p>
                </div>
                <button
                  type="button"
                  disabled={
                    pol.office_role === 'NONE' ||
                    pol.office_role === 'PARTY_MEMBER' ||
                    player.stats.energy < 25
                  }
                  onClick={() => onProposeBill('STRUCTURAL_REFORM')}
                  className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    pol.office_role !== 'NONE' &&
                    pol.office_role !== 'PARTY_MEMBER' &&
                    player.stats.energy >= 25
                      ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 cursor-pointer'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5 inline mr-1" />
                  เสนอกฎหมายปฏิรูป (-25 Energy)
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs text-sky-700 dark:text-sky-400 font-semibold">
                    สายพหุวัฒนธรรม &amp; สิทธิมนุษยชน
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    ร่าง พ.ร.บ. สันติภาพชายแดนใต้และสิทธิพลเมือง
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    ได้รับเสียงหนุนจากพรรคประชาชาติ (#33) พรรคเป็นธรรม (#45) ฝ่ายก้าวหน้า และพรรคสายบริหาร
                  </p>
                </div>
                <button
                  type="button"
                  disabled={
                    pol.office_role === 'NONE' ||
                    pol.office_role === 'PARTY_MEMBER' ||
                    player.stats.energy < 25
                  }
                  onClick={() => onProposeBill('SOUTHERN_PEACE_RIGHTS')}
                  className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    pol.office_role !== 'NONE' &&
                    pol.office_role !== 'PARTY_MEMBER' &&
                    player.stats.energy >= 25
                      ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 cursor-pointer'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5 inline mr-1" />
                  เสนอกฎหมายสันติภาพ (-25 Energy)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBVIEW 4: COMPLETE 57 BALLOT-NUMBERED PARTIES REGISTRY */}
      {subView === 'PARTIES_57' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อพรรค หรือพิมพ์หมายเลขเบอร์ 1–57..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setPartyFilter('MAJOR_10')}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  partyFilter === 'MAJOR_10'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                10 พรรคหลัก
              </button>
              <button
                type="button"
                onClick={() => setPartyFilter('ALL_57')}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  partyFilter === 'ALL_57'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                ครบทั้ง 57 เบอร์
              </button>
              <button
                type="button"
                onClick={() => setPartyFilter('IN_PARLIAMENT')}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  partyFilter === 'IN_PARLIAMENT'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                มี สส. ในสภา ({pol.parliament_seats.length})
              </button>
              <button
                type="button"
                onClick={() => setPartyFilter('PROGRESSIVE')}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  partyFilter === 'PROGRESSIVE'
                    ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                ฝ่ายปฏิรูป
              </button>
              <button
                type="button"
                onClick={() => setPartyFilter('PRAGMATIC_CONSERVATIVE')}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  partyFilter === 'PRAGMATIC_CONSERVATIVE'
                    ? 'bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                สายบริหาร
              </button>
              <button
                type="button"
                onClick={() => setPartyFilter('HARDLINE_CONSERVATIVE')}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  partyFilter === 'HARDLINE_CONSERVATIVE'
                    ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                อนุรักษนิยมเข้มข้น
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredParties.map((party) => {
              const isCurrent = pol.party_number === party.ballotNumber;
              const seatsNow = seatMap.get(party.ballotNumber) || 0;
              const canJoin =
                !isCurrent &&
                player.age >= 18 &&
                player.career.prison_years_left === 0 &&
                !player.flags.is_criminal_record &&
                player.finance.cash >= 2000;

              return (
                <div
                  key={party.ballotNumber}
                  className={`p-5 rounded-xl border flex flex-col justify-between gap-4 ${
                    isCurrent
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/60'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400 font-mono-num">
                      <span className="font-bold text-slate-900 dark:text-amber-400">
                        หมายเลข {party.ballotNumber}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className={`font-sans font-semibold ${getBlocColorClass(party.ideologyBloc)}`}>
                        {PoliticsEngine.getIdeologyBlocLabel(party.ideologyBloc)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-sans">ความนิยม: {party.popularityLabel}</span>
                      {seatsNow > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                            {seatsNow} ที่นั่งในสภา
                          </span>
                        </>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {party.name}
                    </h4>

                    <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 space-y-1 leading-relaxed">
                      <div>
                        <strong className="text-slate-800 dark:text-slate-200">ฐานเสียงหลัก:</strong>{' '}
                        {party.baseRegion}
                      </div>
                      <div>
                        <strong className="text-emerald-700 dark:text-emerald-400">จุดแข็ง:</strong>{' '}
                        {party.buffText}
                      </div>
                      <div>
                        <strong className="text-rose-600 dark:text-rose-400">จุดอ่อน:</strong>{' '}
                        {party.debuffText}
                      </div>
                      <div>
                        <strong className="text-slate-800 dark:text-slate-200">
                          เงื่อนไขร่วมรัฐบาล:
                        </strong>{' '}
                        {party.coalitionConditionText}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono-num">
                      ค่าบำรุงสมาชิกแรกเข้า 2,000 บ.
                    </span>
                    {isCurrent ? (
                      <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                        <Check className="w-4 h-4" />
                        สังกัดพรรคนี้ปัจจุบัน
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={!canJoin}
                        onClick={() => onJoinOrSwitchParty(party.ballotNumber)}
                        className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                          canJoin
                            ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 hover:opacity-90 cursor-pointer'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {player.age < 18
                          ? 'รออายุครบ 18 ปี'
                          : player.flags.is_criminal_record
                          ? 'ขาดคุณสมบัติคดีอาญา'
                          : pol.party_number
                          ? `ย้ายเข้าเบอร์ ${party.ballotNumber}`
                          : `สมัครเข้าเบอร์ ${party.ballotNumber}`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
