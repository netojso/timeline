import React, { useMemo, useState } from 'react'
import assignLanes from '../assignLanes'
import TimelineItem from './TimelineItem'
import {colors} from '../constants/colors'

export default function Timeline({ items }) {
  const [editingItem, setEditingItem] = useState(null)
  const [editedName, setEditedName] = useState("")
  const [viewScale, setViewScale] = useState("month")
  const [hoveredItem, setHoveredItem] = useState(null)

  const { arrangedItems, startDate, endDate, totalDays, laneCount } = useMemo(() => {
    const parsedItems = items.map(item => ({
      ...item,
      startDate: new Date(item.start + 'T00:00:00Z'),
      endDate: new Date(item.end + 'T00:00:00Z'),
    }))

    const allDates = parsedItems.flatMap(item => [item.startDate, item.endDate])
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())))
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())))
    
    const lanes = assignLanes(items)
    
    const arranged = []
    let colorIndex = 0
    
    lanes.forEach((lane, laneIndex) => {
      lane.forEach(item => {
        const startDate = new Date(item.start + 'T00:00:00Z')
        const endDate = new Date(item.end + 'T00:00:00Z')
        const startDay = Math.floor((startDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))
        const endDay = Math.floor((endDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))
        
        const widthEndDay = endDay + 1
        
        arranged.push({
          ...item,
          startDate,
          endDate,
          startDay,
          endDay: widthEndDay,
          lane: laneIndex,
          color: colors[colorIndex % colors.length]
        })
        
        colorIndex++
      })
    })
    
    const totalDays = Math.floor((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    
    return {
      arrangedItems: arranged,
      startDate: minDate,
      endDate: maxDate,
      totalDays,
      laneCount: lanes.length
    }
  }, [items])

  const getScaleWidth = () => {
    switch (viewScale) {
      case "day": return 5000 / totalDays
      case "month": 
      default: return 1200 / totalDays
    }
  }

  const dayScale = getScaleWidth()
  const laneHeight = 90
  const timelineHeight = laneCount * laneHeight + 80

  const timeMarkers = []
  
  if (viewScale === "day") {
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
      timeMarkers.push({
        date: new Date(date),
        dayOffset: i,
        label: date.getUTCDate().toString(),
        sublabel: date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }),
        type: 'day'
      })
    }
  } else {
    const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
    
    while (currentDate <= endDate) {
      const dayOffset = Math.max(0, Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
      timeMarkers.push({
        date: new Date(currentDate),
        dayOffset,
        label: currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        type: 'month'
      })
      currentDate.setMonth(currentDate.getMonth() + 1)
    }
  }

  const handleItemClick = (item) => {
    setEditingItem(item.id)
    setEditedName(item.name)
  }

  const handleNameChange = (e) => {
    setEditedName(e.target.value)
  }

  const handleSave = () => {
    console.log(`Updating item ${editingItem} to: ${editedName}`)
    setEditingItem(null)
    setEditedName("")
  }

  const handleCancel = () => {
    setEditingItem(null)
    setEditedName("")
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  const handleScaleChange = (scale) => {
    setViewScale(scale)
  }

  const handleItemHover = (itemId) => {
    setHoveredItem(itemId)
  }

  const handleItemLeave = () => {
    setHoveredItem(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="text-base font-semibold text-gray-700">View:</span>
            <div className="flex bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => handleScaleChange("month")}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  viewScale === "month" 
                    ? "bg-blue-500 text-white" 
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-300"
                }`}
              >
                Month
              </button>
              <button
                onClick={() => handleScaleChange("day")}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  viewScale === "day" 
                    ? "bg-blue-500 text-white" 
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-300"
                }`}
              >
                Day
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-300 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <div 
            className="relative"
            style={{ 
              width: Math.max(totalDays * dayScale + 100, 1000),
              height: timelineHeight 
            }}
          >
          {editingItem && (
            <div 
              className="absolute bg-white/80 backdrop-blur-sm z-20 rounded-2xl"
              style={{
                top: 0,
                left: 0,
                width: Math.max(totalDays * dayScale + 100, 1000),
                height: timelineHeight
              }}
              onClick={handleCancel}
            />
          )}
          
          <div className="sticky top-0 z-10 h-16 bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b border-gray-300">
            {timeMarkers.map((marker, index) => (
              <div
                key={index}
                className="absolute top-0 bottom-0"
                style={{ left: marker.dayOffset * dayScale }}
              >
                <div className="h-full w-px bg-gray-300"></div>
                <div className={`absolute top-2 px-2 py-1 left-1`}>
                  <span className="text-xs font-semibold text-gray-700">
                    {marker.label}
                  </span>
                  {marker.sublabel && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      {marker.sublabel}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {arrangedItems.map(item => (
            <TimelineItem
              key={item.id}
              item={item}
              dayScale={dayScale}
              laneHeight={laneHeight}
              isEditing={editingItem === item.id}
              editedName={editedName}
              onItemClick={handleItemClick}
              onItemHover={handleItemHover}
              onItemLeave={handleItemLeave}
              onNameChange={handleNameChange}
              onKeyPress={handleKeyPress}
            />
          ))}

          {hoveredItem !== null && (() => {
            const item = arrangedItems.find(item => item.id === hoveredItem)
            if (!item) return null
            
            return (
              <div
                key={`highlight-${item.id}`}
                className="absolute top-16 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-blue-600 to-transparent opacity-80 z-20 pointer-events-none"
                style={{
                  left: item.startDay * dayScale,
                }}
              >
                <div className="absolute inset-0 w-1 bg-blue-500 blur-sm opacity-60 -left-0.5"></div>
                <div className="absolute -top-2 -left-8 bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                  {item.startDate.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    timeZone: 'UTC'
                  })}
                </div>
              </div>
            )
          })()}

          {Array.from({ length: laneCount }).map((_, index) => (
            <div key={`lane-${index}`}>
              <div
                className="absolute left-0 right-0 border-t border-gray-200"
                style={{ top: 64 + index * laneHeight }}
              />
            </div>
          ))}
          
          <div
            className="absolute left-0 right-0 border-t border-gray-300"
            style={{ top: 64 + laneCount * laneHeight }}
          />
          </div>
        </div>
      </div>
    </div>
  )
}
