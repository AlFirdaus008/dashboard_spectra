'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { colors, code } from '@/lib/data/client';
import { useTheme } from '@/components/theme/ThemeProvider';

export default function Distribution({
  counts,
  onTier,
  active,
}: {
  counts: Record<string, number>;
  onTier: (n: number) => void;
  active: string;
}) {
  const { isDark } = useTheme();
  const data = [99, 1, 2, 3, 4, 5].map(level => ({
    level,
    name: code(level),
    count: counts[level] ?? 0,
  }));

  return (
    <section className="distribution" id="insights">
      <div>
        <div className="section-kicker">RINGKASAN SCREENING</div>
        <h2>Distribusi Rekomendasi</h2>
        <p>Skala hitungan linear · sesuai filter dan cakupan data saat ini</p>
      </div>
      <div className="chart">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 25, right: 15, bottom: 0, left: -10 }}>
            <XAxis
              dataKey="name"
              stroke={isDark ? '#465f70' : '#b0c2cc'}
              tick={{ fill: isDark ? '#a0b6c6' : '#587080', fontSize: 12 }}
            />
            <YAxis
              allowDecimals={false}
              stroke={isDark ? '#465f70' : '#b0c2cc'}
              tick={{ fill: isDark ? '#a0b6c6' : '#587080', fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: isDark ? 'rgba(255, 255, 255, 0.06)' : '#eef3f5' }}
              contentStyle={{
                backgroundColor: isDark ? '#14232c' : '#ffffff',
                borderColor: isDark ? '#283e4c' : '#dbe4e9',
                color: isDark ? '#e6edf3' : '#163246',
                borderRadius: '8px',
                boxShadow: isDark ? '0 6px 18px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.08)',
              }}
              itemStyle={{ color: isDark ? '#e6edf3' : '#163246' }}
            />
            <Bar
              dataKey="count"
              name="Grid"
              onClick={(_, index) => onTier(data[index].level)}
              radius={[5, 5, 0, 0]}
              cursor="pointer"
            >
              <LabelList
                dataKey="count"
                position="top"
                fill={isDark ? '#cbd9e4' : '#456172'}
                fontSize={12}
                offset={6}
              />
              {data.map(d => (
                <Cell
                  key={d.level}
                  fill={colors[d.level]}
                  opacity={active && active !== String(d.level) ? 0.35 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-buttons">
        {data.map(d => (
          <button
            key={d.level}
            aria-pressed={active === String(d.level)}
            onClick={() => onTier(d.level)}
          >
            {d.name} <strong>{d.count.toLocaleString()}</strong>
          </button>
        ))}
      </div>
      <p className="hint">
        Pilih satu tingkatan untuk memfilter; pilih lagi untuk membatalkan. Gunakan "Hanya Target" di atas peta untuk
        membandingkan R1–R5 tanpa populasi referensi yang lebih besar.
      </p>
    </section>
  );
}
