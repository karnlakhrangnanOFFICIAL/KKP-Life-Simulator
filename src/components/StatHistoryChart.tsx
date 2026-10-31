import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { PlayerData } from '../engine/types';

type StatKey = 'hp' | 'san' | 'int' | 'soc' | 'ath';

interface StatSeriesConfig {
  key: StatKey;
  shortLabel: string;
  thaiLabel: string;
  color: string;
}

export interface StatHistoryPoint {
  age: number;
  hp: number;
  san: number;
  int: number;
  soc: number;
  ath: number;
}

const STAT_SERIES: StatSeriesConfig[] = [
  { key: 'hp', shortLabel: 'HP', thaiLabel: 'สุขภาพกาย', color: '#10b981' },
  { key: 'san', shortLabel: 'SAN', thaiLabel: 'ความสุขใจ', color: '#0ea5e9' },
  { key: 'int', shortLabel: 'INT', thaiLabel: 'สติปัญญา', color: '#6366f1' },
  { key: 'soc', shortLabel: 'SOC', thaiLabel: 'เสน่ห์/สังคม', color: '#8b5cf6' },
  { key: 'ath', shortLabel: 'ATH', thaiLabel: 'ทักษะกีฬา', color: '#f59e0b' },
];

interface StatHistoryChartProps {
  player: PlayerData;
  darkMode: boolean;
}

