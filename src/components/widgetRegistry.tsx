import type { WidgetId } from '../types'
import { DailyOverviewWidget } from './widgets/DailyOverview'
import { WeatherWidget } from './widgets/WeatherWidget'
import { AirportWidget } from './widgets/AirportWidget'
import { CalendarWidget } from './widgets/CalendarWidget'
import { TasksWidget } from './widgets/TasksWidget'
import { FlightProgressWidget } from './widgets/FlightProgressWidget'
import { SchoolWidget } from './widgets/SchoolWidget'
import { QuickLaunchWidget } from './widgets/QuickLaunchWidget'

export const WIDGET_COMPONENTS: Record<WidgetId, React.ComponentType<{ dragHandleProps?: any; isDragging?: boolean }>> = {
  daily: DailyOverviewWidget,
  weather: WeatherWidget,
  airport: AirportWidget,
  calendar: CalendarWidget,
  tasks: TasksWidget,
  flight: FlightProgressWidget,
  school: SchoolWidget,
  launch: QuickLaunchWidget,
}
