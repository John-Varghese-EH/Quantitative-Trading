import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Play, Trash2, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import api from '../services/api'
import toast from 'react-hot-toast'
import { useAppStore } from '../store/useAppStore'

const MODEL_TYPES = [
  { id: 'linear_regression', name: 'Logistic Regression', desc: 'Fast, interpretable baseline', color: '#00d4ff' },
  { id: 'random_forest', name: 'Random Forest', desc: 'Ensemble of decision trees', color: '#10b981' },
  { id: 'xgboost', name: 'XGBoost', desc: 'Gradient boosting powerhouse', color: '#f59e0b' },
  { id: 'lstm', name: 'LSTM', desc: 'Sequential deep learning', color: '#7c3aed' },
  { id: 'transformer', name: 'Transformer', desc: 'Attention-based architecture', color: '#f97316' },
]

const SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA', 'BTC-USD', 'ETH-USD', 'SPY']

export default function AIPredictionPage() {
  const qc = useQueryClient()
  const { setActiveModelId } = useAppStore()
  const [modelType, setModelType] = useState('random_forest')
  const [symbol, setSymbol] = useState('AAPL')
  const [modelName, setModelName] = useState('')
  const [startDate, setStartDate] = useState('2022-01-01')
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10))
  const [selectedModel, setSelectedModel] = useState<any>(null)

  const { data: models, refetch: refetchModels } = useQuery({
    queryKey: ['ml-models'],
    queryFn: () => api.get('/ml/models').then(r => r.data.models),
    refetchInterval: 5000,
  })

  const trainMutation = useMutation({
    mutationFn: (body: any) => api.post('/ml/train', body),
    onSuccess: (data) => {
      toast.success(`Training started for ${modelType}!`)
      qc.invalidateQueries({ queryKey: ['ml-models'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Training failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/ml/models/${id}`),
    onSuccess: () => { toast.success('Model deleted'); qc.invalidateQueries({ queryKey: ['ml-models'] }) },
  })

  const predictMutation = useMutation({
    mutationFn: (body: any) => api.post('/ml/predict', body),
    onSuccess: (res) => {
      setSelectedModel({ ...selectedModel, prediction: res.data })
      toast.success('Prediction complete!')
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Prediction failed'),
  })

  const handleTrain = () => {
    if (!modelName.trim()) return toast.error('Enter a model name')
    trainMutation.mutate({ name: modelName, model_type: modelType, symbol, start_date: startDate, end_date: endDate })
  }

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'ready') return <CheckCircle size={16} color="var(--color-success)" />
    if (status === 'training') return <Clock size={16} color="var(--color-warning)" />
    return <XCircle size={16} color="var(--color-danger)" />
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 6px', fontSize: '1.8rem', fontWeight: 800 }}>
          AI <span className="gradient-text">Prediction</span>
        </h1>
        <p style={{ color: 'var(--color-muted)', margin: 0 }}>Train ML models to predict market direction</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 20 }}>
        {/* Train Panel */}
        <div>
          <div className="glass" style={{ padding: 24, marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Brain size={20} color="var(--color-primary)" /> Train New Model
            </h3>

            {/* Model Type Selector */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--color-muted)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Model Architecture</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {MODEL_TYPES.map(m => (
                  <button key={m.id} onClick={() => setModelType(m.id)} style={{
                    padding: '12px 16px', borderRadius: 10, border: `1px solid ${modelType === m.id ? m.color : 'var(--color-border)'}`,
                    background: modelType === m.id ? `${m.color}15` : 'transparent',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: modelType === m.id ? m.color : 'var(--color-text)' }}>{m.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{m.desc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Config */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--color-muted)', display: 'block', marginBottom: 5 }}>Model Name</label>
                <input className="input-field" value={modelName} onChange={e => setModelName(e.target.value)} placeholder="My AAPL Model" />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--color-muted)', display: 'block', marginBottom: 5 }}>Symbol</label>
                <select className="input-field" value={symbol} onChange={e => setSymbol(e.target.value)}>
                  {SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--color-muted)', display: 'block', marginBottom: 5 }}>Start Date</label>
                  <input type="date" className="input-field" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--color-muted)', display: 'block', marginBottom: 5 }}>End Date</label>
                  <input type="date" className="input-field" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
              </div>
              <motion.button className="btn-primary" onClick={handleTrain}
                disabled={trainMutation.isPending} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                style={{ padding: '13px', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: trainMutation.isPending ? 0.7 : 1 }}>
                <Play size={16} /> {trainMutation.isPending ? 'Starting…' : 'Train Model'}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Models List + Results */}
        <div>
          <div className="glass" style={{ padding: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontWeight: 700 }}>Your Models</h3>
              <button onClick={() => refetchModels()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)' }}>
                <RefreshCw size={16} />
              </button>
            </div>
            {(!models || models.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-muted)' }}>
                <Brain size={48} opacity={0.3} style={{ margin: '0 auto 12px', display: 'block' }} />
                <p>No models trained yet. Train your first model!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {models.map((m: any) => (
                  <motion.div key={m.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    className="glass-light" style={{ padding: 14, cursor: 'pointer', border: selectedModel?.id === m.id ? '1px solid var(--color-primary)' : '1px solid transparent' }}
                    onClick={() => setSelectedModel(m)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <StatusIcon status={m.status} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{m.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{m.model_type} · {m.symbol}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {m.accuracy && (
                          <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>{(m.accuracy * 100).toFixed(1)}%</span>
                        )}
                        {m.status === 'training' && (
                          <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>Training…</span>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(m.id) }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    {m.status === 'ready' && m.metrics && (
                      <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                        {[
                          { l: 'Accuracy', v: `${(m.metrics.accuracy * 100).toFixed(1)}%` },
                          { l: 'Precision', v: `${(m.metrics.precision * 100).toFixed(1)}%` },
                          { l: 'ROC-AUC', v: m.metrics.roc_auc?.toFixed(3) },
                          { l: 'F1', v: m.metrics.f1_score?.toFixed(3) },
                        ].map(item => (
                          <div key={item.l}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>{item.l}</div>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-primary)' }}>{item.v}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Predict + Results */}
          <AnimatePresence>
            {selectedModel?.status === 'ready' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="glass" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontWeight: 700 }}>Run Prediction — {selectedModel.name}</h3>
                  <motion.button className="btn-primary" onClick={() => predictMutation.mutate({ model_id: selectedModel.id, symbol: selectedModel.symbol })}
                    disabled={predictMutation.isPending} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    style={{ padding: '9px 18px', fontSize: '0.88rem', opacity: predictMutation.isPending ? 0.7 : 1 }}>
                    {predictMutation.isPending ? 'Predicting…' : '⚡ Predict'}
                  </motion.button>
                </div>

                {selectedModel.prediction && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                      <div className="glass-light" style={{ padding: 20, textAlign: 'center' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: 8 }}>Prediction</div>
                        <div style={{
                          fontSize: '2rem', fontWeight: 900,
                          color: selectedModel.prediction.prediction.direction === 'BUY' ? 'var(--color-success)' : 'var(--color-danger)',
                        }}>
                          {selectedModel.prediction.prediction.direction === 'BUY' ? '▲ BUY' : '▼ SELL'}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginTop: 6 }}>
                          Confidence: {(selectedModel.prediction.prediction.confidence * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="glass-light" style={{ padding: 20, textAlign: 'center' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: 8 }}>Current Price</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>${selectedModel.prediction.current_price}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: 6 }}>
                          Model accuracy: {(selectedModel.prediction.model_accuracy * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    {/* Feature Importance Bar Chart */}
                    {selectedModel.prediction.prediction.feature_importance?.length > 0 && (
                      <>
                        <h4 style={{ margin: '0 0 12px', fontWeight: 700, fontSize: '0.9rem' }}>Feature Importance (SHAP)</h4>
                        <ResponsiveContainer width="100%" height={180}>
                          <BarChart data={selectedModel.prediction.prediction.feature_importance.slice(0, 8)} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                            <XAxis type="number" tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} axisLine={false} />
                            <YAxis type="category" dataKey="feature" tick={{ fontSize: 10, fill: '#e2e8f0' }} tickLine={false} axisLine={false} width={120} />
                            <Tooltip contentStyle={{ background: '#0d1429', border: '1px solid rgba(99,179,237,0.2)', borderRadius: 6, fontSize: '0.75rem' }} />
                            <Bar dataKey="importance" radius={[0,4,4,0]}>
                              {selectedModel.prediction.prediction.feature_importance.slice(0, 8).map((_: any, i: number) => (
                                <Cell key={i} fill={`hsl(${195 - i * 15}, 80%, ${60 - i * 3}%)`} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
