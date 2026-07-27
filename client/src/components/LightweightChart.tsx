"use client";
import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, ColorType, CandlestickData, CandlestickSeries, HistogramSeries, LineSeries } from 'lightweight-charts';
import { useTheme } from 'next-themes';

interface ChartProps {
  data: CandlestickData[];
  volumeData?: { time: string; value: number; color: string }[];
  maData?: { time: string; value: number }[];
  rsiData?: { time: string; value: number }[];
  colors?: {
    backgroundColor?: string;
    lineColor?: string;
    textColor?: string;
    areaTopColor?: string;
    areaBottomColor?: string;
  };
}

export const LightweightChart: React.FC<ChartProps> = ({
  data,
  volumeData,
  maData,
  rsiData,
  colors: customColors,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const { resolvedTheme } = useTheme();

  // Define theme colors
  const themeColors = {
    backgroundColor: resolvedTheme === 'dark' ? 'transparent' : 'transparent',
    textColor: resolvedTheme === 'dark' ? '#94a3b8' : '#64748b',
    gridColor: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    upColor: '#10b981',
    downColor: '#ef4444',
  };

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
        mode: 1, // CrosshairMode.Normal
      },
      rightPriceScale: {
        borderColor: themeColors.gridColor,
      }
    });
    
    chartRef.current = chart;

    // Add Candlestick Series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: themeColors.upColor,
      downColor: themeColors.downColor,
      borderVisible: false,
      wickUpColor: themeColors.upColor,
      wickDownColor: themeColors.downColor,
    });
    
    if (data && data.length > 0) {
      candleSeries.setData(data as any);
    }

    // Add Volume Series
    if (volumeData && volumeData.length > 0) {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        color: '#26a69a',
        priceFormat: { type: 'volume' },
        priceScaleId: '', // set as an overlay
      });
      chart.priceScale('').applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 }, // Volume at the bottom 20%
      });
      volumeSeries.setData(volumeData as any);
    }

    // Add Moving Average
    if (maData && maData.length > 0) {
      const maSeries = chart.addSeries(LineSeries, {
        color: '#00d4ff',
        lineWidth: 2,
        crosshairMarkerVisible: false,
      });
      maSeries.setData(maData as any);
    }

    chart.timeScale().fitContent();

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
  }, [data, volumeData, maData, resolvedTheme]);

  return <div ref={chartContainerRef} style={{ width: '100%' }} />;
};
