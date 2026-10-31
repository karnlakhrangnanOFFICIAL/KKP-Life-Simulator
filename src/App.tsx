import React, { useEffect, useState } from 'react';
import { AssetMarketView } from './components/AssetMarketView';
import { AthleticTrainingView } from './components/AthleticTrainingView';
import { CareerMatrixView } from './components/CareerMatrixView';
import { EducationTreeView } from './components/EducationTreeView';
import { EnergyPlannerView } from './components/EnergyPlannerView';
import { GameOverSummary } from './components/GameOverSummary';
import { MilestoneTray } from './components/MilestoneTray';
import {
  PriorityEventToast,
  PriorityToastItem,
  isPriorityToastCategory,
} from './components/PriorityEventToast';
import { StageArtwork } from './components/StageArtwork';
import { StatHistoryChart } from './components/StatHistoryChart';
import { StreetEncounterStrip } from './components/StreetEncounterStrip';
import { UnderworldPanel } from './components/UnderworldPanel';
import { AssetManager } from './core/asset_manager';
import { AthleticTrainingEngine } from './core/athletic_training';
import { EnergySystem } from './core/energy_system';
import { StreetEncounterEngine } from './core/street_encounter_engine';
import { UnderworldEngine } from './core/underworld_engine';
import { CareerEngine } from './engine/CareerEngine';
import { EDUCATION_TREE } from './engine/EducationEngine';
import { EventEngine } from './engine/EventEngine';
import { LifeSimulatorEngine } from './engine/LifeSimulatorEngine';
import { MilestoneEngine } from './engine/MilestoneEngine';
import { soundFX } from './engine/sound';
import {
  AthleticTrainingModeId,
  BiologicalSex,
  CityDistrictId,
  ConditionalEvent,
  EducationLevel,
  GameState,
  LicenseId,
  PlayerData,
  SafehouseId,
} from './engine/types';
import { ECONOMIC_CYCLES } from './events/macro_economy';
import {
  Shuffle,
  Play,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  ChevronRight,
  Code2,
  Compass,
  X,
} from 'lucide-react';

type WorkspaceTab =
  | 'TIMELINE'
  | 'ATHLETICS'
  | 'EDUCATION'
  | 'CAREER'
  | 'UNDERWORLD'
  | 'ASSETS';

