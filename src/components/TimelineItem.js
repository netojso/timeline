export default function TimelineItem({ 
  item, 
  dayScale, 
  laneHeight, 
  isEditing, 
  editedName,
  onItemClick,
  onItemHover,
  onItemLeave,
  onNameChange,
  onKeyPress
}) {
  const left = item.startDay * dayScale
  const width = (item.endDay - item.startDay) * dayScale
  const top = 70 + item.lane * laneHeight + 8
  const itemHeight = laneHeight - 16
  
  const isSingleDay = item.startDate.getTime() === item.endDate.getTime()
  const minWidth = isSingleDay ? width : 120

  return (
    <div
      className={`absolute rounded-xl transition-all duration-300 cursor-pointer bg-gradient-to-r ${item.color} group ${
        isEditing ? 'z-30 shadow-xl ring-2 ring-blue-400' : 'hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5'
      }`}
      style={{
        left,
        width: Math.max(isEditing ? width + 200 : width, isEditing ? 300 : minWidth), 
        top,
        height: itemHeight,
      }}
      onClick={() => !isEditing && onItemClick(item)}
      onMouseEnter={() => onItemHover(item.id)}
      onMouseLeave={onItemLeave}
    >
      <div className="p-3 h-full flex items-center justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 rounded-xl"></div>
        
        <div className="min-w-0 flex-1 relative z-10">
          {isEditing ? (
            <input
              type="text"
              value={editedName}
              onChange={onNameChange}
              onKeyDown={onKeyPress}
              className="bg-transparent text-gray-800 text-sm font-medium px-0 py-1 border-0 border-b border-gray-600 focus:border-gray-800 focus:outline-none w-full placeholder-gray-600"
              placeholder="Task name..."
              autoFocus
            />
          ) : (
            <div>
              <div className="text-gray-800 text-sm font-medium truncate mb-1">
                {item.name}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600">
                  {Math.ceil((item.endDay - item.startDay))} days
                </span>
              </div>
            </div>
          )}
        </div>
        
        {!isEditing && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-full group-hover:translate-x-[-200%] transition-transform duration-700"></div>
        )}
      </div>
    </div>
  )
}
