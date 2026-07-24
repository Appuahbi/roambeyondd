import { CalendarDays } from 'lucide-react'

export default function ItineraryTimeline({ itinerary = [] }) {
  if (!itinerary.length) return null

  return (
    <div className="space-y-0">
      {itinerary.map((day, i) => (
        <div key={i} className="relative flex gap-4">
          {/* Timeline line */}
          <div className="flex flex-col items-center">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
              {day.day || i + 1}
            </div>
            {i < itinerary.length - 1 && (
              <div className="w-0.5 flex-1 bg-border" />
            )}
          </div>

          <div className="pb-6 pt-1">
            <h4 className="mb-1 font-display text-base font-semibold text-ink">
              {day.title}
            </h4>
            <p className="text-sm leading-relaxed text-muted">
              {day.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