export default function App() {
  // Default to crisp high-contrast Light Mode for effortless Thai reading; 1-click toggle to Dark Mode
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('TIMELINE');
  const [showSchemaModal, setShowSchemaModal] = useState<boolean>(false);

  // Character setup state on Title Menu
  const [customName, setCustomName] = useState<string>('สมชาย ใจสู้');
  const [selectedSex, setSelectedSex] = useState<BiologicalSex>('MALE');
  const [previewChar, setPreviewChar] = useState<PlayerData>(() =>
    LifeSimulatorEngine.createRandomCharacter('สมชาย ใจสู้', 'MALE')
  );

  // Active gameplay state
  const [player, setPlayer] = useState<PlayerData>(() =>
    LifeSimulatorEngine.createRandomCharacter('สมชาย ใจสู้', 'MALE')
  );
  const [energyAllocations, setEnergyAllocations] = useState<Record<string, number>>({});
  const [pendingEvent, setPendingEvent] = useState<ConditionalEvent | null>(null);
  const [resolvedEventNote, setResolvedEventNote] = useState<string | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [priorityToasts, setPriorityToasts] = useState<PriorityToastItem[]>([]);
  const [dismissedMilestoneIds, setDismissedMilestoneIds] = useState<string[]>([]);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  const showNotice = (msg: string) => {
    setToastMessage(msg);
  };

  const enqueuePriorityEventToast = (
    ev: ConditionalEvent | null,
    targetPlayer: PlayerData
  ): boolean => {
    if (!ev || !isPriorityToastCategory(ev.category)) {
      return false;
    }

    const priorityCategory = ev.category;
    if (priorityCategory === 'CRITICAL') {
      soundFX.playCriticalToastCue();
    } else {
      soundFX.playThaiMilestoneToastCue();
    }

    const toastId = `${ev.id}-${targetPlayer.age}-${targetPlayer.background.generation}`;
    setPriorityToasts((prev) => {
      const withoutDup = prev.filter((item) => item.id !== toastId);
      return [
        ...withoutDup,
        {
          id: toastId,
          eventId: ev.id,
          category: priorityCategory,
          title: ev.title,
          description: ev.description,
          age: targetPlayer.age,
          yearBe: targetPlayer.birth_year_be + targetPlayer.age,
        },
      ];
    });
    return true;
  };

  const dismissPriorityToast = (toastId: string) => {
    setPriorityToasts((prev) => prev.filter((item) => item.id !== toastId));
  };

  const focusPriorityToastEvent = (toastId: string) => {
    setPriorityToasts((prev) => prev.filter((item) => item.id !== toastId));
    setActiveTab('TIMELINE');
    window.requestAnimationFrame(() => {
      document.getElementById('active-annual-event')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    });
  };

  const handleRerollPreview = (overrideSex?: BiologicalSex) => {
    soundFX.playTick();
    const targetSex = overrideSex || selectedSex;
    const rolled = LifeSimulatorEngine.createRandomCharacter(customName, targetSex);
    setPreviewChar(rolled);
  };

  const handleRandomName = () => {
    const newName = LifeSimulatorEngine.getSampleRandomName(selectedSex);
    setCustomName(newName);
    setPreviewChar((prev) => ({ ...prev, name: newName }));
  };

  const handleSelectSex = (sex: BiologicalSex) => {
    setSelectedSex(sex);
    const sample = LifeSimulatorEngine.getSampleRandomName(sex);
    setCustomName(sample);
    setPreviewChar(LifeSimulatorEngine.createRandomCharacter(sample, sex));
  };

  const buildDefaultAllocations = (p: PlayerData): Record<string, number> => {
    if (p.age <= 6) {
      return { CHILD_GROWTH_PLAY: 1, CHILD_EARLY_READING: 1 };
    }
    if (p.career.prison_years_left > 0) {
      return {};
    }
    if (p.career.side_job && p.career.conscription_years_left === 0) {
      return { OPT_SIDE_JOB_SHIFT: 1 };
    }
    return {};
  };

  const handleStartNewLife = (usePreview: boolean = true) => {
    const startingPlayer = usePreview
      ? { ...previewChar, name: customName.trim() || previewChar.name, sex: selectedSex }
      : LifeSimulatorEngine.createRandomCharacter();

    setPlayer(startingPlayer);
    setEnergyAllocations(buildDefaultAllocations(startingPlayer));
    setGameState('PLAYING');
    setActiveTab('TIMELINE');
    setToastMessage(null);
    setPriorityToasts([]);
    setResolvedEventNote(undefined);
    setDismissedMilestoneIds([]);

    const initialEv = EventEngine.evaluateYearlyEvent(startingPlayer);
    setPendingEvent(initialEv);
    if (!enqueuePriorityEventToast(initialEv, startingPlayer)) {
      soundFX.playSuccess();
    }
  };

  const handleContinueAsNextGenChild = (childPlayer: PlayerData) => {
    setPlayer(childPlayer);
    setEnergyAllocations(buildDefaultAllocations(childPlayer));
    setGameState('PLAYING');
    setActiveTab('TIMELINE');
    setToastMessage(
      `เริ่มชีวิตใหม่ในฐานะทายาทรุ่นที่ ${childPlayer.background.generation} (${childPlayer.name})`
    );
    setPriorityToasts([]);
    setResolvedEventNote(undefined);
    setDismissedMilestoneIds([]);

    const initialEv = EventEngine.evaluateYearlyEvent(childPlayer);
    setPendingEvent(initialEv);
    if (!enqueuePriorityEventToast(initialEv, childPlayer)) {
      soundFX.playSuccess();
    }
  };

  const handleResetToMenu = () => {
    soundFX.playTick();
    const freshPreview = LifeSimulatorEngine.createRandomCharacter(customName, selectedSex);
    setPreviewChar(freshPreview);
    setEnergyAllocations({});
    setPendingEvent(null);
    setResolvedEventNote(undefined);
    setToastMessage(null);
    setPriorityToasts([]);
    setDismissedMilestoneIds([]);
    setShowSchemaModal(false);
    setGameState('TITLE_MENU');
  };

  const handleSelectEventChoice = (choiceIndex: number) => {
    if (!pendingEvent) return;
    const choice = pendingEvent.choices[choiceIndex];
    if (!choice) return;

    const resolvedId = pendingEvent.id;
    soundFX.playTick();
    const { updated, outcomeText } = choice.apply(player);

    if (updated.stats.hp <= 0 || updated.stats.san <= 0) {
      updated.is_alive = false;
      updated.cause_of_death =
        updated.stats.hp <= 0
          ? 'เสียชีวิตเฉียบพลันจากเหตุวิกฤตทางสุขภาพ'
          : 'ภาวะจิตใจแตกสลายจากวิกฤตชีวิต';
      setPlayer(updated);
      setPendingEvent(null);
      setPriorityToasts([]);
      soundFX.playGameOver();
      setGameState('GAME_OVER');
      return;
    }

    setPlayer(updated);
    setResolvedEventNote(`${pendingEvent.title} -> ${outcomeText}`);
    setPendingEvent(null);
    setPriorityToasts((prev) => prev.filter((item) => item.eventId !== resolvedId));
    showNotice(outcomeText);
  };

  const handleExecuteAnnualTurn = () => {
    if (pendingEvent || !player.is_alive) return;

    const nextPlayer = LifeSimulatorEngine.advanceYearWithAllocations(
      player,
      energyAllocations,
      resolvedEventNote
    );

    setPlayer(nextPlayer);
    setEnergyAllocations(buildDefaultAllocations(nextPlayer));
    setResolvedEventNote(undefined);
    setToastMessage(null);

    if (!nextPlayer.is_alive) {
      setPriorityToasts([]);
      soundFX.playGameOver();
      setGameState('GAME_OVER');
      return;
    }

    const nextEvent = EventEngine.evaluateYearlyEvent(nextPlayer);
    setPendingEvent(nextEvent);
    const playedPriorityCue = enqueuePriorityEventToast(nextEvent, nextPlayer);
    if (!playedPriorityCue) {
      soundFX.playTick();
    }
  };

  // Keyboard shortcuts: 1-3 for Event Choices, Enter for advancing year in Energy Planner
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'PLAYING' || showSchemaModal) return;
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (pendingEvent) {
        const num = parseInt(e.key, 10);
        if (!isNaN(num) && num >= 1 && num <= pendingEvent.choices.length) {
          e.preventDefault();
          handleSelectEventChoice(num - 1);
        }
      } else if (e.key === 'Enter' && activeTab === 'TIMELINE') {
        e.preventDefault();
        handleExecuteAnnualTurn();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const handleEnrollEducation = (level: EducationLevel, useStudentLoan: boolean) => {
    const res = LifeSimulatorEngine.enrollEducation(player, level, useStudentLoan);
    setPlayer(res.updated);
    soundFX.playSuccess();
    showNotice(res.message);
  };

  const handleApplyJob = (jobId: string, asSideJob: boolean) => {
    const res = LifeSimulatorEngine.applyForJob(player, jobId, asSideJob);
    setPlayer(res.updated);
    if (asSideJob && res.updated.career.side_job === jobId) {
      setEnergyAllocations((prev) => ({ ...prev, OPT_SIDE_JOB_SHIFT: 1 }));
    }
    soundFX.playSuccess();
    showNotice(res.message);
  };

  const handleQuitJob = (isSideJob: boolean) => {
    const res = LifeSimulatorEngine.quitJob(player, isSideJob);
    setPlayer(res.updated);
    if (isSideJob) {
      setEnergyAllocations((prev) => {
        const copy = { ...prev };
        delete copy.OPT_SIDE_JOB_SHIFT;
        return copy;
      });
    }
    soundFX.playTick();
    showNotice(res.message);
  };

  const handleTakeLicense = (licenseId: LicenseId) => {
    const res = LifeSimulatorEngine.takeLicenseCourse(player, licenseId);
    setPlayer(res.updated);
    if (res.passed) {
      soundFX.playSuccess();
    } else {
      soundFX.playAlert();
    }
    showNotice(res.message);
  };

  const handlePurchaseAsset = (assetId: string) => {
    const res = AssetManager.purchaseAsset(player, assetId);
    setPlayer(res.updated);
    soundFX.playSuccess();
    showNotice(res.message);
  };

  const handleSellOrCancelAsset = (assetId: string) => {
    const res = AssetManager.cancelRentalOrSellAsset(player, assetId);
    setPlayer(res.updated);
    soundFX.playTick();
    showNotice(res.message);
  };

  const handleExecuteCrimeOperation = (opId: string) => {
    const res = UnderworldEngine.executeCrimeOperation(player, opId);
    setPlayer(res.updated);
    if (res.arrested) {
      setEnergyAllocations({});
      soundFX.playAlert();
    } else {
      soundFX.playSuccess();
    }
    showNotice(res.message);
  };

  const handleBribeReduceNotoriety = () => {
    if (player.finance.cash < 35000 || player.career.notoriety < 15) return;
    const next: PlayerData = JSON.parse(JSON.stringify(player));
    next.finance.cash -= 35000;
    next.career.notoriety = Math.max(0, next.career.notoriety - 20);
    setPlayer(next);
    soundFX.playTick();
    showNotice('จ่ายค่ากลบร่องรอย 35,000 บาท ลดระดับหมายจับลง -20 หน่วย');
  };

  const handleAcquireSafehouse = (safehouseId: SafehouseId) => {
    const res = UnderworldEngine.acquireSafehouse(player, safehouseId);
    setPlayer(res.updated);
    if (res.success) {
      soundFX.playSuccess();
    } else {
      soundFX.playAlert();
    }
    showNotice(res.message);
  };

  const handleRelocateSafehouse = () => {
    const res = UnderworldEngine.relocateSafehouse(player);
    setPlayer(res.updated);
    if (res.success) {
      soundFX.playSuccess();
    } else {
      soundFX.playAlert();
    }
    showNotice(res.message);
  };

  const handleAbandonSafehouse = () => {
    const res = UnderworldEngine.abandonSafehouse(player);
    setPlayer(res.updated);
    soundFX.playTick();
    showNotice(res.message);
  };

  const handleLayLow = () => {
    const res = UnderworldEngine.layLowInHideout(player);
    setPlayer(res.updated);
    if (res.success) {
      soundFX.playSuccess();
    } else {
      soundFX.playAlert();
    }
    showNotice(res.message);
  };

  const handleExecuteAthleticTraining = (modeId: AthleticTrainingModeId) => {
    const res = AthleticTrainingEngine.executeTraining(player, modeId);
    setPlayer(res.updated);
    if (res.success) {
      const postSummary = EnergySystem.calculateAllocationSummary(res.updated, energyAllocations);
      if (postSummary.totalAllocated > postSummary.hardCapEnergy) {
        setEnergyAllocations({});
      }
      soundFX.playSuccess();
    } else {
      soundFX.playAlert();
    }
    showNotice(res.message);
  };

  const navigateCityTab = (nextTab: WorkspaceTab) => {
    if (gameState === 'PLAYING' && nextTab !== activeTab) {
      const district = StreetEncounterEngine.mapTabToDistrict(nextTab);
      if (district) {
        const res = StreetEncounterEngine.triggerMovementEncounter(player, district, {
          isManualStroll: false,
        });
        if (res.triggered) {
          setPlayer(res.updated);
          soundFX.playTick();
        }
      }
    }
    setActiveTab(nextTab);
  };

  const handleStrollDistrict = (districtId: CityDistrictId) => {
    const res = StreetEncounterEngine.triggerMovementEncounter(player, districtId, {
      isManualStroll: true,
    });
    setPlayer(res.updated);
    if (res.triggered) {
      const postSummary = EnergySystem.calculateAllocationSummary(res.updated, energyAllocations);
      if (postSummary.totalAllocated > postSummary.hardCapEnergy) {
        setEnergyAllocations({});
      }
      soundFX.playTick();
    } else if (res.message) {
      soundFX.playAlert();
      showNotice(res.message);
    }
  };

  const handleTakeStreetReaction = (encounterId: string) => {
    const res = StreetEncounterEngine.resolveEncounterReaction(player, encounterId);
    setPlayer(res.updated);
    if (res.success) {
      soundFX.playSuccess();
      showNotice(res.message);
    } else {
      soundFX.playAlert();
      showNotice(res.message);
    }
  };

  const toggleSound = () => {
    const nextMuted = !soundMuted;
    soundFX.muted = nextMuted;
    setSoundMuted(nextMuted);
  };

  const activeMilestones = MilestoneEngine.evaluateUpcomingMilestones(player);
  const currentPrimaryJob = CareerEngine.getJobById(player.career.primary_job);
  const currentSideJob = CareerEngine.getJobById(player.career.side_job);
  const currentEduNode = EDUCATION_TREE[player.education.current_level];
  const activeProgramNode = player.education.active_program
    ? EDUCATION_TREE[player.education.active_program]
    : null;
  const macroConfig = ECONOMIC_CYCLES[player.macro_economy.current_state];
  const liveArrestRisk = UnderworldEngine.calculateAnnualArrestRisk(player);
  const currentSafehouse = UnderworldEngine.getSafehouseById(player.career.safehouse_id);
  const localAffinityScore = player.street_world?.neighborhood_affinity ?? 50;
  const energySummary = EnergySystem.calculateAllocationSummary(player, energyAllocations);
  const freeSafeEnergy = Math.max(0, energySummary.maxBaseEnergy - energySummary.totalAllocated);
  const totalDebtCombined = player.finance.debt + player.finance.student_loan_debt;

  const primaryRoleSummary =
    player.career.prison_years_left > 0
      ? `ต้องโทษจำคุก (เหลือ ${player.career.prison_years_left} ปี)`
      : player.career.conscription_years_left > 0
      ? `ทหารกองประจำการ (เหลือ ${player.career.conscription_years_left} ปี)`
      : activeProgramNode
      ? `กำลังเรียน ${activeProgramNode.shortTitle} (ปี ${player.education.years_in_program}/${activeProgramNode.durationYears})`
      : currentPrimaryJob
      ? currentPrimaryJob.title
      : player.age <= 6
      ? 'วัยเด็กเล็กในบ้าน'
      : 'ว่างงาน / อิสระ';

  const cleanPlayerSchemaJson = {
    character_id: player.character_id,
    name: player.name,
    sex: player.sex,
    generation: player.background.generation,
    age: player.age,
    is_alive: player.is_alive,
    cause_of_death: player.cause_of_death,
    stats: player.stats,
    finance: player.finance,
    background: player.background,
    education: {
      current_level: player.education.current_level,
      rotc_level: player.education.rotc_level,
      uses_student_loan: player.education.uses_student_loan,
      school_name: player.education.school_name,
      gpa: player.education.gpa,
      is_enrolled: player.education.is_enrolled,
    },
    career: player.career,
    assets: player.assets,
    street_world: player.street_world,
    macro_economy: player.macro_economy,
    event_queue: player.event_queue,
    flags: player.flags,
    lineage: player.lineage,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            if (gameState === 'PLAYING') setActiveTab('TIMELINE');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0 font-display"
        >
          KKP Life Simulator
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-400">
          <button
            type="button"
            onClick={() => {
              if (gameState !== 'PLAYING') handleStartNewLife(true);
              else navigateCityTab('TIMELINE');
            }}
            className={`hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              gameState === 'PLAYING' && activeTab === 'TIMELINE'
                ? 'text-amber-700 dark:text-amber-400 underline underline-offset-8 decoration-2'
                : ''
            }`}
          >
            ตารางชีวิตปีนี้
          </button>
          <button
            type="button"
            onClick={() => {
              if (gameState !== 'PLAYING') handleStartNewLife(true);
              else navigateCityTab('ATHLETICS');
            }}
            className={`hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              gameState === 'PLAYING' && activeTab === 'ATHLETICS'
                ? 'text-amber-700 dark:text-amber-400 underline underline-offset-8 decoration-2'
                : ''
            }`}
          >
            ศูนย์ฝึกกีฬา
          </button>
          <button
            type="button"
            onClick={() => {
              if (gameState !== 'PLAYING') handleStartNewLife(true);
              else navigateCityTab('CAREER');
            }}
            className={`hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              gameState === 'PLAYING' && activeTab === 'CAREER'
                ? 'text-amber-700 dark:text-amber-400 underline underline-offset-8 decoration-2'
                : ''
            }`}
          >
            หางาน &amp; อาชีพ
          </button>
          <button
            type="button"
            onClick={() => {
              if (gameState !== 'PLAYING') handleStartNewLife(true);
              else navigateCityTab('UNDERWORLD');
            }}
            className={`hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              gameState === 'PLAYING' && activeTab === 'UNDERWORLD'
                ? 'text-rose-600 dark:text-rose-400 underline underline-offset-8 decoration-2'
                : ''
            }`}
          >
            สายมืด
          </button>
          <button
            type="button"
            onClick={() => {
              if (gameState !== 'PLAYING') handleStartNewLife(true);
              else navigateCityTab('ASSETS');
            }}
            className={`hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              gameState === 'PLAYING' && activeTab === 'ASSETS'
                ? 'text-amber-700 dark:text-amber-400 underline underline-offset-8 decoration-2'
                : ''
            }`}
          >
            ซื้อบ้าน &amp; รถ
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() =>
              gameState === 'TITLE_MENU' ? handleStartNewLife(true) : handleResetToMenu()
            }
            className="px-4 py-2 text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {gameState === 'TITLE_MENU' ? 'เริ่มชีวิตใหม่' : 'สร้างตระกูลใหม่'}
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 flex flex-col">
        {/* Clean Utility Bar (Sound & Light/Dark Theme Toggle — moves below primary card on mobile during active play) */}
        <div
          className={`flex flex-wrap items-center justify-between gap-3 ${
            gameState === 'PLAYING' ? 'max-lg:order-2 max-lg:mt-5 lg:mb-6' : 'mb-6'
          }`}
        >
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {gameState === 'PLAYING' ? (
              <span>
                กำลังเล่นเป็น <strong className="text-slate-900 dark:text-slate-100">{player.name}</strong>
                <span className="hidden sm:inline">
                  {' '}
                  · คีย์ลัด: กดเลข <span className="font-mono-num font-semibold">1–3</span> เลือกเหตุการณ์ และกด <span className="font-mono-num font-semibold">Enter</span> เพื่อจบปี
                </span>
              </span>
            ) : (
              <span>
                เกมจำลองชีวิตคนไทย · เลือกเส้นทางเรียน ทำงาน นักกีฬา หรือสายมืด และส่งต่อมรดกข้ามรุ่น
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSound}
              aria-label={soundMuted ? 'เปิดเสียง' : 'ปิดเสียง'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {soundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{soundMuted ? 'ปิดเสียงอยู่' : 'เปิดเสียงอยู่'}</span>
            </button>

            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              aria-label="สลับโหมดสีหน้าจอ"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{darkMode ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}</span>
            </button>
          </div>
        </div>

        {/* STATE 1: TITLE MENU & BIRTH GENERATOR */}
        {gameState === 'TITLE_MENU' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-7 flex">
                <StageArtwork age={0} variant="hero" />
              </div>

              {/* Clean Birth Setup & Visual Stat Preview */}
              <div className="lg:col-span-5 p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-6">
                <div className="space-y-5">
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                      สร้างตัวละครรุ่นที่ 1
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      สุ่มต้นทุนชีวิตแรกเกิดของคุณ
                    </h2>
                  </div>

                  {/* Biological Sex Selector */}
                  <div className="space-y-1.5">
                    <span className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                      เลือกเพศสภาพ (เพศชายจะมีเรียน รด. และเกณฑ์ทหารตอนอายุ 21 ปี)
                    </span>
                    <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                      <button
                        type="button"
                        onClick={() => handleSelectSex('MALE')}
                        className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                          selectedSex === 'MALE'
                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-amber-400 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        เพศชาย (มีเกณฑ์ทหาร)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectSex('FEMALE')}
                        className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                          selectedSex === 'FEMALE'
                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-amber-400 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        เพศหญิง
                      </button>
                    </div>
                  </div>

                  {/* Character Name Input */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="char-name-input"
                      className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300"
                    >
                      ชื่อ-นามสกุล
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="char-name-input"
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="ตั้งชื่อตัวละคร..."
                        className="flex-1 min-w-0 px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <button
                        type="button"
                        onClick={handleRandomName}
                        className="px-3.5 py-2.5 text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        สุ่มชื่อ
                      </button>
                    </div>
                  </div>

                  {/* Rolled Family Background */}
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 text-sm border-t border-b border-slate-100 dark:border-slate-800">
                    <div className="py-2.5 flex items-center justify-between gap-4">
                      <span className="text-slate-600 dark:text-slate-400">ฐานะครอบครัวที่สุ่มได้</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {LifeSimulatorEngine.getWealthLabel(previewChar.background.family_wealth)}
                      </span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between gap-4">
                      <span className="text-slate-600 dark:text-slate-400">บ้านเกิด</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {LifeSimulatorEngine.getLocationLabel(previewChar.background.location)}
                      </span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between gap-4">
                      <span className="text-slate-600 dark:text-slate-400">เงินขวัญถุงเริ่มต้น</span>
                      <span className="font-mono-num font-bold text-emerald-700 dark:text-emerald-400">
                        {previewChar.finance.cash.toLocaleString()} บาท
                      </span>
                    </div>
                  </div>

                  {/* Visual Initial Talent Bars */}
                  <div className="space-y-2.5">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      พรสวรรค์ติดตัวตั้งแต่เกิด (สุ่มใหม่ได้ไม่จำกัด)
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">สติปัญญา (INT)</span>
                          <span className="font-mono-num font-bold">{previewChar.stats.int}/100</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 origin-left"
                            style={{ transform: `scaleX(${previewChar.stats.int / 100})` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">เสน่ห์/สังคม (SOC)</span>
                          <span className="font-mono-num font-bold">{previewChar.stats.soc}/100</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-sky-500 origin-left"
                            style={{ transform: `scaleX(${previewChar.stats.soc / 100})` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">ทักษะกีฬา (ATH)</span>
                          <span className="font-mono-num font-bold">{previewChar.stats.ath}/100</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-amber-500 origin-left"
                            style={{ transform: `scaleX(${previewChar.stats.ath / 100})` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">โชคชะตา (LUK)</span>
                          <span className="font-mono-num font-bold">{previewChar.stats.luk}/10</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 origin-left"
                            style={{ transform: `scaleX(${previewChar.stats.luk / 10})` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleRerollPreview()}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Shuffle className="w-4 h-4" />
                    สุ่มต้นทุนใหม่
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStartNewLife(true)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm sm:text-base font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
                  >
                    <Play className="w-4 h-4" />
                    เริ่มใช้ชีวิตตั้งแต่อายุ 0 ปี
                  </button>
                </div>
              </div>
            </div>

            {/* 3-Step Instant Onboarding Guide */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="text-xs font-bold text-amber-700 dark:text-amber-400">
                  ขั้นตอนที่ 1 · ตัดสินใจเหตุการณ์ประจำปี
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  รับมือจุดเปลี่ยนชีวิตตามช่วงวัยคนไทย
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  ตั้งแต่เลือกสายเรียนตอนจบ ม.3 กู้ กยศ. ลุ้นจับใบดำ-ใบแดงตอนอายุ 21 ปี ไปจนถึงคลื่นเศรษฐกิจและเหตุการณ์ไม่คาดฝันที่ส่งผลต่อเนื่องในอีกหลายปีข้างหน้า
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="text-xs font-bold text-amber-700 dark:text-amber-400">
                  ขั้นตอนที่ 2 · แบ่งพลังงาน 100 แต้มต่อปี
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  เลือกทางเดินอิสระ: คนทำงาน นักกีฬา หรือสายมืด
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  จัดเวลาหลังเลิกเรียนหรือเลิกงานไปอ่านหนังสือสอบ ก.พ. เข้าค่ายฝึกซ้อมปั้นตัวสู่ทีมชาติ หรือเสี่ยงดวงในโลกใต้ดินพร้อมตั้งเซฟเฮาส์หนีการตามล่าของตำรวจ
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="text-xs font-bold text-amber-700 dark:text-amber-400">
                  ขั้นตอนที่ 3 · ผ่อนบ้านรถ &amp; ส่งต่อมรดกให้ลูก
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  สร้างตระกูลให้รุ่งเรืองข้ามเจเนอเรชัน
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  สะสมคอนโด บ้านเดี่ยว และเงินออมเพื่อยกระดับคุณภาพชีวิต เมื่อตัวละครจากไปและมีบุตร คุณสามารถเล่นต่อเป็นทายาทรุ่นลูกพร้อมรับมรดกและคอนเนกชันที่พ่อแม่สร้างไว้ได้ทันที
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STATE 2: ACTIVE GAMEPLAY */}
        {gameState === 'PLAYING' && (
          <div className="max-lg:order-1 flex flex-col gap-5 sm:gap-6">
            {/* AT-A-GLANCE 4-CARD SUMMARY STRIP (Shown below primary decision card on mobile, top on desktop) */}
            <div className="max-lg:order-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Age & Generation */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  อายุและช่วงปีปัจจุบัน
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono-num">
                    อายุ {player.age} ปี
                  </span>
                  <span className="text-xs font-mono-num text-slate-500 dark:text-slate-400">
                    พ.ศ. {player.birth_year_be + player.age}
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 truncate">
                  รุ่นที่ {player.background.generation} ·{' '}
                  {LifeSimulatorEngine.getWealthLabel(player.background.family_wealth)}
                </div>
              </div>

              {/* Card 2: Cash & Debt */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  เงินสดในมือตอนนี้
                </div>
                <div
                  className={`text-2xl font-bold font-mono-num ${
                    player.finance.cash >= 0
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {player.finance.cash.toLocaleString()} บ.
                </div>
                <div className="text-xs font-mono-num text-slate-600 dark:text-slate-400 truncate">
                  {totalDebtCombined > 0
                    ? `หนี้สินรวม ${totalDebtCombined.toLocaleString()} บาท`
                    : 'ปลอดหนี้สิน · การเงินคล่องตัว'}
                </div>
              </div>

              {/* Card 3: Active Role / Occupation */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  สถานะเรียน / อาชีพหลัก
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                  {primaryRoleSummary}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 truncate">
                  {currentSideJob
                    ? `งานเสริม: ${currentSideJob.title}`
                    : `วุฒิสูงสุด: ${currentEduNode.shortTitle}`}
                </div>
              </div>

              {/* Card 4: Turn Compass — What to Do Right Now */}
              <button
                type="button"
                onClick={() => navigateCityTab('TIMELINE')}
                className={`p-4 rounded-2xl border text-left transition-colors cursor-pointer space-y-1 ${
                  pendingEvent
                    ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-400 dark:border-amber-500/70 hover:bg-amber-100/70 dark:hover:bg-amber-950/50'
                    : 'bg-emerald-50/70 dark:bg-emerald-950/25 border-emerald-400/80 dark:border-emerald-500/50 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-xs font-bold">
                  <span
                    className={`inline-flex items-center gap-1.5 ${
                      pendingEvent
                        ? 'text-amber-800 dark:text-amber-300'
                        : 'text-emerald-800 dark:text-emerald-300'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5 shrink-0" />
                    สิ่งที่ต้องทำในปีนี้
                  </span>
                  <span className="underline">เปิดดู &rarr;</span>
                </div>
                <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                  {pendingEvent
                    ? 'เลือกตัดสินใจเหตุการณ์สำคัญ'
                    : `จัดตารางชีวิต (ว่าง ${freeSafeEnergy} แต้ม)`}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 truncate">
                  {pendingEvent
                    ? pendingEvent.title
                    : `พร้อมกดจบปีเพื่อก้าวสู่อายุ ${player.age + 1} ปี`}
                </div>
              </button>
            </div>

            <div className="max-lg:order-1 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
              {/* LEFT SIDEBAR: Clean Character Sheet with Visual Bars (Ordered below workspace on mobile) */}
              <aside className="max-lg:order-2 lg:col-span-4">
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
                  {/* Character Identity Header */}
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                      ข้อมูลตัวละคร · เพศ{player.sex === 'MALE' ? 'ชาย' : 'หญิง'}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 truncate">
                      {player.name}
                    </h2>
                    <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      บ้านเกิด: {LifeSimulatorEngine.getLocationLabel(player.background.location)}
                    </div>
                  </div>

                  {/* Stage Artwork Hairline Section */}
                  <StageArtwork
                    age={player.age}
                    birthYearBe={player.birth_year_be}
                    variant="stage"
                  />

                  {/* Vital & Attribute Visual Bars */}
                  <div className="space-y-3.5">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      พลังชีวิตและทักษะประจำตัว
                    </div>

                    {/* HP */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          สุขภาพกาย (HP)
                        </span>
                        <span className="font-mono-num font-bold text-slate-900 dark:text-slate-100">
                          {player.stats.hp}/100 ·{' '}
                          <span
                            className={
                              player.stats.hp < 30
                                ? 'text-rose-600 dark:text-rose-400'
                                : player.stats.hp < 60
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-emerald-700 dark:text-emerald-400'
                            }
                          >
                            {player.stats.hp < 30
                              ? 'ทรุดหนัก'
                              : player.stats.hp < 60
                              ? 'อ่อนล้า'
                              : 'แข็งแรง'}
                          </span>
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full transition-transform duration-150 origin-left ${
                            player.stats.hp < 30
                              ? 'bg-rose-500'
                              : player.stats.hp < 60
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ transform: `scaleX(${player.stats.hp / 100})` }}
                        />
                      </div>
                    </div>

                    {/* SAN */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          ความสุขใจ (SAN)
                        </span>
                        <span className="font-mono-num font-bold text-slate-900 dark:text-slate-100">
                          {player.stats.san}/100 ·{' '}
                          <span
                            className={
                              player.stats.san < 30
                                ? 'text-rose-600 dark:text-rose-400'
                                : player.stats.san < 60
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-sky-700 dark:text-sky-400'
                            }
                          >
                            {player.stats.san < 30
                              ? 'เครียดจัด'
                              : player.stats.san < 60
                              ? 'ตึงเครียด'
                              : 'แจ่มใส'}
                          </span>
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full transition-transform duration-150 origin-left ${
                            player.stats.san < 30
                              ? 'bg-rose-500'
                              : player.stats.san < 60
                              ? 'bg-amber-500'
                              : 'bg-sky-500'
                          }`}
                          style={{ transform: `scaleX(${player.stats.san / 100})` }}
                        />
                      </div>
                    </div>

                    {/* INT */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-slate-600 dark:text-slate-400">สติปัญญา (INT)</span>
                        <span className="font-mono-num font-bold text-slate-900 dark:text-slate-100">
                          {player.stats.int}/100
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 transition-transform duration-150 origin-left"
                          style={{ transform: `scaleX(${player.stats.int / 100})` }}
                        />
                      </div>
                    </div>

                    {/* SOC */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-slate-600 dark:text-slate-400">
                          เสน่ห์และคอนเนกชัน (SOC)
                        </span>
                        <span className="font-mono-num font-bold text-slate-900 dark:text-slate-100">
                          {player.stats.soc}/100
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-violet-500 transition-transform duration-150 origin-left"
                          style={{ transform: `scaleX(${player.stats.soc / 100})` }}
                        />
                      </div>
                    </div>

                    {/* ATH */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-slate-600 dark:text-slate-400">ทักษะกีฬา (ATH)</span>
                        <span className="font-mono-num font-bold text-amber-700 dark:text-amber-400">
                          {player.stats.ath}/100
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-amber-500 transition-transform duration-150 origin-left"
                          style={{ transform: `scaleX(${player.stats.ath / 100})` }}
                        />
                      </div>
                    </div>

                    {/* Neighborhood Affinity & Luck */}
                    <div className="pt-2 flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-slate-600 dark:text-slate-400">มิตรภาพคนในซอย</span>
                      <span className="font-mono-num font-semibold text-emerald-700 dark:text-emerald-400">
                        {localAffinityScore}/100 ·{' '}
                        {StreetEncounterEngine.getAffinityTierLabel(localAffinityScore)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-slate-600 dark:text-slate-400">โชคชะตา (LUK)</span>
                      <span className="font-mono-num font-semibold text-slate-900 dark:text-slate-100">
                        {player.stats.luk} / 10
                      </span>
                    </div>
                  </div>

                  {/* Historical Stat Growth D3 Line Chart */}
                  <StatHistoryChart player={player} darkMode={darkMode} />

                  {/* Cashflow & Economy Section */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs sm:text-sm">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      รายรับ-รายจ่าย และเศรษฐกิจไทย
                    </div>

                    <div className="flex items-center justify-between font-mono-num">
                      <span className="font-sans text-slate-600 dark:text-slate-400">
                        รายรับปีล่าสุด
                      </span>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                        +{player.finance.annual_income.toLocaleString()} บ.
                      </span>
                    </div>

                    <div className="flex items-center justify-between font-mono-num">
                      <span className="font-sans text-slate-600 dark:text-slate-400">
                        รายจ่ายปีล่าสุด
                      </span>
                      <span className="font-semibold text-rose-600 dark:text-rose-400">
                        -{player.finance.annual_expense.toLocaleString()} บ.
                      </span>
                    </div>

                    {player.finance.debt > 0 && (
                      <div className="flex items-center justify-between font-mono-num">
                        <span className="font-sans text-slate-600 dark:text-slate-400">
                          หนี้ดอกเบี้ยสูง
                        </span>
                        <span className="font-bold text-rose-600 dark:text-rose-400">
                          {player.finance.debt.toLocaleString()} บ.
                        </span>
                      </div>
                    )}

                    {player.finance.student_loan_debt > 0 && (
                      <div className="flex items-center justify-between font-mono-num">
                        <span className="font-sans text-slate-600 dark:text-slate-400">
                          หนี้ กยศ. (ดอก 1%)
                        </span>
                        <span className="font-semibold text-amber-700 dark:text-amber-400">
                          {player.finance.student_loan_debt.toLocaleString()} บ.
                        </span>
                      </div>
                    )}

                    <div className="pt-1 flex items-center justify-between gap-2">
                      <span className="text-slate-600 dark:text-slate-400">สภาวะเศรษฐกิจ</span>
                      <span
                        className={`font-semibold text-right ${
                          player.macro_economy.current_state === 'BOOM'
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : player.macro_economy.current_state === 'NORMAL'
                            ? 'text-slate-800 dark:text-slate-200'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {macroConfig.label}
                      </span>
                    </div>
                  </div>

                  {/* Personal Flags & Important Status Notes */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs sm:text-sm">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      สถานะสำคัญติดตัว
                    </div>

                    <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {[
                        player.flags.is_married ? 'สมรสแล้ว' : 'สถานะโสด',
                        player.flags.has_children ? 'มีบุตรสืบสกุลแล้ว' : null,
                        player.sex === 'MALE' && player.education.rotc_level >= 3
                          ? 'จบ รด. ปี 3 (ไม่ติดทหาร)'
                          : null,
                        player.flags.is_burnout ? 'ติดภาวะไฟมอด (พลังงานปีนี้เหลือ 70)' : null,
                        player.flags.has_chronic_disease ? 'มีโรคประจำตัวเรื้อรัง' : null,
                        player.finance.credit_score === 'BAD' ? 'ติดเครดิตบูโร' : null,
                        player.flags.is_criminal_record ? 'มีประวัติอาชญากรรม' : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </div>

                    {player.career.championship_medals > 0 && (
                      <div className="text-amber-700 dark:text-amber-400 font-semibold font-mono-num">
                        เหรียญทอง / แชมป์กีฬาอาชีพ: {player.career.championship_medals} สมัย
                      </div>
                    )}

                    {(player.career.notoriety > 0 || liveArrestRisk.hasActiveThreat) && (
                      <div className="text-rose-600 dark:text-rose-400 font-semibold font-mono-num">
                        หมายจับสายมืด {player.career.notoriety}/100
                        {liveArrestRisk.hasActiveThreat
                          ? ` · เสี่ยงโดนจับ ${liveArrestRisk.totalRiskPct}%/ปี`
                          : ''}
                      </div>
                    )}

                    {currentSafehouse && player.career.prison_years_left === 0 && (
                      <div className="text-emerald-700 dark:text-emerald-400 font-medium">
                        แหล่งกบดาน: {currentSafehouse.name} (ความลับ {player.career.safehouse_security}%)
                      </div>
                    )}
                  </div>
                </div>
              </aside>

              {/* RIGHT MAIN PANEL: Clear 6-Tab City Workspace (Ordered first on mobile) */}
              <section className="max-lg:order-1 lg:col-span-8 flex flex-col gap-4 sm:gap-5">
                {/* Clean 6-Tab Bar */}
                <div className="max-lg:-order-1 flex items-center gap-1 p-1.5 bg-slate-200/75 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => navigateCityTab('TIMELINE')}
                    className={`flex-1 px-3 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      activeTab === 'TIMELINE'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-amber-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    ตารางชีวิตปีนี้
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateCityTab('ATHLETICS')}
                    className={`flex-1 px-3 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      activeTab === 'ATHLETICS'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-amber-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    ศูนย์ฝึกกีฬา
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateCityTab('EDUCATION')}
                    className={`flex-1 px-3 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      activeTab === 'EDUCATION'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-amber-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    เรียนต่อ &amp; กยศ.
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateCityTab('CAREER')}
                    className={`flex-1 px-3 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      activeTab === 'CAREER'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-amber-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    หางาน &amp; อาชีพ
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateCityTab('UNDERWORLD')}
                    className={`flex-1 px-3 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      activeTab === 'UNDERWORLD'
                        ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    สายมืด &amp; กบดาน
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateCityTab('ASSETS')}
                    className={`flex-1 px-3 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      activeTab === 'ASSETS'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-amber-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    ซื้อบ้าน &amp; รถ ({player.assets.length})
                  </button>
                </div>

                {/* Calm Neutral Routine Update Banner (Differentiated from Priority Toast System) */}
                {toastMessage && (
                  <div className="px-5 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 flex items-center justify-between gap-3">
                    <span>
                      <strong>ผลลัพธ์ล่าสุด:</strong> {toastMessage}
                    </span>
                    <button
                      type="button"
                      onClick={() => setToastMessage(null)}
                      className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      รับทราบ
                    </button>
                  </div>
                )}

                {/* Subtle Upcoming Milestone Notifications */}
                <MilestoneTray
                  milestones={activeMilestones}
                  dismissedIds={dismissedMilestoneIds}
                  onDismiss={(id) => setDismissedMilestoneIds((prev) => [...prev, id])}
                  onNavigateTab={(tab) => navigateCityTab(tab)}
                />

                {/* TAB 1: TIMELINE & ANNUAL ENERGY ALLOCATION */}
                {activeTab === 'TIMELINE' && (
                  <div className="max-lg:contents lg:space-y-6">
                    {pendingEvent ? (
                      <div
                        id="active-annual-event"
                        className={`max-lg:-order-2 p-4 sm:p-7 rounded-2xl bg-[#dcdcdc] dark:bg-slate-900 border-2 space-y-4 sm:space-y-5 ${
                          pendingEvent.category === 'CRITICAL'
                            ? 'border-rose-500/80 dark:border-rose-500/80'
                            : pendingEvent.category === 'MILESTONE_THAI'
                            ? 'border-indigo-600/80 dark:border-amber-400/80'
                            : 'border-amber-500/70'
                        }`}
                      >
                        <div className="space-y-1.5 sm:space-y-2">
                          <div
                            className={`text-[10px] sm:text-[12px] font-bold ${
                              pendingEvent.category === 'CRITICAL'
                                ? 'text-rose-700 dark:text-rose-400'
                                : pendingEvent.category === 'MILESTONE_THAI'
                                ? 'text-indigo-700 dark:text-amber-300'
                                : 'text-amber-700 dark:text-amber-400'
                            }`}
                          >
                            {pendingEvent.category === 'CRITICAL'
                              ? `เหตุวิกฤตฉุกเฉิน · อายุ ${player.age} ปี (เลือก 1 ข้อเพื่อรับมือทันที)`
                              : pendingEvent.category === 'MILESTONE_THAI'
                              ? `หมุดหมายชีวิตไทย · อายุ ${player.age} ปี (เลือก 1 ข้อเพื่อไปต่อ)`
                              : `เหตุการณ์ประจำปี · อายุ ${player.age} ปี (เลือก 1 ข้อเพื่อไปต่อ)`}
                          </div>
                          <h3 className="text-[18px] sm:text-[22px] font-bold text-slate-900 dark:text-slate-100">
                            {pendingEvent.title}
                          </h3>
                          <p className="text-[12px] sm:text-[14px] text-slate-700 dark:text-slate-300 leading-relaxed">
                            {pendingEvent.description}
                          </p>
                        </div>

                        <div className="space-y-2.5 sm:space-y-3">
                          {pendingEvent.choices.map((choice, idx) => (
                            <button
                              key={choice.id}
                              type="button"
                              onClick={() => handleSelectEventChoice(idx)}
                              className="w-full text-left p-3.5 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 bg-slate-50/90 dark:bg-slate-950/60 hover:bg-amber-50/70 dark:hover:bg-slate-800/80 transition-colors flex items-center justify-between gap-3 sm:gap-4 cursor-pointer"
                            >
                              <div className="space-y-1">
                                <div className="text-[12px] sm:text-[14px] font-bold text-slate-900 dark:text-slate-100">
                                  <span className="font-mono-num text-amber-700 dark:text-amber-400 mr-2">
                                    [{idx + 1}]
                                  </span>
                                  {choice.label}
                                </div>
                                {choice.sublabel && (
                                  <div className="text-[10px] sm:text-[12px] text-slate-600 dark:text-slate-400 pl-6 leading-relaxed">
                                    {choice.sublabel}
                                  </div>
                                )}
                              </div>
                              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 dark:text-slate-400 shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <EnergyPlannerView
                        player={player}
                        allocations={energyAllocations}
                        onChangeAllocation={(unitId, nextCount) =>
                          setEnergyAllocations((prev) => ({
                            ...prev,
                            [unitId]: nextCount,
                          }))
                        }
                        onResetAllocations={() => setEnergyAllocations({})}
                        onExecuteYear={handleExecuteAnnualTurn}
                        onOpenAthletics={() => navigateCityTab('ATHLETICS')}
                      />
                    )}

                    {/* Calm Street Encounter Bar placed right below primary turn action so it never blocks decisions */}
                    <StreetEncounterStrip
                      player={player}
                      onStrollDistrict={handleStrollDistrict}
                      onTakeReaction={handleTakeStreetReaction}
                    />

                    {/* Readable Annual Life Chronicle Feed */}
                    <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                          บันทึกเรื่องราวชีวิตที่ผ่านมา
                        </h3>
                        <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mono-num">
                          สะสม {player.history.length} ปี
                        </span>
                      </div>

                      <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 pr-2">
                        {player.history.map((log, index) => (
                          <div key={`${log.age}-${index}`} className="py-4 space-y-1.5">
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm font-mono-num">
                              <span className="font-bold text-slate-700 dark:text-slate-300">
                                อายุ {log.age} ปี · พ.ศ. {log.year_be}
                              </span>
                              <span
                                className={
                                  log.net_finance_delta >= 0
                                    ? 'font-semibold text-emerald-700 dark:text-emerald-400'
                                    : 'font-semibold text-rose-600 dark:text-rose-400'
                                }
                              >
                                เงินสุทธิปีนี้ {log.net_finance_delta >= 0 ? '+' : ''}
                                {log.net_finance_delta.toLocaleString()} บ.
                              </span>
                            </div>
                            <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                              {log.headline}
                            </div>
                            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 leading-relaxed">
                              {log.details.map((line, i) => (
                                <li key={i}>— {line}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: ATHLETIC TRAINING MODULE */}
                {activeTab === 'ATHLETICS' && (
                  <div className="space-y-5">
                    <AthleticTrainingView
                      player={player}
                      onExecuteTraining={handleExecuteAthleticTraining}
                      onNavigateCareer={() => navigateCityTab('CAREER')}
                    />
                    <StreetEncounterStrip
                      player={player}
                      onStrollDistrict={handleStrollDistrict}
                      onTakeReaction={handleTakeStreetReaction}
                    />
                  </div>
                )}

                {/* TAB 3: EDUCATION TREE & STUDENT LOANS */}
                {activeTab === 'EDUCATION' && (
                  <div className="space-y-5">
                    <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <EducationTreeView player={player} onEnroll={handleEnrollEducation} />
                    </div>
                    <StreetEncounterStrip
                      player={player}
                      onStrollDistrict={handleStrollDistrict}
                      onTakeReaction={handleTakeStreetReaction}
                    />
                  </div>
                )}

                {/* TAB 4: CAREER MATRIX & LICENSES */}
                {activeTab === 'CAREER' && (
                  <div className="space-y-5">
                    <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <CareerMatrixView
                        player={player}
                        onApplyJob={handleApplyJob}
                        onQuitJob={handleQuitJob}
                        onTakeLicense={handleTakeLicense}
                      />
                    </div>
                    <StreetEncounterStrip
                      player={player}
                      onStrollDistrict={handleStrollDistrict}
                      onTakeReaction={handleTakeStreetReaction}
                    />
                  </div>
                )}

                {/* TAB 5: UNDERWORLD, CAREER LADDER & SAFEHOUSES */}
                {activeTab === 'UNDERWORLD' && (
                  <div className="space-y-5">
                    <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <UnderworldPanel
                        player={player}
                        onExecuteOperation={handleExecuteCrimeOperation}
                        onBribeReduceNotoriety={handleBribeReduceNotoriety}
                        onAcquireSafehouse={handleAcquireSafehouse}
                        onRelocateSafehouse={handleRelocateSafehouse}
                        onAbandonSafehouse={handleAbandonSafehouse}
                        onLayLow={handleLayLow}
                        onApplyJob={handleApplyJob}
                        onQuitJob={handleQuitJob}
                      />
                    </div>
                    <StreetEncounterStrip
                      player={player}
                      onStrollDistrict={handleStrollDistrict}
                      onTakeReaction={handleTakeStreetReaction}
                    />
                  </div>
                )}

                {/* TAB 6: ASSETS & LIABILITIES MARKET */}
                {activeTab === 'ASSETS' && (
                  <div className="space-y-5">
                    <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <AssetMarketView
                        player={player}
                        onPurchaseAsset={handlePurchaseAsset}
                        onSellOrCancelAsset={handleSellOrCancelAsset}
                      />
                    </div>
                    <StreetEncounterStrip
                      player={player}
                      onStrollDistrict={handleStrollDistrict}
                      onTakeReaction={handleTakeStreetReaction}
                    />
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {/* STATE 3: GAME OVER & GENERATIONAL LEGACY TRANSITION */}
        {gameState === 'GAME_OVER' && (
          <GameOverSummary
            player={player}
            onRestart={handleResetToMenu}
            onContinueAsChild={handleContinueAsNextGenChild}
          />
        )}
      </main>

      {/* Priority Notification Toast System (Strictly for 'CRITICAL' & 'MILESTONE_THAI' events) */}
      {gameState === 'PLAYING' && (
        <PriorityEventToast
          toasts={priorityToasts}
          soundMuted={soundMuted}
          onDismiss={dismissPriorityToast}
          onFocusEvent={focusPriorityToastEvent}
        />
      )}

      {/* Optional Character JSON State Modal (Moved out of primary tabs for clean UX) */}
      {showSchemaModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="ข้อมูลสถานะตัวละครแบบ JSON"
          className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4"
        >
          <div className="w-full max-w-3xl max-h-[85vh] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  ข้อมูลสถานะตัวละครปัจจุบัน (Live Player JSON)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSchemaModal(false)}
                aria-label="ปิดหน้าต่าง JSON"
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto">
              <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 text-xs font-mono-num overflow-x-auto leading-relaxed">
                {JSON.stringify(cleanPlayerSchemaJson, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Quiet Footer */}
      <footer className="mt-12 border-t border-slate-200 dark:border-slate-800 py-5 px-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>KKP Life Simulator · เกมจำลองชีวิตจริงตามบริบทสังคมและการเงินไทย</span>
          {gameState === 'PLAYING' && (
            <button
              type="button"
              onClick={() => setShowSchemaModal(true)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>ดูข้อมูลตัวละคร JSON</span>
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