export const StatHistoryChart: React.FC<StatHistoryChartProps> = ({ player, darkMode }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [chartWidth, setChartWidth] = useState<number>(320);
  const [visibleKeys, setVisibleKeys] = useState<Record<StatKey, boolean>>({
    hp: true,
    san: true,
    int: true,
    soc: true,
    ath: true,
  });
  const [hoveredAge, setHoveredAge] = useState<number | null>(null);

  // Build chronological stat series from age 0 -> current age, keeping current age synced live
  const dataPoints = useMemo<StatHistoryPoint[]>(() => {
    const byAge = new Map<number, StatHistoryPoint>();

    // Chronological order (history is stored newest-first via unshift)
    const chronological = [...player.history].reverse();

    let lastInt = player.stats.int;
    let lastSoc = player.stats.soc;
    let lastAth = player.stats.ath;

    if (chronological.length > 0) {
      lastInt = chronological[0].int_after ?? player.stats.int;
      lastSoc = chronological[0].soc_after ?? player.stats.soc;
      lastAth = chronological[0].ath_after ?? player.stats.ath;
    }

    for (const entry of chronological) {
      const resolvedInt = entry.int_after ?? lastInt;
      const resolvedSoc = entry.soc_after ?? lastSoc;
      const resolvedAth = entry.ath_after ?? lastAth;
      lastInt = resolvedInt;
      lastSoc = resolvedSoc;
      lastAth = resolvedAth;

      byAge.set(entry.age, {
        age: entry.age,
        hp: entry.hp_after,
        san: entry.san_after,
        int: resolvedInt,
        soc: resolvedSoc,
        ath: resolvedAth,
      });
    }

    // Always reflect live in-year stat updates (e.g., training, events, street encounters) at current age
    byAge.set(player.age, {
      age: player.age,
      hp: player.stats.hp,
      san: player.stats.san,
      int: player.stats.int,
      soc: player.stats.soc,
      ath: player.stats.ath,
    });

    return Array.from(byAge.values()).sort((a, b) => a.age - b.age);
  }, [
    player.history,
    player.age,
    player.stats.hp,
    player.stats.san,
    player.stats.int,
    player.stats.soc,
    player.stats.ath,
  ]);

  // Observe container width for crisp responsive D3 rendering
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const nextWidth = Math.max(240, Math.floor(el.getBoundingClientRect().width));
      setChartWidth(nextWidth);
    };

    updateSize();
    const observer = new ResizeObserver(() => updateSize());
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  // Reset hover state if character resets to younger age
  useEffect(() => {
    if (hoveredAge !== null && hoveredAge > player.age) {
      setHoveredAge(null);
    }
  }, [player.age, hoveredAge]);

  const activePoint: StatHistoryPoint = useMemo(() => {
    if (hoveredAge !== null) {
      const found = dataPoints.find((p) => p.age === hoveredAge);
      if (found) return found;
    }
    return (
      dataPoints[dataPoints.length - 1] || {
        age: player.age,
        hp: player.stats.hp,
        san: player.stats.san,
        int: player.stats.int,
        soc: player.stats.soc,
        ath: player.stats.ath,
      }
    );
  }, [hoveredAge, dataPoints, player.age, player.stats]);

  // Render D3 multi-line chart
  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const height = 188;
    const margin = { top: 12, right: 12, bottom: 26, left: 30 };
    const innerWidth = Math.max(120, chartWidth - margin.left - margin.right);
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${chartWidth} ${height}`);

    const gridStroke = darkMode ? '#1e293b' : '#f1f5f9';
    const axisTextFill = darkMode ? '#94a3b8' : '#64748b';
    const crosshairStroke = darkMode ? '#475569' : '#cbd5e1';
    const pointStroke = darkMode ? '#0f172a' : '#ffffff';

    const maxDomainAge = Math.max(5, d3.max(dataPoints, (d) => d.age) ?? 5);

    const xScale = d3.scaleLinear().domain([0, maxDomainAge]).range([0, innerWidth]);
    const yScale = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0]);

    const rootG = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Horizontal Y gridlines (0, 25, 50, 75, 100)
    const yTicks = [0, 25, 50, 75, 100];
    rootG
      .append('g')
      .selectAll('line')
      .data(yTicks)
      .join('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', (d) => yScale(d))
      .attr('y2', (d) => yScale(d))
      .attr('stroke', gridStroke)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', (d) => (d === 0 ? 'none' : '3,3'));

    // Y-axis labels
    rootG
      .append('g')
      .selectAll('text')
      .data([0, 50, 100])
      .join('text')
      .attr('x', -6)
      .attr('y', (d) => yScale(d))
      .attr('dy', '0.32em')
      .attr('text-anchor', 'end')
      .attr('fill', axisTextFill)
      .attr('font-size', '10px')
      .attr('font-family', 'var(--font-mono)')
      .text((d) => String(d));

    // X-axis integer age ticks
    const tickCount = Math.min(maxDomainAge, 5);
    const rawXTicks = xScale.ticks(tickCount).filter((t) => Number.isInteger(t));
    if (!rawXTicks.includes(0)) rawXTicks.unshift(0);
    if (player.age > 0 && !rawXTicks.includes(player.age) && maxDomainAge <= 12) {
      rawXTicks.push(player.age);
    }

    rootG
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .selectAll('text')
      .data(rawXTicks)
      .join('text')
      .attr('x', (d) => xScale(d))
      .attr('y', 18)
      .attr('text-anchor', (d) =>
        d === 0 ? 'start' : d === maxDomainAge ? 'end' : 'middle'
      )
      .attr('fill', axisTextFill)
      .attr('font-size', '10px')
      .attr('font-family', 'var(--font-mono)')
      .text((d) => `${d} ปี`);

    // Active hover vertical guide line
    if (hoveredAge !== null) {
      const hoverPt = dataPoints.find((p) => p.age === hoveredAge);
      if (hoverPt) {
        rootG
          .append('line')
          .attr('x1', xScale(hoverPt.age))
          .attr('x2', xScale(hoverPt.age))
          .attr('y1', 0)
          .attr('y2', innerHeight)
          .attr('stroke', crosshairStroke)
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '2,2');
      }
    }

    // Draw lines and endpoint/hover markers for each enabled stat series
    const enabledSeries = STAT_SERIES.filter((s) => visibleKeys[s.key]);

    for (const series of enabledSeries) {
      if (dataPoints.length >= 2) {
        const lineGen = d3
          .line<StatHistoryPoint>()
          .x((d) => xScale(d.age))
          .y((d) => yScale(d[series.key]))
          .curve(d3.curveMonotoneX);

        rootG
          .append('path')
          .datum(dataPoints)
          .attr('fill', 'none')
          .attr('stroke', series.color)
          .attr('stroke-width', 2)
          .attr('stroke-linecap', 'round')
          .attr('stroke-linejoin', 'round')
          .attr('d', lineGen);
      }

      // Draw marker on either hovered point or latest age point
      const focusPoint =
        hoveredAge !== null
          ? dataPoints.find((p) => p.age === hoveredAge)
          : dataPoints[dataPoints.length - 1];

      if (focusPoint) {
        rootG
          .append('circle')
          .attr('cx', xScale(focusPoint.age))
          .attr('cy', yScale(focusPoint[series.key]))
          .attr('r', hoveredAge !== null ? 4 : 3.2)
          .attr('fill', series.color)
          .attr('stroke', pointStroke)
          .attr('stroke-width', 1.5);
      }
    }

    // Transparent pointer overlay using d3.bisector for smooth age scrubbing
    const bisectAge = d3.bisector<StatHistoryPoint, number>((d) => d.age).center;

    rootG
      .append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair')
      .on('pointermove', (event: PointerEvent) => {
        if (dataPoints.length === 0) return;
        const [mx] = d3.pointer(event);
        const ageAtPointer = xScale.invert(mx);
        const idx = bisectAge(dataPoints, ageAtPointer);
        const clampedIdx = Math.max(0, Math.min(dataPoints.length - 1, idx));
        const nearest = dataPoints[clampedIdx];
        if (nearest) {
          setHoveredAge((prev) => (prev === nearest.age ? prev : nearest.age));
        }
      })
      .on('pointerleave', () => {
        setHoveredAge(null);
      });
  }, [dataPoints, chartWidth, darkMode, visibleKeys, hoveredAge, player.age]);

  const toggleSeries = (key: StatKey) => {
    setVisibleKeys((prev) => {
      const activeCount = Object.values(prev).filter(Boolean).length;
      if (prev[key] && activeCount <= 1) {
        return prev; // Keep at least 1 line visible
      }
      return { ...prev, [key]: !prev[key] };
    });
  };

  return (
    <div
      ref={containerRef}
      className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
          กราฟพัฒนาการค่าสถานะตามอายุ
        </div>
        <span className="text-xs font-mono-num text-slate-500 dark:text-slate-400">
          {hoveredAge !== null ? `ดูย้อนหลัง อายุ ${activePoint.age} ปี` : `ปัจจุบัน อายุ ${activePoint.age} ปี`}
        </span>
      </div>

      {/* Interactive Series Toggle Buttons + Live Readout */}
      <div className="flex flex-wrap items-center gap-1.5">
        {STAT_SERIES.map((s) => {
          const active = visibleKeys[s.key];
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => toggleSeries(s.key)}
              title={`เปิด/ปิดเส้น ${s.thaiLabel} (${s.shortLabel})`}
              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-mono-num transition-opacity cursor-pointer whitespace-nowrap shrink-0 ${
                active
                  ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 opacity-100'
                  : 'border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-600 opacity-50'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: s.color }}
                aria-hidden="true"
              />
              <span className="font-semibold">{s.shortLabel}</span>
              <span>{activePoint[s.key]}</span>
            </button>
          );
        })}
      </div>

      {/* D3 Line Chart Canvas */}
      <div className="w-full overflow-hidden">
        <svg
          ref={svgRef}
          className="w-full h-[188px] block select-none"
          role="img"
          aria-label="กราฟเส้นแสดงการเปลี่ยนแปลงค่าสถานะ HP, SAN, INT, SOC และ ATH ตามอายุ"
        />
      </div>

      {dataPoints.length < 2 && (
        <div className="text-xs text-slate-500 dark:text-slate-400">
          เส้นกราฟจะวาดต่อกันอัตโนมัติทุกครั้งที่ก้าวสู่อายุถัดไป (เลื่อนเมาส์บนกราฟเพื่อเทียบค่าแต่ละปีได้)
        </div>
      )}
    </div>
  );
};
