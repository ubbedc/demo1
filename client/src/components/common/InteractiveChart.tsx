import React, { useEffect, useRef, useState } from 'react';
import { 
  createChart, 
  IChartApi, 
  ISeriesApi, 
  CandlestickSeries, 
  AreaSeries, 
  HistogramSeries, 
  ColorType,
  Time
} from 'lightweight-charts';
import { MarketQuote } from '../../types';
import { realTimeMarket, Timeframe, CandleBar } from '../../services/realTimeMarket';
import { Activity, CandlestickChart, LineChart } from 'lucide-react';

interface InteractiveChartProps {
  quote: MarketQuote | null;
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({ quote }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<ISeriesApi<'Candlestick'> | ISeriesApi<'Area'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  const [timeframe, setTimeframe] = useState<Timeframe>('1m');
  const [chartType, setChartType] = useState<'candlestick' | 'area'>('candlestick');
  const [activeOhlc, setActiveOhlc] = useState<{ open: number; high: number; low: number; close: number; volume: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const symbol = quote?.symbol || 'BTC/USD';
  const isCrypto = symbol.includes('BTC') || symbol.includes('ETH') || symbol.includes('SOL');

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Clean up previous chart if any
    if (chartRef.current) {
      try {
        chartRef.current.remove();
      } catch (_) {}
      chartRef.current = null;
    }

    const container = chartContainerRef.current;
    const initialWidth = container.clientWidth || 650;
    const initialHeight = container.clientHeight || 420;

    try {
      // 1. Initialize TradingView Lightweight Chart
      const chart = createChart(container, {
        width: initialWidth,
        height: initialHeight,
        autoSize: true,
        layout: {
          background: { type: ColorType.Solid, color: '#0b1120' },
          textColor: '#94a3b8',
          fontSize: 11,
          fontFamily: 'JetBrains Mono, monospace',
        },
        grid: {
          vertLines: { color: 'rgba(30, 41, 59, 0.4)' },
          horzLines: { color: 'rgba(30, 41, 59, 0.4)' },
        },
        crosshair: {
          mode: 1,
          vertLine: {
            color: '#06b6d4',
            width: 1,
            style: 3,
            labelBackgroundColor: '#0891b2',
          },
          horzLine: {
            color: '#06b6d4',
            width: 1,
            style: 3,
            labelBackgroundColor: '#0891b2',
          },
        },
        rightPriceScale: {
          borderColor: '#1e293b',
          scaleMargins: {
            top: 0.08,
            bottom: 0.22,
          },
        },
        timeScale: {
          borderColor: '#1e293b',
          timeVisible: true,
          secondsVisible: false,
        },
      });

      chartRef.current = chart;

      // 2. Add Volume Histogram Series with safe named priceScaleId
      const volumeSeries = chart.addSeries(HistogramSeries, {
        color: 'rgba(6, 182, 212, 0.25)',
        priceFormat: { type: 'volume' },
        priceScaleId: 'volume_scale',
      });

      chart.priceScale('volume_scale').applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });
      volumeSeriesRef.current = volumeSeries;

      // 3. Add Main Price Series (Candlestick or Area)
      if (chartType === 'candlestick') {
        const candleSeries = chart.addSeries(CandlestickSeries, {
          upColor: '#10b981',
          downColor: '#f43f5e',
          borderVisible: false,
          wickUpColor: '#10b981',
          wickDownColor: '#f43f5e',
        });
        mainSeriesRef.current = candleSeries;
      } else {
        const areaSeries = chart.addSeries(AreaSeries, {
          topColor: 'rgba(6, 182, 212, 0.4)',
          bottomColor: 'rgba(6, 182, 212, 0.0)',
          lineColor: '#06b6d4',
          lineWidth: 2,
        });
        mainSeriesRef.current = areaSeries;
      }

      // 4. Handle Crosshair Move for OHLC readout
      chart.subscribeCrosshairMove((param) => {
        if (param.time && mainSeriesRef.current) {
          const data: any = param.seriesData.get(mainSeriesRef.current);
          const volData: any = volumeSeriesRef.current ? param.seriesData.get(volumeSeriesRef.current) : null;
          if (data) {
            setActiveOhlc({
              open: data.open ?? data.value ?? 0,
              high: data.high ?? data.value ?? 0,
              low: data.low ?? data.value ?? 0,
              close: data.close ?? data.value ?? 0,
              volume: volData?.value || 0,
            });
          }
        }
      });
    } catch (err) {
      console.error('Error initializing TradingView chart:', err);
    }

