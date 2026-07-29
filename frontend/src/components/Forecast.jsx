import { describe } from '../weatherCodes'

export default function Forecast({ data }) {
  const d = data.daily
  if (!d) return null

  const days = d.time.map((t, i) => ({
    date: t,
    code: d.weather_code[i],
    max: d.temperature_2m_max[i],
    min: d.temperature_2m_min[i],
    pop: d.precipitation_probability_max?.[i],
  }))

  return (
    <div className="forecast">
      <h3 className="forecast__title">7-day forecast</h3>
      <div className="forecast__row">
        {days.map((day) => {
          const w = describe(day.code)
          const name = new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short' })
          return (
            <div className="fday" key={day.date}>
              <span className="fday__name">{name}</span>
              <span className="fday__icon">{w.icon}</span>
              <span className="fday__temps">
                <b>{Math.round(day.max)}°</b>
                <i>{Math.round(day.min)}°</i>
              </span>
              {day.pop != null && <span className="fday__pop">💧 {day.pop}%</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
