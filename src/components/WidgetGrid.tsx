import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext, useSortable, rectSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useSettings } from '../lib/settings'
import { WIDGET_COMPONENTS } from './widgetRegistry'

function SortableItem({ id }: { id: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const Component = WIDGET_COMPONENTS[id as keyof typeof WIDGET_COMPONENTS]
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  if (!Component) return null
  const wide = id === 'daily' || id === 'launch'
  return (
    <div ref={setNodeRef} style={style} className={wide ? 'col-span-2 sm:col-span-4' : 'col-span-1 sm:col-span-2'}>
      <Component dragHandleProps={{ ...attributes, ...listeners }} isDragging={isDragging} />
    </div>
  )
}

export function WidgetGrid() {
  const { settings, setSettings } = useSettings()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const enabledOrder = settings.layoutOrder.filter(
    (id) => settings.widgets.find((w) => w.id === id)?.enabled
  )

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setSettings((s) => {
      const oldIndex = s.layoutOrder.indexOf(active.id as any)
      const newIndex = s.layoutOrder.indexOf(over.id as any)
      return { ...s, layoutOrder: arrayMove(s.layoutOrder, oldIndex, newIndex) }
    })
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={enabledOrder} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {enabledOrder.map((id) => (
            <SortableItem key={id} id={id} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