    return () => {
      realTimeMarket.unsubscribe();
      if (chartRef.current) {
        try {
          chartRef.current.remove();
        } catch (_) {}
        chartRef.current = null;
      }
    };
  }, [chartType]);

  // 5. Load Data & Stream Real-Time WebSocket Ticks
  useEffect(() => {
    let isSubscribed = true;
    setIsLoading(true);

    const loadMarketData = async () => {
      try {
        const historicalBars = await realTimeMarket.fetchHistoricalCandles(symbol, timeframe, 150);
        if (!isSubscribed || !mainSeriesRef.current || !volumeSeriesRef.current) return;

        if (chartType === 'candlestick') {
          const candleData = historicalBars.map((b) => ({
            time: b.time as Time,
            open: b.open,
            high: b.high,
            low: b.low,
            close: b.close,
          }));
          (mainSeriesRef.current as ISeriesApi<'Candlestick'>).setData(candleData);
        } else {
          const areaData = historicalBars.map((b) => ({
            time: b.time as Time,
            value: b.close,
          }));
          (mainSeriesRef.current as ISeriesApi<'Area'>).setData(areaData);
        }

        const volumeData = historicalBars.map((b) => ({
          time: b.time as Time,
          value: b.volume,
          color: b.close >= b.open ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)',
        }));
        volumeSeriesRef.current.setData(volumeData);

        chartRef.current?.priceScale('right').applyOptions({ autoScale: true });
        chartRef.current?.timeScale().fitContent();
        setIsLoading(false);

        // Subscribe to Real-Time WebSocket stream
        realTimeMarket.subscribeRealTime(symbol, timeframe, (liveBar: CandleBar) => {
          if (!mainSeriesRef.current || !volumeSeriesRef.current) return;

          try {
            if (chartType === 'candlestick') {
              (mainSeriesRef.current as ISeriesApi<'Candlestick'>).update({
                time: liveBar.time as Time,
                open: liveBar.open,
                high: liveBar.high,
                low: liveBar.low,
                close: liveBar.close,
              });
            } else {
              (mainSeriesRef.current as ISeriesApi<'Area'>).update({
                time: liveBar.time as Time,
                value: liveBar.close,
              });
            }

            volumeSeriesRef.current.update({
              time: liveBar.time as Time,
              value: liveBar.volume,
              color: liveBar.close >= liveBar.open ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)',
            });
          } catch (_) {}
        });
      } catch (err) {
        console.error('Error loading chart data:', err);
        setIsLoading(false);
      }
    };

    loadMarketData();

    return () => {
      isSubscribed = false;
      realTimeMarket.unsubscribe();
    };
  }, [symbol, timeframe, chartType]);

  return (
    <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 flex flex-col h-full shadow-lg relative min-h-[440px]">
      {/* Top Toolbar Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800 font-mono text-xs">
        {/* Left: Asset Title & Live Stream Badge */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-baseline gap-1.5">
            <span className="font-black text-white text-sm">{symbol}</span>
            <span className="text-[10px] text-slate-500">TradingView™ Engine</span>
          </div>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            {isCrypto ? 'BINANCE WEBSOCKET LIVE' : 'LIVE TICK STREAM'}
          </div>
        </div>

        {/* Right: Timeframe & Chart Style Switchers */}
        <div className="flex items-center gap-2">
          {/* Timeframe Chips */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            {(['1m', '5m', '15m', '1h', '1d'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  timeframe === tf
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Chart Style Switcher */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setChartType('candlestick')}
              title="Candele Giapponesi"
              className={`p-1.5 rounded transition-all cursor-pointer ${
                chartType === 'candlestick' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              <CandlestickChart className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setChartType('area')}
              title="Grafico ad Area"
              className={`p-1.5 rounded transition-all cursor-pointer ${
                chartType === 'area' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating OHLC Readout Bar */}
      {activeOhlc && (
        <div className="px-1 py-1 font-mono text-[10px] text-slate-400 flex flex-wrap gap-3 border-b border-slate-800/40">
          <span>O: <strong className="text-white">${activeOhlc.open.toLocaleString()}</strong></span>
          <span>H: <strong className="text-emerald-400">${activeOhlc.high.toLocaleString()}</strong></span>
          <span>L: <strong className="text-rose-400">${activeOhlc.low.toLocaleString()}</strong></span>
          <span>C: <strong className="text-white">${activeOhlc.close.toLocaleString()}</strong></span>
          <span>Vol: <strong className="text-cyan-400">{activeOhlc.volume.toLocaleString()}</strong></span>
        </div>
      )}

      {/* Chart Canvas Host */}
      <div className="flex-1 w-full relative h-[380px] min-h-[380px] mt-2">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs font-mono text-xs text-cyan-400 gap-2">
            <Activity className="w-4 h-4 animate-spin" />
            Connessione feed live in corso...
          </div>
        )}
        <div ref={chartContainerRef} className="w-full h-full min-h-[380px]" />
      </div>
    </div>
  );
};
