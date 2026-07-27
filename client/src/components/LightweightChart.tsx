"use client";
import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ColorType, CandlestickData, CandlestickSeries, HistogramSeries, LineSeries } from 'lightweight-charts';
import { useTheme } from 'next-themes';

interface ChartProps {
  symbol?: string;
  data: CandlestickData[];
  volumeData?: { time: string; value: number; color: string }[];
  maData?: { time: string; value: number }[];
  ma50Data?: { time: string; value: number }[];
  ma200Data?: { time: string; value: number }[];
  bbUpperData?: { time: string; value: number }[];
  bbLowerData?: { time: string; value: number }[];
}

const prepareData = <T extends { time: string | number }>(data: T[] | undefined): T[] | undefined => {
  if (!data || data.length === 0) return data;
  const unique = new Map<string | number, T>();
  data.forEach(item => {
    unique.set(item.time, item);
  });
  return Array.from(unique.values()).sort((a, b) => {
    const timeA = typeof a.time === 'string' ? new Date(a.time).getTime() : a.time;
    const timeB = typeof b.time === 'string' ? new Date(b.time).getTime() : b.time;
    return timeA - timeB;
  });
};

export const LightweightChart: React.FC<ChartProps> = ({
  symbol = 'Symbol',
  data,
  volumeData,
  maData,
  ma50Data,
  ma200Data,
  bbUpperData,
  bbLowerData,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const { resolvedTheme } = useTheme();

  const [tooltipData, setTooltipData] = useState<{
    time?: string;
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    volume?: number;
    ma?: number;
    ma50?: number;
    ma200?: number;
  } | null>(null);

  const themeColors = React.useMemo(() => ({
    backgroundColor: 'transparent',
    textColor: resolvedTheme === 'dark' ? '#94a3b8' : '#64748b',
    gridColor: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    upColor: '#10b981',
    downColor: '#ef4444',
  }), [resolvedTheme]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: themeColors.backgroundColor },
        textColor: themeColors.textColor,
      },
      grid: {
        vertLines: { color: themeColors.gridColor },
        horzLines: { color: themeColors.gridColor },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: 1, // Normal
      },
      rightPriceScale: {
        borderColor: themeColors.gridColor,
      }
    });
    
    chartRef.current = chart;

    // Candlestick Series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: themeColors.upColor,
      downColor: themeColors.downColor,
      borderVisible: false,
      wickUpColor: themeColors.upColor,
      wickDownColor: themeColors.downColor,
    });
    
    if (data && data.length > 0) {
      const preparedData = prepareData(data as any);
      if (preparedData) candleSeries.setData(preparedData as any);
    }

    // Volume Series
    let volumeSeries: any = null;
    if (volumeData && volumeData.length > 0) {
      volumeSeries = chart.addSeries(HistogramSeries, {
        color: '#26a69a',
        priceFormat: { type: 'volume' },
        priceScaleId: '',
      });
      chart.priceScale('').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
      const preparedVolume = prepareData(volumeData);
      if (preparedVolume) volumeSeries.setData(preparedVolume as any);
    }

    // Moving Average Series
    let maSeries: any = null;
    if (maData && maData.length > 0) {
      maSeries = chart.addSeries(LineSeries, { color: '#00d4ff', lineWidth: 2, crosshairMarkerVisible: false });
      const preparedMa = prepareData(maData);
      if (preparedMa) maSeries.setData(preparedMa as any);
    }
    
    let ma50Series: any = null;
    if (ma50Data && ma50Data.length > 0) {
      ma50Series = chart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 2, crosshairMarkerVisible: false });
      const preparedMa50 = prepareData(ma50Data);
      if (preparedMa50) ma50Series.setData(preparedMa50 as any);
    }
    
    let ma200Series: any = null;
    if (ma200Data && ma200Data.length > 0) {
      ma200Series = chart.addSeries(LineSeries, { color: '#ef4444', lineWidth: 2, crosshairMarkerVisible: false });
      const preparedMa200 = prepareData(ma200Data);
      if (preparedMa200) ma200Series.setData(preparedMa200 as any);
    }

    // Bollinger Bands
    if (bbUpperData && bbUpperData.length > 0) {
      const bbUpper = chart.addSeries(LineSeries, { color: 'rgba(124,58,237,0.5)', lineWidth: 1, lineStyle: 2, crosshairMarkerVisible: false });
      const preparedBbUpper = prepareData(bbUpperData);
      if (preparedBbUpper) bbUpper.setData(preparedBbUpper as any);
    }
    if (bbLowerData && bbLowerData.length > 0) {
      const bbLower = chart.addSeries(LineSeries, { color: 'rgba(124,58,237,0.5)', lineWidth: 1, lineStyle: 2, crosshairMarkerVisible: false });
      const preparedBbLower = prepareData(bbLowerData);
      if (preparedBbLower) bbLower.setData(preparedBbLower as any);
    }

    chart.timeScale().fitContent();

    // Crosshair Tooltip logic
    chart.subscribeCrosshairMove((param) => {
      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > chartContainerRef.current!.clientWidth ||
        param.point.y < 0 ||
        param.point.y > chartContainerRef.current!.clientHeight
      ) {
        setTooltipData(null);
        return;
      }
      
      const priceData: any = param.seriesData.get(candleSeries);
      const volData: any = volumeSeries ? param.seriesData.get(volumeSeries) : null;
      const mData: any = maSeries ? param.seriesData.get(maSeries) : null;
      const m50Data: any = ma50Series ? param.seriesData.get(ma50Series) : null;
      const m200Data: any = ma200Series ? param.seriesData.get(ma200Series) : null;

      if (priceData) {
        setTooltipData({
          time: param.time as string,
          open: priceData.open,
          high: priceData.high,
          low: priceData.low,
          close: priceData.close,
          volume: volData ? volData.value : undefined,
          ma: mData ? mData.value : undefined,
          ma50: m50Data ? m50Data.value : undefined,
          ma200: m200Data ? m200Data.value : undefined,
        });
      }
    });

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, volumeData, maData, ma50Data, ma200Data, bbUpperData, bbLowerData, resolvedTheme, themeColors]);

  return (
    <div style={{ position: 'relative' }}>
      <div ref={chartContainerRef} style={{ width: '100%' }} />
      
      {/* Floating TradingView-style Legend */}
      {tooltipData && (
        <div style={{
          position: 'absolute',
          top: 8,
          left: 8,
          zIndex: 10,
          pointerEvents: 'none',
          fontSize: '0.8rem',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          fontFamily: 'monospace'
        }}>
          <div style={{ fontWeight: 600, color: themeColors.textColor, marginBottom: 2 }}>{symbol}</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <span><span style={{ color: 'var(--color-muted)' }}>O</span> <span style={{ color: tooltipData.open! <= tooltipData.close! ? themeColors.upColor : themeColors.downColor }}>{tooltipData.open?.toFixed(2)}</span></span>
            <span><span style={{ color: 'var(--color-muted)' }}>H</span> <span style={{ color: tooltipData.open! <= tooltipData.close! ? themeColors.upColor : themeColors.downColor }}>{tooltipData.high?.toFixed(2)}</span></span>
            <span><span style={{ color: 'var(--color-muted)' }}>L</span> <span style={{ color: tooltipData.open! <= tooltipData.close! ? themeColors.upColor : themeColors.downColor }}>{tooltipData.low?.toFixed(2)}</span></span>
            <span><span style={{ color: 'var(--color-muted)' }}>C</span> <span style={{ color: tooltipData.open! <= tooltipData.close! ? themeColors.upColor : themeColors.downColor }}>{tooltipData.close?.toFixed(2)}</span></span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {tooltipData.volume !== undefined && (
              <span><span style={{ color: 'var(--color-muted)' }}>Vol</span> <span style={{ color: '#26a69a' }}>{tooltipData.volume.toLocaleString()}</span></span>
            )}
            {tooltipData.ma !== undefined && (
              <span><span style={{ color: 'var(--color-muted)' }}>MA20</span> <span style={{ color: '#00d4ff' }}>{tooltipData.ma.toFixed(2)}</span></span>
            )}
            {tooltipData.ma50 !== undefined && (
              <span><span style={{ color: 'var(--color-muted)' }}>MA50</span> <span style={{ color: '#f59e0b' }}>{tooltipData.ma50.toFixed(2)}</span></span>
            )}
            {tooltipData.ma200 !== undefined && (
              <span><span style={{ color: 'var(--color-muted)' }}>MA200</span> <span style={{ color: '#ef4444' }}>{tooltipData.ma200.toFixed(2)}</span></span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
