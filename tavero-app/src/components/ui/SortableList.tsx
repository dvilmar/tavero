import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { View, ViewStyle } from 'react-native'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'

type ItemLayout = {
  y: number
  height: number
  key: string
}

type SortableListProps<T> = {
  data: T[]
  keyExtractor: (item: T) => string
  renderItem: (item: T, dragIndex: number, dragHandle: React.ReactNode) => React.ReactNode
  onDragEnd: (data: T[]) => void
  contentContainerStyle?: ViewStyle
}

export function SortableList<T>({
  data,
  keyExtractor,
  renderItem,
  onDragEnd,
  contentContainerStyle,
}: SortableListProps<T>) {
  const [orderedData, setOrderedData] = useState<T[]>(data)
  const [dragKey, setDragKey] = useState<string | null>(null)
  const [dragIndex, setDragIndex] = useState<number>(-1)
  const [dragStartY, setDragStartY] = useState<number>(0)

  const itemLayoutsRef = useRef<Map<string, ItemLayout>>(new Map())
  const orderedDataRef = useRef<T[]>(data)
  const onDragEndRef = useRef(onDragEnd)
  const currentDragRef = useRef<{ key: string; index: number } | null>(null)

  const translateY = useSharedValue(0)
  const floatingOpacity = useSharedValue(0)
  const floatingScale = useSharedValue(1)

  // Keep refs in sync
  useEffect(() => {
    orderedDataRef.current = orderedData
  }, [orderedData])

  useEffect(() => {
    onDragEndRef.current = onDragEnd
  }, [onDragEnd])

  // Sync external data when not dragging
  useEffect(() => {
    if (!dragKey) {
      setOrderedData(data)
    }
  }, [data, dragKey])

  const createDragGesture = useCallback(
    (key: string, index: number) => {
      return Gesture.Pan()
        .onStart(() => {
          const layout = itemLayoutsRef.current.get(key)
          if (!layout) return

          currentDragRef.current = { key, index }
          runOnJS(setDragKey)(key)
          runOnJS(setDragIndex)(index)
          runOnJS(setDragStartY)(layout.y)
          translateY.value = 0
          floatingOpacity.value = 1
          floatingScale.value = 1.02
        })
        .onUpdate((e) => {
          const dragState = currentDragRef.current
          if (!dragState) return

          translateY.value = e.translationY

          const draggedLayout = itemLayoutsRef.current.get(dragState.key)
          if (!draggedLayout) return

          const draggedCenter = draggedLayout.y + draggedLayout.height / 2 + e.translationY

          // Find closest item
          let closestIndex = -1
          let closestDist = Infinity

          itemLayoutsRef.current.forEach((layout) => {
            if (layout.key === dragState.key) return

            const center = layout.y + layout.height / 2
            const dist = Math.abs(draggedCenter - center)

            if (dist < layout.height * 0.4 && dist < closestDist) {
              closestDist = dist
              closestIndex = orderedDataRef.current.findIndex(
                (item) => keyExtractor(item) === layout.key
              )
            }
          })

          // Reorder if needed
          if (closestIndex !== -1 && closestIndex !== dragState.index) {
            runOnJS(setOrderedData)((prev) => {
              const newData = [...prev]
              const currentIdx = newData.findIndex(
                (item) => keyExtractor(item) === dragState.key
              )
              if (currentIdx === -1 || currentIdx === closestIndex) return prev

              const [moved] = newData.splice(currentIdx, 1)
              newData.splice(closestIndex, 0, moved)
              return newData
            })
            dragState.index = closestIndex
            runOnJS(setDragIndex)(closestIndex)
          }
        })
        .onEnd(() => {
          const dragState = currentDragRef.current
          if (!dragState) return

          currentDragRef.current = null
          const finalOrder = [...orderedDataRef.current]

          translateY.value = 0
          floatingOpacity.value = 0
          floatingScale.value = 1

          setTimeout(() => {
            runOnJS(setDragKey)(null)
            runOnJS(setDragIndex)(-1)
            runOnJS(onDragEndRef.current)(finalOrder)
          }, 150)
        })
    },
    [keyExtractor, translateY, floatingOpacity, floatingScale]
  )

  const createDragHandle = useCallback(
    (key: string, index: number) => {
      const gesture = createDragGesture(key, index)

      return (
        <GestureDetector gesture={gesture}>
          <View
            style={{
              width: 48,
              height: 48,
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: dragKey === key ? 1000 : 1,
            }}
          >
            {/* Grip icon */}
            <View style={{ width: 16, gap: 3 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#A1A1AA' }} />
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#A1A1AA' }} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#A1A1AA' }} />
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#A1A1AA' }} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#A1A1AA' }} />
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#A1A1AA' }} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#A1A1AA' }} />
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#A1A1AA' }} />
              </View>
            </View>
          </View>
        </GestureDetector>
      )
    },
    [createDragGesture, dragKey]
  )

  const renderItemWrapper = useCallback(
    (item: T, index: number) => {
      const key = keyExtractor(item)
      const isDragged = dragKey === key

      const dragHandle = createDragHandle(key, index)

      return (
        <View
          key={key}
          onLayout={(e) => {
            const { y, height } = e.nativeEvent.layout
            itemLayoutsRef.current.set(key, { y, height, key })
          }}
          style={{ opacity: isDragged ? 0.25 : 1 }}
        >
          {renderItem(item, index, dragHandle)}
        </View>
      )
    },
    [dragKey, keyExtractor, renderItem, createDragHandle]
  )

  const floatingStyle = useAnimatedStyle(() => {
    if (floatingOpacity.value === 0) return { opacity: 0, zIndex: -1 }
    return {
      opacity: floatingOpacity.value,
      zIndex: 999,
      elevation: 999,
      transform: [
        { translateY: translateY.value },
        { scale: floatingScale.value },
      ],
    }
  })

  return (
    <View>
      <View style={contentContainerStyle}>
        {orderedData.map((item, index) => renderItemWrapper(item, index))}
      </View>

      {/* Floating dragged item */}
      {dragKey && dragIndex >= 0 && orderedData[dragIndex] && (
        <Animated.View
          style={[
            floatingStyle,
            {
              position: 'absolute',
              left: 0,
              right: 0,
              top: dragStartY,
              paddingHorizontal: 20,
              pointerEvents: 'none',
            },
          ]}
        >
          <View style={{ borderRadius: 16, overflow: 'hidden', padding: 2 }}>
            {renderItem(orderedData[dragIndex], dragIndex, <View style={{ width: 48, height: 48 }} />)}
          </View>
        </Animated.View>
      )}
    </View>
  )
}
